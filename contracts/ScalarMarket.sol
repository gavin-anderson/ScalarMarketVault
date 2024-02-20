// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; 
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ScalarMarketVault is ERC20, Ownable {
    IERC20 public usdc;
    ERC20 public longToken;
    ERC20 public shortToken;

    uint256 public BASE = 1000;
    uint256 public longPrice = 500; // Starting price, assuming 18 decimals like Ether

    constructor(address _usdcAddress, address _longTokenAddress, address _shortTokenAddress) ERC20("ScalarMarketVault", "SMV") {
        usdc = IERC20(_usdcAddress);
        longToken = ERC20(_longTokenAddress);
        shortToken = ERC20(_shortTokenAddress);
    }

    function deposit(uint256 usdcAmount) public {
        require(usdc.transferFrom(msg.sender, address(this), usdcAmount), "USDC transfer failed");

        // Mint Long and Short tokens
        longToken.mint(msg.sender, usdcAmount); // Assuming 1:1 for simplicity
        shortToken.mint(msg.sender, usdcAmount); // Assuming 1:1 for simplicity
    }

    function setLongPrice(uint256 _longPrice) public onlyOwner {
        longPrice = _longPrice;
    }

    function redeem(uint256 longAmount, uint256 shortAmount) public {
        require(longToken.transferFrom(msg.sender, address(this), longAmount), "Long token transfer failed");
        require(shortToken.transferFrom(msg.sender, address(this), shortAmount), "Short token transfer failed");

        uint256 shortPrice = BASE - longPrice; // Calculate short price based on long price

        // Calculate redemption value
        uint256 totalValue = (longAmount * longPrice + shortAmount * shortPrice) / BASE;
        require(usdc.transfer(msg.sender, totalValue), "USDC transfer failed");
    }
}
