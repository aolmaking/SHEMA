'use strict';
/**
 * End-to-end self test.
 *
 * Drives the real windows the way a person would - typing into the fields,
 * clicking the actual buttons - and then checks both the DOM and what was
 * written to disk. Run it with `npm test`; it exits non-zero on any failure.
 */

const fs = require('fs');
const path = require('path');

const results = [];
let failures = 0;

function check(name, ok, detail) {
  results.push({ name, ok, detail });
  if (!ok) failures++;
  const mark = ok ? 'ok  ' : 'FAIL';
  console.log(`  ${mark} ${name}${detail && !ok ? `  -> ${detail}` : ''}`);
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** Run an expression in a window and return its value. */
function js(win, expression) {
  return win.webContents.executeJavaScript(`(async () => { ${expression} })()`, true);
}

/** Wait until an expression in the window returns true. */
async function until(win, expression, { timeout = 8000, label = 'condition' } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      if (await js(win, `return Boolean(${expression});`)) return true;
    } catch { /* page may still be loading */ }
    await wait(120);
  }
  throw new Error(`timed out waiting for ${label}`);
}

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; }
}

/* ================================================================== */

async function testTodo(win, paths) {
  console.log('\nTo-do widget');
  await until(win, `document.querySelector('#input')`, { label: 'todo ready' });

  const before = await js(win, `return document.querySelectorAll('.task').length;`);

  // Type a task and press Enter, exactly as a person would.
  await js(win, `
    const i = document.querySelector('#input');
    i.value = 'مهمة اختبار ذاتي';
    i.dispatchEvent(new Event('input', { bubbles: true }));
    i.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    return true;
  `);
  await wait(400);

  const after = await js(win, `return document.querySelectorAll('.task').length;`);
  check('adding a task renders a new row', after === before + 1, `${before} -> ${after}`);

  const text = await js(win, `return document.querySelector('.task .task-text')?.textContent || '';`);
  check('the new task shows the text that was typed', text === 'مهمة اختبار ذاتي', text);

  await wait(500);
  const saved = readJson(paths.todos);
  check('the task reached todos.json',
    !!saved && saved.items.some((t) => t.text === 'مهمة اختبار ذاتي'),
    JSON.stringify(saved && saved.items.slice(0, 2)));

  // Tick it.
  await js(win, `document.querySelector('.task .box').click(); return true;`);
  await wait(900);
  const isDone = await js(win, `return document.querySelector('.task')?.classList.contains('done');`);
  check('clicking the checkbox marks the task done', isDone === true);

  const savedDone = readJson(paths.todos);
  check('the done state is persisted',
    !!savedDone && savedDone.items.find((t) => t.text === 'مهمة اختبار ذاتي')?.done === true);

  const summary = await js(win, `return document.querySelector('#summary').textContent;`);
  check('the counter updates', /\d+\s+من\s+\d+/.test(summary), summary);

  const barWidth = await js(win, `return document.querySelector('#bar').style.width;`);
  check('the progress bar reflects progress', /%$/.test(barWidth) && barWidth !== '0%', barWidth);

  // Filter cycles through all -> active -> done.
  await js(win, `document.querySelector('#filterBtn').click(); return true;`);
  await wait(250);
  const activeOnly = await js(win, `
    return [...document.querySelectorAll('.task')].every(t => !t.classList.contains('done'));
  `);
  check('the filter hides completed tasks', activeOnly === true);
  await js(win, `document.querySelector('#filterBtn').click(); document.querySelector('#filterBtn').click(); return true;`);
  await wait(250);

  // Delete it again so the test leaves nothing behind.
  await js(win, `
    const row = [...document.querySelectorAll('.task')]
      .find(r => r.querySelector('.task-text').textContent === 'مهمة اختبار ذاتي');
    row.querySelector('.task-del').click();
    return true;
  `);
  await wait(700);
  const gone = readJson(paths.todos);
  check('deleting removes the task from disk',
    !!gone && !gone.items.some((t) => t.text === 'مهمة اختبار ذاتي'));
}

async function testNotes(win, paths) {
  console.log('\nNotes widget');
  await until(win, `document.querySelector('#editor')`, { label: 'notes ready' });

  // The widget persists its placeholder note on boot, so read the count after
  // that has settled rather than racing it.
  await wait(600);
  const countBefore = await js(win, `return (await window.widgets.notes.get()).items.length;`);
  await js(win, `document.querySelector('#newBtn').click(); return true;`);
  await wait(400);
  const countAfter = await js(win, `return (await window.widgets.notes.get()).items.length;`);
  check('the new-note button creates a note', countAfter === countBefore + 1, `${countBefore} -> ${countAfter}`);

  await js(win, `
    const t = document.querySelector('#editor');
    t.value = 'عنوان الاختبار\\nسطر المحتوى';
    t.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  `);
  await wait(700);

  const title = await js(win, `return document.querySelector('#title').textContent;`);
  check('the first line becomes the note title', title === 'عنوان الاختبار', title);

  const savedNotes = readJson(paths.notes);
  check('the note body reached notes.json',
    !!savedNotes && savedNotes.items.some((n) => (n.body || '').includes('سطر المحتوى')));

  const meta = await js(win, `return document.querySelector('#meta').textContent;`);
  check('the word count is shown', /\d+\s+كلمة/.test(meta), meta);

  // Switch to the list and search.
  await js(win, `document.querySelector('#listBtn').click(); return true;`);
  await wait(350);
  const listShown = await js(win, `return !document.querySelector('#listPane').hidden;`);
  check('the list view opens', listShown === true);

  await js(win, `
    const s = document.querySelector('#search');
    s.value = 'عنوان الاختبار';
    s.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  `);
  await wait(300);
  const hits = await js(win, `return document.querySelectorAll('.note').length;`);
  check('search narrows the list', hits >= 1 && hits <= countAfter, String(hits));

  // Back to the editor, then remove the test note.
  await js(win, `document.querySelector('.note').click(); return true;`);
  await wait(300);
  await js(win, `document.querySelector('#delBtn').click(); document.querySelector('#delBtn').click(); return true;`);
  await wait(1100);
  const afterDelete = readJson(paths.notes);
  check('deleting the note removes it from disk',
    !!afterDelete && !afterDelete.items.some((n) => (n.body || '').includes('سطر المحتوى')));
}

async function testQuran(win) {
  console.log('\nQuran widget');
  await until(win, `document.querySelector('#ayah') && document.querySelector('#ayah').textContent.trim().length > 0`,
    { timeout: 25000, label: 'ayah text' });

  const info = await js(win, `
    return {
      text: document.querySelector('#ayah').textContent,
      place: document.querySelector('#place').textContent,
      theme: document.querySelector('#theme').textContent,
      when: document.querySelector('#when').textContent,
      cardVisible: !document.querySelector('#card').hidden,
      stateHidden: document.querySelector('#state').hidden,
    };
  `);

  check('an ayah is displayed', info.text.trim().length > 5, info.text.slice(0, 40));
  check('the text is Arabic script', /[؀-ۿ]/.test(info.text));
  check('the surah and ayah number are shown', /·\s*\d+/.test(info.place), info.place);
  check('a theme label is shown', info.theme.trim().length > 0, info.theme);
  check('the countdown to the next ayah is shown', /بعد/.test(info.when), info.when);
  check('the card is visible and no error state is showing',
    info.cardVisible === true && info.stateHidden === true);

  // The rendered text must be byte-identical to what the engine holds.
  const match = await js(win, `
    const payload = await window.widgets.quran.current({});
    return payload.ayah.text === document.querySelector('#ayah').textContent
      && payload.ayah.verified === true;
  `);
  check('the rendered text is exactly the verified source text, unmodified', match === true);

  // Forcing a change must actually move to a different ayah.
  const before = info.text;
  await js(win, `document.querySelector('#refreshBtn').click(); return true;`);
  await wait(3500);
  const after = await js(win, `return document.querySelector('#ayah').textContent;`);
  check('the refresh button moves to a different ayah', after !== before && after.trim().length > 5);
}

async function testTafsir(ctx) {
  console.log('\nTafsir window');
  const key = await js(ctx.quranWin, `return (await window.widgets.quran.current({})).ayah.key;`);
  const win = ctx.openTafsir(key);
  await until(win, `document.querySelector('#tafsir') && !document.querySelector('#tafsir').hidden
                    && document.querySelector('#tafsir').textContent.trim().length > 20`,
    { timeout: 25000, label: 'tafsir body' });

  const info = await js(win, `
    return {
      ayah: document.querySelector('#ayah').textContent,
      tafsir: document.querySelector('#tafsir').textContent,
      name: document.querySelector('#tafsirName').textContent,
      author: document.querySelector('#tafsirAuthor').textContent,
      verified: !document.querySelector('#verified').hidden,
      srcText: document.querySelector('#srcText').textContent,
      srcVerify: document.querySelector('#srcVerify').textContent,
      srcTafsir: document.querySelector('#srcTafsir').textContent,
      links: document.querySelectorAll('.link-btn').length,
      editions: document.querySelectorAll('#picker option').length,
      scripts: document.querySelectorAll('#tafsir script').length,
    };
  `);

  check('the ayah is shown in the tafsir window', info.ayah.trim().length > 5);
  check('tafsir text is present', info.tafsir.trim().length > 30, info.tafsir.slice(0, 40));
  check('the tafsir edition is named', info.name.trim().length > 2, info.name);
  check('the author is credited', info.author.trim().length > 2, info.author);
  check('the two-source verification badge is shown', info.verified === true);
  check('the text source is attributed', /Quran|القرآن/.test(info.srcText), info.srcText);
  check('the verification source is attributed', info.srcVerify.trim().length > 3, info.srcVerify);
  check('the tafsir source is attributed', info.srcTafsir.trim().length > 3, info.srcTafsir);
  check('source links are offered', info.links >= 1, String(info.links));
  check('several tafsir editions are selectable', info.editions >= 6, String(info.editions));
  check('no script survived sanitisation', info.scripts === 0);

  // The displayed tafsir must equal what the engine fetched, character for character.
  const faithful = await js(win, `
    const d = await window.widgets.quran.detail(${JSON.stringify(key)});
    const shown = document.querySelector('#tafsir').textContent.replace(/\\s+/g, ' ').trim();
    const source = d.tafsir.text.replace(/\\s+/g, ' ').trim();
    return { same: shown === source, shown: shown.slice(0, 60), source: source.slice(0, 60) };
  `);
  check('the displayed tafsir matches the source text exactly', faithful.same === true,
    `shown="${faithful.shown}" source="${faithful.source}"`);

  // Switching edition really loads a different book.
  const switched = await js(win, `
    const sel = document.querySelector('#picker');
    const other = [...sel.options].find(o => o.value !== sel.value);
    const beforeName = document.querySelector('#tafsirName').textContent;
    sel.value = other.value;
    sel.dispatchEvent(new Event('change', { bubbles: true }));
    return { target: other.value, beforeName };
  `);
  await wait(5000);
  const nowName = await js(win, `return document.querySelector('#tafsirName').textContent;`);
  check('switching the tafsir edition loads a different book',
    nowName.trim().length > 2 && nowName !== switched.beforeName, `${switched.beforeName} -> ${nowName}`);

  return win;
}

async function testSettings(ctx) {
  console.log('\nSettings and theming');
  ctx.openSettings();
  const win = ctx.findWindow('settings');
  await until(win, `document.querySelectorAll('.theme-card').length >= 5`, { label: 'settings ready' });

  const themeCount = await js(win, `return document.querySelectorAll('.theme-card').length;`);
  check('five themes are offered', themeCount === 5, String(themeCount));

  const swatches = await js(win, `return document.querySelectorAll('.swatch').length;`);
  check('accent swatches are offered', swatches >= 6, String(swatches));

  // Change the theme and confirm a widget window follows.
  await js(win, `
    const card = [...document.querySelectorAll('.theme-card')].find(c => c.dataset.theme === 'midnight');
    card.click();
    return true;
  `);
  await wait(700);
  const widgetTheme = await js(ctx.quranWin, `return document.documentElement.dataset.theme;`);
  check('changing the theme updates the open widgets', widgetTheme === 'midnight', widgetTheme);

  // Change the accent and confirm the variable propagates.
  await js(win, `
    const sw = [...document.querySelectorAll('.swatch')].find(s => s.dataset.color === '#2E9C8E');
    sw.click();
    return true;
  `);
  await wait(700);
  const accent = await js(ctx.quranWin, `
    return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  `);
  check('changing the accent updates the open widgets', accent.toLowerCase() === '#2e9c8e', accent);

  const onAccent = await js(ctx.quranWin, `
    return getComputedStyle(document.documentElement).getPropertyValue('--ink-on-accent').trim();
  `);
  check('text on the accent colour is chosen for contrast', /^#(FFFFFF|141C28)$/i.test(onAccent), onAccent);

  // Sliders.
  await js(win, `
    const r = document.querySelector('#radius');
    r.value = '14';
    r.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  `);
  await wait(600);
  const radius = await js(ctx.quranWin, `
    return getComputedStyle(document.documentElement).getPropertyValue('--radius-window').trim();
  `);
  check('the corner-radius slider changes the widgets', radius === '14px', radius);

  // Put it back.
  await js(win, `
    const r = document.querySelector('#radius'); r.value = '26';
    r.dispatchEvent(new Event('input', { bubbles: true }));
    const g = [...document.querySelectorAll('.theme-card')].find(c => c.dataset.theme === 'glass'); g.click();
    const sw = [...document.querySelectorAll('.swatch')].find(s => s.dataset.color === '#3E7CBE'); sw.click();
    return true;
  `);
  await wait(600);

  // Hiding a widget through the switch must actually close its window.
  const openBefore = ctx.windows.size;
  await js(win, `document.querySelector('#wNotes').click(); return true;`);
  await wait(900);
  check('turning a widget off closes its window', ctx.windows.size === openBefore - 1,
    `${openBefore} -> ${ctx.windows.size}`);
  await js(win, `document.querySelector('#wNotes').click(); return true;`);
  await wait(1200);
  check('turning it back on reopens it', ctx.windows.size === openBefore,
    `${ctx.windows.size}`);

  return win;
}

async function testCloseAnimation(ctx) {
  console.log('\nClose animation');
  const win = ctx.findWindow('settings');
  if (!win || win.isDestroyed()) { check('settings window available to close', false); return; }

  const staged = await js(win, `
    const { closeWindow } = window.UI;
    closeWindow({ hideOnly: true });
    await new Promise(r => requestAnimationFrame(r));
    const plate = document.querySelector('.plate');
    return {
      leaving: document.body.classList.contains('leaving'),
      opacity: getComputedStyle(plate).opacity,
      hasTransition: getComputedStyle(plate).transitionDuration !== '0s',
    };
  `);
  check('closing marks the window as leaving', staged.leaving === true);
  check('the plate has a transition to animate out', staged.hasTransition === true, staged.opacity);

  await wait(900);
  check('the window is gone after the animation',
    !ctx.findWindow('settings') || ctx.findWindow('settings').isDestroyed());
}

async function testAutostart() {
  console.log('\nStart with Windows');
  const autostart = require('../src/core/autostart');
  const was = autostart.isEnabled();

  autostart.enable();
  const file = autostart.launcherPath();
  check('enabling writes a launcher into the Startup folder', fs.existsSync(file), file);

  if (fs.existsSync(file)) {
    // The launcher is UTF-16LE, so read it through the module that wrote it
    // rather than assuming an encoding here.
    const body = autostart.readLauncher(file);
    check('the launcher starts the app hidden', /sh\.Run .*, 0, False/.test(body));
    check('the launcher points at this app',
      body.includes(path.basename(process.execPath)), body.split('\n')[3] || '');
  }

  autostart.disable();
  check('disabling removes the launcher', !fs.existsSync(file));
  if (was) autostart.enable();   // leave it as we found it
}

async function testIntegrity() {
  console.log('\nText integrity rules');
  const N = require('../src/quran/normalize');

  const same = N.verifyAgainst(
    'ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ',
    'ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ', 2, 255);
  check('two valid encodings of the same words verify as equal', same.ok === true, same.reason);

  const different = N.verifyAgainst(
    'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ',
    'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلنَّاسِ', 1, 2);
  check('genuinely different words fail verification', different.ok === false, different.reason);

  const basmala = N.verifyAgainst(
    'قُلْ هُوَ ٱللَّهُ أَحَدٌ',
    'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ قُلْ هُوَ ٱللَّهُ أَحَدٌ', 112, 1);
  check('a Basmala prefix on ayah 1 is tolerated', basmala.ok === true, basmala.reason);

  const fatiha = N.verifyAgainst(
    'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    'ٱلْحَمْدُ لِلَّهِ', 1, 1);
  check('the Basmala allowance does not apply to Al-Fatiha', fatiha.ok === false);

  const dirty = '<p>نص <script>alert(1)</script><b onclick="x()">مهم</b></p>';
  const clean = N.sanitizeTafsirHtml(dirty);
  check('scripts are stripped from tafsir html', !/script/i.test(clean), clean);
  check('event handlers are stripped', !/onclick/i.test(clean), clean);
  check('the scholar\'s words survive sanitisation',
    clean.includes('نص') && clean.includes('مهم'), clean);

  let threw = false;
  try { N.assertTextPreserved('<p>أصل النص</p>', '<p>نص مختلف</p>'); } catch { threw = true; }
  check('altered text is rejected rather than displayed', threw === true);
}

async function testSelector() {
  console.log('\nSelection engine');
  const selector = require('../src/quran/selector');
  const { AYAT } = require('../src/quran/corpus');

  const d = new Date(2026, 4, 12, 13, 15);
  const ctx = selector.buildContext(d, { intervalHours: 6 });
  const a = selector.select(ctx, [], { salt: 'test' });
  const b = selector.select(selector.buildContext(new Date(2026, 4, 12, 17, 50), { intervalHours: 6 }), [], { salt: 'test' });
  check('the same slot always yields the same ayah', a.key === b.key, `${a.key} vs ${b.key}`);

  const next = selector.select(selector.buildContext(new Date(2026, 4, 12, 18, 10), { intervalHours: 6 }), [], { salt: 'test' });
  check('a new slot yields a different ayah', next.key !== a.key, `${a.key} -> ${next.key}`);

  // A year of rotation should cover most of the corpus without quick repeats.
  let history = [];
  const seen = new Set();
  const gaps = [];
  const lastAt = {};
  for (let i = 0; i < 365 * 4; i++) {
    const t = new Date(2026, 0, 1, 0, 30).getTime() + i * 6 * 3600e3;
    const c = selector.buildContext(new Date(t), { intervalHours: 6 });
    const p = selector.select(c, history, { salt: 'test' });
    if (lastAt[p.key] !== undefined) gaps.push(i - lastAt[p.key]);
    lastAt[p.key] = i;
    seen.add(p.key);
    history.unshift({ key: p.key, themes: p.themes, at: t });
    history = history.slice(0, 900);
  }
  check('a year of rotation covers most of the corpus',
    seen.size >= AYAT.length * 0.85, `${seen.size}/${AYAT.length}`);
  check('no ayah repeats within 50 slots', Math.min(...gaps) >= 50, `min gap ${Math.min(...gaps)}`);

  // Friday should bring Friday themes forward.
  const friday = selector.buildContext(new Date(2026, 4, 15, 9, 0), { intervalHours: 6 });
  check('Friday is detected', friday.isFriday === true && friday.occasions.includes('jumua'));

  const ranked = selector.rank(friday, [], { salt: 'x' }).slice(0, 12);
  check('Friday themes rank highly on a Friday',
    ranked.some((r) => r.entry.themes.includes('jumua')));

  const nonFriday = selector.buildContext(new Date(2026, 4, 13, 9, 0), { intervalHours: 6 });
  const rankedNon = selector.rank(nonFriday, [], { salt: 'x' }).slice(0, 12);
  check('Friday themes step back on other days',
    !rankedNon.some((r) => r.entry.themes.includes('jumua')));

  // Different parts of the day should favour different themes.
  const night = selector.buildContext(new Date(2026, 4, 13, 0, 30), { intervalHours: 6 });
  const morning = selector.buildContext(new Date(2026, 4, 13, 8, 30), { intervalHours: 6 });
  check('the part of day is derived from the slot', night.part === 'night' && morning.part === 'morning',
    `${night.part} / ${morning.part}`);
  check('affinities differ between night and morning',
    JSON.stringify(night.affinity) !== JSON.stringify(morning.affinity));
}

/* ================================================================== */

/* ================================================================== */
/* Window geometry, layout and gestures                               */
/* ================================================================== */

function inside(b, a) {
  return b.x >= a.x && b.y >= a.y && b.x + b.width <= a.x + a.width && b.y + b.height <= a.y + a.height;
}

function overlaps(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

async function testGeometry(ctx) {
  console.log('\nLayout rules');
  const geo = require('../src/core/geometry');

  for (const [w, h] of [[1280, 720], [1366, 728], [1920, 1040], [1024, 600]]) {
    const area = { x: 0, y: 0, width: w, height: h };
    const placed = Object.values(ctx.computeLayout(area));
    const allIn = placed.every((b) => inside(b, area));
    let overlap = false;
    for (let i = 0; i < placed.length; i++) for (let j = i + 1; j < placed.length; j++) if (overlaps(placed[i], placed[j])) overlap = true;
    check(`default layout fits a ${w}x${h} screen without overlaps`, allIn && !overlap,
      JSON.stringify(placed));
  }

  const area = { x: 0, y: 0, width: 1280, height: 720 };
  const off = geo.clampToArea({ x: 1200, y: 690, width: 300, height: 200 }, area);
  check('a window pushed off screen is pulled back inside', inside(off, area), JSON.stringify(off));
  const huge = geo.clampToArea({ x: -50, y: -50, width: 3000, height: 3000 }, area);
  check('a window larger than the screen is shrunk to fit', inside(huge, area), JSON.stringify(huge));

  const snapped = geo.snap({ x: 1280 - 170 - 20, y: 300, width: 170, height: 170 }, area, []);
  check('dragging near the edge snaps to the margin', snapped.x === 1280 - 170 - geo.MARGIN, JSON.stringify(snapped));
  const neighbour = { x: 900, y: 100, width: 170, height: 170 };
  const beside = geo.snap({ x: 900 - 170 - 20, y: 104, width: 170, height: 170 }, area, [neighbour]);
  check('dragging near another widget lines up beside it',
    beside.x === 900 - 170 - geo.GAP && beside.y === 100, JSON.stringify(beside));

  const grown = geo.resizeFrom({ x: 100, y: 100, width: 200, height: 200 }, 'bl', -5000, 5000, area, [150, 150], [720, 720]);
  check('resizing stops at the screen edge and the size limit', inside(grown, area) && grown.width <= 720 && grown.height <= 620,
    JSON.stringify(grown));
  check('resizing from the bottom-left keeps the right edge fixed', grown.x + grown.width === 300, JSON.stringify(grown));
}

async function testWindowBounds(ctx) {
  console.log('\nMoving and resizing widgets');
  const area = ctx.workAreas()[0];
  const clock = ctx.windows.get('clock');
  const pomo = ctx.windows.get('pomodoro');
  if (!clock || !pomo) { check('clock and timer windows open', false); return; }

  const gesture = async (win, script) => { await js(win, script); await wait(450); return win.getBounds(); };

  // Drag far past the bottom-right corner, the way a fast flick would.
  const b0 = clock.getBounds();
  const sx = b0.x + 40;
  const sy = b0.y + 40;
  let b = await gesture(clock, `
    window.widgets.win.dragStart(${sx}, ${sy});
    window.widgets.win.dragMove(${sx + 4000}, ${sy + 4000});
    window.widgets.win.gestureEnd(); return true;`);
  check('dragging past the bottom-right keeps the widget on screen', inside(b, area), JSON.stringify(b));
  check('it stops right at the corner', b.x + b.width === area.x + area.width && b.y + b.height === area.y + area.height,
    JSON.stringify(b));
  check('dragging never changes the size', b.width === b0.width && b.height === b0.height, JSON.stringify(b));

  b = await gesture(clock, `
    window.widgets.win.dragStart(${b.x + 40}, ${b.y + 40});
    window.widgets.win.dragMove(-3000, -3000);
    window.widgets.win.gestureEnd(); return true;`);
  check('dragging past the top-left keeps the widget on screen', inside(b, area) && b.x === area.x && b.y === area.y,
    JSON.stringify(b));

  // Drop it a few pixels from the timer's left side: it should snap beside it.
  const p = pomo.getBounds();
  const targetX = p.x - b.width - 18;
  const targetY = p.y + 5;
  b = await gesture(clock, `
    window.widgets.win.dragStart(${b.x + 10}, ${b.y + 10});
    window.widgets.win.dragMove(${targetX + 10}, ${targetY + 10});
    window.widgets.win.gestureEnd(); return true;`);
  check('dropping near another widget snaps beside it with an even gap',
    b.x === p.x - b.width - 12 && b.y === p.y, `${JSON.stringify(b)} vs ${JSON.stringify(p)}`);

  // Resize from the grip, far beyond what is allowed.
  const before = clock.getBounds();
  b = await gesture(clock, `
    window.widgets.win.resizeStart(${before.x + 5}, ${before.y + before.height - 5}, 'bl');
    window.widgets.win.resizeMove(${before.x - 5000}, ${before.y + before.height + 5000});
    window.widgets.win.gestureEnd(); return true;`);
  const [maxW, maxH] = clock.getMaximumSize();
  check('resizing is limited to the screen', inside(b, area), JSON.stringify(b));
  check('resizing respects the widget\'s maximum size', b.width <= maxW && b.height <= maxH, JSON.stringify(b));
  check('resizing from the grip keeps the right edge in place', b.x + b.width === before.x + before.width,
    `${b.x + b.width} vs ${before.x + before.width}`);

  b = await gesture(clock, `
    window.widgets.win.resizeStart(${b.x + 5}, ${b.y + b.height - 5}, 'bl');
    window.widgets.win.resizeMove(${b.x + 5000}, ${b.y - 5000});
    window.widgets.win.gestureEnd(); return true;`);
  const [minW, minH] = clock.getMinimumSize();
  check('shrinking stops at the minimum size', b.width === minW && b.height === minH, JSON.stringify(b));

  // Size presets from the right-click menu.
  for (const [id, key] of [['calendar', 'l'], ['calendar', 's'], ['pomodoro', 'm'], ['clock', 'l']]) {
    ctx.setWidgetSize(id, key);
    await wait(250);
    const win = ctx.windows.get(id);
    const nb = win.getBounds();
    const [w, h] = ctx.WIDGETS[id].sizes[key];
    check(`${id} size "${key}" gives ${w}x${h} on screen`,
      nb.width === Math.min(w, area.width) && nb.height === Math.min(h, area.height) && inside(nb, area), JSON.stringify(nb));
  }
  const saved = ctx.settingsStore.data.widgets.clock;
  check('the chosen size is remembered', saved.size === 'l' && saved.bounds && saved.bounds.width === 352, JSON.stringify(saved));

  for (const id of Object.keys(ctx.WIDGETS)) ctx.setWidgetSize(id, ctx.WIDGETS[id].size);
  ctx.resetLayout();
  await wait(500);
  const all = [...ctx.windows.values()].map((w) => w.getBounds());
  let clash = false;
  for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) if (overlaps(all[i], all[j])) clash = true;
  check('"re-arrange" puts every widget back on screen, none overlapping', all.every((x) => inside(x, area)) && !clash,
    JSON.stringify(all));
}

/* ================================================================== */
/* Clock                                                              */
/* ================================================================== */

async function testClock(ctx) {
  console.log('\nClock widget');
  const win = ctx.windows.get('clock');
  if (!win) { check('clock window open', false); return; }
  await until(win, `document.querySelector('#time').textContent.includes(':')`, { label: 'clock time' });

  const expected = () => {
    const d = new Date();
    return `${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')}`;
  };
  const shown = await js(win, `return document.querySelector('#time').textContent;`);
  const e1 = expected();
  check('it shows the system time', shown === e1 || shown === expected(), `${shown} vs ${e1}`);

  const period = await js(win, `return document.querySelector('#sub').textContent;`);
  check('it marks ص / م', period === (new Date().getHours() < 12 ? 'ص' : 'م'), period);

  const a1 = await js(win, `return document.querySelector('#arc').getAttribute('stroke-dashoffset');`);
  await wait(1300);
  const a2 = await js(win, `return document.querySelector('#arc').getAttribute('stroke-dashoffset');`);
  check('the seconds ring moves every second', a1 !== a2, `${a1} -> ${a2}`);

  // World clocks against the time-zone database, computed independently here.
  ctx.setWidgetSize('clock', 'm');
  await wait(600);
  const zone = await js(win, `
    const row = document.querySelector('.zone[data-zone="Europe/London"]');
    return row ? { time: row.querySelector('.z-time').textContent, meta: row.querySelector('.z-meta').textContent,
      visible: getComputedStyle(row).display !== 'none' } : null;`);
  const london = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/London', hour: 'numeric', minute: '2-digit', hour12: true })
    .format(new Date()).replace(/\s?[AP]M/, '');
  check('a world clock shows the right time for its city', zone && zone.time.startsWith(london), `${zone && zone.time} vs ${london}`);
  check('world clocks appear when the clock is widened', zone && zone.visible === true);
  check('the offset from local time is shown', zone && /س|نفس/.test(zone.meta), zone && zone.meta);

  // Switch faces through the real settings path.
  await js(win, `await window.widgets.settings.set({ clock: { style: 'analog' } }); return true;`);
  await wait(700);
  const analog = await js(win, `
    const h = document.querySelector('#hHour');
    return { style: document.querySelector('#clock').dataset.style, hand: h ? h.style.transform : null };`);
  const now = new Date();
  const hourDeg = now.getHours() * 30 + now.getMinutes() * 0.5;
  const shownDeg = analog.hand ? parseFloat(analog.hand.replace(/[^\d.]/g, '')) : NaN;
  check('the analog face can be chosen', analog.style === 'analog');
  check('the hour hand points at the current hour', Math.abs(shownDeg - hourDeg) <= 1, `${shownDeg} vs ${hourDeg}`);
  await js(win, `await window.widgets.settings.set({ clock: { style: 'ring' } }); return true;`);
  ctx.setWidgetSize('clock', 's');
  await wait(400);
}

/* ================================================================== */
/* Calendar                                                           */
/* ================================================================== */

async function testCalendar(ctx) {
  console.log('\nCalendar widget');
  const win = ctx.windows.get('calendar');
  if (!win) { check('calendar window open', false); return; }
  await until(win, `document.querySelectorAll('#grid .day').length > 27`, { label: 'calendar grid' });

  const now = new Date();
  const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const info = await js(win, `
    const cells = [...document.querySelectorAll('#grid .cell')];
    const firstDay = cells.findIndex((c) => c.classList.contains('day'));
    const today = [...document.querySelectorAll('#grid .today')];
    return {
      days: document.querySelectorAll('#grid .day').length,
      firstDay,
      today: today.map((t) => t.textContent),
      weekday0: document.querySelector('#weekdays .wd').textContent,
      hijri: document.querySelector('#tHijri').textContent,
      big: document.querySelector('#tDay').textContent,
    };`);
  check('the month has the right number of days', info.days === days, `${info.days} vs ${days}`);
  check('exactly one day is marked as today, and it is today', info.today.length === 1 && info.today[0] === String(now.getDate()),
    JSON.stringify(info.today));
  const start = ctx.settingsStore.data.calendar.weekStart;
  const lead = (new Date(now.getFullYear(), now.getMonth(), 1).getDay() - start + 7) % 7;
  check('the 1st falls under the right weekday', info.firstDay === lead, `${info.firstDay} vs ${lead}`);
  check('the week starts on Saturday by default', info.weekday0 === 'س', info.weekday0);
  check('the big date is today', info.big === String(now.getDate()), info.big);

  const noon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  const hijri = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'long', year: 'numeric' })
    .formatToParts(noon).filter((p) => ['day', 'month', 'year'].includes(p.type)).map((p) => p.value);
  check('the Hijri date matches the Umm al-Qura calendar', info.hijri === `${hijri[0]} ${hijri[1]} ${hijri[2]} هـ`,
    `${info.hijri} vs ${hijri.join(' ')}`);

  await js(win, `document.querySelector('#next').click(); return true;`);
  await wait(350);
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const nextName = new Intl.DateTimeFormat('ar-EG', { month: 'long' }).format(next);
  const nav = await js(win, `return { name: document.querySelector('#mName').textContent, today: document.querySelectorAll('#grid .today').length };`);
  check('the arrows move to the next month', nav.name.startsWith(nextName) && nav.today === 0, JSON.stringify(nav));
  await js(win, `document.querySelector('#mTitle').click(); return true;`);
  await wait(350);
  const back = await js(win, `return document.querySelectorAll('#grid .today').length;`);
  check('clicking the month name returns to today', back === 1);

  await js(win, `await window.widgets.settings.set({ calendar: { hijriAdjust: 1, weekStart: 0 } }); return true;`);
  await wait(500);
  const adj = await js(win, `return { h: document.querySelector('#tHijri').textContent, w: document.querySelector('#weekdays .wd').textContent };`);
  const tomorrow = new Date(noon.getTime() + 86400000);
  const h2 = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn', { day: 'numeric' }).format(tomorrow);
  check('the Hijri correction shifts the date by a day', adj.h.startsWith(`${h2} `), `${adj.h} vs day ${h2}`);
  check('the first weekday can be changed', adj.w === 'ح', adj.w);
  await js(win, `await window.widgets.settings.set({ calendar: { hijriAdjust: 0, weekStart: 6 } }); return true;`);
  await wait(300);
}

/* ================================================================== */
/* Pomodoro                                                           */
/* ================================================================== */

async function testPomodoro(ctx) {
  console.log('\nPomodoro timer');
  const win = ctx.windows.get('pomodoro');
  if (!win) { check('timer window open', false); return; }
  const paths = require('../src/core/paths');
  const original = { ...ctx.settingsStore.data.pomodoro };

  await js(win, `await window.widgets.settings.set({ pomodoro: { focus: 1, short: 2, long: 3, every: 2, autoBreaks: true, autoFocus: false, notify: false, sound: false } }); return true;`);
  await js(win, `await window.widgets.pomodoro.act('mode', 'focus'); return true;`);
  await wait(500);
  const idle = await js(win, `return { t: document.querySelector('#remaining').textContent, s: document.querySelector('#front').dataset.status };`);
  check('a changed session length shows at once', idle.t === '01:00' && idle.s === 'idle', JSON.stringify(idle));

  await js(win, `document.querySelector('#mainBtn').click(); return true;`);
  await wait(1700);
  const run = await js(win, `return { t: document.querySelector('#remaining').textContent, s: document.querySelector('#front').dataset.status, b: document.querySelector('#mainText').textContent };`);
  check('Start runs the timer', run.s === 'running' && run.b === 'إيقاف مؤقت', JSON.stringify(run));
  check('the countdown goes down each second', run.t === '00:59' || run.t === '00:58', run.t);

  await js(win, `document.querySelector('#mainBtn').click(); return true;`);
  await wait(300);
  const p1 = await js(win, `return document.querySelector('#remaining').textContent;`);
  await wait(1500);
  const p2 = await js(win, `return { t: document.querySelector('#remaining').textContent, b: document.querySelector('#mainText').textContent };`);
  check('pausing freezes the countdown', p1 === p2.t && p2.b === 'استئناف', `${p1} / ${JSON.stringify(p2)}`);

  // Let the real timer run out: move its end to a moment from now.
  const sessionsBefore = ctx.pomodoro.snapshot().today.sessions;
  ctx.pomodoro.start();
  ctx.pomodoro.store.data.endsAt = Date.now() + 1200;
  ctx.pomodoro.arm();
  await wait(2600);
  const after = ctx.pomodoro.snapshot();
  check('when time runs out the session is counted', after.today.sessions === sessionsBefore + 1,
    `${sessionsBefore} -> ${after.today.sessions}`);
  check('a break follows and starts on its own', after.mode === 'short' && after.status === 'running', `${after.mode} ${after.status}`);
  const ui = await js(win, `return { label: document.querySelector('#label').textContent, done: document.querySelectorAll('.dot.done').length,
    stat: document.querySelector('#statSessions').textContent };`);
  check('the widget shows the break', ui.label === 'استراحة قصيرة', ui.label);
  check('the session dot fills in', ui.done === 1, String(ui.done));
  check('today\'s count updates', ui.stat === String(after.today.sessions), ui.stat);

  // Second focus session in a set of two: a long break comes next.
  ctx.pomodoro.setMode('focus');
  ctx.pomodoro.start();
  ctx.pomodoro.complete();
  check('after the set, the long break comes', ctx.pomodoro.snapshot().mode === 'long', ctx.pomodoro.snapshot().mode);

  ctx.pomodoro.flush();
  const saved = readJson(paths.pomodoro);
  check('the timer state is saved to disk', !!saved && saved.mode === 'long' && Object.keys(saved.days || {}).length >= 1);

  // The timer runs in the main process: hiding the widget does not stop it.
  ctx.pomodoro.setMode('focus');
  ctx.pomodoro.start();
  await js(win, `window.widgets.win.close(); return true;`).catch(() => {});
  await wait(700);
  check('hiding the widget leaves the timer running', ctx.pomodoro.snapshot().status === 'running');
  await js(ctx.windows.get('clock'), `await window.widgets.widgetsVisible('pomodoro', true); return true;`);
  const reopened = ctx.windows.get('pomodoro');
  await until(reopened, `document.querySelector('#front') && document.querySelector('#front').dataset.status === 'running'`,
    { label: 'reopened timer' });
  check('reopening it shows the timer still counting', true);

  ctx.pomodoro.reset();
  ctx.pomodoro.setMode('focus');
  await js(reopened, `await window.widgets.settings.set({ pomodoro: ${JSON.stringify(original)} }); return true;`);
  await wait(300);
}

/* ================================================================== */
/* Hover                                                              */
/* ================================================================== */

async function testHover(ctx) {
  console.log('\nHover effect');
  const win = ctx.windows.get('calendar');
  if (!win) { check('calendar window open', false); return; }
  const b = win.getBounds();
  const rest = await js(win, `return getComputedStyle(document.querySelector('.sheen')).opacity;`);
  win.webContents.sendInputEvent({ type: 'mouseMove', x: Math.round(b.width / 2), y: Math.round(b.height / 2) });
  await wait(700);
  const hover = await js(win, `
    const plate = document.querySelector('.plate');
    return { hover: plate.matches(':hover'), sheen: getComputedStyle(document.querySelector('.sheen')).opacity,
      actions: getComputedStyle(document.querySelector('.tile-actions')).opacity,
      mx: plate.style.getPropertyValue('--mx') };`);
  check('the glass is still at rest', Number(rest) === 0, rest);
  check('hovering lights the glass', hover.hover && Number(hover.sheen) > 0.1, JSON.stringify(hover));
  check('the light follows the pointer', /px$/.test(hover.mx), hover.mx);
  check('the controls fade in on hover', Number(hover.actions) > 0.9, hover.actions);
  win.webContents.sendInputEvent({ type: 'mouseMove', x: -40, y: -40 });
}

/* ================================================================== */
/* Task details, reminders, auto-hide                                 */
/* ================================================================== */

async function testTaskDetails(ctx) {
  console.log('\nTask details and reminders');
  const paths = require('../src/core/paths');
  const todo = ctx.windows.get('todo');
  if (!todo) { check('todo window open', false); return; }

  // A fresh task to work on.
  await js(todo, `
    const i = document.querySelector('#input');
    i.value = 'مهمة التفاصيل';
    i.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    return true;`);
  await wait(600);
  const id = await js(todo, `return [...document.querySelectorAll('.task')].find(r => r.querySelector('.task-text').textContent === 'مهمة التفاصيل')?.dataset.id || null;`);
  check('a task row exists to open', Boolean(id));
  if (!id) return;

  const hasMore = await js(todo, `return Boolean(document.querySelector('.task[data-id="${id}"] .task-more'));`);
  check('each task has a ⋯ button', hasMore === true);

  await js(todo, `document.querySelector('.task[data-id="${id}"] .task-more').click(); return true;`);
  let win = null;
  for (let i = 0; i < 40 && !win; i++) { await wait(150); win = ctx.findWindow('task'); }
  check('the ⋯ button opens the task window', Boolean(win));
  if (!win) return;
  await until(win, `document.querySelector('#text') && document.querySelector('#text').value === 'مهمة التفاصيل'`, { label: 'task window' });
  check('the task window shows that task', true);

  // Notes.
  await js(win, `
    const n = document.querySelector('#notes');
    n.value = 'سطر أول من الملاحظات\\nسطر ثانٍ';
    n.dispatchEvent(new Event('input', { bubbles: true }));
    return true;`);
  await wait(900);
  let saved = readJson(paths.todos);
  let task = saved && saved.items.find((x) => x.id === id);
  check('notes typed in the task window are saved', task && task.notes === 'سطر أول من الملاحظات\nسطر ثانٍ', JSON.stringify(task && task.notes));

  // Two reminders: one from a quick choice, one from the date picker.
  await js(win, `document.querySelectorAll('#quick .chip')[1].click(); return true;`);
  await wait(500);
  await js(win, `
    const d = new Date(Date.now() + 3 * 3600e3); d.setSeconds(0, 0);
    const p = (n) => String(n).padStart(2, '0');
    document.querySelector('#when').value = d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + 'T' + p(d.getHours()) + ':' + p(d.getMinutes());
    document.querySelector('#addReminder').click();
    return true;`);
  await wait(700);
  saved = readJson(paths.todos);
  task = saved.items.find((x) => x.id === id);
  check('more than one reminder can be added', task && (task.reminders || []).length === 2, JSON.stringify(task && task.reminders));
  const shownReminders = await js(win, `return document.querySelectorAll('#reminders .reminder').length;`);
  check('the reminders are listed in the window', shownReminders === 2, String(shownReminders));

  const badge = await js(todo, `return Boolean(document.querySelector('.task[data-id="${id}"] .badge.bell'));`);
  check('the task row shows a reminder badge', badge === true);

  // Priority and due date.
  await js(win, `document.querySelector('#priority button[data-p="2"]').click(); return true;`);
  await js(win, `const d = document.querySelector('#due'); d.value = '2030-05-04'; d.dispatchEvent(new Event('change', { bubbles: true })); return true;`);
  await wait(700);
  const row = await js(todo, `
    const r = document.querySelector('.task[data-id="${id}"]');
    return { p2: r.classList.contains('p2'), prio: Boolean(r.querySelector('.badge.prio.p2')), due: Boolean(r.querySelector('.badge.due')) };`);
  check('priority shows on the task row', row.p2 && row.prio, JSON.stringify(row));
  check('the due date shows on the task row', row.due, JSON.stringify(row));

  // A reminder that falls due fires and is marked as done.
  const all = ctx.todos.get('items', []);
  const live = all.find((x) => x.id === id);
  live.reminders.push({ id: 'soon', at: Date.now() + 1200, fired: false });
  ctx.todos.set('items', all);
  ctx.reminders.schedule();
  await wait(2600);
  const fired = ctx.todos.get('items', []).find((x) => x.id === id).reminders.find((r) => r.id === 'soon');
  check('a reminder goes off at its time', fired && fired.fired === true, JSON.stringify(fired));
  check('it is reported for a notification', ctx.lastReminders().some((r) => r.task === id));
  await wait(400);
  const firedRow = await js(win, `return document.querySelectorAll('#reminders .reminder.fired').length;`);
  check('the window marks it as reminded', firedRow === 1, String(firedRow));

  await js(win, `document.querySelector('#reminders .reminder.fired .chip').click(); return true;`);
  await wait(600);
  const snoozed = ctx.todos.get('items', []).find((x) => x.id === id).reminders.find((r) => r.id === 'soon');
  check('snooze sets it again for later', snoozed && snoozed.fired === false && snoozed.at > Date.now() + 8 * 60e3, JSON.stringify(snoozed));

  // Finished tasks leave the list after their time.
  await js(win, `const s = document.querySelector('#hideAfter'); s.value = '1'; s.dispatchEvent(new Event('change', { bubbles: true })); return true;`);
  await js(win, `document.querySelector('#doneBox').click(); return true;`);
  await wait(600);
  const items2 = ctx.todos.get('items', []);
  items2.find((x) => x.id === id).doneAt = Date.now() - 2 * 3600e3;   // finished two hours ago
  ctx.todos.set('items', items2);
  await js(todo, `await window.widgets.todos.set(await window.widgets.todos.get()); return true;`);
  await wait(600);
  const gone = await js(todo, `return !document.querySelector('.task[data-id="${id}"]');`);
  check('a finished task disappears after the hours set for it', gone === true);
  await js(todo, `const b = document.querySelector('#filterBtn'); b.click(); b.click(); return true;`);
  await wait(300);
  const inDone = await js(todo, `return Boolean(document.querySelector('.task[data-id="${id}"]'));`);
  check('it is still reachable in the "done" view', inDone === true);
  await js(todo, `document.querySelector('#filterBtn').click(); return true;`);

  // The general setting applies to tasks without their own.
  const other = { id: 'old-done', text: 'منجزة قديمة', done: true, doneAt: Date.now() - 30 * 3600e3, createdAt: Date.now() - 40 * 3600e3 };
  ctx.todos.set('items', [other, ...ctx.todos.get('items', [])]);
  await js(todo, `await window.widgets.todos.set(await window.widgets.todos.get()); return true;`);
  await js(todo, `await window.widgets.settings.set({ todo: { hideDoneAfterHours: 24 } }); return true;`);
  await wait(600);
  const goneGeneral = await js(todo, `return !document.querySelector('.task[data-id="old-done"]');`);
  check('the general "hide after" setting hides older finished tasks', goneGeneral === true);
  await js(todo, `await window.widgets.settings.set({ todo: { hideDoneAfterHours: 0 } }); return true;`);
  await wait(400);
  const back = await js(todo, `return Boolean(document.querySelector('.task[data-id="old-done"]'));`);
  check('setting it to "never" brings them back', back === true);

  // Delete from the window.
  await js(win, `const b = document.querySelector('#deleteBtn'); b.click(); b.click(); return true;`);
  await wait(800);
  check('the task can be deleted from its window', !ctx.todos.get('items', []).some((x) => x.id === id));
  ctx.todos.set('items', ctx.todos.get('items', []).filter((x) => x.id !== 'old-done'));
  await js(todo, `await window.widgets.todos.set(await window.widgets.todos.get()); return true;`);
}

/* ================================================================== */
/* Text size, glass, clock digits                                     */
/* ================================================================== */

async function testLook(ctx) {
  console.log('\nText size and glass');
  const clock = ctx.windows.get('clock');
  const todo = ctx.windows.get('todo');
  const fsOf = (w) => js(w, `return getComputedStyle(document.documentElement).getPropertyValue('--fs').trim();`);

  const before = await js(clock, `return parseFloat(getComputedStyle(document.querySelector('#time')).fontSize);`);
  check('the clock digits are large', before >= 34, `${before}px`);

  await js(clock, `await window.widgets.settings.set({ fontScales: { clock: 1.3 } }); return true;`);
  await wait(1300);
  const fsClock = await fsOf(clock);
  const fsTodo = await fsOf(todo);
  check('a text size applies to its own widget', fsClock === '1.3', fsClock);
  check('…and leaves the others alone', fsTodo === '1', fsTodo);
  const date1 = await js(clock, `return parseFloat(getComputedStyle(document.querySelector('#dateline')).fontSize);`);
  check('the clock\'s text grows with it', date1 > 13, `${date1}px`);
  const fits = await js(clock, `
    const face = document.querySelector('#face').getBoundingClientRect();
    const time = document.querySelector('#time').getBoundingClientRect();
    return time.width <= face.width + 1;`);
  check('larger clock digits still fit inside the face', fits === true);
  await js(clock, `await window.widgets.settings.set({ fontScales: { clock: 1 } }); return true;`);

  // Glass: widgets and full windows separately.
  ctx.openSettings();
  await wait(1200);
  const sw = ctx.findWindow('settings');
  await js(clock, `await window.widgets.settings.set({ glass: { widgets: 0, windows: 1 } }); return true;`);
  await wait(500);
  const solidW = await js(sw, `return getComputedStyle(document.documentElement).getPropertyValue('--solidity').trim();`);
  const solidC = await js(clock, `return getComputedStyle(document.documentElement).getPropertyValue('--solidity').trim();`);
  check('full windows can be made solid', solidW === '1', solidW);
  check('widgets keep their own glass setting', solidC === '0', solidC);
  const sliders = await js(sw, `return Boolean(document.querySelector('#glassWidgets') && document.querySelector('#glassWindows'));`);
  check('settings has a glass slider for each', sliders === true);
  const fontRows = await js(sw, `return document.querySelectorAll('#fontRows input[type=range]').length;`);
  check('settings has a text-size slider per widget and window', fontRows === 10, String(fontRows));
  await js(clock, `await window.widgets.settings.set({ glass: { widgets: 0, windows: 0.75 } }); return true;`);
}

/* ================================================================== */
/* English                                                            */
/* ================================================================== */

async function testEnglish(ctx) {
  console.log('\nEnglish interface');
  const quranBefore = await js(ctx.windows.get('quran'), `return document.querySelector('#ayah').textContent;`);

  await js(ctx.windows.get('clock'), `await window.widgets.settings.set({ language: 'en' }); return true;`);
  await wait(2500);   // every page reloads itself

  const todo = ctx.windows.get('todo');
  await until(todo, `document.querySelector('.head-title') && document.querySelector('.head-title').textContent === 'Tasks'`, { label: 'english todo', timeout: 8000 }).catch(() => {});
  const t1 = await js(todo, `return { title: document.querySelector('.head-title').textContent, dir: document.documentElement.dir, ph: document.querySelector('#input').placeholder };`);
  check('the to-do widget switches to English', t1.title === 'Tasks' && t1.ph === 'Add a task…', JSON.stringify(t1));
  check('the layout turns left-to-right', t1.dir === 'ltr', t1.dir);

  const clock = ctx.windows.get('clock');
  await until(clock, `/AM|PM/.test(document.querySelector('#sub').textContent)`, { label: 'english clock' }).catch(() => {});
  const c1 = await js(clock, `return { sub: document.querySelector('#sub').textContent, date: document.querySelector('#dateline').textContent };`);
  check('the clock shows AM/PM and an English date', /AM|PM/.test(c1.sub) && /[A-Za-z]/.test(c1.date), JSON.stringify(c1));

  const cal = ctx.windows.get('calendar');
  await until(cal, `document.querySelector('#tHijri').textContent.includes('AH')`, { label: 'english calendar' }).catch(() => {});
  const k1 = await js(cal, `return { hijri: document.querySelector('#tHijri').textContent, wd: document.querySelector('#weekdays .wd').textContent };`);
  check('the calendar is in English, Hijri included', /AH$/.test(k1.hijri) && /^[A-Z]/.test(k1.wd), JSON.stringify(k1));

  const pomo = ctx.windows.get('pomodoro');
  await until(pomo, `document.querySelector('#mainText').textContent === 'Start'`, { label: 'english timer' }).catch(() => {});
  const p1 = await js(pomo, `return { main: document.querySelector('#mainText').textContent, label: document.querySelector('#label').textContent };`);
  check('the timer is in English', p1.main === 'Start' && p1.label === 'Study', JSON.stringify(p1));

  // The Quran text itself never changes language.
  const quran = ctx.windows.get('quran');
  await until(quran, `document.querySelector('#ayah').textContent.length > 5`, { label: 'english quran', timeout: 15000 });
  const q1 = await js(quran, `
    const a = document.querySelector('#ayah');
    const payload = await window.widgets.quran.current({});
    return { text: a.textContent, same: a.textContent === payload.ayah.text, dir: a.dir, lang: a.lang,
      hint: document.querySelector('[data-i18n="quran.tafsir"]').textContent };`);
  check('the ayah stays Arabic, right-to-left, in English mode', q1.dir === 'rtl' && q1.lang === 'ar' && /[؀-ۿ]/.test(q1.text), JSON.stringify(q1).slice(0, 120));
  check('the ayah is still exactly the verified source text', q1.same === true && q1.text === quranBefore);
  check('the labels around it are English', q1.hint === 'Tafsir', q1.hint);

  const key = await js(quran, `return (await window.widgets.quran.current({})).ayah.key;`);
  const tw = ctx.openTafsir(key);
  await until(tw, `document.querySelector('#tafsir') && !document.querySelector('#tafsir').hidden && document.querySelector('#tafsir').textContent.length > 20`, { timeout: 20000, label: 'english tafsir' });
  const f1 = await js(tw, `
    const d = await window.widgets.quran.detail(${JSON.stringify(key)});
    const shown = document.querySelector('#tafsir').textContent.replace(/\\s+/g, ' ').trim();
    return { same: shown === d.tafsir.text.replace(/\\s+/g, ' ').trim(), dir: document.querySelector('#tafsir').dir,
      label: document.querySelector('[data-i18n="tf.verified"]').textContent, arabic: /[\\u0600-\\u06FF]/.test(shown) };`);
  check('the tafsir stays Arabic and identical to the source', f1.same && f1.arabic && f1.dir === 'rtl', JSON.stringify(f1));
  check('the tafsir window\'s labels are English', f1.label === 'Text matched across two sources', f1.label);

  ctx.openSettings();
  await wait(1500);
  const sw = ctx.findWindow('settings');
  await until(sw, `document.querySelector('.head-title').textContent === 'Settings'`, { label: 'english settings' }).catch(() => {});
  const s1 = await js(sw, `return { title: document.querySelector('.head-title').textContent, lang: document.querySelector('#language').value };`);
  check('the settings window is in English', s1.title === 'Settings' && s1.lang === 'en', JSON.stringify(s1));

  // And back.
  await js(sw, `await window.widgets.settings.set({ language: 'ar' }); return true;`);
  await wait(2500);
  const t2 = await js(ctx.windows.get('todo'), `return { title: document.querySelector('.head-title').textContent, dir: document.documentElement.dir };`);
  check('switching back restores Arabic', t2.title === 'المهام' && t2.dir === 'rtl', JSON.stringify(t2));
}

/* ================================================================== */
/* Larger corpus, hadith verification rules                           */
/* ================================================================== */

async function testCorpusAndHadithRules() {
  console.log('\nCorpus size and hadith rules');
  const { AYAT } = require('../src/quran/corpus');
  const fs = require('fs');
  check('the Quran corpus has grown well beyond the first version', AYAT.length >= 600, String(AYAT.length));
  check('every corpus entry is a reference, not text', AYAT.every((a) => /^\d{1,3}:\d{1,3}$/.test(a.key)));
  const ext = fs.readFileSync(require.resolve('../src/quran/corpus-extended'), 'utf8');
  // Only comments may contain Arabic; the data is numbers and theme ids.
  const code = ext.split('\n').filter((l) => !l.trim().startsWith('//') && !l.trim().startsWith('*') && !l.trim().startsWith('/*')).join('\n');
  check('the extended corpus file contains no Arabic text at all', !/[؀-ۿ]/.test(code));

  const V = require('../src/hadith/verify');
  const refs = V.parseRefs('صحيح البخاري (8/ 35) (6149)، صحيح مسلم (4/ 1811) (2323)، النهاية في غريب الحديث والأثر (382).');
  check('references with several books on one line are read correctly',
    JSON.stringify(refs) === JSON.stringify([{ book: 'bukhari', n: 6149 }, { book: 'muslim', n: 2323 }]), JSON.stringify(refs));
  check('a bibliography without numbers gives nothing to check', V.parseRefs('صحيح مسلم، تحقيق محمد فؤاد عبد الباقي، 1417هـ.').length === 0);
  check('only sound grades pass', V.gradeOk('صحيح') && V.gradeOk('حسن') && !V.gradeOk('ضعيف') && !V.gradeOk('موضوع'));
  check('a weak grading by al-Albani rules a Sunan hadith out',
    !V.collectionGradeOk([{ name: 'Al-Albani', grade: 'Daif' }, { name: 'Other', grade: 'Sahih' }]));
  check('a sound grading by al-Albani lets it through', V.collectionGradeOk([{ name: 'Al-Albani', grade: 'Hasan Sahih' }]));
  const close = V.coverage('أول ما يقضى بين الناس في الدماء', 'حدثنا عبيد الله قال النبي صلى الله عليه وسلم أول ما يقضى بين الناس في الدماء');
  const far = V.coverage('أول ما يقضى بين الناس في الدماء', 'حدثنا فلان قال من صام رمضان إيمانا واحتسابا غفر له');
  check('the same words are found in the cited collection', V.passes(close), JSON.stringify(close));
  check('different words are not', !V.passes(far), JSON.stringify(far));
}

/* ================================================================== */
/* Hadith mode in the widget                                          */
/* ================================================================== */

async function testHadithMode(ctx) {
  console.log('\nHadith mode');
  const quran = ctx.windows.get('quran');
  if (!quran) { check('reflection widget open', false); return; }
  await js(quran, `await window.widgets.settings.set({ inspiration: 'hadith' }); return true;`);
  await until(quran, `document.querySelector('#ayah').classList.contains('hadith') && document.querySelector('#ayah').textContent.length > 20`,
    { timeout: 45000, label: 'hadith in widget' }).catch(() => {});
  const w = await js(quran, `
    const node = document.querySelector('#ayah');
    const r = await window.widgets.inspire.current({});
    return { kind: r.kind, hadith: node.classList.contains('hadith'), same: r.kind === 'hadith' && node.textContent === r.payload.hadith.text,
      verified: r.kind === 'hadith' && r.payload.hadith.verified, grade: r.kind === 'hadith' ? r.payload.hadith.grade : '',
      book: r.kind === 'hadith' ? r.payload.hadith.verification.book : '', hint: document.querySelector('#hintLabel').textContent,
      dir: node.dir, lang: node.lang, id: r.kind === 'hadith' ? r.payload.hadith.id : null };`);
  check('choosing hadith makes the widget show one', w.kind === 'hadith' && w.hadith, JSON.stringify(w));
  check('the hadith shown is exactly the source text', w.same === true);
  check('it passed verification against a hadith collection', w.verified === true && Boolean(w.book), `${w.book}`);
  check('its grade is sound', /صحيح|حسن/.test(w.grade), w.grade);
  check('the card offers the explanation', w.hint === 'الشرح', w.hint);
  check('the hadith stays Arabic, right-to-left', w.dir === 'rtl' && w.lang === 'ar');

  if (w.id) {
    const hw = ctx.openHadith(w.id);
    await until(hw, `document.querySelector('#content') && !document.querySelector('#content').hidden`, { timeout: 30000, label: 'hadith window' });
    const d = await js(hw, `
      const data = await window.widgets.hadith.detail(${JSON.stringify(w.id)});
      return { text: document.querySelector('#text').textContent === data.hadith.text,
        explanation: document.querySelector('#explanation').textContent === data.hadith.explanation && data.hadith.explanation.length > 20,
        verified: !document.querySelector('#verified').hidden, grade: document.querySelector('#grade').textContent,
        refs: document.querySelector('#srcRefs').textContent === data.hadith.reference, links: document.querySelectorAll('.link-btn').length,
        scripts: document.querySelectorAll('#content script').length };`);
    check('the hadith window shows the hadith unchanged', d.text === true);
    check('it shows the explanation exactly as published', d.explanation === true);
    check('it shows the verification badge', d.verified === true);
    check('it shows the grade', /صحيح|حسن/.test(d.grade), d.grade);
    check('it shows the references verbatim', d.refs === true);
    check('it links to the encyclopedia and to the collection', d.links >= 2, String(d.links));
  }

  await js(quran, `await window.widgets.settings.set({ inspiration: 'quran' }); return true;`);
  await until(quran, `!document.querySelector('#ayah').classList.contains('hadith')`, { timeout: 20000, label: 'back to quran' }).catch(() => {});
  const back = await js(quran, `return !document.querySelector('#ayah').classList.contains('hadith') && document.querySelector('#hintLabel').textContent === 'التفسير';`);
  check('switching back shows an ayah with its tafsir', back === true);
}

/* ================================================================== */
/* Resizing from any edge, locking, fonts and glass                   */
/* ================================================================== */

async function testFlexibleSizes(ctx) {
  console.log('\nSizes, edges and lock');
  const geo = require('../src/core/geometry');
  const A = { x: 0, y: 0, width: 1280, height: 720 };
  const s0 = { x: 500, y: 200, width: 200, height: 200 };
  const n = geo.resizeFrom(s0, 'n', 0, -50, A, [130, 120], [4000, 4000]);
  const w = geo.resizeFrom(s0, 'w', -60, 0, A, [130, 120], [4000, 4000]);
  const ne = geo.resizeFrom(s0, 'ne', 40, -500, A, [130, 120], [4000, 4000]);
  check('dragging the top edge grows upward, bottom fixed', n.y === 150 && n.height === 250 && n.y + n.height === 400, JSON.stringify(n));
  check('dragging the left edge grows left, right fixed', w.x === 440 && w.x + w.width === 700, JSON.stringify(w));
  check('a corner stops at the top of the screen', ne.y === 0 && ne.width === 240, JSON.stringify(ne));

  const catalog = await js(ctx.windows.get('todo'), `return await window.widgets.catalog();`);
  check('every widget has five size presets', Object.values(catalog).every((c) => c.sizes.length === 5), JSON.stringify(Object.values(catalog).map((c) => c.sizes)));

  const clock = ctx.windows.get('clock');
  const b0 = clock.getBounds();
  await js(clock, `window.widgets.win.resizeStart(${b0.x + 50}, ${b0.y + 1}, 'n'); window.widgets.win.resizeMove(${b0.x + 50}, ${b0.y - 40}); window.widgets.win.gestureEnd(); return true;`);
  await wait(400);
  const b1 = clock.getBounds();
  check('a real widget can be resized from its top edge', b1.height > b0.height && b1.y + b1.height === b0.y + b0.height, `${JSON.stringify(b0)} -> ${JSON.stringify(b1)}`);
  const handles = await js(clock, `return document.querySelectorAll('.rz').length;`);
  check('every edge and corner has a resize handle', handles === 8, String(handles));

  const exact = await js(ctx.windows.get('todo'), `return await window.widgets.widgetBounds('clock', 260, 210);`);
  check('an exact size can be typed in', exact && exact.width === 260 && exact.height === 210, JSON.stringify(exact));

  await js(clock, `await window.widgets.widgetLock('clock', true); return true;`);
  await wait(300);
  const before = clock.getBounds();
  await js(clock, `window.widgets.win.dragStart(${before.x + 20}, ${before.y + 20}); window.widgets.win.dragMove(${before.x - 200}, ${before.y + 200}); window.widgets.win.gestureEnd(); return true;`);
  await wait(400);
  const after = clock.getBounds();
  check('a locked widget does not move', after.x === before.x && after.y === before.y, `${JSON.stringify(before)} -> ${JSON.stringify(after)}`);
  const hidden = await js(clock, `return getComputedStyle(document.querySelector('.rz')).display === 'none' && document.documentElement.dataset.locked === '1';`);
  check('a locked widget hides its handles', hidden === true);
  await js(clock, `await window.widgets.widgetLock('clock', false); return true;`);
  ctx.resetLayout();
  await wait(400);
}

async function testLookSettings(ctx) {
  console.log('\nFonts and glass settings');
  const clock = ctx.windows.get('clock');
  const todo = ctx.windows.get('todo');
  await js(todo, `await window.widgets.settings.set({ look: { fontUi: 'cairo', fontNum: 'outfit', numWeight: 500, motion: 0, tint: '#7FB2E5', contrast: 'high', borderWidth: 2, density: 'roomy' } }); return true;`);
  await wait(700);
  const r = await js(clock, `
    const root = document.documentElement;
    return { ui: getComputedStyle(document.body).fontFamily, num: getComputedStyle(document.querySelector('#time')).fontFamily,
      weight: getComputedStyle(document.querySelector('#time')).fontWeight, motion: root.dataset.motion,
      tint: root.style.getPropertyValue('--tint-layer'), contrast: root.dataset.contrast,
      border: getComputedStyle(document.querySelector('.plate')).borderTopWidth,
      fontReady: document.fonts.check('16px Cairo') && document.fonts.check('16px Outfit') };`);
  check('the interface font can be changed', /Cairo/.test(r.ui), r.ui);
  check('the numerals font can be changed separately', /Outfit/.test(r.num), r.num);
  check('the numerals weight can be changed', r.weight === '500', r.weight);
  check('the chosen fonts are bundled and load offline', r.fontReady === true);
  check('motion can be switched off', r.motion === 'off', r.motion);
  check('the glass can be tinted', /color-mix/.test(r.tint), r.tint);
  check('text contrast can be raised', r.contrast === 'high');
  check('the border width can be changed', r.border === '2px', r.border);
  const pad = await js(todo, `return getComputedStyle(document.documentElement).getPropertyValue('--pad').trim();`);
  check('spacing density can be changed', pad === '23px', pad);
  await js(todo, `await window.widgets.settings.set({ look: { fontUi: 'plex', fontNum: 'plex', numWeight: 300, motion: 1, tint: '', contrast: 'normal', borderWidth: 1, density: 'normal' } }); return true;`);
  await wait(400);
}

async function run(ctx) {
  const paths = require('../src/core/paths');
  // Never touch the real Startup folder from a test.
  process.env.WIDGETS_STARTUP_DIR = require('path').join(paths.root, 'startup-test');
  // Tests must not pop real notifications on the desktop.
  process.env.WIDGETS_SILENT = '1';
  console.log('\n=== self test ===');
  console.log(`data dir: ${paths.root}`);

  try {
    await testIntegrity();
    await testSelector();
    await testGeometry(ctx);
    await testCorpusAndHadithRules();

    const todoWin = ctx.windows.get('todo');
    const notesWin = ctx.windows.get('notes');
    ctx.quranWin = ctx.windows.get('quran');

    if (todoWin) await testTodo(todoWin, paths); else check('todo window open', false);
    if (notesWin) await testNotes(notesWin, paths); else check('notes window open', false);
    if (ctx.quranWin) await testQuran(ctx.quranWin); else check('quran window open', false);
    if (ctx.quranWin) await testTafsir(ctx);
    await testSettings(ctx);
    await testClock(ctx);
    await testCalendar(ctx);
    await testPomodoro(ctx);
    await testHover(ctx);
    await testTaskDetails(ctx);
    await testLook(ctx);
    await testEnglish(ctx);
    await testHadithMode(ctx);
    await testFlexibleSizes(ctx);
    await testLookSettings(ctx);
    await testWindowBounds(ctx);
    await testCloseAnimation(ctx);
    await testAutostart();
  } catch (err) {
    check(`test run completed (${err.message})`, false, err.stack);
  }

  const passed = results.length - failures;
  console.log(`\n=== ${passed}/${results.length} checks passed ===`);
  if (failures) {
    console.log('\nfailures:');
    for (const r of results.filter((x) => !x.ok)) console.log(`  - ${r.name}${r.detail ? `: ${r.detail}` : ''}`);
  }
  return failures;
}

module.exports = { run };
