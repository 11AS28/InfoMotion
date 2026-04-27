import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../pages_css/auth.css'; // Asigură-te că ai fișierul sau pune stilul în App.css

function Auth() {
  const [isLogin, setIsLogin] = useState(true); // Switch între Login și Register
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const emailRef = useRef();
  const passwordRef = useRef();
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await login(emailRef.current.value, passwordRef.current.value);
      } else {
        await signup(emailRef.current.value, passwordRef.current.value);
      }
      navigate("/"); // Te trimite pe prima pagină după succes
    } catch (err) {
      setError("A apărut o eroare: " + err.message);
    }

    setLoading(false);
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? "Autentificare" : "Cont Nou"}</h2>
        
        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input type="email" ref={emailRef} required placeholder="email@exemplu.com" />
          </div>
          
          <div className="input-group">
            <label>Parolă</label>
            <input type="password" ref={passwordRef} required placeholder="minim 6 caractere" />
          </div>

          <button disabled={loading} type="submit" className="auth-btn">
            {isLogin ? "Intră în cont" : "Creează Cont"}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            <br />
            {isLogin ? "Nu ai cont?" : "Ai deja cont?"} 
            <span onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? " Înregistrează-te" : " Loghează-te"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Auth;