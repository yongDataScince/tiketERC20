import { task } from "hardhat/config";
const fs = require("fs");
const IPFSClient = require("ipfs-http-client");
const path = require("path");

const addFile = async (fileName: string, filePath: string) => {
  const ipfs = await IPFSClient.create({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
  });
  const file = fs.readFileSync(path.resolve(__dirname, filePath));
  const filesAdded = await ipfs.add(
    { path: fileName, content: file },
    {
      progress: (len: number) => console.log("Uploading file..." + len),
    }
  );

  const fileHash = filesAdded.cid.toString();

  const jsonAddes = await ipfs.add(
    JSON.stringify({
      name: fileName,
      description: "my describe",
      image: `https://ipfs.infura.io/ipfs/${fileHash}`,
      attributes: [],
    })
  );
  console.log(jsonAddes);

  return jsonAddes.cid.toString();
};

task("mint-nft")
  .addParam("owner")
  .addParam("contractaddr")
  .addParam("path")
  .addParam("name")
  .setAction(
    async ({
      owner,
      contractaddr,
      path,
      name,
    }: {
      owner: string;
      contractaddr: string;
      path: string;
      name: string;
    }) => {
      const NFT = await ethers.getContractFactory("GoldenTiket");
      const nft = await NFT.attach(contractaddr);
      const tokenHash = await addFile(name, path);
      await nft.mintToken(owner, tokenHash);
      console.log(
        `Token was minted at address: https://ipfs.infura.io/ipfs/${tokenHash}`
      );
      console.log(await nft.tokenURI(0), await nft.ownerOf(0));
    }
  );
// https://ipfs.infura.io/ipfs/QmeH8gy2tKBAxrn5k76Je4sAPAnviZAP6fiU2kwMs5nQnR
