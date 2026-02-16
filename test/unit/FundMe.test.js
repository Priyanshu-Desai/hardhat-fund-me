const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");

describe("FundMe",  () => {
    let fundMe
    let deployer
    let mockV3AggregatorContract
    const sendValue = ethers.parseEther("0.1")
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
            const response = await fundMe.s_priceFeed()
            assert.equal(response, mockV3AggregatorContract.target)
        })
    })
    describe("fund", () => {
        it("Fails if you don't send enough ETH", async () => {
            await expect(fundMe.fund()).to.be.revertedWith("sorry, you must pay a minimum of USD 10.")
        })
        it("updates the sender into the data structure", async () => {
            await fundMe.fund({ value: sendValue })
            const funder = await fundMe.s_funders(0)
            assert.equal(funder, deployer)
        })
        it("updates the amount funded data structure", async () => {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.s_addressToAmountFunded(deployer)
            assert.equal(response.toString(), sendValue.toString())
        })
    })
    describe("get-version", () => {
        it("gets the version of the price feed contract", async () => {
            const version = await mockV3AggregatorContract.version()
            assert.equal(version.toString(), "0")
        })
    })
    describe("withdraw", () => {
        beforeEach(async () => {
            await fundMe.fund({ value: sendValue })
        })
        it("withdraw ETH from a single funder", async () => {
            const startingFundMeBalance = BigInt(
                (await ethers.provider.getBalance(fundMe.target)).toString()
            )
            const startingDeployerBalance = BigInt(
                (await ethers.provider.getBalance(deployer)).toString()
            )
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice, gasPrice } = transactionReceipt
            const resolvedGasPrice = effectiveGasPrice ?? gasPrice ?? transactionResponse.gasPrice
            const gasCost = BigInt(gasUsed.toString()) * BigInt(resolvedGasPrice.toString())
            const endingFundMeBalance = BigInt(
                (await ethers.provider.getBalance(fundMe.target)).toString()
            )
            const endingDeployerBalance = BigInt(
                (await ethers.provider.getBalance(deployer)).toString()
            )
            assert.equal(endingFundMeBalance.toString(), "0")
            const expectedDeployerBalance = startingFundMeBalance + startingDeployerBalance - gasCost
            assert.equal(
                expectedDeployerBalance.toString(),
                endingDeployerBalance.toString()
            )
        })
        it("allows us to withdraw with multiple funders", async () => {
            const accounts = await ethers.getSigners()
            for (let i = 1; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(accounts[i])
                await fundMeConnectedContract.fund({ value: sendValue })
            }
            const startingFundMeBalance = BigInt(
                (await ethers.provider.getBalance(fundMe.target)).toString()
            )
            const startingDeployerBalance = BigInt(
                (await ethers.provider.getBalance(deployer)).toString()
            )
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice, gasPrice } = transactionReceipt
            const resolvedGasPrice = effectiveGasPrice ?? gasPrice ?? transactionResponse.gasPrice
            const gasCost = BigInt(gasUsed.toString()) * BigInt(resolvedGasPrice.toString())
            const endingFundMeBalance = BigInt(
                (await ethers.provider.getBalance(fundMe.target)).toString()
            )
            const endingDeployerBalance = BigInt(
                (await ethers.provider.getBalance(deployer)).toString()
            )
            assert.equal(endingFundMeBalance.toString(), "0")
            const expectedDeployerBalance = startingFundMeBalance + startingDeployerBalance - gasCost
            assert.equal(
                expectedDeployerBalance.toString(),
                endingDeployerBalance.toString()
            )

            await expect(fundMe.s_funders(0)).to.be.reverted
            for (let i = 1; i < 6; i++) {
                const amountFunded = await fundMe.s_addressToAmountFunded(
                    accounts[i].address
                )
                assert.equal(amountFunded.toString(), "0")
            }
        })
        it("only allows the owner to withdraw", async () => {
            const accounts = await ethers.getSigners()
            const attacker = accounts[1]
            const attackerConnectedContract = await fundMe.connect(attacker)
            await expect(attackerConnectedContract.withdraw()).to.be.revertedWithCustomError(
                fundMe,
                "FundMe__NotOwner"
            )
        })
    })
})
