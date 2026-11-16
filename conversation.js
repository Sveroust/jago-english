/*
 * Jago English - Modul Percakapan Sehari-hari & Bisnis Internasional
 * Menyediakan dialog bertingkat (Mudah, Menengah, Advance) untuk obrolan kabar harian,
 * perbandingan hidup di sini vs di sana, kesiapan dokumen, jadwal Zoom & kunjungan Jakarta,
 * serta studio balasan email dan WhatsApp dengan panduan cara baca lidah Indonesia.
 */
(function () {
  "use strict";

  var DATA = window.JAGO_CONVERSATION_DATA;
  var STORAGE_KEY = "jago_english_conv_v1";
  var root = null;

  var state = loadState();
  var isPlayingAll = false;
  var activeLineIndex = -1;
  var playAllTimer = null;

  function loadState() {
    var def = {
      viewMode: "scenarios", // "scenarios" | "replies"
      scenarioId: "conv-kabar",
      tier: "menengah", // "mudah" | "menengah" | "advance" | "compare"
      speed: 1.0,
      showPhonetics: true,
      replyChannel: "email", // "email" | "wa"
      replyLevel: "menengah" // "mudah" | "menengah" | "advance"
    };
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return def;
      var parsed = JSON.parse(raw);
      Object.keys(def).forEach(function (k) {
        if (parsed[k] !== undefined && parsed[k] !== null) def[k] = parsed[k];
      });
      return def;
    } catch (e) {
      return def;
    }
  }

  function saveState() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function toPhonetics(sentence) {
    if (window.JagoCoachCore && window.JagoCoachCore.toIndonesianPhonetics) {
      var pMap = window.COACH_DATA ? window.COACH_DATA.phoneticMap : {};
      return window.JagoCoachCore.toIndonesianPhonetics(sentence, pMap);
    }
    return sentence;
  }

  function speakLine(text, speaker, rate, onDone) {
    var pitch = speaker && speaker.indexOf("Kemal") !== -1 ? 1.0 : 0.94;
    if (window.jagoSpeakText) {
      window.jagoSpeakText(text, rate || state.speed, pitch, onDone);
    } else if (onDone) {
      onDone();
    }
  }

  function stopPlayback() {
    isPlayingAll = false;
    activeLineIndex = -1;
    if (playAllTimer) {
      clearTimeout(playAllTimer);
      playAllTimer = null;
    }
    if (window.jagoStopSpeech) window.jagoStopSpeech();
    updatePlayHighlight();
  }

  function updatePlayHighlight() {
    if (!root) return;
    var playBtn = document.getElementById("conv-play-all-btn");
    if (playBtn) {
      playBtn.textContent = isPlayingAll ? "Hentikan Pemutaran" : "Putar Semua Dialog Berurutan";
      playBtn.setAttribute("aria-pressed", isPlayingAll ? "true" : "false");
    }
    root.querySelectorAll(".conv-line-card").forEach(function (card) {
      var idx = parseInt(card.getAttribute("data-line-idx"), 10);
      if (isPlayingAll && idx === activeLineIndex) {
        card.classList.add("is-speaking");
      } else {
        card.classList.remove("is-speaking");
      }
    });
  }

  function playAllLines(lines) {
    if (!lines || !lines.length) return;
    if (isPlayingAll) {
      stopPlayback();
      return;
    }
    isPlayingAll = true;
    activeLineIndex = 0;

    function step() {
      if (!isPlayingAll || activeLineIndex >= lines.length) {
        stopPlayback();
        return;
      }
      updatePlayHighlight();
      var current = lines[activeLineIndex];
      speakLine(current.en, current.speaker, state.speed, function () {
        if (!isPlayingAll) return;
        playAllTimer = setTimeout(function () {
          activeLineIndex += 1;
          step();
        }, 420);
      });
    }
    step();
  }

  function sendToCoach(text) {
    stopPlayback();
    if (window.JagoCoachAnalyzeText) {
      window.JagoCoachAnalyzeText(text);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    var coachBtn = document.getElementById("tab-btn-coach");
    var coachInput = document.getElementById("coach-input");
    if (coachInput) {
      coachInput.value = text;
    }
    if (coachBtn) coachBtn.click();
    var analyzeBtn = document.querySelector('#panel-coach [data-action="analyze"]');
    if (analyzeBtn) analyzeBtn.click();
  }

  function copyWithFeedback(text, btn) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        var prev = btn.textContent;
        btn.textContent = "Tersalin!";
        setTimeout(function () { btn.textContent = prev; }, 1500);
      });
    }
  }

  function getActiveScenario() {
    if (!DATA || !DATA.scenarios || !DATA.scenarios.length) return null;
    for (var i = 0; i < DATA.scenarios.length; i++) {
      if (DATA.scenarios[i].id === state.scenarioId) return DATA.scenarios[i];
    }
    return DATA.scenarios[0];
  }

  function tierMeta(key) {
    if (key === "mudah") return { label: "Mudah", cefr: "A1 - A2", cls: "tier-mudah" };
    if (key === "advance") return { label: "Advance", cefr: "C1 - C2", cls: "tier-advance" };
    return { label: "Menengah", cefr: "B1 - B2", cls: "tier-menengah" };
  }

  function renderTopToolbar() {
    var modeScenariosActive = state.viewMode === "scenarios";
    return '' +
      '<div class="panel-card">' +
      '<div class="panel-card-header">' +
      '<h3 class="panel-card-title">Pilih Mode Latihan Percakapan</h3>' +
      '<span class="tag-mono">Mudah (A1-A2) · Menengah (B1-B2) · Advance (C1-C2)</span>' +
      '</div>' +
      '<div class="conv-mode-bar" role="group" aria-label="Pilih mode percakapan">' +
      '<button type="button" class="btn ' + (modeScenariosActive ? "btn-primary" : "") + '" data-conv-view="scenarios" aria-pressed="' + (modeScenariosActive ? "true" : "false") + '">' +
      'Dialog Situasional (7 Topik Harian &amp; Bisnis)' +
      '</button>' +
      '<button type="button" class="btn ' + (!modeScenariosActive ? "btn-primary" : "") + '" data-conv-view="replies" aria-pressed="' + (!modeScenariosActive ? "true" : "false") + '">' +
      'Studio Balasan Email &amp; WhatsApp (Kunjungan Jakarta &amp; Dokumen)' +
      '</button>' +
      '</div>' +
      '</div>';
  }

  function renderLinesHtml(lines) {
    return lines.map(function (line, idx) {
      var isUser = line.speaker && line.speaker.indexOf("Kemal") !== -1;
      var roleClass = isUser ? "is-user" : "is-partner";
      var phon = state.showPhonetics ? toPhonetics(line.en) : "";

      return '' +
        '<article class="conv-line-card ' + roleClass + '" data-line-idx="' + idx + '">' +
        '<div class="conv-line-head">' +
        '<span class="conv-speaker-badge ' + roleClass + '">' + esc(line.speaker) + '</span>' +
        '<div class="conv-line-actions">' +
        '<button type="button" class="btn btn-compact" data-conv-speak="' + esc(line.en) + '" data-conv-speaker="' + esc(line.speaker) + '">Dengar</button>' +
        '<button type="button" class="btn btn-compact" data-conv-copy="' + esc(line.en) + '">Salin</button>' +
        '<button type="button" class="btn btn-compact" data-conv-coach="' + esc(line.en) + '">Bedah &amp; Tes Mic</button>' +
        '</div>' +
        '</div>' +
        '<p class="conv-line-en">"' + esc(line.en) + '"</p>' +
        (state.showPhonetics
          ? '<div class="conv-line-phonetic"><strong>Cara baca lidah Indonesia:</strong> <span>' + esc(phon) + '</span></div>'
          : '') +
        '<p class="conv-line-id">' + esc(line.id) + '</p>' +
        '</article>';
    }).join("");
  }

  function renderCompareMode(scenario) {
    var tiersOrder = ["mudah", "menengah", "advance"];
    var colsHtml = tiersOrder.map(function (tk) {
      var td = scenario.tiers[tk];
      var meta = tierMeta(tk);
      var userLines = (td.lines || []).filter(function (l) {
        return l.speaker && l.speaker.indexOf("Kemal") !== -1;
      });
      var sampleJoined = userLines.map(function (l) { return l.en; }).join(" ");
      var itemsHtml = userLines.map(function (ul) {
        return '' +
          '<div class="conv-compare-item">' +
          '<p class="conv-compare-en">"' + esc(ul.en) + '"</p>' +
          '<p class="conv-compare-id">' + esc(ul.id) + '</p>' +
          '<div class="conv-compare-mini-btns">' +
          '<button type="button" class="btn btn-compact" data-conv-speak="' + esc(ul.en) + '" data-conv-speaker="' + esc(ul.speaker) + '">Dengar</button>' +
          '<button type="button" class="btn btn-compact" data-conv-copy="' + esc(ul.en) + '">Salin</button>' +
          '</div>' +
          '</div>';
      }).join("");

      return '' +
        '<div class="conv-compare-col ' + meta.cls + '">' +
        '<div class="conv-compare-col-head">' +
        '<span class="ladder-badge level-' + (tk === "mudah" ? "a2" : tk === "menengah" ? "b2" : "c1") + '">' + esc(meta.label) + ' (' + esc(meta.cefr) + ')</span>' +
        '<button type="button" class="btn btn-compact" data-conv-switch-tier="' + tk + '">Buka Penuh</button>' +
        '</div>' +
        '<p class="fine-print" style="margin-bottom:10px;">' + esc(td.focus) + '</p>' +
        itemsHtml +
        '<button type="button" class="btn btn-primary" style="width:100%; margin-top:8px;" data-conv-coach="' + esc(sampleJoined) + '">Uji Semua Kalimat Level Ini di Coach</button>' +
        '</div>';
    }).join("");

    return '' +
      '<div class="panel-card">' +
      '<div class="panel-card-header">' +
      '<h3 class="panel-card-title">Perbandingan Kalimat Anda: Mudah vs Menengah vs Advance</h3>' +
      '<span class="tag-mono">Kenaikan Keluwesan Langsung</span>' +
      '</div>' +
      '<p class="fine-print" style="margin-bottom:14px;">Lihat bagaimana maksud yang sama diucapkan dalam versi kalimat sederhana, bahasa kerja standar internasional, dan bahasa eksekutif berwibawa.</p>' +
      '<div class="conv-compare-grid">' + colsHtml + '</div>' +
      '</div>';
  }

  function renderScenariosView() {
    var sc = getActiveScenario();
    if (!sc) return '<div class="state-banner is-error">Data skenario percakapan belum tersedia.</div>';

    var sidebarHtml = DATA.scenarios.map(function (item) {
      var isAct = item.id === sc.id;
      return '' +
        '<button type="button" class="topic-list-item' + (isAct ? ' is-active' : '') + '" data-conv-scenario="' + esc(item.id) + '">' +
        '<div class="topic-list-meta">' +
        '<span>Skenario #' + item.no + '</span>' +
        '<span class="tag-mono">' + esc(item.category) + '</span>' +
        '</div>' +
        '<div class="topic-list-title">' + esc(item.title) + '</div>' +
        '<div class="topic-list-sub">' + esc(item.subtitle) + '</div>' +
        '</button>';
    }).join("");

    var isCompare = state.tier === "compare";
    var tierButtonsHtml = [
      { id: "mudah", label: "Mudah (A1-A2)" },
      { id: "menengah", label: "Menengah (B1-B2)" },
      { id: "advance", label: "Advance (C1-C2)" },
      { id: "compare", label: "Bandingkan 3 Level" }
    ].map(function (t) {
      var act = state.tier === t.id;
      return '<button type="button" class="btn ' + (act ? 'btn-primary' : '') + '" data-conv-tier="' + t.id + '" aria-pressed="' + (act ? 'true' : 'false') + '">' + t.label + '</button>';
    }).join("");

    var mainContentHtml = "";
    if (isCompare) {
      mainContentHtml = renderCompareMode(sc);
    } else {
      var td = sc.tiers[state.tier] || sc.tiers.menengah;
      var meta = tierMeta(state.tier);
      var keyPhrasesHtml = (td.keyPhrases || []).map(function (kp) {
        return '' +
          '<div class="topic-vocab-card">' +
          '<div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">' +
          '<strong style="font-size:0.98rem; color:var(--text-primary);">' + esc(kp.en) + '</strong>' +
          '<button type="button" class="btn btn-compact" data-conv-speak="' + esc(kp.en) + '">Dengar</button>' +
          '</div>' +
          '<div style="font-size:0.85rem; color:var(--text-secondary); margin-top:4px; line-height:1.45;">' + esc(kp.id) + '</div>' +
          '</div>';
      }).join("");

      mainContentHtml = '' +
        '<div class="panel-card">' +
        '<div class="panel-card-header">' +
        '<h3 class="panel-card-title">Naskah Dialog · Level ' + esc(meta.label) + ' (' + esc(meta.cefr) + ')</h3>' +
        '<button type="button" class="btn btn-compact" id="conv-toggle-phonetic-btn" aria-pressed="' + (state.showPhonetics ? 'true' : 'false') + '">' +
        (state.showPhonetics ? 'Sembunyikan Cara Baca' : 'Tampilkan Cara Baca') +
        '</button>' +
        '</div>' +
        '<p class="fine-print" style="margin-bottom:12px;"><strong>Fokus Level Ini:</strong> ' + esc(td.focus) + '</p>' +
        '<div class="conv-audio-deck">' +
        '<button type="button" class="btn btn-primary" id="conv-play-all-btn" aria-pressed="false">Putar Semua Dialog Berurutan</button>' +
        '<button type="button" class="btn ' + (state.speed === 0.85 ? 'btn-primary' : '') + '" data-conv-speed="0.85">Pelan (0.85x)</button>' +
        '<button type="button" class="btn ' + (state.speed === 1.0 ? 'btn-primary' : '') + '" data-conv-speed="1.0">Normal (1.0x)</button>' +
        '<button type="button" class="btn" id="conv-stop-audio-btn">Hentikan</button>' +
        '</div>' +
        '<div class="conv-lines-stack">' + renderLinesHtml(td.lines || []) + '</div>' +
        '</div>' +
        '<div class="panel-card">' +
        '<div class="panel-card-header">' +
        '<h3 class="panel-card-title">Bekal Frasa Kunci Level ' + esc(meta.label) + '</h3>' +
        '<span class="tag-mono">' + (td.keyPhrases ? td.keyPhrases.length : 0) + ' Ungkapan</span>' +
        '</div>' +
        '<div class="topic-vocab-grid">' + keyPhrasesHtml + '</div>' +
        '</div>';
    }

    return '' +
      '<div class="topics-stage-layout">' +
      '<aside class="topics-sidebar" aria-label="Daftar Skenario Percakapan">' + sidebarHtml + '</aside>' +
      '<div class="topic-detail-area">' +
      '<div class="topic-banner-card">' +
      '<div class="topic-banner-header">' +
      '<div>' +
      '<span class="tag-mono" style="margin-right:8px;">Skenario #' + sc.no + '</span>' +
      '<span class="tag-mono">' + esc(sc.category) + '</span>' +
      '</div>' +
      '</div>' +
      '<h3 class="topic-banner-title">' + esc(sc.title) + '</h3>' +
      '<p class="topic-banner-sub">' + esc(sc.situation) + '</p>' +
      '<div class="topic-hook-box">' +
      '<strong>Catatan Etika &amp; Budaya Mitra:</strong> ' + esc(sc.culturalNote) +
      '</div>' +
      '<div class="conv-tier-bar" role="group" aria-label="Pilih tingkat kesulitan percakapan">' +
      tierButtonsHtml +
      '</div>' +
      '</div>' +
      mainContentHtml +
      '</div>' +
      '</div>';
  }

  function renderRepliesView() {
    var list = DATA.replyTemplates || [];
    var current = list.filter(function (r) { return r.level === state.replyLevel; })[0] || list[1] || list[0];
    if (!current) return '<div class="state-banner is-error">Template balasan belum tersedia.</div>';

    var levelBtns = list.map(function (r) {
      var act = r.level === current.level;
      return '<button type="button" class="btn ' + (act ? 'btn-primary' : '') + '" data-reply-level="' + esc(r.level) + '" aria-pressed="' + (act ? 'true' : 'false') + '">' + esc(r.cefr) + '</button>';
    }).join("");

    var isEmail = state.replyChannel === "email";
    var textValue = isEmail ? current.emailBody : current.waBody;

    return '' +
      '<div class="panel-card">' +
      '<div class="panel-card-header">' +
      '<h3 class="panel-card-title">Studio Balasan Nyata: Dokumen Hampir Siap, Zoom &amp; Kunjungan Jakarta (28-29 Nov)</h3>' +
      '<span class="tag-mono">Bisa Diedit, Didengar, &amp; Disalin</span>' +
      '</div>' +
      '<p class="fine-print" style="margin-bottom:14px;">Menjawab email mitra seperti Mr. Nadeem Malik (Bushido Instruments) yang mengabarkan dokumen hampir siap, mengajak Zoom minggu depan, dan berencana datang seminggu ke Jakarta pada 28 atau 29 November 2026. Pilih tingkatan bahasanya lalu sesuaikan bagian di dalam kurung siku <code>[...]</code> dengan jam Anda.</p>' +
      '<div class="conv-reply-controls">' +
      '<div class="control-group" role="group" aria-label="Pilih Tingkat Kesulitan Balasan">' +
      levelBtns +
      '</div>' +
      '<div class="control-group" role="group" aria-label="Pilih Format Pesan">' +
      '<button type="button" class="btn ' + (isEmail ? 'btn-primary' : '') + '" data-reply-channel="email" aria-pressed="' + (isEmail ? 'true' : 'false') + '">Format Email Resmi</button>' +
      '<button type="button" class="btn ' + (!isEmail ? 'btn-primary' : '') + '" data-reply-channel="wa" aria-pressed="' + (!isEmail ? 'true' : 'false') + '">Format WhatsApp Hangat</button>' +
      '</div>' +
      '</div>' +
      '<div class="topic-hook-box" style="margin-top:12px;">' +
      '<strong>Karakter Gaya Bahasa (' + esc(current.cefr) + '):</strong> ' + esc(current.title) + '. ' + esc(current.tip) +
      '</div>' +
      (isEmail
        ? '<div class="conv-subject-row"><label for="conv-reply-subject" class="control-label">Subjek Email:</label><input type="text" id="conv-reply-subject" class="text-input" style="flex:1; min-width:240px;" value="' + esc(current.emailSubject) + '"><button type="button" class="btn btn-compact" id="conv-copy-subject-btn">Salin Subjek</button></div>'
        : '') +
      '<label for="conv-reply-editor" class="control-label" style="display:block; margin:14px 0 6px;">Naskah Balasan (silakan edit jadwal Anda langsung di sini):</label>' +
      '<textarea id="conv-reply-editor" class="coach-textarea" rows="' + (isEmail ? 13 : 6) + '">' + esc(textValue) + '</textarea>' +
      '<div class="control-group" style="margin-top:12px;">' +
      '<button type="button" class="btn btn-primary" id="conv-reply-speak-btn">Dengarkan Cara Pengucapannya</button>' +
      '<button type="button" class="btn" id="conv-reply-stop-btn">Hentikan Suara</button>' +
      '<button type="button" class="btn" id="conv-reply-copy-btn">Salin Naskah Lengkap</button>' +
      '<button type="button" class="btn" id="conv-reply-coach-btn">Cek &amp; Bedah di Coach</button>' +
      '</div>' +
      '</div>';
  }

  function render() {
    if (!root) return;
    if (!DATA || !DATA.scenarios) {
      root.innerHTML = '<div class="state-banner is-error">Basis data percakapan tidak ditemukan.</div>';
      return;
    }

    var bodyHtml = state.viewMode === "replies" ? renderRepliesView() : renderScenariosView();
    root.innerHTML = renderTopToolbar() + bodyHtml;
  }

  function handleClick(e) {
    var target = e.target;

    var viewBtn = target.closest("[data-conv-view]");
    if (viewBtn) {
      stopPlayback();
      state.viewMode = viewBtn.getAttribute("data-conv-view");
      saveState();
      render();
      return;
    }

    var scenarioBtn = target.closest("[data-conv-scenario]");
    if (scenarioBtn) {
      stopPlayback();
      state.scenarioId = scenarioBtn.getAttribute("data-conv-scenario");
      saveState();
      render();
      if (window.innerWidth <= 960 && root) {
        var detailEl = root.querySelector(".topic-detail-area");
        if (detailEl && typeof detailEl.scrollIntoView === "function") {
          try { detailEl.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (_) {}
        }
      }
      return;
    }

    var tierBtn = target.closest("[data-conv-tier]");
    if (tierBtn) {
      stopPlayback();
      state.tier = tierBtn.getAttribute("data-conv-tier");
      saveState();
      render();
      return;
    }

    var switchTierBtn = target.closest("[data-conv-switch-tier]");
    if (switchTierBtn) {
      stopPlayback();
      state.tier = switchTierBtn.getAttribute("data-conv-switch-tier");
      saveState();
      render();
      return;
    }

    var speedBtn = target.closest("[data-conv-speed]");
    if (speedBtn) {
      stopPlayback();
      state.speed = parseFloat(speedBtn.getAttribute("data-conv-speed")) || 1.0;
      saveState();
      render();
      return;
    }

    if (target.id === "conv-toggle-phonetic-btn") {
      state.showPhonetics = !state.showPhonetics;
      saveState();
      render();
      return;
    }

    if (target.id === "conv-play-all-btn") {
      var sc = getActiveScenario();
      var td = sc && sc.tiers[state.tier];
      if (td && td.lines) playAllLines(td.lines);
      return;
    }

    if (target.id === "conv-stop-audio-btn" || target.id === "conv-reply-stop-btn") {
      stopPlayback();
      return;
    }

    var speakBtn = target.closest("[data-conv-speak]");
    if (speakBtn) {
      stopPlayback();
      speakLine(speakBtn.getAttribute("data-conv-speak"), speakBtn.getAttribute("data-conv-speaker") || "", state.speed);
      return;
    }

    var copyBtn = target.closest("[data-conv-copy]");
    if (copyBtn) {
      copyWithFeedback(copyBtn.getAttribute("data-conv-copy"), copyBtn);
      return;
    }

    var coachBtn = target.closest("[data-conv-coach]");
    if (coachBtn) {
      sendToCoach(coachBtn.getAttribute("data-conv-coach"));
      return;
    }

    var replyLvlBtn = target.closest("[data-reply-level]");
    if (replyLvlBtn) {
      stopPlayback();
      state.replyLevel = replyLvlBtn.getAttribute("data-reply-level");
      saveState();
      render();
      return;
    }

    var replyChanBtn = target.closest("[data-reply-channel]");
    if (replyChanBtn) {
      stopPlayback();
      state.replyChannel = replyChanBtn.getAttribute("data-reply-channel");
      saveState();
      render();
      return;
    }

    if (target.id === "conv-copy-subject-btn") {
      var subEl = document.getElementById("conv-reply-subject");
      if (subEl) copyWithFeedback(subEl.value, target);
      return;
    }

    var edEl = document.getElementById("conv-reply-editor");
    if (target.id === "conv-reply-speak-btn" && edEl) {
      stopPlayback();
      speakLine(edEl.value, "Kemal (Anda)", state.speed);
    } else if (target.id === "conv-reply-copy-btn" && edEl) {
      copyWithFeedback(edEl.value, target);
    } else if (target.id === "conv-reply-coach-btn" && edEl) {
      sendToCoach(edEl.value);
    }
  }

  function init() {
    root = document.getElementById("conversation-root");
    if (!root) return;
    render();
    root.addEventListener("click", handleClick);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
