// pool
LONG_SHORT_500= '0xfF87C979374657A843e2640EDC7B121103E9db94'

const UniswapV3Pool = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json")
const { Contract } = require("ethers")

async function getPoolData(poolContract) {
  const [tickSpacing, fee, liquidity, slot0] = await Promise.all([
    poolContract.tickSpacing(),
    poolContract.fee(),
    poolContract.liquidity(),
    poolContract.slot0(),
  ])

  return {
    tickSpacing: tickSpacing,
    fee: fee,
    liquidity: liquidity.toString(),
    sqrtPriceX96: slot0[0],
    tick: slot0[1],
  }
}


async function main() {
  const provider = waffle.provider;
  const poolContract = new Contract(LONG_SHORT_500, UniswapV3Pool.abi, provider)
  const poolData = await getPoolData(poolContract)
  console.log('poolData', poolData)
}

/*
npx hardhat run --network localhost scripts/05_checkLiquidity.js
*/

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });