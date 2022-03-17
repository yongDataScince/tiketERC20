import { task } from "hardhat/config";

task("allowance")
  .addParam("owner")
  .addParam("spender")
  .setAction(async ({ owner, spender }: { owner: string; spender: string }) => {
    const {
      TOKEN_NAME,
      TOKEN_SYMBOL,
      CONTRACT_ADDRESS,
    } = require("../constants.ts");

    const Token = await ethers.getContractFactory(TOKEN_NAME);
    const token = await Token.attach(CONTRACT_ADDRESS, ethers.provider);
    const allowance = ethers.utils.formatEther(await token.allowance(spender));
    console.log(`${spender} can spend ${owner} ${allowance} ${TOKEN_SYMBOL}s`);
  });
