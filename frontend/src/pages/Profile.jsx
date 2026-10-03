import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { updateProfile, changePassword } from '../api/authAPI';
import { User, Lock, Save } from 'lucide-react';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    leetcodeUsername: user?.leetcodeUsername || '',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile(profileForm);
      await refreshUser();
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally { setSavingProfile(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('Passwords do not match'); return;
    }
    if (pwForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters'); return;
    }
    setSavingPw(true);
    try {
      await changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setSavingPw(false); }
  };

  return (
    <div className="page-container animate-in">
      <h1 className="page-title">Profile</h1>
      <p className="page-subtitle">Manage your account settings</p>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, maxWidth: 800 }}>
        {/* Sidebar tabs */}
        <div className="card" style={{ padding: 8, height: 'fit-content' }}>
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'security', label: 'Security', icon: Lock },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 6, cursor: 'pointer',
                background: activeTab === id ? 'var(--accent)' : 'transparent',
                color: activeTab === id ? 'var(--accent-ink)' : 'var(--text-secondary)',
                border: 'none', fontFamily: 'var(--font-display)', fontWeight: 600,
                fontSize: 14, transition: 'all 0.15s', marginBottom: 2,
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="card">
          {activeTab === 'profile' && (
            <>
              {/* Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 10,
                  background: 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, color: 'var(--accent-ink)',
                }}>
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20 }}>{user?.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12, marginTop: 2 }}>{user?.email}</div>
                </div>
              </div>

              <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={profileForm.name}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" value={user?.email} disabled
                    style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">LeetCode Username</label>
                  <input className="form-input" placeholder="your_lc_handle"
                    value={profileForm.leetcodeUsername}
                    onChange={e => setProfileForm({ ...profileForm, leetcodeUsername: e.target.value })} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={savingProfile}
                  style={{ alignSelf: 'flex-start', gap: 8 }}>
                  <Save size={14} />
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, marginBottom: 4 }}>
                Change Password
              </h3>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input className="form-input" type="password" value={pwForm.currentPassword}
                  onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input className="form-input" type="password" placeholder="Min. 6 characters"
                  value={pwForm.newPassword}
                  onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input className="form-input" type="password"
                  value={pwForm.confirmPassword}
                  onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })} required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={savingPw}
                style={{ alignSelf: 'flex-start', gap: 8 }}>
                <Lock size={14} />
                {savingPw ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}