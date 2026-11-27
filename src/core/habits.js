'use strict';

/**
 * Habits, Life Intelligence, and Wellness Core Engine
 * 
 * Features:
 * - Multi-input habits (Boolean, Numeric, Duration, Percentage, Rating)
 * - Flexible frequencies (Daily, Weekly targets, Specific days of week)
 * - Skip logic (Exemptions for sickness, travel, rest - streaks & scores preserved)
 * - Routines / Habit Stacking (Morning, Afternoon, Evening, Anytime)
 * - Sleep & Mood Lab (Bedtime, Wake time, Sleep zones, Mood scales, Stress & Screen time)
 * - Daily Wellness Index (Composite 0-100 score)
 * - Real Mathematical KPI & Correlation Engine (Habit Strength EMA, Pearson r)
 * - Backup & Restore (JSON / CSV)
 * - WhatsApp Executive Infographic Reports
 */

const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');
const os = require('os');

const BOSS_ROSTER = [
  {
    id: 'boss-sloth',
    name: 'تنين الخمول والتسويف',
    nameEn: 'Dragon of Sloth',
    maxHp: 300,
    icon: '🐲',
    bountyCoins: 100,
    bountyXp: 200,
  },
  {
    id: 'boss-distraction',
    name: 'غول التشتت وضياع الوقت',
    nameEn: 'Distraction Golem',
    maxHp: 450,
    icon: '🗿',
    bountyCoins: 150,
    bountyXp: 300,
  },
  {
    id: 'boss-burnout',
    name: 'شبح الفوضى والإرهاق',
    nameEn: 'Chaos Phantom',
    maxHp: 600,
    icon: '👻',
    bountyCoins: 200,
    bountyXp: 400,
  },
  {
    id: 'boss-doubt',
    name: 'عنقاء الشك والتردد',
    nameEn: 'Phoenix of Doubt',
    maxHp: 800,
    icon: '🦅',
    bountyCoins: 300,
    bountyXp: 500,
  },
];

const HERO_SKILLS = {
  warrior: {
    id: 'valorous_strike',
    name: 'ضربة الشجاعة (Valorous Strike)',
    nameEn: 'Valorous Strike',
    cost: 20,
    icon: '⚔️',
    desc: 'توجيه ضربة حاسمة بـ 50 ضرر لزعيم الأسبوع',
    descEn: 'Deal 50 instant damage to weekly boss',
  },
  healer: {
    id: 'healing_ward',
    name: 'درع العافية (Healing Ward)',
    nameEn: 'Healing Ward',
    cost: 25,
    icon: '🔮',
    desc: 'منح درع تجميد سلسلة + استعادة 20 HP',
    descEn: 'Grant 1 Streak Shield + recover 20 HP',
  },
  rogue: {
    id: 'double_bounty',
    name: 'مضاعفة الغنائم (Double Bounty)',
    nameEn: 'Double Bounty',
    cost: 30,
    icon: '🏹',
    desc: 'سرقة كنز غنائي سريع (+40 عملة ذهبية)',
    descEn: 'Instant plunder: earn +40 gold coins',
  },
  mage: {
    id: 'burst_wisdom',
    name: 'تفجر الحكمة (Burst of Wisdom)',
    nameEn: 'Burst of Wisdom',
    cost: 25,
    icon: '🧙‍♂️',
    desc: 'تحصيل فوري لـ +50 نقطة خبرة XP لتسريع الارتقاء',
    descEn: 'Instant +50 XP surge towards next level',
  },
  scholar: {
    id: 'deep_focus',
    name: 'تركيز عميق (Deep Focus)',
    nameEn: 'Deep Focus',
    cost: 20,
    icon: '📚',
    desc: 'شحذ مدارك التفكير: زيادة دائمة +2 في الذكاء (INT)',
    descEn: 'Sharpen intellect: +2 permanent INT stat',
  },
  monk: {
    id: 'inner_calm',
    name: 'سكينة النفس (Inner Calm)',
    nameEn: 'Inner Calm',
    cost: 20,
    icon: '🧘',
    desc: 'استعادة كاملة لصحة البطل + زيادة البنية (CON)',
    descEn: 'Restore HP and +2 permanent CON stat',
  },
  architect: {
    id: 'fortify_routine',
    name: 'تدعيم الأساس (Fortify Routine)',
    nameEn: 'Fortify Routine',
    cost: 35,
    icon: '🏛️',
    desc: 'ترقية وتدعيم جميع السمات الأربع (+1 لكل سمة)',
    descEn: 'Fortify all 4 core hero stats (+1 each)',
  },
};

const DEFAULT_HABITS = [
  {
    id: 'hbt-read-01',
    title: 'قراءة يومية (كتب / أبحاث)',
    titleEn: 'Daily Reading',
    category: 'learning',
    routine: 'evening',
    type: 'number',
    targetValue: 20,
    unit: 'صفحة',
    unitEn: 'pages',
    frequency: { type: 'daily' },
    color: '#3b82f6',
    icon: '📖',
    direction: 'positive',
    difficulty: 'medium',
    enablePomodoro: true,
    syncToTodo: true,
    todoPriority: 1,
    createdAt: new Date().toISOString(),
    archived: false,
  },
  {
    id: 'hbt-workout-02',
    title: 'تمارين رياضية / نشاط بدني',
    titleEn: 'Workout & Fitness',
    category: 'health',
    routine: 'afternoon',
    type: 'percentage',
    targetValue: 100,
    unit: '%',
    unitEn: '%',
    frequency: { type: 'weekly_target', targetDaysPerWeek: 4 },
    color: '#10b981',
    icon: '🏃‍♂️',
    direction: 'positive',
    difficulty: 'medium',
    enablePomodoro: false,
    syncToTodo: true,
    todoPriority: 2,
    createdAt: new Date().toISOString(),
    archived: false,
  },
  {
    id: 'hbt-water-03',
    title: 'شرب ماء كافٍ (2.5 لتر)',
    titleEn: 'Water Intake (2.5L)',
    category: 'health',
    routine: 'anytime',
    type: 'number',
    targetValue: 8,
    unit: 'أكواب',
    unitEn: 'cups',
    frequency: { type: 'daily' },
    color: '#06b6d4',
    icon: '💧',
    direction: 'positive',
    difficulty: 'easy',
    enablePomodoro: false,
    syncToTodo: false,
    todoPriority: 0,
    createdAt: new Date().toISOString(),
    archived: false,
  },
  {
    id: 'hbt-sleep-04',
    title: 'نوم صحي هادئ 8 ساعات',
    titleEn: 'Sleep 8 Hours',
    category: 'health',
    routine: 'evening',
    type: 'duration',
    targetValue: 8,
    unit: 'ساعات',
    unitEn: 'hours',
    frequency: { type: 'daily' },
    color: '#8b5cf6',
    icon: '😴',
    direction: 'positive',
    difficulty: 'easy',
    enablePomodoro: false,
    createdAt: new Date().toISOString(),
    archived: false,
  },
  {
    id: 'hbt-dhikr-05',
    title: 'أذكار الصباح وورد اليوم',
    titleEn: 'Morning Reflection & Dhikr',
    category: 'spirit',
    routine: 'morning',
    type: 'boolean',
    targetValue: 1,
    unit: '',
    unitEn: '',
    frequency: { type: 'daily' },
    color: '#f59e0b',
    icon: '✨',
    direction: 'positive',
    difficulty: 'trivial',
    enablePomodoro: false,
    createdAt: new Date().toISOString(),
    archived: false,
  },
  {
    id: 'hbt-deepwork-06',
    title: 'جلسة تركيز وعمل عميق',
    titleEn: 'Deep Focus Session',
    category: 'productivity',
    routine: 'morning',
    type: 'duration',
    targetValue: 120,
    unit: 'دقيقة',
    unitEn: 'min',
    frequency: { type: 'specific_days', daysOfWeek: [0, 1, 2, 3, 4] },
    color: '#ec4899',
    icon: '🎯',
    direction: 'positive',
    difficulty: 'hard',
    enablePomodoro: true,
    createdAt: new Date().toISOString(),
    archived: false,
  },
  {
    id: 'hbt-junk-07',
    title: 'الامتناع عن السكريات والمشروبات الغازية',
    titleEn: 'No Sugary Drinks',
    category: 'health',
    routine: 'anytime',
    type: 'boolean',
    targetValue: 1,
    unit: '',
    unitEn: '',
    frequency: { type: 'daily' },
    color: '#ef4444',
    icon: '🛑',
    direction: 'negative',
    difficulty: 'medium',
    enablePomodoro: false,
    createdAt: new Date().toISOString(),
    archived: false,
  },
];

function getLocalDateStr(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getSafeTodayStr() {
  const local = getLocalDateStr(new Date());
  const utc = new Date().toISOString().slice(0, 10);
  return local > utc ? local : utc;
}

class HabitsManager extends EventEmitter {
  constructor(store, getSettings = () => ({}), dispatcher = null) {
    super();
    this.store = store;
    this.getSettings = getSettings;
    this.dispatcher = dispatcher;
    this._ensureDefaults();
    if (this.dispatcher) {
      this.startScheduler();
    }
  }

  startScheduler() {
    if (this._schedulerTimer) return;
    this._schedulerTimer = setInterval(() => {
      this._evaluateScheduledPrompts();
    }, 45000);
    if (this._schedulerTimer.unref) this._schedulerTimer.unref();
    this._evaluateScheduledPrompts();
  }

  stopScheduler() {
    if (this._schedulerTimer) {
      clearInterval(this._schedulerTimer);
      this._schedulerTimer = null;
    }
  }

  async _evaluateScheduledPrompts() {
    const s = this.getSettings() || {};
    const hSettings = s.habits || (s.waEveningPrompt !== undefined ? s : {});
    if (!this.dispatcher) return;

    const now = new Date();
    const curTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const targetTime = hSettings.waEveningTime || '21:30';
    const today = now.toISOString().slice(0, 10);

    // 1. Daily Evening Briefing Prompt
    if (hSettings.waEveningPrompt) {
      const lastSent = this.store.get('_lastWaEveningSent');
      if (curTime === targetTime && lastSent !== today) {
        this.store.set('_lastWaEveningSent', today);
        const reportLang = hSettings.reportLang || s.reportLang || s.language || 'ar';
        const reportText = this.generateWhatsAppReport('daily', today, reportLang);
        const recipient = (s.whatsapp?.routes?.habitsReports?.useCustom && s.whatsapp?.routes?.habitsReports?.recipient)
          ? s.whatsapp.routes.habitsReports.recipient
          : (hSettings.waRecipientOverride || '');
        try {
          const { WhatsAppDispatcher } = require('./whatsapp');
          const res = await WhatsAppDispatcher.send(s, {
            type: 'habits_evening_prompt',
            text: reportText,
            recipient,
          });
          if (res.ok) {
            this.emit('wa-prompt-sent', { date: today, type: 'daily' });
          }
        } catch (err) {
          console.error('[HabitsManager] Failed to dispatch evening prompt:', err);
        }
      }
    }

    // 2. Individual Habit Specific WhatsApp Reminders
    const habits = (this.store.get('habits') || []).filter(h => !h.archived && h.reminderEnabled && h.reminderTime);
    if (habits.length > 0) {
      const lastHabitReminders = this.store.get('_lastWaHabitReminders') || {};
      for (const h of habits) {
        const reminderKey = `${today}_${h.id}_${h.reminderTime}`;
        if (curTime === h.reminderTime && !lastHabitReminders[reminderKey]) {
          lastHabitReminders[reminderKey] = Date.now();
          this.store.set('_lastWaHabitReminders', lastHabitReminders);

          const streak = this.calculateStreak(h.id);
          const reportLang = hSettings.reportLang || s.reportLang || s.language || 'ar';
          const text = this.buildHabitReminderMessage(h, streak, reportLang);

          const recipient = h.reminderRecipient ||
            (s.whatsapp?.routes?.habitReminders?.useCustom && s.whatsapp?.routes?.habitReminders?.recipient
              ? s.whatsapp.routes.habitReminders.recipient
              : (s.whatsapp?.routes?.habitsReports?.useCustom && s.whatsapp?.routes?.habitsReports?.recipient
                ? s.whatsapp.routes.habitsReports.recipient
                : (hSettings.waRecipientOverride || '')));

          try {
            const { WhatsAppDispatcher } = require('./whatsapp');
            const res = await WhatsAppDispatcher.send(s, {
              type: 'habit_individual_reminder',
              text,
              recipient,
            });
            if (res.ok) {
              this.emit('wa-habit-reminder-sent', { habit: h, date: today, recipient });
            }
          } catch (err) {
            console.error('[HabitsManager] Failed to dispatch habit reminder:', err);
          }
        }
      }
    }
  }

  buildHabitReminderMessage(habit, streak = 0, lang = 'ar') {
    const isEn = lang === 'en';
    const icon = habit.icon || '⭐';
    const title = isEn ? (habit.titleEn || habit.nameEn || habit.title || habit.name || '') : (habit.title || habit.name || habit.titleEn || '');
    let target = '';
    if (habit.type === 'percentage') {
      target = ` (${habit.targetValue || 100}%)`;
    } else if (habit.type === 'rating') {
      target = ` (5 ⭐)`;
    } else if (habit.targetValue && habit.targetValue > 1) {
      target = ` (${habit.targetValue} ${isEn ? (habit.unitEn || habit.unit || '') : (habit.unit || '')})`.trim();
    }
    const streakText = streak > 0
      ? (isEn ? `🔥 *Current Streak:* ${streak} days! Keep the momentum going!` : `🔥 *سلسلة الالتزام:* ${streak} أيام متواصلة! استمر ولا تقطع السلسلة!`)
      : (isEn ? `🌱 *Start your streak today!* Every great journey begins with a single step.` : `🌱 *ابدأ سلسلتك اليوم!* خطوة واحدة تصنع فارقاً عظيماً.`);

    const cueVal = habit.triggerCue || habit.cue;
    const cue = cueVal ? (isEn ? `\n📌 *Anchor:* ${cueVal}` : `\n📌 *المحفّز المرتبط:* ${cueVal}`) : '';
    const custom = habit.reminderCustomText ? (isEn ? `\n💡 _${habit.reminderCustomText}_\n` : `\n💡 _${habit.reminderCustomText}_\n`) : '';

    if (isEn) {
      return `⏰ *[HABIT REMINDER]* ${icon} *${title}*${target}\n\n` +
        `${streakText}` +
        `${cue}` +
        `${custom}\n` +
        `✅ Mark it complete in Mirqat Widgets desktop app!`;
    }
    return `⏰ *[تذكير بموعد العادة]* ${icon} *${title}*${target}\n\n` +
      `${streakText}` +
      `${cue}` +
      `${custom}\n` +
      `✅ سجّلها في ودجة العادات عند إتمامها لتسجيل الإنجاز!`;
  }

  _ensureDefaults() {
    let initialized = this.store.get('_initialized');
    let habits = this.store.get('habits');
    if (!initialized && (!Array.isArray(habits) || habits.length === 0)) {
      this.store.set('habits', DEFAULT_HABITS);
      this.store.set('_initialized', true);
    }
    let logs = this.store.get('logs');
    if (!logs || typeof logs !== 'object') {
      this.store.set('logs', {});
    }
    let gamification = this.store.get('gamification') || {};
    let gChanged = false;
    if (typeof gamification.xp !== 'number') { gamification.xp = 0; gChanged = true; }
    if (typeof gamification.level !== 'number') { gamification.level = 1; gChanged = true; }
    if (typeof gamification.coins !== 'number') { gamification.coins = 0; gChanged = true; }
    if (typeof gamification.vitality !== 'number') { gamification.vitality = 100; gChanged = true; }
    if (!gamification.heroClass) { gamification.heroClass = 'warrior'; gChanged = true; }
    if (typeof gamification.hp !== 'number') { gamification.hp = 100; gChanged = true; }
    if (typeof gamification.maxHp !== 'number') { gamification.maxHp = 100; gChanged = true; }
    if (typeof gamification.streakShields !== 'number') { gamification.streakShields = 0; gChanged = true; }
    if (typeof gamification.mana !== 'number') { gamification.mana = 50; gChanged = true; }
    if (!gamification.stats || typeof gamification.stats !== 'object') {
      gamification.stats = { str: 10, int: 10, con: 10, per: 10 };
      gChanged = true;
    }
    if (!gamification.boss || typeof gamification.boss !== 'object') {
      gamification.boss = {
        id: 'boss-sloth',
        name: 'تنين الخمول والتسويف',
        nameEn: 'Dragon of Sloth',
        hp: 300,
        maxHp: 300,
        icon: '🐲',
        defeated: false,
        bountyCoins: 100,
        bountyXp: 200,
        combatLog: [],
      };
      gChanged = true;
    }
    if (!Array.isArray(gamification.rewards) || gamification.rewards.length === 0) {
      gamification.rewards = [
        { id: 'rew-shield', title: 'درع تجميد السلسلة (Streak Freeze Shield)', titleEn: 'Streak Freeze Shield', cost: 120, icon: '🛡️', isShield: true },
        { id: 'rew-potion', title: 'جرعة شفاء إكسير الحياة (+30 صحة)', titleEn: 'Healing Health Potion (+30 HP)', cost: 40, icon: '🧪', isPotion: true },
        { id: 'rew-elixir', title: 'إكسير التركيز الذهني المضاعف', titleEn: 'Mental Focus Elixir (+XP Boost)', cost: 60, icon: '☕' },
        { id: 'rew-1', title: 'مشاهدة فيلم أو حلقة مسلسل', titleEn: 'Watch a Movie / Episode', cost: 50, icon: '🎬' },
        { id: 'rew-2', title: 'استراحة قهوة في مقهى مميز', titleEn: 'Coffee at a Special Cafe', cost: 100, icon: '☕' },
        { id: 'rew-3', title: 'شراء كتاب أو دورة تعليمية', titleEn: 'Buy a Book or Course', cost: 250, icon: '📚' },
        { id: 'rew-4', title: 'نزهة أو رحلة نهاية الأسبوع', titleEn: 'Weekend Trip / Outing', cost: 500, icon: '🏕️' },
      ];
      gChanged = true;
    }
    if (!Array.isArray(gamification.claimedRewards)) {
      gamification.claimedRewards = [];
      gChanged = true;
    }
    if (gChanged) {
      this.store.set('gamification', gamification);
    }
  }

  /* ==================================================================== *
   * Gamification Engine (Habitica RPG & Self-Regulation Rewards)
   * ==================================================================== */

  getGamification() {
    this._ensureDefaults();
    const g = this.store.get('gamification') || {};
    const level = g.level || 1;
    const xpNeeded = this._xpForNextLevel(level);
    const stats = g.stats || { str: 10, int: 10, con: 10, per: 10 };
    const maxMana = 50 + ((stats.int || 10) * 2);
    const heroClass = g.heroClass || 'warrior';
    return {
      xp: g.xp || 0,
      level,
      coins: g.coins || 0,
      vitality: g.vitality !== undefined ? g.vitality : 100,
      heroClass,
      hp: typeof g.hp === 'number' ? g.hp : 100,
      maxHp: 100,
      mana: typeof g.mana === 'number' ? g.mana : 50,
      maxMana,
      stats,
      boss: this.getBoss(),
      activeSkill: HERO_SKILLS[heroClass] || HERO_SKILLS.warrior,
      availableSkills: Object.values(HERO_SKILLS),
      streakShields: g.streakShields || 0,
      xpNeeded,
      progressPercent: Math.min(100, Math.round(((g.xp || 0) / xpNeeded) * 100)),
      rewards: g.rewards || [],
      claimedRewards: g.claimedRewards || [],
      titleLevel: this._getLevelTitle(level),
    };
  }

  getBoss() {
    this._ensureDefaults();
    const g = this.store.get('gamification') || {};
    return g.boss || {
      id: 'boss-sloth',
      name: 'تنين الخمول والتسويف',
      nameEn: 'Dragon of Sloth',
      hp: 300,
      maxHp: 300,
      icon: '🐲',
      defeated: false,
      bountyCoins: 100,
      bountyXp: 200,
      combatLog: [],
    };
  }

  attackBoss(damage, source = 'habit') {
    this._ensureDefaults();
    const g = { ...(this.store.get('gamification') || {}) };
    let boss = g.boss ? { ...g.boss } : {
      id: 'boss-sloth',
      name: 'تنين الخمول والتسويف',
      nameEn: 'Dragon of Sloth',
      hp: 300,
      maxHp: 300,
      icon: '🐲',
      defeated: false,
      bountyCoins: 100,
      bountyXp: 200,
      combatLog: [],
    };

    const cleanDmg = Math.max(1, Math.round(Number(damage) || 10));
    let newHp = Math.max(0, (boss.hp || boss.maxHp || 300) - cleanDmg);
    let defeated = false;
    let bountyAwarded = null;

    boss.combatLog = Array.isArray(boss.combatLog) ? [...boss.combatLog] : [];
    const timestamp = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    if (newHp <= 0 && !boss.defeated) {
      defeated = true;
      boss.defeated = true;
      newHp = 0;
      const coinsEarned = boss.bountyCoins || 100;
      const xpEarned = boss.bountyXp || 200;
      g.coins = (g.coins || 0) + coinsEarned;
      g.xp = (g.xp || 0) + xpEarned;
      bountyAwarded = { coins: coinsEarned, xp: xpEarned };

      boss.combatLog.unshift({
        time: timestamp,
        text: `⚔️ تم توجيه ضربة بـ ${cleanDmg} ضرر! 💥 تم القضاء على ${boss.name}! وحصلت على ${coinsEarned}🪙 و ${xpEarned} XP!`,
        textEn: `⚔️ Dealt ${cleanDmg} dmg! 💥 ${boss.nameEn} Defeated! Earned +${coinsEarned}🪙 & +${xpEarned} XP!`,
        source,
        defeated: true,
      });

      const roster = BOSS_ROSTER;
      const curIdx = roster.findIndex(b => b.id === boss.id);
      const nextBoss = roster[(curIdx + 1) % roster.length];
      boss = {
        ...nextBoss,
        hp: nextBoss.maxHp,
        defeated: false,
        combatLog: boss.combatLog.slice(0, 20),
      };
    } else {
      boss.hp = newHp;
      boss.combatLog.unshift({
        time: timestamp,
        text: `⚔️ توجيه ${cleanDmg} ضرر للزعيم (${source}) - متبقي ${newHp}/${boss.maxHp} HP`,
        textEn: `⚔️ Dealt ${cleanDmg} dmg (${source}) - ${newHp}/${boss.maxHp} HP remaining`,
        source,
        defeated: false,
      });
      boss.combatLog = boss.combatLog.slice(0, 20);
    }

    g.boss = boss;
    this.store.set('gamification', g);
    const updated = this.getGamification();
    this.emit('gamification-updated', updated);
    return { boss, cleanDmg, damage: cleanDmg, remainingHp: boss.hp, defeated, bountyAwarded, updated };
  }

  castSkill(skillId) {
    this._ensureDefaults();
    const g = { ...(this.store.get('gamification') || {}) };
    const skill = HERO_SKILLS[g.heroClass || 'warrior'];
    const targetSkill = (skill && skill.id === skillId) ? skill : Object.values(HERO_SKILLS).find(s => s.id === skillId);
    if (!targetSkill) throw new Error('Unknown hero skill');

    const curMana = typeof g.mana === 'number' ? g.mana : 50;
    if (curMana < targetSkill.cost) {
      throw new Error(`نقاط الطاقة السحرية (Mana) غير كافية. مطلوب ${targetSkill.cost} MP ولديك ${curMana} MP`);
    }

    g.mana = curMana - targetSkill.cost;
    let effectMessageAr = '';
    let effectMessageEn = '';

    if (targetSkill.id === 'valorous_strike') {
      this.store.set('gamification', g);
      const atkRes = this.attackBoss(50, 'مهارة ضربة الشجاعة ⚔️');
      effectMessageAr = `تم إطلاق ضربة الشجاعة بنجاح! إلحاق 50 ضرر بالزعيم!`;
      effectMessageEn = `Valorous Strike executed! 50 damage dealt to boss!`;
      return { success: true, skill: targetSkill, manaRemaining: g.mana, messageAr: effectMessageAr, messageEn: effectMessageEn, atkRes };
    } else if (targetSkill.id === 'healing_ward') {
      g.streakShields = (g.streakShields || 0) + 1;
      g.hp = Math.min(100, (typeof g.hp === 'number' ? g.hp : 100) + 20);
      effectMessageAr = `تم تفعيل درع العافية: منح +1 درع تجميد السلسلة واستعادة +20 HP!`;
      effectMessageEn = `Healing Ward activated: +1 Streak Freeze Shield & +20 HP restored!`;
    } else if (targetSkill.id === 'double_bounty') {
      g.coins = (g.coins || 0) + 40;
      effectMessageAr = `غنائم ماكرة: تم تحصيل +40 عملة ذهبية فورية!`;
      effectMessageEn = `Plunder success: +40 bonus gold coins!`;
    } else if (targetSkill.id === 'burst_wisdom') {
      this.store.set('gamification', g);
      const xpRes = this.addXp(50, 5);
      effectMessageAr = `تفجر الحكمة: اكتساب +50 XP فوري!`;
      effectMessageEn = `Burst of Wisdom: +50 instant XP gained!`;
      return { success: true, skill: targetSkill, manaRemaining: g.mana, messageAr: effectMessageAr, messageEn: effectMessageEn, xpRes };
    } else if (targetSkill.id === 'deep_focus') {
      g.stats = g.stats || { str: 10, int: 10, con: 10, per: 10 };
      g.stats.int = (g.stats.int || 10) + 2;
      effectMessageAr = `تركيز فكري عميق: زيادة دائمة +2 في سمة الذكاء (INT)!`;
      effectMessageEn = `Deep focus achieved: +2 permanent INT stat boost!`;
    } else if (targetSkill.id === 'inner_calm') {
      g.hp = 100;
      g.stats = g.stats || { str: 10, int: 10, con: 10, per: 10 };
      g.stats.con = (g.stats.con || 10) + 2;
      effectMessageAr = `سكينة النفس: استعادة كاملة لصحة البطل (100 HP) وزيادة +2 في البنية (CON)!`;
      effectMessageEn = `Inner calm restored: Full HP recovery & +2 permanent CON stat!`;
    } else if (targetSkill.id === 'fortify_routine') {
      g.stats = g.stats || { str: 10, int: 10, con: 10, per: 10 };
      g.stats.str = (g.stats.str || 10) + 1;
      g.stats.int = (g.stats.int || 10) + 1;
      g.stats.con = (g.stats.con || 10) + 1;
      g.stats.per = (g.stats.per || 10) + 1;
      effectMessageAr = `تدعيم الأساس: ترقية جميع سمات البطل الأربع (+1 لكل سمة)!`;
      effectMessageEn = `Foundation fortified: +1 to all 4 hero stats (STR, INT, CON, PER)!`;
    }

    this.store.set('gamification', g);
    const updated = this.getGamification();
    this.emit('gamification-updated', updated);
    return { success: true, skill: targetSkill, manaRemaining: g.mana, messageAr: effectMessageAr, messageEn: effectMessageEn, updated };
  }

  setHeroClass(heroClass) {
    this._ensureDefaults();
    const valid = ['warrior', 'healer', 'rogue', 'mage', 'scholar', 'monk', 'architect'];
    if (!valid.includes(heroClass)) return false;
    const g = { ...(this.store.get('gamification') || {}) };
    g.heroClass = heroClass;
    this.store.set('gamification', g);
    const updated = this.getGamification();
    this.emit('gamification-updated', updated);
    return updated;
  }

  getQuests() {
    this._ensureDefaults();
    const g = this.store.get('gamification') || {};
    const today = new Date().toISOString().slice(0, 10);
    const dayLog = this.getLog(today);
    const habits = this.getHabits(false);
    const claimedToday = (g.claimedQuests && g.claimedQuests[today]) || {};

    const morningHabits = habits.filter(h => h.routine === 'morning');
    let morningDone = 0;
    morningHabits.forEach(h => {
      const hl = dayLog.habits && dayLog.habits[h.id];
      if (hl && (hl.status === 'done' || hl.status === 'skip')) morningDone++;
    });
    const morningCompleted = morningHabits.length > 0 && morningDone >= morningHabits.length;

    const sleepLogged = dayLog.sleep && Number(dayLog.sleep.durationHours) >= 7;

    let m = false, a = false, e = false;
    habits.forEach(h => {
      const hl = dayLog.habits && dayLog.habits[h.id];
      if (hl && hl.status === 'done') {
        if (h.routine === 'morning') m = true;
        else if (h.routine === 'afternoon') a = true;
        else if (h.routine === 'evening') e = true;
      }
    });
    const tripleCompleted = m && a && e;

    let maxStreak = 0;
    habits.forEach(h => {
      const strk = this.calculateStreak(h.id);
      if (strk && strk.current > maxStreak) maxStreak = strk.current;
    });
    const streakCompleted = maxStreak >= 5;

    return [
      {
        id: 'quest-morning',
        title: 'إتقان روتين الصباح',
        titleEn: 'Morning Routine Mastery',
        desc: 'أكمل جميع عاداتك الصباحية المجدولة لليوم',
        descEn: 'Complete all morning habits scheduled for today',
        xpReward: 50,
        coinsReward: 10,
        completed: morningCompleted,
        claimed: Boolean(claimedToday['quest-morning']),
        icon: '🌅',
      },
      {
        id: 'quest-sleep',
        title: 'حارس النوم الصحي (7+ ساعات)',
        titleEn: 'Deep Sleep Guardian (7+ hrs)',
        desc: 'سجّل نومك الليلة الماضية بما لا يقل عن 7 ساعات',
        descEn: 'Log at least 7 hours of restorative sleep',
        xpReward: 40,
        coinsReward: 10,
        completed: Boolean(sleepLogged),
        claimed: Boolean(claimedToday['quest-sleep']),
        icon: '🌙',
      },
      {
        id: 'quest-triple',
        title: 'التناغم اليومي الكامل (صباح، ظهر، مساء)',
        titleEn: 'Triple Routine Harmony',
        desc: 'أنجز عادة واحدة على الأقل في الصباح، بعد الظهر، والمساء',
        descEn: 'Complete at least 1 habit in morning, afternoon, and evening',
        xpReward: 60,
        coinsReward: 15,
        completed: tripleCompleted,
        claimed: Boolean(claimedToday['quest-triple']),
        icon: '⚡',
      },
      {
        id: 'quest-streak',
        title: 'بطل الاستمرارية (سلسلة 5+ أيام)',
        titleEn: 'Streak Champion (5+ Days)',
        desc: 'حافظ على استمرارية 5 أيام متتالية في أي عادة',
        descEn: 'Reach or maintain a 5+ day streak on any habit',
        xpReward: 80,
        coinsReward: 20,
        completed: streakCompleted,
        claimed: Boolean(claimedToday['quest-streak']),
        icon: '🏆',
      },
    ];
  }

  claimQuest(questId) {
    this._ensureDefaults();
    const quests = this.getQuests();
    const quest = quests.find(q => q.id === questId);
    if (!quest) throw new Error('Quest not found');
    if (!quest.completed) throw new Error('Quest not yet completed');
    if (quest.claimed) throw new Error('Quest already claimed today');

    const today = new Date().toISOString().slice(0, 10);
    const g = { ...(this.store.get('gamification') || {}) };
    g.claimedQuests = { ...(g.claimedQuests || {}) };
    g.claimedQuests[today] = { ...(g.claimedQuests[today] || {}) };
    g.claimedQuests[today][questId] = true;

    this.store.set('gamification', g);
    const xpRes = this.addXp(quest.xpReward, quest.coinsReward);
    const updated = this.getGamification();
    this.emit('gamification-updated', updated);
    return { success: true, quest, updated, xpRes };
  }

  modifyHp(delta) {
    this._ensureDefaults();
    const g = { ...(this.store.get('gamification') || {}) };
    let curHp = typeof g.hp === 'number' ? g.hp : 100;
    curHp = Math.min(100, Math.max(0, curHp + delta));
    let fainted = false;
    if (curHp <= 0) {
      fainted = true;
      curHp = 50;
      g.coins = Math.max(0, (g.coins || 0) - 20);
    }
    g.hp = curHp;
    this.store.set('gamification', g);
    const updated = this.getGamification();
    this.emit('gamification-updated', updated);
    return { hp: curHp, fainted, updated };
  }

  _xpForNextLevel(level) {
    return Math.round(100 * Math.pow(level, 1.25));
  }

  _getLevelTitle(level) {
    if (level < 3) return { ar: 'مبتدئ واعد', en: 'Promising Novice' };
    if (level < 6) return { ar: 'صاحب إرادة', en: 'Disciplined Mind' };
    if (level < 10) return { ar: 'محارب عادات', en: 'Habit Warrior' };
    if (level < 15) return { ar: 'أستاذ الانضباط', en: 'Master of Routine' };
    if (level < 25) return { ar: 'خبير العافية', en: 'Wellness Virtuoso' };
    return { ar: 'أسطورة التركيز والإنتاجية', en: 'Legendary Achiever' };
  }

  addXp(amount, coinsEarned = 0) {
    this._ensureDefaults();
    const g = { ...(this.store.get('gamification') || {}) };
    let xp = (g.xp || 0) + Number(amount);
    let level = g.level || 1;
    let coins = (g.coins || 0) + Number(coinsEarned);
    let leveledUp = false;

    if (amount > 0) {
      let xpNeeded = this._xpForNextLevel(level);
      while (xp >= xpNeeded) {
        xp -= xpNeeded;
        level += 1;
        coins += 50; // Bonus gold on level up!
        leveledUp = true;
        xpNeeded = this._xpForNextLevel(level);
      }
    } else if (amount < 0 && xp < 0 && level > 1) {
      level -= 1;
      const prevXpNeeded = this._xpForNextLevel(level);
      xp = Math.max(0, prevXpNeeded + xp);
      coins = Math.max(0, coins - 50);
    }

    g.xp = Math.max(0, xp);
    g.level = Math.max(1, level);
    g.coins = Math.max(0, coins);

    this.store.set('gamification', g);
    const xpNeeded = this._xpForNextLevel(g.level);
    const result = {
      xp: g.xp,
      level: g.level,
      coins: g.coins,
      vitality: g.vitality !== undefined ? g.vitality : 100,
      heroClass: g.heroClass || 'warrior',
      hp: typeof g.hp === 'number' ? g.hp : 100,
      maxHp: 100,
      streakShields: g.streakShields || 0,
      leveledUp,
      xpNeeded,
      progressPercent: Math.min(100, Math.round((g.xp / xpNeeded) * 100)),
      titleLevel: this._getLevelTitle(g.level),
      rewards: g.rewards || [],
      claimedRewards: g.claimedRewards || [],
    };
    this.emit('gamification-updated', result);
    return result;
  }

  claimReward(rewardId) {
    this._ensureDefaults();
    const g = { ...(this.store.get('gamification') || {}) };
    const rewards = g.rewards || [];
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) throw new Error('Reward not found');
    if ((g.coins || 0) < reward.cost) {
      throw new Error('Not enough coins');
    }

    g.coins = Math.max(0, (g.coins || 0) - reward.cost);
    if (reward.isShield || reward.id === 'rew-shield') {
      g.streakShields = (g.streakShields || 0) + 1;
    }
    if (reward.isPotion || reward.id === 'rew-potion') {
      g.hp = Math.min(100, (typeof g.hp === 'number' ? g.hp : 100) + 30);
    }
    g.claimedRewards = [...(g.claimedRewards || [])];
    const claimRecord = {
      id: `clm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      rewardId: reward.id,
      title: reward.title,
      titleEn: reward.titleEn,
      cost: reward.cost,
      icon: reward.icon,
      claimedAt: new Date().toISOString(),
    };
    g.claimedRewards.unshift(claimRecord);

    this.store.set('gamification', g);
    const updated = this.getGamification();
    this.emit('gamification-updated', updated);
    return { success: true, reward, claimRecord, remainingCoins: g.coins };
  }

  saveReward(rewardData) {
    this._ensureDefaults();
    const g = { ...(this.store.get('gamification') || {}) };
    g.rewards = [...(g.rewards || [])];
    const id = rewardData.id || `rew-${Date.now()}`;
    const reward = {
      id,
      title: (rewardData.title || 'مكافأة خاصة').trim(),
      titleEn: (rewardData.titleEn || rewardData.title || 'Special Reward').trim(),
      cost: Math.max(10, Number(rewardData.cost) || 50),
      icon: rewardData.icon || '🎁',
      isShield: Boolean(rewardData.isShield),
    };
    const idx = g.rewards.findIndex(r => r.id === id);
    if (idx >= 0) {
      g.rewards[idx] = reward;
    } else {
      g.rewards.push(reward);
    }
    this.store.set('gamification', g);
    const updated = this.getGamification();
    this.emit('gamification-updated', updated);
    return reward;
  }

  deleteReward(id) {
    this._ensureDefaults();
    const g = { ...(this.store.get('gamification') || {}) };
    g.rewards = (g.rewards || []).filter(r => r.id !== id);
    this.store.set('gamification', g);
    const updated = this.getGamification();
    this.emit('gamification-updated', updated);
    return true;
  }

  /**
   * Generates Loop Habit Tracker style detailed analytics for a single habit
   * @param {string} habitId
   * @param {number} daysCount
   */
  getHabitHistory(habitId, daysCount = 90) {
    const habit = this.getHabit(habitId);
    if (!habit) return null;
    const logs = this.getAllLogs();
    const streak = this.calculateStreak(habitId);
    const strength = this.calculateHabitStrength(habitId);

    const today = new Date();
    const cells = [];
    let completedCount = 0;
    let scheduledCount = 0;
    const notesHistory = [];

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = getLocalDateStr(d);
      const dLog = logs[dateStr];
      const scheduled = this.isHabitScheduledForDate(habit, d);
      const hEntry = (dLog && dLog.habits && dLog.habits[habitId]) || null;
      let status = 'none'; // 'done', 'skip', 'partial', 'none'
      let value = 0;

      if (hEntry) {
        status = hEntry.status || 'none';
        value = hEntry.value || 0;
        if (hEntry.note && hEntry.note.trim()) {
          notesHistory.push({ date: dateStr, note: hEntry.note.trim() });
        }
      }

      if (scheduled && status !== 'skip') {
        scheduledCount++;
        if (status === 'done') completedCount++;
        else if (status === 'partial') completedCount += Math.min(1, (value || 0) / (habit.targetValue || 1));
      }

      cells.push({
        date: dateStr,
        dayOfWeek: d.getDay(),
        scheduled,
        status,
        value,
      });
    }

    const completionRate = scheduledCount > 0 ? Math.round((completedCount / scheduledCount) * 100) : 0;

    return {
      habit,
      streak,
      strength,
      scheduledCount,
      completedCount: Math.round(completedCount),
      completionRate,
      cells,
      notesHistory: notesHistory.slice(0, 10),
    };
  }

  /* ==================================================================== *
   * Habits CRUD & Metadata
   * ==================================================================== */

  getHabits(includeArchived = false) {
    const list = this.store.get('habits') || [];
    return includeArchived ? list : list.filter(h => !h.archived);
  }

  getHabit(id) {
    const list = this.store.get('habits') || [];
    return list.find(h => h.id === id) || null;
  }

  saveHabit(data) {
    const list = [...(this.store.get('habits') || [])];
    const id = data.id || `hbt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const idx = list.findIndex(h => h.id === id);
    const existing = idx >= 0 ? list[idx] : null;

    const type = ['boolean', 'number', 'duration', 'percentage', 'rating'].includes(data.type) ? data.type : 'boolean';
    let targetValue = Number(data.targetValue) || 1;
    let unit = (data.unit || '').trim();
    let unitEn = (data.unitEn || data.unit || '').trim();

    if (type === 'boolean') {
      targetValue = 1;
      unit = '';
      unitEn = '';
    } else if (type === 'percentage') {
      targetValue = Math.min(100, Math.max(1, targetValue || 100));
      unit = '%';
      unitEn = '%';
    } else if (type === 'rating') {
      targetValue = 5;
      unit = '⭐';
      unitEn = '⭐';
    } else if (type === 'duration') {
      targetValue = Math.max(1, targetValue);
      if (!unit) { unit = 'دقيقة'; unitEn = 'min'; }
    } else if (type === 'number') {
      targetValue = Math.max(1, targetValue);
      if (!unit) { unit = 'مرة'; unitEn = 'times'; }
    }

    const habit = {
      id,
      title: (data.title || 'عادة جديدة').trim(),
      titleEn: (data.titleEn || data.title || 'New Habit').trim(),
      category: data.category || 'general',
      routine: data.routine || 'anytime', // morning, afternoon, evening, anytime
      type, // boolean, number, duration, percentage, rating
      direction: data.direction === 'negative' ? 'negative' : 'positive', // positive (build) or negative (quit bad habit)
      difficulty: ['trivial', 'easy', 'medium', 'hard'].includes(data.difficulty) ? data.difficulty : 'easy',
      targetValue,
      unit,
      unitEn,
      frequency: data.frequency || { type: 'daily' }, // daily, weekly_target, specific_days, every_x_days
      enablePomodoro: Boolean(data.enablePomodoro),
      syncToTodo: Boolean(data.syncToTodo),
      todoPriority: data.todoPriority !== undefined ? Number(data.todoPriority) : 1,
      syncToCalendar: Boolean(data.syncToCalendar),
      calendarTime: data.calendarTime || '',
      calendarDuration: Number(data.calendarDuration) || 30,
      reminderTime: data.reminderTime || '',
      reminderEnabled: Boolean(data.reminderEnabled),
      reminderRecipient: (data.reminderRecipient || '').trim(),
      reminderCustomText: (data.reminderCustomText || '').trim(),
      triggerCue: (data.triggerCue || '').trim(),
      notes: (data.notes || '').trim(),
      targetGoalStreak: Number(data.targetGoalStreak) || 30,
      pomodoroSessions: Number(data.pomodoroSessions) || 1,
      color: data.color || '#3b82f6',
      icon: data.icon || '⭐',
      // OpenHabitTracker / Habitica / Loop features
      subItems: Array.isArray(data.subItems) ? data.subItems : (existing && Array.isArray(existing.subItems) ? existing.subItems : []),
      timerMode: Boolean(data.timerMode || data.type === 'duration'),
      attributeAffinity: data.attributeAffinity || '',
      createdAt: data.createdAt || (existing ? existing.createdAt : new Date().toISOString()),
      archived: Boolean(data.archived),
    };

    if (idx >= 0) {
      list[idx] = habit;
    } else {
      list.push(habit);
    }

    this.store.set('habits', list);
    this.emit('habits-changed', list);
    return habit;
  }

  deleteHabit(id) {
    const list = (this.store.get('habits') || []).filter(h => h.id !== id);
    this.store.set('habits', list);
    this.emit('habits-changed', list);
    return true;
  }

  archiveHabit(id, archived = true) {
    const list = [...(this.store.get('habits') || [])];
    const habit = list.find(h => h.id === id);
    if (habit) {
      habit.archived = Boolean(archived);
      this.store.set('habits', list);
      this.emit('habits-changed', list);
      return true;
    }
    return false;
  }

  reorderHabits(orderIds) {
    if (!Array.isArray(orderIds)) return;
    const list = this.store.get('habits') || [];
    const map = new Map(list.map(h => [h.id, h]));
    const reordered = [];
    for (const id of orderIds) {
      if (map.has(id)) {
        reordered.push(map.get(id));
        map.delete(id);
      }
    }
    for (const remaining of map.values()) {
      reordered.push(remaining);
    }
    this.store.set('habits', reordered);
    this.emit('habits-changed', reordered);
  }

  /* ==================================================================== *
   * Day Logs & Flexible Inputs (Habit Status, Sleep, Mood, Stress)
   * ==================================================================== */

  getLog(dateStr) {
    const logs = this.store.get('logs') || {};
    return logs[dateStr] || { habits: {}, sleep: null, mood: null, stress: null, screenTime: null, dailyNote: '' };
  }

  getAllLogs() {
    return this.store.get('logs') || {};
  }

  /**
   * Save status of a specific habit for a date.
   * Status can be:
   * - 'done': completed / checked
   * - 'skip': exempted day (sickness, vacation, rest day) -> does NOT break streak or penalize consistency
   * - 'fail': missed day
   * - 'partial': partially completed (stores value)
   * - 'none': reset / unlogged
   */
  saveHabitStatus(dateStr, habitId, status, value = null, note = '', isMicroStep = false) {
    const todayStr = getSafeTodayStr();
    if (dateStr > todayStr) {
      throw new Error('Cannot log habits for future dates');
    }
    const logs = { ...(this.store.get('logs') || {}) };
    const day = logs[dateStr] ? { ...logs[dateStr] } : { habits: {} };
    day.habits = { ...(day.habits || {}) };

    const prevEntry = day.habits[habitId];
    const prevStatus = prevEntry ? prevEntry.status : 'none';

    let gamificationDelta = null;
    const habit = this.getHabit(habitId);

    if (habit) {
      const difficultyXpMap = { trivial: 10, easy: 20, medium: 40, hard: 80 };
      const difficultyCoinsMap = { trivial: 2, easy: 4, medium: 8, hard: 16 };
      let baseXp = difficultyXpMap[habit.difficulty] || 20;
      let baseCoins = difficultyCoinsMap[habit.difficulty] || 4;

      if (habit.direction === 'negative') {
        baseXp += 5; // Extra resilience bonus for resisting a bad habit
        baseCoins += 1;
      }

      if (isMicroStep) {
        baseXp = Math.max(5, Math.round(baseXp * 0.5));
        baseCoins = Math.max(1, Math.round(baseCoins * 0.4));
      }

      // If transitioning to done from not-done
      if (status === 'done' && prevStatus !== 'done') {
        const res = this.addXp(baseXp, baseCoins);
        gamificationDelta = {
          xpEarned: baseXp,
          coinsEarned: baseCoins,
          leveledUp: res.leveledUp,
          currentLevel: res.level,
          currentCoins: res.coins,
          direction: habit.direction,
        };

        // Attribute Affinity progression (Habitica 4 Core Stats)
        const g = { ...(this.store.get('gamification') || {}) };
        g.stats = g.stats || { str: 10, int: 10, con: 10, per: 10 };
        const cat = habit.category || 'general';
        let statKey = habit.attributeAffinity || 'per';
        if (!habit.attributeAffinity) {
          if (cat === 'health') statKey = 'str';
          else if (cat === 'learning') statKey = 'int';
          else if (cat === 'routine' || cat === 'mind') statKey = 'con';
        }
        g.stats[statKey] = Number(((g.stats[statKey] || 10) + 0.2).toFixed(1));

        // Mana Recovery (+5 to +10 MP scaled by INT)
        const maxMana = 50 + ((g.stats.int || 10) * 2);
        const manaGain = 5 + Math.round((g.stats.int || 10) * 0.2);
        g.mana = Math.min(maxMana, (g.mana !== undefined ? g.mana : 50) + manaGain);
        this.store.set('gamification', g);

        // Weekly Boss Battle Engine attack
        let bossDmg = 15 + Math.round((g.stats.str || 10) * 0.5);
        if (habit.difficulty === 'hard') bossDmg += 10;
        else if (habit.difficulty === 'medium') bossDmg += 5;
        const atkRes = this.attackBoss(bossDmg, habit.title);
        gamificationDelta.bossDamage = bossDmg;
        gamificationDelta.bossDefeated = atkRes.defeated;
        gamificationDelta.manaGain = manaGain;
      } else if (prevStatus === 'done' && status !== 'done') {
        // User unchecked or changed from done -> reverse XP & coins gracefully
        const res = this.addXp(-baseXp, -baseCoins);
        gamificationDelta = {
          xpEarned: -baseXp,
          coinsEarned: -baseCoins,
          currentLevel: res.level,
          currentCoins: res.coins,
        };
      }
    }

    if (!status || status === 'none') {
      delete day.habits[habitId];
    } else {
      const prevSubItems = prevEntry && prevEntry.subItems ? prevEntry.subItems : null;
      const fullTarget = Number(habit?.targetValue) || (habit?.type === 'percentage' ? 100 : 1);
      let finalVal = value !== null && value !== undefined ? Number(value) : null;
      if (finalVal === null) {
        if (status === 'done') finalVal = fullTarget;
        else if (status === 'partial') finalVal = habit?.type === 'boolean' ? 1 : Math.max(1, Math.round(fullTarget / 2));
        else finalVal = 0;
      } else if (status === 'done' && habit && habit.type !== 'boolean' && finalVal === 1 && fullTarget > 1) {
        // Guard: If caller signaled status: 'done' with hardcoded value 1 for multi-target habit, honor done by setting full target
        finalVal = fullTarget;
      }
      day.habits[habitId] = {
        status, // 'done' | 'skip' | 'fail' | 'partial'
        value: finalVal,
        note: (note || '').trim(),
        isMicroStep: Boolean(isMicroStep),
        subItems: prevSubItems,
        updatedAt: new Date().toISOString(),
      };
    }

    logs[dateStr] = day;
    this.store.set('logs', logs);
    if (gamificationDelta) {
      day.gamificationDelta = gamificationDelta;
    }
    this.emit('log-changed', {
      date: dateStr,
      dateStr,
      habitId,
      status,
      isMicroStep: Boolean(isMicroStep),
      day,
      gamificationDelta,
    });
    return day;
  }

  saveHabitSubItems(dateStr, habitId, subItems) {
    const todayStr = getSafeTodayStr();
    if (dateStr > todayStr) {
      throw new Error('Cannot log sub-items for future dates');
    }
    const habit = this.getHabit(habitId);
    if (!habit) throw new Error('Habit not found');

    const cleanItems = Array.isArray(subItems) ? subItems : [];
    const completedCount = cleanItems.filter(i => Boolean(i.completed || i.done)).length;
    const totalCount = cleanItems.length;

    let targetStatus = 'none';
    let targetValue = 0;

    if (totalCount > 0) {
      if (completedCount === totalCount) {
        targetStatus = 'done';
        targetValue = habit.targetValue || 1;
      } else if (completedCount > 0) {
        targetStatus = 'partial';
        targetValue = completedCount;
      } else {
        targetStatus = 'none';
        targetValue = 0;
      }
    }

    const updatedDay = this.saveHabitStatus(dateStr, habitId, targetStatus, targetValue);
    const logs = { ...(this.store.get('logs') || {}) };
    if (logs[dateStr] && logs[dateStr].habits && logs[dateStr].habits[habitId]) {
      logs[dateStr].habits[habitId].subItems = cleanItems;
      this.store.set('logs', logs);
      this.emit('log-changed', { date: dateStr, day: logs[dateStr] });
    }
    const ratio = totalCount > 0 ? (completedCount / totalCount) : 0;
    return { ok: true, success: true, status: targetStatus, ratio, completedCount, totalCount, subItems: cleanItems };
  }

  saveSleepLog(dateStr, sleepData = {}) {
    const todayStr = getSafeTodayStr();
    if (dateStr > todayStr) {
      throw new Error('Cannot log sleep for future dates');
    }
    const logs = { ...(this.store.get('logs') || {}) };
    const day = logs[dateStr] ? { ...logs[dateStr] } : { habits: {} };
    const dur = typeof sleepData === 'number'
      ? sleepData
      : (Number(sleepData?.durationHours ?? sleepData?.hours) || 0);
    day.sleep = {
      durationHours: dur,
      bedtime: (typeof sleepData === 'object' && sleepData?.bedtime) || '', // e.g. "23:30"
      wakeTime: (typeof sleepData === 'object' && sleepData?.wakeTime) || '', // e.g. "07:30"
      quality: (typeof sleepData === 'object' && Number(sleepData?.quality)) || 3, // 1-5
      naps: (typeof sleepData === 'object' && Number(sleepData?.naps)) || 0, // hours
      updatedAt: new Date().toISOString(),
    };
    logs[dateStr] = day;
    this.store.set('logs', logs);
    this.emit('log-changed', { date: dateStr, day });
    return day;
  }

  saveMoodLog(dateStr, moodData = {}) {
    const todayStr = getSafeTodayStr();
    if (dateStr > todayStr) {
      throw new Error('Cannot log mood for future dates');
    }
    const logs = { ...(this.store.get('logs') || {}) };
    const day = logs[dateStr] ? { ...logs[dateStr] } : { habits: {} };
    const rating = typeof moodData === 'number'
      ? moodData
      : (Number(moodData?.rating ?? moodData?.mood) || 3);
    day.mood = {
      rating, // 1-5 or 1-10
      scale: (typeof moodData === 'object' && moodData?.scale) || 5,
      note: (typeof moodData === 'object' ? (moodData?.note || '').trim() : ''),
      updatedAt: new Date().toISOString(),
    };
    logs[dateStr] = day;
    this.store.set('logs', logs);
    this.emit('log-changed', { date: dateStr, day });
    return day;
  }

  saveStressLog(dateStr, level, screenHours = null) {
    const todayStr = getSafeTodayStr();
    if (dateStr > todayStr) {
      throw new Error('Cannot log stress for future dates');
    }
    const logs = { ...(this.store.get('logs') || {}) };
    const day = logs[dateStr] ? { ...logs[dateStr] } : { habits: {} };
    day.stress = { level: Number(level) || 0 };
    if (screenHours !== null) {
      day.screenTime = { hours: Number(screenHours) || 0 };
    }
    logs[dateStr] = day;
    this.store.set('logs', logs);
    this.emit('log-changed', { date: dateStr, day });
    return day;
  }

  saveDayLog(dateStr, fullData) {
    const todayStr = getSafeTodayStr();
    if (dateStr > todayStr) {
      throw new Error('Cannot log day for future dates');
    }
    const logs = { ...(this.store.get('logs') || {}) };
    logs[dateStr] = {
      habits: fullData.habits || {},
      sleep: fullData.sleep || null,
      mood: fullData.mood || null,
      stress: fullData.stress || null,
      screenTime: fullData.screenTime || null,
      dailyNote: fullData.dailyNote || '',
      updatedAt: new Date().toISOString(),
    };
    this.store.set('logs', logs);
    this.emit('log-changed', { date: dateStr, day: logs[dateStr] });
    return logs[dateStr];
  }

  saveDayNote(dateStr, note) {
    const todayStr = getSafeTodayStr();
    if (dateStr > todayStr) {
      throw new Error('Cannot log notes for future dates');
    }
    const logs = { ...(this.store.get('logs') || {}) };
    const day = logs[dateStr] ? { ...logs[dateStr] } : { habits: {} };
    day.dailyNote = (note || '').trim();
    day.updatedAt = new Date().toISOString();
    logs[dateStr] = day;
    this.store.set('logs', logs);
    this.emit('log-changed', { date: dateStr, day });
    return day.dailyNote;
  }

  getDayNote(dateStr) {
    const log = this.getLog(dateStr);
    return log.dailyNote || '';
  }

  /**
   * Generates color-coded 5-level GitHub-style activity contribution matrix
   * Inspired by HabitFlow (0: None, 1: 1-25%, 2: 26-50%, 3: 51-75%, 4: 76-100%)
   */
  getActivityHeatmap(daysCount = 90, habitIdFilter = null) {
    const logs = this.getAllLogs();
    let habits = this.getHabits(false);
    if (habitIdFilter && habitIdFilter !== 'all') {
      habits = habits.filter(h => h.id === habitIdFilter);
    }
    const cells = [];
    const today = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = getLocalDateStr(d);
      const dayLog = logs[dateStr] || { habits: {} };

      let scheduled = 0;
      let completed = 0;

      for (const h of habits) {
        if (!this.isHabitScheduledForDate(h, d)) continue;
        const entry = dayLog.habits && dayLog.habits[h.id];
        if (entry && entry.status === 'skip') continue; // Excluded from denominator

        scheduled++;
        if (entry && entry.status === 'done') {
          completed++;
        } else if (entry && entry.status === 'partial') {
          const ratio = (entry.value || 0) / (h.targetValue || 1);
          if (ratio >= 0.5) completed += 0.5;
        }
      }

      const rate = scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0;
      let level = 0;
      if (rate > 75) level = 4;
      else if (rate > 50) level = 3;
      else if (rate > 25) level = 2;
      else if (rate > 0) level = 1;

      cells.push({
        date: dateStr,
        dayOfWeek: d.getDay(),
        scheduled,
        completed,
        rate,
        level,
        dailyNote: dayLog.dailyNote || '',
      });
    }

    return cells;
  }

  /* ==================================================================== *
   * Multi-Timeframe Habit Schedule Check
   * ==================================================================== */

  /**
   * Determines if a habit is scheduled for a specific date based on its frequency.
   * Supports: daily, specific_days, weekly_target, and every_x_days (from Loop Habit Tracker)
   */
  isHabitScheduledForDate(habit, dateObj) {
    if (!habit || habit.archived) return false;
    const freq = habit.frequency || { type: 'daily' };
    if (freq.type === 'daily') return true;

    if (freq.type === 'specific_days') {
      const dayOfWeek = dateObj.getDay(); // 0 is Sunday
      return Array.isArray(freq.daysOfWeek) && freq.daysOfWeek.includes(dayOfWeek);
    }

    if (freq.type === 'weekly_target') {
      // Weekly targets apply across the week
      return true;
    }

    if (freq.type === 'every_x_days') {
      const interval = Math.max(1, Number(freq.interval) || 2);
      const start = new Date(habit.createdAt || '2026-01-01');
      start.setHours(0, 0, 0, 0);
      const target = new Date(dateObj);
      target.setHours(0, 0, 0, 0);
      const diffDays = Math.round((target.getTime() - start.getTime()) / 86400000);
      return (Math.abs(diffDays) % interval === 0);
    }

    return true;
  }

  /* ==================================================================== *
   * Mathematical KPI, Streaks & Correlation Engine
   * ==================================================================== */

  /**
   * Daily Wellness Index (DWI) - Composite score (0 to 100)
   * Formula:
   * - Habit Completion: 45% weight (done / scheduled_active, excluding skipped)
   * - Sleep Duration & Quality: 35% weight (target sleep hours vs actual)
   * - Mood Score: 20% weight (mapped 0-100%)
   */
  calculateDailyWellnessIndex(dateStr) {
    const log = this.getLog(dateStr);
    const dateObj = new Date(dateStr);
    const habits = this.getHabits(false);

    let scheduledCount = 0;
    let completedPoints = 0;

    for (const h of habits) {
      if (!this.isHabitScheduledForDate(h, dateObj)) continue;
      const hLog = (log.habits && log.habits[h.id]) || null;
      if (!hLog) {
        scheduledCount++;
        continue;
      }
      if (hLog.status === 'skip') {
        // Excluded from denominator - does not hurt index
        continue;
      }
      scheduledCount++;
      if (hLog.status === 'done') {
        completedPoints += 1;
      } else if (hLog.status === 'partial') {
        const val = Number(hLog.value) || 0;
        const target = Number(h.targetValue) || 1;
        completedPoints += Math.min(1, Math.max(0, val / target));
      }
    }

    const habitScore = scheduledCount > 0 ? (completedPoints / scheduledCount) * 100 : 80;

    // Sleep Score
    let sleepScore = null;
    if (log.sleep && log.sleep.durationHours > 0) {
      const target = Number(this.getSettings().habitSleepTargetHours) || 8.0;
      const diff = Math.abs(log.sleep.durationHours - target);
      // Perfect within 0.5h of target
      if (diff <= 0.5) {
        sleepScore = 100;
      } else if (diff <= 1.5) {
        sleepScore = 85;
      } else if (diff <= 2.5) {
        sleepScore = 70;
      } else {
        sleepScore = Math.max(30, 100 - (diff * 20));
      }
      if (log.sleep.quality) {
        const qBonus = (log.sleep.quality - 3) * 5;
        sleepScore = Math.min(100, Math.max(20, sleepScore + qBonus));
      }
    }

    // Mood Score
    let moodScore = null;
    if (log.mood && log.mood.rating > 0) {
      const scale = log.mood.scale || 5;
      moodScore = (log.mood.rating / scale) * 100;
    }

    // Dynamic Weighted Combination
    let totalScore = 0;
    let totalWeight = 0;

    totalScore += habitScore * 0.45;
    totalWeight += 0.45;

    if (sleepScore !== null) {
      totalScore += sleepScore * 0.35;
      totalWeight += 0.35;
    }

    if (moodScore !== null) {
      totalScore += moodScore * 0.20;
      totalWeight += 0.20;
    }

    const dwi = Math.round(totalScore / totalWeight);
    return Math.min(100, Math.max(0, dwi));
  }

  /**
   * Habit Strength Calculation (Loop Habit Tracker Frequency-Aware EMA)
   * Formula:
   * Half-life tau = 21 days, decay lambda = ln(2) / 21
   * S_t = S_{t-1} * e^(-lambda) + (completionRatio * 100) * (1 - e^(-lambda))
   * If status is 'skip', score does not decay at all (streak & consistency preserved).
   */
  calculateHabitStrength(habitId, daysHistory = 30) {
    const logs = this.getAllLogs();
    const habit = this.getHabit(habitId);
    if (!habit) return 0;

    const today = new Date();
    let score = 0;
    const alpha = 0.88; // Loop Habit Tracker responsive smoothing factor
    const decayFactor = alpha;

    // Normalize target frequency multiplier so weekly habits aren't unfairly penalized
    const freq = habit.frequency || { type: 'daily' };
    let expectedFreqMultiplier = 1.0;
    if (freq.type === 'weekly_target') {
      expectedFreqMultiplier = Math.min(1.4, 7 / Math.max(1, Number(freq.targetDaysPerWeek) || 4));
    } else if (freq.type === 'specific_days') {
      expectedFreqMultiplier = Math.min(1.4, 7 / Math.max(1, (freq.daysOfWeek || []).length));
    } else if (freq.type === 'every_x_days') {
      expectedFreqMultiplier = Math.min(1.4, Math.max(1, Number(freq.interval) || 2));
    }

    for (let i = daysHistory; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = getLocalDateStr(d);

      if (!this.isHabitScheduledForDate(habit, d)) continue;

      const dayLog = logs[dateStr];
      const hLog = dayLog && dayLog.habits && dayLog.habits[habitId];

      if (!hLog || hLog.status === 'none' || hLog.status === 'fail') {
        score = score * decayFactor; // Decay
      } else if (hLog.status === 'skip') {
        // Excluded: No penalty! Maintain previous score without decay
        score = score;
      } else if (hLog.status === 'done') {
        const boost = Math.min(100, 100 * expectedFreqMultiplier);
        score = (score * decayFactor) + ((1 - decayFactor) * boost);
      } else if (hLog.status === 'partial') {
        const val = Number(hLog.value) || 0;
        const target = Number(habit.targetValue) || 1;
        const ratio = Math.min(1, Math.max(0, val / target));
        const boost = Math.min(100, 100 * expectedFreqMultiplier);
        score = (score * decayFactor) + ((1 - decayFactor) * ratio * boost);
      }
    }

    return Math.min(100, Math.max(0, Math.round(score)));
  }

  getHabitStrengthDetails(habitId, daysHistory = 90) {
    const habit = this.getHabit(habitId);
    if (!habit) return null;
    const score = this.calculateHabitStrength(habitId, daysHistory);
    let level = 'fragile';
    let levelAr = 'هش وفي البداية';
    let levelEn = 'Fragile';
    let color = '#ef4444';

    if (score >= 80) {
      level = 'mastered';
      levelAr = 'متجذرة وإتقان تام 🌟';
      levelEn = 'Mastered';
      color = '#10b981';
    } else if (score >= 50) {
      level = 'strong';
      levelAr = 'راسخة ومستقرة ⚡';
      levelEn = 'Strong';
      color = '#3b82f6';
    } else if (score >= 20) {
      level = 'forming';
      levelAr = 'قيد التكوين 🌱';
      levelEn = 'Forming';
      color = '#f59e0b';
    }

    return {
      habitId,
      score,
      strength: score,
      percentage: score,
      level,
      levelAr,
      levelEn,
      color,
      halfLifeDays: 21,
      details: {
        alpha: 0.88,
        halfLifeDays: 21,
      },
    };
  }

  calculateUrgencyScore(habitId, dateStr = null) {
    const habit = this.getHabit(habitId);
    if (!habit || habit.archived) return { score: 0, level: 'low', labelAr: 'غير نشطة', labelEn: 'Inactive', color: '#64748b', daysSinceLastDone: 0 };
    const logs = this.getAllLogs();
    const todayStr = dateStr || getSafeTodayStr();
    const todayLog = logs[todayStr]?.habits?.[habitId];

    // If completed or shielded today -> 0 urgency
    if (todayLog && (todayLog.status === 'done' || todayLog.status === 'skip')) {
      return {
        score: 0,
        level: 'low',
        isOverdue: false,
        statusTag: 'good',
        labelAr: todayLog.status === 'skip' ? 'إجازة معتمدة 🛡️' : 'مكتمل اليوم ✓',
        labelEn: todayLog.status === 'skip' ? 'Shielded Rest' : 'Done Today',
        color: '#10b981',
        daysSinceLastDone: 0,
      };
    }

    // Find the most recent date completed
    const dates = Object.keys(logs).sort().reverse();
    let daysSinceLastDone = null;
    for (const d of dates) {
      if (d > todayStr) continue;
      const hl = logs[d]?.habits?.[habitId];
      if (hl && hl.status === 'done') {
        const diffDays = Math.round((new Date(todayStr).getTime() - new Date(d).getTime()) / 86400000);
        daysSinceLastDone = diffDays;
        break;
      }
    }

    if (daysSinceLastDone === null) {
      daysSinceLastDone = 99; // Never done -> high urgency to prompt initial completion
    }

    const freq = habit.frequency || { type: 'daily' };
    let intervalDays = 1;
    if (freq.type === 'weekly_target') {
      intervalDays = Math.max(1, Math.round(7 / (Number(freq.targetDaysPerWeek) || 1)));
    } else if (freq.type === 'specific_days') {
      intervalDays = Math.max(1, Math.round(7 / Math.max(1, (freq.daysOfWeek || []).length)));
    } else if (freq.type === 'every_x_days') {
      intervalDays = Math.max(1, Number(freq.interval) || 2);
    }

    const ratio = daysSinceLastDone / intervalDays;
    let score = 0;
    if (ratio === 0) {
      score = 0;
    } else if (ratio <= 1) {
      score = Math.round(30 + ratio * 20);
      const curHour = new Date().getHours();
      const routine = habit.routine || 'anytime';
      if (routine === 'morning' && curHour >= 12) score += 10;
      else if (routine === 'afternoon' && curHour >= 17) score += 10;
      else if (curHour >= 21) score += 10;
    } else if (ratio <= 2) {
      score = Math.round(60 + (ratio - 1) * 20);
    } else {
      score = Math.min(100, Math.round(80 + (ratio - 2) * 5));
    }

    if (habit.todoPriority === 2) score = Math.min(100, score + 10);
    else if (habit.todoPriority === 0) score = Math.max(0, score - 10);

    let level = 'low';
    let labelAr = 'طبيعي ومستقر';
    let labelEn = 'On Track';
    let color = '#10b981';

    if (score >= 85) {
      level = 'critical';
      labelAr = 'عاجل جداً (أولوية قصوى) 🚨';
      labelEn = 'Critical Overdue';
      color = '#ef4444';
    } else if (score >= 60) {
      level = 'high';
      labelAr = 'حان وقته ⏰';
      labelEn = 'High Urgency';
      color = '#f59e0b';
    } else if (score >= 35) {
      level = 'medium';
      labelAr = 'مستحق اليوم ⚡';
      labelEn = 'Due Today';
      color = '#3b82f6';
    }

    return {
      score,
      level,
      isOverdue: score >= 60,
      statusTag: score >= 85 ? 'overdue' : (score >= 60 ? 'high' : (score >= 35 ? 'due_today' : 'good')),
      labelAr,
      labelEn,
      color,
      daysSinceLastDone: daysSinceLastDone === 99 ? 'غير محدد' : daysSinceLastDone,
    };
  }

  getHabitsByUrgency() {
    const habits = this.getHabits(false);
    return habits.map(h => ({
      habit: h,
      urgency: this.calculateUrgencyScore(h.id),
      streak: this.calculateStreak(h.id),
      strength: this.calculateHabitStrength(h.id),
    })).sort((a, b) => b.urgency.score - a.urgency.score);
  }

  getWeeklyDropOffAnalysis() {
    const logs = this.getAllLogs();
    const habits = this.getHabits(false);
    const dayTotals = [0, 0, 0, 0, 0, 0, 0];
    const dayScheduled = [0, 0, 0, 0, 0, 0, 0];

    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayLog = logs[dateStr];
      const wd = d.getDay();

      for (const h of habits) {
        if (!this.isHabitScheduledForDate(h, d)) continue;
        const hl = dayLog?.habits?.[h.id];
        if (hl && hl.status === 'skip') continue;
        dayScheduled[wd]++;
        if (hl && hl.status === 'done') dayTotals[wd]++;
        else if (hl && hl.status === 'partial') dayTotals[wd] += Math.min(1, (hl.value || 0) / (h.targetValue || 1));
      }
    }

    const dayRates = dayTotals.map((tot, idx) => {
      const sch = dayScheduled[idx];
      return sch > 0 ? Math.round((tot / sch) * 100) : 0;
    });

    const dayNamesAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const dayNamesEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    let peakIdx = 0, peakRate = -1;
    let slumpIdx = 0, slumpRate = 999;

    for (let i = 0; i < 7; i++) {
      if (dayScheduled[i] > 0) {
        if (dayRates[i] > peakRate) { peakRate = dayRates[i]; peakIdx = i; }
        if (dayRates[i] < slumpRate) { slumpRate = dayRates[i]; slumpIdx = i; }
      }
    }

    const weekdaySum = dayRates[0] + dayRates[1] + dayRates[2] + dayRates[3] + dayRates[4];
    const weekdayCount = (dayScheduled[0] ? 1 : 0) + (dayScheduled[1] ? 1 : 0) + (dayScheduled[2] ? 1 : 0) + (dayScheduled[3] ? 1 : 0) + (dayScheduled[4] ? 1 : 0) || 1;
    const weekdayAvg = Math.round(weekdaySum / weekdayCount);

    const weekendSum = dayRates[5] + dayRates[6];
    const weekendCount = (dayScheduled[5] ? 1 : 0) + (dayScheduled[6] ? 1 : 0) || 1;
    const weekendAvg = Math.round(weekendSum / weekendCount);

    const drop = Math.max(0, peakRate - slumpRate);
    const hasSlump = drop >= 20;

    let adviceAr = `أداؤك متوازن ومستقر على مدار أيام الأسبوع! أعلى أداء في يوم ${dayNamesAr[peakIdx]} (${peakRate}%).`;
    let adviceEn = `Your performance is well-balanced across weekdays! Peak performance is on ${dayNamesEn[peakIdx]} (${peakRate}%).`;

    if (hasSlump) {
      adviceAr = `⚠️ تنبيه ركود العادات (Slump Alert): يلاحظ انخفاض واضح في يوم ${dayNamesAr[slumpIdx]} (${slumpRate}%) مقارنة بيوم ${dayNamesAr[peakIdx]} (${peakRate}%). نصيحة: قلل العبء المستهدف في يوم ${dayNamesAr[slumpIdx]} أو استخدم تقنية الدقائق الخمس للبدء بسهولة.`;
      adviceEn = `⚠️ Slump Alert: Significant drop observed on ${dayNamesEn[slumpIdx]} (${slumpRate}%) compared to ${dayNamesEn[peakIdx]} (${peakRate}%). Tip: Reduce targets on ${dayNamesEn[slumpIdx]} or use the 5-minute rule to maintain momentum.`;
    }

    return {
      dayRates,
      dayScheduled,
      peakDay: { index: peakIdx, nameAr: dayNamesAr[peakIdx], nameEn: dayNamesEn[peakIdx], rate: peakRate },
      slumpDay: { index: slumpIdx, nameAr: dayNamesAr[slumpIdx], nameEn: dayNamesEn[slumpIdx], rate: slumpRate },
      peakDayName: dayNamesAr[peakIdx],
      slumpDayName: dayNamesAr[slumpIdx],
      peakRate,
      slumpRate,
      dropPercentage: drop,
      weekdayAvg,
      weekendAvg,
      hasSlump,
      adviceAr,
      adviceEn,
      coachingAdvice: adviceAr,
    };
  }

  exportHabitCsv(habitId, targetDir = null) {
    const habit = this.getHabit(habitId);
    if (!habit) return { success: false, message: 'Habit not found' };
    const logs = this.getAllLogs();
    const sortedDates = Object.keys(logs).sort();
    const lines = ['Date,HabitID,Title,Status,Value,Unit,Scheduled,DailyNote'];
    for (const dateStr of sortedDates) {
      const d = new Date(dateStr + 'T12:00:00');
      const scheduled = this.isHabitScheduledForDate(habit, d);
      const hLog = logs[dateStr]?.habits?.[habitId];
      if (scheduled || hLog) {
        const status = hLog?.status || 'none';
        const val = hLog?.value !== undefined ? hLog.value : '';
        const note = (hLog?.note || '').replace(/"/g, '""');
        lines.push(`"${dateStr}","${habit.id}","${habit.title}","${status}","${val}","${habit.unit || ''}","${scheduled}","${note}"`);
      }
    }
    const csvContent = lines.join('\n');
    const outDir = targetDir || (this.store && this.store.filePath ? path.dirname(this.store.filePath) : os.tmpdir());
    const filePath = path.join(outDir, `habit-${habitId}-${Date.now()}.csv`);
    fs.writeFileSync(filePath, csvContent, 'utf8');
    return {
      success: true,
      filePath,
      csv: csvContent,
      rowsCount: lines.length - 1,
    };
  }

  /**
   * Streak calculation with Skip tolerance
   */
  calculateStreak(habitId, untilDate = null) {
    const logs = this.getAllLogs();
    const habit = this.getHabit(habitId);
    if (!habit) return { current: 0, longest: 0 };

    const loggedDates = Object.keys(logs).sort();
    if (loggedDates.length === 0) return { current: 0, longest: 0 };

    let refDate = untilDate ? new Date(untilDate) : new Date();
    const todayStr = new Date().toISOString().slice(0, 10);
    const lastLogged = loggedDates[loggedDates.length - 1];
    if (!untilDate && (!logs[todayStr] || !logs[todayStr].habits || !logs[todayStr].habits[habitId])) {
      refDate = new Date(lastLogged);
    }

    let longest = 0;
    let running = 0;

    for (const dateStr of loggedDates) {
      const d = new Date(dateStr);
      if (!this.isHabitScheduledForDate(habit, d)) continue;
      const hLog = logs[dateStr] && logs[dateStr].habits && logs[dateStr].habits[habitId];
      if (!hLog || hLog.status === 'fail' || hLog.status === 'none') {
        running = 0;
      } else if (hLog.status === 'skip') {
        continue;
      } else if (hLog.status === 'done' || (hLog.status === 'partial' && (hLog.value / habit.targetValue) >= 0.5)) {
        running++;
        if (running > longest) longest = running;
      }
    }

    let current = 0;
    for (let i = 0; i <= 90; i++) {
      const d = new Date(refDate);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      if (!this.isHabitScheduledForDate(habit, d)) continue;

      const hLog = logs[dateStr] && logs[dateStr].habits && logs[dateStr].habits[habitId];
      if (!hLog) {
        break;
      }
      if (hLog.status === 'skip') {
        continue;
      }
      if (hLog.status === 'done' || (hLog.status === 'partial' && (hLog.value / habit.targetValue) >= 0.5)) {
        current++;
      } else {
        break;
      }
    }

    return { current: Math.max(current, running), longest: Math.max(longest, current) };
  }

  /**
   * Calculates Pearson Correlation Coefficient r between two numeric arrays
   */
  static pearsonCorrelation(xArr, yArr) {
    if (!Array.isArray(xArr) || !Array.isArray(yArr) || xArr.length < 3 || xArr.length !== yArr.length) {
      return 0;
    }
    const n = xArr.length;
    const xMean = xArr.reduce((a, b) => a + b, 0) / n;
    const yMean = yArr.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let xDenom = 0;
    let yDenom = 0;

    for (let i = 0; i < n; i++) {
      const xDiff = xArr[i] - xMean;
      const yDiff = yArr[i] - yMean;
      numerator += xDiff * yDiff;
      xDenom += xDiff * xDiff;
      yDenom += yDiff * yDiff;
    }

    if (xDenom === 0 || yDenom === 0) return 0;
    const r = numerator / (Math.sqrt(xDenom) * Math.sqrt(yDenom));
    return Number(r.toFixed(2));
  }

  /**
   * Complete Analytical Report for Dashboard & KPI Engine
   */
  getAnalytics(monthStr = null) {
    return this.computeAnalytics(monthStr);
  }

  computeAnalytics(monthStr = null) {
    const logs = this.getAllLogs();
    const habits = this.getHabits(false);

    // Filter by month (YYYY-MM) or default to current month
    const targetMonth = (monthStr || getSafeTodayStr()).slice(0, 7);
    const dateEntries = Object.keys(logs).filter(d => d.startsWith(targetMonth)).sort();

    // Data series for correlations
    const sleepSeries = [];
    const moodSeries = [];
    const stressSeries = [];
    const completionSeries = [];
    const screenSeries = [];

    const weekdayTotals = [0, 0, 0, 0, 0, 0, 0]; // Sun..Sat
    const weekdayCounts = [0, 0, 0, 0, 0, 0, 0];

    let totalSleepSum = 0;
    let sleepLoggedDays = 0;
    let totalMoodSum = 0;
    let moodLoggedDays = 0;

    for (const dateStr of dateEntries) {
      const log = logs[dateStr];
      const d = new Date(dateStr);
      const wd = d.getDay();

      let scheduled = 0;
      let completed = 0;

      for (const h of habits) {
        if (!this.isHabitScheduledForDate(h, d)) continue;
        const hLog = log.habits && log.habits[h.id];
        if (hLog && hLog.status === 'skip') continue;
        scheduled++;
        if (hLog && hLog.status === 'done') completed++;
        else if (hLog && hLog.status === 'partial') completed += Math.min(1, (hLog.value || 0) / (h.targetValue || 1));
      }

      const rate = scheduled > 0 ? (completed / scheduled) * 100 : 0;
      weekdayTotals[wd] += rate;
      weekdayCounts[wd]++;

      const hasSleep = log.sleep && log.sleep.durationHours > 0;
      const hasMood = log.mood && log.mood.rating > 0;

      if (hasSleep) {
        totalSleepSum += log.sleep.durationHours;
        sleepLoggedDays++;
      }
      if (hasMood) {
        totalMoodSum += log.mood.rating;
        moodLoggedDays++;
      }

      // If we have both sleep and mood on same day, push to correlation arrays
      if (hasSleep && hasMood) {
        sleepSeries.push(log.sleep.durationHours);
        moodSeries.push(log.mood.rating);
        completionSeries.push(rate);
        if (log.stress && typeof log.stress.level === 'number') {
          stressSeries.push(log.stress.level);
        }
        if (log.screenTime && typeof log.screenTime.hours === 'number') {
          screenSeries.push(log.screenTime.hours);
        }
      }
    }

    // Pearson correlations
    const rSleepMood = HabitsManager.pearsonCorrelation(sleepSeries, moodSeries);
    const rSleepCompletion = HabitsManager.pearsonCorrelation(sleepSeries, completionSeries);
    const rMoodStress = HabitsManager.pearsonCorrelation(moodSeries.slice(0, stressSeries.length), stressSeries);

    // Best and worst weekday
    let bestDayIdx = 0;
    let worstDayIdx = 0;
    let bestRate = -1;
    let worstRate = 999;

    for (let i = 0; i < 7; i++) {
      if (weekdayCounts[i] > 0) {
        const avg = weekdayTotals[i] / weekdayCounts[i];
        if (avg > bestRate) { bestRate = avg; bestDayIdx = i; }
        if (avg < worstRate) { worstRate = avg; worstDayIdx = i; }
      }
    }

    const dayNamesAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const dayNamesEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Habit breakdown stats
    const habitStats = habits.map(h => {
      const streak = this.calculateStreak(h.id);
      const strength = this.calculateHabitStrength(h.id);
      return {
        id: h.id,
        title: h.title,
        titleEn: h.titleEn,
        category: h.category,
        routine: h.routine,
        color: h.color,
        icon: h.icon,
        strength,
        currentStreak: streak.current,
        longestStreak: streak.longest,
      };
    });

    return {
      month: targetMonth,
      totalTrackedDays: dateEntries.length,
      averageSleep: sleepLoggedDays > 0 ? Number((totalSleepSum / sleepLoggedDays).toFixed(1)) : 0,
      averageMood: moodLoggedDays > 0 ? Number((totalMoodSum / moodLoggedDays).toFixed(1)) : 0,
      habitStats,
      correlations: {
        sleepAndMood: rSleepMood,
        sleepAndCompletion: rSleepCompletion,
        moodAndStress: rMoodStress,
      },
      bestDay: bestRate >= 0
        ? { index: bestDayIdx, nameAr: dayNamesAr[bestDayIdx], nameEn: dayNamesEn[bestDayIdx], rate: Math.round(bestRate) }
        : { index: 0, nameAr: 'لا توجد بيانات كافية', nameEn: 'Insufficient data', rate: 0 },
      worstDay: worstRate <= 100
        ? { index: worstDayIdx, nameAr: dayNamesAr[worstDayIdx], nameEn: dayNamesEn[worstDayIdx], rate: Math.round(worstRate) }
        : { index: 0, nameAr: 'لا توجد بيانات كافية', nameEn: 'Insufficient data', rate: 0 },
    };
  }

  /* ==================================================================== *
   * Backup, Data Export & Restore (JSON / CSV)
   * ==================================================================== */

  exportData(format = 'json') {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      habits: this.getHabits(true),
      logs: this.getAllLogs(),
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    }

    if (format === 'csv') {
      const lines = ['Date,HabitId,HabitTitle,Status,Value,SleepHours,MoodRating,DailyNote'];
      const logs = data.logs;
      const habitsMap = new Map(data.habits.map(h => [h.id, h.title]));

      for (const [dateStr, dLog] of Object.entries(logs)) {
        const sleep = (dLog.sleep && dLog.sleep.durationHours) || '';
        const mood = (dLog.mood && dLog.mood.rating) || '';
        const note = (dLog.dailyNote || '').replace(/"/g, '""');

        if (dLog.habits && Object.keys(dLog.habits).length > 0) {
          for (const [hId, hEntry] of Object.entries(dLog.habits)) {
            const title = habitsMap.get(hId) || hId;
            lines.push(`"${dateStr}","${hId}","${title}","${hEntry.status}","${hEntry.value}","${sleep}","${mood}","${note}"`);
          }
        } else {
          lines.push(`"${dateStr}","","","","","${sleep}","${mood}","${note}"`);
        }
      }
      return lines.join('\n');
    }

    return '';
  }

  importData(dataPayload, merge = true) {
    try {
      const parsed = typeof dataPayload === 'string' ? JSON.parse(dataPayload) : dataPayload;
      if (!parsed || (!parsed.habits && !parsed.logs)) {
        throw new Error('Invalid habits backup structure');
      }

      if (!merge) {
        if (Array.isArray(parsed.habits)) this.store.set('habits', parsed.habits);
        if (parsed.logs && typeof parsed.logs === 'object') this.store.set('logs', parsed.logs);
      } else {
        const currentHabits = [...(this.store.get('habits') || [])];
        const existingIds = new Set(currentHabits.map(h => h.id));
        if (Array.isArray(parsed.habits)) {
          for (const h of parsed.habits) {
            if (!existingIds.has(h.id)) {
              currentHabits.push(h);
              existingIds.add(h.id);
            }
          }
          this.store.set('habits', currentHabits);
        }

        const currentLogs = { ...(this.store.get('logs') || {}) };
        if (parsed.logs && typeof parsed.logs === 'object') {
          for (const [date, entry] of Object.entries(parsed.logs)) {
            if (!currentLogs[date]) {
              currentLogs[date] = entry;
            } else {
              currentLogs[date].habits = { ...(currentLogs[date].habits || {}), ...(entry.habits || {}) };
              if (entry.sleep) currentLogs[date].sleep = entry.sleep;
              if (entry.mood) currentLogs[date].mood = entry.mood;
              if (entry.stress) currentLogs[date].stress = entry.stress;
            }
          }
          this.store.set('logs', currentLogs);
        }
      }

      this.emit('habits-changed', this.getHabits(true));
      this.emit('log-changed', { date: 'import', all: true });
      return { success: true, countHabits: (parsed.habits || []).length };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /* ==================================================================== *
   * WhatsApp Executive Infographic Report Generator
   * ==================================================================== */

  generateWhatsAppReport(type = 'monthly', targetDateStr = null, lang = null) {
    const makeBar = (pct) => {
      const filled = Math.min(10, Math.max(0, Math.round((pct || 0) / 10)));
      return '█'.repeat(filled) + '░'.repeat(10 - filled);
    };

    const s = this.getSettings() || {};
    const reportLang = lang || s.habits?.reportLang || s.reportLang || s.language || 'ar';
    const isArabic = reportLang === 'ar';

    // 1. Daily Report
    if (type === 'daily') {
      const today = targetDateStr || getSafeTodayStr();
      const targetDateObj = new Date(today + 'T12:00:00');
      const log = this.getLog(today);
      const dwi = this.calculateDailyWellnessIndex(today);
      const activeHabits = this.getHabits(false);
      let completedHabits = [];
      let pendingHabits = [];
      let skippedHabits = [];

      for (const h of activeHabits) {
        if (!this.isHabitScheduledForDate(h, targetDateObj)) continue;
        const hl = log.habits && log.habits[h.id];
        const title = isArabic ? h.title : (h.titleEn || h.title);
        const streak = this.calculateStreak(h.id).current;
        const streakLabel = isArabic ? `(🔥 ${streak} يوم)` : `(🔥 ${streak} days)`;
        const leaveLabel = isArabic ? '(إجازة معتمدة 🛡️)' : '(Shielded Leave 🛡️)';

        if (hl && hl.status === 'skip') {
          skippedHabits.push(`⏸️ ${h.icon || '⭐'} *${title}* ${leaveLabel}`);
        } else if (hl && (hl.status === 'done' || (hl.status === 'partial' && Number(hl.value) >= (Number(h.targetValue) || 1)))) {
          completedHabits.push(`✅ ${h.icon || '⭐'} *${title}* ${streakLabel}`);
        } else {
          pendingHabits.push(`⏳ ${h.icon || '⭐'} *${title}*`);
        }
      }

      if (isArabic) {
        const lines = [
          `🌟 *[الملخص اليومي - العادات والعافية الذكية]* 🌟`,
          `📅 *التاريخ:* ${today}`,
          `━━━━━━━━━━━━━━━━━━━━━`,
          `🎯 *مؤشر العافية اليومي (DWI):* ${dwi !== null ? dwi + '%' : '—'}`,
          `   [${makeBar(dwi || 0)}]`,
        ];
        if (log.sleep && log.sleep.durationHours > 0) {
          lines.push(`🛌 *ساعات النوم:* ${log.sleep.durationHours} ساعة  |  الجودة: ${log.sleep.quality || '—'}/5 ★`);
        }
        if (log.mood && log.mood.rating > 0) {
          const faces = { 5: '😁 رائع ومبتهج', 4: '🙂 جيد ومستقر', 3: '😐 عادي', 2: '😣 مجهد', 1: '😡 سيئ' };
          lines.push(`😊 *تقييم المزاج:* ${faces[log.mood.rating] || log.mood.rating + '/5'}`);
        }
        lines.push(``);
        if (completedHabits.length > 0) {
          lines.push(`🏆 *العادات المكتملة (${completedHabits.length}):*`);
          completedHabits.forEach(c => lines.push(`• ${c}`));
          lines.push(``);
        }
        if (pendingHabits.length > 0) {
          lines.push(`⏰ *العادات المتبقية (${pendingHabits.length}):*`);
          pendingHabits.forEach(p => lines.push(`• ${p}`));
          lines.push(``);
        }
        if (skippedHabits.length > 0) {
          lines.push(`🛡️ *العادات المستثناة بعذر:*`);
          skippedHabits.forEach(s => lines.push(`• ${s}`));
          lines.push(``);
        }
        lines.push(`💡 *إلهام اليوم:* "العادات الصغيرة تتراكم لتصنع تحولات مذهلة."`);
        lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
        lines.push(`_تم الإرسال بواسطة ودجت العادات والعافية الذكي_ ✨`);
        return lines.join('\n');
      } else {
        const lines = [
          `🌟 *[Daily Habits & Wellness Briefing]* 🌟`,
          `📅 *Date:* ${today}`,
          `━━━━━━━━━━━━━━━━━━━━━`,
          `🎯 *Daily Wellness Index (DWI):* ${dwi !== null ? dwi + '%' : '—'}`,
          `   [${makeBar(dwi || 0)}]`,
        ];
        if (log.sleep && log.sleep.durationHours > 0) {
          lines.push(`🛌 *Sleep Duration:* ${log.sleep.durationHours} hrs  |  Quality: ${log.sleep.quality || '—'}/5 ★`);
        }
        if (log.mood && log.mood.rating > 0) {
          lines.push(`😊 *Mood Rating:* ${log.mood.rating}/5`);
        }
        lines.push(``);
        if (completedHabits.length > 0) {
          lines.push(`🏆 *Completed Habits (${completedHabits.length}):*`);
          completedHabits.forEach(c => lines.push(`• ${c}`));
          lines.push(``);
        }
        if (pendingHabits.length > 0) {
          lines.push(`⏰ *Pending Habits (${pendingHabits.length}):*`);
          pendingHabits.forEach(p => lines.push(`• ${p}`));
          lines.push(``);
        }
        if (skippedHabits.length > 0) {
          lines.push(`🛡️ *Shielded Habits on Leave (${skippedHabits.length}):*`);
          skippedHabits.forEach(s => lines.push(`• ${s}`));
          lines.push(``);
        }
        lines.push(`💡 *Daily Spark:* "Small daily habits compound into massive transformations."`);
        lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
        lines.push(`_Sent via Mirqat Habits & Wellness Engine_ ✨`);
        return lines.join('\n');
      }
    }

    // 2. Weekly Report (7-day window)
    if (type === 'weekly') {
      const today = targetDateStr ? new Date(targetDateStr) : new Date();
      const logs = this.getAllLogs();
      const habits = this.getHabits(false);

      const past7Dates = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        past7Dates.push(d.toISOString().slice(0, 10));
      }

      const startDate = past7Dates[0];
      const endDate = past7Dates[past7Dates.length - 1];

      let totalScheduled = 0;
      let totalCompleted = 0;
      let totalSleep = 0;
      let sleepDays = 0;
      let totalMood = 0;
      let moodDays = 0;

      for (const dateStr of past7Dates) {
        const dLog = logs[dateStr] || { habits: {} };
        const dObj = new Date(dateStr);
        for (const h of habits) {
          if (!this.isHabitScheduledForDate(h, dObj)) continue;
          const hl = dLog.habits && dLog.habits[h.id];
          if (hl && hl.status === 'skip') continue;
          totalScheduled++;
          if (hl && hl.status === 'done') totalCompleted++;
          else if (hl && hl.status === 'partial') totalCompleted += Math.min(1, (hl.value || 0) / (h.targetValue || 1));
        }
        if (dLog.sleep && dLog.sleep.durationHours > 0) {
          totalSleep += dLog.sleep.durationHours;
          sleepDays++;
        }
        if (dLog.mood && dLog.mood.rating > 0) {
          totalMood += dLog.mood.rating;
          moodDays++;
        }
      }

      const weekRate = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;
      const avgSleep = sleepDays > 0 ? (totalSleep / sleepDays).toFixed(1) : '—';
      const avgMood = moodDays > 0 ? (totalMood / moodDays).toFixed(1) : '—';

      const habitStats = habits.map(h => ({
        ...h,
        strength: this.calculateHabitStrength(h.id),
        streak: this.calculateStreak(h.id).current,
      })).sort((a, b) => b.strength - a.strength);

      if (isArabic) {
        const lines = [
          `📊 *[التقرير الأسبوعي التنفيذي - العادات والعافية الذكية]* 🌟`,
          `📅 *الفترة:* من ${startDate} إلى ${endDate}`,
          `━━━━━━━━━━━━━━━━━━━━━`,
          `🏆 *معدل الإنجاز الأسبوعي:* ${weekRate}%`,
          `   [${makeBar(weekRate)}]`,
          `🎯 *إجمالي العادات المنجزة:* ${Math.round(totalCompleted)} من ${totalScheduled} مخطط`,
          `🛌 *متوسط النوم الأسبوعي:* ${avgSleep !== '—' ? avgSleep + ' ساعة/ليلة' : 'غير مسجل'}`,
          `😊 *متوسط المزاج الأسبوعي:* ${avgMood !== '—' ? avgMood + ' / 5 ★' : 'غير مسجل'}`,
          ``,
          `🔥 *أقوى عاداتك هذا الأسبوع:*`,
        ];
        habitStats.slice(0, 5).forEach((h, idx) => {
          lines.push(`${idx + 1}. ${h.icon || '⭐'} *${h.title}*  |  قوة العادة: ${h.strength}% (🔥 ${h.streak} يوم)`);
        });
        lines.push(``);
        lines.push(`💡 *إلهام أسبوعي:* "الانضباط هو الجسر الرابط بين الأهداف والإنجاز."`);
        lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
        lines.push(`_تم الإرسال بواسطة ودجت العادات والعافية الذكي_ ✨`);
        return lines.join('\n');
      } else {
        const lines = [
          `📊 *[Executive Weekly Habits & Wellness Report]* 🌟`,
          `📅 *Period:* ${startDate} to ${endDate}`,
          `━━━━━━━━━━━━━━━━━━━━━`,
          `🏆 *Weekly Completion Rate:* ${weekRate}%`,
          `   [${makeBar(weekRate)}]`,
          `🎯 *Total Completed Habits:* ${Math.round(totalCompleted)} of ${totalScheduled} scheduled`,
          `🛌 *Avg Sleep:* ${avgSleep !== '—' ? avgSleep + ' hrs/night' : 'Not logged'}`,
          `😊 *Avg Mood:* ${avgMood !== '—' ? avgMood + ' / 5 ★' : 'Not logged'}`,
          ``,
          `🔥 *Top Performing Habits:*`,
        ];
        habitStats.slice(0, 5).forEach((h, idx) => {
          lines.push(`${idx + 1}. ${h.icon || '⭐'} *${h.titleEn || h.title}*  |  Strength: ${h.strength}% (🔥 ${h.streak} days)`);
        });
        lines.push(``);
        lines.push(`💡 *Weekly Spark:* "Discipline is the bridge between goals and accomplishment."`);
        lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
        lines.push(`_Sent via Mirqat Habits & Wellness Engine_ ✨`);
        return lines.join('\n');
      }
    }

    // 3. Monthly Report
    const targetMonth = (targetDateStr || getSafeTodayStr()).slice(0, 7);
    const analytics = this.computeAnalytics(targetMonth);
    const habits = analytics.habitStats;
    const avgStrength = habits.length > 0 ? Math.round(habits.reduce((acc, h) => acc + h.strength, 0) / habits.length) : 0;

    if (isArabic) {
      const lines = [
        `📊 *[التقرير الشهري الشامل - العادات والعافية الذكية]* 🌟`,
        `📅 *الشهر:* ${targetMonth}`,
        `━━━━━━━━━━━━━━━━━━━━━`,
        `🏆 *متوسط قوة العادات العام:* ${avgStrength}%`,
        `   [${makeBar(avgStrength)}]`,
        `🛌 *متوسط ساعات النوم:* ${analytics.averageSleep > 0 ? analytics.averageSleep + ' ساعة/ليلة' : 'غير مسجل'}`,
        `😊 *متوسط مؤشر المزاج:* ${analytics.averageMood > 0 ? analytics.averageMood + ' / 5 ★' : 'غير مسجل'}`,
        ``,
        `🔥 *ترتيب العادات حسب مؤشر القوة:*`,
      ];

      habits.slice(0, 5).forEach((h, idx) => {
        lines.push(`${idx + 1}. ${h.icon} *${h.title}*`);
        lines.push(`   [${makeBar(h.strength)}] ${h.strength}%  |  🔥 السلسلة: ${h.currentStreak} يوم`);
      });

      lines.push(``);
      lines.push(`💡 *اكتشافات الترابط والذكاء الإحصائي:*`);

      if (analytics.correlations.sleepAndMood > 0.3) {
        lines.push(`• 📈 *علاقة إيجابية قوية (${analytics.correlations.sleepAndMood}):* زيادة ساعات النوم تحسن تقييم مزاجك بنسبة ملحوظة!`);
      } else if (analytics.correlations.sleepAndCompletion > 0.3) {
        lines.push(`• 🎯 *طاقة الإنجاز (${analytics.correlations.sleepAndCompletion}):* النوم المنتظم يرفع نسبة إكمالك للعادات في اليوم التالي.`);
      } else if (analytics.bestDay && analytics.bestDay.rate > 0) {
        lines.push(`• ⚖️ استمرارية ممتازة! أفضل أيامك في الإنجاز هي: *${analytics.bestDay.nameAr}* بنسبة ${analytics.bestDay.rate}%.`);
      } else {
        lines.push(`• 🌟 استمر في التوثيق اليومي لبناء شبكة الترابط الإحصائي بدقة.`);
      }

      lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
      lines.push(`_تم الإرسال تلقائياً بواسطة ودجت العادات والعافية الذكي_ ✨`);
      return lines.join('\n');
    } else {
      const lines = [
        `📊 *[Smart Habits & Wellness Monthly Report]* 🌟`,
        `📅 *Month:* ${targetMonth}`,
        `━━━━━━━━━━━━━━━━━━━━━`,
        `🏆 *Average Habit Strength:* ${avgStrength}%`,
        `   [${makeBar(avgStrength)}]`,
        `🛌 *Avg Sleep Duration:* ${analytics.averageSleep > 0 ? analytics.averageSleep + ' hrs/night' : 'Not logged'}`,
        `😊 *Avg Mood Rating:* ${analytics.averageMood > 0 ? analytics.averageMood + ' / 5 ★' : 'Not logged'}`,
        ``,
        `🔥 *Top Habits & Strength Index:*`,
      ];

      habits.slice(0, 5).forEach((h, idx) => {
        lines.push(`${idx + 1}. ${h.icon} *${h.titleEn || h.title}*`);
        lines.push(`   [${makeBar(h.strength)}] ${h.strength}%  |  🔥 ${h.currentStreak} days`);
      });

      lines.push(``);
      lines.push(`💡 *Correlation Insights & AI Analytics:*`);
      if (analytics.correlations.sleepAndMood > 0.3) {
        lines.push(`• 📈 *Strong Correlation (${analytics.correlations.sleepAndMood}):* Better sleep consistently elevates your mood score.`);
      } else if (analytics.bestDay && analytics.bestDay.rate > 0) {
        lines.push(`• ⚖️ Peak performance observed on *${analytics.bestDay.nameEn}* (${analytics.bestDay.rate}% completion).`);
      } else {
        lines.push(`• 🌟 Continue daily logging to unlock deeper statistical correlations.`);
      }

      lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
      lines.push(`_Automatically generated by Mirqat Habits & Wellness Engine_ ✨`);
      return lines.join('\n');
    }
  }
}

module.exports = {
  HabitsManager,
  DEFAULT_HABITS,
  BOSS_ROSTER,
  HERO_SKILLS,
};
