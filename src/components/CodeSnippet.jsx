// src/components/CodeSnippet.jsx
import React from 'react';
import '../components_css/codeSnippet.css'; 

function CodeSnippet({ codeString, labelText }) {
  return (
    <div className="code-card">
      <div className="code-top">
        <span className="dot red"></span>
        <span className="dot yellow"></span>
        <span className="dot green"></span>
      </div>
      <pre>
        <code>{codeString}</code>
      </pre>
      {labelText && (
        <p className="code-label">{labelText}</p>
      )}
    </div>
  );
}

export default CodeSnippet;