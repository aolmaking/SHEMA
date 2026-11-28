'use strict';

const path = require('path');
const {
  app, BrowserWindow, ipcMain, Tray, Menu, nativeImage,
  screen, shell, globalShortcut, Notification, dialog, session,
} = require('electron');

// A test or capture run with its own data folder must not collide with the
// installed app: give it its own profile, and with it its own instance lock.
if (process.env.WIDGETS_DATA_DIR) {
  app.setPath('userData', path.join(process.env.WIDGETS_DATA_DIR, 'electron'));
}

const fs = require('fs');
function debugLog(msg) {
  try {
    const p = path.join(app.getPath('userData'), 'app-debug.log');
    fs.appendFileSync(p, `[${new Date().toISOString()}] ${msg}\n`);
  } catch { }
}
debugLog('=== App process spawned: ' + process.pid + ' ===');

const INSTALL_MODE = process.argv.includes('--install');

// One instance only: a second launch (e.g. the desktop icon while running)
// just brings the widgets forward.
const gotLock = app.requestSingleInstanceLock();
debugLog('Single instance lock acquired: ' + gotLock);
if (!INSTALL_MODE && !gotLock) {
  debugLog('Exiting because single instance lock could not be acquired.');
  app.quit();
  process.exit(0);
}

const APP_ID = 'com.ahmed.mirqat-widgets';
app.setAppUserModelId(APP_ID);

// Hardware and power optimization flags: throttle background renderers, conserve GPU cycles, and enable battery saver heuristics
try {
  app.commandLine.appendSwitch('disable-renderer-backgrounding', 'false');
  app.commandLine.appendSwitch('enable-features', 'BatterySaverMode,CalculateNativeWinOcclusion,ThrottleDisplayNoneAndVisibilityHiddenFrame');
  app.commandLine.appendSwitch('js-flags', '--expose-gc --max-old-space-size=256');
} catch { }

process.on('uncaughtException', (err) => {
  debugLog(`UNCAUGHT EXCEPTION: ${err.stack || err}`);
});
process.on('unhandledRejection', (err) => {
  debugLog(`UNHANDLED REJECTION: ${err.stack || err}`);
});
const http = require('http');
const https = require('https');
const paths = require('./src/core/paths');
const { Store } = require('./src/core/store');

const currentPowerState = {
  onBattery: false,
  suspended: false,
  locked: false,
  ecoActive: false,
};

function evaluateEcoState() {
  if (typeof settings === 'undefined' || !settings.data) return false;
  const eco = settings.get('eco', DEFAULTS.eco) || DEFAULTS.eco;
  const mode = eco.mode || 'auto';
  let active = false;
  if (mode === 'always') active = true;
  else if (mode === 'off') active = false;
  else active = Boolean(currentPowerState.onBattery);

  currentPowerState.ecoActive = active;
  if (typeof broadcast === 'function') {
    broadcast('power:status', { ...currentPowerState, eco });
  }
  return active;
}

/**
 * A fresh install ships with the ayat and tafsir that were verified when it
 * was built, so it works offline from the start. Existing caches are never
 * overwritten.
 */
function seedCache() {
  const seed = path.join(__dirname, 'seed', 'cache');
  if (!fs.existsSync(seed)) return;
  const read = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };
  for (const f of ['ayat.json', 'tafsir.json', 'hadith.json']) {
    const from = path.join(seed, f);
    const to = path.join(paths.cache, f);
    if (!fs.existsSync(from)) continue;
    try {
      if (!fs.existsSync(to)) { fs.copyFileSync(from, to); continue; }
      // Merge: add what the seed has and the cache lacks; never overwrite.
      const have = read(to);
      const give = read(from);
      if (!have || !give) continue;
      let added = 0;
      for (const [k, v] of Object.entries(give.items || {})) {
        if (!have.items) have.items = {};
        if (!have.items[k]) { have.items[k] = v; added++; }
      }
      if (added) fs.writeFileSync(to, JSON.stringify(have));
    } catch { /* optional */ }
  }
  for (const f of ['chapters.json', 'hadith-pool.json', 'hadith-index.json']) {
    const from = path.join(seed, f);
    const to = path.join(paths.cache, f);
    try { if (fs.existsSync(from) && !fs.existsSync(to)) fs.copyFileSync(from, to); } catch { /* optional */ }
  }
}
if (!INSTALL_MODE) seedCache();
const autostart = require('./src/core/autostart');
const geo = require('./src/core/geometry');
const { Pomodoro, CONFIG_DEFAULTS: POMODORO_DEFAULTS, normalizeConfig } = require('./src/core/pomodoro');
const quran = require('./src/quran/engine');
const hadith = require('./src/hadith/engine');
const selector = require('./src/quran/selector');
const SOURCES = require('./src/quran/sources');
const { translator } = require('./src/core/i18n');
const { Reminders } = require('./src/core/reminders');
const { EmailEngine } = require('./src/core/email');
const { ClassroomEngine, isTaskCourseHidden } = require('./src/core/classroom');
const { WhatsAppDispatcher } = require('./src/core/whatsapp');
const { SuperUrgentMonitor } = require('./src/core/super-urgent');
const { CalendarEventsManager } = require('./src/core/calendar-events');
const { ReliableDispatcher } = require('./src/core/reliable-dispatch');
const { HabitsManager } = require('./src/core/habits');
const { AtlasEngine } = require('./src/core/atlas');

/* ==================================================================== *
 * Widgets
 * ==================================================================== */

// Sizes are in screen points. Small tiles are square like the reference
// layout; medium is two small tiles wide plus the gap between them.
// Five presets per widget; free resizing in between is limited only by the
// minimum below and by the screen itself.
const BIG = [4000, 4000];
const WIDGETS = {
  clock: {
    file: 'clock.html', min: [120, 120], max: BIG, size: 's',
    sizes: {
      icon: [56, 56], xs: [150, 130], s: [230, 165], m: [352, 170], l: [352, 352], xl: [540, 540],
      wide: [540, 170], tall: [190, 380], max: [620, 380],
    },
  },
  pomodoro: {
    file: 'pomodoro.html', min: [130, 130], max: BIG, size: 's',
    sizes: {
      icon: [56, 56], xs: [140, 140], s: [170, 170], m: [352, 170], l: [352, 300], xl: [540, 420],
      wide: [540, 170], tall: [190, 400], max: [620, 460],
    },
  },
  calendar: {
    file: 'calendar.html', min: [140, 140], max: BIG, size: 'm',
    sizes: {
      icon: [56, 56], xs: [150, 150], s: [170, 170], m: [352, 170], l: [352, 330], xl: [540, 480],
      wide: [540, 200], tall: [230, 490], max: [640, 520],
    },
  },
  quran: {
    file: 'quran.html', min: [220, 160], max: BIG, size: 'm',
    sizes: {
      icon: [56, 56], xs: [260, 175], s: [300, 210], m: [352, 250], l: [460, 340], xl: [620, 440],
      wide: [560, 250], tall: [280, 520], max: [680, 520],
    },
  },
  todo: {
    file: 'todo.html', min: [210, 130], max: BIG, size: 'm',
    sizes: {
      icon: [56, 56], xs: [230, 160], s: [260, 220], m: [300, 340], l: [360, 520], xl: [460, 680],
      wide: [540, 340], tall: [250, 560], max: [620, 680],
    },
  },
  notes: {
    file: 'notes.html', min: [210, 130], max: BIG, size: 'm',
    sizes: {
      icon: [56, 56], xs: [230, 160], s: [260, 200], m: [300, 280], l: [380, 460], xl: [520, 620],
      wide: [540, 300], tall: [250, 520], max: [620, 660],
    },
  },
  email: {
    file: 'email.html', min: [220, 130], max: BIG, size: 'm',
    sizes: {
      icon: [56, 56], xs: [240, 160], s: [280, 200], m: [340, 320], l: [380, 480], xl: [520, 640],
      wide: [560, 360], tall: [280, 580], max: [660, 680],
    },
  },
  photo: {
    file: 'photo.html', min: [140, 140], max: BIG, size: 'm',
    sizes: {
      icon: [56, 56], xs: [160, 160], s: [220, 220], m: [320, 240], l: [420, 360], xl: [580, 480],
      wide: [560, 280], tall: [240, 490], max: [680, 540],
    },
  },
  habits: {
    file: 'habits.html', min: [210, 160], max: BIG, size: 'm',
    sizes: {
      icon: [56, 56], xs: [230, 180], s: [280, 220], m: [352, 280], l: [380, 480], xl: [520, 640],
      wide: [560, 280], tall: [260, 560], max: [640, 680],
    },
  },
  folder: {
    file: 'folder.html', min: [56, 56], max: BIG, size: 's',
    sizes: {
      icon: [56, 56],
      xs: [130, 130],
      s: [144, 144],
      m: [360, 360],
      l: [460, 460],
      xl: [540, 520],
      wide: [420, 220],
      tall: [220, 420],
      max: [580, 420],
    },
  },
};

// Default arrangement, read top to bottom from the right edge: two small
// tiles side by side, then the wider widgets.
const LAYOUT = [['clock', 'pomodoro'], ['calendar'], ['habits'], ['quran'], ['todo'], ['notes'], ['email'], ['photo'], ['folder']];
const LAYOUT_VERSION = 2;


/* ==================================================================== *
 * Settings
 * ==================================================================== */

const DEFAULTS = {
  theme: 'glass',
  accent: '#3E7CBE',
  radius: 22,
  numerals: 'latn',
  language: 'ar',
  // Text size per widget and per window, rather than one size for all.
  fontScales: {
    clock: 1, pomodoro: 1, calendar: 1, quran: 1, todo: 1, notes: 1, email: 1, photo: 1, habits: 1, tafsir: 1, hadith: 1, task: 1, event: 1, 'habits-dashboard': 1, 'email-view': 1, habitsDashboard: 1, settings: 1,
  },
  // 0 = see-through glass, 1 = solid. Full windows default to mostly solid.
  glass: { widgets: 0.12, windows: 0.75 },
  // Everything about how text and glass look.
  look: {
    fontUi: 'plex', fontRead: 'naskh', fontQuran: 'amiri-quran', fontNum: 'plex',
    uiWeight: 400, numWeight: 300, numSpacing: -0.02, lineHeight: 1,
    density: 'normal', edge: 1, borderWidth: 1, grain: true, hover: 1, motion: 1,
    tint: '', tintStrength: 0.25, contrast: 'normal',
    fontColor: 'inherit',
  },
  // What the reflection widget shows: 'quran', 'hadith' or 'alternate'.
  inspiration: 'quran',
  todo: {
    hideDoneAfterHours: 0,   // 0 = finished tasks stay
  },
  todoSortBy: 'free',
  todoMoveDoneToBottom: true,
  alwaysOnTop: true,
  autoStart: true,
  quranIntervalHours: 6,
  tafsir: 'muyassar',
  showTranslation: false,
  translation: 'sahih',
  clock: {
    style: 'ring',        // ring | analog | digital
    hour12: true,
    seconds: true,
    ultraTransparent: true,
    defaultTab: 'clock',
    alarmSound: true,
    snoozeDuration: 5,
    timerSound: true,
    timerDefaultSec: 300,
    desktopNotify: true,
    alarms: [],
    zones: [],
  },
  calendar: {
    weekStart: 6,         // 0 = Sunday ... 6 = Saturday
    hijri: true,
    hijriAdjust: 0,       // days, for local moon-sighting differences
    eventsWaEnabled: true,
    viewMode: 'month',    // 'month' | 'week' | 'agenda'
    showDayActions: true, // Show (+) and (note) buttons on day click
    showRedDot: true,     // Show red dot on days with events or notes
    showTasksOnCalendar: true, // Integrate To-Do and Classroom deadlines
    highlightWeekend: true,
    visualStyle: 'modern', // 'modern' | 'glass' | 'classic'
    popupTheme: 'dark',      // 'dark' | 'waterglass' | 'acrylic' | 'pureblack' | 'match'
    popupRadius: 'rounded',   // 'rounded' | 'pill' | 'compact'
    popupGlow: 'radiant',     // 'radiant' | 'subtle' | 'flat'
    showYearHero: false,  // Year Progress Hero closed by default
    waTemplate: '',
    waDefaultTiming: 'morning_of',
  },
  pomodoro: { ...POMODORO_DEFAULTS },
  email: {
    enabled: false,
    provider: 'gmail',
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    user: '',
    pass: '',
    interval: 3,
    notify: true,
    sound: true,
    maxItems: 15,
    readAction: 'keep',
  },
  browser: {
    mode: 'chrome_profile', // 'chrome_profile' | 'system'
    chromeProfile: '',      // e.g. 'Profile 1' or 'Default'
    userEmail: '',          // e.g. 'ahmed.120230011@ejust.edu.eg'
    customPath: '',
  },
  photo: {
    mode: 'single',
    path: '',
    folder: '',
    fit: 'cover',
    interval: 60,
    showCaption: false,
  },
  classroom: {
    enabled: false,
    clientId: '',
    clientSecret: '',
    accessToken: '',
    refreshToken: '',
    expiryDate: null,
    iCalUrl: '',
    autoSync: true,
    preventDoneIfNotTurnedIn: true,
  },
  superUrgent: {
    enabled: true,
    thresholdHours: 3,
    desktopIntervalMinutes: 15,
  },
  whatsapp: {
    enabled: false,
    provider: 'callmebot',
    phone: '',
    gatewayUrl: 'http://localhost:2785',
    apiKey: '',
    sessionId: 'default',
    frequencyMinutes: 15,
    autoStartServer: true,
    routes: {
      superUrgent: { useCustom: false, recipient: '' },
      habitsReports: { useCustom: false, recipient: '' },
      habitReminders: { useCustom: false, recipient: '', scope: 'all' },
      calendarEvents: { useCustom: false, recipient: '' },
    },
  },
  habits: {
    enabled: true,
    theme: 'match',
    defaultView: 'today',
    weekStart: 'sat',
    gridDotStyle: 'glow_dot',
    showDailyTotals: true,
    soundEffects: true,
    confettiCelebration: true,
    progressRingStyle: 'gradient_bar',
    smartRoutineAnchor: true,
    dailyMotivationalQuote: true,
    forgivingStreak: true,
    graceDays: 1,
    sleepTargetHours: 8.0,
    sleepWarningMin: 6.0,
    targetBedtime: '23:30',
    targetWakeTime: '07:30',
    moodScaleType: '5_smileys',
    trackStress: true,
    trackScreenTime: true,
    syncToTodo: true,
    syncToCalendar: true,
    waEveningPrompt: false,
    waEveningTime: '21:30',
    waWeeklyDigest: false,
    waMonthlyReport: true,
    waRecipientOverride: '',
    gamificationEnabled: true,
    showPomodoroShortcut: true,
    showStreak: true,
    showStrength: true,
    showProgressBar: true,
    showMiniStrip: true,
    showRoutineFilters: true,
    showFooterCheckin: true,
    cardDensity: 'compact',
    sortOrder: 'manual',
    statusFilter: 'all',
    reportLang: 'ar',
  },
  // Per-widget styling overrides (fonts, weights, glass)
  widgetStyles: {
    clock: { fontUi: 'inherit', fontNum: 'inherit', uiWeight: 'inherit', numWeight: 'inherit', glass: 'inherit' },
    pomodoro: { fontUi: 'inherit', fontNum: 'inherit', uiWeight: 'inherit', numWeight: 'inherit', glass: 'inherit' },
    calendar: { fontUi: 'inherit', fontNum: 'inherit', uiWeight: 'inherit', numWeight: 'inherit', glass: 'inherit' },
    quran: { fontUi: 'inherit', fontQuran: 'inherit', fontRead: 'inherit', uiWeight: 'inherit', glass: 'inherit' },
    todo: { fontUi: 'inherit', fontNum: 'inherit', uiWeight: 'inherit', glass: 'inherit' },
    notes: { fontUi: 'inherit', fontRead: 'inherit', uiWeight: 'inherit', glass: 'inherit' },
    email: { fontUi: 'inherit', fontRead: 'inherit', uiWeight: 'inherit', glass: 'inherit' },
    photo: { fontUi: 'inherit', uiWeight: 'inherit', glass: 'inherit' },
    habits: { fontUi: 'inherit', fontNum: 'inherit', uiWeight: 'inherit', glass: 'inherit' },
    folder: { fontUi: 'inherit', fontNum: 'inherit', uiWeight: 'inherit', glass: 'inherit' },
  },
  folder: {
    title: 'أدوات مساعدة',
    widgetIds: ['clock', 'pomodoro', 'calendar', 'habits', 'photo', 'notes'],
    quickSlots: ['clock', 'pomodoro', 'calendar'],
    groupMinis: false,
  },
  folderSettings: {
    radius: 24,
    blur: 34,
    opacity: 24,
    borderWidth: 1,
    borderOpacity: 38,
    showCompactTitles: false,
    dragGlow: true,
    collisionAvoidance: true,
  },
  snapToDesktopGrid: true,
  preventOpenWidgetsOverlap: true,
  eco: {
    mode: 'auto',        // 'auto' (on battery) | 'always' | 'off'
    sleepMini: true,     // dormant minimized widgets
    pauseOnLock: true,   // pause animation and polling on lock/sleep
    lightShaders: true,  // reduce GPU shaders on battery
    widgets: {},         // per-widget overrides
  },
  atlas: {
    aiEnabled: false,
    apiKey: '',
    model: 'gemini-flash-lite-latest',
  },
  layoutVersion: LAYOUT_VERSION,
  initialized: false,
  widgets: Object.fromEntries(Object.entries(WIDGETS).map(([id, w]) => [
    id, { visible: true, bounds: null, size: w.size },
  ])),
};

const settings = new Store(paths.settings, DEFAULTS);
const getAppLanguage = () => {
  const l = settings.get('language') || 'auto';
  if (l === 'en' || l === 'ar') return l;
  const sys = (app.getLocale() || '').toLowerCase();
  return sys.startsWith('ar') ? 'ar' : 'en';
};
const T = translator(getAppLanguage);
const titleOf = (id) => {
  if (id && typeof id === 'string' && id.startsWith('folder')) {
    const f = getFolder(id);
    return f?.title || T('w.folder');
  }
  if (id === 'quran') {
    const mode = settings.get('inspiration');
    if (mode === 'hadith') return T('w.hadith');
    if (mode === 'alternate') return T('w.inspire');
  }
  return T(`w.${id}`);
};
const todos = new Store(paths.todos, { items: [] });
const notes = new Store(paths.notes, { items: [], activeId: null });
const calendarEventsStore = new Store(paths.calendarEvents, { events: [] });
const dispatchQueueStore = new Store(paths.dispatchQueue, { dispatched: {}, planned: {}, retryQueue: [] });
const habitsStore = new Store(paths.habits, { habits: [], logs: {} });
const habitsManager = new HabitsManager(habitsStore, () => settings.data);
habitsManager.on('habits-changed', (habits) => broadcast('habits:changed', habits));
habitsManager.on('log-changed', (payload) => broadcast('habits:log-changed', payload));
habitsManager.on('gamification-updated', (gamification) => broadcast('habits:gamification-updated', gamification));

const atlasEngine = new AtlasEngine({ storePath: paths.atlas, getSettings: () => settings.data });
atlasEngine.bridgeHabitsManager(habitsManager);
atlasEngine.on('atlas:updated', (atlasState) => broadcast('atlas:updated', atlasState));

/** The store merges one level deep; fill in nested groups added later. */
function fillDefaults() {
  const d = settings.data;
  // Older installs had one text size for everything; start each widget from it.
  if (!d.fontScales || typeof d.fontScales !== 'object') {
    const old = Number(d.fontScale) || 1;
    d.fontScales = Object.fromEntries(Object.keys(DEFAULTS.fontScales).map((k) => [k, old]));
  }
  delete d.fontScale;
  delete d.plateOpacity;
  for (const key of ['clock', 'calendar', 'habits', 'pomodoro', 'fontScales', 'glass', 'todo', 'look', 'email', 'photo', 'classroom', 'superUrgent', 'whatsapp', 'widgetStyles', 'eco', 'folder', 'folderSettings']) {
    d[key] = { ...structuredClone(DEFAULTS[key]), ...(d[key] || {}) };
  }
  d.pomodoro = normalizeConfig(d.pomodoro);
  d.widgets = d.widgets || {};
  const defaultVisible = new Set(['clock', 'quran', 'todo', 'calendar', 'habits', 'folder']);
  for (const [id, spec] of Object.entries(WIDGETS)) {
    if (!d.widgets[id]) {
      d.widgets[id] = {
        visible: !d.initialized ? defaultVisible.has(id) : (id === 'folder' ? true : false),
        bounds: null,
        size: spec.size,
      };
    }
  }
  if (!d.widgets.folder) {
    d.widgets.folder = { visible: true, bounds: null, size: 's' };
  }
  if (d.alwaysOnTop === undefined) {
    d.alwaysOnTop = true;
  }
  settings.save();
}

function widgetSetting(id) {
  return settings.get('widgets', {})[id];
}

function patchWidget(id, patch) {
  const all = settings.get('widgets', {});
  all[id] = { ...(all[id] || {}), ...patch };
  settings.set('widgets', all);
}

/* ==================================================================== *
 * Pomodoro
 * ==================================================================== */

const pomodoro = new Pomodoro(paths.pomodoro, () => settings.get('pomodoro'));

/* ==================================================================== *
 * Email Engine
 * ==================================================================== */

const emailEngine = new EmailEngine(paths.emails, () => settings.data);
emailEngine.on('update', (data) => broadcast('email:update', data));
emailEngine.on('error', (err) => broadcast('email:error', { error: err }));
emailEngine.on('new-email', (mail) => {
  broadcast('email:new', mail);
  const cfg = settings.get('email', {});
  if (cfg.notify !== false && Notification.isSupported()) {
    const n = new Notification({
      title: mail.subject || T('email.new'),
      body: `${mail.from}: ${mail.snippet || ''}`,
      icon: iconPath(),
      silent: !cfg.sound,
    });
    n.on('click', () => {
      const win = windows.get('email');
      if (win && !win.isDestroyed()) {
        win.show();
        win.focus();
      }
    });
    n.show();
  }
});
// Note: emailEngine lifecycle is dynamically synchronized by syncWidgetServices()

/* ==================================================================== *
 * Classroom & Super Urgent & WhatsApp
 * ==================================================================== */

const whatsappDispatcher = new WhatsAppDispatcher();
const classroomEngine = new ClassroomEngine(
  () => settings.data,
  async (patch) => {
    settings.merge(patch);
    settings.flush();
    broadcast('settings:changed', publicSettings());
  }
);
const superUrgentMonitor = new SuperUrgentMonitor(
  todos,
  () => settings.data,
  whatsappDispatcher
);

superUrgentMonitor.on('desktop-alerts', (alerts) => {
  if (process.env.WIDGETS_SILENT || !Notification.isSupported()) return;
  for (const { task, msRemaining } of alerts) {
    const leftHours = Math.max(0, Math.round(msRemaining / 3600000));
    const title = `🚨 تنبيه عاجل جداً: ${task.text.slice(0, 50)}`;
    const body = msRemaining > 0
      ? `متبقي أقل من ${leftHours || 1} ساعة على موعد التسليم النهائي!`
      : 'انتهى موعد التسليم النهائي لهذه المهمة!';
    const n = new Notification({
      title,
      body,
      icon: iconPath(),
      urgency: 'critical',
    });
    n.on('click', () => openTask(task.id));
    n.show();
  }
});

superUrgentMonitor.on('state', (state) => {
  broadcast('todos:urgent-state', state);
});

const calendarEventsManager = new CalendarEventsManager(
  calendarEventsStore,
  () => settings.data,
  whatsappDispatcher
);

calendarEventsManager.on('alert', ({ event }) => {
  if (process.env.WIDGETS_SILENT || !Notification.isSupported()) return;
  const n = new Notification({
    title: `📅 تذكير مناسبة: ${event.title}`,
    body: `${event.notes ? event.notes + '\n' : ''}الموعد: ${event.date} ${event.time || ''}`,
    icon: iconPath(),
  });
  n.show();
});

calendarEventsManager.on('changed', (events) => {
  broadcast('calendar:events-changed', events);
});

calendarEventsManager.on('day-notes-changed', (notes) => {
  broadcast('calendar:day-notes-changed', notes);
});

const reliableDispatcher = new ReliableDispatcher(
  dispatchQueueStore,
  () => settings.data,
  { checkOnline: checkOpenWaOnline, start: startOpenWaServer }
);

reliableDispatcher.on('task-alert-sent', ({ task, stage, isLateCatchup }) => {
  debugLog(`[ReliableDispatcher] WhatsApp task alert sent: ${task.text} (${stage}, late=${isLateCatchup})`);
  if (!process.env.WIDGETS_SILENT && Notification.isSupported()) {
    const n = new Notification({
      title: isLateCatchup ? `🚨 استدراك مهمة: ${task.text.slice(0, 50)}` : `🚨 تسليم عاجل: ${task.text.slice(0, 50)}`,
      body: isLateCatchup ? 'تم إرسال تنبيه استدراك على الواتساب فور استيقاظ النظام' : 'تم إرسال تنبيه عاجل على الواتساب لموعد التسليم القريب',
      icon: iconPath(),
      urgency: 'critical',
    });
    n.on('click', () => openTask(task.id));
    n.show();
  }
});

reliableDispatcher.on('calendar-alert-sent', ({ event, timing, isLate }) => {
  debugLog(`[ReliableDispatcher] WhatsApp calendar alert sent: ${event.title} (${timing}, late=${isLate})`);
  if (!process.env.WIDGETS_SILENT && Notification.isSupported()) {
    const n = new Notification({
      title: isLate ? `📅 استدراك مناسبة: ${event.title}` : `📅 تذكير مناسبة: ${event.title}`,
      body: `الموعد: ${event.date} ${event.time || ''} - تم إرسال التنبيه على الواتساب`,
      icon: iconPath(),
    });
    n.show();
  }
});

/* ==================================================================== *
 * Habits & Life Intelligence Inter-Widget Synergy & WhatsApp Scheduler
 * ==================================================================== */

habitsManager.dispatcher = whatsappDispatcher;
// Note: habitsManager scheduler is dynamically synchronized by syncWidgetServices()

habitsManager.on('wa-prompt-sent', ({ date }) => {
  debugLog(`[HabitsManager] WhatsApp evening briefing sent for: ${date}`);
  if (!process.env.WIDGETS_SILENT && Notification.isSupported()) {
    const n = new Notification({
      title: '🌟 ملخص العادات اليومي',
      body: 'تم إرسال تقرير إنجاز العادات ومؤشر العافية إلى واتساب بنجاح',
      icon: iconPath(),
    });
    n.show();
  }
});

habitsManager.on('wa-habit-reminder-sent', ({ habit, date, recipient }) => {
  debugLog(`[HabitsManager] WhatsApp reminder sent for habit "${habit?.title}" on ${date} (recipient=${recipient || 'default'})`);
  if (!process.env.WIDGETS_SILENT && Notification.isSupported()) {
    const n = new Notification({
      title: `⏰ تذكير بموعد العادة: ${habit?.title || ''}`,
      body: `تم إرسال تذكير واتساب لهذه العادة بنجاح ${recipient ? `إلى (${recipient})` : ''}`,
      icon: iconPath(),
    });
    n.show();
  }
});

function syncHabitsToTodos() {
  const hSettings = settings.get('habits') || {};
  const today = new Date().toISOString().slice(0, 10);
  const currentTodos = todos.get('items', []);
  let modified = false;

  // 1. Purge all expired past-day habit tasks (where the day has passed, e.g. past 12:00 AM midnight)
  for (let i = currentTodos.length - 1; i >= 0; i--) {
    const t = currentTodos[i];
    const isHabitTask = Boolean(t.habitId || t.category === 'habit' || (t.id && String(t.id).startsWith('hbt_')));
    if (isHabitTask) {
      let taskDate = t.habitDate;
      if (!taskDate && t.id) {
        const parts = String(t.id).split('_');
        const lastPart = parts[parts.length - 1];
        if (/^\d{4}-\d{2}-\d{2}$/.test(lastPart)) {
          taskDate = lastPart;
        }
      }
      const isPastDay = taskDate ? taskDate < today : !String(t.id).endsWith(`_${today}`);
      if (isPastDay || hSettings.syncToTodo === false) {
        currentTodos.splice(i, 1);
        modified = true;
      }
    }
  }

  if (hSettings.syncToTodo === false) {
    if (modified) {
      todos.set('items', currentTodos);
      todos.flush();
      broadcast('todos:changed', currentTodos);
    }
    return;
  }

  const activeHabits = habitsManager.getHabits(false);
  const dayLog = habitsManager.getLog(today);

  for (const h of activeHabits) {
    const todoId = `hbt_${h.id}_${today}`;
    const existingIndex = currentTodos.findIndex((t) => t.id === todoId);

    // Per-habit sync flag: only sync if h.syncToTodo is true (or if not explicitly false and scheduled)
    const isScheduled = habitsManager.isHabitScheduledForDate(h, new Date());
    const shouldSync = Boolean(h.syncToTodo);

    if (!isScheduled || !shouldSync) {
      if (existingIndex >= 0) {
        currentTodos.splice(existingIndex, 1);
        modified = true;
      }
      continue;
    }

    const hLog = dayLog.habits && dayLog.habits[h.id];
    const isDone = Boolean(hLog && (hLog.status === 'done' || (hLog.status === 'partial' && Number(hLog.value) >= (Number(h.targetValue) || 1))));
    const isSkip = Boolean(hLog && hLog.status === 'skip');
    const prio = h.todoPriority !== undefined ? Number(h.todoPriority) : 1;

    if (existingIndex < 0) {
      if (!isSkip) {
        currentTodos.push({
          id: todoId,
          text: `${h.icon || '🔥'} [عادة] ${h.title}`,
          done: isDone,
          priority: prio,
          category: 'habit',
          habitId: h.id,
          habitDate: today,
          createdAt: Date.now(),
          doneAt: isDone ? Date.now() : null,
        });
        modified = true;
      }
    } else {
      const existing = currentTodos[existingIndex];
      if (isSkip) {
        currentTodos.splice(existingIndex, 1);
        modified = true;
      } else {
        existing.habitDate = today;
        if (existing.done !== isDone) {
          existing.done = isDone;
          existing.doneAt = isDone ? (existing.doneAt || Date.now()) : null;
          modified = true;
        }
        if (existing.priority !== prio) {
          existing.priority = prio;
          modified = true;
        }
      }
    }
  }

  if (modified) {
    todos.set('items', currentTodos);
    todos.flush();
    broadcast('todos:changed', currentTodos);
  }
}

function syncHabitsToCalendar() {
  const hSettings = settings.get('habits') || {};
  if (hSettings.syncToCalendar === false) return;

  const today = new Date().toISOString().slice(0, 10);
  const activeHabits = habitsManager.getHabits(false);
  const dayLog = habitsManager.getLog(today);
  const currentEvents = calendarEventsStore.get('events', []) || [];
  let modified = false;

  for (const h of activeHabits) {
    const eventId = `cal_hbt_${h.id}_${today}`;
    const existingIndex = currentEvents.findIndex((e) => e.id === eventId);
    const isScheduled = habitsManager.isHabitScheduledForDate(h, new Date());
    const shouldSync = Boolean(h.syncToCalendar);

    if (!isScheduled || !shouldSync) {
      if (existingIndex >= 0) {
        currentEvents.splice(existingIndex, 1);
        modified = true;
      }
      continue;
    }

    const hLog = dayLog.habits && dayLog.habits[h.id];
    const isDone = Boolean(hLog && (hLog.status === 'done' || (hLog.status === 'partial' && Number(hLog.value) >= (Number(h.targetValue) || 1))));
    const defaultTime = h.routine === 'morning' ? '08:00' : (h.routine === 'afternoon' ? '14:00' : (h.routine === 'evening' ? '20:00' : '10:00'));
    const time = h.calendarTime || defaultTime;
    const duration = Number(h.calendarDuration) || 30;

    const eventData = {
      id: eventId,
      title: `${h.icon || '🔥'} [عادة] ${h.title}`,
      date: today,
      time,
      duration,
      category: 'habit',
      completed: isDone,
      notes: `عادة: ${h.title} | الهدف: ${h.targetValue || 1} ${h.unit || ''} | الحالة: ${isDone ? 'منجزة ✅' : 'قيد الانتظار ⏳'}`,
      habitId: h.id,
      color: h.color || '#3b82f6',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    if (existingIndex < 0) {
      currentEvents.push(eventData);
      modified = true;
    } else {
      const existing = currentEvents[existingIndex];
      if (existing.completed !== isDone || existing.time !== time || existing.title !== eventData.title) {
        currentEvents[existingIndex] = { ...existing, ...eventData };
        modified = true;
      }
    }
  }

  if (modified) {
    calendarEventsStore.set('events', currentEvents);
    calendarEventsStore.flush();
    broadcast('calendar:events-changed', currentEvents);
  }
}

habitsManager.on('habits-changed', (habits) => {
  broadcast('habits:changed', habits);
  syncHabitsToTodos();
  syncHabitsToCalendar();
});
habitsManager.on('log-changed', (payload) => {
  broadcast('habits:log-changed', payload);
  syncHabitsToTodos();
  syncHabitsToCalendar();
});

let lastHabitPromptDate = null;
let lastHabitDigestWeek = null;
let lastDayRollDate = new Date().toISOString().slice(0, 10);

function scheduleMidnightRollover() {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
  const msUntilMidnight = Math.max(1000, tomorrow.getTime() - now.getTime());
  setTimeout(() => {
    syncHabitsToTodos();
    syncHabitsToCalendar();
    scheduleMidnightRollover();
  }, msUntilMidnight).unref?.();
}

async function checkHabitsAutomations() {
  try {
    const hSettings = settings.get('habits') || {};
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const curTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Midnight Rollover: automatically purge past-day habits and refresh today's schedule at 12:00 AM
    if (today !== lastDayRollDate) {
      lastDayRollDate = today;
      syncHabitsToTodos();
      syncHabitsToCalendar();
    }

    // 1. Daily Evening Prompt via WhatsApp
    if (hSettings.waEveningPrompt && hSettings.waEveningTime) {
      if (curTime === hSettings.waEveningTime && lastHabitPromptDate !== today) {
        lastHabitPromptDate = today;
        const reportLang = hSettings.reportLang || 'ar';
        const reportText = habitsManager.generateWhatsAppReport('daily', today, reportLang);
        const recipient = hSettings.waRecipientOverride || '';
        await WhatsAppDispatcher.send(settings.data, {
          type: 'habits_report',
          text: reportText,
          recipient,
        });
      }
    }

    // 2. Weekly Digest via WhatsApp (Friday evening)
    if (hSettings.waWeeklyDigest) {
      const dayOfWeek = now.getDay();
      const weekNum = `${now.getFullYear()}-W${Math.ceil(now.getDate() / 7)}`;
      if (dayOfWeek === 5 && curTime === (hSettings.waEveningTime || '21:00') && lastHabitDigestWeek !== weekNum) {
        lastHabitDigestWeek = weekNum;
        const reportLang = hSettings.reportLang || 'ar';
        const reportText = habitsManager.generateWhatsAppReport('weekly', today, reportLang);
        const recipient = hSettings.waRecipientOverride || '';
        await WhatsAppDispatcher.send(settings.data, {
          type: 'habits_report',
          text: reportText,
          recipient,
        });
      }
    }
  } catch (err) {
    if (VERBOSE) console.error('checkHabitsAutomations error:', err);
  }
}
habitsManager.on('gamification-updated', (g) => {
  broadcast('habits:gamification-updated', g);
});

/* ==================================================================== *
 * Google Classroom Auto Background Poller (every 30 minutes)
 * ==================================================================== */

let classroomSyncIntervalTimer = null;
const CLASSROOM_SYNC_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

async function runClassroomBackgroundSync() {
  if (currentPowerState.suspended || currentPowerState.locked) return null;
  const cfg = settings.get('classroom', {});
  if (!cfg.enabled) return null;
  if (!cfg.accessToken && !cfg.refreshToken && !cfg.iCalUrl) return null;

  try {
    const currentTodos = todos.get('items', []);
    const res = await classroomEngine.sync(currentTodos);
    if (res && res.items) {
      todos.set('items', res.items);
      broadcast('todos:changed', res.items);
      reminders.schedule();
      superUrgentMonitor.evaluate();
      reliableDispatcher.catchup({
        todos: res.items,
        calendarEvents: calendarEventsStore.get('events', []),
      });
    }
    broadcast('classroom:sync-done', res);
    return res;
  } catch (err) {
    console.error('Auto Classroom sync error:', err.message);
    const errPayload = { ok: false, error: err.message, authError: true };
    broadcast('classroom:sync-done', errPayload);
    broadcast('classroom:error', errPayload);
    return errPayload;
  }
}

function startClassroomSyncTimer() {
  if (classroomSyncIntervalTimer) clearInterval(classroomSyncIntervalTimer);
  classroomSyncIntervalTimer = setInterval(() => {
    runClassroomBackgroundSync();
  }, CLASSROOM_SYNC_INTERVAL_MS);
}

/* ==================================================================== *
 * OpenWA Local Server Process Manager
 * ==================================================================== */

let openwaChildProcess = null;

function getOpenWaPaths() {
  const os = require('os');
  const candidates = [
    process.env.OPENWA_DIR,
    'C:\\Users\\ahmed\\Apps\\OpenWA-Server',
    path.join(os.homedir(), 'Apps', 'OpenWA-Server'),
    path.join(__dirname, 'src', 'core'),
  ].filter(Boolean);

  for (const dir of candidates) {
    const s1 = path.join(dir, 'server.js');
    if (fs.existsSync(s1)) return { dir, script: s1 };
    const s2 = path.join(dir, 'openwa-server.js');
    if (fs.existsSync(s2) && fs.existsSync(path.join(dir, 'node_modules'))) return { dir, script: s2 };
  }
  return { dir: 'C:\\Users\\ahmed\\Apps\\OpenWA-Server', script: 'C:\\Users\\ahmed\\Apps\\OpenWA-Server\\server.js' };
}

function checkOpenWaOnline() {
  return new Promise((resolve) => {
    const req = http.get('http://127.0.0.1:2785/api/sessions/default/status', { timeout: 1500 }, (res) => {
      let b = '';
      res.on('data', (c) => { b += c; });
      res.on('end', () => {
        try {
          const data = JSON.parse(b);
          resolve({ online: true, ...data });
        } catch {
          resolve({ online: true, status: 'UNKNOWN' });
        }
      });
    });
    req.on('error', () => resolve({ online: false, status: 'STOPPED' }));
    req.on('timeout', () => { req.destroy(); resolve({ online: false, status: 'TIMEOUT' }); });
  });
}

function getNodeExecutable() {
  if (process.platform !== 'win32') return 'node';
  const candidates = [
    'C:\\Program Files\\nodejs\\node.exe',
    'C:\\Program Files (x86)\\nodejs\\node.exe',
    process.env.NODE_PATH,
  ];
  for (const c of candidates) {
    if (c && fs.existsSync(c)) return c;
  }
  return 'node';
}

async function startOpenWaServer() {
  const check = await checkOpenWaOnline();
  if (check.online) return { ok: true, alreadyRunning: true, ...check };

  const { dir, script } = getOpenWaPaths();
  debugLog('startOpenWaServer: dir=' + dir + ', script=' + script);
  if (!fs.existsSync(script)) {
    debugLog('startOpenWaServer error: script not found');
    return { ok: false, error: 'ملف سيرفر OpenWA غير موجود في مسار التثبيت' };
  }

  try {
    const { spawn } = require('child_process');
    const nodeBin = getNodeExecutable();
    debugLog('startOpenWaServer: spawning ' + nodeBin + ' in ' + dir);
    openwaChildProcess = spawn(nodeBin, [script], {
      cwd: dir,
      detached: false,
      stdio: 'ignore',
      windowsHide: true,
    });

    openwaChildProcess.on('exit', (code) => {
      debugLog('openwaChildProcess exited with code: ' + code);
      openwaChildProcess = null;
    });

    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 500));
      const res = await checkOpenWaOnline();
      if (res.online) return { ok: true, started: true, ...res };
    }

    return { ok: true, started: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function stopOpenWaServer() {
  if (openwaChildProcess) {
    try {
      openwaChildProcess.kill('SIGTERM');
    } catch { }
    openwaChildProcess = null;
  }
  try {
    const { execSync } = require('child_process');
    if (process.platform === 'win32') {
      execSync('powershell -Command "Get-NetTCPConnection -LocalPort 2785 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"', { windowsHide: true });
    } else {
      execSync('fuser -k 2785/tcp 2>/dev/null || true');
    }
  } catch { }
  return { ok: true, status: 'STOPPED' };
}

function getOpenWaQr() {
  return new Promise((resolve) => {
    const req = http.get('http://127.0.0.1:2785/api/sessions/default/qr', { timeout: 2000 }, (res) => {
      let b = '';
      res.on('data', (c) => { b += c; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(b));
        } catch {
          resolve({ qr: null, status: 'ERROR' });
        }
      });
    });
    req.on('error', () => resolve({ qr: null, status: 'OFFLINE' }));
    req.on('timeout', () => { req.destroy(); resolve({ qr: null, status: 'TIMEOUT' }); });
  });
}

/* ==================================================================== *
 * Geometry helpers bound to the real screens
 * ==================================================================== */

function workAreas() {
  return screen.getAllDisplays().map((d) => d.workArea);
}

function primaryArea() {
  return screen.getPrimaryDisplay().workArea;
}

function areaFor(bounds) {
  return geo.pickArea(bounds, workAreas());
}

/**
 * Default positions. If the chosen sizes do not all fit on this screen, the
 * layout falls back to the small size of each widget rather than letting
 * widgets overlap or fall off the edge.
 */
function computeLayout(area = primaryArea()) {
  const blocksFor = (sizeOf) => LAYOUT.map((row) => row
    .filter((id) => widgetSetting(id)?.visible)
    .map((id) => {
      const [w, h] = sizeOf(id);
      const size = geo.clampSize(w, h, area, WIDGETS[id].min, WIDGETS[id].max);
      return { id, ...size };
    }));
  const chosen = (id) => {
    const s = widgetSetting(id)?.size;
    const sz = (s && s !== 'icon') ? s : WIDGETS[id].size;
    return WIDGETS[id].sizes[sz] || WIDGETS[id].sizes.m || WIDGETS[id].sizes.s;
  };
  const first = geo.packColumnsChecked(blocksFor(chosen), area);
  if (first.fits) return first.layout;
  const small = geo.packColumnsChecked(blocksFor((id) => WIDGETS[id].sizes.s), area);
  return small.fits ? small.layout : first.layout;
}

/** Saved bounds, made valid for the screens that exist right now. */
function safeBounds(id, bounds) {
  const spec = WIDGETS[id];
  if (!bounds || typeof bounds.x !== 'number') return null;
  const area = areaFor(bounds);
  const saved = widgetSetting(id);
  const isIcon = (bounds.width <= 90 && bounds.height <= 90) || (saved && (saved.size === 'icon' || saved.isMini));
  const minLimit = isIcon ? [44, 44] : spec.min;
  const maxLimit = isIcon ? [56, 56] : spec.max;
  const size = geo.clampSize(bounds.width, bounds.height, area, minLimit, maxLimit);
  return geo.clampToArea({ x: bounds.x, y: bounds.y, ...size }, area);
}

/* ==================================================================== *
 * Windows
 * ==================================================================== */

/** @type {Map<string, BrowserWindow>} */
const windows = new Map();
let tray = null;
let quranTimer = null;

/* ==================================================================== *
 * External Links & Google Chrome Profile Launcher
 * ==================================================================== */

function getChromeProfiles() {
  const localAppData = process.env.LOCALAPPDATA || '';
  const localStatePath = path.join(localAppData, 'Google', 'Chrome', 'User Data', 'Local State');
  const profiles = [];
  if (fs.existsSync(localStatePath)) {
    try {
      const raw = JSON.parse(fs.readFileSync(localStatePath, 'utf8'));
      const infoCache = raw.profile?.info_cache || {};
      for (const [folderName, data] of Object.entries(infoCache)) {
        profiles.push({
          folder: folderName,
          name: data.name || folderName,
          email: data.user_name || '',
          hostedDomain: data.hosted_domain || '',
          avatarIcon: data.avatar_icon || '',
          isDefault: folderName === 'Default',
        });
      }
    } catch (err) {
      console.error('[browser] Failed to parse Chrome Local State:', err.message);
    }
  }
  return profiles;
}

function findChromeExecutable() {
  const candidates = [
    path.join(process.env.PROGRAMFILES || 'C:\\Program Files', 'Google', 'Chrome', 'Application', 'chrome.exe'),
    path.join(process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)', 'Google', 'Chrome', 'Application', 'chrome.exe'),
    path.join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];
  for (const c of candidates) {
    if (c && fs.existsSync(c)) return c;
  }
  return null;
}

const recentOpenedUrls = new Map();

function openExternalUrl(url) {
  if (typeof url !== 'string' || !url.trim()) return;
  url = url.trim();

  // Deduplicate rapid duplicate openings (within 1200ms) for the exact same URL
  const now = Date.now();
  const lastTime = recentOpenedUrls.get(url);
  if (lastTime && (now - lastTime) < 1200) {
    debugLog(`[browser] Suppressed duplicate openExternalUrl within ${now - lastTime}ms for: ${url}`);
    return;
  }
  recentOpenedUrls.set(url, now);
  if (recentOpenedUrls.size > 100) {
    for (const [u, t] of recentOpenedUrls.entries()) {
      if (now - t > 10000) recentOpenedUrls.delete(u);
    }
  }

  // If non-http(s) (e.g. mailto:), pass directly to OS default handler
  if (!/^https?:\/\//i.test(url)) {
    shell.openExternal(url).catch((err) => console.error('[browser] shell.openExternal failed:', err.message));
    return;
  }

  const bCfg = settings.get('browser', DEFAULTS.browser || {}) || {};
  const mode = bCfg.mode || 'chrome_profile';

  if (mode === 'system') {
    shell.openExternal(url).catch((err) => console.error('[browser] shell.openExternal failed:', err.message));
    return;
  }

  const chromeExe = (bCfg.customPath && fs.existsSync(bCfg.customPath)) ? bCfg.customPath : findChromeExecutable();
  if (!chromeExe) {
    shell.openExternal(url).catch((err) => console.error('[browser] Chrome not found, fallback to shell.openExternal:', err.message));
    return;
  }

  let profileFolder = bCfg.chromeProfile;
  if (!profileFolder && bCfg.userEmail) {
    const profs = getChromeProfiles();
    const found = profs.find((p) => p.email && p.email.toLowerCase() === bCfg.userEmail.toLowerCase());
    if (found) profileFolder = found.folder;
  }

  // Automatic heuristic match if not explicitly configured
  if (!profileFolder) {
    const emailUser = (settings.get('email', {})?.user || settings.get('classroom', {})?.userEmail || '').trim().toLowerCase();
    if (emailUser) {
      const profs = getChromeProfiles();
      const found = profs.find((p) => p.email && p.email.toLowerCase() === emailUser);
      if (found) profileFolder = found.folder;
    }
  }

  if (!profileFolder) {
    profileFolder = 'Default';
  }

  try {
    const { spawn } = require('child_process');
    const proc = spawn(chromeExe, [`--profile-directory=${profileFolder}`, url], { detached: true, stdio: 'ignore' });
    proc.unref();
  } catch (err) {
    console.error('[browser] spawn Chrome failed, fallback to shell.openExternal:', err.message);
    shell.openExternal(url).catch(() => { });
  }
}

function preloadPath() {
  return path.join(__dirname, 'preload.js');
}

const VERBOSE = ['--dev', '--shoot', '--selftest'].some((f) => process.argv.includes(f))
  || process.argv.some((a) => a.startsWith('--run='));

/** Surface renderer errors on the terminal while developing. */
function traceRenderer(win, label) {
  if (!VERBOSE) return;
  win.webContents.on('console-message', (_e, level, message, line, source) => {
    const where = source ? `${path.basename(source)}:${line}` : '';
    console.log(`[${label}] ${message}${where ? `  (${where})` : ''}`);
  });
  win.webContents.on('preload-error', (_e, file, err) => {
    console.error(`[${label}] preload failed in ${file}:`, err);
  });
  win.webContents.on('did-fail-load', (_e, code, desc) => {
    console.error(`[${label}] load failed ${code}: ${desc}`);
  });
}

function widgetIdOf(win) {
  for (const [id, w] of windows) if (w === win) return id;
  return null;
}

function revealWidgetWindow(win) {
  if (!win || win.isDestroyed() || win._revealed) return;
  win._revealed = true;
  const id = widgetIdOf(win);
  const spec = id ? WIDGETS[id] : null;
  const saved = id ? widgetSetting(id) : null;
  const isIconSaved = Boolean(saved && (saved.size === 'icon' || saved.isMini || (saved.bounds && saved.bounds.width <= 90)));
  const inFolder = id && isWidgetInAnyFolder(id);

  if (id !== 'folder' && inFolder && isIconSaved) {
    win.hide();
    return;
  }

  if (settings.get('alwaysOnTop')) {
    win.setAlwaysOnTop(true);
  }
  win.show();
  if (!isIconSaved) {
    win.focus();
  }
}

function createWidget(id, opts = {}) {
  debugLog(`createWidget called for: ${id}`);
  const spec = WIDGETS[id];
  if (!spec) return null;
  const saved = widgetSetting(id);
  const isIconSaved = Boolean(saved && (saved.size === 'icon' || saved.isMini || (saved.bounds && saved.bounds.width <= 90)));
  const rawBounds = opts.bounds || ((isIconSaved && saved && saved.iconBounds) ? saved.iconBounds : (saved && saved.bounds));
  let bounds = opts.bounds || safeBounds(id, rawBounds) || computeLayout()[id]
    || geo.clampToArea({ x: 0, y: 0, width: spec.sizes[spec.size][0], height: spec.sizes[spec.size][1] }, primaryArea());
  if (bounds) {
    const area = areaFor(bounds);
    const snapEnabled = settings.get('snapToDesktopGrid') !== false;
    const existingWin = windows.get(id);
    const others = otherWidgetBounds(existingWin);
    if (isIconSaved) {
      if (snapEnabled) {
        const grid = geo.getDesktopGridMetrics();
        bounds = geo.snapToDesktopGrid({ ...bounds, width: 56, height: 56 }, area, others, { ...grid, avoidCollisions: true });
      } else {
        bounds = geo.avoidCollisions({ ...bounds, width: 56, height: 56 }, area, others, 4);
      }
    } else {
      bounds = geo.avoidCollisions(bounds, area, others, 4);
    }
  }
  debugLog(`createWidget ${id} bounds: ${JSON.stringify(bounds)}`);

  if (windows.has(id)) {
    const existing = windows.get(id);
    if (!existing.isDestroyed()) {
      existing.setResizable(true);
      existing.setMinimumSize(isIconSaved ? 48 : spec.min[0], isIconSaved ? 48 : spec.min[1]);
      existing.setMaximumSize(isIconSaved ? 90 : spec.max[0], isIconSaved ? 90 : spec.max[1]);
      existing.setResizable(!isIconSaved);
      if (bounds) existing.setBounds(bounds);
      existing.show();
      existing.focus();
      if (settings.get('alwaysOnTop')) existing.setAlwaysOnTop(true);
      try { existing.webContents.send('settings:changed', publicSettings()); } catch { }
      return existing;
    }
  }

  const win = new BrowserWindow({
    ...bounds,
    minWidth: isIconSaved ? 48 : spec.min[0],
    minHeight: isIconSaved ? 48 : spec.min[1],
    maxWidth: isIconSaved ? 90 : spec.max[0],
    maxHeight: isIconSaved ? 90 : spec.max[1],
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    hasShadow: false,          // the plate draws its own, so corners stay soft
    resizable: !isIconSaved,
    maximizable: false,
    minimizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: Boolean(settings.get('alwaysOnTop')),
    show: false,
    roundedCorners: false,     // Disabled: DWM OS rounding causes black square corner artifacts behind custom CSS border-radius!
    title: titleOf(id),
    webPreferences: {
      preload: preloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      spellcheck: false,
      backgroundThrottling: true,
    },
  });

  win.setMenu(null);
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (typeof url === 'string' && (/^https?:\/\//i.test(url) || /^mailto:/i.test(url))) {
      openExternalUrl(url);
    }
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (event, url) => {
    if (typeof url === 'string') {
      if (url.startsWith('file://')) return;
      event.preventDefault();
      if (/^https?:\/\//i.test(url) || /^mailto:/i.test(url)) {
        openExternalUrl(url);
      }
    }
  });
  traceRenderer(win, id);
  win.webContents.on('did-fail-load', (_e, code, desc) => {
    debugLog(`[${id}] did-fail-load: ${desc} (${code})`);
  });
  const htmlPath = path.join(__dirname, 'windows', spec.file);
  debugLog(`[${id}] loading file: ${htmlPath}`);
  win.loadFile(htmlPath);

  if (opts.immediateShow) {
    win.setBounds(bounds);
    revealWidgetWindow(win);
  }

  win.once('ready-to-show', () => {
    debugLog(`[${id}] ready-to-show event fired!`);
    // Windows may nudge a new window; put it exactly where it belongs.
    win.setBounds(bounds);
    if (!win._revealed) {
      setTimeout(() => {
        if (!win.isDestroyed() && !win._revealed) {
          revealWidgetWindow(win);
        }
      }, 350);
    }
  });

  win.on('minimize', () => {
    // Windows Win+D minimizes all windows. Desktop widgets must restore themselves!
    setTimeout(() => {
      if (!win.isDestroyed()) {
        win.restore();
        if (settings.get('alwaysOnTop')) win.setAlwaysOnTop(true);
      }
    }, 120);
  });

  const persist = debounce(() => {
    if (win.isDestroyed()) return;
    let curBounds = win.getBounds();
    if (curBounds.width <= 90 && curBounds.height <= 90) {
      curBounds = { ...curBounds, width: 56, height: 56 };
      patchWidget(id, { bounds: curBounds, iconBounds: curBounds, isMini: true, size: 'icon' });
    } else {
      patchWidget(id, { bounds: curBounds, prevNormalBounds: curBounds, isMini: false });
    }
    settings.save();
  }, 400);

  win.on('move', persist);
  win.on('resize', persist);
  win.on('close', () => debugLog(`[${id}] win 'close' event fired`));
  win.on('closed', () => {
    debugLog(`[${id}] win 'closed' event fired`);
    if (windows.get(id) === win) windows.delete(id);
  });

  windows.set(id, win);
  return win;
}

function destroyWidget(id) {
  const win = windows.get(id);
  if (win && !win.isDestroyed()) {
    try {
      if (win.webContents && !win.webContents.isDestroyed()) {
        win.webContents.stop();
      }
      win.close();
      if (!win.isDestroyed()) win.destroy();
    } catch (e) {
      debugLog(`[destroyWidget] Error closing window for ${id}: ${e?.message || e}`);
    }
  }
  windows.delete(id);

  // Clear session cache and invoke V8 GC to immediately reclaim memory
  try {
    session.defaultSession?.clearCache?.();
  } catch { }
  if (typeof global.gc === 'function') {
    try { global.gc(); } catch { }
  }

  syncWidgetServices();
}

function syncWidgetServices() {
  const isEmailActive = Boolean(widgetSetting('email')?.visible);
  const isCalendarActive = Boolean(widgetSetting('calendar')?.visible);
  const isTodoActive = Boolean(widgetSetting('todo')?.visible);
  const isQuranActive = Boolean(widgetSetting('quran')?.visible);
  const isPomodoroActive = Boolean(widgetSetting('pomodoro')?.visible);
  const isHabitsActive = Boolean(widgetSetting('habits')?.visible && settings.data?.habits?.enabled !== false);

  // 1. EmailEngine
  try {
    if (typeof emailEngine !== 'undefined' && emailEngine) {
      if (isEmailActive) {
        if (!emailEngine.pollTimer && !emailEngine.idleClient) {
          debugLog('[SyncServices] Starting EmailEngine...');
          emailEngine.start();
        }
      } else {
        if (emailEngine.pollTimer || emailEngine.idleClient || emailEngine.running) {
          debugLog('[SyncServices] Stopping EmailEngine...');
          emailEngine.stop();
        }
      }
    }
  } catch (e) {
    debugLog('[SyncServices] Error syncing EmailEngine: ' + e?.message);
  }

  // 2. CalendarEventsManager
  try {
    if (typeof calendarEventsManager !== 'undefined' && calendarEventsManager) {
      if (isCalendarActive) {
        if (!calendarEventsManager.timer) {
          debugLog('[SyncServices] Starting CalendarEventsManager...');
          calendarEventsManager.start(60000);
        }
      } else {
        if (calendarEventsManager.timer) {
          debugLog('[SyncServices] Stopping CalendarEventsManager...');
          calendarEventsManager.stop();
        }
      }
    }
  } catch (e) {
    debugLog('[SyncServices] Error syncing CalendarEventsManager: ' + e?.message);
  }

  // 3. SuperUrgentMonitor, ClassroomSync & Reminders (Tasks/Todo)
  try {
    if (isTodoActive) {
      if (typeof superUrgentMonitor !== 'undefined' && superUrgentMonitor && !superUrgentMonitor.timer) {
        debugLog('[SyncServices] Starting SuperUrgentMonitor...');
        superUrgentMonitor.start(30000);
      }
      if (!classroomSyncIntervalTimer) {
        debugLog('[SyncServices] Starting ClassroomSyncTimer...');
        startClassroomSyncTimer();
      }
      if (typeof reminders !== 'undefined' && reminders && !reminders.timer) {
        reminders.schedule();
      }
    } else {
      if (typeof superUrgentMonitor !== 'undefined' && superUrgentMonitor && superUrgentMonitor.timer) {
        debugLog('[SyncServices] Stopping SuperUrgentMonitor...');
        superUrgentMonitor.stop();
      }
      if (classroomSyncIntervalTimer) {
        debugLog('[SyncServices] Stopping ClassroomSyncTimer...');
        clearInterval(classroomSyncIntervalTimer);
        classroomSyncIntervalTimer = null;
      }
      if (typeof reminders !== 'undefined' && reminders) {
        reminders.stop?.();
      }
    }
  } catch (e) {
    debugLog('[SyncServices] Error syncing SuperUrgentMonitor / Classroom: ' + e?.message);
  }

  // 4. ReliableDispatcher (shared between todo and calendar)
  try {
    if (typeof reliableDispatcher !== 'undefined' && reliableDispatcher) {
      if (isTodoActive || isCalendarActive) {
        if (!reliableDispatcher.timer) {
          debugLog('[SyncServices] Starting ReliableDispatcher...');
          reliableDispatcher.start(30000, () => ({
            todos: isTodoActive ? todos.get('items', []) : [],
            calendarEvents: isCalendarActive ? calendarEventsStore.get('events', []) : [],
          }));
        }
      } else {
        if (reliableDispatcher.timer) {
          debugLog('[SyncServices] Stopping ReliableDispatcher...');
          reliableDispatcher.stop();
        }
      }
    }
  } catch (e) {
    debugLog('[SyncServices] Error syncing ReliableDispatcher: ' + e?.message);
  }

  // 5. Quran timer
  try {
    if (isQuranActive) {
      if (!quranTimer) {
        debugLog('[SyncServices] Quran active, refreshing & scheduling...');
        refreshQuran(false);
      }
    } else {
      if (quranTimer) {
        debugLog('[SyncServices] Stopping Quran timer...');
        clearTimeout(quranTimer);
        quranTimer = null;
      }
    }
  } catch (e) {
    debugLog('[SyncServices] Error syncing QuranTimer: ' + e?.message);
  }

  // 6. Pomodoro
  try {
    if (typeof pomodoro !== 'undefined' && pomodoro && !isPomodoroActive) {
      if (pomodoro.store?.data?.status === 'running') {
        debugLog('[SyncServices] Pausing Pomodoro timer...');
        pomodoro.pause();
      }
    }
  } catch (e) {
    debugLog('[SyncServices] Error syncing Pomodoro: ' + e?.message);
  }

  // 7. Habits Scheduler
  try {
    if (typeof habitsManager !== 'undefined' && habitsManager) {
      if (isHabitsActive) {
        if (!habitsManager._schedulerTimer) {
          debugLog('[SyncServices] Starting Habits scheduler...');
          habitsManager.startScheduler();
        }
      } else {
        if (habitsManager._schedulerTimer) {
          debugLog('[SyncServices] Stopping Habits scheduler...');
          habitsManager.stopScheduler();
        }
      }
    }
  } catch (e) {
    debugLog('[SyncServices] Error syncing HabitsManager: ' + e?.message);
  }
}

function setWidgetVisible(id, visible) {
  if (id.startsWith('folder') || id === 'folder') {
    const fid = id === 'folder' ? (Object.keys(getFolders())[0] || 'folder_1') : id;
    if (!visible) {
      const folders = getFolders();
      delete folders[fid];
      saveFolders(folders);
      destroyWidget(fid);
    } else {
      createFolderWidget(fid);
    }
    broadcast('settings:changed', publicSettings());
    rebuildTray();
    syncWidgetServices();
    return;
  }
  if (!WIDGETS[id]) return;
  patchWidget(id, { visible: Boolean(visible), ...(visible ? {} : { inFolder: null }) });
  if (id === 'habits' && settings.data?.habits) {
    settings.data.habits.enabled = Boolean(visible);
  }
  settings.flush();
  if (visible) {
    createWidget(id);
  } else {
    destroyWidget(id);
    removeWidgetFromAllFolders(id);
  }
  syncWidgetServices();
  syncFolderWithDesktop();
  rebuildTray();
}

/** Apply a size preset, keeping the widget's right edge where it is. */
function setWidgetSize(id, key) {
  const isFolder = Boolean(typeof id === 'string' && id.startsWith('folder'));
  const spec = isFolder ? WIDGETS.folder : WIDGETS[id];
  if (!spec || !spec.sizes[key]) return null;
  const win = windows.get(id);
  if (key === 'icon') {
    if (win && !win.isDestroyed()) {
      return toggleWidgetMini(win);
    } else {
      if (!isFolder) patchWidget(id, { size: 'icon', isMini: true });
      settings.flush();
      return null;
    }
  }
  if (!isFolder) {
    patchWidget(id, { size: key, isMini: false });
  }
  if (!win || win.isDestroyed()) {
    settings.flush();
    return null;
  }
  win.setResizable(true);
  win.setMinimumSize(spec.min[0], spec.min[1]);
  win.setMaximumSize(spec.max[0], spec.max[1]);
  const b = win.getBounds();
  const area = areaFor(b);
  const [w, h] = spec.sizes[key];
  const size = geo.clampSize(w, h, area, spec.min, spec.max);
  let next = geo.clampToArea({ x: b.x + b.width - size.width, y: b.y, ...size }, area);
  next = applyDesktopCollisionDisplacement(id, next, win);
  win.setBounds(next);
  if (isFolder) {
    const folders = getFolders();
    if (folders[id]) {
      folders[id].bounds = next;
      folders[id].size = key;
      saveFolders(folders);
    }
  } else {
    patchWidget(id, { bounds: next, prevNormalBounds: next, prevNormalKey: key, isMini: false });
  }
  settings.flush();
  return next;
}

/** The preset closest to a window's current size, for the menu's tick. */
function currentSizeKey(id) {
  const win = windows.get(id);
  const isFolder = Boolean(win?._isFolder || (typeof id === 'string' && id.startsWith('folder')));
  const spec = isFolder ? WIDGETS.folder : WIDGETS[id];
  if (!spec) return null;
  if (!win || win.isDestroyed()) {
    if (isFolder) {
      const f = getFolder(id);
      return f?.size || 's';
    }
    return widgetSetting(id)?.size || spec.size;
  }
  const b = win.getBounds();
  if (!isFolder && b.width <= 90 && b.height <= 90) return 'icon';
  let best = null;
  let bestD = Infinity;
  for (const [k, [w, h]] of Object.entries(spec.sizes)) {
    const d = Math.abs(w - b.width) + Math.abs(h - b.height);
    if (d < bestD) { bestD = d; best = k; }
  }
  return bestD <= 32 ? best : null;
}

/** Toggle a widget between its saved normal size and compact desktop app icon mode (72x72). */
function toggleWidgetMini(win) {
  if (!win || win.isDestroyed()) return null;
  const id = widgetIdOf(win);
  if (!id || !WIDGETS[id]) return null;
  const spec = WIDGETS[id];
  const b = win.getBounds();
  const curSetting = widgetSetting(id) || {};
  const isIcon = (b.width <= 90 && b.height <= 90) || (curSetting.size === 'icon') || Boolean(curSetting.isMini);

  if (isIcon) {
    // 1. SMART OPEN: Save icon's current position so next minimize returns exactly here!
    patchWidget(id, { iconBounds: b, isMini: false });
    try { win.webContents.send('widget:prepare-expand'); } catch (_) { }
    win.setResizable(true);
    win.setMinimumSize(spec.min[0], spec.min[1]);
    win.setMaximumSize(spec.max[0], spec.max[1]);

    const targetSize = curSetting.prevNormalKey || win._prevNormalKey || (spec.sizes.m ? 'm' : 's');
    const prevBounds = curSetting.prevNormalBounds || win._prevNormalBounds;
    const targetW = prevBounds?.width || spec.sizes[targetSize]?.[0] || spec.sizes.m?.[0] || 320;
    const targetH = prevBounds?.height || spec.sizes[targetSize]?.[1] || spec.sizes.m?.[1] || 240;
    const area = areaFor(b);

    // Anchor expansion seamlessly at the icon's desktop position!
    let targetX = Math.max(area.x + 8, Math.min(area.x + area.width - targetW - 8, b.x));
    let targetY = Math.max(area.y + 8, Math.min(area.y + area.height - targetH - 8, b.y));
    let next = { x: Math.round(targetX), y: Math.round(targetY), width: targetW, height: targetH };
    next = applyDesktopCollisionDisplacement(id, next, win);
    win.setBounds(next);
    win.show();
    win.focus();
    patchWidget(id, { bounds: next, size: currentSizeKey(id) || targetSize, isMini: false });
    settings.flush();
    try { win.webContents.send('settings:changed', publicSettings()); } catch (_) { }
    const settingsWin = windows.get('settings');
    if (settingsWin && !settingsWin.isDestroyed() && settingsWin !== win) {
      try { settingsWin.webContents.send('settings:changed', publicSettings()); } catch (_) { }
    }
    return win.getBounds();
  } else {
    // 2. SMART MINIMIZE: Save current normal size & location
    const normalKey = currentSizeKey(id) || curSetting.size || 'm';
    win._prevNormalBounds = b;
    win._prevNormalKey = normalKey;

    const folder = getFolderOfWidget(id);
    if (folder) {
      // Widget belongs to an active folder: return it cleanly into the folder box without leaving a desktop mini icon!
      patchWidget(id, {
        prevNormalBounds: b,
        prevNormalKey: normalKey,
        isMini: true,
        size: 'icon',
        inFolder: folder.id,
      });
      settings.flush();
      destroyWidget(id);
      const folderWin = windows.get(folder.id);
      if (folderWin && !folderWin.isDestroyed()) {
        folderWin.webContents.send('folder:absorb', { folderId: folder.id, id });
      }
      broadcast('settings:changed', publicSettings());
      return null;
    }

    patchWidget(id, {
      prevNormalBounds: b,
      prevNormalKey: normalKey,
      isMini: true,
      size: 'icon',
    });

    try { win.webContents.send('widget:prepare-mini'); } catch (_) { }
    win.setMinimumSize(48, 48);
    win.setMaximumSize(90, 90);
    win.setResizable(false);

    // If widget was previously placed in an icon position, fly right back to it snapped to desktop grid or freely positioned
    const area = areaFor(b);
    const snapEnabled = settings.get('snapToDesktopGrid') !== false;
    const candidate = (curSetting.iconBounds && curSetting.iconBounds.width <= 90)
      ? { ...curSetting.iconBounds, width: 56, height: 56 }
      : { x: b.x, y: b.y, width: 56, height: 56 };
    let next;
    if (snapEnabled) {
      const grid = geo.getDesktopGridMetrics();
      next = geo.snapToDesktopGrid(candidate, area, otherWidgetBounds(win), { ...grid, avoidCollisions: true });
    } else {
      next = geo.clampToArea(candidate, area);
      next = applyDesktopCollisionDisplacement(id, next, win);
    }
    win.setBounds(next);
    patchWidget(id, { bounds: next, iconBounds: next, size: 'icon', isMini: true });
    settings.flush();
    try { win.webContents.send('settings:changed', publicSettings()); } catch (_) { }
    const settingsWin = windows.get('settings');
    if (settingsWin && !settingsWin.isDestroyed() && settingsWin !== win) {
      try { settingsWin.webContents.send('settings:changed', publicSettings()); } catch (_) { }
    }
  }

  return win.getBounds();
}

/* ==================================================================== *
 * Dynamic Multi-Folder Manager
 * Supports:
 * - 0 folders (all widgets on desktop)
 * - Multiple simultaneous folders (folder_1, folder_2, etc.)
 * - 1-second hover gesture to spawn a new folder from 2 widgets
 * - Automatic dissolution when fewer than 2 widgets remain
 * ==================================================================== */

function getFolders() {
  let folders = settings.get('folders');
  if (!folders || typeof folders !== 'object') {
    folders = {};
    // Migration: check if old single folder exists with >= 2 widgets
    const oldFolder = settings.get('folder');
    if (oldFolder && Array.isArray(oldFolder.widgetIds) && oldFolder.widgetIds.length >= 2) {
      const fid = 'folder_1';
      folders[fid] = {
        id: fid,
        title: oldFolder.title || 'أدوات مساعدة',
        widgetIds: [...oldFolder.widgetIds],
        quickSlots: [...(oldFolder.quickSlots || oldFolder.widgetIds.slice(0, 3))],
        bounds: widgetSetting('folder')?.bounds || { x: 500, y: 100, width: 144, height: 144 },
        size: widgetSetting('folder')?.size || 's',
      };
    }
    settings.set('folders', folders);
  }

  // Ensure each folder has a valid bounds object without wiping custom sizes
  // and purge any widgets that are explicitly disabled (visible === false)
  let modified = false;
  for (const [fid, f] of Object.entries(folders)) {
    if (f && typeof f === 'object') {
      if (!f.bounds || typeof f.bounds !== 'object') {
        f.bounds = { x: 500, y: 100, width: 144, height: 144 };
        modified = true;
      }
      if (Array.isArray(f.widgetIds)) {
        const active = f.widgetIds.filter(wid => {
          const s = widgetSetting(wid);
          return WIDGETS[wid] ? (s && s.visible !== false) : true;
        });
        if (active.length < 2) {
          delete folders[fid];
          destroyWidget(fid);
          modified = true;
        } else if (active.length !== f.widgetIds.length) {
          f.widgetIds = active;
          f.quickSlots = (f.quickSlots || []).filter(w => active.includes(w));
          if (!f.quickSlots.length) f.quickSlots = f.widgetIds.slice(0, 3);
          modified = true;
        }
      }
    } else {
      delete folders[fid];
      modified = true;
    }
  }
  if (modified) {
    settings.set('folders', folders);
  }

  return folders;
}

function saveFolders(folders) {
  settings.set('folders', folders);
  settings.flush();
  try {
    const { defaultBackupManager } = require('./src/core/backup-manager');
    defaultBackupManager.createSnapshot(paths.settings, settings.data, 'folders', true);
  } catch (_) { }
}

function getFolderOfWidget(id) {
  if (!id) return null;
  const folders = getFolders();
  for (const f of Object.values(folders)) {
    if (f && Array.isArray(f.widgetIds) && f.widgetIds.includes(id)) {
      return f;
    }
  }
  return null;
}

function isWidgetInAnyFolder(id) {
  const f = getFolderOfWidget(id);
  if (!f) return false;
  const folderWin = windows.get(f.id);
  return Boolean(folderWin && !folderWin.isDestroyed());
}

function getFolder(fid) {
  const folders = getFolders();
  return folders[fid] || null;
}

function createFolderWidget(fid, bounds) {
  const f = getFolder(fid);
  if (!f) return null;
  if (windows.has(fid) && !windows.get(fid).isDestroyed()) {
    const w = windows.get(fid);
    w.show();
    return w;
  }
  let b = bounds || f.bounds || { x: 500, y: 100, width: 144, height: 144 };
  const area = areaFor(b);
  b = geo.clampToArea(b, area);

  debugLog(`createFolderWidget called for: ${fid} bounds: ${JSON.stringify(b)}`);
  const win = new BrowserWindow({
    x: b.x, y: b.y, width: b.width, height: b.height,
    minWidth: 58, minHeight: 58,
    maxWidth: 640, maxHeight: 540,
    frame: false, transparent: true, resizable: true,
    hasShadow: false, skipTaskbar: true, show: false,
    alwaysOnTop: Boolean(settings.get('alwaysOnTop')),
    webPreferences: {
      preload: preloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      backgroundThrottling: true,
    },
  });
  win._folderId = fid;
  win._widgetId = fid;
  win._isFolder = true;
  windows.set(fid, win);

  win.setMenu(null);
  traceRenderer(win, fid);
  win.webContents.on('did-fail-load', (_e, code, desc) => {
    debugLog(`[${fid}] did-fail-load: ${desc} (${code})`);
  });

  win.loadFile(path.join(__dirname, 'windows', 'folder.html'), { query: { folderId: fid } });
  win.once('ready-to-show', () => {
    debugLog(`[${fid}] ready-to-show event fired! Calling win.show()`);
    if (!win.isDestroyed()) {
      win.setBounds(b);
      win.show();
      if (settings.get('alwaysOnTop')) {
        win.setAlwaysOnTop(true);
      }
    }
  });

  win.on('minimize', () => {
    setTimeout(() => {
      if (!win.isDestroyed()) {
        win.restore();
        if (settings.get('alwaysOnTop')) win.setAlwaysOnTop(true);
      }
    }, 120);
  });

  const persist = debounce(() => {
    if (win.isDestroyed()) return;
    const curBounds = win.getBounds();
    if (win._isFolderExpanded) return;
    const folders = getFolders();
    if (folders[fid]) {
      folders[fid].bounds = { ...curBounds };
      saveFolders(folders);
    }
  }, 250);

  win.on('move', persist);
  win.on('resize', persist);

  win.on('closed', () => {
    debugLog(`[${fid}] win 'closed' event fired`);
    windows.delete(fid);
  });
  return win;
}

function createFolderFromHover(sourceId, targetId, targetBounds, sourceBounds) {
  const folders = getFolders();
  let fid = 'folder_' + Date.now();
  if (folders[fid]) fid += '_' + Math.floor(Math.random() * 1000);

  // Cute, compact square squircle by default for newly formed folder
  let folderWidth = 144;
  let folderHeight = 144;
  let sizePreset = 's';

  // Check collision against all existing active folders
  const otherFolderObstacles = [];
  for (const [wId, w] of windows.entries()) {
    if (w && !w.isDestroyed() && w._isFolder) {
      try { otherFolderObstacles.push(w.getBounds()); } catch (_) { }
    }
  }
  for (const [otherFid, otherF] of Object.entries(folders)) {
    if (otherF && otherF.bounds && otherFid !== fid) {
      if (!otherFolderObstacles.some(o => o.x === otherF.bounds.x && o.y === otherF.bounds.y)) {
        otherFolderObstacles.push(otherF.bounds);
      }
    }
  }

  const initialBounds = {
    x: targetBounds.x,
    y: targetBounds.y,
    width: folderWidth,
    height: folderHeight,
  };
  const area = areaFor(initialBounds);
  const resolvedBounds = geo.avoidCollisions(initialBounds, area, otherFolderObstacles, 16);

  const newFolder = {
    id: fid,
    title: 'مجلد جديد',
    widgetIds: [targetId, sourceId],
    quickSlots: [targetId, sourceId],
    bounds: resolvedBounds,
    size: sizePreset,
  };

  folders[fid] = newFolder;
  saveFolders(folders);

  // Unify widget identity: mark items as housed inside folder
  const srcSetting = widgetSetting(sourceId) || {};
  const tgtSetting = widgetSetting(targetId) || {};
  patchWidget(sourceId, {
    inFolder: fid,
    isMini: true,
    size: 'icon',
    visible: true,
    prevNormalBounds: srcSetting.prevNormalBounds || (srcSetting.bounds && srcSetting.bounds.width > 90 ? srcSetting.bounds : null),
    prevNormalKey: srcSetting.prevNormalKey || (srcSetting.size && srcSetting.size !== 'icon' ? srcSetting.size : 'm'),
  });
  patchWidget(targetId, {
    inFolder: fid,
    isMini: true,
    size: 'icon',
    visible: true,
    prevNormalBounds: tgtSetting.prevNormalBounds || (tgtSetting.bounds && tgtSetting.bounds.width > 90 ? tgtSetting.bounds : null),
    prevNormalKey: tgtSetting.prevNormalKey || (tgtSetting.size && tgtSetting.size !== 'icon' ? tgtSetting.size : 'm'),
  });

  // Terminate standalone windows of source and target
  destroyWidget(sourceId);
  destroyWidget(targetId);

  // Spawn new folder window with entrance animation!
  const folderWin = createFolderWidget(fid, newFolder.bounds);

  broadcast('settings:changed', publicSettings());
  return folderWin;
}

function addWidToFolder(fid, wid) {
  const folders = getFolders();
  const f = folders[fid];
  if (!f) return false;
  if (!Array.isArray(f.widgetIds)) f.widgetIds = [];
  if (!f.widgetIds.includes(wid)) {
    f.widgetIds.push(wid);
    if (!Array.isArray(f.quickSlots)) f.quickSlots = [];
    if (f.quickSlots.length < 3) f.quickSlots.push(wid);
    saveFolders(folders);
  }

  // Unify entity: mark widget as living inside this folder
  const curSetting = widgetSetting(wid) || {};
  patchWidget(wid, {
    inFolder: fid,
    isMini: true,
    size: 'icon',
    visible: true,
    prevNormalBounds: curSetting.prevNormalBounds || (curSetting.bounds && curSetting.bounds.width > 90 ? curSetting.bounds : null),
    prevNormalKey: curSetting.prevNormalKey || (curSetting.size && curSetting.size !== 'icon' ? curSetting.size : 'm'),
  });

  const fWin = windows.get(fid);
  if (fWin && !fWin.isDestroyed()) {
    fWin.webContents.send('folder:changed', f);
    fWin.webContents.send('folder:absorb', { folderId: fid, id: wid });
  }
  destroyWidget(wid);
  broadcast('settings:changed', publicSettings());
  return true;
}

function removeWidgetFromAllFolders(wid) {
  const folders = getFolders();
  let changed = false;

  for (const [fid, f] of Object.entries(folders)) {
    if (f.widgetIds && f.widgetIds.includes(wid)) {
      f.widgetIds = f.widgetIds.filter(w => w !== wid);
      f.quickSlots = (f.quickSlots || []).filter(w => w !== wid);
      changed = true;

      // Check remaining widgets count in this folder:
      const activeRemaining = f.widgetIds.filter(w => {
        const s = widgetSetting(w);
        return WIDGETS[w] ? (s && s.visible !== false) : true;
      });

      if (activeRemaining.length < 2) {
        if (activeRemaining.length === 1) {
          // Exactly 1 widget left: folder dissolves and releases the last widget onto the desktop!
          const lastWid = activeRemaining[0];
          delete folders[fid];
          destroyWidget(fid);

          const cur = widgetSetting(lastWid) || {};
          if (cur.visible !== false) {
            const wasMini = Boolean(cur.isMini || cur.size === 'icon' || (cur.bounds && cur.bounds.width <= 90));
            const spec = WIDGETS[lastWid];
            let targetSize = cur.size || (spec && spec.size) || 's';
            let targetBounds;

            if (wasMini) {
              targetBounds = { x: f.bounds.x, y: f.bounds.y, width: 64, height: 64 };
              targetSize = 'icon';
            } else {
              const dims = (spec && spec.sizes && spec.sizes[targetSize]) || [280, 220];
              const w = (cur.bounds && cur.bounds.width > 90) ? cur.bounds.width : dims[0];
              const h = (cur.bounds && cur.bounds.height > 90) ? cur.bounds.height : dims[1];
              targetBounds = { x: f.bounds.x, y: f.bounds.y, width: w, height: h };
            }

            patchWidget(lastWid, {
              inFolder: null,
              visible: true,
              isMini: wasMini,
              size: targetSize,
              bounds: targetBounds,
              iconBounds: wasMini ? targetBounds : cur.iconBounds,
            });
            createWidget(lastWid, { immediateShow: true, bounds: targetBounds });
            const relWin = windows.get(lastWid);
            if (relWin && !relWin.isDestroyed()) {
              relWin.setResizable(true);
              relWin.setMinimumSize(wasMini ? 44 : spec.min[0], wasMini ? 44 : spec.min[1]);
              relWin.setMaximumSize(wasMini ? 64 : spec.max[0], wasMini ? 64 : spec.max[1]);
              relWin.setResizable(!wasMini);
              relWin.setBounds(targetBounds);
              relWin.show();
              relWin.focus();
              if (settings.get('alwaysOnTop')) relWin.setAlwaysOnTop(true);
            }
          }
        } else {
          // 0 widgets left: folder dissolves completely
          delete folders[fid];
          destroyWidget(fid);
        }
      } else {
        f.widgetIds = activeRemaining;
        f.quickSlots = (f.quickSlots || []).filter(w => activeRemaining.includes(w));
        if (!f.quickSlots.length && f.widgetIds.length) {
          f.quickSlots = f.widgetIds.slice(0, 3);
        }
        const fWin = windows.get(fid);
        if (fWin && !fWin.isDestroyed()) {
          fWin.webContents.send('folder:changed', f);
        }
      }
    }
  }

  if (changed) {
    saveFolders(folders);
    broadcast('settings:changed', publicSettings());
  }
}

/** Synchronize smart folder contents with standalone desktop mini widgets to eliminate duplicates & bloat */
function syncFolderWithDesktop() {
  const folders = getFolders();
  const allWidgetsInFolders = new Set();
  for (const f of Object.values(folders)) {
    for (const w of (f.widgetIds || [])) {
      allWidgetsInFolders.add(w);
    }
  }

  for (const [id, win] of windows.entries()) {
    if (id.startsWith('folder') || !win || win.isDestroyed()) continue;
    if (allWidgetsInFolders.has(id)) {
      // Only destroy duplicate standalone mini desktop icons; NEVER destroy normal open widgets launched from folders!
      const b = win.getBounds();
      const cur = widgetSetting(id) || {};
      const isMini = Boolean(cur.isMini || cur.size === 'icon' || (b.width <= 90 && b.height <= 90));
      if (isMini) {
        destroyWidget(id);
      }
    }
  }

  const all = settings.get('widgets', {});
  for (const [id, cfg] of Object.entries(all)) {
    if (id === 'folder' || id.startsWith('folder') || !WIDGETS[id]) continue;
    if (allWidgetsInFolders.has(id)) continue;
    if (cfg && cfg.visible) {
      if (!windows.has(id)) {
        createWidget(id, { immediateShow: true });
      } else {
        const w = windows.get(id);
        if (w && !w.isDestroyed() && !w.isVisible()) {
          w.show();
        }
      }
    }
  }
}

/** Pull every window back inside the screens, e.g. after a display change. */
function reclampAll() {
  for (const win of allWindows()) {
    const b = win.getBounds();
    const next = geo.clampToArea(b, areaFor(b));
    if (next.x !== b.x || next.y !== b.y || next.width !== b.width || next.height !== b.height) {
      win.setBounds(next);
    }
  }
}

/* ---- Floating Hover Peek Preview Window ---- */
let peekWin = null;
let lastPeekPayload = null;
function getOrCreatePeekWindow() {
  if (peekWin && !peekWin.isDestroyed()) return peekWin;
  peekWin = new BrowserWindow({
    width: 340,
    height: 236,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    hasShadow: false,
    resizable: false,
    show: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    webPreferences: {
      preload: preloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      spellcheck: false,
      backgroundThrottling: false,
    },
  });
  peekWin.setMenu(null);
  peekWin.webContents.once('did-finish-load', () => {
    if (lastPeekPayload && !peekWin.isDestroyed()) {
      peekWin.webContents.send('peek:load', lastPeekPayload);
    }
  });
  peekWin.loadFile(path.join(__dirname, 'windows', 'peek.html'));
  return peekWin;
}

/* ---- Multi-Widget Selection, Marquee & Group Controls ---- */
const selectedWidgets = new Set();
let marqueeWin = null;
let groupToolbarWin = null;

function broadcastSelection() {
  const ids = Array.from(selectedWidgets);
  broadcast('selection:changed', ids);
}

function selectAllMiniWidgets() {
  selectedWidgets.clear();
  for (const [id, w] of windows) {
    if (!w || w.isDestroyed() || !w.isVisible()) continue;
    const b = w.getBounds();
    const isIcon = (b.width <= 90 && b.height <= 90) || widgetSetting(id)?.isMini;
    if (isIcon) {
      selectedWidgets.add(id);
    }
  }
  broadcastSelection();
  updateGroupToolbarPosition();
  return Array.from(selectedWidgets);
}

function clearWidgetSelection() {
  selectedWidgets.clear();
  broadcastSelection();
  updateGroupToolbarPosition();
  return [];
}

function toggleWidgetSelection(id) {
  if (selectedWidgets.has(id)) {
    selectedWidgets.delete(id);
  } else {
    selectedWidgets.add(id);
  }
  broadcastSelection();
  updateGroupToolbarPosition();
  return Array.from(selectedWidgets);
}

function getOrCreateMarqueeWindow() {
  if (marqueeWin && !marqueeWin.isDestroyed()) return marqueeWin;
  const disp = screen.getPrimaryDisplay();
  const { width, height } = disp.bounds;
  marqueeWin = new BrowserWindow({
    x: 0,
    y: 0,
    width,
    height,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    hasShadow: false,
    resizable: false,
    show: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    fullscreenable: false,
    webPreferences: {
      preload: preloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      spellcheck: false,
      backgroundThrottling: false,
    },
  });
  marqueeWin.setMenu(null);
  marqueeWin.loadFile(path.join(__dirname, 'windows', 'marquee.html'));
  return marqueeWin;
}

function startMarqueeMode(startPt = null) {
  const disp = screen.getPrimaryDisplay();
  const { width, height } = disp.bounds;
  const mWin = getOrCreateMarqueeWindow();
  mWin.setBounds({ x: 0, y: 0, width, height });
  mWin.show();
  mWin.focus();
  if (startPt) {
    mWin.webContents.send('marquee:init', startPt);
  }
}

function getOrCreateGroupToolbarWindow() {
  if (groupToolbarWin && !groupToolbarWin.isDestroyed()) return groupToolbarWin;
  groupToolbarWin = new BrowserWindow({
    width: 240,
    height: 48,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    hasShadow: false,
    resizable: false,
    show: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    webPreferences: {
      preload: preloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      spellcheck: false,
      backgroundThrottling: false,
    },
  });
  groupToolbarWin.setMenu(null);
  groupToolbarWin.loadFile(path.join(__dirname, 'windows', 'group-toolbar.html'));
  return groupToolbarWin;
}

let dragGhostWin = null;
function getOrCreateDragGhostWindow() {
  if (dragGhostWin && !dragGhostWin.isDestroyed()) return dragGhostWin;
  dragGhostWin = new BrowserWindow({
    width: 56,
    height: 56,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    hasShadow: false,
    resizable: false,
    show: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    focusable: false,
    webPreferences: {
      preload: preloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      spellcheck: false,
      backgroundThrottling: false,
    },
  });
  dragGhostWin.setIgnoreMouseEvents(true);
  dragGhostWin.setMenu(null);
  dragGhostWin.loadFile(path.join(__dirname, 'windows', 'drag-ghost.html'));
  return dragGhostWin;
}

function updateGroupToolbarPosition() {
  if (selectedWidgets.size < 2) {
    if (groupToolbarWin && !groupToolbarWin.isDestroyed()) {
      groupToolbarWin.hide();
    }
    return;
  }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const id of selectedWidgets) {
    const w = windows.get(id);
    if (w && !w.isDestroyed()) {
      const b = w.getBounds();
      minX = Math.min(minX, b.x);
      minY = Math.min(minY, b.y);
      maxX = Math.max(maxX, b.x + b.width);
      maxY = Math.max(maxY, b.y + b.height);
    }
  }

  if (minX === Infinity) return;
  const tbW = 240;
  const tbH = 48;
  const groupCenterX = (minX + maxX) / 2;
  let tbX = Math.round(groupCenterX - tbW / 2);
  let tbY = Math.round(minY - tbH - 10);

  const disp = screen.getDisplayMatching({ x: minX, y: minY, width: maxX - minX, height: maxY - minY }) || screen.getPrimaryDisplay();
  const area = disp.workArea;

  if (tbY < area.y + 8) {
    tbY = Math.round(maxY + 10);
  }
  tbX = Math.max(area.x + 8, Math.min(area.x + area.width - tbW - 8, tbX));

  const tb = getOrCreateGroupToolbarWindow();
  tb.setBounds({ x: tbX, y: tbY, width: tbW, height: tbH });
  tb.webContents.send('group:update', {
    count: selectedWidgets.size,
    theme: settings.get('theme') || 'glass',
    accent: settings.get('accent') || '#0099ff',
  });
  tb.showInactive();
}

function arrangeSelectedGrid() {
  if (selectedWidgets.size < 2) return;
  const items = [];
  for (const id of selectedWidgets) {
    const w = windows.get(id);
    if (w && !w.isDestroyed()) {
      items.push({ id, ...w.getBounds() });
    }
  }
  if (!items.length) return;

  const area = primaryArea();
  const grid = geo.getDesktopGridMetrics();
  const packed = geo.packMiniGrid(items, area, grid);

  for (const [id, b] of Object.entries(packed)) {
    patchWidget(id, { bounds: b, iconBounds: b, isMini: true, size: 'icon' });
    const win = windows.get(id);
    if (win && !win.isDestroyed()) {
      win.setBounds(b);
    }
  }
  settings.save();
  broadcast('settings:changed', publicSettings());
  updateGroupToolbarPosition();
}

function restoreSelectedWidgets() {
  for (const id of Array.from(selectedWidgets)) {
    const win = windows.get(id);
    if (win && !win.isDestroyed()) {
      const b = win.getBounds();
      if (b.width <= 90 || widgetSetting(id)?.isMini) {
        toggleWidgetMini(win);
      }
    }
  }
  clearWidgetSelection();
}

/* ---- Secondary windows ---- */

function secondaryWindow({ width, height, minWidth, minHeight, file, query, label, alwaysOnTop }) {
  const area = primaryArea();
  const size = geo.clampSize(width, height, area, [minWidth, minHeight]);
  const win = new BrowserWindow({
    ...size,
    minWidth: Math.min(minWidth, area.width),
    minHeight: Math.min(minHeight, area.height),
    x: Math.round(area.x + (area.width - size.width) / 2),
    y: Math.round(area.y + (area.height - size.height) / 2),
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    hasShadow: false,
    resizable: true,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: false,
    alwaysOnTop: Boolean(alwaysOnTop),
    show: false,
    roundedCorners: false,     // Disabled: DWM OS rounding causes black square corner artifacts behind custom CSS border-radius!
    webPreferences: {
      preload: preloadPath(), contextIsolation: true, nodeIntegration: false,
      sandbox: false, spellcheck: false, backgroundThrottling: true,
    },
  });
  win.setMenu(null);
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (typeof url === 'string' && (/^https?:\/\//i.test(url) || /^mailto:/i.test(url))) {
      openExternalUrl(url);
    }
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (event, url) => {
    if (typeof url === 'string') {
      if (url.startsWith('file://')) return;
      event.preventDefault();
      if (/^https?:\/\//i.test(url) || /^mailto:/i.test(url)) {
        openExternalUrl(url);
      }
    }
  });
  traceRenderer(win, label);
  win.loadFile(path.join(__dirname, 'windows', file), query ? { query } : undefined);

  let revealed = false;
  const reveal = () => {
    if (revealed || win.isDestroyed()) return;
    revealed = true;
    win.show();
    win.focus();
  };

  win.webContents.once('ipc-message', (_e, channel) => {
    if (channel === 'win:ready-to-reveal') {
      reveal();
    }
  });

  win.once('ready-to-show', () => {
    if (!revealed) {
      setTimeout(reveal, 350);
    }
  });

  return win;
}

let tafsirWin = null;
function openTafsir(key) {
  if (tafsirWin && !tafsirWin.isDestroyed()) {
    tafsirWin.webContents.send('tafsir:load', key);
    tafsirWin.show();
    tafsirWin.focus();
    return tafsirWin;
  }
  const area = primaryArea();
  tafsirWin = secondaryWindow({
    width: Math.min(600, Math.round(area.width * 0.5)),
    height: Math.min(700, Math.round(area.height * 0.86)),
    minWidth: 380, minHeight: 360,
    file: 'tafsir.html', query: { key }, label: 'tafsir',
    alwaysOnTop: settings.get('alwaysOnTop'),
  });
  tafsirWin.on('closed', () => { tafsirWin = null; });
  return tafsirWin;
}

let hadithWin = null;
function openHadith(id) {
  if (hadithWin && !hadithWin.isDestroyed()) {
    hadithWin.webContents.send('hadith:load', id);
    hadithWin.show();
    hadithWin.focus();
    return hadithWin;
  }
  const area = primaryArea();
  hadithWin = secondaryWindow({
    width: Math.min(600, Math.round(area.width * 0.5)),
    height: Math.min(700, Math.round(area.height * 0.86)),
    minWidth: 380, minHeight: 360,
    file: 'hadith.html', query: { id }, label: 'hadith',
    alwaysOnTop: settings.get('alwaysOnTop'),
  });
  hadithWin.on('closed', () => { hadithWin = null; });
  return hadithWin;
}

let taskWin = null;
function openTask(id) {
  if (taskWin && !taskWin.isDestroyed()) {
    taskWin.webContents.send('task:load', id);
    taskWin.show();
    taskWin.focus();
    return taskWin;
  }
  taskWin = secondaryWindow({
    width: 420, height: 600, minWidth: 340, minHeight: 380,
    file: 'task.html', query: { id }, label: 'task',
    alwaysOnTop: settings.get('alwaysOnTop'),
  });
  taskWin.on('closed', () => { taskWin = null; });
  return taskWin;
}

let eventWin = null;
function openEventWindow(opts = {}) {
  const query = {};
  if (typeof opts === 'string') {
    query.id = opts;
  } else if (typeof opts === 'object' && opts !== null) {
    if (opts.id || opts.eventId) query.id = opts.id || opts.eventId;
    if (opts.date || opts.defaultDate) query.date = opts.date || opts.defaultDate;
    if (opts.title || opts.defaultTitle) query.title = opts.title || opts.defaultTitle;
  }

  if (eventWin && !eventWin.isDestroyed()) {
    eventWin.webContents.send('event:load', opts);
    eventWin.show();
    eventWin.focus();
    return eventWin;
  }
  const area = primaryArea();
  eventWin = secondaryWindow({
    width: Math.min(540, Math.round(area.width * 0.48)),
    height: Math.min(740, Math.round(area.height * 0.90)),
    minWidth: 420, minHeight: 480,
    file: 'event.html', query: Object.keys(query).length ? query : null, label: 'event',
    alwaysOnTop: settings.get('alwaysOnTop'),
  });
  eventWin.on('closed', () => { eventWin = null; });
  return eventWin;
}

let settingsWin = null;
function openSettings(section) {
  if (settingsWin && !settingsWin.isDestroyed()) {
    if (section) settingsWin.webContents.send('settings:section', section);
    settingsWin.show();
    settingsWin.focus();
    return settingsWin;
  }
  const area = primaryArea();
  settingsWin = secondaryWindow({
    width: 660,
    height: Math.min(780, Math.round(area.height * 0.94)),
    minWidth: 500, minHeight: 480,
    file: 'settings.html', query: section ? { section } : null, label: 'settings',
  });
  settingsWin.on('closed', () => { settingsWin = null; });
  return settingsWin;
}

let emailViewWin = null;
function openEmailViewer(dataOrUid) {
  const uid = typeof dataOrUid === 'object' && dataOrUid !== null ? dataOrUid.uid : (typeof dataOrUid === 'string' || typeof dataOrUid === 'number' ? dataOrUid : '');
  const payload = typeof dataOrUid === 'object' && dataOrUid !== null ? dataOrUid : { uid: String(dataOrUid || '') };
  const targetMode = payload.mode || (payload.reply ? 'reply' : (uid ? 'read' : 'compose'));
  if (emailViewWin && !emailViewWin.isDestroyed()) {
    emailViewWin.webContents.send('email-view:load', { ...payload, mode: targetMode });
    emailViewWin.show();
    emailViewWin.focus();
    return emailViewWin;
  }
  const area = primaryArea();
  emailViewWin = secondaryWindow({
    width: Math.min(840, Math.round(area.width * 0.65)),
    height: Math.min(820, Math.round(area.height * 0.90)),
    minWidth: 480, minHeight: 440,
    file: 'email-view.html',
    query: {
      uid: String(uid || ''),
      subject: String(payload.subject || ''),
      from: String(payload.from || ''),
      fromEmail: String(payload.fromEmail || ''),
      date: String(payload.date || ''),
      reply: payload.reply ? '1' : '0',
      mode: String(targetMode),
    },
    label: 'email-view',
    alwaysOnTop: settings.get('alwaysOnTop'),
  });
  emailViewWin.on('closed', () => { emailViewWin = null; });
  return emailViewWin;
}

let habitsDashboardWin = null;
function openHabitsDashboardWindow(opts = {}) {
  if (habitsDashboardWin && !habitsDashboardWin.isDestroyed()) {
    habitsDashboardWin.webContents.send('habits:dashboard-opts', opts);
    habitsDashboardWin.show();
    habitsDashboardWin.focus();
    return habitsDashboardWin;
  }
  const area = primaryArea();
  habitsDashboardWin = secondaryWindow({
    width: Math.min(1160, Math.round(area.width * 0.90)),
    height: Math.min(880, Math.round(area.height * 0.92)),
    minWidth: 720, minHeight: 520,
    file: 'habits-dashboard.html',
    label: 'habits-dashboard',
    alwaysOnTop: settings.get('alwaysOnTop'),
  });
  if (opts && Object.keys(opts).length > 0) {
    habitsDashboardWin.webContents.once('did-finish-load', () => {
      try {
        if (habitsDashboardWin && !habitsDashboardWin.isDestroyed()) {
          habitsDashboardWin.webContents.send('habits:dashboard-opts', opts);
        }
      } catch (_) { }
    });
  }
  habitsDashboardWin.on('closed', () => { habitsDashboardWin = null; });
  return habitsDashboardWin;
}

/* ==================================================================== *
 * Broadcast
 * ==================================================================== */

function allWindows() {
  const list = typeof windows !== 'undefined' && windows ? [...windows.values()] : [];
  if (typeof tafsirWin !== 'undefined' && tafsirWin && !tafsirWin.isDestroyed()) list.push(tafsirWin);
  if (typeof taskWin !== 'undefined' && taskWin && !taskWin.isDestroyed()) list.push(taskWin);
  if (typeof hadithWin !== 'undefined' && hadithWin && !hadithWin.isDestroyed()) list.push(hadithWin);
  if (typeof eventWin !== 'undefined' && eventWin && !eventWin.isDestroyed()) list.push(eventWin);
  if (typeof settingsWin !== 'undefined' && settingsWin && !settingsWin.isDestroyed()) list.push(settingsWin);
  if (typeof emailViewWin !== 'undefined' && emailViewWin && !emailViewWin.isDestroyed()) list.push(emailViewWin);
  if (typeof habitsDashboardWin !== 'undefined' && habitsDashboardWin && !habitsDashboardWin.isDestroyed()) list.push(habitsDashboardWin);
  return list.filter((w) => w && !w.isDestroyed());
}

function broadcast(channel, payload) {
  for (const w of allWindows()) {
    try {
      if (!w.isDestroyed() && w.webContents && !w.webContents.isDestroyed()) {
        w.webContents.send(channel, payload);
      }
    } catch { }
  }
}

function applyWindowLevel() {
  const onTop = Boolean(settings.get('alwaysOnTop'));
  for (const w of allWindows()) w.setAlwaysOnTop(onTop);
}

/* ==================================================================== *
 * Tray
 * ==================================================================== */

function trayImage() {
  const img = nativeImage.createFromPath(path.join(__dirname, 'assets', 'tray.png'));
  return img.isEmpty() ? nativeImage.createEmpty() : img.resize({ width: 16, height: 16 });
}

function fmtRemaining(ms) {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const modeName = (m) => T(`mode.${m}`);

function updateTrayTooltip() {
  if (!tray) return;
  const snap = pomodoro.snapshot();
  if (snap.status === 'running' || snap.status === 'paused') {
    const name = snap.mode === 'focus' ? snap.config.label : modeName(snap.mode);
    const state = snap.status === 'paused' ? T('tray.paused') : '';
    tray.setToolTip(`${T('app')}\n${name}: ${fmtRemaining(snap.remaining)}${state}`);
  } else {
    tray.setToolTip(T('app'));
  }
}

function rebuildTray() {
  if (!tray) return;
  const snap = pomodoro.snapshot();
  const widgetItems = Object.keys(WIDGETS).filter(id => id !== 'folder').map((id) => ({
    label: titleOf(id),
    type: 'checkbox',
    checked: Boolean(widgetSetting(id)?.visible),
    click: (i) => { setWidgetVisible(id, i.checked); broadcast('settings:changed', publicSettings()); },
  }));
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: T('app'), enabled: false },
    { type: 'separator' },
    ...widgetItems,
    { type: 'separator' },
    {
      label: T(snap.status === 'running' ? 'tray.timerPause' : snap.status === 'paused' ? 'tray.timerResume' : 'tray.timerStart'),
      accelerator: 'Ctrl+Alt+P',
      click: () => pomodoro.toggle(),
    },
    { label: T('tray.timerReset'), click: () => pomodoro.reset() },
    { label: T('menu.newAyah'), accelerator: 'Ctrl+Alt+Q', click: () => refreshQuran(true) },
    { type: 'separator' },
    { label: T('tray.front'), accelerator: 'Ctrl+Alt+W', click: bringToFront },
    { label: T('tray.arrange'), click: resetLayout },
    { label: T('tray.arrangeMini') || 'محاذاة الأيقونات مع الشبكة', click: () => arrangeMiniWidgets() },
    { label: '🔲 تحديد مستطيلي للأيقونات (Marquee Select)', click: () => startMarqueeMode() },
    { label: '⊞ تحديد جميع الأيقونات ككتلة واحدة', click: () => selectAllMiniWidgets() },
    { label: T('menu.settings'), click: () => openSettings() },
    { type: 'separator' },
    { label: T('tray.quit'), click: () => { quitting = true; app.quit(); } },
  ]));
}

function createTray() {
  tray = new Tray(trayImage());
  tray.on('click', bringToFront);
  tray.on('double-click', () => openSettings());
  updateTrayTooltip();
  rebuildTray();
}

/**
 * Raise the widgets above whatever is open. Windows refuses a plain "move to
 * top" from an app that is not in the foreground, so they are made topmost
 * for a moment and then returned to normal stacking.
 */
function bringToFront() {
  const keepOnTop = Boolean(settings.get('alwaysOnTop'));
  let brought = 0;
  for (const w of windows.values()) {
    if (w.isDestroyed()) continue;
    if (w.isMinimized()) w.restore();
    if (w.isVisible()) {
      w.setAlwaysOnTop(true);
      w.moveTop();
      brought++;
    }
  }
  if (brought === 0) {
    const all = settings.get('widgets', {});
    const anyConfigured = Object.values(all).some((cfg) => cfg && cfg.visible);
    if (!anyConfigured) {
      debugLog('bringToFront: No widgets visible. Restoring default widgets.');
      for (const id of ['clock', 'quran', 'todo', 'calendar', 'habits']) {
        if (WIDGETS[id]) setWidgetVisible(id, true);
      }
    } else {
      for (const [id, cfg] of Object.entries(all)) {
        if (cfg && cfg.visible && WIDGETS[id]) createWidget(id);
      }
    }
    if (windows.size === 0) {
      openSettings();
    }
  }
  setTimeout(() => {
    for (const w of windows.values()) if (!w.isDestroyed()) w.setAlwaysOnTop(keepOnTop);
  }, 500);
}

function arrangeMiniWidgets(targetArea = primaryArea()) {
  const miniList = [];
  for (const [id, w] of windows) {
    if (!w || w.isDestroyed()) continue;
    const b = w.getBounds();
    const saved = widgetSetting(id);
    const isIcon = (b.width <= 90 && b.height <= 90) || (saved && (saved.size === 'icon' || saved.isMini));
    if (isIcon && w.isVisible()) {
      miniList.push({ id, ...b });
    }
  }
  if (!miniList.length) return;

  const grid = geo.getDesktopGridMetrics();
  const packed = geo.packMiniGrid(miniList, targetArea, grid);

  for (const [id, b] of Object.entries(packed)) {
    patchWidget(id, { bounds: b, iconBounds: b, isMini: true, size: 'icon' });
    const win = windows.get(id);
    if (win && !win.isDestroyed()) {
      win.setBounds(b);
      win.show();
      win.setAlwaysOnTop(Boolean(settings.get('alwaysOnTop')));
    }
  }
  settings.save();
  broadcast('settings:changed', publicSettings());
}

function resetLayout() {
  const miniWidgets = [];
  for (const [id, w] of windows) {
    if (!w || w.isDestroyed()) continue;
    const b = w.getBounds();
    const saved = widgetSetting(id);
    if (saved && (saved.size === 'icon' || saved.isMini || (b.width <= 90 && b.height <= 90))) {
      miniWidgets.push(id);
    }
  }

  // If there are mini widgets, arrange them neatly on the desktop grid!
  if (miniWidgets.length > 0) {
    arrangeMiniWidgets();
  }

  const layout = computeLayout();
  for (const [id, b] of Object.entries(layout)) {
    if (miniWidgets.includes(id)) continue;
    const preset = Object.entries(WIDGETS[id].sizes).find(([, [w, h]]) => w === b.width && h === b.height);
    patchWidget(id, { bounds: b, isMini: false, ...(preset ? { size: preset[0] } : {}) });
    const win = windows.get(id);
    if (win && !win.isDestroyed()) {
      win.setBounds(b);
      win.show();
      win.setAlwaysOnTop(Boolean(settings.get('alwaysOnTop')));
    }
  }
  settings.set('layoutVersion', LAYOUT_VERSION);
  broadcast('settings:changed', publicSettings());
}

/* ==================================================================== *
 * Per-widget context menu
 * ==================================================================== */

/** Nudge one widget's text size from its right-click menu. */
function bumpFont(id, delta) {
  const scales = { ...settings.get('fontScales', {}) };
  scales[id] = Math.round(Math.min(1.8, Math.max(0.7, (scales[id] ?? 1) + delta)) * 100) / 100;
  settings.set('fontScales', scales);
  broadcast('settings:changed', publicSettings());
}

function widgetMenu(win) {
  const id = widgetIdOf(win);
  if (!id) return null;
  const isFolder = Boolean(win._isFolder || (typeof id === 'string' && id.startsWith('folder')));
  const spec = isFolder ? WIDGETS.folder : WIDGETS[id];
  if (!spec) return null;
  const current = currentSizeKey(id);
  const isMini = !isFolder && (current === 'icon' || (win && win.getBounds().width <= 90));
  const items = [
    { label: titleOf(id), enabled: false },
    { type: 'separator' },
    ...Object.keys(spec.sizes).map((k) => ({
      label: T('menu.size', { size: T(`size.${k}`) }),
      type: 'radio',
      checked: current === k,
      click: () => setWidgetSize(id, k),
    })),
    { type: 'separator' },
    {
      label: T('menu.lock'), type: 'checkbox', checked: Boolean(widgetSetting(id)?.locked),
      click: (i) => { patchWidget(id, { locked: i.checked }); broadcast('settings:changed', publicSettings()); },
    },
    { type: 'separator' },
    { label: T('menu.fontUp'), click: () => bumpFont(id, 0.1) },
    { label: T('menu.fontDown'), click: () => bumpFont(id, -0.1) },
    { type: 'separator' },
    { label: T('menu.toggleMini'), click: () => toggleWidgetMini(win) },
    ...(isMini ? [
      { label: T('menu.arrangeMini') || 'محاذاة الأيقونات مع شبكة سطح المكتب', click: () => arrangeMiniWidgets() },
      { type: 'separator' },
      { label: '🔲 تحديد مستطيلي بالماوس (Marquee Select)', click: () => startMarqueeMode() },
      { label: '⊞ تحديد جميع الأيقونات ككتلة واحدة', click: () => selectAllMiniWidgets() },
      ...(selectedWidgets.size > 1 ? [
        { type: 'separator' },
        { label: `المجموعة المحددة (${selectedWidgets.size} عناصر)`, enabled: false },
        { label: '⊞ ترتيب المجموعة كشبكة منتظمة', click: () => arrangeSelectedGrid() },
        { label: '⤢ استعادة جميع العناصر المحددة', click: () => restoreSelectedWidgets() },
        { label: '✕ إلغاء التحديد', click: () => clearWidgetSelection() },
      ] : []),
    ] : []),
    { type: 'separator' },
  ];
  if (id === 'pomodoro') {
    const snap = pomodoro.snapshot();
    const isTransp = Boolean(settings.get('pomodoro')?.ultraTransparent);
    items.push(
      { label: T(snap.status === 'running' ? 'menu.pause' : 'menu.start'), click: () => pomodoro.toggle() },
      { label: T('menu.reset'), click: () => pomodoro.reset() },
      { label: T('menu.skip'), click: () => pomodoro.skip() },
      {
        label: T('pomo.transparency') || 'الشفافية القصوى',
        type: 'checkbox',
        checked: isTransp,
        click: (mi) => {
          settings.merge({ pomodoro: { ...(settings.get('pomodoro') || {}), ultraTransparent: mi.checked } });
          broadcast('settings:changed', publicSettings());
          const pWin = windows.get('pomodoro');
          if (pWin && !pWin.isDestroyed()) {
            pWin.webContents.send('pomodoro:toggle-transparency', mi.checked);
          }
        },
      },
      { type: 'separator' },
    );
  }
  if (id === 'quran') {
    items.push({ label: T('menu.newAyah'), click: () => refreshQuran(true) }, { type: 'separator' });
  }
  if (id === 'email') {
    items.push({ label: T('email.refresh') || 'تحديث البريد', click: () => emailEngine.check() }, { type: 'separator' });
  }
  if (id === 'photo') {
    items.push(
      {
        label: T('photo.change') || 'اختيار صورة…',
        click: async () => {
          const res = await dialog.showOpenDialog(win, {
            title: T('photo.pick'),
            filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg', 'avif'] }],
            properties: ['openFile'],
          });
          if (!res.canceled && res.filePaths.length) {
            settings.merge({ photo: { ...(settings.get('photo') || {}), mode: 'single', path: res.filePaths[0] } });
            broadcast('settings:changed', publicSettings());
          }
        },
      },
      { type: 'separator' },
    );
  }
  items.push(
    { label: T('menu.arrange'), click: resetLayout },
    { label: T('menu.settings'), click: () => openSettings(id) },
    { type: 'separator' },
    { label: T('menu.hide'), click: () => { setWidgetVisible(id, false); broadcast('settings:changed', publicSettings()); } },
  );
  return Menu.buildFromTemplate(items);
}

/* ==================================================================== *
 * Dragging and resizing
 *
 * Both are driven from the page and carried out here, so every step can be
 * kept inside the visible work area. A native drag region would let Windows
 * move the window anywhere, including off screen, and it also swallows the
 * pointer events the hover effects need.
 * ==================================================================== */

const gestures = new Map(); // webContents id -> gesture

function senderWindow(e) {
  const win = BrowserWindow.fromWebContents(e.sender);
  return win && !win.isDestroyed() ? win : null;
}

function otherWidgetBounds(win) {
  return [...windows.values()]
    .filter((w) => w !== win && !w.isDestroyed() && w.isVisible())
    .map((w) => w.getBounds());
}

/**
 * Ensures placed element gets its spot on the desktop while displacing any overlapping elements
 * (folders, open widgets, or mini icons) to the nearest non-overlapping spot.
 * Guarantees zero overlaps on the desktop.
 */
function applyDesktopCollisionDisplacement(placedId, targetBounds, win) {
  const area = areaFor(targetBounds);
  const isPlacedFolder = Boolean(win?._isFolder || (typeof placedId === 'string' && placedId.startsWith('folder')));
  const placedCurSetting = isPlacedFolder ? {} : (widgetSetting(placedId) || {});
  const isPlacedMini = !isPlacedFolder && ((targetBounds.width <= 90 && targetBounds.height <= 90) || placedCurSetting.isMini || placedCurSetting.size === 'icon');
  const isPlacedOpenWidget = !isPlacedFolder && !isPlacedMini;
  const preventOpenWidgetsOverlap = Boolean(settings.get('preventOpenWidgetsOverlap', true));

  const allDesktopElements = [];
  for (const [wId, wWin] of windows.entries()) {
    if (wId === placedId || !wWin || wWin.isDestroyed() || !wWin.isVisible()) continue;
    const b = wWin.getBounds();
    const isF = Boolean(wWin._isFolder || (typeof wId === 'string' && wId.startsWith('folder')));
    const curSetting = isF ? {} : (widgetSetting(wId) || {});
    const isM = !isF && ((b.width <= 90 && b.height <= 90) || curSetting.isMini || curSetting.size === 'icon');
    const isOpen = !isF && !isM;

    // By default, open widgets freely overlap with each other and with folders on the desktop.
    // Folders are never displaced when an open widget is opened or placed over them.
    if (isPlacedOpenWidget && (isOpen || isF) && !preventOpenWidgetsOverlap) {
      continue;
    }

    allDesktopElements.push({ id: wId, win: wWin, bounds: { ...b }, isFolder: isF, isMini: isM, isOpen });
  }

  let placedBounds = { ...targetBounds };
  let displacedBounds = {};

  if (isPlacedFolder) {
    // "الصندوق هو الي مكانه يتغير مش الويتجيت نفسها"
    // When a folder is placed or moved, widgets (and other folders) are fixed obstacles.
    // The folder changes its own position to avoid them, never displacing widgets!
    const obstacles = allDesktopElements.map(e => e.bounds);
    placedBounds = geo.avoidCollisions(targetBounds, area, obstacles, 4);
    displacedBounds = {};
  } else if (isPlacedMini && settings.get('snapToDesktopGrid') !== false) {
    // Mini widgets locked to the desktop grid strictly preserve their Cartesian grid slot!
    placedBounds = { ...targetBounds };
    displacedBounds = {};
  } else {
    // "خلي الويتجيت الجديده ( الي بتفتح دلوقتي ) هي الي مكانها يتغير مش الي بالفعل مفتوحيين"
    // When a widget is opened or placed:
    // All already-open widgets and desktop elements are fixed obstacles and remain stationary.
    // The newly opened widget changes its position to avoid collisions (tight gap: 4px).
    const obstacles = allDesktopElements.map(e => e.bounds);
    placedBounds = geo.avoidCollisions(targetBounds, area, obstacles, 4);
    displacedBounds = {};
  }

  // Apply displaced bounds to any elements that were pushed aside
  for (const [dId, nextB] of Object.entries(displacedBounds)) {
    const dWin = windows.get(dId);
    if (!dWin || dWin.isDestroyed()) continue;
    dWin.setBounds(nextB);
    const isF = Boolean(dWin._isFolder || (typeof dId === 'string' && dId.startsWith('folder')));
    if (isF) {
      const folders = getFolders();
      if (folders[dId]) {
        folders[dId].bounds = { ...nextB };
        saveFolders(folders);
      }
    } else {
      const cur = widgetSetting(dId) || {};
      const isM = (nextB.width <= 90 && nextB.height <= 90) || cur.isMini || cur.size === 'icon';
      if (isM) {
        patchWidget(dId, { bounds: nextB, iconBounds: nextB, isMini: true, size: 'icon' });
      } else {
        patchWidget(dId, { bounds: nextB, prevNormalBounds: nextB, isMini: false });
      }
    }
  }

  // Apply to placed window
  if (win && !win.isDestroyed()) {
    win.setBounds(placedBounds);
  }

  const isFolder = Boolean(win?._isFolder || (typeof placedId === 'string' && placedId.startsWith('folder')));
  if (isFolder) {
    const folders = getFolders();
    if (folders[placedId]) {
      folders[placedId].bounds = { ...placedBounds };
      saveFolders(folders);
    }
  } else {
    const cur = widgetSetting(placedId) || {};
    const isMini = (placedBounds.width <= 90 && placedBounds.height <= 90) || cur.isMini || cur.size === 'icon';
    if (isMini) {
      patchWidget(placedId, { bounds: placedBounds, iconBounds: placedBounds, isMini: true, size: 'icon' });
    } else {
      patchWidget(placedId, { bounds: placedBounds, prevNormalBounds: placedBounds, isMini: false });
    }
  }

  settings.flush();
  return placedBounds;
}

function registerGestures() {
  const lockedWin = (win) => {
    const id = widgetIdOf(win);
    return Boolean(id && widgetSetting(id)?.locked);
  };

  ipcMain.on('win:dragStart', (e, { sx, sy }) => {
    const win = senderWindow(e);
    if (!win || lockedWin(win)) return;
    const b = win.getBounds();
    const id = widgetIdOf(win);
    const isMini = (b.width <= 90 && b.height <= 90) || Boolean(id && widgetSetting(id)?.isMini);

    // Multi-Selection Group Drag: if dragged widget is part of selected group, drag all together!
    if (id && selectedWidgets.has(id) && selectedWidgets.size > 1) {
      const groupStarts = {};
      for (const sId of selectedWidgets) {
        const sWin = windows.get(sId);
        if (sWin && !sWin.isDestroyed()) {
          groupStarts[sId] = sWin.getBounds();
        }
      }
      gestures.set(e.sender.id, {
        kind: 'groupDrag',
        anchorId: id,
        startX: sx,
        startY: sy,
        groupStarts,
      });
      return;
    }

    const area = areaFor(b);
    const isFolder = Boolean(id && (id.startsWith('folder') || win._isFolder));

    // Cache all standalone desktop widgets and folder windows
    const standaloneTargets = [];
    const folderTargets = [];
    for (const [wId, wWin] of windows.entries()) {
      if (wId === id || !wWin || wWin.isDestroyed() || !wWin.isVisible()) continue;
      const wb = wWin.getBounds();
      if (wId.startsWith('folder') || wWin._isFolder) {
        folderTargets.push({ id: wId, bounds: wb, win: wWin });
      } else if (wb.width <= 90 && wb.height <= 90) {
        standaloneTargets.push({ id: wId, bounds: wb, win: wWin });
      }
    }

    gestures.set(e.sender.id, {
      kind: 'drag', offX: sx - b.x, offY: sy - b.y, width: b.width, height: b.height,
      widget: Boolean(id),
      isMini: Boolean(isMini),
      isFolder,
      id,
      area,
      standaloneTargets,
      folderTargets,
      hoverFolder: null,
      hoverStandalone: null,
      hoverTimer: null,
    });
  });

  ipcMain.on('win:dragMove', (e, { sx, sy }) => {
    const g = gestures.get(e.sender.id);
    const win = senderWindow(e);
    if (!g || !win) return;

    if (g.kind === 'groupDrag') {
      const dx = Math.round(sx - g.startX);
      const dy = Math.round(sy - g.startY);
      for (const [sId, b0] of Object.entries(g.groupStarts)) {
        const sWin = windows.get(sId);
        if (sWin && !sWin.isDestroyed()) {
          sWin.setBounds({
            x: Math.round(b0.x + dx),
            y: Math.round(b0.y + dy),
            width: b0.width,
            height: b0.height,
          });
        }
      }
      updateGroupToolbarPosition();
      return;
    }

    if (g.kind !== 'drag') return;
    const targetX = Math.round(sx - g.offX);
    const targetY = Math.round(sy - g.offY);
    const area = g.area || areaFor(win.getBounds());
    const maxX = area.x + area.width - g.width;
    const maxY = area.y + area.height - g.height;
    const x = Math.max(area.x, Math.min(maxX, targetX));
    const y = Math.max(area.y, Math.min(maxY, targetY));

    if (g.lastX !== x || g.lastY !== y) {
      g.lastX = x;
      g.lastY = y;
      // Zero-overhead direct hardware positioning (buttery smooth 1:1 motion)
      win.setBounds({ x, y, width: g.width, height: g.height }, false);
    }

    if (!g.isFolder && g.isMini && g.id) {
      // 1. Check if hovering over an existing folder
      let matchedFolder = null;
      for (const ft of (g.folderTargets || [])) {
        const fb = ft.bounds;
        if (sx >= fb.x && sx <= fb.x + fb.width && sy >= fb.y && sy <= fb.y + fb.height) {
          matchedFolder = ft;
          break;
        }
      }

      if (matchedFolder !== g.hoverFolder) {
        if (g.hoverFolder && !g.hoverFolder.win.isDestroyed()) {
          g.hoverFolder.win.webContents.send('folder:drag-hover', { isOver: false, folderId: g.hoverFolder.id, dragId: g.id });
        }
        g.hoverFolder = matchedFolder;
        if (g.hoverFolder && !g.hoverFolder.win.isDestroyed()) {
          g.hoverFolder.win.webContents.send('folder:drag-hover', { isOver: true, folderId: g.hoverFolder.id, dragId: g.id });
        }
      }

      // 2. Check if hovering over another standalone widget (to create a folder after 1s)
      let matchedStandalone = null;
      if (!matchedFolder) {
        for (const st of (g.standaloneTargets || [])) {
          const sb = st.bounds;
          if (sx >= sb.x && sx <= sb.x + sb.width && sy >= sb.y && sy <= sb.y + sb.height) {
            matchedStandalone = st;
            break;
          }
        }
      }

      if (matchedStandalone !== g.hoverStandalone) {
        if (g.hoverStandalone && !g.hoverStandalone.win.isDestroyed()) {
          g.hoverStandalone.win.webContents.send('widget:folder-hover-target', { isTarget: false, sourceId: g.id });
        }
        if (g.hoverTimer) {
          clearTimeout(g.hoverTimer);
          g.hoverTimer = null;
        }

        g.hoverStandalone = matchedStandalone;

        if (g.hoverStandalone && !g.hoverStandalone.win.isDestroyed()) {
          g.hoverStandalone.win.webContents.send('widget:folder-hover-target', { isTarget: true, sourceId: g.id });

          const srcId = g.id;
          const srcBounds = { width: g.width, height: g.height };
          const tgtId = g.hoverStandalone.id;
          const tgtBounds = { ...g.hoverStandalone.bounds };
          const tgtWin = g.hoverStandalone.win;

          g.hoverTimer = setTimeout(() => {
            if (gestures.has(e.sender.id)) {
              if (tgtWin && !tgtWin.isDestroyed()) {
                tgtWin.webContents.send('widget:folder-hover-target', { isTarget: false, sourceId: srcId });
              }
              gestures.delete(e.sender.id);
              createFolderFromHover(srcId, tgtId, tgtBounds, srcBounds);
            }
          }, 1000);
        }
      }
    }
  });

  ipcMain.on('win:resizeStart', (e, { sx, sy, corner }) => {
    const win = senderWindow(e);
    if (!win || lockedWin(win)) return;
    const b = win.getBounds();
    if (b.width <= 90 && b.height <= 90) return; // Disallow resizing mini app icons!
    const [minW, minH] = win.getMinimumSize();
    const [maxW, maxH] = win.getMaximumSize();
    const isFolder = Boolean(win._isFolder || (win._widgetId && win._widgetId.startsWith('folder')));
    let folderLimits = null;
    let fid = null;
    let startMode = null;
    if (isFolder) {
      fid = win._folderId || win._widgetId;
      const f = getFolder(fid);
      const itemCount = (f && Array.isArray(f.widgetIds)) ? f.widgetIds.length : 6;
      folderLimits = geo.getFolderSmartLimits(itemCount, b.width, b.height, win._isFolderExpanded);
      startMode = folderLimits.mode;
    }
    gestures.set(e.sender.id, {
      kind: 'resize', sx, sy, corner: /^(bl|br|n|s|e|w|ne|nw|se|sw)$/.test(corner) ? corner : 'bl',
      start: b,
      isFolder,
      folderId: fid,
      startMode,
      min: isFolder && folderLimits ? folderLimits.min : [minW || 120, minH || 120],
      max: isFolder && folderLimits ? folderLimits.max : [maxW || Infinity, maxH || Infinity],
    });
  });

  ipcMain.on('win:resizeMove', (e, { sx, sy }) => {
    const g = gestures.get(e.sender.id);
    const win = senderWindow(e);
    if (!g || g.kind !== 'resize' || !win) return;
    const area = areaFor(g.start);

    let minLimits = g.min;
    let maxLimits = g.max;
    if (g.isFolder) {
      const f = getFolder(g.folderId);
      const itemCount = (f && Array.isArray(f.widgetIds)) ? f.widgetIds.length : 6;
      const corner = g.corner || 'bl';
      const dx = sx - g.sx;
      const dy = sy - g.sy;
      const projW = (corner.includes('w') || corner === 'bl') ? g.start.width - dx : g.start.width + dx;
      const projH = (corner.includes('n')) ? g.start.height - dy : g.start.height + dy;
      const dynamicLimits = geo.getFolderSmartLimits(itemCount, projW, projH, win._isFolderExpanded, g.startMode);
      minLimits = dynamicLimits.min;
      maxLimits = dynamicLimits.max;
    }

    const next = geo.resizeFrom(g.start, g.corner, sx - g.sx, sy - g.sy, area, minLimits, maxLimits);
    if (g.lastBounds && g.lastBounds.x === next.x && g.lastBounds.y === next.y && g.lastBounds.width === next.width && g.lastBounds.height === next.height) return;
    g.lastBounds = next;
    win.setBounds(next, false);
  });

  ipcMain.on('win:gestureEnd', (e) => {
    const g = gestures.get(e.sender.id);
    gestures.delete(e.sender.id);
    const win = senderWindow(e);
    if (!g || !win) return;

    if (g.hoverTimer) {
      clearTimeout(g.hoverTimer);
      g.hoverTimer = null;
    }

    if (g.kind === 'groupDrag') {
      for (const sId of Object.keys(g.groupStarts)) {
        const sWin = windows.get(sId);
        if (sWin && !sWin.isDestroyed()) {
          const b = sWin.getBounds();
          patchWidget(sId, { bounds: b, iconBounds: b, isMini: true, size: 'icon' });
        }
      }
      settings.save();
      broadcast('settings:changed', publicSettings());
      updateGroupToolbarPosition();
      return;
    }

    // 1. Dropped directly into an existing smart folder
    if (g.hoverFolder) {
      const fid = g.hoverFolder.id;
      if (!g.hoverFolder.win.isDestroyed()) {
        g.hoverFolder.win.webContents.send('folder:drag-hover', { isOver: false, folderId: fid, dragId: g.id });
      }
      addWidToFolder(fid, g.id);
      return;
    }

    // Cancel any pending standalone hover indicator
    if (g.hoverStandalone && !g.hoverStandalone.win.isDestroyed()) {
      g.hoverStandalone.win.webContents.send('widget:folder-hover-target', { isTarget: false, sourceId: g.id });
    }

    const id = widgetIdOf(win);
    if (id) {
      let b = win.getBounds();
      const isFolder = Boolean(id.startsWith('folder') || win._isFolder);
      const spec = isFolder ? WIDGETS.folder : WIDGETS[id];
      const isMini = !isFolder && ((b.width <= 90 && b.height <= 90) || widgetSetting(id)?.isMini);
      const snapEnabled = settings.get('snapToDesktopGrid') !== false;

      if (isMini && snapEnabled) {
        const area = areaFor(b);
        const grid = geo.getDesktopGridMetrics();
        b = geo.snapToDesktopGrid(b, area, otherWidgetBounds(win), { ...grid, avoidCollisions: true });
      } else if (!isMini && snapEnabled && g.kind !== 'resize') {
        b = geo.snap(b, g.area || areaFor(b), otherWidgetBounds(win));
      }

      if (spec && !isMini && (b.width > 90 || b.height > 90)) {
        win.setMinimumSize(spec.min[0], spec.min[1]);
      }

      if (isFolder) {
        if (g.kind === 'resize') {
          // Smart Snug Sizing for Folders: Eliminate excessive empty wasteland
          const folderObj = getFolder(id);
          const itemCount = (folderObj && Array.isArray(folderObj.widgetIds)) ? folderObj.widgetIds.length : 6;
          const limits = geo.getFolderSmartLimits(itemCount, b.width, b.height, win._isFolderExpanded);

          // 1. Strictly bound within smart min and max
          b.width = Math.max(limits.min[0], Math.min(limits.max[0], b.width));
          b.height = Math.max(limits.min[1], Math.min(limits.max[1], b.height));

          // 2. Snug to optimal content footprint per orientation mode:
          if (limits.mode === 'dock-h') {
            b.height = 72; // Slim dock height
            const snugW = Math.round(itemCount * 48 + (itemCount - 1) * 10 + 26);
            b.width = Math.max(limits.min[0], Math.min(limits.max[0], Math.max(b.width, snugW)));
          } else if (limits.mode === 'dock-v') {
            b.width = 72; // Slim pillar width
            const snugH = Math.round(itemCount * 48 + (itemCount - 1) * 10 + 26);
            b.height = Math.max(limits.min[1], Math.min(limits.max[1], Math.max(b.height, snugH)));
          }

          const area = areaFor(b);
          b = geo.clampToArea(b, area);
          win.setBounds(b);
          const folders = getFolders();
          if (folders[id]) {
            folders[id].bounds = { ...b };
            saveFolders(folders);
          }
        }

        const otherFolderObstacles = [];
        for (const [wId, w] of windows.entries()) {
          if (wId !== id && w && !w.isDestroyed() && w._isFolder) {
            try { otherFolderObstacles.push(w.getBounds()); } catch (_) { }
          }
        }
        b = geo.avoidCollisions(b, g.area || areaFor(b), otherFolderObstacles, 16);
      }

      // Displace any overlapping elements on desktop and ensure zero overlaps
      b = applyDesktopCollisionDisplacement(id, b, win);

      if (!isFolder && g.kind === 'resize') {
        patchWidget(id, { size: currentSizeKey(id) || widgetSetting(id).size });
      }
      settings.flush();
    }
  });

  ipcMain.on('win:contextMenu', (e) => {
    const win = senderWindow(e);
    if (!win) return;
    const menu = widgetMenu(win);
    if (menu) menu.popup({ window: win });
  });
}

/* ==================================================================== *
 * Quran scheduling
 * ==================================================================== */

/** Which kind the current slot shows. Alternating flips at every slot. */
function inspirationKind() {
  const mode = settings.get('inspiration') || 'quran';
  if (mode !== 'alternate') return mode;
  const ctx = selector.buildContext(new Date(), { intervalHours: quran.intervalHours(settings.data) });
  return ctx.slot.index % 2 === 0 ? 'quran' : 'hadith';
}

/**
 * The widget's content for this slot. If a hadith cannot be shown (offline
 * with nothing verified cached), the slot falls back to an ayah rather than
 * leaving the widget empty.
 */
async function currentInspiration(force = false) {
  const kind = inspirationKind();
  if (kind === 'hadith') {
    try {
      return { kind: 'hadith', payload: await hadith.current(settings.data, { force }) };
    } catch (err) {
      const payload = await quran.current(settings.data, { force });
      return { kind: 'quran', payload, fallback: true };
    }
  }
  return { kind: 'quran', payload: await quran.current(settings.data, { force }) };
}

async function refreshQuran(force = false) {
  try {
    const result = await currentInspiration(force);
    if (result.kind === 'quran') broadcast('quran:update', result.payload);
    broadcast('inspire:update', result);
    scheduleQuran(result.payload);
    return result.payload;
  } catch (err) {
    broadcast('quran:error', { code: err.code || 'ERR', message: err.message });
    // Try again before the slot would have ended, in case the network returns.
    clearTimeout(quranTimer);
    quranTimer = setTimeout(() => refreshQuran(false), 5 * 60 * 1000);
    return null;
  }
}

/** Wake exactly when the current slot ends. */
function scheduleQuran(payload) {
  clearTimeout(quranTimer);
  const endsAt = payload && payload.slot ? payload.slot.endsAt : Date.now() + 3600e3;
  const delay = Math.max(15_000, Math.min(endsAt - Date.now() + 1500, 6 * 3600e3));
  quranTimer = setTimeout(() => refreshQuran(false), delay);
}

/* A sleeping laptop stops timers; re-check whenever the machine comes back. */
function watchPower() {
  const { powerMonitor } = require('electron');
  try {
    currentPowerState.onBattery = Boolean(powerMonitor?.isOnBatteryPower?.());
  } catch { }
  evaluateEcoState();

  const wake = debounce(() => {
    debugLog('[PowerMonitor] System resumed / woke up. Triggering immediate catchup & evaluation...');
    currentPowerState.suspended = false;
    currentPowerState.locked = false;
    evaluateEcoState();
    if (widgetSetting('todo')?.visible) {
      reminders.check();
      runClassroomBackgroundSync();
      superUrgentMonitor.evaluate();
    }
    if (widgetSetting('quran')?.visible) {
      refreshQuran(false);
    }
    if (widgetSetting('pomodoro')?.visible) {
      pomodoro.wake();
    }
    if (widgetSetting('email')?.visible && settings.get('email', {}).enabled) {
      emailEngine.check();
    }
    if (widgetSetting('calendar')?.visible) {
      calendarEventsManager.evaluate();
    }
    if (widgetSetting('todo')?.visible || widgetSetting('calendar')?.visible) {
      reliableDispatcher.catchup({
        todos: widgetSetting('todo')?.visible ? todos.get('items', []) : [],
        calendarEvents: widgetSetting('calendar')?.visible ? calendarEventsStore.get('events', []) : [],
      });
    }
    broadcast('system:wake', Date.now());
  }, 800);

  for (const ev of ['resume', 'unlock-screen', 'user-did-become-active']) {
    try { powerMonitor.on(ev, wake); } catch { /* not on every platform */ }
  }

  try {
    powerMonitor.on('on-battery', () => {
      debugLog('[PowerMonitor] Switched to battery power.');
      currentPowerState.onBattery = true;
      evaluateEcoState();
    });
    powerMonitor.on('on-ac', () => {
      debugLog('[PowerMonitor] Switched to AC power.');
      currentPowerState.onBattery = false;
      evaluateEcoState();
    });
    powerMonitor.on('suspend', () => {
      debugLog('[PowerMonitor] System entering sleep/suspend.');
      currentPowerState.suspended = true;
      try { saveAllWidgetStates(); } catch { }
      broadcast('system:suspend', Date.now());
    });
    powerMonitor.on('lock-screen', () => {
      debugLog('[PowerMonitor] Screen locked.');
      currentPowerState.locked = true;
      broadcast('system:lock', Date.now());
    });
  } catch { }
}

/* ==================================================================== *
 * Pomodoro notifications
 * ==================================================================== */

function iconPath() {
  return path.join(__dirname, 'assets', 'icon.png');
}

const reminders = new Reminders(todos);
let lastReminders = [];

function fmtTime(ts) {
  const lang = settings.get('language') === 'en' ? 'en-GB' : `ar-EG-u-nu-${settings.get('numerals') === 'arab' ? 'arab' : 'latn'}`;
  return new Date(ts).toLocaleTimeString(lang, { hour: 'numeric', minute: '2-digit' });
}

function onRemindersDue(list) {
  broadcast('todos:changed', todos.get('items', []));
  lastReminders = list.map((d) => ({ task: d.task.id, at: d.reminder.at, late: d.late }));
  if (process.env.WIDGETS_SILENT || !Notification.isSupported()) return;
  for (const { task, reminder, late } of list) {
    const lines = [];
    if (late) lines.push(T('reminder.late', { time: fmtTime(reminder.at) }));
    if (task.due) lines.push(T('reminder.due', { date: task.due }));
    const note = (task.notes || '').split('\n').find((l) => l.trim());
    if (note) lines.push(note.trim().slice(0, 140));
    const n = new Notification({
      title: T('reminder.title', { task: task.text.slice(0, 80) }),
      body: lines.join('\n') || ' ',
      icon: iconPath(),
    });
    n.on('click', () => openTask(task.id));
    n.show();
  }
}

/** Clean up a patch coming from a page before it touches stored tasks. */
function cleanTaskPatch(patch = {}) {
  const out = {};
  if (typeof patch.text === 'string') out.text = patch.text.replace(/\s+/g, ' ').trim().slice(0, 300);
  if (typeof patch.notes === 'string') out.notes = patch.notes.slice(0, 20000);
  if ('done' in patch) out.done = Boolean(patch.done);
  if ('doneManually' in patch) out.doneManually = Boolean(patch.doneManually);
  if ('priority' in patch) out.priority = [0, 1, 2].includes(patch.priority) ? patch.priority : 0;
  if ('due' in patch) out.due = /^\d{4}-\d{2}-\d{2}$/.test(patch.due || '') ? patch.due : null;
  if ('hideAfter' in patch) {
    const h = patch.hideAfter;
    out.hideAfter = h === null ? null : Math.max(0, Math.min(24 * 30, Number(h) || 0));
  }
  if (patch.classroom && typeof patch.classroom === 'object') {
    out.classroom = { ...patch.classroom };
  }
  if ('superUrgent' in patch) {
    out.superUrgent = Boolean(patch.superUrgent);
  }
  if (Array.isArray(patch.reminders)) {
    out.reminders = patch.reminders
      .filter((r) => r && Number.isFinite(r.at))
      .slice(0, 20)
      .map((r) => ({ id: String(r.id || `${r.at}`), at: Math.round(r.at), fired: Boolean(r.fired), ...(r.firedAt ? { firedAt: r.firedAt } : {}) }))
      .sort((a, b) => a.at - b.at);
  }
  return out;
}

function onPomodoroDone({ finished, next, autoStarted }) {
  const cfg = pomodoro.config;
  const widget = windows.get('pomodoro');
  const widgetOpen = Boolean(widget && !widget.isDestroyed());
  // The widget plays a soft chime of its own; without it, let Windows sound.
  const chimeInWidget = cfg.sound && widgetOpen;
  broadcast('pomodoro:done', { finished, next, autoStarted, chime: chimeInWidget });

  if (!cfg.notify || process.env.WIDGETS_SILENT || !Notification.isSupported()) return;
  const mins = cfg[next];
  const title = finished === 'focus'
    ? T('pomo.doneFocus', { label: cfg.label })
    : T(finished === 'long' ? 'pomo.doneLong' : 'pomo.doneShort');
  const body = next === 'focus'
    ? T(autoStarted ? 'pomo.nextFocusAuto' : 'pomo.nextFocus', { label: cfg.label, mins })
    : T(autoStarted ? 'pomo.nextBreakAuto' : 'pomo.nextBreak', { mode: modeName(next), mins });

  const n = new Notification({ title, body, silent: chimeInWidget || !cfg.sound, icon: iconPath() });
  n.on('click', () => {
    if (!widgetSetting('pomodoro')?.visible) setWidgetVisible('pomodoro', true);
    bringToFront();
  });
  n.show();
}

/* ==================================================================== *
 * IPC
 * ==================================================================== */

function publicSettings() {
  return { ...settings.data, autoStart: autostart.isEnabled() };
}

function registerIpc() {
  ipcMain.handle('settings:get', () => publicSettings());

  ipcMain.handle('settings:set', (_e, patch) => {
    const before = { ...settings.data };
    const clean = { ...patch };

    if ('autoStart' in clean) {
      try { autostart.set(Boolean(clean.autoStart)); } catch (err) { console.error('autostart:', err.message); }
      delete clean.autoStart;
    }
    for (const key of ['clock', 'calendar', 'fontScales', 'glass', 'todo', 'look', 'email', 'photo', 'classroom', 'superUrgent', 'whatsapp', 'habits', 'browser']) {
      if (clean[key]) clean[key] = { ...settings.data[key], ...clean[key] };
    }
    if (clean.eco) {
      clean.eco = {
        ...settings.data.eco,
        ...clean.eco,
        widgets: {
          ...(settings.data.eco?.widgets || {}),
          ...(clean.eco.widgets || {}),
        },
      };
    }
    if ('widgetStyles' in clean) {
      clean.widgetStyles = clean.widgetStyles || {};
    }
    if ('language' in clean) clean.language = ['ar', 'en', 'auto'].includes(clean.language) ? clean.language : 'auto';
    if ('inspiration' in clean && !['quran', 'hadith', 'alternate'].includes(clean.inspiration)) delete clean.inspiration;
    if (clean.pomodoro) clean.pomodoro = normalizeConfig({ ...settings.data.pomodoro, ...clean.pomodoro });
    delete clean.widgets;   // geometry and visibility have their own channels
    settings.merge(clean);

    if ('alwaysOnTop' in patch) applyWindowLevel();
    if ((patch.quranIntervalHours && patch.quranIntervalHours !== before.quranIntervalHours)
      || ('inspiration' in clean && clean.inspiration !== before.inspiration)) {
      refreshQuran(false);
    }
    if (clean.pomodoro) pomodoro.reconfigure();
    if (clean.habits) {
      if (typeof clean.habits.enabled === 'boolean') {
        const curVis = Boolean(widgetSetting('habits')?.visible);
        if (curVis !== clean.habits.enabled) {
          setWidgetVisible('habits', clean.habits.enabled);
        }
      }
      syncHabitsToTodos();
    }
    if (clean.classroom && Array.isArray(clean.classroom.hiddenCourses)) {
      const allTodos = todos.get('items', []) || [];
      const purged = allTodos.filter((t) => !isTaskCourseHidden(t, clean.classroom.hiddenCourses));
      if (purged.length !== allTodos.length) {
        todos.set('items', purged);
        todos.save();
        broadcast('todos:changed', purged);
      }
    }
    if (clean.classroom && clean.classroom.enabled && !before.classroom?.enabled) {
      runClassroomBackgroundSync();
    }
    if (clean.email) {
      if (clean.email.user && clean.email.pass) {
        clean.email.enabled = true;
      }
      syncWidgetServices();
      if (typeof emailEngine !== 'undefined' && emailEngine && clean.email.user && clean.email.pass) {
        emailEngine.start();
        emailEngine.check().catch(() => { });
      }
    }
    if ('language' in clean && clean.language !== before.language) {
      updateTrayTooltip();
      for (const [id, w] of windows) if (!w.isDestroyed()) w.setTitle(titleOf(id));
    }
    if ('eco' in clean) {
      evaluateEcoState();
    }
    const next = publicSettings();
    broadcast('settings:changed', next);
    rebuildTray();
    return next;
  });

  ipcMain.handle('power:get-status', () => ({
    ...currentPowerState,
    ecoSettings: settings.get('eco', DEFAULTS.eco),
  }));

  ipcMain.handle('settings:reset', () => {
    try {
      const { defaultBackupManager } = require('./src/core/backup-manager');
      defaultBackupManager.createSnapshot(paths.settings, settings.data, 'pre_reset', true);
    } catch (_) { }
    const keep = settings.get('widgets', {});
    const language = settings.get('language');
    settings.merge({ ...structuredClone(DEFAULTS), language });
    // Keep which widgets are shown; their positions go back to the layout.
    for (const [id, cfg] of Object.entries(keep)) {
      if (WIDGETS[id]) patchWidget(id, { visible: cfg.visible, size: WIDGETS[id].size });
    }
    for (const id of Object.keys(WIDGETS)) setWidgetSize(id, WIDGETS[id].size);
    applyWindowLevel();
    resetLayout();
    pomodoro.reconfigure();
    const next = publicSettings();
    broadcast('settings:changed', next);
    return next;
  });

  /* ---- sovereign backup & auto-recovery vault ---- */
  ipcMain.handle('backup:get-stats', () => {
    try {
      const { defaultBackupManager } = require('./src/core/backup-manager');
      return defaultBackupManager.getStats();
    } catch (err) {
      return { error: err.message, totalSnapshots: 0 };
    }
  });

  ipcMain.handle('backup:list', (_e, storeName) => {
    try {
      const { defaultBackupManager } = require('./src/core/backup-manager');
      return defaultBackupManager.listSnapshots(storeName);
    } catch (err) {
      return [];
    }
  });

  ipcMain.handle('backup:list-snapshots', (_e, storeName) => {
    try {
      const { defaultBackupManager } = require('./src/core/backup-manager');
      return defaultBackupManager.listSnapshots(storeName);
    } catch (err) {
      return [];
    }
  });

  ipcMain.handle('backup:create-checkpoint', (_e, { store, reason } = {}) => {
    try {
      const { defaultBackupManager } = require('./src/core/backup-manager');
      const targetStore = store || 'all';
      if (targetStore === 'all') {
        const results = {};
        const storesList = [
          { name: 'settings', path: paths.settings, store: settings },
          { name: 'todos', path: paths.todos, store: todos },
          { name: 'notes', path: paths.notes, store: notes },
          { name: 'habits', path: paths.habits, store: typeof habitsStore !== 'undefined' ? habitsStore : null },
          { name: 'atlas', path: paths.atlas, store: typeof atlasEngine !== 'undefined' && atlasEngine && atlasEngine.store ? atlasEngine.store.store : null },
          { name: 'calendarEvents', path: paths.calendarEvents, store: typeof calendarEventsStore !== 'undefined' ? calendarEventsStore : null },
        ];
        for (const item of storesList) {
          let data = item.store ? item.store.data : null;
          if (!data && fs.existsSync(item.path)) {
            try { data = JSON.parse(fs.readFileSync(item.path, 'utf8')); } catch (_) { }
          }
          if (data) {
            results[item.name] = defaultBackupManager.createSnapshot(item.path, data, reason || 'manual', true);
          }
        }
        return results;
      }

      const p = paths[targetStore] || path.join(paths.root, `${targetStore}.json`);
      let data = null;
      if (targetStore === 'settings') data = settings.data;
      else if (targetStore === 'habits') data = typeof habitsStore !== 'undefined' ? habitsStore.data : null;
      else if (targetStore === 'todos') data = todos.data;
      else if (targetStore === 'notes') data = notes.data;
      else if (targetStore === 'atlas') data = typeof atlasEngine !== 'undefined' && atlasEngine && atlasEngine.store ? atlasEngine.store.data : null;
      else if (targetStore === 'calendarEvents') data = typeof calendarEventsStore !== 'undefined' ? calendarEventsStore.data : null;
      else if (fs.existsSync(p)) {
        try { data = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (_) { }
      }
      if (data) {
        return defaultBackupManager.createSnapshot(p, data, reason || 'manual', true);
      }
      return null;
    } catch (err) {
      return null;
    }
  });

  ipcMain.handle('backup:auto-heal', (_e, storeName) => {
    try {
      const { defaultBackupManager } = require('./src/core/backup-manager');
      const targetStore = storeName || 'settings';
      const p = paths[targetStore] || path.join(paths.root, `${targetStore}.json`);
      const recovered = defaultBackupManager.autoRecover(p);
      if (recovered) {
        if (targetStore === 'settings') {
          settings.merge(recovered);
          settings.flush();
          broadcast('settings:changed', publicSettings());
        } else if (targetStore === 'todos') {
          todos.merge(recovered);
          todos.flush();
          broadcast('todos:changed', todos.data);
        } else if (targetStore === 'notes') {
          notes.merge(recovered);
          notes.flush();
          broadcast('notes:changed', notes.data);
        } else if (targetStore === 'habits' && typeof habitsStore !== 'undefined') {
          habitsStore.merge(recovered);
          habitsStore.flush();
          broadcast('habits:changed', habitsStore.data);
        }
      }
      return { success: Boolean(recovered), data: recovered };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('backup:export-archive', async (e, { password } = {}) => {
    try {
      const { defaultBackupManager } = require('./src/core/backup-manager');
      try {
        if (settings && settings.flush) settings.flush();
        if (todos && todos.flush) todos.flush();
        if (notes && notes.flush) notes.flush();
        if (typeof habitsStore !== 'undefined' && habitsStore && habitsStore.flush) habitsStore.flush();
        if (typeof calendarEventsStore !== 'undefined' && calendarEventsStore && calendarEventsStore.flush) calendarEventsStore.flush();
        if (typeof atlasEngine !== 'undefined' && atlasEngine && atlasEngine.store && atlasEngine.store.store && atlasEngine.store.store.flush) {
          atlasEngine.store.store.flush();
        }
      } catch (_) { }

      const win = senderWindow(e);
      const res = await dialog.showSaveDialog(win || null, {
        title: 'Export Encrypted Sovereign Backup',
        defaultPath: path.join(os.homedir(), `shema-backup-${Date.now()}.shemabak`),
        filters: [{ name: 'SHĒMA Encrypted Vault', extensions: ['shemabak'] }],
      });
      if (res.canceled || !res.filePath) return { canceled: true };
      defaultBackupManager.exportEncryptedArchive(password || 'shema-secure', res.filePath);
      return { success: true, filePath: res.filePath };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('backup:import-archive', async (e, { password } = {}) => {
    try {
      const { defaultBackupManager } = require('./src/core/backup-manager');
      const win = senderWindow(e);
      const res = await dialog.showOpenDialog(win || null, {
        title: 'Import Encrypted Sovereign Backup',
        filters: [{ name: 'SHĒMA Encrypted Vault', extensions: ['shemabak'] }],
        properties: ['openFile'],
      });
      if (res.canceled || !res.filePaths || !res.filePaths[0]) return { canceled: true };
      const result = defaultBackupManager.importEncryptedArchive(res.filePaths[0], password || 'shema-secure');
      // Reload active in-memory stores and notify renderer windows
      try {
        if (fs.existsSync(paths.settings)) {
          const raw = fs.readFileSync(paths.settings, 'utf8');
          settings.merge(JSON.parse(raw));
          broadcast('settings:changed', publicSettings());
        }
        if (fs.existsSync(paths.todos)) {
          const raw = fs.readFileSync(paths.todos, 'utf8');
          todos.merge(JSON.parse(raw));
          broadcast('todos:changed', todos.data);
        }
        if (fs.existsSync(paths.notes)) {
          const raw = fs.readFileSync(paths.notes, 'utf8');
          notes.merge(JSON.parse(raw));
          broadcast('notes:changed', notes.data);
        }
        if (typeof habitsStore !== 'undefined' && fs.existsSync(paths.habits)) {
          const raw = fs.readFileSync(paths.habits, 'utf8');
          habitsStore.merge(JSON.parse(raw));
          broadcast('habits:changed', habitsStore.data);
        }
        if (typeof atlasEngine !== 'undefined' && atlasEngine && fs.existsSync(paths.atlas)) {
          broadcast('atlas:updated', await atlasEngine.getDashboardState(settings.get('language') || 'ar'));
        }
      } catch (_) { }
      return { ...result, filePath: res.filePaths[0] };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('browser:getProfiles', () => {
    const chromeExe = findChromeExecutable();
    return {
      chromeFound: Boolean(chromeExe),
      chromePath: chromeExe || '',
      profiles: getChromeProfiles(),
      current: settings.get('browser', DEFAULTS.browser || {}),
    };
  });

  ipcMain.handle('browser:test', (_e, { url, profileFolder } = {}) => {
    const targetUrl = url || 'https://myaccount.google.com/';
    const chromeExe = findChromeExecutable();
    if (!chromeExe) {
      shell.openExternal(targetUrl).catch(() => { });
      return { ok: true, fallback: true };
    }
    const folder = profileFolder || settings.get('browser', {})?.chromeProfile || 'Default';
    try {
      const { spawn } = require('child_process');
      const proc = spawn(chromeExe, [`--profile-directory=${folder}`, targetUrl], { detached: true, stdio: 'ignore' });
      proc.unref();
      return { ok: true, profile: folder };
    } catch (err) {
      shell.openExternal(targetUrl).catch(() => { });
      return { ok: false, error: err.message };
    }
  });

  ipcMain.handle('widgets:visible', (_e, { id, visible }) => {
    setWidgetVisible(id, visible);
    broadcast('settings:changed', publicSettings());
    return publicSettings();
  });

  ipcMain.handle('widgets:size', (_e, { id, size }) => {
    setWidgetSize(id, size);
    broadcast('settings:changed', publicSettings());
    return publicSettings();
  });

  ipcMain.handle('win:toggleMini', (e) => {
    const win = senderWindow(e);
    return toggleWidgetMini(win);
  });

  ipcMain.handle('widgets:arrangeMini', () => {
    arrangeMiniWidgets();
    return publicSettings();
  });

  ipcMain.handle('win:getBounds', (e) => {
    const win = senderWindow(e);
    return win && !win.isDestroyed() ? win.getBounds() : null;
  });

  ipcMain.handle('win:showPeek', async (_e, { page, iconBounds }) => {
    if (!page || !iconBounds) return null;
    try {
      const disp = screen.getDisplayMatching(iconBounds) || screen.getPrimaryDisplay();
      const area = disp.workArea;
      const peekW = 340;
      const peekH = 236;
      let px = iconBounds.x > area.x + area.width / 2 ? iconBounds.x - peekW - 12 : iconBounds.x + iconBounds.width + 12;
      if (px < area.x + 8) px = area.x + 8;
      if (px + peekW > area.x + area.width - 8) px = area.x + area.width - peekW - 8;

      let py = Math.round(iconBounds.y + (iconBounds.height - peekH) / 2);
      py = Math.max(area.y + 8, Math.min(area.y + area.height - peekH - 8, py));

      const pWin = getOrCreatePeekWindow();
      pWin.setBounds({ x: px, y: py, width: peekW, height: peekH });

      const wStyle = settings.get('widgetStyles', {})?.[page] || {};
      let currentTheme = settings.get('theme') || 'glass';
      if (wStyle.theme && wStyle.theme !== 'inherit') currentTheme = wStyle.theme;
      let currentAccent = settings.get('accent') || '#2563EB';
      if (wStyle.accent && wStyle.accent !== 'inherit') currentAccent = wStyle.accent;
      const currentFont = (wStyle.fontUi && wStyle.fontUi !== 'inherit') ? wStyle.fontUi : (settings.get('look')?.fontUi || 'inherit');
      const currentLang = settings.get('lang') || 'ar';
      const isRtl = currentLang !== 'en';

      let data = {};
      if (page === 'clock') {
        const now = new Date();
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'محلي';
        const hoursMins = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        const secs = String(now.getSeconds()).padStart(2, '0');
        const period = now.getHours() >= 12 ? 'مساءً' : 'صباحاً';
        const dateAr = now.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const dateGreg = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        data = {
          time: `${hoursMins}:${secs}`,
          hoursMins,
          secs,
          period,
          date: dateAr,
          dateGreg,
          tz: tz.split('/').pop().replace(/_/g, ' ') || tz,
          rawTz: tz,
          h: now.getHours(),
          m: now.getMinutes(),
          s: now.getSeconds(),
        };
      } else if (page === 'pomodoro') {
        const snap = pomodoro.snapshot();
        const totalSecs = Math.max(0, Math.round(snap.remaining / 1000));
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        const pct = snap.duration ? Math.min(100, Math.max(0, Math.round(((snap.duration - snap.remaining) / snap.duration) * 100))) : 0;
        const modeLabels = {
          work: 'جلسة تركيز',
          short: 'استراحة قصيرة',
          long: 'استراحة طويلة'
        };
        data = {
          mode: snap.mode || 'work',
          modeLabel: modeLabels[snap.mode] || 'جلسة تركيز',
          status: snap.status || 'idle',
          time: timeStr,
          pct,
          cycle: snap.cycle || 0,
          every: snap.every || 4,
          todaySessions: snap.today?.sessions || 0,
          label: pomodoro.config?.label || 'التركيز'
        };
      } else if (page === 'habits') {
        const today = new Date().toISOString().slice(0, 10);
        let pct = 0;
        let doneCount = 0;
        let totalCount = 0;
        let streak = 0;
        let activeHabits = [];
        if (habitsManager) {
          const active = habitsManager.getHabits(false) || [];
          totalCount = active.length;
          const log = habitsManager.getLog(today) || {};
          doneCount = active.filter(h => {
            const entry = log[h.id];
            return entry && (entry.status === 'done' || entry.status === 'skip' || (entry.value || 0) >= (h.target || 1));
          }).length;
          pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
          streak = habitsManager.getGamification?.()?.streak || 0;
          activeHabits = active.slice(0, 3).map(h => {
            const entry = log[h.id];
            const isDone = Boolean(entry && (entry.status === 'done' || entry.status === 'skip' || (entry.value || 0) >= (h.target || 1)));
            const val = entry?.value || 0;
            const target = h.target || 1;
            return {
              id: h.id,
              name: h.name || h.title || 'عادة يومية',
              done: isDone,
              icon: h.icon || '🌱',
              progressText: target > 1 ? `${val}/${target}` : ''
            };
          });
        }
        data = {
          pct,
          doneCount,
          totalCount,
          streak,
          items: activeHabits.length ? activeHabits : (habitsStore ? habitsStore.get('habits', []).slice(0, 3) : [])
        };
      } else if (page === 'todo') {
        const allTasks = todos.get('items', []) || [];
        const pending = allTasks.filter(t => !t.done);
        const done = allTasks.filter(t => t.done);
        const totalCount = allTasks.length;
        const pendingCount = pending.length;
        const doneCount = done.length;
        const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
        data = {
          tasks: [...pending, ...done].slice(0, 3).map(t => ({
            id: t.id,
            title: t.title || 'مهمة بدون عنوان',
            done: Boolean(t.done),
            priority: t.priority || 'normal',
            due: t.due || '',
            isClassroom: Boolean(t.source === 'classroom' || t.courseId)
          })),
          totalCount,
          pendingCount,
          doneCount,
          pct
        };
      } else if (page === 'calendar') {
        const allEvents = calendarEventsStore ? calendarEventsStore.get('events', []) || [] : [];
        const todayStr = new Date().toISOString().slice(0, 10);
        const todayEvents = allEvents.filter(ev => ev.date === todayStr);
        const displayEvents = todayEvents.length > 0 ? todayEvents : allEvents;
        const now = new Date();
        data = {
          events: displayEvents.slice(0, 2).map(ev => ({
            id: ev.id,
            title: ev.title || 'موعد مجدول',
            time: ev.time || '',
            category: ev.category || 'عام'
          })),
          todayCount: todayEvents.length,
          totalCount: allEvents.length,
          hijriDate: typeof hijriDateString === 'function' ? hijriDateString(now) : now.toLocaleDateString('ar-SA-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' }),
          weekday: now.toLocaleDateString('ar-SA', { weekday: 'long' }),
          monthName: now.toLocaleDateString('ar-SA', { month: 'long' }),
          dayNum: now.getDate(),
          yearNum: now.getFullYear()
        };
      } else if (page === 'notes') {
        const noteItems = notes.get('items', []) || [];
        const activeId = notes.get('activeId', null);
        const activeNote = noteItems.find(n => n.id === activeId) || noteItems[0];
        const content = activeNote?.content || '';
        const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
        data = {
          title: activeNote?.title || 'ملاحظة سريعة',
          snippet: content.slice(0, 140) || 'أفكار وتدوينات سريعة لتنظيم العمل والمهام اليومية...',
          count: noteItems.length,
          wordCount,
          updatedAt: activeNote?.updatedAt ? new Date(activeNote.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'اليوم'
        };
      } else if (page === 'email') {
        const emailCfg = settings.get('email', {}) || {};
        const items = emailEngine ? emailEngine.getItems() : [];
        const unreadCount = emailEngine ? emailEngine.getUnreadCount() : 0;
        data = {
          enabled: Boolean(emailCfg.enabled && emailCfg.accounts && emailCfg.accounts.length),
          accountCount: emailCfg.accounts ? emailCfg.accounts.length : 0,
          accountEmail: emailCfg.accounts?.[0]?.user || emailCfg.accounts?.[0]?.email || '',
          unread: unreadCount,
          total: items.length,
          recent: items.slice(0, 2).map(m => ({
            from: m.from || m.sender || 'مرسل',
            subject: m.subject || 'بدون موضوع',
            snippet: m.snippet || m.bodyText?.slice(0, 60) || '',
            date: m.date || 'اليوم',
            unread: !m.read
          }))
        };
      } else if (page === 'photo') {
        const pConf = settings.get('photo', {}) || {};
        data = {
          path: pConf.path || '',
          caption: pConf.caption || 'صورة المكتب المختارة',
          fit: pConf.fit || 'cover',
          hasPhoto: Boolean(pConf.path || pConf.folder)
        };
      } else if (page === 'quran') {
        try {
          const q = await quran.current(settings.data);
          data = {
            text: q?.verse?.text || q?.ayah?.text || 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا • إِنَّ مَعَ الْعُسْرِ يُسْرًا',
            surah: q?.surah?.name || q?.verse?.surahName || 'سورة الشرح',
            ayahNum: q?.verse?.numberInSurah || q?.ayah?.number || '5-6',
            tafsir: q?.verse?.tafsir || 'الفرج يعقب الشدة واليسر يعقب العسر'
          };
        } catch (err) {
          data = {
            text: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا • إِنَّ مَعَ الْعُسْرِ يُسْرًا',
            surah: 'سورة الشرح',
            ayahNum: '5-6',
            tafsir: 'الفرج يعقب الشدة واليسر يعقب العسر'
          };
        }
      } else if (page === 'folder' || page.startsWith('folder_')) {
        const folders = typeof getFolders === 'function' ? getFolders() : {};
        const fid = page.startsWith('folder_') ? page : (Object.keys(folders)[0] || 'folder_1');
        const f = folders[fid] || { title: 'مجلد ذكي', widgetIds: [] };
        const widgetNames = {
          clock: 'الساعة',
          pomodoro: 'بومودورو',
          calendar: 'التقويم',
          habits: 'العادات',
          todo: 'المهام',
          notes: 'الملاحظات',
          email: 'البريد',
          quran: 'القرآن',
          photo: 'الصور'
        };
        const widgetIcons = {
          clock: '⏰',
          pomodoro: '🍅',
          calendar: '📅',
          habits: '🔥',
          todo: '📋',
          notes: '📝',
          email: '✉️',
          quran: '📖',
          photo: '🖼️'
        };
        data = {
          id: fid,
          title: f.title || 'مجلد ذكي',
          widgets: (f.widgetIds || []).map(id => ({
            id,
            name: widgetNames[id] || id,
            icon: widgetIcons[id] || '✨'
          })),
          count: (f.widgetIds || []).length
        };
      }

      const payload = {
        page,
        data,
        theme: currentTheme,
        accent: currentAccent,
        fontUi: currentFont,
        isRtl,
      };
      lastPeekPayload = payload;

      const deliverPayloadAndShow = () => {
        if (!pWin.isDestroyed()) {
          pWin.webContents.send('peek:load', payload);
          pWin.showInactive();
        }
      };

      if (pWin.webContents.isLoading()) {
        pWin.webContents.once('did-finish-load', deliverPayloadAndShow);
      } else {
        deliverPayloadAndShow();
      }
      return true;
    } catch (err) {
      debugLog(`win:showPeek error: ${err.message}`);
      return false;
    }
  });

  ipcMain.handle('win:hidePeek', () => {
    if (peekWin && !peekWin.isDestroyed()) {
      peekWin.hide();
    }
    return true;
  });

  ipcMain.handle('peek:getPayload', () => lastPeekPayload);

  ipcMain.handle('win:restoreFromPeek', (_e, page) => {
    if (peekWin && !peekWin.isDestroyed()) {
      peekWin.hide();
    }
    if (page && windows.has(page)) {
      toggleWidgetMini(windows.get(page));
    }
    return true;
  });

  /* ---- Multi-Widget Selection, Marquee & Group Handlers ---- */
  ipcMain.handle('selection:toggle', (_e, id) => {
    return toggleWidgetSelection(id);
  });

  ipcMain.handle('selection:set', (_e, { id, multi }) => {
    if (!multi) selectedWidgets.clear();
    if (id) selectedWidgets.add(id);
    broadcastSelection();
    updateGroupToolbarPosition();
    return Array.from(selectedWidgets);
  });

  ipcMain.handle('selection:allMini', () => {
    return selectAllMiniWidgets();
  });

  ipcMain.handle('selection:clear', () => {
    return clearWidgetSelection();
  });

  ipcMain.handle('marquee:start', (_e, startPt) => {
    startMarqueeMode(startPt);
    return true;
  });

  ipcMain.on('marquee:update', (_e, box) => {
    for (const [id, w] of windows) {
      if (!w || w.isDestroyed() || !w.isVisible()) continue;
      const b = w.getBounds();
      const isIcon = (b.width <= 90 && b.height <= 90) || widgetSetting(id)?.isMini;
      if (!isIcon) continue;
      const overlaps = geo.intersects(b, box);
      w.webContents.send('selection:preview', { id, active: overlaps });
    }
  });

  ipcMain.on('marquee:end', (_e, box) => {
    if (marqueeWin && !marqueeWin.isDestroyed()) {
      marqueeWin.hide();
    }
    const found = [];
    for (const [id, w] of windows) {
      if (!w || w.isDestroyed() || !w.isVisible()) continue;
      const b = w.getBounds();
      const isIcon = (b.width <= 90 && b.height <= 90) || widgetSetting(id)?.isMini;
      if (!isIcon) continue;
      if (geo.intersects(b, box)) {
        found.push(id);
      }
    }
    if (found.length > 0) {
      selectedWidgets.clear();
      for (const id of found) selectedWidgets.add(id);
      broadcastSelection();
      updateGroupToolbarPosition();
    }
  });

  ipcMain.on('marquee:cancel', () => {
    if (marqueeWin && !marqueeWin.isDestroyed()) {
      marqueeWin.hide();
    }
  });

  ipcMain.handle('group:arrangeGrid', () => {
    arrangeSelectedGrid();
    return true;
  });

  ipcMain.handle('group:restoreAll', () => {
    restoreSelectedWidgets();
    return true;
  });

  ipcMain.handle('group:hideAll', () => {
    for (const id of Array.from(selectedWidgets)) {
      setWidgetVisible(id, false);
    }
    clearWidgetSelection();
    broadcast('settings:changed', publicSettings());
    return true;
  });

  ipcMain.handle('widgets:lock', (_e, { id, locked }) => {
    if (!WIDGETS[id]) return null;
    patchWidget(id, { locked: Boolean(locked) });
    broadcast('settings:changed', publicSettings());
    return publicSettings();
  });

  ipcMain.handle('widgets:bounds', (_e, { id, width, height }) => {
    const spec = WIDGETS[id];
    const win = windows.get(id);
    if (!spec || !win || win.isDestroyed()) return null;
    const b = win.getBounds();
    const area = areaFor(b);
    const size = geo.clampSize(Number(width) || b.width, Number(height) || b.height, area, spec.min, spec.max);
    const next = geo.clampToArea({ x: b.x + b.width - size.width, y: b.y, ...size }, area);
    win.setBounds(next);
    patchWidget(id, { bounds: next, size: currentSizeKey(id) || widgetSetting(id).size });
    broadcast('settings:changed', publicSettings());
    return next;
  });

  ipcMain.handle('widgets:catalog', () => Object.fromEntries(Object.entries(WIDGETS).filter(([id]) => id !== 'folder').map(([id, w]) => [
    id, {
      title: titleOf(id), sizes: Object.keys(w.sizes), min: w.min,
      bounds: windows.get(id) && !windows.get(id).isDestroyed() ? windows.get(id).getBounds() : widgetSetting(id)?.bounds,
    },
  ])));

  ipcMain.handle('layout:reset', () => { resetLayout(); return true; });

  /* ---- dynamic multi-folder handlers ---- */
  ipcMain.handle('folder:get', (e, reqId) => {
    const win = senderWindow(e);
    const fid = reqId || win?._folderId || Object.keys(getFolders())[0] || 'folder_1';
    const f = getFolder(fid);
    if (!f) return { id: fid, title: 'أدوات مساعدة', widgetIds: [], quickSlots: [] };
    const validWidgetIds = (f.widgetIds || []).filter(wid => {
      const s = widgetSetting(wid);
      return WIDGETS[wid] && (!s || s.visible !== false);
    });
    return { ...f, widgetIds: validWidgetIds, quickSlots: (f.quickSlots || []).filter(wid => validWidgetIds.includes(wid)) };
  });

  ipcMain.handle('folder:set', (e, data) => {
    const win = senderWindow(e);
    const fid = data?.id || win?._folderId || Object.keys(getFolders())[0] || 'folder_1';
    const folders = getFolders();
    const cur = folders[fid] || { id: fid, title: 'أدوات مساعدة', widgetIds: [], quickSlots: [] };
    const updated = { ...cur, ...(data || {}) };
    folders[fid] = updated;
    saveFolders(folders);
    broadcast('folder:changed', updated);
    syncFolderWithDesktop();
    return updated;
  });

  function detachWidgetFromFolder(id, folderId, screenX, screenY, win) {
    if (!id || !WIDGETS[id]) return false;
    const folders = getFolders();

    // 1. Thoroughly remove id from ALL folders to avoid lingering references or multi-folder collisions
    for (const folder of Object.values(folders)) {
      if (folder && Array.isArray(folder.widgetIds)) {
        folder.widgetIds = folder.widgetIds.filter(w => w !== id);
        folder.quickSlots = (folder.quickSlots || []).filter(w => w !== id);
        if (!folder.quickSlots.length && folder.widgetIds.length) {
          folder.quickSlots = folder.widgetIds.slice(0, 3);
        }
      }
    }

    // Also clean from legacy single folder setting if present
    const oldF = settings.get('folder');
    if (oldF && Array.isArray(oldF.widgetIds)) {
      oldF.widgetIds = oldF.widgetIds.filter(w => w !== id);
      settings.set('folder', oldF);
    }

    // 2. Position the detached widget on desktop as a clean, responsive desktop icon at cursor drop:
    const targetPt = { x: Math.round(screenX || 200), y: Math.round(screenY || 200) };
    const area = screen.getDisplayNearestPoint(targetPt).workArea;
    const curSetting = widgetSetting(id) || {};
    const spec = WIDGETS[id];

    const rawBounds = {
      x: Math.round(targetPt.x - 28),
      y: Math.round(targetPt.y - 28),
      width: 56,
      height: 56,
    };
    const snapEnabled = settings.get('snapToDesktopGrid') !== false;
    let targetBounds;
    if (snapEnabled) {
      const grid = geo.getDesktopGridMetrics();
      const otherMinis = otherWidgetBounds(null).filter(o => o.width <= 90 && o.height <= 90);
      targetBounds = geo.snapToDesktopGrid(rawBounds, area, otherMinis, { ...grid, avoidCollisions: true });
    } else {
      targetBounds = geo.clampToArea(rawBounds, area);
    }

    patchWidget(id, {
      inFolder: null,
      visible: true,
      isMini: true,
      size: 'icon',
      bounds: targetBounds,
      iconBounds: targetBounds,
      prevNormalBounds: curSetting.prevNormalBounds || (curSetting.bounds && curSetting.bounds.width > 90 ? curSetting.bounds : null),
      prevNormalKey: curSetting.prevNormalKey || (curSetting.size && curSetting.size !== 'icon' ? curSetting.size : 'm'),
    });

    saveFolders(folders);

    // If an existing window was kept in windows, ensure its limits and bounds are fully updated before showing
    createWidget(id, { immediateShow: true, bounds: targetBounds });
    const detachedWin = windows.get(id);
    if (detachedWin && !detachedWin.isDestroyed()) {
      detachedWin.setResizable(true);
      detachedWin.setMinimumSize(44, 44);
      detachedWin.setMaximumSize(64, 64);
      detachedWin.setResizable(false);
      detachedWin.setBounds(targetBounds);
      detachedWin.show();
      detachedWin.focus();
      if (settings.get('alwaysOnTop')) detachedWin.setAlwaysOnTop(true);
      try { detachedWin.webContents.send('settings:changed', publicSettings()); } catch { }
    }

    // 3. Check remaining count in folders for dissolution:
    for (const [fid, f] of Object.entries(folders)) {
      if (!f || !Array.isArray(f.widgetIds)) continue;
      if (f.widgetIds.length < 2) {
        if (f.widgetIds.length === 1) {
          // Less than 2 widgets: folder dissolves and releases the last widget!
          const lastWid = f.widgetIds[0];
          delete folders[fid];
          destroyWidget(fid);

          const lastSetting = widgetSetting(lastWid) || {};
          const lastWasMini = Boolean(lastSetting.isMini || lastSetting.size === 'icon' || (lastSetting.bounds && lastSetting.bounds.width <= 90));
          const lastSpec = WIDGETS[lastWid];
          let lastTargetSize = lastSetting.size || (lastSpec && lastSpec.size) || 's';
          let lastTargetBounds;

          if (lastWasMini) {
            lastTargetBounds = { x: f.bounds.x, y: f.bounds.y, width: 64, height: 64 };
            lastTargetSize = 'icon';
          } else {
            const dims = (lastSpec && lastSpec.sizes && lastSpec.sizes[lastTargetSize]) || [280, 220];
            const lw = (lastSetting.bounds && lastSetting.bounds.width > 90) ? lastSetting.bounds.width : dims[0];
            const lh = (lastSetting.bounds && lastSetting.bounds.height > 90) ? lastSetting.bounds.height : dims[1];
            lastTargetBounds = { x: f.bounds.x, y: f.bounds.y, width: lw, height: lh };
          }

          patchWidget(lastWid, {
            inFolder: null,
            visible: true,
            isMini: lastWasMini,
            size: lastTargetSize,
            bounds: lastTargetBounds,
            iconBounds: lastWasMini ? lastTargetBounds : lastSetting.iconBounds,
          });
          createWidget(lastWid, { immediateShow: true, bounds: lastTargetBounds });
          const relWin = windows.get(lastWid);
          if (relWin && !relWin.isDestroyed()) {
            relWin.setResizable(true);
            relWin.setMinimumSize(lastWasMini ? 44 : lastSpec.min[0], lastWasMini ? 44 : lastSpec.min[1]);
            relWin.setMaximumSize(lastWasMini ? 64 : lastSpec.max[0], lastWasMini ? 64 : lastSpec.max[1]);
            relWin.setResizable(!lastWasMini);
            relWin.setBounds(lastTargetBounds);
            relWin.show();
            relWin.focus();
            if (settings.get('alwaysOnTop')) relWin.setAlwaysOnTop(true);
          }
        } else {
          delete folders[fid];
          destroyWidget(fid);
        }
      } else {
        const fWin = windows.get(fid);
        if (fWin && !fWin.isDestroyed()) {
          fWin.webContents.send('folder:changed', f);
        }
      }
    }

    saveFolders(folders);
    broadcast('settings:changed', publicSettings());
    return true;
  }

  ipcMain.on('folder:drag-out-start', (e, { id, screenX, screenY }) => {
    const ghost = getOrCreateDragGhostWindow();
    ghost.setBounds({
      x: Math.round((screenX || 200) - 28),
      y: Math.round((screenY || 200) - 28),
      width: 56,
      height: 56,
    });
    ghost.webContents.send('folder:drag-ghost-set', { wid: id });
    ghost.showInactive();
  });

  ipcMain.on('folder:drag-out-move', (e, { screenX, screenY }) => {
    if (dragGhostWin && !dragGhostWin.isDestroyed() && dragGhostWin.isVisible()) {
      dragGhostWin.setBounds({
        x: Math.round((screenX || 200) - 28),
        y: Math.round((screenY || 200) - 28),
        width: 56,
        height: 56,
      });
    }
  });

  ipcMain.on('folder:drag-out-cancel', () => {
    if (dragGhostWin && !dragGhostWin.isDestroyed()) {
      dragGhostWin.hide();
    }
  });

  ipcMain.handle('folder:drag-out-end', (e, { id, folderId, screenX, screenY, isOutside }) => {
    if (dragGhostWin && !dragGhostWin.isDestroyed()) {
      dragGhostWin.hide();
    }
    if (isOutside && id && WIDGETS[id]) {
      return detachWidgetFromFolder(id, folderId, screenX, screenY, senderWindow(e));
    }
    return false;
  });

  ipcMain.handle('folder:detach-widget', (e, { id, folderId, screenX, screenY }) => {
    return detachWidgetFromFolder(id, folderId, screenX, screenY, senderWindow(e));
  });

  ipcMain.handle('folder:expand', (e) => {
    const win = senderWindow(e);
    if (!win || win.isDestroyed()) return null;
    const curBounds = win.getBounds();
    win._compactFolderBounds = curBounds;
    win._isFolderExpanded = true;
    const area = areaFor(curBounds);
    const targetW = Math.max(370, Math.min(620, Math.round(curBounds.width * 1.3)));
    const targetH = Math.max(410, Math.min(660, Math.round(curBounds.height * 1.3)));
    let targetX = Math.round(curBounds.x + (curBounds.width - targetW) / 2);
    let targetY = Math.round(curBounds.y + (curBounds.height - targetH) / 2);
    targetX = Math.max(area.x + 8, Math.min(area.x + area.width - targetW - 8, targetX));
    targetY = Math.max(area.y + 8, Math.min(area.y + area.height - targetH - 8, targetY));
    const next = { x: targetX, y: targetY, width: targetW, height: targetH };
    win.setBounds(next);
    return next;
  });

  ipcMain.handle('folder:collapse', (e) => {
    const win = senderWindow(e);
    if (!win || win.isDestroyed()) return null;
    win._isFolderExpanded = false;
    const fid = win._folderId || widgetIdOf(win);
    const f = fid ? getFolder(fid) : null;
    const compactBounds = win._compactFolderBounds || f?.bounds || {
      x: win.getBounds().x + Math.round((win.getBounds().width - 144) / 2),
      y: win.getBounds().y + Math.round((win.getBounds().height - 144) / 2),
      width: 144,
      height: 144,
    };
    const next = applyDesktopCollisionDisplacement(fid, compactBounds, win);
    if (fid) {
      const folders = getFolders();
      if (folders[fid]) {
        folders[fid].bounds = { ...next };
        saveFolders(folders);
      }
    }
    return next;
  });

  function findNonOverlappingPlacement(folderBounds, widgetSize, area) {
    const w = widgetSize.width;
    const h = widgetSize.height;
    const gap = 16;
    const margin = 14;

    if (!folderBounds) {
      return geo.clampToArea({
        x: area.x + Math.round((area.width - w) / 2),
        y: area.y + Math.round((area.height - h) / 2),
        width: w,
        height: h,
      }, area);
    }

    // 1. Placement to the LEFT of the folder (natural for Arabic RTL)
    const candLeft = {
      x: folderBounds.x - w - gap,
      y: Math.max(area.y + margin, Math.min(area.y + area.height - h - margin, folderBounds.y)),
      width: w,
      height: h,
    };
    if (candLeft.x >= area.x + margin) {
      return candLeft;
    }

    // 2. Placement to the RIGHT of the folder
    const candRight = {
      x: folderBounds.x + folderBounds.width + gap,
      y: Math.max(area.y + margin, Math.min(area.y + area.height - h - margin, folderBounds.y)),
      width: w,
      height: h,
    };
    if (candRight.x + w <= area.x + area.width - margin) {
      return candRight;
    }

    // 3. Placement BELOW the folder
    const candBelow = {
      x: Math.max(area.x + margin, Math.min(area.x + area.width - w - margin, folderBounds.x)),
      y: folderBounds.y + folderBounds.height + gap,
      width: w,
      height: h,
    };
    if (candBelow.y + h <= area.y + area.height - margin) {
      return candBelow;
    }

    // 4. Placement ABOVE the folder
    const candAbove = {
      x: Math.max(area.x + margin, Math.min(area.x + area.width - w - margin, folderBounds.x)),
      y: folderBounds.y - h - gap,
      width: w,
      height: h,
    };
    if (candAbove.y >= area.y + margin) {
      return candAbove;
    }

    // Tight screen: choose side with more room and clamp
    const spaceLeft = folderBounds.x - area.x;
    const spaceRight = (area.x + area.width) - (folderBounds.x + folderBounds.width);
    return geo.clampToArea(spaceLeft >= spaceRight ? candLeft : candRight, area);
  }

  ipcMain.handle('folder:activate-widget', (_e, payload) => {
    const wid = typeof payload === 'object' && payload ? (payload.widgetId || payload.id) : payload;
    if (!wid || !WIDGETS[wid]) return false;

    const senderWin = senderWindow(_e);
    const folderId = payload?.folderId || senderWin?._folderId;
    const folderWin = senderWin || (folderId ? windows.get(folderId) : null);
    const folderBounds = folderWin && !folderWin.isDestroyed() ? folderWin.getBounds() : null;

    const existingWin = windows.get(wid);
    const curSetting = widgetSetting(wid) || {};
    const isOpenAndVisible = existingWin && !existingWin.isDestroyed() && existingWin.isVisible() && Boolean(curSetting.visible) && !curSetting.isMini && curSetting.size !== 'icon';

    if (isOpenAndVisible) {
      // Toggle CLOSE: close the widget back into the folder cleanly
      const b = existingWin.getBounds();
      const normalKey = currentSizeKey(wid) || curSetting.size || 'm';
      patchWidget(wid, {
        prevNormalBounds: b,
        prevNormalKey: normalKey,
        isMini: true,
        size: 'icon',
        inFolder: folderId,
      });
      destroyWidget(wid);
      settings.flush();
      broadcast('settings:changed', publicSettings());
      if (folderWin && !folderWin.isDestroyed()) {
        folderWin.webContents.send('folder:absorb', { folderId, id: wid });
      }
      return { action: 'closed', widgetId: wid };
    }

    const disp = folderBounds
      ? screen.getDisplayNearestPoint({ x: folderBounds.x + folderBounds.width / 2, y: folderBounds.y + folderBounds.height / 2 })
      : screen.getPrimaryDisplay();
    const area = disp.workArea;

    const spec = WIDGETS[wid];
    let targetSize = curSetting.prevNormalKey || (spec.sizes.m ? 'm' : (spec.sizes.s ? 's' : spec.size));
    if (targetSize === 'icon') targetSize = spec.sizes.m ? 'm' : (spec.sizes.s ? 's' : spec.size);
    const sizeDims = (spec.sizes && spec.sizes[targetSize]) || spec.sizes.s || spec.sizes.m || [280, 220];
    const w = Math.round((curSetting.prevNormalBounds && curSetting.prevNormalBounds.width > 90) ? curSetting.prevNormalBounds.width : sizeDims[0]);
    const h = Math.round((curSetting.prevNormalBounds && curSetting.prevNormalBounds.height > 90) ? curSetting.prevNormalBounds.height : sizeDims[1]);

    // 1. Determine widget target position (prefer saved prevNormalBounds if it was placed before, or center over folder)
    let targetBounds;
    if (curSetting.prevNormalBounds && typeof curSetting.prevNormalBounds.x === 'number' && curSetting.prevNormalBounds.width > 90) {
      targetBounds = geo.clampToArea({ ...curSetting.prevNormalBounds, width: w, height: h }, area);
    } else {
      const fx = folderBounds ? Math.round(folderBounds.x + (folderBounds.width - w) / 2) : Math.round(area.x + (area.width - w) / 2);
      const fy = folderBounds ? Math.round(folderBounds.y + (folderBounds.height - h) / 2) : Math.round(area.y + (area.height - h) / 2);
      targetBounds = geo.clampToArea({ x: fx, y: fy, width: w, height: h }, area);
    }

    // 2. Apply desktop collision displacement (displaces mini icons if needed; open widgets & folders freely overlap)
    targetBounds = applyDesktopCollisionDisplacement(wid, targetBounds, existingWin);

    // Set widget to OPEN, FULL, and FUNCTIONAL state (NOT an icon!)
    patchWidget(wid, {
      visible: true,
      isMini: false,
      size: targetSize,
      bounds: targetBounds,
      prevNormalBounds: targetBounds,
      prevNormalKey: targetSize,
      inFolder: folderId,
    });

    let win = windows.get(wid);
    if (win && !win.isDestroyed()) {
      win.setMinimumSize(spec.min[0], spec.min[1]);
      win.setMaximumSize(spec.max[0], spec.max[1]);
      win.setResizable(true);
      win.setBounds(targetBounds);
      win.show();
      win.focus();
      try { win.moveTop(); } catch (_) { }
    } else {
      win = createWidget(wid, { immediateShow: true, bounds: targetBounds });
      if (win && !win.isDestroyed()) {
        win.setBounds(targetBounds);
        win.show();
        win.focus();
        try { win.moveTop(); } catch (_) { }
      }
    }

    broadcast('settings:changed', publicSettings());
    return { action: 'opened', widgetId: wid };
  });

  ipcMain.handle('folder:widget-status', () => {
    const status = {};
    const todoList = todos ? todos.get('items', []) : [];
    const pendingTodos = Array.isArray(todoList) ? todoList.filter(t => !t.done).length : 0;
    let habitsStreak = 0;
    try { habitsStreak = habitsManager?.getGamification?.()?.streak || 0; } catch (_) { }

    for (const id of Object.keys(WIDGETS)) {
      if (id.startsWith('folder') || id === 'folder') continue;
      const s = widgetSetting(id) || {};
      const win = windows.get(id);
      const isWin = win && !win.isDestroyed();
      const isVisible = Boolean(s.visible && isWin && (!win.isVisible || win.isVisible()));
      const isMini = Boolean(s.isMini || s.size === 'icon' || (isWin && win.getBounds().width <= 90));
      status[id] = {
        visible: isVisible,
        isRunning: isVisible,
        enabled: s.visible !== false,
        isMini,
        inFolder: s.inFolder || null,
        pendingTodos: id === 'todo' ? pendingTodos : undefined,
        streak: id === 'habits' ? habitsStreak : undefined,
      };
    }
    return status;
  });

  /* ---- todos ---- */
  ipcMain.handle('todos:get', () => {
    syncHabitsToTodos();
    return todos.get('items', []);
  });
  ipcMain.handle('todos:set', (_e, items) => {
    const list = Array.isArray(items) ? items : [];
    const oldItems = todos.get('items', []);
    const oldMap = new Map(oldItems.map((t) => [t.id, t.done]));
    const today = new Date().toISOString().slice(0, 10);
    for (const item of list) {
      if (item && item.habitId && oldMap.has(item.id) && oldMap.get(item.id) !== item.done) {
        const h = habitsManager.getHabit(item.habitId);
        const fullVal = h ? (Number(h.targetValue) || (h.type === 'percentage' ? 100 : 1)) : 1;
        habitsManager.saveHabitStatus(today, item.habitId, item.done ? 'done' : 'none', item.done ? fullVal : 0);
      }
    }
    // Track deleted classroom tasks so background sync never resurrects them
    for (const old of oldItems) {
      if ((old.id.startsWith('cr_') || old.classroom) && !list.some((t) => t.id === old.id)) {
        classroomEngine.markTaskDismissed(old.id, old.classroom?.courseWorkId);
      }
    }
    todos.set('items', list);
    broadcast('todos:changed', todos.get('items', []));
    reminders.schedule();
    superUrgentMonitor.evaluate();
    return todos.get('items', []);
  });
  ipcMain.handle('todos:one', (_e, id) => todos.get('items', []).find((t) => t.id === id) || null);
  ipcMain.handle('todos:patch', async (_e, { id, patch }) => {
    const items = todos.get('items', []);
    const task = items.find((t) => t.id === id);
    if (!task) return null;

    // Check completion guard if user tries to mark task as done and preventDone is enabled
    const crCfg = settings.get('classroom', {});
    const preventDone = crCfg.preventDoneIfNotTurnedIn !== false;
    if (preventDone && patch && patch.done === true && !task.done && task.classroom && !patch.doneManually && !patch.force) {
      const guard = classroomEngine.canMarkDone(task);
      if (!guard.allowed) {
        return {
          rejected: true,
          reason: guard.reason,
          alternateLink: guard.alternateLink,
          state: guard.state,
          item: task,
        };
      }
    }

    const clean = cleanTaskPatch(patch);
    if ('done' in clean && clean.done !== task.done) {
      task.doneAt = clean.done ? Date.now() : null;
      if (task.habitId) {
        const today = new Date().toISOString().slice(0, 10);
        const h = habitsManager.getHabit(task.habitId);
        const fullVal = h ? (Number(h.targetValue) || (h.type === 'percentage' ? 100 : 1)) : 1;
        habitsManager.saveHabitStatus(today, task.habitId, clean.done ? 'done' : 'none', clean.done ? fullVal : 0);
      }
    }
    Object.assign(task, clean);
    todos.set('items', items);
    broadcast('todos:changed', items);
    reminders.schedule();
    superUrgentMonitor.evaluate();
    reliableDispatcher.planTaskAlerts(task);
    reliableDispatcher.catchup({
      todos: items,
      calendarEvents: calendarEventsStore.get('events', []),
    });
    return task;
  });
  ipcMain.handle('todos:remove', (_e, id) => {
    const oldItems = todos.get('items', []);
    const removedTask = oldItems.find((t) => t.id === id);
    const items = oldItems.filter((t) => t.id !== id);

    // If it was a Classroom task, mark it in dismissedTaskIds so sync never resurrects it!
    if (id && (String(id).startsWith('cr_') || removedTask?.classroom)) {
      classroomEngine.markTaskDismissed(id, removedTask?.classroom?.courseWorkId);
    }

    todos.set('items', items);
    broadcast('todos:changed', items);
    reminders.schedule();
    superUrgentMonitor.evaluate();
    reliableDispatcher.catchup({
      todos: items,
      calendarEvents: calendarEventsStore.get('events', []),
    });
    return true;
  });
  ipcMain.on('win:task', (_e, id) => openTask(id));

  /* ---- classroom ---- */
  ipcMain.handle('classroom:auth-url', (_e, clientId) => classroomEngine.getAuthUrl(clientId));
  ipcMain.handle('classroom:start-auth', async (_e, opts) => {
    const clientId = opts?.clientId || settings.get('classroom', {}).clientId;
    const clientSecret = opts?.clientSecret || settings.get('classroom', {}).clientSecret;
    const authUrl = classroomEngine.getAuthUrl(clientId);
    openExternalUrl(authUrl);
    const { code } = await classroomEngine.startOAuthListener();
    const tokens = await classroomEngine.exchangeCode(code, clientId, clientSecret);
    return { ok: true, tokens };
  });
  ipcMain.handle('classroom:sync', async () => {
    try {
      const res = await classroomEngine.sync(todos.get('items', []));
      if (res.items) {
        todos.set('items', res.items);
        broadcast('todos:changed', res.items);
        reminders.schedule();
        superUrgentMonitor.evaluate();
      }
      broadcast('classroom:sync-done', res);
      return res;
    } catch (err) {
      const errPayload = { ok: false, error: err.message, authError: true };
      broadcast('classroom:sync-done', errPayload);
      broadcast('classroom:error', errPayload);
      return errPayload;
    }
  });
  ipcMain.handle('classroom:can-done', (_e, task) => classroomEngine.canMarkDone(task));
  ipcMain.handle('classroom:courses', async () => classroomEngine.getCoursesList());

  /* ---- super urgent & whatsapp ---- */
  ipcMain.handle('todos:getUrgentState', () => ({
    urgentList: superUrgentMonitor.checkUrgentTasks(),
  }));
  ipcMain.handle('whatsapp:test', async (_e, cfg) => {
    return whatsappDispatcher.sendTest(cfg || settings.get('whatsapp'));
  });
  ipcMain.handle('openwa:status', async () => checkOpenWaOnline());
  ipcMain.handle('openwa:qr', async () => getOpenWaQr());
  ipcMain.handle('openwa:start', async () => startOpenWaServer());
  ipcMain.handle('openwa:stop', async () => stopOpenWaServer());
  ipcMain.handle('openwa:groups', async () => {
    return new Promise((resolve) => {
      const req = http.get('http://127.0.0.1:2785/api/groups', { timeout: 4000 }, (res) => {
        let b = '';
        res.on('data', c => { b += c; });
        res.on('end', () => {
          try {
            resolve(JSON.parse(b));
          } catch (err) {
            resolve({ ok: false, error: err.message, groups: [] });
          }
        });
      });
      req.on('error', (err) => resolve({ ok: false, error: err.message, groups: [] }));
      req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: 'انتهت مهلة جلب المجموعات', groups: [] }); });
    });
  });

  /* ---- calendar events & whatsapp ---- */
  ipcMain.handle('calendar:get-events', () => calendarEventsManager.all());
  ipcMain.handle('calendar:save-event', (_e, ev) => {
    const res = calendarEventsManager.addOrUpdate(ev);
    if (res && res.habitId && ('completed' in res)) {
      const dateStr = res.date || new Date().toISOString().slice(0, 10);
      const h = habitsManager.getHabit(res.habitId);
      const fullVal = h ? (Number(h.targetValue) || (h.type === 'percentage' ? 100 : 1)) : 1;
      habitsManager.saveHabitStatus(dateStr, res.habitId, res.completed ? 'done' : 'none', res.completed ? fullVal : 0);
    }
    reliableDispatcher.planCalendarEventAlerts(res);
    reliableDispatcher.catchup({
      todos: todos.get('items', []),
      calendarEvents: calendarEventsStore.get('events', []),
    });
    return res;
  });
  ipcMain.handle('calendar:remove-event', (_e, id) => calendarEventsManager.remove(id));
  ipcMain.handle('calendar:get-day-notes', () => calendarEventsManager.dayNotes());
  ipcMain.handle('calendar:get-day-note', (_e, dateStr) => calendarEventsManager.getDayNote(dateStr));
  ipcMain.handle('calendar:save-day-note', (_e, { dateStr, text } = {}) => {
    const res = calendarEventsManager.saveDayNote(dateStr, text);
    return res;
  });
  ipcMain.handle('calendar:remove-day-note', (_e, dateStr) => calendarEventsManager.removeDayNote(dateStr));
  ipcMain.handle('calendar:test-whatsapp', (_e, payload) => {
    const ev = payload && payload.event ? payload.event : payload;
    const recipient = payload && payload.overrideRecipient ? payload.overrideRecipient : '';
    return CalendarEventsManager.sendEventWhatsApp(ev, settings.data, recipient);
  });

  /* ---- reliable dispatch journal & catch-up ---- */
  ipcMain.handle('dispatch:get-journal', () => dispatchQueueStore.data);
  ipcMain.handle('dispatch:force-catchup', async () => {
    await reliableDispatcher.catchup({
      todos: todos.get('items', []),
      calendarEvents: calendarEventsStore.get('events', []),
    });
    return dispatchQueueStore.data;
  });

  /* ---- notes ---- */
  ipcMain.handle('notes:get', () => {
    const rawItems = notes.get('items', []) || [];
    let migrated = false;
    const items = rawItems.map((n) => {
      if (n && (n.pageStyle === 'kraft' || n.pageStyle === 'classic' || n.style === 'kraft' || n.style === 'classic')) {
        migrated = true;
        return { ...n, pageStyle: 'ruled', style: 'ruled' };
      }
      return n;
    });
    if (migrated) {
      notes.set('items', items);
    }
    return { items, activeId: notes.get('activeId', null) };
  });
  ipcMain.handle('notes:set', (_e, payload) => {
    const newItems = Array.isArray(payload.items) ? payload.items : [];
    // Safety auto-backup: keep rolling backup on disk whenever substantive notes are saved
    try {
      if (newItems.some((n) => (n.body && n.body.length > 10) || (n.checklist && n.checklist.length > 0))) {
        fs.writeFileSync(paths.notes + '.backup.json', JSON.stringify({ items: newItems, activeId: payload.activeId }, null, 2), 'utf8');
      }
    } catch { }
    notes.merge({
      items: newItems,
      activeId: payload.activeId ?? null,
    });
    broadcast('notes:changed', { items: notes.get('items', []), activeId: notes.get('activeId', null) });
    return { items: notes.get('items', []), activeId: notes.get('activeId', null) };
  });

  /* ---- quran ---- */
  ipcMain.handle('quran:current', async (_e, opts = {}) => {
    const payload = await quran.current(settings.data, { force: Boolean(opts.force) });
    if (opts.force) broadcast('quran:update', payload);
    scheduleQuran(payload);
    return payload;
  });
  ipcMain.handle('quran:detail', (_e, key) => quran.detail(key, settings.data));
  ipcMain.handle('quran:detailWith', (_e, { key, tafsir, showTranslation, translation }) =>
    quran.detail(key, { ...settings.data, tafsir, showTranslation, translation }));
  ipcMain.handle('quran:history', () => quran.historyView(30));
  ipcMain.handle('quran:stats', () => quran.stats());
  ipcMain.handle('quran:sources', () => ({
    text: SOURCES.TEXT_PRIMARY,
    verifier: SOURCES.TEXT_VERIFIER,
    editions: SOURCES.TAFSIR_EDITIONS.map(({ id, cloudId, ...rest }) => rest),
    translations: SOURCES.TRANSLATIONS,
  }));
  ipcMain.handle('quran:prefetch', () => quran.prefetch(settings.data, { count: 12 }));

  /* ---- reflection widget: Quran or hadith ---- */
  ipcMain.handle('inspire:current', async (_e, opts = {}) => {
    const result = await currentInspiration(Boolean(opts.force));
    if (opts.force) broadcast('inspire:update', result);
    scheduleQuran(result.payload);
    return result;
  });
  ipcMain.handle('hadith:detail', (_e, id) => hadith.detail(id, { language: settings.get('language') }));
  ipcMain.handle('hadith:prefetch', () => hadith.prefetch(settings.data, { count: 24 }));
  ipcMain.on('win:hadith', (_e, id) => openHadith(id));

  /* ---- pomodoro ---- */
  ipcMain.handle('pomodoro:get', () => pomodoro.snapshot());
  ipcMain.handle('pomodoro:act', (_e, { action, mode }) => {
    switch (action) {
      case 'start': return pomodoro.start();
      case 'pause': return pomodoro.pause();
      case 'toggle': return pomodoro.toggle();
      case 'reset': return pomodoro.reset();
      case 'skip': return pomodoro.skip();
      case 'mode': return pomodoro.setMode(mode);
      default: return pomodoro.snapshot();
    }
  });

  /* ---- email ---- */
  ipcMain.handle('email:get', () => ({
    items: emailEngine.getItems(),
    unreadCount: emailEngine.getUnreadCount(),
  }));
  ipcMain.handle('email:refresh', async () => {
    if (emailEngine && !emailEngine.running && emailEngine.config?.user && emailEngine.config?.pass) {
      emailEngine.start();
    }
    await emailEngine.check();
    return {
      items: emailEngine.getItems(),
      unreadCount: emailEngine.getUnreadCount(),
    };
  });
  ipcMain.handle('email:test', async (_e, cfg) => {
    const res = await emailEngine.testConnection(cfg);
    if (res && res.ok && cfg && cfg.user && cfg.pass) {
      const emailPatch = {
        enabled: true,
        provider: cfg.provider || 'gmail',
        user: cfg.user,
        pass: cfg.pass,
        host: cfg.host,
        port: cfg.port,
        secure: cfg.secure !== false,
      };
      settings.merge({ email: { ...(settings.data.email || {}), ...emailPatch } });
      broadcast('settings:changed', publicSettings());
      syncWidgetServices();
      emailEngine.start();
      emailEngine.check().catch(() => { });
    }
    return res;
  });
  ipcMain.handle('email:getFull', async (_e, uid) => emailEngine.getFullMessage(uid));
  ipcMain.handle('email:markRead', (_e, uid) => {
    emailEngine.markRead(uid, true);
    return true;
  });
  ipcMain.handle('email:markUnread', (_e, uid) => {
    emailEngine.markRead(uid, false);
    return true;
  });
  ipcMain.handle('email:delete', async (_e, uid) => emailEngine.deleteMessage(uid));
  ipcMain.handle('email:send', async (_e, data) => emailEngine.sendMail(data));
  ipcMain.handle('email:pickAttachments', async (e) => {
    const win = senderWindow(e) || windows.get('email');
    const res = await dialog.showOpenDialog(win, {
      title: 'إرفاق ملفات',
      properties: ['openFile', 'multiSelections'],
    });
    if (res.canceled || !res.filePaths.length) return [];
    const files = [];
    for (const fp of res.filePaths) {
      try {
        const data = fs.readFileSync(fp);
        files.push({
          filename: path.basename(fp),
          size: data.length,
          base64: data.toString('base64'),
        });
      } catch (err) {
        console.error('Failed reading attachment:', err);
      }
    }
    return files;
  });
  ipcMain.handle('email:saveAttachment', async (e, att) => {
    const win = senderWindow(e) || windows.get('email');
    const res = await dialog.showSaveDialog(win, {
      title: 'حفظ المرفق',
      defaultPath: att.filename || 'attachment.dat',
    });
    if (res.canceled || !res.filePath) return { canceled: true };
    try {
      const buf = Buffer.from(att.base64, 'base64');
      fs.writeFileSync(res.filePath, buf);
      return { ok: true, path: res.filePath };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });
  ipcMain.handle('email:openAttachment', async (_e, att) => {
    try {
      const tmpDir = path.join(app.getPath('temp'), 'mirqat-attachments');
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
      const target = path.join(tmpDir, att.filename || 'attachment.dat');
      const buf = Buffer.from(att.base64, 'base64');
      fs.writeFileSync(target, buf);
      shell.openPath(target);
      return { ok: true, path: target };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });

  /* ---- photo ---- */
  ipcMain.handle('photo:pick', async (_e) => {
    let defaultPath;
    try { defaultPath = app.getPath('pictures'); } catch { /* ignore */ }
    const res = await dialog.showOpenDialog({
      title: T('photo.pick') || 'Choose Photo',
      defaultPath,
      filters: [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg', 'avif', 'jfif', 'ico', 'tiff'] },
        { name: 'All Files', extensions: ['*'] },
      ],
      properties: ['openFile'],
    });
    if (res.canceled || !res.filePaths.length) return null;
    return { path: res.filePaths[0] };
  });

  ipcMain.handle('photo:pickFolder', async (_e) => {
    let defaultPath;
    try { defaultPath = app.getPath('pictures'); } catch { /* ignore */ }
    const res = await dialog.showOpenDialog({
      title: T('photo.pick') || 'Choose Folder',
      defaultPath,
      properties: ['openDirectory'],
    });
    if (res.canceled || !res.filePaths.length) return null;
    return { folder: res.filePaths[0] };
  });

  ipcMain.handle('photo:setPath', (_e, filePath) => {
    if (!filePath) return false;
    const cur = settings.get('photo', {});
    settings.merge({ photo: { ...cur, mode: 'single', path: filePath } });
    broadcast('settings:changed', publicSettings());
    return true;
  });

  ipcMain.handle('photo:get', async (_e, filePath) => {
    if (!filePath || !fs.existsSync(filePath)) return null;
    try {
      const ext = path.extname(filePath).toLowerCase().replace('.', '');
      const mime = ext === 'svg' ? 'image/svg+xml' : ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
      const buf = fs.readFileSync(filePath);
      return {
        src: `data:${mime};base64,${buf.toString('base64')}`,
        name: path.basename(filePath),
        path: filePath,
      };
    } catch {
      return null;
    }
  });

  ipcMain.handle('photo:listFolder', async (_e, folderPath) => {
    if (!folderPath || !fs.existsSync(folderPath)) return { photos: [] };
    try {
      const validExts = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.svg', '.avif']);
      const files = fs.readdirSync(folderPath);
      const photos = files
        .filter((f) => validExts.has(path.extname(f).toLowerCase()))
        .map((f) => path.join(folderPath, f));
      return { photos };
    } catch {
      return { photos: [] };
    }
  });

  /* ---- windows ---- */
  ipcMain.on('win:close', (e) => {
    const win = senderWindow(e);
    if (!win) return;
    const id = widgetIdOf(win);
    if (id) {
      const folder = getFolderOfWidget(id);
      if (folder) {
        // Widget belongs to an active folder! Close it back into its folder cleanly without removing or disabling it!
        const b = win.getBounds();
        const normalKey = currentSizeKey(id) || widgetSetting(id)?.size || 'm';
        patchWidget(id, {
          prevNormalBounds: b,
          prevNormalKey: normalKey,
          isMini: true,
          size: 'icon',
          inFolder: folder.id,
        });
        settings.flush();
        destroyWidget(id);
        const folderWin = windows.get(folder.id);
        if (folderWin && !folderWin.isDestroyed()) {
          folderWin.webContents.send('folder:absorb', { folderId: folder.id, id });
        }
        broadcast('settings:changed', publicSettings());
        return;
      }
      setWidgetVisible(id, false);
      broadcast('settings:changed', publicSettings());
    } else {
      win.close();
    }
  });
  ipcMain.on('win:hide', (e) => {
    const win = senderWindow(e);
    if (!win) return;
    const id = widgetIdOf(win);
    if (id) {
      const folder = getFolderOfWidget(id);
      if (folder) {
        const b = win.getBounds();
        const normalKey = currentSizeKey(id) || widgetSetting(id)?.size || 'm';
        patchWidget(id, {
          prevNormalBounds: b,
          prevNormalKey: normalKey,
          isMini: true,
          size: 'icon',
          inFolder: folder.id,
        });
        settings.flush();
        destroyWidget(id);
        const folderWin = windows.get(folder.id);
        if (folderWin && !folderWin.isDestroyed()) {
          folderWin.webContents.send('folder:absorb', { folderId: folder.id, id });
        }
        broadcast('settings:changed', publicSettings());
        return;
      }
      setWidgetVisible(id, false);
      broadcast('settings:changed', publicSettings());
    } else {
      win.close();
    }
  });
  ipcMain.on('win:settings', (_e, section) => openSettings(section));
  ipcMain.on('win:tafsir', (_e, key) => openTafsir(key));
  ipcMain.on('win:hadith', (_e, id) => openHadith(id));
  ipcMain.on('win:task', (_e, id) => openTask(id));
  ipcMain.on('win:event', (_e, opts) => openEventWindow(opts));
  ipcMain.on('win:emailView', (_e, uid) => openEmailViewer(uid));
  ipcMain.on('win:habitsDashboard', (_e, opts) => openHabitsDashboardWindow(opts));
  ipcMain.on('win:ready-to-reveal', (e) => {
    const win = senderWindow(e);
    if (win && !win.isDestroyed()) {
      revealWidgetWindow(win);
    }
  });

  /* ---- habits & wellness ---- */
  ipcMain.handle('habits:get-state', () => ({
    habits: habitsManager.getHabits(true),
    logs: habitsManager.getAllLogs(),
    gamification: habitsManager.getGamification(),
    settings: settings.get('habits', {}),
  }));
  ipcMain.handle('habits:get-gamification', () => habitsManager.getGamification());
  ipcMain.handle('habits:claim-reward', (_e, rewardId) => habitsManager.claimReward(rewardId));
  ipcMain.handle('habits:save-reward', (_e, reward) => habitsManager.saveReward(reward));
  ipcMain.handle('habits:delete-reward', (_e, id) => habitsManager.deleteReward(id));
  ipcMain.handle('habits:get-heatmap', (_e, payload) => {
    if (typeof payload === 'object' && payload !== null) {
      return habitsManager.getActivityHeatmap(payload.days, payload.habitIdFilter);
    }
    return habitsManager.getActivityHeatmap(payload);
  });
  ipcMain.handle('habits:save-day-note', (_e, { dateStr, note } = {}) =>
    habitsManager.saveDayNote(dateStr, note));
  ipcMain.handle('habits:get-day-note', (_e, dateStr) => habitsManager.getDayNote(dateStr));
  ipcMain.handle('habits:save-status', (_e, { dateStr, habitId, status, value, note, isMicroStep } = {}) =>
    habitsManager.saveHabitStatus(dateStr, habitId, status, value, note, isMicroStep));
  ipcMain.handle('habits:save-sleep', (_e, payload = {}) => {
    const dateStr = payload.dateStr;
    const sleepData = payload.sleepData || {
      durationHours: payload.durationHours ?? payload.hours ?? 0,
      bedtime: payload.bedtime || '',
      wakeTime: payload.wakeTime || '',
      quality: payload.quality ?? 3,
      naps: payload.naps ?? 0,
    };
    return habitsManager.saveSleepLog(dateStr, sleepData);
  });
  ipcMain.handle('habits:save-mood', (_e, payload = {}) => {
    const dateStr = payload.dateStr;
    const moodData = payload.moodData || {
      rating: payload.rating ?? payload.mood ?? 3,
      scale: payload.scale || 5,
      note: payload.note || '',
    };
    return habitsManager.saveMoodLog(dateStr, moodData);
  });
  ipcMain.handle('habits:save-stress', (_e, { dateStr, level, screenHours } = {}) =>
    habitsManager.saveStressLog(dateStr, level, screenHours));
  ipcMain.handle('habits:save-day', (_e, { dateStr, data } = {}) =>
    habitsManager.saveDayLog(dateStr, data));
  ipcMain.handle('habits:save-habit', (_e, habit) => habitsManager.saveHabit(habit));
  ipcMain.handle('habits:delete-habit', (_e, id) => habitsManager.deleteHabit(id));
  ipcMain.handle('habits:archive-habit', (_e, { id, archived } = {}) =>
    habitsManager.archiveHabit(id, archived));
  ipcMain.handle('habits:reorder', (_e, orderIds) => habitsManager.reorderHabits(orderIds));
  ipcMain.handle('habits:get-analytics', (_e, month) => habitsManager.computeAnalytics(month));
  ipcMain.handle('habits:export-data', (_e, format) => habitsManager.exportData(format));
  ipcMain.handle('habits:import-data', (_e, { payload, merge } = {}) =>
    habitsManager.importData(payload, merge));
  ipcMain.handle('habits:set-hero-class', (_e, className) => habitsManager.setHeroClass(className));
  ipcMain.handle('habits:get-habit-history', (_e, payload, daysCount) => {
    const p = (typeof payload === 'object' && payload !== null && !Array.isArray(payload))
      ? payload
      : { habitId: payload, daysCount };
    return habitsManager.getHabitHistory(p.habitId, p.daysCount);
  });
  ipcMain.handle('habits:modify-hp', (_e, delta) => habitsManager.modifyHp(delta));
  ipcMain.handle('habits:get-quests', () => habitsManager.getQuests());
  ipcMain.handle('habits:claim-quest', (_e, id) => habitsManager.claimQuest(id));
  ipcMain.handle('habits:get-strength-details', (_e, habitId) => habitsManager.getHabitStrengthDetails(habitId));
  ipcMain.handle('habits:export-habit-csv', (_e, habitId) => habitsManager.exportHabitCsv(habitId));
  ipcMain.handle('habits:get-urgency', (_e, habitId) => habitsManager.calculateUrgencyScore(habitId));
  ipcMain.handle('habits:get-habits-by-urgency', () => habitsManager.getHabitsByUrgency());
  ipcMain.handle('habits:save-sub-items', (_e, payload, habitId, subItems) => {
    const p = (typeof payload === 'object' && payload !== null && !Array.isArray(payload))
      ? payload
      : { dateStr: payload, habitId, subItems };
    return habitsManager.saveHabitSubItems(p.dateStr, p.habitId, p.subItems);
  });
  ipcMain.handle('habits:get-weekly-drop-off', () => habitsManager.getWeeklyDropOffAnalysis());
  ipcMain.handle('habits:get-boss', () => habitsManager.getBoss());
  ipcMain.handle('habits:attack-boss', (_e, payload, source) => {
    const p = (typeof payload === 'object' && payload !== null && !Array.isArray(payload))
      ? payload
      : { damage: payload, source };
    return habitsManager.attackBoss(p.damage, p.source);
  });
  ipcMain.handle('habits:cast-skill', (_e, skillId) => habitsManager.castSkill(skillId));
  ipcMain.handle('habits:send-wa-report', async (_e, { type, previewOnly, targetDateStr, lang, recipient: customRecipient } = {}) => {
    const reportText = habitsManager.generateWhatsAppReport(type || 'monthly', targetDateStr, lang);
    if (previewOnly) {
      return { success: true, text: reportText, preview: reportText };
    }
    const hSettings = settings.get('habits', {});
    const recipient = customRecipient || ((settings.data.whatsapp?.routes?.habitsReports?.useCustom && settings.data.whatsapp?.routes?.habitsReports?.recipient)
      ? settings.data.whatsapp.routes.habitsReports.recipient
      : (hSettings.waRecipientOverride || ''));
    const res = await WhatsAppDispatcher.send(settings.data, {
      type: 'habits_report',
      text: reportText,
      recipient,
    });
    return {
      success: res.ok,
      error: res.error,
      text: reportText,
      preview: reportText,
      recipients: res.recipients,
    };
  });

  ipcMain.handle('habits:test-habit-reminder', async (_e, payload) => {
    const habitId = typeof payload === 'object' && payload !== null ? payload.habitId : payload;
    const overrideRecipient = typeof payload === 'object' && payload !== null ? (payload.recipient || payload.overrideRecipient) : null;
    const habit = habitsManager.getHabit(habitId);
    if (!habit) return { success: false, error: 'العادة غير موجودة' };
    const streak = habitsManager.calculateStreak(habitId);
    const lang = (payload && payload.lang) || settings.get('language') || 'ar';
    const text = habitsManager.buildHabitReminderMessage(habit, streak, lang);
    const hSettings = settings.get('habits', {});
    const recipient = overrideRecipient || habit.reminderRecipient ||
      (settings.data.whatsapp?.routes?.habitReminders?.scope !== 'specific' && settings.data.whatsapp?.routes?.habitReminders?.useCustom && settings.data.whatsapp?.routes?.habitReminders?.recipient
        ? settings.data.whatsapp.routes.habitReminders.recipient
        : (settings.data.whatsapp?.routes?.habitsReports?.useCustom && settings.data.whatsapp?.routes?.habitsReports?.recipient
          ? settings.data.whatsapp.routes.habitsReports.recipient
          : (hSettings.waRecipientOverride || '')));
    const res = await WhatsAppDispatcher.send(settings.data, {
      type: 'habit_individual_reminder_test',
      text,
      recipient,
    });
    return {
      success: res.ok,
      error: res.error,
      text,
      recipients: res.recipients,
    };
  });

  // ── The Living Atlas (أطلس العوالم الحيّة) IPC Handlers ──
  ipcMain.handle('atlas:get-state', (_e, lang) => atlasEngine.getDashboardState(lang || settings.get('language') || 'ar'));
  ipcMain.handle('atlas:upgrade-facility', (_e, facilityId) => atlasEngine.upgradeFacility(facilityId));
  ipcMain.handle('atlas:resolve-obstacle', (_e, { obstacleKey, strategyKey } = {}) => atlasEngine.resolveObstacle(obstacleKey, strategyKey));
  ipcMain.handle('atlas:get-miro-dialogue', (_e, { state, context } = {}) => atlasEngine.miro.getDialogueForState(state, context));
  ipcMain.handle('atlas:craft-project', (_e, projectId) => atlasEngine.craftProject(projectId));
  ipcMain.handle('atlas:consult-miro', (_e, { modeKey, lang, userQuestion } = {}) => atlasEngine.consultMiro(modeKey, lang || settings.get('language') || 'ar', userQuestion || ''));
  ipcMain.handle('atlas:get-miro-history', (_e) => atlasEngine.getMiroConsultationHistory());
  ipcMain.handle('atlas:generate-daily-quest', (_e, lang) => atlasEngine.generateDailyQuest(lang || settings.get('language') || 'ar'));
  ipcMain.handle('atlas:complete-daily-quest', (_e) => atlasEngine.completeDailyQuest());
  ipcMain.handle('atlas:advance-obstacle', (_e, { obstacleKey, strategyKey } = {}) => atlasEngine.advanceObstacleTier(obstacleKey, strategyKey));
  ipcMain.handle('atlas:complete-trial', (_e, trialId) => atlasEngine.completeTrial(trialId));
  ipcMain.handle('atlas:redeem-reward', (_e, rewardId) => atlasEngine.redeemReward(rewardId));
  ipcMain.handle('atlas:add-reward', (_e, rewardOpts) => atlasEngine.addCustomReward(rewardOpts));
  ipcMain.handle('atlas:delete-reward', (_e, rewardId) => atlasEngine.deleteCustomReward(rewardId));
  ipcMain.handle('atlas:set-miro-presence', (_e, mode) => atlasEngine.setMiroPresenceMode(mode));
  ipcMain.handle('atlas:add-miro-note', (_e, { text, habitId } = {}) => atlasEngine.addMiroNote(text, habitId));
  ipcMain.handle('atlas:delete-miro-note', (_e, noteId) => atlasEngine.deleteMiroNote(noteId));
  ipcMain.handle('atlas:reset-miro-memory', (_e) => atlasEngine.resetMiroMemory());
  ipcMain.handle('atlas:set-wayfinder-name', (_e, name) => atlasEngine.setWayfinderName(name));
  ipcMain.handle('atlas:test-ai', async (_e, { apiKey, model } = {}) => {
    const atlasConf = settings.get('atlas') || {};
    const key = apiKey || atlasConf.apiKey;
    const targetModel = model || atlasConf.model || 'gemini-flash-lite-latest';
    if (!key || typeof key !== 'string' || !key.trim()) {
      return { ok: false, error: 'مفتاح API غير متوفر (يرجى إدخال مفتاح Gemini API أولاً)' };
    }
    try {
      const { testGeminiConnection } = require('./src/core/atlas/atlas-ai');
      return await testGeminiConnection({ apiKey: key.trim(), model: targetModel });
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });

  ipcMain.on('shell:open', (_e, url) => {
    if (typeof url === 'string' && (/^https?:\/\//i.test(url) || /^mailto:/i.test(url))) openExternalUrl(url);
  });

  registerGestures();
}

/* ==================================================================== *
 * Lifecycle
 * ==================================================================== */

let quitting = false;

function saveAllWidgetStates() {
  for (const [id, win] of windows.entries()) {
    if (!win || win.isDestroyed()) continue;
    try {
      const b = win.getBounds();
      if (win._isFolder || (typeof id === 'string' && id.startsWith('folder'))) {
        const folders = getFolders();
        if (folders[id]) {
          folders[id].bounds = (win._isFolderExpanded && win._compactFolderBounds)
            ? { ...win._compactFolderBounds }
            : { ...b };
          saveFolders(folders);
        }
        continue;
      }
      const cur = widgetSetting(id) || {};
      const isMini = (b.width <= 90 && b.height <= 90) || Boolean(cur.isMini) || (cur.size === 'icon');
      if (isMini) {
        const miniBounds = { ...b, width: 56, height: 56 };
        patchWidget(id, {
          visible: true,
          bounds: miniBounds,
          iconBounds: miniBounds,
          isMini: true,
          size: 'icon',
        });
      } else {
        patchWidget(id, {
          visible: true,
          bounds: b,
          prevNormalBounds: b,
          isMini: false,
          size: currentSizeKey(id) || cur.size || 'm',
        });
      }
    } catch (e) {
      debugLog(`saveAllWidgetStates error for ${id}: ${e.message}`);
    }
  }
  settings.flush();
  try {
    const { defaultBackupManager } = require('./src/core/backup-manager');
    const storesToSnapshot = [
      { path: paths.settings, store: settings },
      { path: paths.todos, store: todos },
      { path: paths.notes, store: notes },
      { path: paths.habits, store: typeof habitsStore !== 'undefined' ? habitsStore : null },
      { path: paths.atlas, store: typeof atlasEngine !== 'undefined' && atlasEngine && atlasEngine.store ? atlasEngine.store.store : null },
    ];
    for (const item of storesToSnapshot) {
      if (item.store && item.store.data) {
        defaultBackupManager.createSnapshot(item.path, item.store.data, 'shutdown', true);
      }
    }
  } catch (_) { }
}

function debounce(fn, ms) {
  let t = null;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

/** The installed app keeps its Start-menu entry, which Windows needs to show notifications. */
function ensureStartMenuEntry() {
  if (!app.isPackaged) return;
  try {
    const install = require('./scripts/install');
    install.ensureStartMenuShortcut(process.execPath, path.join(__dirname, 'assets', 'icon.ico'));
  } catch (err) {
    console.error('start menu entry:', err.message);
  }
}

if (INSTALL_MODE) {
  app.whenReady().then(async () => {
    let code = 1;
    try {
      code = await require('./scripts/install').run();
    } catch (err) {
      console.error('install failed:', err);
    }
    app.exit(code);
  });
} else {
  app.whenReady().then(main);
}

async function main() {
  debugLog('main() function started');

  // Intercept all popup windows and external navigations globally so they open in the user's default browser (e.g. Chrome)
  app.on('web-contents-created', (_event, contents) => {
    contents.setWindowOpenHandler(({ url }) => {
      if (typeof url === 'string' && (/^https?:\/\//i.test(url) || /^mailto:/i.test(url))) {
        openExternalUrl(url);
      }
      return { action: 'deny' };
    });

    contents.on('will-navigate', (event, url) => {
      if (typeof url === 'string') {
        if (url.startsWith('file://')) return;
        event.preventDefault();
        if (/^https?:\/\//i.test(url) || /^mailto:/i.test(url)) {
          openExternalUrl(url);
        }
      }
    });
  });

  if (session && session.defaultSession) {
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
      if (permission === 'media') {
        callback(true);
      } else {
        callback(false);
      }
    });
  }

  fillDefaults();
  syncHabitsToTodos();
  scheduleMidnightRollover();
  registerIpc();

  // Only the installed copy manages its own login entry; a development or
  // test run must never point Windows at a temporary folder.
  if (app.isPackaged && settings.get('autoStart')) {
    try { autostart.isEnabled() ? autostart.refresh() : autostart.enable(); }
    catch (err) { console.error('autostart setup:', err.message); }
  }
  ensureStartMenuEntry();

  const hasConfiguredWidgets = settings.get('widgets') && Object.keys(settings.get('widgets')).length > 0;
  const isFirstLaunch = !settings.get('initialized') && !hasConfiguredWidgets;
  if (!settings.get('initialized') && hasConfiguredWidgets) {
    settings.set('initialized', true);
  }
  if (isFirstLaunch) {
    debugLog('Startup: First launch detected. Initializing default layout.');
    settings.set('initialized', true);
    settings.set('layoutVersion', LAYOUT_VERSION);
    resetLayout();
  }

  const allWidgets = settings.get('widgets', {});
  const folders = getFolders();
  const allWidgetsInFolders = new Set();
  let foldersChanged = false;

  const placedFolderBounds = [];
  for (const [fid, f] of Object.entries(folders)) {
    if (f && Array.isArray(f.widgetIds) && f.widgetIds.length >= 2) {
      for (const wid of f.widgetIds) allWidgetsInFolders.add(wid);

      // Upgrade legacy rectangular 190x220 to cute compact squircle 144x144 only if legacy size
      if (f.bounds) {
        if (f.bounds.width === 190 && f.bounds.height === 220) {
          f.bounds.width = 144;
          f.bounds.height = 144;
          f.size = 's';
          foldersChanged = true;
        }
        // Ensure bounds stay within screen area and do not collide
        const area = areaFor(f.bounds);
        const resolved = geo.avoidCollisions(f.bounds, area, placedFolderBounds, 16);
        if (resolved.x !== f.bounds.x || resolved.y !== f.bounds.y) {
          f.bounds.x = resolved.x;
          f.bounds.y = resolved.y;
          foldersChanged = true;
        }
        placedFolderBounds.push({ ...f.bounds });
      }

      createFolderWidget(fid, f.bounds);
    } else {
      if (f && Array.isArray(f.widgetIds) && f.widgetIds.length === 1) {
        const lastWid = f.widgetIds[0];
        patchWidget(lastWid, { visible: true });
      }
      delete folders[fid];
      foldersChanged = true;
    }
  }
  if (foldersChanged) saveFolders(folders);

  debugLog(`Configured widgets: ${Object.keys(allWidgets).map(k => `${k}:${allWidgets[k]?.visible}`).join(', ')}`);
  let createdCount = 0;
  for (const [id, cfg] of Object.entries(allWidgets)) {
    if (id === 'folder') continue;
    if (cfg && cfg.visible && WIDGETS[id]) {
      // HIGH-EFFICIENCY: Do not spawn background Chromium processes for widgets inside folders!
      if (allWidgetsInFolders.has(id)) {
        continue;
      }
      createWidget(id);
      createdCount++;
    }
  }
  if (isFirstLaunch && createdCount === 0) {
    debugLog('Startup: First launch with no visible widgets. Restoring default widgets.');
    for (const id of ['clock', 'quran', 'todo', 'calendar', 'habits']) {
      if (WIDGETS[id]) setWidgetVisible(id, true);
    }
  }

  // Ensure widgets stored in folder do not create duplicates on desktop
  syncFolderWithDesktop();

  pomodoro.restore();
  let lastStatus = pomodoro.snapshot().status;
  pomodoro.on('change', (snap) => {
    broadcast('pomodoro:state', snap);
    updateTrayTooltip();
    if (snap.status !== lastStatus) { lastStatus = snap.status; rebuildTray(); }
  });
  pomodoro.on('done', onPomodoroDone);
  reminders.on('due', onRemindersDue);
  reminders.on('changed', () => broadcast('todos:changed', todos.get('items', [])));
  reminders.check();
  setInterval(updateTrayTooltip, 60_000).unref?.();
  setInterval(checkHabitsAutomations, 60_000).unref?.();

  createTray();
  watchPower();
  setTimeout(() => { try { getOrCreatePeekWindow(); } catch { } }, 800);

  for (const ev of ['display-metrics-changed', 'display-added', 'display-removed']) {
    screen.on(ev, debounce(reclampAll, 300));
  }

  const shortcuts = {
    'Control+Alt+W': bringToFront,
    'Control+Alt+Q': () => refreshQuran(true),
    'Control+Alt+P': () => pomodoro.toggle(),
  };
  for (const [accel, fn] of Object.entries(shortcuts)) {
    try {
      if (!globalShortcut.register(accel, fn) && VERBOSE) console.log(`shortcut ${accel} is taken`);
    } catch { /* another app owns it */ }
  }

  // Synchronize active widget background engines (0% background overhead for disabled widgets)
  syncWidgetServices();
  if (widgetSetting('todo')?.visible) {
    setTimeout(runClassroomBackgroundSync, 4000);
  }
  if (widgetSetting('todo')?.visible || widgetSetting('calendar')?.visible) {
    setTimeout(() => {
      reliableDispatcher.catchup({
        todos: widgetSetting('todo')?.visible ? todos.get('items', []) : [],
        calendarEvents: widgetSetting('calendar')?.visible ? calendarEventsStore.get('events', []) : [],
      });
    }, 3000);
  }

  // Auto-start local OpenWA server if configured
  const wa = settings.get('whatsapp', {});
  debugLog(`WhatsApp config: enabled=${wa.enabled}, provider=${wa.provider}, autoStart=${wa.autoStartServer}`);
  if (wa.enabled && wa.provider === 'openwa' && wa.autoStartServer !== false) {
    debugLog('Triggering startOpenWaServer()...');
    startOpenWaServer()
      .then((res) => debugLog('startOpenWaServer result: ' + JSON.stringify(res)))
      .catch((e) => {
        debugLog('Failed to auto-start OpenWA server: ' + (e?.message || e));
        console.error('Failed to auto-start OpenWA server:', e);
      });
  }

  const harness = (file, delay, onDone) => setTimeout(async () => {
    let result = 1;
    try {
      result = await require(file).run({
        windows,
        allWindows,
        settingsStore: settings,
        openTafsir,
        openSettings,
        setWidgetSize,
        resetLayout,
        computeLayout,
        workAreas,
        pomodoro,
        reminders,
        lastReminders: () => lastReminders,
        todos,
        openTask,
        openHadith,
        hadith,
        WIDGETS,
        findWindow: (name) => ({ tafsir: tafsirWin, settings: settingsWin, task: taskWin, hadith: hadithWin })[name] || null,
      });
    } catch (err) {
      console.error(`[${path.basename(file)}] crashed:`, err);
    }
    quitting = true;
    onDone(result);
  }, delay);

  // Development only: run the end-to-end self test, then exit with its result.
  if (process.argv.includes('--selftest')) {
    harness('./scripts/selftest', 1500, (failures) => app.exit(failures ? 1 : 0));
    return;
  }
  // Development only: run an arbitrary harness script against the live app.
  const runArg = process.argv.find((a) => a.startsWith('--run='));
  if (runArg) {
    harness(path.resolve(runArg.slice(6)), 2500, (code) => app.exit(code ? 1 : 0));
    return;
  }

  // Development only: photograph the widgets as they really render, then exit.
  if (process.argv.includes('--shoot')) {
    harness('./scripts/capture', 2500, () => app.quit());
    return;
  }

  // Warm the cache a little later so startup stays quick.
  setTimeout(() => quran.prefetch(settings.data, { count: 10 }).catch(() => { }), 20_000);
  setTimeout(() => hadith.prefetch(settings.data, { count: 12 }).catch(() => { }), 45_000);
}

app.on('second-instance', bringToFront);

// Widgets live in the tray; closing one must not end the app.
app.on('window-all-closed', (e) => {
  debugLog('app window-all-closed event fired');
});

app.on('before-quit', () => {
  debugLog('app before-quit event fired');
  quitting = true;
  try { saveAllWidgetStates(); } catch { }
  clearTimeout(quranTimer);
  if (classroomSyncIntervalTimer) clearInterval(classroomSyncIntervalTimer);
  globalShortcut.unregisterAll();
  try { stopOpenWaServer(); } catch { }
  try { superUrgentMonitor.stop(); } catch { }
  try { emailEngine.stop(); } catch { }
  if (INSTALL_MODE) return;
  settings.flush();
  reminders.dispose();
  todos.flush();
  notes.flush();
  quran.flush();
  hadith.flush();
  calendarEventsStore.flush();
  calendarEventsManager.stop();
  try { reliableDispatcher.stop(); } catch { }
  try { dispatchQueueStore.flush(); } catch { }
  pomodoro.dispose();
});

app.on('will-quit', () => {
  debugLog('app will-quit event fired');
  try { saveAllWidgetStates(); } catch { }
});

app.on('quit', (e, code) => {
  debugLog(`app quit event fired with exit code: ${code}`);
});

process.on('uncaughtException', (err) => {
  debugLog('uncaughtException: ' + (err?.stack || err));
  console.error('uncaught:', err);
});

