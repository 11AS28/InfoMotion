// src/components/TreeVisualizer.jsx
import React, { useState, useEffect } from 'react';
import '../components_css/TreeVisualizer.css'; // O să facem și CSS-ul imediat

// Componentă recursivă pentru randarea fiecărui nod din arbore
function TreeNode({ node }) {
  if (!node) return null;

  const getNodeClass = (status) => {
    switch (status) {
      case 'active': return 'tr-node-active';     // Neon/Cyan strălucitor (se execută acum)
      case 'processed': return 'tr-node-parent';  // Gri închis (a apelat copii și așteaptă)
      case 'solved': return 'tr-node-success';    // Verde intens (Aici s-a oprit/Găsit)
      case 'failed': return 'tr-node-failed';      // Roșu șters (Ramură eșuată)
      default: return '';
    }
  };

  return (
    <div className="tr-tree-branch">
      <div className={`tr-tree-node ${getNodeClass(node.status)}`}>
        <div className="tr-node-label">{node.label}</div>
        <div className="tr-node-desc">{node.explanation}</div>
      </div>

      {node.children && node.children.length > 0 && (
        <div className="tr-tree-children">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}

function TreeVisualizer({ steps }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

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
      }, 1500); // 1.5 secunde ca să poată citi arborele
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, steps]);

  if (!steps || steps.length === 0) return <p style={{color: '#fff'}}>Introduceți datele și apăsați butonul de generare.</p>;

  const currentData = steps[currentStep];

  return (
    <div className="tree-visualizer-container">
      <div className="visualizer-explanation">
        💡 <strong>Pasul {currentStep + 1} / {steps.length}:</strong> {currentData.explanation}
      </div>

      <div className="tree-canvas">
        <TreeNode node={currentData.treeStructure} />
      </div>

      <div className="visualizer-controls" style={{marginTop: '30px'}}>
        <button 
          className="visualizer-btn"
          onClick={() => setCurrentStep(p => p - 1)} 
          disabled={currentStep === 0}
        >
          Anterior
        </button>
        
        <button 
          className={`visualizer-btn ${isPlaying ? 'pause-btn' : 'play-btn'}`}
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? '⏸ Pauză' : '▶ Auto Play'}
        </button>
        
        <button 
          className="visualizer-btn"
          onClick={() => setCurrentStep(p => p + 1)} 
          disabled={currentStep === steps.length - 1}
        >
          Următorul
        </button>
      </div>
    </div>
  );
}

export default TreeVisualizer;