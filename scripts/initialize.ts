import * as anchor from "@project-serum/anchor";
import path from "path";

function _createKeypairFromFile(path: string): anchor.web3.Keypair {
  return anchor.web3.Keypair.fromSecretKey(
    Buffer.from(JSON.parse(require("fs").readFileSync(path, "utf-8")))
  );
}

async function airdropSolIfNeeded(
  signer: anchor.web3.Keypair,
  connection: anchor.web3.Connection
) {
  const balance = await connection.getBalance(signer.publicKey);
  console.log("Current balance is", balance / anchor.web3.LAMPORTS_PER_SOL);

  if (balance < anchor.web3.LAMPORTS_PER_SOL) {
    console.log("Airdropping 1 SOL...");
    const airdropSignature = await connection.requestAirdrop(
      signer.publicKey,
      anchor.web3.LAMPORTS_PER_SOL
    );

    const latestBlockHash = await connection.getLatestBlockhash();

    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: airdropSignature,
    });

    const newBalance = await connection.getBalance(signer.publicKey);
    console.log("New balance is", newBalance / anchor.web3.LAMPORTS_PER_SOL);
  }
}

const initWallet = async (connection: anchor.web3.Connection) => {
  //   solana-keygen new -o ./keypair.json
  const anchorWallet = new anchor.Wallet(
    _createKeypairFromFile(
      path.resolve(__dirname, "./keypair.json")
    )
  );

  await airdropSolIfNeeded(anchorWallet.payer, connection);
  console.log("Anchor Wallet", anchorWallet.payer.publicKey.toBase58());

  return {
    anchorWallet,
  };
};

export { initWallet };
