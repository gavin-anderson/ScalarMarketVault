import { Typography, Button, Box, Grid, TextField } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useWaitForTransactionReceipt, useWriteContract, useWatchContractEvent, useAccount } from 'wagmi';
import VaultArtifact from '../abi/ScalarMarketVault.json';
import {parseEther} from 'viem';


export default function DepositSection({marketDetails}) {
  const { address } = useAccount();
  const { data: hash, isPending, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash }); 

  const abi = VaultArtifact.abi;
  // Setting up Formik with validation using Yup
  const formik = useFormik({
    initialValues: {
      eth: '1', // Initial value set to 1 ETH
      longShort: '1000' // Initial value set to 1000 LongShort
    },
    validationSchema: Yup.object({
      eth: Yup.number()
        .positive('Amount must be positive')
        .required('Required'),
      longShort: Yup.number()
        .positive('Amount must be positive')
        .required('Required')
    }),
    onSubmit: async(values) => {
      console.log(values);
      try {
        await writeContract({
            address: marketDetails.scalarMarketVaultClone,
            abi,
            functionName: "mintLongShort",
            args: [address],
            value: parseEther(String(values.eth)),
            
        });
    } catch (error) {
        console.error('Transaction failed:', error);

    }
    }
  });

  // Handlers to synchronize eth and longShort fields
  const handleEthChange = (event) => {
    const ethValue = event.target.value;
    formik.setFieldValue('eth', ethValue);
    formik.setFieldValue('longShort', ethValue * 1000);
  };

  const handleLongShortChange = (event) => {
    const longShortValue = event.target.value;
    formik.setFieldValue('longShort', longShortValue);
    formik.setFieldValue('eth', longShortValue / 1000);
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <Box my={2}>
        <Typography variant="body2" gutterBottom>
          Deposit
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="ETH : 1"
              variant="outlined"
              fullWidth
              id="eth"
              name="eth"
              type="number"
              onChange={handleEthChange}
              value={formik.values.eth}
              error={formik.touched.eth && Boolean(formik.errors.eth)}
              helperText={formik.touched.eth && formik.errors.eth}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Long and Short : 1000"
              variant="outlined"
              fullWidth
              id="longShort"
              name="longShort"
              type="number"
              onChange={handleLongShortChange}
              value={formik.values.longShort}
              error={formik.touched.longShort && Boolean(formik.errors.longShort)}
              helperText={formik.touched.longShort && formik.errors.longShort}
            />
          </Grid>
        </Grid>

        <Button type="submit" variant="contained" sx={{ mt: 2 }}>
          Mint Tokens
        </Button>
      </Box>
    </form>
  );
}
