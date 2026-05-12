// Arena.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

function Arena() {
  const { currentUser, acordaPuncte, verificaProblemaCodeforces } = useAuth();
  const [dailyProblem, setDailyProblem] = useState(null);
  const [solvers, setSolvers] = useState([]);

  // 1. Extragem problema zilei bazată pe data curentă (ex: problema_12_05_2026)
  useEffect(() => {
    const fetchArena = async () => {
      const dataAzi = new Date().toLocaleDateString('ro-RO').replaceAll('.', '_');
      const docRef = doc(db, 'dailyChallenges', dataAzi);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setDailyProblem(docSnap.data());
        setSolvers(docSnap.data().solvers || []);
      }
    };
    fetchArena();
  }, []);

  const handleSolve = async () => {
    const isGata = await verificaProblemaCodeforces(dailyProblem.idCF);
    if (isGata) {
      // Automatizare: Verificăm dacă e Sprinter (primii 3)
      const tipPunctaj = solvers.length < 3 ? 'daily_sprinter' : 'daily_normal';
      
      await acordaPuncte(tipPunctaj);
      
      // Adăugăm userul în lista de solveri a problemei pentru a-l afișa dedesubt
      const dataAzi = new Date().toLocaleDateString('ro-RO').replaceAll('.', '_');
      await updateDoc(doc(db, 'dailyChallenges', dataAzi), {
        solvers: arrayUnion({ nume: currentUser.nume, uid: currentUser.uid, ora: new Date().toLocaleTimeString() })
      });
      alert("Felicitări! Punctele au fost adăugate.");
    }
  };

  return (
    <div className="arena-container">
      <h2>🚀 Problema Zilei: {dailyProblem?.titlu}</h2>
      <a href={dailyProblem?.link} target="_blank">Rezolvă pe Codeforces</a>
      <button onClick={handleSolve}>Verifică Submisia</button>

      <div className="solvers-list">
        <h3>Top 50 Solveri (Azi)</h3>
        {solvers.slice(0, 50).map((s, idx) => (
          <p key={idx}>{idx + 1}. {s.nume} - {s.ora}</p>
        ))}
      </div>
    </div>
  );
}


export default Arena;