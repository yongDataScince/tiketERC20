const IPFS = require("ipfs");
const fs = require("fs");
const path = require("path");

// const ipfs = new IPFS({ host: "localhost", port: 5001, protocol: "http" });

const main = async () => {
  const pathToImage = path.resolve(__dirname, `../images/myNFT.jpg`);
  const content = await fs.readFile(pathToImage);
};

main().then((data) => console.log(data));

