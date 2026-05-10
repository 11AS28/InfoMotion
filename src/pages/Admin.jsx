import { useState, useEffect } from 'react';
import { lessonsData as localData } from '../lessonsData'; 
import '../pages_css/admin.css';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const ADMINS = [
  { username: import.meta.env.VITE_ADMIN_1_USER, password: import.meta.env.VITE_ADMIN_1_PASS },
  { username: import.meta.env.VITE_ADMIN_2_USER, password: import.meta.env.VITE_ADMIN_2_PASS },
];

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
              <button type="button" className="admin-show-pass" onClick={() => setShowPass((v) => !v)}>{showPass ? '🙈' : '👁️'}</button>
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

  // Form State
  const [fId, setFId] = useState('');
  const [fClasa, setFClasa] = useState('clasa-9');
  const [fTitlu, setFTitlu] = useState('');
  const [fDescriere, setFDescriere] = useState('');
  const [fTeorie, setFTeorie] = useState('');
  const [fCod, setFCod] = useState('');
  const [fAnim, setFAnim] = useState('null');
  const [fAnimCustom, setFAnimCustom] = useState('');
  const [pbRows, setPbRows] = useState([{ id: '', titlu: '', url: '' }]);

  // Functia de refresh date din Firebase
  const refreshData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "lectii"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFirebaseLessons(data);
    } catch (e) {
      console.error("Eroare la preluare date:", e);
    }
  };

  useEffect(() => {
    refreshData();
  }, [activeTab]);

  // Migrare (utila daca vrei sa muti lectiile vechi in Cloud)
  async function migrareInMasa() {
    if (!window.confirm("Vrei să urci toate lecțiile locale în Firebase?")) return;
    for (const lectie of localData) {
      await setDoc(doc(db, "lectii", lectie.id), lectie);
    }
    alert("Migrare terminată!");
    refreshData();
  }

  // Logica de statistici bazata pe datele din Firebase (sau local daca Firebase e gol)
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

  // Helper Functions Formular
  const updatePb = (idx, field, val) => setPbRows(pbRows.map((r, i) => i === idx ? { ...r, [field]: val } : r));
  const addPbRow = () => setPbRows([...pbRows, { id: '', titlu: '', url: '' }]);
  const removePbRow = (idx) => pbRows.length > 1 && setPbRows(pbRows.filter((_, i) => i !== idx));

  async function handlePublish() {
    if (!fId || !fTitlu) return alert("Completează ID și Titlu!");
    setLoading(true);
    try {
      const lectieData = {
        id: fId, clasa: fClasa, titlu: fTitlu, descriere: fDescriere, teorie: fTeorie,
        codCPlusPlus: fCod, dataPublicarii: new Date().toISOString(),
        animatie: fAnim === 'null' ? null : (fAnim === 'custom' ? fAnimCustom : fAnim),
        problemePbinfo: pbRows.filter(r => r.id || r.titlu)
      };
      await setDoc(doc(db, "lectii", fId), lectieData);
      alert("🚀 Lecție publicată cu succes!");
      
      // Reset formular
      setFId(''); setFTitlu(''); setFDescriere(''); setFTeorie(''); setFCod('');
      setPbRows([{ id: '', titlu: '', url: '' }]); setFAnim('null'); setFAnimCustom('');
      
      await refreshData();
      setActiveTab('lectii');
    } catch (e) { alert("Eroare: " + e.message); }
    setLoading(false);
  }

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
        {['overview', 'lectii', 'adauga'].map((t) => (
          <button key={t} className={`admin-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {t === 'overview' ? 'Prezentare generală' : t === 'lectii' ? 'Lecțiile mele' : 'Adaugă lecție'}
          </button>
        ))}
      </div>

      <main className="admin-main">
        {activeTab === 'overview' && (
          <>
            <div className="admin-stat-grid">
              <div className="admin-stat-card"><div className="admin-stat-label">Total lecții</div><div className="admin-stat-num">{totalLectii}</div><div className="admin-stat-sub">în Cloud</div></div>
              <div className="admin-stat-card"><div className="admin-stat-label">Cu animație</div><div className="admin-stat-num">{cuAnimatie}</div><div className="admin-stat-sub">active</div></div>
              <div className="admin-stat-card"><div className="admin-stat-label">Clase acoperite</div><div className="admin-stat-num">{claseUnice}/4</div><div className="admin-stat-sub">clase</div></div>
              <div className="admin-stat-card"><div className="admin-stat-label">Probleme pbinfo</div><div className="admin-stat-num">{totalPbinfo}</div><div className="admin-stat-sub">linkuri</div></div>
            </div>

            <div className="admin-two-col">
              <div className="admin-card">
                <div className="admin-section-title">Distribuție pe clase</div>
                {[9, 10, 11, 12].map((c) => (
                  <div key={c} className="admin-bar-row">
                    <span className="admin-bar-label">Clasa {c}</span>
                    <div className="admin-bar-track"><div className="admin-bar-fill" style={{ width: `${(countPerClasa[c]/maxCount)*100}%`, background: barColors[c] }} /></div>
                    <span className="admin-bar-count">{countPerClasa[c]}</span>
                  </div>
                ))}
              </div>
              <div className="admin-card">
                <div className="admin-section-title">Acțiuni rapide</div>
                <button onClick={migrareInMasa} className="admin-btn-secondary" style={{width: '100%', marginBottom: '10px'}}>🚀 Sincronizează Local cu Cloud</button>
                <p style={{fontSize: '12px', color: '#666'}}>Folosește acest buton dacă ai lecții în lessonsData.js care nu apar în Cloud.</p>
              </div>
            </div>
          </>
        )}

        {activeTab === 'lectii' && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>ID</th><th>Titlu</th><th>Clasă</th><th>Animație</th><th>Acțiuni</th></tr></thead>
              <tbody>
                {currentData.map((l) => (
                  <tr key={l.id}>
                    <td><code className="admin-route-code">{l.id}</code></td>
                    <td className="admin-td-titlu">{l.titlu}</td>
                    <td><span className={`admin-badge admin-badge-${l.clasa?.split('-')[1]}`}>{l.clasa?.toUpperCase()}</span></td>
                    <td>{l.animatie ? <span className="admin-badge admin-badge-anim">{l.animatie}</span> : '—'}</td>
                    <td><span style={{fontSize: '12px', color: '#28a745'}}>● Online</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'adauga' && (
          <div className="admin-card admin-form-card">
            <div className="admin-form-title">Lecție nouă</div>
            <div className="admin-form-grid">
              <div className="admin-field"><label>ID (fără spații)</label><input type="text" value={fId} onChange={(e) => setFId(e.target.value)} placeholder="ex: grafuri-introducere" /></div>
              <div className="admin-field"><label>Clasă</label><select value={fClasa} onChange={(e) => setFClasa(e.target.value)}><option value="clasa-9">Clasa 9</option><option value="clasa-10">Clasa 10</option><option value="clasa-11">Clasa 11</option><option value="clasa-12">Clasa 12</option></select></div>
              <div className="admin-field admin-field--full"><label>Titlu</label><input type="text" value={fTitlu} onChange={(e) => setFTitlu(e.target.value)} /></div>
              <div className="admin-field admin-field--full"><label>Descriere scurtă</label><input type="text" value={fDescriere} onChange={(e) => setFDescriere(e.target.value)} /></div>
              <div className="admin-field admin-field--full"><label>Teorie (păstrează Enter-urile)</label><textarea value={fTeorie} onChange={(e) => setFTeorie(e.target.value)} rows={6} /></div>
              
              <div className="admin-field admin-field--full">
                <label>Animație Interactivă</label>
                <div className="admin-anim-options" style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                  {['null', 'BubbleSortAnim', 'CautareBinaraAnim', 'custom'].map(opt => (
                    <button key={opt} type="button" className={`admin-anim-opt ${fAnim === opt ? 'selected' : ''}`} onClick={() => setFAnim(opt)}>
                      {opt === 'null' ? 'Fără' : opt === 'custom' ? 'Alt nume' : opt}
                    </button>
                  ))}
                </div>
                {fAnim === 'custom' && <input type="text" value={fAnimCustom} onChange={(e) => setFAnimCustom(e.target.value)} placeholder="Nume componentă React" style={{marginTop: '10px'}} />}
              </div>

              <div className="admin-field admin-field--full"><label>Cod C++</label><textarea className="admin-textarea-code" value={fCod} onChange={(e) => setFCod(e.target.value)} rows={8} /></div>
              
              <div className="admin-field admin-field--full">
                <label>Probleme Pbinfo</label>
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
            </div>
            <button className="admin-btn-primary" onClick={handlePublish} disabled={loading}>{loading ? 'Se publică...' : '🚀 Publică pe Site'}</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function Admin() {
  const [loggedUser, setLoggedUser] = useState(null);
  return !loggedUser ? <LoginScreen onLogin={setLoggedUser} /> : <Dashboard username={loggedUser} onLogout={() => setLoggedUser(null)} />;
}