import { useAccount } from 'wagmi';
import { Contract, utils } from 'ethers';
import FactoryArtifact from '../abi/ScalarMarketFactory.json';

export async function useCreateMarket() {
    const { data: accountData, isConnected  } = useAccount();
    console.log("Wallet Connected:", isConnected);
    console.log(accountData);
    // Function to call when creating a market
    const createMarket = async (_rangeStart, _rangeEnd) => {
        if (!accountData?.signer) {
            console.error("Signer is not available");
            return;
        }

        const scalarFactoryAddress = process.env.REACT_APP_SCALAR_FACTORY;
        if (!scalarFactoryAddress) {
            console.error("Scalar factory address is not set in environment");
            return;
        }

        const scalarFactory = new Contract(
            scalarFactoryAddress,
            FactoryArtifact.abi,
            accountData.signer
        );

        try {
            const rangeStart = utils.parseEther(_rangeStart.toString());
            const rangeEnd = utils.parseEther(_rangeEnd.toString());

            const tx = await scalarFactory.createNewMarket(rangeStart, rangeEnd);
            const receipt = await tx.wait();

            return receipt.events.filter(event => event.event === 'MarketCreated').map(event => event.args);
        } catch (error) {
            console.error('Failed to create market:', error);
            throw error; // Rethrow to allow error handling in the component
        }
    };

    return createMarket;
}
