const Controller = artifacts.require('Controller');
const {expectRevert, time} = require('@openzeppelin/test-helpers');

contract('controller', ([alice, bob]) => {
    it("test controller", async function () {
        let controller = await Controller.new({
            from: alice,
        });
        assert.equal(await controller.isController(alice), true);
        assert.equal(await controller.isController(bob), false);
        assert.equal(await controller.owner(), alice);
        assert.equal(await controller.isOwner({from: alice}), true);
        assert.equal(await controller.isOwner({from: bob}), false);

        await expectRevert(controller.setController(bob, {from: bob}), "Ownable: caller is not the owner");
        await controller.setController(bob);

        assert.equal(await controller.isController(bob), true);

        await expectRevert(controller.transferOwnership(bob, {from: bob}), "Ownable: caller is not the owner");
        controller.transferOwnership(bob);

        assert.equal(await controller.isOwner({from: alice}), false);
        assert.equal(await controller.isOwner({from: bob}), true);

    });
});