const { Contract, utils } = require("ethers");
require('dotenv').config();

const { deployUniContracts } = require('../exportableScripts/deployUniContracts');
const { deployTokens } = require('../exportableScripts/deployTokens');
const { deployScalarMarketVault } = require('../exportableScripts/deployScalarMarketVault');
const {mintUSDC} = require("../exportableScripts/mintUSDC");
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
// TOO MAKE SURE IT ALL WORKS
async function main() {

    const [owner, signer2] = await ethers.getSigners();
    const provider = waffle.provider;
    const uniAddresses = await deployUniContracts(owner);
    console.log("-------------------------------------");

    const tokenAddresses = await deployTokens(owner, signer2);
    console.log("-------------------------------------");

    const addresses = { ...uniAddresses, ...tokenAddresses };
    const scalarMarketAddress = await deployScalarMarketVault(2, 6, owner, provider, addresses);
    addresses['VAULT_ADDRESS'] = scalarMarketAddress;
    console.log("-------------------------------------");
    await mintUSDC("10000",owner,signer2,provider,addresses);
    await mintLongShort("1000", signer2, provider, addresses);
    balances = await checkBalances(signer2, provider, addresses);
    console.log(`LongToken: ${balances.LongBalance} : ${utils.formatEther(String(balances.LongBalance))}`);
    console.log(`ShortToken: ${balances.ShortBalance} : ${utils.formatEther(String(balances.ShortBalance))}`);
    console.log("-------------------------------------");

    const poolAddress = await deployPools(500, owner, provider, addresses);
    addresses['POOL_ADDRESS'] = poolAddress;
    liquidity = await checkLiquidity(provider, addresses);
    console.log(`Liquidity: ${liquidity.liquidity}`); //Should be Zero
    console.log("-------------------------------------");

    await addLiquidity("100000", signer2, provider, addresses);
    liquidity = await checkLiquidity(provider, addresses);
    console.log(`Liquidity: ${liquidity.liquidity} : ${utils.formatEther(String(liquidity.liquidity))}`);
    console.log("-------------------------------------");

    balances = await checkBalances(signer2, provider, addresses);
    console.log(`LongToken: ${balances.LongBalance} : ${utils.formatEther(String(balances.LongBalance))}`);
    console.log(`ShortToken: ${balances.ShortBalance} : ${utils.formatEther(String(balances.ShortBalance))}`);
    console.log("-------------------------------------");

    await swap041("89", signer2, provider, addresses);
    balances = await checkBalances(signer2, provider, addresses);
    console.log(`LongToken: ${balances.LongBalance} : ${utils.formatEther(String(balances.LongBalance))}`);
    console.log(`ShortToken: ${balances.ShortBalance} : ${utils.formatEther(String(balances.ShortBalance))}`);
    console.log("-------------------------------------");

    const estimates = await balanceBooks(signer2, provider, addresses);

    console.log(`Estimate: ${estimates.estimate} : ${utils.formatEther(String(estimates.estimate))}`);
    console.log(`AmountIn: ${estimates.amountIn}`);
    console.log(`Direction: ${estimates.direction = 0 ? 'Token0 for Token1' : 'Token1 for Token0'}`);
    console.log("-------------------------------------");

    if (estimates.direction == 0) {
        const quote = await quote041(estimates.amountIn, signer2, provider, addresses);
        console.log(`Price Before: ${quote.priceBefore}`);
        console.log(`Price After: ${quote.priceAfter}`);
        const priceImpact = Math.abs(quote.priceBefore-quote.priceAfter)*100/quote.priceBefore;
        console.log(`Price Impact: ${priceImpact}%`);
        console.log(`Test inputAmount: ${(1-priceImpact)*estimates.amountIn}`);
        console.log(`Direction: ${quote.swappedDirection}`);
        console.log(`Amount Out: ${quote.receipt.amountOut} : ${utils.formatEther(String(quote.receipt.amountOut))}`);
        console.log("-------------------------------------");
        await swap041(String(estimates.amountIn*(1-priceImpact)), signer2, provider, addresses);
        balances = await checkBalances(signer2, provider, addresses);
        console.log(`LongToken: ${balances.LongBalance} : ${utils.formatEther(String(balances.LongBalance))}`);
        console.log(`ShortToken: ${balances.ShortBalance} : ${utils.formatEther(String(balances.ShortBalance))}`);
        console.log(`Difference in balances: ${Math.abs(balances.LongBalance-balances.ShortBalance)}`);
        console.log("-------------------------------------");

    } else {
        const quote = await quote140(estimates.amountIn, signer2, provider, addresses);
        console.log(`Price Before: ${quote.priceBefore}`);
        console.log(`Price After: ${quote.priceAfter}`);
        const priceImpact = Math.abs(quote.priceBefore-quote.priceAfter)/quote.priceBefore;
        console.log(`Price Impact: ${priceImpact*100}%`);
        console.log(`Test inputAmount: ${(1-priceImpact)*estimates.amountIn}`);
        console.log(`Direction: ${quote.swappedDirection}`);
        console.log(`Amount Out: ${quote.receipt.amountOut} : ${utils.formatEther(String(quote.receipt.amountOut))}`);
        console.log("-------------------------------------");
        await swap140(String(estimates.amountIn*(1-priceImpact)), signer2, provider, addresses);
        balances = await checkBalances(signer2, provider, addresses);
        console.log(`LongToken: ${balances.LongBalance} : ${utils.formatEther(String(balances.LongBalance))}`);
        console.log(`ShortToken: ${balances.ShortBalance} : ${utils.formatEther(String(balances.ShortBalance))}`);
        console.log(`Difference in balances: ${utils.formatEther(String(Math.abs(balances.LongBalance-balances.ShortBalance)))}`);
        console.log("-------------------------------------");

    }

    // const quote = await quote041("1", signer2, provider, addresses); // If transaction too old just restart node.
    // console.log(`Price Before: ${quote.priceBefore}`);
    // console.log(`Price After: ${quote.priceAfter}`);
    // console.log(`Direction: ${quote.swappedDirection}`);
    // console.log("-------------------------------------");

    // await swap041("1", signer2, provider, addresses); // If transaction too old just restart node.
    // balances = await checkBalances(signer2, provider, addresses);
    // console.log(`LongToken: ${balances.LongBalance}`);
    // console.log(`ShortToken: ${balances.ShortBalance}`);
    // console.log("-------------------------------------");

    // const quote2 = await quote140("1", signer2, provider, addresses); // If transaction too old just restart node.
    // console.log(`Price Before: ${quote2.priceBefore}`);
    // console.log(`Price After: ${quote2.priceAfter}`);
    // console.log(`Direction: ${quote2.swappedDirection}`);
    // console.log("-------------------------------------");

    // await swap140("1", signer2, provider, addresses); // If transaction too old just restart node.
    // balances = await checkBalances(signer2, provider, addresses);
    // console.log(`LongToken: ${balances.LongBalance}`);
    // console.log(`ShortToken: ${balances.ShortBalance}`);
    // console.log("-------------------------------------");

}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });