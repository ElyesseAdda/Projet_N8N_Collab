import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Vitrine from './components/Vitrine';
import ProtectedRoute from './components/ProtectedRoute';

// Composant pour rediriger vers dashboard
function RedirectToN8n() {
  useEffect(() => {
    // Rediriger vers /dashboard (affiche n8n dans iframe avec ControlCard)
    window.location.href = '/dashboard';
  }, []);
  return null;
}

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/me', {
        credentials: 'include', // Inclure les cookies pour maintenir la session
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
      setLoading(false);
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
        credentials: 'include', // Inclure les cookies pour maintenir la session
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

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Chargement...</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Route racine : Vitrine publique */}
      <Route path="/" element={<Vitrine />} />
      
      {/* Route de connexion : Login si non connecté, sinon rediriger vers n8n */}
      <Route 
        path="/connect" 
        element={
          isAuthenticated ? (
            <RedirectToN8n />
          ) : (
            <Login onLogin={handleLogin} />
          )
        } 
      />
      
      {/* Route dashboard (optionnelle, gardée pour compatibilité) */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Dashboard user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        } 
      />
      
      {/* Route catch-all pour les routes non trouvées */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;

