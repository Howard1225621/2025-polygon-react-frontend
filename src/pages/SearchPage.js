// src/pages/HomePage.js
import React from 'react';
import { useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";

const CONTRACT_ADDRESS = process.env.REACT_APP_VoteReader_Address;
const CONTRACT_ABI = [
  {
    "constant": true,
    "inputs": [{ "name": "_id", "type": "uint256" }],
    "name": "getVoteInfo",
    "outputs": [
      { "name": "title", "type": "string" },
      { "name": "candidateA", "type": "string" },
      { "name": "candidateB", "type": "string" },
      { "name": "candidateA_CID", "type": "string" }, // 🆕 候選人 A 的描述 (IPFS CID)
      { "name": "candidateB_CID", "type": "string" }, // 🆕 候選人 B 的描述 (IPFS CID)
      { "name": "creator", "type": "address" },
      { "name": "timestamp", "type": "uint256" }
    ],
    "type": "function"
  }
];


export default function VoteSearch() {
  const [voteId, setVoteId] = useState("");
  const [voteData, setVoteData] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const fetchVote = async () => {
    if (!window.ethereum) {
      setError("請安裝 MetaMask 來使用此功能");
      return;
    }

    try {
      setError(null);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const result = await contract.getVoteInfo(voteId);
      setVoteData({
        title: result[0],
        candidateA: result[1],
        candidateB: result[2],
        creator: result[5],
        timestamp: new Date(Number(result[6]) * 1000).toLocaleString()
      });
    } catch (err) {
      setError("查詢失敗，請檢查投票 ID 是否正確");
      setVoteData(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">投票查詢</h1>
      <div className="bg-white p-6 rounded-xl shadow-md flex space-x-2">
        <input
          type="number"
          className="border p-2 rounded-md w-60"
          placeholder="輸入投票 ID"
          value={voteId}
          onChange={(e) => setVoteId(e.target.value)}
        />
        <button onClick={fetchVote} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
          查詢
        </button>
      </div>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {voteData && (
        /**<div className="mt-6 bg-white p-4 rounded-xl shadow-md w-80"></div>*/
        <button
          onClick={() => navigate(`/vote/${voteId}`)}
          className="mt-6 bg-white p-6 rounded-xl shadow-md w-80 cursor-pointer transition-all duration-300 hover:shadow-lg hover:bg-gray-50"
        >
          <h2 className="text-xl font-bold">{voteData.title}</h2>
          <p className="mt-2">🟢 候選人 A: {voteData.candidateA}</p>
          <p>🔵 候選人 B: {voteData.candidateB}</p>
          <p className="text-sm text-gray-500 mt-2">創建者: {voteData.creator}</p>
          <p className="text-sm text-gray-500">時間: {voteData.timestamp}</p>
        </button>
      )}
    </div>
  );
}
