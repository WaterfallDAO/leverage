pragma solidity ^0.5.9;


import "../lib/ERC20.sol";
import "../lib/ERC20Detailed.sol";
import "../lib/Controller.sol";
import "../lib/SafeMath.sol";
import "../lib/IERC20.sol";
import "../lib/EnumerableSet.sol";
import "./RewardToken.sol";
import "./IRewardPool.sol";
import "../Comptroller.sol";

contract Reservoir is Controller {
    using SafeMath for uint256;
    using EnumerableSet for EnumerableSet.AddressSet;

    Comptroller public comptroller;

    uint256 poolLastRewardBlock;

    uint256 fundLastRewardBlock;

    struct PoolInfo {
        uint256 allocPoint; // How many allocation points assigned to this pool. dex to distribute per block.
        address contractAddress;
    }


    uint public DAY = 28800;
    // 30 days
    uint public duration = 30 * DAY;

    RewardToken public rewardToken;
    // Dev fund (25%, initially)
    uint public teamFundDivRate = 25e16;
    // gover fund (5%, initially)
    uint public goverFundDivRate = 5e16;
    // insurance fund (5%, initially)
    uint public insuranceFundDivRate = 5e16;
    uint public liquidityRate = 5e16;
    uint public comptrollerRate = 60e16;
    uint256 public MAX_RATE = 1e18;

    uint256 public tokenPerBlock = 0.31e18;
    // tokens created per block.
    uint256 public tokenPerBlockForReward;
    uint256 public MIN_TOKEN_REWARD = 0.031* 1e18;


    EnumerableSet.AddressSet private teamAddrs;

    address public governaddr;
    address public insuranceaddr;


    PoolInfo[] public poolInfo;

    // Total allocation points. Must be the sum of all allocation points in all pools.
    uint256 public totalAllocPoint = 0;
    uint256 decrement = 0;
    // The block number when PICKLE mining starts.
    uint256 public startBlock;
    uint256 public periodEndBlock;
    uint256 public comptrollerLastReward;

    // Events
    event Recovered(address token, uint256 amount);

    constructor(
        RewardToken _rewardToken,
        uint256 _startBlock,
        uint256 _duration
    ) Controller() public {
        periodEndBlock = _startBlock.add(_duration);
        require(periodEndBlock > block.number, "end is wrong");
        rewardToken = _rewardToken;
        startBlock = _startBlock;
        fundLastRewardBlock = _startBlock;
        duration = _duration;
        tokenPerBlockForReward = calTokenPerBlock(tokenPerBlock);

    }


    function calTokenPerBlock(uint256 _blockToken) view internal returns (uint256){
        uint256 _devFund = calRate(_blockToken, teamFundDivRate);
        uint256 _goverFund = calRate(_blockToken, goverFundDivRate);
        uint256 _insuranceFund = calRate(_blockToken, insuranceFundDivRate);
        return _blockToken.sub(_devFund).sub(_goverFund).sub(_insuranceFund);
    }

    function mintToken() onlyOwner public {
        rewardToken.mint(address(this));
    }

    function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }

    // Add a new lp to the pool. Can only be called by the owner.
    // XXX DO NOT add the same LP token more than once. Rewards will be messed up if you do.
    function add(
        address _contractAddress,
        uint256 _allocPoint
    ) public onlyController adjustProduct {
        uint256 length = poolInfo.length;
        for (uint256 pid = 0; pid < length; ++pid) {
            PoolInfo memory pool = poolInfo[pid];
            require(pool.contractAddress != _contractAddress, "contract is exist");
        }
        uint256 lastRewardBlock = block.number > startBlock
        ? block.number
        : startBlock;
        totalAllocPoint = totalAllocPoint.add(_allocPoint);
        poolInfo.push(
            PoolInfo(
            {
            allocPoint : _allocPoint,
            contractAddress : _contractAddress
            }
            )
        );
    }

    function set(
        uint256 _pid,
        uint256 _allocPoint
    ) public onlyController adjustProduct {
        totalAllocPoint = totalAllocPoint.sub(poolInfo[_pid].allocPoint).add(
            _allocPoint
        );
        poolInfo[_pid].allocPoint = _allocPoint;
    }

    modifier adjustProduct()  {
        if (block.number < startBlock) {
            return;
        }
        if (block.number >= periodEndBlock) {
            if (tokenPerBlock > MIN_TOKEN_REWARD) {
                tokenPerBlock = tokenPerBlock.mul(93).div(100);
            }
            if (tokenPerBlock < MIN_TOKEN_REWARD) {
                tokenPerBlock = MIN_TOKEN_REWARD;
            }

            periodEndBlock = block.number.add(duration);
        }

        if (comptrollerLastReward < block.number) {

            uint _reward = duration.mul(tokenPerBlock);

            uint goverFund = calRate(_reward, goverFundDivRate);
            uint insuranceFund = calRate(_reward, insuranceFundDivRate);
            uint teamFund = calRate(_reward, teamFundDivRate);
            uint liquidityFund = calRate(_reward, liquidityRate);

            uint distriReward = _reward.sub(goverFund.add(insuranceFund).add(teamFund).add(liquidityFund));
            if (address(comptroller) != address(0)) {
                safeTokenTransfer(address(comptroller), distriReward);
                Comptroller(comptroller)._setCompRate(calRate(tokenPerBlock, comptrollerRate));
                comptrollerLastReward = block.number.add(duration);
            }
        }
        _;
    }
    function calRate(uint _amount, uint rate) public view returns (uint){
        return _amount.mul(rate).div(1e18);
    }

    // Distribute the output of a cycle in advance
    //The token is distributed one day in advance
    function distributionToken() adjustProduct public {
        if (block.number < startBlock) {
            return;
        }
        if (poolLastRewardBlock > block.number) {
            return;
        }
        uint multiplier = 1;
        if (periodEndBlock > block.number) {
            multiplier = block.number - poolLastRewardBlock + DAY;
        }
        uint _reward = multiplier.mul(tokenPerBlock);
        uint liquidityFund = calRate(_reward, liquidityRate);

        uint length = poolInfo.length;
        for (uint pid = 0; pid < length; ++pid) {
            PoolInfo storage pool = poolInfo[pid];
            uint256 poolReward = liquidityFund.mul(pool.allocPoint).div(totalAllocPoint);
            safeTokenTransfer(pool.contractAddress, poolReward);
            IRewardPool(pool.contractAddress).notifyRewardAmount(poolReward);
        }
        poolLastRewardBlock = block.number + DAY;
    }

    // Safe pickle transfer function, just in case if rounding error causes pool to not have enough dex.
    function safeTokenTransfer(address _to, uint256 _amount) internal {
        uint256 pickleBal = rewardToken.balanceOf(address(this));
        if (_amount > pickleBal) {
            rewardToken.transfer(_to, pickleBal);
        } else {
            rewardToken.transfer(_to, _amount);
        }
    }

    // Distribute tokens according to teh speed of the block
    function claimFund() onlyController external {
        if (block.number <= fundLastRewardBlock) {
            return;
        }
        uint256 multiplier = block.number - fundLastRewardBlock;
        uint256 boxReward = multiplier.mul(tokenPerBlock);
        uint goverFund = calRate(boxReward, goverFundDivRate);
        uint insuranceFund = calRate(boxReward, insuranceFundDivRate);
        uint teamFund = calRate(boxReward, teamFundDivRate);
        rewardToken.transfer(governaddr, goverFund);
        rewardToken.transfer(insuranceaddr, insuranceFund);
        uint256 perDevFund = teamFund.div(teamAddrs.length());
        for (uint256 i = 0; i < teamAddrs.length() - 1; i++) {
            rewardToken.transfer(teamAddrs.get(i), perDevFund);
        }
        uint256 remainFund = teamFund.sub(perDevFund.mul(teamAddrs.length() - 1));
        rewardToken.transfer(teamAddrs.get(teamAddrs.length() - 1), remainFund);
        goverFund = 0;
        insuranceFund = 0;
        teamFund = 0;
        fundLastRewardBlock = block.number;
        distributionToken();

    }


    function setComptroller(address _address) onlyController external {
        comptroller = Comptroller(_address);
    }

    function addDev(address _devaddr) onlyController public {
        require(teamAddrs.length() < 50, "less 50");
        teamAddrs.add(_devaddr);
    }

    function removeDev(address _devaddr) onlyController public {
        teamAddrs.remove(_devaddr);
    }

    function contains(address _dev) public view returns (bool){
        return teamAddrs.contains(_dev);
    }

    function length() public view returns (uint256){
        return teamAddrs.length();
    }

    function setTeamFundDivRate(uint256 _teamFundDivRate) onlyController public {
        require(_teamFundDivRate <= 25e16, "rate too large");
        teamFundDivRate = _teamFundDivRate;
        comptrollerRate
        = MAX_RATE.sub(teamFundDivRate).sub(goverFundDivRate).sub(insuranceFundDivRate).sub(liquidityRate);
    }

    function setLiquidityRate(uint _rate) onlyController external {
        require(_rate <= 10e16, "rate too large");
        liquidityRate = _rate;
        comptrollerRate =
        MAX_RATE.sub(teamFundDivRate).sub(goverFundDivRate).sub(insuranceFundDivRate).sub(liquidityRate);
    }

    function insurance(address _insuranceaddr) onlyController public {
        insuranceaddr = _insuranceaddr;
    }

    function setInsuranceFundDivRate(uint256 _insuranceFundDivRate) onlyController public {
        require(_insuranceFundDivRate <= 5e16, "rate too large");
        insuranceFundDivRate = _insuranceFundDivRate;
        comptrollerRate
        = MAX_RATE.sub(teamFundDivRate).sub(goverFundDivRate).sub(insuranceFundDivRate).sub(liquidityRate);
    }

    function gover(address _goveraddr) onlyController public {
        governaddr = _goveraddr;
    }

    function setGoverFundDivRate(uint256 _goverFundDivRate) onlyController public {
        require(_goverFundDivRate <= 5e16, "rate too large");
        goverFundDivRate = _goverFundDivRate;
        comptrollerRate
        = MAX_RATE.sub(teamFundDivRate).sub(goverFundDivRate).sub(insuranceFundDivRate).sub(liquidityRate);
    }

}
