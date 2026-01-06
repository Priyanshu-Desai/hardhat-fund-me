const {network} = require("hardhat");
const {networkConfig, developmentChains} = require("../helper-hardhat-config.js");
const {verify} = require("../utils/verify.js");

module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy, log} = deployments;
    const {deployer} = await getNamedAccounts();
    const chainID = network.config.chainId
    let ethUsdPriceFeedAddress;
    if (developmentChains.includes(network.name)){
        const ethUsdAggregator = await deployments.get("MockV3AggregatorContract");
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainID]["ethUsdPriceFeed"];
    }
    log("Deploying FundMe")
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log("Done deploying FundMe")
    log("__________________________________________________")
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        log("Verifying FundMe...")
        await verify(fundMe.address, [ethUsdPriceFeedAddress]);
    }
}

module.exports.tags = ["all", "FundMe"]