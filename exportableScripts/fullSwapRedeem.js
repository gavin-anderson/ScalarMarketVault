const { checkBalances } = require("../lib/getBalances");
const { checkVault, checkSwapRouter } = require("../lib/checkAllowances");
const { getPoolImmutables, getPoolState } = require('../lib/helpers');
const { sqrtPriceX96ToPrice } = require("../lib/priceConversions");
const { checkTokenHexOrder } = require("../lib/checkTokens");
const { Contract, utils } = require("ethers");

ScalarVaultABI = require("../artifacts/contracts/ScalarMarketVault.sol/ScalarMarketVault.json").abi;
ERC20ABI = require('../ERC20.json');
IUniswapV3PoolABI = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json').abi;

BASE_FEE = 1000000;

async function fullSwapRedeem(signer, provider, addresses) {

    // Init pool contract
    const poolContract = new Contract(addresses.POOL_ADDRESS, IUniswapV3PoolABI, provider);

    // Get Pool immutables and state
    const immutables = await getPoolImmutables(poolContract);
    const state = await getPoolState(poolContract);

    // Convert price 
    const price = await sqrtPriceX96ToPrice(state.sqrtPriceX96);

    // Get Balances
    const balances = await checkBalances(signer, provider, addresses);

    // Determine the order of the tokens
    [_token0, _token1] = await checkTokenHexOrder(addresses.LONG_TOKEN_ADDRESS, addresses.SHORT_TOKEN_ADDRESS);

    // Init token contracts
    const token0Contract = new Contract(_token0, ERC20ABI, provider);
    const token1Contract = new Contract(_token1, ERC20ABI, provider);

    // Approve token spend
    await token0Contract.connect(signer).approve(addresses.VAULT_ADDRESS, balances.token0Balance);
    await token1Contract.connect(signer).approve(addresses.VAULT_ADDRESS, balances.token1Balance);

    // Init Vault
    const vaultContract = new Contract(addresses.VAULT_ADDRESS, ScalarVaultABI, provider);

    // Declare estimate
    let estimate;
    // Determine amount to sent
    if (balances.token0Balance > balances.token1Balance) {
        const diffBal = balances.token0Balance - balances.token1Balance;
        estimate = diffBal / (1 + (1 - immutables.fee / BASE_FEE) * price); //Type is number and will need to be a string 
    } else {
        const diffBal = balances.token1Balance - balances.token0Balance;
        estimate = diffBal / (1 + (1 - immutables.fee / BASE_FEE) / price); //Type is number and will need to be a string 

    }
    // Call fullSwapRedeem
    const tx = await vaultContract.connect(signer).fullSwapRedeem(String(estimate), 0) //Set to 0 amountOut on the swap change this in future

}

module.exports = {
    fullSwapRedeem
}
