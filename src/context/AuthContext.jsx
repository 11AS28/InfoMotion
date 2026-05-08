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
import { lessonsData } from '../lessonsData';
const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);


  const updateCodeforcesHandle = async (handle) => {
    if (!currentUser) return;
    const userRef = doc(db, 'users', currentUser.uid);
    try {
      await updateDoc(userRef, {
        codeforcesHandle: handle
      });
      // Nu e nevoie de setState, onSnapshot se ocupă de refresh
    } catch (error) {
      console.error("Eroare la salvarea handle-ului:", error);
    }
  };
  // Funcția care calculează statisticile
  const getStatistici = () => {
    if (!currentUser || !currentUser.progres) return { terminate: 0, progresProcent: 0 };
    
    // 1. Calculăm numărul de lecții terminate din obiectul "progres"
    const terminate = Object.keys(currentUser.progres).length;
    
    // 2. AFLĂM NUMĂRUL REAL de lecții din fișierul tău de date
    const totalLectiiReale = lessonsData.length; 
    
    // 3. Calculăm procentul dinamic
    const progresProcent = totalLectiiReale > 0 
      ? (terminate / totalLectiiReale) * 100 
      : 0;

    return {
      terminate,
      total: totalLectiiReale, // Trimitem și totalul ca să îl poți afișa (ex: "5 din 5")
      progresProcent
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