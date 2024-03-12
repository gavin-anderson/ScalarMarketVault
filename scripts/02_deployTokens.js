async function main() {
  const [owner, signer2] = await ethers.getSigners();

  // Init the tokens
  USDC = await ethers.getContractFactory('USDC', owner);
  usdc = await USDC.deploy();

  LongToken = await ethers.getContractFactory('LongToken', owner);
  longtoken = await LongToken.deploy();

  ShortToken = await ethers.getContractFactory("ShortToken", owner);
  shorttoken = await ShortToken.deploy();

  // Mint Tokens
  await usdc.connect(owner).mint(signer2.address, ethers.utils.parseUnits('100',6));

  console.log('LONG_TOKEN_ADDRESS=', `'${longtoken.address}'`)
  console.log('SHORT_TOKEN_ADDRESS=', `'${shorttoken.address}'`)
  console.log('USDC_ADDRESS=', `'${usdc.address}'`)

}

/*
npx hardhat run --network localhost scripts/02_deployTokens.js
*/


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });