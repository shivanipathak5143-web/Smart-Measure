import { useState, useEffect, useRef } from 'react';
import { Send, Loader, Sparkles, Map } from 'lucide-react';
import { sendMessage, getRoadmap, getChatMessages } from '../../api/chatAPI';
import ChatMessage from './ChatMessage';

const STARTERS = [
  "Create a personalized DSA roadmap for me",
  "Explain dynamic programming with examples",
  "What topics should I focus on for interviews?",
  "Review my approach to graph problems",
];

export default function ChatWindow({ sessionId, onSessionCreate }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const bottomRef = useRef(null);

  // Load history when an existing session is selected
  useEffect(() => {
    if (!sessionId) {
      setMessages([]);
      return;
    }

    const loadHistory = async () => {
      setLoadingHistory(true);
      try {
        const { data } = await getChatMessages(sessionId);
        // Support both { data: { messages: [] } } and { data: [] } shapes
        const history = data.data?.messages || data.data || [];
        setMessages(history);
      } catch {
        setMessages([]);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadHistory();
  }, [sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text) => {
    const content = text || input.trim();
    if (!content || sending) return;
    setInput('');

    const userMsg = { role: 'user', content, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setSending(true);

    try {
      const { data } = await sendMessage(content, sessionId);
      const aiMsg = {
        role: 'assistant',
        content: data.data?.reply || 'No response',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMsg]);
      if (data.data?.chatId && !sessionId) {
        onSessionCreate?.(data.data.chatId);
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setSending(false);
    }
  };

  const handleRoadmap = async () => {
    setSending(true);
    const userMsg = {
      role: 'user',
      content: 'Generate my personalized DSA roadmap based on my progress.',
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    try {
      const { data } = await getRoadmap();
      const aiMsg = {
        role: 'assistant',
        content: data.data?.roadmap || 'Could not generate roadmap.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Could not generate roadmap. Please try again.',
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setSending(false);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {loadingHistory ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader size={22} color="var(--accent)" style={{ animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : isEmpty ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32, padding: '40px 0' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64, borderRadius: 20,
                background: 'linear-gradient(135deg, var(--accent-glow), var(--green-dim))',
                border: '1px solid var(--border-bright)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <Sparkles size={28} color="var(--accent)" />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, marginBottom: 8 }}>
                AI DSA Mentor
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 340, lineHeight: 1.6 }}>
                Get personalized guidance, roadmaps, and explanations tailored to your progress.
              </p>
            </div>
            <button onClick={handleRoadmap} className="btn btn-primary" style={{ gap: 8 }} disabled={sending}>
              <Map size={16} /> Generate My Roadmap
            </button>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%', maxWidth: 500 }}>
              {STARTERS.map((s, i) => (
                <button key={i} onClick={() => handleSend(s)} style={{
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '10px 14px', fontSize: 13,
                  color: 'var(--text-muted)', cursor: 'pointer', textAlign: 'left',
                  lineHeight: 1.4, transition: 'all 0.15s', fontFamily: 'var(--font-display)',
                }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => <ChatMessage key={i} message={msg} />)
        )}

        <div ref={bottomRef} />
      </div>

      <div style={{ padding: '16px 28px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}>
        <div style={{
          display: 'flex', gap: 10, alignItems: 'flex-end',
          background: 'var(--bg-hover)', border: '1px solid var(--border)',
          borderRadius: 14, padding: '10px 14px', transition: 'border-color 0.2s',
        }}
          onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--accent)'}
          onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Ask anything about DSA, algorithms, or your progress…"
            rows={1}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: 'var(--text)', fontSize: 14, resize: 'none',
              lineHeight: 1.6, maxHeight: 120, overflowY: 'auto',
              fontFamily: 'var(--font-display)',
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || sending}
            style={{
              width: 36, height: 36, borderRadius: 8, flexShrink: 0,
              background: input.trim() && !sending ? 'var(--accent)' : 'var(--bg-hover)',
              border: 'none', cursor: input.trim() && !sending ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
              color: input.trim() && !sending ? 'var(--accent-ink)' : 'var(--text-muted)',
            }}
          >
            {sending ? <Loader size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Send size={15} />}
          </button>
        </div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>
          Shift + Enter for new line · Enter to send
        </p>
      </div>
    </div>
  );
}