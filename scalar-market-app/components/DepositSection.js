import { Typography, Button, Box, Grid, TextField} from '@mui/material';
export default function DepositSection(){
    return(<Box my={2}>
        <Typography variant="body2" gutterBottom>
          Deposit
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <TextField
              label="X WETH"
              variant="outlined"
              fullWidth
            // Set the value and onChange according to your state management
            />
          </Grid>
          <Grid item>
            <TextField
              label="X Long and Short"
              variant="outlined"
              fullWidth
            // Set the value and onChange according to your state management
            />
          </Grid>
        </Grid>

        <Button variant="contained" sx={{ mt: 2 }}>
          Mint Tokens
        </Button>
      </Box>);
}