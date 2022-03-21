import { task } from "hardhat/config";

task("mint")
  .addParam("addr")
  .addParam("amount")
  .setAction(async ({ addr, amount }: { addr: string; amount: number }) => {
    const { DEPLOYED_ADDRESS } = require("../constants.ts");

    const Token = await ethers.getContractFactory("TicketToken");
    const token = await Token.attach(DEPLOYED_ADDRESS, ethers.provider);

    await token.mint(addr, ethers.utils.parseEther(String(amount)));
  });
