window.COACH_DATA = (function () {
  "use strict";

  function pluralize(noun) {
    var n = noun.toLowerCase();
    if (/[^aeiou]y$/.test(n)) return noun.slice(0, -1) + "ies";
    if (/(s|x|ch|sh)$/.test(n)) return noun + "es";
    return noun + "s";
  }

  function inflectThirdPerson(verb) {
    var v = verb.toLowerCase();
    var irregular = { have: "has", go: "goes", do: "does", try: "tries", study: "studies", carry: "carries", worry: "worries", reply: "replies", apply: "applies", supply: "supplies", fly: "flies" };
    if (irregular[v]) return irregular[v];
    if (/[^aeiou]y$/.test(v)) return v.slice(0, -1) + "ies";
    if (/(s|x|ch|sh|o)$/.test(v)) return v + "es";
    return v + "s";
  }

  function toGerund(verb) {
    var v = verb.toLowerCase();
    var map = {
      hear: "hearing", see: "seeing", meet: "meeting", work: "working",
      receive: "receiving", discuss: "discussing", get: "getting", have: "having",
      start: "starting", join: "joining", learn: "learning", know: "knowing",
      buy: "buying", try: "trying", invest: "investing", explore: "exploring",
      do: "doing", make: "making", build: "building", create: "creating",
      pass: "passing", obtain: "obtaining", secure: "securing", enter: "entering",
      reach: "reaching", achieve: "achieving", handle: "handling", manage: "managing",
      produce: "producing", supply: "supplying", run: "running", operate: "operating"
    };
    if (map[v]) return map[v];
    if (/[^e]e$/.test(v)) return v.slice(0, -1) + "ing";
    return v + "ing";
  }

  var verbMapDo = { make: "do", makes: "does", made: "did", making: "doing" };
  var verbMapMake = { do: "make", does: "makes", did: "made", done: "made", doing: "making" };
  var turnOn = { open: "turn on", opens: "turns on", opened: "turned on", opening: "turning on" };
  var adjMap = { boring: "bored", confusing: "confused", tiring: "tired", exciting: "excited", interesting: "interested" };

  var errorRules = [
    {
      id: "id-tersebar-every", cat: "JEMBATAN INDONESIA KE INGGRIS",
      pattern: /\b(?:and\s+)?tersebar\s+in\s+every(?:\s+like)?\b/gi,
      replace: "spread across major regions such as",
      why: "Kata 'tersebar' untuk wilayah geografi diterjemahkan menjadi 'spread across' atau 'scattered across'. Frasa 'in every like' kurang lengkap karena 'every' wajib diikuti kata benda tunggal.",
      wrong: "Indonesia has several islands and tersebar in every like Java.", right: "Indonesia has thousands of islands spread across major regions such as Java."
    },
    {
      id: "id-tersebar", cat: "JEMBATAN INDONESIA KE INGGRIS",
      pattern: /\btersebar(?:\s+di|\s+in)?\b/gi,
      replace: "spread across",
      why: "'Tersebar di' dalam konteks wilayah atau distribusi pasar bahasa Inggrisnya adalah 'spread across' atau 'distributed across'.",
      wrong: "Our buyers are tersebar di Asia.", right: "Our buyers are spread across Asia."
    },
    {
      id: "id-sedang-mengurus", cat: "JEMBATAN INDONESIA KE INGGRIS",
      pattern: /\b(?:are\s+|am\s+|is\s+)?sedang\s+mengurus\b/gi,
      replace: function (m) {
        return /^(?:are|am|is)\b/i.test(m) ? m.split(/\s+/)[0] + " currently processing" : "are currently processing";
      },
      why: "'Sedang mengurus' untuk dokumen, izin, atau pendaftaran bisnis paling luwes diterjemahkan menjadi 'currently processing' atau 'currently handling'.",
      wrong: "We sedang mengurus the permits.", right: "We are currently processing the permits."
    },
    {
      id: "id-izin-edar", cat: "JEMBATAN INDONESIA KE INGGRIS",
      pattern: /\bizin\s+edar\b/gi,
      replace: "marketing authorization",
      why: "Istilah internasional resmi untuk 'izin edar' (baik BPOM maupun Kemenkes AKL/AKD) adalah 'marketing authorization' atau 'distribution permit'.",
      wrong: "We need izin edar before importing.", right: "We need marketing authorization before importing."
    },
    {
      id: "id-cukup-rumit", cat: "JEMBATAN INDONESIA KE INGGRIS",
      pattern: /\bcukup\s+rumit\b/gi,
      replace: "quite intricate",
      why: "'Cukup rumit' dapat diterjemahkan menjadi 'fairly complex' atau 'quite intricate' (kosakata C1 yang bernilai tinggi untuk menjelaskan regulasi).",
      wrong: "The registration is cukup rumit.", right: "The registration is quite intricate."
    },
    {
      id: "id-menerbitkan-surat", cat: "JEMBATAN INDONESIA KE INGGRIS",
      pattern: /\bmenerbitkan\s+(?:surat|izin|sertifikat)\b/gi,
      replace: "issue the official license",
      why: "Untuk instansi atau kementerian, 'menerbitkan surat/izin' menggunakan kolokasi resmi 'issue the license' atau 'grant the permit'.",
      wrong: "The ministry will menerbitkan surat soon.", right: "The ministry will issue the official license soon."
    },
    {
      id: "id-rumah-sakit", cat: "JEMBATAN INDONESIA KE INGGRIS",
      pattern: /\brumah\s+sakit\b/gi,
      replace: "hospitals",
      why: "'Rumah sakit' adalah 'hospital' (atau jamak 'hospitals' bila merujuk ke jaringan rumah sakit secara umum).",
      wrong: "We distribute to rumah sakit in Java.", right: "We distribute to hospitals in Java."
    },
    {
      id: "id-kadar-air", cat: "JEMBATAN INDONESIA KE INGGRIS",
      pattern: /\bkadar\s+air\b/gi,
      replace: "moisture content",
      why: "Dalam perdagangan komoditas dan rempah ekspor, 'kadar air' disebut 'moisture content'.",
      wrong: "The kadar air is below 8 percent.", right: "The moisture content is below 8 percent."
    },
    {
      id: "id-bahan-baku", cat: "JEMBATAN INDONESIA KE INGGRIS",
      pattern: /\bbahan\s+baku\b/gi,
      replace: "raw materials",
      why: "'Bahan baku' dalam industri dan rantai pasok diterjemahkan menjadi 'raw materials'.",
      wrong: "We source bahan baku from local farmers.", right: "We source raw materials from local farmers."
    },
    {
      id: "id-bea-cukai", cat: "JEMBATAN INDONESIA KE INGGRIS",
      pattern: /\bbea\s+cukai\b/gi,
      replace: "customs clearance",
      why: "'Bea cukai' dalam konteks proses ekspor-impor disebut 'customs' atau 'customs clearance'.",
      wrong: "The shipment is waiting for bea cukai.", right: "The shipment is waiting for customs clearance."
    },
    {
      id: "talking-about-opener", cat: " UNGKAPAN TRANSISI",
      pattern: /\bTalking\s+about\b/g,
      replace: "Speaking of",
      why: "Untuk membuka topik baru di awal kalimat, 'Speaking of...' atau 'Regarding...' jauh lebih alami di telinga penutur asli daripada 'Talking about...'.",
      wrong: "Talking about Indonesia, it has many islands.", right: "Speaking of Indonesia, it has thousands of islands."
    },
    {
      id: "proud-about", cat: "PREPOSISI",
      pattern: /\bproud\s+(?:about|for|with|to)\b/gi, replace: "proud of",
      why: "Kata sifat 'proud' hampir selalu berpasangan dengan 'of'. Bahasa Indonesia 'bangga akan/terhadap' tidak boleh diterjemahkan jadi 'about'.",
      wrong: "We are proud about our culture.", right: "We are proud of our culture."
    },
    {
      id: "am-agree", cat: "KALIMAT NOMINAL VS VERBAL",
      pattern: /\b(I|we|they|you|he|she)\s+(?:am|are|is|was|were)\s+agree\b/gi,
      replace: function (m, p) {
        var low = p.toLowerCase();
        return p + (low === "he" || low === "she" ? " agrees" : " agree");
      },
      why: "'Agree' adalah kata kerja, bukan kata sifat. Kata kerja aksi tidak boleh didahului am/is/are.",
      wrong: "I am agree with your proposal.", right: "I agree with your proposal."
    },
    {
      id: "is-consist-of", cat: "KALIMAT NOMINAL VS VERBAL",
      pattern: /\b(?:is|are|was|were)\s+consist(?:ed|s)?\s+of\b/gi,
      replace: "consists of",
      why: "'Consist of' adalah kata kerja aktif yang tidak pernah dipasifkan ('is consisted of' atau 'is consist of' selalu salah). Gunakan 'consists of' atau 'is made up of'.",
      wrong: "Indonesia is consist of many islands.", right: "Indonesia consists of thousands of islands."
    },
    {
      id: "extra-about", cat: "PREPOSISI BERLEBIH",
      pattern: /\b(discuss|discusses|discussed|discussing|mention|mentions|mentioned|mentioning|explain|explains|explained|explaining|describe|describes|described|describing)\s+about\b/gi,
      replace: function (m, v) { return v; },
      why: "Discuss, mention, explain, dan describe sudah transitif. Kata 'about' tidak diperlukan, berbeda dari 'bicara tentang' di bahasa Indonesia.",
      wrong: "Let's discuss about the regulations.", right: "Let's discuss the regulations."
    },
    {
      id: "return-back", cat: "REDUNDAN",
      pattern: /\b(return|returns|returned|returning|reply|replies|replied|replying|repeat|repeats|repeated)\s+(?:back|again)\b/gi,
      replace: function (m, v) { return v; },
      why: "'Return', 'reply', dan 'repeat' sudah mengandung makna kembali atau ulang. Menambah 'back' atau 'again' membuat kalimat mubazir.",
      wrong: "Please reply back soon.", right: "Please reply soon."
    },
    {
      id: "depend-of", cat: "PREPOSISI",
      pattern: /\b(depend|depends|depended|depending)\s+(?:of|from|to|with)\b/gi,
      replace: function (m, v) { return v + " on"; },
      why: "Pasangan baku adalah 'depend on'. Bukan 'depend of' atau 'depend from'.",
      wrong: "It depends of the market price.", right: "It depends on the market price."
    },
    {
      id: "married-with", cat: "PREPOSISI",
      pattern: /\bmarried\s+with\b/gi, replace: "married to",
      why: "Dalam bahasa Inggris orang 'married to' seseorang. 'Married with' hanya dipakai untuk 'married with children'.",
      wrong: "She is married with a doctor.", right: "She is married to a doctor."
    },
    {
      id: "other-hand", cat: "IDIOM",
      pattern: /\bin\s+the\s+other\s+hand\b/gi, replace: "on the other hand",
      why: "Idiom bakunya 'on the other hand'. Penguji IELTS menandai ini sebagai kesalahan kolokasi.",
      wrong: "In the other hand, the cost is high.", right: "On the other hand, the cost is high."
    },
    {
      id: "according-to-me", cat: "IDIOM & OPINI",
      pattern: /\baccording\s+to\s+(?:me|my\s+opinion)\b/gi, replace: "in my opinion",
      why: "'According to' hanya dipakai untuk mengutip pihak lain atau data eksternal ('According to the Ministry'). Untuk pendapat sendiri gunakan 'In my opinion' atau 'In my view'.",
      wrong: "According to me, this regulation is strict.", right: "In my opinion, this regulation is strict."
    },
    {
      id: "i-very-like", cat: "ADVERBIA",
      pattern: /\b(I|we|they|you|he|she)\s+very\s+(like|likes|love|loves|want|wants|need|needs|enjoy|enjoys|appreciate|appreciates)\b/gi,
      replace: function (m, p, v) { return p + " really " + v; },
      why: "'Very' tidak dipasang langsung di depan kata kerja. Gunakan 'really', 'greatly', atau letakkan 'very much' setelah objek.",
      wrong: "I very like Indonesian food.", right: "I really like Indonesian food."
    },
    {
      id: "enough-order", cat: "URUTAN KATA",
      pattern: /\benough\s+(good|big|small|fast|strong|large|clear|easy|early|mature|ready|safe|high|low)\b/gi,
      replace: function (m, a) { return a + " enough"; },
      why: "Dengan kata sifat, 'enough' diletakkan sesudahnya: 'good enough'. Dengan kata benda baru di depan: 'enough money'.",
      wrong: "The quality is enough good.", right: "The quality is good enough."
    },
    {
      id: "do-mistake", cat: "KOLOKASI",
      pattern: /\b(do|does|did|done|doing)\s+(a\s+)?mistake(s?)\b/gi,
      replace: function (m, v, a, s) { return verbMapMake[v.toLowerCase()] + " " + (a || "") + "mistake" + s; },
      why: "Kolokasinya 'make a mistake', bukan 'do a mistake'. 'Do' dipakai untuk aktivitas (do homework), 'make' untuk hasil.",
      wrong: "I did a mistake in the report.", right: "I made a mistake in the report."
    },
    {
      id: "make-research", cat: "KOLOKASI",
      pattern: /\b(make|makes|made|making)\s+(?:a\s+)?research(?:es)?\b/gi,
      replace: function (m, v) { return verbMapDo[v.toLowerCase()] + " research"; },
      why: "Kolokasinya 'do research' (uncountable). 'Make a research' tidak natural.",
      wrong: "We made a research about the market.", right: "We did research on the market."
    },
    {
      id: "open-light", cat: "KOLOKASI",
      pattern: /\b(open|opens|opened|opening)\s+the\s+(light|lights|tv|computer|laptop|aircon|ac)\b/gi,
      replace: function (m, v, o) { return turnOn[v.toLowerCase()] + " the " + o; },
      why: "Perangkat elektronik 'dinyalakan' dengan 'turn on', bukan 'open'. Terjemahan 'buka lampu' tidak berlaku di bahasa Inggris.",
      wrong: "Please open the light.", right: "Please turn on the light."
    },
    {
      id: "boring-bored", cat: "ADJEKTIVA -ING / -ED",
      pattern: /\b(I|we|he|she|they)(\s+am|\s+are|\s+is|'m|'re|'s)\s+(boring|confusing|tiring|exciting|interesting)\b/gi,
      replace: function (m, p, be, adj) { return p + be + " " + adjMap[adj.toLowerCase()]; },
      why: "Perasaan orang memakai -ed (bored, interested). -ing menjelaskan sifat benda atau situasi penyebabnya.",
      wrong: "I am boring in the meeting.", right: "I am bored in the meeting."
    },
    {
      id: "look-forward-v1", cat: "GERUND SETELAH PREPOSISI",
      pattern: /\b(look|looks|looked|looking)\s+forward\s+to\s+(hear|see|meet|work|receive|discuss|get|have|start|join)\b/gi,
      replace: function (m, l, v) { return l + " forward to " + toGerund(v); },
      why: "Pada frasa 'look forward to', kata 'to' adalah preposisi, bukan bagian dari infinitive. Kata kerja sesudahnya wajib berbentuk V-ing (gerund).",
      wrong: "I look forward to hear from you.", right: "I look forward to hearing from you."
    },
    {
      id: "interested-to", cat: "PREPOSISI & GERUND",
      pattern: /\binterested\s+to\s+(learn|know|buy|join|see|try|work|invest|explore)\b/gi,
      replace: function (m, v) { return "interested in " + toGerund(v); },
      why: "'Interested' berpasangan dengan 'in + V-ing' ('interested in buying'), bukan 'interested to buy'.",
      wrong: "They are interested to buy our spices.", right: "They are interested in buying our spices."
    },
    {
      id: "capable-to", cat: "PREPOSISI & GERUND",
      pattern: /\bcapable\s+to\s+(do|make|handle|manage|produce|supply|meet|run|operate)\b/gi,
      replace: function (m, v) { return "capable of " + toGerund(v); },
      why: "'Capable' selalu diikuti 'of + V-ing'. Yang memakai 'to + V1' adalah 'able to'.",
      wrong: "Our factory is capable to supply 20 tons.", right: "Our factory is capable of supplying 20 tons."
    },
    {
      id: "succeed-to", cat: "PREPOSISI & GERUND",
      pattern: /\b(succeed|succeeds|succeeded)\s+to\s+(do|make|get|build|create|pass|obtain|secure|enter|reach|achieve)\b/gi,
      replace: function (m, s, v) { return s + " in " + toGerund(v); },
      why: "'Succeed' diikuti 'in + V-ing' ('succeeded in obtaining').",
      wrong: "We succeeded to obtain the license.", right: "We succeeded in obtaining the license."
    },
    {
      id: "people-is", cat: "SUBJECT-VERB AGREEMENT",
      pattern: /\bpeople\s+(is|was|has)\b/gi,
      replace: function (m, v) {
        var low = v.toLowerCase();
        return "people " + (low === "is" ? "are" : low === "was" ? "were" : "have");
      },
      why: "'People' selalu jamak. Kata kerjanya are, were, atau have.",
      wrong: "People is proud of Indonesia.", right: "People are proud of Indonesia."
    },
    {
      id: "he-dont", cat: "SUBJECT-VERB AGREEMENT",
      pattern: /\b(he|she|it)\s+(don't|do\s+not)\b/gi,
      replace: function (m, p, d) { return p + " " + (d.toLowerCase() === "don't" ? "doesn't" : "does not"); },
      why: "Subjek orang ketiga tunggal memakai 'does', bukan 'do'.",
      wrong: "She don't work here.", right: "She doesn't work here."
    },
    {
      id: "third-person-s", cat: "SUBJECT-VERB AGREEMENT",
      pattern: /(?<!\b(?:let|make|makes|made|help|helps|watch|see|hear|have|want|need|get|to|will|would|can|could|should|must|may|might|does|did)\s)\b(he|she|it)\s+(have|go|do|work|make|need|want|like|live|know|say|get|take|come|think|use|give|try|depend|require|help|seem|look|include|contain)\b/gi,
      replace: function (m, p, v) {
        return p + " " + inflectThirdPerson(v);
      },
      why: "Present Simple dengan he/she/it wajib menambah -s atau -es pada kata kerja. Bahasa Indonesia tidak punya aturan ini sehingga sering terlewat.",
      wrong: "She work at the headquarters.", right: "She works at the headquarters."
    },
    {
      id: "singular-noun-verb-s", cat: "SUBJECT-VERB AGREEMENT",
      pattern: /\b(the|a|an|this|that|our|my|his|her|its|every|each)\s+(buyer|seller|supplier|company|government|ministry|customer|client|patient|hospital|doctor|manager|director|factory|exporter|importer|distributor|product|system|process|market|country|island|province|city|regulation|authority|report|team)\s+(need|want|have|do|go|make|take|give|require|provide|use|work|help|seem|look|depend|include|contain|support|produce|export|import)\b/gi,
      replace: function (m, det, noun, verb) {
        return det + " " + noun + " " + inflectThirdPerson(verb);
      },
      why: "Subjek benda tunggal (seperti 'the buyer', 'our company', 'this process') sama dengan he/she/it, sehingga kata kerja Present Simple wajib berakhiran -s/-es.",
      wrong: "The buyer need more information.", right: "The buyer needs more information."
    },
    {
      id: "one-of-singular", cat: "PLURAL SETELAH ONE OF",
      pattern: /\bone\s+of\s+(the|our|my|these|those)\s+(?:(?:most|very|main|biggest|largest|major|key|important|leading|best)\s+)*(island|culture|language|country|city|province|company|product|problem|reason|factor|aspect|challenge|requirement|document|hospital|buyer|supplier)\b(?!s)/gi,
      replace: function (m, det, noun) {
        var prefix = m.slice(0, m.length - noun.length);
        return prefix + pluralize(noun);
      },
      why: "Frasa 'one of the...' berarti 'salah satu dari banyak...', sehingga kata benda sesudahnya wajib jamak (-s/-es).",
      wrong: "One of the main problem is logistics.", right: "One of the main problems is logistics."
    },
    {
      id: "uncountable-s", cat: "UNCOUNTABLE NOUN",
      pattern: /\b(informations|equipments|advices|furnitures|knowledges|feedbacks|researches|luggages|baggages)\b/gi,
      replace: function (m) {
        return /researches$/i.test(m) ? m.slice(0, -2) : m.slice(0, -1);
      },
      why: "Information, equipment, advice, furniture, knowledge, feedback, dan research tidak bisa dihitung dan tidak diberi akhiran -s.",
      wrong: "We need more informations.", right: "We need more information."
    },
    {
      id: "more-better", cat: "PERBANDINGAN",
      pattern: /\b(?:more|most)\s+(better|best|easier|cheaper|faster|bigger|higher|lower|larger|smaller|stronger|worse|worst)\b/gi,
      replace: function (m, w) { return w; },
      why: "Kata sifat yang sudah berbentuk perbandingan tidak ditambah 'more' atau 'most' (double comparative).",
      wrong: "This option is more better.", right: "This option is better."
    },
    {
      id: "since-duration", cat: "TENSE & PREPOSISI WAKTU",
      pattern: /\bsince\s+((?:\d+|a|an|one|two|three|four|five|six|seven|eight|nine|ten|several|many|a few|few)\s+(?:years?|months?|weeks?|days?|hours?))\b(?!\s+ago)/gi,
      replace: function (m, d) { return "for " + d; },
      why: "'Since' diikuti titik awal (since 2022). Untuk durasi gunakan 'for' (for two years).",
      wrong: "I have lived here since two years.", right: "I have lived here for two years."
    },
    {
      id: "different-with", cat: "PREPOSISI",
      pattern: /\bdifferent\s+with\b/gi, replace: "different from",
      why: "Pasangan baku adalah 'different from'. 'Different with' adalah terjemahan langsung dari 'berbeda dengan'.",
      wrong: "Our product is different with theirs.", right: "Our product is different from theirs."
    },
    {
      id: "same-with", cat: "PREPOSISI",
      pattern: /\b(?:the\s+)?same\s+with\b/gi, replace: "the same as",
      why: "Kesamaan dinyatakan dengan 'the same as'. 'Same with' hanya dipakai di percakapan informal.",
      wrong: "This price is same with last year.", right: "This price is the same as last year."
    },
    {
      id: "listen-to", cat: "PREPOSISI HILANG",
      pattern: /\blisten(s|ed|ing)?\s+(?!to\b)(music|the music|radio|podcasts?|songs?)\b/gi,
      replace: function (m, s, o) { return "listen" + (s || "") + " to " + o; },
      why: "'Listen' selalu memakai 'to' sebelum objek. 'Mendengarkan musik' tidak diterjemahkan 'listen music'.",
      wrong: "I listen music every morning.", right: "I listen to music every morning."
    },
    {
      id: "emphasize-on", cat: "PREPOSISI BERLEBIH",
      pattern: /\b(emphasize|emphasizes|emphasized|emphasizing|emphasise|emphasised)\s+on\b/gi,
      replace: function (m, v) { return v; },
      why: "'Emphasize' transitif, tidak memakai 'on'. Kata bendanya 'emphasis on' yang memakai 'on'.",
      wrong: "We emphasize on quality.", right: "We emphasize quality."
    },
    {
      id: "acculturation-redundant", cat: "REDUNDAN",
      pattern: /\bacculturation\s+of\s+cultures?\b/gi, replace: "cultural acculturation",
      why: "'Acculturation' sudah berarti perpaduan budaya, jadi 'of culture' menumpuk makna yang sama.",
      wrong: "Indonesia has acculturation of culture.", right: "Indonesia has rich cultural acculturation."
    },
    {
      id: "much-people", cat: "COUNTABLE VS UNCOUNTABLE",
      pattern: /\bmuch\s+(people|friends|students|customers|products|documents|licenses|permits|islands|cultures|companies|buyers|hospitals)\b/gi,
      replace: function (m, n) { return "many " + n; },
      why: "Benda jamak yang bisa dihitung memakai 'many'. 'Much' hanya untuk uncountable (much money, much moisture).",
      wrong: "Much people visit Bali.", right: "Many people visit Bali."
    },
    {
      id: "plural-after-quantifier", cat: "PLURAL HILANG",
      pattern: (function () {
        var N = "culture|language|dialect|island|region|city|province|product|document|license|permit|certificate|company|supplier|buyer|hospital|regulation|requirement|factor|reason";
        var SEP = "(?:\\s*,\\s*and\\s+|\\s*,\\s*|\\s+and\\s+)";
        var tail = "(?:(" + SEP + ")(" + N + ")\\b)?";
        return new RegExp("\\b(several|many|various|numerous|a few|few|two|three|four|five|six|seven|eight|nine|ten)\\s+(" + N + ")\\b" + tail + tail, "gi");
      })(),
      replace: function (m, q, n1, s1, n2, s2, n3) {
        var out = q + " " + pluralize(n1);
        if (n2) out += s1 + pluralize(n2);
        if (n3) out += s2 + pluralize(n3);
        return out;
      },
      why: "Setelah angka atau kuantitas jamak (several, many, two), kata benda wajib jamak. Bahasa Indonesia mengulang kata atau tidak mengubahnya, bahasa Inggris wajib menambah -s.",
      wrong: "Indonesia has several culture and language.", right: "Indonesia has several cultures and languages."
    },
    {
      id: "etc-spoken", cat: "GAYA SPEAKING RESMI",
      pattern: /,\s*etc\.?(?=\s|$|[.!?])/gi,
      replace: ", and many others",
      why: "Dalam ujian IELTS dan TOEFL Speaking, mengucapkan 'et cetera' atau 'bla bla' menurunkan kesan kelancaran alami. Ganti dengan '...and many others' atau '...just to name a few'.",
      wrong: "Java, Sumatra, Kalimantan, etc.", right: "Java, Sumatra, Kalimantan, and many others."
    },
    {
      id: "peoples-check", cat: "PERIKSA KONTEKS", manual: true,
      pattern: /\bpeoples\b/gi,
      suggest: "many people",
      why: "'People' bermakna orang dan tidak diberi -s. 'Peoples' hanya benar jika maksudmu 'bangsa-bangsa' (the indigenous peoples of Papua).",
      wrong: "Many peoples visit Jakarta.", right: "Many people visit Jakarta."
    },
    {
      id: "can-live-want", cat: "MODAL & MAKNA", manual: true,
      pattern: /\b(?:anywhere|wherever)\s+(?:we|I|they|you)\s+can\s+(?:live|work|study|stay)\b/gi,
      suggest: "anywhere we want to live",
      why: "'Can live' berarti mampu secara fisik atau hukum. Untuk kebebasan memilih tempat tinggal, maknanya 'want to live' atau 'feel at home'.",
      wrong: "We can choose anywhere we can live.", right: "We can choose anywhere we want to live."
    },
    {
      id: "several-scale", cat: "KETEPATAN FAKTA", manual: true,
      pattern: /\bseveral\s+(?:islands|cities|provinces|languages|cultures|ethnic groups|dialects)\b/gi,
      suggest: "thousands of islands / diverse cultures",
      why: "'Several' hanya merujuk pada sekitar 3 sampai 5 jumlahnya. Untuk skala Indonesia pakai 'diverse', 'hundreds of', atau 'thousands of' agar faktanya presisi.",
      wrong: "Indonesia has several islands.", right: "Indonesia has thousands of islands."
    },
    {
      id: "we-called-term", cat: "TENSE ISTILAH LOKAL",
      pattern: /\b(what\s+)?we\s+called\b(?=\s+(?:it\s+)?["']?(?:kemiri|cabai|cabe|candi|batik|rendang|gotong|nasi|rempah|alkes|kopi))/gi,
      replace: function () { return "what we call"; },
      why: "Istilah yang masih dipakai sampai sekarang diterangkan dengan Present Tense: 'what we call' atau 'locally known as'. Past Tense 'we called' berarti sudah tidak dipakai atau kejadian sekali.",
      wrong: "We supply what we called kemiri.", right: "We supply what we call kemiri."
    },
    {
      id: "a-uncountable-news", cat: "COUNTABLE VS UNCOUNTABLE",
      pattern: /\b(?:a|an)\s+(?:(good|great|bad|big|important|new|wonderful|exciting)\s+)?news\b/gi,
      replace: function (m, adj) {
        return adj ? "some " + adj.toLowerCase() + " news" : "some news";
      },
      why: "'News' (berita/kabar) termasuk kata benda tak terhitung (uncountable) meski berakhiran -s. Jangan pakai 'a/an'; gunakan 'some good news' atau langsung 'good news'.",
      wrong: "And then we have a good news.", right: "And then we have some good news."
    },
    {
      id: "come-in-destination", cat: "PREPOSISI TUJUAN",
      pattern: /\b(coming|come|going|go|returning|return)\s+(?:(again|back)\s+)?in\s+(Indonesia|Jakarta|Surabaya|Singapore|Malaysia|Japan|Pakistan|Europe|Asia|our\s+country)\b/gi,
      replace: function (m, verb, adv, place) {
        var mod = adv ? (adv.toLowerCase() === "again" ? " back" : " " + adv.toLowerCase()) : "";
        return verb + mod + " to " + place;
      },
      why: "Setelah kata kerja berpindah tempat (come, go, return), gunakan preposisi 'to' untuk arah tujuan, dan 'coming back to' jauh lebih natural daripada 'coming again in'.",
      wrong: "Thank you for coming again in Indonesia.", right: "Thank you for coming back to Indonesia."
    },
    {
      id: "in-legal-for-business", cat: "STRUKTUR KATA SIFAT",
      pattern: /\bin\s+legal(\s+for\s+business)?\b/gi,
      replace: function (m, tail) {
        return "legally compliant" + (tail || "");
      },
      why: "'Legal' adalah kata sifat, jadi tidak memakai 'in legal'. Untuk menyatakan sudah sah secara hukum dalam berusaha, gunakan 'legally compliant' atau 'legally authorized'.",
      wrong: "We are now in legal for business.", right: "We are now legally compliant for business."
    },
    {
      id: "have-a-regulation", cat: "KOLOKASI REGULASI",
      pattern: /\bhave\s+a\s+regulation\b/gi,
      replace: "have our regulatory compliance in place",
      why: "'Regulation' adalah aturan hukum secara umum, sedangkan perusahaan memiliki izin atau kepatuhan regulasi ('have regulatory clearance / compliance in place').",
      wrong: "So we finally have a regulation.", right: "So we finally have our regulatory compliance in place."
    },
    {
      id: "lowercase-sentence-start", cat: "KAPITALISASI KALIMAT",
      pattern: /([.!?]\s+)([a-z])(?=[a-z']+\b)/g,
      replace: function (m, sep, ch) {
        return sep + ch.toUpperCase();
      },
      why: "Huruf pertama kalimat baru setelah tanda titik wajib diawali huruf kapital.",
      wrong: "We are ready. we submitted it.", right: "We are ready. We submitted it."
    },
    {
      id: "spoken-self-repair", cat: "KEBERSIHAN KALIMAT LISAN",
      pattern: /\b(are|am)\s+(\w+ing)\s+for\s+currently\s+(?:we|I|they|you)\s+\1\s+\2\b/gi,
      replace: function (m, aux, verb) {
        return aux + " currently " + verb;
      },
      why: "Saat berpikir sambil bicara, wajar terjadi pengulangan frasa ('preparing for currently we are preparing'). Hapus pengulangan awal agar kalimat terdengar mantap dan tegas.",
      wrong: "We are preparing for currently we are preparing IDAK.", right: "We are currently preparing IDAK."
    },
    {
      id: "past-time-perfect", cat: "TENSE", manual: true,
      pattern: /(?<!since\s)(?<!until\s)\b(?:have|has)\s+\w+\s+(?:[^.?!]*?\s)?(?:yesterday|last\s+(?:week|month|year|night)|(?:two|three|four|five|\d+)\s+(?:days|weeks|months|years)\s+ago)\b/gi,
      suggest: "Past Simple (V2, hapus have/has)",
      why: "Present Perfect (have/has + V3) tidak boleh bertemu penanda waktu lampau yang sudah selesai (yesterday, last week, two days ago). Gunakan Past Simple.",
      wrong: "I have sent the invoice yesterday.", right: "I sent the invoice yesterday."
    }
  ];

  var weakWordUpgrades = [
    { re: /\bvery\s+good\b/i, weak: "very good", better: ["excellent", "outstanding"], note: "Band 7+ menghindari 'very + adjective' biasa.", example: "The audit results were excellent." },
    { re: /\bgood\b/i, weak: "good", better: ["beneficial", "favourable", "sound"], note: "'Good' dianggap kosakata dasar (A2).", example: "It is a sound investment for long-term growth." },
    { re: /\bbad\b/i, weak: "bad", better: ["detrimental", "adverse", "unfavourable"], note: "Pilih sesuai konteks: dampak (detrimental), kondisi (adverse).", example: "Delays have an adverse effect on cash flow." },
    { re: /\bvery\s+important\b/i, weak: "very important", better: ["crucial", "essential", "vital"], note: "Satu kata kuat lebih tinggi nilainya daripada 'very important'.", example: "Compliance is crucial for importers." },
    { re: /\b(?:a\s+lot\s+of|lots\s+of)\b/i, weak: "a lot of", better: ["a substantial number of", "a considerable amount of", "numerous"], note: "'A lot of' terlalu informal untuk Writing dan Speaking Part 3.", example: "A considerable amount of paperwork is required." },
    { re: /\bbig\b/i, weak: "big", better: ["substantial", "significant", "considerable"], note: "Untuk jumlah atau dampak, 'big' terdengar sederhana.", example: "There was a significant increase in demand." },
    { re: /\bthings?\b/i, weak: "thing(s)", better: ["factor", "aspect", "element", "issue"], note: "'Thing' terlalu umum. Sebut jenisnya.", example: "Three factors influence the final price." },
    { re: /\bget\b/i, weak: "get", better: ["obtain", "receive", "secure", "acquire"], note: "Kata kerja 'get' punya banyak makna, gantikan dengan yang spesifik.", example: "We expect to secure the permit next month." },
    { re: /\bnice\b/i, weak: "nice", better: ["pleasant", "enjoyable", "appealing"], note: "'Nice' dianggap kosakata dasar.", example: "Jakarta has an appealing mix of old and new." },
    { re: /\b(?:more\s+difficult|hard|difficult)\b/i, weak: "hard / difficult", better: ["challenging", "demanding", "intricate", "rigorous"], note: "'Rigorous' atau 'intricate' jauh lebih bernilai di konteks regulasi dan bisnis.", example: "The registration process has become increasingly rigorous." },
    { re: /\bshow(?:s|ed)?\b/i, weak: "show", better: ["demonstrate", "illustrate", "indicate"], note: "Naikkan untuk data dan argumen.", example: "The figures indicate a steady recovery." },
    { re: /\bhelp(?:s|ed)?\b/i, weak: "help", better: ["facilitate", "support", "assist"], note: "'Facilitate' untuk proses, 'support' untuk pihak.", example: "A local partner can facilitate customs clearance." },
    { re: /\bproblems?\b/i, weak: "problem", better: ["challenge", "obstacle", "drawback"], note: "Variasikan agar leksikal tidak berulang.", example: "Cold-chain logistics remains a major obstacle." },
    { re: /\bI\s+think\b/i, weak: "I think", better: ["In my view", "From my perspective", "I would argue that"], note: "Pembuka opini yang bervariasi menaikkan Coherence dan Lexical.", example: "In my view, local partnerships matter most." },
    { re: /\bso\b(?=,)/i, weak: "So,", better: ["Consequently,", "As a result,", "Therefore,"], note: "'So' di awal kalimat khas lisan informal.", example: "As a result, we postponed the launch." }
  ];

  var advancedWords = [
    "substantial", "significant", "crucial", "essential", "comprehensive", "diverse", "diversity", "mitigate", "enhance",
    "facilitate", "implement", "sustainable", "resilient", "vast", "archipelago", "intricate", "rigorous", "compliance",
    "regulatory", "contingent", "leverage", "viable", "feasible", "outweigh", "inevitable", "considerable", "detrimental",
    "beneficial", "adverse", "obtain", "secure", "acquire", "demonstrate", "illustrate", "indicate", "preliminary",
    "consequently", "nevertheless", "furthermore", "moreover", "whereas", "notwithstanding", "heritage", "infrastructure",
    "commodity", "procurement", "accountability", "transparency", "scalable", "inherent", "prevalent", "constraint",
    "tangible", "negotiate", "authorization", "acculturation", "cultural", "settle", "thrive"
  ];

  var discourseMarkers = [
    "however", "therefore", "moreover", "furthermore", "in addition", "for instance", "for example", "as a result",
    "on the other hand", "in contrast", "consequently", "nevertheless", "in particular", "to begin with", "overall",
    "in conclusion", "that said", "as long as", "because of this", "speaking of", "by contrast", "meanwhile"
  ];

  var localTerms = [
    {
      id: "kemiri", re: /\bkemiri\b/i, label: "Kemiri", strategy: "TERJEMAHKAN DULU, JEMBATANI ISTILAH LOKAL",
      note: "Komoditas dagang punya nama Inggris resmi. Sebut nama Inggris dulu, lalu nama lokalnya sebagai jembatan.",
      sentence: "We export premium Indonesian candlenuts, locally known in Indonesia as kemiri.",
      say: "Wi ek-SPOR pri-MI-yem in-do-NI-zhen KEN-del-nats, LOU-ke-li noun in in-do-NI-zha ez ke-MI-ri."
    },
    {
      id: "cabai", re: /\b(?:cabai|cabe|cabe rawit|chili|chilies)\b/i, label: "Cabai / Cabe", strategy: "TERJEMAHKAN DULU, JEMBATANI ISTILAH LOKAL",
      note: "Pakai 'chili' (AmE) atau 'chilli' (BrE) dan sebut jenisnya jika spesifik, misalnya bird's eye chili untuk cabai rawit.",
      sentence: "Our stemless dried chilies, known locally as cabai kering, are sorted and packed for export.",
      say: "Aur STEM-les draid CHI-liz, noun LOU-ke-li ez CA-bai KE-ring, ar SOR-ted end pekt for EK-spor."
    },
    {
      id: "borobudur", re: /\b(?:candi\s+)?borobudur\b/i, label: "Candi Borobudur", strategy: "PERTAHANKAN NAMA ASLI, BERI KONTEKS DUNIA",
      note: "Nama monumen tidak diterjemahkan. Sebut nama aslinya lalu beri penjelasan jenis dan konteksnya.",
      sentence: "Borobudur Temple, what we call Candi Borobudur, is a ninth-century Buddhist monument in Central Java.",
      say: "Bo-ro-bu-DUR TEM-pel, wat wi kol CAN-di Bo-ro-bu-DUR, iz e NAINTH-SEN-cu-ri BU-dist MO-nyu-ment in SEN-trel JA-va."
    },
    {
      id: "batik", re: /\bbatik\b/i, label: "Batik", strategy: "PERTAHANKAN NAMA ASLI, BERI KONTEKS DUNIA",
      note: "'Batik' sudah diterima dalam bahasa Inggris. Tambahkan penjelasan teknik wax-resist dan status UNESCO jika relevan.",
      sentence: "Batik is a wax-resist dyeing technique that is part of Indonesian heritage.",
      say: "Be-TIK iz e WEKS-ri-sist DAI-ing tek-NIK dhet iz part of in-do-NI-zhen HE-ri-tij."
    },
    {
      id: "rendang", re: /\brendang\b/i, label: "Rendang", strategy: "PERTAHANKAN NAMA ASLI, BERI KONTEKS DUNIA",
      note: "Nama hidangan dipertahankan. Jelaskan dengan frasa deskriptif singkat.",
      sentence: "Rendang is a slow-cooked beef dish simmered in coconut milk and spices.",
      say: "Ren-DANG iz e SLOU-kukt bif dis SI-merd in KOU-ke-nat milk end SPAI-siz."
    },
    {
      id: "gotong-royong", re: /\bgotong\s+royong\b/i, label: "Gotong royong", strategy: "PERTAHANKAN NAMA ASLI, BERI KONTEKS DUNIA",
      note: "Konsep budaya tidak punya padanan satu kata. Sebut namanya lalu definisikan.",
      sentence: "Gotong royong, what we call communal mutual help, is central to village life.",
      say: "GO-tong RO-yong, wat wi kol ke-MYU-nel MYU-chu-el help, iz SEN-trel tu VI-lij laif."
    },
    {
      id: "idak", re: /\bidak\b/i, label: "IDAK", strategy: "SINGKATAN LALU DEFINISI INTERNASIONAL",
      note: "Mitra asing tidak mengenal singkatan Kemenkes. Sebut singkatan lalu padanan fungsinya.",
      sentence: "We are processing our IDAK, which is our Medical Device Distributor License.",
      say: "Wi ar PRO-se-sing aur AI-DI-EI-KEI, wich iz aur ME-di-kel di-VAIS dis-TRI-byu-ter LAI-sens."
    },
    {
      id: "cdakb", re: /\bcdakb\b/i, label: "CDAKB", strategy: "SINGKATAN LALU DEFINISI INTERNASIONAL",
      note: "Padanan internasionalnya Good Distribution Practice untuk alat kesehatan.",
      sentence: "Our CDAKB certification is the Indonesian equivalent of Good Distribution Practice for medical devices.",
      say: "Aur SI-DI-EI-KEI-BI ser-ti-fi-KEI-syen iz dhi in-do-NI-zhen i-KWI-ve-lent of Gud dis-tri-BYU-syen PREK-tis for ME-di-kel di-VAI-siz."
    },
    {
      id: "akl", re: /\bakl\b/i, label: "AKL", strategy: "SINGKATAN LALU DEFINISI INTERNASIONAL",
      note: "AKL adalah izin edar alat kesehatan impor. Jelaskan sebagai marketing authorization.",
      sentence: "AKL is the marketing authorization number for imported medical devices in Indonesia.",
      say: "EI-KEI-EL iz dhe MAR-ke-ting o-tho-rai-ZEI-syen NAM-ber for im-POR-ted ME-di-kel di-VAI-siz in in-do-NI-zha."
    },
    {
      id: "kemenkes", re: /\bkemenkes\b/i, label: "Kemenkes", strategy: "SINGKATAN LALU DEFINISI INTERNASIONAL",
      note: "Gunakan nama resmi: Indonesian Ministry of Health.",
      sentence: "The Indonesian Ministry of Health, or Kemenkes, issues the registration.",
      say: "Dhi in-do-NI-zhen MI-nis-tri of HELTH, or Ke-MEN-kes, I-syuz dhe re-jis-TREI-syen."
    },
    {
      id: "alkes", re: /\balkes\b|\balat\s+kesehatan\b/i, label: "Alkes / Alat Kesehatan", strategy: "TERJEMAHKAN DULU, JEMBATANI ISTILAH LOKAL",
      note: "Padanannya 'medical devices'. Singkatan 'alkes' jarang dipahami orang asing.",
      sentence: "Medical devices, or alkes as we say locally, must be registered before sale.",
      say: "ME-di-kel di-VAI-siz, or AL-kes ez wi sei LOU-ke-li, mast bi RE-jis-terd bi-FOR seil."
    }
  ];

  var pronunciationWatch = [
    { re: /\bislands?\b/i, word: "island", ipa: "/ˈaɪ.lənd/", tip: "Huruf s tidak dibaca. Bunyinya AI-lend, bukan is-land." },
    { re: /\bthousands?\b/i, word: "thousand", ipa: "/ˈθaʊ.zənd/", tip: "TH di awal: lidah di antara gigi, bukan 't' atau 's'. Akhiran -zend." },
    { re: /\bthrough\b/i, word: "through", ipa: "/θruː/", tip: "Satu suku kata. Jangan dibaca tho-ro atau thru-gh." },
    { re: /\bthought\b/i, word: "thought", ipa: "/θɔːt/", tip: "Gh bisu. Bunyi akhir t yang jelas." },
    { re: /\bmonths?\b/i, word: "month", ipa: "/mʌnθ/", tip: "TH di akhir: ujung lidah keluar tipis di antara gigi." },
    { re: /\bthink(?:ing)?\b/i, word: "think", ipa: "/θɪŋk/", tip: "TH tanpa suara, bukan 'sink' dan bukan 'tink'." },
    { re: /\bworld\b/i, word: "world", ipa: "/wɜːrld/", tip: "R dan L menyatu, jangan dipisah menjadi wor-uld." },
    { re: /\bcomfortable\b/i, word: "comfortable", ipa: "/ˈkʌmf.tə.bəl/", tip: "Tiga suku kata (KAMF-te-bel), bukan empat. Tekanan di suku pertama." },
    { re: /\bvegetables?\b/i, word: "vegetable", ipa: "/ˈvedʒ.tə.bəl/", tip: "Tiga suku kata (VEJ-te-bel). Jangan dibaca ve-ge-ta-bel." },
    { re: /\bwednesday\b/i, word: "Wednesday", ipa: "/ˈwenz.deɪ/", tip: "D pertama bisu. Dibaca WENZ-dei." },
    { re: /\breceipts?\b/i, word: "receipt", ipa: "/rɪˈsiːt/", tip: "P bisu. Dibaca ri-SIT." },
    { re: /\bdebt\b/i, word: "debt", ipa: "/det/", tip: "B bisu. Dibaca DET." },
    { re: /\bregulations?\b/i, word: "regulation", ipa: "/ˌreɡ.jəˈleɪ.ʃən/", tip: "Tekanan utama di -LEI-. Akhiran -syen, bukan -syon." },
    { re: /\blicen[sc]es?\b/i, word: "license", ipa: "/ˈlaɪ.səns/", tip: "Akhiran -sens dan bunyi jamak -siz pada licenses (LAI-sen-siz)." },
    { re: /\bcertificates?\b/i, word: "certificate", ipa: "/sərˈtɪf.ɪ.kət/", tip: "Tekanan di -TIF-. Akhiran -ket, bukan -keit untuk kata benda." },
    { re: /\barchipelago\b/i, word: "archipelago", ipa: "/ˌɑːr.kɪˈpel.ə.ɡoʊ/", tip: "Ch dibaca k: ar-ki-PE-la-go." },
    { re: /\bdiversity\b/i, word: "diversity", ipa: "/daɪˈvɜːr.sə.ti/", tip: "Awalan dai-, bukan di-. Tekanan di -VER-." },
    { re: /\bparticularly\b/i, word: "particularly", ipa: "/pərˈtɪk.jə.lər.li/", tip: "Tekanan di -TIK-. Lima suku kata: per-TIK-ye-ler-li." },
    { re: /\bdevelopment\b/i, word: "development", ipa: "/dɪˈvel.əp.mənt/", tip: "Tekanan di -VEL-. Awalan di-, bukan de-." },
    { re: /\benvironment\b/i, word: "environment", ipa: "/ɪnˈvaɪ.rən.mənt/", tip: "Bunyi n sebelum m: in-VAI-ren-ment, jangan menghilangkan n." },
    { re: /\bdistribution\b/i, word: "distribution", ipa: "/ˌdɪs.trɪˈbjuː.ʃən/", tip: "Tekanan di -BYU-. Akhiran -syen." },
    { re: /\bacculturation\b/i, word: "acculturation", ipa: "/əˌkʌl.tʃəˈreɪ.ʃən/", tip: "Tekanan utama di -REI-. Tch di tengah: e-kal-che-REI-syen." },
    { re: /\bcandlenuts?\b/i, word: "candlenut", ipa: "/ˈkæn.dəl.nʌt/", tip: "Tiga suku kata (KEN-del-nat). Jamak candlenuts diakhiri bunyi ts." },
    { re: /\bindonesia\b/i, word: "Indonesia", ipa: "/ˌɪn.dəˈniː.ʒə/", tip: "Tekanan di -NI-. Bunyi zh di tengah (in-do-NI-zha), bukan s." },
    { re: /\bnecessary\b/i, word: "necessary", ipa: "/ˈnes.ə.ser.i/", tip: "Tekanan di suku pertama: NE-se-se-ri." },
    { re: /\bopportunit(?:y|ies)\b/i, word: "opportunity", ipa: "/ˌɑː.pərˈtuː.nə.ti/", tip: "Tekanan di -TU-: a-per-TU-ne-ti." },
    { re: /\bworked\b/i, word: "worked", ipa: "/wɜːrkt/", tip: "Akhiran -ed dibaca /t/ setelah bunyi k (WERKT), bukan wor-ked." },
    { re: /\b(?:cultures|languages|dialects)\b/i, word: "cultures / languages / dialects", ipa: "/ˈkʌl.tʃərz/ /ˈlæŋ.ɡwɪ.dʒɪz/ /ˈdaɪ.ə.lekts/", tip: "Bunyi jamak di ujung (z, iz, ts) wajib terdengar. Penguji IELTS memeriksanya." }
  ];

  // Dictionary of high-frequency & domain words for automatic "Cara Baca Lidah Indonesia"
  var phoneticMap = {
    "a": "e", "an": "en", "the": "dhe", "and": "end", "or": "or", "but": "bat", "so": "sou", "because": "bi-KOZ",
    "if": "if", "when": "wen", "where": "wer", "while": "wail", "although": "ol-DHOU", "however": "hau-E-ver",
    "therefore": "DHER-for", "moreover": "mor-OU-ver", "furthermore": "fer-dher-MOR", "consequently": "KON-si-kwent-li",
    "i": "ai", "i'm": "aim", "my": "mai", "me": "mi", "we": "wi", "our": "aur", "us": "as", "you": "yu", "your": "yor",
    "he": "hi", "his": "hiz", "she": "syi", "her": "her", "it": "it", "its": "its", "they": "dhei", "their": "dher", "them": "dhem",
    "am": "em", "is": "iz", "are": "ar", "was": "woz", "were": "wer", "be": "bi", "been": "bin", "being": "BI-ing",
    "have": "hev", "has": "hez", "had": "hed", "do": "du", "does": "daz", "did": "did", "don't": "dount", "doesn't": "DA-zent",
    "will": "wil", "would": "wud", "can": "ken", "could": "kud", "should": "syud", "must": "mast", "may": "mei", "might": "mait",
    "this": "dhis", "that": "dhat", "these": "dhiz", "those": "dhouz", "there": "dher", "here": "hir", "wherever": "wer-E-ver",
    "anywhere": "E-ni-wer", "every": "EV-ri", "many": "ME-ni", "much": "mach", "several": "SE-vrel", "various": "VE-ri-es",
    "some": "sam", "any": "E-ni", "more": "mor", "most": "moust", "other": "A-dher", "others": "A-dherz", "such": "sach",
    "as": "ez", "in": "in", "on": "on", "at": "et", "to": "tu", "for": "for", "of": "of", "from": "from", "with": "widh",
    "by": "bai", "about": "e-BAUT", "across": "e-KROS", "through": "thru", "before": "bi-FOR", "after": "AF-ter",
    "between": "bi-TWIN", "among": "e-MANG", "into": "IN-tu", "without": "wi-DHAUT", "during": "DU-ring", "since": "sins",
    "hello": "he-LOU", "hi": "hai", "name": "neim", "years": "yirz", "year": "yir", "old": "ould", "talking": "TO-king",
    "speaking": "SPI-king", "indonesia": "in-do-NI-zha", "indonesian": "in-do-NI-zhen", "island": "AI-lend", "islands": "AI-lendz",
    "thousand": "THAU-zend", "thousands": "THAU-zendz", "spread": "spred", "major": "MEI-jer", "region": "RI-jen", "regions": "RI-jenz",
    "like": "laik", "java": "JA-va", "sumatra": "su-MA-tra", "kalimantan": "ka-li-MAN-tan", "bali": "BA-li", "jakarta": "ja-KAR-ta",
    "proud": "praud", "country": "KAN-tri", "culture": "KAL-cher", "cultures": "KAL-cherz", "cultural": "KAL-che-rel",
    "language": "LENG-gwij", "languages": "LENG-gwi-jiz", "dialect": "DAI-e-lekt", "dialects": "DAI-e-lekts",
    "acculturation": "e-kal-che-REI-syen", "diverse": "dai-VERS", "diversity": "dai-VER-se-ti", "rich": "rich", "vast": "vast",
    "archipelago": "ar-ki-PE-la-go", "choose": "chuz", "want": "wont", "wants": "wonts", "live": "liv", "settle": "SE-tel",
    "down": "daun", "feel": "fil", "home": "houm", "nation": "NEI-syen", "world": "werld", "people": "PI-pel",
    "supply": "se-PLAI", "supplies": "se-PLAIZ", "spices": "SPAI-siz", "spice": "spais", "especially": "is-PE-sye-li",
    "particularly": "per-TIK-ye-ler-li", "what": "wat", "call": "kol", "called": "kold", "locally": "LOU-ke-li", "known": "noun",
    "candlenut": "KEN-del-nat", "candlenuts": "KEN-del-nats", "kemiri": "ke-MI-ri", "stemless": "STEM-les", "dried": "draid",
    "chili": "CHI-li", "chilies": "CHI-liz", "moisture": "MOIS-cher", "content": "KON-tent", "control": "ken-TROUL",
    "depend": "di-PEND", "depends": "di-PENDZ", "harvest": "HAR-vest", "season": "SI-zen", "really": "RI-li", "greatly": "GREIT-li",
    "appreciate": "e-PRI-syi-eit", "explain": "ik-SPLEIN", "explaining": "ik-SPLEI-ning", "process": "PRO-ses", "processing": "PRO-se-sing",
    "buyer": "BAI-er", "buyers": "BAI-erz", "need": "nid", "needs": "nidz", "require": "ri-KWAIR", "requires": "ri-KWAIRZ",
    "information": "in-fer-MEI-syen", "comprehensive": "kom-pri-HEN-siv", "specification": "spe-si-fi-KEI-syen", "specifications": "spe-si-fi-KEI-syenz",
    "now": "nau", "discuss": "dis-KAS", "regulation": "re-gyu-LEI-syen", "regulations": "re-gyu-LEI-syenz", "regulatory": "RE-gyu-le-to-ri",
    "medical": "ME-di-kel", "device": "di-VAIS", "devices": "di-VAI-siz", "alkes": "AL-kes", "idak": "AI-DI-EI-KEI", "cdakb": "SI-DI-EI-KEI-BI",
    "akl": "EI-KEI-EL", "kemenkes": "ke-MEN-kes", "ministry": "MI-nis-tri", "health": "helth", "difficult": "DI-fi-kelt",
    "challenging": "CHE-len-jing", "intricate": "IN-tri-ket", "rigorous": "RI-ge-res", "than": "dhen", "worry": "WA-ri", "worries": "WA-riz",
    "submitted": "sab-MI-ted", "submit": "sab-MIT", "dossier": "DO-si-ei", "yesterday": "YES-ter-dei", "confident": "KON-fi-dent",
    "issue": "I-syu", "issues": "I-syuz", "license": "LAI-sens", "licenses": "LAI-sen-siz", "permit": "PER-mit", "permits": "PER-mits",
    "soon": "sun", "distributor": "dis-TRI-byu-ter", "distribution": "dis-tri-BYU-syen", "certification": "ser-ti-fi-KEI-syen",
    "compliance": "kem-PLAI-ens", "authorization": "o-tho-rai-ZEI-syen", "marketing": "MAR-ke-ting", "hospital": "HOS-pi-tel",
    "hospitals": "HOS-pi-telz", "quality": "KWO-le-ti", "standard": "STEN-derd", "standards": "STEN-derdz", "international": "in-ter-NE-sye-nel",
    "export": "EK-sport", "import": "IM-port", "shipment": "SYIP-ment", "customs": "KAS-temz", "clearance": "KLI-rens",
    "product": "PRO-dakt", "products": "PRO-dakts", "video": "VI-di-ou", "photo": "FOU-tou", "photos": "FOU-touz", "assets": "E-sets",
    "thank": "thengk", "coming": "KA-ming", "welcome": "WEL-kam", "again": "e-GEN", "back": "bek",
    "malik": "MA-lik", "kemal": "ke-MAL", "thoriq": "THO-rik", "news": "nyuz", "finally": "FAI-ne-li",
    "legal": "LI-gel", "legally": "LI-ge-li", "compliant": "kem-PLAI-ent", "authorized": "O-tho-raizd",
    "business": "BIZ-nes", "preparing": "pri-PE-ring", "currently": "KA-rent-li", "mandatory": "MEN-de-to-ri",
    "encouraging": "in-KA-ri-jing", "foundational": "faun-DEI-sye-nel", "moreover": "mor-OU-ver",
    "consequently": "KON-si-kwent-li", "operate": "O-pe-reit", "commercially": "ke-MER-sye-li",
    "honor": "O-ner", "pleased": "plizd", "share": "syer", "submissions": "sab-MI-syenz"
  };

  // Context-aware topic templates for "Mungkin Maksud Kamu Begini" & "What to Say Next"
  var topicTemplates = [
    {
      id: "welcome-business-visit",
      strongMatch: /\b(welcome(?:\s+back)?\s+to|coming\s+again|coming\s+back|mr\.?\s*malik|nadeem|bushido|visit\s+jakarta|zoom\s+meeting|in\s+legal|legally\s+compliant|legally\s+authorized|a\s+good\s+news|some\s+good\s+news|cooperation)\b/gi,
      match: /\b(welcome|malik|legal|business|news|visit|meeting|hotel|airport|hospital)\b/gi,
      title: "Menyambut mitra bisnis & update kesiapan hukum di Indonesia",
      summary: "Kamu sedang menyambut mitra bisnis yang berkunjung ke Indonesia, mengabarkan berita baik kesiapan legalitas usaha, serta menjelaskan pengurusan perizinan ke Kementerian Kesehatan.",
      focusTip: "Gunakan 'coming back to Indonesia' (bukan 'coming again in'), ingat bahwa 'news' selalu tak terhitung ('some good news' atau 'great news', tanpa 'a'), dan ganti 'in legal for business' dengan 'legally compliant to operate'.",
      nextSentences: [
        {
          en: "We are thrilled to walk you through our local distribution readiness during your stay in Jakarta.",
          id: "Kami sangat senang memaparkan kesiapan distribusi lokal kami selama kunjungan Anda di Jakarta.",
          say: "Wi ar thrild tu wok yu thru aur LOU-kel dis-tri-BYU-syen RE-di-nes DU-ring yor stei in ja-KAR-ta."
        },
        {
          en: "Once our IDAK and CDAKB filings are completed, we can move forward smoothly with product registration.",
          id: "Begitu pengajuan IDAK dan CDAKB kami rampung, kita dapat melangkah mulus ke pendaftaran izin edar produk.",
          say: "Wans aur AI-DI-EI-KEI end SI-DI-EI-KEI-BI FAI-lingz ar kem-PLI-ted, wi ken muv FOR-werd SMUTH-li widh PRO-dakt re-jis-TREI-syen."
        },
        {
          en: "Shall we review the priority document checklist and hospital outreach timeline together?",
          id: "Bolehkah kita meninjau daftar dokumen prioritas dan linimasa pendekatan ke rumah sakit bersama-sama?",
          say: "Syel wi ri-VYU dhe prai-O-re-ti DO-kyu-ment CHEK-list end HOS-pi-tel AUT-rich TAIM-lain te-GE-dher?"
        }
      ]
    },
    {
      id: "daily-smalltalk-life",
      strongMatch: /\b(weather|traffic|afternoon\s+rain|halal\s+(?:food|dishes)|how\s+are\s+you|day-to-day|daily\s+routine|weekend|dinner|coffee\s+shop|how\s+is\s+life)\b/gi,
      match: /\b(weather|rain|food|family|morning|jakarta|coffee|living|city)\b/gi,
      title: "Percakapan harian, kabar terbaru & suasana hidup di Jakarta",
      summary: "Kamu sedang bertukar kabar ringan dan bercerita mengenai aktivitas sehari-hari, cuaca, makanan, atau keseharian tim sebelum atau di sela agenda kerja.",
      focusTip: "Tambahkan satu detail spesifik tentang suasana minggu ini atau cuaca lokal agar percakapan pembuka terdengar hangat sebelum masuk topik bisnis.",
      nextSentences: [
        {
          en: "How has the week been going on your end with the team?",
          id: "Bagaimana jalannya minggu ini di pihak Anda bersama tim?",
          say: "Hau hez dhe wik bin GOU-ing on yor end widh dhe tim?"
        },
        {
          en: "Whenever traffic slows down in the evening, Jakarta has great places for quiet dinner meetings.",
          id: "Begitu lalu lintas melambat di malam hari, Jakarta punya banyak tempat nyaman untuk makan malam bisnis.",
          say: "Wen-E-ver TRE-fik slouz daun in dhi IV-ning, ja-KAR-ta hez greit PLEI-siz for KWAI-et DI-ner MI-tingz."
        },
        {
          en: "Let us grab a coffee once you settle into the hotel so you can relax after the flight.",
          id: "Mari kita minum kopi setelah Anda beristirahat di hotel supaya bisa santai seusai penerbangan.",
          say: "Let as greb e KO-fi wans yu SE-tel IN-tu dhe hou-TEL sou yu ken ri-LEKS AF-ter dhe flait."
        }
      ]
    },
    {
      id: "indonesia-culture",
      strongMatch: /\b(islands?|archipelago|cultures?|dialects?|acculturation|borobudur|batik|rendang|gotong\s+royong|hundreds\s+of|thousands\s+of)\b/gi,
      match: /\b(indonesia|java|sumatra|kalimantan|bali|diverse|several)\b/gi,
      title: "Perkenalan diri & deskripsi keberagaman Indonesia",
      summary: "Kamu sedang memperkenalkan diri lalu menjelaskan kondisi geografis Indonesia sebagai negara kepulauan beserta keberagaman budaya, bahasa, dan akulturasinya.",
      focusTip: "Pastikan skala angka akurat ('thousands of islands', bukan 'several islands'), kata benda setelah penanda jamak wajib berakhiran -s ('cultures, languages, dialects'), dan ganti 'etc.' dengan '...and many others'.",
      nextSentences: [
        {
          en: "Each region has its own distinct culinary heritage and traditional architecture.",
          id: "Setiap daerah memiliki warisan kuliner dan arsitektur tradisionalnya sendiri yang khas.",
          say: "Ich RI-jen hez its oun dis-TINGKT ku-li-NE-ri HE-ri-tij end tre-DI-sye-nel ar-ki-TEK-cher."
        },
        {
          en: "Despite these cultural differences, Bahasa Indonesia unites us as a single nation.",
          id: "Meskipun ada perbedaan budaya tersebut, Bahasa Indonesia mempersatukan kami sebagai satu bangsa.",
          say: "Dis-PAIT dhiz KAL-che-rel DI-fren-siz, Ba-HA-sa in-do-NI-zha yu-NAITS as ez e SING-gel NEI-syen."
        },
        {
          en: "For first-time visitors, exploring beyond Bali offers a much deeper perspective on our heritage.",
          id: "Bagi pengunjung pertama kali, menjelajahi wilayah di luar Bali memberikan sudut pandang yang jauh lebih dalam tentang warisan kami.",
          say: "For FERST-taim VI-zi-terz, ik-SPLO-ring bi-YOND BA-li O-ferz e mach DI-per per-SPEK-tiv on aur HE-ri-tij."
        }
      ]
    },
    {
      id: "commodity-export",
      strongMatch: /\b(kemiri|candlenut|candlenuts|chili|chilies|cabai|cabe|spice|spices|moisture\s+content|phytosanitary)\b/gi,
      match: /\b(moisture|harvest|buyer|export|shipment|raw\s+materials)\b/gi,
      title: "Presentasi komoditas ekspor & spesifikasi mutu (Kemiri / Rempah)",
      summary: "Kamu sedang menjelaskan pasokan komoditas rempah Indonesia (seperti kemiri dan cabai kering), pengendalian kadar air pascapanen, serta kebutuhan spesifikasi dari pembeli.",
      focusTip: "Jembatani nama lokal dengan istilah dagang internasional ('Indonesian candlenuts, locally known as kemiri'), perhatikan subject-verb agreement pada subjek tunggal ('the buyer needs'), dan hindari memberi -s pada 'information'.",
      nextSentences: [
        {
          en: "We maintain moisture content below eight percent to prevent mold during sea freight.",
          id: "Kami menjaga kadar air di bawah delapan persen untuk mencegah jamur selama pengiriman laut.",
          say: "Wi mein-TEIN MOIS-cher KON-tent bi-LOU eit per-SENT tu pri-VENT mould DU-ring si freit."
        },
        {
          en: "Every batch undergoes strict sorting and laboratory testing before container loading.",
          id: "Setiap batch melewati penyortiran ketat dan uji laboratorium sebelum pemuatan kontainer.",
          say: "EV-ri bech an-der-GOUZ strikt SOR-ting end LE-bre-to-ri TES-ting bi-FOR ken-TEI-ner LOU-ding."
        },
        {
          en: "We can provide a Certificate of Analysis and phytosanitary documents upon request.",
          id: "Kami dapat menyediakan Certificate of Analysis dan dokumen fitosanitari sesuai permintaan.",
          say: "Wi ken pre-VAID e ser-TI-fi-ket of e-NE-le-sis end fai-tou-SE-ne-te-ri DO-kyu-ments e-PON ri-KWEST."
        }
      ]
    },
    {
      id: "alkes-regulation",
      strongMatch: /\b(alkes|idak|cdakb|akl|kemenkes|medical\s+devices?|marketing\s+authorization|ministry\s+of\s+health)\b/gi,
      match: /\b(dossier|license|permit|regulation|regulations|regulatory|mandatory)\b/gi,
      title: "Update kepatuhan regulasi & izin edar alat kesehatan (IDAK / CDAKB / Kemenkes)",
      summary: "Kamu sedang menjelaskan progres pengurusan izin distribusi dan sertifikasi alat kesehatan (IDAK, CDAKB, atau AKL) di Kementerian Kesehatan beserta jadwal penerbitan izinnya.",
      focusTip: "Selalu beri padanan internasional setelah singkatan lokal ('IDAK, our Medical Device Distributor License'), hapus preposisi berlebih setelah 'discuss', dan gunakan Past Simple ('we submitted') bila ada keterangan waktu 'yesterday'.",
      nextSentences: [
        {
          en: "Once the Ministry of Health grants the marketing authorization, we can commence commercial importation.",
          id: "Begitu Kementerian Kesehatan menerbitkan izin edar, kita dapat memulai impor komersial.",
          say: "Wans dhe MI-nis-tri of HELTH grents dhe MAR-ke-ting o-tho-rai-ZEI-syen, wi ken ke-MENS ke-MER-syel im-por-TEI-syen."
        },
        {
          en: "Our warehouse facility has already been audited to meet Good Distribution Practice standards.",
          id: "Fasilitas gudang kami sudah diaudit untuk memenuhi standar Cara Distribusi Alat Kesehatan yang Baik (CDAKB).",
          say: "Aur WER-haus fe-SI-le-ti hez ol-RE-di bin O-di-ted tu mit Gud dis-tri-BYU-syen PREK-tis STEN-derdz."
        },
        {
          en: "In the meantime, please share the product demo video so our commercial team can prepare the hospital pitch.",
          id: "Sementara itu, mohon bagikan video demo produknya agar tim komersial kami dapat menyiapkan presentasi untuk rumah sakit.",
          say: "In dhe MIN-taim, pliz syer dhe PRO-dakt DE-mou VI-di-ou sou aur ke-MER-syel tim ken pri-PER dhe HOS-pi-tel pich."
        }
      ]
    },
    {
      id: "general-speaking",
      match: /.*/,
      title: "Penyampaian gagasan & opini dalam bahasa Inggris",
      summary: "Kamu sedang menyampaikan gagasan, pembaruan progres, atau pendapat dalam bahasa Inggris dan ingin memastikan struktur kalimat, pilihan kata, serta pelafalannya terdengar natural.",
      focusTip: "Fokuskan latihan pada kesesuaian subjek dan kata kerja (he/she/it + V-s), hindari terjemahan kata per kata dari struktur bahasa Indonesia, dan sisipkan penanda wacana (such as, therefore, in addition) agar alur antarkalimat lebih rapi.",
      nextSentences: [
        {
          en: "To give you a concrete example, we have already implemented this approach in our daily operations.",
          id: "Untuk memberi contoh nyata, kami sudah menerapkan pendekatan ini dalam operasional harian kami.",
          say: "Tu giv yu e KON-krit ig-ZEM-pel, wi hev ol-RE-di im-ple-MEN-ted dhis e-PROUCH in aur DEI-li o-pe-REI-syenz."
        },
        {
          en: "As a result, both efficiency and quality control have improved significantly over the past quarter.",
          id: "Hasilnya, baik efisiensi maupun kendali mutu meningkat secara signifikan selama kuartal terakhir.",
          say: "Ez e ri-ZALT, bouth i-FI-syen-si end KWO-le-ti ken-TROUL hev im-PRUVD sig-NI-fi-kent-li OU-ver dhe past KWOR-ter."
        },
        {
          en: "Please let me know if you need any further clarification regarding our timeline.",
          id: "Silakan beri tahu saya jika Anda memerlukan klarifikasi lebih lanjut terkait jadwal kami.",
          say: "Pliz let mi nou if yu nid E-ni FER-dher kle-ri-fi-KEI-syen ri-GAR-ding aur TAIM-lain."
        }
      ]
    }
  ];

  var rubric = [
    {
      key: "fluency", name: "Fluency & Coherence", measuredByApp: "SEBAGIAN (penanda wacana lewat teks; durasi bicara butuh rekaman)",
      band6: "Bicara cukup panjang tetapi sering berhenti mencari kata atau mengulang.",
      band7: "Bicara panjang tanpa usaha terlihat. Jeda lebih sering karena memilih ide, bukan mencari bahasa.",
      band8: "Hampir tidak ada hesitasi. Ide dikembangkan runtut dengan penghubung yang bervariasi.",
      howToRise: "Rekam 2 menit per hari. Struktur: jawaban langsung, alasan, contoh, penutup. Ganti 'uhm' dengan frasa pengisi bermakna seperti 'Let me think about that'.",
      appDrill: "Tab Analisis: dikte 2 menit lalu cek jumlah penanda wacana dan kalimat."
    },
    {
      key: "lexical", name: "Lexical Resource", measuredByApp: "YA (kosakata maju, kata lemah, kolokasi)",
      band6: "Kosakata cukup untuk topik dikenal. Mencoba kata sulit tetapi masih ada salah pilih.",
      band7: "Kosakata fleksibel, ada kolokasi tepat dan sedikit idiom. Mampu parafrase.",
      band8: "Kosakata luas dan presisi. Salah pilih kata sangat jarang.",
      howToRise: "Ganti 15 kata lemah (good, big, thing) dengan padanan spesifik. Pelajari kolokasi, bukan kata tunggal.",
      appDrill: "Tab Analisis bagian Upgrade Kosakata dan kartu SRS di tab 03."
    },
    {
      key: "grammar", name: "Grammatical Range & Accuracy", measuredByApp: "YA (aturan kesalahan khas penutur Indonesia, pemeriksaan LanguageTool gratis, dan rasio kalimat kompleks)",
      band6: "Campuran kalimat sederhana dan kompleks. Kesalahan masih ada tetapi jarang menghalangi makna.",
      band7: "Berbagai struktur kompleks. Banyak kalimat bebas kesalahan.",
      band8: "Mayoritas kalimat bebas kesalahan. Kesalahan non-sistematis.",
      howToRise: "Targetkan kepadatan kesalahan di bawah 3 per 100 kata dan minimal 40 persen kalimat kompleks. Selesaikan Buku Kesalahan sampai tiap aturan dikuasai.",
      appDrill: "Buku Kesalahanku dan modul 02 Matriks 12 Tenses."
    },
    {
      key: "pronunciation", name: "Pronunciation", measuredByApp: "TERBATAS (panduan Cara Baca Lidah Indonesia plus pengecekan mikrofon peramban)",
      band6: "Umumnya dapat dipahami, tetapi ada kata yang salah ucap dan intonasi datar.",
      band7: "Fitur pengucapan positif ditunjukkan. Aksen tidak mengganggu.",
      band8: "Berbagai fitur pengucapan dikuasai dengan sedikit lapse. Mudah dipahami sepanjang waktu.",
      howToRise: "Shadowing kalimat 10 menit per hari. Fokus bunyi TH, jamak -s, akhiran -ed, dan tekanan kata. Konfirmasi dengan penutur atau tutor, bukan hanya aplikasi.",
      appDrill: "Tab Analisis: panduan Cara Baca Lidah Indonesia, Baca Ulang via Mikrofon, dan daftar Waspada Pengucapan."
    }
  ];

  var studyPlan = [
    { week: 1, theme: "Baseline dan peta kesalahan", ielts: "Mock Speaking dan Writing Task 2 pertama sebagai tolok ukur.", toefl: "Latihan opini independen 45 detik, rekam dan analisis.", items: ["Kerjakan 12 soal Uji Level (tab 05)", "Rekam 3 jawaban 1 menit dan analisis di Coach", "Catat 5 kesalahan teratas di Buku Kesalahan", "Ambil satu mock penuh dari materi resmi dan catat skornya", "Input skor awal di Pelacak Skor"], gate: "Skor baseline tercatat dan 5 aturan kesalahan teratas teridentifikasi." },
    { week: 2, theme: "Fondasi: Be vs verb, agreement, plural", ielts: "Part 1 topik harian (home, work, hometown).", toefl: "Jawaban singkat dengan struktur opini plus alasan.", items: ["Selesaikan drill subject-verb dan plural", "Kuasai 15 kartu SRS level A2-B1", "5 rekaman Part 1, targetkan kesalahan di bawah 6 per 100 kata", "Shadowing 10 menit per hari", "Review Buku Kesalahan setiap malam"], gate: "Kepadatan kesalahan rata-rata turun dibanding minggu 1." },
    { week: 3, theme: "Fluency: monolog panjang", ielts: "Part 2 cue card, bicara 1,5 sampai 2 menit.", toefl: "Latihan 45 detik opini, tanpa jeda lebih dari 2 detik.", items: ["Rekam 5 monolog Part 2", "Gunakan struktur: pembuka, 2 detail, contoh, penutup", "Kurangi filler uhm dan like", "Tambah penanda wacana minimal 3 per jawaban", "Kirim satu rekaman ke tutor atau teman berbahasa Inggris untuk umpan balik manusia"], gate: "Dua monolog berturut-turut 2 menit tanpa berhenti panjang." },
    { week: 4, theme: "Fluency: Part 3 dan pembenaran argumen", ielts: "Part 3 diskusi abstrak: pendapat, alasan, tandingan.", toefl: "Alasan dan contoh spesifik, bukan generalisasi.", items: ["Pakai pola PEEL: point, explain, example, link", "Latihan 10 pertanyaan Part 3", "Parafrase pertanyaan sebelum menjawab", "Pelajari 10 kolokasi topik sosial", "Mock Speaking penuh dan input skor"], gate: "Mock Speaking mencapai target mingguan atau naik 0,5 band dari minggu 1." },
    { week: 5, theme: "Rentang tata bahasa: kalimat kompleks", ielts: "Writing Task 2: dua paragraf badan dengan klausa relatif dan kondisional.", toefl: "Gabungkan alasan dengan because, although, which.", items: ["Tulis 4 paragraf dan analisis di Coach", "Target 40 persen kalimat kompleks", "Latihan Conditional 2 dan 3 (tab 01 level B2)", "Latihan pasif untuk proses dan hasil", "Perbaiki semua temuan manual di Buku Kesalahan"], gate: "Rasio kalimat kompleks di atas 40 persen pada 3 teks berturut-turut." },
    { week: 6, theme: "Akurasi: tense dan kolokasi waktu", ielts: "Writing Task 1 (grafik atau surat) plus Speaking Part 2 masa lalu.", toefl: "Ringkas ide kuliah dalam Past dan Present yang konsisten.", items: ["Simulator Matriks 12 Tenses 20 menit per hari", "Perbaiki semua kesalahan since/for dan Present Perfect vs Past", "3 teks Writing dengan kepadatan kesalahan di bawah 4", "Shadowing kalimat B2", "Input skor mock Writing"], gate: "Kepadatan kesalahan rata-rata di bawah 4 per 100 kata." },
    { week: 7, theme: "Leksikal: topik 1 sampai 4", ielts: "Topik: environment, education, technology, work.", toefl: "Kosakata akademik dan sinonim aman.", items: ["Pelajari 40 kata dan 20 kolokasi topik", "Ganti 15 kata lemah dengan padanan spesifik", "Parafrase 10 kalimat", "Gunakan minimal 5 kata maju per jawaban 2 menit", "Kartu SRS 15 menit setiap hari"], gate: "Indikator Lexical di Coach stabil di 7,0 atau lebih." },
    { week: 8, theme: "Leksikal: topik 5 sampai 8 dan bahasa bisnis", ielts: "Topik: health, globalisation, culture, government.", toefl: "Simulasi diskusi kampus dan fakta spesifik.", items: ["40 kata dan 20 kolokasi topik berikutnya", "Latihan jembatan istilah lokal (kemiri, batik, IDAK)", "Mock Speaking kedua dan input skor", "Mock Reading dan Listening dari materi resmi", "Review 20 kartu paling sulit"], gate: "Mock Speaking dan Writing masing-masing minimal 7,0 pada tes latihan." },
    { week: 9, theme: "Koherensi dan struktur esai", ielts: "Writing Task 2 empat tipe: opinion, discussion, problem-solution, two-part.", toefl: "Struktur opini plus alasan plus contoh plus penutup.", items: ["4 esai satu per tipe", "Penanda wacana variatif, tanpa pengulangan", "Analisis tiap esai di Coach dan perbaiki", "Minta penilaian pihak ketiga untuk satu esai", "Timed 40 menit per esai"], gate: "Esai 250 kata dalam 40 menit dengan kepadatan kesalahan di bawah 3." },
    { week: 10, theme: "Pronunciation dan intonasi", ielts: "Part 2 dan 3 dengan penekanan kata kunci.", toefl: "Ritme dan jeda alami pada jawaban 45 detik.", items: ["Baca Ulang via Mikrofon 10 kalimat per hari", "Kuasai bunyi TH, -s jamak, -ed, dan tekanan kata", "Latihan Nuclear Stress (tab 04)", "Rekam diri dan bandingkan dengan Native audio", "Sesi dengan tutor atau penutur untuk koreksi pengucapan"], gate: "Daftar kata meleset konsisten berkurang dibanding minggu 7." },
    { week: 11, theme: "Mock penuh bertahap", ielts: "Dua mock penuh Listening, Reading, Writing, Speaking.", toefl: "Dua simulasi penuh berdurasi resmi.", items: ["Mock penuh 1 dalam kondisi ujian", "Analisis kesalahan seluruh seksi", "Perbaiki 3 pola kesalahan teratas", "Mock penuh 2 dan input skor", "Istirahat penuh satu hari"], gate: "Dua mock berturut-turut mencapai target di Pelacak Skor." },
    { week: 12, theme: "Taper dan keputusan jadwal ujian", ielts: "Satu mock ringan, fokus review kesalahan.", toefl: "Latihan ringan, review strategi manajemen waktu.", items: ["Mock penuh 3 sebagai konfirmasi", "Cek Pelacak Skor: syarat siap ujian terpenuhi", "Daftar ujian resmi di tanggal yang dijadwalkan", "Review ringan Buku Kesalahan dan kartu SRS", "Siapkan dokumen ujian dan rute lokasi tes"], gate: "Tiga mock terakhir mencapai target. Jika belum, tunda ujian dan ulangi minggu 9 sampai 11." }
  ];

  var exams = {
    ielts: {
      label: "IELTS (mock, skala 0 sampai 9)", min: 0, max: 9, step: 0.5, target: 7.5, skillMin: 7.0,
      note: "Target 7,5 overall. Sebaiknya tidak ada skill di bawah 7,0 agar cadangan aman."
    },
    toeflNew: {
      label: "TOEFL iBT skala baru (1 sampai 6)", min: 1, max: 6, step: 0.5, target: 5.5, skillMin: 5.0,
      note: "Band 5,5 setara 107 sampai 113 pada skala lama menurut tabel ETS. Konservatif untuk target kampus 100."
    },
    toeflLegacy: {
      label: "TOEFL iBT skala lama (0 sampai 120)", min: 0, max: 120, step: 1, target: 100, skillMin: 24,
      note: "Skor 100 kira-kira setara 600 pada skala PBT lama. Periksa tabel konkordansi resmi kampus tujuan."
    }
  };

  var samples = [
    { id: "indonesia", label: "Perkenalan Indonesia", text: "Hello, my name is Kemal Thoriq. I'm 24 years old. Talking about Indonesia, Indonesia has several islands and tersebar in every like Java, Sumatra, Kalimantan, etc. We are proud about Indonesia because Indonesia has several culture, language, dialect, and acculturation of culture. So, we can choose anywhere we can live." },
    { id: "spices", label: "Pitching kemiri", text: "We supply Indonesian spices, especially what we called kemiri and stemless dried chili. Our kemiri has much moisture control and it depend of the harvest season. I very like to explain about our process because the buyer need more informations." },
    { id: "alkes", label: "Regulasi alkes", text: "Now we discuss about regulation of alkes in Indonesia. We are processing IDAK and CDAKB. The process is more difficult than before, but she don't worry because we have submitted the dossier yesterday. We are confident that the Kemenkes will issue the license soon." }
  ];

  var roadmapTracks = {
    daily14: {
      id: "daily14",
      title: "Peta Jalan Harian (14 Hari)",
      subtitle: "Urutan latihan harian untuk komunikasi ekspor, perizinan alat kesehatan, dan persiapan IELTS 7.5+",
      finishLabel: "DONE: Target 14 Hari Selesai",
      stops: [
        {
          id: "d1", badge: "Hari 1", title: "Perkenalan Diri & Skala Fakta Indonesia", focus: "A2 ke B2 · Jamak -s & Preposisi",
          tasks: [
            "Dikte 1 menit perkenalan diri dan geografi Indonesia",
            "Pastikan bunyi jamak -s terdengar jelas (islands, cultures, dialects)",
            "Ganti 'proud about' menjadi 'proud of' dan 'several islands' menjadi 'thousands of islands'"
          ],
          practiceText: "Hello, my name is Kemal Thoriq. I'm 24 years old. Talking about Indonesia, Indonesia has several islands and tersebar in every like Java, Sumatra, Kalimantan, etc. We are proud about Indonesia because Indonesia has several culture, language, dialect, and acculturation of culture."
        },
        {
          id: "d2", badge: "Hari 2", title: "Jembatan Istilah Lokal & Komoditas (Kemiri & Cabai)", focus: "B2 · Locally Known As",
          tasks: [
            "Latih pola jembatan kata: sebut istilah Inggris dulu lalu nama lokal",
            "Gunakan Present Simple 'what we call', bukan Past 'what we called'",
            "Shadowing 3 kali kalimat penawaran kemiri dan cabai kering"
          ],
          practiceText: "We supply Indonesian spices, especially what we called kemiri and stemless dried chili. Our kemiri has much moisture control and it depend of the harvest season."
        },
        {
          id: "d3", badge: "Hari 3", title: "Subject-Verb Agreement & Kata Benda Tak Terhitung", focus: "B1 ke B2 · The Buyer Needs",
          tasks: [
            "Perbaiki subjek tunggal ketiga: 'the buyer needs', 'our company supplies'",
            "Hapus akhiran -s pada kata benda tak terhitung (information, equipment, research)",
            "Cek baca ulang via mikrofon sampai kecocokan di atas 85 persen"
          ],
          practiceText: "The buyer need more informations about our raw materials and equipments. Our company have two warehouses and the manager want to check the moisture content."
        },
        {
          id: "d4", badge: "Hari 4", title: "Update Regulasi & Perizinan Alkes (IDAK, CDAKB, AKL)", focus: "B2 ke C1 · Istilah Kemenkes",
          tasks: [
            "Jembatani singkatan IDAK (Medical Device Distributor License) dan CDAKB (Good Distribution Practice)",
            "Hapus preposisi berlebih setelah kata kerja transitif (discuss the regulation, bukan discuss about)",
            "Bedakan Present Perfect vs Past Simple saat menyebut 'yesterday'"
          ],
          practiceText: "Now we discuss about regulation of alkes in Indonesia. We are processing IDAK and CDAKB. The process is more difficult than before, but she don't worry because we have submitted the dossier yesterday."
        },
        {
          id: "d5", badge: "Hari 5", title: "Follow-Up Mitra Asing (Mr. Malik & Video Produk)", focus: "B2 ke C1 · Komunikasi Bisnis",
          tasks: [
            "Susun pesan dan rekaman suara follow-up progres perizinan dan edit aset foto",
            "Gunakan pengingat sopan ('a gentle reminder regarding the product demo video')",
            "Pastikan 'look forward to' diikuti V-ing ('look forward to hearing from you')"
          ],
          practiceText: "Hi Mr. Malik, we sedang mengurus the licensing and regulations, and we already edited some product photos. I look forward to hear from you regarding the product video."
        },
        {
          id: "d6", badge: "Hari 6", title: "Spesifikasi Mutu, Kadar Air & Bea Cukai", focus: "B2 · Kalimat Pasif & Kolokasi",
          tasks: [
            "Gunakan kalimat pasif untuk alur produksi ('are sorted and packed for export')",
            "Kuasai istilah 'moisture content', 'Certificate of Analysis', dan 'customs clearance'",
            "Ulas 6 kartu kosakata pertama di tab Kartu Kosakata"
          ],
          practiceText: "The kadar air of our candlenuts is below eight percent. Before bea cukai, every batch is consist of strict quality sorting."
        },
        {
          id: "d7", badge: "Hari 7", title: "Evaluasi Pekan 1: Latihan Kesalahan & Uji Level", focus: "Evaluasi Pekan 1",
          tasks: [
            "Kerjakan 12 soal Uji Level untuk melihat perkembangan skor",
            "Selesaikan minimal 5 soal di Catatan Kesalahan sampai berstatus Dikuasai",
            "Rekam 1 monolog bebas 90 detik tanpa melihat catatan"
          ],
          practiceText: "In the other hand, we made a research about the market price. According to me, our product is different with other suppliers because we emphasize on quality."
        },
        {
          id: "d8", badge: "Hari 8", title: "Kalimat Kompleks & Penghubung C1 (Although, Whereas, Consequently)", focus: "C1 · Variasi Kalimat",
          tasks: [
            "Naikkan porsi kalimat kompleks hingga minimal 40 persen pada teks analisis",
            "Ganti penghubung lisan 'So,' dengan 'Consequently,' atau 'As a result,'",
            "Latih pola kontras 'Although the regulatory process is rigorous, ...'"
          ],
          practiceText: "The registration is cukup rumit. So, we prepare all documents early. We want to distribute medical devices to rumah sakit across Indonesia."
        },
        {
          id: "d9", badge: "Hari 9", title: "Mengganti Kata Umum dengan Kosakata Presisi", focus: "C1 · Pilihan Kata",
          tasks: [
            "Ganti 'very good' menjadi 'excellent/sound' dan 'very important' menjadi 'crucial'",
            "Ganti 'more difficult' menjadi 'increasingly rigorous/intricate'",
            "Salin dan baca keras versi kalimat Band 7.5+ sebanyak 3 kali"
          ],
          practiceText: "It is very important to get the izin edar from Kemenkes. This is a very good step for our big business in Indonesia."
        },
        {
          id: "d10", badge: "Hari 10", title: "Pelafalan: Bunyi TH, Huruf S Senyap, dan Akhiran -ed", focus: "B2 ke C1 · Pelafalan",
          tasks: [
            "Latih kata pantauan: island (AI-lend), thousand (THAU-zend), worked (WERKT)",
            "Ikuti panduan ejaan lidah Indonesia (perhatikan suku kata huruf besar)",
            "Cek pergeseran tekanan kata di tab Pelafalan & Intonasi"
          ],
          practiceText: "Indonesia has thousands of islands and diverse cultures. We worked through the regulations for three months and received the receipt on Wednesday."
        },
        {
          id: "d11", badge: "Hari 11", title: "IELTS Speaking Part 2: Bicara 2 Menit Utuh", focus: "B2 ke C1 · Kelancaran & Alur",
          tasks: [
            "Bicara 2 menit penuh menceritakan bisnis atau proyek yang sedang kamu bangun",
            "Gunakan 3 kalimat dari bagian Kalimat Lanjutan agar tidak kehabisan bahan bicara",
            "Targetkan kepadatan kesalahan di bawah 3,0 per 100 kata"
          ],
          practiceText: "I would like to talk about an export and medical device distribution business that we are building in Indonesia. We work with local farmers for spices and international manufacturers for hospital equipment."
        },
        {
          id: "d12", badge: "Hari 12", title: "IELTS Speaking Part 3 & Opini Terstruktur (PEEL)", focus: "C1 · Menyusun Argumen",
          tasks: [
            "Susun argumen dengan urutan: pendapat inti, alasan, contoh nyata, dan simpulan",
            "Gunakan pembuka opini formal ('From my perspective,', 'I would argue that')",
            "Latih 2 tantangan di tab Uji Level & Susun Kalimat"
          ],
          practiceText: "I think strict regulations are good for medical devices because they protect patients. Also, local companies can get a lot of benefits if they follow international standards."
        },
        {
          id: "d13", badge: "Hari 13", title: "Simulasi Presentasi Produk & Regulasi Utuh", focus: "C1 · Komunikasi Bisnis",
          tasks: [
            "Gabungkan pengenalan perusahaan, spesifikasi produk, dan kepatuhan regulasi dalam 1 teks utuh",
            "Tambahkan minimal 2 istilah bisnis baru milikmu di formulir aturan tambahan",
            "Pastikan indikator tata bahasa, kosakata, dan alur kalimat mencapai minimal 7,0"
          ],
          practiceText: "Speaking of our company, we export Indonesian candlenuts, locally known as kemiri, and we are currently processing our IDAK and CDAKB for medical devices. Although the regulatory process is rigorous, we are confident that the Ministry of Health will grant our marketing authorization soon."
        },
        {
          id: "d14", badge: "Hari 14", title: "Evaluasi Akhir & Pencatatan Skor Latihan", focus: "Evaluasi Hari ke-14",
          tasks: [
            "Catat skor simulasi di bagian Catatan Skor Latihan",
            "Pastikan seluruh aturan yang pernah keliru sudah berstatus Dikuasai",
            "Unduh cadangan data (.json) atau tambahkan target hari berikutnya di bawah"
          ],
          practiceText: "Over the past two weeks, we have systematically improved our grammatical accuracy, lexical precision, and pronunciation clarity to meet international business and IELTS Band 7.5 standards."
        }
      ]
    },
    weekly12: {
      id: "weekly12",
      title: "Peta Jalan 12 Minggu (IELTS 7.5+ & TOEFL)",
      subtitle: "Target mingguan bertahap dari pemetaan kesalahan dasar hingga simulasi ujian penuh",
      finishLabel: "DONE: Target 12 Minggu Selesai",
      stops: studyPlan.map(function (w) {
        return {
          id: "w" + w.week,
          badge: "Minggu " + w.week,
          title: w.theme,
          focus: "Target lulus: " + w.gate,
          tasks: w.items.slice(0, 4),
          practiceText: samples[(w.week - 1) % samples.length].text
        };
      })
    }
  };

  return {
    errorRules: errorRules,
    weakWordUpgrades: weakWordUpgrades,
    advancedWords: advancedWords,
    discourseMarkers: discourseMarkers,
    localTerms: localTerms,
    pronunciationWatch: pronunciationWatch,
    phoneticMap: phoneticMap,
    topicTemplates: topicTemplates,
    rubric: rubric,
    studyPlan: studyPlan,
    roadmapTracks: roadmapTracks,
    exams: exams,
    samples: samples
  };
})();
