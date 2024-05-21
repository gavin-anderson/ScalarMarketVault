import { createConfig, http } from "wagmi";
import { getDefaultConfig } from "connectkit";
import { localhost } from "wagmi/chains";

export const providerconfig = createConfig(
    getDefaultConfig({
      // Your dApps chains
      chains: [localhost],
      transports: {
        // RPC URL for each chain
        [localhost.id]: http(
          'http://localhost:8545',
        ),
        // [sepolia.id]: http('https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}')
      },
  
      // Required API Keys
      walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  
      // Required App Info
      appName: "Your App Name",
  
      // Optional App Info
      appDescription: "Your App Description",
      appUrl: "https://family.co", // your app's url
      appIcon: "https://family.co/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
    }),
  );

