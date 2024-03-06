// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
 import "@openzeppelin/contracts/access/Ownable.sol"; 

interface IERC20EXT{
    function decimals() external pure returns (uint8);
    function mint(address to, uint256 amount) external;
}


contract ScalarMarketVault is Ownable{
    IERC20EXT public longToken;
    IERC20EXT public shortToken;
    IERC20 public usdcToken;

    address public POOL_ADDRESS;
    
    uint256 public BASE = 1000;
    uint256 public longPrice;

    uint256 public startRange;
    uint256 public endRange;

    uint24 public poolFee;

    mapping(uint24 => int24) public  feeAmountTickSpacing;
    int24 public TICK_SPACING;

    constructor(address _longTokenAddress, address _shortTokenAddress, address _usdcTokenAddress, uint256 _startRange, uint256 _endRange) Ownable(msg.sender){
        longToken = IERC20EXT(_longTokenAddress);
        shortToken = IERC20EXT(_shortTokenAddress);
        usdcToken = IERC20(_usdcTokenAddress);
        startRange = _startRange;
        endRange = _endRange;

        feeAmountTickSpacing[500] = 10;
        feeAmountTickSpacing[3000] = 60;
        feeAmountTickSpacing[10000] = 200;
    }

    function mintLongShort(address recipient, uint256 amountIn) public {

        require(usdcToken.transferFrom(recipient, address(this), amountIn*10**6), "USDC transfer failed");

        longToken.mint(recipient, amountIn*10**longToken.decimals()); 
        shortToken.mint(recipient, amountIn*10**shortToken.decimals()); 
    }

    function setPoolAddress(address _poolAddress)external onlyOwner{
        POOL_ADDRESS = _poolAddress;
    }



}
