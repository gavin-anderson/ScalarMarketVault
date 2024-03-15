const { Contract, utils } = require("ethers");

const ERC20ABI = require('../ERC20.json'); 
ScalarVault = require("../artifacts/contracts/ScalarMarketVault.sol/ScalarMarketVault.json");

async function finalRedeem(inputL,inputS,signer,provider,addresses) {

    const inputLAmount = utils.parseEther(inputL);
    const approveLAmount = inputLAmount.mul(100000);

    const inputSAmount = utils.parseEther(inputS);
    const approveSAmount = inputSAmount.mul(100000);

    // Init contract
    const LongTokenContract = new Contract(addresses.LONG_TOKEN_ADDRESS,ERC20ABI,provider);
    const ShortTokenContract = new Contract(addresses.SHORT_TOKEN_ADDRESS,ERC20ABI,provider);

    // Approve Spend
    await LongTokenContract.connect(signer).approve(addresses.VAULT_ADDRESS,approveLAmount);
    await ShortTokenContract.connect(signer).approve(addresses.VAULT_ADDRESS,approveSAmount);


    // Connect to Vault and Mint Long Short Tokens
    const ScalarMarketVaultContract = new Contract(addresses.VAULT_ADDRESS, ScalarVault.abi, provider);
    await ScalarMarketVaultContract.connect(signer).finalRedeem(inputLAmount,inputSAmount,{ gasLimit: 5000000 });

}
module.exports={
    finalRedeem
}