//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract AccessControl {
  enum Roles { USER, MINTER, BURNER, ADMIN }

  address public owner;
  mapping(address => Roles) public roles;

  constructor() {
    owner = msg.sender;
  }

  modifier onlyOwnerOrAdmin() {
    require(msg.sender == owner || roles[msg.sender] == Roles.ADMIN, "you're not owner or admin");
    _;
  }

  modifier onlyOwner() {
    require(msg.sender == owner, "you're not owner");
    _;
  }

  modifier canBurn() {
    require(roles[msg.sender] == Roles.BURNER || msg.sender == owner || roles[msg.sender] == Roles.ADMIN, "you're not burner");
    _;
  }

  modifier canMint() {
    require(roles[msg.sender] == Roles.MINTER || msg.sender == owner || roles[msg.sender] == Roles.ADMIN, "you're not minter");
    _;
  }

  function transferOwnership(address _owner) external onlyOwner {
    owner = _owner;
  }

  function createBirner(address _birner) external onlyOwnerOrAdmin {
    roles[_birner] = Roles.BURNER;
  }

  function createMinter(address _minter) external onlyOwnerOrAdmin {
    roles[_minter] = Roles.MINTER;
  }

  function removeBirner(address _birner) external onlyOwnerOrAdmin {
    roles[_birner] = Roles.USER;
  }

  function removeMinter(address _minter) external onlyOwnerOrAdmin {
    roles[_minter] = Roles.USER;
  }

  function createAdmin(address _admin) external onlyOwner {
    roles[_admin] = Roles.ADMIN;
  }

  function removeAdmin(address _admin) external onlyOwner {
    roles[_admin] = Roles.USER;
  }

  function getAddressRole(address _addr) external view returns(Roles) {
    return roles[_addr];
  }

  function getOwner() external view returns(address) {
    return owner;
  }
}