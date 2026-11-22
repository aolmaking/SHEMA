'use strict';

/**
 * The Living Atlas (أطلس العوالم الحيّة)
 * Obstacles, Habit Automaticity Lifecycle & Contextual Reawakening Engine · Version 1.1
 * 
 * Strict White-Hat Behavioral Invariants:
 * 1. Habits transition through: BREAKTHROUGH -> STABILIZATION -> MASTERY -> DORMANT.
 * 2. Dormancy is a natural human phase (illness, travel, rest): zero penalty, zero XP loss, zero resetting.
 * 3. Contextual Reawakening: welcoming return with friction-free micro-step fallbacks.
 * 4. Obstacles are environmental friction (fog/frost/torrent) overcome through adaptive strategies.
 */

// Habit Lifecycle States
const HABIT_LIFECYCLE_STATES = Object.freeze({
  BREAKTHROUGH: 'BREAKTHROUGH',     // مرحلة الاختراق الأولي (أول 1-14 يوماً)
  STABILIZATION: 'STABILIZATION',   // مرحلة التثبيت وتكوين الأنماط العصبية
  MASTERY: 'MASTERY',               // مرحلة الرسوخ والإتقان التلقائي (Automaticity)
  DORMANT: 'DORMANT',               // مرحلة السكون والراحة الطبيعية (بلا عقاب)
});

// Automaticity Thresholds (Inspired by SRBAI - Self-Report Behavioral Automaticity Index)
const AUTOMATICITY_CONFIG = Object.freeze({
  BREAKTHROUGH_MAX_REPS: 14,
  STABILIZATION_MIN_REPS: 15,
  MASTERY_MIN_REPS: 42,             // متوسط رسوخ العادات وفق دراسة Lally et al.
  DORMANCY_INACTIVITY_DAYS: 14,     // اعتبار العادة ساكنة بعد أسبوعين من التوقف الطبيعي
  REAWAKENING_EASY_REPS: 3,         // عدد الخطوات المصغرة لإعادة تنشيط العادة بسلاسة
});

// Thematic Obstacle Types across the Four World Regions
const WORLD_OBSTACLE_TYPES = Object.freeze({
  FOG_OF_UNCERTAINTY: {
    id: 'FOG_OF_UNCERTAINTY',
    regionId: 'whispering_woods',
    nameAr: 'ضباب الحيرة والتشتت',
    nameEn: 'Fog of Uncertainty',
    frictionCategory: 'mental_overwhelm',
    descriptionAr: 'ضباب كثيف يحجب وضوح المسار عند تراكم المهام وكثرة المشتتات.',
    descriptionEn: 'Thick mist clouding the trail when tasks pile up and distractions mount.',
    recommendedStrategy: 'micro_step',
    affinityReward: 'WIS',
    goldReward: 15,
  },
  PERMAFROST_OF_INERTIA: {
    id: 'PERMAFROST_OF_INERTIA',
    regionId: 'ironfrost_peaks',
    nameAr: 'صقيع التسويف والجمود',
    nameEn: 'Permafrost of Inertia',
    frictionCategory: 'start_resistance',
    descriptionAr: 'برودة تجعل الخطوة الأولى تبدو مستحيلة ومصحوبة بثقل كبير.',
    descriptionEn: 'Cold frost making the very first step feel heavy and immobilizing.',
    recommendedStrategy: 'two_minute_rule',
    affinityReward: 'DIS',
    goldReward: 20,
  },
  TORRENT_OF_EXHAUSTION: {
    id: 'TORRENT_OF_EXHAUSTION',
    regionId: 'sunken_spires',
    nameAr: 'طوفان الإجهاد ونفاد الطاقة',
    nameEn: 'Torrent of Exhaustion',
    frictionCategory: 'physical_depletion',
    descriptionAr: 'تيارات جارفة تجبر المستكشف على التوقف لاستعادة أنفاسه.',
    descriptionEn: 'Heavy currents forcing the Wayfinder to pause and catch their breath.',
    recommendedStrategy: 'mindful_rest',
    affinityReward: 'VIT',
    goldReward: 15,
  },
  SHIFTING_DUNES: {
    id: 'SHIFTING_DUNES',
    regionId: 'ashen_waste',
    nameAr: 'كثبان تبدل البيئة والروتين',
    nameEn: 'Shifting Dunes of Disruption',
    frictionCategory: 'routine_break',
    descriptionAr: 'رياح عاصفة تبدل المعالم عند السفر أو المرض أو تغير ساعات العمل.',
    descriptionEn: 'Strong winds shifting familiar ground during travel, illness, or schedule change.',
    recommendedStrategy: 'anchor_pairing',
    affinityReward: 'SER',
    goldReward: 20,
  },
});

// Overcoming Strategies
const OVERCOMING_STRATEGIES = Object.freeze({
  micro_step: {
    id: 'micro_step',
    nameAr: 'تطبيق الخطوة المصغرة (البديل المنجي)',
    nameEn: 'Micro-Step Fallback',
    descriptionAr: 'تقليص العادة لـ 10% من حجمها المعتاد لتجاوز حاجز المقاومة.',
  },
  two_minute_rule: {
    id: 'two_minute_rule',
    nameAr: 'قاعدة الدقيقتين',
    nameEn: 'Two-Minute Rule',
    descriptionAr: 'الالتزام ببدء العمل لمدة دقيقتين فقط دون إلزام بالإكمال.',
  },
  mindful_rest: {
    id: 'mindful_rest',
    nameAr: 'الإذن بالراحة والتعافي الواعي',
    nameEn: 'Mindful Conscious Rest',
    descriptionAr: 'التوقف المؤقت بدافع الاستشفاء دون لوم النفس أو شعور بالذنب.',
  },
  anchor_pairing: {
    id: 'anchor_pairing',
    nameAr: 'ربط العادة بمحفز راسخ جديد',
    nameEn: 'New Anchor Pairing',
    descriptionAr: 'تثبيت العادة فور سلوك بديهي قائم (مثل صب الشاي أو بعد الصلاة).',
  },
});

// 3-Tier Victory Progression Model
const OBSTACLE_VICTORY_TIERS = Object.freeze({
  1: {
    tier: 1,
    nameAr: 'الانفراج الأول (Breakthrough)',
    nameEn: 'First Breakthrough',
    descriptionAr: 'تجربة الاستراتيجية في الواقع لأول مرة؛ انشقاق العائق وظهور فجوة ضوء ضيقة تسمح بعبور المسافر.',
    descriptionEn: 'First real-life experiment; a narrow passage of light pierces the obstacle.',
    bonusAether: 5,
  },
  2: {
    tier: 2,
    nameAr: 'التثبيت والاستقرار (Stabilization)',
    nameEn: 'Stabilization & Trail Paving',
    descriptionAr: 'تكرار نجاح الاستراتيجية وانهيار أشواك العائق ورصف المسار بحجارة صلبة منقوشة.',
    descriptionEn: 'Repeated success; briars crumble into a solid paved stone trail.',
    bonusAether: 10,
  },
  3: {
    tier: 3,
    nameAr: 'الإتقان والأثر الخامل (Dormant Relic Mastery)',
    nameEn: 'Dormant Relic Mastery',
    descriptionAr: 'استقرار خطة العمل ورسوخ البديل؛ يتحول العائق إلى أثر تاريخي خامل يُحفظ في أرشيف الملاذ.',
    descriptionEn: 'Habit mastery established; obstacle transforms into a peaceful historical relic.',
    bonusAether: 25,
  },
});

class AtlasObstaclesEngine {
  /**
   * Evaluates the lifecycle state of a habit based on verified history.
   * Pure White-Hat: If days since last execution > DORMANCY_INACTIVITY_DAYS,
   * it enters DORMANT without losing total reps or mastery credit.
   */
  static evaluateHabitState(habitData, now = new Date()) {
    const totalReps = habitData.totalExecutions || 0;
    const lastDateStr = habitData.lastExecutedDate;

    // Check dormancy first
    if (lastDateStr && totalReps > 0) {
      const lastDate = new Date(lastDateStr);
      const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= AUTOMATICITY_CONFIG.DORMANCY_INACTIVITY_DAYS) {
        return {
          state: HABIT_LIFECYCLE_STATES.DORMANT,
          daysInactive: diffDays,
          isMastered: totalReps >= AUTOMATICITY_CONFIG.MASTERY_MIN_REPS,
          totalReps,
          needsWelcomingReawakening: true,
        };
      }
    }

    if (totalReps >= AUTOMATICITY_CONFIG.MASTERY_MIN_REPS) {
      return {
        state: HABIT_LIFECYCLE_STATES.MASTERY,
        automaticityIndex: 4.8, // on 5.0 scale
        isMastered: true,
        totalReps,
        needsWelcomingReawakening: false,
      };
    }

    if (totalReps >= AUTOMATICITY_CONFIG.STABILIZATION_MIN_REPS) {
      return {
        state: HABIT_LIFECYCLE_STATES.STABILIZATION,
        automaticityIndex: 3.2,
        isMastered: false,
        totalReps,
        needsWelcomingReawakening: false,
      };
    }

    return {
      state: HABIT_LIFECYCLE_STATES.BREAKTHROUGH,
      automaticityIndex: 1.5,
      isMastered: false,
      totalReps,
      needsWelcomingReawakening: false,
    };
  }

  /**
   * Reawakens a dormant habit with a compassionate, gentle ramp-up.
   */
  static generateReawakeningOffer(habit, lang = 'ar') {
    const isEn = lang === 'en';
    const habitTitle = isEn ? (habit.titleEn || habit.title || habit.nameEn || habit.name) : (habit.title || habit.name);

    return {
      habitId: habit.id,
      welcomeTitle: isEn ? `Welcome back to "${habitTitle}"` : `أهلاً بعودتك إلى مسار "${habitTitle}"`,
      welcomeBody: isEn
        ? 'Your past footsteps remain carved in the Living Atlas. Let us resume with an effortless micro-step today.'
        : 'كل خطوة خطوتها سابقاً ما زالت محفورة في أطلسك الحيّ. لنبدأ اليوم بخطوة مصغرة هينة بلا مشقة.',
      recommendedVariant: 'micro_step',
      suggestedMinutes: 2,
    };
  }

  /**
   * Resolves an environmental obstacle when an overcoming strategy is applied.
   */
  static resolveObstacle(obstacleTypeKey, strategyKey) {
    const obstacle = WORLD_OBSTACLE_TYPES[obstacleTypeKey];
    if (!obstacle) {
      throw new Error(`Unknown obstacle type: ${obstacleTypeKey}`);
    }

    const strategy = OVERCOMING_STRATEGIES[strategyKey] || OVERCOMING_STRATEGIES.micro_step;
    const isOptimalMatch = (obstacle.recommendedStrategy === strategyKey);

    return {
      obstacleId: obstacle.id,
      regionId: obstacle.regionId,
      strategyUsed: strategy.id,
      isOptimalMatch,
      affinityGranted: obstacle.affinityReward,
      affinityAmount: isOptimalMatch ? 2 : 1,
      goldAwarded: isOptimalMatch ? obstacle.goldReward : Math.floor(obstacle.goldReward * 0.7),
      resolutionLogAr: `تم تخطي [${obstacle.nameAr}] باستخدام استراتيجية [${strategy.nameAr}].`,
      resolutionLogEn: `Overcame [${obstacle.nameEn}] through [${strategy.nameEn}].`,
    };
  }

  /**
   * Advances an obstacle through the 3-Tier Victory Progression model:
   * Tier 1 (Breakthrough) -> Tier 2 (Stabilization) -> Tier 3 (Mastery / Dormant Relic).
   */
  static advanceObstacleTier(obstacleTypeKey, strategyKey, currentTier = 0) {
    const baseResolution = this.resolveObstacle(obstacleTypeKey, strategyKey);
    const obstacle = WORLD_OBSTACLE_TYPES[obstacleTypeKey];
    const newTier = Math.min(3, (currentTier || 0) + 1);
    const tierMeta = OBSTACLE_VICTORY_TIERS[newTier];
    const isMastered = (newTier >= 3);

    return {
      ...baseResolution,
      previousTier: currentTier,
      newTier,
      tierMeta,
      isMastered,
      isDormantRelic: isMastered,
      aetherShardsAwarded: tierMeta.bonusAether,
      chronicleAr: isMastered
        ? `بلغ المستكشف مرحلة الرسوخ التام أمام [${obstacle.nameAr}]؛ تحول العائق إلى أثر تاريخي خامل يُحفظ في أرشيف الملاذ الأول.`
        : `حقق المستكشف ${tierMeta.nameAr} أمام [${obstacle.nameAr}] بواسطة [${baseResolution.strategyUsed}]؛ ${tierMeta.descriptionAr}`,
      chronicleEn: isMastered
        ? `Wayfinder achieved complete mastery over [${obstacle.nameEn}]; it is now preserved as a tranquil historical relic.`
        : `Wayfinder achieved ${tierMeta.nameEn} against [${obstacle.nameEn}] via [${baseResolution.strategyUsed}].`,
    };
  }

  /**
   * Returns state list of all 4 world obstacles with current tier & dormancy status.
   */
  static getObstaclesState(tierProgressMap = {}, dormantRelicIds = []) {
    return Object.values(WORLD_OBSTACLE_TYPES).map(obs => {
      const currentTier = tierProgressMap[obs.id] || 0;
      const isDormantRelic = currentTier >= 3 || dormantRelicIds.includes(obs.id);
      return {
        ...obs,
        currentTier,
        currentTierMeta: OBSTACLE_VICTORY_TIERS[currentTier] || null,
        nextTierMeta: OBSTACLE_VICTORY_TIERS[Math.min(3, currentTier + 1)] || null,
        isDormantRelic,
        availableStrategies: Object.values(OVERCOMING_STRATEGIES),
      };
    });
  }
}

module.exports = {
  HABIT_LIFECYCLE_STATES,
  AUTOMATICITY_CONFIG,
  WORLD_OBSTACLE_TYPES,
  OVERCOMING_STRATEGIES,
  OBSTACLE_VICTORY_TIERS,
  AtlasObstaclesEngine,
};
