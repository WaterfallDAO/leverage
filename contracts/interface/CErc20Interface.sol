pragma solidity ^0.5.9;

import "./CTokenInterface.sol";

contract CErc20Interface {

    /*** User Interface ***/

    function mint(uint mintAmount) external returns (uint);

    function redeem(uint redeemTokens) external returns (uint);

    function redeemUnderlying(uint redeemAmount) external returns (uint);

    function borrow(uint borrowAmount) external returns (uint);

    function repayBorrow(uint repayAmount) external returns (uint);

    function repayBorrowBehalf(address borrower, uint repayAmount) external returns (uint);

    function liquidateBorrow(
        address borrower,
        uint repayAmount,
        CTokenInterface cTokenCollateral
    ) external returns (uint);


    /*** Admin Functions ***/

    function _addReserves(uint addAmount) external returns (uint);
}

