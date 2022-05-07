const {expectRevert, time} = require('@openzeppelin/test-helpers');
const BigNumber = require("bignumber.js");
const JumpRateModel = artifacts.require("JumpRateModel");
const Comptroller = artifacts.require("BoolComptroller");
const CErc20 = artifacts.require("CErc20");
const CErc20Delegate = artifacts.require("CErc20Delegate");
const CErc20Delegator = artifacts.require("CErc20Delegator");
const FeeManager = artifacts.require("FeeManager");
const CNative = artifacts.require("CNative");
const MockFlashLoanReceiver = artifacts.require("MockFlashLoanReceiver");
const MockBurnToken = artifacts.require("MockBurnToken");
const {toWei} = web3.utils;

contract("LendingPool FlashLoan function", ([owner, alice, bob, ...users]) => {

    const halfEther = (0.5 * Math.pow(10, 18)).toString()
    const ganache = require("ganache-core");
    // const web3 = new Web3(ganache.provider());


    beforeEach(async () => {
        this.dai = await MockBurnToken.new("test", "test", 6);
        this.exchangeRate = "1";
        this.comptroller = await Comptroller.new();
        this.jumpRateModel = await JumpRateModel.new('1000000000000000000'
            , '1000000000000000000'
            , '1000000000000000000'
            , '100000000000000000000000000');
        this.cErc20Delegate = await CErc20Delegate.new();
        this.daiDelegator = await CErc20Delegator.new(
            this.dai.address,
            this.comptroller.address,
            this.jumpRateModel.address,
            this.exchangeRate,
            "bTest",
            "bTest",
            18,
            owner,
            this.cErc20Delegate.address,
            "0x0"
        );
        this.feeManager = await FeeManager.new();
        await this.daiDelegator._setFeeManager(this.feeManager.address);
        this.cNative = await CNative.new(
            this.comptroller.address,
            this.jumpRateModel.address,
            this.exchangeRate,
            "bTRX",
            "bTRX",
            18,
            owner
        );
        console.log("CNative:"+this.cNative.address);

    })


    it("Deposits DAI into the reserve", async () => {

        let depositBal = toWei("1000");
        await this.dai.mint(alice, depositBal);
        console.log("dai:" + this.dai.address);
        console.log("daiDelegator:" + this.daiDelegator.address);
        console.log("toWei:" + toWei("1000000000"));
        await this.dai.approve(this.daiDelegator.address, toWei("1000000000"), {
            from: alice,
        });
        await this.daiDelegator.mint(depositBal, {
            from: alice,
        });
        assert.equal((await this.dai.balanceOf(alice)).valueOf(), '0');

    });

    it("Takes out a 500 DAI flashloan, returns the funds correctly", async () => {
        let depositBal = toWei("1000");
        await this.dai.mint(alice, depositBal);
        await this.dai.approve(this.daiDelegator.address, toWei("1000000000"), {
            from: alice,
        });

        await this.daiDelegator.mint(depositBal, {
            from: alice,
        });

        let flashLoanReceiver = await MockFlashLoanReceiver.new();
        await this.dai.mint(flashLoanReceiver.address, toWei("1"));
        await this.daiDelegator.flashLoan(
            flashLoanReceiver.address,
            this.dai.address,
            toWei("10"),
            "0x10"
        )

        // const reserveData: any = await _lendingPoolInstance.getReserveData(_daiAddress)
        // const userData: any = await _lendingPoolInstance.getUserReserveData(_daiAddress, deployer)
        //
        // const totalLiquidity = reserveData.totalLiquidity.toString()
        // const currentLiqudityRate = reserveData.liquidityRate.toString()
        // const currentLiquidityIndex = reserveData.liquidityIndex.toString()
        // const currentUserBalance = userData.currentATokenBalance.toString()
        //
        // const expectedLiquidity = new BigNumber("1001.225").multipliedBy(oneEther).toFixed()
        //
        // const tokenDistributorBalance = await daiInstance.balanceOf(_tokenDistributor.address)
        //
        // expect(totalLiquidity).to.be.equal(expectedLiquidity, "Invalid total liquidity")
        // expect(currentLiqudityRate).to.be.equal("0", "Invalid liquidity rate")
        // expect(currentLiquidityIndex).to.be.equal(
        //   new BigNumber("1.001225").multipliedBy(oneRay).toFixed(),
        //   "Invalid liquidity index",
        // )
        // expect(currentUserBalance.toString()).to.be.equal(
        //   expectedLiquidity,
        //   "Invalid user balance",
        // )
        //
        // expect(tokenDistributorBalance.toString()).to.be.equal(
        //   new BigNumber("0.525").multipliedBy(oneEther).toFixed(),
        //   "Invalid token distributor balance",
        // )
    })


    // it("Takes out a 500 DAI flashloan, does not return the funds (revert expected)", async () => {
    //     //move funds to the MockFlashLoanReceiver contract
    //
    //     await _mockFlasLoanReceiverInstance.setFailExecutionTransfer(true)
    //
    //     await expectRevert(
    //         _lendingPoolInstance.flashLoan(
    //             _mockFlasLoanReceiverInstance.address,
    //             _daiAddress,
    //             new BigNumber(500).multipliedBy(oneEther),
    //             "0x10"
    //         ),
    //         "The actual balance of the protocol is inconsistent",
    //     )
    // });
    //
    //

    // it("Deposits ETH into the reserve", async () => {
    //   const amountToDeposit = await convertToCurrencyDecimals(ETHEREUM_ADDRESS, "1")
    //
    //   await _lendingPoolInstance.deposit(ETHEREUM_ADDRESS, amountToDeposit, "0", {
    //     from: _depositorAddress,
    //     value: amountToDeposit,
    //   })
    //
    // })

    it("Takes ETH flashloan, returns the funds correctly", async () => {
        //move funds to the MockFlashLoanReceiver contract

        // let send = web3.eth.sendTransaction({
        //   from: deployer,
        //   to: _mockFlasLoanReceiverInstance.address,
        //   value: web3.utils.toWei("0.5", "ether"),
        // })

        // const txResult = await _lendingPoolInstance.flashLoan(
        //   _mockFlasLoanReceiverInstance.address,
        //   ETHEREUM_ADDRESS,
        //   new BigNumber(0.8).multipliedBy(oneEther),
        //   "0x10"
        // )
        //
        // const reserveData: any = await _lendingPoolInstance.getReserveData(ETHEREUM_ADDRESS)
        // const tokenDistributorBalance = await _web3.eth.getBalance(_tokenDistributor.address)
        //
        // const currentLiqudityRate = reserveData.liquidityRate
        // const currentLiquidityIndex = reserveData.liquidityIndex
        //
        // expect(reserveData.totalLiquidity.toString()).to.be.equal("1001960000000000000")
        // expect(currentLiqudityRate.toString()).to.be.equal("0")
        // expect(currentLiquidityIndex.toString()).to.be.equal("1001960000000000000000000000")
        // expect(tokenDistributorBalance.toString()).to.be.equal("840000000000000")
    })
    //
    // it("Takes an ETH flashloan as big as the available liquidity", async () => {
    //   //move funds to the MockFlashLoanReceiver contract
    //
    //   let send = web3.eth.sendTransaction({
    //     from: deployer,
    //     to: _mockFlasLoanReceiverInstance.address,
    //     value: web3.utils.toWei("0.5", "ether"),
    //   })
    //
    //   const txResult = await _lendingPoolInstance.flashLoan(
    //     _mockFlasLoanReceiverInstance.address,
    //     ETHEREUM_ADDRESS,
    //     "1001960000000000000",
    //     "0x10"
    //   )
    //
    //   const reserveData: any = await _lendingPoolInstance.getReserveData(ETHEREUM_ADDRESS)
    //   const tokenDistributorBalance = await _web3.eth.getBalance(_tokenDistributor.address)
    //
    //   const currentLiqudityRate = reserveData.liquidityRate
    //   const currentLiquidityIndex = reserveData.liquidityIndex
    //
    //   expect(reserveData.totalLiquidity.toString()).to.be.equal("1004414802000000000")
    //   expect(currentLiqudityRate.toString()).to.be.equal("0")
    //   expect(currentLiquidityIndex.toString()).to.be.equal("1004414802000000000000000000")
    //   expect(tokenDistributorBalance.toString()).to.be.equal("1892058000000000")
    // })
    //
    // it("Takes ETH flashloan, does not return the funds (revert expected)", async () => {
    //   //move funds to the MockFlashLoanReceiver contract
    //
    //   let send = web3.eth.sendTransaction({
    //     from: deployer,
    //     to: _mockFlasLoanReceiverInstance.address,
    //     value: web3.utils.toWei("0.5", "ether"),
    //   })
    //
    //   await _mockFlasLoanReceiverInstance.setFailExecutionTransfer(true)
    //
    //   await expectRevert(
    //     _lendingPoolInstance.flashLoan(
    //       _mockFlasLoanReceiverInstance.address,
    //       ETHEREUM_ADDRESS,
    //       new BigNumber(0.8).multipliedBy(oneEther),
    //       "0x10"
    //       ),
    //     "The actual balance of the protocol is inconsistent",
    //   )
    // })
    //
    // it("tries to take a very small flashloan, which would result in 0 fees (revert expected)", async () => {
    //   //move funds to the MockFlashLoanReceiver contract
    //
    //   await expectRevert(
    //     _lendingPoolInstance.flashLoan(
    //       _mockFlasLoanReceiverInstance.address,
    //       ETHEREUM_ADDRESS,
    //       "1", //1 wei loan
    //       "0x10"
    //       ),
    //     "The requested amount is too small for a flashLoan.",
    //   )
    // })
    //
    //
    // it("tries to take a flashloan that is bigger than the available liquidity (revert expected)", async () => {
    //   //move funds to the MockFlashLoanReceiver contract
    //
    //   await expectRevert(
    //     _lendingPoolInstance.flashLoan(
    //       _mockFlasLoanReceiverInstance.address,
    //       ETHEREUM_ADDRESS,
    //       "1004415000000000000", //slightly higher than the available liquidity
    //       "0x10"
    //       ),
    //     "There is not enough liquidity available to borrow",
    //   )
    // })
    //
    //
    // it("tries to take a flashloan using a non contract address as receiver (revert expected)", async () => {
    //   //move funds to the MockFlashLoanReceiver contract
    //
    //   await expectRevert(
    //     _lendingPoolInstance.flashLoan(
    //       deployer,
    //       ETHEREUM_ADDRESS,
    //       "1000000000000000000",
    //       "0x10"
    //       ),
    //     "revert",
    //   )
    // })
    //
    //
    //

})
