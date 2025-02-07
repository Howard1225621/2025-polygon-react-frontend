// src/pages/HomePage.js
import React from 'react';
import { useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import styles from '../css/SearchPage.module.css';

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
      console.log("Contract methods:", contract);
    } catch (err) {
      setError("查詢失敗，請檢查投票 ID 是否正確");
      setVoteData(null);
    }
  };

  return (
    <div className={styles.container}>
      <button className={`${styles.backtomainpagebutton}`} onClick={() => navigate(-1)}>
            返回主頁
      </button>
      <h1 className={styles.title}>投票查詢</h1>
      <div className={styles.inputBox}>
        <input
          type="number"
          className={styles.input}
          placeholder="輸入投票 ID"
          value={voteId}
          onChange={(e) => setVoteId(e.target.value)}
        />
        <button onClick={fetchVote} className={styles.buttonPrimary}>
          查詢
        </button>
      </div>
      {error && <p className={styles.error}>{error}</p>}
      {voteData && (
        <button
          onClick={() => navigate(`/vote/${voteId}`)}
          className={styles.voteCard}
        >
          <h2 className={styles.voteTitle}>{voteData.title}</h2>
          <p>🟢 候選人 A: {voteData.candidateA}</p>
          <p>🔵 候選人 B: {voteData.candidateB}</p>
          <p className={styles.voteInfo}>創建者: {voteData.creator}</p>
          <p className={styles.voteInfo}>時間: {voteData.timestamp}</p>
        </button>
      )}
    </div>
  );
}
