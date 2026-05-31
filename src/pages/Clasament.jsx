import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, startAfter, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import Arena from '../components/Arena';
import '../pages_css/clasament.css';
import { Sparkles, PencilRuler, Flame, Crown, WandSparkles, Swords, HandFist, Leaf } from 'lucide-react';

function Clasament() {
  const { theme } = useTheme();

  const [topXP, setTopXP] = useState([]);
  const [topProbleme, setTopProbleme] = useState([]);
  const [arenaData, setArenaData] = useState(null); // Snapshot-ul pentru Arenă
  const [loading, setLoading] = useState(true);

  const [ultimulDocXP, setUltimulDocXP] = useState(null);
  const [ultimulDocProbleme, setUltimulDocProbleme] = useState(null);

  const [paginaXP, setPaginaXP] = useState(1);
  const [paginaProbleme, setPaginaProbleme] = useState(1);

  const USERS_PER_PAGE = 10;

  const getSafeDateString = () => {
    const now = new Date();
    if (now.getHours() < 10) {
      const ieri = new Date(now);
      ieri.setDate(ieri.getDate() - 1);
      return `${ieri.getDate()}_${ieri.getMonth() + 1}_${ieri.getFullYear()}`;
    }
    return `${now.getDate()}_${now.getMonth() + 1}_${now.getFullYear()}`;
  };

  useEffect(() => {
    const initToateDatele = async () => {
      try {
        // Queries pentru Clasamente
        const xpQ = query(collection(db, 'users'), orderBy('puncteTotale', 'desc'), limit(USERS_PER_PAGE));
        const probQ = query(collection(db, 'users'), orderBy('problemeRezolvateCount', 'desc'), limit(USERS_PER_PAGE));
        
        // Documentul de Arenă pentru ziua curentă
        const dataAzi = getSafeDateString();
        const arenaDocRef = doc(db, 'dailyChallenges', dataAzi);

        // Declanșăm TOATE citirile în paralel (Ultra Rapid)
        const [xpSnap, probSnap, arenaSnap] = await Promise.all([
          getDocs(xpQ),
          getDocs(probQ),
          getDoc(arenaDocRef)
        ]);

        setTopXP(xpSnap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((u) => u.role !== 'teacher'));
        setTopProbleme(probSnap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((u) => u.role !== 'teacher'));

        if (arenaSnap.exists()) {
          setArenaData(arenaSnap.data());
        }

        setUltimulDocXP(xpSnap.docs[xpSnap.docs.length - 1] || null);
        setUltimulDocProbleme(probSnap.docs[probSnap.docs.length - 1] || null);
      } catch (err) {
        console.error("Eroare la inițializarea datelor:", err);
      }
      setLoading(false);
    };
    initToateDatele();
  }, []);

  const paginaUrmatoareXP = async () => {
    if (!ultimulDocXP) return;
    try {
      const nextQ = query(collection(db, 'users'), orderBy('puncteTotale', 'desc'), startAfter(ultimulDocXP), limit(USERS_PER_PAGE));
      const snap = await getDocs(nextQ);
      if (!snap.empty) {
        const noiUseri = snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((u) => u.role !== 'teacher');
        setTopXP((prev) => [...prev, ...noiUseri]);
        setUltimulDocXP(snap.docs[snap.docs.length - 1]);
        setPaginaXP((prev) => prev + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const paginaUrmatoareProbleme = async () => {
    if (!ultimulDocProbleme) return;
    try {
      const nextQ = query(collection(db, 'users'), orderBy('problemeRezolvateCount', 'desc'), startAfter(ultimulDocProbleme), limit(USERS_PER_PAGE));
      const snap = await getDocs(nextQ);
      if (!snap.empty) {
        const noiUseri = snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((u) => u.role !== 'teacher');
        setTopProbleme((prev) => [...prev, ...noiUseri]);
        setUltimulDocProbleme(snap.docs[snap.docs.length - 1]);
        setPaginaProbleme((prev) => prev + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const paginaInapoiXP = () => { if (paginaXP > 1) setPaginaXP((prev) => prev - 1); };
  const paginaInapoiProbleme = () => { if (paginaProbleme > 1) setPaginaProbleme((prev) => prev - 1); };

  function getBadge(count) {
    if (count >= 100) return <Crown size={16} color="#fff700" strokeWidth={2.5} />;
    if (count >= 50) return <WandSparkles size={16} color="#acc91d" strokeWidth={2.5} />;
    if (count >= 30) return <Swords size={16} color="#adadad" strokeWidth={2.5} />;
    if (count >= 15) return <HandFist size={16} color="#af0e0e" strokeWidth={2.5} />;
    if (count >= 5) return <Flame size={16} color="#f2ae1c" strokeWidth={2.5} />;
    if (count >= 1) return <Leaf size={16} color="#7dc931" strokeWidth={2.5} />;
    return '';
  }

  function getUsers(lista, pagina) {
    const start = (pagina - 1) * USERS_PER_PAGE;
    return lista.slice(start, start + USERS_PER_PAGE);
  }

  const areMoreXP = getUsers(topXP, paginaXP + 1).length > 0 || ultimulDocXP !== null;
  const areMoreProbleme = getUsers(topProbleme, paginaProbleme + 1).length > 0 || ultimulDocProbleme !== null;

  if (loading) return <div className="loader">Se încarcă...</div>;

  return (
    <div className="clasament-page" data-theme={theme}>
      <h1>
        <img src="/logo-infomotion.svg" alt="logo" id="arena-badge" />
        Arena Info-Motion
        <img src="/logo-infomotion.svg" alt="logo" id="arena-badge" />
      </h1>

      {/* SOSIRE OPTIMIZARE: Trimitem datele gata citite către componenta copil */}
      <Arena datePreincarcate={arenaData} />

      <div className="topuri-container">
        {/* Secțiunea ta vizuală cu Top General și The Grinders rămâne neschimbată */}
        <section className="top-section">
          <div className="leaderboard-card">
            <h2><Sparkles size={16} color="#ffe224" strokeWidth={2.5} /> Top General</h2>
            {getUsers(topXP, paginaXP).map((user, index) => {
              const pozitie = (paginaXP - 1) * USERS_PER_PAGE + index + 1;
              return (
                <div key={user.id} className={`user-row ${pozitie === 1 ? 'rank-1' : ''}`}>
                  <span className="rank">#{pozitie}</span>
                  <span className="username">{user.nume || 'Anonim'}<span style={{ marginLeft: 5 }}>{getBadge(user.problemeRezolvateCount || 0)}</span></span>
                  <span className="value">{user.puncteTotale || 0} XP</span>
                </div>
              );
            })}
            <div className="pagination">
              <button className="page-btn" disabled={paginaXP === 1} onClick={paginaInapoiXP}>Înapoi</button>
              <span className="page-info">Pagina {paginaXP}</span>
              <button className="page-btn" disabled={!areMoreXP} onClick={paginaUrmatoareXP}>Înainte</button>
            </div>
          </div>
        </section>

        <section className="top-section">
          <div className="leaderboard-card">
            <h2><PencilRuler size={16} color="#23a9b3" strokeWidth={2.5} /> The Grinders</h2>
            {getUsers(topProbleme, paginaProbleme).map((user, index) => {
              const pozitie = (paginaProbleme - 1) * USERS_PER_PAGE + index + 1;
              return (
                <div key={user.id} className={`user-row ${pozitie <= 3 ? 'highlight-grinder' : ''}`}>
                  <span className="rank">#{pozitie}</span>
                  <span className="username">{user.nume || 'Anonim'}<span style={{ marginLeft: 5 }}>{getBadge(user.problemeRezolvateCount || 0)}</span></span>
                  <span className="value">{user.problemeRezolvateCount || 0} Soluții</span>
                </div>
              );
            })}
            <div className="pagination">
              <button className="page-btn" disabled={paginaProbleme === 1} onClick={paginaInapoiProbleme}>Înapoi</button>
              <span className="page-info">Pagina {paginaProbleme}</span>
              <button className="page-btn" disabled={!areMoreProbleme} onClick={paginaUrmatoareProbleme}>Înainte</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Clasament;