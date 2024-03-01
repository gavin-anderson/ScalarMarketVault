// MintForm.js
import React, {  useEffect,useState } from 'react';
import INONFUNGIBLE_POSITION_MANAGER from "@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json";
import './MintForm.css';
import {ethers} from 'ethers';
import Web3Modal from 'web3modal';
import erc20Abi from '../../abi/erc20.json';


const MintForm = () => {
    // State for form inputs
    const [tokenA, setTokenA] = useState('');
    const [tokenB, setTokenB] = useState('');
    const [amountA, setAmountA] = useState('');
    const [amountB, setAmountB] = useState('');
    const [fee, setFee] = useState('');
    const [lowerTick, setLowerTick] = useState('');
    const [upperTick, setUpperTick] = useState('');

    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    // Handle form submission
    const handleSubmit = async (event) => {
        console.log("Form Submitted");
        event.preventDefault();

        // Calculating a deadline 20 minutes into the future
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

        try {
            const positionManagerAddress = '0x1238536071E1c677A632429e3655c799b22cDA52';
            const positionManagerContract = new ethers.Contract(positionManagerAddress, INONFUNGIBLE_POSITION_MANAGER.abi, signer);
            const tokenAContract = new ethers.Contract(tokenA, erc20Abi, signer);
            const tokenBContract = new ethers.Contract(tokenB, erc20Abi, signer);

            await Promise.all([
                tokenAContract.approve(positionManagerAddress, amountA),
                tokenBContract.approve(positionManagerAddress, amountB)
              ]);

            const mintParams = {
                token0: tokenA,
                token1: tokenB,
                fee: parseInt(fee), // Convert string input to integer
                recipient: signer.address, // Use state variable or another way to set recipient
                tickLower: parseInt(lowerTick),
                tickUpper: parseInt(upperTick),
                amount0Desired: ethers.utils.parseUnits(amountA, 'ether').toString(),
                amount1Desired: ethers.utils.parseUnits(amountB, 'ether').toString(),
                amount0Min: ethers.utils.parseUnits(amountA, 'ether').mul(90).div(100).toString(), // 90% of desired as min
                amount1Min: ethers.utils.parseUnits(amountB, 'ether').mul(90).div(100).toString(), // 90% of desired as min
                deadline: deadline,
            };

            const tx = await positionManagerContract.mint(mintParams, {
                value: ethers.utils.parseEther("0"),
                gasLimit: ethers.utils.hexlify(100000000)
            });

            console.log('Transaction submitted:', tx.hash);
            await tx.wait();
            console.log('Liquidity minted!');
        } catch (error) {
            console.error('Error minting liquidity:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Token A Address:</label>
                <input
                    type="text"
                    value={tokenA}
                    onChange={(e) => setTokenA(e.target.value)}
                />
            </div>
            <div>
                <label>Token B Address:</label>
                <input
                    type="text"
                    value={tokenB}
                    onChange={(e) => setTokenB(e.target.value)}
                />
            </div>
            <div>
                <label>Amount A:</label>
                <input
                    type="text"
                    value={amountA}
                    onChange={(e) => setAmountA(e.target.value)}
                />
            </div>
            <div>
                <label>Amount B:</label>
                <input
                    type="text"
                    value={amountB}
                    onChange={(e) => setAmountB(e.target.value)}
                />
            </div>
            <div>
                <label>Fee:</label>
                <input
                    type="text"
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                />
            </div>
            <div>
                <label>Lower Tick:</label>
                <input
                    type="text"
                    value={lowerTick}
                    onChange={(e) => setLowerTick(e.target.value)}
                />
            </div>
            <div>
                <label>Upper Tick:</label>
                <input
                    type="text"
                    value={upperTick}
                    onChange={(e) => setUpperTick(e.target.value)}
                />
            </div>
            <button type="submit">Mint Liquidity</button>
        </form>
    );
};

export default MintForm;
