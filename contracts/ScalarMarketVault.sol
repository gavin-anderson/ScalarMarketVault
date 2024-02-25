// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;
pragma abicoder v2;

  

interface IUSDC{
    function transferFrom(address sender, address recipient, uint256 amount)external returns(bool);

}
interface ILongToken{
      function mint(address to, uint256 amount) external;
      function transferFrom(address sender, address receiver,uint256 amount)external;

}

interface IShortToken{
    function mint(address to, uint256 amount) external;
    function transferFrom(address sender, address receiver,uint256 amount)external;
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
    function initialize(uint160 sqrtPriceX96) external;

}
interface INonfungiblePositionManager{
    struct MintParams {
    address token0;
    address token1;
    uint24 fee;
    int24 tickLower;
    int24 tickUpper;
    uint128 amount0Desired;
    uint128 amount1Desired;
    uint256 amount0Min;
    uint256 amount1Min;
    address recipient;
    uint256 deadline;
}
  
    function mint(MintParams calldata params)external payable returns (uint256 tokenId,uint128 liquidity, uint256 amount0,uint256 amount1);
}

contract ScalarMarketVault  {
    ILongToken public longToken;
    IShortToken public shortToken;

    address public constant UNISWAP_V3_FACTORY_ADDRESS = 0x0227628f3F023bb0B980b67D528571c95c6DaC1c;
    IUniswapV3Factory public uniswapV3Factory = IUniswapV3Factory(UNISWAP_V3_FACTORY_ADDRESS);

    address public constant NONFUNGIBLE_POSITION_MANAGER = 0x1238536071E1c677A632429e3655c799b22cDA52;
    INonfungiblePositionManager public positionManager = INonfungiblePositionManager(NONFUNGIBLE_POSITION_MANAGER);

    address public constant USDC_ADDRESS = 0xd6d2BFd492bC4ba4da315d9C9a1089c494E2F4eA;
    IUSDC public usdc = IUSDC(USDC_ADDRESS);

    address public POOL_ADDRESS;
    
    uint256 public BASE = 1000;
    uint256 public longPrice;

    uint256 public startRange;
    uint256 public endRange;

    uint24 public poolFee;

    int24 private constant MIN_TICK = -887272;
    int24 private constant MAX_TICK = -MIN_TICK;
    int24 private constant TICK_SPACING = 60;

    constructor(address _longTokenAddress, address _shortTokenAddress, uint256 _startRange, uint256 _endRange)  {
        longToken = ILongToken(_longTokenAddress);
        shortToken = IShortToken(_shortTokenAddress);
        startRange = _startRange;
        endRange = _endRange;
    }

    function mintLongShort(uint256 amount) public {

        require(usdc.transferFrom(msg.sender, address(this), amount*10**6), "USDC transfer failed");

        longToken.mint(msg.sender, amount*10**18); 
        shortToken.mint(msg.sender, amount*10**18); 
    }

    function createUniPool(address tokenA, address tokenB, uint24 fee) public returns (address){
        poolFee = fee;
        POOL_ADDRESS = uniswapV3Factory.createPool(tokenA, tokenB, poolFee);
        require(POOL_ADDRESS != address(0), "Failed to create Uniswap V3 Pool");
        return POOL_ADDRESS;
    }

    function initPool(uint160 sqrtPriceX96) public {
        IUniswapV3Pool pool = IUniswapV3Pool(POOL_ADDRESS);
        pool.initialize(sqrtPriceX96);
    }

    function mintNewPosition(uint128 amount0Add, uint128 amount1Add) external returns(uint256 tokenId,uint128 liquidity,uint256 amount0, uint256 amount1){
        
        INonfungiblePositionManager.MintParams
            memory params = INonfungiblePositionManager.MintParams({
                token0: address(longToken),
                token1: address(shortToken),
                fee: poolFee,
                tickLower: (MIN_TICK / TICK_SPACING) * TICK_SPACING,
                tickUpper: (MAX_TICK / TICK_SPACING) * TICK_SPACING,
                amount0Desired: amount0Add,
                amount1Desired: amount1Add,
                amount0Min: 0,
                amount1Min: 0,
                recipient: msg.sender,
                deadline: block.timestamp
            });

        (tokenId, liquidity, amount0, amount1) = positionManager.mint(params);
   
       
    }

    


    function getUniSqrtPrice()public view returns(uint160 sqrtPriceX96){
        IUniswapV3Pool pool = IUniswapV3Pool(POOL_ADDRESS);
        (sqrtPriceX96, , , , , , ) = pool.slot0();
    }



}
