import { Router } from 'express';
import { getGuests, deleteGuest } from '../controllers/guests.controller.js';


const router = Router();

router.get('/get', getGuests);
router.delete('/delete', deleteGuest);


export default router;

