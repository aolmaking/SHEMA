'use strict';
/**
 * Development capture harness.
 *
 * Runs only when the app is started with --shoot. It photographs each widget
 * as it actually renders and lays the results over a wallpaper-like backdrop,
 * so the translucent themes can be judged the way they will really be seen.
 * Nothing here is loaded during a normal run.
 */

const fs = require('fs');
const path = require('path');
const { encodePng } = require('./png');

const OUT = path.join(__dirname, '..', 'shots');

/* ---------- a stand-in wallpaper: dusk over a lake with rocks ----------
   Glass can only be judged against something busy, so this paints a scene
   like the reference photo: a pink-and-blue sky, a mountain ridge, a lake
   that reflects the sky, and dark rocks in the water. */

function wallpaper(width, height) {
  const buf = Buffer.alloc(width * height * 4);
  const horizon = 0.5;
  const lerp = (a, b, t) => a + (b - a) * t;
  const mix = (c1, c2, t) => [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];
  const sky = (v) => {                        // v: 0 top .. 1 horizon
    if (v < 0.45) return mix([88, 108, 150], [196, 150, 168], v / 0.45);
    return mix([196, 150, 168], [238, 176, 150], (v - 0.45) / 0.55);
  };
  const ridge = (x) => horizon - 0.06 - 0.05 * Math.sin(x * 5.1 + 1) - 0.03 * Math.sin(x * 13.7) - 0.015 * Math.sin(x * 31);
  const rocks = [
    [0.36, 0.66, 0.11, 0.07], [0.55, 0.60, 0.07, 0.05], [0.47, 0.72, 0.16, 0.08],
    [0.20, 0.58, 0.05, 0.03], [0.72, 0.64, 0.09, 0.05], [0.86, 0.57, 0.04, 0.025],
  ];
  for (let y = 0; y < height; y++) {
    const v = y / height;
    for (let x = 0; x < width; x++) {
      const u = x / width;
      let c;
      if (v < horizon) {
        c = sky(v / horizon);
        // a few soft clouds
        const cloud = Math.max(0, Math.sin(u * 9 + v * 30) * Math.sin(u * 4.3 - v * 12)) * (1 - v / horizon) * 0.35;
        c = mix(c, [236, 196, 206], cloud);
        if (v > ridge(u)) {
          const snow = v < ridge(u) + 0.012 ? 0.5 : 0;
          c = mix([62, 70, 96], [210, 214, 228], snow);
        }
      } else {
        const r = (v - horizon) / (1 - horizon);
        const reflect = sky(Math.max(0, 1 - r * 1.4));
        c = mix(reflect, [52, 56, 82], Math.min(1, r * 0.9));
        c = mix(c, [255, 255, 255], 0.06 * Math.max(0, Math.sin(y * 0.9 + u * 40)));
      }
      for (const [rx, ry, rw, rh] of rocks) {
        const d = ((u - rx) / rw) ** 2 + ((v - ry) / rh) ** 2;
        if (d < 1) {
          const shade = 0.35 + 0.35 * (1 - (v - (ry - rh)) / (2 * rh));
          c = mix(c, [30 + 60 * shade, 32 + 60 * shade, 40 + 60 * shade], Math.min(1, (1 - d) * 6));
        }
      }
      const i = (y * width + x) * 4;
      buf[i] = Math.max(0, Math.min(255, Math.round(c[0])));
      buf[i + 1] = Math.max(0, Math.min(255, Math.round(c[1])));
      buf[i + 2] = Math.max(0, Math.min(255, Math.round(c[2])));
      buf[i + 3] = 255;
    }
  }
  return buf;
}

/** Source-over composite of a BGRA bitmap onto an RGBA canvas. */
function blitBGRA(canvas, cw, ch, bmp, bw, bh, ox, oy) {
  for (let y = 0; y < bh; y++) {
    const cy = oy + y;
    if (cy < 0 || cy >= ch) continue;
    for (let x = 0; x < bw; x++) {
      const cx = ox + x;
      if (cx < 0 || cx >= cw) continue;
      const si = (y * bw + x) * 4;
      const a = bmp[si + 3] / 255;
      if (a === 0) continue;
      const di = (cy * cw + cx) * 4;
      const sb = bmp[si], sg = bmp[si + 1], sr = bmp[si + 2];
      canvas[di]     = Math.round(sr * a + canvas[di] * (1 - a));
      canvas[di + 1] = Math.round(sg * a + canvas[di + 1] * (1 - a));
      canvas[di + 2] = Math.round(sb * a + canvas[di + 2] * (1 - a));
      canvas[di + 3] = 255;
    }
  }
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function shoot(win) {
  if (!win || win.isDestroyed()) return null;
  for (let i = 0; i < 30 && win.webContents.isLoading(); i++) await wait(150);
  let img;
  try {
    img = await win.webContents.capturePage();
  } catch {
    await wait(800);   // the page was mid-reload; one more try
    img = await win.webContents.capturePage();
  }
  const size = img.getSize();
  if (!size.width || !size.height) return null;
  return { bmp: img.toBitmap(), w: size.width, h: size.height };
}

/**
 * @param {object} ctx  handles passed in from main.js
 */
async function run(ctx) {
  const { screen } = require('electron');
  fs.mkdirSync(OUT, { recursive: true });
  const themes = (process.env.SHOOT_THEMES || 'glass').split(',').map((t) => t.trim());
  const display = screen.getPrimaryDisplay();
  const sf = display.scaleFactor || 1;

  const broadcastSettings = () => {
    for (const w of ctx.allWindows()) w.webContents.send('settings:changed', { ...ctx.settingsStore.data });
  };

  /** The whole desktop: every widget drawn where it really sits. */
  async function desktop(name, { hover = null } = {}) {
    const W = Math.round(display.bounds.width * sf);
    const H = Math.round(display.bounds.height * sf);
    const canvas = wallpaper(W, H);
    const placed = [];
    for (const [id, win] of ctx.windows) {
      if (hover === id) {
        const b = win.getBounds();
        win.webContents.sendInputEvent({ type: 'mouseMove', x: Math.round(b.width * 0.3), y: Math.round(b.height * 0.35) });
        await wait(700);
      }
      const s = await shoot(win);
      if (!s) continue;
      const b = win.getBounds();
      const ox = Math.round((b.x - display.bounds.x) * sf);
      const oy = Math.round((b.y - display.bounds.y) * sf);
      blitBGRA(canvas, W, H, s.bmp, s.w, s.h, ox, oy);
      placed.push({ id, ...b });
      if (hover === id) {
        win.webContents.sendInputEvent({ type: 'mouseMove', x: -50, y: -50 });
      }
    }
    fs.writeFileSync(path.join(OUT, `${name}.png`), encodePng(W, H, canvas));
    const area = display.workArea;
    const out = placed.filter((b) => b.x < area.x || b.y < area.y
      || b.x + b.width > area.x + area.width || b.y + b.height > area.y + area.height);
    console.log(`[shoot] ${name}.png  ${W}x${H}  work area ${area.width}x${area.height}  `
      + `${placed.length} widgets, ${out.length} outside the screen${out.length ? ` (${out.map((o) => o.id).join(', ')})` : ''}`);
  }

  /** One widget on its own, small canvas around it. */
  async function single(win, name) {
    const s = await shoot(win);
    if (!s) { console.log(`[shoot] ${name}: no capture`); return; }
    const pad = Math.round(24 * sf);
    const W = s.w + pad * 2;
    const H = s.h + pad * 2;
    const canvas = wallpaper(W, H);
    blitBGRA(canvas, W, H, s.bmp, s.w, s.h, pad, pad);
    fs.writeFileSync(path.join(OUT, `${name}.png`), encodePng(W, H, canvas));
    console.log(`[shoot] ${name}.png  ${W}x${H}`);
  }

  for (const theme of themes) {
    ctx.settingsStore.set('theme', theme);
    broadcastSettings();
    await wait(1100);
    await desktop(`desktop-${theme}`);
  }
  ctx.settingsStore.set('theme', themes[0]);
  broadcastSettings();
  await wait(800);

  // Hover state, on the clock tile.
  await desktop('desktop-hover', { hover: process.env.SHOOT_HOVER || 'pomodoro' });

  // Every size preset of the new tiles.
  for (const id of ['clock', 'calendar', 'pomodoro']) {
    const win = ctx.windows.get(id);
    if (!win) continue;
    const before = win.getBounds();
    for (const size of ['s', 'm', 'l']) {
      ctx.setWidgetSize(id, size);
      await wait(700);
      await single(win, `size-${id}-${size}`);
    }
    win.setBounds(before);
    ctx.setWidgetSize(id, ctx.WIDGETS[id].size);
    await wait(300);
  }
  ctx.resetLayout();
  await wait(500);

  // Clock faces.
  const clock = ctx.windows.get('clock');
  if (clock) {
    for (const style of ['analog', 'digital', 'ring']) {
      ctx.settingsStore.set('clock', { ...ctx.settingsStore.data.clock, style });
      broadcastSettings();
      await wait(900);
      if (style !== 'ring') await single(clock, `clock-${style}`);
    }
  }

  // Pomodoro running, and its settings side.
  const pomo = ctx.windows.get('pomodoro');
  if (pomo) {
    ctx.pomodoro.start();
    await wait(2300);
    await single(pomo, 'pomodoro-running');
    await pomo.webContents.executeJavaScript("document.querySelector('#settingsBtn').click()");
    await wait(900);
    await single(pomo, 'pomodoro-settings');
    await pomo.webContents.executeJavaScript("document.querySelector('#doneBtn').click()");
    ctx.pomodoro.reset();
    await wait(500);
  }

  // A task with notes and reminders, and its window.
  if (ctx.todos && ctx.openTask) {
    const now = Date.now();
    const items = ctx.todos.get('items', []);
    const demo = items[1] || items[0];
    if (demo) {
      demo.notes = 'المطلوب: تحليل البيانات وكتابة تقرير من صفحتين.\nأرسله على البريد قبل الساعة ١٢.';
      demo.priority = 2;
      const due = new Date(now + 2 * 86400000);
      demo.due = `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, '0')}-${String(due.getDate()).padStart(2, '0')}`;
      demo.reminders = [
        { id: 'r1', at: now - 3600e3, fired: true, firedAt: now - 3600e3 },
        { id: 'r2', at: new Date(new Date(now + 86400000).setHours(9, 0, 0, 0)).getTime(), fired: false },
        { id: 'r3', at: new Date(new Date(now + 2 * 86400000).setHours(8, 0, 0, 0)).getTime(), fired: false },
      ];
      ctx.todos.set('items', items);
      for (const w of ctx.allWindows()) w.webContents.send('todos:changed', items);
      await wait(600);
      const todoWin = ctx.windows.get('todo');
      if (todoWin) await single(todoWin, 'todo-badges');
      const tw = ctx.openTask(demo.id);
      await wait(1800);
      await single(tw || ctx.findWindow('task'), 'task');
    }
  }

  // The two secondary windows.
  for (const [name, open] of [['tafsir', ctx.openTafsir], ['settings', ctx.openSettings]]) {
    const win = name === 'tafsir' ? open(process.env.SHOOT_AYAH || '2:255') : open();
    await wait(name === 'tafsir' ? 4200 : 1600);
    await single(win || ctx.findWindow(name), name);
    if (name === 'settings') {
      const sw = ctx.findWindow('settings');
      sw.webContents.send('settings:section', 'pomodoro');
      await wait(1200);
      await single(sw, 'settings-pomodoro');
      sw.webContents.send('settings:section', 'clock');
      await wait(1200);
      await single(sw, 'settings-clock');
    }
  }

  // Hadith mode: the widget and its window.
  if (process.env.SHOOT_HADITH !== '0') {
    ctx.settingsStore.set('inspiration', 'hadith');
    broadcastSettings();
    for (const w of ctx.allWindows()) w.webContents.send('inspire:update', { kind: 'hadith', payload: await ctx.hadith.current(ctx.settingsStore.data) });
    await wait(1500);
    const qw = ctx.windows.get('quran');
    if (qw) await single(qw, 'widget-hadith');
    const cur = await ctx.hadith.current(ctx.settingsStore.data);
    const hw = ctx.openHadith(cur.hadith.id);
    await wait(3500);
    await single(hw, 'hadith-window');
    ctx.settingsStore.set('inspiration', 'quran');
    broadcastSettings();
    await wait(800);
  }

  // The new settings sections.
  const sw3 = ctx.openSettings();
  await wait(1500);
  for (const section of ['fonts-family', 'look']) {
    sw3.webContents.send('settings:section', section);
    await wait(1300);
    await single(sw3, `settings-${section}`);
  }

  // Another look: a different font, numerals and a tinted glass.
  ctx.settingsStore.set('look', { ...ctx.settingsStore.data.look, fontUi: 'cairo', fontNum: 'outfit', numWeight: 200, tint: '#7FB2E5', tintStrength: 0.3 });
  broadcastSettings();
  await wait(1500);
  await desktop('desktop-restyled');
  ctx.settingsStore.set('look', { ...ctx.settingsStore.data.look, fontUi: 'plex', fontNum: 'plex', numWeight: 300, tint: '' });
  broadcastSettings();
  await wait(800);

  // The English interface: everything but the ayah and tafsir changes.
  ctx.settingsStore.set('language', 'en');
  broadcastSettings();
  await wait(3500);
  await desktop('desktop-en');
  const tw2 = ctx.findWindow('tafsir');
  if (tw2) { await wait(2500); await single(tw2, 'tafsir-en'); }
  const sw2 = ctx.findWindow('settings');
  if (sw2) { await wait(800); await single(sw2, 'settings-en'); }
  ctx.settingsStore.set('language', 'ar');
  broadcastSettings();
  await wait(2500);

  console.log('[shoot] done');
}

module.exports = { run };
