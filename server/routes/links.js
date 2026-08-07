import { Router } from 'express';
import { getLinks, postLink, putLink, removeLink } from '../controllers/linkController.js';
import { verifyGoogleToken } from '../middleware/auth.js';
import { requireDatabase } from '../middleware/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Authenticate before acquiring a database connection so invalid callers receive
// the correct 401 response even while the database is unavailable.
router.use(verifyGoogleToken, requireDatabase);
router.get('/', asyncHandler(getLinks));
router.post('/', asyncHandler(postLink));
router.put('/:id', asyncHandler(putLink));
router.delete('/:id', asyncHandler(removeLink));

export default router;
