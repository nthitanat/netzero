const assert = require('assert');
const { createChatService } = require('../src/services/ChatService');

async function run() {
  let providerInput;
  const service = createChatService({
    welcomeClient: {
      generateWelcomeResponse: async (input) => {
        providerInput = input;
        return 'Answer';
      }
    },
    getUptime: () => 10
  });
  const answer = await service.getWelcome({
    actor: { userId: 7 }, chatId: 'chat-1', message: 'What is NetZero?'
  });
  assert.deepStrictEqual(providerInput, {
    userId: 7, chatId: 'chat-1', inputText: 'What is NetZero?'
  });
  assert.deepStrictEqual(answer, {
    chatId: 'chat-1', userId: 7, welcomeMessage: 'Answer'
  });
  assert.strictEqual(service.getHealth().uptime, 10);
  process.stdout.write('chat service tests passed\n');
}

run().catch(error => {
  process.stderr.write(`${error.stack}\n`);
  process.exitCode = 1;
});
