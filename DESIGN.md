# Jago English: Art Direction & Awwwards Concept System

## Concept Card

```
Idea:        Meja koreksi bahasa Inggris dan jalur latihan harian tempat kalimat Indonesia-Inggris dibedah menjadi bahasa Inggris Band 7.5+ lengkap dengan ejaan lidah Indonesia.
Metaphor:    Meja redaksi Swiss (Swiss Proof Desk) yang terhubung dengan peta jalan berliku (Day-by-Day Winding Highway).
Signature:   1) Peta Jalan Berliku interaktif dengan indikator posisi aktif berdenyut halus dan tombol "Latih di Studio" yang langsung mengirim skenario hari tersebut ke meja analisis.
             2) Petunjuk 3-langkah interaktif di kepala studio dengan micro-interaction pengisian tombol (pointer flood / slide-and-lock).
Emotion:     Jernih, terarah, dan langsung siap dipakai latihan dalam 3 detik pertama.
Motion verb: Slide and lock like a precision index card (cubic-bezier(0.165, 0.84, 0.44, 1)).
Screenshot:  Poster tipografi Lato 900 berpadu dengan kartu petunjuk 3-langkah dan jalur jalan berliku Hari 1 sampai Hari 14.
```

## Palette (Swiss Index Archetype: Zero Cream/Terracotta AI Default)

| Role | Light Token | Dark Token | Purpose |
| :--- | :--- | :--- | :--- |
| `ground` | `#F4F4F2` | `#0B0D10` | Cool architectural alabaster / deep carbon ground |
| `surface` | `#FFFFFF` | `#13161C` | Crisp proof sheet surface |
| `muted-ground` | `#E9E9E4` | `#1B1F27` | Secondary index well |
| `ink` | `#0E0F12` | `#F2F4F8` | Primary typography (>14:1 contrast) |
| `muted` | `#474B54` | `#A0A8B8` | Secondary copy (>7:1 AA/AAA contrast) |
| `line` | `#D6D6CE` | `#2A303C` | Hairline structural grid |
| `accent` | `#143CFA` | `#5B8CFF` | International Signal Cobalt for primary actions & active milestones |

## Typography (100% Self-Hosted Lato Family)

- **Source:** Self-hosted `.woff2` (`fonts/lato-400-normal.woff2`, `fonts/lato-700-normal.woff2`, `fonts/lato-900-normal.woff2`).
- **Display (`--t-display`):** `clamp(2rem, 1.3rem + 2.8vw, 3.35rem)`, weight `900`, line-height `1.06`, tracking `-0.035em`, optical margin `-0.02em`.
- **Section Heading (`--t-l`):** `clamp(1.25rem, 1.05rem + 0.8vw, 1.65rem)`, weight `900`, tracking `-0.02em`.
- **Body (`--t-body`):** `1rem` (`16px`), weight `400`, line-height `1.62`, measure `65ch`.
- **Numeric Discipline:** `font-variant-numeric: tabular-nums` across all counters, scores, and tables.

## Composition Plan (ASCII Wireframes)

```
+------------------------------------------------------------------------+
| JagoEnglish   Studio Latihan Bicara & Tulis   [Ringkasan] [Mode Gelap] |
+------------------------------------------------------------------------+
| [Coach & Peta Harian] [Kurikulum] [12 Tenses] [Kosakata] [Pelafalan]   |
+------------------------------------------------------------------------+
| LATIHAN BICARA, KOREKSI KALIMAT, & PETA HARIAN                         |
| +----------------------------------+ +-------------------------------+ |
| | 01 Rekam / ketik campuran ID-EN  | | 02 Klik Bedah Teks            | |
| +----------------------------------+ +-------------------------------+ |
| +--------------------------------------------------------------------+ |
| | Masukkan Ucapan atau Tulisanmu        [Petunjuk 3 Langkah Singkat] | |
| | [Textarea input...]                                                | |
| | [Bedah Teks] [Kosongkan]  Contoh: [Perkenalan] [Kemiri] [Alkes]    | |
| +--------------------------------------------------------------------+ |
+------------------------------------------------------------------------+
```
