import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import '../pages_css/Lectii.css';
import { Search } from 'lucide-react';

function Lectii() {
  const [lessonsData, setLessonsData] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('toate');

  useEffect(() => {
    let isMounted = true;

    async function fetchLectii() {
      // 🚀 Trecem la cache v3 pentru a goli datele vechi și a aduce lecția despre Complexitate!
      const cachedLessons = localStorage.getItem('infomotion_lessons_cache_v3');
      if (cachedLessons) {
        setLessonsData(JSON.parse(cachedLessons));
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "lectii"));
        const lectiiDinDB = querySnapshot.docs.map(doc => {
          const data = doc.data();
          const esteOlimpiada = data.clasa?.toLowerCase() === 'olimpici' || data.categorie === 'olimpiada';
          const esteConcept = data.clasa?.toLowerCase() === 'concepte' || data.categorie === 'concepte';
          
          let extrasClasa = 9; 
          if (data.clasa) {
            const digits = data.clasa.toString().match(/\d+/);
            if (digits) {
              extrasClasa = parseInt(digits[0], 10);
            }
          } else if (data.titlu) {
            const digits = data.titlu.toString().match(/\d+/);
            if (digits) {
              extrasClasa = parseInt(digits[0], 10);
            }
          }

          return {
            id: doc.id,
            ...data,
            clasaNumerica: extrasClasa,
            esteOlimpiada,
            esteConcept
          };
        });

        if (isMounted) {
          setLessonsData(lectiiDinDB);
          // Salvare în cache v3
          localStorage.setItem('infomotion_lessons_cache_v3', JSON.stringify(lectiiDinDB));
        }
      } catch (error) {
        console.error("Eroare la preluarea lecțiilor:", error);
      }
      if (isMounted) setLoading(false);
    }

    fetchLectii();
    return () => { isMounted = false; };
  }, []);

  const filteredLessons = lessonsData
    .filter((lectie) => {
      const matchesSearch = 
        (lectie.titlu?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (lectie.descriere?.toLowerCase() || "").includes(searchTerm.toLowerCase());
     
      let matchesFilter = false;
      if (activeFilter === 'toate') {
        matchesFilter = true;
      } else if (activeFilter === 'olimpici') {
        matchesFilter = lectie.esteOlimpiada;
      } else if (activeFilter === 'concepte') {
        // Acum verifică corect dacă este setat ca fiind concept general
        matchesFilter = lectie.esteConcept;
      } else {
        const clasaTinta = parseInt(activeFilter.split('-')[1]);
        matchesFilter = lectie.clasaNumerica === clasaTinta && !lectie.esteOlimpiada && !lectie.esteConcept;
      }
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const getGroup = (item) => {
        if (!item.esteOlimpiada && !item.esteConcept) {
          if (item.clasaNumerica === 9) return 1;
          if (item.clasaNumerica === 10) return 2;
          if (item.clasaNumerica === 11) return 3;
          return 4;
        }
        if (item.esteOlimpiada) return 10;
        if (item.esteConcept) return 20; // Concepte rămân la sfârșit ordonate frumos
        return 999;
      };

      const grupA = getGroup(a);
      const grupB = getGroup(b);

      if (grupA !== grupB) {
        return grupA - grupB;
      }

      if (grupA === 10) {
        if (a.clasaNumerica !== b.clasaNumerica) {
          return a.clasaNumerica - b.clasaNumerica;
        }
      }

      const ordineA = a.ordine !== undefined && a.ordine !== null ? parseInt(a.ordine, 10) : 999;
      const ordineB = b.ordine !== undefined && b.ordine !== null ? parseInt(b.ordine, 10) : 999;
      
      if (ordineA !== ordineB) {
        return ordineA - ordineB;
      }

      return (a.titlu || "").localeCompare(b.titlu || "");
    });

  const getFilterLabel = (filter) => {
    if (filter === 'toate') return 'Toate';
    if (filter === 'olimpici') return 'Olimpici';
    if (filter === 'concepte') return 'Concepte'; // Schimbat din Termeni -> Concepte
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
            <span className="search-icon"><Search size={22} color="#23a9b3" strokeWidth={3} /></span>
            <input 
              type="text" 
              placeholder="Caută o lecție (ex: Complexitate, vectori...)" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="class-filters">
            {/* Înlocuit valoarea 'termeni' cu 'concepte' pentru butoane */}
            {['toate', 'clasa-9', 'clasa-10', 'clasa-11', 'olimpici', 'concepte'].map((f) => (
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
                    ? 'CONCEPTE GENERAL' 
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