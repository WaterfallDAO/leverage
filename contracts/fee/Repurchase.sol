pragma solidity ^0.5.9;

import "../lib/SafeMath.sol";

import "../token/RewardToken.sol";
import "../lib/Controller.sol";
import "../interface/IUniswapRouter.sol";


contract Repurchase is Controller {

    using SafeMath for uint;

    uint public amountIn;

    address public rewardToken;

    address public constant USDT = 0xa71EdC38d189767582C38A3145b5873052c3e47a;

    address public swapRouter;

    constructor(address _rewardToken) Controller() public {
        rewardToken = _rewardToken;
    }

    function setAmountIn(uint256 _newIn) public onlyController {
        amountIn = _newIn;
    }

    function setSwapRouter(address _address) onlyController external {
        swapRouter = _address;
    }

    function swapToken() onlyController public returns (uint){
        require(swapRouter != address(0), "swapRouter=0");
        uint balanceUSDT = IERC20(USDT).balanceOf(address(this));
        uint usdtAmount = amountIn;
        if (balanceUSDT < usdtAmount) {
            usdtAmount = balanceUSDT;
        }

        address[] memory path = new address[](2);
        path[0] = USDT;
        path[1] = rewardToken;

        IERC20(USDT).approve(swapRouter, usdtAmount);
        IUniswapRouter(swapRouter).swapExactTokensForTokens(
            usdtAmount,
            1,
            path,
            address(this),
            block.timestamp + 100
        );

        return IERC20(rewardToken).balanceOf(address(this));

    }


    function burnToken() public {
        uint _amount = IERC20(rewardToken).balanceOf(address(this));
        if (_amount > 0) {
            RewardToken(rewardToken).burn(_amount);
        }
    }

    function salvageToken(address _token) onlyController public {
        require(_token != USDT && _token != rewardToken, "use token");
        uint balance = IERC20(_token).balanceOf(address(this));

    }

}