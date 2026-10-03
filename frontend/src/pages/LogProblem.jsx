import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logProblem } from '../api/logAPI';
import { useToast } from '../context/ToastContext';
import { CheckCircle, PlusCircle } from 'lucide-react';

const TOPICS = [
  'Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs',
  'Dynamic Programming', 'Backtracking', 'Binary Search', 'Sorting',
  'Heaps', 'Stacks & Queues', 'Hash Maps', 'Two Pointers',
  'Sliding Window', 'Greedy', 'Math', 'Bit Manipulation', 'Tries', 'Other',
];

export default function LogProblem() {
  const [form, setForm] = useState({
    title: '',
    titleSlug: '',
    difficulty: 'Medium',
    topics: [],
    timeSpent: '',
    notes: '',
    isFavorite: false,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  // Auto-generate titleSlug from title
  const handleTitleChange = (e) => {
    const title = e.target.value;
    const titleSlug = title.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setForm({ ...form, title, titleSlug });
  };

  const handleTopicToggle = (topic) => {
    setForm(prev => ({
      ...prev,
      topics: prev.topics.includes(topic)
        ? prev.topics.filter(t => t !== topic)
        : [...prev.topics, topic]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Problem title is required'); return; }
    if (!form.titleSlug.trim()) { toast.error('Title slug is required'); return; }

    setLoading(true);
    try {
      await logProblem({
        title: form.title,
        titleSlug: form.titleSlug,
        difficulty: form.difficulty,
        topics: form.topics,
        timeSpent: parseInt(form.timeSpent) || 0,
        notes: form.notes,
        isFavorite: form.isFavorite,
      });
      setSuccess(true);
      toast.success('Problem logged successfully!');
      setTimeout(() => navigate('/history'), 1200);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to log problem');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
        <div style={{ textAlign: 'center', animation: 'fadeIn 0.4s ease' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'var(--green-dim)', border: '2px solid var(--green)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <CheckCircle size={36} color="var(--green)" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24 }}>Logged!</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Redirecting to history…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container animate-in">
      <h1 className="page-title">Log a Problem</h1>
      <p className="page-subtitle">Record your solved problem and notes</p>

      <div style={{ maxWidth: 720 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Title + Slug */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Problem Title *</label>
              <input className="form-input" type="text" placeholder="Two Sum"
                value={form.title} onChange={handleTitleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Title Slug *</label>
              <input className="form-input" type="text" placeholder="two-sum"
                value={form.titleSlug} onChange={set('titleSlug')} required />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                Auto-generated from title. Must match LeetCode URL.
              </span>
            </div>
          </div>

          {/* Difficulty + Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Difficulty</label>
              <select className="form-select" value={form.difficulty} onChange={set('difficulty')}>
                {['Easy', 'Medium', 'Hard'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Time Spent (min)</label>
              <input className="form-input" type="number" placeholder="30"
                value={form.timeSpent} onChange={set('timeSpent')} min="1" />
            </div>
          </div>

          {/* Topics */}
          <div className="form-group">
            <label className="form-label">Topics</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
              {TOPICS.map(topic => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => handleTopicToggle(topic)}
                  style={{
                    padding: '5px 12px', borderRadius: 20, fontSize: 12,
                    fontFamily: 'var(--font-display)', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.15s',
                    background: form.topics.includes(topic) ? 'var(--accent)' : 'var(--bg-elevated)',
                    color: form.topics.includes(topic) ? 'var(--accent-ink)' : 'var(--text-muted)',
                    border: `1px solid ${form.topics.includes(topic) ? 'var(--accent)' : 'var(--border)'}`,
                  }}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Notes / Approach</label>
            <textarea className="form-textarea"
              placeholder="Describe your approach, what you learned, edge cases..."
              value={form.notes} onChange={set('notes')} rows={4} />
          </div>

          {/* Favorite */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="checkbox"
              id="fav"
              checked={form.isFavorite}
              onChange={e => setForm({ ...form, isFavorite: e.target.checked })}
              style={{ width: 16, height: 16, cursor: 'pointer' }}
            />
            <label htmlFor="fav" style={{ fontFamily: 'var(--font-display)', fontSize: 14, cursor: 'pointer' }}>
              Mark as favorite
            </label>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ flex: 1, justifyContent: 'center', padding: 14, fontSize: 15 }}
            >
              {loading ? 'Saving…' : <><PlusCircle size={16} /> Log Problem</>}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate('/history')}
              style={{ padding: '14px 24px' }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}