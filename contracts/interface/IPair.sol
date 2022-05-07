pragma solidity ^0.5.9;


interface IPair {

    function tokenAddress() external view returns (address);

    function decimals() external view returns (uint);

    function totalSupply() external view returns (uint256);

}