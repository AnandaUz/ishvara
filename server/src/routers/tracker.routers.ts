import { Router } from 'express';
import { start, idCreateLimiter, pushEvents, saveCookies } from '../controllers/tracker.controller.js';

const router = Router();

router.post('/start', idCreateLimiter, start);
router.post('/push-events', pushEvents);
router.post('/save-cookies', saveCookies);

export default router;