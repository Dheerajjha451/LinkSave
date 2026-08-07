import mongoose from 'mongoose';
import { ApiError } from '../utils/apiError.js';

function sendError(res, status, code, message, details) {
  const error = { code, message };
  if (details) error.details = details;
  return res.status(status).json({ error });
}

export function notFoundHandler(req, res) {
  return sendError(res, 404, 'NOT_FOUND', `No route matches ${req.method} ${req.originalUrl}`);
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error instanceof ApiError) {
    return sendError(res, error.status, error.code, error.message, error.details);
  }

  if (error instanceof mongoose.Error.CastError) {
    return sendError(res, 400, 'INVALID_ID', 'The link ID is invalid.', { field: error.path });
  }

  if (error instanceof mongoose.Error.ValidationError) {
    const details = Object.fromEntries(
      Object.entries(error.errors).map(([field, value]) => [field, value.message])
    );
    return sendError(res, 422, 'VALIDATION_ERROR', 'One or more fields are invalid.', details);
  }

  if (error?.code === 11000) {
    return sendError(res, 409, 'DUPLICATE_LINK', 'This link has already been saved.');
  }

  if (error?.type === 'entity.parse.failed') {
    return sendError(res, 400, 'INVALID_JSON', 'Request body must be valid JSON.');
  }

  if (error?.type === 'entity.too.large') {
    return sendError(res, 413, 'PAYLOAD_TOO_LARGE', 'Request body must be 16 KB or smaller.');
  }

  console.error('Unhandled API error:', error);
  return sendError(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred. Please try again.');
}
