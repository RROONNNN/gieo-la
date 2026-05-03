'use strict';

const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

async function registerChatHandlers(io, socket) {
  const userId = socket.userId;

  // Join a personal room so the user always receives messages regardless of when a conversation was created
  socket.join(`user_${userId}`);

  // Also auto-join existing conversation rooms (kept for backward compatibility)
  try {
    const conversations = await Conversation.find({ participants: userId }, '_id');
    conversations.forEach((c) => socket.join(`conv_${c._id}`));
  } catch (err) {
    console.error('[socket] join rooms error:', err.message);
  }

  // Event: send_message
  // Supports optional ack callback: socket.emit('send_message', data, (ack) => { ... })
  socket.on('send_message', async (data, ack) => {
    const sendAck = typeof ack === 'function' ? ack : null;
    try {
      const { conversationId, type, content, fileUrl, fileName, fileSize, fileMimeType } = data || {};

      if (!conversationId || !type) {
        if (sendAck) sendAck({ success: false, message: 'Thiếu thông tin tin nhắn' });
        return socket.emit('error', { message: 'Thiếu thông tin tin nhắn' });
      }

      // Validate user is participant
      const conv = await Conversation.findOne({ _id: conversationId, participants: userId });
      if (!conv) {
        if (sendAck) sendAck({ success: false, message: 'Không tìm thấy cuộc hội thoại' });
        return socket.emit('error', { message: 'Không tìm thấy cuộc hội thoại' });
      }

      // Validate content
      if (type === 'text') {
        if (!content || !content.trim()) {
          if (sendAck) sendAck({ success: false, message: 'Tin nhắn không được để trống' });
          return socket.emit('error', { message: 'Tin nhắn không được để trống' });
        }
      } else {
        if (!fileUrl) {
          if (sendAck) sendAck({ success: false, message: 'Thiếu URL file' });
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

      // Broadcast to each OTHER participant via their personal user room
      const messagePayload = message.toObject();
      const updatedPayload = {
        conversationId,
        lastMessage: conv.lastMessage,
        unreadCounts: Object.fromEntries(conv.unreadCounts),
      };
      conv.participants.forEach((participantId) => {
        if (participantId.toString() === userId) return; // skip sender — delivered via ack
        io.to(`user_${participantId.toString()}`).emit('new_message', messagePayload);
        io.to(`user_${participantId.toString()}`).emit('conversation_updated', updatedPayload);
      });

      // Deliver the saved message back to the sender via ack (most reliable for self-display)
      if (sendAck) {
        sendAck({ success: true, message: messagePayload });
      } else {
        // Fallback: emit directly to sender's own socket
        socket.emit('new_message', messagePayload);
      }
      socket.emit('conversation_updated', updatedPayload);
    } catch (err) {
      console.error('[socket] send_message error:', err.message);
      if (sendAck) sendAck({ success: false, message: 'Gửi tin nhắn thất bại' });
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
