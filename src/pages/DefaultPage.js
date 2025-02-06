import React from "react";
import { useNavigate } from "react-router-dom";

const DefaultPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 p-4">
      <div className="w-full max-w-md p-6 bg-white shadow-2xl rounded-2xl text-center border border-gray-200">
        <h1 className="text-3xl font-extrabold mb-4 text-gray-800">投票系統</h1>
        <p className="text-gray-600 mb-6 text-lg">選擇您要執行的操作</p>
        <div className="space-y-4">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 shadow-md" onClick={() => navigate("/search")}>
            前往投票
          </button>
          <button className="w-full border border-gray-400 text-gray-700 hover:bg-gray-100 font-semibold py-2 px-4 rounded-lg transition-all duration-300 shadow-md" onClick={() => navigate("/createvote")}>
            建立投票
          </button>
        </div>
      </div>
    </div>
  );
};

export default DefaultPage;
