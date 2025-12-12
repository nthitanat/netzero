import React, { useEffect } from "react";
import styles from "./ProductSurveyForm.module.scss";
import useProductSurveyForm from "./useProductSurveyForm";
import ProductSurveyFormHandler from "./ProductSurveyFormHandler";
import { GoogleIcon } from "../../common";
import { useAuth } from "../../../contexts/AuthContext";

export default function ProductSurveyForm({
  productId,
  onComplete,
  onCancel,
  className = ""
}) {
  const { user } = useAuth();
  const hookFunctions = useProductSurveyForm(productId, onComplete);
  const {
    stateProductSurveyForm,
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

  const handlers = ProductSurveyFormHandler(
    stateProductSurveyForm,
    {
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
    },
    productId,
    onComplete,
    user
  );

  // Load questions on mount
  useEffect(() => {
    handlers.loadQuestions();
  }, []);

  if (stateProductSurveyForm.isLoadingQuestions) {
    return (
      <div className={`${styles.Container} ${className}`}>
        <div className={styles.LoadingContainer}>
          <div className={styles.LoadingSpinner} />
          <p>กำลังโหลดแบบสำรวจ...</p>
        </div>
      </div>
    );
  }

  if (stateProductSurveyForm.error && stateProductSurveyForm.groupedQuestions.length === 0) {
    return (
      <div className={`${styles.Container} ${className}`}>
        <div className={styles.ErrorContainer}>
          <GoogleIcon iconType="error" size="large" />
          <h3>เกิดข้อผิดพลาด</h3>
          <p>{stateProductSurveyForm.error}</p>
          <button 
            className={styles.RetryButton}
            onClick={handlers.loadQuestions}
          >
            <GoogleIcon iconType="refresh" size="small" />
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  const currentCriterion = stateProductSurveyForm.groupedQuestions[stateProductSurveyForm.currentCriterionIndex];
  const isFirstCriterion = stateProductSurveyForm.currentCriterionIndex === 0;
  const isLastCriterion = stateProductSurveyForm.currentCriterionIndex === stateProductSurveyForm.groupedQuestions.length - 1;

  return (
    <div className={`${styles.Container} ${className}`}>
      {/* Header */}
      <div className={styles.Header}>
        <div className={styles.HeaderContent}>
          <h2 className={styles.Title}>
            <GoogleIcon iconType="assessment" size="medium" />
            แบบสำรวจ Net-Zero สำหรับ SME
          </h2>
          <p className={styles.Subtitle}>
            ประเมินความพร้อมด้าน Net-Zero ตามมาตรฐาน ISO IWA 42:2022 และ SBTi
          </p>
          {(user?.role === 'admin' || user?.role === 'community_head') && onCancel && (
            <button
              type="button"
              className={styles.SkipButton}
              onClick={() => handlers.handleCancel(onCancel)}
              disabled={stateProductSurveyForm.isSubmitting}
            >
              <GoogleIcon iconType="skip_next" size="small" />
              ข้ามแบบสำรวจ
            </button>
          )}
        </div>
        {onCancel && (
          <button 
            className={styles.CloseButton}
            onClick={() => handlers.handleCancel(onCancel)}
            disabled={stateProductSurveyForm.isSubmitting}
          >
            <GoogleIcon iconType="close" size="small" />
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className={styles.ProgressSection}>
        <div className={styles.ProgressInfo}>
          <span className={styles.ProgressText}>
            ตอบแล้ว {stateProductSurveyForm.answeredCount} / {stateProductSurveyForm.totalRequired} ข้อ
          </span>
          <span className={styles.ProgressPercent}>
            {Math.round((stateProductSurveyForm.answeredCount / stateProductSurveyForm.totalRequired) * 100)}%
          </span>
        </div>
        <div className={styles.ProgressBar}>
          <div 
            className={styles.ProgressFill}
            style={{ 
              width: `${(stateProductSurveyForm.answeredCount / stateProductSurveyForm.totalRequired) * 100}%` 
            }}
          />
        </div>
      </div>

      {/* Criteria Navigation */}
      <div className={styles.CriteriaNav}>
        {stateProductSurveyForm.groupedQuestions.map((group, index) => {
          const answeredInGroup = group.questions.filter(
            q => stateProductSurveyForm.answers[q.questionId]
          ).length;
          const totalInGroup = group.questions.length;
          const isComplete = answeredInGroup === totalInGroup;
          const isCurrent = index === stateProductSurveyForm.currentCriterionIndex;

          return (
            <button
              key={group.criterionCode}
              className={`${styles.CriteriaButton} ${isCurrent ? styles.active : ''} ${isComplete ? styles.complete : ''}`}
              onClick={() => handlers.handleGoToCriterion(index)}
              disabled={stateProductSurveyForm.isSubmitting}
            >
              <span className={styles.CriteriaCode}>{group.criterionCode}</span>
              <span className={styles.CriteriaProgress}>
                {answeredInGroup}/{totalInGroup}
              </span>
              {isComplete && (
                <GoogleIcon iconType="check_circle" size="small" />
              )}
            </button>
          );
        })}
      </div>

      {/* Current Criterion Section */}
      {currentCriterion && (
        <div className={styles.CriterionSection}>
          <div className={styles.CriterionHeader}>
            <div className={styles.CriterionBadge}>
              <span className={styles.StandardBadge}>{currentCriterion.standardReference}</span>
              <span className={styles.CriterionCode}>{currentCriterion.criterionCode}</span>
            </div>
            <h3 className={styles.CriterionName}>{currentCriterion.criterionNameTh}</h3>
          </div>

          {/* Questions in Current Criterion */}
          <form className={styles.QuestionsForm} onSubmit={handlers.handleSubmit}>
            {currentCriterion.questions.map((question, qIndex) => {
              const answer = stateProductSurveyForm.answers[question.questionId];
              const hasError = stateProductSurveyForm.validationErrors[question.questionId];

              return (
                <div key={question.questionId} className={styles.QuestionCard}>
                  <div className={styles.QuestionHeader}>
                    <span className={styles.QuestionNumber}>
                      คำถามที่ {question.displayOrder}
                    </span>
                    {answer && (
                      <span className={styles.AnsweredBadge}>
                        <GoogleIcon iconType="check" size="small" />
                        ตอบแล้ว
                      </span>
                    )}
                  </div>

                  <p className={styles.QuestionText}>{question.questionText}</p>

                  {question.scoringCriteria && (
                    <div className={styles.ScoringGuide}>
                      <GoogleIcon iconType="info" size="small" />
                      <span>เกณฑ์การให้คะแนน: {question.scoringCriteria}</span>
                    </div>
                  )}

                  {/* Answer Input */}
                  <div className={styles.AnswerSection}>
                    <label className={styles.Label}>
                      คำตอบของคุณ <span className={styles.Required}>*</span>
                    </label>
                    <textarea
                      className={`${styles.Textarea} ${hasError ? styles.error : ''}`}
                      value={answer?.answer || ''}
                      onChange={(e) => {
                        const newAnswer = e.target.value;
                        const currentScore = answer?.score || 5;
                        handlers.handleAnswerChange(question.questionId, newAnswer, currentScore);
                      }}
                      placeholder="กรุณาใส่คำตอบของคุณ (อย่างน้อย 10 ตัวอักษร)"
                      rows="4"
                      disabled={stateProductSurveyForm.isSubmitting}
                    />
                    {hasError && (
                      <span className={styles.ErrorText}>{hasError}</span>
                    )}
                  </div>

                  {/* Score Input */}
                  <div className={styles.ScoreSection}>
                    <label className={styles.Label}>
                      ให้คะแนนตัวเอง (1-10) <span className={styles.Required}>*</span>
                    </label>
                    <div className={styles.ScoreInputWrapper}>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={answer?.score || 5}
                        onChange={(e) => {
                          const newScore = parseInt(e.target.value);
                          const currentAnswer = answer?.answer || '';
                          handlers.handleAnswerChange(question.questionId, currentAnswer, newScore);
                        }}
                        className={styles.ScoreSlider}
                        disabled={stateProductSurveyForm.isSubmitting}
                      />
                      <span className={styles.ScoreValue}>{answer?.score || 5}</span>
                    </div>
                    <div className={styles.ScoreLabels}>
                      <span>1 (ต่ำสุด)</span>
                      <span>10 (สูงสุด)</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </form>
        </div>
      )}

      {/* Error Message */}
      {stateProductSurveyForm.error && (
        <div className={styles.ErrorMessage}>
          <GoogleIcon iconType="error" size="small" />
          {stateProductSurveyForm.error}
        </div>
      )}

      {/* Navigation Footer */}
      <div className={styles.Footer}>
        <button
          type="button"
          className={styles.SecondaryButton}
          onClick={handlers.handlePreviousCriterion}
          disabled={isFirstCriterion || stateProductSurveyForm.isSubmitting}
        >
          <GoogleIcon iconType="arrow_back" size="small" />
          ย้อนกลับ
        </button>

        <div className={styles.FooterActions}>
          {onCancel && (
            <button
              type="button"
              className={styles.CancelButton}
              onClick={() => handlers.handleCancel(onCancel)}
              disabled={stateProductSurveyForm.isSubmitting}
            >
              ยกเลิก
            </button>
          )}

          {isLastCriterion ? (
            <button
              type="button"
              className={styles.SubmitButton}
              onClick={handlers.handleSubmit}
              disabled={
                stateProductSurveyForm.isSubmitting ||
                (user?.role !== 'admin' && stateProductSurveyForm.answeredCount < stateProductSurveyForm.totalRequired)
              }
            >
              {stateProductSurveyForm.isSubmitting && (
                <div className={styles.LoadingSpinner} />
              )}
              <GoogleIcon iconType="send" size="small" />
              {stateProductSurveyForm.isSubmitting 
                ? 'กำลังประเมินผล...' 
                : 'ส่งแบบสำรวจ'}
            </button>
          ) : (
            <button
              type="button"
              className={styles.PrimaryButton}
              onClick={handlers.handleNextCriterion}
              disabled={stateProductSurveyForm.isSubmitting}
            >
              ถัดไป
              <GoogleIcon iconType="arrow_forward" size="small" />
            </button>
          )}
        </div>
      </div>

      {/* Submitting Overlay */}
      {stateProductSurveyForm.isSubmitting && (
        <div className={styles.SubmittingOverlay}>
          <div className={styles.SubmittingCard}>
            <div className={styles.LoadingSpinner} />
            <h3>กำลังประเมินผลด้วย AI...</h3>
            <p>กรุณารอสักครู่ อาจใช้เวลา 10-60 วินาที</p>
          </div>
        </div>
      )}
    </div>
  );
}
