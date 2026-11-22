'use strict';
/* Task window: everything about one task. Every change is saved at once
   through the main process, which also schedules the reminders. */

const { $, el, icon, boot, closeWindow, debounce, t, strings, digits, timeAgo, until, uid, confirmDelete } = window.UI;
const { hidesAt, whenLabel } = window.TaskKit;

strings({
  ar: {
    'task.title': 'تفاصيل المهمة',
    'task.gone': 'هذه المهمة لم تعد موجودة.',
    'task.notes': 'ملاحظات',
    'task.notesPh': 'أي تفاصيل تريد تذكّرها عن هذه المهمة…',
    'task.reminders': 'التذكيرات',
    'task.noReminders': 'لا توجد تذكيرات. اختر وقتًا سريعًا أو حدّد تاريخًا ووقتًا.',
    'task.add': 'إضافة',
    'task.details': 'تفاصيل',
    'task.priority': 'الأولوية',
    'task.p0': 'عادية',
    'task.due': 'تاريخ التسليم',
    'task.clearDue': 'إزالة التاريخ',
    'task.hideAfter': 'بعد الإنجاز',
    'task.hideDefault': 'حسب الإعداد العام ({value})',
    'task.never': 'تبقى ولا تختفي',
    'task.hours': 'تختفي بعد {n} ساعة',
    'task.hour1': 'تختفي بعد ساعة',
    'task.week': 'تختفي بعد أسبوع',
    'task.willHide': 'ستختفي من القائمة {when}.',
    'task.hiddenNow': 'مخفية من القائمة الآن (تظهر في عرض «المنجز»).',
    'task.delete': 'حذف المهمة',
    'task.confirm': 'اضغط مرة أخرى للحذف',
    'task.created': 'أُضيفت {ago}',
    'task.doneAt': 'أُنجزت {ago}',
    'task.markDone': 'تم',
    'task.markUndone': 'إلغاء الإنجاز',
    'task.in': 'بعد {left}',
    'task.fired': 'تم التذكير',
    'task.snoozeM': '+{n} د',
    'task.snoozeH': '+{n} س',
    'task.snoozeTitle': 'أعد التذكير لاحقًا',
    'task.remove': 'حذف التذكير',
    'task.q.10m': 'بعد {n} دقائق',
    'task.q.1h': 'بعد ساعة',
    'task.q.tonight': 'الليلة {n} م',
    'task.q.tomorrow': 'غدًا {n} ص',
    'task.q.dayBefore': 'قبل التسليم بيوم',
    'task.past': 'اختر وقتًا لم يأتِ بعد.',
    'task.setClockAlarm': '⏰ تفعيل منبه في الساعة أيضاً',
    'task.alarmActive': 'منبه نشط في الساعة (انقر للإلغاء)',
    'task.alarmSet': 'تفعيل منبه في الساعة لهذا التذكير',
    'task.alarmPillActive': '⏰ منبه بالساعة',
    'task.alarmPillInactive': '⏰ تفعيل منبه',
    'task.crOpenBtn': 'فتح في Classroom 🔗',
    'task.crHideCourse': '🚫 إخفاء المادة',
    'task.crHideCourseTitle': 'استبعاد هذه المادة تماماً من الودجت',
  },
  en: {
    'task.title': 'Task details',
    'task.gone': 'This task no longer exists.',
    'task.notes': 'Notes',
    'task.notesPh': 'Anything you want to remember about this task…',
    'task.reminders': 'Reminders',
    'task.noReminders': 'No reminders yet. Pick a quick time or set a date and time.',
    'task.add': 'Add',
    'task.details': 'Details',
    'task.priority': 'Priority',
    'task.p0': 'Normal',
    'task.due': 'Due date',
    'task.clearDue': 'Clear date',
    'task.hideAfter': 'After completion',
    'task.hideDefault': 'Use the general setting ({value})',
    'task.never': 'Keep it in the list',
    'task.hours': 'Hide after {n} hours',
    'task.hour1': 'Hide after 1 hour',
    'task.week': 'Hide after a week',
    'task.willHide': 'It will leave the list {when}.',
    'task.hiddenNow': 'Hidden from the list now (still in the "Done" view).',
    'task.delete': 'Delete task',
    'task.confirm': 'Press again to delete',
    'task.created': 'Added {ago}',
    'task.doneAt': 'Done {ago}',
    'task.markDone': 'Done',
    'task.markUndone': 'Mark as not done',
    'task.in': 'in {left}',
    'task.fired': 'Reminded',
    'task.snoozeM': '+{n} min',
    'task.snoozeH': '+{n} h',
    'task.snoozeTitle': 'Remind me again later',
    'task.remove': 'Remove reminder',
    'task.q.10m': 'In {n} minutes',
    'task.q.1h': 'In 1 hour',
    'task.q.tonight': 'Tonight {n} PM',
    'task.q.tomorrow': 'Tomorrow {n} AM',
    'task.q.dayBefore': 'Day before due',
    'task.past': 'Pick a time that has not passed yet.',
    'task.setClockAlarm': '⏰ Also set clock alarm',
    'task.alarmActive': 'Clock alarm active (click to cancel)',
    'task.alarmSet': 'Set clock alarm for this reminder',
    'task.alarmPillActive': '⏰ Clock alarm',
    'task.alarmPillInactive': '⏰ Set alarm',
    'task.crOpenBtn': 'Open in Classroom 🔗',
    'task.crHideCourse': '🚫 Hide Course',
    'task.crHideCourseTitle': 'Hide this course from widgets',
  },
});

const HIDE_CHOICES = [null, 0, 1, 3, 6, 12, 24, 48, 168];

let id = new URLSearchParams(location.search).get('id');
let task = null;

/* ---------- saving ---------- */

async function patch(p) {
  if (!task) return;
  const cfg = window.UI.settings();
  const preventDone = cfg?.classroom?.preventDoneIfNotTurnedIn !== false;
  if (p && p.done === true && !task.done && task.classroom) {
    const isSubmitted = task.classroom.state === 'TURNED_IN' || task.classroom.state === 'RETURNED' || task.classroom.assignedGrade !== undefined;
    if (!isSubmitted && preventDone) {
      flashHint('لم يتم تسجيل التسليم على Classroom بعد (يمكنك تعديل القيد من الإعدادات)');
      renderMeta();
      return;
    }
    p.doneManually = true;
  }
  Object.assign(task, p);
  const saved = await window.widgets.todos.patch(id, p);
  if (saved && saved.rejected) {
    flashHint(saved.reason || 'لم يتم التسليم بعد على Classroom!');
    task.done = false;
  } else if (saved) {
    task = saved;
  }
  renderMeta();
}

const saveNotes = debounce((value) => patch({ notes: value }), 400);
const saveText = debounce((value) => { if (value.trim()) patch({ text: value }); }, 400);

/* ---------- labels ---------- */

function hoursLabel(h) {
  if (h === 0) return t('task.never');
  if (h === 1) return t('task.hour1');
  if (h === 168) return t('task.week');
  return t('task.hours', { n: digits(h) });
}

/* ---------- rendering ---------- */

function renderMeta() {
  if (!task) return;
  const box = $('#doneBox');
  box.classList.toggle('on', Boolean(task.done));
  box.title = task.done ? t('task.markUndone') : t('task.markDone');

  // Classroom Card
  if (task.classroom) {
    $('#crCard').hidden = false;
    $('#crCourse').textContent = `[${task.classroom.courseName || 'Google Classroom'}]`;
    const isSubmitted = task.classroom.state === 'TURNED_IN' || task.classroom.state === 'RETURNED' || task.done;
    const statusEl = $('#crStatus');
    statusEl.textContent = isSubmitted ? '✅ تم التسليم على Google Classroom' : '⏳ لم يتم التسليم بعد على الموقع الرسمي';
    statusEl.classList.toggle('submitted', isSubmitted);
    const deadlineEl = $('#crDeadline');
    if (deadlineEl) {
      if (task.classroom.deadlineTimestamp) {
        const dt = new Date(Number(task.classroom.deadlineTimestamp));
        if (!isNaN(dt.getTime())) {
          deadlineEl.textContent = `📅 موعد التسليم: ${whenLabel(dt.getTime())}`;
          deadlineEl.hidden = false;
        } else {
          deadlineEl.hidden = true;
        }
      } else if (task.due) {
        const dl = dueLabel(task.due);
        deadlineEl.textContent = `📅 موعد التسليم: ${dl ? dl.text : task.due}`;
        deadlineEl.hidden = false;
      } else {
        deadlineEl.hidden = true;
      }
    }
    $('#crOpenBtn').onclick = () => {
      let link = task.classroom.alternateLink;
      if (!link) return;
      const cfg = window.widgets.settings.get();
      const crEmail = cfg?.classroom?.userEmail || task?.classroom?.userEmail;
      if (crEmail && typeof link === 'string' && link.startsWith('https://classroom.google.com')) {
        link = `https://accounts.google.com/AccountChooser?Email=${encodeURIComponent(crEmail)}&continue=${encodeURIComponent(link)}`;
      }
      window.widgets.openExternal(link);
    };
    const hideBtn = $('#crHideCourseBtn');
    if (hideBtn) {
      hideBtn.onclick = async () => {
        const cName = task.classroom.courseName || task.classroom.courseId;
        if (!cName) return;
        const cfg = (await window.widgets.settings.get()) || {};
        cfg.classroom = cfg.classroom || {};
        cfg.classroom.hiddenCourses = cfg.classroom.hiddenCourses || [];
        if (!cfg.classroom.hiddenCourses.includes(cName)) {
          cfg.classroom.hiddenCourses.push(cName);
        }
        cfg.classroom.filterHiddenCourses = true;
        await window.widgets.settings.set({ classroom: cfg.classroom });
        closeWindow();
      };
    }
  } else {
    $('#crCard').hidden = true;
  }

  const bits = [t('task.created', { ago: timeAgo(task.createdAt || Date.now()) })];
  if (task.done && task.doneAt) bits.push(t('task.doneAt', { ago: timeAgo(task.doneAt) }));
  $('#sub').textContent = bits.join(' · ');

  for (const b of document.querySelectorAll('#priority button')) {
    b.classList.toggle('on', Number(b.dataset.p) === (task.priority || 0));
  }

  $('#due').value = task.due || '';
  $('#clearDue').hidden = !task.due;

  const general = Number(window.UI.settings().todo?.hideDoneAfterHours) || 0;
  const sel = $('#hideAfter');
  sel.replaceChildren(...HIDE_CHOICES.map((h) => el('option', {
    value: h === null ? 'default' : String(h),
    selected: (task.hideAfter ?? null) === h,
  }, h === null ? t('task.hideDefault', { value: hoursLabel(general) }) : hoursLabel(h))));

  const at = hidesAt(task, window.UI.settings());
  const info = $('#hideInfo');
  info.hidden = !at;
  if (at) info.textContent = at <= Date.now() ? t('task.hiddenNow') : t('task.willHide', { when: whenLabel(at) });

  renderQuick();
}

function renderReminders() {
  const list = (task.reminders || []).slice().sort((a, b) => a.at - b.at);
  $('#noReminders').hidden = list.length > 0;
  $('#reminders').replaceChildren(...list.map((r) => {
    const status = r.fired
      ? t('task.fired')
      : t('task.in', { left: until(r.at) });
    const actions = [];
    if (r.fired) {
      actions.push(el('button', { class: 'chip small', title: t('task.snoozeTitle'), onclick: () => snooze(r.id, 10) }, t('task.snoozeM', { n: digits(10) })));
      actions.push(el('button', { class: 'chip small', title: t('task.snoozeTitle'), onclick: () => snooze(r.id, 60) }, t('task.snoozeH', { n: digits(1) })));
    }
    const hasAlarm = Boolean(r.hasAlarm);
    actions.push(el('button', {
      class: `chip small alarm-toggle-chip${hasAlarm ? ' on' : ''}`,
      title: hasAlarm ? t('task.alarmActive') : t('task.alarmSet'),
      onclick: () => toggleAlarmForReminder(r.id),
    }, hasAlarm ? t('task.alarmPillActive') : t('task.alarmPillInactive')));
    actions.push(el('button', { class: 'icon-btn danger', title: t('task.remove'), onclick: () => removeReminder(r.id) }, icon('close')));
    return el('li', { class: `reminder${r.fired ? ' fired' : ''}` },
      el('span', { class: 'r-icon' }, icon(hasAlarm ? 'clock' : 'bell')),
      el('div', { class: 'r-text' },
        el('div', { class: 'r-when', text: whenLabel(r.at) }),
        el('div', { class: 'r-status', text: status })),
      el('div', { class: 'r-actions' }, ...actions));
  }));
}

function render() {
  const missing = !task;
  $('#gone').hidden = !missing;
  $('#form').hidden = missing;
  if (missing) return;
  if (document.activeElement !== $('#text')) $('#text').value = task.text || '';
  if (document.activeElement !== $('#notes')) $('#notes').value = task.notes || '';
  renderMeta();
  renderReminders();
}

/* ---------- reminders ---------- */

function at(hours, minutes = 0, dayOffset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hours, minutes, 0, 0);
  return d.getTime();
}

function quickChoices() {
  const now = Date.now();
  const list = [
    ['task.q.10m', now + 10 * 60e3, 10],
    ['task.q.1h', now + 60 * 60e3],
  ];
  const tonight = at(21);
  if (tonight > now + 5 * 60e3) list.push(['task.q.tonight', tonight, 9]);
  list.push(['task.q.tomorrow', at(9, 0, 1), 9]);
  if (task && task.due) {
    const [y, m, d] = task.due.split('-').map(Number);
    const before = new Date(y, m - 1, d - 1, 9).getTime();
    if (before > now) list.push(['task.q.dayBefore', before]);
  }
  return list;
}

function renderQuick() {
  $('#quick').replaceChildren(...quickChoices().map(([key, ts, n]) =>
    el('button', { class: 'chip', title: whenLabel(ts), onclick: () => addReminder(ts) }, t(key, { n: digits(n ?? '') }))));
}

async function addReminder(ts) {
  if (!task || !Number.isFinite(ts)) return;
  if (ts <= Date.now()) { flashHint(t('task.past')); return; }
  const shouldSetAlarm = Boolean($('#setClockAlarm')?.checked);
  const remId = uid();
  const newReminder = { id: remId, at: ts, fired: false, hasAlarm: shouldSetAlarm };

  if (shouldSetAlarm) {
    const d = new Date(ts);
    const pad = (n) => String(n).padStart(2, '0');
    const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    try {
      await window.widgets.clock?.setAlarmForTask?.(task, timeStr, [0, 1, 2, 3, 4, 5, 6], 'once', remId);
    } catch (e) {
      console.error('Failed to set clock alarm:', e);
    }
  }

  const reminders = [...(task.reminders || []), newReminder];
  await patch({ reminders });
  renderReminders();
}

async function removeReminder(rid) {
  const rem = (task.reminders || []).find((r) => r.id === rid);
  if (rem && rem.hasAlarm) {
    try {
      await window.widgets.clock?.removeAlarmForTask?.(task.id, rid);
    } catch (e) {
      console.error('Failed to remove clock alarm:', e);
    }
  }
  const reminders = (task.reminders || []).filter((r) => r.id !== rid);
  await patch({ reminders });
  renderReminders();
}

async function toggleAlarmForReminder(rid) {
  const rem = (task.reminders || []).find((r) => r.id === rid);
  if (!rem) return;
  const nextHasAlarm = !rem.hasAlarm;

  if (nextHasAlarm) {
    const d = new Date(rem.at);
    const pad = (n) => String(n).padStart(2, '0');
    const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    try {
      await window.widgets.clock?.setAlarmForTask?.(task, timeStr, [0, 1, 2, 3, 4, 5, 6], 'once', rid);
    } catch (e) {
      console.error('Failed to set clock alarm:', e);
    }
  } else {
    try {
      await window.widgets.clock?.removeAlarmForTask?.(task.id, rid);
    } catch (e) {
      console.error('Failed to remove clock alarm:', e);
    }
  }

  const reminders = (task.reminders || []).map((r) => (r.id === rid ? { ...r, hasAlarm: nextHasAlarm } : r));
  await patch({ reminders });
  renderReminders();
}

function snooze(rid, minutes) {
  const reminders = (task.reminders || []).map((r) => (r.id === rid
    ? { ...r, at: Date.now() + minutes * 60e3, fired: false, firedAt: undefined }
    : r));
  patch({ reminders }).then(renderReminders);
}

function flashHint(text) {
  const n = $('#noReminders');
  n.hidden = false;
  n.textContent = text;
  n.classList.add('warn');
  setTimeout(() => { n.classList.remove('warn'); n.textContent = t('task.noReminders'); renderReminders(); }, 2200);
}

/** Default for the custom picker: the next whole hour. */
function presetWhen() {
  const d = new Date(Date.now() + 60 * 60e3);
  d.setMinutes(0, 0, 0);
  const pad = (n) => String(n).padStart(2, '0');
  $('#when').value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/* ---------- loading ---------- */

async function load(nextId) {
  if (nextId) id = nextId;
  task = id ? await window.widgets.todos.one(id) : null;
  render();
  presetWhen();
}

/* ---------- wiring ---------- */

boot(async () => {
  $('#headIcon').append(icon('list'));
  $('#closeBtn').append(icon('close'));
  $('#doneBox').append(icon('check'));
  $('#clearDue').append(icon('close'));

  $('#closeBtn').addEventListener('click', () => closeWindow({ hideOnly: true }));
  $('#doneBox').addEventListener('click', async () => {
    const nextDone = !task.done;
    if (nextDone) {
      try {
        await window.widgets.clock?.removeAlarmForTask?.(task.id);
      } catch (e) {}
    }
    await patch({ done: nextDone });
  });
  $('#text').addEventListener('input', (e) => saveText(e.target.value));
  $('#text').addEventListener('keydown', (e) => { if (e.key === 'Enter') e.target.blur(); });
  $('#notes').addEventListener('input', (e) => saveNotes(e.target.value));
  $('#notes').addEventListener('keydown', (e) => { if (e.key === 'Escape') e.stopPropagation(); });

  for (const b of document.querySelectorAll('#priority button')) {
    b.addEventListener('click', () => patch({ priority: Number(b.dataset.p) }));
  }
  $('#due').addEventListener('change', (e) => patch({ due: e.target.value || null }));
  $('#clearDue').addEventListener('click', () => patch({ due: null }));
  $('#hideAfter').addEventListener('change', (e) => patch({ hideAfter: e.target.value === 'default' ? null : Number(e.target.value) }));

  $('#addReminder').addEventListener('click', () => {
    const v = $('#when').value;
    if (!v) return;
    addReminder(new Date(v).getTime());
  });

  $('#deleteBtn').addEventListener('click', (e) => {
    confirmDelete({
      title: 'هل أنت متأكد من الحذف؟',
      desc: task?.text || '',
      confirmText: 'حذف',
      cancelText: 'إلغاء',
      onConfirm: async () => {
        try {
          await window.widgets.clock?.removeAlarmForTask?.(id);
        } catch (err) {}
        await window.widgets.todos.remove(id);
        closeWindow({ hideOnly: true });
      },
    });
  });

  window.widgets.todos.onLoad((nextId) => load(nextId));
  window.widgets.todos.onChange((items) => {
    const fresh = (items || []).find((x) => x.id === id) || null;
    task = fresh;
    render();
  });
  window.widgets.settings.onChange(() => renderMeta());
  setInterval(() => { if (task) { renderReminders(); renderMeta(); } }, 30_000);

  await load();
});
