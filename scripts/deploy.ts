const mainTKN = async () => {
  const { TOKEN_NAME, TOKEN_SYMBOL } = require("../constants");
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Token = await ethers.getContractFactory("TicketToken");
  const token = await Token.deploy(TOKEN_NAME, TOKEN_SYMBOL, 0);

  await token.deployed();
  console.log("Token ${} address:", token.address);
};

mainTKN()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
