/*
 * Jago English - 50 IELTS Speaking & TOEFL iBT Practice Studio
 * Comprehensive master syllabus covering 50 specialized international topics:
 * Islamic finance, investment, geopolitics, AI, export-import, business law,
 * historical civilization, warfare, academic philosophy, and mental fortitude.
 */
(function () {
  "use strict";

  var root = null;
  var allTopics = [];
  var currentTopic = null;
  var currentSpeed = 1.0;
  var isPlaying = false;
  var categoryFilter = "ALL";
  var cefrFilter = "ALL";
  var searchQuery = "";

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getTopics() {
    return (window.JAGO_TOPICS && Array.isArray(window.JAGO_TOPICS)) ? window.JAGO_TOPICS : [];
  }

  function speakText(text, rate, onDone) {
    if (!("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      var v = window.jagoPickVoice ? window.jagoPickVoice() : null;
      if (v) u.voice = v;
      u.lang = v ? v.lang : "en-US";
      u.rate = rate || 1.0;
      u.onend = function () {
        isPlaying = false;
        updateAudioButtonState();
        if (onDone) onDone();
      };
      u.onerror = function () {
        isPlaying = false;
        updateAudioButtonState();
        if (onDone) onDone();
      };
      isPlaying = true;
      updateAudioButtonState();
      window.speechSynthesis.speak(u);
    } catch (e) {
      isPlaying = false;
      updateAudioButtonState();
    }
  }

  function stopSpeech() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    isPlaying = false;
    updateAudioButtonState();
  }

  function updateAudioButtonState() {
    var btn = document.getElementById("topic-audio-play-btn");
    if (!btn) return;
    if (isPlaying) {
      btn.textContent = "Hentikan Suara";
      btn.classList.add("btn-primary");
    } else {
      btn.textContent = "Dengar Jawaban Model (" + currentSpeed + "x)";
      btn.classList.remove("btn-primary");
    }
  }

  function getFilteredTopics() {
    var q = searchQuery.trim().toLowerCase();
    return allTopics.filter(function (t) {
      var matchesCat = categoryFilter === "ALL" || t.category === categoryFilter;
      var matchesCefr = cefrFilter === "ALL" || t.cefr === cefrFilter;
      if (!matchesCat || !matchesCefr) return false;
      if (!q) return true;
      var inTitle = (t.title || "").toLowerCase().indexOf(q) !== -1;
      var inTitleId = (t.titleId || "").toLowerCase().indexOf(q) !== -1;
      var inCat = (t.category || "").toLowerCase().indexOf(q) !== -1;
      var inHook = (t.hook || "").toLowerCase().indexOf(q) !== -1;
      var inVocab = (t.vocab || []).some(function (v) {
        return (v.term || "").toLowerCase().indexOf(q) !== -1 || (v.meaningId || "").toLowerCase().indexOf(q) !== -1;
      });
      return inTitle || inTitleId || inCat || inHook || inVocab;
    });
  }

  function getAllCategories() {
    var cats = {};
    allTopics.forEach(function (t) {
      if (t.category) cats[t.category] = (cats[t.category] || 0) + 1;
    });
    return Object.keys(cats).sort();
  }

  function renderShell() {
    if (!root) return;
    allTopics = getTopics();
    if (!allTopics.length) {
      root.innerHTML = '<div class="state-banner is-error">Data 50 Topik belum siap.</div>';
      return;
    }

    var catOptions = '<option value="ALL">Semua Kategori (50 Topik)</option>' +
      getAllCategories().map(function (c) {
        return '<option value="' + esc(c) + '">' + esc(c) + '</option>';
      }).join("");

    root.innerHTML = '' +
      '<div class="panel-card">' +
      '<div class="panel-card-header">' +
      '<h3 class="panel-card-title">Eksplorasi 50 Topik Internasional</h3>' +
      '<span class="tag-mono">IELTS Speaking &amp; TOEFL iBT</span>' +
      '</div>' +
      '<p class="fine-print" style="margin-bottom:14px;">' +
      'Kumpulan materi komprehensif berstandar internasional: Islam &amp; Syariah, Finansial, Investasi, Geopolitik, AI, Ekspor-Impor, Regulasi, Hadis, Sejarah, Perang, dan Ketahanan Mental.' +
      '</p>' +
      '<div class="tense-controls-bar" role="region" aria-label="Filter Topik">' +
      '<div class="control-group" style="flex:1; min-width:240px;">' +
      '<label for="topic-search-input" class="control-label">Cari Topik:</label>' +
      '<input type="search" id="topic-search-input" class="search-input" placeholder="Ketik kata kunci (contoh: drone, waqf, semiconductor, stoicism)...">' +
      '</div>' +
      '<div class="control-group">' +
      '<label for="topic-category-filter" class="control-label">Kategori:</label>' +
      '<select id="topic-category-filter" class="select-input">' + catOptions + '</select>' +
      '</div>' +
      '<div class="control-group">' +
      '<label for="topic-cefr-filter" class="control-label">Level:</label>' +
      '<select id="topic-cefr-filter" class="select-input">' +
      '<option value="ALL">Semua Level</option>' +
      '<option value="B2">B2 · Menengah Atas</option>' +
      '<option value="C1">C1 · Mahir (Band 7.5+)</option>' +
      '<option value="C2">C2 · Fasih (Mother Tongue)</option>' +
      '</select>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '<div class="topics-stage-layout">' +
      '<aside class="topics-sidebar" id="topics-sidebar-list" aria-label="Daftar 50 Topik"></aside>' +
      '<section class="topic-detail-area" id="topic-main-stage" aria-live="polite"></section>' +
      '</div>';

    bindGlobalEvents();

    if (!currentTopic && allTopics.length > 0) {
      currentTopic = allTopics[0];
    }
    renderSidebar();
    renderMainStage();
  }

  function renderSidebar() {
    var sidebar = document.getElementById("topics-sidebar-list");
    if (!sidebar) return;
    var filtered = getFilteredTopics();

    if (filtered.length === 0) {
      sidebar.innerHTML = '<div class="state-banner">Tidak ada topik yang sesuai dengan filter pencarian.</div>';
      return;
    }

    var html = filtered.map(function (t) {
      var isActive = currentTopic && currentTopic.id === t.id;
      return '<button type="button" class="topic-list-item' + (isActive ? " is-active" : "") + '" data-topic-id="' + esc(t.id) + '">' +
        '<div class="topic-list-meta">' +
        '<span>Topik #' + t.no + '</span>' +
        '<span class="tag-mono">' + esc(t.cefr) + '</span>' +
        '</div>' +
        '<div class="topic-list-title">' + esc(t.title) + '</div>' +
        '<div class="topic-list-sub">' + esc(t.titleId) + '</div>' +
        '</button>';
    }).join("");

    sidebar.innerHTML = html;
  }

  function renderMainStage() {
    var stage = document.getElementById("topic-main-stage");
    if (!stage) return;
    if (!currentTopic) {
      stage.innerHTML = '<div class="state-banner">Pilih salah satu topik di sebelah kiri untuk mulai belajar.</div>';
      return;
    }

    var t = currentTopic;
    var wordCount = (t.modelAnswer || "").split(/\s+/).filter(Boolean).length;

    var vocabCards = (t.vocab || []).map(function (v) {
      return '<div class="topic-vocab-card">' +
        '<div style="display:flex; justify-content:space-between; align-items:center;">' +
        '<strong style="font-size:1rem; color:var(--text-primary);">' + esc(v.term) + '</strong>' +
        '<button type="button" class="btn" style="font-size:0.75rem; padding:2px 8px;" data-speak="' + esc(v.term) + '">Ucapkan</button>' +
        '</div>' +
        '<div style="font-size:0.84rem; color:var(--accent-primary); font-weight:700; margin:3px 0;">' + esc(v.meaningId) + '</div>' +
        '<div style="font-size:0.82rem; color:var(--text-secondary); line-height:1.45;">Contoh: <em>"' + esc(v.example) + '"</em></div>' +
        '</div>';
    }).join("");

    var collocPills = (t.collocations || []).map(function (c) {
      return '<div class="topic-colloc-pill">' +
        '<strong>' + esc(c.phrase) + '</strong>' +
        '<span>' + esc(c.meaningId) + '</span>' +
        '</div>';
    }).join("");

    var part1List = (t.ieltsPart1 || []).map(function (q) {
      return '<li style="margin-bottom:6px;">' + esc(q) + '</li>';
    }).join("");

    var part2Points = (t.ieltsPart2 && t.ieltsPart2.points ? t.ieltsPart2.points : []).map(function (p) {
      return '<li>' + esc(p) + '</li>';
    }).join("");

    var part3List = (t.ieltsPart3 || []).map(function (q) {
      return '<li style="margin-bottom:6px;">' + esc(q) + '</li>';
    }).join("");

    var structureList = (t.structure || []).map(function (s, i) {
      return '<li style="margin-bottom:6px;"><strong>Bagian ' + (i + 1) + ':</strong> ' + esc(s) + '</li>';
    }).join("");

    stage.innerHTML = '' +
      '<div class="topic-banner-card">' +
      '<div class="topic-banner-header">' +
      '<div>' +
      '<span class="tag-mono" style="margin-right:8px;">Topik #' + t.no + '</span>' +
      '<span class="tag-mono">' + esc(t.category) + '</span>' +
      '<span class="tag-mono" style="margin-left:8px; font-weight:800;">Level ' + esc(t.cefr) + '</span>' +
      '</div>' +
      '<button type="button" class="btn" data-action="practice-starter">Mulai Latihan Bicara</button>' +
      '</div>' +
      '<h2 class="topic-banner-title">' + esc(t.title) + '</h2>' +
      '<div class="topic-banner-sub">' + esc(t.titleId) + '</div>' +
      '<div class="topic-hook-box">' +
      '<strong>Pertanyaan Pemantik Diskusi:</strong> ' + esc(t.hook) +
      '</div>' +
      '</div>' +

      '<div class="model-answer-box">' +
      '<div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">' +
      '<h3 style="font-size:1.15rem; font-weight:900; color:var(--text-primary); margin:0;">Jawaban Model Standar Band 8.5 - 9.0</h3>' +
      '<span class="tag-mono">' + wordCount + ' Kata (Panjang Ideal)</span>' +
      '</div>' +
      '<div class="control-group" style="margin:14px 0 8px; flex-wrap:wrap;">' +
      '<button type="button" class="btn" id="topic-audio-play-btn">Dengar Jawaban Model (' + currentSpeed + 'x)</button>' +
      '<button type="button" class="btn" data-speed="0.8">0.8x</button>' +
      '<button type="button" class="btn is-active" data-speed="1.0">1.0x</button>' +
      '<button type="button" class="btn" data-speed="1.2">1.2x</button>' +
      '<button type="button" class="btn" id="topic-audio-stop-btn">Hentikan</button>' +
      '</div>' +
      '<div class="model-answer-text">"' + esc(t.modelAnswer) + '"</div>' +
      '<div style="padding:10px 14px; background-color:var(--bg-subtle); border-radius:var(--radius-md); font-size:0.9rem; color:var(--text-secondary); line-height:1.5;">' +
      '<strong>Intisari Bahasa Indonesia:</strong> ' + esc(t.modelAnswerId) +
      '</div>' +
      '</div>' +

      '<div class="panel-card">' +
      '<h3 class="panel-card-title">8 Kosakata Kunci Standar Akademik &amp; Eksekutif</h3>' +
      '<p class="fine-print">Kuasai kosakata ini agar kalimatmu tidak terdengar seperti terjemahan kasar:</p>' +
      '<div class="topic-vocab-grid">' + vocabCards + '</div>' +
      '</div>' +

      '<div class="panel-card">' +
      '<h3 class="panel-card-title">6 Kolokasi Tingkat Tinggi (High-Band Collocations)</h3>' +
      '<p class="fine-print">Rangkaian kata baku yang dipakai penutur asli untuk menyatakan gagasan kompleks secara padat:</p>' +
      '<div class="topic-colloc-grid">' + collocPills + '</div>' +
      '</div>' +

      '<div class="panel-card">' +
      '<div class="panel-card-header">' +
      '<h3 class="panel-card-title">Simulasi Lengkap Ujian IELTS Speaking</h3>' +
      '<span class="tag-mono">Format Resmi Band 7.5 - 9.0</span>' +
      '</div>' +
      '<div class="ielts-part-box">' +
      '<strong>Part 1 - Wawancara Pembuka (Pertanyaan Singkat):</strong>' +
      '<ul style="margin:8px 0 0 20px; font-size:0.92rem; line-height:1.5;">' + part1List + '</ul>' +
      '</div>' +
      '<div class="ielts-cue-card">' +
      '<div class="ielts-cue-header">' +
      '<span>Candidate Task Card</span>' +
      '<span class="tag-mono">1 Menit Persiapan | 2 Menit Bicara</span>' +
      '</div>' +
      '<div class="ielts-cue-prompt">"' + esc(t.ieltsPart2.cue) + '"</div>' +
      '<div style="font-size:0.86rem; font-weight:700; color:var(--text-secondary); margin:6px 0 4px;">Poin yang Wajib Dijelaskan:</div>' +
      '<ul style="margin:4px 0 0 20px; font-size:0.9rem; line-height:1.5;">' + part2Points + '</ul>' +
      '</div>' +
      '<div class="ielts-part-box">' +
      '<strong>Part 3 - Diskusi Mendalam Dua Arah:</strong>' +
      '<ul style="margin:8px 0 0 20px; font-size:0.92rem; line-height:1.5;">' + part3List + '</ul>' +
      '</div>' +
      '<div class="ielts-part-box" style="margin-top:12px;">' +
      '<strong>Struktur Alur Argumentasi (4 Langkah):</strong>' +
      '<ol style="margin:8px 0 0 20px; font-size:0.9rem; line-height:1.5;">' + structureList + '</ol>' +
      '</div>' +
      '</div>' +

      '<div class="panel-card">' +
      '<div class="panel-card-header">' +
      '<h3 class="panel-card-title">Simulasi Diskusi Akademik TOEFL iBT</h3>' +
      '<span class="tag-mono">Writing &amp; Speaking for an Academic Discussion</span>' +
      '</div>' +
      '<div class="toefl-prof-box">' +
      '<div style="font-size:0.8rem; font-weight:800; text-transform:uppercase; letter-spacing:0.04em; color:var(--accent-primary); margin-bottom:4px;">Pertanyaan Profesor:</div>' +
      '<div style="font-weight:700; color:var(--text-primary); line-height:1.45;">"' + esc(t.toeflDiscussion.professor) + '"</div>' +
      '</div>' +
      '<div class="register-grid" style="margin-top:12px;">' +
      '<div class="register-box toefl-student-a">' +
      '<div class="register-box-title"><span class="tag-mono">Mahasiswa A (Perspektif Utama)</span></div>' +
      '<div class="register-box-text">"' + esc(t.toeflDiscussion.studentA) + '"</div>' +
      '<button type="button" class="btn" style="margin-top:10px; font-size:0.8rem; padding:4px 10px;" data-speak="' + esc(t.toeflDiscussion.studentA) + '">Dengar Suara A</button>' +
      '</div>' +
      '<div class="register-box toefl-student-b">' +
      '<div class="register-box-title"><span class="tag-mono">Mahasiswa B (Perspektif Alternatif)</span></div>' +
      '<div class="register-box-text">"' + esc(t.toeflDiscussion.studentB) + '"</div>' +
      '<button type="button" class="btn" style="margin-top:10px; font-size:0.8rem; padding:4px 10px;" data-speak="' + esc(t.toeflDiscussion.studentB) + '">Dengar Suara B</button>' +
      '</div>' +
      '</div>' +
      '</div>' +

      '<div class="trap-card">' +
      '<div class="panel-card-header" style="margin-bottom:10px;">' +
      '<h3 style="font-size:1.05rem; font-weight:900; color:var(--text-primary); margin:0;">Pembedahan Jebakan Lidah Indonesia</h3>' +
      '<span class="tag-mono">Anti-Latah Gramatikal</span>' +
      '</div>' +
      '<div class="trap-grid">' +
      '<div class="trap-wrong">' +
      '<div style="font-size:0.8rem; font-weight:800; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:4px;">Terjemahan Harfiah (Salah Kaprah):</div>' +
      '<strong>"' + esc(t.indoTrap.wrong) + '"</strong>' +
      '</div>' +
      '<div class="trap-right">' +
      '<div style="font-size:0.8rem; font-weight:800; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:4px;">Standar Penutur Asli (Benar):</div>' +
      '<strong>"' + esc(t.indoTrap.right) + '"</strong>' +
      '<div style="margin-top:8px;"><button type="button" class="btn btn-primary" style="font-size:0.78rem; padding:3px 10px;" data-speak="' + esc(t.indoTrap.right) + '">Dengar Pelafalan</button></div>' +
      '</div>' +
      '</div>' +
      '<div style="font-size:0.86rem; color:var(--text-secondary); line-height:1.5; margin-top:10px; padding:8px 12px; background-color:var(--bg-subtle); border-radius:var(--radius-sm);">' +
      '<strong>Kaidah &amp; Logika Bahasa:</strong> ' + esc(t.indoTrap.why) +
      '</div>' +
      '</div>';
  }

  function bindGlobalEvents() {
    root.addEventListener("click", function (e) {
      var t = e.target;
      var itemBtn = t.closest("[data-topic-id]");
      if (itemBtn) {
        var id = itemBtn.getAttribute("data-topic-id");
        var match = allTopics.filter(function (x) { return x.id === id; })[0];
        if (match) {
          currentTopic = match;
          stopSpeech();
          renderSidebar();
          renderMainStage();
          if (window.innerWidth <= 960) {
            var stageEl = document.getElementById("topic-main-stage") || root.querySelector(".topic-detail-area");
            if (stageEl && typeof stageEl.scrollIntoView === "function") {
              try { stageEl.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (_) {}
            }
          } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }
        return;
      }

      if (t.matches("[data-speak]")) {
        speakText(t.getAttribute("data-speak"), 1.0);
      } else if (t.id === "topic-audio-play-btn") {
        if (isPlaying) {
          stopSpeech();
        } else if (currentTopic) {
          speakText(currentTopic.modelAnswer, currentSpeed);
        }
      } else if (t.id === "topic-audio-stop-btn") {
        stopSpeech();
      } else if (t.matches("[data-speed]")) {
        currentSpeed = parseFloat(t.getAttribute("data-speed")) || 1.0;
        root.querySelectorAll("[data-speed]").forEach(function (b) { b.classList.remove("is-active"); });
        t.classList.add("is-active");
        if (isPlaying && currentTopic) {
          speakText(currentTopic.modelAnswer, currentSpeed);
        } else {
          updateAudioButtonState();
        }
      } else if (t.matches('[data-action="practice-starter"]')) {
        if (currentTopic && currentTopic.practiceStarter) {
          // Switch to coach tab and set practice text
          var coachTabBtn = document.getElementById("tab-btn-coach");
          var coachInput = document.getElementById("coach-input");
          if (coachInput) coachInput.value = currentTopic.practiceStarter;
          if (coachTabBtn) coachTabBtn.click();
        }
      }
    });

    var searchInp = document.getElementById("topic-search-input");
    if (searchInp) {
      searchInp.addEventListener("input", function () {
        searchQuery = searchInp.value;
        renderSidebar();
      });
    }

    var catSelect = document.getElementById("topic-category-filter");
    if (catSelect) {
      catSelect.addEventListener("change", function () {
        categoryFilter = catSelect.value;
        renderSidebar();
      });
    }

    var cefrSelect = document.getElementById("topic-cefr-filter");
    if (cefrSelect) {
      cefrSelect.addEventListener("change", function () {
        cefrFilter = cefrSelect.value;
        renderSidebar();
      });
    }
  }

  function init() {
    root = document.getElementById("topics-root");
    if (!root) return;
    renderShell();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
