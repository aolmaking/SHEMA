'use strict';

/**
 * Habits Desktop Tile Widget Client Script
 * Ultra-lightweight, snappy, 100% bilingual, zero fake data, full gestures
 */

(function () {
  const { $, $$, boot, el, strings, t, lang, digits, closeWindow } = window.UI;

  strings({
    ar: {
      'habits.title': 'العادات والعافية',
      'habits.openDashboard': 'لوحة التحليلات والبوليت جورنال',
      'habits.addHabit': 'إضافة عادة جديدة',
      'habits.routineAll': 'الكل',
      'habits.routineMorning': '☀️ الصباح',
      'habits.routineAfternoon': '🌤️ بعد الظهر',
      'habits.routineEvening': '🌙 المساء',
      'habits.routineAnytime': '⚡ أي وقت',
      'habits.recentDays': 'آخر 7 أيام',
      'habits.markDone': 'اكتملت العادة اليوم',
      'habits.markSkip': 'تخطي اليوم (إجازة/عذر لا يكسر السلسلة)',
      'habits.markReset': 'إعادة تعيين اليوم',
      'habits.editHabit': 'تعديل العادة',
      'habits.deleteHabit': 'حذف العادة',
      'habits.viewInDashboard': 'عرض في لوحة التحليلات',
      'habits.emptyTitle': 'لا توجد عادات مسجلة',
      'habits.emptyDesc': 'ابدأ بإضافة أول عادة لك لتبني روتينك اليومي بكل سهولة',
      'habits.emptyFilter': 'لا توجد عادات في هذا التوقيت',
      'habits.addFirstHabit': '+ إضافة أول عادة',
      'habits.completedToday': '{done} من {total} عادات مكتملة اليوم',
      'habits.noHabitsToday': 'لا توجد عادات مجدولة لليوم',
      'habits.streak': '{n} يوم',
      'habits.daysStreak': 'أيام استمرار',
      'habits.streakSingle': 'يوم استمرار',
      'habits.skipped': 'إجازة / معفى',
      'habits.legendDone': 'مكتمل',
      'habits.legendPartial': 'جزئي',
      'habits.legendSkip': 'تخطي',
      'habits.legendLocked': 'أيام قادمة',
      'habits.dwiTitle': 'مؤشر العافية اليومي المركب (DWI)',
      'habits.logSleep': 'تسجيل النوم',
      'habits.sleepHoursLogged': '{h} س نوم',
      'habits.sleepPillTitle': 'ساعات نوم الليلة السابقة',
      'habits.moodGreat': 'رائع ومبتهج',
      'habits.moodGood': 'جيد ومستقر',
      'habits.moodMeh': 'متوسط / عادي',
      'habits.moodTense': 'متوتر / مجهد',
      'habits.moodDown': 'سيئ / متعب',
      'habits.addHabitTitle': '✨ إضافة عادة جديدة',
      'habits.habitName': 'اسم العادة',
      'habits.habitNamePh': 'مثال: شرب الماء، صلاة الفجر، قراءة...',
      'habits.trackingType': 'طريقة التتبع والمدخلات',
      'habits.typeBoolean': '✓ صح/خطأ',
      'habits.typeNumber': '🔢 عددي بهدف',
      'habits.typePercentage': '% نسبة مئوية',
      'habits.typeDuration': '⏱️ مدة زمنية',
      'habits.typeRating': '⭐ تقييم 1-5',
      'habits.targetGoal': 'الهدف اليومي',
      'habits.unitLabel': 'الوحدة',
      'habits.unitPh': 'كوب، صفحة، دقيقة...',
      'habits.routineLabel': 'فترة الروتين',
      'habits.iconAndColor': 'الأيقونة واللون المميز',
      'habits.cancel': 'إلغاء',
      'habits.saveHabitBtn': 'حفظ العادة',
      'habits.logSleepTitle': '🛌 كم ساعة نمت البارحة؟',
      'habits.hoursUnit': 'ساعة',
      'habits.saveRecord': 'حفظ التوثيق',
      'habits.deleteConfirm': 'هل أنت متأكد من حذف هذه العادة نهائياً؟',
      'habits.dailyProgress': 'التقدم اليومي',
      'habits.cycleSpark': 'حكمة أخرى',
      'habits.streakPreserved': 'السلسلة محفوظة كإجازة معتمدة 🛡️',
      'habits.mythicHabit': 'عادة راسخة! تجاوزت 21 يوماً متتالياً 💎',
      'habits.allCompleted': 'رائع! أكملت جميع عادات اليوم بنجاح 🌟',
      'habits.sendWaTitle': 'إرسال تقرير اليوم إلى واتساب',
      'habits.startPomo': 'بدء جلسة تركيز بومودورو لهذه العادة 🍅',
      'habits.waSentSuccess': 'تم إرسال التقرير اليومي إلى واتساب بنجاح! 🚀',
      'habits.waSetupNeeded': 'يرجى ربط واتساب أو تحديد الرقم في الإعدادات أولاً',
      'habits.gamificationTooltip': 'المستوى، الخبرة والعملات الذهبية (نظام RPG)',
      'habits.directionLabel': 'مسار العادة',
      'habits.dirPositive': '🚀 عادة إيجابية لبنائها',
      'habits.dirNegative': '🛑 كاسر عادة للإقلاع عنها',
      'habits.difficultyLabel': 'مستوى الصعوبة',
      'habits.diffTrivial': 'بسيطة (+10 XP)',
      'habits.diffEasy': 'سهلة (+20 XP)',
      'habits.diffMedium': 'متوسطة (+40 XP)',
      'habits.diffHard': 'صعبة (+80 XP)',
      'habits.badHabitTag': 'كاسر عادة',
      'habits.resistedToday': 'قاومت اليوم 🛡️',
      'habits.resistedSuccess': '✓ صامد ومقاوم',
      'habits.viewControlsTitle': 'تخصيص الواجهة والتحكم بالعرض',
      'habits.popoverTitle': '🎛️ تخصيص الواجهة والتحكم الكامل',
      'habits.statusFilter': 'تصفية العرض',
      'habits.fAll': 'الكل',
      'habits.fPending': 'المتبقي ⏰',
      'habits.fDone': 'المنجز ✓',
      'habits.fBreakers': 'كواسر العادات 🛑',
      'habits.densityLabel': 'شكل وكثافة البطاقات',
      'habits.densityComfortable': 'مريح',
      'habits.densityCompact': 'مدمج',
      'habits.densityMinimal': 'موجز',
      'habits.sortLabel': 'ترتيب العادات',
      'habits.sortManual': 'الترتيب الافتراضي / اليدوي',
      'habits.sortPriority': 'حسب أولوية To-Do (الأعلى أولاً)',
      'habits.sortStreak': 'أطول سلسلة استمرار 🔥',
      'habits.sortStrength': 'أعلى قوة واستقرار للعادة ⚡',
      'habits.sortTitle': 'أبجدياً (أ - ي)',
      'habits.componentsToggle': 'عناصر الواجهة المرئية',
      'habits.tabPresets': '⚡ قوالب سريعة',
      'habits.tabCustom': '✏️ عادة مخصصة',
      'habits.presetsIntro': 'اختر قالباً جاهزاً ومعداً مسبقاً بأهدافه وأيقونته وترتيبه لإضافته فوراً بضغطة واحدة:',
      'habits.enablePomodoroLabel': '⏱️ تفعيل مؤقت بومودورو للتركيز لهذه العادة',
      'habits.syncToTodoLabel': '📋 إضافة مهمة تلقائية في قائمة المهام (To-Do List)',
      'habits.todoPriorityLabel': 'أولوية المهمة في To-Do:',
      'habits.prioNormal': 'عادية 🟢',
      'habits.prioImportant': 'مهمة ⚡ 🟠',
      'habits.prioUrgent': 'عاجلة 🚨 🔴',
      'habits.presetAdded': 'تمت إضافة عادة "{title}" بنجاح! 🎉',
      'habits.strength': 'قوة: {val}%',
      'common.settings': 'الإعدادات',
      'common.hide': 'إخفاء الواجهة',
      'habits.themeLabel': 'نمط ومظهر الواجهة (Theme)',
      'habits.themeMatch': '✨ مطابق لمظهر البرنامج العام (Match App Theme)',
      'habits.prevView': 'العرض السابق (سهم يسار)',
      'habits.nextView': 'العرض التالي (سهم يمين)',
      'habits.viewChecklist': 'قائمة اليوم',
      'habits.viewMiniBujo': 'مصفوفة الشهر',
      'habits.viewMiniSleep': 'النوم والمزاج',
      'habits.today': 'اليوم',
      'habits.sleepDurationLabel': '🛌 ساعات النوم',
      'habits.sleepQualityLabel': '⭐ جودة وعمق النوم',
      'habits.moodTitle': '😊 الحالة المزاجية',
      'habits.sleepTrendLabel': '📊 استقرار النوم آخر 7 أيام (الهدف: 8 ساعات)',
      'habits.triggerCueLabel': 'المحفز السلوكي (Trigger / Cue)',
      'habits.triggerCuePh': 'مثال: بعد صلاة الفجر، بعد فنجان القهوة...',
      'habits.reminderTimeLabel': 'وقت التذكير والموعد',
      'habits.notesLabel': 'الدافع الشخصي والغاية (لماذا أريد بناء هذه العادة؟)',
      'habits.notesPh': 'أثر هذه العادة على صحتي، تركيزي، وإنجازي...',
      'habits.freqScheduleLabel': 'الجدول والتكرار الأسبوعي',
      'habits.freqDaily': 'يومياً (7 أيام)',
      'habits.freqSpecific': 'أيام محددة',
      'habits.freqWeekly': 'هدف أسبوعي',
      'habits.syncToCalendarLabel': '📅 ربط بالتقويم وإنشاء حدث يومي تلقائي',
      'habits.resetFilter': 'عرض كل العادات',
      'habits.emptyFilterDesc': 'لا توجد عادات تطابق التصفية الحالية. اضغط أدناه لعرض كل عاداتك.',
      'habits.showStreak': '🔥 عداد السلسلة',
      'habits.showStrength': '⚡ قوة العادة %',
      'habits.showUrgency': '⚠️ شارة الاستحقاق والتأخير %',
      'habits.showPomodoro': '⏱️ زر بومودورو السريع',
      'habits.showProgressBar': '📊 شريط التقدم اليومي',
      'habits.showMiniStrip': '📅 شريط الـ 7 أيام',
      'habits.showRoutines': '☀️ فترات الروتين',
      'habits.showFooterCheckin': '🛌 تسجيل المزاج والنوم',
      'habits.showMindsetSpark': '✨ حكمة اليوم التحفيزية',
      'habits.showGamification': '🪙 شارة البطل والعملات',
      'habits.showSoundEffects': '🔊 المؤثرات الصوتية',
      'habits.themeMatchShort': '✨ متطابق',
      'habits.themeDotgridShort': '🎯 منقط',
      'habits.themeGraphpaperShort': '📐 مربعات',
      'habits.themeSketchShort': '✏️ كروكي',
      'habits.themeNotebookShort': '📝 كراسة',
      'habits.themeDarkShort': '🌙 داكن',
      'habits.themeMatchTitle': 'مطابق لمظهر البرنامج',
      'habits.themeDotgridTitle': 'كراسة منقطة',
      'habits.themeGraphpaperTitle': 'ورق مربعات',
      'habits.themeSketchTitle': 'كروكي رصاص',
      'habits.themeNotebookTitle': 'كراسة مسطرة',
      'habits.themeDarkTitle': 'داكن عصري',
      'habits.returnToday': 'العودة لليوم ↺',
      'habits.historyLabel': 'عرض سجل يوم سابق',
      'habits.step7d': '٧ أيام',
      'habits.step14d': '١٤ يوم',
      'habits.step21d': 'تثبيت ٢١',
      'habits.step30d': 'شهر ٣٠',
      'habits.unitHours': 'ساعة',
      'habits.daysPerWeek': 'كم يوماً في الأسبوع؟',
      'habits.targetPomoCount': 'عدد الجلسات المستهدفة:',
      'habits.calTime': 'توقيت الحدث في التقويم:',
      'habits.estDuration': 'المدة التقديرية:',
      'habits.showAtlasBar': '🌌 شريط أطلس وميرو المصغر',
      'habits.atlasQuickMicro': 'خطوة صغرى ⚡',
      'habits.microStepDone': 'تمت الخطوة الصغرى بنجاح! ⚡',
      'habits.microStepTooltip': 'إنجاز خطوة صغرى (قاعدة الدقيقتين - يحفظ النور بدون إرهاق)',
      'habits.microStepBadge': 'خطوة صغرى 🌱',
      'habits.noPendingHabit': 'لا توجد عادات معلقة لإنجاز خطوتها الصغرى اليوم!',
    },
    en: {
      'habits.title': 'Habits & Wellness',
      'habits.openDashboard': 'Analytics & Bullet Journal',
      'habits.addHabit': 'New Habit',
      'habits.routineAll': 'All',
      'habits.routineMorning': '☀️ Morning',
      'habits.routineAfternoon': '🌤️ Afternoon',
      'habits.routineEvening': '🌙 Evening',
      'habits.routineAnytime': '⚡ Anytime',
      'habits.recentDays': 'Last 7 Days',
      'habits.markDone': 'Mark as Done Today',
      'habits.markSkip': 'Skip Today (Exempt - Preserves Streak)',
      'habits.markReset': 'Reset Today',
      'habits.editHabit': 'Edit Habit',
      'habits.deleteHabit': 'Delete Habit',
      'habits.viewInDashboard': 'View in Dashboard',
      'habits.emptyTitle': 'No habits registered yet',
      'habits.emptyDesc': 'Add your first habit to easily build your daily bullet journal routine',
      'habits.emptyFilter': 'No habits in this routine',
      'habits.addFirstHabit': '+ Add First Habit',
      'habits.completedToday': '{done} of {total} completed today',
      'habits.noHabitsToday': 'No habits scheduled for today',
      'habits.streak': '{n} d',
      'habits.daysStreak': 'Days Streak',
      'habits.streakSingle': 'Day Streak',
      'habits.skipped': 'Skipped / Off',
      'habits.legendDone': 'Done',
      'habits.legendPartial': 'Partial',
      'habits.legendSkip': 'Skip',
      'habits.legendLocked': 'Future (Locked)',
      'habits.dwiTitle': 'Daily Wellness Index (DWI)',
      'habits.logSleep': 'Log Sleep',
      'habits.sleepHoursLogged': '{h} hrs sleep',
      'habits.sleepPillTitle': 'Last Night Sleep Duration',
      'habits.moodGreat': 'Great & Joyful',
      'habits.moodGood': 'Good & Calm',
      'habits.moodMeh': 'Neutral / Meh',
      'habits.moodTense': 'Stressed / Tense',
      'habits.moodDown': 'Exhausted / Low',
      'habits.addHabitTitle': '✨ Add New Habit',
      'habits.habitName': 'Habit Name',
      'habits.habitNamePh': 'e.g. Water intake, Reading, Workout...',
      'habits.trackingType': 'Tracking Method & Input Type',
      'habits.typeBoolean': '✓ Yes/No',
      'habits.typeNumber': '🔢 Numeric Goal',
      'habits.typePercentage': '% Percentage',
      'habits.typeDuration': '⏱️ Duration',
      'habits.typeRating': '⭐ Rating 1-5',
      'habits.targetGoal': 'Daily Target',
      'habits.unitLabel': 'Unit',
      'habits.unitPh': 'cups, pages, min...',
      'habits.routineLabel': 'Routine Period',
      'habits.iconAndColor': 'Icon & Accent Color',
      'habits.cancel': 'Cancel',
      'habits.saveHabitBtn': 'Save Habit',
      'habits.logSleepTitle': '🛌 How many hours did you sleep?',
      'habits.hoursUnit': 'hours',
      'habits.saveRecord': 'Save Record',
      'habits.deleteConfirm': 'Are you sure you want to delete this habit permanently?',
      'habits.dailyProgress': 'Daily Progress',
      'habits.cycleSpark': 'Next Insight',
      'habits.streakPreserved': 'Streak preserved (Approved rest) 🛡️',
      'habits.mythicHabit': 'Habit formed! 21+ consecutive days 💎',
      'habits.allCompleted': 'Brilliant! All habits completed for today 🌟',
      'habits.sendWaTitle': 'Send Today\'s Report to WhatsApp',
      'habits.startPomo': 'Start Pomodoro Focus Session 🍅',
      'habits.waSentSuccess': 'Daily briefing sent to WhatsApp successfully! 🚀',
      'habits.waSetupNeeded': 'Please connect WhatsApp or set the recipient in Settings first',
      'habits.gamificationTooltip': 'Level, XP, and Coins (RPG Gamification)',
      'habits.directionLabel': 'Habit Direction',
      'habits.dirPositive': '🚀 Positive Habit (Build)',
      'habits.dirNegative': '🛑 Bad Habit Breaker (Quit)',
      'habits.difficultyLabel': 'Difficulty Level',
      'habits.diffTrivial': 'Trivial (+10 XP)',
      'habits.diffEasy': 'Easy (+20 XP)',
      'habits.diffMedium': 'Medium (+40 XP)',
      'habits.diffHard': 'Hard (+80 XP)',
      'habits.badHabitTag': 'Breaker',
      'habits.resistedToday': 'Resisted Today 🛡️',
      'habits.resistedSuccess': '✓ Resisted & Resilient',
      'habits.viewControlsTitle': 'Customize UI & View Controls',
      'habits.popoverTitle': '🎛️ Ultimate View & UI Controls',
      'habits.statusFilter': 'Status Filter',
      'habits.fAll': 'All',
      'habits.fPending': 'Pending ⏰',
      'habits.fDone': 'Done ✓',
      'habits.fBreakers': 'Breakers 🛑',
      'habits.densityLabel': 'Card Layout & Density',
      'habits.densityComfortable': 'Comfortable',
      'habits.densityCompact': 'Compact',
      'habits.densityMinimal': 'Minimal',
      'habits.sortLabel': 'Habit Sorting',
      'habits.sortManual': 'Default / Manual',
      'habits.sortPriority': 'To-Do Priority (Highest First)',
      'habits.sortStreak': 'Longest Streak 🔥',
      'habits.sortStrength': 'Highest Habit Strength ⚡',
      'habits.sortTitle': 'Alphabetical (A - Z)',
      'habits.componentsToggle': 'Visible UI Components',
      'habits.tabPresets': '⚡ 1-Click Presets',
      'habits.tabCustom': '✏️ Custom Builder',
      'habits.presetsIntro': 'Pick a pre-configured template to add it immediately with one click:',
      'habits.enablePomodoroLabel': '⏱️ Enable Pomodoro focus session for this habit',
      'habits.syncToTodoLabel': '📋 Sync as automated task in To-Do List',
      'habits.todoPriorityLabel': 'Task priority in To-Do:',
      'habits.prioNormal': 'Normal 🟢',
      'habits.prioImportant': 'Important ⚡ 🟠',
      'habits.prioUrgent': 'Urgent 🚨 🔴',
      'habits.presetAdded': 'Added habit "{title}" successfully! 🎉',
      'habits.strength': 'Strength: {val}%',
      'common.settings': 'Settings',
      'common.hide': 'Hide Widget',
      'habits.themeLabel': 'Theme & Appearance',
      'habits.themeMatch': '✨ Match App Theme (Follow Global)',
      'habits.prevView': 'Previous View (Left arrow)',
      'habits.nextView': 'Next View (Right arrow)',
      'habits.viewChecklist': 'Today Checklist',
      'habits.viewMiniBujo': 'Monthly Matrix',
      'habits.viewMiniSleep': 'Sleep & Mood',
      'habits.today': 'Today',
      'habits.sleepDurationLabel': '🛌 Sleep Duration',
      'habits.sleepQualityLabel': '⭐ Sleep Quality & Depth',
      'habits.moodTitle': '😊 Mood State',
      'habits.sleepTrendLabel': '📊 7-Day Sleep Trend (Target: 8h)',
      'habits.triggerCueLabel': 'Behavioral Cue / Trigger',
      'habits.triggerCuePh': 'e.g. After Fajr prayer, after morning coffee...',
      'habits.reminderTimeLabel': 'Reminder Time & Schedule',
      'habits.notesLabel': 'Personal Motivation & Why',
      'habits.notesPh': 'Impact on focus, health, and growth...',
      'habits.freqScheduleLabel': 'Weekly Schedule & Frequency',
      'habits.freqDaily': 'Daily (7 Days)',
      'habits.freqSpecific': 'Specific Days',
      'habits.freqWeekly': 'Weekly Target',
      'habits.syncToCalendarLabel': '📅 Sync to Calendar as Daily Event',
      'habits.resetFilter': 'Show All Habits',
      'habits.emptyFilterDesc': 'No habits match the active filter. Click below to view all habits.',
      'habits.showStreak': '🔥 Streak Counter',
      'habits.showStrength': '⚡ Habit Strength %',
      'habits.showUrgency': '⚠️ Urgency & Overdue Badges %',
      'habits.showPomodoro': '⏱️ Quick Pomodoro Button',
      'habits.showProgressBar': '📊 Daily Progress Bar',
      'habits.showMiniStrip': '📅 7-Day Mini Strip',
      'habits.showRoutines': '☀️ Routine Slots',
      'habits.showFooterCheckin': '🛌 Mood & Sleep Log',
      'habits.showMindsetSpark': '✨ Daily Motivation Spark',
      'habits.showGamification': '🪙 Hero Badge & Coins',
      'habits.showSoundEffects': '🔊 Sound Effects',
      'habits.themeMatchShort': '✨ Match',
      'habits.themeDotgridShort': '🎯 Dot Grid',
      'habits.themeGraphpaperShort': '📐 Grid',
      'habits.themeSketchShort': '✏️ Sketch',
      'habits.themeNotebookShort': '📝 Lined',
      'habits.themeDarkShort': '🌙 Dark',
      'habits.themeMatchTitle': 'Match App Theme',
      'habits.themeDotgridTitle': 'Dot Grid Journal',
      'habits.themeGraphpaperTitle': 'Graph Paper',
      'habits.themeSketchTitle': 'Pencil Sketch',
      'habits.themeNotebookTitle': 'Lined Notebook',
      'habits.themeDarkTitle': 'Modern Dark',
      'habits.returnToday': 'Back to today ↺',
      'habits.historyLabel': 'Viewing past day history',
      'habits.step7d': '7 Days',
      'habits.step14d': '14 Days',
      'habits.step21d': '21 Lock-in',
      'habits.step30d': '30 Month',
      'habits.unitHours': 'hours',
      'habits.daysPerWeek': 'How many days per week?',
      'habits.targetPomoCount': 'Target Focus Sessions:',
      'habits.calTime': 'Calendar Event Time:',
      'habits.estDuration': 'Estimated Duration:',
      'habits.showAtlasBar': '🌌 Mini Atlas & Miro Bar',
      'habits.atlasQuickMicro': 'Micro-Step ⚡',
      'habits.microStepDone': 'Micro-step recorded successfully! ⚡',
      'habits.microStepTooltip': 'Complete as Micro-Step (2-Min Rule - keeps momentum)',
      'habits.microStepBadge': 'Micro-step 🌱',
      'habits.noPendingHabit': 'No pending habits for a micro-step today!',
    },
  });

  function formatLocalDate(d = new Date()) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function todayStr(d = new Date()) {
    return formatLocalDate(d);
  }

  function stepMonth(monthStr, delta) {
    const [y, m] = (monthStr || todayStr().slice(0, 7)).split('-').map(Number);
    let newM = m + delta;
    let newY = y;
    while (newM > 12) {
      newM -= 12;
      newY += 1;
    }
    while (newM < 1) {
      newM += 12;
      newY -= 1;
    }
    return `${newY}-${String(newM).padStart(2, '0')}`;
  }

  function stepDay(dateStr, delta) {
    const [y, m, d] = (dateStr || todayStr()).split('-').map(Number);
    const dt = new Date(y, m - 1, d + delta, 12, 0, 0);
    return formatLocalDate(dt);
  }

  let state = {
    habits: [],
    logs: {},
    settings: {},
    gamification: { xp: 0, level: 1, coins: 0 },
    activeRoutine: 'all',
    viewStatusFilter: 'all',
    cardDensity: 'compact',
    sortOrder: 'manual',
    currentView: 'checklist', // 'checklist' | 'mini-bujo' | 'mini-sleep'
    bujoMonth: todayStr().slice(0, 7),
    sleepSelectedDate: todayStr(),
    atlas: null,
  };

  let activeMenuHabitId = null;
  let qaSelectedType = 'boolean';
  let qaSelectedEmoji = '⭐';
  let qaSelectedColor = '#3b82f6';
  let qaTodoPriority = 1;
  let qsSelectedHours = 7.5;
  let qsSelectedQuality = 4;
  let routineUserOverridden = false;
  let currentSparkIndex = Math.floor(Math.random() * 8);
  let habitToggleLock = new Map();

  function getHabitIconSvg(iconKey, title = '', color = '#3b82f6') {
    const raw = String(iconKey || '').toLowerCase();
    const t = String(title || '').toLowerCase();

    // 1. Quran / Dhikr / Prayer / Spirit
    if (raw.includes('📖') || raw.includes('quran') || raw.includes('مصحف') || raw.includes('قرآن') || t.includes('قرآن') || t.includes('quran') || t.includes('ورد') || t.includes('تلاوة')) {
      return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="13" y2="11"/></svg>`;
    }
    if (raw.includes('🕌') || raw.includes('prayer') || raw.includes('صلاة') || t.includes('صلاة') || t.includes('فجر') || t.includes('أذكار') || t.includes('prayer')) {
      return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c-1.5 1.5-2 3-2 5a2 2 0 0 0 4 0c0-2-.5-3.5-2-5z"/><path d="M4 21V10l8-4 8 4v11"/><path d="M9 21v-5a3 3 0 0 1 6 0v5"/></svg>`;
    }

    // 2. Reading / Books / Study
    if (raw.includes('📚') || raw.includes('read') || raw.includes('قراءة') || t.includes('قراءة') || t.includes('reading') || t.includes('كتاب') || t.includes('book')) {
      return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`;
    }

    // 3. Fitness / Workout / Gym / Sport
    if (raw.includes('💪') || raw.includes('🏃') || raw.includes('gym') || raw.includes('رياضة') || raw.includes('تمرين') || t.includes('رياضة') || t.includes('تمرين') || t.includes('fitness') || t.includes('gym') || t.includes('workout')) {
      return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1a2 2 0 0 0-2.83 0l-1.34 1.34a2 2 0 0 1-2.83 0l-4.24-4.24a2 2 0 0 1 0-2.83l1.34-1.34a2 2 0 0 0 0-2.83l-1-1"/><path d="m3 3 1 1a2 2 0 0 0 2.83 0l1.34-1.34a2 2 0 0 1 2.83 0l4.24 4.24a2 2 0 0 1 0 2.83l-1.34 1.34a2 2 0 0 0 0 2.83l1 1"/></svg>`;
    }

    // 4. Water / Hydration
    if (raw.includes('💧') || raw.includes('water') || raw.includes('ماء') || raw.includes('شرب') || t.includes('ماء') || t.includes('water') || t.includes('hydration')) {
      return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`;
    }

    // 5. Sleep / Rest / Nap
    if (raw.includes('😴') || raw.includes('🛌') || raw.includes('sleep') || raw.includes('نوم') || t.includes('نوم') || t.includes('sleep') || t.includes('راحة')) {
      return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    }

    // 6. Walking / Steps / Movement
    if (raw.includes('🚶') || raw.includes('walk') || raw.includes('مشي') || raw.includes('خطوات') || t.includes('مشي') || t.includes('walk') || t.includes('step')) {
      return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M7 22l4-7 2 3 3 4"/><path d="M16 11l-3-3-3 2-2 6"/></svg>`;
    }

    // 7. Coding / Tech / Work
    if (raw.includes('💻') || raw.includes('code') || raw.includes('برمجة') || raw.includes('عمل') || t.includes('برمجة') || t.includes('code') || t.includes('developer') || t.includes('work')) {
      return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`;
    }

    // 8. Focus / Pomodoro / Timer
    if (raw.includes('⏱️') || raw.includes('timer') || raw.includes('focus') || raw.includes('تركيز') || t.includes('تركيز') || t.includes('بومودورو') || t.includes('focus')) {
      return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 6 12 12 16 14"/></svg>`;
    }

    // 9. Nutrition / Healthy Food
    if (raw.includes('🥗') || raw.includes('🍎') || raw.includes('food') || raw.includes('غذاء') || t.includes('طعام') || t.includes('صحي') || t.includes('خضار') || t.includes('diet')) {
      return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`;
    }

    // 10. Writing / Journal / Diary
    if (raw.includes('✍️') || raw.includes('📝') || raw.includes('كتابة') || raw.includes('journal') || t.includes('كتابة') || t.includes('مذكرات') || t.includes('تدوين')) {
      return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`;
    }

    // 11. Meditation / Mindfulness / Peace
    if (raw.includes('🧘') || raw.includes('zen') || raw.includes('هدوء') || raw.includes('تأمل') || t.includes('تأمل') || t.includes('هدوء') || t.includes('meditation')) {
      return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="2"/><path d="M18 10h-2.5a2.5 2.5 0 0 0-2.5 2.5V17l-3 4-3-4v-4.5A2.5 2.5 0 0 0 4.5 10H2"/><path d="m15 16 3 5"/></svg>`;
    }

    // 12. Finance / Money / Savings
    if (raw.includes('💰') || raw.includes('🪙') || raw.includes('money') || raw.includes('مال') || raw.includes('ادخار') || t.includes('مال') || t.includes('ادخار') || t.includes('مصروف')) {
      return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="9" y1="11" x2="15" y2="11"/></svg>`;
    }

    // Fallback Sleek Sparkle Star
    return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
  }

  let pomodoroState = null;
  let pomodoroTicker = null;

  function setupPomodoroCrossIntegration() {
    if (!window.widgets?.pomodoro) return;

    function updatePomodoroDesk(snap) {
      pomodoroState = snap;
      const timerEl = $('#heroFocusTimerDisplay');
      const badgeEl = $('#heroFocusBadgeText');
      const habitTitleEl = $('#heroFocusHabitTitle');
      const btnTextEl = $('#heroFocusBtnText');
      const cardEl = $('#heroFocusCard');
      const isEn = lang() === 'en';

      if (!timerEl) return;

      if (!snap) {
        timerEl.textContent = '25:00';
        if (btnTextEl) btnTextEl.textContent = isEn ? 'Start Focus' : 'بدء التركيز';
        return;
      }

      const remainingMs = snap.status === 'running' && snap.endsAt
        ? Math.max(0, snap.endsAt - Date.now())
        : (snap.remaining || 0);

      const totalSec = Math.ceil(remainingMs / 1000);
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      const timeStr = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      timerEl.textContent = digits(timeStr);

      if (badgeEl) {
        if (snap.mode === 'short' || snap.mode === 'long') {
          badgeEl.textContent = isEn ? 'Break Time' : 'استراحة';
        } else {
          badgeEl.textContent = isEn ? 'Focus Session' : 'جلسة تركيز';
        }
      }

      if (cardEl) {
        const showPomodoro = (state.settings?.showPomodoroShortcut !== false) &&
                             (state.allSettings?.habits?.showPomodoroShortcut !== false);
        cardEl.style.display = showPomodoro ? 'flex' : 'none';
        if (snap.status === 'running') {
          cardEl.classList.add('is-active-running');
        } else {
          cardEl.classList.remove('is-active-running');
        }
      }

      const heroBento = $('#habitsHeroBento');
      if (heroBento) {
        const showStreak = (state.settings?.showStreak !== false) && (state.allSettings?.habits?.showStreak !== false);
        const showPomodoro = (state.settings?.showPomodoroShortcut !== false) && (state.allSettings?.habits?.showPomodoroShortcut !== false);
        heroBento.style.display = (showStreak || showPomodoro) ? 'flex' : 'none';
      }

      if (btnTextEl) {
        if (snap.status === 'running') {
          btnTextEl.textContent = isEn ? 'Pause' : 'إيقاف مؤقت';
        } else if (snap.status === 'paused') {
          btnTextEl.textContent = isEn ? 'Resume' : 'استئناف';
        } else {
          btnTextEl.textContent = isEn ? 'Start Focus' : 'بدء التركيز';
        }
      }
    }

    try {
      window.widgets.pomodoro.get?.().then(updatePomodoroDesk).catch(() => {});
      window.widgets.pomodoro.onState?.((snap) => {
        updatePomodoroDesk(snap);
      });
      window.widgets.pomodoro.onDone?.(({ finished }) => {
        if (finished === 'focus') {
          showFloatingReward(lang() === 'en' ? '🎉 Focus session complete!' : '🎉 أحسنت! اكتملت جلسة التركيز');
          triggerVictoryShower();
          playChime('victory');
        }
      });
    } catch (_) {}

    if (!pomodoroTicker) {
      pomodoroTicker = setInterval(() => {
        if (pomodoroState && pomodoroState.status === 'running') {
          updatePomodoroDesk(pomodoroState);
        }
      }, 1000);
    }

    const actBtn = $('#heroFocusActionBtn');
    if (actBtn && !actBtn._wired) {
      actBtn._wired = true;
      actBtn.addEventListener('click', async () => {
        if (!window.widgets?.pomodoro) return;
        try {
          if (!pomodoroState || pomodoroState.status === 'idle') {
            const snap = await window.widgets.pomodoro.act('start', 'focus');
            updatePomodoroDesk(snap);
          } else if (pomodoroState.status === 'running') {
            const snap = await window.widgets.pomodoro.act('pause');
            updatePomodoroDesk(snap);
          } else if (pomodoroState.status === 'paused') {
            const snap = await window.widgets.pomodoro.act('start');
            updatePomodoroDesk(snap);
          }
        } catch (err) {
          console.error('Failed pomodoro action:', err);
        }
      });
    }
  }

  const HABIT_PRESETS = [
    {
      icon: '📖',
      title: 'ورد القرآن الكريم',
      titleEn: 'Daily Quran Recitation',
      routine: 'morning',
      category: 'spirit',
      type: 'number',
      direction: 'positive',
      difficulty: 'easy',
      targetValue: 10,
      unit: 'صفحات',
      unitEn: 'pages',
      color: '#10b981',
      enablePomodoro: true,
      syncToTodo: true,
      todoPriority: 1,
    },
    {
      icon: '🕌',
      title: 'صلاة الفجر في وقتها',
      titleEn: 'Fajr Prayer On Time',
      routine: 'morning',
      category: 'spirit',
      type: 'boolean',
      direction: 'positive',
      difficulty: 'medium',
      targetValue: 1,
      unit: '',
      unitEn: '',
      color: '#06b6d4',
      enablePomodoro: false,
      syncToTodo: true,
      todoPriority: 2,
    },
    {
      icon: '💧',
      title: 'شرب 8 أكواب ماء',
      titleEn: 'Drink 8 Cups of Water',
      routine: 'anytime',
      category: 'health',
      type: 'number',
      direction: 'positive',
      difficulty: 'easy',
      targetValue: 8,
      unit: 'أكواب',
      unitEn: 'cups',
      color: '#3b82f6',
      enablePomodoro: false,
      syncToTodo: false,
      todoPriority: 0,
    },
    {
      icon: '💻',
      title: 'جلسة عمل وبرمجة عميقة',
      titleEn: 'Deep Work & Coding',
      routine: 'morning',
      category: 'productivity',
      type: 'duration',
      direction: 'positive',
      difficulty: 'medium',
      targetValue: 90,
      unit: 'دقيقة',
      unitEn: 'min',
      color: '#6366f1',
      enablePomodoro: true,
      syncToTodo: true,
      todoPriority: 1,
    },
    {
      icon: '🏃‍♂️',
      title: 'تمارين رياضية ونشاط',
      titleEn: 'Daily Workout & Fitness',
      routine: 'afternoon',
      category: 'health',
      type: 'duration',
      direction: 'positive',
      difficulty: 'medium',
      targetValue: 30,
      unit: 'دقيقة',
      unitEn: 'min',
      color: '#f59e0b',
      enablePomodoro: true,
      syncToTodo: true,
      todoPriority: 1,
    },
    {
      icon: '🚶‍♂️',
      title: '10,000 خطوة يومياً',
      titleEn: '10,000 Daily Steps',
      routine: 'anytime',
      category: 'health',
      type: 'number',
      direction: 'positive',
      difficulty: 'hard',
      targetValue: 10000,
      unit: 'خطوة',
      unitEn: 'steps',
      color: '#14b8a6',
      enablePomodoro: false,
      syncToTodo: false,
      todoPriority: 0,
    },
    {
      icon: '📚',
      title: 'قراءة كتاب مفيد',
      titleEn: 'Read a Good Book',
      routine: 'evening',
      category: 'learning',
      type: 'number',
      direction: 'positive',
      difficulty: 'easy',
      targetValue: 20,
      unit: 'صفحة',
      unitEn: 'pages',
      color: '#ec4899',
      enablePomodoro: true,
      syncToTodo: true,
      todoPriority: 0,
    },
    {
      icon: '😴',
      title: 'نوم مبكر قبل 11:30',
      titleEn: 'Early Sleep by 11:30',
      routine: 'evening',
      category: 'health',
      type: 'boolean',
      direction: 'positive',
      difficulty: 'medium',
      targetValue: 1,
      unit: '',
      unitEn: '',
      color: '#8b5cf6',
      enablePomodoro: false,
      syncToTodo: false,
      todoPriority: 1,
    },
    {
      icon: '📿',
      title: 'أذكار الصباح والمساء',
      titleEn: 'Morning & Evening Adhkar',
      routine: 'afternoon',
      category: 'spirit',
      type: 'boolean',
      direction: 'positive',
      difficulty: 'easy',
      targetValue: 1,
      unit: '',
      unitEn: '',
      color: '#10b981',
      enablePomodoro: false,
      syncToTodo: true,
      todoPriority: 0,
    },
    {
      icon: '✍️',
      title: 'تدوين يوميات ومراجعة',
      titleEn: 'Daily Journal & Review',
      routine: 'evening',
      category: 'mind',
      type: 'boolean',
      direction: 'positive',
      difficulty: 'easy',
      targetValue: 1,
      unit: '',
      unitEn: '',
      color: '#f97316',
      enablePomodoro: false,
      syncToTodo: false,
      todoPriority: 0,
    },
    {
      icon: '🛑',
      title: 'الامتناع عن وسائل التواصل بعد 10م',
      titleEn: 'No Social Media After 10 PM',
      routine: 'evening',
      category: 'mind',
      type: 'boolean',
      direction: 'negative',
      difficulty: 'hard',
      targetValue: 1,
      unit: '',
      unitEn: '',
      color: '#ef4444',
      enablePomodoro: false,
      syncToTodo: false,
      todoPriority: 1,
    },
    {
      icon: '🥗',
      title: 'تجنب الوجبات السريعة والمياه الغازية',
      titleEn: 'Avoid Junk Food & Soda',
      routine: 'anytime',
      category: 'health',
      type: 'boolean',
      direction: 'negative',
      difficulty: 'medium',
      targetValue: 1,
      unit: '',
      unitEn: '',
      color: '#eab308',
      enablePomodoro: false,
      syncToTodo: false,
      todoPriority: 0,
    },
  ];

  function renderPresetsGrid() {
    const grid = $('#qaPresetsGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const isEn = lang() === 'en';

    HABIT_PRESETS.forEach(p => {
      const card = document.createElement('div');
      card.className = 'qa-preset-card';
      const title = isEn ? p.titleEn : p.title;
      let targetText = '';
      if (p.type === 'number' || p.type === 'duration') {
        targetText = `${digits(p.targetValue)} ${isEn ? (p.unitEn || p.unit) : (p.unit || '')}`;
      } else if (p.type === 'percentage') {
        targetText = `${digits(p.targetValue || 100)}%`;
      } else if (p.type === 'rating') {
        targetText = '5 ⭐';
      } else {
        targetText = isEn ? 'Daily Check' : 'إنجاز يومي';
      }
      const routineKey = p.routine ? p.routine.charAt(0).toUpperCase() + p.routine.slice(1) : 'Anytime';
      const routineText = t(`habits.routine${routineKey}`);

      card.innerHTML = `
        <div class="qa-preset-icon" style="background: ${p.color}22; color: ${p.color};">${getHabitIconSvg(p.icon, title, p.color)}</div>
        <div class="qa-preset-info">
          <div class="qa-preset-title">${title}</div>
          <div class="qa-preset-meta">
            <span class="qa-preset-tag">${routineText}</span>
            ${targetText ? `<span class="qa-preset-target">${targetText}</span>` : ''}
          </div>
        </div>
        <button type="button" class="qa-preset-add-btn" title="${t('habits.addHabit')}">+</button>
      `;

      card.onclick = async (e) => {
        e.stopPropagation();
        const newHabit = {
          id: `hbt-${Date.now()}`,
          title: p.title,
          titleEn: p.titleEn,
          type: p.type,
          direction: p.direction,
          difficulty: p.difficulty,
          targetValue: p.targetValue,
          unit: p.unit,
          unitEn: p.unitEn || p.unit,
          routine: p.routine,
          category: p.category,
          icon: p.icon,
          color: p.color,
          frequency: { type: 'daily' },
          enablePomodoro: p.enablePomodoro,
          syncToTodo: p.syncToTodo,
          todoPriority: p.todoPriority,
          createdAt: new Date().toISOString(),
          archived: false,
        };

        if (window.widgets?.habits?.saveHabit) {
          await window.widgets.habits.saveHabit(newHabit);
          state.habits.push(newHabit);
        }

        triggerConfetti(window.innerWidth / 2, 100);
        playChime('victory');
        closeQuickAddModal();
        render();
      };

      grid.appendChild(card);
    });
  }

  function calculateHabitStrength(habitId) {
    const logs = state.logs || {};
    const habit = (state.habits || []).find(h => h.id === habitId);
    if (!habit) return 0;

    const target = Number(habit.targetValue) || 1;
    const alpha = 0.88;
    let score = 0;
    let hasAnyLogs = false;

    const today = new Date();
    const days = [];
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push(formatLocalDate(d));
    }

    for (const dStr of days) {
      const hLog = logs[dStr]?.habits?.[habitId];
      if (hLog && hLog.status === 'skip') {
        continue; // preserve strength with zero penalty on skip
      }
      let r = 0;
      if (hLog && hLog.status === 'done') {
        r = 1.0;
        hasAnyLogs = true;
      } else if (hLog && hLog.status === 'partial') {
        r = Math.min(1.0, Math.max(0, (Number(hLog.value) || 0) / target));
        hasAnyLogs = true;
      } else if (hLog) {
        hasAnyLogs = true;
      }
      score = score * alpha + (1 - alpha) * 100 * r;
    }

    return hasAnyLogs ? Math.round(Math.min(100, Math.max(0, score))) : 0;
  }

  function calculateUrgencyScore(habitId, dateStr = todayStr()) {
    const habit = (state.habits || []).find(h => h.id === habitId);
    if (!habit) return 0;

    const logs = state.logs || {};
    const freq = habit.frequency || { type: 'daily' };
    const todayLog = logs[dateStr]?.habits?.[habitId];
    if (todayLog?.status === 'done') {
      return 0;
    }

    let lastCompletedDaysAgo = null;
    const baseDate = new Date(dateStr);
    for (let i = 0; i <= 60; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - i);
      const ds = formatLocalDate(d);
      const hl = logs[ds]?.habits?.[habitId];
      if (hl && (hl.status === 'done' || (hl.status === 'partial' && Number(hl.value) >= (Number(habit.targetValue) || 1)))) {
        lastCompletedDaysAgo = i;
        break;
      }
    }

    let interval = 1;
    if (freq.type === 'every_x_days') {
      interval = Math.max(1, Number(freq.interval) || 2);
    } else if (freq.type === 'weekly_target') {
      const targetDays = Math.max(1, Math.min(7, Number(freq.targetDaysPerWeek) || 3));
      interval = Math.round(7 / targetDays);
    } else if (freq.type === 'specific_days') {
      const targetDays = Array.isArray(freq.daysOfWeek) && freq.daysOfWeek.length > 0 ? freq.daysOfWeek.length : 3;
      interval = Math.round(7 / targetDays);
    }

    if (lastCompletedDaysAgo === null) {
      return 95;
    }

    const urgencyRatio = lastCompletedDaysAgo / interval;
    return Math.min(100, Math.round(urgencyRatio * 50));
  }

  const activeStopwatches = {}; // habitId -> { intervalId, elapsedSeconds }
  const expandedSubItemsHabitIds = new Set();

  function getThemeDoneGlyph() {
    const dotStyle = state.settings?.gridDotStyle || state.allSettings?.habits?.gridDotStyle;
    if (dotStyle === 'glow_dot') return '●';
    if (dotStyle === 'check') return '✓';
    if (dotStyle === 'square') return '■';
    if (dotStyle === 'ring') return '◎';
    let t = state.settings?.theme || 'match';
    if (t === 'bujo') t = 'notebook';
    return ['dotgrid', 'graphpaper', 'sketch', 'notebook', 'craft'].includes(t) ? '✕' : '✓';
  }

  function applySettingsToUI() {
    const s = state.settings || {};

    // Density
    const density = s.cardDensity || state.cardDensity || 'compact';
    state.cardDensity = density;
    const listEl = $('#habitsList');
    if (listEl) {
      listEl.classList.remove('density-comfortable', 'density-compact', 'density-minimal');
      listEl.classList.add(`density-${density}`);
    }
    $$('#popoverDensity .seg-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.density === density);
    });

    // View Status Filter
    const sFilter = s.statusFilter || state.viewStatusFilter || 'all';
    state.viewStatusFilter = sFilter;
    $$('#popoverStatusFilter .seg-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === sFilter);
    });

    // Sort order
    const sortOrder = s.sortOrder || state.sortOrder || 'manual';
    state.sortOrder = sortOrder;
    const sortSelect = $('#popoverSort');
    if (sortSelect) sortSelect.value = sortOrder;

    // Theme resolution:
    // 1. Per-widget style override if defined
    // 2. Habits-specific theme setting
    // 3. Fallback to match app theme
    const wTheme = state.allSettings?.widgetStyles?.habits?.theme;
    let chosenTheme = (wTheme && wTheme !== 'inherit') ? wTheme : (s.theme || 'match');
    if (chosenTheme === 'bujo') chosenTheme = 'notebook';
    const effectiveTheme = (chosenTheme === 'match') ? (document.documentElement.dataset.theme || 'glass') : chosenTheme;

    document.body.classList.remove(
      'theme-notebook', 'theme-dotgrid', 'theme-graphpaper', 'theme-sketch',
      'theme-craft', 'theme-oled', 'theme-minimal-light', 'theme-emerald',
      'theme-ocean', 'theme-amber'
    );

    const CUSTOM_THEMES = ['dotgrid', 'graphpaper', 'sketch', 'notebook', 'craft', 'oled', 'minimal-light', 'emerald', 'ocean', 'amber'];
    if (CUSTOM_THEMES.includes(effectiveTheme) && effectiveTheme !== 'dark-modern') {
      document.body.classList.add(`theme-${effectiveTheme}`);
    }

    const themeSelect = $('#popoverThemeSelect');
    if (themeSelect) themeSelect.value = s.theme || 'match';
    $$('#popoverTheme .seg-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === (s.theme || 'match'));
    });

    // Default View (Today checklist vs monthly matrix vs saved view)
    let initialView = null;
    try { initialView = localStorage.getItem('mirqat_habits_current_view'); } catch (_) {}
    if (initialView && ['checklist', 'mini-bujo', 'mini-sleep'].includes(initialView)) {
      switchView(initialView);
    } else if (s.defaultView === 'week' && state.currentView === 'checklist') {
      switchView('mini-bujo');
    }

    // Component visibility
    const showStreak = s.showStreak !== false;
    const showStrength = s.showStrength !== false;
    const showUrgency = s.showUrgency !== false;
    const showPomodoro = s.showPomodoroShortcut !== false;
    const showProgressBar = s.showProgressBar !== false;
    const showMiniStrip = s.showMiniStrip !== false;
    const showRoutines = s.showRoutineFilters !== false;
    const showFooter = s.showFooterCheckin !== false;
    const showMindset = s.dailyMotivationalQuote !== false;
    const showGamification = s.gamificationEnabled !== false;
    const showAtlasBar = s.showAtlasBar !== false;
    const showSound = s.soundEffects !== false;

    if ($('#popShowStreak')) $('#popShowStreak').checked = showStreak;
    if ($('#popShowStrength')) $('#popShowStrength').checked = showStrength;
    if ($('#popShowUrgency')) $('#popShowUrgency').checked = showUrgency;
    if ($('#popShowPomodoro')) $('#popShowPomodoro').checked = showPomodoro;
    if ($('#popShowProgressBar')) $('#popShowProgressBar').checked = showProgressBar;
    if ($('#popShowMiniStrip')) $('#popShowMiniStrip').checked = showMiniStrip;
    if ($('#popShowRoutines')) $('#popShowRoutines').checked = showRoutines;
    if ($('#popShowFooterCheckin')) $('#popShowFooterCheckin').checked = showFooter;
    if ($('#popShowMindsetSpark')) $('#popShowMindsetSpark').checked = showMindset;
    if ($('#popShowGamification')) $('#popShowGamification').checked = showGamification;
    if ($('#popShowAtlasBar')) $('#popShowAtlasBar').checked = showAtlasBar;
    if ($('#popShowSoundEffects')) $('#popShowSoundEffects').checked = showSound;

    // Direct UI visibility reflection for hero cards and components
    if ($('#heroFocusCard')) $('#heroFocusCard').style.display = showPomodoro ? 'flex' : 'none';
    if ($('#heroStreakCard')) $('#heroStreakCard').style.display = showStreak ? 'block' : 'none';
    if ($('#heroPurposeCard')) $('#heroPurposeCard').style.display = 'none';
    const heroBento = $('#habitsHeroBento');
    if (heroBento) heroBento.style.display = (showPomodoro || showStreak) ? 'flex' : 'none';
    if ($('#habitsProgressWrap')) $('#habitsProgressWrap').style.display = showProgressBar ? 'block' : 'none';
    if ($('#habitsAtlasMiniBar')) $('#habitsAtlasMiniBar').style.display = showAtlasBar ? 'flex' : 'none';

    if ($('#miniStrip')) $('#miniStrip').style.display = showMiniStrip ? 'flex' : 'none';
    const rTabs = $('#routineFilterBar') || $('#routineTabs');
    if (rTabs) rTabs.style.display = showRoutines ? 'flex' : 'none';
    if (!showRoutines && state.activeRoutine !== 'all') {
      state.activeRoutine = 'all';
    }
    if ($('#habitsFooter')) $('#habitsFooter').style.display = showFooter ? 'block' : 'none';
    if ($('#mindsetSparkBanner')) $('#mindsetSparkBanner').style.display = showMindset ? 'flex' : 'none';
    renderGamificationPill();
  }

  async function persistHabitSettings(patch) {
    state.settings = { ...(state.settings || {}), ...patch };
    applySettingsToUI();
    render();
    if (window.widgets?.settings?.set) {
      await window.widgets.settings.set({ habits: state.settings });
    }
  }

  function showFloatingReward(text) {
    if (state.settings?.gamificationEnabled === false) return;
    const container = $('#xpFloatingContainer');
    if (!container) return;
    const pill = document.createElement('div');
    pill.className = 'xp-floating-pill';
    pill.textContent = text;
    container.appendChild(pill);
    setTimeout(() => {
      pill.remove();
    }, 1700);
  }

  function renderGamificationPill() {
    const pill = $('#gamificationHeaderPill');
    const isGamified = state.settings?.gamificationEnabled !== false;
    if (pill) {
      pill.style.display = isGamified ? 'inline-flex' : 'none';
    }
    if (!isGamified) return;
    const g = state.gamification || {};
    const lvlTag = $('#lvlTag');
    const coinsVal = $('#coinsVal');
    if (lvlTag) lvlTag.textContent = `Lv.${g.level || 1}`;
    if (coinsVal) coinsVal.textContent = digits(g.coins || 0);
  }

  /* ---------- Behavioral Habit Formation Sparks ---------- */
  const MINDSET_SPARKS = [
    {
      ar: 'العادات الصغيرة تتراكم لتصنع تحولات مذهلة. خطوة اليوم هي فوزك.',
      en: 'Small daily habits compound into massive transformations. Every rep counts.',
    },
    {
      ar: 'أنت لا ترتقي لمستوى أهدافك، بل تهبط لمستوى أنظمتك اليومية.',
      en: 'You do not rise to the level of your goals. You fall to the level of your systems.',
    },
    {
      ar: 'كل عمل تقوم به هو صوت تصوت به للشخص الذي تريد أن تصبحه.',
      en: 'Every action you take is a vote for the type of person you wish to become.',
    },
    {
      ar: 'قليل دائم خير من كثير منقطع — الاستمرارية هي السر الأعظم لبناء الذات.',
      en: 'Consistent small efforts surpass rare heroic bursts. Consistency is key.',
    },
    {
      ar: 'إذا تحسنت بنسبة 1% فقط كل يوم، فستصل إلى 37 ضعفاً بنهاية العام.',
      en: '1% better every day yields 37 times better by the end of the year.',
    },
    {
      ar: 'اجعل البداية سهلة جداً بحيث لا يمكنك رفض أداءها (قاعدة الدقيقتين).',
      en: 'Make starting so frictionless you cannot say no (The 2-Minute Rule).',
    },
    {
      ar: 'لا تكسر السلسلة؛ وإذا فاتك يوم بعذر فلا تجعلها يومين أبداً.',
      en: 'Never miss twice. If you slip up one day, bounce back immediately.',
    },
    {
      ar: 'العادة الأولى في روتينك تحدد إيقاع تركيزك وطاقتك لبقية اليوم.',
      en: 'Your first ritual of the day sets the tone for your entire focus.',
    },
  ];

  /* ---------- Synthesized Web Audio API Chime ---------- */
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) audioCtx = new AudioCtxClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playChime(type = 'check') {
    if (state.settings?.soundEffects === false) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      if (type === 'check') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(659.25, now);
        osc.frequency.exponentialRampToValueAtTime(1318.5, now + 0.08);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.23);
      } else if (type === 'victory') {
        const freqs = [523.25, 659.25, 783.99, 1046.50];
        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          const tNote = now + idx * 0.07;
          osc.frequency.setValueAtTime(f, tNote);
          gain.gain.setValueAtTime(0.14, tNote);
          gain.gain.exponentialRampToValueAtTime(0.001, tNote + 0.50);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(tNote);
          osc.stop(tNote + 0.52);
        });
      }
    } catch {}
  }

  /* ---------- Particle Confetti Physics Engine ---------- */
  let confettiCanvas = null;
  let confettiCtx = null;
  let particles = [];
  let confettiRaf = null;

  function initConfettiCanvas() {
    confettiCanvas = $('#habitsConfettiCanvas');
    if (confettiCanvas) {
      confettiCtx = confettiCanvas.getContext('2d');
      resizeConfettiCanvas();
      window.addEventListener('resize', resizeConfettiCanvas);
    }
  }

  function resizeConfettiCanvas() {
    if (!confettiCanvas) return;
    const parent = confettiCanvas.parentElement;
    if (parent) {
      const w = parent.clientWidth || 320;
      const h = parent.clientHeight || 480;
      if (confettiCanvas.width !== w) confettiCanvas.width = w;
      if (confettiCanvas.height !== h) confettiCanvas.height = h;
    }
  }

  function triggerConfetti(originX, originY, count = 35) {
    if (state.settings?.confettiCelebration === false) return;
    if (!confettiCanvas || !confettiCtx) return;
    resizeConfettiCanvas();

    const rect = confettiCanvas.getBoundingClientRect();
    const x = originX !== undefined ? originX - rect.left : confettiCanvas.width / 2;
    const y = originY !== undefined ? originY - rect.top : confettiCanvas.height / 3;

    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#eab308'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 6.5;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: 3 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        life: 1,
        decay: 0.018 + Math.random() * 0.02,
        isCircle: Math.random() > 0.5,
      });
    }

    if (!confettiRaf) {
      confettiRaf = requestAnimationFrame(updateConfetti);
    }
  }

  function triggerVictoryShower() {
    if (state.settings?.confettiCelebration === false) return;
    if (!confettiCanvas || !confettiCtx) return;
    resizeConfettiCanvas();
    const w = confettiCanvas.width;
    const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#fbbf24', '#a855f7'];
    for (let i = 0; i < 90; i++) {
      particles.push({
        x: Math.random() * w,
        y: -10 - Math.random() * 30,
        vx: (Math.random() - 0.5) * 3,
        vy: 2 + Math.random() * 4,
        size: 4 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 14,
        life: 1,
        decay: 0.008 + Math.random() * 0.012,
        isCircle: Math.random() > 0.4,
      });
    }
    if (!confettiRaf) {
      confettiRaf = requestAnimationFrame(updateConfetti);
    }
  }

  function updateConfetti() {
    if (window.UI?.isDormant?.()) {
      particles.length = 0;
      confettiRaf = null;
      return;
    }
    if (!confettiCtx || !confettiCanvas) return;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.14;
      p.vx *= 0.98;
      p.rotation += p.rotSpeed;
      p.life -= p.decay;
      p.alpha = Math.max(0, p.life);

      if (p.alpha <= 0 || p.y > confettiCanvas.height + 20) {
        particles.splice(i, 1);
        continue;
      }

      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate((p.rotation * Math.PI) / 180);
      confettiCtx.globalAlpha = p.alpha;
      confettiCtx.fillStyle = p.color;

      if (p.isCircle) {
        confettiCtx.beginPath();
        confettiCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        confettiCtx.fill();
      } else {
        confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
      }
      confettiCtx.restore();
    }

    if (particles.length > 0) {
      confettiRaf = requestAnimationFrame(updateConfetti);
    } else {
      confettiRaf = null;
    }
  }

  /* ---------- Smart Routine Auto-Anchoring ---------- */
  function applySmartRoutineAnchor() {
    if (routineUserOverridden) return;
    if (state.settings?.showRoutineFilters === false) return;
    if (state.settings?.smartRoutineAnchor === false) return;
    const hour = new Date().getHours();
    let target = 'anytime';
    if (hour >= 5 && hour < 12) target = 'morning';
    else if (hour >= 12 && hour < 17) target = 'afternoon';
    else target = 'evening';

    const activeHabits = (state.habits || []).filter(h => !h.archived);
    const hasRoutineHabits = activeHabits.some(h => (h.routine || 'anytime') === target);
    if (hasRoutineHabits) {
      state.activeRoutine = target;
      $$('.routine-chip').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.routine === target);
      });
    }
  }

  /* ---------- Mindset Sparks Renderer ---------- */
  function renderMindsetSpark() {
    const banner = $('#mindsetSparkBanner');
    if (!banner) return;
    if (state.settings?.dailyMotivationalQuote === false) {
      banner.style.display = 'none';
      return;
    }
    banner.style.display = 'flex';
    const isEn = lang() === 'en';
    const spark = MINDSET_SPARKS[currentSparkIndex % MINDSET_SPARKS.length];
    const textEl = $('#sparkText');
    if (textEl) {
      textEl.textContent = isEn ? spark.en : spark.ar;
      textEl.title = isEn ? spark.en : spark.ar;
    }
  }

  function todayStr() {
    return formatLocalDate(new Date());
  }

  function getTodayLog(dateStr = null) {
    const td = dateStr || state.selectedDate || todayStr();
    return state.logs[td] || { habits: {}, sleep: null, mood: null };
  }

  /* ---------- Data Operations ---------- */

  async function loadState() {
    if (!window.widgets?.habits?.getState) return;
    try {
      const data = await window.widgets.habits.getState();
      if (data) {
        state.habits = data.habits || [];
        state.logs = data.logs || {};
        state.settings = data.settings || {};
        state.gamification = data.gamification || state.gamification;
        if (window.widgets?.atlas?.getState) {
          try {
            state.atlas = await window.widgets.atlas.getState(lang() === 'en' ? 'en' : 'ar');
          } catch (_) {}
        }
        render();
      }
    } catch (err) {
      console.error('Failed to load habits state:', err);
    }
  }

  async function saveStatus(habitId, status, value = null, dateStr = null, isMicroStep = false) {
    const td = dateStr || state.selectedDate || todayStr();
    if (td > todayStr()) {
      alert(lang() === 'en' ? 'Cannot log habits for future dates!' : 'ممنوع تسجيل العادات للأيام القادمة!');
      return;
    }
    try {
      let res = null;
      if (window.widgets?.habits?.saveStatus) {
        res = await window.widgets.habits.saveStatus({
          dateStr: td,
          habitId,
          status,
          value,
          isMicroStep: Boolean(isMicroStep),
        });
      }

      if (state.settings?.gamificationEnabled !== false && res?.gamificationDelta?.xpEarned > 0) {
        const xp = res.gamificationDelta.xpEarned;
        const coins = res.gamificationDelta.coinsEarned;
        const prefix = isMicroStep ? '⚡ ' : '';
        showFloatingReward(`${prefix}+${xp} XP  🪙+${coins}`);
        if (res.gamificationDelta.leveledUp) {
          triggerVictoryShower();
          playChime('victory');
        }
      }

      if (window.widgets?.habits?.getGamification) {
        state.gamification = await window.widgets.habits.getGamification();
      }

      if (!state.logs[td]) state.logs[td] = { habits: {} };
      if (!state.logs[td].habits) state.logs[td].habits = {};

      if (status === 'none') {
        delete state.logs[td].habits[habitId];
      } else {
        const prev = state.logs[td].habits[habitId] || {};
        state.logs[td].habits[habitId] = {
          ...prev,
          status,
          value: value !== null ? Number(value) : (status === 'done' ? 1 : 0),
          isMicroStep: Boolean(isMicroStep),
        };
      }

      // Check if all scheduled habits are completed for today -> Victory Shower!
      const activeH = (state.habits || []).filter(h => !h.archived);
      let sCount = 0;
      let dCount = 0;
      for (const h of activeH) {
        const hl = state.logs[td]?.habits?.[h.id];
        if (hl?.status === 'skip') continue;
        sCount++;
        if (hl?.status === 'done' || (hl?.status === 'partial' && Number(hl.value) >= (Number(h.targetValue) || 1))) {
          dCount++;
        }
      }
      if (sCount > 0 && dCount === sCount && (status === 'done' || (value !== null && value >= (state.habits.find(h => h.id === habitId)?.targetValue || 1)))) {
        triggerVictoryShower();
        playChime('victory');
      }

      render();
    } catch (err) {
      console.error('Failed to save habit status:', err);
    }
  }

  async function saveMood(rating, dateStr = null) {
    const td = dateStr || todayStr();
    if (td > todayStr()) {
      alert(lang() === 'en' ? 'Cannot log mood for future dates!' : 'ممنوع تسجيل المزاج للأيام القادمة!');
      return;
    }
    try {
      if (window.widgets?.habits?.saveMood) {
        await window.widgets.habits.saveMood({
          dateStr: td,
          moodData: { rating, scale: 5 },
        });
      }
      if (!state.logs[td]) state.logs[td] = { habits: {} };
      state.logs[td].mood = { rating, scale: 5 };
      render();
    } catch (err) {
      console.error('Failed to save mood:', err);
    }
  }

  async function saveSleep(durationHours, quality, dateStr = null) {
    const td = dateStr || todayStr();
    if (td > todayStr()) {
      alert(lang() === 'en' ? 'Cannot log sleep for future dates!' : 'ممنوع تسجيل النوم للأيام القادمة!');
      return;
    }
    try {
      if (window.widgets?.habits?.saveSleep) {
        await window.widgets.habits.saveSleep({
          dateStr: td,
          sleepData: { durationHours, quality },
        });
      }
      if (!state.logs[td]) state.logs[td] = { habits: {} };
      state.logs[td].sleep = { durationHours, quality };
      render();
    } catch (err) {
      console.error('Failed to save sleep:', err);
    }
  }

  /* ---------- Calculations ---------- */

  function calculateStreak(habitId) {
    const logs = state.logs || {};
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return 0;

    const loggedDates = Object.keys(logs).sort();
    if (loggedDates.length === 0) return 0;

    let streak = 0;
    const today = new Date();

    for (let i = 0; i <= 60; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dStr = formatLocalDate(d);

      const dayLog = logs[dStr];
      const hLog = dayLog && dayLog.habits && dayLog.habits[habitId];

      if (!hLog || hLog.status === 'none' || hLog.status === 'fail') {
        if (i === 0) continue; // Today not yet completed is allowed
        break;
      } else if (hLog.status === 'skip') {
        continue; // Preserved!
      } else if (hLog.status === 'done') {
        streak++;
      } else if (hLog.status === 'partial') {
        const val = Number(hLog.value) || 0;
        const target = Number(habit.targetValue) || 1;
        if (val >= target * 0.5) streak++;
        else break;
      }
    }
    return streak;
  }

  function calculateTodayDWI() {
    const dayLog = getTodayLog();
    const activeHabits = (state.habits || []).filter(h => !h.archived);

    let scheduled = 0;
    let completedPoints = 0;

    for (const h of activeHabits) {
      const hLog = dayLog.habits && dayLog.habits[h.id];
      if (hLog && hLog.status === 'skip') continue;
      scheduled++;
      if (hLog && hLog.status === 'done') {
        completedPoints += 1;
      } else if (hLog && hLog.status === 'partial') {
        const val = Number(hLog.value) || 0;
        const target = Number(h.targetValue) || 1;
        completedPoints += Math.min(1, Math.max(0, val / target));
      }
    }

    if (scheduled === 0 && (!dayLog.sleep || dayLog.sleep.durationHours <= 0) && (!dayLog.mood || dayLog.mood.rating <= 0)) {
      return null; // Zero real logs -> display "—"
    }

    const habitScore = scheduled > 0 ? (completedPoints / scheduled) * 100 : 100;
    let sleepScore = null;
    if (dayLog.sleep && dayLog.sleep.durationHours > 0) {
      const diff = Math.abs(dayLog.sleep.durationHours - 8.0);
      sleepScore = Math.max(30, 100 - (diff * 18));
    }

    let moodScore = null;
    if (dayLog.mood && dayLog.mood.rating > 0) {
      moodScore = (dayLog.mood.rating / 5) * 100;
    }

    let totalScore = 0;
    let totalWeight = 0;

    totalScore += habitScore * 0.5;
    totalWeight += 0.5;

    if (sleepScore !== null) {
      totalScore += sleepScore * 0.3;
      totalWeight += 0.3;
    }
    if (moodScore !== null) {
      totalScore += moodScore * 0.2;
      totalWeight += 0.2;
    }

    return Math.round(totalScore / totalWeight);
  }

  function getOverallStreak() {
    if (state.gamification && typeof state.gamification.streak === 'number' && state.gamification.streak > 0) {
      return state.gamification.streak;
    }
    const activeHabits = (state.habits || []).filter(h => !h.archived);
    if (!activeHabits.length) return 0;
    let maxS = 0;
    for (const h of activeHabits) {
      const s = calculateStreak(h.id);
      if (s > maxS) maxS = s;
    }
    return maxS;
  }

  function renderHeroBento() {
    const hero = $('#habitsHeroBento');
    if (!hero) return;

    const s = state.settings || {};
    const showPomodoro = s.showPomodoroShortcut !== false;
    const showStreak = s.showStreak !== false;

    const heroFocus = $('#heroFocusCard');
    if (heroFocus) heroFocus.style.display = showPomodoro ? 'flex' : 'none';

    const heroStreak = $('#heroStreakCard');
    if (heroStreak) heroStreak.style.display = showStreak ? 'block' : 'none';

    const heroPurpose = $('#heroPurposeCard');
    if (heroPurpose) heroPurpose.style.display = 'none';

    hero.style.display = (showPomodoro || showStreak) ? 'flex' : 'none';
    if (!showStreak && !showPomodoro) return;

    const isEn = lang() === 'en';
    const streak = getOverallStreak();
    const bestRecord = Math.max(streak, state.gamification?.bestStreak || state.settings?.bestStreak || streak);
    const dwi = calculateTodayDWI();

    const streakNumEl = $('#heroStreakNum');
    if (streakNumEl) streakNumEl.textContent = digits(streak);

    const streakUnitEl = $('#heroStreakUnit');
    if (streakUnitEl) {
      if (streak === 1) {
        streakUnitEl.textContent = isEn ? 'Day Streak' : 'يوم استمرار';
      } else {
        streakUnitEl.textContent = isEn ? 'Days Streak' : 'أيام استمرار';
      }
    }

    const streakSubEl = $('#heroStreakSub');
    if (streakSubEl) {
      streakSubEl.textContent = streak === 1
        ? (isEn ? '1 day streak! 🔥' : 'يوم متتالي بنشاط 🔥')
        : (isEn ? `${digits(streak)} days streak! 🔥` : `${digits(streak)} أيام متتالية 🔥`);
    }

    const bestChip = $('#heroBestChip');
    if (bestChip) {
      bestChip.textContent = isEn ? `🏆 Record: ${digits(bestRecord)} d` : `🏆 قياسي: ${digits(bestRecord)} يوم`;
    }

    const dwiChip = $('#heroDwiChip');
    if (dwiChip) {
      dwiChip.textContent = dwi !== null ? `✨ ${digits(dwi)}% DWI` : '✨ 100% DWI';
    }

    // 7-day connected consistency chain ("Don't Break The Chain")
    const chainContainer = $('#heroWeekChain');
    if (chainContainer) {
      chainContainer.innerHTML = '';
      const dayLettersAr = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];
      const dayLettersEn = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
      const letters = isEn ? dayLettersEn : dayLettersAr;
      const today = new Date();
      const activeHabits = (state.habits || []).filter(h => !h.archived);

      // Build 7 days backwards (i=6 down to 0: past 6 days to today)
      const dayNodes = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dStr = formatLocalDate(d);
        const dayLog = state.logs[dStr];
        const isToday = i === 0;

        let doneCount = 0;
        let totalCount = 0;
        if (activeHabits.length) {
          for (const h of activeHabits) {
            const hl = dayLog?.habits?.[h.id];
            if (hl && hl.status === 'skip') continue;
            totalCount++;
            if (hl && (hl.status === 'done' || (hl.status === 'partial' && Number(hl.value) >= (Number(h.targetValue) || 1)))) {
              doneCount++;
            }
          }
        }
        const isDone = totalCount > 0 && doneCount >= Math.max(1, Math.ceil(totalCount * 0.5));
        dayNodes.push({ dayStr: dStr, letter: letters[d.getDay()], isToday, isDone, doneCount, totalCount });
      }

      for (let idx = 0; idx < dayNodes.length; idx++) {
        const node = dayNodes[idx];
        const dayPill = document.createElement('div');
        dayPill.className = `chain-day-pill${node.isDone ? ' is-done' : ''}${node.isToday ? ' is-today' : ''}`;
        dayPill.title = `${node.dayStr}: ${digits(node.doneCount)}/${digits(node.totalCount)}`;

        const flameDot = document.createElement('div');
        flameDot.className = 'chain-flame-dot';
        flameDot.innerHTML = node.isDone ? '🔥' : (node.isToday ? '⚡' : '○');

        const letterLbl = document.createElement('span');
        letterLbl.className = 'chain-day-letter';
        letterLbl.textContent = node.letter;

        dayPill.appendChild(flameDot);
        dayPill.appendChild(letterLbl);
        chainContainer.appendChild(dayPill);

        // Connected bridge between consecutive days
        if (idx < dayNodes.length - 1) {
          const connector = document.createElement('div');
          const nextNode = dayNodes[idx + 1];
          const isBridgeActive = node.isDone && nextNode.isDone;
          connector.className = `chain-connector${isBridgeActive ? ' active' : ''}`;
          chainContainer.appendChild(connector);
        }
      }
    }
  }

  /* ---------- Main UI Render ---------- */

  function render() {
    renderHeroBento();
    const isEn = lang() === 'en';
    const dayLog = getTodayLog();
    const activeHabits = (state.habits || []).filter(h => !h.archived);

    // 1. Header & Summary
    let scheduled = 0;
    let completed = 0;
    for (const h of activeHabits) {
      const hLog = dayLog.habits && dayLog.habits[h.id];
      if (hLog && hLog.status === 'skip') continue;
      scheduled++;
      if (hLog && hLog.status === 'done') completed++;
      else if (hLog && hLog.status === 'partial') {
        const val = Number(hLog.value) || 0;
        const target = Number(h.targetValue) || 1;
        if (val >= target) completed++;
      }
    }

    const summaryEl = $('#habitsSummary');
    if (summaryEl) {
      if (scheduled === 0) {
        summaryEl.textContent = t('habits.noHabitsToday');
      } else {
        summaryEl.textContent = t('habits.completedToday', {
          done: digits(completed),
          total: digits(scheduled),
        });
      }
    }

    // DWI Badge
    const dwiVal = calculateTodayDWI();
    const dwiValEl = $('#dwiVal');
    if (dwiValEl) {
      dwiValEl.textContent = dwiVal !== null ? `${digits(dwiVal)}%` : '—';
    }

    // Progress Bar & Bento Circular Ring
    const pct = scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0;
    const circ = 163.36;
    const offset = circ - (pct / 100) * circ;
    const ringFg = $('#habitsRingFg');
    if (ringFg) ringFg.style.strokeDashoffset = offset;
    const pctVal = $('#ringCenterPct');
    if (pctVal) pctVal.textContent = `${digits(pct)}%`;
    const metaSub = $('#ringMetaSub');
    if (metaSub) {
      metaSub.textContent = t('habits.completedToday', {
        done: digits(completed),
        total: digits(scheduled),
      });
    }

    const veloPill = $('#heroVelocityPill');
    if (veloPill) {
      if (pct === 100) {
        veloPill.textContent = isEn ? '🎉 All Done!' : '🎉 مكتمل كلياً';
        veloPill.className = 'hero-velocity-pill done';
      } else if (pct >= 50) {
        veloPill.textContent = isEn ? '⚡ Momentum' : '⚡ متسارع';
        veloPill.className = 'hero-velocity-pill momentum';
      } else if (pct > 0) {
        veloPill.textContent = isEn ? '🌱 In Progress' : '🌱 قيد الإنجاز';
        veloPill.className = 'hero-velocity-pill in-progress';
      } else {
        veloPill.textContent = isEn ? '🚀 Ready' : '🚀 مستعد';
        veloPill.className = 'hero-velocity-pill ready';
      }
    }

    const pBar = $('#todayProgressBar');
    if (pBar) pBar.style.width = `${pct}%`;

    const showProgressBar = state.settings?.showProgressBar !== false;
    const pWrap = $('#habitsProgressWrap');
    const rWrap = $('#habitsRingWrap');
    const heroPurpose = $('#heroPurposeCard');
    if (heroPurpose) heroPurpose.style.display = 'none';

    if (!showProgressBar) {
      if (pWrap) pWrap.style.display = 'none';
      if (rWrap) rWrap.style.display = 'none';
    } else {
      if (pWrap) pWrap.style.display = 'block';
      if (rWrap) rWrap.style.display = 'none';
    }

    // Daily Mindset Spark Banner
    renderMindsetSpark();

    // Gamification Pill
    renderGamificationPill();

    // 2. Interactive Week Strip & History Banner
    renderWeekStrip();
    updateHistoryBanner();

    // 3. Mini 7-Day Matrix Strip
    renderMiniStrip();

    // 4. Habits List
    renderHabitsList();

    // 4b. The Living Atlas: Haven Mini Bar & Ambient Miro Companion
    renderAtlasMiniBar();

    // 5. Quick Footer (Mood & Sleep)
    renderFooter();

    // 6. Mini Bujo Matrix
    if (state.currentView === 'mini-bujo') renderMiniBujo();

    // 7. Mini Sleep & Mood Lab
    if (state.currentView === 'mini-sleep') renderMiniSleep();
  }

  function updateHistoryBanner() {
    const banner = $('#habitsHistoryBanner');
    const label = $('#habitsHistoryLabel');
    if (!banner) return;
    const isEn = lang() === 'en';
    const sel = state.selectedDate || todayStr();
    if (sel !== todayStr()) {
      banner.style.display = 'flex';
      if (label) {
        label.textContent = isEn ? `Viewing history for ${sel}` : `عرض سجل يوم ${sel}`;
      }
    } else {
      banner.style.display = 'none';
    }
  }

  function renderWeekStrip() {
    const container = $('#habitsWeekStrip');
    if (!container) return;
    container.innerHTML = '';
    const isEn = lang() === 'en';

    const dayAbbrAr = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
    const dayAbbrEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const today = new Date();
    const wStartSetting = state.settings?.weekStart || (isEn ? 'sun' : 'sat');
    const startDay = wStartSetting === 'sun' ? 0 : (wStartSetting === 'mon' ? 1 : 6);
    const weekStart = new Date(today);
    const diff = (today.getDay() - startDay + 7) % 7;
    weekStart.setDate(today.getDate() - diff);

    const selectedDate = state.selectedDate || todayStr();
    const activeHabits = (state.habits || []).filter(h => !h.archived);

    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const dStr = formatLocalDate(d);
      const isToday = dStr === todayStr();
      const isSelected = dStr === selectedDate;
      const isFuture = dStr > todayStr();
      const dayLog = state.logs[dStr];

      let doneCount = 0;
      let totalCount = 0;
      if (activeHabits.length) {
        for (const h of activeHabits) {
          const hl = dayLog?.habits?.[h.id];
          if (hl && hl.status === 'skip') continue;
          totalCount++;
          if (hl && (hl.status === 'done' || (hl.status === 'partial' && Number(hl.value) >= (Number(h.targetValue) || 1)))) {
            doneCount++;
          }
        }
      }

      const isAllDone = totalCount > 0 && doneCount === totalCount;
      const isPartDone = totalCount > 0 && doneCount > 0 && !isAllDone;

      const capsule = document.createElement('button');
      capsule.type = 'button';
      capsule.className = `week-strip-capsule${isSelected ? ' is-selected' : ''}${isToday ? ' is-today' : ''}${isFuture ? ' is-future' : ''}`;
      capsule.dataset.date = dStr;

      const dayName = isEn ? dayAbbrEn[d.getDay()] : dayAbbrAr[d.getDay()];
      const dayNum = digits(d.getDate());

      capsule.innerHTML = `
        <span class="capsule-day-name">${dayName}</span>
        <span class="capsule-day-num">${dayNum}</span>
        <span class="capsule-dot${isAllDone ? ' dot-full' : (isPartDone ? ' dot-part' : '')}"></span>
      `;

      if (isFuture) {
        capsule.title = isEn ? 'Future dates are locked' : 'الأيام القادمة مقفلة';
      } else {
        capsule.title = `${dStr}: ${digits(doneCount)}/${digits(totalCount)}`;
        capsule.addEventListener('click', () => {
          state.selectedDate = dStr;
          renderWeekStrip();
          renderHabitsList();
          updateHistoryBanner();
        });
      }

      container.appendChild(capsule);
    }
  }

  let indicatorInitialized = false;
  function updateHabitsViewIndicator(immediate = false) {
    const sel = document.getElementById('viewPillsRow');
    const ind = document.getElementById('habitsViewIndicator');
    if (!sel || !ind) return;
    const activeBtn = sel.querySelector('.view-pill-btn.active');
    if (!activeBtn) {
      ind.style.opacity = '0';
      return;
    }
    const w = activeBtn.offsetWidth;
    const h = activeBtn.offsetHeight;
    let left = activeBtn.offsetLeft;
    let top = activeBtn.offsetTop;

    if (activeBtn.offsetParent !== sel) {
      const selRect = sel.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();
      left = btnRect.left - selRect.left;
      top = btnRect.top - selRect.top;
    }

    if (w === 0 || h === 0) {
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(() => updateHabitsViewIndicator(immediate));
      }
      return;
    }

    const snap = immediate || !indicatorInitialized;
    if (snap) {
      ind.style.transition = 'none';
      ind.style.width = `${w}px`;
      ind.style.height = `${h}px`;
      ind.style.transform = `translate3d(${left}px, ${top}px, 0)`;
      ind.style.opacity = '1';
      void ind.offsetHeight;
      ind.style.transition = '';
      indicatorInitialized = true;
      return;
    }

    ind.style.transition = '';
    ind.style.opacity = '1';
    ind.style.width = `${w}px`;
    ind.style.height = `${h}px`;
    ind.style.transform = `translate3d(${left}px, ${top}px, 0)`;
  }

  function switchView(viewName) {
    state.currentView = viewName;
    try { localStorage.setItem('mirqat_habits_current_view', viewName); } catch (_) {}
    $$('#viewPillsRow .view-pill-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });
    updateHabitsViewIndicator(false);

    const panelChecklist = $('#viewPanelChecklist');
    const panelBujo = $('#viewPanelBujo');
    const panelSleep = $('#viewPanelSleep');

    if (panelChecklist) {
      panelChecklist.classList.toggle('active', viewName === 'checklist');
      panelChecklist.style.display = viewName === 'checklist' ? 'flex' : 'none';
    }
    if (panelBujo) {
      panelBujo.classList.toggle('active', viewName === 'mini-bujo');
      panelBujo.style.display = viewName === 'mini-bujo' ? 'flex' : 'none';
    }
    if (panelSleep) {
      panelSleep.classList.toggle('active', viewName === 'mini-sleep');
      panelSleep.style.display = viewName === 'mini-sleep' ? 'flex' : 'none';
    }

    if (viewName === 'mini-bujo') renderMiniBujo();
    else if (viewName === 'mini-sleep') renderMiniSleep();
  }

  function cycleView(direction = 1) {
    const views = ['checklist', 'mini-bujo', 'mini-sleep'];
    const idx = views.indexOf(state.currentView);
    let nextIdx = (idx + direction + views.length) % views.length;
    switchView(views[nextIdx]);
  }

  function renderMiniBujo() {
    const table = $('#miniBujoTable');
    if (!table) return;
    table.innerHTML = '';

    const isEn = lang() === 'en';
    const activeHabits = (state.habits || []).filter(h => !h.archived);
    const today = todayStr();
    const curMonth = state.bujoMonth || today.slice(0, 7);

    const [yStr, mStr] = curMonth.split('-');
    const year = Number(yStr);
    const month = Number(mStr);
    const monthNamesAr = ['', 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const monthNamesEn = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthTitle = $('#miniBujoMonthTitle');
    if (monthTitle) {
      monthTitle.textContent = isEn ? `${monthNamesEn[month]} ${year}` : `${monthNamesAr[month]} ${digits(year)}`;
    }

    const totalDays = new Date(year, month, 0).getDate();

    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');

    const thHabit = document.createElement('th');
    thHabit.className = 'mini-bujo-habit-col';
    thHabit.textContent = isEn ? 'Habits' : 'العادات';
    trHead.appendChild(thHabit);

    for (let day = 1; day <= totalDays; day++) {
      const dayPad = String(day).padStart(2, '0');
      const dateStr = `${curMonth}-${dayPad}`;
      const isToday = dateStr === today;
      const isFuture = dateStr > today;

      const th = document.createElement('th');
      th.textContent = digits(day);
      if (isToday) th.classList.add('is-today');
      if (isFuture) th.classList.add('is-future');
      trHead.appendChild(th);
    }
    thead.appendChild(trHead);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    activeHabits.forEach(h => {
      const tr = document.createElement('tr');

      const tdHabit = document.createElement('td');
      tdHabit.className = 'mini-bujo-habit-col';
      tdHabit.innerHTML = `<span class="mini-bujo-habit-ico" style="color: ${h.color || '#3b82f6'}; margin-inline-end: 4px; display: inline-flex; align-items: center; vertical-align: middle;">${getHabitIconSvg(h.icon, isEn && h.titleEn ? h.titleEn : h.title, h.color)}</span> <span>${isEn && h.titleEn ? h.titleEn : h.title}</span>`;
      tdHabit.title = isEn && h.titleEn ? h.titleEn : h.title;
      tr.appendChild(tdHabit);

      for (let day = 1; day <= totalDays; day++) {
        const dayPad = String(day).padStart(2, '0');
        const dateStr = `${curMonth}-${dayPad}`;
        const isToday = dateStr === today;
        const isFuture = dateStr > today;

        const td = document.createElement('td');
        const dLog = state.logs[dateStr];
        const hLog = dLog && dLog.habits && dLog.habits[h.id];
        const status = hLog ? hLog.status : 'none';

        const btn = document.createElement('button');
        btn.className = `mini-cell-btn ${status}`;
        if (isFuture) btn.classList.add('future-disabled');

        if (status === 'done') btn.textContent = getThemeDoneGlyph();
        else if (status === 'partial') btn.textContent = '½';
        else if (status === 'skip') btn.textContent = '⏸️';

        if (isFuture) {
          btn.textContent = '🔒';
          btn.title = isEn ? 'Future dates are locked' : '🔒 لا يمكن تسجيل الأيام القادمة';
          btn.disabled = true;
        } else {
          btn.title = `${dateStr} - ${h.title}: ${status}`;
          btn.onclick = async (e) => {
            e.stopPropagation();
            let nextStatus = 'done';
            let nextVal = 1;
            if (status === 'done') { nextStatus = 'partial'; nextVal = 0.5; }
            else if (status === 'partial') { nextStatus = 'skip'; nextVal = 0; }
            else if (status === 'skip') { nextStatus = 'none'; nextVal = 0; }
            else { nextStatus = 'done'; nextVal = 1; }

            await saveStatus(h.id, nextStatus, nextVal, dateStr);
            renderMiniBujo();
          };
        }

        td.appendChild(btn);
        tr.appendChild(td);
      }

      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    // Render Inspiring Bento Hub (Milestone Hero + Habit Streaks Bento + Monthly Heatmap)
    renderBujoBentoHub(activeHabits, curMonth, year, month, totalDays, today);
  }

  function renderBujoBentoHub(activeHabits, curMonth, year, month, totalDays, today) {
    const isEn = lang() === 'en';
    const streak = getOverallStreak();
    const bestRecord = Math.max(streak, state.gamification?.bestStreak || streak);

    // 1. Milestone Hero
    const heroStreakNum = $('#bujoBigStreakNum') || $('#bujoHeroStreakNum');
    if (heroStreakNum) heroStreakNum.textContent = digits(streak);

    const steps = [
      { id: 'mStep7', line: 'mLine7', target: 7 },
      { id: 'mStep14', line: 'mLine14', target: 14 },
      { id: 'mStep21', line: 'mLine21', target: 21 },
      { id: 'mStep30', line: null, target: 30 },
    ];
    for (const step of steps) {
      const stepEl = document.getElementById(step.id);
      if (stepEl) stepEl.classList.toggle('reached', streak >= step.target);
      if (step.line) {
        const lineEl = document.getElementById(step.line);
        if (lineEl) lineEl.classList.toggle('active', streak >= step.target);
      }
    }

    // 2. Individual Habit Streaks Bento Grid (Reference Image 2)
    const streaksGrid = $('#bentoHabitStreaksGrid');
    if (streaksGrid) {
      streaksGrid.innerHTML = '';
      activeHabits.forEach(h => {
        const hStreak = calculateStreak(h.id);
        const card = document.createElement('div');
        card.className = 'bento-streak-card';
        if (card.style?.setProperty) card.style.setProperty('--h-color', h.color || 'var(--accent, #3b82f6)');

        const head = document.createElement('div');
        head.className = 'bento-streak-head';
        const icon = document.createElement('span');
        icon.className = 'bento-streak-icon';
        icon.innerHTML = getHabitIconSvg(h.icon, isEn && h.titleEn ? h.titleEn : h.title, h.color);
        icon.style.color = h.color || '#3b82f6';
        icon.style.backgroundColor = `color-mix(in srgb, ${h.color || '#3b82f6'} 18%, transparent)`;
        const title = document.createElement('span');
        title.className = 'bento-streak-title';
        title.textContent = isEn && h.titleEn ? h.titleEn : h.title;
        head.appendChild(icon);
        head.appendChild(title);

        const body = document.createElement('div');
        body.className = 'bento-streak-body';
        const count = document.createElement('span');
        count.className = 'bento-streak-count';
        count.textContent = digits(hStreak);
        const unit = document.createElement('span');
        unit.className = 'bento-streak-unit';
        unit.textContent = isEn ? 'DAY STREAK' : 'يوم استمرار';
        body.appendChild(count);
        body.appendChild(unit);

        // 7 mini dots
        const dotsRow = document.createElement('div');
        dotsRow.className = 'bento-streak-dots';
        const todayD = new Date();
        for (let i = 6; i >= 0; i--) {
          const d = new Date(todayD);
          d.setDate(d.getDate() - i);
          const dStr = formatLocalDate(d);
          const hl = state.logs[dStr]?.habits?.[h.id];
          const st = hl ? hl.status : 'none';
          const dot = document.createElement('div');
          dot.className = `bento-dot ${st}`;
          dotsRow.appendChild(dot);
        }

        card.appendChild(head);
        card.appendChild(body);
        card.appendChild(dotsRow);
        streaksGrid.appendChild(card);
      });
    }

    // 3. Monthly Calendar Heatmap
    const heatmapGrid = $('#bujoCalendarHeatmap');
    if (heatmapGrid) {
      heatmapGrid.innerHTML = '';
      const dayHeadersAr = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];
      const dayHeadersEn = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      const headers = isEn ? dayHeadersEn : dayHeadersAr;

      const theadRow = document.createElement('div');
      theadRow.className = 'bujo-heat-head-row';
      headers.forEach(hText => {
        const hCell = document.createElement('div');
        hCell.className = 'bujo-heat-th';
        hCell.textContent = hText;
        theadRow.appendChild(hCell);
      });
      heatmapGrid.appendChild(theadRow);

      const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0 is Sunday
      const matrixRow = document.createElement('div');
      matrixRow.className = 'bujo-heat-matrix';

      // Empty lead-in pads
      for (let p = 0; p < firstDayOfWeek; p++) {
        const pad = document.createElement('div');
        pad.className = 'heat-cell empty-pad';
        matrixRow.appendChild(pad);
      }

      for (let day = 1; day <= totalDays; day++) {
        const dayPad = String(day).padStart(2, '0');
        const dateStr = `${curMonth}-${dayPad}`;
        const isToday = dateStr === today;
        const isFuture = dateStr > today;

        let doneCount = 0;
        let totalCount = 0;
        if (activeHabits.length) {
          const dLog = state.logs[dateStr];
          for (const h of activeHabits) {
            const hl = dLog?.habits?.[h.id];
            if (hl && hl.status === 'skip') continue;
            totalCount++;
            if (hl && (hl.status === 'done' || (hl.status === 'partial' && Number(hl.value) >= (Number(h.targetValue) || 1)))) {
              doneCount++;
            }
          }
        }

        const pct = totalCount > 0 ? (doneCount / totalCount) : 0;
        let level = 0;
        if (pct >= 0.67) level = 3;
        else if (pct >= 0.34) level = 2;
        else if (pct > 0) level = 1;

        const cell = document.createElement('div');
        cell.className = `heat-cell level-${level}${isToday ? ' is-today' : ''}${isFuture ? ' is-future' : ''}`;
        cell.textContent = digits(day);
        cell.title = isFuture ? (isEn ? 'Future locked' : 'أيام قادمة') : `${dateStr}: ${digits(doneCount)}/${digits(totalCount)}`;
        matrixRow.appendChild(cell);
      }
      heatmapGrid.appendChild(matrixRow);
    }
  }

  function renderMiniSleep() {
    const isEn = lang() === 'en';
    const selDate = state.sleepSelectedDate || todayStr();
    const today = todayStr();

    const dateDisp = $('#miniSleepDateDisplay');
    if (dateDisp) {
      if (selDate === today) dateDisp.textContent = isEn ? 'Today' : 'اليوم';
      else dateDisp.textContent = digits(selDate);
    }

    const nextBtn = $('#btnSleepNextDay');
    if (nextBtn) {
      nextBtn.disabled = selDate >= today;
    }

    const dayLog = state.logs[selDate] || {};
    const sleep = dayLog.sleep || { durationHours: 7.5, quality: 4 };
    const mood = dayLog.mood || { rating: 4 };

    const hrsVal = $('#miniSleepHoursVal');
    if (hrsVal) {
      const dur = Number(sleep.durationHours) || 7.5;
      hrsVal.innerHTML = `${digits(dur)} <span class="unit-hrs">${isEn ? 'hrs' : 'ساعة'}</span>`;
    }

    const curQuality = Number(sleep.quality) || 3;
    $$('#miniSleepStars .q-star').forEach(st => {
      const sNum = Number(st.dataset.star);
      st.classList.toggle('active', sNum <= curQuality);
    });

    const curMood = Number(mood.rating) || 0;
    $$('#miniMoodRow .mini-mood-btn').forEach(b => {
      const rNum = Number(b.dataset.rating);
      b.classList.toggle('active', rNum === curMood);
    });

    const sparkWrap = $('#miniSleepSparkline');
    if (sparkWrap) {
      sparkWrap.innerHTML = '';
      const dayLettersAr = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];
      const dayLettersEn = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      const letters = isEn ? dayLettersEn : dayLettersAr;
      const refDate = new Date();

      for (let i = 6; i >= 0; i--) {
        const d = new Date(refDate);
        d.setDate(d.getDate() - i);
        const dStr = formatLocalDate(d);
        const dLog = state.logs[dStr];
        const dHours = (dLog && dLog.sleep && Number(dLog.sleep.durationHours)) || 0;
        const col = document.createElement('div');
        col.className = 'spark-bar-col';
        col.title = `${dStr}: ${digits(dHours)} ${isEn ? 'hrs' : 'ساعة'}`;

        const fill = document.createElement('div');
        fill.className = `spark-bar-fill ${dHours >= 7 ? 'good' : (dHours > 0 ? 'low' : '')}`;
        const pctHeight = Math.min(100, Math.round((dHours / 10) * 100));
        fill.style.height = `${pctHeight}%`;

        const lbl = document.createElement('span');
        lbl.className = 'spark-bar-lbl';
        lbl.textContent = letters[d.getDay()];

        col.appendChild(fill);
        col.appendChild(lbl);
        sparkWrap.appendChild(col);
      }
    }
  }

  function renderMiniStrip() {
    const stripWrap = $('#miniStrip');
    const showMiniStrip = state.settings?.showMiniStrip !== false;
    if (stripWrap) stripWrap.style.display = showMiniStrip ? 'flex' : 'none';
    if (!showMiniStrip) return;

    const container = $('#miniStripDays');
    if (!container) return;
    container.innerHTML = '';

    const dayLettersAr = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];
    const dayLettersEn = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const letters = lang() === 'en' ? dayLettersEn : dayLettersAr;

    const today = new Date();
    const activeHabits = (state.habits || []).filter(h => !h.archived);

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dStr = formatLocalDate(d);
      const isToday = i === 0;

      const log = state.logs[dStr];
      let scheduled = 0;
      let completed = 0;

      if (log && log.habits) {
        for (const h of activeHabits) {
          const hLog = log.habits[h.id];
          if (hLog && hLog.status === 'skip') continue;
          scheduled++;
          if (hLog && hLog.status === 'done') completed++;
        }
      }

      const rate = scheduled > 0 ? completed / scheduled : 0;
      let dotClass = '';
      if (rate >= 0.8) dotClass = 'full';
      else if (rate >= 0.4) dotClass = 'half';

      const col = document.createElement('div');
      col.className = 'mini-dot-col';
      col.title = `${dStr}: ${Math.round(rate * 100)}%`;

      const lbl = document.createElement('span');
      lbl.className = 'mini-dot-name';
      lbl.textContent = letters[d.getDay()];

      const dot = document.createElement('span');
      dot.className = `mini-dot ${isToday ? 'is-today' : ''} ${dotClass}`;
      dot.textContent = rate >= 0.8 ? '✓' : (rate >= 0.4 ? '½' : '');

      col.appendChild(lbl);
      col.appendChild(dot);
      container.appendChild(col);
    }
  }

  function renderHabitsList() {
    const listEl = $('#habitsList');
    if (!listEl) return;
    listEl.innerHTML = '';

    const density = state.cardDensity || state.settings?.cardDensity || 'compact';
    listEl.classList.remove('density-comfortable', 'density-compact', 'density-minimal');
    listEl.classList.add(`density-${density}`);

    const activeHabits = (state.habits || []).filter(h => !h.archived);

    const showRoutines = state.settings?.showRoutineFilters !== false;
    const rTabs = $('#routineFilterBar') || $('#routineTabs');
    if (rTabs) rTabs.style.display = showRoutines ? 'flex' : 'none';

    // Filter by routine
    let filtered = (!showRoutines || state.activeRoutine === 'all')
      ? activeHabits
      : activeHabits.filter(h => (h.routine || 'anytime') === state.activeRoutine);

    // Filter by View Status filter
    const sFilter = state.viewStatusFilter || state.settings?.statusFilter || 'all';
    const dayLog = getTodayLog();

    if (sFilter === 'pending') {
      filtered = filtered.filter(h => {
        const hl = dayLog.habits && dayLog.habits[h.id];
        return !hl || (hl.status !== 'done' && hl.status !== 'skip');
      });
    } else if (sFilter === 'done') {
      filtered = filtered.filter(h => {
        const hl = dayLog.habits && dayLog.habits[h.id];
        return hl && (hl.status === 'done' || (hl.status === 'partial' && Number(hl.value) >= (Number(h.targetValue) || 1)));
      });
    } else if (sFilter === 'negative') {
      filtered = filtered.filter(h => h.direction === 'negative');
    }

    // Sort Order
    const sortOrder = state.sortOrder || state.settings?.sortOrder || 'manual';
    if (sortOrder === 'priority') {
      filtered.sort((a, b) => (Number(b.todoPriority ?? 0) - Number(a.todoPriority ?? 0)));
    } else if (sortOrder === 'streak') {
      filtered.sort((a, b) => calculateStreak(b.id) - calculateStreak(a.id));
    } else if (sortOrder === 'strength') {
      filtered.sort((a, b) => calculateHabitStrength(b.id) - calculateHabitStrength(a.id));
    } else if (sortOrder === 'title') {
      const isEn = lang() === 'en';
      filtered.sort((a, b) => {
        const tA = (isEn && a.titleEn ? a.titleEn : a.title) || '';
        const tB = (isEn && b.titleEn ? b.titleEn : b.title) || '';
        return tA.localeCompare(tB);
      });
    }

    if (filtered.length === 0) {
      const emptyWrap = document.createElement('div');
      emptyWrap.className = 'habits-empty-state';

      const isFiltered = (state.activeRoutine !== 'all' || sFilter !== 'all') && activeHabits.length > 0;
      let emptyTitle = t('habits.emptyTitle');
      let emptyDesc = t('habits.emptyDesc');

      if (isFiltered) {
        emptyTitle = t('habits.emptyFilter');
        emptyDesc = t('habits.emptyFilterDesc');
      }

      emptyWrap.innerHTML = `
        <div class="habits-empty-icon">${isFiltered ? '🔍' : '🌱'}</div>
        <div class="habits-empty-title">${emptyTitle}</div>
        <div class="habits-empty-desc">${emptyDesc}</div>
        ${isFiltered ? `<button class="btn-empty-add btn-reset-filter" id="btnResetFilter">🔄 ${t('habits.resetFilter')}</button>` : `<button class="btn-empty-add" id="btnEmptyAdd">${t('habits.addFirstHabit')}</button>`}
      `;
      listEl.appendChild(emptyWrap);

      $('#btnResetFilter')?.addEventListener('click', () => {
        state.activeRoutine = 'all';
        state.viewStatusFilter = 'all';
        $$('.routine-chip').forEach(b => b.classList.toggle('active', b.dataset.routine === 'all'));
        $$('#popoverStatusFilter .seg-btn').forEach(b => b.classList.toggle('active', b.dataset.filter === 'all'));
        persistHabitSettings({ statusFilter: 'all' });
        renderHabitsList();
      });

      $('#btnEmptyAdd')?.addEventListener('click', () => openQuickAddModal());
      return;
    }

    filtered.forEach(h => {
      const hLog = dayLog.habits && dayLog.habits[h.id];
      const status = hLog ? hLog.status : 'none';
      const curVal = hLog && hLog.value !== undefined && hLog.value !== null ? Number(hLog.value) : 0;
      const target = Number(h.targetValue) || 1;

      const card = document.createElement('div');
      card.className = `habit-card ${status === 'done' ? 'is-done' : ''} ${status === 'skip' ? 'is-skipped' : ''}`;
      card.style.borderInlineStartColor = h.color || 'var(--accent, #3b82f6)';
      card.dataset.id = h.id;

      // Icon
      const iconBox = document.createElement('div');
      iconBox.className = 'h-icon-box';
      iconBox.innerHTML = getHabitIconSvg(h.icon, lang() === 'en' && h.titleEn ? h.titleEn : h.title, h.color);
      if (iconBox.style?.setProperty) iconBox.style.setProperty('--h-color', h.color || '#3b82f6');

      // Info
      const info = document.createElement('div');
      info.className = 'h-info';

      const titleRow = document.createElement('div');
      titleRow.className = 'h-title-row';

      const title = document.createElement('span');
      title.className = 'h-title';
      title.textContent = lang() === 'en' && h.titleEn ? h.titleEn : h.title;
      titleRow.appendChild(title);

      if (h.direction === 'negative') {
        const breakerTag = document.createElement('span');
        breakerTag.className = 'habit-breaker-tag';
        breakerTag.textContent = t('habits.badHabitTag');
        titleRow.appendChild(breakerTag);
        card.classList.add('is-negative');
      }

      if (hLog && hLog.isMicroStep) {
        const microBadge = document.createElement('span');
        microBadge.className = 'h-micro-step-badge';
        microBadge.textContent = t('habits.microStepBadge');
        microBadge.title = t('habits.microStepTooltip');
        titleRow.appendChild(microBadge);
        card.classList.add('is-micro-step');
      }

      const subRow = document.createElement('div');
      subRow.className = 'h-target-sub';

      // Status / Target text
      let targetText = '';
      if (status === 'skip') {
        targetText = `⏸️ ${t('habits.skipped')}`;
      } else if (h.type === 'number' || h.type === 'duration') {
        const u = lang() === 'en' && h.unitEn ? h.unitEn : (h.unit || '');
        targetText = `${digits(curVal)} / ${digits(target)} ${u}`;
      } else if (h.type === 'percentage') {
        targetText = target === 100 ? `${digits(curVal)}%` : `${digits(curVal)}% / ${digits(target)}%`;
      } else if (h.type === 'rating') {
        targetText = curVal > 0 ? `${digits(curVal)} / 5 ⭐` : '—';
      }

      if (targetText) {
        const subSpan = document.createElement('span');
        subSpan.className = 'h-target-text';
        subSpan.textContent = targetText;
        subRow.appendChild(subSpan);
      }

      // Habit Strength Pill (if enabled)
      if (state.settings?.showStrength !== false) {
        const strVal = calculateHabitStrength(h.id);
        const strSpan = document.createElement('span');
        strSpan.className = 'h-strength-pill';
        strSpan.textContent = `⚡${digits(strVal)}%`;
        strSpan.title = t('habits.strength', { val: digits(strVal) });
        subRow.appendChild(strSpan);
      }

      // Dynamic Streak Badge with Heat Level (if enabled)
      if (state.settings?.showStreak !== false) {
        const streak = calculateStreak(h.id);
        const isExempt = status === 'skip';
        const streakBadge = document.createElement('span');
        let flameClass = 'ember';
        let flameIcon = '🔥';

        if (streak >= 21) {
          flameClass = 'mythic';
          flameIcon = '💎';
          streakBadge.title = t('habits.mythicHabit');
        } else if (streak >= 8) {
          flameClass = 'inferno';
          flameIcon = '🔥';
        } else if (streak >= 4) {
          flameClass = 'fire';
          flameIcon = '🔥';
        } else if (streak >= 1) {
          flameClass = 'spark';
          flameIcon = '🔥';
        } else {
          flameClass = 'ember';
        }

        if (isExempt) {
          streakBadge.className = 'h-streak-badge shield-preserved';
          streakBadge.innerHTML = `<span class="streak-shield">🛡️</span> ${digits(streak)}`;
          streakBadge.title = t('habits.streakPreserved');
        } else {
          streakBadge.className = `h-streak-badge ${streak === 0 ? 'muted' : ''}`;
          streakBadge.innerHTML = `<span class="streak-flame ${flameClass}">${flameIcon}</span> ${digits(streak)}`;
        }
        subRow.appendChild(streakBadge);
      }

      // Urgency / Overdue Pill (OpenHabitTracker - Streak Guilt Eliminator)
      const showUrgency = (state.settings?.showUrgency !== false) && (state.allSettings?.habits?.showUrgency !== false);
      const urgScore = calculateUrgencyScore(h.id);
      if (showUrgency && urgScore >= 50 && status !== 'done' && status !== 'skip') {
        const urgPill = document.createElement('span');
        const isOverdue = urgScore >= 80;
        urgPill.className = `h-urgency-pill ${isOverdue ? 'overdue' : 'due-today'}`;
        urgPill.textContent = `${isOverdue ? '⚠️' : '⏰'} ${digits(urgScore)}%`;
        urgPill.title = isOverdue
          ? (lang() === 'en' ? 'Urgent & Overdue!' : 'عاجل ومتأخر عن موعده!')
          : (lang() === 'en' ? 'Due Today' : 'مستحق اليوم');
        subRow.appendChild(urgPill);
      }

      // WhatsApp Reminder Pill
      if (h.reminderEnabled && h.reminderTime) {
        const waPill = document.createElement('span');
        waPill.className = 'h-wa-reminder-pill';
        waPill.innerHTML = `💬 <span>${digits(h.reminderTime)}</span>`;
        waPill.title = lang() === 'en'
          ? `WhatsApp Reminder scheduled for ${h.reminderTime}`
          : `تذكير واتساب مجدول لهذه العادة الساعة ${digits(h.reminderTime)}`;
        subRow.appendChild(waPill);
      }

      // Atomic Checklist Sub-Items Toggle (OpenHabitTracker)
      if (h.subItems && h.subItems.length > 0) {
        const todaySubItems = (hLog && Array.isArray(hLog.subItems)) ? hLog.subItems : (h.subItems || []).map(si => ({ ...si, completed: false }));
        const completedSubCount = todaySubItems.filter(si => si.completed).length;
        const totalSubCount = todaySubItems.length;

        const subToggleBtn = document.createElement('button');
        subToggleBtn.type = 'button';
        subToggleBtn.className = 'h-subitems-toggle-btn';
        subToggleBtn.innerHTML = `📋 <span>${digits(completedSubCount)}/${digits(totalSubCount)}</span>`;
        subToggleBtn.title = lang() === 'en' ? 'View/toggle sub-steps' : 'عرض خطوات العادة الصغرى';
        subToggleBtn.onclick = (e) => {
          e.stopPropagation();
          if (expandedSubItemsHabitIds.has(h.id)) {
            expandedSubItemsHabitIds.delete(h.id);
          } else {
            expandedSubItemsHabitIds.add(h.id);
          }
          renderHabitsList();
        };
        subRow.appendChild(subToggleBtn);
      }

      info.appendChild(titleRow);
      info.appendChild(subRow);

      // Expandable Sub-Items Checklist Box
      if (h.subItems && h.subItems.length > 0 && expandedSubItemsHabitIds.has(h.id)) {
        const todaySubItems = (hLog && Array.isArray(hLog.subItems)) ? hLog.subItems : (h.subItems || []).map(si => ({ ...si, completed: false }));
        const subItemsWrap = document.createElement('div');
        subItemsWrap.className = 'h-card-subitems-wrap';
        todaySubItems.forEach((si, idx) => {
          const sRow = document.createElement('div');
          sRow.className = 'h-card-subitem-row';
          const sChk = document.createElement('input');
          sChk.type = 'checkbox';
          sChk.checked = Boolean(si.completed);
          sChk.onclick = async (e) => {
            e.stopPropagation();
            const updated = todaySubItems.map((item, i) => i === idx ? { ...item, completed: sChk.checked } : item);
            if (window.widgets?.habits?.saveSubItems) {
              const res = await window.widgets.habits.saveSubItems(todayStr(), h.id, updated);
              if (res && res.ratio === 1) {
                triggerConfetti(e.clientX, e.clientY);
                playChime('check');
              }
              await loadState();
            }
          };
          const sTitle = document.createElement('span');
          sTitle.className = `h-card-subitem-title ${si.completed ? 'completed' : ''}`;
          sTitle.textContent = lang() === 'en' && si.titleEn ? si.titleEn : si.title;
          sRow.appendChild(sChk);
          sRow.appendChild(sTitle);
          subItemsWrap.appendChild(sRow);
        });
        info.appendChild(subItemsWrap);
      }

      // Action Slot
      const actionSlot = document.createElement('div');
      actionSlot.className = 'h-action-slot';

      // 1-Click Micro-Step Button (2-Minute Rule)
      if (status !== 'done' && status !== 'skip') {
        const microBtn = document.createElement('button');
        microBtn.type = 'button';
        microBtn.className = 'h-micro-step-btn';
        microBtn.textContent = '⚡';
        microBtn.title = t('habits.microStepTooltip');
        microBtn.onclick = async (e) => {
          e.stopPropagation();
          microBtn.classList.add('spring-pop');
          setTimeout(() => microBtn.classList.remove('spring-pop'), 400);
          triggerConfetti(e.clientX, e.clientY);
          playChime('check');
          await saveStatus(h.id, 'done', 1, null, true);
        };
        actionSlot.appendChild(microBtn);
      }

      if (h.timerMode) {
        // OpenHabitTracker: Embedded Live Stopwatch Mode
        const timerState = activeStopwatches[h.id];
        const isRunning = Boolean(timerState?.intervalId);
        if (isRunning) card.classList.add('is-timer-running');

        const stopwatchWrap = document.createElement('div');
        stopwatchWrap.className = 'h-stopwatch-widget';

        const timeDisplay = document.createElement('span');
        timeDisplay.className = 'h-stopwatch-display';
        const elapsedSec = timerState?.elapsedSeconds || (curVal * 60);
        const formatTime = (sec) => {
          const m = Math.floor(sec / 60);
          const s = sec % 60;
          return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        };
        timeDisplay.textContent = formatTime(elapsedSec);

        const playBtn = document.createElement('button');
        playBtn.type = 'button';
        playBtn.className = `h-stopwatch-play-btn ${isRunning ? 'running' : ''}`;
        playBtn.textContent = isRunning ? '⏸️' : '▶️';
        playBtn.title = isRunning ? 'إيقاف مؤقت' : 'بدء المؤقت';
        playBtn.onclick = (e) => {
          e.stopPropagation();
          if (isRunning) {
            clearInterval(timerState.intervalId);
            timerState.intervalId = null;
            renderHabitsList();
          } else {
            if (!activeStopwatches[h.id]) {
              activeStopwatches[h.id] = { elapsedSeconds: curVal * 60, intervalId: null };
            }
            activeStopwatches[h.id].intervalId = setInterval(() => {
              activeStopwatches[h.id].elapsedSeconds++;
              const dEl = card.querySelector('.h-stopwatch-display');
              if (dEl) dEl.textContent = formatTime(activeStopwatches[h.id].elapsedSeconds);
            }, 1000);
            renderHabitsList();
          }
        };

        const stopBtn = document.createElement('button');
        stopBtn.type = 'button';
        stopBtn.className = 'h-stopwatch-save-btn';
        stopBtn.textContent = '✓';
        stopBtn.title = 'حفظ الدقائق وتحديث الحالة';
        stopBtn.onclick = async (e) => {
          e.stopPropagation();
          if (timerState?.intervalId) {
            clearInterval(timerState.intervalId);
          }
          const finalSeconds = timerState?.elapsedSeconds || 0;
          const finalMinutes = Math.max(1, Math.round(finalSeconds / 60));
          delete activeStopwatches[h.id];
          if (finalMinutes >= target && curVal < target) {
            triggerConfetti(e.clientX, e.clientY);
            playChime('check');
          }
          await saveStatus(h.id, finalMinutes >= target ? 'done' : 'partial', finalMinutes);
        };

        stopwatchWrap.appendChild(playBtn);
        stopwatchWrap.appendChild(timeDisplay);
        stopwatchWrap.appendChild(stopBtn);
        actionSlot.appendChild(stopwatchWrap);
      } else if (h.type === 'boolean') {
        const btn = document.createElement('button');
        btn.className = `h-check-btn ${status === 'done' ? 'checked' : ''}`;
        btn.innerHTML = getThemeDoneGlyph();
        btn.onclick = (e) => {
          e.stopPropagation();
          const now = Date.now();
          if (habitToggleLock.has(h.id) && now - habitToggleLock.get(h.id) < 320) return;
          habitToggleLock.set(h.id, now);
          const nextStatus = status === 'done' ? 'none' : 'done';
          const nextVal = nextStatus === 'done' ? 1 : 0;
          if (nextStatus === 'done') {
            btn.classList.add('spring-pop', 'checked');
            setTimeout(() => btn.classList.remove('spring-pop'), 400);
            triggerConfetti(e.clientX, e.clientY);
            playChime('check');
          } else {
            btn.classList.remove('checked');
          }
          saveStatus(h.id, nextStatus, nextVal);
        };
        actionSlot.appendChild(btn);
      } else if (h.type === 'number' || h.type === 'duration') {
        const stepper = document.createElement('div');
        stepper.className = 'h-stepper';

        const decBtn = document.createElement('button');
        decBtn.className = 'h-step-btn';
        decBtn.textContent = '−';
        decBtn.onclick = (e) => {
          e.stopPropagation();
          const step = h.type === 'duration' && target >= 30 ? 15 : 1;
          const next = Math.max(0, curVal - step);
          saveStatus(h.id, next >= target ? 'done' : (next > 0 ? 'partial' : 'none'), next);
        };

        const valSpan = document.createElement('span');
        valSpan.className = 'h-step-val';
        valSpan.textContent = digits(curVal);
        valSpan.title = 'اضغط لتعديل الرقم مباشرة';
        valSpan.onclick = (e) => {
          e.stopPropagation();
          const entered = prompt('أدخل القيمة:', curVal);
          if (entered !== null && !isNaN(entered)) {
            const next = Number(entered);
            if (next >= target && curVal < target) {
              stepper.classList.add('spring-pop');
              setTimeout(() => stepper.classList.remove('spring-pop'), 400);
              triggerConfetti(e.clientX, e.clientY);
              playChime('check');
            }
            saveStatus(h.id, next >= target ? 'done' : (next > 0 ? 'partial' : 'none'), next);
          }
        };

        const incBtn = document.createElement('button');
        incBtn.className = 'h-step-btn';
        incBtn.textContent = '+';
        incBtn.onclick = (e) => {
          e.stopPropagation();
          const step = h.type === 'duration' && target >= 30 ? 15 : 1;
          const next = curVal + step;
          if (next >= target && curVal < target) {
            stepper.classList.add('spring-pop');
            setTimeout(() => stepper.classList.remove('spring-pop'), 400);
            triggerConfetti(e.clientX, e.clientY);
            playChime('check');
          }
          saveStatus(h.id, next >= target ? 'done' : 'partial', next);
        };

        stepper.appendChild(decBtn);
        stepper.appendChild(valSpan);
        stepper.appendChild(incBtn);
        actionSlot.appendChild(stepper);
      } else if (h.type === 'percentage') {
        const target = Number(h.targetValue) || 100;
        const pctBtn = document.createElement('div');
        pctBtn.className = 'h-pct-btn';
        pctBtn.title = lang() === 'en' ? 'Click to advance percentage, or click number to enter exact value' : 'اضغط للتقدم بالنسبة، أو اضغط على الرقم لكتابة قيمة محددة';
        pctBtn.onclick = (e) => {
          e.stopPropagation();
          const step = target <= 50 ? 10 : 25;
          let next = curVal + step;
          if (curVal >= target) {
            next = 0;
          } else if (next > target) {
            next = target;
          }
          if (next >= target && curVal < target) {
            pctBtn.classList.add('spring-pop');
            setTimeout(() => pctBtn.classList.remove('spring-pop'), 400);
            triggerConfetti(e.clientX, e.clientY);
            playChime('check');
          }
          saveStatus(h.id, next >= target ? 'done' : (next > 0 ? 'partial' : 'none'), next);
        };

        const fill = document.createElement('div');
        fill.className = 'h-pct-fill';
        const fillPct = Math.min(100, Math.round((curVal / target) * 100));
        fill.style.width = `${fillPct}%`;
        fill.style.background = h.color || 'var(--accent, #3b82f6)';

        const txt = document.createElement('span');
        txt.className = 'h-pct-text';
        txt.textContent = `${digits(curVal)}%`;
        txt.onclick = (e) => {
          e.stopPropagation();
          const entered = prompt(lang() === 'en' ? `Enter percentage (0-${target}%):` : `أدخل النسبة (0-${digits(target)}%):`, curVal);
          if (entered !== null && !isNaN(entered)) {
            const next = Math.min(100, Math.max(0, Number(entered)));
            if (next >= target && curVal < target) {
              pctBtn.classList.add('spring-pop');
              setTimeout(() => pctBtn.classList.remove('spring-pop'), 400);
              triggerConfetti(e.clientX, e.clientY);
              playChime('check');
            }
            saveStatus(h.id, next >= target ? 'done' : (next > 0 ? 'partial' : 'none'), next);
          }
        };

        pctBtn.appendChild(fill);
        pctBtn.appendChild(txt);
        actionSlot.appendChild(pctBtn);
      } else if (h.type === 'rating') {
        const starGroup = document.createElement('div');
        starGroup.className = 'h-rating-group';
        for (let s = 1; s <= 5; s++) {
          const star = document.createElement('span');
          star.className = `h-star-dot ${curVal >= s ? 'active' : ''}`;
          star.textContent = '★';
          star.onclick = (e) => {
            e.stopPropagation();
            const next = curVal === s ? 0 : s;
            if (next >= 4 && curVal < 4) {
              starGroup.classList.add('spring-pop');
              setTimeout(() => starGroup.classList.remove('spring-pop'), 400);
              triggerConfetti(e.clientX, e.clientY);
              playChime('check');
            }
            saveStatus(h.id, next >= 4 ? 'done' : (next > 0 ? 'partial' : 'none'), next);
          };
          starGroup.appendChild(star);
        }
        actionSlot.appendChild(starGroup);
      }

      const showPomodoro = Boolean(h.enablePomodoro) && (state.settings?.showPomodoroShortcut !== false);
      if (showPomodoro) {
        const pomoBtn = document.createElement('button');
        pomoBtn.className = 'h-pomo-btn';
        pomoBtn.title = t('habits.startPomo');
        pomoBtn.textContent = '⏱️';
        pomoBtn.onclick = async (e) => {
          e.stopPropagation();
          try {
            if (window.widgets?.pomodoro?.act) {
              await window.widgets.pomodoro.act({ action: 'start' });
            }
          } catch {}
        };
        actionSlot.appendChild(pomoBtn);
      }

      // Context menu trigger
      const moreBtn = document.createElement('button');
      moreBtn.className = 'h-more-btn';
      moreBtn.innerHTML = '⋮';
      moreBtn.onclick = (e) => {
        e.stopPropagation();
        openContextMenu(e, h.id);
      };
      actionSlot.appendChild(moreBtn);

      // Right click context menu on card
      card.oncontextmenu = (e) => {
        e.preventDefault();
        openContextMenu(e, h.id);
      };

      card.onclick = (e) => {
        if (e.target.closest('button') || e.target.closest('.h-step-val') || e.target.closest('.h-star-dot') || e.target.closest('.h-stepper')) return;
        window.widgets?.win?.openHabitsDashboard?.({ habitId: h.id });
      };

      card.appendChild(iconBox);
      card.appendChild(info);
      card.appendChild(actionSlot);
      listEl.appendChild(card);
    });
  }

  /* ---------- The Living Atlas Desktop Mini Integration ---------- */

  function renderAtlasMiniBar() {
    const miniBar = $('#habitsAtlasMiniBar');
    if (!miniBar) return;

    const showBar = state.settings?.showAtlasBar !== false;
    miniBar.style.display = showBar ? 'flex' : 'none';
    if (!showBar) return;

    const atlas = state.atlas || {};
    const wayfinder = atlas.wayfinder || { level: 1, title: 'سائر الدرب', titleEn: 'Wayfinder', xp: 0, havenGold: 0, livingMaterials: { seedsOfLight: 0 } };
    const xpProgress = atlas.xpProgress || { currentXp: wayfinder.xp || 0, nextLevelXp: 100, progressPercent: 0 };
    const isEn = lang() === 'en';

    // Wayfinder Name Badge
    const nameEl = $('#habitsMiniWayfinderName');
    if (nameEl) nameEl.textContent = wayfinder.name || (isEn ? 'Wayfinder' : 'مستكشف الدرب');

    // Level Badge
    const lvlEl = $('#habitsMiniLevelBadge');
    if (lvlEl) lvlEl.textContent = `Lv.${digits(wayfinder.level || 1)}`;

    // Title
    const titleEl = $('#habitsMiniTitle');
    if (titleEl) titleEl.textContent = isEn ? (wayfinder.titleEn || wayfinder.title || 'Wayfinder') : (wayfinder.title || 'سائر الدرب');

    // Haven Gold & Seeds
    const goldEl = $('#habitsMiniGoldVal');
    if (goldEl) goldEl.textContent = digits(wayfinder.havenGold || 0);

    const seedsEl = $('#habitsMiniSeedsVal');
    if (seedsEl) seedsEl.textContent = digits(wayfinder.livingMaterials?.seedsOfLight || 0);

    // XP Track Fill
    const xpFill = $('#habitsMiniXpFill');
    if (xpFill) {
      const pct = Math.min(100, Math.max(0, xpProgress.progressPercent || 0));
      xpFill.style.width = `${pct}%`;
      const xpTrack = $('#habitsMiniXpTrack');
      if (xpTrack) {
        xpTrack.title = `${digits(xpProgress.currentXp || 0)} / ${digits(xpProgress.nextLevelXp || 100)} XP (${digits(pct)}%)`;
      }
    }

    // Mini Miro Avatar Glow & Mood State
    const avatar = $('#habitsMiniMiroAvatar');
    const miroState = atlas.miro?.state || 'peaceful';
    if (avatar) {
      avatar.dataset.state = miroState;
      if (miroState === 'celebrating') {
        avatar.style.borderColor = '#fbbf24';
        avatar.style.boxShadow = '0 0 14px rgba(251, 191, 36, 0.8), 0 0 6px #38bdf8';
      } else if (miroState === 'supportive') {
        avatar.style.borderColor = '#34d399';
        avatar.style.boxShadow = '0 0 12px rgba(52, 211, 153, 0.6)';
      } else {
        avatar.style.borderColor = 'rgba(56, 189, 248, 0.7)';
        avatar.style.boxShadow = '0 0 8px rgba(56, 189, 248, 0.45)';
      }
    }

    // Update Header Mini Mote as well
    const headerMote = $('#atlasMiniMiroMote');
    if (headerMote) {
      const speech = atlas.miro?.currentDialogue || (isEn ? "Step by step, the weave lights up." : "خطوة بخطوة... النسيج يضيء.");
      headerMote.title = `ميرو: ${speech}`;
    }
  }

  async function triggerFirstPendingMicroStep() {
    const dayLog = getTodayLog();
    const pendingHabits = (state.habits || []).filter(h => {
      if (h.archived) return false;
      const hLog = dayLog.habits && dayLog.habits[h.id];
      const status = hLog ? hLog.status : 'none';
      return status !== 'done' && status !== 'skip';
    });

    if (pendingHabits.length === 0) {
      alert(t('habits.noPendingHabit'));
      return;
    }

    // Pick first pending habit
    const target = pendingHabits[0];
    const targetVal = target.type === 'number' || target.type === 'duration' ? 1 : 1;
    await saveStatus(target.id, 'done', targetVal, null, true);
    triggerConfetti(window.innerWidth / 2, 70);
    playChime('check');

    // Show floating celebration
    showFloatingReward(`⚡ ${t('habits.microStepDone')}`);
  }

  function renderFooter() {
    const footerWrap = $('#habitsFooter');
    const showFooter = state.settings?.showFooterCheckin !== false;
    if (footerWrap) footerWrap.style.display = showFooter ? 'block' : 'none';
    if (!showFooter) return;

    const dayLog = getTodayLog();

    // Mood buttons active state
    const currentMood = dayLog.mood && dayLog.mood.rating ? dayLog.mood.rating : 0;
    $$('.mood-face-btn').forEach(btn => {
      const mVal = Number(btn.dataset.mood);
      btn.classList.toggle('active', mVal === currentMood);
    });

    // Sleep pill text
    const sleepValEl = $('#qcSleepVal');
    if (sleepValEl) {
      if (dayLog.sleep && dayLog.sleep.durationHours > 0) {
        sleepValEl.textContent = t('habits.sleepHoursLogged', { h: digits(dayLog.sleep.durationHours) });
      } else {
        sleepValEl.textContent = t('habits.logSleep');
      }
    }
  }

  /* ---------- Modals & Context Menu ---------- */

  function openContextMenu(e, habitId) {
    activeMenuHabitId = habitId;
    const menu = $('#habitContextMenu');
    if (!menu) return;

    menu.hidden = false;
    const x = Math.min(window.innerWidth - 180, Math.max(10, e.clientX || 50));
    const y = Math.min(window.innerHeight - 190, Math.max(10, e.clientY || 50));

    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
  }

  function closeContextMenu() {
    const menu = $('#habitContextMenu');
    if (menu) menu.hidden = true;
    activeMenuHabitId = null;
  }

  function openQuickAddModal() {
    const modal = $('#quickAddModal');
    if (!modal) return;
    modal.hidden = false;

    // Reset tabs to Presets first
    $('#qaTabPresetsBtn')?.classList.add('active');
    $('#qaTabCustomBtn')?.classList.remove('active');
    if ($('#qaPanePresets')) $('#qaPanePresets').style.display = 'block';
    if ($('#qaPaneCustom')) $('#qaPaneCustom').style.display = 'none';

    renderPresetsGrid();

    // Reset custom inputs
    if ($('#qaTitleInput')) $('#qaTitleInput').value = '';
    if ($('#qaTargetInput')) $('#qaTargetInput').value = '8';
    if ($('#qaUnitInput')) $('#qaUnitInput').value = 'كوب';
    if ($('#qaRoutineSelect')) $('#qaRoutineSelect').value = 'anytime';
    if ($('#qaDirectionSelect')) $('#qaDirectionSelect').value = 'positive';
    if ($('#qaDifficultySelect')) $('#qaDifficultySelect').value = 'easy';
    if ($('#qaPomodoroCheckbox')) $('#qaPomodoroCheckbox').checked = false;
    if ($('#qaSyncToTodo')) $('#qaSyncToTodo').checked = false;
    if ($('#qaTodoPrioRow')) $('#qaTodoPrioRow').style.display = 'none';
    qaTodoPriority = 1;
    $$('#qaTodoPriority .prio-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.p === '1');
    });

    qaSelectedType = 'boolean';
    updateQaTypeUI();
  }

  function closeQuickAddModal() {
    const modal = $('#quickAddModal');
    if (modal) modal.hidden = true;
  }

  function updateQaTypeUI() {
    const isEn = lang() === 'en';
    $$('.qa-type-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.type === qaSelectedType);
    });
    const targetRow = $('#qaTargetRow');
    const targetLabel = $('#qaTargetLabel');
    const unitLabel = $('#qaUnitLabel');
    const targetInp = $('#qaTargetInput');
    const unitInp = $('#qaUnitInput');
    const quickUnits = $('#qaQuickUnits');

    if (!targetRow) return;

    if (qaSelectedType === 'boolean' || qaSelectedType === 'rating') {
      targetRow.style.display = 'none';
      if (targetInp) targetInp.value = qaSelectedType === 'rating' ? '5' : '1';
      if (unitInp) { unitInp.value = qaSelectedType === 'rating' ? '⭐' : ''; unitInp.disabled = false; }
    } else if (qaSelectedType === 'percentage') {
      targetRow.style.display = 'grid';
      if (targetLabel) targetLabel.textContent = isEn ? 'Target Percentage (%)' : 'النسبة المستهدفة (%)';
      if (unitLabel) unitLabel.textContent = isEn ? 'Unit' : 'الوحدة';
      if (targetInp) {
        targetInp.min = '1';
        targetInp.max = '100';
        if (!targetInp.value || targetInp.value === '1' || targetInp.value === '8') targetInp.value = '100';
        targetInp.placeholder = '100';
      }
      if (unitInp) {
        unitInp.value = '%';
        unitInp.placeholder = '%';
        unitInp.disabled = true;
      }
      if (quickUnits) {
        quickUnits.innerHTML = `
          <span class="unit-badge" data-unit="%" data-val="100">100%</span>
          <span class="unit-badge" data-unit="%" data-val="90">90%</span>
          <span class="unit-badge" data-unit="%" data-val="80">80%</span>
          <span class="unit-badge" data-unit="%" data-val="75">75%</span>
          <span class="unit-badge" data-unit="%" data-val="50">50%</span>
        `;
        quickUnits.querySelectorAll('.unit-badge').forEach(badge => {
          badge.onclick = () => {
            if (unitInp) unitInp.value = '%';
            if (targetInp) targetInp.value = badge.dataset.val;
          };
        });
      }
    } else if (qaSelectedType === 'duration') {
      targetRow.style.display = 'grid';
      if (targetLabel) targetLabel.textContent = isEn ? 'Target Duration' : 'المدة المستهدفة';
      if (unitLabel) unitLabel.textContent = isEn ? 'Unit' : 'الوحدة';
      if (targetInp) {
        targetInp.removeAttribute('max');
        targetInp.min = '1';
        if (!targetInp.value || targetInp.value === '1' || targetInp.value === '8' || targetInp.value === '100') targetInp.value = '30';
        targetInp.placeholder = '30';
      }
      const defMin = isEn ? 'min' : 'دقيقة';
      const defHr = isEn ? 'hours' : 'ساعة';
      if (unitInp) {
        unitInp.disabled = false;
        if (!unitInp.value || unitInp.value === '%' || unitInp.value === 'كوب') unitInp.value = defMin;
        unitInp.placeholder = isEn ? 'min, hours...' : 'دقيقة، ساعات...';
      }
      if (quickUnits) {
        quickUnits.innerHTML = `
          <span class="unit-badge" data-unit="${defMin}" data-val="15">15 ${defMin}</span>
          <span class="unit-badge" data-unit="${defMin}" data-val="30">30 ${defMin}</span>
          <span class="unit-badge" data-unit="${defMin}" data-val="45">45 ${defMin}</span>
          <span class="unit-badge" data-unit="${defMin}" data-val="60">60 ${defMin}</span>
          <span class="unit-badge" data-unit="${defHr}" data-val="2">2 ${defHr}</span>
        `;
        quickUnits.querySelectorAll('.unit-badge').forEach(badge => {
          badge.onclick = () => {
            if (unitInp) unitInp.value = badge.dataset.unit;
            if (targetInp) targetInp.value = badge.dataset.val;
          };
        });
      }
    } else { // number
      targetRow.style.display = 'grid';
      if (targetLabel) targetLabel.textContent = isEn ? 'Daily Target' : 'الهدف اليومي';
      if (unitLabel) unitLabel.textContent = isEn ? 'Unit' : 'الوحدة';
      if (targetInp) {
        targetInp.removeAttribute('max');
        targetInp.min = '1';
        if (!targetInp.value || targetInp.value === '100') targetInp.value = '8';
        targetInp.placeholder = '8';
      }
      if (unitInp) {
        unitInp.disabled = false;
        if (!unitInp.value || unitInp.value === '%') unitInp.value = isEn ? 'cups' : 'كوب';
        unitInp.placeholder = isEn ? 'pages, cups, steps...' : 'كوب، صفحة، خطوة...';
      }
      if (quickUnits) {
        const pPage = isEn ? 'pages' : 'صفحة';
        const pCup = isEn ? 'cups' : 'كوب';
        const pStep = isEn ? 'steps' : 'خطوة';
        const pLit = isEn ? 'liters' : 'لتر';
        quickUnits.innerHTML = `
          <span class="unit-badge" data-unit="${pPage}" data-val="20">20 ${pPage}</span>
          <span class="unit-badge" data-unit="${pCup}" data-val="8">8 ${pCup}</span>
          <span class="unit-badge" data-unit="${pStep}" data-val="10000">10000 ${pStep}</span>
          <span class="unit-badge" data-unit="${pLit}" data-val="2.5">2.5 ${pLit}</span>
        `;
        quickUnits.querySelectorAll('.unit-badge').forEach(badge => {
          badge.onclick = () => {
            if (unitInp) unitInp.value = badge.dataset.unit;
            if (targetInp) targetInp.value = badge.dataset.val;
          };
        });
      }
    }
  }

  function openQuickSleepModal() {
    const modal = $('#quickSleepModal');
    if (!modal) return;
    const dayLog = getTodayLog();
    qsSelectedHours = (dayLog.sleep && dayLog.sleep.durationHours) || 7.5;
    qsSelectedQuality = (dayLog.sleep && dayLog.sleep.quality) || 4;

    $('#qsValNum').textContent = digits(qsSelectedHours);
    updateQsStars();
    modal.hidden = false;
  }

  function closeQuickSleepModal() {
    const modal = $('#quickSleepModal');
    if (modal) modal.hidden = true;
  }

  function updateQsStars() {
    $$('.qs-star-btn').forEach(star => {
      const sNum = Number(star.dataset.star);
      star.classList.toggle('active', sNum <= qsSelectedQuality);
    });
  }

  /* ---------- Event Wiring ---------- */

  function wireEvents() {
    // 1. View Controls Popover
    const popover = $('#habitsViewPopover');
    const popBtn = $('#habitsViewControlBtn');
    const closePopBtn = $('#closePopoverBtn');

    popBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!popover) return;
      const isHidden = popover.hidden;
      popover.hidden = !isHidden;
      if (!popover.hidden) {
        applySettingsToUI();
      }
    });

    closePopBtn?.addEventListener('click', () => {
      if (popover) popover.hidden = true;
    });

    document.addEventListener('click', (e) => {
      if (popover && !popover.hidden && !e.target.closest('#habitsViewPopover') && !e.target.closest('#habitsViewControlBtn')) {
        popover.hidden = true;
      }
    });

    // Popover: Status Filter
    $$('#popoverStatusFilter .seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('#popoverStatusFilter .seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.viewStatusFilter = btn.dataset.filter || 'all';
        persistHabitSettings({ statusFilter: state.viewStatusFilter });
        renderHabitsList();
      });
    });

    // Popover: Density
    $$('#popoverDensity .seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('#popoverDensity .seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.cardDensity = btn.dataset.density || 'compact';
        persistHabitSettings({ cardDensity: state.cardDensity });
        renderHabitsList();
      });
    });

    // Popover: Sort
    $('#popoverSort')?.addEventListener('change', (e) => {
      state.sortOrder = e.target.value || 'manual';
      persistHabitSettings({ sortOrder: state.sortOrder });
      renderHabitsList();
    });

    // Popover: Component Visibility Switches
    $('#popShowStreak')?.addEventListener('change', (e) => {
      const enabled = e.target.checked;
      const heroStreak = $('#heroStreakCard');
      if (heroStreak) heroStreak.style.display = enabled ? 'block' : 'none';
      const showPomodoro = state.settings?.showPomodoroShortcut !== false;
      const heroBento = $('#habitsHeroBento');
      if (heroBento) heroBento.style.display = (enabled || showPomodoro) ? 'flex' : 'none';
      persistHabitSettings({ showStreak: enabled });
    });
    $('#popShowStrength')?.addEventListener('change', (e) => persistHabitSettings({ showStrength: e.target.checked }));
    $('#popShowUrgency')?.addEventListener('change', (e) => {
      persistHabitSettings({ showUrgency: e.target.checked });
      renderHabitsList();
    });
    $('#popShowPomodoro')?.addEventListener('change', (e) => {
      const enabled = e.target.checked;
      const heroFocus = $('#heroFocusCard');
      if (heroFocus) heroFocus.style.display = enabled ? 'flex' : 'none';
      const showStreak = state.settings?.showStreak !== false;
      const heroBento = $('#habitsHeroBento');
      if (heroBento) heroBento.style.display = (enabled || showStreak) ? 'flex' : 'none';
      persistHabitSettings({ showPomodoroShortcut: enabled });
      renderHabitsList();
    });
    $('#popShowProgressBar')?.addEventListener('change', (e) => {
      const enabled = e.target.checked;
      const pWrap = $('#habitsProgressWrap');
      if (pWrap) pWrap.style.display = enabled ? 'block' : 'none';
      persistHabitSettings({ showProgressBar: enabled });
      render();
    });
    $('#popShowMiniStrip')?.addEventListener('change', (e) => persistHabitSettings({ showMiniStrip: e.target.checked }));
    $('#popShowRoutines')?.addEventListener('change', (e) => persistHabitSettings({ showRoutineFilters: e.target.checked }));
    $('#popShowFooterCheckin')?.addEventListener('change', (e) => persistHabitSettings({ showFooterCheckin: e.target.checked }));
    $('#popShowMindsetSpark')?.addEventListener('change', (e) => {
      persistHabitSettings({ dailyMotivationalQuote: e.target.checked });
      renderMindsetSpark();
    });
    $('#popShowGamification')?.addEventListener('change', (e) => {
      persistHabitSettings({ gamificationEnabled: e.target.checked });
      renderGamificationPill();
    });
    $('#popShowAtlasBar')?.addEventListener('change', (e) => {
      persistHabitSettings({ showAtlasBar: e.target.checked });
      renderAtlasMiniBar();
    });
    $('#popShowSoundEffects')?.addEventListener('change', (e) => persistHabitSettings({ soundEffects: e.target.checked }));

    // Routine Chips
    $$('.routine-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        routineUserOverridden = true;
        $$('.routine-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.activeRoutine = btn.dataset.routine || 'all';
        renderHabitsList();
      });
    });

    // Mindset Spark Cycle Button
    $('#sparkCycleBtn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      currentSparkIndex++;
      renderMindsetSpark();
    });

    // Mood Quick Check-in
    $$('.mood-face-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const rating = Number(btn.dataset.mood);
        saveMood(rating);
      });
    });

    // Sleep Pill Click
    $('#qcSleepPill')?.addEventListener('click', () => {
      openQuickSleepModal();
    });

    // Sleep Modal Steppers
    $('#qsDecBtn')?.addEventListener('click', () => {
      qsSelectedHours = Math.max(1, qsSelectedHours - 0.5);
      $('#qsValNum').textContent = digits(qsSelectedHours);
    });
    $('#qsIncBtn')?.addEventListener('click', () => {
      qsSelectedHours = Math.min(24, qsSelectedHours + 0.5);
      $('#qsValNum').textContent = digits(qsSelectedHours);
    });
    $$('.qs-star-btn').forEach(star => {
      star.addEventListener('click', () => {
        qsSelectedQuality = Number(star.dataset.star);
        updateQsStars();
      });
    });
    $('#qsCloseBtn')?.addEventListener('click', closeQuickSleepModal);
    $('#qsCancelBtn')?.addEventListener('click', closeQuickSleepModal);
    $('#qsSaveBtn')?.addEventListener('click', () => {
      saveSleep(qsSelectedHours, qsSelectedQuality);
      closeQuickSleepModal();
    });

    // Quick Add Modal Wiring
    $('#quickAddBtn')?.addEventListener('click', openQuickAddModal);
    $('#qaCloseBtn')?.addEventListener('click', closeQuickAddModal);
    $('#qaCancelBtn')?.addEventListener('click', closeQuickAddModal);

    // Quick Add Tabs
    $('#qaTabPresetsBtn')?.addEventListener('click', () => {
      $('#qaTabPresetsBtn').classList.add('active');
      $('#qaTabCustomBtn').classList.remove('active');
      if ($('#qaPanePresets')) $('#qaPanePresets').style.display = 'block';
      if ($('#qaPaneCustom')) $('#qaPaneCustom').style.display = 'none';
      renderPresetsGrid();
    });

    $('#qaTabCustomBtn')?.addEventListener('click', () => {
      $('#qaTabCustomBtn').classList.add('active');
      $('#qaTabPresetsBtn').classList.remove('active');
      if ($('#qaPanePresets')) $('#qaPanePresets').style.display = 'none';
      if ($('#qaPaneCustom')) $('#qaPaneCustom').style.display = 'block';
      $('#qaTitleInput')?.focus();
    });

    // Quick Units Badges
    $$('#qaQuickUnits .unit-badge').forEach(badge => {
      badge.addEventListener('click', () => {
        const u = badge.dataset.unit || '';
        const v = badge.dataset.val || '';
        if ($('#qaUnitInput')) $('#qaUnitInput').value = u;
        if (v && $('#qaTargetInput')) $('#qaTargetInput').value = v;
      });
    });

    // To-Do Sync & Priority in Quick Add
    $('#qaSyncToTodo')?.addEventListener('change', (e) => {
      if ($('#qaTodoPrioRow')) {
        $('#qaTodoPrioRow').style.display = e.target.checked ? 'flex' : 'none';
      }
    });

    $$('#qaTodoPriority .prio-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('#qaTodoPriority .prio-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        qaTodoPriority = Number(btn.dataset.p || 1);
      });
    });

    $$('.qa-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        qaSelectedType = btn.dataset.type;
        updateQaTypeUI();
      });
    });

    $$('.qa-emoji-opt').forEach(emoji => {
      emoji.addEventListener('click', () => {
        $$('.qa-emoji-opt').forEach(e => e.classList.remove('active'));
        emoji.classList.add('active');
        qaSelectedEmoji = emoji.dataset.emoji;
      });
    });

    $$('.qa-color-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        $$('.qa-color-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        qaSelectedColor = dot.dataset.color;
      });
    });

    // Theme Selector (Select Dropdown & Quick Buttons)
    $('#popoverThemeSelect')?.addEventListener('change', (e) => {
      persistHabitSettings({ theme: e.target.value });
    });

    $$('#popoverTheme .seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.dataset.theme || 'dark-modern';
        persistHabitSettings({ theme });
      });
    });

    // View Switcher Carousel Navigation
    $('#btnPrevView')?.addEventListener('click', () => cycleView(-1));
    $('#btnNextView')?.addEventListener('click', () => cycleView(1));

    $$('#viewPillsRow .view-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        switchView(btn.dataset.view);
      });
    });

    // Mini Bujo Month Nav
    $('#btnMiniBujoPrev')?.addEventListener('click', () => {
      state.bujoMonth = stepMonth(state.bujoMonth, -1);
      renderMiniBujo();
    });
    $('#btnMiniBujoNext')?.addEventListener('click', () => {
      state.bujoMonth = stepMonth(state.bujoMonth, 1);
      renderMiniBujo();
    });
    $('#btnMiniBujoToday')?.addEventListener('click', () => {
      state.bujoMonth = todayStr().slice(0, 7);
      renderMiniBujo();
    });

    // Interactive Week Strip Return Today
    $('#btnReturnToday')?.addEventListener('click', () => {
      state.selectedDate = todayStr();
      renderWeekStrip();
      renderHabitsList();
      updateHistoryBanner();
    });

    // Mini Sleep Date Nav & Controls
    $('#btnSleepPrevDay')?.addEventListener('click', () => {
      state.sleepSelectedDate = stepDay(state.sleepSelectedDate, -1);
      renderMiniSleep();
    });
    $('#btnSleepNextDay')?.addEventListener('click', () => {
      const nextStr = stepDay(state.sleepSelectedDate, 1);
      if (nextStr <= todayStr()) {
        state.sleepSelectedDate = nextStr;
        renderMiniSleep();
      }
    });

    $('#btnMiniSleepDec')?.addEventListener('click', () => {
      const dayLog = state.logs[state.sleepSelectedDate || todayStr()] || {};
      const cur = Number(dayLog.sleep?.durationHours) || 7.5;
      const next = Math.max(1, cur - 0.5);
      saveSleep(next, dayLog.sleep?.quality || 4, state.sleepSelectedDate);
      renderMiniSleep();
    });
    $('#btnMiniSleepInc')?.addEventListener('click', () => {
      const dayLog = state.logs[state.sleepSelectedDate || todayStr()] || {};
      const cur = Number(dayLog.sleep?.durationHours) || 7.5;
      const next = Math.min(24, cur + 0.5);
      saveSleep(next, dayLog.sleep?.quality || 4, state.sleepSelectedDate);
      renderMiniSleep();
    });

    $$('.quick-preset-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const h = Number(chip.dataset.hours);
        const dayLog = state.logs[state.sleepSelectedDate || todayStr()] || {};
        saveSleep(h, dayLog.sleep?.quality || 4, state.sleepSelectedDate);
        renderMiniSleep();
      });
    });

    $$('#miniSleepStars .q-star').forEach(st => {
      st.addEventListener('click', () => {
        const q = Number(st.dataset.star);
        const dayLog = state.logs[state.sleepSelectedDate || todayStr()] || {};
        saveSleep(dayLog.sleep?.durationHours || 7.5, q, state.sleepSelectedDate);
        renderMiniSleep();
      });
    });

    $$('#miniMoodRow .mini-mood-btn').forEach(mb => {
      mb.addEventListener('click', () => {
        const r = Number(mb.dataset.rating);
        saveMood(r, state.sleepSelectedDate);
        renderMiniSleep();
      });
    });

    // Rich Habit Creation Frequency & Toggles
    $$('#qaFreqSegment .seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('#qaFreqSegment .seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const freq = btn.dataset.freq;
        if ($('#qaSpecificDaysRow')) $('#qaSpecificDaysRow').style.display = freq === 'specific_days' ? 'flex' : 'none';
        if ($('#qaWeeklyTargetRow')) $('#qaWeeklyTargetRow').style.display = freq === 'weekly_target' ? 'block' : 'none';
      });
    });

    $$('#qaSpecificDaysRow .day-chip-chk').forEach(chip => {
      chip.addEventListener('click', () => {
        chip.classList.toggle('active');
      });
    });

    $('#qaPomodoroCheckbox')?.addEventListener('change', (e) => {
      if ($('#qaPomoSessionsRow')) $('#qaPomoSessionsRow').style.display = e.target.checked ? 'flex' : 'none';
    });

    $('#qaSyncToCalendar')?.addEventListener('change', (e) => {
      if ($('#qaCalSyncRow')) $('#qaCalSyncRow').style.display = e.target.checked ? 'block' : 'none';
    });

    $('#qaSaveBtn')?.addEventListener('click', async () => {
      const title = $('#qaTitleInput')?.value?.trim();
      if (!title) {
        $('#qaTitleInput')?.focus();
        return;
      }

      let targetVal = Number($('#qaTargetInput')?.value) || 1;
      let unit = $('#qaUnitInput')?.value?.trim() || '';

      if (qaSelectedType === 'boolean') {
        targetVal = 1;
        unit = '';
      } else if (qaSelectedType === 'percentage') {
        targetVal = Math.min(100, Math.max(1, targetVal || 100));
        unit = '%';
      } else if (qaSelectedType === 'rating') {
        targetVal = 5;
        unit = '⭐';
      } else if (qaSelectedType === 'duration') {
        targetVal = Math.max(1, targetVal);
        if (!unit) unit = lang() === 'en' ? 'min' : 'دقيقة';
      } else if (qaSelectedType === 'number') {
        targetVal = Math.max(1, targetVal);
        if (!unit) unit = lang() === 'en' ? 'times' : 'مرة';
      }

      const routine = $('#qaRoutineSelect')?.value || 'anytime';
      const direction = $('#qaDirectionSelect')?.value || 'positive';
      const difficulty = $('#qaDifficultySelect')?.value || 'easy';

      const freqType = $('#qaFreqSegment .seg-btn.active')?.dataset.freq || 'daily';
      let frequency = { type: 'daily' };
      if (freqType === 'specific_days') {
        const daysOfWeek = [];
        $$('#qaSpecificDaysRow .day-chip-chk.active').forEach(c => daysOfWeek.push(Number(c.dataset.d)));
        frequency = { type: 'specific_days', daysOfWeek };
      } else if (freqType === 'weekly_target') {
        frequency = { type: 'weekly_target', targetDaysPerWeek: Number($('#qaWeeklyTargetDays')?.value) || 4 };
      }

      const newHabit = {
        id: `hbt-${Date.now()}`,
        title,
        titleEn: title,
        type: qaSelectedType,
        direction,
        difficulty,
        targetValue: targetVal,
        unit,
        unitEn: unit,
        routine,
        icon: qaSelectedEmoji,
        color: qaSelectedColor,
        frequency,
        enablePomodoro: $('#qaPomodoroCheckbox')?.checked ?? false,
        pomodoroSessions: Number($('#qaPomodoroSessions')?.value) || 1,
        syncToCalendar: $('#qaSyncToCalendar')?.checked ?? true,
        calendarTime: $('#qaCalTime')?.value || '08:00',
        calendarDuration: Number($('#qaCalDuration')?.value) || 30,
        syncToTodo: $('#qaSyncToTodo')?.checked ?? false,
        todoPriority: qaTodoPriority,
        triggerCue: $('#qaTriggerCue')?.value?.trim() || '',
        reminderTime: $('#qaReminderTime')?.value || '',
        notes: $('#qaMotivationNotes')?.value?.trim() || '',
        createdAt: new Date().toISOString(),
        archived: false,
      };

      if (window.widgets?.habits?.saveHabit) {
        await window.widgets.habits.saveHabit(newHabit);
        state.habits.push(newHabit);
      }
      closeQuickAddModal();
      render();
    });

    // Context Menu Wiring
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#habitContextMenu') && !e.target.closest('.h-more-btn')) {
        closeContextMenu();
      }
    });

    $('#menuDone')?.addEventListener('click', () => {
      if (activeMenuHabitId) saveStatus(activeMenuHabitId, 'done', 1);
      closeContextMenu();
    });

    $('#menuSkip')?.addEventListener('click', () => {
      if (activeMenuHabitId) saveStatus(activeMenuHabitId, 'skip', 0);
      closeContextMenu();
    });

    $('#menuReset')?.addEventListener('click', () => {
      if (activeMenuHabitId) saveStatus(activeMenuHabitId, 'none', 0);
      closeContextMenu();
    });

    $('#menuEdit')?.addEventListener('click', () => {
      window.widgets?.win?.openHabitsDashboard?.({ tab: 'manager', habitId: activeMenuHabitId });
      closeContextMenu();
    });

    $('#menuDelete')?.addEventListener('click', async () => {
      if (activeMenuHabitId) {
        if (confirm(t('habits.deleteConfirm'))) {
          if (window.widgets?.habits?.deleteHabit) {
            await window.widgets.habits.deleteHabit(activeMenuHabitId);
            state.habits = state.habits.filter(h => h.id !== activeMenuHabitId);
            render();
          }
        }
      }
      closeContextMenu();
    });

    $('#menuDashboard')?.addEventListener('click', () => {
      window.widgets?.win?.openHabitsDashboard?.({ habitId: activeMenuHabitId });
      closeContextMenu();
    });

    // Header buttons
    $('#gamificationHeaderPill')?.addEventListener('click', () => {
      window.widgets?.win?.openHabitsDashboard?.({ tab: 'gamification' });
    });

    $('#atlasMiniMiroMote')?.addEventListener('click', () => {
      window.widgets?.win?.openHabitsDashboard?.({ tab: 'atlas' });
    });

    $('#habitsMiniMiroAvatarWrap')?.addEventListener('click', async () => {
      const bubble = $('#habitsMiniMiroBubble');
      if (!bubble) return;
      if (bubble.style.display !== 'none') {
        bubble.style.display = 'none';
        return;
      }
      const isEn = lang() === 'en';
      const wfName = state.atlas?.wayfinder?.name;
      let dialogue = state.atlas?.miro?.currentDialogue;
      if (!dialogue && window.widgets?.atlas?.getMiroDialogue) {
        try {
          const res = await window.widgets.atlas.getMiroDialogue({ lang: isEn ? 'en' : 'ar', context: { wayfinderName: wfName } });
          dialogue = res?.text;
        } catch (_) {}
      }
      const speechEl = $('#habitsMiniMiroSpeech');
      if (speechEl) {
        speechEl.textContent = `"${dialogue || (isEn ? 'Even a small spark lights the dark.' : 'إذا كان اليوم ثقيلاً، فخطوة الدقيقتين تكفي لمواصلة المسير.')}"`;
      }
      bubble.style.display = 'block';
    });

    $('#habitsMiniMiroBubbleClose')?.addEventListener('click', () => {
      const bubble = $('#habitsMiniMiroBubble');
      if (bubble) bubble.style.display = 'none';
    });

    $('#habitsMiniOpenAtlasBtn')?.addEventListener('click', () => {
      window.widgets?.win?.openHabitsDashboard?.({ tab: 'atlas' });
      const bubble = $('#habitsMiniMiroBubble');
      if (bubble) bubble.style.display = 'none';
    });

    $('#habitsMiniMiroCheerBtn')?.addEventListener('click', async () => {
      const isEn = lang() === 'en';
      if (window.widgets?.atlas?.getMiroDialogue) {
        try {
          const wfName = state.atlas?.wayfinder?.name;
          const res = await window.widgets.atlas.getMiroDialogue({ lang: isEn ? 'en' : 'ar', state: 'supportive', context: { wayfinderName: wfName } });
          if (res?.text) {
            const speechEl = $('#habitsMiniMiroSpeech');
            if (speechEl) speechEl.textContent = `"${res.text}"`;
          }
        } catch (_) {}
      }
    });

    $('#habitsMiniQuickStepBtn')?.addEventListener('click', () => {
      triggerFirstPendingMicroStep();
    });

    $('#openDashboardBtn')?.addEventListener('click', () => {
      window.widgets?.win?.openHabitsDashboard?.();
    });

    $('#waShareBtn')?.addEventListener('click', async () => {
      const btn = $('#waShareBtn');
      if (btn) btn.disabled = true;
      try {
        if (window.widgets?.habits?.sendWaReport) {
          const res = await window.widgets.habits.sendWaReport({ type: 'daily' });
          if (res && res.success) {
            triggerConfetti(window.innerWidth / 2, 40);
            alert(t('habits.waSentSuccess'));
          } else {
            alert((res && res.error) || t('habits.waSetupNeeded'));
          }
        }
      } catch (err) {
        alert(err.message || t('habits.waSetupNeeded'));
      } finally {
        if (btn) btn.disabled = false;
      }
    });

    $('#dwiBadge')?.addEventListener('click', () => {
      window.widgets?.win?.openHabitsDashboard?.({ tab: 'kpis' });
    });

    $('#settingsBtn')?.addEventListener('click', () => {
      window.widgets?.win?.openSettings?.('habits');
    });

    $('#closeBtn')?.addEventListener('click', () => {
      closeWindow();
    });

    // Real-time IPC listeners
    window.widgets?.habits?.onChange?.((habits) => {
      state.habits = habits || [];
      render();
    });

    window.widgets?.habits?.onLogChange?.((payload) => {
      if (payload && payload.date && payload.day) {
        state.logs[payload.date] = payload.day;
      }
      render();
    });

    window.widgets?.habits?.onGamificationChange?.((g) => {
      if (g) {
        state.gamification = g;
        renderGamificationPill();
      }
    });

    // Live Settings Listener (Reflects changes immediately)
    window.widgets?.settings?.onChange?.((newSettings) => {
      state.allSettings = newSettings || {};
      state.settings = newSettings?.habits || {};
      applySettingsToUI();
      render();
    });

    // Real-time Atlas State Update Listener
    window.widgets?.atlas?.onUpdated?.((atlasState) => {
      if (atlasState) {
        state.atlas = atlasState;
        renderAtlasMiniBar();
      }
    });
  }

  /* ---------- Boot via Mirqat UI Framework ---------- */
  boot(async (currentSettings) => {
    state.allSettings = currentSettings || {};
    state.settings = currentSettings?.habits || {};
    applySettingsToUI();
    initConfettiCanvas();
    wireEvents();
    setupPomodoroCrossIntegration();
    await loadState();
    applySmartRoutineAnchor();
    render();
    window.UI?.onDormancy?.((isDormant) => {
      if (isDormant && confettiRaf) {
        cancelAnimationFrame(confettiRaf);
        confettiRaf = null;
        particles.length = 0;
      } else if (!isDormant) {
        render();
      }
    });
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => {
        updateHabitsViewIndicator(true);
        requestAnimationFrame(() => updateHabitsViewIndicator(true));
      });
    }
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => updateHabitsViewIndicator(true));
    }
    window.addEventListener('resize', () => updateHabitsViewIndicator(true));
    if (typeof ResizeObserver !== 'undefined') {
      const row = document.getElementById('viewPillsRow');
      if (row) {
        let lastW = 0;
        let lastH = 0;
        const ro = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const cr = entry.contentRect;
            if (Math.abs(cr.width - lastW) > 2 || Math.abs(cr.height - lastH) > 2) {
              lastW = cr.width;
              lastH = cr.height;
              updateHabitsViewIndicator(true);
            }
          }
        });
        ro.observe(row);
      }
    }
  });
})();

