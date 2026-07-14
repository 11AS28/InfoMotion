import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Star,
  Swords,
  Coins,
  Flame,
  BookOpen,
  Trophy,
  BarChart3
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import '../pages_css/performanta.css';
import usePageTitle from '../hooks/usePageTitle';

function Performanta() {
  const { currentUser, getStatistici } = useAuth();

  usePageTitle('Performanța Mea');

  if (!currentUser) {
    return (
      <div className="performanta-page">
        <div className="performanta-container">
          <div className="perf-panel">
            <h2>Nu ești autentificat.</h2>
          </div>
        </div>
      </div>
    );
  }

  const stats = typeof getStatistici === 'function'
    ? getStatistici()
    : { terminate: 0, total: 0 };

  const lectiiTerminate = stats?.terminate || 0;
  const totalLectii = stats?.total || 0;
  const progresReal = totalLectii > 0
    ? Math.round((lectiiTerminate / totalLectii) * 100)
    : 0;

  const totalProblemeDB = currentUser?.problemeRezolvateCount || 0;
  const puncteTotale = currentUser?.puncteTotale || 0;
  const baniUtilizator = currentUser?.puncte || 0;
  const streak = currentUser?.streakCount || 0;

  let nivel = 'Începător';
  if (progresReal >= 80) nivel = 'Expert';
  else if (progresReal >= 40) nivel = 'Intermediar';

  const overviewChartData = [
    { label: 'Probleme', value: totalProblemeDB },
    { label: 'Lecții', value: lectiiTerminate },
    { label: 'XP', value: puncteTotale },
    { label: 'Streak', value: streak }
  ];

  const courseProgressData = [
    {
      name: 'Curs',
      finalizate: lectiiTerminate,
      ramase: Math.max(totalLectii - lectiiTerminate, 0)
    }
  ];

  return (
    <div className="performanta-page">
      <div className="performanta-container">
        <div className="performanta-header">
          <div>
            <p className="performanta-tag">
              <BarChart3 size={16} />
              Dashboard elev
            </p>

            <h1>Performanța Mea</h1>

            <p className="performanta-subtitle">
              Aici vezi progresul tău real din platformă: lecții finalizate,
              probleme rezolvate, XP, streak și evoluția generală.
            </p>
          </div>

          <Link to="/lectii" className="performanta-back-btn">
            <ArrowLeft size={18} />
            Înapoi la lecții
          </Link>
        </div>

        <div className="performanta-kpis">
          <div className="perf-card accent-card">
            <span>Probleme rezolvate</span>
            <h3>
              <Swords size={18} />
              {totalProblemeDB}
            </h3>
            <p>Total probleme completate în Arenă.</p>
          </div>

          <div className="perf-card accent-card">
            <span>Lecții terminate</span>
            <h3>
              <BookOpen size={18} />
              {lectiiTerminate} / {totalLectii}
            </h3>
            <p>Progresul tău actual în curs.</p>
          </div>

          <div className="perf-card accent-card">
            <span>XP Total</span>
            <h3>
              <Star size={18} />
              {puncteTotale}
            </h3>
            <p>Punctele totale acumulate în platformă.</p>
          </div>

          <div className="perf-card accent-card">
            <span>Streak curent</span>
            <h3>
              <Flame size={18} />
              {streak} zile
            </h3>
            <p>Seria ta activă de conectări consecutive.</p>
          </div>
        </div>

        <div className="performanta-grid">
          <div className="perf-panel large">
            <div className="panel-head">
              <div>
                <h2>Statisticile tale</h2>
                <span>O privire de ansamblu asupra performanței tale</span>
              </div>
            </div>

            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={overviewChartData} barCategoryGap={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" stroke="var(--text-faint)" />
                  <YAxis stroke="var(--text-faint)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: '14px',
                      color: 'var(--text-primary)'
                    }}
                    cursor={{ fill: 'var(--accent-bg)' }}
                  />
                  <Bar
                    dataKey="value"
                    fill="var(--accent)"
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="perf-panel side">
            <div className="panel-head">
              <div>
                <h2>Status elev</h2>
                <span>Rezumat rapid</span>
              </div>
            </div>

            <div className="streak-box">
              <Flame size={32} color="#ff7a00" />
              <h3>{streak} zile</h3>
              <p>Consecvența ta actuală în platformă.</p>
            </div>

            <div className="mini-summary-list">
              <div className="mini-summary-item">
                <span>Nivel</span>
                <strong>{nivel}</strong>
              </div>

              <div className="mini-summary-item">
                <span>Bani</span>
                <strong>
                  <Coins size={16} />
                  {baniUtilizator}
                </strong>
              </div>

              <div className="mini-summary-item">
                <span>Rol</span>
                <strong>{currentUser?.role === 'teacher' ? 'Profesor' : 'Elev'}</strong>
              </div>

              <div className="mini-summary-item">
                <span>Codeforces</span>
                <strong>{currentUser?.cfValidat ? 'Verificat' : 'Neverificat'}</strong>
              </div>
            </div>
          </div>

          <div className="perf-panel full">
            <div className="panel-head">
              <div>
                <h2>Progresul cursului</h2>
                <span>Lecții finalizate vs. lecții rămase</span>
              </div>
            </div>

            <div className="progress-block">
              <div className="progress-row">
                <span>Progres total</span>
                <span>{progresReal}%</span>
              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progresReal}%` }}
                />
              </div>
            </div>

            <div className="chart-wrap small-chart">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={courseProgressData} barCategoryGap={60}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--text-faint)" />
                  <YAxis stroke="var(--text-faint)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: '14px',
                      color: 'var(--text-primary)'
                    }}
                    cursor={{ fill: 'var(--accent-bg)' }}
                  />
                  <Bar
                    dataKey="finalizate"
                    stackId="a"
                    fill="var(--accent)"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar
                    dataKey="ramase"
                    stackId="a"
                    fill="var(--bg-subtle)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="perf-panel full trophy-panel">
            <div className="panel-head">
              <div>
                <h2>Rezumat general</h2>
                <span>Performanța ta actuală în platformă</span>
              </div>
            </div>

            <div className="resume-grid">
              <div className="resume-box">
                <Trophy size={20} />
                <div>
                  <h4>{nivel}</h4>
                  <p>Nivel calculat pe baza progresului în curs.</p>
                </div>
              </div>

              <div className="resume-box">
                <BookOpen size={20} />
                <div>
                  <h4>{lectiiTerminate} lecții terminate</h4>
                  <p>Ai finalizat {lectiiTerminate} din {totalLectii} lecții disponibile.</p>
                </div>
              </div>

              <div className="resume-box">
                <Swords size={20} />
                <div>
                  <h4>{totalProblemeDB} probleme rezolvate</h4>
                  <p>Acesta este totalul real înregistrat în contul tău.</p>
                </div>
              </div>

              <div className="resume-box">
                <Star size={20} />
                <div>
                  <h4>{puncteTotale} XP total</h4>
                  <p>XP-ul reprezintă progresul tău acumulat pe platformă.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Performanta;