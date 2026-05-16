import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

// Array-ul de administratori securizat prin variabile de mediu
const ADMINS = [
  { username: import.meta.env.VITE_ADMIN_1_USER, password: import.meta.env.VITE_ADMIN_1_PASS },
  { username: import.meta.env.VITE_ADMIN_2_USER, password: import.meta.env.VITE_ADMIN_2_PASS },
  { username: import.meta.env.VITE_ADMIN_3_USER, password: import.meta.env.VITE_ADMIN_3_PASS },
  { username: import.meta.env.VITE_ADMIN_4_USER, password: import.meta.env.VITE_ADMIN_4_PASS }
];

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // State-uri pentru sistemul de login local pe pagină
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");

  // 1. Încărcăm utilizatorii doar dacă adminul s-a logat cu succes
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersList);
    } catch (error) {
      alert("Eroare la încărcarea utilizatorilor: " + error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchUsers();
    }
  }, [isAuthorized]);

  // 2. Logica de verificare a credențialelor de Admin
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError("");

    const gasit = ADMINS.find(
      (admin) => admin.username === loginUser.trim() && admin.password === loginPass
    );

    if (gasit) {
      setIsAuthorized(true);
    } else {
      setLoginError("Utilizator sau parolă incorectă!");
    }
  };

  // 3. Activăm modul de editare pentru un rând
  const handleEditClick = (user) => {
    setEditUserId(user.id);
    setEditFormData({
      nume: user.nume || "",
      codeforcesHandle: user.codeforcesHandle || "",
      puncteTotale: user.puncteTotale || 0,
      streakCount: user.streakCount || 0,
      problemeRezolvateCount: user.problemeRezolvateCount || 0, // <--- ADĂUGAT AICI
      cfValidat: user.cfValidat || false
    });
  };

  // 4. Modificăm valorile în formularul temporar
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
    }));
  };

  // 5. Salvăm modificările în Firestore
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

  // --- INTERFAȚA DE LOGIN (Dacă nu este autorizat) ---
  if (!isAuthorized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', fontFamily: 'sans-serif' }}>
        <form onSubmit={handleLoginSubmit} style={{ background: '#1a1a20', padding: '40px', borderRadius: '12px', border: '1px solid #333', width: '320px', textAlign: 'center' }}>
          <h3 style={{ color: '#378ADD', marginBottom: '20px' }}>🔒 Restricționat Admin</h3>
          
          <input 
            type="text" 
            placeholder="Username Admin" 
            value={loginUser}
            onChange={(e) => setLoginUser(e.target.value)}
            style={{ ...inputStyle, width: '100%', marginBottom: '15px', boxSizing: 'border-box' }}
            required
          />
          <input 
            type="password" 
            placeholder="Parolă" 
            value={loginPass}
            onChange={(e) => setLoginPass(e.target.value)}
            style={{ ...inputStyle, width: '100%', marginBottom: '20px', boxSizing: 'border-box' }}
            required
          />

          {loginError && <p style={{ color: '#ff4500', fontSize: '0.85rem', margin: '0 0 15px 0' }}>{loginError}</p>}

          <button type="submit" style={{ ...btnStyle, background: '#378ADD', width: '100%', padding: '10px' }}>
            Autentificare
          </button>
        </form>
      </div>
    );
  }

  // --- INTERFAȚA CU TABELUL (Dacă s-a logat corect) ---
  if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Se încarcă baza de date...</div>;

  return (
    <div style={{ maxWidth: '1300px', margin: '40px auto', padding: '20px', color: 'white', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #378ADD', paddingBottom: '10px' }}>
        <h2>🛠️ Panou Provizoriu Admin - Gestiune Useri</h2>
        <button onClick={() => setIsAuthorized(false)} style={{ ...btnStyle, background: '#a12424' }}>Ieșire Panou</button>
      </div>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', background: '#1a1a20', borderRadius: '8px', overflow: 'hidden' }}>
        <thead>
          <tr style={{ background: '#25252d', color: '#378ADD', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>UID</th>
            <th style={{ padding: '12px' }}>Email</th>
            <th style={{ padding: '12px' }}>Username</th>
            <th style={{ padding: '12px' }}>CF Handle</th>
            <th style={{ padding: '12px' }}>Puncte XP</th>
            <th style={{ padding: '12px' }}>Streak</th>
            <th style={{ padding: '12px' }}>Pb. Rezolvate</th> {/* <--- CAP DE TABEL NOU */}
            <th style={{ padding: '12px' }}>CF Validat</th>
            <th style={{ padding: '12px' }}>Acțiuni</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} style={{ borderBottom: '1px solid #333', background: editUserId === user.id ? 'rgba(55,138,221,0.1)' : 'transparent' }}>
              <td style={{ padding: '12px', fontSize: '0.8rem', color: '#888' }}>{user.id}</td>
              <td style={{ padding: '12px' }}>{user.email}</td>
              
              <td style={{ padding: '12px' }}>
                {editUserId === user.id ? (
                  <input type="text" name="nume" value={editFormData.nume} onChange={handleInputChange} style={inputStyle} />
                ) : user.nume || "-"}
              </td>
              <td style={{ padding: '12px' }}>
                {editUserId === user.id ? (
                  <input type="text" name="codeforcesHandle" value={editFormData.codeforcesHandle} onChange={handleInputChange} style={inputStyle} />
                ) : user.codeforcesHandle || "-"}
              </td>
              <td style={{ padding: '12px' }}>
                {editUserId === user.id ? (
                  <input type="number" name="puncteTotale" value={editFormData.puncteTotale} onChange={handleInputChange} style={inputStyle} />
                ) : user.puncteTotale || 0}
              </td>
              <td style={{ padding: '12px' }}>
                {editUserId === user.id ? (
                  <input type="number" name="streakCount" value={editFormData.streakCount} onChange={handleInputChange} style={inputStyle} />
                ) : user.streakCount || 0}
              </td>
              
              {/* CÂMPUL NOU: PROBLEME REZOLVATE COUNT */}
              <td style={{ padding: '12px' }}>
                {editUserId === user.id ? (
                  <input type="number" name="problemeRezolvateCount" value={editFormData.problemeRezolvateCount} onChange={handleInputChange} style={inputStyle} />
                ) : user.problemeRezolvateCount || 0}
              </td>

              <td style={{ padding: '12px', textAlign: 'center' }}>
                {editUserId === user.id ? (
                  <input type="checkbox" name="cfValidat" checked={editFormData.cfValidat} onChange={handleInputChange} />
                ) : user.cfValidat ? "✅ Da" : "❌ Nu"}
              </td>
              
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
    </div>
  );
}

// Stiluri inline
const inputStyle = {
  background: '#111',
  border: '1px solid #444',
  color: 'white',
  padding: '10px',
  borderRadius: '6px',
  width: '90%'
};

const btnStyle = {
  color: 'white',
  border: 'none',
  padding: '6px 12px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold'
};

export default AdminUsers;