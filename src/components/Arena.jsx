import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import '../components_css/arena.css';

function Arena() {
  const { currentUser, acordaPuncte, verificaProblemaCodeforces } = useAuth();
  const [dailyProblem, setDailyProblem] = useState(null);
  const [solvers, setSolvers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const solversPerPage = 8;

  useEffect(() => {
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
    
    // Verificarea folosind ID-ul curățat din AuthContext
    const isGata = await verificaProblemaCodeforces(dailyProblem.idCF);
    
    if (isGata) {
      if (solvers.some(s => s.uid === currentUser.uid)) {
        alert("Ai validat deja această problemă!");
        setLoading(false); return;
      }

      // Calcul punctaj: Sprinter pentru primii 3
      const tipPunctaj = solvers.length < 3 ? 'daily_sprinter' : 'daily_normal';
      await acordaPuncte(tipPunctaj);
      alert("Felicitări! Punctele au fost adăugate.");
    } else {
      alert("Nu am găsit nicio submisie 'Accepted' pe Codeforces.");
    }
    setLoading(false);
  };

  const idxLast = currentPage * solversPerPage;
  const idxFirst = idxLast - solversPerPage;
  const currentSolvers = solvers.slice(idxFirst, idxLast);
  const totalPages = Math.ceil(solvers.length / solversPerPage);

  return (
    <div className="arena-container">
      {/* SECȚIUNEA PRINCIPALĂ: PROBLEMA ZILEI */}
      <section className="hero-challenge">
        <div className="challenge-card">
          <div className="challenge-tag">🔥 CHALLENGE OF THE DAY</div>
          <h1>{dailyProblem?.titlu || "Se încarcă provocarea..."}</h1>
          <p className="challenge-meta">ID Codeforces: <span>{dailyProblem?.idCF}</span></p>
          
          <div className="challenge-actions">
            <a href={dailyProblem?.link} target="_blank" rel="noreferrer" className="btn-primary-arena">
              Rezolvă pe Codeforces ↗
            </a>
            <button onClick={handleSolve} disabled={loading} className="btn-secondary-arena">
              {loading ? "Se verifică..." : "Verifică Submisia"}
            </button>
          </div>
        </div>
      </section>

      {/* SECȚIUNEA SECUNDARĂ: CLASAMENT */}
      <section className="ranking-section">
        <h2 className="ranking-title">🏆 Hall of Fame (Azi)</h2>
        <div className="custom-table">
          <div className="table-header">
            <span>Poz.</span>
            <span>Programator</span>
            <span>Timp</span>
          </div>
          {currentSolvers.map((s, i) => (
            <div key={i} className={`table-row ${idxFirst + i < 3 ? `top-${idxFirst + i + 1}` : ''}`}>
              <span className="rank-cell">#{idxFirst + i + 1}</span>
              <span className="name-cell">{s.nume} {idxFirst + i === 0 && '👑'}</span>
              <span className="time-cell">{s.ora}</span>
            </div>
          ))}
          {solvers.length === 0 && <p className="no-data">Fii primul programator de azi!</p>}
        </div>

        {totalPages > 1 && (
          <div className="arena-nav">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Anterior</button>
            <span className="page-info">{currentPage} / {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Următor</button>
          </div>
        )}
      </section>
    </div>
  );
}

export default Arena;