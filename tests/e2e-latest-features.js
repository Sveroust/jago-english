const { chromium } = require("playwright-core");
const assert = require("assert");

const URL = "http://localhost:8088/";

(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text()); });

  await page.goto(URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  console.log("1. Verifying 3-Step Guide Centering...");
  await page.click("#tab-btn-coach");
  await page.waitForTimeout(300);

  for (const w of [1280, 768, 375]) {
    await page.setViewportSize({ width: w, height: 900 });
    const checks = await page.evaluate(() => {
      const steps = Array.from(document.querySelectorAll(".quick-guide-step"));
      return steps.map((s) => {
        const num = s.querySelector(".quick-guide-num");
        const title = s.querySelector(".quick-guide-title");
        const sRect = s.getBoundingClientRect();
        const nRect = num.getBoundingClientRect();
        const tRect = title.getBoundingClientRect();
        const numCenterOffset = Math.abs((nRect.left + nRect.width / 2) - (sRect.left + sRect.width / 2));
        const titleCenterOffset = Math.abs((tRect.left + tRect.width / 2) - (sRect.left + sRect.width / 2));
        return { numCenterOffset, titleCenterOffset };
      });
    });
    for (const c of checks) {
      assert.ok(c.numCenterOffset < 1.0, `Num not centered at ${w}px: ${c.numCenterOffset}`);
      assert.ok(c.titleCenterOffset < 1.0, `Title not centered at ${w}px: ${c.titleCenterOffset}`);
    }
  }
  console.log("PASS: 3-Step Guide perfectly centered across all screen widths.");

  await page.setViewportSize({ width: 1280, height: 900 });

  console.log("2. Verifying 12 Tenses Simulator Propositions...");
  await page.click("#tab-btn-tenses");
  await page.waitForTimeout(300);
  const propCount = await page.evaluate(() => {
    const sel = document.getElementById("tense-prop-select");
    return sel ? sel.options.length : 0;
  });
  assert.strictEqual(propCount, 15, `Expected 15 propositions in tense selector, got ${propCount}`);
  console.log(`PASS: 12 Tenses Simulator has ${propCount} rich propositions.`);

  console.log("3. Verifying Speaking & Intonation Lab...");
  await page.click("#tab-btn-speaking");
  await page.waitForTimeout(300);
  const shadowingCount = await page.evaluate(() => {
    const sel = document.getElementById("shadowing-select");
    return sel ? sel.options.length : 0;
  });
  assert.strictEqual(shadowingCount, 18, `Expected 18 shadowing prompts, got ${shadowingCount}`);

  const intonCardCount = await page.evaluate(() => {
    const cards = document.querySelectorAll(".intonation-card");
    return cards.length;
  });
  assert.strictEqual(intonCardCount, 4, `Expected 4 intonation cards, got ${intonCardCount}`);
  console.log(`PASS: Speaking Lab has 18 shadowing prompts and 4 intonation contours.`);

  console.log("4. Verifying Penerjemah Pikiran CEFR Ladder & Register...");
  await page.click("#tab-btn-translate");
  await page.waitForTimeout(300);
  const ladderSteps = await page.evaluate(() => {
    return document.querySelectorAll(".ladder-step").length;
  });
  assert.ok(ladderSteps >= 5, `Expected at least 5 ladder steps, got ${ladderSteps}`);

  const hasFormalCasual = await page.evaluate(() => {
    const formal = document.querySelector(".register-box-formal");
    const casual = document.querySelector(".register-box-casual");
    return Boolean(formal && casual);
  });
  assert.ok(hasFormalCasual, "Formal and Casual register cards should be present");
  console.log("PASS: Penerjemah Pikiran CEFR ladder and register boxes verified.");

  console.log("5. Verifying 50 Topik IELTS & TOEFL Studio...");
  await page.click("#tab-btn-topics");
  await page.waitForTimeout(400);

  const topicCount = await page.evaluate(() => {
    return document.querySelectorAll("#topics-root .topic-list-item").length;
  });
  assert.strictEqual(topicCount, 50, `Expected 50 topics in sidebar, got ${topicCount}`);

  const cueCard = await page.evaluate(() => {
    return Boolean(document.querySelector(".ielts-cue-card"));
  });
  assert.ok(cueCard, "IELTS Cue Card should be rendered");

  const trapGrid = await page.evaluate(() => {
    return Boolean(document.querySelector(".trap-grid"));
  });
  assert.ok(trapGrid, "Speaking trap grid should be rendered");
  console.log("PASS: 50 Topics Studio rendered with 50 topics, cue card, and trap grid.");

  console.log("6. Verifying Success Chime Functionality...");
  const chimeExists = await page.evaluate(() => {
    return typeof window.playSuccessChime === "function";
  });
  assert.ok(chimeExists, "window.playSuccessChime should be defined");
  console.log("PASS: Web Audio success chime available.");

  console.log("7. Verifying Percakapan Harian & Bisnis Module (3 Tiers + Replies + Mobile Layout)...");
  // First put Coach on the Road Map subtab to test cross-module handoff reliability
  await page.click("#tab-btn-coach");
  await page.click('[data-action="sub"][data-sub="plan"]');

  await page.click("#tab-btn-conversation");
  await page.waitForTimeout(300);

  const convScenarioCount = await page.evaluate(() => {
    return document.querySelectorAll("[data-conv-scenario]").length;
  });
  assert.strictEqual(convScenarioCount, 7, `Expected 7 conversation scenarios, got ${convScenarioCount}`);

  // Switch scenario to #4 (Kesiapan Bisnis & Kunjungan Jakarta) and verify 3 tiers + compare
  await page.click('[data-conv-scenario="conv-kesiapan-bisnis-jakarta"]');
  for (const tier of ["mudah", "menengah", "advance"]) {
    await page.click(`[data-conv-tier="${tier}"]`);
    const lineCount = await page.evaluate(() => document.querySelectorAll(".conv-line-card").length);
    assert.ok(lineCount >= 4, `Expected >=4 dialogue lines for tier ${tier}, got ${lineCount}`);
    const hasPhonetics = await page.evaluate(() => document.querySelectorAll(".conv-line-phonetic").length === document.querySelectorAll(".conv-line-card").length);
    assert.ok(hasPhonetics, `Expected Indonesian phonetic guide for all lines in ${tier}`);
  }

  await page.click('[data-conv-tier="compare"]');
  const compareCols = await page.evaluate(() => document.querySelectorAll(".conv-compare-col").length);
  assert.strictEqual(compareCols, 3, "Expected 3 columns in Compare mode (Mudah, Menengah, Advance)");

  // Switch to Studio Balasan Email & WhatsApp
  await page.click('[data-conv-view="replies"]');
  await page.click('[data-reply-level="advance"]');
  const replyTextEmail = await page.$eval("#conv-reply-editor", (el) => el.value);
  assert.ok(replyTextEmail.includes("28 or 29 November 2026"), "Expected November Jakarta visit reply text");
  await page.click('[data-reply-channel="wa"]');
  const replyTextWa = await page.$eval("#conv-reply-editor", (el) => el.value);
  assert.ok(replyTextWa.includes("Zoom") && replyTextWa.includes("Jakarta"), "Expected WhatsApp reply text");

  // Switch back to scenarios, test responsive overflow at 360px & dark mode
  await page.click('[data-conv-view="scenarios"]');
  await page.click('[data-conv-tier="advance"]');
  await page.click("#theme-toggle-btn");
  for (const w of [1280, 768, 360]) {
    await page.setViewportSize({ width: w, height: 850 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    assert.ok(!overflow, `Horizontal overflow detected in conversation tab at ${w}px`);
  }
  const mobileTabHeight = await page.locator("#tab-btn-conversation").boundingBox();
  assert.ok(mobileTabHeight && mobileTabHeight.height >= 44, `Expected mobile nav tab height >= 44px, got ${mobileTabHeight && mobileTabHeight.height}`);

  // Test handoff from Conversation -> Coach even though Coach was left on Road Map!
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.locator('[data-conv-coach]').first().click();
  await page.waitForTimeout(250);
  const coachResultText = await page.textContent("#coach-results");
  assert.ok(coachResultText && coachResultText.length > 40, "Expected Coach analysis result after handoff from Conversation");
  console.log("PASS: Percakapan Harian & Bisnis 7 scenarios x 3 tiers, Replies Studio, 360px overflow, and Coach handoff verified.");

  console.log("8. Verifying Coach Intent & Grammar Deep-Dive Accuracy (Malik/IDAK Case)...");
  await page.fill("#coach-input", "Thank you for coming again in Indonesia. Welcome to Indonesia again Mr. Malik. Yes, I'm Kamal Thorik. And then we have a good news. So we finally have a regulation. We are now in legal for business. we are preparing for currently we are preparing IDAK and CDAKB for regulatory, mandatory and then for Indonesian Ministry of Health.");
  await page.click('[data-action="analyze"]');
  await page.waitForTimeout(250);
  const coachDeepText = await page.textContent("#coach-results");
  assert.ok(coachDeepText.includes("Menyambut mitra bisnis"), "Expected welcome-business-visit topic instead of Indonesia geography");
  assert.ok(!coachDeepText.includes("several islands"), "Should NOT falsely trigger indonesia-culture several islands advice");
  assert.ok(coachDeepText.includes("coming back to Indonesia"), "Expected coming again in -> coming back to correction");
  assert.ok(coachDeepText.includes("some good news"), "Expected a good news -> some good news correction");
  assert.ok(coachDeepText.includes("legally compliant"), "Expected in legal -> legally compliant correction");
  assert.ok(coachDeepText.includes("We are currently preparing IDAK"), "Expected lowercase + spoken self-repair fix");
  console.log("PASS: Coach deep-dive rules and intent scoring verified.");

  console.log("9. Verifying Penerjemah Pikiran Custom Thought Handling...");
  await page.click("#tab-btn-translate");
  await page.fill("#translate-input", "Cuaca Jakarta hari ini hujan deras, jadi mohon maaf penjemputan di bandara agak telat.");
  await page.click("#translate-run-btn");
  await page.waitForTimeout(250);
  const customTransText = await page.textContent("#translate-results");
  assert.ok(customTransText.includes("Analisis Kalimat Pikiran Kamu (Kustom)"), "Custom thought should enter dynamic analysis mode");
  assert.ok(customTransText.includes("heavy rain"), "Expected client phrase bridge for heavy rain");
  assert.ok(customTransText.includes("airport pickup"), "Expected client phrase bridge for airport pickup");
  assert.ok(!customTransText.includes("Menghubungi Ulang Klien"), "Custom thought must NOT blindly fall back to intents[0]");
  console.log("PASS: Penerjemah Pikiran handles custom thoughts accurately.");

  console.log("10. Verifying 390px Phone Compact Sidebar & Responsive Adjustment...");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.click("#tab-btn-topics");
  await page.waitForTimeout(250);
  const mobileSidebarInfo = await page.evaluate(() => {
    const sb = document.querySelector("#topics-root .topics-sidebar");
    const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth;
    const cs = sb ? window.getComputedStyle(sb) : null;
    const rect = sb ? sb.getBoundingClientRect() : null;
    return {
      overflow,
      maxHeight: cs ? parseFloat(cs.maxHeight) : 9999,
      height: rect ? rect.height : 9999
    };
  });
  assert.ok(!mobileSidebarInfo.overflow, "Zero horizontal overflow at 390px width");
  assert.ok(mobileSidebarInfo.maxHeight <= 240 && mobileSidebarInfo.height <= 240, `Expected compact topics sidebar <= 240px on mobile, got ${JSON.stringify(mobileSidebarInfo)}`);
  console.log("PASS: 390px phone compact sidebar and overflow check verified.");

  assert.strictEqual(errors.length, 0, `Page errors encountered: ${errors.join(", ")}`);
  console.log("ALL LATEST FEATURE TESTS PASSED (0 ERRORS)!");

  await browser.close();
})();
