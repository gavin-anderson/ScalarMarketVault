import React, { useState } from 'react';
import './App.css';
import MintForm from './components/MintForm/MintForm.js';
import ConnectWalletButton from './components/ConnectButton/ConnectWalletButton.js';


function App() {
  const [userAccount, setUserAccount] = useState(null);
  const [signer, setSigner] = useState(null); // Add state to hold the signer

  return (
    <div className="App">
      <header className="App-header">
        <div className="wallet-and-form-container">
          {!userAccount && (
            <ConnectWalletButton
              setUserAccount={setUserAccount}
              setSigner={setSigner} // Pass setSigner as a prop
            />
          )}
          {userAccount && <p>Connected account: {userAccount}</p>}
        </div>
        {userAccount && ( // Ensure MintForm is only rendered when userAccount is set
          <div className='mint-form-container'>
            <MintForm signer={signer} /> {/* Pass signer to MintForm */}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
