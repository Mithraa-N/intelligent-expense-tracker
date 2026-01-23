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

  class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
      console.error("Uncaught error:", error, errorInfo);
    }

    render() {
      if (this.state.hasError) {
        return (
          <div style={{ padding: '2rem', color: '#ff5555', background: '#222', minHeight: '100vh' }}>
            <h1>Something went wrong.</h1>
            <pre style={{ whiteSpace: 'pre-wrap', marginTop: '1rem', background: '#333', padding: '1rem', borderRadius: '8px' }}>
              {this.state.error && this.state.error.toString()}
              {this.state.error && this.state.error.stack}
            </pre>
            <button onClick={() => { localStorage.clear(); window.location.reload(); }} style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
              Clear Data & Reload
            </button>
          </div>
        );
      }
      return this.props.children;
    }
  }

  const handleLogout = () => {
    setAuth(null);
  };

  return (
    <div className="app-container">
      <ErrorBoundary>
        {auth ? (
          <Dashboard auth={auth} onLogout={handleLogout} />
        ) : (
          <Login onLogin={setAuth} />
        )}
      </ErrorBoundary>
    </div>
  );
}
