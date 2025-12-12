import { productSurveyService } from "../../../api";
import { API_STATUS } from "../../../api/types";

const ProductSurveyFormHandler = (
  stateProductSurveyForm,
  hookFunctions,
  productId,
  onComplete,
  user
) => {
  const {
    setProductSurveyForm,
    setAnswer,
    clearAllAnswers,
    nextCriterion,
    previousCriterion,
    setError,
    clearError,
    setValidationError,
    clearValidationError,
    clearAllValidationErrors
  } = hookFunctions;

  // Validate all answers function
  const validateAllAnswers = () => {
    // Skip validation for admin users
    if (user?.role === 'admin') {
      return true;
    }
    
    clearAllValidationErrors();
    
    const { questions, answers } = stateProductSurveyForm;
    let isValid = true;
    const errors = {};

    // Check if all questions are answered
    if (Object.keys(answers).length !== questions.length) {
      setError(`กรุณาตอบคำถามให้ครบทั้ง ${questions.length} ข้อ (ตอบแล้ว ${Object.keys(answers).length} ข้อ)`);
      isValid = false;
    }

    // Validate each answer
    questions.forEach(q => {
      const answer = answers[q.questionId];
      if (!answer) {
        errors[q.questionId] = 'กรุณาตอบคำถาม';
        isValid = false;
      } else {
        if (!answer.answer || answer.answer.trim().length < 10) {
          errors[q.questionId] = 'คำตอบต้องมีอย่างน้อย 10 ตัวอักษร';
          isValid = false;
        }
        if (answer.score < 1 || answer.score > 10) {
          errors[q.questionId] = 'คะแนนต้องอยู่ระหว่าง 1-10';
          isValid = false;
        }
      }
    });

    if (!isValid) {
      setProductSurveyForm("validationErrors", errors);
    }

    return isValid;
  };

  return {
    // Load survey questions
    loadQuestions: async () => {
      try {
        setProductSurveyForm({
          isLoadingQuestions: true,
          error: null
        });

        const response = await productSurveyService.getQuestions();
        
        console.log('📋 Survey Response:', response);
        
        if (response.status === API_STATUS.SUCCESS && response.data) {
          const { questions, questionCount } = response.data;
          
          console.log('✅ Questions loaded:', { questionCount, questionsLength: questions?.length });
          
          // Group questions by criterion
          const grouped = productSurveyService.groupQuestionsByCriterion(questions);

          setProductSurveyForm({
            questions,
            groupedQuestions: grouped,
            questionCount,
            isLoadingQuestions: false,
            totalRequired: questionCount
          });
        } else {
          const errorMsg = response.message || 'Failed to load questions';
          console.error('❌ Invalid response:', { success: response.success, hasData: !!response.data, response });
          throw new Error(errorMsg);
        }
      } catch (error) {
        console.error('❌ Error loading questions:', error.message || error);
        setProductSurveyForm({
          isLoadingQuestions: false,
          error: error.message || 'ไม่สามารถโหลดคำถามได้ กรุณาลองใหม่อีกครั้ง'
        });
      }
    },

    // Handle answer change
    handleAnswerChange: (questionId, answer, score) => {
      // Clear validation error for this question
      clearValidationError(questionId);
      
      // Validate score range
      if (score < 1 || score > 10) {
        setValidationError(questionId, 'คะแนนต้องอยู่ระหว่าง 1-10');
        score = Math.max(1, Math.min(10, score)); // Clamp to valid range
      }

      // Save answer immediately (validate on submit instead)
      setAnswer(questionId, answer, parseInt(score));
    },

    // Handle criterion navigation
    handleNextCriterion: () => {
      clearError();
      nextCriterion();
      
      // Scroll to top of form
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    handlePreviousCriterion: () => {
      clearError();
      previousCriterion();
      
      // Scroll to top of form
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    handleGoToCriterion: (index) => {
      clearError();
      setProductSurveyForm("currentCriterionIndex", index);
      
      // Scroll to top of form
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    // Submit survey
    handleSubmit: async (e) => {
      if (e) e.preventDefault();
      
      try {
        clearError();
        clearAllValidationErrors();

        // Validate productId
        if (!productId) {
          setError('ไม่พบ Product ID กรุณาลองใหม่อีกครั้ง');
          return;
        }

        // Validate all answers (skip for admin)
        if (user?.role !== 'admin') {
          const isValid = validateAllAnswers();
          if (!isValid) {
            return;
          }
        } else {
          // Admin must still answer at least 1 question
          const answersArray = Object.values(stateProductSurveyForm.answers);
          if (answersArray.length === 0) {
            setError('กรุณาตอบอย่างน้อย 1 คำถามเพื่อทดสอบการประเมิน');
            return;
          }
        }

        setProductSurveyForm("isSubmitting", true);

        // Convert answers object to array
        const answersArray = Object.values(stateProductSurveyForm.answers);

        console.log('📝 Submitting survey...', {
          productId,
          answersCount: answersArray.length
        });

        // Submit to API
        const response = await productSurveyService.submitSurvey(productId, answersArray);

        console.log('📦 API Response:', {
          status: response.status,
          hasData: !!response.data,
          data: response.data
        });

        if (response.status === 'success') {
          console.log('✅ Survey submitted successfully', response.data);
          
          // Call onComplete callback with results
          if (onComplete) {
            console.log('🔄 Calling onComplete callback with data:', response.data);
            onComplete(response.data);
          } else {
            console.warn('⚠️ No onComplete callback provided');
          }
        } else {
          throw new Error(response.message || 'Failed to submit survey');
        }
      } catch (error) {
        console.error('❌ Error submitting survey:', error);
        
        let errorMessage = 'ไม่สามารถส่งแบบสำรวจได้ กรุณาลองใหม่อีกครั้ง';
        
        if (error.message.includes('timeout')) {
          errorMessage = 'การประเมินใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง';
        } else if (error.message.includes('AI service')) {
          errorMessage = 'บริการ AI ไม่พร้อมใช้งาน กรุณาลองใหม่ภายหลัง';
        } else if (error.message.includes('Product not found')) {
          errorMessage = 'ไม่พบข้อมูลสินค้า กรุณาลองใหม่อีกครั้ง';
        } else if (error.message) {
          errorMessage = error.message;
        }

        setProductSurveyForm({
          isSubmitting: false,
          error: errorMessage
        });
      }
    },

    // Clear form
    handleClearForm: () => {
      if (window.confirm('คุณต้องการล้างคำตอบทั้งหมดหรือไม่?')) {
        clearAllAnswers();
        clearAllValidationErrors();
        clearError();
        setProductSurveyForm("currentCriterionIndex", 0);
      }
    },

    // Handle cancel
    handleCancel: (onCancel) => {
      if (Object.keys(stateProductSurveyForm.answers).length > 0) {
        if (window.confirm('คุณต้องการยกเลิกหรือไม่? คำตอบที่กรอกจะสูญหาย')) {
          if (onCancel) {
            onCancel();
          }
        }
      } else {
        if (onCancel) {
          onCancel();
        }
      }
    }
  };
};

export default ProductSurveyFormHandler;
