"use strict";

const {both, etherMantissa} = require('../Utils/Ethereum');
const BigNumber = require('bignumber.js');


describe("liquidate borrow", function () {
    let root, minter, redeemer, accounts;
    let comptroller;
    let jumpRateModel;
    let cToken;
    let underlyingCDelegate;
    let underlyingCDelegator;
    let collateralCDelegate;
    let collateralCDelegator
    let underlying;
    let collateral;
    const collateralFactor = etherMantissa(0.8), exchangeRate = etherMantissa(1), price = etherMantissa(1);

    beforeEach(async () => {
        [root, minter, redeemer, ...accounts] = saddle.accounts;
    });

    it("liquidate borrow test", async () => {
        underlying = await deploy("StandardToken", [
            '100000000000000000000000000000', "box", 18, "box"
        ]);

        collateral = await deploy("StandardToken", [
            '10000000000000000000000000000', "coll", 18, "coll"
        ], {from: minter});
        comptroller = await deploy('Comptroller');
        jumpRateModel = await deploy('JumpRateModel', ['1000000000000000000'
            , '1000000000000000000'
            , '1000000000000000000'
            , '1']);
        underlyingCDelegate = await deploy("CErc20Delegate");
        underlyingCDelegator = await deploy("CErc20Delegator",
            [underlying._address
                , comptroller._address
                , jumpRateModel._address
                , exchangeRate
                , 'bBOX'
                , 'bBOX'
                , 18
                , root
                , underlyingCDelegate._address
                , "0x0"
            ]);

        collateralCDelegate = await deploy("CErc20Delegate");
        collateralCDelegator = await deploy("CErc20Delegator",
            [collateral._address
                , comptroller._address
                , jumpRateModel._address
                , exchangeRate
                , 'bCOLL'
                , 'bCOLL'
                , 18
                , root
                , collateralCDelegate._address
                , "0x0"
            ]);

        await send(comptroller, '_setMaxAssets', [15], {from: root});
        await send(comptroller, '_supportMarket', [underlyingCDelegator._address]);
        await send(comptroller, '_supportMarket', [collateralCDelegator._address]);

        await send(underlying, 'approve', [underlyingCDelegator._address, "100000000000000000000000000"]);
        await send(collateral, 'approve', [collateralCDelegator._address, "100000000000000000000000000"], {from: minter});

        await send(underlyingCDelegator, 'mint', ['1000000000000000000']);
        let minterBalance = await call(collateral, "balanceOf", [minter]);

        await send(collateralCDelegator, 'mint', ['1000000000000000000'], {from: minter});
        let priceOracle = await deploy('SimplePriceOracle');
        await send(comptroller, "_setPriceOracle", [priceOracle._address]);

        await send(priceOracle, 'setUnderlyingPrice', [underlyingCDelegator._address, price]);
        await send(priceOracle, 'setUnderlyingPrice', [collateralCDelegator._address, price]);

        let results = await send(comptroller, 'enterMarkets', [[collateralCDelegator._address]], {from: minter});
        // await send(comptroller, 'enterMarkets', [[underlyingCDelegator._address]], {from: root});

        await send(comptroller, '_setCollateralFactor', [collateralCDelegator._address, collateralFactor]);

        await send(underlyingCDelegator, 'borrow', ['800000000000000000'], {from: minter});

        let minterUnderlyingBalance = await call(underlying, "balanceOf", [minter]);
        expect(minterUnderlyingBalance).toEqualNumber(800000000000000000);
        let newPrice = etherMantissa(1.2);
        const closeFactor = etherMantissa(0.9);
        let result = await send(comptroller, '_setCloseFactor', [closeFactor], {from: root});
        expect(result).toSucceed();
        const validIncentive = etherMantissa(1.1);
        result = await send(comptroller, '_setLiquidationIncentive', [validIncentive], {from: root});
        expect(result).toSucceed();

        await send(priceOracle, 'setUnderlyingPrice', [underlyingCDelegator._address, newPrice]);
        let liquidity, shortfall, err;
        ({0: err, 1: liquidity, 2: shortfall} = await call(comptroller, "getAccountLiquidity", [minter]));
        console.log("err:" + err);
        console.log("liquidity:" + liquidity);
        console.log("shortfall:" + shortfall);

        if (liquidity == 0 && shortfall > 0) {
            let rootUnderlyingBalance = await call(underlying, "balanceOf", [root]);
            let rootCollatralBalance = await call(collateral, "balanceOf", [root]);
            let rootUnderlyingCDelegatorBalance = await call(underlyingCDelegator, "balanceOf", [root]);
            let rootcollateralCDelegatorBalance = await call(collateralCDelegator, "balanceOf", [root]);

            console.log("rootUnderlyingBalance:" + rootUnderlyingBalance);
            console.log("rootCollatralBalance:" + rootCollatralBalance);
            console.log("rootUnderlyingCDelegatorBalance:" + rootUnderlyingCDelegatorBalance);
            console.log("rootcollateralCDelegatorBalance:" + rootcollateralCDelegatorBalance);


            let minterUnderlyingBalance = await call(underlying, "balanceOf", [minter]);
            let minterUnderlyingCDelegatorBalance = await call(underlyingCDelegator, "balanceOf", [minter]);

            let minterCollatralBalance = await call(collateral, "balanceOf", [minter]);
            let minterCollateralCDelegatorBalance = await call(collateralCDelegator, "balanceOf", [minter]);

            console.log("minterUnderlyingBalance:" + minterUnderlyingBalance);
            console.log("minterUnderlyingCDelegatorBalance:" + minterUnderlyingCDelegatorBalance);
            console.log("minterCollatralBalance:" + minterCollatralBalance);
            console.log("minterCollateralCDelegatorBalance:" + minterCollateralCDelegatorBalance);

            let liquidateBorrow = await send(underlyingCDelegator
                , "liquidateBorrow"
                , [minter, '200000000000000000', collateralCDelegator._address]
            );
            // let allowd = await send(comptroller
            //     , "liquidateBorrowAllowed"
            //     , [underlyingCDelegator._address
            //         , collateralCDelegator._address
            //         , root
            //         , minter
            //         , "200000000000000000"]
            // );
            // console.log("allowd:" + allowd);
            // expect(allowd).toSucceed();
            // expect(liquidateBorrow).toRevert(1);

            expect(liquidateBorrow).toHaveLog(['Transfer', 0], {
                from: root,
                to: underlyingCDelegator._address,
                amount: '200000000000000000'
            });
            expect(liquidateBorrow).toHaveLog(['Transfer', 1], {
                from: minter,
                to: root,
                amount: '264000000000000000'
            });


            rootUnderlyingBalance = await call(underlying, "balanceOf", [root]);
            rootCollatralBalance = await call(collateral, "balanceOf", [root]);
            rootUnderlyingCDelegatorBalance = await call(underlyingCDelegator, "balanceOf", [root]);
            rootcollateralCDelegatorBalance = await call(collateralCDelegator, "balanceOf", [root]);

            console.log("rootUnderlyingBalance:" + rootUnderlyingBalance);
            console.log("rootCollatralBalance:" + rootCollatralBalance);
            console.log("rootUnderlyingCDelegatorBalance:" + rootUnderlyingCDelegatorBalance);
            console.log("rootcollateralCDelegatorBalance:" + rootcollateralCDelegatorBalance);


            minterUnderlyingBalance = await call(underlying, "balanceOf", [minter]);
            minterUnderlyingCDelegatorBalance = await call(underlyingCDelegator, "balanceOf", [minter]);

            minterCollatralBalance = await call(collateral, "balanceOf", [minter]);
            minterCollateralCDelegatorBalance = await call(collateralCDelegator, "balanceOf", [minter]);

            console.log("minterUnderlyingBalance:" + minterUnderlyingBalance);
            console.log("minterUnderlyingCDelegatorBalance:" + minterUnderlyingCDelegatorBalance);
            console.log("minterCollatralBalance:" + minterCollatralBalance);
            console.log("minterCollateralCDelegatorBalance:" + minterCollateralCDelegatorBalance);


        }


    });


});