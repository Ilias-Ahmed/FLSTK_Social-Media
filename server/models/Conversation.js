import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    // Defines the type of conversation:
    // - 'private': One-to-one chat between two users
    // - 'group': Chat involving more than two users
    type: {
      type: String,
      enum: ["private", "group"],
      default: "private",
    },

    // Optional name for group conversations
    // Not used in private conversations
    name: {
      type: String,
      trim: true,
      maxlength: [50, "Conversation name cannot exceed 50 characters"],
    },

    // Array of users involved in the conversation
    // For private chats, this will always contain exactly 2 users
    // For group chats, it can contain multiple users
    participants: [
      {
        // Reference to the User model
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        // User's role in the conversation
        // - 'admin': Can add/remove users, change group settings
        // - 'member': Regular participant
        role: {
          type: String,
          enum: ["admin", "member"],
          default: "member",
        },
        // Timestamp when user joined the conversation
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        // Timestamp when user left the conversation (for group chats)
        leftAt: {
          type: Date,
        },
        // Indicates if user is still active in the conversation
        // Used instead of removing the user from participants array
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],

    // Array of all messages in the conversation
    // References to Message model
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],

    // Reference to the most recent message
    // Used for displaying conversation previews
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },

    // Tracks unread messages for each participant
    unreadCounts: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        count: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
    // Include virtual fields when converting to JSON
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create indexes for faster querying
// Helps when fetching conversations for a user
conversationSchema.index({ "participants.user": 1, updatedAt: -1 });

// Virtual field to get number of active participants
conversationSchema.virtual("participantCount").get(function () {
  return this.participants.filter((p) => p.isActive).length;
});

// Method to add a new participant to the conversation
conversationSchema.methods.addParticipant = async function (userId) {
  // Check if user is not already in the conversation
  if (!this.participants.some((p) => p.user.toString() === userId.toString())) {
    this.participants.push({
      user: userId,
      joinedAt: new Date(),
      isActive: true,
    });
    return await this.save();
  }
  return this;
};

// Method to mark messages as read for a user
conversationSchema.methods.markAsRead = async function (userId) {
  const unreadIndex = this.unreadCounts.findIndex(
    (u) => u.user.toString() === userId.toString()
  );

  if (unreadIndex !== -1) {
    this.unreadCounts[unreadIndex].count = 0;
    return await this.save();
  }
  return this;
};

// Static method to find or create a private conversation between two users
conversationSchema.statics.findOrCreatePrivateChat = async function (
  user1Id,
  user2Id
) {
  // Try to find existing conversation
  let conversation = await this.findOne({
    type: "private",
    "participants.user": { $all: [user1Id, user2Id] },
  });

  // If no conversation exists, create a new one
  if (!conversation) {
    conversation = new this({
      type: "private",
      participants: [{ user: user1Id }, { user: user2Id }],
      unreadCounts: [
        { user: user1Id, count: 0 },
        { user: user2Id, count: 0 },
      ],
    });
    await conversation.save();
  }

  return conversation;
};

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
