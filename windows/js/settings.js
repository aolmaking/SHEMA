'use strict';
/* Settings window. Every control writes through immediately, so the widgets
   update while the user is still dragging a slider. */

const { $, el, icon, boot, closeWindow, applySettings, debounce, t, strings, lang, digits } = window.UI;

strings({
  ar: {
    's.title': 'الإعدادات',
    's.sub': 'المظهر، الودجت، المهام، الساعة، المؤقت، ومصدر الآية',
    's.catAppearance': 'المظهر والتخصيص',
    's.catWidgets': 'أدوات الودجات',
    's.catSetup': 'الحسابات والربط',
    's.appearance': 'المظهر',
    's.langAuto': 'تلقائي (حسب لغة النظام)',
    's.tabAppearance': 'المظهر العام',
    's.tabWidgets': 'الودجات والخط',
    's.tabFolder': 'المجلدات والصناديق',
    's.folderSettingsTitle': '📁 إعدادات مجلدات وصناديق الودجات',
    's.folderSettingsSub': 'تخصيص شكل، انحناء الحواف (Border Radius)، ومستوى شفافية الزجاج المصنفر للصناديق المدمجة على سطح المكتب.',
    's.snapToDesktopGrid': 'اتباع تقسيمة شاشة الجهاز (Snap to Desktop Grid)',
    's.snapToDesktopGridSub': 'عند التشغيل، تلتزم الأيقونات والصناديق بتقسيمة شبكة سطح مكتب الجهاز لتتناسق مع أيقونات النظام. وعند الإيقاف، تصبح الأيقونات حرة تماماً لتضعها في أي مكان في الشاشة.',
    's.preventOpenWidgetsOverlap': 'منع تداخل الودجات المفتوحة فوق بعضها',
    's.preventOpenWidgetsOverlapHint': 'الوضع الافتراضي يسمح للودجات المفتوحة بالاستقرار فوق بعضها بحرية على سطح المكتب. عند تفعيل هذا الخيار، سيتم منع التداخل وإزاحة الودجات تلقائياً عند اقترابها.',
    's.wFolder': '📁 مجلد وصندوق الودجات (Folder)',
    's.tabTodo': 'المهام والكلاسرووم',
    's.tabTime': 'الوقت والتركيز',
    's.tabInspiration': 'الآية والحديث',
    's.tabMedia': 'البريد والصور',
    's.tabSetup': 'الإعداد والربط',
    's.btnSettingUp': 'Setting Up (الإعداد والربط)',
    's.backToSettings': 'العودة إلى الإعدادات العامة',
    's.setupWorkspaceTitle': 'الإعداد الأولي والربط (Setting Up)',
    's.setupWorkspaceDesc': 'بيانات الحسابات والاتصال والربط السحابي التي تُجرى لمرة واحدة غالباً عند بدء التثبيت.',
    's.perWidgetStyleTitle': 'تخصيص الشكل والخط لكل ودجت منفصلة',
    's.perWidgetStyleBadge': 'مخصص',
    's.perWidgetStyleHint': 'يمكنك هنا تخصيص نوع الخط وسُمكه ومستوى الشفافية لكل ودجت بشكل منفصل، أو تركه يتبع المظهر العام الافتراضي.',
    's.appearanceScopeTitle': 'تخصيص المظهر والثيم لكل ودجت',
    's.appearanceScopeDesc': 'يمكنك تخصيص ثيم وألوان وخطوط وزجاج كل ودجت أو نافذة الإعدادات بشكل مستقل تماماً، أو تطبيق الإعدادات العامة.',
    's.ecoTitle': '🔋 توفير الطاقة والبطارية للابتوب',
    's.ecoDesc': 'تحسين استهلاك المعالج، تجميد الودجات المصغرة، وإلغاء الشيدرز والبلور الثقيل تلقائياً عند العمل على البطارية لإطالة عمر اللابتوب.',
    's.ecoMode': 'وضع توفير الطاقة:',
    's.ecoModeAuto': 'تلقائي (عند العمل على البطارية)',
    's.ecoModeAlways': 'مفعّل دائماً (أقصى توفير للطاقة)',
    's.ecoModeOff': 'معطّل (أقصى مؤثرات بصرية دائماً)',
    's.ecoSleepMini': 'تجميد الودجات المصغرة بالكامل (صفر استهلاك أثناء التصغير)',
    's.ecoPauseOnLock': 'تجميد الودجات والعمليات الخلفية عند قفل شاشة اللابتوب',
    's.ecoLightShaders': 'إلغاء فلاتر التمويه العالي (Blur) وضوضاء SVG لتخفيف كرت الشاشة GPU',
    's.ecoBadgeBattery': '🔋 على البطارية (توفير الطاقة نشط)',
    's.ecoBadgeAc': '🔌 متصل بالشاحن AC (أقصى أداء)',
    's.ecoBadgeAlways': '⚡ وضع التوفير مفروض يدوياً دائماً',
    's.ecoScopeTitle': 'تخصيص توفير الطاقة لكل ودجت',
    's.ecoScopeDesc': 'يمكنك تحديد سلوك توفير الطاقة والتجميد وتخفيف الشيدرز لكل ودجت بشكل منفصل ومستقل، أو تطبيق الإعداد العام.',
    's.ecoInheritGlobal': '🔗 يتبع الإعداد الافتراضي العام',
    's.ecoScopeGlobalHint': 'يتم الآن تعديل وضع توفير الطاقة الافتراضي للتطبيق ككل. أي ودجت تتبع هذا الإعداد تلقائياً.',
    's.ecoScopeWidgetHint': 'يتم الآن ضبط إعدادات توفير الطاقة الخاصة بهذه الودجة بشكل مستقل.',
    's.ecoScopeFollowsHint': 'هذه الودجة تتبع حالياً الإعداد الافتراضي العام. عند تعديل أي خيار ستتحول إلى تخصيص مستقل.',
    's.ecoMatrixTitle': 'جدول حالة توفير الطاقة لجميع الودجات:',
    's.ecoMatrixHint': 'اضغط على أي ودجة لضبطها فوراً',
    's.ecoCustomBadge': '⚡ مخصص',
    's.ecoInheritBadge': '🔗 عام',
    's.chooseTarget': 'العنصر المراد تخصيصه:',
    's.scopeGlobal': '🌐 التطبيق ككل (الافتراضي لكافة الودجات)',
    's.scopeSettings': '⚙️ نافذة الإعدادات (Settings Window)',
    's.groupWidgets': 'الودجات على سطح المكتب (Widgets)',
    's.scopeStatusGlobal': '🌐 الافتراضي العام',
    's.scopeStatusCustom': '✨ مخصص لهذا العنصر',
    's.scopeStatusInherit': '🔗 يتبع المظهر العام',
    's.resetToGlobal': 'استعادة الافتراضي ↺',
    's.scopeHintGlobal': 'يتم الآن تعديل المظهر الافتراضي للتطبيق ككل. أي ودجت لا يملك تخصيصاً مستقلاً سيتبع هذه الإعدادات تلقائياً.',
    's.scopeHintCustom': 'يتم الآن تعديل مظهر {name} بشكل مستقل تماماً. يمكنك تغيير الثيم والألوان والخطوط دون التأثير على باقي الودجات.',
    's.scopeHintInherit': 'هذا العنصر يتبع حالياً المظهر العام. بمجرد اختيار ثيم أو لون أو خط هنا سيتم تخصيصه منفرداً تلقائياً.',
    's.glassThisWidget': 'تعتيم وزجاج هذا العنصر',
    's.wTafsir': '📜 نافذة التفسير والتدبر (Tafsir)',
    's.wHadith': '📚 نافذة الحديث الشريف (Hadith)',
    's.wEvent': '📌 تفاصيل الأحداث (Event)',
    's.wTask': '📋 نافذة تفاصيل المهمة (Task Details)',
    's.wEmailView': '📬 نافذة قراءة البريد (Email Reader)',
    's.wHabitsDashboard': '📊 لوحة تحكم العادات (Habits Dashboard)',
    's.chooseWidget': 'اختر الودجت للتخصيص:',
    's.inheritGlobal': 'الافتراضي العام (Inherit)',
    's.wClock': '⏰ الساعة (Clock)',
    's.wPomodoro': '⏱️ مؤقت التركيز (Pomodoro)',
    's.wCalendar': '📅 التقويم (Calendar)',
    's.wHabits': '🔥 العادات والعافية (Habits)',
    's.wQuran': '📖 الآية والحديث (Quran / Inspiration)',
    's.wTodo': '📋 قائمة المهام (To-Do List)',
    's.wNotes': '📝 الملاحظات (Notes)',
    's.wEmail': '📬 البريد الإلكتروني (Email)',
    's.wPhoto': '🖼️ الصورة (Photo)',
    's.w700': 'عريض جدًا (700)',
    's.weight200': '٢٠٠ (خفيف)',
    's.weight300': '٣٠٠ (رفيع)',
    's.weight400': '٤٠٠ (عادي)',
    's.weight500': '٥٠٠ (متوسط)',
    's.weight600': '٦٠٠ (سميك)',
    's.weight700': '٧٠٠ (عريض)',
    's.glass0': '٠٪ (زجاج شفاف خالص)',
    's.glass15': '١٥٪ (شفاف خفيف)',
    's.glass35': '٣٥٪ (نصف شفاف)',
    's.glass60': '٦٠٪ (شبه معتم)',
    's.glass85': '٨٥٪ (معتم)',
    's.glass100': '١٠٠٪ (معتم بالكامل Solid)',
    's.crEnrolledHead': 'المواد المسجلة في حسابك (اضغط للإخفاء أو الإظهار):',
    's.crUncheckShow': 'إلغاء الإخفاء وإظهار المادة',
    's.crCheckingCourses': 'جارٍ الفحص… ⏳',
    's.crCourseShowBtn': '✓ إظهار',
    's.crCourseHideBtn': '🚫 إخفاء',
    's.crCoursesFetchErr': 'تعذر جلب المواد تلقائياً (الحساب غير متصل أو منتهي الصلاحية). يمكنك كتابة اسم المادة في المربع أعلاه والضغط على "إخفاء" وسيتم استبعادها فوراً!',
    's.setupGuideTitle': 'دليل خطوات الإعداد',
    's.setupGuideSub': 'خطوات واضحة وسريعة لتجهيز الاتصال',
    's.setupGuideGotIt': 'فهمت ذلك، إغلاق',
    's.waGuideTitle': 'شرح خطوات الإعداد بالتفصيل',
    's.crGuideTitle': 'شرح خطوات الإعداد بالتفصيل',
    's.emailGuideTitle': 'شرح خطوات الإعداد بالتفصيل',
    's.waStatusOpenWa': 'خادم OpenWA المحلي',
    's.waStatusCallMeBotReady': 'CallMeBot جاهز',
    's.waStatusCallMeBotKey': 'CallMeBot بحاجة لرمز API',
    's.error': 'خطأ',
    's.failedConnect': 'فشل الاتصال',
    's.connError': 'خطأ في الاتصال',
    's.wStyleTheme': 'ثيم مظهر هذا الودجت',
    's.wStyleAccent': 'لون الودجت المخصص (Accent Color)',
    's.wStyleRadius': 'انحناء زوايا الودجت',
    's.wStyleFontScale': 'مقياس حجم الخط لهذا الودجت',
    's.wStyleCardSurface': 'خلفية البطاقات الداخلية للودجت',
    's.wStyleBorderGlow': 'إطار ووهج الحواف البلورية',
    's.wStyleRadiusSharp': 'حواف حادة أنيقة (10px)',
    's.wStyleRadiusSmooth': 'انحناء ناعم (16px)',
    's.wStyleRadiusBalanced': 'متوازن قياسي (22px)',
    's.wStyleRadiusSoft': 'دائري هادئ جداً (30px)',
    's.wStyleRadiusPill': 'دائري كبسولة كاملة (Pill)',
    's.wStyleScale85': '85% (مدمج جداً)',
    's.wStyleScale92': '92% (صغير)',
    's.wStyleScale100': '100% (القياسي)',
    's.wStyleScale112': '112% (متوسط مريح)',
    's.wStyleScale125': '125% (كبير)',
    's.wStyleSurfaceGlass': 'زجاج شفاف عالي النقاء (Ultra Glass)',
    's.wStyleSurfaceSolid': 'مصمت عالي التباين (Solid Contrast)',
    's.wStyleSurfaceDeep': 'تظليل داكن عميق (Deep Ambient)',
    's.wStyleGlowNone': 'بدون وهج حواف (None)',
    's.wStyleGlowSubtle': 'وهج هادئ (Subtle Ambient)',
    's.wStyleGlowCrystal': 'إطار بلوري عاكس (Crystal Edge)',
    's.wStyleGlass': 'تعتيم الزجاج لهذا الودجت',
    's.wStyleReset': 'استعادة الافتراضي لهذا الودجت',
    's.wStyleResetDone': 'تمت استعادة الافتراضي',
    's.perWidgetPromoTitle': 'تخصيص المظهر لكل ودجت منفصلة',
    's.perWidgetPromoDesc': 'يمكنك منح كل ودجت ثيماً ولوناً وخطاً وحوافاً وزجاجاً خاصاً به ومستقلاً تماماً',
    's.btnOpenPerWidget': 'تخصيص الودجات ❯',
    's.wStyleDensity': 'معدل التباعد والمسافات الداخلية (Density)',
    's.wStyleEdge': 'إبراز وتوهج الحواف (Edge Highlight)',
    's.wStyleBorderWidth': 'سُمك الإطار (Border Width)',
    's.wStyleMotion': 'سرعة الحركة والأنيميشن (Motion)',
    's.wStyleContrast': 'مستوى التباين (Contrast)',
    's.wStyleGrain': 'حبيبات الزجاج الفاخرة (Grain Effect)',
    's.wStyleTint': 'تظليل الزجاج الملون (Glass Tint)',
    's.wStyleTintStrength': 'كثافة التظليل الملون (Tint Strength)',
    's.wStyleEdge0': 'بدون إبراز (0%)',
    's.wStyleEdge50': 'خفيف ناعم (50%)',
    's.wStyleEdge100': 'قياسي متوازن (100%)',
    's.wStyleEdge150': 'ساطع وواضح (150%)',
    's.wStyleGrainOn': 'مُفعّل (Grain On)',
    's.wStyleGrainOff': 'مُعطّل (Pure Glass)',
    's.wStyleTintDark': 'داكن ليلي (Black Tint)',
    's.wStyleTintBlue': 'أزرق سماوي (Oceanic Blue)',
    's.wStyleTintEmerald': 'زمردي نقي (Emerald)',
    's.wStyleTintViolet': 'بنفسجي ملكي (Violet)',
    's.wStyleTintAmber': 'كهرماني دافئ (Warm Amber)',
    's.wStyleTintStr15': 'خفيف جداً (15%)',
    's.wStyleTintStr25': 'قياسي متوازن (25%)',
    's.wStyleTintStr45': 'متوسط قوي (45%)',
    's.wStyleTintStr70': 'تظليل داكن عميق (70%)',
    's.crSetupTitle': 'إعداد Google Classroom',
    's.waSetupTitle': 'إعداد WhatsApp وخادم OpenWA',
    's.emailSetupTitle': 'إعداد اتصال البريد الإلكتروني (IMAP)',
    's.browserSetupTitle': 'متصفح فتح الروابط والحساب المعتمد',
    's.browserSetupDesc': 'حدد حساب Google Chrome الذي تود فتح الروابط الخارجية ورسائل البريد به دائماً بدلاً من الفتح العشوائي في أي حساب نشط حالياً.',
    's.browserMode': 'طريقة فتح الروابط',
    's.browserModeChrome': 'Google Chrome (مع حساب محدد)',
    's.browserModeSystem': 'متصفح النظام الافتراضي (System Default)',
    's.browserChromeProfile': 'حساب Google Chrome المعتمد',
    's.browserCustomEmail': 'البريد الإلكتروني للحساب',
    's.browserTestBtn': 'تجربة فتح رابط بهذا الحساب',
    's.browserTestSuccess': 'تم إرسال أمر الفتح بنجاح إلى كروم بالحساب المحدد!',
    's.browserCustomOption': '⚙️ إدخال حساب آخر يدوياً...',
    's.browserDetecting': 'جاري الكشف عن حسابات كروم...',
    's.emailBrowserHint': 'يتم فتح روابط البريد الإلكتروني بحساب كروم المعتمد في',
    's.emailGoToBrowserSetup': 'Setting Up ←',
    's.statusConnected': 'متصل بنجاح',
    's.statusDisconnected': 'غير متصل',
    's.statusDisabled': 'مُعطّل في الإعدادات',
    's.statusDisconnectedPrompt': 'غير متصل (اضغط Setting Up للربط)',
    's.language': 'اللغة',
    's.languageHint': 'تتحول الواجهة كلها للغة المختارة، أما نص القرآن والتفسير فيبقيان بالعربية كما هما.',
    's.theme': 'النمط',
    's.accent': 'لون التمييز',
    's.customColor': 'لون مخصص',
    's.glassWidgets': 'تعتيم الودجت',
    's.glassWindows': 'تعتيم النوافذ الكاملة',
    's.glassHint': '٠٪ زجاج شفاف تمامًا، ١٠٠٪ معتم بالكامل. «النوافذ الكاملة» هي نافذة التفسير والإعدادات وتفاصيل المهمة.',
    's.radius': 'استدارة الحواف',
    's.numerals': 'الأرقام',
    's.fonts': 'حجم الخط',
    's.fontsHint': 'لكل ودجت ونافذة حجم خط مستقل. ويمكن أيضًا تكبيره وتصغيره من الزر الأيمن على الودجت.',
    's.f.tafsir': 'نافذة التفسير',
    's.f.task': 'نافذة تفاصيل المهمة',
    's.f.settings': 'نافذة الإعدادات',
    's.widgets': 'الودجت',
    'w.habits': 'متتبع العادات',
    's.size': 'الحجم',
    's.size.icon': 'أيقونة',
    's.size.s': 'صغير',
    's.size.m': 'متوسط',
    's.size.l': 'كبير',
    's.onTop': 'فوق كل النوافذ',
    's.autoStart': 'يبدأ مع تشغيل الجهاز',
    's.resetLayout': 'إعادة ترتيب المواضع',
    's.moveHint': 'اسحب أي ودجت من أي مكان فيها لتحريكها، ومن الزاوية السفلية لتغيير حجمها، أو اضغط عليها بالزر الأيمن لاختيار حجم جاهز. الودجت لا تخرج أبدًا عن حدود الشاشة، وتلتصق بحوافها وببعضها عند الاقتراب.',
    's.shortcuts': 'اختصارات: Ctrl + Alt + W إظهار الودجت · Ctrl + Alt + P تشغيل/إيقاف المؤقت · Ctrl + Alt + Q آية جديدة',
    's.todo': 'المهام',
    's.todoSortBy': 'ترتيب المهام',
    's.todoSortFree': 'حر / يدوي (سحب وإفلات)',
    's.todoSortDeadline': 'حسب الموعد النهائي (الأقرب أولاً)',
    's.todoSortPriority': 'حسب درجة الأهمية (العاجلة أولاً)',
    's.todoSortTitle': 'أبجدياً (أ إلى ي)',
    's.todoSortCreated': 'تاريخ الإضافة (الأحدث أولاً)',
    's.todoMoveDoneToBottom': 'نقل المهام المكتملة لأسفل القائمة تلقائياً',
    's.todoMoveDoneToBottomHint': 'عند تفعيل هذا الخيار، تنتقل المهام المنجزة تلقائياً إلى أسفل القائمة لتبقى المهام النشطة في الأعلى.',
    's.hideDone': 'إخفاء المهام المنجزة بعد',
    's.never': 'لا تُخفى',
    's.hour1': 'ساعة',
    's.hours': '{n} ساعات',
    's.hoursMany': '{n} ساعة',
    's.day1': 'يوم',
    's.days2': 'يومين',
    's.week': 'أسبوع',
    's.todoHint': 'المهام المخفية تبقى محفوظة وتظهر في عرض «المنجز». ولكل مهمة إعدادها الخاص من زر ⋯ بجانبها، مع الملاحظات والتذكيرات والأولوية وتاريخ التسليم.',
    's.clock': 'الساعة',
    's.clockStyle': 'الشكل',
    's.ring': 'حلقة',
    's.analog': 'عقارب',
    's.digital': 'أرقام',
    's.hour12': 'نظام ١٢ ساعة (ص/م)',
    's.seconds': 'إظهار الثواني',
    's.clockUltraTransparent': 'الشفافية القصوى للودجت',
    's.clockPureTransparent': 'وضع الشفافية الكاملة 100% (بدون خلفية)',
    's.clockPureTransparentHint': 'إلغاء خلفية الودجت بالكامل لعرض الأرقام عائمة مباشرة على الشاشة، أو استخدام درجة الشفافية العادية عبر المؤشر.',
    's.pomodoroPureTransparent': 'وضع الشفافية الكاملة 100% (بدون خلفية)',
    's.pomodoroPureTransparentHint': 'إلغاء خلفية مؤقت بومودورو بالكامل لعرض العداد والأرقام عائمة مباشرة على سطح المكتب.',
    's.clockDefaultTab': 'التبويب الافتراضي عند الفتح',
    's.tabClock': '⏰ الساعة (Clock)',
    's.tabAlarm': '🔔 المنبه (Alarm)',
    's.tabTimer': '⏱️ التايمر (Timer)',
    's.clockAlarmSound': 'تشغيل صوت نغمة المنبه',
    's.clockSnoozeDuration': 'مدة الغفوة الافتراضية للمنبه',
    's.clockTimerSound': 'صوت انتهاء العد التنازلي للتايمر',
    's.clockTimerDefaultSec': 'المدة الافتراضية للتايمر',
    's.clockDesktopNotify': 'إشعارات سطح المكتب (المنبه والتايمر)',
    's.zones': 'مدن إضافية',
    's.zonesHint': '(تظهر عند تكبير الساعة)',
    's.calendar': 'التقويم',
    's.tabCalendar': 'التقويم والمناسبات',
    's.calViewsTitle': 'خيارات العرض والتقويم',
    's.calViewMode': 'وضع العرض الافتراضي للتقويم',
    's.calViewMonth': 'عرض الشهر (Month Grid)',
    's.calViewWeek': 'عرض الأسبوع (Week Columns)',
    's.calViewAgenda': 'جدول المواعيد والأجندة (Agenda / Schedule)',
    's.calViewModeHint': 'يمكنك أيضاً التبديل السريع بين هذه الأوضاع مباشرة من شريط أدوات ودجت التقويم.',
    's.calWeekStart': 'أول أيام الأسبوع',
    's.calSat': 'السبت',
    's.calSun': 'الأحد',
    's.calMon': 'الإثنين',
    's.calHijri': 'إظهار التاريخ الهجري في التقويم',
    's.calHijriAdjust': 'تصحيح التاريخ الهجري (أيام)',
    's.calStyleTitle': 'المظهر والألوان والتصميم المريح للعين',
    's.calVisualStyle': 'النمط الجمالي للتقويم',
    's.calStyleModern': 'عصري هادئ ومريح للعين (Modern Eye-Comfort)',
    's.calStyleGlass': 'زجاجي بلوري شفاف (Aero Glass)',
    's.calStyleClassic': 'كلاسيكي أنيق عالي الوضوح (Classic Sharp)',
    's.calVisualStyleHint': 'يتحكم في تباين خلايا الأيام، انحناء الزوايا، وتوزيع الظلال داخل ودجت التقويم.',
    's.calHighlightWeekend': 'إبراز عطلة نهاية الأسبوع (الجمعة والسبت) بلون هادئ',
    's.calShowRedDot': 'إظهار نقطة حمراء واضحة للأيام التي تحتوي على مناسبات أو ملاحظات',
    's.calShowRedDotHint': 'عند تفعيل هذا الخيار، تظهر نقطة حمراء دائرية بارزة أسفل رقم اليوم لتنبيهك فوراً بوجود ارتباطات أو ملاحظات في ذلك اليوم.',
    's.calShowDayActions': 'إظهار زري الإجراء السريع (+) و (📝) فور الضغط على اليوم',
    's.calShowDayActionsHint': 'عند الضغط على أي يوم، تظهر نافذة مصغرة أنيقة تتيح لك بنقرة واحدة إضافة مناسبة (+) أو كتابة ملاحظة/يومية (📝) لذلك اليوم.',
    's.calPopupTheme': 'لون ومظهر النوافذ والمنبثقات',
    's.calPopupThemeDark': 'داكن ناعم فخم (Slate)',
    's.calPopupThemeWaterglass': 'زجاج مائي سائل (Liquid Glass)',
    's.calPopupThemeAcrylic': 'أكريليك ناعم (Acrylic Blur)',
    's.calPopupThemePureBlack': 'أسود عميق (Pure OLED Black)',
    's.calPopupThemeMatch': 'مطابق لمظهر البرنامج العام',
    's.calPopupThemeHint': 'يتحكم في لون وخلفية نافذة المناسبات ونوافذ الإضافة وملاحظات اليوم.',
    's.calPopupRadius': 'استدارة حواف النوافذ',
    's.calPopupRadiusRounded': 'دائري ناعم متوازن (14px)',
    's.calPopupRadiusPill': 'دائري فائق انسيابي (22px)',
    's.calPopupRadiusCompact': 'مضغوط وعملي (8px)',
    's.calPopupGlow': 'توهج وظلال النوافذ',
    's.calPopupGlowRadiant': 'توهج ملون مشع',
    's.calPopupGlowSubtle': 'ظل هادئ متوازن',
    's.calPopupGlowFlat': 'حواف نقية بدون توهج',
    's.calSmartTitle': 'الميزات الذكية والتكامل مع المهام (Google Calendar Synergy)',
    's.calShowTasksOnCalendar': 'عرض مهام ومواعيد تسليم To-Do و Classroom في التقويم',
    's.calShowTasksHint': 'تظهر مواعيد تسليم واجباتك المدرسية ومهامك اليومية كشارات وشاشات عرض داخل التقويم جنباً إلى جنب مع المناسبات.',
    's.calShowHabitsOnCalendar': 'عرض العادات اليومية في التقويم',
    's.calShowHabitsHint': 'عند تفعيلها، ستظهر العادات اليومية الفعلية المسجلة لديك كشارات تفاعلية صغيرة داخل خلايا التقويم (معطلة افتراضياً لمظهر هادئ ونظيف).',
    's.calWaSetupBannerTitle': 'إعدادات تنبيهات WhatsApp الخاصة بالتقويم',
    's.calWaSetupBannerDesc': 'اضغط هنا للانتقال إلى قسم إعداد رسائل WhatsApp وقوالب التهنئة والتذكير المخصصة للمناسبات في تبويب "الإعداد والربط".',
    's.calWaSetupTitle': 'إعداد تنبيهات WhatsApp لمناسبات التقويم',
    's.calWaEnabled': 'تفعيل إرسال تذكيرات مناسبات التقويم عبر WhatsApp',
    's.calWaEnabledHint': 'إرسال رسائل WhatsApp تلقائياً لأعياد الميلاد، المؤتمرات، الاجتماعات، والامتحانات المسجلة في التقويم.',
    's.calWaDefaultTiming': 'موعد الإرسال الافتراضي للمناسبات الجديدة',
    's.calWaTimingMorningOf': 'في صباح يوم المناسبة (9:00 ص)',
    's.calWaTiming1dBefore': 'قبل المناسبة بيوم واحد (8:00 م)',
    's.calWaTiming1hBefore': 'قبل موعد المناسبة بساعة واحدة',
    's.calWaTimingAtEvent': 'في توقيت المناسبة المحدد تماماً',
    's.calWaOverrideRecipient': 'المستلم المخصص لتنبيهات التقويم (اختياري)',
    's.calWaOverrideRecipientPh': 'مثال: 2010xxxxxxxx أو معرّف مجموعة (فارغ = الإعدادات العامة)',
    's.calWaOverrideRecipientHint': 'إذا تركته فارغاً، ستُرسل التنبيهات تلقائياً للأرقام أو المجموعة المحددة في إعدادات WhatsApp العامة أعلاه.',
    's.calWaTemplate': 'قالب رسالة WhatsApp للمناسبات والتقويم',
    's.calWaTemplatePh': 'اكتب قالبك هنا، أو اختر قالباً جاهزاً من الأزرار أعلاه...',
    's.calWaPresetGreeting': '🎉 تهنئة ومناسبة سعيدة',
    's.calWaPresetFormal': '💼 تذكير رسمي / اجتماع',
    's.calWaPresetBrief': '📌 تذكير مقتضب',
    's.calTagTitle': 'عنوان المناسبة',
    's.calTagDate': 'تاريخ اليوم',
    's.calTagTime': 'الوقت',
    's.calTagCategory': 'نوع المناسبة',
    's.calTagNotes': 'الملاحظات',
    's.calTagCountdown': 'الوقت المتبقي',
    's.calWaPreviewTitle': 'معاينة رسالة WhatsApp للمناسبات:',
    's.calWaSendTest': 'إرسال رسالة تجريبية للتقويم عبر WhatsApp الآن',
    's.calWaDispatcherHint': 'نظام الإرسال الموثوق Reliable Dispatcher يضمن وصول الرسائل 24/7 حتى عند إغلاق الودجات أو سكون الحاسوب مع آلية الاستدراك التلقائي فور التشغيل.',
    's.calWaTestSuccess': 'تم إرسال رسالة التقويم التجريبية بنجاح! 🚀',
    's.calWaTestFailed': 'فشل إرسال التجربة: ',
    's.enableClockWidget': 'تفعيل برنامج ودجة الساعة ومواقيت الصلاة',
    's.enablePomodoroWidget': 'تفعيل برنامج مؤقت التركيز وبومودورو',
    's.enableCalendarWidget': 'تفعيل برنامج ودجة التقويم والمناسبات',
    's.enableHabitsWidget': 'تفعيل برنامج ودجة العادات والعافية',
    's.enableQuranWidget': 'تفعيل برنامج ودجة الآية والحديث (القرآن)',
    's.enableTodoWidget': 'تفعيل برنامج ودجة المهام وقائمة المهام',
    's.enableNotesWidget': 'تفعيل برنامج ودجة الملاحظات السريعة',
    's.enableEmailWidget': 'تفعيل برنامج ودجة البريد الإلكتروني',
    's.enablePhotoWidget': 'تفعيل برنامج ودجة إطار الصور',
    's.tabHabits': 'العادات والعافية',
    's.habitsStyleTitle': 'المظهر وعرض البوليت جورنال',
    's.habitsEnabled': 'تفعيل ودجت العادات والعافية',
    's.habitsTheme': 'سمة المظهر (Theme)',
    's.habitsThemeMatch': '✨ مطابق لمظهر البرنامج العام (Match App Theme)',
    's.habitsDefaultView': 'العرض الافتراضي للودجت',
    's.habitsWeekStart': 'بداية الأسبوع',
    's.habitsGridDotStyle': 'شكل نقاط الإنجاز',
    's.habitsShowDailyTotals': 'إظهار صف إجمالي العادات المنجزة أسفل المصفوفة',
    's.habitsShowDailyTotalsHint': 'يعرض مجموع العادات المكتملة في كل يوم من أيام الشهر أسفل الجدول كما في دفاتر التخطيط.',
    's.habitsShowStreak': 'إظهار عداد السلسلة ومستوى التوهج (Streak Flame)',
    's.habitsShowStrength': 'إظهار نسبة قوة واستقرار العادة (Strength %)',
    's.habitsShowUrgency': 'إظهار شارة الاستحقاق والتأخير (⚠️ %)',
    's.habitsShowUrgencyHint': 'يعرض نسبة الاستحقاق والتنبيه عند تأخر العادة لتفادي كسر السلسلة وإلغاء شعور الذنب.',
    's.habitsShowProgressBar': 'إظهار شريط أو حلقة التقدم اليومي في أعلى الودجت',
    's.habitsShowMiniStrip': 'إظهار شريط الأيام السبعة السريع (7-Day Strip)',
    's.habitsShowRoutineFilters': 'إظهار شريط تصنيفات الروتين (صباحي/مسائي/عمل...)',
    's.habitsShowFooterCheckin': 'إظهار شريط التسجيل السريع للمزاج وساعات النوم',
    's.habitsShowQuickJournal': 'إظهار زر التدوين السريع (خاطرة وتأمل اليوم)',
    's.habitsShowQuickJournalHint': 'يعرض زراً صغيراً في شريط الودجت الخارجي لكتابة وتوثيق تأملاتك وخاطرة اليوم مباشرة دون الحاجة لفتح لوحة التحكم.',
    's.habitsPsychologyTitle': 'سيكلوجية التحفيز والتفاعل الدقيق (Micro-Interactions)',
    's.habitsSoundEffects': 'نغمة الإنجاز الصوتية الفورية (Audio Chime)',
    's.habitsSoundEffectsHint': 'نغمة صوتية مريحة ومهدئة عند إتمام العادة لتعزيز هرمون الإنجاز والتحفيز الذاتي.',
    's.habitsConfettiCelebration': 'مؤثرات الاحتفال والشرر (Celebration Confetti)',
    's.habitsConfettiCelebrationHint': 'إطلاق شرر واحتفال بصري ملهم عند إتمام العادة أو الوصول لـ 100% يومياً.',
    's.habitsProgressRingStyle': 'شكل مؤشر التقدم اليومي',
    's.habitsProgressGradient': 'شريط نيون متدرج ناعم (Gradient Bar)',
    's.habitsProgressCircular': 'حلقة طاقة دائرية متوهجة (Bento Circular Ring)',
    's.habitsSmartRoutineAnchor': 'التبديل التلقائي الذكي للفترات حسب الساعة (Smart Time Anchoring)',
    's.habitsSmartRoutineAnchorHint': 'يعرض روتين الصباح في الصباح، والمساء في المساء تلقائياً لتقليل التشتت ومساعدتك على التركيز.',
    's.habitsDailyMotivationalQuote': 'شرارة التحفيز والتأمل اليومي (Daily Mindset Spark)',
    's.habitsDailyMotivationalQuoteHint': 'جملة ملهمة يومية من علم النفس وبناء العادات تدفعك للاستمرارية دون انقطاع.',
    's.habitsGamificationTitle': 'نظام النقاط ومستويات الأبطال (Gamification)',
    's.habitsGamificationEnabled': 'تفعيل نظام النقاط ومستويات الأبطال (Gamification)',
    's.habitsGamificationHint': 'عند التعطيل، يتم إخفاء نقاط الخبرة (XP) وشريط الصحة (HP) والمستويات والتركيز فقط على التتبع النقي والمجرد للعادات.',
    's.habitsShowPomodoroShortcut': 'إظهار زر مؤقت بومودورو للتركيز على بطاقات العادات',
    's.habitsShowPomodoroHint': 'يظهر زر التركيز السريع (⏱️) على العادات المفعّل لها مؤقت بومودورو في إعداداتها الفردية.',
    's.habitsStreaksTitle': 'السلاسل الذكية ومرونة الأيام (Skip Logic)',
    's.habitsForgivingStreak': 'نظام القوة التراكمية الذكي (Forgiving Streak)',
    's.habitsForgivingStreakHint': 'يقيس قوة العادة بمعادلة Loop Tracker التراكمية، ولا يصفر رصيدك بالكامل عند تفويت يوم واحد بعد استمرار طويل.',
    's.habitsGraceDays': 'سماحية أيام الراحة الأسبوعية (Grace Days)',
    's.habitsSleepMoodTitle': 'مختبر النوم والمزاج والمؤشرات الحيوية',
    's.habitsSleepTargetHours': 'ساعات النوم الصحية المستهدفة',
    's.habitsSleepWarningMin': 'حد التنبيه الخطر لنقص النوم',
    's.habitsTargetBedtime': 'الموعد المستهدف للنوم (Bedtime Target)',
    's.habitsTargetWakeTime': 'الموعد المستهدف للاستيقاظ (Wake Target)',
    's.habitsMoodScaleType': 'نوع مقياس المزاج',
    's.habitsTrackStress': 'تتبع منحنى التوتر والأعراض الجسدية',
    's.habitsTrackScreenTime': 'تتبع ساعات الشاشة ومقارنتها بنقاء النوم',
    's.habitsIntegrationTitle': 'الربط الذكي مع المهام والتقويم',
    's.habitsSyncToTodo': 'إظهار عادات اليوم كمهام في ودجت الـ To-Do ومزامنتها',
    's.habitsSyncToTodoHint': 'عند شطب العادة من قائمة المهام تُسجل كمكتملة في ودجت العادات فوراً والعكس صحيح.',
    's.habitsSyncToCalendar': 'إظهار نقاط العادات والمزاج على أيام التقويم',
    's.habitsWaTitle': 'تقارير وتنبيهات الواتساب الذكية',
    's.habitsWaEveningPrompt': 'إرسال تذكير مسائي يومي للتوثيق عبر الواتساب',
    's.habitsWaEveningTime': 'موعد التذكير المسائي اليومي',
    's.habitsWaWeeklyDigest': 'إرسال ملخص إنجاز أسبوعي كل نهاية أسبوع',
    's.habitsWaMonthlyReport': 'إرسال التقرير الشهري التنفيذي الشامل نهاية كل شهر',
    's.habitsWaRecipientOverride': 'رقم واتساب خاص للتقارير (اختياري)',
    's.habitsWaReportLang': 'لغة تقارير الواتساب الذكية',
    's.weekStart': 'أول أيام الأسبوع',
    's.hijri': 'إظهار التاريخ الهجري',
    's.hijriAdjust': 'تصحيح التاريخ الهجري',
    's.adj-2': '− يومان',
    's.adj-1': '− يوم',
    's.adj0': 'بدون تصحيح',
    's.adj1': '+ يوم',
    's.adj2': '+ يومان',
    's.hijriNote': 'اليوم: {date} — من تقويم أم القرى في النظام. إن كان الإعلان المحلي لبداية الشهر مختلفًا، صحّحه بيوم.',
    's.calEventsWaEnabled': 'إرسال تذكيرات مناسبات التقويم عبر WhatsApp',
    's.calEventsWaHint': 'إرسال تنبيهات تلقائية لمناسباتك المسجلة في التقويم (أعياد ميلاد، مؤتمرات، لقاءات) عبر WhatsApp.',
    's.pomodoro': 'مؤقت التركيز (بومودورو)',
    's.pLabel': 'اسم الجلسة',
    's.pFocus': 'مدة التركيز',
    's.pShort': 'استراحة قصيرة',
    's.pLong': 'استراحة طويلة',
    's.pEvery': 'استراحة طويلة بعد',
    's.minutes': 'دقيقة',
    's.sessions': 'جلسات',
    's.pAutoBreaks': 'بدء الاستراحة تلقائيًا',
    's.pAutoFocus': 'بدء جلسة التركيز تلقائيًا بعد الاستراحة',
    's.pSound': 'صوت عند الانتهاء',
    's.pNotify': 'إشعار ويندوز عند الانتهاء',
    's.pVolume': 'مستوى الصوت',
    's.pHint': 'المؤقت يعمل في الخلفية حتى لو أخفيت الودجت، ويتابع الوقت الصحيح بعد سكون الجهاز.',
    's.quran': 'الآية والتفسير',
    's.interval': 'تتبدّل الآية كل',
    's.everyHours': '{n} ساعات',
    's.everyHour': 'ساعة',
    's.everyHoursMany': '{n} ساعة',
    's.tafsir': 'التفسير المعتمد',
    's.showTr': 'إظهار ترجمة إنجليزية للمعنى',
    's.translation': 'الترجمة',
    's.quranArabic': 'نص الآية والتفسير يُعرضان دائمًا بالعربية كما نشرهما المصدر، في الوضع العربي والإنجليزي.',
    's.prefetch': 'تحضير آيات للاستخدام دون إنترنت',
    's.preparing': 'جارٍ التحضير…',
    's.prepared': 'محفوظ: {ayat} آية، {tafsir} تفسير',
    's.prepareFailed': 'تعذّر التحضير — تحقق من الاتصال',
    's.resetAll': 'استعادة الإعدادات الافتراضية',
    's.confirm': 'اضغط مرة أخرى للتأكيد',
    's.resetDone': 'تمت الاستعادة',
    's.srcText': 'نص الآية',
    's.srcVerify': 'التحقق',
    's.srcVerifyVal': 'تتم مطابقة كل آية مع {name} قبل عرضها',
    's.srcTafsir': 'التفاسير',
    's.srcTafsirVal': '{n} تفاسير متاحة',
    's.th.glass': 'زجاجي',
    's.th.waterglass': 'زجاج مائي (Water Glass)',
    's.th.smoke': 'دخاني',
    's.th.midnight': 'ليلي',
    's.th.daylight': 'نهاري',
    's.th.sand': 'رملي',
    's.th.aurora': 'شفق قطبي (Aurora)',
    's.th.cyber': 'نيون سايبر (Cyber)',
    's.th.oled': 'أوليد داكن (OLED)',
    's.th.notebook': 'كراسة مسطّرة (Lined Notebook)',
    's.emailReadAction': 'التعامل مع الرسائل المقروءة',
    's.emailReadKeep': 'إبقاء في القائمة (عادي)',
    's.emailReadDim': 'تعتيم وإبهات الرسائل المقروءة',
    's.emailReadHide': 'إخفاء الرسائل المقروءة تلقائياً',
    's.size.icon': 'أيقونة',
    's.size.xs': 'صغير جدًا',
    's.size.xl': 'كبير جدًا',
    's.size.wide': 'عريض (Wide)',
    's.size.tall': 'طولي (Tall Tower)',
    's.size.max': 'موسع كامل (Max)',
    's.width': 'العرض',
    's.height': 'الارتفاع',
    's.lockTitle': 'تثبيت المكان والحجم',
    's.f.hadith': 'نافذة الحديث',
    's.fontsFamily': 'الخطوط',
    's.fontUi': 'خط الواجهة',
    's.fontRead': 'خط القراءة (الحديث والتفسير)',
    's.fontQuran': 'خط المصحف (نص الآيات)',
    's.fontNum': 'خط الأرقام (الساعة والمؤقت والتقويم)',
    's.fontColor': 'لون الخط',
    's.fontColorDefault': 'تلقائي (حسب الثيم)',
    's.fontColorHint': 'يمكنك تغيير لون الخط لكافة الودجات أو اختيار ودجت محدد لتغيير لونه هو فقط.',
    's.uiWeight': 'سُمك خط الواجهة',
    's.w300': 'رفيع',
    's.w400': 'عادي',
    's.w500': 'متوسط',
    's.w600': 'سميك',
    's.numWeight': 'سُمك الأرقام',
    's.numSpacing': 'تباعد الأرقام',
    's.lineHeight': 'تباعد الأسطر',
    's.fontsHint2': 'الخط يغيّر شكل الحروف فقط؛ نص الآيات والأحاديث يبقى كما نشره المصدر حرفًا بحرف.',
    's.look': 'الزجاج والحركة',
    's.tint': 'لون الزجاج',
    's.tintNone': 'بدون لون',
    's.tintStrength': 'قوة اللون',
    's.edge': 'لمعان الحافة',
    's.borderWidth': 'إطار الودجت',
    's.bw0': 'بدون',
    's.bw1': 'رفيع',
    's.bw2': 'واضح',
    's.hover': 'توهّج المرور بالماوس',
    's.sheenRadius': 'نصف قطر هالة المؤشر',
    's.motion': 'الحركة',
    's.motionOff': 'بدون حركة',
    's.motionSlow': 'هادئة',
    's.motionNormal': 'عادية',
    's.motionFast': 'سريعة',
    's.density': 'المسافات الداخلية',
    's.dCompact': 'مضغوطة',
    's.dNormal': 'عادية',
    's.dRoomy': 'واسعة',
    's.contrast': 'وضوح النص',
    's.cNormal': 'عادي',
    's.cHigh': 'عالٍ',
    's.grain': 'ملمس الزجاج الناعم',
    's.inspiration': 'ماذا تعرض الودجت',
    's.insQuran': 'آية وتفسير',
    's.insHadith': 'حديث وشرح',
    's.insAlternate': 'بالتناوب',
    's.hadithHint': 'الأحاديث وشرحها من موسوعة الأحاديث النبوية المترجمة (HadeethEnc). لا يُعرض حديث إلا إذا كانت درجته «صحيح» أو «حسن»، ووُجدت ألفاظه في البخاري أو مسلم أو السنن الأربع بالرقم المذكور في نسخة مستقلة من كتب السنة، وأحاديث السنن يجب أن يصححها أيضًا علماء ذلك الكتاب. يُعرض النص والشرح كما نُشرا دون أي تعديل.',
    's.prefetchHadith': 'تحضير أحاديث للاستخدام دون إنترنت',
    's.preparedHadith': 'محفوظ ومُتحقَّق منه: {n} حديث',
    's.srcHadith': 'الحديث',
    's.srcHadithVal': 'موسوعة الأحاديث النبوية المترجمة، وكل حديث يُطابَق بكتب السنة',
    's.email': 'البريد الإلكتروني',
    's.emailEnabled': 'تفعيل ودجت البريد',
    's.emailProvider': 'مزود البريد الإلكتروني',
    's.emailUser': 'عنوان البريد الإلكتروني',
    's.emailPass': 'كلمة المرور / كلمة مرور التطبيق',
    's.emailCustom': 'مخصص (Custom IMAP)',
    's.emailHost': 'خادم IMAP',
    's.emailPort': 'منفذ IMAP',
    's.emailSecure': 'اتصال مشفر (SSL/TLS)',
    's.emailInterval': 'فترة التحقق من البريد',
    's.emailNotify': 'إشعار فوري عند وصول رسالة جديدة',
    's.emailSound': 'تنبيه صوتي مع الإشعار',
    's.emailTest': 'فحص الاتصال',
    's.emailTesting': 'جارٍ الاتصال بالخادم…',
    's.emailSuccess': 'تم الاتصال بنجاح! ({count} رسالة في الوارد)',
    's.emailHint': 'لحسابات Gmail أو Yahoo أو Outlook، يلزم إنشاء كلمة مرور تطبيق (App Password) من إعدادات حسابك.',
    's.emailAppPassHelp': '🔑 لحسابات Google: اضغط هنا لإنشاء «كلمة مرور التطبيقات» (App Password)',
    's.photo': 'الصورة المختارة',
    's.photoMode': 'نمط العرض',
    's.photoSingle': 'صورة مفردة',
    's.photoFolderMode': 'مجلد صور (عرض متتابع)',
    's.photoFile': 'ملف الصورة',
    's.photoPickFile': 'اختيار صورة…',
    's.photoFolder': 'مجلد الصور',
    's.photoPickFolder': 'اختيار مجلد…',
    's.photoInterval': 'فترة تبديل الصور',
    's.photoFit': 'طريقة ملاءمة الصورة',
    's.photoFitCover': 'تعبئة النافذة (Cover)',
    's.photoFitContain': 'احتواء كامل (Contain)',
    's.photoFitCenter': 'توسيط بالحجم الطبيعي',
    's.photoShowCaption': 'إظهار اسم الصورة',
    's.photoZoom': 'تكبير الصورة (Zoom)',
    's.photoPosX': 'الموضع الأفقي (X)',
    's.photoPosY': 'الموضع الرأسي (Y)',
    's.photoRotate': 'زاوية التدوير',
    's.photoBrightness': 'السطوع',
    's.photoContrast': 'التباين',
    's.photoGrayscale': 'أبيض وأسود',
    's.photoShape': 'شكل إطار الصورة',
    's.photoShapeRounded': 'طبيعي (متناسق)',
    's.photoShapeSoft': 'دائري ناعم',
    's.photoShapeCircle': 'دائري كامل / بيضاوي',
    's.photoShapeSquare': 'مربع حاد',
    's.photoResetAdjust': 'إعادة ضبط أبعاد الصورة ومؤثراتها',
    's.f.email': 'ودجت البريد',
    's.f.photo': 'ودجت الصورة',

    's.classroom': 'Google Classroom',
    's.crTitle': 'Google Classroom',
    's.crEnabled': 'تمكين ربط Google Classroom',
    's.crClientId': 'معرف العميل (Client ID)',
    's.crClientSecret': 'الرمز السري (Client Secret)',
    's.crLogin': 'تسجيل الدخول وربط الحساب',
    's.crSync': 'مزامنة التكليفات الآن',
    's.crIcal': 'رابط تقويم Classroom (iCal اختياري)',
    's.crIcalHint': 'يمكنك نسخ رابط تقويم المهام من Google Calendar للربط الفوري بدون إعدادات سحابية.',
    's.crPreventDone': 'منع إنهاء المهمة إلا بعد تسليمها',
    's.crPreventDoneHint': 'يمنع وسم التكليف كمنجز في البرنامج إلا إذا تم تسليمه فعلياً على موقع Google Classroom.',
    's.crShowSubmissionBadge': 'إظهار شارة حالة التسليم (لم يُسلّم)',
    's.crShowSubmissionBadgeHint': 'تظهر شارة صغيرة توضح ما إذا كان التكليف قد تم تسليمه في Classroom أو لم يُسلّم بعد.',
    's.crShowCourseBadge': 'إظهار شارة اسم المادة (📚)',
    's.crShowLinkBtn': 'إظهار زر الرابط السريع (🔗) على البطاقة',
    's.crCourseInTitle': 'تضمين اسم المادة في نص العنوان',
    's.crCourseInTitleHint': 'عند التعطيل، يظهر عنوان التكليف مرتباً ومختصراً بدون كود المادة الطويل في بداية السطر.',
    's.crShowNotificationsBtn': 'إظهار زر إشعارات Classroom في الودجت',
    's.crShowNotificationsBtnHint': 'تفعيل أو إخفاء زر جرس إشعارات Classroom من شريط عنوان ودجت المهام.',
    's.crFilterHiddenCourses': 'إخفاء مواد Classroom المحددة تلقائياً',
    's.crFilterHiddenCoursesHint': 'عند تفعيل هذا الخيار، يتم حجب وإخفاء تكليفات جميع المواد المحددة أدناه تلقائياً من المهام وتنبيهات الواتساب ووضع الطوارئ.',
    's.crAutoCoursesTitle': 'قائمة المواد الدراسية المستبعدة (المخفية)',
    's.crAutoCoursesHint': 'قم بتفعيل زر (ON) أمام أي مادة لإخفائها تلقائياً، أو إيقافه (OFF) لتظهر تكليفاتها في جدول المهام.',
    's.crAutoCoursesLoading': 'جارٍ فحص ومزامنة المواد تلقائياً من Google Classroom…',
    's.crAutoCoursesEmpty': 'لا توجد مواد مسجلة حالياً (تأكد من تسجيل الدخول بحساب Google Classroom).',
    's.crCourseHiddenBadge': 'مخفية',
    's.crCourseVisibleBadge': 'مرئية',
    's.crFilterActive': 'مفعل: يتم إخفاء',
    's.crMarkedHidden': 'محددة للإخفاء من',
    's.crOf': 'من',
    's.crHiddenCoursesTitle': 'المواد الدراسية المستبعدة / المخفية (Excluded Courses)',
    's.crHiddenCoursesHint': 'أي مادة يتم استبعادها هنا لن تظهر تكليفاتها نهائياً في المهام أو البحث أو تنبيهات الواتساب أو وضع الطوارئ، ويتم مسحها فوراً.',
    's.crAddHiddenCoursePh': 'اكتب اسم المادة أو الكود لإخفائها...',
    's.crAddHiddenCourseBtn': 'إخفاء',
    's.crFetchCoursesBtn': 'جلب المواد من الحساب 🔄',
    's.crNoHiddenCourses': 'لا توجد مواد مخفية حالياً (جميع المواد تظهر في المهام).',
    's.crUserEmail': 'بريد Google Classroom المعتمد',
    's.crUserEmailHint': 'عند الضغط على رابط أي تكليف، يفتح المتصفح بهذا الحساب تلقائياً دون التشتت بين حسابات جوجل المتعددة.',
    's.emailOpenInWindow': 'فتح الرسائل في نافذة مستقلة واسعة (مثل التفسير)',
    's.emailOpenInWindowHint': 'عند تفعيل هذا الخيار، يتم فتح الرسالة فوراً في نافذة منبثقة واسعة وفسيحة لتوفير قراءة مريحة للمحتوى والمرفقات.',
    's.crSyncing': 'جارٍ فحص ومزامنة التكليفات…',
    's.crSyncSuccess': 'تمت المزامنة بنجاح ({added} مضاف، {updated} محدث)',
    's.crSyncEmpty': 'لم يتم العثور على تكليفات جديدة',

    's.superurgent': 'وضع الطوارئ (Super Urgent)',
    's.suTitle': 'وضع الطوارئ (Super Urgent)',
    's.suEnabled': 'تمكين وضع الطوارئ للمهام المقتربة',
    's.suHours': 'تفعيل الطوارئ قبل الموعد بـ',
    's.suHour1': 'ساعة واحدة',
    's.suHours2': 'ساعتان',
    's.suHours3': '٣ ساعات (موصى به)',
    's.suHours4': '٤ ساعات',
    's.suHours6': '٦ ساعات',
    's.suInterval': 'تكرار تنبيهات سطح المكتب',
    's.suMins10': 'كل ١٠ دقائق',
    's.suMins15': 'كل ١٥ دقيقة',
    's.suMins30': 'كل ٣٠ دقيقة',
    's.suHint': 'تتحول بطاقة المهمة إلى اللون الأحمر الداكن المشع مع تنبيهات صوتية متكررة حتى يتم تسليم المهمة.',

    's.whatsapp': 'تنبيهات واتساب (WhatsApp)',
    's.waTitle': 'تنبيهات واتساب (WhatsApp)',
    's.waEnabled': 'تمكين إرسال رسائل WhatsApp',
    's.waProvider': 'وسيلة الاتصال',
    's.waProvOpenWa': 'خادم OpenWA المحلي (مستقر، سريع، بدون وسيط)',
    's.waProvCallMeBot': 'خدمة CallMeBot السحابية',
    's.waPhone': 'رقم هاتف المستلم',
    's.waPhoneHint': 'أدخل أرقام الهواتف التي ترغب في تلقي التنبيهات عليها.',
    's.waPhoneNumbers': 'أرقام هواتف الاستلام',
    's.waAddPhone': 'إضافة رقم آخر',
    's.waBrowseGroups': 'استعراض المجموعات',
    's.waGroupsTitle': 'مجموعاتك على واتساب:',
    's.waNumbersHint': 'أضف أرقام الهواتف أو معرّفات المجموعات (@g.us) التي ترغب في تلقي إشعارات المهام عليها.',
    's.waSenderName': 'اسم الراسل المخصص (البوت / جهة الاتصال)',
    's.waSenderNameHint': 'الاسم أو البوت الذي يظهر في مقدمة رسالة واتساب (مثال: Assignment Assistant أو مساعد المهام).',
    's.waIdentityTitle': 'كيف تظهر الرسائل باسم "Assignment" في هاتفك؟',
    's.waIdentityDesc': 'لكي يظهر إشعار الرسالة في هاتفك باسم Assignment بدلاً من رقمك الشخصي: إما أن تحفظ رقم البوت في جهات اتصال هاتفك باسم Assignment، أو فعّل خيار الإرسال إلى مجموعة واتساب لتصل كل التنبيهات بداخلها.',
    's.waSendToGroup': 'إرسال التنبيهات إلى مجموعة واتساب (Group Chat)',
    's.waGroupId': 'معرّف المجموعة (Group JID)',
    's.waRoutingTitle': 'توجيه وفصل قنوات WhatsApp (Multi-Channel Routing)',
    's.waRoutingDesc': 'يمكنك تخصيص رقم أو مجموعة واتساب مستقلة لكل ميزة، أو تركها لتصل إلى الرقم الافتراضي العام أعلاه.',
    's.waChanSuperUrgent': '🚨 مهام الطوارئ القصوى (Super Urgent)',
    's.waChanHabitsReports': '📊 تقارير العادات اليومية والأسبوعية',
    's.waChanHabitReminders': '⏰ تذكيرات العادات الفردية (Per-Habit)',
    's.waChanCalendar': '📅 تنبيهات التقويم والمناسبات',
    's.waChanDefault': '🌐 الرقم الافتراضي العام',
    's.waChanCustom': '✏️ رقم أو مجموعة مخصصة',
    's.waChanSuperUrgentPh': 'رقم هاتف (2010xxxx) أو معرف مجموعة (120363@g.us)',
    's.waChanHabitsReportsPh': 'رقم هاتف أو معرف مجموعة لتقارير العادات',
    's.waChanHabitRemindersPh': 'رقم هاتف أو معرف مجموعة لتنبيهات العادات الفردية',
    's.waChanHabitRemindersHint': 'يمكنك أيضاً تحديد رقم مخصص لكل عادة بشكل مستقل من داخل إعدادات تلك العادة.',
    's.waHabitScopeAll': '👥 كل العادات',
    's.waHabitScopeSpecific': '🎯 عادة محددة',
    's.waHabitsAllRecipLabel': 'مستلم تنبيهات جميع العادات:',
    's.waPickHabit': 'اختر عادة لتخصيص رقمها:',
    's.waHabitItemDefault': '🌐 الرقم الافتراضي العام',
    's.waHabitItemCustom': '✏️ رقم مخصص لهذه العادة',
    's.waHabitItemCustomPh': 'رقم هاتف (2010xxxx) أو معرف مجموعة (120363@g.us)',
    's.waHabitTestSend': 'إرسال تنبيه تجريبي',
    's.waCurrentHabitsList': '📋 قائمة العادات الحالية:',
    's.waNoHabitsFound': 'لا توجد عادات مضافة حالياً. يمكنك إضافة عادات من ودجت العادات.',
    's.waHabitSaved': '✓ تم الحفظ للعادة',
    's.waHabitReminderOff': 'معطل',
    's.waChanCalendarPh': 'رقم هاتف أو معرف مجموعة للتقويم',
    's.waSenderNamePh': 'مثال: Assignment أو مساعد المهام',
    's.waBrowseGroupsTitle': 'استعراض مجموعات واتساب واختيارها تلقائياً',
    's.waRefreshGroups': '🔄 تحديث',
    's.waGroupsPrompt': 'اضغط استعراض لجلب المجموعات…',
    's.waGroupsLoading': 'جارٍ جلب المجموعات من واتساب…',
    's.waGroupsEmpty': 'لا توجد مجموعات أو الخادم غير متصل حالياً.',
    's.waAddGroupBtn': '+ إضافة',
    's.waAddGroupTitle': 'إضافة هذه المجموعة إلى قائمة الاستلام',
    's.waDelPhoneTitle': 'حذف هذا الرقم',
    's.waPresets': 'قوالب جاهزة:',
    's.waPresetQuick': '⚡ تنبيه سريع',
    's.waPresetDetailed': '📋 تقرير شامل',
    's.waPresetFormal': '🎯 قالب رسمي',
    's.waInsertTag': 'انقر لإدراج متغير:',
    's.waTagTaskTitle': 'المهمة',
    's.waTagCourseName': 'المادة',
    's.waTagDeadline': 'الموعد',
    's.waTagTimeLeft': 'الوقت المتبقي',
    's.waTagPriority': 'الأولوية',
    's.waTagLink': 'الرابط',
    's.waTagSenderName': 'الراسل',
    's.waTagTaskTitleTitle': 'اسم التكليف / المهمة',
    's.waTagCourseNameTitle': 'اسم المادة الدراسية',
    's.waTagDeadlineTitle': 'موعد التسليم النهائي',
    's.waTagTimeLeftTitle': 'الوقت المتبقي حتى التسليم',
    's.waTagPriorityTitle': 'درجة الأهمية والاستعجال',
    's.waTagLinkTitle': 'رابط فتح المهمة في المتصفح',
    's.waTagSenderNameTitle': 'اسم جهة الإرسال / البوت',
    's.waTemplate': 'صيغة الرسالة المخصصة',
    's.waTemplatePlaceholder': 'اكتب صيغة الرسالة هنا أو اختر قالباً جاهزاً…',
    's.waPreviewBadge': 'معاينة فورية على واتساب',
    's.waTemplateHint': 'المتغيرات المتاحة: {taskTitle}، {courseName}، {deadline}، {timeLeft}، {priority}، {link}، {senderName}.',
    's.waApiKey': 'مفتاح الـ API',
    's.waServerTitle': 'خادم OpenWA المحلي',
    's.waServerDesc': 'يعمل خادم واتساب محلياً وبشكل خفيف جداً على جهازك دون الحاجة لأي وسيط خارجي.',
    's.waStartServer': 'تشغيل الخادم',
    's.waStopServer': 'إيقاف الخادم',
    's.waScanBrowser': 'عرض الرمز في المتصفح',
    's.waRefreshStatus': 'تحديث الحالة',
    's.waAutoStart': 'تشغيل الخادم تلقائياً مع بدء التطبيق',
    's.waGatewayUrl': 'رابط خادم OpenWA',
    's.waSessionId': 'معرف الجلسة (Session ID)',
    's.waFrequency': 'تكرار رسائل واتساب',
    's.waFreqOnce': 'مرة واحدة فقط',
    's.waFreq15': 'كل ١٥ دقيقة',
    's.waFreq30': 'كل ٣٠ دقيقة',
    's.waFreq60': 'كل ساعة',
    's.waTestBtn': 'إرسال رسالة تجريبية',
    's.waTesting': 'جارٍ إرسال الرسالة التجريبية…',
    's.waTestOk': 'تم إرسال الرسالة بنجاح!',
    's.waTestFail': 'فشل الإرسال: {err}',
    's.waScanPrompt': 'امسح رمز الـ QR التالي لربط واتساب بجهازك:',
    's.waScanHelp': 'افتح واتساب في هاتفك > الأجهزة المرتبطة > ربط جهاز وامسح الرمز.',
    's.waCallMeBotDesc': 'تعتمد هذه الخدمة على روبوت خارجي عام، قد يتأخر الرد في أوقات الذروة.',
    's.waBotChat1': 'محادثة البوت الأول',
    's.waBotChat2': 'محادثة البوت البديل',
    's.waOfficialHelp': 'صفحة الشرح الرسمية',
    's.waFooterHint': 'تصلك تنبيهات المهام ذات الأولوية القصوى مباشرة على واتساب قبل الموعد النهائي.',
    's.waStatusStopped': 'الخادم متوقف',
    's.waStatusConnected': 'متصل بواتساب وجاهز',
    's.waStatusScan': 'بانتظار مسح رمز QR',
    's.waStatusStarting': 'جارٍ بدء الخادم…',
    's.waStatusChecking': 'جارٍ الفحص…',
    's.waStatusError': 'غير متصل',
    'photo.pick': 'اختيار صورة',
    's.searchPh': 'ابحث في الإعدادات... (مثال: ثيم، خط، واتساب، كلاسرووم، إيميل)',
    's.clearSearch': 'مسح البحث',
    's.scopeGlobal': '🌐 الافتراضي العام',
    's.fontWeightSummary': '🔤 تخصيص أوزان وتباعد الخطوط والأرقام',
    's.visualEffectsSummary': '✨ خيارات وتأثيرات بصرية متقدمة (انعكاسات الحواف، لمعان الضوء، الحبيبات، والتباين)',
    's.widgetAppearanceSummary': '🎨 خيارات المظهر والخطوط الخاصة بهذا الودجت',
    's.folderPreviewLabel': 'معاينة حية لشكل الصندوق (Live Preview)',
    's.folderPreviewTitle': 'مجلد الودجات',
    's.folderBorderRadiusTitle': '📐 انحناء الحواف وشكل الصندوق (Border Radius)',
    's.folderRadiusLabel': 'درجة استدارة الحواف (Radius):',
    's.folderRadius14': 'مربّع ناعم (14px)',
    's.folderRadius24': 'إسكيركل متناسق (24px - الافتراضي)',
    's.folderRadius32': 'دائري عميق (32px)',
    's.folderRadius42': 'كبسولة دائرية (42px)',
    's.folderRadiusHint': 'يتحكم هذا الخيار مباشرة في انحناء واستدارة زوايا الصندوق على سطح المكتب لمنع أي تشوه في الحواف وتنسيقها مع ذوقك.',
    's.folderGlassTitle': '✨ خامة الزجاج المصنفر والإطار (Glass & Border)',
    's.folderBlurLabel': 'قوة الضبابية والتمويه (Blur):',
    's.folderOpacityLabel': 'كثافة ولون الزجاج (Glass Opacity):',
    's.folderBorderWidthLabel': 'سُمك خط الإطار (Border Stroke):',
    's.folderBorderOpacityLabel': 'شفافية وتوهج الإطار (Rim Highlight):',
    's.folderDynamicsTitle': '⚡ التفاعل وحماية الصناديق وشبكة الشاشة (Dynamics & Desktop Grid)',
    's.folderCollisionLabel': 'حماية الصناديق من التصادم والتداخل (Collision Avoidance):',
    's.folderCollisionHint': 'يمنع الصناديق من الاصطدام أو الاستقرار فوق بعضها عند السحب والإفلات مع ترك مسافة أمان فاصلة 16 بكسل.',
    's.folderCompactTitlesLabel': 'إظهار تسميات الودجات النصية داخل الصندوق المدمج:',
    's.folderCompactTitlesHint': 'افتراضياً معطل للحفاظ على شكل إسكيركل مدمج ومربّع أنيق، ويمكنك تفعيله إذا أردت إظهار أسماء الودجات تحت الأيقونات داخل الصندوق.',
    's.folderDragGlowLabel': 'تأثير التوهج النبضي وامتصاص الودجت عند السحب:',
    's.btnResetFolderSettings': 'استعادة الإعدادات الافتراضية للصندوق ↺',
    's.habitsPerHabitTitle': '⏰ تذكيرات العادات الفردية عبر WhatsApp',
    's.habitsCustomAlerts': 'تنبيهات مخصصة',
    's.habitsPerHabitHint': 'يمكنك تفعيل موعد تذكير دقيق ومستقل عبر WhatsApp لكل عادة على حدة، مع إمكانية توجيه التذكير لرقم أو مجموعة معينة.',
    's.habitsOpenManagerBtn': 'فتح إدارة العادات وضبط التذكيرات',
    's.habitsWaRecipientOverridePh': 'مثال: 2010xxxxxxxx أو اتركه فارغاً للرقم الأساسي',
    's.langArabic': 'العربية (Arabic)',
    's.langEnglish': 'English (الإنجليزية)',
    's.crToggleCoursesTitle': 'عرض / طي قائمة المواد',
    's.setupHelpTitle': 'شرح خطوات الإعداد بالتفصيل',
    's.browserDetecting': 'جاري الكشف عن حسابات كروم...',
    's.ecoChecking': '⚡ فحص الطاقة...',
    's.ecoScopeGlobalHint': 'يتم الآن تعديل وضع توفير الطاقة الافتراضي للتطبيق ككل.',
  },
  en: {
    's.title': 'Settings',
    's.sub': 'Appearance, widgets, tasks, clock, timer and the ayah source',
    's.catAppearance': 'Appearance',
    's.catWidgets': 'Widgets',
    's.catSetup': 'Setting Up',
    's.appearance': 'Appearance',
    's.langAuto': 'Auto (System Language)',
    's.tabAppearance': 'Appearance',
    's.tabWidgets': 'Widgets & Styling',
    's.tabFolder': 'Folders & Boxes',
    's.folderSettingsTitle': '📁 Folder & Box Settings',
    's.folderSettingsSub': 'Customize squircle dimensions, border radius, and frosted glass for desktop folder boxes.',
    's.snapToDesktopGrid': 'Follow System Desktop Grid',
    's.snapToDesktopGridSub': 'When enabled, icons and folder boxes automatically snap to the OS desktop grid. Disable for free placement anywhere on screen.',
    's.preventOpenWidgetsOverlap': 'Prevent Open Widgets Overlap',
    's.preventOpenWidgetsOverlapHint': 'By default, open widgets can freely overlap each other on the desktop. When enabled, open widgets automatically displace each other to prevent overlap.',
    's.wFolder': '📁 Smart Folder',
    's.tabTodo': 'Tasks & Classroom',
    's.tabTime': 'Time & Focus',
    's.tabInspiration': 'Inspiration',
    's.tabMedia': 'Email & Photo',
    's.tabSetup': 'Setting Up',
    's.btnSettingUp': 'Setting Up',
    's.backToSettings': 'Back to Settings',
    's.setupWorkspaceTitle': 'Initial Setup & Accounts (Setting Up)',
    's.setupWorkspaceDesc': 'One-time account credentials, API tokens and gateway configurations.',
    's.perWidgetStyleTitle': 'Per-Widget Style Customization',
    's.perWidgetStyleBadge': 'Custom',
    's.perWidgetStyleHint': 'Customize fonts, font weights and glass solidity for each widget individually, or inherit global styles.',
    's.appearanceScopeTitle': 'Per-Widget Theme & Appearance Customization',
    's.appearanceScopeDesc': 'Customize the theme, accent, fonts, and glass for individual widgets or Settings window, or apply globally.',
    's.ecoTitle': '🔋 Laptop Battery & Power Saver',
    's.ecoDesc': 'Optimize CPU usage, freeze minimized widgets, and suppress heavy blur shaders automatically when on battery to extend laptop life.',
    's.ecoMode': 'Power saver mode:',
    's.ecoModeAuto': 'Automatic (active on battery)',
    's.ecoModeAlways': 'Always on (maximum battery saving)',
    's.ecoModeOff': 'Disabled (maximum visual fidelity)',
    's.ecoSleepMini': 'Freeze minimized widgets completely (0% CPU & render while mini)',
    's.ecoPauseOnLock': 'Pause widgets and background sync when laptop screen is locked',
    's.ecoLightShaders': 'Bypass heavy GPU blur convolution & SVG fractal noise',
    's.ecoBadgeBattery': '🔋 On Battery (Power Saver Active)',
    's.ecoBadgeAc': '🔌 Plugged into AC (Full Performance)',
    's.ecoBadgeAlways': '⚡ Eco Mode Forced Always',
    's.ecoScopeTitle': 'Per-Widget Battery & Power Saver',
    's.ecoScopeDesc': 'Configure power saving, sleeping, and shader reduction independently for each widget or apply global defaults.',
    's.ecoInheritGlobal': '🔗 Follow Global Default Setting',
    's.ecoScopeGlobalHint': 'Currently editing global power saver defaults for all widgets.',
    's.ecoScopeWidgetHint': 'Currently configuring independent power saver settings for this widget.',
    's.ecoScopeFollowsHint': 'This widget currently inherits global defaults. Changing any setting will create custom overrides.',
    's.ecoMatrixTitle': 'Power saving status across all widgets:',
    's.ecoMatrixHint': 'Click any widget to configure it instantly',
    's.ecoCustomBadge': '⚡ Custom',
    's.ecoInheritBadge': '🔗 Global',
    's.chooseTarget': 'Target Element to Customize:',
    's.scopeGlobal': '🌐 Entire App (Global Default)',
    's.scopeSettings': '⚙️ Settings Window',
    's.groupWidgets': 'Desktop Widgets',
    's.scopeStatusGlobal': '🌐 Global Default',
    's.scopeStatusCustom': '✨ Custom for this Element',
    's.scopeStatusInherit': '🔗 Inheriting Global',
    's.resetToGlobal': 'Reset to Global ↺',
    's.scopeHintGlobal': 'Currently modifying the global appearance for the entire app. Any widget without custom settings will follow these automatically.',
    's.scopeHintCustom': 'Currently customizing {name} independently. You can change themes, colors, and fonts without affecting other widgets.',
    's.scopeHintInherit': 'This element currently follows the global theme. As soon as you pick a theme, color, or font here, it will automatically get its own custom style.',
    's.glassThisWidget': 'Glass & Opacity for this element',
    's.wTafsir': '📜 Tafsir & Reflection Window',
    's.wHadith': '📚 Hadith Window',
    's.wEvent': '📌 Event Details Window',
    's.wTask': '📋 Task Details Window',
    's.wEmailView': '📬 Email Reader Window',
    's.wHabitsDashboard': '📊 Habits Dashboard',
    's.chooseWidget': 'Choose Widget to Customize:',
    's.inheritGlobal': 'Global Default (Inherit)',
    's.wClock': '⏰ Clock',
    's.wPomodoro': '⏱️ Pomodoro Timer',
    's.wCalendar': '📅 Calendar',
    's.wHabits': '🔥 Habits & Wellness',
    's.wQuran': '📖 Inspiration (Ayah & Hadith)',
    's.wTodo': '📋 To-Do List',
    's.wNotes': '📝 Notes',
    's.wEmail': '📬 Email',
    's.wPhoto': '🖼️ Photo',
    's.w700': 'Bold (700)',
    's.weight200': '200 (Extra Light)',
    's.weight300': '300 (Light)',
    's.weight400': '400 (Regular)',
    's.weight500': '500 (Medium)',
    's.weight600': '600 (Semibold)',
    's.weight700': '700 (Bold)',
    's.glass0': '0% (Pure Transparent Glass)',
    's.glass15': '15% (Light Frosted)',
    's.glass35': '35% (Medium Glass)',
    's.glass60': '60% (Semi-Opaque)',
    's.glass85': '85% (Opaque)',
    's.glass100': '100% (Solid / Fully Opaque)',
    's.crEnrolledHead': 'Enrolled Courses in your account (click to hide or show):',
    's.crUncheckShow': 'Unhide course and show in tasks',
    's.crCheckingCourses': 'Checking courses… ⏳',
    's.crCourseShowBtn': '✓ Show',
    's.crCourseHideBtn': '🚫 Hide',
    's.crCoursesFetchErr': 'Could not fetch courses automatically (account disconnected or session expired). Type the course name in the box above and click "Hide"!',
    's.setupGuideTitle': 'Setup & Connection Guide',
    's.setupGuideSub': 'Clear, step-by-step instructions for initial connection',
    's.setupGuideGotIt': 'Got it, Close',
    's.waGuideTitle': 'Detailed WhatsApp setup guide',
    's.crGuideTitle': 'Detailed Classroom setup guide',
    's.emailGuideTitle': 'Detailed Email setup guide',
    's.waStatusOpenWa': 'Local OpenWA Server',
    's.waStatusCallMeBotReady': 'CallMeBot Ready',
    's.waStatusCallMeBotKey': 'CallMeBot Needs API Key',
    's.error': 'Error',
    's.failedConnect': 'Failed to connect',
    's.connError': 'Connection error',
    's.wStyleTheme': 'Widget Theme Override',
    's.wStyleAccent': 'Widget Custom Accent Color',
    's.wStyleRadius': 'Widget Corner Radius',
    's.wStyleFontScale': 'Widget Text Scale',
    's.wStyleCardSurface': 'Card Surface Background',
    's.wStyleBorderGlow': 'Border & Specular Rim Glow',
    's.wStyleRadiusSharp': 'Sharp Corners (10px)',
    's.wStyleRadiusSmooth': 'Smooth (16px)',
    's.wStyleRadiusBalanced': 'Balanced Standard (22px)',
    's.wStyleRadiusSoft': 'Ultra Soft (30px)',
    's.wStyleRadiusPill': 'Full Pill (Rounded)',
    's.wStyleScale85': '85% (Compact)',
    's.wStyleScale92': '92% (Small)',
    's.wStyleScale100': '100% (Standard)',
    's.wStyleScale112': '112% (Medium)',
    's.wStyleScale125': '125% (Large)',
    's.wStyleSurfaceGlass': 'Ultra Glass (High Refraction)',
    's.wStyleSurfaceSolid': 'Solid High Contrast',
    's.wStyleSurfaceDeep': 'Deep Ambient Matte',
    's.wStyleGlowNone': 'None',
    's.wStyleGlowSubtle': 'Subtle Ambient',
    's.wStyleGlowCrystal': 'Crystal Specular Edge',
    's.wStyleGlass': 'Widget Glass Opacity',
    's.wStyleReset': 'Reset to Global Defaults',
    's.wStyleResetDone': 'Restored to global default',
    's.perWidgetPromoTitle': 'Customize Appearance Per Widget',
    's.perWidgetPromoDesc': 'Give each widget its own individual theme, accent, fonts, glass, borders and motion',
    's.btnOpenPerWidget': 'Customize Widgets ❯',
    's.wStyleDensity': 'Padding & Density',
    's.wStyleEdge': 'Edge Highlight & Glow',
    's.wStyleBorderWidth': 'Border Width',
    's.wStyleMotion': 'Animation Speed & Motion',
    's.wStyleContrast': 'Contrast Mode',
    's.wStyleGrain': 'Glass Grain Texture',
    's.wStyleTint': 'Glass Color Tint',
    's.wStyleTintStrength': 'Tint Strength',
    's.wStyleEdge0': 'None (0%)',
    's.wStyleEdge50': 'Subtle (50%)',
    's.wStyleEdge100': 'Standard (100%)',
    's.wStyleEdge150': 'Vibrant (150%)',
    's.wStyleGrainOn': 'Enabled (Grain On)',
    's.wStyleGrainOff': 'Disabled (Pure Glass)',
    's.wStyleTintDark': 'Midnight Black',
    's.wStyleTintBlue': 'Oceanic Blue',
    's.wStyleTintEmerald': 'Pure Emerald',
    's.wStyleTintViolet': 'Royal Violet',
    's.wStyleTintAmber': 'Warm Amber',
    's.wStyleTintStr15': 'Very Light (15%)',
    's.wStyleTintStr25': 'Balanced (25%)',
    's.wStyleTintStr45': 'Medium (45%)',
    's.wStyleTintStr70': 'Deep Shaded (70%)',
    's.crSetupTitle': 'Google Classroom Setup',
    's.waSetupTitle': 'WhatsApp & OpenWA Setup',
    's.emailSetupTitle': 'Email (IMAP) Setup',
    's.browserSetupTitle': 'Default Browser & Chrome Account',
    's.browserSetupDesc': 'Select the Google Chrome account to open external links and emails with, instead of opening randomly in whichever profile happens to be active.',
    's.browserMode': 'Link Opening Method',
    's.browserModeChrome': 'Google Chrome (with specific account)',
    's.browserModeSystem': 'System Default Browser',
    's.browserChromeProfile': 'Selected Google Chrome Account',
    's.browserCustomEmail': 'Account Email Address',
    's.browserTestBtn': 'Test Opening Link with this Account',
    's.browserTestSuccess': 'Opening command sent to Chrome successfully!',
    's.browserCustomOption': '⚙️ Custom Account / Email...',
    's.browserDetecting': 'Detecting Chrome profiles...',
    's.emailBrowserHint': 'External email links open with the designated Chrome account in',
    's.emailGoToBrowserSetup': 'Setting Up ←',
    's.statusConnected': 'Connected',
    's.statusDisconnected': 'Disconnected',
    's.statusDisabled': 'Disabled in settings',
    's.statusDisconnectedPrompt': 'Disconnected (click Setting Up to connect)',
    's.language': 'Language',
    's.languageHint': 'The whole interface switches language. The Quran text and the tafsir always stay in Arabic, exactly as published.',
    's.theme': 'Theme',
    's.accent': 'Accent colour',
    's.customColor': 'Custom colour',
    's.glassWidgets': 'Widget opacity',
    's.glassWindows': 'Full-window opacity',
    's.glassHint': '0% is fully see-through glass, 100% is solid. "Full windows" are the tafsir, settings and task-details windows.',
    's.radius': 'Corner radius',
    's.numerals': 'Numerals',
    's.fonts': 'Text size',
    's.fontsHint': 'Each widget and window has its own text size. You can also make it larger or smaller from the right-click menu on a widget.',
    's.f.tafsir': 'Tafsir window',
    's.f.task': 'Task details window',
    's.f.settings': 'Settings window',
    's.widgets': 'Widgets',
    'w.habits': 'Habits Tracker',
    's.size': 'Size',
    's.size.icon': 'Icon',
    's.size.s': 'Small',
    's.size.m': 'Medium',
    's.size.l': 'Large',
    's.onTop': 'Always on top',
    's.autoStart': 'Start with Windows',
    's.resetLayout': 'Re-arrange positions',
    's.moveHint': 'Drag a widget from anywhere to move it, from its bottom corner to resize it, or right-click it for a preset size. Widgets never leave the screen, and they snap to its edges and to each other.',
    's.shortcuts': 'Shortcuts: Ctrl + Alt + W show widgets · Ctrl + Alt + P start/pause timer · Ctrl + Alt + Q new ayah',
    's.todo': 'Tasks',
    's.todoSortBy': 'Sort Tasks By',
    's.todoSortFree': 'Free / Manual (Drag & Drop)',
    's.todoSortDeadline': 'Deadline (Earliest First)',
    's.todoSortPriority': 'Priority (Highest First)',
    's.todoSortTitle': 'Alphabetical (A to Z)',
    's.todoSortCreated': 'Date Added (Newest First)',
    's.todoMoveDoneToBottom': 'Move completed tasks to bottom automatically',
    's.todoMoveDoneToBottomHint': 'When enabled, finished tasks automatically move to the bottom so active tasks stay at the top.',
    's.hideDone': 'Hide finished tasks after',
    's.never': 'Never',
    's.hour1': '1 hour',
    's.hours': '{n} hours',
    's.hoursMany': '{n} hours',
    's.day1': '1 day',
    's.days2': '2 days',
    's.week': '1 week',
    's.todoHint': 'Hidden tasks are kept and still appear in the "Done" view. Each task also has its own setting under its ⋯ button, together with notes, reminders, priority and a due date.',
    's.clock': 'Clock',
    's.clockStyle': 'Face',
    's.ring': 'Ring',
    's.analog': 'Hands',
    's.digital': 'Digits',
    's.hour12': '12-hour clock (AM/PM)',
    's.seconds': 'Show seconds',
    's.clockUltraTransparent': 'Maximum widget transparency',
    's.clockPureTransparent': '100% Pure Transparent Mode (No Background)',
    's.clockPureTransparentHint': 'Completely remove the widget background for floating numbers on screen, or use the normal opacity slider.',
    's.pomodoroPureTransparent': '100% Pure Transparent Mode (No Background)',
    's.pomodoroPureTransparentHint': 'Completely remove the Pomodoro widget background for floating timer digits on desktop.',
    's.clockDefaultTab': 'Default Open Tab',
    's.tabClock': '⏰ Clock',
    's.tabAlarm': '🔔 Alarm',
    's.tabTimer': '⏱️ Timer',
    's.clockAlarmSound': 'Alarm sound chime',
    's.clockSnoozeDuration': 'Default alarm snooze duration',
    's.clockTimerSound': 'Timer completion chime',
    's.clockTimerDefaultSec': 'Default timer duration',
    's.clockDesktopNotify': 'Desktop notifications (Alarm & Timer)',
    's.zones': 'Extra cities',
    's.zonesHint': '(shown when the clock is widened)',
    's.calendar': 'Calendar',
    's.tabCalendar': 'Calendar & Events',
    's.calViewsTitle': 'Calendar Views & Display Modes',
    's.calViewMode': 'Default Calendar View Mode',
    's.calViewMonth': 'Month View (Grid)',
    's.calViewWeek': 'Week View (Columns)',
    's.calViewAgenda': 'Agenda / Schedule View',
    's.calViewModeHint': 'You can also switch quickly between views using the buttons in the calendar toolbar.',
    's.calWeekStart': 'First day of the week',
    's.calSat': 'Saturday',
    's.calSun': 'Sunday',
    's.calMon': 'Monday',
    's.calHijri': 'Show Hijri date on calendar',
    's.calHijriAdjust': 'Hijri date correction (days)',
    's.calStyleTitle': 'Aesthetics, Eye-Comfort & Visual Styling',
    's.calVisualStyle': 'Calendar Visual Style',
    's.calStyleModern': 'Modern Eye-Comfort (Balanced)',
    's.calStyleGlass': 'Crystal Aero Glass (Translucent)',
    's.calStyleClassic': 'Classic Sharp & Crisp',
    's.calVisualStyleHint': 'Controls day cell borders, corner radius, glass blur, and contrast distribution.',
    's.calHighlightWeekend': 'Highlight weekends (Fri & Sat) with soft tint',
    's.calShowRedDot': 'Show bright red dot indicator on days with events or notes',
    's.calShowRedDotHint': 'When enabled, a clear red dot appears under the day number to indicate registered occasions or daily notes.',
    's.calShowDayActions': 'Show quick action micro-buttons (+) and (📝) on day click',
    's.calShowDayActionsHint': 'Clicking any day pops up a sleek micro-menu to add an occasion (+) or daily note (📝) instantly.',
    's.calPopupTheme': 'Popups & Modals Theme',
    's.calPopupThemeDark': 'Sleek Dark Slate',
    's.calPopupThemeWaterglass': 'Liquid Water Glass',
    's.calPopupThemeAcrylic': 'Soft Acrylic Blur',
    's.calPopupThemePureBlack': 'Pure OLED Black',
    's.calPopupThemeMatch': 'Match App Theme',
    's.calPopupThemeHint': 'Controls color and background of occasion window, quick popups, and day notes.',
    's.calPopupRadius': 'Popups Corner Radius',
    's.calPopupRadiusRounded': 'Smooth Rounded (14px)',
    's.calPopupRadiusPill': 'Super Rounded Pill (22px)',
    's.calPopupRadiusCompact': 'Compact Modern (8px)',
    's.calPopupGlow': 'Popups Glow & Shadow',
    's.calPopupGlowRadiant': 'Radiant Accent Glow',
    's.calPopupGlowSubtle': 'Subtle Balanced Shadow',
    's.calPopupGlowFlat': 'Flat Crisp Border',
    's.calSmartTitle': 'Smart Features & Tasks Integration (Google Calendar Synergy)',
    's.calShowTasksOnCalendar': 'Display To-Do & Classroom assignment deadlines on calendar',
    's.calShowTasksHint': 'Shows assignment due dates and tasks as interactive badges alongside occasions.',
    's.calShowHabitsOnCalendar': 'Display daily habits on calendar',
    's.calShowHabitsHint': 'When enabled, shows your active habits as small interactive chips within calendar days (disabled by default for a clean aesthetic).',
    's.calWaSetupBannerTitle': 'Calendar WhatsApp Reminder Settings',
    's.calWaSetupBannerDesc': 'Click here to configure custom WhatsApp templates, greetings, and default reminder timing in the "Setting Up" tab.',
    's.calWaSetupTitle': 'Calendar & Occasions WhatsApp Setup',
    's.calWaEnabled': 'Send Calendar Occasion Reminders via WhatsApp',
    's.calWaEnabledHint': 'Automatically sends WhatsApp messages for birthdays, meetings, conferences, and exams.',
    's.calWaDefaultTiming': 'Default reminder timing for new occasions',
    's.calWaTimingMorningOf': 'Morning of the event (9:00 AM)',
    's.calWaTiming1dBefore': '1 day before (8:00 PM)',
    's.calWaTiming1hBefore': '1 hour before event time',
    's.calWaTimingAtEvent': 'At exact event time',
    's.calWaOverrideRecipient': 'Override recipient for calendar alerts (Optional)',
    's.calWaOverrideRecipientPh': 'e.g. 2010xxxxxxxx or Group ID (Empty = Global settings)',
    's.calWaOverrideRecipientHint': 'If left empty, alerts are sent to the numbers/group configured in main WhatsApp setup above.',
    's.calWaTemplate': 'Calendar WhatsApp Message Template',
    's.calWaTemplatePh': 'Write your custom template here, or pick a preset above...',
    's.calWaPresetGreeting': '🎉 Cheerful Greeting',
    's.calWaPresetFormal': '💼 Business / Formal',
    's.calWaPresetBrief': '📌 Brief Reminder',
    's.calTagTitle': 'Event Title',
    's.calTagDate': 'Date',
    's.calTagTime': 'Time',
    's.calTagCategory': 'Category',
    's.calTagNotes': 'Notes',
    's.calTagCountdown': 'Countdown',
    's.calWaPreviewTitle': 'Live WhatsApp Message Preview:',
    's.calWaSendTest': 'Send Test Calendar WhatsApp Message Now',
    's.calWaDispatcherHint': 'The 24/7 Reliable Dispatcher guarantees alerts are delivered even when widgets are closed or after computer sleep.',
    's.calWaTestSuccess': 'Test calendar message sent successfully! 🚀',
    's.calWaTestFailed': 'Failed to send test message: ',
    's.enableClockWidget': 'Enable Clock & Prayer Times Widget',
    's.enablePomodoroWidget': 'Enable Focus Timer & Pomodoro Widget',
    's.enableCalendarWidget': 'Enable Calendar & Events Widget',
    's.enableHabitsWidget': 'Enable Habits & Wellness Widget',
    's.enableQuranWidget': 'Enable Ayah & Hadith (Quran) Widget',
    's.enableTodoWidget': 'Enable Tasks & To-Do List Widget',
    's.enableNotesWidget': 'Enable Quick Notes Widget',
    's.enableEmailWidget': 'Enable Email Widget',
    's.enablePhotoWidget': 'Enable Photo Frame Widget',
    's.tabHabits': 'Habits & Wellness',
    's.habitsStyleTitle': 'Appearance & Bullet Journal Display',
    's.habitsEnabled': 'Enable Habits & Wellness Widget',
    's.habitsTheme': 'Widget Theme Style',
    's.habitsThemeMatch': '✨ Match App Theme (Follow Global)',
    's.habitsDefaultView': 'Default Widget View',
    's.habitsWeekStart': 'First Day of Week',
    's.habitsGridDotStyle': 'Progress Dots Style',
    's.habitsShowDailyTotals': 'Show daily completion totals row at bottom of matrix',
    's.habitsShowDailyTotalsHint': 'Displays the total number of habits completed on each day of the month.',
    's.habitsShowStreak': 'Show Streak Counter & Flame Level',
    's.habitsShowStrength': 'Show Habit Strength & Stability %',
    's.habitsShowUrgency': 'Show Urgency & Overdue Badges (⚠️ %)',
    's.habitsShowUrgencyHint': 'Displays urgency percentage and overdue warnings to prevent streak breaks and guilt.',
    's.habitsShowProgressBar': 'Show Daily Progress Bar/Ring at top of widget',
    's.habitsShowMiniStrip': 'Show 7-Day Matrix Strip',
    's.habitsShowRoutineFilters': 'Show Routine Period Chips (Morning/Evening/Work)',
    's.habitsShowFooterCheckin': 'Show Quick Sleep & Mood Check-in Bar',
    's.habitsShowQuickJournal': 'Show Quick Micro-Journal Button',
    's.habitsShowQuickJournalHint': 'Displays a small button in the widget header to write and record your daily reflection immediately.',
    's.habitsPsychologyTitle': 'Habit Psychology & Micro-Interactions',
    's.habitsSoundEffects': 'Instant Completion Audio Chime',
    's.habitsSoundEffectsHint': 'A gentle, satisfying chime upon completing a habit to boost dopamine and adherence.',
    's.habitsConfettiCelebration': 'Celebration Particle Sparkles & Confetti',
    's.habitsConfettiCelebrationHint': 'Triggers a delightful burst of confetti sparkles when a habit is completed or 100% is reached.',
    's.habitsProgressRingStyle': 'Daily Progress Indicator Style',
    's.habitsProgressGradient': 'Luminous Gradient Bar',
    's.habitsProgressCircular': 'Glowing Bento Circular Ring',
    's.habitsSmartRoutineAnchor': 'Smart Time-of-Day Routine Anchoring',
    's.habitsSmartRoutineAnchorHint': 'Automatically highlights Morning routine in the morning and Evening at night to minimize friction.',
    's.habitsDailyMotivationalQuote': 'Daily Habit Psychology & Mindset Spark',
    's.habitsDailyMotivationalQuoteHint': 'A daily bite-sized mindset quote grounded in habit formation science.',
    's.habitsGamificationTitle': 'Gamification & Hero Levels System',
    's.habitsGamificationEnabled': 'Enable Gamification & Hero Levels System',
    's.habitsGamificationHint': 'When disabled, hides XP points, HP health bar, and hero levels, focusing solely on pure habit tracking.',
    's.habitsShowPomodoroShortcut': 'Show Pomodoro Focus Button on Habit Cards',
    's.habitsShowPomodoroHint': 'Displays quick focus button (⏱️) on habits that have Pomodoro enabled in their settings.',
    's.habitsStreaksTitle': 'Smart Streaks & Flexible Days (Skip Logic)',
    's.habitsForgivingStreak': 'Smart Forgiving Streak (Loop Tracker Algorithm)',
    's.habitsForgivingStreakHint': 'Measures true habit strength using exponential moving average and prevents losing months of progress upon 1 missed day.',
    's.habitsGraceDays': 'Allowed Weekly Rest Days (Grace Days)',
    's.habitsSleepMoodTitle': 'Sleep & Mood Lab & Biomarkers',
    's.habitsSleepTargetHours': 'Target Healthy Sleep Duration',
    's.habitsSleepWarningMin': 'Sleep Deprivation Danger Threshold',
    's.habitsTargetBedtime': 'Target Bedtime (Sleep Onset)',
    's.habitsTargetWakeTime': 'Target Wake-Up Time',
    's.habitsMoodScaleType': 'Mood Scale Rating Type',
    's.habitsTrackStress': 'Track daily stress curve and physical symptoms',
    's.habitsTrackScreenTime': 'Track screen hours and correlate with sleep quality',
    's.habitsIntegrationTitle': 'Smart Integrations (To-Do & Calendar)',
    's.habitsSyncToTodo': 'Show today habits as tasks in To-Do widget & sync completion',
    's.habitsSyncToTodoHint': 'Checking off a habit in To-Do marks it done in Habits widget and vice-versa.',
    's.habitsSyncToCalendar': 'Display habit indicators and mood icons on Calendar days',
    's.habitsWaTitle': 'Smart WhatsApp Intelligence Reports',
    's.habitsWaEveningPrompt': 'Send daily evening check-in prompt via WhatsApp',
    's.habitsWaEveningTime': 'Evening check-in reminder time',
    's.habitsWaWeeklyDigest': 'Send weekly progress digest at end of week',
    's.habitsWaMonthlyReport': 'Send comprehensive executive report at end of month',
    's.habitsWaRecipientOverride': 'Override WhatsApp recipient (Optional)',
    's.habitsWaReportLang': 'WhatsApp Intelligence Reports Language',
    's.weekStart': 'First day of the week',
    's.hijri': 'Show the Hijri date',
    's.hijriAdjust': 'Hijri date correction',
    's.adj-2': '− 2 days',
    's.adj-1': '− 1 day',
    's.adj0': 'No correction',
    's.adj1': '+ 1 day',
    's.adj2': '+ 2 days',
    's.hijriNote': 'Today: {date} — from the system Umm al-Qura calendar. If the local announcement of the month differs, correct it by a day.',
    's.calEventsWaEnabled': 'Send Calendar Events Reminders via WhatsApp',
    's.calEventsWaHint': 'Automatically dispatch WhatsApp reminder messages for occasions and events registered in the Calendar.',
    's.pomodoro': 'Focus timer (Pomodoro)',
    's.pLabel': 'Session name',
    's.pFocus': 'Focus length',
    's.pShort': 'Short break',
    's.pLong': 'Long break',
    's.pEvery': 'Long break after',
    's.minutes': 'min',
    's.sessions': 'sessions',
    's.pAutoBreaks': 'Start breaks automatically',
    's.pAutoFocus': 'Start focus automatically after a break',
    's.pSound': 'Chime when a phase ends',
    's.pNotify': 'Windows notification when a phase ends',
    's.pVolume': 'Volume',
    's.pHint': 'The timer keeps running in the background even if the widget is hidden, and keeps the right time after the computer sleeps.',
    's.quran': 'Ayah & tafsir',
    's.interval': 'Show a new ayah every',
    's.everyHours': '{n} hours',
    's.everyHour': 'hour',
    's.everyHoursMany': '{n} hours',
    's.tafsir': 'Tafsir',
    's.showTr': 'Show an English translation of the meaning',
    's.translation': 'Translation',
    's.quranArabic': 'The ayah and the tafsir are always shown in Arabic exactly as the source published them, in both the Arabic and the English interface.',
    's.prefetch': 'Prepare ayat for offline use',
    's.preparing': 'Preparing…',
    's.prepared': 'Saved: {ayat} ayat, {tafsir} tafsir entries',
    's.prepareFailed': 'Could not prepare — check the connection',
    's.resetAll': 'Restore default settings',
    's.confirm': 'Press again to confirm',
    's.resetDone': 'Restored',
    's.srcText': 'Ayah text',
    's.srcVerify': 'Verification',
    's.srcVerifyVal': 'Every ayah is matched against {name} before it is shown',
    's.srcTafsir': 'Tafsir',
    's.srcTafsirVal': '{n} tafsir works available',
    's.th.glass': 'Glass',
    's.th.waterglass': 'Water Glass',
    's.th.smoke': 'Smoke',
    's.th.midnight': 'Midnight',
    's.th.daylight': 'Daylight',
    's.th.sand': 'Sand',
    's.th.aurora': 'Aurora Glass',
    's.th.cyber': 'Cyber Neon',
    's.th.oled': 'OLED Deep Black',
    's.th.notebook': 'Lined Notebook',
    's.emailReadAction': 'Read emails behavior',
    's.emailReadKeep': 'Keep in list (Normal)',
    's.emailReadDim': 'Dim read emails',
    's.emailReadHide': 'Hide read emails automatically',
    's.size.icon': 'Icon',
    's.size.xs': 'Extra small',
    's.size.xl': 'Extra large',
    's.size.wide': 'Wide banner',
    's.size.tall': 'Tall tower',
    's.size.max': 'Expanded max',
    's.width': 'Width',
    's.height': 'Height',
    's.lockTitle': 'Lock position and size',
    's.f.hadith': 'Hadith window',
    's.fontsFamily': 'Fonts',
    's.fontUi': 'Interface font',
    's.fontRead': 'Reading font (hadith & tafsir)',
    's.fontQuran': 'Quran font (ayah text)',
    's.fontNum': 'Numerals font (clock, timer, calendar)',
    's.fontColor': 'Font color',
    's.fontColorDefault': 'Auto (Theme default)',
    's.fontColorHint': 'Change font color for all widgets or choose a specific widget to customize its color independently.',
    's.uiWeight': 'Interface weight',
    's.w300': 'Light',
    's.w400': 'Regular',
    's.w500': 'Medium',
    's.w600': 'Semibold',
    's.numWeight': 'Numerals weight',
    's.numSpacing': 'Numerals spacing',
    's.lineHeight': 'Line spacing',
    's.fontsHint2': 'A font changes only how letters are drawn; the ayah and hadith text stay exactly as the source published them.',
    's.look': 'Glass & motion',
    's.tint': 'Glass tint',
    's.tintNone': 'No tint',
    's.tintStrength': 'Tint strength',
    's.edge': 'Rim highlight',
    's.borderWidth': 'Widget border',
    's.bw0': 'None',
    's.bw1': 'Thin',
    's.bw2': 'Strong',
    's.hover': 'Hover glow',
    's.sheenRadius': 'Pointer Halo Radius',
    's.motion': 'Motion',
    's.motionOff': 'No motion',
    's.motionSlow': 'Calm',
    's.motionNormal': 'Normal',
    's.motionFast': 'Quick',
    's.density': 'Inner spacing',
    's.dCompact': 'Compact',
    's.dNormal': 'Normal',
    's.dRoomy': 'Roomy',
    's.contrast': 'Text contrast',
    's.cNormal': 'Normal',
    's.cHigh': 'High',
    's.grain': 'Fine glass grain',
    's.inspiration': 'What the widget shows',
    's.insQuran': 'Ayah & tafsir',
    's.insHadith': 'Hadith & explanation',
    's.insAlternate': 'Alternate',
    's.hadithHint': 'Hadith and their explanations come from the Encyclopedia of Translated Prophetic Hadiths (HadeethEnc). A hadith is shown only if it is graded authentic (sahih) or good (hasan), and its wording is found at the cited number in Bukhari, Muslim or the four Sunan in an independent copy of the collections; Sunan hadith must also be graded sound by that collection\'s scholars. The text and explanation are shown exactly as published.',
    's.prefetchHadith': 'Prepare hadith for offline use',
    's.preparedHadith': 'Saved and verified: {n} hadith',
    's.srcHadith': 'Hadith',
    's.srcHadithVal': 'HadeethEnc, each hadith matched against the hadith collections',
    's.email': 'Email',
    's.emailEnabled': 'Enable Email Widget',
    's.emailProvider': 'Email Provider',
    's.emailUser': 'Email Address',
    's.emailPass': 'Password / App Password',
    's.emailCustom': 'Custom IMAP',
    's.emailHost': 'IMAP Server Host',
    's.emailPort': 'Port',
    's.emailSecure': 'Encrypted Connection (SSL/TLS)',
    's.emailInterval': 'Check Interval',
    's.emailNotify': 'Notify immediately when email arrives',
    's.emailSound': 'Sound alert with notification',
    's.emailTest': 'Test Connection',
    's.emailTesting': 'Connecting to server…',
    's.emailSuccess': 'Connected successfully! ({count} emails in inbox)',
    's.emailHint': 'For Gmail, Yahoo, or Outlook, generating an App Password from your account security settings is required.',
    's.emailAppPassHelp': '🔑 For Google accounts: Click here to generate an App Password',
    's.photo': 'Selected Photo',
    'photo.pick': 'Choose Photo',
    's.photoMode': 'Photo Mode',
    's.photoSingle': 'Single Photo',
    's.photoFolderMode': 'Folder Slideshow',
    's.photoFile': 'Photo File',
    's.photoPickFile': 'Choose photo…',
    's.photoFolder': 'Photos Folder',
    's.photoPickFolder': 'Choose folder…',
    's.photoInterval': 'Switch Interval',
    's.photoFit': 'Image Fit Mode',
    's.photoFitCover': 'Fill Window (Cover)',
    's.photoFitContain': 'Fit Inside (Contain)',
    's.photoFitCenter': 'Center (Original size)',
    's.photoShowCaption': 'Show photo name',
    's.photoZoom': 'Photo Zoom',
    's.photoPosX': 'Horizontal Position (X)',
    's.photoPosY': 'Vertical Position (Y)',
    's.photoRotate': 'Rotation Angle',
    's.photoBrightness': 'Brightness',
    's.photoContrast': 'Contrast',
    's.photoGrayscale': 'Black & White',
    's.photoShape': 'Frame Shape',
    's.photoShapeRounded': 'Natural (Rounded)',
    's.photoShapeSoft': 'Soft Rounded',
    's.photoShapeCircle': 'Circle / Oval',
    's.photoShapeSquare': 'Sharp Corners',
    's.photoResetAdjust': 'Reset Photo Adjustments',
    's.f.email': 'Email widget',
    's.f.photo': 'Photo widget',

    's.classroom': 'Google Classroom',
    's.crTitle': 'Google Classroom',
    's.crEnabled': 'Enable Google Classroom sync',
    's.crClientId': 'Client ID',
    's.crClientSecret': 'Client Secret',
    's.crLogin': 'Sign in & link account',
    's.crSync': 'Sync assignments now',
    's.crIcal': 'Classroom calendar URL (optional iCal)',
    's.crIcalHint': 'You can paste your Google Calendar iCal feed URL for immediate sync without cloud credentials.',
    's.crPreventDone': 'Lock completion until turned in',
    's.crPreventDoneHint': 'Prevents checking off an assignment locally until it has actually been turned in on Google Classroom.',
    's.crShowSubmissionBadge': 'Show submission status badge (Not Turned In)',
    's.crShowSubmissionBadgeHint': 'Displays a status chip indicating whether the assignment has been turned in on Classroom.',
    's.crShowCourseBadge': 'Show course name badge (📚)',
    's.crShowLinkBtn': 'Show direct link button (🔗) on task card',
    's.crCourseInTitle': 'Include course name in task title text',
    's.crCourseInTitleHint': 'When disabled, displays clean assignment titles without long bracketed course prefixes.',
    's.crShowNotificationsBtn': 'Show Classroom notifications button in widget',
    's.crShowNotificationsBtnHint': 'Toggle the Classroom notification bell button on the To-Do widget header.',
    's.crFilterHiddenCourses': 'Auto-hide selected Classroom courses',
    's.crFilterHiddenCoursesHint': 'When enabled, assignments from all selected courses below are automatically hidden from tasks, WhatsApp alerts, and urgent reminders.',
    's.crAutoCoursesTitle': 'Enrolled Courses List (Hide / Show)',
    's.crAutoCoursesHint': 'Turn ON the switch next to any course to mark it as hidden, or turn OFF to keep it visible in tasks.',
    's.crAutoCoursesLoading': 'Automatically syncing enrolled courses from Google Classroom…',
    's.crAutoCoursesEmpty': 'No enrolled courses found in this Google Classroom account.',
    's.crCourseHiddenBadge': 'Hidden',
    's.crCourseVisibleBadge': 'Visible',
    's.crFilterActive': 'Active: hiding',
    's.crMarkedHidden': 'selected to hide out of',
    's.crOf': 'of',
    's.crHiddenCoursesTitle': 'Hidden / Excluded Courses',
    's.crHiddenCoursesHint': 'Tasks from excluded courses will be completely purged and hidden from the widget, search, WhatsApp alerts, and urgent reminders.',
    's.crAddHiddenCoursePh': 'Type course name or ID to hide...',
    's.crAddHiddenCourseBtn': 'Hide',
    's.crFetchCoursesBtn': 'Fetch Courses 🔄',
    's.crNoHiddenCourses': 'No hidden courses (all enrolled courses are visible).',
    's.crUserEmail': 'Google Classroom Linked Email',
    's.crUserEmailHint': 'When opening assignments, redirects directly using this Google account to avoid switching accounts in browser.',
    's.emailOpenInWindow': 'Open emails in dedicated popup window (like Tafsir)',
    's.emailOpenInWindowHint': 'Automatically opens selected email in a spacious dedicated floating window for maximum readability.',
    's.crSyncing': 'Checking and syncing assignments…',
    's.crSyncSuccess': 'Synced successfully ({added} added, {updated} updated)',
    's.crSyncEmpty': 'No new assignments found',

    's.superurgent': 'Super Urgent Mode',
    's.suTitle': 'Super Urgent Mode',
    's.suEnabled': 'Enable Super Urgent mode for due tasks',
    's.suHours': 'Trigger urgency before deadline by',
    's.suHour1': '1 hour',
    's.suHours2': '2 hours',
    's.suHours3': '3 hours (recommended)',
    's.suHours4': '4 hours',
    's.suHours6': '6 hours',
    's.suInterval': 'Desktop notification interval',
    's.suMins10': 'Every 10 minutes',
    's.suMins15': 'Every 15 minutes',
    's.suMins30': 'Every 30 minutes',
    's.suHint': 'The task card glows deep red with recurring audio-visual alerts until the assignment is submitted.',

    's.whatsapp': 'WhatsApp Alerts',
    's.waTitle': 'WhatsApp Alerts',
    's.waEnabled': 'Enable WhatsApp notifications',
    's.waProvider': 'Connection Provider',
    's.waProvOpenWa': 'Local OpenWA Server (Stable, Fast, Native)',
    's.waProvCallMeBot': 'CallMeBot Cloud Service',
    's.waPhone': 'Recipient Phone Number',
    's.waPhoneHint': 'Enter recipient phone numbers.',
    's.waPhoneNumbers': 'Recipient Phone Numbers',
    's.waAddPhone': 'Add Another Number',
    's.waBrowseGroups': 'Browse Groups',
    's.waGroupsTitle': 'Your WhatsApp Groups:',
    's.waNumbersHint': 'Add phone numbers or group IDs (@g.us) that should receive reminders.',
    's.waSenderName': 'Custom Sender Identity',
    's.waSenderNameHint': 'Sender name or bot title displayed at the top of WhatsApp messages (e.g. Assignment Assistant).',
    's.waIdentityTitle': 'How to display alerts under "Assignment" on your phone?',
    's.waIdentityDesc': 'To display incoming WhatsApp messages under Assignment: either save the bot number in your phone contacts as Assignment, or enable sending to a dedicated WhatsApp group below.',
    's.waSendToGroup': 'Send alerts to WhatsApp Group (Group Chat)',
    's.waGroupId': 'Group JID / ID',
    's.waRoutingTitle': 'WhatsApp Multi-Channel Routing Hub',
    's.waRoutingDesc': 'Direct each feature (Super Urgent, Habits, Calendar) to its own specific phone number or group, or keep default.',
    's.waChanSuperUrgent': '🚨 Super Urgent Tasks',
    's.waChanHabitsReports': '📊 Habits Daily & Weekly Reports',
    's.waChanHabitReminders': '⏰ Individual Habit Reminders (Per-Habit)',
    's.waChanCalendar': '📅 Calendar & Events Alerts',
    's.waChanDefault': '🌐 Global Default Recipient',
    's.waChanCustom': '✏️ Custom Number / Group JID',
    's.waChanSuperUrgentPh': 'Phone number or Group JID (e.g. 2010xxxx or 120363@g.us)',
    's.waChanHabitsReportsPh': 'Phone number or Group JID for habit reports',
    's.waChanHabitRemindersPh': 'Phone number or Group JID for individual habit alerts',
    's.waChanHabitRemindersHint': 'You can also set custom recipients per individual habit inside the habit editor.',
    's.waHabitScopeAll': '👥 All Habits',
    's.waHabitScopeSpecific': '🎯 Specific Habit',
    's.waHabitsAllRecipLabel': 'All Habits Reminder Recipient:',
    's.waPickHabit': 'Select a habit to customize recipient:',
    's.waHabitItemDefault': '🌐 Global Default Recipient',
    's.waHabitItemCustom': '✏️ Custom Number / Group for this habit',
    's.waHabitItemCustomPh': 'Phone number (e.g. 2010xxxx) or Group JID (120363@g.us)',
    's.waHabitTestSend': 'Send Test Reminder',
    's.waCurrentHabitsList': '📋 Current Habits List:',
    's.waNoHabitsFound': 'No habits added yet. You can add habits from the Habits widget.',
    's.waHabitSaved': '✓ Saved for habit',
    's.waHabitReminderOff': 'Disabled',
    's.waChanCalendarPh': 'Phone number or Group JID for calendar alerts',
    's.waSenderNamePh': 'e.g. Assignment or Task Assistant',
    's.waBrowseGroupsTitle': 'Browse and auto-select your WhatsApp groups',
    's.waRefreshGroups': '🔄 Refresh',
    's.waGroupsPrompt': 'Click Browse Groups to fetch from WhatsApp…',
    's.waGroupsLoading': 'Fetching groups from WhatsApp…',
    's.waGroupsEmpty': 'No groups found or gateway is not connected.',
    's.waAddGroupBtn': '+ Add',
    's.waAddGroupTitle': 'Add this group to recipient list',
    's.waDelPhoneTitle': 'Remove this number',
    's.waPresets': 'Presets:',
    's.waPresetQuick': '⚡ Quick Alert',
    's.waPresetDetailed': '📋 Detailed Report',
    's.waPresetFormal': '🎯 Formal Assignment',
    's.waInsertTag': 'Click to insert tag:',
    's.waTagTaskTitle': 'Task',
    's.waTagCourseName': 'Course',
    's.waTagDeadline': 'Deadline',
    's.waTagTimeLeft': 'Time Left',
    's.waTagPriority': 'Priority',
    's.waTagLink': 'Link',
    's.waTagSenderName': 'Sender',
    's.waTagTaskTitleTitle': 'Assignment or task title',
    's.waTagCourseNameTitle': 'Course / Subject name',
    's.waTagDeadlineTitle': 'Final due date and time',
    's.waTagTimeLeftTitle': 'Time remaining before deadline',
    's.waTagPriorityTitle': 'Urgency and priority level',
    's.waTagLinkTitle': 'Direct link to open task in browser',
    's.waTagSenderNameTitle': 'Sender identity or bot name',
    's.waTemplate': 'Custom message template',
    's.waTemplatePlaceholder': 'Write message template here or choose a preset…',
    's.waPreviewBadge': 'Live WhatsApp Preview',
    's.waTemplateHint': 'Variables: {taskTitle}, {courseName}, {deadline}, {timeLeft}, {priority}, {link}, {senderName}.',
    's.waApiKey': 'API Key',
    's.waServerTitle': 'Local OpenWA Gateway',
    's.waServerDesc': 'Runs locally and lightweight on your PC without external third-party bots or subscription fees.',
    's.waStartServer': 'Start Gateway',
    's.waStopServer': 'Stop Gateway',
    's.waScanBrowser': 'Open QR in Browser',
    's.waRefreshStatus': 'Refresh Status',
    's.waAutoStart': 'Start gateway automatically on app launch',
    's.waGatewayUrl': 'OpenWA Gateway URL',
    's.waSessionId': 'Session ID',
    's.waFrequency': 'WhatsApp message interval',
    's.waFreqOnce': 'Once only',
    's.waFreq15': 'Every 15 minutes',
    's.waFreq30': 'Every 30 minutes',
    's.waFreq60': 'Every hour',
    's.waTestBtn': 'Send Test WhatsApp Message',
    's.waTesting': 'Sending test message…',
    's.waTestOk': 'Message sent successfully!',
    's.waTestFail': 'Failed to send: {err}',
    's.waScanPrompt': 'Scan this QR code to link WhatsApp:',
    's.waScanHelp': 'Open WhatsApp on your phone > Linked Devices > Link a device and point your camera.',
    's.waCallMeBotDesc': 'Uses a public cloud bot; responses may be delayed or rate-limited during peak hours.',
    's.waBotChat1': 'Primary Bot Chat',
    's.waBotChat2': 'Backup Bot Chat',
    's.waOfficialHelp': 'Official Setup Guide',
    's.waFooterHint': 'High priority deadline alerts will be delivered straight to your WhatsApp before assignments are due.',
    's.waStatusStopped': 'Gateway stopped',
    's.waStatusConnected': 'Connected to WhatsApp',
    's.waStatusScan': 'Waiting for QR scan',
    's.waStatusStarting': 'Starting gateway…',
    's.waStatusChecking': 'Checking…',
    's.waStatusError': 'Disconnected',
    'photo.pick': 'Choose Photo',
    's.searchPh': 'Search settings... (e.g. theme, font, WhatsApp, Classroom, Email)',
    's.clearSearch': 'Clear search',
    's.scopeGlobal': '🌐 Global Default',
    's.fontWeightSummary': '🔤 Customize font weights & number letter spacing',
    's.visualEffectsSummary': '✨ Advanced visual effects (rim reflections, light caustics, grain & contrast)',
    's.widgetAppearanceSummary': '🎨 Custom styling & fonts for this widget',
    's.folderPreviewLabel': 'Live Box Preview',
    's.folderPreviewTitle': 'Widgets Folder',
    's.folderBorderRadiusTitle': '📐 Border Radius & Shape',
    's.folderRadiusLabel': 'Corner Curvature (Radius):',
    's.folderRadius14': 'Soft Rounded (14px)',
    's.folderRadius24': 'Balanced Squircle (24px - Default)',
    's.folderRadius32': 'Deep Rounded (32px)',
    's.folderRadius42': 'Circular Capsule (42px)',
    's.folderRadiusHint': 'Controls corner radius on desktop to prevent visual artifacts and match your personal preference.',
    's.folderGlassTitle': '✨ Frosted Glass & Border Texture',
    's.folderBlurLabel': 'Blur & Frosting Strength:',
    's.folderOpacityLabel': 'Glass Opacity & Tint:',
    's.folderBorderWidthLabel': 'Border Line Width:',
    's.folderBorderOpacityLabel': 'Rim Highlight & Glow:',
    's.folderDynamicsTitle': '⚡ Dynamics, Collision Protection & Grid',
    's.folderCollisionLabel': 'Collision Avoidance (Prevent Overlap):',
    's.folderCollisionHint': 'Prevents folders from colliding or dropping on top of each other, maintaining a 16px safety gap.',
    's.folderCompactTitlesLabel': 'Show widget text labels in compact folder:',
    's.folderCompactTitlesHint': 'Disabled by default to keep a clean, sleek squircle icon grid. Enable if you prefer text labels under icons.',
    's.folderDragGlowLabel': 'Pulse glow & absorption ripple on drag:',
    's.btnResetFolderSettings': 'Reset Folder to Defaults ↺',
    's.habitsPerHabitTitle': '⏰ Individual Habit Reminders via WhatsApp',
    's.habitsCustomAlerts': 'Custom Reminders',
    's.habitsPerHabitHint': 'Configure an independent scheduled WhatsApp reminder for each habit, with dedicated recipient and text.',
    's.habitsOpenManagerBtn': 'Open Habit Manager & Reminders',
    's.habitsWaRecipientOverridePh': 'e.g. 2010xxxxxxxx or leave empty for default',
    's.langArabic': 'Arabic (العربية)',
    's.langEnglish': 'English (الإنجليزية)',
    's.crToggleCoursesTitle': 'Expand / collapse courses list',
    's.setupHelpTitle': 'Setup guide and detailed instructions',
    's.browserDetecting': 'Detecting Chrome profiles...',
    's.ecoChecking': '⚡ Checking power...',
    's.ecoScopeGlobalHint': 'Modifying global default battery saver setting for the entire app.',
  },
});

const en = () => lang() === 'en';

let s = {};
let sources = null;
let catalog = {};

const WIDGET_ORDER = ['clock', 'pomodoro', 'calendar', 'habits', 'quran', 'todo', 'notes', 'email', 'photo'];
const FONT_ITEMS = [...WIDGET_ORDER, 'tafsir', 'hadith', 'task', 'settings'];

// Font choices; each card previews itself in its own face.
const FONT_CHOICES = {
  fontUi: [
    ['plex', 'IBM Plex', "'IBM Plex Sans Arabic'"], ['cairo', 'Cairo', "'Cairo'"], ['tajawal', 'Tajawal', "'Tajawal'"],
    ['almarai', 'Almarai', "'Almarai'"], ['readex', 'Readex Pro', "'Readex Pro'"], ['kufi', 'Noto Kufi', "'Noto Kufi Arabic'"],
    ['messiri', 'El Messiri', "'El Messiri'"], ['naskh', 'Noto Naskh', "'Noto Naskh Arabic'"], ['system', 'Segoe UI', "'Segoe UI'"],
  ],
  fontRead: [
    ['naskh', 'Noto Naskh', "'Noto Naskh Arabic'"], ['amiri', 'Amiri', "'Amiri'"], ['scheherazade', 'Scheherazade', "'Scheherazade New'"],
    ['plex', 'IBM Plex', "'IBM Plex Sans Arabic'"], ['cairo', 'Cairo', "'Cairo'"], ['tajawal', 'Tajawal', "'Tajawal'"],
    ['readex', 'Readex Pro', "'Readex Pro'"], ['kufi', 'Noto Kufi', "'Noto Kufi Arabic'"],
  ],
  fontQuran: [
    ['amiri-quran', 'Amiri Quran', "'Amiri Quran'"], ['scheherazade', 'Scheherazade', "'Scheherazade New'"],
    ['amiri', 'Amiri', "'Amiri'"], ['naskh', 'Noto Naskh', "'Noto Naskh Arabic'"],
  ],
  fontNum: [
    ['plex', 'IBM Plex', "'IBM Plex Sans Arabic'"], ['outfit', 'Outfit', "'Outfit'"], ['readex', 'Readex Pro', "'Readex Pro'"],
    ['cairo', 'Cairo', "'Cairo'"], ['kufi', 'Noto Kufi', "'Noto Kufi Arabic'"], ['tajawal', 'Tajawal', "'Tajawal'"],
    ['system', 'Segoe UI', "'Segoe UI'"],
  ],
};
const SAMPLES = {
  get fontUi() { return en() ? 'Aa Bb 123' : 'أبجد هوز Aa'; },
  get fontRead() { return en() ? 'Reading Text' : 'حُسنُ الخُلُق'; },
  get fontQuran() { return 'أَبْجَدْ هَوَّزْ'; },
  get fontNum() { return '12:45'; },
};
const TINTS = ['', '#7FB2E5', '#8FD3C1', '#F2C27B', '#E8A0B4', '#B7A6E8', '#2B3A55', '#FFFFFF'];
const LOOK_DEFAULTS = {
  fontUi: 'plex', fontRead: 'naskh', fontQuran: 'amiri-quran', fontNum: 'plex',
  uiWeight: 400, numWeight: 300, numSpacing: -0.02, lineHeight: 1,
  density: 'normal', edge: 1, borderWidth: 1, grain: true, hover: 1, motion: 1,
  tint: '', tintStrength: 0.25, contrast: 'normal', sheenRadius: 240,
  fontColor: 'inherit',
};
const THEMES = ['glass', 'waterglass', 'smoke', 'midnight', 'daylight', 'sand', 'aurora', 'cyber', 'oled', 'notebook'];
const HIDE_CHOICES = [0, 1, 3, 6, 12, 24, 48, 168];
const INTERVALS = [1, 3, 4, 6, 8, 12, 24];

// Vivid, curated Apple/macOS-inspired rich accent palettes
const ACCENTS = [
  '#2563EB', '#0284C7', '#059669', '#10B981',
  '#D97706', '#EA580C', '#E11D48', '#C026D3',
  '#7C3AED', '#4F46E5', '#475569', '#3E7CBE',
];

// Rich typography font colors (presets + custom color picker + inherit/auto chip)
const FONT_COLORS = [
  '#000000', '#111827', '#374151', '#64748B',
  '#FFFFFF', '#F1F5F9', '#FEF3C7',
  '#F59E0B', '#10B981', '#06B6D4',
  '#38BDF8', '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444',
];

const push = debounce(async (patch) => {
  s = await window.widgets.settings.set(patch);
  applySettings(s);
}, 90);

/** Update locally first so the window itself reacts without waiting. */
function set(patch, { immediate = false } = {}) {
  Object.assign(s, patch);
  applySettings(s);
  if (immediate) {
    window.widgets.settings.set(patch).then((next) => { s = next; applySettings(s); });
  } else {
    push(patch);
  }
}

function setGroup(key, patch) {
  s[key] = { ...(s[key] || {}), ...patch };
  set({ [key]: { ...s[key] } }, { immediate: true });
}

const pct = (v) => `${digits(v)}%`;

/* ---------- appearance scope state & helpers ---------- */

let currentScope = 'global';

const PARENT_WIDGET = {
  'habits-dashboard': 'habits',
  'task': 'todo',
  'event': 'calendar',
  'email-view': 'email',
  'tafsir': 'quran',
  'hadith': 'quran',
};

function getScopedStyles(scope = currentScope) {
  if (scope === 'global') return null;
  const parent = PARENT_WIDGET[scope];
  return Object.assign({}, (parent ? s.widgetStyles?.[parent] : null) || {}, s.widgetStyles?.[scope] || {});
}

function getEffectiveTheme(scope = currentScope) {
  if (scope === 'global') return s.theme || 'glass';
  const parent = PARENT_WIDGET[scope];
  return s.widgetStyles?.[scope]?.theme || (parent && s.widgetStyles?.[parent]?.theme) || s.theme || 'glass';
}

function getEffectiveAccent(scope = currentScope) {
  if (scope === 'global') return s.accent || '#3E7CBE';
  const parent = PARENT_WIDGET[scope];
  return s.widgetStyles?.[scope]?.accent || (parent && s.widgetStyles?.[parent]?.accent) || s.accent || '#3E7CBE';
}

function getEffectiveRadius(scope = currentScope) {
  if (scope === 'global') return s.radius ?? 22;
  const parent = PARENT_WIDGET[scope];
  const r = s.widgetStyles?.[scope]?.radius ?? (parent ? s.widgetStyles?.[parent]?.radius : undefined);
  return (r !== undefined && r !== null && r !== 'inherit') ? Number(r) : (s.radius ?? 22);
}

function getEffectiveGlass(scope = currentScope) {
  if (scope === 'global') {
    return s.glass?.widgets ?? 0.12;
  }
  const parent = PARENT_WIDGET[scope];
  const ws = s.widgetStyles?.[scope] || (parent ? s.widgetStyles?.[parent] : null);
  if (ws && ws.glass !== undefined && ws.glass !== null && ws.glass !== 'inherit') {
    return Number(ws.glass);
  }
  const FULL_WINDOWS = ['tafsir', 'settings', 'task', 'hadith', 'email-view', 'habits-dashboard', 'event'];
  if (FULL_WINDOWS.includes(scope)) {
    return s.glass?.windows ?? 0.75;
  }
  return s.glass?.widgets ?? 0.12;
}

function getEffectiveScale(scope = currentScope) {
  if (scope === 'global') return 1;
  const parent = PARENT_WIDGET[scope];
  const ws = s.widgetStyles?.[scope] || (parent ? s.widgetStyles?.[parent] : null);
  if (ws && ws.fontScale !== undefined && ws.fontScale !== null && ws.fontScale !== 'inherit') {
    return Number(ws.fontScale);
  }
  return 1;
}

function getEffectiveFont(key, scope = currentScope) {
  const l = look();
  if (scope === 'global') return l[key] || LOOK_DEFAULTS[key];
  const parent = PARENT_WIDGET[scope];
  const ws = s.widgetStyles?.[scope] || (parent ? s.widgetStyles?.[parent] : null);
  if (ws && ws[key] && ws[key] !== 'inherit') {
    return ws[key];
  }
  return l[key] || LOOK_DEFAULTS[key];
}

function getEffectiveLookProp(key, scope = currentScope) {
  const l = look();
  if (scope === 'global') return l[key];
  const parent = PARENT_WIDGET[scope];
  const ws = s.widgetStyles?.[scope] || (parent ? s.widgetStyles?.[parent] : null);
  if (ws && ws[key] !== undefined && ws[key] !== null && ws[key] !== 'inherit') {
    return ws[key];
  }
  return l[key];
}

function getEffectiveFontColor(scope = currentScope) {
  const val = getEffectiveLookProp('fontColor', scope);
  return val || 'inherit';
}

function saveScopedStyle(key, value) {
  if (currentScope === 'global') return;
  s.widgetStyles = s.widgetStyles || {};
  s.widgetStyles[currentScope] = s.widgetStyles[currentScope] || {};
  if (value === 'inherit' || value === undefined || value === null) {
    delete s.widgetStyles[currentScope][key];
    if (Object.keys(s.widgetStyles[currentScope]).length === 0) {
      delete s.widgetStyles[currentScope];
    }
  } else {
    s.widgetStyles[currentScope][key] = value;
  }
  set({ widgetStyles: { ...s.widgetStyles } }, { immediate: true });
}

function syncAppearanceScopeUI() {
  const select = $('#appearanceScopeSelect');
  if (select && select.value !== currentScope) {
    select.value = currentScope;
  }

  const isGlobal = currentScope === 'global';
  const pill = $('#scopeStatusPill');
  const resetBtn = $('#scopeResetBtn');
  const hintText = $('#scopeHintText');
  const glassWidgetsRow = $('#glassWidgetsRow');
  const glassWindowsRow = $('#glassWindowsRow');
  const scopeGlassRow = $('#scopeGlassRow');
  const scopeFontScaleRow = $('#scopeFontScaleRow');

  const curStyle = !isGlobal ? s.widgetStyles?.[currentScope] : null;
  const hasCustom = Boolean(curStyle && Object.keys(curStyle).length > 0);

  if (isGlobal) {
    if (pill) {
      pill.textContent = t('s.scopeStatusGlobal');
      pill.classList.remove('is-custom');
    }
    if (resetBtn) resetBtn.style.display = 'none';
    if (hintText) hintText.textContent = t('s.scopeHintGlobal');
    if (glassWidgetsRow) glassWidgetsRow.style.display = '';
    if (glassWindowsRow) glassWindowsRow.style.display = '';
    if (scopeGlassRow) scopeGlassRow.style.display = 'none';
    if (scopeFontScaleRow) scopeFontScaleRow.style.display = 'none';
  } else {
    let targetName = currentScope;
    if (select) {
      const opt = select.querySelector(`option[value="${currentScope}"]`);
      if (opt) targetName = opt.textContent.trim();
    }

    if (pill) {
      if (hasCustom) {
        pill.textContent = t('s.scopeStatusCustom');
        pill.classList.add('is-custom');
      } else {
        pill.textContent = t('s.scopeStatusInherit');
        pill.classList.remove('is-custom');
      }
    }
    if (resetBtn) {
      resetBtn.style.display = hasCustom ? '' : 'none';
      resetBtn.textContent = t('s.resetToGlobal');
    }
    if (hintText) {
      hintText.textContent = hasCustom
        ? t('s.scopeHintCustom', { name: targetName })
        : t('s.scopeHintInherit');
    }
    if (glassWidgetsRow) glassWidgetsRow.style.display = 'none';
    if (glassWindowsRow) glassWindowsRow.style.display = 'none';
    if (scopeGlassRow) {
      scopeGlassRow.style.display = '';
      const gVal = Math.round(getEffectiveGlass() * 100);
      const input = $('#scopeGlass');
      const out = $('#scopeGlassOut');
      if (input) input.value = String(gVal);
      if (out) out.textContent = pct(gVal);
    }
    if (scopeFontScaleRow) {
      scopeFontScaleRow.style.display = '';
      const scVal = Math.round(getEffectiveScale() * 100);
      const input = $('#scopeFontScale');
      const out = $('#scopeFontScaleOut');
      if (input) input.value = String(scVal);
      if (out) out.textContent = pct(scVal);
    }
  }

  // Pure 100% Transparency option specifically for Clock widget
  const isClock = currentScope === 'clock';
  const scopeClockRow = $('#scopeClockPureTransparentRow');
  const scopeClockHint = $('#scopeClockPureTransparentHint');
  if (scopeClockRow) {
    scopeClockRow.style.display = isClock ? '' : 'none';
    if (isClock) {
      const sw = $('#scopeClockPureTransparent');
      const isUltra = s.clock?.ultraTransparent !== false;
      if (sw) {
        sw.classList.toggle('on', isUltra);
        if (!sw._bound) {
          sw._bound = true;
          sw.onclick = () => {
            const next = !(s.clock?.ultraTransparent !== false);
            setGroup('clock', { ultraTransparent: next });
            sw.classList.toggle('on', next);
            syncAppearanceScopeUI();
            const secSwitch = $('#clockUltraTransparent');
            if (secSwitch) secSwitch.classList.toggle('on', next);
          };
        }
      }
      if (scopeGlassRow) {
        const input = $('#scopeGlass');
        if (input) input.disabled = isUltra;
        scopeGlassRow.style.opacity = isUltra ? '0.45' : '1';
        const out = $('#scopeGlassOut');
        if (out && isUltra) out.textContent = `${pct(Math.round(getEffectiveGlass() * 100))} (100% شفاف)`;
      }
    }
  }
  if (scopeClockHint) {
    scopeClockHint.style.display = isClock ? '' : 'none';
  }

  // Pure 100% Transparency option specifically for Pomodoro widget
  const isPomodoro = currentScope === 'pomodoro';
  const scopePomoRow = $('#scopePomodoroPureTransparentRow');
  const scopePomoHint = $('#scopePomodoroPureTransparentHint');
  if (scopePomoRow) {
    scopePomoRow.style.display = isPomodoro ? '' : 'none';
    if (isPomodoro) {
      const sw = $('#scopePomodoroPureTransparent');
      const isUltra = s.pomodoro?.ultraTransparent === true;
      if (sw) {
        sw.classList.toggle('on', isUltra);
        if (!sw._bound) {
          sw._bound = true;
          sw.onclick = () => {
            const next = !(s.pomodoro?.ultraTransparent === true);
            setGroup('pomodoro', { ultraTransparent: next });
            sw.classList.toggle('on', next);
            syncAppearanceScopeUI();
            const secSwitch = $('#pUltraTransparent');
            if (secSwitch) secSwitch.classList.toggle('on', next);
          };
        }
      }
      if (scopeGlassRow) {
        const input = $('#scopeGlass');
        if (input) input.disabled = isUltra;
        scopeGlassRow.style.opacity = isUltra ? '0.45' : '1';
        const out = $('#scopeGlassOut');
        if (out && isUltra) out.textContent = `${pct(Math.round(getEffectiveGlass() * 100))} (100% شفاف)`;
      }
    }
  }
  if (scopePomoHint) {
    scopePomoHint.style.display = isPomodoro ? '' : 'none';
  }

  if (!isClock && !isPomodoro && scopeGlassRow) {
    const input = $('#scopeGlass');
    if (input) input.disabled = false;
    scopeGlassRow.style.opacity = '1';
  }

  markThemes();
  markSwatches();
  markFontColorSwatches();

  // Update Radius
  const rad = getEffectiveRadius();
  const radInput = $('#radius');
  const radOut = $('#radiusOut');
  if (radInput) radInput.value = String(rad);
  if (radOut) radOut.textContent = `${digits(rad)}px`;

  // Update Font Cards
  markFontCards();

  // Update Typography
  syncTypographyControls();

  // Update Look & Motion
  syncLookControls();

  // Sync with Widgets tab selector if open
  if ($('#wStyleSelect') && !isGlobal && currentScope !== 'settings') {
    $('#wStyleSelect').value = currentScope;
    if (typeof window._updateWStyleSelectTab === 'function') {
      window._updateWStyleSelectTab(currentScope);
    }
  }
}

/* ---------- builders ---------- */

function buildThemes() {
  const curTheme = getEffectiveTheme();
  $('#themes').replaceChildren(...THEMES.map((id) =>
    el('button', {
      class: `theme-card${curTheme === id ? ' on' : ''}`,
      dataset: { theme: id },
      title: t(`s.th.${id}`),
      onclick: () => {
        if (currentScope === 'global') {
          set({ theme: id }, { immediate: true });
        } else {
          saveScopedStyle('theme', id);
        }
        markThemes();
        syncAppearanceScopeUI();
      },
    },
      el('div', { class: `theme-swatch sw-${id}` }),
      el('span', { class: 'theme-name', text: t(`s.th.${id}`) })
    )
  ));
}

function markThemes() {
  const activeTheme = getEffectiveTheme();
  document.querySelectorAll('.theme-card').forEach((c) =>
    c.classList.toggle('on', c.dataset.theme === activeTheme));
}

function buildSwatches() {
  const curAccent = getEffectiveAccent().toLowerCase();
  $('#swatches').replaceChildren(...ACCENTS.map((c) =>
    el('button', {
      class: `swatch${curAccent === c.toLowerCase() ? ' on' : ''}`,
      style: `background:${c}`,
      dataset: { color: c },
      title: c,
      onclick: () => { setAccent(c); },
    })
  ));
}

function markSwatches() {
  const color = getEffectiveAccent();
  document.querySelectorAll('#swatches .swatch').forEach((n) =>
    n.classList.toggle('on', n.dataset.color.toLowerCase() === color.toLowerCase()));
  if ($('#accentPick')) $('#accentPick').value = color;
  if ($('#accentHex')) $('#accentHex').textContent = color.toUpperCase();
}

function setAccent(color) {
  if (currentScope === 'global') {
    set({ accent: color }, { immediate: true });
  } else {
    saveScopedStyle('accent', color);
  }
  markSwatches();
  syncAppearanceScopeUI();
}

function buildFontColorSwatches() {
  const swatchesEl = $('#fontColorSwatches');
  if (!swatchesEl) return;
  const curColor = (getEffectiveFontColor() || 'inherit').toLowerCase();
  swatchesEl.replaceChildren(...FONT_COLORS.map((c) =>
    el('button', {
      class: `swatch font-color-swatch${curColor === c.toLowerCase() ? ' on' : ''}`,
      style: `background:${c};${c === '#FFFFFF' || c === '#F1F5F9' ? 'box-shadow:inset 0 0 0 1px #cbd5e1;' : ''}`,
      dataset: { color: c },
      title: c,
      onclick: () => { setFontColor(c); },
    })
  ));
}

function markFontColorSwatches() {
  const color = (getEffectiveFontColor() || 'inherit').toLowerCase();
  const isInherit = color === 'inherit' || !color;
  document.querySelectorAll('#fontColorSwatches .swatch').forEach((n) =>
    n.classList.toggle('on', !isInherit && n.dataset.color.toLowerCase() === color));
  const resetBtn = $('#fontColorResetBtn');
  if (resetBtn) resetBtn.classList.toggle('active', isInherit);
  if ($('#fontColorPick')) {
    $('#fontColorPick').value = isInherit ? '#000000' : color;
  }
  if ($('#fontColorHex')) {
    $('#fontColorHex').textContent = isInherit ? t('s.fontColorDefault') : color.toUpperCase();
  }
  const wSelect = $('#wStyleFontColor');
  if (wSelect) {
    wSelect.value = isInherit ? 'inherit' : color;
  }
}

function setFontColor(color) {
  if (currentScope === 'global') {
    if (color === 'inherit') {
      const l = { ...(s.look || {}) };
      delete l.fontColor;
      setGroup('look', l);
    } else {
      setGroup('look', { fontColor: color });
    }
  } else {
    saveScopedStyle('fontColor', color);
  }
  markFontColorSwatches();
  syncAppearanceScopeUI();
}

function switchEl(id, value, onToggle) {
  const b = typeof id === 'string' ? $(id) : id;
  b.setAttribute('aria-checked', value ? 'true' : 'false');
  b.onclick = () => {
    const next = b.getAttribute('aria-checked') !== 'true';
    b.setAttribute('aria-checked', next ? 'true' : 'false');
    onToggle(next);
  };
}

function range(id, outId, value, format, onInput) {
  const r = typeof id === 'string' ? $(id) : id;
  const o = typeof outId === 'string' ? $(outId) : outId;
  r.value = String(value);
  o.textContent = format(value);
  r.oninput = () => {
    const v = Number(r.value);
    o.textContent = format(v);
    onInput(v);
  };
}

function hoursLabel(h) {
  if (h === 0) return t('s.never');
  if (h === 1) return t('s.hour1');
  if (h === 24) return t('s.day1');
  if (h === 48) return t('s.days2');
  if (h === 168) return t('s.week');
  return t(h <= 10 ? 's.hours' : 's.hoursMany', { n: digits(h) });
}

function buildGlass() {
  const g = s.glass || {};
  range('#glassWidgets', '#glassWidgetsOut', Math.round((g.widgets ?? 0.12) * 100), pct,
    (v) => setGroup('glass', { widgets: v / 100 }));
  range('#glassWindows', '#glassWindowsOut', Math.round((g.windows ?? 0.75) * 100), pct,
    (v) => setGroup('glass', { windows: v / 100 }));
}

function buildFonts() {
  const scales = s.fontScales || {};
  const names = { tafsir: t('s.f.tafsir'), hadith: t('s.f.hadith'), task: t('s.f.task'), settings: t('s.f.settings') };
  $('#fontRows').replaceChildren(...FONT_ITEMS.map((id) => {
    const input = el('input', { type: 'range', min: '70', max: '180', step: '5', id: `font-${id}` });
    const out = el('output');
    const row = el('div', { class: 'row' },
      el('label', { for: `font-${id}`, text: names[id] || (catalog[id] && catalog[id].title) || id }), input, out);
    range(input, out, Math.round((scales[id] ?? 1) * 100), pct, (v) => setGroup('fontScales', { [id]: v / 100 }));
    return row;
  }));
}

function buildTodo() {
  if ($('#todoSortBy')) {
    $('#todoSortBy').value = s.todoSortBy || 'free';
    $('#todoSortBy').onchange = (e) => set({ todoSortBy: e.target.value });
  }
  if ($('#todoMoveDoneToBottom')) {
    switchEl('#todoMoveDoneToBottom', s.todoMoveDoneToBottom !== false, (v) => set({ todoMoveDoneToBottom: v }));
  }
  const sel = $('#hideDone');
  const cur = Number(s.todo?.hideDoneAfterHours) || 0;
  sel.replaceChildren(...HIDE_CHOICES.map((h) => el('option', { value: String(h), selected: h === cur }, hoursLabel(h))));
  sel.onchange = (e) => setGroup('todo', { hideDoneAfterHours: Number(e.target.value) });
}


function buildClassroom() {
  const cr = s.classroom || {};
  switchEl('#crEnabled', Boolean(cr.enabled), (v) => setGroup('classroom', { enabled: v }));
  if ($('#crClientId')) $('#crClientId').value = cr.clientId || '';
  if ($('#crClientSecret')) $('#crClientSecret').value = cr.clientSecret || '';
  if ($('#crIcalUrl')) $('#crIcalUrl').value = cr.iCalUrl || '';
  switchEl('#crPreventDone', cr.preventDoneIfNotTurnedIn !== false, (v) => setGroup('classroom', { preventDoneIfNotTurnedIn: v }));
  switchEl('#crShowSubmissionBadge', Boolean(s.crShowSubmissionBadge), (v) => set({ crShowSubmissionBadge: v }));
  switchEl('#crShowCourseBadge', s.crShowCourseBadge !== false, (v) => set({ crShowCourseBadge: v }));
  switchEl('#crShowLinkBtn', s.crShowLinkBtn !== false, (v) => set({ crShowLinkBtn: v }));
  switchEl('#crCourseInTitle', Boolean(s.crCourseInTitle), (v) => set({ crCourseInTitle: v }));
  switchEl('#crShowNotificationsBtn', s.crShowNotificationsBtn !== false, (v) => set({ crShowNotificationsBtn: v }));
  if ($('#crUserEmail')) $('#crUserEmail').value = cr.userEmail || '';
  if ($('#crUserEmail')) $('#crUserEmail').onchange = (e) => setGroup('classroom', { userEmail: e.target.value.trim() });

  const hint = $('#crStatusHint');
  if (hint) {
    if (cr.accessToken || cr.refreshToken) {
      hint.textContent = t('s.crSyncSuccess', { added: 0, updated: 0 });
      hint.style.color = '#10b981';
    } else if (cr.iCalUrl) {
      hint.textContent = t('s.crIcalHint');
      hint.style.color = 'var(--ink-2)';
    } else {
      hint.textContent = '—';
      hint.style.color = '';
    }
  }

  if ($('#crClientId')) $('#crClientId').onchange = (e) => setGroup('classroom', { clientId: e.target.value.trim() });
  if ($('#crClientSecret')) $('#crClientSecret').onchange = (e) => setGroup('classroom', { clientSecret: e.target.value.trim() });
  if ($('#crIcalUrl')) $('#crIcalUrl').onchange = (e) => setGroup('classroom', { iCalUrl: e.target.value.trim() });

  if ($('#crLoginBtn')) {
    $('#crLoginBtn').onclick = async () => {
      const btn = $('#crLoginBtn');
      const clientId = ($('#crClientId')?.value || '').trim();
      const clientSecret = ($('#crClientSecret')?.value || '').trim();
      if (!clientId) {
        if (hint) {
          hint.textContent = t('s.crClientId');
          hint.style.color = '#ef4444';
        }
        return;
      }
      btn.disabled = true;
      if (hint) {
        hint.textContent = t('s.crSyncing');
        hint.style.color = 'var(--accent)';
      }
      try {
        const res = await window.widgets.classroom.startAuth({ clientId, clientSecret });
        if (res && res.ok) {
          if (hint) {
            hint.textContent = t('s.crSyncSuccess', { added: 0, updated: 0 });
            hint.style.color = '#10b981';
          }
        }
      } catch (err) {
        if (hint) {
          hint.textContent = err.message;
          hint.style.color = '#ef4444';
        }
      } finally {
        btn.disabled = false;
      }
    };
  }

  if ($('#crSyncBtn')) {
    $('#crSyncBtn').onclick = async () => {
      const btn = $('#crSyncBtn');
      btn.disabled = true;
      if (hint) {
        hint.textContent = t('s.crSyncing');
        hint.style.color = 'var(--accent)';
      }
      try {
        const res = await window.widgets.classroom.sync();
        if (res && res.ok) {
          if (hint) {
            hint.textContent = t('s.crSyncSuccess', { added: res.added || 0, updated: res.updated || 0 });
            hint.style.color = '#10b981';
          }
        } else if (hint) {
          hint.textContent = res?.error ? res.error : t('s.crSyncEmpty');
          hint.style.color = 'var(--ink-2)';
        }
      } catch (err) {
        if (hint) {
          hint.textContent = err.message;
          hint.style.color = '#ef4444';
        }
      } finally {
        btn.disabled = false;
      }
    };
  }

  // Automatic Hidden Courses Switch & Auto-List Manager
  const filterSwitch = $('#crFilterHiddenCourses');
  const autoCoursesBox = $('#crAutoCoursesBox');
  const autoCoursesList = $('#crAutoCoursesList');
  const autoCoursesStatus = $('#crAutoCoursesStatus');
  const toggleViewBtn = $('#crToggleCoursesViewBtn');
  const toggleIcon = $('#crToggleCoursesIcon');

  let isFilterActive = (cr.filterHiddenCourses !== false);
  let isListExpanded = !isFilterActive; // Automatically expanded when master filter is OFF ("لو شيلته")

  function updateCollapseUI() {
    if (autoCoursesList) {
      autoCoursesList.style.display = isListExpanded ? 'flex' : 'none';
    }
    if (toggleIcon) {
      toggleIcon.textContent = isListExpanded ? '▲' : '▼';
    }
    if (toggleViewBtn) {
      toggleViewBtn.setAttribute('aria-expanded', isListExpanded ? 'true' : 'false');
    }
  }

  function updateMasterFilterUI(active) {
    isFilterActive = active;
    if (!active) {
      // User disabled master filter: automatically expand list as requested:
      // "زرار لو شيلته تظهر قائمة بالكورسات الي تم تحديد انها hidden تلقائياً كل واحدة قدامها زرار on/off"
      isListExpanded = true;
    }
    updateCollapseUI();
    renderCoursesList();
  }

  if (filterSwitch) {
    switchEl(filterSwitch, isFilterActive, (v) => {
      setGroup('classroom', { filterHiddenCourses: v });
      updateMasterFilterUI(v);
    });
  }

  if (toggleViewBtn) {
    toggleViewBtn.onclick = () => {
      isListExpanded = !isListExpanded;
      updateCollapseUI();
    };
  }

  let enrolledCoursesCache = Array.isArray(cr.knownCourses) ? [...cr.knownCourses] : [];

  function renderCoursesList() {
    if (!autoCoursesList) return;
    const hidden = (s.classroom?.hiddenCourses || []).map((x) => String(x).toLowerCase().trim());

    // Merge cached courses and any courses that are already in hiddenCourses
    const courseMap = new Map();
    for (const c of enrolledCoursesCache) {
      if (c && c.name) courseMap.set(String(c.name).toLowerCase().trim(), c);
    }
    for (const h of (s.classroom?.hiddenCourses || [])) {
      const low = String(h).toLowerCase().trim();
      if (!courseMap.has(low)) {
        courseMap.set(low, { id: h, name: h, section: '' });
      }
    }
    const allCourses = Array.from(courseMap.values());

    if (!allCourses.length) {
      autoCoursesList.replaceChildren(el('div', {
        class: 'cr-auto-courses-empty',
        text: (cr.accessToken || cr.refreshToken) ? t('s.crAutoCoursesLoading') : t('s.crAutoCoursesEmpty'),
      }));
      if (autoCoursesStatus) autoCoursesStatus.textContent = '';
      return;
    }

    const hiddenCount = allCourses.filter((c) =>
      hidden.some((h) =>
        String(c.id).toLowerCase().trim() === h ||
        String(c.name).toLowerCase().trim() === h ||
        String(c.name).toLowerCase().trim().includes(h) ||
        h.includes(String(c.name).toLowerCase().trim())
      )
    ).length;

    if (autoCoursesStatus) {
      autoCoursesStatus.textContent = isFilterActive
        ? `(${t('s.crFilterActive')} ${hiddenCount} ${t('s.crOf')} ${allCourses.length})`
        : `(${hiddenCount} ${t('s.crMarkedHidden')} ${allCourses.length})`;
      autoCoursesStatus.style.color = isFilterActive && hiddenCount > 0 ? 'var(--accent)' : 'var(--ink-2)';
    }

    autoCoursesList.replaceChildren(...allCourses.map((course) => {
      const isHidden = hidden.some((h) =>
        String(course.id).toLowerCase().trim() === h ||
        String(course.name).toLowerCase().trim() === h ||
        String(course.name).toLowerCase().trim().includes(h) ||
        h.includes(String(course.name).toLowerCase().trim())
      );

      const switchBtn = el('button', {
        type: 'button',
        class: 'switch',
        role: 'switch',
        title: isHidden ? t('s.crCourseHiddenBadge') : t('s.crCourseVisibleBadge'),
      });

      switchEl(switchBtn, isHidden, (nextIsHidden) => {
        let currentHidden = [...(s.classroom?.hiddenCourses || [])];
        if (nextIsHidden) {
          if (!currentHidden.includes(course.name)) {
            currentHidden.push(course.name);
          }
        } else {
          currentHidden = currentHidden.filter((x) => {
            const low = String(x).toLowerCase().trim();
            return low !== String(course.name).toLowerCase().trim() && low !== String(course.id).toLowerCase().trim();
          });
        }
        setGroup('classroom', { hiddenCourses: currentHidden });
        renderCoursesList();
      });

      const row = el('div', { class: `cr-auto-course-row${isHidden ? ' is-hidden' : ''}` },
        el('div', { class: 'cr-auto-course-info' },
          el('div', { class: 'cr-auto-course-name' },
            el('span', { class: 'cr-auto-course-icon', text: isHidden ? '🚫' : '📚' }),
            el('span', { text: course.name })
          ),
          course.section ? el('div', { class: 'cr-auto-course-sec', text: course.section }) : null
        ),
        el('div', { class: 'cr-auto-course-action' },
          el('span', {
            class: `cr-auto-course-badge ${isHidden ? 'badge-hidden' : 'badge-visible'}`,
            text: isHidden ? t('s.crCourseHiddenBadge') : t('s.crCourseVisibleBadge')
          }),
          switchBtn
        )
      );
      return row;
    }));
  }

  // Initial UI sync
  updateCollapseUI();
  renderCoursesList();

  // Automatic background fetch of enrolled courses
  (async () => {
    try {
      if (window.widgets?.classroom?.courses) {
        const res = await window.widgets.classroom.courses();
        if (res && res.ok && Array.isArray(res.courses) && res.courses.length) {
          enrolledCoursesCache = res.courses;
          setGroup('classroom', { knownCourses: res.courses });
          renderCoursesList();
        }
      }
    } catch (e) {
      console.warn('Background courses sync error:', e);
    }
  })();
}

function buildSuperUrgentAndWhatsApp() {
  const su = s.superUrgent || {};
  switchEl('#suEnabled', su.enabled !== false, (v) => setGroup('superUrgent', { enabled: v }));
  if ($('#suHours')) $('#suHours').value = String(su.thresholdHours || 3);
  if ($('#suDesktopInterval')) $('#suDesktopInterval').value = String(su.desktopIntervalMinutes || 15);

  if ($('#suHours')) $('#suHours').onchange = (e) => setGroup('superUrgent', { thresholdHours: Number(e.target.value) });
  if ($('#suDesktopInterval')) $('#suDesktopInterval').onchange = (e) => setGroup('superUrgent', { desktopIntervalMinutes: Number(e.target.value) });

  const wa = s.whatsapp || {};
  const currentProvider = wa.provider || 'openwa';
  switchEl('#waEnabled', Boolean(wa.enabled), (v) => setGroup('whatsapp', { enabled: v }));
  if ($('#waProvider')) $('#waProvider').value = currentProvider;

  // ── Multi-Number Dynamic List ──
  let phoneNumbers = [];
  if (Array.isArray(wa.phoneNumbers) && wa.phoneNumbers.length > 0) {
    phoneNumbers = wa.phoneNumbers.map((p) => String(p).trim()).filter(Boolean);
  } else if (wa.phone) {
    phoneNumbers = String(wa.phone).split(/[,;\n]+/).map((p) => p.trim()).filter(Boolean);
  }
  if (!phoneNumbers.length) phoneNumbers = [''];

  function saveNumbers() {
    const cleaned = phoneNumbers.map((p) => p.trim()).filter(Boolean);
    setGroup('whatsapp', {
      phoneNumbers: cleaned,
      phone: cleaned.join(', '),
    });
  }

  function renderPhoneRows() {
    const list = $('#waNumbersList');
    if (!list) return;
    list.replaceChildren();
    phoneNumbers.forEach((num, idx) => {
      const row = el('div', { class: 'wa-phone-row' });
      const iconSpan = el('span', { class: 'wa-phone-icon', text: '📱' });
      const input = el('input', {
        class: 'field ltr wa-phone-input',
        type: 'tel',
        dir: 'ltr',
        placeholder: '2010xxxxxxxx',
        value: num,
      });
      input.oninput = (e) => {
        phoneNumbers[idx] = e.target.value.trim();
        saveNumbers();
      };
      const delBtn = el('button', {
        class: 'wa-phone-del-btn',
        type: 'button',
        title: t('s.waDelPhoneTitle'),
        onclick: () => {
          if (phoneNumbers.length > 1) {
            phoneNumbers.splice(idx, 1);
          } else {
            phoneNumbers[0] = '';
          }
          renderPhoneRows();
          saveNumbers();
        },
      }, '✕');
      row.append(iconSpan, input, delBtn);
      list.append(row);
    });
  }
  renderPhoneRows();

  if ($('#waAddPhoneBtn')) {
    $('#waAddPhoneBtn').onclick = () => {
      phoneNumbers.push('');
      renderPhoneRows();
      const inputs = document.querySelectorAll('.wa-phone-input');
      if (inputs.length) inputs[inputs.length - 1].focus();
    };
  }

  // ── Groups Browser / Picker ──
  async function loadGroupsList() {
    const listEl = $('#waGroupsList');
    if (!listEl) return;
    listEl.replaceChildren(el('p', { class: 'hint', text: t('s.waGroupsLoading') }));
    try {
      const res = await window.widgets.openwa.groups();
      if (!res.ok || !res.groups || !res.groups.length) {
        listEl.replaceChildren(el('p', { class: 'hint', text: res.error || t('s.waGroupsEmpty') }));
        return;
      }
      listEl.replaceChildren();
      res.groups.forEach((g) => {
        const item = el('div', {
          style: 'display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: var(--field); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle, rgba(255,255,255,0.05)); font-size: 12px;',
        });
        const info = el('div', { style: 'display: flex; flex-direction: column; min-width: 0; flex: 1; margin-inline-end: 8px;' },
          el('span', { style: 'font-weight: 700; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;', text: g.name }),
          el('span', { style: 'font-size: 10.5px; color: var(--ink-3); font-family: monospace; direction: ltr;', text: g.id })
        );
        const addBtn = el('button', {
          class: 'btn small accent',
          type: 'button',
          style: 'padding: 2px 8px; font-size: 11px;',
          text: t('s.waAddGroupBtn'),
          title: t('s.waAddGroupTitle'),
          onclick: () => {
            if (!phoneNumbers.includes(g.id)) {
              if (phoneNumbers.length === 1 && !phoneNumbers[0]) {
                phoneNumbers[0] = g.id;
              } else {
                phoneNumbers.push(g.id);
              }
              renderPhoneRows();
              saveNumbers();
            }
          },
        });
        item.append(info, addBtn);
        listEl.append(item);
      });
    } catch (err) {
      listEl.replaceChildren(el('p', { class: 'hint', text: `${en() ? 'Error' : 'خطأ'}: ${err.message}` }));
    }
  }

  if ($('#waBrowseGroupsBtn')) {
    $('#waBrowseGroupsBtn').onclick = () => {
      const drawer = $('#waGroupsDrawer');
      if (!drawer) return;
      if (drawer.style.display === 'none') {
        drawer.style.display = 'block';
        loadGroupsList();
      } else {
        drawer.style.display = 'none';
      }
    };
  }
  if ($('#waGroupsRefreshBtn')) {
    $('#waGroupsRefreshBtn').onclick = () => loadGroupsList();
  }

  // ── Sender Identity & Group Support ──
  if ($('#waSenderName')) {
    $('#waSenderName').value = wa.senderName || 'Assignment';
    $('#waSenderName').oninput = (e) => {
      setGroup('whatsapp', { senderName: e.target.value.trim() });
      updatePreview();
    };
  }

  switchEl('#waSendToGroup', Boolean(wa.sendToGroup), (v) => {
    setGroup('whatsapp', { sendToGroup: v });
    if ($('#waGroupRow')) $('#waGroupRow').style.display = v ? 'flex' : 'none';
  });
  if ($('#waGroupRow')) $('#waGroupRow').style.display = wa.sendToGroup ? 'flex' : 'none';
  if ($('#waGroupId')) {
    $('#waGroupId').value = wa.groupId || '';
    $('#waGroupId').oninput = (e) => setGroup('whatsapp', { groupId: e.target.value.trim() });
  }

  // ── WhatsApp Smart Multi-Channel Routing Hub ──
  const waRoutes = wa.routes || {};
  const channels = [
    { key: 'superUrgent', modeId: '#waChanSuperUrgentMode', wrapId: '#waChanSuperUrgentInputWrap', inputId: '#waChanSuperUrgentRecipient', legacyFallback: s.superUrgent?.whatsappRecipient },
    { key: 'habitsReports', modeId: '#waChanHabitsReportsMode', wrapId: '#waChanHabitsReportsInputWrap', inputId: '#waChanHabitsReportsRecipient', legacyFallback: s.habits?.waRecipientOverride },
    { key: 'habitReminders', modeId: '#waChanHabitRemindersMode', wrapId: '#waChanHabitRemindersInputWrap', inputId: '#waChanHabitRemindersRecipient' },
    { key: 'calendarEvents', modeId: '#waChanCalendarMode', wrapId: '#waChanCalendarInputWrap', inputId: '#waChanCalendarRecipient', legacyFallback: s.calendar?.whatsappOverrideRecipient },
  ];

  channels.forEach(({ key, modeId, wrapId, inputId, legacyFallback }) => {
    const route = waRoutes[key] || {};
    const modeEl = $(modeId);
    const wrapEl = $(wrapId);
    const inputEl = $(inputId);
    if (!modeEl || !wrapEl || !inputEl) return;

    const useCustom = Boolean(route.useCustom || (!route.useCustom && route.recipient) || (!route.useCustom && legacyFallback));
    const recipient = route.recipient || legacyFallback || '';

    modeEl.value = useCustom ? 'custom' : 'default';
    wrapEl.style.display = useCustom ? 'block' : 'none';
    inputEl.value = recipient;

    const saveRoute = () => {
      if (!s.whatsapp) s.whatsapp = {};
      if (!s.whatsapp.routes) s.whatsapp.routes = {};
      s.whatsapp.routes[key] = {
        ...s.whatsapp.routes[key],
        useCustom: modeEl.value === 'custom',
        recipient: inputEl.value.trim(),
      };
      setGroup('whatsapp', { routes: s.whatsapp.routes });
    };

    modeEl.onchange = () => {
      wrapEl.style.display = modeEl.value === 'custom' ? 'block' : 'none';
      saveRoute();
    };

    inputEl.oninput = () => {
      saveRoute();
    };
  });

  // ── Habit Reminders: Scope Switcher (All Habits vs Specific Habit) & Interactive Habits List ──
  const setupHabitRemindersCustomizer = async () => {
    const habitRoute = (wa.routes && wa.routes.habitReminders) || {};
    let activeScope = habitRoute.scope || 'all';

    const scopeAllBtn = $('#waHabitScopeAllBtn');
    const scopeSpecificBtn = $('#waHabitScopeSpecificBtn');
    const allWrap = $('#waHabitAllWrap');
    const specificWrap = $('#waHabitSpecificWrap');

    const updateScopeUI = (scope) => {
      activeScope = scope;
      if (scopeAllBtn) scopeAllBtn.classList.toggle('on', scope === 'all');
      if (scopeSpecificBtn) scopeSpecificBtn.classList.toggle('on', scope === 'specific');
      if (allWrap) allWrap.style.display = scope === 'all' ? 'block' : 'none';
      if (specificWrap) specificWrap.style.display = scope === 'specific' ? 'block' : 'none';

      if (!s.whatsapp) s.whatsapp = {};
      if (!s.whatsapp.routes) s.whatsapp.routes = {};
      if (!s.whatsapp.routes.habitReminders) s.whatsapp.routes.habitReminders = { useCustom: false, recipient: '' };
      s.whatsapp.routes.habitReminders.scope = scope;
      setGroup('whatsapp', { routes: s.whatsapp.routes });
    };

    if (scopeAllBtn) scopeAllBtn.onclick = () => updateScopeUI('all');
    if (scopeSpecificBtn) scopeSpecificBtn.onclick = () => updateScopeUI('specific');

    updateScopeUI(activeScope);

    let cachedHabits = [];
    const habitPickerSelect = $('#waHabitPickerSelect');
    const habitsScrollList = $('#waHabitsScrollList');
    const habitsCountEl = $('#waHabitsListCount');
    const selectedCard = $('#waHabitSelectedCard');
    const selIcon = $('#waHabitSelectedIcon');
    const selTitle = $('#waHabitSelectedTitle');
    const selTimeBadge = $('#waHabitSelectedTimeBadge');
    const itemModeSelect = $('#waHabitSelectedItemMode');
    const itemCustomWrap = $('#waHabitSelectedItemCustomWrap');
    const itemCustomRecipient = $('#waHabitSelectedItemCustomRecipient');
    const saveIndicator = $('#waHabitItemSaveIndicator');
    const testBtn = $('#waHabitItemTestBtn');
    const testStatus = $('#waHabitItemTestStatus');

    // Quick Habit Controls in All Habits view
    const quickHabitSelect = $('#waQuickHabitSelect');
    const quickHabitMode = $('#waQuickHabitMode');
    const quickHabitRecipient = $('#waQuickHabitRecipient');
    const quickHabitSaveIndicator = $('#waQuickHabitSaveIndicator');
    const btnOpenHabitMsgModalAll = $('#btnOpenHabitMsgModalAll');
    const btnOpenHabitMsgModalSpecific = $('#btnOpenHabitMsgModalSpecific');

    // Smart Habit Message Formulator Modal Elements
    const habitMsgModal = $('#waHabitMsgModal');
    const habitModalHabitBadge = $('#waHabitModalHabitBadge');
    const habitModalSub = $('#waHabitModalSub');
    const habitModalTemplate = $('#waHabitModalTemplate');
    const habitModalPreviewText = $('#waHabitModalPreviewText');
    const habitModalPreviewContact = $('#waHabitModalPreviewContact');
    const habitModalPreviewTime = $('#waHabitModalPreviewTime');
    const habitModalSaveBtn = $('#waHabitModalSaveBtn');
    const habitModalTestSendBtn = $('#waHabitModalTestSendBtn');
    const habitModalStatus = $('#waHabitModalStatus');
    const habitMsgModalCloseBtn = $('#waHabitMsgModalCloseBtn');
    const habitModalCloseBtn2 = $('#waHabitModalCloseBtn2');

    let currentSelectedHabitId = null;

    const showSavedIndicator = () => {
      if (!saveIndicator) return;
      saveIndicator.textContent = en() ? '✓ Saved for habit' : '✓ تم الحفظ للعادة';
      saveIndicator.style.opacity = '1';
      setTimeout(() => { if (saveIndicator) saveIndicator.style.opacity = '0'; }, 1800);
    };

    const showQuickSavedIndicator = () => {
      if (!quickHabitSaveIndicator) return;
      quickHabitSaveIndicator.textContent = en() ? '✓ Saved for habit' : '✓ تم الحفظ للعادة';
      quickHabitSaveIndicator.style.opacity = '1';
      setTimeout(() => { if (quickHabitSaveIndicator) quickHabitSaveIndicator.style.opacity = '0'; }, 1800);
    };

    const updateSelectedHabitCard = (habit) => {
      if (!habit) {
        if (selectedCard) selectedCard.style.display = 'none';
        return;
      }
      if (selectedCard) selectedCard.style.display = 'block';
      currentSelectedHabitId = habit.id;

      if (selIcon) selIcon.textContent = habit.icon || '⭐';
      if (selTitle) selTitle.textContent = (en() && habit.titleEn) ? habit.titleEn : (habit.title || '');
      if (selTimeBadge) {
        if (habit.reminderEnabled && habit.reminderTime) {
          selTimeBadge.textContent = `⏰ ${habit.reminderTime}`;
          selTimeBadge.className = 'badge-mini success';
        } else {
          selTimeBadge.textContent = en() ? 'Disabled' : 'معطل';
          selTimeBadge.className = 'badge-mini muted';
        }
      }

      const hasCustom = Boolean(habit.reminderRecipient && habit.reminderRecipient.trim());
      if (itemModeSelect) itemModeSelect.value = hasCustom ? 'custom' : 'default';
      if (itemCustomWrap) itemCustomWrap.style.display = hasCustom ? 'block' : 'none';
      if (itemCustomRecipient) itemCustomRecipient.value = habit.reminderRecipient || '';
      if (testStatus) testStatus.textContent = '';

      if (quickHabitSelect) quickHabitSelect.value = habit.id;
      if (quickHabitMode) quickHabitMode.value = hasCustom ? 'custom' : 'default';
      if (quickHabitRecipient) {
        quickHabitRecipient.style.display = hasCustom ? 'block' : 'none';
        quickHabitRecipient.value = habit.reminderRecipient || '';
      }
    };

    const renderHabits = () => {
      if (!habitsScrollList || !habitPickerSelect) return;
      habitsScrollList.innerHTML = '';
      habitPickerSelect.innerHTML = '';

      if (cachedHabits.length === 0) {
        if (habitsCountEl) habitsCountEl.textContent = '(0)';
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'empty-hint';
        emptyMsg.style.cssText = 'padding: 10px; text-align: center; color: var(--ink-faint); font-size: 11px;';
        emptyMsg.textContent = en()
          ? 'No habits added yet. You can add habits from the Habits widget.'
          : 'لا توجد عادات مضافة حالياً. يمكنك إضافة عادات من ودجت العادات.';
        habitsScrollList.appendChild(emptyMsg);

        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = en() ? '-- No habits found --' : '-- لا توجد عادات --';
        habitPickerSelect.appendChild(opt);
        if (selectedCard) selectedCard.style.display = 'none';
        return;
      }

      if (habitsCountEl) habitsCountEl.textContent = `(${cachedHabits.length})`;

      if (!currentSelectedHabitId || !cachedHabits.some(h => h.id === currentSelectedHabitId)) {
        currentSelectedHabitId = cachedHabits[0].id;
      }

      cachedHabits.forEach((h) => {
        const title = (en() && h.titleEn) ? h.titleEn : (h.title || '');
        const timeStr = h.reminderEnabled && h.reminderTime ? `⏰ ${h.reminderTime}` : (en() ? 'Off' : 'معطل');
        const recipTag = h.reminderRecipient ? `📱 ${h.reminderRecipient}` : `🌐 ${en() ? 'Default' : 'الافتراضي'}`;

        const opt = document.createElement('option');
        opt.value = h.id;
        opt.textContent = `${h.icon || '⭐'} ${title} (${timeStr}) [${recipTag}]`;
        if (h.id === currentSelectedHabitId) opt.selected = true;
        habitPickerSelect.appendChild(opt);

        if (quickHabitSelect) {
          const qOpt = document.createElement('option');
          qOpt.value = h.id;
          qOpt.textContent = `${h.icon || '⭐'} ${title} (${timeStr}) [${recipTag}]`;
          if (h.id === currentSelectedHabitId) qOpt.selected = true;
          quickHabitSelect.appendChild(qOpt);
        }

        const row = document.createElement('div');
        row.className = `wa-habit-row-item${h.id === currentSelectedHabitId ? ' active' : ''}`;
        row.setAttribute('data-id', h.id);

        const mainDiv = document.createElement('div');
        mainDiv.className = 'wa-habit-row-main';
        const iconSpan = document.createElement('span');
        iconSpan.style.fontSize = '14px';
        iconSpan.textContent = h.icon || '⭐';
        const titleSpan = document.createElement('span');
        titleSpan.className = 'wa-habit-row-title';
        titleSpan.textContent = title;
        mainDiv.appendChild(iconSpan);
        mainDiv.appendChild(titleSpan);

        const badgesDiv = document.createElement('div');
        badgesDiv.className = 'wa-habit-row-badges';
        const timeBadge = document.createElement('span');
        timeBadge.className = `badge-mini ${h.reminderEnabled && h.reminderTime ? 'success' : 'muted'}`;
        timeBadge.textContent = timeStr;
        const recipBadge = document.createElement('span');
        recipBadge.className = `badge-mini ${h.reminderRecipient ? 'success' : 'muted'}`;
        recipBadge.textContent = recipTag;
        badgesDiv.appendChild(timeBadge);
        badgesDiv.appendChild(recipBadge);

        row.appendChild(mainDiv);
        row.appendChild(badgesDiv);

        row.onclick = () => {
          currentSelectedHabitId = h.id;
          habitPickerSelect.value = h.id;
          updateSelectedHabitCard(h);
          document.querySelectorAll('.wa-habit-row-item').forEach(el => el.classList.remove('active'));
          row.classList.add('active');
        };

        habitsScrollList.appendChild(row);
      });

      const selectedHabit = cachedHabits.find(h => h.id === currentSelectedHabitId) || cachedHabits[0];
      updateSelectedHabitCard(selectedHabit);
    };

    habitPickerSelect.onchange = () => {
      currentSelectedHabitId = habitPickerSelect.value;
      const targetHabit = cachedHabits.find(h => h.id === currentSelectedHabitId);
      updateSelectedHabitCard(targetHabit);
      document.querySelectorAll('.wa-habit-row-item').forEach(el => {
        el.classList.toggle('active', el.getAttribute('data-id') === currentSelectedHabitId);
      });
    };

    if (itemModeSelect) {
      itemModeSelect.onchange = () => {
        const isCustom = itemModeSelect.value === 'custom';
        if (itemCustomWrap) itemCustomWrap.style.display = isCustom ? 'block' : 'none';
        const targetHabit = cachedHabits.find(h => h.id === currentSelectedHabitId);
        if (!targetHabit) return;

        if (!isCustom) {
          targetHabit.reminderRecipient = '';
          if (itemCustomRecipient) itemCustomRecipient.value = '';
          if (window.widgets?.habits?.saveHabit) {
            window.widgets.habits.saveHabit(targetHabit);
          }
          showSavedIndicator();
          renderHabits();
        } else {
          if (itemCustomRecipient) itemCustomRecipient.focus();
        }
      };
    }

    let recipientDebounce = null;
    if (itemCustomRecipient) {
      itemCustomRecipient.oninput = () => {
        clearTimeout(recipientDebounce);
        recipientDebounce = setTimeout(() => {
          const targetHabit = cachedHabits.find(h => h.id === currentSelectedHabitId);
          if (!targetHabit) return;
          targetHabit.reminderRecipient = itemCustomRecipient.value.trim();
          if (window.widgets?.habits?.saveHabit) {
            window.widgets.habits.saveHabit(targetHabit);
          }
          showSavedIndicator();
          const row = document.querySelector(`.wa-habit-row-item[data-id="${targetHabit.id}"]`);
          if (row) {
            const badges = row.querySelector('.wa-habit-row-badges');
            if (badges) {
              const recipTag = targetHabit.reminderRecipient ? `📱 ${targetHabit.reminderRecipient}` : `🌐 ${en() ? 'Default' : 'الافتراضي'}`;
              const lastBadge = badges.querySelector('.badge-mini:last-child');
              if (lastBadge) {
                lastBadge.className = `badge-mini ${targetHabit.reminderRecipient ? 'success' : 'muted'}`;
                lastBadge.textContent = recipTag;
              }
            }
          }
        }, 300);
      };
    }

    if (quickHabitSelect) {
      quickHabitSelect.onchange = () => {
        currentSelectedHabitId = quickHabitSelect.value;
        const targetHabit = cachedHabits.find(h => h.id === currentSelectedHabitId);
        updateSelectedHabitCard(targetHabit);
        if (habitPickerSelect) habitPickerSelect.value = currentSelectedHabitId;
        document.querySelectorAll('.wa-habit-row-item').forEach(el => {
          el.classList.toggle('active', el.getAttribute('data-id') === currentSelectedHabitId);
        });
      };
    }

    if (quickHabitMode) {
      quickHabitMode.onchange = () => {
        const isCustom = quickHabitMode.value === 'custom';
        if (quickHabitRecipient) quickHabitRecipient.style.display = isCustom ? 'block' : 'none';
        const targetHabit = cachedHabits.find(h => h.id === currentSelectedHabitId);
        if (!targetHabit) return;

        if (!isCustom) {
          targetHabit.reminderRecipient = '';
          if (quickHabitRecipient) quickHabitRecipient.value = '';
          if (itemCustomRecipient) itemCustomRecipient.value = '';
          if (itemModeSelect) itemModeSelect.value = 'default';
          if (itemCustomWrap) itemCustomWrap.style.display = 'none';
          if (window.widgets?.habits?.saveHabit) {
            window.widgets.habits.saveHabit(targetHabit);
          }
          showQuickSavedIndicator();
          showSavedIndicator();
          renderHabits();
        } else {
          if (quickHabitRecipient) quickHabitRecipient.focus();
        }
      };
    }

    let quickRecipientDebounce = null;
    if (quickHabitRecipient) {
      quickHabitRecipient.oninput = () => {
        clearTimeout(quickRecipientDebounce);
        quickRecipientDebounce = setTimeout(() => {
          const targetHabit = cachedHabits.find(h => h.id === currentSelectedHabitId);
          if (!targetHabit) return;
          targetHabit.reminderRecipient = quickHabitRecipient.value.trim();
          if (itemCustomRecipient) itemCustomRecipient.value = targetHabit.reminderRecipient;
          if (window.widgets?.habits?.saveHabit) {
            window.widgets.habits.saveHabit(targetHabit);
          }
          showQuickSavedIndicator();
          showSavedIndicator();
          renderHabits();
        }, 300);
      };
    }

    // Smart Habit Message Formulator Modal Logic
    const getDefaultHabitTemplate = (h) => {
      const isEn = en();
      if (isEn) {
        return `⏰ *[HABIT REMINDER]* {habit}\n\n🔥 *Current Streak:* {streak} days! Keep the momentum strong!\n🎯 Target: {target}\n\n💡 Every single step counts towards mastery. You've got this! ✨\n✅ Mark it done in Mirqat Widgets!`;
      }
      return `⏰ *[تذكير بموعد العادة]* {habit}\n\n🔥 *سلسلة الالتزام:* {streak} أيام متواصلة! استمر ولا تقطع السلسلة!\n📌 الهدف اليومي: {target}\n\n💡 استعن بالله ولا تعجز، خطوة واحدة تصنع فارقاً عظيماً في يومك! ✨\n✅ سجّلها في تطبيق مرقاة عند الإنجاز!`;
    };

    const updateHabitModalLivePreview = (habit) => {
      if (!habitModalPreviewText || !habitModalTemplate) return;
      const h = habit || cachedHabits.find(x => x.id === currentSelectedHabitId) || cachedHabits[0];
      if (!h) return;
      const title = (en() && h.titleEn) ? h.titleEn : (h.title || '');
      let targetStr = '';
      if (h.type === 'percentage') targetStr = `${h.targetValue || 100}%`;
      else if (h.type === 'rating') targetStr = '5 ⭐';
      else if (h.targetValue) targetStr = `${h.targetValue} ${en() ? (h.unitEn || h.unit || '') : (h.unit || '')}`.trim();
      else targetStr = en() ? 'Daily Goal' : 'الهدف اليومي';

      let text = habitModalTemplate.value || '';
      const streakNum = h.streak || 0;
      const streakText = streakNum > 0
        ? (en() ? `🔥 *Current Streak:* ${streakNum} days! Keep the momentum going!` : `🔥 *سلسلة الالتزام:* ${streakNum} أيام متواصلة! استمر ولا تقطع السلسلة!`)
        : (en() ? `🌱 *Start your streak today!* Every great journey begins with a single step.` : `🌱 *ابدأ سلسلتك اليوم!* خطوة واحدة تصنع فارقاً عظيماً.`);

      const rendered = text
        .replace(/{habit}/g, `${h.icon || '⭐'} *${title}*`)
        .replace(/{habitTitle}/g, title)
        .replace(/{icon}/g, h.icon || '⭐')
        .replace(/{target}/g, targetStr)
        .replace(/{streak}/g, String(streakNum))
        .replace(/{streakText}/g, streakText)
        .replace(/{time}/g, h.reminderTime || '08:00')
        .replace(/{cue}/g, h.triggerCue || (en() ? 'Anchor Cue' : 'المحفز المرتبط'))
        .replace(/{note}/g, h.notes || '');

      let html = rendered
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
        .replace(/_(.*?)_/g, '<em>$1</em>')
        .replace(/~(.*?)~/g, '<del>$1</del>')
        .replace(/\n/g, '<br>');

      habitModalPreviewText.innerHTML = html;
      if (habitModalPreviewContact) habitModalPreviewContact.textContent = `${h.icon || '⭐'} ${title}`;
      if (habitModalPreviewTime) habitModalPreviewTime.textContent = `${h.reminderTime || '08:00'} ✓✓`;
    };

    const openHabitMsgModal = (habitId) => {
      const h = cachedHabits.find(x => x.id === habitId) || cachedHabits[0];
      if (!h || !habitMsgModal) return;
      currentSelectedHabitId = h.id;
      const title = (en() && h.titleEn) ? h.titleEn : (h.title || '');
      if (habitModalHabitBadge) habitModalHabitBadge.textContent = `${h.icon || '⭐'} ${title}`;
      if (habitModalSub) habitModalSub.textContent = en() ? `Customize WhatsApp reminder format for: ${title}` : `تخصيص الصياغة الذكية لعادة: ${title}`;
      if (habitModalTemplate) {
        habitModalTemplate.value = h.reminderTemplate || h.reminderCustomText || getDefaultHabitTemplate(h);
      }
      if (habitModalStatus) habitModalStatus.textContent = '';
      updateHabitModalLivePreview(h);
      habitMsgModal.hidden = false;
    };

    const closeHabitMsgModal = () => {
      if (habitMsgModal) habitMsgModal.hidden = true;
    };

    if (btnOpenHabitMsgModalAll) btnOpenHabitMsgModalAll.onclick = () => openHabitMsgModal(currentSelectedHabitId);
    if (btnOpenHabitMsgModalSpecific) btnOpenHabitMsgModalSpecific.onclick = () => openHabitMsgModal(currentSelectedHabitId);
    if (habitMsgModalCloseBtn) habitMsgModalCloseBtn.onclick = closeHabitMsgModal;
    if (habitModalCloseBtn2) habitModalCloseBtn2.onclick = closeHabitMsgModal;
    if (habitMsgModal) {
      habitMsgModal.onclick = (e) => {
        if (e.target === habitMsgModal) closeHabitMsgModal();
      };
    }

    if (habitModalTemplate) {
      habitModalTemplate.oninput = () => updateHabitModalLivePreview();
    }

    // Presets Buttons
    const setPreset = (tpl) => {
      if (habitModalTemplate) {
        habitModalTemplate.value = tpl;
        updateHabitModalLivePreview();
      }
    };

    $('#waHabitPresetMotivational')?.addEventListener('click', () => {
      setPreset(en()
        ? `⏰ *[HABIT REMINDER]* {habit}\n\n🔥 *Current Streak:* {streak} days! Keep the momentum strong!\n🎯 Target: {target}\n\n💡 Every single step counts towards mastery. You've got this! ✨\n✅ Mark it done in Mirqat Widgets!`
        : `⏰ *[تذكير بموعد العادة]* {habit}\n\n🔥 *سلسلة الالتزام:* {streak} أيام متواصلة! استمر ولا تقطع السلسلة!\n📌 الهدف اليومي: {target}\n\n💡 استعن بالله ولا تعجز، خطوة واحدة تصنع فارقاً عظيماً في يومك! ✨\n✅ سجّلها في تطبيق مرقاة عند الإنجاز!`);
    });

    $('#waHabitPresetSpiritual')?.addEventListener('click', () => {
      setPreset(en()
        ? `⏰ *[BLESSED ROUTINE REMINDER]* {habit}\n\n🌸 Time for: *{habit}*\n🎯 Daily Target: {target}\n\n🌿 Consistency is the key to enduring barakah.\nMay this habit bring focus, peace, and growth to your day. 🤲`
        : `⏰ *[تذكير بالورد والطاعة]* {habit}\n\n🌸 موعدك الآن مع: *{habit}*\n📌 المقدار المستهدف: {target}\n\n🌿 _"أحب الأعمال إلى الله أدومها وإن قل"_\nبارك الله في وقتك وعملك وجعله في ميزان حسناتك. 🤲`);
    });

    $('#waHabitPresetDetailed')?.addEventListener('click', () => {
      setPreset(en()
        ? `⏰ *[DAILY HABIT CHECK]* {habit}\n\n🎯 *Target:* {target}\n⏰ *Scheduled Time:* {time}\n🔥 *Streak:* {streak} days\n📌 *Anchor Cue:* {cue}\n\n📝 *Notes:* {note}\n✅ Log your completion once done!`
        : `⏰ *[تذكير الإنجاز اليومي]* {habit}\n\n🎯 *الهدف المستهدف:* {target}\n⏰ *وقت التنفيذ المحدد:* {time}\n🔥 *أيام الالتزام المتصلة:* {streak} يوم\n📌 *المحفز المرتبط:* {cue}\n\n📝 *ملاحظة:* {note}\n✅ بانتظار إتمامك لتسجيل النتيجة في النظام!`);
    });

    $('#waHabitPresetMinimal')?.addEventListener('click', () => {
      setPreset(en()
        ? `⏰ Time for: *{habit}* ({target})\n🔥 Streak: {streak} days! Let's get it done! ✅`
        : `⏰ حان الآن موعد: *{habit}* ({target})\n🔥 رصيدك: {streak} يوم متواصل! انطلق لإنجازها الآن! ✅`);
    });

    // Tag Insertion
    $$('#waHabitModalTagsList .wa-tag-chip').forEach(chip => {
      chip.onclick = () => {
        const tag = chip.dataset.tag;
        if (!tag || !habitModalTemplate) return;
        const start = habitModalTemplate.selectionStart || habitModalTemplate.value.length;
        const end = habitModalTemplate.selectionEnd || habitModalTemplate.value.length;
        const cur = habitModalTemplate.value;
        habitModalTemplate.value = cur.slice(0, start) + tag + cur.slice(end);
        habitModalTemplate.selectionStart = habitModalTemplate.selectionEnd = start + tag.length;
        habitModalTemplate.focus();
        updateHabitModalLivePreview();
      };
    });

    // Save in Modal
    if (habitModalSaveBtn) {
      habitModalSaveBtn.onclick = () => {
        const targetHabit = cachedHabits.find(x => x.id === currentSelectedHabitId);
        if (!targetHabit || !habitModalTemplate) return;
        targetHabit.reminderTemplate = habitModalTemplate.value.trim();
        targetHabit.reminderCustomText = targetHabit.reminderTemplate;
        if (window.widgets?.habits?.saveHabit) {
          window.widgets.habits.saveHabit(targetHabit);
        }
        if (habitModalStatus) {
          habitModalStatus.style.color = '#10b981';
          habitModalStatus.textContent = en() ? '✓ Saved template for habit!' : '✓ تم حفظ الصياغة للعادة بنجاح!';
        }
        showSavedIndicator();
        showQuickSavedIndicator();
      };
    }

    // Test Send in Modal
    if (habitModalTestSendBtn) {
      habitModalTestSendBtn.onclick = async () => {
        const targetHabit = cachedHabits.find(x => x.id === currentSelectedHabitId);
        if (!targetHabit) return;
        if (habitModalTemplate) {
          targetHabit.reminderTemplate = habitModalTemplate.value.trim();
          targetHabit.reminderCustomText = targetHabit.reminderTemplate;
          if (window.widgets?.habits?.saveHabit) {
            await window.widgets.habits.saveHabit(targetHabit);
          }
        }
        habitModalTestSendBtn.disabled = true;
        if (habitModalStatus) {
          habitModalStatus.style.color = 'var(--ink-3)';
          habitModalStatus.textContent = en() ? '⏳ Sending test...' : '⏳ جاري إرسال التنبيه...';
        }
        try {
          const res = await (window.widgets?.habits?.testHabitReminder
            ? window.widgets.habits.testHabitReminder({ habitId: targetHabit.id, lang: s.language || 'ar' })
            : { ok: false, error: 'unavailable' });
          if (res?.ok || res?.success) {
            if (habitModalStatus) {
              habitModalStatus.style.color = '#10b981';
              habitModalStatus.textContent = en() ? '✅ Sent successfully to WhatsApp!' : '✅ تم الإرسال بنجاح إلى واتساب!';
            }
          } else {
            if (habitModalStatus) {
              habitModalStatus.style.color = '#ef4444';
              habitModalStatus.textContent = en() ? `❌ Failed: ${res?.error || 'error'}` : `❌ فشل: ${res?.error || 'خطأ'}`;
            }
          }
        } catch (err) {
          if (habitModalStatus) {
            habitModalStatus.style.color = '#ef4444';
            habitModalStatus.textContent = `❌ ${err.message || 'Error'}`;
          }
        } finally {
          habitModalTestSendBtn.disabled = false;
        }
      };
    }

    if (testBtn) {
      testBtn.onclick = async () => {
        const targetHabit = cachedHabits.find(h => h.id === currentSelectedHabitId);
        if (!targetHabit) return;
        testBtn.disabled = true;
        if (testStatus) testStatus.textContent = en() ? '⏳ Sending...' : '⏳ جاري الإرسال...';
        try {
          const res = await (window.widgets?.habits?.testHabitReminder
            ? window.widgets.habits.testHabitReminder({ habitId: targetHabit.id, lang: s.language || 'ar' })
            : { ok: false, error: 'unavailable' });
          if (res?.ok || res?.success) {
            if (testStatus) {
              testStatus.style.color = '#10b981';
              testStatus.textContent = en() ? '✅ Sent successfully!' : '✅ تم الإرسال بنجاح!';
            }
          } else {
            if (testStatus) {
              testStatus.style.color = '#ef4444';
              testStatus.textContent = en() ? `❌ Failed: ${res?.error || 'error'}` : `❌ فشل: ${res?.error || 'خطأ'}`;
            }
          }
        } catch (err) {
          if (testStatus) {
            testStatus.style.color = '#ef4444';
            testStatus.textContent = `❌ ${err.message || 'Error'}`;
          }
        } finally {
          testBtn.disabled = false;
          setTimeout(() => { if (testStatus) testStatus.textContent = ''; }, 4000);
        }
      };
    }

    try {
      if (window.widgets?.habits?.getState) {
        const state = await window.widgets.habits.getState();
        cachedHabits = (state?.habits || []).filter(h => !h.archived);
        renderHabits();
      }
    } catch (_err) {}

    if (window.widgets?.habits?.onChange) {
      window.widgets.habits.onChange((newList) => {
        if (Array.isArray(newList)) {
          cachedHabits = newList.filter(h => !h.archived);
          renderHabits();
        }
      });
    }
  };

  setupHabitRemindersCustomizer();

  // ── Interactive Template Builder, Presets & Live Preview ──
  const PRESETS_AR = {
    quick: '🚨 تنبيه تسليم عاجل!\n📌 المهمة: {taskTitle}\n📚 المادة: {courseName}\n⏳ المتبقي: {timeLeft}\n🔗 رابط المهمة: {link}',
    detailed: '📚 مقرر: {courseName}\n📌 التكليف: {taskTitle}\n⚠️ درجة الأهمية: {priority}\n⏳ الموعد النهائي: {deadline} (متبقي {timeLeft})\n🔗 الرابط المباشر للتسليم: {link}',
    formal: 'السلام عليكم ورحمة الله وبركاته،\nإشعار رسمي من {senderName}:\nلديك تكليف جديد مطلوب تسليمه لمادة {courseName}.\n📌 عنوان التكليف: "{taskTitle}"\n⏳ آخر موعد لقبول الحل: {deadline} ({timeLeft})\n🔗 يرجى مراجعة المهمة وتسليمها عبر الرابط:\n{link}',
  };

  const PRESETS_EN = {
    quick: '🚨 Urgent Assignment Alert!\n📌 Task: {taskTitle}\n📚 Course: {courseName}\n⏳ Time Left: {timeLeft}\n🔗 Link: {link}',
    detailed: '📚 Course: {courseName}\n📌 Task: {taskTitle}\n⚠️ Urgency: {priority}\n⏳ Deadline: {deadline} ({timeLeft} remaining)\n🔗 Submission Link: {link}',
    formal: 'Hello,\nFormal Notification from {senderName}:\nYou have an upcoming assignment due for {courseName}.\n📌 Title: "{taskTitle}"\n⏳ Final Deadline: {deadline} ({timeLeft})\n🔗 Please review and submit via:\n{link}',
  };

  const currentPresets = () => (en() ? PRESETS_EN : PRESETS_AR);

  function applyPreset(text) {
    const editor = $('#waTemplate');
    if (!editor) return;
    editor.value = text;
    setGroup('whatsapp', { template: text });
    updatePreview();
  }

  if ($('#waPresetQuick')) $('#waPresetQuick').onclick = () => applyPreset(currentPresets().quick);
  if ($('#waPresetDetailed')) $('#waPresetDetailed').onclick = () => applyPreset(currentPresets().detailed);
  if ($('#waPresetFormal')) $('#waPresetFormal').onclick = () => applyPreset(currentPresets().formal);

  // Click tag chips to insert into template
  const chips = document.querySelectorAll('.wa-tag-chip');
  chips.forEach((chip) => {
    chip.onclick = () => {
      const tag = chip.dataset.tag;
      const editor = $('#waTemplate');
      if (!editor || !tag) return;
      const start = editor.selectionStart || editor.value.length;
      const end = editor.selectionEnd || editor.value.length;
      const val = editor.value;
      editor.value = val.slice(0, start) + tag + val.slice(end);
      editor.focus();
      editor.selectionStart = editor.selectionEnd = start + tag.length;
      setGroup('whatsapp', { template: editor.value });
      updatePreview();
    };
  });

  function updatePreview() {
    const editor = $('#waTemplate');
    const previewText = $('#waPreviewText');
    const contactEl = $('#waPreviewSenderName');
    const defaultSender = en() ? 'Assignment' : 'مساعد المهام';
    const sender = ($('#waSenderName')?.value || '').trim() || defaultSender;
    if (contactEl) contactEl.textContent = sender;

    const template = (editor?.value || '').trim() || currentPresets().quick;
    const formatted = template
      .replace(/\{taskTitle\}/g, en() ? 'Database Project (Deliverable 2)' : 'مشروع قواعد البيانات (Deliverable 2)')
      .replace(/\{courseName\}/g, en() ? 'Software Engineering' : 'هندسة البرمجيات')
      .replace(/\{deadline\}/g, en() ? 'Tomorrow, 11:59 PM' : 'غداً، 11:59 م')
      .replace(/\{timeLeft\}/g, en() ? '23 hrs 15 mins' : '23 ساعة و 15 دقيقة')
      .replace(/\{priority\}/g, en() ? 'High Urgency 🚨' : 'عاجلة جداً 🚨')
      .replace(/\{link\}/g, 'https://classroom.google.com/c/demo')
      .replace(/\{senderName\}/g, sender);

    if (previewText) previewText.textContent = formatted;

    const previewTime = $('#waPreviewTime');
    if (previewTime) {
      previewTime.textContent = en() ? '11:59 PM ✓✓' : '11:59 م ✓✓';
    }
  }

  const isDefaultArPreset = !wa.template || Object.values(PRESETS_AR).includes(wa.template);
  const isDefaultEnPreset = Object.values(PRESETS_EN).includes(wa.template);
  let initialTemplate = wa.template;
  if (!initialTemplate) {
    initialTemplate = currentPresets().quick;
  } else if (en() && isDefaultArPreset) {
    initialTemplate = PRESETS_EN.quick;
  } else if (!en() && isDefaultEnPreset) {
    initialTemplate = PRESETS_AR.quick;
  }

  if ($('#waTemplate')) {
    $('#waTemplate').value = initialTemplate;
    $('#waTemplate').oninput = (e) => {
      setGroup('whatsapp', { template: e.target.value.trim() });
      updatePreview();
    };
  }
  updatePreview();

  if ($('#waApiKey')) $('#waApiKey').value = wa.apiKey || '';
  if ($('#waGatewayUrl')) $('#waGatewayUrl').value = wa.gatewayUrl || 'http://localhost:2785';
  if ($('#waSessionId')) $('#waSessionId').value = wa.sessionId || 'default';
  if ($('#waFrequency')) $('#waFrequency').value = String(wa.frequencyMinutes ?? 15);

  // OpenWA local server state & polling
  let openwaPollTimer = null;
  const updateOpenWaServerStatus = async () => {
    if (!window.widgets?.openwa) return;
    try {
      const res = await window.widgets.openwa.status();
      const badge = $('#waServerBadge');
      const qrBox = $('#waQrBox');
      const qrImg = $('#waQrImg');
      if (!badge) return;

      if (!res || !res.online) {
        badge.textContent = t('s.waStatusStopped');
        badge.className = 'wa-status-pill stopped';
        if (qrBox) qrBox.style.display = 'none';
        return;
      }

      if (res.connected) {
        badge.textContent = t('s.waStatusConnected');
        badge.className = 'wa-status-pill connected';
        if (qrBox) qrBox.style.display = 'none';
      } else if (res.needsQr || res.status === 'SCAN_QR_CODE') {
        badge.textContent = t('s.waStatusScan');
        badge.className = 'wa-status-pill scan';
        if (qrBox && qrImg) {
          qrBox.style.display = 'block';
          const qrData = await window.widgets.openwa.qr();
          if (qrData?.qr && qrImg.src !== qrData.qr) qrImg.src = qrData.qr;
        }
      } else {
        badge.textContent = t('s.waStatusChecking');
        badge.className = 'wa-status-pill';
        if (qrBox) qrBox.style.display = 'none';
      }
    } catch {
      const badge = $('#waServerBadge');
      if (badge) {
        badge.textContent = t('s.waStatusError');
        badge.className = 'wa-status-pill stopped';
      }
    }
  };

  const startOpenWaPolling = () => {
    if (openwaPollTimer) clearInterval(openwaPollTimer);
    updateOpenWaServerStatus();
    openwaPollTimer = setInterval(updateOpenWaServerStatus, 2500);
  };

  const updateProviderUI = (prov) => {
    const isCallMeBot = prov === 'callmebot';
    if ($('#waCallMeBotFields')) $('#waCallMeBotFields').style.display = isCallMeBot ? 'block' : 'none';
    if ($('#waOpenWaFields')) $('#waOpenWaFields').style.display = isCallMeBot ? 'none' : 'block';
    if (isCallMeBot) {
      if (openwaPollTimer) { clearInterval(openwaPollTimer); openwaPollTimer = null; }
    } else {
      startOpenWaPolling();
    }
  };
  updateProviderUI(currentProvider);

  if ($('#waProvider')) {
    $('#waProvider').onchange = (e) => {
      const prov = e.target.value;
      updateProviderUI(prov);
      setGroup('whatsapp', { provider: prov });
    };
  }

  switchEl('#waAutoStartServer', wa.autoStartServer !== false, (v) => setGroup('whatsapp', { autoStartServer: v }));

  if ($('#waStartServerBtn')) {
    $('#waStartServerBtn').onclick = async () => {
      const btn = $('#waStartServerBtn');
      const badge = $('#waServerBadge');
      btn.disabled = true;
      if (badge) {
        badge.textContent = t('s.waStatusStarting');
        badge.className = 'wa-status-pill';
      }
      try {
        await window.widgets.openwa.start();
        setTimeout(updateOpenWaServerStatus, 1000);
      } catch {
        if (badge) {
          badge.textContent = t('s.waStatusError');
          badge.className = 'wa-status-pill stopped';
        }
      } finally {
        btn.disabled = false;
      }
    };
  }

  if ($('#waStopServerBtn')) {
    $('#waStopServerBtn').onclick = async () => {
      const btn = $('#waStopServerBtn');
      btn.disabled = true;
      try {
        await window.widgets.openwa.stop();
        setTimeout(updateOpenWaServerStatus, 500);
      } finally {
        btn.disabled = false;
      }
    };
  }

  if ($('#waRefreshStatusBtn')) {
    $('#waRefreshStatusBtn').onclick = () => updateOpenWaServerStatus();
  }

  if ($('#waOpenQrBrowserBtn')) {
    $('#waOpenQrBrowserBtn').onclick = () => {
      window.widgets.openExternal('http://localhost:2785/scan');
    };
  }

  if ($('#waOpenBotBtn')) {
    $('#waOpenBotBtn').onclick = () => {
      window.widgets.openExternal('https://wa.me/34623786449?text=I+allow+callmebot+to+send+me+messages');
    };
  }

  if ($('#waOpenBot2Btn')) {
    $('#waOpenBot2Btn').onclick = () => {
      window.widgets.openExternal('https://wa.me/34623912204?text=I+allow+callmebot+to+send+me+messages');
    };
  }

  if ($('#waOpenHelpLink')) {
    $('#waOpenHelpLink').onclick = () => {
      window.widgets.openExternal('https://www.callmebot.com/blog/free-api-whatsapp-messages/');
    };
  }

  if ($('#waApiKey')) $('#waApiKey').onchange = (e) => setGroup('whatsapp', { apiKey: e.target.value.trim() });
  if ($('#waGatewayUrl')) $('#waGatewayUrl').onchange = (e) => setGroup('whatsapp', { gatewayUrl: e.target.value.trim() });
  if ($('#waSessionId')) $('#waSessionId').onchange = (e) => setGroup('whatsapp', { sessionId: e.target.value.trim() });
  if ($('#waFrequency')) $('#waFrequency').onchange = (e) => setGroup('whatsapp', { frequencyMinutes: Number(e.target.value) });

  if ($('#waTestBtn')) {
    $('#waTestBtn').onclick = async () => {
      const btn = $('#waTestBtn');
      const status = $('#waTestStatus');
      const provider = ($('#waProvider')?.value || 'openwa').toLowerCase();
      const validNumbers = phoneNumbers.map((p) => p.trim()).filter(Boolean);
      const isGroup = $('#waSendToGroup')?.getAttribute('aria-checked') === 'true';
      const groupId = ($('#waGroupId')?.value || '').trim();

      if (!validNumbers.length && (!isGroup || !groupId)) {
        if (status) {
          status.textContent = t('s.waPhone');
          status.style.color = '#ef4444';
        }
        return;
      }
      btn.disabled = true;
      if (status) {
        status.textContent = t('s.waTesting');
        status.style.color = 'var(--accent)';
      }
      try {
        const cfg = {
          provider,
          phoneNumbers: validNumbers,
          phone: validNumbers.join(', '),
          sendToGroup: isGroup,
          groupId,
          senderName: ($('#waSenderName')?.value || '').trim(),
          template: ($('#waTemplate')?.value || '').trim(),
          apiKey: ($('#waApiKey')?.value || '').trim(),
          gatewayUrl: ($('#waGatewayUrl')?.value || '').trim() || 'http://localhost:2785',
          sessionId: ($('#waSessionId')?.value || '').trim() || 'default',
        };
        const res = await window.widgets.whatsapp.test(cfg);
        if (res && res.ok) {
          if (status) {
            status.textContent = t('s.waTestOk');
            status.style.color = '#10b981';
          }
        } else if (status) {
          status.textContent = t('s.waTestFail', { err: res?.error || 'Error' });
          status.style.color = '#ef4444';
        }
      } catch (err) {
        if (status) {
          status.textContent = t('s.waTestFail', { err: err.message });
          status.style.color = '#ef4444';
        }
      } finally {
        btn.disabled = false;
      }
    };
  }
}

function buildInterval() {
  const sel = $('#interval');
  sel.replaceChildren(...INTERVALS.map((h) => el('option', { value: String(h) },
    h === 1 ? t('s.everyHour') : t(h <= 10 ? 's.everyHours' : 's.everyHoursMany', { n: digits(h) }))));
  sel.value = String(s.quranIntervalHours ?? 6);
}

function buildTafsirPicker() {
  const sel = $('#tafsir');
  const list = (sources && sources.editions) || [];
  sel.replaceChildren(...list.map((e) =>
    el('option', { value: e.slug, selected: e.slug === s.tafsir }, en() ? `${e.en} · ${e.ar}` : e.ar)
  ));
  updateTafsirNote();
}

function updateTafsirNote() {
  const list = (sources && sources.editions) || [];
  const cur = list.find((e) => e.slug === s.tafsir);
  $('#tafsirNote').textContent = cur
    ? (en() ? [cur.authorEn || cur.en] : [cur.authorAr, cur.noteAr]).filter(Boolean).join(' — ')
    : '';
}

function buildTranslationPicker() {
  const sel = $('#translation');
  const list = (sources && sources.translations) || [];
  sel.replaceChildren(...list.map((x) =>
    el('option', { value: x.slug, selected: x.slug === s.translation }, en() ? x.en : x.ar)
  ));
  $('#trRow').hidden = !s.showTranslation;
}

function buildSources() {
  if (!sources) return;
  const rows = [
    [t('s.srcText'), `${en() ? sources.text.en : sources.text.ar} — ${sources.text.scriptAr}`],
    [t('s.srcVerify'), t('s.srcVerifyVal', { name: en() ? sources.verifier.en : sources.verifier.ar })],
    [t('s.srcTafsir'), t('s.srcTafsirVal', { n: digits(sources.editions.length) })],
    [t('s.srcHadith'), t('s.srcHadithVal')],
  ];
  $('#sources').replaceChildren(...rows.map(([k, v]) =>
    el('div', { class: 'src-row' },
      el('span', { class: 'src-key', text: k }),
      el('span', { class: 'src-val', text: v })
    )
  ));
}

/**
 * One row per widget: name, size preset, exact width × height, a lock that
 * stops it moving or resizing, and a show/hide switch.
 */
function buildWidgetRows() {
  const w = s.widgets || {};
  const ids = WIDGET_ORDER.filter((id) => catalog[id]);
  const isAr = lang() === 'ar';
  const sizeLabels = {
    icon: isAr ? 'أيقونة' : 'Icon',
    xs: isAr ? 'صغير جدًا' : 'Extra small',
    s: isAr ? 'صغير' : 'Small',
    m: isAr ? 'متوسط' : 'Medium',
    l: isAr ? 'كبير' : 'Large',
    xl: isAr ? 'كبير جدًا' : 'Extra large',
    wide: isAr ? 'عريض' : 'Wide banner',
    tall: isAr ? 'طولي' : 'Tall tower',
    max: isAr ? 'موسع كامل' : 'Expanded max',
  };
  const widgetLabels = {
    clock: isAr ? '⏰ الساعة ومواقيت الصلاة' : '⏰ Clock & Prayer',
    pomodoro: isAr ? '⏳ مؤقت التركيز وبومودورو' : '⏳ Focus & Pomodoro',
    calendar: isAr ? '🗓️ التقويم والمناسبات' : '🗓️ Calendar & Events',
    habits: isAr ? '🔥 متتبع العادات والعافية' : '🔥 Habits Tracker',
    quran: isAr ? '📖 المصحف الشريف والورد' : '📖 Quran & Tafsir',
    todo: isAr ? '📋 قائمة المهام والكلاسرووم' : '📋 Tasks & Classroom',
    notes: isAr ? '📝 الملاحظات السريعة' : '📝 Notes',
    email: isAr ? '📬 البريد الإلكتروني' : '📬 Email',
    photo: isAr ? '🖼️ إطار الصور' : '🖼️ Photo Frame',
  };

  $('#widgetRows').replaceChildren(...ids.map((id) => {
    const cap = id[0].toUpperCase() + id.slice(1);
    const info = catalog[id];
    const cleanId = String(id).replace(/^w\./, '');
    const size = el('select', { class: 'picker size', id: `size${cap}`, title: t('s.size') },
      ...info.sizes.map((k) => {
        const rawK = String(k).replace(/^(s\.)?size\./, '');
        const label = sizeLabels[rawK] || (rawK === 'icon' ? (isAr ? 'أيقونة' : 'Icon') : (sizeLabels[k] || (t(`s.size.${rawK}`) !== `s.size.${rawK}` ? t(`s.size.${rawK}`) : (t(`size.${rawK}`) !== `size.${rawK}` ? t(`size.${rawK}`) : rawK))));
        return el('option', { value: rawK, selected: (w[id]?.size || w[cleanId]?.size || 'm') === rawK }, label);
      }));
    size.addEventListener('change', () => window.widgets.widgetSize(id, size.value));

    const b = info.bounds || {};
    const num = (axis) => {
      const input = el('input', {
        class: 'field num dim', type: 'number', id: `${axis === 'w' ? 'width' : 'height'}${cap}`, step: '10',
        min: String(info.min ? info.min[axis === 'w' ? 0 : 1] : 120),
        title: t(axis === 'w' ? 's.width' : 's.height'),
        value: String((axis === 'w' ? b.width : b.height) || ''),
      });
      input.addEventListener('change', async () => {
        const W = Number(document.getElementById(`width${cap}`).value);
        const H = Number(document.getElementById(`height${cap}`).value);
        const next = await window.widgets.widgetBounds(id, W, H);
        if (next) {
          document.getElementById(`width${cap}`).value = String(next.width);
          document.getElementById(`height${cap}`).value = String(next.height);
        }
      });
      return input;
    };

    const lock = el('button', {
      class: `icon-btn lock${w[id]?.locked ? ' on' : ''}`, id: `lock${cap}`, title: t('s.lockTitle'),
      onclick: async () => {
        const next = !document.getElementById(`lock${cap}`).classList.contains('on');
        document.getElementById(`lock${cap}`).classList.toggle('on', next);
        await window.widgets.widgetLock(id, next);
      },
    }, icon('pin'));

    const fallbackTitle = (cleanId === 'habits' ? (isAr ? 'متتبع العادات' : 'Habits Tracker') : info.title);
    const titleText = widgetLabels[cleanId] || widgetLabels[id] || (t(`w.${cleanId}`) !== `w.${cleanId}` ? t(`w.${cleanId}`) : (t(`w.${id}`) !== `w.${id}` ? t(`w.${id}`) : fallbackTitle));
    const sw = el('button', { class: 'switch', id: `w${cap}`, role: 'switch' });
    const row = el('div', { class: 'row switch-row widget-row' },
      el('label', { for: `w${cap}`, text: titleText }),
      size,
      el('span', { class: 'dims' }, num('w'), el('span', { class: 'times', text: '×' }), num('h')),
      lock,
      sw
    );
    switchEl(sw, w[id]?.visible, (v) => window.widgets.widgetsVisible(id, v));
    return row;
  }));
}

async function syncWidgetRows() {
  const w = s.widgets || {};
  try { catalog = await window.widgets.catalog(); } catch { /* keep the old one */ }
  for (const id of Object.keys(catalog)) {
    const cap = id[0].toUpperCase() + id.slice(1);
    const sw = document.getElementById(`w${cap}`);
    const size = document.getElementById(`size${cap}`);
    const lock = document.getElementById(`lock${cap}`);
    if (sw) sw.setAttribute('aria-checked', w[id]?.visible ? 'true' : 'false');
    if (size && w[id]?.size) size.value = w[id].size;
    if (lock) lock.classList.toggle('on', Boolean(w[id]?.locked));
    const b = catalog[id].bounds;
    for (const key of ['width', 'height']) {
      const input = document.getElementById(`${key}${cap}`);
      if (input && b && document.activeElement !== input) input.value = String(b[key]);
    }
  }

  const ovSwitch = $('#preventOpenWidgetsOverlap');
  if (ovSwitch) {
    const on = Boolean(s.preventOpenWidgetsOverlap);
    ovSwitch.classList.toggle('on', on);
    ovSwitch.setAttribute('aria-checked', on ? 'true' : 'false');
  }

  syncWidgetEnableSwitches();
}

const WIDGET_ENABLE_MAP = {
  clock: 'enableClockWidget',
  pomodoro: 'enablePomodoroWidget',
  calendar: 'enableCalendarWidget',
  habits: 'habitsEnabled',
  quran: 'enableQuranWidget',
  todo: 'enableTodoWidget',
  notes: 'enableNotesWidget',
  email: 'emailEnabled',
  photo: 'enablePhotoWidget',
};

function isWidgetEnabled(id) {
  const w = s.widgets || {};
  if (id === 'habits' && (w.habits?.visible === undefined || w.habits?.visible === null)) {
    return s.habits?.enabled !== false;
  }
  if (id === 'email' && (w.email?.visible === undefined || w.email?.visible === null)) {
    return Boolean(s.email?.enabled);
  }
  return Boolean(w[id]?.visible);
}

function syncWidgetEnableSwitches() {
  for (const [id, elId] of Object.entries(WIDGET_ENABLE_MAP)) {
    const btn = document.getElementById(elId);
    if (!btn) continue;
    btn.setAttribute('aria-checked', isWidgetEnabled(id) ? 'true' : 'false');
  }
}

function wireWidgetEnableSwitches() {
  for (const [id, elId] of Object.entries(WIDGET_ENABLE_MAP)) {
    const btn = document.getElementById(elId);
    if (!btn) continue;
    switchEl(btn, isWidgetEnabled(id), async (next) => {
      await window.widgets.widgetsVisible(id, next);
      if (id === 'habits') {
        await setGroup('habits', { enabled: next });
      } else if (id === 'email') {
        await setGroup('email', { enabled: next });
      }
      if (s.widgets && s.widgets[id]) {
        s.widgets[id].visible = next;
      }
      syncWidgetEnableSwitches();
      syncWidgetRows();
    });
  }
}

/* ---------- fonts ---------- */

function look() {
  return { ...LOOK_DEFAULTS, ...(s.look || {}) };
}

function buildFontCards() {
  for (const [key, list] of Object.entries(FONT_CHOICES)) {
    const curFont = getEffectiveFont(key);
    $(`#${key}`).replaceChildren(...list.map(([id, name, family]) => el('button', {
      class: `font-card${curFont === id ? ' on' : ''}`,
      dataset: { font: id },
      title: name,
      onclick: () => {
        if (currentScope === 'global') {
          setGroup('look', { [key]: id });
        } else {
          saveScopedStyle(key, id);
        }
        for (const c of document.querySelectorAll(`#${key} .font-card`)) c.classList.toggle('on', c.dataset.font === id);
        syncAppearanceScopeUI();
      },
    },
      el('span', { class: 'font-sample', style: `font-family:${family}`, text: SAMPLES[key] }),
      el('span', { class: 'font-name', text: name }))));
  }
}

function markFontCards() {
  for (const key of Object.keys(FONT_CHOICES)) {
    const curFont = getEffectiveFont(key);
    for (const c of document.querySelectorAll(`#${key} .font-card`)) {
      c.classList.toggle('on', c.dataset.font === curFont);
    }
  }
}

function syncTypographyControls() {
  const curUi = getEffectiveLookProp('uiWeight');
  const curNum = getEffectiveLookProp('numWeight');
  const curSpacing = getEffectiveLookProp('numSpacing');
  const curLH = getEffectiveLookProp('lineHeight');

  const sel = $('#uiWeight');
  if (sel) sel.value = String(curUi ?? 400);

  const numW = $('#numWeight');
  const numWOut = $('#numWeightOut');
  if (numW) numW.value = String(curNum ?? 300);
  if (numWOut) numWOut.textContent = digits(curNum ?? 300);

  const numS = $('#numSpacing');
  const numSOut = $('#numSpacingOut');
  const spVal = Math.round((curSpacing ?? -0.02) * 100);
  if (numS) numS.value = String(spVal);
  if (numSOut) numSOut.textContent = digits(spVal);

  const lh = $('#lineHeight');
  const lhOut = $('#lineHeightOut');
  const lhVal = Math.round((curLH ?? 1) * 100);
  if (lh) lh.value = String(lhVal);
  if (lhOut) lhOut.textContent = pct(lhVal);
}

function buildTypography() {
  const cur = look();
  const sel = $('#uiWeight');
  sel.replaceChildren(...[300, 400, 500, 600].map((w) => el('option', { value: String(w), selected: cur.uiWeight === w }, t(`s.w${w}`))));
  sel.onchange = (e) => {
    const val = Number(e.target.value);
    if (currentScope === 'global') setGroup('look', { uiWeight: val });
    else saveScopedStyle('uiWeight', val);
    syncAppearanceScopeUI();
  };
  range('#numWeight', '#numWeightOut', cur.numWeight, (v) => digits(v), (v) => {
    if (currentScope === 'global') setGroup('look', { numWeight: v });
    else saveScopedStyle('numWeight', v);
    syncAppearanceScopeUI();
  });
  range('#numSpacing', '#numSpacingOut', Math.round(cur.numSpacing * 100), (v) => digits(v), (v) => {
    if (currentScope === 'global') setGroup('look', { numSpacing: v / 100 });
    else saveScopedStyle('numSpacing', v / 100);
    syncAppearanceScopeUI();
  });
  range('#lineHeight', '#lineHeightOut', Math.round(cur.lineHeight * 100), pct, (v) => {
    if (currentScope === 'global') setGroup('look', { lineHeight: v / 100 });
    else saveScopedStyle('lineHeight', v / 100);
    syncAppearanceScopeUI();
  });

  buildFontColorSwatches();
  markFontColorSwatches();

  if ($('#fontColorPick') && !$('#fontColorPick')._bound) {
    $('#fontColorPick')._bound = true;
    $('#fontColorPick').addEventListener('input', (e) => setFontColor(e.target.value));
  }
  if ($('#fontColorResetBtn') && !$('#fontColorResetBtn')._bound) {
    $('#fontColorResetBtn')._bound = true;
    $('#fontColorResetBtn').addEventListener('click', () => setFontColor('inherit'));
  }
}

/* ---------- glass and motion ---------- */

function syncLookControls() {
  const curTint = getEffectiveLookProp('tint') || '';
  const curTintStrength = Math.round((getEffectiveLookProp('tintStrength') ?? 0.25) * 100);
  const curEdge = Math.round((getEffectiveLookProp('edge') ?? 1) * 100);
  const curHover = Math.round((getEffectiveLookProp('hover') ?? 1) * 100);
  const curSheen = getEffectiveLookProp('sheenRadius') ?? 240;
  const curBorderWidth = getEffectiveLookProp('borderWidth') ?? 1;
  const curMotion = getEffectiveLookProp('motion') ?? 1;
  const curDensity = getEffectiveLookProp('density') || 'normal';
  const curContrast = getEffectiveLookProp('contrast') || 'normal';
  const curGrain = getEffectiveLookProp('grain') !== false;

  for (const n of document.querySelectorAll('#tintSwatches .swatch')) {
    n.classList.toggle('on', (n.dataset.color || '') === curTint);
  }

  const ts = $('#tintStrength');
  const tsOut = $('#tintStrengthOut');
  if (ts) ts.value = String(curTintStrength);
  if (tsOut) tsOut.textContent = pct(curTintStrength);

  const ed = $('#edge');
  const edOut = $('#edgeOut');
  if (ed) ed.value = String(curEdge);
  if (edOut) edOut.textContent = pct(curEdge);

  const hv = $('#hover');
  const hvOut = $('#hoverOut');
  if (hv) hv.value = String(curHover);
  if (hvOut) hvOut.textContent = pct(curHover);

  const sh = $('#sheenRadius');
  const shOut = $('#sheenRadiusOut');
  if (sh) sh.value = String(curSheen);
  if (shOut) shOut.textContent = `${digits(curSheen)}px`;

  if ($('#borderWidth')) $('#borderWidth').value = String(curBorderWidth);
  if ($('#motion')) $('#motion').value = String(curMotion);
  if ($('#density')) $('#density').value = curDensity;
  if ($('#contrast')) $('#contrast').value = curContrast;
  if ($('#grain')) $('#grain').setAttribute('aria-checked', curGrain ? 'true' : 'false');
}

function buildLook() {
  const cur = look();
  $('#tintSwatches').replaceChildren(...TINTS.map((c) => el('button', {
    class: `swatch tint${(cur.tint || '') === c ? ' on' : ''}${c ? '' : ' none'}`,
    style: c ? `background:${c}` : '',
    dataset: { color: c },
    title: c || t('s.tintNone'),
    onclick: () => {
      if (currentScope === 'global') setGroup('look', { tint: c });
      else saveScopedStyle('tint', c);
      for (const n of document.querySelectorAll('#tintSwatches .swatch')) n.classList.toggle('on', n.dataset.color === c);
      syncAppearanceScopeUI();
    },
  })));
  range('#tintStrength', '#tintStrengthOut', Math.round(cur.tintStrength * 100), pct, (v) => {
    if (currentScope === 'global') setGroup('look', { tintStrength: v / 100 });
    else saveScopedStyle('tintStrength', v / 100);
    syncAppearanceScopeUI();
  });
  range('#edge', '#edgeOut', Math.round(cur.edge * 100), pct, (v) => {
    if (currentScope === 'global') setGroup('look', { edge: v / 100 });
    else saveScopedStyle('edge', v / 100);
    syncAppearanceScopeUI();
  });
  range('#hover', '#hoverOut', Math.round(cur.hover * 100), pct, (v) => {
    if (currentScope === 'global') setGroup('look', { hover: v / 100 });
    else saveScopedStyle('hover', v / 100);
    syncAppearanceScopeUI();
  });
  range('#sheenRadius', '#sheenRadiusOut', cur.sheenRadius !== undefined ? cur.sheenRadius : 240, (v) => `${digits(v)}px`, (v) => {
    if (currentScope === 'global') setGroup('look', { sheenRadius: v });
    else saveScopedStyle('sheenRadius', v);
    syncAppearanceScopeUI();
  });
  $('#borderWidth').value = String(cur.borderWidth);
  $('#borderWidth').onchange = (e) => {
    const val = Number(e.target.value);
    if (currentScope === 'global') setGroup('look', { borderWidth: val });
    else saveScopedStyle('borderWidth', val);
    syncAppearanceScopeUI();
  };
  $('#motion').value = String(cur.motion);
  $('#motion').onchange = (e) => {
    const val = Number(e.target.value);
    if (currentScope === 'global') setGroup('look', { motion: val });
    else saveScopedStyle('motion', val);
    syncAppearanceScopeUI();
  };
  $('#density').value = cur.density;
  $('#density').onchange = (e) => {
    const val = e.target.value;
    if (currentScope === 'global') setGroup('look', { density: val });
    else saveScopedStyle('density', val);
    syncAppearanceScopeUI();
  };
  $('#contrast').value = cur.contrast;
  $('#contrast').onchange = (e) => {
    const val = e.target.value;
    if (currentScope === 'global') setGroup('look', { contrast: val });
    else saveScopedStyle('contrast', val);
    syncAppearanceScopeUI();
  };
  switchEl('#grain', cur.grain, (v) => {
    if (currentScope === 'global') setGroup('look', { grain: v });
    else saveScopedStyle('grain', v);
    syncAppearanceScopeUI();
  });
}

/* ---------- eco & laptop battery saver ---------- */

let currentEcoScope = 'global';
let ecoPowerSubscribed = false;

const ECO_WIDGET_LIST = [
  { id: 'clock', icon: '⏰', nameAr: 'الساعة', nameEn: 'Clock' },
  { id: 'pomodoro', icon: '⏳', nameAr: 'بومودورو', nameEn: 'Pomodoro' },
  { id: 'calendar', icon: '📅', nameAr: 'التقويم', nameEn: 'Calendar' },
  { id: 'todo', icon: '📋', nameAr: 'المهام', nameEn: 'To-Do List' },
  { id: 'habits', icon: '🌱', nameAr: 'العادات', nameEn: 'Habits' },
  { id: 'quran', icon: '📖', nameAr: 'المصحف', nameEn: 'Quran' },
  { id: 'notes', icon: '📝', nameAr: 'الملاحظات', nameEn: 'Notes' },
  { id: 'email', icon: '📬', nameAr: 'البريد', nameEn: 'Email' },
  { id: 'photo', icon: '🖼️', nameAr: 'الصور', nameEn: 'Photo Frame' },
  { id: 'folder', icon: '📁', nameAr: 'الصندوق', nameEn: 'Folder' },
];

function getWidgetEcoConfig(wid) {
  if (!s.eco || !s.eco.widgets) return null;
  return s.eco.widgets[wid] || null;
}

function getEffectiveWidgetEco(wid) {
  const eco = s.eco || { mode: 'auto', sleepMini: true, pauseOnLock: true, lightShaders: true };
  const globalMode = eco.mode || 'auto';
  const globalSleepMini = eco.sleepMini !== false;
  const globalPauseOnLock = eco.pauseOnLock !== false;
  const globalLightShaders = eco.lightShaders !== false;

  if (!wid || wid === 'global') {
    return {
      mode: globalMode,
      sleepMini: globalSleepMini,
      pauseOnLock: globalPauseOnLock,
      lightShaders: globalLightShaders,
      isCustom: false,
      rawCustom: {},
    };
  }

  const custom = getWidgetEcoConfig(wid) || {};
  const hasCustom = Boolean(s.eco?.widgets?.[wid] && Object.keys(s.eco.widgets[wid]).length > 0);
  const mode = (custom.mode && custom.mode !== 'inherit') ? custom.mode : globalMode;
  const sleepMini = (custom.sleepMini !== undefined && custom.sleepMini !== 'inherit')
    ? custom.sleepMini !== false
    : globalSleepMini;
  const pauseOnLock = (custom.pauseOnLock !== undefined && custom.pauseOnLock !== 'inherit')
    ? custom.pauseOnLock !== false
    : globalPauseOnLock;
  const lightShaders = (custom.lightShaders !== undefined && custom.lightShaders !== 'inherit')
    ? custom.lightShaders !== false
    : globalLightShaders;

  return {
    mode,
    sleepMini,
    pauseOnLock,
    lightShaders,
    isCustom: hasCustom,
    rawCustom: custom,
  };
}

function updateEcoLiveBadge(powerStatus) {
  const badge = $('#ecoLiveBadge');
  if (!badge) return;
  const eff = getEffectiveWidgetEco(currentEcoScope);
  const mode = eff.mode;
  const onBat = Boolean(powerStatus?.onBattery);

  badge.className = 'eco-live-badge';
  if (onBat) {
    badge.classList.add('is-battery');
    badge.textContent = t('s.ecoBadgeBattery');
  } else if (mode === 'always') {
    badge.classList.add('is-always');
    badge.textContent = t('s.ecoBadgeAlways');
  } else {
    badge.classList.add('is-ac');
    badge.textContent = t('s.ecoBadgeAc');
  }
}

function setEcoProp(prop, value) {
  if (currentEcoScope === 'global') {
    setGroup('eco', { [prop]: value });
  } else {
    const curEco = s.eco || {};
    const curWidgets = { ...(curEco.widgets || {}) };
    const curWid = { ...(curWidgets[currentEcoScope] || {}) };

    if (value === 'inherit') {
      delete curWid[prop];
    } else {
      curWid[prop] = value;
    }

    if (Object.keys(curWid).length === 0) {
      delete curWidgets[currentEcoScope];
    } else {
      curWidgets[currentEcoScope] = curWid;
    }

    setGroup('eco', { widgets: curWidgets });
  }
  syncEcoScopeUI();
  renderEcoMatrixGrid();
  if (window.widgets?.power?.getStatus) {
    window.widgets.power.getStatus().then(updateEcoLiveBadge).catch(() => {});
  }
}

function resetEcoScope() {
  if (currentEcoScope === 'global') return;
  const curEco = s.eco || {};
  const curWidgets = { ...(curEco.widgets || {}) };
  delete curWidgets[currentEcoScope];
  setGroup('eco', { widgets: curWidgets });
  syncEcoScopeUI();
  renderEcoMatrixGrid();
  if (window.widgets?.power?.getStatus) {
    window.widgets.power.getStatus().then(updateEcoLiveBadge).catch(() => {});
  }
}

function syncEcoScopeUI() {
  const scopeSel = $('#ecoScopeSelect');
  if (scopeSel && scopeSel.value !== currentEcoScope) {
    scopeSel.value = currentEcoScope;
  }

  const pill = $('#ecoScopeStatusPill');
  const resetBtn = $('#ecoScopeResetBtn');
  const hintEl = $('#ecoScopeHintText');
  const modeSel = $('#ecoMode');
  const inheritOpt = $('#ecoModeInheritOpt');

  const eff = getEffectiveWidgetEco(currentEcoScope);

  if (currentEcoScope === 'global') {
    if (inheritOpt) inheritOpt.style.display = 'none';
    if (pill) {
      pill.textContent = t('s.scopeStatusGlobal');
      pill.classList.remove('custom');
    }
    if (resetBtn) resetBtn.style.display = 'none';
    if (hintEl) hintEl.textContent = t('s.ecoScopeGlobalHint');
    if (modeSel) modeSel.value = eff.mode;
  } else {
    if (inheritOpt) inheritOpt.style.display = '';
    const isCustom = eff.isCustom;
    if (pill) {
      pill.textContent = isCustom ? t('s.scopeStatusCustom') : t('s.scopeStatusInherit');
      pill.classList.toggle('custom', isCustom);
    }
    if (resetBtn) resetBtn.style.display = isCustom ? 'inline-flex' : 'none';
    if (hintEl) hintEl.textContent = isCustom ? t('s.ecoScopeWidgetHint') : t('s.ecoScopeFollowsHint');
    if (modeSel) {
      modeSel.value = (eff.rawCustom && eff.rawCustom.mode !== undefined) ? eff.rawCustom.mode : 'inherit';
    }
  }

  const setSwitch = (id, val) => {
    const b = $(id);
    if (b) b.setAttribute('aria-checked', val ? 'true' : 'false');
  };

  setSwitch('#ecoSleepMini', eff.sleepMini !== false);
  setSwitch('#ecoPauseOnLock', eff.pauseOnLock !== false);
  setSwitch('#ecoLightShaders', eff.lightShaders !== false);
}

function renderEcoMatrixGrid() {
  const grid = $('#ecoMatrixGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const isEn = en();

  for (const w of ECO_WIDGET_LIST) {
    const eff = getEffectiveWidgetEco(w.id);
    const chip = document.createElement('div');
    chip.className = `eco-matrix-chip ${eff.isCustom ? 'is-custom' : 'is-inherited'} ${currentEcoScope === w.id ? 'is-active' : ''}`;
    chip.title = isEn ? `Click to configure ${w.nameEn}` : `اضغط لضبط ${w.nameAr}`;

    let modeText = '';
    if (eff.mode === 'off') modeText = isEn ? 'Off' : 'معطل';
    else if (eff.mode === 'always') modeText = isEn ? 'Always Eco' : 'توفير دائم';
    else modeText = isEn ? 'Auto (Battery)' : 'تلقائي';

    const sleepText = eff.sleepMini ? (isEn ? 'Freeze Mini' : 'تجميد مصغر') : (isEn ? 'Active Mini' : 'نشط أثناء التصغير');

    chip.innerHTML = `
      <div class="eco-matrix-chip-head">
        <span class="eco-matrix-chip-name">${w.icon} ${isEn ? w.nameEn : w.nameAr}</span>
        <span class="eco-matrix-chip-badge ${eff.isCustom ? 'custom' : 'inherit'}">
          ${eff.isCustom ? t('s.ecoCustomBadge') : t('s.ecoInheritBadge')}
        </span>
      </div>
      <div class="eco-matrix-chip-status">
        ${modeText} • ${sleepText}
      </div>
    `;

    chip.onclick = () => {
      currentEcoScope = w.id;
      syncEcoScopeUI();
      renderEcoMatrixGrid();
      const sec = document.getElementById('sec-eco');
      if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    grid.appendChild(chip);
  }
}

function buildEcoControls() {
  const scopeSel = $('#ecoScopeSelect');
  if (scopeSel) {
    scopeSel.value = currentEcoScope;
    scopeSel.onchange = (e) => {
      currentEcoScope = e.target.value;
      syncEcoScopeUI();
      renderEcoMatrixGrid();
      if (window.widgets?.power?.getStatus) {
        window.widgets.power.getStatus().then(updateEcoLiveBadge).catch(() => {});
      }
    };
  }

  const resetBtn = $('#ecoScopeResetBtn');
  if (resetBtn) {
    resetBtn.onclick = () => resetEcoScope();
  }

  const modeSel = $('#ecoMode');
  if (modeSel) {
    modeSel.onchange = (e) => {
      setEcoProp('mode', e.target.value);
    };
  }

  const bindSwitch = (id, prop) => {
    const b = $(id);
    if (!b) return;
    b.onclick = () => {
      const curVal = b.getAttribute('aria-checked') === 'true';
      const nextVal = !curVal;
      b.setAttribute('aria-checked', nextVal ? 'true' : 'false');
      setEcoProp(prop, nextVal);
    };
  };

  bindSwitch('#ecoSleepMini', 'sleepMini');
  bindSwitch('#ecoPauseOnLock', 'pauseOnLock');
  bindSwitch('#ecoLightShaders', 'lightShaders');

  syncEcoScopeUI();
  renderEcoMatrixGrid();

  if (window.widgets?.power?.getStatus) {
    window.widgets.power.getStatus().then(updateEcoLiveBadge).catch(() => {});
  }
  if (!ecoPowerSubscribed && window.widgets?.power?.onStatus) {
    ecoPowerSubscribed = true;
    window.widgets.power.onStatus(updateEcoLiveBadge);
  }
}

/* ---------- ayah or hadith ---------- */

function buildInspiration() {
  const mode = s.inspiration || 'quran';
  for (const b of document.querySelectorAll('#inspiration button')) {
    b.classList.toggle('on', b.dataset.mode === mode);
    b.onclick = () => {
      set({ inspiration: b.dataset.mode }, { immediate: true });
      for (const x of document.querySelectorAll('#inspiration button')) x.classList.toggle('on', x === b);
    };
  }
}

function buildClock() {
  const c = s.clock || {};
  $('#clockStyle').value = c.style || 'ring';
  $('#clockStyle').onchange = (e) => setGroup('clock', { style: e.target.value });
  switchEl('#hour12', c.hour12 !== false, (v) => setGroup('clock', { hour12: v }));
  switchEl('#seconds', c.seconds !== false, (v) => setGroup('clock', { seconds: v }));
  switchEl('#clockUltraTransparent', c.ultraTransparent !== false, (v) => {
    setGroup('clock', { ultraTransparent: v });
    const appSwitch = $('#scopeClockPureTransparent');
    if (appSwitch) appSwitch.classList.toggle('on', v);
    syncAppearanceScopeUI();
  });

  if ($('#clockDefaultTab')) {
    $('#clockDefaultTab').value = c.defaultTab || 'clock';
    $('#clockDefaultTab').onchange = (e) => setGroup('clock', { defaultTab: e.target.value });
  }

  switchEl('#clockAlarmSound', c.alarmSound !== false, (v) => setGroup('clock', { alarmSound: v }));

  if ($('#clockSnoozeDuration')) {
    $('#clockSnoozeDuration').value = String(c.snoozeDuration || 5);
    $('#clockSnoozeDuration').onchange = (e) => setGroup('clock', { snoozeDuration: Number(e.target.value) });
  }

  switchEl('#clockTimerSound', c.timerSound !== false, (v) => setGroup('clock', { timerSound: v }));

  if ($('#clockTimerDefaultSec')) {
    $('#clockTimerDefaultSec').value = String(c.timerDefaultSec || 300);
    $('#clockTimerDefaultSec').onchange = (e) => setGroup('clock', { timerDefaultSec: Number(e.target.value) });
  }

  switchEl('#clockDesktopNotify', c.desktopNotify !== false, (v) => setGroup('clock', { desktopNotify: v }));

  const zones = c.zones || [];
  for (let i = 0; i < 3; i++) {
    const sel = $(`#zone${i}`);
    sel.replaceChildren(
      el('option', { value: '' }, '—'),
      ...window.CITIES.map(([z]) => el('option', { value: z, selected: zones[i] === z }, window.cityName(z))));
    sel.value = zones[i] || '';
    sel.onchange = () => {
      const next = [0, 1, 2].map((k) => $(`#zone${k}`).value).filter(Boolean);
      setGroup('clock', { zones: [...new Set(next)] });
    };
  }
}

function hijriPreview() {
  const adj = Number(s.calendar?.hijriAdjust) || 0;
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + adj);
  const tag = en() ? 'en-u-ca-islamic-umalqura-nu-latn' : 'ar-SA-u-ca-islamic-umalqura-nu-latn';
  const text = new Intl.DateTimeFormat(tag, { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
  $('#hijriNote').textContent = t('s.hijriNote', { date: text });
}

function buildCalendar() {
  const c = s.calendar || {};
  if ($('#calViewMode')) {
    $('#calViewMode').value = c.viewMode || 'month';
    $('#calViewMode').onchange = (e) => setGroup('calendar', { viewMode: e.target.value });
  }
  const names = new Intl.DateTimeFormat(window.UI.locale(), { weekday: 'long' });
  if ($('#calWeekStart')) {
    $('#calWeekStart').replaceChildren(...[6, 0, 1].map((d) =>
      el('option', { value: String(d) }, names.format(new Date(2023, 0, 1 + d)))));
    $('#calWeekStart').value = String(c.weekStart ?? 6);
    $('#calWeekStart').onchange = (e) => setGroup('calendar', { weekStart: Number(e.target.value) });
  }
  if ($('#calHijri')) {
    switchEl('#calHijri', c.hijri !== false, (v) => setGroup('calendar', { hijri: v }));
  }
  if ($('#calHijriAdjust')) {
    $('#calHijriAdjust').value = String(c.hijriAdjust ?? 0);
    $('#calHijriAdjust').onchange = (e) => setGroup('calendar', { hijriAdjust: Number(e.target.value) });
  }
  if ($('#calVisualStyle')) {
    $('#calVisualStyle').value = c.visualStyle || 'modern';
    $('#calVisualStyle').onchange = (e) => setGroup('calendar', { visualStyle: e.target.value });
  }
  if ($('#calHighlightWeekend')) {
    switchEl('#calHighlightWeekend', c.highlightWeekend !== false, (v) => setGroup('calendar', { highlightWeekend: v }));
  }
  if ($('#calShowRedDot')) {
    switchEl('#calShowRedDot', c.showRedDot !== false, (v) => setGroup('calendar', { showRedDot: v }));
  }
  if ($('#calShowDayActions')) {
    switchEl('#calShowDayActions', c.showDayActions !== false, (v) => setGroup('calendar', { showDayActions: v }));
  }
  if ($('#calPopupTheme')) {
    $('#calPopupTheme').value = c.popupTheme || 'dark';
    $('#calPopupTheme').onchange = (e) => setGroup('calendar', { popupTheme: e.target.value });
  }
  if ($('#calPopupRadius')) {
    $('#calPopupRadius').value = c.popupRadius || 'rounded';
    $('#calPopupRadius').onchange = (e) => setGroup('calendar', { popupRadius: e.target.value });
  }
  if ($('#calPopupGlow')) {
    $('#calPopupGlow').value = c.popupGlow || 'radiant';
    $('#calPopupGlow').onchange = (e) => setGroup('calendar', { popupGlow: e.target.value });
  }
  if ($('#calShowTasksOnCalendar')) {
    switchEl('#calShowTasksOnCalendar', c.showTasksOnCalendar !== false, (v) => setGroup('calendar', { showTasksOnCalendar: v }));
  }
  if ($('#calShowHabitsOnCalendar')) {
    switchEl('#calShowHabitsOnCalendar', c.showHabitsOnCalendar === true, (v) => setGroup('calendar', { showHabitsOnCalendar: v }));
  }
  if ($('#goToCalWaSetupBtn')) {
    $('#goToCalWaSetupBtn').onclick = () => {
      switchTab('setup', 'sec-setup-calendar-wa');
    };
  }

  buildCalendarWhatsAppSetup();
}

function buildCalendarWhatsAppSetup() {
  const c = s.calendar || {};
  if ($('#calWaEnabled')) {
    switchEl('#calWaEnabled', c.eventsWaEnabled !== false, (v) => setGroup('calendar', { eventsWaEnabled: v }));
  }
  if ($('#calWaDefaultTiming')) {
    $('#calWaDefaultTiming').value = c.waDefaultTiming || 'morning_of';
    $('#calWaDefaultTiming').onchange = (e) => setGroup('calendar', { waDefaultTiming: e.target.value });
  }
  if ($('#calWaOverrideRecipient')) {
    $('#calWaOverrideRecipient').value = c.waRecipient || '';
    $('#calWaOverrideRecipient').oninput = (e) => setGroup('calendar', { waRecipient: e.target.value.trim() });
  }

  const CAL_PRESETS_AR = {
    greeting: '🎂 *تذكير مناسبة سعيدة: {title}* 🎂\n\n📅 التاريخ: {date}\n⏰ الوقت: {time}\n{notes}\n🎉 أطيب التهاني والأمنيات بيوم مبارك وسعيد!',
    formal: '💼 *تذكير بموعد هام: {title}* 💼\n\n📅 الموعد: {date}\n⏰ التوقيت: {time}\n📌 النوع: {category}\n{notes}\n🔔 تذكير لتنظيم جدول الأعمال والتحضير.',
    brief: '📌 *تذكير سريع: {title}*\nالتاريخ: {date} ({time})\n{notes}',
  };

  const CAL_PRESETS_EN = {
    greeting: '🎂 *Happy Occasion Reminder: {title}* 🎂\n\n📅 Date: {date}\n⏰ Time: {time}\n{notes}\n🎉 Wishing you a wonderful and blessed day!',
    formal: '💼 *Important Event Reminder: {title}* 💼\n\n📅 Date: {date}\n⏰ Time: {time}\n📌 Type: {category}\n{notes}\n🔔 Reminder to prepare and arrive on schedule.',
    brief: '📌 *Quick Reminder: {title}*\nDate: {date} ({time})\n{notes}',
  };

  const calPresets = () => (en() ? CAL_PRESETS_EN : CAL_PRESETS_AR);

  function applyCalPreset(text) {
    const editor = $('#calWaTemplate');
    if (!editor) return;
    editor.value = text;
    setGroup('calendar', { waTemplate: text });
    updateCalPreview();
  }

  if ($('#calWaPresetGreeting')) $('#calWaPresetGreeting').onclick = () => applyCalPreset(calPresets().greeting);
  if ($('#calWaPresetFormal')) $('#calWaPresetFormal').onclick = () => applyCalPreset(calPresets().formal);
  if ($('#calWaPresetBrief')) $('#calWaPresetBrief').onclick = () => applyCalPreset(calPresets().brief);

  // Click tag chips to insert into calendar template
  const chips = document.querySelectorAll('#calWaTagsList .wa-tag-chip');
  chips.forEach((chip) => {
    chip.onclick = () => {
      const tag = chip.dataset.calTag;
      const editor = $('#calWaTemplate');
      if (!editor || !tag) return;
      const start = editor.selectionStart || editor.value.length;
      const end = editor.selectionEnd || editor.value.length;
      const val = editor.value;
      editor.value = val.slice(0, start) + tag + val.slice(end);
      editor.focus();
      editor.selectionStart = editor.selectionEnd = start + tag.length;
      setGroup('calendar', { waTemplate: editor.value });
      updateCalPreview();
    };
  });

  function updateCalPreview() {
    const editor = $('#calWaTemplate');
    const bubble = $('#calWaBubblePreview');
    if (!bubble) return;

    const template = (editor?.value || '').trim() || calPresets().greeting;
    const formatted = template
      .replace(/\{title\}/g, en() ? 'Annual Tech Conference' : 'مؤتمر الذكاء الاصطناعي السنوي')
      .replace(/\{date\}/g, en() ? 'October 25, 2026' : '٢٥ أكتوبر ٢٠٢٦')
      .replace(/\{time\}/g, '09:00 AM')
      .replace(/\{category\}/g, en() ? 'Conference 🎙️' : 'مؤتمر / ندوة 🎙️')
      .replace(/\{notes\}/g, en() ? 'Hall A - Main Auditorium' : 'القاعة الكبرى - مبنى المؤتمرات')
      .replace(/\{countdown\}/g, en() ? 'In 3 days' : 'باقي 3 أيام');

    bubble.innerHTML = '';
    const textNode = el('div', { class: 'wa-bubble-text', style: 'white-space: pre-wrap; font-size: 13px; line-height: 1.5;' }, formatted);
    const metaNode = el('div', { class: 'wa-bubble-time', style: 'font-size: 10px; color: rgba(255,255,255,0.4); text-align: left; margin-top: 4px;' }, '09:00 ص ✓✓');
    bubble.append(textNode, metaNode);
  }

  if ($('#calWaTemplate')) {
    $('#calWaTemplate').value = c.waTemplate || calPresets().greeting;
    $('#calWaTemplate').oninput = (e) => {
      setGroup('calendar', { waTemplate: e.target.value });
      updateCalPreview();
    };
  }
  updateCalPreview();

  // Test WhatsApp Sender for Calendar
  if ($('#calWaTestBtn')) {
    $('#calWaTestBtn').onclick = async () => {
      const statusEl = $('#calWaTestStatus');
      if (statusEl) {
        statusEl.textContent = 'جارٍ الإرسال... ⏳';
        statusEl.className = 'hint inline';
      }
      try {
        const dummyEvent = {
          id: 'test-cal-' + Date.now(),
          title: en() ? 'Test Calendar Reminder' : 'تذكير تجريبي بمناسبة',
          category: 'birthday',
          date: new Date().toISOString().slice(0, 10),
          time: '10:00',
          notes: en() ? 'This is a test notification from Mirqat Calendar.' : 'هذه رسالة اختبار تجريبية لتأكيد وصول تذكيرات التقويم.',
        };
        const overrideRecipient = $('#calWaOverrideRecipient')?.value?.trim() || '';
        const res = await window.widgets.calendar?.testEventWhatsApp?.({
          event: dummyEvent,
          overrideRecipient,
        });
        if (res && res.ok) {
          if (statusEl) {
            statusEl.textContent = t('s.calWaTestSuccess');
            statusEl.className = 'hint inline success';
          }
        } else {
          if (statusEl) {
            statusEl.textContent = t('s.calWaTestFailed') + (res?.error || 'خطأ غير معروف');
            statusEl.className = 'hint inline error';
          }
        }
      } catch (err) {
        if (statusEl) {
          statusEl.textContent = t('s.calWaTestFailed') + (err.message || String(err));
          statusEl.className = 'hint inline error';
        }
      }
    };
  }
}

function buildHabits() {
  const h = s.habits || {};
  if ($('#habitsEnabled')) {
    switchEl('#habitsEnabled', isWidgetEnabled('habits'), async (v) => {
      await window.widgets.widgetsVisible('habits', v);
      await setGroup('habits', { enabled: v });
      if (s.widgets?.habits) s.widgets.habits.visible = v;
      syncWidgetEnableSwitches();
      syncWidgetRows();
    });
  }
  if ($('#habitsTheme')) {
    const val = (h.theme === 'bujo' ? 'notebook' : h.theme) || 'match';
    $('#habitsTheme').value = val;
    $('#habitsTheme').onchange = (e) => setGroup('habits', { theme: e.target.value });
  }
  if ($('#habitsDefaultView')) {
    $('#habitsDefaultView').value = h.defaultView || 'today';
    $('#habitsDefaultView').onchange = (e) => setGroup('habits', { defaultView: e.target.value });
  }
  if ($('#habitsWeekStart')) {
    $('#habitsWeekStart').value = h.weekStart || 'sat';
    $('#habitsWeekStart').onchange = (e) => setGroup('habits', { weekStart: e.target.value });
  }
  if ($('#habitsGridDotStyle')) {
    $('#habitsGridDotStyle').value = h.gridDotStyle || 'glow_dot';
    $('#habitsGridDotStyle').onchange = (e) => setGroup('habits', { gridDotStyle: e.target.value });
  }
  if ($('#habitsShowDailyTotals')) {
    switchEl('#habitsShowDailyTotals', h.showDailyTotals !== false, (v) => setGroup('habits', { showDailyTotals: v }));
  }
  if ($('#habitsShowStreak')) {
    switchEl('#habitsShowStreak', h.showStreak !== false, (v) => setGroup('habits', { showStreak: v }));
  }
  if ($('#habitsShowStrength')) {
    switchEl('#habitsShowStrength', h.showStrength !== false, (v) => setGroup('habits', { showStrength: v }));
  }
  if ($('#habitsShowUrgency')) {
    switchEl('#habitsShowUrgency', h.showUrgency !== false, (v) => setGroup('habits', { showUrgency: v }));
  }
  if ($('#habitsShowProgressBar')) {
    switchEl('#habitsShowProgressBar', h.showProgressBar !== false, (v) => setGroup('habits', { showProgressBar: v }));
  }
  if ($('#habitsShowMiniStrip')) {
    switchEl('#habitsShowMiniStrip', h.showMiniStrip !== false, (v) => setGroup('habits', { showMiniStrip: v }));
  }
  if ($('#habitsShowRoutineFilters')) {
    switchEl('#habitsShowRoutineFilters', h.showRoutineFilters !== false, (v) => setGroup('habits', { showRoutineFilters: v }));
  }
  if ($('#habitsShowFooterCheckin')) {
    switchEl('#habitsShowFooterCheckin', h.showFooterCheckin !== false, (v) => setGroup('habits', { showFooterCheckin: v }));
  }
  if ($('#habitsShowQuickJournal')) {
    switchEl('#habitsShowQuickJournal', h.showQuickJournal !== false, (v) => setGroup('habits', { showQuickJournal: v }));
  }
  if ($('#habitsSoundEffects')) {
    switchEl('#habitsSoundEffects', h.soundEffects !== false, (v) => setGroup('habits', { soundEffects: v }));
  }
  if ($('#habitsConfettiCelebration')) {
    switchEl('#habitsConfettiCelebration', h.confettiCelebration !== false, (v) => setGroup('habits', { confettiCelebration: v }));
  }
  if ($('#habitsProgressRingStyle')) {
    $('#habitsProgressRingStyle').value = h.progressRingStyle || 'gradient_bar';
    $('#habitsProgressRingStyle').onchange = (e) => setGroup('habits', { progressRingStyle: e.target.value });
  }
  if ($('#habitsSmartRoutineAnchor')) {
    switchEl('#habitsSmartRoutineAnchor', h.smartRoutineAnchor !== false, (v) => setGroup('habits', { smartRoutineAnchor: v }));
  }
  if ($('#habitsDailyMotivationalQuote')) {
    switchEl('#habitsDailyMotivationalQuote', h.dailyMotivationalQuote !== false, (v) => setGroup('habits', { dailyMotivationalQuote: v }));
  }
  if ($('#habitsForgivingStreak')) {
    switchEl('#habitsForgivingStreak', h.forgivingStreak !== false, (v) => setGroup('habits', { forgivingStreak: v }));
  }
  if ($('#habitsGraceDays')) {
    $('#habitsGraceDays').value = String(h.graceDays ?? 1);
    $('#habitsGraceDays').onchange = (e) => setGroup('habits', { graceDays: Number(e.target.value) });
  }
  if ($('#habitsSleepTargetHours')) {
    $('#habitsSleepTargetHours').value = String(h.sleepTargetHours || 8.0);
    $('#habitsSleepTargetHours').onchange = (e) => setGroup('habits', { sleepTargetHours: Number(e.target.value) });
  }
  if ($('#habitsSleepWarningMin')) {
    $('#habitsSleepWarningMin').value = String(h.sleepWarningMin || 6.0);
    $('#habitsSleepWarningMin').onchange = (e) => setGroup('habits', { sleepWarningMin: Number(e.target.value) });
  }
  if ($('#habitsTargetBedtime')) {
    $('#habitsTargetBedtime').value = h.targetBedtime || '23:30';
    $('#habitsTargetBedtime').onchange = (e) => setGroup('habits', { targetBedtime: e.target.value });
  }
  if ($('#habitsTargetWakeTime')) {
    $('#habitsTargetWakeTime').value = h.targetWakeTime || '07:30';
    $('#habitsTargetWakeTime').onchange = (e) => setGroup('habits', { targetWakeTime: e.target.value });
  }
  if ($('#habitsMoodScaleType')) {
    $('#habitsMoodScaleType').value = h.moodScaleType || '5_smileys';
    $('#habitsMoodScaleType').onchange = (e) => setGroup('habits', { moodScaleType: e.target.value });
  }
  if ($('#habitsTrackStress')) {
    switchEl('#habitsTrackStress', h.trackStress !== false, (v) => setGroup('habits', { trackStress: v }));
  }
  if ($('#habitsTrackScreenTime')) {
    switchEl('#habitsTrackScreenTime', h.trackScreenTime !== false, (v) => setGroup('habits', { trackScreenTime: v }));
  }
  if ($('#habitsSyncToTodo')) {
    switchEl('#habitsSyncToTodo', h.syncToTodo !== false, (v) => setGroup('habits', { syncToTodo: v }));
  }
  if ($('#habitsSyncToCalendar')) {
    switchEl('#habitsSyncToCalendar', h.syncToCalendar !== false, (v) => setGroup('habits', { syncToCalendar: v }));
  }
  if ($('#habitsWaEveningPrompt')) {
    switchEl('#habitsWaEveningPrompt', Boolean(h.waEveningPrompt), (v) => setGroup('habits', { waEveningPrompt: v }));
  }
  if ($('#habitsWaEveningTime')) {
    $('#habitsWaEveningTime').value = h.waEveningTime || '21:30';
    $('#habitsWaEveningTime').onchange = (e) => setGroup('habits', { waEveningTime: e.target.value });
  }
  if ($('#habitsWaWeeklyDigest')) {
    switchEl('#habitsWaWeeklyDigest', Boolean(h.waWeeklyDigest), (v) => setGroup('habits', { waWeeklyDigest: v }));
  }
  if ($('#habitsWaMonthlyReport')) {
    switchEl('#habitsWaMonthlyReport', h.waMonthlyReport !== false, (v) => setGroup('habits', { waMonthlyReport: v }));
  }
  if ($('#habitsGamificationEnabled')) {
    switchEl('#habitsGamificationEnabled', h.gamificationEnabled !== false, (v) => setGroup('habits', { gamificationEnabled: v }));
  }
  if ($('#habitsShowPomodoroShortcut')) {
    switchEl('#habitsShowPomodoroShortcut', h.showPomodoroShortcut !== false, (v) => setGroup('habits', { showPomodoroShortcut: v }));
  }
  if ($('#habitsWaRecipientOverride')) {
    $('#habitsWaRecipientOverride').value = h.waRecipientOverride || '';
    $('#habitsWaRecipientOverride').oninput = (e) => setGroup('habits', { waRecipientOverride: e.target.value.trim() });
  }
  if ($('#habitsWaReportLang')) {
    $('#habitsWaReportLang').value = h.reportLang || 'ar';
    $('#habitsWaReportLang').onchange = (e) => setGroup('habits', { reportLang: e.target.value });
  }

  if ($('#habitsOpenManagerForRemindersBtn')) {
    $('#habitsOpenManagerForRemindersBtn').onclick = () => {
      if (window.widgets?.win?.openHabitsDashboard) {
        window.widgets.win.openHabitsDashboard({ tab: 'manager' });
      }
    };
  }
  if ($('#habitsActiveRemindersCount') && window.widgets?.habits?.getState) {
    window.widgets.habits.getState().then((st) => {
      const habitsList = st?.habits || [];
      const count = habitsList.filter((hb) => hb && hb.reminderEnabled).length;
      if (count > 0) {
        $('#habitsActiveRemindersCount').textContent = en()
          ? `${count} active reminder${count > 1 ? 's' : ''}`
          : `${count} تذكير نشط`;
      }
    }).catch(() => {});
  }
}

function buildPomodoro() {
  const p = s.pomodoro || {};
  const num = (id, key) => {
    const input = $(id);
    input.value = String(p[key]);
    input.onchange = () => {
      const lo = Number(input.min);
      const hi = Number(input.max);
      const v = Math.min(hi, Math.max(lo, Math.round(Number(input.value) || lo)));
      input.value = String(v);
      setGroup('pomodoro', { [key]: v });
    };
  };
  num('#pFocus', 'focus');
  num('#pShort', 'short');
  num('#pLong', 'long');
  num('#pEvery', 'every');
  const label = p.label || '';
  $('#pLabel').value = en() && label === 'مذاكرة' ? 'Study' : label;
  $('#pLabel').oninput = (e) => { const v = e.target.value.trim(); if (v) setGroup('pomodoro', { label: v }); };
  switchEl('#pAutoBreaks', p.autoBreaks, (v) => setGroup('pomodoro', { autoBreaks: v }));
  switchEl('#pAutoFocus', p.autoFocus, (v) => setGroup('pomodoro', { autoFocus: v }));
  switchEl('#pSound', p.sound, (v) => setGroup('pomodoro', { sound: v }));
  switchEl('#pNotify', p.notify, (v) => setGroup('pomodoro', { notify: v }));
  switchEl('#pUltraTransparent', p.ultraTransparent === true, (v) => {
    setGroup('pomodoro', { ultraTransparent: v });
    const appSwitch = $('#scopePomodoroPureTransparent');
    if (appSwitch) appSwitch.classList.toggle('on', v);
    syncAppearanceScopeUI();
  });
  range('#pVolume', '#pVolumeOut', Math.round((p.volume ?? 0.6) * 100), pct,
    (v) => setGroup('pomodoro', { volume: v / 100 }));
}

/* ---------- email ---------- */

const EMAIL_PROVIDERS = {
  gmail: { host: 'imap.gmail.com', port: 993, secure: true },
  outlook: { host: 'outlook.office365.com', port: 993, secure: true },
  yahoo: { host: 'imap.mail.yahoo.com', port: 993, secure: true },
  icloud: { host: 'imap.mail.me.com', port: 993, secure: true },
  custom: { host: '', port: 993, secure: true },
};

function buildEmail() {
  const em = s.email || {};
  switchEl('#emailEnabled', isWidgetEnabled('email'), async (v) => {
    await window.widgets.widgetsVisible('email', v);
    await setGroup('email', { enabled: v });
    if (s.widgets?.email) s.widgets.email.visible = v;
    syncWidgetEnableSwitches();
    syncWidgetRows();
  });

  const prov = $('#emailProvider');
  prov.value = em.provider || 'gmail';
  const customRows = $('#emailCustomRows');
  customRows.hidden = prov.value !== 'custom';

  prov.onchange = (e) => {
    const val = e.target.value;
    customRows.hidden = val !== 'custom';
    const preset = EMAIL_PROVIDERS[val] || EMAIL_PROVIDERS.custom;
    if (val !== 'custom') {
      $('#emailHost').value = preset.host;
      $('#emailPort').value = String(preset.port);
      switchEl('#emailSecure', preset.secure, (v) => setGroup('email', { secure: v }));
      setGroup('email', { provider: val, host: preset.host, port: preset.port, secure: preset.secure });
    } else {
      setGroup('email', { provider: 'custom' });
    }
  };

  const user = $('#emailUser');
  user.value = em.user || '';
  const pass = $('#emailPass');
  pass.value = em.pass || '';

  const saveEmailCreds = () => {
    const u = user.value.trim();
    const p = pass.value;
    setGroup('email', { user: u, pass: p, enabled: Boolean(u && p) });
  };
  user.onchange = saveEmailCreds;
  user.oninput = saveEmailCreds;
  pass.onchange = saveEmailCreds;
  pass.oninput = saveEmailCreds;

  const host = $('#emailHost');
  host.value = em.host || (EMAIL_PROVIDERS[prov.value] || {}).host || '';
  host.onchange = (e) => setGroup('email', { host: e.target.value.trim() });

  const port = $('#emailPort');
  port.value = String(em.port || (EMAIL_PROVIDERS[prov.value] || {}).port || 993);
  port.onchange = (e) => setGroup('email', { port: Number(e.target.value) || 993 });

  switchEl('#emailSecure', em.secure !== false, (v) => setGroup('email', { secure: v }));

  const interval = $('#emailInterval');
  interval.value = String(em.interval || 3);
  interval.onchange = (e) => setGroup('email', { interval: Number(e.target.value) || 3 });

  switchEl('#emailNotify', em.notify !== false, (v) => setGroup('email', { notify: v }));
  switchEl('#emailSound', em.sound !== false, (v) => setGroup('email', { sound: v }));

  const readAction = $('#emailReadAction');
  if (readAction) {
    readAction.value = em.readAction || 'keep';
    readAction.onchange = (e) => setGroup('email', { readAction: e.target.value });
  }

  switchEl('#emailOpenInWindow', Boolean(em.openInWindow), (v) => setGroup('email', { openInWindow: v }));

  const appPassLink = $('#emailAppPassLink');
  if (appPassLink) {
    appPassLink.onclick = (e) => {
      e.preventDefault();
      window.widgets.openExternal('https://myaccount.google.com/apppasswords');
    };
  }

  $('#emailTestBtn').onclick = async () => {
    const status = $('#emailTestStatus');
    status.textContent = t('s.emailTesting');
    status.style.color = 'var(--ink-3)';
    try {
      const cfg = {
        provider: prov.value,
        user: user.value.trim(),
        pass: pass.value,
        host: host.value.trim(),
        port: Number(port.value) || 993,
        secure: $('#emailSecure').getAttribute('aria-checked') === 'true',
      };
      if (cfg.user && cfg.pass) {
        await setGroup('email', { ...cfg, enabled: true });
        if (isWidgetEnabled('email') === false) {
          await window.widgets.widgetsVisible('email', true);
        }
      }
      const res = await window.widgets.email.test(cfg);
      if (res && res.ok) {
        status.textContent = t('s.emailSuccess', { count: digits(res.count), unseen: digits(res.unseen) });
        status.style.color = 'var(--accent)';
      } else {
        status.textContent = (res && res.error) || t('s.failedConnect');
        status.style.color = '#ef4444';
      }
    } catch (err) {
      status.textContent = err.message || t('s.connError');
      status.style.color = '#ef4444';
    }
  };

  const goToBrowserBtn = $('#emailGoToBrowserSetupBtn');
  if (goToBrowserBtn) {
    goToBrowserBtn.onclick = () => {
      switchTab('setup');
      setTimeout(() => {
        const sec = $('#sec-setup-browser');
        if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    };
  }
}

function syncEmail() {
  const em = s.email || {};
  switchEl('#emailEnabled', isWidgetEnabled('email'), async (v) => {
    await window.widgets.widgetsVisible('email', v);
    await setGroup('email', { enabled: v });
    if (s.widgets?.email) s.widgets.email.visible = v;
    syncWidgetEnableSwitches();
    syncWidgetRows();
  });
  $('#emailProvider').value = em.provider || 'gmail';
  $('#emailCustomRows').hidden = $('#emailProvider').value !== 'custom';
  $('#emailUser').value = em.user || '';
  $('#emailPass').value = em.pass || '';
  $('#emailHost').value = em.host || '';
  $('#emailPort').value = String(em.port || 993);
  switchEl('#emailSecure', em.secure !== false, (v) => setGroup('email', { secure: v }));
  $('#emailInterval').value = String(em.interval || 3);
  switchEl('#emailNotify', em.notify !== false, (v) => setGroup('email', { notify: v }));
  switchEl('#emailSound', em.sound !== false, (v) => setGroup('email', { sound: v }));
  if ($('#emailReadAction')) $('#emailReadAction').value = em.readAction || 'keep';
  switchEl('#emailOpenInWindow', Boolean(em.openInWindow), (v) => setGroup('email', { openInWindow: v }));
}

/* ---------- browser & chrome account setup (setting up tab) ---------- */

async function buildBrowserSetup() {
  const modeSel = $('#browserMode');
  const profSel = $('#browserChromeProfile');
  const customEmailRow = $('#browserCustomEmailRow');
  const customEmail = $('#browserCustomEmail');
  const testBtn = $('#browserTestBtn');
  const testStatus = $('#browserTestStatus');
  const profRows = $('#browserChromeProfileRows');

  if (!modeSel || !profSel) return;

  const currentBrowser = s.browser || {};
  modeSel.value = currentBrowser.mode || 'chrome_profile';

  function updateModeUI() {
    if (profRows) {
      profRows.style.display = modeSel.value === 'chrome_profile' ? 'block' : 'none';
    }
  }
  updateModeUI();

  modeSel.onchange = (e) => {
    const val = e.target.value;
    updateModeUI();
    setGroup('browser', { mode: val });
  };

  try {
    profSel.innerHTML = `<option value="">${t('s.browserDetecting') || 'جاري فحص حسابات كروم...'}</option>`;
    const data = await window.widgets.browser?.getProfiles?.();
    const profiles = data?.profiles || [];

    profSel.innerHTML = '';
    if (profiles.length === 0) {
      const opt = document.createElement('option');
      opt.value = 'Default';
      opt.textContent = 'Google Chrome (الحساب الافتراضي / Default Profile)';
      profSel.appendChild(opt);
    } else {
      profiles.forEach((p) => {
        const opt = document.createElement('option');
        opt.value = p.folder;
        let label = '';
        if (p.email && p.name && p.name !== p.email) {
          label = `${p.name} — ${p.email}`;
        } else if (p.email) {
          label = p.email;
        } else {
          label = p.name || p.folder;
        }
        opt.textContent = `${p.folder === 'Default' ? '👤 ' : '🎓 '}${label} (${p.folder})`;
        profSel.appendChild(opt);
      });
    }

    const customOpt = document.createElement('option');
    customOpt.value = 'custom';
    customOpt.textContent = t('s.browserCustomOption') || '⚙️ إدخال حساب آخر يدوياً...';
    profSel.appendChild(customOpt);

    const savedProf = currentBrowser.chromeProfile;
    const savedEmail = currentBrowser.userEmail;

    if (savedProf && Array.from(profSel.options).some((o) => o.value === savedProf)) {
      profSel.value = savedProf;
    } else if (savedEmail) {
      const matched = profiles.find((p) => p.email && p.email.toLowerCase() === savedEmail.toLowerCase());
      if (matched) {
        profSel.value = matched.folder;
      } else {
        profSel.value = 'custom';
      }
    } else {
      const ejustProf = profiles.find((p) => p.email && p.email.includes('ejust'));
      if (ejustProf) {
        profSel.value = ejustProf.folder;
        setGroup('browser', { chromeProfile: ejustProf.folder, userEmail: ejustProf.email });
      } else if (profiles.length > 0) {
        profSel.value = profiles[0].folder;
        setGroup('browser', { chromeProfile: profiles[0].folder, userEmail: profiles[0].email || '' });
      }
    }

    if (customEmailRow) {
      customEmailRow.style.display = profSel.value === 'custom' ? 'flex' : 'none';
    }
  } catch (err) {
    console.error('Failed to load Chrome profiles:', err);
  }

  profSel.onchange = (e) => {
    const val = e.target.value;
    if (customEmailRow) {
      customEmailRow.style.display = val === 'custom' ? 'flex' : 'none';
    }
    if (val !== 'custom') {
      const optText = profSel.options[profSel.selectedIndex]?.textContent || '';
      setGroup('browser', { chromeProfile: val, userEmail: optText });
    }
  };

  if (customEmail) {
    customEmail.value = currentBrowser.userEmail || '';
    customEmail.onchange = (e) => {
      setGroup('browser', { userEmail: e.target.value.trim() });
    };
  }

  if (testBtn) {
    testBtn.onclick = async () => {
      if (testStatus) {
        testStatus.textContent = '⏳ جاري الفتح...';
        testStatus.style.color = 'var(--ink-sub)';
      }
      try {
        const selectedFolder = profSel.value === 'custom' ? 'Default' : profSel.value;
        const res = await window.widgets.browser?.test?.({
          url: 'https://myaccount.google.com/',
          profileFolder: selectedFolder,
        });
        if (testStatus) {
          testStatus.textContent = '✓ ' + (t('s.browserTestSuccess') || 'تم الفتح بنجاح في كروم بالحساب المحدد!');
          testStatus.style.color = '#10b981';
          setTimeout(() => { if (testStatus) testStatus.textContent = ''; }, 4500);
        }
      } catch (err) {
        if (testStatus) {
          testStatus.textContent = '✕ ' + err.message;
          testStatus.style.color = '#ef4444';
        }
      }
    };
  }
}

function syncBrowserSetup() {
  const currentBrowser = s.browser || {};
  const modeSel = $('#browserMode');
  if (modeSel) modeSel.value = currentBrowser.mode || 'chrome_profile';
  const profRows = $('#browserChromeProfileRows');
  if (profRows && modeSel) {
    profRows.style.display = modeSel.value === 'chrome_profile' ? 'block' : 'none';
  }
  const profSel = $('#browserChromeProfile');
  if (profSel && currentBrowser.chromeProfile) {
    if (Array.from(profSel.options).some((o) => o.value === currentBrowser.chromeProfile)) {
      profSel.value = currentBrowser.chromeProfile;
    }
  }
  const customEmail = $('#browserCustomEmail');
  if (customEmail && currentBrowser.userEmail) {
    customEmail.value = currentBrowser.userEmail;
  }
}

/* ---------- photo ---------- */

function buildPhoto() {
  const ph = s.photo || {};
  const mode = $('#photoMode');
  if (mode) mode.value = ph.mode || 'single';

  const singleRow = $('#photoFileRow');
  const pathLabel = $('#photoPath');
  const folderRow = $('#photoFolderRow');
  const folderLabel = $('#photoFolder');

  const updateModeVisibility = (m) => {
    if (singleRow) singleRow.hidden = m === 'folder';
    if (folderRow) folderRow.hidden = m !== 'folder';
  };
  if (mode) updateModeVisibility(mode.value);

  if (mode) {
    mode.onchange = (e) => {
      const val = e.target.value;
      updateModeVisibility(val);
      setGroup('photo', { mode: val });
    };
  }

  if (pathLabel) {
    if ('value' in pathLabel) pathLabel.value = ph.path || '';
    else pathLabel.textContent = ph.path || '—';
  }

  const pickFileBtn = $('#photoFilePick');
  if (pickFileBtn) {
    pickFileBtn.onclick = async () => {
      const res = await window.widgets.photo?.pick?.();
      if (res && res.path) {
        if (pathLabel) {
          if ('value' in pathLabel) pathLabel.value = res.path;
          else pathLabel.textContent = res.path;
        }
        setGroup('photo', { mode: 'single', path: res.path });
      }
    };
  }

  if (folderLabel) {
    if ('value' in folderLabel) folderLabel.value = ph.folder || '';
    else folderLabel.textContent = ph.folder || '—';
  }

  const pickFolderBtn = $('#photoFolderPick');
  if (pickFolderBtn) {
    pickFolderBtn.onclick = async () => {
      const res = await window.widgets.photo?.pickFolder?.();
      if (res && res.folder) {
        if (folderLabel) {
          if ('value' in folderLabel) folderLabel.value = res.folder;
          else folderLabel.textContent = res.folder;
        }
        setGroup('photo', { mode: 'folder', folder: res.folder });
      }
    };
  }

  const interval = $('#photoInterval');
  if (interval) {
    interval.value = String(ph.interval || 60);
    interval.onchange = (e) => setGroup('photo', { interval: Number(e.target.value) || 60 });
  }

  const fit = $('#photoFit');
  if (fit) {
    fit.value = ph.fit || 'cover';
    fit.onchange = (e) => setGroup('photo', { fit: e.target.value });
  }

  if ($('#photoShowCaption')) switchEl('#photoShowCaption', Boolean(ph.showCaption), (v) => setGroup('photo', { showCaption: v }));

  if ($('#photoZoom')) range('#photoZoom', '#photoZoomOut', ph.zoom !== undefined ? Math.round(ph.zoom * 100) : 100, pct, (v) => setGroup('photo', { zoom: v / 100 }));
  if ($('#photoPosX')) range('#photoPosX', '#photoPosXOut', ph.posX !== undefined ? ph.posX : 50, pct, (v) => setGroup('photo', { posX: v }));
  if ($('#photoPosY')) range('#photoPosY', '#photoPosYOut', ph.posY !== undefined ? ph.posY : 50, pct, (v) => setGroup('photo', { posY: v }));

  const rot = $('#photoRotate');
  if (rot) {
    rot.value = String(ph.rotate || 0);
    rot.onchange = (e) => setGroup('photo', { rotate: Number(e.target.value) || 0 });
  }

  if ($('#photoBrightness')) range('#photoBrightness', '#photoBrightnessOut', ph.brightness !== undefined ? ph.brightness : 100, pct, (v) => setGroup('photo', { brightness: v }));
  if ($('#photoContrast')) range('#photoContrast', '#photoContrastOut', ph.contrast !== undefined ? ph.contrast : 100, pct, (v) => setGroup('photo', { contrast: v }));

  if ($('#photoGrayscale')) switchEl('#photoGrayscale', Boolean(ph.grayscale), (v) => setGroup('photo', { grayscale: v }));

  const shape = $('#photoShape');
  if (shape) {
    shape.value = ph.shape || 'rounded';
    shape.onchange = (e) => setGroup('photo', { shape: e.target.value });
  }

  const resetBtn = $('#photoResetAdjust');
  if (resetBtn) {
    resetBtn.onclick = () => {
      const resetValues = {
        zoom: 1,
        posX: 50,
        posY: 50,
        rotate: 0,
        brightness: 100,
        contrast: 100,
        grayscale: false,
        shape: 'rounded',
      };
      setGroup('photo', resetValues);
      s.photo = { ...(s.photo || {}), ...resetValues };
      syncPhoto();
    };
  }
}

function syncPhoto() {
  const ph = s.photo || {};
  const mode = $('#photoMode');
  if (mode) mode.value = ph.mode || 'single';

  const singleRow = $('#photoFileRow');
  const pathLabel = $('#photoPath');
  const folderRow = $('#photoFolderRow');
  const folderLabel = $('#photoFolder');

  if (singleRow && mode) singleRow.hidden = mode.value === 'folder';
  if (pathLabel) {
    if ('value' in pathLabel) pathLabel.value = ph.path || '';
    else pathLabel.textContent = ph.path || '—';
  }
  if (folderRow && mode) folderRow.hidden = mode.value !== 'folder';
  if (folderLabel) {
    if ('value' in folderLabel) folderLabel.value = ph.folder || '';
    else folderLabel.textContent = ph.folder || '—';
  }

  if ($('#photoInterval')) $('#photoInterval').value = String(ph.interval || 60);
  if ($('#photoFit')) $('#photoFit').value = ph.fit || 'cover';
  if ($('#photoShowCaption')) switchEl('#photoShowCaption', Boolean(ph.showCaption), (v) => setGroup('photo', { showCaption: v }));

  const zoomVal = ph.zoom !== undefined ? Math.round(ph.zoom * 100) : 100;
  if ($('#photoZoom')) $('#photoZoom').value = String(zoomVal);
  if ($('#photoZoomOut')) $('#photoZoomOut').textContent = pct(zoomVal);

  const posXVal = ph.posX !== undefined ? ph.posX : 50;
  if ($('#photoPosX')) $('#photoPosX').value = String(posXVal);
  if ($('#photoPosXOut')) $('#photoPosXOut').textContent = pct(posXVal);

  const posYVal = ph.posY !== undefined ? ph.posY : 50;
  if ($('#photoPosY')) $('#photoPosY').value = String(posYVal);
  if ($('#photoPosYOut')) $('#photoPosYOut').textContent = pct(posYVal);

  if ($('#photoRotate')) $('#photoRotate').value = String(ph.rotate || 0);

  const brightVal = ph.brightness !== undefined ? ph.brightness : 100;
  if ($('#photoBrightness')) $('#photoBrightness').value = String(brightVal);
  if ($('#photoBrightnessOut')) $('#photoBrightnessOut').textContent = pct(brightVal);

  const contrastVal = ph.contrast !== undefined ? ph.contrast : 100;
  if ($('#photoContrast')) $('#photoContrast').value = String(contrastVal);
  if ($('#photoContrastOut')) $('#photoContrastOut').textContent = pct(contrastVal);

  if ($('#photoGrayscale')) switchEl('#photoGrayscale', Boolean(ph.grayscale), (v) => setGroup('photo', { grayscale: v }));
  if ($('#photoShape')) $('#photoShape').value = ph.shape || 'rounded';
}

function buildFolderSettings() {
  const fSettings = s.folderSettings || {};
  const wsFolder = s.widgetStyles?.folder || {};

  const currentRadius = fSettings.radius ?? wsFolder.radius ?? 24;
  const currentBlur = fSettings.blur ?? 34;
  const currentOpacity = fSettings.opacity ?? 24;
  const currentBorderWidth = fSettings.borderWidth ?? wsFolder.borderWidth ?? 1;
  const currentBorderOpacity = fSettings.borderOpacity ?? 38;
  const currentAvoidCollisions = fSettings.collisionAvoidance !== false;
  const currentShowTitles = Boolean(fSettings.showCompactTitles);
  const currentDragGlow = fSettings.dragGlow !== false;

  const sliderRadius = $('#folderRadiusSlider');
  const badgeRadius = $('#folderRadiusBadge');
  const sliderBlur = $('#folderBlurSlider');
  const badgeBlur = $('#folderBlurBadge');
  const sliderOpacity = $('#folderOpacitySlider');
  const badgeOpacity = $('#folderOpacityBadge');
  const sliderBorderW = $('#folderBorderWidthSlider');
  const badgeBorderW = $('#folderBorderWidthBadge');
  const sliderBorderO = $('#folderBorderOpacitySlider');
  const badgeBorderO = $('#folderBorderOpacityBadge');
  const previewSquircle = $('#folderPreviewSquircle');

  function updatePreview() {
    if (!previewSquircle) return;
    const r = sliderRadius ? sliderRadius.value : currentRadius;
    const b = sliderBlur ? sliderBlur.value : currentBlur;
    const op = sliderOpacity ? sliderOpacity.value : currentOpacity;
    const bw = sliderBorderW ? sliderBorderW.value : currentBorderWidth;
    const bo = sliderBorderO ? sliderBorderO.value : currentBorderOpacity;

    previewSquircle.style.setProperty('--preview-radius', `${r}px`);
    previewSquircle.style.setProperty('--preview-blur', `${b}px`);
    previewSquircle.style.setProperty('--preview-opacity', String(op));
    previewSquircle.style.setProperty('--preview-border-width', `${bw}px`);
    previewSquircle.style.setProperty('--preview-border-opacity', String(Number(bo) / 100));

    // Update preset buttons active state
    document.querySelectorAll('.folder-presets-row .preset-btn').forEach(btn => {
      btn.classList.toggle('active', Number(btn.dataset.radius) === Number(r));
    });
  }

  function saveFolderField(key, value) {
    s.folderSettings = s.folderSettings || {};
    s.folderSettings[key] = value;
    if (key === 'radius' || key === 'borderWidth') {
      s.widgetStyles = s.widgetStyles || {};
      s.widgetStyles.folder = s.widgetStyles.folder || {};
      s.widgetStyles.folder[key] = value;
    }
    set({
      folderSettings: { ...s.folderSettings },
      widgetStyles: { ...s.widgetStyles }
    }, { immediate: true });
    updatePreview();
  }

  // Radius slider
  if (sliderRadius) {
    sliderRadius.value = String(currentRadius);
    if (badgeRadius) badgeRadius.textContent = `${digits(currentRadius)}px`;
    sliderRadius.oninput = (e) => {
      const val = Number(e.target.value);
      if (badgeRadius) badgeRadius.textContent = `${digits(val)}px`;
      updatePreview();
      saveFolderField('radius', val);
    };
  }

  // Preset buttons
  document.querySelectorAll('.folder-presets-row .preset-btn').forEach(btn => {
    btn.onclick = () => {
      const r = Number(btn.dataset.radius);
      if (sliderRadius) sliderRadius.value = String(r);
      if (badgeRadius) badgeRadius.textContent = `${digits(r)}px`;
      saveFolderField('radius', r);
    };
  });

  // Blur slider
  if (sliderBlur) {
    sliderBlur.value = String(currentBlur);
    if (badgeBlur) badgeBlur.textContent = `${digits(currentBlur)}px`;
    sliderBlur.oninput = (e) => {
      const val = Number(e.target.value);
      if (badgeBlur) badgeBlur.textContent = `${digits(val)}px`;
      updatePreview();
      saveFolderField('blur', val);
    };
  }

  // Opacity slider
  if (sliderOpacity) {
    sliderOpacity.value = String(currentOpacity);
    if (badgeOpacity) badgeOpacity.textContent = `${digits(currentOpacity)}%`;
    sliderOpacity.oninput = (e) => {
      const val = Number(e.target.value);
      if (badgeOpacity) badgeOpacity.textContent = `${digits(val)}%`;
      updatePreview();
      saveFolderField('opacity', val);
    };
  }

  // Border width slider
  if (sliderBorderW) {
    sliderBorderW.value = String(currentBorderWidth);
    if (badgeBorderW) badgeBorderW.textContent = `${digits(currentBorderWidth)}px`;
    sliderBorderW.oninput = (e) => {
      const val = Number(e.target.value);
      if (badgeBorderW) badgeBorderW.textContent = `${digits(val)}px`;
      updatePreview();
      saveFolderField('borderWidth', val);
    };
  }

  // Border opacity slider
  if (sliderBorderO) {
    sliderBorderO.value = String(currentBorderOpacity);
    if (badgeBorderO) badgeBorderO.textContent = `${digits(currentBorderOpacity)}%`;
    sliderBorderO.oninput = (e) => {
      const val = Number(e.target.value);
      if (badgeBorderO) badgeBorderO.textContent = `${digits(val)}%`;
      updatePreview();
      saveFolderField('borderOpacity', val);
    };
  }

  // Switches
  const currentSnapGrid = s.snapToDesktopGrid !== false;
  switchEl('#snapToDesktopGrid', currentSnapGrid, (v) => {
    s.snapToDesktopGrid = v;
    set({ snapToDesktopGrid: v }, { immediate: true });
  });

  switchEl('#folderCollisionAvoidance', currentAvoidCollisions, (v) => {
    saveFolderField('collisionAvoidance', v);
  });

  switchEl('#folderShowCompactTitles', currentShowTitles, (v) => {
    saveFolderField('showCompactTitles', v);
  });

  switchEl('#folderDragGlow', currentDragGlow, (v) => {
    saveFolderField('dragGlow', v);
  });

  // Reset button
  const btnReset = $('#btnResetFolderSettings');
  if (btnReset) {
    btnReset.onclick = () => {
      const defaults = {
        radius: 24,
        blur: 34,
        opacity: 24,
        borderWidth: 1,
        borderOpacity: 38,
        showCompactTitles: false,
        dragGlow: true,
        collisionAvoidance: true,
      };
      s.folderSettings = { ...defaults };
      s.snapToDesktopGrid = true;
      if (s.widgetStyles?.folder) {
        s.widgetStyles.folder.radius = 24;
        s.widgetStyles.folder.borderWidth = 1;
      }
      set({
        snapToDesktopGrid: true,
        folderSettings: { ...s.folderSettings },
        widgetStyles: { ...s.widgetStyles }
      }, { immediate: true });

      const snapSwitch = $('#snapToDesktopGrid');
      if (snapSwitch) {
        snapSwitch.classList.add('on');
        snapSwitch.setAttribute('aria-checked', 'true');
      }

      if (sliderRadius) sliderRadius.value = '24';
      if (badgeRadius) badgeRadius.textContent = '24px';
      if (sliderBlur) sliderBlur.value = '34';
      if (badgeBlur) badgeBlur.textContent = '34px';
      if (sliderOpacity) sliderOpacity.value = '24';
      if (badgeOpacity) badgeOpacity.textContent = '24%';
      if (sliderBorderW) sliderBorderW.value = '1';
      if (badgeBorderW) badgeBorderW.textContent = '1px';
      if (sliderBorderO) sliderBorderO.value = '38';
      if (badgeBorderO) badgeBorderO.textContent = '38%';

      updatePreview();
    };
  }

  updatePreview();
}

let currentTab = 'appearance';
let previousTab = 'appearance';

const SECTION_TAB_MAP = {
  appearance: 'appearance',
  'fonts-family': 'appearance',
  look: 'appearance',
  'widget-styles': 'widgets',
  fonts: 'widgets',
  widgets: 'widgets',
  notes: 'widgets',
  folder: 'folder',
  calendar: 'calendar',
  'calendar-views': 'calendar',
  'calendar-style': 'calendar',
  'calendar-smart': 'calendar',
  habits: 'habits',
  'habits-style': 'habits',
  'habits-streaks': 'habits',
  'habits-sleep-mood': 'habits',
  'habits-integration': 'habits',
  'habits-whatsapp': 'habits',
  todo: 'todo',
  superurgent: 'todo',
  classroom: 'todo',
  whatsapp: 'setup',
  clock: 'time',
  pomodoro: 'time',
  quran: 'inspiration',
  hadith: 'inspiration',
  email: 'media',
  photo: 'media',
  eco: 'setup',
  'setup-eco': 'setup',
  'setup-classroom': 'setup',
  'setup-whatsapp': 'setup',
  'setup-calendar-wa': 'setup',
  'setup-email': 'setup',
  setup: 'setup',
};

const TAB_CATEGORY_MAP = {
  appearance: 'appearance',
  widgets: 'widgets',
  todo: 'widgets',
  habits: 'widgets',
  calendar: 'widgets',
  time: 'widgets',
  inspiration: 'widgets',
  media: 'widgets',
  folder: 'widgets',
  setup: 'setup',
};

let lastWidgetTab = 'todo';

function switchTab(tabId, targetId = null) {
  if (currentTab !== 'setup') previousTab = currentTab;
  currentTab = tabId;

  const cat = TAB_CATEGORY_MAP[tabId] || (tabId === 'setup' ? 'setup' : (tabId === 'appearance' ? 'appearance' : 'widgets'));
  if (cat === 'widgets') {
    lastWidgetTab = tabId;
  }

  // Update Category buttons
  document.querySelectorAll('.nav-cat-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.cat === cat || b.dataset.tab === tabId);
  });

  // Toggle Sub-Nav
  const subNav = $('#widgetsSubNav');
  if (subNav) {
    subNav.style.display = (cat === 'widgets') ? 'flex' : 'none';
  }

  const tabs = document.querySelectorAll('.nav-tab');
  for (const t of tabs) {
    t.classList.toggle('active', t.dataset.tab === tabId);
  }

  const panes = document.querySelectorAll('.tab-pane');
  for (const p of panes) {
    p.classList.toggle('active', p.dataset.pane === tabId);
  }

  updateSummaryStatuses();

  if (targetId) {
    setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.classList.remove('flash');
        void el.offsetWidth;
        el.classList.add('flash');
      }
    }, 70);
  } else {
    const body = document.querySelector('.body.scroll');
    if (body) body.scrollTop = 0;
  }
}

function jumpTo(section) {
  const clean = section.replace(/^sec-/, '');
  const tab = SECTION_TAB_MAP[clean] || 'appearance';
  let targetId = document.getElementById(`sec-${clean}`) ? `sec-${clean}` : null;
  if (!targetId && (clean === 'whatsapp' || clean === 'setup-whatsapp')) targetId = 'sec-setup-whatsapp';
  if (!targetId && clean === 'setup-classroom') targetId = 'sec-setup-classroom';
  if (!targetId && clean === 'setup-email') targetId = 'sec-setup-email';
  if (!targetId && clean === 'classroom') targetId = 'sec-classroom';
  if (!targetId && clean === 'notes') targetId = 'sec-widgets';
  switchTab(tab, targetId);
}

function updateSummaryStatuses() {
  const crStatusEl = $('#crSummaryStatus');
  if (crStatusEl) {
    const cr = s.classroom || {};
    if (!cr.enabled) {
      crStatusEl.textContent = t('s.statusDisabled');
      crStatusEl.className = 'setup-launch-status';
    } else if (cr.userEmail) {
      crStatusEl.textContent = `${t('s.statusConnected')} (${cr.userEmail})`;
      crStatusEl.className = 'setup-launch-status connected';
    } else if (cr.accessToken || cr.refreshToken) {
      crStatusEl.textContent = `${t('s.statusConnected')} (Google)`;
      crStatusEl.className = 'setup-launch-status connected';
    } else if (cr.iCalUrl) {
      crStatusEl.textContent = `${t('s.statusConnected')} (iCal)`;
      crStatusEl.className = 'setup-launch-status connected';
    } else {
      crStatusEl.textContent = t('s.statusDisconnectedPrompt');
      crStatusEl.className = 'setup-launch-status disconnected';
    }
  }

  const waStatusEl = $('#waSummaryStatus');
  if (waStatusEl) {
    const wa = s.whatsapp || {};
    if (!wa.enabled) {
      waStatusEl.textContent = t('s.statusDisabled');
      waStatusEl.className = 'setup-launch-status';
    } else if (wa.provider === 'openwa') {
      waStatusEl.textContent = t('s.waStatusOpenWa');
      waStatusEl.className = 'setup-launch-status connected';
    } else if (wa.provider === 'callmebot') {
      waStatusEl.textContent = wa.apiKey ? t('s.waStatusCallMeBotReady') : t('s.waStatusCallMeBotKey');
      waStatusEl.className = wa.apiKey ? 'setup-launch-status connected' : 'setup-launch-status disconnected';
    }
  }

  const emailStatusEl = $('#emailSummaryStatus');
  if (emailStatusEl) {
    const em = s.email || {};
    if (!em.enabled) {
      emailStatusEl.textContent = t('s.statusDisabled');
      emailStatusEl.className = 'setup-launch-status';
    } else if (em.user) {
      emailStatusEl.textContent = `${t('s.statusConnected')}: ${em.user}`;
      emailStatusEl.className = 'setup-launch-status connected';
    } else {
      emailStatusEl.textContent = t('s.statusDisconnected');
      emailStatusEl.className = 'setup-launch-status disconnected';
    }
  }
}

function buildPerWidgetStyles() {
  const select = $('#wStyleSelect');
  if (!select) return;

  function updateForWidget(widgetId) {
    const styles = s.widgetStyles || {};
    const wStyle = styles[widgetId] || {};

    if ($('#wStyleTheme')) $('#wStyleTheme').value = wStyle.theme || 'inherit';
    if ($('#wStyleAccent')) $('#wStyleAccent').value = wStyle.accent || 'inherit';
    if ($('#wStyleFontColor')) $('#wStyleFontColor').value = wStyle.fontColor || 'inherit';
    if ($('#wStyleFontUi')) $('#wStyleFontUi').value = wStyle.fontUi || 'inherit';
    if ($('#wStyleFontNum')) $('#wStyleFontNum').value = wStyle.fontNum || 'inherit';
    if ($('#wStyleFontRead')) $('#wStyleFontRead').value = wStyle.fontRead || 'inherit';
    if ($('#wStyleFontQuran')) $('#wStyleFontQuran').value = wStyle.fontQuran || 'inherit';
    if ($('#wStyleUiWeight')) $('#wStyleUiWeight').value = (wStyle.uiWeight !== undefined && wStyle.uiWeight !== null) ? String(wStyle.uiWeight) : 'inherit';
    if ($('#wStyleNumWeight')) $('#wStyleNumWeight').value = (wStyle.numWeight !== undefined && wStyle.numWeight !== null) ? String(wStyle.numWeight) : 'inherit';
    if ($('#wStyleFontScale')) $('#wStyleFontScale').value = (wStyle.fontScale !== undefined && wStyle.fontScale !== null) ? String(wStyle.fontScale) : 'inherit';
    if ($('#wStyleGlass')) $('#wStyleGlass').value = (wStyle.glass !== undefined && wStyle.glass !== null) ? String(wStyle.glass) : 'inherit';
    if ($('#wStyleRadius')) $('#wStyleRadius').value = (wStyle.radius !== undefined && wStyle.radius !== null) ? String(wStyle.radius) : 'inherit';
    if ($('#wStyleCardSurface')) $('#wStyleCardSurface').value = wStyle.cardSurface || 'inherit';
    if ($('#wStyleBorderGlow')) $('#wStyleBorderGlow').value = wStyle.borderGlow || 'inherit';
    if ($('#wStyleDensity')) $('#wStyleDensity').value = wStyle.density || 'inherit';
    if ($('#wStyleEdge')) $('#wStyleEdge').value = (wStyle.edge !== undefined && wStyle.edge !== null) ? String(wStyle.edge) : 'inherit';
    if ($('#wStyleBorderWidth')) $('#wStyleBorderWidth').value = (wStyle.borderWidth !== undefined && wStyle.borderWidth !== null) ? String(wStyle.borderWidth) : 'inherit';
    if ($('#wStyleMotion')) $('#wStyleMotion').value = (wStyle.motion !== undefined && wStyle.motion !== null) ? String(wStyle.motion) : 'inherit';
    if ($('#wStyleContrast')) $('#wStyleContrast').value = wStyle.contrast || 'inherit';
    if ($('#wStyleGrain')) $('#wStyleGrain').value = (wStyle.grain !== undefined && wStyle.grain !== null) ? String(wStyle.grain) : 'inherit';
    if ($('#wStyleTint')) $('#wStyleTint').value = wStyle.tint || 'inherit';
    if ($('#wStyleTintStrength')) $('#wStyleTintStrength').value = (wStyle.tintStrength !== undefined && wStyle.tintStrength !== null) ? String(wStyle.tintStrength) : 'inherit';

    const hasNum = ['clock', 'pomodoro', 'calendar', 'todo', 'habits', 'habits-dashboard', 'event', 'task'].includes(widgetId);
    const hasRead = ['quran', 'tafsir', 'hadith', 'notes', 'email', 'email-view'].includes(widgetId);
    const hasQuran = ['quran', 'tafsir'].includes(widgetId);

    if ($('#wStyleFontNumRow')) $('#wStyleFontNumRow').style.display = hasNum ? '' : 'none';
    if ($('#wStyleNumWeightRow')) $('#wStyleNumWeightRow').style.display = hasNum ? '' : 'none';
    if ($('#wStyleFontReadRow')) $('#wStyleFontReadRow').style.display = hasRead ? '' : 'none';
    if ($('#wStyleFontQuranRow')) $('#wStyleFontQuranRow').style.display = hasQuran ? '' : 'none';
  }

  window._updateWStyleSelectTab = updateForWidget;

  select.addEventListener('change', (e) => {
    updateForWidget(e.target.value);
    if ($('#appearanceScopeSelect')) {
      $('#appearanceScopeSelect').value = e.target.value;
      currentScope = e.target.value;
      syncAppearanceScopeUI();
    }
  });

  function saveWStyle(key, value) {
    const widgetId = select.value;
    s.widgetStyles = s.widgetStyles || {};
    s.widgetStyles[widgetId] = s.widgetStyles[widgetId] || {};
    if (value === 'inherit') {
      delete s.widgetStyles[widgetId][key];
      if (Object.keys(s.widgetStyles[widgetId]).length === 0) {
        delete s.widgetStyles[widgetId];
      }
    } else {
      s.widgetStyles[widgetId][key] = value;
    }
    set({ widgetStyles: s.widgetStyles }, { immediate: true });
    syncAppearanceScopeUI();
  }

  $('#wStyleTheme')?.addEventListener('change', (e) => saveWStyle('theme', e.target.value));
  $('#wStyleAccent')?.addEventListener('change', (e) => saveWStyle('accent', e.target.value));
  $('#wStyleFontColor')?.addEventListener('change', (e) => saveWStyle('fontColor', e.target.value));
  $('#wStyleFontUi')?.addEventListener('change', (e) => saveWStyle('fontUi', e.target.value));
  $('#wStyleFontNum')?.addEventListener('change', (e) => saveWStyle('fontNum', e.target.value));
  $('#wStyleFontRead')?.addEventListener('change', (e) => saveWStyle('fontRead', e.target.value));
  $('#wStyleFontQuran')?.addEventListener('change', (e) => saveWStyle('fontQuran', e.target.value));
  $('#wStyleUiWeight')?.addEventListener('change', (e) => saveWStyle('uiWeight', e.target.value === 'inherit' ? 'inherit' : Number(e.target.value)));
  $('#wStyleNumWeight')?.addEventListener('change', (e) => saveWStyle('numWeight', e.target.value === 'inherit' ? 'inherit' : Number(e.target.value)));
  $('#wStyleFontScale')?.addEventListener('change', (e) => saveWStyle('fontScale', e.target.value === 'inherit' ? 'inherit' : Number(e.target.value)));
  $('#wStyleGlass')?.addEventListener('change', (e) => saveWStyle('glass', e.target.value === 'inherit' ? 'inherit' : Number(e.target.value)));
  $('#wStyleRadius')?.addEventListener('change', (e) => saveWStyle('radius', e.target.value === 'inherit' ? 'inherit' : Number(e.target.value)));
  $('#wStyleCardSurface')?.addEventListener('change', (e) => saveWStyle('cardSurface', e.target.value));
  $('#wStyleBorderGlow')?.addEventListener('change', (e) => saveWStyle('borderGlow', e.target.value));
  $('#wStyleDensity')?.addEventListener('change', (e) => saveWStyle('density', e.target.value));
  $('#wStyleEdge')?.addEventListener('change', (e) => saveWStyle('edge', e.target.value === 'inherit' ? 'inherit' : Number(e.target.value)));
  $('#wStyleBorderWidth')?.addEventListener('change', (e) => saveWStyle('borderWidth', e.target.value === 'inherit' ? 'inherit' : Number(e.target.value)));
  $('#wStyleMotion')?.addEventListener('change', (e) => saveWStyle('motion', e.target.value === 'inherit' ? 'inherit' : Number(e.target.value)));
  $('#wStyleContrast')?.addEventListener('change', (e) => saveWStyle('contrast', e.target.value));
  $('#wStyleGrain')?.addEventListener('change', (e) => saveWStyle('grain', e.target.value === 'inherit' ? 'inherit' : (e.target.value === 'true')));
  $('#wStyleTint')?.addEventListener('change', (e) => saveWStyle('tint', e.target.value));
  $('#wStyleTintStrength')?.addEventListener('change', (e) => saveWStyle('tintStrength', e.target.value === 'inherit' ? 'inherit' : Number(e.target.value)));

  $('#wStyleResetBtn')?.addEventListener('click', () => {
    const widgetId = select.value;
    s.widgetStyles = s.widgetStyles || {};
    delete s.widgetStyles[widgetId];
    set({ widgetStyles: s.widgetStyles }, { immediate: true });
    updateForWidget(widgetId);
    syncAppearanceScopeUI();
    const st = $('#wStyleStatus');
    if (st) {
      st.textContent = t('s.wStyleResetDone');
      setTimeout(() => { if (st.isConnected) st.textContent = ''; }, 2000);
    }
  });

  updateForWidget(select.value || 'clock');
}

let tabsWired = false;
function wireTabs() {
  if (tabsWired) return;
  tabsWired = true;

  document.querySelectorAll('.nav-cat-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.cat;
      if (cat === 'appearance') {
        switchTab('appearance');
      } else if (cat === 'setup') {
        switchTab('setup');
      } else if (cat === 'widgets') {
        switchTab(lastWidgetTab || 'todo');
      }
    });
  });

  const tabs = document.querySelectorAll('.nav-tab');
  for (const tab of tabs) {
    tab.addEventListener('click', () => {
      if (tab.dataset.tab) {
        if (TAB_CATEGORY_MAP[tab.dataset.tab] === 'widgets') {
          lastWidgetTab = tab.dataset.tab;
        }
        switchTab(tab.dataset.tab);
      }
    });
  }

  $('#btnGoToPerWidgetStyle')?.addEventListener('click', () => {
    switchTab('widgets', 'sec-widget-styles');
  });

  $('#openCrSetupBtn')?.addEventListener('click', () => {
    switchTab('setup', 'sec-setup-classroom');
  });
  $('#openWaSetupBtn')?.addEventListener('click', () => {
    switchTab('setup', 'sec-setup-whatsapp');
  });
  $('#openEmailSetupBtn')?.addEventListener('click', () => {
    switchTab('setup', 'sec-setup-email');
  });
  $('#setupBackBtn')?.addEventListener('click', () => {
    switchTab(previousTab || 'appearance');
  });
}

let searchWired = false;
function initSettingsSearch() {
  if (searchWired) return;
  const input = document.getElementById('settingsSearchInput');
  const clearBtn = document.getElementById('searchClearBtn');
  const summary = document.getElementById('searchResultsSummary');
  if (!input) return;
  searchWired = true;

  const performSearch = (q) => {
    const query = (q || '').trim().toLowerCase();
    if (clearBtn) clearBtn.style.display = query ? 'block' : 'none';

    if (!query) {
      if (summary) summary.style.display = 'none';
      document.querySelectorAll('.tab-pane .group, .scope-box').forEach((el) => {
        el.style.display = '';
        el.classList.remove('search-matched');
      });
      document.querySelectorAll('.nav-tab').forEach((t) => t.classList.remove('has-search-match'));
      document.querySelectorAll('.nav-cat-btn').forEach((b) => b.classList.remove('has-search-match'));
      return;
    }

    let totalMatches = 0;
    let firstMatchingTab = null;
    const tabsMap = {};

    document.querySelectorAll('.tab-pane').forEach((pane) => {
      const tabId = pane.dataset.pane;
      let paneMatches = 0;

      pane.querySelectorAll('.group, .scope-box').forEach((group) => {
        const text = (group.textContent || '').toLowerCase();
        if (text.includes(query)) {
          group.style.display = '';
          group.classList.add('search-matched');
          paneMatches++;
          totalMatches++;
        } else {
          group.style.display = 'none';
          group.classList.remove('search-matched');
        }
      });

      tabsMap[tabId] = paneMatches;
      if (paneMatches > 0 && !firstMatchingTab) {
        firstMatchingTab = tabId;
      }
    });

    document.querySelectorAll('.nav-tab').forEach((tab) => {
      const count = tabsMap[tab.dataset.tab] || 0;
      tab.classList.toggle('has-search-match', count > 0);
    });

    document.querySelectorAll('.nav-cat-btn').forEach((catBtn) => {
      const cat = catBtn.dataset.cat;
      let hasMatch = false;
      if (cat === 'appearance' && (tabsMap['appearance'] > 0)) hasMatch = true;
      else if (cat === 'setup' && (tabsMap['setup'] > 0)) hasMatch = true;
      else if (cat === 'widgets') {
        hasMatch = ['todo', 'habits', 'calendar', 'time', 'inspiration', 'media', 'folder', 'widgets'].some((k) => tabsMap[k] > 0);
      }
      catBtn.classList.toggle('has-search-match', hasMatch);
    });

    if (summary) {
      summary.style.display = 'block';
      if (totalMatches > 0) {
        summary.innerHTML = `<span class="badge-pill" style="font-size:11px;">🔍 وُجدت ${digits(totalMatches)} نتيجة مطابقة</span>`;
      } else {
        summary.innerHTML = `<span class="badge-pill warn" style="font-size:11px;">⚠️ لا توجد نتائج مطابقة لـ "${query}"</span>`;
      }
    }

    if (firstMatchingTab && (!tabsMap[currentTab] || tabsMap[currentTab] === 0)) {
      switchTab(firstMatchingTab);
    }
  };

  input.addEventListener('input', (e) => performSearch(e.target.value));
  clearBtn?.addEventListener('click', () => {
    input.value = '';
    performSearch('');
    input.focus();
  });
}

/* ---------- wiring ---------- */

function wire() {
  wireTabs();
  initSettingsSearch();
  buildPerWidgetStyles();
  updateSummaryStatuses();
  wireSetupGuideModals();
  wireWidgetEnableSwitches();

  $('#headIcon').append(icon('gear'));
  $('#closeBtn').append(icon('close'));
  $('#closeBtn').addEventListener('click', () => closeWindow({ hideOnly: true }));

  // ── Quick Top Header Language Switcher (عربي / EN) & #language sync ──
  const curLang = s.language || (document.documentElement.lang === 'en' ? 'en' : 'ar');
  const btnAr = $('#langBtnAr');
  const btnEn = $('#langBtnEn');
  const syncLangButtons = (target) => {
    const isEn = target === 'en';
    if (btnAr) btnAr.classList.toggle('active', !isEn);
    if (btnEn) btnEn.classList.toggle('active', isEn);
  };
  syncLangButtons(curLang);

  const applyAppLanguage = async (newLang) => {
    if (s.language === newLang) return;
    syncLangButtons(newLang);
    if ($('#language')) $('#language').value = newLang;
    await window.widgets.settings.set({ language: newLang });
  };

  if (btnAr) btnAr.onclick = () => applyAppLanguage('ar');
  if (btnEn) btnEn.onclick = () => applyAppLanguage('en');

  $('#language').value = s.language || 'auto';
  $('#language').addEventListener('change', async (e) => {
    syncLangButtons(e.target.value);
    // Save first; every window then reloads itself in the new language.
    await window.widgets.settings.set({ language: e.target.value });
  });
  $('#numeralsRow').hidden = en();

  $('#appearanceScopeSelect')?.addEventListener('change', (e) => {
    currentScope = e.target.value;
    syncAppearanceScopeUI();
  });

  $('#scopeResetBtn')?.addEventListener('click', () => {
    if (currentScope !== 'global' && s.widgetStyles?.[currentScope]) {
      delete s.widgetStyles[currentScope];
      set({ widgetStyles: { ...s.widgetStyles } }, { immediate: true });
      syncAppearanceScopeUI();
      const pill = $('#scopeStatusPill');
      if (pill) {
        pill.textContent = t('s.wStyleResetDone');
        setTimeout(() => { if (pill.isConnected) syncAppearanceScopeUI(); }, 1600);
      }
    }
  });

  buildThemes();
  buildSwatches();
  $('#accentPick').value = s.accent || '#3E7CBE';
  $('#accentHex').textContent = (s.accent || '').toUpperCase();
  $('#accentPick').addEventListener('input', (e) => setAccent(e.target.value));

  buildGlass();
  range('#radius', '#radiusOut', getEffectiveRadius(), (v) => `${digits(v)}px`, (v) => {
    if (currentScope === 'global') set({ radius: v });
    else saveScopedStyle('radius', v);
    syncAppearanceScopeUI();
  });

  range('#scopeGlass', '#scopeGlassOut', Math.round(getEffectiveGlass() * 100), pct, (v) => {
    saveScopedStyle('glass', v / 100);
    syncAppearanceScopeUI();
  });

  range('#scopeFontScale', '#scopeFontScaleOut', Math.round(getEffectiveScale() * 100), pct, (v) => {
    saveScopedStyle('fontScale', v / 100);
    syncAppearanceScopeUI();
  });

  syncAppearanceScopeUI();

  buildFonts();
  buildFontCards();
  buildTypography();
  buildLook();
  buildEcoControls();
  buildInspiration();
  buildWidgetRows();
  buildTodo();
  buildClassroom();
  buildSuperUrgentAndWhatsApp();
  buildClock();
  buildCalendar();
  buildHabits();
  buildPomodoro();
  buildEmail();
  buildBrowserSetup();
  buildPhoto();
  buildInterval();
  $('#numerals').value = s.numerals || 'latn';
  $('#numerals').addEventListener('change', (e) => set({ numerals: e.target.value }, { immediate: true }));
  switchEl('#onTop', s.alwaysOnTop, (v) => set({ alwaysOnTop: v }, { immediate: true }));
  switchEl('#autoStart', s.autoStart, (v) => set({ autoStart: v }, { immediate: true }));
  switchEl('#preventOpenWidgetsOverlap', Boolean(s.preventOpenWidgetsOverlap), (v) => set({ preventOpenWidgetsOverlap: v }, { immediate: true }));

  $('#resetLayout').addEventListener('click', () => window.widgets.resetLayout());

  $('#interval').addEventListener('change', (e) =>
    set({ quranIntervalHours: Number(e.target.value) }, { immediate: true }));

  $('#tafsir').addEventListener('change', (e) => {
    set({ tafsir: e.target.value }, { immediate: true });
    updateTafsirNote();
  });

  switchEl('#showTr', s.showTranslation, (v) => {
    set({ showTranslation: v }, { immediate: true });
    $('#trRow').hidden = !v;
  });
  $('#translation').addEventListener('change', (e) =>
    set({ translation: e.target.value }, { immediate: true }));

  $('#prefetch').addEventListener('click', async (e) => {
    const out = $('#prefetchOut');
    e.target.disabled = true;
    out.textContent = t('s.preparing');
    try {
      const r = await window.widgets.quran.prefetch();
      out.textContent = t('s.prepared', { ayat: digits(r.cache.ayat), tafsir: digits(r.cache.tafsir) });
    } catch {
      out.textContent = t('s.prepareFailed');
    }
    e.target.disabled = false;
  });

  $('#prefetchHadith').addEventListener('click', async (e) => {
    const out = $('#prefetchHadithOut');
    e.target.disabled = true;
    out.textContent = t('s.preparing');
    try {
      const r = await window.widgets.hadith.prefetch();
      out.textContent = t('s.preparedHadith', { n: digits(r.cache.verified) });
    } catch {
      out.textContent = t('s.prepareFailed');
    }
    e.target.disabled = false;
  });

  $('#resetAll').addEventListener('click', async (e) => {
    const b = e.currentTarget;
    if (!b.dataset.armed) {
      b.dataset.armed = '1';
      b.textContent = t('s.confirm');
      setTimeout(() => {
        if (!b.isConnected) return;
        delete b.dataset.armed;
        b.textContent = t('s.resetAll');
      }, 2600);
      return;
    }
    s = await window.widgets.settings.reset();
    applySettings(s);
    delete b.dataset.armed;
    b.textContent = t('s.resetDone');
    refreshControls();
    setTimeout(() => { if (b.isConnected) b.textContent = t('s.resetAll'); }, 1600);
  });

  window.widgets.settings.onChange((next) => {
    s = next;
    applySettings(s);
    syncWidgetRows();
    syncEmail();
    syncBrowserSetup();
    syncPhoto();
    updateSummaryStatuses();
    buildPerWidgetStyles();
  });
  window.widgets.win.onSection(jumpTo);
}

function wireSetupGuideModals() {
  const modal = $('#setupGuideModal');
  const titleEl = $('#setupGuideTitle');
  const subEl = $('#setupGuideSub');
  const bodyEl = $('#setupGuideBody');
  const closeBtn = $('#setupGuideCloseBtn');
  const gotItBtn = $('#setupGuideGotItBtn');

  if (!modal) return;

  const hideGuide = () => { modal.hidden = true; };
  closeBtn?.addEventListener('click', hideGuide);
  gotItBtn?.addEventListener('click', hideGuide);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) hideGuide();
  });

  function renderGuideCards(steps) {
    bodyEl.replaceChildren();
    steps.forEach((st) => {
      const card = el('div', { class: st.alert ? 'setup-guide-alert' : (st.tip ? 'setup-guide-tip' : 'setup-guide-step') });
      if (st.alert || st.tip) {
        card.append(
          el('div', { style: 'display: flex; gap: 8px; align-items: flex-start;' },
            el('span', { style: 'font-size: 16px; flex-shrink: 0;', text: st.num }),
            el('div', {},
              el('div', { style: 'font-weight: 700; margin-bottom: 4px;', text: st.title }),
              el('div', { style: 'line-height: 1.5;', text: st.desc })
            )
          )
        );
      } else {
        const num = el('div', { class: 'setup-step-num', text: st.num });
        const content = el('div', { class: 'setup-step-content' },
          el('div', { class: 'setup-step-title', text: st.title }),
          el('div', { class: 'setup-step-desc', text: st.desc })
        );
        card.append(num, content);
      }
      bodyEl.append(card);
    });
  }

  function openGuide(type) {
    if (type === 'classroom') {
      titleEl.textContent = en() ? 'Google Classroom Setup Guide' : 'دليل إعداد Google Classroom';
      subEl.textContent = en() ? 'Step-by-step instructions for OAuth & ICS Calendar' : 'خطوات بسيطة لربط الواجبات تلقائياً وحل مشكلة التحقق';

      const steps = en() ? [
        { num: '1', title: 'Google Cloud Console', desc: 'Visit console.cloud.google.com and create a new project.' },
        { num: '2', title: 'Enable Google Classroom API', desc: 'Go to APIs & Services > Library, search for Google Classroom API and click Enable.' },
        { num: '3', title: 'OAuth Consent Screen & Test Users', desc: 'Select External, and on Test Users page add your Google account email.' },
        { num: '4', title: 'Create Desktop OAuth Credentials', desc: 'In Credentials, create OAuth client ID of type "Desktop App", then paste Client ID and Secret below.' },
        { num: '💡', alert: true, title: 'Notice about Google Verification across reboots', desc: 'When your GCP project is in "Testing" mode, Google refresh tokens expire after 7 days or upon device IP changes. To avoid repeated verification challenges, publish the project or use the iCal feed below!' },
        { num: '📅', tip: true, title: 'Easiest Alternative: iCal Calendar Feed', desc: 'Open Google Calendar > Classroom calendar settings > copy "Secret address in iCal format" and paste it into the iCal field below. No developer credentials needed!' },
      ] : [
        { num: '١', title: 'الدخول إلى Google Cloud Console', desc: 'توجه إلى الرابط (console.cloud.google.com) وقم بإنشاء مشروع جديد باسم ميرقات أو أي اسم تفضله.' },
        { num: '٢', title: 'تفعيل Google Classroom API', desc: 'من القائمة الجانبية اختر APIs & Services ثم Library، وابحث عن Google Classroom API واضغط تفعيل (Enable).' },
        { num: '٣', title: 'شاشة الموافقة وإضافة البريد كمستخدم تجريبي', desc: 'من قسم OAuth consent screen اختر نوع External، وفي صفحة Test users أضف بريدك الإلكتروني.' },
        { num: '٤', title: 'إنشاء معرّف الاعتماد (Desktop App)', desc: 'من Credentials اختر Create Credentials > OAuth client ID واختر نوع التطبيق Desktop App. انسخ Client ID و Client Secret والصقهما في الخانات أدناه واضغط "تسجيل الدخول والتخويل".' },
        { num: '⚠️', alert: true, title: 'توضيح هام جداً حول مشكلة إعادة التحقق (Verification Issue)', desc: 'إذا كان مشروعك في وضع التجربة (Testing) لدى Google، فإن جوجل تلغي صلاحية الـ Refresh Token كل 7 أيام أو عند إعادة فتح الجهاز برقم IP جديد كإجراء أمني وقائي. لتفادي ذلك يمكنك إما نقل المشروع لحالة Production، أو ببساطة استخدام خيار رابط تقويم iCal أدناه.' },
        { num: '📅', tip: true, title: 'البديل الأسهل والأسرع (رابط تقويم iCal)', desc: 'افتح تقويم Google المرتبط بحسابك المدرسي/الجامعي > إعدادات التقويم الخاص بالفصل > انسخ "العنوان السري بتنسيق iCal" وضعه في خانة iCal أدناه. سيعمل فورياً دون الحاجة لأي مفاتيح مطورين!' },
      ];

      renderGuideCards(steps);
    } else if (type === 'calendar-wa') {
      titleEl.textContent = en() ? 'Calendar Events WhatsApp Dispatcher Guide' : 'دليل إرسال تبريكات ومواعيد التقويم عبر واتساب';
      subEl.textContent = en() ? 'Automated occasion greetings and calendar alerts via WhatsApp' : 'خطوات ضبط الإرسال التلقائي للتهاني والمناسبات عبر خادم واتساب';

      const steps = en() ? [
        { num: '1', title: 'Enable Feature & Timing', desc: 'Toggle "Send event greetings & alerts via WhatsApp" and select your preferred schedule (e.g. morning of event at 9:00 AM).' },
        { num: '2', title: 'Set Recipient Number or Group ID', desc: 'Specify your international phone number (+...) or WhatsApp Group ID to receive occasion notifications.' },
        { num: '3', title: 'Customize Template & Dynamic Tags', desc: 'Use tags such as {title}, {date}, and {countdown} to generate personalized greeting text automatically for every occasion.' },
        { num: '🚀', tip: true, title: 'Live Preview & Instant Test', desc: 'Review the live preview bubble below and click "Send Test Message" to verify immediate delivery.' },
      ] : [
        { num: '١', title: 'تفعيل الميزة واختيار التوقيت المناسب', desc: 'قم بتفعيل زر "إرسال رسائل وتبريكات المناسبات عبر واتساب" واختر التوقيت المفضل (مثلاً: صباح يوم المناسبة في الساعة 9:00 صباحاً لتصل التهنئة في أول اليوم).' },
        { num: '٢', title: 'تحديد المستلم الافتراضي أو المجموعات', desc: 'في خانة "الرقم أو المجموعة البديلة"، يمكنك كتابة رقم هاتفك أو رقم العائلة بالصيغة الدولية (+20...)، أو كتابة معرّف أي مجموعة واتساب تود توجيه التهاني إليها.' },
        { num: '٣', title: 'تخصيص قالب الرسالة والوسوم الذكية', desc: 'يمكنك كتابة نص التهنئة والضغط على أزرار الوسوم مثل {title} لاسم المناسبة، {date} للتاريخ، و {countdown} للعد التنازلي ليتم استبدالها آلياً بنص مخصص لكل حدث.' },
        { num: '🚀', tip: true, title: 'زر التجربة والمعاينة الفورية', desc: 'راجع شكل الفقاعة التفاعلية في الأسفل، ثم اضغط على زر "تجربة إرسال رسالة واتساب الآن" للتأكد من وصول الرسالة فوراً لهاتفك بنجاح.' },
      ];

      renderGuideCards(steps);
    } else if (type === 'browser') {
      titleEl.textContent = en() ? 'Default Browser & Dedicated Chrome Account Guide' : 'دليل متصفح فتح الروابط وحساب Google Chrome المعتمد';
      subEl.textContent = en() ? 'Ensure links and emails open in your intended Google Chrome profile' : 'توجيه الروابط ورسائل البريد إلى حساب كروم الدراسي أو الشخصي الصحيح';

      const steps = en() ? [
        { num: '1', title: 'Why dedicate a Chrome profile?', desc: 'Avoid opening academic Classroom links or emails in random personal profiles, which triggers access denied or account confusion.' },
        { num: '2', title: 'Automatic Chrome Profile Detection', desc: 'The app scans your local Chrome installation and lists all configured profiles (university, work, personal).' },
        { num: '3', title: 'Manual Email Override (If Needed)', desc: 'If your profile is not listed automatically, type your account email directly into the manual field.' },
        { num: '⚡', tip: true, title: 'Instant Profile Test', desc: 'Click "Test Link With This Profile" to ensure links launch smoothly in the correct account profile.' },
      ] : [
        { num: '١', title: 'لماذا تحدد حساب Google Chrome معتمد؟', desc: 'لتفادي مشكلة فتح روابط منصات الجامعة (كلاسرووم / بوابة التعليم) أو روابط البريد في نافذة متصفح تستخدم بريد شخصي عشوائي، مما يسبب رفض الدخول أو طلب تسجيل خروج.' },
        { num: '٢', title: 'الكشف التلقائي عن حسابات كروم المثبتة', desc: 'يقوم البرنامج تلقائياً بالبحث في ملفات Google Chrome المحلية واقتراح حساباتك المسجلة (مثل حساب الجامعة وحسابك الشخصي).' },
        { num: '٣', title: 'إدخال البريد الإلكتروني يدوياً (عند الحاجة)', desc: 'إذا لم يظهر اسم الحساب في القائمة المنسدلة، يمكنك كتابة بريدك الإلكتروني في خانة البريد اليدوي وسيتعرف البرنامج على البروفايل فوراً.' },
        { num: '⚡', tip: true, title: 'اختبار الفتح الفوري', desc: 'اضغط على زر "تجربة فتح رابط بهذا الحساب" للتأكد من أن نافذة كروم تفتح مباشرة بالحساب المعتمد بدون الحاجة للتبديل اليدوي بين الحسابات.' },
      ];

      renderGuideCards(steps);
    } else if (type === 'eco') {
      titleEl.textContent = en() ? 'Laptop Battery & Eco Power Saver Guide' : 'دليل وضع توفير الطاقة والبطارية للابتوب (Eco Mode)';
      subEl.textContent = en() ? 'Extend laptop battery life and reduce CPU utilization by up to 40%' : 'إطالة عمر بطارية اللابتوب وتخفيف استهلاك المعالج بنسبة تصل إلى 40%';

      const steps = en() ? [
        { num: '1', title: 'Smart Battery Detection', desc: 'Monitors the Windows battery API. The moment you unplug your charger, Eco Mode activates automatically.' },
        { num: '2', title: 'Power Saving Measures', desc: 'Freezes inactive mini widgets, disables heavy blur shaders, and relaxes animation cycles to keep your laptop cool and quiet.' },
        { num: '3', title: 'Per-Widget Custom Exclusions', desc: 'Want a specific widget to stay fully animated? You can customize or exempt individual widgets in the matrix below.' },
        { num: '🔋', tip: true, title: 'Operating Modes', desc: 'Select "Auto (Battery only)", "Always On" for older hardware, or "Off" for maximum visual fidelity.' },
      ] : [
        { num: '١', title: 'كيف يعمل الوضع التلقائي الذكي؟', desc: 'يراقب التطبيق موصل الشاحن عبر واجهة نظام Windows الرسمية. فور فصل الشاحن والعمل على البطارية، يتحول التطبيق تلقائياً لوضع توفير الطاقة.' },
        { num: '٢', title: 'ما هي الإجراءات التي يتم تفعيلها لحفظ الطاقة؟', desc: 'يتم تجميد الودجات المصغرة وغير المرئية، وإيقاف تأثيرات الشيدرز الضبابية العميقة (Heavy Blur)، وتقليل تردد تحديث الثواني، مما يخفض حرارة الجهاز واستهلاك المعالج.' },
        { num: '٣', title: 'جدول التحكم الفردي في الودجات', desc: 'إذا كنت تفضل بقاء ودجت معين بكامل رونقه وبلوره حتى أثناء العمل على البطارية، يمكنك الضغط عليه في جدول الودجات واستثنائه من التوفير.' },
        { num: '🔋', tip: true, title: 'خيارات التشغيل الدائم أو الإيقاف', desc: 'يمكنك اختيار "تلقائي مع البطارية"، أو "تفعيل دائم" للأجهزة الضعيفة، أو "إيقاف التوفير" لأقصى أداء بصري.' },
      ];

      renderGuideCards(steps);
    } else if (type === 'whatsapp') {
      titleEl.textContent = en() ? 'WhatsApp & OpenWA Setup Guide' : 'دليل إعداد WhatsApp وخادم OpenWA';
      subEl.textContent = en() ? 'Local server pairing & privacy facts' : 'خطوات تشغيل الخادم والربط بأمان كامل';

      const steps = en() ? [
        { num: '1', title: 'Start Native OpenWA Server', desc: 'Click "Start OpenWA Server Now" below. The server runs purely locally on 127.0.0.1:2785.' },
        { num: '2', title: 'Scan QR Code from Phone', desc: 'Open WhatsApp on your mobile phone > Linked Devices > Link a Device, and scan the QR code displayed.' },
        { num: '3', title: 'Add Numbers or Groups', desc: 'Enter recipient international phone numbers or select groups from your participating groups list.' },
        { num: '🔒', tip: true, title: 'Security & Privacy Guarantee', desc: 'OpenWA runs strictly on your own computer loopback interface (127.0.0.1). Zero chats or numbers are sent to third parties.' },
      ] : [
        { num: '١', title: 'تشغيل خادم OpenWA المحلي', desc: 'اضغط على زر "تشغيل خادم OpenWA الآن" أدناه. الخادم مبني بتقنية خفيفة تستهلك أقل من 35 ميجابايت من الذاكرة.' },
        { num: '٢', title: 'مسح رمز الاستجابة السريعة (QR Code)', desc: 'افتح تطبيق واتساب في هاتفك > الأجهزة المرتبطة > ربط جهاز، وامسح رمز الـ QR الذي يظهر في المربع أدناه أو في المتصفح.' },
        { num: '٣', title: 'إضافة الأرقام ومجموعات الواتساب', desc: 'أضف أرقامك أو استخدم زر "تصفح المجموعات" لاختيار أي مجموعة تريد إرسال التنبيهات المدرسية أو الجامعية إليها.' },
        { num: '🛡️', tip: true, title: 'ضمان الأمان والخصوصية بنسبة 100%', desc: 'الخادم يعمل محلياً فقط على جهازك (127.0.0.1) ولا يتصل بأي خوادم خارجية مشبوهة، ولا يتم إرسال أي أرقام أو محادثات خارج حاسوبك إطلاقاً.' },
      ];

      renderGuideCards(steps);
    } else if (type === 'calendar-wa') {
      titleEl.textContent = en() ? 'Calendar Events WhatsApp Dispatcher Guide' : 'دليل إرسال تبريكات ومواعيد التقويم عبر واتساب';
      subEl.textContent = en() ? 'Automated occasion greetings and calendar alerts via WhatsApp' : 'خطوات ضبط الإرسال التلقائي للتهاني والمناسبات عبر خادم واتساب';

      const steps = en() ? [
        { num: '1', title: 'Enable Feature & Timing', desc: 'Toggle "Send event greetings & alerts via WhatsApp" and select your preferred schedule (e.g. morning of event at 9:00 AM).' },
        { num: '2', title: 'Set Recipient Number or Group ID', desc: 'Specify your international phone number (+...) or WhatsApp Group ID to receive occasion notifications.' },
        { num: '3', title: 'Customize Template & Dynamic Tags', desc: 'Use tags such as {title}, {date}, and {countdown} to generate personalized greeting text automatically for every occasion.' },
        { num: '🚀', tip: true, title: 'Live Preview & Instant Test', desc: 'Review the live preview bubble below and click "Send Test Message" to verify immediate delivery.' },
      ] : [
        { num: '١', title: 'تفعيل الميزة واختيار التوقيت المناسب', desc: 'قم بتفعيل زر "إرسال رسائل وتبريكات المناسبات عبر واتساب" واختر التوقيت المفضل (مثلاً: صباح يوم المناسبة في الساعة 9:00 صباحاً لتصل التهنئة في أول اليوم).' },
        { num: '٢', title: 'تحديد المستلم الافتراضي أو المجموعات', desc: 'في خانة "الرقم أو المجموعة البديلة"، يمكنك كتابة رقم هاتفك أو رقم العائلة بالصيغة الدولية (+20...)، أو كتابة معرّف أي مجموعة واتساب تود توجيه التهاني إليها.' },
        { num: '٣', title: 'تخصيص قالب الرسالة والوسوم الذكية', desc: 'يمكنك كتابة نص التهنئة والضغط على أزرار الوسوم مثل {title} لاسم المناسبة، {date} للتاريخ، و {countdown} للعد التنازلي ليتم استبدالها آلياً بنص مخصص لكل حدث.' },
        { num: '🚀', tip: true, title: 'زر التجربة والمعاينة الفورية', desc: 'راجع شكل الفقاعة التفاعلية في الأسفل، ثم اضغط على زر "تجربة إرسال رسالة واتساب الآن" للتأكد من وصول الرسالة فوراً لهاتفك بنجاح.' },
      ];

      renderGuideCards(steps);
    } else if (type === 'browser') {
      titleEl.textContent = en() ? 'Default Browser & Dedicated Chrome Account Guide' : 'دليل متصفح فتح الروابط وحساب Google Chrome المعتمد';
      subEl.textContent = en() ? 'Ensure links and emails open in your intended Google Chrome profile' : 'توجيه الروابط ورسائل البريد إلى حساب كروم الدراسي أو الشخصي الصحيح';

      const steps = en() ? [
        { num: '1', title: 'Why dedicate a Chrome profile?', desc: 'Avoid opening academic Classroom links or emails in random personal profiles, which triggers access denied or account confusion.' },
        { num: '2', title: 'Automatic Chrome Profile Detection', desc: 'The app scans your local Chrome installation and lists all configured profiles (university, work, personal).' },
        { num: '3', title: 'Manual Email Override (If Needed)', desc: 'If your profile is not listed automatically, type your account email directly into the manual field.' },
        { num: '⚡', tip: true, title: 'Instant Profile Test', desc: 'Click "Test Link With This Profile" to ensure links launch smoothly in the correct account profile.' },
      ] : [
        { num: '١', title: 'لماذا تحدد حساب Google Chrome معتمد؟', desc: 'لتفادي مشكلة فتح روابط منصات الجامعة (كلاسرووم / بوابة التعليم) أو روابط البريد في نافذة متصفح تستخدم بريد شخصي عشوائي، مما يسبب رفض الدخول أو طلب تسجيل خروج.' },
        { num: '٢', title: 'الكشف التلقائي عن حسابات كروم المثبتة', desc: 'يقوم البرنامج تلقائياً بالبحث في ملفات Google Chrome المحلية واقتراح حساباتك المسجلة (مثل حساب الجامعة وحسابك الشخصي).' },
        { num: '٣', title: 'إدخال البريد الإلكتروني يدوياً (عند الحاجة)', desc: 'إذا لم يظهر اسم الحساب في القائمة المنسدلة، يمكنك كتابة بريدك الإلكتروني في خانة البريد اليدوي وسيتعرف البرنامج على البروفايل فوراً.' },
        { num: '⚡', tip: true, title: 'اختبار الفتح الفوري', desc: 'اضغط على زر "تجربة فتح رابط بهذا الحساب" للتأكد من أن نافذة كروم تفتح مباشرة بالحساب المعتمد بدون الحاجة للتبديل اليدوي بين الحسابات.' },
      ];

      renderGuideCards(steps);
    } else if (type === 'eco') {
      titleEl.textContent = en() ? 'Laptop Battery & Eco Power Saver Guide' : 'دليل وضع توفير الطاقة والبطارية للابتوب (Eco Mode)';
      subEl.textContent = en() ? 'Extend laptop battery life and reduce CPU utilization by up to 40%' : 'إطالة عمر بطارية اللابتوب وتخفيف استهلاك المعالج بنسبة تصل إلى 40%';

      const steps = en() ? [
        { num: '1', title: 'Smart Battery Detection', desc: 'Monitors the Windows battery API. The moment you unplug your charger, Eco Mode activates automatically.' },
        { num: '2', title: 'Power Saving Measures', desc: 'Freezes inactive mini widgets, disables heavy blur shaders, and relaxes animation cycles to keep your laptop cool and quiet.' },
        { num: '3', title: 'Per-Widget Custom Exclusions', desc: 'Want a specific widget to stay fully animated? You can customize or exempt individual widgets in the matrix below.' },
        { num: '🔋', tip: true, title: 'Operating Modes', desc: 'Select "Auto (Battery only)", "Always On" for older hardware, or "Off" for maximum visual fidelity.' },
      ] : [
        { num: '١', title: 'كيف يعمل الوضع التلقائي الذكي؟', desc: 'يراقب التطبيق موصل الشاحن عبر واجهة نظام Windows الرسمية. فور فصل الشاحن والعمل على البطارية، يتحول التطبيق تلقائياً لوضع توفير الطاقة.' },
        { num: '٢', title: 'ما هي الإجراءات التي يتم تفعيلها لحفظ الطاقة؟', desc: 'يتم تجميد الودجات المصغرة وغير المرئية، وإيقاف تأثيرات الشيدرز الضبابية العميقة (Heavy Blur)، وتقليل تردد تحديث الثواني، مما يخفض حرارة الجهاز واستهلاك المعالج.' },
        { num: '٣', title: 'جدول التحكم الفردي في الودجات', desc: 'إذا كنت تفضل بقاء ودجت معين بكامل رونقه وبلوره حتى أثناء العمل على البطارية، يمكنك الضغط عليه في جدول الودجات واستثنائه من التوفير.' },
        { num: '🔋', tip: true, title: 'خيارات التشغيل الدائم أو الإيقاف', desc: 'يمكنك اختيار "تلقائي مع البطارية"، أو "تفعيل دائم" للأجهزة الضعيفة، أو "إيقاف التوفير" لأقصى أداء بصري.' },
      ];

      renderGuideCards(steps);
    } else if (type === 'email') {
      titleEl.textContent = en() ? 'Email IMAP Setup & Security Guide' : 'دليل إعداد البريد وحل مشكلة المصادقة';
      subEl.textContent = en() ? 'App Passwords and secure IMAP connection' : 'شرح استخدام كلمات مرور التطبيقات (App Passwords)';

      const steps = en() ? [
        { num: '1', title: 'Why standard passwords fail?', desc: 'Modern providers (Gmail, Outlook, Yahoo) enforce 2-Step Verification and block direct account password logins on desktop IMAP clients.' },
        { num: '2', title: 'Generate an App Password (16 Letters)', desc: 'Go to your Google Account > Security > 2-Step Verification > App passwords. Create one for "Desktop Widgets" and copy the 16-letter code.' },
        { num: '3', title: 'Paste into Settings', desc: 'Enter your email address and paste the 16-letter App Password into the Password field, then click "Test Connection".' },
        { num: '⚡', tip: true, title: 'Spam & Rate Limiting Safety', desc: 'The app only fetches message headers on interval, preserving your battery and network. It connects directly via encrypted TLS 993.' },
      ] : [
        { num: '١', title: 'لماذا يفشل تسجيل الدخول بكلمة المرور العادية؟', desc: 'بسبب تفعيل التحقق بخطوتين (2-Step Verification)، تمنع أنظمة Google و Microsoft تسجيل الدخول بكلمة مرور الحساب الرئيسية في أي برنامج خارجي كإجراء وقائي.' },
        { num: '٢', title: 'الحل الرسمي: توليد "كلمة مرور التطبيقات" (App Password)', desc: 'افتح حساب Google > الأمان > التحقق بخطوتين > في الأسفل اختر "كلمات مرور التطبيقات" (App Passwords)، وأنشئ كلمة مرور جديدة مكونة من 16 حرفاً.' },
        { num: '٣', title: 'إدخال كلمة المرور واختبار الاتصال', desc: 'انسخ الـ 16 حرفاً وضعها في خانة كلمة المرور أدناه، ثم اضغط على زر "اختبار الاتصال". سيتصل البرنامج فورياً ويصبح جاهزاً لتلقي الرسائل.' },
        { num: '🛡️', tip: true, title: 'الأمان ومعدل الفحص وتفادي حظر البريد', desc: 'التطبيق متصل مباشرة بخادم IMAP الرسمي المشفر بتشفير TLS (المنفذ 993). لا يتم جلب سوى ترويسة الرسائل فقط، والفحص يتم بفواصل زمنية مدروسة مع دعم تقنية Push IDLE الفورية دون استنزاف المعالج أو التسبب في تصنيف الاتصال كـ Spam.' },
      ];

      renderGuideCards(steps);
    }

    modal.hidden = false;
  }

  document.querySelectorAll('.setup-help-btn').forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const guideType = btn.dataset.guide;
      if (guideType) openGuide(guideType);
    };
  });
}

function refreshControls() {
  markThemes();
  buildSwatches();
  $('#accentPick').value = s.accent;
  $('#accentHex').textContent = (s.accent || '').toUpperCase();
  buildGlass();
  $('#radius').value = String(s.radius ?? 22);
  $('#radiusOut').textContent = `${digits(s.radius ?? 22)}px`;
  buildFonts();
  buildFontCards();
  buildTypography();
  buildLook();
  buildEcoControls();
  buildInspiration();
  buildTodo();
  buildClassroom();
  buildSuperUrgentAndWhatsApp();
  buildInterval();
  $('#numerals').value = s.numerals || 'latn';
  buildTafsirPicker();
  buildTranslationPicker();
  syncWidgetRows();
  buildClock();
  buildCalendar();
  buildHabits();
  buildPomodoro();
  syncEmail();
  syncBrowserSetup();
  syncPhoto();
  buildPerWidgetStyles();
  buildFolderSettings();
  updateSummaryStatuses();
  syncAppearanceScopeUI();
}

boot(async (initial) => {
  s = initial;
  try { sources = await window.widgets.quran.sources(); } catch { sources = null; }
  try { catalog = await window.widgets.catalog(); } catch { catalog = {}; }
  wire();
  buildTafsirPicker();
  buildTranslationPicker();
  buildSources();
  const section = new URLSearchParams(location.search).get('section');
  if (section) setTimeout(() => jumpTo(section), 350);
});
