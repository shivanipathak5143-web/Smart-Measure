import { useState } from 'react';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';

export default function Chat() {
  const [activeSession, setActiveSession] = useState(null);
  const [sidebarKey, setSidebarKey] = useState(0);

  const handleNewChat = () => setActiveSession(null);
  const handleSessionCreate = (id) => {
    setActiveSession(id);
    setSidebarKey(k => k + 1);
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      <ChatSidebar
        key={sidebarKey}
        activeSession={activeSession}
        onSelect={setActiveSession}
        onNew={handleNewChat}
      />
      <ChatWindow
        sessionId={activeSession}
        onSessionCreate={handleSessionCreate}
      />
    </div>
  );
}