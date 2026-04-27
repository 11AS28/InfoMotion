import { db } from "../firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

// Marchează o lecție ca fiind terminată
export const completeazaLectie = async (userId, lessonId) => {
  try {
    const progresRef = doc(db, "users", userId, "progres", lessonId);
    await setDoc(progresRef, {
      completata: true,
      dataFinalizarii: serverTimestamp()
    });
    console.log("Progres salvat cu succes!");
  } catch (error) {
    console.error("Eroare la salvarea progresului:", error);
  }
};

// Verifică dacă o lecție este deja terminată
export const verificaProgres = async (userId, lessonId) => {
  const progresRef = doc(db, "users", userId, "progres", lessonId);
  const docSnap = await getDoc(progresRef);
  return docSnap.exists();
};