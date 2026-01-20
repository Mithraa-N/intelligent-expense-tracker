import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

export default function App() {
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem('sh_auth');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (auth) {
      localStorage.setItem('sh_auth', JSON.stringify(auth));
    } else {
      localStorage.removeItem('sh_auth');
    }
  }, [auth]);

  const handleLogout = () => {
    setAuth(null);
  };

  return (
    <div className="app-container">
      {auth ? (
        <Dashboard auth={auth} onLogout={handleLogout} />
      ) : (
        <Login onLogin={setAuth} />
      )}
    </div>
  );
}
