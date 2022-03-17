import { task } from "hardhat/config";

task("transferFrom")
  .addParam("from")
  .addParam("to")
  .addParam("amount")
  .setAction(
    async ({
      from,
      to,
      amount,
    }: {
      from: string;
      to: string;
      amount: number;
    }) => {
      const {
        TOKEN_NAME,
        TOKEN_SYMBOL,
        CONTRACT_ADDRESS,
      } = require("../constants.ts");

      const Token = await ethers.getContractFactory(TOKEN_NAME);
      const token = await Token.attach(CONTRACT_ADDRESS, ethers.provider);

      console.log(
        `Transfering to ${to} from ${from} ${amount} ${TOKEN_SYMBOL}s`
      );
      await token
        .transferFrom(from, to, ethers.utils.parseEther(String(amount)))
        .catch((err: string) => console.log("Error Transfered", err))
        .then(() => console.log("Transfered"));
    }
  );
