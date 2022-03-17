import { task } from "hardhat/config";

task("transfer")
  .addParam("to")
  .addParam("amount")
  .addOptionalParam("from")
  .setAction(
    async ({
      to,
      amount,
      from,
    }: {
      to: string;
      amount: number;
      from?: string;
    }) => {
      const {
        TOKEN_NAME,
        TOKEN_SYMBOL,
        CONTRACT_ADDRESS,
      } = require("../constants.ts");

      const Token = await ethers.getContractFactory(TOKEN_NAME);
      const token = await Token.attach(CONTRACT_ADDRESS, ethers.provider);

      console.log(`Transfering to ${to} ${amount} ${TOKEN_SYMBOL}s`);
      await token.transfer(to, ethers.utils.parseEther(String(amount)), {
        from,
      });
    }
  );
