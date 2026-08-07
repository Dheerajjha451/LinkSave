import { sendData } from '../utils/apiResponse.js';

export function getCurrentUser(req, res) {
  return sendData(res, req.user);
}
