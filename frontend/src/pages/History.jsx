import { useState, useEffect, useCallback } from 'react';
import { getLogHistory, removeProblem, updateLoggedProblem } from '../api/logAPI';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';
import { Search, Trash2, Clock, Code2, ChevronDown, PlusCircle, Star, ExternalLink, FileText, Tag, Timer } from 'lucide-react';

const DIFFS = ['All', 'Easy', 'Medium', 'Hard'];

const diffColors = {
  Easy: { bg: 'var(--green-dim)', color: 'var(--green)', border: 'rgba(63,107,52,0.3)' },
  Medium: { bg: 'var(--yellow-dim)', color: 'var(--yellow)', border: 'rgba(160,106,12,0.3)' },
  Hard: { bg: 'var(--red-dim)', color: 'var(--red)', border: 'rgba(161,58,52,0.3)' },
};

export default function History() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [diff, setDiff] = useState('All');
  const [expandedKey, setExpandedKey] = useState(null);
  const [editingSolution, setEditingSolution] = useState(null);
  const [savingKey, setSavingKey] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const toast = useToast();

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getLogHistory(page, 10);
      setLogs(data.data || []);
      setPagination(data.pagination || {});
    } catch {
      toast.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleDelete = async (date, titleSlug) => {
    if (!window.confirm('Delete this problem from log?')) return;
    try {
      await removeProblem(date, titleSlug);
      toast.success('Problem removed');
      fetchLogs();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const getProblemKey = (p) => `${p.date}-${p.titleSlug}`;

  const handleSaveSolution = async (p, value) => {
    const key = getProblemKey(p);
    setSavingKey(key);
    try {
      await updateLoggedProblem(p.date, p.titleSlug, { solution: value });
      toast.success('Solution saved');
      setEditingSolution(null);
      fetchLogs();
    } catch {
      toast.error('Could not save — try again');
    } finally {
      setSavingKey(null);
    }
  };

  const handleToggleFavorite = async (p) => {
    try {
      await updateLoggedProblem(p.date, p.titleSlug, { isFavorite: !p.isFavorite });
      toast.success(p.isFavorite ? 'Removed from revision queue' : 'Added to revision queue');
      fetchLogs();
    } catch {
      toast.error('Could not update — try again');
    }
  };

  const allProblems = logs.flatMap(log =>
    (log.problemsSolved || []).map(p => ({
      ...p,
      date: log.date,
      goalMet: log.goalMet,
    }))
  );

  const filtered = allProblems.filter(p => {
    const matchDiff = diff === 'All' || p.difficulty === diff;
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase());
    return matchDiff && matchSearch;
  });

  return (
    <div className="page-container animate-in">
      <h1 className="page-title">Problem History</h1>
      <p className="page-subtitle">{filtered.length} problem{filtered.length !== 1 ? 's' : ''} logged</p>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 300 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-input"
            placeholder="Search problems..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {DIFFS.map(d => (
            <button
              key={d}
              onClick={() => setDiff(d)}
              style={{
                padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                fontFamily: 'var(--font-display)', cursor: 'pointer', transition: 'all 0.15s',
                background: diff === d ? 'var(--accent)' : 'var(--bg-elevated)',
                color: diff === d ? 'var(--accent-ink)' : 'var(--text-muted)',
                border: `1px solid ${diff === d ? 'var(--accent)' : 'var(--border)'}`,
              }}
            >
              {d}
            </button>
          ))}
        </div>

        <Link to="/log" className="btn btn-primary" style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>
          <PlusCircle size={14} /> Log New
        </Link>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton" style={{ height: 64, borderRadius: 10 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Code2 size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 14 }}>No problems found</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((p, i) => {
            const key = getProblemKey(p);
            const isOpen = expandedKey === key;
            const dc = diffColors[p.difficulty] || {};
            const solution = p.solution || '';
            const isEditing = editingSolution === key;

            return (
              <div
                key={`${key}-${i}`}
                className="card"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  border: isOpen ? '1px solid var(--accent)' : '1px solid var(--border)',
                  transition: 'border-color 0.2s',
                  borderRadius: 12,
                }}
              >
                {/* ── Clickable Header ── */}
                <div
                  onClick={() => setExpandedKey(isOpen ? null : key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '16px 20px', cursor: 'pointer',
                    background: isOpen ? 'var(--bg-hover)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  {/* Difficulty badge */}
                  <span style={{
                    padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                    fontFamily: 'var(--font-display)', letterSpacing: '0.04em',
                    background: dc.bg, color: dc.color, border: `1px solid ${dc.border}`,
                    flexShrink: 0,
                  }}>
                    {p.difficulty}
                  </span>

                  {/* Title + topics */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>
                      {p.title}
                    </span>
                    {p.topics?.length > 0 && (
                      <span style={{ marginLeft: 10, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                        {p.topics.join(' · ')}
                      </span>
                    )}
                  </div>

                  {/* Meta */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                    {p.timeSpent > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                        <Clock size={11} /> {p.timeSpent}m
                      </span>
                    )}
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                      {p.date}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleFavorite(p); }}
                      title={p.isFavorite ? 'Remove from revision queue' : 'Add to revision queue'}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 2 }}
                    >
                      <Star size={14} fill={p.isFavorite ? 'var(--yellow)' : 'none'} color={p.isFavorite ? 'var(--yellow)' : 'var(--text-muted)'} />
                    </button>
                    <ChevronDown
                      size={15}
                      color="var(--text-muted)"
                      style={{ transition: 'transform 0.25s', transform: isOpen ? 'rotate(180deg)' : 'none' }}
                    />
                  </div>
                </div>

                {/* ── Expanded Panel ── */}
                {isOpen && (
                  <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>

                    {/* Info pills row */}
                    <div style={{ display: 'flex', gap: 10, padding: '14px 20px 0', flexWrap: 'wrap' }}>
                      <InfoPill icon={<Tag size={11} />} label="Topics" value={p.topics?.join(', ') || '—'} />
                      <InfoPill icon={<Timer size={11} />} label="Time" value={p.timeSpent ? `${p.timeSpent} min` : '—'} />
                      <InfoPill icon={<FileText size={11} />} label="Logged" value={p.date || '—'} />
                      {p.isFavorite && (
                        <InfoPill icon={<Star size={11} fill="var(--yellow)" color="var(--yellow)" />} label="Queued" value="For revision" />
                      )}
                    </div>

                    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                      {/* Notes */}
                      {p.notes && (
                        <Section label="Notes / Approach">
                          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>
                            {p.notes}
                          </p>
                        </Section>
                      )}

                      {/* Solution */}
                      <Section label="Your Solution">
                        {isEditing ? (
                          <SolutionEditor
                            initial={solution}
                            saving={savingKey === key}
                            onSave={(val) => handleSaveSolution(p, val)}
                            onCancel={() => setEditingSolution(null)}
                          />
                        ) : solution ? (
                          <div>
                            <pre style={{
                              margin: 0, padding: '14px 16px', borderRadius: 8, fontSize: 12,
                              fontFamily: 'var(--font-mono)', background: 'var(--bg-surface)',
                              border: '1px solid var(--border)', color: 'var(--text-muted)',
                              overflowX: 'auto', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                            }}>
                              {solution}
                            </pre>
                            <button
                              onClick={() => setEditingSolution(key)}
                              style={{
                                marginTop: 8, background: 'none', border: 'none',
                                color: 'var(--accent)', fontFamily: 'var(--font-display)',
                                fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0,
                              }}
                            >
                              ✏️ Edit solution
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingSolution(key)}
                            style={{
                              width: '100%', padding: '12px 16px', borderRadius: 8,
                              border: '1px dashed var(--border)', background: 'transparent',
                              color: 'var(--text-muted)', fontFamily: 'var(--font-display)',
                              fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                          >
                            <Code2 size={14} /> Add your solution code
                          </button>
                        )}
                      </Section>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
                        <a
                          href={`https://leetcode.com/problems/${p.titleSlug}`}
                          target="_blank" rel="noreferrer"
                          className="btn btn-ghost"
                          style={{ fontSize: 13, padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 5 }}
                        >
                          <ExternalLink size={13} /> View on LeetCode
                        </a>
                        <button
                          className="btn btn-danger"
                          style={{ fontSize: 13, padding: '7px 14px' }}
                          onClick={() => handleDelete(p.date, p.titleSlug)}
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
          <button className="btn btn-ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            Previous
          </button>
          <span style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)' }}>
            {page} / {pagination.pages}
          </span>
          <button className="btn btn-ghost" disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Small helper components ── */

function Section({ label, children }) {
  return (
    <div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8,
      }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function InfoPill({ icon, label, value }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px',
      borderRadius: 6, background: 'var(--bg-hover)', border: '1px solid var(--border)',
      fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)',
    }}>
      {icon}
      <span style={{ color: 'var(--text-muted)', opacity: 0.6 }}>{label}:</span>
      <span style={{ color: 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}

function SolutionEditor({ initial, onSave, onCancel, saving }) {
  const [val, setVal] = useState(initial || '');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <textarea
        value={val}
        onChange={e => setVal(e.target.value)}
        rows={8}
        placeholder="Paste or type your solution here..."
        style={{
          width: '100%', padding: '12px 14px', borderRadius: 8, resize: 'vertical',
          fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.6,
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          color: 'var(--text-muted)', outline: 'none', boxSizing: 'border-box',
        }}
        autoFocus
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => onSave(val)}
          className="btn btn-primary"
          disabled={saving}
          style={{ fontSize: 13, padding: '7px 18px' }}
        >
          {saving ? 'Saving...' : 'Save solution'}
        </button>
        <button
          onClick={onCancel}
          className="btn btn-ghost"
          style={{ fontSize: 13, padding: '7px 14px' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}