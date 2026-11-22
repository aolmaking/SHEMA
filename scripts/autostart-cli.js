'use strict';
/**
 * Turn "start with Windows" on or off without opening the app.
 *   npm run autostart:on
 *   npm run autostart:off
 */

const autostart = require('../src/core/autostart');

const arg = (process.argv[2] || 'status').toLowerCase();

try {
  if (arg === 'on') {
    autostart.enable();
    console.log('سيبدأ التطبيق مع تشغيل الجهاز.');
  } else if (arg === 'off') {
    autostart.disable();
    console.log('لن يبدأ التطبيق مع تشغيل الجهاز.');
  }
  console.log(`الحالة: ${autostart.isEnabled() ? 'مُفعَّل' : 'مُعطَّل'}`);
  console.log(`الملف : ${autostart.launcherPath()}`);
} catch (err) {
  console.error('تعذّر تغيير الإعداد:', err.message);
  process.exit(1);
}
