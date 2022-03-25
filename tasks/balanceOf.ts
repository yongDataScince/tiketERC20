import { task } from "hardhat/config";

task("balanceOf")
  .addParam("address")
  .setAction(async ({ address }: { address: string }) => {
    const {
      TOKEN_NAME,
      TOKEN_SYMBOL,
      CONTRACT_ADDRESS,
    } = require("../constants.ts");

    const Token = await ethers.getContractFactory("TicketToken");
    const token = await Token.attach(CONTRACT_ADDRESS, ethers.provider);
    const balance = ethers.utils.formatEther(await token.balanceOf(address));
    console.log(`${address} have ${balance} ${TOKEN_SYMBOL}s`);
  });
