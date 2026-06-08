// Admin.jsx — Fișierul principal cu autentificare custom bazată pe Firestore
import { useState, useEffect } from 'react';
import '../pages_css/admin.css';
import { doc, collection, getDocs, addDoc, updateDoc, deleteDoc, getDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Toaster, toast } from 'sonner';
import usePageTitle from '../hooks/usePageTitle';

import OverviewTab from './admin/OverviewTab';
import UtilizatoriTab from './admin/UtilizatoriTab';
import TodoTab from './admin/TodoTab';
import LectiiTab from './admin/LectiiTab';
import AdaugaTab from './admin/AdaugaTab';

// ─── Login Screen (Verificare în Firestore) ───────────────────────────────────
function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // [COMPLEX AUTH]: Păstrăm input-ul exact așa cum a fost introdus de utilizator
    const exactUsername = username; 

    try {
      // Mergem direct la documentul din colecția securizată creată de tine
      const userRef = doc(db, 'conturi_admin', exactUsername);
      const userSnap = await userDocFetch(userRef);

      if (userSnap.exists() && userSnap.data().password === password) {
        onLogin({ username: exactUsername, password: password });
        toast.success(`Bine ai venit înapoi, ${exactUsername}! 🎉`);
      } else {
        toast.error('Username sau parolă incorectă!');
      }
    } catch (error) {
      console.error(error);
      toast.error('Eroare la autentificare. Contactează administratorul bazei de date.');
    } finally {
      setLoading(false);
    }
  };

  // Helper funcție internă pentru bypass reguli de read pe conturi_admin la login
  // Firebase are nevoie să citească doar acel document specific
  async function userDocFetch(ref) {
    return await getDoc(ref);
  }

  return (
    usePageTitle("InfoMotion - Admin"),
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <div className="admin-login-logo">InfoMotion<span>.</span></div>
        <p className="admin-login-subtitle">Panou de administrare securizat</p>
        <form onSubmit={handleLogin} className="admin-login-form">
          <div className="admin-field">
            <label>Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="" required disabled={loading} />
          </div>
          <div className="admin-field">
            <label>Parolă</label>
            <div className="admin-pass-wrap">
              <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="" required disabled={loading} />
              <button type="button" className="admin-show-pass" onClick={() => setShowPass((v) => !v)}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          <button type="submit" className="admin-btn-login" disabled={loading}>
            {loading ? 'Se verifică...' : 'Intră în cont'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ adminInfo, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const username = adminInfo.username;
  const adminPassword = adminInfo.password;

  // Date globale
  const [firebaseLessons, setFirebaseLessons] = useState([]);
  const [firebaseUsers, setFirebaseUsers] = useState([]);
  const [propuneri, setPropuneri] = useState([]);
  const [todos, setTodos] = useState([]);

  // Stare pentru tab-ul Adaugă
  const [isEditing, setIsEditing] = useState(false);
  const [propunereInCurs, setPropunereInCurs] = useState(null);
  const [editData, setEditData] = useState(null);

  const refreshData = async () => {
    try { const snapLectii = await getDocs(collection(db, 'lectii')); setFirebaseLessons(snapLectii.docs.map((d) => ({ id: d.id, ...d.data() }))); } catch (e) { console.error(e); }
    try { const snapUsers = await getDocs(collection(db, 'users')); setFirebaseUsers(snapUsers.docs.map((d) => ({ id: d.id, ...d.data() }))); } catch (e) { console.error(e); }
    try { const snapPropuneri = await getDocs(collection(db, 'propuneri_lectii')); setPropuneri(snapPropuneri.docs.map((d) => ({ id: d.id, ...d.data() })).filter((p) => p.status === 'in_asteptare')); } catch (e) { console.error(e); }
    try { const snapTodo = await getDocs(query(collection(db, 'admin_todo'), orderBy('createdAt', 'desc'))); setTodos(snapTodo.docs.map((d) => ({ id: d.id, ...d.data() }))); } catch (e) { console.error(e); }
  };

  useEffect(() => { refreshData(); }, [activeTab]);

  const resetEdit = () => { setIsEditing(false); setPropunereInCurs(null); setEditData(null); };
  const handleTabChange = (tab) => { setActiveTab(tab); if (tab !== 'adauga') resetEdit(); };

  const handleEdit = (lectie) => {
    let clasa = lectie.clasa || 'clasa-9';
    if (lectie.categorie === 'olimpiada') clasa = 'olimpici';
    else if (lectie.categorie === 'concepte') clasa = 'concepte';

    let anim = 'null'; let animCustom = '';
    if (lectie.animatie) {
      if (['BubbleSortAnim', 'CautareBinaraAnim'].includes(lectie.animatie)) anim = lectie.animatie;
      else { anim = 'custom'; animCustom = lectie.animatie; }
    }

    setEditData({
      id: lectie.id, clasa, ordine: lectie.ordine || 1,
      titlu: lectie.titlu || '', descriere: lectie.descriere || '',
      teorie: lectie.teorie || '', cod: lectie.codCPlusPlus || '',
      codSimulatorCPP: lectie.codSimulatorCPP || '', anim, animCustom,
      pbRows: lectie.problemePbinfo?.length > 0 ? lectie.problemePbinfo : [{ id: '', titlu: '', url: '' }],
      quiz: lectie.quiz || Array(5).fill(0).map(() => ({ intrebare: '', variante: ['', '', '', ''], corect: 0 })),
      codeforces: lectie.codeforces || ['', ''],
    });
    setIsEditing(true);
    setActiveTab('adauga');
  };

  const sendUserNotification = async (userId, type, text) => {
    if (!userId) return;
    try {
      await addDoc(collection(db, 'users', userId, 'notifications'), {
        type, text, read: false, createdAt: serverTimestamp(), 
        cheieSecuritate: adminPassword,
        adminUsername: username
      });
    } catch (e) { console.error(e); }
  };

  const handleApprovePropunere = (p) => {
    resetEdit();
    let clasa = p.clasa === 'a-IX-a' ? 'clasa-9' : p.clasa === 'a-X-a' ? 'clasa-10' : p.clasa === 'a-XI-a' ? 'clasa-11' : p.clasa || 'clasa-9';
    setEditData({
      id: '', clasa, ordine: 1, titlu: p.titlu || '',
      descriere: p.descriere?.trim() ? `${p.descriere.trim()} — by prof. ${p.numeAutorDorit}` : `by prof. ${p.numeAutorDorit}`,
      teorie: p.teorie || '', cod: p.codCPlusPlus || '', codSimulatorCPP: '', anim: 'null', animCustom: '',
      pbRows: [{ id: '', titlu: '', url: '' }], quiz: Array(5).fill(0).map(() => ({ intrebare: '', variante: ['', '', '', ''], corect: 0 })), codeforces: ['', ''],
    });
    setPropunereInCurs(p.id);
    setActiveTab('adauga');
  };

  const handleRejectPropunere = async (p) => {
    if (!window.confirm('Ești sigur că vrei să respingi și să ștergi această propunere?')) return;
    try {
      if (p.autorId) await sendUserNotification(p.autorId, 'lectie_respinsa', `Propunerea ta pentru lecția „${p.titlu}" a fost respinsă.`);
      const propRef = doc(db, 'propuneri_lectii', p.id);
      await updateDoc(propRef, { cheieSecuritate: adminPassword, adminUsername: username });
      await deleteDoc(propRef);
      toast.success('Propunere respinsă.');
      refreshData();
    } catch (e) { toast.error('Eroare permisiune: ' + e.message); }
  };

  const activeTodoCount = todos.filter((t) => !t.completed).length;
  return (
    <div className="admin-wrapper">
      <header className="admin-header">
        <div className="admin-header-logo">InfoMotion<span>.</span> <em>Admin</em></div>
        <div className="admin-header-right">
          <span className="admin-user-pill">👤 {username}</span>
          <button className="admin-btn-logout" onClick={() => { onLogout(); toast.info('Te-ai deconectat.'); }}>Deconectare</button>
        </div>
      </header>

      <div className="admin-tabs-bar">
        {['overview', 'utilizatori', 'aprobari', 'todo', 'lectii', 'adauga'].map((t) => (
          <button key={t} className={`admin-tab ${activeTab === t ? 'active' : ''}`} onClick={() => handleTabChange(t)}>
            { { overview: 'Prezentare generală', utilizatori: 'Utilizatori', aprobari: `Aprobări (${propuneri.length})`, todo: `To-Do (${activeTodoCount})`, lectii: 'Lecțiile mele', adauga: isEditing ? '📝 Editare' : '➕ Adaugă' }[t] }
          </button>
        ))}
      </div>

      <main className="admin-main">
        {activeTab === 'overview' && <OverviewTab firebaseLessons={firebaseLessons} />}
        {activeTab === 'utilizatori' && <UtilizatoriTab firebaseUsers={firebaseUsers} />}
        {activeTab === 'aprobari' && (
          <div className="admin-card">
            <div className="admin-section-title">Lecții propuse</div>
            {propuneri.length === 0 ? <div className="admin-empty-state">Nicio propunere.</div> : (
              <div className="admin-approvals-list">
                {propuneri.map((p) => (
                  <div key={p.id} className="admin-approval-card">
                    <div className="admin-approval-top">
                      <div>
                        <h3>{p.titlu}</h3>
                        <small>Autor: {p.numeAutorDorit}</small>
                      </div>
                      <div className="admin-approval-actions">
                        <button className="admin-btn-approve" onClick={() => handleApprovePropunere(p)}>Aprobă</button>
                        <button className="admin-btn-reject" onClick={() => handleRejectPropunere(p)}>Respinge</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'todo' && <TodoTab todos={todos} username={username} onRefresh={refreshData} adminPassword={adminPassword} adminUsername={username} />}
        {activeTab === 'lectii' && <LectiiTab firebaseLessons={firebaseLessons} onEdit={handleEdit} onRefresh={refreshData} adminPassword={adminPassword} adminUsername={username} />}
        {activeTab === 'adauga' && (
          <AdaugaTab
            key={JSON.stringify(editData)}
            isEditing={isEditing}
            propunereInCurs={propunereInCurs}
            propuneri={propuneri}
            initialData={editData}
            adminPassword={adminPassword}
            adminUsername={username}
            onSuccess={() => { resetEdit(); refreshData(); setActiveTab('lectii'); }}
            onCancel={() => { resetEdit(); setActiveTab('lectii'); }}
          />
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
      {!loggedUser ? <LoginScreen onLogin={setLoggedUser} /> : <Dashboard adminInfo={loggedUser} onLogout={() => setLoggedUser(null)} />}
    </>
  );
}