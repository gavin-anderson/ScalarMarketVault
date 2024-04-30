import { ThemeProvider, createTheme, CssBaseline, AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import TopBanner from "../components/TopBanner";
import { ConnectKitButton } from "connectkit";
import Link from 'next/link';
import dynamic from 'next/dynamic';
import '../styles/globals.css';

// Dynamically import the Web3Provider with no SSR
const Web3Provider = dynamic(() => import('../components/Web3Provider'), {
  ssr: false
});
// Define your theme
const theme = createTheme({
  typography: {
    fontFamily: 'Crimson Pro, serif',
  },
  palette: {
    background: {
      default: '#E7E6E1',
      paper: '#E7E6E1',
    },
    primary: {
      main: '#000000',
    },
    secondary: {
      main: '#314E52',
    },
  },
});

function MyApp({ Component, pageProps }) {
  return (
    <Web3Provider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="Market">
          <header className="Market-header">
            <TopBanner />
          </header>
          <AppBar position="static" color="background">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Scalar Markets
              </Typography>
              <Box sx={{ display: 'flex', flexGrow: 1 }}>
                <Button color="inherit" component={Link} href="/trending-markets">
                  Markets
                </Button>
                <Button color="inherit" component={Link} href="/portfolio">
                  Portfolio
                </Button>
                <Button color="inherit" component={Link} href="/create-market">
                  Create Market
                </Button>
                <Button color="inherit" component={Link} href="/faq">
                  FAQ
                </Button>
              </Box>
              <ConnectKitButton />
            </Toolbar>
          </AppBar>
          <Component {...pageProps} />
        </div>
      </ThemeProvider>
    </Web3Provider>
  );
}

export default MyApp;
