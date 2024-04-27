const { Pool, Token } = require('@uniswap/v3-sdk');
const { ethers } = require('ethers');
const { Contract } = require('ethers/lib/utils');

// Uniswap V3 Factory address and ABI to interact with the pool
const UNISWAP_V3_FACTORY_ADDRESS = process.env.REACT_APP_FACTORY_ADDRESS;
const UNISWAP_V3_FACTORY_ABI = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json");
// Define the fee amounts for Uniswap V3
const FeeAmount = {
  LOW: 500,     // 0.05%
  MEDIUM: 3000, // 0.3%
  HIGH: 10000   // 1.0%
};

// RPC provider URL
const provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/YOUR_INFURA_KEY');

// Example function to check all pools for a token pair across all fee tiers
async function checkPools(tokenA, tokenB) {

  const factoryContract = new ethers.Contract(UNISWAP_V3_FACTORY_ADDRESS, UNISWAP_V3_FACTORY_ABI, provider);

  const results = [];

  for (const fee of Object.values(FeeAmount)) {
    const poolAddress = await factoryContract.getPool(tokenA, tokenB, fee);
    if (poolAddress !== ethers.constants.AddressZero) {
      const poolContract = new Contract(poolAddress, ['function liquidity() view returns (uint128)'], provider);
      const liquidity = await poolContract.liquidity();
      if (liquidity.gt(0)) {
        results.push({
          fee,
          poolAddress,
          liquidity: liquidity.toString()
        });
      }
    }
  }

  return results;
}

module.exports = {
    checkPools
};
