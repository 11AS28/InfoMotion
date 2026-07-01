import React, { useEffect, useState, useCallback } from 'react';
import { db } from '../firebase';
import {
  collection,
  query,
  orderBy,
  where,
  limit,
  startAfter,
  getDocs,
  getCountFromServer,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { toast } from 'sonner';
import '../pages_css/adminusers.css';
import usePageTitle from '../hooks/usePageTitle';

/*
  ============================================================================
  DE CE S-A ÎNTÂMPLAT SPIKE-UL DE 5.5K READS
  ============================================================================
  Varianta veche făcea:
      const querySnapshot = await getDocs(collection(db, "users"));
  Asta citește ABSOLUT TOATE documentele din colecția "users", integral,
  de fiecare dată când se face login în panou / se reîncarcă pagina.
  Paginarea din UI (`.slice(indexOfFirstUser, indexOfLastUser)`) rula DUPĂ
  ce toată colecția era deja adusă în memorie — deci nu economisea niciun
  read, doar decidea ce se afișează pe ecran.

  Rezultat: N reads per login, unde N = nr. total de documente din "users".
  Cu React StrictMode (dublează efectele în dev) + câteva reload-uri/login-uri
  de test, ajungi rapid la mii de reads chiar dacă ești singurul user.

  ============================================================================
  CE FACE VERSIUNEA ASTA DIFERIT
  ============================================================================
  1. Browsing (fără căutare activă): interogare Firestore cu orderBy + limit(30)
     + startAfter(cursor). Se citesc DOAR cei 30 de useri afișați pe pagina
     curentă, niciodată toată colecția.
  2. Filtrul de rol (Profesor/Elev) se aplică ÎN interogare (where), nu în
     JS după ce ai adus totul.
  3. Numărul total de useri (pentru "Toți (X)" și paginare) vine din
     getCountFromServer() — costă 1 read indiferent cât de mare e colecția,
     NU N reads.
  4. Căutarea (nume / handle CF) NU se declanșează la fiecare tastă apăsată.
     Se declanșează doar la Enter / click pe "Caută", și e limitată la un
     batch de maxim 300 documente (configurabil via SEARCH_BATCH_LIMIT).
     Firestore nu are căutare de tip "conține substring" nativă — pentru
     căutare completă/nelimitată ai nevoie de un serviciu dedicat
     (Algolia, Typesense, Meilisearch) sincronizat cu Firestore, sau de
     un câmp suplimentar `nume_lower` + interogări de tip prefix.
     Varianta de aici e un compromis rezonabil ca cost, nu căutare globală
     perfectă pe colecții foarte mari.

  ============================================================================
  RECOMANDARE IMPORTANTĂ DE SCHEMĂ
  ============================================================================
  Interogarea `where('role', '==', 'teacher')` / filtrarea pe elevi
  presupune că fiecare document din "users" are câmpul `role` populat
  (implicit "student" dacă lipsește). Dacă ai documente vechi fără acest
  câmp, rulează o migrare unică (script separat, nu în acest fișier) care
  setează `role: "student"` acolo unde lipsește — altfel filtrul pe elevi
  riscă să nu prindă userii vechi fără câmp `role`.

  ============================================================================
  SECURITATE (pe lângă costul de reads)
  ============================================================================
  Am păstrat arhitectura din varianta "nouă": login prin /api/login (server),
  NU citire directă din client pe colecția conturi_admin. Varianta veche
  (getDoc direct pe conturi_admin din browser) cere reguli Firestore care
  permit oricui necunoscut să citească acel document ca să compare parola
  în client — practic parola de admin devine vizibilă oricui deschide
  DevTools. Nu reveni la asta.

  De asemenea: indiferent cât de bine paginăm din client, TREBUIE ca
  regulile Firestore (firestore.rules) să restricționeze cine poate citi/
  scrie colecția "users" — UI-ul ascuns nu e o măsură de securitate.
  ============================================================================
*/

const USERS_PER_PAGE = 30;
const SEARCH_BATCH_LIMIT = 300; 

function LoginScreen({ onLogin }) {
  usePageTitle("InfoMotion - AdminUsers Login");

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const exactUsername = username.trim();

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: exactUsername, password })
      });
      const result = await response.json();
      if (result.success) {
        onLogin({ username: result.username, password: result.sessionToken });
        toast.success(`Bine ai venit înapoi, ${exactUsername}! 🎉`);
      } else {
        toast.error('Username sau parolă incorectă!');
      }
    } catch (error) {
      console.error(error);
      toast.error('Eroare securitate. Nu ai permisiunea de a interoga baza de date conturi_admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-overlay" style={{ background: '#09090b' }}>
      <form onSubmit={handleLogin} className="admin-login-form">
        <div className="login-header">
          <h2 className="login-title">InfoMotion<span>.</span></h2>
          <h3 className="login-subtitle">Gestiune Utilizatori (Securizat)</h3>
        </div>

        <div className="input-group">
          <label>Utilizator Admin</label>
          <input
            type="text"
            className="login-input"
            placeholder="username admin"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="input-group">
          <label>Parolă Securizată</label>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type={showPass ? 'text' : 'password'}
              className="login-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              style={{ width: '100%' }}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#888',
                fontSize: '1.1rem'
              }}
            >
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <button type="submit" className="login-submit-btn" disabled={loading}>
          {loading ? 'Se verifică contul...' : 'Autorizează Panou'}
        </button>
      </form>
    </div>
  );
}

function AdminUsers() {
  usePageTitle("InfoMotion - AdminUsers");

  const [users, setUsers] = useState([]);            
  const [loading, setLoading] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [sortBy, setSortBy] = useState("all");        
  const [sortAlpha, setSortAlpha] = useState(false);   
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loggedAdmin, setLoggedAdmin] = useState(null);

  const [searchInput, setSearchInput] = useState('');       
  const [activeSearch, setActiveSearch] = useState('');     
  const [searchTruncated, setSearchTruncated] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [cursorStack, setCursorStack] = useState([null]); 
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.max(1, Math.ceil(totalCount / USERS_PER_PAGE));

  useEffect(() => {
    setCurrentPage(1);
    setCursorStack([null]);
  }, [sortBy, sortAlpha, activeSearch]);

  const buildBaseConstraints = useCallback(() => {
    const constraints = [];
    if (sortBy === 'teacher') constraints.push(where('role', '==', 'teacher'));
    if (sortBy === 'student') constraints.push(where('role', '==', 'student'));
    constraints.push(orderBy('nume'));
    return constraints;
  }, [sortBy]);

  const fetchCount = useCallback(async () => {
    try {
      const constraints = buildBaseConstraints().filter(c => c.type !== 'orderBy'); 
      const q = constraints.length ? query(collection(db, 'users'), ...constraints) : collection(db, 'users');
      const snap = await getCountFromServer(q);
      setTotalCount(snap.data().count);
    } catch (error) {
      console.error(error);
    }
  }, [buildBaseConstraints]);

  const fetchPage = useCallback(async (pageNumber) => {
    setLoading(true);
    try {
      const constraints = buildBaseConstraints();
      const cursor = cursorStack[pageNumber - 1] ?? null;

      let q = query(collection(db, 'users'), ...constraints, limit(USERS_PER_PAGE));
      if (cursor) q = query(q, startAfter(cursor));

      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setUsers(list);

      const lastDoc = snap.docs[snap.docs.length - 1] || null;
      setCursorStack((prev) => {
        if (prev[pageNumber]) return prev; 
        const next = [...prev];
        next[pageNumber] = lastDoc;
        return next;
      });
    } catch (error) {
      toast.error("Eroare la încărcarea utilizatorilor: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [buildBaseConstraints, cursorStack]);

  const runSearch = useCallback(async (term) => {
    setLoading(true);
    try {
      const constraints = buildBaseConstraints();
      const q = query(collection(db, 'users'), ...constraints, limit(SEARCH_BATCH_LIMIT));
      const snap = await getDocs(q);
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const t = term.toLowerCase().trim();
      const filtered = all.filter((u) => {
        const nameMatch = (u.nume || '').toLowerCase().includes(t);
        const cfMatch = (u.codeforcesHandle || '').toLowerCase().includes(t);
        return nameMatch || cfMatch;
      });

      setUsers(filtered.slice(0, USERS_PER_PAGE));
      setTotalCount(filtered.length);
      setSearchTruncated(snap.docs.length === SEARCH_BATCH_LIMIT);
    } catch (error) {
      toast.error("Eroare la căutare: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [buildBaseConstraints]);

  useEffect(() => {
    if (!isAuthorized) return;
    if (activeSearch) {
      runSearch(activeSearch);
    } else {
      fetchCount();
      fetchPage(currentPage);
    }
  }, [isAuthorized, currentPage, sortBy, activeSearch]);

  useEffect(() => {
    document.body.classList.add('admin-layout-activ');
    return () => document.body.classList.remove('admin-layout-activ');
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveSearch(searchInput.trim());
  };

  const clearSearch = () => {
    setSearchInput('');
    setActiveSearch('');
    setSearchTruncated(false);
  };

  const handleEditClick = (user, e) => {
    e.stopPropagation();
    setEditUserId(user.id);
    setEditFormData({ ...user });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
  };

  const handleComplexDataChange = (name, rawValue) => {
    setEditFormData((prev) => ({
      ...prev,
      [name]: rawValue
    }));
  };

  const handleSaveClick = async (userId, e) => {
    if (e) e.stopPropagation();

    try {
      let finalData = { ...editFormData };

      if (typeof finalData.lectiiTerminate === 'string') {
        try { finalData.lectiiTerminate = JSON.parse(finalData.lectiiTerminate); } catch { }
      }
      if (typeof finalData.statistici === 'string') {
        try { finalData.statistici = JSON.parse(finalData.statistici); } catch { }
      }
      if (typeof finalData.temeDeblocate === 'string') {
        try { finalData.temeDeblocate = JSON.parse(finalData.temeDeblocate); } catch { }
      }

      finalData.cheieSecuritate = loggedAdmin.password;
      finalData.adminUsername = loggedAdmin.username;

      await fetch('/api/admin', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_user',
          username: loggedAdmin.username, sessionToken: loggedAdmin.password,
          data: { targetId: userId, fields: finalData }
        })
      });

      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...finalData } : u)));
      setEditUserId(null);
      toast.success("Modificări salvate cu succes în Firestore!");
    } catch (error) {
      toast.error("Eroare la salvare: " + error.message);
    }
  };

  const toggleExpandUser = (userId) => {
    setExpandedUserId((prev) => (prev === userId ? null : userId));
  };

  const mascheazaEmail = (email) => {
    if (!email) return "-";
    const parts = email.split("@");
    if (parts.length !== 2) return email;
    const nume = parts[0];
    const domeniu = parts[1];
    if (nume.length <= 3) return `${nume[0]}***@${domeniu}`;
    return `${nume[0]}***${nume[nume.length - 1]}@${domeniu}`;
  };

  const goToPage = (p) => {
    if (p < 1 || p > totalPages || activeSearch) return;
    setCurrentPage(p);
  };

  if (!isAuthorized) {
    return (
      <LoginScreen
        onLogin={(adminData) => {
          setLoggedAdmin(adminData);
          setIsAuthorized(true);
        }}
      />
    );
  }

  return (
    <div className="admin-panel-container">
      <div className="header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #378ADD', paddingBottom: '15px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Panou Admin Suprem - Gestiune Utilizatori</h2>
          <p style={{ margin: '5px 0 0 0', color: '#888', fontSize: '0.85rem' }}>Apasă pe orice rând pentru a vedea detaliile complete, rolul și lecțiile parcurse.</p>
        </div>
        <button
          onClick={() => {
            setLoggedAdmin(null);
            setIsAuthorized(false);
            toast.info("Sesiune admin închisă.");
          }}
          style={{ ...btnStyle, background: '#a12424', padding: '10px 16px' }}
        >
          Ieșire Panou
        </button>
      </div>

      <div className="controls-container" style={{ display: 'flex', flexDirection: 'column', gap: '15px', margin: '20px 0', background: '#1a1a24', padding: '15px', borderRadius: '6px', border: '1px solid #2d2d3d' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ color: '#378ADD', fontSize: '0.85rem', fontWeight: 'bold' }}>
            Caută utilizator (Enter sau butonul "Caută" — nu se declanșează automat, ca să nu consume citiri inutil):
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Introduceți Username sau Codeforces Handle..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{
                background: '#0f0f14',
                border: '1px solid #378ADD',
                color: 'white',
                padding: '10px 14px',
                borderRadius: '4px',
                flex: 1,
                boxSizing: 'border-box',
                fontSize: '0.95rem'
              }}
            />
            <button type="submit" style={{ ...btnStyle, background: '#378ADD', padding: '10px 16px' }}>Caută</button>
            {activeSearch && (
              <button type="button" onClick={clearSearch} style={{ ...btnStyle, background: '#555', padding: '10px 16px' }}>
                Șterge
              </button>
            )}
          </div>
          {searchTruncated && (
            <span style={{ color: '#ffa500', fontSize: '0.8rem' }}>
              ⚠️ Căutarea a verificat primele {SEARCH_BATCH_LIMIT} rezultate (ordonate alfabetic) — s-ar putea să existe potriviri și mai departe. Rafinează căutarea dacă nu găsești userul.
            </span>
          )}
        </form>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ color: '#aaa', fontSize: '0.85rem', fontWeight: 'bold' }}>Filtre active:</span>
          <button onClick={() => setSortBy("all")} style={{ ...btnStyle, background: sortBy === "all" ? "#378ADD" : "#222", border: "1px solid #444" }}>Toți ({sortBy === 'all' && !activeSearch ? totalCount : '...'})</button>
          <button onClick={() => setSortBy("teacher")} style={{ ...btnStyle, background: sortBy === "teacher" ? "#0d47a1" : "#222", border: "1px solid #444" }}>Doar Profesori</button>
          <button onClick={() => setSortBy("student")} style={{ ...btnStyle, background: sortBy === "student" ? "#1b5e20" : "#222", border: "1px solid #444" }}>Doar Elevi</button>
          {activeSearch && <span style={{ marginLeft: 'auto', color: '#639922', fontSize: '0.85rem', fontWeight: 'bold' }}>Găsiți: {totalCount} rezultate pentru "{activeSearch}"</span>}
        </div>
      </div>

      {loading && (
        <div style={{ color: '#aaa', textAlign: 'center', padding: '20px' }}>Se încarcă...</div>
      )}

      {!loading && (
      <table className="desktop-table">
        <thead>
          <tr style={{ background: '#25252d', color: '#378ADD', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>UID</th>
            <th style={{ padding: '12px' }}>Email</th>
            <th style={{ padding: '12px' }}>Username</th>
            <th style={{ padding: '12px' }}>Rol</th>
            <th style={{ padding: '12px' }}>CF Handle</th>
            <th style={{ padding: '12px' }}>XP</th>
            <th style={{ padding: '12px' }}>Monede</th>
            <th style={{ padding: '12px' }}>Streak</th>
            <th style={{ padding: '12px' }}>CF Validat</th>
            <th style={{ padding: '12px' }}>Acțiuni</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => {
              const isEditing = editUserId === user.id;
              const isExpanded = expandedUserId === user.id;
              return (
                <React.Fragment key={user.id}>
                  <tr className="clickable-row" onClick={() => toggleExpandUser(user.id)} style={{ borderBottom: '1px solid #333', background: isExpanded ? '#15151a' : 'transparent' }}>
                    <td style={{ padding: '12px', fontSize: '0.8rem', color: '#666' }}>{user.id.substring(0, 8)}... {isExpanded ? '▼' : '►'}</td>
                    <td style={{ padding: '12px' }}>{mascheazaEmail(user.email)}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{user.nume || "-"}</td>
                    <td style={{ padding: '12px' }}><span style={{ padding: '2px 6px', borderRadius: '4px', background: user.role === 'teacher' ? '#0d47a1' : '#1b5e20', fontSize: '0.8rem' }}>{user.role === 'teacher' ? 'Profesor' : 'Elev'}</span></td>
                    <td style={{ padding: '12px' }}>{user.codeforcesHandle || "-"}</td>
                    <td style={{ padding: '12px', color: '#ffd700' }}>{user.puncteTotale || 0}</td>
                    <td style={{ padding: '12px', color: '#ffa500', fontWeight: 'bold' }}>{user.puncte || 0}</td>
                    <td style={{ padding: '12px', color: '#ff4500' }}>{user.streakCount || 0}</td>
                    <td style={{ padding: '12px' }}>{user.cfValidat ? "Da" : "Nu"}</td>
                    <td style={{ padding: '12px' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button onClick={(e) => handleSaveClick(user.id, e)} style={{ ...btnStyle, background: '#639922' }}>Salvează</button>
                          <button onClick={(e) => { e.stopPropagation(); setEditUserId(null); }} style={{ ...btnStyle, background: '#555' }}>Anulează</button>
                        </div>
                      ) : (
                        <button onClick={(e) => handleEditClick(user, e)} style={{ ...btnStyle, background: '#378ADD' }}>Editează rapid</button>
                      )}
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr>
                      <td colSpan="10" className="expanded-zone">
                        <h4 style={{ margin: '0 0 15px 0', color: '#378ADD', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Date Complete Document Firestore (UID: {user.id})</span>
                          {isEditing && <span style={{ color: '#639922', fontSize: '0.9rem' }}>⚠️ Ești în modul de editare activă</span>}
                        </h4>

                        <div className="grid-detalii">
                          <div className="detaliu-field">
                            <span className="detaliu-label">Nume Complet / Username</span>
                            {isEditing ? <input type="text" name="nume" value={editFormData.nume || ""} onChange={handleInputChange} style={inputStyle} /> : <span>{user.nume || "-"}</span>}
                          </div>

                          <div className="detaliu-field">
                            <span className="detaliu-label">Rol Sistem</span>
                            {isEditing ? (
                              <select name="role" value={editFormData.role || "student"} onChange={handleInputChange} style={inputStyle}>
                                <option value="student">student (Elev)</option>
                                <option value="teacher">teacher (Profesor)</option>
                              </select>
                            ) : <span>{user.role || "student"}</span>}
                          </div>

                          <div className="detaliu-field">
                            <span className="detaliu-label">Codeforces Handle</span>
                            {isEditing ? <input type="text" name="codeforcesHandle" value={editFormData.codeforcesHandle || ""} onChange={handleInputChange} style={inputStyle} /> : <span>{user.codeforcesHandle || "-"}</span>}
                          </div>

                          <div className="detaliu-field">
                            <span className="detaliu-label">CF Validat Status</span>
                            {isEditing ? <input type="checkbox" name="cfValidat" checked={editFormData.cfValidat || false} onChange={handleInputChange} /> : <span>{user.cfValidat ? "Aprobat" : "Fals / Neaprobat"}</span>}
                          </div>

                          <div className="detaliu-field">
                            <span className="detaliu-label">Puncte XP Totale</span>
                            {isEditing ? <input type="number" name="puncteTotale" value={editFormData.puncteTotale || 0} onChange={handleInputChange} style={inputStyle} /> : <span>{user.puncteTotale || 0} xp</span>}
                          </div>

                          <div className="detaliu-field">
                            <span className="detaliu-label">Sold Monede Portofel</span>
                            {isEditing ? <input type="number" name="puncte" value={editFormData.puncte || 0} onChange={handleInputChange} style={inputStyle} /> : <span style={{ fontWeight: 'bold' }}>{user.puncte || 0} p</span>}
                          </div>

                          <div className="detaliu-field">
                            <span className="detaliu-label">Puncte Portofel Magazin (Coins)</span>
                            {isEditing ? <input type="number" name="puncteMagazin" value={editFormData.puncteMagazin || 0} onChange={handleInputChange} style={inputStyle} /> : <span>{user.puncteMagazin || 0} puncte</span>}
                          </div>

                          <div className="detaliu-field">
                            <span className="detaliu-label">Streak Autentificare</span>
                            {isEditing ? <input type="number" name="streakCount" value={editFormData.streakCount || 0} onChange={handleInputChange} style={inputStyle} /> : <span>{user.streakCount || 0} zile</span>}
                          </div>

                          <div className="detaliu-field">
                            <span className="detaliu-label">Probleme Rezolvate Arenă (Count)</span>
                            {isEditing ? <input type="number" name="problemeRezolvateCount" value={editFormData.problemeRezolvateCount || 0} onChange={handleInputChange} style={inputStyle} /> : <span>{user.problemeRezolvateCount || 0} pb</span>}
                          </div>

                          <div className="detaliu-field">
                            <span className="detaliu-label">Ultima Logare (Data Streak)</span>
                            {isEditing ? <input type="text" name="lastLoginDate" value={editFormData.lastLoginDate || ""} onChange={handleInputChange} style={inputStyle} /> : <span>{user.lastLoginDate || "-"}</span>}
                          </div>

                          <div className="detaliu-field" style={{ gridColumn: '1 / -1' }}>
                            <span className="detaliu-label">Lecții terminate (Array JSON)</span>
                            {isEditing ? (
                              <textarea
                                style={{ ...inputStyle, height: '60px', fontFamily: 'monospace', fontSize: '0.85rem' }}
                                value={typeof editFormData.lectiiTerminate === 'object' ? JSON.stringify(editFormData.lectiiTerminate) : editFormData.lectiiTerminate || "[]"}
                                onChange={(e) => handleComplexDataChange('lectiiTerminate', e.target.value)}
                              />
                            ) : (
                              <pre style={{ margin: 0, fontSize: '0.8rem', color: '#aaa', overflowX: 'auto', background: '#111', padding: '8px', borderRadius: '4px' }}>
                                {user.lectiiTerminate ? JSON.stringify(user.lectiiTerminate) : "Nicio lecție parcursă."}
                              </pre>
                            )}
                          </div>

                          <div className="detaliu-field" style={{ gridColumn: '1 / -1' }}>
                            <span className="detaliu-label" style={{ color: '#00cbaf' }}>Teme Deblocate (Array JSON)</span>
                            {isEditing ? (
                              <textarea
                                style={{ ...inputStyle, height: '60px', fontFamily: 'monospace', fontSize: '0.85rem', borderColor: '#00cbaf' }}
                                value={typeof editFormData.temeDeblocate === 'object' ? JSON.stringify(editFormData.temeDeblocate) : editFormData.temeDeblocate || '["theme_default"]'}
                                onChange={(e) => handleComplexDataChange('temeDeblocate', e.target.value)}
                              />
                            ) : (
                              <pre style={{ margin: 0, fontSize: '0.8rem', color: '#00cbaf', overflowX: 'auto', background: '#111', padding: '8px', borderRadius: '4px' }}>
                                {user.temeDeblocate ? JSON.stringify(user.temeDeblocate) : '["theme_default"]'}
                              </pre>
                            )}
                          </div>
                        </div>

                        {isEditing && (
                          <div style={{ marginTop: '15px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button onClick={(e) => handleSaveClick(user.id, e)} style={{ ...btnStyle, background: '#639922', padding: '8px 20px' }}>Salvează Modificări Document</button>
                            <button onClick={(e) => { e.stopPropagation(); setEditUserId(null); }} style={{ ...btnStyle, background: '#555', padding: '8px 15px' }}>Renunță</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })
          ) : (
            <tr>
              <td colSpan="10" style={{ textAlign: 'center', padding: '30px', color: '#aaa' }}>Niciun utilizator găsit pentru criteriile introduse.</td>
            </tr>
          )}
        </tbody>
      </table>
      )}

      {!loading && (
      <div className="mobile-cards">
        {users.length > 0 ? (
          users.map((user) => {
            const isEditing = editUserId === user.id;
            const isExpanded = expandedUserId === user.id;
            return (
              <div
                key={user.id}
                className="user-card"
                onClick={() => toggleExpandUser(user.id)}
                style={{ borderLeft: isExpanded ? '4px solid #639922' : '4px solid #378ADD' }}
              >
                <div className="card-row"><span className="card-label">Username:</span> <strong>{user.nume || "-"}</strong></div>
                <div className="card-row"><span className="card-label">Rol:</span> <span style={{ color: user.role === 'teacher' ? '#64b5f6' : '#81c784' }}>{user.role === 'teacher' ? 'Profesor' : 'Elev'}</span></div>
                <div className="card-row"><span className="card-label">Monede:</span> <span style={{ color: '#ffa500', fontWeight: 'bold' }}>{user.puncte || 0}</span></div>
                <div className="card-row"><span className="card-label">Email mascat:</span> <span>{mascheazaEmail(user.email)}</span></div>

                {isExpanded && (
                  <div style={{ marginTop: '10px', padding: '10px', background: '#111', borderRadius: '6px', fontSize: '0.85rem' }} onClick={(e) => e.stopPropagation()}>
                    <div className="card-row">
                      <span className="card-label">Bani Shop:</span>
                      {isEditing ? <input type="number" name="puncteMagazin" value={editFormData.puncteMagazin || 0} onChange={handleInputChange} style={{ ...inputStyleMobile, color: '#ffb833' }} /> : <span style={{ color: '#ffb833' }}>{user.puncteMagazin || 0}</span>}
                    </div>

                    <div className="card-row">
                      <span className="card-label">Puncte XP:</span>
                      {isEditing ? <input type="number" name="puncteTotale" value={editFormData.puncteTotale || 0} onChange={handleInputChange} style={inputStyleMobile} /> : <span>{user.puncteTotale || 0}</span>}
                    </div>

                    <div className="card-row">
                      <span className="card-label" style={{ color: '#ffa500' }}>Monede:</span>
                      {isEditing ? <input type="number" name="puncte" value={editFormData.puncte || 0} onChange={handleInputChange} style={{ ...inputStyleMobile, borderColor: '#ffa500' }} /> : <span>{user.puncte || 0}</span>}
                    </div>

                    <div className="card-row">
                      <span className="card-label">Streak:</span>
                      {isEditing ? <input type="number" name="streakCount" value={editFormData.streakCount || 0} onChange={handleInputChange} style={inputStyleMobile} /> : <span>{user.streakCount || 0}</span>}
                    </div>

                    <div style={{ marginTop: '10px' }}>
                      <span className="card-label" style={{ display: 'block', marginBottom: '4px', color: '#00cbaf' }}>Teme Deblocate:</span>
                      {isEditing ? (
                        <textarea
                          style={{ ...inputStyle, width: '100%', height: '50px', fontSize: '0.8rem', borderColor: '#00cbaf' }}
                          value={typeof editFormData.temeDeblocate === 'object' ? JSON.stringify(editFormData.temeDeblocate) : editFormData.temeDeblocate || '["theme_default"]'}
                          onChange={(e) => handleComplexDataChange('temeDeblocate', e.target.value)}
                        />
                      ) : (
                        <code style={{ fontSize: '0.75rem', color: '#00cbaf' }}>{JSON.stringify(user.temeDeblocate || ["theme_default"])}</code>
                      )}
                    </div>

                    <div className="card-actions">
                      {isEditing ? (
                        <>
                          <button onClick={(e) => handleSaveClick(user.id, e)} style={{ ...btnStyle, background: '#639922', flex: 1 }}>Salvează</button>
                          <button onClick={(e) => { e.stopPropagation(); setEditUserId(null); }} style={{ ...btnStyle, background: '#555', flex: 1 }}>Anulează</button>
                        </>
                      ) : (
                        <button onClick={(e) => handleEditClick(user, e)} style={{ ...btnStyle, background: '#378ADD', width: '100%' }}>Editează Datele</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', color: '#aaa', background: '#1a1a24', borderRadius: '6px' }}>Niciun utilizator găsit pentru criteriile introduse.</div>
        )}
      </div>
      )}

      {!activeSearch && totalPages > 1 && (
        <div className="pagination-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', margin: '20px 0' }}>
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              ...btnStyle,
              background: currentPage === 1 ? '#333' : '#378ADD',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage === 1 ? 0.5 : 1
            }}
          >
            Înapoi
          </button>
          <span style={{ color: '#aaa', fontSize: '0.9rem', fontWeight: 'bold' }}>
            Pagina {currentPage} din {totalPages} ({totalCount} useri)
          </span>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              ...btnStyle,
              background: currentPage === totalPages ? '#333' : '#378ADD',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage === totalPages ? 0.5 : 1
            }}
          >
            Înainte
          </button>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  background: '#111',
  border: '1px solid #444',
  color: 'white',
  padding: '8px',
  borderRadius: '4px',
  width: '100%',
  boxSizing: 'border-box'
};

const inputStyleMobile = {
  background: '#111',
  border: '1px solid #444',
  color: 'white',
  padding: '4px 8px',
  borderRadius: '4px',
  width: '55%',
  textAlign: 'right'
};

const btnStyle = {
  color: 'white',
  border: 'none',
  padding: '6px 12px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '0.85rem',
  transition: 'opacity 0.2s'
};

export default AdminUsers;