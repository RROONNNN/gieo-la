'use strict';

const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

/**
 * GET /api/v1/chat/conversations
 * List all conversations for the authenticated user, sorted by latest activity.
 */
const getConversations = async (req, res) => {
  const userId = req.user._id;

  const conversations = await Conversation.find({ participants: userId })
    .populate('participants', 'name avatar role verificationStatus')
    .sort({ updatedAt: -1 });

  const result = conversations.map((conv) => {
    const unreadCount = conv.unreadCounts.get(userId.toString()) || 0;
    return {
      _id: conv._id,
      participants: conv.participants,
      lastMessage: conv.lastMessage,
      unreadCount,
      updatedAt: conv.updatedAt,
      createdAt: conv.createdAt,
    };
  });

  return res.json({ success: true, data: { conversations: result } });
};

/**
 * POST /api/v1/chat/conversations
 * Find an existing conversation between two users, or create a new one.
 * Body: { participantId }
 */
const getOrCreateConversation = async (req, res) => {
  const { participantId } = req.body;
  const userId = req.user._id;

  if (!participantId || !mongoose.Types.ObjectId.isValid(participantId)) {
    return res.status(400).json({ success: false, message: 'participantId không hợp lệ' });
  }

  if (participantId === userId.toString()) {
    return res.status(400).json({ success: false, message: 'Không thể tự chat với chính mình' });
  }

  const participantExists = await User.exists({ _id: participantId });
  if (!participantExists) {
    return res.status(404).json({ success: false, message: 'Người dùng không tồn tại' });
  }

  // Find existing conversation between exactly these two users
  const existing = await Conversation.findOne({
    participants: { $all: [userId, participantId], $size: 2 },
  }).populate('participants', 'name avatar role verificationStatus');

  if (existing) {
    const unreadCount = existing.unreadCounts.get(userId.toString()) || 0;
    return res.json({
      success: true,
      data: {
        conversation: {
          _id: existing._id,
          participants: existing.participants,
          lastMessage: existing.lastMessage,
          unreadCount,
          updatedAt: existing.updatedAt,
          createdAt: existing.createdAt,
        },
      },
    });
  }

  // Create new conversation
  const newConv = await Conversation.create({ participants: [userId, participantId] });
  await newConv.populate('participants', 'name avatar role verificationStatus');

  return res.status(201).json({
    success: true,
    data: {
      conversation: {
        _id: newConv._id,
        participants: newConv.participants,
        lastMessage: newConv.lastMessage,
        unreadCount: 0,
        updatedAt: newConv.updatedAt,
        createdAt: newConv.createdAt,
      },
    },
  });
};

/**
 * GET /api/v1/chat/conversations/:id/messages
 * Paginated message history for a conversation.
 * Query: ?limit=30&before=<messageId>
 */
const getMessages = async (req, res) => {
  const { id: conversationId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    return res.status(400).json({ success: false, message: 'ID cuộc hội thoại không hợp lệ' });
  }

  const conv = await Conversation.findOne({ _id: conversationId, participants: userId });
  if (!conv) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy cuộc hội thoại' });
  }

  const limit = Math.min(parseInt(req.query.limit) || 30, 50);
  const before = req.query.before;

  const filter = { conversationId };
  if (before && mongoose.Types.ObjectId.isValid(before)) {
    filter._id = { $lt: before };
  }

  const messages = await Message.find(filter)
    .populate('sender', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(limit + 1);

  const hasMore = messages.length > limit;
  if (hasMore) messages.pop();

  // Return in chronological order (oldest first)
  messages.reverse();

  return res.json({ success: true, data: { messages, hasMore } });
};

/**
 * PATCH /api/v1/chat/conversations/:id/read
 * Set unread count to 0 for the current user.
 */
const markRead = async (req, res) => {
  const { id: conversationId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    return res.status(400).json({ success: false, message: 'ID cuộc hội thoại không hợp lệ' });
  }

  const conv = await Conversation.findOne({ _id: conversationId, participants: userId });
  if (!conv) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy cuộc hội thoại' });
  }

  conv.unreadCounts.set(userId.toString(), 0);
  await conv.save();

  return res.json({ success: true });
};

module.exports = { getConversations, getOrCreateConversation, getMessages, markRead };
