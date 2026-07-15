import React, { useState, useEffect, useMemo, useRef } from 'react';

function culoareStatus(status) {
  switch (status) {
    case 'nevizitat': return { fill: '#111625', stroke: '#5b6b8c' };
    case 'in_coada': return { fill: '#2a2410', stroke: '#eab308' };
    case 'curent': return { fill: '#0d1b2a', stroke: '#1fe0f9' };
    case 'vizitat': return { fill: '#0d2818', stroke: '#10b981' };
    default: return { fill: '#111625', stroke: '#5b6b8c' };
  }
}

function calculeazaPozitiiCerc(noduri, width, height) {
  const cx = width / 2, cy = height / 2;
  // Raza se adaptează după înălțime ca să nu iasă nodurile din ecran
  const r = Math.min(width, height) / 2 - 60; 
  const positions = {};
  noduri.forEach((id, index) => {
    const unghi = (2 * Math.PI * index) / noduri.length - Math.PI / 2;
    positions[id] = { x: cx + r * Math.cos(unghi), y: cy + r * Math.sin(unghi) };
  });
  return positions;
}

function GraphVisualizer({ steps }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Pozițiile personalizate ale nodurilor
  const [customPositions, setCustomPositions] = useState({});
  
  // Detalii despre drag
  const [draggedNode, setDraggedNode] = useState(null);
  const svgRef = useRef(null);

  useEffect(() => { 
    setCurrentStep(0); 
    setIsPlaying(false); 
  }, [steps]);

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

  // --- DIMENSIUNI MĂRITE (Format panoramic pentru mai mult spațiu de mișcare) ---
  const width = 800; 
  const height = 500;
  
  const noduriToate = steps?.[0]?.graphState.nodes.map(n => n.id) || [];
  
  // Pozițiile inițiale centrate în noul spațiu de 800x500
  const initialPositions = useMemo(() => calculeazaPozitiiCerc(noduriToate, width, height), [steps]);

  useEffect(() => {
    setCustomPositions(initialPositions);
  }, [initialPositions]);

  if (!steps || steps.length === 0) return <p style={{ color: '#fff' }}>Fără pași disponibili.</p>;

  const currentData = steps[currentStep];
  const { nodes, edges, coada } = currentData.graphState;

  // --- LOGICA DE DRAG AND DROP ---
  const handleMouseDown = (nodeId, e) => {
    e.preventDefault();
    setDraggedNode(nodeId);
  };

  const handleMouseMove = (e) => {
    if (draggedNode === null || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    
    // Scalare corectă pentru viewBox-ul mărit de 800x500
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    // Limitare în noul spațiu (cu o margine de siguranță de 30px ca să nu iasă din SVG)
    const boundedX = Math.max(30, Math.min(width - 30, mouseX));
    const boundedY = Math.max(30, Math.min(height - 30, mouseY));

    setCustomPositions((prev) => ({
      ...prev,
      [draggedNode]: { x: boundedX, y: boundedY }
    }));
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
  };

  useEffect(() => {
    if (draggedNode !== null) {
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedNode]);

  return (
    <div style={{ width: '100%', background: '#070a13', padding: '20px', borderRadius: '12px', userSelect: 'none' }}>

      <div style={{ background: '#111625', padding: '15px', borderRadius: '8px', marginBottom: '20px', color: '#fff', borderLeft: '4px solid #1fe0f9' }}>
        <strong>Pasul {currentStep + 1} / {steps.length}:</strong> {currentData.explanation}
      </div>

      {/* SVG fără border punctat și cu lățime maximă fluidă */}
      <svg 
        ref={svgRef}
        width="100%" 
        height={height} 
        viewBox={`0 0 ${width} ${height}`} 
        style={{ 
          display: 'block', 
          margin: '0 auto', 
          background: 'transparent',
          cursor: draggedNode !== null ? 'grabbing' : 'default',
          maxWidth: '800px' // Îl ținem la maxim 800px pe desktop ca să nu se întindă exagerat
        }}
        onMouseMove={handleMouseMove}
      >
        {/* MUCHII */}
        {edges.map((e, i) => {
          const p1 = customPositions[e.from], p2 = customPositions[e.to];
          if (!p1 || !p2) return null;
          return (
            <line key={`e-${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
              stroke={e.activa ? '#1fe0f9' : '#3a4358'}
              strokeWidth={e.activa ? 3 : 1.5} />
          );
        })}

        {/* NODURI */}
        {nodes.map((n) => {
          const p = customPositions[n.id];
          if (!p) return null;
          const c = culoareStatus(n.status);
          const isCurrentDragged = draggedNode === n.id;

          return (
            <g 
              key={`n-${n.id}`}
              onMouseDown={(e) => handleMouseDown(n.id, e)}
              style={{ cursor: isCurrentDragged ? 'grabbing' : 'grab' }}
            >
              <circle 
                cx={p.x} 
                cy={p.y} 
                r={26} 
                fill={c.fill} 
                stroke={isCurrentDragged ? '#fff' : c.stroke} 
                strokeWidth={isCurrentDragged ? 4 : 2.5} 
                style={{ transition: isCurrentDragged ? 'none' : 'stroke 0.2s, fill 0.2s' }}
              />
              <text 
                x={p.x} 
                y={p.y + 5} 
                textAnchor="middle" 
                fill="#fff" 
                fontSize="15" 
                fontWeight="bold" 
                fontFamily="monospace"
                pointerEvents="none"
              >
                {n.id}
              </text>
            </g>
          );
        })}
      </svg>

      <div style={{ marginTop: '20px', padding: '15px', background: '#0d1117', border: '1px solid #1fe0f9', borderRadius: '8px' }}>
        <h4 style={{ color: '#1fe0f9', margin: '0 0 10px 0', fontSize: '13px', textTransform: 'uppercase' }}>Coadă (BFS)</h4>
        <div style={{ display: 'flex', gap: '10px' }}>
          {coada.length === 0 ? (
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