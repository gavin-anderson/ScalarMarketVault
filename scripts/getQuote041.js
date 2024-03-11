// for quick tests quotes are in  lib swaps.js
QUOTERV2_ADDRESS = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'
LONG_SHORT_500= '0xfF87C979374657A843e2640EDC7B121103E9db94'
LONG_TOKEN_ADDRESS= '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6'
SHORT_TOKEN_ADDRESS= '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318'

QuoterV2 = require("@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json");
const IUniswapV3Pool = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json');
const { ethers } = require("hardhat");
const { checkTokenHexOrder } = require("../lib/checkTokens");
const { getPoolImmutables, getPoolState } = require('../lib/helpers');



async function main() {
    const [owner, signer2] = await ethers.getSigners();
    const provider = waffle.provider;

    [_token0, _token1] = await checkTokenHexOrder(LONG_TOKEN_ADDRESS, SHORT_TOKEN_ADDRESS);

    const poolContract = new ethers.Contract(LONG_SHORT_500, IUniswapV3Pool.abi, provider);
    const { sqrtPriceX96 } = await poolContract.slot0();
    const QuoterContract = new ethers.Contract(QUOTERV2_ADDRESS, QuoterV2.abi, provider);

    const inputAmount = ethers.utils.parseEther("1")
    const immutables = await getPoolImmutables(poolContract);

    const params = {
        tokenIn: immutables.token0,
        tokenOut: immutables.token1,
        fee: 500,
        recipient: signer2.address,
        deadline: Math.floor(Date.now() / 1000) + (60 * 10),
        amountIn: inputAmount,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0,
    };

    const recipient = await QuoterContract.connect(signer2).callStatic.quoteExactInputSingle(
        params, {
            gasLimit: ethers.utils.hexlify(1000000)
        }

    );

    let token00;
    let token11;
    if (_token0 == LONG_TOKEN_ADDRESS){
        token00 = LONG_TOKEN_ADDRESS;
        token11 = SHORT_TOKEN_ADDRESS;
    }else{
        token00 = SHORT_TOKEN_ADDRESS;
        token11 = LONG_TOKEN_ADDRESS;
    }
    const priceBefore = sqrtPriceX96**2/2**192;
    const priceAfter = recipient.sqrtPriceX96After**2/2**192;

    console.log(recipient);
    console.log(`Amount In: ${inputAmount/10**18}  of ${token00} `);
    console.log(`Amount Out: ${recipient.amountOut/10**18}  of ${token11} `);
    console.log(`Price Before: ${priceBefore}`);
    console.log(`Price After: ${priceAfter}`);
    console.log(`ScalarPrice Before: ${priceBefore/(priceBefore+1)}`);
    console.log(`ScalarPrice After: ${priceAfter/(priceAfter+1)}`);

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
