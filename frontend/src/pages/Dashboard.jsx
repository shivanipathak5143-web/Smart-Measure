import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../api/statsAPI';
import { getStreak, getLogHistory } from '../api/logAPI';
import { getHeatmap } from '../api/leetcodeAPI';
import { useAuth } from '../context/AuthContext';
import StatsCard from '../components/dashboard/StatsCard';
import ActivityGrid from '../components/dashboard/ActivityGrid';
import StreakCard from '../components/dashboard/StreakCard';
import { CheckCircle, Target, Zap, BookOpen, ArrowRight, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [d, h, str, logs] = await Promise.allSettled([
          getDashboard(),
          getHeatmap(),
          getStreak(),
          getLogHistory(1, 5),
        ]);

        if (d.status === 'fulfilled') setDashboard(d.value.data?.data);
        if (h.status === 'fulfilled') setHeatmap(h.value.data?.data || {});
        if (str.status === 'fulfilled') setStreak(str.value.data?.data || {});
        if (logs.status === 'fulfilled') {
          const dailyLogs = logs.value.data?.data || [];
          const problems = dailyLogs.flatMap(day =>
            (day.problemsSolved || []).map(p => ({ ...p, date: day.date }))
          );
          setRecentLogs(problems.slice(0, 5));
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = dashboard?.stats;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  return (
    <div className="page-container animate-in">
      {/* Greeting */}
      <div style={{ marginBottom: 32 }}>
        <h1 className="page-title">
          Good {greeting}, {user?.username?.split(' ')[0]} 👋
        </h1>
        <p className="page-subtitle">
          {format(new Date(), 'EEEE, MMMM d')} · Here's your progress overview
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatsCard
          title="Total Solved"
          value={loading ? '—' : stats?.totalSolved ?? 0}
          icon={CheckCircle}
          color="accent"
          subtitle="all time"
          delay={0}
        />
        <StatsCard
          title="Easy"
          value={loading ? '—' : stats?.easySolved ?? 0}
          icon={Target}
          color="green"
          subtitle="problems"
          delay={60}
        />
        <StatsCard
          title="Medium"
          value={loading ? '—' : stats?.mediumSolved ?? 0}
          icon={Zap}
          color="yellow"
          subtitle="problems"
          delay={120}
        />
        <StatsCard
          title="Hard"
          value={loading ? '—' : stats?.hardSolved ?? 0}
          icon={BookOpen}
          color="red"
          subtitle="problems"
          delay={180}
        />
      </div>

      {/* Middle row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, marginBottom: 24 }}>
        <ActivityGrid data={heatmap} />
        <StreakCard
          current={streak.currentStreak ?? 0}
          longest={streak.longestStreak ?? 0}
          totalActiveDays={streak.totalActiveDays ?? 0}
          lastActiveDate={streak.lastActiveDate}
        />
      </div>

      {/* Today's progress */}
      {dashboard?.today && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>
              Today's Goal
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 13,
              color: dashboard.today.goalMet ? 'var(--green)' : 'var(--text-muted)'
            }}>
              {dashboard.today.solved} / {dashboard.user?.dailyGoal} solved
              {dashboard.today.goalMet && ' ✓'}
            </span>
          </div>
          {/* Progress bar */}
          <div style={{
            marginTop: 12, height: 6, background: 'var(--border)',
            borderRadius: 3, overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${Math.min(100, (dashboard.today.solved / (dashboard.user?.dailyGoal || 1)) * 100)}%`,
              background: dashboard.today.goalMet ? 'var(--green)' : 'var(--accent)',
              borderRadius: 3, transition: 'width 0.5s ease'
            }} />
          </div>
        </div>
      )}

      {/* Recent logs */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>
            Recent Problems
          </span>
          <Link to="/history" style={{
            display: 'flex', alignItems: 'center', gap: 4,
            color: 'var(--accent)', fontSize: 13, fontWeight: 600
          }}>
            View all <ArrowRight size={13} />
          </Link>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: 52, borderRadius: 8 }} />
            ))}
          </div>
        ) : recentLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
            <BookOpen size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>No problems logged yet</p>
            <Link to="/log" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>
              Log your first problem
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentLogs.map((log, i) => (
              <div key={`${log.date}-${log.titleSlug || i}`} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', background: 'var(--bg-elevated)',
                borderRadius: 8, border: '1px solid var(--border)',
                transition: 'border-color 0.15s',
              }}
                onMouseOver={e => e.currentTarget.style.borderColor = 'var(--border-bright)'}
                onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <span className={`badge badge-${log.difficulty?.toLowerCase()}`}>
                  {log.difficulty}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14 }}>
                    {log.title || log.problemTitle}
                  </div>
                  {log.topics?.length > 0 && (
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                      {log.topics.join(', ')}
                    </div>
                  )}
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11
                }}>
                  <Clock size={11} />
                  {log.date ? format(new Date(log.date), 'MMM d') : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}