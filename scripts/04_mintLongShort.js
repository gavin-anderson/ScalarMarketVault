const { Contract, utils } = require("ethers")

VAULT_ADDRESS= '0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44'
USDC_ADDRESS= '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e';


const artifacts = {
    ScalarVault: require("../artifacts/contracts/ScalarMarketVault.sol/ScalarMarketVault.json"),
    USDC :require("../artifacts/contracts/USDC.sol/USDC.json")
}


async function main() {

    const [owner, signer2] = await ethers.getSigners();
    const provider = waffle.provider;

    // Connect to USDC contract and approve
    const USDC = new Contract(USDC_ADDRESS,artifacts.USDC.abi,provider);
    await USDC.connect(signer2).approve(VAULT_ADDRESS, utils.parseUnits("100", 6));

    // Connect to Vault and Mint Long Short Tokens
    const ScalarMarketVaultContract = new Contract(VAULT_ADDRESS, artifacts.ScalarVault.abi, provider);
    await ScalarMarketVaultContract.connect(signer2).mintLongShort(signer2.address, "100");

    // console.log('LONG_TOKEN_ADDRESS=', `'${longtoken.address}'`)
    // console.log('SHORT_TOKEN_ADDRESS=', `'${shorttoken.address}'`)
    // console.log('USDC_ADDRESS=', `'${usdc.address}'`)

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });