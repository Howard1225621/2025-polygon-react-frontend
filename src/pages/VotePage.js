import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ethers } from "ethers";
import styles from "../css/VotePage.module.css"; // 引入 CSS Modules

const CONTRACT_ADDRESS = process.env.REACT_APP_VoteReader_Address;
const VOTING_CONTRACT_ADDRESS = process.env.REACT_APP_Voting_Address;
const CONTRACT_ABI = [
  {
    "constant": true,
    "inputs": [{ "name": "_id", "type": "uint256" }],
    "name": "getVoteInfo",
    "outputs": [
      { "name": "title", "type": "string" },
      { "name": "candidateA", "type": "string" },
      { "name": "candidateB", "type": "string" },
      { "name": "candidateA_CID", "type": "string" },
      { "name": "candidateB_CID", "type": "string" },
      { "name": "creator", "type": "address" },
      { "name": "timestamp", "type": "uint256" }
    ],
    "type": "function"
  }
];
const VOTING_CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "hasVoted",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_voteId",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "_candidate",
        "type": "uint8"
      }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_voteId",
        "type": "uint256"
      }
    ],
    "name": "getResults",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "candidateACount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "candidateBCount",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
];

export default function VotePage() {
  const { id } = useParams(); // 取得 URL 中的 id
  const [voteData, setVoteData] = useState(null);
  const [results, setResults] = useState({ candidateACount: 0, candidateBCount: 0 });
  const [error, setError] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [signer, setSigner] = useState(null); // ⭐ 新增 signer 狀態
  const [descriptionA, setDescriptionA] = useState(""); // ⭐ 新增候選人A描述
  const [descriptionB, setDescriptionB] = useState(""); // ⭐ 新增候選人B描述
  const [showResults, setShowResults] = useState(false); // 用來控制是否顯示結果

  useEffect(() => {
    fetchVoteInfo();
  }, [id]);

  useEffect(() => {
    if (voteData) {
      fetchDescriptions();
    }
  }, [voteData]); // 確保只在voteData有變動時呼叫

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("請安裝 MetaMask 來使用此功能");
      return;
    }
  
    try {
      console.log("請求連接 MetaMask...");
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  
      if (!accounts || accounts.length === 0) {
        throw new Error("未授權或未選擇帳戶");
      }
  
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
  
      setWalletAddress(address);
      setSigner(signer);
      alert("錢包連接成功！");
    } catch (error) {
      console.error("連接錢包失敗:", error);
      alert(`錢包連接失敗，錯誤訊息: ${error.message}`);
    }
  };
  

  const fetchVoteInfo = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const result = await contract.getVoteInfo(id);

      setVoteData({
        title: result[0],
        candidateA: result[1],
        candidateB: result[2],
        candidateA_CID: result[3],
        candidateB_CID: result[4],
        creator: result[5],
        timestamp: new Date(Number(result[6]) * 1000).toLocaleString()
      });
    } catch (err) {
      setError("查詢失敗，請檢查投票 ID 是否正確");
      setVoteData(null);
    }
  };

  const fetchDescriptions = async () => {
    try {
      if (voteData.candidateA_CID) {
        const resA = await axios.get(`https://ipfs.io/ipfs/${voteData.candidateA_CID}`);
        setDescriptionA(resA.data.description || "無描述"); // 確保後端存的是 `{ "description": "..." }`
      }
      if (voteData.candidateB_CID) {
        const resB = await axios.get(`https://ipfs.io/ipfs/${voteData.candidateB_CID}`);
        setDescriptionB(resB.data.description || "無描述");
      }
    } catch (error) {
      console.error("Error fetching IPFS data:", error);
    }
  };

  
  const vote = async (candidateIndex) => {
    if (!signer) {
      alert("請先連接錢包！");
      return;
    }

    try {
      const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, signer);
      const tx = await contract.vote(id, candidateIndex);
      await tx.wait();
      alert("投票成功！");
    } catch (err) {
      alert(err.reason);
    }
  };
  
  const navigate = useNavigate();

  const fetchResults = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, provider);
      
      const voteId = id; // 替換成真實的 voteId
      const [candidateACount, candidateBCount] = await contract.getResults(voteId);

      setResults({
        candidateACount: candidateACount.toString(),
        candidateBCount: candidateBCount.toString(),
      });
      setShowResults(true); // 顯示結果
    } catch (err) {
      setError("無法獲取投票結果");
      console.error(err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.buttonContainer}>
        <button className={`${styles.back} ${styles.tomainpagebutton}`} onClick={() => navigate(-2)}>
          返回主頁
        </button>
        <button className={`${styles.back}`} onClick={() => navigate(-1)}>
          返回查詢
        </button>
      </div>
      <h1 className={styles.title}>投票詳情</h1>
      <button onClick={connectWallet} className={styles.walletButton}>
        {walletAddress ? "Connected" : "Connect Wallet"}
      </button>
      {error && <p className={styles.errorMessage}>{error}</p>}
      {voteData && (
        <div className={styles.voteCard}>
          <h2 className={styles.voteCardTitle}>{voteData.title}</h2>

          <div className={`${styles.candidateCard} ${styles.candidateA}`}>
            <h3 className={styles.candidateName}>{voteData.candidateA}</h3>
            <p className={styles.candidateDescription}>{descriptionA}</p>
            <button onClick={() => vote(1)} className={`${styles.voteButton} ${styles.voteButtonA}`}>
              🟢 投給 {voteData.candidateA}
            </button>
          </div>

          <div className={`${styles.candidateCard} ${styles.candidateB}`}>
            <h3 className={styles.candidateName}>{voteData.candidateB}</h3>
            <p className={styles.candidateDescription}>{descriptionB}</p>
            <button onClick={() => vote(2)} className={`${styles.voteButton} ${styles.voteButtonB}`}>
              🔵 投給 {voteData.candidateB}
            </button>
          </div>

          <p className={styles.voteInfo}>創建者: {voteData.creator}</p>
          <p className={styles.voteInfo}>時間: {voteData.timestamp}</p>
          {/* 查看結果按鈕 */}
          <button onClick={fetchResults} className={styles.viewResultsButton}>
            查看投票結果
          </button>
          {/* 顯示投票結果 */}
          {showResults && (
            <div className={styles.results}>
              <p>候選人 A 投票數：{results.candidateACount}</p>
              <p>候選人 B 投票數：{results.candidateBCount}</p>
            </div>
          )}
        </div>
        
      )}
    </div>
  );
};



 

