'use strict';

/**
 * The Living Atlas (أطلس العوالم الحيّة)
 * Major Trials & Collective Milestones Engine · Version 1.1
 * 
 * Strict White-Hat Boss Replacement Invariants:
 * - NO HP Bars (لا وجود لأشرطة دم أو قتل).
 * - NO User Damage, Death, or Party Penalties (لا ضرر أو هزيمة أو خسارة صحة).
 * - Purely cumulative progress advancing landmark restoration and personal excellence.
 * - Unlocks ancient Haven monuments, permanent chronicle honors, gold, and living materials.
 */

const MAJOR_TRIALS_CATALOG = Object.freeze([
  {
    id: 'TRIAL_GRANITE_PASS',
    titleAr: 'محاكمة الممر الصخري العظيم',
    titleEn: 'Trial of the Granite Pass',
    regionId: 'ironfrost_peaks',
    icon: '🏔️',
    targetCategory: 'productivity',
    affinityRequired: 'DIS',
    requiredSteps: 12,
    monumentId: 'granite_arches',
    monumentNameAr: 'أقواس الممر الصخري الشامخة',
    monumentNameEn: 'The Granite Arches of Resolve',
    descriptionAr: 'اجتياز ممر الصخور المعلقة عبر خطوات الانضباط اليومية الصادقة لفتح بوابات الأبراج العالية.',
    descriptionEn: 'Chart the suspended mountain pass through steadfast daily discipline to open cloud citadels.',
    rewards: {
      havenGold: 60,
      aetherShards: 50,
      seedsOfLight: 20,
    },
    completionChronicleAr: 'اجتاز المستكشف محاكمة الممر الصخري بنجاح بعد 12 خطوة راسخة؛ ارتفعت أقواس الصخر في أعالي قمم الصقيع لتبقى وتداً للأجيال.',
    completionChronicleEn: 'The Wayfinder conquered the Trial of the Granite Pass after 12 steadfast strides; stone arches rose upon frost summits.',
  },
  {
    id: 'TRIAL_SUNKEN_LIBRARY',
    titleAr: 'محاكمة خزائن المكتبة الغارقة',
    titleEn: 'Trial of the Sunken Library',
    regionId: 'archive',
    icon: '📜',
    targetCategory: 'learning',
    affinityRequired: 'WIS',
    requiredSteps: 12,
    monumentId: 'domes_of_folios',
    monumentNameAr: 'قباب المخطوطات والخرائط العتيقة',
    monumentNameEn: 'The Domes of Ancient Folios',
    descriptionAr: 'انتشال رفوف المخطوطات والخرائط العتيقة من مياه النسيج العميقة وإعادتها لقاعة الأرشيف بالملاذ.',
    descriptionEn: 'Recover scrolls and cartography folios from the deep waters to enrich the Archive of Echoes.',
    rewards: {
      havenGold: 60,
      manuscriptScraps: 50,
      aetherShards: 25,
    },
    completionChronicleAr: 'اكتملت محاكمة المكتبة الغارقة؛ عادت المخطوطات المستعادة إلى قباب الأرشيف، وأضاءت شعلة الحكمة قاعات الملاذ الأول.',
    completionChronicleEn: 'The Trial of the Sunken Library concluded; recovered folios now illuminate the domes of the ancient Archive.',
  },
  {
    id: 'TRIAL_QUIET_WATERS',
    titleAr: 'محاكمة ضفاف السكون والمياه الصافية',
    titleEn: 'Trial of the Quiet Waters',
    regionId: 'sunken_spires',
    icon: '🌊',
    targetCategory: 'spirit',
    affinityRequired: 'SER',
    requiredSteps: 10,
    monumentId: 'beacon_of_stillness',
    monumentNameAr: 'مشكاة الصفاء والسكينة الدائمة',
    monumentNameEn: 'The Beacon of Perpetual Stillness',
    descriptionAr: 'ممارسة الاستشفاء والراحة الواعية وتلاوة الذكر لتهدئة طوفان الشاشات والتشتت في ضفاف السكون.',
    descriptionEn: 'Practice mindful rest and serene spiritual grounding to calm the turbulent waters of distraction.',
    rewards: {
      havenGold: 50,
      seedsOfLight: 40,
      aetherShards: 25,
    },
    completionChronicleAr: 'هدأت أمواج الضفاف واكتملت محاكمة المياه الصافية؛ تلألأت مشكاة السكينة بنور دافئ يغمر المسافرين بالهدوء والسلام.',
    completionChronicleEn: 'Waters subsided into serene stillness; the Beacon of Peace now casts warm tranquil radiance across the haven.',
  },
]);

class AtlasTrialsEngine {
  /**
   * Evaluates and returns the status of all Major Trials.
   */
  static getTrialsState(progressMap = {}, completedTrialIds = []) {
    return MAJOR_TRIALS_CATALOG.map(trial => {
      const isCompleted = completedTrialIds.includes(trial.id);
      const currentSteps = isCompleted ? trial.requiredSteps : (progressMap[trial.id] || 0);
      const progressPercent = Math.min(100, Math.floor((currentSteps / trial.requiredSteps) * 100));

      return {
        ...trial,
        currentSteps,
        progressPercent,
        isCompleted,
        canClaim: !isCompleted && currentSteps >= trial.requiredSteps,
      };
    });
  }

  /**
   * Increments progress on matching active trials when a habit is completed.
   */
  static processHabitStepForTrials(habitCategory, progressMap = {}, completedTrialIds = []) {
    const updatedProgress = { ...progressMap };
    const newlyCompletedTrials = [];

    MAJOR_TRIALS_CATALOG.forEach(trial => {
      if (completedTrialIds.includes(trial.id)) return;

      const isMatch = (
        trial.targetCategory === habitCategory ||
        (trial.affinityRequired === 'DIS' && ['productivity', 'work', 'deepwork', 'focus'].includes(habitCategory)) ||
        (trial.affinityRequired === 'WIS' && ['learning', 'reading', 'study', 'research'].includes(habitCategory)) ||
        (trial.affinityRequired === 'SER' && ['spirit', 'quran', 'dhikr', 'meditation', 'sleep', 'health'].includes(habitCategory)) ||
        (trial.affinityRequired === 'VIT' && ['health', 'fitness', 'sports'].includes(habitCategory))
      );

      if (isMatch) {
        const cur = updatedProgress[trial.id] || 0;
        const next = Math.min(trial.requiredSteps, cur + 1);
        updatedProgress[trial.id] = next;

        if (next >= trial.requiredSteps) {
          newlyCompletedTrials.push(trial);
        }
      }
    });

    return {
      updatedProgress,
      newlyCompletedTrials,
    };
  }

  /**
   * Finalizes completion of a Major Trial and awards rewards.
   */
  static completeTrial(trialId, completedTrialIds = []) {
    const trial = MAJOR_TRIALS_CATALOG.find(t => t.id === trialId);
    if (!trial) {
      return { ok: false, error: 'unknown_trial' };
    }
    if (completedTrialIds.includes(trialId)) {
      return { ok: false, error: 'already_completed' };
    }

    return {
      ok: true,
      trial,
      rewards: trial.rewards,
      monument: {
        id: trial.monumentId,
        nameAr: trial.monumentNameAr,
        nameEn: trial.monumentNameEn,
        regionId: trial.regionId,
        icon: trial.icon,
      },
      chronicleAr: trial.completionChronicleAr,
      chronicleEn: trial.completionChronicleEn,
    };
  }
}

module.exports = {
  MAJOR_TRIALS_CATALOG,
  AtlasTrialsEngine,
};
