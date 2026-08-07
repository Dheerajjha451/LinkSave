import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../utils/apiError.js';
import { validateCreateLink, validateUpdateLink } from '../validators/linkInput.js';

test('validateCreateLink normalizes a valid link payload', () => {
  assert.deepEqual(
    validateCreateLink({
      url: 'https://example.com',
      title: '  Example  ',
      faviconUrl: 'https://example.com/favicon.ico',
    }),
    {
      url: 'https://example.com/',
      title: 'Example',
      faviconUrl: 'https://example.com/favicon.ico',
    }
  );
});

test('validateCreateLink rejects invalid, non-web URLs', () => {
  assert.throws(
    () => validateCreateLink({ url: 'javascript:alert(1)' }),
    (error) => error instanceof ApiError && error.status === 400 && error.code === 'BAD_REQUEST'
  );
});

test('validateUpdateLink requires only a string title', () => {
  assert.deepEqual(validateUpdateLink({ title: '  Renamed  ' }), { title: 'Renamed' });
  assert.throws(() => validateUpdateLink({}), ApiError);
  assert.throws(() => validateUpdateLink({ title: 'Name', url: 'https://example.com' }), ApiError);
});
