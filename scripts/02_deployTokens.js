async function main() {
  const [owner, signer2] = await ethers.getSigners();

  // Tether = await ethers.getContractFactory('Tether', owner);
  // tether = await Tether.deploy();

  // Usdc = await ethers.getContractFactory('UsdCoin', owner);
  // usdc = await Usdc.deploy();

  // WrappedBitcoin = await ethers.getContractFactory('WrappedBitcoin', owner);
  // wrappedBitcoin = await WrappedBitcoin.deploy();

  // Init the tokens
  USDC = await ethers.getContractFactory('USDC', owner);
  usdc = await USDC.deploy();

  LongToken = await ethers.getContractFactory('LongToken', owner);
  longtoken = await LongToken.deploy();

  ShortToken = await ethers.getContractFactory("ShortToken", owner);
  shorttoken = await ShortToken.deploy();

  // await tether.connect(owner).mint(
  //   signer2.address,
  //   ethers.utils.parseEther('100000')
  // )
  // await usdc.connect(owner).mint(
  //   signer2.address,
  //   ethers.utils.parseEther('100000')
  // )
  // await wrappedBitcoin.connect(owner).mint(
  //   signer2.address,
  //   ethers.utils.parseEther('100000')
  // )

  // Mint Tokens
  await usdc.connect(owner).mint(signer2.address, ethers.utils.parseEther('100000'));

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