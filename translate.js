/*
 * Jago English - Penerjemah Pikiran (Indonesian Thought to Native English)
 * Translates Indonesian intents and idioms into CEFR-graded ladders (A2 to C2),
 * breaks down formal vs casual registers, and highlights nuanced vocabulary choices.
 */
(function () {
  "use strict";

  var DATA = window.JAGO_TRANSLATE_DATA;
  var root = null;
  var activeIntent = null;
  var recognition = null;
  var isDictating = false;

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function speakText(text) {
    if (!("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      var v = window.jagoPickVoice ? window.jagoPickVoice() : null;
      if (v) u.voice = v;
      u.lang = v ? v.lang : "en-US";
      u.rate = 1.0;
      window.speechSynthesis.speak(u);
    } catch (e) {
      // Audio might fail if permissions blocked
    }
  }

  function copyText(text, btn) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        var prev = btn.textContent;
        btn.textContent = "Tersalin!";
        setTimeout(function () { btn.textContent = prev; }, 1500);
      });
    }
  }

  var ID_STOPWORDS = {
    anda: 1, kami: 1, kita: 1, saya: 1, aku: 1, akan: 1, yang: 1, untuk: 1,
    dengan: 1, dari: 1, pada: 1, ini: 1, itu: 1, hari: 1, agar: 1, bisa: 1,
    juga: 1, sudah: 1, belum: 1, atau: 1, dalam: 1, karena: 1, jadi: 1, oleh: 1
  };

  function scoreIntent(it, q, qTokens) {
    var score = 0;
    var trigs = it.triggers || [];
    for (var j = 0; j < trigs.length; j++) {
      var trig = String(trigs[j] || "").toLowerCase();
      if (!trig) continue;
      if (q.indexOf(trig) !== -1) {
        score += trig.length >= 7 ? 6 : 4;
      }
    }
    var words = String(it.indo || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/);
    var seen = {};
    var hits = 0;
    var totalContent = 0;
    for (var w = 0; w < words.length; w++) {
      var tok = words[w];
      if (tok.length <= 3 || ID_STOPWORDS[tok] || seen[tok]) continue;
      seen[tok] = true;
      totalContent++;
      if (qTokens.indexOf(tok) !== -1) hits++;
    }
    var ratio = totalContent > 0 ? hits / totalContent : 0;
    if (hits >= 5 && ratio >= 0.45) score += 6;
    else if (hits >= 3 && ratio >= 0.35) score += 4;
    else if (hits >= 2) score += 2;
    else if (hits === 1) score += 1;
    return score;
  }

  function findMatchingIntent(query) {
    if (!DATA || !DATA.intents) return null;
    var q = String(query || "").trim().toLowerCase();
    if (!q) return null;
    var qTokens = q.replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);

    var scored = DATA.intents.map(function (it) {
      return { intent: it, score: scoreIntent(it, q, qTokens) };
    });
    scored.sort(function (a, b) { return b.score - a.score; });

    var best = scored[0];
    var related = scored
      .filter(function (x) { return x.score >= 1; })
      .slice(0, 3)
      .map(function (x) { return x.intent; });

    return {
      matched: best && best.score >= 4 ? best.intent : null,
      score: best ? best.score : 0,
      related: related
    };
  }

  function findNuancedWords(query) {
    if (!DATA || !DATA.words) return [];
    var q = query.toLowerCase();
    var matches = [];
    for (var i = 0; i < DATA.words.length; i++) {
      var w = DATA.words[i];
      if (q.indexOf(w.id) !== -1) {
        matches.push(w);
      }
    }
    return matches;
  }

  var PHRASE_BRIDGES = [
    { re: /\bjakarta\b/i, id: "Jakarta", en: "in Jakarta", note: "Gunakan preposisi 'in' untuk nama kota." },
    { re: /\bhari ini\b/i, id: "hari ini", en: "today", note: "Taruh keterangan waktu di akhir kalimat agar lebih alami." },
    { re: /\bbesok\b/i, id: "besok", en: "tomorrow", note: "Padankan dengan will/would untuk rencana sopan." },
    { re: /\bminggu depan\b/i, id: "minggu depan", en: "next week", note: "Untuk bisnis bisa pakai 'early next week'." },
    { re: /\bhujan/i, id: "hujan deras", en: "heavy rain", note: "Hindari 'big rain', gunakan 'heavy rain'." },
    { re: /\bmacet\b/i, id: "macet", en: "heavy traffic", note: "Bahasa alami di Inggris adalah 'heavy traffic' atau 'traffic congestion'." },
    { re: /\btelat|terlambat\b/i, id: "agak telat", en: "slightly delayed", note: "'Slightly delayed' terdengar lebih profesional daripada 'late'." },
    { re: /\bbandara\b/i, id: "di bandara", en: "at the airport", note: "Sebut 'arrivals hall' bila menunggu tamu turun pesawat." },
    { re: /\bjemput|penjemputan\b/i, id: "penjemputan", en: "airport pickup", note: "Resmi: 'airport transfer'; santai: 'pick you up'." },
    { re: /\bmaaf|mohon maaf\b/i, id: "mohon maaf", en: "apologies for...", note: "Gabungkan dengan alasan singkat, bukan meminta maaf berulang." },
    { re: /\bterima kasih|makasih\b/i, id: "terima kasih", en: "thank you for bearing with us", note: "Gunakan 'Thank you for + verb-ing/noun'." },
    { re: /\bdokumen|berkas\b/i, id: "dokumen", en: "supporting documents", note: "Gunakan bentuk jamak 'documents' atau 'paperwork' (tanpa -s)." },
    { re: /\bkabar\b/i, id: "kabar", en: "update / how things are going", note: "Berita/update bisnis memakai 'an update', kabar kondisi memakai 'How have you been?'." },
    { re: /\bsiap|siapkan\b/i, id: "siap", en: "ready / all set", note: "Untuk kesiapan tim/dokumen bisa pakai 'all set' atau 'ready for review'." },
    { re: /\bmakan malam\b/i, id: "makan malam", en: "dinner", note: "Ajakan tamu bisnis: 'host you for dinner'." },
    { re: /\bidak\b|\bcdakb\b|\bizin\b/i, id: "IDAK / CDAKB / perizinan", en: "IDAK and CDAKB regulatory compliance", note: "Pertahankan istilah lokal/resmi lalu jelaskan fungsinya singkat." },
    { re: /\btolong|mohon\b/i, id: "tolong / mohon", en: "could you please / would you mind", note: "Lebih halus di telinga native daripada kata perintah langsung." },
    { re: /\bzoom|meeting|rapat\b/i, id: "rapat / Zoom", en: "Zoom coordination call", note: "Lengkapi dengan zona waktu (WIB / GMT+7)." }
  ];

  function extractClientBridges(query) {
    var hits = [];
    for (var i = 0; i < PHRASE_BRIDGES.length; i++) {
      if (PHRASE_BRIDGES[i].re.test(query)) {
        hits.push(PHRASE_BRIDGES[i]);
      }
    }
    return hits;
  }

  var activeTranslateReq = 0;
  var CUSTOM_TPL_KEY = "jago_translate_custom_tpl_v1";

  function loadCustomTemplates() {
    try {
      var raw = window.localStorage.getItem(CUSTOM_TPL_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  function saveCustomTemplates(list) {
    try {
      window.localStorage.setItem(CUSTOM_TPL_KEY, JSON.stringify(list || []));
    } catch (_) {}
  }

  function toPhonetics(enText) {
    if (window.JagoCoachCore && typeof window.JagoCoachCore.toIndonesianPhonetics === "function") {
      return window.JagoCoachCore.toIndonesianPhonetics(enText, window.COACH_DATA || {});
    }
    return "";
  }

  function renderTemplatePillsHtml() {
    var intentPills = DATA.intents.map(function (it) {
      return '<button type="button" class="btn btn-compact" data-intent-id="' + esc(it.id) + '">' +
        esc(it.category.split("&")[0].trim()) + ": " + esc(it.indo.slice(0, 28)) + "..." +
        '</button>';
    }).join("");

    var customPills = loadCustomTemplates().map(function (ct) {
      return '<span class="tpl-chip-group">' +
        '<button type="button" class="btn btn-compact" data-custom-tpl-id="' + esc(ct.id) + '">' + esc(ct.label) + '</button>' +
        '<button type="button" class="btn btn-compact tpl-del-btn" data-del-custom-tpl="' + esc(ct.id) + '" aria-label="Hapus template ' + esc(ct.label) + '">&times;</button>' +
        '</span>';
    }).join("");

    return intentPills + customPills;
  }

  function renderShell() {
    if (!root) return;
    if (!DATA || !DATA.intents) {
      root.innerHTML = '<div class="state-banner is-error">Data penerjemah pikiran belum siap.</div>';
      return;
    }

    root.innerHTML = '' +
      '<div class="panel-card">' +
      '<div class="panel-card-header">' +
      '<h3 class="panel-card-title">Template &amp; Pikiran dalam Bahasa Indonesia</h3>' +
      '<span class="tag-mono">Boleh Bicara Seenak Hati</span>' +
      '</div>' +
      '<p class="fine-print" style="margin-bottom:10px;">' +
      'Pilih salah satu template lalu ubah kalimatnya sesuai kondisi nyata (atau rekam suara Indonesia bebas). Sistem akan mengubahnya ke Inggris bertingkat sekaligus menampilkan <strong>arti balik ke Indonesia &amp; kesannya</strong>.' +
      '</p>' +
      '<div class="translate-intent-strip tpl-chip-bar" id="translate-template-strip">' +
      renderTemplatePillsHtml() +
      '</div>' +
      '<label for="translate-input" class="control-label" style="display:block;margin-bottom:6px;">Kalimat / maksudmu dalam bahasa Indonesia:</label>' +
      '<textarea id="translate-input" class="coach-textarea" rows="4" placeholder="Ketik atau rekam sesuka hati... Contoh: Mas Malik, nanti saya jemput di bandara agak telat karena Jakarta hujan deras dan tol macet."></textarea>' +
      '<div class="control-group" style="margin-top:12px;">' +
      '<button type="button" class="btn btn-primary" id="translate-run-btn">Ubah ke Inggris Bertingkat</button>' +
      '<button type="button" class="btn" id="translate-mic-btn" aria-pressed="false">Dikte Suara (Indonesia)</button>' +
      '<button type="button" class="btn" id="translate-toggle-save-tpl-btn">+ Simpan Jadi Template</button>' +
      '<button type="button" class="btn" id="translate-clear-btn">Kosongkan</button>' +
      '</div>' +
      '<div id="translate-save-tpl-bar" class="inline-save-bar" style="display:none;">' +
      '<input type="text" id="translate-quick-tpl-label" class="text-input" placeholder="Nama template (mis. Jemput Bandara Hujan)...">' +
      '<button type="button" class="btn btn-primary" id="translate-save-tpl-confirm">Simpan Template</button>' +
      '<button type="button" class="btn" id="translate-save-tpl-cancel">Batal</button>' +
      '</div>' +
      '<div id="translate-tpl-feedback" aria-live="polite"></div>' +
      '<div id="translate-mic-status" aria-live="polite"></div>' +
      '</div>' +
      '<div id="translate-results" aria-live="polite" style="margin-top:16px;"></div>';

    bindEvents();
    selectIntent(DATA.intents[0]);
  }

  function selectIntent(it) {
    activeIntent = it;
    var inp = document.getElementById("translate-input");
    if (inp) inp.value = it.indo;
    renderResults({ matched: it, score: 100, related: [] }, it.indo);
  }

  function renderLadderStep(level, enText, noteText, customTitle, backIdText, phoneticText) {
    var lvlClass = "level-" + level.toLowerCase();
    var ladderClass = "ladder-step ladder-" + level.toLowerCase();
    var labelTitle = customTitle || "";
    if (!labelTitle) {
      if (level === "A2") labelTitle = "Level A2 - Terjemahan Harfiah (Kaku)";
      else if (level === "B1") labelTitle = "Level B1 - Sopan &amp; Jelas (Sehari-hari)";
      else if (level === "B2") labelTitle = "Level B2 - Standar Kantor Internasional";
      else if (level === "C1") labelTitle = "Level C1 - Eksekutif &amp; Berbobot (IELTS Band 7.5 - 8.0)";
      else if (level === "C2") labelTitle = "Level C2 - Fasih Penuh (Mother Tongue Mastery)";
    }
    var phon = phoneticText || toPhonetics(enText);
    return '<div class="' + ladderClass + '">' +
      '<div class="ladder-step-header">' +
      '<div style="display:flex; align-items:center; gap:8px;">' +
      '<span class="ladder-badge ' + lvlClass + '">' + esc(level) + '</span>' +
      '<span style="font-size:0.86rem; font-weight:800; color:var(--text-secondary);">' + labelTitle + '</span>' +
      '</div>' +
      '<span class="tag-mono" style="font-size:0.75rem;">CEFR ' + esc(level) + '</span>' +
      '</div>' +
      '<div class="ladder-en">"' + esc(enText) + '"</div>' +
      (backIdText ? '<div class="ladder-back-id"><strong>Arti balik &amp; maksudnya:</strong> ' + esc(backIdText) + '</div>' : '') +
      '<div class="ladder-note">' + esc(noteText) + '</div>' +
      (phon ? '<div class="fine-print" style="margin-top:4px;"><strong>Cara baca lidah Indonesia:</strong> ' + esc(phon) + '</div>' : '') +
      '<div class="ladder-actions">' +
      '<button type="button" class="btn btn-primary" data-speak="' + esc(enText) + '">Dengar Suara</button>' +
      '<button type="button" class="btn" data-copy="' + esc(enText) + '">Salin Kalimat</button>' +
      '<button type="button" class="btn" data-practice-coach="' + esc(enText) + '">Latih Ucapkan</button>' +
      '</div>' +
      '</div>';
  }

  function renderRegisterPair(formalObj, casualObj) {
    var formalText = typeof formalObj === "string" ? formalObj : (formalObj && formalObj.en) || "";
    var formalBack = typeof formalObj === "object" && formalObj ? formalObj.backId : "";
    var casualText = typeof casualObj === "string" ? casualObj : (casualObj && casualObj.en) || "";
    var casualBack = typeof casualObj === "object" && casualObj ? casualObj.backId : "";

    return '<div class="register-grid">' +
      '<div class="register-box register-box-formal">' +
      '<div class="register-box-title"><span class="register-badge register-badge-formal">Saluran Resmi / Email / Klien Eksternal</span><button type="button" class="btn" style="font-size:0.75rem; padding:2px 8px;" data-copy="' + esc(formalText) + '">Salin</button></div>' +
      '<div class="register-box-text">"' + esc(formalText) + '"</div>' +
      (formalBack ? '<div class="fine-print" style="margin-top:6px;"><strong>Maksudnya:</strong> ' + esc(formalBack) + '</div>' : '') +
      '<div class="control-group" style="margin-top:12px;">' +
      '<button type="button" class="btn btn-primary btn-compact" data-speak="' + esc(formalText) + '">Dengar Resmi</button>' +
      '<button type="button" class="btn btn-compact" data-practice-coach="' + esc(formalText) + '">Latih Ucapkan</button>' +
      '</div>' +
      '</div>' +
      '<div class="register-box register-box-casual">' +
      '<div class="register-box-title"><span class="register-badge register-badge-casual">Saluran Santai / WhatsApp / Obrolan Tim</span><button type="button" class="btn" style="font-size:0.75rem; padding:2px 8px;" data-copy="' + esc(casualText) + '">Salin</button></div>' +
      '<div class="register-box-text">"' + esc(casualText) + '"</div>' +
      (casualBack ? '<div class="fine-print" style="margin-top:6px;"><strong>Maksudnya:</strong> ' + esc(casualBack) + '</div>' : '') +
      '<div class="control-group" style="margin-top:12px;">' +
      '<button type="button" class="btn btn-compact" data-speak="' + esc(casualText) + '">Dengar Santai</button>' +
      '<button type="button" class="btn btn-compact" data-practice-coach="' + esc(casualText) + '">Latih Ucapkan</button>' +
      '</div>' +
      '</div>' +
      '</div>';
  }

  function fetchOnlineTranslateAi(originalText, reqId) {
    var slot = document.getElementById("translate-ai-slot");
    if (!slot || !window.JagoAI) return;

    slot.innerHTML = '<div class="state-banner">Menyusun versi bahasa Inggris bertingkat dan arti baliknya...</div>';
    window.JagoAI.translateIndonesian(originalText)
      .then(function (tr) {
        if (reqId !== activeTranslateReq) return;
        var currentSlot = document.getElementById("translate-ai-slot");
        if (!currentSlot) return;
        if (!tr || !tr.ok) {
          currentSlot.innerHTML = "";
          return;
        }
        if (!Array.isArray(tr.levels) || !tr.levels.length) {
          currentSlot.innerHTML = '' +
            '<div class="panel-card" style="margin-top:16px;">' +
            '<div class="panel-card-header">' +
            '<h3 class="panel-card-title">Mode Hemat / Limit Harian Tercapai</h3>' +
            '<span class="tag-mono">' + esc(tr.source || "Lokal") + '</span>' +
            '</div>' +
            (tr.normalizedIndo ? '<p class="fine-print" style="margin-bottom:8px;"><strong>Kalimat dirapikan:</strong> "' + esc(tr.normalizedIndo) + '"</p>' : '') +
            '<div class="state-banner">' + esc(tr.summaryId || "Layanan terjemah sedang mencapai batas kuota harian gratis.") + '</div>' +
            (tr.tipId ? '<p class="fine-print" style="margin-top:8px;">' + esc(tr.tipId) + '</p>' : '') +
            '</div>';
          return;
        }
        var steps = tr.levels.map(function (lv) {
          var title = "Level " + lv.code + " - " + (lv.label || "Variasi Alami");
          var note = lv.nuanceId || "Susunan kalimat alami sesuai konteks pikiranmu.";
          return renderLadderStep(lv.code, lv.en, note, title, lv.backId, lv.phonetic);
        }).join("");

        currentSlot.innerHTML = '' +
          '<div class="panel-card" style="margin-top:16px;">' +
          '<div class="panel-card-header">' +
          '<h3 class="panel-card-title">Hasil Inggris Bertingkat &amp; Arti Baliknya</h3>' +
          '<span class="tag-mono">' + esc(tr.source || "Online") + '</span>' +
          '</div>' +
          (tr.normalizedIndo ? '<p class="fine-print" style="margin-bottom:10px;"><strong>Bahasa sehari-hari dipahami sebagai:</strong> "' + esc(tr.normalizedIndo) + '"</p>' : '') +
          (tr.summaryId ? '<div class="meaning-callout" style="margin-bottom:12px;"><span class="meaning-label">Maksud yang ditangkap sistem dari kalimatmu:</span><p class="meaning-text">' + esc(tr.summaryId) + '</p></div>' : '') +
          (tr.tipId ? '<div class="topic-hook-box"><strong>Tip Bahasa &amp; Kesan:</strong> ' + esc(tr.tipId) + '</div>' : '') +
          '<div class="ladder-container" style="margin-top:14px;">' + steps + '</div>' +
          ((tr.formal && tr.formal.en) || (tr.casual && tr.casual.en)
            ? '<h4 style="margin:20px 0 8px; font-size:1.02rem; font-weight:800;">Pilihan Register (Resmi vs Santai):</h4>' + renderRegisterPair(tr.formal || tr.levels[tr.levels.length - 1], tr.casual || tr.levels[0])
            : '') +
          '</div>';
      })
      .catch(function (err) {
        if (reqId !== activeTranslateReq) return;
        var currentSlot = document.getElementById("translate-ai-slot");
        if (currentSlot) {
          currentSlot.innerHTML = '<div class="state-banner">Mesin terjemahan online sedang tidak terjangkau (' + esc(err && err.message ? err.message : "offline") + '). Gunakan jembatan kata di atas atau isi API Key di Tab 4.</div>';
        }
      });
  }

  function renderResults(matchInfo, originalText) {
    var container = document.getElementById("translate-results");
    if (!container) return;

    var reqId = ++activeTranslateReq;
    var it = matchInfo && matchInfo.matched ? matchInfo.matched : null;
    var related = (matchInfo && matchInfo.related) || [];

    var nuanced = findNuancedWords(originalText);
    var nuanceHtml = "";
    if (nuanced.length > 0) {
      nuanceHtml = '' +
        '<div class="panel-card" style="margin-top:16px;">' +
        '<div class="panel-card-header">' +
        '<h3 class="panel-card-title">Pembedahan Kosakata &amp; Nuansa Makna</h3>' +
        '<span class="tag-mono">' + nuanced.length + " kata terdeteksi</span>" +
        '</div>' +
        '<p class="fine-print">Jangan terjemahkan kata-kata ini secara harfiah. Perhatikan pilihan kata penutur asli bahasa Inggris:</p>' +
        '<div class="nuance-strip">' +
        nuanced.map(function (nw) {
          return '<div class="nuance-card">' +
            '<div class="nuance-term">"' + esc(nw.id) + '"</div>' +
            nw.options.map(function (opt) {
              return '<div class="nuance-option">' +
                '<div><strong>' + esc(opt.en) + '</strong> <span class="tag-mono" style="margin-left:6px;">' + esc(opt.use) + '</span></div>' +
                '<div style="font-size:0.88rem; color:var(--text-secondary); margin-top:4px;">Contoh: <em>"' + esc(opt.example) + '"</em></div>' +
                '<button type="button" class="btn" style="margin-top:6px; font-size:0.8rem; padding:4px 10px;" data-speak="' + esc(opt.example) + '">Dengarkan</button>' +
                '</div>';
            }).join("") +
            '</div>';
        }).join("") +
        '</div>' +
        '</div>';
    }

    if (!it) {
      var bridges = extractClientBridges(originalText);
      var bridgesHtml = bridges.length > 0
        ? '<div class="topic-vocab-grid" style="margin-top:12px;">' +
          bridges.map(function (b) {
            return '<div class="topic-vocab-card">' +
              '<div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">' +
              '<div><span class="tag-mono" style="margin-right:6px;">' + esc(b.id) + '</span><strong>' + esc(b.en) + '</strong></div>' +
              '<button type="button" class="btn btn-compact" data-speak="' + esc(b.en) + '">Dengar</button>' +
              '</div>' +
              '<div style="font-size:0.84rem; color:var(--text-secondary); margin-top:6px;">' + esc(b.note) + '</div>' +
              '</div>';
          }).join("") + '</div>'
        : '<div class="state-banner" style="margin-top:12px;">Kalimatmu bersifat bebas/kustom. Pecah kalimatmu ke pola inti <strong>Subjek + Kata Kerja + Objek + Waktu</strong>, lalu tulis draf Inggrismu di tab Coach untuk dikoreksi otomatis.</div>';

      var relatedHtml = related.length > 0
        ? '<div style="margin-top:16px;"><div class="fine-print" style="margin-bottom:8px;"><strong>Pola terdekat yang bisa jadi inspirasi:</strong></div><div class="control-group">' +
          related.map(function (r) {
            return '<button type="button" class="btn" data-intent-id="' + esc(r.id) + '">' + esc(r.category) + '</button>';
          }).join("") +
          '</div></div>'
        : "";

      container.innerHTML = '' +
        '<div class="panel-card">' +
        '<div class="panel-card-header">' +
        '<h3 class="panel-card-title">Analisis Kalimat Pikiran Kamu (Kustom)</h3>' +
        '<span class="tag-mono">Bedah Kata &amp; Frasa</span>' +
        '</div>' +
        '<p class="fine-print"><strong>Teks kamu:</strong> "' + esc(originalText) + '"</p>' +
        bridgesHtml +
        relatedHtml +
        '</div>' +
        '<div id="translate-ai-slot"></div>' +
        nuanceHtml;

      fetchOnlineTranslateAi(originalText, reqId);
      return;
    }

    var ladderHtml = it.ladder.map(function (step) {
      return renderLadderStep(step.level, step.en, step.note, "");
    }).join("");

    container.innerHTML = '' +
      '<div class="panel-card">' +
      '<div class="panel-card-header">' +
      '<h3 class="panel-card-title">' + esc(it.category) + '</h3>' +
      '<span class="tag-mono">Analisis Pikiran</span>' +
      '</div>' +
      '<div class="topic-hook-box">' +
      '<strong>Tip Komunikasi:</strong> ' + esc(it.tip) +
      '</div>' +
      '<h4 style="margin:20px 0 8px; font-size:1.05rem; font-weight:800; color:var(--text-primary);">Tangga Keluwesan Bahasa (A2 sampai C2):</h4>' +
      '<div class="ladder-container">' + ladderHtml + '</div>' +
      '<h4 style="margin:24px 0 8px; font-size:1.05rem; font-weight:800; color:var(--text-primary);">Pilihan Register (Formal vs Santai):</h4>' +
      renderRegisterPair(it.register.formal, it.register.casual) +
      '</div>' +
      nuanceHtml;
  }

  function bindEvents() {
    root.addEventListener("click", function (e) {
      var t = e.target;
      var intentBtn = t.closest ? t.closest("[data-intent-id]") : null;
      var customTplBtn = t.closest ? t.closest("[data-custom-tpl-id]") : null;
      var delTplBtn = t.closest ? t.closest("[data-del-custom-tpl]") : null;
      var practiceBtn = t.closest ? t.closest("[data-practice-coach]") : null;

      if (delTplBtn) {
        var delId = delTplBtn.getAttribute("data-del-custom-tpl");
        var remaining = loadCustomTemplates().filter(function (c) { return c.id !== delId; });
        saveCustomTemplates(remaining);
        var strip = document.getElementById("translate-template-strip");
        if (strip) strip.innerHTML = renderTemplatePillsHtml();
      } else if (customTplBtn) {
        var cid = customTplBtn.getAttribute("data-custom-tpl-id");
        var found = loadCustomTemplates().filter(function (c) { return c.id === cid; })[0];
        if (found) {
          var inpT = document.getElementById("translate-input");
          if (inpT) inpT.value = found.indo;
          var mFound = findMatchingIntent(found.indo);
          if (mFound) renderResults(mFound, found.indo);
        }
      } else if (practiceBtn) {
        var enLine = practiceBtn.getAttribute("data-practice-coach");
        if (enLine && window.JagoCoachAnalyzeText) {
          window.JagoCoachAnalyzeText(enLine);
        }
      } else if (intentBtn) {
        var id = intentBtn.getAttribute("data-intent-id");
        var match = DATA.intents.filter(function (x) { return x.id === id; })[0];
        if (match) selectIntent(match);
      } else if (t.matches("[data-speak]")) {
        speakText(t.getAttribute("data-speak"));
      } else if (t.matches("[data-copy]")) {
        copyText(t.getAttribute("data-copy"), t);
      } else if (t.id === "translate-run-btn") {
        var val = (document.getElementById("translate-input") || {}).value || "";
        if (!val.trim()) {
          var resBox = document.getElementById("translate-results");
          if (resBox) resBox.innerHTML = '<div class="state-banner is-error">Tulis atau rekam dulu kalimat bahasa Indonesiamu.</div>';
          return;
        }
        var match2 = findMatchingIntent(val);
        if (match2) renderResults(match2, val);
      } else if (t.id === "translate-toggle-save-tpl-btn") {
        var sBar = document.getElementById("translate-save-tpl-bar");
        var lInp = document.getElementById("translate-quick-tpl-label");
        if (sBar) {
          var showNow = sBar.style.display === "none";
          sBar.style.display = showNow ? "flex" : "none";
          if (showNow && lInp) lInp.focus();
        }
      } else if (t.id === "translate-save-tpl-cancel") {
        var cBar = document.getElementById("translate-save-tpl-bar");
        if (cBar) cBar.style.display = "none";
      } else if (t.id === "translate-save-tpl-confirm") {
        var nameInp = document.getElementById("translate-quick-tpl-label");
        var textInp = document.getElementById("translate-input");
        var fb = document.getElementById("translate-tpl-feedback");
        var lbl = nameInp ? nameInp.value.trim() : "";
        var txt = textInp ? textInp.value.trim() : "";
        if (!lbl || !txt) {
          if (fb) fb.innerHTML = '<div class="state-banner is-error">Isi kalimat Indonesia dan nama template dulu.</div>';
          return;
        }
        var curList = loadCustomTemplates();
        curList.push({ id: "ct-" + Date.now(), label: lbl, indo: txt });
        saveCustomTemplates(curList);
        var stripEl = document.getElementById("translate-template-strip");
        if (stripEl) stripEl.innerHTML = renderTemplatePillsHtml();
        var sBar2 = document.getElementById("translate-save-tpl-bar");
        if (sBar2) sBar2.style.display = "none";
        if (nameInp) nameInp.value = "";
        if (fb) fb.innerHTML = '<div class="state-banner is-success">Template "' + esc(lbl) + '" tersimpan. Klik kapan saja lalu ubah sesuai kebutuhan.</div>';
      } else if (t.id === "translate-clear-btn") {
        var inp = document.getElementById("translate-input");
        if (inp) { inp.value = ""; inp.focus(); }
      } else if (t.id === "translate-mic-btn") {
        toggleDictation();
      }
    });
  }

  function toggleDictation() {
    var btn = document.getElementById("translate-mic-btn");
    var statusEl = document.getElementById("translate-mic-status");
    var inp = document.getElementById("translate-input");

    if (window.JagoSpeech) {
      window.JagoSpeech.toggleRecording({
        button: btn,
        statusEl: statusEl,
        lang: "id-ID",
        promptHint: "",
        idleLabel: "Dikte Suara (Indonesia)",
        activeLabel: "Selesai & Proses Suara",
        continuous: false,
        onInterim: function (chunk) {
          if (inp && chunk) {
            inp.value = (inp.value ? inp.value.trim() + " " : "") + chunk.trim();
          }
        },
        onResult: function (transcript) {
          if (inp) {
            inp.value = transcript;
            var match = findMatchingIntent(transcript);
            if (match) renderResults(match, transcript);
          }
        }
      });
      return;
    }

    if (statusEl) {
      statusEl.innerHTML = '<div class="state-banner is-error">Modul dikte suara belum dimuat. Muat ulang halaman.</div>';
    }
  }

  function init() {
    root = document.getElementById("translate-root");
    if (!root) return;
    renderShell();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
