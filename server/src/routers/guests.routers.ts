import { Router } from 'express';
import { getGuests, deleteGuest, clearEvents } from '../controllers/guests.controller.js';


const router = Router();

router.get('/get', getGuests);
router.delete('/delete', deleteGuest);
router.post('/clear-events', clearEvents);

export default router;

