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

class Store {
  constructor(file, defaults = {}) {
    this.file = file;
    this.defaults = defaults;
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
    try {
      const raw = fs.readFileSync(this.file, 'utf8');
      const parsed = JSON.parse(raw);
      this._data = { ...structuredClone(this.defaults), ...parsed };
      this._lastSerialized = raw;
      this._dirEnsured = true;
    } catch (err) {
      if (err.code !== 'ENOENT') {
        // Corrupt file: keep a copy so nothing is silently destroyed.
        try {
          fs.copyFileSync(this.file, `${this.file}.corrupt-${Date.now()}`);
        } catch { /* best effort */ }
      }
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
  }
}

module.exports = { Store };
