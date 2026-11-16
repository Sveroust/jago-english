window.JAGO_DATA = {
  cefrLevels: [
    {
      id: "A1",
      code: "A1",
      name: "Foundation & Survival Mechanics",
      indonesianTitle: "Pondasi Kalimat & Bertahan Hidup",
      targetWords: 500,
      studyWeeks: "Minggu 1 - 2",
      coreFocus: "Memisahkan jalur kalimat Nominal (To Be: am/is/are) dan jalur Verbal (Action Verb: V1 / do / does), serta membalik urutan kata benda (Modifier-Head).",
      contrastiveInsight: {
        title: "Jebakan Utama Penutur Indonesia di Level A1",
        indonesianPattern: "Dia sibuk setiap Senin. / Saya setuju dengan kamu.",
        wrongEnglish: "She busy every Monday. / I am agree with you.",
        correctEnglish: "She is busy every Monday. / I agree with you.",
        explanation: "Bahasa Indonesia tidak memiliki kopula sebelum kata sifat ('sibuk') sehingga pemula sering lupa memakai 'is/am/are'. Sebaliknya, saat bertemu kata kerja aksi seperti 'agree', pemula justru menempelkan 'am' ('I am agree'). Ingat: Gunakan 'Be' HANYA jika tidak ada kata kerja aksi."
      },
      formulas: [
        {
          label: "Nominal Clause (State / Identity / Location)",
          syntax: "Subject + am/is/are + Complement (Noun / Adjective / Preposition)",
          exampleEn: "The server room is on the third floor, and the technicians are ready.",
          exampleId: "Ruang server ada di lantai tiga, dan para teknisi sudah siap."
        },
        {
          label: "Verbal Clause (Routine / Fact)",
          syntax: "Subject + V1(s/es) + Object | Negative: Subject + do/does + not + V1",
          exampleEn: "Our supplier delivers raw materials every Tuesday morning.",
          exampleId: "Pemasok kami mengirim bahan baku setiap Selasa pagi."
        },
        {
          label: "Noun Phrase Inversion (OSASCOMP)",
          syntax: "Determiner + Opinion + Size + Age + Color + Origin + Material + Noun",
          exampleEn: "A reliable small new black Japanese steel component.",
          exampleId: "Sebuah komponen baja Jepang baru berukuran kecil berwarna hitam yang andal (Inti benda 'component' wajib di paling akhir)."
        }
      ],
      modules: [
        {
          unitCode: "A1.1",
          title: "Arsitektur Subjek & Mesin Kalimat (Be vs Action Verb)",
          summary: "Menguasai kapan wajib menggunakan am/is/are dan kapan langsung menggunakan kata kerja aksi (V1).",
          keyRule: "Kalimat bahasa Inggris wajib memiliki kata kerja. Jika predikatnya kata sifat (hungry, late, ready), kata benda (manager, student), atau lokasi (in Jakarta), pasang am/is/are.",
          drills: [
            { promptId: "Klien kami puas dengan sampel produk tersebut.", answerEn: "Our client is satisfied with the product sample.", note: "'Satisfied' adalah kata sifat (adjective), wajib memakai 'is'." },
            { promptId: "Apakah dia bekerja di divisi keuangan?", answerEn: "Does she work in the finance division?", note: "'Work' adalah kata kerja aksi murni, gunakan kata bantu 'Does' untuk bertanya." }
          ]
        },
        {
          unitCode: "A1.2",
          title: "Hukum Noun Phrase Terbalik & Kepemilikan",
          summary: "Menyusun frasa benda panjang tanpa terbalik dan membedakan Subject/Object/Possessive Pronouns.",
          keyRule: "Dalam bahasa Inggris, kata benda utama (Head Noun) selalu ditaruh di posisi paling kanan, sedangkan seluruh penjelasnya ditaruh di sebelah kirinya.",
          drills: [
            { promptId: "Laporan keuangan tahunan mereka", answerEn: "Their annual financial report", note: "Urutan: Possessive (Their) + Age/Frequency (annual) + Type (financial) + Head Noun (report)." },
            { promptId: "Tolong kirimkan dokumen itu kepada saya.", answerEn: "Please send the document to me.", note: "Setelah preposisi ('to'), gunakan Object Pronoun ('me'), bukan Subject Pronoun ('I')." }
          ]
        },
        {
          unitCode: "A1.3",
          title: "Kuantitas: Countable vs Uncountable Nouns",
          summary: "Membedakan benda yang bisa dihitung satu per satu dan benda abstrak/cair/kolektif yang selalu dianggap tunggal.",
          keyRule: "Information, advice, equipment, furniture, money, dan traffic adalah Uncountable di bahasa Inggris. Jangan pernah tambahkan akhiran -s dan jangan gunakan 'many'.",
          drills: [
            { promptId: "Kami membutuhkan banyak informasi baru.", answerEn: "We need a lot of new information.", note: "Jangan tulis 'many new informations'." },
            { promptId: "Semua peralatan di pabrik ini sudah modern.", answerEn: "All the equipment in this factory is modern.", note: "'Equipment' bersifat uncountable sehingga kata kerjanya tunggal ('is')." }
          ]
        }
      ],
      dialogue: {
        context: "Menyambut Tamu Bisnis di Lobi Kantor",
        lines: [
          { speaker: "Raka (Host)", en: "Good morning, Ms. Claire. Welcome to our Jakarta headquarters.", id: "Selamat pagi, Ibu Claire. Selamat datang di kantor pusat kami di Jakarta." },
          { speaker: "Claire (Visitor)", en: "Thank you, Raka. The traffic is quite heavy this morning, so I am glad I arrived on time.", id: "Terima kasih, Raka. Lalu lintas cukup padat pagi ini, jadi saya senang tiba tepat waktu." },
          { speaker: "Raka (Host)", en: "Our meeting room is on the twelfth floor. Do you need a cup of coffee before we start?", id: "Ruang rapat kita ada di lantai dua belas. Apakah Anda butuh secangkir kopi sebelum kita mulai?" }
        ]
      }
    },
    {
      id: "A2",
      code: "A2",
      name: "Temporal Navigation & Daily Fluency",
      indonesianTitle: "Navigasi Waktu & Percakapan Harian",
      targetWords: 1200,
      studyWeeks: "Minggu 3 - 4",
      coreFocus: "Menguasai perubahan kata kerja masa lampau (V2 / Did), aksi yang sedang berjalan (Present Continuous), rencana masa depan (Will vs Going to), serta geometri preposisi AT, ON, IN.",
      contrastiveInsight: {
        title: "Jebakan Utama Penutur Indonesia di Level A2",
        indonesianPattern: "Kemarin saya tidak pergi ke kantor karena hujan.",
        wrongEnglish: "Yesterday I did not went to the office because rained.",
        correctEnglish: "Yesterday I did not go to the office because it rained.",
        explanation: "Ada dua kesalahan klasik di sini: (1) Setelah 'did not', kata kerja wajib kembali ke bentuk dasar V1 ('go', bukan 'went') karena penanda masa lampau sudah diambil alih oleh 'did'. (2) Cuaca dalam bahasa Inggris wajib memiliki subjek semu 'it' ('it rained', bukan sekadar 'rained')."
      },
      formulas: [
        {
          label: "Past Simple (Kejadian Selesai di Waktu Spesifik Masa Lalu)",
          syntax: "(+) S + V2 | (-) S + did not + V1 | (?) Did + S + V1?",
          exampleEn: "We signed the distribution agreement last Thursday, and the shipment left the port at 6 AM.",
          exampleId: "Kami menandatangani perjanjian distribusi Kamis lalu, dan pengirimannya berangkat dari pelabuhan pukul 6 pagi."
        },
        {
          label: "Future Intent: Planned (Be going to) vs Spontaneous (Will)",
          syntax: "Planned: S + am/is/are + going to + V1 | Spontaneous: S + will + V1",
          exampleEn: "We are going to expand our warehouse next quarter. Hold on, I will send you the blueprint now.",
          exampleId: "Kami akan memperluas gudang kami kuartal depan (sudah direncanakan). Tunggu sebentar, saya akan kirimkan cetak birunya sekarang (spontan)."
        },
        {
          label: "Geometri Preposisi (0D Titik -> 2D Permukaan -> 3D Ruang)",
          syntax: "AT (Jam/Titik Peta) | ON (Hari/Tanggal/Permukaan/Jalan) | IN (Bulan/Tahun/Kota/Negara/Ruangan)",
          exampleEn: "The flight lands at 08:15 AM on Friday in Singapore.",
          exampleId: "Penerbangannya mendarat pukul 08.15 pagi pada hari Jumat di Singapura."
        }
      ],
      modules: [
        {
          unitCode: "A2.1",
          title: "Past Simple & Hukum Kembalinya V1 Setelah 'Did'",
          summary: "Menceritakan kronologi masa lalu secara akurat dengan kata kerja beraturan (Regular -ed) dan tak beraturan (Irregular V2).",
          keyRule: "Gunakan V2 hanya pada kalimat positif. Begitu kalimat menjadi negatif (did not) atau kalimat tanya (Did...?), kata kerja utama langsung kembali ke V1 murni.",
          drills: [
            { promptId: "Kami tidak menerima email konfirmasi kemarin.", answerEn: "We did not receive the confirmation email yesterday.", note: "Gunakan 'did not receive' (V1), bukan 'did not received'." },
            { promptId: "Kapan Anda membeli mesin produksi tersebut?", answerEn: "When did you buy the production machine?", note: "Gunakan 'did you buy' (V1), bukan 'did you bought'." }
          ]
        },
        {
          unitCode: "A2.2",
          title: "Present Continuous vs Present Simple (Stative Verbs)",
          summary: "Membedakan aksi sementara yang sedang berlangsung saat ini dengan fakta permanen atau kata kerja mental.",
          keyRule: "Kata kerja keadaan mental dan kepemilikan (know, understand, believe, belong, need, want, own) adalah Stative Verbs: haram diberi akhiran -ing meskipun sedang terjadi sekarang.",
          drills: [
            { promptId: "Sekarang saya mengerti maksud Anda.", answerEn: "Now I understand what you mean.", note: "Jangan pernah mengatakan 'I am understanding'." },
            { promptId: "Tim kami sedang menguji pembaruan aplikasi minggu ini.", answerEn: "Our team is testing the application update this week.", note: "'Test' adalah kata kerja aksi dinamis, sah memakai 'is testing'." }
          ]
        },
        {
          unitCode: "A2.3",
          title: "Perbandingan Presisi (Comparatives & Superlatives)",
          summary: "Membandingkan metrik kinerja, harga, dan spesifikasi produk secara natural.",
          keyRule: "Kata sifat 1 suku kata ditambah -er/-est (fast -> faster -> fastest). Kata sifat 2+ suku kata memakai more/most (efficient -> more efficient -> the most efficient). Gunakan 'much' atau 'far' untuk mempertegas selisih ('far more reliable').",
          drills: [
            { promptId: "Vendor kedua jauh lebih efisien daripada vendor pertama.", answerEn: "The second vendor is far more efficient than the first one.", note: "Gunakan 'far more efficient', bukan 'more bolj efficient'." },
            { promptId: "Ini adalah kuartal paling menguntungkan dalam sejarah perusahaan kami.", answerEn: "This is the most profitable quarter in our company's history.", note: "Superlative wajib diawali 'the' atau possessive." }
          ]
        }
      ],
      dialogue: {
        context: "Evaluasi Proyek Mingguan & Penjadwalan Ulang",
        lines: [
          { speaker: "Dina", en: "Did the logistics partner deliver the packaging materials yesterday?", id: "Apakah mitra logistik sudah mengirimkan bahan kemasan kemarin?" },
          { speaker: "farhan", en: "They delivered the boxes at 4 PM, but they did not include the thermal labels.", id: "Mereka mengirim kotaknya pukul 4 sore, tetapi mereka tidak menyertakan label termalnya." },
          { speaker: "Dina", en: "Alright, I will call their supervisor right now. We are going to run the first batch on Monday morning.", id: "Baiklah, saya akan menelepon supervisor mereka sekarang. Kita akan menjalankan batch pertama pada Senin pagi." }
        ]
      }
    },
    {
      id: "B1",
      code: "B1",
      name: "Narrative Aspect & Independent Bridge",
      indonesianTitle: "Jembatan Waktu, Kalimat Pasif, & Kemandirian Opini",
      targetWords: 2500,
      studyWeeks: "Minggu 5 - 7",
      coreFocus: "Menguasai konsep Present Perfect (Have/Has + V3) yang menghubungkan masa lalu dengan kondisi saat ini, kalimat pasif profesional (Be + V3), serta klausa pengandaian nyata (Conditional Tipe 0 & 1).",
      contrastiveInsight: {
        title: "Jebakan Utama Penutur Indonesia di Level B1",
        indonesianPattern: "Saya sudah tinggal di Surabaya selama lima tahun (dan masih di Surabaya sekarang).",
        wrongEnglish: "I live in Surabaya for five years. / I lived in Surabaya for five years.",
        correctEnglish: "I have lived in Surabaya for five years. (atau: I have been living in Surabaya for five years.)",
        explanation: "Dalam bahasa Indonesia, kata 'sudah' sering diterjemahkan mentah menjadi Past Simple ('lived' yang artinya sekarang sudah pindah!) atau Present Simple ('live' yang salah tata bahasa bila digabung durasi 'for five years'). Untuk aksi yang dimulai di masa lalu dan masih relevan/berlanjut sampai detik ini, bahasa Inggris WAJIB memakai Present Perfect (Have/Has + V3)."
      },
      formulas: [
        {
          label: "Present Perfect (Jembatan Masa Lalu ke Masa Kini)",
          syntax: "Subject + have/has + V3 (Past Participle) + since [Titik Awal] / for [Durasi]",
          exampleEn: "We have reduced customer churn by 18% since we redesigned the onboarding flow in March.",
          exampleId: "Kami telah menurunkan tingkat berhentinya pelanggan sebesar 18% sejak kami merancang ulang alur orientasi pada bulan Maret."
        },
        {
          label: "Objective Passive Voice (Fokus pada Objek / Hasil)",
          syntax: "Object + Be (sesuai Tense) + V3 (+ by Agent bila perlu)",
          exampleEn: "All financial transactions are encrypted automatically before they are stored in the ledger.",
          exampleId: "Seluruh transaksi keuangan dienkripsi secara otomatis sebelum disimpan di dalam buku besar."
        },
        {
          label: "First Conditional (Negosiasi & Kesepakatan Bersyarat)",
          syntax: "If / Unless + Subject + V1(s/es) [Present Simple], Subject + will/can/may + V1",
          exampleEn: "If you finalize the contract before Friday, we will lock in the current wholesale rate.",
          exampleId: "Jika Anda menyelesaikan kontrak sebelum Jumat, kami akan mengunci harga grosir saat ini."
        }
      ],
      modules: [
        {
          unitCode: "B1.1",
          title: "Present Perfect vs Past Simple: Hukum Waktu Hidup vs Waktu Mati",
          summary: "Membedakan kapan wajib memakai V2 dan kapan wajib memakai Have/Has + V3 dalam laporan kerja maupun percakapan.",
          keyRule: "Jika kalimat menyebut waktu masa lalu yang sudah berakhir (yesterday, last week, in 2022, two hours ago), HARAM memakai Have + V3; gunakan V2. Jika waktunya masih berlangsung (today, this month, recently, since 2023) atau fokus pada hasil sekarang, gunakan Have/Has + V3.",
          drills: [
            { promptId: "Saya sudah menyelesaikan audit pajak pagi ini (masih pagi).", answerEn: "I have completed the tax audit this morning.", note: "Karena masih pagi dan hasilnya siap sekarang, gunakan 'have completed'." },
            { promptId: "Kami meluncurkan versi pertama pada tahun 2023.", answerEn: "We launched the first version in 2023.", note: "'In 2023' adalah waktu masa lalu yang sudah tutup, wajib Past Simple ('launched')." }
          ]
        },
        {
          unitCode: "B1.2",
          title: "Arsitektur Kalimat Pasif Lintas Waktu (Be + V3)",
          summary: "Menyusun laporan teknis dan komunikasi korporat yang objektif menggunakan kalimat pasif.",
          keyRule: "Rumus inti kalimat pasif tidak pernah berubah: Be + V3. Yang berubah mengikuti waktu hanyalah bentuk 'Be'-nya (is/are + V3, was/were + V3, is being + V3, has been + V3, will be + V3).",
          drills: [
            { promptId: "Sistem pembayaran sedang diperbarui oleh tim teknis saat ini.", answerEn: "The payment system is being updated by the technical team right now.", note: "Present Continuous Passive: 'is being + V3 (updated)'." },
            { promptId: "Dana tersebut telah ditransfer ke rekening penampungan.", answerEn: "The funds have been transferred to the escrow account.", note: "Present Perfect Passive: 'have been + V3 (transferred)'." }
          ]
        },
        {
          unitCode: "B1.3",
          title: "Relative Clauses (Who, Which, That, Whose, Where)",
          summary: "Menggabungkan dua kalimat terpisah menjadi satu kalimat majemuk yang padat dan mengalir.",
          keyRule: "Jangan menaruh kata ganti objek ganda di dalam Relative Clause (misal: 'The laptop that I bought it yesterday' adalah SALAH; yang benar: 'The laptop that I bought yesterday').",
          drills: [
            { promptId: "Analis yang menyusun proyeksi ini memiliki pengalaman sepuluh tahun.", answerEn: "The analyst who prepared this projection has ten years of experience.", note: "'Who prepared this projection' menjelaskan 'The analyst'." },
            { promptId: "Ini adalah klausul kontrak yang perlu kita negosiasikan ulang.", answerEn: "This is the contract clause that we need to renegotiate.", note: "Jangan tambahkan 'it' di ujung kalimat." }
          ]
        }
      ],
      dialogue: {
        context: "Negosiasi Syarat Pembayaran dengan Klien B2B",
        lines: [
          { speaker: "Arif", en: "We have reviewed your procurement proposal, and the technical specifications match our requirements.", id: "Kami telah meninjau proposal pengadaan Anda, dan spesifikasi teknisnya sesuai dengan kebutuhan kami." },
          { speaker: "Maya", en: "Glad to hear that. Has the budget been approved by your board?", id: "Senang mendengarnya. Apakah anggarannya sudah disetujui oleh dewan direksi Anda?" },
          { speaker: "Arif", en: "Yes, it was approved yesterday. However, unless the delivery lead time is shortened to two weeks, we will have to split the order.", id: "Ya, sudah disetujui kemarin. Namun, kecuali waktu pengiriman dipercepat menjadi dua minggu, kami harus memecah pesanannya." }
        ]
      }
    },
    {
      id: "B2",
      code: "B2",
      name: "Hypothetical Precision & Executive Fluency",
      indonesianTitle: "Simulasi Kontrafaktual, Connected Speech, & Argumentasi",
      targetWords: 4000,
      studyWeeks: "Minggu 8 - 10",
      coreFocus: "Menguasai pengandaian tak nyata (Conditional Tipe 2 & 3), urutan kejadian lampau berlapis (Past Perfect: Had + V3), perbedaan makna Gerund vs Infinitive, serta fonetik Connected Speech.",
      contrastiveInsight: {
        title: "Jebakan Utama Penutur Indonesia di Level B2",
        indonesianPattern: "Seandainya kemarin saya tahu ada rapat darurat, saya pasti sudah datang.",
        wrongEnglish: "If yesterday I know there is an emergency meeting, I will come.",
        correctEnglish: "If I had known there was an emergency meeting yesterday, I would have attended.",
        explanation: "Bahasa Indonesia memakai kata 'seandainya' tanpa mengubah bentuk kata kerja. Dalam bahasa Inggris, berandai-andai tentang masa lalu yang sudah terlanjur lewat (Third Conditional) WAJIB memundurkan waktu satu langkah ke belakang menjadi Past Perfect ('If + S + had + V3') dan hasilnya memakai 'would have + V3'."
      },
      formulas: [
        {
          label: "Second Conditional (Kontrafaktual Saat Ini / Imajinasi Strategis)",
          syntax: "If + Subject + V2 (were untuk semua subjek), Subject + would/could + V1",
          exampleEn: "If we had direct access to local raw materials, our gross margin would increase by 12%.",
          exampleId: "Seandainya saat ini kami punya akses langsung ke bahan baku lokal, margin kotor kami akan naik 12% (Faktanya saat ini belum punya)."
        },
        {
          label: "Third Conditional (Audit & Evaluasi Masa Lalu yang Tak Bisa Diubah)",
          syntax: "If + Subject + had + V3, Subject + would/could + have + V3",
          exampleEn: "If the team had run load testing before launch, the server would not have crashed.",
          exampleId: "Seandainya tim menjalankan uji beban sebelum peluncuran, server tidak akan tumbang (Faktanya tidak diuji dan sempat tumbang)."
        },
        {
          label: "Gerund vs Infinitive Semantic Shift",
          syntax: "stop + V-ing (berhenti melakukan aksi itu) vs stop + to V1 (berhenti sejenak demi melakukan aksi baru)",
          exampleEn: "We stopped using legacy servers (berhenti memakai). vs We stopped to review the metrics (berhenti sejenak untuk meninjau).",
          exampleId: "Perubahan V-ing ke to V1 mengubah makna kalimat secara total pada kata kerja stop, remember, forget, try, dan regret."
        }
      ],
      modules: [
        {
          unitCode: "B2.1",
          title: "Counterfactual Conditionals (Tipe 2, Tipe 3, & Mixed)",
          summary: "Menganalisis skenario bisnis, simulasi risiko, dan evaluasi pasca-proyek dengan tata bahasa hipotesis yang presisi.",
          keyRule: "Mundurkan satu jenjang waktu (Backshift) setiap kali Anda membicarakan hal yang berlawanan dengan kenyataan: Fakta Present -> Pengandaian Past (V2). Fakta Past -> Pengandaian Past Perfect (Had + V3).",
          drills: [
            { promptId: "Jika saya berada di posisi Anda sekarang, saya akan meminta klausul garansi tertulis.", answerEn: "If I were in your position right now, I would request a written warranty clause.", note: "Gunakan 'If I were' untuk pengandaian formal semua subjek." },
            { promptId: "Seandainya kita memhedging eksposur mata uang bulan lalu, kita tidak akan merugi.", answerEn: "If we had hedged our currency exposure last month, we would not have suffered a loss.", note: "Evaluasi bulan lalu: 'If we had hedged..., we would not have suffered...'." }
          ]
        },
        {
          unitCode: "B2.2",
          title: "Past Perfect (Had + V3) & Future Perfect (Will Have + V3)",
          summary: "Menyusun garis waktu presisi ketika ada dua kejadian di masa lampau atau target tenggat di masa depan.",
          keyRule: "Jangan gunakan 'Had + V3' sendirian tanpa kejadian pembanding. 'Had + V3' hanya dipakai untuk menandai kejadian mana yang LEBIH DULU selesai sebelum kejadian masa lalu kedua (V2) terjadi.",
          drills: [
            { promptId: "Ketika auditor tiba, kami sudah menutup pembukuan kuartal ketiga.", answerEn: "By the time the auditors arrived, we had already closed the third-quarter books.", note: "Menutup buku terjadi lebih dulu ('had closed') sebelum auditor tiba ('arrived')." },
            { promptId: "Pada akhir tahun ini, kita akan telah menyelesaikan seluruh pembayaran utang.", answerEn: "By the end of this year, we will have paid off the entire debt.", note: "Penanda 'By + waktu masa depan' selalu memicu Future Perfect ('will have + V3')." }
          ]
        },
        {
          unitCode: "B2.3",
          title: "Connected Speech, Schwa (/ə/), & Fonetik Native",
          summary: "Membongkar alasan mengapa ucapan penutur asli terdengar menyambung dan cara menirunya secara ilmiah.",
          keyRule: "Bahasa Inggris adalah bahasa Stress-Timed: suku kata yang ditekan diucapkan jelas dan panjang, sedangkan kata fungsi di antaranya (to, of, for, have, can) diperas menjadi bunyi vokal lemah Schwa /ə/.",
          drills: [
            { promptId: "We should have told them earlier. (Lafalkan secara Connected Speech)", answerEn: "We should've /ˈʃʊd.əv/ told 'em /ˈtoʊl.dəm/ earlier.", note: "'Should have' dalam percakapan cepat menyusut menjadi /ˈʃʊd.əv/, bukan /ʃʊd hæv/." },
            { promptId: "What do you want to do? (Kenali reduksi fonetiknya)", answerEn: "Whaddaya /ˌwʌd.ə.jə/ wanna /ˈwɑː.nə/ do?", note: "Memahami reduksi ini wajib agar telinga Anda tidak kaget saat rapat dengan penutur asli." }
          ]
        }
      ],
      dialogue: {
        context: "Post-Mortem Insiden Teknis & Mitigasi Risiko",
        lines: [
          { speaker: "Kevin (CTO)", en: "If our monitoring alert had triggered five minutes earlier, we would have isolated the database lock before peak traffic hit.", id: "Seandainya peringatan pemantauan kita aktif lima menit lebih awal, kita pasti sudah mengisolasi penguncian basis data sebelum trafik puncak masuk." },
          { speaker: "Sinta (Lead Eng)", en: "Agreed. By the time the on-call engineer noticed the latency spike, the connection pool had already maxed out.", id: "Setuju. Pada saat insinyur jaga menyadari lonjakan latensi, kumpulan koneksi sudah mencapai batas maksimum." },
          { speaker: "Kevin (CTO)", en: "Going forward, if any node exceeds 70% memory utilization, I want the circuit breaker to trip automatically.", id: "Ke depannya, jika ada node yang melampaui 70% penggunaan memori, saya ingin pemutus sirkuit bekerja secara otomatis." }
        ]
      }
    },
    {
      id: "C1",
      code: "C1",
      name: "Structural Inversion & Academic/Executive Command",
      indonesianTitle: "Inversi Retoris, Kalimat Cleft, & Kepadatan Eksekutif",
      targetWords: 6500,
      studyWeeks: "Minggu 11 - 12",
      coreFocus: "Menguasai struktur bahasa Inggris tingkat tinggi untuk laporan dewan direksi, pidato, dan publikasi ilmiah: Negative Inversion, Subjunctive Mood, Cleft Sentences, dan Nominalization.",
      contrastiveInsight: {
        title: "Jebakan Utama Penutur Indonesia di Level C1",
        indonesianPattern: "Tidak hanya biaya operasional menurun, tetapi produktivitas tim juga meningkat tajam.",
        wrongEnglish: "Not only operational costs decreased, but team productivity also increased sharply.",
        correctEnglish: "Not only did operational costs decrease, but team productivity also increased sharply.",
        explanation: "Ketika kalimat bahasa Inggris dibuka dengan adverbia negatif atau pembatas ('Not only', 'Never', 'Rarely', 'Seldom', 'Little', 'Under no circumstances'), struktur klausa pertama WAJIB dibalik seperti kalimat tanya (Auxiliary + Subject + Verb: 'Not only did costs decrease...'). Ini adalah penanda instan kemahiran level C1."
      },
      formulas: [
        {
          label: "Negative & Restrictive Inversion (Penekanan Retoris Tingkat Tinggi)",
          syntax: "Negative Adverbial (Never / Rarely / Not only / Under no circumstances) + Auxiliary + Subject + Main Verb",
          exampleEn: "Under no circumstances should confidential client credentials be transmitted over unencrypted channels.",
          exampleId: "Dalam keadaan apa pun kredensial rahasia klien tidak boleh dikirimkan melalui saluran tanpa enkripsi."
        },
        {
          label: "Wh-Cleft & It-Cleft Sentences (Mengunci Titik Fokus Argumen)",
          syntax: "What + Subject + Verb + is/was + [Focused Element] | It is/was + [Focused Element] + that + Clause",
          exampleEn: "What differentiates resilient enterprises from fragile ones is disciplined capital allocation during downturns.",
          exampleId: "Hal yang membedakan perusahaan tangguh dari yang rapuh adalah alokasi modal yang disiplin saat resesi."
        },
        {
          label: "Mandative Subjunctive (Rekomendasi & Ketetapan Formal)",
          syntax: "It is imperative/essential/vital + that + Subject + V1 (bare infinitive tanpa -s/es dan tanpa to)",
          exampleEn: "The audit committee recommended that the Chief Risk Officer report directly to the independent board.",
          exampleId: "Komite audit merekomendasikan agar Direktur Risiko melapor langsung kepada dewan independen (Perhatikan: 'report' tanpa -s meskipun subjeknya tunggal!)."
        }
      ],
      modules: [
        {
          unitCode: "C1.1",
          title: "Negative Inversion (Never, Rarely, Not Only, No Sooner, Hardly)",
          summary: "Mengubah kalimat datar menjadi pernyataan eksekutif yang berwibawa dan tajam melalui inversi kata bantu.",
          keyRule: "Pasangan baku: 'Not only... but also...', 'No sooner had [S] [V3] than [S] [V2]', 'Hardly/Scarcely had [S] [V3] when [S] [V2]', dan 'Only after [Clause] did [S] [V1]'.",
          drills: [
            { promptId: "Baru saja kami menandatangani kontrak, regulasi impor langsung berubah.", answerEn: "No sooner had we signed the contract than the import regulations changed.", note: "Pola C1: 'No sooner had + S + V3 + than + S + V2'." },
            { promptId: "Hanya setelah mengaudit kode sumbernya kami menemukan kebocoran memori tersebut.", answerEn: "Only after auditing the source code did we discover the memory leak.", note: "Ketika 'Only after...' ditaruh di depan, klausa utama wajib diinversi: 'did we discover'." }
          ]
        },
        {
          unitCode: "C1.2",
          title: "Nominalization & Kepadatan Informasi (Lexical Density)",
          summary: "Memadatkan klausa panjang yang bertele-tele menjadi frasa benda akademik/eksekutif yang ringkas.",
          keyRule: "Ubah kata kerja (verbs) dan kata sifat (adjectives) menjadi kata benda abstrak (nouns) untuk meningkatkan kepadatan informasi dalam laporan tertulis.",
          drills: [
            { promptId: "Ubah ke C1: 'Because the currency fluctuated wildly, investors hesitated to commit capital.'", answerEn: "Severe currency volatility triggered investor reluctance to commit capital.", note: "'Because the currency fluctuated wildly' dipadatkan menjadi 'Severe currency volatility'." },
            { promptId: "Ubah ke C1: 'We need to make sure that all departments comply with the new data privacy law.'", answerEn: "Cross-departmental compliance with the new data privacy legislation is mandatory.", note: "Lebih tegas, ringkas, dan berwibawa untuk dokumen kebijakan." }
          ]
        },
        {
          unitCode: "C1.3",
          title: "Participle Clauses (Reducing Relative & Adverbial Clauses)",
          summary: "Menggabungkan sebab-akibat dan aksi simultan menggunakan Present Participle (V-ing) dan Past Participle (V3 / Having + V3).",
          keyRule: "Pastikan subjek pada Participle Clause sama dengan subjek pada klausa utama agar tidak terjadi Dangling Modifier.",
          drills: [
            { promptId: "Setelah mengamankan pendanaan Seri B, perusahaan tersebut mempercepat ekspansi regionalnya.", answerEn: "Having secured Series B funding, the company accelerated its regional expansion.", note: "'Having + V3' menegaskan aksi pertama tuntas sebelum aksi kedua dimulai." },
            { promptId: "Jika dilihat dari perspektif makroekonomi, kebijakan tersebut sangat rasional.", answerEn: "Viewed from a macroeconomic perspective, the policy is highly rational.", note: "Past participle 'Viewed' menggantikan 'If it is viewed'." }
          ]
        }
      ],
      dialogue: {
        context: "Rapat Dewan Direksi: Akuisisi Strategis & Alokasi Modal",
        lines: [
          { speaker: "Chairman", en: "Seldom have we encountered an acquisition target with such strong proprietary technology at a distressed valuation.", id: "Jarang sekali kita menemukan target akuisisi dengan teknologi paten sekuat ini pada valuasi diskon." },
          { speaker: "CFO", en: "What concerns me is not their technology stack, but the contingent liabilities hidden in their offshore subsidiaries.", id: "Yang menjadi perhatian saya bukanlah arsitektur teknologi mereka, melainkan kewajiban kontinjensi yang tersembunyi di anak perusahaan luar negeri mereka." },
          { speaker: "General Counsel", en: "It is imperative that the definitive agreement include a full indemnification clause before any earnest money is released.", id: "Sangat mutlak bahwa perjanjian definitif mencantumkan klausul ganti rugi penuh sebelum uang tanda jadi dicairkan." }
        ]
      }
    },
    {
      id: "C2",
      code: "C2",
      name: "Rhetorical Mastery, Prosody, & Native Nuance",
      indonesianTitle: "Penguasaan Retorika Puncak, Prosodi, & Diplomasi Krisis",
      targetWords: 10000,
      studyWeeks: "Penguasaan Berkelanjutan",
      coreFocus: "Menguasai perubahan makna lewat tekanan suara (Prosodic Nuclear Stress), kehalusan diplomasi (Pragmatic Hedging & Understatement), pergeseran register instan (Legal/Boardroom vs Idiomatic Native), dan retorika debat.",
      contrastiveInsight: {
        title: "Rahasia Penguasaan Puncak Level C2",
        indonesianPattern: "Menerjemahkan kata secara harfiah tanpa membaca subteks budaya dan intonasi.",
        wrongEnglish: "Your idea has many problems and will fail.",
        correctEnglish: "While the strategic intent is sound, the execution assumptions may prove somewhat optimistic under stress.",
        explanation: "Di level C2, tata bahasa bukan lagi sekadar benar atau salah, melainkan instrumen kekuasaan dan presisi psikologis. Penutur level C2 mampu menyampaikan kritik paling tajam dengan kemasan kalimat yang tenang, terukur, dan tak terbantahkan."
      },
      formulas: [
        {
          label: "Pragmatic Hedging & Litotes (Understatement Strategis)",
          syntax: "Qualifiers (somewhat, arguably, bound to, appears to warrant) + Litotes (not entirely unfounded, less than ideal)",
          exampleEn: "The counterparty's valuation model is not entirely grounded in empirical cash flows.",
          exampleId: "Model valuasi pihak lawan tidak sepenuhnya berpijak pada arus kas empiris (Cara elegan mengatakan: 'Valuasi mereka mengada-ada')."
        },
        {
          label: "Prosodic Stress Shift (Manipulasi Makna Tanpa Mengubah Kata)",
          syntax: "Menempatkan Nuclear Pitch Accent pada kata spesifik untuk membatalkan asumsi lawan bicara",
          exampleEn: "I never said SHE stole my money (berarti orang lain yang mencuri) vs I never said she STOLE my money (berarti dia hanya meminjamnya).",
          exampleId: "Satu kalimat 7 kata menghasilkan 7 proposisi logika yang berbeda tergantung kata mana yang ditekan suaranya."
        },
        {
          label: "Concessive Rebuttal Structure (Mematahkan Argumen Lawan secara Elegan)",
          syntax: "Much as / Notwithstanding [Klausa Lawan], the empirical reality remains that [Argumen Inti]",
          exampleEn: "Much as we appreciate the speed of the proposed rollout, the regulatory exposure remains unacceptable.",
          exampleId: "Meskipun kami sangat menghargai kecepatan peluncuran yang diusulkan, eksposur risiko regulasinya tetap tidak dapat diterima."
        }
      ],
      modules: [
        {
          unitCode: "C2.1",
          title: "Prosodic Nuclear Stress: 1 Kalimat, 7 Makna Berbeda",
          summary: "Mengontrol intonasi dan tekanan kata untuk menyisipkan makna tersirat (implicature) tanpa menambah kata.",
          keyRule: "Kata yang menerima tekanan nada tertinggi (Nuclear Stress) di dalam kalimat bahasa Inggris secara otomatis mengaktifkan himpunan kontras terhadap kata tersebut.",
          drills: [
            { promptId: "Tekankan kata 'MY' pada: 'I never said she stole MY money.' Apa maknanya?", answerEn: "She stole someone else's money, not mine.", note: "Fokus kontras jatuh pada kepemilikan uang tersebut." },
            { promptId: "Tekankan kata 'SAID' pada: 'I never SAID she stole my money.' Apa maknanya?", answerEn: "I may have implied or written it, but I never spoke those words aloud.", note: "Fokus kontras jatuh pada medium komunikasi." }
          ]
        },
        {
          unitCode: "C2.2",
          title: "Register Shifting: Dari Bahasa Kasar ke Diplomasi Ruang Direksi",
          summary: "Mengubah pernyataan konfrontatif menjadi kalimat negosiasi tingkat tinggi tanpa kehilangan ketegasannya.",
          keyRule: "Gunakan struktur Concessive ('While X merits consideration, Y warrants immediate scrutiny') untuk mengambil alih kendali percakapan tanpa memicu pertahanan emosional lawan bicara.",
          drills: [
            { promptId: "Ubah ke Register Direksi (C2): 'Angka proyeksi penjualan Anda tidak masuk akal.'", answerEn: "Your revenue projections appear to rely on rather heroic conversion assumptions.", note: "Frasa 'heroic assumptions' adalah idiom finansial C2 untuk menyebut asumsi yang terlalu muluk." },
            { promptId: "Ubah ke Register Direksi (C2): 'Kami menolak memberikan diskon lagi.'", answerEn: "Our current pricing structure already reflects the maximum commercial concession we can extend.", note: "Menutup ruang tawar-menawar secara final namun sangat berkelas." }
          ]
        },
        {
          unitCode: "C2.3",
          title: "Advanced Collocations & Idiomatic Precision",
          summary: "Menggunakan pasangan kata alami (collocations) yang membedakan penutur fasih dari penutur yang menerjemahkan kamus.",
          keyRule: "Kata yang artinya mirip di kamus belum tentu bisa saling menggantikan: kita mengatakan 'unanimous consensus' (bukan 'complete consensus'), 'mitigate risk' (bukan 'shrink risk'), dan 'honour a commitment'.",
          drills: [
            { promptId: "Kebijakan baru tersebut memicu perdebatan sengit di kalangan pemegang saham.", answerEn: "The new policy sparked a heated debate among shareholders.", note: "Kolokasi alami: 'spark a heated debate'." },
            { promptId: "Perjanjian ini menjadi preseden berbahaya bagi negosiasi masa depan.", answerEn: "This agreement sets a dangerous precedent for future negotiations.", note: "Kolokasi hukum/bisnis: 'set a dangerous precedent'." }
          ]
        }
      ],
      dialogue: {
        context: "Negosiasi Krisis Lintas Negara & Restrukturisasi",
        lines: [
          { speaker: "Lead Negotiator", en: "Much as we recognize the macroeconomic headwinds your division faced in Q3, a covenant breach of this magnitude cannot go unaddressed.", id: "Meskipun kami memahami tekanan makroekonomi yang dihadapi divisi Anda di kuartal ketiga, pelanggaran kovenan sebesar ini tidak bisa dibiarkan begitu saja." },
          { speaker: "Counterparty CEO", en: "We are by no means downplaying the shortfall. What we are proposing is a ninety-day standstill agreement while the asset divestiture closes.", id: "Kami sama sekali tidak meremehkan kekurangan tersebut. Yang kami usulkan adalah perjanjian penangguhan sembilan puluh hari selagi divestasi aset diselesaikan." },
          { speaker: "Lead Negotiator", en: "Provided that the divestiture proceeds are ring-fenced in escrow, the syndicate is prepared to grant a conditional waiver.", id: "Dengan syarat hasil divestasi tersebut dikunci di dalam rekening escrow, sindikasi kreditur bersedia memberikan pengecualian bersyarat." }
        ]
      }
    }
  ],

  tenseMatrix: {
    propositions: [
      {
        id: "audit",
        label: "Bisnis: Mengaudit Laporan Keuangan",
        subjectSing: "She",
        subjectPlur: "We",
        baseVerb: "audit",
        verbS: "audits",
        verbPast: "audited",
        verbParticiple: "audited",
        verbIng: "auditing",
        object: "the financial statements"
      },
      {
        id: "deploy",
        label: "Teknologi: Meluncurkan Arsitektur Server",
        subjectSing: "The engineer",
        subjectPlur: "Our engineers",
        baseVerb: "deploy",
        verbS: "deploys",
        verbPast: "deployed",
        verbParticiple: "deployed",
        verbIng: "deploying",
        object: "the cloud cluster"
      },
      {
        id: "negotiate",
        label: "Eksekutif: Menegosiasikan Kontrak Ekspor",
        subjectSing: "The director",
        subjectPlur: "They",
        baseVerb: "negotiate",
        verbS: "negotiates",
        verbPast: "negotiated",
        verbParticiple: "negotiated",
        verbIng: "negotiating",
        object: "the export contract"
      },
      {
        id: "write",
        label: "Irregular Verb: Menulis Dokumentasi Sistem",
        subjectSing: "He",
        subjectPlur: "I",
        baseVerb: "write",
        verbS: "writes",
        verbPast: "wrote",
        verbParticiple: "written",
        verbIng: "writing",
        object: "the system documentation"
      },
      {
        id: "invest",
        label: "Keuangan Syariah & Investasi: Menyalurkan Modal Saham",
        subjectSing: "The fund manager",
        subjectPlur: "We",
        baseVerb: "invest",
        verbS: "invests",
        verbPast: "invested",
        verbParticiple: "invested",
        verbIng: "investing",
        object: "in ethical sharia equities"
      },
      {
        id: "manage",
        label: "Regulasi & Kepatuhan Hukum: Mengelola Izin Edar",
        subjectSing: "The compliance officer",
        subjectPlur: "Our legal teams",
        baseVerb: "manage",
        verbS: "manages",
        verbPast: "managed",
        verbParticiple: "managed",
        verbIng: "managing",
        object: "the statutory distribution permits"
      },
      {
        id: "export",
        label: "Perdagangan Internasional: Mengekspor Komoditas Kemiri",
        subjectSing: "The cooperative",
        subjectPlur: "They",
        baseVerb: "export",
        verbS: "exports",
        verbPast: "exported",
        verbParticiple: "exported",
        verbIng: "exporting",
        object: "high-grade candlenut to overseas buyers"
      },
      {
        id: "analyze",
        label: "Riset & Akademisi: Menganalisis Data Inflasi Global",
        subjectSing: "The economist",
        subjectPlur: "We",
        baseVerb: "analyze",
        verbS: "analyzes",
        verbPast: "analyzed",
        verbParticiple: "analyzed",
        verbIng: "analyzing",
        object: "the macroeconomic inflation datasets"
      },
      {
        id: "build",
        label: "Industri & Logistik: Membangun Fasilitas Rantai Dingin",
        subjectSing: "The joint venture",
        subjectPlur: "The contractors",
        baseVerb: "build",
        verbS: "builds",
        verbPast: "built",
        verbParticiple: "built",
        verbIng: "building",
        object: "the cold-chain logistics facility"
      },
      {
        id: "speak",
        label: "Diplomasi & Konferensi: Menyampaikan Pidato di Sidang",
        subjectSing: "The ambassador",
        subjectPlur: "Our delegates",
        baseVerb: "speak",
        verbS: "speaks",
        verbPast: "spoke",
        verbParticiple: "spoken",
        verbIng: "speaking",
        object: "at the international summit"
      },
      {
        id: "train",
        label: "AI & Komputasi: Melatih Model Deep Learning",
        subjectSing: "The research team",
        subjectPlur: "The computer scientists",
        baseVerb: "train",
        verbS: "trains",
        verbPast: "trained",
        verbParticiple: "trained",
        verbIng: "training",
        object: "the deep neural network architecture"
      },
      {
        id: "preserve",
        label: "Sejarah & Peradaban: Mendokumentasikan Naskah Kuno",
        subjectSing: "The historian",
        subjectPlur: "The archivists",
        baseVerb: "preserve",
        verbS: "preserves",
        verbPast: "preserved",
        verbParticiple: "preserved",
        verbIng: "preserving",
        object: "the ancient classical manuscripts"
      },
      {
        id: "mentor",
        label: "Kepemimpinan & Karakter: Membimbing Generasi Pemimpin",
        subjectSing: "The senior scholar",
        subjectPlur: "The community leaders",
        baseVerb: "mentor",
        verbS: "mentors",
        verbPast: "mentored",
        verbParticiple: "mentored",
        verbIng: "mentoring",
        object: "the next generation of ethical innovators"
      },
      {
        id: "restore",
        label: "Lingkungan & Ekologi: Memulihkan Ekosistem Gambut Tropis",
        subjectSing: "The environmental agency",
        subjectPlur: "The conservationists",
        baseVerb: "restore",
        verbS: "restores",
        verbPast: "restored",
        verbParticiple: "restored",
        verbIng: "restoring",
        object: "the degraded peatland ecosystem"
      },
      {
        id: "examine",
        label: "Kajian Ulama & Hadis: Mengkaji Matan dan Sanad Hadis",
        subjectSing: "The hadith scholar",
        subjectPlur: "The jurisprudential researchers",
        baseVerb: "examine",
        verbS: "examines",
        verbPast: "examined",
        verbParticiple: "examined",
        verbIng: "examining",
        object: "the chain of narration and text variants"
      }
    ],
    cells: {
      "present-simple": {
        name: "Present Simple",
        cefr: "A1",
        timeAxis: "Present",
        aspectAxis: "Simple",
        formula: "S + V1(s/es) | (-) S + do/does not + V1 | (?) Do/Does + S + V1?",
        mentalModel: "Fakta permanen, hukum alam, jadwal tetap, atau kebiasaan berulang (Routine & Truth).",
        indonesianTrap: "Jangan pernah memasang 'am/is/are' di depan kata kerja aksi (Salah: 'She is audits'). Ingat juga akhiran -s/es untuk subjek tunggal (He/She/It).",
        timeMarkers: ["every week", "consistently", "on Mondays", "as a rule"],
        timelineVisual: "[  x   x   x   NOW   x   x   x  ] (Berulang secara berkala)"
      },
      "present-continuous": {
        name: "Present Continuous",
        cefr: "A2",
        timeAxis: "Present",
        aspectAxis: "Continuous",
        formula: "S + am/is/are + V-ing | (-) S + am/is/are not + V-ing",
        mentalModel: "Aksi yang sedang aktif berlangsung tepat pada detik pembicaraan atau proyek sementara minggu/bulan ini.",
        indonesianTrap: "Sering kelupaan 'am/is/are' dan langsung menulis 'She auditing' (Salah). Kata kerja mental seperti 'know, understand, need' tidak boleh memakai bentuk ini.",
        timeMarkers: ["right now", "at the moment", "currently", "this week"],
        timelineVisual: "[      (~~~~~~ NOW ~~~~~~)      ] (Sedang berlangsung di titik ini)"
      },
      "present-perfect": {
        name: "Present Perfect",
        cefr: "B1",
        timeAxis: "Present",
        aspectAxis: "Perfect",
        formula: "S + have/has + V3 | (-) S + have/has not + V3",
        mentalModel: "Jembatan antara masa lalu dan masa kini: aksi sudah tuntas dilakukan dan DAMPAKNYA terasa/siap sekarang, atau dimulai di masa lalu dan masih berlanjut.",
        indonesianTrap: "Jangan gunakan Present Perfect jika ada keterangan waktu masa lalu yang sudah mati seperti 'yesterday' atau 'in 2022'. Gunakan untuk 'already, just, yet, since, so far'.",
        timeMarkers: ["already", "just", "since Q1", "so far this year"],
        timelineVisual: "[   (DONE) ===========> NOW     ] (Hasilnya terasa di detik ini)"
      },
      "present-perfect-continuous": {
        name: "Present Perfect Continuous",
        cefr: "B2",
        timeAxis: "Present",
        aspectAxis: "Perfect Continuous",
        formula: "S + have/has + been + V-ing",
        mentalModel: "Aksi yang dimulai di masa lalu, terus berjalan tanpa henti, dan masih berlangsung hingga detik ini (menekankan durasi kerja keras).",
        indonesianTrap: "Dalam bahasa Indonesia cukup dikatakan 'Saya sudah mengaudit selama 3 jam'. Dalam bahasa Inggris, jika sekarang masih lanjut mengaudit, wajib 'have been auditing'.",
        timeMarkers: ["for three hours", "since 8 AM", "all morning", "for the past two weeks"],
        timelineVisual: "[   START ~~~~~~~~~~~~~> NOW... ] (Mulai dulu, masih jalan sekarang)"
      },
      "past-simple": {
        name: "Past Simple",
        cefr: "A2",
        timeAxis: "Past",
        aspectAxis: "Simple",
        formula: "S + V2 | (-) S + did not + V1 | (?) Did + S + V1?",
        mentalModel: "Kejadian yang dimulai dan sudah selesai sepenuhnya di satu titik waktu masa lampau yang spesifik.",
        indonesianTrap: "Saat kalimat berubah menjadi negatif ('did not') atau tanya ('Did...?'), kata kerja WAJIB kembali ke V1 murni (bukan V2).",
        timeMarkers: ["yesterday", "last Friday", "two days ago", "in 2024"],
        timelineVisual: "[    (X: PAST)    |     NOW     ] (Terputus dari masa kini)"
      },
      "past-continuous": {
        name: "Past Continuous",
        cefr: "B1",
        timeAxis: "Past",
        aspectAxis: "Continuous",
        formula: "S + was/were + V-ing",
        mentalModel: "Aksi yang sedang berada di tengah-tengah proses pada jam tertentu di masa lalu, atau sedang berjalan ketika kejadian lain (V2) menyela.",
        indonesianTrap: "Pastikan subjek tunggal (I/He/She/It) memakai 'was', sedangkan subjek jamak (You/We/They) memakai 'were'.",
        timeMarkers: ["at 9 PM last night", "when the client called", "while the server was rebooting"],
        timelineVisual: "[  (~~~ PAST ~~~) |     NOW     ] (Sedang berjalan di titik lampau)"
      },
      "past-perfect": {
        name: "Past Perfect",
        cefr: "B2",
        timeAxis: "Past",
        aspectAxis: "Perfect",
        formula: "S + had + V3",
        mentalModel: "Masa lalunya masa lalu (The Past before the Past): aksi yang sudah tuntas SEBELUM kejadian masa lalu lainnya terjadi.",
        indonesianTrap: "Jangan memakai 'had + V3' hanya karena kejadiannya sudah lama sekali. Gunakan 'had + V3' hanya jika ada patokan waktu masa lalu kedua sebagai pembanding.",
        timeMarkers: ["before the deadline passed", "by the time the CEO arrived", "prior to the merger"],
        timelineVisual: "[ (1st: HAD V3) -> (2nd: V2) | NOW ] (Tuntas sebelum titik lampau ke-2)"
      },
      "past-perfect-continuous": {
        name: "Past Perfect Continuous",
        cefr: "B2",
        timeAxis: "Past",
        aspectAxis: "Perfect Continuous",
        formula: "S + had + been + V-ing",
        mentalModel: "Menekankan berapa lama suatu proses sudah berlangsung di masa lalu sebelum akhirnya dihentikan atau disela oleh kejadian masa lalu lain.",
        indonesianTrap: "Sering tertukar dengan Past Continuous biasa. Jika ada durasi ('for six hours') sebelum kejadian lampau kedua, wajib memakai 'had been + V-ing'.",
        timeMarkers: ["for four hours before the outage", "for months prior to the audit"],
        timelineVisual: "[ (~~~~ 4 Hours ~~~>) (V2) | NOW ] (Durasi sebelum titik lampau ke-2)"
      },
      "future-simple": {
        name: "Future Simple",
        cefr: "A2",
        timeAxis: "Future",
        aspectAxis: "Simple",
        formula: "S + will + V1 | (-) S + will not (won't) + V1",
        mentalModel: "Keputusan spontan saat berbicara, janji komitmen, atau prediksi masa depan.",
        indonesianTrap: "Setelah modal 'will', kata kerja harus selalu berbentuk V1 murni tanpa tambahan 'to', '-s', atau '-ing' (Salah: 'She will audits' atau 'will to audit').",
        timeMarkers: ["tomorrow", "next week", "shortly", "as soon as possible"],
        timelineVisual: "[      NOW      |    (X: FUTURE) ] (Titik di masa depan)"
      },
      "future-continuous": {
        name: "Future Continuous",
        cefr: "B1",
        timeAxis: "Future",
        aspectAxis: "Continuous",
        formula: "S + will + be + V-ing",
        mentalModel: "Aksi yang dipastikan sedang berada di tengah proses pada jam atau momen spesifik di masa depan.",
        indonesianTrap: "Jangan lupakan kata 'be' di antara 'will' dan 'V-ing' ('will be auditing', bukan 'will auditing').",
        timeMarkers: ["at 10 AM tomorrow", "this time next week", "during the Q4 summit"],
        timelineVisual: "[      NOW      | (~~~ FUTURE ~~~) ] (Sedang berlangsung di masa depan)"
      },
      "future-perfect": {
        name: "Future Perfect",
        cefr: "B2",
        timeAxis: "Future",
        aspectAxis: "Perfect",
        formula: "S + will + have + V3",
        mentalModel: "Proyeksi masa depan: aksi yang dipastikan SUDAH TUNTAS sebelum tenggat waktu tertentu di masa depan.",
        indonesianTrap: "Bahkan untuk subjek tunggal (She/He), setelah 'will' selalu gunakan 'have' ('She will have audited', BUKAN 'She will has audited').",
        timeMarkers: ["by Friday", "by the end of Q4", "before the market opens tomorrow"],
        timelineVisual: "[      NOW      | (DONE) <= DEADLINE ] (Tuntas sebelum batas waktu depan)"
      },
      "future-perfect-continuous": {
        name: "Future Perfect Continuous",
        cefr: "C1",
        timeAxis: "Future",
        aspectAxis: "Perfect Continuous",
        formula: "S + will + have + been + V-ing",
        mentalModel: "Menghitung total akumulasi durasi suatu aksi yang masih berjalan ketika mencapai satu titik waktu di masa depan.",
        indonesianTrap: "Digunakan untuk menekankan milestone durasi di masa depan (misal: 'Pada bulan Desember nanti, saya akan sudah bekerja di sini selama 10 tahun').",
        timeMarkers: ["for six hours by 5 PM", "for a decade by next June"],
        timelineVisual: "[      NOW ~~~~~~~~~~~~> MILESTONE ] (Akumulasi durasi di titik depan)"
      }
    }
  },

  srsDeck: [
    {
      id: "voc-01",
      level: "A1",
      category: "Core Syntax & Survival",
      term: "available",
      ipa: "/əˈveɪ.lə.bəl/",
      partOfSpeech: "adjective",
      meaningId: "Tersedia / memiliki waktu luang (untuk jadwal orang atau stok barang)",
      definitionEn: "Able to be used, obtained, or reached; free to do something.",
      exampleEn: "Are you available for a quick fifteen-minute alignment call at 2 PM?",
      exampleId: "Apakah Anda memiliki waktu luang untuk panggilan penyelarasan singkat 15 menit pukul 2 siang?",
      collocations: ["readily available", "available slot", "make available"]
    },
    {
      id: "voc-02",
      level: "A1",
      category: "Core Syntax & Survival",
      term: "confirm",
      ipa: "/kənˈfɜːm/",
      partOfSpeech: "verb",
      meaningId: "Memastikan / mengonfirmasi kebenaran atau jadwal",
      definitionEn: "To establish the truth or correctness of something; to make a tentative arrangement definite.",
      exampleEn: "Please confirm the delivery address before our courier dispatches the parcel.",
      exampleId: "Mohon konfirmasi alamat pengiriman sebelum kurir kami memberangkatkan paketnya.",
      collocations: ["confirm receipt", "officially confirm", "written confirmation"]
    },
    {
      id: "voc-03",
      level: "A1",
      category: "Core Syntax & Survival",
      term: "schedule",
      ipa: "/ˈskedʒ.uːl/",
      partOfSpeech: "noun / verb",
      meaningId: "Jadwal / menjadwalkan rencana kegiatan",
      definitionEn: "A plan for carrying out a process or procedure, giving lists of intended events and times.",
      exampleEn: "Everything is running ahead of schedule thanks to the morning preparation.",
      exampleId: "Semuanya berjalan lebih cepat dari jadwal berkat persiapan pagi tadi.",
      collocations: ["ahead of schedule", "behind schedule", "tight schedule"]
    },
    {
      id: "voc-04",
      level: "A2",
      category: "Temporal & Daily Business",
      term: "postpone",
      ipa: "/poʊstˈpoʊn/",
      partOfSpeech: "verb",
      meaningId: "Menunda kegiatan ke waktu yang lebih lambat (diikuti V-ing jika ada kata kerja)",
      definitionEn: "To arrange for something to take place at a time later than that first scheduled.",
      exampleEn: "We had to postpone launching the campaign until the legal review was complete.",
      exampleId: "Kami terpaksa menunda peluncuran kampanye hingga tinjauan hukum selesai.",
      collocations: ["postpone indefinitely", "postpone a decision", "put off"]
    },
    {
      id: "voc-05",
      level: "A2",
      category: "Temporal & Daily Business",
      term: "accurate",
      ipa: "/ˈæk.jɚ.ət/",
      partOfSpeech: "adjective",
      meaningId: "Tepat / akurat sesuai fakta dan bebas dari kesalahan perhitungan",
      definitionEn: "Correct in all details; exact and free from error.",
      exampleEn: "Make sure the inventory count is completely accurate before closing the warehouse.",
      exampleId: "Pastikan hitungan inventaris benar-benar akurat sebelum menutup gudang.",
      collocations: ["highly accurate", "accurate assessment", "pinpoint accuracy"]
    },
    {
      id: "voc-06",
      level: "A2",
      category: "Temporal & Daily Business",
      term: "look into",
      ipa: "/ˈlʊk ˌɪn.tuː/",
      partOfSpeech: "phrasal verb",
      meaningId: "Menyelidiki / memeriksa suatu masalah secara mendalam (investigate)",
      definitionEn: "To investigate or examine the facts about a problem or situation.",
      exampleEn: "Our billing specialist is looking into the discrepancy on your October invoice.",
      exampleId: "Spesialis penagihan kami sedang memeriksa selisih pada faktur bulan Oktober Anda.",
      collocations: ["look into the matter", "look closely into", "investigate"]
    },
    {
      id: "voc-07",
      level: "B1",
      category: "Operational & Professional",
      term: "bottleneck",
      ipa: "/ˈbɑː.təl.nek/",
      partOfSpeech: "noun",
      meaningId: "Titik sumbatan / hambatan utama yang memperlambat seluruh rantai proses",
      definitionEn: "A point of congestion in a system that slows down or halts the overall workflow.",
      exampleEn: "Manual customs clearance has become the primary bottleneck in our supply chain.",
      exampleId: "Pemeriksaan bea cukai manual telah menjadi titik sumbatan utama dalam rantai pasok kami.",
      collocations: ["eliminate a bottleneck", "production bottleneck", "identify bottlenecks"]
    },
    {
      id: "voc-08",
      level: "B1",
      category: "Operational & Professional",
      term: "feasible",
      ipa: "/ˈfiː.zə.bəl/",
      partOfSpeech: "adjective",
      meaningId: "Layak / mungkin dikerjakan secara praktis, teknis, dan finansial",
      definitionEn: "Possible to do easily or conveniently; achievable under current constraints.",
      exampleEn: "Is it economically feasible to manufacture these components locally?",
      exampleId: "Apakah layak secara ekonomi untuk memproduksi komponen-komponen ini di dalam negeri?",
      collocations: ["economically feasible", "technically feasible", "feasibility study"]
    },
    {
      id: "voc-09",
      level: "B1",
      category: "Operational & Professional",
      term: "follow through",
      ipa: "/ˈfɑː.loʊ θruː/",
      partOfSpeech: "phrasal verb",
      meaningId: "Menuntaskan janji atau rencana aksi sampai benar-benar selesai",
      definitionEn: "To continue an action or plan to its complete conclusion.",
      exampleEn: "Great strategies fail when teams do not follow through on daily execution.",
      exampleId: "Strategi hebat gagal ketika tim tidak menuntaskan eksekusi harian sampai selesai.",
      collocations: ["follow through on a promise", "consistent follow-through"]
    },
    {
      id: "voc-10",
      level: "B2",
      category: "Executive & Analytical",
      term: "mitigate",
      ipa: "/ˈmɪt.ə.ɡeɪt/",
      partOfSpeech: "verb",
      meaningId: "Meradam / mengurangi dampak buruk, keparahan, atau risiko",
      definitionEn: "To make something bad less severe, serious, or painful.",
      exampleEn: "Diversifying our supplier base across three provinces will mitigate disruption risks.",
      exampleId: "Mendiversifikasi basis pemasok kita di tiga provinsi akan meredam risiko gangguan pasokan.",
      collocations: ["mitigate risk", "mitigating factors", "risk mitigation"]
    },
    {
      id: "voc-11",
      level: "B2",
      category: "Executive & Analytical",
      term: "leverage",
      ipa: "/ˈlev.ər.ɪdʒ/",
      partOfSpeech: "noun / verb",
      meaningId: "Daya ungkit strategis / memanfaatkan aset secara maksimal untuk hasil berlipat",
      definitionEn: "To use something that you already have in order to achieve something new or better; strategic bargaining power.",
      exampleEn: "We can leverage our existing distribution network to launch the new product line at minimal cost.",
      exampleId: "Kita dapat memanfaatkan daya ungkit jaringan distribusi yang sudah ada untuk meluncurkan lini produk baru dengan biaya minimal.",
      collocations: ["strategic leverage", "leverage existing assets", "negotiating leverage"]
    },
    {
      id: "voc-12",
      level: "B2",
      category: "Executive & Analytical",
      term: "contingent on",
      ipa: "/kənˈtɪn.dʒənt ɑːn/",
      partOfSpeech: "adjective phrase",
      meaningId: "Bergantung sepenuhnya pada syarat tertentu yang harus terpenuhi lebih dulu",
      definitionEn: "Depending on something else that might or might not happen in the future.",
      exampleEn: "The second tranche of funding is contingent on achieving positive unit economics.",
      exampleId: "Pencairan pendanaan tahap kedua bergantung pada tercapainya ekonomi unit yang positif.",
      collocations: ["contingent upon approval", "contingent liability", "strictly contingent"]
    },
    {
      id: "voc-13",
      level: "C1",
      category: "Rhetorical & Boardroom",
      term: "scrutiny",
      ipa: "/ˈskruː.tən.i/",
      partOfSpeech: "noun",
      meaningId: "Pemeriksaan / pengawasan kritis yang sangat teliti dan mendalam",
      definitionEn: "Critical observation or examination of every detail.",
      exampleEn: "Cross-border capital flows are coming under intense regulatory scrutiny this quarter.",
      exampleId: "Arus modal lintas negara sedang berada di bawah pengawasan regulasi yang sangat ketat kuartal ini.",
      collocations: ["under close scrutiny", "withstand scrutiny", "public scrutiny"]
    },
    {
      id: "voc-14",
      level: "C1",
      category: "Rhetorical & Boardroom",
      term: "unprecedented",
      ipa: "/ʌnˈpres.ə.den.tɪd/",
      partOfSpeech: "adjective",
      meaningId: "Belum pernah terjadi atau ada presedennya sepanjang sejarah sebelumnya",
      definitionEn: "Never done or known before in history.",
      exampleEn: "The central bank intervened with unprecedented speed to stabilize the bond market.",
      exampleId: "Bank sentral melakukan intervensi dengan kecepatan yang belum pernah terjadi sebelumnya untuk menstabilkan pasar obligasi.",
      collocations: ["unprecedented scale", "unprecedented demand", "historically unprecedented"]
    },
    {
      id: "voc-15",
      level: "C1",
      category: "Rhetorical & Boardroom",
      term: "imperative",
      ipa: "/ɪmˈper.ə.tɪv/",
      partOfSpeech: "adjective / noun",
      meaningId: "Sangat mendesak dan mutlak wajib dilakukan (memicu pola Subjunctive)",
      definitionEn: "Of vital importance; crucial and commanding immediate action.",
      exampleEn: "It is imperative that we shore up our liquidity reserves before the credit cycle tightens.",
      exampleId: "Sangat mutlak bagi kita untuk memperkuat cadangan likuiditas sebelum siklus kredit mengetat.",
      collocations: ["strategic imperative", "moral imperative", "it is imperative that"]
    },
    {
      id: "voc-16",
      level: "C2",
      category: "Mastery & Diplomacy",
      term: "notwithstanding",
      ipa: "/ˌnɑːt.wɪθˈstæn.dɪŋ/",
      partOfSpeech: "preposition / adverb",
      meaningId: "Terlepas dari / meskipun adanya hambatan tersebut (bahasa hukum & eksekutif puncak)",
      definitionEn: "In spite of; without being prevented by the factor just mentioned.",
      exampleEn: "Notwithstanding the short-term tariff headwinds, our long-term export thesis remains intact.",
      exampleId: "Terlepas dari hambatan tarif jangka pendek, tesis ekspor jangka panjang kami tetap utuh.",
      collocations: ["notwithstanding the above", "obstacles notwithstanding", "anything to the contrary notwithstanding"]
    },
    {
      id: "voc-17",
      level: "C2",
      category: "Mastery & Diplomacy",
      term: "commensurate",
      ipa: "/kəˈmen.sər.ət/",
      partOfSpeech: "adjective",
      meaningId: "Sebanding / setara secara proporsional (selalu berpasangan dengan 'with')",
      definitionEn: "Corresponding in size, degree, or quality; proportional.",
      exampleEn: "Executive compensation must be strictly commensurate with audited long-term shareholder returns.",
      exampleId: "Kompensasi eksekutif harus benar-benar sebanding dengan imbal hasil pemegang saham jangka panjang yang teraudit.",
      collocations: ["commensurate with experience", "commensurate return", "commensurate risk"]
    },
    {
      id: "voc-18",
      level: "C2",
      category: "Mastery & Diplomacy",
      term: "ring-fence",
      ipa: "/ˈrɪŋ.fens/",
      partOfSpeech: "verb",
      meaningId: "Mengisolasi / memagari dana atau aset agar tidak bisa dipakai untuk keperluan lain",
      definitionEn: "To guarantee that funds allocated for a particular purpose will not be spent on anything else.",
      exampleEn: "The syndicate required that the working capital facility be ring-fenced from the parent company's debt.",
      exampleId: "Sindikasi kreditur mensyaratkan agar fasilitas modal kerja tersebut dipagari secara terpisah dari utang perusahaan induk.",
      collocations: ["ring-fenced assets", "ring-fence the budget", "legally ring-fenced"]
    }
  ],

  prosodicStressWords: [
    {
      index: 0,
      word: "I",
      ipa: "/ˈaɪ/",
      meaningId: "Bukan SAYA yang mengatakannya, melainkan orang lain di kantor ini yang bilang begitu.",
      pragmaticRole: "Subject Contrast (Mengalihkan pelaku pernyataan ke pihak lain)",
      followUpEn: "I never said she stole my money; it was David who made that accusation."
    },
    {
      index: 1,
      word: "never",
      ipa: "/ˈnev.ər/",
      meaningId: "Bantahan mutlak 100%: Saya SAMA SEKALI TIDAK PERNAH mengucapkan hal itu kapan pun.",
      pragmaticRole: "Absolute Negation (Membantah tuduhan bahwa pernyataan itu pernah keluar)",
      followUpEn: "I never said she stole my money, not even once during the entire audit."
    },
    {
      index: 2,
      word: "said",
      ipa: "/ˈsed/",
      meaningId: "Saya tidak pernah MENGUCAPKANNYA secara lisan (mungkin saya hanya menuliskannya di email atau mengisyaratkannya).",
      pragmaticRole: "Verbal Modality Contrast (Membedakan ucapan lisan dari isyarat/tulisan)",
      followUpEn: "I never said she stole my money; I merely pointed out the missing receipt in the ledger."
    },
    {
      index: 3,
      word: "she",
      ipa: "/ˈʃiː/",
      meaningId: "Saya tidak bilang DIA (perempuan itu) yang mencurinya, melainkan orang lain yang melakukannya.",
      pragmaticRole: "Target Agent Contrast (Mengganti tertuduh pelaku pencurian)",
      followUpEn: "I never said she stole my money; I said the external contractor took it."
    },
    {
      index: 4,
      word: "stole",
      ipa: "/ˈstoʊl/",
      meaningId: "Saya tidak bilang dia MENCURINYA; saya hanya bilang dia meminjamnya atau lupa mengembalikannya.",
      pragmaticRole: "Action Severity Contrast (Menurunkan derajat tindakan dari mencuri ke meminjam/salah taruh)",
      followUpEn: "I never said she stole my money; I said she borrowed it without logging the voucher."
    },
    {
      index: 5,
      word: "my",
      ipa: "/ˈmaɪ/",
      meaningId: "Dia memang mencuri uang, tetapi bukan uang SAYA (dia mencuri uang kas perusahaan atau uang orang lain).",
      pragmaticRole: "Possessor Contrast (Mengubah pemilik sah dari objek yang diambil)",
      followUpEn: "I never said she stole my money; she took funds from the petty cash drawer."
    },
    {
      index: 6,
      word: "money.",
      ipa: "/ˈmʌn.i/",
      meaningId: "Dia memang mencuri milik saya, tetapi bukan UANG saya (dia mencuri ide, klien, atau data riset saya).",
      pragmaticRole: "Object Contrast (Mengubah jenis aset yang dicuri)",
      followUpEn: "I never said she stole my money; she copied my proprietary client database."
    }
  ],

  shadowingPrompts: [
    {
      id: "sh-a1",
      level: "A1",
      title: "Survival & First-Impression Clarity",
      sentence: "Our meeting room is on the third floor, right next to the finance division.",
      ipa: "/ˈaʊ.ər ˈmiː.tɪŋ ruːm ɪz ɒn ðə θɜːd flɔːr | raɪt nekst tə ðə ˈfaɪ.næns dɪˈvɪʒ.ən/",
      connectedSpeechNote: "Perhatikan kata 'next to' (/nekst tə/): bunyi /t/ di ujung 'next' menyatu langsung dengan /t/ awal 'to' tanpa jeda (gemination), dan vokal 'to' menyusut menjadi schwa /tə/."
    },
    {
      id: "sh-a2",
      level: "A2",
      title: "Past Action & Temporal Precision",
      sentence: "We signed the distribution agreement yesterday, but they did not include the thermal labels.",
      ipa: "/wi ˈsaɪnd ðə ˌdɪs.trɪˈbjuː.ʃən əˈɡriː.mənt ˈjes.tər.deɪ | bət ðeɪ dɪd nɒt ɪnˈkluːd ðə ˈθɜː.məl ˈleɪ.bəlz/",
      connectedSpeechNote: "Akhiran '-ed' pada 'signed' dibunyikan halus sebagai /d/ (bukan /ɪd/). Kata sambung 'but' direduksi menjadi /bət/."
    },
    {
      id: "sh-b1",
      level: "B1",
      title: "Present Perfect & Operational Impact",
      sentence: "We have reduced customer churn by eighteen percent since we redesigned the onboarding flow.",
      ipa: "/wɪv rɪˈdjuːst ˈkʌs.tə.mər tʃɜːn baɪ ˌeɪˈtiːn pərˈsent sɪns wi ˌriː.dɪˈzaɪnd ði ˈɒn.bɔː.dɪŋ floʊ/",
      connectedSpeechNote: "'We have' menyatu menjadi /wɪv/. Sebelum kata 'onboarding' yang diawali huruf vokal, kata 'the' diucapkan /ði/ (bukan /ðə/) untuk menyambung bunyi /j/ halus."
    },
    {
      id: "sh-b2",
      level: "B2",
      title: "Counterfactual Audit (Third Conditional)",
      sentence: "If the team had run load testing before launch, the server would not have crashed.",
      ipa: "/ɪf ðə ˈtiːm həd ˈrʌn ˈloʊd ˌtes.tɪŋ bɪˈfɔːr ˈlɔːntʃ | ðə ˈsɜː.vər ˈwʊd.ənt əv ˈkræʃt/",
      connectedSpeechNote: "Frasa 'would not have' dalam bicara natural menyusut menjadi /ˈwʊd.ənt.əv/, dan akhiran '-ed' pada 'crashed' berbunyi tajam /t/."
    },
    {
      id: "sh-c1",
      level: "C1",
      title: "Negative Inversion & Executive Authority",
      sentence: "Under no circumstances should confidential client credentials be transmitted over unencrypted channels.",
      ipa: "/ˈʌn.dər ˈnoʊ ˈsɜː.kəm.stæn.sɪz ʃʊd ˌkɒn.fɪˈden.ʃəl ˈklaɪ.ənt krɪˈden.ʃəlz bi trænzˈmɪt.ɪd ˈoʊ.vər ˌʌn.ɪnˈkrɪp.tɪd ˈtʃæn.əlz/",
      connectedSpeechNote: "Beri tekanan tegas pada 'no circumstances' di awal kalimat untuk mengaktifkan wibawa Negative Inversion, lalu jaga artikulasi konsonan akhir pada 'transmitted' dan 'unencrypted'."
    },
    {
      id: "sh-c2",
      level: "C2",
      title: "Boardroom Concessive Rebuttal",
      sentence: "Notwithstanding the short-term tariff headwinds, our long-term export thesis remains intact.",
      ipa: "/ˌnɑːt.wɪθˈstæn.dɪŋ ðə ˈʃɔːrt.tɜːm ˈtær.ɪf ˈhed.wɪndz | ˈaʊ.ər ˈlɔːŋ.tɜːm ˈek.spɔːrt ˈθiː.sɪs rɪˈmeɪnz ɪnˈtækt/",
      connectedSpeechNote: "Jaga transisi bunyi /θ/ (lidah di antara gigi) pada 'notwithstanding' dan 'thesis', lalu sambungkan 'remains intact' menjadi /rɪˈmeɪn.zɪnˈtækt/."
    },
    {
      id: "sh-a1-2",
      level: "A1",
      title: "Daily Workplace Routine & Politeness",
      sentence: "I start work at eight in the morning, and my supervisor checks the shipment report.",
      ipa: "/aɪ stɑːrt wɜːk ət eɪt ɪn ðə ˈmɔː.nɪŋ | ənd maɪ ˈsuː.pər.vaɪ.zər tʃeks ðə ˈʃɪp.mənt rɪˈpɔːrt/",
      connectedSpeechNote: "Kata 'at eight' menyambung mulus menjadi /əˈteɪt/ (flapping/linking /t/ ke vokal), dan 'and' menyusut menjadi /ənd/ atau /ən/."
    },
    {
      id: "sh-a2-2",
      level: "A2",
      title: "Inquiry & Customer Clarification",
      sentence: "Did you send the updated product catalog to our overseas client this morning?",
      ipa: "/dɪd jʊ send ði ʌpˈdeɪ.tɪd ˈprɒd.ʌkt ˈkæt.əl.ɒɡ tə ˈaʊ.ər ˌoʊ.vərˈsiːz ˈklaɪ.ənt ðɪs ˈmɔː.nɪŋ/",
      connectedSpeechNote: "Frasa 'Did you' mengalami asimilasi palatal menjadi /ˈdɪdʒ.uː/ atau /ˈdɪdʒ.jʊ/. Sebelum 'updated' yang berawalan vokal, 'the' berbunyi /ði/."
    },
    {
      id: "sh-b1-2",
      level: "B1",
      title: "Professional Scheduling & Courteous Request",
      sentence: "Could we reschedule our quarterly review meeting to next Thursday afternoon?",
      ipa: "/kəd wi ˌriːˈskedʒ.uːl ˈaʊ.ər ˈkwɔː.tər.li rɪˈvjuː ˈmiː.tɪŋ tə nekst ˈθɜːz.deɪ ˌɑːf.tərˈnuːn/",
      connectedSpeechNote: "Modal verb 'Could' tereduksi menjadi /kəd/, bunyi /t/ pada 'next Thursday' melebur ke frikatif gigi /θ/ tanpa letupan keras."
    },
    {
      id: "sh-b2-2",
      level: "B2",
      title: "Commercial Risk Assessment & Hedging",
      sentence: "Although currency fluctuations affected our gross margin, our supply chain remained resilient.",
      ipa: "/ɔːlˈðoʊ ˈkɜːr.ən.si ˌflʌk.tʃuˈeɪ.ʃənz əˈfek.tɪd ˈaʊ.ər ɡroʊs ˈmɑːr.dʒɪn | ˈaʊ.ər səˈplaɪ tʃeɪn rɪˈmeɪnd rɪˈzɪl.jənt/",
      connectedSpeechNote: "Penekanan ritme jatuh pada suku kata kedua 'fluctu-A-tions' dan 're-SI-lient'. Jaga agar akhiran '-ed' pada 'remained' diucapkan lembut sebagai /d/."
    },
    {
      id: "sh-c1-2",
      level: "C1",
      title: "Strategic Investment & Due Diligence",
      sentence: "Only after the board completed forensic financial audits did the syndicate authorize the capital infusion.",
      ipa: "/ˈoʊn.li ˈæf.tər ðə bɔːrd kəmˈpliː.tɪd fəˈren.zɪk faɪˈnæn.ʃəl ˈɔː.dɪts | dɪd ðə ˈsɪn.dɪ.kət ˈɔː.θə.raɪz ðə ˈkæp.ɪ.təl ɪnˈfjuː.ʒən/",
      connectedSpeechNote: "Inversi 'did the syndicate authorize' membutuhkan intonasi yang tegas dan berwibawa pada 'infusion' (/ɪnˈfjuː.ʒən/)."
    },
    {
      id: "sh-c2-2",
      level: "C2",
      title: "Macroeconomic Policy & Fiduciary Stewardship",
      sentence: "Were the sovereign wealth fund to liquidate its treasury holdings prematurely, market liquidity would evaporate.",
      ipa: "/wɜːr ðə ˈsɒv.rɪn welθ fʌnd tə ˈlɪk.wɪ.deɪt ɪts ˈtreʒ.ər.i ˈhoʊl.dɪŋz ˌpriː.məˈtʃʊər.li | ˈmɑːr.kɪt lɪˈkwɪd.ə.ti wʊd ɪˈvæp.ə.reɪt/",
      connectedSpeechNote: "Struktur inverted conditional 'Were the sovereign...' menggantikan 'If the fund were to...'. Jaga intonasi suspensi di akhir klausa pertama sebelum jatuh definitif pada 'evaporate'."
    },
    {
      id: "sh-a1-3",
      level: "A1",
      title: "Warehouse & Physical Location",
      sentence: "The coffee samples are in the small blue box on the desk.",
      ipa: "/ðə ˈkɒf.i ˈsɑːm.pəlz ɑːr ɪn ðə smɔːl bluː bɒks ɒn ðə desk/",
      connectedSpeechNote: "Urutan kata sifat 'small blue box' mengikuti kaidah OSASCOMP (Ukuran lalu Warna). Perhatikan reduksi 'in the' (/ɪn ðə/) dan 'on the' (/ɒn ðə/)."
    },
    {
      id: "sh-a2-3",
      level: "A2",
      title: "Order & Purchase Follow-up",
      sentence: "We placed an order for five laptops yesterday, and we need the tracking number.",
      ipa: "/wi pleɪst ən ˈɔː.dər fɔːr faɪv ˈlæp.tɒps ˈjes.tər.deɪ | ənd wi niːd ðə ˈtræk.ɪŋ ˈnʌm.bər/",
      connectedSpeechNote: "Akhiran '-ed' pada 'placed' terdengar tajam sebagai /t/ (/pleɪst/). Frasa 'an order' menyambung mulus menjadi /ənˈɔː.dər/."
    },
    {
      id: "sh-b1-3",
      level: "B1",
      title: "Client Clarification & Value Assurance",
      sentence: "We have already tested the software update, so everything is running according to plan.",
      ipa: "/wiv ɔːlˈred.i ˈtes.tɪd ðə ˈsɒft.weər ˈʌp.deɪt | soʊ ˈev.ri.θɪŋ ɪz ˈrʌn.ɪŋ əˈkɔː.dɪŋ tə plæn/",
      connectedSpeechNote: "Kata 'tested' berakhiran /ɪd/ karena kata dasarnya berujung bunyi /t/. Frasa 'everything is' menyambung menjadi /ˈev.ri.θɪŋ.ɪz/."
    },
    {
      id: "sh-b2-3",
      level: "B2",
      title: "Service Level Agreement & Operations",
      sentence: "Had the vendor notified us in advance, we could have averted the logistics delay.",
      ipa: "/hæd ðə ˈven.dər ˈnoʊ.tɪ.faɪd ʌs ɪn ədˈvɑːns | wi kəd əv əˈvɜː.tɪd ðə ləˈdʒɪs.tɪks dɪˈleɪ/",
      connectedSpeechNote: "Bentuk inversi kondisional tipe 3 'Had the vendor...' menggantikan 'If the vendor had...'. Bunyi 'could have' menyusut menjadi /kəd əv/."
    },
    {
      id: "sh-c1-3",
      level: "C1",
      title: "Corporate Governance & Sharia Compliance",
      sentence: "Seldom do sovereign institutional investors commit capital without thorough Sharia governance certification.",
      ipa: "/ˈsel.dəm duː ˈsɒv.rɪn ˌɪn.stɪˈtjuː.ʃən.əl ɪnˈves.tərz kəˈmɪt ˈkæp.ɪ.təl wɪˈðaʊt ˈθʌr.ə ʃəˈriː.ə ˈɡʌv.ər.nəns ˌsɜː.tɪ.fɪˈkeɪ.ʃən/",
      connectedSpeechNote: "Negative inversion diawali adverbia 'Seldom' yang memicu inversi kata bantu 'do sovereign investors'. Beri intonasi elegan dan artikulasi jelas pada 'certification'."
    },
    {
      id: "sh-c2-3",
      level: "C2",
      title: "Diplomatic Statecraft & Geopolitical Moats",
      sentence: "Scarcely had the multilateral treaty been signed when regional stakeholders mobilized strategic infrastructure assets.",
      ipa: "/ˈskeəs.li həd ðə ˌmʌl.tiˈlæt.ər.əl ˈtriː.ti biːn saɪnd wen ˈriː.dʒən.əl ˈsteɪkˌhoʊl.dərz ˈmoʊ.bə.laɪzd strəˈtiː.dʒɪk ˈɪn.frəˌstrʌk.tʃər ˈæs.ets/",
      connectedSpeechNote: "Korelatif 'Scarcely... when' adalah puncak ekspresi formal mother tongue level. Pertahankan jeda ritmis sebelum konjungsi 'when' dan jaga kestabilan nada suara."
    }
  ],

  intonationContours: [
    {
      id: "inton-falling",
      name: "Falling Intonation (Intonasi Menurun)",
      symbol: "↘",
      usage: "Dipakai untuk pernyataan fakta, kalimat perintah (imperative), dan pertanyaan Wh- (What, Where, Why, How). Menandakan kepastian, ketuntasan pikiran, dan wibawa.",
      exampleEn: "Where did you file the regulatory compliance dossier? ↘",
      exampleId: "Di mana Anda mengarsipkan berkas kepatuhan regulasi tersebut?",
      practiceSentence: "The export contract was officially finalized yesterday afternoon.",
      note: "Turunkan nada suara pada kata kunci terakhir (yesterday afternoon) untuk menunjukkan bahwa informasi sudah lengkap dan tuntas."
    },
    {
      id: "inton-rising",
      name: "Rising Intonation (Intonasi Menaik)",
      symbol: "↗",
      usage: "Dipakai untuk pertanyaan Yes/No, permintaan konfirmasi sopan, dan pengulangan untuk memastikan maksud lawan bicara. Menandakan keterbukaan dan kesantunan.",
      exampleEn: "Are you planning to attend the international trade summit? ↗",
      exampleId: "Apakah Anda berencana menghadiri pertemuan dagang internasional itu?",
      practiceSentence: "Could you send over the updated price list before Friday?",
      note: "Naikkan nada suara di akhir kalimat (Friday ↗) agar terdengar ramah dan mengundang jawaban lawan bicara."
    },
    {
      id: "inton-fall-rise",
      name: "Fall-Rise Intonation (Intonasi Turun-Naik)",
      symbol: "↘↗",
      usage: "Ciri khas penutur C1/C2 untuk menyampaikan keberatan secara halus, ketidakpastian diplomatis, atau menyatakan persetujuan bersyarat tanpa menyinggung lawan bicara.",
      exampleEn: "The proposal is comprehensive, but the delivery deadline seems tight... ↘↗",
      exampleId: "Proposalnya komprehensif, tetapi batas waktu pengirimannya agak mepet...",
      practiceSentence: "I understand your perspective, though the financial risk remains significant.",
      note: "Turunkan nada pada kata kunci pertama lalu naikkan sedikit di ujung untuk memberi sinyal bahwa ada pertimbangan lain yang perlu didiskusikan."
    },
    {
      id: "inton-rise-fall",
      name: "Rise-Fall Intonation (Intonasi Naik-Turun)",
      symbol: "↗↘",
      usage: "Dipakai untuk mengungkapkan keyakinan mutlak (conviction), pujian tulus, atau kekaguman mendalam pada hasil kerja.",
      exampleEn: "That was an absolutely brilliant presentation! ↗↘",
      exampleId: "Itu tadi presentasi yang benar-benar luar biasa!",
      practiceSentence: "We achieved complete operational consensus across all divisions.",
      note: "Lonjakkan nada suara di suku kata yang mendapat tekanan (con-SEN-sus) lalu jatuhkan secara mantap untuk menegaskan keyakinan."
    }
  ],

  diagnosticQuiz: [
    {
      id: "q-01",
      level: "A1",
      topic: "Copula Be vs Action Verb",
      question: "Pilih kalimat yang 100% benar secara tata bahasa untuk menyatakan persetujuan:",
      options: [
        "I am completely agree with your proposal.",
        "I completely agree with your proposal.",
        "I am agree completely with your proposal.",
        "I does agree with your proposal."
      ],
      correctIndex: 1,
      explanation: "'Agree' adalah kata kerja aksi murni (Verb), bukan kata sifat (Adjective). Oleh karena itu, dilarang memasang 'am/is/are' di depannya. Cukup 'Subject + Adverb + V1': 'I completely agree with your proposal.'"
    },
    {
      id: "q-02",
      level: "A1",
      topic: "Uncountable Nouns & Agreement",
      question: "Manakah kalimat yang tepat untuk melaporkan ketersediaan peralatan dan informasi?",
      options: [
        "All the equipments in this laboratory are up to date.",
        "We need many new informations before making a decision.",
        "All the equipment in this laboratory is up to date.",
        "There are several important advices from the consultant."
      ],
      correctIndex: 2,
      explanation: "Kata 'equipment', 'information', dan 'advice' adalah Uncountable Nouns dalam bahasa Inggris: tidak pernah diberi akhiran '-s' dan selalu menggunakan kata kerja tunggal ('is')."
    },
    {
      id: "q-03",
      level: "A2",
      topic: "Past Simple Negative & Interrogative",
      question: "Lengkapi kalimat evaluasi berikut: 'Why ___ the vendor ___ the shipment on time yesterday?'",
      options: [
        "did not / delivered",
        "was not / deliver",
        "did not / deliver",
        "has not / delivered"
      ],
      correctIndex: 2,
      explanation: "Ada penanda waktu lampau yang sudah selesai ('yesterday'), sehingga wajib memakai Past Simple. Karena 'deliver' adalah kata kerja aksi dan sudah ada kata bantu 'did not', kata kerja utamanya kembali ke bentuk dasar V1 ('deliver')."
    },
    {
      id: "q-04",
      level: "A2",
      topic: "Dimensional Prepositions (AT / ON / IN)",
      question: "Pilih rangkaian preposisi yang paling tepat: 'The board meeting starts ___ 09:00 AM ___ Monday ___ the main conference hall.'",
      options: [
        "at / on / in",
        "on / at / in",
        "in / on / at",
        "at / in / on"
      ],
      correctIndex: 0,
      explanation: "Gunakan AT untuk titik jam spesifik ('at 09:00 AM'), ON untuk satu hari/tanggal di kalender ('on Monday'), dan IN untuk ruangan tertutup berdimensi ruang ('in the main conference hall')."
    },
    {
      id: "q-05",
      level: "B1",
      topic: "Present Perfect vs Past Simple",
      question: "Manakah kalimat yang tepat untuk menyatakan bahwa Anda mulai bekerja di perusahaan ini sejak 2022 dan MASIH bekerja di sini sekarang?",
      options: [
        "I work at this company since 2022.",
        "I worked at this company since 2022.",
        "I am working at this company since 2022.",
        "I have worked at this company since 2022."
      ],
      correctIndex: 3,
      explanation: "Untuk aksi yang dimulai di titik masa lalu ('since 2022') dan masih berlanjut hingga detik ini, bahasa Inggris wajib menggunakan Present Perfect ('have/has + V3') atau Present Perfect Continuous ('have been working')."
    },
    {
      id: "q-06",
      level: "B1",
      topic: "Present Continuous Passive Voice",
      question: "Ubahlah ke bentuk pasif untuk laporan status: 'Our security engineers are currently patching the firewall.'",
      options: [
        "The firewall is currently patched by our security engineers.",
        "The firewall is currently being patched by our security engineers.",
        "The firewall has currently been patched by our security engineers.",
        "The firewall was currently being patched by our security engineers."
      ],
      correctIndex: 1,
      explanation: "Kalimat aktifnya berbentuk Present Continuous ('are patching'). Rumus pasifnya adalah 'am/is/are + being + V3': 'The firewall is currently being patched'."
    },
    {
      id: "q-07",
      level: "B2",
      topic: "Third Conditional (Counterfactual Past)",
      question: "Pilih kalimat yang tepat untuk mengevaluasi insiden bulan lalu: 'Jika bulan lalu kita menguji cadangan listriknya, pabrik tidak akan berhenti beroperasi.'",
      options: [
        "If we tested the backup generator last month, the plant would not stop operating.",
        "If we had tested the backup generator last month, the plant would not have stopped operating.",
        "If we have tested the backup generator last month, the plant will not stop operating.",
        "If we would have tested the backup generator last month, the plant had not stopped operating."
      ],
      correctIndex: 1,
      explanation: "Pengandaian tentang masa lalu yang sudah terjadi (Third Conditional) wajib memakai rumus 'If + Subject + had + V3, Subject + would have + V3'."
    },
    {
      id: "q-08",
      level: "B2",
      topic: "Past Perfect Sequence",
      question: "Lengkapi urutan kronologis berikut: 'By the time the external auditor arrived at 10 AM, the finance team ___ all the reconciliations.'",
      options: [
        "already completed",
        "has already completed",
        "had already completed",
        "was already completing"
      ],
      correctIndex: 2,
      explanation: "Ada dua kejadian di masa lampau: (1) menyelesaikan rekonsiliasi, dan (2) auditor tiba pukul 10 pagi. Kejadian yang tuntas lebih dulu sebelum kejadian lampau kedua wajib menggunakan Past Perfect ('had already completed')."
    },
    {
      id: "q-09",
      level: "C1",
      topic: "Negative Inversion",
      question: "Manakah kalimat level C1 yang memiliki struktur Negative Inversion yang benar?",
      options: [
        "Seldom we have seen such disciplined execution across all regional branches.",
        "Seldom have we seen such disciplined execution across all regional branches.",
        "Seldom did we have seen such disciplined execution across all regional branches.",
        "Seldom we saw such disciplined execution across all regional branches."
      ],
      correctIndex: 1,
      explanation: "Ketika adverbia negatif/pembatas seperti 'Seldom', 'Never', atau 'Rarely' diletakkan di awal kalimat untuk penekanan formal, kata bantu ('have') wajib dibalik ke depan subjek: 'Seldom have we seen...'."
    },
    {
      id: "q-10",
      level: "C1",
      topic: "Mandative Subjunctive Mood",
      question: "Lengkapi kalimat rekomendasi komite hukum berikut: 'The legal counsel insisted that the supplier ___ full liability for any defective batch.'",
      options: [
        "assumes",
        "assumed",
        "assume",
        "to assume"
      ],
      correctIndex: 2,
      explanation: "Setelah kata kerja atau kata sifat mandat formal ('insist, recommend, demand, imperative, essential + that'), bahasa Inggris menggunakan Subjunctive Mood: kata kerja kembali ke Bare Infinitive ('assume' tanpa -s meskipun subjeknya tunggal 'the supplier')."
    },
    {
      id: "q-11",
      level: "C2",
      topic: "Concessive Clause & Collocation Precision",
      question: "Pilih kalimat tingkat direksi (C2) yang paling tepat secara sintaksis dan kolokasi:",
      options: [
        "Despite of the macroeconomic headwinds, our cash flow remains commensurate to our targets.",
        "Notwithstanding the macroeconomic headwinds, our cash flow remains commensurate with our targets.",
        "Although the macroeconomic headwinds, our cash flow remains commensurate with our targets.",
        "Notwithstanding with the macroeconomic headwinds, our cash flow remains commensurate by our targets."
      ],
      correctIndex: 1,
      explanation: "Tiga aturan C2 sekaligus: (1) 'Notwithstanding' langsung diikuti Noun Phrase tanpa 'of/with' (sedangkan 'despite' tidak pernah memakai 'of', dan 'although' wajib diikuti Subject+Verb). (2) Kata sifat 'commensurate' selalu berpasangan dengan preposisi 'with'."
    },
    {
      id: "q-12",
      level: "C2",
      topic: "No Sooner Inversion & Temporal Correlative",
      question: "Pilih pasangan korelatif inversi C2 yang tepat: 'No sooner ___ the quarterly earnings been released ___ institutional buyers began accumulating the stock.'",
      options: [
        "had / when",
        "did / than",
        "had / than",
        "have / before"
      ],
      correctIndex: 2,
      explanation: "'No sooner' adalah bentuk komparatif sehingga wajib berpasangan dengan 'than' (bukan 'when'), dan karena klausa utamanya berbentuk pasif lampau ('been released'), kata bantunya adalah 'had': 'No sooner had ... been released than ...'."
    }
  ],

  sentenceSurgery: [
    {
      id: "ss-01",
      level: "A1",
      title: "Noun Phrase Inversion & Location State",
      promptId: "Susun kalimat: 'Laporan keuangan tahunan kami ada di atas meja direktur.'",
      tokens: ["Our", "annual", "financial", "report", "is", "on", "the", "director's", "desk."],
      hint: "Ingat urutan Noun Phrase: Possessive (Our) + Frequency (annual) + Type (financial) + Head Noun (report) + Copula (is) + Preposition (on)..."
    },
    {
      id: "ss-02",
      level: "A2",
      title: "Past Simple Negative with Auxiliary 'Did'",
      promptId: "Susun kalimat: 'Vendor tersebut tidak mengirimkan faktur pajak kemarin.'",
      tokens: ["The", "vendor", "did", "not", "submit", "the", "tax", "invoice", "yesterday."],
      hint: "Setelah 'did not', gunakan kata kerja dasar V1 ('submit') diikuti objek ('the tax invoice') dan waktu ('yesterday')."
    },
    {
      id: "ss-03",
      level: "B1",
      title: "Present Perfect Passive Voice",
      promptId: "Susun kalimat: 'Seluruh celah keamanan telah diperbaiki oleh tim rekayasa kami.'",
      tokens: ["All", "security", "vulnerabilities", "have", "been", "patched", "by", "our", "engineering", "team."],
      hint: "Subjek jamak ('All security vulnerabilities') + Present Perfect Passive ('have been patched') + Agent ('by our engineering team.')."
    },
    {
      id: "ss-04",
      level: "B2",
      title: "Third Conditional Counterfactual Audit",
      promptId: "Susun kalimat: 'Seandainya kita mengunci nilai tukar lebih awal, kita pasti sudah menghemat biaya besar.'",
      tokens: ["If", "we", "had", "locked", "the", "exchange", "rate", "earlier,", "we", "would", "have", "saved", "substantial", "costs."],
      hint: "Mulai dengan klausa syarat masa lalu ('If we had locked the exchange rate earlier,') lalu klausa hasil ('we would have saved substantial costs.')."
    },
    {
      id: "ss-05",
      level: "C1",
      title: "Negative Inversion with 'Not Only'",
      promptId: "Susun kalimat C1: 'Pembaruan ini tidak hanya memangkas latensi, tetapi juga meningkatkan kapasitas server.'",
      tokens: ["Not", "only", "did", "this", "update", "reduce", "latency,", "but", "it", "also", "expanded", "server", "capacity."],
      hint: "Awali dengan 'Not only' diikuti inversi kata bantu ('did + this update + reduce latency,') lalu klausa kedua ('but it also expanded server capacity.')."
    },
    {
      id: "ss-06",
      level: "C2",
      title: "Mandative Subjunctive & Ring-Fencing Clause",
      promptId: "Susun kalimat C2: 'Sangat mutlak bahwa seluruh dana cadangan dipagari di dalam rekening penampungan.'",
      tokens: ["It", "is", "imperative", "that", "all", "reserve", "funds", "be", "ring-fenced", "in", "an", "escrow", "account."],
      hint: "Gunakan pembuka mandat ('It is imperative that') + subjek ('all reserve funds') + bare infinitive passive ('be ring-fenced') + lokasi ('in an escrow account.')."
    }
  ]
};

