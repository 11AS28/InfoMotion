import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const TIER_OPTIONS = [
  { value: 'clasa_9', label: 'Clasa a IX-a' },
  { value: 'clasa_10', label: 'Clasa a X-a' },
  { value: 'clasa_11', label: 'Clasa a XI-a' },
  { value: 'liceu', label: '🏆 Absolvire Liceu' }
];

function DiplomeTab({ adminUsername, adminPassword }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTiers, setSelectedTiers] = useState({});
  const [processingId, setProcessingId] = useState(null);

  const [rejectModal, setRejectModal] = useState(null);   
  const [rejectText, setRejectText] = useState('');

  const fetchRequests = () => {
    setLoading(true);
    fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'list_diploma_requests',
        username: adminUsername,
        sessionToken: adminPassword
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setRequests(data.requests);
        else setError(data.error || 'Eroare la încărcare.');
      })
      .catch(() => setError('Eroare de rețea.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleTierChange = (requestId, tier) => {
    setSelectedTiers(prev => ({ ...prev, [requestId]: tier }));
  };

  const openRejectModal = (req) => {
    setRejectText('');
    setRejectModal({ requestId: req.id, studentName: req.studentName });
  };

  const closeRejectModal = () => {
    setRejectModal(null);
    setRejectText('');
  };

  const submitDecision = async (requestId, grant, rejectReason) => {
    const tier = selectedTiers[requestId] || 'clasa_9';

    setProcessingId(requestId);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve_diploma',
          username: adminUsername,
          sessionToken: adminPassword,
          data: {
            requestId,
            grant,
            tier,
            rejectReason: !grant ? (rejectReason || '') : undefined
          }
        })
      });
      const result = await res.json();
      if (result.success) {
        setRequests(prev => prev.filter(r => r.id !== requestId));
      } else {
        alert(result.error || 'Eroare la procesare.');
      }
    } catch {
      alert('Eroare de rețea.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleApprove = (requestId) => {
    const tier = selectedTiers[requestId];
    if (!tier) {
      const ok = window.confirm('Nu ai ales un nivel. Continui cu "Clasa a IX-a"?');
      if (!ok) return;
    }
    submitDecision(requestId, true);
  };

  const handleConfirmReject = () => {
    if (!rejectModal) return;
    submitDecision(rejectModal.requestId, false, rejectText.trim());
    closeRejectModal();
  };

  return (
    <div className="admin-card">
      <div className="admin-section-title">Cereri de diplomă în așteptare ({requests.length})</div>

      {loading ? (
        <div className="admin-empty-state">Se încarcă...</div>
      ) : error ? (
        <div className="admin-empty-state" style={{ color: '#dc2626' }}>{error}</div>
      ) : requests.length === 0 ? (
        <div className="admin-empty-state">Nicio cerere de diplomă în așteptare.</div>
      ) : (
        <div className="admin-approvals-list">
          {requests.map(req => (
            <div key={req.id} className="admin-approval-card">
              <div className="admin-approval-top">
                <div className="admin-approval-main">
                  <h3 className="admin-approval-title">{req.studentName}</h3>
                  <div className="admin-approval-author">
                    Cerut la {new Date(req.createdAt).toLocaleString('ro-RO')}
                  </div>
                </div>

                <div className="admin-approval-actions">
                  <select
                    value={selectedTiers[req.id] || ''}
                    onChange={(e) => handleTierChange(req.id, e.target.value)}
                    disabled={processingId === req.id}
                    style={{
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: '1.5px solid #e2e8f0',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#374151'
                    }}
                  >
                    <option value="">Alege nivelul...</option>
                    {TIER_OPTIONS.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>

                  <button
                    className="admin-btn-approve"
                    onClick={() => handleApprove(req.id)}
                    disabled={processingId === req.id}
                  >
                    {processingId === req.id ? 'Se procesează...' : 'Acordă'}
                  </button>

                  <button
                    className="admin-btn-reject"
                    onClick={() => openRejectModal(req)}
                    disabled={processingId === req.id}
                  >
                    Respinge
                  </button>
                </div>
              </div>

              <div className="admin-approval-section">
                <div className="admin-approval-section-title">Statistici elev</div>
                <div className="admin-stat-grid" style={{ marginBottom: 0 }}>
                  <div className="admin-stat-card">
                    <div className="admin-stat-label">Clasa a IX-a</div>
                    <div className="admin-stat-num">{req.stats?.lectiiClasa9 ?? 0}</div>
                    <div className="admin-stat-sub">lecții terminate</div>
                  </div>
                  <div className="admin-stat-card">
                    <div className="admin-stat-label">Clasa a X-a</div>
                    <div className="admin-stat-num">{req.stats?.lectiiClasa10 ?? 0}</div>
                    <div className="admin-stat-sub">lecții terminate</div>
                  </div>
                  <div className="admin-stat-card">
                    <div className="admin-stat-label">Clasa a XI-a</div>
                    <div className="admin-stat-num">{req.stats?.lectiiClasa11 ?? 0}</div>
                    <div className="admin-stat-sub">lecții terminate</div>
                  </div>
                  <div className="admin-stat-card">
                    <div className="admin-stat-label">Puncte Totale</div>
                    <div className="admin-stat-num">{req.stats?.puncteTotale ?? 0}</div>
                    <div className="admin-stat-sub">{req.stats?.problemeRezolvate ?? 0} probleme rezolvate</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {rejectModal && createPortal(
        <div
          onClick={closeRejectModal}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '32px',
              maxWidth: '460px',
              width: '100%',
              boxShadow: '0 30px 80px rgba(0,0,0,0.25)',
            }}
          >
            <div style={{ marginBottom: '18px' }}>
              <div style={{
                fontSize: '11px', fontWeight: '700', color: '#94a3b8',
                textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px'
              }}>
                Respinge cererea de diplomă
              </div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                {rejectModal.studentName}
              </div>
            </div>

            <label style={{
              display: 'block', fontSize: '0.85rem', fontWeight: 600,
              color: '#374151', marginBottom: '8px'
            }}>
              Mesaj pentru elev (opțional)
            </label>
            <textarea
              autoFocus
              placeholder="Ex: Mai ai de terminat 2 lecții din clasa a X-a înainte să poți primi diploma."
              value={rejectText}
              onChange={(e) => setRejectText(e.target.value)}
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1.5px solid #e2e8f0',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                color: '#1e293b',
                resize: 'vertical',
                boxSizing: 'border-box',
                marginBottom: '20px',
                outline: 'none'
              }}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={closeRejectModal}
                style={{
                  flex: 1, padding: '12px', borderRadius: '10px',
                  border: '1.5px solid #e2e8f0', background: '#fff',
                  color: '#374151', fontWeight: '700', fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Anulează
              </button>
              <button
                onClick={handleConfirmReject}
                style={{
                  flex: 1, padding: '12px', borderRadius: '10px',
                  border: 'none', background: '#dc2626',
                  color: '#fff', fontWeight: '700', fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Confirmă respingerea
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default DiplomeTab;