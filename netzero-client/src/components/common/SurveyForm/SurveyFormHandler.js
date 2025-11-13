const SurveyFormHandler = (stateSurveyForm, setSurveyForm, { survey, onSubmit }) => {
  return {
    handleAnswerChange: (questionId, value) => {
      setSurveyForm({
        answers: {
          ...stateSurveyForm.answers,
          [questionId]: value,
        },
        errors: {
          ...stateSurveyForm.errors,
          [questionId]: null,
        },
      });

      // Calculate progress
      const totalQuestions = survey?.questions?.length || 0;
      const answeredQuestions = Object.keys({
        ...stateSurveyForm.answers,
        [questionId]: value,
      }).filter(key => {
        const answer = key === String(questionId) ? value : stateSurveyForm.answers[key];
        return answer && answer.toString().trim() !== "";
      }).length;

      const progress = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
      setSurveyForm("progress", progress);
    },

    handleSubmit: async (e) => {
      e.preventDefault();

      // Validate answers
      const errors = {};
      let hasErrors = false;

      survey?.questions?.forEach((question) => {
        const answer = stateSurveyForm.answers[question.question_id];
        if (!answer || answer.toString().trim() === "") {
          errors[question.question_id] = "กรุณาตอบคำถามนี้";
          hasErrors = true;
        }
      });

      if (hasErrors) {
        setSurveyForm({
          errors,
          submitError: "กรุณาตอบคำถามทุกข้อก่อนส่งแบบสำรวจ",
        });
        return;
      }

      // Format answers for API
      const formattedAnswers = Object.entries(stateSurveyForm.answers).map(
        ([questionId, answerText]) => ({
          question_id: parseInt(questionId),
          answer_text: answerText,
        })
      );

      // Call the onSubmit callback
      if (onSubmit) {
        setSurveyForm({ submitting: true, submitError: null });
        try {
          await onSubmit(formattedAnswers);
        } catch (error) {
          setSurveyForm({
            submitError: error.message || "เกิดข้อผิดพลาดในการส่งแบบสำรวจ",
            submitting: false,
          });
        }
      }
    },
  };
};

export default SurveyFormHandler;
