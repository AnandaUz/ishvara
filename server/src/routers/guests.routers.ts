import { Router } from 'express';
import { getGuests } from '../controllers/guests.controller.js';


const router = Router();

// Когда кто-то зайдет на /api/users (POST), сработает создание
// router.post('/', createUser);

//
router.get('/get', getGuests);


export default router;

