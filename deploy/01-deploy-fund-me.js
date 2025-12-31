const {networkConfig} = require("../helper-hardhat-config")

module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy, log} = deployments;
    const {deployer} = await getNamedAccounts();
    const chainID = network.config.chainID
    const ethUsdPriceFeedAddress = networkConfig[chainID]["ethUsdPriceFeed"]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [],
        log: true
    })
}