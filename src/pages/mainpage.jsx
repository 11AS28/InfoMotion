import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext';
import '../pages_css/mainPage.css';
import Nav from '../components/nav';
import Footer from '../components/footer';
import { Eye, ClipboardPenLine, LibraryBig } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

const INITIAL_ARRAY = [24, 18, 35, 12, 42, 8];

function MainPage() {
  
  const { currentUser } = useAuth(); 

  const [array, setArray] = useState(INITIAL_ARRAY);
  const [activeIndices, setActiveIndices] = useState([]);
  const [sortedIndices, setSortedIndices] = useState([]);

 
  const startBubbleSort = async () => {
    let arr = [...INITIAL_ARRAY];
    setArray([...arr]);
    setSortedIndices([]);
    let n = arr.length;
    let localSorted = [];

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    for (let i = 0; i < n - 1; i++) {
      let swapped = false;
      for (let j = 0; j < n - i - 1; j++) {
        setActiveIndices([j, j + 1]);
        await sleep(500); 

        if (arr[j] > arr[j + 1]) {
          let temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
          
          swapped = true;
          setArray([...arr]); 
          await sleep(500); 
        }
      }
      
      localSorted.push(n - i - 1);
      setSortedIndices([...localSorted]);
      
      if (!swapped) break;
    }
    
    setSortedIndices([...Array(n).keys()]);
    setActiveIndices([]); 
  };

  useEffect(() => {
    setTimeout(() => {
      startBubbleSort();
    }, 1000);
  }, []);

  return (
    <div className="main-page">
      {usePageTitle("InfoMotion - Descoperă Logica din Spatele Codului")}
      
      <section className="cta-bottom" style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: 'var(--bg-card)' }}>
        <h2 style={{ fontSize: '2.5rem', color: 'var(--text-primary)', marginBottom: '15px' }}>
          Ești pregătit să treci la următorul nivel?
        </h2>
        
        
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '40px' }}>
          {currentUser 
            ? "Mă bucur să te văd! Ești deja logat, alege o lecție, rezolvă o problemă din Arena sau descoperă ce e nou în Marketplace." 
            : "Alătură-te elevilor de elită. Creează un cont gratuit și deblochează lecțiile, arena si multe pagini!"}
        </p>

        
        {currentUser ? (
          <Link to="/lectii" className="button" style={{ textDecoration: 'none' }}>
            Începe să înveți
          </Link>
        ) : (
          <Link to="/auth" className="button" style={{ textDecoration: 'none' }}>
            Logare / Creare Cont
          </Link>
        )}
      </section>
      
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
  {`
  void bubbleSort(int arr[], int n) {
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
  }
    `
  }
            </pre>
            <p className="code-label">Algoritmul Bubble Sort (Optimizat)</p>
          </div>
        </div>

        
        <div className="hero-right">
          <div className="visualizer-container">
            <h3>Vizualizeaza Algoritmul</h3>
            
            <div className="bars-container">
              {array.map((value, index) => {
                let bgColor = '#01696f'; 
                if (activeIndices.includes(index)) {
                  bgColor = '#ef4444'; 
                } else if (sortedIndices.includes(index)) {
                  bgColor = '#22c55e'; 
                }

                return (
                  <div 
                    key={index} 
                    className="bar" 
                    style={{ 
                      height: `${value * 4}px`, 
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
            <div className="feature-icon"><Eye size={100} color="#23a9b3" strokeWidth={0.75} /></div> 
            <strong>Vizualizare Interactivă</strong>
            <p>Înțelege algoritmii și structurile de date prin animații interactive, clare și intuitive.</p>
          </li>
          <li className="feature-card">
            <div className="feature-icon"><ClipboardPenLine size={100} color="#23a9b3" strokeWidth={0.75} /></div>
            <strong>Explicații Pas cu Pas</strong>
            <p>Fiecare linie de cod este explicată în detaliu, astfel încât să poți urmări logica.</p>
          </li>
          <li className="feature-card">
            <div className="feature-icon"><LibraryBig size={100} color="#23a9b3" strokeWidth={0.75} /></div>
            <strong>Resurse Educaționale</strong>
            <p>Acces la o bibliotecă vastă de lecții, exerciții și probleme interesante de algoritmica care te ajuta sa treci la nivelul urmator.</p>
          </li>      
        </ul>
      </section>

      
      
    </div>
  );
}

export default MainPage;
{/*<li className="feature-card">
              <blockquote className="tiktok-embed" cite="https://www.tiktok.com/@uuhvfhn/video/7655357448777125138" data-video-id="7655357448777125138"> <section> <a target="_blank" title="@uuhvfhn" href="https://www.tiktok.com/@uuhvfhn?refer=embed">@uuhvfhn</a> <p></p> <a target="_blank" title="♬ оригинальный звук - 𝘾𝙖𝙧𝙨𝘽𝙚𝙡𝙖𝙧𝙪𝙨" href="https://www.tiktok.com/music/оригинальный-звук-7647234034774346513?refer=embed">♬ оригинальный звук - 𝘾𝙖𝙧𝙨𝘽𝙚𝙡𝙖𝙧𝙪𝙨</a> </section> </blockquote> <script async src="https://www.tiktok.com/embed.js"></script>
          </li>
          <li className="feature-card">
            <blockquote className='tiktok-embed' cite="https://www.tiktok.com/@niconurofen/video/7655638936978607382" data-video-id="7655638936978607382"> <section> <a target="_blank" title="@niconurofen" href="https://www.tiktok.com/@niconurofen?refer=embed">@niconurofen</a> <a title="foryou" target="_blank" href="https://www.tiktok.com/tag/foryou?refer=embed">#foryou</a> <a target="_blank" title="♬ sunet original - Bianca Stoian" href="https://www.tiktok.com/music/sunet-original-7569208129130842902?refer=embed">♬ sunet original - Bianca Stoian</a> </section> </blockquote> <script async src="https://www.tiktok.com/embed.js"></script>
          </li>
          <li className="feature-card">
              <blockquote className="tiktok-embed" cite="https://www.tiktok.com/@1ariadnaa3/video/7654683771987447062" data-video-id="7654683771987447062" style={{ maxWidth: "605px", minWidth: "325px" }} > </blockquote> <script async src="https://www.tiktok.com/embed.js"></script>
          </li>*/}
