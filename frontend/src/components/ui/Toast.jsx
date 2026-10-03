import { Toaster } from 'react-hot-toast';

export default function Toast() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-bright)',
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          borderRadius: '10px',
          boxShadow: 'var(--shadow)',
        },
        success: {
          iconTheme: { primary: 'var(--green)', secondary: 'var(--bg-card)' },
        },
        error: {
          iconTheme: { primary: 'var(--red)', secondary: 'var(--bg-card)' },
        },
        duration: 3500,
      }}
    />
  );
}