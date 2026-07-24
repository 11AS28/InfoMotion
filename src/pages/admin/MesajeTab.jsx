import { useEffect, useState } from 'react';
import { toast } from 'sonner';

function MesajeTab({ adminUsername, adminPassword }) {
    const [mesaje, setMesaje] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mesajSelectat, setMesajSelectat] = useState(null);
    const [raspuns, setRaspuns] = useState('');
    const [numeAdmin, setNumeAdmin] = useState(adminUsername);
    const [trimitere, setTrimitere] = useState(false);
    const [filtru, setFiltru] = useState('toate');
    const [stergere, setStergere] = useState(false);
    const [mesajDeSters, setMesajDeSters] = useState(null);

     const [sectiune, setSectiune] = useState('mesaje');  
    const [anuntTip, setAnuntTip] = useState('toti');  
    const [anuntUserId, setAnuntUserId] = useState('');
    const [anuntUserSuggestii, setAnuntUserSuggestii] = useState([]);
    const [totiUserii, setTotiUserii] = useState([]);
    const [anuntText, setAnuntText] = useState('');
    const [anuntTrimite, setAnuntTrimite] = useState(false);
    const [loadingUseri, setLoadingUseri] = useState(false);

    const loadMesaje = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'list_messages', username: adminUsername, sessionToken: adminPassword })
            });
            const { messages } = await res.json();
            setMesaje(messages || []);
        } catch (e) {
            toast.error('Eroare la incarcarea mesajelor.');
        } finally {
            setLoading(false);
        }
    };

     const loadUseri = async () => {
        if (totiUserii.length > 0) return;
        setLoadingUseri(true);
        try {
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'list_users_minimal', username: adminUsername, sessionToken: adminPassword })
            });
            const data = await res.json();
            setTotiUserii(data.users || []);
        } catch (e) {
            toast.error('Eroare la incarcarea listei de utilizatori.');
        } finally {
            setLoadingUseri(false);
        }
    };

    useEffect(() => {
        loadMesaje();
    }, []);

    useEffect(() => {
        if (sectiune === 'anunt') loadUseri();
    }, [sectiune]);

    const handleSelectMesaj = (mesaj) => {
        setMesajSelectat(mesaj);
        setRaspuns('');
        setNumeAdmin(adminUsername);
    };

    const handleTrimiteRaspuns = async () => {
        if (!raspuns.trim()) { toast.error('Raspunsul nu poate fi gol.'); return; }
        if (!mesajSelectat.uid) { toast.error('Acest mesaj nu are un UID asociat.'); return; }
        setTrimitere(true);
        try {
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'reply_message',
                    username: adminUsername, sessionToken: adminPassword,
                    data: { messageId: mesajSelectat.id, raspuns: raspuns.trim(), numeAdmin, userUid: mesajSelectat.uid }
                })
            });
            const result = await res.json();
            if(result.success) {
                toast.success('Raspuns trimis cu succes!');
                setMesajSelectat(null);
                setRaspuns('');
                await loadMesaje();
            } else {
                toast.error(result.message || 'Eroare la trimitere.');
            }
        } catch (e) {
            toast.error('Eroare: ' + e.message);
        } finally {
            setTrimitere(false);
        }
    };

    const handleStergeMesaj = (mesaj) => {
        if (!mesaj?.id) { toast.error('Acest mesaj nu are un ID asociat.'); return; }
        setMesajDeSters(mesaj);
    };

    const confirmaStergere = async () => {
        if (!mesajDeSters?.id) return;
        setStergere(true);
        try {
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'delete_message',
                    username: adminUsername, sessionToken: adminPassword,
                    data: { messageId: mesajDeSters.id }
                })
            });
            const result = await res.json();
            if (result.success) {
                toast.success('Mesaj sters cu succes.');
                setMesajSelectat(null);
                setRaspuns('');
                setMesajDeSters(null);
                await loadMesaje();
            } else {
                toast.error(result.message || 'Eroare la stergere.');
            }
        } catch (e) {
            toast.error('Eroare: ' + e.message);
        } finally {
            setStergere(false);
        }
    };

    const handleCautaUser = (val) => {
        setAnuntUserId(val);
        if (!val.trim()) { setAnuntUserSuggestii([]); return; }
        const lower = val.toLowerCase();
        setAnuntUserSuggestii(
            totiUserii.filter(u =>
                (u.username?.toLowerCase().includes(lower) || u.email?.toLowerCase().includes(lower))
            ).slice(0, 5)
        );
    };

     const handleTrimiteAnunt = async () => {
        if (!anuntText.trim()) { toast.error('Mesajul anuntului nu poate fi gol.'); return; }

        let targetUserId = null;
        if (anuntTip === 'unul') {
            if (!anuntUserId.trim()) { toast.error('Selecteaza un user.'); return; }
            const user = totiUserii.find(u => u.username === anuntUserId || u.email === anuntUserId || u.id === anuntUserId);
            if (!user) { toast.error('Userul nu a fost gasit.'); return; }
            targetUserId = user.id;
        }

        setAnuntTrimite(true);
        try {
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'broadcast_announcement',  
                    username: adminUsername,
                    sessionToken: adminPassword,
                    data: {
                        type: anuntTip, 
                        userId: targetUserId,
                        text: anuntText.trim()
                    }
                })
            });

            const result = await res.json();
            if (result.success) {
                toast.success(result.message || 'Anunt trimis cu succes!');
                setAnuntText('');
                setAnuntUserId('');
                setAnuntUserSuggestii([]);
            } else {
                toast.error(result.message || 'Eroare la trimiterea anuntului.');
            }
        } catch (e) {
            toast.error('Eroare la trimitere: ' + e.message);
        } finally {
            setAnuntTrimite(false);
        }
    };

    const mesajeFiltrate = mesaje.filter(m => {
        if (filtru === 'noi') return !m.answered;
        if (filtru === 'raspunse') return m.answered;
        return true;
    });

    const formatData = (timestamp) => {
        if (!timestamp) return '—';
        const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
        return date.toLocaleString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const cardStyle = { background: '#fff', borderRadius: '14px', border: '1.5px solid #e2e8f0' };
    const btnPrimary = (disabled) => ({
        padding: '11px 28px', borderRadius: '30px', border: 'none',
        background: disabled ? '#e2e8f0' : '#01696f',
        color: disabled ? '#94a3b8' : '#fff',
        fontWeight: '700', fontSize: '14px',
        cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.2s'
    });
    const btnDanger = (disabled) => ({
        padding: '11px 28px', borderRadius: '30px', border: '1.5px solid #fecaca',
        background: disabled ? '#f8fafc' : '#fff',
        color: disabled ? '#94a3b8' : '#dc2626',
        fontWeight: '700', fontSize: '14px',
        cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.2s'
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
                {[
                    { key: 'mesaje', label: 'Mesaje primite' },
                    { key: 'anunt', label: 'Trimite anunt' },
                ].map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setSectiune(key)}
                        style={{
                            padding: '10px 22px', borderRadius: '30px', border: 'none',
                            background: sectiune === key ? '#01696f' : '#f1f5f9',
                            color: sectiune === key ? '#fff' : '#475569',
                            fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s'
                        }}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {sectiune === 'mesaje' && (
                <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                    <div style={{ flex: '0 0 380px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ ...cardStyle, padding: '16px 20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <div className="admin-section-title" style={{ margin: 0 }}>Mesaje ({mesajeFiltrate.length})</div>
                                <button onClick={loadMesaje} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Reincarca</button>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {['toate', 'noi', 'raspunse'].map(f => (
                                    <button key={f} onClick={() => setFiltru(f)} style={{
                                        flex: 1, padding: '6px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                        fontSize: '12px', fontWeight: '700', textTransform: 'capitalize',
                                        background: filtru === f ? '#01696f' : '#f1f5f9',
                                        color: filtru === f ? '#fff' : '#475569', transition: 'all 0.2s'
                                    }}>
                                        {f === 'toate' ? 'Toate' : f === 'noi' ? 'Noi' : 'Raspunse'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {loading ? (
                            <div style={{ ...cardStyle, padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Se incarca...</div>
                        ) : mesajeFiltrate.length === 0 ? (
                            <div style={{ ...cardStyle, padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Niciun mesaj in aceasta categorie.</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '65vh', overflowY: 'auto', width: '380px' }}>
                                {mesajeFiltrate.map(m => (
                                    <div key={m.id} onClick={() => handleSelectMesaj(m)} style={{
                                        padding: '14px 16px', borderRadius: '12px', cursor: 'pointer',
                                        border: mesajSelectat?.id === m.id ? '2px solid #01696f' : '1.5px solid #e2e8f0',
                                        background: mesajSelectat?.id === m.id ? 'rgba(1,105,111,0.04)' : '#fff',
                                        transition: 'all 0.2s', width: '100%', boxSizing: 'border-box',
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <span style={{ fontWeight: '700', fontSize: '14px' }}>{m.name}</span>
                                            <span style={{
                                                fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px',
                                                background: m.answered ? '#dcfce7' : '#fef2f2',
                                                color: m.answered ? '#166534' : '#dc2626', flexShrink: 0,
                                            }}>{m.answered ? 'Raspuns' : 'Nou'}</span>
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{m.email}</div>
                                        <div style={{
                                            fontSize: '13px', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis',
                                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', wordBreak: 'break-all',
                                        }}>{m.message}</div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>{formatData(m.createdAt)}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ flex: 1 }}>
                        {!mesajSelectat ? (
                            <div style={{ ...cardStyle, padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
                                <div style={{ fontWeight: '600', fontSize: '15px' }}>Selecteaza un mesaj din stanga</div>
                                <div style={{ fontSize: '13px', marginTop: '6px' }}>pentru a vedea detaliile si a raspunde</div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ ...cardStyle, padding: '20px 24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                        <div>
                                            <div style={{ fontWeight: '800', fontSize: '18px' }}>{mesajSelectat.name}</div>
                                            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{mesajSelectat.email}</div>
                                            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{formatData(mesajSelectat.createdAt)}</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <button
                                                onClick={() => handleStergeMesaj(mesajSelectat)}
                                                disabled={stergere}
                                                style={{
                                                    background: 'none', border: '1px solid #fecaca', borderRadius: '8px',
                                                    padding: '6px 12px', cursor: stergere ? 'not-allowed' : 'pointer',
                                                    fontSize: '12px', fontWeight: '700', color: stergere ? '#94a3b8' : '#dc2626'
                                                }}
                                            >
                                                {stergere ? 'Se sterge...' : 'Sterge mesajul'}
                                            </button>
                                            <button onClick={() => setMesajSelectat(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}>x</button>
                                        </div>
                                    </div>
                                    <div style={{ padding: '16px', borderRadius: '12px', background: '#f8fafc', border: '1.5px solid #e2e8f0', fontSize: '14px', lineHeight: '1.7', color: '#1e293b', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                        {mesajSelectat.message}
                                    </div>
                                </div>

                                {mesajSelectat.answered && mesajSelectat.raspuns && (
                                    <div style={{ ...cardStyle, padding: '20px 24px', borderLeft: '4px solid #01696f' }}>
                                        <div style={{ fontWeight: '700', fontSize: '13px', color: '#01696f', marginBottom: '8px' }}>
                                            Raspuns trimis de {mesajSelectat.raspunsAdmin} — {formatData(mesajSelectat.raspunsLa)}
                                        </div>
                                        <div style={{ fontSize: '14px', lineHeight: '1.7', color: '#1e293b', whiteSpace: 'pre-wrap' }}>{mesajSelectat.raspuns}</div>
                                    </div>
                                )}

                                <div style={{ ...cardStyle, padding: '20px 24px' }}>
                                    <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '16px' }}>
                                        {mesajSelectat.answered ? 'Trimite un raspuns nou' : 'Raspunde'}
                                    </div>
                                    <div style={{ marginBottom: '12px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '6px' }}>Raspuns de la</label>
                                        <input type="text" value={numeAdmin} onChange={e => setNumeAdmin(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', fontWeight: '600', background: '#f8fafc', outline: 'none', fontFamily: 'inherit' }} />
                                    </div>
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '6px' }}>Mesajul tau</label>
                                        <textarea value={raspuns} onChange={e => setRaspuns(e.target.value)} rows={5} placeholder="Scrie raspunsul tau aici..." style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', lineHeight: '1.6', resize: 'vertical', fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#01696f'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                                        <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'right', marginTop: '4px' }}>{raspuns.length}/1000</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                        <button onClick={handleTrimiteRaspuns} disabled={trimitere || !raspuns.trim()} style={btnPrimary(trimitere || !raspuns.trim())}>
                                            {trimitere ? 'Se trimite...' : 'Trimite raspunsul'}
                                        </button>
                                        <button onClick={() => handleStergeMesaj(mesajSelectat)} disabled={stergere} style={btnDanger(stergere)}>
                                            {stergere ? 'Se sterge...' : 'Sterge mesajul'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {sectiune === 'anunt' && (
                <div style={{ maxWidth: '620px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ ...cardStyle, padding: '20px 24px' }}>
                        <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '16px' }}>Catre cine trimiti?</div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {[
                                { key: 'toti', label: 'Toti utilizatorii', desc: `${totiUserii.length} conturi` },
                                { key: 'unul', label: 'Un utilizator', desc: 'dupa username sau email' },
                            ].map(({ key, label, desc }) => (
                                <button key={key} onClick={() => { setAnuntTip(key); setAnuntUserId(''); setAnuntUserSuggestii([]); }} style={{
                                    flex: 1, padding: '14px 16px', borderRadius: '12px', cursor: 'pointer', textAlign: 'left',
                                    border: anuntTip === key ? '2px solid #01696f' : '1.5px solid #e2e8f0',
                                    background: anuntTip === key ? 'rgba(1,105,111,0.05)' : '#fff',
                                    transition: 'all 0.2s',
                                }}>
                                    <div style={{ fontWeight: '700', fontSize: '14px', color: anuntTip === key ? '#01696f' : '#1e293b' }}>{label}</div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px' }}>{loadingUseri ? 'Se incarca...' : desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {anuntTip === 'unul' && (
                        <div style={{ ...cardStyle, padding: '20px 24px', position: 'relative' }}>
                            <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '8px' }}>Username sau email</label>
                            <input
                                type="text"
                                value={anuntUserId}
                                onChange={e => handleCautaUser(e.target.value)}
                                placeholder="ex: smmaria sau smmaria@gmail.com"
                                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                                onFocus={e => e.target.style.borderColor = '#01696f'}
                                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                            />
                            {anuntUserSuggestii.length > 0 && (
                                <div style={{ position: 'absolute', left: '24px', right: '24px', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', zIndex: 10, overflow: 'hidden', marginTop: '4px' }}>
                                    {anuntUserSuggestii.map(u => (
                                        <div key={u.id} onMouseDown={() => { setAnuntUserId(u.username || u.email); setAnuntUserSuggestii([]); }} style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                            onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                                            <span style={{ fontWeight: '600' }}>{u.username || '—'}</span>
                                            <span style={{ color: '#94a3b8', fontSize: '12px' }}>{u.email}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div style={{ ...cardStyle, padding: '20px 24px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '8px' }}>Mesajul anuntului</label>
                        <textarea
                            value={anuntText}
                            onChange={e => setAnuntText(e.target.value)}
                            rows={5}
                            placeholder={anuntTip === 'toti'
                                ? 'ex: Am adaugat o lectie noua despre pointeri! Verifica sectiunea Lectii'
                                : 'ex: Felicitari! Ai castigat giveaway-ul nostru'}
                            style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', lineHeight: '1.6', resize: 'vertical', fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                            onFocus={e => e.target.style.borderColor = '#01696f'}
                            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                        />
                        <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'right', marginTop: '4px' }}>{anuntText.length}/500</div>
                    </div>

                    <div style={{ ...cardStyle, padding: '20px 24px' }}>
                        {anuntText.trim() && (
                            <div style={{ marginBottom: '16px', padding: '14px 16px', borderRadius: '10px', background: '#f0fdf4', border: '1.5px solid #bbf7d0' }}>
                                <div style={{ fontSize: '11px', fontWeight: '700', color: '#166534', marginBottom: '6px' }}>PREVIEW NOTIFICARE</div>
                                <div style={{ fontSize: '13px', color: '#1e293b', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{anuntText.trim()}</div>
                                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>de la {adminUsername} • acum</div>
                            </div>
                        )}
                        <button
                            onClick={handleTrimiteAnunt}
                            disabled={anuntTrimite || !anuntText.trim() || (anuntTip === 'unul' && !anuntUserId.trim())}
                            style={btnPrimary(anuntTrimite || !anuntText.trim() || (anuntTip === 'unul' && !anuntUserId.trim()))}
                        >
                            {anuntTrimite
                                ? 'Se trimite...'
                                : anuntTip === 'toti'
                                    ? `Trimite la toti (${totiUserii.length})`
                                    : 'Trimite notificarea'}
                        </button>
                    </div>
                </div>
            )}

            {mesajDeSters && (
                <div
                    onClick={() => !stergere && setMesajDeSters(null)}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 1000, padding: '20px', backdropFilter: 'blur(2px)'
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: '#fff', borderRadius: '18px', padding: '28px',
                            maxWidth: '400px', width: '100%',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                        }}
                    >
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '50%',
                            background: '#fef2f2', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', marginBottom: '16px',
                        }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2.5px solid #dc2626' }} />
                        </div>
                        <div style={{ fontWeight: '800', fontSize: '17px', color: '#0f172a', marginBottom: '8px' }}>
                            Stergi acest mesaj?
                        </div>
                        <div style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', marginBottom: '24px' }}>
                            Mesajul de la <strong style={{ color: '#334155' }}>{mesajDeSters.name}</strong> va fi sters
                            definitiv din baza de date. Aceasta actiune nu poate fi anulata.
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => setMesajDeSters(null)}
                                disabled={stergere}
                                style={{
                                    flex: 1, padding: '11px 20px', borderRadius: '30px',
                                    border: '1.5px solid #e2e8f0', background: '#fff',
                                    color: '#475569', fontWeight: '700', fontSize: '14px',
                                    cursor: stergere ? 'not-allowed' : 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                Renunta
                            </button>
                            <button
                                onClick={confirmaStergere}
                                disabled={stergere}
                                style={{
                                    flex: 1, padding: '11px 20px', borderRadius: '30px', border: 'none',
                                    background: stergere ? '#fca5a5' : '#dc2626',
                                    color: '#fff', fontWeight: '700', fontSize: '14px',
                                    cursor: stergere ? 'not-allowed' : 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                {stergere ? 'Se sterge...' : 'Da, sterge'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MesajeTab;