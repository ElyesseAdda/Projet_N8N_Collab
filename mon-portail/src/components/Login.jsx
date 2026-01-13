import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      let data;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error('Erreur de parsing JSON:', parseError);
        setError('Erreur de connexion au serveur (réponse invalide)');
        return;
      }

      if (response.ok && data.success) {
        onLogin(data.user);
        // En développement, rediriger vers /dashboard (affiche n8n dans iframe)
        // En production, rediriger vers /n8n (route gérée par Traefik)
        const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (isDevelopment) {
          navigate('/dashboard');
        } else {
          window.location.href = '/n8n';
        }
      } else {
        setError(data.error || 'Erreur de connexion');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Background Elements */}
      <div className="bg-grid"></div>
      <div className="glow-blob"></div>

      {/* Floating Decor Elements */}
      <div className="floating-decor decor-top-left">
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
          <path d="M 25 25 H 75 L 25 75 H 75 L 25 25 Z" stroke="white" strokeWidth="2"/>
        </svg>
      </div>
      <div className="floating-decor decor-bottom-right">
        <svg width="150" height="150" viewBox="0 0 100 100" fill="none">
          <path d="M 25 25 H 75 L 25 75 H 75 L 25 25 Z" stroke="white" strokeWidth="2"/>
        </svg>
      </div>

      {/* Main Login Card Container */}
      <main className="login-main">
        {/* Glassmorphism Card */}
        <div className="login-card">
          {/* Logo Header */}
          <div className="logo-header">
            <div className="logo-container">
              <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                {/* Glow Layer */}
                <path 
                  d="M 25 25 H 75 L 25 75 H 75 L 25 25 Z" 
                  stroke="#a855f7" 
                  strokeWidth="4" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  fill="none" 
                  opacity="0.4" 
                  filter="url(#glow)" 
                  className="draw-path"
                />
                {/* Main Sharp White Line */}
                <path 
                  d="M 25 25 H 75 L 25 75 H 75 L 25 25 Z" 
                  stroke="white" 
                  strokeWidth="4" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  fill="none"
                  className="draw-path"
                />
                {/* Tech Dot */}
                <circle cx="50" cy="50" r="3" fill="#a855f7" className="ping-dot"/>
                <circle cx="50" cy="50" r="3" fill="#a855f7"/>
              </svg>
            </div>
            <h1 className="logo-title">ZONIA</h1>
            <p className="logo-subtitle">Bienvenue dans le flux</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Username Input */}
            <div className="form-field">
              <label htmlFor="username" className="form-label">Nom d'utilisateur</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  className="form-input"
                  placeholder="nom@zonia.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="form-field">
              <div className="form-label-row">
                <label htmlFor="password" className="form-label">Mot de passe</label>
                <a href="#" className="forgot-link">Oublié ?</a>
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="form-input"
                placeholder="••••••••"
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="submit-button"
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  <span>CONNEXION...</span>
                </>
              ) : (
                <>
                  <span>SE CONNECTER</span>
                  <svg className="button-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="login-footer">
            Pas encore de compte ? <a href="#" className="footer-link">Demander un accès</a>
          </div>
        </div>

        {/* Copyright */}
        <div className="copyright">
          &copy; 2024 Zonia Systems. Secure Login.
        </div>
      </main>
    </div>
  );
}

export default Login;
