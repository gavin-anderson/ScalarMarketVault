import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import TopBanner from "./components/TopBanner";
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MarketPage from "./MarketPage";
import CreateMarketPage from "./CreateMarketPage";
import PortfolioPage from "./Portfolio";
import MarketDetailPage from "./MarketPageDetails";
import FAQPage from "./FAQ";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Web3Provider } from "./Web3Provider";
import { ConnectKitButton } from "connectkit";
import './styles/index.css';

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
          main:'#314E52', 
        },
    },
});

function App() {
    return (
        <Web3Provider>
            <ThemeProvider theme={theme}>
                <CssBaseline />

                <div className="Market">
                    <header className="Market-header">
                        <TopBanner />
                    </header>
                    <Router>
                        <AppBar position="static" color="background"> 
                            <Toolbar>
                                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                                    Scalar Markets
                                </Typography>
                                <Box sx={{ display: 'flex', flexGrow: 1 }}>
                                    <Button color="inherit" component={Link} to="/">
                                        Markets
                                    </Button>
                                    <Button color="inherit" component={Link} to="/portfolio">
                                        Portfolio
                                    </Button>
                                    <Button color="inherit" component={Link} to="/create-market">
                                        Create Market
                                    </Button>
                                    <Button color="inherit" component={Link} to="/faq">
                                        FAQ
                                    </Button>
                                </Box>
                                {/* <Button color="inherit">Connect Wallet</Button> */}
                                <ConnectKitButton />
                            </Toolbar>
                        </AppBar>

                        <Routes>
                            <Route path="/" element={<MarketPage />} />
                            <Route path="/create-market" element={<CreateMarketPage />} />
                            <Route path="/portfolio" element={<PortfolioPage />} />
                            <Route path="/faq" element={<FAQPage />} />
                            <Route path="/market/:id" element={<MarketDetailPage />} />
                        </Routes>
                    </Router>
                </div>

            </ThemeProvider>
        </Web3Provider>
    );
}

export default App;