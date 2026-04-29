'use strict';

const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

async function registerChatHandlers(io, socket) {
  const userId = socket.userId;

  // Auto-join all conversation rooms on connect
  try {
    const conversations = await Conversation.find({ participants: userId }, '_id');
    conversations.forEach((c) => socket.join(`conv_${c._id}`));
  } catch (err) {
    console.error('[socket] join rooms error:', err.message);
  }

  // Event: send_message
  socket.on('send_message', async (data) => {
    try {
      const { conversationId, type, content, fileUrl, fileName, fileSize, fileMimeType } = data || {};

      if (!conversationId || !type) {
        return socket.emit('error', { message: 'Thiếu thông tin tin nhắn' });
      }

      // Validate user is participant
      const conv = await Conversation.findOne({ _id: conversationId, participants: userId });
      if (!conv) {
        return socket.emit('error', { message: 'Không tìm thấy cuộc hội thoại' });
      }

      // Validate content
      if (type === 'text') {
        if (!content || !content.trim()) {
          return socket.emit('error', { message: 'Tin nhắn không được để trống' });
        }
      } else {
        if (!fileUrl) {
          return socket.emit('error', { message: 'Thiếu URL file' });
        }
      }

      // Save message
      const message = await Message.create({
        conversationId,
        sender: userId,
        type,
        content: type === 'text' ? content.trim() : null,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        fileSize: fileSize || null,
        fileMimeType: fileMimeType || null,
      });

      await message.populate('sender', 'name avatar');

      // Update conversation metadata — increment unread for the other participant
      const otherParticipant = conv.participants.find((p) => p.toString() !== userId);
      if (otherParticipant) {
        const currentUnread = conv.unreadCounts.get(otherParticipant.toString()) || 0;
        conv.unreadCounts.set(otherParticipant.toString(), currentUnread + 1);
      }
      conv.lastMessage = {
        content: type === 'text' ? content.trim() : (fileName || 'File đính kèm'),
        type,
        senderId: userId,
        createdAt: message.createdAt,
      };
      await conv.save();

      // Broadcast to both participants in the room
      io.to(`conv_${conversationId}`).emit('new_message', message.toObject());
      io.to(`conv_${conversationId}`).emit('conversation_updated', {
        conversationId,
        lastMessage: conv.lastMessage,
        unreadCounts: Object.fromEntries(conv.unreadCounts),
      });
    } catch (err) {
      console.error('[socket] send_message error:', err.message);
      socket.emit('error', { message: 'Gửi tin nhắn thất bại' });
    }
  });

  // Event: mark_read
  socket.on('mark_read', async ({ conversationId } = {}) => {
    try {
      if (!conversationId) return;
      const conv = await Conversation.findOne({ _id: conversationId, participants: userId });
      if (!conv) return;
      conv.unreadCounts.set(userId.toString(), 0);
      await conv.save();
      socket.emit('conversation_updated', {
        conversationId,
        lastMessage: conv.lastMessage,
        unreadCounts: Object.fromEntries(conv.unreadCounts),
      });
    } catch (err) {
      console.error('[socket] mark_read error:', err.message);
    }
  });
}

module.exports = { registerChatHandlers };
