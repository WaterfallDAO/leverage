const Comptroller = artifacts.require('Comptroller');
const JumpRateModel = artifacts.require('JumpRateModel');
const CErc20 = artifacts.require("CErc20");
const CErc20Delegator = artifacts.require('CErc20Delegator');
const CErc20Delegate = artifacts.require('CErc20Delegate');
const FeeManager = artifacts.require("FeeManager");
const CNative = artifacts.require("CNative");
const AssertPriceOracle = artifacts.require("AssertPriceOracle");
const MdexPrice = artifacts.require("MdexPrice");
const MockLink = artifacts.require("MockLink");
const ETHOracle = artifacts.require("ETHOracle");
const SimplePriceOracle = artifacts.require("SimplePriceOracle");


async function deployUsdt(deployer, network, accounts) {

    let underlyingAddress = "0xa71edc38d189767582c38a3145b5873052c3e47a";
    console.log("usdt:" + underlyingAddress);
    let comptrollerAddress = "0xE3159fE1F98d498A632B95DC57EA9bf3Cbaa5AB4";
    let exchangeRate = "100000";
    let jumpRateModelAddress = "0x2C6F151b70cb9F9546dD52Bc7a4D0Ec01B8B0082";

    await deployer.deploy(CErc20Delegate);
    let cErc20Delegate = await CErc20Delegate.deployed();
    let cErc20DelegateAddress = cErc20Delegate.address;

    await deployer.deploy(CErc20Delegator,
        underlyingAddress
        , comptrollerAddress
        , jumpRateModelAddress
        , exchangeRate
        , 'bUSDT'
        , 'bUSDT'
        , 18
        , owner
        , cErc20DelegateAddress
        , "0x0"
    );
    let cErc20Delegator = await CErc20Delegator.deployed();


}


async function deployWBTC(deployer, network, accounts) {

    let underlyingAddress = "0x66a79d23e58475d2738179ca52cd0b41d73f0bea";
    console.log("btc:" + underlyingAddress);
    let comptrollerAddress = "0xE3159fE1F98d498A632B95DC57EA9bf3Cbaa5AB4";
    let exchangeRate = "100000";
    let jumpRateModelAddress = "0x2C6F151b70cb9F9546dD52Bc7a4D0Ec01B8B0082";
    // let feeManagerAddress = "TBnRappmR3G1bi6REiBH7nw29C5zeUk2V6";
    await deployer.deploy(CErc20Delegate);
    let cErc20Delegate = await CErc20Delegate.deployed();

    let cErc20DelegateAddress = cErc20Delegate.address;
    //

    await deployer.deploy(CErc20Delegator,
        underlyingAddress
        , comptrollerAddress
        , jumpRateModelAddress
        , exchangeRate
        , 'bBTC'
        , 'bBTC'
        , 18
        , owner
        , cErc20DelegateAddress
        , "0x0"
    );
    let cErc20Delegator = await CErc20Delegator.deployed();


}


async function deployHBCH(deployer, network, accounts) {

    let underlyingAddress = "0xef3cebd77e0c52cb6f60875d9306397b5caca375";
    console.log("bch:" + underlyingAddress);
    let comptrollerAddress = "0xE3159fE1F98d498A632B95DC57EA9bf3Cbaa5AB4";
    let exchangeRate = "100000";
    let jumpRateModelAddress = "0x2C6F151b70cb9F9546dD52Bc7a4D0Ec01B8B0082";
    // let feeManagerAddress = "TBnRappmR3G1bi6REiBH7nw29C5zeUk2V6";
    await deployer.deploy(CErc20Delegate);
    let cErc20Delegate = await CErc20Delegate.deployed();

    let cErc20DelegateAddress = cErc20Delegate.address;
    //

    await deployer.deploy(CErc20Delegator,
        underlyingAddress
        , comptrollerAddress
        , jumpRateModelAddress
        , exchangeRate
        , 'bBCH'
        , 'bBCH'
        , 18
        , owner
        , cErc20DelegateAddress
        , "0x0"
    );
    let cErc20Delegator = await CErc20Delegator.deployed();


}


async function deployETH(deployer, network, accounts) {


    let underlyingAddress = "0x64ff637fb478863b7468bc97d30a5bf3a428a1fd";
    console.log("eth:" + underlyingAddress);
    let comptrollerAddress = "0xE3159fE1F98d498A632B95DC57EA9bf3Cbaa5AB4";
    let jumpRateModelAddress = "0x2C6F151b70cb9F9546dD52Bc7a4D0Ec01B8B0082";
    let exchangeRate = "100000";

    await deployer.deploy(CErc20Delegate);
    let cErc20Delegate = await CErc20Delegate.deployed();


    await deployer.deploy(CErc20Delegator,
        underlyingAddress
        , comptrollerAddress
        , jumpRateModelAddress
        , exchangeRate
        , 'bETH'
        , 'bETH'
        , 18
        , owner
        , cErc20Delegate.address
        , "0x0"
    );
    let cErc20Delegator = await CErc20Delegator.deployed();
    // cErc20Delegator._setFeeManager(feeManagerAddress);

}


async function deployLTC(deployer, network, accounts) {


    let underlyingAddress = "0xecb56cf772b5c9a6907fb7d32387da2fcbfb63b4";
    console.log("ltc:" + underlyingAddress);
    let comptrollerAddress = "0xE3159fE1F98d498A632B95DC57EA9bf3Cbaa5AB4";
    let exchangeRate = "100000";
    let jumpRateModelAddress = "0x2C6F151b70cb9F9546dD52Bc7a4D0Ec01B8B0082";

    await deployer.deploy(CErc20Delegate);
    let cErc20Delegate = await CErc20Delegate.deployed();


    await deployer.deploy(CErc20Delegator,
        underlyingAddress
        , comptrollerAddress
        , jumpRateModelAddress
        , exchangeRate
        , 'bLTC'
        , 'bLTC'
        , 18
        , owner
        , cErc20Delegate.address
        , "0x0"
    );
    let cErc20Delegator = await CErc20Delegator.deployed();

}


async function deployWETH(deployer, network, accounts) {

    let underlyingAddress = "0x5545153ccfca01fbd7dd11c0b23ba694d9509a6f";
    console.log("weth:" + underlyingAddress);
    let comptrollerAddress = "0xE3159fE1F98d498A632B95DC57EA9bf3Cbaa5AB4";
    let exchangeRate = "100000";
    let jumpRateModelAddress = "0x2C6F151b70cb9F9546dD52Bc7a4D0Ec01B8B0082";
    await deployer.deploy(CErc20Delegate);
    let cErc20Delegate = await CErc20Delegate.deployed();


    await deployer.deploy(CErc20Delegator,
        underlyingAddress
        , comptrollerAddress
        , jumpRateModelAddress
        , exchangeRate
        , 'bWETH'
        , 'bWETH'
        , 18
        , owner
        , cErc20Delegate.address
        , "0x0"
    );
    let cErc20Delegator = await CErc20Delegator.deployed();
    // cErc20Delegator._setFeeManager(feeManagerAddress);

}


async function deployNative(deployer, network, accounts) {


    let comptrollerAddress = "0xE3159fE1F98d498A632B95DC57EA9bf3Cbaa5AB4";

    // await deployer.deploy(FeeManager);

    // let feeManager = await FeeManager.deployed();
    // let feeManager = "TBnRappmR3G1bi6REiBH7nw29C5zeUk2V6";
    let jumpRateModel = "0x2C6F151b70cb9F9546dD52Bc7a4D0Ec01B8B0082";
    let exchangeRate = "1000000";

    await deployer.deploy(CNative,
        comptrollerAddress
        , jumpRateModel
        , exchangeRate
        , 'bHT'
        , 'bHT'
        , 18
        , owner
    );
    let cNative = await CNative.deployed();
    // cNative._setFeeManager(feeManager);


}


async function deployCommon(deployer, network, accounts) {


    // await deployer.deploy(FeeManager);
    //
    // let feeManager = await FeeManager.deployed();


    await deployer.deploy(JumpRateModel
        , '0'
        , '49999999998268800'
        , '1089999999998841600'
        , '800000000000000000');

    let jumpRateModel = await JumpRateModel.deployed();

    await deployer.deploy(Comptroller);
    let comptroller = await Comptroller.deployed();

}


async function deployWETHUSDT(deployer, network, accounts) {

    let underlyingAddress = "0x499b6e03749b4baf95f9e70eed5355b138ea6c31";
    let comptrollerAddress = "0xd43B18EC0Ecb20b7317fEC5268D3da744864D442";
    let exchangeRate = "100000";
    let jumpRateModelAddress = "0x3Be59b553C826B74C7E60E102A991a984dBd7Af2";
    // let feeManagerAddress = "TBnRappmR3G1bi6REiBH7nw29C5zeUk2V6";
    // await deployer.deploy(CErc20Delegate);
    // let cErc20Delegate = await CErc20Delegate.deployed();
    let cErc20DelegateAddress = "0x220C83229d3e1D473F96690F6Fc060c4A40A9E30";


    await deployer.deploy(CErc20Delegator,
        underlyingAddress
        , comptrollerAddress
        , jumpRateModelAddress
        , exchangeRate
        , 'bWETHUSDT'
        , 'bWETHUSDT'
        , 18
        , owner
        , cErc20DelegateAddress
        , "0x0"
    );
    let cErc20Delegator = await CErc20Delegator.deployed();


}


async function deployBTCUSDT(deployer, network, accounts) {

    let underlyingAddress = "0xfbe7b74623e4be82279027a286fa3a5b5280f77c";
    console.log("BTCUSDT:" + underlyingAddress);
    let comptrollerAddress = "0xE3159fE1F98d498A632B95DC57EA9bf3Cbaa5AB4";
    let exchangeRate = "100000";
    let jumpRateModelAddress = "0x2C6F151b70cb9F9546dD52Bc7a4D0Ec01B8B0082";
    // let feeManagerAddress = "TBnRappmR3G1bi6REiBH7nw29C5zeUk2V6";
    await deployer.deploy(CErc20Delegate);
    let cErc20Delegate = await CErc20Delegate.deployed();
    let cErc20DelegateAddress = cErc20Delegate.address;


    await deployer.deploy(CErc20Delegator,
        underlyingAddress
        , comptrollerAddress
        , jumpRateModelAddress
        , exchangeRate
        , 'bBTCUSDT'
        , 'bBTCUSDT'
        , 18
        , owner
        , cErc20DelegateAddress
        , "0x0"
    );
    let cErc20Delegator = await CErc20Delegator.deployed();


}


async function deployETHUSDT(deployer, network, accounts) {

    let underlyingAddress = "0x78c90d3f8a64474982417cdb490e840c01e516d4";
    console.log("ETHUSDT:" + underlyingAddress);
    let comptrollerAddress = "0xE3159fE1F98d498A632B95DC57EA9bf3Cbaa5AB4";
    let exchangeRate = "100000";
    let jumpRateModelAddress = "0x2C6F151b70cb9F9546dD52Bc7a4D0Ec01B8B0082";
    // let feeManagerAddress = "TBnRappmR3G1bi6REiBH7nw29C5zeUk2V6";
    await deployer.deploy(CErc20Delegate);
    let cErc20Delegate = await CErc20Delegate.deployed();
    let cErc20DelegateAddress = cErc20Delegate.address;


    await deployer.deploy(CErc20Delegator,
        underlyingAddress
        , comptrollerAddress
        , jumpRateModelAddress
        , exchangeRate
        , 'bETHUSDT'
        , 'bETHUSDT'
        , 18
        , owner
        , cErc20DelegateAddress
        , "0x0"
    );
    let cErc20Delegator = await CErc20Delegator.deployed();


}


async function deployBCHUSDT(deployer, network, accounts) {

    let underlyingAddress = "0x1f0ec8e0096e145f2bf2cb4950ed7b52d1cbd35f";
    console.log("BCHUSDT:" + underlyingAddress);
    let comptrollerAddress = "0xE3159fE1F98d498A632B95DC57EA9bf3Cbaa5AB4";
    let exchangeRate = "100000";
    let jumpRateModelAddress = "0x2C6F151b70cb9F9546dD52Bc7a4D0Ec01B8B0082";
    // let feeManagerAddress = "TBnRappmR3G1bi6REiBH7nw29C5zeUk2V6";
    await deployer.deploy(CErc20Delegate);
    let cErc20Delegate = await CErc20Delegate.deployed();
    let cErc20DelegateAddress = cErc20Delegate.address;


    await deployer.deploy(CErc20Delegator,
        underlyingAddress
        , comptrollerAddress
        , jumpRateModelAddress
        , exchangeRate
        , 'bBCHUSDT'
        , 'bBCHUSDT'
        , 18
        , owner
        , cErc20DelegateAddress
        , "0x0"
    );
    let cErc20Delegator = await CErc20Delegator.deployed();


}


async function deployOracle(deployer, network, accounts) {
    let usdt = "0xa71edc38d189767582c38a3145b5873052c3e47a";
    let weth = "0x5545153ccfca01fbd7dd11c0b23ba694d9509a6f";


    await deployer.deploy(MdexPrice, usdt, weth);

    // await deployer.deploy(ETHOracle,"TENtY6C9WiCpGenjUFwf33DYTcrV7GEZuh","TNwqbPTDLgGQVfLz75NnaMfsrVHbKQBuCo");
    // await deployer.deploy(SimplePriceOracle);

    if (network == "shasta") {
        await deployer.deploy(MockLink);
        let mockLink = await MockLink.deployed();
        // mockLink.updatePrice("100000000")
        // await deployer.deploy(MockLink);
        // mockLink = await MockLink.deployed();
        // mockLink.updatePrice("100000000")
        // await deployer.deploy(MockLink);
        // mockLink = await MockLink.deployed();
        // mockLink.updatePrice("100000000")
    }


}


module.exports = async function (deployer, network, accounts) {

    if (network != "shasta" && network != "mainnet" && network != "testnet") {
        return;
    }
    owner = "0xce1b6d936153F0BEeBE8e5830356E70e96C69dfF";
    // await deployCommon(deployer, network, accounts);
    // await deployOracle(deployer, network, accounts);
    // await deployNative(deployer, network, accounts);

    // await deployUsdt(deployer, network, accounts);
    // await deployWBTC(deployer, network, accounts);
    // await deployETH(deployer, network, accounts);
    // await deployHBCH(deployer, network, accounts);
    // await deployLTC(deployer, network, accounts);
    // await deployWETH(deployer, network, accounts);

    // await deployBTCUSDT(deployer, network, accounts);
    // await deployETHUSDT(deployer, network, accounts);
    // await deployBCHUSDT(deployer, network, accounts);
    // deployShastaNative(deployer, network, accounts);

};



