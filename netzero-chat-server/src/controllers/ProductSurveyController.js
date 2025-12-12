const AiProductSurveyService = require('../services/AiProductSurveyService');
const { ProductSurveyQuestion } = require('../models/ProductSurvey');
const { validationResult } = require('express-validator');

/**
 * Product Survey Controller
 * Handles HTTP requests for product survey evaluation
 */
class ProductSurveyController {
  /**
   * POST /api/v1/products/:productId/surveys
   * Submit product survey for AI evaluation
   */
  static async submitSurvey(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array()
        });
      }

      const { productId } = req.params;
      const { answers } = req.body;

      console.log(`📝 Product Survey Submission - Product: ${productId}`);
      console.log(`   Answers: ${answers.length} responses`);

      // Call service to evaluate survey
      const result = await AiProductSurveyService.evaluateProductSurvey({
        productId,
        answers
      });

      // Return success response
      res.status(201).json({
        success: true,
        message: 'Survey evaluated successfully',
        data: {
          surveyResponseId: result.surveyResponseId,
          productId: result.productId,
          status: result.status,
          alignmentLevel: result.alignmentLevel,
          overallScore: result.overallScore,
          aiComment: result.aiComment,
          criteriaBreakdown: result.criteriaBreakdown,
          aiRawResult: result.aiRawResult
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error submitting survey:', error);

      // Handle specific error types
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }

      if (error.message.includes('Duplicate') || 
          error.message.includes('Inactive') || 
          error.message.includes('Validation')) {
        return res.status(400).json({
          success: false,
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }

      if (error.message.includes('AI') || 
          error.message.includes('OpenAI') ||
          error.message.includes('timeout')) {
        return res.status(502).json({
          success: false,
          message: 'AI service temporarily unavailable',
          details: error.message,
          timestamp: new Date().toISOString()
        });
      }

      // Generic error
      res.status(500).json({
        success: false,
        message: 'Failed to evaluate survey',
        details: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * GET /api/v1/products/:productId/surveys
   * Get survey history for a product
   */
  static async getSurveyHistory(req, res) {
    try {
      const { productId } = req.params;

      console.log(`📊 Get Survey History - Product: ${productId}`);

      const history = await AiProductSurveyService.getProductSurveyHistory(productId);

      res.status(200).json({
        success: true,
        message: 'Survey history retrieved successfully',
        data: {
          productId,
          surveyCount: history.length,
          surveys: history
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error getting survey history:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve survey history',
        details: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * GET /api/v1/products/surveys/:surveyResponseId
   * Get a specific survey response with answers
   */
  static async getSurveyResponse(req, res) {
    try {
      const { surveyResponseId } = req.params;

      console.log(`📄 Get Survey Response: ${surveyResponseId}`);

      const surveyResponse = await AiProductSurveyService.getSurveyResponse(surveyResponseId);

      res.status(200).json({
        success: true,
        message: 'Survey response retrieved successfully',
        data: surveyResponse,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error getting survey response:', error);

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve survey response',
        details: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * GET /api/v1/products/surveys/questions
   * Get all active survey questions
   */
  static async getQuestions(req, res) {
    try {
      console.log('📋 Get Survey Questions');

      const questions = await ProductSurveyQuestion.findAllActive();

      res.status(200).json({
        success: true,
        message: 'Survey questions retrieved successfully',
        data: {
          questionCount: questions.length,
          questions: questions.map(q => ({
            id: q.id,
            questionId: q.question_id,
            questionText: q.question_text,
            scoringCriteria: q.scoring_criteria,
            weight: q.weight,
            criterionCode: q.criterion_code,
            criterionNameTh: q.criterion_name_th,
            standardReference: q.standard_reference,
            displayOrder: q.display_order
          }))
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error getting survey questions:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve survey questions',
        details: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * GET /api/v1/products/surveys/health
   * Health check for product survey service
   */
  static async healthCheck(req, res) {
    try {
      // Check if we can connect to database and OpenAI
      const questions = await ProductSurveyQuestion.findAllActive();

      res.status(200).json({
        success: true,
        message: 'Product Survey service is healthy',
        data: {
          service: 'product-survey',
          database: 'connected',
          questionsAvailable: questions.length,
          aiService: 'configured'
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Health check failed:', error);

      res.status(503).json({
        success: false,
        message: 'Product Survey service is unhealthy',
        details: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = ProductSurveyController;
