import { task } from "hardhat/config";

task("approve")
  .addParam("tokenaddr")
  .addParam("spender")
  .addParam("amount")
  .setAction(
    async ({
      tokenaddr,
      spender,
      amount,
    }: {
      tokenaddr: string;
      spender: string;
      amount: number;
    }) => {
      const Token = await ethers.getContractFactory("TicketToken");
      const token = await Token.attach(tokenaddr, ethers.provider);

      console.log(
        `You're approve ${spender} to spend ${amount} ${await token.symbol()}s`
      );
      await token
        .approve(spender, ethers.utils.parseEther(String(amount)))
        .catch((err: string) => console.log("Error approve", err))
        .then(() => console.log("Approved"));
    }
  );
