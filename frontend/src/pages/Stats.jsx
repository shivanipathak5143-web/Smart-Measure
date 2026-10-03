import { useState, useEffect } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, CartesianGrid,
} from 'recharts';
import { getDashboard, getTopicBreakdown, getDifficultyBreakdown, getProgressChart, getWeakSpots } from '../api/statsAPI';
import Loader from '../components/ui/Loader';
import { format, parseISO } from 'date-fns';

const PERIODS = [
  { key: 'week', label: '7d' },
  { key: 'month', label: '30d' },
  { key: '3months', label: '90d' },
  { key: 'year', label: '1y' },
];

const PIE_COLORS = ['#3f6b34', '#a06a0c', '#a13a34'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 8, padding: '10px 14px',
        fontFamily: 'var(--font-mono)', fontSize: 12,
      }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>
        <p style={{ color: 'var(--accent)', fontWeight: 600 }}>{payload[0].value} problems</p>
      </div>
    );
  }
  return null;
};

export default function Stats() {
  const [dashboard, setDashboard] = useState(null);
  const [topics, setTopics] = useState([]);
  const [difficulty, setDifficulty] = useState(null);
  const [weakSpots, setWeakSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState([]);
  const [progressPeriod, setProgressPeriod] = useState('month');
  const [progressLoading, setProgressLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [d, t, diff, w] = await Promise.allSettled([
          getDashboard(),
          getTopicBreakdown(),
          getDifficultyBreakdown(),
          getWeakSpots(),
        ]);
        if (d.status === 'fulfilled') setDashboard(d.value.data?.data);
        if (t.status === 'fulfilled') {
          // Use local logs topics — array of { topic, total, easy, medium, hard }
          const local = t.value.data?.data?.fromLocalLogs || [];
          setTopics(local.map(t => ({ name: t.topic, count: t.total })));
        }
        if (diff.status === 'fulfilled') setDifficulty(diff.value.data?.data);
        if (w.status === 'fulfilled') setWeakSpots(w.value.data?.data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    let cancelled = false;
    setProgressLoading(true);
    getProgressChart(progressPeriod)
      .then(({ data }) => { if (!cancelled) setProgress(data.data || []); })
      .catch(() => { if (!cancelled) setProgress([]); })
      .finally(() => { if (!cancelled) setProgressLoading(false); });
    return () => { cancelled = true; };
  }, [progressPeriod]);

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <Loader size="lg" />
      </div>
    );
  }

  const stats = dashboard?.stats;

  const diffData = difficulty ? [
    { name: 'Easy', value: difficulty.easy?.count || 0 },
    { name: 'Medium', value: difficulty.medium?.count || 0 },
    { name: 'Hard', value: difficulty.hard?.count || 0 },
  ] : [
    { name: 'Easy', value: stats?.easySolved || 0 },
    { name: 'Medium', value: stats?.mediumSolved || 0 },
    { name: 'Hard', value: stats?.hardSolved || 0 },
  ];

  return (
    <div className="page-container animate-in">
      <h1 className="page-title">Analytics</h1>
      <p className="page-subtitle">Deep dive into your performance metrics</p>

      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Total Solved', value: stats?.totalSolved || 0, color: 'var(--accent)' },
          { label: 'Easy', value: stats?.easySolved || 0, color: 'var(--green)' },
          { label: 'Medium', value: stats?.mediumSolved || 0, color: 'var(--yellow)' },
          { label: 'Hard', value: stats?.hardSolved || 0, color: 'var(--red)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36, color, letterSpacing: '-0.03em', lineHeight: 1 }}>
              {value}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Cumulative progress */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16 }}>
            Progress over time
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {PERIODS.map(p => (
              <button
                key={p.key}
                onClick={() => setProgressPeriod(p.key)}
                style={{
                  padding: '5px 12px', borderRadius: 7, fontSize: 12.5, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.15s',
                  background: progressPeriod === p.key ? 'var(--accent)' : 'transparent',
                  color: progressPeriod === p.key ? 'var(--accent-ink)' : 'var(--text-muted)',
                  border: `1px solid ${progressPeriod === p.key ? 'var(--accent)' : 'var(--border)'}`,
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {progressLoading ? (
          <div className="skeleton" style={{ height: 220, borderRadius: 8 }} />
        ) : progress.length === 0 || progress.every(p => p.daily === 0) ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 220, color: 'var(--text-muted)', fontSize: 13 }}>
            No problems logged in this window yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={progress} margin={{ left: -20, right: 10, top: 6, bottom: 0 }}>
              <defs>
                <linearGradient id="progressFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(d) => format(parseISO(d), progressPeriod === 'year' ? 'MMM' : 'MMM d')}
                tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: 'var(--text-muted)' }}
                minTickGap={30}
              />
              <YAxis tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: 'var(--text-muted)' }} allowDecimals={false} />
              <Tooltip
                labelFormatter={(d) => format(parseISO(d), 'MMM d, yyyy')}
                formatter={(value, name) => [value, name === 'cumulative' ? 'Total solved' : 'Solved that day']}
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 12 }}
              />
              <Area type="monotone" dataKey="cumulative" stroke="var(--accent)" strokeWidth={2} fill="url(#progressFill)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Difficulty pie */}
        <div className="card">
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 20 }}>
            Difficulty Breakdown
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={diffData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} dataKey="value">
                {diffData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} opacity={0.9} />)}
              </Pie>
              <Legend formatter={(value) => (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{value}</span>
              )} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Topic radar */}
        {topics.length > 0 ? (
          <div className="card">
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 20 }}>
              Topic Coverage
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={topics.slice(0, 8)}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="name" tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: 'var(--text-muted)' }} />
                <Radar dataKey="count" fill="var(--accent)" fillOpacity={0.2} stroke="var(--accent)" strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>Log problems with topics to see coverage</p>
          </div>
        )}
      </div>

      {/* Topic bar chart */}
      {topics.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 20 }}>
            Problems by Topic
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topics} margin={{ left: -10, right: 10, bottom: 20 }}>
              <XAxis dataKey="name" tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--text-muted)' }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: 'var(--text-muted)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Weak spots */}
      {weakSpots.length > 0 && (
        <div className="card">
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>
            Weak Spots — Topics to Practice
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {weakSpots.map((w, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', minWidth: 20 }}>#{i + 1}</span>
                <span style={{ flex: 1, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14 }}>{w.topic}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--yellow)' }}>{w.solved} solved</span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11, padding: '2px 8px', borderRadius: 4,
                  background: 'var(--red-dim)', color: 'var(--red)'
                }}>{w.suggestionLevel}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}