import { Router } from "express";
import { StatisticsController } from "../controllers/statistics.controller.js";

const router = Router();

router.get("/do-formating-data", StatisticsController.findUnregistredEvents);
router.get("/set-tags", StatisticsController.setTags);
router.get("/stat-count-tags", StatisticsController.stat_countTags);
router.get("/stat-count-bots", StatisticsController.stat_countBots);

export default router;
