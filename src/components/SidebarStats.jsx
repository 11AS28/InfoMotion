import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import '../components_css/SidebarStats.css';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, deleteDoc, onSnapshot, orderBy } from 'firebase/firestore';
import { getAuth, deleteUser } from 'firebase/auth'; 
import { db } from '../firebase';
import { FaFire, FaCheckCircle, FaLock } from "react-icons/fa";

function SidebarStats({ isOpen, onClose }) {
  const { currentUser, getStatistici, logout, actualizeazaStreak, verifyHandleOwnership, generateVerificationCode } = useAuth();
  const { theme } = useTheme();

  const [handleInput, setHandleInput] = useState(currentUser?.codeforcesHandle || "");
  const [usernameInput, setUsernameInput] = useState(currentUser?.nume || "");
  const [usernameError, setUsernameError] = useState("");
  const [deleteError, setDeleteError] = useState(""); 

  const [totalLectiiDB, setTotalLectiiDB] = useState(0);
  const [totalProblemeDB, setTotalProblemeDB] = useState(0);

  const [puncteTotale, setPuncteTotale] = useState(0);

  const [notifications, setNotifications] = useState([]);

  const [showNotifications, setShowNotifications] = useState(false);
 
  const isTeacher = currentUser?.role === 'teacher';

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    async function IncarcaDateDB() {
      try {
        const querySnapshot = await getDocs(collection(db, "lectii"));
        setTotalLectiiDB(querySnapshot.size); 

        if (currentUser?.uid) {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userDocRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            
            setTotalProblemeDB(userData.problemeRezolvateCount || 0);
            setPuncteTotale(userData.puncteTotale || 0);
          }
        }
      } catch (e) {
        console.error("Eroare la încărcarea datelor din Firebase:", e);
      }
    }

    if (isOpen) {
      IncarcaDateDB();
      // ✅ Actualizăm streak-ul doar dacă utilizatorul este elev
      if (!isTeacher) {
        actualizeazaStreak();
      }
    }
  }, [isOpen, currentUser, actualizeazaStreak, isTeacher]);

  useEffect(() => {
    if (currentUser) {
      setHandleInput(currentUser.codeforcesHandle || "");
      setUsernameInput(currentUser.nume || "");
    }
  }, [currentUser, isOpen]);


  useEffect(() => {
  if (!currentUser?.uid) return;

  const q = query(
    collection(db, "users", currentUser.uid, "notifications"),
    orderBy("createdAt", "desc")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const notifList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    setNotifications(notifList);
  });

  return () => unsubscribe();
}, [currentUser]);

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

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("⚠️ Ești sigur că vrei să îți ștergi contul definitiv? \n\nToate datele vor fi pierdute. Acțiunea este IREVERSIBILĂ!");
    if (!confirmDelete) return;

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        await deleteDoc(doc(db, 'users', user.uid));
        await deleteUser(user);
        onClose();
      }
    } catch (error) {
      if (error.code === 'auth/requires-recent-login') {
        setDeleteError("Din motive de securitate, trebuie să te deconectezi și să te loghezi din nou înainte de a șterge contul.");
      } else {
        setDeleteError("Eroare la ștergerea contului: " + error.message);
      }
    }
  };


  const markNotificationAsRead = async (notifId) => {
  if (!currentUser?.uid) return;

  try {
    await updateDoc(doc(db, "users", currentUser.uid, "notifications", notifId), {
      read: true
    });
  } catch (e) {
    console.error("Eroare la marcarea notificării:", e);
  }
};

const markAllNotificationsAsRead = async () => {
  if (!currentUser?.uid) return;

  try {
    const unreadNotifications = notifications.filter((n) => !n.read);

    for (const notif of unreadNotifications) {
      await updateDoc(doc(db, "users", currentUser.uid, "notifications", notif.id), {
        read: true
      });
    }
  } catch (e) {
    console.error("Eroare la marcarea tuturor notificărilor:", e);
  }
};

  if (!currentUser) return null;

  const stats = getStatistici();
  const lectiiTerminate = stats.terminate || 0;
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

  const listaBadgeuri = [
    { id: 'b1', icon: '🌱', nume: 'Primul Craft', cerinta: 1, desc: 'Rezolvă prima ta problemă în Arenă' },
    { id: 'b2', icon: '🔥', nume: 'Scânteia Arenei', cerinta: 5, desc: 'Rezolvă 5 probleme în Arenă' },
    { id: 'b3', icon: '⚒️', nume: 'Fierarul Codului', cerinta: 15, desc: 'Rezolvă 15 probleme în Arenă' },
    { id: 'b4', icon: '⚔️', nume: 'Gladiatorul Arenei', cerinta: 30, desc: 'Rezolvă 30 de probleme în Arenă' }, 
    { id: 'b5', icon: '🧙‍♂️', nume: 'Mage de Algoritmi', cerinta: 50, desc: 'Rezolvă 50 de probleme în Arenă' },
    { id: 'b6', icon: '👑', nume: 'Arhitect Suprem', cerinta: 100, desc: 'Rezolvă 100 de probleme în Arenă' }
  ];
  

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      <div className={`sidebar-container ${isOpen ? 'open' : ''}`} data-theme={theme}>
        <button className="close-btn" onClick={onClose}>&times;</button>

        <div className="sidebar-header">
          <div className="user-avatar-placeholder">👤</div>
          <h3>{currentUser.nume || currentUser.email.split('@')[0]}</h3>
          
          {/*  ROL STRUCTURAT FRUMOS SUB NUME */}
          <div style={{ marginTop: '0 px', display: 'flex', justifyContent: 'center', gap: '5px' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 'bold',
              padding: '3px 10px',
              borderRadius: '20px',
              backgroundColor: isTeacher ? '#e3f2fd' : '#e8f5e9',
              color: isTeacher ? '#0d47a1' : '#1b5e20',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {isTeacher ? '👨‍🏫 Profesor' : '👨‍🎓 Elev'}
            </span>
            
            {/* Afișăm nivelul bazat pe curs doar dacă nu este profesor */}
            {!isTeacher && <span className="badge-nivel">{nivel}</span>}
          </div>
        </div>

        <div className="sidebar-content">
          <h4>Centru Statistici</h4>
        
            <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setShowNotifications((v) => !v)}
                style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  padding: '6px 12px',
                  borderRadius: '999px',
                  background: unreadCount > 0 ? '#fef2f2' : '#ecfdf5',
                  color: unreadCount > 0 ? '#dc2626' : '#166534',
                  border: unreadCount > 0 ? '1px solid #fecaca' : '1px solid #bbf7d0',
                  cursor: 'pointer'
                }}
              >
                {unreadCount > 0 ? ` ${unreadCount} notificări noi` : ' Nicio notificare nouă'}
              </button>
            </div>

            {showNotifications && (
            <div
              style={{
                marginBottom: '18px',
                border: '1px solid #e5e7eb',
                borderRadius: '14px',
                padding: '10px',
                background: theme === 'dark' ? '#111827' : '#ffffff',
                boxShadow: '0 6px 20px rgba(0,0,0,0.06)'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px'
              }}>
                <strong style={{ fontSize: '14px' }}>Notificările tale</strong>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllNotificationsAsRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#01696f',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Marchează toate ca citite
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div style={{
                  fontSize: '13px',
                  color: '#94a3b8',
                  padding: '8px 4px'
                }}>
                  Nu ai notificări momentan.
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  maxHeight: '220px',
                  overflowY: 'auto'
                }}>
                  {notifications.slice(0, 8).map((notif) => (
                    <button
                      key={notif.id}
                      type="button"
                      onClick={() => markNotificationAsRead(notif.id)}
                      style={{
                        textAlign: 'left',
                        width: '100%',
                        border: notif.read ? '1px solid #e5e7eb' : '1px solid #fecaca',
                        background: theme === 'dark' ? (notif.read ? 'transparent' : '#917878') : (notif.read ? 'transparent' : '#fef2f2'),
                        borderRadius: '12px',
                        padding: '10px 12px',
                        cursor: 'pointer',
                        
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '10px'
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: '13px',
                            fontWeight: notif.read ? '600' : '700',
                            color: theme === 'dark' ? '#f3f4f6' : '#0f172a',
                            marginBottom: '4px'
                          }}>
                            {notif.type === 'lectie_aprobata'
                              ? ' Lecție aprobată'
                              : notif.type === 'lectie_respinsa'
                              ? ' Lecție respinsă'
                              : ' Notificare'}
                          </div>

                          <div style={{
                            fontSize: '12px',
                            lineHeight: '1.5',
                            color: theme === 'dark' ? '#f3f4f6' : '#475569'
                          }}>
                            {notif.text}
                          </div>
                        </div>

                        {!notif.read && (
                          <span style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: '#dc2626',
                            flexShrink: 0,
                            marginTop: '4px'
                          }} />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/*  AFIȘARE CONDIȚIONATĂ: Profesorii au alt set de date în grid sau le ascundem pe cele de elevi */}
          {!isTeacher ? (
            <>
              <div className="stats-grid">
                <div className="stat-box">
                  <span className="stat-label">Lecții Terminate</span>
                  <span className="stat-value">{lectiiTerminate} / {totalLectiiDB}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">XP Total</span>
                  <span className="stat-value">⭐ {puncteTotale}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Probleme Arenă</span>
                  <span className="stat-value">⚔️ {totalProblemeDB}</span>
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

              <div className="streak-section">
                <span>Daily LogIn Streak</span>
                <div className="streak-display">
                  <p className="streak-count" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                    {currentCount} zi{currentCount !== 1 ? "le" : ""}
                    <FaFire color={streakColor(currentCount)} size={22} />
                  </p>
                </div>
              </div>
            </>
          ) : (
           
            <div style={{
              padding: '15px', 
              borderRadius: '8px', 
              background: 'rgba(0,123,255,0.05)', 
              border: '1px dashed var(--accent, #007bff)',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#0d47a1' }}>Panou Profesor Activ</p>
            </div>
          )}
          
          <br />

          <div className="info-list">
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
              {usernameError ? (
                <small className="error-message" style={{ color: 'red', marginTop: '5px', display: 'block' }}>{usernameError}</small>
              ) : (
                currentUser?.nume === usernameInput && (
                  <small className="save-status"><FaCheckCircle /> Confirmat</small>
                )
              )}
            </div>

            <div className="info-item">
              <span>Email:</span>
              <strong>{currentUser.email}</strong>
            </div>

            {/*  ASCUNDEM SECȚIUNEA DE CODEFORCES ȘI TROFEE DACĂ ESTE PROFESOR */}
            {!isTeacher && (
              <>
                <div className="info-item-input">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Codeforces Handle:</span>
                    {currentUser?.cfValidat ? (
                      <small className="save-status" style={{ color: '#639922' }}>
                        <FaCheckCircle /> VERIFICAT
                      </small>
                    ) : (
                      handleInput !== "" && <small style={{ color: '#ff4500', fontSize: '0.7rem' }}>NEVERIFICAT</small>
                    )}
                  </div>
                  
                  <div className="handle-input-group">
                    <input
                      type="text"
                      placeholder="ex: tourist"
                      value={handleInput}
                      onChange={(e) => setHandleInput(e.target.value)}
                      className="sidebar-input"
                      disabled={currentUser?.cfValidat}
                    />
                  </div>

                  {!currentUser?.cfValidat && handleInput !== "" && (
                    <div className="verification-container">
                      <span className="verification-text">Pune la <b>Organization</b> pe CF:</span>
                      <div className="verification-code-display">
                        {generateVerificationCode()}
                      </div>
                      <button 
                        className="verify-btn-outline"
                        onClick={async () => {
                          const res = await verifyHandleOwnership(handleInput);
                          if(res.success) alert("✅ Cont verificat!");
                          else alert("❌ " + res.error);
                        }}
                      >
                        Confirmă
                      </button>
                    </div>
                  )}
                </div>

                <br />

                <div className="sidebar-badges-section">
                  <h5>Trofeele Mele (Arenă)</h5>
                  <div className="badges-flex-list">
                    {listaBadgeuri.map((badge) => {
                      const esteDeblocat = totalProblemeDB >= badge.cerinta;
                      const maiAreNevoie = badge.cerinta - totalProblemeDB;
                      return (
                        <div 
                          key={badge.id} 
                          className={`sidebar-badge-item ${esteDeblocat ? 'unlocked' : 'locked'}`}
                          title={esteDeblocat ? `Deblocat! ${badge.desc}` : `Blocat. Mai ai nevoie de ${maiAreNevoie} probleme.`}
                        >
                          <div className="badge-icon-wrapper">
                            <span className="badge-emoji">{badge.icon}</span>
                            {!esteDeblocat && <FaLock className="badge-lock-icon" />}
                          </div>
                          <div className="badge-text-details">
                            <span className="badge-title">{badge.nume}</span>
                            <span className="badge-sub">
                              {esteDeblocat ? 'Validat ✅' : `${totalProblemeDB}/${badge.cerinta} pbm`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            <div className="info-item" style={{ marginTop: '15px' }}>
              <span>Status Cont:</span>
              <strong className="status-online">Activ</strong>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button className="logout-btn-sidebar" onClick={() => { logout(); onClose(); }}>
            Deconectare Cont
          </button>

          <button 
            onClick={handleDeleteAccount}
            style={{ 
              width: '100%', padding: '12px', backgroundColor: 'transparent', 
              color: '#ff4d4d', border: '1px solid #ff4d4d', borderRadius: '8px', 
              cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s ease' 
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#ff4d4d'; e.currentTarget.style.color = '#fff'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#ff4d4d'; }}
          >
            Șterge Contul Definitiv
          </button>
          
          {deleteError && (
            <small style={{ color: '#ff4d4d', textAlign: 'center', display: 'block', padding: '5px' }}>
              {deleteError}
            </small>
          )}
        </div>

      </div>
    </>
  );
}

export default SidebarStats;