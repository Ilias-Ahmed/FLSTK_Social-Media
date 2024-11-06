import mongoose from "mongoose";

// Comment Schema (embedded inside Post)
const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
  },
  { timestamps: true }
);

// Post Schema
const postSchema = new mongoose.Schema(
  {
    caption: {
      type: String,
      default: "",
      trim: true,
      maxlength: [2200, "Caption cannot exceed 2200 characters"],
    },
    image: {
      url: {
        type: String,
        required: true,
      },
      public_id: String,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [commentSchema], // Embedded comments schema
  },
  { timestamps: true }
);

// Indexing for sorting posts by author and creation time
postSchema.index({ author: 1, createdAt: -1 });

const Post = mongoose.model("Post", postSchema);

export default Post;
