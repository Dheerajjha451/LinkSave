/** Pass rejected async route handlers to Express's centralized error middleware. */
export const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};
