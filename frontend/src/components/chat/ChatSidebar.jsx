import { useState, useEffect } from 'react';
import { Plus, Trash2, MessageSquare } from 'lucide-react';
import { getAllChats, deleteChat } from '../../api/chatAPI';
import { useToast } from '../../context/ToastContext';

export default function ChatSidebar({ activeSession, onSelect, onNew }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchChats = async () => {
    try {
      const { data } = await getAllChats();
      setChats(data.data || []);
    } catch {
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchChats(); }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteChat(id);
      setChats(prev => prev.filter(c => c.id !== id));
      if (activeSession === id) onNew();
    } catch {
      toast.error('Could not delete that chat — try again');
    }
  };

  return (
    <div style={{
      width: 220, background: 'var(--bg-card)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      height: '100%', flexShrink: 0,
    }}>
      <div style={{ padding: '16px 12px', borderBottom: '1px solid var(--border)' }}>
        <button onClick={onNew} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}>
          <Plus size={15} /> New Chat
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {loading ? (
          <div style={{ padding: 16, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>Loading...</div>
        ) : chats.length === 0 ? (
          <div style={{ padding: 16, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12, textAlign: 'center' }}>No chats yet</div>
        ) : (
          chats.map(chat => (
            <div
              key={chat.id}
              onClick={() => onSelect(chat.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '9px 10px', borderRadius: 8, cursor: 'pointer',
                background: activeSession === chat.id ? 'var(--accent-glow)' : 'transparent',
                border: `1px solid ${activeSession === chat.id ? 'var(--accent-glow-strong)' : 'transparent'}`,
                marginBottom: 2, transition: 'all 0.15s', position: 'relative',
              }}
              onMouseOver={e => { if (activeSession !== chat.id) e.currentTarget.style.background = 'var(--bg-hover)'; }}
              onMouseOut={e => { if (activeSession !== chat.id) e.currentTarget.style.background = 'transparent'; }}
            >
              <MessageSquare size={13} color={activeSession === chat.id ? 'var(--accent)' : 'var(--text-muted)'} />
              <span style={{
                flex: 1, fontFamily: 'var(--font-display)', fontSize: 13,
                color: activeSession === chat.id ? 'var(--text)' : 'var(--text-muted)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {chat.title || 'DSA Chat'}
              </span>
              <button
                onClick={(e) => handleDelete(e, chat.id)}
                className="delete-btn"
                style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 2, borderRadius: 4 }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))
        )}
      </div>
      <style>{`.delete-btn { opacity: 0; } div:hover > .delete-btn { opacity: 1; }`}</style>
    </div>
  );
}