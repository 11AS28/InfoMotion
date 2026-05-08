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
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- LOGICĂ AUTENTIFICARE ---

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
        progres: {} // Obiect gol pentru început
      });
    }
    return user;
  }

  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  // --- LOGICĂ PROGRES ---

  async function marcheazaLectieTerminata(lectieId) {
    if (!currentUser) return;
    const userRef = doc(db, 'users', currentUser.uid);
    
    // Folosim dot notation pentru a face update DOAR la câmpul specific din obiectul progres
    try {
      await updateDoc(userRef, {
        [`progres.${lectieId}`]: true
      });
    } catch (e) {
      // Dacă documentul nu are încă obiectul 'progres', îl creăm cu setDoc merge
      await setDoc(userRef, {
        progres: { [lectieId]: true }
      }, { merge: true });
    }
  }

  async function verificaDacaEGata(lectieId) {
    if (!currentUser) return false;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        return data.progres ? !!data.progres[lectieId] : false;
      }
    } catch (e) {
      console.error("Eroare verificare progres:", e);
    }
    return false;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    login,
    signup,
    logout,
    loginWithGoogle,
    marcheazaLectieTerminata,
    verificaDacaEGata
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}