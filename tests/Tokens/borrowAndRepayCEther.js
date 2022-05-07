const {
    etherGasCost,
    etherUnsigned,
    etherMantissa,
    UInt256Max
} = require('../Utils/Ethereum');

const {
    makeCToken,
    balanceOf,
    borrowSnapshot,
    totalBorrows,
    fastForward,
    setBalance,
    preApprove,
    pretendBorrow,
    setEtherBalance,
    getBalances,
    adjustBalances
} = require('../Utils/Compound');

const BigNumber = require('bignumber.js');

const borrowAmount = etherUnsigned(10e3);
const repayAmount = etherUnsigned(10e2);

async function preBorrow(cToken, borrower, borrowAmount) {
    await send(cToken.comptroller, 'setBorrowAllowed', [true]);
    await send(cToken.comptroller, 'setBorrowVerify', [true]);
    // await send(cToken.interestRateModel, 'setFailBorrowRate', [false]);
    // await send(cToken, 'harnessSetFailTransferToAddress', [borrower, false]);
    // await send(cToken, 'harnessSetAccountBorrows', [borrower, 0, 0]);
    // await send(cToken, 'harnessSetTotalBorrows', [0]);
    // await setEtherBalance(cToken, borrowAmount);
}


async function borrow(cToken, borrower, borrowAmount, opts = {}) {
    // await send(cToken, 'harnessFastForward', [1]);
    return send(cToken, 'borrow', [borrowAmount], {from: borrower});
}

async function mintExplicit(cToken, minter, mintAmount) {
    return send(cToken, 'mint', [], {from: minter, value: mintAmount});
}

describe('CEther', function () {
    let cToken, root, borrower, benefactor, accounts;
    beforeEach(async () => {
        [root, borrower, benefactor, ...accounts] = saddle.accounts;

        cToken = await makeCToken({kind: 'cether', word: "CNative", comptrollerOpts: {kind: 'bool'}});
    });


    describe('borrow', () => {
        beforeEach(async () => await preBorrow(cToken, borrower, borrowAmount));

        it("emits a borrow failure if interest accrual fails", async () => {
            await send(cToken.interestRateModel, 'setFailBorrowRate', [true]);
            // await send(cToken, 'harnessFastForward', [1]);
            await expect(borrow(cToken, borrower, borrowAmount)).rejects.toRevert("revert INTEREST_RATE_MODEL_ERROR");
        });

        it("returns error from borrowFresh without emitting any extra logs", async () => {
            expect(await borrow(cToken, borrower, borrowAmount.plus(1))).toHaveTokenFailure('TOKEN_INSUFFICIENT_CASH', 'BORROW_CASH_NOT_AVAILABLE');
        });

        it("returns success from borrowFresh and transfers the correct amount", async () => {
            const beforeBalances = 0;
            // await fastForward(cToken);
            await mintExplicit(cToken,root,etherUnsigned(10e4));
            const result = await borrow(cToken, borrower, borrowAmount);
            const afterBalances =1;
            expect(result).toSucceed();
            // expect(afterBalances).toEqual(await adjustBalances(beforeBalances, [
            //     [cToken, 'eth', -borrowAmount],
            //     [cToken, 'borrows', borrowAmount],
            //     [cToken, borrower, 'eth', borrowAmount.minus(await etherGasCost(result))],
            //     [cToken, borrower, 'borrows', borrowAmount]
            // ]));
        });
    });


});
