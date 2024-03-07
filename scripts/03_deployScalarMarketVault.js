const { Contract, ContractFactory } = require("ethers");


LONG_TOKEN_ADDRESS= '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853'
SHORT_TOKEN_ADDRESS= '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6'
USDC_ADDRESS= '0x0165878A594ca255338adfa4d48449f69242Eb8F'

const artifacts = {
    ScalarVault : require("../artifacts/contracts/ScalarMarketVault.sol/ScalarMarketVault.json"),
    LongToken: require("../artifacts/contracts/LongToken.sol/LongToken.json"),
    ShortToken: require("../artifacts/contracts/ShortToken.sol/ShortToken.json")
    };

async function main() {
    const [owner, signer2] = await ethers.getSigners();
    const provider = waffle.provider;

    // Init ScalarMarketVault and Deploy
    ScalarMarketVault = new ContractFactory(artifacts.ScalarVault.abi,artifacts.ScalarVault.bytecode, owner);
    scalarmarketvault = await ScalarMarketVault.deploy(LONG_TOKEN_ADDRESS,SHORT_TOKEN_ADDRESS,USDC_ADDRESS,2,6);
    
    // Init the contract references
    LongToken = new Contract(LONG_TOKEN_ADDRESS,artifacts.LongToken.abi,provider);
    ShortToken = new Contract(SHORT_TOKEN_ADDRESS,artifacts.ShortToken.abi,provider);

    // Run Set Admin
    await LongToken.connect(owner).setAdmin(scalarmarketvault.address);
    await ShortToken.connect(owner).setAdmin(scalarmarketvault.address);


    console.log('VAULT_ADDRESS=', `'${scalarmarketvault.address}'`)


}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });