import { Router } from "express";
import chats from "../controllers/chats/chats.controller.js";

const router = Router();
router.get("/messages/:chatId", chats.getMessages);
router.post("/message/:chatId", chats.sendMessage);
router.post("/create/:guestId", async (req, res) => {
  const { guestId } = req.params;
  const { tgbotName } = req.body;
  const newChatData = await chats.createNewChatFor(guestId, tgbotName);
  res.json({ newChatData });
});

export default router;
