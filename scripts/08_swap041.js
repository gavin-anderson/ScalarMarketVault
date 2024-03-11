// Import ethers from Hardhat, not directly from the ethers package
const { ethers } = require("hardhat");
const IUniswapV3PoolABI = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json').abi;
const SwapRouterABI = require('@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json').abi;
const ERC20ABI = require('../ERC20.json'); 
const { getPoolImmutables, getPoolState } = require('../lib/helpers');
const {checkTokenHexOrder} = require("../lib/checkTokens");

LONG_TOKEN_ADDRESS= '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6'
SHORT_TOKEN_ADDRESS= '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318'

LONG_SHORT_500= '0xfF87C979374657A843e2640EDC7B121103E9db94';
swapRouterAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'; 


async function main() {
    // Use Hardhat's provider and signers
    const [owner, signer2] = await ethers.getSigners();
    const provider = waffle.provider;

    // Example addresses, replace these with your local Hardhat deployed addresses
    
    // Initialize contracts with the local signer
    const poolContract = new ethers.Contract(LONG_SHORT_500, IUniswapV3PoolABI, provider);
    const swapRouterContract = new ethers.Contract(swapRouterAddress, SwapRouterABI, provider);


    // Define the swap parameters
    const inputAmount = ethers.utils.parseUnits("1", 18);
    const approvalAmount = inputAmount.mul(100000);

    // Figure out which is token1 and which is token0
    [_token0,_token1] = await checkTokenHexOrder(LONG_TOKEN_ADDRESS,SHORT_TOKEN_ADDRESS);

    // Approve the SwapRouter to spend token
    const tokenContract = new ethers.Contract(_token0, ERC20ABI, provider);
    await tokenContract.connect(signer2).approve(swapRouterAddress, approvalAmount);

    // Set up swap parameters
    const immutables = await getPoolImmutables(poolContract);
    const state = await getPoolState(poolContract);

    const params = {
        tokenIn: immutables.token0,
        tokenOut: immutables.token1,
        fee: 500,
        recipient: signer2.address,
        deadline: Math.floor(Date.now() / 1000) + (60 * 10),
        amountIn: inputAmount,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0,
    };

    // Execute the swap
    const transaction = await swapRouterContract.connect(signer2).exactInputSingle(params, {
        gasLimit: ethers.utils.hexlify(1000000)
    });


    console.log(`Transaction hash: ${transaction.hash}`);
    const receipt = await transaction.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
    if(_token0 == LONG_TOKEN_ADDRESS){
        console.log(`Swapped Long for Short`);
    }else{
        console.log(`Swapped Short for Long`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });