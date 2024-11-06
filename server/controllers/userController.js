import User from "../models/User.js";
import Post from "../models/Post.js";
import { generateToken } from "../utils/jwtUtils.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../config/cloudinary.js";

/*Register a new user*/
export const register = async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { userName }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Create new user
    const newUser = await User.create({ userName, email, password });
    const token = generateToken(newUser._id);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        _id: newUser._id,
        userName: newUser.userName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      },
      token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

/*Authenticate user & generate token*/
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and verify password
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token and set cookie
    const token = generateToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return res.json({
      success: true,
      message: `Welcome back ${user.userName}`,
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        profilePic: user.profilePic,
        bio: user.bio,
        followers: user.followers.length,
        following: user.following.length,
        posts: user.posts.length,
        bookmarks: user.bookmarks.length,
      },
      token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

/* Logout user by clearing cookie*/
export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    });
  }
};

/* Get current user's profile*/
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: "posts",
        populate: {
          path: "likes",
          select: "_id",
        },
      })
      .populate("bookmarks")
      .select("-password");

    return res.json({
      success: true,
      message: "User profile fetched successfully",
      user: {
        ...user._doc,
        bookmarks: user.bookmarks || [],
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
      error: error.message,
    });
  }
};

/* Get profile of another user by ID*/
export const getOthersProfile = async (req, res) => {
  try {
    const { id } = req.params;
    // Find user but exclude password field
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      message: "User profile fetched successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
      error: error.message,
    });
  }
};

/* Update user profile including bio and profile picture*/
export const updateUserProfile = async (req, res) => {
  try {
    const { bio } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (bio) {
      user.bio = bio;
    }

    if (req.file) {
      try {
        if (user.profilePic && user.profilePic.public_id) {
          await deleteFromCloudinary(user.profilePic.public_id);
        }

        const result = await uploadToCloudinary(req.file, "profile_pics");
        user.profilePic = {
          url: result.secure_url,
          public_id: result.public_id,
        };
      } catch (uploadError) {
        return res.status(400).json({
          success: false,
          message: "Error uploading profile picture",
          error: uploadError.message,
        });
      }
    }

    const updatedUser = await user.save();
    const populatedUser = await User.findById(updatedUser._id)
      .populate("posts")
      .select("-password");

    return res.json({
      success: true,
      message: "User profile updated successfully",
      user: populatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Profile update failed",
      error: error.message,
    });
  }
};

/*Toggle follow/unfollow user*/
export const toggleFollowUser = async (req, res) => {
  try {
    // Get both users involved
    const userToToggle = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToToggle) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isFollowing = currentUser.following.includes(userToToggle._id);

    // Handle unfollow
    if (isFollowing) {
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== userToToggle._id.toString()
      );
      userToToggle.followers = userToToggle.followers.filter(
        (id) => id.toString() !== currentUser._id.toString()
      );
    }
    // Handle follow
    else {
      currentUser.following.push(userToToggle._id);
      userToToggle.followers.push(currentUser._id);
    }

    // Save both users
    await Promise.all([currentUser.save(), userToToggle.save()]);

    return res.json({
      success: true,
      message: isFollowing
        ? "User unfollowed successfully"
        : "User followed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update follow status",
      error: error.message,
    });
  }
};

/*Get suggested users for the current user*/
export const getSuggestedUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const following = currentUser.following;

    // Find users not followed by current user
    const suggestedUsers = await User.find({
      _id: { $nin: [...following, currentUser._id] },
    })
      .select("-password")
      .limit(5);

    // Return empty array instead of 404
    return res.json({
      success: true,
      message: "Suggested users fetched successfully",
      users: suggestedUsers, // This will be an empty array when no users found
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch suggested users",
      error: error.message,
    });
  }
};

/*Delete user account and all associated data*/
export const deleteUser = async (req, res) => {
  try {
    const userToDelete = await User.findById(req.user._id);
    if (!userToDelete) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // 1. Clean up media from Cloudinary
    if (userToDelete.profilePic?.public_id) {
      await deleteFromCloudinary(userToDelete.profilePic.public_id);
    }

    const posts = await Post.find({ author: req.user._id });
    for (const post of posts) {
      if (post.image?.public_id) {
        await deleteFromCloudinary(post.image.public_id);
      }
    }

    // 2. Clean up user interactions
    await Promise.all([
      // Delete all user's posts
      Post.deleteMany({ author: req.user._id }),

      // Remove user's likes from all posts
      Post.updateMany(
        { likes: req.user._id },
        { $pull: { likes: req.user._id } }
      ),

      // Remove user's comments from all posts
      Post.updateMany(
        { "comments.user": req.user._id },
        { $pull: { comments: { user: req.user._id } } }
      ),

      // Remove user from others' bookmarks
      User.updateMany(
        { bookmarks: { $in: posts.map((post) => post._id) } },
        { $pull: { bookmarks: { $in: posts.map((post) => post._id) } } }
      ),

      // Remove user from followers/following lists
      User.updateMany(
        { $or: [{ followers: req.user._id }, { following: req.user._id }] },
        { $pull: { followers: req.user._id, following: req.user._id } }
      ),
    ]);

    // 3. Delete user account
    await User.findByIdAndDelete(req.user._id);

    // 4. Clear authentication
    res.clearCookie("token");

    return res.json({
      success: true,
      message: "Account and all associated data deleted successfully",
    });
  } catch (error) {
    console.log("Delete error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete account",
      error: error.message,
    });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const query = req.query.q;
    const currentUserId = req.user._id;

    const users = await User.find({
      _id: { $ne: currentUserId },
      userName: { $regex: query, $options: "i" },
    })
      .select("userName profilePic")
      .limit(10);

    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
