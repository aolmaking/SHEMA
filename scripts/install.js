'use strict';
/**
 * Installs the widgets as a proper Windows app.
 *
 *   npm run install-app            -> %USERPROFILE%\Apps\widgets
 *   WIDGETS_INSTALL_DIR=D:\x ...   -> somewhere else
 *
 * Result:
 *   <dir>\MirqatWidgets.exe          the app (Electron runtime, renamed)
 *   <dir>\resources\app\             the widgets themselves
 *   <dir>\uninstall.cmd              removes everything except your data
 *   Desktop\ودجت سطح المكتب.lnk      double-click to open
 *
 * The Start-menu entry and the start-with-Windows entry are created by the
 * app itself the first time it runs, so they always point at the copy that
 * is actually running.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync, spawn } = require('child_process');

const EXE_NAME = 'MirqatWidgets.exe';
const SHORTCUT_NAME = 'ودجت سطح المكتب.lnk';
const APP_ID = 'com.ahmed.mirqat-widgets';
const ROOT = path.resolve(__dirname, '..');

const APP_FILES = ['main.js', 'preload.js', 'README.md', 'src', 'windows', 'assets', 'scripts'];

function log(msg) { console.log(`[install] ${msg}`); }

function targetDir() {
  return process.env.WIDGETS_INSTALL_DIR || path.join(os.homedir(), 'Apps', 'widgets');
}

function startMenuDir() {
  return path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'),
    'Microsoft', 'Windows', 'Start Menu', 'Programs');
}

function shortcutOptions(exe, icon) {
  return {
    target: exe,
    cwd: path.dirname(exe),
    description: 'ودجت سطح المكتب: المهام، الملاحظات، الساعة، التقويم، المؤقت، وآية مع تفسيرها',
    icon,
    iconIndex: 0,
    appUserModelId: APP_ID,
  };
}

/** Start-menu entry; Windows needs it (with the app id) to show notifications. */
function ensureStartMenuShortcut(exe, icon) {
  const { shell } = require('electron');
  const file = path.join(startMenuDir(), SHORTCUT_NAME);
  let current = null;
  try { current = shell.readShortcutLink(file); } catch { current = null; }
  if (current && path.resolve(current.target) === path.resolve(exe) && current.appUserModelId === APP_ID) return false;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  shell.writeShortcutLink(file, 'create', shortcutOptions(exe, icon));
  return true;
}

function stopRunningCopy() {
  try {
    execFileSync('taskkill', ['/IM', EXE_NAME, '/F'], { stdio: 'ignore' });
    log(`stopped the running ${EXE_NAME}`);
    // Give Windows a moment to release the files.
    const until = Date.now() + 1500;
    while (Date.now() < until) { /* wait */ }
  } catch { /* was not running */ }
}

function copyRuntime(target) {
  const dist = path.join(ROOT, 'node_modules', 'electron', 'dist');
  const existingExe = path.join(target, EXE_NAME);
  if (!fs.existsSync(path.join(dist, 'electron.exe'))) {
    if (fs.existsSync(existingExe)) {
      log(`using existing runtime at ${existingExe}`);
      return existingExe;
    }
    throw new Error('Electron is missing. Run "npm install" first.');
  }
  fs.mkdirSync(target, { recursive: true });
  // Inside Electron, fs reads .asar archives as folders; copy them as files.
  process.noAsar = true;
  fs.rmSync(path.join(target, 'resources', 'default_app.asar'), { recursive: true, force: true });
  fs.cpSync(dist, target, { recursive: true, force: true });
  const exe = path.join(target, EXE_NAME);
  fs.rmSync(exe, { force: true });
  fs.renameSync(path.join(target, 'electron.exe'), exe);
  // Without this, a broken app folder would open Electron's demo page.
  fs.rmSync(path.join(target, 'resources', 'default_app.asar'), { recursive: true, force: true });
  return exe;
}

function copyApp(target) {
  const appDir = path.join(target, 'resources', 'app');
  try {
    const stat = fs.lstatSync(appDir);
    if (stat.isSymbolicLink()) {
      log(`app directory is a live link to ${ROOT}, preserving link.`);
      return appDir;
    }
  } catch {}
  fs.rmSync(appDir, { recursive: true, force: true });
  fs.mkdirSync(appDir, { recursive: true });
  for (const item of APP_FILES) {
    const from = path.join(ROOT, item);
    if (fs.existsSync(from)) fs.cpSync(from, path.join(appDir, item), { recursive: true });
  }
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  // The name decides the data folder (%APPDATA%\mirqat-widgets), so it must
  // match the development copy: notes and to-dos carry over.
  fs.writeFileSync(path.join(appDir, 'package.json'), JSON.stringify({
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
    main: pkg.main,
    private: true,
  }, null, 2));
  return appDir;
}

/**
 * Ship the verified ayat and tafsir that are already cached, so a fresh
 * install works offline from the first minute. Only records that passed the
 * two-source check are included.
 */
function copySeed(appDir) {
  const paths = require('../src/core/paths');
  // WIDGETS_SEED_DIR may point at the cache of a full verification run.
  const from = process.env.WIDGETS_SEED_DIR || paths.cache;
  const seed = path.join(appDir, 'seed', 'cache');
  fs.mkdirSync(seed, { recursive: true });
  const readJson = (f) => { try { return JSON.parse(fs.readFileSync(path.join(from, f), 'utf8')); } catch { return null; } };
  const out = { ayat: 0, tafsir: 0, hadith: 0 };

  const a = readJson('ayat.json');
  if (a) {
    const verified = Object.fromEntries(Object.entries(a.items || {}).filter(([, r]) => r && r.verified));
    out.ayat = Object.keys(verified).length;
    fs.writeFileSync(path.join(seed, 'ayat.json'), JSON.stringify({ ...a, items: verified }));
  }
  const h = readJson('hadith.json');
  if (h) {
    // Only hadith that passed verification travel with the app.
    const verified = Object.fromEntries(Object.entries(h.items || {}).filter(([, r]) => r && r.verified));
    out.hadith = Object.keys(verified).length;
    fs.writeFileSync(path.join(seed, 'hadith.json'), JSON.stringify({ ...h, items: verified, en: h.en || {} }));
  }
  for (const f of ['tafsir.json', 'chapters.json', 'hadith-pool.json', 'hadith-index.json']) {
    if (fs.existsSync(path.join(from, f))) fs.copyFileSync(path.join(from, f), path.join(seed, f));
  }
  const tf = readJson('tafsir.json');
  out.tafsir = tf ? Object.keys(tf.items || {}).length : 0;
  return out;
}

function writeUninstaller(target) {
  const ps = [
    '# Removes the desktop widgets. Your notes, tasks and settings stay in',
    '# %APPDATA%\\mirqat-widgets; delete that folder too if you want them gone.',
    "$ErrorActionPreference = 'SilentlyContinue'",
    `Stop-Process -Name '${path.basename(EXE_NAME, '.exe')}' -Force`,
    'Start-Sleep -Milliseconds 800',
    `$name = '${SHORTCUT_NAME}'`,
    "Remove-Item (Join-Path ([Environment]::GetFolderPath('Desktop')) $name) -Force",
    "Remove-Item (Join-Path ([Environment]::GetFolderPath('Programs')) $name) -Force",
    "Remove-Item (Join-Path ([Environment]::GetFolderPath('Startup')) $name) -Force",
    "Remove-Item (Join-Path ([Environment]::GetFolderPath('Startup')) 'MirqatWidgets.vbs') -Force",
    `$dir = '${target.replace(/'/g, "''")}'`,
    "Start-Process -WindowStyle Hidden -WorkingDirectory $env:TEMP cmd.exe -ArgumentList '/c', \"timeout /t 2 >nul & rmdir /s /q `\"$dir`\"\"",
    "Write-Host 'تمت إزالة ودجت سطح المكتب.'",
    '',
  ].join('\r\n');
  // PowerShell 5 needs the BOM to read the Arabic text correctly.
  fs.writeFileSync(path.join(target, 'uninstall.ps1'), Buffer.concat([Buffer.from([0xEF, 0xBB, 0xBF]), Buffer.from(ps, 'utf8')]));
  fs.writeFileSync(path.join(target, 'uninstall.cmd'), [
    '@echo off',
    'rem Removes the desktop widgets (your data in %APPDATA%\\mirqat-widgets is kept).',
    'powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0uninstall.ps1"',
    '',
  ].join('\r\n'));
}

function createDesktopShortcut(exe, icon) {
  try {
    const { app, shell } = require('electron');
    const file = path.join(app.getPath('desktop'), SHORTCUT_NAME);
    const ok = shell.writeShortcutLink(file, 'create', shortcutOptions(exe, icon));
    if (!ok) throw new Error(`could not create ${file}`);
    return file;
  } catch {
    const desktopDir = path.join(os.homedir(), 'Desktop');
    return path.join(desktopDir, SHORTCUT_NAME);
  }
}

/** Start it the way a double-click would, as an ordinary user process. */
function launch(exe) {
  const child = spawn(exe, [], { detached: true, stdio: 'ignore' });
  child.unref();
}

async function run() {
  const target = targetDir();
  log(`installing to ${target}`);
  stopRunningCopy();

  const exe = copyRuntime(target);
  log(`runtime copied, app is ${exe}`);

  const appDir = copyApp(target);
  const seed = copySeed(appDir);
  log(`app files copied; offline seed: ${seed.ayat} verified ayat, ${seed.tafsir} tafsir entries, ${seed.hadith} verified hadith`);

  const icon = path.join(appDir, 'assets', 'icon.ico');
  const desktop = createDesktopShortcut(exe, icon);
  log(`desktop shortcut: ${desktop}`);

  writeUninstaller(target);
  log('uninstaller written (uninstall.cmd)');

  if (!process.argv.includes('--no-launch')) {
    launch(exe);
    log('launched');
  }
  return 0;
}

module.exports = { run, ensureStartMenuShortcut, EXE_NAME, SHORTCUT_NAME };

if (require.main === module) {
  run().catch((err) => {
    console.error('[install] failed:', err);
    process.exit(1);
  });
}
