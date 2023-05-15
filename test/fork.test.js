const USDT_ABI = require("./usdt-abi.json");
// USDT合约主网地址
const USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const { ethers } = require("hardhat");

describe("Fork", function () {
    it("Testing fork data", async function () {
        const provider = ethers.provider;
        // 创建合约对象
        const USDT = new ethers.Contract(USDT_ADDRESS, USDT_ABI, provider);
        // 使用合约totalSupply方法获取发行量
        let totalSupply = await USDT.totalSupply();
        console.log(totalSupply.toString());
    });
});
