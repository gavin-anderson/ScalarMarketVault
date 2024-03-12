SWAP_ROUTER_ADDRESS = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
QUOTERV2_ADDRESS = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'

const { ethers } = require("hardhat");
const ERC20ABI = require('../ERC20.json');
const { getPoolImmutables, getPoolState } = require('./helpers');
const { checkTokenHexOrder } = require("./checkTokens");

const IUniswapV3PoolABI = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json').abi;
const SwapRouterABI = require('@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json').abi;
const QuoterV2 = require("@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json").abi;

// INPUT AMOUNT NEEDS TO BE A STRING decimal number


async function swap041(inputAmount, signer, provider, LONG_TOKEN_ADDRESS, SHORT_TOKEN_ADDRESS, POOL_ADDRESS) {

    // Initialize contracts with the local signer
    const poolContract = new ethers.Contract(POOL_ADDRESS, IUniswapV3PoolABI, provider);
    const swapRouterContract = new ethers.Contract(SWAP_ROUTER_ADDRESS, SwapRouterABI, provider);

    // Define the swap parameters
    const amountIn = ethers.utils.parseEther(inputAmount);
    const approvalAmount = amountIn.mul(100000);

    // Figure out which is token1 and which is token0
    [_token0, _token1] = await checkTokenHexOrder(LONG_TOKEN_ADDRESS, SHORT_TOKEN_ADDRESS);

    // Approve the SwapRouter to spend token
    const tokenContract = new ethers.Contract(_token0, ERC20ABI, provider);
    await tokenContract.connect(signer).approve(SWAP_ROUTER_ADDRESS, approvalAmount);

    // Set up swap parameters
    const immutables = await getPoolImmutables(poolContract);
    const state = await getPoolState(poolContract);

    const params = {
        tokenIn: immutables.token0,
        tokenOut: immutables.token1,
        fee: 500,
        recipient: signer.address,
        deadline: Math.floor(Date.now() / 1000) + (60 * 10),
        amountIn: amountIn,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0,
    };

    // Execute the swap
    const transaction = await swapRouterContract.connect(signer).exactInputSingle(params, {
        gasLimit: ethers.utils.hexlify(1000000)
    });

    const receipt = await transaction.wait();

    return {
        transaction: transaction,
        receipt: receipt,
        swappedDirection: _token0 == LONG_TOKEN_ADDRESS ? 'Long for Short' : 'Short for Long'

    };
}

async function swap140(inputAmount, signer, provider, LONG_TOKEN_ADDRESS, SHORT_TOKEN_ADDRESS, POOL_ADDRESS) {
    // Initialize contracts with the local signer
    const poolContract = new ethers.Contract(POOL_ADDRESS, IUniswapV3PoolABI, provider);
    const swapRouterContract = new ethers.Contract(SWAP_ROUTER_ADDRESS, SwapRouterABI, provider);

    // Define the swap parameters
    const amountIn = ethers.utils.parseEther(inputAmount);
    const approvalAmount = amountIn.mul(100000);

    // Figure out which is token1 and which is token0
    [_token0, _token1] = await checkTokenHexOrder(LONG_TOKEN_ADDRESS, SHORT_TOKEN_ADDRESS);

    // Approve the SwapRouter to spend token
    const tokenContract = new ethers.Contract(_token1, ERC20ABI, provider);
    await tokenContract.connect(signer).approve(SWAP_ROUTER_ADDRESS, approvalAmount);

    // Set up swap parameters
    const immutables = await getPoolImmutables(poolContract);
    const state = await getPoolState(poolContract);

    const params = {
        tokenIn: immutables.token1,
        tokenOut: immutables.token0,
        fee: 500,
        recipient: signer.address,
        deadline: Math.floor(Date.now() / 1000) + (60 * 10),
        amountIn: amountIn,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0,
    };

    // Execute the swap
    const transaction = await swapRouterContract.connect(signer).exactInputSingle(params, {
        gasLimit: ethers.utils.hexlify(1000000)
    });

    const receipt = await transaction.wait();

    return {
        transaction: transaction,
        receipt: receipt,
        swappedDirection: _token0 == LONG_TOKEN_ADDRESS ? 'Long for Short' : 'Short for Long'

    };
}

async function quote041(inputAmount, signer, provider, LONG_TOKEN_ADDRESS, SHORT_TOKEN_ADDRESS, POOL_ADDRESS) {

    [_token0, _token1] = await checkTokenHexOrder(LONG_TOKEN_ADDRESS, SHORT_TOKEN_ADDRESS);

    const poolContract = new ethers.Contract(POOL_ADDRESS, IUniswapV3PoolABI, provider);
    const { sqrtPriceX96 } = await poolContract.slot0();
    const QuoterContract = new ethers.Contract(QUOTERV2_ADDRESS, QuoterV2, provider);

    const immutables = await getPoolImmutables(poolContract);

    const amountIn = ethers.utils.parseEther(inputAmount);

    const params = {
        tokenIn: immutables.token0,
        tokenOut: immutables.token1,
        fee: 500,
        recipient: signer.address,
        deadline: Math.floor(Date.now() / 1000) + (60 * 10),
        amountIn: amountIn,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0,
    };

    const receipt = await QuoterContract.connect(signer).callStatic.quoteExactInputSingle(
        params, {
        gasLimit: ethers.utils.hexlify(1000000)
    }

    );
    const priceBefore = sqrtPriceX96 ** 2 / 2 ** 192;
    const priceAfter = receipt.sqrtPriceX96After ** 2 / 2 ** 192;

    return {
        receipt: receipt,
        inputAmount: amountIn,
        priceBefore: priceBefore,
        priceAfter: priceAfter,
        swappedDirection: _token0 == LONG_TOKEN_ADDRESS ? 'Long for Short' : 'Short for Long'
    };
}

async function quote140(inputAmount, signer, provider,LONG_TOKEN_ADDRESS, SHORT_TOKEN_ADDRESS, POOL_ADDRESS) {

    [_token0, _token1] = await checkTokenHexOrder(LONG_TOKEN_ADDRESS, SHORT_TOKEN_ADDRESS);

    const poolContract = new ethers.Contract(POOL_ADDRESS, IUniswapV3PoolABI, provider);
    const { sqrtPriceX96 } = await poolContract.slot0();
    const QuoterContract = new ethers.Contract(QUOTERV2_ADDRESS, QuoterV2, provider);

    const immutables = await getPoolImmutables(poolContract);

    const amountIn = ethers.utils.parseEther(inputAmount);

    const params = {
        tokenIn: immutables.token0,
        tokenOut: immutables.token1,
        fee: 500,
        recipient: signer.address,
        deadline: Math.floor(Date.now() / 1000) + (60 * 10),
        amountIn: amountIn,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0,
    };

    const receipt = await QuoterContract.connect(signer).callStatic.quoteExactInputSingle(
        params, {
        gasLimit: ethers.utils.hexlify(1000000)
    }

    );
    const priceBefore = sqrtPriceX96 ** 2 / 2 ** 192;
    const priceAfter = receipt.sqrtPriceX96After ** 2 / 2 ** 192;

    return {
        receipt: receipt,
        inputAmount: amountIn,
        priceBefore: priceBefore,
        priceAfter: priceAfter,
        swappedDirection: _token0 == LONG_TOKEN_ADDRESS ? 'Long for Short' : 'Short for Long'
    };

}

module.exports = {
    swap041,
    swap140,
    quote041,
    quote140
};