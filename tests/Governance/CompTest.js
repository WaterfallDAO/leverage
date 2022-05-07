const {
    address,
    minerStart,
    minerStop,
    unlockedAccount,
    mineBlock
} = require('../Utils/Ethereum');

const EIP712 = require('../Utils/EIP712');

describe('RewardToken', () => {
    const name = 'BOX-BANK';
    const symbol = 'BOX';

    let root, a1, a2, accounts, chainId;
    let comp;

    beforeEach(async () => {
        [root, a1, a2, ...accounts] = saddle.accounts;
        chainId = 1; // await web3.eth.net.getId(); See: https://github.com/trufflesuite/ganache-core/issues/515
        comp = await deploy('RewardToken');
    });

    describe('metadata', () => {
        it('has given name', async () => {
            expect(await call(comp, 'name')).toEqual(name);
        });

        it('has given symbol', async () => {
            expect(await call(comp, 'symbol')).toEqual(symbol);
        });
    });

    describe('balanceOf', () => {
        it('grants to initial account', async () => {
            expect(await call(comp, 'balanceOf', [root])).toEqual("0");
            await send(comp, 'mint', [root]);
            expect(await call(comp, 'balanceOf', [root])).toEqual("76200000000000000000000000");
        });
    });


});
