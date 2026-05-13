import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import '../components_css/clasament.css';

function Clasament() {
  const { theme } = useTheme();
  const [topGeneral, setTopGeneral] = useState([]);
  const [topGrinders, setTopGrinders] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Extragem primii 3 pentru podiumul de XP
  const podium = topGeneral.slice(0, 3);
  const restGeneral = topGeneral.slice(3);

  return (
    <div className="clasament-page" data-theme={theme}>
      <div className="clasament-header">
        <h1>🏆 Arena Info-Motion</h1>
        <p>Cei mai buni programatori din comunitate Info-Motion</p>
      </div>

      {/* --- SECTIUNEA PODIUM XP --- */}
      <div className="podium-section">
        <h2 className="section-title">🌟 Top General (XP)</h2>
        <div className="podium-wrapper">
          {/* Locul 2 */}
          <div className="podium-box rank-2">
            <div className="avatar">{podium[1]?.nume?.[0] || "?"}</div>
            <div className="name">{podium[1]?.nume || "---"}</div>
            <div className="xp-badge">{podium[1]?.puncteTotale || 0} XP</div>
            <div className="step">2</div>
          </div>

          {/* Locul 1 */}
          <div className="podium-box rank-1">
            <div className="crown">👑</div>
            <div className="avatar">{podium[0]?.nume?.[0] || "?"}</div>
            <div className="name">{podium[0]?.nume || "---"}</div>
            <div className="xp-badge">{podium[0]?.puncteTotale || 0} XP</div>
            <div className="step">1</div>
          </div>

          {/* Locul 3 */}
          <div className="podium-box rank-3">
            <div className="avatar">{podium[2]?.nume?.[0] || "?"}</div>
            <div className="name">{podium[2]?.nume || "---"}</div>
            <div className="xp-badge">{podium[2]?.puncteTotale || 0} XP</div>
            <div className="step">3</div>
          </div>
        </div>
      </div>

      <div className="topuri-grid">
        {/* --- LISTA RESTUL TOPULUI GENERAL --- */}
        <section className="list-section">
          <h3>Top 10 Programatori</h3>
          <div className="custom-table">
            {restGeneral.map((user, index) => (
              <div key={user.id} className="custom-row">
                <span className="c-rank">#{index + 4}</span>
                <span className="c-user">{user.nume}</span>
                <span className="c-val">{user.puncteTotale} XP</span>
              </div>
            ))}
          </div>
        </section>

        {/* --- TOP GRINDERS --- */}
        <section className="list-section">
          <h3>🛠️ The Grinders (Probleme)</h3>
          <div className="custom-table">
            {topGrinders.map((user, index) => (
              <div key={user.id} className={`custom-row ${index < 3 ? 'highlight-grinder' : ''}`}>
                <span className="c-rank">#{index + 1}</span>
                <span className="c-user">{user.nume}</span>
                <span className="c-val">{user.problemeRezolvateCount || 0} Soluții</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Clasament;