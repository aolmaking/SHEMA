'use strict';

/**
 * The Living Atlas (أطلس العوالم الحيّة)
 * Narrative Progression, Clue Registry v2 & Mystery Graph Engine · Version 1.1
 * 
 * Strict White-Hat Invariants:
 * - Unlocks are governed by cumulative narrative milestones (action count, exploration, facilities),
 *   NEVER by consecutive calendar streaks or calendar days.
 * - Mystery Graph is a Directed Acyclic Graph (DAG) with progressive revelation.
 * - Foreshadowing engine provides subtle, encouraging atmospheric whispers.
 */

// Canonical Clue Registry v2 (The Mystery Graph)
const MYSTERY_GRAPH_NODES = Object.freeze([
  {
    id: 'CLUE_UNMAPPING_01',
    thread: 'the_great_unmapping',
    titleAr: 'الشظية الأولى: انفراط رداء العالم',
    titleEn: 'First Shard: The World Undone',
    prerequisites: [],
    milestoneRequirement: { totalActions: 1 },
    loreAr: 'في زمنٍ لم يعد يتذكره سوى الحجر والريح، لم تكن الجزر طافية في فراغ السحاب؛ كانت أرضاً واحدة موصولة برباط نير يدعى "النسيج". وحين انطفأت المشكاة المركزية، تلاشت الحدود المرسومة، وتاهت المعالم، وانفرط الأطلس إلى أوراق مبعثرة.',
    loreEn: 'In an age remembered only by stone and wind, the isles did not drift through empty clouds. They were one continuous land bound by the luminous "Weave". When the Great Hearth went dark, the drawn lines dissolved, landmarks vanished, and the Atlas fragmented into scattered leaves.',
    foreshadowingAr: 'الرياح تنبئ ببداية رحلة... خطوتك الأولى ستوقظ أولى شظايا الذاكرة.',
    foreshadowingEn: 'The winds murmur of a journey beginning... your first step will reawaken the first memory shard.',
  },
  {
    id: 'CLUE_MIRO_STARMOTE',
    thread: 'miro_origin',
    titleAr: 'طائر الحبر ووميض النجوم: ولادة ميرو',
    titleEn: 'Ink & Starlight: The Awakening of Miro',
    prerequisites: ['CLUE_UNMAPPING_01'],
    milestoneRequirement: { totalActions: 5 },
    loreAr: 'لم يأتِ ميرو من عالم آخر، بل تكثف من قطرة حبر أزلي سقطت على ورقة أطلس دافئة، لامسها وميض شهاب ساقط. إنه روح النسيج الحيّة؛ لا يملك خريطة كاملة، لكنه يشعر بوقع خطواتك الصادقة ويتوهج كلما غرست عادة طيبة في أرض الملاذ.',
    loreEn: 'Miro did not descend from afar. He condensed from a droplet of timeless ink falling onto warm parchment, brushed by the gleam of a falling star. He is the living spirit of the Weave; he possesses no full map, but feels each earnest step you take and glows whenever a good deed takes root in the Haven.',
    foreshadowingAr: 'أشعر بدفء خفيف بجوار الموقد... الكائن الصغير يوشك أن يخبرك بسره.',
    foreshadowingEn: 'A gentle warmth stirs near the hearth... the little companion is about to whisper his origin.',
  },
  {
    id: 'CLUE_HAVEN_FOUNDATIONS',
    thread: 'first_haven',
    titleAr: 'الملاذ الأول: صخرة الرسامين الأوائل',
    titleEn: 'First Haven: The Cartographer’s Anchor',
    prerequisites: ['CLUE_UNMAPPING_01'],
    milestoneRequirement: { totalActions: 15 },
    loreAr: 'هذه الجدران الحجرية الرابضة وسط الشلالات لم تُبنَ للمحاربين، بل صممها الرسامون الأوائل كميناء آمن للمسافرين التائهين. هنا، كل مصباح توقده يطرد صقيع العزلة، وكل طاولة خرائط تصلح مكاناً لرسم الغد.',
    loreEn: 'These moss-covered stone halls resting among the waterfalls were not built for warriors, but by the first cartographers as a safe anchorage for wandering travelers. Here, every lantern rekindled dispels cold isolation, and every map table offers space to sketch tomorrow.',
    foreshadowingAr: 'أعمدة الملاذ بدأت تستجيب لمسيرك المنتظم... أسرار البنائين الأوائل تقترب.',
    foreshadowingEn: 'The pillars of the Haven resonate with your steady stride... the builders’ secrets draw near.',
  },
  {
    id: 'CLUE_WEAVE_ECHOES',
    thread: 'the_living_weave',
    titleAr: 'همس النسيج: سر الأصداء الأربعة',
    titleEn: 'Echoes of the Weave: The Four Resonances',
    prerequisites: ['CLUE_MIRO_STARMOTE', 'CLUE_HAVEN_FOUNDATIONS'],
    milestoneRequirement: { totalActions: 30 },
    loreAr: 'يكتشف سالك الطريق أن النسيج ليس مجرد طاقة سحرية، بل هو صدى أفعاله اليومية: نبضة الحيوية في جسده، ونور الحكمة في تأمله، وسكينة روحه في خلواته، وصلابة انضباطه في مواجهة الكسل. هذه الأركان الأربعة هي الخيوط التي تعيد نسج العالم.',
    loreEn: 'The Wayfinder realizes the Weave is no mere abstract sorcery, but the echo of daily deeds: the pulse of vitality in the body, the light of wisdom in study, serenity in stillness, and steadfast discipline against indolence. These four pillars are the threads that mend the living tapestry.',
    foreshadowingAr: 'الأصداء الأربعة تتردد في جنبات الوادي... هناك كشف عميق يقترب مع إتمامك الخطوة الثلاثين.',
    foreshadowingEn: 'The four resonances hum softly across the valley... a profound realization nears with your 30th step.',
  },
  {
    id: 'CLUE_ANCIENT_SCRIBES',
    thread: 'first_haven',
    titleAr: 'سجلات الرقيم: من أين جاء الأطلس؟',
    titleEn: 'Scrolls of the Scribes: Whence the Atlas Came',
    prerequisites: ['CLUE_WEAVE_ECHOES'],
    milestoneRequirement: { totalActions: 50 },
    loreAr: 'في أعمق رفوف مكتبة الملاذ، عثر ميرو على رقٍ جلدي نُقش عليه بماء الذهب: "لا ترسم الخريطة بقدميك فحسب، بل بصدق أثرك. كل يوم تثبت فيه على نيتك هو جبل يرتفع ووادٍ يخضر في جزر الأفق."',
    loreEn: 'In the deepest alcove of the Haven archive, Miro unearths a parchment inscribed with liquid gold: "Trace not the map solely with your feet, but with the integrity of your footprint. Each day you honor your intent, an island rises and a valley blossoms across the horizon."',
    foreshadowingAr: 'رائحة ورق بردي عتيق تفوح من المكتبة... أسرار الرقيم الذهبي على وشك الانكشاف.',
    foreshadowingEn: 'The scent of ancient parchment drifts from the library... the golden scroll is ready to speak.',
  },
  {
    id: 'CLUE_THE_HORIZON_GATE',
    thread: 'the_great_unmapping',
    titleAr: 'بوابة الآفاق: فجر العوالم المتصلة',
    titleEn: 'The Horizon Gate: Dawn of Connected Realms',
    prerequisites: ['CLUE_ANCIENT_SCRIBES'],
    milestoneRequirement: { totalActions: 100 },
    loreAr: 'حين بلغت مئة خطوة صادقة، انبلج نور الفجر من وراء السحاب، وظهرت الجسور الضوئية معلقة بين قمم إيرونفروست وغابات ويسبرينغ وودز. العالم لم يكن مفقوداً؛ كان فقط ينتظر من يملك الصبر ليعيد وصل أطرافه.',
    loreEn: 'As one hundred earnest deeds were woven, morning light broke across the mist, revealing luminous bridges slung between the peaks of Ironfrost and Whispering Woods. The realm was never truly lost; it simply waited for one with steadfast patience to reknit its borders.',
    foreshadowingAr: 'أفق السحاب يتلألأ بضياء غير مسبوق... البوابة الكبرى للأطلس الحيّ تقترب من الانفتاح.',
    foreshadowingEn: 'The cloudline gleams with unprecedented brilliance... the Grand Horizon Gate draws near.',
  },
]);

class AtlasNarrativeEngine {
  /**
   * Evaluates unlocked clues given current wayfinder stats and already discovered clues.
   */
  static evaluateProgress(currentStats, unlockedClueIds = []) {
    const totalActions = currentStats.totalActions || 0;
    const discoveredSet = new Set(unlockedClueIds);
    const newlyUnlocked = [];

    for (const node of MYSTERY_GRAPH_NODES) {
      if (discoveredSet.has(node.id)) continue;

      // Check prerequisites
      const prereqsMet = node.prerequisites.every(pId => discoveredSet.has(pId));
      if (!prereqsMet) continue;

      // Check milestone requirement
      const req = node.milestoneRequirement;
      if (req.totalActions && totalActions >= req.totalActions) {
        newlyUnlocked.push(node);
        discoveredSet.add(node.id);
      }
    }

    return {
      newlyUnlocked,
      allUnlockedIds: Array.from(discoveredSet),
    };
  }

  /**
   * Retrieves active foreshadowing hints if the user is >= 70% towards the next available clue.
   */
  static getForeshadowingHint(currentStats, unlockedClueIds = [], lang = 'ar') {
    const totalActions = currentStats.totalActions || 0;
    const discoveredSet = new Set(unlockedClueIds);

    for (const node of MYSTERY_GRAPH_NODES) {
      if (discoveredSet.has(node.id)) continue;

      const prereqsMet = node.prerequisites.every(pId => discoveredSet.has(pId));
      if (!prereqsMet) continue;

      const target = node.milestoneRequirement.totalActions || 1;
      const progressRatio = totalActions / target;

      if (progressRatio >= 0.7 && progressRatio < 1.0) {
        return {
          clueId: node.id,
          targetActions: target,
          currentActions: totalActions,
          hint: lang === 'en' ? node.foreshadowingEn : node.foreshadowingAr,
        };
      }
    }

    return null;
  }

  /**
   * Generates a lyrical chronicle journal entry celebrating an achievement or discovery.
   */
  static generateChronicleEntry(type, payload, lang = 'ar') {
    const isEn = lang === 'en';
    const timestamp = new Date().toISOString();

    if (type === 'clue_unlocked') {
      const node = MYSTERY_GRAPH_NODES.find(n => n.id === payload.clueId);
      const title = node ? (isEn ? node.titleEn : node.titleAr) : payload.clueId;
      return {
        id: `chronicle-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp,
        category: 'narrative_discovery',
        icon: '📜',
        title: isEn ? `Discovery: ${title}` : `كشف جديد: ${title}`,
        text: node ? (isEn ? node.loreEn : node.loreAr) : '',
      };
    }

    if (type === 'level_up') {
      const level = payload.level;
      const title = isEn ? payload.titleEn : payload.titleAr;
      return {
        id: `chronicle-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp,
        category: 'level_milestone',
        icon: '⭐',
        title: isEn ? `Wayfinder Level ${level}: ${title}` : `رتبة السالك ${level}: ${title}`,
        text: isEn
          ? `By virtue of steadfast consistency, the Wayfinder has ascended to "${title}". New paths within the Living Atlas have illuminated.`
          : `بفضل السعي الصادق والثبات، ارتقى السالك إلى رتبة "${title}". معالم جديدة في الملاذ والأطلس الحيّ تتوهج بنور الخطوات.`,
      };
    }

    if (type === 'obstacle_overcome') {
      return {
        id: `chronicle-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp,
        category: 'obstacle_victory',
        icon: '⚔️',
        title: isEn ? 'Trail Resistance Overcome' : 'تخطي حاجز المسار',
        text: isEn ? (payload.logEn || payload.text) : (payload.logAr || payload.text),
      };
    }

    if (type === 'crafting_completed') {
      const title = isEn ? (payload.titleEn || payload.title) : (payload.titleAr || payload.title);
      return {
        id: `chronicle-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp,
        category: 'restoration_crafting',
        icon: '🛠️',
        title: isEn ? `Restored: ${title}` : `إتمام ترميم: ${title}`,
        text: isEn ? (payload.benefitEn || payload.logEn || '') : (payload.benefitAr || payload.logAr || ''),
      };
    }

    if (type === 'trial_completed') {
      const title = isEn ? (payload.titleEn || payload.title) : (payload.titleAr || payload.title);
      return {
        id: `chronicle-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp,
        category: 'major_trial',
        icon: '🏆',
        title: isEn ? `Major Trial Concluded: ${title}` : `نصر محاكمة كبرى: ${title}`,
        text: isEn ? (payload.chronicleEn || payload.logEn || '') : (payload.chronicleAr || payload.logAr || ''),
      };
    }

    if (type === 'quest_completed') {
      const title = isEn ? (payload.titleEn || payload.title) : (payload.titleAr || payload.title);
      return {
        id: `chronicle-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp,
        category: 'daily_quest',
        icon: '🧭',
        title: isEn ? `Daily Path Fulfilled: ${title}` : `إنجاز مسار اليوم: ${title}`,
        text: isEn
          ? `Wayfinder completed Miro's daily focus step, earning ${payload.rewardGold || 15} Haven Gold and ${payload.rewardShards || 5} Energy Shards.`
          : `أتم المستكشف خطوة التركيز الصغرى التي اقترحها ميرو، حاصداً ${payload.rewardGold || 15} من ذهب الملاذ و${payload.rewardShards || 5} من بلورات الطاقة لحفظ الزخم.`,
      };
    }

    if (type === 'reward_redeemed') {
      const title = isEn ? (payload.titleEn || payload.title) : (payload.titleAr || payload.title);
      return {
        id: `chronicle-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp,
        category: 'reward_redemption',
        icon: '🎁',
        title: isEn ? `Bazaar Reward: ${title}` : `استرداد مكافأة: ${title}`,
        text: isEn ? (payload.chronicleEn || '') : (payload.chronicleAr || ''),
      };
    }

    return {
      id: `chronicle-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp,
      category: 'general',
      icon: '✨',
      title: isEn ? 'Journey Footstep' : 'أثر في المسار',
      text: payload.text || '',
    };
  }
}

module.exports = {
  MYSTERY_GRAPH_NODES,
  AtlasNarrativeEngine,
};
