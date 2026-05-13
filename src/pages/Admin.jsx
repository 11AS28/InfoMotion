import { useState, useEffect } from 'react';
import { lessonsData as localData } from '../lessonsData';
import '../pages_css/admin.css';
import { doc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

const ADMINS = [
  { username: import.meta.env.VITE_ADMIN_1_USER, password: import.meta.env.VITE_ADMIN_1_PASS },
  { username: import.meta.env.VITE_ADMIN_2_USER, password: import.meta.env.VITE_ADMIN_2_PASS },
];

// ===== LOGIN SCREEN =====
function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  function handleLogin(e) {
    e.preventDefault();
    const match = ADMINS.find((a) => a.username === username && a.password === password);
    if (match) onLogin(username);
    else { setError('Username sau parolă incorecte.'); setPassword(''); }
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

// ===== DASHBOARD =====
function Dashboard({ username, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [firebaseLessons, setFirebaseLessons] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  // --- STATE LECȚIE ---
  const [fId, setFId] = useState('');
  const [fClasa, setFClasa] = useState('clasa-9');
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

  // --- STATE ARENA ---
  const [arenaDate, setArenaDate] = useState(new Date().toISOString().split('T')[0]);
  const [arenaTitle, setArenaTitle] = useState('');
  const [arenaLink, setArenaLink] = useState('');
  const [arenaCF, setArenaCF] = useState('');

  // ===== DATA =====
  const refreshData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "lectii"));
      setFirebaseLessons(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      console.error("Eroare la preluare date:", e);
    }
  };

  useEffect(() => { refreshData(); }, [activeTab]);

  // ===== HELPERS PBINFO =====
  const updatePb = (idx, field, val) =>
    setPbRows(pbRows.map((r, i) => i === idx ? { ...r, [field]: val } : r));
  const addPbRow = () => setPbRows([...pbRows, { id: '', titlu: '', url: '' }]);
  const removePbRow = (idx) => pbRows.length > 1 && setPbRows(pbRows.filter((_, i) => i !== idx));

  // ===== HELPERS QUIZ =====
  const updateQuiz = (qIdx, field, val, vIdx = null) => {
    const newQuiz = [...quiz];
    if (field === 'varianta') newQuiz[qIdx].variante[vIdx] = val;
    else newQuiz[qIdx][field] = val;
    setQuiz(newQuiz);
  };

  // ===== RESET =====
  const resetForm = () => {
    setFId(''); setFClasa('clasa-9'); setFTitlu(''); setFDescriere('');
    setFTeorie(''); setFCod(''); setFAnim('null'); setFAnimCustom('');
    setPbRows([{ id: '', titlu: '', url: '' }]);
    setQuiz(Array(5).fill(0).map(() => ({ intrebare: '', variante: ['', '', '', ''], corect: 0 })));
    setCfProblems(['', '']);
    setIsEditing(false);
  };

  // ===== ȘTERGERE =====
  const handleDelete = async (id) => {
    if (!window.confirm(`Ești sigur că vrei să ștergi lecția "${id}"?`)) return;
    try {
      await deleteDoc(doc(db, "lectii", id));
      alert("Lecție ștearsă!");
      refreshData();
    } catch (e) { alert("Eroare la ștergere: " + e.message); }
  };

  // ===== EDITARE =====
  const startEdit = (lectie) => {
    setFId(lectie.id);
    setFClasa(lectie.clasa || 'clasa-9');
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
  };

  // ===== PUBLICARE LECȚIE =====
  const handlePublish = async () => {
    if (!fId || !fTitlu) return alert("Completează ID și Titlu!");
    setLoading(true);
    try {
      const lectieData = {
        id: fId, clasa: fClasa, titlu: fTitlu, descriere: fDescriere, teorie: fTeorie,
        codCPlusPlus: fCod,
        animatie: fAnim === 'null' ? null : (fAnim === 'custom' ? fAnimCustom : fAnim),
        problemePbinfo: pbRows.filter(r => r.id || r.titlu),
        quiz: quiz,
        codeforces: cfProblems,
        dataModificarii: new Date().toISOString()
      };
      await setDoc(doc(db, "lectii", fId), lectieData);
      alert(isEditing ? "✅ Modificări salvate!" : "🚀 Lecție publicată!");
      resetForm();
      await refreshData();
      setActiveTab('lectii');
    } catch (e) { alert("Eroare: " + e.message); }
    setLoading(false);
  };

  // ===== SALVARE ARENA =====
  const handleSaveArena = async () => {
    if (!arenaTitle || !arenaCF) return alert("Titlu și ID CF obligatorii!");
    setLoading(true);
    try {
      const [y, m, d] = arenaDate.split('-');
      const docId = `${d}_${m}_${y}`;
      await setDoc(doc(db, "dailyChallenges", docId), {
        titlu: arenaTitle, link: arenaLink, idCF: arenaCF, solvers: []
      });
      alert("Problema zilei programată!");
      setArenaTitle(''); setArenaCF(''); setArenaLink('');
    } catch (e) { alert("Eroare Arena: " + e.message); }
    setLoading(false);
  };

  // ===== STATS OVERVIEW =====
  const currentData = firebaseLessons.length > 0 ? firebaseLessons : localData;
  const totalLectii = currentData.length;
  const cuAnimatie = currentData.filter((l) => l.animatie && l.animatie !== 'null').length;
  const claseUnice = [...new Set(currentData.map((l) => l.clasa))].length;
  const totalPbinfo = currentData.reduce((s, l) => s + (l.problemePbinfo || []).length, 0);

  const countPerClasa = { 9: 0, 10: 0, 11: 0, 12: 0 };
  currentData.forEach((l) => {
    const n = parseInt(l.clasa?.split('-')[1]);
    if (!isNaN(n)) countPerClasa[n]++;
  });
  const maxCount = Math.max(...Object.values(countPerClasa), 1);
  const barColors = { 9: '#378ADD', 10: '#639922', 11: '#BA7517', 12: '#D4537E' };

  // ===== TABS =====
  const tabs = ['overview', 'lectii', 'adauga'];

  return (
    <div className="admin-wrapper">
      <header className="admin-header">
        <div className="admin-header-logo">InfoMotion<span>.</span> <em>Admin</em></div>
        <div className="admin-header-right">
          <span className="admin-user-pill">👤 {username}</span>
          <button className="admin-btn-logout" onClick={onLogout}>Deconectare</button>
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
              : t === 'lectii' ? 'Lecțiile mele'
              : isEditing ? '📝 Editează lecția' : '➕ Adaugă lecție'}
          </button>
        ))}
      </div>

      <main className="admin-main">

        {/* ===== TAB OVERVIEW ===== */}
        {activeTab === 'overview' && (
          <>
            <div className="admin-stat-grid">
              <div className="admin-stat-card">
                <div className="admin-stat-label">Total lecțiile</div>
                <div className="admin-stat-num">{totalLectii}</div>
                <div className="admin-stat-sub">în Cloud</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-label">Cu animație</div>
                <div className="admin-stat-num">{cuAnimatie}</div>
                <div className="admin-stat-sub">active</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-label">Clase acoperite</div>
                <div className="admin-stat-num">{claseUnice}/4</div>
                <div className="admin-stat-sub">clase</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-label">Probleme pbinfo</div>
                <div className="admin-stat-num">{totalPbinfo}</div>
                <div className="admin-stat-sub">linkuri</div>
              </div>
            </div>

            <div className="admin-two-col">
              <div className="admin-card">
                <div className="admin-section-title">Distribuție pe clase</div>
                {[9, 10, 11, 12].map((c) => (
                  <div key={c} className="admin-bar-row">
                    <span className="admin-bar-label">Clasa {c}</span>
                    <div className="admin-bar-track">
                      <div
                        className="admin-bar-fill"
                        style={{ width: `${(countPerClasa[c] / maxCount) * 100}%`, background: barColors[c] }}
                      />
                    </div>
                    <span className="admin-bar-count">{countPerClasa[c]}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ===== TAB LECȚII ===== */}
        {activeTab === 'lectii' && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>ID</th><th>Titlu</th><th>Clasă</th><th>Acțiuni</th></tr>
              </thead>
              <tbody>
                {firebaseLessons.map((l) => (
                  <tr key={l.id}>
                    <td><code className="admin-route-code">{l.id}</code></td>
                    <td className="admin-td-titlu">{l.titlu}</td>
                    <td>
                      <span className={`admin-badge admin-badge-${l.clasa?.split('-')[1]}`}>
                        {l.clasa?.toUpperCase()}
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
        )}

        {/* ===== TAB ADAUGĂ / EDITEAZĂ ===== */}
        {activeTab === 'adauga' && (
          <div className="admin-card admin-form-card">
            <div className="admin-form-title">{isEditing ? `Editare lecție: ${fId}` : 'Lecție nouă'}</div>
            <div className="admin-form-grid">

              {/* Câmpuri de bază */}
              <div className="admin-field">
                <label>ID (Slug)</label>
                <input type="text" value={fId} onChange={(e) => setFId(e.target.value)} disabled={isEditing} placeholder="ex: grafuri-introducere" />
                {isEditing && <small>ID-ul nu poate fi schimbat după publicare.</small>}
              </div>
              <div className="admin-field">
                <label>Clasă</label>
                <select value={fClasa} onChange={(e) => setFClasa(e.target.value)}>
                  <option value="clasa-9">Clasa 9</option>
                  <option value="clasa-10">Clasa 10</option>
                  <option value="clasa-11">Clasa 11</option>
                  <option value="clasa-12">Clasa 12</option>
                </select>
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

              {/* Animație */}
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

              {/* Cod C++ */}
              <div className="admin-field admin-field--full">
                <label>Cod C++</label>
                <textarea className="admin-textarea-code" value={fCod} onChange={(e) => setFCod(e.target.value)} rows={8} />
              </div>

              {/* Probleme Pbinfo */}
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

              {/* Quiz */}
              <div className="admin-field admin-field--full">
                <div className="admin-section-divider">Quiz (5 Întrebări)</div>
                {quiz.map((q, qIdx) => (
                  <div key={qIdx} className="admin-quiz-setup-card" style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                    <input
                      type="text"
                      placeholder={`Întrebarea ${qIdx + 1}`}
                      value={q.intrebare}
                      onChange={(e) => updateQuiz(qIdx, 'intrebare', e.target.value)}
                      style={{ width: '100%', fontWeight: 'bold', marginBottom: '10px' }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {q.variante.map((v, vIdx) => (
                        <div key={vIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                          <input
                            type="radio"
                            name={`correct-${qIdx}`}
                            checked={q.corect === vIdx}
                            onChange={() => updateQuiz(qIdx, 'corect', vIdx)}
                            style={{ flexShrink: 0, width: '16px', height: '16px', cursor: 'pointer' }}
                          />
                          <input
                            type="text"
                            placeholder={`Varianta ${vIdx + 1}`}
                            value={v}
                            onChange={(e) => updateQuiz(qIdx, 'varianta', e.target.value, vIdx)}
                            style={{ flex: 1, minWidth: 0, width: '100%' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Codeforces */}
              <div className="admin-field admin-field--full">
                <div className="admin-section-divider">Codeforces (2 Probleme)</div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <input type="text" placeholder="Problem 1 (ex: 158/A)" value={cfProblems[0]} onChange={(e) => setCfProblems([e.target.value, cfProblems[1]])} style={{ flex: 1 }} />
                  <input type="text" placeholder="Problem 2 (ex: 71/A)" value={cfProblems[1]} onChange={(e) => setCfProblems([cfProblems[0], e.target.value])} style={{ flex: 1 }} />
                </div>
              </div>

            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="admin-btn-primary" onClick={handlePublish} disabled={loading}>
                {loading ? 'Se procesează...' : isEditing ? '💾 Salvează modificările' : '🚀 Publică pe Site'}
              </button>
              {isEditing && <button className="admin-btn-secondary" onClick={resetForm}>Anulează</button>}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// ===== EXPORT =====
export default function Admin() {
  const [loggedUser, setLoggedUser] = useState(null);
  return !loggedUser
    ? <LoginScreen onLogin={setLoggedUser} />
    : <Dashboard username={loggedUser} onLogout={() => setLoggedUser(null)} />;
}