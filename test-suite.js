const fs = require("fs");
const path = require("path");
const assert = require("assert");

const projectDir = __dirname;
const filesToScan = [
  "index.html",
  "styles.css",
  "curriculum-data.js",
  "vocab-bank-1.js",
  "vocab-bank-2.js",
  "translate-data.js",
  "topics-data-1.js",
  "topics-data-2.js",
  "conversation-data.js",
  "speech-engine.js",
  "ai-engine.js",
  "translate.js",
  "topics.js",
  "conversation.js",
  "app.js",
  "coach-data.js",
  "coach-core.js",
  "coach.js",
  "sw.js",
  "manifest.json",
  "server.js",
  "DESIGN.md",
  "CURRICULUM_A1_C2.md"
];

console.log("=== JAGO ENGLISH AUTOMATED VERIFICATION & CLICK-THROUGH SUITE ===");

// 1. Check R-02: Zero Em-Dashes (—) & Zero Truncation across all project files
filesToScan.forEach((file) => {
  const fullPath = path.join(projectDir, file);
  assert(fs.existsSync(fullPath), `Missing file: ${file}`);
  const content = fs.readFileSync(fullPath, "utf8");
  assert(
    !content.includes("—"),
    `R-02 Violation: Em-dash (—) found in ${file}`
  );
  assert(
    !content.includes("// TODO"),
    `Zero-Truncation Violation: // TODO found in ${file}`
  );
});
console.log(
  "[PASS] 1. R-02 & Zero-Truncation: 0 em-dashes and 0 TODOs across all " + filesToScan.length + " project files."
);

// 2. Load curriculum-data.js and verify linguistic completeness
global.window = {};
require(path.join(projectDir, "curriculum-data.js"));
const DATA = global.window.JAGO_DATA;
assert(DATA, "JAGO_DATA failed to load");
assert.strictEqual(DATA.cefrLevels.length, 6, "Expected 6 CEFR levels (A1-C2)");
assert.strictEqual(
  Object.keys(DATA.tenseMatrix.cells).length,
  12,
  "Expected 12 Tense-Aspect cells"
);
assert.strictEqual(DATA.srsDeck.length, 18, "Expected 18 core SRS cards");
assert.strictEqual(
  DATA.prosodicStressWords.length,
  7,
  "Expected 7 prosodic stress words"
);
assert.strictEqual(
  DATA.shadowingPrompts.length,
  18,
  "Expected 18 shadowing prompts (3 per level A1-C2)"
);
assert.strictEqual(
  DATA.intonationContours.length,
  4,
  "Expected 4 core intonation contours"
);
assert.strictEqual(
  DATA.diagnosticQuiz.length,
  12,
  "Expected 12 calibrated diagnostic questions"
);
assert.strictEqual(
  DATA.sentenceSurgery.length,
  6,
  "Expected 6 sentence surgery challenges"
);
console.log(
  "[PASS] 2. Curriculum Database Integrity: 6 CEFR Levels, 12 Tenses, 18 SRS Cards, 7 Prosody Words, 12 Quiz Items, 6 Surgery Challenges verified."
);

// 3. Verify HTML IDs and CSS Responsive / Accessibility Rules
const htmlContent = fs.readFileSync(path.join(projectDir, "index.html"), "utf8");
const cssContent = fs.readFileSync(path.join(projectDir, "styles.css"), "utf8");

const requiredIds = [
  "main-workbench",
  "open-protocol-modal-btn",
  "theme-toggle-btn",
  "ledger-cefr-badge",
  "ledger-srs-count",
  "ledger-quiz-score",
  "ledger-surgery-count",
  "tab-hub-studio",
  "tab-hub-convo",
  "tab-hub-grammar",
  "tab-hub-progress",
  "tab-btn-coach",
  "tab-btn-curriculum",
  "tab-btn-tenses",
  "tab-btn-srs",
  "tab-btn-speaking",
  "tab-btn-diagnostic",
  "tab-btn-translate",
  "tab-btn-topics",
  "tab-btn-conversation",
  "panel-curriculum",
  "panel-tenses",
  "panel-srs",
  "panel-speaking",
  "panel-diagnostic",
  "panel-translate",
  "panel-topics",
  "panel-conversation",
  "translate-root",
  "topics-root",
  "conversation-root",
  "cefr-level-buttons",
  "curriculum-content-area",
  "tense-prop-select",
  "tense-matrix-tbody",
  "tense-inspector-panel",
  "srs-level-filter",
  "srs-category-filter",
  "srs-search-input",
  "srs-reset-filter-btn",
  "srs-stage-container",
  "custom-card-form",
  "shadowing-select",
  "shadowing-detail-box",
  "speak-native-normal-btn",
  "speak-native-slow-btn",
  "start-mic-record-btn",
  "manual-speech-input",
  "evaluate-speech-btn",
  "prosody-word-buttons",
  "prosody-explanation-box",
  "diagnostic-quiz-container",
  "surgery-challenge-select",
  "sentence-surgery-container",
  "protocol-modal",
  "close-protocol-modal-btn",
  "reset-all-progress-btn",
  "confirm-protocol-modal-btn"
];

requiredIds.forEach((id) => {
  assert(
    htmlContent.includes(`id="${id}"`),
    `Missing required DOM ID in index.html: #${id}`
  );
});
console.log(
  `[PASS] 3. DOM Control Wiring: All ${requiredIds.length} interactive control IDs verified in index.html.`
);

// 4. Verify CSS Breakpoints, Focus-Visible, Dark Mode, and Tap Target Minimums
assert(
  cssContent.includes(":focus-visible"),
  "Missing :focus-visible rule in styles.css (R-32)"
);
assert(
  htmlContent.includes("family=Lato") &&
    cssContent.includes('"Lato"') &&
    !htmlContent.includes("JetBrains") &&
    !cssContent.includes("JetBrains"),
  "Expected pure Lato font family with zero JetBrains Mono in index.html and styles.css"
);
assert(
  !htmlContent.includes("100% Gratis, Tanpa API Key") &&
    !htmlContent.includes("0 / 18 Kartu"),
  "Expected zero promotional badge or zero-stat dashboard slop in index.html"
);
assert(
  cssContent.includes(".roadmap-highway") && cssContent.includes(".road-stop"),
  "Expected Winding Highway Road Map classes in styles.css"
);
assert(
  cssContent.includes('[data-theme="dark"]'),
  "Missing dark theme CSS tokens in styles.css (R-21, R-34)"
);
assert(
  cssContent.includes("@media (max-width: 1024px)") &&
    cssContent.includes("@media (max-width: 640px)"),
  "Missing 3-state responsive reflow breakpoints in styles.css (R-03)"
);
assert(
  cssContent.includes("min-height: 44px"),
  "Missing 44px minimum tap target rule in styles.css (R-03)"
);
console.log(
  "[PASS] 4. CSS Accessibility & Reflow: :focus-visible, [data-theme=dark], 3-state breakpoints (<=640px, <=1024px, >1024px), and >=44px tap targets verified."
);

// 5. Coach core: rule engine, diff, estimator, readiness gate
global.window = global.window || {};
require(path.join(projectDir, "coach-data.js"));
const CD = global.window.COACH_DATA;
const Core = require(path.join(projectDir, "coach-core.js"));

const fixCases = [
  ["We are proud about our culture.", "We are proud of our culture."],
  ["I am agree with you.", "I agree with you."],
  ["Let's discuss about the plan.", "Let's discuss the plan."],
  ["She don't work here.", "She doesn't work here."],
  ["It depends of the price.", "It depends on the price."],
  ["We need more informations.", "We need more information."],
  ["This is more better.", "This is better."],
  ["I have lived here since two years.", "I have lived here for two years."],
  ["It is what we called gotong royong.", "It is what we call gotong royong."],
  ["Indonesia has several culture and language.", "Indonesia has several cultures and languages."],
  ["In the other hand, it is costly.", "On the other hand, it is costly."],
  ["I did a mistake.", "I made a mistake."],
  ["The buyer need more informations.", "The buyer needs more information."],
  ["We sedang mengurus the izin edar.", "We are currently processing the marketing authorization."],
  ["Indonesia has several islands and tersebar in every like Java.", "Indonesia has several islands spread across major regions such as Java."]
];
fixCases.forEach(([wrong, right]) => {
  const out = Core.analyze(wrong, CD).corrected;
  assert.strictEqual(out, right, `Rule failed: "${wrong}" -> "${out}" (expected "${right}")`);
});

// Test Indonesian phonetic guide, Band 7.5+ C1 upgrade, Intent detection, and LanguageTool merge
const sample0 = Core.analyze(CD.samples[0].text, CD);
assert(sample0.c1Upgrade.includes("vast archipelago"), "Expected C1 upgrade to include 'vast archipelago'");
assert(sample0.sentencePhonetics.length >= 3, "Expected sentencePhonetics for each sentence");
assert(sample0.intent && sample0.intent.nextSentences.length === 3, "Expected 3 follow-up 'What to Say Next' sentences");

const merged = Core.mergeLanguageToolMatches(
  Core.analyze("He go to school yesterday.", CD),
  [{ offset: 3, length: 4, message: "Use past tense.", replacements: [{ value: "went" }], rule: { id: "PAST_TENSE", category: { name: "Grammar" } } }],
  CD
);
assert(merged.corrected.includes("He went to school"), "Expected LanguageTool merge to apply replacement");

// No false positives on correct sentences
[
  "Let it go and make it work.",
  "She works at the headquarters and he has two offices.",
  "We have lived here since 2022.",
  "We called him yesterday and I have been working since last year.",
  "The indigenous peoples of Papua live in the highlands."
].forEach((ok) => {
  const r = Core.analyze(ok, CD);
  const autoFixes = r.findings.filter((f) => !f.manual);
  assert.strictEqual(autoFixes.length, 0, `False positive on correct text: "${ok}" -> ${JSON.stringify(autoFixes)}`);
});

// Every rule's wrong example must be corrected or flagged, and the right example must stay clean
CD.errorRules.forEach((rule) => {
  const w = Core.analyze(rule.wrong, CD).findings.filter((f) => f.id === rule.id);
  assert(w.length > 0, `Rule ${rule.id} does not detect its own wrong example`);
  const r = Core.analyze(rule.right, CD).findings.filter((f) => f.id === rule.id && !f.manual);
  assert.strictEqual(r.length, 0, `Rule ${rule.id} flags its own right example`);
});

// Diff and readiness
const d = Core.diffWords("We are deeply proud of our country", "we are proud of country");
assert.strictEqual(d.items.filter((i) => i.status === "miss").length, 2);
assert(d.accuracy > 60 && d.accuracy < 80);

const ex = CD.exams.ielts;
const mk = (date, overall, id) => ({ id, date, overall, speaking: null, writing: null, reading: null, listening: null });
assert.strictEqual(Core.evaluateReadiness([mk("2026-01-01", 8, 1), mk("2026-01-02", 8, 2)], ex).ready, false);
assert.strictEqual(Core.evaluateReadiness([mk("2026-01-01", 7, 1), mk("2026-01-02", 8, 2), mk("2026-01-03", 8, 3)], ex).ready, false);
assert.strictEqual(Core.evaluateReadiness([mk("2026-01-01", 7, 1), mk("2026-01-02", 7.5, 2), mk("2026-01-03", 8, 3), mk("2026-01-04", 7.5, 4)], ex).ready, true);

// Estimator monotonicity: fewer errors must not lower the grammar indicator
const bad = Core.analyze(CD.samples[0].text, CD).stats.bands.grammar;
const good = Core.estimate("Although the process is intricate, we are confident that the licenses will be issued soon. Moreover, our team has prepared every document.", [], CD).bands.grammar;
assert(good >= bad, "Estimator not monotonic");

console.log(`[PASS] 5. Coach engine: ${fixCases.length} correction cases, 5 false-positive guards, ${CD.errorRules.length} rules self-consistent, diff, readiness gate, estimator verified.`);
