const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { protect } = require('../middlewares/auth.middleware');

// Get user notifications
router.get('/', protect, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly } = req.query;
  const query = { user: req.user._id };
  if (unreadOnly === 'true') query.isRead = false;

  const skip = (Number(page) - 1) * Number(limit);
  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Notification.countDocuments(query),
    Notification.countDocuments({ user: req.user._id, isRead: false }),
  ]);

  res.json(new ApiResponse(200, { notifications, unreadCount, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } }));
}));

// Mark one as read
router.patch('/:id/read', protect, asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isRead: true });
  res.json(new ApiResponse(200, {}, 'Marked as read.'));
}));

// Mark all as read
router.patch('/read-all', protect, asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  res.json(new ApiResponse(200, {}, 'All notifications marked as read.'));
}));

// Delete notification
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json(new ApiResponse(200, {}, 'Notification deleted.'));
}));

module.exports = router;
