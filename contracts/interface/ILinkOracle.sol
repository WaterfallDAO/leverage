pragma solidity ^0.5.9;

interface ILinkOracle {
    function latestAnswer() external view returns (bytes32 );
}