/* eslint-disable node/no-missing-import */
/* eslint-disable node/no-missing-require */
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
// eslint-disable-next-line camelcase
import {
  TicketToken__factory,
  TicketToken,
  Staking__factory,
  Staking,
  GoldenTiket,
  GoldenTiket__factory,
} from "../typechain";

const { expect } = require("chai");
const { ethers } = require("hardhat");

const timeout = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));

const {
  EMPTY_ADDRESS,
  TOKEN_NAME,
  TOKEN_SYMBOL,
  TOKEN_TOTAL_SUPPLY,
} = require("../constants");

describe("ERC20", async () => {
  let owner: SignerWithAddress,
    owner2: SignerWithAddress,
    addr1: SignerWithAddress,
    addr2: SignerWithAddress,
    minter: SignerWithAddress,
    birner: SignerWithAddress,
    admin: SignerWithAddress;

  let token: TicketToken;

  beforeEach(async () => {
    [owner, owner2, addr1, addr2, minter, birner, admin] =
      await ethers.getSigners();
    token = await new TicketToken__factory(owner).deploy(
      TOKEN_NAME,
      TOKEN_SYMBOL,
      TOKEN_TOTAL_SUPPLY
    );

    await token.mint(await owner.address, 60);
  });

  it("Check tocken's data: ", async () => {
    expect(await token.name()).to.equal("TicketTokenV2");
    expect(await token.symbol()).to.equal("TKN2");
    expect(await token.decimals()).to.equal(18);
    expect(await token.totalSupply()).to.equal(10060);
    expect(await token.balanceOf(owner.address)).to.equal(60);
  });

  it("Check tocken's methods: ", async () => {
    await token.transfer(await addr1.address, 10);
    expect(await token.balanceOf(addr1.address)).to.equal(10);
    expect(await token.balanceOf(owner.address)).to.equal(50);

    await token.approve(addr1.address, 10);
    expect(await token.allowance(owner.address, addr1.address)).to.equal(10);

    expect(
      await token.connect(addr1).transferFrom(owner.address, addr2.address, 10)
    );

    expect(await token.balanceOf(owner.address)).to.equal(40);
  });

  it("Check errors", async () => {
    const add1Addr = addr1.address;
    const add2Addr = addr2.address;
    const ownerAddress = owner.address;

    await token.approve(add1Addr, 1000);

    await expect(token.transfer(add1Addr, 1000)).to.be.revertedWith(
      "not enough coins"
    );

    await expect(
      token.connect(add1Addr).transferFrom(ownerAddress, add2Addr, 1001)
    ).to.be.revertedWith("invalid quantity");

    await expect(
      token.connect(add1Addr).transferFrom(ownerAddress, add2Addr, 1000)
    ).to.be.revertedWith("not enough coins");

    await expect(token.transfer(EMPTY_ADDRESS, 10)).to.be.revertedWith(
      "Address is empty"
    );
  });

  it("Check access control", async () => {
    const ownerAddress = await token.getOwner();
    await expect(ownerAddress).to.equal(owner.address);

    await token.createMinter(minter.address);
    await token.createBirner(birner.address);
    await token.createAdmin(admin.address);

    await expect(
      token.connect(addr1).createMinter(addr2.address)
    ).to.be.revertedWith("you're not owner or admin");

    await expect(
      token.connect(addr1).createBirner(addr2.address)
    ).to.be.revertedWith("you're not owner or admin");

    await expect(
      token.connect(addr1).createAdmin(addr2.address)
    ).to.be.revertedWith("you're not owner");

    await expect(
      token.connect(addr1).burn(addr2.address, 10)
    ).to.be.revertedWith("you're not burner");

    await expect(
      token.connect(addr1).mint(addr2.address, 10)
    ).to.be.revertedWith("you're not minter");

    await expect(
      token.connect(birner).burn(ownerAddress, 500)
    ).to.be.revertedWith("much to burn");

    await token.connect(birner).burn(ownerAddress, 20);

    expect(await token.totalSupply()).to.equal(10040);
    expect(await token.balanceOf(owner.address)).to.equal(40);

    await token.connect(admin).removeBirner(birner.address);
    await token.connect(admin).removeMinter(minter.address);
    await token.removeAdmin(admin.address);

    expect(await token.getAddressRole(birner.address)).to.equal(0);
    expect(await token.getAddressRole(minter.address)).to.equal(0);
    expect(await token.getAddressRole(admin.address)).to.equal(0);

    await token.transferOwnership(owner2.address);

    expect(await token.owner()).to.equal(owner2.address);
  });
});

describe("Staking", async () => {
  let owner: SignerWithAddress,
    addr1: SignerWithAddress,
    addr2: SignerWithAddress;

  let stakeToken: TicketToken, lpToken: TicketToken, stakingContract: Staking;

  beforeEach(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();

    stakeToken = await new TicketToken__factory(owner).deploy(
      TOKEN_NAME,
      TOKEN_SYMBOL,
      TOKEN_TOTAL_SUPPLY
    );

    lpToken = await new TicketToken__factory(owner).deploy(
      "LPTonken",
      "LPT",
      0
    );

    stakingContract = await new Staking__factory(owner).deploy(
      lpToken.address,
      stakeToken.address
    );

    await lpToken.mint(
      stakingContract.address,
      ethers.utils.parseEther("5000")
    );

    await stakeToken.mint(owner.address, ethers.utils.parseEther("5000"));
    await stakeToken.mint(addr1.address, ethers.utils.parseEther("5000"));
    await stakeToken.mint(addr2.address, ethers.utils.parseEther("5000"));

    await stakeToken.approve(
      stakingContract.address,
      ethers.utils.parseEther("2000000000")
    );

    await stakeToken
      .connect(addr1)
      .approve(stakingContract.address, ethers.utils.parseEther("2000000000"));

    await stakeToken
      .connect(addr2)
      .approve(stakingContract.address, ethers.utils.parseEther("2000000000"));

    await stakingContract.stake(ethers.utils.parseEther("10"));
  });

  it("stake", async () => {
    expect(await stakingContract.stakeOf(owner.address)).to.equal(
      ethers.utils.parseEther("10")
    );
    expect(await stakeToken.balanceOf(owner.address)).to.equal(
      ethers.utils.parseEther(`4990`)
    );
  });

  it("unstake", async () => {
    await stakingContract.unstake(ethers.utils.parseEther("10"));
    expect(await stakingContract.stakeOf(owner.address)).to.equal(0);
    expect(await stakeToken.balanceOf(owner.address)).to.equal(
      ethers.utils.parseEther(`5000`)
    );
  });

  it("claim reward", async () => {
    await stakingContract.stake(ethers.utils.parseEther("20"));

    await stakingContract.connect(addr1).stake(ethers.utils.parseEther("40"));
    await stakingContract.connect(addr2).stake(ethers.utils.parseEther("100"));
    // await timeout(1000 * 10);
    await expect(stakingContract.claim()).to.be.revertedWith(
      "please wait for claim"
    );
    // await timeout(1000 * 20);

    // await stakingContract.claim();

    // expect(await lpToken.balanceOf(owner.address)).to.equal(
    //   ethers.utils.parseEther("0.9")
    // );
  });

  it("Check access control", async () => {
    await stakingContract.setPercent(20);
    expect(await stakingContract.percentOfStake()).to.equal(20);

    await stakingContract.setRewardTime(10 * 1000 * 20);
    expect(await stakingContract.rewardTime()).to.equal(2e5);

    await stakingContract.setFrozenTime(10 * 1000 * 40);
    expect(await stakingContract.frozenTime()).to.equal(4e5);

    await stakingContract.stake(ethers.utils.parseEther("10"));
    timeout(20 * 1000);
    await expect(stakingContract.claim()).to.be.revertedWith(
      "please wait for claim"
    );
  });
});

describe("ERC721", async () => {
  let owner: SignerWithAddress,
    addr1: SignerWithAddress,
    addr2: SignerWithAddress;

  let NFT: GoldenTiket;

  beforeEach(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();
    NFT = await new GoldenTiket__factory(owner).deploy(
      "Golden Token",
      "GTK",
      "ipfs://golden-tokens/"
    );
  });

  it("check main data", async () => {
    await NFT.mintToken(owner.address, "ownerToken");
    expect(await NFT.name()).to.equal("Golden Token");
    expect(await NFT.symbol()).to.equal("GTK");
    expect(await NFT.tokenURI(0)).to.equal(`ipfs://golden-tokens/ownerToken`);
    expect(await NFT.supportsInterface("0x80ac58cd")).to.equal(true);

    await NFT.setBaseURI("");
    expect(await NFT.tokenURI(0)).to.equal("");

    await NFT.setBaseURI("ipfs://goldens/");
    await NFT.mintToken(owner.address, "");
    expect(await NFT.tokenURI(1)).to.equal("ipfs://goldens/1");
  });

  it("check data of tokens", async () => {
    await NFT.mintToken(addr1.address, addr1.address + "_0");
    await NFT.mintToken(addr2.address, addr2.address + "_1");
    await NFT.mintToken(addr2.address, addr2.address + "_2");

    expect(await NFT.balanceOf(owner.address)).to.equal(0);
    expect(await NFT.balanceOf(addr1.address)).to.equal(1);
    expect(await NFT.balanceOf(addr2.address)).to.equal(2);
  });

  it("check ownership", async () => {
    await NFT.mintToken(addr2.address, addr2.address + "_0");
    await NFT.mintToken(addr1.address, addr1.address + "_1");
    await NFT.mintToken(addr1.address, addr1.address + "_2");
    await NFT.mintToken(addr1.address, addr1.address + "_3");

    expect(await NFT.balanceOf(addr1.address)).to.equal(3);
    expect(await NFT.balanceOf(addr2.address)).to.equal(1);

    expect(await NFT.ownerOf(3)).to.equal(addr1.address);
    expect(await NFT.ownerOf(0)).to.equal(addr2.address);
  });

  it("check another methods", async () => {
    await NFT.mintToken(addr1.address, addr1.address + "_1");

    expect(await NFT.tokenURI(0)).to.equal(
      `ipfs://golden-tokens/${addr1.address}_1`
    );

    await expect(
      NFT.connect(addr1).setBaseURI("ipfs://golden-token/ownerToken")
    ).to.be.revertedWith("Ownable: caller is not the owner");

    await NFT.setBaseURI("ipfs://golden-token-chaged/");
    expect(await NFT.tokenURI(0)).to.equal(
      `ipfs://golden-token-chaged/${addr1.address}_1`
    );
  });

  it("check approval and transfer", async () => {
    await NFT.mintToken(addr2.address, addr2.address + "_0"); // id - 0
    await NFT.mintToken(addr1.address, addr1.address + "_1"); // id - 1

    await NFT.mintToken(owner.address, owner.address + "_1"); // id - 2
    await NFT.mintToken(owner.address, owner.address + "_2"); // id - 3
    await NFT.mintToken(owner.address, owner.address + "_3"); // id - 4
    await NFT.mintToken(owner.address, owner.address + "_3"); // id - 5

    await NFT.approve(addr1.address, 3);
    await NFT.connect(addr1).transferFrom(owner.address, addr1.address, 3);
    expect(await NFT.ownerOf(3)).to.equal(addr1.address);

    await expect(
      NFT.connect(addr2).transferFrom(owner.address, addr2.address, 3)
    ).to.be.revertedWith("ERC721: you can't spend this");

    await expect(NFT.setApprovalForAll(addr1.address, true))
      .to.emit(NFT, "ApprovalForAll")
      .withArgs(owner.address, addr1.address, true);

    expect(await NFT.isApprovedForAll(owner.address, addr1.address)).to.equal(
      true
    );

    await expect(
      NFT.connect(addr1).transferFrom(owner.address, addr2.address, 5)
    )
      .to.emit(NFT, "Transfer")
      .withArgs(owner.address, addr2.address, 5);

    await expect(NFT.setApprovalForAll(addr1.address, false))
      .to.emit(NFT, "ApprovalForAll")
      .withArgs(owner.address, addr1.address, false);

    expect(await NFT.isApprovedForAll(owner.address, addr2.address)).to.equal(
      false
    );
  });
});
