import { task } from "hardhat/config";

task("stake")
  .addParam("amount")
  .setAction(async ({ amount }: { amount: number }) => {
    const Contract = await ethers.getContractFactory("Staking");
    const contract = await Contract.attach(
      "0x954F24a62A1986A3F45c54C8E2383b6B1f13d1Fd",
      ethers.provider
    );

    contract
      .stake(ethers.utils.parseEther(String(amount)))
      .then(() => console.log(`You're staked ${amount}`));
  });
