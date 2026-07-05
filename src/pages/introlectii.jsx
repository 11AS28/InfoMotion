import React from 'react';
import Nav from '../components/nav';
import Footer from '../components/footer';
import '../pages_css/intro.css';
import usePageTitle from '../hooks/usePageTitle';
import { Goal, Sparkles, Gamepad2, Laptop, Zap, Rocket, Bot, PenTool, ChartNoAxesCombined, PencilRuler, Code2, Swords, ShoppingBag, Trophy, Users } from 'lucide-react';

function Intro() {
  usePageTitle("InfoMotion - Despre Proiect");
  return (
    <div className="page-wrapper">
      <main className="intro-container">
        <section className="intro-hero">
          <h1>Despre <span>InfoMotion</span></h1>
          <p className="intro-subtitle">
            Transformăm informatica din text abstract într-o experiență vizuală.
          </p>
        </section>

        <section className="intro-section">
          <h2><Goal size={70} color="#23a9b3" strokeWidth={0.75} /> Misiunea Noastră</h2>
          <p>
            Algoritmii pot fi dificil de înțeles doar citind cod C++ de pe tablă.
            Scopul acestei platforme este de a ajuta elevii claselor IX-XI să vizualizeze
            logic si interactiv cum funcționează structurile de date și metodele de sortare si multe altele,
            oferindu-le animații interactive și explicații pas cu pas, completate de probleme de pe <strong>PbInfo</strong> si <strong>Codeforces</strong>.
          </p>
        </section>

        <section className="intro-section">
          <h2><Sparkles size={70} color="#f2d51c" strokeWidth={0.75} /> Ce oferă platforma?</h2>
          <div className="features-grid">

            <div className="feature-card">
              <span className="feature-icon"><Gamepad2 size={70} color="#23a9b3" strokeWidth={0.75} /></span>
              <h3>Animații Interactive</h3>
              <p>Vizualizezi în timp real cum se modifică structurile de date și cum se mută elementele unui vector în memorie.</p>
            </div>

            <div className="feature-card">
              <span className="feature-icon"><Laptop size={70} color="#23a9b3" strokeWidth={0.75} /></span>
              <h3>Cod Explicat</h3>
              <p>Fragmente de cod C++ gata de implementat, însoțite de comentarii detaliate și explicații logice pentru fiecare pas.</p>
            </div>

            <div className="feature-card">
              <span className="feature-icon"><Code2 size={70} color="#23a9b3" strokeWidth={0.75} /></span>
              <h3>Probleme de Antrenament</h3>
              <p>Seturi de probleme atent selecționate în funcție de dificultate, perfecte pentru fixarea corectă a fiecărui concept.</p>
            </div>

            <div className="feature-card">
              <span className="feature-icon"><Swords size={70} color="#23a9b3" strokeWidth={0.75} /></span>
              <h3>Secțiunea Arena</h3>
              <p>Te antrenezi cu probleme selectate de pe Codeforces, oferindu-ți acces direct la provocări de nivel internațional.</p>
            </div>

            <div className="feature-card">
              <span className="feature-icon"><ShoppingBag size={70} color="#23a9b3" strokeWidth={0.75} /></span>
              <h3>Marketplace</h3>
              <p>Schimbi punctele acumulate pe inimi pentru quiz-uri, „streak freeze”-uri, teme vizuale și ecusoane pentru personalizarea profilului.</p>
            </div>

            <div className="feature-card">
              <span className="feature-icon"><Code2 size={70} color="#23a9b3" strokeWidth={0.75} /></span>
              <h3>Compilator Integrat</h3>
              <p>Scrii și rulezi cod C++ direct în platformă, fără să deschizi un editor extern — rezultatul apare instant, cu mesaje de eroare clare.</p>
            </div>

          </div>
        </section>



        <section className="intro-section">
          <h2><Rocket size={70} color="#832211" strokeWidth={0.75} /> Ce urmează?</h2>
          <p>
            Info-Motion este un proiect în continuă evoluție. Iată câteva dintre direcțiile
            pe care vrem să le explorăm în viitor:
          </p>
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon"><Bot size={70} color="#23a9b3" strokeWidth={0.75} /></span>
              <h3>Animații Generate Automat</h3>
              <p>
                Un motor intern care să genereze vizualizări pas cu pas direct din
                descrierea unui algoritm, fără cod scris manual pentru fiecare animatie.
              </p>
            </div>
            <div className="feature-card">
              <span className="feature-icon"><PenTool size={70} color="#23a9b3" strokeWidth={0.75} /></span>
              <h3>Probleme Propuse de Elevi</h3>
              <p>
                Elevii vor putea propune probleme inspirate din <strong>Codeforces</strong> sau <strong>PbInfo</strong>
                însoțite de un mesaj scurt, devenind contributori activi ai comunității.
              </p>
            </div>
            <div className="feature-card">
              <span className="feature-icon"><ChartNoAxesCombined size={70} color="#23a9b3" strokeWidth={0.75} /></span>
              <h3>Istoric de Activitate</h3>
              <p>
                Statistici personale detaliate: evoluție în timp, tipuri de probleme
                rezolvate și puncte slabe identificate automat.
              </p>
            </div>
            <div className="feature-card">
              <span className="feature-icon"><Swords size={70} color="#23a9b3" strokeWidth={0.75} /></span>
              <h3>Arena — Dueluri de Debugging</h3>
              <p>
                Lucrăm la un mod competitiv în secțiunea Arena: doi elevi primesc același algoritm
                stricat și concurează în timp real să găsească bug-ul primul. Cel mai rapid câștigă
                puncte și urcă în clasament.
              </p>
            </div>

            <div className="feature-card">
              <span className="feature-icon"><Bot size={70} color="#23a9b3" strokeWidth={0.75} /></span>
              <h3>Recapitulări Automate</h3>
              <p>
                Platforma îți va trimite periodic mini-teste cu concepte pe care le-ai studiat
                demult, ca să nu uiți ce ai învățat și să îți consolidezi cunoștințele pe termen lung.
              </p>
            </div>

            <div className="feature-card">
              <span className="feature-icon"><Zap size={70} color="#23a9b3" strokeWidth={0.75} /></span>
              <h3>Mod Examen</h3>
              <p>
                Un simulator de examen de bacalaureat și admitere, cu timp limitat și subiecte
                generate aleatoriu din materia parcursă — ca să te obișnuiești cu presiunea
                înainte de ziua cea mare.
              </p>
            </div>


          </div>
        </section>


        <section className="intro-section tech-section">
          <h2><PencilRuler size={70} color="#23a9b3" strokeWidth={0.75} /> Tehnologii Folosite</h2>
          <div className="tech-tags">
            <span className="tech-tag">React.js</span>
            <span className="tech-tag">Vite</span>
            <span className="tech-tag">React Router</span>
            <span className="tech-tag">CSS Grid & Flexbox</span>
            <span className="tech-tag">JavaScript ES6+</span>
            <span className="tech-tag">Firebase</span>
            <span className="tech-tag">Monaco Editor</span>
            <span className="tech-tag">Node.js</span>
            <span className="tech-tag">Express</span>
            <span className="tech-tag">Firestore</span>
            <span className="tech-tag">Firebase Auth</span>
            <span className="tech-tag">Docker</span>
            <span className="tech-tag">Vercel</span>
            <span className="tech-tag">Vercel Serverless Functions</span>
            <span className="tech-tag">DOMPurify</span>
            <span className="tech-tag">React Markdown</span>
            <span className="tech-tag">ESLint</span>
            <span className="tech-tag">Context API</span>
          </div>
        </section>




      </main>
    </div>
  );
}

export default Intro;
