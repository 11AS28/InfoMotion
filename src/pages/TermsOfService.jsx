import React from 'react';
import '../pages_css/mainPage.css';

const TermsOfService = () => {
  return (
    <div className="terms-container" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', color: '#fff' }}>
      <h1>📜 Termeni și Condiții de Utilizare (ToS)</h1>
      <br />
      <p><strong>Ultima actualizare:</strong> Mai 2026</p>
    <br />  
      <p>Accesarea și utilizarea acestei platforme educaționale înseamnă că ești de acord cu regulile de mai jos. Dacă nu ești de acord, te rugăm să nu folosești site-ul.</p>
    <br />  
      <h2>1. Scopul platformei</h2>
      <p>Platforma este un spațiu educațional gratuit, creat pentru a ajuta elevii și pasionații să învețe informatică (C++, algoritmi etc.). Toate materialele sunt oferite exclusiv în scop educativ.</p>
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
      <h2>4. Proprietatea Intelectuală</h2>
      <p>Toate lecțiile, textele, grilele și designul site-ului sunt proprietatea intelectuală a dezvoltatorilor platformei. Rezolvările problemelor de pe platforme externe sunt explicații educaționale.</p>
        <br />
      <h2>5. Limitarea Răspunderii</h2>
      <p>Ne străduim ca toate informațiile și codurile C++ oferite să fie corecte. Nu ne asumăm răspunderea pentru notele obținute la școală sau eventualele probleme apărute în urma folosirii codurilor noastre. Înveți pe propria răspundere!</p>
        <br />
      <h2>6. Modificarea Termenilor</h2>
      <p>Ne rezervăm dreptul de a modifica acești Termeni și Condiții în orice moment. Vei fi notificat pe site în cazul unor schimbări majore.</p>

      <p>Dacă ai întrebări, ne poți scrie la: <strong>infomotion2026@gmail.com</strong></p>
    </div>
  );
};

export default TermsOfService;
