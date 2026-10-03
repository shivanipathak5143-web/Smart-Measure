
export default function Loader({ size = 'md', fullscreen = false }) {
  const sizeMap = { sm: 20, md: 36, lg: 60 };
  const s = sizeMap[size] || 36;

  const spinner = (
    <svg width={s} height={s} viewBox="0 0 36 36" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
      <circle cx="18" cy="18" r="14" stroke="var(--border-bright)" strokeWidth="3" />
      <path d="M18 4 A14 14 0 0 1 32 18" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );

  if (fullscreen) {
    return (
      <div style={{
        position: 'fixed', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-base)', zIndex: 9999, flexDirection: 'column', gap: 16
      }}>
        {spinner}
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)' }}>
          Loading...
        </p>
      </div>
    );
  }

  return spinner;
}