(function () {
  "use strict";

  /*
   * Jago English - Modul Percakapan Sehari-hari & Bisnis Internasional
   * Setiap skenario memiliki 3 tingkatan (Mudah A1-A2, Menengah B1-B2, Advance C1-C2)
   * mencakup kabar harian, perbandingan hidup di Indonesia vs luar negeri, kesiapan bisnis,
   * kesiapan dokumen regulasi, penyambutan kunjungan Jakarta, hingga penutupan negosiasi.
   */

  var scenarios = [
    {
      id: "conv-kabar",
      no: 1,
      category: "Kabar & Sapaan Harian",
      title: "Menanyakan Kabar & Mengawali Obrolan Kerja",
      subtitle: "Dari sapaan sederhana sampai basa-basi hangat level eksekutif sebelum masuk rapat.",
      situation: "Anda baru bergabung di panggilan Zoom, mengirim pesan pembuka di WhatsApp, atau menyapa mitra saat baru bertemu setelah beberapa hari menunggu kabar.",
      culturalNote: "Penutur asli jarang langsung menagih dokumen di kalimat pertama. Luangkan 20 sampai 30 detik menanyakan kabar minggu ini atau kondisi tim mereka untuk membangun rasa percaya sebelum masuk ke agenda inti.",
      tiers: {
        mudah: {
          cefr: "A1 - A2",
          focus: "Sapaan singkat, jelas, sopan, dan mudah diingat tanpa tata bahasa rumit.",
          lines: [
            {
              speaker: "Kemal (Anda)",
              en: "Good morning, Mr. Malik. How are you today?",
              id: "Selamat pagi, Pak Malik. Bagaimana kabar Anda hari ini?"
            },
            {
              speaker: "Mr. Malik",
              en: "Good morning, Kemal. I am doing well, thank you. How about you and your team?",
              id: "Selamat pagi, Kemal. Kabar saya baik, terima kasih. Bagaimana kabar Anda dan tim?"
            },
            {
              speaker: "Kemal (Anda)",
              en: "We are doing great, thank you. We have a busy week here in Jakarta, but everything is going well.",
              id: "Kabar kami sangat baik, terima kasih. Minggu ini kami cukup sibuk di Jakarta, tetapi semuanya berjalan lancar."
            },
            {
              speaker: "Mr. Malik",
              en: "That is good to hear. How is the weather in Jakarta this week?",
              id: "Senang mendengarnya. Bagaimana cuaca di Jakarta minggu ini?"
            },
            {
              speaker: "Kemal (Anda)",
              en: "It is warm, and it rains a little in the afternoon. How is everything on your side?",
              id: "Cukup hangat, dan agak hujan di sore hari. Bagaimana situasi di tempat Anda?"
            }
          ],
          keyPhrases: [
            { en: "How are you today?", id: "Bagaimana kabar Anda hari ini? (Sapaan paling aman dan sopan)" },
            { en: "We are doing great, thank you.", id: "Kabar kami baik sekali, terima kasih." },
            { en: "Everything is going well.", id: "Semuanya berjalan dengan baik." },
            { en: "How is everything on your side?", id: "Bagaimana situasi atau kabar di pihak Anda?" }
          ]
        },
        menengah: {
          cefr: "B1 - B2",
          focus: "Obrolan alami yang menghubungkan kesibukan minggu ini dengan kesiapan diskusi kerja.",
          lines: [
            {
              speaker: "Kemal (Anda)",
              en: "Hi Nadeem, it is great to catch up with you again. Hope your week has been productive so far.",
              id: "Hai Nadeem, senang bisa mengobrol lagi dengan Anda. Semoga minggu Anda sejauh ini berjalan produktif."
            },
            {
              speaker: "Mr. Malik",
              en: "Good to see you too, Kemal. It has been quite hectic wrapping up paperwork here, but we are making solid progress.",
              id: "Senang bertemu Anda juga, Kemal. Pekan ini cukup sibuk merampungkan berkas di sini, tetapi progres kami bagus."
            },
            {
              speaker: "Kemal (Anda)",
              en: "I completely understand. Our team has been flat out preparing the local compliance checklist on our end too. How is your family and the rest of the office?",
              id: "Saya paham sekali. Tim kami juga sedang bekerja penuh menyiapkan daftar kepatuhan lokal di sini. Bagaimana kabar keluarga dan rekan kantor di sana?"
            },
            {
              speaker: "Mr. Malik",
              en: "Everyone is healthy and in good spirits, thank you for asking. Are you ready to walk through our next steps?",
              id: "Semua sehat dan bersemangat, terima kasih sudah bertanya. Apakah Anda siap membahas langkah selanjutnya?"
            },
            {
              speaker: "Kemal (Anda)",
              en: "Yes, absolutely. Whenever you are ready, let us dive right into the agenda.",
              id: "Ya, tentu saja. Kapan pun Anda siap, mari langsung kita bahas agendanya."
            }
          ],
          keyPhrases: [
            { en: "It is great to catch up with you again.", id: "Senang bisa mengobrol lagi dan bertukar kabar terbaru dengan Anda." },
            { en: "Quite hectic wrapping up...", id: "Cukup sibuk merampungkan atau menyelesaikan..." },
            { en: "Flat out preparing...", id: "Bekerja penuh atau sangat sibuk menyiapkan..." },
            { en: "In good spirits", id: "Dalam keadaan sehat, ceria, dan bersemangat" }
          ]
        },
        advance: {
          cefr: "C1 - C2",
          focus: "Membangun keakraban tingkat pimpinan (executive rapport) secara elegan sebelum transisi ke pembahasan strategis.",
          lines: [
            {
              speaker: "Kemal (Anda)",
              en: "Nadeem, wonderful to reconnect. I trust things have been moving along smoothly at Bushido Instruments despite the year-end rush.",
              id: "Nadeem, senang sekali bisa terhubung kembali. Saya harap segala urusan di Bushido Instruments berjalan lancar di tengah padatnya jadwal akhir tahun."
            },
            {
              speaker: "Mr. Malik",
              en: "Always a pleasure, Kemal. As you know, the fourth quarter tends to test everyone's bandwidth, yet we have managed to keep our production schedule on track.",
              id: "Selalu menyenangkan berbicara dengan Anda, Kemal. Seperti Anda ketahui, kuartal keempat selalu menguji kapasitas waktu, namun jadwal produksi kami tetap terjaga."
            },
            {
              speaker: "Kemal (Anda)",
              en: "That speaks volumes about your team's discipline. Down here in Jakarta, we have been balancing day-to-day hospital outreach with regulatory groundwork, so keeping our momentum steady has been our top focus.",
              id: "Itu menunjukkan kedisiplinan tim Anda. Di Jakarta ini kami menyeimbangkan pendekatan ke rumah sakit setiap hari dengan penyiapan fondasi regulasi, sehingga menjaga momentum tetap stabil menjadi prioritas utama."
            },
            {
              speaker: "Mr. Malik",
              en: "I hear you completely. Now that we have caught up, shall we review where both teams stand ahead of next week?",
              id: "Saya sepakat sekali. Setelah bertukar kabar, boleh kita tinjau posisi masing-masing tim menjelang minggu depan?"
            },
            {
              speaker: "Kemal (Anda)",
              en: "By all means. Let us align our priorities so both sides have full clarity before your trip.",
              id: "Silakan sekali. Mari kita selaraskan prioritas agar kedua pihak memiliki kejelasan penuh sebelum perjalanan Anda ke sini."
            }
          ],
          keyPhrases: [
            { en: "Wonderful to reconnect", id: "Senang sekali bisa berkomunikasi kembali (lebih hangat dan berkelas daripada 'nice to see you')" },
            { en: "Test everyone's bandwidth", id: "Menguji kapasitas waktu dan tenaga semua orang" },
            { en: "Speaks volumes about...", id: "Sangat mencerminkan atau membuktikan kualitas dari..." },
            { en: "Align our priorities", id: "Menyelaraskan hal-hal yang menjadi prioritas bersama" }
          ]
        }
      }
    },
    {
      id: "conv-hidup-disini-disana",
      no: 2,
      category: "Hidup Di Sini vs Di Sana",
      title: "Cerita Kehidupan Di Indonesia & Kehidupan Di Negara Mitra",
      subtitle: "Membahas cuaca, macet Jakarta, makanan halal, ritme kerja, dan membandingkan suasana hidup kedua negara.",
      situation: "Saat istirahat rapat, menunggu peserta lain masuk Zoom, atau mengobrol santai saat mitra penasaran dengan suasana tinggal di Indonesia.",
      culturalNote: "Berbagi cerita nyata tentang kehidupan di Jakarta (kuliner, cuaca November yang memasuki musim hujan, keramahan orang Indonesia) membuat Anda terdengar seperti penutur asli, bukan sekadar membicarakan angka bisnis.",
      tiers: {
        mudah: {
          cefr: "A1 - A2",
          focus: "Kalimat sehari-hari sederhana tentang cuaca, makanan, lalu lintas, dan kebiasaan harian.",
          lines: [
            {
              speaker: "Mr. Malik",
              en: "What is life like in Jakarta right now? Is it very hot?",
              id: "Bagaimana rasanya tinggal di Jakarta sekarang? Apakah sangat panas?"
            },
            {
              speaker: "Kemal (Anda)",
              en: "In late November, it is warm in the morning, and it often rains in the afternoon. So please bring an umbrella.",
              id: "Di akhir November, paginya hangat, dan sering turun hujan di sore hari. Jadi silakan bawa payung."
            },
            {
              speaker: "Mr. Malik",
              en: "Thank you for the tip. How is the traffic and the food there?",
              id: "Terima kasih sarannya. Bagaimana dengan lalu lintas dan makanannya di sana?"
            },
            {
              speaker: "Kemal (Anda)",
              en: "Traffic can be slow during work hours, but our trains and toll roads help a lot. For food, you can find delicious halal dishes everywhere. What is the weather like in your city now?",
              id: "Lalu lintas bisa lambat saat jam kerja, tetapi kereta dan jalan tol sangat membantu. Soal makanan, hidangan halal yang lezat mudah ditemukan di mana saja. Bagaimana cuaca di kota Anda sekarang?"
            },
            {
              speaker: "Mr. Malik",
              en: "Here it is getting cooler in the mornings and evenings. People drink a lot of hot tea after work.",
              id: "Di sini mulai lebih sejuk saat pagi dan malam. Orang-orang sering minum teh hangat sepulang kerja."
            }
          ],
          keyPhrases: [
            { en: "In late November", id: "Pada akhir bulan November" },
            { en: "During work hours / rush hour", id: "Pada jam kerja / jam sibuk pulang-pergi kerja" },
            { en: "Delicious halal dishes everywhere", id: "Hidangan halal yang lezat ada di mana-mana" },
            { en: "Getting cooler in the mornings", id: "Mulai terasa lebih sejuk pada pagi hari" }
          ]
        },
        menengah: {
          cefr: "B1 - B2",
          focus: "Menjelaskan ritme hidup urban Jakarta secara objektif sekaligus bertanya balik dengan penuh minat tentang kehidupan mitra.",
          lines: [
            {
              speaker: "Mr. Malik",
              en: "This will be one of my longer stays in Indonesia. What does a typical day look like for you in Jakarta?",
              id: "Ini akan menjadi salah satu kunjungan saya yang agak lama di Indonesia. Seperti apa gambaran hari biasa Anda di Jakarta?"
            },
            {
              speaker: "Kemal (Anda)",
              en: "Most days start early around seven because traffic builds up quickly toward central Jakarta. After morning team briefings, we usually spend midday visiting clinics or handling export coordination, and evenings are much calmer once you sit down for dinner.",
              id: "Sebagian besar hari dimulai pagi sekitar jam tujuh karena lalu lintas cepat padat menuju Jakarta Pusat. Setelah pengarahan tim pagi, tengah hari kami habiskan mengunjungi klinik atau mengurus koordinasi ekspor, lalu malam hari jauh lebih tenang saat makan malam."
            },
            {
              speaker: "Mr. Malik",
              en: "It sounds busy but well structured. What about living there day to day, like coffee culture or evening places to unwind?",
              id: "Terdengar sibuk namun tertata. Bagaimana kehidupan sehari-hari di sana, seperti kebiasaan minum kopi atau tempat bersantai sore?"
            },
            {
              speaker: "Kemal (Anda)",
              en: "Indonesian hospitality is very warm, and Jakarta has amazing specialty coffee shops everywhere, along with great local spices in our food. How does the daily pace in your city compare, especially around your manufacturing hub?",
              id: "Keramahan di Indonesia sangat hangat, dan Jakarta punya kedai kopi spesialti yang bagus di mana-mana, plus bumbu rempah lokal di masakan kami. Bagaimana perbandingan ritme harian di kota Anda, khususnya di sekitar pusat pabrik Anda?"
            },
            {
              speaker: "Mr. Malik",
              en: "Back home, people start a bit later in winter mornings, work steadily through the afternoon, and spend evenings mostly with extended family over dinner.",
              id: "Di kampung halaman kami, orang mulai agak siang saat pagi musim dingin, bekerja konsisten sampai sore, dan malamnya lebih banyak berkumpul makan malam bersama keluarga besar."
            }
          ],
          keyPhrases: [
            { en: "What does a typical day look like?", id: "Seperti apa gambaran keseharian pada umumnya?" },
            { en: "Traffic builds up quickly", id: "Kemacetan atau kepadatan kendaraan cepat meningkat" },
            { en: "Places to unwind", id: "Tempat untuk melepas penat atau bersantai" },
            { en: "How does the daily pace compare?", id: "Bagaimana perbandingan ritme hariannya?" }
          ]
        },
        advance: {
          cefr: "C1 - C2",
          focus: "Percakapan kultural dan sosio-ekonomi yang setara antar pimpinan perusahaan lintas budaya.",
          lines: [
            {
              speaker: "Mr. Malik",
              en: "Whenever I travel to Southeast Asia, I am struck by how quickly the business landscape shifts. How do you find balancing Jakarta's pace with personal life and family?",
              id: "Setiap kali bepergian ke Asia Tenggara, saya selalu terkesan dengan cepatnya perubahan dunia usaha. Bagaimana Anda menyeimbangkan ritme Jakarta dengan kehidupan pribadi dan keluarga?"
            },
            {
              speaker: "Kemal (Anda)",
              en: "Jakarta certainly runs at full tilt, yet once you learn its rhythm, life here is deeply rewarding. Most business owners rely on early morning routines and strong family ties to stay grounded, while our evenings naturally center around shared meals, prayers, and quieter community time.",
              id: "Jakarta memang bergerak sangat cepat, namun begitu Anda memahami ritmenya, hidup di sini terasa sangat bermakna. Banyak pelaku usaha mengandalkan rutinitas pagi dan ikatan keluarga agar tetap tenang, sementara malam hari berpusat pada makan bersama, ibadah, dan waktu hangat bersama lingkungan sekitar."
            },
            {
              speaker: "Mr. Malik",
              en: "That sense of community resonates strongly with how we live back home too. Tradition and modern trade really sit side by side.",
              id: "Rasa kebersamaan itu sangat selaras dengan cara hidup kami di negara asal juga. Tradisi dan perdagangan modern benar-benar berjalan berdampingan."
            },
            {
              speaker: "Kemal (Anda)",
              en: "Precisely. And when you stay here for a week, you will also notice how regional diversity shapes our market. Each island has distinct needs, from hospital infrastructure in Java to agricultural logistics in Sumatra and Sulawesi, which keeps daily work both demanding and fascinating.",
              id: "Tepat sekali. Saat Anda tinggal di sini selama sepekan, Anda juga akan melihat bagaimana keragaman wilayah membentuk pasar kami. Setiap pulau punya kebutuhan berbeda, mulai dari infrastruktur rumah sakit di Jawa hingga logistik hasil bumi di Sumatra dan Sulawesi, yang membuat pekerjaan harian menantang sekaligus menarik."
            }
          ],
          keyPhrases: [
            { en: "Runs at full tilt", id: "Berjalan dengan kecepatan dan energi penuh" },
            { en: "Keep oneself grounded", id: "Menjaga diri tetap tenang, sadar tujuan, dan tidak terbawa arus stres" },
            { en: "Resonates strongly with...", id: "Sangat selaras atau terasa akrab dengan..." },
            { en: "Sit side by side", id: "Berdampingan secara harmonis" }
          ]
        }
      }
    },
    {
      id: "conv-kesiapan-dokumen",
      no: 3,
      category: "Kesiapan Dokumen & Regulasi",
      title: "Konfirmasi Kesiapan Dokumen Ekspor-Impor & Registrasi Kemenkes",
      subtitle: "Menjawab kabar dokumen hampir siap dari prinsipal sekaligus mengecek detail LoA, ISO, CE, dan berkas izin edar.",
      situation: "Menindaklanjuti email mitra seperti Mr. Nadeem Malik yang menulis bahwa dokumen hampir siap ('almost ready') dan perlu dipastikan kelengkapannya untuk perizinan distributor.",
      culturalNote: "Di pasar Indonesia, keterlambatan dokumen prinsipal sering menggeser jadwal registrasi AKL/IDAK berbulan-bulan. Sampaikan urgensi dokumen dengan nada apresiatif ('once we receive...', 'this helps us lock in our queue') bukan bernada menyalahkan.",
      tiers: {
        mudah: {
          cefr: "A1 - A2",
          focus: "Ucapan terima kasih soal dokumen dan pertanyaan langsung namun sopan mengenai kapan berkas dikirim.",
          lines: [
            {
              speaker: "Kemal (Anda)",
              en: "Thank you for the update on our documents. We are happy to hear they are almost ready.",
              id: "Terima kasih atas kabar mengenai dokumen kami. Kami senang mendengar berkasnya sudah hampir siap."
            },
            {
              speaker: "Mr. Malik",
              en: "You are welcome, Kemal. Our compliance staff is doing the final check this week.",
              id: "Sama-sama, Kemal. Staf kepatuhan kami sedang melakukan pengecekan akhir minggu ini."
            },
            {
              speaker: "Kemal (Anda)",
              en: "Could you please share the Letter of Authorization and product certificates first when they are ready? We need them to apply for the Ministry license in Indonesia.",
              id: "Bisakah Anda mengirimkan Surat Kuasa (LoA) dan sertifikat produk lebih dulu jika sudah siap? Kami membutuhkannya untuk mengajukan izin ke Kementerian di Indonesia."
            },
            {
              speaker: "Mr. Malik",
              en: "Sure, I will send the PDF copies to your email first, and bring the signed originals when I come to Jakarta.",
              id: "Baik, saya akan kirim salinan PDF ke email Anda dulu, dan membawa berkas asli bertanda tangan saat saya datang ke Jakarta."
            },
            {
              speaker: "Kemal (Anda)",
              en: "That sounds great. Having the PDF copies early will help our regulatory team start right away.",
              id: "Bagus sekali. Mendapat salinan PDF lebih awal akan membantu tim regulasi kami langsung mulai bekerja."
            }
          ],
          keyPhrases: [
            { en: "Almost ready", id: "Sudah hampir siap" },
            { en: "Final check", id: "Pengecekan tahap akhir" },
            { en: "Apply for the Ministry license", id: "Mengajukan izin ke kementerian" },
            { en: "Signed originals", id: "Dokumen asli yang sudah ditandatangani" }
          ]
        },
        menengah: {
          cefr: "B1 - B2",
          focus: "Memverifikasi daftar dokumen kunci secara runtut dan menjelaskan kaitannya dengan alur registrasi resmi Indonesia.",
          lines: [
            {
              speaker: "Kemal (Anda)",
              en: "Thank you for your email and for pushing the documentation forward, Nadeem. Having those files ready will really speed up our regulatory submission here.",
              id: "Terima kasih atas email Anda dan upaya mempercepat penyelesaian dokumen, Nadeem. Kesiapan berkas tersebut akan sangat mempercepat pengajuan izin kami di sini."
            },
            {
              speaker: "Mr. Malik",
              en: "Glad to help. Which specific files should we prioritize for your initial upload?",
              id: "Dengan senang hati. Berkas spesifik mana yang perlu kami prioritaskan untuk unggahan awal Anda?"
            },
            {
              speaker: "Kemal (Anda)",
              en: "First, we need the signed Letter of Authorization, the ISO 13485 quality certificate, the Certificate of Free Sale, and the technical brochures with clear product codes. Once we receive the soft copies, our team can verify the formatting before the Ministry review.",
              id: "Pertama, kami butuh Letter of Authorization bertanda tangan, sertifikat mutu ISO 13485, Certificate of Free Sale, dan brosur teknis dengan kode produk yang jelas. Begitu salinan digital kami terima, tim kami bisa mengecek formatnya sebelum diperiksa Kementerian."
            },
            {
              speaker: "Mr. Malik",
              en: "That makes sense. Do you need the hard copies legalized by the embassy before my flight?",
              id: "Masuk akal. Apakah Anda memerlukan dokumen fisik dilegalisasi kedutaan sebelum penerbangan saya?"
            },
            {
              speaker: "Kemal (Anda)",
              en: "Let us double-check that requirement during our Zoom call next week so you do not have to do extra steps unnecessarily.",
              id: "Mari kita pastikan kembali syarat tersebut saat panggilan Zoom minggu depan agar Anda tidak perlu mengurus langkah tambahan yang sebenarnya tidak wajib."
            }
          ],
          keyPhrases: [
            { en: "Push the documentation forward", id: "Mendorong penyelesaian dokumen agar segera tuntas" },
            { en: "Speed up our regulatory submission", id: "Mempercepat pengajuan izin regulasi kami" },
            { en: "Verify the formatting before review", id: "Memverifikasi kesesuaian format sebelum diperiksa otoritas" },
            { en: "Do not have to do extra steps unnecessarily", id: "Agar tidak perlu melakukan pekerjaan tambahan yang tidak perlu" }
          ]
        },
        advance: {
          cefr: "C1 - C2",
          focus: "Koordinasi tata kelola regulasi medis dan komoditas tingkat ahli untuk mencegah penolakan administrasi.",
          lines: [
            {
              speaker: "Kemal (Anda)",
              en: "We genuinely appreciate the thoroughness your team has put into assembling the regulatory dossier, Nadeem. Because Indonesian Ministry of Health evaluations scrutinize document consistency down to the model numbers and facility addresses, getting soft copies reviewed in advance saves weeks of back-and-forth.",
              id: "Kami sangat menghargai ketelitian tim Anda dalam menyusun berkas regulasi tersebut, Nadeem. Karena evaluasi Kementerian Kesehatan Indonesia memeriksa konsistensi dokumen sampai ke kode model dan alamat pabrik, meninjau salinan digital lebih awal akan menghemat berminggu-minggu proses revisi."
            },
            {
              speaker: "Mr. Malik",
              en: "Agreed. We want zero discrepancies between our manufacturing certificates and your distributor filing.",
              id: "Sepakat. Kami ingin tidak ada satu pun selisih antara sertifikat pabrikan kami dan pengajuan distributor Anda."
            },
            {
              speaker: "Kemal (Anda)",
              en: "To lock in our licensing timeline alongside our IDAK and CDAKB readiness, could your team confirm whether the Free Sale Certificate carries valid notarization or apostille authentication? If anything requires minor amendment, we can flag it on next week's Zoom call and have the physical originals hand-carried during your Jakarta visit.",
              id: "Untuk mengunci linimasa perizinan selaras dengan kesiapan IDAK dan CDAKB kami, dapatkah tim Anda memastikan apakah Certificate of Free Sale sudah memuat legalisasi notaris atau apostille yang berlaku? Jika ada hal yang perlu sedikit penyesuaian, kita bisa tandai saat Zoom minggu depan sehingga dokumen fisik aslinya bisa Anda bawa langsung saat kunjungan ke Jakarta."
            },
            {
              speaker: "Mr. Malik",
              en: "That is a very practical workflow. I will have our quality manager circulate the draft PDF pack forty-eight hours before our call so your regulatory specialists can audit every page.",
              id: "Alur kerja yang sangat praktis. Saya akan minta manajer mutu kami membagikan draf paket PDF empat puluh delapan jam sebelum rapat agar tim regulasi Anda bisa mengaudit setiap halamannya."
            }
          ],
          keyPhrases: [
            { en: "Scrutinize consistency down to the model numbers", id: "Memeriksa konsistensi secara sangat teliti hingga ke nomor model" },
            { en: "Saves weeks of back-and-forth", id: "Menghemat waktu revisi bolak-balik berminggu-minggu" },
            { en: "Lock in our licensing timeline", id: "Mengunci atau memastikan kepastian jadwal perizinan kita" },
            { en: "Hand-carried during your visit", id: "Dibawa langsung secara fisik oleh yang bersangkutan saat berkunjung" }
          ]
        }
      }
    },
    {
      id: "conv-kesiapan-bisnis-jakarta",
      no: 4,
      category: "Kesiapan Bisnis & Kunjungan Jakarta",
      title: "Jadwal Zoom Minggu Depan & Kesiapan Kunjungan Jakarta (28-29 Nov)",
      subtitle: "Menyepakati jadwal Zoom dan menyiapkan strategi pertemuan tatap muka selama kunjungan 1 minggu di Jakarta.",
      situation: "Menjawab ajakan Mr. Malik untuk Zoom meeting minggu depan dan rencana datang ke Jakarta tanggal 28 atau 29 November 2026 selama sekitar 1 minggu.",
      culturalNote: "Konfirmasi jadwal Zoom dengan menyebutkan zona waktu lengkap (WIB / UTC+7 vs waktu mitra) agar tidak terjadi salah paham jam rapat. Saat tamu asing berkunjung selama seminggu, tanyakan rencana hotel/penerbangan mereka dan tawarkan agenda terstruktur agar mereka merasa bisnis Anda siap dan profesional.",
      tiers: {
        mudah: {
          cefr: "A1 - A2",
          focus: "Menjawab undangan Zoom, menyambut kunjungan 28-29 November, dan menawarkan bantuan dasar.",
          lines: [
            {
              speaker: "Kemal (Anda)",
              en: "We are very happy to join a Zoom meeting next week. What day and time work best for you?",
              id: "Kami sangat senang untuk ikut rapat Zoom minggu depan. Hari dan jam berapa yang paling cocok untuk Anda?"
            },
            {
              speaker: "Mr. Malik",
              en: "How about Tuesday or Wednesday afternoon, Jakarta time?",
              id: "Bagaimana kalau hari Selasa atau Rabu sore waktu Jakarta?"
            },
            {
              speaker: "Kemal (Anda)",
              en: "Tuesday at 2 PM Jakarta time works well for me. Also, welcome to Indonesia! We are very excited about your visit to Jakarta on 28 or 29 November.",
              id: "Hari Selasa jam 2 siang waktu Jakarta cocok untuk saya. Dan selamat datang di Indonesia! Kami sangat menantikan kunjungan Anda ke Jakarta pada 28 atau 29 November."
            },
            {
              speaker: "Mr. Malik",
              en: "Thank you, Kemal. I plan to stay for about one week so we can meet properly.",
              id: "Terima kasih, Kemal. Saya berencana tinggal sekitar satu minggu agar kita bisa bertemu dengan leluasa."
            },
            {
              speaker: "Kemal (Anda)",
              en: "One week is great. Please share your flight details later, and I will help prepare your meeting schedule and hotel recommendations near our office.",
              id: "Satu minggu bagus sekali. Silakan kirim detail penerbangan Anda nanti, dan saya akan bantu menyiapkan jadwal rapat serta rekomendasi hotel dekat kantor kami."
            }
          ],
          keyPhrases: [
            { en: "What day and time work best for you?", id: "Hari dan jam berapa yang paling sesuai bagi Anda?" },
            { en: "Jakarta time (WIB / UTC+7)", id: "Waktu Jakarta (selalu sebut zona waktu agar tidak keliru)" },
            { en: "Very excited about your visit", id: "Sangat antusias menyambut kunjungan Anda" },
            { en: "Share your flight details", id: "Kirimkan detail jadwal penerbangan Anda" }
          ]
        },
        menengah: {
          cefr: "B1 - B2",
          focus: "Memaparkan kesiapan bisnis lokal (tim sales, gudang, jaringan klinik) dan merancang jadwal kunjungan Jakarta.",
          lines: [
            {
              speaker: "Kemal (Anda)",
              en: "A Zoom meeting next week sounds ideal so we can finalize all details before your arrival. Does Tuesday or Wednesday between 2 PM and 4 PM Jakarta time fit your schedule?",
              id: "Rapat Zoom minggu depan terdengar tepat agar kita bisa merampungkan semua detail sebelum kedatangan Anda. Apakah Selasa atau Rabu antara jam 2 sampai 4 sore WIB sesuai dengan jadwal Anda?"
            },
            {
              speaker: "Mr. Malik",
              en: "Wednesday at 3 PM Jakarta time works well for us. What should we cover during that call?",
              id: "Hari Rabu jam 3 sore waktu Jakarta cocok untuk kami. Apa saja yang perlu kita bahas dalam panggilan itu?"
            },
            {
              speaker: "Kemal (Anda)",
              en: "Let us cover three things: reviewing the document pack, mapping out our initial target products for hospitals and clinics in Indonesia, and planning your one-week schedule in Jakarta starting 28 or 29 November.",
              id: "Mari kita bahas tiga hal: meninjau paket dokumen, memetakan produk target awal untuk rumah sakit dan klinik di Indonesia, serta menyusun jadwal satu minggu Anda di Jakarta mulai 28 atau 29 November."
            },
            {
              speaker: "Mr. Malik",
              en: "How ready is your business infrastructure on the ground right now?",
              id: "Seberapa siap infrastruktur bisnis Anda di lapangan saat ini?"
            },
            {
              speaker: "Kemal (Anda)",
              en: "Our distribution license framework, warehouse facility, and commercial sales team are ready. Having you here in person will allow us to align pricing, demo units, and marketing materials directly with our team.",
              id: "Kerangka izin distribusi, fasilitas gudang, dan tim penjualan komersial kami sudah siap. Kehadiran Anda secara langsung akan memungkinkan kita menyelaraskan harga, unit demo, dan materi pemasaran langsung bersama tim."
            }
          ],
          keyPhrases: [
            { en: "Finalize all details before your arrival", id: "Merampungkan seluruh detail sebelum kedatangan Anda" },
            { en: "Map out our initial target products", id: "Memetakan produk-produk sasaran awal kita" },
            { en: "On the ground", id: "Secara nyata di lapangan atau di lokasi pasar tujuan" },
            { en: "Align pricing, demo units, and marketing materials", id: "Menyelaraskan skema harga, unit peraga, dan materi pemasaran" }
          ]
        },
        advance: {
          cefr: "C1 - C2",
          focus: "Mempresentasikan kesiapan pasar berstandar direksi dan merancang kunjungan 1 minggu bernilai strategis tinggi.",
          lines: [
            {
              speaker: "Kemal (Anda)",
              en: "We warmly welcome both the upcoming Zoom session and your planned week in Jakarta around 28 November. To maximize the value of your visit, I propose we use next week's call as a strategic alignment session so our face-to-face meetings can focus squarely on commercial execution.",
              id: "Kami menyambut hangat sesi Zoom mendatang maupun rencana kunjungan sepekan Anda ke Jakarta sekitar tanggal 28 November. Agar kunjungan Anda menghasilkan dampak maksimal, saya mengusulkan rapat minggu depan dipakai sebagai penyelarasan strategis sehingga pertemuan tatap muka nanti bisa fokus penuh pada eksekusi komersial."
            },
            {
              speaker: "Mr. Malik",
              en: "That aligns with my exact objective for this trip. What does the operational readiness look like across your target hospital segments?",
              id: "Itu tepat sekali dengan tujuan perjalanan saya kali ini. Seperti apa gambaran kesiapan operasional Anda di segmen rumah sakit sasaran?"
            },
            {
              speaker: "Kemal (Anda)",
              en: "On the operational front, our corporate entity, distribution channels, and quality workflows under IDAK and CDAKB standards are well underway. During your week in Indonesia, we can arrange a warehouse and office walkthrough, a deep-dive on exclusive product positioning, and introductory meetings with key clinical decision-makers in Jakarta.",
              id: "Dari sisi operasional, entitas perusahaan, jalur distribusi, serta alur mutu sesuai standar IDAK dan CDAKB kami berjalan matang. Selama sepekan Anda di Indonesia, kita bisa agendakan peninjauan kantor dan gudang, pembahasan mendalam posisi produk eksklusif, serta pertemuan perkenalan dengan pengambil keputusan klinis utama di Jakarta."
            },
            {
              speaker: "Mr. Malik",
              en: "That sounds comprehensive. Once my tickets and hotel booking are locked in, I will send over the exact itinerary so we can carve out dedicated blocks each day.",
              id: "Terdengar sangat komprehensif. Begitu tiket pesawat dan pemesanan hotel saya terkunci, saya akan kirimkan jadwal tepatnya agar kita bisa menetapkan blok waktu khusus setiap hari."
            },
            {
              speaker: "Kemal (Anda)",
              en: "Splendid. Do let us know which district you prefer to stay in; we can recommend executive hotels with smooth access to our meeting venues and handle your airport transfer upon arrival.",
              id: "Sempurna. Beri tahu kami area mana yang Anda sukai untuk menginap; kami dapat merekomendasikan hotel eksekutif dengan akses mudah ke lokasi pertemuan serta mengatur penjemputan bandara saat Anda tiba."
            }
          ],
          keyPhrases: [
            { en: "Focus squarely on commercial execution", id: "Berfokus penuh pada eksekusi bisnis dan penjualan" },
            { en: "Well underway", id: "Sudah berjalan dengan sangat baik dan menunjukkan kemajuan nyata" },
            { en: "Deep-dive on exclusive product positioning", id: "Pembahasan mendalam mengenai posisi produk eksklusif di pasar" },
            { en: "Carve out dedicated blocks", id: "Menyisihkan slot waktu khusus yang fokus" }
          ]
        }
      }
    },
    {
      id: "conv-jemput-makan",
      no: 5,
      category: "Saat Menjemput & Makan Malam",
      title: "Menjemput di Bandara, Ngobrol di Jalan & Makan Malam Bisnis",
      subtitle: "Percakapan hangat tuan rumah Indonesia: dari penjemputan Soekarno-Hatta sampai memesan makanan halal bersama.",
      situation: "Anda menjemput mitra asing saat baru mendarat di Jakarta, berbincang santai di mobil menuju hotel, atau menemani makan malam bisnis pertama.",
      culturalNote: "Penutur asli tidak membanjiri tamu dengan presentasi bisnis saat baru turun dari pesawat. Tanyakan kenyamanan perjalanan mereka, bantu hal praktis (air minum, SIM card, istirahat), lalu bawa obrolan ringan soal kuliner Indonesia.",
      tiers: {
        mudah: {
          cefr: "A1 - A2",
          focus: "Kalimat sederhana yang sopan saat menyambut tamu lelah setelah penerbangan.",
          lines: [
            {
              speaker: "Kemal (Anda)",
              en: "Welcome to Jakarta, Mr. Malik! Did you have a good flight?",
              id: "Selamat datang di Jakarta, Pak Malik! Apakah penerbangan Anda nyaman?"
            },
            {
              speaker: "Mr. Malik",
              en: "Thank you, Kemal! It was a long flight, but smooth. Very nice to finally meet you in person.",
              id: "Terima kasih, Kemal! Penerbangannya cukup panjang tetapi lancar. Senang akhirnya bisa bertemu langsung."
            },
            {
              speaker: "Kemal (Anda)",
              en: "Nice to meet you in person too. Here is some bottled water. Let us go to the hotel first so you can rest.",
              id: "Senang bertemu langsung juga dengan Anda. Ini ada air mineral. Mari kita ke hotel dulu supaya Anda bisa beristirahat."
            },
            {
              speaker: "Mr. Malik",
              en: "Thank you, that would be very helpful. What kind of food do you recommend for dinner later?",
              id: "Terima kasih, itu sangat membantu. Makanan apa yang Anda rekomendasikan untuk makan malam nanti?"
            },
            {
              speaker: "Kemal (Anda)",
              en: "We have great Indonesian grilled chicken, beef rendang, and satay, and everything is halal. We can have dinner at seven if you feel rested.",
              id: "Kami punya ayam bakar Indonesia yang enak, rendang daging, dan sate, dan semuanya halal. Kita bisa makan malam jam tujuh kalau Anda sudah segar."
            }
          ],
          keyPhrases: [
            { en: "Did you have a good flight?", id: "Apakah penerbangan Anda menyenangkan dan nyaman?" },
            { en: "Meet you in person", id: "Bertemu langsung secara tatap muka" },
            { en: "So you can rest", id: "Supaya Anda bisa beristirahat" },
            { en: "Everything is halal", id: "Semua makanannya terjamin halal" }
          ]
        },
        menengah: {
          cefr: "B1 - B2",
          focus: "Obrolan alami di dalam mobil, menjelaskan Jakarta sambil menawarkan kenyamanan praktis untuk tamu.",
          lines: [
            {
              speaker: "Kemal (Anda)",
              en: "Great to finally shake hands in person, Nadeem. How was immigration and baggage claim at the terminal?",
              id: "Senang akhirnya bisa bersalaman langsung, Nadeem. Bagaimana proses imigrasi dan pengambilan bagasi di terminal tadi?"
            },
            {
              speaker: "Mr. Malik",
              en: "Surprisingly smooth, much quicker than I expected. Jakarta looks impressive from the highway.",
              id: "Ternyata sangat lancar, jauh lebih cepat dari dugaan saya. Jakarta terlihat mengesankan dari jalan tol."
            },
            {
              speaker: "Kemal (Anda)",
              en: "I am glad to hear that. The drive to your hotel takes roughly forty minutes depending on evening traffic. Do you need a local SIM card or anything along the way?",
              id: "Syukurlah kalau begitu. Perjalanan ke hotel Anda sekitar empat puluh menit tergantung lalu lintas sore ini. Apakah Anda perlu kartu SIM lokal atau keperluan apa pun di jalan?"
            },
            {
              speaker: "Mr. Malik",
              en: "My roaming plan works fine, thank you. I would love to try authentic Indonesian food while I am here, just not too spicy on the first night.",
              id: "Paket roaming saya lancar, terima kasih. Saya ingin sekali mencoba makanan Indonesia asli selama di sini, asal jangan terlalu pedas di malam pertama."
            },
            {
              speaker: "Kemal (Anda)",
              en: "No problem at all. I know a quiet, comfortable restaurant where the spice level can be adjusted, and we can keep tomorrow morning relaxed starting around ten so you recover from travel.",
              id: "Tidak masalah sama sekali. Saya tahu restoran yang tenang dan nyaman dengan tingkat pedas yang bisa diatur, dan kita bisa mulai besok pagi dengan santai sekitar jam sepuluh agar Anda pulih dari perjalanan."
            }
          ],
          keyPhrases: [
            { en: "Shake hands in person", id: "Bersalaman langsung secara tatap muka" },
            { en: "Takes roughly forty minutes", id: "Memakan waktu kurang lebih empat puluh menit" },
            { en: "Spice level can be adjusted", id: "Tingkat kepedasannya bisa disesuaikan" },
            { en: "Recover from travel", id: "Memulihkan tenaga setelah perjalanan jauh" }
          ]
        },
        advance: {
          cefr: "C1 - C2",
          focus: "Keramahan eksekutif berkelas: memadukan kenyamanan personal tamu, cerita budaya, dan penghormatan waktu istirahat.",
          lines: [
            {
              speaker: "Kemal (Anda)",
              en: "Welcome to Indonesia, Nadeem. After a multi-leg flight, I imagine a smooth transfer and a quiet evening are at the top of your wish list, so let us take it easy tonight and save the heavy agenda for tomorrow.",
              id: "Selamat datang di Indonesia, Nadeem. Setelah penerbangan jarak jauh dengan transit, saya yakin perjalanan yang mulus ke hotel dan malam yang tenang menjadi prioritas utama Anda, jadi malam ini kita santai saja dan agenda berat kita simpan untuk besok."
            },
            {
              speaker: "Mr. Malik",
              en: "You read my mind, Kemal. I appreciate your thoughtfulness. By the way, how long have you been building your network across this part of the city?",
              id: "Anda tepat sekali membaca pikiran saya, Kemal. Saya sangat menghargai perhatian Anda. Ngomong-ngomong, sudah berapa lama Anda membangun jaringan kerja di area kota ini?"
            },
            {
              speaker: "Kemal (Anda)",
              en: "We have been expanding steadily for the past several years, building relationships directly with hospital procurement teams and medical directors. Once you settle into the hotel and catch your breath, I would be delighted to host you for dinner nearby so you can taste Indonesian cuisine without the long commute.",
              id: "Kami terus berkembang bertahap selama beberapa tahun terakhir, membangun relasi langsung dengan tim pengadaan rumah sakit serta direktur medis. Begitu Anda check-in di hotel dan beristirahat sejenak, saya senang sekali bisa menjamu makan malam di tempat dekat hotel agar Anda dapat menikmati hidangan Indonesia tanpa menempuh macet panjang."
            },
            {
              speaker: "Mr. Malik",
              en: "That sounds wonderful. Eight o'clock in the lobby works perfectly, and then tomorrow we can dive into our product roadmap.",
              id: "Terdengar luar biasa. Jam delapan malam di lobi sangat pas, lalu besok kita bisa langsung masuk ke peta jalan produk kita."
            }
          ],
          keyPhrases: [
            { en: "At the top of your wish list", id: "Menjadi hal yang paling Anda butuhkan atau inginkan saat ini" },
            { en: "Catch your breath", id: "Menarik napas dan beristirahat sejenak setelah kesibukan/perjalanan" },
            { en: "Host you for dinner nearby", id: "Menjamu Anda makan malam di restoran yang dekat lokasinya" },
            { en: "Without the long commute", id: "Tanpa harus menempuh perjalanan jalan raya yang panjang" }
          ]
        }
      }
    },
    {
      id: "conv-kehidupan-pengusaha",
      no: 6,
      category: "Cerita Bisnis & Keseharian Usaha",
      title: "Berbagi Pengalaman Membangun Bisnis, Tantangan & Keseimbangan Hidup",
      subtitle: "Obrolan mendalam antar-mitra: bagaimana mengelola tim, menghadapi aturan pemerintah, dan menjaga semangat kerja.",
      situation: "Di sela kopi sore atau makan siang saat membahas kondisi ekonomi saat ini, tantangan menjalankan bisnis kesehatan/ekspor, dan menjaga fokus jangka panjang.",
      culturalNote: "Mitra bisnis asing sangat menghargai pengusaha yang jujur menjelaskan realita pasar lokal (regulasi ketat, siklus pengadaan klinik) namun tetap tenang, punya solusi, dan fokus pada visi jangka panjang.",
      tiers: {
        mudah: {
          cefr: "A1 - A2",
          focus: "Bercerita singkat tentang kesibukan mengelola perusahaan, tim, dan target tahun ini.",
          lines: [
            {
              speaker: "Mr. Malik",
              en: "How is business in Indonesia this year? Is the medical market growing?",
              id: "Bagaimana kondisi bisnis di Indonesia tahun ini? Apakah pasar alat kesehatan sedang tumbuh?"
            },
            {
              speaker: "Kemal (Anda)",
              en: "Yes, the demand is growing because clinics and hospitals need better equipment. The rules are strict, so we work hard on quality and permits.",
              id: "Ya, permintaannya tumbuh karena klinik dan rumah sakit butuh peralatan yang lebih baik. Aturannya ketat, jadi kami bekerja keras menjaga mutu dan perizinan."
            },
            {
              speaker: "Mr. Malik",
              en: "That is true. Do you have a big team helping you every day?",
              id: "Benar sekali. Apakah Anda punya tim besar yang membantu setiap hari?"
            },
            {
              speaker: "Kemal (Anda)",
              en: "We have a focused and reliable team. Everybody helps each other with sales, documents, and warehouse work.",
              id: "Kami memiliki tim yang fokus dan bisa diandalkan. Semua saling membantu di bagian penjualan, dokumen, dan gudang."
            }
          ],
          keyPhrases: [
            { en: "The demand is growing", id: "Permintaan pasar terus meningkat" },
            { en: "The rules are strict", id: "Peraturan atau regulasinya cukup ketat" },
            { en: "Focused and reliable team", id: "Tim yang terfokus dan dapat dipercaya" }
          ]
        },
        menengah: {
          cefr: "B1 - B2",
          focus: "Membahas dinamika persaingan sehat, kesabaran menghadapi perizinan, dan hubungan kerja sama jangka panjang.",
          lines: [
            {
              speaker: "Mr. Malik",
              en: "Running distribution and export at the same time must keep you on your toes. What is the biggest challenge in Indonesia right now?",
              id: "Menjalankan distribusi sekaligus ekspor pasti membuat Anda harus selalu sigap. Apa tantangan terbesar di Indonesia sekarang?"
            },
            {
              speaker: "Kemal (Anda)",
              en: "Honestly, balancing speed with regulatory compliance. Healthcare buyers expect fast delivery and reliable after-sales service, while government licensing takes patience and careful paperwork. Once your permits are approved, though, that rigor actually protects serious players like us.",
              id: "Terus terang, menyeimbangkan kecepatan dengan kepatuhan regulasi. Pembeli di bidang kesehatan mengharapkan pengiriman cepat dan layanan purnajual yang handal, sementara perizinan pemerintah menuntut kesabaran dan berkas yang rapi. Namun begitu izin terbit, ketatnya aturan itu justru melindungi pelaku usaha yang serius seperti kita."
            },
            {
              speaker: "Mr. Malik",
              en: "I like that perspective. Strict standards raise the barrier for low-quality competitors.",
              id: "Saya suka cara pandang itu. Standar yang ketat membatasi pesaing yang bermutu rendah."
            },
            {
              speaker: "Kemal (Anda)",
              en: "Exactly. That is why we only partner with manufacturers who care about consistent quality and long-term support rather than quick, one-off deals.",
              id: "Tepat. Itu sebabnya kami hanya bermitra dengan pabrikan yang peduli pada konsistensi mutu dan dukungan jangka panjang, bukan transaksi sesaat."
            }
          ],
          keyPhrases: [
            { en: "Keep you on your toes", id: "Membuat Anda terus sigap, fokus, dan tidak lengah" },
            { en: "Balance speed with regulatory compliance", id: "Menyeimbangkan kecepatan eksekusi dengan kepatuhan aturan" },
            { en: "Raise the barrier for competitors", id: "Menaikkan standar sehingga pesaing sembarangan sulit masuk" },
            { en: "Quick, one-off deals", id: "Transaksi jual-putus sekali saja tanpa kelanjutan" }
          ]
        },
        advance: {
          cefr: "C1 - C2",
          focus: "Diskusi strategis antar pimpinan perusahaan (peer-to-peer vision) tentang ketahanan usaha dan integritas kemitraan.",
          lines: [
            {
              speaker: "Mr. Malik",
              en: "Having built our instrument manufacturing across borders, I have noticed that reliable local stewardship makes or breaks any expansion. How do you view our shared opportunity over the next three to five years?",
              id: "Setelah membangun manufaktur instrumen lintas negara, saya melihat bahwa pengurusan lokal yang amanah menjadi penentu berhasil tidaknya sebuah ekspansi. Bagaimana Anda memandang peluang bersama kita dalam tiga sampai lima tahun ke depan?"
            },
            {
              speaker: "Kemal (Anda)",
              en: "Our thesis is straightforward: Indonesia's healthcare modernization is structural, not cyclical. Hospitals are upgrading clinical standards rapidly, and what sets a lasting partnership apart is mutual transparency, dependable technical documentation, and disciplined after-sales execution.",
              id: "Pandangan kami lugas: modernisasi layanan kesehatan Indonesia bersifat struktural, bukan tren sesaat. Rumah sakit menaikkan standar klinis dengan cepat, dan yang membedakan kemitraan berumur panjang adalah transparansi timbal balik, dokumen teknis yang terpercaya, serta disiplin layanan purnajual."
            },
            {
              speaker: "Mr. Malik",
              en: "That long-horizon mindset mirrors our philosophy at Bushido Instruments. Sustainable trust compounds faster than short-term margin.",
              id: "Pola pikir jangka panjang itu selaras dengan filosofi kami di Bushido Instruments. Kepercayaan yang terjaga berlipat ganda lebih cepat dibanding sekadar margin jangka pendek."
            },
            {
              speaker: "Kemal (Anda)",
              en: "Indeed. When both principals and local distributors operate with integrity and clear accountability, overcoming currency swings or bureaucratic bottlenecks becomes a routine operational step rather than a crisis.",
              id: "Benar sekali. Ketika pihak pabrikan maupun distributor lokal sama-sama bergerak dengan integritas dan pembagian tanggung jawab yang jelas, mengatasi fluktuasi kurs atau hambatan birokrasi tinggal menjadi langkah kerja rutin, bukan krisis."
            }
          ],
          keyPhrases: [
            { en: "Makes or breaks an expansion", id: "Menjadi faktor penentu sukses atau gagalnya perluasan usaha" },
            { en: "Structural, not cyclical", id: "Perubahan mendasar jangka panjang, bukan sekadar siklus sementara" },
            { en: "Long-horizon mindset", id: "Pola pikir visioner jangka panjang" },
            { en: "Compounds faster than...", id: "Bertumbuh berlipat ganda lebih cepat daripada..." }
          ]
        }
      }
    },
    {
      id: "conv-penutup-tindak-lanjut",
      no: 7,
      category: "Menutup Rapat & Tindak Lanjut",
      title: "Merangkum Action Items, Jadwal Kirim Dokumen & Penutup Berkesan",
      subtitle: "Cara menutup Zoom atau rapat tatap muka agar semua poin sepakat tertulis jelas dan hubungan tetap hangat.",
      situation: "Menit-menit terakhir di akhir Zoom meeting atau perpisahan setelah rangkaian pertemuan bisnis di Jakarta.",
      culturalNote: "Jangan akhiri rapat bisnis hanya dengan 'Okay thank you, bye'. Selalu sebutkan siapa mengirim apa dan kapan waktunya ('We will send X by Friday'), lalu tutup dengan ucapan apresiasi hangat.",
      tiers: {
        mudah: {
          cefr: "A1 - A2",
          focus: "Menyebutkan 2 sampai 3 tugas tindak lanjut yang mudah dicatat dan ucapan terima kasih sopan.",
          lines: [
            {
              speaker: "Kemal (Anda)",
              en: "Thank you for your time today, Mr. Malik. Let me summarize our next steps.",
              id: "Terima kasih atas waktu Anda hari ini, Pak Malik. Izinkan saya merangkum langkah kita selanjutnya."
            },
            {
              speaker: "Mr. Malik",
              en: "Yes, please go ahead.",
              id: "Ya, silakan."
            },
            {
              speaker: "Kemal (Anda)",
              en: "You will share the ready documents this week, and we will check them right away. Next week we will confirm the Zoom link and your Jakarta travel schedule.",
              id: "Anda akan membagikan dokumen yang sudah siap minggu ini, dan kami akan langsung memeriksanya. Minggu depan kita pastikan tautan Zoom dan jadwal perjalanan Anda ke Jakarta."
            },
            {
              speaker: "Mr. Malik",
              en: "Sounds clear and simple. I will send an email with the attachments soon.",
              id: "Terdengar jelas dan sederhana. Saya akan segera kirim email berisi lampirannya."
            },
            {
              speaker: "Kemal (Anda)",
              en: "Thank you very much. Have a great rest of the week, and we will talk again soon!",
              id: "Terima kasih banyak. Selamat melanjutkan aktivitas minggu ini, dan kita berbicara lagi segera!"
            }
          ],
          keyPhrases: [
            { en: "Let me summarize our next steps", id: "Izinkan saya merangkum langkah kita berikutnya" },
            { en: "Right away", id: "Segera / langsung saat itu juga" },
            { en: "Have a great rest of the week", id: "Semoga sisa minggu Anda berjalan menyenangkan" }
          ]
        },
        menengah: {
          cefr: "B1 - B2",
          focus: "Mengonfirmasi notulensi singkat, tenggat waktu bersama, serta mendoakan kelancaran persiapan perjalanan tamu.",
          lines: [
            {
              speaker: "Kemal (Anda)",
              en: "Before we wrap up today, let us quickly recap our action items so both teams stay on the same page.",
              id: "Sebelum kita tutup hari ini, mari kita rangkum cepat daftar tindak lanjut agar kedua tim memiliki pemahaman yang sama."
            },
            {
              speaker: "Mr. Malik",
              en: "Great habit. Go ahead, Kemal.",
              id: "Kebiasaan yang bagus. Silakan, Kemal."
            },
            {
              speaker: "Kemal (Anda)",
              en: "First, your team will upload the document package once the final review finishes. Second, I will send a short summary email with two Zoom time slots for next week. Third, once your flights to Jakarta are confirmed for late November, we will finalize the meeting agenda.",
              id: "Pertama, tim Anda akan mengirim paket dokumen begitu pemeriksaan akhir selesai. Kedua, saya akan mengirim email ringkas berisi dua opsi waktu Zoom untuk minggu depan. Ketiga, setelah penerbangan Anda ke Jakarta akhir November terkonfirmasi, kita finalisasi agenda pertemuan."
            },
            {
              speaker: "Mr. Malik",
              en: "Everything is crystal clear. Thank you for making the coordination effortless on your side.",
              id: "Semuanya sangat jelas. Terima kasih sudah membuat koordinasi berjalan mudah dari pihak Anda."
            },
            {
              speaker: "Kemal (Anda)",
              en: "Always a pleasure working together. Wishing you a productive week ahead, and I look forward to our Zoom session.",
              id: "Selalu menyenangkan bekerja sama. Semoga minggu Anda produktif, dan saya menantikan sesi Zoom kita."
            }
          ],
          keyPhrases: [
            { en: "Before we wrap up today", id: "Sebelum kita mengakhiri pertemuan hari ini" },
            { en: "Stay on the same page", id: "Memiliki pemahaman yang sama dan seragam" },
            { en: "Crystal clear", id: "Sangat jelas dan tidak menimbulkan keraguan" }
          ]
        },
        advance: {
          cefr: "C1 - C2",
          focus: "Penguncian komitmen strategis pasca-rapat dengan bahasa profesional yang hangat dan berwibawa.",
          lines: [
            {
              speaker: "Kemal (Anda)",
              en: "As we draw our session to a close, I will circulate a concise memorandum of discussion within the next few hours outlining document milestones, regulatory checkpoints, and our proposed agenda for your week in Jakarta.",
              id: "Menjelang penutupan sesi ini, saya akan mengirimkan ringkasan poin diskusi dalam beberapa jam ke depan yang memuat target dokumen, titik pengecekan regulasi, serta usulan agenda untuk kunjungan sepekan Anda di Jakarta."
            },
            {
              speaker: "Mr. Malik",
              en: "That will be extremely useful for our internal alignment before I board the flight on the twenty-eighth.",
              id: "Itu akan sangat bermanfaat bagi penyelarasan internal kami sebelum saya terbang pada tanggal dua puluh delapan."
            },
            {
              speaker: "Kemal (Anda)",
              en: "Should any last-minute regulatory questions arise from your compliance team, feel free to ping me directly so we resolve them well before departure. Wishing you smooth preparations ahead, and we look forward to welcoming you warmly to Indonesia.",
              id: "Apabila muncul pertanyaan regulasi mendadak dari tim kepatuhan Anda, silakan hubungi saya langsung agar kita selesaikan jauh sebelum keberangkatan. Semoga persiapannya berjalan mulus, dan kami menantikan saat menyambut Anda dengan hangat di Indonesia."
            }
          ],
          keyPhrases: [
            { en: "Draw our session to a close", id: "Menutup sesi pertemuan kita secara resmi dan halus" },
            { en: "Memorandum of discussion", id: "Catatan ringkas hasil kesepakatan rapat" },
            { en: "Well before departure", id: "Jauh sebelum waktu keberangkatan tiba" },
            { en: "Ping me directly", id: "Hubungi saya langsung secara cepat (konteks kerja santai-profesional)" }
          ]
        }
      }
    }
  ];

  /*
   * Studio Balasan Email & WhatsApp (Studi Kasus Nyata: Email Mr. Nadeem Malik - Bushido Instruments)
   * Dirancang khusus dengan 3 tingkatan (Mudah, Menengah, Advance) dalam 2 format (Email Formal & WhatsApp).
   * Menggunakan placeholder [Hari & Jam Pilihan Anda] agar pengguna bebas menyesuaikan jadwal sendiri.
   */
  var replyTemplates = [
    {
      level: "mudah",
      cefr: "Mudah (A1 - A2)",
      title: "Ringkas, Jelas, Sopan & Mudah Diucapkan",
      emailSubject: "Re: Documents, Zoom Meeting Next Week & Your Jakarta Visit",
      emailBody: "Dear Mr. Nadeem Malik,\n\nThank you very much for your email and good news about the documents. We will wait for the files when they are ready.\n\nYes, I would be happy to have a Zoom meeting next week. How about [Hari & Jam Pilihan Anda] Jakarta time? Please let me know if that works for you.\n\nWe are also very excited to welcome you to Jakarta on 28 or 29 November 2026. One week in Indonesia is a great plan. Once your flight is confirmed, please share your details so we can prepare our meeting schedule and help with your stay.\n\nLooking forward to talking with you next week!\n\nBest regards,\nKemal Thoriq",
      waBody: "Hello Mr. Malik, thank you for your email! Happy to hear the documents are almost ready. For our Zoom meeting next week, is [Hari & Jam Pilihan Anda] Jakarta time okay for you? Also, we are very excited to welcome you to Jakarta on 28-29 November for a week. Let us know when you confirm your flight!",
      tip: "Kalimat pendek, bebas dari idiom sulit, tetapi tetap hangat dan menjawab seluruh 4 poin email Mr. Malik (dokumen, Zoom, kedatangan 28-29 Nov, penawaran bantuan jadwal)."
    },
    {
      level: "menengah",
      cefr: "Menengah (B1 - B2)",
      title: "Profesional Standar Bisnis Internasional",
      emailSubject: "Re: Document Update, Next Week's Zoom Call & Jakarta Visit Confirmation",
      emailBody: "Dear Mr. Nadeem Malik,\n\nThank you for the update and for your team's effort in finalizing the documents. Please feel free to share the digital copies whenever they are ready so our regulatory team can review them promptly.\n\nI would gladly arrange a Zoom meeting next week to align on our next steps and review our market opportunities. Would [Hari & Jam Pilihan Anda, misal: Tuesday or Wednesday at 2:00 PM Jakarta time (WIB / UTC+7)] work with your schedule? Feel free to suggest another slot if needed.\n\nIt is wonderful news that you plan to visit Jakarta around 28 or 29 November 2026 for a week. We will be delighted to host you in person, show you our readiness here in Indonesia, and discuss our cooperation thoroughly. Once your itinerary is confirmed, please share your flight details so we can help arrange hotel options and meeting logistics.\n\nLooking forward to our discussion next week.\n\nWarm regards,\nKemal Thoriq",
      waBody: "Hi Mr. Malik, thank you for the kind email! We really appreciate your team's work on the documents. Would [Hari & Jam Pilihan Anda, WIB / UTC+7] work for our Zoom call next week? Also, we are excited to welcome you to Jakarta around 28-29 November. Looking forward to meeting in person and discussing our cooperation!",
      tip: "Memakai frasa standar kantor global ('align on our next steps', 'review them promptly', 'delighted to host you', serta pencantuman zona waktu WIB/UTC+7 untuk menghindari bentrok jam)."
    },
    {
      level: "advance",
      cefr: "Advance (C1 - C2)",
      title: "Bahasa Eksekutif & Tuan Rumah Berkelas",
      emailSubject: "Re: Regulatory Documents, Pre-Visit Zoom Alignment & November Jakarta Visit",
      emailBody: "Dear Mr. Nadeem Malik,\n\nThank you warmly for your message and for the thorough work your team has put into finalizing our documents. Having the soft copies ahead of your trip will give our compliance team valuable lead time to verify alignment for our Indonesian regulatory filings.\n\nI wholeheartedly welcome a Zoom session next week so we can lock in the next milestones and explore broader commercial avenues together. May I propose [Hari & Jam Pilihan Anda, misal: Tuesday or Wednesday between 2:00 PM and 4:00 PM Jakarta time (UTC+7)]? If an alternative window suits you better, kindly let me know and we will gladly accommodate.\n\nWe are equally delighted by your plan to spend approximately one week in Jakarta starting 28 or 29 November 2026. Meeting face-to-face will allow us to walk through our operational readiness on the ground, align our distribution strategy, and set a solid foundation for long-term cooperation with Bushido Instruments. Once your travel itinerary is finalized, do let us know if we may assist with executive hotel recommendations or airport pickup.\n\nLooking forward to reconnecting on Zoom next week and welcoming you soon in Jakarta.\n\nWarmest regards,\nKemal Thoriq",
      waBody: "Dear Nadeem, thank you for your thoughtful email. Having the digital documents ahead of your visit will give our team helpful lead time on local compliance. Would [Hari & Jam Pilihan Anda, UTC+7] suit you for next week's Zoom alignment? We are thrilled to host your one-week Jakarta visit around 28-29 November and would be happy to assist with local arrangements once your flight is confirmed.",
      tip: "Menggunakan kosakata strategis level C1-C2 ('valuable lead time', 'commercial avenues', 'operational readiness on the ground', 'solid foundation for long-term cooperation') yang sangat berwibawa."
    }
  ];

  window.JAGO_CONVERSATION_DATA = {
    scenarios: scenarios,
    replyTemplates: replyTemplates
  };
})();
