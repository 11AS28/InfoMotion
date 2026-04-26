import { useState } from 'react';
import { lessonsData } from '../lessonsData';
import '../pages_css/admin.css';

// ============================================================
//  CREDENȚIALE ADMIN — modifică aici username-urile și parolele
// ============================================================
const ADMINS = [
  { username: 'fane', password: 'infomotion2025' },
  { username: 's.m._.maria', password: 'lectii2025' },
];
// ============================================================

// ─── LOGIN ───────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  function handleLogin(e) {
    e.preventDefault();
    const match = ADMINS.find(
      (a) => a.username === username && a.password === password
    );
    if (match) {
      onLogin(username);
    } else {
      setError('Username sau parolă incorecte.');
      setPassword('');
    }
  }

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          InfoMotion<span>.</span>
        </div>
        <p className="admin-login-subtitle">Panou de administrare</p>

        <form onSubmit={handleLogin} className="admin-login-form">
          <div className="admin-field">
            <label>Username</label>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              placeholder="admin1"
              required
            />
          </div>
          <div className="admin-field">
            <label>Parolă</label>
            <div className="admin-pass-wrap">
              <input
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••••"
                required
              />
              <button
                type="button"
                className="admin-show-pass"
                onClick={() => setShowPass((v) => !v)}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && <p className="admin-error">{error}</p>}

          <button type="submit" className="admin-btn-login">
            Intră în cont
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────
function Dashboard({ username, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');

  // ── State formular lecție nouă
  const [fId, setFId] = useState('');
  const [fClasa, setFClasa] = useState('clasa-9');
  const [fTitlu, setFTitlu] = useState('');
  const [fDescriere, setFDescriere] = useState('');
  const [fTeorie, setFTeorie] = useState('');
  const [fCod, setFCod] = useState('');
  const [fAnim, setFAnim] = useState('null');
  const [fAnimCustom, setFAnimCustom] = useState('');
  const [pbRows, setPbRows] = useState([{ id: '', titlu: '', url: '' }]);
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [generated, setGenerated] = useState(false);

  // ── Statistici
  const totalLectii = lessonsData.length;
  const cuAnimatie = lessonsData.filter((l) => l.animatie).length;
  const claseUnice = [...new Set(lessonsData.map((l) => l.clasa))].length;
  const totalPbinfo = lessonsData.reduce(
    (s, l) => s + (l.problemePbinfo || []).length, 0
  );

  const countPerClasa = { 9: 0, 10: 0, 11: 0, 12: 0 };
  lessonsData.forEach((l) => {
    const n = parseInt(l.clasa.split('-')[1]);
    if (countPerClasa[n] !== undefined) countPerClasa[n]++;
  });
  const maxCount = Math.max(...Object.values(countPerClasa), 1);

  // ── Pbinfo rows
  function updatePb(idx, field, val) {
    setPbRows((rows) =>
      rows.map((r, i) => (i === idx ? { ...r, [field]: val } : r))
    );
  }
  function addPbRow() {
    setPbRows((rows) => [...rows, { id: '', titlu: '', url: '' }]);
  }
  function removePbRow(idx) {
    if (pbRows.length > 1) setPbRows((rows) => rows.filter((_, i) => i !== idx));
  }

  // ── Generare cod
  function generateCode() {
    const animVal =
      fAnim === 'null'
        ? 'null'
        : fAnim === 'custom'
        ? `"${fAnimCustom}"`
        : `"${fAnim}"`;

    const validPb = pbRows.filter((r) => r.id || r.titlu);
    const pbStr =
      validPb.length > 0
        ? `[\n      ${validPb
            .map(
              (p) =>
                `{\n        idProblema: "${p.id}",\n        titluProblema: "${p.titlu}",\n        url: "${p.url}"\n      }`
            )
            .join(',\n      ')}\n    ]`
        : '[]';

    const code = `{
  id: "${fId}",
  clasa: "${fClasa}",
  titlu: "${fTitlu}",
  descriere: "${fDescriere}",
  teorie: \`${fTeorie}\`,
  problemePbinfo: ${pbStr},
  animatie: ${animVal},
  codCPlusPlus: \`${fCod}\`
}`;

    setGeneratedCode(code);
    setGenerated(true);
    setCopied(false);
  }

  function resetForm() {
    setFId(''); setFClasa('clasa-9'); setFTitlu('');
    setFDescriere(''); setFTeorie(''); setFCod('');
    setFAnim('null'); setFAnimCustom('');
    setPbRows([{ id: '', titlu: '', url: '' }]);
    setGeneratedCode(''); setGenerated(false); setCopied(false);
  }

  function copyCode() {
    navigator.clipboard.writeText(generatedCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const badgeClass = (clasa) => {
    const n = clasa.split('-')[1];
    return `admin-badge admin-badge-${n}`;
  };

  const barColors = { 9: '#378ADD', 10: '#639922', 11: '#BA7517', 12: '#D4537E' };

  return (
    <div className="admin-wrapper">
      {/* ── Header */}
      <header className="admin-header">
        <div className="admin-header-logo">
          InfoMotion<span>.</span> <em>Admin</em>
        </div>
        <div className="admin-header-right">
          <span className="admin-user-pill">👤 {username}</span>
          <button className="admin-btn-logout" onClick={onLogout}>
            Deconectare
          </button>
        </div>
      </header>

      {/* ── Tabs */}
      <div className="admin-tabs-bar">
        {['overview', 'lectii', 'adauga'].map((t) => (
          <button
            key={t}
            className={`admin-tab ${activeTab === t ? 'active' : ''}`}
            onClick={() => setActiveTab(t)}
          >
            {t === 'overview' && 'Prezentare generală'}
            {t === 'lectii' && 'Lecțiile mele'}
            {t === 'adauga' && 'Adaugă lecție'}
          </button>
        ))}
      </div>

      <main className="admin-main">

        {/* ══════════════ TAB 1 — OVERVIEW ══════════════ */}
        {activeTab === 'overview' && (
          <>
            {/* Stat cards */}
            <div className="admin-stat-grid">
              {[
                { label: 'Total lecții', val: totalLectii, sub: 'în baza de date' },
                { label: 'Cu animație', val: cuAnimatie, sub: 'lecții interactive' },
                { label: 'Clase acoperite', val: `${claseUnice}/4`, sub: 'din 4 posibile' },
                { label: 'Probleme pbinfo', val: totalPbinfo, sub: 'linkuri totale' },
              ].map((s) => (
                <div key={s.label} className="admin-stat-card">
                  <div className="admin-stat-label">{s.label}</div>
                  <div className="admin-stat-num">{s.val}</div>
                  <div className="admin-stat-sub">{s.sub}</div>
                </div>
              ))}
            </div>

            <div className="admin-two-col">
              {/* Distribuție pe clase */}
              <div className="admin-card">
                <div className="admin-section-title">Lecții pe clasă</div>
                {[9, 10, 11, 12].map((c) => (
                  <div key={c} className="admin-bar-row">
                    <span className="admin-bar-label">Clasa {c}</span>
                    <div className="admin-bar-track">
                      <div
                        className="admin-bar-fill"
                        style={{
                          width: `${(countPerClasa[c] / maxCount) * 100}%`,
                          background: barColors[c],
                        }}
                      />
                    </div>
                    <span className="admin-bar-count">{countPerClasa[c]}</span>
                  </div>
                ))}
              </div>

              {/* Pagini site */}
              <div className="admin-card">
                <div className="admin-section-title">Pagini site</div>
                {[
                  ['/', 'Pagina principală'],
                  ['/lectii', 'Lista lecțiilor'],
                  ['/lectie/:id', 'Lecție individuală'],
                  ['/despre', 'Intro lecții'],
                  ['/contact', 'Contact'],
                ].map(([path, name]) => (
                  <div key={path} className="admin-page-row">
                    <code className="admin-route-code">{path}</code>
                    <span className="admin-page-name">{name}</span>
                    <span className="admin-badge-active">activ</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Animații */}
            <div className="admin-card">
              <div className="admin-section-title">Animații existente</div>
              <div className="admin-anim-list">
                {['BubbleSortAnim', 'CautareBinaraAnim'].map((a) => (
                  <div key={a} className="admin-anim-pill">
                    <span className="admin-anim-dot" />
                    {a}
                  </div>
                ))}
                <div className="admin-anim-pill admin-anim-pill--dashed">
                  + adaugă animație nouă
                </div>
              </div>
            </div>
          </>
        )}

        {/* ══════════════ TAB 2 — LECȚII ══════════════ */}
        {activeTab === 'lectii' && (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Titlu</th>
                    <th>Clasă</th>
                    <th>Animație</th>
                    <th>Probleme</th>
                  </tr>
                </thead>
                <tbody>
                  {lessonsData.map((l) => (
                    <tr key={l.id}>
                      <td><code className="admin-route-code">{l.id}</code></td>
                      <td className="admin-td-titlu">{l.titlu}</td>
                      <td>
                        <span className={badgeClass(l.clasa)}>
                          {l.clasa.replace('-', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {l.animatie
                          ? <span className="admin-badge admin-badge-anim">{l.animatie}</span>
                          : <span className="admin-badge admin-badge-none">—</span>}
                      </td>
                      <td className="admin-td-muted">
                        {(l.problemePbinfo || []).length} probleme
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="admin-hint">
              Datele sunt citite din <code>lessonsData.js</code>.
              Adaugă lecții noi din tab-ul „Adaugă lecție".
            </p>
          </>
        )}

        {/* ══════════════ TAB 3 — ADAUGĂ ══════════════ */}
        {activeTab === 'adauga' && (
          <>
            <div className="admin-card admin-form-card">
              <div className="admin-form-title">Lecție nouă</div>

              <div className="admin-form-grid">
                {/* ID */}
                <div className="admin-field">
                  <label>ID lecție (slug)</label>
                  <input
                    type="text"
                    value={fId}
                    onChange={(e) => setFId(e.target.value)}
                    placeholder="ex: selectie-sort"
                  />
                </div>

                {/* Clasă */}
                <div className="admin-field">
                  <label>Clasă</label>
                  <select value={fClasa} onChange={(e) => setFClasa(e.target.value)}>
                    <option value="clasa-9">Clasa 9</option>
                    <option value="clasa-10">Clasa 10</option>
                    <option value="clasa-11">Clasa 11</option>
                    <option value="clasa-12">Clasa 12</option>
                  </select>
                </div>

                {/* Titlu */}
                <div className="admin-field admin-field--full">
                  <label>Titlu lecție</label>
                  <input
                    type="text"
                    value={fTitlu}
                    onChange={(e) => setFTitlu(e.target.value)}
                    placeholder="ex: Algoritmul Selecție Sort"
                  />
                </div>

                {/* Descriere */}
                <div className="admin-field admin-field--full">
                  <label>Descriere scurtă</label>
                  <input
                    type="text"
                    value={fDescriere}
                    onChange={(e) => setFDescriere(e.target.value)}
                    placeholder="ex: Află cum funcționează sortarea prin selecție."
                  />
                </div>

                {/* Teorie */}
                <div className="admin-field admin-field--full">
                  <label>Teorie (text lung)</label>
                  <textarea
                    value={fTeorie}
                    onChange={(e) => setFTeorie(e.target.value)}
                    placeholder="Scrie teoria completă a lecției aici..."
                    rows={6}
                  />
                </div>

                {/* Animație */}
                <div className="admin-field admin-field--full">
                  <label>Animație</label>
                  <div className="admin-anim-options">
                    {[
                      { val: 'null', label: 'Fără animație' },
                      { val: 'BubbleSortAnim', label: 'BubbleSortAnim' },
                      { val: 'CautareBinaraAnim', label: 'CautareBinaraAnim' },
                      { val: 'custom', label: 'Alta...' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        className={`admin-anim-opt ${fAnim === opt.val ? 'selected' : ''}`}
                        onClick={() => setFAnim(opt.val)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {fAnim === 'custom' && (
                    <input
                      type="text"
                      value={fAnimCustom}
                      onChange={(e) => setFAnimCustom(e.target.value)}
                      placeholder="Numele componentei React"
                      style={{ marginTop: '8px' }}
                    />
                  )}
                </div>

                {/* Cod C++ */}
                <div className="admin-field admin-field--full">
                  <label>Cod C++ (opțional)</label>
                  <textarea
                    className="admin-textarea-code"
                    value={fCod}
                    onChange={(e) => setFCod(e.target.value)}
                    placeholder={'#include <iostream>\nusing namespace std;\n\nint main() {\n    // codul tău\n    return 0;\n}'}
                    rows={8}
                  />
                </div>

                {/* Probleme pbinfo */}
                <div className="admin-field admin-field--full">
                  <label>Probleme pbinfo</label>
                  <div className="admin-pb-rows">
                    {pbRows.map((row, idx) => (
                      <div key={idx} className="admin-pb-row">
                        <input
                          type="text"
                          value={row.id}
                          onChange={(e) => updatePb(idx, 'id', e.target.value)}
                          placeholder="#119"
                          className="admin-pb-id"
                        />
                        <input
                          type="text"
                          value={row.titlu}
                          onChange={(e) => updatePb(idx, 'titlu', e.target.value)}
                          placeholder="Titlu problemă"
                        />
                        <input
                          type="text"
                          value={row.url}
                          onChange={(e) => updatePb(idx, 'url', e.target.value)}
                          placeholder="https://www.pbinfo.ro/..."
                        />
                        <button
                          type="button"
                          className="admin-pb-remove"
                          onClick={() => removePbRow(idx)}
                          disabled={pbRows.length === 1}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <button type="button" className="admin-add-pb" onClick={addPbRow}>
                    + adaugă problemă pbinfo
                  </button>
                </div>
              </div>

              {/* Acțiuni */}
              <div className="admin-form-actions">
                <button className="admin-btn-primary" onClick={generateCode}>
                  Generează cod JS
                </button>
                <button className="admin-btn-secondary" onClick={resetForm}>
                  Resetează
                </button>
              </div>
            </div>

            {/* Preview cod generat */}
            {generated && (
              <div className="admin-card admin-code-preview-card">
                <div className="admin-section-title">
                  Cod generat — copiază în <code>lessonsData.js</code>
                </div>
                <pre className="admin-code-block">{generatedCode}</pre>
                <button className="admin-btn-secondary" onClick={copyCode}>
                  {copied ? '✓ Copiat!' : 'Copiază codul'}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// ─── COMPONENTA PRINCIPALĂ ────────────────────────────────────
function Admin() {
  const [loggedUser, setLoggedUser] = useState(null);

  if (!loggedUser) {
    return <LoginScreen onLogin={(u) => setLoggedUser(u)} />;
  }

  return <Dashboard username={loggedUser} onLogout={() => setLoggedUser(null)} />;
}

export default Admin;