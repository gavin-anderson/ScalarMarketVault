// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './tokens/LongToken.sol';
import './tokens/ShortToken.sol';


interface IUSDC{
    function transferFrom(address sender, address recipient, uint256 amount)external returns(bool);

}

interface IUniswapV3Factory {
    function createPool(address tokenA, address tokenB, uint24 fee) external returns (address pool);
}

interface IUniswapV3Pool {
    function slot0() external view returns (
        uint160 sqrtPriceX96,
        int24 tick,
        uint16 observationIndex,
        uint16 observationCardinality,
        uint16 observationCardinalityNext,
        uint8 feeProtocol,
        bool unlocked
    );
}

contract ScalarMarketVault  {
    LongToken public longToken;
    ShortToken public shortToken;

    address public constant UNISWAP_V3_FACTORY_ADDRESS = 0x0227628f3F023bb0B980b67D528571c95c6DaC1c;
    IUniswapV3Factory private uniswapV3Factory = IUniswapV3Factory(UNISWAP_V3_FACTORY_ADDRESS);

    address public constant USDC_ADDRESS = 0x2C032Aa43D119D7bf4Adc42583F1f94f3bf3023a;
    IUSDC private usdc = IUSDC(USDC_ADDRESS);

    address public POOL_ADDRESS;
    
    

    uint256 public BASE = 1000;
    uint256 public longPrice;

    uint256 public startRange;
    uint256 public endRange;

    constructor(address _longTokenAddress, address _shortTokenAddress, uint256 _startRange, uint256 _endRange)  {
        longToken = LongToken(_longTokenAddress);
        shortToken = ShortToken(_shortTokenAddress);
        startRange = _startRange;
        endRange = _endRange;
    }

    function mintLongShort(uint256 usdcAmount) public {
        require(usdc.transferFrom(msg.sender, address(this), usdcAmount), "USDC transfer failed");

        longToken.mint(msg.sender, usdcAmount); 
        shortToken.mint(msg.sender, usdcAmount); 
    }

    function createUniPool(address tokenA, address tokenB, uint24 fee) public returns (address){
        POOL_ADDRESS = uniswapV3Factory.createPool(tokenA, tokenB, fee);
        require(POOL_ADDRESS != address(0), "Failed to create Uniswap V3 Pool");
        return POOL_ADDRESS;
    }

    // function redeem(uint256 amount) public {
    //     require(longToken.transferFrom(msg.sender, address(this), amount), "Long token transfer failed");
    //     require(shortToken.transferFrom(msg.sender, address(this), amount), "Short token transfer failed");
        
       

    //     require(usdc.balanceof(this)>= totalValue, "Contract doesn't have enough money");
    //     require(usdc.transfer(msg.sender, totalValue), "USDC transfer failed");
    // }
    

    function getUniSqrtPrice()public returns(uint160 sqrtPriceX96){
        IUniswapV3Pool pool = IUniswapV3Pool(POOL_ADDRESS);
        (sqrtPriceX96, , , , , , ) = pool.slot0();
    }



}
