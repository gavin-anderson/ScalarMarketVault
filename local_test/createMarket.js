const { Contract, ContractFactory, utils } = require("ethers");


const artifacts = {
    ScalarVault: require("../artifacts/contracts/ScalarMarketVault.sol/ScalarMarketVault.json"),
    LongToken: require("../artifacts/contracts/LongToken.sol/LongToken.json"),
    ShortToken: require("../artifacts/contracts/ShortToken.sol/ShortToken.json"),
    USDC: require('../artifacts/contracts/USDC.sol/USDC.json'),
    Factory: require("../artifacts/contracts/ScalarMarketFactory.sol/ScalarMarketFactory.json")
};
const ADD = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";

async function main(){
    const [owner, signer2, signer3, signer4] = await ethers.getSigners();
const provider = waffle.provider;

const scalarfactory= new Contract(ADD,artifacts.Factory.abi, provider);

const rangeStart = utils.parseUnits("2", 18);
const rangeEnd = utils.parseUnits("6", 18);

const tx = await scalarfactory.connect(signer3).createNewMarket(rangeStart, rangeEnd, 1134566);
const receipt = await tx.wait();
for (const event of receipt.events) {
    if (event.event === 'MarketCreated') {
        console.log(`MarketCreated: ${event.args}`);

    }
}
console.log("Created Clones")
console.log("-------------------------------------");
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });