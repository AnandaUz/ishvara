import { Router } from "express";
import {
  getGuests,
  deleteGuest,
  clearEvents,
  post_addTag,
  sendMetaEvent,
} from "../controllers/guests.controller.js";

const router = Router();

router.get("/get", getGuests);
router.delete("/delete", deleteGuest);
router.post("/clear-events", clearEvents);
router.post("/add-tag", post_addTag);
router.post("/send-meta-event", sendMetaEvent);

export default router;
