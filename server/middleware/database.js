import { connectDatabase } from '../config/database.js';
import { ApiError } from '../utils/apiError.js';

/** Establishes a database connection only for routes that need persistence. */
export async function requireDatabase(req, res, next) {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return next(new ApiError(
      503,
      'DATABASE_UNAVAILABLE',
      'The database is temporarily unavailable. Please try again shortly.'
    ));
  }
}
