const SystemService = require('../services/SystemService');
const { sendSuccess } = require('../middleware/response');

function getHealth(req, res) {
  return sendSuccess(res, {
    message: 'NetZero Chat Server is running',
    ...SystemService.getHealth()
  });
}

function getApiInfo(req, res) {
  const { apiPrefix, apiVersion, version, rateLimitMax, rateLimitWindowMs } = SystemService.getApiInfo();
  const apiInfo = {
    service: 'netzero-chat-server',
    version,
    documentation: {
      chat: `${apiPrefix}/${apiVersion}/chat`,
      productSurvey: `${apiPrefix}/${apiVersion}/products`,
      health: '/health'
    },
    endpoints: {
      chat: {
        welcome: `GET ${apiPrefix}/${apiVersion}/chat/:chatid`,
        sendMessage: `POST ${apiPrefix}/${apiVersion}/chat/:chatid/message`,
        getHistory: `GET ${apiPrefix}/${apiVersion}/chat/:chatid/history`,
        health: `GET ${apiPrefix}/${apiVersion}/chat/health`
      },
      productSurvey: {
        submitSurvey: `POST ${apiPrefix}/${apiVersion}/products/:productId/surveys`,
        getSurveyHistory: `GET ${apiPrefix}/${apiVersion}/products/:productId/surveys`,
        getSurveyResponse: `GET ${apiPrefix}/${apiVersion}/products/surveys/:surveyResponseId`,
        getQuestions: `GET ${apiPrefix}/${apiVersion}/products/surveys/questions`,
        health: `GET ${apiPrefix}/${apiVersion}/products/surveys/health`
      }
    },
    usage: {
      authentication: 'Bearer token optional for public endpoints',
      rateLimit: `${rateLimitMax} requests per ${rateLimitWindowMs / 60000} minutes per IP`,
      messageFormat: {
        send: {
          method: 'POST',
          url: `${apiPrefix}/${apiVersion}/chat/{chatid}/message`,
          body: { message: 'Your message here' },
          headers: { 'Authorization': 'Bearer your-jwt-token' }
        },
        submitSurvey: {
          method: 'POST',
          url: `${apiPrefix}/${apiVersion}/products/{productId}/surveys`,
          body: { 
            answers: [
              { questionId: 'q001', score: 8 },
              { questionId: 'q002', score: 7 }
            ]
          },
          headers: { 'Authorization': 'Bearer your-jwt-token (optional)' }
        }
      }
    },
  };
  return sendSuccess(res, { message: 'Welcome to NetZero Chat API', ...apiInfo });
}

async function checkDatabase(req, res) {
  const database = await SystemService.checkDatabase();
  return sendSuccess(res, {
    message: 'Chat Server - Database connection successful',
    database
  });
}

module.exports = { getHealth, getApiInfo, checkDatabase };
