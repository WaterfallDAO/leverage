pragma solidity ^0.5.9;

interface IRewardPool {
    function notifyRewardAmount(uint256 reward) external;
}