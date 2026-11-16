/*
 * Jago English - Mesin Pengenalan Suara Hibrida (Whisper Lokal + Web Speech Fallback)
 * Memberikan indikator meter suara langsung (AudioContext Analyser) agar pengguna
 * langsung melihat apakah mikrofon menangkap suara, serta mengirim rekaman ke endpoint
 * lokal /api/transcribe (whisper-cli Metal GPU) dengan fallback ke SpeechRecognition.
 */
(function () {
  "use strict";

  var activeSession = null;
  var cachedHealth = null;

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatTimer(ms) {
    var totalSec = Math.max(0, Math.floor(ms / 1000));
    var m = Math.floor(totalSec / 60);
    var s = totalSec % 60;
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }

  function mapSpeechLang(rawLang) {
    var l = String(rawLang || "auto").toLowerCase();
    if (l.indexOf("id") === 0) return "id";
    if (l.indexOf("en") === 0) return "en";
    return "auto";
  }

  function checkLocalServer(forceRefresh) {
    if (!forceRefresh && cachedHealth && cachedHealth.available) {
      return Promise.resolve(cachedHealth);
    }
    if (window.location.protocol.indexOf("http") !== 0 || !window.fetch) {
      return Promise.resolve({ available: false });
    }
    var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, 1500) : null;
    return window.fetch("/api/speech-health", {
      cache: "no-store",
      signal: controller ? controller.signal : undefined
    })
      .then(function (r) {
        if (timer) clearTimeout(timer);
        return r.ok ? r.json() : { available: false };
      })
      .then(function (data) {
        cachedHealth = data || { available: false };
        return cachedHealth;
      })
      .catch(function () {
        if (timer) clearTimeout(timer);
        return { available: false };
      });
  }

  function pickRecorderMime() {
    if (typeof MediaRecorder === "undefined") return "";
    var candidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4;codecs=mp4a.40.2",
      "audio/mp4",
      "audio/ogg;codecs=opus",
      "audio/ogg"
    ];
    for (var i = 0; i < candidates.length; i++) {
      if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(candidates[i])) {
        return candidates[i];
      }
    }
    return "";
  }

  function setButtonState(btn, idleText, activeText, active) {
    if (!btn) return;
    btn.textContent = active ? activeText : idleText;
    btn.setAttribute("aria-pressed", active ? "true" : "false");
    if (active) btn.classList.add("is-recording");
    else btn.classList.remove("is-recording");
  }

  function renderStatus(el, html) {
    if (el) el.innerHTML = html;
  }

  function micErrorMessage(err) {
    var name = err && err.name ? String(err.name) : "";
    if (name === "NotAllowedError" || name === "PermissionDeniedError" || name === "SecurityError") {
      return "Izin mikrofon diblokir oleh browser atau macOS. Klik ikon izin situs di bilah alamat browser (lalu pilih Izinkan Mikrofon), dan pastikan di System Settings -> Privacy & Security -> Microphone browser Anda dicentang.";
    }
    if (name === "NotFoundError" || name === "DevicesNotFoundError") {
      return "Mikrofon tidak terdeteksi di perangkat ini. Sambungkan mikrofon atau periksa Input Suara di macOS System Settings.";
    }
    if (name === "NotReadableError" || name === "TrackStartError") {
      return "Mikrofon sedang dipakai aplikasi lain atau tidak merespons. Tutup aplikasi perekam lain lalu coba lagi.";
    }
    return "Gagal membuka mikrofon (" + esc(name || (err && err.message) || "error") + ").";
  }

  function isLocalHostOrigin() {
    var host = (window.location && window.location.hostname) || "";
    return host === "localhost" || host === "127.0.0.1";
  }

  function webSpeechErrorMessage(code) {
    var localOrigin = isLocalHostOrigin();
    if (code === "not-allowed" || code === "service-not-allowed") {
      if (localOrigin) {
        return "Izin mikrofon atau layanan dikte browser ditolak. Aktifkan izin mikrofon di browser dan gunakan server lokal http://localhost:8088/ untuk memakai Whisper offline.";
      }
      return "Izin mikrofon browser ditolak. Aktifkan izin mikrofon di pengaturan browser HP atau desktop (ketuk ikon gembok di address bar), lalu coba lagi.";
    }
    if (code === "network") {
      if (localOrigin) {
        return "Layanan dikte cloud browser gagal terhubung (network). Pastikan Anda membuka aplikasi lewat server lokal http://localhost:8088/ agar dikte memakai mesin Whisper lokal tanpa internet.";
      }
      return "Layanan dikte online browser gagal terhubung. Periksa koneksi internet Anda, atau ketuk ikon mikrofon di keyboard HP untuk langsung mendikte ke kolom teks.";
    }
    if (code === "no-speech") {
      return "Suara tidak terdengar oleh browser. Pastikan mikrofon benar, dekatkan suara, lalu coba lagi.";
    }
    if (code === "audio-capture") {
      return "Perangkat audio input tidak ditemukan atau tidak aktif.";
    }
    return "Pengenalan suara berhenti (" + esc(code || "unknown") + "). Silakan coba lagi atau ketik manual.";
  }

  function cleanupSession(session) {
    if (!session) return;
    session.cleaned = true;
    if (session.meterTimer) {
      clearInterval(session.meterTimer);
      session.meterTimer = null;
    }
    if (session.recognition) {
      try { session.recognition.abort(); } catch (e) {}
      session.recognition = null;
    }
    if (session.audioCtx && session.audioCtx.state !== "closed") {
      try { session.audioCtx.close(); } catch (e) {}
      session.audioCtx = null;
    }
    if (session.stream) {
      try {
        session.stream.getTracks().forEach(function (t) { t.stop(); });
      } catch (e) {}
      session.stream = null;
    }
    setButtonState(session.button, session.idleLabel, session.activeLabel, false);
    if (activeSession === session) {
      activeSession = null;
    }
  }

  function stopActive(cancelOnly) {
    if (!activeSession) return;
    var s = activeSession;
    if (cancelOnly) {
      s.cancelled = true;
      if (s.recorder && s.recorder.state === "recording") {
        try { s.recorder.stop(); } catch (e) {}
      }
      renderStatus(s.statusEl, '<div class="state-banner">Rekaman dibatalkan.</div>');
      cleanupSession(s);
      return;
    }
    if (s.recorder && s.recorder.state === "recording") {
      try { s.recorder.stop(); } catch (e) { cleanupSession(s); }
      return;
    }
    if (s.recognition) {
      try { s.recognition.stop(); } catch (e) { cleanupSession(s); }
      return;
    }
    cleanupSession(s);
  }

  function mountAudioMeter(stream, session, statusEl, engineLabel, allowLiveHint) {
    var uid = "mic-" + Date.now();
    renderStatus(
      statusEl,
      '<div class="mic-live-banner" role="status">' +
      '<div class="mic-live-top">' +
      '<span class="mic-live-indicator"><span class="mic-pulse-dot" aria-hidden="true"></span><span>Mendengarkan (' + esc(engineLabel) + ')</span></span>' +
      '<span class="mic-live-timer" id="' + uid + '-timer">00:00</span>' +
      '</div>' +
      '<div class="mic-meter-row">' +
      '<span class="mic-meter-label">Level Suara:</span>' +
      '<div class="mic-meter-track"><div class="mic-meter-fill" id="' + uid + '-fill"></div></div>' +
      '</div>' +
      '<div class="mic-interim-text" id="' + uid + '-interim">Silakan berbicara sekarang, lalu klik Selesai jika sudah cukup.</div>' +
      '<div class="mic-action-row">' +
      '<button type="button" class="btn btn-primary btn-compact" id="' + uid + '-done">Selesai &amp; Proses Suara</button>' +
      '<button type="button" class="btn btn-compact" id="' + uid + '-cancel">Batal</button>' +
      '</div>' +
      '</div>'
    );

    var doneBtn = document.getElementById(uid + "-done");
    var cancelBtn = document.getElementById(uid + "-cancel");
    if (doneBtn) doneBtn.addEventListener("click", function () { stopActive(false); });
    if (cancelBtn) cancelBtn.addEventListener("click", function () { stopActive(true); });

    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return uid;
      var ctx = new AC();
      if (ctx.state === "suspended") ctx.resume();
      var src = ctx.createMediaStreamSource(stream);
      var analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      session.audioCtx = ctx;

      var buf = new Uint8Array(analyser.frequencyBinCount);
      var startedAt = Date.now();
      session.peakRms = 0;

      session.meterTimer = setInterval(function () {
        if (session.cleaned) return;
        analyser.getByteTimeDomainData(buf);
        var sumSq = 0;
        for (var i = 0; i < buf.length; i++) {
          var v = (buf[i] - 128) / 128;
          sumSq += v * v;
        }
        var rms = Math.sqrt(sumSq / buf.length);
        if (rms > session.peakRms) session.peakRms = rms;

        var fillEl = document.getElementById(uid + "-fill");
        var timerEl = document.getElementById(uid + "-timer");
        var interimEl = document.getElementById(uid + "-interim");
        var scale = Math.min(1, Math.max(0.05, rms * 5.2));
        if (fillEl) fillEl.style.transform = "scaleX(" + scale.toFixed(2) + ")";
        var elapsed = Date.now() - startedAt;
        if (timerEl) timerEl.textContent = formatTimer(elapsed);
        if (allowLiveHint && interimEl && !session.hasInterimText && elapsed > 3200 && session.peakRms < 0.012) {
          interimEl.textContent = "Meter suara masih datar: pastikan mikrofon tidak di-mute dan input mic macOS sudah aktif.";
        }
      }, 75);
    } catch (e) {
      // Visual meter is non-fatal if AudioContext is restricted
    }

    return uid;
  }

  function startWhisperSession(opts, health) {
    var session = {
      id: "sess-" + Date.now(),
      button: opts.button,
      statusEl: opts.statusEl,
      idleLabel: opts.idleLabel || "Mulai Dikte",
      activeLabel: opts.activeLabel || "Selesai Rekam",
      startedAt: Date.now(),
      peakRms: 0,
      cancelled: false,
      cleaned: false
    };
    activeSession = session;
    setButtonState(session.button, session.idleLabel, session.activeLabel, true);
    renderStatus(session.statusEl, '<div class="state-banner">Membuka akses mikrofon...</div>');

    navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
    }).then(function (stream) {
      if (session.cancelled) {
        stream.getTracks().forEach(function (t) { t.stop(); });
        return;
      }
      session.stream = stream;
      var mime = pickRecorderMime();
      var chunks = [];
      var recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      session.recorder = recorder;

      var uid = mountAudioMeter(stream, session, opts.statusEl, "Whisper Lokal", true);
      session.startedAt = Date.now();

      recorder.ondataavailable = function (ev) {
        if (ev.data && ev.data.size > 0) chunks.push(ev.data);
      };

      recorder.onstop = function () {
        var elapsed = Date.now() - session.startedAt;
        var cancelled = session.cancelled;
        var peak = session.peakRms;
        cleanupSession(session);
        if (cancelled) return;

        if (elapsed < 350 || !chunks.length) {
          renderStatus(opts.statusEl, '<div class="state-banner is-error">Rekaman terlalu singkat. Bicara minimal 1 detik lalu tekan Selesai.</div>');
          if (opts.onError) opts.onError("too-short");
          return;
        }

        var blob = new Blob(chunks, { type: mime || "audio/webm" });
        if (blob.size < 800) {
          renderStatus(opts.statusEl, '<div class="state-banner is-error">Data suara kosong (' + blob.size + ' byte). Cek izin atau perangkat mikrofon Anda.</div>');
          if (opts.onError) opts.onError("empty-blob");
          return;
        }

        renderStatus(
          opts.statusEl,
          '<div class="state-banner" role="status"><strong>Memproses suara dengan Whisper lokal (' + esc(health.modelName || "base") + ')...</strong> Tunggu sejenak.</div>'
        );

        var url = "/api/transcribe?lang=" + encodeURIComponent(mapSpeechLang(opts.lang)) +
          "&prompt=" + encodeURIComponent(opts.promptHint || "");

        window.fetch(url, {
          method: "POST",
          headers: { "Content-Type": blob.type || "audio/webm" },
          body: blob
        })
          .then(function (res) {
            return res.json().then(function (data) {
              return { status: res.status, data: data };
            });
          })
          .then(function (resp) {
            if (!resp.data || !resp.data.ok) {
              var errText = (resp.data && resp.data.error) || "Transkripsi gagal";
              renderStatus(opts.statusEl, '<div class="state-banner is-error" role="alert">' + esc(errText) + "</div>");
              if (opts.onError) opts.onError(errText);
              return;
            }
            var text = String(resp.data.text || "").trim();
            if (!text) {
              var hint = peak < 0.015
                ? "Volume suara terlalu pelan (peak rendah). Dekatkan mikrofon atau cek pengaturan Input Volume macOS lalu coba lagi."
                : "Tidak ada kata yang jelas tertangkap. Ucapkan kalimat lebih dekat ke mikrofon dan coba lagi.";
              renderStatus(opts.statusEl, '<div class="state-banner is-error" role="alert">' + esc(hint) + "</div>");
              if (opts.onError) opts.onError("blank-audio");
              return;
            }
            renderStatus(
              opts.statusEl,
              '<div class="state-banner is-success"><strong>Suara tertangkap (' + esc(resp.data.elapsedMs || 0) + ' ms):</strong> "' + esc(text) + '"</div>'
            );
            if (opts.onResult) opts.onResult(text, resp.data);
          })
          .catch(function (err) {
            renderStatus(
              opts.statusEl,
              '<div class="state-banner is-error" role="alert">Gagal mengirim audio ke server lokal: ' + esc(err && err.message ? err.message : "error") + "</div>"
            );
            if (opts.onError) opts.onError("upload-failed");
          });
      };

      recorder.start(250);
    }).catch(function (err) {
      cleanupSession(session);
      var msg = micErrorMessage(err);
      renderStatus(opts.statusEl, '<div class="state-banner is-error" role="alert">' + esc(msg) + "</div>");
      if (opts.onError) opts.onError(msg);
    });
  }

  function startBrowserFallbackSession(opts) {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      var noSupport = isLocalHostOrigin()
        ? "Pengenalan suara langsung tidak tersedia di browser ini. Pastikan server lokal Jago English berjalan di http://localhost:8088/ atau gunakan Google Chrome."
        : "Pengenalan suara langsung tidak tersedia di browser ini. Di HP Android atau iPhone, gunakan tombol mikrofon pada keyboard untuk langsung mendikte ke kolom teks.";
      renderStatus(opts.statusEl, '<div class="state-banner is-error" role="alert">' + esc(noSupport) + "</div>");
      if (opts.onError) opts.onError("unsupported");
      return;
    }

    var session = {
      id: "sr-" + Date.now(),
      button: opts.button,
      statusEl: opts.statusEl,
      idleLabel: opts.idleLabel || "Mulai Dikte",
      activeLabel: opts.activeLabel || "Berhenti Merekam",
      cleaned: false,
      hasInterimText: false,
      finalTranscript: ""
    };
    activeSession = session;
    setButtonState(session.button, session.idleLabel, session.activeLabel, true);

    var rec = new SR();
    session.recognition = rec;
    var langPref = mapSpeechLang(opts.lang);
    rec.lang = langPref === "id" ? "id-ID" : "en-US";
    rec.continuous = opts.continuous !== false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    var uid = null;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
        if (session.cleaned) {
          stream.getTracks().forEach(function (t) { t.stop(); });
          return;
        }
        session.stream = stream;
        uid = mountAudioMeter(stream, session, opts.statusEl, "Browser Mic", true);
      }).catch(function () {
        renderStatus(opts.statusEl, '<div class="state-banner" role="status"><strong>Mendengarkan.</strong> Bicara sekarang, lalu klik Selesai jika sudah cukup.</div>');
      });
    } else {
      renderStatus(opts.statusEl, '<div class="state-banner" role="status"><strong>Mendengarkan.</strong> Bicara sekarang.</div>');
    }

    rec.onresult = function (ev) {
      var finalPart = "";
      var interimPart = "";
      for (var i = ev.resultIndex; i < ev.results.length; i++) {
        var chunk = ev.results[i][0] ? ev.results[i][0].transcript : "";
        if (ev.results[i].isFinal) finalPart += chunk + " ";
        else interimPart += chunk + " ";
      }
      if (interimPart && uid) {
        session.hasInterimText = true;
        var intEl = document.getElementById(uid + "-interim");
        if (intEl) intEl.textContent = "Sedang menangkap: \"" + interimPart.trim() + "\"";
      }
      if (finalPart.trim()) {
        session.finalTranscript = (session.finalTranscript ? session.finalTranscript + " " : "") + finalPart.trim();
        if (opts.onInterim) opts.onInterim(finalPart.trim());
        if (!rec.continuous) {
          var out = session.finalTranscript;
          cleanupSession(session);
          if (opts.onResult) opts.onResult(out, { engine: "browser-speech" });
        }
      }
    };

    rec.onerror = function (ev) {
      var errCode = ev && ev.error ? ev.error : "unknown";
      var msg = webSpeechErrorMessage(errCode);
      cleanupSession(session);
      renderStatus(opts.statusEl, '<div class="state-banner is-error" role="alert">' + esc(msg) + "</div>");
      if (opts.onError) opts.onError(errCode);
    };

    rec.onend = function () {
      var out = session.finalTranscript.trim();
      var wasCleaned = session.cleaned;
      cleanupSession(session);
      if (wasCleaned) return;
      if (out) {
        renderStatus(opts.statusEl, '<div class="state-banner is-success"><strong>Suara tertangkap:</strong> "' + esc(out) + '"</div>');
        if (opts.onResult) opts.onResult(out, { engine: "browser-speech" });
      } else {
        var noVoiceMsg = isLocalHostOrigin()
          ? "Suara tidak terdeteksi oleh browser. Pastikan izin mikrofon aktif atau jalankan via server lokal http://localhost:8088/."
          : "Suara tidak terdengar jelas. Pastikan izin mikrofon browser aktif atau gunakan ikon mikrofon keyboard HP untuk mendikte langsung ke kolom teks.";
        renderStatus(opts.statusEl, '<div class="state-banner is-error">' + esc(noVoiceMsg) + "</div>");
      }
    };

    try {
      rec.start();
    } catch (err) {
      cleanupSession(session);
      renderStatus(opts.statusEl, '<div class="state-banner is-error" role="alert">Gagal memulai pengenalan suara browser.</div>');
    }
  }

  function toggleRecording(opts) {
    if (activeSession && opts.button && activeSession.button === opts.button) {
      stopActive(false);
      return;
    }
    if (activeSession) {
      stopActive(true);
    }

    renderStatus(opts.statusEl, '<div class="state-banner">Menyiapkan mikrofon...</div>');

    checkLocalServer(false).then(function (health) {
      var canRecord = navigator.mediaDevices && navigator.mediaDevices.getUserMedia && typeof MediaRecorder !== "undefined";
      if (health && health.available && canRecord) {
        startWhisperSession(opts, health);
      } else {
        startBrowserFallbackSession(opts);
      }
    });
  }

  window.JagoSpeech = {
    toggleRecording: toggleRecording,
    stopActive: stopActive,
    checkLocalServer: checkLocalServer
  };
})();
