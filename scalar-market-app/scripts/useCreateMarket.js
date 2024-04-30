// hooks/useCreateMarket.js
import { useAccount } from 'wagmi';
import { Contract, utils } from 'ethers';
import FactoryArtifact from '../abi/ScalarMarketFactory.json';  // Adjust the path as necessary

const useCreateMarket = () => {
    const { data: accountData, isConnected } = useAccount();

    const createMarket = async (_rangeStart, _rangeEnd) => {
        if (!accountData?.signer) {
            console.error("Signer is not available");
            return;
        }
        const scalarFactoryAddress = process.env.NEXT_PUBLIC_SCALAR_FACTORY; // Make sure the variable is correctly set
        const scalarFactory = new Contract(scalarFactoryAddress, FactoryArtifact.abi, accountData.signer);

        try {
            const rangeStart = utils.parseEther(_rangeStart.toString());
            const rangeEnd = utils.parseEther(_rangeEnd.toString());
            const tx = await scalarFactory.createNewMarket(rangeStart, rangeEnd);
            const receipt = await tx.wait();
            return receipt.events.filter(event => event.event === 'MarketCreated').map(event => event.args);
        } catch (error) {
            console.error('Failed to create market:', error);
            throw error;
        }
    };

    return createMarket;
};

export default useCreateMarket;
