const { assert } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", () => {
    let fundMe
    let deployer
    const sendValue = ethers.parseEther("1")
    beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer
        const fundMeDeployment = await deployments.get("FundMe")
        const deployerSigner = await ethers.getSigner(deployer)
        fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address, deployerSigner)
    })
    it("allows people to fund and withdraw", async () => {
        await fundMe.fund({ value: sendValue })
        await fundMe.withdraw()
        const endingFundMeBalance = await ethers.provider.getBalance(fundMe.target)
        assert.equal(endingFundMeBalance.toString(), "0")
    })
    })