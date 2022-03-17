/* eslint-disable node/no-missing-import */
/* eslint-disable node/no-missing-require */
import { Signer } from "ethers";
// eslint-disable-next-line camelcase
import { TicketToken__factory, TicketToken } from "../typechain";

const { expect } = require("chai");
const { ethers } = require("hardhat");

const {
  EMPTY_ADDRESS,
  TOKEN_NAME,
  TOKEN_SYMBOL,
  TOKEN_TOTAL_SUPPLY,
} = require("../constants");

describe("ERC20", async () => {
  let owner: Signer, addr1: Signer, addr2: Signer;

  let token: TicketToken;

  beforeEach(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();
    token = await new TicketToken__factory(owner).deploy(
      TOKEN_NAME,
      TOKEN_SYMBOL,
      100,
      TOKEN_TOTAL_SUPPLY
    );
  });

  it("Check tocken's data: ", async () => {
    expect(await token.name()).to.equal("TicketToken");
    expect(await token.symbol()).to.equal("TKN");
    expect(await token.decimals()).to.equal(18);
    expect(await token.totalSupply()).to.equal(10000);
    expect(await token.balanceOf(await owner.getAddress())).to.equal(100);
  });

  it("Check tocken's methods: ", async () => {
    await token.transfer(await addr1.getAddress(), 20);
    expect(await token.balanceOf(await addr1.getAddress())).to.equal(20);
    expect(await token.balanceOf(await owner.getAddress())).to.equal(80);

    await token.approve(await addr1.getAddress(), 10);
    expect(
      await token.allowance(await owner.getAddress(), await addr1.getAddress())
    ).to.equal(10);
    expect(
      await token
        .connect(addr1)
        .transferFrom(await owner.getAddress(), await addr2.getAddress(), 10)
    );

    expect(await token.balanceOf(await owner.getAddress())).to.equal(70);

    await token.burn(10);
    expect(await token.balanceOf(await owner.getAddress())).to.equal(60);

    await token.mint(35);
    expect(await token.balanceOf(await owner.getAddress())).to.equal(95);
  });

  it("Check errors", async () => {
    const add1Addr = await addr1.getAddress();
    const add2Addr = await addr2.getAddress();
    const ownerAddress = await owner.getAddress();

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

    await expect(token.burn(101)).to.be.revertedWith("much to burn");
  });
});
