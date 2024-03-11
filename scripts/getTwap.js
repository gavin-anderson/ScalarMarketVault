// Who knows if this will be useful
const { ethers } = require("hardhat");
LONG_TOKEN_ADDRESS= '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6'
SHORT_TOKEN_ADDRESS= '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318'
const { checkTokenHexOrder } = require("../lib/checkTokens");
// Uniswap V3 Pool ABI
const IUniswapV3PoolABI = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json').abi;

// Pool address - replace this with the actual pool address
LONG_SHORT_500= '0xfF87C979374657A843e2640EDC7B121103E9db94'

async function main() {
    [_token0, _token1] = await checkTokenHexOrder(LONG_TOKEN_ADDRESS, SHORT_TOKEN_ADDRESS);

    const provider = ethers.provider;
    // Set to 1 second for local testing - blocks don't increase at a timed rate since lack of transactions
    const secondsAgo = [1, 0];

    // Initialize the pool contract
    const poolContract = new ethers.Contract(LONG_SHORT_500, IUniswapV3PoolABI, provider);

    try {
        const [tickCumulatives,] = await poolContract.observe(secondsAgo);

        // Calculate
        const tickDiff = tickCumulatives[1].sub(tickCumulatives[0]);
        const timeDiff = secondsAgo[0] - secondsAgo[1];
        const averageTick = tickDiff.div(timeDiff);

        const twapPrice = Math.pow(1.001, averageTick.toNumber());
        console.log(`TWAP Price Uni: ${twapPrice}`);
        console.log(`TWAP Price Scalar: ${twapPrice/(1+twapPrice)}`);

    } catch (error) {
        console.error('Error Twap:', error);
    }




}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
