/* eslint-disable node/no-missing-require */
const { ethers } = require("hardhat");

const {
  TOKEN_NAME,
  TOKEN_SYMBOL,
  TOKEN_TOTAL_SUPPLY,
} = require("../constants");

const main = async () => {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Token = await ethers.getContractFactory("TicketToken");
  const token = await Token.deploy(
    TOKEN_NAME,
    TOKEN_SYMBOL,
    ethers.utils.parseEther(String(100)),
    ethers.utils.parseEther(String(TOKEN_TOTAL_SUPPLY))
  );

  await token.deployed();
  console.log("Contract address:", token.address);
};

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
