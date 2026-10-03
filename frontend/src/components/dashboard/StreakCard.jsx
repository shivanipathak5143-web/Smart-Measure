import { Flame, Trophy } from 'lucide-react';

export default function StreakCard({ current = 0, longest = 0, lastSolved }) {
  return (
    <div className="card" style={{
      borderLeft: '2px solid var(--yellow)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>Streak</span>
        <Flame size={18} color="var(--yellow)" className={current > 0 ? 'pulse-flame' : ''} />
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ flex: 1, textAlign: 'center', padding: '12px', background: 'var(--yellow-dim)', borderRadius: 8, border: '1px solid rgba(160,106,12,0.2)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36, color: 'var(--yellow)', letterSpacing: '-0.03em', lineHeight: 1 }}>
            {current}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>CURRENT</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center', padding: '12px', background: 'var(--yellow-dim)', borderRadius: 8, border: '1px solid rgba(160,106,12,0.2)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36, color: 'var(--yellow)', letterSpacing: '-0.03em', lineHeight: 1 }}>
            {longest}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>LONGEST</div>
        </div>
      </div>

      {lastSolved && (
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
          <Trophy size={12} color="var(--yellow)" />
          Last solved: {lastSolved}
        </div>
      )}
    </div>
  );
}