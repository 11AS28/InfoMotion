import React, { useEffect, useState } from 'react'; 
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import '../components_css/SidebarStats.css';
import {collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore'; 
import { db } from '../firebase'; 
import { FaFire, FaCheckCircle } from "react-icons/fa"; // Am adăugat FaCheckCircle pentru un look mai profi
function SidebarStats({ isOpen, onClose }) {
  const { currentUser, getStatistici, logout, actualizeazaStreak } = useAuth();
  const { theme } = useTheme(); 

  // State-uri pentru input-uri
  const [handleInput, setHandleInput] = useState(currentUser?.codeforcesHandle || "");
  const [usernameInput, setUsernameInput] = useState(currentUser?.nume || "");
  
  // Sincronizăm input-urile când se schimbă userul sau se deschide sidebar-ul
  useEffect(() => {
    if (currentUser) {
      setHandleInput(currentUser.codeforcesHandle || "");
      setUsernameInput(currentUser.nume || "");
    }
  }, [currentUser, isOpen]);

  useEffect(() => {
    if (currentUser && isOpen) {
      actualizeazaStreak();
    }
  }, [currentUser, isOpen]);

  // Funcție universală de salvare
  const [usernameError, setUsernameError] = useState("");

const handleUpdateProfile = async () => {
  if (!currentUser) return;
  setUsernameError("");

  const hasHandleChanged = handleInput !== currentUser.codeforcesHandle;
  const hasUsernameChanged = usernameInput !== currentUser.nume;

  if (!hasHandleChanged && !hasUsernameChanged) return;

  try {
    const userRef = doc(db, 'users', currentUser.uid);
    let dataToUpdate = {};

    // Dacă utilizatorul vrea să schimbe username-ul
    if (hasUsernameChanged) {
      if (usernameInput.trim().length < 3) {
        setUsernameError("Username prea scurt!");
        return;
      }

      // --- VERIFICARE UNICITATE ---
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where("nume", "==", usernameInput.trim()));
      const querySnapshot = await getDocs(q);

      // Dacă găsim pe cineva cu acest nume care NU suntem noi
      if (!querySnapshot.empty) {
        setUsernameError("Acest username este deja folosit!");
        setUsernameInput(currentUser.nume); // Resetăm la numele vechi în UI
        return;
      }
      
      dataToUpdate.nume = usernameInput.trim();
    }

    if (hasHandleChanged) {
      dataToUpdate.codeforcesHandle = handleInput;
    }

    await updateDoc(userRef, dataToUpdate);
    console.log("Profil actualizat!");
  } catch (error) {
    console.error("Eroare:", error);
    setUsernameError("Eroare la salvare.");
  }
};

  if (!currentUser) return null;

  const stats = getStatistici();
  const { progresProcent } = stats;

  let nivel = "Începător";
  if (progresProcent >= 80) nivel = "Expert";
  else if (progresProcent >= 40) nivel = "Intermediar";

  const currentCount = currentUser.streakCount || 0;

  const getStreakColor = (streak) => {
    if (streak >= 90) return "#00ffea"; 
    if (streak >= 50) return "#cc00ff"; 
    if (streak >= 10) return "#ff4500"; 
    if (streak >= 3)  return "#ffa500"; 
    if (streak >= 1)  return "#ffd700"; 
    return "#cccccc";                   
  };

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

          <div className="streak-section">
            <span>Streak Curent</span>
            <div className="streak-display">
              <p className="streak-count" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                {currentCount} zi{currentCount !== 1 ? "le" : ""} 
                <FaFire 
                  color={streakColor} 
                  size={22}
                  style={{ filter: `drop-shadow(0px 0px 4px ${streakColor})` }} 
                />
              </p>
            </div>  
          </div>

          <div className="info-list">
            {/* 1. SCHIMBARE USERNAME */}
            <div className="info-item-input">
              <span>Username:</span>
              <div className="handle-input-group">
                <input 
                  type="text" 
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  onBlur={handleUpdateProfile} 
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdateProfile()} 
                  className="sidebar-input"
                />
              </div>
              {currentUser?.nume === usernameInput && (
                <small className="save-status"><FaCheckCircle /> Confirmat</small>
              )}
            </div>

            {/* 2. EMAIL (Doar afișare) */}
            <div className="info-item">
              <span>Email:</span>
              <strong>{currentUser.email}</strong>
            </div>
            
            {/* 3. CODEFORCES HANDLE */}
            <div className="info-item-input">
              <span>Codeforces Handle:</span>
              <div className="handle-input-group">
                <input 
                  type="text" 
                  placeholder="ex: tourist" 
                  value={handleInput}
                  onChange={(e) => setHandleInput(e.target.value)}
                  onBlur={handleUpdateProfile} 
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdateProfile()} 
                  className="sidebar-input"
                />
              </div>
              {currentUser?.codeforcesHandle === handleInput && handleInput !== "" && (
                <small className="save-status"><FaCheckCircle /> Salvat</small>
              )}
            </div>

            <div className="info-item">
              <span>Status Cont:</span>
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