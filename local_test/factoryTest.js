const { Contract, ContractFactory, utils } = require("ethers");

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
    Factory: require("../artifacts/contracts/ScalarMarketFactory.sol/ScalarMarketFactory.json")
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
    addresses["SCALAR_FACTORY"] = scalarfactory.address;
    console.log("Factory Deployed")
    console.log("-------------------------------------");

    // Deploy ScalarMarketVault
    ScalarMarketVault = new ContractFactory(artifacts.ScalarVault.abi, artifacts.ScalarVault.bytecode, owner);
    const scalarmarketvaultTemplate = await ScalarMarketVault.deploy(addresses.SCALAR_FACTORY);
    addresses["SCALAR_VAULT"] = scalarmarketvaultTemplate.address;
    console.log("Vault Deployed")
    console.log("-------------------------------------");

    // Deploy Tokens
    longToken = new ContractFactory(artifacts.LongToken.abi, artifacts.LongToken.bytecode, owner);
    shortToken = new ContractFactory(artifacts.ShortToken.abi, artifacts.ShortToken.bytecode, owner);
    const longTokenTemplate = await longToken.deploy(scalarfactory.address);
    const shortTokenTemplate = await shortToken.deploy(scalarfactory.address);

    addresses["LONG_TOKEN_ADDRESS"] = longTokenTemplate.address;
    addresses["SHORT_TOKEN_ADDRESS"] = shortTokenTemplate.address;

    console.log("Long Short templates Deployed");
    console.log("-------------------------------------");

    // Set templates
    await scalarfactory.connect(owner).setTemplates(addresses.SCALAR_VAULT, addresses.LONG_TOKEN_ADDRESS, addresses.SHORT_TOKEN_ADDRESS);
    console.log("Factory setTemplates");
    console.log("-------------------------------------");

    // Create clones by creating a market
    const arr = ['VAULTCLONE', 'LONGCLONE', 'SHORTCLONE'];

    const rangeStart = utils.parseUnits("2", 18);
    const rangeEnd = utils.parseUnits("6", 18);

    const tx = await scalarfactory.connect(signer2).createNewMarket(rangeStart, rangeEnd);
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

    // Check States
    // clonedLong = new Contract(addresses.LONGCLONE, artifacts.LongToken.abi, provider);
    // clonedShort = new Contract(addresses.SHORTCLONE, artifacts.ShortToken.abi, provider);

    // checkFactLong = await clonedLong.factory();
    // checkVaultLong = await clonedLong.vault();

    // checkFactShort = await clonedShort.factory();
    // checkVaultShort = await clonedShort.vault();

    // console.log(`Long Factory: ${checkFactLong}`);
    // console.log(`Long Vault: ${checkVaultLong}`);
    // console.log(`Short Factory: ${checkFactShort}`);
    // console.log(`Short Vault: ${checkVaultShort}`);

    // clonedVault = new Contract(addresses.VAULTCLONE, artifacts.ScalarVault.abi, provider);
    // checkLong = await clonedVault.longToken();
    // checkShort = await clonedVault.shortToken();

    // console.log(`Vault stored Long Address: ${checkLong}`);
    // console.log(`Vault stored Short Address: ${checkShort}`);
    // console.log(`Checks to make sure addresses are saved properly`);
    // console.log("-------------------------------------");

    // Mint LongShort
    const clonedLong = new Contract(addresses.LONGCLONE, artifacts.LongToken.abi, provider);
    const clonedShort = new Contract(addresses.SHORTCLONE, artifacts.ShortToken.abi, provider);
    const clonedVault = new Contract(addresses.VAULTCLONE, artifacts.ScalarVault.abi, provider);
    const ethAmount = utils.parseEther("1");

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
    const clone1PoolAddress = await deployPools(500, signer2, provider, clonedLong.address, clonedShort.address, clonedVault.address, addresses.POSITION_MANAGER_ADDRESS, addresses.FACTORY_ADDRESS);
    addresses['CLONED_1_POOL_ADDRESS'] = clone1PoolAddress;
    liquidity = await checkLiquidity(provider, addresses.CLONED_1_POOL_ADDRESS);
    console.log(`Liquidity: ${liquidity.liquidity}`); //Should be Zero
    console.log("-------------------------------------");
    // provide Liquidity
    await addLiquidity("1000000", signer2, provider, clonedLong.address, clonedShort.address, addresses.POSITION_MANAGER_ADDRESS, addresses.CLONED_1_POOL_ADDRESS);
    liquidity = await checkLiquidity(provider, addresses.CLONED_1_POOL_ADDRESS);
    console.log(`Liquidity: ${liquidity.liquidity}`);
    console.log("-------------------------------------");
    // signer3 comes to mint
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

    // signer3 swaps
    await swap041("200", signer3, provider, addresses.CLONED_1_POOL_ADDRESS, addresses.SWAP_ROUTER_ADDRESS, clonedLong.address, clonedShort.address);
    clonedLongBalance = await clonedLong.balanceOf(signer3.address);
    clonedShortBalance = await clonedShort.balanceOf(signer3.address);
    console.log(`Cloned Long Balance: ${clonedLongBalance}`);
    console.log(`Cloned Short Balance: ${clonedShortBalance}`);
    console.log("Swap Completed signer3");
    console.log("-------------------------------------");
    // signer 4 mints

    await clonedVault.connect(signer4).mintLongShort(signer4.address, {
        value: ethAmount
    });
    ethBalanceContract = await provider.getBalance(addresses.VAULTCLONE);
    ethBalanceSigner = await provider.getBalance(signer4.address);
    clonedLongBalance = await clonedLong.balanceOf(signer4.address);
    clonedShortBalance = await clonedShort.balanceOf(signer4.address);

    console.log(`Contract Eth Balance: ${ethBalanceContract}`);
    console.log(`Signer Eth Balance: ${ethBalanceSigner}`);
    console.log(`Cloned Long Balance: ${clonedLongBalance}`);
    console.log(`Cloned Short Balance: ${clonedShortBalance}`);
    console.log("Mint Completed Signer 4");
    console.log("-------------------------------------");
    // signer4 swaps same direction
    await swap041("200", signer4, provider, addresses.CLONED_1_POOL_ADDRESS, addresses.SWAP_ROUTER_ADDRESS, clonedLong.address, clonedShort.address);
    clonedLongBalance = await clonedLong.balanceOf(signer4.address);
    clonedShortBalance = await clonedShort.balanceOf(signer4.address);
    console.log(`Cloned Long Balance: ${clonedLongBalance}`);
    console.log(`Cloned Short Balance: ${clonedShortBalance}`);
    console.log("Swap Completed signer 4");
    console.log("-------------------------------------");
    // signer 3 swaps out and redeems
    await swap140("200", signer3, provider, addresses.CLONED_1_POOL_ADDRESS, addresses.SWAP_ROUTER_ADDRESS, clonedLong.address, clonedShort.address);
    clonedLongBalance = await clonedLong.balanceOf(signer3.address);
    clonedShortBalance = await clonedShort.balanceOf(signer3.address);
    console.log(`Cloned Long Balance: ${clonedLongBalance}`);
    console.log(`Cloned Short Balance: ${clonedShortBalance}`);
    console.log("Swap Completed signer 3");
    console.log("-------------------------------------");

    // Signer3 Redeem
    inputAmount = String(Math.min(clonedLongBalance, clonedShortBalance));
    console.log(inputAmount);
    await clonedLong.connect(signer3).approve(clonedVault.address, inputAmount);
    await clonedShort.connect(signer3).approve(clonedVault.address, inputAmount);
    console.log(`Approved`);
    await clonedVault.connect(signer3).redeem(inputAmount);
    ethBalanceSigner = await provider.getBalance(signer3.address);
    clonedLongBalance = await clonedLong.balanceOf(signer3.address);
    clonedShortBalance = await clonedShort.balanceOf(signer3.address);
    console.log(`Cloned Long Balance: ${clonedLongBalance}`);
    console.log(`Cloned Short Balance: ${clonedShortBalance}`);
    console.log(`Signer 3 ETH Balance: ${ethBalanceSigner}`);
    console.log("Signer 3 Redeemed");
    console.log("-------------------------------------");

    // signer2 submits answer
    const finalAnswer1 = utils.parseUnits("5", 18);
    await clonedVault.connect(signer2).setFinalValue(finalAnswer1);
    console.log("Final Answer Submitted");
    console.log("-------------------------------------");

    // signer 4 redeeems using final redeem.
    signerBalanceLong = await clonedLong.balanceOf(signer4.address);
    signerBalanceShort = await clonedShort.balanceOf(signer4.address);

    await clonedLong.connect(signer4).approve(clonedVault.address, signerBalanceLong);
    await clonedShort.connect(signer4).approve(clonedVault.address, signerBalanceShort);

    await clonedVault.connect(signer4).finalRedeem(signerBalanceLong, signerBalanceShort);

    ethBalanceSigner = await provider.getBalance(signer4.address);
    clonedLongBalance = await clonedLong.balanceOf(signer4.address);
    clonedShortBalance = await clonedShort.balanceOf(signer4.address);
    console.log(`Cloned Long Balance: ${clonedLongBalance}`);
    console.log(`Cloned Short Balance: ${clonedShortBalance}`);
    console.log(`Signer 4 ETH Balance: ${ethBalanceSigner}`);
    console.log("Signer 4 Final Redeemed");
    console.log("-------------------------------------");

    // signer 3 redeems left overusing final Redeem
    signerBalanceLong = await clonedLong.balanceOf(signer3.address);
    signerBalanceShort = await clonedShort.balanceOf(signer3.address);

    await clonedLong.connect(signer3).approve(clonedVault.address, signerBalanceLong);
    await clonedShort.connect(signer3).approve(clonedVault.address, signerBalanceShort);

    await clonedVault.connect(signer3).finalRedeem(signerBalanceLong, signerBalanceShort);

    ethBalanceSigner = await provider.getBalance(signer3.address);
    clonedLongBalance = await clonedLong.balanceOf(signer3.address);
    clonedShortBalance = await clonedShort.balanceOf(signer3.address);
    console.log(`Cloned Long Balance: ${clonedLongBalance}`);
    console.log(`Cloned Short Balance: ${clonedShortBalance}`);
    console.log(`Signer 3 ETH Balance: ${ethBalanceSigner}`);
    console.log("Signer 3 Final Redeemed");
    console.log("-------------------------------------");

    // signer2 stops providing liquidity and final redeems
    const tokenId = 1;  
    const liquidityAmount = "1000000"
    const deadline = Math.floor(Date.now() / 1000) + 3600; 
    await removeLiquidity(tokenId, liquidityAmount,deadline, signer2,provider,owner,addresses.POSITION_MANAGER_ADDRESS);
    liquidity = await checkLiquidity(provider, addresses.CLONED_1_POOL_ADDRESS);
    ethBalanceSigner = await provider.getBalance(signer2.address);
    clonedLongBalance = await clonedLong.balanceOf(signer2.address);
    clonedShortBalance = await clonedShort.balanceOf(signer2.address);

    // console.log(`Cloned Long Balance: ${clonedLongBalance}`);
    // console.log(`Cloned Short Balance: ${clonedShortBalance}`);
    // console.log(`Signer 2 ETH Balance: ${ethBalanceSigner}`);
    // console.log("Signer 2 Removed Liquidity");
    // console.log("-------------------------------------");
    //  copy with two clones





}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });