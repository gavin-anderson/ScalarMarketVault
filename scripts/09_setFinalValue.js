const { Contract, utils } = require("ethers")

VAULT_ADDRESS= '0x610178dA211FEF7D417bC0e6FeD39F05609AD788'
USDC_ADDRESS= '0x0165878A594ca255338adfa4d48449f69242Eb8F'
ScalarVault = require("../artifacts/contracts/ScalarMarketVault.sol/ScalarMarketVault.json");



async function main() {

    const [owner] = await ethers.getSigners();
    const provider = waffle.provider;

    // Connect to Vault and Mint Long Short Tokens
    const ScalarMarketVaultContract = new Contract(VAULT_ADDRESS, ScalarVault.abi, provider);
    await ScalarMarketVaultContract.connect(owner).setFinalValue(5);

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });