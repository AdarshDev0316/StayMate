import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Check, CheckCheck, MapPin, MoreVertical, Loader2, ArrowLeft } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useChatStore from '../../store/chatStore';
import { useSocket } from '../../hooks/useSocket';
import Sidebar from '../common/Sidebar';

const ChatLayout = ({ role }) => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { conversations, messages, fetchConversations, fetchMessages, activeConversation, setActiveConversation, isLoading, onlineUsers, typingUsers } = useChatStore();
  const { joinConversation, sendMessage, emitTyping, markSeen } = useSocket();

  const [inputText, setInputText] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, []);

  // Handle active conversation selection
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conv = conversations.find(c => c._id === conversationId);
      if (conv) {
        setActiveConversation(conv);
        joinConversation(conversationId);
        setPage(1);
        loadMessages(conversationId, 1);
      } else {
        navigate(`/${role}/chat`);
      }
    } else {
      setActiveConversation(null);
    }
  }, [conversationId, conversations]);

  const loadMessages = async (cId, p) => {
    const pagination = await fetchMessages(cId, p);
    if (pagination && p >= pagination.pages) setHasMore(false);
    else setHasMore(true);
  };

  // Scroll to bottom on new message
  useEffect(() => {
    if (page === 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages[conversationId], page]);

  // Handle input typing (debounce)
  const handleInput = (e) => {
    setInputText(e.target.value);
    if (!conversationId) return;
    
    emitTyping(conversationId, true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      emitTyping(conversationId, false);
    }, 2000);
  };

  // Send message
  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !conversationId) return;
    sendMessage(conversationId, inputText.trim());
    setInputText('');
    emitTyping(conversationId, false);
  };

  // Mark seen
  useEffect(() => {
    if (conversationId && messages[conversationId]) {
      const unseen = messages[conversationId].filter(m => !m.seen && m.sender._id !== user._id);
      unseen.forEach(m => markSeen(m._id, conversationId));
    }
  }, [messages[conversationId]]);

  const activeMessages = messages[conversationId] || [];
  const otherParticipant = activeConversation?.otherParticipant;
  const isOnline = otherParticipant && onlineUsers.has(otherParticipant._id);
  const isTyping = otherParticipant && typingUsers[conversationId]?.has(otherParticipant._id);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'var(--sidebar-width) 1fr', minHeight: '100vh', overflow: 'hidden' }}>
      <Sidebar role={role} />
      
      <main className="chat-layout" style={{ height: '100vh' }}>
        {/* Chat List (Sidebar) */}
        <div className={`chat-list ${conversationId ? 'hide-on-mobile' : ''}`}>
          <div className="chat-list-header">
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>Messages</h2>
            <div className="input-with-icon" style={{ marginTop: 'var(--space-3)' }}>
              <input type="text" placeholder="Search chats..." className="input input-sm" style={{ padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: 'var(--radius-full)', background: 'var(--bg)' }} />
            </div>
          </div>
          
          <div style={{ padding: 'var(--space-2) 0' }}>
            {isLoading && conversations.length === 0 ? (
              <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}><Loader2 className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto' }} /></div>
            ) : conversations.length === 0 ? (
              <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>No conversations yet</div>
            ) : (
              conversations.map(conv => {
                const other = conv.otherParticipant;
                return (
                  <div 
                    key={conv._id} 
                    className={`chat-item ${conversationId === conv._id ? 'active' : ''}`}
                    onClick={() => navigate(`/${role}/chat/${conv._id}`)}
                  >
                    <div className="avatar-wrapper">
                      <img src={other?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.name || 'U')}&background=E2E8F0`} alt="" className="avatar avatar-md" />
                      {onlineUsers.has(other?._id) && <div className="online-dot" />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                        <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{other?.name}</span>
                        {conv.lastMessageAt && (
                          <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>
                            {new Date(conv.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 'var(--text-xs)', color: conv.unreadCount > 0 ? 'var(--text)' : 'var(--text-muted)', fontWeight: conv.unreadCount > 0 ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '85%' }}>
                          {typingUsers[conv._id]?.has(other?._id) ? <span style={{ color: 'var(--primary)' }}>typing...</span> : conv.lastMessage?.type === 'system' ? 'System message' : conv.lastMessage?.text || 'No messages'}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span style={{ background: 'var(--primary)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 'var(--radius-full)' }}>{conv.unreadCount}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className={`chat-window ${!conversationId ? 'hide-on-mobile' : ''}`}>
          {activeConversation ? (
            <>
              <div className="chat-header">
                <button className="btn btn-ghost btn-icon-sm mobile-only" onClick={() => navigate(`/${role}/chat`)} style={{ marginRight: 8 }}><ArrowLeft size={18} /></button>
                <img src={otherParticipant?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParticipant?.name || 'U')}&background=E2E8F0`} alt="" className="avatar avatar-md" />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, lineHeight: 1.2 }}>{otherParticipant?.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: isOnline ? 'var(--success-dark)' : 'var(--text-faint)' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: isOnline ? 'var(--success)' : 'var(--border-dark)' }} />
                    {isOnline ? 'Online' : 'Offline'}
                  </div>
                </div>
                {activeConversation.listing && (
                  <Link to={`/listings/${activeConversation.listing._id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-3)', background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                      <img src={activeConversation.listing.images?.[0]?.url} alt="" style={{ width: 32, height: 24, objectFit: 'cover', borderRadius: 4 }} />
                      <div className="hide-on-mobile">
                        <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Regarding</p>
                        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeConversation.listing.title}</p>
                      </div>
                    </div>
                  </Link>
                )}
                <button className="btn btn-ghost btn-icon-sm"><MoreVertical size={18} /></button>
              </div>

              <div className="chat-messages" style={{ flex: 1, overflowY: 'auto' }}>
                {hasMore && activeMessages.length >= 50 && (
                  <div style={{ textAlign: 'center', padding: 'var(--space-3)' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setPage(p => p + 1); loadMessages(conversationId, page + 1); }}>Load older messages</button>
                  </div>
                )}
                
                {activeMessages.map((msg, idx) => {
                  const isSent = msg.sender?._id === user._id;
                  const isSystem = msg.type === 'system';
                  
                  if (isSystem) {
                    return (
                      <div key={msg._id} className="message-bubble system">
                        <div className="message-content">{msg.text}</div>
                      </div>
                    );
                  }

                  return (
                    <div key={msg._id} className={`message-bubble ${isSent ? 'sent' : 'received'}`}>
                      {!isSent && (
                        <img src={otherParticipant?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParticipant?.name || 'U')}&background=E2E8F0`} alt="" className="avatar avatar-sm" style={{ marginTop: 'auto' }} />
                      )}
                      <div style={{ maxWidth: '100%' }}>
                        <div className="message-content">{msg.text}</div>
                        <div className="message-meta">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {isSent && (msg.seen ? <CheckCheck size={12} color="var(--primary-light)" /> : <Check size={12} color="rgba(255,255,255,0.6)" />)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {isTyping && (
                  <div className="message-bubble received">
                    <img src={otherParticipant?.avatar?.url} alt="" className="avatar avatar-sm" style={{ marginTop: 'auto' }} />
                    <div className="message-content" style={{ padding: '10px 14px' }}>
                      <div className="typing-indicator" style={{ padding: 0 }}>
                        <div className="typing-dot" />
                        <div className="typing-dot" />
                        <div className="typing-dot" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form className="chat-input-area" onSubmit={handleSend}>
                <textarea 
                  className="input" 
                  placeholder="Type a message..." 
                  value={inputText}
                  onChange={handleInput}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
                  rows={1}
                />
                <button type="submit" disabled={!inputText.trim()} className="btn btn-primary btn-icon" style={{ borderRadius: '50%' }}>
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div className="empty-state" style={{ height: '100%' }}>
              <div className="empty-state-icon"><MessageCircle size={32} /></div>
              <h3>Select a conversation</h3>
              <p>Choose a chat from the sidebar to start messaging.</p>
            </div>
          )}
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .chat-layout { grid-template-columns: 1fr; }
          .hide-on-mobile { display: none !important; }
          .mobile-only { display: flex !important; }
        }
        .mobile-only { display: none; }
      `}</style>
    </div>
  );
};

export default ChatLayout;
