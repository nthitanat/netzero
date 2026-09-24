const config = require('../config/env');
const crypto = require('crypto');
const ChatApp = require('../models/ChatApp');
const { applicationError } = require('../errors/applicationError');

const DEFAULT_PAGE_SIZE = config.pagination.defaultPageSize;
const MAX_PAGE_SIZE = config.pagination.maxPageSize;
const DEFAULT_STATUS = 'active';

function actorId(actor) {
  return actor.userId ?? actor.id;
}

function pageOptions({ limit, offset } = {}) {
  return {
    limit: Math.min(limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE),
    offset: offset ?? 0
  };
}

async function requireChatApp(chatId) {
  const chatApp = await ChatApp.findById(chatId);
  if (!chatApp) throw applicationError('NOT_FOUND', 'Chat application not found');
  return chatApp;
}

async function listChatApps({ filters = {} }) {
  return ChatApp.findAll({ ...filters, ...pageOptions(filters) });
}

async function getChatAppById({ chatId }) {
  return requireChatApp(chatId);
}

async function getMyChatApps({ actor, page }) {
  return ChatApp.findAll({ ownerId: actorId(actor), ...pageOptions(page) });
}

async function createChatApp({ actor, data }) {
  const chatId = `chat-${crypto.randomUUID()}`;
  await ChatApp.insert({
    chatId,
    ownerId: actorId(actor),
    productId: data.productId,
    title: data.title,
    description: data.description,
    status: data.status ?? DEFAULT_STATUS
  });
  return ChatApp.findById(chatId);
}

function assertCanEdit(actor, chatApp) {
  if (actor.role !== 'admin' && chatApp.ownerId !== actorId(actor)) {
    throw applicationError('FORBIDDEN', 'Access denied. You can only update your own chat applications.');
  }
}

async function updateChatApp({ actor, chatId, updates }) {
  const chatApp = await requireChatApp(chatId);
  assertCanEdit(actor, chatApp);
  const didUpdate = await ChatApp.updateById({ chatId, ownerId: chatApp.ownerId, updates });
  if (!didUpdate) throw applicationError('NOT_FOUND', 'Chat application not found or no changes made');
  return ChatApp.findById(chatId);
}

async function deleteChatApp({ actor, chatId }) {
  const chatApp = await requireChatApp(chatId);
  assertCanEdit(actor, chatApp);
  const didDelete = await ChatApp.deactivateById({ chatId, ownerId: chatApp.ownerId });
  if (!didDelete) throw applicationError('NOT_FOUND', 'Chat application not found');
}

async function getChatStatistics({ actor, requestedOwnerId }) {
  if (requestedOwnerId !== undefined && (!actor || (actor.role !== 'admin' && requestedOwnerId !== actorId(actor)))) {
    throw applicationError('FORBIDDEN', 'Access denied');
  }
  const ownerId = actor?.role === 'admin'
    ? (requestedOwnerId ?? null)
    : (actor ? actorId(actor) : null);
  const statistics = await ChatApp.getStatistics(ownerId);
  return { statistics, scope: ownerId === null ? 'global' : 'user' };
}

module.exports = {
  listChatApps,
  getChatAppById,
  getMyChatApps,
  createChatApp,
  updateChatApp,
  deleteChatApp,
  getChatStatistics
};
