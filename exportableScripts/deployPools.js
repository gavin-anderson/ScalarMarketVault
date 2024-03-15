const { checkTokenHexOrder } = require("../lib/checkTokens");

const { Contract, BigNumber } = require("ethers")
const bn = require('bignumber.js')
bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 });

const artifacts = {
    UniswapV3Factory: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json"),
    NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
    ScalarVault: require("../artifacts/contracts/ScalarMarketVault.sol/ScalarMarketVault.json")
};

function encodePriceSqrt(reserve1, reserve0) {
    return BigNumber.from(
        new bn(reserve1.toString())
            .div(reserve0.toString())
            .sqrt()
            .multipliedBy(new bn(2).pow(96))
            .integerValue(3)
            .toString()
    )
}

async function deployPools(fee, owner, provider, addresses) {
    // set up
    [_token0, _token1] = await checkTokenHexOrder(addresses.LONG_TOKEN_ADDRESS, addresses.SHORT_TOKEN_ADDRESS);
    const price = encodePriceSqrt(1, 1);
    // deployPool
    const nonfungiblePositionManager = new Contract(addresses.POSITION_MANAGER_ADDRESS, artifacts.NonfungiblePositionManager.abi, provider);
    const factory = new Contract(addresses.FACTORY_ADDRESS, artifacts.UniswapV3Factory.abi, provider);
    await nonfungiblePositionManager.connect(owner).createAndInitializePoolIfNecessary(_token0, _token1, fee, price, { gasLimit: 5000000 })
    const poolAddress = await factory.connect(owner).getPool(_token0, _token1, fee)

    // Vault Contract set pool address and fee
    const vaultContract = new Contract(addresses.VAULT_ADDRESS, artifacts.ScalarVault.abi, provider);
    await vaultContract.connect(owner).setPoolAddress(poolAddress, fee);
    console.log('Pool Address=', `'${poolAddress}'`)
    return (poolAddress);
}

module.exports = {
    deployPools
}