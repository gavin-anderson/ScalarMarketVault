import TopBanner from "./components/TopBanner";
import { BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom';
import MarketPage from "./MarketPage";
import CreateMarket from "./CreateMarket";
import PortfolioPage from "./Portfolio";
import MarketDetailPage from "./MarketPageDetails";
import FAQPage from "./FAQ";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { createGlobalStyle } from 'styled-components';
import { Web3Provider } from "./Web3Provider";
import {ConnectKitButton} from "connectkit";

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@200;400;600&display=swap');

  body {
    font-family: 'Crimson Pro', serif;
  }
`;

function App() {
    return (
        <Web3Provider>
        <>
            <GlobalStyle />
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
                            <ConnectKitButton/>
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
        </>
        </Web3Provider>
    );
}

export default App;