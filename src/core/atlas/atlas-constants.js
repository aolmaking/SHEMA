'use strict';

/**
 * The Living Atlas (أطلس العوالم الحيّة)
 * Core System Constants & Numerical Configurations · Version 1.1
 * 
 * Strict White-Hat Behavioral Gamification:
 * - Decoupled Progression, Execution History, and Habit Automaticity
 * - Zero daily streak multipliers for XP (No Loss Aversion punishment)
 * - Deterministic, verifiable formulas
 */

// XP Base per difficulty tier (points awarded upon verified execution)
const XP_BASE_MAP = Object.freeze({
  trivial: 10,  // هين / بديهي
  easy: 20,     // يسير
  medium: 35,   // متوسط
  hard: 50,     // مكثف / شاق
  epic: 75,     // ملحمي
});

// Execution Variant Multipliers (K_variant)
const VARIANT_MULTIPLIER = Object.freeze({
  full: 1.0,        // إنجاز كامل للهدف المخطط
  micro_step: 0.4,  // خطوة مصغرة منقذة للمسار (Fallback)
});

// Haven Gold Faucet per difficulty tier
const GOLD_BASE_MAP = Object.freeze({
  trivial: 2,
  easy: 5,
  medium: 10,
  hard: 15,
  epic: 25,
});

// The Four World Affinities (أصداء المجالات الأربع) - Cosmetic narrative categories
const WORLD_AFFINITIES = Object.freeze({
  VIT: {
    id: 'VIT',
    code: 'vitality',
    nameAr: 'الحيوية',
    nameEn: 'Vitality',
    icon: '🌱',
    color: '#10b981',
    descriptionAr: 'مسارات النمو والحركة والنشاط البدني والصحة الوقائية',
    descriptionEn: 'Paths of physical vitality, movement, and bodily nourishment',
  },
  WIS: {
    id: 'WIS',
    code: 'wisdom',
    nameAr: 'الحكمة',
    nameEn: 'Wisdom',
    icon: '📜',
    color: '#3b82f6',
    descriptionAr: 'مسارات المدارسة والقراءة والتعلم والتوثيق العميق',
    descriptionEn: 'Paths of learning, deep study, reflection, and manuscript reading',
  },
  SER: {
    id: 'SER',
    code: 'serenity',
    nameAr: 'السكينة',
    nameEn: 'Serenity',
    icon: '✨',
    color: '#8b5cf6',
    descriptionAr: 'مسارات النوم الهادئ والتأمل والأذكار والراحة الواعية',
    descriptionEn: 'Paths of restful sleep, mindfulness, peaceful reflection, and stillness',
  },
  DIS: {
    id: 'DIS',
    code: 'discipline',
    nameAr: 'الصلابة والانضباط',
    nameEn: 'Discipline',
    icon: '⚔️',
    color: '#f59e0b',
    descriptionAr: 'مسارات العمل العميق وإنجاز المهام الحرجة وكسر التسويف',
    descriptionEn: 'Paths of deep focus, overcoming procrastination, and steadfast routine',
  },
});

// Level Curve Formula: Floor(180 * L^1.38 + 120 * L)
function calculateLevelRequirement(level) {
  if (level <= 1) return 300;
  return Math.floor(180 * Math.pow(level, 1.38) + 120 * level);
}

// Pre-computed Master Titles for Levels 1 to 10+
const WAYFINDER_LEVELS = Object.freeze([
  {
    level: 1,
    titleAr: 'غارس الخطوة الأولى',
    titleEn: 'Wayfinder Initiate',
    xpRequired: calculateLevelRequirement(1),
    cumulativeXp: 300,
    unlockBenefitAr: 'فناء الملاذ الأول، مشكاة المبتدئ، والأطلس غير المكتمل',
  },
  {
    level: 2,
    titleAr: 'ماسح التضاريس',
    titleEn: 'Terrain Surveyor',
    xpRequired: calculateLevelRequirement(2),
    cumulativeXp: 1008,
    unlockBenefitAr: 'قاعة الخرائط، إضاءة فانوس الملاذ الأول',
  },
  {
    level: 3,
    titleAr: 'كاشف النسيج',
    titleEn: 'Weave Seeker',
    xpRequired: calculateLevelRequirement(3),
    cumulativeXp: 2187,
    unlockBenefitAr: 'ممر الأراضي الخضراء، مكتبة الملاذ الشخصية',
  },
  {
    level: 4,
    titleAr: 'صانع الجسور',
    titleEn: 'Bridge Builder',
    xpRequired: calculateLevelRequirement(4),
    cumulativeXp: 3886,
    unlockBenefitAr: 'مفترق الطرق الحجري، حديقة السكينة',
  },
  {
    level: 5,
    titleAr: 'حارس الأرشيف',
    titleEn: 'Archive Warden',
    xpRequired: calculateLevelRequirement(5),
    cumulativeXp: 6145,
    unlockBenefitAr: 'أرشيف الأصداء العتيق، أسطرلاب المهارات المنقوش',
  },
  {
    level: 6,
    titleAr: 'ممهد السبل',
    titleEn: 'Trail Blazer',
    xpRequired: calculateLevelRequirement(6),
    cumulativeXp: 8998,
    unlockBenefitAr: 'مدرج المشكاة، ممرات التعافي عند ضفاف السكون',
  },
  {
    level: 7,
    titleAr: 'مشعل الفوانيس',
    titleEn: 'Lantern Bearer',
    xpRequired: calculateLevelRequirement(7),
    cumulativeXp: 12477,
    unlockBenefitAr: 'أبراج الاستكشاف بالملاذ، اتساع مسارات الأقاليم',
  },
  {
    level: 8,
    titleAr: 'راسم التخوم',
    titleEn: 'Frontier Cartographer',
    xpRequired: calculateLevelRequirement(8),
    cumulativeXp: 16610,
    unlockBenefitAr: 'مخطوطات الرسامين الأوائل، شرفة الرنين الفلكي',
  },
  {
    level: 9,
    titleAr: 'حارس النسيج',
    titleEn: 'Weave Guardian',
    xpRequired: calculateLevelRequirement(9),
    cumulativeXp: 21423,
    unlockBenefitAr: 'أعمدة النور المركزية، بوابة أطلال عصر الخرائط',
  },
  {
    level: 10,
    titleAr: 'حكيم الآفاق',
    titleEn: 'Master of Horizons',
    xpRequired: calculateLevelRequirement(10),
    cumulativeXp: 26940,
    unlockBenefitAr: 'بوابات الحدود المجهولة، أفق الجزر العائمة اللانهائي',
  },
]);

// Facilities expandable in First Haven (الملاذ الأول)
const HAVEN_FACILITIES = Object.freeze({
  cartographyHall: {
    id: 'cartographyHall',
    nameAr: 'قاعة الخرائط والأطلس',
    nameEn: 'The Cartography Hall',
    maxLevel: 5,
    icon: '🗺️',
  },
  personalAlcove: {
    id: 'personalAlcove',
    nameAr: 'مكتبة الملاذ (خلوة المستكشف)',
    nameEn: 'The Personal Alcove',
    maxLevel: 5,
    icon: '📚',
  },
  hearthBalcony: {
    id: 'hearthBalcony',
    nameAr: 'شرفة المشكاة والموقد',
    nameEn: 'The Hearth Balcony',
    maxLevel: 5,
    icon: '🔥',
  },
  herbarium: {
    id: 'herbarium',
    nameAr: 'حديقة السكينة والأعشاب',
    nameEn: 'The Herbarium',
    maxLevel: 5,
    icon: '🌿',
  },
});

// Canonical Event Types
const ATLAS_EVENT_TYPES = Object.freeze({
  HABIT_COMPLETED: 'HABIT_COMPLETED',
  HABIT_MICRO_STEP: 'HABIT_MICRO_STEP',
  HABIT_EXEMPTED: 'HABIT_EXEMPTED',
  OBSTACLE_ENCOUNTERED: 'OBSTACLE_ENCOUNTERED',
  STRATEGY_TESTED: 'STRATEGY_TESTED',
  CONTEXT_SHIFT_REPORTED: 'CONTEXT_SHIFT_REPORTED',
  CHRONICLE_REVIEWED: 'CHRONICLE_REVIEWED',
  HAVEN_FACILITY_UPGRADED: 'HAVEN_FACILITY_UPGRADED',
  MILESTONE_UNLOCKED: 'MILESTONE_UNLOCKED',
});

// Category-to-Affinity Mapping (Sensible Default Heuristics)
const CATEGORY_AFFINITY_MAP = Object.freeze({
  health: 'VIT',
  fitness: 'VIT',
  sports: 'VIT',
  nutrition: 'VIT',
  learning: 'WIS',
  reading: 'WIS',
  study: 'WIS',
  research: 'WIS',
  spirit: 'SER',
  quran: 'SER',
  dhikr: 'SER',
  meditation: 'SER',
  sleep: 'SER',
  productivity: 'DIS',
  deepwork: 'DIS',
  focus: 'DIS',
  work: 'DIS',
  tasks: 'DIS',
});

module.exports = {
  XP_BASE_MAP,
  VARIANT_MULTIPLIER,
  GOLD_BASE_MAP,
  WORLD_AFFINITIES,
  calculateLevelRequirement,
  WAYFINDER_LEVELS,
  HAVEN_FACILITIES,
  ATLAS_EVENT_TYPES,
  CATEGORY_AFFINITY_MAP,
};
