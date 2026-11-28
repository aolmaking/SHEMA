'use strict';

/**
 * Habits & Life Intelligence Dedicated Analytics Dashboard Script
 * Pure Data Integrity, Zero Fake Sinusoids, Full Bilingual i18n, Smooth Dragging
 */

(function () {
  const { $, $$, boot, el, strings, t, lang, digits, closeWindow } = window.UI;

  strings({
    ar: {
      'habits.dashTitle': 'لوحة تحليلات العادات والبوليت جورنال',
      'habits.dashSubtitle': 'الذكاء الإحصائي ومصفوفة الإنجاز الشهري',
      'habits.today': 'اليوم',
      'habits.newHabit': 'عادة جديدة',
      'habits.waReport': 'تقرير واتساب',
      'habits.prevMonth': 'الشهر السابق',
      'habits.nextMonth': 'الشهر التالي',
      'habits.tabGrid': 'مصفوفة البوليت جورنال',
      'habits.tabSleepMood': 'مختبر النوم والمزاج',
      'habits.tabKpis': 'محرك الـ KPIs والترابط',
      'habits.tabManager': 'إدارة وبناء العادات',
      'habits.tabAtlas': 'أطلس العوالم الحيّة (The Living Atlas)',
      'atlas.havenGold': 'ذهب الملاذ',
      'habits.tabBackup': 'النسخ الاحتياطي والتقارير',
      'habits.presetsQuickBar': '⚡ قوالب جاهزة ومعدة مسبقاً (اختر لتعبئة النموذج بضغطة واحدة):',
      'habits.legendDone': 'مكتملة',
      'habits.legendSkip': 'تخطي (إجازة/عذر)',
      'habits.legendPartial': 'جزئية',
      'habits.legendEmpty': 'غير منجزة',
      'habits.allRoutines': 'كل الفترات (All Routines)',
      'habits.routineMorning': '☀️ الصباح (Morning)',
      'habits.routineAfternoon': '🌤️ بعد الظهر (Afternoon)',
      'habits.routineEvening': '🌙 المساء (Evening)',
      'habits.routineAnytime': '⚡ أي وقت خلال اليوم (Anytime)',
      'habits.dailyTotals': 'مجموع إنجاز اليوم',
      'habits.viewWeekly': 'أسبوعي مركز',
      'habits.viewCompact': 'شهري مدمج',
      'habits.viewCards': 'بطاقات اليوم',
      'habits.viewTable': 'جدول كامل',
      'habits.prevWeek': 'السابق',
      'habits.nextWeek': 'التالي',
      'habits.todayProgress': 'إنجاز اليوم',
      'habits.bestStreak': 'أعلى سلسلة نشطة',
      'habits.monthConsistency': 'انضباط الشهر الحالي',
      'habits.activeHabitsCount': 'العادات الفعالة',
      'habits.searchPh': 'بحث في العادات...',
      'habits.todayDone': '✓ تم الإنجاز اليوم',
      'habits.todaySkip': '⏸️ تم التخطي',
      'habits.todayPartial': '½ إنجاز جزئي',
      'habits.todayEmpty': '⚪ تسجيل إنجاز اليوم',
      'habits.chartMoodTitle': 'مخطط المزاج ومستوى التوتر (Mood & Stress Tracker)',
      'habits.chartMoodSub': 'منحنى تقلبات المزاج متراكب مع مؤشر التوتر اليومي عبر الشهر',
      'habits.legendMoodTag': '● المزاج (1-5)',
      'habits.legendStressTag': '● التوتر (1-10)',
      'habits.chartSleepTitle': 'مختبر ساعات النوم ونطاقات الراحة (Sleep Duration & Zones)',
      'habits.chartSleepSub': 'أعمدة ساعات النوم (الأخضر: 7-9س صحي، الأصفر: 6-7س، الأحمر: أقل من 6س)',
      'habits.legendSleepGood': '■ نوم مثالي (7-9h)',
      'habits.legendSleepWarn': '■ نوم خفيف (6-7h)',
      'habits.legendSleepBad': '■ حرمان من النوم (<6h)',
      'habits.chartScreenTitle': 'مقارنة وقت الشاشة وساعات النوم (Screen Time vs Sleep)',
      'habits.chartScreenSub': 'يوضح الترابط بين السهر على الأجهزة الإلكترونية ونقص ساعات النوم',
      'habits.quickLogDay': 'توثيق بيانات يوم محدد',
      'habits.selectDate': 'التاريخ',
      'habits.sleepHours': 'ساعات النوم (س)',
      'habits.bedtime': 'وقت النوم',
      'habits.wakeTime': 'وقت الاستيقاظ',
      'habits.moodRating': 'تقييم المزاج (1-5)',
      'habits.moodOpt5': '😁 5 - رائع ومبتهج (Great)',
      'habits.moodOpt4': '🙂 4 - جيد ومستقر (Good)',
      'habits.moodOpt3': '😐 3 - متوسط (Meh)',
      'habits.moodOpt2': '😣 2 - متوتر ومجهد (Stressed)',
      'habits.moodOpt1': '😡 1 - سيئ أو محبط (Down)',
      'habits.stressLevel': 'مستوى التوتر (1-10)',
      'habits.screenHours': 'وقت الشاشة (ساعات)',
      'habits.saveRecord': 'حفظ التوثيق',
      'habits.saveHabitBtn': 'حفظ العادة',
      'habits.cancel': 'إلغاء',
      'habits.consistencyScore': 'مؤشر الانضباط العام',
      'habits.consistencySub': 'بناءً على الأيام النشطة المستهدفة',
      'habits.avgSleep': 'متوسط ساعات النوم',
      'habits.longestStreak': 'أطول سلسلة استمرار',
      'habits.bestDay': 'أفضل أيام الأسبوع',
      'habits.correlationsTitle': 'الترابط الإحصائي ومعامل بيرسون (Pearson Correlation r)',
      'habits.tagSleepMood': 'نوم vs مزاج',
      'habits.corrSleepMoodDesc': 'يتم قياس مدى تأثير ساعات النوم الإيجابي على استقرار وتقييم المزاج.',
      'habits.tagSleepHabits': 'نوم vs إنجاز العادات',
      'habits.corrSleepHabitsDesc': 'يتم رصد تأثير النوم الكافي على طاقة إنجاز العادات في اليوم التالي.',
      'habits.tagMoodStress': 'مزاج vs توتر',
      'habits.corrMoodStressDesc': 'ترابط عكسي طبيعي: انخفاض مستوى التوتر يرتبط مباشرة بتحسن ملحوظ في مؤشرات العافية.',
      'habits.habitStrengthTitle': 'مؤشر قوة واستقرار العادات (Habit Strength Index)',
      'habits.colHabit': 'العادة',
      'habits.colRoutine': 'الفترة',
      'habits.colStrength': 'مؤشر القوة',
      'habits.colStreak': 'السلسلة الحالية',
      'habits.colLongest': 'أطول سلسلة',
      'habits.createNewHabit': 'إنشاء عادة جديدة مخصصة',
      'habits.editHabitTitle': 'تعديل بيانات العادة',
      'habits.habitName': 'اسم العادة',
      'habits.habitNamePh': 'مثال: قراءة 20 صفحة، ركوب الدراجة...',
      'habits.habitNameEn': 'اسم العادة بالإنجليزية (اختياري)',
      'habits.habitNameEnPh': 'e.g. Daily Reading, Cycling...',
      'habits.routineLabel': 'الفترة / الروتين (Routine)',
      'habits.categoryLabel': 'التصنيف (Category)',
      'habits.catGeneral': '⭐ عام (General)',
      'habits.catHealth': '🏃‍♂️ صحة ولياقة (Health)',
      'habits.catProductivity': '🎯 إنتاجية وعمل (Productivity)',
      'habits.catLearning': '📖 تعلم ومعرفة (Learning)',
      'habits.catSpirit': '✨ روحانيات وتأمل (Spirit)',
      'habits.catMind': '🧘‍♂️ عقل وتطوير ذات (Mind)',
      'habits.inputTypeLabel': 'نوع المدخلات (Input Type)',
      'habits.typeBoolean': '✓ علامة صح أو خطأ (Yes / No)',
      'habits.typeNumber': '🔢 عدد كمي مستهدف (Numeric Target)',
      'habits.typeDuration': '⏱️ مدة زمنية (Duration / Minutes)',
      'habits.typePercentage': '📊 نسبة مئوية (Percentage 0-100%)',
      'habits.typeRating': '⭐ تقييم تدريجي (Rating)',
      'habits.targetValLabel': 'الهدف المستهدف والوحدة',
      'habits.unitPh': 'الوحدة: صفحة، كوب، دقيقة...',
      'habits.frequencyLabel': 'التكرار والأيام المرنة (Flexible Frequency)',
      'habits.freqDaily': 'يومي (كل يوم)',
      'habits.freqWeekly': 'عدد مرات أسبوعياً (مثلاً 3 مرات في الأسبوع)',
      'habits.freqSpecific': 'أيام محددة من الأسبوع (Specific Days)',
      'habits.targetDaysPerWeek': 'كم يوماً في الأسبوع؟',
      'habits.selectDays': 'اختر الأيام النشطة',
      'habits.daySat': 'السبت',
      'habits.daySun': 'الأحد',
      'habits.dayMon': 'الاثنين',
      'habits.dayTue': 'الثلاثاء',
      'habits.dayWed': 'الأربعاء',
      'habits.dayThu': 'الخميس',
      'habits.dayFri': 'الجمعة',
      'habits.iconEmoji': 'الأيقونة (إيموجي)',
      'habits.colorPicker': 'لون التمييز (Color)',
      'habits.existingHabits': 'العادات الحالية المفعلة',
      'habits.backupTitle': 'النسخ الاحتياطي وتصدير البيانات',
      'habits.backupSub': 'تصدير كامل بيانات عاداتك وسجلات النوم والمزاج لضمان عدم فقدانها',
      'habits.exportJson': 'تصدير نسخة JSON شاملة',
      'habits.exportCsv': 'تصدير جدول بيانات CSV (Excel)',
      'habits.importTitle': 'استرجاع أو دمج نسخة سابقة:',
      'habits.pickBackupFile': 'اختيار ملف النسخة الاحتياطية',
      'habits.noFileSelected': 'لم يتم اختيار ملف',
      'habits.applyRestore': 'تطبيق الاسترجاع والدمج',
      'habits.waHubTitle': 'تقارير الواتساب التنفيذية الذكية',
      'habits.waHubSub': 'توليد رسالة إنفوجرافيك بأشرطة يونيكود مع إمكانية المعاينة والإرسال المباشر',
      'habits.monthlyReport': 'تقرير شهري',
      'habits.weeklyReport': 'تقرير أسبوعي',
      'habits.sendWaNow': 'إرسال التقرير للواتساب الآن',
      'habits.noChartData': 'لم يتم تسجيل أي بيانات نوم أو مزاج لهذا الشهر حتى الآن. استخدم نموذج التوثيق بالأسفل لتسجيل يومك.',
      'habits.edit': 'تعديل',
      'habits.delete': 'حذف',
      'habits.deleteConfirm': 'هل أنت متأكد من حذف هذه العادة نهائياً؟',
      'habits.daysCount': '{n} يوم',
      'habits.sleepLogged': '{h} ساعة/ليلة',
      'habits.notLogged': 'غير مسجل',
      'habits.corrRequiresData': 'يتطلب حساب الارتباط الإحصائي تسجيل 3 أيام على الأقل من النوم والمزاج.',
      'habits.days': 'يوم',
      'habits.tabGamification': 'تحديات السلاسل والأوسمة (Streaks)',
      'habits.daysStreak': 'أيام متتالية من الإنجاز! (days streak!)',
      'habits.streakChallengeTitle': 'تحدي السلاسل (Streak challenge)',
      'habits.streakStarted': 'تاريخ بدء السلسلة (Streak started)',
      'habits.streakRecord': 'أعلى رقم قياسي (Streak record)',
      'habits.streakMilestones': 'محطات الأوسمة المتتالية (Streak milestones)',
      'habits.heroLevelTitle': 'مستوى الانضباط والبطولة',
      'habits.coins': 'العملات الذهبية',
      'habits.shopTitle': 'متجر المكافآت الذاتية (Self-Reward Shop)',
      'habits.shopSub': 'استبدل عملاتك الذهبية بمكافآت حقيقية تحفزك على الالتزام اليومي',
      'habits.claimRewardBtn': 'استبدال الآن',
      'habits.rewardClaimed': 'تم استبدال المكافأة بنجاح! استمتع بها 🎉',
      'habits.notEnoughCoins': 'ليس لديك عملات كافية لهذه المكافأة',
      'habits.addReward': 'إضافة مكافأة جديدة',
      'habits.rewardCost': 'التكلفة بالعملات',
      'habits.claimedHistory': 'سجل المكافآت المستبدلة',
      'habits.badHabitTitle': 'كاسر العادات ومقاومتها (Habit Breaker)',
      'habits.badHabitSub': 'تتبع العادات التي تريد الإقلاع عنها، كل يوم صمود يمنحك نقاط مرونة ومكافآت مضاعفة',
      'habits.resistedDays': 'أيام صمود ومقاومة',
      'habits.markResisted': 'قاومت اليوم 🛡️',
      'habits.resistedSuccess': '✓ صامد ومقاوم',
      'habits.heatmapTitle': 'خريطة النشاط والاستمرارية (Activity Heatmap - 90 Days)',
      'habits.heatmapSub': 'مصفوفة إنجاز العادات عبر آخر 90 يوماً مثل نشاط GitHub',
      'habits.heatmapLess': 'أقل',
      'habits.heatmapMore': 'أكثر',
      'habits.dailyReflection': 'خاطرة وتأمل اليوم (Daily Reflection)',
      'habits.dailyReflectionPh': 'اكتب فكرة سريعة أو تأمل عن إنجازك اليوم...',
      'habits.saveNote': 'حفظ الخاطرة',
      'habits.noteSaved': 'تم حفظ الخاطرة بنجاح ✨',
      'habits.directionLabel': 'مسار العادة',
      'habits.dirPositive': '🚀 عادة إيجابية لبنائها',
      'habits.dirNegative': '🛑 كاسر عادة للإقلاع عنها',
      'habits.difficultyLabel': 'مستوى الصعوبة',
      'habits.diffTrivial': 'بسيطة (+10 XP)',
      'habits.diffEasy': 'سهلة (+20 XP)',
      'habits.diffMedium': 'متوسطة (+40 XP)',
      'habits.diffHard': 'صعبة (+80 XP)',
      'habits.freqInterval': 'كل عدد أيام محدد (Every X Days)',
      'habits.intervalDays': 'كل كم يوم؟',
      'habits.themeMatch': 'مطابق للنظام (App Theme)',
      'habits.kpiChartsTitle': 'المخططات البيانية للسلوك والإنتاجية (Behavioral Analytics Charts)',
      'habits.chartRoutineTitle': 'مقارنة الانضباط حسب فترات اليوم (Routine Adherence)',
      'habits.chartRoutineSub': 'نسب الإنجاز بين الصباح، بعد الظهر، المساء، وأي وقت',
      'habits.chartDayOfWeekTitle': 'توزيع الإنجاز عبر أيام الأسبوع (Day-of-Week Drop-offs)',
      'habits.chartDayOfWeekSub': 'رصد أيام التراجع وانخفاض الإنتاجية (من السبت إلى الجمعة)',
      'habits.chartSleepCompletionTitle': 'منحنى تأثير النوم على إنجاز العادات (Sleep vs Completion)',
      'habits.chartSleepCompletionSub': 'العلاقة المباشرة بين ساعات النوم ونسبة إنجاز المهام في اليوم التالي',
      'habits.chartMoodProdTitle': 'تأثير الحالة المزاجية على الإنتاجية (Mood vs Productivity)',
      'habits.chartMoodProdSub': 'معدل الإنجاز في أيام المزاج المرتفع مقارنة بأيام التوتر والإرهاق',
      'habits.enablePomodoroLabel': '⏱️ تفعيل مؤقت بومودورو للتركيز لهذه العادة',
      'habits.enablePomodoroHint': 'يظهر زر التركيز السريع (⏱️) مباشرة على بطاقة العادة لبدء جلسة عمل مركّزة فوراً.',
      'habits.syncToTodoLabel': '📋 إضافة مهمة تلقائية في قائمة المهام (To-Do List)',
      'habits.todoPriorityLabel': 'أولوية المهمة في To-Do:',
      'habits.prioNormal': 'عادية 🟢 (Normal)',
      'habits.prioImportant': 'مهمة ⚡ 🟠 (Important)',
      'habits.prioUrgent': 'عاجلة 🚨 🔴 (Urgent)',
      'habits.syncToCalendarLabel': '📅 ربط بالتقويم وإنشاء حدث يومي تلقائي (Calendar Event)',
      'habits.calTimeLabel': 'توقيت الحدث في التقويم:',
      'habits.calDurationLabel': 'مدة الحدث:',
      'habits.triggerCueLabel': 'المحفز أو الإشارة البديهية (Trigger / Cue)',
      'habits.triggerCuePh': 'مثال: بعد صلاة الفجر، عند فتح الحاسوب...',
      'habits.reminderTimeLabel': 'وقت التذكير اليومي (Time)',
      'habits.targetGoalStreakLabel': 'الهدف المستهدف للسلسلة (أيام)',
      'habits.notesLabel': 'الدافع والغاية وملاحظات تحفيزية',
      'habits.notesPh': 'لماذا أريد الالتزام بهذه العادة؟ وكيف ستغير حياتي؟',
      'habits.questsTitle': 'المهام اليومية وتحديات الزعيم (Daily Quests & Boss Bounties)',
      'habits.questsSub': 'أنجز أهدافك اليومية لتحصيل جوائز إضافية من الذهب والخبرة ودروع السلاسل',
      'habits.habitStrength': 'قوة واستقرار العادة',
    },
    en: {
      'habits.dashTitle': 'Habits & Life Intelligence',
      'habits.dashSubtitle': 'Statistical Intelligence & Monthly Performance Matrix',
      'habits.today': 'Today',
      'habits.newHabit': 'New Habit',
      'habits.waReport': 'WhatsApp Report',
      'habits.prevMonth': 'Previous Month',
      'habits.nextMonth': 'Next Month',
      'habits.tabGrid': 'Bullet Journal Grid',
      'habits.tabSleepMood': 'Sleep & Mood Lab',
      'habits.tabKpis': 'KPIs & Correlations',
      'habits.tabManager': 'Habit Manager & Builder',
      'habits.tabAtlas': 'The Living Atlas (World Journey)',
      'atlas.havenGold': 'Haven Gold',
      'habits.tabBackup': 'Backup & Reports',
      'habits.presetsQuickBar': '⚡ Quick 1-Click Habit Presets (Click to autofill):',
      'habits.legendDone': 'Completed',
      'habits.legendSkip': 'Skipped (Exempt)',
      'habits.legendPartial': 'Partial',
      'habits.legendEmpty': 'Uncompleted',
      'habits.allRoutines': 'All Routines',
      'habits.routineMorning': '☀️ Morning',
      'habits.routineAfternoon': '🌤️ Afternoon',
      'habits.routineEvening': '🌙 Evening',
      'habits.routineAnytime': '⚡ Anytime',
      'habits.dailyTotals': 'Daily Completion Totals',
      'habits.chartMoodTitle': 'Mood & Stress Curve Tracker',
      'habits.chartMoodSub': 'Monthly mood variations overlaid with daily stress index',
      'habits.legendMoodTag': '● Mood (1-5)',
      'habits.legendStressTag': '● Stress (1-10)',
      'habits.chartSleepTitle': 'Sleep Duration & Comfort Zones Lab',
      'habits.chartSleepSub': 'Sleep hours (Green: 7-9h optimal, Yellow: 6-7h, Red: <6h)',
      'habits.legendSleepGood': '■ Optimal (7-9h)',
      'habits.legendSleepWarn': '■ Mild Lack (6-7h)',
      'habits.legendSleepBad': '■ Deprived (<6h)',
      'habits.chartScreenTitle': 'Screen Time vs Sleep Duration',
      'habits.chartScreenSub': 'Shows correlation between late device usage and reduced sleep',
      'habits.quickLogDay': 'Log Specific Day Records',
      'habits.selectDate': 'Date',
      'habits.sleepHours': 'Sleep Hours (h)',
      'habits.bedtime': 'Bedtime',
      'habits.wakeTime': 'Wake Time',
      'habits.moodRating': 'Mood Rating (1-5)',
      'habits.moodOpt5': '😁 5 - Great & Joyful',
      'habits.moodOpt4': '🙂 4 - Good & Stable',
      'habits.moodOpt3': '😐 3 - Neutral / Meh',
      'habits.moodOpt2': '😣 2 - Stressed / Tense',
      'habits.moodOpt1': '😡 1 - Exhausted / Down',
      'habits.stressLevel': 'Stress Level (1-10)',
      'habits.screenHours': 'Screen Time (Hours)',
      'habits.saveRecord': 'Save Record',
      'habits.saveHabitBtn': 'Save Habit',
      'habits.cancel': 'Cancel',
      'habits.consistencyScore': 'Overall Consistency Index',
      'habits.consistencySub': 'Based on active scheduled days',
      'habits.avgSleep': 'Avg Sleep Duration',
      'habits.longestStreak': 'Longest Active Streak',
      'habits.bestDay': 'Best Day of Week',
      'habits.correlationsTitle': 'Statistical Correlation & Pearson Coefficient (r)',
      'habits.tagSleepMood': 'Sleep vs Mood',
      'habits.corrSleepMoodDesc': 'Measures positive impact of adequate sleep on mood stability.',
      'habits.tagSleepHabits': 'Sleep vs Habit Completion',
      'habits.corrSleepHabitsDesc': 'Monitors how rest drives execution energy on the following day.',
      'habits.tagMoodStress': 'Mood vs Stress',
      'habits.corrMoodStressDesc': 'Natural inverse correlation: lower stress directly elevates daily wellness score.',
      'habits.habitStrengthTitle': 'Habit Strength & Stability Index',
      'habits.colHabit': 'Habit',
      'habits.colRoutine': 'Routine',
      'habits.colStrength': 'Strength Score',
      'habits.colStreak': 'Current Streak',
      'habits.colLongest': 'Longest Streak',
      'habits.createNewHabit': 'Create New Custom Habit',
      'habits.editHabitTitle': 'Edit Habit Details',
      'habits.habitName': 'Habit Name',
      'habits.habitNamePh': 'e.g. Read 20 pages, Cycling...',
      'habits.habitNameEn': 'Habit Name in English',
      'habits.habitNameEnPh': 'e.g. Daily Reading, Cycling...',
      'habits.routineLabel': 'Routine Period',
      'habits.categoryLabel': 'Category',
      'habits.catGeneral': '⭐ General',
      'habits.catHealth': '🏃‍♂️ Health & Fitness',
      'habits.catProductivity': '🎯 Productivity',
      'habits.catLearning': '📖 Learning & Reading',
      'habits.catSpirit': '✨ Spirituality',
      'habits.catMind': '🧘‍♂️ Mind & Reflection',
      'habits.inputTypeLabel': 'Input Type',
      'habits.typeBoolean': '✓ Checkmark (Yes / No)',
      'habits.typeNumber': '🔢 Numeric Target',
      'habits.typeDuration': '⏱️ Duration (Minutes)',
      'habits.typePercentage': '📊 Percentage (0-100%)',
      'habits.typeRating': '⭐ Rating Scale',
      'habits.targetValLabel': 'Target Value & Unit',
      'habits.unitPh': 'Unit: pages, cups, min...',
      'habits.frequencyLabel': 'Flexible Frequency',
      'habits.freqDaily': 'Daily (Every Day)',
      'habits.freqWeekly': 'Weekly Target (e.g. 3x/week)',
      'habits.freqSpecific': 'Specific Days of Week',
      'habits.targetDaysPerWeek': 'How many days per week?',
      'habits.selectDays': 'Select Active Days',
      'habits.daySat': 'Saturday',
      'habits.daySun': 'Sunday',
      'habits.dayMon': 'Monday',
      'habits.dayTue': 'Tuesday',
      'habits.dayWed': 'Wednesday',
      'habits.dayThu': 'Thursday',
      'habits.dayFri': 'Friday',
      'habits.iconEmoji': 'Icon (Emoji)',
      'habits.colorPicker': 'Accent Color',
      'habits.existingHabits': 'Active Custom Habits',
      'habits.backupTitle': 'Data Backup & Export',
      'habits.backupSub': 'Export full records of habits, sleep, and mood to prevent data loss',
      'habits.exportJson': 'Export Full JSON Backup',
      'habits.exportCsv': 'Export CSV Spreadsheet (Excel)',
      'habits.importTitle': 'Restore or Merge Backup:',
      'habits.pickBackupFile': 'Select Backup File',
      'habits.noFileSelected': 'No file chosen',
      'habits.applyRestore': 'Apply Restore & Merge',
      'habits.waHubTitle': 'Smart WhatsApp Executive Reports',
      'habits.waHubSub': 'Generate Unicode bar infographics with live preview and direct dispatch',
      'habits.monthlyReport': 'Monthly Report',
      'habits.weeklyReport': 'Weekly Report',
      'habits.sendWaNow': 'Send Report to WhatsApp Now',
      'habits.noChartData': 'No sleep or mood data recorded for this month yet. Use the logger below to record your day.',
      'habits.edit': 'Edit',
      'habits.delete': 'Delete',
      'habits.deleteConfirm': 'Are you sure you want to delete this habit permanently?',
      'habits.daysCount': '{n} days',
      'habits.sleepLogged': '{h} hrs/night',
      'habits.notLogged': 'Not logged',
      'habits.corrRequiresData': 'Pearson correlation requires at least 3 logged days of sleep and mood.',
      'habits.days': 'days',
      'habits.tabGamification': 'Streaks & Milestones Challenge',
      'habits.daysStreak': 'days streak!',
      'habits.streakChallengeTitle': 'Streak Challenge',
      'habits.streakStarted': 'Streak started',
      'habits.streakRecord': 'Streak record',
      'habits.streakMilestones': 'Streak Milestones',
      'habits.heroLevelTitle': 'Discipline & Hero Level',
      'habits.coins': 'Gold Coins',
      'habits.shopTitle': 'Self-Reward Shop',
      'habits.shopSub': 'Redeem your earned coins for real-world rewards that keep you inspired',
      'habits.claimRewardBtn': 'Claim Now',
      'habits.rewardClaimed': 'Reward claimed successfully! Enjoy it 🎉',
      'habits.notEnoughCoins': 'Not enough coins for this reward',
      'habits.addReward': 'Add New Reward',
      'habits.rewardCost': 'Coin Cost',
      'habits.claimedHistory': 'Claimed Rewards History',
      'habits.badHabitTitle': 'Habit Breaker & Resilience',
      'habits.badHabitSub': 'Track habits you want to quit; each day of resistance earns resilience XP and bonus coins',
      'habits.resistedDays': 'days of resistance',
      'habits.markResisted': 'Resisted Today 🛡️',
      'habits.resistedSuccess': '✓ Resisted & Resilient',
      'habits.heatmapTitle': 'Activity & Consistency Heatmap (90 Days)',
      'habits.heatmapSub': 'Habit execution matrix over the last 90 days inspired by GitHub contributions',
      'habits.heatmapLess': 'Less',
      'habits.heatmapMore': 'More',
      'habits.dailyReflection': 'Daily Reflection & Micro-Journal',
      'habits.dailyReflectionPh': 'Jot down a quick thought or reflection on today\'s achievements...',
      'habits.saveNote': 'Save Reflection',
      'habits.noteSaved': 'Reflection saved successfully ✨',
      'habits.directionLabel': 'Habit Direction',
      'habits.dirPositive': '🚀 Positive Habit (Build)',
      'habits.dirNegative': '🛑 Bad Habit Breaker (Quit)',
      'habits.difficultyLabel': 'Difficulty Level',
      'habits.diffTrivial': 'Trivial (+10 XP)',
      'habits.diffEasy': 'Easy (+20 XP)',
      'habits.diffMedium': 'Medium (+40 XP)',
      'habits.diffHard': 'Hard (+80 XP)',
      'habits.freqInterval': 'Every X Days',
      'habits.intervalDays': 'Interval in days',
      'habits.viewWeekly': 'Weekly Focus',
      'habits.viewCompact': 'Compact Month',
      'habits.viewCards': 'Today\'s Cards',
      'habits.viewTable': 'Full Table',
      'habits.prevWeek': 'Previous',
      'habits.nextWeek': 'Next',
      'habits.todayProgress': 'Today\'s Progress',
      'habits.bestStreak': 'Top Active Streak',
      'habits.monthConsistency': 'Monthly Consistency',
      'habits.activeHabitsCount': 'Active Habits',
      'habits.searchPh': 'Search habits...',
      'habits.todayDone': '✓ Completed Today',
      'habits.todaySkip': '⏸️ Skipped',
      'habits.todayPartial': '½ Partial',
      'habits.todayEmpty': '⚪ Log Today',
      'habits.themeMatch': 'System Match (App Theme)',
      'habits.kpiChartsTitle': 'Behavioral Analytics & Performance Charts',
      'habits.chartRoutineTitle': 'Routine Adherence by Period of Day',
      'habits.chartRoutineSub': 'Completion rates across Morning, Afternoon, Evening & Anytime',
      'habits.chartDayOfWeekTitle': 'Day-of-Week Drop-off Distribution',
      'habits.chartDayOfWeekSub': 'Tracking slump patterns across days of the week',
      'habits.chartSleepCompletionTitle': 'Sleep Impact on Habit Completion (Sleep vs Completion)',
      'habits.chartSleepCompletionSub': 'Direct relationship between sleep hours and next-day completion rate',
      'habits.chartMoodProdTitle': 'Mood State vs Productivity',
      'habits.chartMoodProdSub': 'Completion rate on high-mood days compared to stress/fatigue days',
      'habits.enablePomodoroLabel': '⏱️ Enable Pomodoro focus timer for this habit',
      'habits.enablePomodoroHint': 'Quick focus button (⏱️) appears on habit card to start focus sessions instantly.',
      'habits.syncToTodoLabel': '📋 Sync to To-Do List as automatic daily task',
      'habits.todoPriorityLabel': 'To-Do Task Priority:',
      'habits.prioNormal': 'Normal 🟢 (Normal)',
      'habits.prioImportant': 'Important ⚡ 🟠 (Important)',
      'habits.prioUrgent': 'Urgent 🚨 🔴 (Urgent)',
      'habits.syncToCalendarLabel': '📅 Sync to Calendar as daily recurring event',
      'habits.calTimeLabel': 'Calendar Event Time:',
      'habits.calDurationLabel': 'Event Duration:',
      'habits.triggerCueLabel': 'Habit Trigger / Cue',
      'habits.triggerCuePh': 'e.g., After morning prayer, upon opening laptop...',
      'habits.reminderTimeLabel': 'Daily Reminder Time',
      'habits.targetGoalStreakLabel': 'Target Streak Goal (Days)',
      'habits.notesLabel': 'Motivation, Purpose & Inspiring Notes',
      'habits.notesPh': 'Why do I want to stick to this habit? How will it change my life?',
      'habits.questsTitle': 'Daily Quests & Boss Bounties',
      'habits.questsSub': 'Complete your daily objectives to earn gold, XP and streak shields',
      'habits.habitStrength': 'Habit Strength & Stability',
    },
  });

  const MONTH_NAMES_AR = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  const MONTH_NAMES_EN = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  function formatLocalDate(d = new Date()) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function todayStr() {
    return formatLocalDate(new Date());
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

  let state = {
    habits: [],
    logs: {},
    settings: {},
    gamification: { xp: 0, level: 1, coins: 0, vitality: 100, heroClass: 'warrior', hp: 100, maxHp: 100, streakShields: 0 },
    activeMonth: todayStr().slice(0, 7), // YYYY-MM
    activeTab: 'grid',
    viewMode: 'weekly', // 'weekly' | 'compact' | 'cards' | 'table'
    weekOffset: 0, // 0 = current week, -1 = previous, +1 = next
    searchQuery: '',
    heatmapCollapsed: false,
    selectedImportPayload: null,
    reportLang: 'ar',
    heatmapFilterHabitId: 'all',
  };

  /* ---------- Radical Full-Window Theming Engine ---------- */

  function applyDashboardTheme(themeName) {
    const root = document.documentElement;
    const globalTheme = state.allSettings?.look?.theme || root.dataset.theme || 'glass';
    const wTheme = state.allSettings?.widgetStyles?.['habits-dashboard']?.theme || state.allSettings?.widgetStyles?.habits?.theme;
    let tName = (themeName === 'bujo' ? 'notebook' : themeName);
    if (!tName || tName === 'match' || tName === 'inherit') {
      tName = (wTheme && wTheme !== 'inherit') ? wTheme : globalTheme;
    }
    if (tName === 'match') {
      tName = globalTheme;
    }
    document.body.classList.remove(
      'theme-notebook', 'theme-dotgrid', 'theme-graphpaper', 'theme-sketch',
      'theme-craft', 'theme-oled', 'theme-minimal-light', 'theme-emerald',
      'theme-ocean', 'theme-amber'
    );
    const CUSTOM_THEMES = ['dotgrid', 'graphpaper', 'sketch', 'notebook', 'craft', 'oled', 'minimal-light', 'emerald', 'ocean', 'amber'];
    if (CUSTOM_THEMES.includes(tName) && tName !== 'dark-modern') {
      document.body.classList.add(`theme-${tName}`);
    }
    const select = $('#dashThemeSelect');
    if (select && select.value !== (themeName || 'match')) {
      select.value = themeName || 'match';
    }
  }

  function getThemeDoneGlyph() {
    const dotStyle = state.settings?.gridDotStyle || state.allSettings?.habits?.gridDotStyle;
    if (dotStyle === 'glow_dot') return '●';
    if (dotStyle === 'check') return '✓';
    if (dotStyle === 'square') return '■';
    if (dotStyle === 'ring') return '◎';
    const curTheme = state.settings?.theme || state.settings?.habits?.theme || 'match';
    return ['dotgrid', 'graphpaper', 'sketch', 'notebook', 'craft'].includes(curTheme) ? '✕' : '✓';
  }

  function playDashboardChime() {
    if (state.settings?.soundEffects === false || state.allSettings?.habits?.soundEffects === false) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
      setTimeout(() => { try { ctx.close(); } catch (_) { } }, 450);
    } catch (_) { }
  }

  /* ---------- Startup & State Loading ---------- */

  async function loadState() {
    if (!window.widgets?.habits?.getState) return;
    try {
      const data = await window.widgets.habits.getState();
      if (data) {
        state.habits = data.habits || [];
        state.logs = data.logs || {};
        state.settings = data.settings || {};
        state.gamification = data.gamification || state.gamification;

        const curTheme = state.settings?.theme || state.settings?.habits?.theme || 'match';
        applyDashboardTheme(curTheme);

        const isGamified = (state.settings?.gamificationEnabled !== false) && (state.settings?.habits?.gamificationEnabled !== false);
        const gamifyTab = $('[data-tab="gamification"]');
        if (gamifyTab) {
          gamifyTab.style.display = isGamified ? 'inline-flex' : 'none';
        }
        if (!isGamified && state.activeTab === 'gamification') {
          switchTab('grid');
        }

        const plate = $('#dashWindowPlate');
        if (plate) plate.dataset.activeTab = state.activeTab;
        const hud = $('#dashQuickHud');
        if (hud) hud.style.display = (state.activeTab === 'atlas') ? 'none' : '';

        updateMonthDisplay();
        renderActiveTab();
      }
    } catch (err) {
      console.error('Failed to load dashboard state:', err);
    }
  }

  function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }

  function updateMonthDisplay() {
    const [y, m] = state.activeMonth.split('-').map(Number);
    const mName = (lang() === 'en' ? MONTH_NAMES_EN : MONTH_NAMES_AR)[m - 1];
    const dispEl = $('#monthTitleDisplay');
    if (dispEl) dispEl.textContent = `${mName} ${digits(y)}`;
    const langLbl = $('#headerLangLabel');
    if (langLbl) langLbl.textContent = lang() === 'en' ? 'عربي' : 'EN';
  }

  /* ---------- Tab Switching ---------- */

  function updateDashTabIndicator() {
    const sel = document.querySelector('.dash-nav-tabs');
    const ind = document.getElementById('dashTabIndicator');
    if (!sel || !ind) return;
    const activeBtn = sel.querySelector('.dash-tab.active');
    if (!activeBtn) {
      ind.style.opacity = '0';
      return;
    }
    const btnRect = activeBtn.getBoundingClientRect();
    const selRect = sel.getBoundingClientRect();
    if (btnRect.width === 0) {
      if (typeof requestAnimationFrame !== 'undefined') requestAnimationFrame(updateDashTabIndicator);
      return;
    }
    ind.style.opacity = '1';
    ind.style.width = `${btnRect.width}px`;
    ind.style.height = `${btnRect.height}px`;
    ind.style.top = `${activeBtn.offsetTop}px`;
    const offsetLeft = btnRect.left - selRect.left + sel.scrollLeft;
    ind.style.transform = `translateX(${offsetLeft}px)`;
  }

  function switchTab(tabId) {
    state.activeTab = tabId;
    const plate = $('#dashWindowPlate');
    if (plate) plate.dataset.activeTab = tabId;
    const hud = $('#dashQuickHud');
    if (hud) hud.style.display = (tabId === 'atlas') ? 'none' : '';
    $$('.dash-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    updateDashTabIndicator();
    $$('.dash-pane').forEach(p => {
      p.classList.toggle('active', p.id === `pane-${tabId}`);
    });
    renderActiveTab();
  }

  function renderActiveTab() {
    switch (state.activeTab) {
      case 'grid':
        renderBujoGrid();
        renderHeatmap();
        renderDailyReflection();
        break;
      case 'sleep-mood':
        renderSleepMoodLab();
        break;
      case 'kpis':
        renderKpisAndCorrelations();
        break;
      case 'manager':
        renderHabitManager();
        break;
      case 'gamification':
        renderGamification();
        break;
      case 'atlas':
        renderAtlasPane();
        break;
      case 'backup':
        renderBackupAndWaHub();
        break;
    }
  }

  /* ==================================================================== *
   * 1. EXECUTIVE QUICK HUD STRIP & MATRIX MULTI-VIEW RENDERING
   * ==================================================================== */

  function updateQuickStatsHud() {
    const todayStr = formatLocalDate();
    const activeHabits = (state.habits || []).filter(h => !h.archived);

    // 1. Today's progress
    let doneCount = 0;
    activeHabits.forEach(h => {
      const dayLog = state.logs[todayStr];
      const hLog = dayLog?.habits?.[h.id];
      if (hLog) {
        if (hLog.status === 'done') doneCount += 1;
        else if (hLog.status === 'partial') doneCount += 0.5;
      }
    });

    const todayPct = activeHabits.length > 0 ? Math.round((doneCount / activeHabits.length) * 100) : 0;
    const hudVal = $('#hudTodayVal');
    const hudPct = $('#hudTodayPct');
    const hudBar = $('#hudTodayBar');
    if (hudVal) hudVal.textContent = `${digits(doneCount)} / ${digits(activeHabits.length)}`;
    if (hudPct) hudPct.textContent = `${digits(todayPct)}%`;
    if (hudBar) hudBar.style.width = `${todayPct}%`;

    // 2. Best streak
    let bestStreak = 0;
    let bestHabit = null;
    activeHabits.forEach(h => {
      let streak = 0;
      const curDate = new Date();
      for (let i = 0; i < 90; i++) {
        const d = new Date(curDate);
        d.setDate(curDate.getDate() - i);
        const ds = formatLocalDate(d);
        const log = state.logs[ds]?.habits?.[h.id];
        if (log && log.status === 'done') {
          streak++;
        } else if (log && log.status === 'skip') {
          continue;
        } else if (i === 0) {
          continue;
        } else {
          break;
        }
      }
      if (streak > bestStreak) {
        bestStreak = streak;
        bestHabit = h;
      }
    });

    const hudStreakVal = $('#hudStreakVal');
    const hudStreakHabit = $('#hudStreakHabit');
    if (hudStreakVal) hudStreakVal.textContent = `${digits(bestStreak)} ${t('habits.days')}`;
    if (hudStreakHabit) {
      if (bestHabit) {
        const name = lang() === 'en' && bestHabit.titleEn ? bestHabit.titleEn : bestHabit.title;
        hudStreakHabit.textContent = `${bestHabit.icon || '🔥'} ${name}`;
      } else {
        hudStreakHabit.textContent = lang() === 'en' ? 'Start a habit streak' : 'ابدأ سلسلة استمرار';
      }
    }

    // 3. Monthly Consistency
    const [year, month] = state.activeMonth.split('-').map(Number);
    const totalDays = getDaysInMonth(year, month);
    let totalPossible = 0;
    let totalDone = 0;
    for (let day = 1; day <= totalDays; day++) {
      const dStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (dStr > todayStr) break;
      activeHabits.forEach(h => {
        totalPossible += 1;
        const log = state.logs[dStr]?.habits?.[h.id];
        if (log?.status === 'done') totalDone += 1;
        else if (log?.status === 'partial') totalDone += 0.5;
        else if (log?.status === 'skip') totalPossible -= 1;
      });
    }
    const consistencyPct = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;
    const hudConsVal = $('#hudConsistencyVal');
    if (hudConsVal) hudConsVal.textContent = `${digits(consistencyPct)}%`;

    // 4. Active habits count
    const hudActiveCount = $('#hudActiveCount');
    if (hudActiveCount) hudActiveCount.textContent = digits(activeHabits.length);
  }

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

  /* 1A. Weekly Focus Grid (7 Days, Spacious & Click-Friendly) */
  function renderWeeklyGrid(filteredHabits) {
    const wrap = $('#weeklyGridContainer');
    if (!wrap) return;
    wrap.innerHTML = '';

    const todayStr = formatLocalDate();
    const now = new Date();
    const baseDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (state.weekOffset * 7));
    const dayOfWeek = baseDate.getDay(); // 0 is Sun, 6 is Sat

    const weekStartSetting = state.settings?.weekStart || state.allSettings?.habits?.weekStart || 'sat';
    const targetStartDay = weekStartSetting === 'sun' ? 0 : (weekStartSetting === 'mon' ? 1 : 6);
    const diff = (dayOfWeek - targetStartDay + 7) % 7;
    const startOfWeek = new Date(baseDate);
    startOfWeek.setDate(baseDate.getDate() - diff);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      weekDays.push(d);
    }

    const DAY_NAMES_MAP_AR = { 0: 'الأحد', 1: 'الاثنين', 2: 'الثلاثاء', 3: 'الأربعاء', 4: 'الخميس', 5: 'الجمعة', 6: 'السبت' };
    const DAY_NAMES_MAP_EN = { 0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday' };

    const firstDay = weekDays[0];
    const lastDay = weekDays[6];
    const badge = $('#weekTitleBadge');
    if (badge) {
      const mNameFirst = (lang() === 'en' ? MONTH_NAMES_EN : MONTH_NAMES_AR)[firstDay.getMonth()];
      const mNameLast = (lang() === 'en' ? MONTH_NAMES_EN : MONTH_NAMES_AR)[lastDay.getMonth()];
      const rangeStr = firstDay.getMonth() === lastDay.getMonth()
        ? `${digits(firstDay.getDate())} - ${digits(lastDay.getDate())} ${mNameFirst}`
        : `${digits(firstDay.getDate())} ${mNameFirst} - ${digits(lastDay.getDate())} ${mNameLast}`;
      const prefix = state.weekOffset === 0 ? (lang() === 'en' ? 'Current Week' : 'الأسبوع الحالي') : '';
      badge.textContent = prefix ? `${prefix} (${rangeStr})` : rangeStr;
    }

    const table = document.createElement('table');
    table.className = 'weekly-table';

    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');

    const thHabit = document.createElement('th');
    thHabit.className = 'col-habit-title';
    thHabit.textContent = lang() === 'en' ? 'Habits' : 'العادات اليومية';
    trHead.appendChild(thHabit);

    weekDays.forEach((dObj) => {
      const dStr = formatLocalDate(dObj);
      const isToday = dStr === todayStr;
      const isFuture = dStr > todayStr;
      const dayName = (lang() === 'en' ? DAY_NAMES_MAP_EN : DAY_NAMES_MAP_AR)[dObj.getDay()];

      const th = document.createElement('th');
      th.className = `weekly-col-head ${isToday ? 'is-today' : ''} ${isFuture ? 'future-col' : ''}`;
      const headBox = document.createElement('div');
      headBox.className = `weekly-day-head ${isToday ? 'is-today' : ''}`;
      headBox.innerHTML = `
        <span class="d-name">${dayName} ${isToday ? (lang() === 'en' ? '(Today)' : '(اليوم)') : ''}</span>
        <span class="d-num">${digits(dObj.getDate())}</span>
      `;
      th.appendChild(headBox);
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    filteredHabits.forEach(h => {
      const tr = document.createElement('tr');

      const tdTitle = document.createElement('td');
      tdTitle.className = 'col-habit-title';
      tdTitle.style.cursor = 'pointer';
      tdTitle.title = lang() === 'en' ? 'Click to view habit strength & analytics' : 'اضغط لعرض قوة العادة وتحليلاتها وتاريخها الكامل';
      const habitName = lang() === 'en' && h.titleEn ? h.titleEn : h.title;
      tdTitle.innerHTML = `
        <div class="weekly-habit-title-box">
          <div class="dash-h-icon-box" style="--h-color: ${h.color || '#3b82f6'};">${getHabitIconSvg(h.icon, habitName, h.color)}</div>
          <div>
            <div class="h-name">${habitName}</div>
            <div class="h-sub">${h.routine || 'anytime'}</div>
          </div>
        </div>
      `;
      tdTitle.onclick = () => openHabitDetailModal(h.id);
      tr.appendChild(tdTitle);

      weekDays.forEach(dObj => {
        const dStr = formatLocalDate(dObj);
        const isToday = dStr === todayStr;
        const isFuture = dStr > todayStr;

        const td = document.createElement('td');
        if (isToday) td.className = 'is-today';
        if (isFuture) td.classList.add('future-col');

        const dayLog = state.logs[dStr];
        const hLog = dayLog?.habits?.[h.id];

        const btn = document.createElement('button');
        btn.className = 'weekly-btn';

        if (isFuture) {
          btn.classList.add('future-disabled');
          btn.disabled = true;
          btn.title = lang() === 'en' ? 'Future date (cannot log)' : 'يوم قادم (لا يمكن تسجيله)';
          btn.textContent = '·';
        } else {
          if (hLog) {
            if (hLog.status === 'done') {
              btn.classList.add('done');
              btn.textContent = getThemeDoneGlyph() || '✓';
              if (h.color) btn.style.background = h.color;
            } else if (hLog.status === 'skip') {
              btn.classList.add('skip');
              btn.textContent = '⏸';
            } else if (hLog.status === 'partial') {
              btn.classList.add('partial');
              btn.textContent = h.type === 'percentage' && hLog.value ? `${digits(hLog.value)}%` : '½';
            } else {
              btn.classList.add('empty');
              btn.textContent = '○';
            }
          } else {
            btn.classList.add('empty');
            btn.textContent = '○';
          }

          btn.onclick = async () => {
            const curStatus = hLog ? hLog.status : 'none';
            const curVal = hLog && hLog.value !== undefined && hLog.value !== null ? Number(hLog.value) : null;
            const { nextStatus, nextVal } = computeNextHabitLog(h, curStatus, curVal);

            if (window.widgets?.habits?.saveStatus) {
              await window.widgets.habits.saveStatus({
                dateStr: dStr,
                habitId: h.id,
                status: nextStatus,
                value: nextVal,
              });
              if (nextStatus === 'done') playDashboardChime();
              if (!state.logs[dStr]) state.logs[dStr] = { habits: {} };
              if (!state.logs[dStr].habits) state.logs[dStr].habits = {};
              if (nextStatus === 'none') delete state.logs[dStr].habits[h.id];
              else state.logs[dStr].habits[h.id] = { status: nextStatus, value: nextVal };
              renderBujoGrid();
            }
          };
        }

        td.appendChild(btn);
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    wrap.appendChild(table);
  }

  /* 1B. Compact Month View (Auto-fits Entire Month Without Scroll) */
  function renderCompactGrid(filteredHabits) {
    const wrap = $('#compactGridContainer');
    if (!wrap) return;
    wrap.innerHTML = '';

    const [year, month] = state.activeMonth.split('-').map(Number);
    const totalDays = getDaysInMonth(year, month);
    const todayStr = formatLocalDate();

    filteredHabits.forEach(h => {
      const row = document.createElement('div');
      row.className = 'compact-habit-row';

      const title = document.createElement('div');
      title.className = 'compact-habit-title';
      const hName = lang() === 'en' && h.titleEn ? h.titleEn : h.title;
      title.innerHTML = `<span class="compact-habit-icon" style="color: ${h.color || 'var(--dash-accent)'}; display: inline-flex; vertical-align: middle;">${getHabitIconSvg(h.icon, hName, h.color)}</span> <span>${hName}</span>`;
      title.onclick = () => openHabitDetailModal(h.id);
      row.appendChild(title);

      const strip = document.createElement('div');
      strip.className = 'compact-dots-strip';

      let doneCount = 0;
      for (let day = 1; day <= totalDays; day++) {
        const dStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = dStr === todayStr;
        const isFuture = dStr > todayStr;
        const dayLog = state.logs[dStr];
        const hLog = dayLog?.habits?.[h.id];

        const cell = document.createElement('div');
        cell.className = 'compact-dot-cell';
        if (isToday) cell.classList.add('is-today');
        if (isFuture) cell.classList.add('future-disabled');

        if (hLog) {
          if (hLog.status === 'done') {
            cell.classList.add('done');
            cell.textContent = getThemeDoneGlyph() || '✓';
            doneCount++;
          } else if (hLog.status === 'skip') {
            cell.classList.add('skip');
            cell.textContent = '⏸';
          } else if (hLog.status === 'partial') {
            cell.classList.add('partial');
            cell.textContent = h.type === 'percentage' && hLog.value ? `${digits(hLog.value)}%` : '½';
            doneCount += 0.5;
          } else {
            cell.classList.add('empty');
            cell.textContent = '○';
          }
        } else {
          cell.classList.add('empty');
          cell.textContent = '○';
        }

        cell.title = `${dStr}: ${hLog?.status || 'none'}`;

        if (!isFuture) {
          cell.onclick = async () => {
            const curStatus = hLog ? hLog.status : 'none';
            const curVal = hLog && hLog.value !== undefined && hLog.value !== null ? Number(hLog.value) : null;
            const { nextStatus, nextVal } = computeNextHabitLog(h, curStatus, curVal);

            if (window.widgets?.habits?.saveStatus) {
              await window.widgets.habits.saveStatus({
                dateStr: dStr,
                habitId: h.id,
                status: nextStatus,
                value: nextVal,
              });
              if (nextStatus === 'done') playDashboardChime();
              if (!state.logs[dStr]) state.logs[dStr] = { habits: {} };
              if (!state.logs[dStr].habits) state.logs[dStr].habits = {};
              if (nextStatus === 'none') delete state.logs[dStr].habits[h.id];
              else state.logs[dStr].habits[h.id] = { status: nextStatus, value: nextVal };
              renderBujoGrid();
            }
          };
        }

        strip.appendChild(cell);
      }
      row.appendChild(strip);

      const pct = document.createElement('div');
      const pctVal = Math.round((doneCount / totalDays) * 100);
      pct.className = 'compact-habit-pct';
      pct.textContent = `${digits(pctVal)}%`;
      row.appendChild(pct);

      wrap.appendChild(row);
    });
  }

  /* 1C. Today's Action Cards Grid View */
  function renderCardsGrid(filteredHabits) {
    const wrap = $('#cardsGridContainer');
    if (!wrap) return;
    wrap.innerHTML = '';

    const todayStr = formatLocalDate();

    filteredHabits.forEach(h => {
      const card = document.createElement('div');
      card.className = 'habit-card';

      const habitName = lang() === 'en' && h.titleEn ? h.titleEn : h.title;
      const dayLog = state.logs[todayStr];
      const hLog = dayLog?.habits?.[h.id];
      const curStatus = hLog?.status || 'none';

      const top = document.createElement('div');
      top.className = 'habit-card-top';
      top.innerHTML = `
        <div class="habit-card-title-group" style="cursor: pointer;">
          <div class="dash-h-icon-box" style="--h-color: ${h.color || '#3b82f6'};">${getHabitIconSvg(h.icon, habitName, h.color)}</div>
          <div>
            <h4 class="habit-card-title">${habitName}</h4>
            <div class="habit-card-sub">${h.category || 'general'} • ${h.routine || 'anytime'}</div>
          </div>
        </div>
        <div class="habit-streak-badge"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" style="vertical-align: -1px; margin-inline-end: 3px;"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>${digits(h.streak || 0)} ${t('habits.days')}</div>
      `;
      top.querySelector('.habit-card-title-group').onclick = () => openHabitDetailModal(h.id);
      card.appendChild(top);

      const actBtn = document.createElement('button');
      actBtn.type = 'button';
      actBtn.className = `habit-card-action-btn ${curStatus !== 'none' ? curStatus : ''}`;

      if (curStatus === 'done') {
        actBtn.innerHTML = `<span>${getThemeDoneGlyph()}</span> <span>${t('habits.todayDone')}</span>`;
      } else if (curStatus === 'skip') {
        actBtn.innerHTML = `<span>⏸</span> <span>${t('habits.todaySkip')}</span>`;
      } else if (curStatus === 'partial') {
        const pctLabel = h.type === 'percentage' && hLog?.value ? `${digits(hLog.value)}%` : '½';
        actBtn.innerHTML = `<span>${pctLabel}</span> <span>${t('habits.todayPartial')}</span>`;
      } else {
        actBtn.innerHTML = `<span>○</span> <span>${t('habits.todayEmpty')}</span>`;
      }

      actBtn.onclick = async () => {
        const curVal = hLog && hLog.value !== undefined && hLog.value !== null ? Number(hLog.value) : null;
        const { nextStatus, nextVal } = computeNextHabitLog(h, curStatus, curVal);

        if (window.widgets?.habits?.saveStatus) {
          await window.widgets.habits.saveStatus({
            dateStr: todayStr,
            habitId: h.id,
            status: nextStatus,
            value: nextVal,
          });
          if (nextStatus === 'done') playDashboardChime();
          if (!state.logs[todayStr]) state.logs[todayStr] = { habits: {} };
          if (!state.logs[todayStr].habits) state.logs[todayStr].habits = {};
          if (nextStatus === 'none') delete state.logs[todayStr].habits[h.id];
          else state.logs[todayStr].habits[h.id] = { status: nextStatus, value: nextVal };
          renderBujoGrid();
        }
      };
      card.appendChild(actBtn);

      const strip = document.createElement('div');
      strip.className = 'compact-dots-strip';
      const curDate = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(curDate);
        d.setDate(curDate.getDate() - i);
        const ds = formatLocalDate(d);
        const lg = state.logs[ds]?.habits?.[h.id];
        const dot = document.createElement('div');
        dot.className = 'compact-dot-cell';
        if (ds === todayStr) dot.classList.add('is-today');
        if (lg?.status === 'done') { dot.classList.add('done'); dot.textContent = getThemeDoneGlyph(); }
        else if (lg?.status === 'skip') { dot.classList.add('skip'); dot.textContent = '⏸'; }
        else if (lg?.status === 'partial') { dot.classList.add('partial'); dot.textContent = '½'; }
        dot.title = ds;
        strip.appendChild(dot);
      }
      card.appendChild(strip);

      wrap.appendChild(card);
    });
  }

  /* 1D. Main Multi-View Matrix Orchestrator */
  function renderBujoGrid() {
    updateQuickStatsHud();

    // Sync View Switcher Buttons
    $$('.view-switch-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === state.viewMode);
    });

    const isWeekly = state.viewMode === 'weekly';
    const isCompact = state.viewMode === 'compact';
    const isCards = state.viewMode === 'cards';
    const isTable = state.viewMode === 'table';

    const wWrap = $('#weeklyViewWrap');
    const wNav = $('#weeklyNavBar');
    const mNav = $('#monthlyNavBar');
    const cWrap = $('#compactViewWrap');
    const cardWrap = $('#cardsViewWrap');
    const tblWrap = $('#bujoGridWrap');

    if (wWrap) wWrap.style.display = isWeekly ? 'block' : 'none';
    if (wNav) wNav.style.display = isWeekly ? 'flex' : 'none';
    if (mNav) mNav.style.display = (isCompact || isTable) ? 'flex' : 'none';
    if (cWrap) cWrap.style.display = isCompact ? 'block' : 'none';
    if (cardWrap) cardWrap.style.display = isCards ? 'block' : 'none';
    if (tblWrap) tblWrap.style.display = isTable ? 'block' : 'none';

    // Filter habits by routine & search query
    const routineFilter = $('#matrixRoutineFilter')?.value || 'all';
    const activeHabits = (state.habits || []).filter(h => !h.archived);
    let filteredHabits = routineFilter === 'all'
      ? activeHabits
      : activeHabits.filter(h => (h.routine || 'anytime') === routineFilter);

    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      filteredHabits = filteredHabits.filter(h =>
        (h.title && h.title.toLowerCase().includes(q)) ||
        (h.titleEn && h.titleEn.toLowerCase().includes(q))
      );
    }

    if (isWeekly) {
      renderWeeklyGrid(filteredHabits);
    } else if (isCompact) {
      renderCompactGrid(filteredHabits);
    } else if (isCards) {
      renderCardsGrid(filteredHabits);
    }

    // Always maintain the bujoTable for full table view and tests
    const table = $('#bujoTable');
    if (!table) return;
    table.innerHTML = '';

    const [year, month] = state.activeMonth.split('-').map(Number);
    const totalDays = getDaysInMonth(year, month);
    const todayStr = formatLocalDate();

    const dayLettersAr = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];
    const dayLettersEn = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const letters = lang() === 'en' ? dayLettersEn : dayLettersAr;

    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');

    const thHabit = document.createElement('th');
    thHabit.className = 'col-habit-title';
    thHabit.textContent = lang() === 'en' ? 'Habits' : 'العادات';
    trHead.appendChild(thHabit);

    for (let day = 1; day <= totalDays; day++) {
      const dObj = new Date(year, month - 1, day);
      const dStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = dStr === todayStr;
      const isFuture = dStr > todayStr;

      const thDay = document.createElement('th');
      thDay.className = `col-day-num ${isToday ? 'is-today' : ''} ${isFuture ? 'future-col' : ''}`;
      thDay.innerHTML = `<div>${letters[dObj.getDay()]}</div><div>${digits(day)}</div>`;
      trHead.appendChild(thDay);
    }
    thead.appendChild(trHead);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    const dailyCompletedTotals = new Array(totalDays + 1).fill(0);

    filteredHabits.forEach(h => {
      const tr = document.createElement('tr');

      const tdTitle = document.createElement('td');
      tdTitle.className = 'col-habit-title';
      tdTitle.style.cursor = 'pointer';
      tdTitle.title = lang() === 'en' ? 'Click to view habit strength & 90-day analytics' : 'اضغط لعرض قوة العادة وتحليلاتها وتاريخها الكامل';
      const habitName = lang() === 'en' && h.titleEn ? h.titleEn : h.title;
      tdTitle.innerHTML = `<span class="bujo-habit-icon" style="display:inline-flex; vertical-align:middle; margin-inline-end: 6px; color: ${h.color || 'var(--dash-accent)'};">${getHabitIconSvg(h.icon, habitName, h.color)}</span> <span>${habitName}</span>`;
      tdTitle.onclick = () => openHabitDetailModal(h.id);
      tr.appendChild(tdTitle);

      for (let day = 1; day <= totalDays; day++) {
        const dStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = dStr === todayStr;
        const isFuture = dStr > todayStr;

        const tdDay = document.createElement('td');
        if (isToday) tdDay.className = 'is-today';
        if (isFuture) tdDay.classList.add('future-col');

        const dayLog = state.logs[dStr];
        const hLog = dayLog && dayLog.habits && dayLog.habits[h.id];

        const btn = document.createElement('button');
        btn.className = 'bujo-dot-btn';

        if (isFuture) {
          btn.classList.add('future-disabled');
          btn.disabled = true;
          btn.title = lang() === 'en' ? 'Future date (cannot log)' : 'يوم قادم (لا يمكن تسجيله)';
          btn.textContent = '·';
        } else {
          if (hLog) {
            if (hLog.status === 'done') {
              btn.classList.add('done');
              btn.textContent = getThemeDoneGlyph();
              if (h.color) btn.style.background = h.color;
              dailyCompletedTotals[day]++;
            } else if (hLog.status === 'skip') {
              btn.classList.add('skip');
              btn.textContent = '⏸️';
            } else if (hLog.status === 'partial') {
              btn.classList.add('partial');
              btn.textContent = h.type === 'percentage' && hLog.value ? `${digits(hLog.value)}%` : '½';
              dailyCompletedTotals[day] += 0.5;
            }
          }

          btn.onclick = async () => {
            const curStatus = hLog ? hLog.status : 'none';
            const curVal = hLog && hLog.value !== undefined && hLog.value !== null ? Number(hLog.value) : null;
            const { nextStatus, nextVal } = computeNextHabitLog(h, curStatus, curVal);

            if (window.widgets?.habits?.saveStatus) {
              await window.widgets.habits.saveStatus({
                dateStr: dStr,
                habitId: h.id,
                status: nextStatus,
                value: nextVal,
              });
              if (nextStatus === 'done') playDashboardChime();
              if (!state.logs[dStr]) state.logs[dStr] = { habits: {} };
              if (!state.logs[dStr].habits) state.logs[dStr].habits = {};
              if (nextStatus === 'none') delete state.logs[dStr].habits[h.id];
              else state.logs[dStr].habits[h.id] = { status: nextStatus, value: nextVal };
              renderBujoGrid();
            }
          };
        }

        tdDay.appendChild(btn);
        tr.appendChild(tdDay);
      }
      tbody.appendChild(tr);
    });

    const trTotals = document.createElement('tr');
    trTotals.className = 'bujo-totals-row';

    const tdTotalsLabel = document.createElement('td');
    tdTotalsLabel.className = 'col-habit-title';
    tdTotalsLabel.innerHTML = `<strong>${t('habits.dailyTotals')}</strong>`;
    trTotals.appendChild(tdTotalsLabel);

    for (let day = 1; day <= totalDays; day++) {
      const dStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = dStr === todayStr;
      const isFuture = dStr > todayStr;

      const tdTot = document.createElement('td');
      if (isToday) tdTot.className = 'is-today';
      if (isFuture) tdTot.classList.add('future-col');

      const tot = dailyCompletedTotals[day];
      const span = document.createElement('span');
      span.className = `bujo-totals-val ${tot >= 3 ? 'highlight' : ''}`;
      span.textContent = (!isFuture && tot > 0) ? digits(tot) : '·';

      tdTot.appendChild(span);
      trTotals.appendChild(tdTot);
    }
    if (state.settings?.showDailyTotals !== false && state.allSettings?.habits?.showDailyTotals !== false) {
      tbody.appendChild(trTotals);
    }
    table.appendChild(tbody);
    renderQuickHabitsPulse();
  }

  function renderQuickHabitsPulse() {
    const strip = $('#pulseHabitsStrip');
    if (!strip) return;
    strip.innerHTML = '';
    const todayStr = formatLocalDate();
    const activeHabits = (state.habits || []).filter(h => !h.archived);
    if (activeHabits.length === 0) {
      strip.innerHTML = `<div style="font-size:12px;color:var(--dash-text-sub);padding:8px;">لا توجد عادات نشطة حالياً. أضف عادة جديدة للبدء!</div>`;
      return;
    }

    let completedToday = 0;
    activeHabits.forEach(h => {
      const isDone = (state.logs?.[todayStr]?.habits?.[h.id]?.status === 'done');
      if (isDone) completedToday++;

      const item = document.createElement('div');
      item.className = 'pulse-habit-item';
      item.innerHTML = `
        <div class="pulse-habit-left">
          <span class="pulse-habit-icon">${h.icon || '🎯'}</span>
          <span class="pulse-habit-name" title="${h.name || h.title || ''}">${h.name || h.title || ''}</span>
        </div>
        <button type="button" class="pulse-check-btn ${isDone ? 'done' : ''}" title="${isDone ? 'مكتملة (اضغط للإلغاء)' : 'اضغط لإتمام العادة اليوم'}">
          ${isDone ? '✓' : ''}
        </button>
      `;

      item.onclick = async () => {
        const nextStatus = isDone ? 'none' : 'done';
        const nextVal = nextStatus === 'done' ? 1 : 0;
        if (window.widgets?.habits?.saveStatus) {
          await window.widgets.habits.saveStatus({
            dateStr: todayStr,
            habitId: h.id,
            status: nextStatus,
            value: nextVal,
          });
        }
        if (!state.logs[todayStr]) state.logs[todayStr] = { habits: {} };
        if (!state.logs[todayStr].habits) state.logs[todayStr].habits = {};
        if (nextStatus === 'none') delete state.logs[todayStr].habits[h.id];
        else state.logs[todayStr].habits[h.id] = { status: nextStatus, value: nextVal };

        renderBujoGrid();
      };

      strip.appendChild(item);
    });

    const rateEl = $('#pulseCompletionRate');
    if (rateEl) {
      const pct = Math.round((completedToday / activeHabits.length) * 100);
      rateEl.textContent = `${digits(completedToday)}/${digits(activeHabits.length)} مكتملة اليوم (${digits(pct)}%)`;
      if (pct === 100) {
        rateEl.style.background = 'rgba(16, 185, 129, 0.2)';
        rateEl.style.borderColor = '#10b981';
      }
    }
  }

  /* ==================================================================== *
   * 1A. LOOP HABIT TRACKER SINGLE HABIT DEEP-DIVE MODAL
   * ==================================================================== */

  let activeDetailHabitId = null;

  async function openHabitDetailModal(habitId) {
    const modal = $('#habitDetailModal');
    if (!modal) return;
    const habit = (state.habits || []).find(h => h.id === habitId);
    if (!habit) return;

    activeDetailHabitId = habitId;
    state.activeDetailHabitId = habitId;
    const isEn = lang() === 'en';

    const iconEl = $('#hdIcon');
    if (iconEl) iconEl.textContent = habit.icon || '⭐';
    const titleEl = $('#hdTitle');
    if (titleEl) titleEl.textContent = isEn && habit.titleEn ? habit.titleEn : habit.title;
    const subEl = $('#hdSub');
    if (subEl) {
      const catName = habit.category || 'general';
      const routName = habit.routine || 'anytime';
      subEl.textContent = `${catName}  •  ${routName}`;
    }

    modal.hidden = false;

    try {
      if (window.widgets?.habits?.getHabitHistory) {
        const data = await window.widgets.habits.getHabitHistory({ habitId, daysCount: 90 });
        if (!data) return;

        // Habit Strength Gauge (Loop Habit Tracker Style)
        const str = data.strength || 0;
        const pctEl = $('#hdStrengthPct');
        if (pctEl) pctEl.textContent = `${digits(str)}%`;
        const ring = $('#hdStrengthRing');
        if (ring) {
          const circ = 201.06;
          const offset = circ * (1 - str / 100);
          ring.style.strokeDashoffset = offset;
          if (str >= 80) ring.style.stroke = 'var(--dash-success, #10b981)';
          else if (str >= 50) ring.style.stroke = 'var(--dash-accent, #3b82f6)';
          else if (str >= 25) ring.style.stroke = 'var(--dash-warning, #f59e0b)';
          else ring.style.stroke = 'var(--dash-danger, #ef4444)';
        }

        let statusStr = '';
        if (str >= 80) statusStr = isEn ? 'Solid & Automated 🌟' : 'عادة راسخة وتلقائية 🌟';
        else if (str >= 50) statusStr = isEn ? 'Building Momentum ⚡' : 'في طور التثبيت والتطور ⚡';
        else if (str >= 25) statusStr = isEn ? 'Early Stage 🌱' : 'في مرحلة البناء الأولى 🌱';
        else statusStr = isEn ? 'Needs Focus ⚠️' : 'تحتاج تركيزاً والتزاماً ⚠️';
        const stEl = $('#hdStrengthStatus');
        if (stEl) stEl.textContent = statusStr;

        // Streaks
        const curStreak = data.streak?.current || 0;
        const bestStreak = data.streak?.longest || 0;
        const curEl = $('#hdCurrentStreak');
        if (curEl) curEl.textContent = `${digits(curStreak)} ${t('habits.days')}`;
        const bestEl = $('#hdBestStreak');
        if (bestEl) bestEl.textContent = `${digits(bestStreak)} ${t('habits.days')}`;

        // 90-Day Mini Dot Grid
        const grid = $('#hdMiniGrid');
        if (grid) {
          grid.innerHTML = '';
          (data.cells || []).forEach(c => {
            const dot = document.createElement('div');
            dot.className = `hd-mini-dot ${c.status || 'none'}`;
            if (!c.scheduled) dot.classList.add('not-scheduled');
            let statusTxt = t('habits.statusNone');
            if (c.status === 'done') statusTxt = t('habits.statusDone');
            else if (c.status === 'skip') statusTxt = t('habits.statusSkip');
            else if (c.status === 'partial') statusTxt = t('habits.statusPartial');
            dot.title = `${c.date}: ${statusTxt}`;
            grid.appendChild(dot);
          });
        }

        // Notes History
        const notesEl = $('#hdNotesList');
        if (notesEl) {
          notesEl.innerHTML = '';
          const notes = data.notesHistory || [];
          if (notes.length === 0) {
            notesEl.innerHTML = `<div style="font-size: 11px; color: var(--dash-text-sub); padding: 6px;">${isEn ? 'No notes recorded for this habit.' : 'لا توجد ملاحظات مسجلة لهذه العادة.'}</div>`;
          } else {
            notes.forEach(n => {
              const item = document.createElement('div');
              item.className = 'hd-note-item';
              item.innerHTML = `
                <span class="hd-note-date">${n.date}</span>
                <span class="hd-note-text">${n.note}</span>
              `;
              notesEl.appendChild(item);
            });
          }
        }

        // Urgency & Overdue Score (OpenHabitTracker)
        let urgency = { score: 0, statusTag: 'good' };
        try {
          if (window.widgets?.habits?.getHabitUrgency) {
            urgency = await window.widgets.habits.getHabitUrgency(habitId) || urgency;
          }
        } catch { }
        const urgEl = $('#hdUrgencyVal');
        if (urgEl) {
          let urgLabel = '';
          if (urgency.score >= 80) urgLabel = isEn ? 'Overdue ⚠️' : 'متأخرة ومستحقة ⚠️';
          else if (urgency.score >= 50) urgLabel = isEn ? 'Due Today ⏰' : 'مستحقة اليوم ⏰';
          else if (urgency.score >= 30) urgLabel = isEn ? 'Due Tomorrow ⏳' : 'مستحقة غداً ⏳';
          else urgLabel = isEn ? 'On Track ✓' : 'في المسار الصحيح ✓';
          urgEl.textContent = `${digits(urgency.score)}% (${urgLabel})`;
          urgEl.style.color = urgency.score >= 80 ? 'var(--dash-danger, #ef4444)' : (urgency.score >= 50 ? 'var(--dash-warning, #f59e0b)' : 'var(--dash-success, #10b981)');
        }

        // Sub-Items Checklist (OpenHabitTracker)
        const subItemsWrap = $('#hdSubItemsList');
        const subItemsTitle = $('#hdSubItemsTitle');
        if (subItemsWrap) {
          const todayStr = formatLocalDate();
          const dayLog = state.logs[todayStr] || { habits: {} };
          const hLog = dayLog.habits && dayLog.habits[habitId];
          const loggedSubItems = (hLog && Array.isArray(hLog.subItems)) ? hLog.subItems : null;
          const subItems = loggedSubItems || habit.subItems || [];
          if (subItems.length > 0) {
            if (subItemsTitle) subItemsTitle.style.display = 'block';
            subItemsWrap.style.display = 'flex';
            subItemsWrap.innerHTML = '';
            subItems.forEach((item, idx) => {
              const itemRow = document.createElement('div');
              itemRow.className = 'hd-subitem-row';
              itemRow.style.cssText = 'display:flex;align-items:center;gap:8px;padding:6px;background:rgba(255,255,255,0.03);border-radius:6px;';
              const chk = document.createElement('input');
              chk.type = 'checkbox';
              chk.checked = Boolean(item.completed);
              chk.onchange = async () => {
                const updated = subItems.map((si, i) => i === idx ? { ...si, completed: chk.checked } : si);
                if (window.widgets?.habits?.saveSubItems) {
                  await window.widgets.habits.saveSubItems(todayStr, habitId, updated);
                  await loadState();
                  openHabitDetailModal(habitId);
                }
              };
              const titleSpan = document.createElement('span');
              titleSpan.textContent = isEn && item.titleEn ? item.titleEn : item.title;
              titleSpan.style.textDecoration = item.completed ? 'line-through' : 'none';
              titleSpan.style.opacity = item.completed ? '0.6' : '1';
              itemRow.appendChild(chk);
              itemRow.appendChild(titleSpan);
              subItemsWrap.appendChild(itemRow);
            });
          } else {
            if (subItemsTitle) subItemsTitle.style.display = 'none';
            subItemsWrap.style.display = 'none';
          }
        }

        // CSV Export Button (Loop Habit Tracker)
        const csvBtn = $('#hdExportCsvBtn');
        if (csvBtn) {
          csvBtn.onclick = async () => {
            try {
              if (window.widgets?.habits?.exportHabitCsv) {
                const res = await window.widgets.habits.exportHabitCsv(habitId);
                if (res?.success) {
                  alert(isEn ? `Exported CSV successfully to:\n${res.filePath}` : `تم تصدير ملف CSV بنجاح إلى:\n${res.filePath}`);
                }
              }
            } catch (err) {
              alert(err.message || 'CSV Export failed');
            }
          };
        }
      }
    } catch (err) {
      console.error('Failed to load habit history:', err);
    }
  }

  /* ==================================================================== *
   * 1B. 90-DAY ACTIVITY CONTRIBUTION HEATMAP (HabitFlow Style)
   * ==================================================================== */

  let selectedReflectionDate = formatLocalDate();

  async function renderHeatmap() {
    const gridEl = $('#heatmapGrid');
    if (!gridEl) return;
    gridEl.innerHTML = '';

    const filterSelect = $('#heatmapHabitFilter');
    if (filterSelect && filterSelect.options && filterSelect.options.length <= 1) {
      filterSelect.innerHTML = `<option value="all">${lang() === 'en' ? '🌐 All Habits (Overall Activity)' : '🌐 كل العادات (مؤشر الإنجاز الإجمالي)'}</option>`;
      (state.habits || []).filter(h => !h.archived).forEach(h => {
        const opt = document.createElement('option');
        opt.value = h.id;
        opt.textContent = `${h.icon || '⭐'} ${lang() === 'en' && h.titleEn ? h.titleEn : h.title}`;
        filterSelect.appendChild(opt);
      });
      filterSelect.value = state.heatmapFilterHabitId || 'all';
      filterSelect.onchange = (e) => {
        state.heatmapFilterHabitId = e.target.value;
        renderHeatmap();
      };
    }

    let cells = [];
    try {
      if (window.widgets?.habits?.getActivityHeatmap) {
        const filterId = state.heatmapFilterHabitId === 'all' ? null : state.heatmapFilterHabitId;
        cells = await window.widgets.habits.getActivityHeatmap(91, filterId);
      }
    } catch (e) {
      console.error('Failed to get activity heatmap:', e);
    }
    if (!cells || cells.length === 0) return;

    // Group into columns of 7 days (weeks)
    const weeks = [];
    let currentWeek = [];
    cells.forEach((cell, idx) => {
      currentWeek.push(cell);
      if (currentWeek.length === 7 || idx === cells.length - 1) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    weeks.forEach(week => {
      const col = document.createElement('div');
      col.className = 'hm-week-col';
      week.forEach(c => {
        const cellEl = document.createElement('div');
        cellEl.className = `hm-cell lvl-${c.level}`;
        const pctText = `${c.rate}% (${c.completed}/${c.scheduled})`;
        const noteHint = c.dailyNote ? ` | 📝: "${c.dailyNote}"` : '';
        cellEl.title = `${c.date}: ${pctText}${noteHint}`;

        cellEl.addEventListener('click', () => {
          selectReflectionDate(c.date, c.dailyNote);
        });

        col.appendChild(cellEl);
      });
      gridEl.appendChild(col);
    });
  }

  /* ==================================================================== *
   * 1C. DAILY REFLECTION MICRO-NOTE (OpenHabitTracker Style)
   * ==================================================================== */

  async function renderDailyReflection() {
    const tag = $('#reflectionDateTag');
    const textarea = $('#reflectionTextarea');
    if (!tag || !textarea) return;

    tag.textContent = selectedReflectionDate;
    try {
      if (window.widgets?.habits?.getDayNote) {
        const note = await window.widgets.habits.getDayNote(selectedReflectionDate);
        textarea.value = note || '';
      }
    } catch (err) {
      console.error('Failed to load day note:', err);
    }
  }

  function selectReflectionDate(dateStr, note = '') {
    selectedReflectionDate = dateStr;
    const tag = $('#reflectionDateTag');
    const textarea = $('#reflectionTextarea');
    if (tag) tag.textContent = dateStr;
    if (textarea) textarea.value = note || '';
    const statusEl = $('#reflectionSaveStatus');
    if (statusEl) statusEl.textContent = '';
    textarea?.focus();
  }

  /* ==================================================================== *
   * 2. SLEEP & MOOD LAB (High Precision SVG with Authentic Themed Styles)
   * ==================================================================== */

  function getThemeChartPalette() {
    const curTheme = state.settings?.habits?.theme || state.settings?.theme || 'dark-modern';
    switch (curTheme) {
      case 'dotgrid':
        return {
          font: "'Segoe Print', 'Caveat', cursive, sans-serif",
          bg: '#faf6ee',
          gridStroke: 'rgba(184, 169, 146, 0.45)',
          axisStroke: '#44403c',
          textMain: '#292524',
          textSub: '#78716c',
          moodStroke: '#e11d48',       // Pink/Rose Marker (Reference 1)
          moodNodeFill: '#e11d48',
          stressStroke: '#8b5cf6',     // Purple Marker (Reference 1)
          sleepGood: '#0284c7',        // Sky Blue Marker (Reference 1)
          sleepWarn: '#f59e0b',        // Amber Marker (Reference 1)
          sleepBad: '#e11d48',         // Red Marker (Reference 1)
          screenStroke: '#f97316',     // Orange Marker (Reference 1)
          starGlyph: '★',
          isDotGrid: true,
        };
      case 'graphpaper':
        return {
          font: "'Consolas', 'Courier New', monospace",
          bg: '#f8fafc',
          gridStroke: 'rgba(14, 165, 233, 0.25)',
          axisStroke: '#0369a1',
          textMain: '#0f172a',
          textSub: '#475569',
          moodStroke: '#0284c7',
          moodNodeFill: '#0284c7',
          stressStroke: '#dc2626',
          sleepGood: '#059669',
          sleepWarn: '#d97706',
          sleepBad: '#dc2626',
          screenStroke: '#7c3aed',
          starGlyph: '✦',
          isGridPaper: true,
        };
      case 'sketch':
        return {
          font: "'Segoe Print', 'Comic Sans MS', cursive",
          bg: '#ffffff',
          gridStroke: 'rgba(30, 41, 59, 0.2)',
          axisStroke: '#1e293b',
          textMain: '#1e293b',
          textSub: '#64748b',
          moodStroke: '#1e293b',
          moodNodeFill: '#334155',
          stressStroke: '#64748b',
          sleepGood: '#1e293b',
          sleepWarn: '#64748b',
          sleepBad: '#94a3b8',
          screenStroke: '#0f172a',
          starGlyph: '★',
          isSketch: true,
        };
      case 'notebook':
        return {
          font: "'Segoe Print', 'Caveat', cursive",
          bg: '#fbf8f0',
          gridStroke: 'rgba(130, 160, 200, 0.3)',
          axisStroke: '#3c424a',
          textMain: '#26292e',
          textSub: '#4b525d',
          moodStroke: '#1e3a8a',
          moodNodeFill: '#1e3a8a',
          stressStroke: '#dc2626',
          sleepGood: '#15803d',
          sleepWarn: '#b45309',
          sleepBad: '#b91c1c',
          screenStroke: '#7c2d12',
          starGlyph: '★',
          isRuled: true,
        };
      case 'craft':
        return {
          font: "'Courier Prime', 'Georgia', serif",
          bg: '#f5ede1',
          gridStroke: 'rgba(120, 95, 70, 0.25)',
          axisStroke: '#5e4b3c',
          textMain: '#2b2118',
          textSub: '#5e4b3c',
          moodStroke: '#c2410c',
          moodNodeFill: '#c2410c',
          stressStroke: '#78350f',
          sleepGood: '#3f6212',
          sleepWarn: '#a16207',
          sleepBad: '#991b1b',
          screenStroke: '#451a03',
          starGlyph: '★',
        };
      case 'oled':
        return {
          font: "'Consolas', 'Segoe UI', monospace",
          bg: '#000000',
          gridStroke: 'rgba(255, 255, 255, 0.08)',
          axisStroke: '#27272a',
          textMain: '#fafafa',
          textSub: '#71717a',
          moodStroke: '#00f5ff',
          moodNodeFill: '#00f5ff',
          stressStroke: '#f43f5e',
          sleepGood: '#10b981',
          sleepWarn: '#f59e0b',
          sleepBad: '#ef4444',
          screenStroke: '#a855f7',
          starGlyph: '★',
          isOled: true,
        };
      default:
        return {
          font: "inherit",
          bg: 'transparent',
          gridStroke: 'rgba(255, 255, 255, 0.08)',
          axisStroke: 'rgba(255, 255, 255, 0.15)',
          textMain: '#f8fafc',
          textSub: '#94a3b8',
          moodStroke: '#3b82f6',
          moodNodeFill: '#3b82f6',
          stressStroke: '#ef4444',
          sleepGood: '#10b981',
          sleepWarn: '#f59e0b',
          sleepBad: '#ef4444',
          screenStroke: '#ec4899',
          starGlyph: '★',
        };
    }
  }

  function renderSleepMoodLab() {
    renderMoodChart();
    renderSleepChart();
    const trackScreen = state.settings?.trackScreenTime !== false && state.allSettings?.habits?.trackScreenTime !== false;
    const screenBox = $('#screenChartBox');
    if (screenBox) screenBox.style.display = trackScreen ? 'block' : 'none';
    if (trackScreen) renderScreenChart();

    // Default lab editor date to today
    const editDateInput = $('#labEditDate');
    if (editDateInput && !editDateInput.value) {
      editDateInput.value = formatLocalDate();
    }
    const bedtimeInput = $('#labEditBedtime');
    if (bedtimeInput && !bedtimeInput.value) {
      bedtimeInput.value = state.settings?.targetBedtime || '23:30';
    }
    const wakeTimeInput = $('#labEditWakeTime');
    if (wakeTimeInput && !wakeTimeInput.value) {
      wakeTimeInput.value = state.settings?.targetWakeTime || '07:30';
    }
  }

  function renderMoodChart() {
    const container = $('#chartMoodContainer');
    if (!container) return;
    const [year, month] = state.activeMonth.split('-').map(Number);
    const totalDays = getDaysInMonth(year, month);

    // Filter strictly real logs
    const loggedEntries = [];
    for (let d = 1; d <= totalDays; d++) {
      const dStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const log = state.logs[dStr];
      if (log && (log.mood?.rating > 0 || log.stress?.level > 0)) {
        loggedEntries.push({ day: d, dateStr: dStr, log });
      }
    }

    if (loggedEntries.length === 0) {
      container.innerHTML = `<div class="chart-empty-msg" style="padding: 40px; text-align: center; color: var(--dash-text-sub);">${t('habits.noChartData')}</div>`;
      return;
    }

    const pal = getThemeChartPalette();
    const w = 900;
    const h = 200;
    const padL = 50;
    const padR = 30;
    const padT = 25;
    const padB = 30;

    const trackStress = state.settings?.trackStress !== false && state.allSettings?.habits?.trackStress !== false;
    let moodPoints = [];
    let stressPoints = [];

    loggedEntries.forEach(entry => {
      const x = padL + ((entry.day - 1) / (totalDays - 1)) * (w - padL - padR);

      if (entry.log.mood?.rating > 0) {
        const yMood = (h - padB) - ((entry.log.mood.rating - 1) / 4) * (h - padT - padB);
        moodPoints.push({ x, y: yMood, val: entry.log.mood.rating, day: entry.day });
      }
      if (trackStress && entry.log.stress?.level > 0) {
        const yStress = (h - padB) - ((entry.log.stress.level - 1) / 9) * (h - padT - padB);
        stressPoints.push({ x, y: yStress, val: entry.log.stress.level, day: entry.day });
      }
    });

    const svg = `
      <svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" style="font-family: ${pal.font};">
        ${pal.isDotGrid ? `
          <defs>
            <pattern id="dotGridPat" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="8" cy="8" r="1.2" fill="#b8a992" />
            </pattern>
          </defs>
          <rect x="${padL}" y="${padT}" width="${w - padL - padR}" height="${h - padT - padB}" fill="url(#dotGridPat)" opacity="0.4" />
        ` : ''}
        ${pal.isGridPaper ? `
          <defs>
            <pattern id="graphPat" width="14" height="14" patternUnits="userSpaceOnUse">
              <path d="M 14 0 L 0 0 0 14" fill="none" stroke="rgba(14, 165, 233, 0.2)" stroke-width="1"/>
            </pattern>
          </defs>
          <rect x="${padL}" y="${padT}" width="${w - padL - padR}" height="${h - padT - padB}" fill="url(#graphPat)" />
        ` : ''}

        <!-- Grid & Axis Lines -->
        <line x1="${padL}" y1="${padT}" x2="${w - padR}" y2="${padT}" stroke="${pal.gridStroke}" stroke-dasharray="${pal.isSketch ? '4,4' : 'none'}" />
        <line x1="${padL}" y1="${(padT + h - padB) / 2}" x2="${w - padR}" y2="${(padT + h - padB) / 2}" stroke="${pal.gridStroke}" stroke-dasharray="${pal.isSketch ? '4,4' : 'none'}" />
        <line x1="${padL}" y1="${h - padB}" x2="${w - padR}" y2="${h - padB}" stroke="${pal.axisStroke}" stroke-width="1.8" />

        <!-- Y Axis Labels -->
        <text x="${padL - 8}" y="${padT + 4}" fill="${pal.moodStroke}" font-size="10.5" text-anchor="end" font-weight="700">5 (Great)</text>
        <text x="${padL - 8}" y="${(padT + h - padB) / 2 + 4}" fill="${pal.textSub}" font-size="10" text-anchor="end">3 (Meh)</text>
        <text x="${padL - 8}" y="${h - padB + 4}" fill="${pal.stressStroke}" font-size="10.5" text-anchor="end" font-weight="700">1 (Down)</text>

        <!-- Stress Polyline -->
        ${stressPoints.length > 1 ? `<polyline fill="none" stroke="${pal.stressStroke}" stroke-width="2.2" stroke-dasharray="5,4" opacity="0.85" points="${stressPoints.map(p => `${p.x},${p.y}`).join(' ')}" />` : ''}

        <!-- Mood Polyline -->
        ${moodPoints.length > 1 ? `<polyline fill="none" stroke="${pal.moodStroke}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="${moodPoints.map(p => `${p.x},${p.y}`).join(' ')}" />` : ''}

        <!-- Mood Nodes (Authentic circular marker dots matching Reference 1) -->
        ${moodPoints.map(p => `
          <circle cx="${p.x}" cy="${p.y}" r="4.5" fill="${pal.moodNodeFill}" stroke="${pal.bg === 'transparent' ? '#ffffff' : pal.bg}" stroke-width="1.5" />
          <text x="${p.x}" y="${p.y - 7}" fill="${pal.moodStroke}" font-size="10.5" font-weight="800" text-anchor="middle">${p.val}${pal.starGlyph}</text>
          <text x="${p.x}" y="${h - 10}" fill="${pal.textSub}" font-size="9" text-anchor="middle">${p.day}</text>
        `).join('')}
      </svg>
    `;
    container.innerHTML = svg;
  }

  function renderSleepChart() {
    const container = $('#chartSleepContainer');
    if (!container) return;
    const [year, month] = state.activeMonth.split('-').map(Number);
    const totalDays = getDaysInMonth(year, month);
    const targetHours = Number(state.settings?.sleepTargetHours || state.allSettings?.habits?.sleepTargetHours) || 8.0;
    const warningMin = Number(state.settings?.sleepWarningMin || state.allSettings?.habits?.sleepWarningMin) || 6.0;

    const loggedEntries = [];
    for (let d = 1; d <= totalDays; d++) {
      const dStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const log = state.logs[dStr];
      if (log && log.sleep && (log.sleep.durationHours > 0 || log.sleep.hours > 0)) {
        loggedEntries.push({ day: d, hours: Number(log.sleep.durationHours || log.sleep.hours) });
      }
    }

    if (loggedEntries.length === 0) {
      container.innerHTML = `<div class="chart-empty-msg" style="padding: 40px; text-align: center; color: var(--dash-text-sub);">${t('habits.noChartData')}</div>`;
      return;
    }

    const pal = getThemeChartPalette();
    const w = 900;
    const h = 200;
    const padL = 50;
    const padR = 30;
    const padT = 25;
    const padB = 30;
    const barWidth = Math.max(14, (w - padL - padR) / totalDays - 4);

    let bars = [];
    loggedEntries.forEach(entry => {
      const barH = Math.min(h - padT - padB, (entry.hours / 12) * (h - padT - padB));
      const x = padL + (entry.day - 1) * ((w - padL - padR) / totalDays);
      const y = (h - padB) - barH;

      let color = pal.sleepGood;
      if (entry.hours < warningMin) color = pal.sleepBad;
      else if (entry.hours < targetHours) color = pal.sleepWarn;

      bars.push(`
        <rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" rx="3" fill="${color}" opacity="0.9" ${pal.isSketch ? 'stroke="#1e293b" stroke-width="1.2"' : ''} />
        <text x="${x + barWidth / 2}" y="${y - 5}" fill="${pal.textMain}" font-size="10" text-anchor="middle" font-weight="700">${entry.hours.toFixed(1)}h</text>
        <text x="${x + barWidth / 2}" y="${h - 10}" fill="${pal.textSub}" font-size="9" text-anchor="middle">${entry.day}</text>
      `);
    });

    const goalY = (h - padB) - (targetHours / 12) * (h - padT - padB);

    const svg = `
      <svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" style="font-family: ${pal.font};">
        <!-- Goal line based on Settings -->
        <line x1="${padL}" y1="${goalY}" x2="${w - padR}" y2="${goalY}" stroke="${pal.sleepGood}" stroke-dasharray="4,4" stroke-width="1.8" opacity="0.8" />
        <text x="${padL - 8}" y="${goalY + 4}" fill="${pal.sleepGood}" font-size="10" text-anchor="end" font-weight="700">${targetHours.toFixed(1)}h Goal</text>

        <!-- Base line -->
        <line x1="${padL}" y1="${h - padB}" x2="${w - padR}" y2="${h - padB}" stroke="${pal.axisStroke}" stroke-width="1.8" />
        ${bars.join('')}
      </svg>
    `;
    container.innerHTML = svg;
  }

  function renderScreenChart() {
    const container = $('#chartScreenContainer');
    if (!container) return;
    const [year, month] = state.activeMonth.split('-').map(Number);
    const totalDays = getDaysInMonth(year, month);

    const loggedEntries = [];
    for (let d = 1; d <= totalDays; d++) {
      const dStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const log = state.logs[dStr];
      if (log && log.screenTime && log.screenTime.hours > 0) {
        loggedEntries.push({ day: d, hours: log.screenTime.hours });
      }
    }

    if (loggedEntries.length === 0) {
      container.innerHTML = `<div class="chart-empty-msg" style="padding: 25px; text-align: center; color: var(--dash-text-sub);">${t('habits.noChartData')}</div>`;
      return;
    }

    const pal = getThemeChartPalette();
    const w = 900;
    const h = 150;
    const padL = 50;
    const padR = 30;
    const padT = 20;
    const padB = 25;

    let pts = [];
    loggedEntries.forEach(entry => {
      const x = padL + ((entry.day - 1) / (totalDays - 1)) * (w - padL - padR);
      const y = (h - padB) - (entry.hours / 10) * (h - padT - padB);
      pts.push({ x, y, hours: entry.hours, day: entry.day });
    });

    const svg = `
      <svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" style="font-family: ${pal.font};">
        <line x1="${padL}" y1="${h - padB}" x2="${w - padR}" y2="${h - padB}" stroke="${pal.axisStroke}" stroke-width="1.8" />
        ${pts.length > 1 ? `<polyline fill="none" stroke="${pal.screenStroke}" stroke-width="2.5" stroke-linecap="round" points="${pts.map(p => `${p.x},${p.y}`).join(' ')}" />` : ''}
        ${pts.map(p => `
          <circle cx="${p.x}" cy="${p.y}" r="3.5" fill="${pal.screenStroke}" />
          <text x="${p.x}" y="${p.y - 6}" fill="${pal.screenStroke}" font-size="9" font-weight="700" text-anchor="middle">${p.hours}h</text>
        `).join('')}
      </svg>
    `;
    container.innerHTML = svg;
  }

  /* ==================================================================== *
   * 3. KPIS & CORRELATIONS (Real Mathematical Data Only)
   * ==================================================================== */

  async function renderKpisAndCorrelations() {
    if (!window.widgets?.habits?.getAnalytics) return;
    try {
      const analytics = await window.widgets.habits.getAnalytics(state.activeMonth);
      if (!analytics) return;

      // Real consistency rate
      const activeHabits = (state.habits || []).filter(h => !h.archived);
      let totalScheduled = 0;
      let totalCompleted = 0;
      const [year, month] = state.activeMonth.split('-').map(Number);
      const totalDays = getDaysInMonth(year, month);

      for (let d = 1; d <= totalDays; d++) {
        const dStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const log = state.logs[dStr];
        if (log && log.habits) {
          for (const h of activeHabits) {
            const hLog = log.habits[h.id];
            if (hLog && hLog.status === 'skip') continue;
            totalScheduled++;
            if (hLog && hLog.status === 'done') totalCompleted++;
          }
        }
      }

      const overallRate = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;
      $('#kpiConsistencyVal').textContent = totalScheduled > 0 ? `${digits(overallRate)}%` : '—';

      // Avg Sleep
      if (analytics.averageSleep > 0) {
        $('#kpiAvgSleepVal').textContent = `${digits(analytics.averageSleep)} ${t('habits.hoursUnit')}`;
        const diff = Number((analytics.averageSleep - 8.0).toFixed(1));
        const diffText = diff >= 0 ? `+${diff}` : `${diff}`;
        $('#kpiSleepDiffSub').textContent = `${diffText} ${t('habits.hoursUnit')}`;
      } else {
        $('#kpiAvgSleepVal').textContent = '—';
        $('#kpiSleepDiffSub').textContent = t('habits.notLogged');
      }

      // Longest streak
      let maxStreak = 0;
      let maxHabitTitle = '—';
      activeHabits.forEach(h => {
        const s = analytics.habitStats?.find(x => x.id === h.id);
        const curStreak = s ? s.currentStreak : 0;
        if (curStreak > maxStreak) {
          maxStreak = curStreak;
          maxHabitTitle = lang() === 'en' && h.titleEn ? h.titleEn : h.title;
        }
      });
      $('#kpiLongestStreakVal').textContent = maxStreak > 0 ? `${digits(maxStreak)} ${t('habits.days')}` : '—';
      $('#kpiStreakHabitTitle').textContent = maxHabitTitle;

      // Best day of week
      if (analytics.bestDay && analytics.bestDay.rate > 0) {
        $('#kpiBestDayVal').textContent = lang() === 'en' ? analytics.bestDay.nameEn : analytics.bestDay.nameAr;
        $('#kpiBestDayRate').textContent = `${digits(analytics.bestDay.rate)}%`;
      } else {
        $('#kpiBestDayVal').textContent = '—';
        $('#kpiBestDayRate').textContent = '—';
      }

      // Pearson Correlations
      const c = analytics.correlations || {};
      const formatR = (val) => (val !== 0 && val !== null ? `r = ${val > 0 ? '+' : ''}${val}` : '—');

      $('#corrSleepMoodVal').textContent = formatR(c.sleepAndMood);
      $('#corrSleepHabitsVal').textContent = formatR(c.sleepAndCompletion);
      $('#corrMoodStressVal').textContent = formatR(c.moodAndStress);

      // Strength Rankings Table
      const tbody = $('#strengthTableBody');
      if (tbody) {
        tbody.innerHTML = '';
        const sortedHabits = (analytics.habitStats || []).sort((a, b) => b.strength - a.strength);

        sortedHabits.forEach(h => {
          const tr = document.createElement('tr');
          const titleText = lang() === 'en' && h.titleEn ? h.titleEn : h.title;

          tr.innerHTML = `
            <td>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 16px;">${h.icon || '⭐'}</span>
                <strong>${titleText}</strong>
              </div>
            </td>
            <td><span class="routine-tag">${h.routine || 'anytime'}</span></td>
            <td>
              <div class="strength-bar-cell">
                <div class="strength-track">
                  <div class="strength-fill" style="width: ${h.strength}%; background: ${h.strength >= 70 ? '#10b981' : (h.strength >= 40 ? '#f59e0b' : '#ef4444')};"></div>
                </div>
                <span class="strength-num">${digits(h.strength)}%</span>
              </div>
            </td>
            <td><span class="streak-pill">🔥 ${digits(h.currentStreak)}</span></td>
            <td><span class="streak-pill muted">⚡ ${digits(h.longestStreak)}</span></td>
          `;
          tbody.appendChild(tr);
        });
      }

      // Render the 4 Advanced Behavioral Analytics Charts
      renderRoutineAdherenceChart(activeHabits, state.logs, totalDays, year, month);
      renderDayOfWeekChart(activeHabits, state.logs, totalDays, year, month);
      renderSleepCompletionCorrChart(state.logs, totalDays, year, month);
      renderMoodProductivityChart(state.logs, totalDays, year, month);

      // Urgency Grid (OpenHabitTracker - Streak Guilt Eliminator)
      const urgencyGrid = $('#urgencyHabitsGrid');
      if (urgencyGrid) {
        urgencyGrid.innerHTML = '';
        try {
          if (window.widgets?.habits?.getHabitsByUrgency) {
            const urgencyList = await window.widgets.habits.getHabitsByUrgency();
            if (urgencyList && urgencyList.length > 0) {
              urgencyList.forEach(u => {
                const card = document.createElement('div');
                card.className = 'urgency-habit-card';
                const h = u.habit || u;
                const title = (lang() === 'en' && h.titleEn ? h.titleEn : h.title) || h.name || 'Habit';
                const icon = h.icon || '⭐';
                const score = u.urgency?.score ?? u.score ?? 0;
                const routine = h.routine || 'anytime';
                let badgeClass = 'good';
                let badgeText = lang() === 'en' ? 'Good Standing' : 'مستقر ومثالي';
                if (score >= 80) {
                  badgeClass = 'overdue';
                  badgeText = lang() === 'en' ? 'Overdue ⚠️' : 'عاجل ومتأخر ⚠️';
                } else if (score >= 50) {
                  badgeClass = 'due-today';
                  badgeText = lang() === 'en' ? 'Due Today ⏰' : 'مستحق اليوم ⏰';
                } else if (score >= 30) {
                  badgeClass = 'due-soon';
                  badgeText = lang() === 'en' ? 'Due Soon ⏳' : 'مستحق قريباً ⏳';
                }
                card.innerHTML = `
                  <div class="urgency-top">
                    <div class="urgency-title-group">
                      <span class="urgency-icon">${icon}</span>
                      <span class="urgency-title">${title}</span>
                    </div>
                    <span class="urgency-badge ${badgeClass}">${badgeText}</span>
                  </div>
                  <div class="urgency-bar-track">
                    <div class="urgency-bar-fill ${badgeClass}" style="width: ${score}%;"></div>
                  </div>
                  <div class="urgency-bottom">
                    <span class="urgency-score-txt">${digits(score)}% ${lang() === 'en' ? 'Urgency' : 'استحقاق'}</span>
                    <span class="urgency-routine-tag">${routine}</span>
                  </div>
                `;
                card.style.cursor = 'pointer';
                card.onclick = () => openHabitDetailModal(h.id || u.id);
                urgencyGrid.appendChild(card);
              });
            } else {
              urgencyGrid.innerHTML = `<div style="font-size: 12px; color: var(--dash-text-sub); padding: 8px;">${lang() === 'en' ? 'No active habits to compute urgency.' : 'لا توجد عادات نشطة لحساب مؤشر العجالة.'}</div>`;
            }
          }
        } catch (err) {
          console.error('Failed rendering urgency grid:', err);
        }
      }

      // Weekly Drop-Off Slump Alert (HabitFlow)
      const slumpCard = $('#slumpAlertCard');
      if (slumpCard) {
        try {
          if (window.widgets?.habits?.getWeeklyDropOff) {
            const dropOff = await window.widgets.habits.getWeeklyDropOff();
            if (dropOff) {
              const titleEl = $('#slumpTitle');
              const adviceEl = $('#slumpAdviceText');
              const iconEl = $('#slumpIcon');
              const isEn = lang() === 'en';

              if (dropOff.hasSlump) {
                if (iconEl) iconEl.textContent = '📉';
                if (titleEl) {
                  titleEl.textContent = isEn
                    ? `Slump Detected: ${dropOff.peakDayName} (${dropOff.peakRate}%) ➔ ${dropOff.slumpDayName} (${dropOff.slumpRate}%) [Drop: ${dropOff.dropPercentage}%]`
                    : `رصد ركود أسبوعي: انخفاض من ${dropOff.peakDayName} (${digits(dropOff.peakRate)}%) إلى ${dropOff.slumpDayName} (${digits(dropOff.slumpRate)}%) [تراجع: ${digits(dropOff.dropPercentage)}%]`;
                }
                if (adviceEl) adviceEl.textContent = dropOff.coachingAdvice;
                slumpCard.classList.add('has-slump');
              } else {
                if (iconEl) iconEl.textContent = '🌟';
                if (titleEl) {
                  titleEl.textContent = isEn
                    ? `High Consistency: Peak Day is ${dropOff.peakDayName} (${dropOff.peakRate}%)`
                    : `انضباط أسبوعي مستقر ومتوازن: قمة الأداء في يوم ${dropOff.peakDayName} (${digits(dropOff.peakRate)}%)`;
                }
                if (adviceEl) adviceEl.textContent = dropOff.coachingAdvice;
                slumpCard.classList.remove('has-slump');
              }
            }
          }
        } catch (err) {
          console.error('Failed rendering slump alert:', err);
        }
      }

    } catch (err) {
      console.error('Failed to compute KPIs:', err);
    }
  }

  /* ---------- Advanced Behavioral KPI Charts Renderers ---------- */

  function renderRoutineAdherenceChart(activeHabits, logs, totalDays, year, month) {
    const container = $('#chartRoutineAdherence');
    if (!container) return;

    const routines = [
      { key: 'morning', labelAr: '☀️ الصباح (Morning)', labelEn: '☀️ Morning', color: '#f59e0b' },
      { key: 'afternoon', labelAr: '🌤️ بعد الظهر (Afternoon)', labelEn: '🌤️ Afternoon', color: '#06b6d4' },
      { key: 'evening', labelAr: '🌙 المساء (Evening)', labelEn: '🌙 Evening', color: '#8b5cf6' },
      { key: 'anytime', labelAr: '⚡ أي وقت (Anytime)', labelEn: '⚡ Anytime', color: '#10b981' },
    ];

    const isEn = lang() === 'en';
    const stats = {};
    routines.forEach(r => { stats[r.key] = { scheduled: 0, completed: 0 }; });

    for (let d = 1; d <= totalDays; d++) {
      const dStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const log = logs[dStr];
      if (log && log.habits) {
        activeHabits.forEach(h => {
          const rKey = h.routine || 'anytime';
          if (!stats[rKey]) stats[rKey] = { scheduled: 0, completed: 0 };
          const hLog = log.habits[h.id];
          if (hLog && hLog.status === 'skip') return;
          stats[rKey].scheduled++;
          if (hLog && hLog.status === 'done') stats[rKey].completed++;
          else if (hLog && hLog.status === 'partial') stats[rKey].completed += 0.5;
        });
      }
    }

    const totalScheduledAll = Object.values(stats).reduce((acc, s) => acc + s.scheduled, 0);
    if (totalScheduledAll === 0) {
      container.innerHTML = `<div class="chart-empty-msg">${isEn ? 'No scheduled routine data logged yet' : 'لم يتم توثيق بيانات للفترات بعد'}</div>`;
      return;
    }

    const w = 500;
    const barHeight = 22;
    const gap = 16;
    const padT = 20;
    const padB = 20;
    const padL = isEn ? 110 : 140;
    const padR = 60;
    const h = padT + routines.length * (barHeight + gap) + padB;
    const trackWidth = w - padL - padR;

    const rowsSvg = routines.map((r, idx) => {
      const s = stats[r.key];
      const rate = s.scheduled > 0 ? Math.round((s.completed / s.scheduled) * 100) : 0;
      const y = padT + idx * (barHeight + gap);
      const fillW = Math.max(0, (rate / 100) * trackWidth);
      const label = isEn ? r.labelEn : r.labelAr;

      return `
        <g class="routine-chart-row">
          <text x="${padL - 10}" y="${y + 15}" fill="#cbd5e1" font-size="11" font-weight="600" text-anchor="end">${label}</text>
          <rect x="${padL}" y="${y}" width="${trackWidth}" height="${barHeight}" rx="6" fill="rgba(255,255,255,0.06)" />
          <rect x="${padL}" y="${y}" width="${fillW}" height="${barHeight}" rx="6" fill="${r.color}" />
          <text x="${padL + fillW + 8}" y="${y + 15}" fill="#ffffff" font-size="11" font-weight="700">${digits(rate)}%</text>
          <text x="${padL + trackWidth - 6}" y="${y + 15}" fill="rgba(255,255,255,0.4)" font-size="9" text-anchor="end">${digits(Math.round(s.completed))}/${digits(s.scheduled)}</text>
        </g>
      `;
    }).join('');

    container.innerHTML = `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%">${rowsSvg}</svg>`;
  }

  function renderDayOfWeekChart(activeHabits, logs, totalDays, year, month) {
    const container = $('#chartDayOfWeek');
    if (!container) return;

    const isEn = lang() === 'en';
    const daysConfig = [
      { dayIndex: 6, ar: 'السبت', en: 'Sat' },
      { dayIndex: 0, ar: 'الأحد', en: 'Sun' },
      { dayIndex: 1, ar: 'الاثنين', en: 'Mon' },
      { dayIndex: 2, ar: 'الثلاثاء', en: 'Tue' },
      { dayIndex: 3, ar: 'الأربعاء', en: 'Wed' },
      { dayIndex: 4, ar: 'الخميس', en: 'Thu' },
      { dayIndex: 5, ar: 'الجمعة', en: 'Fri' },
    ];

    const stats = {};
    daysConfig.forEach(d => { stats[d.dayIndex] = { scheduled: 0, completed: 0 }; });

    for (let d = 1; d <= totalDays; d++) {
      const dObj = new Date(year, month - 1, d);
      const dayIdx = dObj.getDay();
      const dStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const log = logs[dStr];
      if (log && log.habits) {
        activeHabits.forEach(h => {
          const hLog = log.habits[h.id];
          if (hLog && hLog.status === 'skip') return;
          stats[dayIdx].scheduled++;
          if (hLog && hLog.status === 'done') stats[dayIdx].completed++;
          else if (hLog && hLog.status === 'partial') stats[dayIdx].completed += 0.5;
        });
      }
    }

    const totalScheduled = Object.values(stats).reduce((acc, s) => acc + s.scheduled, 0);
    if (totalScheduled === 0) {
      container.innerHTML = `<div class="chart-empty-msg">${isEn ? 'No day-of-week data logged yet' : 'لم يتم توثيق بيانات لأيام الأسبوع بعد'}</div>`;
      return;
    }

    const rates = daysConfig.map(d => {
      const s = stats[d.dayIndex];
      const rate = s.scheduled > 0 ? Math.round((s.completed / s.scheduled) * 100) : 0;
      return { ...d, rate, scheduled: s.scheduled };
    });

    const validDays = rates.filter(r => r.scheduled > 0);
    let minRate = 101;
    let maxRate = -1;
    validDays.forEach(r => {
      if (r.rate < minRate) minRate = r.rate;
      if (r.rate > maxRate) maxRate = r.rate;
    });

    const w = 500;
    const h = 180;
    const padL = 30;
    const padR = 30;
    const padT = 30;
    const padB = 35;
    const colWidth = (w - padL - padR) / 7;
    const barWidth = 26;

    const colsSvg = rates.map((r, idx) => {
      const x = padL + idx * colWidth + (colWidth - barWidth) / 2;
      const chartHeight = h - padT - padB;
      const barH = Math.max(4, (r.rate / 100) * chartHeight);
      const y = (h - padB) - barH;
      const isSlump = r.rate === minRate && minRate < maxRate;
      const isBest = r.rate === maxRate && maxRate > 0;
      const color = isBest ? '#10b981' : (isSlump ? '#ef4444' : '#3b82f6');
      const label = isEn ? r.en : r.ar;

      return `
        <g class="dow-col">
          <text x="${x + barWidth / 2}" y="${y - 6}" fill="${color}" font-size="10" font-weight="700" text-anchor="middle">${digits(r.rate)}%</text>
          <rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" rx="5" fill="${color}" opacity="${isSlump ? '0.85' : '1'}" />
          <text x="${x + barWidth / 2}" y="${h - 12}" fill="${isSlump ? '#f87171' : (isBest ? '#34d399' : '#94a3b8')}" font-size="11" font-weight="600" text-anchor="middle">${label}</text>
          ${isSlump ? `<text x="${x + barWidth / 2}" y="${h - 2}" fill="#f87171" font-size="8" font-weight="800" text-anchor="middle">⚠️ Slump</text>` : ''}
        </g>
      `;
    }).join('');

    container.innerHTML = `
      <svg viewBox="0 0 ${w} ${h}" width="100%" height="100%">
        <line x1="${padL}" y1="${h - padB}" x2="${w - padR}" y2="${h - padB}" stroke="rgba(255,255,255,0.12)" />
        ${colsSvg}
      </svg>
    `;
  }

  function renderSleepCompletionCorrChart(logs, totalDays, year, month) {
    const container = $('#chartSleepCompletionCorr');
    if (!container) return;

    const isEn = lang() === 'en';
    const bands = [
      { key: '<6h', min: 0, max: 5.9, labelAr: 'حرمان (<6س)', labelEn: 'Deficit (<6h)', color: '#ef4444' },
      { key: '6-7h', min: 6.0, max: 6.9, labelAr: 'قصير (6-7س)', labelEn: 'Short (6-7h)', color: '#f59e0b' },
      { key: '7-8.5h', min: 7.0, max: 8.5, labelAr: 'مثالي (7-8.5س)', labelEn: 'Optimal (7-8.5h)', color: '#10b981' },
      { key: '>8.5h', min: 8.6, max: 24, labelAr: 'طويل (>8.5س)', labelEn: 'Extended (>8.5h)', color: '#6366f1' },
    ];

    const bandStats = {};
    bands.forEach(b => { bandStats[b.key] = { daysCount: 0, totalRate: 0 }; });

    for (let d = 1; d <= totalDays; d++) {
      const dStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const log = logs[dStr];
      if (log && log.sleep?.hours > 0 && log.habits) {
        const sleepH = log.sleep.hours;
        const matchingBand = bands.find(b => sleepH >= b.min && sleepH <= b.max);
        if (matchingBand) {
          let dayScheduled = 0;
          let dayDone = 0;
          Object.values(log.habits).forEach(hLog => {
            if (hLog && hLog.status === 'skip') return;
            dayScheduled++;
            if (hLog && hLog.status === 'done') dayDone++;
            else if (hLog && hLog.status === 'partial') dayDone += 0.5;
          });
          if (dayScheduled > 0) {
            const dayRate = Math.round((dayDone / dayScheduled) * 100);
            bandStats[matchingBand.key].daysCount++;
            bandStats[matchingBand.key].totalRate += dayRate;
          }
        }
      }
    }

    const totalDaysWithData = Object.values(bandStats).reduce((acc, b) => acc + b.daysCount, 0);
    if (totalDaysWithData === 0) {
      container.innerHTML = `<div class="chart-empty-msg">${isEn ? 'Log both sleep hours and habits to see correlation' : 'سجل ساعات النوم وإنجاز العادات لاكتشاف الترابط الإحصائي بينهما'}</div>`;
      return;
    }

    const w = 500;
    const h = 170;
    const padL = isEn ? 110 : 130;
    const padR = 60;
    const padT = 15;
    const padB = 15;
    const barHeight = 22;
    const gap = 14;
    const trackWidth = w - padL - padR;

    const barsSvg = bands.map((b, idx) => {
      const stat = bandStats[b.key];
      const avgRate = stat.daysCount > 0 ? Math.round(stat.totalRate / stat.daysCount) : 0;
      const y = padT + idx * (barHeight + gap);
      const fillW = Math.max(0, (avgRate / 100) * trackWidth);
      const label = isEn ? b.labelEn : b.labelAr;

      return `
        <g class="sleep-corr-row">
          <text x="${padL - 10}" y="${y + 15}" fill="#cbd5e1" font-size="11" font-weight="600" text-anchor="end">${label}</text>
          <rect x="${padL}" y="${y}" width="${trackWidth}" height="${barHeight}" rx="6" fill="rgba(255,255,255,0.06)" />
          <rect x="${padL}" y="${y}" width="${fillW}" height="${barHeight}" rx="6" fill="${b.color}" />
          <text x="${padL + fillW + 8}" y="${y + 15}" fill="#ffffff" font-size="11" font-weight="700">${stat.daysCount > 0 ? `${digits(avgRate)}%` : '—'}</text>
          <text x="${padL + trackWidth - 6}" y="${y + 15}" fill="rgba(255,255,255,0.4)" font-size="9" text-anchor="end">${digits(stat.daysCount)} ${isEn ? 'days' : 'أيام'}</text>
        </g>
      `;
    }).join('');

    container.innerHTML = `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%">${barsSvg}</svg>`;
  }

  function renderMoodProductivityChart(logs, totalDays, year, month) {
    const container = $('#chartMoodProductivity');
    if (!container) return;

    const isEn = lang() === 'en';
    const moods = [
      { rating: 5, emoji: '😁', ar: '5 - رائع (Great)', en: '5 - Great', color: '#10b981' },
      { rating: 4, emoji: '🙂', ar: '4 - جيد (Good)', en: '4 - Good', color: '#3b82f6' },
      { rating: 3, emoji: '😐', ar: '3 - متوسط (Meh)', en: '3 - Meh', color: '#f59e0b' },
      { rating: 2, emoji: '😣', ar: '2 - مجهد (Stressed)', en: '2 - Stressed', color: '#f97316' },
      { rating: 1, emoji: '😡', ar: '1 - سيئ (Down)', en: '1 - Down', color: '#ef4444' },
    ];

    const moodStats = {};
    moods.forEach(m => { moodStats[m.rating] = { count: 0, totalRate: 0 }; });

    for (let d = 1; d <= totalDays; d++) {
      const dStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const log = logs[dStr];
      if (log && log.mood?.rating > 0 && log.habits) {
        const r = log.mood.rating;
        if (moodStats[r]) {
          let dayScheduled = 0;
          let dayDone = 0;
          Object.values(log.habits).forEach(hLog => {
            if (hLog && hLog.status === 'skip') return;
            dayScheduled++;
            if (hLog && hLog.status === 'done') dayDone++;
            else if (hLog && hLog.status === 'partial') dayDone += 0.5;
          });
          if (dayScheduled > 0) {
            const dayRate = Math.round((dayDone / dayScheduled) * 100);
            moodStats[r].count++;
            moodStats[r].totalRate += dayRate;
          }
        }
      }
    }

    const totalDaysLogged = Object.values(moodStats).reduce((acc, m) => acc + m.count, 0);
    if (totalDaysLogged === 0) {
      container.innerHTML = `<div class="chart-empty-msg">${isEn ? 'Log your mood to discover its impact on productivity' : 'سجل تقييم مزاجك اليومي لاكتشاف أثره المباشر على طاقتك وإنجازك'}</div>`;
      return;
    }

    const w = 500;
    const h = 180;
    const padL = isEn ? 100 : 125;
    const padR = 60;
    const padT = 10;
    const padB = 10;
    const barHeight = 20;
    const gap = 12;
    const trackWidth = w - padL - padR;

    const barsSvg = moods.map((m, idx) => {
      const stat = moodStats[m.rating];
      const avgRate = stat.count > 0 ? Math.round(stat.totalRate / stat.count) : 0;
      const y = padT + idx * (barHeight + gap);
      const fillW = Math.max(0, (avgRate / 100) * trackWidth);
      const label = isEn ? `${m.emoji} ${m.en}` : `${m.emoji} ${m.ar}`;

      return `
        <g class="mood-prod-row">
          <text x="${padL - 8}" y="${y + 14}" fill="#cbd5e1" font-size="10.5" font-weight="600" text-anchor="end">${label}</text>
          <rect x="${padL}" y="${y}" width="${trackWidth}" height="${barHeight}" rx="5" fill="rgba(255,255,255,0.06)" />
          <rect x="${padL}" y="${y}" width="${fillW}" height="${barHeight}" rx="5" fill="${m.color}" />
          <text x="${padL + fillW + 8}" y="${y + 14}" fill="#ffffff" font-size="10.5" font-weight="700">${stat.count > 0 ? `${digits(avgRate)}%` : '—'}</text>
          <text x="${padL + trackWidth - 6}" y="${y + 14}" fill="rgba(255,255,255,0.4)" font-size="8.5" text-anchor="end">${digits(stat.count)} ${isEn ? 'days' : 'يوم'}</text>
        </g>
      `;
    }).join('');

    container.innerHTML = `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%">${barsSvg}</svg>`;
  }

  /* ==================================================================== *
   * 4. HABIT MANAGER & BUILDER
   * ==================================================================== */

  function renderHabitManager() {
    renderDashboardPresetChips();
    renderCuratedHabitPacks();
    updateHabitLivePreview();
    const listEl = $('#habitsManagerItems');
    if (!listEl) return;
    listEl.innerHTML = '';

    const allHabits = state.habits || [];

    allHabits.forEach(h => {
      const row = document.createElement('div');
      row.className = 'manager-habit-card';
      row.style.borderInlineStartColor = h.color || '#3b82f6';

      const titleText = lang() === 'en' && h.titleEn ? h.titleEn : h.title;
      const typeText = t(`habits.type${h.type ? h.type.charAt(0).toUpperCase() + h.type.slice(1) : 'Boolean'}`);

      let targetSummary = '';
      if (h.type === 'boolean') {
        targetSummary = '';
      } else if (h.type === 'percentage') {
        targetSummary = ` • ${digits(h.targetValue || 100)}%`;
      } else if (h.type === 'rating') {
        targetSummary = ` • 5 ⭐`;
      } else {
        targetSummary = ` • ${digits(h.targetValue || 1)} ${lang() === 'en' && h.unitEn ? h.unitEn : (h.unit || '')}`;
      }

      const waBadge = (h.reminderEnabled && h.reminderTime)
        ? `<span class="badge-mini" style="margin-inline-start: 6px; font-size: 10px; background: rgba(37, 211, 102, 0.15); color: #128c7e; padding: 2px 6px; border-radius: 4px; font-weight: 600;">💬 ${h.reminderTime}${h.reminderRecipient ? ` 📱` : ''}</span>`
        : '';

      row.innerHTML = `
        <div class="m-card-icon">${h.icon || '⭐'}</div>
        <div class="m-card-info">
          <div class="m-card-title">${titleText} ${waBadge}</div>
          <div class="m-card-meta">${typeText} • ${h.routine || 'anytime'}${targetSummary}</div>
        </div>
        <div class="m-card-actions">
          ${h.reminderEnabled ? `<button type="button" class="btn-m-action wa-test" title="إرسال تذكير تجريبي لهذه العادة عبر WhatsApp" data-id="${h.id}" style="color: #128c7e;">💬</button>` : ''}
          <button class="btn-m-action edit" data-id="${h.id}">${t('habits.edit')}</button>
          <button class="btn-m-action delete" data-id="${h.id}">${t('habits.delete')}</button>
        </div>
      `;

      const waTestBtn = row.querySelector('.wa-test');
      if (waTestBtn) {
        waTestBtn.onclick = async (e) => {
          e.stopPropagation();
          waTestBtn.textContent = '⏳';
          try {
            const res = await window.widgets?.habits?.testHabitReminder?.(h.id);
            waTestBtn.textContent = (res && (res.success || res.ok)) ? '✅' : '❌';
          } catch {
            waTestBtn.textContent = '❌';
          }
          setTimeout(() => { if (waTestBtn.isConnected) waTestBtn.textContent = '💬'; }, 2000);
        };
      }

      row.querySelector('.edit').onclick = () => {
        populateHabitForm(h);
        $('#managerFormTitle')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      };
      row.querySelector('.delete').onclick = async () => {
        if (confirm(t('habits.deleteConfirm'))) {
          if (window.widgets?.habits?.deleteHabit) {
            await window.widgets.habits.deleteHabit(h.id);
            state.habits = state.habits.filter(x => x.id !== h.id);
            renderHabitManager();
          }
        }
      };

      listEl.appendChild(row);
    });
  }

  const CURATED_HABIT_PACKS = [
    {
      id: 'spirit',
      icon: '🕌',
      title: 'الروحانيات والسكينة',
      titleEn: 'Spiritual & Mindfulness',
      habits: [
        {
          icon: '📖',
          title: 'ورد القرآن الكريم اليومي',
          titleEn: 'Daily Quran Recitation',
          routine: 'morning',
          category: 'spirit',
          type: 'number',
          targetValue: 20,
          unit: 'صفحة',
          unitEn: 'pages',
          color: '#10b981',
          difficulty: 'easy',
          direction: 'positive',
        },
        {
          icon: '🤲',
          title: 'أذكار الصباح والمساء',
          titleEn: 'Morning & Evening Dhikr',
          routine: 'morning',
          category: 'spirit',
          type: 'boolean',
          targetValue: 1,
          unit: '',
          unitEn: '',
          color: '#059669',
          difficulty: 'trivial',
          direction: 'positive',
        },
        {
          icon: '🕌',
          title: 'صلاة الفجر في وقتها',
          titleEn: 'Fajr Prayer On Time',
          routine: 'morning',
          category: 'spirit',
          type: 'boolean',
          targetValue: 1,
          unit: '',
          unitEn: '',
          color: '#0d9488',
          difficulty: 'medium',
          direction: 'positive',
        },
        {
          icon: '🌙',
          title: 'ركعتي الوتر وقيام الليل',
          titleEn: 'Night Witr Prayer',
          routine: 'evening',
          category: 'spirit',
          type: 'boolean',
          targetValue: 1,
          unit: '',
          unitEn: '',
          color: '#6366f1',
          difficulty: 'medium',
          direction: 'positive',
        },
      ],
    },
    {
      id: 'health',
      icon: '🏃‍♂️',
      title: 'الصحة واللياقة والبدن',
      titleEn: 'Health & Fitness',
      habits: [
        {
          icon: '💧',
          title: 'شرب 8 أكواب ماء (2.5 لتر)',
          titleEn: 'Drink 8 Cups of Water',
          routine: 'anytime',
          category: 'health',
          type: 'number',
          targetValue: 8,
          unit: 'أكواب',
          unitEn: 'cups',
          color: '#0284c7',
          difficulty: 'easy',
          direction: 'positive',
        },
        {
          icon: '🏃‍♂️',
          title: 'تمرين رياضي ونشاط بدني',
          titleEn: 'Daily Workout',
          routine: 'afternoon',
          category: 'health',
          type: 'duration',
          targetValue: 30,
          unit: 'دقيقة',
          unitEn: 'min',
          color: '#ea580c',
          difficulty: 'medium',
          direction: 'positive',
        },
        {
          icon: '🚶‍♂️',
          title: 'المشي 8,000 خطوة يومياً',
          titleEn: '8,000 Daily Steps',
          routine: 'anytime',
          category: 'health',
          type: 'number',
          targetValue: 8000,
          unit: 'خطوة',
          unitEn: 'steps',
          color: '#14b8a6',
          difficulty: 'medium',
          direction: 'positive',
        },
        {
          icon: '😴',
          title: 'النوم المبكر قبل 11:30 ليلاً',
          titleEn: 'Early Sleep by 11:30 PM',
          routine: 'evening',
          category: 'health',
          type: 'boolean',
          targetValue: 1,
          unit: '',
          unitEn: '',
          color: '#8b5cf6',
          difficulty: 'medium',
          direction: 'positive',
        },
      ],
    },
    {
      id: 'productivity',
      icon: '🧠',
      title: 'العلم والتركيز والإنتاجية',
      titleEn: 'Focus & Learning',
      habits: [
        {
          icon: '📚',
          title: 'قراءة كتاب مفيد (20 صفحة)',
          titleEn: 'Read 20 Book Pages',
          routine: 'evening',
          category: 'learning',
          type: 'number',
          targetValue: 20,
          unit: 'صفحة',
          unitEn: 'pages',
          color: '#ec4899',
          difficulty: 'easy',
          direction: 'positive',
        },
        {
          icon: '💻',
          title: 'جلسة تركيز وعمل عميق (45 د)',
          titleEn: 'Deep Work Session (45m)',
          routine: 'morning',
          category: 'productivity',
          type: 'duration',
          targetValue: 45,
          unit: 'دقيقة',
          unitEn: 'min',
          color: '#4f46e5',
          difficulty: 'medium',
          direction: 'positive',
        },
        {
          icon: '✍️',
          title: 'تدوين اليوميات وتأمل المساء',
          titleEn: 'Evening Journaling',
          routine: 'evening',
          category: 'mind',
          type: 'boolean',
          targetValue: 1,
          unit: '',
          unitEn: '',
          color: '#d97706',
          difficulty: 'easy',
          direction: 'positive',
        },
        {
          icon: '🎯',
          title: 'إنجاز أهم مهمة يومية (Big Rock)',
          titleEn: 'Finish Daily Most Important Task',
          routine: 'morning',
          category: 'productivity',
          type: 'boolean',
          targetValue: 1,
          unit: '',
          unitEn: '',
          color: '#e11d48',
          difficulty: 'medium',
          direction: 'positive',
        },
      ],
    },
    {
      id: 'breakers',
      icon: '🛑',
      title: 'كواسر العادات والامتناع',
      titleEn: 'Break Bad Habits & Detox',
      habits: [
        {
          icon: '📵',
          title: 'ترك الهاتف والشاشات قبل النوم بساعة',
          titleEn: 'No Screens 1h Before Sleep',
          routine: 'evening',
          category: 'mind',
          type: 'boolean',
          targetValue: 1,
          unit: '',
          unitEn: '',
          color: '#ef4444',
          difficulty: 'hard',
          direction: 'negative',
        },
        {
          icon: '🥗',
          title: 'الامتناع عن السكريات والمياه الغازية',
          titleEn: 'Zero Junk Food & Soda',
          routine: 'anytime',
          category: 'health',
          type: 'boolean',
          targetValue: 1,
          unit: '',
          unitEn: '',
          color: '#f59e0b',
          difficulty: 'medium',
          direction: 'negative',
        },
        {
          icon: '⏳',
          title: 'تقنين وسائل التواصل (أقل من 30 د)',
          titleEn: 'Limit Social Media (< 30m)',
          routine: 'anytime',
          category: 'mind',
          type: 'boolean',
          targetValue: 1,
          unit: '',
          unitEn: '',
          color: '#dc2626',
          difficulty: 'hard',
          direction: 'negative',
        },
      ],
    },
  ];

  // Presets list for backwards compatibility
  const DASHBOARD_PRESETS = [
    { icon: '📖', title: 'ورد القرآن الكريم', titleEn: 'Daily Quran Recitation', routine: 'morning', category: 'spirit', type: 'number', direction: 'positive', difficulty: 'easy', targetValue: 10, unit: 'صفحات', color: '#10b981', enablePomodoro: true, syncToTodo: true, todoPriority: 1 },
    { icon: '🕌', title: 'صلاة الفجر في وقتها', titleEn: 'Fajr Prayer On Time', routine: 'morning', category: 'spirit', type: 'boolean', direction: 'positive', difficulty: 'medium', targetValue: 1, unit: '', color: '#06b6d4', enablePomodoro: false, syncToTodo: true, todoPriority: 2 },
    { icon: '💧', title: 'شرب 8 أكواب ماء', titleEn: 'Drink 8 Cups of Water', routine: 'anytime', category: 'health', type: 'number', direction: 'positive', difficulty: 'easy', targetValue: 8, unit: 'أكواب', color: '#3b82f6', enablePomodoro: false, syncToTodo: false, todoPriority: 0 },
    { icon: '💻', title: 'جلسة برمجة وعمل عميق', titleEn: 'Deep Work & Coding', routine: 'morning', category: 'productivity', type: 'duration', direction: 'positive', difficulty: 'medium', targetValue: 90, unit: 'دقيقة', color: '#6366f1', enablePomodoro: true, syncToTodo: true, todoPriority: 1 },
    { icon: '🏃‍♂️', title: 'تمارين رياضية ونشاط', titleEn: 'Daily Workout', routine: 'afternoon', category: 'health', type: 'duration', direction: 'positive', difficulty: 'medium', targetValue: 30, unit: 'دقيقة', color: '#f59e0b', enablePomodoro: true, syncToTodo: true, todoPriority: 1 },
    { icon: '🚶‍♂️', title: '10,000 خطوة يومياً', titleEn: '10,000 Daily Steps', routine: 'anytime', category: 'health', type: 'number', direction: 'positive', difficulty: 'hard', targetValue: 10000, unit: 'خطوة', color: '#14b8a6', enablePomodoro: false, syncToTodo: false, todoPriority: 0 },
    { icon: '📚', title: 'قراءة كتاب مفيد', titleEn: 'Book Reading', routine: 'evening', category: 'learning', type: 'number', direction: 'positive', difficulty: 'easy', targetValue: 20, unit: 'صفحة', color: '#ec4899', enablePomodoro: true, syncToTodo: true, todoPriority: 0 },
    { icon: '😴', title: 'نوم مبكر قبل 11:30', titleEn: 'Early Sleep by 11:30', routine: 'evening', category: 'health', type: 'boolean', direction: 'positive', difficulty: 'medium', targetValue: 1, unit: '', color: '#8b5cf6', enablePomodoro: false, syncToTodo: false, todoPriority: 1 },
    { icon: '🛑', title: 'الامتناع عن وسائل التواصل بعد 10م', titleEn: 'No Social Media After 10 PM', routine: 'evening', category: 'mind', type: 'boolean', direction: 'negative', difficulty: 'hard', targetValue: 1, unit: '', color: '#ef4444', enablePomodoro: false, syncToTodo: false, todoPriority: 1 },
    { icon: '🥗', title: 'تجنب الوجبات السريعة والمياه الغازية', titleEn: 'Avoid Junk Food & Soda', routine: 'anytime', category: 'health', type: 'boolean', direction: 'negative', difficulty: 'medium', targetValue: 1, unit: '', color: '#eab308', enablePomodoro: false, syncToTodo: false, todoPriority: 0 },
  ];

  function showQuickToast(msg) {
    let toast = $('#dashQuickToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'dashQuickToast';
      toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: #1e293b;
        color: #ffffff;
        padding: 9px 20px;
        border-radius: 999px;
        font-size: 13px;
        font-weight: 700;
        box-shadow: 0 10px 30px rgba(0,0,0,0.35);
        border: 1px solid rgba(255,255,255,0.18);
        z-index: 9999;
        opacity: 0;
        transition: all 0.25s cubic-bezier(0.34, 1.4, 0.64, 1);
        pointer-events: none;
        display: flex;
        align-items: center;
        gap: 8px;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 2800);
  }

  async function instantAddHabit(habitData) {
    const id = `hbt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const habitPayload = {
      id,
      title: habitData.title,
      titleEn: habitData.titleEn || habitData.title,
      routine: habitData.routine || 'anytime',
      category: habitData.category || 'general',
      type: habitData.type || 'boolean',
      direction: habitData.direction || 'positive',
      difficulty: habitData.difficulty || 'easy',
      targetValue: habitData.targetValue || 1,
      unit: habitData.unit || '',
      unitEn: habitData.unitEn || habitData.unit || '',
      icon: habitData.icon || '⭐',
      color: habitData.color || '#3b82f6',
      frequency: { type: 'daily' },
      enablePomodoro: Boolean(habitData.enablePomodoro),
      timerMode: false,
      attributeAffinity: null,
      subItems: [],
      syncToTodo: false,
      todoPriority: 1,
      syncToCalendar: false,
      calendarTime: '08:00',
      calendarDuration: 30,
      triggerCue: '',
      reminderTime: '',
      targetGoalStreak: 30,
      notes: '',
      createdAt: new Date().toISOString(),
      archived: false,
    };

    if (window.widgets?.habits?.saveHabit) {
      await window.widgets.habits.saveHabit(habitPayload);
      state.habits.push(habitPayload);
      renderHabitManager();
      showQuickToast(lang() === 'en' ? `Added "${habitData.titleEn || habitData.title}"! 🎉` : `تمت إضافة عادة "${habitData.title}" بنجاح! 🎉`);
    }
  }

  function renderCuratedHabitPacks() {
    const grid = $('#curatedHabitPacksGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const isEn = lang() === 'en';

    CURATED_HABIT_PACKS.forEach(pack => {
      const card = document.createElement('div');
      card.className = 'curated-pack-card';

      const packTitle = isEn ? pack.titleEn : pack.title;
      let itemsHtml = '';

      pack.habits.forEach((h, idx) => {
        const hTitle = isEn ? h.titleEn : h.title;
        const routineBadge = t(`habits.routine${h.routine.charAt(0).toUpperCase() + h.routine.slice(1)}`);
        let targetDesc = '';
        if (h.type === 'number' || h.type === 'duration') {
          targetDesc = ` • ${digits(h.targetValue || 1)} ${isEn ? (h.unitEn || h.unit || '') : (h.unit || '')}`;
        } else if (h.type === 'percentage') {
          targetDesc = ` • ${digits(h.targetValue || 100)}%`;
        } else if (h.type === 'rating') {
          targetDesc = ` • 5 ⭐`;
        }
        itemsHtml += `
          <div class="curated-item-row" data-pack-id="${pack.id}" data-item-idx="${idx}">
            <div class="curated-item-left">
              <span class="curated-item-icon">${h.icon}</span>
              <div class="curated-item-meta">
                <span class="curated-item-title" title="${hTitle}">${hTitle}</span>
                <span class="curated-item-sub">${routineBadge}${targetDesc}</span>
              </div>
            </div>
            <div class="curated-item-actions">
              <button type="button" class="btn-instant-add-pill" data-action="instant-add" title="${isEn ? 'Add directly in 1 click' : 'أضف فوراً بضغطة واحدة'}">
                + ${isEn ? 'Add' : 'أضف فوراً'}
              </button>
              <button type="button" class="btn-customize-pill" data-action="customize" title="${isEn ? 'Customize in form' : 'تخصيص في النموذج'}">
                ✏️
              </button>
            </div>
          </div>
        `;
      });

      card.innerHTML = `
        <div class="curated-pack-head">
          <span class="curated-pack-badge-icon">${pack.icon}</span>
          <span class="curated-pack-name">${packTitle}</span>
        </div>
        <div class="curated-pack-items">
          ${itemsHtml}
        </div>
      `;

      card.querySelectorAll('.curated-item-row').forEach(row => {
        const itemIdx = Number(row.dataset.itemIdx);
        const itemData = pack.habits[itemIdx];

        row.querySelector('[data-action="instant-add"]')?.addEventListener('click', (e) => {
          e.stopPropagation();
          instantAddHabit(itemData);
        });

        row.querySelector('[data-action="customize"]')?.addEventListener('click', (e) => {
          e.stopPropagation();
          populateHabitForm(itemData);
          $('#managerFormTitle')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          $('#habitInputTitle')?.focus();
        });
      });

      grid.appendChild(card);
    });
  }

  function renderDashboardPresetChips() {
    const wrap = $('#dashPresetsChips');
    if (!wrap) return;
    wrap.innerHTML = '';
    const isEn = lang() === 'en';

    DASHBOARD_PRESETS.forEach(p => {
      const chip = document.createElement('span');
      chip.className = 'dash-preset-chip';
      const label = isEn ? p.titleEn : p.title;
      chip.innerHTML = `<span>${p.icon}</span> <span>${label}</span>`;
      chip.onclick = () => {
        populateHabitForm({
          id: '',
          title: p.title,
          titleEn: p.titleEn,
          routine: p.routine,
          category: p.category,
          type: p.type,
          direction: p.direction,
          difficulty: p.difficulty,
          targetValue: p.targetValue,
          unit: p.unit,
          icon: p.icon,
          color: p.color,
          frequency: { type: 'daily' },
          enablePomodoro: p.enablePomodoro,
          syncToTodo: p.syncToTodo,
          todoPriority: p.todoPriority,
        });
        $('#managerFormTitle').textContent = isEn ? `✨ Template: ${p.titleEn}` : `✨ قالب مقترح: ${p.title}`;
        $('#habitInputTitle')?.focus();
      };
      wrap.appendChild(chip);
    });
  }

  function computeNextHabitLog(h, curStatus, curVal = null) {
    const fullTarget = Number(h.targetValue) || (h.type === 'percentage' ? 100 : 1);
    if (h.type === 'percentage') {
      const parts = Number(h.partsCount) || (h.stepValue ? Math.max(1, Math.round(fullTarget / Number(h.stepValue))) : 5);
      const step = Number(h.stepValue) || Math.max(1, Math.round(fullTarget / parts)) || 20;
      const current = curVal !== null && curVal !== undefined ? Number(curVal) : (curStatus === 'done' ? fullTarget : 0);
      if (current >= fullTarget || curStatus === 'done') {
        return { nextStatus: 'skip', nextVal: 0 };
      } else if (curStatus === 'skip') {
        return { nextStatus: 'none', nextVal: 0 };
      }
      const nextVal = Math.min(fullTarget, current + step);
      const nextStatus = nextVal >= fullTarget ? 'done' : 'partial';
      return { nextStatus, nextVal };
    }
    const halfTarget = h.type === 'boolean' ? 1 : Math.max(1, Math.round(fullTarget / 2));
    let nextStatus = 'done';
    let nextVal = fullTarget;
    if (curStatus === 'done') { nextStatus = 'skip'; nextVal = 0; }
    else if (curStatus === 'skip') { nextStatus = 'partial'; nextVal = halfTarget; }
    else if (curStatus === 'partial') { nextStatus = 'none'; nextVal = 0; }
    return { nextStatus, nextVal };
  }

  function updatePercentageExplanationDash() {
    const target = Math.min(100, Math.max(1, Number($('#habitInputTarget')?.value) || 100));
    const parts = Math.max(1, Math.min(100, Number($('#habitInputParts')?.value) || 5));
    const step = Math.max(1, Math.min(target, Number($('#habitInputStepPct')?.value) || Math.round(target / parts) || 20));
    const expl = $('#percentageCalcExplanation');
    if (expl) {
      const isEn = lang() === 'en';
      expl.textContent = isEn
        ? `💡 Each click on the habit will advance by ${step}% (1 of ${parts}) until completion at ${target}%.`
        : `💡 كل ضغطة على العادة ستتقدم بنسبة ${digits(step)}% (1 من ${digits(parts)}) حتى تكتمل العادة عند ${digits(target)}%.`;
    }
  }

  function updateTargetVisibility(type, preserveValues = false) {
    const targetGroup = $('#targetValueGroup');
    const targetLabel = $('#targetValueLabel');
    const targetNum = $('#habitInputTarget');
    const targetUnit = $('#habitInputUnit');
    const quickUnits = $('#dashQuickUnits');
    if (!targetGroup) return;

    const isEn = lang() === 'en';

    if (type === 'boolean') {
      targetGroup.style.display = 'none';
      if ($('#percentageStepGroup')) $('#percentageStepGroup').style.display = 'none';
      if (!preserveValues) {
        if (targetNum) targetNum.value = '1';
        if (targetUnit) { targetUnit.value = ''; targetUnit.disabled = false; }
      }
      if (quickUnits) quickUnits.innerHTML = '';
    } else if (type === 'rating') {
      targetGroup.style.display = 'none';
      if ($('#percentageStepGroup')) $('#percentageStepGroup').style.display = 'none';
      if (!preserveValues) {
        if (targetNum) targetNum.value = '5';
        if (targetUnit) { targetUnit.value = '⭐'; targetUnit.disabled = false; }
      }
      if (quickUnits) quickUnits.innerHTML = '';
    } else if (type === 'percentage') {
      targetGroup.style.display = 'block';
      if ($('#percentageStepGroup')) $('#percentageStepGroup').style.display = 'block';
      if (targetLabel) targetLabel.textContent = isEn ? 'Target Percentage (%)' : 'النسبة المئوية المستهدفة (%)';
      if (targetNum) {
        targetNum.min = '1';
        targetNum.max = '100';
        if (!preserveValues && (!targetNum.value || targetNum.value === '1')) targetNum.value = '100';
        else if (Number(targetNum.value) > 100) targetNum.value = '100';
        targetNum.placeholder = '100';
      }
      if (targetUnit) {
        targetUnit.value = '%';
        targetUnit.placeholder = '%';
        targetUnit.disabled = true;
        targetUnit.title = isEn ? 'Unit is fixed to % for percentage habits' : 'الوحدة ثابتة (%) لعادة النسبة المئوية';
      }
      if (!preserveValues) {
        if ($('#habitInputParts')) $('#habitInputParts').value = '5';
        if ($('#habitInputStepPct')) $('#habitInputStepPct').value = '20';
      }
      updatePercentageExplanationDash();
      if (quickUnits) {
        quickUnits.innerHTML = `
          <span class="unit-badge" data-val="100" data-unit="%" style="cursor:pointer; padding: 2px 8px; border-radius: 12px; font-size: 11px; background: rgba(59,130,246,0.12); color: var(--accent, #3b82f6); font-weight: 600;">100%</span>
          <span class="unit-badge" data-val="90" data-unit="%" style="cursor:pointer; padding: 2px 8px; border-radius: 12px; font-size: 11px; background: rgba(59,130,246,0.12); color: var(--accent, #3b82f6); font-weight: 600;">90%</span>
          <span class="unit-badge" data-val="80" data-unit="%" style="cursor:pointer; padding: 2px 8px; border-radius: 12px; font-size: 11px; background: rgba(59,130,246,0.12); color: var(--accent, #3b82f6); font-weight: 600;">80%</span>
          <span class="unit-badge" data-val="75" data-unit="%" style="cursor:pointer; padding: 2px 8px; border-radius: 12px; font-size: 11px; background: rgba(59,130,246,0.12); color: var(--accent, #3b82f6); font-weight: 600;">75%</span>
          <span class="unit-badge" data-val="50" data-unit="%" style="cursor:pointer; padding: 2px 8px; border-radius: 12px; font-size: 11px; background: rgba(59,130,246,0.12); color: var(--accent, #3b82f6); font-weight: 600;">50%</span>
        `;
        quickUnits.querySelectorAll('.unit-badge').forEach(b => {
          b.onclick = () => {
            if (targetNum) targetNum.value = b.dataset.val;
            if (targetUnit) targetUnit.value = '%';
            const target = Number(b.dataset.val) || 100;
            const parts = Math.max(1, Number($('#habitInputParts')?.value) || 5);
            if ($('#habitInputStepPct')) $('#habitInputStepPct').value = Math.round((target / parts) * 10) / 10;
            updatePercentageExplanationDash();
            updateHabitLivePreview();
          };
        });
      }
    } else if (type === 'duration') {
      targetGroup.style.display = 'block';
      if ($('#percentageStepGroup')) $('#percentageStepGroup').style.display = 'none';
      if (targetLabel) targetLabel.textContent = isEn ? 'Target Duration & Unit' : 'المدة الزمنية المستهدفة والوحدة';
      if (targetNum) {
        targetNum.removeAttribute('max');
        targetNum.min = '1';
        if (!preserveValues && (!targetNum.value || targetNum.value === '1' || targetNum.value === '100')) targetNum.value = '30';
        targetNum.placeholder = '30';
      }
      const defMin = isEn ? 'min' : 'دقيقة';
      const defHr = isEn ? 'hours' : 'ساعة';
      if (targetUnit) {
        targetUnit.disabled = false;
        if (!preserveValues && (!targetUnit.value || targetUnit.value === '%' || targetUnit.value === 'كوب')) targetUnit.value = defMin;
        targetUnit.placeholder = isEn ? 'min, hours...' : 'دقيقة، ساعات...';
        targetUnit.title = '';
      }
      if (quickUnits) {
        quickUnits.innerHTML = `
          <span class="unit-badge" data-val="15" data-unit="${defMin}" style="cursor:pointer; padding: 2px 8px; border-radius: 12px; font-size: 11px; background: rgba(245,158,11,0.12); color: #d97706; font-weight: 600;">15 ${defMin}</span>
          <span class="unit-badge" data-val="30" data-unit="${defMin}" style="cursor:pointer; padding: 2px 8px; border-radius: 12px; font-size: 11px; background: rgba(245,158,11,0.12); color: #d97706; font-weight: 600;">30 ${defMin}</span>
          <span class="unit-badge" data-val="45" data-unit="${defMin}" style="cursor:pointer; padding: 2px 8px; border-radius: 12px; font-size: 11px; background: rgba(245,158,11,0.12); color: #d97706; font-weight: 600;">45 ${defMin}</span>
          <span class="unit-badge" data-val="60" data-unit="${defMin}" style="cursor:pointer; padding: 2px 8px; border-radius: 12px; font-size: 11px; background: rgba(245,158,11,0.12); color: #d97706; font-weight: 600;">60 ${defMin}</span>
          <span class="unit-badge" data-val="90" data-unit="${defMin}" style="cursor:pointer; padding: 2px 8px; border-radius: 12px; font-size: 11px; background: rgba(245,158,11,0.12); color: #d97706; font-weight: 600;">90 ${defMin}</span>
          <span class="unit-badge" data-val="2" data-unit="${defHr}" style="cursor:pointer; padding: 2px 8px; border-radius: 12px; font-size: 11px; background: rgba(245,158,11,0.12); color: #d97706; font-weight: 600;">2 ${defHr}</span>
        `;
        quickUnits.querySelectorAll('.unit-badge').forEach(b => {
          b.onclick = () => {
            if (targetNum) targetNum.value = b.dataset.val;
            if (targetUnit) targetUnit.value = b.dataset.unit;
            updateHabitLivePreview();
          };
        });
      }
    } else { // number
      targetGroup.style.display = 'block';
      if ($('#percentageStepGroup')) $('#percentageStepGroup').style.display = 'none';
      if (targetLabel) targetLabel.textContent = isEn ? 'Target Quantity & Unit' : 'الكمية والعدد المستهدف والوحدة';
      if (targetNum) {
        targetNum.removeAttribute('max');
        targetNum.min = '1';
        if (!preserveValues && (!targetNum.value || targetNum.value === '100')) targetNum.value = '8';
        targetNum.placeholder = '8';
      }
      if (targetUnit) {
        targetUnit.disabled = false;
        if (!preserveValues && (!targetUnit.value || targetUnit.value === '%')) targetUnit.value = isEn ? 'cups' : 'كوب';
        targetUnit.placeholder = isEn ? 'pages, cups, steps...' : 'صفحة، كوب، خطوة، لتر...';
        targetUnit.title = '';
      }
      if (quickUnits) {
        const uPages = isEn ? 'pages' : 'صفحة';
        const uCups = isEn ? 'cups' : 'كوب';
        const uSteps = isEn ? 'steps' : 'خطوة';
        const uLiters = isEn ? 'liters' : 'لتر';
        quickUnits.innerHTML = `
          <span class="unit-badge" data-val="20" data-unit="${uPages}" style="cursor:pointer; padding: 2px 8px; border-radius: 12px; font-size: 11px; background: rgba(16,185,129,0.12); color: #059669; font-weight: 600;">20 ${uPages}</span>
          <span class="unit-badge" data-val="8" data-unit="${uCups}" style="cursor:pointer; padding: 2px 8px; border-radius: 12px; font-size: 11px; background: rgba(16,185,129,0.12); color: #059669; font-weight: 600;">8 ${uCups}</span>
          <span class="unit-badge" data-val="10000" data-unit="${uSteps}" style="cursor:pointer; padding: 2px 8px; border-radius: 12px; font-size: 11px; background: rgba(16,185,129,0.12); color: #059669; font-weight: 600;">10000 ${uSteps}</span>
          <span class="unit-badge" data-val="2.5" data-unit="${uLiters}" style="cursor:pointer; padding: 2px 8px; border-radius: 12px; font-size: 11px; background: rgba(16,185,129,0.12); color: #059669; font-weight: 600;">2.5 ${uLiters}</span>
        `;
        quickUnits.querySelectorAll('.unit-badge').forEach(b => {
          b.onclick = () => {
            if (targetNum) targetNum.value = b.dataset.val;
            if (targetUnit) targetUnit.value = b.dataset.unit;
            updateHabitLivePreview();
          };
        });
      }
    }
  }

  function updateHabitLivePreview() {
    const icon = $('#habitInputIcon')?.value || '⭐';
    const isEn = lang() === 'en';
    const titleVal = $('#habitInputTitle')?.value?.trim();
    const title = titleVal || (isEn ? 'Habit Name' : 'اسم العادة');
    const routine = $('#habitInputRoutine')?.value || 'anytime';
    const type = $('#habitInputType')?.value || 'boolean';

    if ($('#previewTileIcon')) $('#previewTileIcon').textContent = icon;
    if ($('#previewTileTitle')) {
      $('#previewTileTitle').textContent = title;
      $('#previewTileTitle').style.opacity = titleVal ? '1' : '0.55';
    }

    const routineText = t(`habits.routine${routine.charAt(0).toUpperCase() + routine.slice(1)}`);
    const typeText = t(`habits.type${type.charAt(0).toUpperCase() + type.slice(1)}`);
    if ($('#previewTileMeta')) {
      $('#previewTileMeta').textContent = `${routineText} • ${typeText}`;
    }
  }

  function populateHabitForm(h) {
    $('#editHabitId').value = h.id || '';
    $('#managerFormTitle').textContent = h.id ? t('habits.editHabitTitle') : t('habits.createNewHabit');
    $('#habitInputTitle').value = h.title || '';
    $('#habitInputTitleEn').value = h.titleEn || '';
    $('#habitInputRoutine').value = h.routine || 'anytime';
    $('#habitInputCategory').value = h.category || 'general';
    $('#habitInputType').value = h.type || 'boolean';
    $('#habitInputDirection').value = h.direction || 'positive';
    $('#habitInputDifficulty').value = h.difficulty || 'easy';
    $('#habitInputTarget').value = h.targetValue || 1;
    $('#habitInputUnit').value = h.unit || '';
    $('#habitInputIcon').value = h.icon || '⭐';
    $('#habitInputColor').value = h.color || '#3b82f6';
    if ($('#habitInputEnablePomodoro')) {
      $('#habitInputEnablePomodoro').checked = Boolean(h.enablePomodoro);
    }
    const syncTodo = Boolean(h.syncToTodo);
    if ($('#habitInputSyncToTodo')) {
      $('#habitInputSyncToTodo').checked = syncTodo;
    }
    if ($('#habitInputTodoPriority')) {
      $('#habitInputTodoPriority').value = String(h.todoPriority ?? 1);
    }
    if ($('#habitInputTodoPrioGroup')) {
      $('#habitInputTodoPrioGroup').style.display = syncTodo ? 'block' : 'none';
    }

    // Rich fields: Calendar Sync, Trigger Cue, Reminder Time, Target Streak, Notes
    const syncCal = Boolean(h.syncToCalendar);
    if ($('#habitInputSyncToCalendar')) $('#habitInputSyncToCalendar').checked = syncCal;
    if ($('#habitInputCalGroup')) $('#habitInputCalGroup').style.display = syncCal ? 'block' : 'none';
    if ($('#habitInputCalTime')) $('#habitInputCalTime').value = h.calendarTime || '08:00';
    if ($('#habitInputCalDuration')) $('#habitInputCalDuration').value = String(h.calendarDuration || 30);
    if ($('#habitInputTriggerCue')) $('#habitInputTriggerCue').value = h.triggerCue || '';
    if ($('#habitInputReminderTime')) $('#habitInputReminderTime').value = h.reminderTime || '08:00';
    if ($('#habitInputTargetStreak')) $('#habitInputTargetStreak').value = h.targetGoalStreak || 30;
    if ($('#habitInputNotes')) $('#habitInputNotes').value = h.notes || '';

    const freqType = h.frequency?.type || 'daily';
    $('#habitInputFreqType').value = freqType;
    $('#freqWeeklyGroup').hidden = freqType !== 'weekly_target';
    $('#freqSpecificDaysGroup').hidden = freqType !== 'specific_days';
    $('#freqIntervalGroup').hidden = freqType !== 'every_x_days';
    if (freqType === 'weekly_target') {
      $('#habitInputTargetDays').value = h.frequency.targetDaysPerWeek || 3;
    } else if (freqType === 'every_x_days') {
      $('#habitInputIntervalDays').value = h.frequency.interval || 2;
    }

    if ($('#habitInputTimerMode')) {
      $('#habitInputTimerMode').checked = Boolean(h.timerMode);
    }
    if ($('#habitInputAttributeAffinity')) {
      $('#habitInputAttributeAffinity').value = h.attributeAffinity || '';
    }

    // Synchronize Visual Segmented Routine Pills
    const rVal = h.routine || 'anytime';
    $$('#visualRoutinePills .vis-routine-card').forEach(p => {
      p.classList.toggle('active', p.dataset.val === rVal);
    });

    // Synchronize Visual Segmented Type Pills
    const tVal = h.type || 'boolean';
    $$('#visualTypePills .vis-type-card').forEach(p => {
      p.classList.toggle('active', p.dataset.type === tVal);
    });

    // Smart display of targetValueGroup: Hidden for checkmark (boolean), shown for numbers/durations
    updateTargetVisibility(tVal, true);

    if (tVal === 'percentage') {
      const pCount = h.partsCount || (h.stepValue ? Math.max(1, Math.round((h.targetValue || 100) / Number(h.stepValue))) : 5);
      const sVal = h.stepValue || Math.max(1, Math.round((h.targetValue || 100) / pCount)) || 20;
      if ($('#habitInputParts')) $('#habitInputParts').value = String(pCount);
      if ($('#habitInputStepPct')) $('#habitInputStepPct').value = String(sVal);
      updatePercentageExplanationDash();
    }

    // Reveal English Title box if populated
    if (h.titleEn && h.titleEn !== h.title) {
      if ($('#enTitleBox')) $('#enTitleBox').style.display = 'block';
    }

    // Dedicated WhatsApp Reminder fields
    const waRemEnabled = Boolean(h.reminderEnabled);
    if ($('#habitInputWaReminderEnabled')) $('#habitInputWaReminderEnabled').checked = waRemEnabled;
    if ($('#habitWaReminderFields')) $('#habitWaReminderFields').style.display = waRemEnabled ? 'block' : 'none';
    if ($('#habitInputWaReminderTime')) $('#habitInputWaReminderTime').value = h.reminderTime || '08:00';
    const hasCustomRecip = Boolean(h.reminderRecipient && h.reminderRecipient.trim());
    if ($('#habitInputWaRecipientMode')) $('#habitInputWaRecipientMode').value = hasCustomRecip ? 'custom' : 'default';
    if ($('#habitWaCustomRecipientWrap')) $('#habitWaCustomRecipientWrap').style.display = hasCustomRecip ? 'block' : 'none';
    if ($('#habitInputWaRecipientCustom')) $('#habitInputWaRecipientCustom').value = h.reminderRecipient || '';
    if ($('#habitInputWaCustomPrompt')) $('#habitInputWaCustomPrompt').value = h.reminderCustomText || '';
    if ($('#habitWaTestStatus')) $('#habitWaTestStatus').textContent = '';

    // Auto-expand advanced accordion if any advanced features are configured
    const hasAdvanced = Boolean(
      h.reminderEnabled ||
      h.syncToCalendar ||
      h.syncToTodo ||
      h.triggerCue ||
      (h.frequency && h.frequency.type !== 'daily') ||
      (h.subItems && h.subItems.length > 0) ||
      h.timerMode ||
      h.notes ||
      (h.direction && h.direction !== 'positive') ||
      (h.difficulty && h.difficulty !== 'easy')
    );
    if (hasAdvanced) {
      if ($('#advOptionsContent')) $('#advOptionsContent').style.display = 'block';
      if ($('#btnToggleAdvOptions')) $('#btnToggleAdvOptions').classList.add('open');
    }

    renderSubItemsBuilder(h.subItems || []);
    updateHabitLivePreview();
  }

  function clearHabitForm() {
    $('#editHabitId').value = '';
    $('#managerFormTitle').textContent = t('habits.createNewHabit');
    $('#habitInputTitle').value = '';
    $('#habitInputTitleEn').value = '';
    $('#habitInputDirection').value = 'positive';
    $('#habitInputDifficulty').value = 'easy';
    $('#habitInputFreqType').value = 'daily';
    $('#freqWeeklyGroup').hidden = true;
    $('#freqSpecificDaysGroup').hidden = true;
    $('#freqIntervalGroup').hidden = true;
    $('#habitInputTarget').value = 1;
    $('#habitInputUnit').value = '';
    if ($('#habitInputParts')) $('#habitInputParts').value = '5';
    if ($('#habitInputStepPct')) $('#habitInputStepPct').value = '20';
    updatePercentageExplanationDash();
    $('#habitInputIcon').value = '⭐';
    $('#habitInputColor').value = '#3b82f6';
    if ($('#habitInputEnablePomodoro')) {
      $('#habitInputEnablePomodoro').checked = false;
    }
    if ($('#habitInputSyncToTodo')) {
      $('#habitInputSyncToTodo').checked = false;
    }
    if ($('#habitInputTodoPriority')) {
      $('#habitInputTodoPriority').value = '1';
    }
    if ($('#habitInputTodoPrioGroup')) {
      $('#habitInputTodoPrioGroup').style.display = 'none';
    }
    if ($('#habitInputSyncToCalendar')) $('#habitInputSyncToCalendar').checked = false;
    if ($('#habitInputCalGroup')) $('#habitInputCalGroup').style.display = 'none';
    if ($('#habitInputCalTime')) $('#habitInputCalTime').value = '08:00';
    if ($('#habitInputCalDuration')) $('#habitInputCalDuration').value = '30';
    if ($('#habitInputTriggerCue')) $('#habitInputTriggerCue').value = '';
    if ($('#habitInputReminderTime')) $('#habitInputReminderTime').value = '08:00';
    if ($('#habitInputWaReminderEnabled')) $('#habitInputWaReminderEnabled').checked = false;
    if ($('#habitWaReminderFields')) $('#habitWaReminderFields').style.display = 'none';
    if ($('#habitInputWaReminderTime')) $('#habitInputWaReminderTime').value = '08:00';
    if ($('#habitInputWaRecipientMode')) $('#habitInputWaRecipientMode').value = 'default';
    if ($('#habitWaCustomRecipientWrap')) $('#habitWaCustomRecipientWrap').style.display = 'none';
    if ($('#habitInputWaRecipientCustom')) $('#habitInputWaRecipientCustom').value = '';
    if ($('#habitInputWaCustomPrompt')) $('#habitInputWaCustomPrompt').value = '';
    if ($('#habitWaTestStatus')) $('#habitWaTestStatus').textContent = '';
    if ($('#habitInputTargetStreak')) $('#habitInputTargetStreak').value = '30';
    if ($('#habitInputNotes')) $('#habitInputNotes').value = '';

    if ($('#habitInputTimerMode')) {
      $('#habitInputTimerMode').checked = false;
    }
    if ($('#habitInputAttributeAffinity')) {
      $('#habitInputAttributeAffinity').value = '';
    }

    // Reset Visual Routine Pills
    $$('#visualRoutinePills .vis-routine-card').forEach(p => {
      p.classList.toggle('active', p.dataset.val === 'anytime');
    });

    // Reset Visual Type Pills
    $$('#visualTypePills .vis-type-card').forEach(p => {
      p.classList.toggle('active', p.dataset.type === 'boolean');
    });

    // Reset target and unit inputs for boolean
    updateTargetVisibility('boolean', false);
    if ($('#enTitleBox')) $('#enTitleBox').style.display = 'none';
    if ($('#advOptionsContent')) $('#advOptionsContent').style.display = 'none';
    if ($('#btnToggleAdvOptions')) $('#btnToggleAdvOptions').classList.remove('open');

    renderSubItemsBuilder([]);
    updateHabitLivePreview();
  }

  /* Emoji Keyword Detection Dictionary */
  const EMOJI_KEYWORD_MAP = [
    { keys: ['قرآن', 'مصحف', 'تلاوة', 'سورة', 'quran'], emoji: '📖' },
    { keys: ['صلاة', 'فجر', 'مسجد', 'وتر', 'قيام', 'صلوات', 'prayer', 'salah'], emoji: '🕌' },
    { keys: ['ذكر', 'تسبيح', 'استغفار', 'أذكار', 'سبحة', 'dhikr'], emoji: '📿' },
    { keys: ['دعاء', 'تضرع', 'مناجاة'], emoji: '🤲' },
    { keys: ['ماء', 'شرب', 'سوايل', 'water', 'drink'], emoji: '💧' },
    { keys: ['رياضة', 'تمرين', 'جيم', 'حديد', 'كارديو', 'workout', 'gym'], emoji: '🏋️‍♂️' },
    { keys: ['جري', 'مشي', 'خطوة', 'ركض', 'run', 'walk', 'steps'], emoji: '🏃‍♂️' },
    { keys: ['نوم', 'استيقاظ', 'بدري', 'sleep', 'wake'], emoji: '😴' },
    { keys: ['قراءة', 'كتاب', 'رواية', 'صفحة', 'read', 'book'], emoji: '📚' },
    { keys: ['برمجة', 'كود', 'عمل', 'شغل', 'تركيز', 'حاسوب', 'code', 'work', 'study'], emoji: '💻' },
    { keys: ['أكل', 'طعام', 'وجبة', 'دايت', 'خضار', 'diet', 'food', 'healthy'], emoji: '🥗' },
    { keys: ['دواء', 'فيتامين', 'علاج', 'حبوب', 'medicine', 'vitamin'], emoji: '💊' },
    { keys: ['تدوين', 'يوميات', 'مذكرات', 'كتابة', 'journal', 'write'], emoji: '✍️' },
    { keys: ['تأمل', 'هدوء', 'تنفس', 'راحة', 'meditate'], emoji: '🧘‍♂️' },
    { keys: ['هدف', 'تحدي', 'إنجاز', 'focus', 'goal'], emoji: '🎯' },
    { keys: ['شاشات', 'موبايل', 'تلفون', 'social', 'phone'], emoji: '📵' },
    { keys: ['امتناع', 'سكر', 'تدخين', 'تبطيل', 'stop', 'quit'], emoji: '🛑' },
  ];

  function detectEmojiForTitle(text) {
    if (!text) return null;
    const lower = text.toLowerCase();
    for (const rule of EMOJI_KEYWORD_MAP) {
      if (rule.keys.some(k => lower.includes(k))) {
        return rule.emoji;
      }
    }
    return null;
  }

  function initQuickHabitBar() {
    const input = $('#quickHabitInputTitle');
    const iconBtn = $('#quickHabitIconBtn');
    const iconVal = $('#quickHabitIconVal');
    const popover = $('#quickEmojiPopover');
    const submitBtn = $('#btnQuickAddSubmit');
    const routinePills = $$('#quickRoutineSelector .quick-routine-btn');

    if (!input || !submitBtn) return;

    let selectedRoutine = 'anytime';

    routinePills.forEach(pill => {
      pill.addEventListener('click', () => {
        routinePills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        selectedRoutine = pill.dataset.routine || 'anytime';
      });
    });

    input.addEventListener('input', () => {
      const detected = detectEmojiForTitle(input.value.trim());
      if (detected) {
        if (iconBtn) iconBtn.textContent = detected;
        if (iconVal) iconVal.value = detected;
      }
    });

    iconBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (popover) popover.hidden = !popover.hidden;
    });

    popover?.querySelectorAll('.emoji-pick-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const em = item.textContent.trim();
        if (iconBtn) iconBtn.textContent = em;
        if (iconVal) iconVal.value = em;
        if (popover) popover.hidden = true;
      });
    });

    document.addEventListener('click', (e) => {
      if (popover && !popover.hidden && !e.target.closest('.quick-emoji-wrap')) {
        popover.hidden = true;
      }
    });

    const handleQuickSubmit = async () => {
      const title = input.value.trim();
      if (!title) {
        input.focus();
        input.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.4)';
        setTimeout(() => { input.style.boxShadow = ''; }, 1000);
        return;
      }

      const icon = iconVal?.value || iconBtn?.textContent?.trim() || '⭐';
      const id = `hbt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      let direction = 'positive';
      const lower = title.toLowerCase();
      if (lower.includes('امتناع') || lower.includes('ترك') || lower.includes('بدون') || lower.includes('تجنب') || lower.includes('stop') || lower.includes('quit') || lower.includes('no ')) {
        direction = 'negative';
      }

      let category = 'general';
      if (lower.includes('قرآن') || lower.includes('صلاة') || lower.includes('ذكر') || lower.includes('دعاء')) category = 'spirit';
      else if (lower.includes('ماء') || lower.includes('تمرين') || lower.includes('رياضة') || lower.includes('مشي') || lower.includes('نوم') || lower.includes('طعام')) category = 'health';
      else if (lower.includes('كتاب') || lower.includes('قراءة') || lower.includes('تعلم') || lower.includes('لغة')) category = 'learning';
      else if (lower.includes('كود') || lower.includes('برمجة') || lower.includes('عمل') || lower.includes('تركيز') || lower.includes('مهمة')) category = 'productivity';

      const habitPayload = {
        id,
        title,
        titleEn: title,
        routine: selectedRoutine,
        category,
        type: 'boolean',
        direction,
        difficulty: 'easy',
        targetValue: 1,
        unit: '',
        unitEn: '',
        icon,
        color: '#3b82f6',
        frequency: { type: 'daily' },
        enablePomodoro: false,
        timerMode: false,
        attributeAffinity: null,
        subItems: [],
        syncToTodo: false,
        todoPriority: 1,
        syncToCalendar: false,
        calendarTime: '08:00',
        calendarDuration: 30,
        triggerCue: '',
        reminderTime: '',
        targetGoalStreak: 30,
        notes: '',
        createdAt: new Date().toISOString(),
        archived: false,
      };

      if (window.widgets?.habits?.saveHabit) {
        await window.widgets.habits.saveHabit(habitPayload);
        state.habits.push(habitPayload);
        input.value = '';
        if (iconBtn) iconBtn.textContent = '⭐';
        if (iconVal) iconVal.value = '⭐';
        renderHabitManager();
        showQuickToast(lang() === 'en' ? `Added "${title}"! 🎉` : `تمت إضافة عادة "${title}" بنجاح! 🎉`);
      }
    };

    submitBtn.addEventListener('click', handleQuickSubmit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleQuickSubmit();
      }
    });
  }

  function initVisualFormControls() {
    // Routine Visual Pills
    const routinePills = $$('#visualRoutinePills .vis-routine-card');
    const routineSelect = $('#habitInputRoutine');

    routinePills.forEach(pill => {
      pill.addEventListener('click', () => {
        routinePills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const val = pill.dataset.val;
        if (routineSelect) routineSelect.value = val;
        updateHabitLivePreview();
      });
    });

    // Type Visual Pills
    const typePills = $$('#visualTypePills .vis-type-card');
    const typeSelect = $('#habitInputType');
    const targetGroup = $('#targetValueGroup');
    const targetNum = $('#habitInputTarget');
    const targetUnit = $('#habitInputUnit');

    typePills.forEach(pill => {
      pill.addEventListener('click', () => {
        typePills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const val = pill.dataset.type;
        if (typeSelect) typeSelect.value = val;
        updateTargetVisibility(val);
        updateHabitLivePreview();
      });
    });

    typeSelect?.addEventListener('change', () => {
      const val = typeSelect.value;
      typePills.forEach(p => p.classList.toggle('active', p.dataset.type === val));
      updateTargetVisibility(val);
    });

    routineSelect?.addEventListener('change', () => {
      const val = routineSelect.value;
      routinePills.forEach(p => p.classList.toggle('active', p.dataset.val === val));
    });

    // Percentage Step & Distribution event wiring
    $('#habitInputParts')?.addEventListener('input', () => {
      const target = Math.min(100, Math.max(1, Number($('#habitInputTarget')?.value) || 100));
      const parts = Math.max(1, Math.min(100, Number($('#habitInputParts')?.value) || 1));
      const step = Math.round((target / parts) * 10) / 10;
      if ($('#habitInputStepPct')) $('#habitInputStepPct').value = step;
      updatePercentageExplanationDash();
    });

    $('#habitInputStepPct')?.addEventListener('input', () => {
      const target = Math.min(100, Math.max(1, Number($('#habitInputTarget')?.value) || 100));
      const step = Math.max(1, Math.min(target, Number($('#habitInputStepPct')?.value) || 1));
      const parts = Math.max(1, Math.round(target / step));
      if ($('#habitInputParts')) $('#habitInputParts').value = parts;
      updatePercentageExplanationDash();
    });

    $('#habitInputTarget')?.addEventListener('input', () => {
      if ($('#habitInputType')?.value === 'percentage') {
        const target = Math.min(100, Math.max(1, Number($('#habitInputTarget')?.value) || 100));
        const parts = Math.max(1, Math.min(100, Number($('#habitInputParts')?.value) || 5));
        const step = Math.round((target / parts) * 10) / 10;
        if ($('#habitInputStepPct')) $('#habitInputStepPct').value = step;
        updatePercentageExplanationDash();
      }
    });

    $$('.pct-preset-badge').forEach(badge => {
      badge.addEventListener('click', () => {
        if ($('#habitInputParts')) $('#habitInputParts').value = badge.dataset.parts;
        if ($('#habitInputStepPct')) $('#habitInputStepPct').value = badge.dataset.step;
        updatePercentageExplanationDash();
      });
    });

    // English title toggle
    $('#btnToggleEnTitle')?.addEventListener('click', () => {
      const box = $('#enTitleBox');
      if (box) {
        const isHidden = box.style.display === 'none';
        box.style.display = isHidden ? 'block' : 'none';
        if (isHidden) $('#habitInputTitleEn')?.focus();
      }
    });

    // Live Habit Preview synchronizer on input
    $('#habitInputTitle')?.addEventListener('input', () => {
      const detected = detectEmojiForTitle($('#habitInputTitle').value.trim());
      if (detected && $('#habitInputIcon')) {
        $('#habitInputIcon').value = detected;
      }
      updateHabitLivePreview();
    });
    $('#habitInputIcon')?.addEventListener('input', updateHabitLivePreview);

    // Advanced settings accordion
    $('#btnToggleAdvOptions')?.addEventListener('click', () => {
      const content = $('#advOptionsContent');
      const btn = $('#btnToggleAdvOptions');
      if (content && btn) {
        const isHidden = content.style.display === 'none';
        content.style.display = isHidden ? 'block' : 'none';
        btn.classList.toggle('open', isHidden);
      }
    });
  }

  function renderSubItemsBuilder(items) {
    const listEl = $('#subItemsBuilderList');
    if (!listEl) return;
    listEl.innerHTML = '';
    (items || []).forEach(item => {
      addSubItemBuilderRow(item.title || '', item.id);
    });
  }

  function addSubItemBuilderRow(title = '', id = null) {
    const listEl = $('#subItemsBuilderList');
    if (!listEl) return;
    const row = document.createElement('div');
    row.className = 'subitem-builder-row';
    row.style.cssText = 'display:flex;align-items:center;gap:8px;';
    row.dataset.id = id || `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    row.innerHTML = `
      <span style="font-size:12px;color:var(--dash-text-sub)">▫️</span>
      <input type="text" class="form-input subitem-input-title" value="${title.replace(/"/g, '&quot;')}" placeholder="${lang() === 'en' ? 'Step title...' : 'عنوان الخطوة الفرعية...'}" style="flex:1;padding:4px 8px;font-size:12px;">
      <button type="button" class="dash-action-btn danger small btn-del-subitem" style="padding:2px 8px;line-height:1;">✕</button>
    `;
    row.querySelector('.btn-del-subitem')?.addEventListener('click', () => row.remove());
    listEl.appendChild(row);
  }

  function getSubItemsFromBuilder() {
    const listEl = $('#subItemsBuilderList');
    if (!listEl) return [];
    const items = [];
    listEl.querySelectorAll('.subitem-builder-row').forEach(row => {
      const title = row.querySelector('.subitem-input-title')?.value?.trim();
      if (title) {
        items.push({
          id: row.dataset.id || `sub-${Date.now()}`,
          title,
          completed: false,
        });
      }
    });
    return items;
  }

  function calculateHabitStreak(habitId) {
    const logs = state.logs || {};
    const habit = (state.habits || []).find(h => h.id === habitId);
    if (!habit) return 0;
    let streak = 0;
    const today = new Date();
    for (let i = 0; i <= 90; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dStr = formatLocalDate(d);
      const hLog = logs[dStr]?.habits?.[habitId];
      if (!hLog || hLog.status === 'none' || hLog.status === 'fail') {
        if (i === 0) continue;
        break;
      }
      if (hLog.status === 'skip') continue;
      if (hLog.status === 'done' || (hLog.status === 'partial' && (hLog.value / (habit.targetValue || 1)) >= 0.5)) {
        streak++;
      }
    }
    return streak;
  }

  /* ==================================================================== *
   * 5. DUOLINGO / FITNESS STREAK CHALLENGE & MILESTONES (Image 2)
   * ==================================================================== */

  function renderStreakChallengeAndMilestones() {
    const isEn = lang() === 'en';
    const activeHabits = (state.habits || []).filter(h => !h.archived);

    // 1. Calculate active streaks across habits
    let topStreak = 0;
    let longestStreak = 0;
    for (const h of activeHabits) {
      const cur = calcHabitCurrentStreak(h);
      if (cur > topStreak) topStreak = cur;
      if ((h.longestStreak || 0) > longestStreak) longestStreak = h.longestStreak;
    }
    if (topStreak > longestStreak) longestStreak = topStreak;

    // 2. Flame count & text
    const heroCountEl = $('#streakHeroCount');
    if (heroCountEl) heroCountEl.textContent = digits(topStreak);

    // 3. Weekly 7-Day Flame Strip
    const weekStrip = $('#streakWeekFlamesRow');
    if (weekStrip) {
      weekStrip.innerHTML = '';
      const startDaySetting = state.settings?.weekStart || state.allSettings?.habits?.weekStart || 'sat';
      const targetStartDay = (startDaySetting === 'sun') ? 0 : (startDaySetting === 'mon') ? 1 : 6;
      const today = new Date();
      const currentDayOfWeek = today.getDay();
      const diff = (currentDayOfWeek - targetStartDay + 7) % 7;
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - diff);

      const dayNamesShort = isEn
        ? ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
        : ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

      for (let i = 0; i < 7; i++) {
        const dObj = new Date(startOfWeek);
        dObj.setDate(startOfWeek.getDate() + i);
        const dStr = formatLocalDate(dObj);
        const dIdx = dObj.getDay();
        const dName = dayNamesShort[dIdx];
        const isToday = (dStr === formatLocalDate(today));
        const isPastOrToday = dObj <= today;

        let doneOnDay = false;
        if (state.logs && state.logs[dStr]) {
          const dayLog = state.logs[dStr];
          doneOnDay = activeHabits.some(h => {
            const hl = dayLog[h.id];
            return hl && (hl.status === 'done' || (hl.status === 'partial' && (hl.value / (h.targetValue || 1)) >= 0.5));
          });
        }

        const pill = document.createElement('div');
        pill.className = `streak-week-pill ${doneOnDay ? 'done' : ''} ${isToday ? 'today' : ''} ${!isPastOrToday ? 'future' : ''}`;
        pill.innerHTML = `
          <span class="swp-name">${dName}</span>
          <div class="swp-icon-box">
            ${doneOnDay ? `
              <svg viewBox="0 0 24 24" width="18" height="18" fill="#ea580c">
                <path d="M12 2c0 0-6 6.5-6 11.5a6 6 0 0 0 12 0C18 8.5 12 2 12 2zm1 14.5a3 3 0 0 1-3-3c0-1.5 1.5-2.5 1.5-2.5s.5 1 1.5 1.5c1 .5 1.5 1.5 1.5 2.5a1.5 1.5 0 0 1-1.5 1.5z"/>
              </svg>
              <span class="swp-day-num">${digits(i + 1)}</span>
            ` : isToday ? `
              <div class="swp-today-ring"></div>
            ` : `
              <div class="swp-dot"></div>
            `}
          </div>
        `;
        weekStrip.appendChild(pill);
      }
    }

    // 4. Streak 14-Day Challenge
    const challengeGoal = 14;
    const curProgressDay = Math.min(topStreak, challengeGoal);
    const challengePct = Math.round((curProgressDay / challengeGoal) * 100);

    if ($('#streakChallengeFraction')) {
      $('#streakChallengeFraction').textContent = isEn
        ? `Day ${curProgressDay} of ${challengeGoal}`
        : `اليوم ${digits(curProgressDay)} من ${digits(challengeGoal)}`;
    }
    if ($('#streakChallengePercent')) {
      $('#streakChallengePercent').textContent = `${digits(challengePct)}%`;
    }
    if ($('#streakChallengeFill')) {
      $('#streakChallengeFill').style.width = `${challengePct}%`;
    }

    // 5. Streak Started & Record Stats
    if ($('#streakRecordDays')) {
      $('#streakRecordDays').textContent = isEn ? `${longestStreak} days` : `${digits(longestStreak)} يوم`;
    }
    if ($('#streakStartedDate')) {
      if (topStreak > 0) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - topStreak + 1);
        const opt = { month: 'short', day: 'numeric', year: 'numeric' };
        $('#streakStartedDate').textContent = startDate.toLocaleDateString(isEn ? 'en-US' : 'ar-EG', opt);
      } else {
        $('#streakStartedDate').textContent = isEn ? 'Start today!' : 'ابدأ اليوم!';
      }
    }

    // 6. Streak Milestones Trophies (Image 2 Reference)
    const milestonesGrid = $('#streakMilestonesCards');
    if (milestonesGrid) {
      milestonesGrid.innerHTML = '';
      const MILESTONES = [
        { days: 3, titleAr: 'سلسلة 3 أيام', titleEn: '3 days streak', descAr: 'بداية الشرارة الأولى', descEn: 'First spark of discipline', icon: '🥉' },
        { days: 7, titleAr: 'سلسلة 7 أيام', titleEn: '7 days streak', descAr: 'أسبوع ذهبي متواصل', descEn: 'One full golden week', icon: '🥈' },
        { days: 14, titleAr: 'سلسلة 14 يوماً', titleEn: '14 days streak', descAr: 'ترسيخ العادة في الدماغ', descEn: 'Habit wiring in progress', icon: '🥇' },
        { days: 30, titleAr: 'سلسلة 30 يوماً', titleEn: '30 days streak', descAr: 'ثبات الشهر الكامل الأسطوري', descEn: 'Legendary full month locked', icon: '💎' },
        { days: 60, titleAr: 'سلسلة 60 يوماً', titleEn: '60 days streak', descAr: 'الانضباط التلقائي اللاواعي', descEn: 'Automatic subconscious routine', icon: '⚡' },
        { days: 100, titleAr: 'نادي المئة يوم', titleEn: '100 days streak', descAr: 'قمة المجد والإتقان', descEn: 'Centurion of Masterful Habits', icon: '👑' },
      ];

      MILESTONES.forEach(m => {
        const isUnlocked = longestStreak >= m.days;
        const progress = Math.min(100, Math.round((topStreak / m.days) * 100));
        const card = document.createElement('div');
        card.className = `streak-milestone-card ${isUnlocked ? 'unlocked' : 'locked'}`;
        card.innerHTML = `
          <div class="sm-card-icon-wrap">${m.icon}</div>
          <div class="sm-card-info">
            <div class="sm-card-title-row">
              <span class="sm-card-title">${isEn ? m.titleEn : m.titleAr}</span>
              <span class="sm-card-badge ${isUnlocked ? 'badge-achieved' : 'badge-in-progress'}">
                ${isUnlocked ? (isEn ? '✓ Achieved' : '✓ منجز') : `${digits(progress)}%`}
              </span>
            </div>
            <div class="sm-card-desc">${isEn ? m.descEn : m.descAr}</div>
            <div class="sm-card-bar"><div class="sm-card-fill" style="width: ${progress}%"></div></div>
          </div>
        `;
        milestonesGrid.appendChild(card);
      });
    }
  }

  /* ==================================================================== *
   * 6. GAMIFICATION RPG, SELF-REWARD SHOP & BAD HABIT BREAKER
   * ==================================================================== */

  async function renderGamification() {
    renderStreakChallengeAndMilestones();
    let g = state.gamification;
    try {
      if (window.widgets?.habits?.getGamification) {
        g = await window.widgets.habits.getGamification();
        state.gamification = g;
      }
    } catch (err) {
      console.error('Failed to get gamification state:', err);
    }
    if (!g) return;

    const isEn = lang() === 'en';

    // Hero Character Card
    const lvlEl = $('#heroLevelBadge');
    if (lvlEl) lvlEl.textContent = `Lv.${g.level || 1}`;
    const rankEl = $('#heroRankTitle');
    if (rankEl) rankEl.textContent = isEn ? (g.titleLevel?.en || 'Novice') : (g.titleLevel?.ar || 'مبتدئ واعد');
    const xpFillEl = $('#heroXpBarFill');
    if (xpFillEl) xpFillEl.style.width = `${g.progressPercent || 0}%`;
    const xpCurEl = $('#heroXpCurrent');
    if (xpCurEl) xpCurEl.textContent = `${digits(g.xp || 0)} XP`;
    const xpPctEl = $('#heroXpPct');
    if (xpPctEl) xpPctEl.textContent = `${digits(g.progressPercent || 0)}%`;
    const xpTgtEl = $('#heroXpTarget');
    if (xpTgtEl) xpTgtEl.textContent = `${digits(g.xpNeeded || 100)} XP ${isEn ? 'to next level' : 'للمستوى التالي'}`;
    const coinsEl = $('#heroCoinsVal');
    if (coinsEl) coinsEl.textContent = digits(g.coins || 0);
    const vitEl = $('#heroVitalityVal');
    if (vitEl) vitEl.textContent = `${digits(g.vitality !== undefined ? g.vitality : 100)}%`;

    // Hero HP bar & stats (Habitica Style)
    const hpVal = g.hp !== undefined ? g.hp : 100;
    const maxHp = g.maxHp || 100;
    const hpEl = $('#heroHpVal');
    if (hpEl) hpEl.textContent = `${digits(hpVal)} / ${digits(maxHp)}`;
    const hpTextEl = $('#heroHpText');
    if (hpTextEl) hpTextEl.textContent = `${digits(hpVal)}/${digits(maxHp)}`;
    const hpFillEl = $('#heroHpBarFill');
    if (hpFillEl) {
      const pct = Math.min(100, Math.max(0, (hpVal / maxHp) * 100));
      hpFillEl.style.width = `${pct}%`;
      if (pct > 50) hpFillEl.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
      else if (pct > 25) hpFillEl.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
      else hpFillEl.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
    }

    // Hero Mana Bar (MP) & Text
    const manaVal = g.mana !== undefined ? g.mana : 50;
    const maxMana = g.maxMana || 100;
    const manaTextEl = $('#heroManaText');
    if (manaTextEl) manaTextEl.textContent = `${digits(manaVal)}/${digits(maxMana)}`;
    const manaFillEl = $('#heroManaBarFill');
    if (manaFillEl) {
      const manaPct = Math.min(100, Math.max(0, (manaVal / maxMana) * 100));
      manaFillEl.style.width = `${manaPct}%`;
    }

    // Habitica 4 Core Stats Grid (STR, INT, CON, PER)
    const stats = g.stats || { str: 10, int: 10, con: 10, per: 10 };
    if ($('#statStrVal')) $('#statStrVal').textContent = digits(Number(stats.str || 10).toFixed(1));
    if ($('#statIntVal')) $('#statIntVal').textContent = digits(Number(stats.int || 10).toFixed(1));
    if ($('#statConVal')) $('#statConVal').textContent = digits(Number(stats.con || 10).toFixed(1));
    if ($('#statPerVal')) $('#statPerVal').textContent = digits(Number(stats.per || 10).toFixed(1));

    const shieldsEl = $('#heroShieldsVal');
    if (shieldsEl) shieldsEl.textContent = digits(g.streakShields || 0);

    // Hero Class and Avatar
    const heroClass = g.heroClass || 'warrior';
    const avatarEl = $('#heroAvatarIcon');
    if (avatarEl) {
      if (heroClass === 'warrior') avatarEl.textContent = '⚔️';
      else if (heroClass === 'healer') avatarEl.textContent = '🔮';
      else if (heroClass === 'rogue') avatarEl.textContent = '🏹';
      else if (heroClass === 'mage') avatarEl.textContent = '🧙‍♂️';
      else if (heroClass === 'scholar') avatarEl.textContent = '📚';
      else if (heroClass === 'monk') avatarEl.textContent = '🧘';
      else if (heroClass === 'architect') avatarEl.textContent = '🏛️';
      else avatarEl.textContent = '🛡️';
    }

    $$('#heroClassesGrid .hero-class-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.class === heroClass);
      btn.onclick = async () => {
        const cls = btn.dataset.class;
        if (window.widgets?.habits?.setHeroClass) {
          await window.widgets.habits.setHeroClass(cls);
          await renderGamification();
        }
      };
    });

    // Hero Active Skill Box (Habitica Mana Skills)
    const skills = g.availableSkills || [];
    const activeSkill = skills[0] || {
      id: 'valorous_strike',
      nameAr: 'ضربة الشجاعة',
      nameEn: 'Valorous Strike',
      descAr: 'توجيه ضربة حاسمة بـ 50 ضرر لزعيم الأسبوع',
      descEn: 'Strike weekly boss for 50 direct damage',
      manaCost: 20,
      icon: '⚔️',
    };
    if ($('#skillIcon')) $('#skillIcon').textContent = activeSkill.icon || '⚡';
    if ($('#skillName')) $('#skillName').textContent = isEn ? (activeSkill.nameEn || activeSkill.nameAr) : activeSkill.nameAr;
    if ($('#skillDesc')) $('#skillDesc').textContent = isEn ? (activeSkill.descEn || activeSkill.descAr) : activeSkill.descAr;
    if ($('#skillCostBadge')) $('#skillCostBadge').textContent = `🔮 ${digits(activeSkill.manaCost)} MP`;
    const castBtn = $('#btnCastHeroSkill');
    if (castBtn) {
      const canCast = (g.mana || 0) >= activeSkill.manaCost;
      castBtn.disabled = !canCast;
      castBtn.onclick = async () => {
        try {
          if (window.widgets?.habits?.castSkill) {
            const res = await window.widgets.habits.castSkill(activeSkill.id);
            const msgEl = $('#skillStatusMsg');
            if (res?.success) {
              if (msgEl) {
                msgEl.style.color = 'var(--dash-success, #10b981)';
                msgEl.textContent = isEn ? `✨ Cast ${res.skill.nameEn}! ${res.effectApplied}` : `✨ تم تفعيل ${res.skill.nameAr}! ${res.effectApplied}`;
              }
              await renderGamification();
            } else {
              if (msgEl) {
                msgEl.style.color = 'var(--dash-danger, #ef4444)';
                msgEl.textContent = res?.message || 'Failed to cast skill';
              }
            }
          }
        } catch (err) {
          console.error('Skill cast error:', err);
        }
      };
    }

    // Weekly Boss Battle Arena (Habitica Style)
    let boss = g.boss;
    try {
      if (!boss && window.widgets?.habits?.getBoss) {
        boss = await window.widgets.habits.getBoss();
      }
    } catch { }
    if (boss) {
      if ($('#bossName')) $('#bossName').textContent = isEn ? (boss.nameEn || boss.nameAr) : boss.nameAr;
      if ($('#bossAvatarIcon')) $('#bossAvatarIcon').textContent = boss.icon || '🐲';
      if ($('#bossBountyTag')) {
        $('#bossBountyTag').textContent = isEn
          ? `🏆 Bounty: +${digits(boss.rewardCoins)}🪙 & +${digits(boss.rewardXp)} XP`
          : `🏆 غنيمة: +${digits(boss.rewardCoins)}🪙 و +${digits(boss.rewardXp)} XP`;
      }
      const bHp = Math.max(0, boss.hp || 0);
      const bMaxHp = boss.maxHp || 300;
      const bPct = Math.round((bHp / bMaxHp) * 100);
      if ($('#bossHpText')) $('#bossHpText').textContent = `${digits(bHp)} / ${digits(bMaxHp)} HP`;
      if ($('#bossHpPct')) $('#bossHpPct').textContent = `${digits(bPct)}%`;
      const bFill = $('#bossHpBarFill');
      if (bFill) {
        bFill.style.width = `${bPct}%`;
        if (bPct > 50) bFill.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
        else if (bPct > 20) bFill.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
        else bFill.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
      }

      const logEl = $('#bossCombatLog');
      if (logEl) {
        logEl.innerHTML = '';
        const logs = (boss.combatLog || []).slice(-10).reverse();
        if (logs.length === 0) {
          logEl.innerHTML = `<div style="font-size:11px;color:var(--dash-text-sub);padding:4px;">${isEn ? 'No combat actions yet this week. Complete habits or attack!' : 'لم تسجل هجمات بعد هذا الأسبوع. أنجز عاداتك لتوجيه ضربات مباشرة!'}</div>`;
        } else {
          logs.forEach(entry => {
            const row = document.createElement('div');
            row.className = 'combat-log-item';
            row.style.cssText = 'font-size:11px;padding:3px 0;border-bottom:1px solid rgba(255,255,255,0.04);display:flex;justify-content:space-between;gap:8px;';
            row.innerHTML = `
              <span>${entry.text || ''}</span>
              <span style="opacity:0.6;font-size:10px;">${entry.time || ''}</span>
            `;
            logEl.appendChild(row);
          });
        }
      }

      const attackBtn = $('#btnQuickAttackBoss');
      if (attackBtn) {
        attackBtn.disabled = bHp <= 0;
        attackBtn.onclick = async () => {
          try {
            if (window.widgets?.habits?.attackBoss) {
              await window.widgets.habits.attackBoss(25, isEn ? 'Quick Hero Strike' : 'ضربة بطل خاطفة');
              await renderGamification();
            }
          } catch (err) {
            console.error('Boss attack error:', err);
          }
        };
      }
    }

    // Daily Quests & Boss Battles
    const questsGrid = $('#questsGrid');
    if (questsGrid) {
      questsGrid.innerHTML = '';
      try {
        if (window.widgets?.habits?.getQuests) {
          const quests = await window.widgets.habits.getQuests();
          if (quests && quests.length > 0) {
            quests.forEach(q => {
              const card = document.createElement('div');
              card.className = `quest-card ${q.completed ? 'completed' : ''}`;
              const title = isEn && q.titleEn ? q.titleEn : q.title;
              const desc = isEn && q.descEn ? q.descEn : q.desc;
              const progressPct = Math.min(100, Math.round(((q.progress || 0) / (q.target || 1)) * 100));

              card.innerHTML = `
                <div class="quest-top">
                  <span class="quest-icon">${q.icon || '📜'}</span>
                  <div>
                    <div class="quest-title">${title}</div>
                    <div class="quest-desc">${desc}</div>
                  </div>
                </div>
                <div class="quest-progress-wrap">
                  <div class="quest-progress-fill" style="width: ${progressPct}%;"></div>
                </div>
                <div class="quest-bottom">
                  <span class="quest-reward-tag">
                    ${q.reward?.coins ? `🪙 ${digits(q.reward.coins)}` : ''}
                    ${q.reward?.xp ? `⚡ ${digits(q.reward.xp)} XP` : ''}
                    ${q.reward?.shields ? `🛡️ ${digits(q.reward.shields)}` : ''}
                  </span>
                  <button class="btn-claim-quest" ${q.completed && !q.claimed ? '' : 'disabled'}>
                    ${q.claimed ? (isEn ? 'Claimed ✓' : 'تم الاستلام ✓') : (q.completed ? (isEn ? 'Claim 🎁' : 'استلام 🎁') : `${digits(q.progress || 0)} / ${digits(q.target || 1)}`)}
                  </button>
                </div>
              `;

              if (q.completed && !q.claimed) {
                card.querySelector('.btn-claim-quest')?.addEventListener('click', async () => {
                  if (window.widgets?.habits?.claimQuest) {
                    const res = await window.widgets.habits.claimQuest(q.id);
                    if (res?.success) {
                      await renderGamification();
                    }
                  }
                });
              }

              questsGrid.appendChild(card);
            });
          }
        }
      } catch (err) {
        console.warn('Failed to render quests:', err);
      }
    }

    // Self-Reward Shop
    const gridEl = $('#rewardsGrid');
    if (gridEl) {
      gridEl.innerHTML = '';
      const rewards = g.rewards || [];
      rewards.forEach(r => {
        const card = document.createElement('div');
        card.className = 'reward-card';
        const title = isEn && r.titleEn ? r.titleEn : r.title;
        const canAfford = (g.coins || 0) >= r.cost;

        card.innerHTML = `
          <div class="reward-card-top">
            <span class="reward-icon">${r.icon || '🎁'}</span>
            <span class="reward-title">${title}</span>
          </div>
          <div class="reward-card-bottom">
            <span class="reward-cost">🪙 ${digits(r.cost)}</span>
            <button class="btn-claim-reward" ${canAfford ? '' : 'disabled'} data-id="${r.id}">
              ${t('habits.claimRewardBtn')}
            </button>
          </div>
        `;

        card.querySelector('.btn-claim-reward')?.addEventListener('click', async () => {
          try {
            if (window.widgets?.habits?.claimReward) {
              const res = await window.widgets.habits.claimReward(r.id);
              if (res?.success) {
                alert(t('habits.rewardClaimed'));
                await renderGamification();
              }
            }
          } catch (e) {
            alert(e.message || t('habits.notEnoughCoins'));
          }
        });

        gridEl.appendChild(card);
      });
    }

    // Claimed History
    const listEl = $('#claimedRewardsList');
    if (listEl) {
      listEl.innerHTML = '';
      const claimed = g.claimedRewards || [];
      if (claimed.length === 0) {
        listEl.innerHTML = `<div style="font-size: 11px; color: var(--dash-text-sub); padding: 4px;">${isEn ? 'No rewards claimed yet.' : 'لم يتم استبدال أي مكافأة حتى الآن.'}</div>`;
      } else {
        claimed.slice(0, 10).forEach(c => {
          const item = document.createElement('div');
          item.className = 'claimed-item';
          const title = isEn && c.titleEn ? c.titleEn : c.title;
          const dateStr = c.claimedAt ? new Date(c.claimedAt).toLocaleDateString(isEn ? 'en-US' : 'ar-EG') : '';
          item.innerHTML = `
            <span class="claimed-item-title">${c.icon || '🎁'} ${title}</span>
            <span class="claimed-item-meta">🪙 ${digits(c.cost)}  •  ${dateStr}</span>
          `;
          listEl.appendChild(item);
        });
      }
    }

    // Bad Habit Breakers
    const breakersEl = $('#breakersList');
    if (breakersEl) {
      breakersEl.innerHTML = '';
      const negativeHabits = (state.habits || []).filter(h => !h.archived && h.direction === 'negative');
      if (negativeHabits.length === 0) {
        breakersEl.innerHTML = `<div style="font-size: 11px; color: var(--dash-text-sub); padding: 6px;">${isEn ? 'No bad habits tracked. You can create one in Habit Manager by choosing "Bad Habit Breaker".' : 'لا توجد عادات سلبية مسجلة حالياً. يمكنك إنشاء واحدة في تبويب إدارة العادات باختيار "كاسر عادة للإقلاع عنها".'}</div>`;
      } else {
        const todayStr = formatLocalDate();
        const dayLog = state.logs[todayStr] || { habits: {} };

        negativeHabits.forEach(h => {
          const card = document.createElement('div');
          card.className = 'breaker-card';
          const hLog = dayLog.habits && dayLog.habits[h.id];
          const isDone = hLog && hLog.status === 'done';
          const title = isEn && h.titleEn ? h.titleEn : h.title;
          const streak = calculateHabitStreak(h.id);

          card.innerHTML = `
            <div class="breaker-info">
              <span class="breaker-name">${h.icon || '🛑'} ${title}</span>
              <span class="breaker-stats">🛡️ ${digits(streak)} ${t('habits.days')} ${t('habits.resistedDays')} (+25 XP)</span>
            </div>
            <button class="btn-resist-habit ${isDone ? 'resisted' : ''}" data-id="${h.id}">
              ${isDone ? t('habits.resistedSuccess') : t('habits.markResisted')}
            </button>
          `;

          card.querySelector('.btn-resist-habit')?.addEventListener('click', async () => {
            const nextStatus = isDone ? 'none' : 'done';
            if (window.widgets?.habits?.saveStatus) {
              await window.widgets.habits.saveStatus({
                dateStr: todayStr,
                habitId: h.id,
                status: nextStatus,
                value: nextStatus === 'done' ? 1 : 0,
              });
            }
            if (!state.logs[todayStr]) state.logs[todayStr] = { habits: {} };
            if (!state.logs[todayStr].habits) state.logs[todayStr].habits = {};
            if (nextStatus === 'none') delete state.logs[todayStr].habits[h.id];
            else state.logs[todayStr].habits[h.id] = { status: 'done', value: 1 };
            await renderGamification();
          });

          breakersEl.appendChild(card);
        });
      }
    }

    renderHeroRadar(stats);
    setupRpgSubNav();
    renderStreakChallenge(g);
    renderSkillTree(g);
    renderLeagues(g);
    renderTrophies(g);
  }

  function renderHeroRadar(stats = {}) {
    const poly = $('#radarPolygon');
    if (!poly) return;
    const str = Number(stats.str || 10);
    const intVal = Number(stats.int || 10);
    const con = Number(stats.con || 10);
    const per = Number(stats.per || 10);

    const rStr = Math.min(55, Math.max(18, (str / 35) * 55));
    const rInt = Math.min(55, Math.max(18, (intVal / 35) * 55));
    const rCon = Math.min(55, Math.max(18, (con / 35) * 55));
    const rPer = Math.min(55, Math.max(18, (per / 35) * 55));

    poly.setAttribute('points', `80,${(80 - rStr).toFixed(1)} ${(80 + rInt).toFixed(1)},80 80,${(80 + rCon).toFixed(1)} ${(80 - rPer).toFixed(1)},80`);
  }

  let rpgNavWired = false;
  function setupRpgSubNav() {
    if (rpgNavWired) return;
    rpgNavWired = true;
    const btns = $$('.rpg-tab-btn');
    btns.forEach(btn => {
      btn.onclick = () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const view = btn.dataset.rpgView;
        const streak = $('#rpgSubViewStreak');
        const arena = $('#rpgSubViewArena');
        const skillTree = $('#rpgSubViewSkillTree');
        const leagues = $('#rpgSubViewLeagues');
        const trophies = $('#rpgSubViewTrophies');
        const shop = $('#rpgSubViewShop');

        if (streak) streak.style.display = view === 'streak' ? 'block' : 'none';
        if (arena) arena.style.display = view === 'arena' ? 'block' : 'none';
        if (skillTree) skillTree.style.display = view === 'skilltree' ? 'block' : 'none';
        if (leagues) leagues.style.display = view === 'leagues' ? 'block' : 'none';
        if (trophies) trophies.style.display = view === 'trophies' ? 'block' : 'none';
        if (shop) shop.style.display = view === 'shop' ? 'block' : 'none';
      };
    });
  }

  function renderStreakChallenge(g = {}) {
    const isEn = lang() === 'en';
    const activeHabits = (state.habits || []).filter(h => !h.archived);
    const todayStr = formatLocalDate();

    let currentMaxStreak = 0;
    let allTimeBestStreak = 0;
    let earliestStartDate = null;

    activeHabits.forEach(h => {
      let streak = 0;
      let d = new Date();
      let dateKey = formatLocalDate(d);
      if (state.logs?.[dateKey]?.habits?.[h.id]?.status === 'done') {
        streak++;
      }
      d.setDate(d.getDate() - 1);
      for (let step = 0; step < 90; step++) {
        dateKey = formatLocalDate(d);
        if (state.logs?.[dateKey]?.habits?.[h.id]?.status === 'done') {
          streak++;
          d.setDate(d.getDate() - 1);
        } else {
          break;
        }
      }
      if (streak > currentMaxStreak) currentMaxStreak = streak;
      if ((h.bestStreak || streak) > allTimeBestStreak) allTimeBestStreak = Math.max(h.bestStreak || 0, streak);
      if (h.createdAt) {
        if (!earliestStartDate || h.createdAt < earliestStartDate) earliestStartDate = h.createdAt;
      }
    });

    if (g.streak !== undefined && g.streak > currentMaxStreak) {
      currentMaxStreak = g.streak;
    }
    allTimeBestStreak = Math.max(allTimeBestStreak, currentMaxStreak);

    // 1. Hero Mascot & Counter
    const heroDaysEl = $('#streakHeroDays');
    if (heroDaysEl) heroDaysEl.textContent = digits(currentMaxStreak);

    const heroSubEl = $('#streakHeroSub');
    if (heroSubEl) {
      if (currentMaxStreak >= 14) {
        heroSubEl.textContent = isEn ? 'Unstoppable Momentum! You are forging iron discipline.' : 'زخم استثنائي لا يتوقف! أنت تصنع هوية وانضباطاً حديدياً.';
      } else if (currentMaxStreak >= 7) {
        heroSubEl.textContent = isEn ? '7-day mark reached! The hardest phase is conquered.' : 'تجاوزت حاجز الأسبوع! أصعب مرحلة في تكوين العادة أصبحت خلفك.';
      } else if (currentMaxStreak > 0) {
        heroSubEl.textContent = isEn ? 'Great consistency! Every completed habit cements your streak.' : 'استمرارية ممتازة! كل عادة تنجزها تزيد شعلتك توهجاً.';
      } else {
        heroSubEl.textContent = isEn ? 'Complete your first habit today to light the streak flame!' : 'أنجز أول عادة اليوم لإشعال شعلة الالتزام!';
      }
    }

    // 2. 7-Day Weekly Strip
    const stripEl = $('#streakWeeklyStrip');
    if (stripEl) {
      stripEl.innerHTML = '';
      const days = getWeekDays(state.currentWeekDate || new Date());
      const dayNamesAr = ['سبت', 'أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'];
      const dayNamesEn = ['Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr'];

      days.forEach((dayObj, idx) => {
        const dStr = formatLocalDate(dayObj);
        const isToday = (dStr === todayStr);
        let completedCount = 0;
        activeHabits.forEach(h => {
          if (state.logs?.[dStr]?.habits?.[h.id]?.status === 'done') completedCount++;
        });
        const hasStreak = completedCount > 0;
        const dayCol = document.createElement('div');
        dayCol.className = 'streak-day-col';

        const dayName = isEn ? dayNamesEn[idx] : dayNamesAr[idx];
        const dayNum = digits(dayObj.getDate());

        dayCol.innerHTML = `
          <span class="streak-day-label">${dayName}</span>
          <div class="streak-day-badge ${hasStreak ? 'active-streak' : ''} ${isToday ? 'today-focus' : ''}" title="${dStr}: ${completedCount}/${activeHabits.length}">
            <span class="streak-day-icon">${hasStreak ? '🔥' : '○'}</span>
            <span class="streak-day-num">${dayNum}</span>
          </div>
        `;
        stripEl.appendChild(dayCol);
      });
    }

    // 3. Challenge Progress (14-Day Challenge)
    const targetChallenge = 14;
    const currentDayOfChallenge = Math.min(targetChallenge, Math.max(0, currentMaxStreak));
    const challengePct = Math.min(100, Math.max(5, (currentDayOfChallenge / targetChallenge) * 100));

    const progBadgeEl = $('#challengeProgressCount');
    if (progBadgeEl) {
      progBadgeEl.textContent = isEn ? `Day ${digits(currentDayOfChallenge)} of ${digits(targetChallenge)}` : `اليوم ${digits(currentDayOfChallenge)} من ${digits(targetChallenge)}`;
    }
    const fillEl = $('#challengeTrackFill');
    if (fillEl) fillEl.style.width = `${challengePct}%`;

    const node7 = $('#cpNode7');
    if (node7) node7.classList.toggle('reached', currentMaxStreak >= 7);
    const node14 = $('#cpNode14');
    if (node14) node14.classList.toggle('reached', currentMaxStreak >= 14);

    // 4. History Stats
    const startedValEl = $('#streakStartedVal');
    if (startedValEl) {
      if (earliestStartDate) {
        const sDate = new Date(earliestStartDate);
        startedValEl.textContent = sDate.toLocaleDateString(isEn ? 'en-US' : 'ar-EG', { month: 'short', day: 'numeric', year: 'numeric' });
      } else {
        startedValEl.textContent = isEn ? 'Active this week' : 'هذا الأسبوع';
      }
    }
    const recordValEl = $('#streakRecordVal');
    if (recordValEl) recordValEl.textContent = `${digits(allTimeBestStreak)} ${isEn ? 'days' : 'أيام'}`;

    const shieldsValEl = $('#streakShieldsVal');
    const shieldsCount = g.shields || 0;
    if (shieldsValEl) shieldsValEl.textContent = `${digits(shieldsCount)} ${isEn ? 'shields' : 'دروع'}`;

    // 5. Streak Milestones List
    const milestonesEl = $('#streakMilestonesList');
    if (milestonesEl) {
      milestonesEl.innerHTML = '';
      const milestones = [
        { days: 7, nameAr: 'شرارة الانطلاق (7 أيام)', nameEn: 'Spark of Habit (7 Days)', reward: '+50 XP & 20 🪙', minStreak: 7 },
        { days: 14, nameAr: 'صلابة المسار (14 يوماً)', nameEn: 'Habit Formation (14 Days)', reward: '+120 XP & 50 🪙', minStreak: 14 },
        { days: 21, nameAr: 'القفل العصبي للعادة (21 يوماً)', nameEn: 'Neural Lock (21 Days)', reward: '+200 XP & 🛡️ درع حماية', minStreak: 21 },
        { days: 30, nameAr: 'بطل الشهر الذهبي (30 يوماً)', nameEn: 'Monthly Titan (30 Days)', reward: '+350 XP & 100 🪙', minStreak: 30 },
        { days: 100, nameAr: 'أسطورة الاستمرارية (100 يوم)', nameEn: 'Century Legend (100 Days)', reward: '+1000 XP & 👑 لقب أسطوري', minStreak: 100 },
      ];

      milestones.forEach(m => {
        const isUnlocked = currentMaxStreak >= m.minStreak;
        const card = document.createElement('div');
        card.className = `milestone-item-card ${isUnlocked ? 'unlocked' : ''}`;
        card.innerHTML = `
          <div class="milestone-left">
            <span class="milestone-badge-pill">${digits(m.days)} ${isEn ? 'd' : 'ي'}</span>
            <div>
              <div class="milestone-title-text">${isEn ? m.nameEn : m.nameAr}</div>
              <div class="milestone-reward-text">🎁 ${m.reward}</div>
            </div>
          </div>
          <div>
            ${isUnlocked
            ? `<span class="btn-claim-milestone" style="background:#10b981;cursor:default;">✓ ${isEn ? 'Achieved' : 'تم الإنجاز'}</span>`
            : `<span class="btn-claim-milestone claimed">${digits(currentMaxStreak)} / ${digits(m.minStreak)}</span>`
          }
          </div>
        `;
        milestonesEl.appendChild(card);
      });
    }
  }

  function renderSkillTree(g = {}) {
    const grid = $('#skillBranchesGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const isEn = lang() === 'en';
    const lvl = g.level || 1;
    const stats = g.stats || {};
    const spPointsEl = $('#skillPointsAvailable');
    const availableSp = Math.max(0, Math.floor(lvl * 1.5) - 1);
    if (spPointsEl) spPointsEl.textContent = `${digits(availableSp)} SP`;

    const branches = [
      {
        id: 'vitality',
        icon: '🌿',
        nameAr: 'شجرة الحيوية والبدن (Vitality & Body)',
        nameEn: 'Vitality & Physical Tree',
        statKey: 'str',
        perkAr: 'ترفع كفاءة الطاقة والصحة وتقلل الإجهاد',
        perkEn: 'Boosts energy, health & reduces fatigue',
        nodes: [
          { nameAr: 'رواء الفجر', nameEn: 'Morning Hydration', descAr: 'شرب 500 مل ماء فور الاستيقاظ', descEn: 'Drink 500ml water upon waking' },
          { nameAr: 'درع الحركة', nameEn: 'Daily Movement', descAr: '30 دقيقة نشاط بدني يومي', descEn: '30m physical movement daily' },
          { nameAr: 'تعافي الفولاذ', nameEn: 'Steel Recovery', descAr: '8 ساعات نوم صحي عميق', descEn: '8 hours deep restorative sleep' },
          { nameAr: 'ذروة اللياقة', nameEn: 'Peak Physique', descAr: 'اكتمال البنية البدنية والنشاط الدائم', descEn: 'Maximum physical mastery & stamina' },
        ]
      },
      {
        id: 'wisdom',
        icon: '🧠',
        nameAr: 'شجرة المعرفة والحكمة (Mind & Wisdom)',
        nameEn: 'Mind & Wisdom Tree',
        statKey: 'int',
        perkAr: 'تزيد سعة المانا MP وسرعة التعلم والذاكرة',
        perkEn: 'Expands MP capacity, focus speed & memory',
        nodes: [
          { nameAr: 'قارئ مثابر', nameEn: 'Consistent Reader', descAr: '10 صفحات يومياً من كتاب قيّم', descEn: '10 pages daily of insightful books' },
          { nameAr: 'دفتر الخواطر', nameEn: 'Mind Journaling', descAr: 'تدوين فكرة وتأمل يومي منظم', descEn: 'Write daily insights & reflections' },
          { nameAr: 'التعلم العميق', nameEn: 'Deliberate Practice', descAr: 'ساعة تدريب تخصصي متقدم', descEn: '1 hour advanced specialized practice' },
          { nameAr: 'عقل موسوعي', nameEn: 'Polymath Mind', descAr: 'فهم عميق ورؤية استراتيجية للحياة', descEn: 'Holistic wisdom & strategic clarity' },
        ]
      },
      {
        id: 'focus',
        icon: '⚡',
        nameAr: 'شجرة التركيز والإنجاز (Focus & Mastery)',
        nameEn: 'Focus & Execution Tree',
        statKey: 'con',
        perkAr: 'تضاعف ضرر ضربات الزعيم وتدحر التسويف',
        perkEn: 'Boosts boss strike damage & kills procrastination',
        nodes: [
          { nameAr: 'أول بومودورو', nameEn: 'First Focus Block', descAr: '25 دقيقة تركيز خالية من التشتيت', descEn: '25m distraction-free deep block' },
          { nameAr: 'التدفق الذهني', nameEn: 'Flow State', descAr: 'جلسة عمل عميق متواصلة 90 دقيقة', descEn: '90m unbroken flow state session' },
          { nameAr: 'قاهر التسويف', nameEn: 'Procrastination Buster', descAr: 'إنجاز أصعب مهمة أول النهار', descEn: 'Execute hardest task first thing' },
          { nameAr: 'إرادة فولاذية', nameEn: 'Unstoppable Will', descAr: 'انضباط ذاتي تام وتحقيق الأهداف', descEn: 'Total self-mastery & goal execution' },
        ]
      },
      {
        id: 'spirit',
        icon: '🕊️',
        nameAr: 'شجرة السكينة والروح (Spirit & Serenity)',
        nameEn: 'Spirit & Serenity Tree',
        statKey: 'per',
        perkAr: 'تحمي الصحة ضد كواسر العادات وتضاعف الذهب',
        perkEn: 'Protects HP against bad habits & boosts coin drop',
        nodes: [
          { nameAr: 'ورد السكينة', nameEn: 'Daily Devotion', descAr: 'ورد القرآن والأذكار اليومية', descEn: 'Daily Quran recitation & remembrance' },
          { nameAr: 'وقفة التدبر', nameEn: 'Mindful Stillness', descAr: '5 دقائق هدوء واستحضار النية', descEn: '5m mindful presence & intention' },
          { nameAr: 'حصن الامتنان', nameEn: 'Gratitude Shield', descAr: 'شكر النعم وتدوين 3 مسرات يومياً', descEn: 'Count blessings & log 3 joys daily' },
          { nameAr: 'طمأنينة القلب', nameEn: 'Inner Peace', descAr: 'سلام داخلي راسخ وثبات انفعالي', descEn: 'Unshakable calm & spiritual fortress' },
        ]
      }
    ];

    branches.forEach(b => {
      const card = document.createElement('div');
      card.className = 'skill-branch-card';
      const statVal = Number(stats[b.statKey] || 10);
      const unlockedCount = Math.min(4, Math.max(1, Math.floor((statVal - 8) / 3)));

      card.innerHTML = `
        <div class="branch-title-row">
          <div class="branch-icon-box">${b.icon}</div>
          <div>
            <h4 class="branch-name">${isEn ? b.nameEn : b.nameAr}</h4>
            <div class="branch-perk-hint">${isEn ? b.perkEn : b.perkAr}</div>
          </div>
        </div>
        <div class="skill-nodes-list">
          ${b.nodes.map((n, idx) => {
        const isUnlocked = idx < unlockedCount;
        const isMastered = idx === 3 && isUnlocked;
        const lvlTag = isMastered ? 'Mastered ⭐' : (isUnlocked ? 'Lv.3/3' : 'Locked 🔒');
        return `
              <div class="skill-node-item ${isMastered ? 'mastered' : (isUnlocked ? 'unlocked' : '')}">
                <div class="skill-node-info">
                  <div class="skill-node-status-dot"></div>
                  <div>
                    <div class="skill-node-title">${isEn ? n.nameEn : n.nameAr}</div>
                    <div class="skill-node-desc">${isEn ? n.descEn : n.descAr}</div>
                  </div>
                </div>
                <span class="skill-node-lvl-tag">${lvlTag}</span>
              </div>
            `;
      }).join('')}
        </div>
      `;
      grid.appendChild(card);
    });
  }

  function renderLeagues(g = {}) {
    const isEn = lang() === 'en';
    const lvl = g.level || 1;
    let tierIndex = 0;
    let icon = '🥉';
    let titleAr = 'دوري المبتدئين البرونزي (Bronze League)';
    let titleEn = 'Bronze Novice League';
    let promoStr = 'Lv.1 -> Lv.5';

    if (lvl >= 50) {
      tierIndex = 5; icon = '🌌';
      titleAr = 'دوري الأساطير الخالدة (Mythic League)';
      titleEn = 'Mythic Sovereign League';
      promoStr = 'Max Rank Achieved 👑';
    } else if (lvl >= 35) {
      tierIndex = 4; icon = '👑';
      titleAr = 'دوري الأبطال الماسي (Diamond League)';
      titleEn = 'Diamond Champion League';
      promoStr = `Lv.${lvl} -> Lv.50`;
    } else if (lvl >= 20) {
      tierIndex = 3; icon = '💎';
      titleAr = 'دوري الفرسان البلاتيني (Platinum League)';
      titleEn = 'Platinum Knight League';
      promoStr = `Lv.${lvl} -> Lv.35`;
    } else if (lvl >= 10) {
      tierIndex = 2; icon = '🥇';
      titleAr = 'دوري النخبة الذهبي (Gold League)';
      titleEn = 'Gold Elite League';
      promoStr = `Lv.${lvl} -> Lv.20`;
    } else if (lvl >= 5) {
      tierIndex = 1; icon = '🥈';
      titleAr = 'دوري المغامرين الفضي (Silver League)';
      titleEn = 'Silver Adventurer League';
      promoStr = `Lv.${lvl} -> Lv.10`;
    }

    if ($('#leagueShieldIcon')) $('#leagueShieldIcon').textContent = icon;
    if ($('#leagueTierTitle')) $('#leagueTierTitle').textContent = isEn ? titleEn : titleAr;
    if ($('#leaguePromoProgress')) $('#leaguePromoProgress').textContent = promoStr;

    const pills = $$('#leagueTiersBar .tier-pill');
    pills.forEach((p, idx) => {
      p.classList.remove('completed', 'active');
      if (idx < tierIndex) p.classList.add('completed');
      else if (idx === tierIndex) p.classList.add('active');
    });
  }

  function renderTrophies(g = {}) {
    const grid = $('#trophiesGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const isEn = lang() === 'en';
    const habits = state.habits || [];
    let maxStreak = 0;
    habits.forEach(h => {
      const s = calculateHabitStreak(h.id);
      if (s > maxStreak) maxStreak = s;
    });

    const trophies = [
      { id: 'iron_will', icon: '🛡️', nameAr: 'الدرع الفولاذي', nameEn: 'Iron Will', descAr: 'تحقيق سلسلة 7 أيام متواصلة دون انقطاع', descEn: 'Maintain an unbroken 7-day habit streak', unlocked: maxStreak >= 7 },
      { id: 'early_bird', icon: '⚡', nameAr: 'صاعقة الفجر', nameEn: 'Early Bird', descAr: 'إنجاز 5 عادات صباحية متتالية في وقتها', descEn: 'Complete 5 consecutive morning routines on time', unlocked: maxStreak >= 5 },
      { id: 'boss_slayer', icon: '🐉', nameAr: 'قاهر الوحوش', nameEn: 'Boss Slayer', descAr: 'إلحاق 100+ ضرر بزعيم الأسبوع أو هزيمته', descEn: 'Deal 100+ damage to weekly boss or defeat it', unlocked: (g.boss?.maxHp - (g.boss?.hp || 0)) >= 50 },
      { id: 'scholar_mind', icon: '🔮', nameAr: 'حكمة العارفين', nameEn: 'Scholar Mind', descAr: 'إنجاز 10 جلسات قراءة وتدوين معرفي', descEn: 'Log 10 reading or learning habit sessions', unlocked: (g.stats?.int || 10) >= 12 },
      { id: 'hydration_hero', icon: '💧', nameAr: 'نبع الحيوية', nameEn: 'Hydration Hero', descAr: 'شرب 2.5 لتر ماء لـ 7 أيام متتالية', descEn: 'Drink 2.5L water for 7 consecutive days', unlocked: (g.stats?.str || 10) >= 12 },
      { id: 'zen_master', icon: '🧘', nameAr: 'حصن الهدوء', nameEn: 'Zen Master', descAr: 'صفاء المزاج وانخفاض مؤشر التوتر لأسبوع', descEn: 'Maintain balanced mood and low stress for a week', unlocked: (g.stats?.con || 10) >= 12 },
      { id: 'perfectionist', icon: '💎', nameAr: 'يوم الإنجاز التام', nameEn: '100% Day', descAr: 'إكمال 100% من عادات اليوم دون استثناء', descEn: 'Complete 100% of today\'s habits with zero misses', unlocked: (g.progressPercent || 0) >= 100 || (g.level || 1) >= 2 },
      { id: 'phoenix_recovery', icon: '🌟', nameAr: 'نهوض العنقاء', nameEn: 'Phoenix Rise', descAr: 'امتلاك دروع التجميد واستعادة كامل الصحة', descEn: 'Own streak shields and restore full vitality', unlocked: (g.streakShields || 0) > 0 || (g.hp || 100) >= 100 }
    ];

    let unlockedCount = 0;
    trophies.forEach(t => {
      if (t.unlocked) unlockedCount++;
      const card = document.createElement('div');
      card.className = `trophy-card ${t.unlocked ? 'unlocked' : ''}`;
      card.innerHTML = `
        <div class="trophy-icon-box">${t.icon}</div>
        <div class="trophy-name">${isEn ? t.nameEn : t.nameAr}</div>
        <div class="trophy-desc">${isEn ? t.descEn : t.descAr}</div>
        <span class="trophy-badge-status">${t.unlocked ? (isEn ? 'Unlocked ✓' : 'مكتمل ✓') : (isEn ? 'Locked 🔒' : 'قيد التقدم 🔒')}</span>
      `;
      grid.appendChild(card);
    });

    const cntEl = $('#trophiesUnlockedCount');
    if (cntEl) cntEl.textContent = digits(unlockedCount);
  }

  /* ==================================================================== *
   * 6. BACKUP & WHATSAPP HUB
   * ==================================================================== */

  function renderBackupAndWaHub() {
    const isMonthly = $('#btnWaMonthlyType')?.classList.contains('active') ?? true;
    const previewEl = $('#waPreviewText');
    if (!previewEl) return;
    const reportLang = state.reportLang || (lang() === 'en' ? 'en' : 'ar');

    if (window.widgets?.habits?.sendWaReport) {
      window.widgets.habits.sendWaReport({
        type: isMonthly ? 'monthly' : 'weekly',
        targetDateStr: state.activeMonth,
        lang: reportLang,
        previewOnly: true,
      }).then(res => {
        if (res && (res.preview || res.text)) {
          previewEl.textContent = res.preview || res.text;
        }
      }).catch(err => {
        previewEl.textContent = `خطأ في المعاينة: ${err.message}`;
      });
    }
  }

  /* ---------- Event Wiring ---------- */

  function wireEvents() {
    // Header month nav
    $('#btnPrevMonth')?.addEventListener('click', () => {
      state.activeMonth = stepMonth(state.activeMonth, -1);
      updateMonthDisplay();
      renderActiveTab();
    });

    $('#btnNextMonth')?.addEventListener('click', () => {
      state.activeMonth = stepMonth(state.activeMonth, 1);
      updateMonthDisplay();
      renderActiveTab();
    });

    $('#btnTodayMonth')?.addEventListener('click', () => {
      state.activeMonth = todayStr().slice(0, 7);
      updateMonthDisplay();
      renderActiveTab();
    });

    // Close button
    $('#btnDashClose')?.addEventListener('click', () => {
      closeWindow();
    });

    // Header Quick Action Buttons
    $('#btnHeaderNewHabit')?.addEventListener('click', () => {
      switchTab('manager');
      clearHabitForm();
      const quickInp = $('#quickHabitInputTitle');
      if (quickInp) quickInp.focus();
      else $('#habitInputTitle')?.focus();
    });

    $('#btnHeaderWaReport')?.addEventListener('click', () => {
      switchTab('backup');
    });

    // Tab buttons
    $$('.dash-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        switchTab(btn.dataset.tab);
      });
    });

    // Matrix Routine Filter
    $('#matrixRoutineFilter')?.addEventListener('change', () => {
      renderBujoGrid();
    });

    // Settings Button
    $('#btnHeaderSettings')?.addEventListener('click', () => {
      window.widgets?.win?.openSettings?.('habits');
    });

    // Language Switcher
    $('#btnHeaderLang')?.addEventListener('click', async () => {
      const nextLang = lang() === 'ar' ? 'en' : 'ar';
      if (window.widgets?.settings?.set) {
        await window.widgets.settings.set({ language: nextLang });
      }
    });

    // View Switcher (Weekly / Compact / Cards / Table)
    $$('.view-switch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.viewMode = btn.dataset.view;
        renderBujoGrid();
      });
    });

    // Weekly Navigation
    $('#btnPrevWeek')?.addEventListener('click', () => {
      state.weekOffset -= 1;
      renderBujoGrid();
    });
    $('#btnNextWeek')?.addEventListener('click', () => {
      state.weekOffset += 1;
      renderBujoGrid();
    });

    // Habit Search Filter
    $('#matrixSearchInput')?.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim();
      renderBujoGrid();
    });

    // 90-Day Heatmap Accordion Toggle
    $('#btnToggleHeatmap')?.addEventListener('click', () => {
      state.heatmapCollapsed = !state.heatmapCollapsed;
      const card = $('.heatmap-card');
      const arrow = $('#heatmapAccArrow');
      if (card) card.style.display = state.heatmapCollapsed ? 'none' : 'block';
      if (arrow) arrow.classList.toggle('collapsed', state.heatmapCollapsed);
    });

    // Habit Form Save
    $('#btnSaveHabitForm')?.addEventListener('click', async () => {
      const title = $('#habitInputTitle')?.value?.trim();
      if (!title) {
        $('#habitInputTitle')?.focus();
        return;
      }

      const id = $('#editHabitId')?.value || `hbt-${Date.now()}`;
      const titleEn = $('#habitInputTitleEn')?.value?.trim() || title;
      const routine = $('#habitInputRoutine')?.value || 'anytime';
      const category = $('#habitInputCategory')?.value || 'general';
      const type = $('#habitInputType')?.value || 'boolean';
      const direction = $('#habitInputDirection')?.value || 'positive';
      const difficulty = $('#habitInputDifficulty')?.value || 'easy';
      let targetVal = Number($('#habitInputTarget')?.value) || 1;
      let unit = $('#habitInputUnit')?.value?.trim() || '';
      let partsCount = undefined;
      let stepValue = undefined;

      if (type === 'boolean') {
        targetVal = 1;
        unit = '';
      } else if (type === 'percentage') {
        targetVal = Math.min(100, Math.max(1, targetVal || 100));
        unit = '%';
        partsCount = Math.max(1, Math.min(100, Number($('#habitInputParts')?.value) || 5));
        stepValue = Math.max(1, Math.min(targetVal, Number($('#habitInputStepPct')?.value) || Math.round(targetVal / partsCount) || 20));
      } else if (type === 'rating') {
        targetVal = 5;
        unit = '⭐';
      } else if (type === 'duration') {
        targetVal = Math.max(1, targetVal);
        if (!unit) unit = lang() === 'en' ? 'min' : 'دقيقة';
      } else if (type === 'number') {
        targetVal = Math.max(1, targetVal);
        if (!unit) unit = lang() === 'en' ? 'times' : 'مرة';
      }
      const icon = $('#habitInputIcon')?.value?.trim() || '⭐';
      const color = $('#habitInputColor')?.value || '#3b82f6';

      const freqType = $('#habitInputFreqType')?.value || 'daily';
      let frequency = { type: freqType };
      if (freqType === 'weekly_target') {
        frequency.targetDaysPerWeek = Number($('#habitInputTargetDays')?.value) || 3;
      } else if (freqType === 'every_x_days') {
        frequency.interval = Number($('#habitInputIntervalDays')?.value) || 2;
      } else if (freqType === 'specific_days') {
        frequency.daysOfWeek = Array.from($$('input[name="freqDay"]:checked')).map(cb => Number(cb.value));
      }

      const habitPayload = {
        id,
        title,
        titleEn,
        routine,
        category,
        type,
        direction,
        difficulty,
        targetValue: targetVal,
        partsCount: type === 'percentage' ? (partsCount || 5) : undefined,
        stepValue: type === 'percentage' ? (stepValue || 20) : 1,
        unit,
        unitEn: unit,
        icon,
        color,
        frequency,
        enablePomodoro: $('#habitInputEnablePomodoro')?.checked ?? false,
        timerMode: $('#habitInputTimerMode')?.checked ?? false,
        attributeAffinity: $('#habitInputAttributeAffinity')?.value || null,
        subItems: getSubItemsFromBuilder(),
        syncToTodo: $('#habitInputSyncToTodo')?.checked ?? false,
        todoPriority: Number($('#habitInputTodoPriority')?.value ?? 1),
        syncToCalendar: $('#habitInputSyncToCalendar')?.checked ?? false,
        calendarTime: $('#habitInputCalTime')?.value || '08:00',
        calendarDuration: Number($('#habitInputCalDuration')?.value) || 30,
        triggerCue: $('#habitInputTriggerCue')?.value?.trim() || '',
        reminderTime: $('#habitInputWaReminderTime')?.value || $('#habitInputReminderTime')?.value || '08:00',
        reminderEnabled: $('#habitInputWaReminderEnabled')?.checked ?? false,
        reminderRecipient: $('#habitInputWaRecipientMode')?.value === 'custom' ? ($('#habitInputWaRecipientCustom')?.value?.trim() || '') : '',
        reminderCustomText: $('#habitInputWaCustomPrompt')?.value?.trim() || '',
        targetGoalStreak: Number($('#habitInputTargetStreak')?.value) || 30,
        notes: $('#habitInputNotes')?.value?.trim() || '',
        createdAt: new Date().toISOString(),
        archived: false,
      };

      if (window.widgets?.habits?.saveHabit) {
        await window.widgets.habits.saveHabit(habitPayload);
        const idx = state.habits.findIndex(h => h.id === id);
        if (idx >= 0) state.habits[idx] = habitPayload;
        else state.habits.push(habitPayload);
        clearHabitForm();
        renderHabitManager();
      }
    });

    $('#habitInputWaReminderEnabled')?.addEventListener('change', (e) => {
      if ($('#habitWaReminderFields')) $('#habitWaReminderFields').style.display = e.target.checked ? 'block' : 'none';
    });

    $('#habitInputWaRecipientMode')?.addEventListener('change', (e) => {
      if ($('#habitWaCustomRecipientWrap')) $('#habitWaCustomRecipientWrap').style.display = e.target.value === 'custom' ? 'block' : 'none';
    });

    $('#btnTestHabitWaReminder')?.addEventListener('click', async () => {
      const statusEl = $('#habitWaTestStatus');
      const habitId = $('#editHabitId')?.value;
      if (statusEl) {
        statusEl.textContent = 'جاري إرسال التذكير التجريبي...';
        statusEl.className = 'hint inline';
      }
      try {
        const timeVal = $('#habitInputWaReminderTime')?.value || '08:00';
        const recipVal = $('#habitInputWaRecipientMode')?.value === 'custom' ? ($('#habitInputWaRecipientCustom')?.value?.trim() || '') : '';
        const customPrompt = $('#habitInputWaCustomPrompt')?.value?.trim() || '';
        const titleVal = $('#habitInputTitle')?.value?.trim() || 'عادة تجريبية';
        let res;
        if (habitId && window.widgets?.habits?.testHabitReminder) {
          res = await window.widgets.habits.testHabitReminder(habitId);
        } else {
          const msg = `⏰ *[تذكير بموعد العادة]* ⭐ *${titleVal}*\n\n🔥 *سلسلة الالتزام:* 1 يوم! استمر ولا تقطع السلسلة!\n${customPrompt ? `💡 _${customPrompt}_\n\n` : ''}✅ سجّلها في ودجة العادات عند إتمامها لتسجيل الإنجاز!`;
          res = await window.widgets?.whatsapp?.test?.({
            phone: recipVal || undefined,
            text: msg,
          });
        }
        if (res && (res.success || res.ok)) {
          if (statusEl) {
            statusEl.textContent = 'تم إرسال التذكير بنجاح! 🚀';
            statusEl.className = 'hint inline success';
          }
        } else {
          if (statusEl) {
            statusEl.textContent = 'تعذر الإرسال: ' + (res?.error || 'تحقق من اتصال الواتساب في الإعدادات');
            statusEl.className = 'hint inline error';
          }
        }
      } catch (err) {
        if (statusEl) {
          statusEl.textContent = 'خطأ: ' + (err.message || String(err));
          statusEl.className = 'hint inline error';
        }
      }
    });

    $('#btnAddSubItemInput')?.addEventListener('click', () => {
      addSubItemBuilderRow();
    });

    $('#btnCancelHabitEdit')?.addEventListener('click', clearHabitForm);

    $('#habitInputSyncToTodo')?.addEventListener('change', (e) => {
      if ($('#habitInputTodoPrioGroup')) {
        $('#habitInputTodoPrioGroup').style.display = e.target.checked ? 'block' : 'none';
      }
    });

    $('#habitInputSyncToCalendar')?.addEventListener('change', (e) => {
      if ($('#habitInputCalGroup')) {
        $('#habitInputCalGroup').style.display = e.target.checked ? 'block' : 'none';
      }
    });

    // Frequency type toggles
    $('#habitInputFreqType')?.addEventListener('change', (e) => {
      const val = e.target.value;
      $('#freqWeeklyGroup').hidden = val !== 'weekly_target';
      $('#freqSpecificDaysGroup').hidden = val !== 'specific_days';
      $('#freqIntervalGroup').hidden = val !== 'every_x_days';
    });

    // Backup & Restore Wiring
    $('#btnExportJson')?.addEventListener('click', async () => {
      if (window.widgets?.habits?.exportData) {
        const json = await window.widgets.habits.exportData('json');
        const blob = new Blob([json], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `mirqat-habits-backup-${state.activeMonth}.json`;
        a.click();
      }
    });

    $('#btnExportCsv')?.addEventListener('click', async () => {
      if (window.widgets?.habits?.exportData) {
        const csv = await window.widgets.habits.exportData('csv');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `mirqat-habits-data-${state.activeMonth}.csv`;
        a.click();
      }
    });

    $('#btnPickImportFile')?.addEventListener('click', () => {
      $('#importFileInput')?.click();
    });

    $('#importFileInput')?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      $('#importFileNameDisplay').textContent = file.name;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          state.selectedImportPayload = JSON.parse(ev.target.result);
          $('#importActionsRow').hidden = false;
        } catch (err) {
          alert('خطأ في قراءة ملف JSON: ' + err.message);
        }
      };
      reader.readAsText(file);
    });

    $('#btnConfirmImport')?.addEventListener('click', async () => {
      if (!state.selectedImportPayload || !window.widgets?.habits?.importData) return;
      const res = await window.widgets.habits.importData(state.selectedImportPayload, true);
      if (res && res.success) {
        $('#backupStatusMsg').textContent = '✅ تم استرجاع ودمج البيانات بنجاح!';
        $('#backupStatusMsg').style.color = '#10b981';
        await loadState();
      } else {
        $('#backupStatusMsg').textContent = `❌ فشل الاسترجاع: ${res?.error || 'بيانات غير صالحة'}`;
        $('#backupStatusMsg').style.color = '#ef4444';
      }
    });

    // WhatsApp Live Dispatch
    $('#btnSendWaNow')?.addEventListener('click', async () => {
      const statusEl = $('#waDispatchStatus');
      const isMonthly = $('#btnWaMonthlyType')?.classList.contains('active') ?? true;
      const reportLang = state.reportLang || (lang() === 'en' ? 'en' : 'ar');
      if (statusEl) {
        statusEl.textContent = '⏳ جاري إرسال التقرير عبر خادم الواتساب...';
        statusEl.style.color = 'var(--dash-accent)';
      }
      try {
        const res = await window.widgets.habits.sendWaReport({
          type: isMonthly ? 'monthly' : 'weekly',
          targetDateStr: state.activeMonth,
          lang: reportLang,
          previewOnly: false,
        });
        if (res && res.success) {
          statusEl.textContent = '✅ تم إرسال التقرير للواتساب بنجاح!';
          statusEl.style.color = '#10b981';
        } else {
          statusEl.textContent = `⚠️ تعذر الإرسال: ${res?.error || 'تأكد من إعدادات الواتساب'}`;
          statusEl.style.color = '#ef4444';
        }
      } catch (err) {
        if (statusEl) {
          statusEl.textContent = `❌ خطأ في الإرسال: ${err.message}`;
          statusEl.style.color = '#ef4444';
        }
      }
    });

    $('#btnWaMonthlyType')?.addEventListener('click', () => {
      $('#btnWaMonthlyType').classList.add('active');
      $('#btnWaWeeklyType').classList.remove('active');
      renderBackupAndWaHub();
    });

    $('#btnWaWeeklyType')?.addEventListener('click', () => {
      $('#btnWaWeeklyType').classList.add('active');
      $('#btnWaMonthlyType').classList.remove('active');
      renderBackupAndWaHub();
    });

    $('#btnWaLangAr')?.addEventListener('click', () => {
      state.reportLang = 'ar';
      $('#btnWaLangAr').classList.add('active');
      $('#btnWaLangEn').classList.remove('active');
      renderBackupAndWaHub();
    });

    $('#btnWaLangEn')?.addEventListener('click', () => {
      state.reportLang = 'en';
      $('#btnWaLangEn').classList.add('active');
      $('#btnWaLangAr').classList.remove('active');
      renderBackupAndWaHub();
    });

    // Reflection Save
    $('#btnSaveReflection')?.addEventListener('click', async () => {
      const text = $('#reflectionTextarea')?.value;
      if (window.widgets?.habits?.saveDayNote) {
        await window.widgets.habits.saveDayNote({ dateStr: selectedReflectionDate, note: text });
        const st = $('#reflectionSaveStatus');
        if (st) {
          st.textContent = t('habits.noteSaved');
          setTimeout(() => { if (st) st.textContent = ''; }, 3000);
        }
        await renderHeatmap();
      }
    });

    // Custom Reward Modal
    $('#btnAddNewReward')?.addEventListener('click', () => {
      $('#addRewardModal').hidden = false;
      $('#rewardInputTitle').value = '';
      $('#rewardInputCost').value = 50;
      $('#rewardInputTitle')?.focus();
    });
    $('#rewardModalCloseBtn')?.addEventListener('click', () => { $('#addRewardModal').hidden = true; });
    $('#rewardModalCancelBtn')?.addEventListener('click', () => { $('#addRewardModal').hidden = true; });
    $('#rewardModalSaveBtn')?.addEventListener('click', async () => {
      const title = $('#rewardInputTitle')?.value?.trim();
      if (!title) {
        $('#rewardInputTitle')?.focus();
        return;
      }
      const cost = Number($('#rewardInputCost')?.value) || 50;
      const icon = $('#rewardInputIcon')?.value?.trim() || '🎁';
      if (window.widgets?.habits?.saveReward) {
        await window.widgets.habits.saveReward({ title, titleEn: title, cost, icon });
        $('#addRewardModal').hidden = true;
        await renderGamification();
      }
    });

    // Sleep & Mood Lab Quick Day Editor
    $('#labEditDate')?.addEventListener('change', (e) => {
      const dateStr = e.target.value;
      const log = state.logs[dateStr];
      if (log) {
        if (log.sleep?.hours !== undefined) $('#labEditSleepHours').value = log.sleep.hours;
        if (log.sleep?.bedtime) $('#labEditBedtime').value = log.sleep.bedtime;
        if (log.sleep?.wakeTime) $('#labEditWakeTime').value = log.sleep.wakeTime;
        if (log.mood?.rating) $('#labEditMoodRating').value = String(log.mood.rating);
        if (log.stress?.level) $('#labEditStress').value = String(log.stress.level);
        if (log.screenTime?.hours) $('#labEditScreen').value = log.screenTime.hours;
      }
    });

    $('#btnSaveLabDay')?.addEventListener('click', async () => {
      const todayStr = formatLocalDate();
      const dateStr = $('#labEditDate')?.value;
      if (!dateStr) return;
      if (dateStr > todayStr) {
        alert(lang() === 'en' ? 'Cannot log data for future dates' : 'لا يمكن تسجيل بيانات لأيام قادمة');
        return;
      }

      const sleepHours = parseFloat($('#labEditSleepHours')?.value) || 0;
      const bedtime = $('#labEditBedtime')?.value || '';
      const wakeTime = $('#labEditWakeTime')?.value || '';
      const moodRating = parseInt($('#labEditMoodRating')?.value) || 0;
      const stressLevel = parseInt($('#labEditStress')?.value) || 0;
      const screenHours = parseFloat($('#labEditScreen')?.value) || 0;

      if (sleepHours > 0 || bedtime || wakeTime) {
        await window.widgets?.habits?.saveSleep?.({
          dateStr,
          sleepData: { durationHours: sleepHours, bedtime, wakeTime, quality: 3 },
          durationHours: sleepHours,
          hours: sleepHours,
          bedtime,
          wakeTime,
        });
      }
      if (moodRating > 0) {
        await window.widgets?.habits?.saveMood?.({
          dateStr,
          moodData: { rating: moodRating, scale: 5 },
          rating: moodRating,
        });
      }
      if (stressLevel > 0) {
        await window.widgets?.habits?.saveStress?.({ dateStr, level: stressLevel });
      }
      if (screenHours > 0) {
        await window.widgets?.habits?.saveDay?.({ dateStr, screenTime: { hours: screenHours } });
      }

      if (!state.logs[dateStr]) state.logs[dateStr] = {};
      if (sleepHours > 0 || bedtime || wakeTime) {
        state.logs[dateStr].sleep = { durationHours: sleepHours, hours: sleepHours, bedtime, wakeTime, quality: 3 };
      }
      if (moodRating > 0) {
        state.logs[dateStr].mood = { rating: moodRating, scale: 5 };
      }
      if (stressLevel > 0) {
        state.logs[dateStr].stress = { level: stressLevel };
      }
      if (screenHours > 0) {
        state.logs[dateStr].screenTime = { hours: screenHours };
      }

      const saveBtn = $('#btnSaveLabDay');
      if (saveBtn) {
        const origText = saveBtn.textContent;
        saveBtn.textContent = '✓ ' + (lang() === 'en' ? 'Saved' : 'تم الحفظ');
        saveBtn.style.background = '#059669';
        setTimeout(() => {
          saveBtn.textContent = origText;
          saveBtn.style.background = '';
        }, 2000);
      }

      renderSleepMoodLab();
    });

    // Bidirectional Real-Time IPC Synchronization
    window.widgets?.habits?.onChange?.((habits) => {
      if (habits) {
        state.habits = habits;
        renderActiveTab();
      }
    });

    window.widgets?.habits?.onLogChange?.((payload) => {
      if (payload?.date && payload?.day) {
        state.logs[payload.date] = payload.day;
        renderActiveTab();
      }
    });

    // External Trigger (options passed from tile widget)
    window.widgets?.habits?.onDashboardOpts?.((opts) => {
      if (opts?.tab) switchTab(opts.tab);
      if (opts?.habitId) {
        switchTab('manager');
        const h = state.habits.find(x => x.id === opts.habitId);
        if (h) populateHabitForm(h);
      }
      if (opts?.focus === 'reflection') {
        switchTab('grid');
        setTimeout(() => {
          const card = $('#reflectionCard');
          if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            $('#reflectionTextarea')?.focus();
          }
        }, 180);
      }
    });

    window.widgets?.habits?.onGamificationChange?.((g) => {
      if (g) {
        state.gamification = g;
        if (state.activeTab === 'gamification') renderGamification();
      }
    });

    window.widgets?.atlas?.onUpdated?.(() => {
      if (state.activeTab === 'atlas') renderAtlasPane();
    });

    // Live Settings Listener (Reflects changes immediately)
    window.widgets?.habits?.onDashboardOpts?.((opts) => {
      if (opts?.tab) {
        switchTab(opts.tab);
      }
    });

    window.widgets?.settings?.onChange?.((newSettings) => {
      state.allSettings = newSettings || {};
      state.settings = newSettings?.habits || {};
      const curTheme = state.settings?.theme || 'match';
      applyDashboardTheme(curTheme);
      const isGamified = (state.settings?.gamificationEnabled !== false);
      const gamifyTab = $('[data-tab="gamification"]');
      if (gamifyTab) {
        gamifyTab.style.display = isGamified ? 'inline-flex' : 'none';
      }
      if (!isGamified && state.activeTab === 'gamification') {
        switchTab('grid');
      }
      renderActiveTab();
    });

    // Live Theme Select Dropdown Listener
    $('#dashThemeSelect')?.addEventListener('change', async (e) => {
      const newTheme = e.target.value;
      applyDashboardTheme(newTheme);
      if (!state.settings) state.settings = {};
      state.settings.theme = newTheme;
      try {
        if (window.widgets?.settings?.set) {
          await window.widgets.settings.set({ habits: { ...(state.settings || {}), theme: newTheme } });
        }
      } catch (err) {
        console.error('Failed to save dashboard theme:', err);
      }
      renderActiveTab();
    });

    // Hero Class Selection (Habitica Style)
    $$('#heroClassesGrid .hero-class-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const cls = btn.dataset.class;
        if (window.widgets?.habits?.setHeroClass) {
          const res = await window.widgets.habits.setHeroClass(cls);
          if (res) {
            state.gamification = res;
            await renderGamification();
          }
        }
      });
    });

    // Habit Detail Modal Actions (Loop Habit Tracker & OpenHabitTracker Style)
    $('#hdCloseBtn')?.addEventListener('click', () => {
      $('#habitDetailModal').hidden = true;
    });
    $('#hdEditBtn')?.addEventListener('click', () => {
      $('#habitDetailModal').hidden = true;
      switchTab('manager');
      const h = (state.habits || []).find(x => x.id === state.activeDetailHabitId);
      if (h) populateHabitForm(h);
    });
    $('#hdPomoBtn')?.addEventListener('click', () => {
      $('#habitDetailModal').hidden = true;
      window.widgets?.pomodoro?.act?.('start');
    });

    initQuickHabitBar();
    initVisualFormControls();
  }

  /* ==================================================================== *
   * 8. THE LIVING ATLAS (أطلس العوالم الحيّة) RENDERING
   * ==================================================================== */

  async function renderAtlasPane() {
    const isEn = (state.language === 'en');
    let atlasState = null;
    try {
      if (window.widgets?.atlas?.getState) {
        atlasState = await window.widgets.atlas.getState(state.language || 'ar');
      }
    } catch (e) {
      console.warn('[Atlas] Failed to load atlas state:', e);
    }

    if (!atlasState) {
      atlasState = {
        wayfinder: { level: 1, titleAr: 'غارس الخطوة الأولى', titleEn: 'Wayfinder Initiate', havenGold: 0, xpInCurrentLevel: 0, currentLevelRequired: 300, progressPercent: 0, affinities: { VIT: 0, WIS: 0, SER: 0, DIS: 0 } },
        havenFacilities: { cartographyHall: { level: 1 }, personalAlcove: { level: 1 }, hearthBalcony: { level: 1 }, herbarium: { level: 1 } },
        miro: { dialogue: isEn ? 'Welcome to the First Haven... your steps illuminate the Weave.' : 'أهلاً بك في الملاذ الأول... خطواتك الصادقة تضيء النسيج وتطرد العتمة.', svgSprite: '' },
        unlockedClues: [],
        foreshadowing: null,
      };
    }

    const wf = atlasState.wayfinder || {};
    const miro = atlasState.miro || {};

    // 1. Wayfinder Header & Sovereign Name
    const nameEl = $('#atlasWayfinderName');
    if (nameEl) {
      nameEl.textContent = wf.name || (isEn ? 'Wayfinder' : 'مستكشف الدرب');
      nameEl.onclick = () => {
        const modal = $('#atlasInductionModal');
        const input = $('#atlasInductionNameInput');
        if (input) input.value = wf.name && wf.name !== 'مستكشف الدرب' ? wf.name : '';
        if (modal) {
          modal.hidden = false;
          if (input) input.focus();
        }
      };
    }

    // Auto-prompt induction onboarding on first visit if not yet named
    if (wf.isNamed === false && !state._atlasInductionPrompted) {
      state._atlasInductionPrompted = true;
      const modal = $('#atlasInductionModal');
      const input = $('#atlasInductionNameInput');
      if (input) input.value = '';
      if (modal) modal.hidden = false;
    }

    const inductionModal = $('#atlasInductionModal');
    const inductionInput = $('#atlasInductionNameInput');
    const inductionSubmit = $('#atlasInductionSubmitBtn');
    const inductionSkip = $('#atlasInductionSkipBtn');
    const inductionClose = $('#atlasInductionCloseBtn');

    if (inductionSubmit) {
      inductionSubmit.onclick = async () => {
        const chosen = (inductionInput ? inductionInput.value : '').trim();
        if (chosen && window.widgets?.atlas?.setWayfinderName) {
          try {
            await window.widgets.atlas.setWayfinderName(chosen);
            if (inductionModal) inductionModal.hidden = true;
            renderAtlasPane();
          } catch (err) {
            console.error('[Atlas] Failed to save wayfinder name:', err);
          }
        }
      };
    }
    if (inductionInput) {
      inductionInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (inductionSubmit) inductionSubmit.click();
        }
      };
    }
    if (inductionSkip) {
      inductionSkip.onclick = () => {
        if (inductionModal) inductionModal.hidden = true;
      };
    }
    if (inductionClose) {
      inductionClose.onclick = () => {
        if (inductionModal) inductionModal.hidden = true;
      };
    }

    const lvlEl = $('#atlasWayfinderLevel');
    if (lvlEl) lvlEl.textContent = `Level ${wf.level || 1}`;

    const titleEl = $('#atlasWayfinderTitle');
    if (titleEl) titleEl.textContent = isEn ? (wf.titleEn || wf.titleAr) : (wf.titleAr || 'غارس الخطوة الأولى');

    const goldEl = $('#atlasHavenGold');
    if (goldEl) goldEl.textContent = String(wf.havenGold || 0);

    // Living Materials Counters
    const mats = wf.livingMaterials || {};
    const aetherEl = $('#atlasAetherCount'); if (aetherEl) aetherEl.textContent = String(mats.aetherShards || 0);
    const manuEl = $('#atlasManuscriptCount'); if (manuEl) manuEl.textContent = String(mats.manuscriptScraps || 0);
    const seedsEl = $('#atlasSeedsCount'); if (seedsEl) seedsEl.textContent = String(mats.seedsOfLight || 0);

    const xpCurEl = $('#atlasXpCurrent');
    if (xpCurEl) xpCurEl.textContent = String(wf.xpInCurrentLevel || 0);

    const xpReqEl = $('#atlasXpRequired');
    if (xpReqEl) xpReqEl.textContent = String(wf.currentLevelRequired || 300);

    const xpPctEl = $('#atlasXpPct');
    if (xpPctEl) xpPctEl.textContent = `${wf.progressPercent || 0}%`;

    const xpFillEl = $('#atlasXpFill');
    if (xpFillEl) xpFillEl.style.width = `${Math.min(100, Math.max(0, wf.progressPercent || 0))}%`;

    // 2. Affinities
    const aff = wf.affinities || {};
    const vitEl = $('#atlasVitScore'); if (vitEl) vitEl.textContent = String(aff.VIT || 0);
    const wisEl = $('#atlasWisScore'); if (wisEl) wisEl.textContent = String(aff.WIS || 0);
    const serEl = $('#atlasSerScore'); if (serEl) serEl.textContent = String(aff.SER || 0);
    const disEl = $('#atlasDisScore'); if (disEl) disEl.textContent = String(aff.DIS || 0);

    // 3. Miro Avatar & Speech (Brand Artwork + Starlight Sparkle)
    const miroBox = $('#atlasMiroAvatarBox');
    if (miroBox) {
      if (miro && miro.svgSprite) {
        miroBox.innerHTML = miro.svgSprite;
      } else {
        miroBox.innerHTML = `
          <div class="atlas-miro-spirit-img"></div>
          <span class="atlas-miro-starlight-sparkle">✨</span>
        `;
      }
      miroBox.onclick = async () => {
        try {
          if (window.widgets?.atlas?.getMiroDialogue) {
            const nextDiag = await window.widgets.atlas.getMiroDialogue({
              state: 'CELEBRATING',
              context: { lang: state.language || 'ar', wayfinderName: wf.name },
            });
            const sp = $('#atlasMiroSpeech');
            if (sp && nextDiag) sp.textContent = `"${nextDiag}"`;
          }
        } catch (_) { }
      };
    }
    const speechEl = $('#atlasMiroSpeech');
    if (speechEl) {
      speechEl.textContent = `"${miro.dialogue || (isEn ? 'Welcome to the First Haven!' : 'أهلاً بك في الملاذ الأول!')}"`;
    }

    const interactBtn = $('#atlasMiroInteractBtn');
    if (interactBtn) {
      interactBtn.onclick = async () => {
        try {
          if (window.widgets?.atlas?.getMiroDialogue) {
            const nextDiag = await window.widgets.atlas.getMiroDialogue({
              state: 'CURIOUS_REFLECTIVE',
              context: { lang: state.language || 'ar' },
              context: { lang: state.language || 'ar', wayfinderName: wf.name },
            });
            if (speechEl && nextDiag) speechEl.textContent = `"${nextDiag}"`;
          }
        } catch { }
      };
    }

    // 4. Foreshadowing banner
    const bannerEl = $('#atlasForeshadowingBanner');
    const bannerTxtEl = $('#atlasForeshadowingText');
    if (atlasState.foreshadowing && bannerEl && bannerTxtEl) {
      bannerEl.style.display = 'flex';
      bannerTxtEl.textContent = atlasState.foreshadowing.hint;
    } else if (bannerEl) {
      bannerEl.style.display = 'none';
    }

    // 5. Facilities List
    const facilitiesListEl = $('#atlasFacilitiesList');
    if (facilitiesListEl) {
      facilitiesListEl.innerHTML = '';
      const facilitiesMeta = [
        { id: 'cartographyHall', icon: '🗺️', nameAr: 'قاعة الخرائط والأطلس', nameEn: 'Cartography Hall', descAr: 'توسيع كشف الطرق', descEn: 'Expands trail revelation' },
        { id: 'personalAlcove', icon: '📚', nameAr: 'مكتبة الملاذ (خلوة المستكشف)', nameEn: 'Personal Alcove', descAr: 'حفظ المخطوطات والتوثيق', descEn: 'Manuscript archive' },
        { id: 'hearthBalcony', icon: '🔥', nameAr: 'شرفة المشكاة والموقد', nameEn: 'Hearth Balcony', descAr: 'إشعال فوانيس الملاذ لراحة ميرو', descEn: 'Lanterns for Miro' },
        { id: 'herbarium', icon: '🌿', nameAr: 'حديقة السكينة والأعشاب', nameEn: 'The Herbarium', descAr: 'استشفاء وتجديد الطاقة', descEn: 'Rest and vitality' },
      ];

      facilitiesMeta.forEach(f => {
        const facData = (atlasState.havenFacilities && atlasState.havenFacilities[f.id]) || { level: 1 };
        const lvl = facData.level || 1;
        const upgradeCost = lvl * 40;
        const canAfford = (wf.havenGold || 0) >= upgradeCost && lvl < 5;

        const row = document.createElement('div');
        row.className = 'atlas-facility-row';
        row.innerHTML = `
          <div class="facility-main">
            <span class="facility-icon">${f.icon}</span>
            <div>
              <div class="facility-title">${isEn ? f.nameEn : f.nameAr} <span class="facility-level-badge">Lvl ${lvl}</span></div>
              <div style="font-size: 10px; color: var(--text-muted);">${isEn ? f.descEn : f.descAr}</div>
            </div>
          </div>
          <button type="button" class="facility-upgrade-btn" ${canAfford ? '' : 'disabled'}>
            ${lvl >= 5 ? (isEn ? 'Max' : 'مكتمل') : `🪙 ${upgradeCost} ${isEn ? 'Gold' : 'ذهب'}`}
          </button>
        `;

        const btn = row.querySelector('.facility-upgrade-btn');
        if (btn && canAfford) {
          btn.onclick = async () => {
            btn.disabled = true;
            try {
              if (window.widgets?.atlas?.upgradeFacility) {
                const res = await window.widgets.atlas.upgradeFacility(f.id);
                if (res?.ok) renderAtlasPane();
              }
            } catch (err) {
              console.error('[Atlas] Upgrade failed:', err);
            }
          };
        }

        facilitiesListEl.appendChild(row);
      });
    }

    // 6. Mystery Clues Grid
    const cluesGridEl = $('#atlasCluesGrid');
    if (cluesGridEl) {
      cluesGridEl.innerHTML = '';
      const unlockedClues = atlasState.unlockedClues || [];
      const cluesCountEl = $('#atlasCluesCount');
      if (cluesCountEl) cluesCountEl.textContent = `${unlockedClues.length} / 6 ${isEn ? 'Shards' : 'شظايا'}`;

      if (unlockedClues.length === 0) {
        cluesGridEl.innerHTML = `
          <div class="atlas-clue-card locked" style="grid-column: 1 / -1; text-align: center; padding: 18px;">
            <div class="clue-icon">🔒</div>
            <div class="clue-title">${isEn ? 'The First Shard Awaits' : 'الشظية الأولى بانتظار خطوتك الأولى'}</div>
            <div class="clue-text">${isEn ? 'Complete your very first habit to awaken the Weave.' : 'أنجز أول عادة لك لتوقظ النسيج وتكشف سر انحلال العالم.'}</div>
          </div>
        `;
      } else {
        unlockedClues.forEach(clue => {
          const card = document.createElement('div');
          card.className = 'atlas-clue-card';
          card.innerHTML = `
            <div class="clue-head">
              <span class="clue-icon">📜</span>
              <span class="clue-title">${isEn ? clue.titleEn : clue.titleAr}</span>
            </div>
            <div class="clue-text">${isEn ? clue.loreEn : clue.loreAr}</div>
          `;
          cluesGridEl.appendChild(card);
        });
      }
    }

    // 7. Sub-Navigation Tabs Switching
    const subnavBtns = document.querySelectorAll('.atlas-subnav-btn');
    subnavBtns.forEach(btn => {
      btn.onclick = () => {
        const targetView = btn.dataset.atlasView;
        subnavBtns.forEach(b => b.classList.toggle('active', b === btn));
        const subviews = [
          { id: 'atlasSubViewMap', view: 'map' },
          { id: 'atlasSubViewSkills', view: 'skills' },
          { id: 'atlasSubViewWorkshop', view: 'workshop' },
          { id: 'atlasSubViewTrials', view: 'trials' },
          { id: 'atlasSubViewChronicles', view: 'chronicles' },
          { id: 'atlasSubViewBazaar', view: 'bazaar' },
          { id: 'atlasSubViewMiro', view: 'miro' },
        ];
        subviews.forEach(s => {
          const el = $(`#${s.id}`);
          if (el) el.style.display = (s.view === targetView) ? 'block' : 'none';
        });
      };
    });

    // 8. Phase 2: Astrolabe Behavioral Skills Grid
    const skillsGridEl = $('#atlasSkillsGrid');
    if (skillsGridEl && atlasState.astrolabe) {
      skillsGridEl.innerHTML = '';
      const skillsList = atlasState.astrolabe.skills || [];
      const skillsCountEl = $('#atlasSkillsCount');
      if (skillsCountEl) {
        skillsCountEl.textContent = `${atlasState.astrolabe.unlockedCount || 0} / ${atlasState.astrolabe.totalCount || 5} ${isEn ? 'Skills Active' : 'مهارات مفعلة'}`;
      }

      skillsList.forEach(skill => {
        const card = document.createElement('div');
        card.className = `atlas-skill-card ${skill.isUnlocked ? 'unlocked' : 'locked'}`;
        const req = skill.requirement || {};
        const rewardText = skill.materialReward
          ? Object.entries(skill.materialReward).map(([k, v]) => `+${v} ${k}`).join(', ')
          : '';

        card.innerHTML = `
          <div class="skill-header">
            <div class="skill-badge-group">
              <span class="skill-icon">${skill.icon}</span>
              <span class="skill-title">${isEn ? skill.titleEn : skill.titleAr}</span>
            </div>
            <span class="skill-status-tag ${skill.isUnlocked ? 'unlocked' : 'in-progress'}">
              ${skill.isUnlocked ? (isEn ? 'Unlocked' : 'مفعلة') : (isEn ? 'In Progress' : 'قيد الإنجاز')}
            </span>
          </div>
          <div class="skill-desc">${isEn ? skill.descriptionEn : skill.descriptionAr}</div>
          <div style="font-size: 11px; color: var(--text-muted); font-weight: 600;">
            ${isEn ? (req.labelEn || '') : (req.labelAr || '')}
          </div>
          <div class="skill-effect">
            ⚡ ${isEn ? skill.mechanicalEffectEn : skill.mechanicalEffectAr}
          </div>
        `;
        skillsGridEl.appendChild(card);
      });
    }

    // 9. Phase 2: Haven Restoration Workshop Projects
    const workshopGridEl = $('#atlasWorkshopGrid');
    if (workshopGridEl && atlasState.craftingProjects) {
      workshopGridEl.innerHTML = '';
      const projects = atlasState.craftingProjects || [];
      const completedCount = (atlasState.completedProjects || []).length;
      const projectsCountEl = $('#atlasProjectsCount');
      if (projectsCountEl) {
        projectsCountEl.textContent = `${completedCount} / ${projects.length} ${isEn ? 'Restored' : 'مشاريع مكتملة'}`;
      }

      projects.forEach(project => {
        const card = document.createElement('div');
        card.className = `atlas-workshop-card ${project.isCompleted ? 'completed' : ''}`;
        const cost = project.cost || {};

        card.innerHTML = `
          <div class="workshop-head">
            <div class="workshop-title-wrap">
              <span class="workshop-icon">${project.icon}</span>
              <span class="workshop-title">${isEn ? project.titleEn : project.titleAr}</span>
            </div>
            ${project.isCompleted ? `<span style="font-size: 11px; font-weight: 700; color: #15803d;">✅ ${isEn ? 'Restored' : 'تم الترميم'}</span>` : ''}
          </div>
          <div class="workshop-desc" style="font-size: 11.5px; color: var(--text-muted); line-height: 1.4;">
            ${isEn ? project.descriptionEn : project.descriptionAr}
          </div>
          <div class="workshop-cost-row">
            ${cost.aetherShards > 0 ? `<span class="workshop-cost-tag">💎 ${cost.aetherShards} ${isEn ? 'Aether' : 'أثير'}</span>` : ''}
            ${cost.manuscriptScraps > 0 ? `<span class="workshop-cost-tag">📜 ${cost.manuscriptScraps} ${isEn ? 'Scraps' : 'مخطوط'}</span>` : ''}
            ${cost.seedsOfLight > 0 ? `<span class="workshop-cost-tag">🌱 ${cost.seedsOfLight} ${isEn ? 'Seeds' : 'بذور'}</span>` : ''}
          </div>
          <div class="workshop-benefit">
            ✨ ${isEn ? project.benefitEn : project.benefitAr}
          </div>
          ${!project.isCompleted ? `
            <button type="button" class="workshop-craft-btn" ${project.canAfford ? '' : 'disabled'}>
              ${project.canAfford ? (isEn ? 'Craft & Restore' : 'رمّم الآن') : (isEn ? 'Materials Needed' : 'المواد غير كافية')}
            </button>
          ` : ''}
        `;

        const craftBtn = card.querySelector('.workshop-craft-btn');
        if (craftBtn && project.canAfford) {
          craftBtn.onclick = async () => {
            craftBtn.disabled = true;
            try {
              if (window.widgets?.atlas?.craftProject) {
                const res = await window.widgets.atlas.craftProject(project.id);
                if (res?.ok) renderAtlasPane();
              }
            } catch (err) {
              console.error('[Atlas] Crafting failed:', err);
            }
          };
        }

        workshopGridEl.appendChild(card);
      });
    }

    // 10. Phase 2: Miro Alcove Multi-Modal Consultations
    const miroModeBtns = document.querySelectorAll('.miro-mode-btn');
    const miroBoxTitle = $('#atlasMiroConsultationTitle');
    const miroBoxContent = $('#atlasMiroConsultationContent');

    miroModeBtns.forEach(btn => {
      btn.onclick = async () => {
        const modeKey = btn.dataset.mode;
        btn.style.transform = 'scale(0.96)';
        setTimeout(() => { btn.style.transform = ''; }, 150);

        try {
          if (window.widgets?.atlas?.consultMiro) {
            const consultation = await window.widgets.atlas.consultMiro({
              modeKey,
              lang: state.language || 'ar',
            });
            if (consultation) {
              if (miroBoxTitle) miroBoxTitle.textContent = isEn ? consultation.titleEn : consultation.titleAr;
              if (miroBoxContent) miroBoxContent.textContent = `"${consultation.dialogue}"`;
              if (speechEl) speechEl.textContent = `"${consultation.dialogue}"`;
            }
          }
        } catch (err) {
          console.error('[Atlas] Miro consultation failed:', err);
        }
      };
    });

    // 11. Phase 3: Major Trials (Boss Replacement)
    const trialsGridEl = $('#atlasTrialsGrid');
    if (trialsGridEl && Array.isArray(atlasState.trials)) {
      trialsGridEl.innerHTML = '';
      atlasState.trials.forEach(trial => {
        const card = document.createElement('div');
        card.className = `atlas-trial-card ${trial.isCompleted ? 'completed' : ''}`;
        const rew = trial.rewards || {};
        card.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 22px;">${trial.icon}</span>
              <div>
                <div style="font-size: 13px; font-weight: 700; color: var(--text-main);">${isEn ? trial.titleEn : trial.titleAr}</div>
                <div style="font-size: 10px; color: var(--text-muted);">${isEn ? trial.monumentNameEn : trial.monumentNameAr}</div>
              </div>
            </div>
            ${trial.isCompleted ? `<span style="font-size: 11px; font-weight: 700; color: #15803d;">✅ ${isEn ? 'Conquered' : 'مكتملة'}</span>` : ''}
          </div>
          <div style="font-size: 11px; color: var(--text-muted); line-height: 1.4;">${isEn ? trial.descriptionEn : trial.descriptionAr}</div>
          <div class="trial-progress-bar">
            <div class="trial-progress-fill" style="width: ${trial.progressPercent || 0}%"></div>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 600;">
            <span>${trial.currentSteps} / ${trial.requiredSteps} ${isEn ? 'Steps' : 'خطوات صادقة'}</span>
            <span style="color: #0284c7;">${trial.progressPercent}%</span>
          </div>
          <div style="display: flex; align-items: gap: 6px; flex-wrap: wrap;">
            ${rew.havenGold ? `<span class="workshop-cost-tag">🪙 +${rew.havenGold}</span>` : ''}
            ${rew.aetherShards ? `<span class="workshop-cost-tag">💎 +${rew.aetherShards}</span>` : ''}
            ${rew.manuscriptScraps ? `<span class="workshop-cost-tag">📜 +${rew.manuscriptScraps}</span>` : ''}
            ${rew.seedsOfLight ? `<span class="workshop-cost-tag">🌱 +${rew.seedsOfLight}</span>` : ''}
          </div>
        `;
        trialsGridEl.appendChild(card);
      });
    }

    // 12. Phase 3: Living Obstacles & 3-Tier Progression
    const obstaclesGridEl = $('#atlasObstaclesGrid');
    if (obstaclesGridEl && Array.isArray(atlasState.obstacles)) {
      obstaclesGridEl.innerHTML = '';
      atlasState.obstacles.forEach(obs => {
        const card = document.createElement('div');
        card.className = `atlas-obstacle-card ${obs.isDormantRelic ? 'relic' : ''}`;
        const tier = obs.currentTier || 0;
        const tierName = obs.isDormantRelic
          ? (isEn ? 'Tier 3: Dormant Relic' : 'المستوى 3: أثر تاريخي خامل')
          : (tier === 0 ? (isEn ? 'Active Friction' : 'احتكاك نشط') : (isEn ? `Tier ${tier} Victory` : `انتصار المستوى ${tier}`));

        const strategiesOptions = (obs.availableStrategies || []).map(s => `
          <option value="${s.id}">${isEn ? s.nameEn : s.nameAr}</option>
        `).join('');

        card.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="font-size: 13px; font-weight: 700; color: var(--text-main);">${isEn ? obs.nameEn : obs.nameAr}</div>
            <span class="obstacle-tier-badge tier-${tier}">${tierName}</span>
          </div>
          <div style="font-size: 11px; color: var(--text-muted); line-height: 1.4;">${isEn ? obs.descriptionEn : obs.descriptionAr}</div>
          ${!obs.isDormantRelic ? `
            <div style="display: flex; gap: 8px; margin-top: 6px; flex-wrap: wrap;">
              <select class="obstacle-strategy-select" style="flex: 1;">
                ${strategiesOptions}
              </select>
              <button type="button" class="obstacle-advance-btn">${isEn ? 'Apply Strategy' : 'تطبيق الاستراتيجية'}</button>
            </div>
          ` : `
            <div style="font-size: 11px; color: #0284c7; background: rgba(2, 132, 199, 0.06); padding: 4px 8px; border-radius: 6px;">
              🏛️ ${isEn ? 'Preserved peacefully in the Haven Relics Archive.' : 'محفوظ بأمان كأثر تاريخي خامل في أرشيف الملاذ.'}
            </div>
          `}
        `;

        const advBtn = card.querySelector('.obstacle-advance-btn');
        const sel = card.querySelector('.obstacle-strategy-select');
        if (advBtn && sel) {
          advBtn.onclick = async () => {
            advBtn.disabled = true;
            try {
              if (window.widgets?.atlas?.advanceObstacle) {
                const res = await window.widgets.atlas.advanceObstacle({
                  obstacleKey: obs.id,
                  strategyKey: sel.value,
                });
                if (res?.ok) renderAtlasPane();
              }
            } catch (err) {
              console.error('[Atlas] Advance obstacle failed:', err);
            }
          };
        }

        obstaclesGridEl.appendChild(card);
      });
    }

    // 13. Phase 3: Chronicles Journal
    const chroniclesListEl = $('#atlasChroniclesList');
    if (chroniclesListEl && Array.isArray(atlasState.chronicles)) {
      chroniclesListEl.innerHTML = '';
      if (atlasState.chronicles.length === 0) {
        chroniclesListEl.innerHTML = `
          <div style="text-align: center; color: var(--text-muted); font-size: 12px; padding: 20px;">
            ${isEn ? 'The chronicle pages await your first steps in the First Haven.' : 'صفحات السجل بانتظار خطواتك الأولى لتسطير فصول الأطلس.'}
          </div>
        `;
      } else {
        atlasState.chronicles.slice(0, 30).forEach(entry => {
          const item = document.createElement('div');
          item.className = 'atlas-chronicle-item';
          const timeStr = entry.timestamp ? new Date(entry.timestamp).toLocaleDateString(state.language === 'en' ? 'en-US' : 'ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
          item.innerHTML = `
            <div class="chronicle-item-head">
              <span class="chronicle-item-title"><span>${entry.icon || '📜'}</span> <span>${entry.title || ''}</span></span>
              <span class="chronicle-item-time">${timeStr}</span>
            </div>
            <div class="chronicle-item-text">${entry.text || ''}</div>
          `;
          chroniclesListEl.appendChild(item);
        });
      }
    }

    // 14. Phase 3: Rewards Bazaar
    const bazaarGridEl = $('#atlasBazaarGrid');
    if (bazaarGridEl && Array.isArray(atlasState.rewards)) {
      bazaarGridEl.innerHTML = '';
      atlasState.rewards.forEach(r => {
        const card = document.createElement('div');
        card.className = 'atlas-bazaar-card';
        card.innerHTML = `
          <div class="bazaar-card-head">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 20px;">${r.icon || '🎁'}</span>
              <span style="font-size: 13px; font-weight: 700; color: var(--text-main);">${isEn ? (r.titleEn || r.titleAr) : (r.titleAr || r.titleEn)}</span>
            </div>
            <span style="font-size: 11.5px; font-weight: 700; color: #b45309;">🪙 ${r.cost}</span>
          </div>
          <div style="font-size: 11px; color: var(--text-muted); line-height: 1.4;">${isEn ? (r.descriptionEn || r.descriptionAr) : (r.descriptionAr || r.descriptionEn)}</div>
          <button type="button" class="bazaar-redeem-btn" ${r.canAfford ? '' : 'disabled'}>
            ${r.canAfford ? (isEn ? 'Redeem Treat' : 'استرداد المكافأة') : (isEn ? 'Need More Gold' : 'ذهب غير كافٍ')}
          </button>
        `;

        const redeemBtn = card.querySelector('.bazaar-redeem-btn');
        if (redeemBtn && r.canAfford) {
          redeemBtn.onclick = async () => {
            redeemBtn.disabled = true;
            try {
              if (window.widgets?.atlas?.redeemReward) {
                const res = await window.widgets.atlas.redeemReward(r.id);
                if (res?.ok) renderAtlasPane();
              }
            } catch (err) {
              console.error('[Atlas] Redeem failed:', err);
            }
          };
        }

        bazaarGridEl.appendChild(card);
      });
    }

    const openRewardBtn = $('#atlasOpenRewardModalBtn');
    if (openRewardBtn) {
      openRewardBtn.onclick = () => {
        const modal = $('#addRewardModal');
        if (modal) modal.hidden = false;
      };
    }

    // 15. Phase 3: Miro Memory & Privacy Sovereignty
    const miroMem = atlasState.miroMemory || {};
    const dims = miroMem.dimensions || {};
    const kEl = $('#miroDimKnowledge'); if (kEl) kEl.textContent = `${isEn ? 'Level' : 'المستوى'} ${dims.knowledge || 1}`;
    const rEl = $('#miroDimRelationship'); if (rEl) rEl.textContent = `${isEn ? 'Level' : 'المستوى'} ${dims.relationship || 1}`;
    const eEl = $('#miroDimExpression'); if (eEl) eEl.textContent = `${isEn ? 'Level' : 'المستوى'} ${dims.expression || 1}`;

    const notesListEl = $('#atlasMiroNotesList');
    if (notesListEl) {
      notesListEl.innerHTML = '';
      const notes = miroMem.notes || [];
      if (notes.length === 0) {
        notesListEl.innerHTML = `
          <div style="font-size: 11px; color: var(--text-muted); padding: 8px;">
            ${isEn ? 'No personal context notes saved. Miro observes only what you explicitly provide.' : 'لا توجد ملاحظات شخصية محفوظة. لا يسجل ميرو إلا ما تدونه بنفسك.'}
          </div>
        `;
      } else {
        notes.forEach(note => {
          const row = document.createElement('div');
          row.className = 'miro-note-item';
          row.innerHTML = `
            <span>"${note.text}"</span>
            <button type="button" class="icon-btn" title="${isEn ? 'Delete Note' : 'حذف الملاحظة'}" style="font-size: 11px; color: #ef4444;">✕</button>
          `;
          const delBtn = row.querySelector('.icon-btn');
          if (delBtn) {
            delBtn.onclick = async () => {
              try {
                if (window.widgets?.atlas?.deleteMiroNote) {
                  await window.widgets.atlas.deleteMiroNote(note.id);
                  renderAtlasPane();
                }
              } catch (err) {
                console.error('[Atlas] Delete note failed:', err);
              }
            };
          }
          notesListEl.appendChild(row);
        });
      }
    }

    const addNoteBtn = $('#atlasMiroAddNoteBtn');
    const noteInput = $('#atlasMiroNoteInput');
    if (addNoteBtn && noteInput) {
      addNoteBtn.onclick = async () => {
        const text = (noteInput.value || '').trim();
        if (!text) return;
        noteInput.value = '';
        try {
          if (window.widgets?.atlas?.addMiroNote) {
            await window.widgets.atlas.addMiroNote({ text });
            renderAtlasPane();
          }
        } catch (err) {
          console.error('[Atlas] Add note failed:', err);
        }
      };
    }

    const resetMemBtn = $('#atlasMiroResetMemoryBtn');
    if (resetMemBtn) {
      resetMemBtn.onclick = async () => {
        const confirmed = confirm(isEn ? 'Reset Miro memory? Your habit records will remain untouched.' : 'هل تريد مسح ذاكرة ميرو والملاحظات؟ ستبقى سجلات عاداتك وإنجازاتك سالمة بالكامل.');
        if (confirmed) {
          try {
            if (window.widgets?.atlas?.resetMiroMemory) {
              await window.widgets.atlas.resetMiroMemory();
              renderAtlasPane();
            }
          } catch (err) {
            console.error('[Atlas] Reset memory failed:', err);
          }
        }
      };
    }
  }

  /* ---------- Boot via Mirqat UI Framework ---------- */
  boot(async (currentSettings) => {
    state.allSettings = currentSettings || {};
    state.settings = currentSettings?.habits || {};
    const curTheme = state.settings?.theme || 'match';
    applyDashboardTheme(curTheme);
    wireEvents();
    await loadState();

    window.widgets?.habits?.onDashboardOpts?.((opts) => {
      if (opts?.tab) {
        switchTab(opts.tab);
      }
    });

    window.widgets?.settings?.onChange?.((newSettings) => {
      state.allSettings = newSettings || {};
      state.settings = newSettings?.habits || {};
      const nextTheme = state.settings?.theme || 'match';
      applyDashboardTheme(nextTheme);
      renderActiveTab();
    });

    if (typeof requestAnimationFrame !== 'undefined') requestAnimationFrame(updateDashTabIndicator);
    window.addEventListener('resize', updateDashTabIndicator);
  });
})();
