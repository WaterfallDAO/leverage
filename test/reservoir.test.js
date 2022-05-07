const {expectRevert, time} = require('@openzeppelin/test-helpers');
const RewardToken = artifacts.require('RewardToken');
const Reservoir = artifacts.require('Reservoir');
const MockToken = artifacts.require('MockToken');

contract('Reservoir', ([alice, bob, _gover, _insurance, _dev, minter]) => {

    let zeroAddress = "0x0000000000000000000000000000000000000000";
    const {toWei} = web3.utils;
    const {fromWei} = web3.utils;
    beforeEach(async () => {
        this.rewardToken = await RewardToken.new({from: alice});

    });

    it('should set correct state variables', async () => {
        let lastBlock = await time.latestBlock();
        this.reservoir = await Reservoir.new(this.rewardToken.address, lastBlock, '10', {from: alice});
        this.reservoir.insurance(_insurance);

        await this.rewardToken.transferOwnership(this.reservoir.address, {from: alice});
        const rewardToken = await this.reservoir.rewardToken();
        const owner = await this.rewardToken.owner();
        await this.reservoir.mintToken({from: alice});

        assert.equal(rewardToken.valueOf(), this.rewardToken.address);
        // assert.equal(devaddr.valueOf(), _dev);
        assert.equal(owner.valueOf(), this.reservoir.address);
        let totalSupply = await this.rewardToken.totalSupply();
        console.log("totalSupply:" + totalSupply);
        assert.equal(totalSupply, toWei('6100000'));
    });
    // //
    it('should allow dev and only dev to update dev', async () => {
        let lastBlock = await time.latestBlock();
        this.reservoir = await Reservoir.new(this.rewardToken.address, lastBlock, '10', {from: alice});

        assert.equal(await this.reservoir.length().valueOf(), 0);
        assert.equal(await this.reservoir.contains(_dev), false);
        assert.equal((await this.reservoir.owner()).valueOf(), alice);
        assert.equal((await this.reservoir.controller()).valueOf(), alice);

        await this.reservoir.addDev(_dev);
        assert.equal(await this.reservoir.length().valueOf(), 1);
        assert.equal(await this.reservoir.contains(_dev), true);

        await expectRevert(this.reservoir.addDev(_gover, {from: _gover}), '!controller');
        await expectRevert(this.reservoir.removeDev(_gover, {from: _gover}), '!controller');
        await expectRevert(this.reservoir.insurance(_gover, {from: _gover}), '!controller');
        await expectRevert(this.reservoir.gover(_gover, {from: _gover}), '!controller');

        console.log("controller:" + (await this.reservoir.controller()).valueOf());

        await this.reservoir.setController(bob, {from: alice});

        console.log("controller:" + (await this.reservoir.controller()).valueOf());
        assert.equal((await this.reservoir.controller()).valueOf(), bob);
        assert.equal((await this.reservoir.owner()).valueOf(), alice);

        await this.reservoir.transferOwnership(bob, {from: alice});
        assert.equal((await this.reservoir.owner()).valueOf(), bob);
        await this.reservoir.setController(alice, {from: bob});
        await this.reservoir.transferOwnership(alice, {from: bob});

        await expectRevert(
            this.reservoir.setController(alice, {from: bob}),
            'Ownable: caller is not the owner');

        await this.reservoir.setController(alice, {from: alice});
        assert.equal((await this.reservoir.controller()).valueOf(), alice);

        assert.equal(await this.reservoir.insuranceaddr().valueOf(), zeroAddress);
        assert.equal(await this.reservoir.governaddr().valueOf(), zeroAddress);
        await this.reservoir.insurance(_insurance);
        assert.equal(await this.reservoir.insuranceaddr().valueOf(), _insurance);
        await this.reservoir.gover(_gover);
        assert.equal(await this.reservoir.governaddr().valueOf(), _gover);

        assert.equal(await this.reservoir.teamFundDivRate().valueOf(), toWei("0.25"));
        assert.equal(await this.reservoir.goverFundDivRate().valueOf(), toWei("0.05"));
        assert.equal(await this.reservoir.insuranceFundDivRate().valueOf(), toWei("0.05"));

        await this.reservoir.setTeamFundDivRate(toWei("0.2"));
        await this.reservoir.setInsuranceFundDivRate(toWei("0.015"));
        await this.reservoir.setGoverFundDivRate(toWei("0.015"));
        assert.equal(await this.reservoir.teamFundDivRate().valueOf(), toWei("0.2"));
        assert.equal(await this.reservoir.goverFundDivRate().valueOf(), toWei("0.015"));
        assert.equal(await this.reservoir.insuranceFundDivRate().valueOf(), toWei("0.015"));

        await this.reservoir.setTeamFundDivRate(toWei("0.21"));
        await this.reservoir.setInsuranceFundDivRate(toWei("0.02"));
        await this.reservoir.setGoverFundDivRate(toWei("0.02"));

        assert.equal(await this.reservoir.teamFundDivRate().valueOf(), toWei("0.21"));
        assert.equal(await this.reservoir.goverFundDivRate().valueOf(), toWei("0.02"));
        assert.equal(await this.reservoir.insuranceFundDivRate().valueOf(), toWei("0.02"));


    })


    it('test rate', async () => {
        let lastBlock = await time.latestBlock();
        this.reservoir = await Reservoir.new(this.rewardToken.address, lastBlock, '10', {from: alice});

        assert.equal(await this.reservoir.teamFundDivRate().valueOf(), toWei("0.25"));
        assert.equal(await this.reservoir.goverFundDivRate().valueOf(), toWei("0.05"));
        assert.equal(await this.reservoir.insuranceFundDivRate().valueOf(), toWei("0.05"));
        assert.equal(await this.reservoir.liquidityRate().valueOf(), toWei("0.05"));
        assert.equal(await this.reservoir.comptrollerRate().valueOf(), toWei("0.6"));

        await expectRevert(this.reservoir.setTeamFundDivRate(toWei("0.05"), {from: _gover}), '!controller');
        await expectRevert(this.reservoir.setLiquidityRate(toWei("0.05"), {from: _gover}), '!controller');
        await expectRevert(this.reservoir.setInsuranceFundDivRate(toWei("0.05"), {from: _gover}), '!controller');
        await expectRevert(this.reservoir.setGoverFundDivRate(toWei("0.05"), {from: _gover}), '!controller');
        await expectRevert(this.reservoir.setTeamFundDivRate(toWei("0.05"), {from: _gover}), '!controller');


        this.reservoir.setController(_gover, {from: alice});



        await expectRevert(this.reservoir.setTeamFundDivRate(toWei("0.251"), {from: _gover}), 'rate too large');
        await expectRevert(this.reservoir.setLiquidityRate(toWei("0.101"), {from: _gover}), 'rate too large');
        await expectRevert(this.reservoir.setInsuranceFundDivRate(toWei("0.051"), {from: _gover}), 'rate too large');
        await expectRevert(this.reservoir.setGoverFundDivRate(toWei("0.051"), {from: _gover}), 'rate too large');

        await this.reservoir.setLiquidityRate(toWei("0.1"), {from: _gover});
        assert.equal(await this.reservoir.liquidityRate().valueOf(), toWei("0.1"));
        assert.equal(await this.reservoir.comptrollerRate().valueOf(), toWei("0.55"));
        await this.reservoir.setLiquidityRate(toWei("0.03"), {from: _gover});


        await this.reservoir.setGoverFundDivRate(toWei("0.03"), {from: _gover});
        assert.equal(await this.reservoir.goverFundDivRate().valueOf(), toWei("0.03"));
        assert.equal(await this.reservoir.comptrollerRate().valueOf(), toWei("0.64"));
        await this.reservoir.setGoverFundDivRate(toWei("0.05"), {from: _gover});

        await this.reservoir.setInsuranceFundDivRate(toWei("0.03"), {from: _gover});
        assert.equal(await this.reservoir.insuranceFundDivRate().valueOf(), toWei("0.03"));
        assert.equal(await this.reservoir.comptrollerRate().valueOf(), toWei("0.64"));
        await this.reservoir.setInsuranceFundDivRate(toWei("0.05"), {from: _gover});



        await this.reservoir.setTeamFundDivRate(toWei("0.2"), {from: _gover});
        assert.equal(await this.reservoir.teamFundDivRate().valueOf(), toWei("0.2"));
        assert.equal(await this.reservoir.comptrollerRate().valueOf(), toWei("0.67"));
        await this.reservoir.setTeamFundDivRate(toWei("0.25"), {from: _gover});
    });

});
