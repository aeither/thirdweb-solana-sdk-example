import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { ThirdwebSDK } from "@thirdweb-dev/solana";
import { readFileSync } from "fs";
import { initWallet } from "./initialize";

const main = async () => {
  // 1 Init
  const connection = new anchor.web3.Connection(
    "https://metaplex.devnet.rpcpool.com/"
  );
  const { anchorWallet } = await initWallet(connection);
  const PROGRAM_ID = new PublicKey(
    "AiYAdQktYsaiViiwAGwfn3Xhj89TRhAifeCEFZHjTdgc"
  );

  // 2 thirdweb
  const sdk = ThirdwebSDK.fromNetwork("devnet");
  sdk.wallet.connect(anchorWallet);
  // sdk.wallet.disconnect();
  console.log("wallet address: ", sdk.wallet.getAddress());

  // 3 get program and accounts
  const idl = JSON.parse(readFileSync("./scripts/fizz-idl.json", "utf-8"));
  const program = await sdk.getProgramWithIdl(PROGRAM_ID.toString(), idl);

  const [fizzAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("fizzbuzz"), anchorWallet.payer.publicKey.toBuffer()],
    PROGRAM_ID
  );
  console.log("fizzAccount: ", fizzAccount.toBase58());

  // 4 call program
  const hash = await program.call("doFizzbuzz", {
    data: [new anchor.BN(23)],
    accounts: {
      fizzbuzz: fizzAccount.toBase58(),
    },
    signers: [anchorWallet.payer],
  });
  console.log(`https://solscan.io/tx/${hash}?cluster=devnet`);

  // 5 fetch account data
  const acc = (await program.fetch("fizzBuzz", fizzAccount.toBase58())) as any;
  console.log("acc", acc.n.toString());
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
