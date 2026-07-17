import React, { useState, useRef, useEffect } from 'react';
import '../animatii_css/pacaneleSimulare.css';

// --- Constante LCG ---
const A = 1103515245;
const C = 12345;
const M = 2147483648; // 2^31

const SIMBOLURI = ['🍒', '🍋', '🍇', '💎', '🔔', '7️⃣'];
const COST_ROTIRE = 1;

function calculeazaCastig(indici) {
  const toateEgale = indici[0] === indici[1] && indici[1] === indici[2];
  if (!toateEgale) return 0;
  return indici[0] === 5 ? 100 : 10;
}

export default function PacaneleSimulare() {
  const [seed, setSeed] = useState(12345);
  const [seedInput, setSeedInput] = useState('12345');
  const [developerHack, setDeveloperHack] = useState(false);
  const [aratMatematica, setAratMatematica] = useState(true);

  const [reels, setReels] = useState([0, 0, 0]);
  const [spinning, setSpinning] = useState(false);
  const [lastNums, setLastNums] = useState([null, null, null]);
  const [istoric, setIstoric] = useState([]);

  const [totalRotiri, setTotalRotiri] = useState(0);
  const [totalPariat, setTotalPariat] = useState(0);
  const [totalCastigat, setTotalCastigat] = useState(0);
  const [rtpIstoric, setRtpIstoric] = useState([]);

  const [turboCount, setTurboCount] = useState(500);
  const spinIntervalRef = useRef(null);

  // --- Modal de avertizare responsabila ---
  const PRAGURI_AVERTIZARE = [20, 150, 400, 800];
  const [showWarning, setShowWarning] = useState(false);
  const [pragAvertizatIdx, setPragAvertizatIdx] = useState(0);

  useEffect(() => () => clearInterval(spinIntervalRef.current), []);

  useEffect(() => {
    if (pragAvertizatIdx >= PRAGURI_AVERTIZARE.length) return;
    if (totalRotiri >= PRAGURI_AVERTIZARE[pragAvertizatIdx]) {
      setShowWarning(true);
      setPragAvertizatIdx((prev) => prev + 1);
    }
  }, [totalRotiri, pragAvertizatIdx]);

  const genereazaRotire = (seedCurent) => {
    let x = seedCurent;
    const numere = [];
    for (let i = 0; i < 3; i++) {
      x = (A * x + C) % M;
      numere.push(x);
    }
    const indici = numere.map((n) => (developerHack ? 5 : n % 6));
    return { indici, numere, seedNou: x };
  };

  const inregistreazaRezultat = (indici, castig) => {
    setTotalRotiri((prev) => {
      const nou = prev + 1;
      setTotalPariat((prevPariat) => {
        const pariatNou = prevPariat + COST_ROTIRE;
        setTotalCastigat((prevCastigat) => {
          const castigatNou = prevCastigat + castig;
          const rtp = pariatNou > 0 ? (castigatNou / pariatNou) * 100 : 0;
          setRtpIstoric((prevIstoricRtp) => [...prevIstoricRtp.slice(-199), { spin: nou, rtp }]);
          return castigatNou;
        });
        return pariatNou;
      });
      return nou;
    });

    setIstoric((prev) => [{ indici, castig }, ...prev].slice(0, 8));
  };

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);

    const { indici, numere, seedNou } = genereazaRotire(seed);
    setLastNums(numere);

    let ticks = 0;
    const maxTicks = 10;
    spinIntervalRef.current = setInterval(() => {
      ticks++;
      setReels([
        Math.floor(Math.random() * 6),
        Math.floor(Math.random() * 6),
        Math.floor(Math.random() * 6),
      ]);
      if (ticks >= maxTicks) {
        clearInterval(spinIntervalRef.current);
        setReels(indici);
        setSeed(seedNou);
        const castig = calculeazaCastig(indici);
        inregistreazaRezultat(indici, castig);
        setSpinning(false);
      }
    }, 60);
  };

  const handleTurbo = () => {
    if (spinning) return;
    let seedLocal = seed;
    let pariatLocal = 0;
    let castigatLocal = 0;
    const puncteNoi = [];
    let ultimulIndici = reels;

    for (let i = 1; i <= turboCount; i++) {
      const { indici, seedNou } = genereazaRotire(seedLocal);
      seedLocal = seedNou;
      const castig = calculeazaCastig(indici);
      pariatLocal += COST_ROTIRE;
      castigatLocal += castig;
      ultimulIndici = indici;
      if (i % Math.max(1, Math.floor(turboCount / 150)) === 0 || i === turboCount) {
        puncteNoi.push({ spin: totalRotiri + i, rtp: (castigatLocal / pariatLocal) * 100 });
      }
    }

    setSeed(seedLocal);
    setReels(ultimulIndici);
    setTotalRotiri((prev) => prev + turboCount);
    setTotalPariat((prev) => prev + pariatLocal);
    setTotalCastigat((prev) => prev + castigatLocal);
    setRtpIstoric((prev) => [...prev, ...puncteNoi].slice(-200));
    setIstoric((prev) => [{ indici: ultimulIndici, castig: calculeazaCastig(ultimulIndici) }, ...prev].slice(0, 8));
  };

  const handleReset = () => {
    setTotalRotiri(0);
    setTotalPariat(0);
    setTotalCastigat(0);
    setRtpIstoric([]);
    setIstoric([]);
    setLastNums([null, null, null]);
  };

  const handleAplicaSeed = () => {
    const val = parseInt(seedInput, 10);
    if (!isNaN(val)) setSeed(val);
  };

  const rtpCurent = totalPariat > 0 ? ((totalCastigat / totalPariat) * 100).toFixed(1) : '—';

  const renderGraficRTP = () => {
    if (rtpIstoric.length < 2) return null;
    const W = 100, H = 100;
    const maxRtp = Math.max(100, ...rtpIstoric.map((p) => p.rtp), 5);
    const minRtp = 0;
    const puncte = rtpIstoric
      .map((p, i) => {
        const x = (i / (rtpIstoric.length - 1)) * W;
        const y = H - ((p.rtp - minRtp) / (maxRtp - minRtp)) * H;
        return `${x},${y}`;
      })
      .join(' ');
    const yLinie694 = H - ((69.4 - minRtp) / (maxRtp - minRtp)) * H;

    return (
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: '110px' }}>
        <line x1="0" y1={yLinie694} x2={W} y2={yLinie694} stroke="#3a4a70" strokeWidth="0.6" strokeDasharray="2,2" />
        <polyline
          points={puncte}
          fill="none"
          stroke={developerHack ? '#ff4d4f' : '#1fe0f9'}
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  };

  return (
    <div className="ps-wrap">
      {showWarning && (
        <div className="ps-modal-backdrop" role="dialog" aria-modal="true">
          <div className="ps-modal-card">
            <div className="ps-modal-icon">⚠️</div>
            <h4 className="ps-modal-title">O pauză de reflecție</h4>
            <p className="ps-modal-text">
              Ai făcut deja {totalRotiri} de rotiri în acest simulator. Ține minte: ăsta e doar un exercițiu
              de programare — dar algoritmul din spate e identic cu cel al păcănelelor reale. RTP-ul de sub 100%
              înseamnă că, matematic, pe termen lung, jucătorul pierde mereu mai mult decât câștigă.
            </p>
            <p className="ps-modal-text">
              Jocurile de noroc reale pot deveni o dependență foarte greu de controlat. Dacă tu sau cineva
              cunoscut simte că a pierdut controlul, poți suna gratuit la{' '}
              <strong>Linia Joc Responsabil: 0800 800 099</strong> (luni–vineri, 10:00–18:00) — este anonim
              și există specialiști care pot ajuta.
            </p>
            <button className="ps-modal-btn" onClick={() => setShowWarning(false)}>
              Am înțeles, continui simularea
            </button>
          </div>
        </div>
      )}

      <h3 className="ps-title">Simulator interactiv: PRNG-ul din spatele păcănelelor</h3>

      <div className="ps-controls-row">
        <div className="ps-seed-group">
          <span className="ps-label-muted">Seed</span>
          <input
            type="number"
            className="ps-input"
            value={seedInput}
            onChange={(e) => setSeedInput(e.target.value)}
          />
          <button onClick={handleAplicaSeed} className="ps-btn-mini">Aplică</button>
        </div>

        <label className={`ps-toggle ps-toggle-danger ${developerHack ? 'ps-active' : ''}`}>
          <input type="checkbox" checked={developerHack} onChange={(e) => setDeveloperHack(e.target.checked)} />
          <span className="ps-switch" />
          Developer Hack
        </label>

        <label className="ps-toggle">
          <input type="checkbox" checked={aratMatematica} onChange={(e) => setAratMatematica(e.target.checked)} />
          <span className="ps-switch" />
          Arată matematica PRNG
        </label>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div className={`ps-cabinet ${developerHack ? 'ps-hack-active' : ''}`}>
          {reels.map((idx, i) => (
            <div
              key={i}
              className={`ps-reel ${spinning ? 'ps-spinning' : ''} ${developerHack ? 'ps-hack' : ''}`}
            >
              {SIMBOLURI[idx]}
            </div>
          ))}
        </div>
      </div>

      {aratMatematica && (
        <div className="ps-math-line">
          {lastNums[0] !== null ? (
            <>
              X₁={lastNums[0]} → %6={lastNums[0] % 6} &nbsp;|&nbsp; X₂={lastNums[1]} → %6={lastNums[1] % 6} &nbsp;|&nbsp; X₃={lastNums[2]} → %6={lastNums[2] % 6}
              {developerHack && (
                <div className="ps-math-warning">⚠️ Rezultatele PRNG sunt calculate, dar ignorate — codul forțează index 5 (7️⃣) pe toate rolele.</div>
              )}
            </>
          ) : (
            'Apasă SPIN ca să vezi calculul LCG pentru fiecare rolă.'
          )}
        </div>
      )}

      <div className="ps-actions-row">
        <button onClick={handleSpin} disabled={spinning} className="ps-btn-spin">
          {spinning ? 'Se învârte...' : '🎰 SPIN'}
        </button>

        <div className="ps-turbo-group">
          <input
            type="number"
            className="ps-input"
            style={{ width: '80px' }}
            value={turboCount}
            onChange={(e) => setTurboCount(Math.max(1, parseInt(e.target.value) || 1))}
          />
          <button onClick={handleTurbo} disabled={spinning} className="ps-btn-turbo">⚡ Turbo-Spin</button>
        </div>

        <button onClick={handleReset} className="ps-btn-reset">Reset stats</button>
      </div>

      <div className="ps-stats-section">
        <div className="ps-stats-col">
          <div className="ps-chips-row">
            <div className="ps-chip">Rotiri: {totalRotiri}</div>
            <div className="ps-chip">Pariat: {totalPariat} lei</div>
            <div className="ps-chip">Câștigat: {totalCastigat} lei</div>
            <div className={`ps-chip ps-chip-rtp ${developerHack ? 'ps-hack' : ''}`}>RTP live: {rtpCurent}%</div>
          </div>
          <p className="ps-hint">
            Linia punctată din grafic marchează RTP-ul teoretic (69.4%). Cu mai multe rotiri, linia ta ar trebui
            să se apropie de ea — asta e „legea numerelor mari" din lecție, demonstrată live.
          </p>
        </div>

        <div className="ps-stats-col">
          <div className="ps-chart-wrap">
            {renderGraficRTP() || (
              <div className="ps-chart-empty">Fă câteva rotiri ca să vezi graficul RTP-ului convergând.</div>
            )}
          </div>
        </div>
      </div>

      {istoric.length > 0 && (
        <div className="ps-history-wrap">
          <p className="ps-label-muted" style={{ marginBottom: '8px', display: 'block' }}>Ultimele rotiri</p>
          <div className="ps-history-list">
            {istoric.map((h, i) => (
              <div key={i} className={`ps-history-item ${h.castig > 0 ? 'ps-win-item' : ''}`}>
                {h.indici.map((idx, j) => (
                  <span key={j}>{SIMBOLURI[idx]}</span>
                ))}
                {h.castig > 0 && <span className="ps-history-payout">+{h.castig}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}