import { Router } from "express";
import { StatisticsController } from "../controllers/statistics.controller.js";

const router = Router();

router.get("/do-formating-data", StatisticsController.findUnregistredEvents);
router.get("/set-tags", StatisticsController.setTags);
router.get("/stat-count-tags", StatisticsController.stat_countTags);

export default router;
