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


    const creator = await clonedVault.creator();
    console.log(creator);
    await clonedVault.connect(signer2).setFinalValue(utils.parseEther("5"));
    const finalValue = await clonedVault.fValue();
    console.log(finalValue);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });