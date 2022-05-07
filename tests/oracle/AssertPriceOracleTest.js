const BigNumber = require('bignumber.js');
const {Web3} = require('web3');
const {
    address,
    etherMantissa,
    etherUnsigned
} = require('../Utils/Ethereum');

const {
    makeCToken,
    makeToken,
    makePriceOracle,
    quickMint,
    enterMarkets
} = require('../Utils/Compound');


describe('AssertPriceOracle', () => {
    let root, accounts;
    let oracle, usdc, dai, usdt, native, cEth, cUsdc, cDai;
    let usdcJust, daiJust, usdcPool, daiPool, usdcLink, daiLink, wtrxLink, usdcPoolLp, daiPoolLp;

    beforeEach(async () => {
        [root, ...accounts] = saddle.accounts;
        usdt = await makeToken({decimals: 6});
        usdc = await makeToken();
        dai = await makeToken();
        native = await makeToken();

        oracle = await deploy('AssertPriceOracle',
            [
                root,
                native._address
            ]
        );


        cEth = await makeCToken({
            kind: "cether",
            comptrollerOpts: {kind: "v1-no-proxy", priceOracle: oracle},
            supportMarket: true
        });
        cUsdc = await makeCToken({comptroller: cEth.comptroller, underlying: usdc, supportMarket: true});
        cDai = await makeCToken({comptroller: cEth.comptroller, underlying: dai, supportMarket: true});


        usdcPoolLp = await makeToken();
        daiPoolLp = await makeToken();

        usdcJust = await deploy("MockJustPair", [usdc._address, 6, etherUnsigned(1e6)]);
        daiJust = await deploy("MockJustPair", [dai._address, 6, etherUnsigned(1e6)]);

        usdcPool = await deploy("MockPoolView", [native._address, usdc._address, usdcPoolLp._address]);
        daiPool = await deploy("MockPoolView", [native._address, dai._address, daiPoolLp._address]);


        usdcLink = await deploy("MockLink");
        daiLink = await deploy("MockLink");
        wtrxLink = await deploy("MockLink");

        console.log("price:"+etherUnsigned(1e3));
        await send(usdcLink, "updatePrice", [etherUnsigned(1e3)]);
        await send(daiLink, "updatePrice", [etherUnsigned(1.1e3)]);
        await send(wtrxLink, "updatePrice", [etherUnsigned(1e2)]);

        await send(oracle, "setUnderlyingOracle", [usdc._address, usdcLink._address]);
        await send(oracle, "setUnderlyingOracle", [dai._address, daiLink._address]);
        await send(oracle, "setUnderlyingOracle", [native._address, wtrxLink._address]);

        await send(oracle, "addJustLp", [usdc._address, usdcJust._address]);
        await send(oracle, "addJustLp", [dai._address, daiJust._address]);

        await send(oracle, "addAbeloPairView", [usdcPoolLp._address, usdcPool._address]);
        // await send(oracle, "addAbeloPairView", [daiPoolLp._address, daiPool._address]);

    });

    describe("constructor", () => {
        // it("getUnderlyingPrice", async () => {
        //
        //     let underlying = await call(cUsdc, "underlying");
        //     let underlyingOracles = await call(oracle, "underlyingOracles", [usdc._address]);
        //     expect(underlyingOracles).toEqual(usdcLink._address);
        //     expect(underlying).toEqual(usdc._address);
        //
        //     let price = await call(oracle, "getUnderlyingPrice", [cUsdc._address]);
        //     expect(price).toEqual("1000000000000000");
        //
        //     price = await call(oracle, "getUnderlyingPrice", [cDai._address]);
        //     expect(price).toEqual("1100000000000000");
        //
        // });
        //
        // it("get just lp price", async () => {
        //
        //     // await usdcJust.sendTransaction( {from: root, value: 1});
        //     await send(usdc, "transfer", [usdcJust._address, etherUnsigned(1e18)]);
        //     let pairHasUnderlying = await call(oracle, "justLps", [usdcJust._address]);
        //     expect(pairHasUnderlying).toEqual(true);
        //     let underlying = await call(oracle, "justLpPairs", [usdcJust._address]);
        //     expect(underlying).toEqual(usdc._address);
        //
        //     let underlyingOracles = await call(oracle, "underlyingOracles", [underlying]);
        //     expect(underlyingOracles).toEqual(usdcLink._address);
        //
        //     let price = await call(oracle, "calJustLpPrice", [usdcJust._address]);
        //     //todo cal trx
        //     expect(price).toEqual("1000000000000000");
        //
        //
        // });
        //
        // it("get abelo lp price", async () => {
        //     let lpIsAbelo = await call(oracle, "abeloLps", [usdcPoolLp._address]);
        //     expect(lpIsAbelo).toEqual(true);
        //     let poolView = await call(oracle, "abeloLpViews", [usdcPoolLp._address])
        //     expect(poolView).toEqual(usdcPool._address);
        //     let poolAddress = await call(usdcPool, "pool");
        //     expect(poolAddress).toEqual(usdcPoolLp._address);
        //     let abeloViewAddress = await call(oracle, "abeloLpViews", [usdcPoolLp._address]);
        //     expect(abeloViewAddress).toEqual(usdcPool._address);
        //     let price = await call(oracle, "calAbeloLpPrice", [usdcPoolLp._address]);
        //     expect(price).toEqual("1100000000000000");
        // });

        it("mint and check liquity", async () => {
            const half = etherMantissa(0.7);
            await send(cEth.comptroller, '_setCollateralFactor', [cDai._address, half], {from: root});
            await send(cEth.comptroller, '_setCollateralFactor', [cUsdc._address, half], {from: root});
            enterMarkets([cDai, cUsdc], root);
            quickMint(cDai, root, etherUnsigned(1e18));
            quickMint(cUsdc, root, etherUnsigned(1e18));

            // ({
            //     0: err,
            //     1: liquidity,
            //     2: shortfall
            // } = await call(cEth.comptroller, 'getHypotheticalAccountLiquidityTest', [root,cEth._address,0,0]));
            // let tx= await send(cEth.comptroller, 'getHypotheticalAccountLiquidityTest', [root,cEth._address,0,0]);
            // expect(tx).solo();
            //todo getlog
            // expect(tx).toRevert(100);

            // expect(tx).toRevert(100);

        });


    });

});
