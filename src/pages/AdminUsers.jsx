import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner'; 
import '../pages_css/adminusers.css';
import usePageTitle from '../hooks/usePageTitle';

const ADMINS = [
  { username: import.meta.env.VITE_ADMIN_1_USER, password: import.meta.env.VITE_ADMIN_1_PASS },
  { username: import.meta.env.VITE_ADMIN_2_USER, password: import.meta.env.VITE_ADMIN_2_PASS },
  { username: import.meta.env.VITE_ADMIN_3_USER, password: import.meta.env.VITE_ADMIN_3_PASS },
  { username: import.meta.env.VITE_ADMIN_4_USER, password: import.meta.env.VITE_ADMIN_4_PASS }
];

const mascheazaEmail = (email) => {
  if (!email) return "-";
  const parts = email.split("@");
  const nume = parts[0];
  const domeniu = parts[1];

  if (parts.length !== 2) return email;
  if (nume.length <= 3) return `${nume[0]}***@${domeniu}`;
  
  return `${nume[0]}***${nume[nume.length - 1]}@${domeniu}`;
};

function AdminUsers() {
  usePageTitle("InfoMotion - AdminUsers");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [expandedUserId, setExpandedUserId] = useState(null); 
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");

  const [sortBy, setSortBy] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    } catch (error) {
      toast.error("Eroare la încărcarea utilizatorilor: " + error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthorized) fetchUsers();
  }, [isAuthorized]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const gasit = ADMINS.find(admin => admin.username === loginUser.trim() && admin.password === loginPass);
    if (gasit) {
      setIsAuthorized(true);
      toast.success("Bine ai revenit, adminule!");
    } else {
      toast.error("Utilizator sau parolă incorectă!");
    }
  };

  const handleEditClick = (user, e) => {
    e.stopPropagation(); 
    setEditUserId(user.id);
    setEditFormData({ ...user }); 
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
    }));
  };

  const handleComplexDataChange = (name, rawValue) => {
    setEditFormData(prev => ({
      ...prev,
      [name]: rawValue
    }));
  };

  const handleSaveClick = async (userId, e) => {
    if (e) e.stopPropagation();
    try {
      let finalData = { ...editFormData };
      
      if (typeof finalData.lectiiTerminate === 'string') {
        try { finalData.lectiiTerminate = JSON.parse(finalData.lectiiTerminate); } catch(e) {}
      }
      if (typeof finalData.statistici === 'string') {
        try { finalData.statistici = JSON.parse(finalData.statistici); } catch(e) {}
      }

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, finalData);
      
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...finalData } : u));
      setEditUserId(null);
      
      toast.success("Modificări salvate cu succes în Firestore!");
    } catch (error) {
      toast.error("Eroare la salvare: " + error.message);
    }
  };

  const toggleExpandUser = (userId) => {
    setExpandedUserId(expandedUserId === userId ? null : userId);
  };

  const getProcessedUsers = () => {
    let processed = [...users];

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase().trim();
      processed = processed.filter(u => {
        const usernameMatch = (u.nume || "").toLowerCase().includes(term);
        const cfMatch = (u.codeforcesHandle || "").toLowerCase().includes(term);
        return usernameMatch || cfMatch;
      });
    }

    if (sortBy === "teacher") {
      processed = processed.filter(u => u.role === "teacher");
    } else if (sortBy === "student") {
      processed = processed.filter(u => u.role === "student" || !u.role);
    }

    if (sortBy === "username") {
      processed.sort((a, b) => {
        const nameA = (a.nume || "").toLowerCase();
        const nameB = (b.nume || "").toLowerCase();
        return nameA.localeCompare(nameB);
      });
    }

    return processed;
  };

  const displayedUsers = getProcessedUsers();

  if (!isAuthorized) {
    return (
      <div className="admin-login-overlay">
        <form onSubmit={handleLoginSubmit} className="admin-login-form">
          <div className="login-header">
            <h2 className="login-title">InfoMotion<span>.</span></h2>
            <h3 className="login-subtitle">Panou de administrare</h3>
          </div>
          <div className="input-group">
            <label>Utilizator</label>
            <input type="text" className="login-input" placeholder="username" value={loginUser} onChange={(e) => setLoginUser(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Parolă</label>
            <input type="password" className="login-input" placeholder="••••••••" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} required />
          </div>
          <button type="submit" className="login-submit-btn">Intra in cont</button>
        </form>
      </div>
    );
  }

  if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Se încarcă baza de date...</div>;

  return (
    <div className="admin-panel-container">
      <div className="header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #378ADD', paddingBottom: '15px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Panou Admin Suprem - Gestiune Utilizatori</h2>
          <p style={{ margin: '5px 0 0 0', color: '#888', fontSize: '0.85rem' }}>Apasă pe orice rând pentru a vedea detaliile complete, rolul și lecțiile parcurse.</p>
        </div>
        <button onClick={() => { setIsAuthorized(false); toast.info("Deconectat din panou."); }} style={{ ...btnStyle, background: '#a12424', padding: '10px 16px' }}>Ieșire Panou</button>
      </div>

      <div className="controls-container" style={{ display: 'flex', flexDirection: 'column', gap: '15px', margin: '20px 0', background: '#1a1a24', padding: '15px', borderRadius: '6px', border: '1px solid #2d2d3d' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ color: '#378ADD', fontSize: '0.85rem', fontWeight: 'bold' }}>Caută rapid utilizator:</label>
          <input 
            type="text"
            placeholder="Introduceți Username sau Codeforces Handle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              background: '#0f0f14', 
              border: '1px solid #378ADD', 
              color: 'white', 
              padding: '10px 14px', 
              borderRadius: '4px', 
              width: '100%', 
              boxSizing: 'border-box',
              fontSize: '0.95rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ color: '#aaa', fontSize: '0.85rem', fontWeight: 'bold' }}>Filtre active:</span>
          <button onClick={() => setSortBy("all")} style={{ ...btnStyle, background: sortBy === "all" ? "#378ADD" : "#222", border: "1px solid #444" }}>Toți ({users.length})</button>
          <button onClick={() => setSortBy("username")} style={{ ...btnStyle, background: sortBy === "username" ? "#378ADD" : "#222", border: "1px solid #444" }}>După Username</button>
          <button onClick={() => setSortBy("teacher")} style={{ ...btnStyle, background: sortBy === "teacher" ? "#0d47a1" : "#222", border: "1px solid #444" }}>Doar Profesori</button>
          <button onClick={() => setSortBy("student")} style={{ ...btnStyle, background: sortBy === "student" ? "#1b5e20" : "#222", border: "1px solid #444" }}>Doar Elevi</button>
          {searchTerm && <span style={{ marginLeft: 'auto', color: '#639922', fontSize: '0.85rem', fontWeight: 'bold' }}>Găsiți: {displayedUsers.length} rezultate</span>}
        </div>
      </div>
      
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
          {displayedUsers.length > 0 ? (
            displayedUsers.map(user => {
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
                          <div className="detaliu-field" style={{ borderLeft: '3px solid #ffa500', paddingLeft: '8px' }}>
                            <span className="detaliu-label" style={{ color: '#ffa500' }}>Sold Monede Portofel</span>
                            {isEditing ? <input type="number" name="puncte" value={editFormData.puncte || 0} onChange={handleInputChange} style={{ ...inputStyle, borderColor: '#ffa500' }} /> : <span style={{ fontWeight: 'bold' }}>{user.puncte || 0} p</span>}
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
                            <span className="detaliu-label">Lecții terminate / Istoric parcurs (Format Brut JSON sau Array)</span>
                            {isEditing ? (
                              <textarea 
                                style={{ ...inputStyle, height: '80px', fontFamily: 'monospace', fontSize: '0.85rem' }}
                                value={typeof editFormData.lectiiTerminate === 'object' ? JSON.stringify(editFormData.lectiiTerminate) : editFormData.lectiiTerminate || "[]"}
                                onChange={(e) => handleComplexDataChange('lectiiTerminate', e.target.value)}
                                placeholder='Ex: ["lectia1", "lectia2"]'
                              />
                            ) : (
                              <pre style={{ margin: 0, fontSize: '0.8rem', color: '#aaa', overflowX: 'auto', background: '#111', padding: '8px', borderRadius: '4px' }}>
                                {user.lectiiTerminate ? JSON.stringify(user.lectiiTerminate) : "Nicio lecție parcursă momentan."}
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

      <div className="mobile-cards">
        {displayedUsers.length > 0 ? (
          displayedUsers.map(user => {
            const isEditing = editUserId === user.id;
            const isExpanded = expandedUserId === user.id;
            return (
              <div key={user.id} className="user-card" onClick={() => toggleExpandUser(user.id)} style={{ borderLeft: isExpanded ? '4px solid #639922' : '4px solid #378ADD' }}>
                <div className="card-row"><span className="card-label">Username:</span> <strong>{user.nume || "-"}</strong></div>
                <div className="card-row"><span className="card-label">Rol:</span> <span style={{ color: user.role === 'teacher' ? '#64b5f6' : '#81c784' }}>{user.role === 'teacher' ? 'Profesor' : 'Elev'}</span></div>
                <div className="card-row"><span className="card-label">Monede:</span> <span style={{ color: '#ffa500', fontWeight: 'bold' }}>{user.puncte || 0}</span></div>
                <div className="card-row"><span className="card-label">Email mascat:</span> <span>{mascheazaEmail(user.email)}</span></div>
                {isExpanded && (
                  <div style={{ marginTop: '10px', padding: '10px', background: '#111', borderRadius: '6px', fontSize: '0.85rem' }} onClick={(e) => e.stopPropagation()}>
                    <div className="card-row">
                      <span className="card-label">CF Handle:</span>
                      {isEditing ? <input type="text" name="codeforcesHandle" value={editFormData.codeforcesHandle || ""} onChange={handleInputChange} style={inputStyleMobile} /> : <span>{user.codeforcesHandle || "-"}</span>}
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
                      <span className="card-label" style={{ display: 'block', marginBottom: '4px' }}>Lecții Brute:</span>
                      {isEditing ? (
                        <textarea 
                          style={{ ...inputStyle, width: '100%', height: '60px', fontSize: '0.8rem' }}
                          value={typeof editFormData.lectiiTerminate === 'object' ? JSON.stringify(editFormData.lectiiTerminate) : editFormData.lectiiTerminate || "[]"}
                          onChange={(e) => handleComplexDataChange('lectiiTerminate', e.target.value)}
                        />
                      ) : (
                        <code style={{ fontSize: '0.75rem', color: '#999' }}>{JSON.stringify(user.lectiiTerminate || [])}</code>
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
    </div>
  );
}

const inputStyle = { background: '#111', border: '1px solid #444', color: 'white', padding: '8px', borderRadius: '4px', width: '100%', boxSizing: 'border-box' };
const inputStyleMobile = { background: '#111', border: '1px solid #444', color: 'white', padding: '4px 8px', borderRadius: '4px', width: '55%', textAlign: 'right' };
const btnStyle = { color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'opacity 0.2s' };

export default AdminUsers;