jest.mock('../models/ChatApp', () => ({
  findAll: jest.fn(), findById: jest.fn(), insert: jest.fn(),
  updateById: jest.fn(), deactivateById: jest.fn(), getStatistics: jest.fn()
}));

const ChatApp = require('../models/ChatApp');
const Service = require('./ChatAppService');

beforeEach(() => {
  jest.clearAllMocks();
  ChatApp.findById.mockResolvedValue({ chatId: 'chat-1', ownerId: 7 });
});

test('non-owner cannot update a chat app', async () => {
  await expect(Service.updateChatApp({
    actor: { userId: 8, role: 'user' },
    chatId: 'chat-1', updates: { title: 'New title' }
  })).rejects.toMatchObject({ code: 'FORBIDDEN' });
  expect(ChatApp.updateById).not.toHaveBeenCalled();
});

test('owner update scopes the write by owner ID', async () => {
  ChatApp.updateById.mockResolvedValue(true);
  await Service.updateChatApp({
    actor: { userId: 7, role: 'user' },
    chatId: 'chat-1', updates: { title: 'New title' }
  });
  expect(ChatApp.updateById).toHaveBeenCalledWith({
    chatId: 'chat-1', ownerId: 7, updates: { title: 'New title' }
  });
});

test('public statistics cannot be scoped to another user', async () => {
  await expect(Service.getChatStatistics({ requestedOwnerId: 7 }))
    .rejects.toMatchObject({ code: 'FORBIDDEN' });
  expect(ChatApp.getStatistics).not.toHaveBeenCalled();
});
