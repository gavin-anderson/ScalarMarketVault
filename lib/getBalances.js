const { Contract } = require("ethers");
const { checkTokenHexOrder } = require("./checkTokens");

const artifacts = {
    USDC: require("../artifacts/contracts/USDC.sol/USDC.json"),
    LongToken: require("../artifacts/contracts/LongToken.sol/LongToken.json"),
    ShortToken: require("../artifacts/contracts/ShortToken.sol/ShortToken.json")
};

async function checkBalances(signer, provider, LONG_TOKEN_ADDRESS,SHORT_TOKEN_ADDRESS) {

    const longTokenContract = new Contract(LONG_TOKEN_ADDRESS, artifacts.LongToken.abi, provider);
    const shortTokenContract = new Contract(SHORT_TOKEN_ADDRESS, artifacts.ShortToken.abi, provider);
   
    _LongBalance = await longTokenContract.balanceOf(signer.address);
    _ShortBalance = await shortTokenContract.balanceOf(signer.address);
    [_token0, _token1] = await checkTokenHexOrder(LONG_TOKEN_ADDRESS, SHORT_TOKEN_ADDRESS);

    return {
        LongBalance: _LongBalance,
        ShortBalance: _ShortBalance,
        token0Balance: _token0 == LONG_TOKEN_ADDRESS ? _LongBalance : _ShortBalance,
        token1Balance: _token1 == SHORT_TOKEN_ADDRESS ? _ShortBalance : _LongBalance
    };
}


module.exports = {
    checkBalances
}