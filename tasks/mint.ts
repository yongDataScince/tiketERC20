import { task } from "hardhat/config";

task("mint")
  .addParam("tokenaddr")
  .addParam("addr")
  .addParam("amount")
  .setAction(
    async ({
      tokenaddr,
      addr,
      amount,
    }: {
      tokenaddr: string;
      addr: string;
      amount: number;
    }) => {
      const { DEPLOYED_ADDRESS } = require("../constants.ts");

      const Token = await ethers.getContractFactory("TicketToken");
      const token = await Token.attach(tokenaddr, ethers.provider);
      console.log(await token.symbol());
      token
        .mint(addr, ethers.utils.parseEther(String(amount)))
        .then(async () => {
          console.log(`${amount} ${await token.symbol()} was minted`);
        })
        .catch(() => console.log("Error"));
    }
  );
