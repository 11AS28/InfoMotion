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
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  collection, 
  query, 
  where, 
  getDocs, 
  increment, 
  arrayUnion,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { lessonsData } from '../lessonsData';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalLectii, setTotalLectii] = useState(0);
  const [lectii, setLectii] = useState([]);

  // ─── 🛡️ FUNCȚIE AJUTĂTOARE PENTRU LOGURI DE SECURITATE (VPS / LOCAL) ──────────
  const trimiteLogSecuritate = async (action, username, message) => {
  try {
    // 1. Încearcă să ia URL-ul din variabilele de mediu (Vite folosește import.meta.env în loc de process.env)
    // 2. Dacă nu găsește nimic, face fallback automat pe origin-ul curent al paginii sau pe localhost:5000
    const API_URL = import.meta.env?.VITE_API_URL || 
                    (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
                      ? 'http://localhost:5000' 
                      : window.location.origin);
    
    await fetch(`${API_URL}/api/security-log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        username: username || 'ANONYMOUS',
        message
      })
    });
  } catch (error) {
    console.error("Eroare silențioasă la trimiterea logului de securitate:", error);
  }
};
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
          
          // 📝 LOG: Validare cu succes
          await trimiteLogSecuritate('CF_HANDLE_VALIDATED', currentUser.nume, `A asociat cu succes handle-ul Codeforces: [${handle}]`);
          return { success: true };
        }
        
        // 🚨 LOG: Încercare eșuată (Posibil ca cineva să încerce să fure contul altui elev)
        await trimiteLogSecuritate('CF_VALIDATION_FAILED', currentUser.nume, `Tentativă eșuată de asociere pentru handle-ul [${handle}] - Codul secret lipsește din Organization.`);
        return { success: false, error: "Codul nu a fost găsit în câmpul 'Organization'. Ai apăsat 'Save' pe Codeforces?" };
      }
      return { success: false, error: "Handle-ul nu există pe Codeforces." };
    } catch (err) {
      return { success: false, error: "Conexiune eșuată cu API-ul Codeforces." };
    }
  };

  const getStatistici = () => {
    if (!currentUser) return { terminate: 0, total: totalLectii, progresProcent: 0 };
    const progresUser = currentUser.progres || {};
    
    const terminate = Object.keys(progresUser).filter(id => {
      const dateProgres = progresUser[id];
      if (!dateProgres) return false;
      if (dateProgres.status === 'complet') return true;
      if (dateProgres === true || dateProgres === 'complet') return true;
      if (typeof dateProgres === 'object' && !dateProgres.status) return true;
      return false;
    }).length;

    return {
      terminate,
      total: totalLectii,
      progresProcent: totalLectii > 0 ? (terminate / totalLectii) * 100 : 0
    };
  };

  const verificaDacaEGata = (idLectie) => {
    if (!currentUser || !currentUser.progres) return false;
    return currentUser.progres[idLectie]?.status === 'complet';
  };

  const marcheazaLectieTerminata = async (idLectie) => {
    if (!currentUser) return;
    const userRef = doc(db, 'users', currentUser.uid);
    try {
      await updateDoc(userRef, {
        [`progres.${idLectie}`]: { terminatLa: serverTimestamp(), status: 'complet' }
      });
      // 📝 LOG OPTIONAL: Să știi când un elev termină o lecție
      await trimiteLogSecuritate('LESSON_COMPLETED', currentUser.nume, `A terminat lecția cu ID: ${idLectie}`);
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
    const freezesDisponibile = currentUser.streakFreezes || 0;

    let noulStreak = streakCurent;
    let freezesNoi = freezesDisponibile;

    if (!ultimaLogare) {
      noulStreak = 1;
    } else if (ultimaLogare === azi) {
      return;
    } else {
      const diffTime = Math.abs(new Date(azi) - new Date(ultimaLogare));
      const diffZile = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffZile === 1) {
        noulStreak += 1;
      } else if (diffZile > 1) {
        if (freezesDisponibile > 0) {
          freezesNoi -= 1; 
          noulStreak = streakCurent; 
          
          try {
            await updateDoc(userRef, { streakFreezes: freezesNoi });
            await addDoc(collection(db, "users", currentUser.uid, "notifications"), {
              type: "streak_inghetat",
              text: ` Scutul tău de Streak a fost activat! Ziua de ieri a fost acoperită, iar streak-ul tău a fost blocat la ${streakCurent} zile.`,
              read: false,
              createdAt: serverTimestamp()
            });
            // 📝 LOG: Activare freeze
            await trimiteLogSecuritate('STREAK_FROZEN', currentUser.nume, `S-a activat scutul de streak. Scuturi rămase: ${freezesNoi}`);
          } catch (e) {
            console.error("Eroare trimitere notificare freeze:", e);
          }
        } else {
          noulStreak = 1; 
          if (streakCurent > 0) {
            try {
              await addDoc(collection(db, "users", currentUser.uid, "notifications"), {
                type: "streak_pierdut",
                text: ` Ai lipsit prea mult! Din păcate ai pierdut streak-ul tău de ${streakCurent} zile. Capul sus, hai să începem unul nou azi!`,
                read: false,
                createdAt: serverTimestamp()
              });
              // 🚨 LOG: Resetare streak
              await trimiteLogSecuritate('STREAK_LOST', currentUser.nume, `A pierdut un streak de ${streakCurent} zile.`);
            } catch (e) {
              console.error("Eroare trimitere notificare streak pierdut:", e);
            }
          }
        }
      }
    }

    try {
      await setDoc(userRef, { streakCount: noulStreak, lastLoginDate: azi }, { merge: true });
    } catch (error) {
      console.error("Eroare la scrierea streak-ului:", error);
    }
  };

  function logout() { 
    if (currentUser) {
      trimiteLogSecuritate('USER_LOGOUT', currentUser.nume, 'Utilizatorul s-a delogat manual.');
    }
    return signOut(auth); 
  }

  async function login(identificator, password) {
    let emailDeLogare = identificator;
    if (!identificator.includes('@')) {
      const q = query(collection(db, 'users'), where("nume", "==", identificator));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        await trimiteLogSecuritate('LOGIN_FAILED', identificator, `Tentativă de autentificare cu username inexistent.`);
        throw new Error("auth/user-not-found");
      }
      emailDeLogare = querySnapshot.docs[0].data().email;
    }
    
    try {
      const cred = await signInWithEmailAndPassword(auth, emailDeLogare, password);
      await trimiteLogSecuritate('LOGIN_SUCCESS', identificator, `Autentificare reușită.`);
      return cred;
    } catch (err) {
      await trimiteLogSecuritate('LOGIN_FAILED', identificator, `Parolă greșită la logare.`);
      throw err;
    }
  }

  async function signup(email, password, username, role = 'student') {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userProfile = {
      uid: user.uid,
      nume: username,
      email: user.email,
      role: role,
      dataCrearii: new Date(),
    };

    if (role === 'student') {
      userProfile.progres = {};
      userProfile.codeforcesHandle = "";
      userProfile.streakCount = 0;
      userProfile.puncteTotale = 0;
      userProfile.puncte = 0;
      userProfile.problemeRezolvateCount = 0;
      userProfile.temeDeblocate = ['theme_default'];
      userProfile.temaEchipata = 'theme_default';
      userProfile.titluriDeblocate = [];
      userProfile.titluEchipat = "";
      userProfile.hearts = 3;
      userProfile.streakFreezes = 0;
      userProfile.problemeCustomRezolvate = [];
      userProfile.lastHeartRegen = new Date().toISOString();
    } else if (role === 'teacher') {
      userProfile.clase = [];
      userProfile.isVerifiedTeacher = false;
    }

    await setDoc(doc(db, 'users', user.uid), userProfile);
    
    // 📝 LOG SECURE: Cont nou înregistrat
    await trimiteLogSecuritate('USER_SIGNUP', username, `Cont nou creat cu succes [Rol: ${role}] [Email: ${email}]`);
    
    await sendEmailVerification(user);
    return userCredential;
  }

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
        role: 'student',
        photoURL: user.photoURL,
        dataCrearii: new Date(),
        progres: {},
        codeforcesHandle: "",
        puncteTotale: 0,
        puncte: 0,
        problemeRezolvateCount: 0,
        hearts: 3,
        problemeCustomRezolvate: [],
        streakFreezes: 0,
        lastHeartRegen: new Date().toISOString(),
        temeDeblocate: ['theme_default'],
        temaEchipata: 'theme_default',
        titluriDeblocate: [],
        titluEchipat: ""
      });
      await trimiteLogSecuritate('GOOGLE_SIGNUP', user.displayName, `Cont nou înregistrat prin Google.`);
    } else {
      await trimiteLogSecuritate('GOOGLE_LOGIN', user.displayName, `Logare reușită prin intermediul Google.`);
    }
    return user;
  }

  const cumparaTema = async (idTema, pretTema) => {
    if (!currentUser) return { success: false, error: "Trebuie să fii logat!" };
    const puncteCurente = currentUser.puncte || 0;

    if (puncteCurente < pretTema) return { success: false, error: "Nu ai destule puncte în portofel!" };
    const temeDeblocate = currentUser.temeDeblocate || ['theme_default'];
    if (temeDeblocate.includes(idTema)) return { success: false, error: "Ai cumpărat deja această temă!" };

    const userRef = doc(db, 'users', currentUser.uid);
    try {
      await setDoc(userRef, {
        puncte: increment(-pretTema),
        temeDeblocate: arrayUnion(idTema)
      }, { merge: true });
      
      await trimiteLogSecuritate('SHOP_THEME_BUY', currentUser.nume, `A cumpărat tema [${idTema}] pentru ${pretTema} puncte.`);
      return { success: true };
    } catch (error) {
      return { success: false, error: "Eroare la procesarea tranzacției." };
    }
  };

  const cumparaInima = async (cantitate, pretInima) => {
    if (!currentUser) return { success: false, error: "Trebuie să fii logat!" };
    const inimiCurente = currentUser.hearts ?? 3;
    if (inimiCurente + cantitate > 3) return { success: false, error: `Nu poți avea mai mult de 3 inimi!` };

    const puncteCurente = currentUser.puncte || 0;
    if (puncteCurente < pretInima) return { success: false, error: "Nu ai destule puncte!" };

    const userRef = doc(db, 'users', currentUser.uid);
    try {
      await updateDoc(userRef, {
        puncte: increment(-pretInima),
        hearts: increment(cantitate)
      });
      await trimiteLogSecuritate('SHOP_HEART_BUY', currentUser.nume, `A cumpărat ${cantitate} inimi.`);
      return { success: true };
    } catch (error) {
      return { success: false, error: "Tranzacție eșuată." };
    }
  };

  const cumparaStreakFreeze = async (cantitate, pretFreeze) => {
    if (!currentUser) return { success: false, error: "Trebuie să fii logat!" };
    const freezesCurente = currentUser.streakFreezes || 0;
    if (freezesCurente + cantitate > 6) return { success: false, error: `Nu poți avea mai mult de 6 scuturi Streak Freeze!` };

    const puncteCurente = currentUser.puncte || 0;
    if (puncteCurente < pretFreeze) return { success: false, error: "Nu ai destule puncte!" };

    const userRef = doc(db, 'users', currentUser.uid);
    try {
      await updateDoc(userRef, {
        puncte: increment(-pretFreeze),
        streakFreezes: increment(cantitate)
      });
      await trimiteLogSecuritate('SHOP_FREEZE_BUY', currentUser.nume, `A cumpărat ${cantitate} scuturi Streak Freeze.`);
      return { success: true };
    } catch (error) {
      return { success: false, error: "Tranzacție eșuată." };
    }
  };

  const scadeInima = async (cantitate = 1) => {
    if (!currentUser) return;
    const userRef = doc(db, 'users', currentUser.uid);
    try {
      await updateDoc(userRef, { hearts: increment(-cantitate) });
      await trimiteLogSecuritate('USER_LOST_HEART', currentUser.nume, `A greșit și a pierdut ${cantitate} inimă/inimi.`);
    } catch (error) {
      console.error("Eroare la scădere inimă:", error);
    }
  };

  const verificaRegenerareInimi = async (userDocData, userRef) => {
    const acum = new Date();
    const ultimaRegenerare = userDocData.lastHeartRegen ? new Date(userDocData.lastHeartRegen) : acum;
    const inimiCurente = userDocData.hearts ?? 3;

    if (inimiCurente >= 3) return;

    const diffInMs = acum - ultimaRegenerare;
    const oreTrecute = Math.floor(diffInMs / (1000 * 60 * 60));

    if (oreTrecute >= 24) {
      const inimiDeAdaugat = Math.floor(oreTrecute / 24);
      const noulNumarDeInimi = Math.min(3, inimiCurente + inimiDeAdaugat);
      const timpNou = new Date(ultimaRegenerare.getTime() + inimiDeAdaugat * 24 * 60 * 60 * 1000);

      await updateDoc(userRef, {
        hearts: noulNumarDeInimi,
        lastHeartRegen: timpNou.toISOString()
      });
      await trimiteLogSecuritate('HEART_AUTO_REGEN', userDocData.nume, `Inimile s-au regenerat automat la numărul de: ${noulNumarDeInimi}`);
    }
  };

  const echipeazaTema = async (idTema) => {
    if (!currentUser) return { success: false, error: "Trebuie să fii logat!" };
    const temeDeblocate = currentUser.temeDeblocate || ['theme_default'];
    if (!temeDeblocate.includes(idTema)) return { success: false, error: "Nu deții această temă!" };

    const userRef = doc(db, 'users', currentUser.uid);
    try {
      await setDoc(userRef, { temaEchipata: idTema }, { merge: true });
      return { success: true };
    } catch (error) {
      return { success: false, error: "Nu s-a putut echipa tema." };
    }
  };

  const cumparaTitlu = async (idTitlu, pretTitlu) => {
    if (!currentUser) return { success: false, error: "Trebuie să fii logat!" };
    const puncteCurente = currentUser.puncte || 0;
    if (puncteCurente < pretTitlu) return { success: false, error: "Nu ai destule puncte în portofel!" };

    const titluriDeblocate = currentUser.titluriDeblocate || [];
    if (titluriDeblocate.includes(idTitlu)) return { success: false, error: "Deții deja acest titlu!" };

    const userRef = doc(db, 'users', currentUser.uid);
    try {
      await updateDoc(userRef, {
        puncte: increment(-pretTitlu),
        titluriDeblocate: arrayUnion(idTitlu)
      });
      await trimiteLogSecuritate('SHOP_TITLE_BUY', currentUser.nume, `A cumpărat titlul de profil [${idTitlu}]`);
      return { success: true };
    } catch (error) {
      return { success: false, error: "Eroare la procesarea tranzacției." };
    }
  };

  const echipeazaTitlu = async (idTitlu) => {
    if (!currentUser) return { success: false, error: "Trebuie să fii logat!" };

    const userRef = doc(db, 'users', currentUser.uid);
    if (idTitlu === "") {
      try {
        await updateDoc(userRef, { titluEchipat: "" });
        return { success: true };
      } catch (error) { return { success: false, error: "Eroare" }; }
    }

    const titluriDeblocate = currentUser.titluriDeblocate || [];
    if (!titluriDeblocate.includes(idTitlu)) return { success: false, error: "Nu deții acest titlu!" };

    try {
      await updateDoc(userRef, { titluEchipat: idTitlu });
      return { success: true };
    } catch (error) {
      return { success: false, error: "Nu s-a putut echipa titlul." };
    }
  };

  useEffect(() => {
    const preiaSiIncarcaLectii = async () => {
      try {
        const cachedLectii = localStorage.getItem("infoMotion_lectii");
        if (cachedLectii) {
          const dateLectii = JSON.parse(cachedLectii);
          setLectii(dateLectii);
          setTotalLectii(dateLectii.length);
          return;
        }

        const querySnapshot = await getDocs(collection(db, 'lectii'));
        const listaLectii = [];
        querySnapshot.forEach((doc) => {
          listaLectii.push({ id: doc.id, ...doc.data() });
        });

        localStorage.setItem("infoMotion_lectii", JSON.stringify(listaLectii));
        setLectii(listaLectii);
        setTotalLectii(querySnapshot.size);
      } catch (error) {
        console.error("Eroare:", error);
      }
    };

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        preiaSiIncarcaLectii();
        const userRef = doc(db, 'users', user.uid);
        const unsubscribeDb = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const isDev = user.email === "smmaria@gmail.com";
            const data = docSnap.data();

            if (data.role === 'student' && (data.hearts ?? 3) < 3)
              verificaRegenerareInimi(data, userRef);

            setCurrentUser({ ...user, ...docSnap.data(), emailVerified: isDev ? true : user.emailVerified });
          } else {
            setCurrentUser(user);
          }
          setLoading(false);
        });
        return () => unsubscribeDb();
      } else {
        setCurrentUser(null);
        setLectii([]); 
        setTotalLectii(0);
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
      
      // 📝 LOG SECURE: Schimbare nume utilizator
      await trimiteLogSecuritate('USER_NAME_CHANGED', currentUser.nume, `Și-a modificat username-ul în: [${cleanUsername}]`);
    } catch (error) {
      console.error("Eroare la actualizarea username-ului:", error);
      throw error;
    }
  };

  async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      await trimiteLogSecuritate('PASSWORD_RESET_REQUEST', email, `A cerut un email de resetare a parolei.`);
    } catch (error) {
      alert("Eroare la trimiterea email-ului de resetare: " + error.message);
      throw error;
    }
  }

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
        puncteTotale: increment(puncteDeAdaugat),
        puncte: increment(puncteDeAdaugat)
      }, { merge: true });
    } catch (error) {
      console.error("Eroare la acordarea punctelor:", error);
    }
  };

  const value = {
    currentUser,
    login,
    lectii,
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
    cumparaTema,
    echipeazaTema,
    cumparaInima,
    cumparaStreakFreeze,
    scadeInima,
    cumparaTitlu,
    echipeazaTitlu
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}