// Import ethers from Hardhat package
const { ethers } = require("hardhat");
LONG_TOKEN_ADDRESS= '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853'
SHORT_TOKEN_ADDRESS= '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6'
const {checkTokenHexOrder} = require("./checkTokens");
// Uniswap V3 Pool ABI
const IUniswapV3PoolABI = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json').abi;

// Pool address - replace this with the actual pool address
const LONG_SHORT_500= '0xD8Dc8176F0fC3668527445463bCb6089AbC2CD82'

async function main() {
    // Use Hardhat's default provider
    let token00;
    [_token0,_token1] = await checkTokenHexOrder(LONG_TOKEN_ADDRESS,SHORT_TOKEN_ADDRESS);
   
    const provider = ethers.provider;

    // Initialize the pool contract
    const poolContract = new ethers.Contract(LONG_SHORT_500, IUniswapV3PoolABI, provider);

    // Fetch the current slot0 to get the sqrtPriceX96
    const { sqrtPriceX96 } = await poolContract.slot0();
    console.log(`sqrtPriceX96: ${sqrtPriceX96}`);

    if(_token1 == LONG_TOKEN_ADDRESS){
        const Uniprice = sqrtPriceX96**2/2**192;
        console.log(`Uni Long Price: ${Uniprice}`);
        console.log(`Uni Short Price: ${1/Uniprice}`);
    
        const ScalarPrice = Uniprice/(1+Uniprice);
        
        console.log(`Scalar Long price: ${ScalarPrice}`);
        console.log(`Scalar Short price: ${1-ScalarPrice}`);
    }else{
        const Uniprice = sqrtPriceX96**2/2**192;
        console.log(`Uni Long Price: ${1/Uniprice}`);
        console.log(`Uni Short Price: ${Uniprice}`);

        const ScalarPrice = Uniprice/(1+Uniprice);

        console.log(`Scalar Long Price: ${1-Uniprice}`);
        console.log(`Scalar Short price: ${ScalarPrice}`);
        
        
    }

  
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
