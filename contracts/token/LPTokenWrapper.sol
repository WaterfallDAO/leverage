pragma solidity ^0.5.0;

import "../lib/SafeMath.sol";
import "../lib/ERC20.sol";

contract LPTokenWrapper {
    using SafeMath for uint256;


    IERC20 public lpToken;

    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    function stake(uint256 amount) public {
        _totalSupply = _totalSupply.add(amount);
        _balances[msg.sender] = _balances[msg.sender].add(amount);
        lpToken.transferFrom(msg.sender, address(this), amount);
    }

    function withdraw(uint256 amount) public {
        _totalSupply = _totalSupply.sub(amount);
        _balances[msg.sender] = _balances[msg.sender].sub(amount);
        lpToken.transfer(msg.sender, amount);
    }

    function migrateStakeFor(address target, uint256 amountNewShare) internal  {
        _totalSupply = _totalSupply.add(amountNewShare);
        _balances[target] = _balances[target].add(amountNewShare);
    }
}
