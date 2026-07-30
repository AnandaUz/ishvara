import { Router } from "express";
import { PageController } from "../controllers/pages.controller.js";

const router = Router();

router.get("/get", PageController.getAll);
router.delete("/delete", PageController.delete);
router.patch("/update", PageController.update);
router.post("/create", PageController.create);

export default router;
