(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.JagoCoachCore = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var MARK_OPEN = "\u0001";
  var MARK_CLOSE = "\u0002";

  function stripMarks(s) {
    return String(s).replace(/[\u0001\u0002]/g, "");
  }

  function capitalizeLike(original, replacement) {
    if (/^[A-Z]/.test(original) && /^[a-z]/.test(replacement)) {
      return replacement.charAt(0).toUpperCase() + replacement.slice(1);
    }
    return replacement;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function globalRegex(re) {
    var flags = re.flags.indexOf("g") >= 0 ? re.flags : re.flags + "g";
    return new RegExp(re.source, flags);
  }

  // Splits on sentence terminators but protects common abbreviations such as "Mr." and "etc."
  function splitSentences(text) {
    var cleaned = String(text).replace(/\s+/g, " ").trim();
    if (!cleaned) return [];
    cleaned = cleaned.replace(/\b(Mr|Mrs|Ms|Dr|Prof|etc|vs|e\.g|i\.e)\./gi, "$1\u0003");
    var parts = cleaned.match(/[^.!?]+(?:[.!?]+|$)/g) || [];
    return parts
      .map(function (s) { return s.replace(/\u0003/g, ".").trim(); })
      .filter(Boolean);
  }

  function tokenize(text) {
    return stripMarks(text).toLowerCase().match(/[a-z0-9']+/g) || [];
  }

  function applyRules(text, rules) {
    var current = String(text);
    var findings = [];

    rules.forEach(function (rule) {
      var re = globalRegex(rule.pattern);

      if (rule.manual) {
        var m;
        while ((m = re.exec(stripMarks(current))) !== null) {
          findings.push({
            id: rule.id, cat: rule.cat, original: m[0], corrected: null,
            suggest: rule.suggest || null, why: rule.why, manual: true, source: "Lokal"
          });
          if (m[0].length === 0) re.lastIndex += 1;
        }
        return;
      }

      current = current.replace(re, function () {
        var args = Array.prototype.slice.call(arguments);
        var match = stripMarks(args[0]);
        var groups = args.slice(1, args.length - 2).map(function (g) {
          return typeof g === "string" ? stripMarks(g) : g;
        });
        var rep = typeof rule.replace === "function"
          ? rule.replace.apply(null, [match].concat(groups))
          : rule.replace;
        rep = capitalizeLike(match, rep);
        if (rep === match) return args[0];
        findings.push({
          id: rule.id, cat: rule.cat, original: match, corrected: rep,
          suggest: null, why: rule.why, manual: false, source: "Lokal"
        });
        return MARK_OPEN + rep + MARK_CLOSE;
      });
    });

    return {
      corrected: stripMarks(current),
      markedCorrected: current,
      findings: findings
    };
  }

  function markedToHtml(marked) {
    return escapeHtml(marked)
      .replace(/\u0001/g, '<mark class="fix">')
      .replace(/\u0002/g, "</mark>");
  }

  function detectLocalTerms(text, terms) {
    var found = [];
    terms.forEach(function (t) {
      if (t.re.test(text)) found.push(t);
    });
    return found;
  }

  function detectPronunciation(text, list) {
    var found = [];
    list.forEach(function (p) {
      if (p.re.test(text)) found.push(p);
    });
    return found;
  }

  function detectWeakWords(text, list) {
    var found = [];
    list.forEach(function (w) {
      var m = text.match(w.re);
      if (m) found.push({ weak: w.weak, better: w.better, note: w.note, example: w.example, matched: m[0] });
    });
    return found;
  }

  var NUMBER_WORDS = {
    "0": "ZI-rou", "1": "wan", "2": "tu", "3": "thri", "4": "for", "5": "faiv",
    "6": "siks", "7": "SE-ven", "8": "eit", "9": "nain", "10": "ten",
    "11": "i-LE-ven", "12": "twelv", "15": "fif-TIN", "20": "TWEN-ti",
    "24": "TWEN-ti for", "30": "THER-ti", "40": "FOR-ti", "50": "FIF-ti", "100": "wan HAN-dred"
  };

  function approximateWordPhonetics(rawWord, map) {
    var lower = rawWord.toLowerCase();
    if (map && map[lower]) return map[lower];
    if (NUMBER_WORDS[lower]) return NUMBER_WORDS[lower];
    if (/^\d+$/.test(lower)) return lower;

    // Check common inflected stems in map
    if (map) {
      if (lower.length > 4 && /s$/.test(lower)) {
        var stemS = lower.slice(0, -1);
        if (map[stemS]) return map[stemS] + (/([sxz]|ch|sh)$/.test(stemS) ? "-iz" : "z");
      }
      if (lower.length > 5 && /ed$/.test(lower)) {
        var stemEd = lower.slice(0, -2);
        if (map[stemEd]) return map[stemEd] + (/[td]$/.test(stemEd) ? "-id" : "d");
      }
      if (lower.length > 5 && /ing$/.test(lower)) {
        var stemIng = lower.slice(0, -3);
        if (map[stemIng]) return map[stemIng] + "-ing";
        if (map[stemIng + "e"]) return map[stemIng + "e"] + "-ing";
      }
    }

    var w = lower
      .replace(/^kn/, "n")
      .replace(/^wr/, "r")
      .replace(/^wh/, "w")
      .replace(/ph/g, "f")
      .replace(/tion$/g, "-SYEN")
      .replace(/tions$/g, "-SYENZ")
      .replace(/sion$/g, "-ZHEN")
      .replace(/ture$/g, "-cher")
      .replace(/ment$/g, "-ment")
      .replace(/ness$/g, "-nes")
      .replace(/able$/g, "-e-bel")
      .replace(/ible$/g, "-i-bel")
      .replace(/ight/g, "ait")
      .replace(/ough/g, "ou")
      .replace(/ee/g, "i")
      .replace(/ea/g, "i")
      .replace(/oo/g, "u")
      .replace(/ou/g, "au")
      .replace(/ai|ay/g, "ei")
      .replace(/oa/g, "ou")
      .replace(/sh/g, "sy")
      .replace(/ck/g, "k")
      .replace(/qu/g, "kw")
      .replace(/c(?=[eiy])/g, "s")
      .replace(/c/g, "k");

    return w;
  }

  function toIndonesianPhonetics(sentence, phoneticMap) {
    var tokens = String(sentence || "").match(/([A-Za-z0-9']+|\s+|[^A-Za-z0-9'\s]+)/g) || [];
    return tokens.map(function (tok) {
      if (!/^[A-Za-z0-9']+$/.test(tok)) return tok;
      return approximateWordPhonetics(tok, phoneticMap || {});
    }).join("");
  }

  function buildBand75Upgrade(correctedText, data) {
    var s = String(correctedText || "").trim();
    if (!s) return "";

    var replacements = [
      [/\bIndonesia has several islands\b/gi, "Indonesia is a vast archipelago made up of thousands of islands"],
      [/\bproud of Indonesia because Indonesia has several cultures,\s*languages,\s*dialects,\s*and cultural acculturation\b/gi,
        "deeply proud of our country because of its diverse cultures, languages, local dialects, and rich cultural acculturation"],
      [/\bSo,\s*we can choose anywhere we can live\b/gi,
        "Because of this diversity, we have the freedom to settle down and feel at home anywhere across the nation"],
      [/\bwhat we call kemiri\b/gi, "Indonesian candlenuts, locally known as kemiri,"],
      [/\bOur kemiri has much moisture control\b/gi, "Our candlenuts undergo strict moisture control"],
      [/\bI really like to explain our process\b/gi, "I greatly appreciate explaining our post-harvest process"],
      [/\bbecause the buyer needs more information\b/gi, "as international buyers require comprehensive product specifications"],
      [/\bNow we discuss regulation of alkes in Indonesia\b/gi, "We are currently addressing medical device regulations, locally known as alkes, in Indonesia"],
      [/\bWe are processing IDAK and CDAKB\b/gi, "We are actively processing our IDAK (Medical Device Distributor License) and CDAKB (Good Distribution Practice certification)"],
      [/\bThe process is more difficult than before,\s*but she doesn't worry because we have submitted the dossier yesterday\b/gi,
        "Although the regulatory process is more rigorous than before, our team remains confident because we formally submitted the complete dossier yesterday"],
      [/\bthat the Kemenkes will issue the license soon\b/gi, "that the Indonesian Ministry of Health (Kemenkes) will grant the marketing authorization soon"],
      [/\bhave\s+(submitted|sent|finished|completed|received|started|done|made)\b([^.?!]*?\b(?:yesterday|last\s+(?:week|month|year|night)|\d+\s+(?:days|weeks|months|years)\s+ago)\b)/gi, "$1$2"],
      [/\bvery\s+good\b/gi, "excellent"],
      [/\bvery\s+important\b/gi, "crucial"],
      [/\ba\s+lot\s+of\b/gi, "a substantial amount of"],
      [/\bI\s+think\b/g, "In my view,"],
      [/\bmore\s+difficult\b/gi, "increasingly rigorous"],
      [/\bThank you for coming back to Indonesia\.?/gi, "It is a pleasure to welcome you back to Indonesia."],
      [/\bWelcome to Indonesia again,?\s*/gi, "Welcome back to Indonesia, "],
      [/\bAnd then we have some good news\.?/gi, "Moreover, we are pleased to share some encouraging news."],
      [/\bSo we finally have our regulatory compliance in place\.?/gi, "Consequently, we have secured our foundational regulatory clearance."],
      [/\bWe are now legally compliant for business\.?/gi, "Our company is now legally authorized to operate commercially."],
      [/\b(?:We|we)\s+are\s+currently\s+preparing\s+IDAK\s+and\s+CDAKB\s+for\s+regulatory,?\s+mandatory\s+and\s+then\s+for\s+(?:the\s+)?Indonesian\s+Ministry\s+of\s+Health\b/gi,
        "We are currently preparing our mandatory IDAK (Medical Device Distributor License) and CDAKB (Good Distribution Practice) submissions for the Indonesian Ministry of Health"]
    ];

    replacements.forEach(function (pair) {
      s = s.replace(pair[0], pair[1]);
    });

    return s;
  }

  function countMatches(re, text) {
    if (!re) return 0;
    var flags = re.flags.indexOf("g") >= 0 ? re.flags : re.flags + "g";
    var gRe = new RegExp(re.source, flags);
    var hits = {};
    var m;
    while ((m = gRe.exec(text)) !== null) {
      hits[m[0].toLowerCase()] = true;
      if (m[0].length === 0) gRe.lastIndex += 1;
    }
    return Object.keys(hits).length;
  }

  function detectIntentAndNext(originalText, correctedText, data) {
    var templates = (data && data.topicTemplates) || [];
    var combined = String(originalText || "") + " " + String(correctedText || "");
    var best = null;
    var bestScore = 0;

    for (var i = 0; i < templates.length; i++) {
      var tpl = templates[i];
      if (tpl.id === "general-speaking") continue;
      var score = 0;
      if (tpl.strongMatch) {
        score += countMatches(tpl.strongMatch, combined) * 4;
      }
      if (tpl.match) {
        score += countMatches(tpl.match, combined) * 1;
      }
      // Require strong domain anchor or at least 2 distinct supporting keywords
      if (score >= 2 && score > bestScore) {
        bestScore = score;
        best = tpl;
      }
    }

    if (best) return best;

    for (var j = 0; j < templates.length; j++) {
      if (templates[j].id === "general-speaking") return templates[j];
    }

    return {
      id: "default",
      title: "Penyampaian gagasan dalam bahasa Inggris",
      summary: "Kamu sedang berlatih menyusun kalimat bahasa Inggris yang natural dan terstruktur.",
      focusTip: "Perhatikan kesesuaian subjek dan kata kerja serta gunakan kosakata spesifik.",
      nextSentences: []
    };
  }

  var COMPLEX_RE = /\b(because|although|though|whereas|while|which|who|whom|whose|if|unless|since|despite|in spite of|not only|having|being|so that|once|when|until)\b|\b(?:is|are|was|were|been|be)\s+\w+(?:ed|en)\b/i;

  function roundHalf(x) {
    return Math.round(x * 2) / 2;
  }

  function clamp(x, lo, hi) {
    return Math.max(lo, Math.min(hi, x));
  }

  // Indicative heuristic only. It is not an official band score.
  function estimate(text, findings, data) {
    var sentences = splitSentences(text);
    var tokens = tokenize(text);
    var words = tokens.length;
    var lower = stripMarks(text).toLowerCase();

    var unique = {};
    tokens.forEach(function (t) { unique[t] = true; });
    var ttr = words ? Object.keys(unique).length / words : 0;

    var advancedHits = 0;
    data.advancedWords.forEach(function (w) {
      if (new RegExp("\\b" + w + "\\b").test(lower)) advancedHits += 1;
    });

    var markerHits = 0;
    data.discourseMarkers.forEach(function (m) {
      if (lower.indexOf(m) !== -1) markerHits += 1;
    });

    var weakHits = detectWeakWords(text, data.weakWordUpgrades).length;

    var complexCount = sentences.filter(function (s) { return COMPLEX_RE.test(s); }).length;
    var complexRatio = sentences.length ? complexCount / sentences.length : 0;
    var weightedErrors = findings.reduce(function (sum, f) { return sum + (f.manual ? 0.5 : 1); }, 0);
    var density = words ? (weightedErrors / words) * 100 : 0;

    var grammar = clamp(9 - density * 0.3, 3, 9);
    if (complexRatio < 0.2) grammar = Math.min(grammar, 6);
    else if (complexRatio < 0.4) grammar = Math.min(grammar, 7);

    var lexical = 5 + Math.min(2.5, advancedHits * 0.4) + (words >= 50 && ttr >= 0.6 ? 0.5 : 0) - Math.min(1, weakHits * 0.15);
    lexical = clamp(lexical, 4, 8.5);

    var coherence = 5.5 + Math.min(2, markerHits * 0.5) + (sentences.length >= 4 ? 0.5 : 0);
    coherence = clamp(coherence, 4, 8);

    var bands = {
      grammar: roundHalf(grammar),
      lexical: roundHalf(lexical),
      coherence: roundHalf(coherence)
    };
    var overall = roundHalf((bands.grammar + bands.lexical + bands.coherence) / 3);

    return {
      words: words,
      sentences: sentences.length,
      density: Math.round(density * 10) / 10,
      complexRatio: Math.round(complexRatio * 100),
      advancedHits: advancedHits,
      markerHits: markerHits,
      weakHits: weakHits,
      ttr: Math.round(ttr * 100) / 100,
      bands: bands,
      overall: overall,
      confidence: words < 40 ? "rendah (teks di bawah 40 kata)" : words < 120 ? "sedang" : "lebih stabil"
    };
  }

  // Word-level alignment (LCS) between the target sentence and what the recognizer heard.
  function diffWords(target, spoken) {
    var a = tokenize(target);
    var b = tokenize(spoken);
    var n = a.length;
    var m = b.length;
    var dp = [];
    var i;
    var j;
    for (i = 0; i <= n; i++) {
      dp.push(new Array(m + 1).fill(0));
    }
    for (i = n - 1; i >= 0; i--) {
      for (j = m - 1; j >= 0; j--) {
        dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    var items = [];
    var extra = [];
    i = 0;
    j = 0;
    while (i < n && j < m) {
      if (a[i] === b[j]) {
        items.push({ word: a[i], status: "ok" });
        i++; j++;
      } else if (dp[i + 1][j] >= dp[i][j + 1]) {
        items.push({ word: a[i], status: "miss" });
        i++;
      } else {
        extra.push(b[j]);
        j++;
      }
    }
    while (i < n) { items.push({ word: a[i], status: "miss" }); i++; }
    while (j < m) { extra.push(b[j]); j++; }

    var okCount = items.filter(function (it) { return it.status === "ok"; }).length;
    return {
      items: items,
      extra: extra,
      accuracy: n ? Math.round((okCount / n) * 100) : 0
    };
  }

  function analyze(text, data) {
    var clean = String(text || "").trim();
    var result = applyRules(clean, data.errorRules);
    var c1Upgrade = buildBand75Upgrade(result.corrected, data);
    var intent = detectIntentAndNext(clean, result.corrected, data);
    var stats = estimate(result.corrected, result.findings, data);
    var c1Stats = estimate(c1Upgrade, [], data);
    var sents = splitSentences(result.corrected);
    return {
      original: clean,
      corrected: result.corrected,
      markedCorrected: result.markedCorrected,
      markedHtml: markedToHtml(result.markedCorrected),
      c1Upgrade: c1Upgrade,
      c1Phonetics: toIndonesianPhonetics(c1Upgrade, data.phoneticMap),
      c1Stats: c1Stats,
      intent: intent,
      findings: result.findings,
      localTerms: detectLocalTerms(clean, data.localTerms),
      pronunciation: detectPronunciation(result.corrected + " " + c1Upgrade, data.pronunciationWatch),
      weakWords: detectWeakWords(result.corrected, data.weakWordUpgrades),
      sentences: sents,
      sentencePhonetics: sents.map(function (sen) { return toIndonesianPhonetics(sen, data.phoneticMap); }),
      stats: stats,
      ltStatus: "idle"
    };
  }

  // Merges additional non-overlapping grammar/spelling matches from the free LanguageTool public API
  function mergeLanguageToolMatches(analysisObj, ltMatches, data) {
    if (!analysisObj || !Array.isArray(ltMatches) || ltMatches.length === 0) return analysisObj;
    var baseText = analysisObj.corrected;
    var ignoredRules = {
      "WHITESPACE_RULE": true,
      "EN_QUOTES": true,
      "MORFOLOGIK_RULE_EN_US": true
    };
    // Protect Indonesian proper nouns & local terms from spellcheck false positives
    var localProtected = /\b(Kemal|Thoriq|Thohir|Kemiri|kemiri|Cabai|cabai|cabe|Borobudur|Batik|batik|Rendang|rendang|Gotong|gotong|royong|IDAK|CDAKB|AKL|Kemenkes|alkes|Sumatra|Kalimantan|Sulawesi|Papua|Jawa|Pekanbaru|Riau|Lubuklinggau)\b/;

    var validMatches = ltMatches.filter(function (m) {
      if (!m || typeof m.offset !== "number" || typeof m.length !== "number" || m.length <= 0) return false;
      var ruleId = m.rule && m.rule.id ? m.rule.id : "";
      if (ignoredRules[ruleId]) return false;
      var snippet = baseText.slice(m.offset, m.offset + m.length);
      if (localProtected.test(snippet)) return false;
      if (!m.replacements || !m.replacements.length || !m.replacements[0].value) return false;
      var rep = m.replacements[0].value;
      if (rep === snippet) return false;
      // Avoid duplicating findings already reported for the exact same snippet
      var already = analysisObj.findings.some(function (f) {
        return f.original.toLowerCase() === snippet.toLowerCase() || (f.corrected && f.corrected.toLowerCase() === snippet.toLowerCase());
      });
      return !already;
    });

    if (validMatches.length === 0) return analysisObj;

    // Sort ascending by offset and remove overlaps
    validMatches.sort(function (a, b) { return a.offset - b.offset; });
    var nonOverlapping = [];
    var lastEnd = -1;
    validMatches.forEach(function (m) {
      if (m.offset >= lastEnd) {
        nonOverlapping.push(m);
        lastEnd = m.offset + m.length;
      }
    });

    var newCorrected = "";
    var newMarked = "";
    var cursor = 0;

    nonOverlapping.forEach(function (m) {
      var orig = baseText.slice(m.offset, m.offset + m.length);
      var rep = m.replacements[0].value;
      var catName = (m.rule && m.rule.category && m.rule.category.name) ? m.rule.category.name.toUpperCase() : "TATA BAHASA UMUM";
      var msg = m.message || "Perbaikan tata bahasa atau ejaan terdeteksi.";

      newCorrected += baseText.slice(cursor, m.offset) + rep;
      newMarked += baseText.slice(cursor, m.offset) + MARK_OPEN + rep + MARK_CLOSE;
      cursor = m.offset + m.length;

      analysisObj.findings.push({
        id: "lt-" + (m.rule && m.rule.id ? m.rule.id.toLowerCase() : "check"),
        cat: catName,
        original: orig,
        corrected: rep,
        suggest: null,
        why: msg + " (Pemeriksaan tambahan via LanguageTool gratis).",
        manual: false,
        source: "LanguageTool Gratis"
      });
    });

    newCorrected += baseText.slice(cursor);
    newMarked += baseText.slice(cursor);

    analysisObj.corrected = newCorrected;
    // Combine existing marked highlights with new ones by highlighting all findings in newCorrected
    analysisObj.markedHtml = markedToHtml(newMarked);
    analysisObj.c1Upgrade = buildBand75Upgrade(newCorrected, data);
    analysisObj.c1Phonetics = toIndonesianPhonetics(analysisObj.c1Upgrade, data.phoneticMap);
    analysisObj.sentences = splitSentences(newCorrected);
    analysisObj.sentencePhonetics = analysisObj.sentences.map(function (sen) {
      return toIndonesianPhonetics(sen, data.phoneticMap);
    });
    analysisObj.stats = estimate(newCorrected, analysisObj.findings, data);
    analysisObj.c1Stats = estimate(analysisObj.c1Upgrade, [], data);
    return analysisObj;
  }

  // Readiness gate: last three entries meet the target and no skill falls far below it.
  function evaluateReadiness(entries, exam) {
    var sorted = entries.slice().sort(function (x, y) { return x.date < y.date ? -1 : x.date > y.date ? 1 : x.id - y.id; });
    var last3 = sorted.slice(-3);
    if (last3.length < 3) {
      return { ready: false, reason: "Butuh minimal 3 mock untuk jenis ujian ini. Saat ini baru " + last3.length + "." };
    }
    var allMeet = last3.every(function (e) { return e.overall >= exam.target; });
    var skillOk = last3.every(function (e) {
      return ["speaking", "writing", "reading", "listening"].every(function (k) {
        return e[k] === null || e[k] === undefined || e[k] >= exam.skillMin - (exam.step >= 1 ? 0 : 0.5);
      });
    });
    if (allMeet && skillOk) {
      return { ready: true, reason: "Tiga mock terakhir mencapai target " + exam.target + " dan tidak ada skill jauh di bawah batas." };
    }
    if (!allMeet) {
      var gap = Math.max.apply(null, last3.map(function (e) { return exam.target - e.overall; }));
      return { ready: false, reason: "Masih ada mock di bawah target " + exam.target + ". Selisih terbesar " + (Math.round(gap * 10) / 10) + "." };
    }
    return { ready: false, reason: "Overall sudah cukup, tetapi ada skill di bawah batas aman. Perkuat skill terlemah dulu." };
  }

  return {
    splitSentences: splitSentences,
    tokenize: tokenize,
    applyRules: applyRules,
    analyze: analyze,
    toIndonesianPhonetics: toIndonesianPhonetics,
    buildBand75Upgrade: buildBand75Upgrade,
    detectIntentAndNext: detectIntentAndNext,
    mergeLanguageToolMatches: mergeLanguageToolMatches,
    diffWords: diffWords,
    estimate: estimate,
    evaluateReadiness: evaluateReadiness,
    escapeHtml: escapeHtml
  };
});
