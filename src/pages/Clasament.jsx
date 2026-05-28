import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

import { db } from '../firebase';
import { useTheme } from '../context/ThemeContext';

import Arena from '../components/Arena';

import '../pages_css/clasament.css';
import { Sparkles, PencilRuler, Flame, Crown, WandSparkles, Swords, HandFist, Leaf } from 'lucide-react';

function Clasament() {
  const { theme } = useTheme();

  const [topXP, setTopXP] = useState([]);
  const [topProbleme, setTopProbleme] = useState([]);

  const [loading, setLoading] = useState(true);

  const [paginaXP, setPaginaXP] = useState(1);
  const [paginaProbleme, setPaginaProbleme] = useState(1);

  const USERS_PER_PAGE = 10;

useEffect(() => {
  const loadClasament = async () => {
    try {
      const xpQuery = query(
        collection(db, 'users'),
        orderBy('puncteTotale', 'desc'),
        limit(200)
      );

      const problemeQuery = query(
        collection(db, 'users'),
        orderBy('problemeRezolvateCount', 'desc'),
        limit(200)
      );

      const xpSnapshot = await getDocs(xpQuery);
      const problemeSnapshot = await getDocs(problemeQuery);

      const xpData = xpSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter((user) => user.role !== 'teacher');

      const problemeData = problemeSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter((user) => user.role !== 'teacher');

      setTopXP(xpData);
      setTopProbleme(problemeData);
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

  loadClasament();
}, []);

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
    const end = start + USERS_PER_PAGE;

    return lista.slice(start, end);
  }

  const totalPaginiXP = Math.ceil(topXP.length / USERS_PER_PAGE);
  const totalPaginiProbleme = Math.ceil(
    topProbleme.length / USERS_PER_PAGE
  );

  if (loading) {
    return <div className="loader">Se încarcă...</div>;
  }

  return (
    <div className="clasament-page" data-theme={theme}>
      <h1>
        <img src="/logo-infomotion.svg" alt="logo" id="arena-badge" />
        Arena Info-Motion
        <img src="/logo-infomotion.svg" alt="logo" id="arena-badge" />
      </h1>

      <Arena />

      <div className="topuri-container">
        <section className="top-section">
          <div className="leaderboard-card">
            <h2><Sparkles size={16} color="#ffe224" strokeWidth={2.5} /> Top General</h2>

            {getUsers(topXP, paginaXP).map((user, index) => {
              const pozitie =
                (paginaXP - 1) * USERS_PER_PAGE + index + 1;

              return (
                <div
                  key={user.id}
                  className={`user-row ${pozitie === 1 ? 'rank-1' : ''}`}
                >
                  <span className="rank">#{pozitie}</span>

                  <span className="username">
                    {user.nume || 'Anonim'}

                    <span style={{ marginLeft: 5 }}>
                      {getBadge(user.problemeRezolvateCount || 0)}
                    </span>
                  </span>

                  <span className="value">
                    {user.puncteTotale || 0} XP
                  </span>
                </div>
              );
            })}

            {totalPaginiXP > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  disabled={paginaXP === 1}
                  onClick={() => setPaginaXP(paginaXP - 1)}
                >
                  Înapoi
                </button>

                <span className="page-info">
                  {paginaXP} / {totalPaginiXP}
                </span>

                <button
                  className="page-btn"
                  disabled={paginaXP === totalPaginiXP}
                  onClick={() => setPaginaXP(paginaXP + 1)}
                >
                  Înainte
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="top-section">
          <div className="leaderboard-card">
            <h2><PencilRuler size={16} color="#23a9b3" strokeWidth={2.5} /> The Grinders</h2>

            {getUsers(topProbleme, paginaProbleme).map((user, index) => {
              const pozitie =
                (paginaProbleme - 1) * USERS_PER_PAGE + index + 1;

              return (
                <div
                  key={user.id}
                  className={`user-row ${
                    pozitie <= 3 ? 'highlight-grinder' : ''
                  }`}
                >
                  <span className="rank">#{pozitie}</span>

                  <span className="username">
                    {user.nume || 'Anonim'}

                    <span style={{ marginLeft: 5 }}>
                      {getBadge(user.problemeRezolvateCount || 0)}
                    </span>
                  </span>

                  <span className="value">
                    {user.problemeRezolvateCount || 0} Soluții
                  </span>
                </div>
              );
            })}

            {totalPaginiProbleme > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  disabled={paginaProbleme === 1}
                  onClick={() => setPaginaProbleme(paginaProbleme - 1)}
                >
                  Înapoi
                </button>

                <span className="page-info">
                  {paginaProbleme} / {totalPaginiProbleme}
                </span>

                <button
                  className="page-btn"
                  disabled={paginaProbleme === totalPaginiProbleme}
                  onClick={() =>
                    setPaginaProbleme(paginaProbleme + 1)
                  }
                >
                  Înainte
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Clasament;
