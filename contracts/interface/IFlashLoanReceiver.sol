pragma solidity ^0.5.9;

/**
* @title IFlashLoanReceiver interface
* @notice Interface for the Aave fee IFlashLoanReceiver.
* @author Aave
* @dev implement this interface to develop a flashloan-compatible flashLoanReceiver contract
**/
interface IFlashLoanReceiver {

    function executeOperation(
        address _reserve,
        address _cToken,
        uint256 _amount,
        uint256 _fee,
        bytes calldata _params
    ) external;
}
