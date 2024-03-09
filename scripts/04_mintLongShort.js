const { Contract, utils } = require("ethers")

VAULT_ADDRESS = '0x610178dA211FEF7D417bC0e6FeD39F05609AD788'
USDC_ADDRESS = '0x0165878A594ca255338adfa4d48449f69242Eb8F'


const artifacts = {
    ScalarVault: require("../artifacts/contracts/ScalarMarketVault.sol/ScalarMarketVault.json"),
    USDC: require("../artifacts/contracts/USDC.sol/USDC.json")
}


async function main() {

    const [owner, signer2] = await ethers.getSigners();
    const provider = waffle.provider;

    const inputAmount = utils.parseUnits("100", 6);
    const approveAmount = inputAmount.mul("10000")
    // Connect to USDC contract and approve
    const USDC = new Contract(USDC_ADDRESS, artifacts.USDC.abi, provider);
    await USDC.connect(signer2).approve(VAULT_ADDRESS, approveAmount);

    // Connect to Vault and Mint Long Short Tokens
    const ScalarMarketVaultContract = new Contract(VAULT_ADDRESS, artifacts.ScalarVault.abi, provider);
    // event Listener example hardhat node doesn't support or I'm dumb
    ScalarMarketVaultContract.on("MintLongShort", (recipient, amountIn, amountOut) => {
        let info = {
            recipient: recipient,
            amountIn: ethers.utils.formatUint(amountIn,6),
            amountOut: ethers.utils.parseUnits(amountOut,18)
        }
        console.log(`Event Caught! Recipient: ${info.recipient}, USDC: ${info.amountIn}, Long: ${info.amountOut}, Short: ${info.amountOut}`);
    });

    const tx = await ScalarMarketVaultContract.connect(signer2).mintLongShort(signer2.address, inputAmount);
    await tx.wait();
    console.log(`VAULT_ADDRESS: ${ScalarMarketVaultContract.address}`);




}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });