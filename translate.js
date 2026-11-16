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

  function renderShell() {
    if (!root) return;
    if (!DATA || !DATA.intents) {
      root.innerHTML = '<div class="state-banner is-error">Data penerjemah pikiran belum siap.</div>';
      return;
    }

    var intentPills = DATA.intents.map(function (it) {
      return '<button type="button" class="btn" data-intent-id="' + esc(it.id) + '">' +
        esc(it.category.split("&")[0].trim()) + ": " + esc(it.indo.slice(0, 32)) + "..." +
        '</button>';
    }).join("");

    root.innerHTML = '' +
      '<div class="panel-card">' +
      '<div class="panel-card-header">' +
      '<h3 class="panel-card-title">Ungkapkan Maksudmu dalam Bahasa Indonesia</h3>' +
      '<span class="tag-mono">Penerjemah Pikiran ke Native English</span>' +
      '</div>' +
      '<p class="fine-print" style="margin-bottom:12px;">' +
      'Ketik apa yang ingin kamu sampaikan. Sistem akan membongkar susunan kata-per-kata yang kaku, membedah 5 tingkatan keluwesan CEFR (A2 sampai C2), dan membandingkan gaya formal vs santai.' +
      '</p>' +
      '<div class="translate-intent-strip">' +
      intentPills +
      '</div>' +
      '<label for="translate-input" class="control-label" style="display:block;margin-bottom:6px;">Pikiran dalam bahasa Indonesia:</label>' +
      '<textarea id="translate-input" class="coach-textarea" rows="4" placeholder="Contoh: Aku mau follow up rekan bisnis, kasih tahu progres perizinan dan foto produk, lalu sekadar mengingatkan soal video demo..."></textarea>' +
      '<div class="control-group" style="margin-top:12px;">' +
      '<button type="button" class="btn btn-primary" id="translate-run-btn">Terjemahkan ke Native</button>' +
      '<button type="button" class="btn" id="translate-mic-btn" aria-pressed="false">Dikte Suara (Indonesia)</button>' +
      '<button type="button" class="btn" id="translate-clear-btn">Kosongkan</button>' +
      '</div>' +
      '<div id="translate-mic-status" aria-live="polite"></div>' +
      '</div>' +
      '<div id="translate-results" aria-live="polite" style="margin-top:16px;"></div>';

    bindEvents();
    // Pre-select first intent
    selectIntent(DATA.intents[0]);
  }

  function selectIntent(it) {
    activeIntent = it;
    var inp = document.getElementById("translate-input");
    if (inp) inp.value = it.indo;
    renderResults({ matched: it, score: 100, related: [] }, it.indo);
  }

  function renderLadderStep(level, enText, noteText, customTitle) {
    var lvlClass = "level-" + level.toLowerCase();
    var ladderClass = "ladder-step ladder-" + level.toLowerCase();
    var labelTitle = customTitle || "";
    if (!labelTitle) {
      if (level === "A2") labelTitle = "Level A2 - Terjemahan Harfiah (Kaku)";
      else if (level === "B1") labelTitle = "Level B1 - Sopan &amp; Jelas (Dasar Kerja)";
      else if (level === "B2") labelTitle = "Level B2 - Standar Kantor Internasional";
      else if (level === "C1") labelTitle = "Level C1 - Eksekutif &amp; Berbobot (IELTS Band 7.5 - 8.0)";
      else if (level === "C2") labelTitle = "Level C2 - Fasih Penuh (Mother Tongue Mastery)";
    }
    return '<div class="' + ladderClass + '">' +
      '<div class="ladder-step-header">' +
      '<div style="display:flex; align-items:center; gap:8px;">' +
      '<span class="ladder-badge ' + lvlClass + '">' + esc(level) + '</span>' +
      '<span style="font-size:0.86rem; font-weight:800; color:var(--text-secondary);">' + labelTitle + '</span>' +
      '</div>' +
      '<span class="tag-mono" style="font-size:0.75rem;">CEFR ' + esc(level) + '</span>' +
      '</div>' +
      '<div class="ladder-en">"' + esc(enText) + '"</div>' +
      '<div class="ladder-note">' + esc(noteText) + '</div>' +
      '<div class="ladder-actions">' +
      '<button type="button" class="btn btn-primary" data-speak="' + esc(enText) + '">Dengar Suara</button>' +
      '<button type="button" class="btn" data-copy="' + esc(enText) + '">Salin Kalimat</button>' +
      '</div>' +
      '</div>';
  }

  function renderRegisterPair(formalText, casualText) {
    return '<div class="register-grid">' +
      '<div class="register-box register-box-formal">' +
      '<div class="register-box-title"><span class="register-badge register-badge-formal">Saluran Resmi / Memo Direksi / Klien Eksternal</span><button type="button" class="btn" style="font-size:0.75rem; padding:2px 8px;" data-copy="' + esc(formalText) + '">Salin</button></div>' +
      '<div class="register-box-text">"' + esc(formalText) + '"</div>' +
      '<button type="button" class="btn btn-primary" style="margin-top:12px; font-size:0.82rem; padding:5px 12px;" data-speak="' + esc(formalText) + '">Dengar Suara Formal</button>' +
      '</div>' +
      '<div class="register-box register-box-casual">' +
      '<div class="register-box-title"><span class="register-badge register-badge-casual">Saluran Santai / WhatsApp / Obrolan Tim</span><button type="button" class="btn" style="font-size:0.75rem; padding:2px 8px;" data-copy="' + esc(casualText) + '">Salin</button></div>' +
      '<div class="register-box-text">"' + esc(casualText) + '"</div>' +
      '<button type="button" class="btn" style="margin-top:12px; font-size:0.82rem; padding:5px 12px;" data-speak="' + esc(casualText) + '">Dengar Suara Santai</button>' +
      '</div>' +
      '</div>';
  }

  function fetchLocalTranslateAi(originalText, reqId) {
    var slot = document.getElementById("translate-ai-slot");
    if (!slot || typeof window.fetch !== "function") return;
    var loc = window.location || {};
    var host = loc.hostname || "";
    var isLocal = host === "localhost" || host === "127.0.0.1" || loc.port === "8088";
    if (!isLocal) return;

    slot.innerHTML = '<div class="state-banner">Menyusun variasi kalimat alami dengan mesin AI lokal...</div>';
    window.fetch("/api/translate-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ indo: originalText })
    })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (json) {
        if (reqId !== activeTranslateReq) return;
        var currentSlot = document.getElementById("translate-ai-slot");
        if (!currentSlot) return;
        if (!json || !json.ok || !json.translation) {
          currentSlot.innerHTML = "";
          return;
        }
        var tr = json.translation;
        var steps = [];
        if (tr.b1) steps.push(renderLadderStep("B1", tr.b1, "Versi dasar yang jelas, sopan, dan mudah langsung diucapkan.", "Level B1 - Sopan &amp; Jelas"));
        if (tr.b2) steps.push(renderLadderStep("B2", tr.b2, "Versi luwes setara komunikasi kerja internasional.", "Level B2 - Standar Profesional"));
        if (tr.c1) steps.push(renderLadderStep("C1", tr.c1, "Versi ringkas berwibawa untuk rapat atau email eksekutif.", "Level C1 - Eksekutif Band 7.5+"));
        currentSlot.innerHTML = '' +
          '<div class="panel-card" style="margin-top:16px;">' +
          '<div class="panel-card-header">' +
          '<h3 class="panel-card-title">Susunan Kalimat Otomatis AI Lokal (' + esc(json.model || "Ollama") + ')</h3>' +
          '<span class="tag-mono">Sesuai Konteks Pikiranmu</span>' +
          '</div>' +
          (tr.tipId ? '<div class="topic-hook-box"><strong>Tip Terjemahan:</strong> ' + esc(tr.tipId) + '</div>' : '') +
          '<div class="ladder-container" style="margin-top:14px;">' + steps.join("") + '</div>' +
          ((tr.formal || tr.casual) ? '<h4 style="margin:20px 0 8px; font-size:1.02rem; font-weight:800;">Pilihan Register (Formal vs Santai):</h4>' + renderRegisterPair(tr.formal || tr.c1 || tr.b2, tr.casual || tr.b1) : '') +
          '</div>';
      })
      .catch(function () {
        if (reqId !== activeTranslateReq) return;
        var currentSlot = document.getElementById("translate-ai-slot");
        if (currentSlot) currentSlot.innerHTML = "";
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

      fetchLocalTranslateAi(originalText, reqId);
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
      if (intentBtn) {
        var id = intentBtn.getAttribute("data-intent-id");
        var match = DATA.intents.filter(function (x) { return x.id === id; })[0];
        if (match) selectIntent(match);
      } else if (t.matches("[data-speak]")) {
        speakText(t.getAttribute("data-speak"));
      } else if (t.matches("[data-copy]")) {
        copyText(t.getAttribute("data-copy"), t);
      } else if (t.id === "translate-run-btn") {
        var val = (document.getElementById("translate-input") || {}).value || "";
        var match2 = findMatchingIntent(val);
        if (match2) renderResults(match2, val);
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
