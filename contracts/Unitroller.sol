pragma solidity ^0.5.9;

import "./ErrorReporter.sol";
import "./interface/ComptrollerStorage.sol";
/**
 * @title ComptrollerCore
 * @dev Storage for the comptroller is at this address, while execution is delegated to the `comptrollerImplementation`.
 * CTokens should reference this contract as their comptroller.
 */
contract Unitroller is UnitrollerAdminStorage, ComptrollerErrorReporter {


    event NewImplementation(address oldImplementation, address newImplementation);

    constructor() public {
        // Set admin to caller
        admin = msg.sender;
    }

    /*** Admin Functions ***/
    function _setImplementation(address newImplementation) public returns (uint) {

        if (msg.sender != admin) {
            return fail(Error.UNAUTHORIZED, FailureInfo.SET_PENDING_IMPLEMENTATION_OWNER_CHECK);
        }

        address oldPendingImplementation = comptrollerImplementation;

        comptrollerImplementation = newImplementation;

        emit NewImplementation(oldPendingImplementation, newImplementation);

        return uint(Error.NO_ERROR);
    }


    function _setAdmin(address newAdmin) public returns (uint) {
        // Check caller = admin
        if (msg.sender != admin) {
            return fail(Error.UNAUTHORIZED, FailureInfo.SET_PENDING_ADMIN_OWNER_CHECK);
        }

        // Store pendingAdmin with value newPendingAdmin
        admin = newAdmin;

        return uint(Error.NO_ERROR);
    }

    function() payable external {
        // delegate all other functions to current implementation
        (bool success,) = comptrollerImplementation.delegatecall(msg.data);

        assembly {
            let free_mem_ptr := mload(0x40)
            returndatacopy(free_mem_ptr, 0, returndatasize)

            switch success
            case 0 {revert(free_mem_ptr, returndatasize)}
            default {return (free_mem_ptr, returndatasize)}
        }
    }
}
