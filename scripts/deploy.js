const { ethers } = require("hardhat");

async function main() {
    const DemoTokenFactory = await ethers.getContractFactory("NewDemoToken");
    console.log("Deploying contract...");
    const demoToken = await DemoTokenFactory.deploy(10000, 10, 1);
    await demoToken.deployed();
    console.log(`Deployed contract to: ${demoToken.address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
