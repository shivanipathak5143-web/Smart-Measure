import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User } from 'lucide-react';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <div style={{
      display: 'flex',
      gap: 12,
      flexDirection: isUser ? 'row-reverse' : 'row',
      alignItems: 'flex-start',
      animation: 'fadeIn 0.3s ease forwards',
    }}>
      {/* Avatar */}
      <div style={{
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        background: isUser ? 'var(--text-primary)' : 'var(--green)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `2px solid ${isUser ? 'var(--accent-glow)' : 'var(--green-dim)'}`,
      }}>
        {isUser ? <User size={14} color="var(--bg-elevated)" /> : <Bot size={14} color="var(--bg-elevated)" />}
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth: '72%',
        background: isUser ? 'var(--accent-glow)' : 'var(--bg-elevated)',
        border: `1px solid ${isUser ? 'rgba(20, 89, 82, 0.25)' : 'var(--border)'}`,
        borderRadius: isUser ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
        padding: '12px 16px',
      }}>
        {isUser ? (
          <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6 }}>
            {message.content}
          </p>
        ) : (
          <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-primary)' }}
            className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </div>
        )}
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)',
          marginTop: 6, textAlign: isUser ? 'right' : 'left'
        }}>
          {message.timestamp
            ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : ''}
        </div>
      </div>
    </div>
  );
}