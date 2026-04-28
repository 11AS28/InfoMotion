import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase'; // Asigură-te că db e importat pentru a salva userul
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import '../pages_css/auth.css';

function Auth() {
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Verificăm dacă user-ul există deja în Firestore, dacă nu, îl creăm
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          nume: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          dataCrearii: new Date(),
          progres: {} // Inițializăm progresul gol
        });
      }

      console.log("Logat cu succes:", user.displayName);
      navigate('/lectii'); // Îl trimitem direct la învățat
    } catch (error) {
      console.error("Eroare la logarea cu Google:", error.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Bun venit la InfoMotion<span>.</span></h1>
        <p>Alege o metodă de autentificare pentru a-ți salva progresul.</p>
        
        <button className="google-btn" onClick={handleGoogleLogin}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/layout/google.svg" alt="Google" />
          Continuă cu Google
        </button>

        <div className="auth-divider">
          <span>sau</span>
        </div>

        {/* Aici poți lăsa formularul vechi cu email dacă vrei, sau îl scoți de tot */}
        <p className="auth-footer">Logarea cu Google este cea mai sigură metodă.</p>
      </div>
    </div>
  );
}

export default Auth;