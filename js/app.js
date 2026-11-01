/* SiteTalk — app logic.
 * Modules in this file:
 *  Data      — parses compact content from scenarios-*.js and grammar.js
 *  Store     — progress state; localStorage + per-user cloud doc (claude db) when available
 *  Voice     — text-to-speech and (when the browser allows) speech recognition
 *  Coach     — offline answer checking (word match + grammar rules with Bangla explanations)
 *  AI        — AI Supervisor role-play through claude.use("sample") when available
 *  Views     — hash-routed screens: home, learn, cat-x, sc-id, practice, grammar, gr-id, plan, day-n, saved, search
 */
(function () {
"use strict";

/* ---------------- Data ---------------- */
const D = window.SITE_DATA;
const parseQ = (s) => { const [q, o, a, e] = s.split("|"); return { q, o: o.split("~"), a: +a, e: e || "" }; };
const SC = D.scenarios.map((s) => ({
  ...s,
  conv: s.conv.map((l) => { const [sp, en, bn] = l.split("|"); return { sp, en, bn }; }),
  voc: s.voc.map((v) => { const [en, bn] = v.split("|"); return { en, bn }; }),
  gr: s.gr.map(([rule, bn, ex]) => ({ rule, bn, ex })),
  alt: s.alt.map((a) => { const [simple, pro, bn] = a.split("|"); return { simple, pro, bn }; }),
  mis: s.mis.map((m) => { const [w, r, why] = m.split("|"); return { w, r, why }; }),
  qz: s.qz.map(parseQ),
}));
const SCM = Object.fromEntries(SC.map((s) => [s.id, s]));
const GR = D.grammar.map((g) => ({ ...g, ex: g.ex.map((x) => { const [en, bn] = x.split("|"); return { en, bn }; }), qz: g.qz.map(parseQ) }));
const GRM = Object.fromEntries(GR.map((g) => [g.id, g]));
const CATS = D.cats;
const CATM = Object.fromEntries(CATS.map((c) => [c.id, c]));
const PLAN = D.plan;
const SPK = D.speakers;

/* ---------------- UI strings ---------------- */
const STR = {
  bn: { home:"হোম", learn:"শিখুন", practice:"AI অনুশীলন", plan:"৩০ দিন", saved:"সংরক্ষিত", search:"খুঁজুন",
    conv:"কথোপকথন", vocab:"শব্দ", grammar:"গ্রামার", alt:"বিকল্প বাক্য", speak:"বলার অনুশীলন", mistakes:"কমন ভুল", test:"মিনি টেস্ট",
    situation:"পরিস্থিতি", playAll:"পুরোটা শুনুন", showBn:"বাংলা দেখান", hideBn:"বাংলা লুকান", markDone:"সম্পন্ন হিসেবে চিহ্নিত করুন", done:"সম্পন্ন",
    check:"চেক করুন", answer:"উত্তর দেখুন", listen:"শুনুন", submit:"জমা দিন", retry:"আবার চেষ্টা", send:"পাঠান", start:"শুরু করুন",
    typeOrSpeak:"ইংরেজিতে লিখুন বা বলুন…", micTip:"এখানে মাইক সরাসরি চালু হয়নি। iPhone কিবোর্ডের মাইক্রোফোন বোতাম চেপে ইংরেজিতে বলুন — লেখা নিজে থেকেই চলে আসবে।",
    noTts:"এই ব্রাউজারে শোনার ফিচার পাওয়া যাচ্ছে না।", savedT:"সংরক্ষিত হয়েছে", removed:"সরানো হয়েছে",
    simple:"সহজ", professional:"পেশাদার", wrong:"ভুল", right:"সঠিক", why:"কেন",
    level1:"শুরু", level2:"মাঝারি", level3:"পেশাদার", today:"আজকের পাঠ", continue:"চালিয়ে যান", streak:"দিনের ধারা",
    scenariosDone:"সিনারিও সম্পন্ন", daysDone:"দিন সম্পন্ন", avgScore:"গড় টেস্ট স্কোর", settings:"সেটিংস", uiLang:"ইন্টারফেসের ভাষা",
    speed:"শোনার গতি", reset:"সব প্রোগ্রেস মুছুন", resetConfirm:"নিশ্চিত? সব প্রোগ্রেস মুছে যাবে।", yesReset:"হ্যাঁ, মুছুন", cancel:"বাতিল",
    sync_cloud:"আপনার অ্যাকাউন্টে সংরক্ষিত", sync_local:"এই ডিভাইসে সংরক্ষিত", phrase:"আজকের বাক্য",
    noSaved:"এখনো কিছু সংরক্ষণ করেননি। যেকোনো বাক্যের পাশে তারকা চাপলে এখানে জমা হবে।", hideEn:"ইংরেজি লুকিয়ে নিজেকে পরীক্ষা", showEn:"ইংরেজি দেখান",
    searchPh:"যেমন: torque, পারমিট, inspection…", noResults:"কিছু পাওয়া যায়নি। অন্য শব্দ দিয়ে চেষ্টা করুন।",
    aiOnline:"AI সুপারভাইজার সংযুক্ত", aiOffline:"অফলাইন কোচ (স্ক্রিপ্টেড)", role:"কার সাথে কথা", topic:"বিষয়", level:"লেভেল", freeTopic:"যেকোনো সাইট পরিস্থিতি",
    newChat:"নতুন কথোপকথন", stop:"থামান", thinking:"ভাবছে…", hint:"ইঙ্গিত", sample:"নমুনা উত্তর", corrected:"সংশোধিত", better:"আরও ভালো", levelUp:"পরের লেভেলে যান",
    tasks:"আজকের কাজ", t_vocab:"১০টি নতুন শব্দ", t_sent:"৫টি কাজের বাক্য", t_conv:"১টি সাইট কথোপকথন", t_gram:"১টি গ্রামার পাঠ", t_speak:"৫ মিনিট বলার অনুশীলন", t_quiz:"দিনের শেষে কুইজ",
    learnedThese:"শিখেছি", openConv:"কথোপকথন খুলুন", openLesson:"পাঠ খুলুন", startTimer:"৫ মিনিট টাইমার শুরু", timerDone:"৫ মিনিট শেষ! চমৎকার।",
    dayComplete:"দিন সম্পন্ন!", score:"স্কোর", pass:"পাস", tryAgain:"আবার চেষ্টা করুন", aiCheck:"AI দিয়ে চেক", yourLines:"আপনার লাইন",
    sayAloud:"বাংলা দেখে ইংরেজিতে জোরে বলুন, তারপর লিখে বা মাইকে বলে চেক করুন।", progress:"অগ্রগতি", activity:"গত ১৪ দিনের অনুশীলন", lessons:"পাঠ",
    formula:"গঠন", examples:"সাইটের উদাহরণ", tip:"টিপস", quiz:"কুইজ", all:"সব", openDay:"দিন খুলুন", recommended:"পরবর্তী" },
  en: { home:"Home", learn:"Learn", practice:"AI Practice", plan:"30 Days", saved:"Saved", search:"Search",
    conv:"Conversation", vocab:"Vocabulary", grammar:"Grammar", alt:"Alternatives", speak:"Speaking", mistakes:"Mistakes", test:"Mini test",
    situation:"Situation", playAll:"Play all", showBn:"Show Bangla", hideBn:"Hide Bangla", markDone:"Mark as complete", done:"Done",
    check:"Check", answer:"Show answer", listen:"Listen", submit:"Submit", retry:"Try again", send:"Send", start:"Start",
    typeOrSpeak:"Type or speak in English…", micTip:"The mic could not start here. Tap the microphone key on your iPhone keyboard and speak — the words will be typed for you.",
    noTts:"Listening is not available in this browser.", savedT:"Saved", removed:"Removed",
    simple:"Simple", professional:"Professional", wrong:"Wrong", right:"Right", why:"Why",
    level1:"Beginner", level2:"Intermediate", level3:"Professional", today:"Today's lesson", continue:"Continue", streak:"Day streak",
    scenariosDone:"Scenarios done", daysDone:"Days done", avgScore:"Avg test score", settings:"Settings", uiLang:"Interface language",
    speed:"Speech speed", reset:"Reset all progress", resetConfirm:"Are you sure? All progress will be deleted.", yesReset:"Yes, reset", cancel:"Cancel",
    sync_cloud:"Saved to your account", sync_local:"Saved on this device", phrase:"Phrase of the day",
    noSaved:"Nothing saved yet. Tap the star next to any sentence to keep it here.", hideEn:"Hide English to test yourself", showEn:"Show English",
    searchPh:"e.g. torque, permit, inspection…", noResults:"No results. Try another word.",
    aiOnline:"AI Supervisor connected", aiOffline:"Offline coach (scripted)", role:"Talk to", topic:"Topic", level:"Level", freeTopic:"Any site situation",
    newChat:"New conversation", stop:"Stop", thinking:"Thinking…", hint:"Hint", sample:"Sample answer", corrected:"Corrected", better:"Better", levelUp:"Go to next level",
    tasks:"Today's tasks", t_vocab:"10 new words", t_sent:"5 work sentences", t_conv:"1 site conversation", t_gram:"1 grammar lesson", t_speak:"5-minute speaking", t_quiz:"End-of-day quiz",
    learnedThese:"Learned", openConv:"Open conversation", openLesson:"Open lesson", startTimer:"Start 5-minute timer", timerDone:"5 minutes done! Great work.",
    dayComplete:"Day complete!", score:"Score", pass:"Pass", tryAgain:"Try again", aiCheck:"Check with AI", yourLines:"Your lines",
    sayAloud:"Read the Bangla, say it in English out loud, then type or dictate it and check.", progress:"Progress", activity:"Practice in the last 14 days", lessons:"lessons",
    formula:"Structure", examples:"Site examples", tip:"Tip", quiz:"Quiz", all:"All", openDay:"Open day", recommended:"Next up" },
};
const T = (k) => (STR[S.lang] || STR.bn)[k] || STR.en[k] || k;

/* ---------------- Store ---------------- */
const KEY = "sitetalk.progress.v1";
const blank = () => ({ v: 1, done: {}, tests: {}, gdone: {}, days: {}, saved: [], act: {}, start: null, ai: { level: 1, good: 0, total: 0 }, lang: "bn", rate: 0.9, hideBn: false, updatedAt: 0 });
function loadLocal() { try { const r = localStorage.getItem(KEY); if (r) return Object.assign(blank(), JSON.parse(r)); } catch (e) {} return blank(); }
let S = loadLocal();
let dbRef = null, syncMode = "local", writing = false, pendingWrite = false, writeTimer = null;
function save() {
  S.updatedAt = Date.now();
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
  if (dbRef) { clearTimeout(writeTimer); writeTimer = setTimeout(flush, 1200); }
}
async function flush() {
  if (!dbRef) return;
  if (writing) { pendingWrite = true; return; }
  writing = true;
  try { await dbRef.set(JSON.parse(JSON.stringify(S))); setSync("cloud"); }
  catch (e) { if (e && (e.code === "invalid_argument" || e.code === "revoked" || e.code === "not_granted")) { dbRef = null; setSync("local"); } }
  writing = false;
  if (pendingWrite) { pendingWrite = false; flush(); }
}
function setSync(m) { syncMode = m; const el = document.getElementById("sync"); if (el) { el.textContent = T("sync_" + m); el.dataset.mode = m; } }
async function initCloud() {
  if (!window.claude || !window.claude.use) return;
  try {
    const [db, user] = await Promise.all([window.claude.use("db"), window.claude.use("user")]);
    if (!db || !user) return;
    const id = await user.id();
    if (!id) return;
    const ref = db.doc("data/users/" + id + "/progress");
    const snap = await ref.get();
    const remote = snap.exists ? snap.data() : null;
    if (remote && (remote.updatedAt || 0) > (S.updatedAt || 0)) {
      S = Object.assign(blank(), JSON.parse(JSON.stringify(remote)));
      try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
      render();
    }
    dbRef = ref; setSync("cloud");
    if (!remote || (remote.updatedAt || 0) < (S.updatedAt || 0)) flush();
  } catch (e) { /* stay local */ }
}

const fmtDate = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const todayKey = () => fmtDate(new Date());
function bump() { const k = todayKey(); S.act[k] = (S.act[k] || 0) + 1; if (!S.start) S.start = k; }
function streak() { let n = 0; const d = new Date(); if (!S.act[fmtDate(d)]) d.setDate(d.getDate() - 1); while (S.act[fmtDate(d)]) { n++; d.setDate(d.getDate() - 1); } return n; }
const isSaved = (en) => S.saved.some((x) => x.en === en);
const DAY_TASKS = ["vocab", "sent", "conv", "gram", "speak", "quiz"];
const dayState = (d) => S.days[d] || {};
const dayDoneCount = (d) => DAY_TASKS.filter((k) => dayState(d)[k]).length;
const dayComplete = (d) => dayDoneCount(d) === DAY_TASKS.length;
const nextDay = () => { for (const p of PLAN) if (!dayComplete(p.d)) return p.d; return 30; };
function setDayTask(d, k, v) { S.days[d] = Object.assign({}, S.days[d], { [k]: v === undefined ? true : v }); bump(); save(); if (dayComplete(d)) toast(T("dayComplete") + " Day " + d); }

/* ---------------- Utils ---------------- */
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (a, n) => shuffle(a).slice(0, n);
const lvlName = (l) => T("level" + l);
const spName = (sp) => (SPK[sp] ? (S.lang === "en" ? SPK[sp][0] : SPK[sp][0] + " · " + SPK[sp][1]) : sp);
let toastTimer;
function toast(msg) { const el = document.getElementById("toast"); if (!el) return; el.textContent = msg; el.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => (el.hidden = true), 3200); }

const I = {
  home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z"/></svg>',
  learn: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4zM20 4h-3a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h4z"/></svg>',
  chat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v10H9l-5 4z"/></svg>',
  cal: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v14H4zM4 10h16M8 3v5M16 3v5"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>',
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg>',
  speaker: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4zM16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
  mic: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>',
  back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 8 12l7 7"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12 20 4l-5 16-3-7z"/></svg>',
};

/* ---------------- Voice ---------------- */
let voice = null;
function pickVoice() {
  try {
    const vs = speechSynthesis.getVoices();
    voice = vs.find((v) => /en-US/i.test(v.lang) && /Samantha|Google US|Aaron|Nicky/i.test(v.name)) || vs.find((v) => /^en-US/i.test(v.lang)) || vs.find((v) => /^en/i.test(v.lang)) || null;
  } catch (e) {}
}
try { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; } catch (e) {}
function speak(text, onend) {
  try {
    if (!("speechSynthesis" in window)) { toast(T("noTts")); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US"; u.rate = S.rate || 0.9; if (voice) u.voice = voice;
    if (onend) u.onend = onend;
    speechSynthesis.speak(u);
  } catch (e) { toast(T("noTts")); }
}
function speakNow(text) { try { speechSynthesis.cancel(); } catch (e) {} speak(text); }
function speakSeq(lines) { try { speechSynthesis.cancel(); } catch (e) {} let i = 0; const next = () => { if (i < lines.length) speak(lines[i++], next); }; next(); }

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let rec = null;
function listen(targetId) {
  const box = document.getElementById(targetId);
  if (!box) return;
  if (!SR) { toast(T("micTip")); box.focus(); return; }
  try {
    if (rec) { rec.stop(); rec = null; return; }
    rec = new SR(); rec.lang = "en-US"; rec.interimResults = true; rec.continuous = false;
    const base = box.value ? box.value + " " : "";
    rec.onresult = (e) => { let t = ""; for (const r of e.results) t += r[0].transcript; box.value = base + t; BIND[targetId] = box.value; };
    rec.onerror = () => { toast(T("micTip")); rec = null; box.focus(); };
    rec.onend = () => { rec = null; document.querySelectorAll(".mic.on").forEach((b) => b.classList.remove("on")); };
    rec.start();
    document.querySelectorAll('[data-act="mic"][data-target="' + targetId + '"]').forEach((b) => b.classList.add("on"));
  } catch (e) { toast(T("micTip")); rec = null; box.focus(); }
}

/* ---------------- Coach (offline checking) ---------------- */
const norm = (w) => w.toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9'.-]/g, "").replace(/^[.'-]+|[.'-]+$/g, "");
const words = (s) => String(s).split(/\s+/).map(norm).filter(Boolean);
function compare(said, target) {
  const a = words(said);
  const toks = String(target).split(/\s+/).filter(Boolean);
  const b = toks.map(norm);
  const n = a.length, m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] && a[i] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const hit = new Array(m).fill(false);
  let i = 0, j = 0;
  while (i < n && j < m) { if (a[i] === b[j] && a[i]) { hit[j] = true; i++; j++; } else if (dp[i + 1][j] >= dp[i][j + 1]) i++; else j++; }
  const real = b.filter(Boolean).length || 1;
  const lcs = dp[0][0];
  const extra = Math.max(0, n - lcs);
  const score = Math.max(0, Math.round((lcs / real) * 100 - extra * 4));
  return { score: Math.min(100, score), toks, hit };
}
const RULES = [
  [/\bi\b/, "“I” (আমি) সবসময় বড় হাতের অক্ষরে লিখতে হয়।", true],
  [/\b(i)\s+(is|are)\b/i, "I-এর সঙ্গে am বসে: I am ..."],
  [/\b(he|she|it|this|that)\s+(are|am)\b/i, "He/She/It বা একবচনের সঙ্গে is বসে।"],
  [/\b(we|they|you)\s+(is|am|was)\b/i, "We/They/You-এর সঙ্গে are (বর্তমান) বা were (অতীত) বসে।"],
  [/\b(am|is|are|was|were)\s+(go|come|work|check|finish|do|make|use|start|install|need|agree|understand|think|have|want|know)\b/i, "am/is/are-এর পরে সরাসরি verb-এর মূল রূপ বসে না। চলমান কাজে verb-ing (is working) বা অন্য রূপ ব্যবহার করুন — যেমন “I am agree” নয়, “I agree”।"],
  [/\b(did|does|do|didn't|doesn't|don't)\s+(not\s+)?\w+ed\b/i, "do/does/did-এর পরে verb থাকে মূল রূপে (did check, did checked নয়)।"],
  [/\b(can|could|should|will|must|may|would|cannot|can't|won't)\s+to\s+\w+/i, "can/should/will/must-এর পরে to বসে না: should replace, should to replace নয়।"],
  [/\b(can|could|should|will|must|may|would)\s+\w+ing\b/i, "can/should/will/must-এর পরে verb-ing নয়, মূল রূপ বসে (will send, will sending নয়)।"],
  [(t) => /\b(he|she|it|the pump|the machine|the motor|this joint)\s+(go|come|need|have|do|work|want|make|look)\b/i.test(t) && !/\b(do|does|did|doesn't|didn't|don't|can|could|should|will|must|may|would|let|make)\s+(he|she|it|the pump|the machine|the motor|this joint)\b/i.test(t), "He/She/It বা একবচন subject-এর পরে verb-এ -s/-es লাগে (needs, has, goes)।"],
  [/\baccording to me\b/i, "“According to me” প্রচলিত নয় — বলুন “In my opinion” বা “I think”।"],
  [/\bsuggest\s+to\b/i, "suggest-এর পরে verb-ing: I suggest adding ..."],
  [/\bwait(ing)?\s+(the|my|your|a)\b/i, "wait-এর পরে for লাগে: waiting for the gaskets।"],
  [/\bthere\s+have\b/i, "কোনো কিছু আছে বোঝাতে There is / There are — There have নয়।"],
  [/\bmore\s+better\b/i, "better নিজেই তুলনা — more better নয়।"],
  [(t) => /\b(yesterday|last week)\b/i.test(t) && /\b(i|we|he|she|they|it)\s+(go|come|check|find|fall|take|finish|install)\b/i.test(t) && !/\b(did|didn't|will|can|could|should)\b/i.test(t), "অতীত সময় (yesterday ইত্যাদি) থাকলে verb-এর অতীত রূপ (went, came, checked, found) ব্যবহার করুন।"],
];
function grammarHints(text) {
  const t = " " + String(text) + " ";
  const out = [];
  for (const [test, bn] of RULES) { if (typeof test === "function" ? test(t) : test.test(t)) out.push(bn); }
  return out.slice(0, 3);
}
const hasBangla = (s) => /[ঀ-৿]/.test(s);

/* ---------------- AI providers ----------------
 * 1. Claude (claude.use("sample")) — when the page runs as a Claude artifact.
 * 2. Gemini (Google AI Studio API key, free tier) — anywhere else, e.g. GitHub Pages.
 *    The key is kept only in this browser's localStorage (never in the repo, never synced).
 * 3. Offline scripted coach — when neither is available.
 */
let sampleFn = null, sampleState = "checking"; // checking | online | offline
let provider = null; // "claude" | "gemini" | null
const GEM_KEY = "sitetalk.gemini.v1";
const GEM_MODELS = ["gemini-flash-lite-latest", "gemini-flash-latest", "gemini-2.5-flash-lite", "gemini-2.5-flash"];
function loadGem() { try { const g = JSON.parse(localStorage.getItem(GEM_KEY) || "{}"); return { key: g.key || "", model: g.model || GEM_MODELS[0] }; } catch (e) { return { key: "", model: GEM_MODELS[0] }; } }
function saveGem(g) { try { localStorage.setItem(GEM_KEY, JSON.stringify(g)); } catch (e) {} }
let gemStatus = "";
function pickProvider() {
  provider = sampleFn ? "claude" : loadGem().key ? "gemini" : null;
  sampleState = provider ? "online" : "offline";
  refreshAIBadge();
}
async function initAI() {
  if (window.claude && window.claude.use) { try { sampleFn = await window.claude.use("sample"); } catch (e) { sampleFn = null; } }
  pickProvider();
}
const providerName = () => (provider === "claude" ? "Claude" : provider === "gemini" ? "Gemini" : "");
function refreshAIBadge() { const b = document.getElementById("ai-badge"); if (b) { b.textContent = sampleState === "online" ? T("aiOnline") + " · " + providerName() : sampleState === "offline" ? T("aiOffline") : "…"; b.dataset.mode = sampleState; } }
function parseLooseJSON(text) {
  const t = String(text || "").trim();
  try { return JSON.parse(t); } catch (e) {}
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  if (a >= 0 && b > a) { try { return JSON.parse(t.slice(a, b + 1)); } catch (e) {} }
  throw { code: "invalid_json" };
}
async function geminiJSON(input, signal) {
  const g = loadGem();
  if (!g.key) throw { code: "bad_key" };
  const contents = [];
  if (typeof input === "string") contents.push({ role: "user", parts: [{ text: input }] });
  else for (const t of input) {
    const role = t.role === "assistant" ? "model" : "user";
    const last = contents[contents.length - 1];
    if (last && last.role === role) last.parts[0].text += "\n\n" + t.content;
    else contents.push({ role, parts: [{ text: t.content }] });
  }
  let res;
  try {
    res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(g.model) + ":generateContent?key=" + encodeURIComponent(g.key), {
      method: "POST", headers: { "Content-Type": "application/json" }, signal,
      body: JSON.stringify({ contents, generationConfig: { responseMimeType: "application/json", temperature: 0.6 } }),
    });
  } catch (e) { throw { code: e && e.name === "AbortError" ? "cancelled" : "network" }; }
  let j = null; try { j = await res.json(); } catch (e) {}
  if (!res.ok) {
    const msg = (j && j.error && j.error.message) || "";
    const st = res.status;
    throw { code: st === 429 ? "rate_limited" : st === 404 ? "bad_model" : /api key|permission|unauthori/i.test(msg) || st === 401 || st === 403 ? "bad_key" : "upstream_error", message: msg };
  }
  const parts = (j && j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts) || [];
  return parseLooseJSON(parts.map((p) => p.text || "").join(""));
}
function aiJSON(input, signal) {
  if (provider === "claude") return sampleFn.json(input, { cache: false, modelTier: "quick", signal });
  if (provider === "gemini") return geminiJSON(input, signal);
  return Promise.reject({ code: "not_granted" });
}
function aiErrorText(code) {
  if (code === "bad_key") return S.lang === "en" ? "The Gemini API key was not accepted. Check it in Settings." : "Gemini API key গ্রহণ হয়নি। Settings-এ key-টা আবার দেখুন।";
  if (code === "bad_model") return S.lang === "en" ? "This Gemini model is not available. Choose another model in Settings." : "এই Gemini মডেলটি পাওয়া যাচ্ছে না। Settings-এ অন্য মডেল বেছে নিন।";
  if (code === "network") return S.lang === "en" ? "No internet connection to the AI. Check your network and try again." : "AI-এর সঙ্গে ইন্টারনেট সংযোগ হয়নি। নেটওয়ার্ক দেখে আবার চেষ্টা করুন।";
  if (code === "rate_limited" && provider === "gemini") return S.lang === "en" ? "The free Gemini limit is used up for now. Wait a minute (or until tomorrow for the daily limit), or choose the Flash-Lite model, which allows more requests." : "Gemini-র ফ্রি লিমিট আপাতত শেষ। এক মিনিট অপেক্ষা করুন (দৈনিক লিমিট হলে কাল পর্যন্ত), অথবা Settings-এ Flash-Lite মডেল বেছে নিন — এতে বেশি অনুরোধ করা যায়।";
  if (code === "not_granted" || code === "sampling_disabled" || code === "not_declared" || code === "capability_disabled") return S.lang === "en" ? "AI is not allowed for this page right now. Switched to the offline coach." : "এই পেজে AI ব্যবহারের অনুমতি নেই। অফলাইন কোচ চালু করা হলো।";
  if (code === "rate_limited") return S.lang === "en" ? "Too many requests. Wait a minute and try again." : "অনেক বেশি অনুরোধ হয়েছে। এক মিনিট পরে আবার চেষ্টা করুন।";
  if (code === "session_expired") return S.lang === "en" ? "Please sign in again." : "আবার সাইন ইন করুন।";
  return S.lang === "en" ? "The AI did not answer. Tap send to try again." : "AI উত্তর দেয়নি। আবার পাঠিয়ে চেষ্টা করুন।";
}
const PERMANENT = ["not_granted", "sampling_disabled", "not_declared", "capability_disabled", "capability_removed"];

/* ---------------- View state ---------------- */
const BIND = {};          // text typed into practice boxes, by element id
const QZ = {};            // quiz state, by key
const SPK_RES = {};       // speaking check results, by element id
let scTab = "conv", hideEn = false, resetAsk = false;
const chat = { role: "S", topic: "free", level: null, turns: [], msgs: [], busy: false, ctl: null, okRun: 0, step: 0, offline: false };
let timer = { day: null, end: 0, iv: null };

/* ---------------- Quiz engine ---------------- */
function mkQuiz(key, qs) { if (!QZ[key]) QZ[key] = { qs, ans: {}, submitted: false }; return QZ[key]; }
function autoQs(s, nSent, nVoc) {
  const qs = [];
  const you = s.conv.filter((l) => l.sp === "Y");
  const pool = SC.filter((x) => x.id !== s.id).flatMap((x) => x.conv.filter((l) => l.sp === "Y").map((l) => l.en));
  for (const l of pick(you, nSent)) {
    const opts = shuffle([l.en, ...pick(pool, 2)]);
    qs.push({ q: "“" + l.bn + "” — " + (S.lang === "en" ? "which English sentence?" : "ইংরেজিতে কোনটি?"), o: opts, a: opts.indexOf(l.en), e: l.en });
  }
  const allVoc = SC.flatMap((x) => x.voc);
  for (const v of pick(s.voc, nVoc)) {
    const others = pick(allVoc.filter((x) => x.bn !== v.bn), 2).map((x) => x.bn);
    const opts = shuffle([v.bn, ...others]);
    qs.push({ q: "“" + v.en + "” — " + (S.lang === "en" ? "meaning?" : "মানে কী?"), o: opts, a: opts.indexOf(v.bn), e: v.en + " = " + v.bn });
  }
  return qs;
}
function quizHTML(key) {
  const st = QZ[key];
  const total = st.qs.length;
  const correct = st.qs.filter((q, i) => st.ans[i] === q.a).length;
  let h = '<ol class="quiz">';
  st.qs.forEach((q, i) => {
    h += '<li class="qitem"><p class="qq">' + esc(q.q) + '</p><div class="qopts">';
    q.o.forEach((o, oi) => {
      let cls = "qopt";
      if (st.ans[i] === oi) cls += " sel";
      if (st.submitted) { if (oi === q.a) cls += " good"; else if (st.ans[i] === oi) cls += " bad"; }
      h += '<button class="' + cls + '" data-act="ans" data-k="' + esc(key) + '" data-i="' + i + '" data-o="' + oi + '"' + (st.submitted ? " disabled" : "") + ">" + esc(o) + "</button>";
    });
    h += "</div>";
    if (st.submitted && q.e) h += '<p class="qexp">' + esc(q.e) + "</p>";
    h += "</li>";
  });
  h += "</ol>";
  if (!st.submitted) h += '<button class="btn primary" data-act="submitQuiz" data-k="' + esc(key) + '"' + (Object.keys(st.ans).length < total ? " disabled" : "") + ">" + T("submit") + "</button>";
  else {
    const pct = Math.round((correct / total) * 100);
    h += '<div class="result ' + (pct >= 70 ? "ok" : "warn") + '"><strong>' + T("score") + ": " + correct + "/" + total + " (" + pct + "%)</strong> " + (pct >= 70 ? T("pass") : T("tryAgain")) + '</div><button class="btn" data-act="retryQuiz" data-k="' + esc(key) + '">' + T("retry") + "</button>";
  }
  return h;
}
function onQuizSubmitted(key) {
  const st = QZ[key];
  const pct = Math.round((st.qs.filter((q, i) => st.ans[i] === q.a).length / st.qs.length) * 100);
  const [kind, id] = key.split(":");
  if (kind === "sc") { S.tests[id] = Math.max(S.tests[id] || 0, pct); if (pct >= 70 && !S.done[id]) S.done[id] = todayKey(); }
  if (kind === "gr") { if (pct >= 60) S.gdone[id] = todayKey(); }
  if (kind === "day") { if (pct >= 60) setDayTask(+id, "quiz", pct); else S.days[id] = Object.assign({}, S.days[id], { quizTry: pct }); }
  bump(); save();
}

/* ---------------- Shared fragments ---------------- */
function lineHTML(l, src) {
  const sv = isSaved(l.en);
  return '<div class="line' + (l.sp === "Y" ? " you" : "") + '"><div class="who">' + esc(spName(l.sp)) + '</div><p class="en" lang="en">' + esc(l.en) + '</p><p class="bn" lang="bn">' + esc(l.bn) + "</p>" + acts(l.en, l.bn, src, sv) + "</div>";
}
function acts(en, bn, src, sv) {
  return '<div class="line-acts"><button class="icon-btn" data-act="say" data-t="' + esc(en) + '" aria-label="' + T("listen") + '">' + I.speaker + '</button><button class="icon-btn star' + (sv ? " on" : "") + '" data-act="save" data-en="' + esc(en) + '" data-bn="' + esc(bn) + '" data-src="' + esc(src) + '" aria-pressed="' + sv + '" aria-label="Save">' + I.star + "</button></div>";
}
function speakBox(id, target, bn) {
  const r = SPK_RES[id];
  let h = '<div class="spk"><p class="spk-bn" lang="bn">' + esc(bn) + '</p><div class="spk-in"><textarea id="' + id + '" data-bind="' + id + '" rows="2" placeholder="' + esc(T("typeOrSpeak")) + '" autocapitalize="sentences" lang="en">' + esc(BIND[id] || "") + '</textarea><button class="icon-btn mic" data-act="mic" data-target="' + id + '" aria-label="Mic">' + I.mic + '</button></div><div class="row"><button class="btn primary sm" data-act="spkCheck" data-id="' + id + '" data-t="' + esc(target) + '">' + T("check") + '</button><button class="btn sm" data-act="say" data-t="' + esc(target) + '">' + I.speaker + T("listen") + '</button><button class="btn sm ghost" data-act="spkShow" data-id="' + id + '">' + T("answer") + "</button>" + (sampleState === "online" ? '<button class="btn sm ghost" data-act="spkAI" data-id="' + id + '" data-t="' + esc(target) + '" data-bn="' + esc(bn) + '">' + T("aiCheck") + "</button>" : "") + "</div>";
  if (r) {
    if (r.show) h += '<p class="target en" lang="en">' + esc(target) + "</p>";
    if (r.cmp) {
      h += '<div class="cmp"><span class="pct ' + (r.cmp.score >= 80 ? "ok" : r.cmp.score >= 50 ? "mid" : "low") + '">' + r.cmp.score + '%</span><p class="toks" lang="en">' + r.cmp.toks.map((t, i) => '<span class="' + (r.cmp.hit[i] ? "hit" : "miss") + '">' + esc(t) + "</span>").join(" ") + "</p></div>";
      if (r.hints && r.hints.length) h += '<ul class="hints">' + r.hints.map((x) => "<li>" + esc(x) + "</li>").join("") + "</ul>";
    }
    if (r.ai === "wait") h += '<p class="muted">' + T("thinking") + "</p>";
    else if (r.ai && r.ai.err) h += '<p class="muted">' + esc(r.ai.err) + "</p>";
    else if (r.ai) h += fbHTML(r.ai);
  }
  return h + "</div>";
}
function fbHTML(f) {
  if (!f) return "";
  let h = '<div class="fb ' + (f.ok ? "ok" : "warn") + '">';
  if (f.corrected) h += '<p><span class="lab">' + T("corrected") + '</span><span class="en" lang="en">' + esc(f.corrected) + "</span></p>";
  if (f.better) h += '<p><span class="lab">' + T("better") + '</span><span class="en" lang="en">' + esc(f.better) + '</span> <button class="icon-btn inline" data-act="say" data-t="' + esc(f.better) + '" aria-label="Listen">' + I.speaker + "</button></p>";
  if (f.explain_bn) h += '<p class="bn" lang="bn">' + esc(f.explain_bn) + "</p>";
  return h + "</div>";
}
const levelChip = (l) => '<span class="chip lv' + l + '">L' + l + " · " + lvlName(l) + "</span>";
const code = (s) => "MOD-" + s.cat + " · " + s.id.slice(1).padStart(2, "0");
function scCard(s) {
  const done = S.done[s.id];
  return '<a class="sc-card' + (done ? " is-done" : "") + '" href="#sc-' + s.id + '"><div class="sc-top"><span class="mono">' + code(s) + "</span>" + levelChip(s.lvl) + "</div><h3>" + esc(s.t) + '</h3><p class="bn" lang="bn">' + esc(s.tb) + '</p><div class="sc-foot">' + (done ? '<span class="done-mark">' + I.check + T("done") + "</span>" : "") + (S.tests[s.id] != null ? '<span class="mono muted">' + T("test") + " " + S.tests[s.id] + "%</span>" : "") + "</div></a>";
}
function catProgress(c) { const list = SC.filter((s) => s.cat === c.id); const n = list.filter((s) => S.done[s.id]).length; return { n, total: list.length }; }
function catCard(c) {
  const p = catProgress(c);
  return '<a class="cat-card" href="#cat-' + c.id.toLowerCase() + '"><span class="cat-letter">' + c.id + '</span><div class="cat-body"><h3>' + esc(c.t) + '</h3><p class="bn" lang="bn">' + esc(c.tb) + '</p><div class="bar"><span style="width:' + (p.total ? (p.n / p.total) * 100 : 0) + '%"></span></div><p class="mono muted">' + p.n + "/" + p.total + "</p></div></a>";
}
const backLink = (href, label) => '<a class="back" href="' + href + '">' + I.back + esc(label) + "</a>";

/* ---------------- Views ---------------- */
function vHome() {
  const nd = nextDay();
  const p = PLAN[nd - 1];
  const s = SCM[p.s];
  const yous = SC.flatMap((x) => x.conv.filter((l) => l.sp === "Y"));
  const seed = todayKey().split("-").reduce((a, b) => a + +b, 0);
  const ph = yous[seed % yous.length];
  const doneSc = Object.keys(S.done).length;
  const daysDone = PLAN.filter((x) => dayComplete(x.d)).length;
  let h = '<section class="hero"><p class="eyebrow mono">' + T("today") + " · Day " + nd + ' / 30</p><h1>' + esc(s.t) + '</h1><p class="bn" lang="bn">' + esc(s.tb) + " · " + esc(GRM[p.g].tb) + '</p><div class="steps">' + DAY_TASKS.map((k) => '<span class="step' + (dayState(nd)[k] ? " on" : "") + '" title="' + esc(T("t_" + k)) + '"></span>').join("") + '</div><a class="btn primary" href="#day-' + nd + '">' + T("continue") + "</a></section>";
  h += '<section class="stats"><div><b>' + streak() + "</b><span>" + T("streak") + "</span></div><div><b>" + daysDone + "/30</b><span>" + T("daysDone") + "</span></div><div><b>" + doneSc + "/" + SC.length + "</b><span>" + T("scenariosDone") + "</span></div></section>";
  h += '<section class="phrase"><p class="eyebrow mono">' + T("phrase") + '</p><p class="en big" lang="en">' + esc(ph.en) + '</p><p class="bn" lang="bn">' + esc(ph.bn) + "</p>" + acts(ph.en, ph.bn, "phrase", isSaved(ph.en)) + "</section>";
  h += '<section class="quick"><a class="quick-link" href="#practice">' + I.chat + "<span>" + T("practice") + '<small id="ai-badge" data-mode="' + sampleState + '">…</small></span></a><a class="quick-link" href="#grammar">' + I.learn + "<span>" + T("grammar") + "<small>" + GR.length + " " + T("lessons") + '</small></span></a><a class="quick-link" href="#saved">' + I.star + "<span>" + T("saved") + "<small>" + S.saved.length + "</small></span></a></section>";
  h += '<h2 class="sec">' + T("learn") + '</h2><div class="cats">' + CATS.map(catCard).join("") + "</div>";
  h += settingsHTML();
  return h;
}
function geminiHTML(intro) {
  const g = loadGem(), en = S.lang === "en";
  let h = '<div class="gem"><p class="gem-t"><b>' + (en ? "Free AI Supervisor with Gemini" : "Gemini দিয়ে ফ্রি AI সুপারভাইজার") + "</b>" + (g.key ? ' <span class="chip lv1">' + (en ? "key saved" : "key সংরক্ষিত") + "</span>" : "") + "</p>";
  if (intro || !g.key) h += '<ol class="gem-steps bn" lang="bn">' + (en
    ? '<li>Open <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey</a> and sign in with Google.</li><li>Tap “Create API key” and copy it.</li><li>Paste it below and tap Save. The key stays only on this phone.</li>'
    : '<li><a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey</a> খুলে Google অ্যাকাউন্টে সাইন ইন করুন।</li><li>“Create API key” চেপে key কপি করুন।</li><li>নিচে পেস্ট করে Save চাপুন। key শুধু আপনার এই ফোনেই থাকবে।</li>') + "</ol>";
  h += '<div class="gem-row"><input id="gem-key" type="password" autocomplete="off" spellcheck="false" placeholder="' + (g.key ? "••••••••" + esc(g.key.slice(-4)) : "AIza…") + '" aria-label="Gemini API key"><select id="gem-model" aria-label="Model">' + GEM_MODELS.concat(GEM_MODELS.includes(g.model) ? [] : [g.model]).map((m) => '<option value="' + esc(m) + '"' + (m === g.model ? " selected" : "") + ">" + esc(m) + "</option>").join("") + "</select></div>";
  h += '<div class="row"><button class="btn sm primary" data-act="gemSave">' + (en ? "Save" : "সংরক্ষণ") + '</button><button class="btn sm" data-act="gemTest"' + (g.key ? "" : " disabled") + ">" + (en ? "Test" : "পরীক্ষা") + "</button>" + (g.key ? '<button class="btn sm ghost" data-act="gemClear">' + (en ? "Remove key" : "key মুছুন") + "</button>" : "") + "</div>";
  if (gemStatus) h += '<p class="gem-status">' + esc(gemStatus) + "</p>";
  h += '<p class="muted small bn" lang="bn">' + (en ? "Flash-Lite gives the most free requests per day. Free-tier conversations may be used by Google to improve its products — do not type private information." : "Flash-Lite মডেলে প্রতিদিন সবচেয়ে বেশি ফ্রি অনুরোধ করা যায়। ফ্রি টিয়ারের কথোপকথন Google তাদের সেবা উন্নত করতে ব্যবহার করতে পারে — ব্যক্তিগত তথ্য লিখবেন না।") + "</p>";
  return h + "</div>";
}
function settingsHTML() {
  let h = '<section class="settings"><h2 class="sec">' + T("settings") + '</h2><div class="set-row"><span>' + T("uiLang") + '</span><div class="seg"><button class="' + (S.lang === "bn" ? "on" : "") + '" data-act="lang" data-v="bn">বাংলা</button><button class="' + (S.lang === "en" ? "on" : "") + '" data-act="lang" data-v="en">English</button></div></div>';
  if (!sampleFn) h += geminiHTML(false);
  h += '<div class="set-row"><label for="rate">' + T("speed") + ' <span class="mono" id="rate-v">' + (S.rate || 0.9).toFixed(2) + '×</span></label><input id="rate" type="range" min="0.6" max="1.2" step="0.05" value="' + (S.rate || 0.9) + '" data-act-input="rate"></div>';
  h += '<div class="set-row"><span id="sync" data-mode="' + syncMode + '">' + T("sync_" + syncMode) + "</span>";
  h += resetAsk ? '<span class="row"><span class="muted">' + T("resetConfirm") + '</span><button class="btn sm danger" data-act="resetYes">' + T("yesReset") + '</button><button class="btn sm" data-act="resetNo">' + T("cancel") + "</button></span>" : '<button class="btn sm ghost" data-act="resetAsk">' + T("reset") + "</button>";
  return h + "</div></section>";
}
function vLearn() { return '<h1 class="page-t">' + T("learn") + '</h1><div class="cats">' + CATS.map(catCard).join("") + "</div>"; }
function vCat(id) {
  const c = CATM[id.toUpperCase()];
  if (!c) return vLearn();
  const list = SC.filter((s) => s.cat === c.id).sort((a, b) => a.lvl - b.lvl);
  return backLink("#learn", T("learn")) + '<p class="eyebrow mono">MODULE ' + c.id + '</p><h1 class="page-t">' + esc(c.t) + '</h1><p class="bn lead" lang="bn">' + esc(c.tb) + " — " + esc(c.d) + '</p><div class="sc-grid">' + list.map(scCard).join("") + "</div>";
}
function vScenario(id) {
  const s = SCM[id];
  if (!s) return vLearn();
  const tabs = ["conv", "vocab", "grammar", "alt", "speak", "mistakes", "test"];
  let h = backLink("#cat-" + s.cat.toLowerCase(), CATM[s.cat].t) + '<div class="sc-head"><div class="sc-top"><span class="mono">' + code(s) + "</span>" + levelChip(s.lvl) + "</div><h1>" + esc(s.t) + '</h1><p class="bn" lang="bn">' + esc(s.tb) + "</p></div>";
  h += '<nav class="tabs" role="tablist">' + tabs.map((t) => '<button role="tab" aria-selected="' + (scTab === t) + '" class="' + (scTab === t ? "on" : "") + '" data-act="tab" data-v="' + t + '">' + T(t) + "</button>").join("") + "</nav>";
  h += '<div class="tabpane">';
  if (scTab === "conv") {
    h += '<div class="situation"><p class="eyebrow mono">' + T("situation") + '</p><p class="bn" lang="bn">' + esc(s.sit) + "</p></div>";
    h += '<div class="row"><button class="btn sm" data-act="playAll" data-id="' + s.id + '">' + I.speaker + T("playAll") + '</button><button class="btn sm ghost" data-act="toggleBn">' + (S.hideBn ? T("showBn") : T("hideBn")) + "</button></div>";
    h += '<div class="lines">' + s.conv.map((l) => lineHTML(l, s.id)).join("") + "</div>";
    h += S.done[s.id] ? '<p class="done-mark big">' + I.check + T("done") + "</p>" : '<button class="btn primary" data-act="markDone" data-id="' + s.id + '">' + T("markDone") + "</button>";
  } else if (scTab === "vocab") {
    h += '<ul class="vocab">' + s.voc.map((v) => '<li><div><p class="en" lang="en">' + esc(v.en) + '</p><p class="bn" lang="bn">' + esc(v.bn) + "</p></div>" + acts(v.en, v.bn, s.id, isSaved(v.en)) + "</li>").join("") + "</ul>";
  } else if (scTab === "grammar") {
    h += s.gr.map((g) => '<div class="rule"><h3 class="mono">' + esc(g.rule) + '</h3><p class="bn" lang="bn">' + esc(g.bn) + '</p><p class="ex en" lang="en">' + esc(g.ex) + ' <button class="icon-btn inline" data-act="say" data-t="' + esc(g.ex) + '" aria-label="Listen">' + I.speaker + "</button></p></div>").join("");
    const rel = relatedLesson(s);
    if (rel) h += '<a class="btn" href="#gr-' + rel.id + '">' + esc(rel.tb) + " →</a>";
  } else if (scTab === "alt") {
    h += s.alt.map((a) => '<div class="alt"><div class="alt-col"><span class="lab">' + T("simple") + '</span><p class="en" lang="en">' + esc(a.simple) + '</p></div><div class="alt-col pro"><span class="lab">' + T("professional") + '</span><p class="en" lang="en">' + esc(a.pro) + '</p><p class="bn" lang="bn">' + esc(a.bn) + "</p>" + acts(a.pro, a.bn, s.id, isSaved(a.pro)) + "</div></div>").join("");
  } else if (scTab === "speak") {
    h += '<p class="muted bn" lang="bn">' + T("sayAloud") + "</p>";
    s.conv.forEach((l, i) => { if (l.sp === "Y") h += speakBox("sp-" + s.id + "-" + i, l.en, l.bn); });
  } else if (scTab === "mistakes") {
    h += s.mis.map((m) => '<div class="mis"><p class="wrong"><span class="lab">' + T("wrong") + '</span><s lang="en">' + esc(m.w) + '</s></p><p class="right"><span class="lab">' + T("right") + '</span><span class="en" lang="en">' + esc(m.r) + '</span></p><p class="bn" lang="bn">' + esc(m.why) + "</p></div>").join("");
  } else if (scTab === "test") {
    mkQuiz("sc:" + s.id, shuffle(s.qz.concat(autoQs(s, 2, 3))));
    h += quizHTML("sc:" + s.id);
  }
  h += "</div>";
  const idx = SC.findIndex((x) => x.id === s.id);
  const nx = SC.slice(idx + 1).find((x) => x.cat === s.cat);
  if (nx) h += '<a class="next" href="#sc-' + nx.id + '"><span class="muted">' + T("recommended") + "</span>" + esc(nx.t) + " →</a>";
  return h;
}
function relatedLesson(s) {
  const r = (s.gr[0] && s.gr[0].rule.toLowerCase()) || "";
  const map = [[/am \/ is|is\/are|is \.\.\.|are \.\.\./, "g2"], [/was|were/, "g3"], [/did/, "g6"], [/continuous|-ing|making/, "g5"], [/perfect|has|have/, "g7"], [/will|going/, "g8"], [/can|could|should|must|would/, "g9"], [/wh|what|which|where|how/, "g11"], [/there is|in \/ at|prepos/, "g12"], [/do you|does|present simple/, "g4"]];
  for (const [re, g] of map) if (re.test(r)) return GRM[g];
  return GRM.g13;
}
function vGrammarList() {
  return '<h1 class="page-t">' + T("grammar") + '</h1><ol class="glist">' + GR.map((g, i) => '<li><a href="#gr-' + g.id + '"><span class="mono num">' + String(i + 1).padStart(2, "0") + '</span><span><b>' + esc(g.t) + '</b><span class="bn" lang="bn">' + esc(g.tb) + "</span></span>" + (S.gdone[g.id] ? '<span class="done-mark">' + I.check + "</span>" : "") + "</a></li>").join("") + "</ol>";
}
function vGrammar(id) {
  const g = GRM[id];
  if (!g) return vGrammarList();
  let h = backLink("#grammar", T("grammar")) + '<p class="eyebrow mono">GRAMMAR · ' + id.slice(1).padStart(2, "0") + '</p><h1 class="page-t">' + esc(g.t) + '</h1><p class="bn lead" lang="bn">' + esc(g.tb) + '</p><p class="bn" lang="bn">' + esc(g.intro) + "</p>";
  h += '<h2 class="sec">' + T("formula") + '</h2><div class="formulas">' + g.forms.map((f) => '<div class="formula"><code>' + esc(f[0]) + '</code><span class="bn" lang="bn">' + esc(f[1]) + "</span></div>").join("") + "</div>";
  h += '<h2 class="sec">' + T("examples") + '</h2><div class="lines">' + g.ex.map((x) => '<div class="line"><p class="en" lang="en">' + esc(x.en) + '</p><p class="bn" lang="bn">' + esc(x.bn) + "</p>" + acts(x.en, x.bn, id, isSaved(x.en)) + "</div>").join("") + "</div>";
  h += '<div class="tip"><span class="lab">' + T("tip") + '</span><p class="bn" lang="bn">' + esc(g.tip) + "</p></div>";
  mkQuiz("gr:" + id, g.qz);
  h += '<h2 class="sec">' + T("quiz") + "</h2>" + quizHTML("gr:" + id);
  return h;
}
function vPlan() {
  const daysDone = PLAN.filter((x) => dayComplete(x.d)).length;
  const scores = Object.values(S.tests);
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const nd = nextDay();
  let h = '<h1 class="page-t">' + T("plan") + '</h1><section class="stats"><div><b>' + daysDone + "/30</b><span>" + T("daysDone") + "</span></div><div><b>" + streak() + "</b><span>" + T("streak") + "</span></div><div><b>" + avg + "%</b><span>" + T("avgScore") + "</span></div></section>";
  h += '<p class="eyebrow mono">' + T("activity") + '</p><div class="act14">';
  const d = new Date(); d.setDate(d.getDate() - 13);
  for (let i = 0; i < 14; i++) { const k = fmtDate(d); const n = S.act[k] || 0; h += '<span class="a' + (n === 0 ? 0 : n < 4 ? 1 : n < 10 ? 2 : 3) + '" title="' + k + ": " + n + '"></span>'; d.setDate(d.getDate() + 1); }
  h += '</div><div class="daygrid">';
  for (const p of PLAN) {
    const c = dayDoneCount(p.d);
    const cls = c === 6 ? "full" : c > 0 ? "part" : "";
    h += '<a class="dcell ' + cls + (p.d === nd ? " next" : "") + '" href="#day-' + p.d + '"><span class="mono">' + String(p.d).padStart(2, "0") + '</span><span class="dt">' + esc(SCM[p.s].t) + '</span><span class="dmeter"><span style="width:' + (c / 6) * 100 + '%"></span></span></a>';
  }
  return h + "</div>";
}
function vDay(n) {
  const p = PLAN[n - 1];
  if (!p) return vPlan();
  const s = SCM[p.s], g = GRM[p.g], st = dayState(n);
  const you = s.conv.filter((l) => l.sp === "Y");
  const sents = you.concat(s.alt.map((a) => ({ en: a.pro, bn: a.bn }))).slice(0, 5);
  const box = (k, body) => '<section class="task' + (st[k] ? " is-done" : "") + '"><header><span class="tick">' + (st[k] ? I.check : "") + "</span><h2>" + T("t_" + k) + "</h2></header>" + body + "</section>";
  let h = backLink("#plan", T("plan")) + '<p class="eyebrow mono">DAY ' + String(n).padStart(2, "0") + " / 30 · " + lvlName(s.lvl) + '</p><h1 class="page-t">' + esc(s.t) + '</h1><p class="bn lead" lang="bn">' + esc(s.tb) + "</p>";
  h += box("vocab", '<ul class="vocab">' + s.voc.map((v) => '<li><div><p class="en" lang="en">' + esc(v.en) + '</p><p class="bn" lang="bn">' + esc(v.bn) + "</p></div>" + acts(v.en, v.bn, s.id, isSaved(v.en)) + "</li>").join("") + "</ul>" + (st.vocab ? "" : '<button class="btn primary sm" data-act="dayTask" data-d="' + n + '" data-k="vocab">' + T("learnedThese") + "</button>"));
  h += box("sent", '<div class="lines">' + sents.map((l) => '<div class="line you"><p class="en" lang="en">' + esc(l.en) + '</p><p class="bn" lang="bn">' + esc(l.bn) + "</p>" + acts(l.en, l.bn, s.id, isSaved(l.en)) + "</div>").join("") + "</div>" + (st.sent ? "" : '<button class="btn primary sm" data-act="dayTask" data-d="' + n + '" data-k="sent">' + T("learnedThese") + "</button>"));
  h += box("conv", '<p class="bn" lang="bn">' + esc(s.sit) + '</p><div class="row"><a class="btn sm" href="#sc-' + s.id + '" data-act="openConv">' + T("openConv") + "</a>" + (st.conv ? "" : '<button class="btn primary sm" data-act="dayTask" data-d="' + n + '" data-k="conv">' + T("done") + "</button>") + "</div>");
  h += box("gram", '<p><b>' + esc(g.t) + '</b> — <span class="bn" lang="bn">' + esc(g.tb) + '</span></p><div class="row"><a class="btn sm" href="#gr-' + g.id + '">' + T("openLesson") + "</a>" + (st.gram ? "" : '<button class="btn primary sm" data-act="dayTask" data-d="' + n + '" data-k="gram">' + T("done") + "</button>") + "</div>");
  const running = timer.day === n && timer.end > Date.now();
  h += box("speak", '<p class="muted bn" lang="bn">' + T("sayAloud") + '</p><div class="timer"><span class="mono" id="timer">' + (running ? fmtLeft(timer.end - Date.now()) : "05:00") + "</span>" + (running || st.speak ? "" : '<button class="btn primary sm" data-act="timer" data-d="' + n + '">' + T("startTimer") + "</button>") + "</div>" + sents.map((l, i) => speakBox("dsp-" + n + "-" + i, l.en, l.bn)).join(""));
  const qk = "day:" + n;
  if (!QZ[qk]) mkQuiz(qk, shuffle(autoQs(s, 3, 3).concat(pick(g.qz, 2))));
  h += box("quiz", (st.quiz ? '<p class="result ok">' + T("score") + ": " + st.quiz + "%</p>" : "") + quizHTML(qk));
  if (n < 30) h += '<a class="next" href="#day-' + (n + 1) + '"><span class="muted">' + T("recommended") + "</span>Day " + (n + 1) + " · " + esc(SCM[PLAN[n].s].t) + " →</a>";
  return h;
}
const fmtLeft = (ms) => { const t = Math.max(0, Math.ceil(ms / 1000)); return String(Math.floor(t / 60)).padStart(2, "0") + ":" + String(t % 60).padStart(2, "0"); };
function vSaved() {
  let h = '<h1 class="page-t">' + T("saved") + "</h1>";
  if (!S.saved.length) return h + '<p class="empty bn" lang="bn">' + T("noSaved") + "</p>";
  h += '<div class="row"><button class="btn sm ghost" data-act="hideEn">' + (hideEn ? T("showEn") : T("hideEn")) + '</button><button class="btn sm" data-act="playSaved">' + I.speaker + T("playAll") + "</button></div>";
  h += '<div class="lines' + (hideEn ? " quizmode" : "") + '">' + S.saved.slice().reverse().map((x) => '<div class="line"><p class="en" lang="en" tabindex="0">' + esc(x.en) + '</p><p class="bn" lang="bn">' + esc(x.bn) + "</p>" + acts(x.en, x.bn, x.src, true) + "</div>").join("") + "</div>";
  return h;
}
function vSearch() {
  const q = (BIND.q || "").trim();
  let h = '<h1 class="page-t">' + T("search") + '</h1><input id="q" class="search" type="search" data-bind="q" data-live="1" value="' + esc(q) + '" placeholder="' + esc(T("searchPh")) + '" autocomplete="off">';
  h += '<div id="results">' + searchResults(q) + "</div>";
  return h;
}
function searchResults(q) {
  if (q.length < 2) return "";
  const ql = q.toLowerCase();
  const m = (t) => String(t).toLowerCase().includes(ql);
  const scHits = SC.filter((s) => m(s.t) || m(s.tb) || m(s.sit));
  const lineHits = [];
  SC.forEach((s) => s.conv.forEach((l) => { if (m(l.en) || m(l.bn)) lineHits.push({ l, s }); }));
  const vocHits = [];
  SC.forEach((s) => s.voc.forEach((v) => { if ((m(v.en) || m(v.bn)) && !vocHits.some((x) => x.v.en === v.en)) vocHits.push({ v, s }); }));
  const grHits = GR.filter((g) => m(g.t) || m(g.tb) || m(g.intro) || g.ex.some((x) => m(x.en) || m(x.bn)));
  if (!scHits.length && !lineHits.length && !vocHits.length && !grHits.length) return '<p class="empty">' + T("noResults") + "</p>";
  let h = "";
  if (scHits.length) h += '<h2 class="sec">' + T("learn") + '</h2><div class="sc-grid">' + scHits.slice(0, 8).map(scCard).join("") + "</div>";
  if (vocHits.length) h += '<h2 class="sec">' + T("vocab") + '</h2><ul class="vocab">' + vocHits.slice(0, 12).map(({ v, s }) => '<li><div><p class="en" lang="en">' + esc(v.en) + '</p><p class="bn" lang="bn">' + esc(v.bn) + ' · <a href="#sc-' + s.id + '">' + esc(s.t) + "</a></p></div>" + acts(v.en, v.bn, s.id, isSaved(v.en)) + "</li>").join("") + "</ul>";
  if (lineHits.length) h += '<h2 class="sec">' + T("conv") + '</h2><div class="lines">' + lineHits.slice(0, 12).map(({ l, s }) => lineHTML(l, s.id).replace('<div class="who">', '<div class="who"><a href="#sc-' + s.id + '">' + esc(s.t) + "</a> · ")).join("") + "</div>";
  if (grHits.length) h += '<h2 class="sec">' + T("grammar") + '</h2><ol class="glist">' + grHits.map((g) => '<li><a href="#gr-' + g.id + '"><span class="mono num">' + g.id.slice(1).padStart(2, "0") + "</span><span><b>" + esc(g.t) + '</b><span class="bn" lang="bn">' + esc(g.tb) + "</span></span></a></li>").join("") + "</ol>";
  return h;
}

/* ---------------- AI practice view ---------------- */
const ROLES = { S: "Supervisor", Q: "QC Inspector", E: "Engineer", SO: "Safety Officer" };
function vPractice() {
  if (chat.level == null) chat.level = S.ai.level || 1;
  const offline = sampleState !== "online" || chat.offline;
  let h = '<h1 class="page-t">' + T("practice") + '</h1><p class="badge-line"><span id="ai-badge" data-mode="' + (offline ? "offline" : sampleState) + '">' + (offline ? T("aiOffline") : T("aiOnline") + " · " + providerName()) + "</span></p>" + (offline && !sampleFn ? geminiHTML(true) : provider === "gemini" ? '<details class="gem-wrap"' + (gemStatus ? " open" : "") + "><summary>" + (S.lang === "en" ? "Gemini settings" : "Gemini সেটিংস") + "</summary>" + geminiHTML(false) + "</details>" : "");
  h += '<div class="ai-setup"><label for="ai-role">' + T("role") + '</label><select id="ai-role" data-act-change="role">' + Object.entries(ROLES).map(([k, v]) => '<option value="' + k + '"' + (chat.role === k ? " selected" : "") + ">" + v + " · " + SPK[k][1] + "</option>").join("") + "</select>";
  h += '<label for="ai-topic">' + T("topic") + '</label><select id="ai-topic" data-act-change="topic">' + (offline ? "" : '<option value="free"' + (chat.topic === "free" ? " selected" : "") + ">" + T("freeTopic") + "</option>") + CATS.map((c) => '<optgroup label="' + esc(c.id + " · " + c.t) + '">' + SC.filter((s) => s.cat === c.id).map((s) => '<option value="' + s.id + '"' + (chat.topic === s.id ? " selected" : "") + ">" + esc(s.t) + "</option>").join("") + "</optgroup>").join("") + "</select>";
  h += '<span class="lab">' + T("level") + '</span><div class="seg">' + [1, 2, 3].map((l) => '<button class="' + (chat.level === l ? "on" : "") + '" data-act="aiLevel" data-v="' + l + '">' + lvlName(l) + "</button>").join("") + "</div></div>";
  h += '<div class="chat" id="chat">';
  if (!chat.msgs.length) h += '<p class="empty bn" lang="bn">' + (S.lang === "en" ? "Choose who you want to talk to and a topic, then press Start. Reply in English — you will get corrections and a better way to say it, explained in Bangla." : "কার সাথে কথা বলবেন ও বিষয় বেছে নিয়ে “শুরু করুন” চাপুন। ইংরেজিতে উত্তর দিন — আপনার ভুল সংশোধন, আরও ভালো বাক্য এবং বাংলা ব্যাখ্যা পাবেন।") + "</p>";
  for (const m of chat.msgs) h += msgHTML(m);
  if (chat.busy) h += '<div class="msg ai"><p class="muted">' + T("thinking") + '</p><button class="btn sm ghost" data-act="aiStop">' + T("stop") + "</button></div>";
  h += "</div>";
  if (chat.okRun >= 5 && chat.level < 3) h += '<div class="levelup"><span class="bn" lang="bn">' + (S.lang === "en" ? "5 good answers in a row." : "পরপর ৫টি ভালো উত্তর!") + '</span><button class="btn sm primary" data-act="aiLevel" data-v="' + (chat.level + 1) + '">' + T("levelUp") + "</button></div>";
  if (!chat.msgs.length) h += '<button class="btn primary" data-act="aiStart">' + T("start") + "</button>";
  else h += '<div class="composer"><textarea id="ai-in" data-bind="ai-in" rows="2" placeholder="' + esc(T("typeOrSpeak")) + '" lang="en">' + esc(BIND["ai-in"] || "") + '</textarea><button class="icon-btn mic" data-act="mic" data-target="ai-in" aria-label="Mic">' + I.mic + '</button><button class="icon-btn send" data-act="aiSend" aria-label="' + T("send") + '"' + (chat.busy ? " disabled" : "") + ">" + I.send + '</button></div><button class="btn sm ghost" data-act="aiReset">' + T("newChat") + "</button>";
  return h;
}
function msgHTML(m) {
  if (m.who === "me") return '<div class="msg me"><p lang="en">' + esc(m.text) + "</p></div>" + (m.fb ? fbHTML(m.fb) : "");
  if (m.who === "sys") return '<p class="muted sys">' + esc(m.text) + "</p>";
  let h = '<div class="msg ai"><div class="who">' + esc(ROLES[chat.role]) + '</div><p class="en" lang="en">' + esc(m.text) + ' <button class="icon-btn inline" data-act="say" data-t="' + esc(m.text) + '" aria-label="Listen">' + I.speaker + "</button></p>";
  if (m.bn) h += '<p class="bn" lang="bn">' + esc(m.bn) + "</p>";
  if (m.hint || m.sample) h += '<details><summary>' + T("hint") + "</summary>" + (m.hint ? '<p class="bn" lang="bn">' + esc(m.hint) + "</p>" : "") + (m.sample ? '<p class="en" lang="en"><span class="lab">' + T("sample") + "</span>" + esc(m.sample) + "</p>" : "") + "</details>";
  return h + "</div>";
}
function aiRules() {
  const lv = { 1: "Beginner: use very simple words and short sentences (max 10 words). Ask easy yes/no or what/where questions.", 2: "Intermediate: normal site English, ask for details like numbers, reasons and next steps.", 3: "Professional: technical follow-up questions, ask for opinions, explanations and professional reporting." }[chat.level];
  const s = SCM[chat.topic];
  const topic = s ? "Topic: " + s.t + ". Situation (in Bangla): " + s.sit + "\nExample lines from this situation:\n" + s.conv.slice(0, 6).map((l) => (SPK[l.sp] ? SPK[l.sp][0] : l.sp) + ": " + l.en).join("\n") : "Topic: any realistic daily situation on a mechanical fabrication / maintenance site (progress, materials, welding, inspection, safety, problems). Change the situation every few turns.";
  return "You are role-playing as a " + ROLES[chat.role] + " on an industrial mechanical fabrication and maintenance site in Saudi Arabia. You are talking to a Bangladeshi worker (fitter/technician) who is learning practical spoken English. Their level: " + lv + "\n" + topic +
    "\n\nRules:\n- Stay in your role. Speak natural, simple site English. At most 2 short sentences per reply.\n- Each reply must end with ONE question or instruction the worker has to answer.\n- When the worker answers, evaluate their English: grammar, word order, missing words, politeness. Keep their meaning.\n- If their answer is in Bangla, set ok=false, put the English version in corrected and encourage them to try in English.\n- Gradually make questions a little harder when answers are good.\n\nReply with ONLY a JSON object, no other text:\n" +
    '{"feedback": null or {"ok": true|false, "corrected": "their sentence with errors fixed (same meaning)", "better": "a more natural professional way to say it", "explain_bn": "1-3 short sentences in simple Bangla explaining the mistake and the rule; if ok, short praise in Bangla"}, "reply": "your next line in role, English", "reply_bn": "Bangla translation of reply", "hint_bn": "short Bangla hint on how to answer", "sample_answer": "one simple model answer in English"}' +
    "\nOn the very first turn, feedback must be null.";
}
async function aiCall() {
  chat.busy = true; render();
  const ctl = new AbortController(); chat.ctl = ctl;
  const turns = [{ role: "user", content: aiRules() + "\n\nStart the conversation now with your first line." }].concat(chat.turns.slice(-14));
  try {
    const r = await aiJSON(turns, ctl.signal);
    if (!r || typeof r.reply !== "string") throw { code: "invalid_json" };
    chat.turns.push({ role: "assistant", content: JSON.stringify(r) });
    const last = chat.msgs[chat.msgs.length - 1];
    if (r.feedback && last && last.who === "me") {
      last.fb = { ok: !!r.feedback.ok, corrected: String(r.feedback.corrected || ""), better: String(r.feedback.better || ""), explain_bn: String(r.feedback.explain_bn || "") };
      S.ai.total++; if (r.feedback.ok) { S.ai.good++; chat.okRun++; } else chat.okRun = 0;
      bump(); save();
    }
    chat.msgs.push({ who: "ai", text: r.reply, bn: String(r.reply_bn || ""), hint: String(r.hint_bn || ""), sample: String(r.sample_answer || "") });
    speakNow(r.reply);
  } catch (e) {
    const c = (e && e.code) || "upstream_error";
    if (c !== "cancelled") {
      if (PERMANENT.includes(c) && provider === "claude") { sampleFn = null; pickProvider(); chat.offline = !provider; }
      if (PERMANENT.includes(c) && !provider) { sampleState = "offline"; chat.offline = true; resetChat(); chat.msgs.push({ who: "sys", text: aiErrorText(c) }); offlineAsk(); }
      else chat.msgs.push({ who: "sys", text: aiErrorText(c) });
    }
  }
  chat.busy = false; chat.ctl = null; render(); scrollChat();
}
function resetChat() { chat.turns = []; chat.msgs = []; chat.okRun = 0; chat.step = 0; BIND["ai-in"] = ""; }
function offlineScenario() { if (!SCM[chat.topic]) chat.topic = SC.find((s) => s.lvl <= chat.level).id; return SCM[chat.topic]; }
function offlinePairs(s) { const out = []; s.conv.forEach((l, i) => { if (l.sp === "Y") { const prev = s.conv.slice(0, i).reverse().find((x) => x.sp !== "Y"); out.push({ ask: prev || { en: "Tell me about the job.", bn: "কাজ সম্পর্কে বলো।" }, ans: l }); } }); return out; }
function offlineAsk() {
  const s = offlineScenario(); const pairs = offlinePairs(s);
  if (chat.step >= pairs.length) { chat.msgs.push({ who: "sys", text: S.lang === "en" ? "Scenario finished. Pick another topic or start again." : "এই সিনারিও শেষ। অন্য বিষয় বেছে নিন বা আবার শুরু করুন।" }); return; }
  const p = pairs[chat.step];
  chat.msgs.push({ who: "ai", text: p.ask.en, bn: p.ask.bn, hint: (S.lang === "en" ? "Say this in English: " : "ইংরেজিতে বলুন: ") + p.ans.bn, sample: p.ans.en });
  speakNow(p.ask.en);
}
function offlineAnswer(text) {
  const s = offlineScenario(); const p = offlinePairs(s)[chat.step];
  const cmp = compare(text, p.ans.en); const hints = grammarHints(text);
  const ok = cmp.score >= 75 && !hints.length && !hasBangla(text);
  const last = chat.msgs[chat.msgs.length - 1];
  last.fb = { ok, corrected: ok ? "" : p.ans.en, better: (s.alt.find((a) => a.pro && cmp.score >= 75) || {}).pro || "", explain_bn: hasBangla(text) ? "ইংরেজিতে চেষ্টা করুন। নমুনা বাক্যটি দেখে আবার বলুন।" : (hints.length ? hints.join(" ") : ok ? "চমৎকার! বাক্যটি সঠিক ও পরিষ্কার।" : "মিল " + cmp.score + "%। সংশোধিত বাক্যটি শুনে আবার বলার চেষ্টা করুন।") };
  if (ok) chat.okRun++; else chat.okRun = 0;
  S.ai.total++; if (ok) S.ai.good++; bump(); save();
  chat.step++; offlineAsk();
}
function scrollChat() { const c = document.getElementById("chat"); if (c) { const last = c.lastElementChild; if (last) last.scrollIntoView({ block: "nearest", behavior: "smooth" }); } }

/* ---------------- Router ---------------- */
function currentRoute() { const h = (location.hash || "#home").slice(1); const i = h.indexOf("-"); return i < 0 ? [h, ""] : [h.slice(0, i), h.slice(i + 1)]; }
let lastHash = "";
function render() {
  const [v, arg] = currentRoute();
  const app = document.getElementById("app");
  let html;
  switch (v) {
    case "learn": html = vLearn(); break;
    case "cat": html = vCat(arg); break;
    case "sc": html = vScenario(arg); break;
    case "practice": html = vPractice(); break;
    case "grammar": html = vGrammarList(); break;
    case "gr": html = vGrammar(arg); break;
    case "plan": html = vPlan(); break;
    case "day": html = vDay(+arg); break;
    case "saved": html = vSaved(); break;
    case "search": html = vSearch(); break;
    default: html = vHome();
  }
  const y = window.scrollY;
  app.innerHTML = html;
  document.documentElement.classList.toggle("hide-bn", !!S.hideBn);
  document.documentElement.lang = S.lang === "en" ? "en" : "bn";
  const navKey = { learn: "learn", cat: "learn", sc: "learn", grammar: "learn", gr: "learn", practice: "practice", plan: "plan", day: "plan", saved: "saved", search: "search" }[v] || "home";
  document.querySelectorAll("[data-nav]").forEach((a) => { const on = a.dataset.nav === navKey; a.classList.toggle("on", on); if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); const l = a.querySelector(".nl"); if (l) l.textContent = T(a.dataset.nav); });
  if (location.hash !== lastHash) { window.scrollTo(0, 0); lastHash = location.hash; } else window.scrollTo(0, y);
  refreshAIBadge();
}
window.addEventListener("hashchange", () => { scTab = "conv"; hideEn = false; resetAsk = false; render(); });

/* ---------------- Events ---------------- */
const ACT = {
  say: (el) => speakNow(el.dataset.t),
  save: (el) => {
    const en = el.dataset.en;
    if (isSaved(en)) { S.saved = S.saved.filter((x) => x.en !== en); toast(T("removed")); }
    else { S.saved.push({ en, bn: el.dataset.bn, src: el.dataset.src, at: Date.now() }); toast(T("savedT")); bump(); }
    save(); render();
  },
  tab: (el) => { scTab = el.dataset.v; render(); },
  toggleBn: () => { S.hideBn = !S.hideBn; save(); render(); },
  playAll: (el) => speakSeq(SCM[el.dataset.id].conv.map((l) => l.en)),
  playSaved: () => speakSeq(S.saved.slice().reverse().map((x) => x.en)),
  markDone: (el) => { S.done[el.dataset.id] = todayKey(); bump(); save(); render(); },
  ans: (el) => { const st = QZ[el.dataset.k]; if (!st || st.submitted) return; st.ans[+el.dataset.i] = +el.dataset.o; render(); },
  submitQuiz: (el) => { const st = QZ[el.dataset.k]; st.submitted = true; onQuizSubmitted(el.dataset.k); render(); },
  retryQuiz: (el) => { const k = el.dataset.k; const [kind, id] = k.split(":"); delete QZ[k];
    if (kind === "sc") { const s = SCM[id]; mkQuiz(k, shuffle(s.qz.concat(autoQs(s, 2, 3)))); }
    if (kind === "day") { const p = PLAN[+id - 1]; mkQuiz(k, shuffle(autoQs(SCM[p.s], 3, 3).concat(pick(GRM[p.g].qz, 2)))); }
    render(); },
  mic: (el) => listen(el.dataset.target),
  spkCheck: (el) => { const id = el.dataset.id; const box = document.getElementById(id); const text = (box && box.value) || ""; BIND[id] = text; if (!text.trim()) { box && box.focus(); return; } SPK_RES[id] = Object.assign({}, SPK_RES[id], { cmp: compare(text, el.dataset.t), hints: grammarHints(text), ai: null }); bump(); save(); render(); },
  spkShow: (el) => { const id = el.dataset.id; SPK_RES[id] = Object.assign({}, SPK_RES[id], { show: true }); render(); },
  spkAI: async (el) => {
    const id = el.dataset.id; const box = document.getElementById(id); const text = (box && box.value) || ""; BIND[id] = text;
    if (!text.trim() || !provider) { box && box.focus(); return; }
    SPK_RES[id] = Object.assign({}, SPK_RES[id], { ai: "wait" }); render();
    try {
      const r = await aiJSON('A Bangladeshi worker on a mechanical fabrication site is practising spoken English.\nTarget sentence: "' + el.dataset.t + '"\nMeaning in Bangla: ' + el.dataset.bn + '\nThe worker said: "' + text + '"\nJudge whether the worker\'s sentence is correct, natural English with the same meaning (it does not need to match word for word). Reply with only JSON: {"ok": true|false, "corrected": "their sentence corrected", "better": "a natural professional version", "explain_bn": "1-3 short sentences in simple Bangla about the mistake and the rule, or short praise"}');
      SPK_RES[id].ai = { ok: !!r.ok, corrected: String(r.corrected || ""), better: String(r.better || ""), explain_bn: String(r.explain_bn || "") };
    } catch (e) { SPK_RES[id].ai = { err: aiErrorText(e && e.code) }; if (e && PERMANENT.includes(e.code) && provider === "claude") { sampleFn = null; pickProvider(); } }
    render();
  },
  dayTask: (el) => { setDayTask(+el.dataset.d, el.dataset.k); render(); },
  openConv: () => { scTab = "conv"; },
  timer: (el) => {
    const d = +el.dataset.d; clearInterval(timer.iv);
    timer = { day: d, end: Date.now() + 5 * 60 * 1000, iv: null };
    timer.iv = setInterval(() => {
      const left = timer.end - Date.now(); const t = document.getElementById("timer");
      if (t) t.textContent = fmtLeft(left);
      if (left <= 0) { clearInterval(timer.iv); timer.day = null; setDayTask(d, "speak"); toast(T("timerDone")); if (currentRoute()[0] === "day") render(); }
    }, 500);
    render();
  },
  hideEn: () => { hideEn = !hideEn; render(); },
  lang: (el) => { S.lang = el.dataset.v; save(); render(); },
  resetAsk: () => { resetAsk = true; render(); },
  resetNo: () => { resetAsk = false; render(); },
  resetYes: () => { const keep = { lang: S.lang, rate: S.rate }; S = Object.assign(blank(), keep); resetAsk = false; Object.keys(QZ).forEach((k) => delete QZ[k]); save(); if (dbRef) flush(); render(); },
  gemSave: () => {
    const k = (document.getElementById("gem-key") || {}).value || ""; const m = (document.getElementById("gem-model") || {}).value || GEM_MODELS[0];
    const g = loadGem(); if (k.trim()) g.key = k.trim(); g.model = m; saveGem(g); pickProvider();
    gemStatus = g.key ? (S.lang === "en" ? "Saved. Tap Test to check it works." : "সংরক্ষিত হয়েছে। কাজ করছে কিনা দেখতে “পরীক্ষা” চাপুন।") : (S.lang === "en" ? "Paste your API key first." : "আগে API key পেস্ট করুন।");
    if (provider) { chat.offline = false; resetChat(); } render();
  },
  gemTest: async () => {
    const m = (document.getElementById("gem-model") || {}).value; if (m) { const g = loadGem(); g.model = m; saveGem(g); }
    pickProvider(); gemStatus = T("thinking"); render();
    try { const r = await geminiJSON('Reply with only this JSON: {"ok": true, "reply": "Good morning. Are you ready?"}'); gemStatus = (S.lang === "en" ? "Working. Gemini says: " : "কাজ করছে। Gemini বলছে: ") + (r.reply || "OK"); }
    catch (e) { gemStatus = aiErrorText(e && e.code) + (e && e.message ? " (" + e.message.slice(0, 120) + ")" : ""); }
    render();
  },
  gemClear: () => { saveGem({ key: "", model: loadGem().model }); pickProvider(); gemStatus = ""; chat.offline = true; resetChat(); render(); },
  aiLevel: (el) => { chat.level = +el.dataset.v; S.ai.level = chat.level; chat.okRun = 0; save(); render(); },
  aiStart: () => { resetChat(); chat.offline = sampleState !== "online"; if (chat.offline) { offlineAsk(); render(); } else aiCall(); },
  aiSend: () => {
    const box = document.getElementById("ai-in"); const text = ((box && box.value) || "").trim();
    if (!text || chat.busy) return;
    chat.msgs.push({ who: "me", text }); BIND["ai-in"] = "";
    if (chat.offline || sampleState !== "online") { offlineAnswer(text); render(); scrollChat(); return; }
    chat.turns.push({ role: "user", content: "Worker: " + text });
    aiCall();
  },
  aiStop: () => { if (chat.ctl) chat.ctl.abort(); },
  aiReset: () => { if (chat.ctl) chat.ctl.abort(); resetChat(); render(); },
};
document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-act]");
  if (!el || el.disabled) return;
  const f = ACT[el.dataset.act];
  if (f) { if (el.tagName !== "A") e.preventDefault(); f(el, e); }
  const reveal = e.target.closest(".quizmode .en");
  if (reveal) reveal.classList.toggle("show");
});
document.addEventListener("input", (e) => {
  const t = e.target;
  if (t.dataset && t.dataset.bind) {
    BIND[t.dataset.bind] = t.value;
    if (t.dataset.live) { const r = document.getElementById("results"); if (r) r.innerHTML = searchResults(t.value.trim()); }
  }
  if (t.dataset && t.dataset.actInput === "rate") { S.rate = +t.value; const v = document.getElementById("rate-v"); if (v) v.textContent = S.rate.toFixed(2) + "×"; save(); }
});
document.addEventListener("change", (e) => {
  const t = e.target;
  if (t.dataset.actChange === "role") { chat.role = t.value; if (chat.ctl) chat.ctl.abort(); resetChat(); render(); }
  if (t.dataset.actChange === "topic") { chat.topic = t.value; if (chat.ctl) chat.ctl.abort(); resetChat(); render(); }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey && e.target.id === "ai-in") { e.preventDefault(); ACT.aiSend(); }
});

render();
initAI().then(() => { if (currentRoute()[0] === "practice" || currentRoute()[0] === "sc" || currentRoute()[0] === "day") render(); });
initCloud();
})();
