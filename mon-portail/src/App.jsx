import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vitrine from './pages/Vitrine';
import ZoniaProject from './pages/ZoniaProject';
import ProtectedRoute from './components/ProtectedRoute';

const PAGE_TITLES = {
  '/': "Zonia - Service d'automatisation",
  '/connect': 'Connexion portail',
  '/dashboard': 'Zonia N8n',
  '/ZoniaProject': 'Zonia',
};

function DocumentTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = PAGE_TITLES[pathname] ?? "Zonia - Service d'automatisation";
  }, [pathname]);

  return null;
}

function RedirectToN8n() {
  useEffect(() => {
    window.location.href = '/dashboard';
  }, []);
  return null;
}

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2500);
    try {
      const response = await fetch('/api/me', {
        credentials: 'include',
        signal: ctrl.signal,
      });
      if (response.ok) {
        try {
          const text = await response.text();
          const data = text ? JSON.parse(text) : {};
          setUser(data.user);
          setIsAuthenticated(true);
        } catch (parseError) {
          console.error('Erreur de parsing JSON:', parseError);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Erreur de vérification:', error);
      setIsAuthenticated(false);
    } finally {
      clearTimeout(timer);
      setAuthReady(true);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        setUser(null);
        setIsAuthenticated(false);
        navigate('/connect');
      }
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    }
  };

  // Ne JAMAIS bloquer la vitrine publique derrière /api/me (sinon page blanche).
  return (
    <Routes>
      <Route path="/" element={<Vitrine />} />
      <Route path="/ZoniaProject" element={<ZoniaProject />} />
      <Route
        path="/connect"
        element={
          !authReady ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: '#0f172a',
                color: '#94a3b8',
              }}
            >
              Chargement…
            </div>
          ) : isAuthenticated ? (
            <RedirectToN8n />
          ) : (
            <Login onLogin={handleLogin} />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          !authReady ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: '#0f172a',
                color: '#94a3b8',
              }}
            >
              Chargement…
            </div>
          ) : (
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Dashboard user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <DocumentTitle />
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
