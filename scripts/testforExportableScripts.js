const { Contract } = require("ethers");
require('dotenv').config();

const { deployUniContracts } = require('../exportableScripts/deployUniContracts');
const { deployTokens } = require('../exportableScripts/deployTokens');
const { deployScalarMarketVault } = require('../exportableScripts/deployScalarMarketVault');
const { mintLongShort } = require('../exportableScripts/mintLongShort');
const { checkBalances } = require('../lib/getBalances');
const { deployPools } = require('../exportableScripts/deployPools');
const { checkLiquidity } = require('../lib/checkLiquidity');
const { addLiquidity } = require('../exportableScripts/addLiquidity');
const { swap041, swap140, quote041, quote140 } = require('../lib/swaps');
const { setFinalValue } = require("../exportableScripts/setFinalValue");
const { finalRedeem } = require('../exportableScripts/finalRedeem');
const { fullSwapRedeem } = require('../exportableScripts/fullSwapRedeem');

async function main() {

    const [owner, signer2] = await ethers.getSigners();
    const provider = waffle.provider;
    const uniAddresses = await deployUniContracts(signer2);
    console.log("-------------------------------------");

    const tokenAddresses = await deployTokens(owner, signer2);
    console.log("-------------------------------------");

    const addresses = { ...uniAddresses, ...tokenAddresses };
    const scalarMarketAddress = await deployScalarMarketVault(2, 6, owner, provider, addresses);
    addresses['VAULT_ADDRESS'] = scalarMarketAddress;
    console.log("-------------------------------------");

    await mintLongShort("100", signer2, provider, addresses);
    balances = await checkBalances(signer2, provider, addresses);
    console.log(`LongToken: ${balances.LongBalance}`);
    console.log("-------------------------------------");

    const poolAddress = await deployPools(500, owner, provider, addresses);
    addresses['POOL_ADDRESS'] = poolAddress;
    liquidity = await checkLiquidity(provider, addresses);
    console.log(`Liquidity: ${liquidity.liquidity}`); //Should be Zero
    console.log("-------------------------------------");

    await addLiquidity("1000", signer2, provider, addresses);
    liquidity = await checkLiquidity(provider, addresses);
    console.log(`Liquidity: ${liquidity.liquidity}`);
    console.log("-------------------------------------");

    const quote = await quote041("1", signer2, provider, addresses); // If transaction too old just restart node.
    console.log(`Price Before: ${quote.priceBefore}`);
    console.log(`Price After: ${quote.priceAfter}`);
    console.log(`Direction: ${quote.swappedDirection}`);
    console.log("-------------------------------------");

    await swap041("1", signer2, provider, addresses); // If transaction too old just restart node.
    balances = await checkBalances(signer2, provider, addresses);
    console.log(`LongToken: ${balances.LongBalance}`);
    console.log(`ShortToken: ${balances.ShortBalance}`);
    console.log("-------------------------------------");

    const quote2 = await quote140("1", signer2, provider, addresses); // If transaction too old just restart node.
    console.log(`Price Before: ${quote2.priceBefore}`);
    console.log(`Price After: ${quote2.priceAfter}`);
    console.log(`Direction: ${quote2.swappedDirection}`);
    console.log("-------------------------------------");

    await swap140("1", signer2, provider, addresses); // If transaction too old just restart node.
    balances = await checkBalances(signer2, provider, addresses);
    console.log(`LongToken: ${balances.LongBalance}`);
    console.log(`ShortToken: ${balances.ShortBalance}`);
    console.log("-------------------------------------");

    await setFinalValue(5, owner, provider, addresses);
    await finalRedeem("1", "2", signer2, provider, addresses);
    balances = await checkBalances(signer2, provider, addresses);
    console.log(`LongToken: ${balances.LongBalance}`);
    console.log(`ShortToken: ${balances.ShortBalance}`);
    console.log(`USDCToken: ${balances.UsdcBalance}`);
    console.log("-------------------------------------");

    await fullSwapRedeem(signer2, provider, addresses);
    balances = await checkBalances(signer2, provider, addresses);
    console.log(`LongToken: ${balances.LongBalance}`);
    console.log(`ShortToken: ${balances.ShortBalance}`);
    console.log(`USDCToken: ${balances.UsdcBalance}`);












}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });