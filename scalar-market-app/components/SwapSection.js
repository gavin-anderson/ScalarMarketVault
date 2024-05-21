import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, IconButton, MenuItem } from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAccount, useWaitForTransactionReceipt, useWriteContract, useReadContracts } from 'wagmi';
import { ethers } from 'ethers';


const artifacts = {
  UniSwapRouterABI: require("../abi/SwapRouter.json").abi,
  UniQuoterV2ABI: require("../abi/QuoterV2.json").abi,
  longTokenABI: require("../abi/LongToken.json").abi,
  shortTokenABI: require("../abi/ShortToken.json").abi
}


const UniSwapRouterAddress = process.env.NEXT_PUBLIC_SWAP_ROUTER_ADDRESS;
const UniQuoterV2Address = process.env.NEXT_PUBLIC_QUOTERV2_ADDRESS;

function SwapSection({ marketDetails }) {
  const [swapDirection, setSwapDirection] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  const [estimatedOutput, setEstimatedOutput] = useState('');
  const { address: userAddress } = useAccount();
  const { data: hash, writeContract } = useWriteContract();
  const { isLoading: isApproving, isSuccess: approvalConfirmed } = useWaitForTransactionReceipt({ hash });

  const availableFeeTiers = marketDetails.pools.map(pool => pool.feeTier);

  const longContract = {
    address: marketDetails.longAddress,
    abi: artifacts.longTokenABI
  };
  const shortContract = {
    address: marketDetails.shortAddress,
    abi: artifacts.shortTokenABI
  };
  const { data: contractData, refetch: refetchAllowances } = useReadContracts({
    contracts: [
      {
        ...longContract,
        functionName: "allowance",
        args: [userAddress, UniSwapRouterAddress]
      }, {
        ...shortContract,
        functionName: "allowance",
        args: [userAddress, UniSwapRouterAddress]
      }
    ]
  });

  useEffect(() => {
    if (approvalConfirmed) {
      setIsApproved(true);
      refetchAllowances();
    }
  }, [approvalConfirmed, refetchAllowances]);

  const formik = useFormik({
    initialValues: {
      amountToSwap: '',
      feeTier: ''
    },
    validationSchema: Yup.object({
      amountToSwap: Yup.number().positive().required('Please enter a positive number'),
      feeTier: Yup.string().required('Fee tier is required'),
    }),
    onSubmit: async (values) => {
      const swapAmount = ethers.parseEther(values.amountToSwap.toString());
      const currentAllowance = swapDirection ? contractData[0]?.result : contractData[1]?.result;

      if (currentAllowance >= swapAmount) {
        const params = {
          tokenIn: swapDirection ? marketDetails.longAddress : marketDetails.shortAddress,
          tokenOut: !swapDirection ? marketDetails.longAddress : marketDetails.shortAddress,
          fee: values.feeTier,
          recipient: userAddress,
          deadline: Math.floor(Date.now() / 1000) + 600,
          amountIn: swapAmount,
          amountOutMinimum: 0,
          sqrtPriceLimitX96: 0,
        };
        try {
          console.log("Swapping without approval");
          await writeContract({
            address: UniSwapRouterAddress,
            abi: artifacts.UniSwapRouterABI,
            functionName: "exactInputSingle",
            args: [params]
          });
        } catch (error) {
          console.error("Swap error:", error);
        }
      } else {
        console.log("Approval is needed");
        await writeContract({
          address: swapDirection ? marketDetails.longAddress : marketDetails.shortAddress,
          abi: swapDirection ? artifacts.longTokenABI : artifacts.shortTokenABI,
          functionName: "approve",
          args: [UniSwapRouterAddress, swapAmount]
        });

      }
    }
  });

  const handleToggleDirection = () => {
    setSwapDirection(!swapDirection);
  };

  const handleAmountChange = (event) => {
    const { name, value } = event.target;
    formik.setFieldValue(name, value);
    if (!value || isNaN(value)) {
      setIsApproved(false);
      return;
    }
    const currentAllowance = swapDirection ? contractData[0]?.result : contractData[1]?.result;
    if(currentAllowance != undefined){
      if (currentAllowance >= ethers.parseEther(value.toString())) {
        setIsApproved(true);
      }
      else {
        setIsApproved(false);
      }
    }else{
      setIsApproved(false);
    }
    
  };

  const handleFeeTierChange = (event) => {
    const { value } = event.target;
    formik.setFieldValue('feeTier', value, false)
  };
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Swap Tokens
      </Typography>
      <form onSubmit={formik.handleSubmit}>
        <TextField
          fullWidth
          type="number"
          name="amountToSwap"
          label={swapDirection ? "Sell Longs" : "Sell Shorts"}
          value={formik.values.amountToSwap}
          onChange={handleAmountChange}
          error={formik.touched.amountToSwap && Boolean(formik.errors.amountToSwap)}
          helperText={formik.touched.amountToSwap && formik.errors.amountToSwap}
          margin="normal"
          variant="outlined"
        />
        <IconButton onClick={handleToggleDirection} color="primary" sx={{ my: 1 }}>
          <SwapHorizIcon />
        </IconButton>
        <TextField
          fullWidth
          name="estimatedAmountOut"
          label="Estimated Amount Out"
          value={estimatedOutput}
          margin="normal"
          variant="outlined"
          InputProps={{
            readOnly: true,
          }}
        /><TextField
          select
          label="Fee Tier"
          fullWidth
          name="feeTier"
          value={formik.values.feeTier}
          onChange={handleFeeTierChange}
          error={formik.touched.feeTier && Boolean(formik.errors.feeTier)}
          helperText={formik.touched.feeTier && formik.errors.feeTier}
          margin="normal"
          variant="outlined"
        >
          {availableFeeTiers.map((tier) => (
            <MenuItem key={tier} value={tier}>{`${tier / 10000}%`}</MenuItem>
          ))}
        </TextField>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isApproving || formik.isSubmitting}
          sx={{ mt: 2 }}
        >
          {isApproved ? 'Swap' : 'Approve'}
        </Button>
      </form>
    </Box>
  );
}
export default SwapSection;