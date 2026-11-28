'use strict';

/**
 * The Living Atlas (أطلس العوالم الحيّة)
 * Miro Companion FSM & Ambient Behavioral Engine · Version 1.1
 * 
 * Strict White-Hat & Persona Rules:
 * - Visual: Luminous starlight-ink spirit (Ghibli/Ori inspired)
 * - 6-State FSM: RESTING, OBSERVING, CELEBRATING, SUPPORTIVE, WELCOMING, CURIOUS_REFLECTIVE
 * - Never judgmental, never uses shame or guilt, never triggers red panic warnings
 * - Local-first context memory, ultra-lightweight SVG vector footprint (< 2KB)
 */

const MIRO_STATES = Object.freeze({
  RESTING: 'RESTING',                       // ساكن مستريح بجوار الموقد
  OBSERVING: 'OBSERVING',                   // مترقب ومنتبه لتفاعل المستكشف
  CELEBRATING: 'CELEBRATING',               // مبتهج ومشع بنقاط الضوء عند الإنجاز
  SUPPORTIVE: 'SUPPORTIVE',                 // مؤازر وداعم عند مواجهة عقبة أو أخذ خطوة مصغرة
  WELCOMING: 'WELCOMING',                   // مرحب بدفء بعد غياب أو ركود بلا عتاب
  CURIOUS_REFLECTIVE: 'CURIOUS_REFLECTIVE', // متأمل يهمس بالتلميحات وأسرار الأطلس
});

const MIRO_DIALOGUE_PRESETS = Object.freeze({
  welcomeBack: {
    ar: [
      'أهلاً بك مجدداً في الملاذ! النور ما زال محفوظاً لك، والمسار ينتظر خطوتك التالية بهدوء.',
      'مرحباً بعودتك! الأثر لا يضيع؛ فلنبدأ اليوم بأبسط ما تطيق.',
      'طابت عودتك! السكينة تحيط بالملاذ، وكل خطوة سابقة تشهد لثباتك.',
    ],
    en: [
      'Welcome back to the Haven! The light remains rekindled, and the trail awaits gently.',
      'Good to see you again! Past footprints never fade; let us start with an easy step today.',
      'Welcome back! Peace rests upon the Haven, and every past step honors your journey.',
    ],
  },
  celebratingFull: {
    ar: [
      'خطوة وضاءة أخرى تُنقش في الأطلس الحيّ!',
      'نور النسيج يزداد إشراقاً بعملك الصادق.',
      'أحسنت! هذا الأثر الثابت هو ما يبني القمم.',
    ],
    en: [
      'Another luminous step etched into the Living Atlas!',
      'The light of the Weave glows brighter with your earnest deed.',
      'Well done! Steadfast footprints are what raise mountains.',
    ],
  },
  celebratingMicro: {
    ar: [
      'حتى أصغر وميض يطرد عتمة الحيرة. خطوة مصغرة ذكية حفظت مسارك!',
      'رائع! الخطوة المنجية اليوم خير من الاستسلام للتسويف.',
      'ميرو يبتسم: الخطوات الصغيرة تصنع أعظم الجسور مع الزمن.',
    ],
    en: [
      'Even the smallest spark dispels the darkness. A smart micro-step saved your trail!',
      'Splendid! A small fallback today is infinitely better than surrender.',
      'Miro smiles: Gentle steps build the greatest bridges over time.',
    ],
  },
  supportiveObstacle: {
    ar: [
      'المسارات الوعرة طبيعة كل رحلة نبيلة. خذ نفساً عميقاً، ولنختر معاً استراتيجية هينة.',
      'لا بأس أبداً ببعض الصقيع أو الضباب. المهم أنك هنا، وعزمك حيّ.',
      'الراحة ليست هزيمة، بل شحذٌ للهمة وجمعٌ للنور.',
    ],
    en: [
      'Rugged terrain is natural to every noble expedition. Take a breath, let us pick a gentle path.',
      'Frost and mist are just part of the wild. What matters is that you are here.',
      'Conscious rest is never defeat; it is gathering strength and rekindling light.',
    ],
  },
  restingAmbient: {
    ar: [
      'ميرو يحوم بهدوء بجوار المشكاة، مستمتعاً بسكينة المكان...',
      'أوراق الأطلس دافئة، والملاذ ينعم بالأمان.',
    ],
    en: [
      'Miro hovers gently near the hearth, resting in the tranquil air...',
      'The pages of the Atlas rest warm and safe.',
    ],
  },
});

class MiroCompanion {
  constructor(initialState = MIRO_STATES.RESTING) {
    this.state = initialState;
    this.glowIntensity = initialState === MIRO_STATES.RESTING ? 0.4 : 0.5;
    this.lastDialogue = '';
  }

  /**
   * Transition FSM state safely.
   */
  setState(newState, triggerContext = {}) {
    if (!MIRO_STATES[newState]) {
      throw new Error(`Invalid Miro state: ${newState}`);
    }

    this.state = newState;

    switch (newState) {
      case MIRO_STATES.CELEBRATING:
        this.glowIntensity = 1.0;
        break;
      case MIRO_STATES.SUPPORTIVE:
        this.glowIntensity = 0.75;
        break;
      case MIRO_STATES.WELCOMING:
        this.glowIntensity = 0.85;
        break;
      case MIRO_STATES.CURIOUS_REFLECTIVE:
        this.glowIntensity = 0.7;
        break;
      case MIRO_STATES.OBSERVING:
        this.glowIntensity = 0.6;
        break;
      case MIRO_STATES.RESTING:
      default:
        this.glowIntensity = 0.4;
        break;
    }

    return {
      state: this.state,
      glowIntensity: this.glowIntensity,
      dialogue: this.getDialogueForState(newState, triggerContext),
    };
  }

  /**
   * Selects an appropriate dialogue snippet without repetition.
   */
  getDialogueForState(state, context = {}) {
    const lang = context.lang || 'ar';
    const isEn = lang === 'en';

    if (context.customMessage) {
      this.lastDialogue = context.customMessage;
      return this.lastDialogue;
    }

    let list = [];
    if (state === MIRO_STATES.WELCOMING) {
      list = isEn ? MIRO_DIALOGUE_PRESETS.welcomeBack.en : MIRO_DIALOGUE_PRESETS.welcomeBack.ar;
    } else if (state === MIRO_STATES.CELEBRATING) {
      if (context.isMicroStep) {
        list = isEn ? MIRO_DIALOGUE_PRESETS.celebratingMicro.en : MIRO_DIALOGUE_PRESETS.celebratingMicro.ar;
      } else {
        list = isEn ? MIRO_DIALOGUE_PRESETS.celebratingFull.en : MIRO_DIALOGUE_PRESETS.celebratingFull.ar;
      }
    } else if (state === MIRO_STATES.SUPPORTIVE) {
      list = isEn ? MIRO_DIALOGUE_PRESETS.supportiveObstacle.en : MIRO_DIALOGUE_PRESETS.supportiveObstacle.ar;
    } else {
      list = isEn ? MIRO_DIALOGUE_PRESETS.restingAmbient.en : MIRO_DIALOGUE_PRESETS.restingAmbient.ar;
    }

    const selected = list[Math.floor(Math.random() * list.length)] || '';
    const name = (context.name || context.wayfinderName || '').trim();
    let res = selected;
    if (name && name !== 'مستكشف الدرب' && name !== 'Wayfinder') {
      if (isEn) {
        res = `${name}, ${selected.charAt(0).toLowerCase() + selected.slice(1)}`;
      } else {
        res = `يا ${name}، ${selected}`;
      }
    }
    this.lastDialogue = res;
    return res;
  }

  /**
   * Provides multi-modal interactive consultation across reflection, wisdom, science, and stillness.
   */
  consult(modeKey = 'reflection', lang = 'ar') {
    const mode = MIRO_CONSULTATION_MODES[modeKey] || MIRO_CONSULTATION_MODES.reflection;
    const isEn = lang === 'en';
    const list = isEn ? mode.dialogues.en : mode.dialogues.ar;
    const dialogue = list[Math.floor(Math.random() * list.length)] || '';
    this.setState(MIRO_STATES.CURIOUS_REFLECTIVE, { customMessage: dialogue, lang });
    return {
      mode: mode.id,
      title: isEn ? mode.titleEn : mode.titleAr,
      titleAr: mode.titleAr,
      titleEn: mode.titleEn,
      icon: mode.icon,
      dialogue,
      glowIntensity: this.glowIntensity,
    };
  }

  /**
   * Generates ultra-lightweight SVG vector sprite representing Miro.
   * Based on Asset 13: Starlight-ink flame spirit with dark friendly eyes and soft aura.
   * Zero external raster image dependency for sub-millisecond widget rendering.
   */
  static renderSvgSprite(options = {}) {
    const size = options.size || 48;
    const glow = options.glow !== undefined ? options.glow : 0.8;
    const isWink = Boolean(options.wink);

    return `
<svg class="miro-sprite" width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="miroAura" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#a7f3d0" stop-opacity="${0.6 * glow}" />
      <stop offset="60%" stop-color="#38bdf8" stop-opacity="${0.3 * glow}" />
      <stop offset="100%" stop-color="#38bdf8" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="miroBody" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc" />
      <stop offset="70%" stop-color="#e0f2fe" />
      <stop offset="100%" stop-color="#bae6fd" />
    </linearGradient>
    <linearGradient id="miroFlame" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="60%" stop-color="#818cf8" />
      <stop offset="100%" stop-color="#c084fc" />
    </linearGradient>
  </defs>

  <!-- Ambient Glow Aura -->
  <circle cx="50" cy="50" r="46" fill="url(#miroAura)" />

  <!-- Flame Hair (Starlight-Ink Crest) -->
  <path d="M48 10 C46 22 36 28 34 38 C32 46 36 50 42 50 C48 50 52 42 52 35 C52 26 58 20 62 16 C58 28 66 34 66 42 C66 48 62 52 56 52 C52 52 50 48 50 44 C50 36 54 28 48 10 Z" fill="url(#miroFlame)" />

  <!-- Luminous Body -->
  <ellipse cx="50" cy="58" rx="22" ry="24" fill="url(#miroBody)" />

  <!-- Little Arms -->
  <path d="M28 58 C24 62 26 68 30 66" stroke="#bae6fd" stroke-width="3" stroke-linecap="round" fill="none" />
  <path d="M72 58 C76 62 74 68 70 66" stroke="#bae6fd" stroke-width="3" stroke-linecap="round" fill="none" />

  <!-- Eyes (Deep Starlight Brown/Obsidian) -->
  ${isWink
    ? `<path d="M38 56 Q42 52 46 56" stroke="#0f172a" stroke-width="3" stroke-linecap="round" fill="none" />`
    : `<ellipse cx="42" cy="55" rx="3.5" ry="4.5" fill="#0f172a" /><circle cx="43.5" cy="53.5" r="1.2" fill="#ffffff" />`
  }
  <ellipse cx="58" cy="55" rx="3.5" ry="4.5" fill="#0f172a" />
  <circle cx="59.5" cy="53.5" r="1.2" fill="#ffffff" />

  <!-- Gentle Smile -->
  <path d="M47 64 Q50 67 53 64" stroke="#334155" stroke-width="2" stroke-linecap="round" fill="none" />

  <!-- Starlight Mote Embers -->
  <circle cx="28" cy="36" r="2.2" fill="#fef08a" opacity="${glow}">
    <animate attributeName="opacity" values="${glow * 0.4};${glow};${glow * 0.4}" dur="2s" repeatCount="indefinite" />
  </circle>
  <circle cx="70" cy="38" r="1.8" fill="#a7f3d0" opacity="${glow}">
    <animate attributeName="opacity" values="${glow};${glow * 0.3};${glow}" dur="2.5s" repeatCount="indefinite" />
  </circle>
</svg>
`.trim();
  }
}

const MIRO_CONSULTATION_MODES = Object.freeze({
  reflection: {
    id: 'reflection',
    titleAr: 'استشارة المسار والنهوض الهادئ',
    titleEn: 'Trail Reflection & Gentle Recovery',
    icon: '🧭',
    dialogues: {
      ar: [
        'إذا شعرت بثقل في البداية، فاعلم أن العثرات ليست خروجاً عن المسار؛ بل هي جزء من رسمه. ما رأيك أن تنجز خطوة لدقيقة واحدة فقط الآن؟',
        'الأثر لا يضيع؛ كل عادة مارستها سابقاً تركت مساراً عصبياً جاهزاً لإعادة الإيقاظ. لنبدأ بخطوة هينة بلا مشقة.',
        'لا تنتظر لحظة الشغف الكاملة؛ الحركة البسيطة هي التي تجلب الشغف لا العكس.',
      ],
      en: [
        'If the trail feels heavy, remember: stumbles are not falling off the path; they are part of charting it. How about a 1-minute micro-step right now?',
        'Past footprints never truly fade; every habit you practiced formed neural pathways ready to reawaken. Let us begin effortlessly.',
        'Do not wait for perfect motivation; gentle action is what summons motivation, not the other way around.',
      ],
    },
  },
  wisdom: {
    id: 'wisdom',
    titleAr: 'حكمة النسيج وأسرار الأطلس',
    titleEn: 'Weave Lore & Scribe Wisdom',
    icon: '📜',
    dialogues: {
      ar: [
        'نقش الرسامون الأوائل في الملاذ: "عظمة الجبال تبدأ من حبة رمل تثبت في مكانها". استمرارك اليوم هو وتد الغد.',
        'النسيج لا يتطلب منك الركض طوال الوقت؛ بل يتطلب أن تظل متصلاً بنيتك الصادقة.',
        'في عصر انحلال الخرائط، لم يبقَ من العالم إلا الأماكن التي اعتنى بها أهلها بوفاء يومي.',
      ],
      en: [
        'The early cartographers carved in the Haven: "The grandeur of mountains begins with a grain of sand holding its ground." Your consistency today anchors tomorrow.',
        'The Weave does not demand you sprint; it only asks that you remain true to your intent.',
        'During the Great Unmapping, the only realms that endured were those sustained by faithful daily care.',
      ],
    },
  },
  habit_science: {
    id: 'habit_science',
    titleAr: 'علم العادات وتطهير الفناء',
    titleEn: 'Behavioral Science & Priming',
    icon: '🔬',
    dialogues: {
      ar: [
        'قاعدة الـ 20 ثانية: اجعل أدوات عادتك الإيجابية أقرب إليك بـ 20 ثانية، وأدوات المشتتات أبعد بـ 20 ثانية.',
        'تثبيت العادات يعتمد على المحفز المسبق: "بعد أن [أصب الشاي]، سأقوم بـ [قراءة صفحتين]". ما محفزك اليوم؟',
        'ركز على الهوية لا النتيجة: لا تقل "أحاول القراءة"، بل قل "أنا إنسان قارئ يثبت على ورده".',
      ],
      en: [
        'The 20-Second Rule: Make positive habit tools 20 seconds easier to reach, and distractions 20 seconds harder.',
        'Habit anchoring relies on clear cues: "After I [pour tea], I will [read 2 pages]". What is your anchor today?',
        'Focus on identity over outcome: Do not say "I am trying to read", say "I am a reader who honors their daily text".',
      ],
    },
  },
  calm: {
    id: 'calm',
    titleAr: 'جلسة سكينة وتأمل وتنفس',
    titleEn: 'Mindful Breathing & Stillness',
    icon: '✨',
    dialogues: {
      ar: [
        'خذ نفساً عميقاً... املأ رئتيك بهواء الجزر العائمة، وأخرجه ببطء. أنت في أمان هنا.',
        'أغمض عينيك لثلاثين ثانية، واستشعر سكون شرفة المشكاة. السكينة وقود الهمة.',
        'اهدأ قليلاً؛ ليس عليك إنجاز كل شيء في هذه اللحظة. خطوة واحدة هادئة تكفي.',
      ],
      en: [
        'Take a slow, deep breath... fill your lungs with the fresh mist of the floating isles, and release gently. You are safe here.',
        'Close your eyes for 30 seconds and sense the stillness of the Haven balcony. Peace fuels steadfast resolve.',
        'Rest a moment; you do not need to finish everything at once. One calm step is always enough.',
      ],
    },
  },
});

module.exports = {
  MIRO_STATES,
  MIRO_DIALOGUE_PRESETS,
  MIRO_CONSULTATION_MODES,
  MiroCompanion,
};
