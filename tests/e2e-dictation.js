const { chromium } = require("playwright-core");
const assert = require("assert");
const path = require("path");
const os = require("os");
const fs = require("fs");
const { execFileSync } = require("child_process");

const URL = "http://localhost:8088/";

(async () => {
  const wavPath = path.join(os.tmpdir(), "jago-e2e-mic.wav");
  const aiffPath = path.join(os.tmpdir(), "jago-e2e-mic.aiff");

  // Synthesize spoken Indonesian + mixed English speech for virtual Chrome microphone
  execFileSync("say", ["-v", "Damayanti", "-o", aiffPath, "Kabar di Jakarta baik dan kami mau follow up dokumen izin edar."]);
  execFileSync("/opt/homebrew/bin/ffmpeg", ["-y", "-i", aiffPath, "-ar", "48000", "-ac", "1", "-c:a", "pcm_s16le", wavPath], { stdio: "ignore" });
  try { fs.unlinkSync(aiffPath); } catch (_) {}

  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
    args: [
      "--use-fake-device-for-media-stream",
      "--use-fake-ui-for-media-stream",
      "--use-file-for-fake-audio-capture=" + wavPath
    ]
  });

  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = [];
    page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
    page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text()); });

    await page.goto(URL);
    await page.waitForTimeout(300);

    // 1. Test /api/speech-health in page
    const health = await page.evaluate(async () => {
      return window.JagoSpeech ? await window.JagoSpeech.checkLocalServer(true) : { available: false };
    });
    assert.strictEqual(health.available, true, "Local Whisper speech health should be available");
    console.log("PASS 1: Local Whisper engine detected by frontend:", health.modelName);

    // 2. Test Penerjemah Pikiran real virtual mic dictation
    await page.click("#tab-btn-translate");
    await page.fill("#translate-input", "");
    await page.click("#translate-mic-btn");

    await page.waitForSelector("#translate-mic-status .mic-live-banner", { timeout: 5000 });
    await page.waitForTimeout(2200);

    // Verify AudioContext mic level meter actually ran
    const meterTransform = await page.$eval("#translate-mic-status .mic-meter-fill", (el) => el.style.transform);
    assert.ok(meterTransform && meterTransform.includes("scaleX"), "Live meter transform expected, got " + meterTransform);
    console.log("PASS 2: Live VU-Meter active in Penerjemah Pikiran:", meterTransform);

    // Click Finish & Transcribe button inside live banner
    await page.click('#translate-mic-status button.btn-primary');
    await page.waitForSelector("#translate-mic-status .is-success", { timeout: 25000 });

    const transcribedTranslate = await page.$eval("#translate-input", (el) => el.value);
    assert.ok(transcribedTranslate.toLowerCase().includes("jakarta") || transcribedTranslate.toLowerCase().includes("dokumen"),
      "Expected transcribed Indonesian words in translate input, got: " + transcribedTranslate);
    console.log("PASS 3: Penerjemah Pikiran Whisper transcription filled input:", transcribedTranslate);

    const translateResultsText = await page.textContent("#translate-results");
    assert.ok(
      translateResultsText.includes("Tangga Keluwesan Bahasa") ||
      translateResultsText.includes("Analisis Kalimat Pikiran Kamu"),
      "Expected Penerjemah Pikiran results auto-rendered"
    );

    // 3. Test Coach Dikte button
    await page.click("#tab-btn-coach");
    await page.fill("#coach-input", "");
    await page.selectOption("#coach-lang", "id-ID");
    await page.click("#coach-dictate-btn");
    await page.waitForSelector("#coach-input-feedback .mic-live-banner", { timeout: 5000 });
    await page.waitForTimeout(1600);
    await page.click('#coach-input-feedback button.btn-primary');
    await page.waitForSelector("#coach-input-feedback .is-success", { timeout: 25000 });
    const transcribedCoach = await page.$eval("#coach-input", (el) => el.value);
    assert.ok(transcribedCoach.trim().length > 5, "Expected transcribed text in Coach input, got: " + transcribedCoach);
    console.log("PASS 4: Coach Dikte Whisper transcription filled input:", transcribedCoach);

    assert.strictEqual(errors.length, 0, "Console/page errors encountered: " + errors.join("; "));
    console.log("ALL REAL MIC-TO-WHISPER E2E DICTATION TESTS PASSED (0 ERRORS)!");
  } finally {
    await browser.close();
    try { fs.unlinkSync(wavPath); } catch (_) {}
  }
})();
