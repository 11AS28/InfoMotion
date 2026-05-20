import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc, updateDoc, onSnapshot, collection, query, where, getDocs, increment } from 'firebase/firestore';
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
      await updateDoc(userRef, { codeforcesHandle: handle });
      console.log("Handle salvat cu succes:", handle);
    } catch (error) {
      console.error("Eroare la salvarea handle-ului:", error);
    }
  };

  const generateVerificationCode = () => {
    if (!currentUser) return "";
    return `INFOMOTION-${currentUser.uid.substring(0, 5).toUpperCase()}`;
  };

  const verifyHandleOwnership = async (handle) => {
    const secret = generateVerificationCode();
    try {
      const response = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
      const data = await response.json();
      if (data.status === "OK") {
        const user = data.result[0];
        const isMatch = user.organization && user.organization.includes(secret);
        if (isMatch) {
          const userRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userRef, { codeforcesHandle: handle, cfValidat: true });
          return { success: true };
        }
        return { success: false, error: "Codul nu a fost găsit în câmpul 'Organization'. Ai apăsat 'Save' pe Codeforces?" };
      }
      return { success: false, error: "Handle-ul nu există pe Codeforces." };
    } catch (err) {
      return { success: false, error: "Conexiune eșuată cu API-ul Codeforces." };
    }
  };

  const getStatistici = () => {
    if (!currentUser) return { terminate: 0, total: lessonsData.length, progresProcent: 0 };
    const terminate = currentUser.lectiiTerminate ? currentUser.lectiiTerminate.length : 0;
    const totalLectiiReale = lessonsData.length;
    return {
      terminate,
      total: totalLectiiReale,
      progresProcent: totalLectiiReale > 0 ? (terminate / totalLectiiReale) * 100 : 0
    };
  };

  const verificaDacaEGata = (idLectie) => {
    if (!currentUser) return false;
    if (currentUser.lectiiTerminate) return currentUser.lectiiTerminate.includes(idLectie);
    if (currentUser.progres) return !!currentUser.progres[idLectie];
    return false;
  };

  const marcheazaLectieTerminata = async (idLectie) => {
    if (!currentUser) return;
    const userRef = doc(db, 'users', currentUser.uid);
    try {
      await updateDoc(userRef, {
        [`progres.${idLectie}`]: { terminatLa: new Date(), status: 'complet' }
      });
    } catch (error) {
      console.error("Eroare la salvarea progresului:", error);
    }
  };

  const actualizeazaStreak = async () => {
    if (!currentUser) return;
    const userRef = doc(db, 'users', currentUser.uid);
    const azi = new Date().toLocaleDateString("en-US");
    const streakCurent = currentUser.streakCount || 0;
    const ultimaLogare = currentUser.lastLoginDate;
    let noulStreak = streakCurent;

    if (!ultimaLogare) {
      noulStreak = 1;
    } else if (ultimaLogare === azi) {
      return;
    } else {
      const diffTime = Math.abs(new Date(azi) - new Date(ultimaLogare));
      const diffZile = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffZile === 1) noulStreak += 1;
      else if (diffZile > 1) noulStreak = 1;
    }

    try {
      await setDoc(userRef, { streakCount: noulStreak, lastLoginDate: azi }, { merge: true });
    } catch (error) {
      console.error("Eroare la actualizarea streak-ului:", error);
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
        progres: {},
        codeforcesHandle: "",
        puncteTotale: 0,
        problemeRezolvateCount: 0
      });
    }
    return user;
  }

  function logout() { return signOut(auth); }

  async function login(identificator, password) {
    let emailDeLogare = identificator;
    if (!identificator.includes('@')) {
      const q = query(collection(db, 'users'), where("nume", "==", identificator));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) throw new Error("auth/user-not-found");
      emailDeLogare = querySnapshot.docs[0].data().email;
    }
    return signInWithEmailAndPassword(auth, emailDeLogare, password);
  }

  async function signup(email, password, username) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      nume: username,
      email: user.email,
      dataCrearii: new Date(),
      progres: {},
      codeforcesHandle: "",
      streakCount: 0,
      puncteTotale: 0,
      problemeRezolvateCount: 0
    });
    await sendEmailVerification(user);
    return userCredential;
  }

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const unsubscribeDb = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const isDev = user.email === "smmaria@gmai.com";
            setCurrentUser({ ...user, ...docSnap.data(), emailVerified: isDev ? true : user.emailVerified });
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
    const targetId = problemId.replace('/', '').trim().toUpperCase();
    try {
      const response = await fetch(`https://codeforces.com/api/user.status?handle=${currentUser.codeforcesHandle}&from=1&count=1000`);
      const data = await response.json();
      if (data.status === "OK") {
        return data.result.some(submission => {
          const p = submission.problem;
          if (!p.contestId || !p.index) return false;
          return `${p.contestId}${p.index}`.toUpperCase() === targetId && submission.verdict === "OK";
        });
      }
    } catch (error) {
      console.error("Eroare la API-ul Codeforces:", error);
    }
    return false;
  };

  const updateUsername = async (newUsername) => {
    if (!currentUser) return;
    const cleanUsername = newUsername.trim();
    if (cleanUsername.length < 3) throw new Error("Username-ul trebuie să aibă cel puțin 3 caractere.");
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), { nume: cleanUsername });
    } catch (error) {
      console.error("Eroare la actualizarea username-ului:", error);
      throw error;
    }
  };

  async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      alert("Eroare la trimiterea email-ului de resetare: " + error.message);
      throw error;
    }
  }

  // ✅ FIX PRINCIPAL:
  // - Acceptă număr direct din Arena (ex: acordaPuncte(40)) SAU string ('quiz' etc.)
  // - Folosește increment() din Firestore în loc de calcul manual
  //   → nu mai depinde de currentUser.puncteTotale care putea fi undefined/NaN
  // - Folosește setDoc cu merge:true în loc de updateDoc
  //   → funcționează chiar dacă câmpul nu există încă în Firestore
  const acordaPuncte = async (tip) => {
    if (!currentUser) return;
    const userRef = doc(db, 'users', currentUser.uid);

    let puncteDeAdaugat = 0;
    let extraData = {};

    if (typeof tip === 'number') {
      puncteDeAdaugat = tip;
    } else if (tip === 'quiz') {
      puncteDeAdaugat = 10;
    } else if (tip === 'daily_normal') {
      puncteDeAdaugat = 30;
      extraData.problemeRezolvateCount = increment(1);
    } else if (tip === 'daily_sprinter') {
      puncteDeAdaugat = 50;
      extraData.problemeRezolvateCount = increment(1);
    }

    if (puncteDeAdaugat === 0) return;

    try {
      await setDoc(userRef, {
        ...extraData,
        puncteTotale: increment(puncteDeAdaugat)
      }, { merge: true });
    } catch (error) {
      console.error("Eroare la acordarea punctelor:", error);
    }
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    loginWithGoogle,
    getStatistici,
    verificaDacaEGata,
    acordaPuncte,
    verifyHandleOwnership,
    generateVerificationCode,
    marcheazaLectieTerminata,
    actualizeazaStreak,
    verificaProblemaCodeforces,
    resetPassword,
    updateUsername,
    updateCodeforcesHandle,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
