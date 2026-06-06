import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import AppBar from './components/AppBar';
import UserDashboard from './Pages/UserDashboard';
import SimulatorDashboard from './Pages/SimulatorDashboard';
import Home from './Pages/Home';

import './Pages/dashboard.css';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <div className={darkMode ? 'app app-dark' : 'app app-light'}>
      <Router>
        <AppBar />

        <button
          className="theme-toggle"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? '☀️ Mode clair' : '🌙 Mode sombre'}
        </button>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/user" element={<UserDashboard />} />
            <Route path="/driver" element={<SimulatorDashboard />} />
            <Route
              path="*"
              element={
                <div className="not-found">
                  <h1>404</h1>
                  <p>Page introuvable</p>
                </div>
              }
            />
          </Routes>
        </main>
      </Router>
    </div>
  );
}

export default App;