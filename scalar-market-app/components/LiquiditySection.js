import React from 'react';
import { Box, Button, Typography, TextField, Grid, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useWaitForTransactionReceipt, useWriteContract, useAccount, useReadContracts } from 'wagmi';
import { parseEther } from 'viem';
import { getEthersProvider } from '@/scripts/getEthersProvider';
import { checkTokenHexOrder } from '@/scripts/checkTokenOrder';

import { WagmiProvider, createConfig, http } from "wagmi";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { localhost, sepolia } from "wagmi/chains";

const { Contract } = require("ethers");
const { Pool, Position, nearestUsableTick } = require('@uniswap/v3-sdk');
const { Token } = require('@uniswap/sdk-core');

const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [localhost],
    transports: {
      // RPC URL for each chain
      [localhost.id]: http(
        'http://localhost:8545',
      ),
      // [sepolia.id]: http('https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}')
    },

    // Required API Keys
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,

    // Required App Info
    appName: "Your App Name",

    // Optional App Info
    appDescription: "Your App Description",
    appUrl: "https://family.co", // your app's url
    appIcon: "https://family.co/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
  }),
);
const artifacts = {
  UniPositionManagerABI: require("../abi/NonfungiblePositionManager.json").abi,
  UniswapV3PoolABI: require("../abi/UniswapV3Pool.json").abi,
  longTokenABI: require("../abi/LongToken.json").abi,
  shortTokenABI: require("../abi/ShortToken.json").abi
}
const availableFeeTiers = {
  '0.05%': '500',
  '0.3%': '3000',
  '1%': '10000',
};
const formattedFeeTier = {
  '0.05%': 500,
  '0.3%': 3000,
  '1%': 10000,
}
async function getPoolData(poolAddress) {
  const provider = getEthersProvider(config);
  const poolContract = new Contract(poolAddress, artifacts.UniswapV3PoolABI, provider);
  console.log("Created Pool Contract");
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
    tickSpacing: Number(tickSpacing),
    fee: Number(fee),
    liquidity: liquidity,
    sqrtPriceX96: slot0[0],
    tick: Number(slot0[1]),
  }
}

function LiquiditySection({ marketDetails }) {
  const { address } = useAccount();
  const { data: hash, isPending, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  const UniPositionManagerAddress = process.env.NEXT_PUBLIC_POSITION_MANAGER_ADDRESS;
  const longTokenAddress = marketDetails.longAddress;
  const shortTokenAddress = marketDetails.shortAddress;


  const feeTierOptions = Object.keys(availableFeeTiers).filter(
    (feeTier) => marketDetails.pools.some(pool => pool.feeTier === availableFeeTiers[feeTier])
  );
  const getPoolAddressByFeeTier = (feeTier) => {
    console.log('Input feeTier:', feeTier);
    const formattedFeeTier = feeTier.toString(); // Ensure feeTier is treated as a string
    console.log('Formatted feeTier:', formattedFeeTier);
    const pool = marketDetails.pools.find(pool => pool.feeTier === formattedFeeTier);
    console.log('Found pool:', pool);
    return pool ? pool.poolAddress : '';
  };
  const validationSchema = Yup.object().shape({
    liquidityAmount: Yup.number()
      .required('Liquidity amount is required')
      .positive('Liquidity amount must be positive')
      .typeError('Liquidity amount must be a number'),
    feeTier: Yup.string().required('Fee tier is required'),
  });

  const formik = useFormik({
    initialValues: {
      liquidityAmount: '',
      feeTier: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      console.log(values)

      try {
        const selectedFeeTier = formattedFeeTier[values.feeTier];
        console.log(`Formatted Fee Tier: ${selectedFeeTier}`);
        const inputAmount = parseEther(values.liquidityAmount);
        console.log(`Input Amount: ${inputAmount}`);
        const poolAddress = getPoolAddressByFeeTier(selectedFeeTier);
        console.log(`Pool Address: ${poolAddress}`);
        console.log(`Type of Long Address: ${typeof (longTokenAddress)}`);
        // Approve PositionManager to spend Long Tokens
        await writeContract({
          address: longTokenAddress,
          abi: artifacts.longTokenABI,
          functionName: "approve",
          args: [UniPositionManagerAddress, inputAmount]
        });

        // Approve PositionManager to spend Short Tokens
        await writeContract({
          address: shortTokenAddress,
          abi: artifacts.shortTokenABI,
          functionName: "approve",
          args: [UniPositionManagerAddress, inputAmount]
        });
        // get order of tokens
        const [_token0, _token1] = await checkTokenHexOrder(longTokenAddress, shortTokenAddress);
        console.log(`Token0: ${_token0}`);
        console.log(`Token1: ${_token1}`);
        // grab pool data
        const poolData = await getPoolData(poolAddress);
        console.log("Returned from pool data");

        const LongToken = new Token(1337, longTokenAddress, 18, 'LNG', 'Long Token');
        const ShortToken = new Token(1337, shortTokenAddress, 18, 'SSHHOORRTT', 'Short Token');

        console.log(`LongToken: ${JSON.stringify(LongToken)}`);
        let pool;
        if (_token0 == longTokenAddress) {
          console.log("Token 0 is long token");
          pool = new Pool(
            LongToken,
            ShortToken,
            poolData.fee,
            poolData.sqrtPriceX96.toString(),
            poolData.liquidity.toString(),
            poolData.tick
          )

        } else {
          console.log("Token 0 is short token");
          pool = new Pool(
            ShortToken,
            LongToken,
            poolData.fee,
            poolData.sqrtPriceX96.toString(),
            poolData.liquidity.toString(),
            poolData.tick
          )

        }
        console.log("Out of Pool creation");
        // create a position
        console.log("Create new position");
        console.log(`inputAmount: ${inputAmount}`);
        const position = new Position({
          pool: pool,
          liquidity: inputAmount.toString(),
          tickLower: nearestUsableTick(poolData.tick, poolData.tickSpacing) - poolData.tickSpacing * 2,
          tickUpper: nearestUsableTick(poolData.tick, poolData.tickSpacing) + poolData.tickSpacing * 2,
        })
        console.log("Finished creating Position");
        const { amount0: _amount0Desired, amount1: _amount1Desired } = position.mintAmounts;
        console.log(`Amount To set: ${_amount0Desired} and ${_amount1Desired}`);
        // Set up parameters
        console.log("Setting Up Parameters");
        const params = {
          token0: _token0,
          token1: _token1,
          fee: selectedFeeTier,
          tickLower: nearestUsableTick(poolData.tick, poolData.tickSpacing) - poolData.tickSpacing * 2,
          tickUpper: nearestUsableTick(poolData.tick, poolData.tickSpacing) + poolData.tickSpacing * 2,
          amount0Desired: _amount0Desired.toString(),
          amount1Desired: _amount1Desired.toString(),
          amount0Min: 0,
          amount1Min: 0,
          recipient: address,
          deadline: Math.floor(Date.now() / 1000) + (60 * 10)
        };
        // Mint Position
        console.log("Position Manager");
        await writeContract({
          address: UniPositionManagerAddress,
          abi: artifacts.UniPositionManagerABI,
          functionName: "mint",
          args: [params]
        })


      } catch (error) {
        console.log(error);
      }
    },
  });



  return (

    <Box>
      <Typography variant="h6" gutterBottom>New Position</Typography>
      <Box mt={2} mb={2}>
        <Typography variant="subtitle1" gutterBottom>Liquidity Amount</Typography>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={9}>
              <TextField
                label="Liquidity Amount"
                variant="outlined"
                name="liquidityAmount"
                fullWidth
                value={formik.values.liquidityAmount}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.liquidityAmount && Boolean(formik.errors.liquidityAmount)}
                helperText={formik.touched.liquidityAmount && formik.errors.liquidityAmount}
              />
            </Grid>
            <Grid item xs={9}>
              <TextField
                select
                label="Fee Tier"
                variant="outlined"
                fullWidth
                name="feeTier"
                value={formik.values.feeTier}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.feeTier && Boolean(formik.errors.feeTier)}
              >
                <MenuItem value="" disabled>Select Fee Tier</MenuItem>
                {feeTierOptions.map((feeTier) => (
                  <MenuItem key={feeTier} value={feeTier}>{feeTier}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={3}>
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Add Liquidity
              </Button>
            </Grid>

          </Grid>

        </form>
      </Box>
    </Box>

  );
}

export default LiquiditySection;
