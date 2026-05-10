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
import { doc, setDoc, getDoc, updateDoc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
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




    // --- FUNCȚIE NOUĂ PENTRU STREAK ÎN FIREBASE ---
  const actualizeazaStreak = async () => {
    if (!currentUser) return;

    const userRef = doc(db, 'users', currentUser.uid);
    const azi = new Date().toLocaleDateString("en-US"); // Formatăm data ca "MM/DD/YYYY"
    
    // Extragem datele actuale. Dacă nu există, folosim valori default
    const streakCurent = currentUser.streakCount || 0;
    const ultimaLogare = currentUser.lastLoginDate;

    let noulStreak = streakCurent;

    if (!ultimaLogare) {
      // Prima dată când intră vreodată
      noulStreak = 1;
    } else if (ultimaLogare === azi) {
      // S-a logat deja azi, nu facem nimic
      return; 
    } else {
      // Calculăm diferența de zile
      const dataUltimaLogare = new Date(ultimaLogare);
      const dataAzi = new Date(azi);
      const diffTime = Math.abs(dataAzi - dataUltimaLogare);
      const diffZile = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffZile === 1) {
        noulStreak += 1; // S-a logat și ieri -> Creștem
      } else if (diffZile > 1) {
        noulStreak = 1;  // A ratat o zi -> Resetăm la 1
      }
    }

    // Salvăm noul streak în Firebase (folosim setDoc cu merge: true ca să nu ștergem restul datelor)
    try {
      await setDoc(userRef, {
        streakCount: noulStreak,
        lastLoginDate: azi
      }, { merge: true });
      // Notă: La următorul refresh, currentUser din state va avea automat noile date 
      // pentru că folosești onSnapshot în useEffect!
    } catch (error) {
      console.error("Eroare la actualizarea streak-ului:", error);
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
  async function login(identificator, password) {
    let emailDeLogare = identificator;

    // Dacă NU conține '@', presupunem că este un username
    if (!identificator.includes('@')) {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where("nume", "==", identificator));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("auth/user-not-found"); // Aruncăm eroare dacă username-ul nu există
      }
      
      // Dacă îl găsim, extragem emailul asociat lui
      emailDeLogare = querySnapshot.docs[0].data().email;
    }

    // Apoi facem logarea standard cu Firebase
    return signInWithEmailAndPassword(auth, emailDeLogare, password);
  }


  
  
   async function signup(email, password, username) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Salvăm username-ul în Firestore
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      nume: username, // Folosim câmpul tău existent 'nume' pentru username
      email: user.email,
      dataCrearii: new Date(),
      progres: {},
      codeforcesHandle: "",
      streakCount: 0
    });

    // Trimitem emailul de verificare
    await sendEmailVerification(user);
    return userCredential;
  }

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const unsubscribeDb = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            const isDev = user.email === "smmaria@gmai.com";


            setCurrentUser({ ...user, ...docSnap.data(),emailVerified: isDev ? true:user.emailVerified });
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

const updateUsername = async (newUsername) => {
  if (!currentUser) return;
  
  // 1. Curățăm username-ul de spații inutile
  const cleanUsername = newUsername.trim();
  
  if (cleanUsername.length < 3) {
    throw new Error("Username-ul trebuie să aibă cel puțin 3 caractere.");
  }

  const userRef = doc(db, 'users', currentUser.uid);
  
  try {
    // 2. Actualizăm câmpul 'nume' în Firestore
    await updateDoc(userRef, {
      nume: cleanUsername
    });
    
    console.log("Username actualizat cu succes!");
  } catch (error) {
    console.error("Eroare la actualizarea username-ului:", error);
    throw error;
  }
};

  // Obiectul value conține tot ce se folosește în context
 const value = { 
    currentUser, 
    login, 
    signup, 
    logout, 
    loginWithGoogle, 
    getStatistici,
    verificaDacaEGata,
    marcheazaLectieTerminata,
    actualizeazaStreak,
    verificaProblemaCodeforces // <--- ADAUGĂ LINIA ASTA AICI
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}