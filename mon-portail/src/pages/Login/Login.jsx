import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
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
        headers: { 'Content-Type': 'application/json' },
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
        navigate('/dashboard');
      } else {
        setError(data.error || 'Erreur de connexion');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-grid" aria-hidden="true" />
      <div className="login-blob login-blob--cyan" aria-hidden="true" />
      <div className="login-blob login-blob--gold" aria-hidden="true" />
      <main className="login-main">
        <Link to="/" className="login-brand">
          <span className="login-logo-tile" aria-hidden="true">
            <svg width="46" height="46" viewBox="0 0 100 100" fill="none">
              <path
                d="M 25 25 H 75 L 25 75 H 75 L 25 25 Z"
                stroke="#0F172A"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="login-wordmark">ZONIA</span>
        </Link>

        <div className="login-card">
          <div className="login-bar" aria-hidden="true">
            <span className="login-bar-glow" />
            <span className="login-bar-stroke" />
          </div>
          <p className="login-eyebrow">Portail</p>
          <h1 className="login-title">Connexion</h1>
          <p className="login-chapo">Accédez à votre espace pour suivre vos automatisations.</p>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-field">
              <label htmlFor="username" className="form-label">Nom d&apos;utilisateur</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="form-input"
                placeholder="nom@zonia.com"
                disabled={loading}
              />
            </div>
            <div className="form-field">
              <div className="form-label-row">
                <label htmlFor="password" className="form-label">Mot de passe</label>
                <a href="mailto:zonia.ai.pro@gmail.com?subject=Mot%20de%20passe%20oubli%C3%A9" className="forgot-link">
                  Oublié ?
                </a>
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
                disabled={loading}
              />
            </div>
            <button type="submit" disabled={loading} className="submit-button">
              {loading ? (
                <>
                  <span className="login-spinner" aria-hidden="true" />
                  <span>Connexion…</span>
                </>
              ) : (
                <>
                  <span>Se connecter</span>
                  <ArrowRight size={20} strokeWidth={2} aria-hidden="true" />
                </>
              )}
            </button>
            <p className="login-note">
              Pas encore de compte ?{' '}
              <Link to="/#contact" className="footer-link">Demander un accès</Link>
            </p>
          </form>
        </div>
        <p className="copyright">&copy; {new Date().getFullYear()} Zonia Systems. Tous droits réservés.</p>
      </main>
    </div>
  );
}

export default Login;
