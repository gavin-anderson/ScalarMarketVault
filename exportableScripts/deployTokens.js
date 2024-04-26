async function deployTokens(owner) {

    // Init the tokens
    USDC = await ethers.getContractFactory('USDC', owner);
    usdc = await USDC.deploy();

    LongToken = await ethers.getContractFactory('LongToken', owner);
    longtoken = await LongToken.deploy();

    ShortToken = await ethers.getContractFactory("ShortToken", owner);
    shorttoken = await ShortToken.deploy();

    // Mint Tokens
    console.log('LONG_TOKEN_ADDRESS=', `'${longtoken.address}'`)
    console.log('SHORT_TOKEN_ADDRESS=', `'${shorttoken.address}'`)
    console.log('USDC_ADDRESS=', `'${usdc.address}'`)
    
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