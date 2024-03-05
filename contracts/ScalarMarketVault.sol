// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
  

interface IERC20EXT{
    function decimals() external pure returns (uint8);
    function mint(address to, uint256 amount) external;
}


// interface IUSDC{
//     function transferFrom(address sender, address recipient, uint256 amount)external returns(bool);

// }
// interface ILongToken{
//       function mint(address to, uint256 amount) external;
//       function transferFrom(address sender, address receiver,uint256 amount)external;

// }

// interface IShortToken{
//     function mint(address to, uint256 amount) external;
//     function transferFrom(address sender, address receiver,uint256 amount)external;
// }

// interface IUniswapV3Factory {
//     function createPool(address tokenA, address tokenB, uint24 fee) external returns (address pool);
// }

// interface IUniswapV3Pool {
//     function slot0() external view returns (
//         uint160 sqrtPriceX96,
//         int24 tick,
//         uint16 observationIndex,
//         uint16 observationCardinality,
//         uint16 observationCardinalityNext,
//         uint8 feeProtocol,
//         bool unlocked
//     );
//     function initialize(uint160 sqrtPriceX96) external;

// }
// interface INonfungiblePositionManager{
//     struct MintParams {
//     address token0;
//     address token1;
//     uint24 fee;
//     int24 tickLower;
//     int24 tickUpper;
//     uint128 amount0Desired;
//     uint128 amount1Desired;
//     uint256 amount0Min;
//     uint256 amount1Min;
//     address recipient;
//     uint256 deadline;
// }
  
//     function mint(MintParams calldata params)external payable returns (uint256 tokenId,uint128 liquidity, uint256 amount0,uint256 amount1);
// }

contract ScalarMarketVault{
    IERC20EXT public longToken;
    IERC20EXT public shortToken;
    IERC20 public usdcToken;

    // address public constant UNISWAP_V3_FACTORY_ADDRESS = 0x0227628f3F023bb0B980b67D528571c95c6DaC1c;
    // IUniswapV3Factory public uniswapV3Factory = IUniswapV3Factory(UNISWAP_V3_FACTORY_ADDRESS);

    // address public constant NONFUNGIBLE_POSITION_MANAGER = 0x1238536071E1c677A632429e3655c799b22cDA52;
    // INonfungiblePositionManager public positionManager = INonfungiblePositionManager(NONFUNGIBLE_POSITION_MANAGER);

    // address public constant USDC_ADDRESS = 0xD87bdC14576BB9247DF4757DE3A1e02a992b3f10;
    // IUSDC public usdc = IUSDC(USDC_ADDRESS);

    address public POOL_ADDRESS;
    
    uint256 public BASE = 1000;
    uint256 public longPrice;

    uint256 public startRange;
    uint256 public endRange;

    uint24 public poolFee;

    mapping(uint24 => int24) public  feeAmountTickSpacing;
    int24 public TICK_SPACING;

    constructor(address _longTokenAddress, address _shortTokenAddress, address _usdcTokenAddress, uint256 _startRange, uint256 _endRange)  {
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



}
