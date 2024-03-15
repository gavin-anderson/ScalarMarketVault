async function deployTokens(owner, signer) {

    // Init the tokens
    USDC = await ethers.getContractFactory('USDC', owner);
    usdc = await USDC.deploy();

    LongToken = await ethers.getContractFactory('LongToken', owner);
    longtoken = await LongToken.deploy();

    ShortToken = await ethers.getContractFactory("ShortToken", owner);
    shorttoken = await ShortToken.deploy();

    // Mint Tokens
    await usdc.connect(owner).mint(signer.address, ethers.utils.parseUnits('100', 6));

    console.log('LONG_TOKEN_ADDRESS=', `'${longtoken.address}'`)
    console.log('SHORT_TOKEN_ADDRESS=', `'${shorttoken.address}'`)
    console.log('USDC_ADDRESS=', `'${usdc.address}'`)

    // let addresses=[
    //     `LONG_TOKEN_ADDRESS=${longtoken.address}`,
    //     `SHORT_TOKEN_ADDRESS=${shorttoken.address}`,
    //     `USDC_ADDRESS=${usdc.address}`
    // ]


    // const data = address.join('\n');
    // const writeFile = promisify(fs.writeFile);
    // const filePath = '../.env';
    // return writeFile(filePath, data).then(() => {
    //     console.log('Token addresses recorded.');
    // }).catch((error) => {
    //     console.error("Error logging addresses", error);
    //     throw error;
    // });
    const addresses = {
        LONG_TOKEN_ADDRESS: longtoken.address,
        SHORT_TOKEN_ADDRESS: shorttoken.address,
        USDC_ADDRESS: usdc.address
    }
    return (addresses);
}


module.exports = {
    deployTokens
}