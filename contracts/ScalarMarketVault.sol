// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './tokens/LongToken.sol';
import './tokens/ShortToken.sol';
import './tokens/USDC.sol';

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ScalarMarketVault  {
    USDC public usdc;
    LongToken public longToken;
    ShortToken public shortToken;

    uint256 public BASE = 1000;
    uint256 public longPrice;

    uint256 public startRange;
    uint256 public endRange;
    uint256 public currentValue;

    constructor(address _usdcAddress, address _longTokenAddress, address _shortTokenAddress, uint256 _startRange, uint256 _endRange, uint256 _currentValue)  {
        usdc = USDC(_usdcAddress);
        longToken = LongToken(_longTokenAddress);
        shortToken = ShortToken(_shortTokenAddress);
        startRange = _startRange;
        endRange = _endRange;
        currentValue = _currentValue;
    }

    function mintLongShort(uint256 usdcAmount) public {
        require(usdc.transferFrom(msg.sender, address(this), usdcAmount), "USDC transfer failed");

    
        longToken.mint(msg.sender, usdcAmount); 
        shortToken.mint(msg.sender, usdcAmount); 
    }

    function createPool()internal{

    }

    function swap() public{

    }

    function redeem(uint256 longAmount, uint256 shortAmount) public {
        require(longToken.transferFrom(msg.sender, address(this), longAmount), "Long token transfer failed");
        require(shortToken.transferFrom(msg.sender, address(this), shortAmount), "Short token transfer failed");

        getLongPrice();
        uint256 shortPrice = BASE - longPrice; 
        
        uint256 totalValue = (longAmount * longPrice + shortAmount * shortPrice) / BASE;
        require(usdc.transfer(msg.sender, totalValue), "USDC transfer failed");
    }
    

    function getLongPrice()public{
            uint256 distanceFromStart = currentValue - startRange;
            uint256 rangeLength = endRange - startRange;
            uint256 tempPrice = distanceFromStart*1000/rangeLength;
            longPrice = min(1,tempPrice);
    }


    function setCurrentValue(uint256 _currentValue)external {
            currentValue = _currentValue;
    }

    function min(uint256 a, uint256 b)internal pure returns(uint256){
        if (a<b){
            return a;
        }else{
            return b;
        }
    }
}
