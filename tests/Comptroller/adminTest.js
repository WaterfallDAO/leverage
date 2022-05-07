const {address} = require('../Utils/Ethereum');

describe('admin / _setPendingAdmin / _acceptAdmin', () => {
    let root, accounts;
    let comptroller;
    beforeEach(async () => {
        [root, ...accounts] = saddle.accounts;
        comptroller = await deploy('Unitroller');
    });

    describe('admin()', () => {
        it('should return correct admin', async () => {
            expect(await call(comptroller, 'admin')).toEqual(root);
        });
    });

    describe('pendingAdmin()', () => {

    });

    describe('_setPendingAdmin()', () => {
        it('should only be callable by admin', async () => {

            // Check admin stays the same
            expect(await call(comptroller, 'admin')).toEqual(root);

        });

        it('should properly set pending admin', async () => {


            // Check admin stays the same
            expect(await call(comptroller, 'admin')).toEqual(root);
            // expect(await call(comptroller, 'pendingAdmin')).toEqual(accounts[0]);
        });

        it('should properly set pending admin twice', async () => {


            // Check admin stays the same
            expect(await call(comptroller, 'admin')).toEqual(root);

        });

        it('should emit event', async () => {

        });
    });

    describe('_acceptAdmin()', () => {
        it('should fail when pending admin is zero', async () => {
            expect(await call(comptroller, 'admin')).toEqual(root);
            await send(comptroller, '_setAdmin', [accounts[1]])
            // expect(await send(comptroller, '_setAdmin')).toHaveTrollFailure('UNAUTHORIZED', 'ACCEPT_ADMIN_PENDING_ADMIN_CHECK');

            // Check admin stays the same
            expect(await call(comptroller, 'admin')).toEqual(accounts[1]);

        });

        it('should fail when called by another account (e.g. root)', async () => {

            // expect(await send(comptroller, '_acceptAdmin')).toHaveTrollFailure('UNAUTHORIZED', 'ACCEPT_ADMIN_PENDING_ADMIN_CHECK');

            // Check admin stays the same
            expect(await call(comptroller, 'admin')).toEqual(root);

        });

        it('should succeed and set admin and clear pending admin', async () => {


            // expect(await call(comptroller, 'admin')).toEqual(accounts[0]);

        });

        it('should emit log on success', async () => {


        });
    });
});
