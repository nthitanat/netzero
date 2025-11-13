const Survey = require('../models/survey/Survey');
const Question = require('../models/survey/Question');
const Response = require('../models/survey/Response');
const Answer = require('../models/survey/Answer');

class SurveyController {
  // ===========================================
  // SURVEY MANAGEMENT (Admin/Creator)
  // ===========================================

  // GET /api/v1/surveys - Get all surveys
  static async getAllSurveys(req, res) {
    try {
      const { active, upcoming, past, limit, offset } = req.query;
      
      const filters = {};
      if (active === 'true') filters.active = true;
      if (upcoming === 'true') filters.upcoming = true;
      if (past === 'true') filters.past = true;
      if (limit) filters.limit = parseInt(limit);
      if (offset) filters.offset = parseInt(offset);

      const surveys = await Survey.findAll(filters);
      
      res.status(200).json({
        success: true,
        message: 'Surveys retrieved successfully',
        data: surveys.map(survey => survey.toJSON()),
        count: surveys.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in getAllSurveys:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch surveys',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // GET /api/v1/surveys/:id - Get survey by ID with questions
  static async getSurveyById(req, res) {
    try {
      const surveyId = req.params.id;
      
      if (!surveyId || isNaN(surveyId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid survey ID provided',
          timestamp: new Date().toISOString()
        });
      }

      const survey = await Survey.findById(surveyId);
      
      if (!survey) {
        return res.status(404).json({
          success: false,
          message: 'Survey not found',
          timestamp: new Date().toISOString()
        });
      }

      // Get questions for this survey
      const questions = await Question.findBySurveyId(surveyId);
      
      const surveyData = survey.toJSON();
      surveyData.questions = questions.map(q => q.toJSON());
      
      res.status(200).json({
        success: true,
        message: 'Survey retrieved successfully',
        data: surveyData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in getSurveyById:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch survey',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // POST /api/v1/surveys - Create new survey
  static async createSurvey(req, res) {
    try {
      const {
        name,
        description,
        start_date,
        end_date,
        questions = []
      } = req.body;

      // Validate required fields
      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Survey name is required',
          timestamp: new Date().toISOString()
        });
      }

      // Validate dates
      if (start_date && end_date) {
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        
        if (endDate <= startDate) {
          return res.status(400).json({
            success: false,
            message: 'End date must be after start date',
            timestamp: new Date().toISOString()
          });
        }
      }

      // Create survey
      const surveyData = {
        name: name.trim(),
        description: description ? description.trim() : null,
        start_date: start_date || null,
        end_date: end_date || null
      };

      const surveyId = await Survey.create(surveyData);

      // Create questions if provided
      if (questions.length > 0) {
        for (let i = 0; i < questions.length; i++) {
          const question = questions[i];
          await Question.create({
            survey_id: surveyId,
            question_text: question.question_text,
            question_type: question.question_type || 'text',
            order_in_survey: question.order_in_survey || (i + 1)
          });
        }
      }

      // Get the created survey with questions
      const createdSurvey = await Survey.findById(surveyId);
      const createdQuestions = await Question.findBySurveyId(surveyId);
      
      const responseData = createdSurvey.toJSON();
      responseData.questions = createdQuestions.map(q => q.toJSON());

      res.status(201).json({
        success: true,
        message: 'Survey created successfully',
        data: responseData,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in createSurvey:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create survey',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // PUT /api/v1/surveys/:id - Update survey
  static async updateSurvey(req, res) {
    try {
      const surveyId = req.params.id;
      const { name, description, start_date, end_date } = req.body;
      
      if (!surveyId || isNaN(surveyId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid survey ID provided',
          timestamp: new Date().toISOString()
        });
      }

      const survey = await Survey.findById(surveyId);
      if (!survey) {
        return res.status(404).json({
          success: false,
          message: 'Survey not found',
          timestamp: new Date().toISOString()
        });
      }

      const updated = await Survey.updateById(surveyId, {
        name,
        description,
        start_date,
        end_date
      });

      if (!updated) {
        return res.status(400).json({
          success: false,
          message: 'Failed to update survey',
          timestamp: new Date().toISOString()
        });
      }

      const updatedSurvey = await Survey.findById(surveyId);

      res.status(200).json({
        success: true,
        message: 'Survey updated successfully',
        data: updatedSurvey.toJSON(),
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in updateSurvey:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update survey',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // DELETE /api/v1/surveys/:id - Delete survey
  static async deleteSurvey(req, res) {
    try {
      const surveyId = req.params.id;
      
      if (!surveyId || isNaN(surveyId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid survey ID provided',
          timestamp: new Date().toISOString()
        });
      }

      const survey = await Survey.findById(surveyId);
      if (!survey) {
        return res.status(404).json({
          success: false,
          message: 'Survey not found',
          timestamp: new Date().toISOString()
        });
      }

      const deleted = await Survey.deleteById(surveyId);

      if (!deleted) {
        return res.status(400).json({
          success: false,
          message: 'Failed to delete survey',
          timestamp: new Date().toISOString()
        });
      }

      res.status(200).json({
        success: true,
        message: 'Survey deleted successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in deleteSurvey:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete survey',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // ===========================================
  // QUESTION MANAGEMENT
  // ===========================================

  // POST /api/v1/surveys/:id/questions - Add question to survey
  static async addQuestion(req, res) {
    try {
      const surveyId = req.params.id;
      const { question_text, question_type, order_in_survey } = req.body;
      
      if (!surveyId || isNaN(surveyId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid survey ID provided',
          timestamp: new Date().toISOString()
        });
      }

      if (!question_text || !question_text.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Question text is required',
          timestamp: new Date().toISOString()
        });
      }

      // Check if survey exists
      const survey = await Survey.findById(surveyId);
      if (!survey) {
        return res.status(404).json({
          success: false,
          message: 'Survey not found',
          timestamp: new Date().toISOString()
        });
      }

      const questionId = await Question.create({
        survey_id: surveyId,
        question_text: question_text.trim(),
        question_type: question_type || 'text',
        order_in_survey: order_in_survey || null
      });

      const createdQuestion = await Question.findById(questionId);

      res.status(201).json({
        success: true,
        message: 'Question added successfully',
        data: createdQuestion.toJSON(),
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in addQuestion:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add question',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // ===========================================
  // SURVEY SUBMISSION (Public)
  // ===========================================

  // POST /api/v1/surveys/:id/submit - Submit survey response
  static async submitSurvey(req, res) {
    try {
      const surveyId = req.params.id;
      const { answers, respondent_id } = req.body;
      const user_id = req.user ? req.user.id : null; // Optional authentication
      
      if (!surveyId || isNaN(surveyId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid survey ID provided',
          timestamp: new Date().toISOString()
        });
      }

      if (!answers || !Array.isArray(answers) || answers.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Answers array is required and cannot be empty',
          timestamp: new Date().toISOString()
        });
      }

      // Check if survey exists and is active
      const survey = await Survey.findById(surveyId);
      if (!survey) {
        return res.status(404).json({
          success: false,
          message: 'Survey not found',
          timestamp: new Date().toISOString()
        });
      }

      const isActive = await Survey.isActive(surveyId);
      if (!isActive) {
        return res.status(400).json({
          success: false,
          message: 'Survey is not currently active',
          timestamp: new Date().toISOString()
        });
      }

      // Check if user/respondent has already submitted
      const hasResponded = await Response.hasUserResponded(surveyId, user_id, respondent_id);
      if (hasResponded) {
        return res.status(409).json({
          success: false,
          message: 'You have already submitted a response to this survey',
          timestamp: new Date().toISOString()
        });
      }

      // Create response record
      const responseId = await Response.create({
        user_id,
        survey_id: surveyId,
        respondent_id: respondent_id || null,
        submitted_at: new Date()
      });

      // Create answer records
      const answerPromises = answers.map(answer => {
        return Answer.create({
          response_id: responseId,
          question_id: answer.question_id,
          answer_text: answer.answer_text || null,
          answer_choice_id: answer.answer_choice_id || null
        });
      });

      await Promise.all(answerPromises);

      // Get the created response with answers
      const createdResponse = await Response.findById(responseId);
      const createdAnswers = await Answer.findByResponseId(responseId);

      const responseData = createdResponse.toJSON();
      responseData.answers = createdAnswers.map(a => a.toJSON());

      res.status(201).json({
        success: true,
        message: 'Survey submitted successfully',
        data: responseData,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in submitSurvey:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit survey',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // ===========================================
  // SURVEY ANALYTICS (Admin)
  // ===========================================

  // GET /api/v1/surveys/:id/responses - Get all responses for a survey
  static async getSurveyResponses(req, res) {
    try {
      const surveyId = req.params.id;
      const { limit, offset, startDate, endDate } = req.query;
      
      if (!surveyId || isNaN(surveyId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid survey ID provided',
          timestamp: new Date().toISOString()
        });
      }

      const filters = {};
      if (limit) filters.limit = parseInt(limit);
      if (offset) filters.offset = parseInt(offset);
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      const responses = await Response.findBySurveyId(surveyId, filters);
      
      res.status(200).json({
        success: true,
        message: 'Survey responses retrieved successfully',
        data: responses.map(response => response.toJSON()),
        count: responses.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in getSurveyResponses:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch survey responses',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // GET /api/v1/surveys/:id/analytics - Get survey analytics
  static async getSurveyAnalytics(req, res) {
    try {
      const surveyId = req.params.id;
      
      if (!surveyId || isNaN(surveyId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid survey ID provided',
          timestamp: new Date().toISOString()
        });
      }

      // Get basic survey stats
      const stats = await Response.getStatsBySurveyId(surveyId);
      
      // Get questions for detailed analysis
      const questions = await Question.findBySurveyId(surveyId);
      
      const questionAnalytics = [];
      for (const question of questions) {
        const questionStats = await Answer.getStatsByQuestionId(question.question_id);
        
        let additionalData = {};
        if (question.question_type === 'multiple_choice') {
          additionalData.choiceDistribution = await Answer.getChoiceDistribution(question.question_id);
        } else {
          additionalData.textAnswers = await Answer.getTextAnswers(question.question_id, 50);
        }
        
        questionAnalytics.push({
          question: question.toJSON(),
          stats: questionStats,
          ...additionalData
        });
      }

      res.status(200).json({
        success: true,
        message: 'Survey analytics retrieved successfully',
        data: {
          survey_stats: stats,
          question_analytics: questionAnalytics
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in getSurveyAnalytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch survey analytics',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = SurveyController;