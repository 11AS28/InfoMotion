import React, { useState, useEffect, useMemo, useRef } from 'react';

const H_SPACING = 110;
const V_SPACING = 100;
const MARGIN = 60;
const NODE_RADIUS = 28;

function culoareStatus(status) {
  switch (status) {
    case 'active': return { fill: '#0d1b2a', stroke: '#1fe0f9' };
    case 'processed': return { fill: '#1a1f2e', stroke: '#5b6b8c' };
    case 'solved': return { fill: '#0d2818', stroke: '#10b981' };
    case 'failed': return { fill: '#2a0d0d', stroke: '#ef4444' };
    default: return { fill: '#111625', stroke: '#5b6b8c' };
  }
}

// calculează poziția fiecărui nod O SINGURĂ DATĂ, pe arborele complet (ultimul pas)
function calculeazaSchelet(root) {
  const positions = {};
  let leafX = 0;

  function walk(node, depth) {
    if (!node.children || node.children.length === 0) {
      positions[node.id] = { x: leafX, depth };
      leafX += 1;
      return positions[node.id].x;
    }
    const xsCopii = node.children.map(c => walk(c, depth + 1));
    const x = (Math.min(...xsCopii) + Math.max(...xsCopii)) / 2;
    positions[node.id] = { x, depth };
    return x;
  }

  if (root) walk(root, 0);
  return { positions, totalLeaves: leafX };
}

function extrageNoduriCurente(node, parentId, acumulator) {
  if (!node) return;
  acumulator.push({
    id: node.id,
    label: node.label,
    explanation: node.explanation,
    status: node.status,
    parentId
  });
  (node.children || []).forEach(child => extrageNoduriCurente(child, node.id, acumulator));
}

function TreeVisualizer({ steps, scaleToFit = false }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [fitZoom, setFitZoom] = useState(1);
  const containerRef = useRef(null);

  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, [steps]);

  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1200);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, steps]);

  const arboreFinal = steps && steps.length > 0
    ? steps[steps.length - 1].treeStructure
    : null;

  const { positions, totalLeaves } = useMemo(
    () => calculeazaSchelet(arboreFinal),
    [arboreFinal]
  );

  const maxDepth = Math.max(0, ...Object.values(positions).map(p => p.depth));
  const svgWidth = MARGIN * 2 + Math.max(totalLeaves - 1, 0) * H_SPACING + NODE_RADIUS * 2;
  const svgHeight = MARGIN * 2 + maxDepth * V_SPACING + NODE_RADIUS * 2;

  // Calculăm zoom-ul inițial "fit to screen" DOAR în Focus Mode, ca punct de plecare
  useEffect(() => {
    if (!scaleToFit) {
      setZoom(1);
      setFitZoom(1);
      return;
    }
    const computeFit = () => {
      if (containerRef.current && svgWidth > 0) {
        const availableWidth = containerRef.current.clientWidth - 20;
        const raw = availableWidth / svgWidth;
        const clamped = Math.min(1, Math.max(raw, 0.25));
        setFitZoom(clamped);
        setZoom(clamped);
      }
    };
    computeFit();
    window.addEventListener('resize', computeFit);
    return () => window.removeEventListener('resize', computeFit);
  }, [scaleToFit, svgWidth]);

  if (!steps || steps.length === 0) {
    return <p style={{ color: '#fff', padding: '20px' }}>Fără pași disponibili.</p>;
  }

  const currentData = steps[currentStep];
  const arborePartial = currentData.treeStructure;

  const noduriCurente = [];
  extrageNoduriCurente(arborePartial, null, noduriCurente);

  const pixelDe = (id) => {
    const p = positions[id];
    if (!p) return null;
    return {
      x: MARGIN + p.x * H_SPACING,
      y: MARGIN + p.depth * V_SPACING
    };
  };

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.2, 2.5));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.2, 0.2));
  const handleZoomReset = () => setZoom(fitZoom);

  const arbore = (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      style={
        scaleToFit
          ? { display: 'block', transform: `scale(${zoom})`, transformOrigin: 'top left' }
          : { display: 'block', margin: '0 auto' }
      }
    >
      {/* muchii */}
      {noduriCurente.map((nod) => {
        if (nod.parentId === null) return null;
        const pParinte = pixelDe(nod.parentId);
        const pCopil = pixelDe(nod.id);
        if (!pParinte || !pCopil) return null;
        return (
          <line
            key={`edge-${nod.id}`}
            x1={pParinte.x} y1={pParinte.y}
            x2={pCopil.x} y2={pCopil.y}
            stroke="#3a4358"
            strokeWidth={2}
          />
        );
      })}

      {/* noduri */}
      {noduriCurente.map((nod) => {
        const p = pixelDe(nod.id);
        if (!p) return null;
        const culoare = culoareStatus(nod.status);
        return (
          <g key={`node-${nod.id}`}>
            <circle
              cx={p.x} cy={p.y} r={NODE_RADIUS}
              fill={culoare.fill}
              stroke={culoare.stroke}
              strokeWidth={2.5}
            />
            <text
              x={p.x} y={p.y - 2}
              textAnchor="middle"
              fill="#fff"
              fontSize="13"
              fontWeight="bold"
              fontFamily="monospace"
            >
              {nod.label}
            </text>
            {nod.explanation && (
              <title>{nod.explanation}</title>
            )}
          </g>
        );
      })}
    </svg>
  );

  return (
    <div style={{ width: '100%', background: '#070a13', padding: '20px', borderRadius: '12px' }}>

      <div style={{
        background: '#111625', padding: '15px', borderRadius: '8px',
        marginBottom: '20px', color: '#fff', borderLeft: '4px solid #1fe0f9'
      }}>
        <strong>Pasul {currentStep + 1} / {steps.length}:</strong> {currentData.explanation || "Se execută pasul algoritmului..."}
      </div>

      {scaleToFit && (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap' }}>
          <button className="visualizer-btn" onClick={handleZoomOut}>➖ Micșorează</button>
          <button className="visualizer-btn" onClick={handleZoomReset}>🔍 Vedere completă</button>
          <button className="visualizer-btn" onClick={handleZoomIn}>➕ Mărește</button>
          <span style={{ color: '#9aa3ab', fontSize: '13px', minWidth: '48px', textAlign: 'center' }}>
            {Math.round(zoom * 100)}%
          </span>
        </div>
      )}

      {scaleToFit ? (
        <div
          ref={containerRef}
          style={{
            width: '100%',
            overflow: 'auto',
            maxHeight: 'calc(100vh - 340px)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '8px'
          }}
        >
          <div style={{ width: svgWidth * zoom, height: svgHeight * zoom }}>
            {arbore}
          </div>
        </div>
      ) : (
        <div style={{ width: '100%', overflowX: 'auto' }}>
          {arbore}
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
        <button className="visualizer-btn" onClick={() => setCurrentStep(p => p - 1)} disabled={currentStep === 0}>
          Anterior
        </button>
        <button className={`visualizer-btn ${isPlaying ? 'pause-btn' : 'play-btn'}`} onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? '⏸ Pauză' : '▶ Auto Play'}
        </button>
        <button className="visualizer-btn" onClick={() => setCurrentStep(p => p + 1)} disabled={currentStep === steps.length - 1}>
          Următorul
        </button>
      </div>
    </div>
  );
}

export default TreeVisualizer;