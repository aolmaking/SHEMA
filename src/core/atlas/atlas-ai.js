'use strict';

/**
 * The Living Atlas (أطلس العوالم الحيّة)
 * AI Storyteller & Miro Companion Engine · Version 1.0
 * 
 * Orchestrates:
 * - Sovereign Gemini API Integration (Local-First, Zero Cloud Leakage)
 * - Strict White-Hat Gamification & Non-Punitive Narrative Guardrails
 * - Grounded, Natural, Authentic Arabic Language (Strictly NO "الأثير" / "Aether")
 * - Distilled Living Atlas World Bible, Game Systems, & Narrative Architecture
 */

const https = require('https');

// ============================================================================
// 1. THE LIVING ATLAS WORLD BIBLE & SYSTEM INSTRUCTIONS (THE COMPANION PROMPT)
// ============================================================================

const ATLAS_AI_SYSTEM_PROMPT = `
أنت "ميرو" (Miro)؛ الرفيق الحي وحارس صفحات "أطلس العوالم الحيّة" (The Living Atlas) في نظام مرقاة.
أنت طائر الحبر والنجوم؛ كائن لطيف وودود يتشكل من حبر الأطلس الأثري ونور النجوم الساطعة. لست تطبيقاً تجارياً، ولست ذكاءً اصطناعياً جافاً، ولست حيواناً أليفاً افتراضياً يُعاقب بالمرض أو الموت عند الغياب، بل أنت شريك رحلة صادق، وموثق تأملي (Reflective Partner)، ومرآة للفضول الذاتي.

================================================================================
الميثاق التأسيسي والقواعد الأخلاقية الصارمة (Foundational Charter & Trust):
================================================================================
1. [التحفيز الأبيض غير العقابي - Pure White-Hat]:
   - يُمنع منعاً باتاً لوم المستخدم، أو إشعاره بالذنب، أو استخدام صيغ التوبيخ عند انقطاعه أو تعثره في عاداته.
   - لا تقل قط عبارات مثل: "أين كنت وتركتني؟" أو "لقد خذلت مساراتك!" أو "عادتك ضعيفة!".
   - إذا عاد المستخدم بعد أيام أو أسابيع من الغياب، استقبله بدفء وترحاب وابتسامة:
     "أهلاً بعودتك يا رفيقي. ما زالت صفحات الأطلس تحتفظ بكل خطوة صادقة سجلتها من قبل. هل تحب أن نستأنف ما بدأناه، أم نبدأ بخطوة يسيرة تناسب يومك الآن؟"

2. [احترام الحقيقة وعدم الاختلاق - Event Integrity & Anti-Hallucination]:
   - لا تختلق عادات أو إنجازات أو أرقاماً لم يسجلها المستخدم فعلياً في بياناته.
   - استند دائماً وحصراً إلى بيانات العادات المسجلة (Habits Data) المرسلة إليك.
   - التعثر أو الانقطاع يُفسر كإجهاد أو ظروف سياقية أو احتكاك يحتاج للتفكيك بخطوات مصغرة (Micro-Steps / قاعدة الدقيقتين)، وليس كفشل شخصي.

3. [اللغة والأسلوب الصارم - Pure & Natural Arabic Tone]:
   - تحدث بلغة عربية فصيحة، عذبة، طبيعية، وقريبة من القلب، بعيدة عن الركاكة أو التعقيد المصطنع.
   - ⚠️ تحذير قاطع: يُحظر تماماً استخدام ألفاظ الفانتازيا المبتذلة أو المصطلحات الغريبة والمملة مثل كلمة "الأثير" أو "أحجار الأثير" أو "عالم الأثير".
   - استخدم بدلاً منها مصطلحات العالم المعتمدة:
     * "بلورات الطاقة" أو "أحجار النور" (Light / Energy Crystals) بدلاً من الأثير.
     * "ذهب الملاذ" (Haven Gold) للمكافآت الحقيقية.
     * "بذور النور" أو "نبتة السكينة" (Seeds of Light) لحديقة الاستشفاء والراحة.
     * "قصاصات المخطوطات" (Manuscript Pages) لتوثيق الخرائط والمعرفة.
     * "الملاذ الأول" (First Haven) للمقر الآمن للمستكشف.
     * "النسيج الحي" (The Living Weave) لشبكة العادات والمسارات الحياتية.
     * "المجالات الأربعة": الحيوية (VIT - الرياضة والصحة)، الحكمة (WIS - القراءة والتعلم)، السكينة (SER - النوم والتأمل)، الانضباط (DIS - العمل العميق والصبر).

4. [الهدف الأسمى]:
   - غايتك ليست جعل المستخدم يدمن الشاشات، بل مساعدته على إعمار حياته الحقيقية بخطوات يسيرة مستدامة.
`.trim();

// ============================================================================
// 2. GEMINI API CLIENT (LOCAL-FIRST & SECURE HTTPS)
// ============================================================================

/**
 * Sends a payload to Google Gemini API over native HTTPS.
 * Ensures zero intermediate cloud servers or analytics tracking.
 */
function callGeminiApi({ apiKey, model = 'gemini-1.5-flash', contents, systemInstruction = null, generationConfig = {} }) {
  return new Promise((resolve, reject) => {
    if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
      return reject(new Error('مفتاح Google Gemini API غير متوفر أو فارغ.'));
    }

    const cleanKey = apiKey.trim();
    const cleanModel = model.trim() || 'gemini-1.5-flash';
    const postData = JSON.stringify({
      contents: Array.isArray(contents) ? contents : [{ role: 'user', parts: [{ text: String(contents) }] }],
      ...(systemInstruction ? {
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        }
      } : {}),
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 600,
        ...generationConfig
      }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1beta/models/${cleanModel}:generateContent?key=${cleanKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 18000
    };

    const req = https.request(options, (res) => {
      let rawData = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(rawData);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const candidate = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (candidate) {
              return resolve({ ok: true, text: candidate.trim(), raw: parsed });
            }
            return resolve({ ok: true, text: '', raw: parsed });
          }

          // Error handling from Gemini API
          const errMsg = parsed.error?.message || `HTTP ${res.statusCode}: فشل طلب الاتصال بمكتبة Gemini.`;
          return reject(new Error(errMsg));
        } catch (e) {
          return reject(new Error(`خطأ في تحليل استجابة النموذج: ${e.message}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(new Error(`تعذر الاتصال بخوادم Google Gemini: ${err.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('انتهت مهلة انتظار استجابة النموذج (Timeout بعد 18 ثانية).'));
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Fast ping test to verify that the API Key and model are functioning properly.
 */
async function testGeminiConnection({ apiKey, model = 'gemini-1.5-flash' } = {}) {
  try {
    const testResult = await callGeminiApi({
      apiKey,
      model,
      contents: [
        {
          role: 'user',
          parts: [{ text: 'مرحباً، أجب في كلمتين فقط للتأكد من الاتصال: "تم الاتصال بنجاح".' }]
        }
      ],
      generationConfig: {
        maxOutputTokens: 25,
        temperature: 0.1
      }
    });

    return {
      ok: true,
      message: `تم الاتصال بنجاح بميرو ونموذج ${model}! الاستجابة: "${testResult.text}"`
    };
  } catch (err) {
    let friendlyError = err.message;
    if (err.message.includes('API_KEY_INVALID') || err.message.includes('400')) {
      friendlyError = 'مفتاح API غير صالح أو غير معتمد. يرجى التأكد من نسخه بدقة من Google AI Studio.';
    } else if (err.message.includes('403') || err.message.includes('PERMISSION_DENIED')) {
      friendlyError = 'تم رفض الإذن (Permission Denied). تأكد من تفعيل Gemini API في مشروعك.';
    } else if (err.message.includes('NOT_FOUND') || err.message.includes('404')) {
      friendlyError = `النموذج المحدد (${model}) غير متاح لحسابك. جرب اختيار gemini-1.5-flash.`;
    }
    return {
      ok: false,
      error: friendlyError
    };
  }
}

/**
 * Generates an empathetic, reflective Miro whisper based on today's habit completions and current wayfinder status.
 */
async function generateMiroCompanionReflection({ apiKey, model = 'gemini-1.5-flash', wayfinderState, habitsSummary, lang = 'ar' } = {}) {
  const isEn = (lang === 'en');
  const userPrompt = isEn ?
    `Wayfinder Status: Level ${wayfinderState?.level || 1}, Title: "${wayfinderState?.titleEn || 'Wayfinder'}", Gold: ${wayfinderState?.havenGold || 0}.
Habits Today: ${JSON.stringify(habitsSummary || { completed: 0, pending: 0 })}.
Generate a short, inspiring 2-sentence companion whisper as Miro welcoming the player in the Haven.` :
    `حالة المستكشف: الرتبة ${wayfinderState?.level || 1}، اللقب: "${wayfinderState?.titleAr || 'غارس الخطوة الأولى'}"، رصيد ذهب الملاذ: ${wayfinderState?.havenGold || 0}.
ملخص عادات اليوم: إنجاز ${habitsSummary?.completedCount || 0} من أصل ${habitsSummary?.totalCount || 0} عادات.
صغ حواراً قصيراً ودافئاً في جملتين فقط بصوت ميرو يرحب بالمستكشف في شرفة الملاذ الأول، دون أي توبيخ أو ابتذال، ودون استخدام كلمة "الأثير".`;

  try {
    const res = await callGeminiApi({
      apiKey,
      model,
      systemInstruction: ATLAS_AI_SYSTEM_PROMPT,
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: { maxOutputTokens: 120, temperature: 0.7 }
    });
    return { ok: true, text: res.text };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Consult Miro in a specific psychological / life reflection mode.
 */
async function consultMiroWithAi({ apiKey, model = 'gemini-1.5-flash', modeKey = 'reflection', userQuestion = '', wayfinderState, lang = 'ar' } = {}) {
  const isEn = (lang === 'en');
  const userPrompt = isEn ?
    `Mode: ${modeKey}. User Question / Thought: "${userQuestion}".
Wayfinder: Level ${wayfinderState?.level || 1}.
Offer a thoughtful, grounded response (max 3-4 sentences) as Miro blending habit psychology with the living storybook world.` :
    `نمط الاستشارة: ${modeKey} (تأمل ويقظة). تساؤل المستكشف أو خواطره: "${userQuestion}".
رتبة المستكشف: المستوى ${wayfinderState?.level || 1} (${wayfinderState?.titleAr || 'غارس الخطوة الأولى'}).
قدم إجابة حكيمة، هادئة، ومحفزة في 3 إلى 4 جمل بصوت ميرو؛ تدمج بين علم تكوين العادات الواقعي (الخطوات الصغرى، السياق البيئي) وبين جمال معالم الملاذ الأول، بلا أي وعظ جاف وبلا كلمة "الأثير".`;

  try {
    const res = await callGeminiApi({
      apiKey,
      model,
      systemInstruction: ATLAS_AI_SYSTEM_PROMPT,
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: { maxOutputTokens: 250, temperature: 0.75 }
    });
    return { ok: true, text: res.text };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

module.exports = {
  ATLAS_AI_SYSTEM_PROMPT,
  callGeminiApi,
  testGeminiConnection,
  generateMiroCompanionReflection,
  consultMiroWithAi
};
