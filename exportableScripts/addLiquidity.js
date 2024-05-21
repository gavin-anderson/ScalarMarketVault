const { Contract, utils } = require("ethers");
const { Token } = require('@uniswap/sdk-core');
const { Pool, Position, nearestUsableTick } = require('@uniswap/v3-sdk');
const { checkTokenHexOrder } = require("../lib/checkTokens");

const artifacts = {
    NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
    UniswapV3Pool: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"),
    LongToken: require("../artifacts/contracts/LongToken.sol/LongToken.json"),
    ShortToken: require("../artifacts/contracts/ShortToken.sol/ShortToken.json")
};

async function getPoolData(poolContract) {
    const [tickSpacing, fee, liquidity, slot0] = await Promise.all([
        poolContract.tickSpacing(),
        poolContract.fee(),
        poolContract.liquidity(),
        poolContract.slot0(),
    ]);
    console.log(`fee: ${tickSpacing}`);
    console.log(typeof (tickSpacing));
    console.log(`fee: ${fee}`);
    console.log(typeof (fee));
    console.log(`sqrtPrice: ${slot0[0]}`);
    console.log(typeof (slot0[0]));
    console.log(`Liquidity: ${liquidity}`);
    console.log(typeof (liquidity));
    console.log(`tick: ${slot0[1]}`);
    console.log(typeof (slot0[1]));
    return {
        tickSpacing: tickSpacing,
        fee: fee,
        liquidity: liquidity,
        sqrtPriceX96: slot0[0],
        tick: slot0[1],
    }
}
// input needs to be string
async function addLiquidity(input, signer, provider, LONG_TOKEN_ADDRESS, SHORT_TOKEN_ADDRESS, POSITION_MANAGER_ADDRESS, POOL_ADDRESS) {
    const LongTokenContract = new Contract(LONG_TOKEN_ADDRESS, artifacts.LongToken.abi, provider);
    const ShortTokenContract = new Contract(SHORT_TOKEN_ADDRESS, artifacts.ShortToken.abi, provider);

    const inputAmount = utils.parseEther(input);
    const approveAmount = inputAmount.mul("1000");

    await LongTokenContract.connect(signer).approve(POSITION_MANAGER_ADDRESS, approveAmount);
    await ShortTokenContract.connect(signer).approve(POSITION_MANAGER_ADDRESS, approveAmount);

    const poolContract = new Contract(POOL_ADDRESS, artifacts.UniswapV3Pool.abi, provider);

    const poolData = await getPoolData(poolContract);

    const LongToken = new Token(31337, LONG_TOKEN_ADDRESS, 18, 'LNG', 'Long Token');
    const ShortToken = new Token(31337, SHORT_TOKEN_ADDRESS, 18, 'SSHHOORRTT', 'Short Token');

    [_token0, _token1] = await checkTokenHexOrder(LONG_TOKEN_ADDRESS, SHORT_TOKEN_ADDRESS);

    let pool;
    if (_token0 == LongToken.address) {
        pool = new Pool(
            LongToken,
            ShortToken,
            poolData.fee,
            poolData.sqrtPriceX96.toString(),
            poolData.liquidity.toString(),
            poolData.tick
        )
    } else {
        pool = new Pool(
            LongToken,
            ShortToken,
            poolData.fee,
            poolData.sqrtPriceX96.toString(),
            poolData.liquidity.toString(),
            poolData.tick
        )

    }
    const position = new Position({
        pool: pool,
        liquidity: inputAmount,
        tickLower: nearestUsableTick(poolData.tick, poolData.tickSpacing) - poolData.tickSpacing * 2,
        tickUpper: nearestUsableTick(poolData.tick, poolData.tickSpacing) + poolData.tickSpacing * 2,
    })

    const { amount0: amount0Desired, amount1: amount1Desired } = position.mintAmounts

    console.log('Amount0 to Add =', `'${amount0Desired.toString()} : ${utils.formatEther(amount0Desired.toString())}'`);
    console.log('Amount1 to Add =', `'${amount1Desired.toString()} : ${utils.formatEther(amount1Desired.toString())}'`);

    params = {
        token0: _token0,
        token1: _token1,
        fee: poolData.fee,
        tickLower: nearestUsableTick(poolData.tick, poolData.tickSpacing) - poolData.tickSpacing * 2,
        tickUpper: nearestUsableTick(poolData.tick, poolData.tickSpacing) + poolData.tickSpacing * 2,
        amount0Desired: amount0Desired.toString(),
        amount1Desired: amount1Desired.toString(),
        amount0Min: 0,
        amount1Min: 0,
        recipient: signer.address,
        deadline: Math.floor(Date.now() / 1000) + (60 * 10)
    }

    const nonfungiblePositionManager = new Contract(POSITION_MANAGER_ADDRESS, artifacts.NonfungiblePositionManager.abi, provider)
    const tx = await nonfungiblePositionManager.connect(signer).mint(
        params,
        { gasLimit: '1000000' }
    )
    const receipt = await tx.wait();
    for (const event of receipt.events) {
        if (event.event == 'IncreaseLiquidity' || event.event === 'Mint') {
            const tokenId = event.args.tokenId;
            console.log(`Token ID: ${tokenId.toString()}`);
            return tokenId;
        }
    }

}

module.exports = {
    addLiquidity
};