// src/components/ArrayVisualizer.jsx
import React, { useState, useEffect } from 'react';
import '../components_css/ArrayVisualizer.css'; 

function ArrayVisualizer({ steps }) {
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
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, steps]);

  if (!steps || steps.length === 0) return null;

  const currentData = steps[currentStep];
  const maxVal = Math.max(...currentData.array, 1);

  return (
    <div className="visualizer-container">
      
      {/* 1. Caseta de Explicații */}
      <div className="visualizer-explanation">
        💡 <strong>Pasul {currentStep + 1} / {steps.length}:</strong> {currentData.explanation}
      </div>

      {/* 2. Barele pentru Vector */}
      <div className="visualizer-bars-area">
        {currentData.array.map((value, index) => {
          const calculatedHeight = (value / maxVal) * 160 + 20;

          let bgColor = '#00f2fe'; 
          if (currentData.highlights && currentData.highlights.includes(index)) {
            bgColor = '#f43f5e'; 
          } else if (currentData.done) {
            bgColor = '#10b981'; 
          }

          return (
            <div 
              key={index} 
              className="visualizer-bar"
              style={{ 
                height: `${calculatedHeight}px`, 
                backgroundColor: bgColor,
                boxShadow: `0 0 10px ${bgColor}44`
              }}
            >
              <span className="bar-value">{value}</span>
              <span className="bar-index">[{index}]</span>
            </div>
          );
        })}
      </div>

      {/*  3. Zona pentru Stiva de Apeluri Recursive (Așezată curat sub bare) */}
      {steps[currentStep]?.apelCurent && (
        <div className="recursion-stack-zone" style={{
          marginTop: '25px',
          marginBottom: '15px',
          padding: '15px',
          background: '#0d1117',
          border: '1px solid #1fe0f9',
          borderRadius: '8px',
          boxShadow: '0 0 10px rgba(31, 224, 249, 0.2)',
          textAlign: 'left',
          width: '100%'
        }}>
          <h4 style={{ color: '#1fe0f9', margin: '0 0 10px 0', fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase' }}>
             Stiva de Apeluri Recursive (Divide et Impera)
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '5px' }}>
            <div className="stack-frame active" style={{
              background: 'rgba(31, 224, 249, 0.15)',
              color: '#fff',
              padding: '10px 14px',
              borderRadius: '5px',
              borderLeft: '4px solid #1fe0f9',
              fontFamily: 'monospace',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
               {steps[currentStep].apelCurent}
            </div>
          </div>
        </div>
      )}

      {/* 4. Butoanele de Control */}
      <div className="visualizer-controls">
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

export default ArrayVisualizer;