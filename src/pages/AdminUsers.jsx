import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const ADMINS = [
  { username: import.meta.env.VITE_ADMIN_1_USER, password: import.meta.env.VITE_ADMIN_1_PASS },
  { username: import.meta.env.VITE_ADMIN_2_USER, password: import.meta.env.VITE_ADMIN_2_PASS },
  { username: import.meta.env.VITE_ADMIN_3_USER, password: import.meta.env.VITE_ADMIN_3_PASS },
  { username: import.meta.env.VITE_ADMIN_4_USER, password: import.meta.env.VITE_ADMIN_4_PASS }
];

const mascheazaEmail = (email) => {
  const parts = email.split("@");
  const nume = parts[0];
  const domeniu = parts[1];

  if (!email)  return "-";
  if (parts.length !== 2) return email;
  if (nume.length <= 3) return `${nume[0]}***@${domeniu}`;
  
  return `${nume[0]}***${nume[nume.length - 1]}@${domeniu}`;
};

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [expandedUserId, setExpandedUserId] = useState(null); 
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    } catch (error) {
      alert("Eroare la încărcarea utilizatorilor: " + error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthorized) fetchUsers();
  }, [isAuthorized]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError("");
    const gasit = ADMINS.find(admin => admin.username === loginUser.trim() && admin.password === loginPass);
    if (gasit) setIsAuthorized(true);
    else setLoginError("Utilizator sau parolă incorectă!");
  };

  // ✅ Inițializează formularul cu absolutamente toate câmpurile din document
  const handleEditClick = (user, e) => {
    e.stopPropagation(); // Previne deschiderea/închiderea tab-ului de detalii la click pe buton
    setEditUserId(user.id);
    setEditFormData({ ...user }); // Copiază absolut tot obiectul din Firestore
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
    }));
  };

  // ✅ Permite modificarea directă a textului JSON brut pentru array-uri / obiecte (ex: lectiiTerminate)
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
      
      // ✅ Încercăm să parsăm câmpurile care ar putea fi salvate ca text-JSON în interfață (ex: array-uri de lecții parcurse)
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
      alert("Modificări salvate cu succes în Firestore!");
    } catch (error) {
      alert("Eroare la salvare: " + error.message);
    }
  };

  const toggleExpandUser = (userId) => {
    setExpandedUserId(expandedUserId === userId ? null : userId);
  };

  if (!isAuthorized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', fontFamily: 'sans-serif', padding: '20px' }}>
        <form onSubmit={handleLoginSubmit} style={{ background: '#1a1a20', padding: '30px', borderRadius: '12px', border: '1px solid #333', width: '100%', maxWidth: '340px', boxSizing: 'border-box', textAlign: 'center' }}>
          <h3 style={{ color: '#378ADD', marginBottom: '20px' }}>🔒 Restricționat Admin</h3>
          <input type="text" placeholder="Username Admin" value={loginUser} onChange={(e) => setLoginUser(e.target.value)} style={{ ...inputStyle, width: '100%', marginBottom: '15px', boxSizing: 'border-box' }} required />
          <input type="password" placeholder="Parolă" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} style={{ ...inputStyle, width: '100%', marginBottom: '20px', boxSizing: 'border-box' }} required />
          {loginError && <p style={{ color: '#ff4500', fontSize: '0.85rem', margin: '0 0 15px 0' }}>{loginError}</p>}
          <button type="submit" style={{ ...btnStyle, background: '#378ADD', width: '100%', padding: '12px' }}>Autentificare</button>
        </form>
      </div>
    );
  }

  if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Se încarcă baza de date...</div>;

  return (
    <div style={{ maxWidth: '1400px', margin: '20px auto', padding: '15px', color: 'white', fontFamily: 'sans-serif' }}>
      
      <style>{`
        .desktop-table { display: table; width: 100%; border-collapse: collapse; margin-top: 20px; background: #1a1a20; border-radius: 8px; overflow: hidden; }
        .mobile-cards { display: none; }
        .clickable-row { cursor: pointer; transition: background 0.2s; }
        .clickable-row:hover { background: rgba(255,255,255,0.03) !important; }
        .expanded-zone { background: #15151a; padding: 20px; border-bottom: 2px solid #378ADD; }
        .grid-detalii { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px; margin-top: 10px; }
        .detaliu-field { background: #1e1e24; padding: 10px; borderRadius: 6px; border: 1px solid #2d2d35; display: flex; flex-direction: column; gap: 5px; }
        .detaliu-label { color: #378ADD; font-size: 0.8rem; font-weight: bold; text-transform: uppercase; }
        
        @media (max-width: 950px) {
          .desktop-table { display: none; }
          .mobile-cards { display: block; margin-top: 20px; }
          .user-card { background: #1a1a20; border: 1px solid #333; border-radius: 8px; padding: 15px; margin-bottom: 15px; cursor: pointer; }
          .card-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9rem; border-bottom: 1px solid #25252d; padding-bottom: 4px; align-items: center; }
          .card-label { color: #378ADD; font-weight: bold; }
          .card-actions { display: flex; gap: 10px; margin-top: 15px; }
          .header-container { flex-direction: column; gap: 15px; align-items: flex-start !important; }
        }
      `}</style>

      <div className="header-container" style={{ display: 'flex', justify: 'space-between', alignItems: 'center', borderBottom: '2px solid #378ADD', paddingBottom: '15px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>🛠️ Panou Admin Suprem - Gestiune Utilizatori</h2>
          <p style={{ margin: '5px 0 0 0', color: '#888', fontSize: '0.85rem' }}>Apasă pe orice rând pentru a vedea detaliile complete, rolul și lecțiile parcurse.</p>
        </div>
        <button onClick={() => setIsAuthorized(false)} style={{ ...btnStyle, background: '#a12424', padding: '10px 16px' }}>Ieșire Panou</button>
      </div>
      
      {/* --- DESKTOP TABLE --- */}
      <table className="desktop-table">
        <thead>
          <tr style={{ background: '#25252d', color: '#378ADD', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>UID</th>
            <th style={{ padding: '12px' }}>Email</th>
            <th style={{ padding: '12px' }}>Username</th>
            <th style={{ padding: '12px' }}>Rol</th>
            <th style={{ padding: '12px' }}>CF Handle</th>
            <th style={{ padding: '12px' }}>XP</th>
            <th style={{ padding: '12px' }}>Streak</th>
            <th style={{ padding: '12px' }}>CF Validat</th>
            <th style={{ padding: '12px' }}>Acțiuni</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => {
            const isEditing = editUserId === user.id;
            const isExpanded = expandedUserId === user.id;
            return (
              <React.Fragment key={user.id}>
                <tr className="clickable-row" onClick={() => toggleExpandUser(user.id)} style={{ borderBottom: '1px solid #333', background: isExpanded ? '#15151a' : 'transparent' }}>
                  <td style={{ padding: '12px', fontSize: '0.8rem', color: '#666' }}>{user.id.substring(0, 8)}... {isExpanded ? '▼' : '►'}</td>
                  <td style={{ padding: '12px' }}>{mascheazaEmail(user.email)}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{user.nume || "-"}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ padding: '2px 6px', borderRadius: '4px', background: user.role === 'teacher' ? '#0d47a1' : '#1b5e20', fontSize: '0.8rem' }}>
                      {user.role === 'teacher' ? '👨‍🏫 Profesor' : '👨‍🎓 Elev'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{user.codeforcesHandle || "-"}</td>
                  <td style={{ padding: '12px', color: '#ffd700' }}>⭐ {user.puncteTotale || 0}</td>
                  <td style={{ padding: '12px', color: '#ff4500' }}>🔥 {user.streakCount || 0}</td>
                  <td style={{ padding: '12px' }}>{user.cfValidat ? "✅ Da" : "❌ Nu"}</td>
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

                {/* ✅ ZONA EXTINSĂ: SE DESCHIDE LA CLICK PE RÂND ȘI TOATE INFORMAȚIILE SUNT MODIFICABILE */}
                {isExpanded && (
                  <tr>
                    <td colSpan="9" className="expanded-zone">
                      <h4 style={{ margin: '0 0 15px 0', color: '#378ADD', display: 'flex', justifyContent: 'space-between' }}>
                        <span>📋 Date Complete Document Firestore (UID: {user.id})</span>
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

                        {/* ✅ CASETE SPECIALE PENTRU STRUCTURI DE DATE COMPLEXE (Lecții / Statistici brute) */}
                        <div className="detaliu-field" style={{ gridColumn: '1 / -1' }}>
                          <span className="detaliu-label">Lecții terminate / Istoric parcurs (Format Brut JSON sau Array)</span>
                          {isEditing ? (
                            <textarea 
                              style={{ ...inputStyle, width: '100%', height: '80px', fontFamily: 'monospace', fontSize: '0.85rem' }}
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
          })}
        </tbody>
      </table>

      {/* --- MOBILE CARDS --- */}
      <div className="mobile-cards">
        {users.map(user => {
          const isEditing = editUserId === user.id;
          const isExpanded = expandedUserId === user.id;
          return (
            <div key={user.id} className="user-card" onClick={() => toggleExpandUser(user.id)} style={{ borderLeft: isExpanded ? '4px solid #639922' : '4px solid #378ADD' }}>
              <div className="card-row">
                <span className="card-label">Username:</span> 
                <strong>{user.nume || "-"}</strong>
              </div>
              <div className="card-row">
                <span className="card-label">Rol:</span> 
                <span style={{ color: user.role === 'teacher' ? '#64b5f6' : '#81c784' }}>{user.role === 'teacher' ? 'Profesor' : 'Elev'}</span>
              </div>
              <div className="card-row">
                <span className="card-label">Email mascat:</span> 
                <span>{mascheazaEmail(user.email)}</span>
              </div>

              {/* Detalii extinse pe mobil */}
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
                    <span className="card-label">Streak:</span>
                    {isEditing ? <input type="number" name="streakCount" value={editFormData.streakCount || 0} onChange={handleInputChange} style={inputStyleMobile} /> : <span>{user.streakCount || 0}</span>}
                  </div>
                  <div className="card-row">
                    <span className="card-label">Rol text:</span>
                    {isEditing ? (
                      <select name="role" value={editFormData.role || "student"} onChange={handleInputChange} style={inputStyleMobile}>
                        <option value="student">student</option>
                        <option value="teacher">teacher</option>
                      </select>
                    ) : <span>{user.role || "student"}</span>}
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
                      <button onClick={(e) => handleEditClick(user, e)} style={{ ...btnStyle, background: '#378ADD', width: '100%' }}>Editează Toate Datele</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}

const inputStyle = { background: '#111', border: '1px solid #444', color: 'white', padding: '8px', borderRadius: '4px', width: '100%', boxSizing: 'border-box' };
const inputStyleMobile = { background: '#111', border: '1px solid #444', color: 'white', padding: '4px 8px', borderRadius: '4px', width: '55%', textAlign: 'right' };
const btnStyle = { color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'opacity 0.2s' };

export default AdminUsers;