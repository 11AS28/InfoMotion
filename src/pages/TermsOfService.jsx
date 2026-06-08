import React from 'react';
import '../pages_css/mainPage.css';
import { Handshake } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

const TermsOfService = () => {
  usePageTitle("InfoMotion - Termeni și Condiții de Utilizare");
  return (
    <div className="terms-container" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', color: '#fff' }}>
      <h1><Handshake size={60} color="#1fe0f9" strokeWidth={0.75} /> Termeni și Condiții de Utilizare (ToS)</h1>
      <br />
      <p><strong>Ultima actualizare:</strong> Mai 2026</p>
    <br />  
      <p>Accesarea și utilizarea acestei platforme educaționale înseamnă că ești de acord cu regulile de mai jos. Dacă nu ești de acord, te rugăm să nu folosești site-ul.</p>
    <br />  
      <h2>1. Scopul platformei</h2>
      <p>Platforma este un spațiu educațional gratuit, creat pentru a ajuta elevii, profesorii și pasionații să învețe informatică, algoritmi și programare. Toate materialele sunt oferite exclusiv în scop educativ.</p>
        <br />
      <h2>2. Contul de Utilizator</h2>
      <ul>
        <li>Dacă îți creezi un cont, ești responsabil pentru păstrarea confidențialității parolei tale.</li>
        <li>Nu ai voie să folosești contul altei persoane fără permisiune.</li>
        <li>Dacă observi orice activitate suspectă pe contul tău, te rugăm să ne anunți imediat.</li>
      </ul>
        <br />
      <h2>3. Reguli de conduită</h2>
      <p>Atunci când folosești site-ul, te angajezi să:</p>
      <ul>
        <li>Nu încerci să compromiți site-ul, să folosești scripturi automate pentru a frauda testele sau să trimiți viruși.</li>
        <li>Nu copiezi, reproduci sau vinzi materialele și testele de pe acest site fără permisiunea noastră scrisă.</li>
      </ul>
        <br />
      <h2>4. Lecții trimise de profesori</h2>
      <p>Profesorii sau alți contributori pot trimite lecții, explicații, exerciții, grile, exemple de cod sau alte materiale educaționale către platformă. Prin trimiterea acestor materiale, persoana care le trimite confirmă că are dreptul să le folosească și să le transmită către noi și ne acordă o licență neexclusivă, gratuită, revocabilă doar pentru viitor, de a stoca, afișa, adapta, edita, formata și publica materialele pe platformă în scop educațional.</p>
      <p>Contribuitorul își păstrează drepturile asupra conținutului propriu, însă acceptă că platforma poate publica materialul cu numele său, cu mențiune de autor sau cu altă formă de creditare stabilită editorial. Ne rezervăm dreptul de a refuza, modifica, scurta, corecta sau elimina materiale trimise, inclusiv atunci când acestea sunt incomplete, neclare, încalcă drepturi de autor, conțin erori grave sau nu se potrivesc standardului educațional al platformei.</p>
      <p>Prin trimiterea unei lecții, contribuitorul declară că materialul nu încalcă drepturile altor persoane și că nu include conținut copiat ilegal din manuale, platforme, cărți, cursuri sau alte surse protejate. Dacă apar reclamații legate de drepturi de autor sau de originalitatea materialului, ne rezervăm dreptul de a suspenda sau elimina conținutul respectiv până la clarificare.</p>
        <br />
      <h2>5. Proprietatea Intelectuală</h2>
      <p>Toate lecțiile, textele, grilele și designul site-ului sunt proprietatea intelectuală a dezvoltatorilor platformei. Rezolvările problemelor de pe platforme externe sunt explicații educaționale.</p>
        <br />
      <h2>6. Limitarea Răspunderii</h2>
      <p>Ne străduim ca informațiile, explicațiile și codurile C++ oferite pe platformă să fie corecte și utile, dar nu garantăm că ele sunt perfecte pentru orice context sau concurs. Nu ne asumăm răspunderea pentru rezultatele școlare, pentru interpretarea greșită a materialelor sau pentru probleme apărute din utilizarea codului publicat pe site.</p>
        <br />
      <h2>7. Modificarea Termenilor</h2>
      <p>Ne rezervăm dreptul de a modifica acești Termeni și Condiții în orice moment. Vei fi notificat pe site în cazul unor schimbări majore.</p>

      <p>Pentru întrebări legate de acești termeni sau pentru sesizări, ne poți scrie la: <a
          href="mailto:infomotion2026@gmail.com"
          style={{ color: '#1fe0f9', fontWeight: 'bold' }}
        >
          infomotion2026@gmail.com
        </a></p>
    </div>
  );
};

export default TermsOfService;
