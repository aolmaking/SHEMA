'use strict';

/**
 * The Living Atlas (أطلس العوالم الحيّة)
 * Economy, Experience Points (XP) & Progression Engine · Version 1.1
 * 
 * Strict White-Hat Principles:
 * - Deterministic, verified formulas
 * - Zero daily streak multipliers for XP (No loss aversion punishment)
 * - Micro-step fallback awards 40% base XP and maintains narrative progress
 * - No XP deducted for lapses or rest days
 */

const {
  XP_BASE_MAP,
  VARIANT_MULTIPLIER,
  GOLD_BASE_MAP,
  calculateLevelRequirement,
  WAYFINDER_LEVELS,
} = require('./atlas-constants');

class AtlasEconomyEngine {
  /**
   * Calculates XP earned for an execution event
   * Formula: Round(XP_base * K_variant)
   * 
   * @param {string} difficulty - 'trivial' | 'easy' | 'medium' | 'hard' | 'epic'
   * @param {boolean} isMicroStep - true if fallback micro-step executed
   * @returns {number} integer XP value
   */
  static calculateXp(difficulty = 'medium', isMicroStep = false) {
    const base = XP_BASE_MAP[difficulty] || XP_BASE_MAP.medium;
    const variantMultiplier = isMicroStep ? VARIANT_MULTIPLIER.micro_step : VARIANT_MULTIPLIER.full;
    return Math.round(base * variantMultiplier);
  }

  /**
   * Calculates Haven Gold earned for an execution event
   * 
   * @param {string} difficulty - 'trivial' | 'easy' | 'medium' | 'hard' | 'epic'
   * @param {boolean} isMicroStep - true if fallback micro-step executed
   * @returns {number} integer Gold value
   */
  static calculateGold(difficulty = 'medium', isMicroStep = false) {
    const base = GOLD_BASE_MAP[difficulty] || GOLD_BASE_MAP.medium;
    if (isMicroStep) {
      return Math.max(1, Math.floor(base * 0.4));
    }
    return base;
  }

  /**
   * Evaluates Wayfinder Level, progress, and title from cumulative XP
   * 
   * @param {number} cumulativeXp - Total XP accumulated by the Wayfinder
   * @returns {object} Level metadata and progress
   */
  static evaluateLevel(cumulativeXp = 0) {
    const safeXp = Math.max(0, Math.floor(cumulativeXp || 0));

    let currentLevel = 1;
    let accumulatedThreshold = 0;
    let currentLevelRequired = calculateLevelRequirement(1);

    // Evaluate levels 1 through 10+
    while (true) {
      const neededForThisLevel = calculateLevelRequirement(currentLevel);
      if (safeXp < accumulatedThreshold + neededForThisLevel) {
        currentLevelRequired = neededForThisLevel;
        break;
      }
      accumulatedThreshold += neededForThisLevel;
      currentLevel++;

      // Cap safety check
      if (currentLevel > 100) break;
    }

    const xpInCurrentLevel = safeXp - accumulatedThreshold;
    const progressPercent = Math.min(
      100,
      Math.max(0, Math.round((xpInCurrentLevel / currentLevelRequired) * 100))
    );

    // Resolve pre-defined title or fallback to Master of Horizons
    const titleMeta = WAYFINDER_LEVELS.find((l) => l.level === currentLevel) || {
      level: currentLevel,
      titleAr: 'حكيم الآفاق الأسمى',
      titleEn: `Master of Horizons (Tier ${currentLevel})`,
      unlockBenefitAr: 'استمرار ازدهار معالم الأطلس والحدود اللانهائية',
    };

    return {
      level: currentLevel,
      titleAr: titleMeta.titleAr,
      titleEn: titleMeta.titleEn,
      cumulativeXp: safeXp,
      xpInCurrentLevel,
      currentLevelRequired,
      xpRemainingToNextLevel: Math.max(0, currentLevelRequired - xpInCurrentLevel),
      progressPercent,
      unlockBenefitAr: titleMeta.unlockBenefitAr || '',
    };
  }

  /**
   * Calculates descriptive 30-day completion rate:
   * (completedOpportunities / plannedOpportunities) * 100
   * 
   * Rest days, medical exemptions, and travel pauses do NOT count as missed opportunities.
   * 
   * @param {number} loggedSuccessCount - Total verified executions (full or micro)
   * @param {number} plannedOpportunitiesCount - Total days that were actually scheduled
   * @returns {number} percentage (0 - 100)
   */
  static calculateCompletionRate30d(loggedSuccessCount = 0, plannedOpportunitiesCount = 0) {
    if (!plannedOpportunitiesCount || plannedOpportunitiesCount <= 0) {
      return loggedSuccessCount > 0 ? 100 : 0;
    }
    const rate = (loggedSuccessCount / plannedOpportunitiesCount) * 100;
    return Math.min(100, Math.max(0, Math.round(rate)));
  }
}

module.exports = {
  AtlasEconomyEngine,
};
