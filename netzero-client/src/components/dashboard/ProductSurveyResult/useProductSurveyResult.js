import { useState, useEffect } from 'react';

/**
 * Custom hook for managing product survey result state
 */
const useProductSurveyResult = () => {
  const [selectedCriterion, setSelectedCriterion] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    compliance: true,
    risks: true,
    recommendations: true,
    criteria: false
  });

  /**
   * Toggle expansion state for a section
   */
  const toggleSection = (sectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  /**
   * Open criterion detail modal
   */
  const openCriterionDetail = (criterion) => {
    setSelectedCriterion(criterion);
    setShowDetailModal(true);
  };

  /**
   * Close criterion detail modal
   */
  const closeCriterionDetail = () => {
    setSelectedCriterion(null);
    setShowDetailModal(false);
  };

  /**
   * Expand all sections
   */
  const expandAll = () => {
    setExpandedSections({
      compliance: true,
      risks: true,
      recommendations: true,
      criteria: true
    });
  };

  /**
   * Collapse all sections
   */
  const collapseAll = () => {
    setExpandedSections({
      compliance: false,
      risks: false,
      recommendations: false,
      criteria: false
    });
  };

  /**
   * Reset state when component unmounts
   */
  useEffect(() => {
    return () => {
      setSelectedCriterion(null);
      setShowDetailModal(false);
      setExpandedSections({
        compliance: true,
        risks: true,
        recommendations: true,
        criteria: false
      });
    };
  }, []);

  return {
    // State
    selectedCriterion,
    showDetailModal,
    expandedSections,

    // Actions
    toggleSection,
    openCriterionDetail,
    closeCriterionDetail,
    expandAll,
    collapseAll
  };
};

export default useProductSurveyResult;
