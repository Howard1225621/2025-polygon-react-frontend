import { useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import '../css/createvote.css';

const CONTRACT_ADDRESS = process.env.REACT_APP_IPFSCreateVote_Address; // 智慧合約地址
const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "_title", "type": "string" },
      { "internalType": "string", "name": "_candidateA", "type": "string" },
      { "internalType": "string", "name": "_candidateB", "type": "string" },
      { "internalType": "string", "name": "_descriptionAIPFS", "type": "string" },
      { "internalType": "string", "name": "_descriptionBIPFS", "type": "string" }
    ],
    "name": "createVote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const pinataApiKey = process.env.REACT_APP_PINATA_API_KEY;
const pinataSecret = process.env.REACT_APP_PINATA_SECRET_API_KEY;

export default function CreateVote() {
  console.log("Contract Address:", CONTRACT_ADDRESS);
    const [formData, setFormData] = useState({
      title: "",
      candidateA: "",
      candidateB: "",
      descriptionA: "",
      descriptionB: ""
    });
    const [walletAddress, setWalletAddress] = useState("");
    const [signer, setSigner] = useState(null);
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };
  
    const connectWallet = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.send("eth_requestAccounts", []);
          const _signer = await provider.getSigner();
          setWalletAddress(accounts[0]);
          setSigner(_signer);
        } catch (error) {
          console.error("Error connecting to MetaMask:", error);
        }
      } else {
        alert("Please install MetaMask.");
      }
    };
  
    const uploadToIPFS = async (data) => {
        const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
        
        const pinataData = {
          pinataMetadata: { name: "candidateDescription.json" },
          pinataContent: data,
        };
    
        try {
          const res = await axios.post(url, pinataData, {
            headers: {
              "Content-Type": "application/json",
              pinata_api_key: pinataApiKey,
              pinata_secret_api_key: pinataSecret,
            },
          });
    
          console.log("IPFS CID:", res.data.IpfsHash);
          return res.data.IpfsHash;
        } catch (error) {
          console.error("IPFS upload error:", error);
          return null;
        }
      };
    

    const createVote = async (e) => {
      e.preventDefault();

      console.log("Environment Variables:", process.env);
      console.log("Contract Address:", CONTRACT_ADDRESS);

      if (!signer) {
        alert("Please connect your wallet first!");
        return;
      }
  
      try {
        
        // 分別上傳候選人 A 和 B 的描述到 IPFS
        const ipfsHashA = await uploadToIPFS({ description: formData.descriptionA });
        const ipfsHashB = await uploadToIPFS({ description: formData.descriptionB });


        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        const tx = await contract.createVote(formData.title, formData.candidateA, formData.candidateB, ipfsHashA, ipfsHashB);
        console.log("Transaction sent:", tx.hash);
        await tx.wait();
        alert("Vote created successfully!");
      } catch (error) {
        console.error("Error creating vote:", error);
      }
    };
    
    return (
      <div className="vote-create-container">
        <h2 className="vote-create-title">Create a New Vote</h2>

        <button onClick={connectWallet} className="wallet-button">
          {walletAddress ? "Connected" : "Connect Wallet"}
        </button>

        <form onSubmit={createVote} className="vote-create-form">
          <div className="form-group">
            <label className="form-label">Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="form-input" required />
          </div>

          <div className="form-group">
            <label className="form-label">Candidate A</label>
            <input type="text" name="candidateA" value={formData.candidateA} onChange={handleChange} className="form-input" required />
          </div>

          <div className="form-group">
            <label className="form-label">Candidate A Description</label>
            <textarea name="descriptionA" value={formData.descriptionA} onChange={handleChange} className="form-textarea" required />
          </div>

          <div className="form-group">
            <label className="form-label">Candidate B</label>
            <input type="text" name="candidateB" value={formData.candidateB} onChange={handleChange} className="form-input" required />
          </div>

          <div className="form-group">
            <label className="form-label">Candidate B Description</label>
            <textarea name="descriptionB" value={formData.descriptionB} onChange={handleChange} className="form-textarea" required />
          </div>

          <button type="submit" className="submit-button">Create Vote</button>
        </form>
      </div>

    );
  }
