import React from 'react';
import { GoogleIcon } from '../../common';
import useProductSurveyResult from './useProductSurveyResult';
import ProductSurveyResultHandler from './ProductSurveyResultHandler';
import styles from './ProductSurveyResult.module.scss';

/**
 * ProductSurveyResult Component
 * Displays AI-evaluated Thai Net-Zero Survey results with alignment level, scores, and compliance details
 * 
 * @param {Object} resultData - Survey result from API (alignmentLevel, overallScore, aiComment, criteriaBreakdown)
 * @param {Function} onRetakeSurvey - Callback to retake the survey
 * @param {Function} onConfirm - Callback when confirming result (for product creation flow)
 * @param {Function} onClose - Callback to close result view
 * @param {string} className - Optional CSS class
 */
const ProductSurveyResult = ({
  resultData,
  onRetakeSurvey,
  onConfirm,
  onClose,
  className = ''
}) => {
  const {
    selectedCriterion,
    showDetailModal,
    expandedSections,
    toggleSection,
    openCriterionDetail,
    closeCriterionDetail
  } = useProductSurveyResult();

  const {
    getAlignmentInfo,
    getScoreColor,
    formatCompliancePercentage,
    getCriteriaItems,
    handleRetakeSurvey,
    handleConfirm,
    handleClose,
    handleToggleSection,
    handleCriterionClick,
    handleDownloadResult,
    handlePrintResult
  } = ProductSurveyResultHandler({
    resultData,
    onRetakeSurvey,
    onConfirm,
    onClose,
    toggleSection,
    openCriterionDetail
  });

  if (!resultData) {
    return (
      <div className={`${styles.Container} ${className}`}>
        <div className={styles.ErrorMessage}>
          <GoogleIcon iconType="error" size={24} />
          <span>ไม่พบข้อมูลผลการประเมิน</span>
        </div>
      </div>
    );
  }

  const alignmentInfo = getAlignmentInfo();
  const scoreColor = getScoreColor(resultData.overallScore || 0);
  const criteriaItems = getCriteriaItems();
  const compliance = resultData.criteriaBreakdown?.sbti_compliance_summary || {};
  const riskFlags = resultData.criteriaBreakdown?.risk_flags || [];
  const recommendations = resultData.criteriaBreakdown?.recommendations || [];

  return (
    <div className={`${styles.Container} ${className}`}>
      {/* Header */}
      <div className={styles.Header}>
        <div className={styles.HeaderContent}>
          <h2 className={styles.Title}>
            <GoogleIcon iconType="eco" size={28} />
            ผลการประเมิน Net-Zero
          </h2>
          <p className={styles.Subtitle}>
            ผลการวิเคราะห์โดย AI ตามมาตรฐาน ISO IWA 42:2022 และ SBTi
          </p>
        </div>
        {onClose && (
          <button
            className={styles.CloseButton}
            onClick={handleClose}
            title="ปิด"
          >
            <GoogleIcon iconType="close" size={20} />
          </button>
        )}
      </div>

      {/* Summary Section */}
      <div className={styles.SummarySection}>
        {/* Score Circle */}
        <div className={styles.ScoreCircle}>
          <svg viewBox="0 0 120 120" className={styles.CircleSvg}>
            <circle
              cx="60"
              cy="60"
              r="50"
              className={styles.CircleBackground}
            />
            <circle
              cx="60"
              cy="60"
              r="50"
              className={`${styles.CircleProgress} ${styles[scoreColor]}`}
              strokeDasharray={`${(resultData.overallScore || 0) * 3.14} 314`}
            />
          </svg>
          <div className={styles.ScoreText}>
            <span className={styles.ScoreValue}>{resultData.overallScore || 0}</span>
            <span className={styles.ScoreLabel}>คะแนนรวม</span>
          </div>
        </div>

        {/* Alignment Badge */}
        <div className={styles.AlignmentSection}>
          <div className={`${styles.AlignmentBadge} ${styles[alignmentInfo.color]}`}>
            <GoogleIcon iconType="workspace_premium" size={20} />
            <span>{alignmentInfo.label}</span>
          </div>
          <p className={styles.AlignmentDescription}>{alignmentInfo.description}</p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className={styles.ScrollableContent}>

      {/* AI Comment */}
      {resultData.aiComment && (
        <div className={styles.CommentSection}>
          <div className={styles.CommentHeader}>
            <GoogleIcon iconType="psychology" size={20} />
            <h3>ความเห็นจาก AI</h3>
          </div>
          <p className={styles.CommentText}>{resultData.aiComment}</p>
        </div>
      )}

      {/* SBTi Compliance */}
      {compliance && Object.keys(compliance).length > 0 && (
        <div className={styles.Section}>
          <button
            className={styles.SectionHeader}
            onClick={() => handleToggleSection('compliance')}
          >
            <div className={styles.SectionTitle}>
              <GoogleIcon iconType="rule" size={20} />
              <h3>ความสอดคล้องกับ SBTi</h3>
            </div>
            <GoogleIcon
              name={expandedSections.compliance ? 'expand_less' : 'expand_more'}
              size={20}
            />
          </button>
          {expandedSections.compliance && (
            <div className={styles.SectionContent}>
              <div className={styles.ComplianceGrid}>
                {Object.entries(compliance).map(([key, value]) => (
                  <div key={key} className={styles.ComplianceItem}>
                    <span className={styles.ComplianceLabel}>
                      {key.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    <span className={styles.ComplianceValue}>
                      {formatCompliancePercentage(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Risk Flags */}
      {riskFlags.length > 0 && (
        <div className={styles.Section}>
          <button
            className={styles.SectionHeader}
            onClick={() => handleToggleSection('risks')}
          >
            <div className={styles.SectionTitle}>
              <GoogleIcon iconType="report_problem" size={20} />
              <h3>จุดเสี่ยง ({riskFlags.length})</h3>
            </div>
            <GoogleIcon
              name={expandedSections.risks ? 'expand_less' : 'expand_more'}
              size={20}
            />
          </button>
          {expandedSections.risks && (
            <div className={styles.SectionContent}>
              <ul className={styles.RiskList}>
                {riskFlags.map((risk, index) => (
                  <li key={index} className={styles.RiskItem}>
                    <GoogleIcon iconType="error_outline" size={16} />
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className={styles.Section}>
          <button
            className={styles.SectionHeader}
            onClick={() => handleToggleSection('recommendations')}
          >
            <div className={styles.SectionTitle}>
              <GoogleIcon iconType="tips_and_updates" size={20} />
              <h3>คำแนะนำ ({recommendations.length})</h3>
            </div>
            <GoogleIcon
              name={expandedSections.recommendations ? 'expand_less' : 'expand_more'}
              size={20}
            />
          </button>
          {expandedSections.recommendations && (
            <div className={styles.SectionContent}>
              <ol className={styles.RecommendationList}>
                {recommendations.map((rec, index) => (
                  <li key={index} className={styles.RecommendationItem}>
                    <span>{rec}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {/* Criteria Breakdown */}
      {criteriaItems.length > 0 && (
        <div className={styles.Section}>
          <button
            className={styles.SectionHeader}
            onClick={() => handleToggleSection('criteria')}
          >
            <div className={styles.SectionTitle}>
              <GoogleIcon iconType="bar_chart" size={20} />
              <h3>คะแนนรายเกณฑ์ ({criteriaItems.length})</h3>
            </div>
            <GoogleIcon
              name={expandedSections.criteria ? 'expand_less' : 'expand_more'}
              size={20}
            />
          </button>
          {expandedSections.criteria && (
            <div className={styles.SectionContent}>
              <div className={styles.CriteriaGrid}>
                {criteriaItems.map((item) => (
                  <div
                    key={item.code}
                    className={styles.CriteriaCard}
                    onClick={() => handleCriterionClick(item)}
                  >
                    <div className={styles.CriteriaHeader}>
                      <span className={styles.CriteriaCode}>{item.code}</span>
                      <span className={`${styles.CriteriaScore} ${styles[getScoreColor(item.score)]}`}>
                        {item.score}
                      </span>
                    </div>
                    <p className={styles.CriteriaName}>{item.name}</p>
                    <div className={`${styles.CriteriaLevel} ${styles[item.level]}`}>
                      {item.level}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      </div>

      {/* Actions */}
      <div className={styles.Actions}>
        <div className={styles.SecondaryActions}>
          {onRetakeSurvey && (
            <button className={styles.SecondaryButton} onClick={handleRetakeSurvey}>
              <GoogleIcon iconType="refresh" size={18} />
              ทำแบบสำรวจใหม่
            </button>
          )}
          <button className={styles.SecondaryButton} onClick={handleDownloadResult}>
            <GoogleIcon iconType="download" size={18} />
            ดาวน์โหลด
          </button>
          <button className={styles.SecondaryButton} onClick={handlePrintResult}>
            <GoogleIcon iconType="print" size={18} />
            พิมพ์
          </button>
        </div>
        {onConfirm && (
          <button className={styles.PrimaryButton} onClick={handleConfirm}>
            <GoogleIcon iconType="check_circle" size={18} />
            ยืนยันผลการประเมิน
          </button>
        )}
      </div>

      {/* Criterion Detail Modal */}
      {showDetailModal && selectedCriterion && (
        <div className={styles.Modal} onClick={closeCriterionDetail}>
          <div className={styles.ModalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.ModalHeader}>
              <h3>{selectedCriterion.code}: {selectedCriterion.name}</h3>
              <button onClick={closeCriterionDetail}>
                <GoogleIcon iconType="close" size={20} />
              </button>
            </div>
            <div className={styles.ModalBody}>
              <div className={styles.DetailScore}>
                คะแนน: <strong>{selectedCriterion.score}</strong>
              </div>
              <div className={styles.DetailLevel}>
                ระดับ: <strong>{selectedCriterion.level}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSurveyResult;
