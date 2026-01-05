const {network} = require("hardhat");
const {developmentChains, DECIMALS, INITIAL_ANSWER} = require("../helper-hardhat-config.js")

module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy, log} = deployments;
    const {deployer} = await getNamedAccounts();
    const chainID = network.config.chainID;

    if(developmentChains.includes(network.name)){
        log("Deploying mocks...")
        await deploy('MockV3AggregatorContract', {
            contract: 'MockV3AggregatorContract',
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        })
        log("Done deploying mocks...")
        log("__________________________________________________")
    }
}

module.exports.tags = ["all", "mock"]