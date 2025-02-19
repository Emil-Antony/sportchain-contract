// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GameCoin is ERC20, Ownable {
    constructor() ERC20("GameCoin", "GCN") Ownable(msg.sender){
        _mint(msg.sender, 1000000 * 10 ** decimals()); // Mint 1 million tokens to deployer
    }
    // Function for deployer to mint more tokens
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // Function for deployer to send rewards to users
    function rewardUser(address user, uint256 amount) public onlyOwner {
        uint256 ownerBalance = balanceOf(owner());

    // If balance is less than required, mint in bulk (10x the amount)
        if (ownerBalance < amount) {
            uint256 mintAmount = amount - ownerBalance;
            _mint(owner(), mintAmount);
        }

        _transfer(owner(), user, amount);
    }
}