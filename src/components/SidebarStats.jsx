import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import '../components_css/SidebarStats.css';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { getAuth, deleteUser } from 'firebase/auth';
import { db } from '../firebase';
import { FaFire, FaCheckCircle, FaLock } from "react-icons/fa";
import { Coffee, Sparkles, PencilRuler, Flame, Crown, WandSparkles, Swords, HandFist, Leaf, GraduationCap, Star, UserRound, Coins } from 'lucide-react';
import { createPortal } from 'react-dom';
import LanguageSelect from './LanguageSwitcher';

function SidebarStats({ isOpen, onClose }) {
  const { currentUser, getStatistici, logout, actualizeazaStreak, verifyHandleOwnership, generateVerificationCode } = useAuth();
  const { theme } = useTheme();

  const [handleInput, setHandleInput] = useState(currentUser?.codeforcesHandle || "");
  const [usernameInput, setUsernameInput] = useState(currentUser?.nume || "");
  const [usernameError, setUsernameError] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [modalRaspuns, setModalRaspuns] = useState(null);
  const [diplomaLoading, setDiplomaLoading] = useState(false);
  const [diplomaMessage, setDiplomaMessage] = useState(null);
  const isTeacher = currentUser?.role === 'teacher';

  const unreadCount = notifications.filter((n) => !n.read).length;

  const totalProblemeDB = currentUser?.problemeRezolvateCount || 0;
  const puncteTotale = currentUser?.puncteTotale || 0;
  const baniUtilizator = currentUser?.puncte || 0;

  const dictionarTitluri = {
    title_coders: { name: 'Codul e Legea', price: 300, color: '#f1c40f', bg: 'linear-gradient(135deg, #f39c12, #f1c40f)', desc: 'Pentru cei care dictează regulile în compilator.' },
    title_toxic: { name: 'Zero Erori', price: 500, color: '#2ecc71', bg: 'linear-gradient(135deg, #27ae60, #2ecc71)', desc: 'Titlu legendar pentru cine scrie cod curat din prima.' },
    title_god: { name: 'C++ Zeu', price: 800, color: '#e74c3c', bg: 'linear-gradient(135deg, #c0392b, #e74c3c)', desc: 'Stăpânul suprem al algoritmilor și pointerilor.' },
    title_noob: { name: 'Syntax Error', price: 150, color: '#95a5a6', bg: 'linear-gradient(135deg, #7f8c8d, #95a5a6)', desc: 'Ironic și amuzant, perfect pentru momentele de bug-uri.' },
    title_grind: { name: 'No Sleep', price: 600, color: '#9b59b6', bg: 'linear-gradient(135deg, #8e44ad, #9b59b6)', desc: 'Dedicat programatorilor care codează până la răsărit.' },
    title_jeanG: { name: 'Jean Gaoaza', price: 784500, color: '#34495e', bg: 'linear-gradient(135deg, #2c3e50, #34495e)', desc: 'Alo, da? Alo, Gaoaza Romaniei la telefon!' }
  };

  useEffect(() => {
    if (isOpen && !isTeacher) {
      actualizeazaStreak();
    }
  }, [isOpen, isTeacher, actualizeazaStreak]);

  useEffect(() => {
    if (isOpen && !isTeacher) {
      actualizeazaStreak();
    }
    if (currentUser?.uid) {
      const localKey = `notifications_${currentUser.uid}`;
      const localNotif = JSON.parse(localStorage.getItem(localKey) || "[]");
      setNotifications(localNotif);
    }
  }, [isOpen, isTeacher, actualizeazaStreak, currentUser]);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const q = query(
      collection(db, "users", currentUser.uid, "notifications"),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbNotif = snapshot.docs
        .filter((docSnap) => docSnap.data().read !== true)
        .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));

      const localKey = `notifications_${currentUser.uid}`;
      const localNotif = JSON.parse(localStorage.getItem(localKey) || "[]");

      const mapIdToNotif = new Map();
      localNotif.forEach((n) => mapIdToNotif.set(n.id, n));
      dbNotif.forEach((n) => mapIdToNotif.set(n.id, { ...n, read: false }));

      let combined = Array.from(mapIdToNotif.values()).sort((a, b) => {
        const timeA = a.createdAt?.seconds || new Date(a.createdAt).getTime() || 0;
        const timeB = b.createdAt?.seconds || new Date(b.createdAt).getTime() || 0;
        return timeB - timeA;
      });

      if (combined.length > 5) combined = combined.slice(0, 5);

      localStorage.setItem(localKey, JSON.stringify(combined));
      setNotifications(combined);
    });

    return () => unsubscribe();
  }, [currentUser]);


  useEffect(() => {
    if (!currentUser?.uid) return;

    const cleanupOldReadNotifications = async () => {
      try {
        const notifRef = collection(db, "users", currentUser.uid, "notifications");
        const q = query(notifRef, where("read", "==", true), limit(5));
        const snap = await getDocs(q);
        for (const d of snap.docs) {
          await deleteDoc(doc(db, "users", currentUser.uid, "notifications", d.id));
        }
      } catch (e) {
        console.error("Eroare la curățare notificări vechi:", e);
      }
    };

    cleanupOldReadNotifications();
  }, [currentUser?.uid]);

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

  const handleRequestDiploma = async () => {
    if (!currentUser?.uid) return;
    setDiplomaLoading(true);
    setDiplomaMessage(null);

    try {
      const auth = getAuth();
      const userToken = await auth.currentUser.getIdToken();

      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request_diploma',
          data: { userToken, userId: currentUser.uid }
        })
      });
      const result = await response.json();

      if (result.success) {
        setDiplomaMessage({ type: 'success', text: 'Cerere trimisă! Un admin o va analiza în curând. 🎓' });
      } else {
        setDiplomaMessage({ type: 'error', text: result.error || 'Eroare la trimiterea cererii.' });
      }
    } catch (e) {
      setDiplomaMessage({ type: 'error', text: 'Eroare de rețea. Încearcă din nou.' });
    } finally {
      setDiplomaLoading(false);
    }
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
      const localKey = `notifications_${currentUser.uid}`;

      try {
        await deleteDoc(doc(db, "users", currentUser.uid, "notifications", notifId));
      } catch (dbErr) {
        console.log("Notificarea era deja ștearsă din DB sau e doar locală.");
      }

      const updated = notifications.map(n =>
        n.id === notifId ? { ...n, read: true } : n
      );

      localStorage.setItem(localKey, JSON.stringify(updated));
      setNotifications(updated);
    } catch (e) { console.error("Eroare la procesarea notificării:", e); }
  };

  const markAllNotificationsAsRead = async () => {
    if (!currentUser?.uid) return;
    try {
      const localKey = `notifications_${currentUser.uid}`;
      const unreadNotifications = notifications.filter((n) => !n.read);

      for (const notif of unreadNotifications) {
        await deleteDoc(doc(db, "users", currentUser.uid, "notifications", notif.id));
      }

      const updated = notifications.map(n => ({ ...n, read: true }));

      localStorage.setItem(localKey, JSON.stringify(updated));
      setNotifications(updated);
    } catch (e) { console.error("Eroare la curățarea notificărilor:", e); }
  };

  if (!currentUser) return null;

  const stats = getStatistici();
  const lectiiTerminate = stats.terminate || 0;
  const progresReal = stats.total > 0 ? (lectiiTerminate / stats.total) * 100 : 0;

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
    { id: 'b1', icon: <Leaf size={16} color="#7dc931" strokeWidth={2.5} />, nume: 'Primul Craft', cerinta: 1, desc: 'Rezolvă prima ta problemă în Arenă' },
    { id: 'b2', icon: <Flame size={16} color="#f2ae1c" strokeWidth={2.5} />, nume: 'Scânteia Arenei', cerinta: 5, desc: 'Rezolvă 5 probleme în Arenă' },
    { id: 'b3', icon: <HandFist size={16} color="#af0e0e" strokeWidth={2.5} />, nume: 'Fierarul Codului', cerinta: 15, desc: 'Rezolvă 15 probleme în Arenă' },
    { id: 'b4', icon: <Swords size={16} color="#adadad" strokeWidth={2.5} />, nume: 'Gladiatorul Arenei', cerinta: 30, desc: 'Rezolvă 30 de probleme în Arenă' },
    { id: 'b5', icon: <WandSparkles size={16} color="#acc91d" strokeWidth={2.5} />, nume: 'Mage de Algoritmi', cerinta: 50, desc: 'Rezolvă 50 de probleme în Arenă' },
    { id: 'b6', icon: <Crown size={16} color="#fff700" strokeWidth={2.5} />, nume: 'Arhitect Suprem', cerinta: 100, desc: 'Rezolvă 100 de probleme în Arenă' }
  ];

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      <div className={`sidebar-container ${isOpen ? 'open' : ''}`} data-theme={theme}>
        <button className="close-btn" onClick={onClose}>&times;</button>

        <div className="sidebar-header">
          <div className="user-avatar-placeholder"><UserRound size={30} color="#8f4ebb" strokeWidth={2.5} /></div>
          <h3>
            {currentUser.nume || currentUser.email.split('@')[0]}
          </h3>

          {currentUser?.titluEchipat && dictionarTitluri[currentUser.titluEchipat] && (
            <div className="sidebar-brawl-title-badge" style={{ background: dictionarTitluri[currentUser.titluEchipat].bg }}>
              {dictionarTitluri[currentUser.titluEchipat].name}
            </div>
          )}

          <div style={{ marginTop: '0px', display: 'flex', justifyContent: 'center', gap: '5px' }}>
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
              {isTeacher ? (
                <>
                  <Coffee size={16} color="#23a9b3" strokeWidth={2.5} />
                  {" "}Profesor
                </>
              ) : (
                <>
                  <GraduationCap size={16} color="#23a9b3" strokeWidth={2.5} />
                  {" "}Elev
                </>
              )}
            </span>
            {!isTeacher && <span className="badge-nivel">{nivel}</span>}
            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center' }}>
              <LanguageSelect />
            </div>
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
                <div style={{ fontSize: '13px', color: '#94a3b8', padding: '8px 4px' }}>
                  Nu ai notificări momentan.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                  {notifications.map((notif) => (
                    <button
                      key={notif.id}
                      type="button"
                      onClick={() => {
                        markNotificationAsRead(notif.id);
                        if (notif.type === 'contact_raspuns' || notif.type === 'diploma_acordata') {
                          setModalRaspuns(notif);
                        }
                      }}
                      style={{
                        textAlign: 'left',
                        width: '100%',
                        border: notif.read ? '1px solid #e5e7eb' : '1px solid #fecaca',
                        background: theme === 'dark' ? (notif.read ? 'transparent' : '#374151') : (notif.read ? 'transparent' : '#fef2f2'),
                        borderRadius: '12px',
                        padding: '10px 12px',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: '13px',
                            fontWeight: notif.read ? '600' : '700',
                            color: theme === 'dark' ? '#f3f4f6' : '#0f172a',
                            marginBottom: '4px'
                          }}>
                            {notif.type === 'lectie_aprobata' ? ' Lecție aprobată' : notif.type === 'lectie_respinsa' ? ' Lecție respinsă' : ' Notificare'}
                            {notif.type === 'streak_pierdut' && '  Streak Întrerupt'}
                            {notif.type === 'streak_inghetat' && '  Streak Înghețat'}
                            {notif.type === 'contact_raspuns' && '💬 Răspuns la mesajul tău'}
                            {notif.type === 'diploma_acordata' && '🎓 Diplomă acordată'}
                          </div>
                          <div style={{ fontSize: '12px', lineHeight: '1.5', color: theme === 'dark' ? '#d1d5db' : '#475569' }}>
                            {notif.text}
                          </div>
                        </div>
                        {!notif.read && <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#dc2626', flexShrink: 0, marginTop: '4px' }} />}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {!isTeacher ? (
            <>
              <div className="stats-grid">
                <div className="stat-box">
                  <span className="stat-label">Lecții Terminate</span>
                  <span className="stat-value">{lectiiTerminate} / {stats.total}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">XP Total</span>
                  <span className="stat-value"><Star size={16} color="#f4e00b" strokeWidth={2.5} /> {puncteTotale}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Probleme Arenă</span>
                  <span className="stat-value"><Swords size={16} color="#adadad" strokeWidth={2.5} /> {totalProblemeDB}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Bani</span>
                  <span className="stat-value"><Coins size={16} color="#ffb703" strokeWidth={2.5} /> {baniUtilizator}</span>
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

              {/* --- Secțiune Diplomă --- */}
              <div style={{
                marginTop: '18px',
                padding: '14px',
                borderRadius: '12px',
                border: '1px dashed #23a9b3',
                background: theme === 'dark' ? 'rgba(35,169,179,0.08)' : '#f0fdfb',
                textAlign: 'center'
              }}>
                <p style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: '700', color: theme === 'dark' ? '#e2e8f0' : '#0f172a' }}>
                  🎓 Diplomă de Absolvire
                </p>
                <button
                  onClick={handleRequestDiploma}
                  disabled={diplomaLoading}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #01696f, #23a9b3)',
                    color: '#fff',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: diplomaLoading ? 'not-allowed' : 'pointer',
                    opacity: diplomaLoading ? 0.6 : 1
                  }}
                >
                  {diplomaLoading ? 'Se trimite...' : 'Cere Diplomă'}
                </button>

                {diplomaMessage && (
                  <p style={{
                    marginTop: '10px',
                    marginBottom: 0,
                    fontSize: '12px',
                    fontWeight: '600',
                    color: diplomaMessage.type === 'success' ? '#166534' : '#dc2626'
                  }}>
                    {diplomaMessage.text}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div style={{ padding: '15px', borderRadius: '8px', background: 'rgba(0,123,255,0.05)', border: '1px dashed var(--accent, #007bff)', marginBottom: '20px', fontSize: '14px' }}>
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
                          if (res.success) alert("✅ Cont verificat!");
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
                              {esteDeblocat ? 'Validat ' : `${totalProblemeDB}/${badge.cerinta} pbm`}
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
          {deleteError && <small style={{ color: '#ff4d4d', textAlign: 'center', display: 'block', padding: '5px' }}>{deleteError}</small>}
        </div>

      </div>

      {modalRaspuns && createPortal(
        <div
          onClick={() => setModalRaspuns(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: '24px',
              padding: '40px 36px', maxWidth: '480px', width: '100%',
              boxShadow: '0 30px 80px rgba(0,0,0,0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #01696f, #23a9b3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', flexShrink: 0,
              }}>
                {modalRaspuns.type === 'diploma_acordata' ? '🎓' : '💬'}
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {modalRaspuns.type === 'diploma_acordata' ? 'Echipa InfoMotion' : 'Răspuns de la echipa InfoMotion'}
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                  {modalRaspuns.type === 'diploma_acordata' ? 'Felicitări! Ai primit o diplomă' : 'Mesajul tău a primit un răspuns'}
                </div>
              </div>
            </div>

            {modalRaspuns.type === 'diploma_acordata' ? (
              (() => {
                const match = modalRaspuns.text?.match(/(\/diploma\/[^\s]+)/);
                const path = match ? match[1] : null;
                const fullUrl = path ? `${window.location.origin}${path}` : null;

                return (
                  <>
                    <div style={{
                      background: '#f8fafc', borderRadius: '14px',
                      padding: '20px', marginBottom: '20px',
                      border: '1.5px solid #e2e8f0',
                      fontSize: '15px', fontWeight: '500',
                      color: '#1e293b', lineHeight: '1.7',
                    }}>
                      Ai primit diploma ta! O poți vedea sau distribui folosind linkul de mai jos.
                    </div>

                    {fullUrl && (
                      <div style={{
                        background: '#f1f5f9',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '12px 14px',
                        marginBottom: '20px',
                        wordBreak: 'break-all',
                        fontSize: '13px',
                        fontFamily: 'monospace',
                        color: '#01696f'
                      }}>
                        {fullUrl}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px' }}>
                      {fullUrl && (
                        <button
                          onClick={() => window.open(fullUrl, '_blank')}
                          style={{
                            flex: 1, padding: '14px', borderRadius: '30px',
                            border: 'none', background: 'linear-gradient(135deg, #01696f, #23a9b3)',
                            color: '#fff', fontWeight: '700', fontSize: '14px',
                            cursor: 'pointer'
                          }}
                        >
                          Deschide Diploma
                        </button>
                      )}
                      {fullUrl && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(fullUrl);
                            alert('Link copiat!');
                          }}
                          style={{
                            padding: '14px 18px', borderRadius: '30px',
                            border: '1.5px solid #e2e8f0', background: '#fff',
                            color: '#374151', fontWeight: '700', fontSize: '14px',
                            cursor: 'pointer'
                          }}
                        >
                          Copiază
                        </button>
                      )}
                    </div>
                  </>
                );
              })()
            ) : (
              <>
                <div style={{
                  background: '#f8fafc', borderRadius: '14px',
                  padding: '20px', marginBottom: '24px',
                  border: '1.5px solid #e2e8f0',
                  fontSize: '16px', fontWeight: '500',
                  color: '#1e293b', lineHeight: '1.7',
                }}>
                  {modalRaspuns.text?.replace(/^.*ți-a răspuns la mesaj: "/, '').replace(/"$/, '') || modalRaspuns.text}
                </div>

                <button
                  onClick={() => setModalRaspuns(null)}
                  style={{
                    width: '100%', padding: '14px', borderRadius: '30px',
                    border: 'none', background: 'linear-gradient(135deg, #01696f, #23a9b3)',
                    color: '#fff', fontWeight: '700', fontSize: '15px',
                    cursor: 'pointer', letterSpacing: '0.3px',
                  }}
                >
                  Am înțeles
                </button>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default SidebarStats;