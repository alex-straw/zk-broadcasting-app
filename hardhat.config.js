/** @type import('hardhat/config').HardhatUserConfig */

require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const KOVAN_API_KEY = process.env.KOVAN_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
  defaultNetwork: "kovan",
  networks: {
    hardhat: {},
    kovan: {
      url: KOVAN_API_KEY,
      accounts: [PRIVATE_KEY],
    },
  },
  solidity: {
    compilers: [
      { version: "0.8.0" },
      { version: "0.8.7" },
      { version: "0.6.6" },
    ],
    settings: {
      optimizer: {
        enabled: true,
        runs: 1,
      },
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 3000000,
  },
};