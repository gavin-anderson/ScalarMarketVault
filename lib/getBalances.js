LONG_TOKEN_ADDRESS = '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6'
SHORT_TOKEN_ADDRESS = '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318'
USDC_ADDRESS = '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853'

const { Contract } = require("ethers");
const { checkTokenHexOrder } = require("./checkTokens");

const artifacts = {
    USDC: require("../artifacts/contracts/USDC.sol/USDC.json"),
    LongToken: require("../artifacts/contracts/LongToken.sol/LongToken.json"),
    ShortToken: require("../artifacts/contracts/ShortToken.sol/ShortToken.json")
};

// const [owner, signer2] = await ethers.getSigners();
// const provider = waffle.provider;

async function checkBalances(signer, provider) {

    

    const longTokenContract = new Contract(LONG_TOKEN_ADDRESS, artifacts.LongToken.abi, provider);
    const shortTokenContract = new Contract(SHORT_TOKEN_ADDRESS, artifacts.ShortToken.abi, provider);
    const UsdcContract = new Contract(USDC_ADDRESS, artifacts.USDC.abi, provider);

    _LongBalance = await longTokenContract.balanceOf(signer.address);
    _ShortBalance = await shortTokenContract.balanceOf(signer.address);
    _UsdcBalance = await UsdcContract.balanceOf(signer.address);
    [_token0, _token1] = await checkTokenHexOrder(LONG_TOKEN_ADDRESS, SHORT_TOKEN_ADDRESS);

    return {
        LongBalance: _LongBalance,
        ShortBalance: _ShortBalance,
        UsdcBalance: _UsdcBalance,
        token0Balance: _token0 == LONG_TOKEN_ADDRESS ? _LongBalance : _ShortBalance,
        token1Balance: _token1 == SHORT_TOKEN_ADDRESS ? _ShortBalance: _LongBalance
    };
}


module.exports = {
    checkBalances
}