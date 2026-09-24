const assert = require('assert');
const database = require('../src/config/database');
const model = require('../src/models/ProductSurvey');
const aiClient = require('../src/adapters/productSurveyAiClient');

const tx = { execute: async () => [] };
database.withTransaction = async operation => operation(tx);

const calls = [];
model.findProductForUpdate = async (productId, options) => {
  calls.push(['product', productId, options]);
  return { productId };
};
model.findQuestionsByCodes = async (questionIds, options) => {
  calls.push(['questions', questionIds, options]);
  return [{
    id: 'uuid-q1', questionId: 'q1', isActive: true,
    questionText: 'Question', scoringCriteria: 'Criterion', weight: 1,
    criterionCode: 'C1', criterionNameTh: 'เกณฑ์', standardReference: 'ISO'
  }];
};
model.getLatestTrialCount = async (productId, options) => {
  calls.push(['trial', productId, options]);
  return 2;
};
model.insertResponse = async (response, options) => {
  calls.push(['response', response, options]);
  return 'response-1';
};
model.insertAnswers = async (answers, options) => {
  calls.push(['answers', answers, options]);
};
model.updateResponseById = async (responseId, updates) => {
  calls.push(['update', responseId, updates]);
  return { surveyResponseId: responseId, productId: '42', ...updates };
};
aiClient.evaluateSurvey = async prompt => {
  assert.ok(prompt.prompt.includes('Question'));
  return { result: {
    status: 'pass', alignment_level: 'emerging', overall_score: 75,
    ai_comment: 'Result'
  }, rawText: '{}' };
};

const service = require('../src/services/AiProductSurveyService');

async function run() {
  const answer = { questionId: 'q1', score: 8 };
  const evaluated = await service.evaluateProductSurvey({ productId: '42', answers: [answer] });
  assert.strictEqual(evaluated.status, 'passed');
  assert.strictEqual(evaluated.alignmentLevel, 'emerging');
  assert.strictEqual(calls.find(call => call[0] === 'response')[1].trialCount, 3);
  assert.deepStrictEqual(calls.find(call => call[0] === 'answers')[2], { tx });
  assert.strictEqual(calls.find(call => call[0] === 'answers')[1][0].questionId, 'uuid-q1');
  calls.length = 0;
  await assert.rejects(
    service.evaluateProductSurvey({ productId: '42', answers: [answer, answer] }),
    error => error.code === 'VALIDATION'
  );
  assert.ok(!calls.some(call => call[0] === 'response'));
  calls.length = 0;
  aiClient.evaluateSurvey = async () => { throw new Error('provider offline'); };
  await assert.rejects(
    service.evaluateProductSurvey({ productId: '42', answers: [answer] }),
    error => error.code === 'AI_UNAVAILABLE' && error.statusCode === 502
  );
  assert.strictEqual(calls.find(call => call[0] === 'update')[2].status, 'needs_review');
  process.stdout.write('product survey service tests passed\n');
}

run().catch(error => {
  process.stderr.write(`${error.stack}\n`);
  process.exitCode = 1;
});
