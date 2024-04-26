const { ethers } = require("ethers");

const artifacts = {
    NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
};

async function removeLiquidity(tokenId, liquidity, deadline, signer,provider,owner, POSITION_MANAGER_ADDRESS) {
    // Create a new instance of the Contract with the 'new' keyword
    const positionManagerContract = new ethers.Contract(
        POSITION_MANAGER_ADDRESS,
        artifacts.NonfungiblePositionManager.abi,
        owner  // This should be a Signer, not a Provider
    );
    console.log("HERE")
    try {
        // Create the transaction to decrease liquidity
        const tx = await positionManagerContract.decreaseLiquidity({
            tokenId: tokenId,
            liquidity: liquidity,
            amount0Min: 0,  // Minimum amount of token0 to receive (set to 0 if unsure)
            amount1Min: 0,  // Minimum amount of token1 to receive (set to 0 if unsure)
            deadline: deadline
        });

        // Wait for the transaction to be mined
        const receipt = await tx.wait();
        console.log('Liquidity removed successfully', receipt);
    } catch (error) {
        console.error('Failed to remove liquidity:', error);
    }
}

module.exports = {
    removeLiquidity
};
