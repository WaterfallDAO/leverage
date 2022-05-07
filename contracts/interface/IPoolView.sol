pragma solidity ^0.5.9;

interface IPoolView {

    function getPoolInGivenTokenOut(
        address tokenOut, uint poolAmountIn, uint minAmountOut
    ) external view returns (uint);

    function pool() external view returns (address);

    function isBound(address _token) external view returns (bool);

    function getTokenAmountPerLp(address token) external view returns (uint);

    function getCurrentTokens() external view returns (address[] memory);
}