const { Contract, utils } = require("ethers")

VAULT_ADDRESS= '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e'
LONG_TOKEN_ADDRESS= '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6'
SHORT_TOKEN_ADDRESS= '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318'
USDC_ADDRESS= '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853'

ScalarVault = require("../artifacts/contracts/ScalarMarketVault.sol/ScalarMarketVault.json");
const ERC20ABI = require('../ERC20.json'); 



async function main() {

    const [owner,signer2] = await ethers.getSigners();
    const provider = waffle.provider;

    const inputAmount = utils.parseEther("1");
    const approveAmount = inputAmount.mul(100000);

    // Init contract
    const LongTokenContract = new Contract(LONG_TOKEN_ADDRESS,ERC20ABI,provider);
    const ShortTokenContract = new Contract(SHORT_TOKEN_ADDRESS,ERC20ABI,provider);

    // Approve Spend
    await LongTokenContract.connect(signer2).approve(VAULT_ADDRESS,approveAmount);
    await ShortTokenContract.connect(signer2).approve(VAULT_ADDRESS,approveAmount);


    // Connect to Vault and Mint Long Short Tokens
    const ScalarMarketVaultContract = new Contract(VAULT_ADDRESS, ScalarVault.abi, provider);
    await ScalarMarketVaultContract.connect(signer2).finalRedeem(inputAmount,inputAmount,{ gasLimit: 5000000 });

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });