import { useState, useEffect } from 'react';
import { Typography, Button, TextField, Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useWaitForTransactionReceipt, useWriteContract, useAccount } from 'wagmi'; // Assuming you'll use these hooks for contract interactions
import { checkTokenHexOrder } from '@/scripts/checkTokenOrder';

const uniPositionManagerABI = require("../abi/NonfungiblePositionManager.json");

const bn = require('bignumber.js')
bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 });

function encodePriceSqrt(reserve1, reserve0) {
    const sqrtResult = new bn(reserve1.toString())
        .div(reserve0.toString())
        .sqrt();
    const multipliedResult = sqrtResult.multipliedBy(new bn(2).pow(96));
    const integerValue = multipliedResult.integerValue(3);
    return integerValue.toString();
}

function CreatePool({ marketDetails }) {
    const { address } = useAccount();
    const { data: hash, isPending, writeContract } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
    const uniPositionManagerAddress = process.env.NEXT_PUBLIC_POSITION_MANAGER_ADDRESS;


    // Setting up Formik with validation using Yup
    const formik = useFormik({
        initialValues: {
            feeTier: '' // Initial value for the fee tier
        },
        validationSchema: Yup.object({
            feeTier: Yup.string().required('Required') // Fee tier is required
        }),
        onSubmit: async (values) => {
            const feeTierNumber = parseFloat(values.feeTier.replace('%', ''))*1000000 / 100;
            const [_token0, _token1] = await checkTokenHexOrder(marketDetails.longAddress, marketDetails.shortAddress);
            const price = encodePriceSqrt(1, 1);
            
            console.log(_token0);
            console.log(_token1);
            console.log(feeTierNumber);
            console.log(price);
            console.log(uniPositionManagerABI.abi);
            try {
                // Write contract function to deploy the pool, replace the following lines with actual contract deployment logic
                await writeContract({
                    address: uniPositionManagerAddress,
                    abi: uniPositionManagerABI.abi,
                    functionName: "createAndInitializePoolIfNecessary",
                    args: [_token0, _token1, feeTierNumber, price]

                });
            } catch (error) {
                console.error('Transaction failed:', error);
            }
        }
    });

    const handleFeeTierChange = (event) => {
        formik.setFieldValue('feeTier', event.target.value);
    };

    useEffect(() => {
        if (isConfirmed) {
            // Extract the necessary data
            const transactionHash = hash;
            const token0Address = marketDetails.longAddress;
            const token1Address = marketDetails.shortAddress;

            // Send data to your API endpoint
            const postData = async () => {
                try {
                    const response = await fetch('http://localhost:3001/submit-poolAddress', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            transactionHash,
                            token0Address,
                            token1Address
                        })
                    });
                    const data = await response.json();
                    console.log(data); // Optionally handle response from API
                } catch (error) {
                    console.error('Error:', error);
                }
            };

            // Call the function to send data to API
            postData();
        }
    }, [isConfirmed]);

    return (
        <form onSubmit={formik.handleSubmit}>
            <Box my={2}>
                <Typography variant="body2" gutterBottom>
                    Create Pool
                </Typography>
                <TextField
                    select
                    label="Fee Tier"
                    variant="outlined"
                    fullWidth
                    id="feeTier"
                    name="feeTier"
                    value={formik.values.feeTier}
                    onChange={handleFeeTierChange}
                    error={formik.touched.feeTier && Boolean(formik.errors.feeTier)}
                    helperText={formik.touched.feeTier && formik.errors.feeTier}
                >
                    {['1%', '0.3%', '0.05%', ].map((option) => (
                        <MenuItem key={option} value={option}>
                            {option}
                        </MenuItem>
                    ))}
                </TextField>
                <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                    Deploy Pool
                </Button>
            </Box>
        </form>
    );
}
export default CreatePool;