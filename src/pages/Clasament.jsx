import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import '../pages_css/clasament.css';
import Arena from '../components/Arena';

function Clasament() {
  const { theme } = useTheme();
  const [topGeneral, setTopGeneral] = useState([]);
  const [topGrinders, setTopGrinders] = useState([]);
  const [loading, setLoading] = useState(true);

  const afiseazaInsignaUtilizator = (count) => {
  if (count >= 100)
    return (
      <span title="Boss Final" style={{ marginLeft: '6px', cursor: 'help' }}>
        👑
      </span>
    );

  if (count >= 50)
    return (
      <span title="Mage de Algoritmi" style={{ marginLeft: '6px', cursor: 'help' }}>
        🧙‍♂️
      </span>
    );

  if (count >= 30)
    return (
      <span title="Arena Grinder" style={{ marginLeft: '6px', cursor: 'help' }}>
        ⚔️
      </span>
    );

  if (count >= 15)
    return (
      <span title="Miner de XP" style={{ marginLeft: '6px', cursor: 'help' }}>
        ⚒️
      </span>
    );

  if (count >= 5)
    return (
      <span title="Combo Mic" style={{ marginLeft: '6px', cursor: 'help' }}>
        🔥
      </span>
    );

  if (count >= 1)
    return (
      <span title="Primul Craft" style={{ marginLeft: '6px', cursor: 'help' }}>
        🌱
      </span>
    );

  return null;
};

  useEffect(() => {
    async function fetchTopuri() {
      setLoading(true);
      try {
        const qGeneral = query(collection(db, "users"), orderBy("puncteTotale", "desc"), limit(10));
        const snapGeneral = await getDocs(qGeneral);
        setTopGeneral(snapGeneral.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const qGrinders = query(collection(db, "users"), orderBy("problemeRezolvateCount", "desc"), limit(10));
        const snapGrinders = await getDocs(qGrinders);
        setTopGrinders(snapGrinders.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Eroare la încărcarea clasamentului:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTopuri();
  }, []);

  if (loading) return <div className="loader">Se încarcă Arena...</div>;

  return (
    <div className="clasament-page" data-theme={theme}>
      
      <h1>  <img src="/logo-infomotion.svg" alt="logo" id='arena-badge' />Arena Info-Motion <img src="/logo-infomotion.svg" alt="logo" id='arena-badge' /></h1>
      <br />
      <br />      
      <Arena />

      <div className="topuri-container">
        {/* SECȚIUNEA TOP GENERAL */}
        <section className="top-section">
         
          <div className="leaderboard-card">
            <h2>🌟 Top General (XP)</h2>
            <br />
            {topGeneral.map((user, index) => (
              <div key={user.id} className={`user-row ${index === 0 ? 'rank-1' : ''}`}>
                <span className="rank">#{index + 1}</span>
                <span className="username">
                  {user.nume || "Anonim"}
                  {/* 🌟 Adăugat: Afișează insigna dinamic în funcție de problemele contului în Top XP */}
                  {afiseazaInsignaUtilizator(user.problemeRezolvateCount || 0)}
                </span>
                <span className="value">{user.puncteTotale || 0} XP</span>
              </div>
            ))}
          </div>
        </section>

        {/* SECȚIUNEA THE GRINDERS */}
        <section className="top-section">
          
          <div className="leaderboard-card">
            <h2>🛠️ The Grinders (Probleme)</h2>
            {topGrinders.map((user, index) => (
              <div key={user.id} className={`user-row ${index < 3 ? 'highlight-grinder' : ''}`}>
                <span className="rank">#{index + 1}</span>
                <span className="username">
                  {user.nume}
                  {/* 🌟 Adăugat: Afișează insigna dinamic și în topul de probleme */}
                  {afiseazaInsignaUtilizator(user.problemeRezolvateCount || 0)}
                </span>
                <span className="value">{user.problemeRezolvateCount || 0} Soluții</span>
              </div>
            ))}
          </div>
        </section>
      </div>

    </div>
  );
}

export default Clasament;