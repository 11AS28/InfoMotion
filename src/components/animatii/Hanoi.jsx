import React, { useState, useRef, useEffect, useCallback } from 'react';
import '../animatii_css/hanoi.css';

const PEGS = ['A', 'B', 'C'];
const TOWER_HEIGHT = 190; // px, zona in care se stivuiesc discurile
const DISC_HEIGHT = 20; // px
const BASE_OFFSET = 8; // px, inaltimea "bazei" de sub primul disc
const LIFT_BOTTOM = TOWER_HEIGHT + 34; // cat de sus se ridica discul cand traverseaza

function genereazaMutari(n, sursa, destinatie, auxiliar, mutari) {
  if (n === 0) return;
  genereazaMutari(n - 1, sursa, auxiliar, destinatie, mutari);
  mutari.push({ disc: n, from: sursa, to: destinatie });
  genereazaMutari(n - 1, auxiliar, destinatie, sursa, mutari);
}

function turnuriInitiale(n) {
  // turnul A contine toate discurile, cel mai mare la baza (index 0)
  const a = Array.from({ length: n }, (_, i) => n - i);
  return [a, [], []];
}

function pegLeftPercent(idx) {
  return [16.66, 50, 83.33][idx];
}

function culoareDisc(size, nMax) {
  const hue = 190 - ((size - 1) / Math.max(1, nMax - 1)) * 150; // de la teal spre auriu/rosu
  return `hsl(${hue}, 80%, 58%)`;
}

export default function HanoiAnim() {
  const [n, setN] = useState(3);
  const [towers, setTowers] = useState(() => turnuriInitiale(3));
  const [moves, setMoves] = useState(() => {
    const m = [];
    genereazaMutari(3, 0, 2, 1, m);
    return m;
  });
  const [moveIndex, setMoveIndex] = useState(0);
  const [animState, setAnimState] = useState(null); // {discSize, left, bottom, phase}
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(500); // ms per mutare completa

  const playingRef = useRef(false);
  const animatingRef = useRef(false);
  const timeoutsRef = useRef([]);
  const epochRef = useRef(0);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  const clearTimers = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  useEffect(() => () => clearTimers(), []);

  const resetTot = useCallback((nouN) => {
    clearTimers();
    setPlaying(false);
    playingRef.current = false;
    animatingRef.current = false;
    setAnimState(null);
    const m = [];
    genereazaMutari(nouN, 0, 2, 1, m);
    setMoves(m);
    setTowers(turnuriInitiale(nouN));
    setMoveIndex(0);
  }, []);

  const schimbaN = (nou) => {
    setN(nou);
    resetTot(nou);
  };

  const executaMutare = useCallback(() => {
    if (animatingRef.current) return;
    setMoveIndex((idxCurent) => {
      if (idxCurent >= moves.length) return idxCurent;
      const mutare = moves[idxCurent];
      const fromIdx = PEGS.indexOf(mutare.from);
      const toIdx = PEGS.indexOf(mutare.to);

      animatingRef.current = true;

      setTowers((prevTowers) => {
        const copie = prevTowers.map((t) => [...t]);
        const disc = copie[fromIdx].pop();

        const bottomStart = BASE_OFFSET + copie[fromIdx].length * DISC_HEIGHT;
        const bottomEnd = BASE_OFFSET + copie[toIdx].length * DISC_HEIGHT;
        const leftStart = pegLeftPercent(fromIdx);
        const leftEnd = pegLeftPercent(toIdx);

        setAnimState({ discSize: disc, left: leftStart, bottom: bottomStart, phase: 'start' });

        const t1 = setTimeout(() => {
          setAnimState((prev) => (prev ? { ...prev, bottom: LIFT_BOTTOM, phase: 'lift' } : prev));
        }, 20);

        const t2 = setTimeout(() => {
          setAnimState((prev) => (prev ? { ...prev, left: leftEnd, phase: 'across' } : prev));
        }, 220);

        const t3 = setTimeout(() => {
          setAnimState((prev) => (prev ? { ...prev, bottom: bottomEnd, phase: 'drop' } : prev));
        }, 480);

        const t4 = setTimeout(() => {
          setTowers((t) => {
            const c = t.map((x) => [...x]);
            c[toIdx].push(disc);
            return c;
          });
          setAnimState(null);
          animatingRef.current = false;
          setMoveIndex((i) => i + 1);

          if (playingRef.current) {
            const nextDelay = Math.max(80, speed - 660);
            const t5 = setTimeout(() => {
              if (playingRef.current) executaMutare();
            }, nextDelay);
            timeoutsRef.current.push(t5);
          }
        }, 660);

        timeoutsRef.current.push(t1, t2, t3, t4);
        return copie;
      });

      return idxCurent; // moveIndex se incrementeaza in t4, dupa ce mutarea s-a incheiat vizual
    });
  }, [moves, speed]);

  const handlePasUrmator = () => {
    if (moveIndex >= moves.length || animatingRef.current) return;
    executaMutare();
  };

  const handlePlayPause = () => {
    if (moveIndex >= moves.length) return;
    const nouStatus = !playing;
    setPlaying(nouStatus);
    playingRef.current = nouStatus;
    if (nouStatus && !animatingRef.current) {
      executaMutare();
    }
  };

  const handleReset = () => resetTot(n);

  const totalMutari = moves.length; // 2^n - 1
  const gata = moveIndex >= moves.length;
  const mutareCurenta = moves[Math.min(moveIndex, moves.length - 1)];

  return (
    <div className="hn-wrap">
      <h3 className="hn-title">Turnurile din Hanoi</h3>

      <div className="hn-disc-selector">
        {[3, 4, 5].map((val) => (
          <button
            key={val}
            className={`hn-disc-btn ${n === val ? 'hn-disc-btn-active' : ''}`}
            onClick={() => schimbaN(val)}
          >
            {val} discuri
          </button>
        ))}
      </div>

      <div className="hn-formula-box">
        Număr minim de mutări pentru {n} discuri: <strong>2<sup>{n}</sup> − 1 = {totalMutari}</strong>
      </div>

      <div className="hn-towers-area">
        {[0, 1, 2].map((pegIdx) => (
          <div key={pegIdx} className="hn-peg-col">
            <div className="hn-peg-pole" />
            <div className="hn-peg-base" />
            {towers[pegIdx].map((size, k) => (
              <div
                key={size}
                className="hn-disc"
                style={{
                  bottom: `${BASE_OFFSET + k * DISC_HEIGHT}px`,
                  width: `${34 + size * (110 / Math.max(5, n))}px`,
                  background: culoareDisc(size, Math.max(n, 3)),
                }}
              >
                {size}
              </div>
            ))}
            <span className="hn-peg-label">{PEGS[pegIdx]}</span>
          </div>
        ))}

        {animState && (
          <div
            className={`hn-disc hn-disc-flying hn-phase-${animState.phase}`}
            style={{
              left: `${animState.left}%`,
              bottom: `${animState.bottom}px`,
              width: `${34 + animState.discSize * (110 / Math.max(5, n))}px`,
              background: culoareDisc(animState.discSize, Math.max(n, 3)),
            }}
          >
            {animState.discSize}
          </div>
        )}
      </div>

      <p className="hn-move-desc">
        {gata
          ? `✅ Rezolvat în ${totalMutari} mutări — numărul minim posibil!`
          : `Mutarea ${moveIndex + 1}/${totalMutari}: discul ${mutareCurenta.disc} → de la ${mutareCurenta.from} la ${mutareCurenta.to}`}
      </p>

      <div className="hn-controls-row">
        <button className="hn-btn-play" onClick={handlePlayPause} disabled={gata}>
          {playing ? '⏸ Pauză' : '▶ Auto-Solve'}
        </button>
        <button className="hn-btn-step" onClick={handlePasUrmator} disabled={gata || playing}>
          Pasul Următor
        </button>
        <button className="hn-btn-reset" onClick={handleReset}>Reset</button>

        <div className="hn-speed-group">
          <span className="hn-label-muted">Viteză</span>
          <input
            type="range"
            min="200"
            max="1200"
            step="50"
            value={1400 - speed}
            onChange={(e) => setSpeed(1400 - parseInt(e.target.value, 10))}
            className="hn-slider"
          />
        </div>
      </div>
    </div>
  );
}