// Figure out what to do with price impact
LONG_TOKEN_ADDRESS = '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6'
SHORT_TOKEN_ADDRESS = '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318'
LONG_SHORT_500 = '0xfF87C979374657A843e2640EDC7B121103E9db94';

BASE = 1000000;

const { checkBalances } = require("../lib/getBalances");
const { swap041, swap140, quote041, quote140 } = require("../lib/swaps");
const { getPoolImmutables, getPoolState } = require('../lib/helpers');
const { sqrtPriceX96ToPrice } = require("../lib/priceConversions");
const { Contract, BigNumber } = require("ethers");

const IUniswapV3PoolABI = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json').abi;

async function main() {
    const [owner, signer2] = await ethers.getSigners();
    const provider = waffle.provider;

    const poolContract = new Contract(LONG_SHORT_500, IUniswapV3PoolABI, provider);
    const immutables = await getPoolImmutables(poolContract);
    const state = await getPoolState(poolContract);
    const balances = await checkBalances(signer2, provider);
    const price = await sqrtPriceX96ToPrice(state.sqrtPriceX96);

    if (balances.token0Balance > balances.token1Balance) {
        const diffBal = balances.token0Balance - balances.token1Balance;
        const estimate = diffBal / (1 + (1 - immutables.fee / BASE) * price);
        const amountIn = ethers.utils.formatUnits(String(estimate));
        const quoter = await quote041(amountIn, signer2, provider, LONG_TOKEN_ADDRESS, SHORT_TOKEN_ADDRESS, LONG_SHORT_500);

        console.log(`Estimate: ${estimate}`);
        console.log(`Amount Out: ${quoter.receipt.amountOut}`);
        console.log(`Slippage: ${(estimate - quoter.receipt.amountOut) * 100 / estimate}`);
        console.log('---------------------------------------------')
        console.log(`Token0 Balance: ${balances.token0Balance}`);
        console.log(`Token1 Balance: ${balances.token1Balance}`);
        console.log(`Token0 Final Balance: ${balances.token0Balance - quoter.receipt.amountOut}`);
        console.log(`Token1 Final Balance: ${Number(balances.token1Balance) + Number(estimate)}`);
        console.log(`Final Difference: ${(balances.token0Balance - quoter.receipt.amountOut) - (Number(balances.token1Balance) + Number(estimate))}`);

    } if (balances.token1Balance > balances.token0Balance) {
        const diffBal = balances.token1Balance - balances.token0Balance;
        const estimate = diffBal / (1 + (1 - immutables.fee / BASE) / price);
        const amountIn = ethers.utils.formatUnits(String(estimate));
        const quoter = await quote140(amountIn, signer2, provider, LONG_TOKEN_ADDRESS, SHORT_TOKEN_ADDRESS, LONG_SHORT_500);

        console.log("here");
        console.log(`Estimate: ${estimate}`);
        console.log(`Amount Out: ${quoter.receipt.amountOut}`);
        console.log(`Slippage: ${(estimate - quoter.receipt.amountOut) * 100 / estimate}`);
        console.log('---------------------------------------------')
        console.log(`Token0 Balance: ${balances.token0Balance}`);
        console.log(`Token1 Balance: ${balances.token1Balance}`);
        console.log(`Token0 Final Balance: ${Number(balances.token0Balance)+ Number(quoter.receipt.amountOut)}`);
        console.log(`Token1 Final Balance: ${balances.token1Balance - estimate}`);
        console.log(`Final Difference: ${(balances.token1Balance - estimate) - (Number(balances.token0Balance)+ Number(quoter.receipt.amountOut))}`);


    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
