const { Contract, utils } = require("ethers");

const artifacts = {
    USDC: require("../artifacts/contracts/USDC.sol/USDC.json")
}

async function mintUSDC(input,owner, signer, provider, addresses) {

    const inputAmount = utils.parseUnits(input, 6);
    // Connect to USDC contract and approve
    const USDC = new Contract(addresses.USDC_ADDRESS, artifacts.USDC.abi, provider);
    await USDC.connect(owner).mint(signer.address,inputAmount);

}
module.exports = {
    mintUSDC
}