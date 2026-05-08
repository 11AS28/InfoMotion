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
import { lessonsData } from '../lessonsData'; // Asigură-te că drumul e corect

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. FUNCȚIA PENTRU CODEFORCES (LIPSA DIN VALUE CEL MAI PROBABIL)
  const updateCodeforcesHandle = async (handle) => {
    if (!currentUser) return;
    const userRef = doc(db, 'users', currentUser.uid);
    try {
      await updateDoc(userRef, {
        codeforcesHandle: handle
      });
      console.log("Handle salvat cu succes:", handle);
    } catch (error) {
      console.error("Eroare la salvarea handle-ului:", error);
    }
  };

  const getStatistici = () => {
    if (!currentUser || !currentUser.progres) return { terminate: 0, total: lessonsData.length, progresProcent: 0 };
    const terminate = Object.keys(currentUser.progres).length;
    const totalLectiiReale = lessonsData.length; 
    return {
      terminate,
      total: totalLectiiReale,
      progresProcent: totalLectiiReale > 0 ? (terminate / totalLectiiReale) * 100 : 0
    };
  };

  const verificaDacaEGata = (idLectie) => {
    if (!currentUser || !currentUser.progres) return false;
    return !!currentUser.progres[idLectie];
  };

  const marcheazaLectieTerminata = async (idLectie) => {
    if (!currentUser) return;
    const userRef = doc(db, 'users', currentUser.uid);
    try {
      await updateDoc(userRef, {
        [`progres.${idLectie}`]: {
          terminatLa: new Date(),
          status: 'complet'
        }
      });
    } catch (error) {
      console.error("Eroare la salvarea progresului:", error);
    }
  };

  // --- LOGIN / LOGOUT LOGIC ---
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
        progres: {},
        codeforcesHandle: "" // Inițializăm gol
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

  const verificaProblemaCodeforces = async (problemId) => {
  if (!currentUser?.codeforcesHandle) {
    alert("Te rugăm să îți setezi Codeforces Handle-ul în profil mai întâi!");
    return false;
  }

  try {
    const response = await fetch(`https://codeforces.com/api/user.status?handle=${currentUser.codeforcesHandle}&from=1&count=50`);
    const data = await response.json();

    if (data.status === "OK") {
      // Căutăm în ultimele 50 de trimiteri
      const rezolvata = data.result.some(submission => {
        const p = submission.problem;
        const currentId = `${p.contestId}${p.index}`; // ex: "158A"
        return currentId === problemId && submission.verdict === "OK";
      });
      return rezolvata;
    }
  } catch (error) {
    console.error("Eroare la API-ul Codeforces:", error);
  }
  return false;
};

  // 2. OBIECTUL VALUE (AICI E CHEIA - TREBUIE SĂ CONȚINĂ TOT CE FOLOSEȘTI ÎN SIDEBAR)
  const value = { 
    currentUser, 
    login, 
    signup, 
    logout, 
    loginWithGoogle, 
    getStatistici,
    updateCodeforcesHandle, // <--- DACĂ LIPSEȘTE ASTA, DĂ EROAREA DIN IMAGINE
    verificaDacaEGata,
    marcheazaLectieTerminata,
    verificaProblemaCodeforces
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}