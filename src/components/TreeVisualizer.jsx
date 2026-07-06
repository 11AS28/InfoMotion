import React, { useState, useEffect } from 'react';
import '../components_css/TreeVisualizer.css';

function TreeNode({ node }) {
  if (!node) return null;

  const getNodeClass = (status) => {
    switch (status) {
      case 'active': return 'tr-node-active';     
      case 'processed': return 'tr-node-parent';  
      case 'solved': return 'tr-node-success';   
      case 'failed': return 'tr-node-failed';     
      default: return '';
    }
  };

  return (
    <div className="tr-tree-branch">
      <div className={`tr-tree-node ${getNodeClass(node.status)}`}>
        <div className="tr-node-label">{node.label || "Nod Recursiv"}</div>
        {node.explanation && <div className="tr-node-desc">{node.explanation}</div>}
      </div>

      {node.children && node.children.length > 0 && (
        <div className="tr-tree-children">
          {node.children.map((child, idx) => (
            <TreeNode key={child.id || idx} node={child} />
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
      }, 1500);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, steps]);

  if (!steps || steps.length === 0) return <p style={{color: '#fff', padding: '20px'}}>Fără pași disponibili.</p>;

  const currentData = steps[currentStep];

  const validTreeNode = currentData.treeStructure || currentData.tree || (currentData.children ? currentData : null);

  return (
    <div className="tree-visualizer-container" style={{ width: '100%', background: '#070a13', padding: '20px', borderRadius: '12px' }}>
      
      <div className="visualizer-explanation" style={{ background: '#111625', padding: '15px', borderRadius: '8px', marginBottom: '20px', color: '#fff', borderLeft: '4px solid #1fe0f9' }}>
         <strong>Pasul {currentStep + 1} / {steps.length}:</strong> {currentData.explanation || "Se execută pasul algoritmului..."}
      </div>

      <div className="tree-canvas" style={{ display: 'flex', justifyContent: 'center', width: '100%', overflowX: 'auto', padding: '30px 0', minHeight: '200px' }}>
        {validTreeNode ? (
          <TreeNode node={validTreeNode} />
        ) : (
          <div style={{ color: '#ffb703', textAlign: 'center', padding: '20px', border: '1px dashed #ffb703', borderRadius: '8px', background: 'rgba(255,183,3,0.05)' }}>
             Pașii primiți nu conțin o structură de arbore validă.<br />
            <span style={{ fontSize: '12px', color: '#8fa0c4' }}>Asigură-te că simulatorul din backend returnează noduri cu 'children'.</span>
          </div>
        )}
      </div>

      <div className="visualizer-controls" style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
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