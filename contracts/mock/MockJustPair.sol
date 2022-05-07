pragma solidity ^0.5.9;

import "../interface/IPair.sol";


contract MockJustPair is IPair {

    address private _token;
    uint private _decimals;
    uint private _total;

    function() payable external {}

    constructor(address token, uint decimals, uint total) public {
        _token = token;
        _decimals = decimals;
        _total = total;
    }
    function tokenAddress() external view returns (address){
        return _token;
    }

    function decimals() external view returns (uint){
        return _decimals;
    }

    function totalSupply() external view returns (uint){
        return _total;
    }

}