const { ethers } = require('ethers');
const abi  = require("./abi/ScalarMarketFactory.json").abi;

// Contract address
const contractAddress = '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853'; // Replace with your contract address

// Hardhat JSON-RPC URL
const rpcUrl = 'http://127.0.0.1:8545'; // Replace with your Hardhat JSON-RPC URL

// Connect to Hardhat JSON-RPC provider
const provider = new ethers.getDefaultProvider(rpcUrl);

// Contract instance
const contract = new ethers.Contract(contractAddress, abi, provider);

// Event filter
const filter = contract.filters.MarketCreated();

// Event listener
contract.on(filter, (payLoad) => {
    const args = payLoad.args;

    const scalarMarketVaultClone = args[0];
    const longTokenClone = args[1];
    const shortTokenClone = args[2];
    const startRange = args[3];
    const endRange = args[4];
    const expiry = args[5];
    const creator = args[6];

    console.log('Market created:');
    console.log('Scalar Market Vault Clone:', scalarMarketVaultClone);
    console.log('Long Token Clone:', longTokenClone);
    console.log('Short Token Clone:', shortTokenClone);
    console.log('Start Range:', startRange.toString());
    console.log('End Range:', endRange.toString());
    console.log('Expiry:', expiry.toString());
    console.log('Creator:', creator);
});


