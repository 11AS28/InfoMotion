// TodoTab.jsx
import { useState } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'sonner';

const formatTodoDate = (timestamp) => {
  if (!timestamp) return 'Acum un moment';
  return timestamp.toDate().toLocaleDateString('ro-RO', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
};

export default function TodoTab({ todos, username, onRefresh }) {
  const [newTodoText, setNewTodoText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTodoText.trim()) return toast.warning('Nu poți adăuga un task gol!');
    setLoading(true);
    try {
      await addDoc(collection(db, 'admin_todo'), {
        text: newTodoText.trim(),
        author: username,
        completed: false,
        createdAt: serverTimestamp(),
      });
      setNewTodoText('');
      toast.success('Task adăugat în listă!');
      onRefresh();
    } catch (e) {
      toast.error('Eroare la adăugare: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      await updateDoc(doc(db, 'admin_todo', id), { completed: !currentStatus });
      toast.success(!currentStatus ? 'Task marcat ca finalizat! 🎉' : 'Task redeschis.');
      onRefresh();
    } catch (e) {
      toast.error('Eroare: ' + e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Vrei să ștergi definitiv acest task din istoric?')) return;
    try {
      await deleteDoc(doc(db, 'admin_todo', id));
      toast.success('Task șters definitiv.');
      onRefresh();
    } catch (e) {
      toast.error('Eroare: ' + e.message);
    }
  };

  const active = todos.filter((t) => !t.completed);
  const done = todos.filter((t) => t.completed);

  return (
    <div className="admin-card">
      <div className="admin-section-title">📋 Organizare Echipă InfoMotion</div>
      <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '14px' }}>
        Planurile voastre de dezvoltare. Task-urile rezolvate trec în istoric ca să urmăriți progresul echipei.
      </p>

      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <input
          type="text"
          placeholder="Adaugă un task nou..."
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none' }}
          disabled={loading}
        />
        <button type="submit" className="admin-btn-primary" style={{ marginTop: 0, padding: '0 24px' }} disabled={loading}>
          {loading ? 'Se trimite...' : 'Adaugă'}
        </button>
      </form>

      {/* Active tasks */}
      <div style={{ marginBottom: '35px' }}>
        <h3 style={{ fontSize: '16px', color: '#0f172a', marginBottom: '12px' }}>
          📌 Task-uri de făcut ({active.length})
        </h3>
        {active.length === 0 ? (
          <div style={{ padding: '15px', background: '#f0fdf4', color: '#166534', borderRadius: '8px', fontSize: '14px', border: '1px dashed #bbf7d0' }}>
            🎉 Toate task-urile au fost completate! Echipa e liberă.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {active.map((todo) => (
              <div key={todo.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#ffffff', borderRadius: '8px', borderLeft: '4px solid #378ADD', border: '1px solid #e2e8f0', borderLeftWidth: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingRight: '15px' }}>
                  <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: '500', lineHeight: '1.4' }}>{todo.text}</span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>✍️ {todo.author} • 📅 {formatTodoDate(todo.createdAt)}</span>
                </div>
                <button onClick={() => handleToggle(todo.id, todo.completed)} style={{ background: '#e0f2fe', color: '#0369a1', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', flexShrink: 0 }}>
                  ✓ Rezolvă
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed tasks */}
      <div>
        <h3 style={{ fontSize: '16px', color: '#64748b', marginBottom: '12px' }}>
          ✅ Istoric task-uri finalizate ({done.length})
        </h3>
        {done.length === 0 ? (
          <div style={{ padding: '15px', color: '#94a3b8', fontSize: '14px', textAlign: 'center' }}>
            Niciun task terminat până acum în această sesiune.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', opacity: 0.75 }}>
            {done.map((todo) => (
              <div key={todo.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #94a3b8', border: '1px solid #e2e8f0', borderLeftWidth: '4px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '14px', color: '#64748b', textDecoration: 'line-through' }}>{todo.text}</span>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>Rezolvat • Adăugat de {todo.author} pe {formatTodoDate(todo.createdAt)}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleToggle(todo.id, todo.completed)} style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }} title="Pune înapoi în lista activă">
                    ↩️ Pune înapoi
                  </button>
                  <button onClick={() => handleDelete(todo.id)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }} title="Șterge definitiv">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}