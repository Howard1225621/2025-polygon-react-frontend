import React from "react";
import { useNavigate } from "react-router-dom";
import '../css/defaultpage.css';

const TryupDefaultPage = () => {
  const navigate = useNavigate();

  return (
    <div className="vote-container">
      <div className="vote-box">
        <h1 className="vote-title">投票系統</h1>
        <p className="vote-description">選擇您要執行的操作</p>
        <div className="vote-buttons">
          <button className="vote-button vote-button-primary" onClick={() => navigate("/search")}>
            前往投票
          </button>
          <button className="vote-button vote-button-secondary" onClick={() => navigate("/createvote")}>
            建立投票
          </button>
        </div>
      </div>
    </div>

  );
};

export default TryupDefaultPage;
