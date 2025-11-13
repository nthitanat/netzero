import React from "react";
import styles from "./SurveyQuestion.module.scss";

export default function SurveyQuestion({ 
  question, 
  answer, 
  onChange, 
  error 
}) {
  const renderInput = () => {
    switch (question.question_type) {
      case "text":
        return (
          <input
            type="text"
            className={styles.TextInput}
            value={answer || ""}
            onChange={(e) => onChange(question.question_id, e.target.value)}
            placeholder="กรอกคำตอบของคุณ"
          />
        );

      case "yes_no":
        return (
          <div className={styles.RadioGroup}>
            <label className={styles.RadioLabel}>
              <input
                type="radio"
                name={`question-${question.question_id}`}
                value="ใช่"
                checked={answer === "ใช่"}
                onChange={(e) => onChange(question.question_id, e.target.value)}
              />
              <span>ใช่</span>
            </label>
            <label className={styles.RadioLabel}>
              <input
                type="radio"
                name={`question-${question.question_id}`}
                value="ไม่ใช่"
                checked={answer === "ไม่ใช่"}
                onChange={(e) => onChange(question.question_id, e.target.value)}
              />
              <span>ไม่ใช่</span>
            </label>
          </div>
        );

      case "multiple_choice":
        // For multiple choice, you'd need choices array
        return (
          <input
            type="text"
            className={styles.TextInput}
            value={answer || ""}
            onChange={(e) => onChange(question.question_id, e.target.value)}
            placeholder="กรอกตัวเลือกของคุณ"
          />
        );

      case "checkbox":
        return (
          <textarea
            className={styles.TextArea}
            value={answer || ""}
            onChange={(e) => onChange(question.question_id, e.target.value)}
            placeholder="กรอกตัวเลือกของคุณ (คั่นด้วยเครื่องหมายจุลภาค)"
            rows={3}
          />
        );

      case "rating":
        return (
          <div className={styles.RatingGroup}>
            {[1, 2, 3, 4, 5].map((value) => (
              <label key={value} className={styles.RatingLabel}>
                <input
                  type="radio"
                  name={`question-${question.question_id}`}
                  value={value}
                  checked={parseInt(answer) === value}
                  onChange={(e) => onChange(question.question_id, e.target.value)}
                />
                <span className={styles.RatingNumber}>{value}</span>
              </label>
            ))}
          </div>
        );

      default:
        return (
          <textarea
            className={styles.TextArea}
            value={answer || ""}
            onChange={(e) => onChange(question.question_id, e.target.value)}
            placeholder="กรอกคำตอบของคุณ"
            rows={4}
          />
        );
    }
  };

  return (
    <div className={styles.Container}>
      <div className={styles.QuestionHeader}>
        <span className={styles.QuestionNumber}>
          Q{question.order_in_survey}
        </span>
        <label className={styles.QuestionText}>
          {question.question_text}
        </label>
      </div>
      
      <div className={styles.InputWrapper}>
        {renderInput()}
      </div>

      {error && (
        <span className={styles.ErrorMessage}>{error}</span>
      )}
    </div>
  );
}
