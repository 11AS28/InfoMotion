import { useState, useEffect } from 'react';
import '../pages_css/admin.css';
import { doc, setDoc, collection, getDocs, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Toaster, toast } from 'sonner';

const ADMINS = [
  { username: import.meta.env.VITE_ADMIN_1_USER, password: import.meta.env.VITE_ADMIN_1_PASS },
  { username: import.meta.env.VITE_ADMIN_2_USER, password: import.meta.env.VITE_ADMIN_2_PASS },
  { username: import.meta.env.VITE_ADMIN_3_USER, password: import.meta.env.VITE_ADMIN_3_PASS },
  { username: import.meta.env.VITE_ADMIN_4_USER, password: import.meta.env.VITE_ADMIN_4_PASS }
];

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  function handleLogin(e) {
    e.preventDefault();
    const match = ADMINS.find((a) => a.username === username && a.password === password);
    if (match) {
      onLogin(username);
      toast.success(`Bine ai revenit, ${username}!`);
    } else { 
      setError('Username sau parolă incorecte.'); 
      setPassword(''); 
      toast.error('Autentificare eșuată!');
    }
  }

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <div className="admin-login-logo">InfoMotion<span>.</span></div>
        <p className="admin-login-subtitle">Panou de administrare</p>
        <form onSubmit={handleLogin} className="admin-login-form">
          <div className="admin-field">
            <label>Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin1" required />
          </div>
          <div className="admin-field">
            <label>Parolă</label>
            <div className="admin-pass-wrap">
              <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••" required />
              <button type="button" className="admin-show-pass" onClick={() => setShowPass((v) => !v)}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          {error && <p className="admin-error">{error}</p>}
          <button type="submit" className="admin-btn-login">Intră în cont</button>
        </form>
      </div>
    </div>
  );
}

function Dashboard({ username, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [firebaseLessons, setFirebaseLessons] = useState([]);
  const [firebaseUsers, setFirebaseUsers] = useState([]); 
  const [propuneri, setPropuneri] = useState([]); // <-- Stare pentru propuneri
  const [isEditing, setIsEditing] = useState(false);
  const [propunereInCurs, setPropunereInCurs] = useState(null); // <-- Tine minte ce propunere lucram ca sa o stergem la final

  const [searchTerm, setSearchTerm] = useState('');

  // Stările pentru formularul lecției
  const [fId, setFId] = useState('');
  const [fClasa, setFClasa] = useState('clasa-9'); 
  const [fOrdine, setFOrdine] = useState(1);
  const [fTitlu, setFTitlu] = useState('');
  const [fDescriere, setFDescriere] = useState('');
  const [fTeorie, setFTeorie] = useState('');
  const [fCod, setFCod] = useState('');
  const [fAnim, setFAnim] = useState('null');
  const [fAnimCustom, setFAnimCustom] = useState('');
  const [pbRows, setPbRows] = useState([{ id: '', titlu: '', url: '' }]);
  const [quiz, setQuiz] = useState(
    Array(5).fill(0).map(() => ({ intrebare: '', variante: ['', '', '', ''], corect: 0 }))
  );
  const [cfProblems, setCfProblems] = useState(['', '']);

  const refreshData = async () => {
    try {
      // 1. Lectii
      const querySnapshotLectii = await getDocs(collection(db, "lectii"));
      setFirebaseLessons(querySnapshotLectii.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // 2. Useri
      const querySnapshotUsers = await getDocs(collection(db, "users"));
      setFirebaseUsers(querySnapshotUsers.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // 3. Propuneri de lectii in asteptare
      const querySnapshotPropuneri = await getDocs(collection(db, "propuneri_lectii"));
      const propuneriAll = querySnapshotPropuneri.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPropuneri(propuneriAll.filter(p => p.status === "in_asteptare"));

    } catch (e) {
      console.error("Eroare la preluare date:", e);
      toast.error("Nu s-au putut încărca datele din Firebase.");
    }
  };

  useEffect(() => { refreshData(); }, [activeTab]);

  const updatePb = (idx, field, val) => setPbRows(pbRows.map((r, i) => i === idx ? { ...r, [field]: val } : r));
  const addPbRow = () => setPbRows([...pbRows, { id: '', titlu: '', url: '' }]);
  const removePbRow = (idx) => pbRows.length > 1 && setPbRows(pbRows.filter((_, i) => i !== idx));

  const updateQuiz = (qIdx, field, val, vIdx = null) => {
    const newQuiz = [...quiz];
    if (field === 'varianta') newQuiz[qIdx].variante[vIdx] = val;
    else newQuiz[qIdx][field] = val;
    setQuiz(newQuiz);
  };

  const resetForm = () => {
    setFId(''); setFClasa('clasa-9'); setFOrdine(1); setFTitlu(''); setFDescriere('');
    setFTeorie(''); setFCod(''); setFAnim('null'); setFAnimCustom('');
    setPbRows([{ id: '', titlu: '', url: '' }]);
    setQuiz(Array(5).fill(0).map(() => ({ intrebare: '', variante: ['', '', '', ''], corect: 0 })));
    setCfProblems(['', '']);
    setIsEditing(false);
    setSearchTerm('');
    setPropunereInCurs(null); // resetam
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Ești sigur că vrei să ștergi lecția "${id}"?`)) return;
    try {
      await deleteDoc(doc(db, "lectii", id));
      toast.success("Lecție ștearsă cu succes!"); 
      refreshData();
    } catch (e) { 
      toast.error("Eroare la ștergere: " + e.message); 
    }
  };


  const sendUserNotification = async (userId, type, text) => {
  if (!userId) return;

  try {
    await addDoc(collection(db, "users", userId, "notifications"), {
      type,
      text,
      read: false,
      createdAt: serverTimestamp()
    });
  } catch (e) {
    console.error("Eroare la trimiterea notificării:", e);
  }
};

  // --- Functii pentru tab-ul de Aprobari ---
const handleRejectPropunere = async (propunere) => {
  if (!window.confirm("Ești sigur că vrei să respingi și să ștergi această propunere?")) return;

  try {
    if (propunere.autorId) {
      await sendUserNotification(
        propunere.autorId,
        "lectie_respinsa",
        `Propunerea ta pentru lecția „${propunere.titlu}” a fost respinsă.`
      );
    }

    await deleteDoc(doc(db, "propuneri_lectii", propunere.id));
    toast.success("Propunere respinsă.");
    refreshData();
  } catch (e) {
    toast.error("Eroare: " + e.message);
  }
};

  const handleApprovePropunere = (propunere) => {
    // Navigam catre tab-ul "Adauga" si completam datele
    resetForm(); // Ne asiguram ca e un form curat, NU in mod editare de lectie veche
    setFTitlu(propunere.titlu || '');
    
    // Potrivim clasa daca e posibila. Mapare: "a-IX-a" -> "clasa-9"
    if(propunere.clasa === "a-IX-a") setFClasa("clasa-9");
    else if(propunere.clasa === "a-X-a") setFClasa("clasa-10");
    else if(propunere.clasa === "a-XI-a") setFClasa("clasa-11");
    else setFClasa(propunere.clasa || 'clasa-9');

    setFTeorie(propunere.teorie || '');
    setFCod(propunere.codCPlusPlus || '');
    setFDescriere(
      propunere.descriere?.trim()
        ? `${propunere.descriere.trim()} — by prof. ${propunere.numeAutorDorit}`
        : `by prof. ${propunere.numeAutorDorit }`
    );
    
    setPropunereInCurs(propunere.id); // Tinem minte ID-ul propunerii ca sa il stergem dupa ce o publicam!
    setActiveTab('adauga');
    toast.info("Verifică și completează detaliile, apoi apasă Publică!");
  };
  // ----------------------------------------

  const startEdit = (lectie) => {
    setFId(lectie.id); 
    if (lectie.categorie === 'olimpiada' || lectie.clasa === 'olimpici') setFClasa('olimpici');
    else if (lectie.categorie === 'concepte' || lectie.clasa === 'concepte') setFClasa('concepte');
    else setFClasa(lectie.clasa || 'clasa-9'); 

    setFOrdine(lectie.ordine || 1); 
    setFTitlu(lectie.titlu || '');
    setFDescriere(lectie.descriere || ''); 
    setFTeorie(lectie.teorie || ''); 
    setFCod(lectie.codCPlusPlus || '');
    
    if (!lectie.animatie) setFAnim('null');
    else if (['BubbleSortAnim', 'CautareBinaraAnim'].includes(lectie.animatie)) setFAnim(lectie.animatie);
    else { setFAnim('custom'); setFAnimCustom(lectie.animatie); }
    
    setPbRows(lectie.problemePbinfo?.length > 0 ? lectie.problemePbinfo : [{ id: '', titlu: '', url: '' }]);
    setQuiz(lectie.quiz || Array(5).fill(0).map(() => ({ intrebare: '', variante: ['', '', '', ''], corect: 0 })));
    setCfProblems(lectie.codeforces || ['', '']);
    setIsEditing(true);
    setActiveTab('adauga');
    toast.info(`Editare lecție: ${lectie.titlu}`); 
  };

  const handlePublish = async () => {
  if (!fId || !fTitlu) return toast.warning("Completează ID și Titlu!");
  setLoading(true);

  try {
    let categorieVal = null;
    let clasaFinala = fClasa;

    if (fClasa === 'olimpici') {
      categorieVal = 'olimpiada';
      clasaFinala = 'olimpici';
    } else if (fClasa === 'concepte') {
      categorieVal = 'concepte';
      clasaFinala = 'concepte';
    }

    const lectieData = {
      id: fId,
      clasa: clasaFinala,
      categorie: categorieVal,
      ordine: Number(fOrdine),
      titlu: fTitlu,
      descriere: fDescriere,
      teorie: fTeorie,
      codCPlusPlus: fCod,
      animatie: fAnim === 'null' ? null : (fAnim === 'custom' ? fAnimCustom : fAnim),
      problemePbinfo: pbRows.filter(r => r.id || r.titlu),
      quiz: quiz,
      codeforces: cfProblems,
      dataModificarii: new Date().toISOString()
    };

    await setDoc(doc(db, "lectii", fId), lectieData);

    if (propunereInCurs) {
      const propGasita = propuneri.find((p) => p.id === propunereInCurs);

      if (propGasita?.autorId) {
        await sendUserNotification(
          propGasita.autorId,
          "lectie_aprobata",
          `Propunerea ta pentru lecția „${propGasita.titlu}” a fost aprobată.`
        );
      }

      await deleteDoc(doc(db, "propuneri_lectii", propunereInCurs));
    }

    toast.success(isEditing ? "✅ Modificări salvate în cloud!" : "🚀 Lecție publicată cu succes!");
    resetForm();
    await refreshData();
    setActiveTab('lectii');
  } catch (e) {
    toast.error("Eroare la salvare: " + e.message);
  }

  setLoading(false);
};

  const totalLectii = firebaseLessons.length;
  const cuAnimatie = firebaseLessons.filter((l) => l.animatie && l.animatie !== 'null').length;
  const claseUnice = [...new Set(firebaseLessons.map((l) => l.clasa))].length;
  const totalPbinfo = firebaseLessons.reduce((s, l) => s + (l.problemePbinfo || []).length, 0);

  const countPerClasa = { 9: 0, 10: 0, 11: 0, 12: 0 };
  firebaseLessons.forEach((l) => {
    const n = parseInt(l.clasa?.split('-')[1]);
    if (!isNaN(n)) countPerClasa[n]++;
  });
  const maxCount = Math.max(...Object.values(countPerClasa), 1);
  const barColors = { 9: '#378ADD', 10: '#639922', 11: '#BA7517', 12: '#D4537E' };

  const totalUsers = firebaseUsers.length;
  const verifiedCFUsers = firebaseUsers.filter(u => u.cfValidat).length;
  const totalPlatformXP = firebaseUsers.reduce((sum, u) => sum + (u.puncteTotale || 0), 0);
  const avgStreak = totalUsers > 0 ? (firebaseUsers.reduce((sum, u) => sum + (u.streakCount || 0), 0) / totalUsers).toFixed(1) : 0;

  const topUsers = [...firebaseUsers].sort((a, b) => (b.puncteTotale || 0) - (a.puncteTotale || 0)).slice(0, 5);
  const maxUserXP = topUsers.length > 0 ? Math.max(topUsers[0].puncteTotale || 1, 1) : 1;

  const topStreakUsers = [...firebaseUsers].sort((a, b) => (b.streakCount || 0) - (a.streakCount || 0)).slice(0, 5);
  const maxUserStreak = topStreakUsers.length > 0 ? Math.max(topStreakUsers[0].streakCount || 1, 1) : 1;

  const filteredLessons = firebaseLessons.filter((l) => {
    const search = searchTerm.toLowerCase();
    return l.titlu?.toLowerCase().includes(search) || l.id?.toLowerCase().includes(search);
  });

  const tabs = ['overview', 'utilizatori', 'aprobari', 'lectii', 'adauga'];

  return (
    <div className="admin-wrapper">
      <header className="admin-header">
        <div className="admin-header-logo">InfoMotion<span>.</span> <em>Admin</em></div>
        <div className="admin-header-right">
          <span className="admin-user-pill">👤 {username}</span>
          <button className="admin-btn-logout" onClick={() => {
            onLogout();
            toast.info("Te-ai deconectat.");
          }}>Deconectare</button>
        </div>
      </header>

      <div className="admin-tabs-bar">
        {tabs.map((t) => (
          <button
            key={t}
            className={`admin-tab ${activeTab === t ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(t);
              if (t !== 'adauga') resetForm();
            }}
          >
            {t === 'overview' ? 'Prezentare generală'
              : t === 'utilizatori' ? '👥 Utilizatori'
              : t === 'aprobari' ? `Aprobări (${propuneri.length})`
              : t === 'lectii' ? 'Lecțiile mele'
              : isEditing ? '📝 Editează lecția' : '➕ Adaugă lecție'}
          </button>
        ))}
      </div>

      <main className="admin-main">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <>
            <div className="admin-stat-grid">
              <div className="admin-stat-card" style={{borderColor: '#378ADD'}}><div className="admin-stat-label">Total lecțiile</div><div className="admin-stat-num">{totalLectii}</div><div className="admin-stat-sub">în Cloud</div></div>
              <div className="admin-stat-card" style={{borderColor: '#639922'}}><div className="admin-stat-label">Cu animație</div><div className="admin-stat-num">{cuAnimatie}</div><div className="admin-stat-sub">active</div></div>
              <div className="admin-stat-card" style={{borderColor: '#BA7517'}}><div className="admin-stat-label">Clase acoperite</div><div className="admin-stat-num">{claseUnice}/3</div><div className="admin-stat-sub">clase</div></div>
              <div className="admin-stat-card" style={{borderColor: '#D4537E'}}><div className="admin-stat-label">Probleme pbinfo</div><div className="admin-stat-num">{totalPbinfo}</div><div className="admin-stat-sub">linkuri</div></div>
            </div>
            <div className="admin-two-col">
              <div className="admin-card">
                <div className="admin-section-title">Distribuție pe clase</div>
                {[9, 10, 11, 12].map((c) => (
                  <div key={c} className="admin-bar-row">
                    <span className="admin-bar-label">Clasa {c}</span>
                    <div className="admin-bar-track">
                      <div className="admin-bar-fill" style={{ width: `${(countPerClasa[c] / maxCount) * 100}%`, background: barColors[c] }} />
                    </div>
                    <span className="admin-bar-count">{countPerClasa[c]}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* UTILIZATORI TAB */}
        {activeTab === 'utilizatori' && (
          <>
            <div className="admin-stat-grid" style={{ marginBottom: '20px' }}>
              <div className="admin-stat-card" style={{ borderColor: '#378ADD' }}><div className="admin-stat-label">Total Conturi</div><div className="admin-stat-num">{totalUsers}</div><div className="admin-stat-sub">Elevi înregistrați</div></div>
              <div className="admin-stat-card" style={{ borderColor: '#639922' }}><div className="admin-stat-label">Verificați Codeforces</div><div className="admin-stat-num">{verifiedCFUsers}</div><div className="admin-stat-sub">{totalUsers > 0 ? Math.round((verifiedCFUsers/totalUsers)*100) : 0}% din total</div></div>
              <div className="admin-stat-card" style={{ borderColor: '#BA7517' }}><div className="admin-stat-label">XP Total Generat</div><div className="admin-stat-num">{totalPlatformXP}</div><div className="admin-stat-sub">puncte pe platformă</div></div>
              <div className="admin-stat-card" style={{ borderColor: '#D4537E' }}><div className="admin-stat-label">Streak Mediu</div><div className="admin-stat-num">{avgStreak}</div><div className="admin-stat-sub">zile consecutive</div></div>
            </div>
            <div className='admin-two-col'>
              <div className='admin-card' style={{flex: 1}}>
                <div className='admin-section-title'>🏆 Top Elevi (După XP)</div>
                {topUsers.map((user, index) => (
                    <div key={index} className="admin-bar-row" style={{ marginBottom: '15px' }}>
                      <span className="admin-bar-label" style={{ minWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>#{index + 1} {user.nume || (user.email ? user.email.split('@')[0] : "Anonim")}</span>
                      <div className="admin-bar-track">
                        <div className="admin-bar-fill" style={{ width: `${((user.puncteTotale || 0) / maxUserXP) * 100}%`, background: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#378ADD' }}/>
                      </div>
                      <span className="admin-bar-count" style={{ minWidth: '50px' }}>{user.puncteTotale || 0} XP</span>
                    </div>
                ))}
              </div>
              <div className='admin-card' style={{flex: 1}}>
                <div className='admin-section-title'>🔥 Top Elevi (După Streak)</div>
                {topStreakUsers.map((user, index) => (
                    <div key={index} className="admin-bar-row" style={{ marginBottom: '15px' }}>
                      <span className="admin-bar-label" style={{ minWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>#{index + 1} {user.nume || (user.email ? user.email.split('@')[0] : "Anonim")}</span>
                      <div className="admin-bar-track">
                        <div className="admin-bar-fill" style={{ width: `${((user.streakCount || 0) / maxUserStreak) * 100}%`, background: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#ff4500' }}/>
                      </div>
                      <span className="admin-bar-count" style={{ minWidth: '50px' }}>{user.streakCount || 0} zile</span>
                    </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* APROBARI LECTII TAB (NOU) */}
        {activeTab === 'aprobari' && (
          <div className="admin-card">
  <div className="admin-section-title">Lecții propuse de utilizatori</div>

  {propuneri.length === 0 ? (
    <div className="admin-empty-state">
      Nu există nicio lecție nouă în așteptare.
    </div>
  ) : (
    <div className="admin-approvals-list">
      {propuneri.map((p) => (
        <div key={p.id} className="admin-approval-card">
          <div className="admin-approval-top">
            <div className="admin-approval-main">
              <h3 className="admin-approval-title">{p.titlu}</h3>

              <div className="admin-approval-meta">
                <span className="admin-badge admin-badge-propunere">{p.clasa}</span>
              </div>

              <div className="admin-approval-author">
                <strong>Autor:</strong> {p.numeAutorDorit || p.emailAutor || "Anonim"}<br />
                <strong>Email:</strong> {p.emailAutor || "Anonim"}
              </div>
            </div>

            <div className="admin-approval-actions">
              <button
                className="admin-btn-approve"
                onClick={() => handleApprovePropunere(p)}
              >
                 Aprobă
              </button>

              <button
                className="admin-btn-reject"
                onClick={() => handleRejectPropunere(p)}
              >
                 Respinge
              </button>
            </div>
          </div>

          <div className="admin-approval-section">
            <div className="admin-approval-section-title">Teorie propusă</div>
            <div className="admin-approval-text">{p.teorie}</div>
          </div>

          {p.codCPlusPlus && (
            <div className="admin-approval-section">
              <div className="admin-approval-section-title">Cod C++ propus</div>
              <pre className="admin-approval-code">
                <code>{p.codCPlusPlus}</code>
              </pre>
            </div>
          )}
        </div>
      ))}
    </div>
  )}
</div>
        )}

        {/* LECTII TAB */}
        {activeTab === 'lectii' && (
          <>
            <div style={{ marginBottom: '15px', width: '100%' }}>
              <input 
                type="text" 
                placeholder="🔍 Caută o lecție după titlu sau ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none' }}
              />
            </div>
            <div className="admin-table-wrap desktop-only">
              <table className="admin-table">
                <thead><tr><th>ID</th><th>Titlu</th><th>Clasă / Tip</th><th>Acțiuni</th></tr></thead>
                <tbody>
                  {filteredLessons.map((l) => (
                    <tr key={l.id}>
                      <td><code className="admin-route-code">{l.id}</code></td>
                      <td className="admin-td-titlu">{l.titlu}</td>
                      <td>
                        <span className={`admin-badge admin-badge-${l.clasa?.split('-')[1] || l.clasa}`}>
                          {l.categorie === 'olimpiada' ? 'OLIMPICI' : l.categorie === 'concepte' ? 'CONCEPTE' : l.clasa?.toUpperCase()}
                        </span>
                      </td>
                      <td className="admin-actions-cell">
                        <button className="admin-btn-edit" onClick={() => startEdit(l)}>Editează</button>
                        <button className="admin-btn-delete" onClick={() => handleDelete(l.id)}>Șterge</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="admin-lessons-mobile-list mobile-only">
              {filteredLessons.map((l) => (
                <div key={l.id} className="admin-lesson-mobile-card">
                  <div className="mobile-card-header">
                    <span className={`admin-badge admin-badge-${l.clasa?.split('-')[1] || l.clasa}`}>{l.categorie ? l.categorie.toUpperCase() : l.clasa?.toUpperCase()}</span>
                    <code className="admin-route-code">{l.id.substring(0, 15)}{l.id.length > 15 ? '...' : ''}</code>
                  </div>
                  <div className="mobile-card-title">{l.titlu}</div>
                  <div className="mobile-card-actions">
                    <button className="admin-btn-edit mobile-action-btn" onClick={() => startEdit(l)}>📝 Editează</button>
                    <button className="admin-btn-delete mobile-action-btn" onClick={() => handleDelete(l.id)}>🗑️ Șterge</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ADAUGA TAB */}
        {activeTab === 'adauga' && (
          <div className="admin-card admin-form-card">
            <div className="admin-form-title">{isEditing ? `Editare lecție: ${fId}` : 'Lecție nouă'}</div>
            
            {/* Mesaj de avertizare daca cream pornind de la o propunere */}
            {propunereInCurs && (
  <div className="admin-propunere-banner">
     <strong>Mod Aprobare Propunere:</strong> datele au fost precompletate.
    Adaugă ID-ul lecției, verifică textul și apoi publică.
  </div>
)}

            <div className="admin-form-grid">
              <div className="admin-field">
                <label>ID (Slug)</label>
                <input type="text" value={fId} onChange={(e) => setFId(e.target.value)} disabled={isEditing && !propunereInCurs} placeholder="ex: grafuri-introducere" />
                {(isEditing && !propunereInCurs) && <small>ID-ul nu poate fi schimbat după publicare.</small>}
              </div>
              <div className="admin-field">
                <label>Clasă / Secțiune specială</label>
                <select value={fClasa} onChange={(e) => setFClasa(e.target.value)}>
                  <option value="clasa-9">Clasa 9</option>
                  <option value="clasa-10">Clasa 10</option>
                  <option value="clasa-11">Clasa 11</option>
                  <option value="olimpici"> Olimpici</option>
                  <option value="concepte">Concepte Generale</option>
                </select>
              </div>

              <div className="admin-field">
                <label>Număr de ordine (Poziția în Curs)</label>
                <input type="number" value={fOrdine} onChange={(e) => setFOrdine(e.target.value)} min="1" placeholder="ex: 1 (ușor) -> 10 (greu)" />
              </div>

              <div className="admin-field admin-field--full">
                <label>Titlu</label>
                <input type="text" value={fTitlu} onChange={(e) => setFTitlu(e.target.value)} />
              </div>
              <div className="admin-field admin-field--full">
                <label>Descriere scurtă</label>
                <input type="text" value={fDescriere} onChange={(e) => setFDescriere(e.target.value)} />
              </div>
              <div className="admin-field admin-field--full">
                <label>Teorie</label>
                <textarea value={fTeorie} onChange={(e) => setFTeorie(e.target.value)} rows={6} />
              </div>

              <div className="admin-field admin-field--full">
                <label>Animație Interactivă</label>
                <div className="admin-anim-options" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  {['null', 'BubbleSortAnim', 'CautareBinaraAnim', 'custom'].map(opt => (
                    <button key={opt} type="button" className={`admin-anim-opt ${fAnim === opt ? 'selected' : ''}`} onClick={() => setFAnim(opt)}>
                      {opt === 'null' ? 'Fără' : opt === 'custom' ? 'Alt nume' : opt}
                    </button>
                  ))}
                </div>
                {fAnim === 'custom' && (
                  <input type="text" value={fAnimCustom} onChange={(e) => setFAnimCustom(e.target.value)} placeholder="Nume componentă React" style={{ marginTop: '10px' }} />
                )}
              </div>

              <div className="admin-field admin-field--full">
                <label>Cod C++</label>
                <textarea className="admin-textarea-code" value={fCod} onChange={(e) => setFCod(e.target.value)} rows={8} />
              </div>

              <div className="admin-field admin-field--full">
                <div className="admin-section-divider">Probleme Pbinfo</div>
                {pbRows.map((row, idx) => (
                  <div key={idx} className="admin-pb-row">
                    <input type="text" value={row.id} onChange={(e) => updatePb(idx, 'id', e.target.value)} placeholder="ID" className="admin-pb-id" />
                    <input type="text" value={row.titlu} onChange={(e) => updatePb(idx, 'titlu', e.target.value)} placeholder="Titlu" />
                    <input type="text" value={row.url} onChange={(e) => updatePb(idx, 'url', e.target.value)} placeholder="URL" />
                    <button type="button" onClick={() => removePbRow(idx)}>✕</button>
                  </div>
                ))}
                <button type="button" className="admin-add-pb" onClick={addPbRow}>+ Adaugă link</button>
              </div>

              <div className="admin-field admin-field--full">
                <div className="admin-section-divider">Quiz (5 Întrebări)</div>
                {quiz.map((q, qIdx) => (
                  <div key={qIdx} className="admin-quiz-setup-card" style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                    <input type="text" placeholder={`Întrebarea ${qIdx + 1}`} value={q.intrebare} onChange={(e) => updateQuiz(qIdx, 'intrebare', e.target.value)} style={{ width: '100%', fontWeight: 'bold', marginBottom: '10px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {q.variante.map((v, vIdx) => (
                        <div key={vIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                          <input type="radio" name={`correct-${qIdx}`} checked={q.corect === vIdx} onChange={() => updateQuiz(qIdx, 'corect', vIdx)} style={{ flexShrink: 0, width: '16px', height: '16px', cursor: 'pointer' }} />
                          <input type="text" placeholder={`Varianta ${vIdx + 1}`} value={v} onChange={(e) => updateQuiz(qIdx, 'varianta', e.target.value, vIdx)} style={{ flex: 1, minWidth: 0, width: '100%' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="admin-btn-primary" onClick={handlePublish} disabled={loading}>
                {loading ? 'Se procesează...' : (isEditing || propunereInCurs) ? '💾 Salvează modificările' : '🚀 Publică pe Site'}
              </button>
              {(isEditing || propunereInCurs) && <button className="admin-btn-secondary" onClick={resetForm}>Anulează</button>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function Admin() {
  const [loggedUser, setLoggedUser] = useState(null);
  
  return (
    <>
      <Toaster richColors position="top-right" closeButton />
      {!loggedUser
        ? <LoginScreen onLogin={setLoggedUser} />
        : <Dashboard username={loggedUser} onLogout={() => setLoggedUser(null)} />}
    </>
  );
}