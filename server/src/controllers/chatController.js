const { Conversation, Message } = require('../models/Conversation');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// ─── Get User's Conversations ─────────────────────────────────────────────────
const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id,
  })
    .populate('participants', 'name avatar lastSeen')
    .populate('listing', 'title location.city rent images status')
    .populate('lastMessage', 'text type createdAt seen sender')
    .sort({ lastMessageAt: -1 });

  // Add unread count per conversation
  const conversationIds = conversations.map(c => c._id);
  const unreadCounts = await Message.aggregate([
    {
      $match: {
        conversation: { $in: conversationIds },
        sender: { $ne: req.user._id },
        seen: false,
      },
    },
    { $group: { _id: '$conversation', count: { $sum: 1 } } },
  ]);

  const unreadMap = {};
  unreadCounts.forEach(u => { unreadMap[u._id.toString()] = u.count; });

  const enriched = conversations.map(conv => ({
    ...conv.toObject(),
    unreadCount: unreadMap[conv._id.toString()] || 0,
    otherParticipant: conv.participants.find(p => p._id.toString() !== req.user._id.toString()),
  }));

  res.status(200).json(
    new ApiResponse(200, { conversations: enriched }, 'Conversations fetched.')
  );
});

// ─── Get Messages in Conversation ────────────────────────────────────────────
const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  // Verify participant
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: req.user._id,
  });
  if (!conversation) throw new ApiError(404, 'Conversation not found.');

  const skip = (Number(page) - 1) * Number(limit);
  const [messages, total] = await Promise.all([
    Message.find({ conversation: conversationId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(Number(limit)),
    Message.countDocuments({ conversation: conversationId }),
  ]);

  // Mark messages from other participant as seen
  await Message.updateMany(
    { conversation: conversationId, sender: { $ne: req.user._id }, seen: false },
    { seen: true, seenAt: new Date() }
  );

  res.status(200).json(
    new ApiResponse(200, {
      messages,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    }, 'Messages fetched.')
  );
});

module.exports = { getConversations, getMessages };
