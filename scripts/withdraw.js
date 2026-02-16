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
    console.log("Withdrawing contract...")
    const transactionResponse = await fundMe.withdraw()
    await transactionResponse.wait(1)
    console.log("Withdrawn!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })