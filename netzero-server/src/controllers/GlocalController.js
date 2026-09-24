const GlocalCheckinService = require('../services/GlocalCheckinService');
const { sendSuccess } = require('../middleware/response');

function serializeCheckin(checkin) {
  return {
    id: checkin.checkinId,
    survey_id: checkin.surveyId,
    identifier_type: checkin.identifierType,
    identifier_value: checkin.identifierValue,
    surveymonkey_response_id: checkin.surveyMonkeyResponseId,
    status: checkin.status,
    checked_in_at: checkin.checkedInAt,
    completed_at: checkin.completedAt,
    last_synced_at: checkin.lastSyncedAt,
    created_at: checkin.createdAt,
    updated_at: checkin.updatedAt
  };
}

async function verifyCheckin(req, res) {
  const result = await GlocalCheckinService.verifyCheckin({
    email: req.validated.body.email
  });
  return sendSuccess(res, { message: 'Check-in verified', data: result });
}

async function listCheckins(req, res) {
  const { items, total } = await GlocalCheckinService.listCheckins({
    filters: req.validated.query
  });
  return sendSuccess(res, {
    message: 'Check-ins retrieved successfully',
    data: items.map(serializeCheckin),
    count: items.length,
    total
  });
}

async function getCheckinById(req, res) {
  const checkin = await GlocalCheckinService.getCheckinById({
    checkinId: req.validated.params.id
  });
  return sendSuccess(res, {
    message: 'Check-in retrieved successfully',
    data: serializeCheckin(checkin)
  });
}

async function createCheckin(req, res) {
  const checkin = await GlocalCheckinService.createCheckin({
    data: req.validated.body
  });
  return sendSuccess(res, {
    message: 'Check-in created successfully',
    data: serializeCheckin(checkin),
    statusCode: 201
  });
}

async function updateCheckin(req, res) {
  const { status, surveymonkeyResponseId: surveyMonkeyResponseId } = req.validated.body;
  const checkin = await GlocalCheckinService.updateCheckin({
    checkinId: req.validated.params.id,
    updates: {
      ...(status !== undefined && { status }),
      ...(surveyMonkeyResponseId !== undefined && { surveyMonkeyResponseId })
    }
  });
  return sendSuccess(res, {
    message: 'Check-in updated successfully',
    data: serializeCheckin(checkin)
  });
}

async function deleteCheckin(req, res) {
  await GlocalCheckinService.deleteCheckin({
    checkinId: req.validated.params.id
  });
  return sendSuccess(res, { message: 'Check-in deleted successfully' });
}

async function receiveWebhook(req, res) {
  const { survey_id: surveyId, response_id: responseId } = req.validated.body.resources;
  try {
    await GlocalCheckinService.receiveWebhook({ surveyId, responseId });
  } catch (error) {
    // Acknowledge provider delivery while retaining the error for investigation.
    console.error('SurveyMonkey webhook processing failed:', error);
  }
  return res.sendStatus(200);
}

module.exports = {
  verifyCheckin,
  listCheckins,
  getCheckinById,
  createCheckin,
  updateCheckin,
  deleteCheckin,
  receiveWebhook
};
