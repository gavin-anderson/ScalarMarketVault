const { Contract, utils } = require("ethers");
ScalarVault = require("../artifacts/contracts/ScalarMarketVault.sol/ScalarMarketVault.json");

async function setFinalValue(fValue, owner, provider, addresses) {
    // Connect to Vault and Mint Long Short Tokens
    const ScalarMarketVaultContract = new Contract(addresses.VAULT_ADDRESS, ScalarVault.abi, provider);
    await ScalarMarketVaultContract.connect(owner).setFinalValue(fValue);

}
module.exports = {
    setFinalValue
}