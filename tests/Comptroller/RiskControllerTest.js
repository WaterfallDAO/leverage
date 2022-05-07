const BigNumber = require('bignumber.js');

const {
    address,
    etherMantissa,
    etherUnsigned
} = require('../Utils/Ethereum');

const {
    makeCToken,
    makeToken,
    makePriceOracle,
} = require('../Utils/Compound');

describe('RiskController', () => {
    let root, alice, accounts;
    let usdc, dai, native, riskController;

    beforeEach(async () => {
        [root, alice, ...accounts] = saddle.accounts;
        usdc = await makeToken();
        dai = await makeToken();
        native = await makeToken();

        riskController = await deploy('RiskController', []);

    });

    describe("constructor", () => {
        it("is contract test", async () => {
            let isContract = await call(riskController, "isContractCall");
            expect(isContract).toEqual(false);

        });

        it("test white list", async () => {
            let isWhiteList = await call(riskController, "contractWhiteList", [usdc._address]);
            expect(isWhiteList).toEqual(false);
            await send(riskController, "addToWhiteList", [usdc._address]);
            isWhiteList = await call(riskController, "contractWhiteList", [usdc._address]);
            expect(isWhiteList).toEqual(true);
            await send(riskController, "removeFromWhiteList", [usdc._address]);
            isWhiteList = await call(riskController, "contractWhiteList", [usdc._address]);
            expect(isWhiteList).toEqual(false);
        });

        it("test ban mint", async () => {
            let isBanMint = await call(riskController, "banMint", [usdc._address]);
            expect(isBanMint).toEqual(false);
            await send(riskController, "banTokenMint", [usdc._address]);
            isBanMint = await call(riskController, "banMint", [usdc._address]);
            expect(isBanMint).toEqual(true);
            await send(riskController, "removeBanTokenMint", [usdc._address]);
            isBanMint = await call(riskController, "banMint", [usdc._address]);
            expect(isBanMint).toEqual(false);
        });

        it("test ban borrow", async () => {
            let isBanMint = await call(riskController, "banBorrow", [usdc._address]);
            expect(isBanMint).toEqual(false);
            await send(riskController, "banTokenBorrow", [usdc._address]);
            isBanMint = await call(riskController, "banBorrow", [usdc._address]);
            expect(isBanMint).toEqual(true);
            await send(riskController, "removeBanTokenBorrow", [usdc._address]);
            isBanMint = await call(riskController, "banBorrow", [usdc._address]);
            expect(isBanMint).toEqual(false);
        });

        it("test check mint risk", async () => {
            let checkMintRisk = await call(riskController, "checkMintRisk", [usdc._address, alice]);
            expect(checkMintRisk).toEqual("0");
            checkMintRisk = await call(riskController, "checkMintRisk", [usdc._address, dai._address]);
            expect(checkMintRisk).toEqual("0");

            await send(riskController, "banTokenMint", [usdc._address]);
            checkMintRisk = await call(riskController, "checkMintRisk", [usdc._address, alice]);
            expect(checkMintRisk).toEqual("0");
            checkMintRisk = await call(riskController, "checkMintRisk", [usdc._address, dai._address]);
            expect(checkMintRisk).toEqual("0");

            await send(riskController, "addToWhiteList", [dai._address]);

            checkMintRisk = await call(riskController, "checkMintRisk", [usdc._address, dai._address]);
            expect(checkMintRisk).toEqual("0");

            await send(riskController, "removeFromWhiteList", [dai._address]);

            checkMintRisk = await call(riskController, "checkMintRisk", [usdc._address, dai._address]);
            expect(checkMintRisk).toEqual("0");


            await send(riskController, "removeBanTokenMint", [usdc._address]);
            checkMintRisk = await call(riskController, "checkMintRisk", [usdc._address, dai._address]);
            expect(checkMintRisk).toEqual("0");
        });


        it("test check borrow risk", async () => {
            let checkMintRisk = await call(riskController, "checkBorrowRisk", [usdc._address, alice]);
            expect(checkMintRisk).toEqual("0");
            checkMintRisk = await call(riskController, "checkBorrowRisk", [usdc._address, dai._address]);
            expect(checkMintRisk).toEqual("0");

            await send(riskController, "banTokenBorrow", [usdc._address]);
            checkMintRisk = await call(riskController, "checkBorrowRisk", [usdc._address, alice]);
            expect(checkMintRisk).toEqual("0");
            checkMintRisk = await call(riskController, "checkBorrowRisk", [usdc._address, dai._address]);
            expect(checkMintRisk).toEqual("0");

            await send(riskController, "addToWhiteList", [dai._address]);

            checkMintRisk = await call(riskController, "checkBorrowRisk", [usdc._address, dai._address]);
            expect(checkMintRisk).toEqual("0");

            await send(riskController, "removeFromWhiteList", [dai._address]);

            checkMintRisk = await call(riskController, "checkBorrowRisk", [usdc._address, dai._address]);
            expect(checkMintRisk).toEqual("0");


            await send(riskController, "removeBanTokenBorrow", [usdc._address]);
            checkMintRisk = await call(riskController, "checkBorrowRisk", [usdc._address, dai._address]);
            expect(checkMintRisk).toEqual("0");
        });


    });

});
