(function () {
  "use strict";

  var STORAGE_KEY = "jago_english_state_v1";
  var DATA = window.JAGO_DATA;

  if (!DATA) {
    var mainEl = document.getElementById("main-workbench");
    if (mainEl) {
      mainEl.innerHTML =
        '<div class="state-banner is-error" role="alert">' +
        "<strong>Gagal Memuat Basis Data Kurikulum:</strong> File <code>curriculum-data.js</code> tidak ditemukan atau gagal dimuat. Muat ulang halaman untuk mencoba kembali." +
        "</div>";
    }
    return;
  }

  var defaultState = {
    theme: "light",
    activeTab: "coach",
    selectedCefr: "A1",
    openUnits: { "A1.1": true },
    tensePropId: "audit",
    tensePolarity: "positive",
    tenseSubjNum: "singular",
    selectedTenseKey: "present-simple",
    srsLevelFilter: "ALL",
    srsCategoryFilter: "ALL",
    srsSearchQuery: "",
    srsCurrentIndex: 0,
    srsIsFlipped: false,
    srsProgress: {},
    customCards: [],
    shadowingId: "sh-a1",
    prosodyIndex: 0,
    quizCurrentIndex: 0,
    quizAnswers: {},
    surgeryId: "ss-01",
    surgerySelectedTokens: [],
    surgeryAvailableTokens: [],
    surgeryCompleted: {}
  };

  var state = loadState();

  function loadState() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return cloneDefault();
      }
      var parsed = JSON.parse(raw);
      var merged = cloneDefault();
      Object.keys(merged).forEach(function (k) {
        if (parsed[k] !== undefined && parsed[k] !== null) {
          merged[k] = parsed[k];
        }
      });
      return merged;
    } catch (e) {
      return cloneDefault();
    }
  }

  function cloneDefault() {
    return JSON.parse(JSON.stringify(defaultState));
  }

  function saveState() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // Ignore quota errors in restricted browsing modes
    }
    updateLedgerStrip();
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // Central Web Audio API Dual-Harmonic Chime for Checklist Success
  var audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) audioCtx = new AudioCtx();
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  }

  window.playSuccessChime = function () {
    try {
      var ctx = getAudioContext();
      if (!ctx) return;
      var now = ctx.currentTime;
      var o1 = ctx.createOscillator();
      var g1 = ctx.createGain();
      o1.type = "sine";
      o1.frequency.setValueAtTime(659.25, now);
      o1.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      g1.gain.setValueAtTime(0.001, now);
      g1.gain.exponentialRampToValueAtTime(0.22, now + 0.02);
      g1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      o1.connect(g1);
      g1.connect(ctx.destination);
      o1.start(now);
      o1.stop(now + 0.36);

      var o2 = ctx.createOscillator();
      var g2 = ctx.createGain();
      o2.type = "sine";
      o2.frequency.setValueAtTime(1318.51, now + 0.08);
      g2.gain.setValueAtTime(0.001, now + 0.08);
      g2.gain.exponentialRampToValueAtTime(0.12, now + 0.10);
      g2.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
      o2.connect(g2);
      g2.connect(ctx.destination);
      o2.start(now + 0.08);
      o2.stop(now + 0.43);
    } catch (e) {}
  };

  document.addEventListener("change", function (e) {
    var t = e.target;
    if (t && t.matches && t.matches('input[type="checkbox"]')) {
      if (t.checked && window.playSuccessChime) {
        window.playSuccessChime();
      }
    }
  });

  window.jagoPickVoice = function () {
    if (!("speechSynthesis" in window)) return null;
    var voices = window.speechSynthesis.getVoices();
    var savedName = localStorage.getItem("jago_selected_voice") || window.JAGO_SELECTED_VOICE;
    if (savedName) {
      for (var i = 0; i < voices.length; i++) {
        if (voices[i].name === savedName) return voices[i];
      }
    }
    var preferred = ["Samantha", "Daniel", "Karen", "Rishi", "Google US English", "Google UK English Male"];
    for (var p = 0; p < preferred.length; p++) {
      for (var j = 0; j < voices.length; j++) {
        if (voices[j].name.indexOf(preferred[p]) !== -1) return voices[j];
      }
    }
    for (var k = 0; k < voices.length; k++) {
      if (voices[k].lang && voices[k].lang.indexOf("en") === 0) return voices[k];
    }
    return voices[0] || null;
  };

  window.jagoStopSpeech = function () {
    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
  };

  // Optional overrideVoice lets dialogue roleplay distinguish speakers cleanly when available.
  window.jagoSpeakText = function (text, rate, pitch, onDone, onStart, overrideVoiceName) {
    if (!("speechSynthesis" in window)) {
      if (onDone) onDone();
      return false;
    }
    try {
      window.speechSynthesis.cancel();
      var utter = new SpeechSynthesisUtterance(text);
      var voices = window.speechSynthesis.getVoices() || [];
      var v = null;
      if (overrideVoiceName) {
        for (var i = 0; i < voices.length; i++) {
          if (voices[i].name.indexOf(overrideVoiceName) !== -1) {
            v = voices[i];
            break;
          }
        }
      }
      if (!v && window.jagoPickVoice) v = window.jagoPickVoice();
      if (v) utter.voice = v;
      utter.lang = v ? v.lang : "en-US";
      utter.rate = rate || 1.0;
      utter.pitch = pitch || 1.0;
      utter.onstart = function () {
        if (onStart) onStart();
      };
      utter.onend = function () {
        if (onDone) onDone();
      };
      utter.onerror = function () {
        if (onDone) onDone();
      };
      window.speechSynthesis.speak(utter);
      return true;
    } catch (e) {
      if (onDone) onDone();
      return false;
    }
  };

  function speakText(text, rate, pitch) {
    return window.jagoSpeakText(text, rate, pitch);
  }

  // Theme management (R-21, R-34)
  function applyTheme() {
    document.documentElement.setAttribute("data-theme", state.theme);
    var toggleBtn = document.getElementById("theme-toggle-btn");
    if (toggleBtn) {
      toggleBtn.textContent = state.theme === "dark" ? "Mode Terang" : "Mode Gelap";
      toggleBtn.setAttribute(
        "aria-label",
        state.theme === "dark"
          ? "Beralih ke Mode Terang (Kertas Arsip)"
          : "Beralih ke Mode Gelap (Obsidian)"
      );
    }
  }

  // Live Session Ledger calculation (R-17, R-38: strictly real session data)
  function updateLedgerStrip() {
    var allCards = getAllSrsCards();
    var reviewedCount = Object.keys(state.srsProgress).length;
    var srsEl = document.getElementById("ledger-srs-count");
    if (srsEl) {
      srsEl.textContent =
        reviewedCount === 0
          ? "Belum ada kartu diulas"
          : reviewedCount + " dari " + allCards.length + " kartu diulas";
    }

    var quizQuestions = DATA.diagnosticQuiz;
    var answeredKeys = Object.keys(state.quizAnswers);
    var correctCount = 0;
    answeredKeys.forEach(function (qId) {
      var qObj = quizQuestions.find(function (q) {
        return q.id === qId;
      });
      if (qObj && state.quizAnswers[qId] === qObj.correctIndex) {
        correctCount += 1;
      }
    });

    var quizEl = document.getElementById("ledger-quiz-score");
    if (quizEl) {
      quizEl.textContent =
        answeredKeys.length === 0
          ? "Belum dikerjakan"
          : correctCount + " benar dari " + answeredKeys.length + " soal";
    }

    var cefrEl = document.getElementById("ledger-cefr-badge");
    if (cefrEl) {
      if (answeredKeys.length === 0) {
        cefrEl.textContent = "Belum diuji";
      } else {
        var ratio = correctCount / Math.max(1, answeredKeys.length);
        var estimated = "A1 (Dasar)";
        if (answeredKeys.length >= 4) {
          if (ratio >= 0.9 && answeredKeys.length >= 10) estimated = "C2 (Fasih)";
          else if (ratio >= 0.78) estimated = "C1 (Mahir)";
          else if (ratio >= 0.65) estimated = "B2 (Menengah Atas)";
          else if (ratio >= 0.5) estimated = "B1 (Menengah)";
          else if (ratio >= 0.35) estimated = "A2 (Pemula Lanjut)";
        } else {
          estimated = "Baru " + answeredKeys.length + " dari 12 soal dijawab";
        }
        cefrEl.textContent = estimated;
      }
    }

    var surgeryDoneCount = Object.keys(state.surgeryCompleted).length;
    var surgeryEl = document.getElementById("ledger-surgery-count");
    if (surgeryEl) {
      surgeryEl.textContent =
        surgeryDoneCount === 0
          ? "Belum dimulai"
          : surgeryDoneCount + " dari " + DATA.sentenceSurgery.length + " kalimat selesai";
    }
  }

  var TAB_TO_HUB = {
    coach: "studio",
    translate: "studio",
    conversation: "convo",
    topics: "convo",
    speaking: "convo",
    tenses: "grammar",
    srs: "grammar",
    curriculum: "grammar",
    diagnostic: "grammar"
  };

  var HUB_DEFAULT_TAB = {
    studio: "coach",
    convo: "conversation",
    grammar: "tenses",
    progress: "plan"
  };

  function updateStudioAiBadge() {
    var badge = document.getElementById("studio-ai-badge");
    if (!badge || !window.JagoAI) return;
    var info = window.JagoAI.getActiveTierInfo();
    badge.textContent = info.label;
  }

  function syncHubUi(hubId, subTabId) {
    document.querySelectorAll(".nav-tab[data-hub]").forEach(function (btn) {
      var isHub = btn.getAttribute("data-hub") === hubId;
      btn.setAttribute("aria-selected", isHub ? "true" : "false");
      if (isHub && window.innerWidth <= 640 && typeof btn.scrollIntoView === "function") {
        try { btn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" }); } catch (_) {}
      }
    });

    document.querySelectorAll(".hub-subbar").forEach(function (bar) {
      var targetBarId = "subbar-" + hubId;
      bar.classList.toggle("is-active", bar.id === targetBarId);
    });

    document.querySelectorAll(".studio-mode-btn, .hub-subpill").forEach(function (btn) {
      var dt = btn.getAttribute("data-tab");
      var dp = btn.getAttribute("data-progress-sub");
      var active = false;
      if (hubId === "progress") {
        active = dp === subTabId || (subTabId === "rubric" && dp === "tracker");
      } else {
        active = dt === subTabId;
      }
      btn.setAttribute("aria-pressed", active ? "true" : "false");
      if (btn.hasAttribute("aria-selected")) {
        btn.setAttribute("aria-selected", active ? "true" : "false");
      }
      btn.classList.toggle("is-active", active);
      if (btn.classList.contains("hub-subpill")) {
        btn.classList.toggle("btn-primary", active);
      }
    });
  }

  function switchHub(hubId) {
    state.activeHub = hubId;
    if (hubId === "progress") {
      var coachSub = window.JagoCoachGetSub ? window.JagoCoachGetSub() : "plan";
      if (coachSub === "analyze") coachSub = "plan";
      if (window.JagoCoachSetSub) window.JagoCoachSetSub(coachSub);
      switchTab("coach", "progress", coachSub);
      return;
    }
    var lastForHub = (state.hubTabs && state.hubTabs[hubId]) || HUB_DEFAULT_TAB[hubId] || "coach";
    if (hubId === "studio" && lastForHub === "coach" && window.JagoCoachSetSub) {
      window.JagoCoachSetSub("analyze");
    }
    switchTab(lastForHub, hubId);
  }

  // Primary Tab Navigation (4 Hubs + Grouped Sub-Views)
  function switchTab(tabId, forcedHub, progressSub) {
    var safeTabId = TAB_TO_HUB[tabId] ? tabId : "coach";
    var hubId = forcedHub || TAB_TO_HUB[safeTabId] || "studio";
    if (!forcedHub && safeTabId === "coach" && window.JagoCoachGetSub) {
      var curSub = window.JagoCoachGetSub();
      if (curSub && curSub !== "analyze") {
        hubId = "progress";
        progressSub = curSub;
      }
    }
    if (hubId === "studio" && safeTabId === "coach" && !progressSub && window.JagoCoachSetSub) {
      window.JagoCoachSetSub("analyze");
    }

    state.activeHub = hubId;
    state.activeTab = safeTabId;
    state.hubTabs = state.hubTabs || {};
    if (hubId !== "progress") {
      state.hubTabs[hubId] = safeTabId;
    }

    syncHubUi(hubId, progressSub || safeTabId);

    var panels = document.querySelectorAll(".module-panel");
    panels.forEach(function (panel) {
      if (panel.id === "panel-" + safeTabId) {
        panel.classList.add("is-active");
      } else {
        panel.classList.remove("is-active");
      }
    });

    saveState();
  }

  window.JagoSwitchTab = switchTab;
  window.JagoSwitchHub = switchHub;
  window.JagoRefreshAiBadge = updateStudioAiBadge;

  // MODULE 1: CEFR A1-C2 Curriculum
  function renderCurriculumModule() {
    var barEl = document.getElementById("cefr-level-buttons");
    var contentEl = document.getElementById("curriculum-content-area");
    if (!barEl || !contentEl) return;

    barEl.innerHTML = DATA.cefrLevels
      .map(function (lvl) {
        var isSelected = lvl.id === state.selectedCefr;
        return (
          '<button type="button" class="cefr-pill-btn" data-cefr="' +
          escapeHtml(lvl.id) +
          '" aria-pressed="' +
          (isSelected ? "true" : "false") +
          '">' +
          '<span class="cefr-pill-code">Level ' +
          escapeHtml(lvl.code) +
          "</span>" +
          '<span class="cefr-pill-label">' +
          escapeHtml(lvl.indonesianTitle) +
          "</span>" +
          "</button>"
        );
      })
      .join("");

    barEl.querySelectorAll(".cefr-pill-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.selectedCefr = btn.getAttribute("data-cefr");
        var firstUnit = state.selectedCefr + ".1";
        state.openUnits[firstUnit] = true;
        saveState();
        renderCurriculumModule();
      });
    });

    var currentLevel =
      DATA.cefrLevels.find(function (l) {
        return l.id === state.selectedCefr;
      }) || DATA.cefrLevels[0];

    var formulasHtml = currentLevel.formulas
      .map(function (f) {
        return (
          '<div class="formula-item">' +
          "<strong>" +
          escapeHtml(f.label) +
          "</strong>" +
          '<code class="formula-syntax">' +
          escapeHtml(f.syntax) +
          "</code>" +
          '<p style="font-size:0.92rem; margin-bottom:4px;"><strong>Contoh:</strong> ' +
          escapeHtml(f.exampleEn) +
          "</p>" +
          '<p style="font-size:0.86rem; color:var(--text-secondary);">' +
          escapeHtml(f.exampleId) +
          "</p>" +
          '<div style="margin-top:8px;">' +
          '<button type="button" class="btn speak-snippet-btn" data-speak="' +
          escapeHtml(f.exampleEn) +
          '">Dengarkan Kalimat</button>' +
          "</div>" +
          "</div>"
        );
      })
      .join("");

    var unitsHtml = currentLevel.modules
      .map(function (u) {
        var isOpen = Boolean(state.openUnits[u.unitCode]);
        var drillsHtml = u.drills
          .map(function (d, idx) {
            var drillKey = u.unitCode + "-d-" + idx;
            return (
              '<div class="drill-box">' +
              '<p style="font-size:0.9rem;"><strong>Latihan Terjemahan Logika:</strong> ' +
              escapeHtml(d.promptId) +
              "</p>" +
              '<div style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap;">' +
              '<button type="button" class="btn toggle-drill-btn" data-target="' +
              escapeHtml(drillKey) +
              '" aria-expanded="false">Lihat Kunci Sintaksis</button>' +
              '<button type="button" class="btn speak-snippet-btn" data-speak="' +
              escapeHtml(d.answerEn) +
              '">Dengarkan Audio</button>' +
              "</div>" +
              '<div id="' +
              escapeHtml(drillKey) +
              '" class="drill-answer" style="display:none;">' +
              "<div><strong>Inggris:</strong> " +
              escapeHtml(d.answerEn) +
              "</div>" +
              '<div style="color:var(--text-secondary); margin-top:4px;"><strong>Catatan Prinsip:</strong> ' +
              escapeHtml(d.note) +
              "</div>" +
              "</div>" +
              "</div>"
            );
          })
          .join("");

        return (
          '<div class="unit-accordion">' +
          '<button type="button" class="unit-header-btn" data-unit="' +
          escapeHtml(u.unitCode) +
          '" aria-expanded="' +
          (isOpen ? "true" : "false") +
          '">' +
          "<span>Unit " +
          escapeHtml(u.unitCode) +
          " · " +
          escapeHtml(u.title) +
          "</span>" +
          '<span class="tag-mono">' +
          (isOpen ? "Tutup" : "Buka") +
          "</span>" +
          "</button>" +
          (isOpen
            ? '<div class="unit-body">' +
              '<p style="margin-bottom:8px;">' +
              escapeHtml(u.summary) +
              "</p>" +
              '<div class="state-banner" style="margin-bottom:12px;">' +
              "<strong>Hukum Inti:</strong> " +
              escapeHtml(u.keyRule) +
              "</div>" +
              drillsHtml +
              "</div>"
            : "") +
          "</div>"
        );
      })
      .join("");

    var dialogueLinesHtml = currentLevel.dialogue.lines
      .map(function (line) {
        return (
          '<div class="formula-item" style="margin-bottom:10px;">' +
          '<div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">' +
          "<strong>" +
          escapeHtml(line.speaker) +
          "</strong>" +
          '<button type="button" class="btn speak-snippet-btn" data-speak="' +
          escapeHtml(line.en) +
          '">Putar Suara</button>' +
          "</div>" +
          '<p style="font-size:0.95rem; font-weight:600; margin-top:6px;">' +
          escapeHtml(line.en) +
          "</p>" +
          '<p style="font-size:0.86rem; color:var(--text-secondary); margin-top:2px;">' +
          escapeHtml(line.id) +
          "</p>" +
          "</div>"
        );
      })
      .join("");

    contentEl.innerHTML =
      '<div class="curriculum-grid">' +
      "<div>" +
      '<div class="panel-card">' +
      '<div class="panel-card-header">' +
      '<h2 class="panel-card-title">Level ' +
      escapeHtml(currentLevel.code) +
      " : " +
      escapeHtml(currentLevel.name) +
      "</h2>" +
      '<span class="tag-mono">Target: ' +
      escapeHtml(currentLevel.targetWords) +
      " Kata Aktif | " +
      escapeHtml(currentLevel.studyWeeks) +
      "</span>" +
      "</div>" +
      '<p style="margin-bottom:16px;">' +
      escapeHtml(currentLevel.coreFocus) +
      "</p>" +
      '<div class="contrastive-box">' +
      "<strong>" +
      escapeHtml(currentLevel.contrastiveInsight.title) +
      "</strong>" +
      '<p style="font-size:0.88rem; color:var(--text-secondary); margin-top:4px;">Pola Indonesia: "' +
      escapeHtml(currentLevel.contrastiveInsight.indonesianPattern) +
      '"</p>' +
      '<div class="contrast-pair">' +
      '<div class="contrast-wrong"><strong>Terjemahan kurang tepat:</strong><br>' +
      escapeHtml(currentLevel.contrastiveInsight.wrongEnglish) +
      "</div>" +
      '<div class="contrast-right"><strong>Kalimat yang benar:</strong><br>' +
      escapeHtml(currentLevel.contrastiveInsight.correctEnglish) +
      "</div>" +
      "</div>" +
      '<p style="font-size:0.88rem;">' +
      escapeHtml(currentLevel.contrastiveInsight.explanation) +
      "</p>" +
      "</div>" +
      '<h3 style="font-family:var(--font-sans); font-size:1.08rem; font-weight:800; margin-bottom:12px;">Pola Kalimat Inti</h3>' +
      formulasHtml +
      "</div>" +
      "</div>" +
      "<div>" +
      '<div class="panel-card">' +
      '<div class="panel-card-header">' +
      '<h2 class="panel-card-title">Unit Pelajaran &amp; Latihan</h2>' +
      "</div>" +
      unitsHtml +
      "</div>" +
      '<div class="panel-card">' +
      '<div class="panel-card-header">' +
      '<h2 class="panel-card-title">Dialog Kontekstual: ' +
      escapeHtml(currentLevel.dialogue.context) +
      "</h2>" +
      "</div>" +
      dialogueLinesHtml +
      "</div>" +
      "</div>" +
      "</div>";

    contentEl.querySelectorAll(".unit-header-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var uCode = btn.getAttribute("data-unit");
        state.openUnits[uCode] = !state.openUnits[uCode];
        saveState();
        renderCurriculumModule();
      });
    });

    contentEl.querySelectorAll(".toggle-drill-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var targetId = btn.getAttribute("data-target");
        var answerBox = document.getElementById(targetId);
        if (!answerBox) return;
        var isHidden = answerBox.style.display === "none";
        answerBox.style.display = isHidden ? "block" : "none";
        btn.setAttribute("aria-expanded", isHidden ? "true" : "false");
        btn.textContent = isHidden ? "Sembunyikan Kunci" : "Lihat Kunci Sintaksis";
      });
    });

    contentEl.querySelectorAll(".speak-snippet-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var text = btn.getAttribute("data-speak");
        speakText(text, 1.0, 1.0);
      });
    });
  }

  // MODULE 2: 12-Tense Matrix Engine
  // Conjugates any proposition across 12 tense-aspects, 3 polarities, and singular/plural subjects
  function buildTenseSentence(prop, tenseKey, polarity, subjNum) {
    var isSing = subjNum === "singular";
    var subj = isSing ? prop.subjectSing : prop.subjectPlur;
    var subjLower =
      subj === "I" || subj === "She" || subj === "He" || subj === "We" || subj === "They"
        ? subj === "I"
          ? "I"
          : subj.toLowerCase()
        : "t" + subj.slice(1);
    var obj = prop.object;

    var bePres = isSing ? "is" : subj === "I" ? "am" : "are";
    var bePast = isSing || subj === "I" ? "was" : "were";
    var havePres = isSing ? "has" : "have";
    var doPres = isSing ? "does" : "do";

    var map = {
      "present-simple": {
        positive: subj + " " + (isSing ? prop.verbS : prop.baseVerb) + " " + obj + ".",
        negative: subj + " " + doPres + " not " + prop.baseVerb + " " + obj + ".",
        question: capitalize(doPres) + " " + subjLower + " " + prop.baseVerb + " " + obj + "?"
      },
      "present-continuous": {
        positive: subj + " " + bePres + " " + prop.verbIng + " " + obj + ".",
        negative: subj + " " + bePres + " not " + prop.verbIng + " " + obj + ".",
        question: capitalize(bePres) + " " + subjLower + " " + prop.verbIng + " " + obj + "?"
      },
      "present-perfect": {
        positive: subj + " " + havePres + " " + prop.verbParticiple + " " + obj + ".",
        negative: subj + " " + havePres + " not " + prop.verbParticiple + " " + obj + ".",
        question: capitalize(havePres) + " " + subjLower + " " + prop.verbParticiple + " " + obj + "?"
      },
      "present-perfect-continuous": {
        positive: subj + " " + havePres + " been " + prop.verbIng + " " + obj + ".",
        negative: subj + " " + havePres + " not been " + prop.verbIng + " " + obj + ".",
        question: capitalize(havePres) + " " + subjLower + " been " + prop.verbIng + " " + obj + "?"
      },
      "past-simple": {
        positive: subj + " " + prop.verbPast + " " + obj + ".",
        negative: subj + " did not " + prop.baseVerb + " " + obj + ".",
        question: "Did " + subjLower + " " + prop.baseVerb + " " + obj + "?"
      },
      "past-continuous": {
        positive: subj + " " + bePast + " " + prop.verbIng + " " + obj + ".",
        negative: subj + " " + bePast + " not " + prop.verbIng + " " + obj + ".",
        question: capitalize(bePast) + " " + subjLower + " " + prop.verbIng + " " + obj + "?"
      },
      "past-perfect": {
        positive: subj + " had " + prop.verbParticiple + " " + obj + ".",
        negative: subj + " had not " + prop.verbParticiple + " " + obj + ".",
        question: "Had " + subjLower + " " + prop.verbParticiple + " " + obj + "?"
      },
      "past-perfect-continuous": {
        positive: subj + " had been " + prop.verbIng + " " + obj + ".",
        negative: subj + " had not been " + prop.verbIng + " " + obj + ".",
        question: "Had " + subjLower + " been " + prop.verbIng + " " + obj + "?"
      },
      "future-simple": {
        positive: subj + " will " + prop.baseVerb + " " + obj + ".",
        negative: subj + " will not " + prop.baseVerb + " " + obj + ".",
        question: "Will " + subjLower + " " + prop.baseVerb + " " + obj + "?"
      },
      "future-continuous": {
        positive: subj + " will be " + prop.verbIng + " " + obj + ".",
        negative: subj + " will not be " + prop.verbIng + " " + obj + ".",
        question: "Will " + subjLower + " be " + prop.verbIng + " " + obj + "?"
      },
      "future-perfect": {
        positive: subj + " will have " + prop.verbParticiple + " " + obj + ".",
        negative: subj + " will not have " + prop.verbParticiple + " " + obj + ".",
        question: "Will " + subjLower + " have " + prop.verbParticiple + " " + obj + "?"
      },
      "future-perfect-continuous": {
        positive: subj + " will have been " + prop.verbIng + " " + obj + ".",
        negative: subj + " will not have been " + prop.verbIng + " " + obj + ".",
        question: "Will " + subjLower + " have been " + prop.verbIng + " " + obj + "?"
      }
    };

    return map[tenseKey] ? map[tenseKey][polarity] : "";
  }

  function capitalize(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
  }

  function renderTenseMatrixModule() {
    var selectEl = document.getElementById("tense-prop-select");
    var tbodyEl = document.getElementById("tense-matrix-tbody");
    var inspectorEl = document.getElementById("tense-inspector-panel");
    if (!selectEl || !tbodyEl || !inspectorEl) return;

    selectEl.innerHTML = DATA.tenseMatrix.propositions
      .map(function (p) {
        return (
          '<option value="' +
          escapeHtml(p.id) +
          '"' +
          (p.id === state.tensePropId ? " selected" : "") +
          ">" +
          escapeHtml(p.label) +
          "</option>"
        );
      })
      .join("");

    document.querySelectorAll(".polarity-btn").forEach(function (btn) {
      var isPressed = btn.getAttribute("data-polarity") === state.tensePolarity;
      btn.setAttribute("aria-pressed", isPressed ? "true" : "false");
      if (isPressed) btn.classList.add("btn-primary");
      else btn.classList.remove("btn-primary");
    });

    document.querySelectorAll(".subject-num-btn").forEach(function (btn) {
      var isPressed = btn.getAttribute("data-subj") === state.tenseSubjNum;
      btn.setAttribute("aria-pressed", isPressed ? "true" : "false");
      if (isPressed) btn.classList.add("btn-primary");
      else btn.classList.remove("btn-primary");
    });

    var currentProp =
      DATA.tenseMatrix.propositions.find(function (p) {
        return p.id === state.tensePropId;
      }) || DATA.tenseMatrix.propositions[0];

    var aspects = [
      { key: "simple", label: "1. SIMPLE\n(Fakta / Titik Waktu)" },
      { key: "continuous", label: "2. CONTINUOUS\n(Sedang Berlangsung)" },
      { key: "perfect", label: "3. PERFECT\n(Sudah Tuntas)" },
      { key: "perfect-continuous", label: "4. PERFECT CONT.\n(Durasi Berkelanjutan)" }
    ];
    var times = ["present", "past", "future"];

    tbodyEl.innerHTML = aspects
      .map(function (asp) {
        var tds = times
          .map(function (tm) {
            var cellKey = tm + "-" + asp.key;
            var cellMeta = DATA.tenseMatrix.cells[cellKey];
            var sentence = buildTenseSentence(
              currentProp,
              cellKey,
              state.tensePolarity,
              state.tenseSubjNum
            );
            var isSelected = state.selectedTenseKey === cellKey;
            return (
              "<td>" +
              '<button type="button" class="tense-cell-btn" data-tense-key="' +
              escapeHtml(cellKey) +
              '" aria-pressed="' +
              (isSelected ? "true" : "false") +
              '">' +
              '<span class="tense-cell-name">' +
              escapeHtml(cellMeta.name) +
              " [" +
              escapeHtml(cellMeta.cefr) +
              "]</span>" +
              '<span class="tense-cell-sample">' +
              escapeHtml(sentence) +
              "</span>" +
              "</button>" +
              "</td>"
            );
          })
          .join("");

        return (
          "<tr>" +
          '<th scope="row" style="white-space:pre-line;">' +
          escapeHtml(asp.label) +
          "</th>" +
          tds +
          "</tr>"
        );
      })
      .join("");

    tbodyEl.querySelectorAll(".tense-cell-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.selectedTenseKey = btn.getAttribute("data-tense-key");
        saveState();
        renderTenseMatrixModule();
      });
    });

    var activeCell = DATA.tenseMatrix.cells[state.selectedTenseKey] || DATA.tenseMatrix.cells["present-simple"];
    var activeSentence = buildTenseSentence(
      currentProp,
      state.selectedTenseKey,
      state.tensePolarity,
      state.tenseSubjNum
    );

    inspectorEl.innerHTML =
      '<div class="panel-card-header">' +
      '<h2 class="panel-card-title">' +
      escapeHtml(activeCell.name) +
      "</h2>" +
      '<span class="tag-mono">CEFR ' +
      escapeHtml(activeCell.cefr) +
      "</span>" +
      "</div>" +
      '<div class="formula-item">' +
      "<strong>Kalimat Hasil Transformasi:</strong>" +
      '<p style="font-family:var(--font-serif); font-size:1.3rem; font-weight:700; margin:8px 0;">' +
      escapeHtml(activeSentence) +
      "</p>" +
      '<button type="button" class="btn btn-primary" id="tense-speak-active-btn">Dengarkan Pelafalan Native</button>' +
      "</div>" +
      '<div class="formula-item">' +
      "<strong>Rumus Sintaksis:</strong>" +
      '<code class="formula-syntax">' +
      escapeHtml(activeCell.formula) +
      "</code>" +
      "<strong>Garis Waktu Visual:</strong>" +
      '<code class="formula-syntax">' +
      escapeHtml(activeCell.timelineVisual) +
      "</code>" +
      "</div>" +
      '<div style="margin-bottom:14px;">' +
      "<strong>Model Mental (Kapan Dipakai):</strong>" +
      '<p style="font-size:0.92rem; color:var(--text-secondary); margin-top:4px;">' +
      escapeHtml(activeCell.mentalModel) +
      "</p>" +
      "</div>" +
      '<div class="state-banner is-error" style="margin-bottom:14px;">' +
      "<strong>Jebakan Penutur Indonesia:</strong><br>" +
      escapeHtml(activeCell.indonesianTrap) +
      "</div>" +
      "<div>" +
      "<strong>Penanda Waktu Khas (Time Markers):</strong>" +
      '<div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:8px;">' +
      activeCell.timeMarkers
        .map(function (m) {
          return '<span class="tag-mono">' + escapeHtml(m) + "</span>";
        })
        .join("") +
      "</div>" +
      "</div>";

    var speakActiveBtn = document.getElementById("tense-speak-active-btn");
    if (speakActiveBtn) {
      speakActiveBtn.addEventListener("click", function () {
        speakText(activeSentence, 1.0, 1.0);
      });
    }
  }

  // MODULE 3: Active Recall SRS (SuperMemo SM-2)
  function getAllSrsCards() {
    var bank = (window.JAGO_VOCAB_BANK && Array.isArray(window.JAGO_VOCAB_BANK)) ? window.JAGO_VOCAB_BANK : [];
    return DATA.srsDeck.concat(bank).concat(state.customCards || []);
  }

  function getAllSrsCategories() {
    var cats = {};
    getAllSrsCards().forEach(function (c) {
      if (c.category) cats[c.category] = (cats[c.category] || 0) + 1;
    });
    return Object.keys(cats).sort();
  }

  function getFilteredSrsCards() {
    var all = getAllSrsCards();
    return all.filter(function (card) {
      var matchesLevel =
        state.srsLevelFilter === "ALL" || card.level === state.srsLevelFilter;
      var matchesCat =
        !state.srsCategoryFilter ||
        state.srsCategoryFilter === "ALL" ||
        card.category === state.srsCategoryFilter;
      var q = (state.srsSearchQuery || "").trim().toLowerCase();
      if (!q) return matchesLevel && matchesCat;
      var inTerm = (card.term || "").toLowerCase().indexOf(q) !== -1;
      var inMeaning = (card.meaningId || "").toLowerCase().indexOf(q) !== -1;
      var inExample = (card.exampleEn || "").toLowerCase().indexOf(q) !== -1;
      return matchesLevel && matchesCat && (inTerm || inMeaning || inExample);
    });
  }

  // SuperMemo SM-2 interval & ease factor calculation
  function gradeSrsCard(cardId, gradeButtonValue) {
    // Map button 1..4 to SM-2 quality q in {1, 2, 4, 5}
    var qMap = { 1: 1, 2: 2, 3: 4, 4: 5 };
    var q = qMap[gradeButtonValue] || 4;

    if (gradeButtonValue >= 3 && window.playSuccessChime) {
      window.playSuccessChime();
    }

    var prev = state.srsProgress[cardId] || {
      repetition: 0,
      interval: 0,
      efactor: 2.5
    };

    var repetition = prev.repetition;
    var interval = prev.interval;
    var efactor = prev.efactor;

    if (q < 3) {
      repetition = 0;
      interval = 1;
    } else {
      if (repetition === 0) {
        interval = 1;
      } else if (repetition === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * efactor);
      }
      repetition += 1;
    }

    efactor = efactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (efactor < 1.3) efactor = 1.3;

    state.srsProgress[cardId] = {
      repetition: repetition,
      interval: interval,
      efactor: Math.round(efactor * 100) / 100,
      lastQuality: gradeButtonValue
    };

    var filtered = getFilteredSrsCards();
    if (filtered.length > 0) {
      state.srsCurrentIndex = (state.srsCurrentIndex + 1) % filtered.length;
    }
    state.srsIsFlipped = false;
    saveState();
    renderSrsModule();
  }

  function renderSrsModule() {
    var stageContainer = document.getElementById("srs-stage-container");
    var miniList = document.getElementById("srs-deck-mini-list");
    var countSpan = document.getElementById("srs-list-count");
    if (!stageContainer || !miniList) return;

    var srsCatSel = document.getElementById("srs-category-filter");
    if (srsCatSel && srsCatSel.options.length <= 1) {
      var cats = getAllSrsCategories();
      cats.forEach(function (c) {
        var opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        if (state.srsCategoryFilter === c) opt.selected = true;
        srsCatSel.appendChild(opt);
      });
    }

    var filtered = getFilteredSrsCards();
    if (countSpan) {
      countSpan.textContent = String(filtered.length);
    }

    if (filtered.length === 0) {
      // Explicit Empty State with cause and action (R-27)
      stageContainer.innerHTML =
        '<div class="state-banner">' +
        "<strong>Tidak Ada Kartu yang Cocok dengan Filter Saat Ini:</strong>" +
        '<p style="margin-top:6px;">Filter level <code>' +
        escapeHtml(state.srsLevelFilter) +
        '</code> atau kata kunci pencarian <code>"' +
        escapeHtml(state.srsSearchQuery) +
        '"</code> tidak menemukan hasil.</p>' +
        '<button type="button" class="btn btn-primary" id="empty-srs-reset-btn" style="margin-top:12px;">Tampilkan Semua Kartu (A1 - C2)</button>' +
        "</div>";

      miniList.innerHTML =
        '<div class="state-banner">Kosong. Reset filter atau tambahkan kosakata baru melalui formulir di atas.</div>';

      var emptyResetBtn = document.getElementById("empty-srs-reset-btn");
      if (emptyResetBtn) {
        emptyResetBtn.addEventListener("click", function () {
          state.srsLevelFilter = "ALL";
          state.srsSearchQuery = "";
          state.srsCurrentIndex = 0;
          var lvlSel = document.getElementById("srs-level-filter");
          var searchInp = document.getElementById("srs-search-input");
          if (lvlSel) lvlSel.value = "ALL";
          if (searchInp) searchInp.value = "";
          saveState();
          renderSrsModule();
        });
      }
      return;
    }

    if (state.srsCurrentIndex >= filtered.length) {
      state.srsCurrentIndex = 0;
    }

    var card = filtered[state.srsCurrentIndex];
    var prog = state.srsProgress[card.id];
    var statusText = prog
      ? "Interval SM-2: " + prog.interval + " hari (EF " + prog.efactor + ")"
      : "Kartu Baru (Belum Direview)";

    stageContainer.innerHTML =
      '<div class="flashcard-stage">' +
      "<div>" +
      '<div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">' +
      '<span class="tag-mono">Level ' +
      escapeHtml(card.level) +
      " | " +
      escapeHtml(card.category) +
      "</span>" +
      '<span class="tag-mono">' +
      escapeHtml(statusText) +
      "</span>" +
      "</div>" +
      '<div class="flashcard-term">' +
      escapeHtml(card.term) +
      "</div>" +
      '<div class="flashcard-ipa">' +
      escapeHtml(card.ipa) +
      " (" +
      escapeHtml(card.partOfSpeech) +
      ")</div>" +
      '<div style="margin-top:12px; display:flex; gap:10px; flex-wrap:wrap;">' +
      '<button type="button" class="btn" id="srs-speak-term-btn">Lafalkan Kata</button>' +
      '<button type="button" class="btn" id="srs-speak-example-btn">Lafalkan Contoh Kalimat</button>' +
      "</div>" +
      '<div style="margin-top:16px; padding:12px; background-color:var(--bg-muted); border-radius:var(--radius-md);">' +
      "<strong>Contoh Konteks:</strong><br>" +
      escapeHtml(card.exampleEn) +
      "</div>" +
      (state.srsIsFlipped
        ? '<div class="flashcard-answer-area">' +
          '<p style="font-size:1.05rem; font-weight:700; color:var(--accent-primary);">Arti &amp; Nuansa Indonesia:</p>' +
          '<p style="margin-bottom:10px;">' +
          escapeHtml(card.meaningId) +
          "</p>" +
          '<p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:8px;"><strong>Definisi Inggris:</strong> ' +
          escapeHtml(card.definitionEn) +
          "</p>" +
          '<p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:10px;"><strong>Terjemahan Kalimat:</strong> ' +
          escapeHtml(card.exampleId) +
          "</p>" +
          "<div><strong>Kolokasi Alami:</strong> " +
          (card.collocations || [])
            .map(function (c) {
              return '<span class="tag-mono" style="margin-right:6px;">' + escapeHtml(c) + "</span>";
            })
            .join("") +
          "</div>" +
          "</div>"
        : "") +
      "</div>" +
      '<div style="margin-top:24px;">' +
      (!state.srsIsFlipped
        ? '<button type="button" class="btn btn-primary" id="srs-flip-btn" style="width:100%;">Balik Kartu &amp; Lihat Arti</button>'
        : '<div><p style="font-size:0.86rem; font-weight:700; color:var(--text-secondary);">Seberapa mudah kamu mengingat kata ini?</p>' +
          '<div class="srs-rating-grid">' +
          '<button type="button" class="btn srs-grade-btn" data-grade="1">1 · Ulangi</button>' +
          '<button type="button" class="btn srs-grade-btn" data-grade="2">2 · Sulit</button>' +
          '<button type="button" class="btn btn-primary srs-grade-btn" data-grade="3">3 · Baik</button>' +
          '<button type="button" class="btn btn-success srs-grade-btn" data-grade="4">4 · Mudah</button>' +
          "</div></div>") +
      '<div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px;">' +
      '<button type="button" class="btn" id="srs-prev-btn">Sebelumnya</button>' +
      '<span class="tag-mono">Kartu ' +
      (state.srsCurrentIndex + 1) +
      " dari " +
      filtered.length +
      "</span>" +
      '<button type="button" class="btn" id="srs-next-btn">Berikutnya</button>' +
      "</div>" +
      "</div>" +
      "</div>";

    miniList.innerHTML = filtered
      .map(function (c, idx) {
        var p = state.srsProgress[c.id];
        var badge = p ? "Diulas (" + p.interval + " hari)" : "Baru";
        var isCurrent = idx === state.srsCurrentIndex;
        return (
          '<button type="button" class="btn srs-jump-btn" data-idx="' +
          idx +
          '" style="width:100%; justify-content:space-between; margin-bottom:6px;' +
          (isCurrent ? " border-color:var(--accent-primary); font-weight:800;" : "") +
          '">' +
          "<span>" +
          escapeHtml(c.term) +
          " (" +
          escapeHtml(c.level) +
          ")</span>" +
          '<span class="tag-mono">' +
          escapeHtml(badge) +
          "</span>" +
          "</button>"
        );
      })
      .join("");

    var flipBtn = document.getElementById("srs-flip-btn");
    if (flipBtn) {
      flipBtn.addEventListener("click", function () {
        state.srsIsFlipped = true;
        renderSrsModule();
      });
    }

    var speakTermBtn = document.getElementById("srs-speak-term-btn");
    if (speakTermBtn) {
      speakTermBtn.addEventListener("click", function () {
        speakText(card.term, 0.95, 1.0);
      });
    }

    var speakExBtn = document.getElementById("srs-speak-example-btn");
    if (speakExBtn) {
      speakExBtn.addEventListener("click", function () {
        speakText(card.exampleEn, 1.0, 1.0);
      });
    }

    var prevBtn = document.getElementById("srs-prev-btn");
    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        state.srsCurrentIndex =
          (state.srsCurrentIndex - 1 + filtered.length) % filtered.length;
        state.srsIsFlipped = false;
        saveState();
        renderSrsModule();
      });
    }

    var nextBtn = document.getElementById("srs-next-btn");
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        state.srsCurrentIndex = (state.srsCurrentIndex + 1) % filtered.length;
        state.srsIsFlipped = false;
        saveState();
        renderSrsModule();
      });
    }

    stageContainer.querySelectorAll(".srs-grade-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var g = parseInt(btn.getAttribute("data-grade"), 10);
        gradeSrsCard(card.id, g);
      });
    });

    miniList.querySelectorAll(".srs-jump-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.srsCurrentIndex = parseInt(btn.getAttribute("data-idx"), 10);
        state.srsIsFlipped = false;
        saveState();
        renderSrsModule();
      });
    });
  }

  // MODULE 4: Speaking, Connected Speech & Prosody Lab
  function renderSpeakingModule() {
    var selectEl = document.getElementById("shadowing-select");
    var detailBox = document.getElementById("shadowing-detail-box");
    var prosodyBar = document.getElementById("prosody-word-buttons");
    var prosodyBox = document.getElementById("prosody-explanation-box");
    if (!selectEl || !detailBox || !prosodyBar || !prosodyBox) return;

    selectEl.innerHTML = DATA.shadowingPrompts
      .map(function (p) {
        return (
          '<option value="' +
          escapeHtml(p.id) +
          '"' +
          (p.id === state.shadowingId ? " selected" : "") +
          ">[" +
          escapeHtml(p.level) +
          "] " +
          escapeHtml(p.title) +
          "</option>"
        );
      })
      .join("");

    var currentPrompt =
      DATA.shadowingPrompts.find(function (p) {
        return p.id === state.shadowingId;
      }) || DATA.shadowingPrompts[0];

    detailBox.innerHTML =
      '<div class="formula-item">' +
      '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">' +
      "<strong>Kalimat Target Shadowing:</strong>" +
      '<span class="tag-mono">CEFR ' +
      escapeHtml(currentPrompt.level) +
      "</span>" +
      "</div>" +
      '<p style="font-family:var(--font-serif); font-size:1.3rem; font-weight:700; margin-bottom:8px;">' +
      escapeHtml(currentPrompt.sentence) +
      "</p>" +
      '<code class="formula-syntax">' +
      escapeHtml(currentPrompt.ipa) +
      "</code>" +
      '<p style="font-size:0.88rem; color:var(--text-secondary); margin-top:8px;"><strong>Bedah Connected Speech:</strong> ' +
      escapeHtml(currentPrompt.connectedSpeechNote) +
      "</p>" +
      "</div>";

    prosodyBar.innerHTML = DATA.prosodicStressWords
      .map(function (w) {
        var isSelected = w.index === state.prosodyIndex;
        return (
          '<button type="button" class="prosody-word-btn" data-pidx="' +
          w.index +
          '" aria-pressed="' +
          (isSelected ? "true" : "false") +
          '">' +
          escapeHtml(w.word) +
          "</button>"
        );
      })
      .join("");

    var activeProsody =
      DATA.prosodicStressWords[state.prosodyIndex] || DATA.prosodicStressWords[0];

    var highlightedSentence = DATA.prosodicStressWords
      .map(function (w) {
        if (w.index === state.prosodyIndex) {
          return (
            '<strong style="color:var(--accent-primary); text-decoration:underline;">' +
            escapeHtml(w.word.toUpperCase()) +
            "</strong>"
          );
        }
        return escapeHtml(w.word);
      })
      .join(" ");

    prosodyBox.innerHTML =
      '<div class="formula-item">' +
      '<div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">' +
      "<strong>Tekanan Jatuh Pada Kata: " +
      escapeHtml(activeProsody.word.toUpperCase()) +
      " (" +
      escapeHtml(activeProsody.ipa) +
      ")</strong>" +
      '<span class="tag-mono">' +
      escapeHtml(activeProsody.pragmaticRole) +
      "</span>" +
      "</div>" +
      '<p style="font-family:var(--font-serif); font-size:1.2rem; margin:10px 0;">"' +
      highlightedSentence +
      '"</p>' +
      '<div class="state-banner is-success" style="margin:10px 0;">' +
      "<strong>Makna Tersirat (Implicature):</strong><br>" +
      escapeHtml(activeProsody.meaningId) +
      "</div>" +
      '<p style="font-size:0.9rem; color:var(--text-secondary);"><strong>Kalimat Lanjutan Alami:</strong> ' +
      escapeHtml(activeProsody.followUpEn) +
      "</p>" +
      '<button type="button" class="btn btn-primary" id="speak-prosody-btn" style="margin-top:10px;">Dengarkan Intonasi Kontras Ini</button>' +
      "</div>";

    prosodyBar.querySelectorAll(".prosody-word-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.prosodyIndex = parseInt(btn.getAttribute("data-pidx"), 10);
        saveState();
        renderSpeakingModule();
        var chosen = DATA.prosodicStressWords[state.prosodyIndex];
        if (chosen) {
          speakText(chosen.followUpEn, 0.95, 1.05);
        }
      });
    });

    var speakProsodyBtn = document.getElementById("speak-prosody-btn");
    if (speakProsodyBtn) {
      speakProsodyBtn.addEventListener("click", function () {
        speakText(activeProsody.followUpEn, 0.95, 1.05);
      });
    }

    var intonGrid = document.getElementById("intonation-contours-grid");
    if (intonGrid && DATA.intonationContours) {
      intonGrid.innerHTML = DATA.intonationContours
        .map(function (c) {
          return (
            '<div class="intonation-card">' +
            '<div class="intonation-header">' +
            '<span class="intonation-symbol" aria-hidden="true">' +
            escapeHtml(c.symbol) +
            "</span>" +
            '<div style="flex:1;">' +
            '<h3 class="intonation-title">' +
            escapeHtml(c.name) +
            "</h3>" +
            '<div class="intonation-tag">Pola Nada &amp; Sikap Bicara</div>' +
            "</div>" +
            "</div>" +
            '<p class="intonation-usage">' +
            escapeHtml(c.usage) +
            "</p>" +
            '<div class="intonation-example-box">' +
            '<div class="intonation-example-en">"' +
            escapeHtml(c.exampleEn) +
            '"</div>' +
            '<div class="intonation-example-id">' +
            escapeHtml(c.exampleId) +
            "</div>" +
            "</div>" +
            '<div class="intonation-note">' +
            "<strong>Kunci Artikulasi:</strong> " +
            escapeHtml(c.note) +
            "</div>" +
            '<div class="intonation-actions">' +
            '<button type="button" class="btn btn-primary speak-intonation-btn" data-text="' +
            escapeHtml(c.practiceSentence) +
            '">Dengar Contoh Latihan</button>' +
            "</div>" +
            "</div>"
          );
        })
        .join("");

      intonGrid.querySelectorAll(".speak-intonation-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var txt = btn.getAttribute("data-text");
          if (txt) speakText(txt, 0.95, 1.0);
        });
      });
    }
  }

  function normalizeWords(str) {
    return String(str)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  }

  function evaluateSpeechSimilarity(targetSentence, spokenText) {
    var resultBox = document.getElementById("speech-evaluation-result");
    if (!resultBox) return;

    var cleanedSpoken = (spokenText || "").trim();
    if (!cleanedSpoken) {
      resultBox.innerHTML =
        '<div class="state-banner is-error" role="alert">' +
        "<strong>Input Suara / Teks Masih Kosong:</strong> Klik tombol <em>Uji Suara via Mikrofon</em> atau ketik kalimat yang Anda ucapkan pada kolom di atas sebelum menghitung skor akurasi." +
        "</div>";
      return;
    }

    var targetWords = normalizeWords(targetSentence);
    var spokenWords = normalizeWords(cleanedSpoken);

    var matched = 0;
    var wordFeedback = targetWords.map(function (tw) {
      var found = spokenWords.indexOf(tw) !== -1;
      if (found) matched += 1;
      return {
        word: tw,
        ok: found
      };
    });

    var score = Math.round((matched / Math.max(1, targetWords.length)) * 100);
    var bannerClass = score >= 80 ? "is-success" : "is-error";
    var verdictLabel = "Kecocokan pelafalan: " + score + "%";

    resultBox.innerHTML =
      '<div class="state-banner ' +
      bannerClass +
      '">' +
      "<strong>" +
      escapeHtml(verdictLabel) +
      "</strong> (" +
      matched +
      " dari " +
      targetWords.length +
      " kata tertangkap jelas)" +
      '<div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:10px;">' +
      wordFeedback
        .map(function (wf) {
          return (
            '<span class="tag-mono">' +
            (wf.ok ? "Terdengar: " : "Meleset: ") +
            escapeHtml(wf.word) +
            "</span>"
          );
        })
        .join("") +
      "</div>" +
      "</div>";
  }

  // MODULE 5: Diagnostic Quiz & Sentence Surgery
  function renderDiagnosticModule() {
    renderQuizSection();
    renderSentenceSurgerySection();
  }

  function renderQuizSection() {
    var container = document.getElementById("diagnostic-quiz-container");
    var badge = document.getElementById("quiz-progress-badge");
    if (!container) return;

    var questions = DATA.diagnosticQuiz;
    if (state.quizCurrentIndex >= questions.length) {
      state.quizCurrentIndex = 0;
    }

    var q = questions[state.quizCurrentIndex];
    if (badge) {
      badge.textContent =
        "Soal " + (state.quizCurrentIndex + 1) + " / " + questions.length + " (" + q.level + ")";
    }

    var selectedOption = state.quizAnswers[q.id];
    var hasAnswered = selectedOption !== undefined && selectedOption !== null;

    var optionsHtml = q.options
      .map(function (opt, idx) {
        var cls = "quiz-option-btn";
        var prefix = String.fromCharCode(65 + idx);
        if (hasAnswered) {
          if (idx === q.correctIndex) {
            cls += " is-correct";
            prefix = "Benar · " + String.fromCharCode(65 + idx);
          } else if (idx === selectedOption && selectedOption !== q.correctIndex) {
            cls += " is-wrong";
            prefix = "Kurang tepat · " + String.fromCharCode(65 + idx);
          }
        }
        return (
          '<button type="button" class="' +
          cls +
          '" data-qidx="' +
          idx +
          '">' +
          '<span class="tag-mono">' +
          escapeHtml(prefix) +
          "</span>" +
          "<span>" +
          escapeHtml(opt) +
          "</span>" +
          "</button>"
        );
      })
      .join("");

    container.innerHTML =
      "<div>" +
      '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">' +
      '<span class="tag-mono">' +
      escapeHtml(q.topic) +
      "</span>" +
      '<span class="tag-mono">Level ' +
      escapeHtml(q.level) +
      "</span>" +
      "</div>" +
      '<p style="font-size:1.05rem; font-weight:700; margin-bottom:12px;">' +
      escapeHtml(q.question) +
      "</p>" +
      '<div class="quiz-option-list">' +
      optionsHtml +
      "</div>" +
      (hasAnswered
        ? '<div class="state-banner ' +
          (selectedOption === q.correctIndex ? "is-success" : "is-error") +
          '">' +
          "<strong>" +
          (selectedOption === q.correctIndex
            ? "Jawaban benar:"
            : "Penjelasan koreksi:") +
          "</strong><br>" +
          escapeHtml(q.explanation) +
          "</div>"
        : "") +
      '<div style="display:flex; justify-content:space-between; align-items:center; gap:10px; margin-top:16px; flex-wrap:wrap;">' +
      '<button type="button" class="btn" id="quiz-prev-btn">Soal Sebelumnya</button>' +
      '<button type="button" class="btn" id="quiz-reset-btn">Ulangi Tes Dari Awal</button>' +
      '<button type="button" class="btn btn-primary" id="quiz-next-btn">Soal Berikutnya</button>' +
      "</div>" +
      "</div>";

    container.querySelectorAll(".quiz-option-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var chosenIdx = parseInt(btn.getAttribute("data-qidx"), 10);
        state.quizAnswers[q.id] = chosenIdx;
        saveState();
        renderQuizSection();
      });
    });

    var prevBtn = document.getElementById("quiz-prev-btn");
    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        state.quizCurrentIndex =
          (state.quizCurrentIndex - 1 + questions.length) % questions.length;
        saveState();
        renderQuizSection();
      });
    }

    var nextBtn = document.getElementById("quiz-next-btn");
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        state.quizCurrentIndex = (state.quizCurrentIndex + 1) % questions.length;
        saveState();
        renderQuizSection();
      });
    }

    var resetBtn = document.getElementById("quiz-reset-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        state.quizAnswers = {};
        state.quizCurrentIndex = 0;
        saveState();
        renderQuizSection();
      });
    }
  }

  function initSurgeryTokens(challenge) {
    // Deterministic rotation so tokens are always scrambled relative to the target order
    var rotated = challenge.tokens.slice().map(function (t, i) {
      return { id: "tok-" + i, text: t };
    });
    rotated.sort(function (a, b) {
      return a.text.localeCompare(b.text);
    });
    state.surgeryAvailableTokens = rotated;
    state.surgerySelectedTokens = [];
  }

  function renderSentenceSurgerySection() {
    var selectEl = document.getElementById("surgery-challenge-select");
    var container = document.getElementById("sentence-surgery-container");
    var badge = document.getElementById("surgery-level-badge");
    if (!selectEl || !container) return;

    selectEl.innerHTML = DATA.sentenceSurgery
      .map(function (s) {
        var doneMark = state.surgeryCompleted[s.id] ? " [TUNTAS]" : "";
        return (
          '<option value="' +
          escapeHtml(s.id) +
          '"' +
          (s.id === state.surgeryId ? " selected" : "") +
          ">[" +
          escapeHtml(s.level) +
          "] " +
          escapeHtml(s.title) +
          escapeHtml(doneMark) +
          "</option>"
        );
      })
      .join("");

    var challenge =
      DATA.sentenceSurgery.find(function (s) {
        return s.id === state.surgeryId;
      }) || DATA.sentenceSurgery[0];

    if (badge) {
      badge.textContent = "Level " + challenge.level;
    }

    var totalExpected = challenge.tokens.length;
    var currentTotal =
      (state.surgerySelectedTokens ? state.surgerySelectedTokens.length : 0) +
      (state.surgeryAvailableTokens ? state.surgeryAvailableTokens.length : 0);

    if (currentTotal !== totalExpected) {
      initSurgeryTokens(challenge);
    }

    var selectedHtml =
      state.surgerySelectedTokens.length === 0
        ? '<span style="color:var(--text-secondary); font-size:0.9rem;">Klik potongan kata di bawah untuk menyusun kalimat bahasa Inggris di kotak ini...</span>'
        : state.surgerySelectedTokens
            .map(function (tok, idx) {
              return (
                '<button type="button" class="token-chip selected-token-chip" data-sidx="' +
                idx +
                '">' +
                escapeHtml(tok.text) +
                "</button>"
              );
            })
            .join("");

    var availableHtml =
      state.surgeryAvailableTokens.length === 0
        ? '<span style="color:var(--text-secondary); font-size:0.9rem;">Semua kata telah dipilih. Klik "Periksa Susunan Kalimat" di bawah.</span>'
        : state.surgeryAvailableTokens
            .map(function (tok, idx) {
              return (
                '<button type="button" class="token-chip avail-token-chip" data-aidx="' +
                idx +
                '">' +
                escapeHtml(tok.text) +
                "</button>"
              );
            })
            .join("");

    container.innerHTML =
      "<div>" +
      '<p style="font-weight:700; margin-bottom:6px;">' +
      escapeHtml(challenge.promptId) +
      "</p>" +
      '<p style="font-size:0.86rem; color:var(--text-secondary); margin-bottom:10px;"><strong>Petunjuk Arsitektur:</strong> ' +
      escapeHtml(challenge.hint) +
      "</p>" +
      '<label class="control-label">Susunan Kalimat Anda (Klik kata untuk melepas):</label>' +
      '<div class="token-bank" id="surgery-answer-zone">' +
      selectedHtml +
      "</div>" +
      '<label class="control-label">Bank Kata Acak (Klik kata untuk memasukkan):</label>' +
      '<div class="token-bank" id="surgery-bank-zone">' +
      availableHtml +
      "</div>" +
      '<div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:14px;">' +
      '<button type="button" class="btn btn-primary" id="check-surgery-btn">Periksa Susunan Kalimat</button>' +
      '<button type="button" class="btn" id="reset-surgery-btn">Acak Ulang Kata</button>' +
      '<button type="button" class="btn" id="reveal-surgery-btn">Tampilkan Jawaban Benar</button>' +
      "</div>" +
      '<div id="surgery-feedback-box" aria-live="polite" style="margin-top:12px;"></div>' +
      "</div>";

    container.querySelectorAll(".avail-token-chip").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = parseInt(btn.getAttribute("data-aidx"), 10);
        var moved = state.surgeryAvailableTokens.splice(idx, 1)[0];
        if (moved) {
          state.surgerySelectedTokens.push(moved);
          renderSentenceSurgerySection();
        }
      });
    });

    container.querySelectorAll(".selected-token-chip").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = parseInt(btn.getAttribute("data-sidx"), 10);
        var moved = state.surgerySelectedTokens.splice(idx, 1)[0];
        if (moved) {
          state.surgeryAvailableTokens.push(moved);
          renderSentenceSurgerySection();
        }
      });
    });

    var checkBtn = document.getElementById("check-surgery-btn");
    if (checkBtn) {
      checkBtn.addEventListener("click", function () {
        var feedbackBox = document.getElementById("surgery-feedback-box");
        if (!feedbackBox) return;

        var userSentence = state.surgerySelectedTokens
          .map(function (t) {
            return t.text;
          })
          .join(" ");
        var targetSentence = challenge.tokens.join(" ");

        if (state.surgerySelectedTokens.length < challenge.tokens.length) {
          feedbackBox.innerHTML =
            '<div class="state-banner is-error" role="alert">' +
            "<strong>Susunan Belum Lengkap:</strong> Anda baru menyusun " +
            state.surgerySelectedTokens.length +
            " dari " +
            challenge.tokens.length +
            " kata. Masukkan seluruh kata dari Bank Kata terlebih dahulu." +
            "</div>";
          return;
        }

        if (userSentence === targetSentence) {
          state.surgeryCompleted[challenge.id] = true;
          saveState();
          speakText(targetSentence, 1.0, 1.0);
          feedbackBox.innerHTML =
            '<div class="state-banner is-success">' +
            "<strong>Susunan kalimat sudah tepat:</strong><br>" +
            escapeHtml(targetSentence) +
            "</div>";
        } else {
          feedbackBox.innerHTML =
            '<div class="state-banner is-error" role="alert">' +
            "<strong>Urutan Kata Masih Terbalik:</strong><br>" +
            "Susunan Anda: <code>" +
            escapeHtml(userSentence) +
            "</code><br>" +
            "Perhatikan kembali petunjuk: " +
            escapeHtml(challenge.hint) +
            "</div>";
        }
      });
    }

    var resetSurgeryBtn = document.getElementById("reset-surgery-btn");
    if (resetSurgeryBtn) {
      resetSurgeryBtn.addEventListener("click", function () {
        initSurgeryTokens(challenge);
        renderSentenceSurgerySection();
      });
    }

    var revealSurgeryBtn = document.getElementById("reveal-surgery-btn");
    if (revealSurgeryBtn) {
      revealSurgeryBtn.addEventListener("click", function () {
        state.surgerySelectedTokens = challenge.tokens.map(function (t, i) {
          return { id: "tok-" + i, text: t };
        });
        state.surgeryAvailableTokens = [];
        renderSentenceSurgerySection();
        var feedbackBox = document.getElementById("surgery-feedback-box");
        if (feedbackBox) {
          feedbackBox.innerHTML =
            '<div class="state-banner is-success">' +
            "<strong>Kunci Struktur Kalimat:</strong> " +
            escapeHtml(challenge.tokens.join(" ")) +
            "</div>";
        }
      });
    }
  }

  // Wire Event Listeners
  function bindGlobalEvents() {
    var themeBtn = document.getElementById("theme-toggle-btn");
    if (themeBtn) {
      themeBtn.addEventListener("click", function () {
        state.theme = state.theme === "dark" ? "light" : "dark";
        applyTheme();
        saveState();
      });
    }

    document.querySelectorAll(".nav-tab[data-hub]").forEach(function (hubBtn) {
      hubBtn.addEventListener("click", function () {
        switchHub(hubBtn.getAttribute("data-hub"));
      });
    });

    document.querySelectorAll(".studio-mode-btn[data-tab], .hub-subpill[data-tab]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        switchTab(btn.getAttribute("data-tab"));
      });
    });

    document.querySelectorAll(".hub-subpill[data-progress-sub]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var sub = btn.getAttribute("data-progress-sub");
        if (window.JagoCoachSetSub) window.JagoCoachSetSub(sub);
        switchTab("coach", "progress", sub);
      });
    });

    var guideBtn = document.getElementById("studio-guide-toggle-btn");
    var guideBox = document.getElementById("studio-quick-tutorial");
    if (guideBtn && guideBox) {
      var storedOpen = window.localStorage.getItem("jago_studio_guide_open");
      var isOpen = storedOpen !== "0";
      guideBox.style.display = isOpen ? "" : "none";
      guideBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      guideBtn.textContent = isOpen ? "Sembunyikan Cara Pakai" : "Cara Pakai 30 Detik";
      guideBtn.addEventListener("click", function () {
        var nowOpen = guideBox.style.display === "none";
        guideBox.style.display = nowOpen ? "" : "none";
        guideBtn.setAttribute("aria-expanded", nowOpen ? "true" : "false");
        guideBtn.textContent = nowOpen ? "Sembunyikan Cara Pakai" : "Cara Pakai 30 Detik";
        try { window.localStorage.setItem("jago_studio_guide_open", nowOpen ? "1" : "0"); } catch (_) {}
      });
    }

    // Tense Matrix controls
    var propSelect = document.getElementById("tense-prop-select");
    if (propSelect) {
      propSelect.addEventListener("change", function () {
        state.tensePropId = propSelect.value;
        saveState();
        renderTenseMatrixModule();
      });
    }

    document.querySelectorAll(".polarity-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.tensePolarity = btn.getAttribute("data-polarity");
        saveState();
        renderTenseMatrixModule();
      });
    });

    document.querySelectorAll(".subject-num-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.tenseSubjNum = btn.getAttribute("data-subj");
        saveState();
        renderTenseMatrixModule();
      });
    });

    // SRS Filter controls
    var srsLevelSel = document.getElementById("srs-level-filter");
    if (srsLevelSel) {
      srsLevelSel.value = state.srsLevelFilter;
      srsLevelSel.addEventListener("change", function () {
        state.srsLevelFilter = srsLevelSel.value;
        state.srsCurrentIndex = 0;
        state.srsIsFlipped = false;
        saveState();
        renderSrsModule();
      });
    }

    var srsCatSel = document.getElementById("srs-category-filter");
    if (srsCatSel) {
      srsCatSel.value = state.srsCategoryFilter || "ALL";
      srsCatSel.addEventListener("change", function () {
        state.srsCategoryFilter = srsCatSel.value;
        state.srsCurrentIndex = 0;
        state.srsIsFlipped = false;
        saveState();
        renderSrsModule();
      });
    }

    var srsSearchInp = document.getElementById("srs-search-input");
    if (srsSearchInp) {
      srsSearchInp.value = state.srsSearchQuery;
      srsSearchInp.addEventListener("input", function () {
        state.srsSearchQuery = srsSearchInp.value;
        state.srsCurrentIndex = 0;
        state.srsIsFlipped = false;
        saveState();
        renderSrsModule();
      });
    }

    var srsResetFilterBtn = document.getElementById("srs-reset-filter-btn");
    if (srsResetFilterBtn) {
      srsResetFilterBtn.addEventListener("click", function () {
        state.srsLevelFilter = "ALL";
        state.srsSearchQuery = "";
        state.srsCurrentIndex = 0;
        state.srsIsFlipped = false;
        if (srsLevelSel) srsLevelSel.value = "ALL";
        if (srsSearchInp) srsSearchInp.value = "";
        saveState();
        renderSrsModule();
      });
    }

    // Custom SRS Card Form
    var customForm = document.getElementById("custom-card-form");
    if (customForm) {
      customForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var termInp = document.getElementById("custom-term-input");
        var levelSel = document.getElementById("custom-level-select");
        var ipaInp = document.getElementById("custom-ipa-input");
        var meaningInp = document.getElementById("custom-meaning-input");
        var exampleInp = document.getElementById("custom-example-input");
        var feedbackEl = document.getElementById("custom-card-feedback");

        var term = termInp ? termInp.value.trim() : "";
        var meaning = meaningInp ? meaningInp.value.trim() : "";
        var example = exampleInp ? exampleInp.value.trim() : "";

        if (!term || !meaning || !example) {
          if (feedbackEl) {
            feedbackEl.innerHTML =
              '<div class="state-banner is-error" role="alert">' +
              "<strong>Validasi Gagal:</strong> Kolom Kata Inggris, Arti Indonesia, dan Contoh Kalimat wajib diisi sebelum menyimpan." +
              "</div>";
          }
          return;
        }

        var newCard = {
          id: "custom-" + Date.now(),
          level: levelSel ? levelSel.value : "B2",
          category: "Kartu Kustom Pengguna",
          term: term,
          ipa: ipaInp && ipaInp.value.trim() ? ipaInp.value.trim() : "/kʌs.təm/",
          partOfSpeech: "custom phrase",
          meaningId: meaning,
          definitionEn: meaning,
          exampleEn: example,
          exampleId: meaning,
          collocations: [term]
        };

        state.customCards.push(newCard);
        state.srsLevelFilter = "ALL";
        state.srsSearchQuery = "";
        var filteredNow = getFilteredSrsCards();
        state.srsCurrentIndex = Math.max(0, filteredNow.length - 1);
        state.srsIsFlipped = false;
        saveState();
        renderSrsModule();

        if (termInp) termInp.value = "";
        if (ipaInp) ipaInp.value = "";
        if (meaningInp) meaningInp.value = "";
        if (exampleInp) exampleInp.value = "";

        if (feedbackEl) {
          feedbackEl.innerHTML =
            '<div class="state-banner is-success">' +
            '<strong>Berhasil Disimpan:</strong> Kartu <code>"' +
            escapeHtml(term) +
            '"</code> telah ditambahkan ke dalam antrean dek SRS Anda.' +
            "</div>";
        }
      });
    }

    // Speaking & Shadowing events
    var shadowingSelect = document.getElementById("shadowing-select");
    if (shadowingSelect) {
      shadowingSelect.addEventListener("change", function () {
        state.shadowingId = shadowingSelect.value;
        saveState();
        renderSpeakingModule();
      });
    }

    var speakNormalBtn = document.getElementById("speak-native-normal-btn");
    if (speakNormalBtn) {
      speakNormalBtn.addEventListener("click", function () {
        var p =
          DATA.shadowingPrompts.find(function (item) {
            return item.id === state.shadowingId;
          }) || DATA.shadowingPrompts[0];
        speakText(p.sentence, 1.0, 1.0);
      });
    }

    var speakSlowBtn = document.getElementById("speak-native-slow-btn");
    if (speakSlowBtn) {
      speakSlowBtn.addEventListener("click", function () {
        var p =
          DATA.shadowingPrompts.find(function (item) {
            return item.id === state.shadowingId;
          }) || DATA.shadowingPrompts[0];
        speakText(p.sentence, 0.78, 1.0);
      });
    }

    var micBtn = document.getElementById("start-mic-record-btn");
    if (micBtn) {
      micBtn.addEventListener("click", function () {
        var evalBox = document.getElementById("speech-evaluation-result");
        var manualInp = document.getElementById("manual-speech-input");
        var currentP =
          DATA.shadowingPrompts.find(function (item) {
            return item.id === state.shadowingId;
          }) || DATA.shadowingPrompts[0];

        if (!window.JagoSpeech) {
          if (evalBox) {
            evalBox.innerHTML =
              '<div class="state-banner is-error">Modul mikrofon belum dimuat. Ketik kalimat di kotak di atas untuk memeriksa kecocokan.</div>';
          }
          if (manualInp) manualInp.focus();
          return;
        }

        window.JagoSpeech.toggleRecording({
          button: micBtn,
          statusEl: evalBox,
          lang: "en-US",
          promptHint: currentP.sentence,
          idleLabel: "Cek Suara via Mikrofon",
          activeLabel: "Selesai Membaca",
          continuous: false,
          onResult: function (transcript) {
            if (manualInp) manualInp.value = transcript;
            evaluateSpeechSimilarity(currentP.sentence, transcript);
          }
        });
      });
    }

    var evalSpeechBtn = document.getElementById("evaluate-speech-btn");
    if (evalSpeechBtn) {
      evalSpeechBtn.addEventListener("click", function () {
        var manualInp = document.getElementById("manual-speech-input");
        var currentP =
          DATA.shadowingPrompts.find(function (item) {
            return item.id === state.shadowingId;
          }) || DATA.shadowingPrompts[0];
        evaluateSpeechSimilarity(
          currentP.sentence,
          manualInp ? manualInp.value : ""
        );
      });
    }

    // Sentence Surgery select
    var surgerySelect = document.getElementById("surgery-challenge-select");
    if (surgerySelect) {
      surgerySelect.addEventListener("change", function () {
        state.surgeryId = surgerySelect.value;
        var ch =
          DATA.sentenceSurgery.find(function (s) {
            return s.id === state.surgeryId;
          }) || DATA.sentenceSurgery[0];
        initSurgeryTokens(ch);
        saveState();
        renderSentenceSurgerySection();
      });
    }

    // Protocol Modal events (R-26, R-32: closable with Escape)
    var modalEl = document.getElementById("protocol-modal");
    var openModalBtn = document.getElementById("open-protocol-modal-btn");
    var closeModalBtn = document.getElementById("close-protocol-modal-btn");
    var confirmModalBtn = document.getElementById("confirm-protocol-modal-btn");
    var resetAllBtn = document.getElementById("reset-all-progress-btn");

    function openModal() {
      if (!modalEl) return;
      modalEl.classList.add("is-open");
      if (closeModalBtn) closeModalBtn.focus();
    }

    function closeModal() {
      if (!modalEl) return;
      modalEl.classList.remove("is-open");
      if (openModalBtn) openModalBtn.focus();
    }

    if (openModalBtn) openModalBtn.addEventListener("click", openModal);
    if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
    if (confirmModalBtn) confirmModalBtn.addEventListener("click", closeModal);
    if (modalEl) {
      modalEl.addEventListener("click", function (e) {
        if (e.target === modalEl) closeModal();
      });
    }

    if (resetAllBtn) {
      resetAllBtn.addEventListener("click", function () {
        var currentTheme = state.theme;
        state = cloneDefault();
        state.theme = currentTheme;
        saveState();
        renderAll();
        closeModal();
      });
    }

    // Global Keyboard Shortcuts (Escape for modal, Space & 1-4 for SRS when not typing in an input)
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modalEl && modalEl.classList.contains("is-open")) {
        e.preventDefault();
        closeModal();
        return;
      }

      var tag = e.target && e.target.tagName ? e.target.tagName.toLowerCase() : "";
      if (tag === "input" || tag === "textarea" || tag === "select") {
        return;
      }

      if (state.activeTab === "srs") {
        var filtered = getFilteredSrsCards();
        if (filtered.length === 0) return;
        var currentCard = filtered[state.srsCurrentIndex];

        if (e.code === "Space" && !state.srsIsFlipped) {
          e.preventDefault();
          state.srsIsFlipped = true;
          renderSrsModule();
        } else if (
          state.srsIsFlipped &&
          (e.key === "1" || e.key === "2" || e.key === "3" || e.key === "4")
        ) {
          e.preventDefault();
          gradeSrsCard(currentCard.id, parseInt(e.key, 10));
        }
      }
    });
  }

  function renderAll() {
    applyTheme();
    updateStudioAiBadge();
    updateLedgerStrip();
    switchTab(state.activeTab);
    renderCurriculumModule();
    renderTenseMatrixModule();
    renderSrsModule();
    renderSpeakingModule();
    renderDiagnosticModule();
  }

  renderAll();
  bindGlobalEvents();
})();

