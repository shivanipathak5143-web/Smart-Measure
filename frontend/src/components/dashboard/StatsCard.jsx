import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({ title, value, subtitle, icon: Icon, color = 'accent', trend, trendValue, delay = 0 }) {
  const colorMap = {
    accent: { bg: 'var(--accent-glow)', color: 'var(--accent)' },
    green: { bg: 'var(--green-dim)', color: 'var(--green)' },
    yellow: { bg: 'var(--yellow-dim)', color: 'var(--yellow)' },
    red: { bg: 'var(--red-dim)', color: 'var(--red)' },
    orange: { bg: 'rgba(156, 85, 43, 0.15)', color: 'var(--orange)' },
  };
  const c = colorMap[color] || colorMap.accent;

  return (
    <div className="card animate-in" style={{ '--stagger-delay': `${delay}ms` }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 6,
            background: 'transparent', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${c.color}`
          }}>
            {Icon && <Icon size={18} color={c.color} />}
          </div>
          {trendValue !== undefined && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontFamily: 'var(--font-mono)', fontSize: 12,
              color: trend === 'up' ? 'var(--green)' : 'var(--red)',
            }}>
              {trend === 'up' ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {trendValue}
            </div>
          )}
        </div>

        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 32, letterSpacing: '-0.03em', color: c.color,
          lineHeight: 1, marginBottom: 6
        }}>
          {value ?? '—'}
        </div>

        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}