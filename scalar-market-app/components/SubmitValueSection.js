import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Button, TextField, Grid, Card, CardContent, Typography } from '@mui/material';
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { ethers } from 'ethers';
const ScalarVaultABI = require('../abi/ScalarMarketVault.json').abi;

function SubmitValueSection({ marketDetails }) {
  const { address: userAddress } = useAccount();
  const { data: hash, isPending, writeContract } = useWriteContract({});
  const { isLoading: isSubmitting, isSuccess: finalValueSubmitted } = useWaitForTransactionReceipt({ hash });
  // Formik setup for submitting a number
  const formik = useFormik({
    initialValues: {
      finalValue: '',
    },
    validationSchema: Yup.object({
      finalValue: Yup.number().required('Required').positive('Value must be positive').integer('Value must be an integer'),
    }),
    onSubmit: (values, { resetForm }) => {
      console.log('Submitted value:', ethers.parseEther(String(values.finalValue)));
      try {
        writeContract({
          address: marketDetails.vaultAddress,
          abi: ScalarVaultABI,
          functionName: "setFinalValue",
          args: [ethers.parseEther(String(values.finalValue))],
        });
        // resetForm();
      } catch (error) {
        console.log(error)
      }
    },
  });
  const isCreator = userAddress === marketDetails.creator;
  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 5 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>Submit Value</Typography>
        <Typography variant="subtitle1" gutterBottom>{marketDetails.description}</Typography>
        <Typography variant="body1" gutterBottom>
          Range Open: {marketDetails.rangeOpen}, Range Close: {marketDetails.rangeClose}
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="finalValue"
                name="finalValue"
                label="Enter Value"
                type="number"
                value={formik.values.finalValue}
                onChange={formik.handleChange}
                error={formik.touched.finalValue && Boolean(formik.errors.finalValue)}
                helperText={formik.touched.finalValue && formik.errors.finalValue}
                margin="normal"
                variant="outlined"
                disabled={!isCreator}
              />
            </Grid>
            <Grid item xs={12}>
            <Button color="primary" variant="contained" fullWidth type="submit"
                      disabled={!isCreator || isSubmitting || isPending}>
                Submit
              </Button>
              {hash && <div>Transaction Hash: {hash}</div>}
              {isSubmitting && <div>Waiting for confirmation...</div>}
              {finalValueSubmitted && <div>Transaction confirmed.</div>}
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
}

export default SubmitValueSection;
