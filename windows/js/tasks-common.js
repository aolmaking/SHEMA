'use strict';
/* Helpers shared by the to-do widget and the task window: when a finished
   task disappears, and how due dates and reminder times read. */

(function () {
  const { t, digits, locale, strings } = window.UI;

  strings({
    ar: {
      'tk.today': 'اليوم',
      'tk.tomorrow': 'غدًا',
      'tk.yesterday': 'أمس',
      'tk.overdue': 'متأخرة',
      'tk.prio1': 'مهمة',
      'tk.prio2': 'عاجلة',
    },
    en: {
      'tk.today': 'Today',
      'tk.tomorrow': 'Tomorrow',
      'tk.yesterday': 'Yesterday',
      'tk.overdue': 'Overdue',
      'tk.prio1': 'Important',
      'tk.prio2': 'Urgent',
    },
  });

  const HOUR = 3600e3;

  /** Hours after completion before a task leaves the list (0 = never). */
  function hideHours(task, settings) {
    if (task.hideAfter !== undefined && task.hideAfter !== null) return Number(task.hideAfter) || 0;
    return Number(settings?.todo?.hideDoneAfterHours) || 0;
  }

  function isHidden(task, settings, now = Date.now()) {
    if (!task.done || !task.doneAt) return false;
    const h = hideHours(task, settings);
    return h > 0 && now - task.doneAt >= h * HOUR;
  }

  /** When a finished task will disappear, or null. */
  function hidesAt(task, settings) {
    if (!task.done || !task.doneAt) return null;
    const h = hideHours(task, settings);
    return h > 0 ? task.doneAt + h * HOUR : null;
  }

  function nextReminder(task) {
    const pending = (task.reminders || []).filter((r) => !r.fired).map((r) => r.at);
    return pending.length ? Math.min(...pending) : null;
  }

  function dayDiff(date) {
    const a = new Date(); a.setHours(0, 0, 0, 0);
    const b = new Date(date); b.setHours(0, 0, 0, 0);
    return Math.round((b - a) / 86400000);
  }

  function dayLabel(date) {
    const d = dayDiff(date);
    if (d === 0) return t('tk.today');
    if (d === 1) return t('tk.tomorrow');
    if (d === -1) return t('tk.yesterday');
    const sameYear = new Date(date).getFullYear() === new Date().getFullYear();
    return new Intl.DateTimeFormat(locale(), { day: 'numeric', month: 'short', ...(sameYear ? {} : { year: 'numeric' }) }).format(date);
  }

  function timeLabel(ts) {
    const hour12 = (window.UI.settings().clock || {}).hour12 !== false;
    return new Intl.DateTimeFormat(locale(), { hour: 'numeric', minute: '2-digit', hour12 }).format(ts);
  }

  /** "Today 9:00 PM", "Tomorrow 8:30", "3 Oct 9:00" */
  function whenLabel(ts) {
    return `${dayLabel(ts)} ${timeLabel(ts)}`;
  }

  /** Due date "YYYY-MM-DD" or timestamp -> { text, overdue } */
  function dueLabel(due, done) {
    if (!due) return null;
    let date;
    if (typeof due === 'number') {
      date = new Date(due);
    } else if (typeof due === 'string') {
      const trimmed = due.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        const [y, m, d] = trimmed.split('-').map(Number);
        date = new Date(y, m - 1, d, 12);
      } else {
        date = new Date(trimmed);
      }
    } else {
      date = new Date(due);
    }
    if (isNaN(date.getTime())) return null;
    const overdue = !done && dayDiff(date) < 0;
    return { text: dayLabel(date), overdue };
  }

  window.TaskKit = { hideHours, isHidden, hidesAt, nextReminder, whenLabel, dueLabel, dayLabel, timeLabel, digits };
}());
