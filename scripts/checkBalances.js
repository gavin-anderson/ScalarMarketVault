// Token Addresses
LONG_TOKEN_ADDRESS= '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6'
SHORT_TOKEN_ADDRESS= '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318'
USDC_ADDRESS= '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853'

const { Contract } = require("ethers")

const artifacts = {
  USDC : require("../artifacts/contracts/USDC.sol/USDC.json"),
  LongToken: require("../artifacts/contracts/LongToken.sol/LongToken.json"),
  ShortToken: require("../artifacts/contracts/ShortToken.sol/ShortToken.json")
  };


async function main(){
    const [owner,signer2] = await ethers.getSigners();
    const provider = waffle.provider;

    const longTokenContract = new Contract(LONG_TOKEN_ADDRESS,artifacts.LongToken.abi,provider)
    const shortTokenContract = new Contract(SHORT_TOKEN_ADDRESS,artifacts.ShortToken.abi,provider)
    const UsdcContract = new Contract(USDC_ADDRESS,artifacts.USDC.abi,provider)

    LongBalance = await longTokenContract.balanceOf(signer2.address)
    ShortBalance = await shortTokenContract.balanceOf(signer2.address)
    UsdcBalance = await UsdcContract.balanceOf(signer2.address)

    console.log('LNG Value=', `'${LongBalance}'`)
    console.log('SSHHOORRTT Value=', `'${ShortBalance}'`)
    console.log('USDC Value=', `'${UsdcBalance}'`)
}

/*
npx hardhat run --network localhost scripts/checkBalances.js
*/

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });