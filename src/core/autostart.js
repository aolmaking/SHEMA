'use strict';
/**
 * Start-with-Windows support.
 *
 * The installed app puts a normal shortcut in the user's Startup folder, so
 * it shows up by name in Windows' "Startup apps" list and can be switched off
 * there too. A copy running from source (no installed .exe) uses a tiny .vbs
 * launcher instead, which starts electron.exe with the project folder and no
 * console window.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Windows Script Host reads .vbs as UTF-16LE when it carries a BOM. Writing
// UTF-8 would corrupt any non-ASCII character in the install path.
function writeVbs(file, text) {
  fs.writeFileSync(file, Buffer.concat([
    Buffer.from([0xFF, 0xFE]),
    Buffer.from(text, 'utf16le'),
  ]));
}

function readVbs(file) {
  const buf = fs.readFileSync(file);
  if (buf[0] === 0xFF && buf[1] === 0xFE) return buf.subarray(2).toString('utf16le');
  return buf.toString('utf8');
}

// This module is used both inside Electron and from the plain-node CLI, where
// `require('electron')` resolves to the binary path rather than the API.
let app = null;
let shell = null;
try {
  const electron = require('electron');
  if (electron && typeof electron === 'object' && electron.app) {
    app = electron.app;
    shell = electron.shell;
  }
} catch { /* running under plain node */ }

const projectRoot = path.resolve(__dirname, '..', '..');

const VBS_NAME = 'MirqatWidgets.vbs';
const LNK_NAME = 'ودجت سطح المكتب.lnk';
const DESKTOP_NAME = 'mirqat-widgets.desktop';
const APP_ID = 'com.ahmed.mirqat-widgets';

function startupDir() {
  // Tests point this somewhere harmless so they never touch the real folder.
  if (process.env.WIDGETS_STARTUP_DIR) return process.env.WIDGETS_STARTUP_DIR;
  if (process.platform === 'linux') {
    return path.join(os.homedir(), '.config', 'autostart');
  }
  return path.join(
    process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'),
    'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup'
  );
}

function launcherPath() {
  if (process.platform === 'linux') {
    return path.join(startupDir(), DESKTOP_NAME);
  }
  return path.join(startupDir(), VBS_NAME);
}

function shortcutPath() {
  if (process.platform === 'linux') {
    return path.join(startupDir(), DESKTOP_NAME);
  }
  return path.join(startupDir(), LNK_NAME);
}

function isPackaged() {
  return Boolean(app && app.isPackaged);
}

/** The Electron binary to launch when we are not running inside Electron. */
function electronBinary() {
  const local = path.join(projectRoot, 'node_modules', 'electron', 'dist', 'electron.exe');
  return fs.existsSync(local) ? local : process.execPath;
}

function appPath() {
  return app && app.getAppPath ? app.getAppPath() : projectRoot;
}

/** How a from-source copy is started, so we can reproduce it at login. */
function sourceLaunch() {
  const exe = app ? process.execPath : electronBinary();
  return { exe, args: [appPath()] };
}

function vbsScript() {
  const { exe, args } = sourceLaunch();
  const quoted = [exe, ...args].map((a) => `""${a.replace(/"/g, '')}""`).join(' ');
  return [
    "' Starts the desktop widgets at login, without a console window.",
    "' Created by the widgets app; delete this file to stop it starting.",
    'Set sh = CreateObject("WScript.Shell")',
    `sh.Run "${quoted}", 0, False`,
    '',
  ].join('\r\n');
}

function shortcutOptions(exe = process.execPath) {
  return {
    target: exe,
    cwd: path.dirname(exe),
    description: 'ودجت سطح المكتب',
    icon: path.join(appPath(), 'assets', 'icon.ico'),
    iconIndex: 0,
    appUserModelId: APP_ID,
  };
}

function isEnabled() {
  try {
    return fs.existsSync(shortcutPath()) || fs.existsSync(launcherPath());
  } catch {
    return false;
  }
}

function removeQuietly(file) {
  try { fs.unlinkSync(file); } catch (err) { if (err.code !== 'ENOENT') throw err; }
}

function enable() {
  fs.mkdirSync(startupDir(), { recursive: true });
  if (process.platform === 'linux') {
    const { exe, args } = sourceLaunch();
    const cmd = [exe, ...args].join(' ');
    const desktopEntry = [
      '[Desktop Entry]',
      'Type=Application',
      'Name=Mirqat Widgets',
      `Exec=${cmd}`,
      'Hidden=false',
      'NoDisplay=false',
      'X-GNOME-Autostart-enabled=true',
      '',
    ].join('\n');
    fs.writeFileSync(shortcutPath(), desktopEntry, 'utf8');
  } else if (isPackaged() && shell) {
    shell.writeShortcutLink(shortcutPath(), 'create', shortcutOptions());
    removeQuietly(launcherPath());
  } else {
    writeVbs(launcherPath(), vbsScript());
    removeQuietly(shortcutPath());
  }
  return true;
}

function disable() {
  removeQuietly(launcherPath());
  removeQuietly(shortcutPath());
  return true;
}

function set(on) {
  return on ? enable() : disable();
}

/** Re-point the login entry if the app has moved. */
function refresh() {
  if (!isEnabled()) return false;
  try {
    if (isPackaged() && shell) {
      let current = null;
      try { current = shell.readShortcutLink(shortcutPath()); } catch { current = null; }
      if (!current || path.resolve(current.target) !== path.resolve(process.execPath) || fs.existsSync(launcherPath())) {
        enable();
        return true;
      }
      return false;
    }
    const want = vbsScript();
    if (!fs.existsSync(launcherPath()) || readVbs(launcherPath()) !== want) {
      enable();
      return true;
    }
  } catch { /* leave it alone if unreadable */ }
  return false;
}

module.exports = {
  isEnabled, enable, disable, set, refresh,
  launcherPath, shortcutPath, startupDir, readLauncher: readVbs, APP_ID,
};
