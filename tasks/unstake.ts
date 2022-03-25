import { task } from "hardhat/config";

task("unstake")
  .addParam("amount")
  .setAction(async ({ amount }: { amount: number }) => {
    const Contract = await ethers.getContractFactory("Staking");
    const contract = await Contract.attach(
      "0x954F24a62A1986A3F45c54C8E2383b6B1f13d1Fd",
      ethers.provider
    );

    await contract.unstake(ethers.utils.parseEther(String(amount)));
    console.log(`You're unstaked ${amount}`);
  });
