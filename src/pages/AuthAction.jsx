import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { applyActionCode, confirmPasswordReset, checkActionCode } from 'firebase/auth';
import { auth } from '../context/AuthContext'; 

export default function AuthAction() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const mode = searchParams.get('mode'); 
  const oobCode = searchParams.get('oobCode'); 

  const [status, setStatus] = useState('loading');
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!oobCode || !mode) {
      setStatus('error');
      setErrorMessage('Parametrii de autentificare lipsesc sau link-ul este corupt.');
      return;
    }

    if (mode === 'verifyEmail') {
      applyActionCode(auth, oobCode)
        .then(() => {
          setStatus('success');
        })
        .catch((error) => {
          console.error(error);
          setStatus('error');
          setErrorMessage('Link-ul a expirat sau a fost deja folosit.');
        });
    }

    if (mode === 'resetPassword') {
      checkActionCode(auth, oobCode)
        .then((info) => {
          setEmail(info.data.email);
          setStatus('form'); 
        })
        .catch((error) => {
          console.error(error);
          setStatus('error');
          setErrorMessage('Link-ul de resetare a parolei este invalid sau a expirat.');
        });
    }
  }, [mode, oobCode]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMessage('Parolele introduse nu coincid!');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Parola trebuie să aibă cel puțin 6 caractere.');
      return;
    }

    setStatus('loading');
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setStatus('success');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      console.error(error);
      setStatus('error');
      setErrorMessage('Nu s-a putut salva noua parolă. Încearcă din nou.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-zinc-100 font-sans p-6">
      {/* Glow decorativ de fundal specific InfoMotion */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 rounded-2xl bg-zinc-900/50 backdrop-blur-xl p-8 border border-zinc-800/80 shadow-2xl transition-all duration-300">
        
        {/* LOGO-ul InfoMotion */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            InfoMotion
          </h1>
          <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">Sistem de Securitate</p>
        </div>

        {/* REZULTAT: LOADING */}
        {status === 'loading' && (
          <div className="py-6 text-center space-y-4">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-zinc-400 text-sm">Se procesează solicitarea securizată...</p>
          </div>
        )}

        {/* REZULTAT: SUCCES (Verificare Email sau Resetare Reușită) */}
        {status === 'success' && (
          <div className="text-center space-y-6 animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 text-2xl">
              ✓
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-100">
                {mode === 'verifyEmail' ? 'Cont activat cu succes!' : 'Parolă actualizată!'}
              </h2>
              <p className="text-zinc-400 text-sm mt-2">
                {mode === 'verifyEmail' 
                  ? 'Email-ul tău a fost confirmat. Acum ești gata să explorezi simulările de algoritmi.' 
                  : 'Noua ta parolă a fost salvată în sistem în siguranță.'}
              </p>
            </div>
            <Link 
              to="/login" 
              className="block w-full rounded-lg bg-indigo-600 py-2.5 px-4 font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 hover:shadow-indigo-500/30 transition-all duration-200 text-sm text-center"
            >
              Mergi la Autentificare
            </Link>
          </div>
        )}

        {/* REZULTAT: FORMULAR DE RESETARE PAROLĂ */}
        {status === 'form' && (
          <form onSubmit={handleResetPassword} className="space-y-5 animate-fadeIn">
            <div className="text-center mb-2">
              <h2 className="text-xl font-bold text-zinc-100">Setează parola nouă</h2>
              {email && <p className="text-zinc-400 text-xs mt-1">Pentru contul: <span className="text-indigo-400">{email}</span></p>}
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20">
                ⚠️ {errorMessage}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-medium block">Noua Parolă</label>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={e => { setPassword(e.target.value); setErrorMessage(''); }} 
                className="w-full rounded-lg bg-zinc-800/60 px-3.5 py-2 text-zinc-100 border border-zinc-700/60 focus:outline-none focus:border-indigo-500 transition text-sm"
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-medium block">Confirmă Parola Nouă</label>
              <input 
                type="password" 
                required 
                value={confirmPassword} 
                onChange={e => { setConfirmPassword(e.target.value); setErrorMessage(''); }} 
                className="w-full rounded-lg bg-zinc-800/60 px-3.5 py-2 text-zinc-100 border border-zinc-700/60 focus:outline-none focus:border-indigo-500 transition text-sm"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              className="w-full rounded-lg bg-indigo-600 py-2.5 font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 hover:shadow-indigo-500/30 transition-all duration-200 text-sm"
            >
              Salvează Noua Parolă
            </button>
          </form>
        )}

        {/* REZULTAT: EROARE */}
        {status === 'error' && (
          <div className="text-center space-y-6 animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400 text-xl">
              ✕
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-100">Operațiune eșuată</h2>
              <p className="text-zinc-400 text-sm mt-2">
                {errorMessage || 'A apărut o eroare la procesarea codului de securitate.'}
              </p>
            </div>
            <div className="space-y-2">
              <Link 
                to="/login" 
                className="block w-full rounded-lg bg-zinc-800 py-2.5 px-4 font-semibold text-zinc-300 hover:bg-zinc-700/80 transition text-sm text-center"
              >
                Înapoi la Login
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}