// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;

// import './tokens/LongToken.sol';
// import './tokens/ShortToken.sol';


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
    function initialize(uint160 sqrtPriceX96) external;

    function mint( address recipient,int24 tickLower,int24 tickUpper,uint128 amount,bytes calldata data) external returns(uint256 amount0, uint256 amount1);

}
interface ILongToken{
      function mint(address to, uint256 amount) external;
      function transferFrom(address sender, address receiver,uint256 amount)external;

}

interface IShortToken{
    function mint(address to, uint256 amount) external;
    function transferFrom(address sender, address receiver,uint256 amount)external;
}

interface IUniswapV3MintCallback {
        function uniswapV3MintCallback(uint256 amount0Owed, uint256 amount1Owed, bytes calldata data) external;
}

contract ScalarMarketVault is IUniswapV3MintCallback {
    ILongToken public longToken;
    IShortToken public shortToken;

    address public constant UNISWAP_V3_FACTORY_ADDRESS = 0x0227628f3F023bb0B980b67D528571c95c6DaC1c;
    IUniswapV3Factory private uniswapV3Factory = IUniswapV3Factory(UNISWAP_V3_FACTORY_ADDRESS);

    address public constant USDC_ADDRESS = 0xd6d2BFd492bC4ba4da315d9C9a1089c494E2F4eA;
    IUSDC private usdc = IUSDC(USDC_ADDRESS);

    address public POOL_ADDRESS;
    
    

    uint256 public BASE = 1000;
    uint256 public longPrice;

    uint256 public startRange;
    uint256 public endRange;

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
        POOL_ADDRESS = uniswapV3Factory.createPool(tokenA, tokenB, fee);
        require(POOL_ADDRESS != address(0), "Failed to create Uniswap V3 Pool");
        return POOL_ADDRESS;
    }

    function initPool(uint160 sqrtPriceX96) public {
        IUniswapV3Pool pool = IUniswapV3Pool(POOL_ADDRESS);
        pool.initialize(sqrtPriceX96);
    }

    function mint(int24 tickLower, int24 tickUpper, uint128 amountDesired) public returns(uint256 amount0, uint256 amount1){
        // Will only work for first liquidity

        bytes memory data = abi.encode(msg.sender);
        IUniswapV3Pool pool = IUniswapV3Pool(POOL_ADDRESS);
        (amount0,amount1) = pool.mint(msg.sender, tickLower, tickUpper, amountDesired, data);
    }

    function uniswapV3MintCallback(uint256 amount0Owed,uint256 amount1Owed,bytes calldata data) external override {
        require(msg.sender == address(POOL_ADDRESS), "Caller is not the Uniswap V3 Pool");
        
        // Decode the data if needed
        address sender = abi.decode(data, (address));

        // Transfer required token amounts to the pool
        if (amount0Owed > 0) longToken.transferFrom(sender, msg.sender, amount0Owed);
        if (amount1Owed > 0) shortToken.transferFrom(sender, msg.sender, amount1Owed);

        // Additional logic here if necessary
    }
    


    function getUniSqrtPrice()public view returns(uint160 sqrtPriceX96){
        IUniswapV3Pool pool = IUniswapV3Pool(POOL_ADDRESS);
        (sqrtPriceX96, , , , , , ) = pool.slot0();
    }



}
