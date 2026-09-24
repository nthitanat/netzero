function serializeQuestion(question) {
  return {
    question_id: question.questionId,
    survey_id: question.surveyId,
    question_text: question.questionText,
    question_type: question.questionType,
    order_in_survey: question.orderInSurvey,
    created_at: question.createdAt,
    updated_at: question.updatedAt
  };
}

function serializeSurvey(survey) {
  return {
    survey_id: survey.surveyId,
    name: survey.name,
    description: survey.description,
    start_date: survey.startDate,
    end_date: survey.endDate,
    created_at: survey.createdAt,
    updated_at: survey.updatedAt,
    ...(survey.questions && { questions: survey.questions.map(serializeQuestion) })
  };
}

function serializeAnswer(answer) {
  return {
    answer_id: answer.answerId,
    response_id: answer.responseId,
    question_id: answer.questionId,
    answer_text: answer.answerText,
    answer_choice_id: answer.answerChoiceId,
    created_at: answer.createdAt,
    updated_at: answer.updatedAt,
    question: answer.question ? {
      question_text: answer.question.questionText,
      question_type: answer.question.questionType
    } : null
  };
}

function serializeResponse(response) {
  return {
    response_id: response.responseId,
    user_id: response.userId,
    survey_id: response.surveyId,
    respondent_id: response.respondentId,
    submitted_at: response.submittedAt,
    created_at: response.createdAt,
    updated_at: response.updatedAt,
    respondent: response.respondent,
    survey_name: response.surveyName,
    ...(response.answers && { answers: response.answers.map(serializeAnswer) })
  };
}

function serializeAnalytics(analytics) {
  const { surveyStats, questionAnalytics } = analytics;
  return {
    survey_stats: {
      total_responses: surveyStats.totalResponses,
      unique_users: surveyStats.uniqueUsers,
      unique_respondents: surveyStats.uniqueRespondents,
      first_response: surveyStats.firstResponse,
      last_response: surveyStats.lastResponse
    },
    question_analytics: questionAnalytics.map(item => ({
      question: serializeQuestion(item.question),
      stats: {
        total_answers: item.stats.totalAnswers,
        unique_responses: item.stats.uniqueResponses,
        text_answers: item.stats.textAnswers,
        choice_answers: item.stats.choiceAnswers
      },
      ...(item.choiceDistribution && {
        choiceDistribution: item.choiceDistribution.map(choice => ({
          answer_choice_id: choice.answerChoiceId,
          count: choice.count,
          percentage: choice.percentage
        }))
      }),
      ...(item.textAnswers && {
        textAnswers: item.textAnswers.map(answer => ({
          answer_text: answer.answerText,
          submitted_at: answer.submittedAt
        }))
      })
    }))
  };
}

module.exports = {
  serializeQuestion,
  serializeSurvey,
  serializeResponse,
  serializeAnalytics
};
