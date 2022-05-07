const {expectRevert, time} = require('@openzeppelin/test-helpers');
const RewardToken = artifacts.require('RewardToken');
const Reservoir = artifacts.require('Reservoir');
const MockToken = artifacts.require('MockBurnToken');
const RewardPool = artifacts.require("RewardPool");
const ComptrollerMock = artifacts.require("ComptrollerMock");
const FeeManager = artifacts.require("FeeManager");

contract('reward pool test', ([alice, bob, _gover, _insurance, _dev, minter, rewardDistribution]) => {
    const {toWei} = web3.utils;
    const rewardDuration = '10';
    describe('With ERC/LP token added to the field', () => {
        beforeEach(async () => {

            this.lp = await MockToken.new('LPToken', 'LP', 8, {from: minter});
            await this.lp.mint(minter, '10000000000', {from: minter});
            await this.lp.transfer(alice, '1000', {from: minter});
            await this.lp.transfer(bob, '1000', {from: minter});
            await this.lp.transfer(_insurance, '1000', {from: minter});

            this.lp2 = await MockToken.new('LPToken2', 'LP2', 6, {from: minter});
            await this.lp2.mint(minter, '10000000000', {from: minter});
            await this.lp2.transfer(alice, '1000', {from: minter});
            await this.lp2.transfer(bob, '1000', {from: minter});
            await this.lp2.transfer(_insurance, '1000', {from: minter});


            this.feeManager = await FeeManager.new();
            this.rewardToken = await RewardToken.new({from: alice});
            let lastBlock = await time.latestBlock();
            this.reservoir = await Reservoir.new(this.rewardToken.address, lastBlock, '10', {from: alice});
            await this.rewardToken.transferOwnership(this.reservoir.address, {from: alice});
            await this.reservoir.mintToken({from: alice});

            this.rewardPool = await RewardPool.new(
                this.reservoir.address,
                this.rewardToken.address,
                this.lp.address,
                rewardDuration,
                rewardDistribution,
                this.feeManager.address
            );


            this.rewardPool2 = await RewardPool.new(
                this.reservoir.address,
                this.rewardToken.address,
                this.lp2.address,
                rewardDuration,
                rewardDistribution,
                this.feeManager.address
            );

            this.comptroller = await ComptrollerMock.new();

        });

        it('should allow  withdraw', async () => {
            // 100 per block farming rate starting at block 100 with bonus until block 1000
            let lastBlock = await time.latestBlock();
            // this.reservoir = await await Reservoir.new(this.rewardToken.address, lastBlock, '10', {from: alice});
            this.reservoir.gover(_gover);
            this.reservoir.addDev(_dev);
            await this.reservoir.setComptroller(this.comptroller.address);
            await this.lp.approve(this.rewardPool.address, '1000', {from: bob});
            await this.rewardPool.stake('100', {from: bob});
            assert.equal((await this.lp.balanceOf(bob)).valueOf(), '900');
            await this.rewardPool.exit({from: bob});
            assert.equal((await this.lp.balanceOf(bob)).valueOf(), '997');
        });

        it('should give out token only after farming time', async () => {
            // 100 per block farming rate starting at block 100 with bonus until block 1000
            this.rewardToken = await RewardToken.new({from: alice});
            this.reservoir = await await Reservoir.new(this.rewardToken.address, '100', '5', {from: alice});
            this.rewardPool = await RewardPool.new(
                this.reservoir.address,
                this.rewardToken.address,
                this.lp.address,
                rewardDuration,
                rewardDistribution,
                this.feeManager.address
            );
            await this.reservoir.gover(_gover);
            await this.reservoir.addDev(_dev);
            await this.reservoir.insurance(_insurance);

            await this.reservoir.setComptroller(this.comptroller.address);

            await this.reservoir.distributionToken();

            assert.equal(await this.reservoir.periodEndBlock().valueOf(), "105");

            await this.rewardToken.transferOwnership(this.reservoir.address, {from: alice});
            await this.reservoir.mintToken();

            await this.reservoir.add(this.rewardPool.address, '100');

            await this.lp.approve(this.rewardPool.address, '1000', {from: bob});
            await this.rewardPool.stake('100', {from: bob});
            await time.advanceBlockTo('89');
            await this.rewardPool.stake('1', {from: bob}); // block 90
            assert.equal((await this.rewardToken.balanceOf(bob)).valueOf(), '0');
            await time.advanceBlockTo('94');
            await this.rewardPool.stake('1', {from: bob}); // block 95
            assert.equal((await this.rewardToken.balanceOf(bob)).valueOf(), '0');
            await time.advanceBlockTo('99');
            await this.rewardPool.stake('1', {from: bob}); // block 100
            assert.equal((await this.rewardToken.balanceOf(bob)).valueOf(), '0');


            await time.advanceBlockTo('105');

            // console.log("pendingToken:" + (await this.reservoir.pendingToken('0', bob).valueOf()))

            console.log("tokenPerBlock:" + (await this.reservoir.tokenPerBlock()).valueOf());

            await this.rewardPool.stake('1', {from: bob});

            // console.log("deposit pendingToken:" + (await this.reservoir.pendingToken('0', bob)))
            console.log("totalSupply:" + (await this.rewardToken.totalSupply()).valueOf());
            console.log("chef balance:" + (await this.rewardToken.balanceOf(this.reservoir.address)).valueOf());
            console.log("tokenPerBlock:" + (await this.reservoir.tokenPerBlock()).valueOf());
            console.log("bob balance:" + (await this.rewardToken.balanceOf(_gover)).valueOf());


            // assert.equal((await this.rewardToken.balanceOf(_gover)).valueOf(), '8459821428571428');
            // await time.advanceBlockTo('106');
            await this.rewardPool.stake('1', {from: bob});
            console.log("bob 105 balance:" + (await this.rewardToken.balanceOf(bob)).valueOf());

            // console.log("sfiPerBlock:"+(await this.reservoir.sfiPerBlock()).valueOf());
            await this.rewardPool.stake('1', {from: bob}); // block 108
            console.log("governaddr:" + await this.reservoir.governaddr());
            console.log("insuranceaddr:" + await this.reservoir.insuranceaddr());
            assert.equal((await this.reservoir.contains(_dev)).valueOf(), true);
            await this.reservoir.claimFund({from: alice});// block 109

            assert.equal((await this.rewardToken.balanceOf(_gover)).valueOf(), toWei('0.1395'));
            assert.equal((await this.rewardToken.balanceOf(_dev)).valueOf(), toWei('0.6975'));
            assert.equal((await this.rewardToken.balanceOf(_insurance)).valueOf(), toWei('0.1395'));
            assert.equal((await this.rewardToken.totalSupply()).valueOf(), toWei('6100000'));
        });
        //
        //
        it('reward test', async () => {
            // 100 per block farming rate starting at block 100 with bonus until block 1000
            this.rewardToken = await RewardToken.new({from: alice});
            let lastBlock = await time.latestBlock();
            await expectRevert(Reservoir.new(this.rewardToken.address, '23', '5'), "end is wrong");
            this.reservoir = await Reservoir.new(this.rewardToken.address, '235', '6');

            await this.reservoir.insurance(_insurance);

            await this.reservoir.setComptroller(this.comptroller.address);
            assert.equal(await this.reservoir.owner().valueOf(), alice);
            for (let i = 0; i < 100; i++) {
                await this.reservoir.addDev(_dev);
            }
            await this.reservoir.gover(_gover);
            await this.reservoir.addDev(_dev);//224
            await this.rewardToken.transferOwnership(this.reservoir.address, {from: alice});

            assert.equal(await this.rewardToken.owner().valueOf(), this.reservoir.address);
            assert.equal(await this.reservoir.owner().valueOf(), alice);

            await this.reservoir.mintToken({from: alice});

            assert.equal(toWei('0.31'), await this.reservoir.tokenPerBlock().valueOf());
            assert.equal('235', await this.reservoir.startBlock().valueOf());
            this.rewardPool = await RewardPool.new(
                this.reservoir.address,
                this.rewardToken.address,
                this.lp.address,
                "10",
                rewardDistribution,
                this.feeManager.address
            );
            console.log("this.rewardPool.address:" + this.rewardPool.address);
            await this.reservoir.add(this.rewardPool.address, '100');
            let poolinfo = await this.reservoir.poolInfo(0).valueOf();
            console.log("poolinfo:" + poolinfo.contractAddress);
            lastBlock = await time.latestBlock();
            console.log("lastBlock:" + lastBlock);
            let _rewardPoolBal = await this.rewardToken.balanceOf(this.rewardPool.address).valueOf();
            assert.equal(_rewardPoolBal, toWei("0"));

            await this.reservoir.distributionToken();

            console.log("this.rewardPool.address:" + this.rewardPool.address);
            _rewardPoolBal = await this.rewardToken.balanceOf(this.rewardPool.address).valueOf();
            assert.equal(_rewardPoolBal, toWei("450.1045"));
            await expectRevert(this.rewardPool.notifyRewardAmount(_rewardPoolBal), "only controller and reservoir");
            // await this.rewardPool.notifyRewardAmount(_rewardPoolBal, {from: rewardDistribution});

            // assert.equal(await this.rewardPool.rewardRate().valueOf(), toWei("2700.627"));
            assert.equal(toWei('0.31'), await this.reservoir.tokenPerBlock().valueOf());

            assert.equal('241', await this.reservoir.periodEndBlock().valueOf());


            await expectRevert(this.reservoir.mintToken({from: alice}), "mint once");
            lastBlock = await time.latestBlock();
            console.log("lastBlock:" + lastBlock);

            lastBlock = await time.latestBlock();
            console.log("lastBlock:" + lastBlock);
            await time.advanceBlockTo("244");
            await this.reservoir.distributionToken();

            assert.equal(_rewardPoolBal, toWei("450.1045"));

            assert.equal('251', await this.reservoir.periodEndBlock().valueOf());
            await this.lp.approve(this.rewardPool.address, '1000', {from: bob});

            await this.rewardPool.stake('100', {from: bob});

            assert.equal('0', await this.rewardToken.balanceOf(bob).valueOf())

            // assert.equal(toWei('9.75'), await this.reservoir.pendingToken('0', bob).valueOf());
            // assert.equal(toWei('7.8'), await this.reservoir.pendingToken('0', bob).valueOf())
            //230
            await this.rewardPool.stake('100', {from: bob});
            await this.rewardPool.stake('100', {from: bob});//245

            assert.equal(await this.rewardPool.totalSupply().valueOf(), "300");
            let lastTimeRewardApplicable = await this.rewardPool.lastTimeRewardApplicable().valueOf();
            let lastUpdateTime = await this.rewardPool.lastUpdateTime().valueOf();
            console.log("lastTimeRewardApplicable:" + lastTimeRewardApplicable);
            console.log("lastUpdateTime:" + lastUpdateTime);


            assert.equal(await this.rewardPool.rewardPerTokenStored().valueOf(), toWei("675156750000000000"));
            assert.equal(await this.rewardPool.rewardPerToken().valueOf(), toWei("675156750000000000"));

            lastBlock = await time.latestBlock();
            assert.equal('249', lastBlock);


            assert.equal('251', await this.reservoir.periodEndBlock().valueOf());
            assert.equal(toWei('0.2883'), await this.reservoir.tokenPerBlock().valueOf());

            assert.equal(await this.rewardPool.earned(bob).valueOf(), toWei("90.0209"));

            await this.rewardPool.getReward({from: bob});

            assert.equal(toWei("90.0209"), await this.rewardToken.balanceOf(bob).valueOf())

            await this.rewardPool.stake('1', {from: bob});

            assert.equal('251', await this.reservoir.periodEndBlock().valueOf());
            await this.rewardPool.stake('1', {from: bob});
            await this.rewardPool.stake('1', {from: bob});

            assert.equal(toWei('0.2883'), await this.reservoir.tokenPerBlock().valueOf());

            await this.rewardPool.stake('1', {from: bob});//241

            await this.reservoir.insurance(_insurance);
            await this.reservoir.claimFund();
            assert.equal(toWei('0.302715'), await this.rewardToken.balanceOf(_insurance).valueOf())
            assert.equal(toWei('0.302715'), await this.rewardToken.balanceOf(_gover).valueOf())
            assert.equal(toWei('1.513575'), await this.rewardToken.balanceOf(_dev).valueOf())


        });
        //
        // it('test min per block token', async () => {
        //     let lastBlock = await time.latestBlock();
        //     console.log("block:" + lastBlock);
        //     this.rewardToken = await RewardToken.new({from: alice});
        //     this.reservoir = await Reservoir.new(this.rewardToken.address, '278', '1', {from: alice});
        //     this.rewardPool = await RewardPool.new(
        //         this.reservoir.address,
        //         this.rewardToken.address,
        //         this.lp.address,
        //         "10",
        //         rewardDistribution,
        //         this.feeManager.address
        //     );
        //
        //     await this.rewardToken.transferOwnership(this.reservoir.address, {from: alice});
        //     await this.reservoir.mintToken();
        //     await this.reservoir.setComptroller(this.comptroller.address);
        //     await this.lp.approve(this.rewardPool.address, '1000', {from: alice});
        //     await this.reservoir.add(this.rewardPool.address, '1');
        //     expectRevert(this.reservoir.add(this.rewardPool.address, '1'), "contract is exist");
        //     // Alice deposits 10 LPs at block 590
        //     for (let i = 0; i < 265; i++) {
        //         await time.advanceBlock();
        //         await this.reservoir.distributionToken();
        //     }
        //
        //     lastBlock = await time.latestBlock();
        //     console.log("advanceBlockTo:" + lastBlock);
        //     assert.equal(toWei('0.05'), await this.reservoir.tokenPerBlock().valueOf());
        //     await this.reservoir.distributionToken();
        //     assert.equal(toWei('0.05'), await this.reservoir.tokenPerBlock().valueOf());
        //
        // });
    });

});