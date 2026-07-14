import { useState } from 'react';
import Editor, {
  BtnBold, BtnItalic, BtnUnderline, BtnStrikeThrough,
  BtnNumberedList, BtnBulletList, BtnLink, BtnClearFormatting, Toolbar,
} from 'react-simple-wysiwyg';
import { toast } from 'sonner';

const emptyQuiz = () =>
  Array(5).fill(0).map(() => ({ intrebare: '', variante: ['', '', '', ''], corect: 0 }));

export default function AdaugaTab({
  isEditing,
  propunereInCurs,
  propuneri = [],
  initialData,
  onSuccess,
  onCancel,
  adminPassword,
  adminUsername,
}) {
  const d = initialData || {};

  const [fId, setFId] = useState(d.id || '');
  const [fClasa, setFClasa] = useState(d.clasa || 'clasa-9');
  const [fOrdine, setFOrdine] = useState(d.ordine || 1);
  const [fTitlu, setFTitlu] = useState(d.titlu || '');
  const [fDescriere, setFDescriere] = useState(d.descriere || '');
  const [fAdaugatDe, setFAdaugatDe] = useState(d.adaugatDe || adminUsername || '');
  const [fTeorie, setFTeorie] = useState(d.teorie || '');
  const [fCod, setFCod] = useState(d.cod || d.codCPlusPlus || '');
  const [fCodSimulatorCPP, setFCodSimulatorCPP] = useState(d.codSimulatorCPP || '');
  const [fAnim, setFAnim] = useState(d.animatie ? (['BubbleSortAnim', 'CautareBinaraAnim'].includes(d.animatie) ? d.animatie : 'custom') : 'null');
  const [fAnimCustom, setFAnimCustom] = useState(!['BubbleSortAnim', 'CautareBinaraAnim', undefined, null].includes(d.animatie) ? d.animatie : '');
  const [pbRows, setPbRows] = useState(d.problemePbinfo || d.pbRows || [{ id: '', titlu: '', url: '' }]);
  const [quiz, setQuiz] = useState(d.quiz || emptyQuiz());
  const [cfProblems, setCfProblems] = useState(d.codeforces || ['', '']);
  const [loading, setLoading] = useState(false);

  const esteConcept = fClasa === 'concepte';

  const updatePb = (idx, field, val) =>
    setPbRows(pbRows.map((r, i) => (i === idx ? { ...r, [field]: val } : r)));
  const addPbRow = () => setPbRows([...pbRows, { id: '', titlu: '', url: '' }]);
  const removePbRow = (idx) => pbRows.length > 1 && setPbRows(pbRows.filter((_, i) => i !== idx));

  const updateQuiz = (qIdx, field, val, vIdx = null) => {
    const q = [...quiz];
    if (field === 'varianta') q[qIdx].variante[vIdx] = val;
    else q[qIdx][field] = val;
    setQuiz(q);
  };

  const sendUserNotification = async (userId, type, text) => {
    if (!userId) return;
    try {
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_notification',
          username: adminUsername,
          sessionToken: adminPassword,
          data: { userId, type, text }
        })
      });
    } catch (e) {
      console.error('Eroare la trimiterea notificării de aprobare:', e);
    }
  };

  const handlePublish = async () => {
    if (!fId.trim() || !fTitlu.trim()) return toast.warning('Completează ID și Titlu!');
    setLoading(true);

    try {
      let categorieVal = null;
      let clasaFinala = fClasa;
      if (fClasa === 'olimpici') { categorieVal = 'olimpiada'; clasaFinala = 'olimpici'; }
      else if (fClasa === 'concepte') { categorieVal = 'concepte'; clasaFinala = 'concepte'; }

      let ordineFinala = Number(fOrdine);

      const lectieData = {
        id: fId.trim(), clasa: clasaFinala, categorie: categorieVal,
        ordine: ordineFinala, titlu: fTitlu.trim(), descriere: fDescriere.trim(),
        adaugatDe: fAdaugatDe || 'Echipa InfoMotion',
        teorie: fTeorie, codCPlusPlus: fCod, codSimulatorCPP: fCodSimulatorCPP,
        animatie: fAnim === 'null' ? null : fAnim === 'custom' ? fAnimCustom : fAnim,
        problemePbinfo: esteConcept ? [] : pbRows.filter((r) => r.id || r.titlu),
        quiz: esteConcept ? [] : quiz,
        codeforces: esteConcept ? [] : cfProblems,
        dataModificarii: new Date().toISOString()
      };

      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'publish_lesson',
          username: adminUsername,
          sessionToken: adminPassword,
          data: {
            isEditing,
            propunereInCurs,
            clasaFinala,
            categorieVal,
            ordineFinala,
            fId: fId.trim(),
            lectieData
          }
        })
      });

      if (!response.ok) {
        throw new Error((await response.json()).error || 'Eroare necunoscută la API.');
      }

      try {
        const cachedLessonsRaw = localStorage.getItem('infomotion_lessons_cache_v3');
        
        if (cachedLessonsRaw) {
          const cachedLessons = JSON.parse(cachedLessonsRaw);

          let extrasClasa = 9;
          if (clasaFinala) {
            const digits = clasaFinala.toString().match(/\d+/);
            if (digits) {
              extrasClasa = parseInt(digits[0], 10);
            }
          }

          const nouaLectieCache = {
            id: fId.trim(),
            ...lectieData,
            clasaNumerica: extrasClasa,
            esteOlimpiada: clasaFinala === 'olimpici',
            esteConcept: clasaFinala === 'concepte'
          };

          let updatedLessons = [];

          if (isEditing) {
            updatedLessons = cachedLessons.map((lectie) => 
              lectie.id === fId.trim() ? nouaLectieCache : lectie
            );
          } else {
            updatedLessons = [nouaLectieCache, ...cachedLessons];
          }

          localStorage.setItem('infomotion_lessons_cache_v3', JSON.stringify(updatedLessons));
        } else {
          localStorage.removeItem('infomotion_lessons_cache_v3');
        }
      } catch (cacheError) {
        console.error("Eroare la actualizarea silențioasă a cache-ului local:", cacheError);
        localStorage.removeItem('infomotion_lessons_cache_v3');
      }

      if (propunereInCurs && propuneri.length > 0) {
        const propGasita = propuneri.find((p) => p.id === propunereInCurs);
        if (propGasita?.autorId) {
          await sendUserNotification(propGasita.autorId, 'lectie_aprobata',
            `Propunerea ta pentru lecția „${propGasita.titlu}" a fost aprobată.`);
        }
      }

      toast.success(isEditing ? '🚀 Modificări salvate în cloud prin API!' : '🎉 Lecție publicată cu succes prin API!');
      onSuccess();
    } catch (e) {
      toast.error('Eroare la salvare: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-card admin-form-card">
      <div className="admin-form-title">{isEditing ? `Editare lecție: ${fId}` : 'Lecție nouă'}</div>

      {propunereInCurs && (
        <div className="admin-propunere-banner" style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
          <strong>Mod Aprobare Propunere:</strong> datele au fost precompletate.
          Adaugă ID-ul lecției, verifică textul și apoi publică.
        </div>
      )}

      <div className="admin-form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          {/* ID */}
          <div className="admin-field" style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontWeight: '700', fontSize: '13px', marginBottom: '6px' }}>ID (Slug)</label>
            <input type="text" value={fId} onChange={(e) => setFId(e.target.value)} disabled={isEditing && !propunereInCurs} placeholder="ex: grafuri-introducere" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            {isEditing && !propunereInCurs && <small style={{ color: '#64748b', fontSize: '11px' }}>ID-ul nu poate fi schimbat după publicare.</small>}
          </div>

          {/* Clasă */}
          <div className="admin-field" style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontWeight: '700', fontSize: '13px', marginBottom: '6px' }}>Clasă / Secțiune specială</label>
            <select value={fClasa} onChange={(e) => setFClasa(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}>
              <option value="clasa-9">Clasa 9</option>
              <option value="clasa-10">Clasa 10</option>
              <option value="clasa-11">Clasa 11</option>
              <option value="olimpici">Olimpici</option>
              <option value="concepte">Concepte Generale</option>
            </select>
          </div>

          {/* Ordine */}
          <div className="admin-field" style={{ flex: '1 1 120px' }}>
            <label style={{ display: 'block', fontWeight: '700', fontSize: '13px', marginBottom: '6px' }}>Număr de ordine</label>
            <input type="number" value={fOrdine} onChange={(e) => setFOrdine(e.target.value)} min="1" placeholder="ex: 1" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>
        </div>

        {/* Titlu */}
        <div className="admin-field">
          <label style={{ display: 'block', fontWeight: '700', fontSize: '13px', marginBottom: '6px' }}>Titlu</label>
          <input type="text" value={fTitlu} onChange={(e) => setFTitlu(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
        </div>

        {/* Descriere */}
        <div className="admin-field">
          <label style={{ display: 'block', fontWeight: '700', fontSize: '13px', marginBottom: '6px' }}>Descriere scurtă</label>
          <input type="text" value={fDescriere} onChange={(e) => setFDescriere(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
        </div>

        <div className="admin-field">
          <label style={{ display: 'block', fontWeight: '700', fontSize: '13px', marginBottom: '6px' }}>Lecție adăugată de</label>
          <input type="text" value={fAdaugatDe} onChange={(e) => setFAdaugatDe(e.target.value)} placeholder="ex: Prof. Ionescu" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          <small style={{ color: '#64748b', fontSize: '11px', display: 'block', marginTop: '4px' }}>Apare pe pagina lecției, sub titlu. Dacă lași gol, apare „Echipa InfoMotion”.</small>
        </div>

        {/* Teorie */}
        <div className="admin-field" style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', fontWeight: '700', fontSize: '13px', marginBottom: '6px' }}>Teorie lecție (Rich Text Editor)</label>
          <div style={{ background: '#fff', color: '#333', borderRadius: '8px', border: '1px solid #cbd5e1', overflow: 'hidden' }}>
            <Editor value={fTeorie} onChange={(e) => setFTeorie(e.target.value)} style={{ minHeight: '250px' }}>
              <Toolbar>
                <BtnBold /><BtnItalic /><BtnUnderline /><BtnStrikeThrough />
                <span style={{ borderLeft: '1px solid #ccc', margin: '0 8px' }} />
                <BtnNumberedList /><BtnBulletList />
                <span style={{ borderLeft: '1px solid #ccc', margin: '0 8px' }} />
                <BtnLink /><BtnClearFormatting />
              </Toolbar>
            </Editor>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
            💡 Pentru a stiliza lecția poți introduce în chenar albastru un titlu secundar adăugând structura standard Markdown `###` la începutul liniei.
          </p>
        </div>

        {/* Animație */}
        <div className="admin-field">
          <label style={{ display: 'block', fontWeight: '700', fontSize: '13px', marginBottom: '6px' }}>Animație Interactivă (Opțională)</label>
          <div style={{ display: 'flex', gap: '10px', margin: '6px 0 10px 0' }}>
            {['null', 'BubbleSortAnim', 'CautareBinaraAnim', 'custom'].map((opt) => (
              <button key={opt} type="button" onClick={() => setFAnim(opt)} style={{
                padding: '8px 16px', borderRadius: '20px', border: fAnim === opt ? '2px solid #01696f' : '1px solid #cbd5e1',
                background: fAnim === opt ? 'rgba(1,105,111,0.08)' : '#fff', color: fAnim === opt ? '#01696f' : '#475569',
                fontWeight: '700', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s'
              }}>
                {opt === 'null' ? 'Fără' : opt === 'custom' ? 'Alt nume' : opt}
              </button>
            ))}
          </div>
          {fAnim === 'custom' && (
            <input type="text" value={fAnimCustom} onChange={(e) => setFAnimCustom(e.target.value)} placeholder="Nume componentă exactă din React (ex: ArboreIndexatAnim)" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          )}
        </div>

        {/* Cod C++ */}
        <div className="admin-field">
          <label style={{ display: 'block', fontWeight: '700', fontSize: '13px', marginBottom: '6px' }}>Cod C++</label>
          <textarea
            value={fCod}
            onChange={(e) => setFCod(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Tab') {
                e.preventDefault();
                const s = e.target.selectionStart;
                const end = e.target.selectionEnd;
                const val = e.target.value;
                e.target.value = val.substring(0, s) + '    ' + val.substring(end);
                e.target.selectionStart = e.target.selectionEnd = s + 4;
                setFCod(e.target.value);
              }
            }}
            rows={8}
            placeholder="// Introdu aici implementarea algoritmului..."
            style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontSize: '14px', background: '#f8fafc', outline: 'none' }}
          />
        </div>

        {!esteConcept && (
          <>
            {/* Pbinfo */}
            <div className="admin-field" style={{ marginTop: '10px' }}>
              <div style={{ fontWeight: '700', borderBottom: '2px solid #e2e8f0', paddingBottom: '6px', marginBottom: '14px', fontSize: '14px', color: '#0f172a' }}>Probleme Pbinfo</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {pbRows.map((row, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input type="text" value={row.id} onChange={(e) => updatePb(idx, 'id', e.target.value)} placeholder="ID" style={{ width: '70px', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    <input type="text" value={row.titlu} onChange={(e) => updatePb(idx, 'titlu', e.target.value)} placeholder="Titlu problemă" style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    <input type="text" value={row.url} onChange={(e) => updatePb(idx, 'url', e.target.value)} placeholder="URL complet link" style={{ flex: 2, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    {pbRows.length > 1 && (
                      <button type="button" onClick={() => removePbRow(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px', padding: '0 8px' }}>✕</button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" onClick={addPbRow} style={{ marginTop: '10px', background: '#f1f5f9', border: '1px dashed #cbd5e1', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#475569' }}>+ Adaugă link problemă</button>
            </div>


            {/* Quiz */}
            <div className="admin-field" style={{ marginTop: '15px' }}>
              <div style={{ fontWeight: '700', borderBottom: '2px solid #e2e8f0', paddingBottom: '6px', marginBottom: '14px', fontSize: '14px', color: '#0f172a' }}>Quiz Evaluare (Set standard de 5 Întrebări)</div>
              {quiz.map((q, qIdx) => (
                <div key={qIdx} style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '10px', marginBottom: '15px', background: '#f8fafc' }}>
                  <input type="text" placeholder={`Cerință Întrebare ${qIdx + 1}`} value={q.intrebare} onChange={(e) => updateQuiz(qIdx, 'intrebare', e.target.value)} style={{ width: '100%', fontWeight: '700', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '12px', background: '#fff' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {q.variante.map((v, vIdx) => (
                      <div key={vIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                        <input type="radio" name={`correct-${qIdx}`} checked={q.corect === vIdx} onChange={() => updateQuiz(qIdx, 'corect', vIdx)} style={{ flexShrink: 0, width: '17px', height: '17px', cursor: 'pointer' }} />
                        <input type="text" placeholder={`Răspunsul ${vIdx + 1}`} value={v} onChange={(e) => updateQuiz(qIdx, 'varianta', e.target.value, vIdx)} style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '30px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
        <button onClick={handlePublish} disabled={loading} style={{
          padding: '12px 28px', borderRadius: '30px', border: 'none',
          background: loading ? '#cbd5e1' : '#01696f', color: loading ? '#94a3b8' : '#fff',
          fontWeight: '700', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s'
        }}>
          {loading ? 'Se procesează...' : isEditing || propunereInCurs ? '💾 Salvează modificările' : '🚀 Publică pe Site'}
        </button>
        {(isEditing || propunereInCurs) && (
          <button onClick={onCancel} style={{ padding: '12px 24px', borderRadius: '30px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>Anulează</button>
        )}
      </div>
    </div>
  );
}