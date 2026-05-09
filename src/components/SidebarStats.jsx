import React, { useEffect, useState } from 'react'; 
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import '../components_css/SidebarStats.css';
import { doc, updateDoc } from 'firebase/firestore'; 
import { db } from '../firebase'; 
import { FaFire } from "react-icons/fa";

function SidebarStats({ isOpen, onClose }) {
  const { currentUser, getStatistici, logout, actualizeazaStreak } = useAuth();
  const { theme } = useTheme(); 

  const [handleInput, setHandleInput] = useState(currentUser?.codeforcesHandle || "");
  
  useEffect(() => {
    if (currentUser) {
      setHandleInput(currentUser.codeforcesHandle || "");
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && isOpen) {
      actualizeazaStreak();
    }
  }, [currentUser, isOpen]);

  const handleSave = async () => {
    if (!currentUser || handleInput === currentUser.codeforcesHandle) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        codeforcesHandle: handleInput
      });
      console.log("Handle salvat cu succes!");
    } catch (error) {
      console.error("Eroare la salvarea Codeforces Handle:", error);
    }
  };

  if (!currentUser) return null;

  const stats = getStatistici();
  const { progresProcent } = stats;

  let nivel = "Începător";
  if (progresProcent >= 80) {
    nivel = "Expert";
  } else if (progresProcent >= 40) {
    nivel = "Intermediar";
  }

  // 1. Declarăm numărul de zile PRIMUL
  const currentCount = currentUser.streakCount || 0;

  // 2. Funcția de culori
  const getStreakColor = (streak) => {
    if (streak >= 90) return "#00ffea"; 
    if (streak >= 50) return "#cc00ff"; 
    if (streak >= 10)  return "#ff4500"; 
    if (streak >= 3)  return "#ffa500"; 
    if (streak >= 1)  return "#ffd700"; 
    return "#cccccc";                   
  };

  // 3. Calculăm culoarea folosind numărul de zile
  const streakColor = getStreakColor(currentCount);

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      <div className={`sidebar-container ${isOpen ? 'open' : ''}`} data-theme={theme}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        
        <div className="sidebar-header">
          <div className="user-avatar-placeholder">👤</div>
          <h3>{currentUser.nume || currentUser.email.split('@')[0]}</h3>
          <span className="badge-nivel">{nivel}</span>
        </div>

        <div className="sidebar-content">
          <h4>Centru Statistici</h4>
          
          <div className="stats-grid">
            <div className="stat-box">
              <span className="stat-label">Lecții Terminate</span>
              <span className="stat-value">{stats.terminate}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Puncte XP</span>
              <span className="stat-value">{stats.terminate * 50}</span>
            </div>
          </div>

          <div className="progress-section">
            <div className="progress-info">
              <span>Progres Curs</span>
              <span>{Math.round(progresProcent)}%</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${progresProcent}%` }}></div>
            </div>
          </div>

          <div>
            <span>Streak Curent</span>
            <div className="streak-display">
              <p className="streak-count" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                {currentCount} zi{currentCount !== 1 ? "le" : ""} 
                {/* ICONIȚA CU CULOARE DINAMICĂ ȘI UMBRĂ */}
                <FaFire 
                  id='foc' 
                  color={streakColor} 
                  size={22}
                  style={{ 
                    filter: `drop-shadow(0px 0px 4px ${streakColor})`, 
                    transition: 'color 0.3s ease, filter 0.3s ease' 
                  }} 
                />
              </p>
            </div>  
          </div>

          <br />

          <div className="info-list">
            <div className="info-item">
              <span>Email:</span>
              <strong>{currentUser.email}</strong>
            </div>
            
            {/* Secțiunea Codeforces Handle */}
            <div className="info-item-input">
              <span>Codeforces Handle:</span>
              <div className="handle-input-group">
                <input 
                  type="text" 
                  placeholder="ex: tourist" 
                  value={handleInput}
                  onChange={(e) => setHandleInput(e.target.value)}
                  onBlur={handleSave} 
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()} 
                  style={{ width: '100%', padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>
              {currentUser?.codeforcesHandle === handleInput && handleInput !== "" && (
                <small className="save-status" style={{ color: 'green', fontSize: '12px' }}>✓ Salvat în profil</small>
              )}
            </div>

            <div className="info-item">
              <span>Status:</span>
              <strong className="status-online">Activ</strong>
            </div>
          </div>
        </div>

        <button className="logout-btn-sidebar" onClick={() => { logout(); onClose(); }}>
          Deconectare Cont
        </button>
      </div>
    </>
  );
}

export default SidebarStats;