// src/components/ArrayVisualizer.jsx
import React, { useState, useEffect } from 'react';
import '../components_css/ArrayVisualizer.css'; // <-- Importăm CSS-ul proaspăt creat

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

          // Culorile rămân dinamice în codul JS
          let bgColor = '#00f2fe'; 
          if (currentData.highlights.includes(index)) {
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

      {/* 3. Butoanele de Control */}
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