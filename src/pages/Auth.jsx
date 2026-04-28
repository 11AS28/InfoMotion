import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../pages_css/auth.css';

function Auth() {
  const navigate = useNavigate();
  const { loginWithGoogle, login, signup } = useAuth();
  
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false); // Switch între Login și Register
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isRegistering) {
        await signup(email, password); // Creare cont nou
      } else {
        await login(email, password); // Logare cont existent
      }
      navigate('/lectii');
    } catch (error) {
      setError(isRegistering ? "Nu am putut crea contul. Email valid?" : "Email sau parolă incorectă.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>InfoMotion<span>.</span></h1>
          <p>{isRegistering ? "Creează un cont nou" : "Contul tău de elev"}</p>
        </div>

        {error && <div className="auth-error" style={{color: '#ff4d4d', marginBottom: '10px', fontSize: '14px'}}>{error}</div>}
        
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
                style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: '600' }}
              >
                Folosește Email și Parolă
              </span>
            </p>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form-classic">
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
              {isRegistering ? "Creează contul" : "Intră în cont"}
            </button>

            <p style={{textAlign: 'center', marginTop: '15px', fontSize: '14px'}}>
              {isRegistering ? "Ai deja cont?" : "Nu ai cont?"} {' '}
              <span 
                onClick={() => setIsRegistering(!isRegistering)} 
                style={{color: 'var(--accent)', cursor: 'pointer', fontWeight: 'bold'}}
              >
                {isRegistering ? "Loghează-te" : "Înregistrează-te"}
              </span>
            </p>

            <p 
              onClick={() => {setShowEmailForm(false); setIsRegistering(false);}} 
              style={{cursor: 'pointer', fontSize: '12px', marginTop: '10px', textAlign: 'center', color: 'var(--text-muted)'}}
            >
              ← Înapoi la Google
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default Auth;