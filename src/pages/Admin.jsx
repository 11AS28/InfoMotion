// Admin.jsx — Fișierul principal. Gestionează login, navigare și starea globală.
import { useState, useEffect } from 'react';
import '../pages_css/admin.css';
import {doc, collection, getDocs, addDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Toaster, toast } from 'sonner';

import OverviewTab from './admin/OverviewTab';
import UtilizatoriTab from './admin/UtilizatoriTab';
import TodoTab from './admin/TodoTab';
import LectiiTab from './admin/LectiiTab';
import AdaugaTab from './admin/AdaugaTab';

// ─── Admins ────────────────────────────────────────────────────────────────────
const ADMINS = [
  { username: import.meta.env.VITE_ADMIN_1_USER, password: import.meta.env.VITE_ADMIN_1_PASS },
  { username: import.meta.env.VITE_ADMIN_2_USER, password: import.meta.env.VITE_ADMIN_2_PASS },
  { username: import.meta.env.VITE_ADMIN_3_USER, password: import.meta.env.VITE_ADMIN_3_PASS },
  { username: import.meta.env.VITE_ADMIN_4_USER, password: import.meta.env.VITE_ADMIN_4_PASS },
];

// ─── Login Screen ──────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleLogin = (e) => {
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
  };

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

// ─── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ username, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');

  // Date globale
  const [firebaseLessons, setFirebaseLessons] = useState([]);
  const [firebaseUsers, setFirebaseUsers] = useState([]);
  const [propuneri, setPropuneri] = useState([]);
  const [todos, setTodos] = useState([]);

  // Stare pentru tab-ul Adaugă
  const [isEditing, setIsEditing] = useState(false);
  const [propunereInCurs, setPropunereInCurs] = useState(null);
  const [editData, setEditData] = useState(null);

  // ── Preluare date Firebase ──────────────────────────────────────────────────
  const refreshData = async () => {
    try {
      const [snapLectii, snapUsers, snapPropuneri, snapTodo] = await Promise.all([
        getDocs(collection(db, 'lectii')),
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'propuneri_lectii')),
        getDocs(query(collection(db, 'admin_todo'), orderBy('createdAt', 'desc'))),
      ]);

      setFirebaseLessons(snapLectii.docs.map((d) => ({ id: d.id, ...d.data() })));
      setFirebaseUsers(snapUsers.docs.map((d) => ({ id: d.id, ...d.data() })));
      setPropuneri(
        snapPropuneri.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((p) => p.status === 'in_asteptare')
      );
      setTodos(snapTodo.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
      toast.error('Nu s-au putut încărca datele din Firebase.');
    }
  };

  useEffect(() => { refreshData(); }, [activeTab]);

  // ── Navigare ────────────────────────────────────────────────────────────────
  const resetEdit = () => {
    setIsEditing(false);
    setPropunereInCurs(null);
    setEditData(null);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== 'adauga') resetEdit();
  };

  // ── Editare lecție ──────────────────────────────────────────────────────────
  const handleEdit = (lectie) => {
    let clasa = lectie.clasa || 'clasa-9';
    if (lectie.categorie === 'olimpiada') clasa = 'olimpici';
    else if (lectie.categorie === 'concepte') clasa = 'concepte';

    let anim = 'null';
    let animCustom = '';
    if (lectie.animatie) {
      if (['BubbleSortAnim', 'CautareBinaraAnim'].includes(lectie.animatie)) anim = lectie.animatie;
      else { anim = 'custom'; animCustom = lectie.animatie; }
    }

    setEditData({
      id: lectie.id, clasa, ordine: lectie.ordine || 1,
      titlu: lectie.titlu || '', descriere: lectie.descriere || '',
      teorie: lectie.teorie || '', cod: lectie.codCPlusPlus || '',
      codSimulatorCPP: lectie.codSimulatorCPP || '',
      anim, animCustom,
      pbRows: lectie.problemePbinfo?.length > 0 ? lectie.problemePbinfo : [{ id: '', titlu: '', url: '' }],
      quiz: lectie.quiz || Array(5).fill(0).map(() => ({ intrebare: '', variante: ['', '', '', ''], corect: 0 })),
      codeforces: lectie.codeforces || ['', ''],
    });
    setIsEditing(true);
    setActiveTab('adauga');
    toast.info(`Editare lecție: ${lectie.titlu}`);
  };

  // ── Aprobare propunere → precompletează formularul ──────────────────────────
  const sendUserNotification = async (userId, type, text) => {
    if (!userId) return;
    try {
      await addDoc(collection(db, 'users', userId, 'notifications'), {
        type, text, read: false, createdAt: serverTimestamp(),
      });
    } catch (e) { console.error(e); }
  };

  const handleApprovePropunere = (p) => {
    resetEdit();
    let clasa = 'clasa-9';
    if (p.clasa === 'a-IX-a') clasa = 'clasa-9';
    else if (p.clasa === 'a-X-a') clasa = 'clasa-10';
    else if (p.clasa === 'a-XI-a') clasa = 'clasa-11';
    else clasa = p.clasa || 'clasa-9';

    setEditData({
      id: '', clasa, ordine: 1,
      titlu: p.titlu || '',
      descriere: p.descriere?.trim()
        ? `${p.descriere.trim()} — by prof. ${p.numeAutorDorit}`
        : `by prof. ${p.numeAutorDorit}`,
      teorie: p.teorie || '',
      cod: p.codCPlusPlus || '',
      codSimulatorCPP: '',
      anim: 'null', animCustom: '',
      pbRows: [{ id: '', titlu: '', url: '' }],
      quiz: Array(5).fill(0).map(() => ({ intrebare: '', variante: ['', '', '', ''], corect: 0 })),
      codeforces: ['', ''],
    });
    setPropunereInCurs(p.id);
    setActiveTab('adauga');
    toast.info('Verifică și completează detaliile, apoi apasă Publică!');
  };

  const handleRejectPropunere = async (p) => {
    if (!window.confirm('Ești sigur că vrei să respingi și să ștergi această propunere?')) return;
    try {
      if (p.autorId) await sendUserNotification(p.autorId, 'lectie_respinsa', `Propunerea ta pentru lecția „${p.titlu}" a fost respinsă.`);
      await deleteDoc(doc(db, 'propuneri_lectii', p.id));
      toast.success('Propunere respinsă.');
      refreshData();
    } catch (e) { toast.error('Eroare: ' + e.message); }
  };

  // ── Render tab-uri ──────────────────────────────────────────────────────────
  const activeTodoCount = todos.filter((t) => !t.completed).length;
  const tabs = ['overview', 'utilizatori', 'aprobari', 'todo', 'lectii', 'adauga'];

  const tabLabel = (t) => ({
    overview: 'Prezentare generală',
    utilizatori: '👥 Utilizatori',
    aprobari: `Aprobări (${propuneri.length})`,
    todo: `📋 To-Do List (${activeTodoCount} active)`,
    lectii: 'Lecțiile mele',
    adauga: isEditing ? '📝 Editează lecția' : '➕ Adaugă lecție',
  }[t]);

  return (
    <div className="admin-wrapper">
      <header className="admin-header">
        <div className="admin-header-logo">InfoMotion<span>.</span> <em>Admin</em></div>
        <div className="admin-header-right">
          <span className="admin-user-pill">👤 {username}</span>
          <button className="admin-btn-logout" onClick={() => { onLogout(); toast.info('Te-ai deconectat.'); }}>
            Deconectare
          </button>
        </div>
      </header>

      <div className="admin-tabs-bar">
        {tabs.map((t) => (
          <button key={t} className={`admin-tab ${activeTab === t ? 'active' : ''}`} onClick={() => handleTabChange(t)}>
            {tabLabel(t)}
          </button>
        ))}
      </div>

      <main className="admin-main">
        {activeTab === 'overview' && <OverviewTab firebaseLessons={firebaseLessons} />}

        {activeTab === 'utilizatori' && <UtilizatoriTab firebaseUsers={firebaseUsers} />}

        {activeTab === 'aprobari' && (
          <div className="admin-card">
            <div className="admin-section-title">Lecții propuse de utilizatori</div>
            {propuneri.length === 0 ? (
              <div className="admin-empty-state">Nu există nicio lecție nouă în așteptare.</div>
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
                          <strong>Autor:</strong> {p.numeAutorDorit || p.emailAutor || 'Anonim'}<br />
                          <strong>Email:</strong> {p.emailAutor || 'Anonim'}
                        </div>
                      </div>
                      <div className="admin-approval-actions">
                        <button className="admin-btn-approve" onClick={() => handleApprovePropunere(p)}>Aprobă</button>
                        <button className="admin-btn-reject" onClick={() => handleRejectPropunere(p)}>Respinge</button>
                      </div>
                    </div>
                    <div className="admin-approval-section">
                      <div className="admin-approval-section-title">Teorie propusă</div>
                      <div className="admin-approval-text">{p.teorie}</div>
                    </div>
                    {p.codCPlusPlus && (
                      <div className="admin-approval-section">
                        <div className="admin-approval-section-title">Cod C++ propus</div>
                        <pre className="admin-approval-code"><code>{p.codCPlusPlus}</code></pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'todo' && (
          <TodoTab todos={todos} username={username} onRefresh={refreshData} />
        )}

        {activeTab === 'lectii' && (
          <LectiiTab firebaseLessons={firebaseLessons} onEdit={handleEdit} onRefresh={refreshData} />
        )}

        {activeTab === 'adauga' && (
          <AdaugaTab
            key={JSON.stringify(editData)}   /* re-mount la fiecare editare nouă */
            isEditing={isEditing}
            propunereInCurs={propunereInCurs}
            propuneri={propuneri}
            initialData={editData}
            onSuccess={() => {
              resetEdit();
              refreshData();
              setActiveTab('lectii');
            }}
            onCancel={() => {
              resetEdit();
              setActiveTab('lectii');
            }}
          />
        )}
      </main>
    </div>
  );
}

// ─── Root Export ────────────────────────────────────────────────────────────────
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