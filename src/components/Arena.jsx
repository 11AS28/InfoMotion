import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, updateDoc, setDoc, arrayUnion, increment } from 'firebase/firestore';
import '../components_css/arena.css';
import { Toaster, toast } from 'sonner';
import { Rocket, TriangleAlert, Code2, CheckCircle2 } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';
import { useNavigate } from 'react-router-dom';

function Arena({ datePreincarcate }) {
  const { currentUser, acordaPuncte, verificaProblemaCodeforces } = useAuth();
  const navigate = useNavigate();
  
  const [problems, setProblems] = useState({
    easy: { titlu: "Watermelon (Rating: 800)", link: "https://codeforces.com/problemset/problem/4/A", idCF: "4A" },
    medium: { titlu: "Taxi (Rating: 1100)", link: "https://codeforces.com/problemset/problem/158/B", idCF: "158B" },
    hard: { titlu: "Registration System (Rating: 1300)", link: "https://codeforces.com/problemset/problem/4/C", idCF: "4C" }
  });
  
  const [solvers, setSolvers] = useState([]);
  const [userBadgesMap, setUserBadgesMap] = useState({}); 
  const [activeTab, setActiveTab] = useState('easy'); 
  const [isChecking, setIsChecking] = useState(false); 

  // Stări pentru verificarea oricărei probleme de pe Codeforces
  const [customProblemId, setCustomProblemId] = useState('');
  const [isCheckingCustom, setIsCheckingCustom] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const solversPerPage = 5;

  const getSafeDateString = () => {
    const now = new Date();
    if (now.getHours() < 10) {
      const ieri = new Date(now);
      ieri.setDate(ieri.getDate() - 1);
      return `${ieri.getDate()}_${ieri.getMonth() + 1}_${ieri.getFullYear()}`;
    }
    return `${now.getDate()}_${now.getMonth() + 1}_${now.getFullYear()}`;
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
    let isMounted = true;

    const proceseazaSauGenereaza = async () => {
      if (datePreincarcate) {
        setProblems({
          easy: datePreincarcate.easy || problems.easy,
          medium: datePreincarcate.medium || problems.medium,
          hard: datePreincarcate.hard || problems.hard
        });
        const activeSolvers = datePreincarcate.solvers || [];
        setSolvers(activeSolvers);

        const badgeMap = {};
        activeSolvers.forEach(s => {
          badgeMap[s.uid] = s.problemeRezolvateCount || 0;
        });
        setUserBadgesMap(badgeMap);
        return;
      }

      const dataAzi = getSafeDateString();
      const docRef = doc(db, 'dailyChallenges', dataAzi);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const response = await fetch('https://codeforces.com/api/problemset.problems', { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) return;
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
              easy: { titlu: `${pEasy.name} (Rating: ${pEasy.rating || 900})`, link: `https://codeforces.com/problemset/problem/${pEasy.contestId}/${pEasy.index}`, idCF: `${pEasy.contestId}${pEasy.index}` },
              medium: { titlu: `${pMed.name} (Rating: ${pMed.rating || 1300})`, link: `https://codeforces.com/problemset/problem/${pMed.contestId}/${pMed.index}`, idCF: `${pMed.contestId}${pMed.index}` },
              hard: { titlu: `${pHard.name} (Rating: ${pHard.rating || 1600})`, link: `https://codeforces.com/problemset/problem/${pHard.contestId}/${pHard.index}`, idCF: `${pHard.contestId}${pHard.index}` }
            };
            
            await setDoc(docRef, newChallengePackage);
            if (!isMounted) return;
            setProblems({ easy: newChallengePackage.easy, medium: newChallengePackage.medium, hard: newChallengePackage.hard });
            setSolvers([]);
          }
        }
      } catch (e) {
        console.error("Avarie CF API:", e);
      }
    };

    proceseazaSauGenereaza();
    return () => { isMounted = false; };
  }, [datePreincarcate]);

  const handleSolve = async (dificultateTinta) => {
    if (!currentUser || !currentUser.uid) {
      toast.error("Eroare de autentificare!");
      return;
    }
    const currentProblem = problems[dificultateTinta];
    if (!currentProblem) return;

    const hasSolvedThisOne = solvers.some(s => s.uid === currentUser.uid && s.dificultate === dificultateTinta);
    if (hasSolvedThisOne) {
      toast.warning("Ai rezolvat deja această problemă!");
      return;
    }

    const hasAnyPointsToday = solvers.some(s => s.uid === currentUser.uid && s.aPrimitPuncte === true);
    setIsChecking(true);
    const idValidare = toast.loading("Se verifică statusul pe Codeforces...");

    try {
      const isGata = await verificaProblemaCodeforces(currentProblem.idCF);
      if (isGata) {
        const dataAzi = getSafeDateString();
        const nrSolversPeDificultate = solvers.filter(s => s.dificultate === dificultateTinta).length;
        const esteInPrimii3 = nrSolversPeDificultate < 3;
        let puncteDeAcordat = 0;

        if (!hasAnyPointsToday) {
          if (dificultateTinta === 'easy') puncteDeAcordat = esteInPrimii3 ? 40 : 20;
          else if (dificultateTinta === 'medium') puncteDeAcordat = esteInPrimii3 ? 50 : 40;
          else if (dificultateTinta === 'hard') puncteDeAcordat = esteInPrimii3 ? 65 : 50;
          await acordaPuncte(puncteDeAcordat);
          toast.success(`Felicitări! Ai primit +${puncteDeAcordat} XP!`, { id: idValidare });
        } else {
          toast.info("Antrenament privat validat!", { id: idValidare });
        }
        
        const numarCurentProbleme = (currentUser.problemeRezolvateCount || 0) + 1;
        await updateDoc(doc(db, 'users', currentUser.uid), { problemeRezolvateCount: increment(1) });

        const nouSolver = { 
          nume: currentUser.nume || "Utilizator", 
          uid: currentUser.uid, 
          dificultate: dificultateTinta,
          aPrimitPuncte: !hasAnyPointsToday,
          problemeRezolvateCount: numarCurentProbleme, 
          ora: new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }) 
        };

        await updateDoc(doc(db, 'dailyChallenges', dataAzi), { solvers: arrayUnion(nouSolver) });
        setUserBadgesMap(prev => ({ ...prev, [currentUser.uid]: numarCurentProbleme }));
        setSolvers(prev => [...prev, nouSolver]);
      } else {
        toast.error("Submisie neidentificată pe Codeforces (trebuie să fie OK)!", { id: idValidare });
      }
    } catch (error) {
      toast.error("Eroare de sistem.", { id: idValidare });
    } finally {
      setIsChecking(false);
    }
  };

  // FUNCȚIA NOUĂ: Verifică orice problemă introdusă manual din Codeforces
  const handleVerifyCustomProblem = async () => {
    const idCurat = customProblemId.trim().toUpperCase();
    if (!idCurat) {
      toast.error("Introdu un ID valid! (ex: 4A, 158B, 1920A)");
      return;
    }
    if (!currentUser?.codeforcesHandle) {
      toast.error("Setează-ți Codeforces Handle-ul în profil mai întâi!");
      return;
    }

    // Verificăm istoricul din profil ca să nu ia puncte de 2 ori pe aceeași problemă liberă
    const istoricCustom = currentUser.problemeCustomRezolvate || [];
    if (istoricCustom.includes(idCurat)) {
      toast.warning("Ai obținut deja puncte pentru problema asta pe InfoMotion!");
      return;
    }

    setIsCheckingCustom(true);
    const idToast = toast.loading(`Se caută submisia OK pentru problema ${idCurat}...`);

    try {
      const gasitSubmisieOk = await verificaProblemaCodeforces(idCurat);
      if (gasitSubmisieOk) {
        // Alocăm un număr fix de puncte, de exemplu 15 XP pentru probleme la alegere
        const xpDeOferit = 15;
        await acordaPuncte(xpDeOferit);

        // Adăugăm problema în array-ul de istoric din documentul utilizatorului
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          problemeCustomRezolvate: arrayUnion(idCurat),
          problemeRezolvateCount: increment(1)
        });

        toast.success(`Validat! +${xpDeOferit} XP adăugați pentru problema ${idCurat}.`, { id: idToast });
        setCustomProblemId('');
      } else {
        toast.error(`Nu s-a găsit nicio rezolvare cu statusul "OK" pe Codeforces pentru ${idCurat}.`, { id: idToast });
      }
    } catch (err) {
      toast.error("Eroare la conectarea cu API-ul.", { id: idToast });
    } finally {
      setIsCheckingCustom(false);
    }
  };

  const solversFiltrati = solvers.filter(s => s.dificultate === activeTab);
  const idxLast = currentPage * solversPerPage;
  const idxFirst = idxLast - solversPerPage;
  const currentSolvers = solversFiltrati.slice(idxFirst, idxLast);
  const totalPages = Math.ceil(solversFiltrati.length / solversPerPage);
  const utilizatorulAAlesPuncteAzi = solvers.some(s => s.uid === currentUser?.uid && s.aPrimitPuncte === true);
  
  return (
    usePageTitle("InfoMotion - Arena"),
    <div className="arena-wrapper">
      <Toaster position="top-center" richColors />
      <div className="arena-container">
        <h2><Rocket size={50} color="#832211" strokeWidth={0.75} /> Arena Problemelor</h2>

        <div className="arena-mobile-tabs">
          <button className={activeTab === 'easy' ? 'active' : ''} onClick={() => { setActiveTab('easy'); setCurrentPage(1); }}>Easy</button>
          <button className={activeTab === 'medium' ? 'active' : ''} onClick={() => { setActiveTab('medium'); setCurrentPage(1); }}>Medie</button>
          <button className={activeTab === 'hard' ? 'active' : ''} onClick={() => { setActiveTab('hard'); setCurrentPage(1); }}>Grea</button>
        </div>

        <div className="arena-grid-layout">
          {/* Card Easy */}
          <div className={`arena-custom-card card-easy ${activeTab === 'easy' ? 'mobile-active' : ''}`}>
            <div className="card-top">
              <span className="card-tag tag-easy"> Easy</span>
              <h3>{problems.easy.titlu}</h3>
              <p className="card-xp">20 XP | 40 XP în primii 3</p>
            </div>
            <div className="card-bottom">
              <a href={problems.easy.link} target="_blank" rel="noopener noreferrer">Rezolvă pe CF ➔</a>
              <button onClick={() => handleSolve('easy')} disabled={isChecking || solvers.some(s => s.uid === currentUser?.uid && s.dificultate === 'easy')}>
                {solvers.some(s => s.uid === currentUser?.uid && s.dificultate === 'easy') ? "Rezolvată" : "Verifică"}
              </button>
            </div>
          </div>
          
          <div className={`arena-custom-card card-medium ${activeTab === 'medium' ? 'mobile-active' : ''}`}>
            <div className="card-top">
              <span className="card-tag tag-medium"> Medie</span>
              <h3>{problems.medium.titlu}</h3>
              <p className="card-xp">40 XP | 50 XP în primii 3</p>
            </div>
            <div className="card-bottom">
              <a href={problems.medium.link} target="_blank" rel="noopener noreferrer">Rezolvă pe CF ➔</a>
              <button onClick={() => handleSolve('medium')} disabled={isChecking || solvers.some(s => s.uid === currentUser?.uid && s.dificultate === 'medium')}>
                {solvers.some(s => s.uid === currentUser?.uid && s.dificultate === 'medium') ? "Rezolvată" : "Verifică"}
              </button>
            </div>
          </div>

          <div className={`arena-custom-card card-hard ${activeTab === 'hard' ? 'mobile-active' : ''}`}>
            <div className="card-top">
              <span className="card-tag tag-hard"> Grea</span>
              <h3>{problems.hard.titlu}</h3>
              <p className="card-xp">50 XP | 65 XP în primii 3</p>
            </div>
            <div className="card-bottom">
              <a href={problems.hard.link} target="_blank" rel="noopener noreferrer">Rezolvă pe CF ➔</a>
              <button onClick={() => handleSolve('hard')} disabled={isChecking || solvers.some(s => s.uid === currentUser?.uid && s.dificultate === 'hard')}>
                {solvers.some(s => s.uid === currentUser?.uid && s.dificultate === 'hard') ? "Rezolvată" : "Verifică"}
              </button>
            </div>
          </div>
        </div>

        {utilizatorulAAlesPuncteAzi && (
          <p className="arena-warning-text">
            <TriangleAlert size={30} color="#e3ad16" strokeWidth={1} /> Ai încasat deja XP-ul pe azi. Restul problemelor se validează ca antrenament (0 XP).
          </p>
        )}

        <div className="arena-playground-zone">
          <div className="playground-box">
            <div className="box-header">
              <Code2 size={24} color="#832211" />
              <h3>Workspace Liber</h3>
            </div>
            <p>Vrei să testezi idei rapide sau să îți scrii rezolvările în editorul nostru avansat cu teme de magazin?</p>
            <button className="btn-open-sandbox" onClick={() => navigate('/compiler/liber')}>
              Deschide InfoMotion IDE ➔
            </button>
          </div>

          <div className="custom-verify-box">
            <div className="box-header">
              <CheckCircle2 size={24} color="#10b981" />
              <h3>Verifică orice problemă Codeforces</h3>
            </div>
            <p>Ai rezolvat o problemă care nu se află printre cele zilnice? Bagă ID-ul ei mai jos ca să îți iei punctele.</p>
            
            <div className="custom-input-group">
              <input 
                type="text" 
                placeholder="Ex: 4A, 158B, 122A..." 
                value={customProblemId}
                onChange={(e) => setCustomProblemId(e.target.value)}
                disabled={isCheckingCustom}
              />
              <button onClick={handleVerifyCustomProblem} disabled={isCheckingCustom}>
                {isCheckingCustom ? "Verificare..." : "Validează"}
              </button>
            </div>
            <span className="hint-text">* Primești +15 XP pentru fiecare problemă unică aprobată.</span>
          </div>
        </div>

        <div className="solvers-list">
          <div className="solvers-list-header">
            <h3>Top Solveri - {activeTab === 'easy' ? " Easy" : activeTab === 'medium' ? " Medie" : " Grea"}</h3>
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
                const totalProblemeUser = userBadgesMap[s.uid] || 0;
                return (
                  <div key={idx} className={`user-row ${realRank === 1 ? 'rank-1' : realRank === 2 ? 'rank-2' : realRank === 3 ? 'rank-3' : ''}`}>
                    <span className="rank">#{realRank}</span>
                    <span className="username">
                      {s.nume} {afiseazaInsignaUtilizator(totalProblemeUser)}
                      {s.aPrimitPuncte && (
                        <Rocket size={20} color="#832211" strokeWidth={2} style={{ marginLeft: '6px', display: 'inline' }} />
                      )}
                    </span>
                    <span className="time">{s.ora}</span>
                  </div>
                );
              })}
              
              {totalPages > 1 && (
                <div className="pagination-controls">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Înapoi</button>
                  <span>Pagina {currentPage} din {totalPages}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Înainte</button>
                </div>
              )}
            </>
          ) : (
            <p className="no-solvers">Fii primul care sparge gheața la această categorie!</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Arena;