const { chromium } = require("playwright-core");
const assert = require("assert");

const URL = "http://localhost:8088/";

(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text()); });

  // Deterministic MyMemory mock so free-online EN<->ID paths stay verifiable offline/CI
  await page.route("https://api.mymemory.translated.net/**", async (route) => {
    const u = route.request().url();
    if (u.includes("id%7Cen") || u.includes("id|en")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          responseData: { translatedText: "Jakarta weather today has heavy rain, so I apologize if the airport pickup is slightly delayed." },
          matches: [
            { translation: "Due to heavy rain in Jakarta today, our airport pickup might arrive a few minutes behind schedule." }
          ]
        })
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          responseData: { translatedText: "Terima kasih telah datang kembali ke Indonesia Bapak Malik. Kami memiliki kabar baik bahwa regulasi izin usaha kami kini telah sah dan kami sedang menyiapkan IDAK serta CDAKB." },
          matches: []
        })
      });
    }
  });

  await page.goto(URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  console.log("1. Verifying 4-Hub Navigation & Studio Two-Way Tutorial...");
  const hubCount = await page.locator(".nav-tab[data-hub]").count();
  assert.strictEqual(hubCount, 4, `Expected exactly 4 top-level Hub tabs, got ${hubCount}`);

  for (const w of [1280, 768, 390]) {
    await page.setViewportSize({ width: w, height: 900 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    assert.ok(!overflow, `Initial Studio view overflows horizontally at ${w}px`);
  }
  await page.click("#studio-guide-toggle-btn");
  const guideHidden = await page.evaluate(() => document.getElementById("studio-quick-tutorial").style.display === "none");
  assert.ok(guideHidden, "Quick tutorial should collapse smoothly");
  await page.click("#studio-guide-toggle-btn");
  console.log("PASS: 4-Hub navigation and collapsible Two-Way Tutorial verified.");

  await page.setViewportSize({ width: 1280, height: 900 });

  console.log("2. Verifying 12 Tenses Simulator via Pondasi Hub...");
  await page.click("#tab-hub-grammar");
  await page.click("#tab-btn-tenses");
  await page.waitForTimeout(250);
  const propCount = await page.evaluate(() => {
    const sel = document.getElementById("tense-prop-select");
    return sel ? sel.options.length : 0;
  });
  assert.strictEqual(propCount, 15, `Expected 15 propositions in tense selector, got ${propCount}`);
  console.log(`PASS: 12 Tenses Simulator has ${propCount} propositions under Pondasi Hub.`);

  console.log("3. Verifying Speaking & Intonation Lab under Percakapan & Topik Hub...");
  await page.click("#tab-hub-convo");
  await page.click("#tab-btn-speaking");
  await page.waitForTimeout(250);
  const shadowingCount = await page.evaluate(() => document.getElementById("shadowing-select").options.length);
  const intonCardCount = await page.locator(".intonation-card").count();
  assert.strictEqual(shadowingCount, 18, `Expected 18 shadowing prompts, got ${shadowingCount}`);
  assert.strictEqual(intonCardCount, 4, `Expected 4 intonation contours, got ${intonCardCount}`);
  console.log("PASS: Speaking Lab 18 prompts + 4 intonation contours verified.");

  console.log("4. Verifying 50 Topics IELTS & TOEFL under Percakapan & Topik Hub...");
  await page.click("#tab-btn-topics");
  await page.waitForTimeout(300);
  const topicCount = await page.locator("#topics-root .topic-list-item").count();
  assert.strictEqual(topicCount, 50, `Expected 50 topics in sidebar, got ${topicCount}`);
  assert.ok(await page.locator(".ielts-cue-card").isVisible(), "IELTS Cue Card should be rendered");
  assert.ok(await page.locator(".trap-grid").isVisible(), "Speaking trap grid should be rendered");
  console.log("PASS: 50 Topics Studio rendered cleanly.");

  console.log("5. Verifying Percakapan Harian & Bisnis + Coach Handoff...");
  await page.click("#tab-btn-conversation");
  await page.waitForTimeout(250);
  const convScenarioCount = await page.locator("[data-conv-scenario]").count();
  assert.strictEqual(convScenarioCount, 7, `Expected 7 conversation scenarios, got ${convScenarioCount}`);

  await page.click('[data-conv-scenario="conv-kesiapan-bisnis-jakarta"]');
  for (const tier of ["mudah", "menengah", "advance"]) {
    await page.click(`[data-conv-tier="${tier}"]`);
    const lineCount = await page.locator(".conv-line-card").count();
    assert.ok(lineCount >= 4, `Expected >=4 lines for tier ${tier}`);
  }
  await page.click('[data-conv-tier="compare"]');
  assert.strictEqual(await page.locator(".conv-compare-col").count(), 3, "Expected 3 columns in Compare mode");
  await page.click('[data-conv-view="replies"]');
  await page.click('[data-reply-level="advance"]');
  const replyTextEmail = await page.$eval("#conv-reply-editor", (el) => el.value);
  assert.ok(replyTextEmail.includes("28 or 29 November 2026"), "Expected November Jakarta visit reply text");

  await page.click('[data-conv-view="scenarios"]');
  await page.locator('[data-conv-coach]').first().click();
  await page.waitForTimeout(250);
  const handoffText = await page.textContent("#coach-results");
  assert.ok(handoffText && handoffText.length > 40, "Expected Conversation -> Side A Coach handoff result");
  console.log("PASS: Conversation 3-tier + Replies Studio + Coach handoff verified.");

  console.log("6. Verifying Side A (Check English -> Indonesian Meaning, Grammar & Custom Template)...");
  await page.click("#tab-hub-studio");
  await page.click("#tab-btn-coach");
  await page.fill("#coach-input", "Thank you for coming again in Indonesia. Welcome to Indonesia again Mr. Malik. Yes, I'm Kamal Thorik. And then we have a good news. So we finally have a regulation. We are now in legal for business. we are preparing for currently we are preparing IDAK and CDAKB for regulatory, mandatory and then for Indonesian Ministry of Health.");
  await page.click('[data-action="analyze"]');
  await page.waitForSelector("#coach-meaning-card .meaning-text", { timeout: 6000 });
  const sideAText = await page.textContent("#coach-results");
  assert.ok(sideAText.includes("Menyambut mitra bisnis"), "Expected welcome-business-visit topic");
  assert.ok(!sideAText.includes("several islands"), "Must NOT falsely match indonesia geography");
  assert.ok(sideAText.includes("coming back to Indonesia"), "Expected coming again in fix");
  assert.ok(sideAText.includes("some good news"), "Expected a good news fix");
  assert.ok(sideAText.includes("legally compliant"), "Expected in legal fix");
  assert.ok(sideAText.includes("We are currently preparing IDAK"), "Expected lowercase + spoken self-repair fix");
  assert.ok(sideAText.includes("Terima kasih telah datang kembali"), "Expected Indonesian meaning translation of English input");

  // Save & Delete Custom English Template inline
  await page.click("#coach-toggle-save-tpl-btn");
  await page.fill("#coach-quick-tpl-label", "Sambutan Pribadi Malik");
  await page.click('[data-action="save-quick-tpl"]');
  assert.ok((await page.textContent("#panel-coach")).includes("Sambutan Pribadi Malik"), "Custom English template should appear");
  console.log("PASS: Side A Meaning-to-Indonesian, High-Standard Fixes & Custom Template verified.");

  console.log("7. Verifying Side B (Indonesian -> Leveled English + Back-Translation + Custom Template + Practice Handoff)...");
  await page.click("#tab-btn-translate");
  await page.fill("#translate-input", "Cuaca Jakarta hari ini hujan deras, jadi mohon maaf penjemputan di bandara agak telat.");
  await page.click("#translate-run-btn");
  await page.waitForSelector("#translate-ai-slot .ladder-step", { timeout: 6000 });
  const sideBText = await page.textContent("#translate-results");
  assert.ok(sideBText.includes("Analisis Kalimat Pikiran Kamu (Kustom)"), "Custom thought entered dynamic analysis");
  assert.ok(sideBText.includes("heavy rain") && sideBText.includes("airport pickup"), "Client bridges displayed");
  assert.ok(sideBText.includes("Hasil Inggris Bertingkat"), "Leveled online English translation rendered");
  assert.ok(sideBText.includes("Arti balik & maksudnya"), "Back-translation meaning shown for user verification");

  // Save Custom Indonesian Template inline
  await page.click("#translate-toggle-save-tpl-btn");
  await page.fill("#translate-quick-tpl-label", "Jemput Bandara Hujan");
  await page.click("#translate-save-tpl-confirm");
  assert.ok((await page.textContent("#translate-template-strip")).includes("Jemput Bandara Hujan"), "Custom Indonesian template saved");

  // Click Latih Ucapkan -> switches to Side A with that English sentence!
  await page.locator('[data-practice-coach]').first().click();
  await page.waitForTimeout(300);
  const coachAfterPractice = await page.$eval("#coach-input", (el) => el.value);
  assert.ok(coachAfterPractice.toLowerCase().includes("jakarta") || coachAfterPractice.toLowerCase().includes("rain"), "Latih Ucapkan should load sentence into Side A");
  console.log("PASS: Side B Leveled English + Back-Translation + Custom Template + Practice Handoff verified.");

  console.log("8. Verifying Hub 4 AI Online Settings Persistence...");
  await page.click("#tab-hub-progress");
  await page.click("#tab-btn-ai-settings");
  await page.selectOption("#ai-provider-select", "free");
  await page.click("#ai-save-cfg-btn");
  assert.ok((await page.textContent("#ai-settings-feedback")).includes("tersimpan"), "Settings saved feedback shown");
  console.log("PASS: AI Settings panel persistence verified.");

  console.log("9. Verifying 390px Phone Compact Sidebar & Zero Overflow across ALL 4 Hubs & Sub-views...");
  await page.setViewportSize({ width: 390, height: 844 });
  const navChecks = [
    ["#tab-hub-studio", "#tab-btn-coach"],
    ["#tab-hub-studio", "#tab-btn-translate"],
    ["#tab-hub-convo", "#tab-btn-conversation"],
    ["#tab-hub-convo", "#tab-btn-topics"],
    ["#tab-hub-convo", "#tab-btn-speaking"],
    ["#tab-hub-grammar", "#tab-btn-tenses"],
    ["#tab-hub-grammar", "#tab-btn-srs"],
    ["#tab-hub-grammar", "#tab-btn-curriculum"],
    ["#tab-hub-grammar", "#tab-btn-diagnostic"],
    ["#tab-hub-progress", "#tab-btn-progress-plan"],
    ["#tab-hub-progress", "#tab-btn-progress-notebook"],
    ["#tab-hub-progress", "#tab-btn-progress-tracker"],
    ["#tab-hub-progress", "#tab-btn-ai-settings"]
  ];
  for (const [hubSel, subSel] of navChecks) {
    await page.click(hubSel);
    await page.click(subSel);
    await page.waitForTimeout(160);
    const ov = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    assert.ok(!ov, `Horizontal overflow at 390px on ${hubSel} -> ${subSel}`);
  }
  await page.click("#tab-hub-convo");
  await page.click("#tab-btn-topics");
  const sbHeight = await page.evaluate(() => document.querySelector("#topics-root .topics-sidebar").getBoundingClientRect().height);
  assert.ok(sbHeight <= 240, `Expected compact topics sidebar <= 240px on mobile, got ${sbHeight}`);
  const navBox = await page.locator("#tab-hub-studio").boundingBox();
  assert.ok(navBox && navBox.height >= 44, `Expected mobile Hub nav tab height >= 44px, got ${navBox && navBox.height}`);
  console.log("PASS: All 13 Hub+Sub views verified with 0px overflow at 390px mobile!");

  assert.strictEqual(errors.length, 0, `Page errors encountered: ${errors.join(", ")}`);
  console.log("ALL LATEST FEATURE TESTS PASSED (0 ERRORS)!");

  await browser.close();
})();
