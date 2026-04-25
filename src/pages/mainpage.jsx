import React, { useState, useEffect } from 'react';
import '../pages_css/mainPage.css';
import Nav from '../components/nav';
import Footer from '../components/footer';

// Acesta este vectorul inițial pe care îl vom sorta
const INITIAL_ARRAY = [24, 18, 35, 12, 42, 8];

function MainPage() {
  // Starea pentru vector (ce se afișează efectiv pe ecran)
  const [array, setArray] = useState(INITIAL_ARRAY);
  // Starea care ne spune ce indici sunt comparați acum (ca să îi colorăm cu roșu)
  const [activeIndices, setActiveIndices] = useState([]);
  // Starea care ne spune ce indici au fost deja sortați și sunt la locul final (verde)
  const [sortedIndices, setSortedIndices] = useState([]);

  // Funcția care generează toate mutările și le redă încet pe ecran
  const startBubbleSort = async () => {
    let arr = [...INITIAL_ARRAY];
    setArray([...arr]);
    setSortedIndices([]);
    let n = arr.length;
    let localSorted = [];

    // O funcție mică pentru a aștepta (delay) între pașii animației (în milisecunde)
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    for (let i = 0; i < n - 1; i++) {
      let swapped = false;
      for (let j = 0; j < n - i - 1; j++) {
        // Colorăm barele curente în roșu pentru a arăta că sunt comparate
        setActiveIndices([j, j + 1]);
        await sleep(500); // Stăm jumătate de secundă ca să se vadă comparația

        if (arr[j] > arr[j + 1]) {
          // Facem swap în logică
          let temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
          
          swapped = true;
          // Actualizăm React-ul ca să miște barele vizual
          setArray([...arr]); 
          await sleep(500); // Așteptăm să se termine animația de mișcare CSS
        }
      }
      
      // Bara de la final este sortată sigur, o adăugăm în lista de elemente "verzi"
      localSorted.push(n - i - 1);
      setSortedIndices([...localSorted]);
      
      if (!swapped) break;
    }
    
    // La final, totul e sortat, le colorăm pe toate cu verde
    setSortedIndices([...Array(n).keys()]);
    setActiveIndices([]); // Scoatem roșul
  };

  // Pornește animația automat la o secundă după ce se încarcă pagina
  useEffect(() => {
    setTimeout(() => {
      startBubbleSort();
    }, 1000);
  }, []);

  return (
    <div className="main-page">
      <Nav />
      
      <section className="hero-section">
        
        {/* PARTEA STÂNGĂ: Cardul cu Cod */}
        <div className="hero-left">
          <div className="hero-text-intro">
            <h1>InfoMotion<span>.</span></h1>
            <h2>Descoperă logica din spatele codului.</h2>
            <p>Învață vizual, pas cu pas, algoritmi complecși.</p>
          </div>

          <div className="code-card">
            <div className="code-top">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <pre>
{`void bubbleSort(int arr[], int n) {
  for (int i = 0; i < n - 1; i++) {
    bool swapped = false;
    for (int j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        swap(arr[j], arr[j + 1]);
        swapped = true;
      }
    }
    if (!swapped) break;
  }
}`}
            </pre>
            <p className="code-label">Algoritmul Bubble Sort (Optimizat)</p>
          </div>
        </div>

        {/* PARTEA DREAPTĂ: Visualizer-ul Real Animati (React) */}
        <div className="hero-right">
          <div className="visualizer-container">
            <h3>Visualizer Algoritm</h3>
            
            <div className="bars-container">
              {array.map((value, index) => {
                // Stabilim culoarea fiecărei bare în funcție de stare
                let bgColor = '#01696f'; // Teal implicit
                if (activeIndices.includes(index)) {
                  bgColor = '#ef4444'; // Roșu dacă sunt comparate
                } else if (sortedIndices.includes(index)) {
                  bgColor = '#22c55e'; // Verde dacă e la poziția finală
                }

                return (
                  <div 
                    key={index} // ATENȚIE: În React e foarte important să punem cheia pe index aici ca să se miște smooth
                    className="bar" 
                    style={{ 
                      height: `${value * 4}px`, // Înălțimea se adaptează dinamic la număr
                      backgroundColor: bgColor 
                    }}
                  >
                    <span className="val">{value}</span>
                  </div>
                );
              })}
            </div>
            
            <p className="viz-text">Simularea procesului de interschimbare (Swap).</p>
            <button className="button" onClick={startBubbleSort}>Resetează Animația</button>
          </div>
        </div>

      </section>


      <section id="Features" className="features-section">
  <h2 className="features-title">De ce să alegi InfoMotion?</h2>
  
  <ul className="features-grid">
    <li className="feature-card">
      <div className="feature-icon">👁️</div> {/* Opțional: poți pune un emoji sau o iconiță SVG */}
      <strong>Vizualizare Interactivă</strong>
      <p>Înțelege algoritmii și structurile de date prin animații clare și intuitive.</p>
    </li>
    
    <li className="feature-card">
      <div className="feature-icon">📝</div>
      <strong>Explicații Pas cu Pas</strong>
      <p>Fiecare linie de cod este explicată în detaliu, astfel încât să poți urmări logica.</p>
    </li>
    
    <li className="feature-card">
      <div className="feature-icon">🎮</div>
      <strong>Gamificare</strong>
      <p>Transformă învățarea într-o experiență distractivă și captivantă, cu provocări.</p>
    </li>
  </ul>
</section>

        <Footer />
    </div>
  );
}

export default MainPage;