import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, setDoc, arrayUnion, increment } from 'firebase/firestore';
import '../components_css/arena.css';

function Arena() {
  const { currentUser, acordaPuncte, verificaProblemaCodeforces } = useAuth();
  
  const [problems, setProblems] = useState({
    easy: { titlu: "Watermelon (Rating: 800)", link: "https://codeforces.com/problemset/problem/4/A", idCF: "4A" },
    medium: { titlu: "Taxi (Rating: 1100)", link: "https://codeforces.com/problemset/problem/158/B", idCF: "158B" },
    hard: { titlu: "Registration System (Rating: 1300)", link: "https://codeforces.com/problemset/problem/4/C", idCF: "4C" }
  });
  
  const [solvers, setSolvers] = useState([]);
  const [userBadgesMap, setUserBadgesMap] = useState({}); 
  const [activeTab, setActiveTab] = useState('easy'); 
  const [isChecking, setIsChecking] = useState(false); 

  const [currentPage, setCurrentPage] = useState(1);
  const solversPerPage = 5;

  const getSafeDateString = () => {
    const today = new Date();
    return `${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`;
  };

  const afiseazaInsignaUtilizator = (count) => {
    if (count >= 100) return <span title="Boss Final" style={{ marginLeft: '6px', cursor: 'help' }}>👑</span>;
    if (count >= 50) return <span title="Mage de Algoritmi" style={{ marginLeft: '6px', cursor: 'help' }}>🧙‍♂️</span>;
    if (count >= 30) return <span title="Arena Grinder" style={{ marginLeft: '6px', cursor: 'help' }}>⚔️</span>;
    if (count >= 15) return <span title="Miner de XP" style={{ marginLeft: '6px', cursor: 'help' }}>⚒️</span>;
    if (count >= 5) return <span title="Combo Mic" style={{ marginLeft: '6px', cursor: 'help' }}>🔥</span>;
    if (count >= 1) return <span title="Primul Craft" style={{ marginLeft: '6px', cursor: 'help' }}>🌱</span>;
    return null;
  };

  useEffect(() => {
    const fetchArena = async () => {
      const dataAzi = getSafeDateString();
      const docRef = doc(db, 'dailyChallenges', dataAzi);
      
      try {
        const docSnap = await getDoc(docRef);
        let activeSolvers = [];
        
        if (docSnap.exists()) {
          const cloudData = docSnap.data();
          setProblems({
            easy: cloudData.easy || problems.easy,
            medium: cloudData.medium || problems.medium,
            hard: cloudData.hard || problems.hard
          });
          activeSolvers = cloudData.solvers || [];
          setSolvers(activeSolvers);
        } else {
          console.log("Generăm pachetul de 3 probleme din Codeforces...");
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);

          const response = await fetch('https://codeforces.com/api/problemset.problems', { signal: controller.signal });
          clearTimeout(timeoutId);

          if (!response.ok) throw new Error("API Codeforces a dat eroare");
          
          const data = await response.json();
          
          if (data.status === 'OK' && data.result && data.result.problems) {
            const allProblems = data.result.problems;
            
            const easyPool = allProblems.filter(p => p.rating >= 800 && p.rating <= 1100);
            const medPool = allProblems.filter(p => p.rating >= 1200 && p.rating <= 1400);
            const hardPool = allProblems.filter(p => p.rating >= 1500 && p.rating <= 1700);

            if (easyPool.length > 0 && medPool.length > 0 && hardPool.length > 0) {
              const pEasy = easyPool[Math.floor(Math.random() * easyPool.length)];
              const pMed = medPool[Math.floor(Math.random() * medPool.length)];
              const pHard = hardPool[Math.floor(Math.random() * hardPool.length)];
              
              const newChallengePackage = {
                data: dataAzi,
                solvers: [],
                easy: {
                  titlu: `${pEasy.name} (Rating: ${pEasy.rating || 900})`,
                  link: `https://codeforces.com/problemset/problem/${pEasy.contestId}/${pEasy.index}`,
                  idCF: `${pEasy.contestId}${pEasy.index}`
                },
                medium: {
                  titlu: `${pMed.name} (Rating: ${pMed.rating || 1300})`,
                  link: `https://codeforces.com/problemset/problem/${pMed.contestId}/${pMed.index}`,
                  idCF: `${pMed.contestId}${pMed.index}`
                },
                hard: {
                  titlu: `${pHard.name} (Rating: ${pHard.rating || 1600})`,
                  link: `https://codeforces.com/problemset/problem/${pHard.contestId}/${pHard.index}`,
                  idCF: `${pHard.contestId}${pHard.index}`
                }
              };
              
              await setDoc(docRef, newChallengePackage);
              setProblems({ easy: newChallengePackage.easy, medium: newChallengePackage.medium, hard: newChallengePackage.hard });
              setSolvers([]);
            }
          }
        }

        if (activeSolvers.length > 0) {
          const uniqueUids = [...new Set(activeSolvers.map(s => s.uid))];
          const badgeMap = {};
          
          await Promise.all(uniqueUids.map(async (uid) => {
            try {
              const uSnap = await getDoc(doc(db, 'users', uid));
              if (uSnap.exists()) {
                badgeMap[uid] = uSnap.data().problemeRezolvateCount || 0;
              }
            } catch (err) {
              console.error("Eroare la tragerea insignelor pentru user:", uid, err);
            }
          }));
          
          setUserBadgesMap(badgeMap);
        }

      } catch (error) {
        console.error("Mecanism de avarie activat:", error);
      }
    };
    
    fetchArena();
  }, []);

  const handleSolve = async (dificultateTinta) => {
    const currentProblem = problems[dificultateTinta];
    if (!currentProblem) return;

    const hasSolvedThisOne = solvers.some(s => s.uid === currentUser.uid && s.dificultate === dificultateTinta);
    if (hasSolvedThisOne) {
      alert("Ai rezolvat deja această problemă!");
      return;
    }

    // 🛠️ REPARAT CRITICAL: Ne asigurăm că verificăm dacă utilizatorul CURENT a luat puncte azi, nu oricine de pe site!
    const hasAnyPointsToday = solvers.some(s => s.uid === currentUser.uid && s.aPrimitPuncte === true);

    setIsChecking(true);
    try {
      const isGata = await verificaProblemaCodeforces(currentProblem.idCF);
      
      if (isGata) {
        const dataAzi = getSafeDateString();
        const nrSolversPeDificultate = solvers.filter(s => s.dificultate === dificultateTinta).length;
        const esteInPrimii3 = nrSolversPeDificultate < 3;

        let puncteDeAcordat = 0;
        let mesajPuncte = "";

        if (!hasAnyPointsToday) {
          if (dificultateTinta === 'easy') puncteDeAcordat = esteInPrimii3 ? 40 : 20;
          else if (dificultateTinta === 'medium') puncteDeAcordat = esteInPrimii3 ? 50 : 40;
          else if (dificultateTinta === 'hard') puncteDeAcordat = esteInPrimii3 ? 65 : 50;
          
          await acordaPuncte(puncteDeAcordat);
          mesajPuncte = `🎉 Felicitări! Ai primit ${puncteDeAcordat} puncte XP!`;
        } else {
          mesajPuncte = "✅ Submisie validată ca antrenament privat! (0 XP adăugat, ai ales deja o problemă azi).";
        }
        
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
          problemeRezolvateCount: increment(1) 
        });

        const nouSolver = { 
          nume: currentUser.nume, 
          uid: currentUser.uid, 
          dificultate: dificultateTinta,
          aPrimitPuncte: !hasAnyPointsToday,
          ora: new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }) 
        };

        await updateDoc(doc(db, 'dailyChallenges', dataAzi), {
          solvers: arrayUnion(nouSolver)
        });

        const curentCountLocal = userBadgesMap[currentUser.uid] || 0;
        setUserBadgesMap(prev => ({ ...prev, [currentUser.uid]: curentCountLocal + 1 }));

        setSolvers(prev => [...prev, nouSolver]);
        alert(`${mesajPuncte}\n📈 Problema a fost adăugată la contorul tău total global pentru clasament!`);
      } else {
        alert(`Nu am găsit submisia marcată cu 'Accepted' pe Codeforces pentru problema ${currentProblem.idCF}.`);
      }
    } catch (error) {
      console.error("Eroare la verificare:", error);
      alert("Eroare la procesarea submisiei.");
    } finally {
      setIsChecking(false);
    }
  };

  const solversFiltrati = solvers.filter(s => s.dificultate === activeTab);
  const idxLast = currentPage * solversPerPage;
  const idxFirst = idxLast - solversPerPage;
  const currentSolvers = solversFiltrati.slice(idxFirst, idxLast);
  const totalPages = Math.ceil(solversFiltrati.length / solversPerPage);
  
  // 🛠️ REPARAT ACUM: Și textul de warning de jos va fi calculat strict pentru userul autentificat
  const utilizatorulAAlesPuncteAzi = solvers.some(s => s.uid === currentUser?.uid && s.aPrimitPuncte === true);

  return (
    <div className="arena-wrapper">
      <div className="arena-container">
        
        <h2>🚀 Arena Problemelor</h2>

        <div className="arena-mobile-tabs">
          <button className={activeTab === 'easy' ? 'active' : ''} onClick={() => { setActiveTab('easy'); setCurrentPage(1); }}>
            🟢 Easy
          </button>
          <button className={activeTab === 'medium' ? 'active' : ''} onClick={() => { setActiveTab('medium'); setCurrentPage(1); }}>
            🟡 Medie
          </button>
          <button className={activeTab === 'hard' ? 'active' : ''} onClick={() => { setActiveTab('hard'); setCurrentPage(1); }}>
            🔴 Grea
          </button>
        </div>

        <div className="arena-grid-layout">
          {/* CASETA 1: EASY */}
          <div className={`arena-custom-card card-easy ${activeTab === 'easy' ? 'mobile-active' : ''}`}>
            <div className="card-top">
              <span className="card-tag tag-easy">🟢 Easy</span>
              <h3>{problems.easy.titlu}</h3>
              <p className="card-xp">20 XP | 40 XP în primii 3</p>
            </div>
            <div className="card-bottom">
              <a href={problems.easy.link} target="_blank" rel="noopener noreferrer">Rezolvă pe CF ➔</a>
              <button 
                onClick={() => handleSolve('easy')} 
                disabled={isChecking || solvers.some(s => s.uid === currentUser?.uid && s.dificultate === 'easy')}
              >
                {solvers.some(s => s.uid === currentUser?.uid && s.dificultate === 'easy') ? "Rezolvată" : "Verifică"}
              </button>
            </div>
          </div>

          {/* CASETA 2: MEDIUM */}
          <div className={`arena-custom-card card-medium ${activeTab === 'medium' ? 'mobile-active' : ''}`}>
            <div className="card-top">
              <span className="card-tag tag-medium">🟡 Medie</span>
              <h3>{problems.medium.titlu}</h3>
              <p className="card-xp">40 XP | 50 XP în primii 3</p>
            </div>
            <div className="card-bottom">
              <a href={problems.medium.link} target="_blank" rel="noopener noreferrer">Rezolvă pe CF ➔</a>
              <button 
                onClick={() => handleSolve('medium')} 
                disabled={isChecking || solvers.some(s => s.uid === currentUser?.uid && s.dificultate === 'medium')}
              >
                {solvers.some(s => s.uid === currentUser?.uid && s.dificultate === 'medium') ? "Rezolvată" : "Verifică"}
              </button>
            </div>
          </div>

          {/* CASETA 3: HARD */}
          <div className={`arena-custom-card card-hard ${activeTab === 'hard' ? 'mobile-active' : ''}`}>
            <div className="card-top">
              <span className="card-tag tag-hard">🔴 Grea</span>
              <h3>{problems.hard.titlu}</h3>
              <p className="card-xp">50 XP | 65 XP în primii 3</p>
            </div>
            <div className="card-bottom">
              <a href={problems.hard.link} target="_blank" rel="noopener noreferrer">Rezolvă pe CF ➔</a>
              <button 
                onClick={() => handleSolve('hard')} 
                disabled={isChecking || solvers.some(s => s.uid === currentUser?.uid && s.dificultate === 'hard')}
              >
                {solvers.some(s => s.uid === currentUser?.uid && s.dificultate === 'hard') ? "Rezolvată" : "Verifică"}
              </button>
            </div>
          </div>
        </div>

        {utilizatorulAAlesPuncteAzi && (
          <p className="arena-warning-text">
            ⚠️ Ai încasat deja XP-ul pe azi. Restul problemelor se validează ca antrenament (0 XP).
          </p>
        )}

        <div className="solvers-list">
          <div className="solvers-list-header">
            <h3>Top Solveri - {activeTab === 'easy' ? '🟢 Easy' : activeTab === 'medium' ? '🟡 Medie' : '🔴 Grea'}</h3>
            <div className="desktop-rank-switch">
              <button className={activeTab === 'easy' ? 'active-mini' : ''} onClick={() => { setActiveTab('easy'); setCurrentPage(1); }}>Easy</button>
              <button className={activeTab === 'medium' ? 'active-mini' : ''} onClick={() => { setActiveTab('medium'); setCurrentPage(1); }}>Medie</button>
              <button className={activeTab === 'hard' ? 'active-mini' : ''} onClick={() => { setActiveTab('hard'); setCurrentPage(1); }}>Grea</button>
            </div>
          </div>
          
          {solversFiltrati.length > 0 ? (
            <>
              {currentSolvers.map((s, idx) => {
                const realRank = idxFirst + idx + 1;
                let rankClass = '';
                if (realRank === 1) rankClass = 'rank-1';
                else if (realRank === 2) rankClass = 'rank-2';
                else if (realRank === 3) rankClass = 'rank-3';

                const totalProblemeUser = userBadgesMap[s.uid] || 0;

                return (
                  <div key={idx} className={`user-row ${rankClass}`}>
                    <span className="rank">#{realRank}</span>
                    <span className="username">
                      {s.nume} 
                      {afiseazaInsignaUtilizator(totalProblemeUser)}
                      {s.aPrimitPuncte ? " 🚀" : " 🧪 (Antrenament)"}
                    </span>
                    <span className="value">{s.ora}</span>
                  </div>
                );
              })}

              {totalPages > 1 && (
                <div className="pagination">
                  <button className="page-btn" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                    &laquo; Înapoi
                  </button>
                  <span className="page-info">{currentPage} / {totalPages}</span>
                  <button className="page-btn" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
                    Înainte &raquo;
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="empty-solvers">Fii primul care sparge gheața la această categorie! 🔥</p>
          )}
        </div>

      </div>
    </div>
  );
}

export default Arena;