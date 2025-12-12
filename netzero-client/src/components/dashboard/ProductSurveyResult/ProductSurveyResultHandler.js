/**
 * Handler for ProductSurveyResult component business logic
 */
const ProductSurveyResultHandler = ({
  resultData,
  onRetakeSurvey,
  onConfirm,
  onClose,
  toggleSection,
  openCriterionDetail
}) => {
  /**
   * Get alignment level display info
   */
  const getAlignmentInfo = () => {
    const level = resultData?.alignmentLevel || 'unknown';
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
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    if (score >= 40) return 'info';
    return 'error';
  };

  /**
   * Format compliance percentage
   */
  const formatCompliancePercentage = (value) => {
    if (typeof value !== 'number') return '0%';
    return `${Math.round(value)}%`;
  };

  /**
   * Get criteria breakdown items
   */
  const getCriteriaItems = () => {
    const breakdown = resultData?.criteriaBreakdown?.criteria_scores || {};
    return Object.entries(breakdown).map(([key, data]) => ({
      code: key,
      name: data.criterion_name || key,
      score: data.score || 0,
      level: data.alignment_level || 'unknown'
    }));
  };

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
    if (onConfirm) onConfirm(resultData);
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
      const dataStr = JSON.stringify(resultData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `survey-result-${resultData.surveyResponseId || Date.now()}.json`;
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
    window.print();
  };

  return {
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
  };
};

export default ProductSurveyResultHandler;
