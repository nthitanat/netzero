const ChatAppService = require('../services/ChatAppService');
const { sendSuccess } = require('../middleware/response');

function serializeChatApp(chatApp) {
  return {
    id: chatApp.chatId,
    owner_id: chatApp.ownerId,
    product_id: chatApp.productId,
    title: chatApp.title,
    description: chatApp.description,
    status: chatApp.status,
    isActive: chatApp.isActive,
    createdAt: chatApp.createdAt,
    updatedAt: chatApp.updatedAt
  };
}

async function getAllChatApps(req, res) {
  const query = req.validated.query;
  const filters = {
    ownerId: query.owner_id,
    productId: query.product_id,
    status: query.status === 'all' ? undefined : query.status,
    limit: query.limit,
    offset: query.offset
  };
  const chatApps = await ChatAppService.listChatApps({ filters });
  return sendSuccess(res, {
    message: 'Chat applications retrieved successfully',
    data: chatApps.map(serializeChatApp),
    count: chatApps.length,
    filters: query
  });
}

async function getChatAppById(req, res) {
  const chatApp = await ChatAppService.getChatAppById({ chatId: req.validated.params.id });
  return sendSuccess(res, {
    message: 'Chat application retrieved successfully',
    data: { chatApp: serializeChatApp(chatApp) }
  });
}

async function getMyChatApps(req, res) {
  const chatApps = await ChatAppService.getMyChatApps({
    actor: req.user,
    page: req.validated.query
  });
  return sendSuccess(res, {
    message: 'User chat applications retrieved successfully',
    data: {
      chatApps: chatApps.map(serializeChatApp),
      count: chatApps.length,
      userId: req.user.userId ?? req.user.id
    }
  });
}

async function createChatApp(req, res) {
  const body = req.validated.body;
  const chatApp = await ChatAppService.createChatApp({
    actor: req.user,
    data: {
      productId: body.product_id,
      title: body.title,
      description: body.description,
      status: body.status
    }
  });
  return sendSuccess(res, {
    message: 'Chat application created successfully',
    data: { chatApp: serializeChatApp(chatApp) },
    statusCode: 201
  });
}

async function updateChatApp(req, res) {
  const chatApp = await ChatAppService.updateChatApp({
    actor: req.user,
    chatId: req.validated.params.id,
    updates: req.validated.body
  });
  return sendSuccess(res, {
    message: 'Chat application updated successfully',
    data: { chatApp: serializeChatApp(chatApp) }
  });
}

async function deleteChatApp(req, res) {
  const chatId = req.validated.params.id;
  await ChatAppService.deleteChatApp({ actor: req.user, chatId });
  return sendSuccess(res, {
    message: 'Chat application deleted successfully',
    data: { chatId, deleted: true }
  });
}

async function getChatStatistics(req, res) {
  const result = await ChatAppService.getChatStatistics({
    actor: req.user,
    requestedOwnerId: req.validated.query.user_id
  });
  return sendSuccess(res, {
    message: 'Chat statistics retrieved successfully',
    data: result
  });
}

module.exports = {
  getAllChatApps,
  getChatAppById,
  getMyChatApps,
  createChatApp,
  updateChatApp,
  deleteChatApp,
  getChatStatistics
};
