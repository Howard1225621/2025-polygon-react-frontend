import { useState } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0xYourContractAddress"; // 替換成你的智能合約地址
const CONTRACT_ABI = [
  // 這裡填入你的智能合約 ABI
  {
    "constant": false,
    "inputs": [],
    "name": "buyToken",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  }
];

export default function ConnectWallet() {
  const [walletAddress, setWalletAddress] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  
  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const _provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await _provider.send("eth_requestAccounts", []);
        const _signer = await _provider.getSigner();
        
        setWalletAddress(accounts[0]);
        setProvider(_provider);
        setSigner(_signer);
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
      }
    } else {
      alert("MetaMask is not installed. Please install it to use this feature.");
    }
  };

  const sendTransaction = async () => {
    if (!signer) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.buyToken({
        value: ethers.parseEther("0.01") // 這裡設定交易金額，例如 0.01 ETH
      });

      console.log("Transaction sent:", tx.hash);
      await tx.wait();
      alert("Transaction confirmed!");
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <button 
        onClick={connectWallet} 
        className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700"
      >
        {walletAddress ? "Connected" : "Connect Wallet"}
      </button>
      
      {walletAddress && (
        <>
          <p className="mt-4 text-lg font-semibold">Wallet: {walletAddress}</p>
          <button 
            onClick={sendTransaction} 
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700"
          >
            Buy Token (0.01 ETH)
          </button>
        </>
      )}
    </div>
  );
}
