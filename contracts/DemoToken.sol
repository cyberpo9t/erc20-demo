// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

using SafeMath for uint256;

contract DemoToken is ERC20, Ownable {
    mapping(address => uint256) accountMintDate;
    uint256 _mintAmount = 1 * 10 ** decimals();
    uint256 _mintCost = 0.0001 ether;

    constructor() ERC20("DemoToken", "DT") {
        _mint(msg.sender, 100000000 * 10 ** decimals());
    }

    function mint() external payable {
        require(msg.value > _mintCost);
        uint256 amount = _mintAmount.mul(msg.value.div(_mintCost));
        if (block.timestamp - accountMintDate[msg.sender] >= 1 days) {
            _mint(msg.sender, amount);
            accountMintDate[msg.sender] = block.timestamp;
            uint256 refund = msg.value.sub(amount.mul(_mintCost));
            transferETH(payable(msg.sender), refund);
        }
    }

    function transferETH(address payable _to, uint256 amount) private {
        _to.transfer(amount);
    }

    function modifyRate(
        uint256 mintAmount,
        uint256 mintCost
    ) external onlyOwner {
        _mintAmount = mintAmount;
        _mintCost = mintCost;
    }

    function harvest() external onlyOwner {
        transferETH(payable(msg.sender), address(this).balance);
    }

    function deleteContract() external onlyOwner {
        selfdestruct(payable(msg.sender));
    }
}
