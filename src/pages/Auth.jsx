import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../pages_css/auth.css';

function Auth() {
  const navigate = useNavigate();
  const { loginWithGoogle, login } = useAuth();
  
  // State-uri pentru a controla ce afișăm
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate('/lectii'); 
    } catch (error) {
      setError("Logarea cu Google a eșuat.");
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/lectii');
    } catch (error) {
      setError("Email sau parolă incorectă.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>InfoMotion<span>.</span></h1>
          <p>Contul tău de elev</p>
        </div>

        {error && <div className="auth-error" style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
        
        {/* Dacă NU am apăsat pe "Folosește email", arătăm butonul de Google */}
        {!showEmailForm ? (
          <>
            <button className="google-btn" onClick={handleGoogleLogin}>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/layout/google.svg" alt="Google" />
              Continuă cu Google
            </button>

            <div className="auth-divider"><span>sau</span></div>

            <p className="auth-footer-text">
              <span 
                className="auth-link" 
                onClick={() => setShowEmailForm(true)} 
                style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }}
              >
                Folosește Email și Parolă
              </span>
            </p>
          </>
        ) : (
          /* Dacă AM apăsat, arătăm formularul de login clasic */
          <form onSubmit={handleEmailLogin} className="auth-form-classic">
            <div className="admin-field">
              <label>Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="elev@exemplu.com"
                required 
              />
            </div>
            <div className="admin-field">
              <label>Parolă</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••"
                required 
              />
            </div>
            <button type="submit" className="admin-btn-login" style={{width: '100%', marginTop: '10px'}}>
              Intră în cont
            </button>
            <p 
              onClick={() => setShowEmailForm(false)} 
              style={{cursor: 'pointer', fontSize: '13px', marginTop: '15px', textAlign: 'center', color: 'var(--text-muted)'}}
            >
              ← Înapoi la logarea cu Google
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default Auth;