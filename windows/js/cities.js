'use strict';
/* Cities offered for the world clocks. Times come from the IANA time-zone
   database built into the system (via Intl), so daylight saving is handled
   for every city without any table of offsets here. */
window.CITIES = [
  ['Africa/Cairo', 'القاهرة', 'Cairo'],
  ['Asia/Riyadh', 'مكة المكرمة', 'Makkah'],
  ['Asia/Dubai', 'دبي', 'Dubai'],
  ['Asia/Kuwait', 'الكويت', 'Kuwait'],
  ['Asia/Qatar', 'الدوحة', 'Doha'],
  ['Asia/Amman', 'عمّان', 'Amman'],
  ['Asia/Beirut', 'بيروت', 'Beirut'],
  ['Africa/Casablanca', 'الدار البيضاء', 'Casablanca'],
  ['Africa/Tunis', 'تونس', 'Tunis'],
  ['Africa/Khartoum', 'الخرطوم', 'Khartoum'],
  ['Europe/Istanbul', 'إسطنبول', 'Istanbul'],
  ['Europe/London', 'لندن', 'London'],
  ['Europe/Paris', 'باريس', 'Paris'],
  ['Europe/Berlin', 'برلين', 'Berlin'],
  ['America/New_York', 'نيويورك', 'New York'],
  ['America/Toronto', 'تورونتو', 'Toronto'],
  ['America/Chicago', 'شيكاغو', 'Chicago'],
  ['America/Los_Angeles', 'لوس أنجلوس', 'Los Angeles'],
  ['Asia/Karachi', 'كراتشي', 'Karachi'],
  ['Asia/Kolkata', 'نيودلهي', 'New Delhi'],
  ['Asia/Kuala_Lumpur', 'كوالالمبور', 'Kuala Lumpur'],
  ['Asia/Jakarta', 'جاكرتا', 'Jakarta'],
  ['Asia/Shanghai', 'بكين', 'Beijing'],
  ['Asia/Tokyo', 'طوكيو', 'Tokyo'],
  ['Australia/Sydney', 'سيدني', 'Sydney'],
  ['Australia/Melbourne', 'ملبورن', 'Melbourne'],
];

window.cityName = (zone) => {
  const en = window.UI && window.UI.lang && window.UI.lang() === 'en';
  const hit = window.CITIES.find(([z]) => z === zone);
  if (hit) return en ? hit[2] : hit[1];
  return zone.split('/').pop().replace(/_/g, ' ');
};
