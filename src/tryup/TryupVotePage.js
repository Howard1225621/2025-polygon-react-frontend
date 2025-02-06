import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { ethers } from "ethers";

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
    "constant": false,
    "inputs": [
      { "name": "_id", "type": "uint256" },
      { "name": "_candidateIndex", "type": "uint256" }
    ],
    "name": "vote",
    "outputs": [{ "name": "", "type": "bool" }],
    "type": "function"
  }
];

export default function VotePage() {
  const { id } = useParams(); // 取得 URL 中的 id
  const [voteData, setVoteData] = useState(null);
  const [error, setError] = useState(null);
  const [signer, setSigner] = useState(null); // ⭐ 新增 signer 狀態
  const [descriptionA, setDescriptionA] = useState(""); // ⭐ 新增候選人A描述
  const [descriptionB, setDescriptionB] = useState(""); // ⭐ 新增候選人B描述

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
    const provider = new ethers.BrowserProvider(window.ethereum);
    const _signer = await provider.getSigner();
    setSigner(_signer);
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
      console.error("投票失敗:", err);
      alert("投票失敗，請再試一次！");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold">投票詳情</h1>
      <button
        onClick={connectWallet}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700"
      >
        連接錢包
      </button>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {voteData && (
        <div className="mt-6 bg-white p-6 rounded-xl shadow-md w-96 text-center">
          <h2 className="text-xl font-bold">{voteData.title}</h2>

          {/* 候選人 A */}
          <div className="mt-4 bg-gray-50 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-green-600">{voteData.candidateA}</h3>
            <p className="text-sm text-gray-700 mt-2">{descriptionA}</p>
            <button
              onClick={() => vote(1)}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg shadow-md mt-2"
            >
              🟢 投給 {voteData.candidateA}
            </button>
          </div>

          {/* 候選人 B */}
          <div className="mt-4 bg-gray-50 p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-blue-600">{voteData.candidateB}</h3>
            <p className="text-sm text-gray-700 mt-2">{descriptionB}</p>
            <button
              onClick={() => vote(2)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg shadow-md mt-2"
            >
              🔵 投給 {voteData.candidateB}
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-4">創建者: {voteData.creator}</p>
          <p className="text-sm text-gray-500">時間: {voteData.timestamp}</p>
        </div>
      )}
    </div>
  );
}