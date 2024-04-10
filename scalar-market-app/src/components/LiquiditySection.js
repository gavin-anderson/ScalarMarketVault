import React from 'react';
import { Box, Button, Typography, TextField, Grid } from '@mui/material';

const percentages = ["100%", "50%", "25%", "10%", "2.5%"]; // Define your percentage options here

function LiquiditySection() {
  // Logic to handle liquidity actions here

  return (
    <Box>
      <Typography variant="h6" gutterBottom>New Position</Typography>
      <Grid container spacing={1}>
        {percentages.map((percent) => (
          <Grid item key={percent}>
            <Button variant="contained">{percent}</Button>
          </Grid>
        ))}
      </Grid>
      <Box mt={2} mb={2}>
        <Typography variant="subtitle1" gutterBottom>Liquidity Amount</Typography>
        <TextField label="Long" variant="outlined" />
        <TextField label="Short" variant="outlined" />
      </Box>
      <Box>
        {/* Replace these with your actual action handlers */}
        <Button variant="contained" color="primary">Claim Fees</Button>
        <Button variant="contained" color="secondary">Close Position</Button>
      </Box>
    </Box>
  );
}

export default LiquiditySection;
