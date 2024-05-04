require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { ethers } = require('ethers');
const factoryABI = require("./abi/ScalarMarketFactory.json").abi;

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

// Schema for metadata on Created Markets
const metaDataSchema = new Schema({
    ticker: String,
    rangeOpen: Number,
    rangeClose: Number,
    expiry: Date,
    block_expiry: Number,
    description: String,
    creator: String
});

// Schema for Created Markets Event Emitted by Scalar Factory
const allMarketsSchema = new Schema({
    vaultAddress: String,
    longAddress: String,
    shortAddress: String,
    rangeOpen: Number,
    rangeClose: Number,
    block_expiry: Number,
    creator: String
});


// Create models
const metaData = mongoose.model('MetaData', metaDataSchema);
const marketData = mongoose.model('MarketData', allMarketsSchema);

// REST API endPoints

// Post Requests
// used for submitting meta data on created market
app.post('/submit-metadata', async (req, res) => {
    console.log(req.body);
    try {
        const newData = new metaData(req.body);
        await newData.save();
        res.status(201).json({ message: 'Data submitted successfully', data: newData });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting data', error: error });
    }
});
// Get Requests
// Used to grab all markets
app.get('/get-markets', async (req, res) => {
    try {
        const allData = await metaData.find({});
        res.status(200).json(allData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching market data', error: error });
    }
});
// Used to grab a specific market by ID
app.get('/get-market/:id', async (req, res) => {
    try {
        const market = await metaData.findById(req.params.id);
        if (!market) {
            return res.status(404).json({ message: 'Market not found' });
        }
        res.status(200).json(market);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching market data', error: error });
    }
});

// Contract listner for Markets Created
function setupContractListeners() {
    const scalarFactoryAddress = process.env.SCALAR_MARKET_FACTORY;
    const rpcUrl = process.env.HARDHAT_URL;
    const provider = new ethers.getDefaultProvider(rpcUrl);
    const contract = new ethers.Contract(scalarFactoryAddress, factoryABI, provider);
    const filter = contract.filters.MarketCreated();

    contract.on(filter, async (eventPayLoad) => {
        try {
            const args = eventPayLoad.args;
            const [scalarMarketVaultClone, longTokenClone, shortTokenClone, startRange, endRange, expiry, creator] = args;
    
            const newMarket = new marketData({
                vaultAddress: scalarMarketVaultClone.toString(),
                longAddress: longTokenClone.toString(),
                shortAddress: shortTokenClone.toString(),
                rangeOpen: Number(startRange),
                rangeClose: Number(endRange),
                block_expiry: Number(expiry),
                creator: creator.toString()
            });
            await newMarket.save();
            console.log('Event data saved:', newMarket);
        } catch (error) {
            console.error('Error saving event data:', newMarket);
        }
    });
}
setupContractListeners();

// Set the port
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
// node server.js
