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

  useEffect(() => {
    async function fetchTopuri() {
      setLoading(true);
      try {
        // 1. Top General (după Puncte XP)
        const qGeneral = query(
          collection(db, "users"),
          orderBy("puncteTotale", "desc"),
          limit(10)
        );
        const snapGeneral = await getDocs(qGeneral);
        setTopGeneral(snapGeneral.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // 2. Top Grinders (după numărul de probleme rezolvate)
        const qGrinders = query(
          collection(db, "users"),
          orderBy("problemeRezolvateCount", "desc"),
          limit(10)
        );
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

  if (loading) return <div className="loader">Se încarcă clasamentul...</div>;

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
                <span className="username">{user.nume || "Anonim"}</span>
                <span className="value">{user.puncteTotale || 0} XP</span>
              </div>
            ))}
          </div>
        </section>

        {/* SECȚIUNEA THE GRINDERS */}
        <section className="top-section">
          
          <div className="leaderboard-card">
            <h2>🛠️ The Grinders (Probleme)</h2>
            <br />
            {topGrinders.map((user, index) => (
              <div key={user.id} className="user-row">
                <span className="rank">#{index + 1}</span>
                <span className="username">{user.nume || "Anonim"}</span>
                <span className="value">{user.problemeRezolvateCount || 0} Rezolvate</span>
              </div>
            ))}
          </div>
        </section>
      </div>



    </div>
  );
}

export default Clasament;