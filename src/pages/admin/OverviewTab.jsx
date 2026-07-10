import { useEffect, useState } from 'react';

export default function OverviewTab({ firebaseLessons, adminUsername, adminPassword }) {
  const [mesaje, setMesaje] = useState([]);
  const [propuneri, setPropuneri] = useState([]);
  const [todos, setTodos] = useState([]);
  const [loadingExtra, setLoadingExtra] = useState(true);

  useEffect(() => {
    let anulat = false;

    const fetchToate = async () => {
      setLoadingExtra(true);
      try {
        const [resMesaje, resPropuneri, resTodos] = await Promise.all([
          fetch('/api/admin', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'list_messages', username: adminUsername, sessionToken: adminPassword })
          }),
          fetch('/api/admin', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'list_proposals', username: adminUsername, sessionToken: adminPassword })
          }),
          fetch('/api/admin', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'list_todos', username: adminUsername, sessionToken: adminPassword })
          }),
        ]);

        const [dataMesaje, dataPropuneri, dataTodos] = await Promise.all([
          resMesaje.json(), resPropuneri.json(), resTodos.json()
        ]);

        if (!anulat) {
          setMesaje(dataMesaje.messages || []);
          setPropuneri(dataPropuneri.proposals || []);
          setTodos(dataTodos.todos || []);
        }
      } catch (e) {
        // esuare silentioasa, statisticile de lectii raman functionale oricum
      } finally {
        if (!anulat) setLoadingExtra(false);
      }
    };

    if (adminUsername && adminPassword) fetchToate();
    else setLoadingExtra(false);

    return () => { anulat = true; };
  }, [adminUsername, adminPassword]);

  const totalLectii = firebaseLessons.length;
  const cuAnimatie = firebaseLessons.filter((l) => l.animatie && l.animatie !== 'null').length;
  const claseUnice = [...new Set(firebaseLessons.map((l) => l.clasa))].length;
  const totalPbinfo = firebaseLessons.reduce((s, l) => s + (l.problemePbinfo || []).length, 0);

  const countPerClasa = { 9: 0, 10: 0, 11: 0, 12: 0 };
  firebaseLessons.forEach((l) => {
    const n = parseInt(l.clasa?.split('-')[1]);
    if (!isNaN(n)) countPerClasa[n]++;
  });
  const maxCount = Math.max(...Object.values(countPerClasa), 1);
  const barColors = { 9: '#378ADD', 10: '#639922', 11: '#BA7517', 12: '#D4537E' };

  const mesajeNoi = mesaje.filter((m) => !m.answered);
  const todosActive = todos.filter((t) => !t.completed);

  const formatData = (timestamp) => {
    if (!timestamp) return '—';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit' });
  };

  const cardStyle = { background: '#fff', borderRadius: '14px', border: '1.5px solid #e2e8f0' };

  const previewCard = (titlu, culoare, numarText, items, itemRender, gol) => (
    <div style={{ ...cardStyle, padding: '20px 24px', flex: 1, minWidth: '280px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{titlu}</div>
        {numarText && (
          <div style={{
            fontSize: '12px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px',
            background: `${culoare}1a`, color: culoare
          }}>{numarText}</div>
        )}
      </div>
      {loadingExtra ? (
        <div style={{ fontSize: '13px', color: '#94a3b8', padding: '8px 0' }}>Se incarca...</div>
      ) : items.length === 0 ? (
        <div style={{ fontSize: '13px', color: '#94a3b8', padding: '8px 0' }}>{gol}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {items.slice(0, 3).map(itemRender)}
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="admin-stat-grid">
        <div className="admin-stat-card" style={{ borderColor: '#378ADD' }}>
          <div className="admin-stat-label">Total lectiile</div>
          <div className="admin-stat-num">{totalLectii}</div>
          <div className="admin-stat-sub">in Cloud</div>
        </div>
        <div className="admin-stat-card" style={{ borderColor: '#639922' }}>
          <div className="admin-stat-label">Cu animatie</div>
          <div className="admin-stat-num">{cuAnimatie}</div>
          <div className="admin-stat-sub">active</div>
        </div>
        <div className="admin-stat-card" style={{ borderColor: '#BA7517' }}>
          <div className="admin-stat-label">Clase acoperite</div>
          <div className="admin-stat-num">{claseUnice}/5</div>
          <div className="admin-stat-sub">clase</div>
        </div>
        <div className="admin-stat-card" style={{ borderColor: '#D4537E' }}>
          <div className="admin-stat-label">Probleme pbinfo</div>
          <div className="admin-stat-num">{totalPbinfo}</div>
          <div className="admin-stat-sub">linkuri</div>
        </div>
      </div>

      <div className="admin-two-col">
        <div className="admin-card">
          <div className="admin-section-title">Distributie pe clase</div>
          {[9, 10, 11, 12].map((c) => (
            <div key={c} className="admin-bar-row">
              <span className="admin-bar-label">Clasa {c}</span>
              <div className="admin-bar-track">
                <div
                  className="admin-bar-fill"
                  style={{ width: `${(countPerClasa[c] / maxCount) * 100}%`, background: barColors[c] }}
                />
              </div>
              <span className="admin-bar-count">{countPerClasa[c]}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '20px' }}>
        {previewCard(
          'Mesaje noi',
          '#dc2626',
          mesajeNoi.length > 0 ? `${mesajeNoi.length} nerezolvate` : null,
          mesajeNoi,
          (m) => (
            <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: '700', fontSize: '13px', color: '#1e293b' }}>{m.name}</div>
                <div style={{
                  fontSize: '12px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap', maxWidth: '220px'
                }}>{m.message}</div>
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', flexShrink: 0 }}>{formatData(m.createdAt)}</div>
            </div>
          ),
          'Niciun mesaj nou.'
        )}

        {previewCard(
          'Propuneri in asteptare',
          '#7c3aed',
          propuneri.length > 0 ? `${propuneri.length} in asteptare` : null,
          propuneri,
          (p) => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: '700', fontSize: '13px', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}>
                  {p.titlu || 'Fara titlu'}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{p.clasa || '—'}</div>
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', flexShrink: 0 }}>{formatData(p.createdAt)}</div>
            </div>
          ),
          'Nicio propunere noua.'
        )}

        {previewCard(
          'To-Do active',
          '#01696f',
          todosActive.length > 0 ? `${todosActive.length} active` : null,
          todosActive,
          (t) => (
            <div key={t.id} style={{ fontSize: '13px', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {t.text}
            </div>
          ),
          'Niciun task activ.'
        )}
      </div>
    </>
  );
}