import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';

const NODE_RADIUS = 26;

function culoareStatus(status) {
  switch (status) {
    case 'nevizitat': return { fill: '#111625', stroke: '#5b6b8c' };
    case 'in_coada': return { fill: '#2a2410', stroke: '#eab308' };
    case 'curent': return { fill: '#0d1b2a', stroke: '#1fe0f9' };
    case 'vizitat': return { fill: '#0d2818', stroke: '#10b981' };
    case 'nou': return { fill: '#0d1b2a', stroke: '#1fe0f9' };
    case 'stabil': return { fill: '#111625', stroke: '#5b6b8c' };
    default: return { fill: '#111625', stroke: '#5b6b8c' };
  }
}

function calculeazaPozitiiCerc(noduri, width, height) {
  const cx = width / 2, cy = height / 2, r = Math.min(width, height) / 2 - 50;
  const positions = {};
  noduri.forEach((id, index) => {
    const unghi = (2 * Math.PI * index) / noduri.length - Math.PI / 2;
    positions[id] = { x: cx + r * Math.cos(unghi), y: cy + r * Math.sin(unghi) };
  });
  return positions;
}

function scurteazaLinie(p1, p2, dist) {
  const dx = p2.x - p1.x, dy = p2.y - p1.y;
  const lungime = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / lungime, uy = dy / lungime;
  return {
    x1: p1.x + ux * dist,
    y1: p1.y + uy * dist,
    x2: p2.x - ux * dist,
    y2: p2.y - uy * dist
  };
}

function GraphVisualizer({ steps }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positions, setPositions] = useState({});
  const [draggingId, setDraggingId] = useState(null);

  const svgRef = useRef(null);

  const width = 800, height = 600;

  const noduriToate = useMemo(() => {
    const set = new Set();
    (steps || []).forEach(s => s.graphState.nodes.forEach(n => set.add(n.id)));
    return [...set];
  }, [steps]);

  // recalculăm layout-ul de bază doar când se schimbă setul de noduri (steps nou),
  // dar userul poate trage și schimba poziția oricărui nod după aceea
  useEffect(() => {
    setPositions(calculeazaPozitiiCerc(noduriToate, width, height));
    setCurrentStep(0);
    setIsPlaying(false);
  }, [noduriToate]);

  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= steps.length - 1) { setIsPlaying(false); return prev; }
          return prev + 1;
        });
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [isPlaying, steps]);

  const coordDinEveniment = useCallback((evt) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const punctTransformat = pt.matrixTransform(ctm.inverse());
    return { x: punctTransformat.x, y: punctTransformat.y };
  }, []);

  const handleMouseDownNod = (id) => (evt) => {
    evt.preventDefault();
    setDraggingId(id);
  };

  const handleMouseMove = (evt) => {
    if (!draggingId) return;
    const { x, y } = coordDinEveniment(evt);
    setPositions((prev) => ({ ...prev, [draggingId]: { x, y } }));
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  if (!steps || steps.length === 0) return <p style={{ color: '#fff' }}>Fără pași disponibili.</p>;

  const currentData = steps[currentStep];
  const { nodes, edges, coada } = currentData.graphState;

  const edgesDeAfisat = [];
  const vazute = new Set();
  edges.forEach((e) => {
    const cheieDirecta = `${e.from}->${e.to}`;
    const cheieInversa = `${e.to}->${e.from}`;
    if (!e.directed && vazute.has(cheieInversa)) return;
    vazute.add(cheieDirecta);
    edgesDeAfisat.push(e);
  });

  return (
    <div style={{ width: '100%', background: '#070a13', padding: '20px', borderRadius: '12px' }}>

      <div style={{ background: '#111625', padding: '15px', borderRadius: '8px', marginBottom: '20px', color: '#fff', borderLeft: '4px solid #1fe0f9' }}>
        <strong>Pasul {currentStep + 1} / {steps.length}:</strong> {currentData.explanation}
      </div>

      <div style={{ fontSize: '12px', color: '#5b6b8c', marginBottom: '8px', textAlign: 'center' }}>
        💡 Poți trage nodurile cu mouse-ul ca să rearanjezi graful.
      </div>

      <div
        style={{
          resize: 'both',
          overflow: 'auto',
          minWidth: '360px',
          minHeight: '300px',
          width: '100%',
          height: '600px',
          border: '1px dashed rgba(31, 224, 249, 0.3)',
          borderRadius: '10px',
          background: '#05070c'
        }}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ display: 'block', touchAction: 'none' }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
        <defs>
          <marker id="graph-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#3a4358" />
          </marker>
          <marker id="graph-arrow-activ" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#1fe0f9" />
          </marker>
        </defs>

        {edgesDeAfisat.map((e, i) => {
          const p1 = positions[e.from], p2 = positions[e.to];
          if (!p1 || !p2) return null;

          const linie = scurteazaLinie(p1, p2, NODE_RADIUS + (e.directed ? 4 : 0));
          const midX = (linie.x1 + linie.x2) / 2;
          const midY = (linie.y1 + linie.y2) / 2;

          return (
            <g key={`e-${i}`}>
              <line
                x1={linie.x1} y1={linie.y1} x2={linie.x2} y2={linie.y2}
                stroke={e.activa ? '#1fe0f9' : '#3a4358'}
                strokeWidth={e.activa ? 3 : 1.5}
                markerEnd={e.directed ? `url(#${e.activa ? 'graph-arrow-activ' : 'graph-arrow'})` : undefined}
              />
              {(e.weight !== null && e.weight !== undefined) && (
                <>
                  <circle cx={midX} cy={midY} r={11} fill="#070a13" stroke="#3a4358" strokeWidth={1} />
                  <text x={midX} y={midY + 4} textAnchor="middle" fill={e.activa ? '#1fe0f9' : '#c7d0e0'} fontSize="11" fontFamily="monospace" fontWeight="bold">
                    {e.weight}
                  </text>
                </>
              )}
            </g>
          );
        })}

        {nodes.map((n) => {
          const p = positions[n.id];
          if (!p) return null;
          const c = culoareStatus(n.status);
          return (
            <g
              key={`n-${n.id}`}
              onMouseDown={handleMouseDownNod(n.id)}
              style={{ cursor: draggingId === n.id ? 'grabbing' : 'grab' }}
            >
              <circle cx={p.x} cy={p.y} r={NODE_RADIUS} fill={c.fill} stroke={c.stroke} strokeWidth={2.5} />
              <text x={p.x} y={p.y + 5} textAnchor="middle" fill="#fff" fontSize="15" fontWeight="bold" fontFamily="monospace" style={{ userSelect: 'none' }}>
                {n.id}
              </text>
              {n.distanta !== undefined && n.distanta !== null && (
                <text x={p.x} y={p.y - NODE_RADIUS - 8} textAnchor="middle" fill="#eab308" fontSize="12" fontFamily="monospace" style={{ userSelect: 'none' }}>
                  d={n.distanta === Infinity ? '∞' : n.distanta}
                </text>
              )}
            </g>
          );
        })}
        </svg>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#0d1117', border: '1px solid #1fe0f9', borderRadius: '8px' }}>
        <h4 style={{ color: '#1fe0f9', margin: '0 0 10px 0', fontSize: '13px', textTransform: 'uppercase' }}>Coadă / Stivă</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {(!coada || coada.length === 0) ? (
            <span style={{ color: '#5b6b8c' }}>— goală —</span>
          ) : coada.map((nodId, i) => (
            <div key={i} style={{
              background: 'rgba(31,224,249,0.15)', border: '1px solid #1fe0f9',
              borderRadius: '6px', padding: '6px 14px', color: '#fff', fontFamily: 'monospace', fontWeight: 'bold'
            }}>
              {nodId}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
        <button className="visualizer-btn" onClick={() => setCurrentStep(p => p - 1)} disabled={currentStep === 0}>Anterior</button>
        <button className={`visualizer-btn ${isPlaying ? 'pause-btn' : 'play-btn'}`} onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? '⏸ Pauză' : '▶ Auto Play'}
        </button>
        <button className="visualizer-btn" onClick={() => setCurrentStep(p => p + 1)} disabled={currentStep === steps.length - 1}>Următorul</button>
      </div>
    </div>
  );
}

export default GraphVisualizer;