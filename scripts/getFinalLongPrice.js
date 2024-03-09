const { Contract, utils } = require("ethers")

VAULT_ADDRESS = '0x610178dA211FEF7D417bC0e6FeD39F05609AD788'
ScalarVault = require("../artifacts/contracts/ScalarMarketVault.sol/ScalarMarketVault.json")
async function main() {
    const [owner, signer2] = await ethers.getSigners();
    const provider = waffle.provider;
    const VaultContract = new Contract(VAULT_ADDRESS, ScalarVault.abi, provider);
    const longPrice = await VaultContract.connect(signer2).longPrice();
    const fValue = await VaultContract.connect(signer2).fValue();
    const base = await VaultContract.connect(signer2).BASE();
    const endRange = await VaultContract.connect(signer2).endRange();
    const startRange = await VaultContract.connect(signer2).startRange();

    console.log(`Contract returned LongPrice: ${longPrice}`);
    console.log(`Final Value: ${fValue}`);
    console.log(`BASE: ${base}`);
    console.log(`endRange: ${endRange}`);
    console.log(`startRange: ${startRange}`);
    console.log(`LongPrice: ${(fValue-startRange)*base/(endRange-startRange)}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });