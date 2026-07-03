import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';
import useChatStore from '../store/chatStore';
import useNotificationStore from '../store/notificationStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socketInstance = null;

export const useSocket = () => {
  const { isAuthenticated, accessToken } = useAuthStore();
  const { addMessage, updateMessageSeen, setUserOnline, setUserOffline, setTyping } = useChatStore();
  const { addNotification } = useNotificationStore();
  const socketRef = useRef(null);

  const connect = useCallback(() => {
    if (!isAuthenticated || !accessToken) return;
    if (socketInstance?.connected) {
      socketRef.current = socketInstance;
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('🔌 Socket connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });

    socket.on('new_message', ({ message, conversationId }) => {
      addMessage({ ...message, conversation: conversationId });
    });

    socket.on('message_seen_update', ({ messageId }) => {
      // Find which conversation the message belongs to — update all conversations
      const messages = useChatStore.getState().messages;
      Object.keys(messages).forEach(convId => {
        if (messages[convId]?.some(m => m._id === messageId)) {
          updateMessageSeen(messageId, convId);
        }
      });
    });

    socket.on('user_typing', ({ userId, conversationId, isTyping }) => {
      setTyping(userId, conversationId, isTyping);
    });

    socket.on('user_online', ({ userId }) => {
      setUserOnline(userId);
    });

    socket.on('user_offline', ({ userId }) => {
      setUserOffline(userId);
    });

    socket.on('new_notification', ({ notification }) => {
      addNotification(notification);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    socketInstance = socket;
    socketRef.current = socket;
  }, [isAuthenticated, accessToken]);

  const disconnect = useCallback(() => {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
      socketRef.current = null;
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      // Don't disconnect on unmount — keep socket alive across pages
    };
  }, [connect]);

  useEffect(() => {
    if (!isAuthenticated) disconnect();
  }, [isAuthenticated, disconnect]);

  const joinConversation = useCallback((conversationId) => {
    socketRef.current?.emit('join_conversation', { conversationId });
  }, []);

  const sendMessage = useCallback((conversationId, text) => {
    socketRef.current?.emit('send_message', { conversationId, text });
  }, []);

  const emitTyping = useCallback((conversationId, isTyping) => {
    socketRef.current?.emit('typing', { conversationId, isTyping });
  }, []);

  const markSeen = useCallback((messageId, conversationId) => {
    socketRef.current?.emit('message_seen', { messageId, conversationId });
  }, []);

  return {
    socket: socketRef.current,
    joinConversation,
    sendMessage,
    emitTyping,
    markSeen,
    isConnected: !!socketRef.current?.connected,
  };
};

export const getSocket = () => socketInstance;
