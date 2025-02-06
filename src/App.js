import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SearchPage from './pages/SearchPage';  // 確保文件名正確
import DefaultPage from './pages/DefaultPage';
import CreateVote from './pages/CreateVote';
import VotePage from './pages/VotePage';


import Tryup from './tryup/Tryup';
import TryupCreateVote from './tryup/TryupCreateVote';
import TryupDefaultPage from './tryup/TryupDefaultPage';

function App() {
  return (
    <Router>  {/* 用 Router 包裹 Routes */}
        <Routes> {/* Routes 必須包裹所有 Route */}
          {/* 設置路由和對應的組件 */}
          <Route path="/" element={<DefaultPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/createvote" element={<CreateVote />} />
          <Route path="/vote/:id" element={<VotePage />} />

          <Route path="/tryup/createvote" element={<TryupCreateVote />} />
          <Route path="/tryupdefault" element={<TryupDefaultPage />} />

          
          <Route path="/tryup" element={<Tryup />} />
          
        </Routes>
    </Router>
  );
}

export default App;






/**import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
*/