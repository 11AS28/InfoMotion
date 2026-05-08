import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../pages_css/auth.css';
import { FaGoogle } from "react-icons/fa";
import { sendEmailVerification } from "firebase/auth";

function Auth() {
  const navigate = useNavigate();
  const { loginWithGoogle, login, signup, logout } = useAuth();
  

  const [isRegistering, setIsRegistering] = useState(false); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showResendBtn, setShowResendBtn] = useState(false);

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
    setSuccessMsg(""); 

    try {
      if (isRegistering) {
        await signup(email, password); 
        setSuccessMsg("Cont creat cu succes! Te rugăm să îți verifici emailul (inclusiv folderul Spam) pentru a activa contul.");
        setIsRegistering(false);
        setPassword(""); 
      } else {
        // Logare cont existent
        const userCredential = await login(email, password); 
        
        // --- VERIFICAREA EMAILULUI ---
                if (!userCredential.user.emailVerified) {
          await logout(); 
          setError("Contul tău nu este activat. Te rugăm să dai click pe linkul primit pe email.");
          setShowResendBtn(true); // <--- ACTIVĂM BUTONUL AICI
          return; 
        }

        // Dacă e verificat, îl trimitem la lecții
        navigate('/lectii');
      }
    } catch (error) {
      setError(isRegistering ? "Nu am putut crea contul. Email invalid sau deja folosit?" : "Email sau parolă incorectă.");
    }
  };



    const handleResendEmail = async () => {
    try {
      // 1. Logăm userul temporar în spate ca să aibă Firebase acces la el
      const userCredential = await login(email, password);
      
      // 2. Îi trimitem emailul
      await sendEmailVerification(userCredential.user);
      
      // 3. Îl delogăm la loc imediat
      await logout();
      
      // 4. Afișăm mesajul de succes
      setSuccessMsg("Emailul a fost retrimis! Verifică și folderul Spam.");
      setError("");
      setShowResendBtn(false); // Ascundem butonul înapoi
    } catch (err) {
      setError("A apărut o eroare la retrimiterea emailului.");
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

        {/* Afișarea mesajului de succes */}
        {successMsg && (
          <div className="auth-success" style={{ color: '#155724', marginBottom: '15px', fontSize: '14px', textAlign: 'center', backgroundColor: '#d4edda', padding: '10px', borderRadius: '8px' }}>
            {successMsg}
          </div>
        )}

        {/* Afișarea erorilor */}
                {/* Afișarea erorilor și a butonului de retrimitere */}
        {error && (
          <div className="auth-error" style={{ color: '#ff4d4d', marginBottom: '15px', fontSize: '14px', textAlign: 'center', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '8px' }}>
            {error}
            
            {/* Butonul apare doar dacă showResendBtn este true */}
            {showResendBtn && (
              <div style={{ marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={handleResendEmail} 
                  style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '6px 15px', borderRadius: '5px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
                >
                  Trimite din nou emailul
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* BUTONUL GOOGLE */}
        <button className="google-btn" onClick={handleGoogleLogin} style={{ width: '100%', marginBottom: '20px' }}>
          <FaGoogle />
          {isRegistering ? "Înregistrează-te cu Google" : "Continuă cu Google"}
        </button>

        {/* DELIMITATORUL */}
        <div className="auth-divider" style={{ textAlign: 'center', margin: '20px 0', color: 'var(--text-muted)' }}>
          <span style={{ backgroundColor: 'var(--bg-card)', padding: '0 10px', fontSize: '0.9rem' }}>
            sau cu email
          </span>
        </div>

        {/* FORMULARUL DE EMAIL */}
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
          
          <button type="submit" className="admin-btn-login" style={{ width: '100%' }}>
            {isRegistering ? "Creează contul" : "Intră în cont"}
          </button>
        </form>

        {/* LINK-UL DE SWITCH (Login <-> Register) */}
        <p style={{ textAlign: 'center', marginTop: '25px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          {isRegistering ? "Ai deja cont?" : "Nu ai cont?"} {' '}
          <span 
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(""); 
              setSuccessMsg(""); // Curățăm și succesul când se mută între taburi
              setPassword(""); 
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