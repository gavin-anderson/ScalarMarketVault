// hooks/useCreateMarket.js
import { useAccount, useWriteContract, useWaitForTransactionReceipt, } from 'wagmi';
import { Contract, utils } from 'ethers';
import FactoryArtifact from '../abi/ScalarMarketFactory.json';  // Adjust the path as necessary

const useCreateMarket = () => {
    const { address, isConnected, connector } = useAccount();
    const { data: hash, isPending, writeContract } = useWriteContract();

    const createMarket = async (_rangeStart, _rangeEnd) => {
        if (!isConnected || !connector) {
            console.error("Signer is not available");
            console.log(isConnected);
            console.log(connector);
            return;
        }
        const scalarFactoryAddress = process.env.NEXT_PUBLIC_SCALAR_FACTORY;
        writeContract({
            address: scalarFactoryAddress.toString(),
            FactoryArtifact,
            functionName: 'createMarket',
            args: [BigInt(_rangeStart), BigInt(_rangeEnd)],
        })
        const { isLoading: isConfirming, isSuccess: isConfirmed } =
            useWaitForTransactionReceipt({
                hash,
            })


    };

    return createMarket;
};

export default useCreateMarket;
