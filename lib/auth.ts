import { API_BASE } from './config';

export interface AuthUserInfo {
  userId: string;
  email: string;
  name: string;
  picture: string;
}

const USER_CACHE_KEY = 'linksave_cached_user';

/**
 * Read the last known user profile. This lets the popup render immediately
 * instead of waiting for the /me request every time it opens.
 */
export function getCachedUserInfo(): Promise<AuthUserInfo | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get(USER_CACHE_KEY, (result) => {
      if (chrome.runtime.lastError) {
        resolve(null);
        return;
      }
      resolve((result[USER_CACHE_KEY] as AuthUserInfo | undefined) ?? null);
    });
  });
}

/** Store non-sensitive profile details locally; OAuth tokens remain managed by Chrome. */
export function cacheUserInfo(user: AuthUserInfo): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [USER_CACHE_KEY]: user }, () => resolve());
  });
}

export function clearCachedUserInfo(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.remove(USER_CACHE_KEY, () => resolve());
  });
}

/**
 * Get the Google OAuth token from Chrome identity API
 */
export function getAuthToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      if (!token) {
        reject(new Error('No token received'));
        return;
      }
      resolve(token);
    });
  });
}

/**
 * Remove cached auth token (for sign out)
 */
export function removeCachedToken(token: string): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.identity.removeCachedAuthToken({ token }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve();
    });
  });
}

/**
 * Sign out: remove cached token and revoke it with Google
 */
export async function signOut(): Promise<void> {
  try {
    const token = await getAuthTokenSilent();
    if (token) {
      await removeCachedToken(token);
      // Revoke the token with Google
      await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`);
    }
  } catch (e) {
    // Ignore errors during sign out
  }
}

/**
 * Get auth token without prompting (silent check)
 */
export function getAuthTokenSilent(): Promise<string | null> {
  return new Promise((resolve) => {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (chrome.runtime.lastError || !token) {
        resolve(null);
        return;
      }
      resolve(token);
    });
  });
}

/**
 * Get current user info from the backend
 */
export async function getUserInfo(token: string): Promise<AuthUserInfo | null> {
  try {
    const res = await fetch(`${API_BASE}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const payload = await res.json();
    return payload.data ?? null;
  } catch {
    return null;
  }
}
