import React, { useState, useRef, useEffect } from 'react';
import '../animatii_css/matchmakingAnim.css';

// Aceleasi date exacte ca in codul C++ din lectie
const JUCATORI_INITIAL = [
  { nume: 'sammaria', skill: 2100, ping: 15 },
  { nume: 'Random_Toxic_1', skill: 1450, ping: 45 },
  { nume: 'Gigel_Dijkstra', skill: 1950, ping: 20 },
  { nume: 'NoobSlayer99', skill: 1200, ping: 32 },
  { nume: 'ProGamer_CS', skill: 2300, ping: 12 },
  { nume: 'CarryMePlease', skill: 1600, ping: 25 },
  { nume: 'Smurf_ContSecund', skill: 2250, ping: 18 },
  { nume: 'AFK_In_Baza', skill: 1100, ping: 60 },
  { nume: 'Flash_In_Eye', skill: 1500, ping: 22 },
  { nume: 'Savage_Player', skill: 1800, ping: 19 },
];

const SKILL_MAX = 2400;

// indicii (din vectorul SORTAT) care merg in Echipa 1 - exact regula din cod
const INDICI_ECHIPA_1 = [0, 3, 4, 7, 8];

function pingClass(ping) {
  if (ping <= 20) return 'mm-ping-good';
  if (ping <= 40) return 'mm-ping-ok';
  return 'mm-ping-bad';
}

function PlayerCard({ jucator, echipa, atenuat }) {
  return (
    <div className={`mm-card ${echipa ? `mm-card-${echipa}` : ''} ${atenuat ? 'mm-card-atenuat' : ''}`}>
      <div className="mm-card-nume">{jucator.nume}</div>
      <div className="mm-skillbar-track">
        <div className="mm-skillbar-fill" style={{ width: `${(jucator.skill / SKILL_MAX) * 100}%` }} />
      </div>
      <div className="mm-card-footer">
        <span className="mm-skill-val">{jucator.skill} MMR</span>
        <span className={`mm-ping-badge ${pingClass(jucator.ping)}`}>{jucator.ping}ms</span>
      </div>
    </div>
  );
}

export default function MatchmakingAnim() {
  const [faza, setFaza] = useState('idle'); // idle -> sortat -> draft -> gata
  const [sortat, setSortat] = useState(false);
  const [revealCount, setRevealCount] = useState(0);
  const timerRef = useRef(null);

  const jucatoriSortati = [...JUCATORI_INITIAL].sort((a, b) => b.skill - a.skill);

  const echipa1 = INDICI_ECHIPA_1.map((i) => jucatoriSortati[i]);
  const echipa2 = jucatoriSortati.filter((_, i) => !INDICI_ECHIPA_1.includes(i));

  const sumaEchipa1 = echipa1.reduce((s, j) => s + j.skill, 0);
  const sumaEchipa2 = echipa2.reduce((s, j) => s + j.skill, 0);
  const diferenta = Math.abs(sumaEchipa1 - sumaEchipa2);
  const echilibrat = diferenta < 100;

  const sansaEchipa1 = 50 + (sumaEchipa1 - sumaEchipa2) / 40; // doar pt. efect vizual gauge

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const startMatchmaking = () => {
    clearTimeout(timerRef.current);
    setFaza('sortare');
    setSortat(false);
    setRevealCount(0);

    timerRef.current = setTimeout(() => {
      setSortat(true);
      setFaza('draft');
      let i = 0;
      const dradftInterval = setInterval(() => {
        i++;
        setRevealCount(i);
        if (i >= jucatoriSortati.length) {
          clearInterval(dradftInterval);
          setFaza('gata');
        }
      }, 340);
    }, 700);
  };

  // In faza de draft, aratam cate un jucator pe rand intrand in echipa lui
  const esteInEchipa1Reveal = (idxSortat) => INDICI_ECHIPA_1.includes(idxSortat);

  // --- Widget Dynamic Window (independent de secventa de mai sus) ---
  const [timpCoada, setTimpCoada] = useState(3);
  const MMR_JUCATOR = 1900;
  const fereastra = 60 + timpCoada * 22; // se largeste cu timpul

  const candidatiDemo = [
    { nume: 'A', mmr: 1930 },
    { nume: 'B', mmr: 1750 },
    { nume: 'C', mmr: 2200 },
    { nume: 'D', mmr: 1600 },
    { nume: 'E', mmr: 2450 },
    { nume: 'F', mmr: 1000 },
    { nume: 'G', mmr: 2000 },
    { nume: 'H', mmr: 1450 },
  ];

  const AXA_MIN = 800;
  const AXA_MAX = 2700;
  const pozitiePeAxa = (mmr) => ((mmr - AXA_MIN) / (AXA_MAX - AXA_MIN)) * 100;

  return (
    <div className="mm-wrap">
      <h3 className="mm-title">Simulare: Sistemul de Matchmaking</h3>

      <div className="mm-toolbar">
        <button className="mm-btn-start" onClick={startMatchmaking} disabled={faza === 'sortare' || faza === 'draft'}>
          ▶ Rulează Matchmaking
        </button>
        <span className="mm-faza-indicator">
          {faza === 'idle' && 'Coadă de 10 jucători, nesortată'}
          {faza === 'sortare' && 'Se sortează după skill (descrescător)...'}
          {faza === 'draft' && 'Se distribuie echipele (Snake Draft)...'}
          {faza === 'gata' && 'Meci generat!'}
        </span>
      </div>

      {/* Coada / rezultat sortare */}
      {(faza === 'idle' || faza === 'sortare') && (
        <>
          <p className="mm-section-label">Coada de așteptare {sortat ? '(sortată)' : '(ordinea din server, nesortată)'}</p>
          <div className={`mm-grid mm-grid-fade ${faza === 'sortare' ? 'mm-grid-reordering' : ''}`}>
            {(sortat ? jucatoriSortati : JUCATORI_INITIAL).map((j, i) => (
              <div key={j.nume} className="mm-grid-item" style={{ animationDelay: `${i * 40}ms` }}>
                <PlayerCard jucator={j} />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Fazele de draft + rezultat: doua coloane de echipe */}
      {(faza === 'draft' || faza === 'gata') && (
        <div className="mm-teams-row">
          <div className="mm-team-col mm-team-col-1">
            <div className="mm-team-header mm-team-header-1">ECHIPA 1</div>
            {jucatoriSortati.map((j, idx) =>
              esteInEchipa1Reveal(idx) && idx < revealCount ? (
                <div key={j.nume} className="mm-team-slot-in">
                  <PlayerCard jucator={j} echipa="blue" />
                </div>
              ) : null
            )}
          </div>

          <div className="mm-team-col-center">
            {jucatoriSortati.map((j, idx) =>
              idx >= revealCount ? (
                <div key={j.nume} className="mm-waiting-chip">{j.nume}</div>
              ) : null
            )}
          </div>

          <div className="mm-team-col mm-team-col-2">
            <div className="mm-team-header mm-team-header-2">ECHIPA 2</div>
            {jucatoriSortati.map((j, idx) =>
              !esteInEchipa1Reveal(idx) && idx < revealCount ? (
                <div key={j.nume} className="mm-team-slot-in">
                  <PlayerCard jucator={j} echipa="red" />
                </div>
              ) : null
            )}
          </div>
        </div>
      )}

      {/* Rezultat final */}
      {faza === 'gata' && (
        <div className="mm-result">
          <div className="mm-sums-row">
            <div className="mm-sum-chip mm-sum-blue">Echipa 1: {sumaEchipa1} MMR (medie {Math.round(sumaEchipa1 / 5)})</div>
            <div className="mm-diff-chip">Δ {diferenta}</div>
            <div className="mm-sum-chip mm-sum-red">Echipa 2: {sumaEchipa2} MMR (medie {Math.round(sumaEchipa2 / 5)})</div>
          </div>

          <div className="mm-gauge-wrap">
            <div className="mm-gauge-track">
              <div
                className="mm-gauge-fill"
                style={{ width: `${Math.min(100, Math.max(0, sansaEchipa1))}%` }}
              />
              <div className="mm-gauge-marker" style={{ left: '50%' }} />
            </div>
            <div className="mm-gauge-labels">
              <span>Echipa 1: {sansaEchipa1.toFixed(1)}%</span>
              <span>Echipa 2: {(100 - sansaEchipa1).toFixed(1)}%</span>
            </div>
          </div>

          <div className={`mm-verdict ${echilibrat ? 'mm-verdict-ok' : 'mm-verdict-bad'}`}>
            {echilibrat
              ? '✅ Meci EXCELENT echilibrat! Șanse aproape egale de 50%-50%.'
              : '⚠️ Meci ușor dezechilibrat — te-a dat din nou cu randomi!'}
          </div>
        </div>
      )}

      {/* Widget separat: Dynamic Window */}
      <div className="mm-dw-section">
        <p className="mm-section-label">De ce meciurile lungi la coadă sunt mai dezechilibrate — Fereastra Dinamică</p>
        <p className="mm-dw-desc">
          Presupunem că MMR-ul tău e <strong>{MMR_JUCATOR}</strong>. Cu cât aștepți mai mult în coadă, cu atât
          algoritmul acceptă adversari cu MMR tot mai diferit de al tău, ca să găsească un meci mai repede.
        </p>

        <div className="mm-dw-slider-row">
          <span className="mm-label-muted">Timp în coadă: {timpCoada}s</span>
          <input
            type="range"
            min="0"
            max="60"
            value={timpCoada}
            onChange={(e) => setTimpCoada(parseInt(e.target.value, 10))}
            className="mm-slider"
          />
          <span className="mm-label-muted">Fereastră: ±{fereastra} MMR</span>
        </div>

        <div className="mm-dw-axis-wrap">
          <div className="mm-dw-axis">
            {(() => {
              // Calculăm procentele brute pentru marginile ferestrei
              const stangaBrut = pozitiePeAxa(MMR_JUCATOR - fereastra);
              const dreaptaBrut = pozitiePeAxa(MMR_JUCATOR + fereastra);

              // Limităm (clamp) valorile să nu iasă din intervalul [0, 100]
              const stangaLimitata = Math.max(0, Math.min(100, stangaBrut));
              const dreaptaLimitata = Math.max(0, Math.min(100, dreaptaBrut));
              const latimeLimitata = dreaptaLimitata - stangaLimitata;

              return (
                <div
                  className="mm-dw-window"
                  style={{
                    left: `${stangaLimitata}%`,
                    width: `${latimeLimitata}%`,
                  }}
                />
              );
            })()}
            <div className="mm-dw-player-marker" style={{ left: `${pozitiePeAxa(MMR_JUCATOR)}%` }}>
              <div className="mm-dw-player-dot" />
              <span className="mm-dw-player-label">Tu</span>
            </div>

            {candidatiDemo.map((c) => {
              const inWindow = Math.abs(c.mmr - MMR_JUCATOR) <= fereastra;
              return (
                <div
                  key={c.nume}
                  className={`mm-dw-candidate ${inWindow ? 'mm-dw-candidate-in' : 'mm-dw-candidate-out'}`}
                  style={{ left: `${pozitiePeAxa(c.mmr)}%` }}
                  title={`${c.nume}: ${c.mmr} MMR`}
                />
              );
            })}
          </div>
        </div>

        <div className="mm-dw-legend">
          {candidatiDemo.map((c) => {
            const inWindow = Math.abs(c.mmr - MMR_JUCATOR) <= fereastra;
            return (
              <div key={c.nume} className={`mm-dw-legend-item ${inWindow ? 'mm-dw-legend-in' : ''}`}>
                <span
                  className="mm-dw-legend-dot"
                  style={{ background: inWindow ? 'var(--mm-good)' : '#3a4a70' }}
                />
                {c.nume}: {c.mmr}
              </div>
            );
          })}
        </div>

        <p className="mm-dw-count">
          {candidatiDemo.filter((c) => Math.abs(c.mmr - MMR_JUCATOR) <= fereastra).length} din {candidatiDemo.length}{' '}
          candidați compatibili la {timpCoada}s de așteptare.
        </p>
      </div>
    </div>
  );
}