require("dotenv").config();
require("@nomiclabs/hardhat-web3");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat/config");
require("@typechain/hardhat");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");

require("./tasks/transfer.ts");
require("./tasks/balanceOf.ts");
require("./tasks/approve.ts");
require("./tasks/allowance.ts");
require("./tasks/transferFrom.ts");
require("./tasks/mint.ts");
require("./tasks/stake.ts");
require("./tasks/unstake.ts");
require("./tasks/claim.ts");
require("./tasks/mintNft.ts");

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.5.7",
      },
      {
        version: "0.8.0",
      },
      {
        version: "0.8.1",
      },
      {
        version: "0.6.12",
      },
    ],
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  networks: {
    rinkeby: {
      url: process.env.RINKEBY_URL || "",
      gas: 2100000,
      gasPrice: 8000000000,
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: {
      rinkeby: process.env.ETHERSCAN_API_KEY,
    },
  },
};
