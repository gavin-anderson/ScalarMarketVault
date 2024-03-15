const { Contract } = require("ethers");
const { checkTokenHexOrder } = require("./checkTokens");

const artifacts = {
    USDC: require("../artifacts/contracts/USDC.sol/USDC.json"),
    LongToken: require("../artifacts/contracts/LongToken.sol/LongToken.json"),
    ShortToken: require("../artifacts/contracts/ShortToken.sol/ShortToken.json")
};

async function checkBalances(signer, provider, addresses) {

    const longTokenContract = new Contract(addresses.LONG_TOKEN_ADDRESS, artifacts.LongToken.abi, provider);
    const shortTokenContract = new Contract(addresses.SHORT_TOKEN_ADDRESS, artifacts.ShortToken.abi, provider);
    const UsdcContract = new Contract(addresses.USDC_ADDRESS, artifacts.USDC.abi, provider);

    _LongBalance = await longTokenContract.balanceOf(signer.address);
    _ShortBalance = await shortTokenContract.balanceOf(signer.address);
    _UsdcBalance = await UsdcContract.balanceOf(signer.address);
    [_token0, _token1] = await checkTokenHexOrder(addresses.LONG_TOKEN_ADDRESS, addresses.SHORT_TOKEN_ADDRESS);

    return {
        LongBalance: _LongBalance,
        ShortBalance: _ShortBalance,
        UsdcBalance: _UsdcBalance,
        token0Balance: _token0 == addresses.LONG_TOKEN_ADDRESS ? _LongBalance : _ShortBalance,
        token1Balance: _token1 == addresses.SHORT_TOKEN_ADDRESS ? _ShortBalance : _LongBalance
    };
}


module.exports = {
    checkBalances
}