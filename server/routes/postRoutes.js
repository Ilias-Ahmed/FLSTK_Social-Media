import express from "express";
import {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLikePost,
  toggleBookmarkPost,
  addComment,
  deleteComment,
} from "../controllers/postController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// Public routes
router.get("/", getAllPosts);
router.get("/:id", getPostById);

// Protected routes
router.use(protect);
router.post("/", upload.single("image"), createPost);
router.post("/:id/bookmark", toggleBookmarkPost);
router.put("/:id", upload.single("image"), updatePost);
router.delete("/:id", deletePost);
router.post("/:id/like", toggleLikePost);
router.post("/:id/comments", addComment);
router.delete("/:id/comments/:commentId", deleteComment);

export default router;
