const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { Conversation, Message } = require('../models/Conversation');
const Notification = require('../models/Notification');

let io;
// Map userId -> Set of socketIds (user can have multiple tabs)
const onlineUsers = new Map();

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
  });

  // ─── Auth Middleware ──────────────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  // ─── Connection ───────────────────────────────────────────────────────────
  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`🔌 Socket connected: ${userId} (${socket.id})`);

    // Track online users
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Broadcast online status
    socket.broadcast.emit('user_online', { userId });

    // ─── Join Conversation ──────────────────────────────────────────────────
    socket.on('join_conversation', ({ conversationId }) => {
      socket.join(`conversation:${conversationId}`);
    });

    // ─── Send Message ───────────────────────────────────────────────────────
    socket.on('send_message', async ({ conversationId, text }) => {
      try {
        if (!text?.trim()) return;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        // Check if socket user is a participant
        const isParticipant = conversation.participants.some(
          p => p.toString() === userId
        );
        if (!isParticipant) return;

        // Save message to DB
        const message = await Message.create({
          conversation: conversationId,
          sender: userId,
          text: text.trim(),
          type: 'text',
        });

        // Update conversation lastMessage
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: message._id,
          lastMessageAt: new Date(),
        });

        const populatedMessage = await message.populate('sender', 'name avatar');

        // Emit to all in the conversation room
        io.to(`conversation:${conversationId}`).emit('new_message', {
          message: populatedMessage,
          conversationId,
        });

        // Send notification to the OTHER participant
        const recipientId = conversation.participants.find(
          p => p.toString() !== userId
        );
        if (recipientId) {
          const notification = await Notification.create({
            user: recipientId,
            type: 'new_message',
            title: 'New message',
            body: `${socket.user.name}: ${text.substring(0, 60)}...`,
            data: { conversationId },
          });
          emitToUser(recipientId.toString(), 'new_notification', { notification });
        }
      } catch (err) {
        console.error('Socket send_message error:', err);
      }
    });

    // ─── Typing Indicator ───────────────────────────────────────────────────
    socket.on('typing', ({ conversationId, isTyping }) => {
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        userId,
        conversationId,
        isTyping,
      });
    });

    // ─── Message Seen ───────────────────────────────────────────────────────
    socket.on('message_seen', async ({ messageId, conversationId }) => {
      try {
        await Message.findByIdAndUpdate(messageId, {
          seen: true,
          seenAt: new Date(),
        });
        socket.to(`conversation:${conversationId}`).emit('message_seen_update', {
          messageId,
        });
      } catch (err) {
        console.error('Socket message_seen error:', err);
      }
    });

    // ─── Disconnect ─────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
          // Update last seen
          User.findByIdAndUpdate(userId, { lastSeen: new Date() }).catch(() => {});
          socket.broadcast.emit('user_offline', { userId });
        }
      }
      console.log(`🔌 Socket disconnected: ${userId} (${socket.id})`);
    });
  });

  return io;
};

// Emit to a specific user (all their sockets)
const emitToUser = (userId, event, data) => {
  if (!io) return;
  const sockets = onlineUsers.get(userId);
  if (sockets) {
    sockets.forEach(socketId => {
      io.to(socketId).emit(event, data);
    });
  }
};

const isUserOnline = (userId) => onlineUsers.has(userId);

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { initSocket, emitToUser, isUserOnline, getIO };
