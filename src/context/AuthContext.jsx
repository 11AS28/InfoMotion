import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup 
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Funcția care calculează statisticile
  const getStatistici = () => {
    if (!currentUser || !currentUser.progres) return { terminate: 0, progresProcent: 0 };
    const terminate = Object.keys(currentUser.progres).length;
    const totalLectii = 10; 
    return {
      terminate,
      progresProcent: (terminate / totalLectii) * 100
    };
  };

  // --- FUNCȚII NOI PENTRU REPARAREA ERORILOR DIN LESSONPAGE ---

  // Verifică dacă id-ul lecției există în obiectul progres al userului
  const verificaDacaEGata = (idLectie) => {
    if (!currentUser || !currentUser.progres) return false;
    return !!currentUser.progres[idLectie];
  };

  // Updatează progresul direct în Firestore
  const marcheazaLectieTerminata = async (idLectie) => {
    if (!currentUser) return;

    const userRef = doc(db, 'users', currentUser.uid);
    
    try {
      // Folosim sintaxa de obiect dinamic pentru a nu suprascrie tot progresul
      await updateDoc(userRef, {
        [`progres.${idLectie}`]: {
          terminatLa: new Date(),
          status: 'complet'
        }
      });
      console.log(`Progres salvat pentru: ${idLectie}`);
    } catch (error) {
      console.error("Eroare la salvarea lecției:", error);
    }
  };

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        nume: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        dataCrearii: new Date(),
        progres: {}
      });
    }
    return user;
  }

  function logout() { return signOut(auth); }
  function login(email, password) { return signInWithEmailAndPassword(auth, email, password); }
  function signup(email, password) { return createUserWithEmailAndPassword(auth, email, password); }

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const unsubscribeDb = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setCurrentUser({ ...user, ...docSnap.data() });
          } else {
            setCurrentUser(user);
          }
          setLoading(false);
        });
        return () => unsubscribeDb();
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });
    return unsubscribeAuth;
  }, []);

  // Am adăugat noile funcții aici în value
  const value = { 
    currentUser, 
    login, 
    signup, 
    logout, 
    loginWithGoogle, 
    getStatistici,
    verificaDacaEGata,
    marcheazaLectieTerminata
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}