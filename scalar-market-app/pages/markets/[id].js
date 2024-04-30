import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, Typography, Box, Grid, Tabs, Tab } from '@mui/material';
import SwapSection from '../../components/SwapSection';
import DepositSection from '../../components/DepositSection';
import LiquiditySection from '../../components/LiquiditySection';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function MarketDetailPage({ marketDetail }) {
  const [value, setValue] = useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  if (!marketDetail) return <div>Loading...</div>;

  return (
    <Card raised>
      <CardContent>
        <Typography variant="h4" gutterBottom>
          {marketDetail.ticker}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          {marketDetail.description}
        </Typography>
        <Grid container spacing={2} my={2}>
          <Grid item xs={3}>
            <Typography variant="body2">Range Open: {marketDetail.rangeOpen}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body2">Range Close: {marketDetail.rangeClose}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body2">Expiry: {marketDetail.expiry}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body2">Block Expiry: {marketDetail.block_expiry}</Typography>
          </Grid>
        </Grid>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="market detail tabs">
            <Tab label="Mint" />
            <Tab label="Swap" />
            <Tab label="Liquidity" />
            <Tab label="Redeem" />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <DepositSection />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <SwapSection />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <LiquiditySection/>
        </TabPanel>
        <TabPanel value={value} index={3}>
          {/* Content for Redeem */}
        </TabPanel>
      </CardContent>
    </Card>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.params;
  const res = await fetch(`http://localhost:3001/get-market/${id}`);
  const marketDetail = await res.json();

  return {
    props: {
      marketDetail,
    },
  };
}

export default MarketDetailPage;
