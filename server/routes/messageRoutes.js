import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  sendMessage,
  getConversations,
  getMessages,
  startConversation,
} from "../controllers/messageController.js";

const router = express.Router();

router.use(protect);

router.post("/send", sendMessage);
router.get("/conversations", getConversations);
router.get("/conversations/:conversationId", getMessages);
router.post("/conversations", startConversation);

export default router;
