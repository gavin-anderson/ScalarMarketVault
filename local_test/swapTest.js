const { Contract, ContractFactory, utils } = require("ethers");
const fs = require('fs');


const { deployUniContracts } = require('../exportableScripts/deployUniContracts');
const { deployPools } = require("../exportableScripts/deployPools");
const { checkLiquidity } = require("../lib/checkLiquidity");
const { addLiquidity } = require("../exportableScripts/addLiquidity");
const { swap041, swap140, quote041, quote140 } = require("../lib/swaps");
const { removeLiquidity } = require("../exportableScripts/removeLiquidity");

const artifacts = {
    ScalarVault: require("../artifacts/contracts/ScalarMarketVault.sol/ScalarMarketVault.json"),
    LongToken: require("../artifacts/contracts/LongToken.sol/LongToken.json"),
    ShortToken: require("../artifacts/contracts/ShortToken.sol/ShortToken.json"),
    USDC: require('../artifacts/contracts/USDC.sol/USDC.json'),
    Factory: require("../artifacts/contracts/ScalarMarketFactory.sol/ScalarMarketFactory.json"),
    IUniswapV3PoolABI: require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'),
    SwapRouterABI: require('@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json'),
    QuoterV2: require("@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json")
}

async function main() {

    // Deploy Uni Contracts
    const [owner, signer2, signer3, signer4] = await ethers.getSigners();
    const provider = waffle.provider;
    const uniAddresses = await deployUniContracts(owner);
    console.log(` `);
    console.log(`Deployed UNI Contracts`)
    console.log("-------------------------------------");

    // For testing create address bank
    addresses = uniAddresses;

    // Deploy Scalar Factory
    scalarFactory = new ContractFactory(artifacts.Factory.abi, artifacts.Factory.bytecode, owner);
    const scalarfactory = await scalarFactory.deploy();
    addresses["NEXT_PUBLIC_SCALAR_FACTORY"] = scalarfactory.address;
    console.log("Factory Deployed")
    console.log("-------------------------------------");

    // Deploy ScalarMarketVault
    ScalarMarketVault = new ContractFactory(artifacts.ScalarVault.abi, artifacts.ScalarVault.bytecode, owner);
    const scalarmarketvaultTemplate = await ScalarMarketVault.deploy(addresses.NEXT_PUBLIC_SCALAR_FACTORY, addresses.NEXT_PUBLIC_SWAP_ROUTER_ADDRESS);
    addresses["NEXT_PUBLIC_SCALAR_VAULT"] = scalarmarketvaultTemplate.address;
    console.log("Vault Deployed")
    console.log("-------------------------------------");

    // Deploy Tokens
    longToken = new ContractFactory(artifacts.LongToken.abi, artifacts.LongToken.bytecode, owner);
    shortToken = new ContractFactory(artifacts.ShortToken.abi, artifacts.ShortToken.bytecode, owner);
    const longTokenTemplate = await longToken.deploy(scalarfactory.address);
    const shortTokenTemplate = await shortToken.deploy(scalarfactory.address);

    addresses["NEXT_PUBLIC_LONG_TOKEN_ADDRESS"] = longTokenTemplate.address;
    addresses["NEXT_PUBLIC_SHORT_TOKEN_ADDRESS"] = shortTokenTemplate.address;

    console.log("Long Short templates Deployed");
    console.log("-------------------------------------");

    // Set templates
    await scalarfactory.connect(owner).setTemplates(addresses.NEXT_PUBLIC_SCALAR_VAULT, addresses.NEXT_PUBLIC_LONG_TOKEN_ADDRESS, addresses.NEXT_PUBLIC_SHORT_TOKEN_ADDRESS);
    console.log("Factory setTemplates");
    console.log("-------------------------------------");
    console.log(addresses);
    fs.writeFileSync('../contract-addresses.json', JSON.stringify(addresses, null, 2));
    console.log("Done");

    // Create clones by creating a market
    const arr = ['VAULTCLONE', 'LONGCLONE', 'SHORTCLONE'];

    const rangeStart = utils.parseUnits("2", 18);
    const rangeEnd = utils.parseUnits("6", 18);

    const tx = await scalarfactory.connect(signer2).createNewMarket(rangeStart, rangeEnd, 117676);
    const receipt = await tx.wait();
    for (const event of receipt.events) {
        if (event.event === 'MarketCreated') {
            console.log(`MarketCreated: ${event.args}`);

            for (let i = 0; i < event.args.length; i++) {
                addresses[arr[i]] = event.args[i]
            }
        }
    }
    console.log("Created Clones")
    console.log("-------------------------------------");

    // Check if clones exist
    console.log(addresses);
    const code = await provider.send("eth_getCode", [addresses.VAULTCLONE, "latest"]);
    const code1 = await provider.send("eth_getCode", [addresses.LONGCLONE, "latest"]);
    const code2 = await provider.send("eth_getCode", [addresses.SHORTCLONE, "latest"]);
    console.log(code);
    console.log(code1);
    console.log(code2);
    console.log("Check to see if clone exist")
    console.log("-------------------------------------");

    // Mint LongShort
    const clonedLong = new Contract(addresses.LONGCLONE, artifacts.LongToken.abi, provider);
    const clonedShort = new Contract(addresses.SHORTCLONE, artifacts.ShortToken.abi, provider);
    const clonedVault = new Contract(addresses.VAULTCLONE, artifacts.ScalarVault.abi, provider);
    const ethAmount = utils.parseEther("100");

    await clonedVault.connect(signer2).mintLongShort(signer2.address, {
        value: ethAmount
    });
    ethBalanceContract = await provider.getBalance(addresses.VAULTCLONE);
    ethBalanceSigner = await provider.getBalance(signer2.address);
    clonedLongBalance = await clonedLong.balanceOf(signer2.address);
    clonedShortBalance = await clonedShort.balanceOf(signer2.address);

    console.log(`Contract Eth Balance: ${ethBalanceContract}`);
    console.log(`Signer Eth Balance: ${ethBalanceSigner}`);
    console.log(`Cloned Long Balance: ${clonedLongBalance}`);
    console.log(`Cloned Short Balance: ${clonedShortBalance}`);
    console.log("Signer 2 Mint")
    console.log("-------------------------------------");

    // create pool
    console.log(addresses);
    const clone1PoolAddress = await deployPools(500, signer2, provider, clonedLong.address, clonedShort.address, clonedVault.address, addresses.NEXT_PUBLIC_POSITION_MANAGER_ADDRESS, addresses.NEXT_PUBLIC_FACTORY_ADDRESS);
    addresses['CLONED_1_POOL_ADDRESS'] = clone1PoolAddress;
    liquidity = await checkLiquidity(provider, addresses.CLONED_1_POOL_ADDRESS);
    console.log(`Liquidity: ${liquidity.liquidity}`); //Should be Zero
    console.log("-------------------------------------");
    clonedLongBalance = await clonedLong.balanceOf(signer2.address);
    clonedShortBalance = await clonedShort.balanceOf(signer2.address);
    console.log("Signer2 Balance");
    console.log(`Long Token: ${clonedLongBalance / 10 ** 18}`);
    console.log(`Short Token: Balance: ${clonedShortBalance / 10 ** 18}`)
    console.log("-------------------------------------");
    // provide Liquidity
    await addLiquidity("10000000", signer2, provider, clonedLong.address, clonedShort.address, addresses.NEXT_PUBLIC_POSITION_MANAGER_ADDRESS, addresses.CLONED_1_POOL_ADDRESS);
    liquidity = await checkLiquidity(provider, addresses.CLONED_1_POOL_ADDRESS);
    console.log(`Liquidity: ${liquidity.liquidity}`);
    console.log("-------------------------------------");
    clonedLongBalance = await clonedLong.balanceOf(signer2.address);
    clonedShortBalance = await clonedShort.balanceOf(signer2.address);
    console.log("-------------------------------------");
    console.log("Signer2 Balance");
    console.log(`Long Token: ${clonedLongBalance / 10 ** 18}`);
    console.log(`Short Token: Balance: ${clonedShortBalance / 10 ** 18}`);
    console.log("-------------------------------------");

    // Signer3 mint
    await clonedVault.connect(signer3).mintLongShort(signer3.address, {
        value: ethAmount
    });
    ethBalanceContract = await provider.getBalance(addresses.VAULTCLONE);
    ethBalanceSigner = await provider.getBalance(signer3.address);
    clonedLongBalance = await clonedLong.balanceOf(signer3.address);
    clonedShortBalance = await clonedShort.balanceOf(signer3.address);

    console.log(`Contract Eth Balance: ${ethBalanceContract}`);
    console.log(`Signer Eth Balance: ${ethBalanceSigner}`);
    console.log(`Cloned Long Balance: ${clonedLongBalance}`);
    console.log(`Cloned Short Balance: ${clonedShortBalance}`);
    console.log("Signer 3 mint");
    console.log("-------------------------------------");

    // Signer3 Swap Long for Shorts
    const swapRouterContract = new ethers.Contract(addresses.NEXT_PUBLIC_SWAP_ROUTER_ADDRESS, artifacts.SwapRouterABI.abi, provider);

    // Define the swap parameters
    const amountIn = ethers.utils.parseEther("100");

    // Approve the SwapRouter to spend token
    const tokenContract = new ethers.Contract(clonedLong.address, artifacts.LongToken.abi, provider);
    await tokenContract.connect(signer3).approve(addresses.NEXT_PUBLIC_SWAP_ROUTER_ADDRESS, amountIn);

    

    const params = {
        tokenIn: clonedLong.address,
        tokenOut: clonedShort.address,
        fee: 500,
        recipient: signer3.address,
        deadline: Math.floor(Date.now() / 1000) + (60 * 10)*100,
        amountIn: amountIn,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0,
    };
    console.log(`Params: ${params}`);
    console.log(`tokenIn: ${params.tokenIn}`);
    console.log(`tokenIn: ${typeof(params.tokenIn)}`);
    console.log(`tokenOut: ${params.tokenOut}`);
    console.log(`tokenOut: ${typeof(params.tokenOut)}`);
    console.log(`fee: ${params.fee}`);
    console.log(`fee: ${typeof(params.fee)}`);
    console.log(`recipient: ${params.recipient}`);
    console.log(`recipient: ${typeof(params.recipient)}`);
    console.log(`deadline: ${params.deadline}`);
    console.log(`deadline: ${typeof(params.deadline)}`);
    console.log(`amountIn: ${params.amountIn}`);
    console.log(`amountIn: ${typeof(params.amountIn)}`);
    console.log(`amountOut: ${params.amountOutMinimum}`);
    console.log(`amountOut: ${typeof(params.amountOutMinimum)}`);
    console.log(`sqrtPrice: ${params.sqrtPriceLimitX96}`);
    console.log(`sqrtPrice: ${typeof(params.sqrtPriceLimitX96)}`);


    // Execute the swap
    const transaction = await swapRouterContract.connect(signer3).exactInputSingle(params, {
        gasLimit: ethers.utils.hexlify(1000000)
    });


    clonedLongBalance = await clonedLong.balanceOf(signer3.address);
    clonedShortBalance = await clonedShort.balanceOf(signer3.address);

    console.log(`Cloned Long Balance: ${clonedLongBalance}`);
    console.log(`Cloned Short Balance: ${clonedShortBalance}`);
    console.log("Signer 3 Swap");
    console.log("-------------------------------------");


}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });