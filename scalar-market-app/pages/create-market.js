import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Button, TextField, Grid, Card, CardContent, Typography } from '@mui/material';
import { useWaitForTransactionReceipt, useWriteContract, useWatchContractEvent, useAccount } from 'wagmi';
import FactoryArtifact from '../abi/ScalarMarketFactory.json';

async function submitFormData(formData) {
    try {
        const response = await fetch('http://localhost:3001/submit-metadata', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error during form data submission:', error);
    }
}
function convertDateToBlockNumber(date) {
    // Placeholder for the actual conversion logic
    const blockNumber = new Date(date).getTime() / 1000; // Example conversion
    return Number(blockNumber);
}

function CreateMarketPage() {
    const { address } = useAccount();
    const { data: hash, isPending, writeContract } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    const scalarFactoryAddress = process.env.NEXT_PUBLIC_SCALAR_FACTORY;
    const abi = FactoryArtifact.abi

    const formik = useFormik({
        initialValues: {
            ticker: '',
            rangeOpen: '',
            rangeClose: '',
            expiry: '',
            description: '',
        },
        validationSchema: Yup.object().shape({
            ticker: Yup.string().required('Required'),
            rangeOpen: Yup.number().required('Required'),
            rangeClose: Yup.number().required('Required'),
            expiry: Yup.date().required('Required'),
            description: Yup.string().required('Required'),
        }),
        onSubmit: async (values) => {

            const blockExpiry = convertDateToBlockNumber(values.expiry);
            values.block_expiry = blockExpiry;
            values.creator = address;
            try {
                await writeContract({
                    address: scalarFactoryAddress,
                    abi,
                    functionName: "createNewMarket",
                    args: [BigInt(values.rangeOpen * 10 ** 18), BigInt(values.rangeClose * 10 ** 18), BigInt(values.block_expiry)],

                });
            } catch (error) {
                console.error('Transaction failed:', error);

            }
        },
    });

    useEffect(() => {
        if (isConfirmed) {
            const _ticker = formik.values.ticker;
            const _description = formik.values.description;
            const _expiry = formik.values.expiry;
            const datatoSubmit = {
                ticker: _ticker,
                description: _description,
                expiry: _expiry,
                transactionHash: hash
            }

            submitFormData(datatoSubmit).then(response => {
                console.log('Data submitted successfully:', response);
            }).catch(error => {
                console.error('Error submitting form data:', error);
            }).finally(() => {
            });
        };

    }, [isConfirmed]);

    return (
        <Card sx={{ maxWidth: 800, mx: 'auto', mt: 5 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>Create Market</Typography>
                <form onSubmit={formik.handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="ticker"
                                name="ticker"
                                label="Ticker"
                                value={formik.values.ticker}
                                onChange={formik.handleChange}
                                error={formik.touched.ticker && Boolean(formik.errors.ticker)}
                                helperText={formik.touched.ticker && formik.errors.ticker}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                id="rangeOpen"
                                name="rangeOpen"
                                label="Range Open"
                                type="number"
                                value={formik.values.rangeOpen}
                                onChange={formik.handleChange}
                                error={formik.touched.rangeOpen && Boolean(formik.errors.rangeOpen)}
                                helperText={formik.touched.rangeOpen && formik.errors.rangeOpen}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                id="rangeClose"
                                name="rangeClose"
                                label="Range Close"
                                type="number"
                                value={formik.values.rangeClose}
                                onChange={formik.handleChange}
                                error={formik.touched.rangeClose && Boolean(formik.errors.rangeClose)}
                                helperText={formik.touched.rangeClose && formik.errors.rangeClose}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="expiry"
                                name="expiry"
                                label="Expiry"
                                type="date"
                                value={formik.values.expiry}
                                onChange={formik.handleChange}
                                error={formik.touched.expiry && Boolean(formik.errors.expiry)}
                                helperText={formik.touched.expiry && formik.errors.expiry}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="description"
                                name="description"
                                label="Description"
                                multiline
                                rows={4}
                                value={formik.values.description}
                                onChange={formik.handleChange}
                                error={formik.touched.description && Boolean(formik.errors.description)}
                                helperText={formik.touched.description && formik.errors.description}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button disabled={isPending} color="primary" variant="contained" fullWidth type="submit">
                                {isPending ? 'Confirming...' : 'Create Market'}
                            </Button>
                            {hash && <div>Transaction Hash: {hash}</div>}
                            {isConfirming && <div>Waiting for confirmation...</div>}
                            {isConfirmed && <div>Transaction confirmed.</div>}
                        </Grid>
                    </Grid>
                </form>
            </CardContent>
        </Card>
    );
}

export default CreateMarketPage;
