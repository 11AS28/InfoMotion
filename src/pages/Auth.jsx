import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../pages_css/auth.css';
import { FaGoogle } from "react-icons/fa";
import { sendEmailVerification } from "firebase/auth";

function Auth() {
  const navigate = useNavigate();
  const { loginWithGoogle, login, signup, logout, resetPassword } = useAuth();
  
  const [isRegistering, setIsRegistering] = useState(false); 
  const [role, setRole] = useState('student'); //  STATE NOU: 'student' sau 'teacher'
  const [identificator, setIdentificator] = useState(''); 
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showResendBtn, setShowResendBtn] = useState(false);

  const handleGoogleLogin = async () => {
    if (isRegistering && !agreedToTerms) {
      setError("Te rugăm să fii de acord cu Termenii, Condițiile și Politica de Confidențialitate înainte de a continua.");
      return;
    }
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
        if (!agreedToTerms) {
          setError("Trebuie să accepți Termenii și Condițiile și Politica de Confidențialitate pentru a crea un cont.");
          return;
        }

        if (!username.trim()) {
          setError("Te rugăm să introduci un Username.");
          return;
        }
        if (!identificator.includes('@')) {
          setError("Te rugăm să folosești o adresă de email validă pentru înregistrare.");
          return;
        }

        //  Pasăm și starea `role` către funcția de signup din context
        await signup(identificator, password, username, role); 
        
        setSuccessMsg("Cont creat cu succes! Te rugăm să îți verifici emailul (inclusiv folderul Spam) pentru a activa contul.");
        setIsRegistering(false);
        setPassword(""); 
        setUsername("");
        setAgreedToTerms(false);
      } else {
        const userCredential = await login(identificator, password); 
        const user = userCredential.user;
        const isDev = user.email === "smmaria@gmail.com";

        if (!userCredential.user.emailVerified && !isDev) {
          await logout(); 
          setError("Contul tău nu este activat. Te rugăm să dai click pe linkul primit pe email.");
          setShowResendBtn(true);
          return; 
        }

        navigate('/lectii');
      }
    } catch (error) {
      if (error.message.includes("auth/user-not-found")) {
        setError("Username-ul nu a fost găsit.");
      } else {
        setError(isRegistering ? "Nu am putut crea contul. Email invalid sau deja folosit?" : "Email, username sau parolă incorectă.");
      }
    }
  };

  const handleResendEmail = async () => {
    try {
      const emailPentruRetrimitere = identificator.includes('@') ? identificator : null;
      if(!emailPentruRetrimitere) {
          setError("Pentru a retrimite emailul, te rugăm să te loghezi folosind adresa de email, nu username-ul.");
          return;
      }

      const userCredential = await login(identificator, password);
      await sendEmailVerification(userCredential.user);
      await logout();
      
      setSuccessMsg("Emailul a fost retrimis! Verifică și folderul Spam.");
      setError("");
      setShowResendBtn(false); 
    } catch (err) {
      setError("A apărut o eroare la retrimiterea emailului. Asigură-te că parola e corectă.");
    }
  };

  const handleResetPassword = async () => {
    if (!identificator) {
      setError("Te rog să introduci adresa de email în câmpul de mai sus pentru a reseta parola!");
      return;
    }
    
    if (!identificator.includes('@')) {
      setError("Te rog să introduci un email valid pentru resetare, nu un username!");
      return;
    }

    try {
      await resetPassword(identificator);
      setSuccessMsg("Dacă emailul există în baza noastră de date, vei primi un link de resetare.");
      setError("");
    } catch (err) {
      setError("Eroare la resetarea parolei: " + err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>InfoMotion<span>.</span></h1>
          {/*  Text dinamic în funcție de rol */}
          <p>{isRegistering ? `Creează un cont de ${role === 'student' ? 'elev' : 'profesor'}` : "Intră în contul tău"}</p>
          <br />
        </div>

        {successMsg && (
          <div className="auth-success" style={{ color: '#155724', marginBottom: '15px', fontSize: '14px', textAlign: 'center', backgroundColor: '#d4edda', padding: '10px', borderRadius: '8px' }}>
            {successMsg}
          </div>
        )}

        {error && (
          <div className="auth-error" style={{ color: '#ff4d4d', marginBottom: '15px', fontSize: '14px', textAlign: 'center', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '8px' }}>
            {error}
            
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
        
        {/*  SELECTOR DE ROL: Afișat doar la înregistrare */}
        {isRegistering && (
          <div className="role-selector-container" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => setRole('student')}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: role === 'student' ? '2px solid var(--accent, #007bff)' : '1px solid #ccc',
                backgroundColor: role === 'student' ? 'rgba(0, 123, 255, 0.1)' : 'transparent',
                color: role === 'student' ? 'var(--accent, #007bff)' : 'var(--text-secondary)',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Sunt Elev
            </button>
            <button
              type="button"
              onClick={() => setRole('teacher')}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: role === 'teacher' ? '2px solid var(--accent, #007bff)' : '1px solid #ccc',
                backgroundColor: role === 'teacher' ? 'rgba(0, 123, 255, 0.1)' : 'transparent',
                color: role === 'teacher' ? 'var(--accent, #007bff)' : 'var(--text-secondary)',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Sunt Profesor
            </button>
          </div>
        )}

        <button className="google-btn" onClick={handleGoogleLogin} style={{ width: '100%', marginBottom: '20px' }}>
          <FaGoogle />
          {isRegistering ? "Înregistrează-te cu Google" : "Continuă cu Google"}
        </button>

        <div className="auth-divider" style={{ textAlign: 'center', margin: '20px 0', color: 'var(--text-muted)' }}>
          <span style={{ backgroundColor: 'var(--bg-card)', padding: '0 10px', fontSize: '0.9rem' }}>
            sau cu {isRegistering ? "email" : "email / username"}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form-classic">
          
          {isRegistering && (
            <div className="admin-field" style={{ marginBottom: '15px' }}>
              <label>Username</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="ex: popescu_ion"
                required={isRegistering} 
              />
            </div>
          )}

          <div className="admin-field" style={{ marginBottom: '15px' }}>
            <label>Email</label>
            <input 
              type="email" 
              value={identificator} 
              onChange={(e) => setIdentificator(e.target.value)} 
              placeholder={isRegistering ? (role === 'student' ? "elev@exemplu.com" : "profesor@exemplu.com") : "Email-ul tău"}
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

          {/*  Câmpuri specifice de profesor în formular (Opțional - momentan l-am lăsat gol, dar dacă vrei să ceri ceva specific de la ei pe viitor, îl injectezi direct aici) */}
          {isRegistering && role === 'teacher' && (
            <div className="teacher-extra-fields" style={{ marginBottom: '15px', padding: '10px', background: 'rgba(0,0,0,0.02)', borderRadius: '6px' }}>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                💡 Contul de profesor îți va permite să trimiți lecții pentru a fi publicate pe site.
              </p>
            </div>
          )}

          {isRegistering && (
            <div className="terms-checkbox-container" style={{ marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <input 
                type="checkbox" 
                id="termsCheck"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                style={{ marginTop: '3px', cursor: 'pointer' }}
              />
              <label htmlFor="termsCheck" style={{ cursor: 'pointer', lineHeight: '1.4' }}>
                Sunt de acord cu <Link to="/termeni" target="_blank" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Termenii și Condițiile</Link> și cu <Link to="/confidentialitate" target="_blank" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Politica de Confidențialitate</Link>.
              </label>
            </div>
          )}

          <button type="submit" className="admin-btn-login" style={{ width: '100%' }}>
            {isRegistering ? "Creează contul" : "Intră în cont"}
          </button>
          
        </form>

        <p style={{ textAlign: 'center', marginTop: '25px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          {isRegistering ? "Ai deja cont?" : "Nu ai cont?"} {' '}
          <span 
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(""); 
              setSuccessMsg(""); 
              setPassword(""); 
              setIdentificator(""); 
              setUsername("");
              setRole('student'); // Resetăm înapoi la student
              setAgreedToTerms(false);
            }} 
            style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}
          >
            {isRegistering ? "Loghează-te aici" : "Înregistrează-te"}
          </span>
        </p>

        {!isRegistering && (
          <button type="button" id="reset-password-btn" onClick={handleResetPassword} style={{ width: '100%', marginTop: '10px', background: 'none', border: 'none', color: 'var(--text-muted)', textDecoration: 'underline', cursor: 'pointer' }}>
            Ai uitat parola? Resetează aici
          </button>
        )}

      </div>
    </div>
  );
}

export default Auth;