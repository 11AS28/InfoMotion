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
  if (!email) return "-";
  const parts = email.split("@");
  if (parts.length !== 2) return email;
  const nume = parts[0];
  const domeniu = parts[1];
  if (nume.length <= 3) return `${nume[0]}***@${domeniu}`;
  return `${nume[0]}***${nume[nume.length - 1]}@${domeniu}`;
};

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

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

  const handleEditClick = (user) => {
    setEditUserId(user.id);
    setEditFormData({
      nume: user.nume || "",
      codeforcesHandle: user.codeforcesHandle || "",
      puncteTotale: user.puncteTotale || 0,
      streakCount: user.streakCount || 0,
      problemeRezolvateCount: user.problemeRezolvateCount || 0,
      cfValidat: user.cfValidat || false
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
    }));
  };

  const handleSaveClick = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, editFormData);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...editFormData } : u));
      setEditUserId(null);
      alert("Modificări salvate cu succes!");
    } catch (error) {
      alert("Eroare la salvare: " + error.message);
    }
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
    <div style={{ maxWidth: '1300px', margin: '20px auto', padding: '15px', color: 'white', fontFamily: 'sans-serif' }}>
      
      {/*nu cre ca mai avea sens sa mai fac o fisier doar pt asta no?*/} 
      <style>{`
        .desktop-table { display: table; width: 100%; border-collapse: collapse; margin-top: 20px; background: '#1a1a20'; border-radius: 8px; overflow: hidden; }
        .mobile-cards { display: none; }
        
        @media (max-width: 850px) {
          .desktop-table { display: none; }
          .mobile-cards { display: block; margin-top: 20px; }
          .user-card { background: #1a1a20; border: 1px solid #333; border-radius: 8px; padding: 15px; margin-bottom: 15px; }
          .card-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9rem; border-bottom: 1px solid #25252d; padding-bottom: 4px; }
          .card-label { color: #378ADD; font-weight: bold; }
          .card-actions { display: flex; gap: 10px; margin-top: 15px; }
          .header-container { flex-direction: column; gap: 15px; align-items: flex-start !important; }
        }
      `}</style>

      <div className="header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #378ADD', paddingBottom: '15px' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>🛠️ Panou Admin - Useri</h2>
        <button onClick={() => setIsAuthorized(false)} style={{ ...btnStyle, background: '#a12424', padding: '10px 16px' }}>Ieșire Panou</button>
      </div>
      
      
      <table className="desktop-table" style={{ background: '#1a1a20' }}>
        <thead>
          <tr style={{ background: '#25252d', color: '#378ADD', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>UID</th>
            <th style={{ padding: '12px' }}>Email</th>
            <th style={{ padding: '12px' }}>Username</th>
            <th style={{ padding: '12px' }}>CF Handle</th>
            <th style={{ padding: '12px' }}>Puncte XP</th>
            <th style={{ padding: '12px' }}>Streak</th>
            <th style={{ padding: '12px' }}>Pb. Rezolvate</th>
            <th style={{ padding: '12px' }}>CF Validat</th>
            <th style={{ padding: '12px' }}>Acțiuni</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} style={{ borderBottom: '1px solid #333', background: editUserId === user.id ? 'rgba(55,138,221,0.1)' : 'transparent' }}>
              <td style={{ padding: '12px', fontSize: '0.8rem', color: '#888' }}>{user.id.substring(0, 8)}...</td>
              <td style={{ padding: '12px' }}>{mascheazaEmail(user.email)}</td>
              <td style={{ padding: '12px' }}>{editUserId === user.id ? <input type="text" name="nume" value={editFormData.nume} onChange={handleInputChange} style={inputStyle} /> : user.nume || "-"}</td>
              <td style={{ padding: '12px' }}>{editUserId === user.id ? <input type="text" name="codeforcesHandle" value={editFormData.codeforcesHandle} onChange={handleInputChange} style={inputStyle} /> : user.codeforcesHandle || "-"}</td>
              <td style={{ padding: '12px' }}>{editUserId === user.id ? <input type="number" name="puncteTotale" value={editFormData.puncteTotale} onChange={handleInputChange} style={inputStyle} /> : user.puncteTotale || 0}</td>
              <td style={{ padding: '12px' }}>{editUserId === user.id ? <input type="number" name="streakCount" value={editFormData.streakCount} onChange={handleInputChange} style={inputStyle} /> : user.streakCount || 0}</td>
              <td style={{ padding: '12px' }}>{editUserId === user.id ? <input type="number" name="problemeRezolvateCount" value={editFormData.problemeRezolvateCount} onChange={handleInputChange} style={inputStyle} /> : user.problemeRezolvateCount || 0}</td>
              <td style={{ padding: '12px', textAlign: 'center' }}>{editUserId === user.id ? <input type="checkbox" name="cfValidat" checked={editFormData.cfValidat} onChange={handleInputChange} /> : user.cfValidat ? "✅ Da" : "❌ Nu"}</td>
              <td style={{ padding: '12px' }}>
                {editUserId === user.id ? (
                  <>
                    <button onClick={() => handleSaveClick(user.id)} style={{ ...btnStyle, background: '#639922' }}>Salvează</button>
                    <button onClick={() => setEditUserId(null)} style={{ ...btnStyle, background: '#555', marginLeft: '5px' }}>Anulează</button>
                  </>
                ) : (
                  <button onClick={() => handleEditClick(user)} style={{ ...btnStyle, background: '#378ADD' }}>Editează</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      
      <div className="mobile-cards">
        {users.map(user => (
          <div key={user.id} className="user-card" style={{ borderLeft: editUserId === user.id ? '4px solid #639922' : '4px solid #378ADD' }}>
            <div className="card-row"><span className="card-label">Email:</span> <span>{mascheazaEmail(user.email)}</span></div>
            
            <div className="card-row">
              <span className="card-label">Username:</span>
              {editUserId === user.id ? <input type="text" name="nume" value={editFormData.nume} onChange={handleInputChange} style={inputStyleMobile} /> : <span>{user.nume || "-"}</span>}
            </div>

            <div className="card-row">
              <span className="card-label">CF Handle:</span>
              {editUserId === user.id ? <input type="text" name="codeforcesHandle" value={editFormData.codeforcesHandle} onChange={handleInputChange} style={inputStyleMobile} /> : <span>{user.codeforcesHandle || "-"}</span>}
            </div>

            <div className="card-row">
              <span className="card-label">Puncte XP:</span>
              {editUserId === user.id ? <input type="number" name="puncteTotale" value={editFormData.puncteTotale} onChange={handleInputChange} style={inputStyleMobile} /> : <span>{user.puncteTotale || 0}</span>}
            </div>

            <div className="card-row">
              <span className="card-label">Streak Count:</span>
              {editUserId === user.id ? <input type="number" name="streakCount" value={editFormData.streakCount} onChange={handleInputChange} style={inputStyleMobile} /> : <span>{user.streakCount || 0}</span>}
            </div>

            <div className="card-row">
              <span className="card-label">Pb. Rezolvate:</span>
              {editUserId === user.id ? <input type="number" name="problemeRezolvateCount" value={editFormData.problemeRezolvateCount} onChange={handleInputChange} style={inputStyleMobile} /> : <span>{user.problemeRezolvateCount || 0}</span>}
            </div>

            <div className="card-row">
              <span className="card-label">CF Validat:</span>
              {editUserId === user.id ? <input type="checkbox" name="cfValidat" checked={editFormData.cfValidat} onChange={handleInputChange} /> : <span>{user.cfValidat ? "✅ Da" : "❌ Nu"}</span>}
            </div>

            <div className="card-actions">
              {editUserId === user.id ? (
                <>
                  <button onClick={() => handleSaveClick(user.id)} style={{ ...btnStyle, background: '#639922', flex: 1, padding: '10px' }}>Salvează</button>
                  <button onClick={() => setEditUserId(null)} style={{ ...btnStyle, background: '#555', flex: 1, padding: '10px' }}>Anulează</button>
                </>
              ) : (
                <button onClick={() => handleEditClick(user)} style={{ ...btnStyle, background: '#378ADD', width: '100%', padding: '10px' }}>Editează Utilizator</button>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

const inputStyle = { background: '#111', border: '1px solid #444', color: 'white', padding: '6px', borderRadius: '4px', width: '90%' };
const inputStyleMobile = { background: '#111', border: '1px solid #444', color: 'white', padding: '4px 8px', borderRadius: '4px', width: '60%', textAlign: 'right' };
const btnStyle = { color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' };

export default AdminUsers;