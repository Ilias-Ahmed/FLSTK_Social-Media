import express from "express";
import {
  deleteUser,
  toggleFollowUser,
  getSuggestedUsers,
  getUserProfile,
  login,
  logout,
  register,
  updateUserProfile,
  searchUsers,
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// Protected routes
router.use(protect);
router.get("/profile", getUserProfile);
router.put("/profile", upload.single("profilePic"), updateUserProfile);
router.put("/toggle-follow/:id", toggleFollowUser);
router.get("/suggested", getSuggestedUsers);
router.delete("/delete", deleteUser);
router.get("/search", searchUsers);

export default router;
