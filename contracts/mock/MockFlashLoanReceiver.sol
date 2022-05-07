pragma solidity ^0.5.0;

import "../lib/SafeMath.sol";

import "../interface/IFlashLoanReceiver.sol";
import "../lib/ERC20Mintable.sol";
import "../lib/NativeAddressLib.sol";

contract MockFlashLoanReceiver is IFlashLoanReceiver {

    using SafeMath for uint256;
    event ExecutedWithFail(address _reserve, uint256 _amount, uint256 _fee);
    event ExecutedWithSuccess(address _reserve, uint256 _amount, uint256 _fee);


    bool failExecution = false;

    constructor() public {
    }

    function setFailExecutionTransfer(bool _fail) public {
        failExecution = _fail;
    }


    function getBalanceInternal(address _target, address _reserve) internal view returns (uint256) {
        if (_reserve == NativeAddressLib.nativeAddress()) {

            return _target.balance;
        }

        return IERC20(_reserve).balanceOf(_target);

    }


    function transferInternal(address payable _destination, address _reserve, uint256 _amount) internal {
        if (_reserve == NativeAddressLib.nativeAddress()) {
            //solium-disable-next-line
            _destination.call.value(_amount)("");
            return;
        }
        IERC20(_reserve).transfer(_destination, _amount);


    }


    function executeOperation(
        address _reserve,
        address _cToken,
        uint256 _amount,
        uint256 _fee,
        bytes memory _params) public {
        //mint to this contract the specific amount
        ERC20Mintable token = ERC20Mintable(_reserve);


        //check the contract has the specified balance
        require(_amount <= getBalanceInternal(address(this), _reserve), "Invalid balance for the contract");

        if (failExecution) {
            emit ExecutedWithFail(_reserve, _amount, _fee);
            return;
        }

        //execution does not fail - mint tokens and return them to the _destination
        //note: if the reserve is eth, the mock contract must receive at least _fee ETH before calling executeOperation

        //        if (_reserve != NativeAddressLib.nativeAddress()) {
        //            token.mint(address(this), _fee);
        //        }
        //returning amount + fee to the destination
        IERC20(_reserve).transfer(_cToken, _amount.add(_fee));
        emit ExecutedWithSuccess(_reserve, _amount, _fee);
    }
}
