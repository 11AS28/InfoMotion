// TodoTab.jsx
import { useState } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
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
  
  // Limita inițială de task-uri rezolvate afișate
  const [visibleDoneCount, setVisibleDoneCount] = useState(5);

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
  
  // Extragem doar numărul de task-uri rezolvate setate ca fiind vizibile
  const visibleDone = done.slice(0, visibleDoneCount);

  return (
    <div className="admin-card">
      <div className="admin-section-title"> Organizare Echipă InfoMotion</div>
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
           Task-uri de făcut ({active.length})
        </h3>
        {active.length === 0 ? (
          <div style={{ padding: '15px', background: '#f0fdf4', color: '#166534', borderRadius: '8px', fontSize: '14px', border: '1px dashed #bbf7d0' }}>
             Toate task-urile au fost completate! Echipa e liberă.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {active.map((todo) => (
              <div key={todo.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#ffffff', borderRadius: '8px', borderLeft: '4px solid #378ADD', border: '1px solid #e2e8f0', borderLeftWidth: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingRight: '15px' }}>
                  <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: '500', lineHeight: '1.4' }}>{todo.text}</span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}> {todo.author} •  {formatTodoDate(todo.createdAt)}</span>
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
           Istoric task-uri finalizate ({done.length})
        </h3>
        {done.length === 0 ? (
          <div style={{ padding: '15px', color: '#94a3b8', fontSize: '14px', textAlign: 'center' }}>
            Niciun task terminat până acum în această sesiune.
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', opacity: 0.75 }}>
              {visibleDone.map((todo) => (
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

            {/* Butonul apare doar dacă există mai multe task-uri rezolvate decât cele afișate curent */}
            {done.length > visibleDoneCount && (
              <button 
                onClick={() => setVisibleDoneCount(prev => prev + 5)}
                style={{
                  marginTop: '15px',
                  width: '100%',
                  padding: '12px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  textAlign: 'center',
                  outline: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e2e8f0';
                  e.currentTarget.style.color = '#1e293b';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.color = '#475569';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }}
              >
                ➕ Încarcă mai multe task-uri rezolvate ({done.length - visibleDoneCount} rămase)
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}