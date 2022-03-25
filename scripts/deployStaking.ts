const mainStake = async () => {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Contract = await ethers.getContractFactory("Staking");
  const contract = await Contract.deploy(
    "0xac0186d44846f154DaC7b6141F7ACe92baAE32e4",
    "0xDD166899281425c36C38f6a6Bd4C507710f07668"
  );

  await contract.deployed();
  console.log("Contract address:", contract.address);
};

mainStake()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
