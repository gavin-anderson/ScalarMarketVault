// Uniswap contract addresses
WETH_ADDRESS= '0x5FbDB2315678afecb367f032d93F642f64180aa3'
FACTORY_ADDRESS= '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
SWAP_ROUTER_ADDRESS= '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
NFT_DESCRIPTOR_ADDRESS= '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9'
POSITION_DESCRIPTOR_ADDRESS= '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707'
POSITION_MANAGER_ADDRESS= '0x0165878A594ca255338adfa4d48449f69242Eb8F'
QUOTERV2_ADDRESS = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'

// Pool addresses
LONG_SHORT_500= '0xfF87C979374657A843e2640EDC7B121103E9db94'

// Token addresses
LONG_TOKEN_ADDRESS= '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6'
SHORT_TOKEN_ADDRESS= '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318'

const artifacts = {
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
  UniswapV3Pool: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"),
  LongToken: require("../artifacts/contracts/LongToken.sol/LongToken.json"),
  ShortToken: require("../artifacts/contracts/ShortToken.sol/ShortToken.json")
};

const { Contract } = require("ethers");
const { Token } = require('@uniswap/sdk-core');
const { Pool, Position, nearestUsableTick } = require('@uniswap/v3-sdk');

const { checkTokenHexOrder } = require("./checkTokens");

async function getPoolData(poolContract) {
  const [tickSpacing, fee, liquidity, slot0] = await Promise.all([
    poolContract.tickSpacing(),
    poolContract.fee(),
    poolContract.liquidity(),
    poolContract.slot0(),
  ]);

  return {
    tickSpacing: tickSpacing,
    fee: fee,
    liquidity: liquidity,
    sqrtPriceX96: slot0[0],
    tick: slot0[1],
  }
}

async function main() {
  const [owner, signer2] = await ethers.getSigners();
  const provider = waffle.provider;

  const LongTokenContract = new Contract(LONG_TOKEN_ADDRESS,artifacts.LongToken.abi,provider);
  const ShortTokenContract = new Contract(SHORT_TOKEN_ADDRESS,artifacts.ShortToken.abi,provider);

  await LongTokenContract.connect(signer2).approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther('1000'));
  await ShortTokenContract.connect(signer2).approve(POSITION_MANAGER_ADDRESS, ethers.utils.parseEther('1000'));

  const poolContract = new Contract(LONG_SHORT_500, artifacts.UniswapV3Pool.abi, provider);

  const poolData = await getPoolData(poolContract);

  const LongToken = new Token(31337, LONG_TOKEN_ADDRESS, 18, 'LNG', 'Long Token');
  const ShortToken = new Token(31337, SHORT_TOKEN_ADDRESS, 18, 'SSHHOORRTT', 'Short Token');

  [_token0,_token1] = await checkTokenHexOrder(LONG_TOKEN_ADDRESS,SHORT_TOKEN_ADDRESS);

  let pool;
  if(_token0 ==LongToken.address){
    pool = new Pool(
      LongToken,
      ShortToken,
      poolData.fee,
      poolData.sqrtPriceX96.toString(),
      poolData.liquidity.toString(),
      poolData.tick
    )
  }else{ 
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
    liquidity: ethers.utils.parseEther('10000'),
    tickLower: nearestUsableTick(poolData.tick, poolData.tickSpacing) - poolData.tickSpacing * 2,
    tickUpper: nearestUsableTick(poolData.tick, poolData.tickSpacing) + poolData.tickSpacing * 2,
  })

  const { amount0: amount0Desired, amount1: amount1Desired} = position.mintAmounts
  
  console.log('Amount to Add =', `'${amount0Desired.toString()}'`)

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
    recipient: signer2.address,
    deadline: Math.floor(Date.now() / 1000) + (60 * 10)
  }

  const nonfungiblePositionManager = new Contract(
    POSITION_MANAGER_ADDRESS,
    artifacts.NonfungiblePositionManager.abi,
    provider
  )

  const tx = await nonfungiblePositionManager.connect(signer2).mint(
    params,
    { gasLimit: '1000000' }
  )
  const receipt = await tx.wait()
}

/*
npx hardhat run --network localhost scripts/04_addLiquidity.js
*/

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });