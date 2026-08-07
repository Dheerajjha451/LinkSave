export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function badRequest(message, details) {
  return new ApiError(400, 'BAD_REQUEST', message, details);
}

export function unauthorized(message = 'A valid Google access token is required') {
  return new ApiError(401, 'UNAUTHORIZED', message);
}

export function notFound(message = 'The requested resource was not found') {
  return new ApiError(404, 'NOT_FOUND', message);
}
