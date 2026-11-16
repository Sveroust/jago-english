# Design Specification: Studio Dua Arah, 4-Hub Navigation, Custom Templates, and Dual Online AI Engine

**Date:** 2026-11-16  
**Project:** Jago English (`/Users/user/.gemini/antigravity/scratch/jago-english`)  
**Target Environments:** GitHub Pages HTTPS Mobile/Desktop (`https://sveroust.github.io/jago-english/`) and Optional Local Mac Dev Server (`http://localhost:8088/`)

## 1. Problem Statement & User Goals

The user learns English primarily via mobile browser on the live GitHub Pages deployment, with two core frustrations in the prior 9-tab layout:
1. **Local vs Online AI Mismatch:** References to local Ollama confused online phone usage because static GitHub Pages does not run Ollama. The user needs high-standard two-way feedback online on any phone without requiring a Mac backend.
2. **Fragmented Two-Way Loop & Tab Overload:** Having 9 top-level navigation tabs (plus nested sub-tabs inside Coach) fragmented two closely paired daily exercises:
   - **Side A (English -> Check & Explain Indonesian Meaning):** Speak or write English freely ("seenak jidat"), have the system understand intent even with mistakes, check grammar/word choice against IELTS 7.5-8.5 / executive standards, estimate CEFR level, **translate what the user's English actually means in Indonesian**, and provide leveled natural upgrades (`Santai B1`, `Kerja B2`, `Eksekutif C1`) with Indonesian phonetic reading guides and pronunciation testing.
   - **Side B (Indonesian -> Leveled English + Back-Translation & Nuance):** Speak or write Indonesian freely, convert to leveled natural English (`Santai A2-B1`, `Kerja B2`, `Eksekutif C1-C2`) with **Indonesian back-translations and tone/intent notes**, phonetic reading guides, audio playback, and 1-click handoff to Side A for pronunciation practice.
   - **Templates & Customization:** Both directions must offer ready-made templates plus the ability to edit freely and **save/delete user-defined custom templates** directly in browser `localStorage`.

## 2. Information Architecture: 9 Tabs Consolidated into 4 Primary Hubs

`<nav class="primary-nav">` displays **4 Hub buttons** only (fitting on 1 row on desktop `1280px` and cleanly in the fixed bottom bar on mobile `390px` with `>= 44px` tap targets):

1. **`tab-hub-studio` ("Studio Dua Arah")** *(Default Landing Hub)*
   - Displays a collapsible **Panduan Singkat 30 Detik** explaining Side A and Side B cleanly.
   - Displays `#subbar-studio` Segmented Two-Way Mode Switcher + active AI brain indicator chip + shortcut to AI Settings:
     - **Side A (`#tab-btn-coach` -> `panel-coach`):** *"A. Cek Inggris Saya (Koreksi & Arti Indonesia)"*
     - **Side B (`#tab-btn-translate` -> `panel-translate`):** *"B. Indonesia -> Inggris (Bertingkat & Maksudnya)"*
   - Inside Hub 1, `coach.js` renders **only** the clean English analysis workspace (hiding the redundant inner 5-button progress subnav while in `analyze` view so no duplicate tab bars appear).

2. **`tab-hub-convo` ("Percakapan & Topik")**
   - Displays `#subbar-convo`:
     - `#tab-btn-conversation` -> Percakapan Harian & Bisnis (7 scenarios x 3 tiers + Reply Studio)
     - `#tab-btn-topics` -> 50 Topik IELTS & TOEFL Speaking
     - `#tab-btn-speaking` -> Pelafalan, Shadowing & Lab Intonasi

3. **`tab-hub-grammar` ("Pondasi & Kosakata")**
   - Displays `#subbar-grammar`:
     - `#tab-btn-tenses` -> Simulator 12 Tenses (15 sentences x 3x4 interactive matrix)
     - `#tab-btn-srs` -> Kartu Kosakata (120 cards + custom card builder)
     - `#tab-btn-curriculum` -> Kurikulum A1 sampai C2
     - `#tab-btn-diagnostic` -> Uji Level (12 Soal) & Latihan Susun Kalimat

4. **`tab-hub-progress` ("Peta & Pengaturan AI")**
   - Displays `#subbar-progress`:
     - `#tab-btn-progress-plan` -> Peta Harian 14 Hari (`coach` sub `plan`)
     - `#tab-btn-progress-notebook` -> Catatan Kesalahan & Latihan Pola (`coach` sub `notebook`)
     - `#tab-btn-progress-tracker` -> Target Skor & Kriteria (`coach` sub `tracker` / `rubric`)
     - `#tab-btn-ai-settings` -> Pengaturan AI Online (HP) (`panel-ai-settings`)

Cross-navigation contract: `window.JagoSwitchTab(tabId)` / `switchTab(tabId)` resolves any legacy or deep module ID (`coach`, `translate`, `conversation`, `topics`, `speaking`, `tenses`, `srs`, `curriculum`, `diagnostic`, `ai-settings`) to its owning Hub, updates `#subbar-*` visibility and `aria-selected`/`aria-pressed` states, auto-scrolls on mobile when needed, and persists state.

## 3. Dual-Mode Online Brain Architecture (`ai-engine.js`)

Browser-first intelligence module `window.JagoAI` operating with **zero server dependency on GitHub Pages HTTPS**:

### Layer 1: Zero-Key Free Online + Client High-Standard Fallback (Active Out-of-the-Box)
- **Side A (`analyzeEnglish`):**
  1. Immediately runs deterministic `JagoCoachCore.analyze` (60+ Indonesian-to-English interference rules, CEFR bands, C1 upgrade, phonetics) + existing **LanguageTool CORS API** (`https://api.languagetool.org/v2/check`).
  2. Calls **MyMemory CORS API** (`https://api.mymemory.translated.net/get?langpair=en|id`) asynchronously on user text / corrected English so the user sees **"Arti & Maksud Kalimat Inggrismu dalam Bahasa Indonesia"** directly online on any phone without setup.
  3. Surfaces structured 3-tier progression (`Santai / Dasar`, `Profesional B2`, `Eksekutif C1 Band 7.5+`) with Indonesian phonetic reading (`toIndonesianPhonetics`), audio buttons, and 1-click mic repetition check.
- **Side B (`translateIndonesian`):**
  1. Scores curated patterns in `translate-data.js` cleanly (exact triggers + token overlap).
  2. When user inputs custom free-form Indonesian ("seenak jidat") or modifies a template:
     - Displays instant client-side `PHRASE_BRIDGES` and nuanced word cards (`35` keyword groups in `translate-data.js`).
     - Calls **MyMemory CORS API** (`id|en`) to generate dynamic natural English for ANY arbitrary Indonesian sentence + applies rule polish (`JagoCoachCore.applyRules`) and extracts alternative phrasing matches (`B1`, `B2` variants), **plus** performs quick `en|id` back-translation validation (using MyMemory matches or lookup) and renders Indonesian phonetic reading guides + `Latih Ucapkan di Cek Inggris` handoff button.

### Layer 2: Optional Free Personal AI Key (`Gemini 2.5 Flash` or `Groq Llama 3.3 70B`)
- Stored strictly locally in user's browser (`localStorage` key `jago_ai_online_cfg_v1`). Never transmitted except via direct CORS HTTPS `fetch()` to:
  - Google Gemini: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=<KEY>`
  - Groq Cloud: `https://api.groq.com/openai/v1/chat/completions` (`model: "llama-3.3-70b-versatile"`, `response_format: { type: "json_object" }`)
- When configured in Hub 4 -> Pengaturan AI Online (HP):
  - **Side A** returns deep semantic understanding of arbitrary/noisy speech ("seenak jidat"), CEFR level estimate, exact Indonesian meaning summary (`meaningId`), itemized grammar/collocation fixes with Indonesian reasons, `Santai (B1)` / `Kerja (B2)` / `Eksekutif (C1)` rewrites + Indonesian translations, and follow-up sentence suggestions.
  - **Side B** returns semantic intent interpretation of arbitrary Indonesian slang/mixed sentences, `B1` / `B2` / `C1` + `Formal` / `Casual` versions, **Indonesian back-translations (`backId`)** and **tone/listener impact notes (`nuanceId`)** for every tier.
- Optional **Groq Whisper** toggle: when on remote HTTPS mobile with a Groq key saved and user prefers Whisper over browser `SpeechRecognition`, records mic audio and calls `https://api.groq.com/openai/v1/audio/transcriptions` (`whisper-large-v3-turbo`) directly from the phone browser.
- Silent non-blocking optional fallback to `/api/coach-ai` / `/api/translate-ai` ONLY on `localhost:8088` when no cloud key is active and offline localhost server is running.

## 4. Template & Custom Template Workflows

- **Side A (`coach.js`):** Starter English templates (`Perkenalan Indonesia`, `Pitching Kemiri`, `Regulasi Alkes IDAK/CDAKB`, `Sapaan Harian & Cuaca Jakarta`, `Kunjungan Bisnis Mr. Malik`) + inline `+ Simpan Jadi Template` bar inside the editor card so any customized sentence can be saved to `cs.customContexts` and deleted inline without leaving the screen.
- **Side B (`translate.js`):** 11 starter Indonesian templates (`DATA.intents`) + inline `+ Simpan Jadi Template` bar saving custom prompts to `localStorage` (`jago_translate_custom_tpl_v1`) with inline delete controls. Clicking any template fills `#translate-input` cleanly so the user can freely customize before translating.
- Every translated English output card includes **"Latih Ucapkan Ini"** which transfers that English line straight to Side A (`window.JagoCoachAnalyzeText(en)`) for immediate grammar + phonetic + microphone practice.

## 5. Offline PWA & Verification Plan

- Add `ai-engine.js` to `<script>` load order in `index.html`, `sw.js` `STATIC_ASSETS`, and `test-suite.js` `filesToScan`.
- Ensure zero horizontal overflow across all 4 Hubs and every sub-tab at desktop (`1280px`), tablet (`768px`), and phone (`390px` and `360px`), minimum `44px` touch targets, pure `Lato` typography, zero em/en dashes, and zero AI-slop text.
- Verify unit tests, content validator, real virtual-mic dictation test, Playwright full Hub/Template/Two-Way Studio/AI Settings tests, Awwwards audit (`0 FAIL, 0 WARN` localhost), and live GitHub Pages deployment (`0` HTTP >= 400 requests, `0` console/page errors).
