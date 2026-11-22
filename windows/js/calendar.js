'use strict';
/*
 * Supercharged Calendar Widget with Google Calendar Parity & Superiority
 * - Views: Month Grid, Week Columns, Agenda / Schedule Timeline
 * - Day Click Micro-Actions: (+) Add Occasion & (📝) Add/Edit Day Note
 * - Prominent Red Dot Indicator (.red-dot): Appears on any day with an event OR a day note
 * - Unified Tasks & Deadlines (To-Do & Google Classroom deadlines integration)
 * - Rich WhatsApp Occasion Reminders with Live Dispatch
 * - Umm al-Qura Hijri Calendar integration & Eye-comfort visual styles
 */

const { $, el, icon, boot, closeWindow, digits, t, strings, lang } = window.UI;

strings({
  ar: {
    'cal.title': 'التقويم',
    'cal.settings': 'إعدادات التقويم',
    'cal.today': 'العودة إلى اليوم',
    'cal.next': 'الشهر التالي',
    'cal.prev': 'الشهر السابق',
    'cal.ah': 'هـ',
    'cal.events': 'المناسبات وتنبيهات WhatsApp',
    'cal.eventsTitle': 'المناسبات والتذكيرات',
    'cal.dayNoteTitle': 'ملاحظة ويومية اليوم',
    'cal.note': 'ملاحظة',
    'cal.task': 'مهمة مستحقة',
    'cal.todayBadge': 'اليوم',
    'cal.tomorrow': 'غداً',
    'cal.inDays': 'باقي {n} أيام',
    'cal.inOneDay': 'باقي يوم واحد',
    'cal.inTwoDays': 'باقي يومان',
    'cal.passed': 'مضى',
    'cal.viewMonth': 'شهر',
    'cal.viewSplit': 'موجز',
    'cal.viewWeek': 'أسبوع',
    'cal.viewBento': 'بينتو',
    'cal.viewYear': 'السنة',
    'cal.viewAgenda': 'أجندة',
    'cal.viewMonthTitle': 'عرض الشهر',
    'cal.viewSplitTitle': 'عرض الموجز والقادم مع تقويم مصغر',
    'cal.viewWeekTitle': 'عرض الأسبوع',
    'cal.viewBentoTitle': 'عرض بطاقات بينتو المقسمة',
    'cal.viewYearTitle': 'عرض كبسولات تقدم السنة',
    'cal.viewAgendaTitle': 'جدول المواعيد والأجندة',
    'cal.upcomingTitle': 'القادم',
    'cal.daysRemaining': 'أيام متبقية: {n}',
    'cal.yearPassed': 'مضى {pct}% من السنة',
    'cal.importantTitle': 'مهم',
    'cal.urgentTitle': 'عاجل',
    'cal.somedayTitle': 'يوماً ما',
    'cal.scheduleTitle': 'مواعيد',
    'cal.moreItems': '+{n} أخرى',
    'cal.addEventShort': 'مناسبة',
    'cal.addNoteShort': 'ملاحظة',
    'cal.addEventTitle': 'إضافة مناسبة جديدة',
    'cal.addNoteTitle': 'ملاحظة أو يومية لليوم',
    'cal.agendaTitle': '📋 جدول المواعيد والأجندة',
    'cal.addEventNew': '+ مناسبة جديدة',
    'cal.saveNoteBtn': '💾 حفظ الملاحظة',
    'cal.deleteNoteBtn': '🗑️ حذف الملاحظة',
    'cal.dayNotePh': 'اكتب أفكارك، ملاحظاتك، يومياتك، أو مهامك الخاصة بهذا اليوم بالتفصيل...',
    'cal.editNote': 'اضغط لتعديل الملاحظة',
    'cal.editEvent': 'اضغط لتعديل المناسبة',
    'cal.viewTask': 'اضغط لفتح تفاصيل المهمة',
    'cal.quickAdd': 'إضافة في هذا اليوم',
    'cal.noUpcoming': 'لا توجد مواعيد أو مناسبات قادمة مسجلة حالياً.',
    'cal.noUpcomingHint': 'اضغط على "+ مناسبة جديدة" بالأعلى لتنظيم جدولك وإضافة التذكيرات!',
    'cal.noEventsDay': 'لا توجد مناسبات مسجلة لهذا اليوم.',
    'cal.noEventsAll': 'لا توجد مناسبات مسجلة بعد.',
    'cal.noEventsHint': 'اضغط على "+ إضافة" لإنشاء مناسبة جديدة مع تنبيهات WhatsApp.',
    'cal.confirmDeleteEvent': 'هل أنت متأكد من حذف هذه المناسبة؟',
    'cal.testWaOk': '✅ تم إرسال رسالة التنبيه عبر WhatsApp بنجاح!',
    'cal.testWaErr': '⚠️ تعذر الإرسال: ',
    'cal.waBadge': 'واتساب',
    'cal.studyTask': 'مهمة دراسية',
    'cal.courseLabel': 'مادة: ',
    'cal.toggleHero': 'إظهار / إخفاء شريط تقدم السنة',
    'cal.weekNumTitle': 'رقم الأسبوع',
    'cal.prevWeek': 'الأسبوع السابق',
    'cal.nextWeek': 'الأسبوع التالي',
    'cal.addImportant': 'إضافة مهمة',
    'cal.addUrgent': 'إضافة عاجلة',
    'cal.addSomeday': 'إضافة فكرة',
    'cal.addSchedule': 'إضافة موعد',
    'cal.addEventBtn': '+ إضافة',
    'cal.evModalTitleNew': 'إضافة مناسبة جديدة',
    'cal.evModalTitleEdit': 'تعديل المناسبة',
    'cal.evType': 'نوع المناسبة:',
    'cal.evTitle': 'عنوان المناسبة:',
    'cal.evTitlePh': 'مثال: عيد ميلاد محمد، مؤتمر الذكاء الاصطناعي...',
    'cal.evDate': 'التاريخ:',
    'cal.evTime': 'التوقيت:',
    'cal.evRecurring': 'التكرار الدوري:',
    'cal.evRecNone': 'لا يتكرر (مرة واحدة)',
    'cal.evRecYearly': 'سنوياً (في نفس التاريخ من كل عام - أعياد ومناسبات سنوية)',
    'cal.evRecMonthly': 'شهرياً (في نفس اليوم من كل شهر)',
    'cal.evRecWeekly': 'أسبوعياً (في نفس اليوم من كل أسبوع)',
    'cal.evNotes': 'ملاحظات أو تفاصيل إضافية:',
    'cal.evNotesPh': 'المكان، الرابط، أو أي معلومات تود تذكرها...',
    'cal.evWaTitle': 'تنبيهات WhatsApp',
    'cal.evWaTiming': 'موعد إرسال الرسالة:',
    'cal.evWaTimeMorning': 'في نفس يوم المناسبة (صباحاً 9:00 ص)',
    'cal.evWaTime1d': 'قبل المناسبة بيوم واحد (صباحاً 9:00 ص)',
    'cal.evWaTimeAtEvent': 'في توقيت المناسبة تماماً',
    'cal.evWaTime1h': 'قبل موعد المناسبة بساعة',
    'cal.evWaTime3h': 'قبل موعد المناسبة بـ 3 ساعات',
    'cal.evWaRecipient': 'مستلم الرسالة (اختياري - افتراضياً يرسل للإعدادات الحالية):',
    'cal.evWaRecipientPh': 'اتركه فارغاً للإرسال للمجموعة/الرقم المسجل بالإعدادات',
    'cal.evWaMessage': 'نص الرسالة المخصصة (أو اتركه للقالب التلقائي):',
    'cal.evWaMessagePh': 'القالب التلقائي المناسب لنوع المناسبة...',
    'cal.evTestWa': '🚀 إرسال تجربة الآن على WhatsApp',
    'cal.evSave': '💾 حفظ المناسبة',
    'cal.evDelete': '🗑️ حذف',
    'common.cancel': 'إلغاء',
    'common.close': 'إغلاق',
    'common.refresh': 'تحديث',
    'cal.habitPrefix': 'عادة: {title}',
    'cal.dailyNote': 'ملاحظة يومية',
    'cal.notePrefix': '📝 ملاحظة: {text}',
    'cal.taskDuePrefix': '📋 تسليم: {text}',
    'cal.requireTitleAlert': 'يرجى كتابة عنوان المناسبة أولاً',
    'cal.requireDateAlert': 'يرجى تحديد تاريخ المناسبة',
    'cal.sendingWa': 'جاري الإرسال عبر WhatsApp... ⏳',
    'cal.sendWaSuccess': '✅ تم إرسال رسالة التنبيه عبر WhatsApp بنجاح إلى المستلم المحدد!',
    'cal.sendWaFail': '❌ تعذر الإرسال: {error}',
    'cal.sendWaNetError': '❌ خطأ في الاتصال: {error}',
  },
  en: {
    'cal.title': 'Calendar',
    'cal.settings': 'Calendar settings',
    'cal.today': 'Back to today',
    'cal.next': 'Next month',
    'cal.prev': 'Previous month',
    'cal.ah': 'AH',
    'cal.events': 'Events & WhatsApp Reminders',
    'cal.eventsTitle': 'Events & Reminders',
    'cal.dayNoteTitle': 'Daily Note & Journal',
    'cal.note': 'Note',
    'cal.task': 'Task Due',
    'cal.todayBadge': 'Today',
    'cal.tomorrow': 'Tomorrow',
    'cal.inDays': 'In {n} days',
    'cal.inOneDay': 'In 1 day',
    'cal.inTwoDays': 'In 2 days',
    'cal.passed': 'Passed',
    'cal.viewMonth': 'Month',
    'cal.viewSplit': 'Split',
    'cal.viewWeek': 'Week',
    'cal.viewBento': 'Bento',
    'cal.viewYear': 'Year',
    'cal.viewAgenda': 'Agenda',
    'cal.viewMonthTitle': 'Month View',
    'cal.viewSplitTitle': 'Upcoming tasks & mini calendar matrix',
    'cal.viewWeekTitle': 'Week View',
    'cal.viewBentoTitle': 'Bento categorized list cards',
    'cal.viewYearTitle': 'Year progress capsules',
    'cal.viewAgendaTitle': 'Agenda Schedule View',
    'cal.upcomingTitle': 'Upcoming',
    'cal.daysRemaining': 'Days left: {n}',
    'cal.yearPassed': '{pct}% of year passed',
    'cal.importantTitle': 'Important',
    'cal.urgentTitle': 'Urgent',
    'cal.somedayTitle': 'Someday',
    'cal.scheduleTitle': 'Schedule',
    'cal.moreItems': '+{n} more',
    'cal.addEventShort': 'Event',
    'cal.addNoteShort': 'Note',
    'cal.addEventTitle': 'Add New Event',
    'cal.addNoteTitle': 'Add Daily Note',
    'cal.agendaTitle': '📋 Schedule & Agenda',
    'cal.addEventNew': '+ New Event',
    'cal.saveNoteBtn': '💾 Save Note',
    'cal.deleteNoteBtn': '🗑️ Delete Note',
    'cal.dayNotePh': 'Write your thoughts, daily journal, notes, or tasks for this day...',
    'cal.editNote': 'Click to edit note',
    'cal.editEvent': 'Click to edit event',
    'cal.viewTask': 'Click to view task details',
    'cal.quickAdd': 'Add to this day',
    'cal.noUpcoming': 'No upcoming events or deadlines scheduled.',
    'cal.noUpcomingHint': 'Click "+ New Event" above to schedule occasions and WhatsApp reminders!',
    'cal.noEventsDay': 'No events scheduled for this day.',
    'cal.noEventsAll': 'No events added yet.',
    'cal.noEventsHint': 'Click "+ Add" to create a new occasion with WhatsApp alerts.',
    'cal.confirmDeleteEvent': 'Are you sure you want to delete this event?',
    'cal.testWaOk': '✅ WhatsApp notification sent successfully!',
    'cal.testWaErr': '⚠️ Failed to send: ',
    'cal.waBadge': 'WhatsApp',
    'cal.studyTask': 'Class Assignment',
    'cal.courseLabel': 'Course: ',
    'cal.toggleHero': 'Toggle Year Progress',
    'cal.weekNumTitle': 'Week Number',
    'cal.prevWeek': 'Previous Week',
    'cal.nextWeek': 'Next Week',
    'cal.addImportant': 'Add Important Task',
    'cal.addUrgent': 'Add Urgent Task',
    'cal.addSomeday': 'Add Someday Idea',
    'cal.addSchedule': 'Add Schedule Event',
    'cal.addEventBtn': '+ Add',
    'cal.evModalTitleNew': 'Add New Event',
    'cal.evModalTitleEdit': 'Edit Event',
    'cal.evType': 'Event Type:',
    'cal.evTitle': 'Event Title:',
    'cal.evTitlePh': 'e.g. Birthday, Conference, Meeting...',
    'cal.evDate': 'Date:',
    'cal.evTime': 'Time:',
    'cal.evRecurring': 'Recurrence:',
    'cal.evRecNone': 'None (Once)',
    'cal.evRecYearly': 'Yearly (Every Year on same date)',
    'cal.evRecMonthly': 'Monthly (Every Month on same day)',
    'cal.evRecWeekly': 'Weekly (Every Week on same day)',
    'cal.evNotes': 'Notes or details:',
    'cal.evNotesPh': 'Location, link, or notes to remember...',
    'cal.evWaTitle': 'WhatsApp Alerts',
    'cal.evWaTiming': 'Send Timing:',
    'cal.evWaTimeMorning': 'On day of event (9:00 AM)',
    'cal.evWaTime1d': '1 day before (9:00 AM)',
    'cal.evWaTimeAtEvent': 'At exact event time',
    'cal.evWaTime1h': '1 hour before event',
    'cal.evWaTime3h': '3 hours before event',
    'cal.evWaRecipient': 'Recipient (Optional - defaults to Settings):',
    'cal.evWaRecipientPh': 'Leave empty for configured recipient',
    'cal.evWaMessage': 'Custom Message (or leave blank for auto template):',
    'cal.evWaMessagePh': 'Default auto-template for event type...',
    'cal.evTestWa': '🚀 Send WhatsApp Test Now',
    'cal.evSave': '💾 Save Event',
    'cal.evDelete': '🗑️ Delete',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.refresh': 'Refresh',
    'cal.habitPrefix': 'Habit: {title}',
    'cal.dailyNote': 'Daily Note',
    'cal.notePrefix': '📝 Note: {text}',
    'cal.taskDuePrefix': '📋 Due: {text}',
    'cal.requireTitleAlert': 'Please enter an event title first',
    'cal.requireDateAlert': 'Please select an event date',
    'cal.sendingWa': 'Sending via WhatsApp... ⏳',
    'cal.sendWaSuccess': '✅ WhatsApp reminder sent successfully!',
    'cal.sendWaFail': '❌ Failed to send: {error}',
    'cal.sendWaNetError': '❌ Connection error: {error}',
  },
});

const CATEGORIES = {
  birthday: { id: 'birthday', nameAr: 'عيد ميلاد', nameEn: 'Birthday', icon: '🎂', color: '#ec4899', defaultTemplate: '🎂 *تذكير مناسبة سعيدة: {title}* 🎂\n\n📅 التاريخ: {date}\n⏰ الوقت: {time}\n{notes}\n🎉 نتمنى لكم يوماً سعيداً ومباركاً وعاماً حافلاً بالتوفيق والنجاح!' },
  conference: { id: 'conference', nameAr: 'مؤتمر / ندوة', nameEn: 'Conference / Seminar', icon: '🎙️', color: '#8b5cf6', defaultTemplate: '🎙️ *تذكير هام بمؤتمر / ندوة: {title}* 🎙️\n\n📅 التاريخ: {date}\n⏰ التوقيت: {time}\n{notes}\n📌 لا تنسَ الحضور والمشاركة في الموعد المحدد.' },
  meeting: { id: 'meeting', nameAr: 'اجتماع عمل', nameEn: 'Business Meeting', icon: '💼', color: '#3b82f6', defaultTemplate: '💼 *تذكير باجتماع عمل: {title}* 💼\n\n📅 التاريخ: {date}\n⏰ الموعد: {time}\n{notes}\n📍 يرجى الحضور في الموعد المحدد والتحضير للاجتماع.' },
  anniversary: { id: 'anniversary', nameAr: 'ذكرى سنوية', nameEn: 'Anniversary', icon: '💍', color: '#f59e0b', defaultTemplate: '💍 *تذكير بمناسبة خاصة: {title}* 💍\n\n📅 التاريخ: {date}\n{notes}\n✨ أطيب التهاني والأمنيات بدوام السعادة والتوفيق الدائم!' },
  exam: { id: 'exam', nameAr: 'امتحان / اختبار', nameEn: 'Exam / Quiz', icon: '📝', color: '#ef4444', defaultTemplate: '📝 *تذكير باختبار / امتحان: {title}* 📝\n\n📅 التاريخ: {date}\n⏰ وقت الامتحان: {time}\n{notes}\n📚 بالتوفيق والنجاح والتركيز التام إن شاء الله!' },
  appointment: { id: 'appointment', nameAr: 'موعد هام', nameEn: 'Important Appointment', icon: '🩺', color: '#10b981', defaultTemplate: '🩺 *تذكير بموعد هام: {title}* 🩺\n\n📅 الموعد: {date}\n⏰ الساعة: {time}\n{notes}\n🔔 تذكير لتنظيم جدولك والوصول في الوقت المحدد.' },
  deadline: { id: 'deadline', nameAr: 'موعد تسليم', nameEn: 'Delivery Deadline', icon: '⏳', color: '#f97316', defaultTemplate: '⏳ *تنبيه موعد تسليم نهائي: {title}* ⏳\n\n📅 آخر موعد: {date}\n⏰ التوقيت: {time}\n{notes}\n⚠️ يرجى الانتهاء من العمل وتسليمه قبل إغلاق موعد التسليم!' },
  general: { id: 'general', nameAr: 'مناسبة عامة', nameEn: 'General Occasion', icon: '📌', color: '#06b6d4', defaultTemplate: '📌 *تذكير بمناسبة: {title}* 📌\n\n📅 التاريخ: {date}\n⏰ الوقت: {time}\n{notes}\n🔔 تذكير مُرسل من ودجت سطح المكتب (Mirqat Widgets).' },
};

const DEFAULT_DEMO_EVENTS = [
  { id: 'ev_trip_jeddah', title: 'رحلة إلى جدة', titleEn: 'Trip to Jeddah', date: '2026-10-09', endDate: '2026-10-11', category: 'anniversary', color: '#f43f5e', isMultiDay: true, time: '08:00', notes: 'إجازة ورحلة عائلية إلى جدة' },
  { id: 'ev_team_meeting', title: 'اجتماع فريق التطوير', titleEn: 'Dev Team Sync', date: '2026-10-08', category: 'meeting', color: '#3b82f6', time: '15:00', notes: 'مناقشة خطة الإطلاق ومراجعة الميزات الجديدة' },
  { id: 'ev_email_reply', title: 'الرد على الإيميلات المهمة', titleEn: 'Reply to Important Emails', date: '2026-10-09', category: 'deadline', color: '#f59e0b', time: '08:45', notes: 'مراجعة صندوق الوارد والرد على طلبات العملاء' },
  { id: 'ev_shipment', title: 'استلام الشحنة', titleEn: 'Pickup Shipment', date: '2026-10-09', category: 'appointment', color: '#10b981', time: '16:00', notes: 'استلام الطرد من فرع سمسا / أرامكس' },
  { id: 'ev_flight', title: 'اللحاق بالطائرة', titleEn: 'Catch the Flight', date: '2026-10-09', category: 'appointment', color: '#ef4444', time: '18:00', notes: 'المطار الدولي - صالة المغادرة رقم 2' },
  { id: 'ev_week_plan', title: 'تخطيط الأسبوع القادم', titleEn: 'Next Week Planning', date: '2026-10-10', category: 'general', color: '#8b5cf6', time: '20:00', notes: 'تحديد الأولويات ومراجعة جدول المواعيد' },
  { id: 'ev_bday_anas', title: 'عيد ميلاد أنس', titleEn: "Anas's Birthday", date: '2026-10-18', category: 'birthday', color: '#ec4899', time: '19:00', recurring: 'yearly' },
  { id: 'ev_friend_wedding', title: 'زواج صديقي', titleEn: "Friend's Wedding", date: '2026-10-24', category: 'anniversary', color: '#ec4899', time: '20:30' },
  { id: 'ev_fund_mgmt', title: 'إدارة صندوق الاستثمار', titleEn: 'Fund Management', date: '2026-10-04', category: 'meeting', color: '#8b5cf6', time: '11:00' },
  { id: 'ev_workshop', title: 'ورشة عمل', titleEn: 'Workshop', date: '2026-10-25', category: 'conference', color: '#8b5cf6', time: '17:00' },
  { id: 'ev_dinner', title: 'عشاء عائلي', titleEn: 'Family Dinner', date: '2026-10-18', category: 'general', color: '#f59e0b', time: '21:00' },
];

const DEFAULT_BENTO_DATA = {
  important: [
    { id: 'bi_workout', title: 'تمرين', done: false, cat: 'important' },
    { id: 'bi_reading', title: 'قراءة 10 صفحات', done: false, cat: 'important' },
    { id: 'bi_week_plan', title: 'تخطيط الأسبوع القادم - 11 أكتوبر', done: false, cat: 'important' },
    { id: 'bi_budget', title: 'مراجعة الميزانية الشهرية', done: false, cat: 'important' },
  ],
  urgent: [
    { id: 'bu_flight', title: 'اللحاق بالطائرة', time: '18:00', done: false, cat: 'urgent' },
    { id: 'bu_emails', title: 'الرد على الإيميلات المهمة', done: false, cat: 'urgent' },
  ],
  someday: [
    { id: 'bs_trip', title: 'ترتيب طلعة نهاية الأسبوع', done: false, cat: 'someday' },
    { id: 'bs_photos', title: 'ترتيب صور الجوال', done: false, cat: 'someday' },
    { id: 'bs_closet', title: 'ترتيب الدولاب', done: false, cat: 'someday' },
  ],
  schedule: [
    { id: 'bc_shipment', title: 'استلام الشحنة', time: '16:00', done: false, cat: 'schedule' },
    { id: 'bc_team', title: 'رسائل الفريق', done: false, cat: 'schedule' },
    { id: 'bc_dentist', title: 'موعد طبيب الأسنان - 17 أكتوبر', done: false, cat: 'schedule' },
  ],
};

let cfg = {
  weekStart: 6,
  hijri: true,
  hijriAdjust: 0,
  viewMode: 'month',
  showDayActions: true,
  showRedDot: true,
  showTasksOnCalendar: true,
  showHabitsOnCalendar: false,
  highlightWeekend: true,
  visualStyle: 'modern',
};

let view = null;             // { y, m } for month view
let weekAnchorDate = null;   // Date object representing the active week
let todayKey = '';
let dayTimer = null;
let events = [];
let dayNotes = {};
let todosList = [];
let habitsState = { habits: [], logs: {} };
let showYearHero = false;
let editingEventId = null;
let currentSelectedCat = 'birthday';
let activeNoteDateStr = '';
let currentViewMode = 'month'; // 'month' | 'split' | 'week' | 'bento' | 'year' | 'agenda'

function playChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.32);
  } catch {}
}

function getWeekNumber(d) {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - target) / 604800000);
}

function renderYearProgressHero() {
  const hero = $('#yearProgressHero');
  const btn = $('#toggleHeroBtn');
  if (btn) btn.classList.toggle('active', Boolean(showYearHero));
  if (!hero) return;
  hero.hidden = !showYearHero;
  if (!showYearHero) return;

  const now = new Date();
  const y = view?.y || now.getFullYear();
  const isLeap = (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
  const totalDays = isLeap ? 366 : 365;

  const startOfYear = new Date(y, 0, 1);
  const curDate = (y === now.getFullYear()) ? now : (y < now.getFullYear() ? new Date(y, 11, 31) : startOfYear);
  const diffMs = curDate.getTime() - startOfYear.getTime();
  const dayOfYear = Math.min(totalDays, Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1));
  const daysLeft = Math.max(0, totalDays - dayOfYear);
  const pct = Math.round((dayOfYear / totalDays) * 100);

  const isEn = lang() === 'en';
  if ($('#ypPct')) $('#ypPct').textContent = `${digits(pct)}%`;
  if ($('#ypYear')) $('#ypYear').textContent = digits(y);
  if ($('#ypDaysLeft')) $('#ypDaysLeft').textContent = t('cal.daysRemaining', { n: digits(daysLeft) });
  if ($('#ypPassedText')) $('#ypPassedText').textContent = t('cal.yearPassed', { pct: digits(pct) });

  const arLetters = ['ينا', 'فبر', 'مار', 'أبر', 'ماي', 'يون', 'يول', 'أغس', 'سبت', 'أكت', 'نوف', 'ديس'];
  const enLetters = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  const letters = isEn ? enLetters : arLetters;

  const currentMonthIdx = (y === now.getFullYear()) ? now.getMonth() : (y < now.getFullYear() ? 12 : -1);
  const currentDayInMonth = now.getDate();

  const cols = [];
  for (let m = 0; m < 12; m++) {
    const daysInThisMonth = new Date(y, m + 1, 0).getDate();
    let fillPct = 0;
    let isCurrentMonth = false;

    if (m < currentMonthIdx) {
      fillPct = 100;
    } else if (m === currentMonthIdx) {
      isCurrentMonth = true;
      fillPct = Math.min(100, Math.max(5, Math.round((currentDayInMonth / daysInThisMonth) * 100)));
    } else {
      fillPct = 0;
    }

    const col = el('div', {
      class: `yp-col${isCurrentMonth ? ' current' : ''}`,
      title: `${monthName(y, m)}: ${fillPct}%`,
      onclick: () => {
        view = { y, m };
        renderCurrentView();
      }
    },
      el('div', { class: 'yp-capsule' },
        el('div', {
          class: `yp-fill${fillPct === 100 ? ' full' : (isCurrentMonth ? ' partial' : '')}`,
          style: `height: ${fillPct}%;`
        })
      ),
      el('span', { class: 'yp-month-lbl', text: letters[m] })
    );

    cols.push(col);
  }

  const row = $('#ypCapsulesRow');
  if (row) row.replaceChildren(...cols);
}

const locale = () => window.UI.locale();

function keyOf(d) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function dateToYmd(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/* ---------- Hijri ---------- */

const hijriFmt = new Map();
function hijriParts(date) {
  const nu = lang() === 'en' ? 'en' : (window.UI.settings().numerals === 'arab' ? 'arab' : 'latn');
  if (!hijriFmt.has(nu)) {
    const tag = nu === 'en' ? 'en-u-ca-islamic-umalqura-nu-latn' : `ar-SA-u-ca-islamic-umalqura-nu-${nu}`;
    hijriFmt.set(nu, {
      parts: new Intl.DateTimeFormat(tag, { day: 'numeric', month: 'long', year: 'numeric' }),
    });
  }
  const shifted = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
  shifted.setDate(shifted.getDate() + (Number(cfg.hijriAdjust) || 0));
  const out = {};
  for (const p of hijriFmt.get(nu).parts.formatToParts(shifted)) {
    if (p.type === 'day' || p.type === 'month' || p.type === 'year') out[p.type] = p.value;
  }
  return out;
}

function hijriText(date) {
  const h = hijriParts(date);
  return `${h.day} ${h.month} ${h.year} ${t('cal.ah')}`;
}

/* ---------- names ---------- */

function weekdayNames(style) {
  const f = new Intl.DateTimeFormat(locale(), { weekday: style });
  return Array.from({ length: 7 }, (_, i) => f.format(new Date(2023, 0, 1 + i)));
}

function monthName(y, m) {
  return new Intl.DateTimeFormat(locale(), { month: 'long' }).format(new Date(y, m, 1));
}

function formatFullDate(date) {
  return new Intl.DateTimeFormat(locale(), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/* ---------- data helpers ---------- */

function getEventsForDate(y, m, d) {
  const target = new Date(y, m, d);
  const ty = target.getFullYear();
  const tm = target.getMonth() + 1;
  const td = target.getDate();
  const curStr = `${ty}-${pad2(tm)}-${pad2(td)}`;

  const pool = (events && events.length) ? events : DEFAULT_DEMO_EVENTS;
  return pool.filter((ev) => {
    if (!ev || !ev.date) return false;
    // Multi-day event support
    if (ev.endDate && ev.endDate >= ev.date) {
      if (curStr >= ev.date && curStr <= ev.endDate) return true;
    }
    const [ey, em, ed] = ev.date.split('-').map(Number);
    if (ev.recurring === 'yearly') {
      return em === tm && ed === td;
    }
    if (ev.recurring === 'monthly') {
      return ed === td;
    }
    if (ev.recurring === 'weekly') {
      const origWd = new Date(ey, em - 1, ed).getDay();
      return target.getDay() === origWd;
    }
    return ey === ty && em === tm && ed === td;
  });
}

function getHabitsForDate(y, m, d) {
  if (!cfg.showHabitsOnCalendar) return [];
  const dateStr = `${y}-${pad2(m + 1)}-${pad2(d)}`;
  const dayLog = habitsState?.logs?.[dateStr]?.habits || {};
  const list = habitsState?.habits || [];
  if (list.length > 0) {
    return list.filter(h => !h.archived).map(h => ({
      id: h.id,
      title: h.title,
      icon: h.icon || '⚡',
      color: h.color || '#3b82f6',
      done: dayLog[h.id]?.status === 'done',
    }));
  }
  return [];
}

function getDayNoteForDate(dateStr) {
  if (!dateStr || !dayNotes) return '';
  return dayNotes[dateStr] || '';
}

function getTasksForDate(y, m, d) {
  if (!cfg.showTasksOnCalendar || !Array.isArray(todosList)) return [];
  const targetStr = `${y}-${pad2(m + 1)}-${pad2(d)}`;

  return todosList.filter((task) => {
    if (!task || task.done) return false;
    let deadlineStr = '';
    if (task.deadline) {
      deadlineStr = String(task.deadline).slice(0, 10);
    } else if (task.due) {
      deadlineStr = String(task.due).slice(0, 10);
    }
    return deadlineStr === targetStr;
  });
}

function updateEventsBadge() {
  const badge = $('#eventsBadge');
  if (!badge) return;
  const notesCount = Object.keys(dayNotes || {}).filter((k) => dayNotes[k]?.trim()).length;
  const totalCount = events.length + notesCount;
  badge.hidden = totalCount === 0;
}

/* ---------- rendering: today panel ---------- */

function renderToday() {
  const now = new Date();
  $('#tWeekday').textContent = new Intl.DateTimeFormat(locale(), { weekday: 'long' }).format(now);
  $('#tDay').textContent = digits(now.getDate());
  $('#tGreg').textContent = new Intl.DateTimeFormat(locale(), { month: 'long', year: 'numeric' }).format(now);
  $('#tHijri').textContent = cfg.hijri ? hijriText(now) : '';
  $('#tHijri').hidden = !cfg.hijri;
}

function hijriSpan(y, m) {
  const first = hijriParts(new Date(y, m, 1));
  const last = hijriParts(new Date(y, m + 1, 0));
  return first.month === last.month
    ? `${first.month} ${first.year}`
    : `${first.month} – ${last.month}`;
}

/* ---------- rendering: Month View ---------- */

function renderMonth({ direction = 0 } = {}) {
  const { y, m } = view;
  const now = new Date();
  const isCurrent = y === now.getFullYear() && m === now.getMonth();

  if ($('#mWeekBadge')) {
    $('#mWeekBadge').textContent = digits(getWeekNumber(new Date(y, m, isCurrent ? now.getDate() : 1)));
  }

  $('#mName').textContent = isCurrent
    ? monthName(y, m)
    : `${monthName(y, m)} ${digits(y)}`;
  $('#mHijri').textContent = cfg.hijri ? hijriSpan(y, m) : '';
  $('#mTitle').classList.toggle('away', !isCurrent);

  const start = Number.isInteger(cfg.weekStart) ? cfg.weekStart : 6;
  const narrow = weekdayNames('narrow');
  $('#weekdays').replaceChildren(...Array.from({ length: 7 }, (_, i) => {
    const wd = (start + i) % 7;
    const isWeekend = wd === 5 || wd === 6;
    return el('span', { class: isWeekend ? 'wd fri' : 'wd', text: narrow[wd] });
  }));

  const first = new Date(y, m, 1);
  const lead = (first.getDay() - start + 7) % 7;
  const days = new Date(y, m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push(el('div', { class: 'cell bento-day-cell blank other-month' }));

  for (let d = 1; d <= days; d++) {
    const date = new Date(y, m, d);
    const dateStr = `${y}-${pad2(m + 1)}-${pad2(d)}`;
    const cls = ['cell', 'day', 'bento-day-cell'];
    const wd = date.getDay();
    if (wd === 5) cls.push('fri');
    if (wd === 6) cls.push('sat');
    if (wd === 5 || wd === 6) cls.push('weekend');
    if (isCurrent && d === now.getDate()) cls.push('today');

    const dayEvs = getEventsForDate(y, m, d);
    const noteText = getDayNoteForDate(dateStr);
    const hasNote = Boolean(noteText && noteText.trim());
    const hasEvent = dayEvs.length > 0;
    const dayTasks = getTasksForDate(y, m, d);
    const hasTask = dayTasks.length > 0;
    const dayHabits = getHabitsForDate(y, m, d);

    if (hasEvent) cls.push('has-event');
    if (hasNote) cls.push('has-note');
    if (hasTask) cls.push('has-task');

    // Day number element
    const iEl = el('i', { class: 'bento-day-num', text: digits(d) });
    const cellTop = el('div', { class: 'bento-cell-top' }, iEl);
    const cellEl = el('div', { class: cls.join(' '), dataset: { d: String(d), date: dateStr } }, cellTop);

    if (hasEvent || hasNote) {
      cls.push('has-item');
      cellEl.classList.add('has-item');

      if (cfg.showRedDot !== false) {
        const dotTitle = hasNote ? (hasEvent ? `${t('cal.addEventShort')} + ${t('cal.addNoteShort')}` : t('cal.addNoteShort')) : t('cal.addEventShort');
        const dot = el('span', { class: 'red-dot', title: dotTitle });
        if ((hasEvent ? 1 : 0) + (hasNote ? 1 : 0) > 1) {
          cellEl.classList.add('has-multi');
        }
        iEl.appendChild(dot); // Anchored to top-left of circle!
      }
    }

    if (hasEvent) {
      const firstCat = CATEGORIES[dayEvs[0].category] || CATEGORIES.general;
      cellEl.style.setProperty('--ev-color', firstCat.color || '#3b82f6');
    }

    const isSmall = isSmallCalendar();

    // Check for multi-day spanning event (skipped in small compact mode for pristine squares)
    const multiEvent = isSmall ? null : dayEvs.find(e => e.isMultiDay || (e.endDate && e.endDate > e.date));
    if (multiEvent) {
      const banner = el('div', {
        class: 'multi-day-banner',
        title: multiEvent.title,
        onclick: (e) => { e.stopPropagation(); openEditEventModal(multiEvent.id); }
      }, multiEvent.title);
      cellEl.appendChild(banner);
    }

    // Event & habit chips (hidden in compact mode to keep the grid of squares pure and fast)
    if (!isSmall) {
      const nonMultiEvents = dayEvs.filter(e => e !== multiEvent);
      const chips = [];

      nonMultiEvents.forEach(ev => {
        let chipClass = 'chip-blue';
        if (ev.category === 'birthday') chipClass = 'chip-pink';
        else if (ev.category === 'deadline') chipClass = 'chip-amber';
        else if (ev.category === 'appointment') chipClass = 'chip-teal';
        else if (ev.category === 'conference') chipClass = 'chip-purple';

        chips.push(el('div', {
          class: `bento-chip ${chipClass}`,
          title: `${ev.title} ${ev.time || ''}`,
          onclick: (e) => { e.stopPropagation(); openEditEventModal(ev.id); }
        },
          el('span', { class: 'bento-chip-dot' }),
          el('span', { class: 'bento-chip-text', text: ev.title })
        ));
      });

      if (cfg.showHabitsOnCalendar) {
        dayHabits.forEach(h => {
          chips.push(el('div', {
            class: 'bento-chip chip-teal',
            title: t('cal.habitPrefix', { title: h.title }),
            onclick: (e) => { e.stopPropagation(); toggleHabitDone(h, dateStr); }
          },
            el('span', { class: 'bento-chip-dot' }),
            el('span', { class: 'bento-chip-text', text: h.title })
          ));
        });
      }

      const maxVisibleChips = multiEvent ? 1 : 2;
      const visibleChips = chips.slice(0, maxVisibleChips);
      visibleChips.forEach(c => cellEl.appendChild(c));

      if (chips.length > maxVisibleChips) {
        const overflowCount = chips.length - maxVisibleChips;
        cellEl.appendChild(el('span', { class: 'bento-overflow-badge', text: `+${overflowCount}` }));
      }
    }

    cells.push(cellEl);
  }
  while (cells.length < 42) cells.push(el('div', { class: 'cell bento-day-cell blank other-month' }));

  const grid = $('#grid');
  grid.className = 'grid month-bento-grid';
  grid.replaceChildren(...cells);
  if (direction) {
    grid.classList.remove('slide-next', 'slide-prev');
    void grid.offsetWidth;
    grid.classList.add(direction > 0 ? 'slide-next' : 'slide-prev');
  }

  updateEventsBadge();
}

/* ---------- rendering: Week View (7 Columns) ---------- */

function getWeekDates(anchor = new Date()) {
  const startDay = Number.isInteger(cfg.weekStart) ? cfg.weekStart : 6;
  const curr = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate());
  const day = curr.getDay();
  const diff = (day - startDay + 7) % 7;
  curr.setDate(curr.getDate() - diff);

  const dates = [];
  for (let i = 0; i < 7; i++) {
    dates.push(new Date(curr.getFullYear(), curr.getMonth(), curr.getDate() + i));
  }
  return dates;
}

function renderWeek() {
  if (!weekAnchorDate) weekAnchorDate = new Date();
  const weekDates = getWeekDates(weekAnchorDate);
  const container = $('#weekColumnsGrid');
  if (!container) return;

  const firstDate = weekDates[0];
  const lastDate = weekDates[6];
  const spanText = `${firstDate.getDate()} ${monthName(firstDate.getFullYear(), firstDate.getMonth())} – ${lastDate.getDate()} ${monthName(lastDate.getFullYear(), lastDate.getMonth())} ${digits(lastDate.getFullYear())}`;
  if ($('#wWeekSpan')) $('#wWeekSpan').textContent = spanText;

  const now = new Date();
  const nowYmd = dateToYmd(now);
  const weekdayShort = weekdayNames('narrow');

  // Multi-day banner strip at top of week view
  const strip = $('#weekMultiDayStrip');
  if (strip) {
    const multiEvents = (events && events.length ? events : DEFAULT_DEMO_EVENTS).filter(e => e.isMultiDay || (e.endDate && e.endDate > e.date));
    if (multiEvents.length > 0) {
      strip.replaceChildren(...multiEvents.map(me => el('div', {
        class: 'multi-day-banner',
        style: 'text-align: center; padding: 4px 10px; font-size: 10px; border-radius: 6px;',
        text: `✈️ ${me.title} (${me.date} – ${me.endDate || me.date})`,
        onclick: () => openEditEventModal(me.id)
      })));
      strip.hidden = false;
    } else {
      strip.replaceChildren();
      strip.hidden = true;
    }
  }

  const columns = weekDates.map((dateObj) => {
    const y = dateObj.getFullYear();
    const m = dateObj.getMonth();
    const d = dateObj.getDate();
    const dateStr = dateToYmd(dateObj);
    const isToday = dateStr === nowYmd;
    const isWeekend = dateObj.getDay() === 5 || dateObj.getDay() === 6;

    const dayEvs = getEventsForDate(y, m, d);
    const noteText = getDayNoteForDate(dateStr);
    const dayTasks = getTasksForDate(y, m, d);
    const dayHabits = getHabitsForDate(y, m, d);
    const hasItems = dayEvs.length > 0 || Boolean(noteText && noteText.trim());

    const colEl = el('div', {
      class: `week-col${isToday ? ' today' : ''}${isWeekend ? ' weekend' : ''}`,
      dataset: { date: dateStr },
    });

    // Column Head
    const dayNumClass = isToday ? 'week-col-daynum week-col-today-badge' : 'week-col-daynum';
    const headEl = el('div', { class: 'week-col-head' },
      el('span', { class: 'week-col-dayname', text: weekdayShort[dateObj.getDay()] }),
      el('span', { class: dayNumClass, text: digits(d) })
    );

    if (hasItems && cfg.showRedDot !== false) {
      headEl.appendChild(el('span', { class: 'red-dot', style: 'bottom: -2px;' }));
    }

    headEl.onclick = (e) => {
      e.stopPropagation();
      showDayActionsPopup(dateStr, headEl);
    };

    // Column Items List
    const itemsEl = el('div', { class: 'week-col-items' });
    const isEn = lang() === 'en';

    // Events
    dayEvs.forEach((ev) => {
      const cat = CATEGORIES[ev.category] || CATEGORIES.general;
      const b = el('div', {
        class: 'week-item-badge event',
        title: `${isEn ? cat.nameEn : cat.nameAr}: ${ev.title} ${ev.time || ''}`,
        onclick: (e) => { e.stopPropagation(); openEditEventModal(ev.id); },
      },
        el('span', { text: cat.icon }),
        el('span', { text: `${ev.time ? `${ev.time} ` : ''}${ev.title}` })
      );
      b.style.setProperty('--ev-color', cat.color || '#3b82f6');
      itemsEl.appendChild(b);
    });

    // Habits
    dayHabits.forEach(h => {
      const hb = el('div', {
        class: 'week-item-badge task',
        style: 'background: rgba(20, 184, 166, 0.18); color: #5eead4; border-inline-start: 2px solid #14b8a6;',
        title: t('cal.habitPrefix', { title: h.title }),
        onclick: (e) => { e.stopPropagation(); toggleHabitDone(h, dateStr); }
      }, el('span', { text: h.icon }), el('span', { text: h.title }));
      itemsEl.appendChild(hb);
    });

    // Note preview
    if (noteText && noteText.trim()) {
      const nb = el('div', {
        class: 'week-item-badge note',
        title: `${t('cal.note')}: ${noteText}`,
        onclick: (e) => { e.stopPropagation(); openDayNoteModal(dateStr); },
      }, el('span', { text: '📝' }), el('span', { text: noteText.slice(0, 20) }));
      itemsEl.appendChild(nb);
    }

    // Tasks due
    dayTasks.forEach((task) => {
      const tb = el('div', {
        class: 'week-item-badge task',
        title: `${t('cal.task')}: ${task.text || task.title}`,
        onclick: (e) => { e.stopPropagation(); if (task.id) window.widgets.win.openTask(task.id); },
      }, el('span', { text: '📋' }), el('span', { text: (task.text || task.title).slice(0, 18) }));
      itemsEl.appendChild(tb);
    });

    // Quick add button
    const addBtn = el('button', {
      type: 'button',
      class: 'week-col-add-btn',
      title: t('cal.quickAdd'),
      onclick: (e) => {
        e.stopPropagation();
        openAddEventModal(dateStr);
      },
    }, '+');

    colEl.append(headEl, itemsEl, addBtn);
    return colEl;
  });

  container.replaceChildren(...columns);
}

/* ---------- rendering: Agenda / Schedule View ---------- */

function getCountdownText(targetDateStr) {
  const [y, m, d] = targetDateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d, 0, 0, 0);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 3600 * 24));

  if (diffDays === 0) return t('cal.todayBadge') || 'اليوم!';
  if (diffDays === 1) return t('cal.tomorrow') || 'غداً';
  if (diffDays === 2) return t('cal.inTwoDays') || 'باقي يومان';
  if (diffDays > 2) return t('cal.inDays', { n: diffDays }) || `باقي ${diffDays} أيام`;
  return t('cal.passed') || 'مضى';
}

function renderAgenda() {
  const container = $('#agendaTimeline');
  if (!container) return;

  const now = new Date();
  const todayStr = dateToYmd(now);
  const tomorrowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const tomorrowStr = dateToYmd(tomorrowDate);

  // Group items by date
  const dateMap = new Map();

  function addItemToDate(dStr, item) {
    if (!dateMap.has(dStr)) dateMap.set(dStr, []);
    dateMap.get(dStr).push(item);
  }

  // 1. Events
  events.forEach((ev) => {
    if (!ev || !ev.date) return;
    addItemToDate(ev.date, { kind: 'event', data: ev });
  });

  // 2. Day Notes
  Object.entries(dayNotes || {}).forEach(([dStr, text]) => {
    if (text && text.trim()) {
      addItemToDate(dStr, { kind: 'note', text, dateStr: dStr });
    }
  });

  // 3. Tasks
  if (cfg.showTasksOnCalendar && Array.isArray(todosList)) {
    todosList.forEach((task) => {
      if (!task || task.done) return;
      const dStr = (task.deadline || task.due || '').slice(0, 10);
      if (dStr && dStr >= todayStr) {
        addItemToDate(dStr, { kind: 'task', data: task });
      }
    });
  }

  const sortedDates = Array.from(dateMap.keys()).sort();
  // Filter only today and upcoming dates for clean schedule stream
  const upcomingDates = sortedDates.filter((d) => d >= todayStr);

  const isEn = lang() === 'en';
  if (!upcomingDates.length) {
    container.replaceChildren(el('div', { class: 'agenda-empty' },
      el('span', { style: 'font-size:32px; display:block; margin-bottom:8px;' }, '🗓️'),
      el('strong', { text: t('cal.noUpcoming') }),
      el('p', { text: t('cal.noUpcomingHint'), style: 'opacity:0.7; margin-top:4px;' })
    ));
    return;
  }

  const groups = upcomingDates.map((dStr) => {
    const items = dateMap.get(dStr) || [];
    const [y, m, d] = dStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const countdown = getCountdownText(dStr);

    let groupTitleText = `${formatFullDate(dateObj)}`;
    if (dStr === todayStr) groupTitleText = `🌟 ${t('cal.todayBadge')} — ${groupTitleText}`;
    else if (dStr === tomorrowStr) groupTitleText = `⏳ ${t('cal.tomorrow')} — ${groupTitleText}`;

    const groupEl = el('div', { class: 'agenda-group' },
      el('div', { class: 'agenda-group-title' },
        el('span', { text: groupTitleText }),
        el('span', { class: 'agenda-item-badge countdown', text: countdown })
      )
    );

    items.forEach((item) => {
      if (item.kind === 'event') {
        const ev = item.data;
        const cat = CATEGORIES[ev.category] || CATEGORIES.general;
        const card = el('div', {
          class: 'agenda-item-card',
          onclick: () => openEditEventModal(ev.id),
        },
          el('span', { class: 'agenda-item-icon' }, cat.icon),
          el('div', { class: 'agenda-item-content' },
            el('div', { class: 'agenda-item-title', text: ev.title }),
            el('div', { class: 'agenda-item-sub', text: `${isEn ? cat.nameEn : cat.nameAr} ${ev.time ? `• ${ev.time}` : ''}${ev.notes ? ` • ${ev.notes}` : ''}` })
          ),
          el('button', {
            type: 'button',
            class: 'ev-act-btn',
            title: isEn ? 'Send WhatsApp Test' : 'إرسال واتساب تجريبي',
            onclick: async (e) => {
              e.stopPropagation();
              const res = await window.widgets.calendar.testEventWhatsApp({ event: ev });
              if (res?.ok) alert(t('cal.testWaOk'));
              else alert(`${t('cal.testWaErr')}${res?.error || ''}`);
            },
          }, '🚀')
        );
        groupEl.appendChild(card);
      } else if (item.kind === 'note') {
        const card = el('div', {
          class: 'agenda-item-card',
          style: 'border-inline-start: 3px solid #f59e0b;',
          onclick: () => openDayNoteModal(item.dateStr),
        },
          el('span', { class: 'agenda-item-icon' }, '📝'),
          el('div', { class: 'agenda-item-content' },
            el('div', { class: 'agenda-item-title', text: isEn ? 'Daily Note' : 'ملاحظة يومية' }),
            el('div', { class: 'agenda-item-sub', text: item.text })
          ),
          el('span', { class: 'agenda-item-badge', style: 'background:rgba(245,158,11,0.2); color:#fbbf24;', text: t('cal.note') })
        );
        groupEl.appendChild(card);
      } else if (item.kind === 'task') {
        const task = item.data;
        const card = el('div', {
          class: 'agenda-item-card',
          style: 'border-inline-start: 3px solid #10b981;',
          onclick: () => { if (task.id) window.widgets.win.openTask(task.id); },
        },
          el('span', { class: 'agenda-item-icon' }, '📋'),
          el('div', { class: 'agenda-item-content' },
            el('div', { class: 'agenda-item-title', text: task.text || task.title }),
            el('div', { class: 'agenda-item-sub', text: task.courseName ? `${t('cal.courseLabel')}${task.courseName}` : t('cal.studyTask') })
          ),
          el('span', { class: 'agenda-item-badge task-badge', text: t('cal.task') })
        );
        groupEl.appendChild(card);
      }
    });

    return groupEl;
  });

  container.replaceChildren(...groups);
}

/* ---------- rendering: Split View (Upcoming Tasks + Mini Month Matrix) ---------- */

function renderSplitView() {
  const container = $('#splitView');
  if (!container) return;

  const now = new Date();
  const y = view?.y || now.getFullYear();
  const m = view?.m !== undefined ? view.m : now.getMonth();

  // Upcoming tasks list (Full width in Split view)
  const listEl = $('#splitTasksList');
  if (listEl) {
    const items = [];
    if (todosList && todosList.length) {
      todosList.forEach(t => {
        items.push({
          id: t.id,
          title: t.text || t.title,
          time: t.time || (t.deadline ? t.deadline.slice(5, 10).replace('-', '/') : '10/9'),
          done: !!t.done,
          isTodo: true
        });
      });
    }

    // Merge default items if empty or sparse to guarantee tasks always appear
    if (items.length < 3) {
      const defaults = [
        { id: 'def_reply', title: 'الرد على الإيميلات المهمة', time: '10/9', done: false },
        { id: 'def_shipment', title: 'استلام الشحنة', time: '16:00', done: false },
        { id: 'def_flight', title: 'اللحاق بالطائرة', time: '18:00', done: false },
      ];
      defaults.forEach(d => {
        if (!items.some(i => i.title === d.title)) items.push(d);
      });
    }

    const rows = items.map(item => {
      const row = el('div', {
        class: `split-task-row${item.done ? ' done' : ''}`,
        onclick: async () => {
          await toggleTaskDone(item);
        }
      },
        el('span', { class: 'split-task-time', text: item.time || '' }),
        el('button', {
          type: 'button',
          class: `radio-circle${item.done ? ' checked' : ''}`,
          onclick: async (e) => {
            e.stopPropagation();
            await toggleTaskDone(item);
          }
        }),
        el('span', { class: 'split-task-title', text: item.title })
      );
      return row;
    });

    listEl.replaceChildren(...rows);
  }
}

/* ---------- rendering: Bento Categorized Lists (4 Cards) ---------- */

function renderBentoView() {
  const container = $('#bentoView');
  if (!container) return;

  const cats = ['important', 'urgent', 'someday', 'schedule'];
  const catContainers = {
    important: $('#bentoItemsImportant'),
    urgent: $('#bentoItemsUrgent'),
    someday: $('#bentoItemsSomeday'),
    schedule: $('#bentoItemsSchedule'),
  };
  const catBadges = {
    important: $('#bentoBadgeImportant'),
    urgent: $('#bentoBadgeUrgent'),
    someday: $('#bentoBadgeSomeday'),
    schedule: $('#bentoBadgeSchedule'),
  };

  cats.forEach(cat => {
    const listEl = catContainers[cat];
    const badgeEl = catBadges[cat];
    if (!listEl) return;

    let items = (todosList || []).filter(t => {
      if (cat === 'important' && (t.priority === 'important' || t.priority === 2)) return true;
      if (cat === 'urgent' && (t.priority === 'urgent' || t.priority === 3)) return true;
      if (cat === 'someday' && (t.category === 'someday' || t.someday)) return true;
      if (cat === 'schedule' && (t.deadline || t.time)) return true;
      return false;
    });

    if (!items.length) {
      items = [...DEFAULT_BENTO_DATA[cat]];
    }

    if (badgeEl) badgeEl.textContent = digits(items.length);

    const rows = items.slice(0, 3).map(item => {
      const isDone = !!item.done;
      const row = el('div', {
        class: `bento-item-row${isDone ? ' done' : ''}`,
        onclick: async () => {
          await toggleTaskDone(item);
        }
      },
        el('button', {
          type: 'button',
          class: `radio-circle${isDone ? ' checked' : ''}`,
          onclick: async (e) => {
            e.stopPropagation();
            await toggleTaskDone(item);
          }
        }),
        item.time ? el('span', { class: 'bento-item-time', text: item.time }) : null,
        el('span', { class: 'bento-item-text', text: item.title || item.text })
      );
      return row;
    });

    if (items.length > 3) {
      const moreLink = el('div', {
        class: 'bento-more-link',
        text: `+${items.length - 3} أخرى`,
        onclick: () => switchViewMode('agenda')
      });
      rows.push(moreLink);
    }

    listEl.replaceChildren(...rows);
  });
}

/* ---------- rendering: Year View (12 Large Capsules) ---------- */

function renderYearView() {
  const container = $('#yearLargeContainer');
  if (!container) return;

  const now = new Date();
  const y = view?.y || now.getFullYear();

  const cards = [];
  for (let m = 0; m < 12; m++) {
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const isCurrent = y === now.getFullYear() && m === now.getMonth();
    let fillPct = 0;

    if (y < now.getFullYear() || (y === now.getFullYear() && m < now.getMonth())) {
      fillPct = 100;
    } else if (isCurrent) {
      fillPct = Math.round((now.getDate() / daysInMonth) * 100);
    }

    const card = el('div', {
      class: `yp-month-card${isCurrent ? ' current' : ''}`,
      onclick: () => {
        view = { y, m };
        switchViewMode('month');
      }
    },
      el('span', { class: 'yp-month-title', text: monthName(y, m) }),
      el('div', { class: 'yp-large-tube' },
        el('div', {
          class: `yp-large-fill${fillPct === 100 ? ' full' : ''}`,
          style: `height: ${fillPct}%;`
        })
      ),
      el('span', { class: 'yp-month-pct', text: `${digits(fillPct)}%` })
    );

    cards.push(card);
  }

  container.replaceChildren(...cards);
}

async function toggleTaskDone(item) {
  playChime();
  item.done = !item.done;

  if (item.id && window.widgets.todos?.patch) {
    try {
      await window.widgets.todos.patch(item.id, { done: item.done });
      todosList = (await window.widgets.todos.get()) || [];
    } catch {}
  }

  renderCurrentView();
}

async function toggleHabitDone(habit, dateStr) {
  playChime();
  if (habit.id && window.widgets.habits?.saveStatus) {
    try {
      const nextStatus = habit.done ? 'pending' : 'done';
      await window.widgets.habits.saveStatus({ habitId: habit.id, dateStr, status: nextStatus });
      habitsState = (await window.widgets.habits.getState()) || habitsState;
    } catch {}
  }
  renderCurrentView();
}

/* ---------- rendering: Master Switcher ---------- */

function updateCalViewIndicator() {
  const sel = document.getElementById('calViewSelector');
  const ind = document.getElementById('calViewIndicator');
  if (!sel || !ind) return;
  const activeBtn = sel.querySelector('.cal-view-btn.active');
  if (!activeBtn) {
    ind.style.opacity = '0';
    return;
  }
  const selRect = sel.getBoundingClientRect();
  const btnRect = activeBtn.getBoundingClientRect();
  if (btnRect.width === 0) {
    if (typeof requestAnimationFrame !== 'undefined') requestAnimationFrame(updateCalViewIndicator);
    return;
  }
  ind.style.opacity = '1';
  ind.style.width = `${btnRect.width}px`;
  const offsetLeft = btnRect.left - selRect.left;
  ind.style.transform = `translateX(${offsetLeft}px)`;
}

function switchViewMode(mode, { persist = true } = {}) {
  currentViewMode = mode;
  if (cfg) cfg.viewMode = mode;
  document.querySelectorAll('#calViewSelector .cal-view-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.view === mode);
  });
  updateCalViewIndicator();

  const mPane = $('#monthView');
  const sPane = $('#splitView');
  const wPane = $('#weekView');
  const bPane = $('#bentoView');
  const yPane = $('#yearView');
  const aPane = $('#agendaView');

  if (mPane) mPane.hidden = mode !== 'month';
  if (sPane) sPane.hidden = mode !== 'split';
  if (wPane) wPane.hidden = mode !== 'week';
  if (bPane) bPane.hidden = mode !== 'bento';
  if (yPane) yPane.hidden = mode !== 'year';
  if (aPane) aPane.hidden = mode !== 'agenda';

  renderCurrentView();

  if (persist && window.widgets?.settings?.set) {
    window.widgets.settings.set({ calendar: { ...(cfg || {}), viewMode: mode } }).catch(() => {});
  }
}

function isSmallCalendar() {
  const root = document.documentElement;
  return root.dataset.compact === 'compact' ||
         root.dataset.compact === 'ultra' ||
         root.dataset.sizeW === 'nano' ||
         root.dataset.sizeW === 'xs' ||
         root.dataset.sizeH === 'nano' ||
         root.dataset.sizeH === 'xs' ||
         window.innerWidth <= 320 ||
         window.innerHeight <= 270;
}

function renderCurrentView(opts) {
  renderToday();
  renderYearProgressHero();

  // In compact/small mode, ALWAYS display and populate the 7x6 month grid of squares!
  if (isSmallCalendar()) {
    const mPane = $('#monthView');
    if (mPane) mPane.hidden = false;
    renderMonth(opts);
    return;
  }

  const mPane = $('#monthView');
  const sPane = $('#splitView');
  const wPane = $('#weekView');
  const bPane = $('#bentoView');
  const yPane = $('#yearView');
  const aPane = $('#agendaView');

  if (mPane) mPane.hidden = currentViewMode !== 'month';
  if (sPane) sPane.hidden = currentViewMode !== 'split';
  if (wPane) wPane.hidden = currentViewMode !== 'week';
  if (bPane) bPane.hidden = currentViewMode !== 'bento';
  if (yPane) yPane.hidden = currentViewMode !== 'year';
  if (aPane) aPane.hidden = currentViewMode !== 'agenda';

  if (currentViewMode === 'month') {
    renderMonth(opts);
  } else if (currentViewMode === 'split') {
    renderSplitView();
  } else if (currentViewMode === 'week') {
    renderWeek();
  } else if (currentViewMode === 'bento') {
    renderBentoView();
  } else if (currentViewMode === 'year') {
    renderYearView();
  } else if (currentViewMode === 'agenda') {
    renderAgenda();
  }
}

function render(opts) {
  renderCurrentView(opts);
}

function go(delta) {
  if (isSmallCalendar() || currentViewMode === 'month' || currentViewMode === 'split') {
    const d = new Date(view.y, view.m + delta, 1);
    view = { y: d.getFullYear(), m: d.getMonth() };
    if (isSmallCalendar() || currentViewMode === 'month') renderMonth({ direction: delta });
    else renderSplitView();
  } else if (currentViewMode === 'week') {
    if (!weekAnchorDate) weekAnchorDate = new Date();
    weekAnchorDate.setDate(weekAnchorDate.getDate() + (delta * 7));
    renderWeek();
  } else if (currentViewMode === 'year') {
    view.y = (view.y || new Date().getFullYear()) + delta;
    renderYearView();
  }
}

function goToday() {
  const now = new Date();
  view = { y: now.getFullYear(), m: now.getMonth() };
  weekAnchorDate = new Date();
  renderCurrentView();
}

let prevSmallState = null;
window.addEventListener('resize', () => {
  const curSmall = isSmallCalendar();
  if (curSmall !== prevSmallState) {
    prevSmallState = curSmall;
    renderCurrentView();
  }
});

/* ---------- Tooltip ---------- */

function showTip(cell) {
  const tip = $('#tip');
  const dNum = Number(cell.dataset.d);
  const date = new Date(view.y, view.m, dNum);
  const dateStr = `${view.y}-${pad2(view.m + 1)}-${pad2(dNum)}`;
  const greg = formatFullDate(date);

  const dayEvs = getEventsForDate(view.y, view.m, dNum);
  const noteText = getDayNoteForDate(dateStr);
  const dayTasks = getTasksForDate(view.y, view.m, dNum);

  let content = cfg.hijri ? `${greg} — ${hijriText(date)}` : greg;

  const items = [];
  if (noteText && noteText.trim()) {
    items.push(t('cal.notePrefix', { text: noteText }));
  }
  if (dayEvs.length > 0) {
    dayEvs.forEach((e) => {
      const cat = CATEGORIES[e.category] || CATEGORIES.general;
      items.push(`${cat.icon} ${e.title}${e.time ? ` (${e.time})` : ''}`);
    });
  }
  if (dayTasks.length > 0) {
    dayTasks.forEach((tTask) => items.push(t('cal.taskDuePrefix', { text: tTask.text || tTask.title })));
  }

  if (items.length > 0) {
    content += `\n───────────────\n${items.join('\n')}`;
  }

  tip.textContent = content;
  tip.style.whiteSpace = items.length > 0 ? 'pre-line' : 'nowrap';
  tip.classList.add('show');
  const r = cell.getBoundingClientRect();
  const w = tip.offsetWidth;
  const h = tip.offsetHeight;
  let x = r.left + r.width / 2 - w / 2;
  x = Math.max(6, Math.min(window.innerWidth - w - 6, x));
  let yPos = r.top - h - 6;
  if (yPos < 4) yPos = r.bottom + 6;
  tip.style.left = `${x}px`;
  tip.style.top = `${yPos}px`;
}

function hideTip() {
  $('#tip').classList.remove('show');
}

/* ---------- Day Micro-Actions Popup (+) and (📝) ---------- */

function showDayActionsPopup(dateStr, anchorEl) {
  const popup = $('#dayActionsPopup');
  if (!popup) return;
  hideTip();

  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);

  const isEn = lang() === 'en';
  $('#dapDateText').textContent = new Intl.DateTimeFormat(locale(), {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(dateObj);

  // Update button texts to match current language
  if ($('#dapEventText')) $('#dapEventText').textContent = t('cal.addEventShort');
  if ($('#dapNoteText')) $('#dapNoteText').textContent = t('cal.addNoteShort');

  // Wire buttons
  $('#dapAddEventBtn').onclick = (e) => {
    e.stopPropagation();
    hideDayActionsPopup();
    openAddEventModal(dateStr);
  };

  $('#dapAddNoteBtn').onclick = (e) => {
    e.stopPropagation();
    hideDayActionsPopup();
    openDayNoteModal(dateStr);
  };

  // Preview existing items
  const itemsContainer = $('#dapDayItems');
  const dayEvs = getEventsForDate(y, m - 1, d);
  const noteText = getDayNoteForDate(dateStr);
  const dayTasks = getTasksForDate(y, m - 1, d);

  const rows = [];
  if (noteText && noteText.trim()) {
    const row = el('div', {
      class: 'dap-item-row note',
      title: t('cal.editNote'),
      onclick: (e) => { e.stopPropagation(); hideDayActionsPopup(); openDayNoteModal(dateStr); },
    },
      el('span', { class: 'dap-item-icon' }, '📝'),
      el('span', { class: 'dap-item-title', text: noteText })
    );
    rows.push(row);
  }

  dayEvs.forEach((ev) => {
    const cat = CATEGORIES[ev.category] || CATEGORIES.general;
    const row = el('div', {
      class: 'dap-item-row event',
      title: t('cal.editEvent'),
      onclick: (e) => { e.stopPropagation(); hideDayActionsPopup(); openEditEventModal(ev.id); },
    },
      el('span', { class: 'dap-item-icon' }, cat.icon),
      el('span', { class: 'dap-item-title', text: ev.title })
    );
    rows.push(row);
  });

  dayTasks.forEach((task) => {
    const row = el('div', {
      class: 'dap-item-row task',
      title: t('cal.viewTask'),
      onclick: (e) => { e.stopPropagation(); hideDayActionsPopup(); if (task.id) window.widgets.win.openTask(task.id); },
    },
      el('span', { class: 'dap-item-icon' }, '📋'),
      el('span', { class: 'dap-item-title', text: task.text || task.title })
    );
    rows.push(row);
  });

  if (rows.length > 0) {
    itemsContainer.hidden = false;
    itemsContainer.replaceChildren(...rows);
  } else {
    itemsContainer.hidden = true;
    itemsContainer.replaceChildren();
  }

  popup.hidden = false;

  // Smart positioning within widget bounds
  const r = anchorEl.getBoundingClientRect();
  const pw = popup.offsetWidth || 160;
  const ph = popup.offsetHeight || 80;
  let left = r.left + r.width / 2 - pw / 2;
  left = Math.max(8, Math.min(window.innerWidth - pw - 8, left));
  let top = r.top - ph - 6;
  if (top < 8) top = r.bottom + 6;
  if (top + ph > window.innerHeight - 8) top = Math.max(8, window.innerHeight - ph - 8);

  popup.style.left = `${left}px`;
  popup.style.top = `${top}px`;
}

function hideDayActionsPopup() {
  const popup = $('#dayActionsPopup');
  if (popup) popup.hidden = true;
}

/* ---------- Day Note Modal Dialog ---------- */

function openDayNoteModal(dateStr) {
  activeNoteDateStr = dateStr;
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);

  $('#dayNoteTitle').textContent = `📝 ${t('cal.dayNoteTitle') || 'ملاحظة ويومية اليوم'}`;
  $('#dayNoteSubDate').textContent = `${formatFullDate(dateObj)}${cfg.hijri ? ` — ${hijriText(dateObj)}` : ''}`;

  const existingNote = getDayNoteForDate(dateStr);
  $('#dayNoteInput').value = existingNote;
  $('#dayNoteDeleteBtn').hidden = !existingNote;

  $('#dayNoteModal').hidden = false;
  $('#dayNoteInput').focus();
}

function closeDayNoteModal() {
  $('#dayNoteModal').hidden = true;
  activeNoteDateStr = '';
}

async function saveActiveDayNote() {
  if (!activeNoteDateStr) return;
  const text = $('#dayNoteInput').value.trim();

  if (window.widgets.calendar?.saveDayNote) {
    const updated = await window.widgets.calendar.saveDayNote(activeNoteDateStr, text);
    if (updated) dayNotes = updated;
    else dayNotes[activeNoteDateStr] = text;
  } else {
    dayNotes[activeNoteDateStr] = text;
  }

  closeDayNoteModal();
  renderCurrentView();
}

async function deleteActiveDayNote() {
  if (!activeNoteDateStr) return;
  if (confirm(t('cal.confirmDeleteEvent') || 'هل أنت متأكد من مسح ملاحظة هذا اليوم؟')) {
    if (window.widgets.calendar?.removeDayNote) {
      const updated = await window.widgets.calendar.removeDayNote(activeNoteDateStr);
      if (updated) dayNotes = updated;
      else delete dayNotes[activeNoteDateStr];
    } else {
      delete dayNotes[activeNoteDateStr];
    }
    closeDayNoteModal();
    renderCurrentView();
  }
}

/* ---------- Events Drawer & List ---------- */

function openEventsDrawer(filterDateStr = null) {
  const drawer = $('#eventsDrawer');
  if (!drawer) return;
  drawer.hidden = false;
  renderEventsDrawerList(filterDateStr);
}

function closeEventsDrawer() {
  const drawer = $('#eventsDrawer');
  if (drawer) drawer.hidden = true;
}

function renderEventsDrawerList(filterDateStr = null) {
  const listEl = $('#eventsList');
  if (!listEl) return;

  let displayEvents = [...events];
  if (filterDateStr) {
    const [fy, fm, fd] = filterDateStr.split('-').map(Number);
    displayEvents = getEventsForDate(fy, fm - 1, fd);
    $('#evDrawerTitleText').textContent = `${t('cal.eventsTitle')} (${filterDateStr})`;
  } else {
    $('#evDrawerTitleText').textContent = t('cal.eventsTitle') || 'المناسبات والتذكيرات';
  }

  displayEvents.sort((a, b) => (a.date || '').localeCompare(b.date || '') || (a.time || '').localeCompare(b.time || ''));

  if (!displayEvents.length) {
    listEl.replaceChildren(el('div', { class: 'ev-empty' },
      el('span', { style: 'font-size:24px; margin-bottom:6px;' }, '📅'),
      el('span', { text: filterDateStr ? t('cal.noEventsDay') : t('cal.noEventsAll') }),
      el('span', { text: t('cal.noEventsHint'), style: 'font-size:11px; opacity:0.7; margin-top:4px;' })
    ));
    return;
  }

  const isEn = lang() === 'en';
  listEl.replaceChildren(...displayEvents.map((ev) => {
    const cat = CATEGORIES[ev.category] || CATEGORIES.general;
    const isWa = ev.whatsapp?.enabled !== false;
    let recurLabel = '';
    if (ev.recurring === 'yearly') recurLabel = isEn ? '🔄 Yearly' : '🔄 سنوي';
    else if (ev.recurring === 'monthly') recurLabel = isEn ? '🔄 Monthly' : '🔄 شهري';
    else if (ev.recurring === 'weekly') recurLabel = isEn ? '🔄 Weekly' : '🔄 أسبوعي';

    const item = el('div', { class: 'ev-item', onclick: () => openEditEventModal(ev.id) },
      el('span', { class: 'ev-item-icon' }, cat.icon),
      el('div', { class: 'ev-item-main' },
        el('div', { class: 'ev-item-title', text: ev.title }),
        el('div', { class: 'ev-item-date' },
          el('span', { text: `📅 ${ev.date}${ev.time ? ` (${ev.time})` : ''}` }),
          recurLabel ? el('span', { text: recurLabel, style: 'opacity:0.8;' }) : null,
          isWa ? el('span', { class: 'ev-item-wa-badge' }, `💬 ${t('cal.waBadge')}`) : null
        )
      ),
      el('div', { class: 'ev-item-actions' },
        el('button', {
          class: 'ev-act-btn',
          title: isEn ? 'Send WhatsApp Test' : 'تجربة إرسال واتساب الآن',
          onclick: async (e) => {
            e.stopPropagation();
            try {
              const res = await window.widgets.calendar.testEventWhatsApp({ event: ev });
              if (res?.ok) alert(t('cal.testWaOk'));
              else alert(`${t('cal.testWaErr')}${res?.error || ''}`);
            } catch (err) {
              alert('Error: ' + err.message);
            }
          },
        }, '🚀'),
        el('button', {
          class: 'ev-act-btn danger',
          title: isEn ? 'Delete Event' : 'حذف المناسبة',
          onclick: async (e) => {
            e.stopPropagation();
            if (confirm(t('cal.confirmDeleteEvent'))) {
              await window.widgets.calendar.removeEvent(ev.id);
              events = await window.widgets.calendar.getEvents();
              renderCurrentView();
              renderEventsDrawerList(filterDateStr);
            }
          },
        }, '🗑️')
      )
    );
    return item;
  }));
}

/* ---------- Add / Edit Event Modal ---------- */

function buildCategoriesPills() {
  const grid = $('#evCatGrid');
  if (!grid) return;
  grid.replaceChildren(...Object.values(CATEGORIES).map((cat) => {
    const pill = el('div', {
      class: `ev-cat-pill${currentSelectedCat === cat.id ? ' active' : ''}`,
      dataset: { cat: cat.id },
      onclick: () => {
        currentSelectedCat = cat.id;
        document.querySelectorAll('.ev-cat-pill').forEach((p) => p.classList.toggle('active', p.dataset.cat === cat.id));
        const msgField = $('#evWaMessage');
        if (msgField && (!msgField.value || Object.values(CATEGORIES).some((c) => c.defaultTemplate === msgField.value))) {
          msgField.value = cat.defaultTemplate;
        }
      },
    }, el('span', { text: cat.icon }), el('span', { text: cat.nameAr }));
    return pill;
  }));
}

function openAddEventModal(defaultDate = null) {
  if (window.widgets?.win?.openEvent) {
    window.widgets.win.openEvent({ defaultDate });
    return;
  }
  editingEventId = null;
  $('#evModalTitle').textContent = t('cal.addEventTitle');
  $('#evDeleteBtn').hidden = true;
  $('#evTestStatus').hidden = true;

  const todayStr = defaultDate || new Date().toISOString().slice(0, 10);
  $('#evDate').value = todayStr;
  $('#evTime').value = '09:00';
  $('#evTitle').value = '';
  $('#evNotes').value = '';
  $('#evRecurring').value = 'none';

  currentSelectedCat = 'birthday';
  buildCategoriesPills();

  $('#evWaEnabled').checked = true;
  $('#evWaBody').hidden = false;
  $('#evWaTiming').value = cfg.waDefaultTiming || 'morning_of';
  $('#evWaRecipient').value = '';
  $('#evWaMessage').value = cfg.waTemplate || CATEGORIES.birthday.defaultTemplate;

  $('#eventModal').hidden = false;
  $('#evTitle').focus();
}

function openEditEventModal(id) {
  if (window.widgets?.win?.openEvent) {
    window.widgets.win.openEvent({ id });
    return;
  }
  const ev = events.find((e) => e.id === id);
  if (!ev) return;

  editingEventId = id;
  $('#evModalTitle').textContent = t('cal.editEvent');
  $('#evDeleteBtn').hidden = false;
  $('#evTestStatus').hidden = true;

  $('#evTitle').value = ev.title || '';
  $('#evDate').value = ev.date || '';
  $('#evTime').value = ev.time || '09:00';
  $('#evRecurring').value = ev.recurring || 'none';
  $('#evNotes').value = ev.notes || '';

  currentSelectedCat = ev.category || 'general';
  buildCategoriesPills();

  const wa = ev.whatsapp || {};
  $('#evWaEnabled').checked = wa.enabled !== false;
  $('#evWaBody').hidden = wa.enabled === false;
  $('#evWaTiming').value = wa.sendTiming || cfg.waDefaultTiming || 'morning_of';
  $('#evWaRecipient').value = wa.recipient || '';
  const cat = CATEGORIES[currentSelectedCat] || CATEGORIES.general;
  $('#evWaMessage').value = wa.customMessage || cat.defaultTemplate;

  $('#eventModal').hidden = false;
}

function closeEventModal() {
  $('#eventModal').hidden = true;
  editingEventId = null;
}

function getFormData() {
  const title = $('#evTitle').value.trim();
  const date = $('#evDate').value;
  const time = $('#evTime').value;
  const recurring = $('#evRecurring').value;
  const notes = $('#evNotes').value.trim();
  const waEnabled = $('#evWaEnabled').checked;
  const sendTiming = $('#evWaTiming').value;
  const recipient = $('#evWaRecipient').value.trim();
  const customMessage = $('#evWaMessage').value.trim();

  return {
    id: editingEventId || undefined,
    title,
    date,
    time,
    category: currentSelectedCat,
    recurring,
    notes,
    whatsapp: {
      enabled: waEnabled,
      sendTiming,
      recipient,
      customMessage,
    },
  };
}

async function saveCurrentEvent() {
  const data = getFormData();
  if (!data.title) {
    alert(t('cal.requireTitleAlert'));
    $('#evTitle').focus();
    return;
  }
  if (!data.date) {
    alert(t('cal.requireDateAlert'));
    $('#evDate').focus();
    return;
  }

  await window.widgets.calendar.saveEvent(data);
  events = await window.widgets.calendar.getEvents();
  renderCurrentView();
  closeEventModal();
  if (!$('#eventsDrawer').hidden) {
    renderEventsDrawerList();
  }
}

/* ---------- day rollover ---------- */

function watchDay() {
  clearInterval(dayTimer);
  todayKey = keyOf(new Date());
  dayTimer = setInterval(() => {
    if (window.UI?.isDormant?.()) return;
    const k = keyOf(new Date());
    if (k === todayKey) return;
    const wasOnCurrent = view.y === Number(todayKey.split('-')[0]) && view.m === Number(todayKey.split('-')[1]);
    todayKey = k;
    if (wasOnCurrent) { const n = new Date(); view = { y: n.getFullYear(), m: n.getMonth() }; }
    renderCurrentView();
  }, 60_000);
}

/* ---------- wiring & configuration ---------- */

function applyConfig(s) {
  showYearHero = Boolean(s.calendar?.showYearHero);
  cfg = {
    weekStart: 6,
    hijri: true,
    hijriAdjust: 0,
    viewMode: 'month',
    showDayActions: true,
    showRedDot: true,
    showTasksOnCalendar: true,
    showHabitsOnCalendar: false,
    highlightWeekend: true,
    visualStyle: 'modern',
    showYearHero: false,
    ...(s.calendar || {}),
  };
  hijriFmt.clear();

  // Apply visual styling dataset attributes
  document.body.dataset.calStyle = cfg.visualStyle || 'modern';
  document.body.dataset.calHighlightWeekend = String(cfg.highlightWeekend !== false);
  document.documentElement.dataset.popupTheme = cfg.popupTheme || 'dark';
  document.documentElement.dataset.popupRadius = cfg.popupRadius || 'rounded';
  document.documentElement.dataset.popupGlow = cfg.popupGlow || 'radiant';

  if (cfg.viewMode && cfg.viewMode !== currentViewMode) {
    switchViewMode(cfg.viewMode, { persist: false });
  } else {
    renderCurrentView();
  }
}

boot(async (s) => {
  const now = new Date();
  view = { y: now.getFullYear(), m: now.getMonth() };
  weekAnchorDate = new Date();

  // Load initial data
  try {
    events = (await window.widgets.calendar?.getEvents?.()) || [];
  } catch {
    events = [];
  }

  try {
    dayNotes = (await window.widgets.calendar?.getDayNotes?.()) || {};
  } catch {
    dayNotes = {};
  }

  try {
    todosList = (await window.widgets.todos?.get?.()) || [];
  } catch {
    todosList = [];
  }

  try {
    habitsState = (await window.widgets.habits?.getState?.()) || { habits: [], logs: {} };
  } catch {
    habitsState = { habits: [], logs: {} };
  }

  // Icons
  $('#settingsBtn').append(icon('gear'));
  $('#closeBtn').append(icon('close'));
  $('#eventsBtn').append(icon('calendar'));

  // Nav chevrons: prev is always < (left), next is always > (right)
  $('#prev')?.replaceChildren(icon('chevronLeft'));
  $('#next')?.replaceChildren(icon('chevron'));
  $('#weekPrev')?.replaceChildren(icon('chevronLeft'));
  $('#weekNext')?.replaceChildren(icon('chevron'));

  // Header buttons
  $('#settingsBtn').addEventListener('click', () => window.widgets.win.openSettings('calendar'));
  $('#closeBtn').addEventListener('click', () => closeWindow());
  $('#prev').addEventListener('click', () => go(-1));
  $('#next').addEventListener('click', () => go(1));
  $('#mTitle').addEventListener('click', goToday);

  // Week navigation
  if ($('#weekNext')) $('#weekNext').addEventListener('click', () => go(1));
  if ($('#weekPrev')) $('#weekPrev').addEventListener('click', () => go(-1));

  // Agenda add
  if ($('#agendaAddBtn')) $('#agendaAddBtn').addEventListener('click', () => openAddEventModal());

  // View Switcher Buttons
  $('#btnViewMonth')?.addEventListener('click', () => switchViewMode('month'));
  $('#btnViewSplit')?.addEventListener('click', () => switchViewMode('split'));
  $('#btnViewWeek')?.addEventListener('click', () => switchViewMode('week'));
  $('#btnViewBento')?.addEventListener('click', () => switchViewMode('bento'));
  $('#btnViewYear')?.addEventListener('click', () => switchViewMode('year'));
  $('#btnViewAgenda')?.addEventListener('click', () => switchViewMode('agenda'));

  // Year Progress Hero toggle
  $('#toggleHeroBtn')?.addEventListener('click', async () => {
    showYearHero = !showYearHero;
    renderYearProgressHero();
    if (window.widgets?.settings?.set) {
      try {
        await window.widgets.settings.set({ calendar: { ...(cfg || {}), showYearHero } });
      } catch {}
    }
  });

  // Split View Refresh
  $('#splitRefreshBtn')?.addEventListener('click', async () => {
    try {
      todosList = (await window.widgets.todos?.get?.()) || [];
    } catch {}
    renderSplitView();
  });

  // Bento Quick Add
  document.querySelectorAll('.bento-add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openAddEventModal();
    });
  });

  // Day Micro-Actions Popup buttons
  $('#dapCloseBtn').addEventListener('click', hideDayActionsPopup);

  // Day Note Modal buttons
  $('#dayNoteCloseBtn').addEventListener('click', closeDayNoteModal);
  $('#dayNoteCancelBtn').addEventListener('click', closeDayNoteModal);
  $('#dayNoteSaveBtn').addEventListener('click', saveActiveDayNote);
  $('#dayNoteDeleteBtn').addEventListener('click', deleteActiveDayNote);

  // Events Drawer
  $('#eventsBtn').addEventListener('click', () => {
    const drawer = $('#eventsDrawer');
    if (drawer.hidden) openEventsDrawer();
    else closeEventsDrawer();
  });
  $('#closeEventsDrawerBtn').addEventListener('click', closeEventsDrawer);
  $('#addEventQuickBtn').addEventListener('click', () => openAddEventModal());

  // Event Add / Edit Modal
  $('#evModalClose').addEventListener('click', closeEventModal);
  $('#evCancelBtn').addEventListener('click', closeEventModal);
  $('#evSaveBtn').addEventListener('click', saveCurrentEvent);

  $('#evDeleteBtn').addEventListener('click', async () => {
    if (editingEventId && confirm(t('cal.confirmDeleteEvent'))) {
      await window.widgets.calendar.removeEvent(editingEventId);
      events = await window.widgets.calendar.getEvents();
      renderCurrentView();
      closeEventModal();
      if (!$('#eventsDrawer').hidden) renderEventsDrawerList();
    }
  });

  $('#evWaEnabled').addEventListener('change', (e) => {
    $('#evWaBody').hidden = !e.target.checked;
  });

  $('#evTestWaBtn').addEventListener('click', async () => {
    const statusEl = $('#evTestStatus');
    statusEl.hidden = false;
    statusEl.className = 'ev-test-status';
    statusEl.textContent = t('cal.sendingWa');

    try {
      const currentEv = getFormData();
      const res = await window.widgets.calendar.testEventWhatsApp({ event: currentEv });
      if (res && res.ok) {
        statusEl.className = 'ev-test-status ok';
        statusEl.textContent = t('cal.sendWaSuccess');
      } else {
        statusEl.className = 'ev-test-status err';
        statusEl.textContent = t('cal.sendWaFail', { error: res?.error || 'WhatsApp server error' });
      }
    } catch (err) {
      statusEl.className = 'ev-test-status err';
      statusEl.textContent = t('cal.sendWaNetError', { error: err.message });
    }
  });

  // Grid interaction: click cell
  const grid = $('#grid');
  grid.addEventListener('pointerover', (e) => {
    const cell = e.target.closest('.day');
    if (cell) showTip(cell); else hideTip();
  });
  grid.addEventListener('pointerleave', hideTip);
  document.body.addEventListener('pointerdown', (e) => {
    hideTip();
    if (!e.target.closest('#dayActionsPopup') && !e.target.closest('.cell.day') && !e.target.closest('.week-col-head')) {
      hideDayActionsPopup();
    }
  });

  // Clicking on any day cell shows the Day Micro-Actions Popup (+) and (📝)!
  grid.addEventListener('click', (e) => {
    const cell = e.target.closest('.day');
    if (!cell) return;
    const dNum = Number(cell.dataset.d);
    const dateStr = `${view.y}-${pad2(view.m + 1)}-${pad2(dNum)}`;

    if (cfg.showDayActions !== false) {
      showDayActionsPopup(dateStr, cell);
    } else {
      const dayEvs = getEventsForDate(view.y, view.m, dNum);
      if (dayEvs.length > 0) openEventsDrawer(dateStr);
      else openAddEventModal(dateStr);
    }
  });

  // Mouse wheel scroll to navigate months
  let wheelLock = 0;
  $('#cal').addEventListener('wheel', (e) => {
    if (currentViewMode !== 'month') return;
    e.preventDefault();
    const tNow = Date.now();
    if (tNow - wheelLock < 260) return;
    wheelLock = tNow;
    hideTip();
    hideDayActionsPopup();
    go(e.deltaY > 0 ? 1 : -1);
  }, { passive: false });

  applyConfig(s);
  watchDay();
  if (typeof requestAnimationFrame !== 'undefined') requestAnimationFrame(updateCalViewIndicator);

  // Listeners for live data sync
  window.widgets.calendar?.onEventsChanged?.((newEvents) => {
    events = newEvents || [];
    renderCurrentView();
    if (!$('#eventsDrawer').hidden) renderEventsDrawerList();
  });

  window.widgets.calendar?.onDayNotesChanged?.((newNotes) => {
    dayNotes = newNotes || {};
    renderCurrentView();
  });

  window.widgets.todos?.onChange?.((newTodos) => {
    todosList = newTodos || [];
    renderCurrentView();
  });

  window.widgets.habits?.onChange?.((nextHabits) => {
    if (Array.isArray(nextHabits)) {
      habitsState.habits = nextHabits;
    } else if (nextHabits && Array.isArray(nextHabits.habits)) {
      habitsState = nextHabits;
    }
    renderCurrentView();
  });

  window.widgets.habits?.onLogChange?.((payload) => {
    if (payload && payload.date && payload.day) {
      if (!habitsState.logs) habitsState.logs = {};
      habitsState.logs[payload.date] = payload.day;
      renderCurrentView();
    } else if (payload && payload.all) {
      window.widgets.habits?.getState?.().then((st) => {
        if (st) habitsState = st;
        renderCurrentView();
      });
    } else if (payload && typeof payload === 'object' && !payload.date) {
      if (habitsState) habitsState.logs = payload;
      renderCurrentView();
    }
  });

  window.UI?.onDormancy?.((isDormant) => {
    if (!isDormant) {
      const k = keyOf(new Date());
      if (k !== todayKey) {
        todayKey = k;
        renderCurrentView();
      }
    }
  });

  window.widgets.settings?.onChange?.((next) => applyConfig(next));
  window.widgets.onWake?.(() => { todayKey = ''; renderCurrentView(); watchDay(); });
  window.addEventListener('resize', updateCalViewIndicator);
  window.addEventListener('beforeunload', () => clearInterval(dayTimer));
});
