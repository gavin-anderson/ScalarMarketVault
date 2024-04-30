import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Button, TextField, Grid, Card, CardContent, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import useCreateMarket from '../scripts/useCreateMarket';  // Adjust the path as necessary

const validationSchema = Yup.object().shape({
    ticker: Yup.string().required('Required'),
    rangeOpen: Yup.number().required('Required'),
    rangeClose: Yup.number().required('Required'),
    expiry: Yup.date().required('Required'),
    description: Yup.string().required('Required'),
});

async function submitFormData(formData) {
    try {
        const response = await fetch('http://localhost:3001/submit-data', {
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
    const createMarket =useCreateMarket(); // Initialize the hook
    const formik = useFormik({
        initialValues: {
            ticker: '',
            rangeOpen: '',
            rangeClose: '',
            expiry: '',
            description: '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            console.log(values);
            const blockExpiry = convertDateToBlockNumber(values.expiry);
            const dataToSubmit = {
                ...values,
                block_expiry: blockExpiry,
            };
            await submitFormData(dataToSubmit); // Submit data to the server
            await createMarket(values.rangeOpen, values.rangeClose); // Create market on the blockchain
        },
    });

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
                            <Button color="primary" variant="contained" fullWidth type="submit">
                            Create Market
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </CardContent>
        </Card>
    );
}

export default CreateMarketPage;
