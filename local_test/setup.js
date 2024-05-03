const { Contract, ContractFactory, utils } = require("ethers");
const fs = require('fs');

const { deployUniContracts } = require('../exportableScripts/deployUniContracts');

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
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });