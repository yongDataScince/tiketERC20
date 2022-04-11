const mainNFT = async () => {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Contract = await ethers.getContractFactory("GoldenTiket");
  const contract = await Contract.deploy("Golden Tiken", "GLT", "ipfs://");

  await contract.deployed();
  console.log("Contract address:", contract.address);
};

mainNFT()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
