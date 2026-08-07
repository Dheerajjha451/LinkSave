import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyGoogleToken } from '../middleware/auth.js';
import { notFoundHandler } from '../middleware/errorHandler.js';
import { sendData } from '../utils/apiResponse.js';

function mockResponse() {
  return {
    statusCode: 200,
    body: undefined,
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test('success responses use the standard data envelope', () => {
  const response = mockResponse();
  sendData(response, { links: [] }, 201);

  assert.equal(response.statusCode, 201);
  assert.deepEqual(response.body, { data: { links: [] } });
});

test('protected endpoints reject missing credentials before touching the database', async () => {
  const response = mockResponse();
  let nextError;
  await verifyGoogleToken({ headers: {} }, response, (error) => {
    nextError = error;
  });

  assert.equal(nextError.status, 401);
  assert.deepEqual(
    { code: nextError.code, message: nextError.message },
    {
      code: 'UNAUTHORIZED',
      message: 'A valid Google access token is required',
    }
  );
});

test('unknown routes return a JSON 404 error', () => {
  const response = mockResponse();
  notFoundHandler({ method: 'GET', originalUrl: '/api/not-a-route' }, response);
  assert.equal(response.statusCode, 404);
  assert.equal(response.body.error.code, 'NOT_FOUND');
});
