import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification ,
  sendPasswordResetEmail
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


const generateVerificationCode = () => {
  if (!currentUser) return "";
  // Generăm un cod scurt și unic: ex INFOMOTION-A1B2C
  return `INFOMOTION-${currentUser.uid.substring(0, 5).toUpperCase()}`;
};

const verifyHandleOwnership = async (handle) => {
  const secret = generateVerificationCode();
  try {
    // Interogăm API-ul public Codeforces
    const response = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
    const data = await response.json();

    if (data.status === "OK") {
      const user = data.result[0];
      
      // VERIFICARE CRITICĂ: Căutăm codul nostru în câmpul 'organization'
      const isMatch = user.organization && user.organization.includes(secret);

      if (isMatch) {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          codeforcesHandle: handle,
          cfValidat: true // Deblochează Arena
        });
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
    // Dacă nu e logat, dăm 0
    if (!currentUser) return { terminate: 0, total: lessonsData.length, progresProcent: 0 };
    
    // 1. AICI E REPARAȚIA: Numărăm din vectorul 'lectiiTerminate', exact unde salvează QuizModal-ul!
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
    // 2. Verificăm progresul tot în noul vector
    if (currentUser.lectiiTerminate) {
      return currentUser.lectiiTerminate.includes(idLectie);
    }
    // Fallback pentru utilizatorii vechi care aveau datele în "progres" (opțional)
    if (currentUser.progres) {
      return !!currentUser.progres[idLectie];
    }
    return false;
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

  // REPARAȚIE 1: Curățăm problemId-ul primit (ex: din "158/A" facem "158A")
  const targetId = problemId.replace('/', '').trim().toUpperCase();

  try {
    // REPARAȚIE 2: Creștem count la 1000 ca să găsim și probleme mai vechi
    const response = await fetch(`https://codeforces.com/api/user.status?handle=${currentUser.codeforcesHandle}&from=1&count=1000`);
    const data = await response.json();

    if (data.status === "OK") {
      const rezolvata = data.result.some(submission => {
        const p = submission.problem;
        if (!p.contestId || !p.index) return false;

        // Construim ID-ul din submisie (ex: 158 + A = "158A")
        const currentId = `${p.contestId}${p.index}`.toUpperCase();
        
        // Verificăm potrivirea și verdictul (OK înseamnă Accepted)
        return currentId === targetId && submission.verdict === "OK";
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

  async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
   
  } catch (error) {
    alert("Eroare la trimiterea email-ului de resetare: " + error.message);
    throw error;
  }
}

const acordaPuncte = async (tip) => {
  if (!currentUser) return;
  const userRef = doc(db, 'users', currentUser.uid);
  
  let puncteDeAdaugat = 0;
  let updateData = {};

  if (tip === 'quiz') {
    puncteDeAdaugat = 10; // Punctajul tău pentru Quiz
  } else if (tip === 'daily_normal') {
    puncteDeAdaugat = 30; // Punctaj normal Problema Zilei
    updateData.problemeRezolvateCount = (currentUser.problemeRezolvateCount || 0) + 1;
  } else if (tip === 'daily_sprinter') {
    puncteDeAdaugat = 50; // Punctaj Sprinter (primii 3)
    updateData.problemeRezolvateCount = (currentUser.problemeRezolvateCount || 0) + 1;
  }

  try {
    await updateDoc(userRef, {
      ...updateData,
      puncteTotale: (currentUser.puncteTotale || 0) + puncteDeAdaugat
    });
  } catch (error) {
    console.error("Eroare la acordarea punctelor:", error);
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
    acordaPuncte,
    verifyHandleOwnership,
    generateVerificationCode,
    marcheazaLectieTerminata,
    actualizeazaStreak,
    verificaProblemaCodeforces,
    resetPassword,
  };





  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}