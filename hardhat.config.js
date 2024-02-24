require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity:{compilers: [
    {
      version: "0.8.20",
      settings: { optimizer: { enabled: true, runs: 200 } },
    },
    {
      version: "0.8.0",
      settings: { optimizer: { enabled: true, runs: 200 } },
    },
    {
      version: "0.7.6",
      settings: { optimizer: { enabled: true, runs: 200 } },
    },
    {
      version: "0.5.0",
      settings: { optimizer: { enabled: true, runs: 200 } },
    },
    // Specify additional versions as needed
  ],}
};
