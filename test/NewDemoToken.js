const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect, should } = require("chai");
const { ethers } = require("hardhat");

describe("NewDemoToken", function () {
    async function deployNewDemoTokenFixture() {
        const TOTAL_SUPPLY = 1000;
        const MAX_DAILY_MINT_PER_ACCOUNT = 10;
        const ETH_TO_TOKEN_RATIO = 1;

        const [owner, otherAccount1, otherAccount2] = await ethers.getSigners();

        const NewDemoTokenFactory = await ethers.getContractFactory(
            "NewDemoToken"
        );
        const newDemoToken = await NewDemoTokenFactory.deploy(
            TOTAL_SUPPLY,
            MAX_DAILY_MINT_PER_ACCOUNT,
            ETH_TO_TOKEN_RATIO
        );

        return {
            newDemoToken,
            TOTAL_SUPPLY,
            MAX_DAILY_MINT_PER_ACCOUNT,
            ETH_TO_TOKEN_RATIO,
            owner,
            otherAccount1,
            otherAccount2,
        };
    }

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            const { newDemoToken, owner } = await loadFixture(
                deployNewDemoTokenFixture
            );
            expect(await newDemoToken.owner()).to.equal(owner.address);
        });

        it("Should assign the total supply of tokens to the owner", async function () {
            const { newDemoToken, owner } = await loadFixture(
                deployNewDemoTokenFixture
            );
            ownerBalance = await newDemoToken.balanceOf(owner.address);
            expect(await newDemoToken.totalSupply()).to.equal(ownerBalance);
        });
    });

    describe("Transactions", function () {
        it("Should transfer tokens between accounts", async function () {
            const { newDemoToken, owner, otherAccount1, otherAccount2 } =
                await loadFixture(deployNewDemoTokenFixture);

            // 从owner发送10个Token给otherAccount1
            await expect(
                newDemoToken.transfer(otherAccount1.address, 10)
            ).to.changeTokenBalances(
                newDemoToken,
                [owner, otherAccount1],
                [-10, 10]
            );

            // 从otherAccount1发送10个token给otherAccount2
            await expect(
                newDemoToken
                    .connect(otherAccount1)
                    .transfer(otherAccount2.address, 10)
            ).to.changeTokenBalances(
                newDemoToken,
                [otherAccount1, otherAccount2],
                [-10, 10]
            );
        });

        it("Should emit Transfer events", async function () {
            const { newDemoToken, owner, otherAccount1, otherAccount2 } =
                await loadFixture(deployNewDemoTokenFixture);

            // 从owner发送10个Token给otherAccount1
            await expect(newDemoToken.transfer(otherAccount1.address, 10))
                .to.emit(newDemoToken, "Transfer")
                .withArgs(owner.address, otherAccount1.address, 10);

            // 从otherAccount1发送10个token给otherAccount2
            await expect(
                newDemoToken
                    .connect(otherAccount1)
                    .transfer(otherAccount2.address, 10)
            )
                .to.emit(newDemoToken, "Transfer")
                .withArgs(otherAccount1.address, otherAccount2.address, 10);
        });
    });

    describe("Mint", function () {
        it("Should use 10 wei mint 10 token", async function () {
            const { newDemoToken, otherAccount1 } = await loadFixture(
                deployNewDemoTokenFixture
            );

            // otherAccount1使用10个wei铸造10个token
            await expect(
                newDemoToken.connect(otherAccount1).mint({ value: 10 })
            ).to.changeEtherBalance(newDemoToken, 10);
        });

        it("Should not exceed a maximum of 10 * 10 ** 18 tokens per day mint", async function () {
            const { newDemoToken, otherAccount1 } = await loadFixture(
                deployNewDemoTokenFixture
            );

            // otherAccount1使用11个ether铸造应该失败
            await expect(
                newDemoToken
                    .connect(otherAccount1)
                    .mint({ value: ethers.utils.parseEther("11") })
            ).to.revertedWith("Exceeds daily mint limit");
        });

        it("Should not exceed a maximum of 1 mint per day", async function () {
            const { newDemoToken, otherAccount1 } = await loadFixture(
                deployNewDemoTokenFixture
            );
            // otherAccount1今日使用2次mint，第二次应该铸造失败
            newDemoToken.connect(otherAccount1).mint({ value: 10 });
            await expect(
                newDemoToken.connect(otherAccount1).mint({ value: 10 })
            ).to.revertedWith("Can only mint once per day");
        });
    });

    describe("Owner", function () {
        it("Should be able to set the ratio of mint", async function () {
            const { newDemoToken } = await loadFixture(
                deployNewDemoTokenFixture
            );

            // 设置mint的比例
            const ratio = 10;
            const setEthToTokenRatioTx = await newDemoToken.setEthToTokenRatio(
                ratio
            );
            await setEthToTokenRatioTx.wait();
            expect(await newDemoToken.ETH_TO_TOKEN_RATIO()).to.equal(10);
        });

        it("Should be able to set the MAX_DAILY_MINT_PER_ACCOUNT of mint", async function () {
            const { newDemoToken } = await loadFixture(
                deployNewDemoTokenFixture
            );

            // 设置MAX_DAILY_MINT_PER_ACCOUNT
            const MAX_DAILY_MINT_PER_ACCOUNT = ethers.utils.parseEther("5");
            const setDailyMintLimitTx = await newDemoToken.setDailyMintLimit(
                MAX_DAILY_MINT_PER_ACCOUNT
            );
            await setDailyMintLimitTx.wait();
            expect(await newDemoToken.MAX_DAILY_MINT_PER_ACCOUNT()).to.equal(
                MAX_DAILY_MINT_PER_ACCOUNT
            );
        });

        it("Should be able to withdraw eth", async function () {
            const { newDemoToken, owner } = await loadFixture(
                deployNewDemoTokenFixture
            );

            const balance = await ethers.provider.getBalance(
                newDemoToken.address
            );
            // 取回合约上所有eth
            expect(await newDemoToken.withdrawETH()).to.changeEtherBalance(
                owner,
                balance
            );
        });
    });
});
