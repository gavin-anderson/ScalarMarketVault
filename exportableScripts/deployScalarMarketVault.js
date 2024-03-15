const { Contract, ContractFactory } = require("ethers");
require("dotenv").config({ path: '../.env' });

const artifacts = {
    ScalarVault: require("../artifacts/contracts/ScalarMarketVault.sol/ScalarMarketVault.json"),
    LongToken: require("../artifacts/contracts/LongToken.sol/LongToken.json"),
    ShortToken: require("../artifacts/contracts/ShortToken.sol/ShortToken.json")
};

async function deployScalarMarketVault(startRange, endRange, owner, provider, addresses) {
    // Init ScalarMarketVault and Deploy
    ScalarMarketVault = new ContractFactory(artifacts.ScalarVault.abi, artifacts.ScalarVault.bytecode, owner);
    scalarmarketvault = await ScalarMarketVault.deploy(addresses.LONG_TOKEN_ADDRESS, addresses.SHORT_TOKEN_ADDRESS, addresses.USDC_ADDRESS, addresses.SWAP_ROUTER_ADDRESS, startRange, endRange);

    // Init the contract references
    LongToken = new Contract(addresses.LONG_TOKEN_ADDRESS, artifacts.LongToken.abi, provider);
    ShortToken = new Contract(addresses.SHORT_TOKEN_ADDRESS, artifacts.ShortToken.abi, provider);

    // Run Set Admin
    await LongToken.connect(owner).setAdmin(scalarmarketvault.address);
    await ShortToken.connect(owner).setAdmin(scalarmarketvault.address);


    console.log('VAULT_ADDRESS=', `'${scalarmarketvault.address}'`);

    // const data = `VAULT_ADDRESS=${scalarmarketvault.address}`;
    // const writeFile = promisify(fs.writeFile);
    // const filePath = '../.env';
    // return writeFile(filePath, data).then(() => {
    //     console.log('Vault address recorded.');
    // }).catch((error) => {
    //     console.error("Error logging addresses", error);
    //     throw error;
    // });


    return (scalarmarketvault.address)


}
module.exports = {
    deployScalarMarketVault
}