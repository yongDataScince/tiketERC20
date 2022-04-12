const mainNFT = async () => {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log(
    "Account balance:",
    ethers.utils.formatEther((await deployer.getBalance()).toString())
  );

  const Contract = await ethers.getContractFactory("GoldenTiket");
  const contract = await Contract.deploy(
    "My Test NFT",
    "MTN",
    "https://ipfs.infura.io/ipfs/"
  );

  await contract.deployed();
  console.log("Contract address:", contract.address);
};

mainNFT()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
