const GlocalCheckin = require('../models/GlocalCheckin');
const config = require('../config/env');
const surveyMonkeyClient = require('../config/surveyMonkeyClient');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SYNC_TTL_MS = 60 * 1000; // avoid re-querying SurveyMonkey more than once/minute per email

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

function buildVerifyResult(row) {
  if (row.status === 'completed') {
    return { completed: true };
  }

  const redirectUrl = `${config.surveyMonkey.redirectUrl}?email=${encodeURIComponent(row.identifier_value)}`;
  return { completed: false, redirectUrl };
}

class GlocalController {
  // ===========================================
  // PUBLIC CHECK-IN VERIFICATION
  // ===========================================

  // POST /api/v1/glocal/survey-checkins/verify
  static async verifyCheckin(req, res, next) {
    try {
      const { email } = req.body;

      if (!email || !EMAIL_REGEX.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'A valid email is required',
          timestamp: new Date().toISOString()
        });
      }

      const normalizedEmail = normalizeEmail(email);
      const surveyId = config.surveyMonkey.surveyId;

      let row = await GlocalCheckin.findByIdentifier(surveyId, normalizedEmail);

      const isFresh = Boolean(
        row && row.status === 'completed'
      ) || Boolean(
        row && row.last_synced_at && (Date.now() - new Date(row.last_synced_at).getTime()) < SYNC_TTL_MS
      );

      if (!isFresh) {
        let smResult = null;

        try {
          smResult = await surveyMonkeyClient.findResponseByEmail(surveyId, normalizedEmail);
        } catch (smError) {
          console.error('SurveyMonkey lookup failed, falling back to cached data:', smError.message);
        }

        if (smResult) {
          row = await GlocalCheckin.upsert({
            survey_id: surveyId,
            identifier_type: 'email',
            identifier_value: normalizedEmail,
            status: smResult.status,
            surveymonkey_response_id: smResult.responseId,
            completed_at: smResult.status === 'completed' ? new Date() : (row ? row.completed_at : null),
            last_synced_at: new Date()
          });
        } else if (!row) {
          // No cached row and SurveyMonkey call failed - create a not_started
          // placeholder so we still return a redirect URL to the frontend.
          row = await GlocalCheckin.upsert({
            survey_id: surveyId,
            identifier_type: 'email',
            identifier_value: normalizedEmail,
            status: 'not_started'
          });
        }
      }

      res.status(200).json({
        success: true,
        message: 'Check-in verified',
        data: buildVerifyResult(row),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in verifyCheckin:', error);
      next(error);
    }
  }

  // ===========================================
  // ADMIN CRUD
  // ===========================================

  // GET /api/v1/glocal/survey-checkins
  static async listCheckins(req, res, next) {
    try {
      const { surveyId, status, limit, offset } = req.query;

      const filters = {};
      if (surveyId) filters.survey_id = surveyId;
      if (status) filters.status = status;
      if (limit) filters.limit = parseInt(limit);
      if (offset) filters.offset = parseInt(offset);

      const [rows, total] = await Promise.all([
        GlocalCheckin.findAll(filters),
        GlocalCheckin.count(filters)
      ]);

      res.status(200).json({
        success: true,
        message: 'Check-ins retrieved successfully',
        data: rows.map(row => row.toJSON()),
        count: rows.length,
        total,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in listCheckins:', error);
      next(error);
    }
  }

  // GET /api/v1/glocal/survey-checkins/:id
  static async getCheckinById(req, res, next) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid check-in ID provided',
          timestamp: new Date().toISOString()
        });
      }

      const row = await GlocalCheckin.findById(id);

      if (!row) {
        return res.status(404).json({
          success: false,
          message: 'Check-in not found',
          timestamp: new Date().toISOString()
        });
      }

      res.status(200).json({
        success: true,
        message: 'Check-in retrieved successfully',
        data: row.toJSON(),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in getCheckinById:', error);
      next(error);
    }
  }

  // POST /api/v1/glocal/survey-checkins
  static async createCheckin(req, res, next) {
    try {
      const { surveyId, identifierValue, status } = req.body;

      if (!surveyId || !identifierValue) {
        return res.status(400).json({
          success: false,
          message: 'surveyId and identifierValue are required',
          timestamp: new Date().toISOString()
        });
      }

      if (!EMAIL_REGEX.test(identifierValue)) {
        return res.status(400).json({
          success: false,
          message: 'identifierValue must be a valid email',
          timestamp: new Date().toISOString()
        });
      }

      const insertId = await GlocalCheckin.create({
        survey_id: surveyId,
        identifier_type: 'email',
        identifier_value: normalizeEmail(identifierValue),
        status: status || 'not_started'
      });

      const row = await GlocalCheckin.findById(insertId);

      res.status(201).json({
        success: true,
        message: 'Check-in created successfully',
        data: row.toJSON(),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in createCheckin:', error);
      next(error);
    }
  }

  // PATCH /api/v1/glocal/survey-checkins/:id
  static async updateCheckin(req, res, next) {
    try {
      const { id } = req.params;
      const { status, surveymonkeyResponseId } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid check-in ID provided',
          timestamp: new Date().toISOString()
        });
      }

      if (status === undefined && surveymonkeyResponseId === undefined) {
        return res.status(400).json({
          success: false,
          message: 'At least one field (status or surveymonkeyResponseId) is required',
          timestamp: new Date().toISOString()
        });
      }

      const updates = {};
      if (status !== undefined) updates.status = status;
      if (surveymonkeyResponseId !== undefined) updates.surveymonkey_response_id = surveymonkeyResponseId;
      if (status === 'completed') updates.completed_at = new Date();

      const updated = await GlocalCheckin.updateById(id, updates);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Check-in not found',
          timestamp: new Date().toISOString()
        });
      }

      const row = await GlocalCheckin.findById(id);

      res.status(200).json({
        success: true,
        message: 'Check-in updated successfully',
        data: row.toJSON(),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in updateCheckin:', error);
      next(error);
    }
  }

  // DELETE /api/v1/glocal/survey-checkins/:id
  static async deleteCheckin(req, res, next) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid check-in ID provided',
          timestamp: new Date().toISOString()
        });
      }

      const deleted = await GlocalCheckin.deleteById(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Check-in not found',
          timestamp: new Date().toISOString()
        });
      }

      res.status(200).json({
        success: true,
        message: 'Check-in deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in deleteCheckin:', error);
      next(error);
    }
  }

  // ===========================================
  // WEBHOOK (SurveyMonkey -> this server)
  // ===========================================

  // POST /api/v1/glocal/webhooks/surveymonkey
  static async receiveWebhook(req, res) {
    try {
      const payload = req.body;

      if (!payload || payload.event_type !== 'response_completed' || !payload.resources) {
        return res.sendStatus(400);
      }

      const { survey_id: surveyId, response_id: responseId } = payload.resources;

      if (!surveyId || !responseId) {
        return res.sendStatus(400);
      }

      const response = await surveyMonkeyClient.getResponse(surveyId, responseId);

      if (!response.email) {
        console.warn('SurveyMonkey webhook: response has no email custom variable, skipping');
        return res.sendStatus(200);
      }

      await GlocalCheckin.upsert({
        survey_id: surveyId,
        identifier_type: 'email',
        identifier_value: response.email,
        status: 'completed',
        surveymonkey_response_id: responseId,
        completed_at: new Date(),
        last_synced_at: new Date()
      });

      res.sendStatus(200);
    } catch (error) {
      // Ack with 200 even on internal failure so SurveyMonkey doesn't
      // retry-storm this endpoint; the failure is still logged for follow-up.
      console.error('Error in receiveWebhook:', error.message);
      res.sendStatus(200);
    }
  }
}

module.exports = GlocalController;
