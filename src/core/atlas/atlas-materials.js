'use strict';

/**
 * The Living Atlas (أطلس العوالم الحيّة)
 * Living Materials & Haven Workshop Crafting Engine · Version 1.1
 * 
 * Strict White-Hat Economy:
 * - Materials are earned purely through real-life self-improvement and habit consistency.
 * - Materials cannot be purchased with real currency.
 * - Crafting restores the ancient world's beauty and enriches the journey.
 */

const LIVING_MATERIALS_META = Object.freeze({
  aetherShards: {
    id: 'aetherShards',
    nameAr: 'بلورات الطاقة',
    nameEn: 'Light Crystals',
    icon: '💎',
    color: '#38bdf8',
    descriptionAr: 'بلورات ضوئية نقية تُكتسب من الارتقاء وتخطي العقبات لترميم أبنية وجسور الملاذ.',
    descriptionEn: 'Pure luminous crystals earned from leveling up and overcoming obstacles to restore Haven architecture.',
  },
  manuscriptScraps: {
    id: 'manuscriptScraps',
    nameAr: 'قصاصات المخطوطات',
    nameEn: 'Manuscript Scraps',
    icon: '📜',
    color: '#fbbf24',
    descriptionAr: 'رقوق عتيقة تُكتسب من عادات القراءة والتعلم لكشف الخرائط وتوثيق فصول الرواية.',
    descriptionEn: 'Ancient parchment scraps earned from learning habits to uncover maps and record chronicles.',
  },
  seedsOfLight: {
    id: 'seedsOfLight',
    nameAr: 'بذور النور',
    nameEn: 'Seeds of Light',
    icon: '🌱',
    color: '#34d399',
    descriptionAr: 'بذور حية تُكتسب من عادات السكينة والصحة لتزهر في حديقة السكينة بالملاذ الأول.',
    descriptionEn: 'Living seeds earned from serenity and health habits to blossom in the Haven Herbarium.',
  },
});

// Haven Restoration & Crafting Projects
const HAVEN_CRAFTING_PROJECTS = Object.freeze([
  {
    id: 'REBUILD_VERDANT_BRIDGE',
    titleAr: 'ترميم جسر الأراضي الخضراء',
    titleEn: 'Restore the Verdant Bridge',
    icon: '🌉',
    regionTarget: 'whispering_woods',
    cost: {
      aetherShards: 50,
      manuscriptScraps: 25,
      seedsOfLight: 0,
    },
    descriptionAr: 'إعادة وصل الجسر الحجري المكسور المؤدي إلى غابات الهمس والأراضي الخضراء.',
    descriptionEn: 'Reconnect the ancient stone bridge leading towards the Whispering Woods.',
    benefitAr: 'إضاءة مسار الغابة، ومنح بركة وضاءة لعادات الحكمة والحيوية.',
    benefitEn: 'Illuminates the forest trail and bestows blessing upon Wisdom and Vitality habits.',
  },
  {
    id: 'REKINDLE_HAVEN_LANTERNS',
    titleAr: 'إشعال فوانيس الملاذ الأربعة',
    titleEn: 'Rekindle the Four Haven Lanterns',
    icon: '🏮',
    regionTarget: 'first_haven',
    cost: {
      aetherShards: 40,
      manuscriptScraps: 0,
      seedsOfLight: 30,
    },
    descriptionAr: 'تزويد فوانيس شرفة المشكاة بنور دائم يطرد صقيع العتمة ويبهج ميرو.',
    descriptionEn: 'Fuel the hearth lanterns with perpetual light to dispel cold mist and delight Miro.',
    benefitAr: 'زيادة توهج ميرو الطبيعي وفتح وضع السكينة الليلية في الواجهة.',
    benefitEn: 'Increases Miro’s ambient starlight glow and enables tranquil evening reflections.',
  },
  {
    id: 'HERBARIUM_SERENITY_GARDEN',
    titleAr: 'غرس حديقة السكينة والأعشاب',
    titleEn: 'Cultivate the Serenity Herbarium',
    icon: '🌿',
    regionTarget: 'first_haven',
    cost: {
      aetherShards: 20,
      manuscriptScraps: 0,
      seedsOfLight: 35,
    },
    descriptionAr: 'بذر الزهور الضوئية وأعشاب الشفاء في فناء الملاذ الداخلي.',
    descriptionEn: 'Sow radiant flora and healing herbs within the inner sanctuary terrace.',
    benefitAr: 'تفعيل إشارات الاستشفاء والراحة الواعية عند الشعور بالإجهاد.',
    benefitEn: 'Activates conscious recovery markers and mindful pauses during tiring days.',
  },
  {
    id: 'BIND_CARTOGRAPHERS_CODEX',
    titleAr: 'تجليد رقيم الرسامين العتيق',
    titleEn: 'Bind the Cartographer’s Codex',
    icon: '📖',
    regionTarget: 'first_haven',
    cost: {
      aetherShards: 25,
      manuscriptScraps: 45,
      seedsOfLight: 0,
    },
    descriptionAr: 'جمع الأوراق البردية المبعثرة في مجلد جلدي مذهب داخل خلوة المستكشف.',
    descriptionEn: 'Bind scattered parchment folios into a gilded leather tome within the Personal Alcove.',
    benefitAr: 'فتح استعراض المخطوطات والرسوم التوضيحية الأثرية بجودة فائقة.',
    benefitEn: 'Unlocks high-resolution viewing of ancient cartography illustrations.',
  },
]);

class AtlasMaterialsEngine {
  /**
   * Calculates materials awarded from habit execution based on affinity/category
   */
  static calculateMaterialsFromExecution(categoryOrOpts = 'productivity', difficulty = 'medium', isMicroStep = false) {
    let category = categoryOrOpts;
    let diff = difficulty;
    let micro = isMicroStep;

    if (typeof categoryOrOpts === 'object' && categoryOrOpts !== null) {
      category = categoryOrOpts.category || 'productivity';
      diff = categoryOrOpts.difficulty || 'medium';
      micro = Boolean(categoryOrOpts.isMicroStep);
    }

    const scale = micro ? 1 : (diff === 'epic' || diff === 'hard' ? 2 : 1);
    const result = {
      aetherShards: 0,
      manuscriptScraps: 0,
      seedsOfLight: 0,
    };

    switch (category) {
      case 'learning':
      case 'reading':
      case 'study':
      case 'research':
        result.manuscriptScraps = scale * 2;
        break;
      case 'spirit':
      case 'quran':
      case 'dhikr':
      case 'meditation':
      case 'sleep':
        result.seedsOfLight = scale * 2;
        break;
      case 'health':
      case 'fitness':
      case 'sports':
      case 'nutrition':
        result.seedsOfLight = scale;
        result.aetherShards = scale;
        break;
      case 'productivity':
      case 'deepwork':
      case 'focus':
      case 'work':
      default:
        result.aetherShards = scale * 2;
        break;
    }

    return result;
  }

  /**
   * Crafts / executes a Haven restoration project
   */
  static craftProject(projectId, currentMaterials = {}, completedProjectIds = []) {
    const project = HAVEN_CRAFTING_PROJECTS.find(p => p.id === projectId);
    if (!project) {
      return { ok: false, error: 'unknown_project' };
    }

    if (completedProjectIds.includes(projectId)) {
      return { ok: false, error: 'already_completed' };
    }

    const mat = {
      aetherShards: currentMaterials.aetherShards || 0,
      manuscriptScraps: currentMaterials.manuscriptScraps || 0,
      seedsOfLight: currentMaterials.seedsOfLight || 0,
    };

    const cost = project.cost;
    const canAfford = (
      mat.aetherShards >= cost.aetherShards &&
      mat.manuscriptScraps >= cost.manuscriptScraps &&
      mat.seedsOfLight >= cost.seedsOfLight
    );

    if (!canAfford) {
      return {
        ok: false,
        error: 'insufficient_materials',
        required: cost,
        available: mat,
      };
    }

    return {
      ok: true,
      project,
      deductions: cost,
      remainingMaterials: {
        aetherShards: mat.aetherShards - cost.aetherShards,
        manuscriptScraps: mat.manuscriptScraps - cost.manuscriptScraps,
        seedsOfLight: mat.seedsOfLight - cost.seedsOfLight,
      },
      logAr: `تم إنجاز مشروع [${project.titleAr}] بنجاح! ${project.benefitAr}`,
      logEn: `Project [${project.titleEn}] completed successfully! ${project.benefitEn}`,
    };
  }
}

module.exports = {
  LIVING_MATERIALS_META,
  HAVEN_CRAFTING_PROJECTS,
  AtlasMaterialsEngine,
};
