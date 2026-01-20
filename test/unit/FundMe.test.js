const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");

describe("FundMe",  () => {
    let fundMe
    let deployer
    let mockV3AggregatorContract
    beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])

        const fundMeDeployment = await deployments.get("FundMe")
        const mockV3Deployment = await deployments.get("MockV3AggregatorContract")
        const deployerSigner = await ethers.getSigner(deployer)

        fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address, deployerSigner)
        mockV3AggregatorContract = await ethers.getContractAt(
            "MockV3AggregatorContract",
            mockV3Deployment.address,
            deployerSigner
        )
    })

    describe("constructor", () => {
        it("sets the aggregator addresses correctly", async () => {
            const response = await fundMe.priceFeed()
            const mockAddress = await mockV3AggregatorContract.getAddress()
            assert.equal(response, mockAddress)
        })
    })
    describe("fund", () => {
        it("Fails if you don't send enough ETH", async () => {
            await expect(fundMe.fund()).to.be.revertedWith("sorry, you must pay a minimum of USD 10.")
        })
        it("updates the sender into the data structure", async () => {
            await fundMe.fund({ value: ethers.parseEther("0.1") })
            const funder = await fundMe.funders(0)
            assert.equal(funder, deployer)
        })
        it("updates the amount funded data structure", async () => {
            await fundMe.fund({ value: ethers.parseEther("0.1") })
            const amountFunded = await fundMe.addressToAmountFunded(deployer)
            assert.equal(amountFunded.toString(), ethers.parseEther("0.1").toString())
        })
    })
    describe("get-version", () => {
        it("gets the version of the price feed contract", async () => {
            const version = await mockV3AggregatorContract.version()
            assert.equal(version.toString(), "0")
        })
    })
});