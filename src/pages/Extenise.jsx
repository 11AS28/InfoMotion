import React from 'react';
import usePageTitle from '../hooks/usePageTitle';

export default function ExtensiePage() {
  usePageTitle("Extensie InfoMotion - Instalare");

  return (
    <div className="extensie-page" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      
      <div style={{ maxWidth: '800px', margin: '100px auto', padding: '40px', backgroundColor: 'var(--bg-card)', borderRadius: '20px', textAlign: 'center' }}>
        
        <h1 style={{ fontSize: '3rem', color: 'var(--text-primary)', marginBottom: '20px' }}>
          Extensia InfoMotion
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '40px' }}>
          Urmează cei 3 pași simpli de mai jos pentru a activa animațiile InfoMotion direct pe pbInfo și LeetCode.
        </p>

        {/* 
          AICI ESTE LINK-UL SPRE FIȘIERUL TĂU ZIP 
          Când dă click, browserul începe automat descărcarea.
        */}
        <a 
          href="/infomotion-v1.zip" 
          download="infomotion-v1.zip"
          className="button"
          style={{ 
            backgroundColor: '#23a9b3', 
            color: 'white', 
            padding: '15px 30px', 
            fontSize: '1.2rem', 
            textDecoration: 'none', 
            borderRadius: '10px',
            display: 'inline-block',
            fontWeight: 'bold',
            marginBottom: '50px'
          }}
        >
           Descarcă Extensia (.zip)
        </a>

        {/* PAȘII PENTRU INSTALARE */}
        <div style={{ textAlign: 'left' , padding: '30px', borderRadius: '15px' }}>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '20px' }}>Cum o instalezi:</h2>
          
          <ol style={{ color: 'var(--text-secondary)', lineHeight: '2', fontSize: '1.1rem', paddingLeft: '20px' }}>
            <li>După ce ai descărcat fișierul de mai sus, <strong>dă click dreapta pe el și alege "Extract All" (Dezarhivează)</strong>.</li>
            <li>Deschide Google Chrome, dă click pe cele 3 puncte (sus dreapta) -{'>'} Extensii -{'>'} Gestionează Extensiile (sau tastează în bară <code>chrome://extensions/</code>).</li>
            <li>În colțul din dreapta sus, activează opțiunea <strong>"Developer mode" (Mod Dezvoltator)</strong>.</li>
            <li>Dă click în dreapta sus pe <strong>"Load unpacked" (Încarcă extensia neîmpachetată)</strong> și selectează folderul pe care tocmai l-ai dezarhivat.</li>
          </ol>
           
           <video width="100%" height="auto" controls>
             <source src="/infomotion-instructions.mp4" type="video/mp4" />
             Browserul tău nu suportă video tag-ul.
           </video>
          
          <p style={{ marginTop: '20px', color: '#22c55e', fontWeight: 'bold' }}>
            Gata! Acum intră pe pbInfo, selectează orice algoritm (ex: "căutare binară") și magia se va întâmpla.
          </p>
        </div>

      </div>


    </div>
  );
}