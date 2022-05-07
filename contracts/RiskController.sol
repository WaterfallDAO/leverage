pragma solidity ^0.5.9;

import "./lib/Controller.sol";

contract RiskController is Controller {

    uint constant  NO_RISK = 0;
    uint constant  HIGH = 1;


    mapping(address => bool) public contractWhiteList;

    mapping(address => bool) public banMint;
    mapping(address => bool) public banBorrow;

    function isContractCall() public view returns (bool isContract){
        return msg.sender != tx.origin;
    }


    function addToWhiteList(address _target) public onlyController {
        contractWhiteList[_target] = true;
    }

    function removeFromWhiteList(address _target) public onlyController {
        contractWhiteList[_target] = false;
    }

    function banTokenMint(address _token) public onlyController {
        banMint[_token] = true;
    }

    function removeBanTokenMint(address _token) public onlyController {
        banMint[_token] = false;
    }

    function banTokenBorrow(address _token) public onlyController {
        banBorrow[_token] = true;
    }

    function removeBanTokenBorrow(address _token) public onlyController {
        banBorrow[_token] = false;
    }

    function checkMintRisk(
        address _token,
        address _address
    ) external view returns (uint mintRisk) {
        if (!isContractCall()) {
            return NO_RISK;
        }
        if (contractWhiteList[_address]) {
            return NO_RISK;
        }
        mintRisk = banMint[_token] ? HIGH : NO_RISK;
        return mintRisk;

    }

    function checkBorrowRisk(
        address _token,
        address _address
    ) external view returns (uint borrowRisk) {
        if (!isContractCall()) {
            return NO_RISK;
        }
        if (contractWhiteList[_address]) {
            return NO_RISK;
        }
        borrowRisk = banBorrow[_token] ? HIGH : NO_RISK;
        return borrowRisk;
    }

}