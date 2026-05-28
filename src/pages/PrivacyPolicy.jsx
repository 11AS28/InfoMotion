import React from 'react';
import '../pages_css/mainPage.css';
import { Cookie } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div
      className="policy-container"
      style={{
        padding: '40px',
        maxWidth: '900px',
        margin: '0 auto',
        color: '#fff',
        lineHeight: '1.8'
      }}
    >
      <h1
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '10px'
        }}
      >
        <Cookie size={52} color="#1fe0f9" strokeWidth={1.5} />
        Politica de Confidențialitate
      </h1>

      <p>
        <strong>Ultima actualizare:</strong> Mai 2026
      </p>

      <br />

      <p>
        Bine ai venit pe platforma noastră! Ne angajăm să îți protejăm datele
        personale și să le folosim într-un mod responsabil, clar și corect.
        Această pagină explică pe scurt ce informații colectăm, cum le folosim
        și care sunt drepturile tale.
      </p>

      <br />

      <h2>1. Ce date colectăm?</h2>
      <p>Când folosești platforma noastră, putem colecta:</p>
      <ul>
        <li>
          <strong>Informații oferite direct de tine:</strong> numele de
          utilizator, adresa de e-mail și datele necesare autentificării în cont.
        </li>
        <li>
          <strong>Date despre progresul tău:</strong> lecțiile finalizate,
          rezultatele testelor, punctajele și alte informații legate de
          activitatea ta educațională pe platformă.
        </li>
        <li>
          <strong>Date tehnice colectate automat:</strong> informații standard
          transmise de browser sau dispozitiv, necesare pentru funcționarea
          corectă a site-ului, securitate și diagnosticarea eventualelor erori.
        </li>
      </ul>

      <br />

      <h2>2. Cum folosim datele tale?</h2>
      <p>Folosim aceste date strict pentru funcționarea și îmbunătățirea platformei:</p>
      <ul>
        <li>Pentru a-ți permite autentificarea și securizarea contului.</li>
        <li>Pentru a-ți salva progresul la lecții și rezultatele la teste.</li>
        <li>
          Pentru a personaliza experiența educațională și pentru a remedia
          eventuale probleme tehnice.
        </li>
      </ul>

      <p>
        <em>
          Nu vom vinde, închiria sau distribui niciodată datele tale personale
          către companii de marketing.
        </em>
      </p>

      <br />

      <h2>3. Lecții trimise de profesori</h2>
      <p>
        Dacă un profesor trimite o lecție, un fișier, un exemplu de cod sau alt
        material educațional prin platformă, putem stoca atât conținutul trimis,
        cât și datele asociate trimiterii, cum ar fi numele autorului, adresa de
        e-mail și data trimiterii.
      </p>
      <p>
        Aceste informații sunt folosite exclusiv pentru evaluarea, organizarea,
        revizuirea, publicarea și administrarea materialelor educaționale
        trimise către platformă.
      </p>
      <p>
        Dacă materialul este publicat, numele autorului sau forma de creditare
        stabilită poate deveni vizibilă public pe site.
      </p>

      <br />

      <h2>4. Cum protejăm datele?</h2>
      <p>
        Datele sunt stocate pe infrastructură securizată, iar accesul la ele
        este limitat la persoanele care au nevoie de acces pentru administrarea
        și mentenanța platformei. Te rugăm și pe tine să alegi o parolă puternică
        și să nu o comunici altor persoane.
      </p>

      <br />

      <h2>5. Drepturile tale (GDPR)</h2>
      <p>
        Dacă te afli în Uniunea Europeană, ai dreptul să:
      </p>
      <ul>
        <li>soliciți acces la datele tale personale;</li>
        <li>ceri corectarea datelor incorecte;</li>
        <li>soliciți ștergerea contului și a datelor asociate;</li>
        <li>ceri restricționarea sau opoziția față de anumite prelucrări;</li>
        <li>soliciți, acolo unde este cazul, portabilitatea datelor.</li>
      </ul>

      <br />

      <h2>6. Perioada de păstrare</h2>
      <p>
        Păstrăm datele personale doar atât timp cât este necesar pentru
        funcționarea platformei, pentru scopuri educaționale și administrative
        legitime sau pentru respectarea obligațiilor legale.
      </p>
      <p>
        Materialele trimise de profesori pot rămâne arhivate intern chiar dacă
        nu sunt publicate imediat, iar conținutul deja publicat poate rămâne pe
        platformă atât timp cât este relevant pentru scopul educațional, cu
        excepția situațiilor în care legea sau o cerere validă impune eliminarea lui.
      </p>

      <br />

      <h2>7. Contact</h2>
      <p>
        Pentru orice întrebare legată de datele tale personale sau de conținutul
        trimis către platformă, ne poți contacta la adresa:{' '}
        <a
          href="mailto:infomotion2026@gmail.com"
          style={{ color: '#1fe0f9', fontWeight: 'bold' }}
        >
          infomotion2026@gmail.com
        </a>
      </p>

      <br />

      <h2>8. Confirmare pentru profesori</h2>
      <p>
        În formularul de trimitere a lecțiilor, profesorii pot fi rugați să
        confirme că materialul le aparține sau că au dreptul să îl trimită și că
        sunt de acord ca InfoMotion să îl revizuiască, adapteze și publice cu
        creditarea autorului.
      </p>
    </div>
  );
};

export default PrivacyPolicy;