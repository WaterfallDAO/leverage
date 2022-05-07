const Comptroller = artifacts.require('Comptroller');
const {expectRevert, time} = require('@openzeppelin/test-helpers');

contract('Comptroller', ([alice, bob]) => {
    it("test Comptroller", async function () {
        let comptroller = await Comptroller.new({
            from: alice,
        });


    });
});