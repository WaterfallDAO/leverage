pragma solidity ^0.5.9;

import "../interface/IPoolView.sol";


contract MockPoolView is IPoolView {

    address public tokenIn;

    address public tokenOut;
    address public lp;
    address[] public _tokens;

    constructor(address _tokenIn, address _tokenOut, address _lp) public {
        tokenIn = _tokenIn;
        tokenOut = _tokenOut;
        lp = _lp;

        _tokens.push(tokenIn);
        _tokens.push(tokenOut);
    }

    function getPoolInGivenTokenOut(
        address _tokenOut, uint poolAmountIn, uint minAmountOut
    ) external view returns (uint){
        return 1;
    }

    function pool() external view returns (address){
        return lp;
    }

    function getTokenAmountPerLp(address token) external view returns (uint){
        return 1;
    }


    function isBound(address _token) external view returns (bool){
        return _token == tokenIn || _token == tokenOut;
    }

    function getCurrentTokens() external view returns (address[] memory){
        return _tokens;
    }
}