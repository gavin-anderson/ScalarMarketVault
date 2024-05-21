require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { ethers } = require('ethers');
const { AlphaRouter, SwapOptionsSwapRouter02, SwapType } = require('@uniswap/smart-order-router');
const { ChainId } = require('@uniswap/sdk-core');
const { Token, CurrencyAmount, Percent, TradeType } = require('@uniswap/sdk-core');
const Joi = require('joi');

const { fromReadableAmount } = require('./lib/conversions');
const scalarFactoryABI = require("./abi/ScalarMarketFactory.json").abi;
const uniFactoryABI = require("./abi/UniswapV3Factory.json").abi;

// Enable CORS for client-side
// Middleware to parse JSON bodies
const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const connectionString = process.env.MONGODB_URI;
mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });

// Define Schemas
const Schema = mongoose.Schema;

// MetaData Map
const metadataMap = new Map();

// Schemas for MongoDB
// Schema for Created Markets Event Emitted by Scalar Factory
const allMarketsSchema = new Schema({
    ticker: String,
    description: String,
    vaultAddress: String,
    longAddress: String,
    shortAddress: String,
    rangeOpen: Number,
    rangeClose: Number,
    expiry: Date,
    block_expiry: Number,
    creator: String,
    transactionHash: String,
    awaitingMetadata: { type: Boolean, default: false },
    pools: [{
        poolAddress: String,
        feeTier: String,
        tickSpacing: String
    }]
});

// Validation Schemas
// Schema for metaData submissions
const metadataSchema = Joi.object({
    ticker: Joi.string().required(),
    description: Joi.string().required(),
    expiry: Joi.date().required(),
    transactionHash: Joi.string().required()
});
// Middleware Validation
// Validation for metaData
const validateMetadata = (req, res, next) => {
    const { error } = metadataSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: "Invalid metadata submission", details: error.details });
    }
    next();
};
// Validation for Ethereum Address
const validateEthereumAddress = (req, res, next)=> {
    const { vaultAddress } = req.params;
    // Regex to check if it's a valid Ethereum address
    if (/^0x[a-fA-F0-9]{40}$/.test(vaultAddress)) {
        next();
    } else {
        res.status(400).json({ message: "Invalid Ethereum address format." });
    }
};

//Validation for Empty request
const ensureEmptyRequestBody = (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        next();
    } else {
        res.status(400).json({ message: "Request body must be empty." });
    }
}


// Create models
const marketData = mongoose.model('MarketData', allMarketsSchema);

// REST API endPoints

// Post Requests
// used for submitting meta data on created market
app.post('/submit-metadata',validateMetadata, async (req, res) => {
    console.log(" Recieved Metadata");
    console.log(req.body);
    try {
        const newMetadata = req.body;
        const transactionHash = newMetadata.transactionHash;
        const market = await marketData.findOne({ transactionHash: transactionHash, awaitingMetadata: true });
        console.log(`Returned Value of Search for transactionHash and awaitingMetaData : true  ${market}`);
        if (market) {
            Object.assign(market, newMetadata, { awaitingMetadata: false });
            await market.save();
            console.log('Joined metadata and market data saved:', market);
            res.status(201).json({ message: 'Market Event Found Before MetaData Arrived', data: newData });
        }else{
            metadataMap.set(transactionHash, newMetadata)
            console.log(`Data Saved in Dict`);
            res.status(201).json({ message: 'Data submitted no event yet', data: newData });
            
        }
        
    } catch (error) {
        res.status(500).json({ message: 'Error submitting data', error: error });
    }
});
// Used for smart-order-swap-router
app.post('/smart-router', async (req, res) => {
    console.log("Recieved data for smart order request");
    console.log(req.body);
    try {
        const rpcUrl = process.env.HARDHAT_URL;
        const provider = new ethers.getDefaultProvider(rpcUrl);

        const router = new AlphaRouter({
            chainId: ChainId.MAINNET,
            provider,
        });

        const options = new SwapOptionsSwapRouter02({
            recipient: req.body.recipient,
            slippageTolerance: new Percent(50, 10_000),
            deadline: Math.floor(Date.now() / 1000 + 1800),
            type: SwapType.SWAP_ROUTER_02,
        });
        const rawTokenAmountIn = fromReadableAmount(
            CurrentConfig.currencies.amountIn,
            CurrentConfig.currencies.in.decimals
        );

        const route = await router.route(
            CurrencyAmount.fromRawAmount(
                CurrentConfig.currencies.in,
                rawTokenAmountIn
            ),
            CurrentConfig.currencies.out,
            TradeType.EXACT_INPUT,
            options
        )

        if (route && route.status === RouteStatus.Success) {
            res.status(200).json(route);
        } else {
            throw new Error('Failed to find a route');
        }

    } catch (error) {
        console.log(error);
    }
});


// Get Requests
// Used to grab all markets
app.get('/get-markets', ensureEmptyRequestBody, async (req, res) => {
    try {
        const allData = await marketData.find({ ticker: { $ne: "" } });
        res.status(200).json(allData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching market data', error: error });
    }
});
// Used to grab a specific market by ID
app.get('/get-market/:vaultAddress',validateEthereumAddress, async (req, res) => {
    try {
        const market = await marketData.findOne({ vaultAddress: req.params.vaultAddress });
        if (!market) {
            return res.status(404).json({ message: 'Market not found' });
        }
        res.status(200).json(market);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching market data', error: error });
    }
});

// Contract listener for Markets Created
async function setupContractListeners() {
    const rpcUrl = process.env.HARDHAT_URL;
    const provider = new ethers.getDefaultProvider(rpcUrl);

    const scalarFactoryAddress = process.env.SCALAR_MARKET_FACTORY;
    const uniFactoryAddress = process.env.FACTORY_ADDRESS;

    const scalarFactoryContract = new ethers.Contract(scalarFactoryAddress, scalarFactoryABI, provider);
    const uniFactoryContract = new ethers.Contract(uniFactoryAddress, uniFactoryABI, provider);
    let marketCreated;
    let poolCreated;
    try {
        marketCreated = scalarFactoryContract.filters.MarketCreated();
        poolCreated = uniFactoryContract.filters.PoolCreated();

    } catch (error) {
        console.log(error);
        console.error(error);
    }

    scalarFactoryContract.on(marketCreated, async (eventPayload) => {
        try {
            console.log("MARKET CREATED");
            const args = eventPayload.args;
            console.log(`Arguments in eventPayload ${args}`);
            const [scalarMarketVaultClone, longTokenClone, shortTokenClone, startRange, endRange, expiry, creator] = args;

            const _transactionHash = eventPayload.log.transactionHash;
            console.log(`TransactionHash: ${_transactionHash}`);

            // Find matching metadata
            if (metadataMap.has(_transactionHash)) {
                // Metadata found, join metadata and market data and delete metadata from map
                console.log("Found it");
                const metadata = metadataMap.get(_transactionHash);
                metadataMap.delete(_transactionHash);
                const newMarketData = new marketData({
                    ...metadata,
                    rangeOpen: Number(startRange) / 10 ** 18,
                    rangeClose: Number(endRange) / 10 ** 18,
                    block_expiry: Number(expiry),
                    vaultAddress: scalarMarketVaultClone.toString(),
                    longAddress: longTokenClone.toString(),
                    shortAddress: shortTokenClone.toString(),
                    creator: creator.toString(),
                    transactionHash: _transactionHash,
                    pools: [],
                    awaitingMetadata:false

                });
                await newMarketData.save();
                console.log('Joined metadata and market data saved:', newMarketData);
            } else {
                // No matching metadata found, create new market data
                const newMarketData = new marketData({
                    vaultAddress: scalarMarketVaultClone.toString(),
                    longAddress: longTokenClone.toString(),
                    shortAddress: shortTokenClone.toString(),
                    rangeOpen: Number(startRange) / 10 ** 18,
                    rangeClose: Number(endRange) / 10 ** 18,
                    block_expiry: Number(expiry),
                    creator: creator.toString(),
                    transactionHash: _transactionHash,
                    ticker: "",
                    expiry: "",
                    description: "",
                    pools: [],
                    awaitingMetadata:true
                });
                await newMarketData.save();
                console.log('New market data saved without meta data:', newMarketData);
            }
        } catch (error) {
            console.error('Error handling event:', error);
        }

        console.log("Finished Process");
        console.log("----------------------------");
    });
    uniFactoryContract.on(poolCreated, async (eventPayload) => {
        try {
            console.log("POOL CREATED");
            const [token0, token1, _fee, _tickSpacing, _poolAddress] = eventPayload.args;
            console.log(token0);
            console.log(token1);
            console.log(_fee);
            console.log(_tickSpacing);
            console.log(_poolAddress);
            const marketDataDocument = await marketData.findOne({
                $or: [{ longAddress: token0 }, { shortAddress: token0 }]
            });
            if (marketDataDocument) {
                console.log('Matching marketData found:', marketDataDocument);

                // Add the new pool details to the existing 'pools' array
                marketDataDocument.pools.push({ poolAddress: _poolAddress, feeTier: _fee, tickSpacing: _tickSpacing });
                // Save the updated document back to the database
                await marketData.findByIdAndUpdate(marketDataDocument._id, marketDataDocument, { new: true });

                console.log('Market data updated with pool address and fee tier:', marketDataDocument);
            } else {
                console.log('No matching marketData found.');
            }
        } catch (error) {
            console.log(error);
        }
    });
}

// Set up contract listeners
setupContractListeners();

// Set the port
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
// node server.js
