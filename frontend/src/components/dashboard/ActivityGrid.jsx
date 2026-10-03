import { useMemo } from 'react';

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKS = 18;

function normalize(data) {
  // Accepts: { 'YYYY-MM-DD': count } or { timestamp: count } or [{ date, count }]
  const map = {};
  if (!data) return map;

  if (Array.isArray(data)) {
    data.forEach(entry => {
      const key = entry.date || entry.day || entry.timestamp;
      if (!key) return;
      const d = typeof key === 'number' ? new Date(key * (String(key).length <= 10 ? 1000 : 1)) : new Date(key);
      if (isNaN(d)) return;
      map[d.toISOString().slice(0, 10)] = (entry.count ?? entry.total ?? entry.value ?? 0);
    });
  } else if (typeof data === 'object') {
    Object.entries(data).forEach(([key, value]) => {
      let d;
      if (/^\d+$/.test(key)) {
        d = new Date(Number(key) * (key.length <= 10 ? 1000 : 1));
      } else {
        d = new Date(key);
      }
      if (isNaN(d)) return;
      map[d.toISOString().slice(0, 10)] = typeof value === 'object' ? (value.count ?? 0) : value;
    });
  }
  return map;
}

function levelFor(count) {
  if (!count) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  return 3;
}

const LEVEL_COLORS = [
  'var(--bg-elevated)',
  'rgba(20, 89, 82, 0.18)',
  'rgba(20, 89, 82, 0.5)',
  'var(--accent)',
];

export default function ActivityGrid({ data }) {
  const map = useMemo(() => normalize(data), [data]);

  const days = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const totalDays = WEEKS * 7;
    // align end of grid to the coming Saturday so columns are full weeks
    const endOffset = 6 - today.getDay();
    const gridEnd = new Date(today.getTime() + endOffset * DAY_MS);
    const list = [];
    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(gridEnd.getTime() - i * DAY_MS);
      const key = d.toISOString().slice(0, 10);
      list.push({ key, date: d, count: map[key] || 0, future: d > today });
    }
    return list;
  }, [map]);

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  const totalSolved = days.reduce((sum, d) => sum + d.count, 0);
  const activeDays = days.filter(d => d.count > 0).length;

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>
          Activity
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
          {totalSolved} solved · {activeDays} active days
        </span>
      </div>

      <div style={{ display: 'flex', gap: 3, overflowX: 'auto', paddingBottom: 4 }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {week.map((day, di) => (
              <div
                key={day.key}
                title={`${day.key}: ${day.count} solved`}
                style={{
                  width: 12, height: 12, borderRadius: 3,
                  background: day.future ? 'transparent' : LEVEL_COLORS[levelFor(day.count)],
                  border: day.future ? '1px solid var(--border)' : 'none',
                  opacity: day.future ? 1 : 0,
                  animation: day.future ? 'none' : 'popIn 0.3s ease forwards',
                  animationDelay: `${(wi * 7 + di) * 4}ms`,
                }}
              />
            ))}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14, justifyContent: 'flex-end' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>Less</span>
        {LEVEL_COLORS.map((c, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
        ))}
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>More</span>
      </div>
    </div>
  );
}