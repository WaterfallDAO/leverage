pragma solidity ^0.5.9;

contract ComptrollerMock {
    uint public compRate;

    function _setCompRate(uint compRate_) public {
        compRate = compRate_;
    }
}