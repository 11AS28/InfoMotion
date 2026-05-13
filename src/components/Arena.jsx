import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, updateDoc, arrayUnion, onSnapshot } from 'firebase/firestore';
import '../components_css/arena.css';

function Arena() {
  // Extragem funcția de verificare și cea de punctaj din AuthContext
  const { currentUser, acordaPuncte, verificaProblemaCodeforces } = useAuth();
  const [dailyProblem, setDailyProblem] = useState(null);
  const [solvers, setSolvers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Formatăm data curentă pentru a găsi documentul corect (ex: 13_05_2026)
    const dataAzi = new Date().toLocaleDateString('ro-RO').replaceAll('.', '_');
    const docRef = doc(db, 'dailyChallenges', dataAzi);

    const unsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setDailyProblem(docSnap.data());
        setSolvers(docSnap.data().solvers || []);
      }
    });

    return () => unsub();
  }, []);

  const handleSolve = async () => {
    if (!dailyProblem) return;
    
    setLoading(true);
    try {
      // Pasul 1: Verificăm efectiv pe Codeforces folosind ID-ul problemei (ex: 158/A)
      const isGata = await verificaProblemaCodeforces(dailyProblem.idCF);
      
      if (isGata) {
        // Pasul 2: Verificăm dacă userul nu a mai luat deja punctele azi
        if (solvers.some(s => s.uid === currentUser.uid)) {
          alert("Ai validat deja această problemă!");
          setLoading(false);
          return;
        }

        // Pasul 3: Determinăm tipul de punctaj (Sprinter pentru primii 3)
        const tipPunctaj = solvers.length < 3 ? 'daily_sprinter' : 'daily_normal';
        await acordaPuncte(tipPunctaj);
        
        // Pasul 4: Actualizăm lista de solveri în Firestore
        const dataAzi = new Date().toLocaleDateString('ro-RO').replaceAll('.', '_');
        await updateDoc(doc(db, 'dailyChallenges', dataAzi), {
          solvers: arrayUnion({ 
            nume: currentUser.nume, 
            uid: currentUser.uid, 
            ora: new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }) 
          })
        });
        
        alert("Sistemul a confirmat submisia! Punctele au fost adăugate.");
      } else {
        alert("Nu am găsit nicio submisie 'Accepted' pentru această problemă pe contul tău de Codeforces.");
      }
    } catch (error) {
      console.error("Eroare la verificare:", error);
      alert("A apărut o eroare la comunicarea cu Codeforces.");
    }
    setLoading(false);
  };

  const podium = solvers.slice(0, 3);
  const restOfSolvers = solvers.slice(3);

  return (
    <div className="arena-wrapper">
      <div className="arena-card">
        <div className="arena-badge">PROVOCAREA ZILEI</div>
        <h2>{dailyProblem?.titlu || "Se încarcă provocarea..."}</h2>
        <div className="arena-actions">
          <a href={dailyProblem?.link} target="_blank" rel="noreferrer" className="btn-cf">
            Vezi Problema ↗
          </a>
          <button 
            onClick={handleSolve} 
            disabled={loading || !dailyProblem} 
            className="btn-verify"
          >
            {loading ? "Se verifică..." : "Verifică Submisia"}
          </button>
        </div>
      </div>

      <div className="arena-leaderboard">
        <h3 className="section-title">🏆 Top Rezolvări</h3>
        
        <div className="podium-container">
          {/* Locul 2 */}
          <div className="podium-item rank-2">
            <div className="podium-avatar">{podium[1]?.nume?.[0] || "?"}</div>
            <div className="podium-name">{podium[1]?.nume || "---"}</div>
            <div className="podium-step">2</div>
          </div>

          {/* Locul 1 */}
          <div className="podium-item rank-1">
            <div className="podium-crown">👑</div>
            <div className="podium-avatar">{podium[0]?.nume?.[0] || "?"}</div>
            <div className="podium-name">{podium[0]?.nume || "---"}</div>
            <div className="podium-step">1</div>
          </div>

          {/* Locul 3 */}
          <div className="podium-item rank-3">
            <div className="podium-avatar">{podium[2]?.nume?.[0] || "?"}</div>
            <div className="podium-name">{podium[2]?.nume || "---"}</div>
            <div className="podium-step">3</div>
          </div>
        </div>

        <div className="solvers-list-simple">
          {restOfSolvers.map((s, idx) => (
            <div key={idx} className="solver-row-simple">
              <span><span className="rank-num">#{idx + 4}</span> {s.nume}</span>
              <span>{s.ora}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Arena;