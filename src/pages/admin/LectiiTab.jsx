// LectiiTab.jsx modificat profesional pentru Serverless API
import { useState } from 'react';
import { toast } from 'sonner';

export default function LectiiTab({ firebaseLessons, onEdit, onRefresh, adminPassword, adminUsername }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = firebaseLessons.filter((l) => {
    const s = searchTerm.toLowerCase();
    return l.titlu?.toLowerCase().includes(s) || l.id?.toLowerCase().includes(s);
  });

  const handleDelete = async (id) => {
    if (!window.confirm(`Ești sigur că vrei să ștergi lecția "${id}"?`)) return;
    try {
      // Trimitem cererea de ștergere către backend-ul nostru central securizat
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_lesson',
          username: adminUsername,
          sessionToken: adminPassword,
          targetId: id
        })
      });

      if (!response.ok) {
        throw new Error((await response.json()).error || 'Eroare necunoscută la API.');
      }

      toast.success('Lecție ștearsă cu succes prin API! 🗑️');
      onRefresh();
    } catch (e) {
      toast.error('Eroare la ștergere: ' + e.message);
    }
  };

  const badgeLabel = (l) => {
    if (l.categorie === 'olimpiada') return 'OLIMPICI';
    if (l.categorie === 'concepte') return 'CONCEPTE';
    return l.clasa?.toUpperCase();
  };

  const badgeClass = (l) => `admin-badge admin-badge-${l.clasa?.split('-')[1] || l.clasa}`;

  return (
    <>
      <div style={{ marginBottom: '15px', width: '100%' }}>
        <input
          type="text"
          placeholder="🔍 Caută o lecție după titlu sau ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none' }}
        />
      </div>

      {/* Desktop table */}
      <div className="admin-table-wrap desktop-only">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Titlu</th>
              <th>Clasă / Tip</th>
              <th>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id}>
                <td><code className="admin-route-code">{l.id}</code></td>
                <td className="admin-td-titlu">{l.titlu}</td>
                <td><span className={badgeClass(l)}>{badgeLabel(l)}</span></td>
                <td className="actions-cell">
                  <button className="admin-btn-edit" onClick={() => onEdit(l)}>Editează</button>
                  <button className="admin-btn-delete" onClick={() => handleDelete(l.id)}>Șterge</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="admin-lessons-mobile-list mobile-only">
        {filtered.map((l) => (
          <div key={l.id} className="admin-lesson-mobile-card">
            <div className="mobile-card-header">
              <span className={badgeClass(l)}>{l.categorie ? l.categorie.toUpperCase() : l.clasa?.toUpperCase()}</span>
              <code className="admin-route-code">{l.id.substring(0, 15)}{l.id.length > 15 ? '...' : ''}</code>
            </div>
            <div className="mobile-card-title">{l.titlu}</div>
            <div className="mobile-card-actions">
              <button className="admin-btn-edit mobile-action-btn" onClick={() => onEdit(l)}>📝 Editează</button>
              <button className="admin-btn-delete mobile-action-btn" onClick={() => handleDelete(l.id)}>🗑️ Șterge</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}