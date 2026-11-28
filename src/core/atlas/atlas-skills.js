'use strict';

/**
 * The Living Atlas (أطلس العوالم الحيّة)
 * Astrolabe Skill Tree Engine · Version 1.1
 * 
 * Strict White-Hat Behavioral Invariants:
 * - Skills represent real-life psychological & environmental competencies.
 * - Skills cannot be bought with gold or paywalled; unlocked strictly through real habit actions.
 * - 5 Core Branches: Perception, Preparation, Resilience, Adaptability, Maintenance.
 */

const ASTROLABE_BRANCHES = Object.freeze({
  PERCEPTION: {
    id: 'PERCEPTION',
    code: 'perc',
    nameAr: 'فرع البصيرة واليقظة',
    nameEn: 'Perception Branch',
    icon: '👁️',
    descriptionAr: 'رصد المحفزات البيئية وفهم سياق انطلاق العادة.',
    descriptionEn: 'Sensing environmental triggers and habit initiation cues.',
  },
  PREPARATION: {
    id: 'PREPARATION',
    code: 'prep',
    nameAr: 'فرع الإعداد والتمهيد',
    nameEn: 'Preparation Branch',
    icon: '🛠️',
    descriptionAr: 'تمهيد البيئة وخفض طاقة التفعيل (Friction Reduction).',
    descriptionEn: 'Environment priming and activation friction reduction.',
  },
  RESILIENCE: {
    id: 'RESILIENCE',
    code: 'resi',
    nameAr: 'فرع الصمود والنهوض',
    nameEn: 'Resilience Branch',
    icon: '🛡️',
    descriptionAr: 'النهوض الهادئ بعد التعثر دون لوم الذات أو الشعور بالذنب.',
    descriptionEn: 'Gentle recovery after lapses without self-blame or guilt.',
  },
  ADAPTABILITY: {
    id: 'ADAPTABILITY',
    code: 'adap',
    nameAr: 'فرع التكيف والمرونة',
    nameEn: 'Adaptability Branch',
    icon: '🌊',
    descriptionAr: 'إتقان البدائل المصغرة حين تضيق الظروف (Micro-Step Fluency).',
    descriptionEn: 'Mastering micro-step fallbacks when life conditions shift.',
  },
  MAINTENANCE: {
    id: 'MAINTENANCE',
    code: 'main',
    nameAr: 'فرع الصيانة والاستقرار',
    nameEn: 'Maintenance Branch',
    icon: '⚓',
    descriptionAr: 'رعاية العادات الراسخة وضمان ديمومتها دون ملل.',
    descriptionEn: 'Nurturing established habits and sustaining effortless automaticity.',
  },
});

const ASTROLABE_SKILLS = Object.freeze([
  {
    id: 'SKL-PERC-01',
    branch: 'PERCEPTION',
    titleAr: 'رصد المحفزات المبكرة',
    titleEn: 'Early Cue Sensing',
    icon: '🔍',
    descriptionAr: 'ربط 3 عادات على الأقل بمحفزات سياقية واضحة (زمان أو مكان أو عادة سابقة).',
    descriptionEn: 'Anchor at least 3 habits to clear contextual triggers (time, place, or existing habit).',
    mechanicalEffectAr: 'تفعيل التذكير الذكي قبل موعد العادة بـ 15 دقيقة، ومنح 20 قصاصة مخطوطات.',
    mechanicalEffectEn: 'Activates intelligent cue reminder 15m prior, grants 20 Manuscript Scraps.',
    materialReward: { manuscriptScraps: 20 },
    evaluateRequirement: (stats, habits = []) => {
      const habitsWithCues = habits.filter(h => Boolean(h.cue || h.triggerCue));
      return {
        met: habitsWithCues.length >= 3,
        current: habitsWithCues.length,
        required: 3,
        labelAr: `${habitsWithCues.length} / 3 عادات بمحفز واضح`,
        labelEn: `${habitsWithCues.length} / 3 habits with clear cues`,
      };
    },
  },
  {
    id: 'SKL-PREP-01',
    branch: 'PREPARATION',
    titleAr: 'تطهير الفناء المسبق',
    titleEn: 'Glade Preparation',
    icon: '🧹',
    descriptionAr: 'توثيق خطة تمهيد البيئة أو إعداد الأدوات لـ 5 مرات في المساء.',
    descriptionEn: 'Prime your environment or prepare tools the evening before 5 times.',
    mechanicalEffectAr: 'خفض مقاومة البداية ومنح 25 بلورة طاقة لترميم الملاذ.',
    mechanicalEffectEn: 'Reduces startup friction and awards 25 Aether Shards for Haven restoration.',
    materialReward: { aetherShards: 25 },
    evaluateRequirement: (stats) => {
      const prepCount = stats.environmentPrepsCount || 0;
      return {
        met: prepCount >= 5,
        current: prepCount,
        required: 5,
        labelAr: `${prepCount} / 5 مرات تمهيد مسبق`,
        labelEn: `${prepCount} / 5 environment preparations`,
      };
    },
  },
  {
    id: 'SKL-RESI-01',
    branch: 'RESILIENCE',
    titleAr: 'النهوض الهادئ بعد العثرة',
    titleEn: 'Gentle Re-anchor',
    icon: '🌱',
    descriptionAr: 'العودة لاستئناف عادة ساكنة (Dormant) بهدوء وتوثيق خطوة العودة.',
    descriptionEn: 'Resume a dormant habit with a gentle reawakening step without guilt.',
    mechanicalEffectAr: 'فتح استشارات النهوض المتخصصة مع ميرو ومنح 30 بذرة نور.',
    mechanicalEffectEn: 'Unlocks Miro Recovery Consultations and awards 30 Seeds of Light.',
    materialReward: { seedsOfLight: 30 },
    evaluateRequirement: (stats) => {
      const reawakenedCount = stats.reawakenedHabitsCount || 0;
      return {
        met: reawakenedCount >= 1,
        current: reawakenedCount,
        required: 1,
        labelAr: `${reawakenedCount} / 1 عودة مباركة بعد سكون`,
        labelEn: `${reawakenedCount} / 1 gentle reawakening after dormancy`,
      };
    },
  },
  {
    id: 'SKL-ADAP-01',
    branch: 'ADAPTABILITY',
    titleAr: 'مرونة الخطوة المصغرة',
    titleEn: 'Micro-Step Fluency',
    icon: '🌊',
    descriptionAr: 'إنجاز 3 خطوات مصغرة منقذة في الأيام المزدحمة بدلاً من الانقطاع.',
    descriptionEn: 'Execute 3 micro-step fallbacks during heavy days instead of dropping the habit.',
    mechanicalEffectAr: 'تعزيز استقرار المسار ومنح 25 بلورة طاقة و15 قصاصة مخطوطات.',
    mechanicalEffectEn: 'Reinforces trail stability and awards 25 Aether Shards and 15 Manuscripts.',
    materialReward: { aetherShards: 25, manuscriptScraps: 15 },
    evaluateRequirement: (stats) => {
      const microCount = stats.microStepsCount || 0;
      return {
        met: microCount >= 3,
        current: microCount,
        required: 3,
        labelAr: `${microCount} / 3 خطوات مصغرة منقذة`,
        labelEn: `${microCount} / 3 micro-step fallbacks`,
      };
    },
  },
  {
    id: 'SKL-MAIN-01',
    branch: 'MAINTENANCE',
    titleAr: 'رعاية المسار المستقر',
    titleEn: 'Path Anchor Mastery',
    icon: '⚓',
    descriptionAr: 'إيصال عادة واحدة على الأقل إلى حالة الرسوخ التام (42 تكراراً فأكثر).',
    descriptionEn: 'Bring at least one habit to full Mastery state (42+ verified repetitions).',
    mechanicalEffectAr: 'نقش وسام الرسوخ الدائم في أطلس الملاذ ومنح 40 بذرة نور و40 بلورة طاقة.',
    mechanicalEffectEn: 'Engraves a permanent Mastery Crest in the Atlas, awards 40 Seeds & 40 Aether.',
    materialReward: { seedsOfLight: 40, aetherShards: 40 },
    evaluateRequirement: (stats, habits = []) => {
      const masteredHabits = habits.filter(h => (h.totalExecutions || 0) >= 42);
      return {
        met: masteredHabits.length >= 1,
        current: masteredHabits.length,
        required: 1,
        labelAr: `${masteredHabits.length} / 1 عادة راسخة`,
        labelEn: `${masteredHabits.length} / 1 mastered habit`,
      };
    },
  },
]);

class AtlasSkillsEngine {
  /**
   * Evaluates unlocked skills based on current Wayfinder stats and habits registry.
   */
  static evaluateSkills(currentStats, habits = [], alreadyUnlockedIds = []) {
    const unlockedSet = new Set(alreadyUnlockedIds || []);
    const newlyUnlocked = [];
    const skillStatuses = [];

    for (const skill of ASTROLABE_SKILLS) {
      const isAlreadyUnlocked = unlockedSet.has(skill.id);
      const req = skill.evaluateRequirement(currentStats, habits);

      if (!isAlreadyUnlocked && req.met) {
        newlyUnlocked.push(skill);
        unlockedSet.add(skill.id);
      }

      skillStatuses.push({
        id: skill.id,
        branch: skill.branch,
        titleAr: skill.titleAr,
        titleEn: skill.titleEn,
        icon: skill.icon,
        descriptionAr: skill.descriptionAr,
        descriptionEn: skill.descriptionEn,
        mechanicalEffectAr: skill.mechanicalEffectAr,
        mechanicalEffectEn: skill.mechanicalEffectEn,
        isUnlocked: unlockedSet.has(skill.id),
        requirement: req,
        materialReward: skill.materialReward,
      });
    }

    return {
      newlyUnlocked,
      allUnlockedIds: Array.from(unlockedSet),
      skillStatuses,
    };
  }
}

module.exports = {
  ASTROLABE_BRANCHES,
  ASTROLABE_SKILLS,
  AtlasSkillsEngine,
};
