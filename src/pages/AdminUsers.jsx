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
    <div className="admin-login-overlay" style={{ background: '#f2f4f8' }}>
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
                color: '#6b7280',
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
          <p style={{ margin: '5px 0 0 0', color: '#6b7280', fontSize: '0.85rem' }}>Apasă pe orice rând pentru a vedea detaliile complete, rolul și lecțiile parcurse.</p>
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

      <div className="controls-container" style={{ display: 'flex', flexDirection: 'column', gap: '15px', margin: '20px 0', background: '#f9fafc', padding: '15px', borderRadius: '6px', border: '1px solid #e4e7ee' }}>
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
                background: '#f9fafc',
                border: '1px solid #378ADD',
                color: '#1c1f26',
                padding: '10px 14px',
                borderRadius: '4px',
                flex: 1,
                boxSizing: 'border-box',
                fontSize: '0.95rem'
              }}
            />
            <button type="submit" style={{ ...btnStyle, background: '#378ADD', padding: '10px 16px' }}>Caută</button>
            {activeSearch && (
              <button type="button" onClick={clearSearch} style={{ ...btnStyle, background: '#94a0b3', padding: '10px 16px' }}>
                Șterge
              </button>
            )}
          </div>
          {searchTruncated && (
            <span style={{ color: '#b26a00', fontSize: '0.8rem' }}>
              ⚠️ Căutarea a verificat primele {SEARCH_BATCH_LIMIT} rezultate (ordonate alfabetic) — s-ar putea să existe potriviri și mai departe. Rafinează căutarea dacă nu găsești userul.
            </span>
          )}
        </form>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 'bold' }}>Filtre active:</span>
          <button onClick={() => setSortBy("all")} style={{ ...btnStyle, background: sortBy === "all" ? "#378ADD" : "#eef1f6", border: "1px solid #dde1e9", color: sortBy === "all" ? "#ffffff" : "#1c1f26" }}>Toți ({sortBy === 'all' && !activeSearch ? totalCount : '...'})</button>
          <button onClick={() => setSortBy("teacher")} style={{ ...btnStyle, background: sortBy === "teacher" ? "#0d47a1" : "#eef1f6", border: "1px solid #dde1e9", color: sortBy === "teacher" ? "#ffffff" : "#1c1f26" }}>Doar Profesori</button>
          <button onClick={() => setSortBy("student")} style={{ ...btnStyle, background: sortBy === "student" ? "#1b5e20" : "#eef1f6", border: "1px solid #dde1e9", color: sortBy === "student" ? "#ffffff" : "#1c1f26" }}>Doar Elevi</button>
          {activeSearch && <span style={{ marginLeft: 'auto', color: '#639922', fontSize: '0.85rem', fontWeight: 'bold' }}>Găsiți: {totalCount} rezultate pentru "{activeSearch}"</span>}
        </div>
      </div>

      {loading && (
        <div style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>Se încarcă...</div>
      )}

      {!loading && (
      <table className="desktop-table">
        <thead>
          <tr style={{ background: '#f2f4f8', color: '#2c6fb3', textAlign: 'left' }}>
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
                  <tr className="clickable-row" onClick={() => toggleExpandUser(user.id)} style={{ borderBottom: '1px solid #eef0f4', background: isExpanded ? '#eef4fb' : 'transparent' }}>
                    <td style={{ padding: '12px', fontSize: '0.8rem', color: '#8a92a3' }}>{user.id.substring(0, 8)}... {isExpanded ? '▼' : '►'}</td>
                    <td style={{ padding: '12px' }}>{mascheazaEmail(user.email)}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{user.nume || "-"}</td>
                    <td style={{ padding: '12px' }}><span style={{ padding: '2px 8px', borderRadius: '4px', background: user.role === 'teacher' ? '#0d47a1' : '#1b5e20', color: '#ffffff', fontSize: '0.8rem' }}>{user.role === 'teacher' ? 'Profesor' : 'Elev'}</span></td>
                    <td style={{ padding: '12px' }}>{user.codeforcesHandle || "-"}</td>
                    <td style={{ padding: '12px', color: '#b8860b', fontWeight: 'bold' }}>{user.puncteTotale || 0}</td>
                    <td style={{ padding: '12px', color: '#c9770a', fontWeight: 'bold' }}>{user.puncte || 0}</td>
                    <td style={{ padding: '12px', color: '#d84315', fontWeight: 'bold' }}>{user.streakCount || 0}</td>
                    <td style={{ padding: '12px' }}>{user.cfValidat ? "Da" : "Nu"}</td>
                    <td style={{ padding: '12px' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button onClick={(e) => handleSaveClick(user.id, e)} style={{ ...btnStyle, background: '#639922' }}>Salvează</button>
                          <button onClick={(e) => { e.stopPropagation(); setEditUserId(null); }} style={{ ...btnStyle, background: '#94a0b3' }}>Anulează</button>
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
                              <pre style={{ margin: 0, fontSize: '0.8rem', color: '#4b5563', overflowX: 'auto', background: '#f4f6fa', padding: '8px', borderRadius: '4px', border: '1px solid #e9ebf1' }}>
                                {user.lectiiTerminate ? JSON.stringify(user.lectiiTerminate) : "Nicio lecție parcursă."}
                              </pre>
                            )}
                          </div>

                          <div className="detaliu-field" style={{ gridColumn: '1 / -1' }}>
                            <span className="detaliu-label" style={{ color: '#009688' }}>Teme Deblocate (Array JSON)</span>
                            {isEditing ? (
                              <textarea
                                style={{ ...inputStyle, height: '60px', fontFamily: 'monospace', fontSize: '0.85rem', borderColor: '#00cbaf' }}
                                value={typeof editFormData.temeDeblocate === 'object' ? JSON.stringify(editFormData.temeDeblocate) : editFormData.temeDeblocate || '["theme_default"]'}
                                onChange={(e) => handleComplexDataChange('temeDeblocate', e.target.value)}
                              />
                            ) : (
                              <pre style={{ margin: 0, fontSize: '0.8rem', color: '#009688', overflowX: 'auto', background: '#f0faf9', padding: '8px', borderRadius: '4px', border: '1px solid #d6f0ec' }}>
                                {user.temeDeblocate ? JSON.stringify(user.temeDeblocate) : '["theme_default"]'}
                              </pre>
                            )}
                          </div>
                        </div>

                        {isEditing && (
                          <div style={{ marginTop: '15px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button onClick={(e) => handleSaveClick(user.id, e)} style={{ ...btnStyle, background: '#639922', padding: '8px 20px' }}>Salvează Modificări Document</button>
                            <button onClick={(e) => { e.stopPropagation(); setEditUserId(null); }} style={{ ...btnStyle, background: '#94a0b3', padding: '8px 15px' }}>Renunță</button>
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
              <td colSpan="10" style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>Niciun utilizator găsit pentru criteriile introduse.</td>
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
                <div className="card-row"><span className="card-label">Rol:</span> <span style={{ color: user.role === 'teacher' ? '#1565c0' : '#2e7d32', fontWeight: 600 }}>{user.role === 'teacher' ? 'Profesor' : 'Elev'}</span></div>
                <div className="card-row"><span className="card-label">Monede:</span> <span style={{ color: '#c9770a', fontWeight: 'bold' }}>{user.puncte || 0}</span></div>
                <div className="card-row"><span className="card-label">Email mascat:</span> <span>{mascheazaEmail(user.email)}</span></div>

                {isExpanded && (
                  <div style={{ marginTop: '10px', padding: '10px', background: '#f9fafc', borderRadius: '6px', fontSize: '0.85rem', border: '1px solid #e9ebf1' }} onClick={(e) => e.stopPropagation()}>
                    <div className="card-row">
                      <span className="card-label">Puncte XP:</span>
                      {isEditing ? <input type="number" name="puncteTotale" value={editFormData.puncteTotale || 0} onChange={handleInputChange} style={inputStyleMobile} /> : <span>{user.puncteTotale || 0}</span>}
                    </div>

                    <div className="card-row">
                      <span className="card-label" style={{ color: '#c9770a' }}>Monede:</span>
                      {isEditing ? <input type="number" name="puncte" value={editFormData.puncte || 0} onChange={handleInputChange} style={{ ...inputStyleMobile, borderColor: '#c9770a' }} /> : <span>{user.puncte || 0}</span>}
                    </div>

                    <div className="card-row">
                      <span className="card-label">Streak:</span>
                      {isEditing ? <input type="number" name="streakCount" value={editFormData.streakCount || 0} onChange={handleInputChange} style={inputStyleMobile} /> : <span>{user.streakCount || 0}</span>}
                    </div>

                    <div style={{ marginTop: '10px' }}>
                      <span className="card-label" style={{ display: 'block', marginBottom: '4px', color: '#009688' }}>Teme Deblocate:</span>
                      {isEditing ? (
                        <textarea
                          style={{ ...inputStyle, width: '100%', height: '50px', fontSize: '0.8rem', borderColor: '#00cbaf' }}
                          value={typeof editFormData.temeDeblocate === 'object' ? JSON.stringify(editFormData.temeDeblocate) : editFormData.temeDeblocate || '["theme_default"]'}
                          onChange={(e) => handleComplexDataChange('temeDeblocate', e.target.value)}
                        />
                      ) : (
                        <code style={{ fontSize: '0.75rem', color: '#009688' }}>{JSON.stringify(user.temeDeblocate || ["theme_default"])}</code>
                      )}
                    </div>

                    <div className="card-actions">
                      {isEditing ? (
                        <>
                          <button onClick={(e) => handleSaveClick(user.id, e)} style={{ ...btnStyle, background: '#639922', flex: 1 }}>Salvează</button>
                          <button onClick={(e) => { e.stopPropagation(); setEditUserId(null); }} style={{ ...btnStyle, background: '#94a0b3', flex: 1 }}>Anulează</button>
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
          <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280', background: '#f9fafc', border: '1px solid #e4e7ee', borderRadius: '6px' }}>Niciun utilizator găsit pentru criteriile introduse.</div>
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
              background: currentPage === 1 ? '#e4e7ee' : '#378ADD',
              color: currentPage === 1 ? '#9aa3b2' : '#ffffff',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage === 1 ? 0.5 : 1
            }}
          >
            Înapoi
          </button>
          <span style={{ color: '#6b7280', fontSize: '0.9rem', fontWeight: 'bold' }}>
            Pagina {currentPage} din {totalPages} ({totalCount} useri)
          </span>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              ...btnStyle,
              background: currentPage === totalPages ? '#e4e7ee' : '#378ADD',
              color: currentPage === totalPages ? '#9aa3b2' : '#ffffff',
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
  background: '#f9fafc',
  border: '1px solid #dde1e9',
  color: '#1c1f26',
  padding: '8px',
  borderRadius: '4px',
  width: '100%',
  boxSizing: 'border-box'
};

const inputStyleMobile = {
  background: '#f9fafc',
  border: '1px solid #dde1e9',
  color: '#1c1f26',
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