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

  // Paginare separată pentru fiecare top
  const [pageGeneral, setPageGeneral] = useState(1);
  const [pageGrinders, setPageGrinders] = useState(1);
  const perPage = 10;

  const afiseazaInsignaUtilizator = (count) => {
    if (count >= 100) return <span title="Boss Final" style={{ marginLeft: '6px', cursor: 'help' }}>👑</span>;
    if (count >= 50)  return <span title="Mage de Algoritmi" style={{ marginLeft: '6px', cursor: 'help' }}>🧙‍♂️</span>;
    if (count >= 30)  return <span title="Arena Grinder" style={{ marginLeft: '6px', cursor: 'help' }}>⚔️</span>;
    if (count >= 15)  return <span title="Miner de XP" style={{ marginLeft: '6px', cursor: 'help' }}>⚒️</span>;
    if (count >= 5)   return <span title="Combo Mic" style={{ marginLeft: '6px', cursor: 'help' }}>🔥</span>;
    if (count >= 1)   return <span title="Primul Craft" style={{ marginLeft: '6px', cursor: 'help' }}>🌱</span>;
    return null;
  };

  useEffect(() => {
    async function fetchTopuri() {
      setLoading(true);
      try {
        // ✅ Mărit la 200 pentru ambele topuri
        const qGeneral = query(collection(db, "users"), orderBy("puncteTotale", "desc"), limit(200));
        const snapGeneral = await getDocs(qGeneral);
        setTopGeneral(snapGeneral.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const qGrinders = query(collection(db, "users"), orderBy("problemeRezolvateCount", "desc"), limit(200));
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

  // Helper: returnează rândurile pentru pagina curentă
  const getPagina = (lista, page) => {
    const start = (page - 1) * perPage;
    return lista.slice(start, start + perPage);
  };

  const totalPaginiGeneral  = Math.ceil(topGeneral.length / perPage);
  const totalPaginiGrinders = Math.ceil(topGrinders.length / perPage);

  // Componenta mică de paginare refolosibilă
  const Paginare = ({ page, total, onPrev, onNext }) => (
    <div className="pagination">
      <button className="page-btn" onClick={onPrev} disabled={page === 1}>
        &laquo; Înapoi
      </button>
      <span className="page-info">{page} / {total}</span>
      <button className="page-btn" onClick={onNext} disabled={page === total || total === 0}>
        Înainte &raquo;
      </button>
    </div>
  );

  if (loading) return <div className="loader">Se încarcă Arena...</div>;

  return (
    <div className="clasament-page" data-theme={theme}>

      <h1>
        <img src="/logo-infomotion.svg" alt="logo" id='arena-badge' />
        Arena Info-Motion
        <img src="/logo-infomotion.svg" alt="logo" id='arena-badge' />
      </h1>
      <br /><br />

      <Arena />

      <div className="topuri-container">

        {/* TOP GENERAL XP */}
        <section className="top-section">
          <div className="leaderboard-card">
            <h2>🌟 Top General (XP)</h2>
            <br />
            {getPagina(topGeneral, pageGeneral).map((user, index) => {
              const realRank = (pageGeneral - 1) * perPage + index + 1;
              return (
                <div key={user.id} className={`user-row ${realRank === 1 ? 'rank-1' : ''}`}>
                  <span className="rank">#{realRank}</span>
                  <span className="username">
                    {user.nume || "Anonim"}
                    {afiseazaInsignaUtilizator(user.problemeRezolvateCount || 0)}
                  </span>
                  <span className="value">{user.puncteTotale || 0} XP</span>
                </div>
              );
            })}

            {totalPaginiGeneral > 1 && (
              <Paginare
                page={pageGeneral}
                total={totalPaginiGeneral}
                onPrev={() => setPageGeneral(p => Math.max(p - 1, 1))}
                onNext={() => setPageGeneral(p => Math.min(p + 1, totalPaginiGeneral))}
              />
            )}
          </div>
        </section>

        {/* THE GRINDERS */}
        <section className="top-section">
          <div className="leaderboard-card">
            <h2>🛠️ The Grinders (Probleme)</h2>
            <br />
            {getPagina(topGrinders, pageGrinders).map((user, index) => {
              const realRank = (pageGrinders - 1) * perPage + index + 1;
              return (
                <div key={user.id} className={`user-row ${realRank <= 3 ? 'highlight-grinder' : ''}`}>
                  <span className="rank">#{realRank}</span>
                  <span className="username">
                    {user.nume}
                    {afiseazaInsignaUtilizator(user.problemeRezolvateCount || 0)}
                  </span>
                  <span className="value">{user.problemeRezolvateCount || 0} Soluții</span>
                </div>
              );
            })}

            {totalPaginiGrinders > 1 && (
              <Paginare
                page={pageGrinders}
                total={totalPaginiGrinders}
                onPrev={() => setPageGrinders(p => Math.max(p - 1, 1))}
                onNext={() => setPageGrinders(p => Math.min(p + 1, totalPaginiGrinders))}
              />
            )}
          </div>
        </section>

      </div>
    </div>
  );
}

export default Clasament;