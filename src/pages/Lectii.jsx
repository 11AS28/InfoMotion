import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// Eliminăm importul local: import { lessonsData } from '../lessonsData';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import Nav from '../components/nav';
import Footer from '../components/footer';
import '../pages_css/Lectii.css';

function Lectii() {
  const [lessonsData, setLessonsData] = useState([]); // Starea pentru lecțiile din DB
  const [loading, setLoading] = useState(true); // Starea de încărcare
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('toate');

  // 1. Extragerea datelor din Firebase la încărcarea paginii
  useEffect(() => {
    async function fetchLectii() {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "lectii"));
        const lectiiDinDB = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setLessonsData(lectiiDinDB);
      } catch (error) {
        console.error("Eroare la preluarea lecțiilor:", error);
      }
      setLoading(false);
    }

    fetchLectii();
  }, []);

  // 2. Logica de filtrare (rămâne identică, dar aplicată pe starea locală)
  const filteredLessons = lessonsData.filter((lectie) => {
    const matchesSearch = 
      (lectie.titlu?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (lectie.descriere?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    
    const matchesClass = activeFilter === 'toate' || lectie.clasa === activeFilter;
    
    return matchesSearch && matchesClass;
  });

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
            {['toate', 'clasa-9', 'clasa-10', 'clasa-11'].map((f) => (
              <button 
                key={f}
                className={activeFilter === f ? 'filter-btn active' : 'filter-btn'} 
                onClick={() => setActiveFilter(f)}
              >
                {f === 'toate' ? 'Toate' : `Clasa ${f.split('-')[1]}`}
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
                <div className="lectie-badge">
                  {lectie.clasa?.toUpperCase().replace('-', ' ') || 'CLASA'}
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