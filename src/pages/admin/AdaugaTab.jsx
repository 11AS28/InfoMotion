// AdaugaTab.jsx modificat profesional pentru Serverless API
import { useState } from 'react';
import Editor, {
  BtnBold, BtnItalic, BtnUnderline, BtnStrikeThrough,
  BtnNumberedList, BtnBulletList, BtnLink, BtnClearFormatting, Toolbar,
} from 'react-simple-wysiwyg';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'sonner';

// Stare implicită pentru un quiz gol
const emptyQuiz = () =>
  Array(5).fill(0).map(() => ({ intrebare: '', variante: ['', '', '', ''], corect: 0 }));

export default function AdaugaTab({
  isEditing,
  propunereInCurs,
  propuneri,
  initialData,        // obiect cu toate câmpurile precompletate (pt edit/aprobare)
  onSuccess,          // callback după publicare
  onCancel,
  adminPassword,      // Primit din Dashboard pentru validarea securizării
  adminUsername,      // Primit din Dashboard pentru validarea securizării
}) {
  const d = initialData || {};

  const [fId, setFId] = useState(d.id || '');
  const [fClasa, setFClasa] = useState(d.clasa || 'clasa-9');
  const [fOrdine, setFOrdine] = useState(d.ordine || 1);
  const [fTitlu, setFTitlu] = useState(d.titlu || '');
  const [fDescriere, setFDescriere] = useState(d.descriere || '');
  const [fTeorie, setFTeorie] = useState(d.teorie || '');
  const [fCod, setFCod] = useState(d.cod || '');
  const [fCodSimulatorCPP, setFCodSimulatorCPP] = useState(d.codSimulatorCPP || '');
  const [fAnim, setFAnim] = useState(d.anim || 'null');
  const [fAnimCustom, setFAnimCustom] = useState(d.animCustom || '');
  const [pbRows, setPbRows] = useState(d.pbRows || [{ id: '', titlu: '', url: '' }]);
  const [quiz, setQuiz] = useState(d.quiz || emptyQuiz());
  const [cfProblems, setCfProblems] = useState(d.codeforces || ['', '']);
  const [loading, setLoading] = useState(false);

  // Helper ca să știm rapid dacă suntem pe modul "Concepte"
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
      // Notificările rămân pe frontend pentru că utilizatorul de rând oricum își citește/scrie notificările proprii
      await addDoc(collection(db, 'users', userId, 'notifications'), {
        type, text, read: false, createdAt: serverTimestamp(),
        cheieSecuritate: adminPassword,
        adminUsername: adminUsername
      });
    } catch (e) {
      console.error('Eroare notificare:', e);
    }
  };

  const handlePublish = async () => {
    if (!fId || !fTitlu) return toast.warning('Completează ID și Titlu!');
    setLoading(true);

    try {
      let categorieVal = null;
      let clasaFinala = fClasa;
      if (fClasa === 'olimpici') { categorieVal = 'olimpiada'; clasaFinala = 'olimpici'; }
      else if (fClasa === 'concepte') { categorieVal = 'concepte'; clasaFinala = 'concepte'; }

      let ordineFinala = Number(fOrdine);

      // Pregătim obiectul curat cu datele lecției
      const lectieData = {
        id: fId, clasa: clasaFinala, categorie: categorieVal,
        ordine: ordineFinala, titlu: fTitlu, descriere: fDescriere,
        teorie: fTeorie, codCPlusPlus: fCod, codSimulatorCPP: fCodSimulatorCPP,
        animatie: fAnim === 'null' ? null : fAnim === 'custom' ? fAnimCustom : fAnim,
        problemePbinfo: esteConcept ? [] : pbRows.filter((r) => r.id || r.titlu),
        quiz: esteConcept ? [] : quiz,
        codeforces: esteConcept ? [] : cfProblems,
        dataModificarii: new Date().toISOString()
      };

      // Trimitem totul către serverless API-ul nostru global securizat
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
            fId,
            lectieData
          }
        })
      });

      if (!response.ok) {
        throw new Error((await response.json()).error || 'Eroare necunoscută la API.');
      }

      localStorage.removeItem("infoMotion_lectii");

      if (propunereInCurs) {
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
        <div className="admin-propunere-banner">
          <strong>Mod Aprobare Propunere:</strong> datele au fost precompletate.
          Adaugă ID-ul lecției, verifică textul și apoi publică.
        </div>
      )}

      <div className="admin-form-grid">
        {/* ID */}
        <div className="admin-field">
          <label>ID (Slug)</label>
          <input type="text" value={fId} onChange={(e) => setFId(e.target.value)} disabled={isEditing && !propunereInCurs} placeholder="ex: grafuri-introducere" />
          {isEditing && !propunereInCurs && <small>ID-ul nu poate fi schimbat după publicare.</small>}
        </div>

        {/* Clasă */}
        <div className="admin-field">
          <label>Clasă / Secțiune specială</label>
          <select value={fClasa} onChange={(e) => setFClasa(e.target.value)}>
            <option value="clasa-9">Clasa 9</option>
            <option value="clasa-10">Clasa 10</option>
            <option value="clasa-11">Clasa 11</option>
            <option value="olimpici">Olimpici</option>
            <option value="concepte">Concepte Generale</option>
          </select>
        </div>

        {/* Ordine */}
        <div className="admin-field">
          <label>Număr de ordine</label>
          <input type="number" value={fOrdine} onChange={(e) => setFOrdine(e.target.value)} min="1" placeholder="ex: 1" />
        </div>

        {/* Titlu */}
        <div className="admin-field admin-field--full">
          <label>Titlu</label>
          <input type="text" value={fTitlu} onChange={(e) => setFTitlu(e.target.value)} />
        </div>

        {/* Descriere */}
        <div className="admin-field admin-field--full">
          <label>Descriere scurtă</label>
          <input type="text" value={fDescriere} onChange={(e) => setFDescriere(e.target.value)} />
        </div>

        {/* Teorie */}
        <div className="admin-field admin-field--full" style={{ marginBottom: '40px' }}>
          <label style={{ marginBottom: '8px', display: 'block' }}>Teorie lecție (Rich Text Editor)</label>
          <div style={{ background: '#fff', color: '#333', borderRadius: '8px' }}>
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
          <p className="admin-help-text">
            Pentru a stiliza lecția poți băga în chenar albastru un titlu punând ### la începutul liniei.
          </p>
        </div>

        {/* Animație */}
        <div className="admin-field admin-field--full">
          <label>Animație Interactivă (Opțională)</label>
          <div className="admin-anim-options" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            {['null', 'BubbleSortAnim', 'CautareBinaraAnim', 'custom'].map((opt) => (
              <button key={opt} type="button" className={`admin-anim-opt ${fAnim === opt ? 'selected' : ''}`} onClick={() => setFAnim(opt)}>
                {opt === 'null' ? 'Fără' : opt === 'custom' ? 'Alt nume' : opt}
              </button>
            ))}
          </div>
          {fAnim === 'custom' && (
            <input type="text" value={fAnimCustom} onChange={(e) => setFAnimCustom(e.target.value)} placeholder="Nume componentă React" style={{ marginTop: '10px' }} />
          )}
        </div>

        {/* Cod C++ */}
        <div className="admin-field admin-field--full">
          <label>Cod C++ (Lasă gol dacă nu e nevoie)</label>
          <textarea
            className="admin-textarea-code"
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
          />
        </div>

        {/* SECȚIUNI ASCUNSE PENTRU CONCEPTE */}
        {!esteConcept && (
          <>
            {/* Pbinfo */}
            <div className="admin-field admin-field--full">
              <div className="admin-section-divider">Probleme Pbinfo</div>
              {pbRows.map((row, idx) => (
                <div key={idx} className="admin-pb-row">
                  <input type="text" value={row.id} onChange={(e) => updatePb(idx, 'id', e.target.value)} placeholder="ID" className="admin-pb-id" />
                  <input type="text" value={row.titlu} onChange={(e) => updatePb(idx, 'titlu', e.target.value)} placeholder="Titlu" />
                  <input type="text" value={row.url} onChange={(e) => updatePb(idx, 'url', e.target.value)} placeholder="URL" />
                  <button type="button" onClick={() => removePbRow(idx)}>✕</button>
                </div>
              ))}
              <button type="button" className="admin-add-pb" onClick={addPbRow}>+ Adaugă link</button>
            </div>

            {/* Quiz */}
            <div className="admin-field admin-field--full">
              <div className="admin-section-divider">Quiz (5 Întrebări)</div>
              {quiz.map((q, qIdx) => (
                <div key={qIdx} className="admin-quiz-setup-card" style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                  <input type="text" placeholder={`Întrebarea ${qIdx + 1}`} value={q.intrebare} onChange={(e) => updateQuiz(qIdx, 'intrebare', e.target.value)} style={{ width: '100%', fontWeight: 'bold', marginBottom: '10px' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {q.variante.map((v, vIdx) => (
                      <div key={vIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                        <input type="radio" name={`correct-${qIdx}`} checked={q.corect === vIdx} onChange={() => updateQuiz(qIdx, 'corect', vIdx)} style={{ flexShrink: 0, width: '16px', height: '16px', cursor: 'pointer' }} />
                        <input type="text" placeholder={`Varianta ${vIdx + 1}`} value={v} onChange={(e) => updateQuiz(qIdx, 'varianta', e.target.value, vIdx)} style={{ flex: 1, minWidth: 0 }} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button className="admin-btn-primary" onClick={handlePublish} disabled={loading}>
          {loading ? 'Se procesează...' : isEditing || propunereInCurs ? '💾 Salvează modificările' : '🚀 Publică pe Site'}
        </button>
        {(isEditing || propunereInCurs) && (
          <button className="admin-btn-secondary" onClick={onCancel}>Anulează</button>
        )}
      </div>
    </div>
  );
}