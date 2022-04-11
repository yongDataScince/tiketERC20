//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./IERC20.sol";
import "./AccessControl.sol";

contract Staking is AccessControl {
    IERC20 public rewardToken;
    IERC20 public stakingToken;

    uint public rewardTime = 40 seconds;
    uint public frozenTime = 10 minutes;
    uint public percentOfStake = 2;
    uint public lastUpdateTime;
    uint private _totalSupply;

    struct StakeHolder {
        uint staked;
        uint lastStakeTime;
        uint reward;
        uint stakeTime;
    }

    mapping (address => StakeHolder) public stakeHolders;

    constructor(address _rewardToken, address _stakingToken) {
        rewardToken = IERC20(_rewardToken);
        stakingToken = IERC20(_stakingToken);
    }


    function _updateReward(address _addr) private {
        uint time = block.timestamp - stakeHolders[msg.sender].lastStakeTime;
        stakeHolders[msg.sender].stakeTime = time;
        if(time >= rewardTime) {
            uint updateTimes = stakeHolders[msg.sender].stakeTime / rewardTime;
            stakeHolders[_addr].reward += updateTimes * ((stakeHolders[_addr].staked / 100) * percentOfStake);
        }
    }

    // stake LP-Token
    function stake(uint _amount) public {
        _totalSupply += _amount;

        stakeHolders[msg.sender].lastStakeTime = block.timestamp;
        stakeHolders[msg.sender].staked += _amount;

        stakingToken.transferFrom(msg.sender, address(this), _amount);
    }

    // unstake LP-Token
    function unstake(uint _amount) public {
        stakeHolders[msg.sender].staked -= _amount;
        if(stakeHolders[msg.sender].staked == 0) {
            stakeHolders[msg.sender].lastStakeTime = 0;
        }
        _totalSupply -= _amount;
        stakingToken.transfer(msg.sender, _amount);
    }

    // withdraw my Token
    function claim() public {
        _updateReward(msg.sender);
        require(stakeHolders[msg.sender].stakeTime > frozenTime, "please wait for claim");
        uint reward = stakeHolders[msg.sender].reward;
        stakeHolders[msg.sender].reward = 0;
        rewardToken.transfer(msg.sender, reward);
    }

    function stakeOf(address _addr) external view returns (uint) {
        return stakeHolders[_addr].staked;
    }

    function setPercent(uint _percent) external onlyOwnerOrAdmin {
        percentOfStake = _percent;
    }

    function setRewardTime(uint _time) external onlyOwnerOrAdmin {
        rewardTime = _time;
    }

    function setFrozenTime(uint _time) external onlyOwnerOrAdmin {
        frozenTime = _time;
    }
}
