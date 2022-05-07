"use strict";

const {
    makeComptroller,
    makeCToken,
    enterMarkets,
    quickMint
} = require('../Utils/Compound');
const {both, etherMantissa} = require('../Utils/Ethereum');
const BigNumber = require('bignumber.js');

describe('test ctoken', function () {
    let opts = {}
    let root, minter, redeemer, accounts;
    let comptroller;
    let jumpRateModel;
    let cToken;
    let cErc20Delegate;
    let cErc20Delegator;
    let underlying;
    const collateralFactor = etherMantissa(0.5), exchangeRate = etherMantissa(1), price = etherMantissa(1);
    beforeEach(async () => {
        [root, minter, redeemer, ...accounts] = saddle.accounts;

    });

    it("mint and redeem", async () => {
        underlying = await deploy("StandardToken", [
            '1000000000000000000', "box", 18, "box"
        ]);
        comptroller = await deploy('Comptroller');
        jumpRateModel = await deploy('JumpRateModel', ['1000000000000000000'
            , '1000000000000000000'
            , '1000000000000000000'
            , '1']);
        cErc20Delegate = await deploy("CErc20Delegate");
        cErc20Delegator = await deploy("CErc20Delegator",
            [underlying._address
                , comptroller._address
                , jumpRateModel._address
                , exchangeRate
                , 'test'
                , 'test'
                , 18
                , root
                , cErc20Delegate._address
                , "0x0"
            ]);
        cToken = await saddle.getContractAt('CErc20Delegate', cErc20Delegator._address);


        console.log("cToken address:" + cToken._address);
        console.log("cErc20Delegator address:" + cErc20Delegator._address);

        await send(underlying, 'approve', [cToken._address, "1000000000000000000"], {root});

        await send(comptroller, '_supportMarket', [cToken._address]);

        await send(comptroller, 'enterMarkets', [[cToken._address]], {root});

        const approved = await call(underlying, 'allowance', [root, cToken._address]);
        const comptrollerAddress = await call(cToken, 'comptroller');
        console.log("comptrollerAddress:" + comptrollerAddress);

        console.log("approved:" + approved);
        // expect(approved).toEqualNumber(1e15);

        await send(cToken, 'mint', ['100'], {root});
        const balance = await call(cToken, "balanceOf", [root]);
        console.log("balance:" + balance);
        const balanceOfUnderlying = await call(cToken, "balanceOfUnderlying", [root]);

        console.log("balanceOfUnderlying:" + balanceOfUnderlying);
        // expect(balance).toEqualNumber(1e15);
        // expect(balanceOfUnderlying).toEqualNumber(1e15);

    });
    it('borrow and repay', async () => {


        underlying = await deploy("StandardToken", [
            '100000000000000000000000000', "box", 18, "box"
        ]);
        comptroller = await deploy('Comptroller');
        jumpRateModel = await deploy('JumpRateModel', ['1000000000000000000'
            , '1000000000000000000'
            , '1000000000000000000'
            , '1']);
        cErc20Delegate = await deploy("CErc20Delegate");
        cErc20Delegator = await deploy("CErc20Delegator",
            [underlying._address
                , comptroller._address
                , jumpRateModel._address
                , exchangeRate
                , 'test'
                , 'test'
                , 18
                , root
                , cErc20Delegate._address
                , "0x0"
            ]);

        //todo  what's this
        cToken = await saddle.getContractAt('CErc20Delegate', cErc20Delegator._address);
        await send(comptroller, '_setMaxAssets', [15], {from: root});

        console.log("cToken address:" + cToken._address);
        console.log("cErc20Delegator address:" + cErc20Delegator._address);

        await send(underlying, 'approve', [cToken._address, "100000000000000000000000000"], {root});

        await send(comptroller, '_supportMarket', [cToken._address]);

        let markets = await call(comptroller, "getAllMarkets");
        console.log("markets:" + markets)


        let results = await send(comptroller, 'enterMarkets', [[cToken._address]], {root});
        // console.log("results:" + results[0]);
        let expectedErrors;
        let enterTokens = [cToken];
        let expectedTokens = [cToken];
        // const {reply, receipt} = await both(comptroller, 'enterMarkets', [enterTokens.map(t => t._address)], {from: root});

        // expect(results).toEqual("1");
        // expect(receipt).toHaveLog('MarketEntered', {
        //     cToken: cToken._address,
        //     account: root
        // });

        // const assetsIn = await call(comptroller, 'getAssetsIn', [root]);
        // expectedErrors = expectedErrors || enterTokens.map(_ => 'NO_ERROR');
        // reply.forEach((tokenReply, i) => {
        //     console.log("tokenReply:",tokenReply);
        //     console.log("expectedErrors:",expectedErrors[i]);
        //     // expect(tokenReply).toHaveTrollError(expectedErrors[i]);
        // });

        // expect(receipt).toSucceed();
        // expect(assetsIn).toEqual(expectedTokens.map(t => t._address));

        // await checkMarkets(expectedTokens);

        let assets = await call(comptroller, "getAssetsIn", [root]);
        console.log("assets:" + assets)

        const approved = await call(underlying, 'allowance', [root, cToken._address]);
        const comptrollerAddress = await call(cToken, 'comptroller');
        console.log("comptrollerAddress:" + comptrollerAddress);

        console.log("approved:" + approved);
        // expect(approved).toEqualNumber(1e15);


        let priceOracle = await deploy('SimplePriceOracle');
        await send(comptroller, "_setPriceOracle", [priceOracle._address]);
        await send(priceOracle, 'setUnderlyingPrice', [cToken._address, price]);
        await send(comptroller, '_setCollateralFactor', [cToken._address, collateralFactor]);
        let liquidity, shortfall, err;
        let amount = 1e6;
        ({
            1: liquidity,
            2: shortfall
        } = await call(comptroller, 'getHypotheticalAccountLiquidity', [root, cToken._address, 0, amount]));
        expect(liquidity).toEqualNumber(0);
        // expect(shortfall).toEqualNumber(0);

        await send(cToken, 'mint', ['10000000000000000000'], {root});


        let balance = await call(cToken, "balanceOf", [root]);
        console.log("balance:" + balance);
        const balanceOfUnderlying = await call(cToken, "balanceOfUnderlying", [root]);

        console.log("balanceOfUnderlying:" + balanceOfUnderlying);


        ({0: err, 1: liquidity, 2: shortfall} = await call(comptroller, "getAccountLiquidity", [root]));
        console.log("err:" + err);
        console.log("liquidity:" + liquidity);
        console.log("shortfall:" + shortfall);
        balance = await call(underlying, 'balanceOf', [root]);
        console.log("before balance:" + balance);
        let result = await send(cToken, 'borrow', ['5000000000000000000'], {root});
        // expect(result).toEqualNumber(1);
        // console.log("success:" + success.toString());
        balance = await call(underlying, 'balanceOf', [root])
        console.log("after balance:" + balance);

        await send(cToken, 'repayBorrow', ['50000000000000'], {root});
        balance = await call(underlying, 'balanceOf', [root])
        console.log("after repayBorrow balance:" + balance);

    });

});