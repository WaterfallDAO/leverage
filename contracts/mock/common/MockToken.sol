pragma solidity ^0.5.9;

import "../../lib/ERC20.sol";
import "../../lib/ERC20Detailed.sol";
import "../../lib/ERC20Burnable.sol";
import "../../lib/ERC20Mintable.sol";

contract MockToken is ERC20, ERC20Detailed, ERC20Mintable, ERC20Burnable {

  constructor() public ERC20Detailed("Mock Token", "MOCK", 18)  {
  }
}
