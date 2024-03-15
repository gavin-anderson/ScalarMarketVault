const { Contract, utils } = require("ethers");

// require("dotenv").config({path:'../.env'});
// const VAULT_ADDRESS = process.env.VAULT_ADDRESS;
// const USDC_ADDRESS = process.env.USDC_ADDRESS;

const artifacts = {
    ScalarVault: require("../artifacts/contracts/ScalarMarketVault.sol/ScalarMarketVault.json"),
    USDC: require("../artifacts/contracts/USDC.sol/USDC.json")
}

// input needs to be a string.
async function mintLongShort(input, signer, provider, addresses) {

    const inputAmount = utils.parseUnits(input, 6);
    const approveAmount = inputAmount.mul("10000")
    // Connect to USDC contract and approve
    const USDC = new Contract(addresses.USDC_ADDRESS, artifacts.USDC.abi, provider);
    await USDC.connect(signer).approve(addresses.VAULT_ADDRESS, approveAmount);

    // Connect to Vault and Mint Long Short Tokens
    const ScalarMarketVaultContract = new Contract(addresses.VAULT_ADDRESS, artifacts.ScalarVault.abi, provider);
    // event Listener example hardhat node doesn't support or I'm dumb
    ScalarMarketVaultContract.on("MintLongShort", (recipient, amountIn, amountOut) => {
        let info = {
            recipient: recipient,
            amountIn: ethers.utils.formatUint(amountIn, 6),
            amountOut: ethers.utils.parseUnits(amountOut, 18)
        }
        console.log(`Event Caught! Recipient: ${info.recipient}, USDC: ${info.amountIn}, Long: ${info.amountOut}, Short: ${info.amountOut}`);
    });

    const tx = await ScalarMarketVaultContract.connect(signer).mintLongShort(signer.address, inputAmount);
    await tx.wait();


}
module.exports = {
    mintLongShort
}