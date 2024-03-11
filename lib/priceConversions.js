async function sqrtPriceX96ToPrice(sqrtPriceX96){
    const price = sqrtPriceX96**2/2**192;
    return price;
}

async  function priceTosqrtPriceX96(price){
    const sqrtPriceX96 = (price*2**96)**0.5;
    return sqrtPriceX96;
}

async function uniToScalar(uniPrice){
    const scalarPrice = uniPrice/(1+uniPrice);
    return scalarPrice;
}

async function scalarToUni(scalarPrice){
    const uniPrice = scalarPrice/(1-scalarPrice);
    return uniPrice;
}
module.exports={
    sqrtPriceX96ToPrice,
    priceTosqrtPriceX96,
    uniToScalar,
    scalarToUni
}