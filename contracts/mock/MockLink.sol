pragma solidity ^0.5.9;

import "../interface/ILinkOracle.sol";

contract MockLink is ILinkOracle {

    uint  public price;

    function toBytes(uint256 n) public view returns (bytes32) {
        return bytes32(n);
    }

    function latestAnswer() external view returns (bytes32){
        return toBytes(price);
    }

    function updatePrice(uint _price) public {
        price = _price;
    }
}