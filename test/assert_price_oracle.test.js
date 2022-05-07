const MockPoolView = artifacts.require('MockPoolView');
const MockBurnToken = artifacts.require('MockBurnToken');

const AssertPriceOracle = artifacts.require("AssertPriceOracle");
const MockLink = artifacts.require("MockLink");
const {toWei} = web3.utils;

contract('MockPoolView', ([alice, bob]) => {
    beforeEach(async () => {
        this.native = await MockBurnToken.new('native', 'native', 6);
        this.oracle = await AssertPriceOracle.new(alice, this.native.address);
        this.usdt = await MockBurnToken.new('LPToken', 'LP', 8);
        this.dai = await MockBurnToken.new('LPToken', 'LP', 8);

        this.usdcPoolLp = await MockBurnToken.new("usdcPoolLp", "usdcPoolLp", 8);

        this.lp = await MockBurnToken.new('LPToken', 'LP', 8);

        this.mockPoolView = await MockPoolView.new(this.usdt.address, this.dai.address, this.usdcPoolLp.address, {
            from: alice,
        });

        this.usdcLink = await MockLink.new();
        this.daiLink = await MockLink.new();
        this.nativeLink = await MockLink.new();

        let result = await this.mockPoolView.pool().valueOf();
        assert.equal(this.usdcPoolLp.address, result);

        await this.usdcLink.updatePrice(toWei("1"));
        await this.daiLink.updatePrice(toWei("1"));
        await this.nativeLink.updatePrice(toWei("1"));

        await this.oracle.setUnderlyingOracle(this.usdt.address, this.usdcLink.address);
        await this.oracle.setUnderlyingOracle(this.native.address, this.nativeLink.address);
        await this.oracle.setUnderlyingOracle(this.dai.address, this.daiLink.address);

        await this.oracle.addAbeloPairView(this.usdcPoolLp.address, this.mockPoolView.address);
    });


});
