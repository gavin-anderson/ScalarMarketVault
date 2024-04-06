BASE = 1000000;

const { checkBalances } = require("../lib/getBalances");
const { getPoolImmutables, getPoolState } = require('../lib/helpers');
const { sqrtPriceX96ToPrice } = require("../lib/priceConversions");
const { Contract } = require("ethers");

const IUniswapV3PoolABI = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json').abi;

async function balanceBooks(signer, provider, addresses) {

    const poolContract = new Contract(addresses.POOL_ADDRESS, IUniswapV3PoolABI, provider);
    const immutables = await getPoolImmutables(poolContract);
    const state = await getPoolState(poolContract);
    const balances = await checkBalances(signer, provider, addresses);
    const price = await sqrtPriceX96ToPrice(state.sqrtPriceX96);

    if (balances.token0Balance > balances.token1Balance) {

        const diffBal = balances.token0Balance - balances.token1Balance;
        const estimate = diffBal / (1 + (1 - immutables.fee / BASE) * price);
        const amountIn = ethers.utils.formatUnits(String(estimate));
        const direction = 0;

        return ({
            estimate,
            amountIn,
            direction
        })

    } if (balances.token1Balance > balances.token0Balance) {

        const diffBal = balances.token1Balance - balances.token0Balance;
        const estimate = diffBal / (1 + (1 - immutables.fee / BASE) / price);
        const amountIn = ethers.utils.formatUnits(String(estimate));
        const direction = 1;
        return ({
            estimate,
            amountIn,
            direction
        })

        // console.log("here");
        // console.log(`Estimate: ${estimate}`);
        // console.log(`Amount Out: ${quoter.receipt.amountOut}`);
        // console.log(`Slippage: ${(estimate - quoter.receipt.amountOut) * 100 / estimate}`);
        // console.log('---------------------------------------------')
        // console.log(`Token0 Balance: ${balances.token0Balance}`);
        // console.log(`Token1 Balance: ${balances.token1Balance}`);
        // console.log(`Token0 Final Balance: ${Number(balances.token0Balance)+ Number(quoter.receipt.amountOut)}`);
        // console.log(`Token1 Final Balance: ${balances.token1Balance - estimate}`);
        // console.log(`Final Difference: ${(balances.token1Balance - estimate) - (Number(balances.token0Balance)+ Number(quoter.receipt.amountOut))}`);


    }
}

module.exports = {
    balanceBooks
}
