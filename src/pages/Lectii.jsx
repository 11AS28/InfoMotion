import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import '../pages_css/Lectii.css';
import { Search, Star } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';
import { useAuth } from '../context/AuthContext';

function Lectii() {
  const { currentUser, esteLectieSalvata, toggleBookmarkLectie } = useAuth();

  const [lessonsData, setLessonsData] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('toate');

  useEffect(() => {
    let emontata = true;

    async function fetchLectii() {
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

        if (emontata) {
          setLessonsData(lectiiDinDB);
          localStorage.setItem('infomotion_lessons_cache_v3', JSON.stringify(lectiiDinDB));
        }
      } catch (error) {
        console.error("Eroare la preluarea lecțiilor:", error);
      }
      if (emontata) setLoading(false);
    }

    fetchLectii();
    return () => { emontata = false; };
  }, []);

  const handleToggleBookmark = (e, idLectie) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      alert("Trebuie să fii logat ca să salvezi lecții!");
      return;
    }
    toggleBookmarkLectie(idLectie);
  };

  const filteredLessons = lessonsData
    .filter((lectie) => {
      const matchesSearch = 
        (lectie.titlu?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (lectie.descriere?.toLowerCase() || "").includes(searchTerm.toLowerCase());
     
      let matchesFilter = false;
      if (activeFilter === 'toate') {
        matchesFilter = true;
      } else if (activeFilter === 'salvate') {
        matchesFilter = esteLectieSalvata(lectie.id);
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
      const getGroup = (item) => {
        if (!item.esteOlimpiada && !item.esteConcept) {
          if (item.clasaNumerica === 9) return 1;
          if (item.clasaNumerica === 10) return 2;
          if (item.clasaNumerica === 11) return 3;
          return 4;
        }
        if (item.esteOlimpiada) return 10;
        if (item.esteConcept) return 20; 
        return 999;
      };

      const grupA = getGroup(a);
      const grupB = getGroup(b);

      if (grupA !== grupB) return grupA - grupB;

      if (grupA === 10) {
        if (a.clasaNumerica !== b.clasaNumerica) {
          return a.clasaNumerica - b.clasaNumerica;
        }
      }

      const ordineA = a.ordine !== undefined && a.ordine !== null ? parseInt(a.ordine, 10) : 999;
      const ordineB = b.ordine !== undefined && b.ordine !== null ? parseInt(b.ordine, 10) : 999;
      
      if (ordineA !== ordineB) return ordineA - ordineB;

      return (a.titlu || "").localeCompare(b.titlu || "");
    });

  const getFilterLabel = (filter) => {
    if (filter === 'toate') return 'Toate';
    if (filter === 'olimpici') return 'Olimpici';
    if (filter === 'concepte') return 'Concepte'; 
    if (filter === 'salvate') return 'Salvate';
    return `Clasa ${filter.split('-')[1]}`;
  };

  const getDynamicSubtitle = () => {
    switch (activeFilter) {
     case 'toate':
        return 'Salut! Bine ai venit în universul InfoMotion. Fie că ești la început de drum în C++ sau te pregătești pentru performanță, selectează o categorie de mai jos și hai să explorăm împreună algoritmii prin animații interactive.';
      case 'clasa-9':
        return 'Fundamentele programării în C++. De la elemente de bază, structuri repetitive și decizionale, până la stăpânirea vectorilor.';
      case 'clasa-10':
        return 'Trecem la nivelul următor. Explorează subprograme, recursivitate, matrici (tablouri bidimensionale) și structuri de date complexe.';
      case 'clasa-11':
        return 'Pregătire avansată. Descoperă tehnici fundamentale de programare precum Greedy, Backtracking, programare dinamică și teoria grafurilor.';
      case 'olimpici':
        return 'Explorează algoritmi și tehnici specifice competițiilor. Te vor ajuta nu doar să obții punctaje maxime în concursuri, ci și să îți dezvolți o gândire analitică solidă, esențială pentru a stăpâni informatica cu adevărat.';
      case 'concepte':
        return 'Sintaxă, structuri de date și paradigme esențiale în C++. Baza de care ai nevoie pentru a scrie un cod curat, eficient și optimizat, indiferent de problema pe care încerci să o rezolvi.';
      case 'salvate':
        return 'Aici găsești toate lecțiile pe care le-ai salvat pentru mai târziu. Perfect pentru recapitulare rapidă înainte de un test sau o olimpiadă.';
      default:
        return 'Alege o lecție și descoperă algoritmii prin animații interactive.';
    }
  };

  return (
    <div className="page-wrapper">
      {usePageTitle("InfoMotion - Module de Învățare")}
      <main className="lectii-container">
        <div className="lectii-header">
          <h1>Module de <span>Învățare</span></h1>
          <p key={activeFilter} className="lectii-subtitle-dynamic">
            {getDynamicSubtitle()}
          </p>
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
            {['toate', 'clasa-9', 'clasa-10', 'clasa-11', 'olimpici', 'concepte', 'salvate'].map((f) => (
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
              <Link
                to={`/lectie/${lectie.id}`}
                key={lectie.id}
                className="lectie-card"
                style={{ position: 'relative' }}
              >
                <button
                  className="bookmark-star-btn"
                  onClick={(e) => handleToggleBookmark(e, lectie.id)}
                  title={esteLectieSalvata(lectie.id) ? "Elimină din bookmark-uri" : "Salvează pentru mai târziu"}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(0,0,0,0.35)',
                    border: '1px solid rgba(31, 224, 249, 0.25)',
                    borderRadius: '50%',
                    padding: '6px',
                    cursor: 'pointer',
                    zIndex: 5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Star
                    size={18}
                    strokeWidth={2}
                    color="#1fe0f9"
                    fill={esteLectieSalvata(lectie.id) ? "#1fe0f9" : "none"}
                  />
                </button>

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
            <h3>
              {activeFilter === 'salvate'
                ? "Nu ai salvat încă nicio lecție."
                : "Nu am găsit nicio lecție."}
            </h3>
            <p>
              {activeFilter === 'salvate'
                ? "Apasă pe steluță pe orice lecție ca să o adaugi aici."
                : "Încearcă să folosești alte cuvinte cheie."}
            </p>
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