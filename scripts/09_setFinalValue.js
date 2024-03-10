const { Contract, utils } = require("ethers")

VAULT_ADDRESS= '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e'
USDC_ADDRESS= '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853'
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