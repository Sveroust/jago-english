(function () {
  "use strict";

  var CFG_KEY = "jago_ai_online_cfg_v1";

  var DEFAULT_CFG = {
    provider: "auto",
    geminiKey: "",
    geminiModel: "gemini-2.5-flash",
    groqKey: "",
    groqModel: "llama-3.3-70b-versatile",
    useGroqWhisper: false
  };

  function cleanStr(val) {
    return String(val || "")
      .replace(/[\u2013\u2014]/g, ", ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function loadConfig() {
    var cfg = JSON.parse(JSON.stringify(DEFAULT_CFG));
    try {
      var raw = window.localStorage.getItem(CFG_KEY);
      if (!raw) return cfg;
      var parsed = JSON.parse(raw);
      Object.keys(cfg).forEach(function (k) {
        if (parsed[k] !== undefined && parsed[k] !== null) {
          cfg[k] = parsed[k];
        }
      });
    } catch (_) {}
    return cfg;
  }

  function saveConfig(patch) {
    var cur = loadConfig();
    Object.keys(patch || {}).forEach(function (k) {
      if (DEFAULT_CFG.hasOwnProperty(k)) {
        cur[k] = patch[k];
      }
    });
    try {
      window.localStorage.setItem(CFG_KEY, JSON.stringify(cur));
    } catch (_) {}
    return cur;
  }

  function isLocalOrigin() {
    var loc = window.location || {};
    var host = loc.hostname || "";
    return host === "localhost" || host === "127.0.0.1" || loc.port === "8088";
  }

  function getActiveTierInfo() {
    var cfg = loadConfig();
    var p = cfg.provider || "auto";
    if ((p === "groq" || (p === "auto" && cfg.groqKey)) && cfg.groqKey) {
      return { id: "groq", label: "Groq Cloud Aktif (Super-Pintar Online)", isCloudKey: true };
    }
    if ((p === "gemini" || (p === "auto" && cfg.geminiKey)) && cfg.geminiKey) {
      return { id: "gemini", label: "Google Gemini Aktif (Super-Pintar Online)", isCloudKey: true };
    }
    if (p === "local" && isLocalOrigin()) {
      return { id: "local", label: "Server Laptop Lokal Aktif", isCloudKey: false };
    }
    return { id: "free", label: "Mode Gratis Online (Tanpa Key)", isCloudKey: false };
  }

  function extractJson(raw) {
    var s = String(raw || "").trim();
    s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    try {
      return JSON.parse(s);
    } catch (_) {
      var m = s.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("Format respons JSON AI tidak terbaca.");
      return JSON.parse(m[0]);
    }
  }

  function fetchWithTimeout(url, opts, timeoutMs) {
    var ms = timeoutMs || 18000;
    if (typeof AbortController !== "undefined") {
      var ctrl = new AbortController();
      var timer = setTimeout(function () { ctrl.abort(); }, ms);
      var nextOpts = {};
      Object.keys(opts || {}).forEach(function (k) { nextOpts[k] = opts[k]; });
      nextOpts.signal = ctrl.signal;
      return window.fetch(url, nextOpts).then(function (r) {
        clearTimeout(timer);
        return r;
      }, function (err) {
        clearTimeout(timer);
        throw err;
      });
    }
    return window.fetch(url, opts);
  }

  function callGeminiJson(promptText, cfg) {
    var key = String(cfg.geminiKey || "").trim();
    if (!key) return Promise.reject(new Error("API Key Gemini belum diisi."));
    var model = cfg.geminiModel || "gemini-2.5-flash";
    var url = "https://generativelanguage.googleapis.com/v1beta/models/" +
      encodeURIComponent(model) + ":generateContent?key=" + encodeURIComponent(key);

    return fetchWithTimeout(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: {
          temperature: 0.25,
          responseMimeType: "application/json"
        }
      })
    }, 22000).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) {
          var msg = (data && data.error && data.error.message) || ("Gemini HTTP " + res.status);
          throw new Error(msg);
        }
        var part = data && data.candidates && data.candidates[0] &&
          data.candidates[0].content && data.candidates[0].content.parts &&
          data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;
        return { model: model, source: "Google Gemini (" + model + ")", data: extractJson(part) };
      });
    });
  }

  function callGroqJson(promptText, cfg) {
    var key = String(cfg.groqKey || "").trim();
    if (!key) return Promise.reject(new Error("API Key Groq belum diisi."));
    var model = cfg.groqModel || "llama-3.3-70b-versatile";
    return fetchWithTimeout("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + key
      },
      body: JSON.stringify({
        model: model,
        temperature: 0.25,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "You are an elite bilingual English-Indonesian communication coach (IELTS Band 8.5+ and executive business standard). Output valid JSON only."
          },
          { role: "user", content: promptText }
        ]
      })
    }, 22000).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) {
          var msg = (data && data.error && data.error.message) || ("Groq HTTP " + res.status);
          throw new Error(msg);
        }
        var content = data && data.choices && data.choices[0] &&
          data.choices[0].message && data.choices[0].message.content;
        return { model: model, source: "Groq Cloud (" + model + ")", data: extractJson(content) };
      });
    });
  }

  function splitIntoChunks(text, maxLen) {
    var clean = cleanStr(text);
    if (clean.length <= maxLen) return [clean];
    var parts = clean.match(/[^.!?]+[.!?]?/g) || [clean];
    var chunks = [];
    var cur = "";
    parts.forEach(function (p) {
      var trimmed = p.trim();
      if (!trimmed) return;
      if ((cur + " " + trimmed).trim().length <= maxLen) {
        cur = (cur + " " + trimmed).trim();
      } else {
        if (cur) chunks.push(cur);
        cur = trimmed.length > maxLen ? trimmed.slice(0, maxLen) : trimmed;
      }
    });
    if (cur) chunks.push(cur);
    return chunks.slice(0, 4);
  }

  function callMyMemorySingle(text, langpair) {
    var url = "https://api.mymemory.translated.net/get?q=" +
      encodeURIComponent(text) + "&langpair=" + encodeURIComponent(langpair);
    return fetchWithTimeout(url, { method: "GET" }, 8000).then(function (res) {
      if (!res.ok) throw new Error("MyMemory HTTP " + res.status);
      return res.json();
    }).then(function (json) {
      var main = json && json.responseData && json.responseData.translatedText
        ? cleanStr(json.responseData.translatedText)
        : "";
      var alts = [];
      if (json && Array.isArray(json.matches)) {
        json.matches.forEach(function (m) {
          if (m && m.translation && cleanStr(m.translation) && alts.indexOf(cleanStr(m.translation)) === -1) {
            alts.push(cleanStr(m.translation));
          }
        });
      }
      return { main: main, alts: alts };
    });
  }

  function translateViaMyMemory(text, langpair) {
    var chunks = splitIntoChunks(text, 440);
    return Promise.all(chunks.map(function (ch) { return callMyMemorySingle(ch, langpair); }))
      .then(function (results) {
        var joined = results.map(function (r) { return r.main; }).filter(Boolean).join(" ");
        var altJoined = results.length === 1 ? results[0].alts : [];
        return { main: cleanStr(joined), alts: altJoined };
      });
  }

  function toPhonetics(enText) {
    if (window.JagoCoachCore && typeof window.JagoCoachCore.toIndonesianPhonetics === "function") {
      return window.JagoCoachCore.toIndonesianPhonetics(enText, window.COACH_DATA || {});
    }
    return "";
  }

  function pickCloudRunner(cfg) {
    var pref = cfg.provider || "auto";
    if (pref === "free") return null;
    if (pref === "gemini") return cfg.geminiKey ? callGeminiJson : null;
    if (pref === "groq") return cfg.groqKey ? callGroqJson : null;
    if (pref === "auto") {
      if (cfg.groqKey) return callGroqJson;
      if (cfg.geminiKey) return callGeminiJson;
    }
    return null;
  }

  function polishIndonesianEnglishTokens(text) {
    var out = cleanStr(text);
    if (window.JagoCoachCore && typeof window.JagoCoachCore.applyRules === "function" && window.COACH_DATA) {
      var ruled = window.JagoCoachCore.applyRules(out, window.COACH_DATA.errorRules || []);
      if (ruled && ruled.corrected) out = cleanStr(ruled.corrected);
    }
    return out;
  }

  function analyzeEnglish(text, localAnalysis) {
    var cfg = loadConfig();
    var runner = pickCloudRunner(cfg);

    if (runner) {
      var prompt = [
        "Analyze the learner's English input below (it might include occasional Indonesian filler words or informal speech).",
        "Preserve EVERY fact and proper noun (such as Kemal, Malik, IDAK, CDAKB, Kemenkes, kemiri) across ALL sentences.",
        "Return strict JSON with these EXACT keys:",
        "cefr: estimated current CEFR level string (e.g. 'A2', 'B1', 'B1+', 'B2', 'C1'),",
        "statusBadge: short Indonesian assessment badge (e.g. 'Paham Maksudnya, Perlu Polesan Grammar' or 'Sudah Tepat & Natural'),",
        "meaningId: complete, natural Indonesian translation explaining what a native English speaker actually understands from the user's input,",
        "corrected: full grammatically accurate English version preserving the exact meaning across all sentences,",
        "tiers: object with keys casual ({en, id}), professional ({en, id}), executive ({en, id}) representing everyday B1, business B2, and executive Band 8.0 C1 versions,",
        "fixes: array of up to 5 objects {wrong: string, right: ENGLISH string, whyId: clear Bahasa Indonesia explanation},",
        "nextEn: 1 helpful follow-up English sentence the user could say next,",
        "nextId: natural Indonesian meaning of nextEn.",
        "Do not use em-dashes or en-dashes. User English input: " + JSON.stringify(text)
      ].join("\n");

      return runner(prompt, cfg).then(function (res) {
        var d = res.data || {};
        var t = d.tiers || {};
        function normTier(obj) {
          var o = obj || {};
          var en = cleanStr(o.en);
          return {
            en: en,
            id: cleanStr(o.id),
            phonetic: en ? toPhonetics(en) : ""
          };
        }
        var fixes = Array.isArray(d.fixes) ? d.fixes.slice(0, 5).filter(function (f) {
          return f && f.wrong && f.right;
        }).map(function (f) {
          return { wrong: cleanStr(f.wrong), right: cleanStr(f.right), whyId: cleanStr(f.whyId) };
        }) : [];

        return {
          ok: true,
          mode: "cloud-ai",
          source: res.source,
          cefr: cleanStr(d.cefr) || "B1+",
          statusBadge: cleanStr(d.statusBadge) || "Analisis AI Aktif",
          meaningId: cleanStr(d.meaningId),
          corrected: cleanStr(d.corrected) || (localAnalysis && localAnalysis.corrected) || text,
          tiers: {
            casual: normTier(t.casual),
            professional: normTier(t.professional),
            executive: normTier(t.executive)
          },
          fixes: fixes,
          nextEn: cleanStr(d.nextEn),
          nextId: cleanStr(d.nextId)
        };
      });
    }

    if (cfg.provider === "local" && isLocalOrigin()) {
      return analyzeEnglishLocalOllama(text, localAnalysis).catch(function () {
        return analyzeEnglishFreeOnline(text, localAnalysis);
      });
    }

    return analyzeEnglishFreeOnline(text, localAnalysis).catch(function () {
      if (isLocalOrigin() && cfg.provider !== "free") {
        return analyzeEnglishLocalOllama(text, localAnalysis);
      }
      return buildOfflineCoachFallback(text, localAnalysis);
    });
  }

  function analyzeEnglishLocalOllama(text, localAnalysis) {
    return fetchWithTimeout("/api/coach-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text })
    }, 18000).then(function (r) {
      if (!r.ok) throw new Error("local-off");
      return r.json();
    }).then(function (json) {
      if (!json || !json.ok || !json.analysis) throw new Error("local-empty");
      var a = json.analysis;
      var execEn = cleanStr(a.c1Upgrade) || (localAnalysis && localAnalysis.c1Upgrade) || text;
      var profEn = cleanStr(a.corrected) || (localAnalysis && localAnalysis.corrected) || text;
      return {
        ok: true,
        mode: "local-ai",
        source: "Ollama Lokal (" + (json.model || "llama3.2:3b") + ")",
        cefr: localAnalysis && localAnalysis.stats ? ("Band ~" + localAnalysis.stats.overall.toFixed(1)) : "B1+",
        statusBadge: cleanStr(a.topicId) || "Analisis Konteks Lokal",
        meaningId: cleanStr(a.intentSummaryId),
        corrected: profEn,
        tiers: {
          casual: { en: profEn, id: "", phonetic: toPhonetics(profEn) },
          professional: { en: profEn, id: "", phonetic: toPhonetics(profEn) },
          executive: { en: execEn, id: "", phonetic: toPhonetics(execEn) }
        },
        fixes: Array.isArray(a.fixes) ? a.fixes : [],
        nextEn: cleanStr(a.nextEn),
        nextId: cleanStr(a.nextId)
      };
    });
  }

  function buildOfflineCoachFallback(text, localAnalysis) {
    var corrected = (localAnalysis && localAnalysis.corrected) ? localAnalysis.corrected : text;
    var c1 = (localAnalysis && localAnalysis.c1Upgrade) ? localAnalysis.c1Upgrade : corrected;
    return {
      ok: true,
      mode: "offline",
      source: "Engine Lokal Perangkat",
      cefr: localAnalysis && localAnalysis.stats ? ("Est. Band " + localAnalysis.stats.overall.toFixed(1)) : "B1",
      statusBadge: "Mode Offline",
      meaningId: "",
      corrected: corrected,
      tiers: {
        casual: { en: corrected, id: "", phonetic: toPhonetics(corrected) },
        professional: { en: corrected, id: "", phonetic: toPhonetics(corrected) },
        executive: { en: c1, id: "", phonetic: toPhonetics(c1) }
      },
      fixes: [],
      nextEn: "",
      nextId: ""
    };
  }

  function analyzeEnglishFreeOnline(text, localAnalysis) {
    var corrected = (localAnalysis && localAnalysis.corrected) ? localAnalysis.corrected : text;
    var c1 = (localAnalysis && localAnalysis.c1Upgrade) ? localAnalysis.c1Upgrade : corrected;

    return translateViaMyMemory(corrected, "en|id").then(function (tr) {
      return {
        ok: true,
        mode: "free-online",
        source: "Gratis Online (LanguageTool + MyMemory)",
        cefr: localAnalysis && localAnalysis.stats ? ("Est. Band " + localAnalysis.stats.overall.toFixed(1)) : "B1",
        statusBadge: (localAnalysis && localAnalysis.findings && localAnalysis.findings.length > 0)
          ? (localAnalysis.findings.length + " Poin Perbaikan Ditemukan")
          : "Struktur Kalimat Jelas",
        meaningId: tr.main || "",
        corrected: corrected,
        tiers: {
          casual: { en: corrected, id: tr.main || "", phonetic: toPhonetics(corrected) },
          professional: { en: corrected, id: tr.main || "", phonetic: toPhonetics(corrected) },
          executive: { en: c1, id: tr.main || "", phonetic: toPhonetics(c1) }
        },
        fixes: [],
        nextEn: "",
        nextId: ""
      };
    });
  }

  function translateIndonesian(indoText) {
    var cfg = loadConfig();
    var runner = pickCloudRunner(cfg);

    if (runner) {
      var prompt = [
        "The user is an Indonesian speaker expressing a thought freely in Indonesian (possibly casual, mixed with English, or unstructured).",
        "Understand their real intent and convert it into high-standard English across levels, plus provide Indonesian back-translations so they know what each version sounds like.",
        "Preserve every real name, acronym, time, or fact (such as Kemal, Malik, IDAK, CDAKB, Kemenkes, kemiri, Jakarta).",
        "Write ready-to-say English sentences with ZERO bracket placeholders like [Name]. Never use em-dashes or en-dashes.",
        "Return strict JSON with keys:",
        "summaryId: 1 crisp Indonesian sentence confirming what you understood the user wants to say,",
        "tipId: 1 practical grammar or vocabulary tip in Bahasa Indonesia explaining the upgrade,",
        "levels: array of 3 objects with {code: 'B1'|'B2'|'C1', label: Indonesian label, en: English translation, backId: Indonesian back-translation of en, nuanceId: short Indonesian note on tone/listener impression},",
        "formal: {en: formal email/executive phrasing, backId: Indonesian meaning},",
        "casual: {en: friendly daily spoken/WhatsApp phrasing, backId: Indonesian meaning}.",
        "Indonesian thought: " + JSON.stringify(indoText)
      ].join("\n");

      return runner(prompt, cfg).then(function (res) {
        var d = res.data || {};
        var lvls = Array.isArray(d.levels) ? d.levels.map(function (lv) {
          var en = cleanStr(lv.en);
          return {
            code: cleanStr(lv.code) || "B2",
            label: cleanStr(lv.label) || "Tingkat Lanjut",
            en: en,
            backId: cleanStr(lv.backId),
            nuanceId: cleanStr(lv.nuanceId),
            phonetic: toPhonetics(en)
          };
        }).filter(function (x) { return Boolean(x.en); }) : [];

        return {
          ok: true,
          mode: "cloud-ai",
          source: res.source,
          summaryId: cleanStr(d.summaryId),
          tipId: cleanStr(d.tipId),
          levels: lvls,
          formal: {
            en: cleanStr(d.formal && d.formal.en),
            backId: cleanStr(d.formal && d.formal.backId),
            phonetic: toPhonetics(cleanStr(d.formal && d.formal.en))
          },
          casual: {
            en: cleanStr(d.casual && d.casual.en),
            backId: cleanStr(d.casual && d.casual.backId),
            phonetic: toPhonetics(cleanStr(d.casual && d.casual.en))
          }
        };
      });
    }

    if (cfg.provider === "local" && isLocalOrigin()) {
      return translateIndonesianLocalOllama(indoText).catch(function () {
        return translateIndonesianFreeOnline(indoText);
      });
    }

    return translateIndonesianFreeOnline(indoText).catch(function (err) {
      if (isLocalOrigin() && cfg.provider !== "free") {
        return translateIndonesianLocalOllama(indoText);
      }
      throw err;
    });
  }

  function translateIndonesianLocalOllama(indoText) {
    return fetchWithTimeout("/api/translate-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ indo: indoText })
    }, 16000).then(function (r) {
      if (!r.ok) throw new Error("local-off");
      return r.json();
    }).then(function (json) {
      if (!json || !json.ok || !json.translation) throw new Error("local-empty");
      var tr = json.translation;
      var levels = [];
      if (tr.b1) levels.push({ code: "B1", label: "Santai & Jelas (Sehari-hari)", en: cleanStr(tr.b1), backId: "", nuanceId: "Langsung dipahami untuk obrolan harian.", phonetic: toPhonetics(tr.b1) });
      if (tr.b2) levels.push({ code: "B2", label: "Kerja Profesional (Bisnis)", en: cleanStr(tr.b2), backId: "", nuanceId: "Sopan dan rapi untuk mitra kerja.", phonetic: toPhonetics(tr.b2) });
      if (tr.c1) levels.push({ code: "C1", label: "Eksekutif Standar Band 8.0", en: cleanStr(tr.c1), backId: "", nuanceId: "Berwibawa untuk rapat atau email resmi.", phonetic: toPhonetics(tr.c1) });
      return {
        ok: true,
        mode: "local-ai",
        source: "Ollama Lokal (" + (json.model || "llama3.2:3b") + ")",
        summaryId: "Hasil terjemahan kontekstual dari kalimat bebasmu.",
        tipId: cleanStr(tr.tipId),
        levels: levels,
        formal: { en: cleanStr(tr.formal), backId: "", phonetic: toPhonetics(tr.formal) },
        casual: { en: cleanStr(tr.casual), backId: "", phonetic: toPhonetics(tr.casual) }
      };
    });
  }

  function translateIndonesianFreeOnline(indoText) {
    return translateViaMyMemory(indoText, "id|en").then(function (res) {
      var primaryEn = polishIndonesianEnglishTokens(res.main || "");
      if (!primaryEn) throw new Error("Terjemahan publik tidak tersedia.");
      var altEn = res.alts.filter(function (a) { return a.toLowerCase() !== primaryEn.toLowerCase(); })[0];
      var polishedAlt = altEn ? polishIndonesianEnglishTokens(altEn) : primaryEn;
      var c1Text = primaryEn;
      if (window.JagoCoachCore && typeof window.JagoCoachCore.buildBand75Upgrade === "function" && window.COACH_DATA) {
        c1Text = cleanStr(window.JagoCoachCore.buildBand75Upgrade(primaryEn, window.COACH_DATA)) || primaryEn;
      }

      return translateViaMyMemory(c1Text, "en|id").catch(function () { return { main: indoText }; }).then(function (backRes) {
        var backId = cleanStr(backRes && backRes.main) || indoText;
        var levels = [
          {
            code: "B1",
            label: "Versi Dasar Jelas (Sehari-hari)",
            en: primaryEn,
            backId: backId,
            nuanceId: "Kalimat lugas yang langsung menyampaikan inti pikiranmu.",
            phonetic: toPhonetics(primaryEn)
          }
        ];
        if (polishedAlt && polishedAlt !== primaryEn) {
          levels.push({
            code: "B2",
            label: "Variasi Alternatif Natural",
            en: polishedAlt,
            backId: backId,
            nuanceId: "Pilihan kata berbeda dengan makna setara.",
            phonetic: toPhonetics(polishedAlt)
          });
        }
        if (c1Text && c1Text !== primaryEn) {
          levels.push({
            code: "C1",
            label: "Polesan Lebih Formal & Rapi",
            en: c1Text,
            backId: backId,
            nuanceId: "Versi lebih profesional saat berbicara ke mitra atau klien.",
            phonetic: toPhonetics(c1Text)
          });
        }
        return {
          ok: true,
          mode: "free-online",
          source: "Gratis Online (MyMemory + Engine Tata Bahasa)",
          summaryId: "Terjemahan langsung dari pikiran bahasa Indonesiamu beserta arti baliknya.",
          tipId: "Cek bagian 'Arti balik ke Indonesia' untuk memastikan maksudnya sudah sesuai sebelum diucapkan. Untuk variasi eksekutif A2 sampai C2 yang lebih mendalam, kamu juga bisa mengisi Key gratis Gemini/Groq di Tab 4.",
          levels: levels,
          formal: { en: c1Text, backId: backId, phonetic: toPhonetics(c1Text) },
          casual: { en: primaryEn, backId: backId, phonetic: toPhonetics(primaryEn) }
        };
      });
    });
  }

  function transcribeWithGroqWhisper(blob, lang, promptHint) {
    var cfg = loadConfig();
    var key = String(cfg.groqKey || "").trim();
    if (!key) return Promise.reject(new Error("Groq Key belum diisi."));
    var fd = new FormData();
    var ext = (blob && blob.type && blob.type.indexOf("mp4") !== -1) ? "m4a" : "webm";
    fd.append("file", blob, "speech." + ext);
    fd.append("model", "whisper-large-v3-turbo");
    if (lang === "id" || lang === "en") fd.append("language", lang);
    if (promptHint) fd.append("prompt", String(promptHint).slice(0, 200));

    return fetchWithTimeout("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { "Authorization": "Bearer " + key },
      body: fd
    }, 25000).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) {
          throw new Error((data && data.error && data.error.message) || ("Groq Whisper HTTP " + res.status));
        }
        return { text: cleanStr(data && data.text), engine: "groq-whisper" };
      });
    });
  }

  function testConnection(providerChoice) {
    var cfg = loadConfig();
    var p = providerChoice || cfg.provider || "auto";
    if (p === "gemini") {
      return callGeminiJson('Return strict JSON {"ok":true,"msg":"Koneksi Gemini berhasil!"}', cfg);
    }
    if (p === "groq") {
      return callGroqJson('Return strict JSON {"ok":true,"msg":"Koneksi Groq berhasil!"}', cfg);
    }
    return translateViaMyMemory("Selamat pagi, apa kabar?", "id|en").then(function (res) {
      return {
        source: "Gratis Online (MyMemory + LanguageTool)",
        data: { ok: Boolean(res.main), msg: "Layanan gratis online siap: " + res.main }
      };
    });
  }

  window.JagoAI = {
    loadConfig: loadConfig,
    saveConfig: saveConfig,
    getActiveTierInfo: getActiveTierInfo,
    isLocalOrigin: isLocalOrigin,
    analyzeEnglish: analyzeEnglish,
    translateIndonesian: translateIndonesian,
    transcribeWithGroqWhisper: transcribeWithGroqWhisper,
    testConnection: testConnection
  };
})();
