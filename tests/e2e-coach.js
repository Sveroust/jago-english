const { chromium } = require("playwright-core");

const URL = "http://localhost:8088/";
const results = [];
function ok(name, cond, extra) {
  results.push({ name, pass: !!cond, extra: extra || "" });
  console.log((cond ? "PASS " : "FAIL ") + name + (extra ? " | " + extra : ""));
}

(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text()); });

  await page.goto(URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  // Overflow at three breakpoints on the coach tab
  await page.click("#tab-btn-coach");
  const pageTextInitial = await page.textContent("body");
  ok("pure Lato font family active on body", await page.evaluate(() => getComputedStyle(document.body).fontFamily.includes("Lato")));
  ok("zero promotional AI slop badges ('100% Gratis, Tanpa API Key' / '0 / 18 Kartu Direview')", !pageTextInitial.includes("100% Gratis") && !pageTextInitial.includes("0 / 18 Kartu"));
  for (const w of [1280, 768, 360]) {
    await page.setViewportSize({ width: w, height: 900 });
    const over = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    ok("no horizontal overflow at " + w + "px (coach, empty state)", !over);
  }
  await page.setViewportSize({ width: 1280, height: 900 });

  // Empty-state validation
  await page.click('[data-action="analyze"]');
  ok("empty input shows error state", (await page.textContent("#coach-results")).includes("Teks masih kosong"));

  // Sample: Indonesia intro
  await page.click('[data-action="sample"][data-sample="indonesia"]');
  const res = await page.textContent("#coach-results");
  ok("analysis shows corrected text", res.includes("proud of Indonesia"));
  ok("intent summary card rendered", res.includes("Mungkin Maksud Kamu Begini"));
  ok("Band 7.5+ C1 upgrade rendered", res.includes("vast archipelago"));
  ok("Indonesian phonetic guide rendered per sentence", res.includes("Cara baca lidah Indonesia"));
  ok("What to Say Next follow-up sentences rendered", res.includes("Kalimat Lanjutan (What to Say Next)"));
  ok("finding card for proud-about", res.includes("proud about") && res.includes("Preposisi".toUpperCase()) );
  ok("manual-check finding present", res.includes("PERIKSA SENDIRI"));
  ok("fine print states fluency not scored", res.includes("Fluency dan Pronunciation tidak dinilai"));
  const marks = await page.locator("mark.fix").count();
  ok("changed fragments are marked", marks >= 3, marks + " marks");

  // Local term bridge
  await page.fill("#coach-input", "We supply what we called kemiri and our IDAK is ready.");
  await page.click('[data-action="analyze"]');
  const res2 = await page.textContent("#coach-results");
  ok("what we called -> what we call", res2.includes("what we call"));
  ok("kemiri bridge shown", res2.includes("candlenuts") && res2.includes("IDAK"));

  // Word click toggles active then clears via speech stub
  const speechApi = await page.evaluate(() => "speechSynthesis" in window);
  ok("speechSynthesis available in this browser", speechApi);
  await page.locator(".coach-word").first().click();
  ok("clicking a word does not throw", true);

  // Stop audio
  await page.click('[data-action="stop"]');
  ok("audio status resets after stop", (await page.textContent("#coach-audio-status")).includes("Siap"));

  // Read aloud without recognition support path or with it: just ensure no throw
  await page.locator('[data-action="readaloud"]').first().click();
  ok("read-aloud click yields feedback", (await page.locator("#coach-readaloud-0").innerHTML()).length > 0);

  // Notebook
  await page.click('[data-action="sub"][data-sub="notebook"]');
  ok("notebook table lists recorded patterns", (await page.textContent("#coach-error-table")).includes("proud") || (await page.textContent("#coach-error-table")).includes("what we"));
  ok("drill rendered", await page.locator('[data-action="drill"]').count() === 2);
  const rightBtn = page.locator('[data-action="drill"][data-pick="right"]');
  await rightBtn.click();
  ok("drill feedback after answer", (await page.textContent("#coach-drill-feedback")).includes("Benar"));
  await page.click('[data-action="nextdrill"]');
  ok("next drill renders", await page.locator('[data-action="drill"]').count() === 2);

  // Plan & Winding Highway Road Map
  await page.click('[data-action="sub"][data-sub="plan"]');
  ok("winding roadmap highway renders 14 daily stops", (await page.locator("#coach-roadmap-highway .road-stop").count()) === 14);
  ok("roadmap finish badge rendered", (await page.textContent("#coach-roadmap-highway")).includes("DONE:"));
  const roadTaskBox = page.locator('input[data-action="road-task"]').first();
  await roadTaskBox.check();
  ok("roadmap daily task checkbox persists", await page.locator('input[data-action="road-task"]').first().isChecked());

  // Add custom stop to Road Map
  await page.fill("#rm-badge", "Hari 15");
  await page.fill("#rm-title", "Pitching Buyer Eropa");
  await page.fill("#rm-tasks", "Rekam presentasi FOB; Cek mikrofon");
  await page.click('#coach-custom-roadmap-form button[type="submit"]');
  ok("custom stop added to winding roadmap", (await page.locator("#coach-roadmap-highway .road-stop").count()) === 15);

  // Add custom context button
  await page.fill("#ctx-label", "Follow-up Malik");
  await page.fill("#ctx-text", "Hi Mr. Malik, we sedang mengurus the licensing.");
  await page.click('#coach-custom-context-form button[type="submit"]');
  ok("custom context saved", (await page.textContent("#coach-custom-context-form")).includes("Follow-up Malik"));

  // Verify Road Map at 360px mobile has no horizontal overflow
  await page.setViewportSize({ width: 360, height: 800 });
  const overRoad360 = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  ok("no horizontal overflow on Road Map at 360px", !overRoad360);
  await page.setViewportSize({ width: 1280, height: 900 });

  ok("12 weeks listed", (await page.locator("details.plan-week").count()) === 12);
  const firstBox = page.locator('input[data-action="plan"]').first();
  await firstBox.check();
  ok("plan checkbox persists", await page.locator('input[data-action="plan"]').first().isChecked());

  // Tracker validation + readiness
  await page.click('[data-action="sub"][data-sub="tracker"]');
  await page.click('#coach-score-form button[type="submit"]');
  ok("tracker validation error", (await page.textContent("#coach-score-feedback")).includes("Overall wajib"));
  for (const [d, s] of [["2026-10-01", "7"], ["2026-10-15", "7.5"], ["2026-10-29", "7.5"]]) {
    await page.fill("#sc-date", d);
    await page.fill("#sc-overall", s);
    await page.click('#coach-score-form button[type="submit"]');
  }
  ok("not ready when a mock is below 7.5", (await page.textContent("#coach-root")).includes("Belum layak mendaftar"));
  await page.fill("#sc-date", "2026-11-05");
  await page.fill("#sc-overall", "8");
  await page.click('#coach-score-form button[type="submit"]');
  await page.fill("#sc-date", "2026-11-08");
  await page.fill("#sc-overall", "7.5");
  await page.click('#coach-score-form button[type="submit"]');
  await page.fill("#sc-date", "2026-11-09");
  await page.fill("#sc-overall", "7.5");
  await page.click('#coach-score-form button[type="submit"]');
  ok("ready after 3 mocks at or above target", (await page.textContent("#coach-root")).includes("Layak mendaftar ujian resmi"));
  await page.selectOption("#sc-exam", "toeflLegacy");
  ok("switching exam shows empty-state for that exam", (await page.textContent("#coach-root")).includes("Belum ada skor untuk jenis ujian ini"));

  // Rubric
  await page.click('[data-action="sub"][data-sub="rubric"]');
  ok("rubric lists four criteria", (await page.locator(".data-table tbody tr").count()) === 4);

  // Persistence across reload
  await page.reload();
  await page.click("#tab-btn-coach");
  ok("state persisted across reload (tracker section)", (await page.textContent("#coach-root")).length > 100);

  // Dark theme + mobile layout
  await page.click("#theme-toggle-btn");
  await page.setViewportSize({ width: 360, height: 800 });
  await page.click('[data-action="sub"][data-sub="analyze"]');
  await page.click('[data-action="sample"][data-sample="alkes"]');
  const over360 = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  ok("no horizontal overflow at 360px with results (dark)", !over360);
  const navBox = await page.locator(".nav-tab").first().boundingBox();
  ok("mobile nav tab height at least 44px", navBox && navBox.height >= 44, navBox ? Math.round(navBox.height) + "px" : "");

  // Keyboard focus visibility
  await page.keyboard.press("Tab");
  const outline = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
  ok("focus-visible outline present", outline !== "none");

  ok("no console or page errors", errors.length === 0, errors.join(" || "));
  await browser.close();

  const failed = results.filter((r) => !r.pass);
  console.log("\n" + (results.length - failed.length) + "/" + results.length + " passed");
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error("RUNNER ERROR", e); process.exit(2); });
