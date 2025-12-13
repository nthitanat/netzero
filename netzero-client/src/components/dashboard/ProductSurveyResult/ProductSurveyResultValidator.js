/**
 * ProductSurveyResult Validator
 * Validates AI response structure to prevent runtime errors
 * Provides type guards and development mode warnings
 */

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Log validation warning in development mode
 * @param {string} field - Field name
 * @param {string} issue - Issue description
 */
export const logValidationWarning = (field, issue) => {
    if (isDevelopment) {
        console.warn(`[ProductSurveyResult Validator] ${field}: ${issue}`);
    }
};

/**
 * Validate complete result data structure
 * @param {Object} data - Result data to validate
 * @returns {boolean} True if valid
 */
export const isValidResultData = (data) => {
    if (!data || typeof data !== 'object') {
        logValidationWarning('resultData', 'Data is null or not an object');
        return false;
    }

    // Check required fields
    const requiredFields = ['alignmentLevel', 'overallScore'];
    for (const field of requiredFields) {
        if (!(field in data)) {
            logValidationWarning(field, `Missing required field: ${field}`);
        }
    }

    return true;
};

/**
 * Validate criteria breakdown structure
 * Expected format from AI:
 * {
 *   criteria_scores: { "C1": { score, comment }, ... },
 *   sbti_compliance_summary: { "C14_commitment": "met" | "partial" | "not_met", ... },
 *   risk_flags: ["risk 1", "risk 2"],
 *   recommendations: ["rec 1", "rec 2"]
 * }
 * @param {Object} breakdown - Criteria breakdown object
 * @returns {boolean} True if valid
 */
export const isValidCriteriaBreakdown = (breakdown) => {
    if (!breakdown || typeof breakdown !== 'object') {
        logValidationWarning('criteriaBreakdown', 'Not a valid object');
        return false;
    }

    // Validate criteria_scores
    if (breakdown.criteria_scores && typeof breakdown.criteria_scores !== 'object') {
        logValidationWarning('criteria_scores', 'Expected object');
        return false;
    }

    // Validate sbti_compliance_summary
    if (breakdown.sbti_compliance_summary && typeof breakdown.sbti_compliance_summary !== 'object') {
        logValidationWarning('sbti_compliance_summary', 'Expected object');
        return false;
    }

    // Validate risk_flags
    if (breakdown.risk_flags && !Array.isArray(breakdown.risk_flags)) {
        logValidationWarning('risk_flags', 'Expected array');
        return false;
    }

    // Validate recommendations
    if (breakdown.recommendations && !Array.isArray(breakdown.recommendations)) {
        logValidationWarning('recommendations', 'Expected array');
        return false;
    }

    return true;
};

/**
 * Validate SBTi compliance item value
 * Expected: "met" | "partial" | "not_met" (string enum from AI)
 * @param {*} value - Compliance value
 * @returns {boolean} True if valid
 */
export const isValidComplianceItem = (value) => {
    const validValues = ['met', 'partial', 'not_met'];
    if (typeof value === 'string' && validValues.includes(value)) {
        return true;
    }

    logValidationWarning('complianceItem', `Invalid value: ${value}, expected "met", "partial", or "not_met"`);
    return false;
};

/**
 * Validate risk flag is a non-empty string
 * @param {*} risk - Risk flag
 * @returns {boolean} True if valid
 */
export const isValidRiskFlag = (risk) => {
    if (typeof risk === 'string' && risk.trim().length > 0) {
        return true;
    }

    logValidationWarning('riskFlag', `Invalid risk flag: ${risk}`);
    return false;
};

/**
 * Validate recommendation is a non-empty string
 * @param {*} rec - Recommendation
 * @returns {boolean} True if valid
 */
export const isValidRecommendation = (rec) => {
    if (typeof rec === 'string' && rec.trim().length > 0) {
        return true;
    }

    logValidationWarning('recommendation', `Invalid recommendation: ${rec}`);
    return false;
};

/**
 * Validate criteria score object from AI
 * Expected format: { score: number, comment: string }
 * @param {Object} score - Criteria score object
 * @returns {boolean} True if valid
 */
export const isValidCriteriaScore = (score) => {
    if (!score || typeof score !== 'object') {
        logValidationWarning('criteriaScore', 'Not a valid object');
        return false;
    }

    if (typeof score.score !== 'number') {
        logValidationWarning('criteriaScore.score', `Expected number, got ${typeof score.score}`);
        return false;
    }

    if (score.comment !== undefined && typeof score.comment !== 'string') {
        logValidationWarning('criteriaScore.comment', `Expected string, got ${typeof score.comment}`);
    }

    return true;
};

/**
 * Validate alignment level
 * @param {string} level - Alignment level
 * @returns {boolean} True if valid
 */
export const isValidAlignmentLevel = (level) => {
    const validLevels = ['beginner', 'emerging', 'consistent', 'unknown'];
    if (typeof level === 'string' && validLevels.includes(level)) {
        return true;
    }

    logValidationWarning('alignmentLevel', `Invalid level: ${level}`);
    return false;
};

/**
 * Validate overall score
 * @param {number} score - Overall score (0-100)
 * @returns {boolean} True if valid
 */
export const isValidOverallScore = (score) => {
    if (typeof score === 'number' && score >= 0 && score <= 100) {
        return true;
    }

    logValidationWarning('overallScore', `Invalid score: ${score}, expected number between 0-100`);
    return false;
};

export default {
    isValidResultData,
    isValidCriteriaBreakdown,
    isValidComplianceItem,
    isValidRiskFlag,
    isValidRecommendation,
    isValidCriteriaScore,
    isValidAlignmentLevel,
    isValidOverallScore,
    logValidationWarning
};
