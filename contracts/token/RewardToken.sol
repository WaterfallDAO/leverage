pragma solidity ^0.5.9;
pragma experimental ABIEncoderV2;

import "../lib/ERC20.sol";
import "../lib/ERC20Detailed.sol";
import "../lib/Ownable.sol";
import "../lib/ERC20Burnable.sol";

contract RewardToken is ERC20, ERC20Detailed, ERC20Burnable, Ownable {

    uint public constant _totalSupply = 6100000e18;


    constructor () public ERC20Detailed("HF-BANK", "HF", 18) {
    }

    function mint(address _to) public onlyOwner {
        require(totalSupply() == 0, "mint once");
        _mint(_to, _totalSupply);
    }

}
