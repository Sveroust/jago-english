(function () {
  "use strict";

  var translationCache = {};

  function cleanStr(val) {
    return String(val || "")
      .replace(/[\u2013\u2014]/g, ", ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isQuotaWarning(text) {
    var s = String(text || "");
    return /MYMEMORY\s+WARNING|QUERY\s+LENGTH\s+LIMIT|YOU\s+USED\s+ALL\s+AVAILABLE/i.test(s);
  }

  function getActiveTierInfo() {
    return {
      id: "free",
      label: "Gratis Tanpa Key (LanguageTool + MyMemory)"
    };
  }

  function fetchWithTimeout(url, opts, timeoutMs) {
    var ms = timeoutMs || 9000;
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

  // Normalize casual/slang random Indonesian so free public machine translation understands everyday speech cleanly.
  function normalizeRandomIndonesian(raw) {
    var s = cleanStr(raw);
    if (!s) return "";
    var map = [
      [/\b(?:gw|gue|gua|aku)\b/gi, "saya"],
      [/\b(?:lu|lo|elu|kamu)\b/gi, "Anda"],
      [/\b(?:gak|nggak|ga|ngga|engga|enggak|kagak|tdk)\b/gi, "tidak"],
      [/\b(?:udah|udh|sdh)\b/gi, "sudah"],
      [/\b(?:lg|lagi)\b/gi, "sedang"],
      [/\b(?:capek|cape)\s+(?:bgt|banget|bgm)\b/gi, "sangat lelah"],
      [/\bpusing\s+(?:bgt|banget|bgm)\b/gi, "sangat kewalahan"],
      [/\b(macet|telat|sibuk|bagus|penting|lama|susah|sulit|mahal|murah|panas|hujan|deras|senang|bingung)\s+(?:bgt|banget|bgm)\b/gi, "sangat $1"],
      [/\b(?:bgt|banget|bgm|amat)\b/gi, "sekali"],
      [/\b(?:bener|beneran)\b/gi, "benar-benar"],
      [/\b(?:soalnya|krn)\b/gi, "karena"],
      [/\b(?:gara-gara|gara2)\b/gi, "akibat"],
      [/\b(?:trus|terus)\b/gi, "lalu"],
      [/\b(?:ntar|entar)\b/gi, "nanti"],
      [/\b(?:gimana|gmn)\b/gi, "bagaimana"],
      [/\b(?:kenapa|knp)\b/gi, "mengapa"],
      [/\b(?:dikit|sdkt)\b/gi, "sedikit"],
      [/\bmulu\b/gi, "terus-menerus"],
      [/\bbikin\b/gi, "membuat"],
      [/\bngomong\b/gi, "berbicara"],
      [/\bkasih\s+tahu\b/gi, "memberi tahu"],
      [/\bngasih\b/gi, "memberi"],
      [/\bketahan\b/gi, "tertahan"],
      [/\bpusing\b/gi, "kewalahan"],
      [/\b(?:capek|cape)\b/gi, "lelah"],
      [/\bmakasih\b/gi, "terima kasih"],
      [/\bpengen|pingin\b/gi, "ingin"],
      [/\bnumpuk\b/gi, "menumpuk"],
      [/\b(?:cepet|cpt)\b/gi, "cepat"],
      [/\b(?:kuy|yuk)\b/gi, "mari kita"],
      [/\baja\b/gi, "saja"],
      [/\b(?:kok|sih|nih|deh|loh|dong)\b/gi, ""],
      [/\bseenak\s+jidat\b/gi, "sesuka hati"],
      [/\b(?:yg)\b/gi, "yang"],
      [/\b(?:dgn)\b/gi, "dengan"],
      [/\b(?:utk)\b/gi, "untuk"],
      [/\b(?:dlm)\b/gi, "dalam"],
      [/\b(?:jg)\b/gi, "juga"],
      [/\b(?:blm)\b/gi, "belum"]
    ];
    map.forEach(function (pair) {
      s = s.replace(pair[0], pair[1]);
    });
    return cleanStr(s);
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
    var cacheKey = langpair + "|" + text;
    if (translationCache[cacheKey]) {
      return Promise.resolve(translationCache[cacheKey]);
    }

    var url = "https://api.mymemory.translated.net/get?q=" +
      encodeURIComponent(text) + "&langpair=" + encodeURIComponent(langpair);

    return fetchWithTimeout(url, { method: "GET" }, 9000).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    }).then(function (json) {
      var rawMain = json && json.responseData && json.responseData.translatedText
        ? cleanStr(json.responseData.translatedText)
        : "";
      if (json && json.quotaFinished || isQuotaWarning(rawMain)) {
        return { main: "", alts: [], quotaLimited: true };
      }
      var alts = [];
      if (json && Array.isArray(json.matches)) {
        json.matches.forEach(function (m) {
          var t = m && m.translation ? cleanStr(m.translation) : "";
          var qScore = Number(m && m.quality || 0);
          if (t && !isQuotaWarning(t) && qScore >= 50 && alts.indexOf(t) === -1) {
            alts.push(t);
          }
        });
      }
      var out = { main: rawMain, alts: alts, quotaLimited: false };
      if (rawMain) translationCache[cacheKey] = out;
      return out;
    });
  }

  function translateViaMyMemory(text, langpair) {
    var chunks = splitIntoChunks(text, 440);
    return Promise.all(chunks.map(function (ch) { return callMyMemorySingle(ch, langpair); }))
      .then(function (results) {
        var limited = results.some(function (r) { return r.quotaLimited; });
        var joined = results.map(function (r) { return r.main; }).filter(Boolean).join(" ");
        var altJoined = results.length === 1 ? results[0].alts : [];
        return {
          main: cleanStr(joined),
          alts: altJoined,
          quotaLimited: limited
        };
      });
  }

  function toPhonetics(enText) {
    if (window.JagoCoachCore && typeof window.JagoCoachCore.toIndonesianPhonetics === "function") {
      return window.JagoCoachCore.toIndonesianPhonetics(enText, window.COACH_DATA || {});
    }
    return "";
  }

  function buildLevels(enText) {
    if (window.JagoCoachCore && typeof window.JagoCoachCore.buildLeveledEnglish === "function") {
      return window.JagoCoachCore.buildLeveledEnglish(enText, window.COACH_DATA || {});
    }
    return { casualB1: enText, professionalB2: enText, executiveC1: enText };
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
    var corrected = (localAnalysis && localAnalysis.corrected) ? localAnalysis.corrected : text;
    var levels = buildLevels(corrected);
    var execText = (localAnalysis && localAnalysis.c1Upgrade) ? localAnalysis.c1Upgrade : levels.executiveC1;

    return translateViaMyMemory(corrected, "en|id").then(function (tr) {
      var statusNote = (localAnalysis && localAnalysis.findings && localAnalysis.findings.length > 0)
        ? (localAnalysis.findings.length + " Poin Perbaikan Tata Bahasa")
        : "Struktur Kalimat Rapi";

      return {
        ok: true,
        mode: tr.quotaLimited ? "quota-limit" : "free-online",
        source: tr.quotaLimited
          ? "Engine Lokal (Limit Harian MyMemory Tercapai)"
          : "Gratis Online (LanguageTool + MyMemory)",
        quotaLimited: Boolean(tr.quotaLimited),
        cefr: localAnalysis && localAnalysis.stats ? ("Est. Band " + localAnalysis.stats.overall.toFixed(1)) : "B1",
        statusBadge: statusNote,
        meaningId: tr.main || "",
        corrected: corrected,
        tiers: {
          casual: { en: levels.casualB1 || corrected, id: tr.main || "", phonetic: toPhonetics(levels.casualB1 || corrected) },
          professional: { en: levels.professionalB2 || corrected, id: tr.main || "", phonetic: toPhonetics(levels.professionalB2 || corrected) },
          executive: { en: execText || levels.executiveC1, id: tr.main || "", phonetic: toPhonetics(execText || levels.executiveC1) }
        }
      };
    }).catch(function () {
      return {
        ok: true,
        mode: "offline",
        source: "Engine Lokal Perangkat (Offline)",
        quotaLimited: false,
        cefr: localAnalysis && localAnalysis.stats ? ("Est. Band " + localAnalysis.stats.overall.toFixed(1)) : "B1",
        statusBadge: "Mode Offline",
        meaningId: "",
        corrected: corrected,
        tiers: {
          casual: { en: levels.casualB1 || corrected, id: "", phonetic: toPhonetics(levels.casualB1 || corrected) },
          professional: { en: levels.professionalB2 || corrected, id: "", phonetic: toPhonetics(levels.professionalB2 || corrected) },
          executive: { en: execText || levels.executiveC1, id: "", phonetic: toPhonetics(execText || levels.executiveC1) }
        }
      };
    });
  }

  function translateIndonesian(indoText) {
    var normalizedIndo = normalizeRandomIndonesian(indoText);
    var changedSlang = normalizedIndo.toLowerCase() !== cleanStr(indoText).toLowerCase();

    return translateViaMyMemory(normalizedIndo, "id|en").then(function (res) {
      if (res.quotaLimited || !res.main) {
        return {
          ok: true,
          quotaLimited: Boolean(res.quotaLimited),
          source: res.quotaLimited ? "Limit Harian MyMemory Tercapai" : "Mode Offline",
          normalizedIndo: changedSlang ? normalizedIndo : "",
          summaryId: res.quotaLimited
            ? "Kuota harian gratis MyMemory sedang penuh sementara. Pelajari jembatan frasa dan nuansa kosakata di atas sambil menunggu reset otomatis."
            : "Koneksi internet ke MyMemory tidak terjangkau.",
          tipId: "Tetap berlatih menyusun kalimat memakai frasa inti di atas, lalu tempel hasilnya di Mode A untuk pemeriksaan tata bahasa.",
          levels: []
        };
      }

      var primaryEn = polishIndonesianEnglishTokens(res.main);
      var built = buildLevels(primaryEn);
      var altCandidate = res.alts.filter(function (a) {
        return a.toLowerCase() !== primaryEn.toLowerCase() &&
          a.toLowerCase() !== built.professionalB2.toLowerCase();
      })[0];
      var b2Text = altCandidate ? polishIndonesianEnglishTokens(altCandidate) : built.professionalB2;
      var c1Text = built.executiveC1;

      return translateViaMyMemory(b2Text, "en|id").catch(function () {
        return { main: normalizedIndo, quotaLimited: false };
      }).then(function (backRes) {
        var backId = (!backRes.quotaLimited && backRes.main) ? backRes.main : normalizedIndo;
        var levels = [
          {
            code: "B1",
            label: "Santai & Jelas (Sehari-hari)",
            en: built.casualB1,
            backId: backId,
            nuanceId: "Ramah dan langsung mengalir untuk obrolan harian atau WhatsApp.",
            phonetic: toPhonetics(built.casualB1)
          },
          {
            code: "B2",
            label: "Kerja Profesional (Bisnis)",
            en: b2Text,
            backId: backId,
            nuanceId: "Rapi, sopan, dan jelas untuk komunikasi kantor atau klien.",
            phonetic: toPhonetics(b2Text)
          },
          {
            code: "C1",
            label: "Eksekutif Standar Tinggi (IELTS 7.5+)",
            en: c1Text,
            backId: backId,
            nuanceId: "Pilihan kosakata lebih matang dan meyakinkan di rapat formal.",
            phonetic: toPhonetics(c1Text)
          }
        ];

        return {
          ok: true,
          quotaLimited: false,
          source: "Gratis Online (MyMemory + Engine Tata Bahasa)",
          normalizedIndo: changedSlang ? normalizedIndo : "",
          summaryId: "Arti bebasmu sudah dirapikan menjadi bahasa Inggris bertingkat lengkap dengan arti baliknya.",
          tipId: "Cek kotak 'Arti balik & maksudnya' untuk memastikan nuansa kalimat sudah sesuai keinginanmu sebelum diucapkan.",
          levels: levels,
          formal: { en: c1Text, backId: backId, phonetic: toPhonetics(c1Text) },
          casual: { en: built.casualB1, backId: backId, phonetic: toPhonetics(built.casualB1) }
        };
      });
    });
  }

  window.JagoAI = {
    getActiveTierInfo: getActiveTierInfo,
    normalizeRandomIndonesian: normalizeRandomIndonesian,
    analyzeEnglish: analyzeEnglish,
    translateIndonesian: translateIndonesian
  };
})();
