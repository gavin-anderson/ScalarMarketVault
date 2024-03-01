// src/components/ConnectWalletButton.js
import React from 'react';
import { ethers } from 'ethers';
import './ConnectWalletButton.css';

const ConnectWalletButton = ({ setUserAccount, setSigner }) => {
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const account = await signer.getAddress();
        setUserAccount(account);
        setSigner(signer); // Update the signer in App's state
      } catch (error) {
        console.error("An error occurred during the connection process.", error);
      }
    } else {
      alert("No Ethereum wallet detected. Please install MetaMask or another Ethereum wallet.");
    }
  };

  return (
    <button onClick={connectWallet} className="connect-wallet">
      Connect Wallet
    </button>
  );
};

export default ConnectWalletButton;