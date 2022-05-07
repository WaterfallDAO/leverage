const Utils = require("./Utils.js");
const BigNumber = require("bignumber.js");

const RewardToken = artifacts.require("RewardToken");
const RewardPool = artifacts.require("RewardPool");

const MockToken = artifacts.require("MockToken");

const {time, expectRevert} = require("@openzeppelin/test-helpers");
const FeeManager = artifacts.require("FeeManager");
const Reservoir = artifacts.require('Reservoir');

BigNumber.config({DECIMAL_PLACES: 0});

contract("reward pool Test", function (accounts) {
    describe("Basic settings", function () {
        let zeroAddress = "0x0000000000000000000000000000000000000000";
        let governance = accounts[0];
        let rewardCollector = accounts[1];
        let farmer1 = accounts[2];
        let strategy = accounts[3];
        let rewardDistribution = accounts[4];
        let farmer2 = accounts[5];
        // removing the last few digits when comparing, since we have 18
        // so this should be fine
        const removePrecision = 1000000;

        let underlying;
        let lp;
        let rewardPool;
        let rewardToken;
        let rewardDuration = 7;
        let tokenPrecision = new BigNumber(10).pow(18);
        let totalReward = new BigNumber(2500).times(tokenPrecision);

        const farmerBalance = "95848503450";

        beforeEach(async function () {

            // create the reward token
            rewardToken = await RewardToken.new({
                from: governance,
            });
            await rewardToken.mint(governance);
            lp = await MockToken.new({from: governance});
            this.feeManager = await FeeManager.new();
            let lastBlock = await time.latestBlock();
            this.reservoir = await Reservoir.new(rewardToken.address, lastBlock, '10');
            rewardPool = await RewardPool.new(
                this.reservoir.address,
                rewardToken.address,
                lp.address,
                rewardDuration,
                rewardDistribution,
                this.feeManager.address,
                {from: governance}
            );
            Utils.assertBNEq(
                await rewardToken.balanceOf(rewardPool.address),
                0
            );
            await rewardToken.transfer(rewardPool.address, totalReward, {from: governance});

            Utils.assertBNEq(
                await rewardToken.balanceOf(rewardPool.address),
                totalReward
            );
            // create the underlying token
            underlying = await MockToken.new({from: governance});
            await underlying.mint(farmer1, farmerBalance, {from: governance});
            await underlying.mint(farmer2, farmerBalance, {from: governance});
            assert.equal(
                farmerBalance,
                (await underlying.balanceOf(farmer1)).toString()
            );


        });

        it("Should not be able to get reward if pool not notified", async function () {
            await lp.mint(farmer1, farmerBalance);
            await lp.approve(rewardPool.address, farmerBalance, {from: farmer1});
            await rewardPool.stake(farmerBalance, {from: farmer1});

            // The farmer should still be able to stake and see his stake
            assert.equal(farmerBalance, await rewardPool.balanceOf(farmer1));

            // time passes
            await time.increase(3000);
            const startingBlock = await time.latestBlock();
            const endBlock = startingBlock.addn(100);
            await time.advanceBlockTo(endBlock);

            // but there's no reward after exit.
            await rewardPool.exit({from: farmer1});
            assert.equal(0, await rewardToken.balanceOf(farmer1));
        });

        it("One single stake. The farmer takes every reward after the duration is over", async function () {

            await lp.mint(farmer1, farmerBalance);
            assert.equal(farmerBalance, await lp.balanceOf(farmer1));

            await lp.approve(rewardPool.address, farmerBalance, {from: farmer1});
            await rewardPool.stake(farmerBalance, {from: farmer1});
            // The farmer should still be able to stake and see his stake
            assert.equal(farmerBalance, await rewardPool.balanceOf(farmer1));

            // notifyReward
            await expectRevert(rewardPool.notifyRewardAmount(totalReward, {
                from: farmer1,
            }), "only controller and reservoir");
            await rewardPool.setController(rewardDistribution, {from: governance});
            await rewardPool.notifyRewardAmount(totalReward, {
                from: rewardDistribution,
            });
            // time passes
            let lastBlock = await time.latestBlock();
            console.log("lastBlock:" + lastBlock);

            await time.advanceBlockTo('137');

            // get the reward Rate and period
            let rewardRate = new BigNumber(await rewardPool.rewardRate());

            let period = new BigNumber(rewardDuration);

            // make sure the time has passed
            Utils.assertBNGt(
                await time.latest(),
                await rewardPool.periodFinish()
            );


            await rewardPool.exit({from: farmer1});
            let farmerReward = new BigNumber(await rewardToken.balanceOf(farmer1));
            // there is a off-by-one here, so using ApproxEq
            Utils.assertApproxBNEq(
                rewardRate.times(period),
                farmerReward,
                removePrecision
            );
        });

        it("One single farmer, added reward and extended period", async function () {
            await lp.mint(farmer1, farmerBalance);
            await lp.approve(rewardPool.address, farmerBalance, {from: farmer1});
            await rewardPool.stake(farmerBalance, {from: farmer1});
            // The farmer should still be able to stake and see his stake
            assert.equal(farmerBalance, await rewardPool.balanceOf(farmer1));

            assert.equal(await rewardPool.duration().valueOf(), rewardDuration);

            console.log("periodFinish:" + await rewardPool.periodFinish().valueOf());
            // notifyReward
            let result = await rewardPool.notifyRewardAmount(totalReward, {
                from: rewardDistribution,
            });
            console.log("periodFinish:" + await rewardPool.periodFinish().valueOf());
            let poolStartTime = await time.latestBlock();
            let lastBlock = await time.latestBlock();
            console.log("lastBlock:" + lastBlock);
            await time.advanceBlockTo("153");

            // get the reward Rate
            let oldRewardRate = new BigNumber(await rewardPool.rewardRate());

            await rewardToken.transfer(rewardPool.address, totalReward, {from: governance});


            await rewardPool.setController(rewardDistribution, {from: governance});
            await rewardPool.notifyRewardAmount(totalReward, {
                from: rewardDistribution,
            });

            lastBlock = await time.latestBlock();
            let poolResetTime = new BigNumber(lastBlock);

            Utils.assertBNEq(
                poolResetTime.plus(rewardDuration),
                await rewardPool.periodFinish()
            );

            // await time.advanceBlockTo(lastBlock + 3);
            await time.advanceBlockTo("164");
            // get the reward Rate
            let newRewardRate = new BigNumber(await rewardPool.rewardRate());
            lastBlock = await time.latestBlock();
            console.log("lastBlock:" + lastBlock);

            console.log("periodFinish:" + await rewardPool.periodFinish().valueOf());
            // make sure the time has passed
            Utils.assertBNGt(
                await time.latestBlock(),
                await rewardPool.periodFinish()
            );

            let poolFinishTime = await rewardPool.periodFinish();

            // the only user should get most rewards
            // there will be some dust in the contract
            await rewardPool.exit({from: farmer1});
            let farmerReward = new BigNumber(await rewardToken.balanceOf(farmer1));

            console.log("poolFinishTime:" + poolFinishTime);
            console.log("poolResetTime:" + poolResetTime);
            console.log("poolResetTime:" + poolResetTime);
            console.log("poolStartTime:" + poolStartTime);
            // using ApproxEq to get rid of small dust errors
            Utils.assertApproxBNEq(
                newRewardRate
                    .times(poolFinishTime - poolResetTime)
                    .plus(oldRewardRate.times(poolResetTime - poolStartTime)),
                farmerReward,
                removePrecision
            );
        });

        it("Two farmers who staked the same amount right from the beginning", async function () {
            await lp.mint(farmer1, farmerBalance);
            await lp.approve(rewardPool.address, farmerBalance, {from: farmer1});
            await rewardPool.stake(farmerBalance, {from: farmer1});
            await lp.mint(farmer2, farmerBalance);
            await lp.approve(rewardPool.address, farmerBalance, {from: farmer2});
            await rewardPool.stake(farmerBalance, {from: farmer2});
            // The farmer should still be able to stake and see his stake
            assert.equal(farmerBalance, await rewardPool.balanceOf(farmer1));
            assert.equal(farmerBalance, await rewardPool.balanceOf(farmer2));

            // notifyReward
            await rewardPool.setController(rewardDistribution, {from: governance});
            await rewardPool.notifyRewardAmount(totalReward, {
                from: rewardDistribution,
            });
            let lastBlock = await time.latestBlock();
            console.log("lastBlock:" + lastBlock);
            await time.advanceBlockTo("195");

            // get the reward Rate and period
            let rewardRate = new BigNumber(await rewardPool.rewardRate());
            let period = new BigNumber(rewardDuration);

            // make sure the time has passed
            Utils.assertBNGt(
                await time.latestBlock(),
                await rewardPool.periodFinish()
            );

            // the only user should get most rewards
            // there will be some dust in the contract
            await rewardPool.exit({from: farmer1});
            await rewardPool.exit({from: farmer2});
            let farmer1Reward = new BigNumber(await rewardToken.balanceOf(farmer1));
            let farmer2Reward = new BigNumber(await rewardToken.balanceOf(farmer2));

            // using ApproxEq
            Utils.assertApproxBNEq(
                rewardRate.times(period).div(2),
                farmer1Reward,
                removePrecision
            );
            Utils.assertApproxBNEq(
                rewardRate.times(period).div(2),
                farmer2Reward,
                removePrecision
            );
        });

        it("Two farmers who staked the same amount, but one later.", async function () {
            await lp.mint(farmer1, farmerBalance);
            await lp.approve(rewardPool.address, farmerBalance, {from: farmer1});
            await rewardPool.stake(farmerBalance, {from: farmer1});
            // The farmer should still be able to stake and see his stake
            assert.equal(farmerBalance, await rewardPool.balanceOf(farmer1));

            // notifyReward
            await rewardPool.setController(rewardDistribution, {from: governance});
            await rewardPool.notifyRewardAmount(totalReward, {
                from: rewardDistribution,
            });
            let poolStartTime = await time.latestBlock();
            let lastBlock = await time.latestBlock();
            console.log("lastBlock:" + lastBlock);

            await time.advanceBlockTo("214");
            await lp.mint(farmer2, farmerBalance);
            await lp.approve(rewardPool.address, farmerBalance, {from: farmer2});
            await rewardPool.stake(farmerBalance, {from: farmer2});
            let farmer2StakeTime = await time.latestBlock();
            assert.equal(farmerBalance, await rewardPool.balanceOf(farmer2));

            lastBlock = await time.latestBlock();
            console.log("lastBlock:" + lastBlock);

            await time.advanceBlockTo("221");

            // get the reward Rate and period
            let rewardRate = new BigNumber(await rewardPool.rewardRate());
            let period = new BigNumber(rewardDuration);
            let periodFinish = await rewardPool.periodFinish();

            let phase1 = new BigNumber(farmer2StakeTime - poolStartTime);
            let phase2 = new BigNumber(periodFinish - farmer2StakeTime);

            // make sure the time has passed
            Utils.assertBNGt(
                await time.latest(),
                await rewardPool.periodFinish()
            );

            // the only user should get most rewards
            // there will be some dust in the contract
            await rewardPool.exit({from: farmer1});
            await rewardPool.exit({from: farmer2});
            let farmer1Reward = new BigNumber(await rewardToken.balanceOf(farmer1));
            let farmer2Reward = new BigNumber(await rewardToken.balanceOf(farmer2));

            // using ApproxEq
            Utils.assertApproxBNEq(
                rewardRate.times(phase1).plus(rewardRate.div(2).times(phase2)),
                farmer1Reward,
                removePrecision
            );
            Utils.assertApproxBNEq(
                rewardRate.times(phase2).div(2),
                farmer2Reward,
                removePrecision
            );
        });
    });
});
