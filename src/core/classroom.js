'use strict';

/**
 * Google Classroom Engine for Mirqat Widgets
 * - OAuth 2.0 loopback flow & token refresh
 * - Courses & CourseWork fetching
 * - StudentSubmissions state checking
 * - Strict completion guard (cannot mark done unless TURNED_IN)
 * - iCal calendar feed parser fallback
 */

const http = require('http');
const https = require('https');
const { URL, URLSearchParams } = require('url');

const DEFAULT_REDIRECT_PORT = 38291;
const REDIRECT_URI = `http://127.0.0.1:${DEFAULT_REDIRECT_PORT}/callback`;

const SCOPES = [
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
  'https://www.googleapis.com/auth/classroom.student-submissions.me.readonly',
  'https://www.googleapis.com/auth/classroom.profile.emails',
  'https://www.googleapis.com/auth/userinfo.email',
];

/**
 * Checks whether a given courseId or courseName is hidden by the user
 * @param {string} [courseId]
 * @param {string} [courseName]
 * @param {Array<string>} [hiddenCourses]
 * @returns {boolean}
 */
function isCourseHidden(courseId, courseName, hiddenCourses) {
  if (!hiddenCourses || !hiddenCourses.length) return false;
  if (hiddenCourses.includes(courseId) || hiddenCourses.includes(courseName)) return true;
  const cId = String(courseId || '').toLowerCase().trim();
  const cName = String(courseName || '').toLowerCase().trim();

  for (const raw of hiddenCourses) {
    const h = String(raw || '').toLowerCase().trim();
    if (!h) continue;
    if (cId && (cId === h || cId.includes(h) || h.includes(cId))) return true;
    if (cName && (cName === h || cName.includes(h) || h.includes(cName))) return true;
  }
  return false;
}

/**
 * Checks whether a task belongs to a hidden classroom course
 * @param {Object} task
 * @param {Array<string>} [hiddenCourses]
 * @returns {boolean}
 */
function isTaskCourseHidden(task, hiddenCourses) {
  if (!hiddenCourses || !hiddenCourses.length || !task) return false;
  if (task.classroom) {
    if (isCourseHidden(task.classroom.courseId, task.classroom.courseName, hiddenCourses)) {
      return true;
    }
  }
  // Also check [Course Name] prefix in task.text
  if (task.text && typeof task.text === 'string') {
    const m = task.text.match(/^\[(.*?)\]/);
    if (m && m[1]) {
      if (isCourseHidden(null, m[1], hiddenCourses)) return true;
    }
    const isCrTask = Boolean(task.classroom || (task.id && (String(task.id).startsWith('cr_') || String(task.id).startsWith('ical_'))));
    if (isCrTask) {
      const lower = task.text.toLowerCase();
      for (const raw of hiddenCourses) {
        const h = String(raw || '').toLowerCase().trim();
        if (h && lower.includes(h)) return true;
      }
    }
  }
  return false;
}

/**
 * Make an HTTPS JSON request
 */
function requestJson(url, options = {}, postData = null) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(url);
      const req = https.request(parsed, {
        method: options.method || 'GET',
        headers: options.headers || {},
        timeout: options.timeout || 15000,
      }, (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (c) => { body += c; });
        res.on('end', () => {
          try {
            const json = body ? JSON.parse(body) : {};
            resolve({
              ok: res.statusCode >= 200 && res.statusCode < 300,
              status: res.statusCode,
              data: json,
              raw: body,
            });
          } catch {
            resolve({
              ok: res.statusCode >= 200 && res.statusCode < 300,
              status: res.statusCode,
              data: null,
              raw: body,
            });
          }
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ ok: false, status: 408, error: 'انتهت مهلة الاتصال بخوادم Google' });
      });

      req.on('error', (err) => {
        resolve({ ok: false, status: 0, error: err.message });
      });

      if (postData) {
        req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
      }
      req.end();
    } catch (e) {
      resolve({ ok: false, status: 0, error: e.message });
    }
  });
}

/**
 * Calculate unix timestamp from Google Classroom UTC dueDate & dueTime
 * @param {Object} dueDate - { year, month, day }
 * @param {Object} [dueTime] - { hours, minutes }
 * @returns {number|null}
 */
function parseClassroomDeadline(dueDate, dueTime) {
  if (!dueDate || !dueDate.year || !dueDate.month || !dueDate.day) return null;
  const hours = dueTime?.hours ?? 23;
  const minutes = dueTime?.minutes ?? 59;
  return Date.UTC(dueDate.year, dueDate.month - 1, dueDate.day, hours, minutes, 0);
}

/**
 * Format local date YYYY-MM-DD from timestamp
 * @param {number} ts
 * @returns {string}
 */
function toLocalDateString(ts) {
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Simple iCal / ICS feed parser for Google Classroom calendar export
 */
function parseIcsFeed(icsText) {
  const events = [];
  const lines = icsText.replace(/\r\n /g, '').split(/\r?\n/);
  let current = null;

  for (const line of lines) {
    if (line.startsWith('BEGIN:VEVENT')) {
      current = {};
    } else if (line.startsWith('END:VEVENT')) {
      if (current && current.summary && current.dtend) {
        events.push(current);
      }
      current = null;
    } else if (current) {
      const idx = line.indexOf(':');
      if (idx !== -1) {
        const key = line.slice(0, idx).split(';')[0].toUpperCase();
        const val = line.slice(idx + 1).trim();
        if (key === 'SUMMARY') current.summary = val;
        else if (key === 'DESCRIPTION') current.description = val.replace(/\\n/g, '\n').replace(/\\,/g, ',');
        else if (key === 'URL') current.url = val;
        else if (key === 'DTEND' || key === 'DTSTART') {
          // Parse YYYYMMDDTHHMMSSZ or YYYYMMDDTHHMMSS or YYYYMMDD
          let dt = null;
          const mUtc = val.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
          const mLocal = val.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/);
          const mDate = val.match(/^(\d{4})(\d{2})(\d{2})$/);
          if (mUtc) {
            dt = Date.UTC(+mUtc[1], +mUtc[2] - 1, +mUtc[3], +mUtc[4], +mUtc[5], +mUtc[6]);
          } else if (mLocal) {
            dt = new Date(+mLocal[1], +mLocal[2] - 1, +mLocal[3], +mLocal[4], +mLocal[5], +mLocal[6]).getTime();
          } else if (mDate) {
            dt = new Date(+mDate[1], +mDate[2] - 1, +mDate[3], 23, 59, 59).getTime();
          }
          if (dt) {
            if (key === 'DTEND') current.dtend = dt;
            else if (!current.dtend) current.dtend = dt;
          }
        }
      }
    }
  }
  return events;
}

class ClassroomEngine {
  constructor(getSettings, setSettings) {
    this.getSettings = getSettings || (() => ({}));
    this.setSettings = setSettings || (() => {});
    this._authServer = null;
  }

  config() {
    return this.getSettings().classroom || {};
  }

  /**
   * Mark a task as explicitly dismissed/deleted by user so sync does not resurrect it
   */
  markTaskDismissed(taskId, workId) {
    const cfg = this.config();
    const list = Array.isArray(cfg.dismissedTaskIds) ? [...cfg.dismissedTaskIds] : [];
    if (taskId && !list.includes(String(taskId))) list.push(String(taskId));
    if (workId && !list.includes(String(workId))) list.push(String(workId));
    this.setSettings({
      ...this.getSettings(),
      classroom: {
        ...cfg,
        dismissedTaskIds: list,
      },
    });
  }

  /**
   * Generate Google OAuth 2.0 Authorization URL
   */
  getAuthUrl(clientId) {
    const id = clientId || this.config().clientId;
    if (!id) throw new Error('يرجى إدخال Client ID أولاً في الإعدادات');

    const params = new URLSearchParams({
      client_id: id,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: SCOPES.join(' '),
      access_type: 'offline',
      prompt: 'consent',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Start local loopback server to receive OAuth code
   * @returns {Promise<{ code: string }>}
   */
  startOAuthListener() {
    return new Promise((resolve, reject) => {
      if (this._authServer) {
        try { this._authServer.close(); } catch {}
      }

      const server = http.createServer((req, res) => {
        try {
          const reqUrl = new URL(req.url, `http://127.0.0.1:${DEFAULT_REDIRECT_PORT}`);
          if (reqUrl.pathname === '/callback') {
            const code = reqUrl.searchParams.get('code');
            const error = reqUrl.searchParams.get('error');

            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            if (code) {
              res.end(`
                <!DOCTYPE html>
                <html dir="rtl" lang="ar">
                <head><meta charset="utf-8"><title>نجاح الاتصال</title>
                <style>
                  body { font-family: system-ui, sans-serif; background: #0b1320; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                  .card { background: rgba(255,255,255,0.08); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.2); padding: 40px; border-radius: 20px; text-align: center; max-width: 450px; }
                  h1 { color: #10b981; font-size: 24px; margin-bottom: 12px; }
                  p { color: rgba(255,255,255,0.8); line-height: 1.6; font-size: 15px; }
                </style>
                </head>
                <body>
                  <div class="card">
                    <h1>✅ تم ربط Google Classroom بنجاح!</h1>
                    <p>تم استلام التخويل الرسمي من Google بنجاح. يمكنك الآن إغلاق هذه الصفحة والعودة إلى ويدجت سطح المكتب.</p>
                  </div>
                </body>
                </html>
              `);
              server.close();
              this._authServer = null;
              resolve({ code });
            } else {
              res.end(`<h1>تعذر تسجيل الدخول: ${error || 'خطأ غير معروف'}</h1>`);
              server.close();
              this._authServer = null;
              reject(new Error(error || 'لم يتم استلام كود التخويل'));
            }
          }
        } catch (e) {
          server.close();
          this._authServer = null;
          reject(e);
        }
      });

      server.on('error', (err) => {
        this._authServer = null;
        reject(err);
      });

      server.listen(DEFAULT_REDIRECT_PORT, '127.0.0.1', () => {
        this._authServer = server;
      });

      // Auto-timeout after 3 minutes
      setTimeout(() => {
        if (this._authServer) {
          try { this._authServer.close(); } catch {}
          this._authServer = null;
          reject(new Error('انتهت مهلة تسجيل الدخول (3 دقائق)'));
        }
      }, 180000);
    });
  }

  /**
   * Exchange OAuth code for access & refresh tokens
   */
  async exchangeCode(code, clientId, clientSecret) {
    const id = clientId || this.config().clientId;
    const sec = clientSecret || this.config().clientSecret;
    if (!id || !sec) throw new Error('يرجى تحديد Client ID و Client Secret');

    const body = new URLSearchParams({
      code,
      client_id: id,
      client_secret: sec,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }).toString();

    const res = await requestJson('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }, body);

    if (!res.ok) {
      throw new Error(res.data?.error_description || res.data?.error || `فشل استبدال الكود: ${res.status}`);
    }

    const { access_token, refresh_token, expires_in } = res.data;
    const expiryDate = Date.now() + (expires_in || 3600) * 1000 - 60000;

    let userEmail = this.config().userEmail || '';
    try {
      const prof = await requestJson('https://classroom.googleapis.com/v1/userProfiles/me', {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      if (prof.ok && prof.data?.emailAddress) {
        userEmail = prof.data.emailAddress;
      }
    } catch { /* ignore */ }

    await this.setSettings({
      classroom: {
        ...this.config(),
        enabled: true,
        clientId: id,
        clientSecret: sec,
        userEmail,
        authError: false,
        authStatus: 'connected',
        authErrorMsg: null,
        accessToken: access_token,
        ...(refresh_token ? { refreshToken: refresh_token } : (this.config().refreshToken ? { refreshToken: this.config().refreshToken } : {})),
        expiryDate,
      },
    });

    return { access_token, refresh_token: refresh_token || this.config().refreshToken, expiryDate, userEmail };
  }

  /**
   * Ensure fresh access token
   */
  async getValidToken() {
    const cfg = this.config();
    if (!cfg.accessToken && !cfg.refreshToken) {
      throw new Error('لم يتم ربط حساب Google Classroom بعد');
    }

    if (cfg.accessToken && cfg.expiryDate && Date.now() < cfg.expiryDate) {
      return cfg.accessToken;
    }

    if (!cfg.refreshToken) {
      if (cfg.accessToken) return cfg.accessToken;
      throw new Error('انتهت صلاحية الجلسة، يرجى إعادة تسجيل الدخول');
    }

    // Refresh token
    const body = new URLSearchParams({
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      refresh_token: cfg.refreshToken,
      grant_type: 'refresh_token',
    }).toString();

    const res = await requestJson('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }, body);

    if (!res.ok) {
      await this.setSettings({
        classroom: {
          ...this.config(),
          authError: true,
          authStatus: 'disconnected',
          authErrorMsg: res.data?.error_description || 'انتهت صلاحية جلسة Google Classroom أو تم سحب الإذن',
        },
      });
      throw new Error(`فشل تحديث التوكن: ${res.data?.error_description || res.status}`);
    }

    const { access_token, expires_in } = res.data;
    const expiryDate = Date.now() + (expires_in || 3600) * 1000 - 60000;

    await this.setSettings({
      classroom: {
        ...this.config(),
        accessToken: access_token,
        expiryDate,
        authError: false,
        authStatus: 'connected',
      },
    });

    return access_token;
  }

  /**
   * Fetch active enrolled courses
   */
  async getCourses() {
    const token = await this.getValidToken();
    const url = 'https://classroom.googleapis.com/v1/courses?studentId=me&courseStates=ACTIVE';
    const res = await requestJson(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error(res.data?.error?.message || `فشل جلب المواد: ${res.status}`);
    return res.data?.courses || [];
  }

  /**
   * Fetch coursework for a course
   */
  async getCourseWork(courseId) {
    const token = await this.getValidToken();
    const url = `https://classroom.googleapis.com/v1/courses/${encodeURIComponent(courseId)}/courseWork?courseWorkStates=PUBLISHED`;
    const res = await requestJson(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error(res.data?.error?.message || `فشل جلب التكليفات: ${res.status}`);
    return res.data?.courseWork || [];
  }

  /**
   * Fetch student submission for a coursework
   */
  async getSubmission(courseId, courseWorkId) {
    try {
      const token = await this.getValidToken();
      const url = `https://classroom.googleapis.com/v1/courses/${encodeURIComponent(courseId)}/courseWork/${encodeURIComponent(courseWorkId)}/studentSubmissions?userId=me`;
      const res = await requestJson(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        return null;
      }
      const list = res.data?.studentSubmissions || [];
      if (!list.length) return null;
      // Prefer turned in, returned, or graded submission if multiple exist
      const submitted = list.find((s) => s.state === 'TURNED_IN' || s.state === 'RETURNED' || s.assignedGrade !== undefined || s.draftGrade !== undefined);
      return submitted || list[0] || null;
    } catch {
      return null;
    }
  }

  /**
   * Fetch iCal feed as fallback
   */
  async fetchIcalAssignments(url) {
    if (!url) return [];
    const res = await requestJson(url);
    if (!res.ok || !res.raw) return [];
    const events = parseIcsFeed(res.raw);
    return events.map((ev, idx) => ({
      id: `ical_${idx}_${ev.dtend}`,
      title: ev.summary,
      description: ev.description || '',
      alternateLink: ev.url || '',
      deadline: ev.dtend,
    }));
  }

  /**
   * Full Sync: fetch Classroom assignments and merge into todos items
   * @param {Array} existingTodos - Current items array
   * @returns {Promise<{ items: Array, added: number, updated: number }>}
   */
  async sync(existingTodos = []) {
    const cfg = this.config();
    if (!cfg.enabled) {
      return { items: existingTodos, added: 0, updated: 0, skipped: true, reason: 'disabled' };
    }

    const filterEnabled = cfg.filterHiddenCourses !== false;
    const hiddenCourses = filterEnabled ? (cfg.hiddenCourses || []).map((id) => String(id).toLowerCase().trim()) : [];
    let items = existingTodos.filter((t) => !isTaskCourseHidden(t, hiddenCourses));
    let added = 0;
    let updated = (existingTodos.length !== items.length) ? 1 : 0;

    // Check if OAuth is configured
    if (cfg.accessToken || cfg.refreshToken) {
      try {
        const courses = await this.getCourses();
        const activeCoursesSeen = new Set();
        const activeWorkIdsByCourse = new Map();

        for (const course of courses) {
          if (isCourseHidden(course.id, course.name, hiddenCourses)) {
            continue; // Exclude hidden courses completely
          }
          activeCoursesSeen.add(course.id);
          const worksSet = new Set();
          activeWorkIdsByCourse.set(course.id, worksSet);

          const works = await this.getCourseWork(course.id);
          const dismissedSet = new Set((cfg.dismissedTaskIds || []).map((x) => String(x)));
          for (const work of works) {
            worksSet.add(work.id);

            const taskId = `cr_${course.id}_${work.id}`;
            if (dismissedSet.has(taskId) || (work.id && dismissedSet.has(String(work.id)))) {
              continue; // Task was deleted by the user - do not resurrect it!
            }

            // Check deadline
            const deadline = parseClassroomDeadline(work.dueDate, work.dueTime);

            // Check submission
            const submission = await this.getSubmission(course.id, work.id);
            const state = submission?.state || 'NEW';
            const isTurnedIn = state === 'TURNED_IN' || state === 'RETURNED' || submission?.assignedGrade !== undefined || submission?.draftGrade !== undefined;
            const existingIdx = items.findIndex((t) => t.id === taskId || (t.classroom?.courseId === course.id && t.classroom?.courseWorkId === work.id));

            // If dueTime was 23:59 (Classroom's default end-of-day), preserve work.dueDate as localDate
            // so timezone offsets don't shift the assignment to the next calendar day!
            const isDefaultEndOfDay = work.dueTime?.hours === 23 && (work.dueTime?.minutes === 59 || work.dueTime?.minutes === undefined);
            let localDate = deadline ? toLocalDateString(deadline) : null;
            if (isDefaultEndOfDay && work.dueDate && work.dueDate.year && work.dueDate.month && work.dueDate.day) {
              const pad = (n) => String(n).padStart(2, '0');
              localDate = `${work.dueDate.year}-${pad(work.dueDate.month)}-${pad(work.dueDate.day)}`;
            }

            // Dynamic priority: tasks due within 7 days (this week) are Urgent (2), later tasks are Important (1)
            const diffMs = deadline ? (deadline - Date.now()) : Infinity;
            const isDueThisWeek = diffMs <= 7 * 24 * 3600000;
            const taskPriority = isDueThisWeek ? 2 : 1;

            const classroomMeta = {
              courseId: course.id,
              courseName: course.name,
              courseWorkId: work.id,
              alternateLink: work.alternateLink || submission?.alternateLink || `https://classroom.google.com/c/${course.id}/a/${work.id}/details`,
              state,
              submissionId: submission?.id || null,
              assignedGrade: submission?.assignedGrade ?? null,
              draftGrade: submission?.draftGrade ?? null,
              dueDate: work.dueDate || null,
              dueTime: work.dueTime || null,
              hasExplicitTime: Boolean(work.dueTime && (work.dueTime.hours !== undefined || work.dueTime.minutes !== undefined)),
              deadlineTimestamp: deadline,
            };

            // Smart reminders before deadline (24h, 3h, 1h, 15m)
            const reminders = deadline ? [
              { at: deadline - 24 * 3600000, id: `r24_${work.id}` },
              { at: deadline - 3 * 3600000, id: `r3_${work.id}` },
              { at: deadline - 1 * 3600000, id: `r1_${work.id}` },
              { at: deadline - 15 * 60000, id: `r15m_${work.id}` },
            ].filter((r) => r.at > Date.now()).map((r) => ({ ...r, fired: false })) : [];

            if (existingIdx !== -1) {
              const existing = items[existingIdx];
              let modified = false;

              // 1. Synchronize turn-in state (never overwrite user's manual completion unless explicitly reclaimed)
              if (isTurnedIn && !existing.done) {
                existing.done = true;
                existing.doneAt = Date.now();
                modified = true;
              } else if (!isTurnedIn && existing.done) {
                if (state === 'RECLAIMED_BY_STUDENT' && !existing.doneManually) {
                  existing.done = false;
                  existing.doneAt = null;
                  modified = true;
                }
              }

              // 2. Synchronize postponed or modified deadline
              const oldDeadline = existing.classroom?.deadlineTimestamp || null;
              if (oldDeadline !== deadline || existing.due !== localDate) {
                existing.due = localDate;
                existing.priority = taskPriority;
                existing.reminders = reminders;
                modified = true;
              }

              // 3. Synchronize updated title or instructions
              const expectedText = `[${course.name}] ${work.title}`;
              if (work.title && existing.text !== expectedText) {
                existing.text = expectedText;
                modified = true;
              }
              const expectedNotes = work.description
                ? `${work.description}\n\n🔗 ${classroomMeta.alternateLink}`
                : `🔗 ${classroomMeta.alternateLink}`;
              if (existing.notes !== expectedNotes) {
                existing.notes = expectedNotes;
                modified = true;
              }

              // Update metadata & dynamic priority
              existing.classroom = classroomMeta;
              if (modified) updated++;
            } else {
              items.unshift({
                id: taskId,
                text: `[${course.name}] ${work.title}`,
                notes: work.description ? `${work.description}\n\n🔗 ${classroomMeta.alternateLink}` : `🔗 ${classroomMeta.alternateLink}`,
                done: isTurnedIn,
                doneAt: isTurnedIn ? Date.now() : null,
                createdAt: Date.now(),
                priority: taskPriority,
                due: localDate,
                classroom: classroomMeta,
                reminders,
              });
              added++;
            }
          }
        }

        // 4. Remove assignments that were deleted or cancelled in Classroom
        let deleted = 0;
        const remainingItems = items.filter((t) => {
          if (!t.classroom || !t.classroom.courseId || !t.classroom.courseWorkId) return true;
          if (!activeCoursesSeen.has(t.classroom.courseId)) return true;
          const worksSet = activeWorkIdsByCourse.get(t.classroom.courseId);
          if (worksSet && !worksSet.has(t.classroom.courseWorkId)) {
            deleted++;
            return false;
          }
          return true;
        });
        items = remainingItems;

        return { items, added, updated, deleted, ok: true };
      } catch (err) {
        await this.setSettings({
          classroom: {
            ...this.config(),
            authError: true,
            authStatus: 'disconnected',
            authErrorMsg: err.message || 'تعذر الاتصال بخوادم Google Classroom أو انتهت صلاحية الجلسة',
          },
        });
        // If OAuth fails and iCal url is present, fall back to iCal
        if (cfg.iCalUrl) {
          return this.syncIcal(items, cfg.iCalUrl);
        }
        throw err;
      }
    } else if (cfg.iCalUrl) {
      return this.syncIcal(items, cfg.iCalUrl);
    }

    return { items, added: 0, updated: 0, ok: false, error: 'لم يتم إعداد بيانات الاتصال بـ Classroom' };
  }

  /**
   * Sync using iCal feed fallback
   */
  async syncIcal(items, iCalUrl) {
    let added = 0;
    const cfg = this.config();
    const filterEnabled = cfg.filterHiddenCourses !== false;
    const hiddenCourses = filterEnabled ? (cfg.hiddenCourses || []) : [];
    // Purge any hidden courses already present in items
    for (let i = items.length - 1; i >= 0; i--) {
      if (isTaskCourseHidden(items[i], hiddenCourses)) {
        items.splice(i, 1);
      }
    }
    const assignments = await this.fetchIcalAssignments(iCalUrl);
    for (const a of assignments) {
      if (!a.deadline) continue;
      if (isCourseHidden(null, a.title, hiddenCourses)) continue;
      const taskId = `ical_${a.title.slice(0, 30).replace(/\s+/g, '_')}`;
      const exists = items.some((t) => t.id === taskId || t.text === a.title);
      if (!exists) {
        const localDate = toLocalDateString(a.deadline);
        items.unshift({
          id: taskId,
          text: a.title,
          notes: `${a.description}\n\n🔗 ${a.alternateLink}`,
          done: false,
          doneAt: null,
          createdAt: Date.now(),
          priority: 2,
          due: localDate,
          classroom: {
            alternateLink: a.alternateLink,
            deadlineTimestamp: a.deadline,
            courseName: 'Classroom Calendar',
            state: 'NEW',
          },
          reminders: [
            { at: a.deadline - 3 * 3600000, id: `r3_${taskId}`, fired: false },
            { at: a.deadline - 1 * 3600000, id: `r1_${taskId}`, fired: false },
          ].filter((r) => r.at > Date.now()),
        });
        added++;
      }
    }
    return { items, added, updated: 0, ok: true, source: 'ical' };
  }

  /**
   * Fetch active enrolled courses list
   * @returns {Promise<{ ok: boolean, courses?: Array, error?: string }>}
   */
  async getCoursesList() {
    const cfg = this.config();
    if (!cfg.enabled || (!cfg.accessToken && !cfg.refreshToken)) {
      return { ok: false, error: 'not_connected', courses: [] };
    }
    try {
      const courses = await this.getCourses();
      return {
        ok: true,
        courses: courses.map((c) => ({
          id: c.id,
          name: c.name,
          section: c.section || '',
        })),
      };
    } catch (err) {
      return { ok: false, error: err.message, courses: [] };
    }
  }

  /**
   * Strict completion guard: checks if user is allowed to mark task as done
   * @param {Object} task
   * @returns {{ allowed: boolean, reason?: string, alternateLink?: string }}
   */
  canMarkDone(task) {
    if (!task || !task.classroom) {
      return { allowed: true };
    }

    if (task.doneManually || task.done) {
      return { allowed: true };
    }

    const state = task.classroom.state;
    const isSubmitted = state === 'TURNED_IN' || state === 'RETURNED' || task.classroom.assignedGrade !== undefined || task.classroom.draftGrade !== undefined;

    if (isSubmitted) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: 'لم يتم تسليم التكليف على Google Classroom بعد! يرجى تسليمه أولاً على الموقع الرسمي ليتم اعتباره منجزاً.',
      alternateLink: task.classroom.alternateLink,
      state,
      courseName: task.classroom.courseName,
    };
  }
}

/**
 * Builds Google Classroom URL selecting the linked user account
 * @param {string} rawUrl
 * @param {string} userEmail
 * @returns {string}
 */
function buildClassroomUrl(rawUrl, userEmail) {
  if (!rawUrl) return '';
  if (userEmail && typeof rawUrl === 'string' && rawUrl.startsWith('https://classroom.google.com')) {
    return `https://accounts.google.com/AccountChooser?Email=${encodeURIComponent(userEmail)}&continue=${encodeURIComponent(rawUrl)}`;
  }
  return rawUrl;
}

module.exports = {
  ClassroomEngine,
  parseClassroomDeadline,
  toLocalDateString,
  parseIcsFeed,
  buildClassroomUrl,
  isCourseHidden,
  isTaskCourseHidden,
  SCOPES,
  DEFAULT_REDIRECT_PORT,
};
