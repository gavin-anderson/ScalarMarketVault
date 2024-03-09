LONG_TOKEN_ADDRESS= '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853'
SHORT_TOKEN_ADDRESS= '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6'
USDC_ADDRESS = '0x0165878A594ca255338adfa4d48449f69242Eb8F'

const swapRouterAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'; 
VAULT_ADDRESS= '0x610178dA211FEF7D417bC0e6FeD39F05609AD788'

const {ethers, waffle} = require('hardhat');
const {Contract} = require("ethers"); 

const artifacts = {
    SwapRouter: require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json"),
    Vault : require("../artifacts/contracts/ScalarMarketVault.sol/ScalarMarketVault.json"),
    LongToken: require("../artifacts/contracts/LongToken.sol/LongToken.json"),
    ShortToken: require("../artifacts/contracts/ShortToken.sol/ShortToken.json"),
    USDCToken: require("../artifacts/contracts/USDC.sol/USDC.json")
};



async function main(){

    const [owner,signer2] = await ethers.getSigners();
    console.log(signer2.address)
    const provider = waffle.provider;
    const LongToken = new Contract(LONG_TOKEN_ADDRESS, artifacts.LongToken.abi, provider);
    const ShortToken = new Contract(SHORT_TOKEN_ADDRESS, artifacts.ShortToken.abi, provider);
    const USDCToken = new Contract(USDC_ADDRESS,artifacts.USDCToken.abi,provider);
    const allowedL = await LongToken.connect(signer2).allowance(signer2.address,swapRouterAddress);
    const allowedS = await ShortToken.connect(signer2).allowance(signer2.address,swapRouterAddress);
    const allowedUC = await USDCToken.connect(signer2).allowance(signer2.address,swapRouterAddress);

    const allowedVL = await LongToken.connect(signer2).allowance(signer2.address,VAULT_ADDRESS);
    const allowedVS = await ShortToken.connect(signer2).allowance(signer2.address,VAULT_ADDRESS);
    const allowedVUC = await USDCToken.connect(signer2).allowance(signer2.address,VAULT_ADDRESS);

    console.log("Swap Router: ");
    console.log(`Allowed Long:  ${allowedL}`);
    console.log(`Allowed Short:  ${allowedS}`);
    console.log(`Allowed USDC:  ${allowedUC}`);

    console.log("Vault: ");
    console.log(`Allowed Long:  ${allowedVL}`);
    console.log(`Allowed Short:  ${allowedVS}`);
    console.log(`Allowed USDC:  ${allowedVUC}`);

}



main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });