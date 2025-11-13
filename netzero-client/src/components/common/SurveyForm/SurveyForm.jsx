import React from "react";
import styles from "./SurveyForm.module.scss";
import useSurveyForm from "./useSurveyForm";
import SurveyFormHandler from "./SurveyFormHandler";
import SurveyQuestion from "../SurveyQuestion/SurveyQuestion";

export default function SurveyForm({ 
  survey, 
  onSubmit, 
  loading 
}) {
  const { stateSurveyForm, setSurveyForm } = useSurveyForm();
  const handlers = SurveyFormHandler(stateSurveyForm, setSurveyForm, { survey, onSubmit });

  if (!survey || !survey.questions) {
    return (
      <div className={styles.Container}>
        <p className={styles.EmptyMessage}>ไม่พบแบบสำรวจ</p>
      </div>
    );
  }

  return (
    <div className={styles.Container}>
      <div className={styles.Header}>
        <h2 className={styles.Title}>{survey.name}</h2>
        {survey.description && (
          <p className={styles.Description}>{survey.description}</p>
        )}
      </div>

      <form className={styles.Form} onSubmit={handlers.handleSubmit}>
        <div className={styles.QuestionsWrapper}>
          {survey.questions.map((question) => (
            <SurveyQuestion
              key={question.question_id}
              question={question}
              answer={stateSurveyForm.answers[question.question_id]}
              onChange={handlers.handleAnswerChange}
              error={stateSurveyForm.errors[question.question_id]}
            />
          ))}
        </div>

        {stateSurveyForm.submitError && (
          <div className={styles.SubmitError}>
            {stateSurveyForm.submitError}
          </div>
        )}

        <div className={styles.Actions}>
          <button
            type="submit"
            className={styles.SubmitButton}
            disabled={loading || stateSurveyForm.submitting}
          >
            {stateSurveyForm.submitting || loading ? "กำลังส่ง..." : "ส่งแบบสำรวจ"}
          </button>
        </div>
      </form>

      {stateSurveyForm.progress && (
        <div className={styles.ProgressBar}>
          <div 
            className={styles.ProgressFill}
            style={{ width: `${stateSurveyForm.progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
