pragma solidity ^0.5.4;

interface IBool {
    function joinswapExternAmountIn(
        address tokenIn, uint tokenAmountIn, uint minPoolAmountOut
    ) external returns (uint poolAmountOut);

    function swapExactAmountIn(
        address tokenIn,
        uint tokenAmountIn,
        address tokenOut,
        uint minAmountOut,
        uint maxPrice
    ) external returns (uint tokenAmountOut, uint spotPriceAfter);
    function isBound(address t) external view returns (bool);
}