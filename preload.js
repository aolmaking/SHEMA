'use strict';
/**
 * The only bridge between the widget pages and the main process.
 *
 * Renderers run with contextIsolation on and no Node access, so everything
 * they can do is listed here explicitly.
 */

const { contextBridge, ipcRenderer, webUtils } = require('electron');

/** Wrap a main-process listener so callers get an unsubscribe function. */
function on(channel, handler) {
  const wrapped = (_event, payload) => handler(payload);
  ipcRenderer.on(channel, wrapped);
  return () => ipcRenderer.removeListener(channel, wrapped);
}

contextBridge.exposeInMainWorld('widgets', {
  getPathForFile: (file) => (webUtils ? webUtils.getPathForFile(file) : (file?.path || '')),
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    set: (patch) => ipcRenderer.invoke('settings:set', patch),
    reset: () => ipcRenderer.invoke('settings:reset'),
    onChange: (fn) => on('settings:changed', fn),
  },

  todos: {
    get: () => ipcRenderer.invoke('todos:get'),
    set: (items) => ipcRenderer.invoke('todos:set', items),
    one: (id) => ipcRenderer.invoke('todos:one', id),
    patch: (id, patch) => ipcRenderer.invoke('todos:patch', { id, patch }),
    remove: (id) => ipcRenderer.invoke('todos:remove', id),
    onChange: (fn) => on('todos:changed', fn),
    onLoad: (fn) => on('task:load', fn),
    onUrgentState: (fn) => on('todos:urgent-state', fn),
    getUrgentState: () => ipcRenderer.invoke('todos:getUrgentState'),
  },

  clock: {
    getAlarms: async () => {
      const s = await ipcRenderer.invoke('settings:get');
      return s?.clock?.alarms || [];
    },
    setAlarmForTask: async (task, timeStr, days = [0, 1, 2, 3, 4, 5, 6], repeat = 'once', reminderId = null) => {
      const s = await ipcRenderer.invoke('settings:get');
      const curAlarms = [...(s?.clock?.alarms || [])];
      const targetId = reminderId ? `alarm_task_${task.id}_${reminderId}` : `alarm_task_${task.id}`;
      const existingIdx = curAlarms.findIndex((a) => a.id === targetId || (!reminderId && a.taskId === task.id));
      const newAlarm = {
        id: existingIdx >= 0 ? curAlarms[existingIdx].id : targetId,
        time: timeStr,
        label: task.text ? task.text.slice(0, 48) : 'منبه مهمة',
        days: days && days.length ? days : [0, 1, 2, 3, 4, 5, 6],
        repeat: repeat || 'once',
        enabled: true,
        taskId: task.id,
        reminderId: reminderId || null,
        taskTitle: task.text || '',
        lastTriggeredDate: null,
      };
      if (existingIdx >= 0) {
        curAlarms[existingIdx] = newAlarm;
      } else {
        curAlarms.unshift(newAlarm);
      }
      await ipcRenderer.invoke('settings:set', { clock: { alarms: curAlarms } });
      return newAlarm;
    },
    removeAlarmForTask: async (taskId, reminderId = null) => {
      const s = await ipcRenderer.invoke('settings:get');
      const curAlarms = (s?.clock?.alarms || []).filter((a) => {
        if (reminderId) {
          return a.id !== `alarm_task_${taskId}_${reminderId}` && a.reminderId !== reminderId;
        }
        return a.taskId !== taskId && !a.id.startsWith(`alarm_task_${taskId}`);
      });
      await ipcRenderer.invoke('settings:set', { clock: { alarms: curAlarms } });
      return true;
    },
    onAlarmsChange: (fn) => on('settings:changed', (s) => {
      if (s?.clock?.alarms) fn(s.clock.alarms);
    }),
  },

  classroom: {
    getAuthUrl: (clientId) => ipcRenderer.invoke('classroom:auth-url', clientId),
    startAuth: (opts) => ipcRenderer.invoke('classroom:start-auth', opts),
    sync: () => ipcRenderer.invoke('classroom:sync'),
    canDone: (task) => ipcRenderer.invoke('classroom:can-done', task),
    courses: () => ipcRenderer.invoke('classroom:courses'),
    onSyncDone: (fn) => on('classroom:sync-done', fn),
    onError: (fn) => on('classroom:error', fn),
  },

  whatsapp: {
    test: (cfg) => ipcRenderer.invoke('whatsapp:test', cfg),
  },

  openwa: {
    status: () => ipcRenderer.invoke('openwa:status'),
    qr: () => ipcRenderer.invoke('openwa:qr'),
    start: () => ipcRenderer.invoke('openwa:start'),
    stop: () => ipcRenderer.invoke('openwa:stop'),
    groups: () => ipcRenderer.invoke('openwa:groups'),
  },

  calendar: {
    getEvents: () => ipcRenderer.invoke('calendar:get-events'),
    saveEvent: (ev) => ipcRenderer.invoke('calendar:save-event', ev),
    removeEvent: (id) => ipcRenderer.invoke('calendar:remove-event', id),
    testEventWhatsApp: (ev) => ipcRenderer.invoke('calendar:test-whatsapp', ev),
    onEventsChanged: (fn) => on('calendar:events-changed', fn),
    getDayNotes: () => ipcRenderer.invoke('calendar:get-day-notes'),
    getDayNote: (dateStr) => ipcRenderer.invoke('calendar:get-day-note', dateStr),
    saveDayNote: (dateStr, text) => ipcRenderer.invoke('calendar:save-day-note', { dateStr, text }),
    removeDayNote: (dateStr) => ipcRenderer.invoke('calendar:remove-day-note', dateStr),
    onDayNotesChanged: (fn) => on('calendar:day-notes-changed', fn),
    onLoadEvent: (fn) => on('event:load', fn),
  },

  habits: {
    getState: () => ipcRenderer.invoke('habits:get-state'),
    getGamification: () => ipcRenderer.invoke('habits:get-gamification'),
    claimReward: (rewardId) => ipcRenderer.invoke('habits:claim-reward', rewardId),
    saveReward: (reward) => ipcRenderer.invoke('habits:save-reward', reward),
    deleteReward: (id) => ipcRenderer.invoke('habits:delete-reward', id),
    getActivityHeatmap: (days, habitIdFilter) => ipcRenderer.invoke('habits:get-heatmap', { days, habitIdFilter }),
    saveDayNote: (opts) => ipcRenderer.invoke('habits:save-day-note', opts),
    getDayNote: (dateStr) => ipcRenderer.invoke('habits:get-day-note', dateStr),
    saveStatus: (opts) => ipcRenderer.invoke('habits:save-status', opts),
    saveSleep: (opts) => ipcRenderer.invoke('habits:save-sleep', opts),
    saveMood: (opts) => ipcRenderer.invoke('habits:save-mood', opts),
    saveStress: (opts) => ipcRenderer.invoke('habits:save-stress', opts),
    saveDay: (opts) => ipcRenderer.invoke('habits:save-day', opts),
    saveHabit: (habit) => ipcRenderer.invoke('habits:save-habit', habit),
    deleteHabit: (id) => ipcRenderer.invoke('habits:delete-habit', id),
    archiveHabit: (opts) => ipcRenderer.invoke('habits:archive-habit', opts),
    reorder: (orderIds) => ipcRenderer.invoke('habits:reorder', orderIds),
    getAnalytics: (month) => ipcRenderer.invoke('habits:get-analytics', month),
    exportData: (format) => ipcRenderer.invoke('habits:export-data', format),
    importData: (payload, merge) => ipcRenderer.invoke('habits:import-data', { payload, merge }),
    sendWaReport: (opts) => ipcRenderer.invoke('habits:send-wa-report', opts),
    testHabitReminder: (habitId) => ipcRenderer.invoke('habits:test-habit-reminder', habitId),
    setHeroClass: (className) => ipcRenderer.invoke('habits:set-hero-class', className),
    getHabitHistory: (...args) => {
      const payload = (args.length === 1 && typeof args[0] === 'object' && args[0] !== null)
        ? args[0]
        : { habitId: args[0], daysCount: args[1] };
      return ipcRenderer.invoke('habits:get-habit-history', payload);
    },
    modifyHp: (delta) => ipcRenderer.invoke('habits:modify-hp', delta),
    getQuests: () => ipcRenderer.invoke('habits:get-quests'),
    claimQuest: (questId) => ipcRenderer.invoke('habits:claim-quest', questId),
    getHabitStrengthDetails: (habitId) => ipcRenderer.invoke('habits:get-strength-details', habitId),
    exportHabitCsv: (habitId) => ipcRenderer.invoke('habits:export-habit-csv', habitId),
    getUrgency: (habitId) => ipcRenderer.invoke('habits:get-urgency', habitId),
    getHabitUrgency: (habitId) => ipcRenderer.invoke('habits:get-urgency', habitId),
    getHabitsByUrgency: () => ipcRenderer.invoke('habits:get-habits-by-urgency'),
    saveSubItems: (...args) => {
      const payload = (args.length === 1 && typeof args[0] === 'object' && args[0] !== null)
        ? args[0]
        : { dateStr: args[0], habitId: args[1], subItems: args[2] };
      return ipcRenderer.invoke('habits:save-sub-items', payload);
    },
    getWeeklyDropOff: () => ipcRenderer.invoke('habits:get-weekly-drop-off'),
    getBoss: () => ipcRenderer.invoke('habits:get-boss'),
    attackBoss: (...args) => {
      const payload = (args.length === 1 && typeof args[0] === 'object' && args[0] !== null)
        ? args[0]
        : { damage: args[0], source: args[1] };
      return ipcRenderer.invoke('habits:attack-boss', payload);
    },
    castSkill: (skillId) => ipcRenderer.invoke('habits:cast-skill', skillId),
    onChange: (fn) => on('habits:changed', fn),
    onLogChange: (fn) => on('habits:log-changed', fn),
    onGamificationChange: (fn) => on('habits:gamification-updated', fn),
    onDashboardOpts: (fn) => on('habits:dashboard-opts', fn),
  },

  atlas: {
    getState: (lang) => ipcRenderer.invoke('atlas:get-state', lang),
    upgradeFacility: (facilityId) => ipcRenderer.invoke('atlas:upgrade-facility', facilityId),
    resolveObstacle: (opts) => ipcRenderer.invoke('atlas:resolve-obstacle', opts),
    getMiroDialogue: (opts) => ipcRenderer.invoke('atlas:get-miro-dialogue', opts),
    craftProject: (projectId) => ipcRenderer.invoke('atlas:craft-project', projectId),
    consultMiro: (opts) => ipcRenderer.invoke('atlas:consult-miro', opts),
    advanceObstacle: (opts) => ipcRenderer.invoke('atlas:advance-obstacle', opts),
    completeTrial: (trialId) => ipcRenderer.invoke('atlas:complete-trial', trialId),
    redeemReward: (rewardId) => ipcRenderer.invoke('atlas:redeem-reward', rewardId),
    addReward: (opts) => ipcRenderer.invoke('atlas:add-reward', opts),
    deleteReward: (rewardId) => ipcRenderer.invoke('atlas:delete-reward', rewardId),
    setMiroPresence: (mode) => ipcRenderer.invoke('atlas:set-miro-presence', mode),
    addMiroNote: (opts) => ipcRenderer.invoke('atlas:add-miro-note', opts),
    deleteMiroNote: (noteId) => ipcRenderer.invoke('atlas:delete-miro-note', noteId),
    resetMiroMemory: () => ipcRenderer.invoke('atlas:reset-miro-memory'),
    setWayfinderName: (name) => ipcRenderer.invoke('atlas:set-wayfinder-name', name),
    onUpdated: (fn) => on('atlas:updated', fn),
  },

  dispatch: {
    getJournal: () => ipcRenderer.invoke('dispatch:get-journal'),
    forceCatchup: () => ipcRenderer.invoke('dispatch:force-catchup'),
  },

  backup: {
    getStats: () => ipcRenderer.invoke('backup:get-stats'),
    list: (storeName) => ipcRenderer.invoke('backup:list', storeName),
    createCheckpoint: (opts) => ipcRenderer.invoke('backup:create-checkpoint', opts),
    autoHeal: (storeName) => ipcRenderer.invoke('backup:auto-heal', storeName),
    exportArchive: (opts) => ipcRenderer.invoke('backup:export-archive', opts),
    importArchive: (opts) => ipcRenderer.invoke('backup:import-archive', opts),
  },

  notes: {
    get: () => ipcRenderer.invoke('notes:get'),
    set: (payload) => ipcRenderer.invoke('notes:set', payload),
    onChange: (fn) => on('notes:changed', fn),
  },

  quran: {
    current: (opts) => ipcRenderer.invoke('quran:current', opts || {}),
    detail: (key) => ipcRenderer.invoke('quran:detail', key),
    detailWith: (opts) => ipcRenderer.invoke('quran:detailWith', opts),
    history: () => ipcRenderer.invoke('quran:history'),
    stats: () => ipcRenderer.invoke('quran:stats'),
    sources: () => ipcRenderer.invoke('quran:sources'),
    prefetch: () => ipcRenderer.invoke('quran:prefetch'),
    onUpdate: (fn) => on('quran:update', fn),
    onError: (fn) => on('quran:error', fn),
    onLoadKey: (fn) => on('tafsir:load', fn),
  },

  inspire: {
    current: (opts) => ipcRenderer.invoke('inspire:current', opts || {}),
    onUpdate: (fn) => on('inspire:update', fn),
  },

  hadith: {
    detail: (id) => ipcRenderer.invoke('hadith:detail', id),
    prefetch: () => ipcRenderer.invoke('hadith:prefetch'),
    onLoad: (fn) => on('hadith:load', fn),
  },

  pomodoro: {
    get: () => ipcRenderer.invoke('pomodoro:get'),
    act: (action, mode) => ipcRenderer.invoke('pomodoro:act', { action, mode }),
    onState: (fn) => on('pomodoro:state', fn),
    onDone: (fn) => on('pomodoro:done', fn),
  },

  email: {
    get: () => ipcRenderer.invoke('email:get'),
    refresh: () => ipcRenderer.invoke('email:refresh'),
    test: (cfg) => ipcRenderer.invoke('email:test', cfg),
    getFull: (uid) => ipcRenderer.invoke('email:getFull', uid),
    markRead: (uid) => ipcRenderer.invoke('email:markRead', uid),
    markUnread: (uid) => ipcRenderer.invoke('email:markUnread', uid),
    delete: (uid) => ipcRenderer.invoke('email:delete', uid),
    send: (data) => ipcRenderer.invoke('email:send', data),
    saveAttachment: (att) => ipcRenderer.invoke('email:saveAttachment', att),
    openAttachment: (att) => ipcRenderer.invoke('email:openAttachment', att),
    pickAttachments: () => ipcRenderer.invoke('email:pickAttachments'),
    onUpdate: (fn) => on('email:update', fn),
    onError: (fn) => on('email:error', fn),
    onNewEmail: (fn) => on('email:new', fn),
    onViewLoad: (fn) => on('email-view:load', fn),
  },

  photo: {
    pick: () => ipcRenderer.invoke('photo:pick'),
    pickFolder: () => ipcRenderer.invoke('photo:pickFolder'),
    setPath: (filePath) => ipcRenderer.invoke('photo:setPath', filePath),
    get: (filePath) => ipcRenderer.invoke('photo:get', filePath),
    listFolder: (folderPath) => ipcRenderer.invoke('photo:listFolder', folderPath),
  },

  widgetsVisible: (id, visible) => ipcRenderer.invoke('widgets:visible', { id, visible }),
  widgetSize: (id, size) => ipcRenderer.invoke('widgets:size', { id, size }),
  widgetBounds: (id, width, height) => ipcRenderer.invoke('widgets:bounds', { id, width, height }),
  widgetLock: (id, locked) => ipcRenderer.invoke('widgets:lock', { id, locked }),
  catalog: () => ipcRenderer.invoke('widgets:catalog'),
  resetLayout: () => ipcRenderer.invoke('layout:reset'),
  onWake: (fn) => on('system:wake', fn),

  power: {
    getStatus: () => ipcRenderer.invoke('power:get-status'),
    onStatus: (fn) => on('power:status', fn),
  },

  folder: {
    get: (fid) => fid ? ipcRenderer.invoke('folder:get', fid) : ipcRenderer.invoke('folder:get'),
    set: (data) => ipcRenderer.invoke('folder:set', data),
    expand: (fid) => fid ? ipcRenderer.invoke('folder:expand', fid) : ipcRenderer.invoke('folder:expand'),
    collapse: (fid) => ipcRenderer.invoke('folder:collapse', fid),
    activateWidget: (id, fid) => ipcRenderer.invoke('folder:activate-widget', { id, folderId: fid }),
    detachWidget: (id, coords, fid) => ipcRenderer.invoke('folder:detach-widget', { id, folderId: fid, ...coords }),
    dragOutStart: (id, coords) => ipcRenderer.send('folder:drag-out-start', { id, ...coords }),
    dragOutMove: (coords) => ipcRenderer.send('folder:drag-out-move', coords),
    dragOutCancel: () => ipcRenderer.send('folder:drag-out-cancel'),
    dragOutEnd: (payload) => ipcRenderer.invoke('folder:drag-out-end', payload),
    onDragGhostSet: (fn) => on('folder:drag-ghost-set', fn),
    getWidgetStatus: () => ipcRenderer.invoke('folder:widget-status'),
    onFolderChanged: (fn) => on('folder:changed', fn),
    onDragHover: (fn) => on('folder:drag-hover', fn),
    onAbsorb: (fn) => on('folder:absorb', fn),
  },

  win: {
    close: () => ipcRenderer.send('win:close'),
    hide: () => ipcRenderer.send('win:hide'),
    openSettings: (section) => ipcRenderer.send('win:settings', section),
    openTafsir: (key) => ipcRenderer.send('win:tafsir', key),
    openEmailView: (uid) => ipcRenderer.send('win:emailView', uid),
    openTask: (id) => ipcRenderer.send('win:task', id),
    openEvent: (opts) => ipcRenderer.send('win:event', opts),
    openHabitsDashboard: (opts) => ipcRenderer.send('win:habitsDashboard', opts),
    openHadith: (id) => ipcRenderer.send('win:hadith', id),
    dragStart: (sx, sy) => ipcRenderer.send('win:dragStart', { sx, sy }),
    dragMove: (sx, sy) => ipcRenderer.send('win:dragMove', { sx, sy }),
    resizeStart: (sx, sy, corner) => ipcRenderer.send('win:resizeStart', { sx, sy, corner }),
    resizeMove: (sx, sy) => ipcRenderer.send('win:resizeMove', { sx, sy }),
    gestureEnd: () => ipcRenderer.send('win:gestureEnd'),
    contextMenu: () => ipcRenderer.send('win:contextMenu'),
    toggleMini: () => ipcRenderer.invoke('win:toggleMini'),
    arrangeMini: () => ipcRenderer.invoke('widgets:arrangeMini'),
    getBounds: () => ipcRenderer.invoke('win:getBounds'),
    showPeek: (opts) => ipcRenderer.invoke('win:showPeek', opts),
    hidePeek: () => ipcRenderer.invoke('win:hidePeek'),
    restoreFromPeek: (page) => ipcRenderer.invoke('win:restoreFromPeek', page),
    getPeekPayload: () => ipcRenderer.invoke('peek:getPayload'),
    onPeekLoad: (fn) => on('peek:load', fn),
    onSection: (fn) => on('settings:section', fn),
    onFolderHoverTarget: (fn) => on('widget:folder-hover-target', fn),
    readyToReveal: () => ipcRenderer.send('win:ready-to-reveal'),
    onPrepareExpand: (fn) => on('widget:prepare-expand', fn),
    onPrepareMini: (fn) => on('widget:prepare-mini', fn),

    // Multi-Selection, Marquee & Group Controls
    toggleSelect: (id) => ipcRenderer.invoke('selection:toggle', id),
    selectWidget: (id, multi) => ipcRenderer.invoke('selection:set', { id, multi }),
    selectAllMini: () => ipcRenderer.invoke('selection:allMini'),
    clearSelection: () => ipcRenderer.invoke('selection:clear'),
    startMarquee: (startPt) => ipcRenderer.invoke('marquee:start', startPt),
    onSelectionChanged: (fn) => on('selection:changed', fn),
    onMarqueeInit: (fn) => on('marquee:init', fn),
    onGroupUpdate: (fn) => on('group:update', fn),
  },

  marquee: {
    update: (box) => ipcRenderer.send('marquee:update', box),
    end: (box) => ipcRenderer.send('marquee:end', box),
    cancel: () => ipcRenderer.send('marquee:cancel'),
  },

  group: {
    move: (dx, dy) => ipcRenderer.invoke('group:move', { dx, dy }),
    arrangeGrid: () => ipcRenderer.invoke('group:arrangeGrid'),
    restoreAll: () => ipcRenderer.invoke('group:restoreAll'),
    hideAll: () => ipcRenderer.invoke('group:hideAll'),
    dismiss: () => ipcRenderer.invoke('selection:clear'),
  },

  browser: {
    getProfiles: () => ipcRenderer.invoke('browser:getProfiles'),
    test: (opts) => ipcRenderer.invoke('browser:test', opts),
  },

  openExternal: (url) => ipcRenderer.send('shell:open', url),
});
