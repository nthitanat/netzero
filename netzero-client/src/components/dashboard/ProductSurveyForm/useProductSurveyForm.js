import { useState, useEffect } from "react";

const useProductSurveyForm = (productId = null, onComplete = null) => {
  const [stateProductSurveyForm, setState] = useState({
    // Questions data
    questions: [],
    groupedQuestions: [],
    questionCount: 0,
    
    // Form data
    answers: {},
    currentCriterionIndex: 0,
    
    // UI states
    isLoadingQuestions: true,
    isSubmitting: false,
    error: null,
    validationErrors: {},
    
    // Progress tracking
    answeredCount: 0,
    totalRequired: 28
  });

  const setProductSurveyForm = (field, value) => {
    if (typeof field === "object") {
      setState((prevState) => ({ ...prevState, ...field }));
    } else {
      setState((prevState) => ({ ...prevState, [field]: value }));
    }
  };

  // Calculate answered count whenever answers change
  useEffect(() => {
    const answeredCount = Object.keys(stateProductSurveyForm.answers).length;
    setProductSurveyForm("answeredCount", answeredCount);
  }, [stateProductSurveyForm.answers]);

  const setAnswer = (questionId, answer, score) => {
    setState((prevState) => ({
      ...prevState,
      answers: {
        ...prevState.answers,
        [questionId]: {
          questionId,
          answer,
          score
        }
      }
    }));
  };

  const removeAnswer = (questionId) => {
    setState((prevState) => {
      const newAnswers = { ...prevState.answers };
      delete newAnswers[questionId];
      return {
        ...prevState,
        answers: newAnswers
      };
    });
  };

  const clearAllAnswers = () => {
    setProductSurveyForm("answers", {});
  };

  const setCurrentCriterionIndex = (index) => {
    setProductSurveyForm("currentCriterionIndex", index);
  };

  const nextCriterion = () => {
    setState((prevState) => {
      const maxIndex = prevState.groupedQuestions.length - 1;
      const nextIndex = Math.min(prevState.currentCriterionIndex + 1, maxIndex);
      return {
        ...prevState,
        currentCriterionIndex: nextIndex
      };
    });
  };

  const previousCriterion = () => {
    setState((prevState) => {
      const prevIndex = Math.max(prevState.currentCriterionIndex - 1, 0);
      return {
        ...prevState,
        currentCriterionIndex: prevIndex
      };
    });
  };

  const setError = (error) => {
    setProductSurveyForm("error", error);
  };

  const clearError = () => {
    setProductSurveyForm("error", null);
  };

  const setValidationError = (questionId, error) => {
    setState((prevState) => ({
      ...prevState,
      validationErrors: {
        ...prevState.validationErrors,
        [questionId]: error
      }
    }));
  };

  const clearValidationError = (questionId) => {
    setState((prevState) => {
      const newErrors = { ...prevState.validationErrors };
      delete newErrors[questionId];
      return {
        ...prevState,
        validationErrors: newErrors
      };
    });
  };

  const clearAllValidationErrors = () => {
    setProductSurveyForm("validationErrors", {});
  };

  return {
    stateProductSurveyForm,
    setProductSurveyForm,
    setAnswer,
    removeAnswer,
    clearAllAnswers,
    setCurrentCriterionIndex,
    nextCriterion,
    previousCriterion,
    setError,
    clearError,
    setValidationError,
    clearValidationError,
    clearAllValidationErrors
  };
};

export default useProductSurveyForm;
