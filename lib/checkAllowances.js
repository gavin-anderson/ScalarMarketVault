SWAP_ROUTER_ADDRESS = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
VAULT_ADDRESS= '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e'

const {Contract} = require("ethers"); 

async function checkVault(tokenAddress, tokenABI, signer, provider){
    const tokenContract = new Contract(tokenAddress,tokenABI,provider);
    const receipt  = await tokenContract.connect(signer).allowance(signer.address,VAULT_ADDRESS);
    return receipt;
}
async function checkSwapRouter(){
    const tokenContract = new Contract(tokenAddress,tokenABI,provider);
    const receipt = await tokenContract.connect(signer).allownace(signer.address,SWAP_ROUTER_ADDRESS);
    return receipt;
}

module.exports={
    checkVault,
    checkSwapRouter
}