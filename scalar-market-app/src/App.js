import TopBanner from "./components/TopBanner";
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MarketPage from "./MarketPage";
import CreateMarket from "./CreateMarket";
import PortfolioPage from "./Portfolio";
import MarketDetailPage from "./MarketPageDetails";
import FAQPage from "./FAQ";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Web3Provider } from "./Web3Provider";
import { ConnectKitButton } from "connectkit";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// const GlobalStyle = createGlobalStyle`
//   @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@200;400;600&display=swap');

//   body {
//     font-family: 'Crimson Pro', serif;
//   }

// `;
const theme = createTheme({
    palette: {
        primary: {
            main: '#E7E6E1',
        },
        secondary: {
            main: '#314E52',
        }
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
                        <AppBar position="static">
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
                            <Route path="/create-market" element={<CreateMarket />} />
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