pragma solidity ^0.5.9;

import "../lib/Controller.sol";
import "../interface/PriceOracle.sol";
import "../interface/ILinkOracle.sol";
import "../interface/IPair.sol";
import "../interface/IPoolView.sol";
import "../CErc20.sol";
import "../lib/ERC20Detailed.sol";
import "../lib/SafeMath.sol";

contract AssertPriceOracle is PriceOracle, Controller {
    event Log(string key, uint v);
    using SafeMath for uint;

    //underlying address => oracle address
    mapping(address => address) public underlyingOracles;
    //pair address => underlying address
    mapping(address => address) public justLpPairs;
    mapping(address => bool) public justLps;

    // lp => pool view
    mapping(address => address) public abeloLpViews;

    mapping(address => bool) public abeloLps;

    mapping(address => bool) public noDiffAddress;

    address public natvieAddress;
    uint public nativeDecimals = 6;
    uint public SCALE = 1e12;

    constructor(address _controller, address _nativeAddress) Controller() public {
        setController(_controller);
        natvieAddress = _nativeAddress;
    }


    function toUint(bytes32 inBytes) pure public returns (uint256 outUint) {
        return uint256(inBytes);
    }

    function setUnderlyingOracle(address underlying, address oracle) onlyController external {
        ILinkOracle(oracle).latestAnswer();
        underlyingOracles[underlying] = oracle;
    }

    function getUnderlyingPrice(CToken cToken) external view returns (uint){
        address _underlying = address(CErc20(address(cToken)).underlying());
        if (justLps[_underlying] == true) {
            return calJustLpPrice(_underlying);
        }
        if (abeloLps[_underlying] == true) {
            return calAbeloLpPrice(_underlying);
        }
        address oracle = underlyingOracles[_underlying];
        require(oracle != address(0), "oracle is 0");
        uint diff = 0;
        if (!noDiffAddress[_underlying]) {
            uint _underlyingDecimal = ERC20Detailed(_underlying).decimals();
            if (_underlyingDecimal > nativeDecimals) {
                diff = _underlyingDecimal.sub(nativeDecimals);
            }
        }
        if (diff == 0) {
            return toUint(ILinkOracle(oracle).latestAnswer()).mul(SCALE);
        } else {
            return toUint(ILinkOracle(oracle).latestAnswer()).mul(SCALE).div(10 ** diff);
        }

    }

    function getPriceFromOracle(address _address) external view returns (uint){
        address oracle = underlyingOracles[_address];
        return toUint(ILinkOracle(oracle).latestAnswer()).mul(SCALE);
    }

    function addAbeloPairView(address _lpAddress, address _poolView) onlyController external {
        //        require(IPoolView(_poolView).pool() != _lpAddress, "pool is error");
        abeloLps[_lpAddress] = true;
        abeloLpViews[_lpAddress] = _poolView;


    }

    function addNoDiffAddress(address _underlying) onlyController external {
        noDiffAddress[_underlying] = true;
    }

    function addJustLp(address _underlying, address _pairaddress) onlyController external {
        require(_underlying == IPair(_pairaddress).tokenAddress(), "pair is error");
        justLps[_pairaddress] = true;
        justLpPairs[_pairaddress] = _underlying;
    }

    function calJustLpPrice(address _pairAddress) public view returns (uint){
        address _underlying = justLpPairs[_pairAddress];

        require(underlyingOracles[_underlying] != address(0), "oracle is 0");

        uint _totalSupply = IPair(_pairAddress).totalSupply().div(10 ** IPair(_pairAddress).decimals());
        //        emit Log("_totalSupply",_totalSupply);
        uint _totalUnderlying = ERC20Detailed(_underlying).balanceOf(_pairAddress);

        //        emit Log("_totalUnderlying",_totalUnderlying);
        uint _totalTrx = _pairAddress.balance;
        //        emit Log("_totalTrx",_totalTrx);
        uint _underlyingDecimal = ERC20Detailed(_underlying).decimals();

        address oracle = underlyingOracles[_underlying];

        uint _underLyingPrice = uint(ILinkOracle(oracle).latestAnswer());

        uint _lpPerUnderlying =
        (_totalUnderlying.mul(_underLyingPrice)).div(_totalSupply.mul(10 ** _underlyingDecimal));

        address wtrxOracle = underlyingOracles[natvieAddress];

        uint _trxPrice = uint(ILinkOracle(wtrxOracle).latestAnswer());
        //        emit Log("_lpPerUnderlying",_lpPerUnderlying);

        uint _lpPerTrx = (_totalTrx.mul(_trxPrice)).div(_totalSupply.mul(10 ** nativeDecimals));


        return _lpPerUnderlying.add(_lpPerTrx).mul(SCALE);

    }

    function calAbeloLpPrice(address _lpAddress) public view returns (uint){

        address _poolView = abeloLpViews[_lpAddress];
        uint total;
        address[] memory tokens = IPoolView(_poolView).getCurrentTokens();

        for (uint i = 0; i < 2; i++) {
            address token = tokens[i];
            uint _lpPerToken = IPoolView(_poolView).getTokenAmountPerLp(token);
            address oracle = underlyingOracles[token];
            uint _tokenPrice = uint(ILinkOracle(oracle).latestAnswer());
            total = total.add(_lpPerToken.mul(_tokenPrice));
        }
        //abelo lp decimals is 18
        return total;
    }


}