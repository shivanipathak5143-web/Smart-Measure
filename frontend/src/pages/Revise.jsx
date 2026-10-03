import { useState, useEffect } from 'react';
import { getFavorites, markRevised, updateLoggedProblem } from '../api/logAPI';
import { useToast } from '../context/ToastContext';
import { Star, ExternalLink, RotateCcw, Sparkles, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const diffColors = {
  Easy: { bg: 'var(--green-dim)', color: 'var(--green)', border: 'rgba(63,107,52,0.3)' },
  Medium: { bg: 'var(--yellow-dim)', color: 'var(--yellow)', border: 'rgba(160,106,12,0.3)' },
  Hard: { bg: 'var(--red-dim)', color: 'var(--red)', border: 'rgba(161,58,52,0.3)' },
};

export default function Revise() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getFavorites();
      setQueue(data.data || []);
    } catch {
      toast.error('Could not load your revision queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRevised = async (item) => {
    try {
      await markRevised(item.loggedDate, item.titleSlug);
      toast.success(`Nice — ${item.title} marked as revised`);
      load();
    } catch {
      toast.error('Could not update — try again');
    }
  };

  const handleUnstar = async (item) => {
    try {
      await updateLoggedProblem(item.loggedDate, item.titleSlug, { isFavorite: false });
      toast.success('Removed from revision queue');
      setQueue(q => q.filter(x => x.titleSlug !== item.titleSlug));
    } catch {
      toast.error('Could not update — try again');
    }
  };

  const due = queue.filter(q => !q.lastRevisedAt || daysSince(q.lastRevisedAt) >= 7);
  const fresh = queue.filter(q => q.lastRevisedAt && daysSince(q.lastRevisedAt) < 7);

  return (
    <div className="page-container animate-in">
      <h1 className="page-title">Revision queue</h1>
      <p className="page-subtitle">
        Problems you've starred come back here on a spaced schedule — solve them again before they fade.
      </p>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
        </div>
      ) : queue.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '56px 20px' }}>
          <Star size={36} style={{ margin: '0 auto 16px', opacity: 0.35, color: 'var(--yellow)' }} />
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, marginBottom: 6 }}>
            Nothing queued for revision yet
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 380, margin: '0 auto' }}>
            Star a problem from your History page and it'll show up here as a reminder to revisit it.
          </p>
        </div>
      ) : (
        <>
          {due.length > 0 && (
            <Section title="Due for another look" count={due.length} accent>
              {due.map(item => (
                <RevisionCard key={item.titleSlug} item={item} onRevised={handleRevised} onUnstar={handleUnstar} />
              ))}
            </Section>
          )}
          {fresh.length > 0 && (
            <Section title="Recently revised" count={fresh.length}>
              {fresh.map(item => (
                <RevisionCard key={item.titleSlug} item={item} onRevised={handleRevised} onUnstar={handleUnstar} muted />
              ))}
            </Section>
          )}
        </>
      )}
    </div>
  );
}

function daysSince(dateStr) {
  return (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
}

function Section({ title, count, accent, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        {accent && <Sparkles size={15} color="var(--accent)" />}
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17 }}>{title}</span>
        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>({count})</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
    </div>
  );
}

function RevisionCard({ item, onRevised, onUnstar, muted }) {
  const dc = diffColors[item.difficulty] || {};
  return (
    <div className="card" style={{
      display: 'flex', alignItems: 'center', gap: 16,
      opacity: muted ? 0.72 : 1,
    }}>
      <span style={{
        padding: '4px 11px', borderRadius: 7, fontSize: 12, fontWeight: 600,
        background: dc.bg, color: dc.color, border: `1px solid ${dc.border}`,
        flexShrink: 0,
      }}>
        {item.difficulty}
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16 }}>{item.title}</div>
        {item.topics?.length > 0 && (
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>{item.topics.join(', ')}</div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6, color: 'var(--text-muted)', fontSize: 12 }}>
          <Clock size={11} />
          {item.lastRevisedAt
            ? `Last revised ${formatDistanceToNow(new Date(item.lastRevisedAt), { addSuffix: true })}`
            : `Solved ${formatDistanceToNow(new Date(item.solvedAt), { addSuffix: true })} · never revised`}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <a href={`https://leetcode.com/problems/${item.titleSlug}`} target="_blank" rel="noreferrer"
          className="btn btn-ghost" style={{ padding: '8px 12px', fontSize: 13 }}>
          <ExternalLink size={13} /> Open
        </a>
        <button onClick={() => onRevised(item)} className="btn btn-primary" style={{ padding: '8px 12px', fontSize: 13 }}>
          <RotateCcw size={13} /> Revised
        </button>
        <button onClick={() => onUnstar(item)} className="btn btn-ghost" style={{ padding: '8px 10px' }} title="Remove from queue">
          <Star size={14} fill="var(--yellow)" color="var(--yellow)" />
        </button>
      </div>
    </div>
  );
}
