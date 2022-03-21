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
  let owner: Signer,
    owner2: Signer,
    addr1: Signer,
    addr2: Signer,
    minter: Signer,
    birner: Signer,
    admin: Signer;

  let token: TicketToken;

  beforeEach(async () => {
    [owner, owner2, addr1, addr2, minter, birner, admin] =
      await ethers.getSigners();
    token = await new TicketToken__factory(owner).deploy(
      TOKEN_NAME,
      TOKEN_SYMBOL,
      TOKEN_TOTAL_SUPPLY
    );

    await token.mint(await owner.getAddress(), 60);
  });

  it("Check tocken's data: ", async () => {
    expect(await token.name()).to.equal("TicketToken");
    expect(await token.symbol()).to.equal("TKN");
    expect(await token.decimals()).to.equal(18);
    expect(await token.totalSupply()).to.equal(10060);
    expect(await token.balanceOf(await owner.getAddress())).to.equal(60);
  });

  it("Check tocken's methods: ", async () => {
    await token.transfer(await addr1.getAddress(), 10);
    expect(await token.balanceOf(await addr1.getAddress())).to.equal(10);
    expect(await token.balanceOf(await owner.getAddress())).to.equal(50);

    await token.approve(await addr1.getAddress(), 10);
    expect(
      await token.allowance(await owner.getAddress(), await addr1.getAddress())
    ).to.equal(10);

    expect(
      await token
        .connect(addr1)
        .transferFrom(await owner.getAddress(), await addr2.getAddress(), 10)
    );

    expect(await token.balanceOf(await owner.getAddress())).to.equal(40);
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
  });

  it("Check access control", async () => {
    const ownerAddress = await token.getOwner();
    await expect(ownerAddress).to.equal(await owner.getAddress());

    await token.createMinter(await minter.getAddress());
    await token.createBirner(await birner.getAddress());
    await token.createAdmin(await admin.getAddress());

    await expect(
      token.connect(addr1).createMinter(await addr2.getAddress())
    ).to.be.revertedWith("you're not owner or admin");

    await expect(
      token.connect(addr1).createBirner(await addr2.getAddress())
    ).to.be.revertedWith("you're not owner or admin");

    await expect(
      token.connect(addr1).createAdmin(await addr2.getAddress())
    ).to.be.revertedWith("you're not owner");

    await expect(
      token.connect(addr1).burn(await addr2.getAddress(), 10)
    ).to.be.revertedWith("you're not burner");

    await expect(
      token.connect(addr1).mint(await addr2.getAddress(), 10)
    ).to.be.revertedWith("you're not minter");

    await expect(
      token.connect(birner).burn(ownerAddress, 500)
    ).to.be.revertedWith("much to burn");

    await token.connect(birner).burn(ownerAddress, 20);

    expect(await token.totalSupply()).to.equal(10040);
    expect(await token.balanceOf(await owner.getAddress())).to.equal(40);

    await token.connect(admin).removeBirner(await birner.getAddress());
    await token.connect(admin).removeMinter(await minter.getAddress());
    await token.removeAdmin(await admin.getAddress());

    expect(await token.getAddressRole(await birner.getAddress())).to.equal(0);
    expect(await token.getAddressRole(await minter.getAddress())).to.equal(0);
    expect(await token.getAddressRole(await admin.getAddress())).to.equal(0);

    await token.transferOwnership(await owner2.getAddress());

    expect(await token.owner()).to.equal(await owner2.getAddress());
  });
});
