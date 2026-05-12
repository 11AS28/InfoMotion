import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import '../components_css/SidebarStats.css';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { FaFire, FaCheckCircle } from "react-icons/fa";

function SidebarStats({ isOpen, onClose }) {
  const { currentUser, getStatistici, logout, actualizeazaStreak } = useAuth();
  const { theme } = useTheme();

  const [handleInput, setHandleInput] = useState(currentUser?.codeforcesHandle || "");
  const [usernameInput, setUsernameInput] = useState(currentUser?.nume || "");
  const [usernameError, setUsernameError] = useState("");

  // --- STATISTICI DINAMICE ---
  const [totalLectiiDB, setTotalLectiiDB] = useState(0);

  // 1. Aflăm numărul total de lecții din Firebase
  useEffect(() => {
    async function getTotalLectii() {
      try {
        const querySnapshot = await getDocs(collection(db, "lectii"));
        setTotalLectiiDB(querySnapshot.size); // .size ne dă numărul de documente
      } catch (e) {
        console.error("Eroare la numărarea lecțiilor:", e);
      }
    }
    if (isOpen) {
      getTotalLectii();
      actualizeazaStreak();
    }
  }, [isOpen, actualizeazaStreak]);

  useEffect(() => {
    if (currentUser) {
      setHandleInput(currentUser.codeforcesHandle || "");
      setUsernameInput(currentUser.nume || "");
    }
  }, [currentUser, isOpen]);

  const handleUpdateProfile = async () => {
    if (!currentUser) return;
    setUsernameError("");
    const hasHandleChanged = handleInput !== currentUser.codeforcesHandle;
    const hasUsernameChanged = usernameInput !== currentUser.nume;
    if (!hasHandleChanged && !hasUsernameChanged) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      let dataToUpdate = {};
      if (hasUsernameChanged) {
        if (usernameInput.trim().length < 3) { setUsernameError("Username prea scurt!"); return; }
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where("nume", "==", usernameInput.trim()));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setUsernameError("Acest username este deja folosit!");
          setUsernameInput(currentUser.nume);
          return;
        }
        dataToUpdate.nume = usernameInput.trim();
      }
      if (hasHandleChanged) dataToUpdate.codeforcesHandle = handleInput;
      await updateDoc(userRef, dataToUpdate);
    } catch (error) { setUsernameError("Eroare la salvare."); }
  };

  if (!currentUser) return null;

  // --- CALCUL PROGRES REAL ---
  const stats = getStatistici();
  const lectiiTerminate = stats.terminate || 0;
  // Calculăm procentul folosind totalul din Firebase, nu cel din AuthContext
  const progresReal = totalLectiiDB > 0 ? (lectiiTerminate / totalLectiiDB) * 100 : 0;

  let nivel = "Începător";
  if (progresReal >= 80) nivel = "Expert";
  else if (progresReal >= 40) nivel = "Intermediar";

  const currentCount = currentUser.streakCount || 0;
  const streakColor = (streak) => {
    if (streak >= 90) return "#00ffea";
    if (streak >= 50) return "#cc00ff";
    if (streak >= 10) return "#ff4500";
    if (streak >= 3) return "#ffa500";
    if (streak >= 1) return "#ffd700";
    return "#cccccc";
  };

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
              <span className="stat-value">{lectiiTerminate} / {totalLectiiDB}</span>
            </div>

            <div className="stat-box">
              <span className="stat-label">Puncte XP</span>
              <span className="stat-value">{currentUser.puncteTotale || 0}</span>
            </div>
          </div>

          <div className="progress-section">
            <div className="progress-info">
              <span>Progres Curs</span>
              <span>{Math.round(progresReal)}%</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${progresReal}%` }}></div>
            </div>
          </div>

          {/* Restul codului pentru streak și input-uri rămâne la fel... */}
          <div className="streak-section">
            <span>Daily LogIn Streak</span>
            <div className="streak-display">
              <p className="streak-count" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                {currentCount} zi{currentCount !== 1 ? "le" : ""}
                <FaFire color={streakColor(currentCount)} size={22} />
              </p>
            </div>
          </div>
          <br />

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
              {/* Afișăm eroarea dacă există, altfel statusul de confirmat */}
              {usernameError ? (
                <small className="error-message" style={{ color: 'red', marginTop: '5px', display: 'block' }}>{usernameError}</small>
              ) : (
                currentUser?.nume === usernameInput && (
                  <small className="save-status"><FaCheckCircle /> Confirmat</small>
                )
              )}
            </div>

            {/* 2. EMAIL (Afișare profi) */}
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
            <br />
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