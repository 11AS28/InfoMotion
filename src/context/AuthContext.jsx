import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification 
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { lessonsData } from '../lessonsData';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Funcția pentru Codeforces
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
  
  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Imediat după ce s-a creat contul, trimitem emailul
        return sendEmailVerification(userCredential.user);
      });
  }

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

  // Obiectul value conține tot ce se folosește în context
  const value = { 
    currentUser, 
    login, 
    signup, 
    logout, 
    loginWithGoogle, 
    getStatistici,
    updateCodeforcesHandle, 
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