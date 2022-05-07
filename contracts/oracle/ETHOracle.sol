pragma solidity ^0.5.9;

import "../lib/SafeMath.sol";
import "../interface/ILinkOracle.sol";

contract ETHOracle {

    using SafeMath for uint;

    address public ethTrxOracle;
    address public trxUsdtOracle;

    constructor(address _ethTrxOracle, address _trxUsdtOracle) public{
        ethTrxOracle = _ethTrxOracle;
        trxUsdtOracle = _trxUsdtOracle;
    }

    function toBytes(uint256 n) public view returns (bytes32) {
        return bytes32(n);
    }

    function toUint(bytes32 inBytes) pure public returns (uint256 outUint) {
        return uint256(inBytes);
    }

    function latestAnswer() external view returns (bytes32){
        uint ethTrx = toUint(ILinkOracle(ethTrxOracle).latestAnswer());
        uint trxUsdt = toUint(ILinkOracle(trxUsdtOracle).latestAnswer());
        return toBytes(ethTrx.mul(trxUsdt).div(1e6));

    }
}