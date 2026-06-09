import React from 'react';

export default function CoinIcon({ size = 20, className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradient pentru corpul monedei */}
        <linearGradient id="coinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" /> {/* Aur strălucitor */}
          <stop offset="100%" stopColor="#FFA500" /> {/* Portocaliu/Aur închis */}
        </linearGradient>
        {/* Gradient pentru reflexia interioară */}
        <linearGradient id="innerGrad" x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#FFF5B7" />
          <stop offset="100%" stopColor="#FF8C00" />
        </linearGradient>
      </defs>
      
      {/* Cercul exterior (Baza monedei) */}
      <circle cx="12" cy="12" r="11" fill="url(#coinGrad)" stroke="#E69500" strokeWidth="1" />
      
      {/* Cercul interior reliefat */}
      <circle cx="12" cy="12" r="8.5" fill="url(#innerGrad)" opacity="0.9" />
      
      {/* Litera "I" de la InfoMotion (Stilizată ca un chip tech/minimalist) */}
      <path 
        d="M10.5 7.5h3V9h-3V7.5zm0 3h3V16.5h-3V10.5z" 
        fill="#663C00" 
        stroke="#663C00" 
        strokeWidth="0.5"
        strokeLinecap="round" 
      />
    </svg>
  );
}