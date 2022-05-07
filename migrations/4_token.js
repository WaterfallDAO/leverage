const Reservoir = artifacts.require("Reservoir");
const RewardToken = artifacts.require("RewardToken");
const RewardPool = artifacts.require("RewardPool");

let owner = "TCsEd19cjaULsRMSNw9pjHGoKXHVQA6652";

module.exports = async function (deployer, network, accounts) {
    if (network != "shasta" && network != "mainnet") {
        return;
    }
    await deployer.deploy(RewardToken);
    let rewardToken = await RewardToken.deployed();
    console.log("address:" + rewardToken.address);
    await deployer.deploy(Reservoir, rewardToken.address, "1963900", "864000");
    let reservoir = await Reservoir.deployed();
    // let lpToken = "";
    // let rewardToken = "";
    // let reservoir = "";
    // let feeManager = "";
    // await deployer.deploy(RewardPool, reservoir, rewardToken, lpToken, "1000", owner, feeManager);

};