// UtilizatoriTab.jsx
export default function UtilizatoriTab({ firebaseUsers }) {
  const totalUsers = firebaseUsers.length;
  const verifiedCFUsers = firebaseUsers.filter((u) => u.cfValidat).length;
  const totalPlatformXP = firebaseUsers.reduce((sum, u) => sum + (u.puncteTotale || 0), 0);
  const avgStreak =
    totalUsers > 0
      ? (firebaseUsers.reduce((sum, u) => sum + (u.streakCount || 0), 0) / totalUsers).toFixed(1)
      : 0;

  const topUsers = [...firebaseUsers]
    .sort((a, b) => (b.puncteTotale || 0) - (a.puncteTotale || 0))
    .slice(0, 5);
  const maxUserXP = topUsers.length > 0 ? Math.max(topUsers[0].puncteTotale || 1, 1) : 1;

  const topStreakUsers = [...firebaseUsers]
    .sort((a, b) => (b.streakCount || 0) - (a.streakCount || 0))
    .slice(0, 5);
  const maxUserStreak = topStreakUsers.length > 0 ? Math.max(topStreakUsers[0].streakCount || 1, 1) : 1;

  const userName = (user) => user.nume || (user.email ? user.email.split('@')[0] : 'Anonim');
  const medalColor = (i) => (i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : null);

  return (
    <>
      <div className="admin-stat-grid" style={{ marginBottom: '20px' }}>
        <div className="admin-stat-card" style={{ borderColor: '#378ADD' }}>
          <div className="admin-stat-label">Total Conturi</div>
          <div className="admin-stat-num">{totalUsers}</div>
          <div className="admin-stat-sub">Elevi înregistrați</div>
        </div>
        <div className="admin-stat-card" style={{ borderColor: '#639922' }}>
          <div className="admin-stat-label">Verificați Codeforces</div>
          <div className="admin-stat-num">{verifiedCFUsers}</div>
          <div className="admin-stat-sub">
            {totalUsers > 0 ? Math.round((verifiedCFUsers / totalUsers) * 100) : 0}% din total
          </div>
        </div>
        <div className="admin-stat-card" style={{ borderColor: '#BA7517' }}>
          <div className="admin-stat-label">XP Total Generat</div>
          <div className="admin-stat-num">{totalPlatformXP}</div>
          <div className="admin-stat-sub">puncte pe platformă</div>
        </div>
        <div className="admin-stat-card" style={{ borderColor: '#D4537E' }}>
          <div className="admin-stat-label">Streak Mediu</div>
          <div className="admin-stat-num">{avgStreak}</div>
          <div className="admin-stat-sub">zile consecutive</div>
        </div>
      </div>

      <div className="admin-two-col">
        <div className="admin-card" style={{ flex: 1 }}>
          <div className="admin-section-title"> Top Elevi (După XP)</div>
          {topUsers.map((user, i) => (
            <div key={i} className="admin-bar-row" style={{ marginBottom: '15px' }}>
              <span className="admin-bar-label" style={{ minWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                #{i + 1} {userName(user)}
              </span>
              <div className="admin-bar-track">
                <div
                  className="admin-bar-fill"
                  style={{ width: `${((user.puncteTotale || 0) / maxUserXP) * 100}%`, background: medalColor(i) || '#378ADD' }}
                />
              </div>
              <span className="admin-bar-count" style={{ minWidth: '50px' }}>{user.puncteTotale || 0} XP</span>
            </div>
          ))}
        </div>

        <div className="admin-card" style={{ flex: 1 }}>
          <div className="admin-section-title"> Top Elevi (După Streak)</div>
          {topStreakUsers.map((user, i) => (
            <div key={i} className="admin-bar-row" style={{ marginBottom: '15px' }}>
              <span className="admin-bar-label" style={{ minWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                #{i + 1} {userName(user)}
              </span>
              <div className="admin-bar-track">
                <div
                  className="admin-bar-fill"
                  style={{ width: `${((user.streakCount || 0) / maxUserStreak) * 100}%`, background: medalColor(i) || '#ff4500' }}
                />
              </div>
              <span className="admin-bar-count" style={{ minWidth: '50px' }}>{user.streakCount || 0} zile</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}