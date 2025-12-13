/**
 * ProductSurveyResult Normalizer
 * Transforms and normalizes AI responses to guaranteed safe structure
 * Matches exact AI response format from AiProductSurveyService.js
 */

import {
    isValidResultData,
    isValidCriteriaBreakdown,
    isValidComplianceItem,
    isValidRiskFlag,
    isValidRecommendation,
    isValidCriteriaScore,
    logValidationWarning
} from './ProductSurveyResultValidator';

/**
 * Normalize complete result data
 * Ensures all required fields exist with safe defaults
 * @param {Object} rawData - Raw AI response data
 * @returns {Object} Normalized result data
 */
export const normalizeResultData = (rawData) => {
    if (!rawData) {
        logValidationWarning('normalizeResultData', 'Received null/undefined data');
        return createDefaultResultData();
    }

    // Validate main structure
    isValidResultData(rawData);

    return {
        surveyResponseId: rawData.surveyResponseId || null,
        productId: rawData.productId || null,
        status: rawData.status || 'needs_review',
        alignmentLevel: rawData.alignmentLevel || 'unknown',
        overallScore: normalizeScore(rawData.overallScore),
        aiComment: typeof rawData.aiComment === 'string' ? rawData.aiComment : '',
        aiRawResult: rawData.aiRawResult || null,
        criteriaBreakdown: normalizeCriteriaBreakdown(rawData.criteriaBreakdown)
    };
};

/**
 * Normalize criteria breakdown to match AI response format
 * AI Format:
 * {
 *   criteria_scores: { "C1": { score: 7.5, comment: "..." }, ... },
 *   sbti_compliance_summary: { "C14_commitment": "met", ... },
 *   risk_flags: ["risk 1", ...],
 *   recommendations: ["rec 1", ...]
 * }
 * @param {Object} breakdown - Raw criteria breakdown
 * @returns {Object} Normalized breakdown
 */
export const normalizeCriteriaBreakdown = (breakdown) => {
    if (!breakdown || typeof breakdown !== 'object') {
        logValidationWarning('normalizeCriteriaBreakdown', 'Invalid breakdown, using defaults');
        return {
            criteria_scores: {},
            sbti_compliance_summary: {},
            risk_flags: [],
            recommendations: []
        };
    }

    isValidCriteriaBreakdown(breakdown);

    return {
        criteria_scores: normalizeCriteriaScores(breakdown.criteria_scores),
        sbti_compliance_summary: normalizeSBTiCompliance(breakdown.sbti_compliance_summary),
        risk_flags: normalizeRiskFlags(breakdown.risk_flags),
        recommendations: normalizeRecommendations(breakdown.recommendations)
    };
};

/**
 * Normalize criteria scores
 * AI Format: { "C1": { score: 7.5, comment: "..." }, "C2": { score: 5.2, comment: "..." } }
 * @param {Object} scores - Raw criteria scores object
 * @returns {Object} Normalized scores object
 */
export const normalizeCriteriaScores = (scores) => {
    if (!scores || typeof scores !== 'object') {
        return {};
    }

    const normalized = {};

    for (const [criterionCode, scoreData] of Object.entries(scores)) {
        if (isValidCriteriaScore(scoreData)) {
            normalized[criterionCode] = {
                score: normalizeScore(scoreData.score),
                comment: typeof scoreData.comment === 'string' ? scoreData.comment : '',
                // Optional fields from AI
                hard_check_passed: scoreData.hard_check_passed,
                hard_check_note: scoreData.hard_check_note
            };
        } else {
            // Provide default if invalid
            normalized[criterionCode] = {
                score: 0,
                comment: ''
            };
        }
    }

    return normalized;
};

/**
 * Normalize SBTi compliance summary
 * AI Format: { "C14_commitment": "met", "C1_C3_inventory": "partial", ... }
 * Values: "met" | "partial" | "not_met"
 * @param {Object} compliance - Raw compliance object
 * @returns {Object} Normalized compliance object
 */
export const normalizeSBTiCompliance = (compliance) => {
    if (!compliance || typeof compliance !== 'object') {
        return {};
    }

    const normalized = {};

    for (const [key, value] of Object.entries(compliance)) {
        if (isValidComplianceItem(value)) {
            normalized[key] = value;
        } else {
            // Fallback to 'not_met' if invalid
            normalized[key] = 'not_met';
            logValidationWarning('SBTiCompliance', `Invalid value for ${key}: ${value}, defaulting to 'not_met'`);
        }
    }

    return normalized;
};

/**
 * Normalize risk flags array
 * @param {Array} flags - Raw risk flags
 * @returns {Array<string>} Normalized risk flags
 */
export const normalizeRiskFlags = (flags) => {
    if (!Array.isArray(flags)) {
        return [];
    }

    return flags.filter(isValidRiskFlag);
};

/**
 * Normalize recommendations array
 * @param {Array} recs - Raw recommendations
 * @returns {Array<string>} Normalized recommendations
 */
export const normalizeRecommendations = (recs) => {
    if (!Array.isArray(recs)) {
        return [];
    }

    return recs.filter(isValidRecommendation);
};

/**
 * Normalize score to ensure it's a valid number between 0-100
 * @param {*} score - Raw score value
 * @returns {number} Normalized score
 */
const normalizeScore = (score) => {
    const parsed = Number(score);

    if (isNaN(parsed)) {
        logValidationWarning('score', `Invalid score value: ${score}, defaulting to 0`);
        return 0;
    }

    // Clamp to 0-100
    return Math.max(0, Math.min(100, parsed));
};

/**
 * Create default result data structure
 * Used as fallback when data is completely invalid
 * @returns {Object} Default result structure
 */
const createDefaultResultData = () => {
    return {
        surveyResponseId: null,
        productId: null,
        status: 'needs_review',
        alignmentLevel: 'unknown',
        overallScore: 0,
        aiComment: '',
        aiRawResult: null,
        criteriaBreakdown: {
            criteria_scores: {},
            sbti_compliance_summary: {},
            risk_flags: [],
            recommendations: []
        }
    };
};

export default {
    normalizeResultData,
    normalizeCriteriaBreakdown,
    normalizeCriteriaScores,
    normalizeSBTiCompliance,
    normalizeRiskFlags,
    normalizeRecommendations
};
