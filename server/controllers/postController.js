import Post from "../models/Post.js";
import User from "../models/User.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../config/cloudinary.js";

// Creates a new post with image upload
export const createPost = async (req, res) => {
  try {
    const { caption } = req.body;
    const userId = req.user._id;

    // Validate image existence in request
    if (!req.file) {
      return res.status(400).json({
        message: "Image is required",
        success: false,
      });
    }

    // Upload image to cloud storage
    const result = await uploadToCloudinary(req.file, "posts");

    // Prepare image data for database
    const imageData = {
      url: result.secure_url,
      public_id: result.public_id,
    };

    // Create post document in database
    const newPost = await Post.create({
      author: userId,
      caption,
      image: imageData,
    });

    // Add post reference to user's posts array
    await User.findByIdAndUpdate(userId, { $push: { posts: newPost._id } });

    // Get post with populated author details
    const populatedPost = await Post.findById(newPost._id).populate(
      "author",
      "userName profilePic"
    );

    res.status(201).json({
      message: "Post created successfully",
      success: true,
      post: populatedPost,
    });
  } catch (error) {
    console.error("Error in createPost:", error);
    res.status(500).json({
      message: error.message || "Error creating post",
      success: false,
    });
  }
};

// Gets all posts with pagination support
export const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "userName profilePic")
      .populate("likes", "_id") // Add this line
      .populate("comments.user", "userName profilePic");

    const total = await Post.countDocuments();

    res.status(200).json({
      message: "Posts fetched successfully",
      success: true,
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching posts",
      success: false,
    });
  }
};

// Gets a single post by its ID
export const getPostById = async (req, res) => {
  try {
    // Find post and populate related fields
    const post = await Post.findById(req.params.id)
      .populate("author", "userName profilePic")
      .populate("comments.user", "userName profilePic");

    // Check if post exists
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    res.status(200).json({
      message: "Post fetched successfully",
      success: true,
      post,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching post",
      success: false,
    });
  }
};

// Toggles bookmark status of a post
export const toggleBookmarkPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    const user = await User.findById(req.user._id);
    const bookmarkIndex = user.bookmarks.indexOf(post._id);

    if (bookmarkIndex === -1) {
      user.bookmarks.push(post._id);
    } else {
      user.bookmarks.splice(bookmarkIndex, 1);
    }

    await user.save();

    return res.status(200).json({
      message: bookmarkIndex === -1 ? "Post bookmarked" : "Post unbookmarked",
      success: true,
      postId: post._id,
      isBookmarked: bookmarkIndex === -1,
      bookmarks: user.bookmarks,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error toggling bookmark",
      success: false,
    });
  }
};

// Updates a post's caption and/or image
export const updatePost = async (req, res) => {
  try {
    const { caption } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to update this post",
        success: false,
      });
    }

    // Update caption
    if (caption) {
      post.caption = caption;
    }

    const updatedPost = await post.save();

    // Populate necessary fields
    const populatedPost = await Post.findById(updatedPost._id)
      .populate("author", "userName profilePic")
      .populate("comments.user", "userName profilePic");

    res.status(200).json({
      message: "Post updated successfully",
      success: true,
      post: populatedPost,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating post",
      success: false,
    });
  }
};

// Deletes a post and its associated image
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Verify post exists
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    // Check user authorization
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to delete this post",
        success: false,
      });
    }

    // Delete image from cloud storage if exists
    if (post.image && post.image.public_id) {
      await deleteFromCloudinary(post.image.public_id);
    }

    // Remove post reference from user's posts array
    await User.findByIdAndUpdate(req.user._id, { $pull: { posts: post._id } });

    // Delete post from database
    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Post deleted successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting post",
      success: false,
    });
  }
};

// Toggles like status of a post for current user
export const toggleLikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    const likeIndex = post.likes.indexOf(req.user._id);

    if (likeIndex === -1) {
      post.likes.push(req.user._id);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate("likes", "_id")
      .populate("author", "userName profilePic");

    res.status(200).json({
      message:
        likeIndex === -1
          ? "Post liked successfully"
          : "Post unliked successfully",
      success: true,
      post: updatedPost,
      isLiked: likeIndex === -1,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error toggling like",
      success: false,
    });
  }
};

// Adds a new comment to a post
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);

    // Verify post exists
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    // Create new comment object
    const newComment = {
      user: req.user._id,
      text,
    };

    // Add comment to post
    post.comments.push(newComment);
    await post.save();

    // Get updated post with populated comment user details
    const populatedPost = await Post.findById(post._id).populate(
      "comments.user",
      "userName profilePic"
    );

    res.status(201).json({
      message: "Comment added successfully",
      success: true,
      comments: populatedPost.comments,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding comment",
      success: false,
    });
  }
};

// Deletes a comment from a post
export const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const post = await Post.findById(id);

    // Verify post exists
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    // Find the specific comment
    const comment = post.comments.id(commentId);

    // Verify comment exists
    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
        success: false,
      });
    }

    // Check user authorization (either comment author or post author)
    if (
      comment.user.toString() !== req.user._id.toString() &&
      post.author.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Not authorized to delete this comment",
        success: false,
      });
    }

    // Remove comment from post
    post.comments.pull(commentId);
    await post.save();

    res.status(200).json({
      message: "Comment deleted successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting comment",
      success: false,
    });
  }
};
