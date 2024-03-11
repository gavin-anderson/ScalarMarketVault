// Token addresses
LONG_TOKEN_ADDRESS= '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6'
SHORT_TOKEN_ADDRESS= '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318'

// Uniswap contract address
WETH_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
FACTORY_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
SWAP_ROUTER_ADDRESS = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
NFT_DESCRIPTOR_ADDRESS = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9'
POSITION_DESCRIPTOR_ADDRESS= '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707'
POSITION_MANAGER_ADDRESS= '0x0165878A594ca255338adfa4d48449f69242Eb8F'
QUOTERV2_ADDRESS = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'

const artifacts = {
  UniswapV3Factory: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json"),
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
};

const { checkTokenHexOrder } = require("../lib/checkTokens");

const { Contract, BigNumber } = require("ethers")
const bn = require('bignumber.js')
bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 })

const provider = waffle.provider;

function encodePriceSqrt(reserve1, reserve0) {
  return BigNumber.from(
    new bn(reserve1.toString())
      .div(reserve0.toString())
      .sqrt()
      .multipliedBy(new bn(2).pow(96))
      .integerValue(3)
      .toString()
  )
}

const nonfungiblePositionManager = new Contract(
  POSITION_MANAGER_ADDRESS,
  artifacts.NonfungiblePositionManager.abi,
  provider
)
const factory = new Contract(
  FACTORY_ADDRESS,
  artifacts.UniswapV3Factory.abi,
  provider
)

async function deployPool(token0, token1, fee, price) {
  const [owner] = await ethers.getSigners();
  await nonfungiblePositionManager.connect(owner).createAndInitializePoolIfNecessary(
    token0,
    token1,
    fee,
    price,
    { gasLimit: 5000000 }
  )
  const poolAddress = await factory.connect(owner).getPool(
    token0,
    token1,
    fee,
  )
  return poolAddress
}


async function main() {
  [_token0, _token1] = await checkTokenHexOrder(LONG_TOKEN_ADDRESS, SHORT_TOKEN_ADDRESS);
  const long_short_500 = await deployPool(_token0, _token1, 500, encodePriceSqrt(1, 1))
  console.log('LONG_SHORT_500=', `'${long_short_500}'`)
}

/*
npx hardhat run --network localhost scripts/03_deployPools.js
*/

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });