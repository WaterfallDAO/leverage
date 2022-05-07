pragma solidity ^0.5.9;

import "./Ownable.sol";

contract Controller is Ownable {
    address private _controller;

    event SetController(address indexed previousController, address indexed newController);

    constructor()  Ownable() public {
        address msgSender = _msgSender();
        _controller = msgSender;
        emit SetController(address(0), _controller);

    }

    modifier onlyController() {
        require(isController(msg.sender), "!controller");
        _;
    }

    function controller() public view returns (address){
        return _controller;
    }

    function isController(address account) public view returns (bool) {
        return account == _controller;
    }

    function setController(address controller) public onlyOwner {
        require(controller != address(0), "controller is empty");
        emit SetController(controller, _controller);
        _controller = controller;
    }
}
