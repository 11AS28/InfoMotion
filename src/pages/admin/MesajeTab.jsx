import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'sonner';

function MesajeTab({ adminUsername, adminPassword, sendUserNotification }) {
    const [mesaje, setMesaje] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mesajSelectat, setMesajSelectat] = useState(null);
    const [raspuns, setRaspuns] = useState('');
    const [numeAdmin, setNumeAdmin] = useState(adminUsername);
    const [trimitere, setTrimitere] = useState(false);
    const [filtru, setFiltru] = useState('toate'); // 'toate' | 'noi' | 'raspunse'

    const loadMesaje = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'contact_messages'), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            setMesaje(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) {
            toast.error('Eroare la încărcarea mesajelor.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMesaje();
    }, []);

    const handleSelectMesaj = (mesaj) => {
        setMesajSelectat(mesaj);
        setRaspuns('');
        setNumeAdmin(adminUsername);
    };

    const handleTrimiteRaspuns = async () => {
    if (!raspuns.trim()) {
        toast.error('Răspunsul nu poate fi gol.');
        return;
    }
    if (!mesajSelectat.uid) {
        toast.error('Acest mesaj nu are un UID asociat, nu se poate trimite notificare.');
        return;
    }

    setTrimitere(true);
    try {
        await updateDoc(doc(db, 'contact_messages', mesajSelectat.id), {
            answered: true,
            raspuns: raspuns.trim(),
            raspunsAdmin: numeAdmin,
            raspunsLa: serverTimestamp(),
            cheieSecuritate: adminPassword,
            adminUsername: adminUsername,
        });

        await sendUserNotification(
            mesajSelectat.uid,
            'contact_raspuns',
            `${numeAdmin} ți-a răspuns la mesaj: "${raspuns.trim()}"`
        );

        toast.success('Răspuns trimis cu succes!');
        setMesajSelectat(null);
        setRaspuns('');
        await loadMesaje();
    } catch (e) {
        console.error(e);
        toast.error('Eroare la trimiterea răspunsului: ' + e.message);
    } finally {
        setTrimitere(false);
    }
};

    const mesajeFiltrate = mesaje.filter(m => {
        if (filtru === 'noi') return !m.answered;
        if (filtru === 'raspunse') return m.answered;
        return true;
    });

    const formatData = (timestamp) => {
        if (!timestamp) return '—';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

            {/* Lista mesaje */}
            <div style={{ flex: '0 0 380px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

                {/* Header + filtre */}
                <div className="admin-card" style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div className="admin-section-title" style={{ margin: 0 }}>
                            Mesaje ({mesajeFiltrate.length})
                        </div>
                        <button
                            onClick={loadMesaje}
                            style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                        >
                            🔄
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        {['toate', 'noi', 'raspunse'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFiltru(f)}
                                style={{
                                    flex: 1, padding: '6px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                    fontSize: '12px', fontWeight: '700', textTransform: 'capitalize',
                                    background: filtru === f ? '#01696f' : '#f1f5f9',
                                    color: filtru === f ? '#fff' : '#475569',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {f === 'toate' ? 'Toate' : f === 'noi' ? '🔴 Noi' : '✅ Răspunse'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Lista (Mutată corect în interiorul zonei de return) */}
                {loading ? (
                    <div className="admin-card" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                        Se încarcă...
                    </div>
                ) : mesajeFiltrate.length === 0 ? (
                    <div className="admin-card" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                        Niciun mesaj în această categorie.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '65vh', overflowY: 'auto', width: '380px' }}>
                        {mesajeFiltrate.map(m => (
                            <div
                                key={m.id}
                                onClick={() => handleSelectMesaj(m)}
                                style={{
                                    padding: '14px 16px', borderRadius: '12px', cursor: 'pointer',
                                    border: mesajSelectat?.id === m.id ? '2px solid #01696f' : '1.5px solid #e2e8f0',
                                    background: mesajSelectat?.id === m.id ? 'rgba(1, 105, 111, 0.04)' : '#fff',
                                    transition: 'all 0.2s',
                                    width: '100%',
                                    boxSizing: 'border-box',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                    <span style={{ fontWeight: '700', fontSize: '14px' }}>{m.name}</span>
                                    <span style={{
                                        fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px',
                                        background: m.answered ? '#dcfce7' : '#fef2f2',
                                        color: m.answered ? '#166534' : '#dc2626',
                                        flexShrink: 0,
                                    }}>
                                        {m.answered ? '✅ Răspuns' : '🔴 Nou'}
                                    </span>
                                </div>
                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{m.email}</div>
                                <div style={{
                                    fontSize: '13px', color: '#475569',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    wordBreak: 'break-all',
                                }}>
                                    {m.message}
                                </div>
                                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
                                    {formatData(m.createdAt)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Panel detalii + răspuns */}
            <div style={{ flex: 1 }}>
                {!mesajSelectat ? (
                    <div className="admin-card" style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
                        <div style={{ fontSize: '40px', marginBottom: '12px' }}>💬</div>
                        <div style={{ fontWeight: '600', fontSize: '15px' }}>Selectează un mesaj din stânga</div>
                        <div style={{ fontSize: '13px', marginTop: '6px' }}>pentru a vedea detaliile și a răspunde</div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                        {/* Detalii mesaj */}
                        <div className="admin-card" style={{ padding: '20px 24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div>
                                    <div style={{ fontWeight: '800', fontSize: '18px' }}>{mesajSelectat.name}</div>
                                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{mesajSelectat.email}</div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{formatData(mesajSelectat.createdAt)}</div>
                                </div>
                                <button
                                    onClick={() => setMesajSelectat(null)}
                                    style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}
                                >
                                    ✕
                                </button>
                            </div>

                            <div style={{
    padding: '16px', borderRadius: '12px', background: '#f8fafc',
    border: '1.5px solid #e2e8f0', fontSize: '14px', lineHeight: '1.7',
    color: '#1e293b', whiteSpace: 'pre-wrap', wordBreak: 'break-all'
}}>
    {mesajSelectat.message}
</div>
                        </div>

                        {/* Răspuns anterior dacă există */}
                        {mesajSelectat.answered && mesajSelectat.raspuns && (
                            <div className="admin-card" style={{ padding: '20px 24px', borderLeft: '4px solid #01696f' }}>
                                <div style={{ fontWeight: '700', fontSize: '13px', color: '#01696f', marginBottom: '8px' }}>
                                    ✅ Răspuns trimis de {mesajSelectat.raspunsAdmin} — {formatData(mesajSelectat.raspunsLa)}
                                </div>
                                <div style={{ fontSize: '14px', lineHeight: '1.7', color: '#1e293b', whiteSpace: 'pre-wrap' }}>
                                    {mesajSelectat.raspuns}
                                </div>
                            </div>
                        )}

                        {/* Formular răspuns */}
                        <div className="admin-card" style={{ padding: '20px 24px' }}>
                            <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '16px' }}>
                                {mesajSelectat.answered ? '📝 Trimite un răspuns nou' : '📝 Răspunde'}
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '6px' }}>
                                    Răspuns de la
                                </label>
                                <input
                                    type="text"
                                    value={numeAdmin}
                                    onChange={e => setNumeAdmin(e.target.value)}
                                    style={{
                                        width: '100%', padding: '10px 14px', borderRadius: '10px',
                                        border: '1.5px solid #e2e8f0', fontSize: '14px', fontWeight: '600',
                                        background: '#f8fafc', outline: 'none', fontFamily: 'inherit'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '6px' }}>
                                    Mesajul tău
                                </label>
                                <textarea
                                    value={raspuns}
                                    onChange={e => setRaspuns(e.target.value)}
                                    rows={5}
                                    placeholder="Scrie răspunsul tău aici..."
                                    style={{
                                        width: '100%', padding: '12px 14px', borderRadius: '10px',
                                        border: '1.5px solid #e2e8f0', fontSize: '14px', lineHeight: '1.6',
                                        resize: 'vertical', fontFamily: 'inherit', outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#01696f'}
                                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                                />
                                <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'right', marginTop: '4px' }}>
                                    {raspuns.length}/1000
                                </div>
                            </div>

                            <button
                                onClick={handleTrimiteRaspuns}
                                disabled={trimitere || !raspuns.trim()}
                                style={{
                                    padding: '12px 28px', borderRadius: '30px', border: 'none',
                                    background: trimitere || !raspuns.trim() ? '#e2e8f0' : '#01696f',
                                    color: trimitere || !raspuns.trim() ? '#94a3b8' : '#fff',
                                    fontWeight: '700', fontSize: '14px', cursor: trimitere || !raspuns.trim() ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {trimitere ? 'Se trimite...' : '📨 Trimite răspunsul'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MesajeTab;