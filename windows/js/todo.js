'use strict';
/* To-do widget: add, tick, edit in place, reorder by dragging, delete, and
   open any task's details (notes, reminders, priority, due date) from its
   "⋯" button. Finished tasks can leave the list after a set time. */

const { $, el, icon, boot, closeWindow, uid, debounce, t, strings, digits, confirmDelete } = window.UI;
const { isHidden, nextReminder, whenLabel, dueLabel } = window.TaskKit;

strings({
  ar: {
    'todo.title': 'المهام',
    'todo.addPh': 'أضف مهمة…',
    'todo.addBtn': 'إضافة',
    'todo.filter': 'تبديل العرض',
    'todo.summary': '{done} من {total} · {filter}',
    'todo.start': 'ابدأ بإضافة مهمة',
    'todo.f.all': 'الكل',
    'todo.f.active': 'المتبقي',
    'todo.f.done': 'المنجز',
    'todo.hidden': '{n} مخفية',
    'todo.emptyView': 'لا شيء هنا ضمن هذا العرض.',
    'todo.empty': 'لا توجد مهام بعد.\nاكتب مهمتك الأولى في الأعلى.',
    'todo.markDone': 'تم',
    'todo.markUndone': 'إلغاء الإنجاز',
    'todo.more': 'التفاصيل والإعدادات',
    'todo.delete': 'حذف',
    'todo.notes': 'فيها ملاحظات',
    'todo.reminder': 'تذكير',
    'todo.reminders': '{n} تذكيرات',
    'todo.superUrgent': '🚨 عاجل جداً',
    'todo.crSubmitted': '✓ مسلّم',
    'todo.crUnsubmitted': '⏳ لم يُسلّم',
    'todo.syncing': 'جاري المزامنة…',
    'todo.crAuthAlertTitle': 'انقطع الاتصال بـ Google Classroom',
    'todo.crAuthAlertSub': 'انتهت صلاحية الجلسة، يرجى إعادة تسجيل الدخول لمزامنة الواجبات.',
    'todo.reconnect': 'إعادة الربط',
    'todo.toggleAdd': 'إضافة مهمة جديدة',
  },
  en: {
    'todo.title': 'Tasks',
    'todo.addPh': 'Add a task…',
    'todo.addBtn': 'Add',
    'todo.filter': 'Change view',
    'todo.summary': '{done} of {total} · {filter}',
    'todo.start': 'Start by adding a task',
    'todo.f.all': 'All',
    'todo.f.active': 'Remaining',
    'todo.f.done': 'Done',
    'todo.hidden': '{n} hidden',
    'todo.emptyView': 'Nothing here in this view.',
    'todo.empty': 'No tasks yet.\nType your first one above.',
    'todo.markDone': 'Done',
    'todo.markUndone': 'Mark as not done',
    'todo.more': 'Details & settings',
    'todo.delete': 'Delete',
    'todo.notes': 'Has notes',
    'todo.reminder': 'Reminder',
    'todo.reminders': '{n} reminders',
    'todo.superUrgent': '🚨 Super Urgent',
    'todo.crSubmitted': '✓ Turned In',
    'todo.crUnsubmitted': '⏳ Not Turned In',
    'todo.syncing': 'Syncing…',
    'todo.crAuthAlertTitle': 'Google Classroom Disconnected',
    'todo.crAuthAlertSub': 'Session expired. Please reconnect in Settings to sync assignments.',
    'todo.reconnect': 'Reconnect',
    'todo.toggleAdd': 'Add new task',
  },
});

let urgentIds = new Set();
let pendingModalTask = null;

function isSuperUrgent(task) {
  if (!task || task.done) return false;
  if (urgentIds.has(task.id)) return true;
  let deadline = null;
  if (task.classroom?.deadlineTimestamp) {
    deadline = Number(task.classroom.deadlineTimestamp);
  } else if (task.due) {
    if (typeof task.due === 'number') deadline = task.due;
    else if (typeof task.due === 'string') {
      const trimmed = task.due.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        const [y, m, d] = trimmed.split('-').map(Number);
        deadline = new Date(y, m - 1, d, 23, 59, 59).getTime();
      } else {
        deadline = new Date(trimmed).getTime();
      }
    }
  }
  if (!deadline || isNaN(deadline)) return false;
  const remaining = deadline - Date.now();
  const thresholdHours = Number(settings().superUrgent?.thresholdHours) || 3;
  return remaining > -86400000 && remaining <= thresholdHours * 3600000;
}

function showClassroomModal(task) {
  pendingModalTask = task;
  const course = task.classroom?.courseName ? ` [${task.classroom.courseName}]` : '';
  $('#crModalTitle').textContent = `تكليف Google Classroom${course}`;
  $('#crModalDesc').textContent = `هذا التكليف خاص بـ Google Classroom (${task.text}). لم يتم تسجيل تسليمه على الموقع بعد. يمكنك وسمه كمنجز الآن في القائمة أو التحقق الفوري.`;
  $('#crModal').hidden = false;
}

function hideClassroomModal() {
  $('#crModal').hidden = true;
  pendingModalTask = null;
}

function openClassroomTaskLink(task) {
  let link = task?.classroom?.alternateLink;
  if (!link) return;
  const cfg = window.widgets.settings.get();
  const crEmail = cfg?.classroom?.userEmail || task?.classroom?.userEmail;
  if (crEmail && typeof link === 'string' && link.startsWith('https://classroom.google.com')) {
    link = `https://accounts.google.com/AccountChooser?Email=${encodeURIComponent(crEmail)}&continue=${encodeURIComponent(link)}`;
  }
  window.widgets.openExternal(link);
}

function checkClassroomAuthStatus() {
  const cfg = window.widgets.settings.get();
  const alertEl = $('#crAuthAlert');
  const syncBtn = $('#syncBtn');
  const isError = Boolean(cfg?.classroom?.enabled && cfg?.classroom?.authError);

  if (syncBtn) {
    if (isError) {
      syncBtn.classList.add('has-error');
      syncBtn.title = cfg?.classroom?.authErrorMsg || '⚠️ تنبيه: تعذر الاتصال بـ Google Classroom أو انتهت صلاحية الجلسة';
    } else {
      syncBtn.classList.remove('has-error');
      syncBtn.title = 'مزامنة Google Classroom';
    }
  }

  if (!alertEl) return;
  if (isError) {
    alertEl.hidden = false;
    if ($('#crAuthAlertSub') && cfg?.classroom?.authErrorMsg) {
      $('#crAuthAlertSub').textContent = cfg.classroom.authErrorMsg;
    }
  } else {
    alertEl.hidden = true;
  }
}

let items = [];
let filter = 'all';            // all | active | done
let crNotifications = [];
let hasUnreadCrNotifications = false;
let clockAlarms = [];
let currentAlarmTask = null;

const save = debounce(() => window.widgets.todos.set(items), 200);

/* ---------- notifications ---------- */

function updateCrNotificationBadge() {
  const badge = $('#crNotifyBadge');
  const btn = $('#crNotifyBtn');
  const drawer = $('#crNotifyDrawer');
  const s = settings();
  const showBtn = (s?.crShowNotificationsBtn !== false);
  if (btn) {
    btn.hidden = !showBtn;
  }
  if (!showBtn && drawer) {
    drawer.hidden = true;
  }
  if (badge) {
    badge.hidden = !hasUnreadCrNotifications || crNotifications.length === 0;
  }
}

function addCrNotification(notif) {
  crNotifications.unshift({
    id: String(Date.now()) + Math.random(),
    time: Date.now(),
    unread: true,
    ...notif,
  });
  if (crNotifications.length > 20) crNotifications.pop();
  hasUnreadCrNotifications = true;
  updateCrNotificationBadge();
  renderCrNotifications();
}

function renderCrNotifications() {
  const list = $('#crNotifyList');
  if (!list) return;
  if (!crNotifications.length) {
    list.replaceChildren(el('div', { class: 'cr-notify-empty', text: t('todo.crNotifyEmpty') || 'لا توجد إشعارات جديدة حالياً' }));
    return;
  }
  list.replaceChildren(...crNotifications.map((n) => {
    const item = el('div', { class: `cr-notify-item${n.unread ? ' unread' : ''}` });
    const main = el('div', { class: 'cr-notify-item-main' },
      el('div', { class: 'cr-notify-item-title', text: n.title }),
      el('div', { class: 'cr-notify-item-sub', text: n.desc })
    );
    const actions = [];
    if (n.link) {
      actions.push(el('button', {
        class: 'cr-notify-item-btn',
        text: 'فتح 🔗',
        onclick: (e) => {
          e.stopPropagation();
          let link = n.link;
          const cfg = settings();
          const crEmail = cfg?.classroom?.userEmail;
          if (crEmail && typeof link === 'string' && link.startsWith('https://classroom.google.com')) {
            link = `https://accounts.google.com/AccountChooser?Email=${encodeURIComponent(crEmail)}&continue=${encodeURIComponent(link)}`;
          }
          window.widgets.openExternal(link);
        },
      }));
    }
    item.append(main, ...actions);
    return item;
  }));
}

/* ---------- rendering ---------- */

function settings() {
  return window.UI.settings();
}

function isCourseExcluded(task) {
  if (!task) return false;
  const s = settings();
  if (s?.classroom?.filterHiddenCourses === false) return false;
  const hidden = (s?.classroom?.hiddenCourses || []).map((x) => String(x).toLowerCase().trim());
  if (!hidden.length) return false;

  if (task.classroom) {
    const cId = String(task.classroom.courseId || '').toLowerCase().trim();
    const cName = String(task.classroom.courseName || '').toLowerCase().trim();
    for (const h of hidden) {
      if (cId && (cId === h || cId.includes(h) || h.includes(cId))) return true;
      if (cName && (cName === h || cName.includes(h) || h.includes(cName))) return true;
    }
  }
  if (task.text && typeof task.text === 'string') {
    const m = task.text.match(/^\[(.*?)\]/);
    if (m && m[1]) {
      const prefix = m[1].toLowerCase().trim();
      for (const h of hidden) {
        if (prefix === h || prefix.includes(h) || h.includes(prefix)) return true;
      }
    }
    const isCrTask = Boolean(task.classroom || (task.id && (String(task.id).startsWith('cr_') || String(task.id).startsWith('ical_'))));
    if (isCrTask) {
      const lower = task.text.toLowerCase();
      for (const h of hidden) {
        if (h && lower.includes(h)) return true;
      }
    }
  }
  return false;
}

async function hideCourse(courseNameOrId) {
  if (!courseNameOrId) return;
  const s = settings() || {};
  s.classroom = s.classroom || {};
  s.classroom.hiddenCourses = s.classroom.hiddenCourses || [];
  if (!s.classroom.hiddenCourses.includes(courseNameOrId)) {
    s.classroom.hiddenCourses.push(courseNameOrId);
  }
  s.classroom.filterHiddenCourses = true;
  await window.widgets.settings.set({ classroom: s.classroom });
  items = items.filter((t) => !isCourseExcluded(t));
  save();
  render();
}

function isHabitExpired(task) {
  const isHabitTask = Boolean(task.habitId || task.category === 'habit' || (task.id && String(task.id).startsWith('hbt_')));
  if (!isHabitTask) return false;
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  let taskDate = task.habitDate;
  if (!taskDate && task.id) {
    const parts = String(task.id).split('_');
    const lastPart = parts[parts.length - 1];
    if (/^\d{4}-\d{2}-\d{2}$/.test(lastPart)) {
      taskDate = lastPart;
    }
  }
  return taskDate ? taskDate < today : !String(task.id).endsWith(`_${today}`);
}

/** Finished tasks past their time are left out, except in the "done" view. */
function listed() {
  return items.filter((x) => !isCourseExcluded(x) && !isHabitExpired(x) && !isHidden(x, settings()));
}

function visible() {
  let list = [];
  if (filter === 'active') list = items.filter((x) => !x.done && !isCourseExcluded(x) && !isHabitExpired(x));
  else if (filter === 'done') list = items.filter((x) => x.done && !isCourseExcluded(x) && !isHabitExpired(x));
  else list = listed();

  const s = settings();
  const sortBy = s?.todoSortBy || 'free';
  let sorted = [...list];

  if (sortBy === 'deadline') {
    sorted.sort((a, b) => {
      const timeA = a.classroom?.deadlineTimestamp || (a.due ? new Date(`${a.due}T23:59:59`).getTime() : Infinity);
      const timeB = b.classroom?.deadlineTimestamp || (b.due ? new Date(`${b.due}T23:59:59`).getTime() : Infinity);
      return timeA - timeB;
    });
  } else if (sortBy === 'priority') {
    sorted.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  } else if (sortBy === 'title') {
    const isAr = window.UI?.lang?.() !== 'en';
    sorted.sort((a, b) => (a.text || '').localeCompare(b.text || '', isAr ? 'ar' : 'en'));
  } else if (sortBy === 'created') {
    sorted.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } else if (sortBy === 'free') {
    // Keep manual drag-and-drop order
  }

  if (s?.todoMoveDoneToBottom !== false && filter === 'all') {
    const active = [];
    const done = [];
    for (const item of sorted) {
      if (item.done) done.push(item);
      else active.push(item);
    }
    sorted = [...active, ...done];
  }

  return sorted;
}

function render() {
  const list = $('#list');
  const shown = visible();
  list.replaceChildren(...shown.map(taskRow));

  const base = listed();
  const done = base.filter((x) => x.done).length;
  const hidden = items.length - base.length;
  const parts = [];
  if (base.length) parts.push(t('todo.summary', { done: digits(done), total: digits(base.length), filter: t(`todo.f.${filter}`) }));
  if (hidden) parts.push(t('todo.hidden', { n: digits(hidden) }));
  $('#summary').textContent = parts.join(' · ') || t('todo.start');
  $('#bar').style.width = base.length ? `${(done / base.length) * 100}%` : '0%';

  const isEmpty = shown.length === 0;
  $('#empty').hidden = !isEmpty;
  $('#emptyText').textContent = items.length ? t('todo.emptyView') : t('todo.empty');
  list.hidden = isEmpty;

  const btn = $('#filterBtn');
  btn.classList.toggle('filtered', filter !== 'all');
  btn.dataset.mode = filter === 'active' ? '•' : filter === 'done' ? '✓' : '';
}

function badge(cls, iconName, text, title) {
  return el('span', { class: `badge ${cls}`, title: title || text || '' },
    iconName ? icon(iconName) : null, text ? el('span', { text }) : null);
}

function badgesFor(task) {
  const out = [];
  const urgent = isSuperUrgent(task);

  if (urgent) {
    const deadline = task.classroom?.deadlineTimestamp || (task.due ? new Date(`${task.due}T23:59:59`).getTime() : null);
    const leftMs = deadline ? deadline - Date.now() : 0;
    const hours = Math.max(0, Math.floor(leftMs / 3600000));
    const mins = Math.max(0, Math.floor((leftMs % 3600000) / 60000));
    const timeLabel = hours > 0 ? `${hours}س ${mins}د` : `${mins}د`;
    out.push(badge('super-urgent', 'alert', `${t('todo.superUrgent')} (${digits(timeLabel)})`));
  }

  if (task.classroom) {
    const s = settings();
    const showCourseBadge = s.crShowCourseBadge !== false;
    const showSubmissionBadge = Boolean(s.crShowSubmissionBadge);

    if (showCourseBadge) {
      const course = task.classroom.courseName || 'Classroom';
      out.push(badge('classroom', 'book', `📚 ${course}`));
    }
    if (showSubmissionBadge) {
      const isSubmitted = task.classroom.state === 'TURNED_IN' || task.classroom.state === 'RETURNED';
      out.push(badge(isSubmitted ? 'submitted' : 'due', isSubmitted ? 'check' : 'time', isSubmitted ? t('todo.crSubmitted') : t('todo.crUnsubmitted')));
    }
  }

  if (task.priority === 2 && !urgent) out.push(badge('prio p2', 'flag', t('tk.prio2')));
  else if (task.priority === 1 && !urgent) out.push(badge('prio p1', 'flag', t('tk.prio1')));

  // Unified Due Date Badge (for regular and Classroom tasks)
  const due = dueLabel(task.due || task.classroom?.deadlineTimestamp, task.done);
  if (due) {
    let dueText = due.text;
    if (task.classroom?.deadlineTimestamp) {
      const dt = new Date(Number(task.classroom.deadlineTimestamp));
      if (!isNaN(dt.getTime())) {
        const timePart = window.TaskKit.timeLabel(dt);
        dueText = `${due.text} ${timePart}`;
      }
    }
    out.push(badge(`due${due.overdue ? ' overdue' : ''}`, 'calendar', dueText));
  }

  const next = nextReminder(task);
  if (next && !task.done) {
    const count = (task.reminders || []).filter((r) => !r.fired).length;
    const hasAlarm = (task.reminders || []).some((r) => !r.fired && r.hasAlarm);
    const remLabel = `${hasAlarm ? '⏰ ' : ''}${t('todo.reminder')}: ${whenLabel(next)}`;
    out.push(badge(hasAlarm ? 'clock' : 'bell', hasAlarm ? 'clock' : 'bell', remLabel, count > 1 ? t('todo.reminders', { n: digits(count) }) : t('todo.reminder')));
  }

  if ((task.notes || '').trim()) out.push(badge('notes', 'noteSmall', '', t('todo.notes')));
  return out.length ? el('div', { class: 'task-badges' }, ...out) : null;
}

/* ---------- Micro-Confetti Particle Burst Engine ---------- */
let todoParticles = [];
let todoConfettiRaf = null;

function triggerTodoConfetti(originX, originY, count = 22) {
  const canvas = document.getElementById('todoConfettiCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const parent = canvas.parentElement;
  const w = parent?.clientWidth || 320;
  const h = parent?.clientHeight || 480;
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;

  const rect = canvas.getBoundingClientRect();
  const x = originX !== undefined ? originX - rect.left : canvas.width / 2;
  const y = originY !== undefined ? originY - rect.top : canvas.height / 3;

  if (todoParticles.length > 40) todoParticles.splice(0, todoParticles.length - 20);

  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#eab308'];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2.0 + Math.random() * 4.5;
    todoParticles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.2,
      size: 2.5 + Math.random() * 3.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 12,
      decay: 0.025 + Math.random() * 0.025,
      isCircle: Math.random() > 0.5,
    });
  }

  if (!todoConfettiRaf) {
    if (typeof requestAnimationFrame !== 'undefined') todoConfettiRaf = requestAnimationFrame(updateTodoConfetti);
  }
}

function updateTodoConfetti() {
  const canvas = document.getElementById('todoConfettiCanvas');
  if (!canvas) { todoConfettiRaf = null; return; }
  const ctx = canvas.getContext('2d');
  if (!ctx) { todoConfettiRaf = null; return; }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = todoParticles.length - 1; i >= 0; i--) {
    const p = todoParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.16;
    p.vx *= 0.98;
    p.alpha -= p.decay;
    p.rotation += p.rotSpeed;

    if (p.alpha <= 0 || p.y > canvas.height + 20) {
      todoParticles.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.fillStyle = p.color;

    if (p.isCircle) {
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
    }
    ctx.restore();
  }

  if (todoParticles.length > 0) {
    if (typeof requestAnimationFrame !== 'undefined') todoConfettiRaf = requestAnimationFrame(updateTodoConfetti);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    todoConfettiRaf = null;
  }
}

function taskRow(task) {
  const s = settings();
  const box = el('button', {
    class: 'box',
    title: task.done ? t('todo.markUndone') : t('todo.markDone'),
    'aria-pressed': task.done ? 'true' : 'false',
    onclick: (e) => {
      e.stopPropagation();
      toggle(task.id, e);
    },
  }, icon('check'));

  // Clean title if course name prefix is already in classroom metadata and user didn't force it in title
  let displayText = task.text;
  if (!s.crCourseInTitle && task.classroom?.courseName) {
    const escaped = task.classroom.courseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    displayText = displayText.replace(new RegExp(`^\\[${escaped}\\]\\s*`), '');
  }

  const text = el('div', {
    class: 'task-text',
    contenteditable: 'true',
    spellcheck: 'false',
    dir: 'auto',
    text: displayText,
    onblur: (e) => commitEdit(task.id, e.target.textContent),
    onkeydown: (e) => {
      if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); }
      if (e.key === 'Escape') { e.target.textContent = displayText; e.target.blur(); }
    },
  });

  const more = el('button', {
    class: 'task-act task-more',
    title: t('todo.more'),
    onclick: (e) => { e.stopPropagation(); window.widgets.win.openTask(task.id); },
  }, icon('more'));

  const del = el('button', {
    class: 'task-act task-del',
    title: t('todo.delete'),
    onclick: (e) => {
      e.stopPropagation();
      confirmDelete({
        title: 'هل أنت متأكد من الحذف؟',
        desc: task.text,
        confirmText: 'حذف',
        cancelText: 'إلغاء',
        onConfirm: () => remove(task.id),
      });
    },
  }, icon('trash'));

  const prio = task.priority === 2 ? ' p2' : task.priority === 1 ? ' p1' : '';
  const urgent = isSuperUrgent(task);

  const actions = [];
  if (s.crShowLinkBtn !== false && task.classroom?.alternateLink) {
    actions.push(el('button', {
      class: 'task-act task-link-btn',
      title: 'فتح التكليف في Google Classroom',
      onclick: (e) => {
        e.stopPropagation();
        openClassroomTaskLink(task);
      },
    }, icon('link')));
  }
  if (task.classroom?.courseName) {
    actions.push(el('button', {
      class: 'task-act task-hide-course-btn',
      title: `🚫 استثناء وإخفاء مادة ${task.classroom.courseName} بالكامل`,
      onclick: (e) => {
        e.stopPropagation();
        hideCourse(task.classroom.courseName);
      },
    }, icon('close')));
  }
  actions.push(more, del);

  const actionsWrap = el('div', { class: 'task-actions' }, ...actions);

  const row = el('li', {
    class: `task${task.done ? ' done' : ''}${prio}${urgent ? ' super-urgent' : ''}`,
    draggable: 'true',
    dataset: { id: task.id },
    ondblclick: (e) => { if (!e.target.closest('.task-text, button')) window.widgets.win.openTask(task.id); },
  }, box, el('div', { class: 'task-main' }, text, badgesFor(task)), actionsWrap);

  row.addEventListener('dragstart', onDragStart);
  row.addEventListener('dragover', onDragOver);
  row.addEventListener('dragleave', onDragLeave);
  row.addEventListener('drop', onDrop);
  row.addEventListener('dragend', onDragEnd);
  return row;
}

/* ---------- mutations ---------- */

function add(text) {
  const clean = text.trim();
  if (!clean) return;
  items.unshift({ id: uid(), text: clean, done: false, createdAt: Date.now() });
  save();
  render();
}

let toggleLock = new Map();
let pendingReorderTimer = null;

function toggle(id, originEvent = null) {
  const now = Date.now();
  if (toggleLock.has(id) && now - toggleLock.get(id) < 320) {
    return; // Prevent duplicate rapid clicks ("مشكلة الضغط المتكرر")
  }
  toggleLock.set(id, now);

  const x = items.find((i) => i.id === id);
  if (!x) return;

  const s = settings();
  const preventDone = s?.classroom?.preventDoneIfNotTurnedIn !== false;

  // Guard: If uncompleted Classroom assignment, check if already submitted or if strict guard is enabled
  if (!x.done && x.classroom) {
    const isSubmitted = x.classroom.state === 'TURNED_IN' || x.classroom.state === 'RETURNED' || x.classroom.assignedGrade !== undefined;
    if (!isSubmitted && preventDone) {
      showClassroomModal(x);
      return;
    }
  }

  const wasDone = Boolean(x.done);
  x.done = !wasDone;
  if (x.done) {
    x.doneManually = true;
    x.doneAt = Date.now();
    // Auto-disable one-time alarm for finished task
    const taskAlarm = clockAlarms.find((a) => a.taskId === id || a.id === `alarm_task_${id}`);
    if (taskAlarm && taskAlarm.enabled && taskAlarm.repeat === 'once') {
      window.widgets?.clock?.removeAlarmForTask?.(id);
    }
  } else {
    x.doneManually = false;
    x.doneAt = null;
  }
  save();

  // Optimistic In-Place UI Update for instant tactile feedback without list thrashing
  const row = $(`.task[data-id="${CSS.escape(id)}"]`);
  const box = row?.querySelector('.box');
  if (row && box) {
    row.classList.toggle('done', x.done);
    box.setAttribute('aria-pressed', x.done ? 'true' : 'false');
    box.title = x.done ? t('todo.markUndone') : t('todo.markDone');

    if (x.done) {
      box.classList.remove('just-checked');
      void box.offsetWidth;
      box.classList.add('just-checked');
      setTimeout(() => box?.classList.remove('just-checked'), 380);
      if (originEvent) {
        triggerTodoConfetti(originEvent.clientX, originEvent.clientY);
      }
    } else {
      box.classList.remove('just-checked');
    }

    // Update summary and bar smoothly in-place
    const base = listed();
    const doneCount = base.filter((t) => t.done).length;
    const hidden = items.length - base.length;
    const parts = [];
    if (base.length) parts.push(t('todo.summary', { done: digits(doneCount), total: digits(base.length), filter: t(`todo.f.${filter}`) }));
    if (hidden) parts.push(t('todo.hidden', { n: digits(hidden) }));
    $('#summary').textContent = parts.join(' · ') || t('todo.start');
    $('#bar').style.width = base.length ? `${(doneCount / base.length) * 100}%` : '0%';
  }

  // Graceful Deferred Reorder: Keep row visible in-place so user sees completion, then sort cleanly
  if (pendingReorderTimer) clearTimeout(pendingReorderTimer);
  if (x.done && (s?.todoMoveDoneToBottom !== false || filter !== 'all')) {
    pendingReorderTimer = setTimeout(() => {
      pendingReorderTimer = null;
      render();
    }, 380);
  } else {
    pendingReorderTimer = setTimeout(() => {
      pendingReorderTimer = null;
      render();
    }, 120);
  }
}

function commitEdit(id, value) {
  const x = items.find((i) => i.id === id);
  if (!x) return;
  const clean = value.replace(/\s+/g, ' ').trim();
  if (!clean) { remove(id); return; }
  if (clean === x.text) return;
  x.text = clean;
  save();
  render();
}

function remove(id) {
  window.widgets?.clock?.removeAlarmForTask?.(id);
  const row = $(`.task[data-id="${CSS.escape(id)}"]`);
  let dropped = false;
  const drop = () => {
    if (dropped) return;
    dropped = true;
    items = items.filter((x) => x.id !== id);
    save();
    try { save.flush?.(); } catch (e) { }
    try { window.widgets?.todos?.remove?.(id); } catch (e) { }
    render();
  };
  if (!row) { drop(); return; }
  row.classList.add('removing');
  row.addEventListener('animationend', drop, { once: true });
  setTimeout(() => { drop(); }, 220);
}

/* ---------- drag to reorder ---------- */

let dragId = null;

function onDragStart(e) {
  dragId = e.currentTarget.dataset.id;
  e.currentTarget.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', dragId);
}

function onDragOver(e) {
  if (!dragId || e.currentTarget.dataset.id === dragId) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  e.currentTarget.classList.add('drop-target');
}

function onDragLeave(e) {
  e.currentTarget.classList.remove('drop-target');
}

function onDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('drop-target');
  const targetId = e.currentTarget.dataset.id;
  if (!dragId || targetId === dragId) return;
  const from = items.findIndex((x) => x.id === dragId);
  const to = items.findIndex((x) => x.id === targetId);
  if (from < 0 || to < 0) return;
  const [moved] = items.splice(from, 1);
  items.splice(to, 0, moved);
  save();
  render();
}

function onDragEnd(e) {
  e.currentTarget.classList.remove('dragging');
  document.querySelectorAll('.drop-target').forEach((n) => n.classList.remove('drop-target'));
  dragId = null;
}

/* ---------- wiring ---------- */

function wire() {
  $('#headIcon').append(icon('list'));
  $('#emptyIcon').append(icon('list'));
  $('#addBtn').append(icon('plus'));
  $('#filterBtn').append(icon('check'));
  $('#filterBtn').classList.add('filter-pill');
  $('#settingsBtn').append(icon('gear'));
  $('#closeBtn').append(icon('close'));
  $('#syncBtn').append(icon('refresh'));

  $('#syncBtn').addEventListener('click', async () => {
    const btn = $('#syncBtn');
    if (btn.classList.contains('has-error')) {
      window.widgets.win.openSettings('classroom');
      return;
    }
    btn.disabled = true;
    btn.style.animation = 'spin 0.8s linear infinite';
    try {
      const res = await window.widgets.classroom.sync();
      if (res && res.items) {
        items = res.items;
        render();
      }
    } catch (err) {
      console.error('Classroom sync error:', err);
    } finally {
      btn.disabled = false;
      btn.style.animation = '';
      checkClassroomAuthStatus();
    }
  });

  $('#crModalClose').addEventListener('click', hideClassroomModal);
  $('#crModalMarkDone').addEventListener('click', () => {
    if (pendingModalTask) {
      pendingModalTask.done = true;
      pendingModalTask.doneManually = true;
      pendingModalTask.doneAt = Date.now();
      triggerTodoConfetti();
      save();
      render();
    }
    hideClassroomModal();
  });
  $('#crModalSync').addEventListener('click', async () => {
    const btn = $('#crModalSync');
    const origText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'جاري التحقق…';
    try {
      const res = await window.widgets.classroom.sync();
      if (res && res.items) {
        items = res.items;
        if (pendingModalTask) {
          const fresh = items.find((t) => t.id === pendingModalTask.id);
          if (fresh && (fresh.done || fresh.classroom?.state === 'TURNED_IN' || fresh.classroom?.state === 'RETURNED' || fresh.classroom?.assignedGrade !== undefined)) {
            fresh.done = true;
            fresh.doneAt = Date.now();
            triggerTodoConfetti();
            save();
            render();
            hideClassroomModal();
            return;
          }
        }
        render();
      }
      $('#crModalDesc').textContent = '⚠️ لم يُسجل تسليم على Classroom حتى الآن. يمكنك وسمه كمنجز يدوياً بالضغط على زر "تم التسليم" الأخضر أعلاه.';
    } catch (err) {
      $('#crModalDesc').textContent = `تعذر الاتصال بـ Classroom (${err.message || 'خطأ'}). يمكنك وسمه كمنجز يدوياً.`;
    } finally {
      btn.disabled = false;
      btn.textContent = origText;
    }
  });
  $('#crModalOpen').addEventListener('click', () => {
    if (pendingModalTask?.classroom?.alternateLink) {
      openClassroomTaskLink(pendingModalTask);
    }
    hideClassroomModal();
  });

  $('#toggleAddBtn').append(icon('plus'));
  $('#toggleAddBtn').addEventListener('click', () => {
    const drawer = $('#composerDrawer');
    const open = drawer.classList.toggle('open');
    $('#toggleAddBtn').classList.toggle('active', open);
    if (open) {
      $('#input').focus();
    } else {
      $('#input').blur();
    }
  });

  $('#crReconnectBtn').addEventListener('click', () => {
    window.widgets.win.openSettings('classroom');
  });

  const input = $('#input');
  const addBtn = $('#addBtn');
  const sync = () => { addBtn.disabled = !input.value.trim(); };
  sync();

  input.addEventListener('input', sync);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      add(input.value);
      input.value = '';
      sync();
      $('#composerDrawer').classList.remove('open');
      $('#toggleAddBtn').classList.remove('active');
      input.blur();
    }
    if (e.key === 'Escape') {
      input.value = '';
      sync();
      $('#composerDrawer').classList.remove('open');
      $('#toggleAddBtn').classList.remove('active');
      input.blur();
    }
  });
  addBtn.addEventListener('click', () => {
    add(input.value);
    input.value = '';
    sync();
    $('#composerDrawer').classList.remove('open');
    $('#toggleAddBtn').classList.remove('active');
  });

  // Classroom Notifications
  $('#crNotifyBtn')?.append(icon('bell'));
  $('#crNotifyBtn')?.addEventListener('click', () => {
    const drawer = $('#crNotifyDrawer');
    if (drawer) {
      drawer.hidden = !drawer.hidden;
      if (!drawer.hidden) {
        hasUnreadCrNotifications = false;
        crNotifications.forEach((n) => { n.unread = false; });
        updateCrNotificationBadge();
        renderCrNotifications();
      }
    }
  });
  $('#crCloseNotifyBtn')?.addEventListener('click', () => {
    const drawer = $('#crNotifyDrawer');
    if (drawer) drawer.hidden = true;
  });
  $('#crMarkReadBtn')?.addEventListener('click', () => {
    hasUnreadCrNotifications = false;
    crNotifications.forEach((n) => { n.unread = false; });
    updateCrNotificationBadge();
    renderCrNotifications();
  });

  updateCrNotificationBadge();

  $('#filterBtn').addEventListener('click', () => {
    filter = filter === 'all' ? 'active' : filter === 'active' ? 'done' : 'all';
    render();
  });
  $('#settingsBtn').addEventListener('click', () => window.widgets.win.openSettings('todo'));
  $('#closeBtn').addEventListener('click', () => closeWindow());

  function areTodosEqual(a, b) {
    if (a === b) return true;
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      const x = a[i];
      const y = b[i];
      if (!x || !y) return false;
      if (x.id !== y.id || Boolean(x.done) !== Boolean(y.done) || x.text !== y.text ||
        x.priority !== y.priority || x.due !== y.due) return false;
    }
    return true;
  }

  // Another window (the task window, a reminder) changed the list.
  window.widgets.todos.onChange((next) => {
    if (!Array.isArray(next)) return;
    if (areTodosEqual(next, items)) return;
    items = next || [];
    if (!document.activeElement || !document.activeElement.classList.contains('task-text')) render();
  });
  let lastTodoSettingsHash = null;
  window.widgets.settings.onChange((s) => {
    const relevant = JSON.stringify({
      theme: s?.theme,
      accent: s?.accent,
      look: s?.look,
      todoSortBy: s?.todoSortBy,
      superUrgent: s?.superUrgent,
      classroom: s?.classroom,
      crShowNotificationsBtn: s?.crShowNotificationsBtn,
      crShowCourseBadge: s?.crShowCourseBadge,
      crShowSubmissionBadge: s?.crShowSubmissionBadge,
      wStyle: s?.widgetStyles?.todo,
    });
    if (relevant === lastTodoSettingsHash) return;
    lastTodoSettingsHash = relevant;
    render();
    checkClassroomAuthStatus();
    updateCrNotificationBadge();
  });

  window.widgets.classroom.onSyncDone((res) => {
    if (res && res.items) {
      items = res.items;
      render();
    }
    if (res && res.added > 0) {
      addCrNotification({
        title: `📥 تم إضافة ${res.added} تكليفات جديدة من Classroom`,
        desc: `تم تحديث قائمة المهام بنجاح (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
      });
    }
    if (res && res.updated > 0) {
      addCrNotification({
        title: `🔄 تم تعديل وتحديث ${res.updated} تكليفات`,
        desc: `قام المعلم بتعديل أو تأجيل المواعيد`,
      });
    }
    checkClassroomAuthStatus();
    updateCrNotificationBadge();
  });

  window.widgets.classroom.onError?.((err) => {
    checkClassroomAuthStatus();
    addCrNotification({
      title: '⚠️ تنبيه: تعذر المزامنة مع Google Classroom',
      desc: err?.error || 'يرجى مراجعة إعدادات الربط في الإعدادات',
    });
  });

  // Listen to live super-urgent updates
  window.widgets.todos.onUrgentState((state) => {
    const nextIds = new Set(state?.activeUrgentIds || []);
    if (nextIds.size === urgentIds.size) {
      let same = true;
      for (const id of nextIds) {
        if (!urgentIds.has(id)) { same = false; break; }
      }
      if (same) return;
    }
    urgentIds = nextIds;
    render();
  });

  // Finished tasks leave on time, and "in 5 min" labels stay current.
  setInterval(() => {
    if (window.UI?.isDormant?.()) return;
    if (document.activeElement && document.activeElement.classList.contains('task-text')) return;
    render();
  }, 60_000);

  window.UI?.onDormancy?.((isDormant) => {
    if (!isDormant) render();
  });

  window.addEventListener('beforeunload', () => save.flush());
}

boot(async () => {
  items = (await window.widgets.todos.get()) || [];
  try {
    clockAlarms = (await window.widgets.clock?.getAlarms?.()) || [];
  } catch { }
  window.widgets.clock?.onAlarmsChange?.((alarms) => {
    clockAlarms = alarms || [];
    render();
  });

  try {
    const uState = await window.widgets.todos.getUrgentState();
    if (uState?.activeUrgentIds) {
      urgentIds = new Set(uState.activeUrgentIds);
    } else if (uState?.urgentList) {
      urgentIds = new Set(uState.urgentList.map((u) => u.task.id));
    }
  } catch { }
  wire();
  render();
  checkClassroomAuthStatus();
});
