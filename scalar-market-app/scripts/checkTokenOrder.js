exports.checkTokenHexOrder = async (tokenHexA,tokenHexB) => {

    const tokenA = BigInt(tokenHexA);
    const tokenB = BigInt(tokenHexB);

    if(tokenA>tokenB){
        return[tokenHexB,tokenHexA];
    }else{
        return[tokenHexA,tokenHexB];
    }
  }
