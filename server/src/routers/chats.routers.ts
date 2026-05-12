import { Router } from "express";
import chats from "../controllers/chats/chats.controller.js";

const router = Router();
router.get("/messages/:chatId", chats.getMessages);
router.post("/message/:chatId", chats.sendMessage);
router.post("/create/:guestId", async (req, res) => {
  const { guestId } = req.params;
  const newChatId = await chats.createNewChatFor(guestId);
  res.json({ newChatId });
});

export default router;
