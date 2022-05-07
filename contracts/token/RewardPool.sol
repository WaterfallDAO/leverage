pragma solidity ^0.5.9;

import "../lib/ERC20.sol";
import "../lib/ERC20Detailed.sol";
import "../lib/Controller.sol";
import "../lib/Math.sol";
import "../lib/SafeMath.sol";
import "../lib/IERC20.sol";
import "../lib/EnumerableSet.sol";
import "./RewardToken.sol";
import "./LPTokenWrapper.sol";
import "../lib/Controller.sol";
import "./Reservoir.sol";


contract RewardPool is LPTokenWrapper, Controller {

    IERC20 public rewardToken;
    uint256 public duration; // making it not a constant is less gas efficient, but portable

    uint256 public periodFinish = 0;
    uint256 public rewardRate = 0;
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;

    uint256 public exitFee = 3e16;
    address public feeManager;
    uint public exitFund = 0;

    address public reservoirAddress;

    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    mapping(address => bool) smartContractStakers;


    event RewardAdded(uint256 reward);
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardDenied(address indexed user, uint256 reward);
    event SmartContractRecorded(address indexed smartContractAddress, address indexed smartContractInitiator);

    // Harvest Migration
    event Migrated(address indexed account, uint256 legacyShare, uint256 newShare);

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = lastTimeRewardApplicable();
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    constructor(
        address _reservoirAddress,
        address _rewardToken,
        address _lpToken,
        uint256 _duration,
        address _controller,
        address _feeManager
    ) public
    Controller(){
        reservoirAddress = _reservoirAddress;
        rewardToken = IERC20(_rewardToken);
        lpToken = IERC20(_lpToken);
        feeManager = _feeManager;
        duration = _duration;
        setController(_controller);
    }

    function setExitFee(uint _fee) public onlyController {
        require(_fee <= 1e17, "fee too much");
        exitFee = _fee;
    }

    function lastTimeRewardApplicable() public view returns (uint256) {
        return Math.min(block.number, periodFinish);
    }

    function rewardPerToken() public view returns (uint256) {
        if (totalSupply() == 0) {
            return rewardPerTokenStored;
        }
        return
        rewardPerTokenStored.add(
            lastTimeRewardApplicable()
            .sub(lastUpdateTime)
            .mul(rewardRate)
            .mul(1e18)
            .div(totalSupply())
        );
    }

    function earned(address account) public view returns (uint256) {
        return
        balanceOf(account)
        .mul(rewardPerToken().sub(userRewardPerTokenPaid[account]))
        .div(1e18)
        .add(rewards[account]);
    }

    // stake visibility is public as overriding LPTokenWrapper's stake() function
    function stake(uint256 amount) public updateReward(msg.sender) {
        require(amount > 0, "Cannot stake 0");
        super.stake(amount);
        emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount) public updateReward(msg.sender) {
        require(amount > 0, "Cannot withdraw 0");
        uint exitAmount = amount.mul(exitFee).div(1e18);
        exitFund = exitFund.add(exitAmount);
        uint _amount = amount.sub(exitAmount);
        super.withdraw(_amount);
        emit Withdrawn(msg.sender, amount);
    }

    function exit() external {
        withdraw(balanceOf(msg.sender));
        getReward();
    }

    function pushReward(address recipient) public updateReward(recipient) onlyController {
        uint256 reward = earned(recipient);
        if (reward > 0) {
            rewards[recipient] = 0;
            rewardToken.transfer(recipient, reward);
            emit RewardPaid(recipient, reward);

        }
    }

    function getReward() public updateReward(msg.sender) {
        uint256 reward = earned(msg.sender);
        if (reward > 0) {
            rewards[msg.sender] = 0;
            // If it is a normal user and not smart contract,
            // then the requirement will pass
            // If it is a smart contract, then
            // make sure that it is not on our greyList.
            if (tx.origin == msg.sender) {
                rewardToken.transfer(msg.sender, reward);
                emit RewardPaid(msg.sender, reward);
            } else {
                emit RewardDenied(msg.sender, reward);
            }
            Reservoir(reservoirAddress).distributionToken();
        }
    }


    function claimFee() public {
        lpToken.transfer(feeManager, exitFund);
        exitFund = 0;
    }


    function notifyRewardAmount(uint256 reward)
    external
    updateReward(address(0))
    {
        require(msg.sender == controller() || msg.sender == reservoirAddress, "only controller and reservoir");

        require(reward < uint(- 1) / 1e18, "the notified reward cannot invoke multiplication overflow");

        if (block.number >= periodFinish) {
            rewardRate = reward.div(duration);
        } else {
            uint256 remaining = periodFinish.sub(block.number);

            uint256 leftover = remaining.mul(rewardRate);
            rewardRate = reward.add(leftover).div(duration);
        }
        lastUpdateTime = block.number;
        periodFinish = block.number.add(duration);
        emit RewardAdded(reward);
    }

    function setReservoir(address _reservoir) onlyController public {
        require(_reservoir != address(0), "reservoir is not 0");
        reservoirAddress = _reservoir;

    }
}
