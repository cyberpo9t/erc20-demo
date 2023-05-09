const { ethers, run, network } = require("hardhat");

async function main() {
    const DemoTokenFactory = await ethers.getContractFactory("DemoToken");
    console.log("Deploying contract...");
    const demoToken = await DemoTokenFactory.deploy();
    await demoToken.deployed();
    console.log(`Deployed contract to: ${demoToken.address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
