'use strict';
/**
 * Tiny JSON store with atomic writes.
 *
 * Widgets save on every keystroke, so a half-written file after a crash or a
 * sudden shutdown would lose the user's notes. Every write therefore goes to a
 * temp file first and is renamed over the target, which is atomic on NTFS.
 */

const fs = require('fs');
const path = require('path');
const paths = require('./paths');

class Store {
  constructor(file, defaults = {}, options = {}) {
    this.file = file;
    this.defaults = defaults;
    this.options = options;
    this._backupManager = options.backupManager || null;
    this._data = null;
    this._writeTimer = null;
    this._pending = false;
    this._dirEnsured = false;
    this._lastSerialized = null;
  }

  get data() {
    if (this._data === null) this._load();
    return this._data;
  }

  _load() {
    let loaded = false;
    try {
      if (fs.existsSync(this.file)) {
        const stat = fs.statSync(this.file);
        if (stat.size > 0) {
          const raw = fs.readFileSync(this.file, 'utf8');
          const parsed = JSON.parse(raw);
          this._data = { ...structuredClone(this.defaults), ...parsed };
          this._lastSerialized = raw;
          this._dirEnsured = true;
          loaded = true;
        }
      }
    } catch (err) {
      if (err.code !== 'ENOENT') {
        // Corrupt file: keep a copy so nothing is silently destroyed.
        try {
          fs.copyFileSync(this.file, `${this.file}.corrupt-${Date.now()}`);
        } catch { /* best effort */ }
      }
    }

    const isManagedStore = this._backupManager || (path.dirname(path.resolve(this.file)) === path.resolve(paths.root));

    if (!loaded && isManagedStore) {
      // Self-Healing: Attempt automatic recovery from encrypted local backup vault
      try {
        const bm = this._backupManager || require('./backup-manager').defaultBackupManager;
        const recovered = bm.autoRecover(this.file);
        if (recovered && typeof recovered === 'object') {
          this._data = { ...structuredClone(this.defaults), ...recovered };
          this._lastSerialized = null;
          this._dirEnsured = true;
          loaded = true;
          // Atomically heal disk file immediately
          this._pending = true;
          this.flush();
        }
      } catch (_) {}
    }

    if (loaded && isManagedStore && this._data && Object.keys(this._data).length > 0) {
      // Ensure a secure baseline snapshot exists for this healthy store
      try {
        const bm = this._backupManager || require('./backup-manager').defaultBackupManager;
        bm.ensureBaselineSnapshot(this.file, this._data);
      } catch (_) {}
    }

    if (!loaded) {
      this._data = structuredClone(this.defaults);
    }
  }

  get(key, fallback) {
    const v = this.data[key];
    return v === undefined ? fallback : v;
  }

  set(key, value) {
    this.data[key] = value;
    this.save();
    return value;
  }

  merge(patch) {
    Object.assign(this.data, patch);
    this.save();
    return this.data;
  }

  /** Debounced write; call flush() when you need it on disk right now. */
  save() {
    this._pending = true;
    if (this._writeTimer) return;
    this._writeTimer = setTimeout(() => {
      this._writeTimer = null;
      this.flush();
    }, 120);
    if (this._writeTimer.unref) this._writeTimer.unref();
  }

  flush() {
    if (!this._pending || this._data === null) return;
    this._pending = false;

    const serialized = JSON.stringify(this._data, null, 2);
    if (serialized === this._lastSerialized) return; // Skip disk I/O if content hasn't changed

    if (!this._dirEnsured) {
      fs.mkdirSync(path.dirname(this.file), { recursive: true });
      this._dirEnsured = true;
    }

    const tmp = `${this.file}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, serialized, 'utf8');
    fs.renameSync(tmp, this.file);
    this._lastSerialized = serialized;

    // Automated rolling snapshot in local secure vault for managed stores
    const isManagedStore = this._backupManager || (path.dirname(path.resolve(this.file)) === path.resolve(paths.root));
    if (isManagedStore) {
      try {
        const bm = this._backupManager || require('./backup-manager').defaultBackupManager;
        bm.createSnapshot(this.file, this._data, 'auto');
      } catch (_) {}
    }
  }

  /**
   * Explicitly triggers an immediate named snapshot checkpoint.
   * @param {'milestone'|'manual'|'setup'} reason
   */
  createCheckpoint(reason = 'milestone') {
    const isManagedStore = this._backupManager || (path.dirname(path.resolve(this.file)) === path.resolve(paths.root));
    if (isManagedStore) {
      try {
        const bm = this._backupManager || require('./backup-manager').defaultBackupManager;
        return bm.createSnapshot(this.file, this.data, reason);
      } catch (_) {
        return null;
      }
    }
    return null;
  }
}

module.exports = { Store };
