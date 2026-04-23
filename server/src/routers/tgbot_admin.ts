import { Router } from "express";
import { sendMessageTo_tgbotAdmin } from "../controllers/tgbot_admin.controller copy.js";

const router = Router();

router.post("/tgbot-admin-send-message", (req, res) => {
  sendMessageTo_tgbotAdmin(req.body.message);
  res.json({ ok: true });
});

export default router;
