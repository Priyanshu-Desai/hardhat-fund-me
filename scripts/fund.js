const { deployments, ethers, getNamedAccounts } = require("hardhat")

async function main() {
    const { deployer } = await getNamedAccounts()
    const fundMeDeployment = await deployments.get("FundMe")
    const deployerSigner = await ethers.getSigner(deployer)
    const fundMe = await ethers.getContractAt(
        "FundMe",
        fundMeDeployment.address,
        deployerSigner
    )
    console.log("Funding contract...")
    const transactionResponse = await fundMe.fund({value: ethers.parseEther("0.1")})
    await transactionResponse.wait(1)
    console.log("Funded!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })