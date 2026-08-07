import mongoose from 'mongoose';
import Link from '../models/Link.js';
import { ApiError, badRequest, notFound } from '../utils/apiError.js';

function assertValidLinkId(linkId) {
  if (!mongoose.isObjectIdOrHexString(linkId)) {
    throw badRequest('The link ID is invalid.', { field: 'id' });
  }
}

export async function listLinks(userId) {
  return Link.find({ userId }).sort({ createdAt: -1 }).lean();
}

export async function createLink(user, attributes) {
  const existing = await Link.exists({ userId: user.id, url: attributes.url });
  if (existing) {
    throw new ApiError(409, 'DUPLICATE_LINK', 'This link has already been saved.', { field: 'url' });
  }

  return Link.create({
    userId: user.id,
    userEmail: user.email,
    ...attributes,
  });
}

export async function updateLinkTitle(userId, linkId, title) {
  assertValidLinkId(linkId);
  const link = await Link.findOneAndUpdate(
    { _id: linkId, userId },
    { $set: { title } },
    { new: true, runValidators: true }
  );

  if (!link) throw notFound('Link not found.');
  return link;
}

export async function deleteLink(userId, linkId) {
  assertValidLinkId(linkId);
  const link = await Link.findOneAndDelete({ _id: linkId, userId });
  if (!link) throw notFound('Link not found.');
}
