import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import { getIO } from "../utils/socket.js";

export const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user._id;

    // Find or create conversation between users
    const conversation = await Conversation.findOrCreatePrivateChat(
      senderId,
      receiverId
    );

    // Create new message
    const newMessage = new Message({
      senderId,
      conversationId: conversation._id,
      message,
      readBy: [{ user: senderId }], // Mark as read by sender
    });

    await newMessage.save();

    // Update conversation
    conversation.messages.push(newMessage._id);
    conversation.lastMessage = newMessage._id;

    // Increment unread count for receiver
    const receiverUnreadIndex = conversation.unreadCounts.findIndex(
      (u) => u.user.toString() === receiverId.toString()
    );
    if (receiverUnreadIndex !== -1) {
      conversation.unreadCounts[receiverUnreadIndex].count += 1;
    }

    await conversation.save();

    // Emit real-time update
    const io = getIO();
    io.to(receiverId.toString()).emit("newMessage", {
      message: newMessage,
      conversationId: conversation._id,
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({
      success: false,
      message: "Error sending message",
      error: error.message,
    });
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      "participants.user": userId,
      "participants.isActive": true,
    })
      .populate("participants.user", "userName profilePic")
      .populate({
        path: "lastMessage",
        select: "message createdAt readBy",
      })
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching conversations",
      error: error.message,
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Check if user is participant in conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      "participants.user": userId,
      "participants.isActive": true,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Get messages
    const messages = await Message.find({ conversationId })
      .populate("senderId", "userName profilePic")
      .sort({ createdAt: -1 })
      .limit(50);

    // Mark messages as read
    await Message.updateMany(
      {
        conversationId,
        "readBy.user": { $ne: userId },
      },
      {
        $push: { readBy: { user: userId, readAt: new Date() } },
      }
    );

    // Reset unread count
    await conversation.markAsRead(userId);

    res.status(200).json({
      success: true,
      data: messages.reverse(),
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching messages",
      error: error.message,
    });
  }
};

export const startConversation = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user._id;

    let conversation = await Conversation.findOne({
      participants: {
        $all: [
          { $elemMatch: { user: currentUserId } },
          { $elemMatch: { user: userId } },
        ],
      },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [{ user: currentUserId }, { user: userId }],
      });
    }

    // Correct way to chain populate
    conversation = await Conversation.findById(conversation._id)
      .populate("participants.user", "userName profilePic")
      .populate("lastMessage");

    res.status(201).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
