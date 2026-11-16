(function () {
  "use strict";

  var DATA = window.COACH_DATA;
  var CORE = window.JagoCoachCore;
  var root = document.getElementById("coach-root");
  if (!root) return;
  if (!DATA || !CORE) {
    root.innerHTML =
      '<div class="state-banner is-error" role="alert"><strong>Modul Coach gagal dimuat:</strong> file coach-data.js atau coach-core.js tidak ditemukan. Muat ulang halaman.</div>';
    return;
  }

  var KEY = "jago_coach_state_v1";
  var esc = CORE.escapeHtml;

  var defaults = {
    sub: "analyze",
    draft: "",
    speechLang: "en-US",
    examKey: "ielts",
    freeCloudCheck: true,
    roadTrack: "daily14",
    roadDone: {},
    customStops: [],
    customContexts: [],
    customRules: [],
    errorLog: {},
    drillMastery: {},
    pronLog: {},
    planDone: {},
    scores: [],
    history: []
  };

  var cs = load();
  var lastAnalysis = null;
  var currentDrill = null;
  var loopTimer = null;
  var recognition = null;
  var voices = [];
  var activeLtRequest = 0;

  function escapeRegexStr(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function syncCustomRules() {
    DATA.errorRules = DATA.errorRules.filter(function (r) { return !r.isCustom; });
    (cs.customRules || []).forEach(function (cr) {
      if (!cr || !cr.wrongPhrase || !cr.rightPhrase) return;
      DATA.errorRules.unshift({
        id: cr.id,
        cat: cr.cat || "UPDATE MANDIRI",
        pattern: new RegExp("\\b" + escapeRegexStr(cr.wrongPhrase) + "\\b", "gi"),
        replace: cr.rightPhrase,
        why: cr.why || "Aturan tambahan yang kamu simpan sendiri.",
        wrong: cr.wrongPhrase,
        right: cr.rightPhrase,
        isCustom: true
      });
    });
  }
  syncCustomRules();

  function load() {
    try {
      var raw = window.localStorage.getItem(KEY);
      var out = JSON.parse(JSON.stringify(defaults));
      if (!raw) return out;
      var parsed = JSON.parse(raw);
      Object.keys(out).forEach(function (k) {
        if (parsed[k] !== undefined && parsed[k] !== null) out[k] = parsed[k];
      });
      return out;
    } catch (e) {
      return JSON.parse(JSON.stringify(defaults));
    }
  }

  function save() {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(cs));
    } catch (e) {
      /* storage may be blocked in private mode; session still works */
    }
  }

  /* ---------- Speech output ---------- */

  function loadVoices() {
    if (!("speechSynthesis" in window)) return;
    voices = window.speechSynthesis.getVoices();
  }
  loadVoices();
  if ("speechSynthesis" in window && window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = function () {
      loadVoices();
      populateVoicePicker();
    };
  }

  function populateVoicePicker() {
    var select = document.getElementById("coach-voice-select");
    if (!select) return;
    var allVoices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    if (!allVoices.length) return;
    var saved = localStorage.getItem("jago_selected_voice") || window.JAGO_SELECTED_VOICE || "";
    var currentVal = select.value || saved;
    select.innerHTML = "";

    var enVoices = [];
    var otherVoices = [];
    allVoices.forEach(function (v) {
      if (v.lang && v.lang.indexOf("en") === 0) enVoices.push(v);
      else otherVoices.push(v);
    });

    var optgroupEn = document.createElement("optgroup");
    optgroupEn.label = "Suara Bahasa Inggris (Rekomendasi)";
    enVoices.forEach(function (v) {
      var opt = document.createElement("option");
      opt.value = v.name;
      opt.textContent = v.name + " (" + v.lang + ")" + (v.default ? " [Default]" : "");
      if (v.name === currentVal || (!currentVal && (v.name.indexOf("Samantha") !== -1 || v.name.indexOf("Daniel") !== -1))) {
        opt.selected = true;
      }
      optgroupEn.appendChild(opt);
    });
    select.appendChild(optgroupEn);

    if (otherVoices.length > 0) {
      var optgroupOther = document.createElement("optgroup");
      optgroupOther.label = "Semua Suara Sistem Lainnya";
      otherVoices.forEach(function (v) {
        var opt = document.createElement("option");
        opt.value = v.name;
        opt.textContent = v.name + " (" + v.lang + ")";
        if (v.name === currentVal) opt.selected = true;
        optgroupOther.appendChild(opt);
      });
      select.appendChild(optgroupOther);
    }
  }

  function pickVoice() {
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
  }
  window.jagoPickVoice = pickVoice;

  function stopSpeech() {
    if (loopTimer) clearTimeout(loopTimer);
    loopTimer = null;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setAudioStatus("Siap diputar", false);
    clearActiveWord();
  }

  function setAudioStatus(text, playing) {
    var el = document.getElementById("coach-audio-status");
    if (!el) return;
    el.textContent = text;
    el.classList.toggle("is-playing", Boolean(playing));
  }

  function clearActiveWord() {
    root.querySelectorAll(".coach-word.is-active").forEach(function (el) { el.classList.remove("is-active"); });
  }

  function speak(text, rate, loop, onDone) {
    if (!("speechSynthesis" in window)) {
      setAudioStatus("Peramban ini tidak mendukung suara. Gunakan Chrome atau Safari.", false);
      return;
    }
    if (loopTimer) clearTimeout(loopTimer);
    window.speechSynthesis.cancel();
    var run = function () {
      var u = new SpeechSynthesisUtterance(text);
      var v = pickVoice();
      if (v) u.voice = v;
      u.lang = v ? v.lang : "en-US";
      u.rate = rate;
      u.onstart = function () {
        setAudioStatus((loop ? "Mengulang " : "Memutar ") + rate + "x", true);
      };
      u.onend = function () {
        if (loop) {
          loopTimer = setTimeout(run, 650);
        } else {
          setAudioStatus("Siap diputar", false);
          if (onDone) onDone();
        }
      };
      u.onerror = function () {
        setAudioStatus("Siap diputar", false);
        if (onDone) onDone();
      };
      window.speechSynthesis.speak(u);
    };
    run();
  }

  /* ---------- Speech input ---------- */

  function getRecognition() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    return SR ? new SR() : null;
  }

  function startDictation() {
    var feedback = document.getElementById("coach-input-feedback");
    var ta = document.getElementById("coach-input");
    var btn = document.getElementById("coach-dictate-btn");
    if (!window.JagoSpeech) {
      if (feedback) feedback.innerHTML = '<div class="state-banner is-error">Modul dikte suara belum dimuat.</div>';
      return;
    }
    window.JagoSpeech.toggleRecording({
      button: btn,
      statusEl: feedback,
      lang: cs.speechLang || "auto",
      promptHint: ta && ta.value ? ta.value : "We export kemiri candlenuts and medical devices with IDAK and CDAKB permits.",
      idleLabel: "Mulai Dikte",
      activeLabel: "Selesai Rekam",
      continuous: true,
      onInterim: function (chunk) {
        if (ta && chunk) {
          ta.value = (ta.value ? ta.value.trim() + " " : "") + chunk.trim();
          cs.draft = ta.value;
          save();
        }
      },
      onResult: function (transcript) {
        if (ta && transcript) {
          ta.value = (ta.value ? ta.value.trim() + " " : "") + transcript.trim();
          cs.draft = ta.value;
          save();
        }
      }
    });
  }

  function setDictButton(active) {
    var btn = document.getElementById("coach-dictate-btn");
    if (!btn) return;
    btn.textContent = active ? "Berhenti Merekam" : "Mulai Dikte";
    btn.setAttribute("aria-pressed", active ? "true" : "false");
  }

  function readAloudCheck(idx, btnEl) {
    var out = document.getElementById("coach-readaloud-" + idx);
    if (!out || !lastAnalysis) return;
    var target = lastAnalysis.sentences[idx];
    if (!window.JagoSpeech) {
      out.innerHTML = '<div class="state-banner is-error">Modul pengecekan mikrofon belum dimuat.</div>';
      return;
    }
    var triggerBtn = btnEl || document.querySelector('[data-action="readaloud"][data-idx="' + idx + '"]');
    window.JagoSpeech.toggleRecording({
      button: triggerBtn,
      statusEl: out,
      lang: "en-US",
      promptHint: target,
      idleLabel: "Baca ulang via mikrofon",
      activeLabel: "Selesai Membaca",
      continuous: false,
      onResult: function (heard, meta) {
        var diff = CORE.diffWords(target, heard);
        diff.items.forEach(function (it) {
          if (it.status === "miss" && it.word.length >= 3) {
            cs.pronLog[it.word] = (cs.pronLog[it.word] || 0) + 1;
          }
        });
        save();
        var chips = diff.items.map(function (it) {
          return '<span class="diff-chip ' + (it.status === "ok" ? "is-ok" : "is-miss") + '">' +
            (it.status === "ok" ? "Terdengar: " : "Meleset: ") + esc(it.word) + "</span>";
        }).join(" ");
        out.innerHTML =
          '<div class="state-banner ' + (diff.accuracy >= 85 ? "is-success" : "") + '">' +
          "<strong>Kecocokan " + diff.accuracy + " persen</strong> (transkrip: \"" + esc(heard) + "\", engine: " + esc((meta && meta.engine) || "lokal") + ").<div class=\"chip-row\">" + chips + "</div>" +
          (diff.extra.length ? "<p>Kata tambahan terdengar: " + esc(diff.extra.join(", ")) + "</p>" : "") +
          '<p class="fine-print">Kata meleset berarti mesin tidak menangkapnya. Itu petunjuk, bukan bukti salah ucap, karena aksen dan kualitas mikrofon ikut berpengaruh. Kata yang meleset 3 kali atau lebih masuk daftar prioritas di Buku Kesalahanku.</p>' +
          "</div>";
      }
    });
  }

  /* ---------- Rendering helpers ---------- */

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function tag(text) {
    return '<span class="tag-mono">' + esc(text) + "</span>";
  }

  function syncSectionHeader() {
    var hEl = document.getElementById("coach-section-heading");
    var subEl = document.getElementById("coach-section-subtitle");
    if (!hEl || !subEl) return;
    if (cs.sub === "analyze") {
      hEl.textContent = "Cek Bahasa Inggris, Arti Indonesia, & Perbaikan Standar Tinggi";
      subEl.textContent = "Rekam suara atau ketik kalimatmu bebas (boleh campur sedikit kata Indonesia). Lihat arti maksud Inggrismu dalam bahasa Indonesia, perbaikan grammar berstandar tinggi, versi santai sampai eksekutif, dan tes pengucapanmu.";
    } else {
      hEl.textContent = "Peta Belajar Harian, Catatan Kesalahan, & Target Skor";
      subEl.textContent = "Pantau rutinitas harian 14 hari, ulas pola kesalahan grammar yang sering muncul lewat kuis cepat, dan simpan target skor ujianmu.";
    }
  }

  function subnavHtml() {
    if (cs.sub === "analyze") return "";
    if (cs.sub === "tracker" || cs.sub === "rubric") {
      return '<div class="coach-subnav" role="group" aria-label="Tampilan Skor dan Kriteria">' +
        '<button type="button" class="btn' + (cs.sub === "tracker" ? " btn-primary" : "") + '" data-action="sub" data-sub="tracker" aria-pressed="' + (cs.sub === "tracker") + '">Catatan Skor Latihan</button>' +
        '<button type="button" class="btn' + (cs.sub === "rubric" ? " btn-primary" : "") + '" data-action="sub" data-sub="rubric" aria-pressed="' + (cs.sub === "rubric") + '">Kriteria Penilaian IELTS/TOEFL</button>' +
        "</div>";
    }
    return "";
  }

  function render() {
    syncSectionHeader();
    var body = "";
    if (cs.sub === "analyze") body = analyzeShell();
    else if (cs.sub === "notebook") body = notebookHtml();
    else if (cs.sub === "plan") body = planHtml();
    else if (cs.sub === "tracker") body = trackerHtml();
    else body = rubricHtml();

    root.innerHTML = subnavHtml() + body;
    populateVoicePicker();

    if (cs.sub === "analyze") {
      var ta = document.getElementById("coach-input");
      ta.value = cs.draft;
      if (lastAnalysis) renderResults();
    }
    if (cs.sub === "notebook") ensureDrill();
  }

  /* ---------- A. Analysis ---------- */

  function allSamples() {
    return DATA.samples.concat(cs.customContexts || []);
  }

  function analyzeShell() {
    var samples = allSamples().map(function (s) {
      if (s.isCustom) {
        return '<span class="tpl-chip-group">' +
          '<button type="button" class="btn btn-compact" data-action="sample" data-sample="' + esc(s.id) + '">' + esc(s.label) + '</button>' +
          '<button type="button" class="btn btn-compact tpl-del-btn" data-action="del-context" data-id="' + esc(s.id) + '" aria-label="Hapus template ' + esc(s.label) + '">&times;</button>' +
          '</span>';
      }
      return '<button type="button" class="btn btn-compact" data-action="sample" data-sample="' + esc(s.id) + '">' + esc(s.label) + "</button>";
    }).join("");
    return '' +
      '<div class="panel-card">' +
      '<div class="panel-card-header"><h2 class="panel-card-title">Template &amp; Masukan Kalimat Bahasa Inggris</h2><span class="tag-mono">Boleh Edit Bebas</span></div>' +
      '<p class="fine-print">Pilih template siap pakai lalu ubah kata-katanya semaumu, atau langsung ketik dan rekam ucapan Inggrismu bebas (boleh campur istilah Indonesia seperti <em>IDAK</em>, <em>CDAKB</em>, atau <em>kemiri</em>):</p>' +
      '<div class="tpl-chip-bar" role="group" aria-label="Template Latihan Bahasa Inggris">' + samples + '</div>' +
      '<div class="control-group" style="margin:12px 0;">' +
      '<label for="coach-lang" class="control-label">Bahasa mikrofon:</label>' +
      '<select id="coach-lang" class="select-input" data-action="lang"><option value="en-US"' + (cs.speechLang === "en-US" ? " selected" : "") + '>Inggris (en-US)</option><option value="id-ID"' + (cs.speechLang === "id-ID" ? " selected" : "") + '>Indonesia (id-ID)</option><option value="auto"' + (cs.speechLang === "auto" ? " selected" : "") + '>Campuran ID + EN (Otomatis)</option></select>' +
      '<button type="button" class="btn btn-primary" id="coach-dictate-btn" data-action="dictate" aria-pressed="false">Mulai Dikte</button>' +
      '<label class="check-row" style="margin-left:8px;"><input type="checkbox" data-action="toggle-lt"' + (cs.freeCloudCheck !== false ? " checked" : "") + '><span>Gunakan pemeriksa tata bahasa tambahan (LanguageTool)</span></label>' +
      "</div>" +
      '<label for="coach-input" class="control-label" style="display:block;margin-bottom:6px;">Kalimat bahasa Inggris yang ingin dicek &amp; diartikan:</label>' +
      '<textarea id="coach-input" class="coach-textarea" rows="5" placeholder="Ketik atau rekam Inggrismu bebas di sini... Contoh: Thank you for coming again in Indonesia Mr. Malik, we have a good news about IDAK regulation."></textarea>' +
      '<div id="coach-input-feedback" aria-live="polite"></div>' +
      '<div class="control-group" style="margin-top:12px;">' +
      '<button type="button" class="btn btn-primary" data-action="analyze">Cek Grammar, Level &amp; Arti Indonesia</button>' +
      '<button type="button" class="btn" id="coach-toggle-save-tpl-btn" data-action="toggle-save-tpl">+ Simpan Jadi Template</button>' +
      '<button type="button" class="btn" data-action="clear">Kosongkan</button>' +
      "</div>" +
      '<div id="coach-save-tpl-bar" class="inline-save-bar" style="display:none;">' +
      '<input type="text" id="coach-quick-tpl-label" class="text-input" placeholder="Nama template (mis. Update Izin ke Buyer)...">' +
      '<button type="button" class="btn btn-primary" data-action="save-quick-tpl">Simpan Template</button>' +
      '<button type="button" class="btn" data-action="cancel-quick-tpl">Batal</button>' +
      '</div>' +
      '<div id="coach-tpl-feedback" aria-live="polite"></div>' +
      "</div>" +
      '<div class="coach-audio-bar" style="flex-wrap:wrap; gap:10px;"><span class="control-label">Audio:</span><span id="coach-audio-status" class="status-chip" role="status">Siap diputar</span><button type="button" class="btn" data-action="stop">Hentikan Audio</button><div class="voice-select-wrap"><label for="coach-voice-select" class="control-label" style="margin-left:6px;">Suara Sistem:</label><select id="coach-voice-select" class="select-input" data-action="voice-select" style="max-width:240px;"></select><button type="button" class="btn" data-action="test-voice">Tes Suara</button></div></div>' +
      '<div id="coach-results" aria-live="polite">' +
      '<div class="state-banner">Isi atau pilih template di atas lalu klik <strong>Cek Grammar, Level &amp; Arti Indonesia</strong> untuk melihat arti kalimatmu di telinga lawan bicara, perbaikan tata bahasa, dan versi bertingkat lengkap dengan cara baca.</div>' +
      "</div>";
  }

  function bandRow(label, value, note) {
    var pct = Math.round((value / 9) * 100);
    return '<div class="band-row"><div class="band-label">' + esc(label) + '</div>' +
      '<div class="band-track" aria-hidden="true"><div class="band-fill" style="width:' + pct + '%"></div></div>' +
      '<div class="band-value">' + value.toFixed(1) + "</div>" +
      (note ? '<div class="band-note">' + esc(note) + "</div>" : "") + "</div>";
  }

  function runOnlineAiCheck(analysisSnapshot, reqId) {
    var sourceText = analysisSnapshot && (analysisSnapshot.original || analysisSnapshot.input || analysisSnapshot.corrected);
    if (!sourceText || !window.JagoAI) return;
    analysisSnapshot.aiStatus = "checking";
    updateMeaningCardOnly(analysisSnapshot);

    window.JagoAI.analyzeEnglish(sourceText, analysisSnapshot)
      .then(function (aiRes) {
        if (reqId !== activeLtRequest || lastAnalysis !== analysisSnapshot) return;
        analysisSnapshot.aiStatus = "ready";
        analysisSnapshot.aiData = aiRes;
        updateMeaningCardOnly(analysisSnapshot);
      })
      .catch(function (err) {
        if (reqId !== activeLtRequest || lastAnalysis !== analysisSnapshot) return;
        analysisSnapshot.aiStatus = "error";
        analysisSnapshot.aiError = err && err.message ? err.message : "Layanan AI tidak merespons.";
        updateMeaningCardOnly(analysisSnapshot);
      });
  }

  function updateMeaningCardOnly(a) {
    var slot = document.getElementById("coach-meaning-slot");
    if (slot) {
      slot.innerHTML = renderAiMeaningCard(a);
    } else if (cs.sub === "analyze") {
      renderResults();
    }
  }

  function runFreeLanguageToolCheck(analysisSnapshot, reqId) {
    if (cs.freeCloudCheck === false || typeof window.fetch !== "function") {
      analysisSnapshot.ltStatus = "off";
      return;
    }
    analysisSnapshot.ltStatus = "checking";
    renderResults();

    var body = "language=en-US&text=" + encodeURIComponent(analysisSnapshot.corrected);
    window.fetch("https://api.languagetool.org/v2/check", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body
    })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (json) {
        if (reqId !== activeLtRequest || lastAnalysis !== analysisSnapshot) return;
        var beforeCount = analysisSnapshot.findings.length;
        if (json && Array.isArray(json.matches)) {
          CORE.mergeLanguageToolMatches(analysisSnapshot, json.matches, DATA);
        }
        var added = analysisSnapshot.findings.length - beforeCount;
        analysisSnapshot.ltStatus = added > 0 ? "added:" + added : "clean";
        if (added > 0 && analysisSnapshot.aiData && CORE.buildLeveledEnglish) {
          var rebuilt = CORE.buildLeveledEnglish(analysisSnapshot.corrected, DATA);
          var meanId = analysisSnapshot.aiData.meaningId || "";
          analysisSnapshot.aiData.tiers = {
            casual: { en: rebuilt.casualB1, id: meanId, phonetic: CORE.toIndonesianPhonetics(rebuilt.casualB1, DATA.phoneticMap) },
            professional: { en: rebuilt.professionalB2, id: meanId, phonetic: CORE.toIndonesianPhonetics(rebuilt.professionalB2, DATA.phoneticMap) },
            executive: { en: rebuilt.executiveC1, id: meanId, phonetic: CORE.toIndonesianPhonetics(rebuilt.executiveC1, DATA.phoneticMap) }
          };
          analysisSnapshot.aiData.statusBadge = analysisSnapshot.findings.length + " Poin Perbaikan Tata Bahasa";
        }
        if (cs.sub === "analyze") renderResults();
      })
      .catch(function () {
        if (reqId !== activeLtRequest || lastAnalysis !== analysisSnapshot) return;
        analysisSnapshot.ltStatus = "offline";
        if (cs.sub === "analyze") renderResults();
      });
  }

  function runAnalysis() {
    var ta = document.getElementById("coach-input");
    var results = document.getElementById("coach-results");
    var text = ta.value.trim();
    cs.draft = ta.value;
    if (!text) {
      results.innerHTML = '<div class="state-banner is-error" role="alert"><strong>Teks masih kosong.</strong> Ketik, tempel, atau dikte minimal satu kalimat, lalu klik Bedah Teks lagi.</div>';
      return;
    }
    stopSpeech();
    activeLtRequest += 1;
    var reqId = activeLtRequest;

    lastAnalysis = CORE.analyze(text, DATA);
    lastAnalysis.lowConfidence = lastAnalysis.stats.words < 20;

    lastAnalysis.findings.forEach(function (f) {
      if (f.id && f.id.indexOf("lt-") !== 0) {
        cs.errorLog[f.id] = cs.errorLog[f.id] || { count: 0, last: "" };
        cs.errorLog[f.id].count += 1;
        cs.errorLog[f.id].last = today();
      }
    });
    cs.history.push({
      date: today(), words: lastAnalysis.stats.words, density: lastAnalysis.stats.density,
      overall: lastAnalysis.stats.overall, errors: lastAnalysis.findings.length
    });
    cs.history = cs.history.slice(-30);
    save();
    renderResults();
    runFreeLanguageToolCheck(lastAnalysis, reqId);
    runOnlineAiCheck(lastAnalysis, reqId);
  }

  function ltStatusBadge(status) {
    if (status === "checking") return '<span class="fine-print">Memeriksa tata bahasa...</span>';
    if (status && status.indexOf("added:") === 0) return tag("+" + status.split(":")[1] + " koreksi tambahan");
    return "";
  }

  function renderAiMeaningCard(a) {
    if (!a) return "";
    if (a.aiStatus === "checking") {
      return '<div class="panel-card"><div class="panel-card-header"><h2 class="panel-card-title">Arti ke Bahasa Indonesia &amp; Pilihan Tingkatan</h2><span class="tag-mono">Menganalisis...</span></div>' +
        '<div class="state-banner">Menerjemahkan maksud kalimat Inggrismu ke bahasa Indonesia dan menyiapkan tingkatan kalimat...</div></div>';
    }
    var ai = a.aiData;
    if (!ai) {
      var fallbackNote = a.aiStatus === "error" && a.aiError
        ? '<div class="state-banner is-error">' + esc(a.aiError) + ' (menampilkan analisis tata bahasa lokal).</div>'
        : "";
      return fallbackNote;
    }

    var meaningHtml = ai.meaningId
      ? '<div class="meaning-callout">' +
        '<span class="meaning-label">Maksud kalimatmu di telinga lawan bicara (Bahasa Indonesia):</span>' +
        '<p class="meaning-text">"' + esc(ai.meaningId) + '"</p>' +
        '</div>'
      : (ai.quotaLimited
        ? '<div class="state-banner">Batas kuota terjemah harian gratis MyMemory sedang tercapai sementara dan akan pulih otomatis. Pemeriksaan grammar dan 3 tingkatan kalimat Inggris tetap aktif di bawah.</div>'
        : '');

    var tiers = ai.tiers || {};
    var tierList = [
      { key: "casual", badge: "B1 · Santai / Sehari-hari", obj: tiers.casual },
      { key: "professional", badge: "B2 · Kerja Profesional", obj: tiers.professional },
      { key: "executive", badge: "C1 · Eksekutif Band 7.5+", obj: tiers.executive }
    ].filter(function (x) { return x.obj && x.obj.en; });

    var tiersHtml = tierList.length
      ? '<div class="ladder-container" style="margin-top:14px;">' + tierList.map(function (item) {
          var o = item.obj;
          return '<div class="ladder-step">' +
            '<div class="ladder-step-header">' +
            '<span class="ladder-badge level-' + (item.key === "casual" ? "b1" : item.key === "professional" ? "b2" : "c1") + '">' + esc(item.badge) + '</span>' +
            '</div>' +
            '<div class="ladder-en">"' + esc(o.en) + '"</div>' +
            (o.id ? '<div class="ladder-note"><strong>Arti Indonesia:</strong> ' + esc(o.id) + '</div>' : '') +
            (o.phonetic ? '<div class="fine-print" style="margin-top:4px;"><strong>Cara baca lidah Indonesia:</strong> ' + esc(o.phonetic) + '</div>' : '') +
            '<div class="ladder-actions">' +
            '<button type="button" class="btn btn-primary" data-action="say" data-text="' + esc(o.en) + '" data-rate="0.95">Dengar Normal</button>' +
            '<button type="button" class="btn" data-action="say" data-text="' + esc(o.en) + '" data-rate="0.72">Lambat</button>' +
            '</div></div>';
        }).join("") + '</div>'
      : "";

    var fixesHtml = Array.isArray(ai.fixes) && ai.fixes.length
      ? '<div style="margin-top:14px;"><div class="control-label" style="margin-bottom:6px;">Poin Perbaikan Kontekstual:</div><ul class="simple-list">' +
        ai.fixes.map(function (fx) {
          return '<li><del>' + esc(fx.wrong) + '</del> -&gt; <strong>' + esc(fx.right) + '</strong>' +
            (fx.whyId ? ' <span class="fine-print">(' + esc(fx.whyId) + ')</span>' : '') + '</li>';
        }).join("") + '</ul></div>'
      : "";

    var nextBlock = ai.nextEn
      ? '<div class="next-box" style="margin-top:14px;">' +
        '<div class="sentence-en"><strong>Saran kalimat lanjutan alami:</strong> ' + esc(ai.nextEn) + '</div>' +
        (ai.nextId ? '<div class="sentence-note">' + esc(ai.nextId) + '</div>' : '') +
        '<div class="control-group"><button type="button" class="btn" data-action="say" data-text="' + esc(ai.nextEn) + '" data-rate="0.95">Putar saran lanjutan</button></div>' +
        '</div>'
      : "";

    return '<div id="coach-meaning-card" class="panel-card">' +
      '<div class="panel-card-header">' +
      '<h2 class="panel-card-title">Arti Bahasa Indonesia &amp; Tingkatan Standar Tinggi</h2>' +
      '<span class="tag-mono">' + esc((ai.cefr ? ai.cefr + " · " : "") + (ai.source || "Online")) + '</span>' +
      '</div>' +
      '<div class="control-group" style="margin-bottom:10px;">' +
      '<span class="status-chip is-playing">' + esc(ai.statusBadge || "Analisis Selesai") + '</span>' +
      '</div>' +
      meaningHtml +
      tiersHtml +
      fixesHtml +
      nextBlock +
      '</div>';
  }

  function renderResults() {
    var a = lastAnalysis;
    var results = document.getElementById("coach-results");
    if (!a || !results) return;
    var s = a.stats;
    var intent = a.intent || {};

    var findingsHtml = a.findings.length === 0
      ? '<div class="state-banner is-success"><strong>Tidak ada pola kesalahan yang terdeteksi.</strong> Mesin lokal (' + DATA.errorRules.length + ' aturan kontras Indonesia-Inggris) dan pemeriksa tambahan tidak menemukan kesalahan pada teks ini.</div>'
      : a.findings.map(function (f) {
        return '<div class="formula-item">' +
          '<div class="finding-head">' + tag(f.cat) + (f.manual ? tag("PERIKSA SENDIRI") : "") + (f.source === "LanguageTool Gratis" ? tag("LANGUAGETOOL GRATIS") : "") + "</div>" +
          '<p class="finding-fix"><span class="fix-from">' + esc(f.original) + "</span> " +
          (f.manual ? "<span>saran:</span> <strong>" + esc(f.suggest) + "</strong>" : "<span>menjadi</span> <strong>" + esc(f.corrected) + "</strong>") + "</p>" +
          '<p class="fine-print">' + esc(f.why) + "</p></div>";
      }).join("");

    var bridgeHtml = a.localTerms.length === 0
      ? '<div class="state-banner">Tidak ada istilah lokal terdaftar yang terdeteksi. Daftar istilah saat ini: kemiri, cabai, Borobudur, batik, rendang, gotong royong, IDAK, CDAKB, AKL, Kemenkes, alkes.</div>'
      : a.localTerms.map(function (t) {
        return '<div class="formula-item"><div class="finding-head">' + tag(t.strategy) + "</div>" +
          "<strong>" + esc(t.label) + "</strong>" +
          '<p class="fine-print">' + esc(t.note) + "</p>" +
          '<p class="bridge-sentence">' + esc(t.sentence) + "</p>" +
          '<p class="fine-print"><strong>Cara baca lidah Indonesia:</strong> ' + esc(t.say) + "</p>" +
          '<div class="control-group">' +
          '<button type="button" class="btn btn-primary" data-action="say" data-text="' + esc(t.sentence) + '" data-rate="0.95">Normal</button>' +
          '<button type="button" class="btn" data-action="say" data-text="' + esc(t.sentence) + '" data-rate="0.72">Lambat</button>' +
          '<button type="button" class="btn" data-action="say" data-text="' + esc(t.sentence) + '" data-rate="0.9" data-loop="1">Ulangi</button>' +
          "</div></div>";
      }).join("");

    var weakHtml = a.weakWords.length === 0
      ? '<div class="state-banner">Tidak ada kata lemah terdaftar yang terdeteksi.</div>'
      : '<div class="vocab-grid-coach">' + a.weakWords.map(function (w) {
        return '<div class="formula-item"><strong>' + esc(w.weak) + "</strong> menjadi: " +
          w.better.map(function (b) { return tag(b); }).join(" ") +
          '<p class="fine-print">' + esc(w.note) + "</p>" +
          '<p class="bridge-sentence">' + esc(w.example) + "</p>" +
          '<button type="button" class="btn" data-action="say" data-text="' + esc(w.example) + '" data-rate="0.9">Dengar contoh</button></div>';
      }).join("") + "</div>";

    var pronHtml = a.pronunciation.length === 0
      ? '<div class="state-banner">Tidak ada kata berisiko tinggi dari daftar pantauan.</div>'
      : '<div class="vocab-grid-coach">' + a.pronunciation.map(function (p) {
        return '<div class="formula-item"><strong>' + esc(p.word) + "</strong> " + '<code class="formula-syntax">' + esc(p.ipa) + "</code>" +
          '<p class="fine-print">' + esc(p.tip) + "</p>" +
          '<div class="control-group"><button type="button" class="btn btn-primary" data-action="say" data-text="' + esc(p.word) + '" data-rate="0.85">Dengar</button>' +
          '<button type="button" class="btn" data-action="say" data-text="' + esc(p.word) + '" data-rate="0.6">Lambat</button></div></div>';
      }).join("") + "</div>";

    var sentenceHtml = a.sentences.map(function (sen, i) {
      var phon = (a.sentencePhonetics && a.sentencePhonetics[i]) ? a.sentencePhonetics[i] : "";
      return '<div class="sentence-row-coach"><p class="sent-line"><span class="sent-num">' + (i + 1) + ".</span> " + esc(sen) + "</p>" +
        (phon ? '<p class="fine-print" style="margin:4px 0 8px;"><strong>Cara baca lidah Indonesia (HURUF BESAR = ditekan):</strong> ' + esc(phon) + "</p>" : "") +
        '<div class="control-group">' +
        '<button type="button" class="btn btn-primary" data-action="say" data-text="' + esc(sen) + '" data-rate="0.95">Normal</button>' +
        '<button type="button" class="btn" data-action="say" data-text="' + esc(sen) + '" data-rate="0.72">Lambat</button>' +
        '<button type="button" class="btn" data-action="say" data-text="' + esc(sen) + '" data-rate="0.9" data-loop="1">Ulangi kalimat ini</button>' +
        '<button type="button" class="btn" data-action="readaloud" data-idx="' + i + '">Baca ulang via mikrofon</button>' +
        "</div><div id=\"coach-readaloud-" + i + '" aria-live="polite"></div></div>';
    }).join("");

    var nextSentences = (intent.nextSentences || []);
    var nextHtml = nextSentences.length === 0
      ? '<div class="state-banner">Belum ada saran kalimat lanjutan.</div>'
      : nextSentences.map(function (ns, idx) {
        return '<div class="formula-item">' +
          '<p class="bridge-sentence"><strong>' + (idx + 1) + ". " + esc(ns.en) + "</strong></p>" +
          '<p class="fine-print"><strong>Arti:</strong> ' + esc(ns.id) + "</p>" +
          '<p class="fine-print"><strong>Cara baca lidah Indonesia:</strong> ' + esc(ns.say) + "</p>" +
          '<div class="control-group">' +
          '<button type="button" class="btn btn-primary" data-action="say" data-text="' + esc(ns.en) + '" data-rate="0.95">Dengar Normal</button>' +
          '<button type="button" class="btn" data-action="say" data-text="' + esc(ns.en) + '" data-rate="0.72">Lambat</button>' +
          '<button type="button" class="btn" data-action="append-next" data-text="' + esc(ns.en) + '">Tambahkan ke Teks</button>' +
          "</div></div>";
      }).join("");

    var paraTokens = (a.corrected.match(/([A-Za-z0-9'-]+|[^A-Za-z0-9'-]+)/g) || []).map(function (tok) {
      return /^[A-Za-z0-9'-]+$/.test(tok)
        ? '<button type="button" class="coach-word" data-action="word" data-word="' + esc(tok) + '">' + esc(tok) + "</button>"
        : esc(tok);
    }).join("");

    var lowNote = s.words < 40
      ? '<div class="state-banner"><strong>Teks pendek (' + s.words + ' kata).</strong> Indikator band tidak stabil di bawah 40 kata. Untuk gambaran yang lebih berguna, bicara atau tulis 120 kata atau lebih.</div>'
      : "";

    results.innerHTML = '' +
      '<div class="panel-card">' +
      '<div class="panel-card-header"><h2 class="panel-card-title">Mungkin Maksud Kamu Begini</h2>' + ltStatusBadge(a.ltStatus) + "</div>" +
      "<p><strong>Topik:</strong> " + esc(intent.title || "Penyampaian gagasan dalam bahasa Inggris") + "</p>" +
      '<p class="fine-print">' + esc(intent.summary || "") + "</p>" +
      '<div class="state-banner"><strong>Saran perbaikan utama:</strong> ' + esc(intent.focusTip || "") + "</div>" +
      "</div>" +

      '<div class="panel-card">' +
      '<div class="panel-card-header"><h2 class="panel-card-title">Ringkasan Diagnostik</h2></div>' +
      lowNote +
      '<div class="stat-grid">' +
      '<div class="stat"><span class="stat-num">' + s.words + '</span><span class="stat-label">kata</span></div>' +
      '<div class="stat"><span class="stat-num">' + s.sentences + '</span><span class="stat-label">kalimat</span></div>' +
      '<div class="stat"><span class="stat-num">' + a.findings.length + '</span><span class="stat-label">koreksi</span></div>' +
      '<div class="stat"><span class="stat-num">' + s.density + '</span><span class="stat-label">kesalahan per 100 kata</span></div>' +
      '<div class="stat"><span class="stat-num">' + s.complexRatio + '%</span><span class="stat-label">kalimat kompleks</span></div>' +
      "</div>" +
      '<h3 class="sub-heading">Perkiraan Band (setelah koreksi diterapkan)</h3>' +
      bandRow("Grammatical Range and Accuracy", s.bands.grammar, "Dihitung dari kepadatan kesalahan dan porsi kalimat kompleks.") +
      bandRow("Lexical Resource", s.bands.lexical, s.advancedHits + " kosakata spesifik, " + s.weakHits + " kata umum.") +
      bandRow("Coherence (penanda wacana)", s.bands.coherence, s.markerHits + " kata penghubung antarkalimat.") +
      '<p class="fine-print"><strong>Fluency dan Pronunciation tidak dinilai dari teks.</strong> Keduanya membutuhkan rekaman suara dan penilai manusia. Indikator gabungan: ' + s.overall.toFixed(1) + ".</p>" +
      "</div>" +

      '<div class="panel-card"><div class="panel-card-header"><h2 class="panel-card-title">Teks Terkoreksi</h2></div>' +
      '<p class="corrected-text">' + a.markedHtml + "</p>" +
      '<div class="control-group"><button type="button" class="btn" data-action="copy">Salin teks terkoreksi</button>' +
      '<button type="button" class="btn btn-primary" data-action="say" data-text="' + esc(a.corrected) + '" data-rate="0.95">Putar semua</button>' +
      '<button type="button" class="btn" data-action="say" data-text="' + esc(a.corrected) + '" data-rate="0.72">Putar lambat</button></div>' +
      '<div id="coach-copy-feedback" aria-live="polite"></div></div>' +

      '<div class="panel-card"><div class="panel-card-header"><h2 class="panel-card-title">Versi Natural Setara Band 7.5+ (C1)</h2></div>' +
      '<p class="corrected-text">' + esc(a.c1Upgrade || a.corrected) + "</p>" +
      '<p class="fine-print"><strong>Cara baca lidah Indonesia (HURUF BESAR = ditekan):</strong> ' + esc(a.c1Phonetics || "") + "</p>" +
      '<div class="control-group"><button type="button" class="btn" data-action="copy-c1">Salin versi C1</button>' +
      '<button type="button" class="btn btn-primary" data-action="say" data-text="' + esc(a.c1Upgrade || a.corrected) + '" data-rate="0.95">Putar versi C1</button>' +
      '<button type="button" class="btn" data-action="say" data-text="' + esc(a.c1Upgrade || a.corrected) + '" data-rate="0.72">Putar lambat</button></div>' +
      '<div id="coach-copy-c1-feedback" aria-live="polite"></div></div>' +

      '<div id="coach-meaning-slot">' + renderAiMeaningCard(a) + '</div>' +

      '<div class="panel-card"><div class="panel-card-header"><h2 class="panel-card-title">Rincian Koreksi (' + a.findings.length + ")</h2></div>" + findingsHtml + "</div>" +

      '<div class="panel-card"><div class="panel-card-header"><h2 class="panel-card-title">Cara Menjelaskan Istilah Lokal</h2></div>' + bridgeHtml + "</div>" +

      '<div class="panel-card"><div class="panel-card-header"><h2 class="panel-card-title">Pilihan Kata yang Lebih Kuat</h2></div>' + weakHtml + "</div>" +

      '<div class="panel-card"><div class="panel-card-header"><h2 class="panel-card-title">Kata yang Sering Terpeleset Saat Diucapkan</h2></div>' + pronHtml + "</div>" +

      '<div class="panel-card"><div class="panel-card-header"><h2 class="panel-card-title">Klik Kata untuk Mendengar</h2></div>' +
      '<p class="coach-paragraph">' + paraTokens + "</p></div>" +

      '<div class="panel-card"><div class="panel-card-header"><h2 class="panel-card-title">Latihan Per Kalimat &amp; Cara Baca</h2></div>' + sentenceHtml + "</div>" +

      '<div class="panel-card"><div class="panel-card-header"><h2 class="panel-card-title">Kalimat Lanjutan (What to Say Next)</h2></div>' +
      '<p class="fine-print">Jika bingung ingin melanjutkan bicara apa setelah kalimatmu selesai, pilih salah satu kalimat penerus di bawah ini:</p>' +
      nextHtml + "</div>";
  }

  /* ---------- B. Notebook ---------- */

  function ruleById(id) {
    for (var i = 0; i < DATA.errorRules.length; i++) {
      if (DATA.errorRules[i].id === id) return DATA.errorRules[i];
    }
    return null;
  }

  function isMastered(id) {
    return (cs.drillMastery[id] || 0) >= 3;
  }

  function ensureDrill() {
    var ids = Object.keys(cs.errorLog)
      .filter(function (id) { return ruleById(id) && !isMastered(id); })
      .sort(function (a, b) { return cs.errorLog[b].count - cs.errorLog[a].count; });
    if (ids.length === 0) {
      currentDrill = null;
    } else if (!currentDrill || ids.indexOf(currentDrill.id) === -1 || currentDrill.answered) {
      var pick = ids[Math.floor(Math.random() * Math.min(3, ids.length))];
      currentDrill = { id: pick, rightFirst: Math.random() < 0.5, answered: false };
    }
    paintDrill();
  }

  function paintDrill() {
    var holder = document.getElementById("coach-drill");
    if (!holder) return;
    if (!currentDrill) {
      var hasLog = Object.keys(cs.errorLog).length > 0;
      holder.innerHTML = hasLog
        ? '<div class="state-banner is-success"><strong>Semua aturan yang pernah muncul sudah dikuasai.</strong> Jalankan analisis baru di bagian A untuk menemukan pola berikutnya.</div>'
        : '<div class="state-banner"><strong>Belum ada latihan.</strong> Latihan dibuat dari kesalahanmu sendiri. Jalankan Bedah Teks di bagian A, lalu kembali ke sini.</div>';
      return;
    }
    var rule = ruleById(currentDrill.id);
    var options = currentDrill.rightFirst ? [rule.right, rule.wrong] : [rule.wrong, rule.right];
    holder.innerHTML = '' +
      '<p><strong>Mana kalimat yang benar?</strong> ' + tag(rule.cat) + ' ' + tag("dikuasai setelah 3 benar berturut-turut: " + (cs.drillMastery[rule.id] || 0) + "/3") + "</p>" +
      '<div class="quiz-option-list">' + options.map(function (o, i) {
        return '<button type="button" class="quiz-option-btn" data-action="drill" data-pick="' + (o === rule.right ? "right" : "wrong") + '" ' + (currentDrill.answered ? "disabled" : "") + '><span class="tag-mono">' + (i === 0 ? "A" : "B") + "</span><span>" + esc(o) + "</span></button>";
      }).join("") + "</div>" +
      '<div id="coach-drill-feedback" aria-live="polite"></div>';
  }

  function answerDrill(pick) {
    if (!currentDrill || currentDrill.answered) return;
    var rule = ruleById(currentDrill.id);
    var correct = pick === "right";
    currentDrill.answered = true;
    cs.drillMastery[rule.id] = correct ? (cs.drillMastery[rule.id] || 0) + 1 : 0;
    save();
    var fb = document.getElementById("coach-drill-feedback");
    fb.innerHTML = '<div class="state-banner ' + (correct ? "is-success" : "is-error") + '"><strong>' + (correct ? "Benar." : "Kurang tepat.") + "</strong> Kalimat benar: " + esc(rule.right) + '<p class="fine-print">' + esc(rule.why) + '</p><button type="button" class="btn btn-primary" data-action="nextdrill">Soal berikutnya</button></div>';
    root.querySelectorAll('[data-action="drill"]').forEach(function (b) {
      b.disabled = true;
      if (b.getAttribute("data-pick") === "right") b.classList.add("is-correct");
      else if (b.getAttribute("data-pick") === pick) b.classList.add("is-wrong");
    });
    refreshNotebookTable();
  }

  function errorTableHtml() {
    var ids = Object.keys(cs.errorLog).filter(ruleById).sort(function (a, b) { return cs.errorLog[b].count - cs.errorLog[a].count; });
    if (ids.length === 0) {
      return '<div class="state-banner"><strong>Belum ada kesalahan tercatat.</strong> Setiap kali kamu menjalankan Bedah Teks, pola yang ditemukan dicatat di sini dan diurutkan dari yang paling sering.</div>';
    }
    return '<div class="table-wrap"><table class="data-table"><thead><tr><th scope="col">Pola</th><th scope="col">Kategori</th><th scope="col">Muncul</th><th scope="col">Terakhir</th><th scope="col">Status</th></tr></thead><tbody>' +
      ids.map(function (id) {
        var r = ruleById(id);
        return "<tr><td>" + esc(r.wrong) + " menjadi " + esc(r.right) + "</td><td>" + esc(r.cat) + "</td><td>" + cs.errorLog[id].count + "x</td><td>" + esc(cs.errorLog[id].last) + "</td><td>" + (isMastered(id) ? "Dikuasai" : "Dilatih") + "</td></tr>";
      }).join("") + "</tbody></table></div>";
  }

  function historyHtml() {
    if (cs.history.length === 0) {
      return '<div class="state-banner"><strong>Belum ada riwayat.</strong> Setiap analisis menambah satu baris. Dengan 5 baris atau lebih terlihat apakah kepadatan kesalahanmu turun.</div>';
    }
    var rows = cs.history.slice(-10).reverse();
    var trend = "";
    if (cs.history.length >= 6) {
      var recent = cs.history.slice(-3).reduce(function (s, h) { return s + h.density; }, 0) / 3;
      var before = cs.history.slice(-6, -3).reduce(function (s, h) { return s + h.density; }, 0) / 3;
      trend = recent < before
        ? '<p class="fine-print"><strong>Tren membaik:</strong> rata-rata 3 analisis terakhir ' + recent.toFixed(1) + " dibanding " + before.toFixed(1) + " sebelumnya.</p>"
        : '<p class="fine-print"><strong>Tren belum membaik:</strong> rata-rata 3 analisis terakhir ' + recent.toFixed(1) + " dibanding " + before.toFixed(1) + " sebelumnya. Fokus ke 3 pola teratas di tabel.</p>";
    }
    return trend + '<div class="table-wrap"><table class="data-table"><thead><tr><th scope="col">Tanggal</th><th scope="col">Kata</th><th scope="col">Temuan</th><th scope="col">Per 100 kata</th><th scope="col">Indikator</th></tr></thead><tbody>' +
      rows.map(function (h) { return "<tr><td>" + esc(h.date) + "</td><td>" + h.words + "</td><td>" + h.errors + "</td><td>" + h.density + "</td><td>" + Number(h.overall).toFixed(1) + "</td></tr>"; }).join("") + "</tbody></table></div>";
  }

  function pronLogHtml() {
    var words = Object.keys(cs.pronLog).filter(function (w) { return cs.pronLog[w] >= 1; }).sort(function (a, b) { return cs.pronLog[b] - cs.pronLog[a]; });
    if (words.length === 0) {
      return '<div class="state-banner"><strong>Belum ada data pengucapan.</strong> Gunakan Baca ulang via mikrofon di bagian A. Kata yang tidak tertangkap mesin dicatat di sini.</div>';
    }
    return '<div class="chip-row">' + words.slice(0, 24).map(function (w) {
      var n = cs.pronLog[w];
      return '<button type="button" class="diff-chip ' + (n >= 3 ? "is-miss" : "") + '" data-action="say" data-text="' + esc(w) + '" data-rate="0.7">' + esc(w) + " (" + n + "x" + (n >= 3 ? ", prioritas" : "") + ")</button>";
    }).join(" ") + "</div>";
  }

  function customRulesHtml() {
    var list = cs.customRules || [];
    var rows = list.length === 0
      ? '<div class="state-banner"><strong>Belum ada aturan atau jembatan kata tambahan.</strong> Tambahkan kata Indonesia atau frasa yang sering kamu pakai di formulir di atas, dan mesin akan langsung mengoreksinya saat Bedah Teks.</div>'
      : '<div class="table-wrap"><table class="data-table"><thead><tr><th scope="col">Kata / Frasa Awal</th><th scope="col">Koreksi / Bahasa Inggris</th><th scope="col">Alasan</th><th scope="col">Aksi</th></tr></thead><tbody>' +
        list.map(function (cr) {
          return "<tr><td>" + esc(cr.wrongPhrase) + "</td><td><strong>" + esc(cr.rightPhrase) + "</strong></td><td>" + esc(cr.why || "-") + '</td><td><button type="button" class="btn" data-action="delcustom" data-id="' + esc(cr.id) + '">Hapus</button></td></tr>';
        }).join("") + "</tbody></table></div>";

    return '<div class="panel-card"><div class="panel-card-header"><h2 class="panel-card-title">Tambah Jembatan Kata atau Koreksi Sendiri</h2></div>' +
      '<p class="fine-print">Punya istilah bisnis, singkatan produk, atau kesalahan yang sering kamu ulang? Simpan di bawah agar otomatis dikoreksi saat kamu membedah teks.</p>' +
      '<form id="coach-custom-rule-form" novalidate>' +
      '<div class="form-grid">' +
      '<div><label for="cr-wrong" class="control-label">Kata Indonesia / Frasa Awal *</label><input id="cr-wrong" type="text" class="text-input" placeholder="Contoh: surat jalan"></div>' +
      '<div><label for="cr-right" class="control-label">Padanan Inggris / Koreksi *</label><input id="cr-right" type="text" class="text-input" placeholder="Contoh: delivery order"></div>' +
      '<div><label for="cr-why" class="control-label">Catatan singkat</label><input id="cr-why" type="text" class="text-input" placeholder="Contoh: Istilah dokumen pengiriman"></div>' +
      "</div>" +
      '<div id="coach-custom-rule-feedback" aria-live="polite"></div>' +
      '<button type="submit" class="btn btn-primary" style="margin-top:12px;">Simpan Aturan</button>' +
      "</form>" +
      '<div style="margin-top:14px;">' + rows + "</div></div>";
  }

  function saveCustomRule() {
    var wEl = document.getElementById("cr-wrong");
    var rEl = document.getElementById("cr-right");
    var yEl = document.getElementById("cr-why");
    var fb = document.getElementById("coach-custom-rule-feedback");
    var wrongPhrase = wEl ? wEl.value.trim() : "";
    var rightPhrase = rEl ? rEl.value.trim() : "";
    var why = yEl ? yEl.value.trim() : "";
    if (!wrongPhrase || !rightPhrase) {
      if (fb) fb.innerHTML = '<div class="state-banner is-error" role="alert">Kata awal dan koreksi bahasa Inggris wajib diisi.</div>';
      return;
    }
    cs.customRules = cs.customRules || [];
    cs.customRules.unshift({
      id: "custom-" + Date.now(),
      cat: "UPDATE MANDIRI",
      wrongPhrase: wrongPhrase,
      rightPhrase: rightPhrase,
      why: why || "Aturan tambahan yang kamu simpan sendiri."
    });
    syncCustomRules();
    save();
    render();
  }

  function notebookHtml() {
    return '' +
      customRulesHtml() +
      '<div class="panel-card"><div class="panel-card-header"><h2 class="panel-card-title">Latihan dari Kesalahanmu</h2></div><div id="coach-drill"></div></div>' +
      '<div class="panel-card"><div class="panel-card-header"><h2 class="panel-card-title">Pola Kesalahan yang Pernah Muncul</h2></div><div id="coach-error-table">' + errorTableHtml() + "</div></div>" +
      '<div class="panel-card"><div class="panel-card-header"><h2 class="panel-card-title">Riwayat Analisis</h2></div>' + historyHtml() + "</div>" +
      '<div class="panel-card"><div class="panel-card-header"><h2 class="panel-card-title">Kata yang Sering Meleset di Mikrofon</h2></div>' + pronLogHtml() +
      '<div class="coach-audio-bar" style="margin-top:12px;"><span class="control-label">Audio:</span><span id="coach-audio-status" class="status-chip" role="status">Siap diputar</span><button type="button" class="btn" data-action="stop">Hentikan Audio</button></div></div>';
  }

  function refreshNotebookTable() {
    var el = document.getElementById("coach-error-table");
    if (el) el.innerHTML = errorTableHtml();
  }

  /* ---------- C. Road Map Day-by-Day & 12 Minggu ---------- */

  function getActiveRoadStops() {
    var tracks = DATA.roadmapTracks || {};
    var baseTrack = tracks[cs.roadTrack] || tracks.daily14 || { title: "ROAD MAP", subtitle: "DAY-BY-DAY", finishLabel: "DONE!", stops: [] };
    var stops = baseTrack.stops.slice();
    if (cs.roadTrack === "daily14" && Array.isArray(cs.customStops) && cs.customStops.length > 0) {
      stops = stops.concat(cs.customStops);
    }
    return {
      title: baseTrack.title,
      subtitle: baseTrack.subtitle,
      finishLabel: baseTrack.finishLabel,
      stops: stops
    };
  }

  function saveCustomStop() {
    var bEl = document.getElementById("rm-badge");
    var tEl = document.getElementById("rm-title");
    var fEl = document.getElementById("rm-focus");
    var kEl = document.getElementById("rm-tasks");
    var pEl = document.getElementById("rm-practice");
    var fb = document.getElementById("coach-roadmap-form-feedback");

    var badge = bEl ? bEl.value.trim() : "";
    var title = tEl ? tEl.value.trim() : "";
    var focus = fEl ? fEl.value.trim() : "";
    var rawTasks = kEl ? kEl.value.trim() : "";
    var practiceText = pEl ? pEl.value.trim() : "";

    if (!badge || !title || !rawTasks) {
      if (fb) fb.innerHTML = '<div class="state-banner is-error" role="alert">Label Hari/Tahun, Judul Target, dan minimal 1 tugas wajib diisi.</div>';
      return;
    }

    var tasks = rawTasks.split(/\n|;/).map(function (s) { return s.trim(); }).filter(Boolean);
    cs.customStops = cs.customStops || [];
    cs.customStops.push({
      id: "cstop-" + Date.now(),
      badge: badge.toUpperCase(),
      title: title,
      focus: focus || "Target Kustom",
      tasks: tasks,
      practiceText: practiceText || title,
      isCustom: true
    });
    cs.roadTrack = "daily14";
    save();
    render();
  }

  function saveCustomContext() {
    var lEl = document.getElementById("ctx-label");
    var tEl = document.getElementById("ctx-text");
    var fb = document.getElementById("coach-context-form-feedback");
    var label = lEl ? lEl.value.trim() : "";
    var text = tEl ? tEl.value.trim() : "";
    if (!label || !text) {
      if (fb) fb.innerHTML = '<div class="state-banner is-error" role="alert">Nama konteks dan teks latihan wajib diisi.</div>';
      return;
    }
    cs.customContexts = cs.customContexts || [];
    cs.customContexts.push({
      id: "ctx-" + Date.now(),
      label: label,
      text: text,
      isCustom: true
    });
    save();
    render();
  }

  function exportBackupJson() {
    var blob = new Blob([JSON.stringify(cs, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "jago-english-roadmap-backup-" + today() + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function planHtml() {
    var activeRoad = getActiveRoadStops();
    var roadTotalTasks = 0;
    var roadDoneTasks = 0;
    var currentStopAssigned = false;

    var stopsHtml = activeRoad.stops.map(function (stop, idx) {
      var stopDoneCount = 0;
      var taskRows = (stop.tasks || []).map(function (tText, ti) {
        var rKey = "rm-" + stop.id + "-" + ti;
        var checked = Boolean((cs.roadDone || {})[rKey]);
        roadTotalTasks += 1;
        if (checked) {
          roadDoneTasks += 1;
          stopDoneCount += 1;
        }
        return '<li><label class="check-row"><input type="checkbox" data-action="road-task" data-key="' + esc(rKey) + '"' + (checked ? " checked" : "") + "><span>" + esc(tText) + "</span></label></li>";
      }).join("");

      var allStopDone = stop.tasks && stop.tasks.length > 0 && stopDoneCount === stop.tasks.length;
      var isCurrent = false;
      if (!allStopDone && !currentStopAssigned) {
        isCurrent = true;
        currentStopAssigned = true;
      }

      var sideClass = idx % 2 === 0 ? "is-left" : "is-right";
      var stateClass = allStopDone ? "is-done" : isCurrent ? "is-current" : "";

      var cardHtml = '<div class="road-card">' +
        '<div class="road-card-head">' +
        '<span class="road-card-title">' + esc(stop.title) + "</span>" +
        (isCurrent ? '<span class="road-state-pill is-active">Hari aktif</span>' : allStopDone ? '<span class="road-state-pill is-done">Selesai</span>' : "") +
        "</div>" +
        (stop.focus ? '<p class="road-focus-note">' + esc(stop.focus) + "</p>" : "") +
        '<ul class="road-bullet-list">' + taskRows + "</ul>" +
        '<div class="control-group">' +
        '<button type="button" class="btn btn-primary" data-action="practice-stop" data-id="' + esc(stop.id) + '">Latih di Studio</button>' +
        (stop.isCustom ? '<button type="button" class="btn" data-action="del-stop" data-id="' + esc(stop.id) + '">Hapus</button>' : "") +
        "</div></div>";

      var leftCol = idx % 2 === 0
        ? '<div class="road-card-col left-col">' + cardHtml + "</div>"
        : '<div class="road-card-col empty-col" aria-hidden="true"></div>';

      var rightCol = idx % 2 === 1
        ? '<div class="road-card-col right-col">' + cardHtml + "</div>"
        : '<div class="road-card-col empty-col" aria-hidden="true"></div>';

      return '<div class="road-stop ' + sideClass + " " + stateClass + '">' +
        leftCol +
        '<div class="road-spine-cell"><span class="road-milestone-badge">' + esc(stop.badge) + "</span></div>" +
        rightCol +
        "</div>";
    }).join("");

    var roadPct = roadTotalTasks ? Math.round((roadDoneTasks / roadTotalTasks) * 100) : 0;

    var totalItems = 0;
    var doneItems = 0;
    var firstOpen = -1;
    var weeks = DATA.studyPlan.map(function (w, wi) {
      var done = 0;
      var itemsHtml = w.items.map(function (it, ii) {
        var key = "w" + w.week + "-i" + ii;
        var checked = Boolean(cs.planDone[key]);
        if (checked) done += 1;
        return '<li><label class="check-row"><input type="checkbox" data-action="plan" data-key="' + key + '"' + (checked ? " checked" : "") + "><span>" + esc(it) + "</span></label></li>";
      }).join("");
      totalItems += w.items.length;
      doneItems += done;
      if (firstOpen === -1 && done < w.items.length) firstOpen = wi;
      return { w: w, done: done, html: itemsHtml };
    });

    var pct = totalItems ? Math.round((doneItems / totalItems) * 100) : 0;

    var customCtxRows = (cs.customContexts || []).length === 0
      ? '<p class="fine-print">Belum ada skenario kustom. Skenario yang kamu simpan di bawah langsung muncul sebagai tombol contoh cepat di bagian A.</p>'
      : '<div class="chip-row">' + (cs.customContexts || []).map(function (c) {
        return '<span class="diff-chip">' + esc(c.label) + ' <button type="button" class="btn" style="min-height:28px;padding:2px 8px;margin-left:6px;" data-action="del-context" data-id="' + esc(c.id) + '">Hapus</button></span>';
      }).join(" ") + "</div>";

    var progressSummary = roadDoneTasks === 0
      ? "Belum ada tugas yang dicentang"
      : roadDoneTasks + " dari " + roadTotalTasks + " tugas selesai (" + roadPct + "%)";

    return '' +
      '<div class="roadmap-hero-banner">' +
      '<div class="roadmap-header-row"><h2 class="roadmap-title-heading">' + esc(activeRoad.title) + '</h2><span class="roadmap-progress-text">' + esc(progressSummary) + "</span></div>" +
      '<p class="fine-print">' + esc(activeRoad.subtitle) + ". Centang tugas di setiap tikungan jalan setelah selesai, atau klik <strong>Latih di Studio</strong> untuk langsung membedah kalimat hari tersebut.</p>" +
      '<div class="control-group" style="margin-top:12px;">' +
      '<span class="control-label">Tampilan peta:</span>' +
      '<button type="button" class="btn' + (cs.roadTrack === "daily14" ? " btn-primary" : "") + '" data-action="road-track" data-track="daily14">Peta Harian (14 Hari)</button>' +
      '<button type="button" class="btn' + (cs.roadTrack === "weekly12" ? " btn-primary" : "") + '" data-action="road-track" data-track="weekly12">Peta 12 Minggu IELTS &amp; TOEFL</button>' +
      '<button type="button" class="btn" data-action="export-json">Unduh Cadangan (.json)</button>' +
      "</div></div>" +

      '<div class="roadmap-highway" id="coach-roadmap-highway">' +
      stopsHtml +
      '<div class="road-finish-wrap"><div class="road-finish-badge">' + esc(activeRoad.finishLabel) + "</div></div>" +
      "</div>" +

      '<div class="panel-card"><div class="panel-card-header"><h2 class="panel-card-title">Tambah Pos Peta Jalan atau Skenario Bicara Sendiri</h2></div>' +
      '<p class="fine-print">Tambahkan target hari berikutnya atau skenario percakapan khusus sesuai kebutuhan kerjamu.</p>' +
      '<form id="coach-custom-roadmap-form" novalidate style="margin-bottom:20px;">' +
      '<h3 class="sub-heading">1. Tambah Hari / Target Baru di Peta Jalan</h3>' +
      '<div class="form-grid">' +
      '<div><label for="rm-badge" class="control-label">Label Hari / Tahap *</label><input id="rm-badge" type="text" class="text-input" placeholder="Contoh: Hari 15 atau Target 2027"></div>' +
      '<div><label for="rm-title" class="control-label">Judul Target *</label><input id="rm-title" type="text" class="text-input" placeholder="Contoh: Presentasi ke Mitra Eropa"></div>' +
      '<div><label for="rm-focus" class="control-label">Fokus Latihan</label><input id="rm-focus" type="text" class="text-input" placeholder="Contoh: Negosiasi Kontrak"></div>' +
      "</div>" +
      '<div style="margin-top:10px;"><label for="rm-tasks" class="control-label">Daftar Tugas (pisahkan dengan titik koma ; atau baris baru) *</label>' +
      '<textarea id="rm-tasks" class="coach-textarea" rows="2" placeholder="Contoh: Rekam presentasi harga FOB; Latih 5 istilah pengiriman; Cek pelafalan mikrofon"></textarea></div>' +
      '<div style="margin-top:10px;"><label for="rm-practice" class="control-label">Kalimat Latihan Studio (saat tombol Latih di Studio diklik)</label>' +
      '<input id="rm-practice" type="text" class="text-input" placeholder="Contoh: We offer competitive FOB Surabaya pricing with strict moisture control."></div>' +
      '<div id="coach-roadmap-form-feedback" aria-live="polite"></div>' +
      '<button type="submit" class="btn btn-primary" style="margin-top:10px;">Tambahkan ke Peta Jalan</button>' +
      "</form>" +

      '<form id="coach-custom-context-form" novalidate style="border-top:1px solid var(--border-hairline);padding-top:16px;">' +
      '<h3 class="sub-heading">2. Tambah Tombol Contoh Cepat di Studio</h3>' +
      '<div class="form-grid">' +
      '<div><label for="ctx-label" class="control-label">Nama Tombol *</label><input id="ctx-label" type="text" class="text-input" placeholder="Contoh: Follow-up Mr. Malik"></div>' +
      '<div><label for="ctx-text" class="control-label">Teks Latihan *</label><input id="ctx-text" type="text" class="text-input" placeholder="Contoh: Hi Mr. Malik, we sedang mengurus the licensing and edited some photos..."></div>' +
      "</div>" +
      '<div id="coach-context-form-feedback" aria-live="polite"></div>' +
      '<button type="submit" class="btn btn-primary" style="margin-top:10px;">Simpan Tombol Contoh</button>' +
      '<div style="margin-top:10px;">' + customCtxRows + "</div>" +
      "</form></div>" +

      '<div class="panel-card"><div class="panel-card-header"><h2 class="panel-card-title">Rincian Rencana Belajar 12 Minggu</h2></div>' +
      '<p class="fine-print">Daftar lengkap target mingguan dari minggu ke-1 sampai minggu ke-12 (' + (doneItems === 0 ? "belum ada poin dicentang" : doneItems + " dari " + totalItems + " poin selesai") + ").</p></div>" +
      weeks.map(function (wk, idx) {
        var w = wk.w;
        return '<details class="plan-week"' + (idx === firstOpen ? " open" : "") + '><summary><span class="tag-mono">Minggu ' + w.week + "</span> <strong>" + esc(w.theme) + "</strong> <span class=\"fine-print\">(" + wk.done + "/" + w.items.length + ")</span></summary>" +
          '<div class="plan-body"><p><strong>IELTS:</strong> ' + esc(w.ielts) + "</p><p><strong>TOEFL:</strong> " + esc(w.toefl) + "</p>" +
          '<ul class="check-list">' + wk.html + "</ul>" +
          '<div class="state-banner"><strong>Gerbang minggu ' + w.week + ":</strong> " + esc(w.gate) + "</div></div></details>";
      }).join("");
  }

  /* ---------- D. Tracker ---------- */

  function examOptions() {
    return Object.keys(DATA.exams).map(function (k) {
      return '<option value="' + k + '"' + (cs.examKey === k ? " selected" : "") + ">" + esc(DATA.exams[k].label) + "</option>";
    }).join("");
  }

  function trackerHtml() {
    var exam = DATA.exams[cs.examKey];
    var entries = cs.scores.filter(function (e) { return e.exam === cs.examKey; });
    var verdict = CORE.evaluateReadiness(entries, exam);
    var rows = entries.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; }).map(function (e) {
      return "<tr><td>" + esc(e.date) + "</td><td>" + e.overall + "</td><td>" +
        ["speaking", "writing", "reading", "listening"].map(function (k) { return e[k] === null || e[k] === undefined ? "-" : e[k]; }).join(" / ") +
        '</td><td><button type="button" class="btn" data-action="delscore" data-id="' + e.id + '" aria-label="Hapus skor tanggal ' + esc(e.date) + '">Hapus</button></td></tr>';
    }).join("");

    return '' +
      '<div class="panel-card"><div class="panel-card-header"><h2 class="panel-card-title">Target dan Batas Jujur</h2></div>' +
      '<div class="state-banner"><strong>Soal garansi.</strong> Tidak ada aplikasi atau kursus yang bisa menjamin skor ujian, karena hasil resmi dinilai ETS atau IELTS pada hari ujian. Yang bisa dijamin adalah prosesnya: ukuran kemajuan yang jelas dan aturan kapan kamu layak mendaftar. Aplikasi ini menetapkan aturan itu di bawah.</div>' +
      '<p class="fine-print"><strong>Tentang TOEFL 600+.</strong> Skor 600 berasal dari skala PBT lama dan kira-kira setara 100 pada TOEFL iBT skala 0 sampai 120. Sejak 21 Januari 2026 ETS juga melaporkan skala baru 1 sampai 6 (band 5,5 setara 107 sampai 113 skala lama). Pastikan angka yang diminta kampus atau pemberi beasiswa, lalu pilih skala yang sama di bawah.</p>' +
      '<div class="table-wrap"><table class="data-table"><thead><tr><th scope="col">Ujian</th><th scope="col">Target overall</th><th scope="col">Batas skill</th><th scope="col">Catatan</th></tr></thead><tbody>' +
      Object.keys(DATA.exams).map(function (k) {
        var x = DATA.exams[k];
        return "<tr><td>" + esc(x.label) + "</td><td>" + x.target + "</td><td>" + x.skillMin + "</td><td>" + esc(x.note) + "</td></tr>";
      }).join("") + "</tbody></table></div></div>" +

      '<div class="panel-card"><div class="panel-card-header"><h2 class="panel-card-title">Catat Skor Mock</h2></div>' +
      '<form id="coach-score-form" novalidate>' +
      '<div class="form-grid">' +
      '<div><label for="sc-exam" class="control-label">Jenis ujian</label><select id="sc-exam" class="select-input" data-action="exam">' + examOptions() + "</select></div>" +
      '<div><label for="sc-date" class="control-label">Tanggal</label><input id="sc-date" type="date" class="text-input" value="' + today() + '"></div>' +
      '<div><label for="sc-overall" class="control-label">Overall *</label><input id="sc-overall" type="number" class="text-input" step="' + exam.step + '" min="' + exam.min + '" max="' + exam.max + '" inputmode="decimal"></div>' +
      '<div><label for="sc-speaking" class="control-label">Speaking</label><input id="sc-speaking" type="number" class="text-input" step="' + exam.step + '" min="' + exam.min + '" max="' + exam.max + '" inputmode="decimal"></div>' +
      '<div><label for="sc-writing" class="control-label">Writing</label><input id="sc-writing" type="number" class="text-input" step="' + exam.step + '" min="' + exam.min + '" max="' + exam.max + '" inputmode="decimal"></div>' +
      '<div><label for="sc-reading" class="control-label">Reading</label><input id="sc-reading" type="number" class="text-input" step="' + exam.step + '" min="' + exam.min + '" max="' + exam.max + '" inputmode="decimal"></div>' +
      '<div><label for="sc-listening" class="control-label">Listening</label><input id="sc-listening" type="number" class="text-input" step="' + exam.step + '" min="' + exam.min + '" max="' + exam.max + '" inputmode="decimal"></div>' +
      "</div>" +
      '<div id="coach-score-feedback" aria-live="polite"></div>' +
      '<button type="submit" class="btn btn-primary" style="margin-top:12px;">Simpan Skor</button></form></div>' +

      '<div class="panel-card"><div class="panel-card-header"><h2 class="panel-card-title">Status Kesiapan Ujian</h2>' + tag(exam.label) + "</div>" +
      '<div class="state-banner ' + (verdict.ready ? "is-success" : "") + '"><strong>' + (verdict.ready ? "Layak mendaftar ujian resmi." : "Belum layak mendaftar.") + "</strong> " + esc(verdict.reason) + "</div>" +
      '<p class="fine-print">Aturan: tiga mock terakhir pada jenis ujian ini harus mencapai target overall, dan tidak ada skill yang jauh di bawah batas. Mock harus dikerjakan dalam kondisi ujian dari materi resmi, bukan dari aplikasi ini.</p>' +
      (rows
        ? '<div class="table-wrap"><table class="data-table"><thead><tr><th scope="col">Tanggal</th><th scope="col">Overall</th><th scope="col">S / W / R / L</th><th scope="col">Aksi</th></tr></thead><tbody>' + rows + "</tbody></table></div>"
        : '<div class="state-banner"><strong>Belum ada skor untuk jenis ujian ini.</strong> Kerjakan satu mock dari materi resmi dan catat hasilnya di formulir di atas.</div>') +
      "</div>";
  }

  function saveScore(form) {
    var exam = DATA.exams[cs.examKey];
    var fb = document.getElementById("coach-score-feedback");
    function val(id) {
      var raw = document.getElementById(id).value.trim();
      return raw === "" ? null : Number(raw);
    }
    var overall = val("sc-overall");
    var date = document.getElementById("sc-date").value;
    var fields = { speaking: val("sc-speaking"), writing: val("sc-writing"), reading: val("sc-reading"), listening: val("sc-listening") };
    var errors = [];
    if (!date) errors.push("Tanggal wajib diisi.");
    if (overall === null || isNaN(overall)) errors.push("Overall wajib diisi dengan angka.");
    else if (overall < exam.min || overall > exam.max) errors.push("Overall harus antara " + exam.min + " dan " + exam.max + ".");
    Object.keys(fields).forEach(function (k) {
      var v = fields[k];
      if (v !== null && (isNaN(v) || v < exam.min || v > exam.max)) errors.push("Skor " + k + " harus antara " + exam.min + " dan " + exam.max + ".");
    });
    if (errors.length) {
      fb.innerHTML = '<div class="state-banner is-error" role="alert"><strong>Skor belum disimpan.</strong><ul>' + errors.map(function (e) { return "<li>" + esc(e) + "</li>"; }).join("") + "</ul></div>";
      return;
    }
    cs.scores.push({
      id: Date.now(), exam: cs.examKey, date: date, overall: overall,
      speaking: fields.speaking, writing: fields.writing, reading: fields.reading, listening: fields.listening
    });
    save();
    render();
  }

  /* ---------- E. Rubric ---------- */

  function rubricHtml() {
    return '' +
      '<div class="panel-card"><div class="panel-card-header"><h2 class="panel-card-title">Empat Kriteria Penilaian Speaking IELTS</h2></div>' +
      '<p class="fine-print">Deskripsi di bawah adalah ringkasan dengan kata sendiri dari pola penilaian publik. Rujukan resmi tetap deskriptor band IELTS di situs penyelenggara. TOEFL Speaking menilai komponen serupa (delivery, language use, topic development), dengan format tugas yang bisa berubah, jadi cek ets.org sebelum berlatih format tertentu.</p>' +
      '<div class="table-wrap"><table class="data-table"><thead><tr><th scope="col">Kriteria</th><th scope="col">Band 6</th><th scope="col">Band 7</th><th scope="col">Band 8</th></tr></thead><tbody>' +
      DATA.rubric.map(function (r) {
        return "<tr><th scope=\"row\">" + esc(r.name) + "</th><td>" + esc(r.band6) + "</td><td>" + esc(r.band7) + "</td><td>" + esc(r.band8) + "</td></tr>";
      }).join("") + "</tbody></table></div></div>" +
      DATA.rubric.map(function (r) {
        return '<div class="panel-card"><div class="panel-card-header"><h2 class="panel-card-title">' + esc(r.name) + "</h2>" + tag("Diukur aplikasi: " + r.measuredByApp) + "</div>" +
          "<p><strong>Cara naik:</strong> " + esc(r.howToRise) + "</p>" +
          "<p><strong>Latihan di aplikasi:</strong> " + esc(r.appDrill) + "</p></div>";
      }).join("") +
      '<div class="panel-card"><div class="panel-card-header"><h2 class="panel-card-title">Catatan Penting Saat Latihan Mandiri</h2></div>' +
      '<div class="state-banner"><strong>Yang diperiksa di sini:</strong> ' + DATA.errorRules.length + ' pola kesalahan khas penutur Indonesia, jembatan kata lokal, polesan kalimat setara Band 7.5+ (C1), panduan cara baca lidah Indonesia, serta pemeriksa tata bahasa tambahan dari <a href="https://languagetool.org" target="_blank" rel="noopener noreferrer">LanguageTool</a>.</div>' +
      '<div class="state-banner"><strong>Yang tetap membutuhkan lawan bicara atau penguji manusia:</strong> menilai kelancaran spontan (jeda berpikir dan intonasi alami) dari rekaman penuh serta kedalaman argumen esai Writing Task 2.</div></div>';
  }

  /* ---------- Event handling ---------- */

  root.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-action]");
    if (!btn) return;
    var action = btn.getAttribute("data-action");

    if (action === "sub") {
      cs.sub = btn.getAttribute("data-sub");
      save();
      render();
      if (window.JagoSwitchTab) {
        window.JagoSwitchTab("coach", cs.sub === "analyze" ? "studio" : "progress", cs.sub === "analyze" ? null : cs.sub);
      }
    } else if (action === "analyze") {
      runAnalysis();
    } else if (action === "clear") {
      document.getElementById("coach-input").value = "";
      cs.draft = "";
      lastAnalysis = null;
      save();
      render();
    } else if (action === "sample") {
      var s = allSamples().filter(function (x) { return x.id === btn.getAttribute("data-sample"); })[0];
      if (s) {
        document.getElementById("coach-input").value = s.text;
        cs.draft = s.text;
        save();
        runAnalysis();
      }
    } else if (action === "road-track") {
      cs.roadTrack = btn.getAttribute("data-track") || "daily14";
      save();
      render();
    } else if (action === "practice-stop") {
      var stopId = btn.getAttribute("data-id");
      var stopObj = getActiveRoadStops().stops.filter(function (st) { return st.id === stopId; })[0];
      if (stopObj && stopObj.practiceText) {
        cs.draft = stopObj.practiceText;
        cs.sub = "analyze";
        save();
        render();
        if (window.JagoSwitchTab) window.JagoSwitchTab("coach", "studio");
        runAnalysis();
      }
    } else if (action === "del-stop") {
      var delId = btn.getAttribute("data-id");
      cs.customStops = (cs.customStops || []).filter(function (st) { return st.id !== delId; });
      save();
      render();
    } else if (action === "toggle-save-tpl") {
      var bar = document.getElementById("coach-save-tpl-bar");
      var inp = document.getElementById("coach-quick-tpl-label");
      if (bar) {
        var openNow = bar.style.display === "none";
        bar.style.display = openNow ? "flex" : "none";
        if (openNow && inp) inp.focus();
      }
    } else if (action === "cancel-quick-tpl") {
      var barC = document.getElementById("coach-save-tpl-bar");
      if (barC) barC.style.display = "none";
    } else if (action === "save-quick-tpl") {
      var lInp = document.getElementById("coach-quick-tpl-label");
      var taVal = (document.getElementById("coach-input") || {}).value || "";
      var tplFb = document.getElementById("coach-tpl-feedback");
      var lbl = lInp ? lInp.value.trim() : "";
      if (!lbl || !taVal.trim()) {
        if (tplFb) tplFb.innerHTML = '<div class="state-banner is-error">Isi kalimat latihan dan nama template sebelum menyimpan.</div>';
        return;
      }
      cs.customContexts = cs.customContexts || [];
      cs.customContexts.push({ id: "ctx-" + Date.now(), label: lbl, text: taVal.trim(), isCustom: true });
      cs.draft = taVal.trim();
      save();
      render();
      var postFb = document.getElementById("coach-tpl-feedback");
      if (postFb) postFb.innerHTML = '<div class="state-banner is-success">Template "' + esc(lbl) + '" tersimpan.</div>';
    } else if (action === "del-context") {
      var ctxId = btn.getAttribute("data-id");
      cs.customContexts = (cs.customContexts || []).filter(function (cx) { return cx.id !== ctxId; });
      save();
      render();
    } else if (action === "export-json") {
      exportBackupJson();
    } else if (action === "dictate") {
      startDictation();
    } else if (action === "say") {
      speak(btn.getAttribute("data-text"), Number(btn.getAttribute("data-rate")) || 0.95, btn.getAttribute("data-loop") === "1");
    } else if (action === "stop") {
      stopSpeech();
    } else if (action === "word") {
      clearActiveWord();
      btn.classList.add("is-active");
      speak(btn.getAttribute("data-word"), 0.85, false, function () { btn.classList.remove("is-active"); });
    } else if (action === "readaloud") {
      readAloudCheck(Number(btn.getAttribute("data-idx")), btn);
    } else if (action === "copy") {
      var fb = document.getElementById("coach-copy-feedback");
      if (navigator.clipboard && lastAnalysis) {
        navigator.clipboard.writeText(lastAnalysis.corrected).then(function () {
          fb.innerHTML = '<div class="state-banner is-success">Teks terkoreksi disalin.</div>';
        }, function () {
          fb.innerHTML = '<div class="state-banner is-error" role="alert">Gagal menyalin. Blok teks secara manual lalu salin.</div>';
        });
      } else {
        fb.innerHTML = '<div class="state-banner is-error" role="alert">Salin otomatis tidak tersedia. Blok teks secara manual lalu salin.</div>';
      }
    } else if (action === "copy-c1") {
      var fbC1 = document.getElementById("coach-copy-c1-feedback");
      if (navigator.clipboard && lastAnalysis) {
        navigator.clipboard.writeText(lastAnalysis.c1Upgrade || lastAnalysis.corrected).then(function () {
          fbC1.innerHTML = '<div class="state-banner is-success">Versi poles Band 7.5+ (C1) disalin.</div>';
        }, function () {
          fbC1.innerHTML = '<div class="state-banner is-error" role="alert">Gagal menyalin. Blok teks secara manual lalu salin.</div>';
        });
      } else if (fbC1) {
        fbC1.innerHTML = '<div class="state-banner is-error" role="alert">Salin otomatis tidak tersedia. Blok teks secara manual lalu salin.</div>';
      }
    } else if (action === "append-next") {
      var ta = document.getElementById("coach-input");
      var addText = btn.getAttribute("data-text") || "";
      if (ta && addText) {
        ta.value = (ta.value.trim() ? ta.value.trim() + " " : "") + addText;
        cs.draft = ta.value;
        save();
        runAnalysis();
      }
    } else if (action === "drill") {
      answerDrill(btn.getAttribute("data-pick"));
    } else if (action === "nextdrill") {
      currentDrill = null;
      ensureDrill();
    } else if (action === "delscore") {
      var id = Number(btn.getAttribute("data-id"));
      cs.scores = cs.scores.filter(function (x) { return x.id !== id; });
      save();
      render();
    } else if (action === "test-voice") {
      speak("Hello, welcome to Jago English. This is how I speak.", 1.0, false);
    } else if (action === "delcustom") {
      var cid = btn.getAttribute("data-id");
      cs.customRules = (cs.customRules || []).filter(function (x) { return x.id !== cid; });
      syncCustomRules();
      save();
      render();
    }
  });

  root.addEventListener("change", function (e) {
    var t = e.target;
    var action = t.getAttribute("data-action");
    if (action === "lang") {
      cs.speechLang = t.value;
      save();
    } else if (action === "voice-select") {
      localStorage.setItem("jago_selected_voice", t.value);
      window.JAGO_SELECTED_VOICE = t.value;
    } else if (action === "toggle-lt") {
      cs.freeCloudCheck = Boolean(t.checked);
      save();
    } else if (action === "exam") {
      cs.examKey = t.value;
      save();
      render();
    } else if (action === "road-task") {
      cs.roadDone = cs.roadDone || {};
      cs.roadDone[t.getAttribute("data-key")] = t.checked;
      if (t.checked && window.playSuccessChime) window.playSuccessChime();
      save();
      render();
    } else if (action === "plan") {
      cs.planDone = cs.planDone || {};
      cs.planDone[t.getAttribute("data-key")] = t.checked;
      if (t.checked && window.playSuccessChime) window.playSuccessChime();
      save();
      var open = [];
      root.querySelectorAll("details.plan-week").forEach(function (d, i) { if (d.open) open.push(i); });
      render();
      root.querySelectorAll("details.plan-week").forEach(function (d, i) { d.open = open.indexOf(i) !== -1; });
    }
  });

  root.addEventListener("input", function (e) {
    if (e.target.id === "coach-input") {
      cs.draft = e.target.value;
      save();
    }
  });

  root.addEventListener("submit", function (e) {
    if (e.target.id === "coach-score-form") {
      e.preventDefault();
      saveScore(e.target);
    } else if (e.target.id === "coach-custom-rule-form") {
      e.preventDefault();
      saveCustomRule();
    } else if (e.target.id === "coach-custom-roadmap-form") {
      e.preventDefault();
      saveCustomStop();
    } else if (e.target.id === "coach-custom-context-form") {
      e.preventDefault();
      saveCustomContext();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") stopSpeech();
  });

  window.JagoCoachSetSub = function (sub) {
    cs.sub = sub || "analyze";
    save();
    render();
  };

  window.JagoCoachGetSub = function () {
    return cs.sub;
  };

  window.JagoCoachAnalyzeText = function (text) {
    cs.draft = String(text || "");
    cs.sub = "analyze";
    save();
    render();
    if (window.JagoSwitchTab) window.JagoSwitchTab("coach", "studio");
    else {
      var coachBtn = document.getElementById("tab-btn-coach");
      if (coachBtn) coachBtn.click();
    }
    runAnalysis();
  };

  render();

  if (window.location.hash === "#coach" || window.location.hash === "#roadmap") {
    var coachBtn = document.getElementById("tab-btn-coach");
    if (coachBtn) coachBtn.click();
    if (window.location.hash === "#roadmap") {
      cs.sub = "plan";
      save();
      render();
    }
  }

  // Live update polling only when running on local dev server (http://localhost:8088)
  var hostName = (window.location && window.location.hostname) || "";
  var isLocalDev = hostName === "localhost" || hostName === "127.0.0.1";
  if (isLocalDev && window.location.protocol.indexOf("http") === 0 && window.fetch) {
    var knownVersion = null;
    setInterval(function () {
      window.fetch("/__version", { cache: "no-store" })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) {
          if (!d || !d.version) return;
          if (knownVersion === null) {
            knownVersion = d.version;
          } else if (knownVersion !== d.version) {
            knownVersion = d.version;
            window.location.reload();
          }
        })
        .catch(function () { /* ignore when static or offline */ });
    }, 2500);
  }
})();
