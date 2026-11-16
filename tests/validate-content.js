/*
 * Content validator for Jago English data packs.
 * Usage: node tests/validate-content.js [vocab|topics|translate|all]
 * Exits non-zero on the first schema, duplicate, dash, or slop violation so
 * content authors get a precise pointer to the broken record.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const mode = process.argv[2] || "all";
const errors = [];

const BANNED_DASH = /[\u2013\u2014]/;
const SLOP = /\b(delve|delves|delving|tapestry|testament to|game-changer|game changer|unleash|meticulously|seamless|seamlessly|cutting-edge|paramount|pivotal|foster|garner|bustling|vibrant|nestled|in today's fast-paced world|unlock the power)\b/i;
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

function load(file) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) return null;
  const src = fs.readFileSync(full, "utf8");
  if (BANNED_DASH.test(src)) {
    const idx = src.search(BANNED_DASH);
    const line = src.slice(0, idx).split("\n").length;
    errors.push(file + ": em/en dash found on line " + line + " (use a hyphen or the word 'sampai')");
  }
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  try {
    vm.runInContext(src, sandbox, { filename: file });
  } catch (e) {
    errors.push(file + ": JavaScript error: " + e.message);
    return null;
  }
  return sandbox.window;
}

function str(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function checkSlop(label, text) {
  if (SLOP.test(text)) errors.push(label + ": AI-slop word found -> \"" + text.match(SLOP)[0] + "\"");
}

function walkStrings(obj, label) {
  if (typeof obj === "string") checkSlop(label, obj);
  else if (Array.isArray(obj)) obj.forEach((v, i) => walkStrings(v, label + "[" + i + "]"));
  else if (obj && typeof obj === "object") Object.keys(obj).forEach((k) => walkStrings(obj[k], label + "." + k));
}

function validateVocab() {
  const files = ["vocab-bank-1.js", "vocab-bank-2.js"];
  const all = [];
  files.forEach((f) => {
    const w = load(f);
    if (!w) return;
    const bank = w.JAGO_VOCAB_BANK;
    if (!Array.isArray(bank)) {
      errors.push(f + ": window.JAGO_VOCAB_BANK is not an array");
      return;
    }
    bank.forEach((c) => all.push({ file: f, card: c }));
  });
  const ids = new Set();
  const terms = new Set();
  const perCat = {};
  all.forEach(({ file, card }, i) => {
    const label = file + " card #" + i + " (" + (card && card.id) + ")";
    ["id", "level", "category", "term", "ipa", "partOfSpeech", "meaningId", "definitionEn", "exampleEn", "exampleId"].forEach((k) => {
      if (!str(card[k])) errors.push(label + ": missing field " + k);
    });
    if (card.level && LEVELS.indexOf(card.level) === -1) errors.push(label + ": invalid level " + card.level);
    if (card.ipa && !/^\/.+\/$/.test(card.ipa)) errors.push(label + ": ipa must be wrapped in slashes");
    if (!Array.isArray(card.collocations) || card.collocations.length < 3) errors.push(label + ": needs at least 3 collocations");
    if (ids.has(card.id)) errors.push(label + ": duplicate id");
    ids.add(card.id);
    const t = String(card.term || "").toLowerCase();
    if (terms.has(t)) errors.push(label + ": duplicate term " + t);
    terms.add(t);
    if (card.exampleEn && card.term && card.exampleEn.toLowerCase().indexOf(card.term.toLowerCase().split(" ")[0].slice(0, 4)) === -1) {
      errors.push(label + ": exampleEn should contain the term (or its stem)");
    }
    perCat[card.category] = (perCat[card.category] || 0) + 1;
    walkStrings(card, label);
  });
  console.log("vocab cards: " + all.length + " | categories: " + JSON.stringify(perCat));
  return all.length;
}

function validateTopics() {
  const files = ["topics-data-1.js", "topics-data-2.js"];
  const all = [];
  files.forEach((f) => {
    const w = load(f);
    if (!w) return;
    const list = w.JAGO_TOPICS;
    if (!Array.isArray(list)) {
      errors.push(f + ": window.JAGO_TOPICS is not an array");
      return;
    }
    list.forEach((t) => all.push({ file: f, topic: t }));
  });
  const ids = new Set();
  all.forEach(({ file, topic: t }, i) => {
    const label = file + " topic #" + i + " (" + (t && t.id) + ")";
    ["id", "title", "titleId", "category", "cefr", "hook", "modelAnswer", "modelAnswerId", "writingTask2", "toeflInterview", "practiceStarter"].forEach((k) => {
      if (!str(t[k])) errors.push(label + ": missing field " + k);
    });
    if (typeof t.no !== "number") errors.push(label + ": no must be a number");
    if (!Array.isArray(t.vocab) || t.vocab.length < 8) errors.push(label + ": vocab needs >= 8 items");
    (t.vocab || []).forEach((v, j) => {
      if (!str(v.term) || !str(v.meaningId) || !str(v.example)) errors.push(label + ": vocab[" + j + "] needs term, meaningId, example");
    });
    if (!Array.isArray(t.collocations) || t.collocations.length < 6) errors.push(label + ": collocations needs >= 6 items");
    (t.collocations || []).forEach((v, j) => {
      if (!str(v.phrase) || !str(v.meaningId)) errors.push(label + ": collocations[" + j + "] needs phrase, meaningId");
    });
    if (!Array.isArray(t.ieltsPart1) || t.ieltsPart1.length < 3) errors.push(label + ": ieltsPart1 needs >= 3 questions");
    if (!t.ieltsPart2 || !str(t.ieltsPart2.cue) || !Array.isArray(t.ieltsPart2.points) || t.ieltsPart2.points.length < 3) errors.push(label + ": ieltsPart2 needs cue + >= 3 points");
    if (!Array.isArray(t.ieltsPart3) || t.ieltsPart3.length < 3) errors.push(label + ": ieltsPart3 needs >= 3 questions");
    if (!Array.isArray(t.structure) || t.structure.length < 4) errors.push(label + ": structure needs >= 4 steps");
    if (!t.toeflDiscussion || !str(t.toeflDiscussion.professor) || !str(t.toeflDiscussion.studentA) || !str(t.toeflDiscussion.studentB)) errors.push(label + ": toeflDiscussion needs professor, studentA, studentB");
    if (!t.indoTrap || !str(t.indoTrap.wrong) || !str(t.indoTrap.right) || !str(t.indoTrap.why)) errors.push(label + ": indoTrap needs wrong, right, why");
    const words = String(t.modelAnswer || "").split(/\s+/).filter(Boolean).length;
    if (words < 110 || words > 220) errors.push(label + ": modelAnswer should be 110 to 220 words (has " + words + ")");
    if (ids.has(t.id)) errors.push(label + ": duplicate id");
    ids.add(t.id);
    walkStrings(t, label);
  });
  console.log("topics: " + all.length);
  return all.length;
}

function validateTranslate() {
  const w = load("translate-data.js");
  if (!w) return 0;
  const d = w.JAGO_TRANSLATE_DATA;
  if (!d || !Array.isArray(d.intents) || !Array.isArray(d.words)) {
    errors.push("translate-data.js: window.JAGO_TRANSLATE_DATA must have intents[] and words[]");
    return 0;
  }
  const ids = new Set();
  d.intents.forEach((it, i) => {
    const label = "intent #" + i + " (" + it.id + ")";
    ["id", "category", "indo", "tip"].forEach((k) => { if (!str(it[k])) errors.push(label + ": missing " + k); });
    if (!Array.isArray(it.triggers) || it.triggers.length < 2) errors.push(label + ": triggers needs >= 2 lowercase Indonesian phrases");
    (it.triggers || []).forEach((tr) => { if (tr !== String(tr).toLowerCase()) errors.push(label + ": trigger must be lowercase: " + tr); });
    if (!Array.isArray(it.ladder) || it.ladder.length < 4) errors.push(label + ": ladder needs >= 4 rungs");
    (it.ladder || []).forEach((r, j) => {
      if (LEVELS.indexOf(r.level) === -1 || !str(r.en) || !str(r.note)) errors.push(label + ": ladder[" + j + "] needs level, en, note");
    });
    if (!it.register || !str(it.register.formal) || !str(it.register.casual)) errors.push(label + ": register needs formal + casual");
    if (ids.has(it.id)) errors.push(label + ": duplicate id");
    ids.add(it.id);
    walkStrings(it, label);
  });
  const wset = new Set();
  d.words.forEach((wd, i) => {
    const label = "word #" + i + " (" + wd.id + ")";
    if (!str(wd.id) || wd.id !== wd.id.toLowerCase()) errors.push(label + ": id must be a lowercase Indonesian word or phrase");
    if (!Array.isArray(wd.options) || wd.options.length < 2) errors.push(label + ": options needs >= 2");
    (wd.options || []).forEach((o, j) => {
      if (!str(o.en) || !str(o.use) || !str(o.example)) errors.push(label + ": options[" + j + "] needs en, use, example");
    });
    if (wset.has(wd.id)) errors.push(label + ": duplicate word");
    wset.add(wd.id);
    walkStrings(wd, label);
  });
  console.log("translate intents: " + d.intents.length + " | words: " + d.words.length);
  return d.intents.length;
}

function validateConversation() {
  const w = load("conversation-data.js");
  if (!w) return 0;
  const d = w.JAGO_CONVERSATION_DATA;
  if (!d || !Array.isArray(d.scenarios) || !Array.isArray(d.replyTemplates)) {
    errors.push("conversation-data.js: window.JAGO_CONVERSATION_DATA must have scenarios[] and replyTemplates[]");
    return 0;
  }
  const ids = new Set();
  d.scenarios.forEach((sc, i) => {
    const label = "scenario #" + i + " (" + sc.id + ")";
    ["id", "category", "title", "subtitle", "situation", "culturalNote"].forEach((k) => {
      if (!str(sc[k])) errors.push(label + ": missing " + k);
    });
    if (typeof sc.no !== "number") errors.push(label + ": no must be number");
    ["mudah", "menengah", "advance"].forEach((tk) => {
      const td = sc.tiers && sc.tiers[tk];
      if (!td) {
        errors.push(label + ": missing tier " + tk);
        return;
      }
      if (!str(td.cefr) || !str(td.focus)) errors.push(label + "." + tk + ": missing cefr or focus");
      if (!Array.isArray(td.lines) || td.lines.length < 3) errors.push(label + "." + tk + ": needs >= 3 lines");
      (td.lines || []).forEach((ln, j) => {
        if (!str(ln.speaker) || !str(ln.en) || !str(ln.id)) errors.push(label + "." + tk + ".lines[" + j + "]: needs speaker, en, id");
      });
      if (!Array.isArray(td.keyPhrases) || td.keyPhrases.length < 3) errors.push(label + "." + tk + ": needs >= 3 keyPhrases");
      (td.keyPhrases || []).forEach((kp, j) => {
        if (!str(kp.en) || !str(kp.id)) errors.push(label + "." + tk + ".keyPhrases[" + j + "]: needs en, id");
      });
    });
    if (ids.has(sc.id)) errors.push(label + ": duplicate id");
    ids.add(sc.id);
    walkStrings(sc, label);
  });
  d.replyTemplates.forEach((rt, i) => {
    const label = "replyTemplate #" + i + " (" + rt.level + ")";
    ["level", "cefr", "title", "emailSubject", "emailBody", "waBody", "tip"].forEach((k) => {
      if (!str(rt[k])) errors.push(label + ": missing " + k);
    });
    walkStrings(rt, label);
  });
  console.log("conversation scenarios: " + d.scenarios.length + " (x3 tiers) | replyTemplates: " + d.replyTemplates.length);
  return d.scenarios.length;
}

if (mode === "vocab" || mode === "all") validateVocab();
if (mode === "topics" || mode === "all") validateTopics();
if (mode === "translate" || mode === "all") validateTranslate();
if (mode === "conversation" || mode === "all") validateConversation();

if (errors.length) {
  console.log("\n" + errors.length + " problem(s):");
  errors.slice(0, 80).forEach((e) => console.log(" - " + e));
  process.exit(1);
}
console.log("OK: content valid");

