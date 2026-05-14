import React from 'react';
import '../pages_css/mainPage.css';

const PrivacyPolicy = () => {
  return (
    <div className="policy-container" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', color: '#fff' }}>
      <h1>🛡️ Politica de Confidențialitate (Privacy Policy)</h1>
      <p><strong>Ultima actualizare:</strong> Mai 2026</p>
      <br />
      <p>Bine ai venit pe platforma noastră! Ne luăm angajamentul să îți protejăm datele personale. Această pagină explică simplu și clar ce informații colectăm, cum le folosim și care sunt drepturile tale.</p>
        <br />
      <h2>1. Ce date colectăm?</h2>
      <p>Când folosești platforma noastră, putem colecta:</p>
      <ul>
        <li><strong>Informații pe care ni le oferi direct:</strong> Numele de utilizator, adresa de e-mail și parolele (criptate în siguranță).</li>
        <li><strong>Date despre progresul tău:</strong> Rezultatele testelor grilă, lecțiile finalizate și punctajul obținut.</li>
        <li><strong>Date tehnice (automat):</strong> Informații standard oferite de browser pentru a asigura buna funcționare a site-ului.</li>
      </ul>
        <br />
      <h2>2. Cum folosim datele tale?</h2>
      <p>Folosim datele strict pentru a-ți oferi cea mai bună experiență educațională:</p>
      <ul>
        <li>Pentru a-ți salva progresul la lecții și scorurile la teste.</li>
        <li>Pentru a-ți permite conectarea și securizarea contului.</li>
        <li>Pentru a remedia posibile erori (bug-uri) ale platformei.</li>
      </ul>
      <br />
      <p><em>*Nu vom vinde, închiria sau distribui NICIODATĂ datele tale personale unor companii de marketing.</em></p>
        <br />
      <h2>3. Cum protejăm datele?</h2>
      <p>Datele tale sunt stocate pe servere securizate. Contul tău este protejat de o parolă (te rugăm să alegi una puternică). Doar administratorii platformei pot accesa baza de date, exclusiv pentru mentenanță tehnică.</p>
        <br />
      <h2>4. Drepturile tale (GDPR)</h2>
      <p>Dacă ești din Uniunea Europeană, ai dreptul să:</p>
      <ul>
        <li>Ne ceri o copie a datelor pe care le avem despre tine.</li>
        <li>Corectezi orice dată greșită.</li>
        <li>Ne ceri ștergerea definitivă a contului tău și a tuturor datelor asociate ("Dreptul de a fi uitat").</li>
      </ul>

      <p>Pentru orice cerere legată de datele tale, ne poți contacta la adresa: <strong>infomotion2026@gmail.com</strong></p>
    </div>
  );
};

export default PrivacyPolicy;