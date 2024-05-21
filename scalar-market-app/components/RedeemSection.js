import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Button, TextField, Grid, Card, CardContent, Typography } from '@mui/material';
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { ethers } from 'ethers';

const artifacts = {
    ScalarVaultABI: require('../abi/ScalarMarketVault.json').abi,
    longTokenABI: require("../abi/LongToken.json").abi,
    shortTokenABI: require("../abi/ShortToken.json").abi
  }

const validationSchema = Yup.object({
  longTokens: Yup.number().required('Required'),
  shortTokens: Yup.number().required('Required')
});

function RedeemSection({ marketDetails }) {
    const { data: hash, isPending, writeContract } = useWriteContract({});
    const { isLoading: isSubmitting, isSuccess: redeemSubmitted } = useWaitForTransactionReceipt({ hash });
  // Formik setup for the Redeem form
  const redeemFormik = useFormik({
    initialValues: {
      longTokens: '',
      shortTokens: '',
    },
    validationSchema,
    onSubmit: (values) => {
        const longAmount = ethers.parseEther(values.longTokens);
        const shortAmount = ethers.parseEther(values.shortTokens);
        const redeemAmount = longAmount>shortAmount ? shortAmount:longAmount;
        console.log(`Long Token Amount: ${longAmount}`);
        console.log(`Short Token Amount: ${shortAmount}`);
        console.log(`Redeem Amount: ${redeemAmount}`);

        try{
            writeContract({
                address:marketDetails.longAddress,
                abi:artifacts.longTokenABI,
                functionName:"approve",
                args:[marketDetails.vaultAddress, redeemAmount]
            });
            writeContract({
                address:marketDetails.shortAddress,
                abi:artifacts.shortTokenABI,
                functionName:"approve",
                args:[marketDetails.vaultAddress, redeemAmount]
            });
            writeContract({
                address: marketDetails.vaultAddress,
                abi: artifacts.ScalarVaultABI,
                functionName: "redeem",
                args:[redeemAmount]
            });
        }catch(error){
            console.log(error);
        }


      
    },
  });

  // Formik setup for the Final Redeem form
  const finalRedeemFormik = useFormik({
    initialValues: {
      longTokens: '',
      shortTokens: '',
    },
    validationSchema,
    onSubmit: (values) => {
        const longAmount = ethers.parseEther(values.longTokens);
        const shortAmount = ethers.parseEther(values.shortTokens);
        console.log(`Long Token Amount: ${longAmount}`);
        console.log(`Short Token Amount: ${shortAmount}`);
        try{

            writeContract({
                address:marketDetails.longAddress,
                abi:artifacts.longTokenABI,
                functionName:"approve",
                args:[marketDetails.vaultAddress, longAmount]
            });
            writeContract({
                address:marketDetails.shortAddress,
                abi:artifacts.shortTokenABI,
                functionName:"approve",
                args:[marketDetails.vaultAddress, shortAmount]
            });
            writeContract({
                address: marketDetails.vaultAddress,
                abi: artifacts.ScalarVaultABI,
                functionName: "finalRedeem",
                args:[longAmount,shortAmount]
            });
        }catch(error){
            console.log(error);
        }
      
    },
  });

  return (
    <Grid container spacing={2} sx={{ padding: 2 }}>
      <Grid item xs={6}>
        <Card>
          <CardContent>
            <Typography variant="h6">Redeem</Typography>
            <form onSubmit={redeemFormik.handleSubmit}>
              <TextField
                fullWidth
                id="longTokens"
                name="longTokens"
                label="Amount of Long Tokens"
                value={redeemFormik.values.longTokens}
                onChange={redeemFormik.handleChange}
                error={redeemFormik.touched.longTokens && Boolean(redeemFormik.errors.longTokens)}
                helperText={redeemFormik.touched.longTokens && redeemFormik.errors.longTokens}
              />
              <TextField
                fullWidth
                id="shortTokens"
                name="shortTokens"
                label="Amount of Short Tokens"
                value={redeemFormik.values.shortTokens}
                onChange={redeemFormik.handleChange}
                error={redeemFormik.touched.shortTokens && Boolean(redeemFormik.errors.shortTokens)}
                helperText={redeemFormik.touched.shortTokens && redeemFormik.errors.shortTokens}
              />
              <Button color="primary" variant="contained" fullWidth type="submit">
                Redeem
              </Button>
            </form>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={6}>
        <Card>
          <CardContent>
            <Typography variant="h6">Final Redeem</Typography>
            <form onSubmit={finalRedeemFormik.handleSubmit}>
              <TextField
                fullWidth
                id="longTokens"
                name="longTokens"
                label="Amount of Long Tokens"
                value={finalRedeemFormik.values.longTokens}
                onChange={finalRedeemFormik.handleChange}
                error={finalRedeemFormik.touched.longTokens && Boolean(finalRedeemFormik.errors.longTokens)}
                helperText={finalRedeemFormik.touched.longTokens && finalRedeemFormik.errors.longTokens}
              />
              <TextField
                fullWidth
                id="shortTokens"
                name="shortTokens"
                label="Amount of Short Tokens"
                value={finalRedeemFormik.values.shortTokens}
                onChange={finalRedeemFormik.handleChange}
                error={finalRedeemFormik.touched.shortTokens && Boolean(finalRedeemFormik.errors.shortTokens)}
                helperText={finalRedeemFormik.touched.shortTokens && finalRedeemFormik.errors.shortTokens}
              />
              <Button color="primary" variant="contained" fullWidth type="submit">
                Final Redeem
              </Button>
            </form>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default RedeemSection;
