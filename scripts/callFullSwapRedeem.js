LONG_TOKEN_ADDRESS = '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6'
SHORT_TOKEN_ADDRESS = '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318'
VAULT_ADDRESS = '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e'
LONG_SHORT_500 = '0xfF87C979374657A843e2640EDC7B121103E9db94'

BASE_FEE = 1000000;

ScalarVaultABI = require("../artifacts/contracts/ScalarMarketVault.sol/ScalarMarketVault.json").abi;
ERC20ABI = require('../ERC20.json');
IUniswapV3PoolABI = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json').abi;

const { checkBalances } = require("../lib/getBalances");
const { checkVault, checkSwapRouter } = require("../lib/checkAllowances");
const { getPoolImmutables, getPoolState } = require('../lib/helpers');
const { sqrtPriceX96ToPrice } = require("../lib/priceConversions");
const { checkTokenHexOrder } = require("../lib/checkTokens");
const { Contract, utils } = require("ethers");


async function main() {
    const [owner, signer2] = await ethers.getSigners();
    const provider = waffle.provider;

    // Init pool contract
    const poolContract = new Contract(LONG_SHORT_500, IUniswapV3PoolABI, provider);

    // Get Pool immutables and state
    const immutables = await getPoolImmutables(poolContract);
    const state = await getPoolState(poolContract);

    // Convert price 
    const price = await sqrtPriceX96ToPrice(state.sqrtPriceX96);

    // Get Balances
    const balances = await checkBalances(signer2, provider);

    // Determine the order of the tokens
    [_token0, _token1] = await checkTokenHexOrder(LONG_TOKEN_ADDRESS, SHORT_TOKEN_ADDRESS);

    // Init token contracts
    const token0Contract = new Contract(_token0, ERC20ABI, provider);
    const token1Contract = new Contract(_token1, ERC20ABI, provider);

    // Approve token spend
    await token0Contract.connect(signer2).approve(VAULT_ADDRESS, balances.token0Balance);
    await token1Contract.connect(signer2).approve(VAULT_ADDRESS, balances.token1Balance);

    // Init Vault
    const vaultContract = new Contract(VAULT_ADDRESS, ScalarVaultABI, provider);

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
    const tx = await vaultContract.connect(signer2).fullSwapRedeem(String(estimate),0) //Set to 0 amountOut on the swap change this in future
    const tokenIn = await vaultContract.connect(signer2).tokenInTemp();
    const tokenOut = await vaultContract.connect(signer2).tokenOutTemp();
    const balanceL = await vaultContract.connect(signer2).balanceLTemp();
    const balanceS = await vaultContract.connect(signer2).balanceSTemp();

    console.log(`Token In Add: ${tokenIn}`);
    console.log(`Token Out Add: ${tokenOut}`);
    console.log(`Balance Long Contract: ${balanceL}`);
    console.log(`Balance Short Contract: ${balanceS}`);










    // const poolContract = new Contract(LONG_SHORT_500, IUniswapV3PoolABI, provider);
    // const immutables = await getPoolImmutables(poolContract);
    // const state = await getPoolState(poolContract);
    // const balances = await checkBalances(signer2, provider);
    // const price = await sqrtPriceX96ToPrice(state.sqrtPriceX96);;

    // const tokenContract0 = new ethers.Contract(LONG_TOKEN_ADDRESS, ERC20ABI, provider);
    // await tokenContract0.connect(signer2).approve(VAULT_ADDRESS, balances.LongBalance);
    // const tokenContract2 = new ethers.Contract(SHORT_TOKEN_ADDRESS, ERC20ABI, provider);
    // await tokenContract2.connect(signer2).approve(VAULT_ADDRESS, balances.ShortBalance);

    // if (balances.token0Balance > balances.token1Balance) {
    //     const diffBal = balances.token0Balance - balances.token1Balance;
    //     const estimate = diffBal / (1 + (1 - immutables.fee / BASE_FEE) * price);

    //     const amountIn = ethers.utils.parseUnits(String(estimate),18);

    //     const ScalarMarketVaultContract = new Contract(VAULT_ADDRESS, ScalarVaultABI, provider);
    //     await ScalarMarketVaultContract.connect(signer2).fullSwapRedeem(amountIn, 0)

    // }if (balances.token1Balance > balances.token0Balance) {
    //     const diffBal = balances.token1Balance - balances.token0Balance;
    //     const estimate = diffBal / (1 + (1 - immutables.fee / BASE_FEE) / price);

    //     const amountIn = ethers.utils.parseUnits(String(estimate),18);

    //     const ScalarMarketVaultContract = new Contract(VAULT_ADDRESS, ScalarVaultABI, provider);
    //     await ScalarMarketVaultContract.connect(signer2).fullSwapRedeem(amountIn, 0)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
