import { Typography, Button, Box, Grid, TextField } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

export default function DepositSection() {
  // Setting up Formik with validation using Yup
  const formik = useFormik({
    initialValues: {
      xWeth: '',
      xLongShort: ''
    },
    validationSchema: Yup.object({
      xWeth: Yup.number()
        .positive('Amount must be positive')
        .required('Required'),
      xLongShort: Yup.number()
        .positive('Amount must be positive')
        .required('Required')
    }),
    onSubmit: values => {
      // Handle form submission, e.g., call an API or state management function
      console.log(values);
    }
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Box my={2}>
        <Typography variant="body2" gutterBottom>
          Deposit
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="X WETH"
              variant="outlined"
              fullWidth
              id="xWeth"
              name="xWeth"
              type="number"
              onChange={formik.handleChange}
              value={formik.values.xWeth}
              error={formik.touched.xWeth && Boolean(formik.errors.xWeth)}
              helperText={formik.touched.xWeth && formik.errors.xWeth}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="X Long and Short"
              variant="outlined"
              fullWidth
              id="xLongShort"
              name="xLongShort"
              type="number"
              onChange={formik.handleChange}
              value={formik.values.xLongShort}
              error={formik.touched.xLongShort && Boolean(formik.errors.xLongShort)}
              helperText={formik.touched.xLongShort && formik.errors.xLongShort}
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
