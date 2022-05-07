pragma solidity ^0.5.9;

interface IFactory {
    function isBPool(address b) external view returns (bool);
}