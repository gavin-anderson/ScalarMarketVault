// Token Addresses
LONG_TOKEN_ADDRESS= '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0'
SHORT_TOKEN_ADDRESS= '0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82'
USDC_ADDRESS= '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e'

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