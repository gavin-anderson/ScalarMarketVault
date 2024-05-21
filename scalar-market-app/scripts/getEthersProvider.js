import { getClient } from '@wagmi/core';
import { FallbackProvider, JsonRpcProvider } from 'ethers';

// Function to convert a viem Client to an ethers.js Provider
function clientToProvider(client) {
  const { chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };

  if (transport.type === 'fallback') {
    const providers = transport.transports.map(
      ({ value }) => new JsonRpcProvider(value?.url, network)
    );
    if (providers.length === 1) return providers[0];
    return new FallbackProvider(providers);
  }
  return new JsonRpcProvider(transport.url, network);
}

// Function to get an ethers.js Provider using a viem Client configuration
function getEthersProvider(config, { chainId } = {}) {
  const client = getClient(config, { chainId });
  return clientToProvider(client);
}

export { clientToProvider, getEthersProvider };
