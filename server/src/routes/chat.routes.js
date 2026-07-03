const express = require('express');
const router = express.Router();
const { getConversations, getMessages } = require('../controllers/chatController');
const { protect } = require('../middlewares/auth.middleware');

router.get('/conversations', protect, getConversations);
router.get('/conversations/:conversationId/messages', protect, getMessages);

module.exports = router;
