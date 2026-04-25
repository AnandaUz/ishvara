import { Router } from "express";
import {
  getGuests,
  deleteGuest,
  clearEvents,
  post_addTag,
  sendMetaEvent,
  getOneGuest,
  patchOneGuest,
} from "../controllers/guests.controller.js";

const router = Router();

router.get("/get", getGuests);
router.delete("/delete", deleteGuest);
router.post("/clear-events", clearEvents);
router.post("/add-tag", post_addTag);
router.post("/send-meta-event", sendMetaEvent);

// получить одного гостя
router.get("/one/:id", getOneGuest);

// обновить гостя
router.patch("/one/:id", patchOneGuest);

export default router;
