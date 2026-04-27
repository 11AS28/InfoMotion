import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { lessonsData } from '../lessonsData';
import Nav from '../components/nav';
import Footer from '../components/footer';
import '../pages_css/Lectii.css';

function Lectii() {
  // Starea pentru bara de căutare (ce text introduce utilizatorul)
  const [searchTerm, setSearchTerm] = useState('');
  
  // Starea pentru filtru (pe ce buton de clasă a apăsat) - default e "toate"
  const [activeFilter, setActiveFilter] = useState('toate');

  // Logica de filtrare: păstrăm doar lecțiile care respectă ambele condiții (căutare ȘI clasă)
  const filteredLessons = lessonsData.filter((lectie) => {
    // 1. Verificăm dacă titlul sau descrierea conțin textul căutat (ignorând majusculele)
    const matchesSearch = 
      lectie.titlu.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lectie.descriere.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Verificăm dacă lecția face parte din clasa selectată
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

        {/* --- ZONA DE FILTRARE ȘI CĂUTARE --- */}
        <div className="filters-section">
          
          {/* Bara de căutare */}
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Caută o lecție (ex: Bubble Sort, vectori...)" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Butoanele de filtrare pe clase */}
          <div className="class-filters">
            <button 
              className={activeFilter === 'toate' ? 'filter-btn active' : 'filter-btn'} 
              onClick={() => setActiveFilter('toate')}
            >Toate</button>
            <button 
              className={activeFilter === 'clasa-9' ? 'filter-btn active' : 'filter-btn'} 
              onClick={() => setActiveFilter('clasa-9')}
            >Clasa 9</button>
            <button 
              className={activeFilter === 'clasa-10' ? 'filter-btn active' : 'filter-btn'} 
              onClick={() => setActiveFilter('clasa-10')}
            >Clasa 10</button>
            <button 
              className={activeFilter === 'clasa-11' ? 'filter-btn active' : 'filter-btn'} 
              onClick={() => setActiveFilter('clasa-11')}
            >Clasa 11</button>
            <button 
              className={activeFilter === 'clasa-12' ? 'filter-btn active' : 'filter-btn'} 
              onClick={() => setActiveFilter('clasa-12')}
            >Clasa 12</button>
          </div>

        </div>

        {/* --- GRILA CU LECȚII FILTRATE --- */}
        {filteredLessons.length > 0 ? (
          <div className="lectii-grid">
            {filteredLessons.map((lectie) => (
              <Link to={`/lectie/${lectie.id}`} key={lectie.id} className="lectie-card">
                <div className="lectie-badge">{lectie.clasa.toUpperCase().replace('-', ' ')}</div>
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
          // Mesajul afișat dacă nu există nicio lecție care să se potrivească căutării
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