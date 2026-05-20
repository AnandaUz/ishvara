import { Router } from "express";
import { NoteController } from "../controllers/notes.controller.js";

const router = Router();

router.get("/get", NoteController.getAll);
router.delete("/delete", NoteController.delete);
router.patch("/update", NoteController.update);
router.post("/create", NoteController.create);

export default router;
