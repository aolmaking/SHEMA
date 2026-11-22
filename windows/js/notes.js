'use strict';
/* Notes widget: one editor, many notes, autosave, search, 4 page styles, to-do checklist, voice recording. */

const { $, el, icon, boot, closeWindow, uid, timeAgo, debounce, t, translate, strings, digits, confirmDelete } = window.UI;

strings({
  ar: {
    'notes.title': 'الملاحظات',
    'notes.all': 'كل الملاحظات',
    'notes.new': 'ملاحظة جديدة',
    'notes.ph': 'اكتب ما يخطر لك…\nأول سطر يصير عنوان الملاحظة.',
    'notes.delete': 'حذف',
    'notes.confirm': 'اضغط مرة أخرى للحذف',
    'notes.search': 'ابحث…',
    'notes.none': 'لا توجد نتائج.',
    'notes.untitled': 'ملاحظة بلا عنوان',
    'notes.empty': 'فارغة',
    'notes.count': '{n} ملاحظة',
    'notes.results': '{n} نتيجة',
    'notes.meta': '{n} كلمة · {when}',
    'notes.todo': 'مهام',
    'notes.todoList': 'قائمة المهام',
    'notes.collapseChecklist': 'طي قائمة المهام',
    'notes.expandChecklist': 'توسيع قائمة المهام',
    'notes.voice': 'تسجيل صوت',
    'notes.saveVoice': 'حفظ',
    'notes.newNoteTitle': 'إنشاء ملاحظة جديدة',
    'notes.chooseTemplate': '1. اختر نوع الصفحة:',
    'notes.chooseColor': '2. اختر لون الورق:',
    'notes.createBtn': '✓ إنشاء الملاحظة',
    'notes.styleRuled': 'مسطّر',
    'notes.styleRuledDesc': 'سطور أفقية كلاسيكية مع هامش جانبي',
    'notes.styleGrid': 'مربعات',
    'notes.styleGridDesc': 'شبكة مربعات هندسية دقيقة',
    'notes.styleBook': 'صفحة كتاب',
    'notes.styleBookDesc': 'تصميم كتاب وهوامش قراءة مريحة',
    'notes.stylePlanner': 'مفكرة مهام',
    'notes.stylePlannerDesc': 'مفكرة لجدولة المهام والأولويات',
    'notes.pin': 'تثبيت',
    'notes.unpin': 'إلغاء التثبيت',
    'notes.pinNote': 'تثبيت الملاحظة في الأعلى',
    'notes.pinnedTitle': 'الملاحظات المثبتة',
    'notes.allNotesTitle': 'جميع الملاحظات',
    'notes.chooseFont': 'اختر شكل الخط:',
    'notes.tagAll': 'الكل',
    'notes.tagPinned': 'مثبتة',
    'notes.tagVoice': 'صوتي',
    'notes.tagTodo': 'مهام',
    'notes.colorWhite': 'أبيض',
    'notes.colorYellow': 'أصفر',
    'notes.colorBlue': 'أزرق',
    'notes.colorGreen': 'أخضر',
    'notes.colorRose': 'وردي',
    'notes.colorPurple': 'بنفسجي',
    'notes.colorDark': 'داكن',
    'notes.formatTitle': 'تنسيق النص والخط',
    'notes.tierTitle': 'عنوان رئيسي',
    'notes.tierHeading': 'عنوان فرعي',
    'notes.tierSubheading': 'ترويسة',
    'notes.tierBody': 'نص عادي',
    'notes.fontModern': 'حديث',
    'notes.fontModernDesc': 'واجهة عصرية سلسة',
    'notes.fontHand': 'يدوي',
    'notes.fontHandDesc': 'خط يدوي انسيابي',
    'notes.fontSerif': 'نسخ',
    'notes.fontSerifDesc': 'كتاب طباعي كلاسيكي',
    'notes.fontMono': 'هندسي',
    'notes.fontMonoDesc': 'أحرف متساوية العرض',
    'notes.alignRight': 'محاذاة لليمين',
    'notes.alignCenter': 'توسيط النص',
    'notes.alignLeft': 'محاذاة لليسار',
    'notes.alignJustify': 'ضبط الأطراف',
    'notes.bold': 'عريض (Ctrl+B)',
    'notes.italic': 'مائل (Ctrl+I)',
    'notes.underline': 'تسطير (Ctrl+U)',
    'notes.strike': 'شطب',
    'notes.addTodoPh': 'اكتب مهمة واضغط Enter…',
    'notes.addItem': 'بند جديد',
    'notes.micError': 'تعذر الوصول للميكروفون. يرجى التحقق من الأذونات وتوصيل المايك.',
    'notes.voiceMemo': 'تسجيل صوتي',
    'notes.recording': 'جاري التسجيل…',
    'notes.delAudio': 'حذف التسجيل',
    'notes.confirmDelAudio': 'هل تريد حذف هذا التسجيل الصوتي؟',
    'notes.duration': 'المدة',
    'notes.confirmDeleteNote': 'هل أنت متأكد من حذف هذه الملاحظة؟',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.close': 'إغلاق',
    'notes.stopRecord': 'إنهاء وحفظ التسجيل',
    'notes.cancelRecord': 'إلغاء التسجيل',
    'notes.todoTitle': 'إضافة قائمة مهام (To-Do)',
    'notes.voiceTitle': 'تسجيل صوتي لهذه الملاحظة',
    'notes.pinTitle': 'تثبيت الملاحظة في الأعلى (Pin)',
    'notes.playPause': 'تشغيل / إيقاف',
    'notes.voiceNote': '🎙️ تسجيل صوتي',
    'notes.voiceNoteNum': '🎙️ تسجيل صوتي {n}',
    'notes.waveformTip': 'انقر على أي نقطة للانتقال إليها',
    'notes.deleteAudio': 'حذف التسجيل الصوتي',
    'notes.toggleChecklist': 'طي / توسيع المهام',
    'notes.addChecklistRow': 'إضافة بند مهمة جديد',
    'notes.formatFab': 'تنسيق النص والخط (Format)',
    'notes.viewGrid': 'عرض مربعات بينتو (Bento Grid)',
    'notes.viewList': 'عرض قوائم أفقية (List View)',
    'notes.dragToReorder': 'اسحب لإعادة الترتيب',
    'notes.markDone': 'تحديد كمنجز',
    'notes.markUndone': 'إلغاء الإنجاز',
  },
  en: {
    'notes.title': 'Notes',
    'notes.all': 'All notes',
    'notes.new': 'New note',
    'notes.ph': 'Write whatever is on your mind…\nThe first line becomes the title.',
    'notes.delete': 'Delete',
    'notes.confirm': 'Press again to delete',
    'notes.search': 'Search…',
    'notes.none': 'No results.',
    'notes.untitled': 'Untitled note',
    'notes.empty': 'Empty',
    'notes.count': '{n} notes',
    'notes.results': '{n} results',
    'notes.meta': '{n} words · {when}',
    'notes.todo': 'To-Do',
    'notes.todoList': 'To-Do List',
    'notes.collapseChecklist': 'Collapse To-Do List',
    'notes.expandChecklist': 'Expand To-Do List',
    'notes.voice': 'Voice Memo',
    'notes.saveVoice': 'Save',
    'notes.newNoteTitle': 'Create New Note',
    'notes.chooseTemplate': '1. Choose Template:',
    'notes.chooseColor': '2. Choose Paper Color:',
    'notes.createBtn': '✓ Create Note',
    'notes.styleRuled': 'Ruled',
    'notes.styleRuledDesc': 'Classic ruled paper with margin line',
    'notes.styleGrid': 'Grid',
    'notes.styleGridDesc': 'Precision geometric grid lines',
    'notes.styleBook': 'Book Page',
    'notes.styleBookDesc': 'Book layout with comfortable reading margins',
    'notes.stylePlanner': 'Planner',
    'notes.stylePlannerDesc': 'Executive task planner with header',
    'notes.pin': 'Pin',
    'notes.unpin': 'Unpin note',
    'notes.pinNote': 'Pin note to top',
    'notes.pinnedTitle': 'Pinned Notes',
    'notes.allNotesTitle': 'All Notes',
    'notes.chooseFont': 'Choose Font Style:',
    'notes.tagAll': 'All',
    'notes.tagPinned': 'Pinned',
    'notes.tagVoice': 'Voice',
    'notes.tagTodo': 'To-Do',
    'notes.colorWhite': 'White',
    'notes.colorYellow': 'Yellow',
    'notes.colorBlue': 'Blue',
    'notes.colorGreen': 'Green',
    'notes.colorRose': 'Pink',
    'notes.colorPurple': 'Purple',
    'notes.colorDark': 'Dark',
    'notes.formatTitle': 'Text & Font Formatting',
    'notes.tierTitle': 'Title',
    'notes.tierHeading': 'Heading',
    'notes.tierSubheading': 'Subheading',
    'notes.tierBody': 'Body',
    'notes.fontModern': 'Modern',
    'notes.fontModernDesc': 'Clean, smooth interface sans',
    'notes.fontHand': 'Handwriting',
    'notes.fontHandDesc': 'Casual, organic handwritten script',
    'notes.fontSerif': 'Classic',
    'notes.fontSerifDesc': 'Refined literary serif typography',
    'notes.fontMono': 'Monospace',
    'notes.fontMonoDesc': 'Fixed-width engineering font',
    'notes.alignRight': 'Align Right',
    'notes.alignCenter': 'Align Center',
    'notes.alignLeft': 'Align Left',
    'notes.alignJustify': 'Justify',
    'notes.bold': 'Bold (Ctrl+B)',
    'notes.italic': 'Italic (Ctrl+I)',
    'notes.underline': 'Underline (Ctrl+U)',
    'notes.strike': 'Strikethrough',
    'notes.addTodoPh': 'Write a task and press Enter…',
    'notes.addItem': 'New item',
    'notes.micError': 'Unable to access microphone. Please check permissions.',
    'notes.voiceMemo': 'Voice Memo',
    'notes.recording': 'Recording…',
    'notes.delAudio': 'Delete recording',
    'notes.confirmDelAudio': 'Are you sure you want to delete this voice recording?',
    'notes.duration': 'Duration',
    'notes.confirmDeleteNote': 'Are you sure you want to delete this note?',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.close': 'Close',
    'notes.stopRecord': 'Finish and save recording',
    'notes.cancelRecord': 'Cancel recording',
    'notes.todoTitle': 'Add To-Do checklist',
    'notes.voiceTitle': 'Voice memo for this note',
    'notes.pinTitle': 'Pin note to top',
    'notes.playPause': 'Play / Pause',
    'notes.voiceNote': '🎙️ Voice Recording',
    'notes.voiceNoteNum': '🎙️ Voice note {n}',
    'notes.waveformTip': 'Click anywhere to jump',
    'notes.deleteAudio': 'Delete audio recording',
    'notes.toggleChecklist': 'Collapse / Expand checklist',
    'notes.addChecklistRow': 'Add new checklist item',
    'notes.formatFab': 'Text & font formatting',
    'notes.viewGrid': 'Bento Grid View',
    'notes.viewList': 'List View',
    'notes.dragToReorder': 'Drag to reorder',
    'notes.markDone': 'Mark as done',
    'notes.markUndone': 'Mark as undone',
  },
});
translate(document);

let items = [];
let activeId = null;
let view = 'editor';           // editor | list
let viewMode = 'grid';         // grid (bento squares) | list (rectangles)
let selectedTag = 'all';       // all | pinned | voice | todo | #hashtag
let query = '';
let isChecklistOpen = false;
let draggedChecklistIndex = null;

// Audio recording state
let mediaRecorder = null;
let audioChunks = [];
let recordTimerInterval = null;
let recordSeconds = 0;
let mediaStream = null;
let isAudioPlaying = false;
let audioProgressRaf = null;
let isUserScrubbing = false;

// Modal selection state
let selectedModalStyle = 'ruled';
let selectedModalColor = 'white';
let isFormatDrawerOpen = false;

const PAGE_STYLES = {
  ruled:   { icon: '📝', labelKey: 'notes.styleRuled',   name: 'مسطّر' },
  grid:    { icon: '▦',  labelKey: 'notes.styleGrid',    name: 'مربعات' },
  book:    { icon: '📖', labelKey: 'notes.styleBook',    name: 'صفحة كتاب' },
  planner: { icon: '📑', labelKey: 'notes.stylePlanner', name: 'مفكرة مهام' },
};

const PAPER_COLORS = {
  white:  { icon: '⚪', labelKey: 'notes.colorWhite',  name: 'أبيض' },
  yellow: { icon: '🟡', labelKey: 'notes.colorYellow', name: 'أصفر' },
  blue:   { icon: '🔵', labelKey: 'notes.colorBlue',   name: 'أزرق' },
  green:  { icon: '🟢', labelKey: 'notes.colorGreen',  name: 'أخضر' },
  rose:   { icon: '🌸', labelKey: 'notes.colorRose',   name: 'وردي' },
  purple: { icon: '🟣', labelKey: 'notes.colorPurple', name: 'بنفسجي' },
  dark:   { icon: '⚫', labelKey: 'notes.colorDark',   name: 'داكن' },
};

const persist = debounce(() => {
  window.widgets.notes.set({ items, activeId });
  flashSaved();
}, 400);

/* ---------- helpers ---------- */

function normalizeNote(n) {
  if (!n) return n;
  if (n.pageStyle === 'dots') n.pageStyle = 'grid';
  if (n.pageStyle === 'blank') n.pageStyle = 'ruled';
  if (n.pageStyle === 'kraft' || n.pageStyle === 'classic') n.pageStyle = 'ruled';
  if (n.style === 'kraft' || n.style === 'classic') n.style = 'ruled';
  if (!n.pageStyle || !PAGE_STYLES[n.pageStyle]) n.pageStyle = 'ruled';
  if (n.paperColor === 'cream') n.paperColor = 'white';
  if (n.paperColor === 'sage') n.paperColor = 'green';
  if (n.paperColor === 'lilac') n.paperColor = 'purple';
  if (n.paperColor === 'peach') n.paperColor = 'yellow';
  if (!n.paperColor || !PAPER_COLORS[n.paperColor]) n.paperColor = 'white';
  if (!Array.isArray(n.checklist)) n.checklist = [];
  if (typeof n.checklistCollapsed !== 'boolean') n.checklistCollapsed = false;
  if (Array.isArray(n.audios)) {
    // already has audios array
  } else if (n.audio && n.audio.data) {
    n.audios = [n.audio];
  } else {
    n.audios = [];
  }
  n.audio = n.audios.length > 0 ? n.audios[0] : null;
  if (typeof n.pinned !== 'boolean') n.pinned = false;
  n.format = Object.assign({
    tier: 'body',
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    align: 'right',
    font: 'default',
  }, n.format || {});
  return n;
}

function active() {
  const found = items.find((n) => n.id === activeId) || null;
  return normalizeNote(found);
}

function plainTextOf(content) {
  if (!content) return '';
  if (!content.includes('<')) {
    return content.replace(/^#+\s+/gm, '').replace(/(\*\*|\*|~~|<u>|<\/u>)/g, '');
  }
  const tmp = document.createElement('div');
  tmp.innerHTML = content;
  const raw = tmp.innerText || tmp.textContent || '';
  return raw.replace(/^#+\s+/gm, '').replace(/(\*\*|\*|~~|<u>|<\/u>)/g, '');
}

function titleOf(note) {
  if (!note) return t('notes.untitled');
  const plain = plainTextOf(note.body || '');
  const first = plain.split('\n').find((l) => l.trim());
  if (first) return first.trim().slice(0, 60);
  if (note.checklist && note.checklist.length && note.checklist[0].text) {
    return note.checklist[0].text.trim().slice(0, 50);
  }
  const audios = note.audios || (note.audio ? [note.audio] : []);
  if (audios.length) {
    return `${t('notes.voiceMemo')}${audios.length > 1 ? ` (${digits(audios.length)})` : ''}`;
  }
  return t('notes.untitled');
}

function previewOf(note) {
  if (!note) return '';
  const plain = plainTextOf(note.body || '');
  const lines = plain.split('\n').filter((l) => l.trim());
  
  if (lines.length > 1) {
    return lines.slice(1).join(' ').trim().slice(0, 85);
  }
  if (lines.length === 1) {
    if (note.checklist && note.checklist.length) {
      const pending = note.checklist.find((x) => !x.done) || note.checklist[0];
      return pending.text ? `☐ ${pending.text.trim().slice(0, 60)}` : '';
    }
    return '';
  }
  if (note.checklist && note.checklist.length) {
    if (note.checklist.length > 1 && note.checklist[1].text) {
      return `☐ ${note.checklist[1].text.trim().slice(0, 60)}`;
    }
    return '';
  }
  return '';
}

function formatSecs(totalSecs) {
  const s = Math.round(Number(totalSecs) || 0);
  const m = Math.floor(s / 60);
  const remS = s % 60;
  return `${String(m).padStart(2, '0')}:${String(remS).padStart(2, '0')}`;
}

function toggleActivePin() {
  const note = active();
  if (!note) return;
  note.pinned = !note.pinned;
  note.updatedAt = Date.now();
  persist();
  const pinBtn = $('#notePinBtn');
  if (pinBtn) {
    pinBtn.classList.toggle('active', !!note.pinned);
    pinBtn.title = note.pinned ? t('notes.unpin') : t('notes.pinNote');
  }
  if (view === 'list') renderList();
}

function ensureOne() {
  let created = false;
  if (!items.length) {
    const n = { id: uid(), body: '', pageStyle: 'ruled', paperColor: 'white', checklist: [], checklistCollapsed: false, audio: null, pinned: false, createdAt: Date.now(), updatedAt: Date.now() };
    items.push(n);
    activeId = n.id;
    created = true;
  }
  if (!active()) { activeId = items[0].id; created = true; }
  items.forEach(normalizeNote);
  if (created) persist();
}

/* ---------- rendering ---------- */

function render() {
  ensureOne();
  $('#editorPane').hidden = view !== 'editor';
  $('#listPane').hidden = view !== 'list';
  view === 'editor' ? renderEditor() : renderList();

  $('#title').textContent = view === 'list' ? t('notes.all') : titleOf(active());
  $('#listBtn').classList.toggle('active', view === 'list');
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatInlineMarkdown(str) {
  return escapeHtml(str)
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/\*([^*]+)\*/g, '<i>$1</i>')
    .replace(/~~([^~]+)~~/g, '<s>$1</s>');
}

function markdownToRichHtml(body) {
  if (!body) return '';
  if (!body.includes('<div') && !body.includes('<p') && !body.includes('<h')) {
    const lines = body.split('\n');
    return lines.map((line) => {
      const t = line.trim();
      if (t.startsWith('### ')) return `<h3>${formatInlineMarkdown(t.slice(4))}</h3>`;
      if (t.startsWith('## '))  return `<h2>${formatInlineMarkdown(t.slice(3))}</h2>`;
      if (t.startsWith('# '))   return `<h1>${formatInlineMarkdown(t.slice(2))}</h1>`;
      if (!line) return '<div><br></div>';
      return `<div>${formatInlineMarkdown(line)}</div>`;
    }).join('');
  }
  return body
    .replace(/<div>\s*###\s+(.*?)<\/div>/gi, '<h3>$1</h3>')
    .replace(/<div>\s*##\s+(.*?)<\/div>/gi, '<h2>$1</h2>')
    .replace(/<div>\s*#\s+(.*?)<\/div>/gi, '<h1>$1</h1>')
    .replace(/\*\*([^*<]+)\*\*/g, '<b>$1</b>')
    .replace(/(?<!\*)\*([^*<]+)\*(?!\*)/g, '<i>$1</i>')
    .replace(/~~([^~<]+)~~/g, '<s>$1</s>');
}

function renderEditor() {
  const note = active();
  if (!note) return;

  const ed = $('#editor');
  const noteBody = note.body || '';
  if (ed) {
    ed.setAttribute('data-placeholder', t('notes.ph'));
    try {
      ed.innerHTML = markdownToRichHtml(noteBody);
    } catch (err) {
      console.error('Error in markdownToRichHtml, falling back to safe lines:', err);
      const lines = noteBody.split('\n');
      ed.innerHTML = lines.map((l) => `<div>${l ? escapeHtml(l) : '<br>'}</div>`).join('');
    }
  }

  const plain = plainTextOf(noteBody);
  const words = plain.trim() ? plain.trim().split(/\s+/).length : 0;
  $('#sub').textContent = t('notes.count', { n: digits(items.length) });
  $('#meta').textContent = t('notes.meta', { n: digits(words), when: timeAgo(note.updatedAt) });

  applyPageStyleAndColor(note.pageStyle || 'ruled', note.paperColor || 'white');
  applyNoteFormat(note.format);
  renderChecklist();
  renderAudioPlayer();

  // Pin button state
  const pinBtn = $('#notePinBtn');
  if (pinBtn) {
    pinBtn.classList.toggle('active', !!note.pinned);
    pinBtn.title = note.pinned ? t('notes.unpin') : t('notes.pinNote');
  }
}

function applyNoteFormat(format) {
  const f = format || { align: 'right', font: 'default' };
  const ed = $('#editor');
  if (ed) {
    ed.classList.remove('align-right', 'align-center', 'align-left', 'align-justify');
    ed.classList.add(`align-${f.align || 'right'}`);
  }
  updateFormatUIState();
}

const FONT_MAP = {
  default: "'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif",
  handwriting: "'Segoe Print', 'Caveat', 'Aref Ruqaa', cursive",
  serif: "'Amiri', 'Georgia', serif",
  mono: "'Cascadia Code', 'Consolas', monospace",
};

/* Inline rich formatting (B, I, U, S) - Applies ONLY to selected text or upcoming typing */
function applyInlineFormat(style) {
  const ed = $('#editor');
  if (!ed) return;
  ed.focus();
  document.execCommand('styleWithCSS', false, true);

  if (style === 'bold')        document.execCommand('bold', false, null);
  else if (style === 'italic') document.execCommand('italic', false, null);
  else if (style === 'underline') document.execCommand('underline', false, null);
  else if (style === 'strike') document.execCommand('strikeThrough', false, null);

  edit(ed.innerHTML);
  updateFormatUIState();
}

/* Tier line format application (Title, Heading, Subheading, Body) - Applies to current line only */
function applyTierFormat(tier) {
  const ed = $('#editor');
  if (!ed) return;
  ed.focus();

  let blockTag = '<div>';
  if (tier === 'title') blockTag = '<h1>';
  else if (tier === 'heading') blockTag = '<h2>';
  else if (tier === 'subheading') blockTag = '<h3>';
  else if (tier === 'body') blockTag = '<div>';

  document.execCommand('formatBlock', false, blockTag);
  edit(ed.innerHTML);
  updateFormatUIState();
}

/* Alignment format application (Right, Center, Left, Justify) - Applies to current block only */
function applyAlignFormat(align) {
  const ed = $('#editor');
  if (!ed) return;
  ed.focus();

  if (align === 'right') document.execCommand('justifyRight', false, null);
  else if (align === 'center') document.execCommand('justifyCenter', false, null);
  else if (align === 'left') document.execCommand('justifyLeft', false, null);
  else if (align === 'justify') document.execCommand('justifyFull', false, null);

  const note = active();
  if (note) {
    note.format = note.format || {};
    note.format.align = align;
  }
  edit(ed.innerHTML);
  updateFormatUIState();
}

/* Font Family selection - Applies ONLY to selected text or upcoming typing without touching previous text! */
function applyRichFont(fontKey) {
  const ed = $('#editor');
  if (!ed) return;
  ed.focus();

  const fontStack = FONT_MAP[fontKey] || FONT_MAP.default;
  const sel = window.getSelection();

  if (sel && sel.rangeCount > 0 && !sel.isCollapsed && sel.toString().trim().length > 0) {
    // 1. Text IS selected: apply font ONLY to selected text!
    document.execCommand('styleWithCSS', false, true);
    document.execCommand('fontName', false, fontStack);
  } else {
    // 2. NO text selected: apply font ONLY to UPCOMING text!
    const span = document.createElement('span');
    span.style.fontFamily = fontStack;
    span.className = `font-span-${fontKey}`;
    const zwsp = document.createTextNode('\u200B');
    span.appendChild(zwsp);

    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(span);
      const newRange = document.createRange();
      newRange.setStart(zwsp, 1);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
    } else {
      ed.appendChild(span);
    }
  }

  const note = active();
  if (note) {
    note.format = note.format || {};
    note.format.font = fontKey;
  }
  edit(ed.innerHTML);
  updateFormatUIState();
}

/* Update active highlights in Format Drawer according to current cursor/selection */
function updateFormatUIState() {
  const isBold = document.queryCommandState('bold');
  const isItalic = document.queryCommandState('italic');
  const isUnderline = document.queryCommandState('underline');
  const isStrike = document.queryCommandState('strikeThrough');

  $('#fmtBoldBtn')?.classList.toggle('on', !!isBold);
  $('#fmtItalicBtn')?.classList.toggle('on', !!isItalic);
  $('#fmtUnderlineBtn')?.classList.toggle('on', !!isUnderline);
  $('#fmtStrikeBtn')?.classList.toggle('on', !!isStrike);

  // Check current block format (h1, h2, h3, div)
  const blockVal = (document.queryCommandValue('formatBlock') || '').toLowerCase();
  let activeTier = 'body';
  if (blockVal.includes('h1')) activeTier = 'title';
  else if (blockVal.includes('h2')) activeTier = 'heading';
  else if (blockVal.includes('h3')) activeTier = 'subheading';

  document.querySelectorAll('.tier-btn').forEach((btn) => {
    btn.classList.toggle('on', btn.dataset.tier === activeTier);
  });

  // Check alignment
  const note = active();
  const align = note?.format?.align || 'right';
  document.querySelectorAll('.fmt-btn[data-align]').forEach((btn) => {
    btn.classList.toggle('on', btn.dataset.align === align);
  });

  // Check font family at cursor
  const sel = (typeof window.getSelection === 'function') ? window.getSelection() : null;
  let currentFontKey = note?.format?.font || 'default';
  if (sel && sel.anchorNode) {
    const parentEl = sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement;
    if (parentEl && typeof window.getComputedStyle === 'function') {
      const family = (window.getComputedStyle(parentEl)?.fontFamily || '').toLowerCase();
      if (family.includes('print') || family.includes('caveat') || family.includes('ruqaa')) currentFontKey = 'handwriting';
      else if (family.includes('amiri') || family.includes('georgia') || family.includes('serif')) currentFontKey = 'serif';
      else if (family.includes('cascadia') || family.includes('consolas') || family.includes('mono')) currentFontKey = 'mono';
      else if (family.includes('cairo') || family.includes('sans')) currentFontKey = 'default';
    }
  }
  document.querySelectorAll('.font-card').forEach((card) => {
    card.classList.toggle('on', card.dataset.font === currentFontKey);
  });
}

function toggleFormatDrawer(open) {
  isFormatDrawerOpen = typeof open === 'boolean' ? open : !isFormatDrawerOpen;
  const drawer = $('#formatDrawer');
  const fab = $('#formatFabBtn');
  if (drawer) drawer.hidden = !isFormatDrawerOpen;
  if (fab) fab.classList.toggle('active', isFormatDrawerOpen);
  if (isFormatDrawerOpen) {
    updateFormatUIState();
  }
}

function updateFormatProp(key, value) {
  const note = active();
  if (!note) return;
  note.format = note.format || {};
  note.format[key] = value;
  note.updatedAt = Date.now();
  persist();

  if (key === 'font') {
    applyRichFont(value);
  } else if (key === 'align') {
    applyAlignFormat(value);
  } else if (key === 'tier') {
    applyTierFormat(value);
  } else if (key === 'bold' || key === 'italic' || key === 'underline' || key === 'strike') {
    applyInlineFormat(key);
  } else {
    applyNoteFormat(note.format);
  }
}

function applyPageStyleAndColor(style, color) {
  const validStyle = PAGE_STYLES[style] ? style : 'ruled';
  const validColor = PAPER_COLORS[color] ? color : (color === 'sage' ? 'green' : (color === 'lilac' ? 'purple' : 'white'));
  const canvas = $('#editorCanvas');
  if (canvas) {
    canvas.className = `editor-canvas style-${validStyle} color-${validColor}`;
  }
}

function applyPageStyle(style) {
  const note = active();
  const s = (style === 'kraft' || style === 'classic') ? 'ruled' : style;
  applyPageStyleAndColor(s, note?.paperColor || 'white');
}

function setNotePageStyle(style, color) {
  const note = active();
  if (!note) return;
  const s = (style === 'kraft' || style === 'classic' || !PAGE_STYLES[style]) ? 'ruled' : style;
  note.pageStyle = s;
  if (color) note.paperColor = color;
  note.updatedAt = Date.now();
  persist();
  applyPageStyleAndColor(note.pageStyle, note.paperColor);
}

/* ---------- New Note Creation Modal ---------- */

function openNewNoteModal() {
  selectedModalStyle = 'ruled';
  selectedModalColor = 'white';
  updateModalSelectionUI();
  const modal = $('#newNoteModal');
  if (modal) modal.hidden = false;
}

function closeNewNoteModal() {
  const modal = $('#newNoteModal');
  if (modal) modal.hidden = true;
}

function updateModalSelectionUI() {
  document.querySelectorAll('.new-style-card').forEach((card) => {
    card.classList.toggle('on', card.dataset.style === selectedModalStyle);
  });
  document.querySelectorAll('.new-color-swatch').forEach((swatch) => {
    swatch.classList.toggle('on', swatch.dataset.color === selectedModalColor);
  });
}

/* ---------- Checklist Rendering & Handlers ---------- */

/* ---------- Checklist Rendering & Handlers ---------- */

function toggleChecklistCollapse() {
  const note = active();
  if (!note) return;
  note.checklistCollapsed = !note.checklistCollapsed;
  persist();
  try { persist.flush?.(); } catch (e) {}
  renderChecklist();
}

function renderChecklist() {
  const note = active();
  if (!note) return;

  const section = $('#noteChecklistSection');
  const listEl = $('#checklistList');
  const counterEl = $('#checklistCounter');
  const checklist = note.checklist || [];

  const shouldShow = isChecklistOpen || checklist.length > 0;
  section.hidden = !shouldShow;
  const isCollapsed = Boolean(note.checklistCollapsed);
  $('#toolTodoBtn')?.classList.toggle('active', shouldShow && !isCollapsed);

  if (!shouldShow) return;

  section.classList.toggle('collapsed', isCollapsed);

  const doneCount = checklist.filter((x) => x.done).length;
  if (counterEl) {
    counterEl.textContent = checklist.length ? `${digits(doneCount)}/${digits(checklist.length)}` : '';
    counterEl.hidden = checklist.length === 0;
    counterEl.classList.toggle('all-done', checklist.length > 0 && doneCount === checklist.length);
  }

  const toggleBtn = $('#toggleChecklistBtn');
  const actionTitle = isCollapsed ? (t('notes.expandChecklist') || 'توسيع قائمة المهام') : (t('notes.collapseChecklist') || 'طي قائمة المهام');
  if (toggleBtn) {
    toggleBtn.title = actionTitle;
    toggleBtn.setAttribute('aria-expanded', !isCollapsed);
  }
  const headerEl = $('#checklistHeader');
  if (headerEl) {
    headerEl.title = actionTitle;
  }

  listEl.replaceChildren(...checklist.map((it, idx) => {
    const li = el('li', {
      class: 'checklist-item',
      dataset: { id: it.id, index: idx },
      draggable: 'true',
    });

    // Drag handle (Idea 10)
    const handle = el('span', {
      class: 'todo-drag-handle',
      title: t('notes.dragToReorder'),
      text: '⠿',
    });

    // Circular checkbox button (Idea 12: with celebratory spring pop animation)
    const checkBtn = el('button', {
      type: 'button',
      class: `todo-check${it.done ? ' done' : ''}`,
      title: it.done ? t('notes.markUndone') : t('notes.markDone'),
      onclick: () => toggleChecklistItem(it.id),
    }, el('span', { class: 'todo-check-icon', text: '✓' }));

    // Item text input (never deleted on check!)
    const input = el('input', {
      type: 'text',
      class: `todo-input${it.done ? ' done' : ''}`,
      value: it.text || '',
      placeholder: t('notes.addTodoPh') || 'اكتب مهمة جديدة...',
      dir: 'auto',
    });

    input.addEventListener('input', (e) => updateChecklistItemText(it.id, e.target.value));
    input.addEventListener('keydown', (e) => handleChecklistKeydown(e, idx, it.id));

    // Delete item button (instant 100% reliable deletion on pointerdown or click)
    const delBtn = el('button', {
      type: 'button',
      class: 'todo-del-btn',
      title: t('notes.delete') || 'حذف',
      tabIndex: -1,
      onpointerdown: (e) => {
        e.preventDefault();
        e.stopPropagation();
        removeChecklistItem(it.id);
      },
      onclick: (e) => {
        e.preventDefault();
        e.stopPropagation();
        removeChecklistItem(it.id);
      },
    }, '✕');

    // Drag & drop handlers
    li.addEventListener('dragstart', (e) => {
      draggedChecklistIndex = idx;
      li.classList.add('dragging');
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(idx));
      }
    });

    li.addEventListener('dragend', () => {
      draggedChecklistIndex = null;
      li.classList.remove('dragging');
      document.querySelectorAll('.checklist-item').forEach((item) => {
        item.classList.remove('drag-over-top', 'drag-over-bottom');
      });
    });

    li.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
      const rect = li.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      if (e.clientY < mid) {
        li.classList.add('drag-over-top');
        li.classList.remove('drag-over-bottom');
      } else {
        li.classList.add('drag-over-bottom');
        li.classList.remove('drag-over-top');
      }
    });

    li.addEventListener('dragleave', () => {
      li.classList.remove('drag-over-top', 'drag-over-bottom');
    });

    li.addEventListener('drop', (e) => {
      e.preventDefault();
      li.classList.remove('drag-over-top', 'drag-over-bottom');
      const fromIdx = draggedChecklistIndex;
      const toIdx = idx;
      if (fromIdx !== null && fromIdx !== undefined && fromIdx !== toIdx) {
        reorderChecklistItems(fromIdx, toIdx);
      }
    });

    li.append(handle, checkBtn, input, delBtn);
    return li;
  }));
}

function reorderChecklistItems(fromIdx, toIdx) {
  const note = active();
  if (!note || !Array.isArray(note.checklist)) return;
  const list = [...note.checklist];
  const [moved] = list.splice(fromIdx, 1);
  list.splice(toIdx, 0, moved);
  note.checklist = list;
  note.updatedAt = Date.now();
  persist();
  renderChecklist();
}

function toggleChecklistItem(itemId) {
  const note = active();
  if (!note) return;
  const it = (note.checklist || []).find((x) => x.id === itemId);
  if (it) {
    it.done = !it.done;
    note.updatedAt = Date.now();
    persist();
    renderChecklist();
  }
}

function updateChecklistItemText(itemId, text) {
  const note = active();
  if (!note) return;
  const it = (note.checklist || []).find((x) => x.id === itemId);
  if (it) {
    it.text = text;
    note.updatedAt = Date.now();
    persist();
  }
}

function addChecklistItem(initialText = '') {
  const note = active();
  if (!note) return;
  note.checklist = note.checklist || [];
  note.checklistCollapsed = false;
  const newItem = { id: uid(), text: initialText, done: false };
  note.checklist.push(newItem);
  isChecklistOpen = true;
  note.updatedAt = Date.now();
  persist();
  renderChecklist();

  // Focus the newly added input
  setTimeout(() => {
    const inputs = document.querySelectorAll('.todo-input');
    if (inputs.length) {
      const last = inputs[inputs.length - 1];
      last.focus();
      last.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, 30);
}

function removeChecklistItem(itemId, focusPrev = false) {
  const note = active();
  if (!note) return;
  const idx = (note.checklist || []).findIndex((x) => x.id === itemId);
  note.checklist = (note.checklist || []).filter((x) => x.id !== itemId);
  if (note.checklist.length === 0) {
    isChecklistOpen = false;
  }
  note.updatedAt = Date.now();
  persist();
  try { persist.flush?.(); } catch (e) {}
  renderChecklist();

  if (focusPrev && idx > 0) {
    setTimeout(() => {
      const inputs = document.querySelectorAll('.todo-input');
      if (inputs[idx - 1]) inputs[idx - 1].focus();
    }, 20);
  }
}

function handleChecklistKeydown(e, idx, itemId) {
  const input = e.target;
  if (e.key === 'Enter') {
    e.preventDefault();
    addChecklistItem();
  } else if (e.key === 'Backspace') {
    const isAllSelected = (input.selectionStart === 0 && input.selectionEnd === input.value.length && input.value.length > 0);
    const isEmpty = input.value === '';
    const isAtStart = (input.selectionStart === 0 && input.selectionEnd === 0);

    if (isEmpty || isAllSelected) {
      e.preventDefault();
      removeChecklistItem(itemId, true);
    } else if (isAtStart && idx > 0) {
      // Cursor at beginning of line: merge current line into previous line
      e.preventDefault();
      const note = active();
      if (note && note.checklist && note.checklist[idx - 1]) {
        const prevItem = note.checklist[idx - 1];
        const prevLen = (prevItem.text || '').length;
        prevItem.text = (prevItem.text || '') + input.value;
        note.checklist.splice(idx, 1);
        note.updatedAt = Date.now();
        persist();
        try { persist.flush?.(); } catch (err) {}
        renderChecklist();
        setTimeout(() => {
          const inputs = document.querySelectorAll('.todo-input');
          if (inputs[idx - 1]) {
            inputs[idx - 1].focus();
            inputs[idx - 1].setSelectionRange(prevLen, prevLen);
          }
        }, 20);
      }
    }
  } else if (e.key === 'Delete') {
    const isAllSelected = (input.selectionStart === 0 && input.selectionEnd === input.value.length && input.value.length > 0);
    const isEmpty = input.value === '';
    if (isEmpty || isAllSelected) {
      e.preventDefault();
      removeChecklistItem(itemId, false);
    }
  }
}

/* ---------- Audio Recording & Playback ---------- */

async function startAudioRecording() {
  const note = active();
  if (!note) return;

  // Stop any currently playing audio
  stopAudioPlayback();

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks = [];
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : (MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '');
    mediaRecorder = mimeType ? new MediaRecorder(mediaStream, { mimeType }) : new MediaRecorder(mediaStream);

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) audioChunks.push(e.data);
    };

    mediaRecorder.start(200);

    // Show floating recording bar
    $('#audioRecordBar').hidden = false;
    recordSeconds = 0;
    $('#recordTimer').textContent = '00:00';

    clearInterval(recordTimerInterval);
    recordTimerInterval = setInterval(() => {
      recordSeconds++;
      $('#recordTimer').textContent = formatSecs(recordSeconds);
    }, 1000);

    $('#toolVoiceBtn')?.classList.add('recording');
    const vText = $('#toolVoiceBtn .tool-text');
    if (vText) vText.textContent = 'تسجيل...';
  } catch (err) {
    console.error('Audio recording failed:', err);
    flashHint(t('notes.micError'));
  }
}

function stopAudioRecording(save = true) {
  clearInterval(recordTimerInterval);
  $('#audioRecordBar').hidden = true;
  $('#toolVoiceBtn')?.classList.remove('recording');
  const vText = $('#toolVoiceBtn .tool-text');
  if (vText) vText.textContent = t('notes.voice');

  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.onstop = () => {
      if (save && audioChunks.length > 0) {
        const mime = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunks, { type: mime });
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result;
          const note = active();
          if (note) {
            const newAudio = {
              id: uid(),
              data: dataUrl,
              duration: Math.max(1, recordSeconds),
              createdAt: Date.now(),
            };
            if (!Array.isArray(note.audios)) {
              note.audios = note.audio ? [note.audio] : [];
            }
            note.audios.push(newAudio);
            note.audio = note.audios[0];
            note.updatedAt = Date.now();
            persist();
            renderAudioPlayer();
            renderList();
          }
        };
        reader.readAsDataURL(blob);
      }
      if (mediaStream) {
        mediaStream.getTracks().forEach((t) => t.stop());
        mediaStream = null;
      }
    };
    mediaRecorder.stop();
  } else if (mediaStream) {
    mediaStream.getTracks().forEach((t) => t.stop());
    mediaStream = null;
  }
}

let currentlyPlayingAudioId = null;

/* Idea 4: Interactive Audio Waveform & Multi-Audio Playback */
function renderAudioPlayer() {
  const note = active();
  const audios = note?.audios || (note?.audio ? [note.audio] : []);
  const listEl = $('#noteAudiosList');
  const basePlayer = $('#noteAudioPlayer');
  if (!basePlayer) return;

  // Clean up any extra dynamically created audio cards
  if (listEl) {
    listEl.querySelectorAll('.note-audio-player-extra').forEach((n) => n.remove());
  }

  if (!audios.length) {
    basePlayer.hidden = true;
    stopAudioPlayback();
    return;
  }

  basePlayer.hidden = false;
  // Bind primary audio into basePlayer
  bindAudioCard(basePlayer, audios[0], 0, audios.length);

  // Render additional audio cards (indexes 1, 2, ...)
  if (listEl) {
    for (let i = 1; i < audios.length; i++) {
      const extraCard = createAudioPlayerCard(audios[i], i, audios.length);
      listEl.append(extraCard);
    }
  }
}

function bindAudioCard(cardEl, audioItem, index, total) {
  cardEl.dataset.audioId = audioItem.id;
  const isPlaying = currentlyPlayingAudioId === audioItem.id;

  const playBtn = cardEl.querySelector('.audio-play-btn');
  const playIcon = cardEl.querySelector('#playIcon') || cardEl.querySelector('.audio-play-icon');
  if (playIcon) playIcon.textContent = isPlaying ? '⏸' : '▶';

  const tagEl = cardEl.querySelector('.audio-tag') || cardEl.querySelector('#audioTag');
  if (tagEl) {
    tagEl.textContent = total > 1 ? t('notes.voiceNoteNum', { n: digits(index + 1) }) : t('notes.voiceNote');
  }

  const timeEl = cardEl.querySelector('.audio-time') || cardEl.querySelector('#audioTime');
  if (timeEl) {
    timeEl.textContent = `00:00 / ${formatSecs(audioItem.duration || 0)}`;
  }

  const scrub = cardEl.querySelector('.audio-scrub') || cardEl.querySelector('#audioScrub');
  if (scrub && !isPlaying) {
    scrub.value = 0;
  }

  const waveBox = cardEl.querySelector('.audio-waveform-box') || cardEl.querySelector('#audioWaveformBox');
  if (waveBox) {
    populateWaveformBars(waveBox, audioItem);
  }

  if (playBtn) {
    playBtn.onclick = (e) => {
      e.stopPropagation();
      toggleAudioPlay(audioItem.id);
    };
  }

  const delBtn = cardEl.querySelector('.audio-del-btn') || cardEl.querySelector('#audioDelBtn');
  if (delBtn) {
    delBtn.onclick = (e) => {
      e.stopPropagation();
      deleteAudioById(audioItem.id);
    };
  }

  if (scrub) {
    scrub.oninput = (e) => {
      onAudioScrubInput(audioItem.id, Number(e.target.value));
    };
  }
}

function createAudioPlayerCard(audioItem, index, total) {
  const card = el('div', {
    class: 'note-audio-player note-audio-player-extra',
    dataset: { audioId: audioItem.id },
  });

  const playIcon = el('span', { class: 'audio-play-icon' }, currentlyPlayingAudioId === audioItem.id ? '⏸' : '▶');
  const playBtn = el('button', {
    type: 'button',
    class: 'audio-play-btn',
    title: t('notes.playPause'),
  }, playIcon);

  const tagText = total > 1 ? t('notes.voiceNoteNum', { n: digits(index + 1) }) : t('notes.voiceNote');
  const tagSpan = el('span', { class: 'audio-tag' }, tagText);
  const timeSpan = el('span', { class: 'audio-time' }, `00:00 / ${formatSecs(audioItem.duration || 0)}`);
  const metaRow = el('div', { class: 'audio-meta-row' }, tagSpan, timeSpan);

  const waveBox = el('div', {
    class: 'audio-waveform-box',
    title: t('notes.waveformTip'),
  });
  populateWaveformBars(waveBox, audioItem);

  const scrub = el('input', {
    type: 'range',
    class: 'audio-scrub',
    min: 0,
    max: 100,
    value: 0,
    step: 'any',
  });
  scrub.oninput = (e) => onAudioScrubInput(audioItem.id, Number(e.target.value));

  const trackBox = el('div', { class: 'audio-track-box' }, metaRow, waveBox, scrub);

  const delBtn = el('button', {
    type: 'button',
    class: 'audio-del-btn',
    title: t('notes.deleteAudio'),
  }, '🗑️');
  delBtn.onclick = (e) => {
    e.stopPropagation();
    deleteAudioById(audioItem.id);
  };

  playBtn.onclick = (e) => {
    e.stopPropagation();
    toggleAudioPlay(audioItem.id);
  };

  card.append(playBtn, trackBox, delBtn);
  return card;
}

function populateWaveformBars(box, audioItem) {
  if (!box) return;
  box.replaceChildren();
  const dur = audioItem?.duration || 10;
  const seed = String(audioItem?.id || 'audio').split('').reduce((acc, c) => acc + c.charCodeAt(0), Math.round(dur * 7));

  for (let i = 0; i < 32; i++) {
    const pseudoRand = Math.sin(seed + i * 1.35) * 0.5 + 0.5;
    const heightPct = Math.round(25 + pseudoRand * 70);
    const bar = el('div', {
      class: 'waveform-bar',
      dataset: { index: i },
      style: `height: ${heightPct}%;`,
    });
    bar.onclick = (e) => {
      e.stopPropagation();
      seekAudioByWaveformIndex(i, 32, audioItem?.id);
    };
    box.append(bar);
  }
}

function renderWaveformBars() {
  const note = active();
  const audios = note?.audios || (note?.audio ? [note.audio] : []);
  if (!audios.length) return;
  const box = $('#audioWaveformBox');
  if (box) populateWaveformBars(box, audios[0]);
}

function seekAudioByWaveformIndex(idx, total, targetId) {
  const note = active();
  const audios = note?.audios || (note?.audio ? [note.audio] : []);
  if (!audios.length) return;

  const audioId = targetId || currentlyPlayingAudioId || audios[0].id;
  const audioItem = audios.find((a) => a.id === audioId);
  if (!audioItem) return;

  const duration = audioItem.duration || 10;
  const fraction = idx / (total - 1);
  const targetTime = fraction * duration;
  const audioEl = $('#noteAudioEl');
  if (!audioEl) return;

  if (currentlyPlayingAudioId !== audioId) {
    audioEl.src = audioItem.data;
    currentlyPlayingAudioId = audioId;
    audioEl.currentTime = targetTime;
    audioEl.play().then(() => {
      startAudioProgressLoop();
      updateAllAudioCardsUI();
    }).catch(() => {});
  } else {
    audioEl.currentTime = targetTime;
  }

  updateAudioTrackProgressUI(audioId, targetTime, duration, fraction * 100);
}

function onAudioScrubInput(audioId, pct) {
  const note = active();
  const audios = note?.audios || (note?.audio ? [note.audio] : []);
  const audioItem = audios.find((a) => a.id === audioId);
  if (!audioItem) return;

  const audioEl = $('#noteAudioEl');
  if (!audioEl) return;

  const duration = audioItem.duration || 10;
  const targetTime = (pct / 100) * duration;

  if (currentlyPlayingAudioId !== audioId) {
    audioEl.src = audioItem.data;
    currentlyPlayingAudioId = audioId;
    audioEl.currentTime = targetTime;
    audioEl.play().then(() => {
      startAudioProgressLoop();
      updateAllAudioCardsUI();
    }).catch(() => {});
  } else {
    audioEl.currentTime = targetTime;
  }

  updateAudioTrackProgressUI(audioId, targetTime, duration, pct);
}

function updateAudioTrackProgressUI(audioId, cur, duration, pct) {
  const card = document.querySelector(`.note-audio-player[data-audio-id="${audioId}"]`);
  if (!card) return;

  const timeEl = card.querySelector('.audio-time');
  if (timeEl) {
    timeEl.textContent = `${formatSecs(cur)} / ${formatSecs(duration)}`;
  }
  const scrub = card.querySelector('.audio-scrub');
  if (scrub && !isUserScrubbing) {
    scrub.value = pct;
  }
  const bars = card.querySelectorAll('.waveform-bar');
  if (bars.length) {
    const activeIndex = Math.floor((pct / 100) * bars.length);
    bars.forEach((bar, idx) => {
      bar.classList.toggle('played', idx <= activeIndex);
    });
  }
}

function updateWaveformProgress(pct) {
  const card = currentlyPlayingAudioId
    ? document.querySelector(`.note-audio-player[data-audio-id="${currentlyPlayingAudioId}"]`)
    : $('#noteAudioPlayer');
  if (!card) return;
  const bars = card.querySelectorAll('.waveform-bar');
  if (!bars.length) return;
  const activeIndex = Math.floor((pct / 100) * bars.length);
  bars.forEach((bar, idx) => {
    bar.classList.toggle('played', idx <= activeIndex);
  });
}

function updateAllAudioCardsUI() {
  const note = active();
  const audios = note?.audios || (note?.audio ? [note.audio] : []);
  const cards = document.querySelectorAll('.note-audio-player');

  cards.forEach((card) => {
    const cardAudioId = card.dataset.audioId;
    const isPlaying = currentlyPlayingAudioId && cardAudioId === currentlyPlayingAudioId;
    const playIcon = card.querySelector('#playIcon') || card.querySelector('.audio-play-icon');
    if (playIcon) playIcon.textContent = isPlaying ? '⏸' : '▶';

    if (!isPlaying) {
      const audioItem = audios.find((a) => a.id === cardAudioId);
      const timeEl = card.querySelector('.audio-time');
      if (timeEl && audioItem) {
        timeEl.textContent = `00:00 / ${formatSecs(audioItem.duration || 0)}`;
      }
      const scrub = card.querySelector('.audio-scrub');
      if (scrub) scrub.value = 0;
      const bars = card.querySelectorAll('.waveform-bar');
      bars.forEach((b) => b.classList.remove('played'));
    }
  });
}

function stepAudioProgress() {
  const audioEl = $('#noteAudioEl');
  if (!audioEl || audioEl.paused || audioEl.ended || !currentlyPlayingAudioId) {
    if (audioEl && audioEl.ended) {
      currentlyPlayingAudioId = null;
      updateAllAudioCardsUI();
    }
    stopAudioProgressLoop();
    return;
  }
  const note = active();
  const audios = note?.audios || (note?.audio ? [note.audio] : []);
  const audioItem = audios.find((a) => a.id === currentlyPlayingAudioId);
  const duration = audioEl.duration || audioItem?.duration || 0;

  if (duration > 0 && !isUserScrubbing) {
    const cur = audioEl.currentTime;
    const pct = Math.min(100, Math.max(0, (cur / duration) * 100));
    updateAudioTrackProgressUI(currentlyPlayingAudioId, cur, duration, pct);
  }
  audioProgressRaf = requestAnimationFrame(stepAudioProgress);
}

function startAudioProgressLoop() {
  if (audioProgressRaf) cancelAnimationFrame(audioProgressRaf);
  audioProgressRaf = requestAnimationFrame(stepAudioProgress);
}

function stopAudioProgressLoop() {
  if (audioProgressRaf) {
    cancelAnimationFrame(audioProgressRaf);
    audioProgressRaf = null;
  }
}

function toggleAudioPlay(targetId) {
  const note = active();
  const audios = note?.audios || (note?.audio ? [note.audio] : []);
  if (!audios.length) return;

  const targetAudio = targetId
    ? audios.find((a) => a.id === targetId)
    : (audios.find((a) => a.id === currentlyPlayingAudioId) || audios[0]);
  if (!targetAudio || !targetAudio.data) return;

  const audioEl = $('#noteAudioEl');
  if (!audioEl) return;

  if (currentlyPlayingAudioId === targetAudio.id && !audioEl.paused) {
    audioEl.pause();
    currentlyPlayingAudioId = null;
    stopAudioProgressLoop();
    updateAllAudioCardsUI();
  } else {
    stopAudioProgressLoop();
    audioEl.src = targetAudio.data;
    audioEl.currentTime = 0;
    currentlyPlayingAudioId = targetAudio.id;
    updateAllAudioCardsUI();

    audioEl.play().then(() => {
      startAudioProgressLoop();
      updateAllAudioCardsUI();
    }).catch((err) => {
      console.error('Audio play error:', err);
      currentlyPlayingAudioId = null;
      stopAudioProgressLoop();
      updateAllAudioCardsUI();
    });
  }
}

function stopAudioPlayback() {
  stopAudioProgressLoop();
  const audioEl = $('#noteAudioEl');
  if (audioEl && typeof audioEl.pause === 'function') {
    try { audioEl.pause(); } catch {}
    audioEl.currentTime = 0;
  }
  currentlyPlayingAudioId = null;
  updateAllAudioCardsUI();
}

function deleteAudioById(audioId) {
  const note = active();
  if (!note) return;
  const audios = note.audios || (note.audio ? [note.audio] : []);
  const target = audios.find((a) => a.id === audioId);
  if (!target) return;

  confirmDelete({
    title: t('notes.confirmDelAudio'),
    desc: `${t('notes.duration')}: ${formatSecs(target.duration || 0)}`,
    confirmText: t('notes.delete'),
    cancelText: t('common.cancel'),
    onConfirm: () => {
      if (currentlyPlayingAudioId === audioId) {
        stopAudioPlayback();
      }
      note.audios = audios.filter((a) => a.id !== audioId);
      note.audio = note.audios.length > 0 ? note.audios[0] : null;
      note.updatedAt = Date.now();
      persist();
      renderAudioPlayer();
      renderList();
    },
  });
}

function deleteCurrentAudio() {
  const note = active();
  const audios = note?.audios || (note?.audio ? [note.audio] : []);
  if (!audios.length) return;
  deleteAudioById(currentlyPlayingAudioId || audios[0].id);
}

/* ---------- Note List Rendering (Ideas 5, 6 & Bento Squares vs Rectangles) ---------- */

function renderTagFilterBar() {
  const bar = $('#notesTagBar');
  if (!bar) return;

  const tagSet = new Set();
  items.forEach((n) => {
    const matches = (n.body || '').match(/#[\w\u0600-\u06FF]+/g);
    if (matches) {
      matches.forEach((m) => tagSet.add(m));
    }
  });

  const baseTags = [
    { id: 'all', icon: '✨', label: t('notes.tagAll') || 'الكل' },
    { id: 'pinned', icon: '📌', label: t('notes.tagPinned') || 'مثبتة' },
    { id: 'voice', icon: '🎙️', label: t('notes.tagVoice') || 'صوتي' },
    { id: 'todo', icon: '☑️', label: t('notes.tagTodo') || 'مهام' },
  ];

  const chips = [
    ...baseTags.map((bt) =>
      el('button', {
        type: 'button',
        class: `tag-chip${selectedTag === bt.id ? ' active' : ''}`,
        dataset: { tag: bt.id },
        onclick: () => {
          selectedTag = bt.id;
          renderList();
        },
      },
        el('span', { class: 'tag-icon', text: bt.icon }),
        el('span', { class: 'tag-name', text: bt.label })
      )
    ),
    ...Array.from(tagSet).slice(0, 10).map((tagStr) =>
      el('button', {
        type: 'button',
        class: `tag-chip${selectedTag === tagStr ? ' active' : ''}`,
        dataset: { tag: tagStr },
        onclick: () => {
          selectedTag = tagStr;
          renderList();
        },
      },
        el('span', { class: 'tag-name', text: tagStr })
      )
    ),
  ];

  bar.replaceChildren(...chips);
}

function renderList() {
  try {
    const savedMode = localStorage.getItem('notes_view_mode');
    if (savedMode === 'grid' || savedMode === 'list') viewMode = savedMode;
  } catch {}

  $('#viewGridBtn')?.classList.toggle('active', viewMode === 'grid');
  $('#viewListBtn')?.classList.toggle('active', viewMode === 'list');

  const noteListEl = $('#noteList');
  const pinnedListEl = $('#pinnedNoteList');
  if (noteListEl) {
    noteListEl.className = `notes ${viewMode === 'grid' ? 'view-grid' : 'view-list'} stagger`;
  }
  if (pinnedListEl) {
    pinnedListEl.className = `notes pinned-notes ${viewMode === 'grid' ? 'view-grid' : 'view-list'}`;
  }

  // 1. Tag filter chips bar
  renderTagFilterBar();

  // 2. Filter notes
  const q = query.trim().toLowerCase();
  let filtered = [...items];

  if (selectedTag === 'pinned') {
    filtered = filtered.filter((n) => !!n.pinned);
  } else if (selectedTag === 'voice') {
    filtered = filtered.filter((n) => !!n.audio);
  } else if (selectedTag === 'todo') {
    filtered = filtered.filter((n) => n.checklist && n.checklist.length > 0);
  } else if (selectedTag.startsWith('#')) {
    const tagLower = selectedTag.toLowerCase();
    filtered = filtered.filter((n) => (n.body || '').toLowerCase().includes(tagLower));
  }

  if (q) {
    filtered = filtered.filter((n) =>
      (n.body || '').toLowerCase().includes(q) ||
      (n.checklist || []).some((c) => (c.text || '').toLowerCase().includes(q))
    );
  }

  filtered.sort((a, b) => b.updatedAt - a.updatedAt);

  // 3. Separate into Pinned & All
  const pinnedNotes = filtered.filter((n) => !!n.pinned);
  const unpinnedNotes = filtered.filter((n) => !n.pinned);

  const pinnedHeader = $('#pinnedHeader');
  const allHeader = $('#allNotesHeader');
  const pinnedBadge = $('#pinnedCountBadge');
  const allBadge = $('#allCountBadge');

  if (pinnedHeader && pinnedListEl) {
    const showPinned = pinnedNotes.length > 0;
    pinnedHeader.hidden = !showPinned;
    pinnedListEl.hidden = !showPinned;
    if (pinnedBadge) pinnedBadge.textContent = digits(pinnedNotes.length);
    if (showPinned) {
      pinnedListEl.replaceChildren(...pinnedNotes.map((n) => noteRow(n, viewMode)));
    } else {
      pinnedListEl.replaceChildren();
    }
  }

  if (allBadge) allBadge.textContent = digits(unpinnedNotes.length);
  if (allHeader) {
    allHeader.hidden = pinnedNotes.length === 0;
  }

  if (noteListEl) {
    noteListEl.replaceChildren(...unpinnedNotes.map((n) => noteRow(n, viewMode)));
    noteListEl.hidden = unpinnedNotes.length === 0 && pinnedNotes.length === 0;
  }

  $('#sub').textContent = q
    ? t('notes.results', { n: digits(filtered.length) })
    : t('notes.count', { n: digits(items.length) });

  const isEmpty = filtered.length === 0;
  $('#listEmpty').hidden = !isEmpty;
}

/* Bento Square Card (Pinterest Inspired) */
function noteRowGrid(note) {
  const cardChildren = [];

  // 1. Pinned indicator (clean top-corner pin only if pinned)
  if (note.pinned) {
    cardChildren.push(
      el('div', { class: 'note-pin-corner', title: t('notes.pinnedTitle') }, '📌')
    );
  }

  // 2. Title
  cardChildren.push(
    el('div', { class: 'note-title', dir: 'auto', text: titleOf(note) })
  );

  // 3. Preview text (if exists)
  const prevText = previewOf(note);
  if (prevText) {
    cardChildren.push(
      el('div', { class: 'note-preview', dir: 'auto', text: prevText })
    );
  }

  // 4. Footer row: Clean metadata chips + Time
  const metaChips = [];
  if (note.checklist && note.checklist.length) {
    const doneCount = note.checklist.filter((x) => x.done).length;
    metaChips.push(
      el('span', { class: `note-meta-chip todo${doneCount === note.checklist.length ? ' all-done' : ''}` },
        `✓ ${digits(doneCount)}/${digits(note.checklist.length)}`
      )
    );
  }
  if (note.audio) {
    metaChips.push(
      el('span', { class: 'note-meta-chip audio' }, `🎙️ ${formatSecs(note.audio.duration || 0)}`)
    );
  }

  const footEl = el('div', { class: 'note-foot-row' },
    el('div', { class: 'note-meta-chips' }, ...metaChips),
    el('span', { class: 'note-when' }, timeAgo(note.updatedAt))
  );
  cardChildren.push(footEl);

  return el('li', {
    class: `note${note.id === activeId ? ' active' : ''}`,
    dataset: { id: note.id, color: note.paperColor || 'white', style: note.pageStyle || 'ruled' },
    onclick: () => openNote(note.id),
  }, ...cardChildren);
}

/* Horizontal Rectangular Card (Pinterest Image Bottom) */
function noteRowList(note) {
  const st = PAGE_STYLES[note.pageStyle || 'ruled'] || PAGE_STYLES.ruled;

  let mainIcon = st.icon;
  if (note.audio) mainIcon = '🎙️';
  else if (note.checklist && note.checklist.length) mainIcon = '☑️';

  const iconBox = el('div', { class: 'note-list-icon-box' }, mainIcon);

  const titleRow = el('div', { class: 'note-title-row' },
    el('div', { class: 'note-title', dir: 'auto', text: titleOf(note) }),
    note.pinned ? el('span', { class: 'note-pin-badge' }, '📌') : null
  );

  const prevText = previewOf(note);
  const previewEl = prevText ? el('div', { class: 'note-preview', dir: 'auto', text: prevText }) : null;

  const metaParts = [];
  if (note.checklist && note.checklist.length) {
    const doneCount = note.checklist.filter((x) => x.done).length;
    metaParts.push(`✓ ${digits(doneCount)}/${digits(note.checklist.length)}`);
  }
  if (note.audio) {
    metaParts.push(`🎙️ ${formatSecs(note.audio.duration || 0)}`);
  }
  metaParts.push(timeAgo(note.updatedAt));

  const metaLine = el('div', { class: 'note-list-meta' }, metaParts.join(' · '));

  const bodyWrap = el('div', { class: 'note-list-body' },
    titleRow,
    previewEl,
    metaLine
  );

  const isRtl = document.dir === 'rtl' || document.documentElement.dir === 'rtl';
  const arrowEl = el('span', { class: 'note-list-arrow', text: isRtl ? '⫷' : '⫸' });

  return el('li', {
    class: `note${note.id === activeId ? ' active' : ''}`,
    dataset: { id: note.id, color: note.paperColor || 'white', style: note.pageStyle || 'ruled' },
    onclick: () => openNote(note.id),
  },
    iconBox,
    bodyWrap,
    arrowEl
  );
}

function noteRow(note, mode = 'grid') {
  return mode === 'grid' ? noteRowGrid(note) : noteRowList(note);
}

function openNote(noteId) {
  activeId = noteId;
  view = 'editor';
  isChecklistOpen = false;
  persist();
  render();
  const ed = $('#editor');
  if (ed) {
    ed.scrollTop = 0;
    ed.focus();
  }
  const canvas = $('#editorCanvas');
  if (canvas) canvas.scrollTop = 0;
}

let flashTimer = null;
function flashSaved() {
  const meta = $('#meta');
  if (!meta || view !== 'editor') return;
  meta.classList.add('saved-flash');
  clearTimeout(flashTimer);
  flashTimer = setTimeout(() => meta.classList.remove('saved-flash'), 600);
}

function flashHint(text) {
  const meta = $('#meta');
  if (!meta) return;
  const original = meta.textContent;
  meta.textContent = text;
  meta.style.color = '#ef4444';
  setTimeout(() => {
    meta.style.color = '';
    renderEditor();
  }, 3200);
}

/* ---------- mutations ---------- */

function edit(value) {
  const note = active();
  if (!note || note.body === value) return;
  // Guard against accidental blanking out of substantial notes on blur/re-render artifacts
  if (!value && note.body && note.body.trim().length > 10 && document.activeElement !== $('#editor')) {
    console.warn('Blocked accidental note wipeout while editor is not focused');
    return;
  }
  note.body = value;
  note.updatedAt = Date.now();
  persist();
  $('#title').textContent = titleOf(note);
  const plain = plainTextOf(value);
  const words = plain.trim() ? plain.trim().split(/\s+/).length : 0;
  $('#meta').textContent = t('notes.meta', { n: digits(words), when: t('common.now') });
}

function createNote(style = 'ruled', color = 'white') {
  stopAudioPlayback();
  const n = {
    id: uid(),
    body: '',
    pageStyle: style || 'ruled',
    paperColor: color || 'white',
    checklist: [],
    checklistCollapsed: false,
    audio: null,
    pinned: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  items.unshift(n);
  openNote(n.id);
}

function removeActive() {
  const note = active();
  if (!note) return;
  stopAudioPlayback();
  const hasContent = (note.body || '').trim() || (note.checklist && note.checklist.length) || note.audio;

  const doDelete = () => {
    items = items.filter((n) => n.id !== note.id);
    activeId = items.length ? items[0].id : null;
    isChecklistOpen = false;
    persist();
    render();
  };

  if (!hasContent) {
    doDelete();
    return;
  }

  confirmDelete({
    title: t('notes.confirmDeleteNote'),
    desc: titleOf(note),
    confirmText: t('notes.delete'),
    cancelText: t('common.cancel'),
    onConfirm: doDelete,
  });
}

/* ---------- wiring ---------- */

function wire() {
  $('#headIcon').append(icon('note'));
  $('#listBtn').append(icon('list'));
  $('#newBtn').append(icon('plus'));
  $('#settingsBtn').append(icon('gear'));
  $('#closeBtn').append(icon('close'));
  $('#delBtn').append(icon('trash'));
  $('#searchIcon').append(icon('search', 13));

  // Editor Input & Selection Tracking (WYSIWYG Rich Text Support)
  const ed = $('#editor');
  if (ed) {
    Object.defineProperty(ed, 'value', {
      get() {
        return plainTextOf(this.innerHTML);
      },
      set(val) {
        const str = String(val ?? '');
        if (!str) {
          this.innerHTML = '';
        } else if (str.includes('<') && (str.includes('</') || str.includes('/>') || str.includes('<br>'))) {
          this.innerHTML = str;
        } else {
          const lines = str.split('\n');
          this.innerHTML = lines.map((line) => `<div>${line ? escapeHtml(line) : '<br>'}</div>`).join('');
        }
        edit(this.innerHTML);
      },
      configurable: true,
    });

    ed.addEventListener('input', () => {
      edit(ed.innerHTML);
      updateFormatUIState();
    });
    ed.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.target.blur();
      } else if (e.ctrlKey || e.metaKey) {
        const k = e.key.toLowerCase();
        if (k === 'b') {
          e.preventDefault();
          applyInlineFormat('bold');
        } else if (k === 'i') {
          e.preventDefault();
          applyInlineFormat('italic');
        } else if (k === 'u') {
          e.preventDefault();
          applyInlineFormat('underline');
        }
      }
    });
    ed.addEventListener('keyup', updateFormatUIState);
    ed.addEventListener('mouseup', updateFormatUIState);
  }

  document.addEventListener('selectionchange', () => {
    if (document.activeElement === ed) {
      updateFormatUIState();
    }
  });

  // Prevent Format Drawer clicks from causing editor to lose focus/selection
  $('#formatDrawer')?.addEventListener('mousedown', (e) => {
    const btn = e.target.closest('button, .font-card, .fmt-btn, .tier-btn');
    if (btn && btn.id !== 'formatCloseBtn') {
      e.preventDefault();
    }
  });

  // New Note Modal Opening
  $('#newBtn').addEventListener('click', () => {
    toggleFormatDrawer(false);
    openNewNoteModal();
  });
  $('#delBtn').addEventListener('click', removeActive);

  // Pin button (Idea 5)
  $('#notePinBtn')?.addEventListener('click', toggleActivePin);

  // Floating Format Sheet Trigger (Aa button in bottom right)
  $('#formatFabBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFormatDrawer();
  });
  $('#formatCloseBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFormatDrawer(false);
  });

  // Format Tier buttons (Title, Heading, Subheading, Body) - Applies to current line only
  document.querySelectorAll('.tier-btn').forEach((b) => {
    b.addEventListener('click', (e) => {
      e.preventDefault();
      applyTierFormat(b.dataset.tier);
    });
  });

  // Format Inline Style buttons (B, I, U, S) - Applies ONLY to selected text or upcoming typing
  $('#fmtBoldBtn')?.addEventListener('click', (e) => { e.preventDefault(); applyInlineFormat('bold'); });
  $('#fmtItalicBtn')?.addEventListener('click', (e) => { e.preventDefault(); applyInlineFormat('italic'); });
  $('#fmtUnderlineBtn')?.addEventListener('click', (e) => { e.preventDefault(); applyInlineFormat('underline'); });
  $('#fmtStrikeBtn')?.addEventListener('click', (e) => { e.preventDefault(); applyInlineFormat('strike'); });

  // Format Text Alignment buttons (Right, Center, Left, Justify)
  document.querySelectorAll('.fmt-btn[data-align]').forEach((b) => {
    b.addEventListener('click', (e) => {
      e.preventDefault();
      updateFormatProp('align', b.dataset.align);
    });
  });

  // Format Font Family buttons (Modern, Handwriting, Serif, Mono - Visual Font Cards)
  document.querySelectorAll('.font-chip-btn').forEach((b) => {
    b.addEventListener('click', (e) => {
      e.preventDefault();
      updateFormatProp('font', b.dataset.font);
    });
  });

  // View Mode Toggle (Bento Grid ⊞ vs Horizontal List ☰)
  $('#viewGridBtn')?.addEventListener('click', () => {
    viewMode = 'grid';
    try { localStorage.setItem('notes_view_mode', 'grid'); } catch {}
    renderList();
  });
  $('#viewListBtn')?.addEventListener('click', () => {
    viewMode = 'list';
    try { localStorage.setItem('notes_view_mode', 'list'); } catch {}
    renderList();
  });

  // Modal Actions
  $('#modalCloseBtn')?.addEventListener('click', closeNewNoteModal);
  $('#modalCancelBtn')?.addEventListener('click', closeNewNoteModal);
  $('#modalSubmitBtn')?.addEventListener('click', () => {
    closeNewNoteModal();
    toggleFormatDrawer(false);
    createNote(selectedModalStyle, selectedModalColor);
  });

  document.querySelectorAll('.new-style-card').forEach((card) => {
    card.addEventListener('click', () => {
      selectedModalStyle = card.dataset.style;
      updateModalSelectionUI();
    });
  });

  document.querySelectorAll('.new-color-swatch').forEach((swatch) => {
    swatch.addEventListener('click', () => {
      selectedModalColor = swatch.dataset.color;
      updateModalSelectionUI();
    });
  });

  $('#newNoteModal')?.addEventListener('click', (e) => {
    if (e.target === $('#newNoteModal')) {
      closeNewNoteModal();
    }
  });

  document.addEventListener('click', (e) => {
    if (isFormatDrawerOpen && !e.target.closest('#formatDrawer') && !e.target.closest('#formatFabBtn')) {
      toggleFormatDrawer(false);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (isFormatDrawerOpen) {
        e.stopPropagation();
        toggleFormatDrawer(false);
        return;
      }
      const modal = $('#newNoteModal');
      if (modal && !modal.hidden) {
        e.stopPropagation();
        closeNewNoteModal();
      }
    }
  });

  // List View Toggle
  $('#listBtn').addEventListener('click', () => {
    stopAudioPlayback();
    toggleFormatDrawer(false);
    view = view === 'list' ? 'editor' : 'list';
    query = '';
    const s = $('#search');
    if (s) s.value = '';
    render();
    if (view === 'list') setTimeout(() => $('#search').focus(), 60);
  });

  $('#search').addEventListener('input', (e) => { query = e.target.value; renderList(); });
  $('#search').addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.stopPropagation(); query = ''; e.target.value = ''; renderList(); }
  });

  // Smooth Mouse Wheel Scrolling for List Pane (scrolls notes container from anywhere in list pane)
  const listPaneEl = $('#listPane');
  const notesScrollEl = $('#notesScrollContainer');
  if (listPaneEl && notesScrollEl) {
    listPaneEl.addEventListener('wheel', (e) => {
      if (e.target.closest('#notesTagBar') && Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        return;
      }
      if (!e.target.closest('#notesScrollContainer')) {
        notesScrollEl.scrollTop += e.deltaY;
      }
    }, { passive: true });
  }

  $('#settingsBtn').addEventListener('click', () => window.widgets.win.openSettings('notes'));
  $('#closeBtn').addEventListener('click', () => { stopAudioPlayback(); closeWindow(); });

  // To-Do Checklist Button
  $('#toolTodoBtn').addEventListener('click', () => {
    const note = active();
    if (!note) return;
    if (!note.checklist || note.checklist.length === 0) {
      isChecklistOpen = true;
      note.checklistCollapsed = false;
      addChecklistItem();
    } else {
      note.checklistCollapsed = !note.checklistCollapsed;
      isChecklistOpen = true;
      persist();
      try { persist.flush?.(); } catch (e) {}
      renderChecklist();
    }
  });

  $('#addChecklistBtn').addEventListener('click', () => addChecklistItem());

  $('#toggleChecklistBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleChecklistCollapse();
  });

  $('#checklistHeader')?.addEventListener('click', () => {
    toggleChecklistCollapse();
  });

  $('#noteChecklistSection')?.addEventListener('click', (e) => {
    const note = active();
    if (note && note.checklistCollapsed) {
      toggleChecklistCollapse();
    }
  });

  $('#checklistHeader')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleChecklistCollapse();
    }
  });

  // Voice Recording Buttons
  $('#toolVoiceBtn').addEventListener('click', () => {
    const bar = $('#audioRecordBar');
    if (bar.hidden) {
      startAudioRecording();
    } else {
      stopAudioRecording(true);
    }
  });

  $('#stopRecordBtn').addEventListener('click', () => stopAudioRecording(true));
  $('#cancelRecordBtn').addEventListener('click', () => stopAudioRecording(false));

  // Audio Playback
  $('#audioPlayBtn').addEventListener('click', toggleAudioPlay);
  $('#audioDelBtn').addEventListener('click', deleteCurrentAudio);

  const audioEl = $('#noteAudioEl');
  if (audioEl) {
    audioEl.addEventListener('play', startAudioProgressLoop);
    audioEl.addEventListener('pause', stopAudioProgressLoop);
    audioEl.addEventListener('timeupdate', () => {
      if (!audioProgressRaf && isAudioPlaying) {
        startAudioProgressLoop();
      }
    });

    audioEl.addEventListener('ended', () => {
      stopAudioProgressLoop();
      isAudioPlaying = false;
      $('#playIcon').textContent = '▶';
      const scrub = $('#audioScrub');
      if (scrub) scrub.value = 0;
      updateWaveformProgress(0);
      const note = active();
      $('#audioTime').textContent = `00:00 / ${formatSecs(note?.audio?.duration || 0)}`;
    });
  }

  const scrubEl = $('#audioScrub');
  if (scrubEl) {
    scrubEl.addEventListener('mousedown', () => { isUserScrubbing = true; });
    scrubEl.addEventListener('touchstart', () => { isUserScrubbing = true; }, { passive: true });
    scrubEl.addEventListener('input', (e) => {
      isUserScrubbing = true;
      const audioEl = $('#noteAudioEl');
      const note = active();
      const duration = audioEl?.duration || note?.audio?.duration || 0;
      if (audioEl && duration > 0) {
        const targetTime = (Number(e.target.value) / 100) * duration;
        audioEl.currentTime = targetTime;
        updateWaveformProgress(Number(e.target.value));
        $('#audioTime').textContent = `${formatSecs(targetTime)} / ${formatSecs(duration)}`;
      }
    });
    scrubEl.addEventListener('change', () => {
      isUserScrubbing = false;
    });
  }

  document.addEventListener('mouseup', () => {
    if (isUserScrubbing) isUserScrubbing = false;
  });
  document.addEventListener('touchend', () => {
    if (isUserScrubbing) isUserScrubbing = false;
  });

  // IPC change synchronization
  window.widgets.notes.onChange((next) => {
    if (!next) return;
    if (JSON.stringify(next.items) === JSON.stringify(items)) return;
    const caret = $('#editor')?.selectionStart;
    items = (next.items || []).map(normalizeNote);
    if (next.activeId && items.some((n) => n.id === next.activeId)) activeId = next.activeId;
    render();
    if (view === 'editor' && caret !== undefined && $('#editor')) {
      try { $('#editor').setSelectionRange(caret, caret); } catch {}
    }
  });

  // Settings & Language change synchronization
  let lastNotesSettingsHash = null;
  if (window.widgets?.settings?.onChange) {
    window.widgets.settings.onChange((s) => {
      const relevant = JSON.stringify({
        lang: s?.lang,
        theme: s?.theme,
        accent: s?.accent,
        look: s?.look,
        notes: s?.notes,
        wStyle: s?.widgetStyles?.notes,
      });
      if (relevant === lastNotesSettingsHash) return;
      lastNotesSettingsHash = relevant;
      translate(document);
      const ed = $('#editor');
      if (ed) {
        ed.setAttribute('data-placeholder', t('notes.ph'));
      }
      const note = active();
      if (note) {
        applyPageStyleAndColor(note.pageStyle, note.paperColor);
      }
      if (view === 'list') {
        renderList();
      }
    });
  }

  window.addEventListener('beforeunload', () => {
    stopAudioPlayback();
    persist.flush();
  });
}

boot(async () => {
  const data = (await window.widgets.notes.get()) || { items: [], activeId: null };
  let needsPersist = false;
  items = (data.items || []).map((n) => {
    if (n && (n.pageStyle === 'kraft' || n.pageStyle === 'classic' || n.style === 'kraft' || n.style === 'classic')) {
      needsPersist = true;
    }
    return normalizeNote(n);
  });
  activeId = data.activeId;
  wire();
  render();
  if (needsPersist) {
    persist();
  }
});
