'use strict';
/**
 * Where the app keeps user data.
 *
 * Under Electron this is the normal per-user app-data folder, so the widgets
 * keep their notes and cache across restarts and reinstalls. The same modules
 * are also exercised by the CLI test scripts outside Electron, where we fall
 * back to a local ./data folder.
 */

const path = require('path');
const fs = require('fs');
const os = require('os');

// An explicit override wins, so the test harness and a portable install can
// both keep their data somewhere other than the default profile.
let base = process.env.WIDGETS_DATA_DIR || null;

if (!base) {
  try {
    const { app } = require('electron');
    base = app && app.getPath ? app.getPath('userData') : null;
  } catch {
    base = null;
  }
}

if (!base) base = path.join(os.homedir(), '.mirqat-widgets');

const dirs = {
  root: base,
  cache: path.join(base, 'cache'),
  backups: path.join(base, 'backups'),
};

for (const d of Object.values(dirs)) fs.mkdirSync(d, { recursive: true });

module.exports = {
  root: dirs.root,
  cache: dirs.cache,
  backups: dirs.backups,
  settings: path.join(dirs.root, 'settings.json'),
  todos: path.join(dirs.root, 'todos.json'),
  notes: path.join(dirs.root, 'notes.json'),
  quranState: path.join(dirs.root, 'quran-state.json'),
  pomodoro: path.join(dirs.root, 'pomodoro.json'),
  ayahCache: path.join(dirs.cache, 'ayat.json'),
  tafsirCache: path.join(dirs.cache, 'tafsir.json'),
  chaptersCache: path.join(dirs.cache, 'chapters.json'),
  hadithState: path.join(dirs.root, 'hadith-state.json'),
  hadithCache: path.join(dirs.cache, 'hadith.json'),
  hadithPool: path.join(dirs.cache, 'hadith-pool.json'),
  hadithIndex: path.join(dirs.cache, 'hadith-index.json'),
  emails: path.join(dirs.root, 'emails.json'),
  photoState: path.join(dirs.root, 'photo-state.json'),
  calendarEvents: path.join(dirs.root, 'calendar-events.json'),
  dispatchQueue: path.join(dirs.root, 'dispatch-queue.json'),
  habits: path.join(dirs.root, 'habits.json'),
  atlas: path.join(dirs.root, 'atlas.json'),
};
