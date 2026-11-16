const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFile } = require("child_process");

const PORT = Number(process.env.PORT) || 8088;
const ROOT = __dirname;
const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8"
};

function firstExisting(candidates) {
  for (const p of candidates) {
    try {
      if (p && fs.existsSync(p)) return p;
    } catch (_) {}
  }
  return null;
}

function getSpeechStack() {
  const binary = firstExisting([
    "/opt/homebrew/bin/whisper-cli",
    "/opt/homebrew/opt/whisper-cpp/bin/whisper-cli",
    "/usr/local/bin/whisper-cli"
  ]);
  const ffmpeg = firstExisting([
    "/opt/homebrew/bin/ffmpeg",
    "/usr/local/bin/ffmpeg"
  ]);
  const modelDir = path.join(os.homedir(), "Library/Application Support/app.concat.editor/whisper-models");
  const modelPath = firstExisting([
    path.join(modelDir, "ggml-small.bin"),
    path.join(modelDir, "ggml-base.bin"),
    path.join(modelDir, "ggml-tiny.bin"),
    "/opt/homebrew/share/whisper-cpp/ggml-base.bin",
    path.join(os.homedir(), ".cache/whisper/ggml-base.bin")
  ]);
  return {
    available: Boolean(binary && ffmpeg && modelPath),
    binary,
    ffmpeg,
    modelPath,
    modelName: modelPath ? path.basename(modelPath) : null
  };
}

function execFileAsync(cmd, args, timeoutMs) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { timeout: timeoutMs || 45000, maxBuffer: 4 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        err.stderr = stderr;
        reject(err);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

function getVersionHash() {
  const tracked = [
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
    "coach.js"
  ];
  let stamp = 0;
  for (const name of tracked) {
    try {
      const st = fs.statSync(path.join(ROOT, name));
      if (st.mtimeMs > stamp) stamp = st.mtimeMs;
    } catch (_) {}
  }
  return String(Math.floor(stamp));
}

function readRawBody(req, limitBytes) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on("data", (chunk) => {
      total += chunk.length;
      if (total > limitBytes) {
        reject(new Error("PAYLOAD_TOO_LARGE"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function sendJson(res, statusCode, obj) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, no-cache, must-revalidate"
  });
  res.end(JSON.stringify(obj));
}

function extFromContentType(ct) {
  const c = String(ct || "").toLowerCase();
  if (c.includes("mp4") || c.includes("m4a") || c.includes("aac")) return ".m4a";
  if (c.includes("ogg")) return ".ogg";
  if (c.includes("wav")) return ".wav";
  return ".webm";
}

const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2:3b";

function cleanTranscript(raw) {
  return String(raw || "")
    .replace(/\[(BLANK_AUDIO|INAUDIBLE|MUSIC|APPLAUSE|LAUGHTER|SILENCE)\]/gi, "")
    .replace(/\((music|silence|applause|laughter)\)/gi, "")
    // Fix exact unambiguous acoustic homophones for Indonesian medical/export terminology
    .replace(/\b(?:EDAQ|E-?DAK|I-?DAC|IDAC)\b/g, "IDAK")
    .replace(/\bC-?D-?A-?K-?B\b/gi, "CDAKB")
    .replace(/\bKemal\s+(?:Torik|Thorik|Toriq)\b/gi, "Kemal Thoriq")
    .replace(/\bNadeem\s+Malick\b/gi, "Nadeem Malik")
    .replace(/\s+/g, " ")
    .trim();
}

async function checkOllamaHealth() {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 700);
    const res = await fetch(`${OLLAMA_URL}/api/tags`, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return { available: false, model: null };
    const json = await res.json();
    const models = Array.isArray(json.models) ? json.models.map((m) => m.name) : [];
    const chosen = models.find((n) => n === OLLAMA_MODEL) || models[0] || null;
    return { available: Boolean(chosen), model: chosen };
  } catch (_) {
    return { available: false, model: null };
  }
}

async function queryOllamaJson(prompt, maxTokens) {
  const health = await checkOllamaHealth();
  if (!health.available) return null;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 32000);
  try {
    const res = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: ctrl.signal,
      body: JSON.stringify({
        model: health.model,
        prompt,
        stream: false,
        format: "json",
        options: { temperature: 0.2, num_predict: maxTokens || 320, num_ctx: 2048 }
      })
    });
    clearTimeout(t);
    if (!res.ok) return null;
    const data = await res.json();
    const rawResp = String(data && data.response || "{}");
    let parsed;
    try {
      parsed = JSON.parse(rawResp);
    } catch (_) {
      const m = rawResp.match(/\{[\s\S]*\}/);
      parsed = m ? JSON.parse(m[0]) : {};
    }
    return { model: health.model, data: parsed };
  } catch (_) {
    clearTimeout(t);
    return null;
  }
}

function cleanStr(val) {
  return String(val || "")
    .replace(/[\u2013\u2014]/g, ", ")
    .replace(/\s+/g, " ")
    .trim();
}

async function handleCoachAi(req, res) {
  let raw;
  try { raw = await readRawBody(req, 64 * 1024); } catch (_) { sendJson(res, 400, { ok: false }); return; }
  let body;
  try { body = JSON.parse(raw.toString("utf8")); } catch (_) { sendJson(res, 400, { ok: false }); return; }
  const text = String(body && body.text || "").trim();
  if (!text) { sendJson(res, 400, { ok: false, error: "Empty text" }); return; }

  const prompt = [
    "You are a concise IELTS Band 8.5 English coach for Indonesian professionals.",
    "Preserve ALL facts and proper nouns (Kemal, Malik, IDAK, CDAKB, Kemenkes, kemiri) across EVERY sentence of Input.",
    "CRITICAL RULES:",
    "- corrected MUST fix ALL sentences in Input (do NOT drop later sentences).",
    "- c1Upgrade MUST rewrite ALL sentences in Input at Band 7.5-8.5 level.",
    "- Every fixes[].right MUST be natural ENGLISH (never write Indonesian in right).",
    "- Every fixes[].whyId and intentSummaryId MUST be written in clear Bahasa Indonesia.",
    "Return valid JSON object with STRING values only:",
    "topicId: short Indonesian topic label matching the actual text,",
    "intentSummaryId: 1 crisp Indonesian sentence explaining what the speaker means,",
    "corrected: full grammatically corrected ENGLISH version covering every sentence,",
    "c1Upgrade: full Band 7.5-8.5 executive ENGLISH rewrite covering every sentence,",
    "fixes: array of max 4 objects {wrong: string, right: ENGLISH string, whyId: Indonesian string},",
    "nextEn: 1 natural follow-up ENGLISH sentence,",
    "nextId: Indonesian translation of nextEn.",
    "Input: " + JSON.stringify(text)
  ].join("\n");

  const out = await queryOllamaJson(prompt, 480);
  if (!out) {
    sendJson(res, 503, { ok: false, error: "Ollama local AI not active" });
    return;
  }
  const d = out.data || {};
  const rawFixes = Array.isArray(d.fixes) ? d.fixes.slice(0, 4) : [];
  const fixes = rawFixes
    .filter((f) => f && f.wrong && f.right && !/\b(?:kami|saya|karena|untuk|sekarang|adalah)\b/i.test(String(f.right)))
    .map((f) => ({ wrong: cleanStr(f.wrong), right: cleanStr(f.right), whyId: cleanStr(f.whyId) }));

  const minLen = Math.floor(text.length * 0.55);
  const corrected = cleanStr(d.corrected);
  const c1Upgrade = cleanStr(d.c1Upgrade);

  sendJson(res, 200, {
    ok: true,
    model: out.model,
    analysis: {
      topicId: cleanStr(d.topicId),
      intentSummaryId: cleanStr(d.intentSummaryId),
      corrected: corrected.length >= minLen ? corrected : "",
      c1Upgrade: c1Upgrade.length >= minLen ? c1Upgrade : "",
      fixes,
      nextEn: cleanStr(d.nextEn),
      nextId: cleanStr(d.nextId)
    }
  });
}

async function handleTranslateAi(req, res) {
  let raw;
  try { raw = await readRawBody(req, 32 * 1024); } catch (_) { sendJson(res, 400, { ok: false }); return; }
  let body;
  try { body = JSON.parse(raw.toString("utf8")); } catch (_) { sendJson(res, 400, { ok: false }); return; }
  const indo = String((body && (body.indo || body.text)) || "").trim();
  if (!indo) { sendJson(res, 400, { ok: false, error: "Empty text" }); return; }

  const prompt = [
    "You are an Indonesian-to-native-English communication coach.",
    "Translate the Indonesian thought below accurately, preserving every real name, date, or fact.",
    "Write direct ready-to-say sentences only (NO bracket placeholders like [Name], match the implied tense, NO greetings unless requested).",
    "Return valid JSON object where EVERY value is a non-empty STRING:",
    "b1: polite clear everyday English string,",
    "b2: smooth business English string,",
    "c1: executive Band 8.0 English string,",
    "formal: formal professional phrasing string,",
    "casual: natural spoken/WhatsApp phrasing string,",
    "tipId: 1 practical explanation sentence written IN BAHASA INDONESIA (string, NOT English, NOT a number).",
    "Indonesian thought: " + JSON.stringify(indo)
  ].join("\n");

  const out = await queryOllamaJson(prompt, 300);
  if (!out) {
    sendJson(res, 503, { ok: false, error: "Ollama local AI not active" });
    return;
  }
  const d = out.data || {};
  sendJson(res, 200, {
    ok: true,
    model: out.model,
    translation: {
      b1: cleanStr(d.b1),
      b2: cleanStr(d.b2),
      c1: cleanStr(d.c1),
      formal: cleanStr(d.formal),
      casual: cleanStr(d.casual),
      tipId: typeof d.tipId === "string" ? cleanStr(d.tipId) : "Fokus pada pemilihan kata kerja yang langsung menjelaskan inti pesan tanpa menerjemahkan kata demi kata."
    }
  });
}

async function handleTranscribe(req, res, urlObj) {
  const stack = getSpeechStack();
  if (!stack.available) {
    sendJson(res, 503, { ok: false, error: "Engine Whisper lokal belum siap di server." });
    return;
  }

  let body;
  try {
    body = await readRawBody(req, MAX_AUDIO_BYTES);
  } catch (err) {
    if (err && err.message === "PAYLOAD_TOO_LARGE") {
      sendJson(res, 413, { ok: false, error: "Rekaman melebihi batas 25 MB." });
    } else {
      sendJson(res, 400, { ok: false, error: "Gagal membaca data audio." });
    }
    return;
  }

  if (!body || body.length < 200) {
    sendJson(res, 400, { ok: false, error: "Data audio kosong." });
    return;
  }

  const reqLang = String(urlObj.searchParams.get("lang") || "auto").toLowerCase();
  const langArg = reqLang === "id" || reqLang === "en" ? reqLang : "auto";
  const prefix = path.join(os.tmpdir(), `jago-mic-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
  const inFile = prefix + extFromContentType(req.headers["content-type"]);
  const wavFile = prefix + ".wav";

  const startedAt = Date.now();
  try {
    fs.writeFileSync(inFile, body);
    await execFileAsync(stack.ffmpeg, [
      "-y", "-i", inFile,
      "-ar", "16000",
      "-ac", "1",
      "-c:a", "pcm_s16le",
      wavFile
    ], 25000);

    const wArgs = [
      "-m", stack.modelPath,
      "-l", langArg,
      "-nt", "-np", "-sns",
      "-f", wavFile
    ];
    const { stdout } = await execFileAsync(stack.binary, wArgs, 45000);
    const text = cleanTranscript(stdout);
    sendJson(res, 200, {
      ok: true,
      text,
      lang: langArg,
      elapsedMs: Date.now() - startedAt,
      engine: "whisper-local",
      modelName: stack.modelName
    });
  } catch (err) {
    sendJson(res, 500, {
      ok: false,
      error: "Proses transkripsi suara gagal: " + (err && err.message ? err.message : "unknown")
    });
  } finally {
    try { if (fs.existsSync(inFile)) fs.unlinkSync(inFile); } catch (_) {}
    try { if (fs.existsSync(wavFile)) fs.unlinkSync(wavFile); } catch (_) {}
  }
}

const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = decodeURIComponent(urlObj.pathname);

  if (pathname === "/__version") {
    sendJson(res, 200, { version: getVersionHash() });
    return;
  }

  if (pathname === "/api/speech-health" && req.method === "GET") {
    sendJson(res, 200, getSpeechStack());
    return;
  }

  if (pathname === "/api/ai-health" && req.method === "GET") {
    checkOllamaHealth().then((h) => sendJson(res, 200, h));
    return;
  }

  if (pathname === "/api/coach-ai" && req.method === "POST") {
    handleCoachAi(req, res);
    return;
  }

  if (pathname === "/api/translate-ai" && req.method === "POST") {
    handleTranslateAi(req, res);
    return;
  }

  if (pathname === "/api/transcribe" && req.method === "POST") {
    handleTranscribe(req, res, urlObj);
    return;
  }

  const relPath = pathname === "/" ? "/index.html" : pathname;
  const safePath = path.normalize(path.join(ROOT, relPath));

  if (!safePath.startsWith(ROOT)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("403 Forbidden");
    return;
  }

  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
      const notFoundPage = path.join(ROOT, "404.html");
      if (fs.existsSync(notFoundPage)) {
        res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
        fs.createReadStream(notFoundPage).pipe(res);
      } else {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("404 Not Found");
      }
      return;
    }

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-store, no-cache, must-revalidate"
    });

    fs.createReadStream(safePath).pipe(res);
  });
});

server.listen(PORT, "127.0.0.1", () => {
  const stack = getSpeechStack();
  console.log(`JAGO ENGLISH Live Server running at http://localhost:${PORT} (Whisper local: ${stack.available ? stack.modelName : "unavailable"})`);
});
