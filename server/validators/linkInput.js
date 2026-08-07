import { badRequest } from '../utils/apiError.js';

const MAX_URL_LENGTH = 2048;
const MAX_TITLE_LENGTH = 500;

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function assertAllowedFields(body, allowedFields) {
  if (!isPlainObject(body)) {
    throw badRequest('Request body must be a JSON object.');
  }

  const unsupported = Object.keys(body).filter((field) => !allowedFields.includes(field));
  if (unsupported.length > 0) {
    throw badRequest('Request body contains unsupported fields.', { fields: unsupported });
  }
}

function normalizeHttpUrl(value, field, { required = false } = {}) {
  if (value === undefined || value === null || value === '') {
    if (required) throw badRequest(`${field} is required.`, { field });
    return '';
  }

  if (typeof value !== 'string') {
    throw badRequest(`${field} must be a string.`, { field });
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    if (required) throw badRequest(`${field} is required.`, { field });
    return '';
  }
  if (trimmed.length > MAX_URL_LENGTH) {
    throw badRequest(`${field} must be at most ${MAX_URL_LENGTH} characters.`, { field });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(trimmed);
  } catch {
    throw badRequest(`${field} must be a valid URL.`, { field });
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw badRequest(`${field} must use http or https.`, { field });
  }

  return parsedUrl.toString();
}

function normalizeTitle(value) {
  if (value === undefined || value === null) return '';
  if (typeof value !== 'string') {
    throw badRequest('title must be a string.', { field: 'title' });
  }

  const title = value.trim();
  if (title.length > MAX_TITLE_LENGTH) {
    throw badRequest(`title must be at most ${MAX_TITLE_LENGTH} characters.`, { field: 'title' });
  }
  return title;
}

export function validateCreateLink(body) {
  assertAllowedFields(body, ['url', 'title', 'faviconUrl']);
  return {
    url: normalizeHttpUrl(body.url, 'url', { required: true }),
    title: normalizeTitle(body.title),
    faviconUrl: normalizeHttpUrl(body.faviconUrl, 'faviconUrl'),
  };
}

export function validateUpdateLink(body) {
  assertAllowedFields(body, ['title']);
  if (!Object.hasOwn(body, 'title')) {
    throw badRequest('title is required.', { field: 'title' });
  }
  return { title: normalizeTitle(body.title) };
}
