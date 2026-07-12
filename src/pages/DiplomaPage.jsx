import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './DiplomaPage.css';

const DIPLOMA_TIERS = {
  clasa_9: {
    className: 'tier-9',
    badgeText: 'Junior Developer',
    courseDefault: 'Algoritmica și Structuri de Date - Clasa a IX-a'
  },
  clasa_10: {
    className: 'tier-10',
    badgeText: 'Advanced Coder',
    courseDefault: 'Algoritmica și Structuri de Date - Clasa a X-a'
  },
  clasa_11: {
    className: 'tier-11',
    badgeText: 'Master Elite',
    courseDefault: 'Algoritmica și Structuri de Date - Clasa a XI-a'
  },
  liceu: {
    className: 'tier-supreme',
    badgeText: 'Grandmaster of InfoMotion',
    courseDefault: 'Absolvirea Programului Complet de Pregătire Liceală'
  }
};

function DiplomaPage() {
  const { id } = useParams();
  const [diploma, setDiploma] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ok | notfound | error

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800&family=Montserrat:wght@400;500;700&family=Pinyon+Script&family=Space+Grotesk:wght@500;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    fetch(`/api/diploma-view?id=${id}`)
      .then(res => {
        if (res.status === 404) { setStatus('notfound'); return null; }
        if (!res.ok) { setStatus('error'); return null; }
        return res.json();
      })
      .then(data => {
        if (data?.success) {
          setDiploma(data.diploma);
          setStatus('ok');
        }
      })
      .catch(() => setStatus('error'));
  }, [id]);

  if (status === 'loading') return <div className="diploma-page-wrapper"><p style={{ color: '#fff' }}>Se încarcă...</p></div>;
  if (status === 'notfound') return <div className="diploma-page-wrapper"><p style={{ color: '#fff' }}>Diplomă inexistentă.</p></div>;
  if (status === 'error') return <div className="diploma-page-wrapper"><p style={{ color: '#fff' }}>Eroare la încărcare.</p></div>;

  const activeTierConfig = DIPLOMA_TIERS[diploma.tier] || DIPLOMA_TIERS.liceu;

  const dataFormatata = new Date(diploma.grantedAt).toLocaleDateString('ro-RO', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="diploma-page-wrapper">
      <div className="print-btn-container no-print">
        <button className="print-certificate-btn" onClick={() => window.print()}>
          Printează / Salvează PDF
        </button>
      </div>

      <div className={`diploma-container ${activeTierConfig.className}`}>
        <div className="diploma-corner corner-tl"></div>
        <div className="diploma-corner corner-tr"></div>
        <div className="diploma-corner corner-bl"></div>
        <div className="diploma-corner corner-br"></div>

        <div className="diploma-header">
          <svg className="diploma-logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
          <p>InfoMotion</p>
          <h1 className="diploma-main-title">
            {diploma.tier === 'liceu' ? 'Diplomă de Excelență' : 'Certificat de Absolvire'}
          </h1>
          <div className="diploma-divider-line"><div className="diploma-divider-diamond"></div></div>
        </div>

        <div className="diploma-content">
          <p className="diploma-subtitle">Prezentul document atestă faptul că</p>
          <h2 className="diploma-student-name">{diploma.studentName}</h2>
          <p className="diploma-course-text">
            {diploma.tier === 'liceu' ? 'a finalizat cu brio și a stăpânit în totalitate' : 'a demonstrat dedicare și a finalizat cu succes toate lecțiile pentru'}
          </p>
          <h3 className="diploma-course-name">{diploma.courseName || activeTierConfig.courseDefault}</h3>
        </div>

        <div className="diploma-footer">
          <div className="diploma-footer-column left">
            <p className="diploma-field-label">Dată Emitere</p>
            <p className="diploma-field-value">{dataFormatata}</p>
          </div>
          <div className="diploma-footer-column">
            <p className="diploma-field-label diploma-id-code">ID: {id}</p>
            <span className="diploma-badge">{activeTierConfig.badgeText}</span>
          </div>
          <div className="diploma-footer-column right">
            <p className="diploma-field-label">Autoritate Emitentă</p>
            <p className="diploma-field-value authority">{'InfoMotion Team'}</p> {/*diploma.grantedBy || 'InfoMotion Team'*/}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DiplomaPage;