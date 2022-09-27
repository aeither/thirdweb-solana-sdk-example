const prompts = require("prompts");

(async () => {
  const response = await prompts({
    type: "text",
    name: "path",
    message: "How old are you?",
    // format: (name) => name.toLowerCase(),
    validate: (value, values, prompt) => {
    //   console.log("this is ", value);
      if (value === "OK") {
        return `Nightclub is 18+ only`;
      }
      return true;
    },
  });

  console.log(response); // => { value: 24 }
})();
