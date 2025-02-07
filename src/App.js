import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SearchPage from './pages/SearchPage';  // 確保文件名正確
import DefaultPage from './pages/DefaultPage';
import CreateVote from './pages/CreateVote';
import VotePage from './pages/VotePage';


function App() {
  return (
    <Router>  {/* 用 Router 包裹 Routes */}
        <Routes> {/* Routes 必須包裹所有 Route */}
          {/* 設置路由和對應的組件 */}
          <Route path="/" element={<DefaultPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/createvote" element={<CreateVote />} />
          <Route path="/vote/:id" element={<VotePage />} />

          
        </Routes>
    </Router>
  );
}

export default App;