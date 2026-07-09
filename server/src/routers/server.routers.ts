import { Router } from "express";
import { ServerController } from "../controllers/server.controller.js";

const router = Router();
router.get("/arhive1", ServerController.arhive1);

export default router;
