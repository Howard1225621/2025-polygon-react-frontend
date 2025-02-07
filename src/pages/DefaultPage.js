import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../css/DefaultPage.module.css"; // 使用 CSS Modules

const DefaultPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <h1 className={styles.title}>投票系統</h1>
        <p className={styles.description}>選擇您要執行的操作</p>
        <div className={styles.buttons}>
          <button className={`${styles.button} ${styles.buttonPrimary}`} onClick={() => navigate("/search")}>
            前往投票
          </button>
          <button className={`${styles.button} ${styles.buttonSecondary}`} onClick={() => navigate("/createvote")}>
            建立投票
          </button>
        </div>
      </div>
    </div>
  );
};

export default DefaultPage;

