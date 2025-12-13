/**
 * Handler for ProductSurveyResult component business logic
 * Uses normalizer to ensure safe data handling
 */
import { normalizeResultData } from './ProductSurveyResultNormalizer';

const ProductSurveyResultHandler = ({
  resultData,
  onRetakeSurvey,
  onConfirm,
  onClose,
  toggleSection,
  openCriterionDetail
}) => {
  // Normalize data on entry to ensure safe structure
  const normalizedData = normalizeResultData(resultData);

  /**
   * Get alignment level display info
   */
  const getAlignmentInfo = () => {
    const level = normalizedData.alignmentLevel;
    const configs = {
      consistent: {
        label: 'ระดับสูง (Consistent)',
        color: 'success',
        description: 'องค์กรมีความสอดคล้องกับมาตรฐาน Net-Zero ในระดับสูง'
      },
      emerging: {
        label: 'ระดับกลาง (Emerging)',
        color: 'warning',
        description: 'องค์กรกำลังพัฒนาไปสู่การบรรลุเป้าหมาย Net-Zero'
      },
      beginner: {
        label: 'ระดับเริ่มต้น (Beginner)',
        color: 'info',
        description: 'องค์กรเริ่มต้นในการดำเนินการด้าน Net-Zero'
      },
      unknown: {
        label: 'ไม่สามารถประเมินได้',
        color: 'error',
        description: 'ข้อมูลไม่เพียงพอสำหรับการประเมินระดับ'
      }
    };
    return configs[level] || configs.unknown;
  };

  /**
   * Get score level color
   */
  const getScoreColor = (score) => {
    const numScore = Number(score) || 0;
    if (numScore >= 80) return 'success';
    if (numScore >= 60) return 'warning';
    if (numScore >= 40) return 'info';
    return 'error';
  };

  /**
   * Format SBTi compliance enum to display text
   * AI returns: "met" | "partial" | "not_met"
   * Display as Thai text with appropriate styling
   * @param {string} value - Compliance enum value
   * @returns {Object} { text, color, percentage }
   */
  const formatComplianceValue = (value) => {
    const configs = {
      met: {
        text: 'ผ่าน',
        color: 'success',
        percentage: 100,
        icon: 'check_circle'
      },
      partial: {
        text: 'ผ่านบางส่วน',
        color: 'warning',
        percentage: 50,
        icon: 'warning'
      },
      not_met: {
        text: 'ไม่ผ่าน',
        color: 'error',
        percentage: 0,
        icon: 'cancel'
      }
    };
    return configs[value] || configs.not_met;
  };

  /**
   * Get criteria breakdown items from AI response
   * AI Format: { "C1": { score: 7.5, comment: "..." }, ... }
   * @returns {Array} Array of criterion objects
   */
  const getCriteriaItems = () => {
    try {
      const criteriaScores = normalizedData.criteriaBreakdown?.criteria_scores || {};

      return Object.entries(criteriaScores).map(([code, data]) => ({
        code,
        score: data.score || 0,
        comment: data.comment || '',
        hardCheckPassed: data.hard_check_passed,
        hardCheckNote: data.hard_check_note,
        // Infer level from score for display
        level: inferLevelFromScore(data.score)
      }));
    } catch (error) {
      console.error('Error getting criteria items:', error);
      return [];
    }
  };

  /**
   * Infer alignment level from score
   * Used when AI doesn't provide explicit level per criterion
   * @param {number} score - Criterion score
   * @returns {string} Inferred level
   */
  const inferLevelFromScore = (score) => {
    if (score >= 8) return 'consistent';
    if (score >= 6) return 'emerging';
    if (score >= 4) return 'beginner';
    return 'unknown';
  };

  /**
   * Get normalized data for external use
   * @returns {Object} Normalized result data
   */
  const getNormalizedData = () => normalizedData;

  /**
   * Handle retake survey with confirmation
   */
  const handleRetakeSurvey = () => {
    if (window.confirm('คุณต้องการทำแบบสำรวจใหม่อีกครั้งหรือไม่? คำตอบเดิมจะถูกลบทิ้ง')) {
      if (onRetakeSurvey) onRetakeSurvey();
    }
  };

  /**
   * Handle confirm result
   */
  const handleConfirm = () => {
    if (onConfirm) onConfirm(normalizedData);
  };

  /**
   * Handle close result
   */
  const handleClose = () => {
    if (onClose) onClose();
  };

  /**
   * Handle section toggle
   */
  const handleToggleSection = (sectionKey) => {
    if (toggleSection) toggleSection(sectionKey);
  };

  /**
   * Handle criterion detail click
   */
  const handleCriterionClick = (criterion) => {
    if (openCriterionDetail) openCriterionDetail(criterion);
  };

  /**
   * Download result as JSON
   */
  const handleDownloadResult = () => {
    try {
      const dataStr = JSON.stringify(normalizedData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `survey-result-${normalizedData.surveyResponseId || Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading result:', error);
      alert('เกิดข้อผิดพลาดในการดาวน์โหลดผลลัพธ์');
    }
  };

  /**
   * Print result
   */
  const handlePrintResult = () => {
    try {
      window.print();
    } catch (error) {
      console.error('Error printing result:', error);
      alert('เกิดข้อผิดพลาดในการพิมพ์ผลลัพธ์');
    }
  };

  return {
    getAlignmentInfo,
    getScoreColor,
    formatComplianceValue,
    getCriteriaItems,
    getNormalizedData,
    handleRetakeSurvey,
    handleConfirm,
    handleClose,
    handleToggleSection,
    handleCriterionClick,
    handleDownloadResult,
    handlePrintResult
  };
};

export default ProductSurveyResultHandler;

