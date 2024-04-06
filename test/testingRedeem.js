const { Contract, utils } = require("ethers");
require('dotenv').config();

const { deployUniContracts } = require('../exportableScripts/deployUniContracts');
const { deployTokens } = require('../exportableScripts/deployTokens');
const { deployScalarMarketVault } = require('../exportableScripts/deployScalarMarketVault');
const { mintUSDC } = require("../exportableScripts/mintUSDC");
const { mintLongShort } = require('../exportableScripts/mintLongShort');
const { checkBalances } = require('../lib/getBalances');
const { deployPools } = require('../exportableScripts/deployPools');
const { checkLiquidity } = require('../lib/checkLiquidity');
const { addLiquidity } = require('../exportableScripts/addLiquidity');
const { swap041, swap140, quote041, quote140 } = require('../lib/swaps');
const { balanceBooks } = require("../exportableScripts/balanceBooks");
const { setFinalValue } = require("../exportableScripts/setFinalValue");
const { finalRedeem } = require('../exportableScripts/finalRedeem');
const { fullSwapRedeem } = require('../exportableScripts/fullSwapRedeem');

async function main() {

    const [owner, signer2, signer3, signer4] = await ethers.getSigners();
    const provider = waffle.provider;

    console.log("-------------BASIC SETUP-------------");
    const uniAddresses = await deployUniContracts(signer2);
    console.log("-------------------------------------");

    const tokenAddresses = await deployTokens(owner);
    console.log("-------------------------------------");

    const addresses = { ...uniAddresses, ...tokenAddresses };
    const scalarMarketAddress = await deployScalarMarketVault(2, 6, owner, provider, addresses);
    addresses['VAULT_ADDRESS'] = scalarMarketAddress;
    console.log("-------------------------------------");
    const poolAddress = await deployPools(500, owner, provider, addresses);
    addresses['POOL_ADDRESS'] = poolAddress;
    liquidity = await checkLiquidity(provider, addresses);
    console.log(`Liquidity: ${liquidity.liquidity}`); 
    console.log("-------------------------------------");
    console.log("---------BASIC SETUP COMPLETED---------");


    console.log("---------SIGNER 2: LP---------")
    await mintUSDC("1000",owner,signer2,provider,addresses);
    await mintLongShort("1000", signer2, provider, addresses);
    balances = await checkBalances(signer2, provider, addresses);
    console.log(`LongToken: ${balances.LongBalance} : ${utils.formatEther(String(balances.LongBalance))}`);
    console.log(`ShortToken: ${balances.ShortBalance} : ${utils.formatEther(String(balances.ShortBalance))}`);
    console.log("-------------------------------------");

    await addLiquidity("100000", signer2, provider, addresses);
    liquidity = await checkLiquidity(provider, addresses);
    console.log(`Liquidity: ${liquidity.liquidity} : ${utils.formatEther(String(liquidity.liquidity))}`);
    console.log("-------------------------------------");

    await mintLongShort("1000", signer2, provider, addresses);
    balances = await checkBalances(signer2, provider, addresses);
    console.log(`LongToken: ${balances.LongBalance} : ${utils.formatEther(String(balances.LongBalance))}`);
    console.log(`ShortToken: ${balances.ShortBalance} : ${utils.formatEther(String(balances.ShortBalance))}`);
    console.log("-------------------------------------");

    

    balances = await checkBalances(signer2, provider, addresses);
    console.log(`LongToken: ${balances.LongBalance} : ${utils.formatEther(String(balances.LongBalance))}`);
    console.log(`ShortToken: ${balances.ShortBalance} : ${utils.formatEther(String(balances.ShortBalance))}`);
    console.log("-------------------------------------");
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });