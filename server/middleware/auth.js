import { ApiError, unauthorized } from '../utils/apiError.js';

const USER_INFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';
const GOOGLE_REQUEST_TIMEOUT_MS = 5000;

/**
 * Middleware that verifies Google OAuth token from the Authorization header.
 * Extracts userId and userEmail and attaches them to the request.
 */
export async function verifyGoogleToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(unauthorized());
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) return next(unauthorized());

  try {
    const response = await fetch(
      USER_INFO_URL,
      {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(GOOGLE_REQUEST_TIMEOUT_MS),
      }
    );

    if (!response.ok) {
      throw unauthorized('Google rejected the access token. Please sign in again.');
    }

    const userInfo = await response.json();

    if (!userInfo.sub || !userInfo.email) {
      throw unauthorized('Google did not return the required account information.');
    }

    req.user = {
      id: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name || '',
      picture: userInfo.picture || '',
    };

    return next();
  } catch (error) {
    if (error instanceof ApiError) return next(error);
    console.error('Google token verification failed:', error.message);
    return next(new ApiError(
      503,
      'AUTH_PROVIDER_UNAVAILABLE',
      'Google sign-in is temporarily unavailable. Please try again shortly.'
    ));
  }
}
