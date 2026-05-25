import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import '../pages_css/Lectii.css';

function Lectii() {
  const [lessonsData, setLessonsData] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('toate');

  useEffect(() => {
    async function fetchLectii() {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "lectii"));
        const lectiiDinDB = querySnapshot.docs.map(doc => {
          const data = doc.data();
          
          
          const esteOlimpiada = data.clasa?.toLowerCase() === 'olimpici' || data.categorie === 'olimpiada';
          const esteConcept = data.clasa?.toLowerCase() === 'concepte' || data.categorie === 'concepte';
          
          let extrasClasa = 9;
          if (!esteOlimpiada && !esteConcept) {
            extrasClasa = data.clasa ? parseInt(data.clasa.toString().replace(/^\D+/g, '')) : 9;
          }

          return {
            id: doc.id,
            ...data,
            clasaNumerica: extrasClasa,
            esteOlimpiada,
            esteConcept
          };
        });
        setLessonsData(lectiiDinDB);
      } catch (error) {
        console.error("Eroare la preluarea lecțiilor:", error);
      }
      setLoading(false);
    }

    fetchLectii();
  }, []);

  const filteredLessons = lessonsData
    .filter((lectie) => {
      // 1. Filtrare după Search
      const matchesSearch = 
        (lectie.titlu?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (lectie.descriere?.toLowerCase() || "").includes(searchTerm.toLowerCase());
     
      // 2. Filtrare după Categorie / Clasă
      let matchesFilter = false;
      if (activeFilter === 'toate') {
        matchesFilter = true;
      } else if (activeFilter === 'olimpici') {
        matchesFilter = lectie.esteOlimpiada;
      } else if (activeFilter === 'concepte') {
        matchesFilter = lectie.esteConcept;
      } else {

        const clasaTinta = parseInt(activeFilter.split('-')[1]);
        
        matchesFilter = lectie.clasaNumerica === clasaTinta && !lectie.esteOlimpiada && !lectie.esteConcept;
      }
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      // Prioritizăm sortarea: dacă ambele sunt de clasă numerică, le sortăm normal
      if (a.clasaNumerica !== b.clasaNumerica) {
        return a.clasaNumerica - b.clasaNumerica;
      }
      
      const ordineA = a.ordine !== undefined && a.ordine !== null ? a.ordine : 999;
      const ordineB = b.ordine !== undefined && b.ordine !== null ? b.ordine : 999;
      
      return ordineA - ordineB;
    });

  // Funcție helper ca să returneze textul potrivit pe buton
  const getFilterLabel = (filter) => {
    if (filter === 'toate') return 'Toate';
    if (filter === 'olimpici') return 'Olimpici';
    if (filter === 'concepte') return 'Termeni';
    return `Clasa ${filter.split('-')[1]}`;
  };

  return (
    <div className="page-wrapper">
      <main className="lectii-container">
        <div className="lectii-header">
          <h1>Module de <span>Învățare</span></h1>
          <p>Alege o lecție și descoperă algoritmii prin animații interactive.</p>
        </div>

        <div className="filters-section">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Caută o lecție (ex: Bubble Sort, vectori...)" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="class-filters">
            {['toate', 'clasa-9', 'clasa-10', 'clasa-11', 'olimpici', 'termeni'].map((f) => (
              <button 
                key={f}
                className={activeFilter === f ? 'filter-btn active' : 'filter-btn'} 
                onClick={() => setActiveFilter(f)}
              >
                {getFilterLabel(f)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loader"></div>
            <p>Se încarcă modulele din Cloud...</p>
          </div>
        ) : filteredLessons.length > 0 ? (
          <div className="lectii-grid">
            {filteredLessons.map((lectie) => (
              <Link to={`/lectie/${lectie.id}`} key={lectie.id} className="lectie-card">
                <div className={`lectie-badge ${lectie.esteOlimpiada ? 'badge-olimpiada' : lectie.esteConcept ? 'badge-concepte' : ''}`}>
                  {lectie.esteOlimpiada 
                    ? 'OLIMPIADĂ' 
                    : lectie.esteConcept 
                    ? 'CONCEPTE & TLE' 
                    : (lectie.clasa?.toUpperCase().replace('-', ' ') || `CLASA ${lectie.clasaNumerica}`)}
                  {lectie.ordine ? ` • Modulul ${lectie.ordine}` : ''}
                </div>
                <h3 className="lectie-titlu">{lectie.titlu}</h3>
                <p className="lectie-descriere">{lectie.descriere}</p>
                <div className="lectie-footer-card">
                  <span>Începe lecția</span>
                  <span className="arrow">→</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <h3>Nu am găsit nicio lecție.</h3>
            <p>Încearcă să folosești alte cuvinte cheie.</p>
            <button className="reset-btn" onClick={() => { setSearchTerm(''); setActiveFilter('toate'); }}>
              Resetează filtrele
            </button>
          </div>
        )}
      </main>
      
    </div>
  );
}

export default Lectii;