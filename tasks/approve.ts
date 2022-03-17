import { task } from "hardhat/config";

task("approve")
  .addParam("spender")
  .addParam("amount")
  .setAction(
    async ({ spender, amount }: { spender: string; amount: number }) => {
      const {
        TOKEN_NAME,
        TOKEN_SYMBOL,
        CONTRACT_ADDRESS,
      } = require("../constants.ts");

      const Token = await ethers.getContractFactory(TOKEN_NAME);
      const token = await Token.attach(CONTRACT_ADDRESS, ethers.provider);

      console.log(
        `You're approve ${spender} to spend ${amount} ${TOKEN_SYMBOL}s`
      );
      await token
        .approve(spender, ethers.utils.parseEther(String(amount)))
        .catch((err: string) => console.log("Error approve", err))
        .then(() => console.log("Approved"));
    }
  );
