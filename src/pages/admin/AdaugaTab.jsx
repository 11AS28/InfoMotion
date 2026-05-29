// AdaugaTab.jsx
import { useState } from 'react';
import Editor, {
  BtnBold, BtnItalic, BtnUnderline, BtnStrikeThrough,
  BtnNumberedList, BtnBulletList, BtnLink, BtnClearFormatting, Toolbar,
} from 'react-simple-wysiwyg';
import { 
  doc, setDoc, deleteDoc, addDoc, collection, serverTimestamp,
  query, where, orderBy, limit, getDocs, writeBatch 
} from 'firebase/firestore';
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
      await addDoc(collection(db, 'users', userId, 'notifications'), {
        type, text, read: false, createdAt: serverTimestamp(),
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

      const lectiiRef = collection(db, 'lectii');
      let ordineFinala = Number(fOrdine);

      // --- LOGICA NOUĂ PENTRU DECALARE ȘI AUTO-INCREMENT ---
      
      // Cream un batch (un pachet de modificări care se execută toate deodată)
      const batch = writeBatch(db);

      if (!isEditing && !propunereInCurs) {
        // CAZUL A: Dacă e o lecție complet nouă, verificăm dacă numărul de ordine există deja
        const qVerificare = query(lectiiRef, where('clasa', '==', clasaFinala), where('ordine', '==', ordineFinala));
        const snapVerificare = await getDocs(qVerificare);

        if (!snapVerificare.empty) {
          // Dacă numărul există deja, luăm toate lecțiile din clasa respectivă care au ordine >= numărul introdus
          const qDecalare = query(lectiiRef, where('clasa', '==', clasaFinala), where('ordine', '>=', ordineFinala));
          const snapDecalare = await getDocs(qDecalare);

          // Le decalăm pe toate cu +1
          snapDecalare.forEach((document) => {
            const docRef = doc(db, 'lectii', document.id);
            batch.update(docRef, { ordine: document.data().ordine + 1 });
          });
          toast.info(`Lecțiile existente au fost decalate pentru a face loc pe poziția ${ordineFinala}.`);
        }
      }

      // Pregătim datele lecției
      const lectieData = {
        id: fId, clasa: clasaFinala, categorie: categorieVal,
        ordine: ordineFinala, titlu: fTitlu, descriere: fDescriere,
        teorie: fTeorie, codCPlusPlus: fCod, codSimulatorCPP: fCodSimulatorCPP,
        animatie: fAnim === 'null' ? null : fAnim === 'custom' ? fAnimCustom : fAnim,
        problemePbinfo: pbRows.filter((r) => r.id || r.titlu),
        quiz, codeforces: cfProblems,
        dataModificarii: new Date().toISOString(),
      };

      // Adăugăm și salvarea lecției în același batch
      const nouaLectieRef = doc(db, 'lectii', fId);
      batch.set(nouaLectieRef, lectieData);

      // --- STRUCTURA DE PROVENIENȚĂ PROPUNERI (Rămâne neschimbată) ---
      if (propunereInCurs) {
        const propGasita = propuneri.find((p) => p.id === propunereInCurs);
        if (propGasita?.autorId) {
          await sendUserNotification(propGasita.autorId, 'lectie_aprobata',
            `Propunerea ta pentru lecția „${propGasita.titlu}" a fost aprobată.`);
        }
        // Ștergem propunerea deoarece a fost aprobată (o adăugăm tot în batch ca să fie atomic)
        const propRef = doc(db, 'propuneri_lectii', propunereInCurs);
        batch.delete(propRef);
      }

      // Executăm toate operațiunile deodată în baza de date!
      await batch.commit();

      toast.success(isEditing ? '✅ Modificări salvate în cloud!' : '🚀 Lecție publicată cu succes!');
      onSuccess();
    } catch (e) {
      toast.error('Eroare la salvare: ' + e.message);
    }
    setLoading(false);
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
          <label>Animație Interactivă</label>
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
          <label>Cod C++</label>
          <textarea className="admin-textarea-code" value={fCod} onChange={(e) => setFCod(e.target.value)} rows={8} />
        </div>

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