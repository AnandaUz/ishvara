import { Router } from "express";
import { ServerController } from "../controllers/server.controller.js";

const router = Router();
router.get("/arhive1", ServerController.arhive1);
router.get("/cron-daily-arhive", ServerController.cronDailyArhive);
router.post("/cron-daily-arhive", ServerController.cronDailyArhive);
router.post("/cleanup-user-agents", ServerController.cleanupUserAgents);

export default router;
