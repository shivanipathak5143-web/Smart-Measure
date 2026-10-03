import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Code2, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'var(--bg-base)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Left panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 60px', position: 'relative',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 8,
              background: 'transparent', border: '1px solid var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Code2 size={19} color="var(--accent)" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20 }}>
              LeetTrack
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 32, letterSpacing: '-0.02em', marginBottom: 8,
            lineHeight: 1.1,
          }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 36, fontSize: 15 }}>
            Sign in to continue your DSA journey
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  style={{ paddingRight: 44 }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer',
                  }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ justifyContent: 'center', padding: '13px', fontSize: 15, marginTop: 4 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <p style={{ marginTop: 24, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* Right panel — decorative */}
      <div className="login-right" style={{
        flex: 1, display: 'none',
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border)',
        alignItems: 'center', justifyContent: 'center',
        padding: 60,
      }}>
        <div style={{ maxWidth: 380, width: '100%' }}>
          <p style={{
            fontFamily: 'var(--font-display)', fontSize: 20, lineHeight: 1.4,
            color: 'var(--text-primary)', marginBottom: 28,
          }}>
            "Streaks aren't about willpower — they're about making the next problem easier to start than to skip."
          </p>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '10px 14px',
              borderBottom: '1px solid var(--border)', background: 'var(--bg-card)',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)', opacity: 0.55 }} />
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--yellow)', opacity: 0.55 }} />
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', opacity: 0.55 }} />
              <span style={{ marginLeft: 6, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                streak.log
              </span>
            </div>
            <div style={{ display: 'flex', padding: '18px 20px' }}>
              {[
                { label: 'Solved', value: '247', color: 'var(--accent)' },
                { label: 'Streak', value: '14d', color: 'var(--yellow)' },
                { label: 'Topics', value: '8', color: 'var(--green)' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color }}>{value}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) { .login-right { display: flex !important; } }
      `}</style>
    </div>
  );
}