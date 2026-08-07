import { API_BASE } from './config';

export interface SavedLink {
  _id: string;
  userId: string;
  userEmail: string;
  url: string;
  title: string;
  faviconUrl: string;
  createdAt: string;
}

interface ApiEnvelope<T> {
  data: T;
}

interface ApiErrorEnvelope {
  error?: {
    code?: string;
    message?: string;
  } | string;
}

export async function getApiErrorMessage(response: Response): Promise<string> {
  const payload = await response.json().catch(() => null) as ApiErrorEnvelope | null;
  if (typeof payload?.error === 'string') return payload.error;
  if (payload?.error?.message) return payload.error.message;
  return `Request failed with status ${response.status}.`;
}

async function readApiData<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response));
  }

  const payload = await response.json().catch(() => null) as ApiEnvelope<T> | null;
  if (!payload?.data) {
    throw new Error('The server returned an invalid response.');
  }
  return payload.data;
}

/**
 * Fetch all saved links for the current user
 */
export async function getLinks(token: string): Promise<SavedLink[]> {
  const res = await fetch(`${API_BASE}/links`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await readApiData<{ links: SavedLink[] }>(res);
  return data.links;
}

/**
 * Save a new link
 */
export async function saveLink(
  token: string,
  link: { url: string; title: string; faviconUrl: string }
): Promise<SavedLink> {
  const res = await fetch(`${API_BASE}/links`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(link),
  });

  const data = await readApiData<{ link: SavedLink }>(res);
  return data.link;
}

/**
 * Update a saved link (e.g. custom title)
 */
export async function updateLink(
  token: string,
  linkId: string,
  updates: { title: string }
): Promise<SavedLink> {
  const res = await fetch(`${API_BASE}/links/${linkId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  const data = await readApiData<{ link: SavedLink }>(res);
  return data.link;
}

/**
 * Delete a saved link by ID
 */
export async function deleteLink(token: string, linkId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/links/${linkId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error(await getApiErrorMessage(res));
}
