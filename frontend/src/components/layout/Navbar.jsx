import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { getFavorites } from '../../api/logAPI';

const titles = {
  '/dashboard': { title: 'Dashboard', sub: 'Your coding overview' },
  '/log': { title: 'Log Problem', sub: 'Track a solved problem' },
  '/history': { title: 'Problem History', sub: 'All your solved problems' },
  '/revise': { title: 'Revise', sub: 'Your spaced revision queue' },
  '/stats': { title: 'Analytics', sub: 'Performance breakdown' },
  '/chat': { title: 'AI Mentor', sub: 'Personalized DSA guidance' },
  '/profile': { title: 'Profile', sub: 'Your account settings' },
};

function daysSince(dateStr) {
  return (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
}

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [dueCount, setDueCount] = useState(0);
  const info = titles[pathname] || { title: 'LeetTrack', sub: '' };

  useEffect(() => {
    let cancelled = false;
    getFavorites()
      .then(({ data }) => {
        if (cancelled) return;
        const favorites = data.data || [];
        const due = favorites.filter(f => !f.lastRevisedAt || daysSince(f.lastRevisedAt) >= 7);
        setDueCount(due.length);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [pathname]);

  return (
    <header style={{
      height: 64, background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center',
      padding: '0 40px', gap: 16,
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{ flex: 1 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.01em' }}>
          {info.title}
        </h1>
        {info.sub && (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
            {info.sub}
          </p>
        )}
      </div>
      <button
        onClick={() => navigate('/revise')}
        title={dueCount > 0 ? `${dueCount} problem${dueCount === 1 ? '' : 's'} due for revision` : 'No problems due for revision'}
        style={{
          position: 'relative', width: 38, height: 38, borderRadius: 8,
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--text-secondary)', transition: 'all 0.15s'
        }}
        onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent)'}
        onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
      >
        <Bell size={15} />
        {dueCount > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16,
            borderRadius: 8, background: 'var(--red)', color: 'var(--accent-ink)',
            fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: '0 4px', border: '2px solid var(--bg-surface)',
          }}>
            {dueCount > 9 ? '9+' : dueCount}
          </span>
        )}
      </button>
    </header>
  );
}
