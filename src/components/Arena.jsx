import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, setDoc, arrayUnion } from 'firebase/firestore';
import '../components_css/arena.css';

function Arena() {
  const { currentUser, acordaPuncte, verificaProblemaCodeforces } = useAuth();
  const [dailyProblem, setDailyProblem] = useState(null);
  const [solvers, setSolvers] = useState([]);
  const [isChecking, setIsChecking] = useState(false); 

  // --- STAT PENTRU PAGINARE ---
  const [currentPage, setCurrentPage] = useState(1);
  const solversPerPage = 5;

  const getSafeDateString = () => {
    const today = new Date();
    return `${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`;
  };

  useEffect(() => {
    const fetchArena = async () => {
      try {
        const dataAzi = getSafeDateString();
        const docRef = doc(db, 'dailyChallenges', dataAzi);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setDailyProblem(docSnap.data());
          setSolvers(docSnap.data().solvers || []);
        } else {
          console.log("Generăm problema zilei din Codeforces...");
          
          const response = await fetch('https://codeforces.com/api/problemset.problems');
          const data = await response.json();
          
          if (data.status === 'OK') {
            const allProblems = data.result.problems;
            const easyProblems = allProblems.filter(p => p.rating >= 800 && p.rating <= 1200);
            const randomIndex = Math.floor(Math.random() * easyProblems.length);
            const chosenProblem = easyProblems[randomIndex];
            
            const idProblema = `${chosenProblem.contestId}${chosenProblem.index}`; 
            const newDailyProblem = {
              titlu: `${chosenProblem.name} (Rating: ${chosenProblem.rating})`,
              link: `https://codeforces.com/problemset/problem/${chosenProblem.contestId}/${chosenProblem.index}`,
              idCF: idProblema,
              solvers: [],
              data: dataAzi
            };
            
            await setDoc(docRef, newDailyProblem);
            setDailyProblem(newDailyProblem);
            setSolvers([]);
          }
        }
      } catch (error) {
        console.error("Eroare la preluarea/generarea problemei:", error);
      }
    };
    
    fetchArena();
  }, []);

  const handleSolve = async () => {
    if (!dailyProblem) return;

    const hasAlreadySolved = solvers.some(s => s.uid === currentUser.uid);
    if (hasAlreadySolved) {
      alert("Ai primit deja punctele pentru problema de azi!");
      return;
    }

    setIsChecking(true);
    try {
      const isGata = await verificaProblemaCodeforces(dailyProblem.idCF);
      
      if (isGata) {
        const tipPunctaj = solvers.length < 3 ? 'daily_sprinter' : 'daily_normal';
        await acordaPuncte(tipPunctaj);
        
        const nouSolver = { 
          nume: currentUser.nume, 
          uid: currentUser.uid, 
          ora: new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }) 
        };

        const dataAzi = getSafeDateString();
        await updateDoc(doc(db, 'dailyChallenges', dataAzi), {
          solvers: arrayUnion(nouSolver)
        });

        setSolvers(prev => [...prev, nouSolver]);
        alert("Felicitări! Punctele au fost adăugate.");
      } else {
        alert("Submisia nu a fost găsită sau nu este acceptată pe Codeforces.");
      }
    } catch (error) {
      console.error("Eroare la verificare:", error);
      alert("A apărut o eroare la verificare.");
    } finally {
      setIsChecking(false);
    }
  };

  // --- LOGICA DE PAGINARE ---
  const idxLast = currentPage * solversPerPage;
  const idxFirst = idxLast - solversPerPage;
  const currentSolvers = solvers.slice(idxFirst, idxLast);
  const totalPages = Math.ceil(solvers.length / solversPerPage);

  return (
    <div>
      <div className="arena-container">
        {dailyProblem ? (
          <>
            <h2>🚀 Problema Zilei: {dailyProblem.titlu}</h2>
            <a href={dailyProblem.link} target="_blank" rel="noopener noreferrer">
              Rezolvă pe Codeforces
            </a>
            <br />
            <button 
              onClick={handleSolve} 
              disabled={isChecking || solvers.some(s => s.uid === currentUser?.uid)}
            >
              {isChecking ? "Se verifică..." : "Verifică Submisia"}
            </button>
          </>
        ) : (
          <h2>Nu a fost setată nicio problemă pentru astăzi! 😴</h2>
        )}

        <div className="solvers-list">
          <h3>Top Solveri (Azi)</h3>
          
          {solvers.length > 0 ? (
            <>
              {currentSolvers.map((s, idx) => {
                // Calculăm rangul real (ex: pe pagina 2 primul are rangul 6)
                const realRank = idxFirst + idx + 1;
                
                // Atribuim clasa în funcție de loc
                let rankClass = '';
                if (realRank === 1) rankClass = 'rank-1';
                else if (realRank === 2) rankClass = 'rank-2';
                else if (realRank === 3) rankClass = 'rank-3';

                return (
                  <div key={idx} className={`user-row ${rankClass}`}>
                    <span className="rank">#{realRank}</span>
                    <span className="username">{s.nume}</span>
                    <span className="value">{s.ora}</span>
                  </div>
                );
              })}

              {/* CONTROALE PAGINARE */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="page-btn"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    &laquo; Înapoi
                  </button>
                  <span className="page-info">{currentPage} / {totalPages}</span>
                  <button 
                    className="page-btn"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Înainte &raquo;
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="empty-solvers">Fii primul care rezolvă problema de azi!</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Arena;