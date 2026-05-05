import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../pages_css/auth.css';
import { FaGoogle } from "react-icons/fa";

function Auth() {
  const navigate = useNavigate();
  const { loginWithGoogle, login, signup } = useAuth();
  
  // Avem nevoie doar de acest state pentru a face switch între Login și Înregistrare
  const [isRegistering, setIsRegistering] = useState(false); 
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
    setError(""); // Curățăm eroarea la o nouă încercare
    try {
      if (isRegistering) {
        await signup(email, password); // Creare cont nou
      } else {
        await login(email, password); // Logare cont existent
      }
      navigate('/lectii');
    } catch (error) {
      // Afișăm un mesaj diferit în funcție de ce încerca să facă utilizatorul
      setError(isRegistering ? "Nu am putut crea contul. Email invalid sau deja folosit?" : "Email sau parolă incorectă.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>InfoMotion<span>.</span></h1>
          <p>{isRegistering ? "Creează un cont de elev" : "Intră în contul tău"}</p>
          <br />
        </div>

        {/* Afișarea erorilor */}
        {error && (
          <div className="auth-error" style={{ color: '#ff4d4d', marginBottom: '15px', fontSize: '14px', textAlign: 'center', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '8px' }}>
            {error}
          </div>
        )}
        
        {/* --- 1. BUTONUL GOOGLE (Mereu vizibil) --- */}
        <button className="google-btn" onClick={handleGoogleLogin} style={{ width: '100%', marginBottom: '20px' }}>
          <FaGoogle />
          {isRegistering ? "Înregistrează-te cu Google" : "Continuă cu Google"}
        </button>

        {/* --- 2. DELIMITATORUL --- */}
        <div className="auth-divider" style={{ textAlign: 'center', margin: '20px 0', color: 'var(--text-muted)' }}>
          <span style={{ backgroundColor: 'var(--bg-card)', padding: '0 10px', fontSize: '0.9rem' }}>
            sau cu email
          </span>
        </div>

        {/* --- 3. FORMULARUL DE EMAIL (Mereu vizibil) --- */}
        <form onSubmit={handleSubmit} className="auth-form-classic">
          <div className="admin-field" style={{ marginBottom: '15px' }}>
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="elev@exemplu.com"
              required 
            />
          </div>
          <div className="admin-field" style={{ marginBottom: '20px' }}>
            <label>Parolă</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              required 
            />
          </div>
          
          {/* Butonul de submit care își schimbă textul */}
          <button type="submit" className="admin-btn-login" style={{ width: '100%' }}>
            {isRegistering ? "Creează contul" : "Intră în cont"}
          </button>
        </form>

        {/* --- 4. LINK-UL DE SWITCH (Login <-> Register) --- */}
        <p style={{ textAlign: 'center', marginTop: '25px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          {isRegistering ? "Ai deja cont?" : "Nu ai cont?"} {' '}
          <span 
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(""); // Curățăm eroarea când schimbăm tab-ul
              setPassword(""); // Golim parola pentru securitate
            }} 
            style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}
          >
            {isRegistering ? "Loghează-te aici" : "Înregistrează-te"}
          </span>
        </p>

      </div>
    </div>
  );
}

export default Auth; 