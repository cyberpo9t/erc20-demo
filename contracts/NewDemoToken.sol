// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

using SafeMath for uint256;

contract NewDemoToken is ERC20, Ownable {
    uint256 public MAX_DAILY_MINT_PER_ACCOUNT; // 每日每个账户的最大铸造数量
    uint256 public ETH_TO_TOKEN_RATIO; // ETH 铸造代币的比例

    mapping(address => uint256) private lastMintTimestamp; // 每个账户的最后一次铸造时间戳

    constructor(
        uint256 initialSupply,
        uint256 maxDailyMintPerAccount,
        uint256 ethToTokenRatio
    ) ERC20("NewDemoToken", "NDT") {
        _mint(msg.sender, initialSupply * 10 ** decimals());
        MAX_DAILY_MINT_PER_ACCOUNT = maxDailyMintPerAccount * 10 ** decimals();
        ETH_TO_TOKEN_RATIO = ethToTokenRatio;
    }

    function mint() external payable {
        require(msg.value > 0, "Invalid ETH amount");

        address sender = _msgSender();
        uint256 currentTime = block.timestamp;

        require(
            lastMintTimestamp[sender] + 1 days < currentTime,
            "Can only mint once per day"
        );

        uint256 tokenAmount = msg.value * ETH_TO_TOKEN_RATIO;

        require(
            tokenAmount <= MAX_DAILY_MINT_PER_ACCOUNT,
            "Exceeds daily mint limit"
        );

        _mint(sender, tokenAmount);
        lastMintTimestamp[sender] = currentTime;
    }

    function setDailyMintLimit(uint256 limit) external onlyOwner {
        require(limit > 0, "Invalid limit");

        MAX_DAILY_MINT_PER_ACCOUNT = limit;
    }

    function setEthToTokenRatio(uint256 ratio) external onlyOwner {
        require(ratio > 0, "Invalid ratio");

        ETH_TO_TOKEN_RATIO = ratio;
    }

    function withdrawETH() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");

        payable(owner()).transfer(balance);
    }
}
