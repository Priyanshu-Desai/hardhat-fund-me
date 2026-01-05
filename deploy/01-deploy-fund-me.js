const {network} = require("hardhat");
const {networkConfig, developmentChains} = require("../helper-hardhat-config.js");

module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy, log} = deployments;
    const {deployer} = await getNamedAccounts();
    const chainID = network.config.chainID
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
        log: true
    })
    log("Done deploying FundMe")
    log("__________________________________________________")
}

module.exports.tags = ["all", "FundMe"]