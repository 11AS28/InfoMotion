import React, { useEffect, useState } from 'react';

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
  const [selectedTiers, setSelectedTiers] = useState({}); // { [requestId]: tier }
  const [processingId, setProcessingId] = useState(null);

  const fetchRequests = () => {
    setLoading(true);
    fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'list_diploma_requests',
        adminUsername,
        adminPassword
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRequests(data.requests);
        } else {
          setError(data.error || 'Eroare la încărcare.');
        }
      })
      .catch(() => setError('Eroare de rețea.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleTierChange = (requestId, tier) => {
    setSelectedTiers(prev => ({ ...prev, [requestId]: tier }));
  };

  const handleDecision = async (requestId, grant) => {
    const tier = selectedTiers[requestId] || 'clasa_9';

    if (grant && !selectedTiers[requestId]) {
      const confirmDefault = window.confirm(
        `Nu ai ales un nivel pentru diplomă. Continui cu "${TIER_OPTIONS.find(t => t.value === tier).label}"?`
      );
      if (!confirmDefault) return;
    }

    setProcessingId(requestId);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve_diploma',
          adminUsername,
          adminPassword,
          data: {
            requestId,
            grant,
            tier
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

  if (loading) return <p>Se încarcă cererile...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (requests.length === 0) return <p>Nu există cereri de diplomă în așteptare.</p>;

  return (
    <div className="diplome-tab">
      <h2>Cereri de diplomă în așteptare ({requests.length})</h2>

      {requests.map(req => (
        <div key={req.id} className="diploma-request-card" style={{
          border: '1px solid #30363d',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '12px'
        }}>
          <p><strong>Elev:</strong> {req.studentName}</p>
          <p><strong>Cerut la:</strong> {new Date(req.createdAt).toLocaleString('ro-RO')}</p>

          <div style={{ margin: '10px 0' }}>
            <strong>Statistici:</strong>
            <ul style={{ margin: '4px 0' }}>
              <li>Lecții completate: {req.stats?.lectiiCompletate ?? 'N/A'}</li>
              <li>Puncte totale: {req.stats?.puncteTotale ?? 'N/A'}</li>
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '12px' }}>
            <select
              value={selectedTiers[req.id] || ''}
              onChange={(e) => handleTierChange(req.id, e.target.value)}
              disabled={processingId === req.id}
            >
              <option value="">Alege nivelul diplomei...</option>
              {TIER_OPTIONS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>

            <button
              onClick={() => handleDecision(req.id, true)}
              disabled={processingId === req.id}
              style={{ backgroundColor: '#008080', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              {processingId === req.id ? 'Se procesează...' : 'Acordă'}
            </button>

            <button
              onClick={() => handleDecision(req.id, false)}
              disabled={processingId === req.id}
              style={{ backgroundColor: '#8b1e1e', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              Respinge
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default DiplomeTab;