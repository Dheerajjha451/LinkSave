import { Router } from 'express';
import { getCurrentUser } from '../controllers/userController.js';
import { verifyGoogleToken } from '../middleware/auth.js';

const router = Router();

router.get('/me', verifyGoogleToken, getCurrentUser);

export default router;
