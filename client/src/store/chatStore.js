import { create } from 'zustand';
import api from '../services/api';

const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: {},         // { conversationId: [...messages] }
  onlineUsers: new Set(),
  typingUsers: {},      // { conversationId: Set of userIds }
  isLoading: false,

  setActiveConversation: (conversation) => set({ activeConversation: conversation }),

  fetchConversations: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/chat/conversations');
      set({ conversations: res.data.data.conversations, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchMessages: async (conversationId, page = 1) => {
    try {
      const res = await api.get(`/chat/conversations/${conversationId}/messages?page=${page}`);
      const msgs = res.data.data.messages;
      set(state => ({
        messages: {
          ...state.messages,
          [conversationId]: page === 1 ? msgs : [...msgs, ...(state.messages[conversationId] || [])],
        },
      }));
      return res.data.data.pagination;
    } catch {}
  },

  addMessage: (message) => {
    const convId = message.conversation;
    set(state => ({
      messages: {
        ...state.messages,
        [convId]: [...(state.messages[convId] || []), message],
      },
      conversations: state.conversations.map(c =>
        c._id === convId
          ? { ...c, lastMessage: message, lastMessageAt: message.createdAt }
          : c
      ).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)),
    }));
  },

  updateMessageSeen: (messageId, conversationId) => {
    set(state => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] || []).map(m =>
          m._id === messageId ? { ...m, seen: true } : m
        ),
      },
    }));
  },

  setUserOnline: (userId) => {
    set(state => ({
      onlineUsers: new Set([...state.onlineUsers, userId]),
    }));
  },

  setUserOffline: (userId) => {
    set(state => {
      const next = new Set(state.onlineUsers);
      next.delete(userId);
      return { onlineUsers: next };
    });
  },

  setTyping: (userId, conversationId, isTyping) => {
    set(state => {
      const convTypers = new Set(state.typingUsers[conversationId] || []);
      if (isTyping) convTypers.add(userId);
      else convTypers.delete(userId);
      return { typingUsers: { ...state.typingUsers, [conversationId]: convTypers } };
    });
  },

  isOnline: (userId) => get().onlineUsers.has(userId),
}));

export default useChatStore;
