pragma solidity ^0.5.9;

interface IComptroller {
    function refreshCompSpeeds() external;
}

contract RefreshSpeedsProxy {
    constructor(address comptroller) public {
        IComptroller(comptroller).refreshCompSpeeds();
    }
}
