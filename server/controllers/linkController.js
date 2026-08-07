import {
  createLink,
  deleteLink,
  listLinks,
  updateLinkTitle,
} from '../services/linkService.js';
import { sendData } from '../utils/apiResponse.js';
import { validateCreateLink, validateUpdateLink } from '../validators/linkInput.js';

export async function getLinks(req, res) {
  const links = await listLinks(req.user.id);
  return sendData(res, { links });
}

export async function postLink(req, res) {
  const attributes = validateCreateLink(req.body);
  const link = await createLink(req.user, attributes);
  return sendData(res, { link }, 201);
}

export async function putLink(req, res) {
  const { title } = validateUpdateLink(req.body);
  const link = await updateLinkTitle(req.user.id, req.params.id, title);
  return sendData(res, { link });
}

export async function removeLink(req, res) {
  await deleteLink(req.user.id, req.params.id);
  return res.status(204).send();
}
