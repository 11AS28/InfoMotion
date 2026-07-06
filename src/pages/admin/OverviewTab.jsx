 export default function OverviewTab({ firebaseLessons }) {
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

  return (
    <>
      <div className="admin-stat-grid">
        <div className="admin-stat-card" style={{ borderColor: '#378ADD' }}>
          <div className="admin-stat-label">Total lecțiile</div>
          <div className="admin-stat-num">{totalLectii}</div>
          <div className="admin-stat-sub">în Cloud</div>
        </div>
        <div className="admin-stat-card" style={{ borderColor: '#639922' }}>
          <div className="admin-stat-label">Cu animație</div>
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
          <div className="admin-section-title">Distribuție pe clase</div>
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
    </>
  );
}