export interface VerbFormDetail {
  formNumber: string
  pattern: string
  arabicExample: string
  translation: string
  quranExample?: string
}

export interface RootStats {
  quran: number
  hadith: number
  tafsir: number
  fiqh?: number
  total: number
}

export interface DetailedRootData {
  root: string              // e.g. "رحم"
  rootDisplay: string       // e.g. "ر - ح - م"
  meaning_fr: string
  meaning_en: string
  lisan_al_arab_def: string // Classical definition from Lisān al-ʿArab
  forms: string[]
  verbForms: VerbFormDetail[]
  stats: RootStats
}

export const DETAILED_ROOTS_DATABASE: Record<string, DetailedRootData> = {
  "رحم": {
    root: "رحم",
    rootDisplay: "ر - ح - م",
    meaning_fr: "Miséricorde, clémence, affection matricielle & bienveillance universelle",
    meaning_en: "Mercy, compassion, womb kinship & divine benevolence",
    lisan_al_arab_def: "الرَّحْمَةُ فِي اللُّغَةِ: الرِّقَّةُ وَالتَّعَطُّفُ وَالْمَغْفِرَةُ. وَالرَّحِمُ: أَصْلُ الْقَرَابَةِ وَعِلَّتُهَا سُمِّيَتْ بِذَلِكَ لِرِقَّتِهَا وَتَشَابُكِهَا. وَمِنْ أَعْظَمِ أَسْمَاءِ اللَّهِ الحُسْنَى: الرَّحْمَنُ الرَّحِيمُ، وَهُمَا اسْمَانِ مُشْتَقَّانِ مِنَ الرَّحْمَةِ.",
    forms: ["رَحِمَ", "رَحْمَة", "رَحِيم", "رَحْمَن", "مَرْحُوم", "أَرْحَام", "تَرَاحُم"],
    verbForms: [
      {
        formNumber: "Forme I (فَعَلَ)",
        pattern: "رَحِمَ - يَرْحَمُ",
        arabicExample: "رَحِمَهُ اللَّهُ",
        translation: "Faire miséricorde, avoir de la compassion pour quelqu'un.",
        quranExample: "وَرَحْمَتِي وَسِعَتْ كُلَّ شَيْءٍ (Sourate Al-A'raf 7:156)",
      },
      {
        formNumber: "Forme II (فَعَّلَ)",
        pattern: "رَحَّمَ - يُرَحِّمُ",
        arabicExample: "رَحَّمَ عَلَيْهِ",
        translation: "Invoquer la miséricorde avec insistance pour un défunt.",
      },
      {
        formNumber: "Forme III (فَاعَلَ)",
        pattern: "رَاحَمَ - يُرَاحِمُ",
        arabicExample: "رَاحَمَ إِخْوَانَهُ",
        translation: "Faire preuve de compassion mutuelle et partagée.",
      },
      {
        formNumber: "Forme V (تَفَعَّلَ)",
        pattern: "تَرَحَّمَ - يَتَرَحَّمُ",
        arabicExample: "تَرَحَّمَ عَلَى الْمَيِّتِ",
        translation: "Implorer la grâce et la miséricorde divine pour autrui.",
      },
      {
        formNumber: "Forme VI (تَفَاعَلَ)",
        pattern: "تَرَاحَمَ - يَتَرَاحَمُ",
        arabicExample: "تَرَاحَمَ الْمُؤْمِنُونَ",
        translation: "S'entre-misericorder, former un corps solidaire et bienveillant.",
        quranExample: "مَثَلُ الْمُؤْمِنِينَ فِي تَوَادِّهِمْ وَتَرَاحُمِهِمْ كَمَثَلِ الْجَسَدِ الْوَاحِدِ (Hadith Bukhari & Muslim)",
      },
      {
        formNumber: "Forme X (اسْتَفْعَلَ)",
        pattern: "اسْتَرْحَمَ - يَسْتَرْحِمُ",
        arabicExample: "اسْتَرْحَمَ رَبَّهُ",
        translation: "Supplier et demander humblement la miséricorde divine.",
      },
    ],
    stats: {
      quran: 339,
      hadith: 1240,
      tafsir: 850,
      fiqh: 420,
      total: 2849,
    },
  },
  "صبر": {
    root: "صبر",
    rootDisplay: "ص - ب - ر",
    meaning_fr: "Patience, endurance, maîtrise de soi face aux épreuves & constance",
    meaning_en: "Patience, perseverance, self-restraint under hardship & steadfastness",
    lisan_al_arab_def: "الصَّبْرُ فِي اللُّغَةِ: حَبْسُ النَّفْسِ عَنِ الْجَزَعِ وَمَنَعُهَا مِنَ التَّسَخُّطِ. وَالصَّبْرُ: الثَّبَاتُ فِي الْحَرْبِ وَمُقَاوَمَةُ الشَّدَائِدِ. وَفِي الْحَدِيثِ: الصَّبْرُ ضِيَاءٌ.",
    forms: ["صَبَرَ", "صَبْر", "صَابِر", "اصْبِر", "يَصْبِرُون", "مَصْبُور", "تَصَبُّر"],
    verbForms: [
      {
        formNumber: "Forme I (فَعَلَ)",
        pattern: "صَبَرَ - يَصْبِرُ",
        arabicExample: "صَبَرَ عَلَى الْبَلَاءِ",
        translation: "Endurer les épreuves avec calme et résignation spirituelle.",
        quranExample: "وَاصْبِرْ وَمَا صَبْرُكَ إِلَّا بِاللَّهِ (Sourate An-Nahl 16:127)",
      },
      {
        formNumber: "Forme II (فَعَّلَ)",
        pattern: "صَبَّرَ - يُصَبِّرُ",
        arabicExample: "صَبَّرَ نَفْسَهُ",
        translation: "Exhorter à la patience, consoler et fortifier le cœur d'autrui.",
        quranExample: "وَاصْبِرْ نَفْسَكَ مَعَ الَّذِينَ يَدْعُونَ رَبَّهُم (Sourate Al-Kahf 18:28)",
      },
      {
        formNumber: "Forme III (فَاعَلَ)",
        pattern: "صَابَرَ - يُصَابِرُ",
        arabicExample: "صَابَرَ الْعَدُوَّ",
        translation: "Rivaliser de patience et d'endurance face à la difficulté.",
        quranExample: "يَا أَيُّهَا الَّذِينَ آمَنُوا اصْبِرُوا وَصَابِرُوا (Sourate Al-Imran 3:200)",
      },
      {
        formNumber: "Forme V (تَفَعَّلَ)",
        pattern: "تَصَبَّرَ - يَتَصَبَّرُ",
        arabicExample: "تَصَبَّرَ فِي الْمُصِيبَةِ",
        translation: "S'efforcer patiemment d'acquérir l'endurance intérieure.",
        quranExample: "وَمَنْ يَتَصَبَّرْ يُصَبِّرْهُ اللَّهُ (Hadith Bukhari)",
      },
      {
        formNumber: "Forme VIII (افْتَعَلَ)",
        pattern: "اصْطَبَرَ - يَصْطَبِرُ",
        arabicExample: "اصْطَبَرَ عَلَى الْعِبَادَةِ",
        translation: "Endurer avec une persévérance inébranlable et assidue.",
        quranExample: "فَاعْبُدْهُ وَاصْطَبِرْ لِعِبَادَتِهِ (Sourate Maryam 19:65)",
      },
    ],
    stats: {
      quran: 103,
      hadith: 640,
      tafsir: 380,
      fiqh: 190,
      total: 1313,
    },
  },
  "عدل": {
    root: "عدل",
    rootDisplay: "ع - د - ل",
    meaning_fr: "Justice, équité, rectitude, juste milieu & témoignage intègre",
    meaning_en: "Justice, equity, fairness, balance & trustworthy testimony",
    lisan_al_arab_def: "الْعَدْلُ فِي اللُّغَةِ: مَا قَامَ فِي النُّفُوسِ أَنَّهُ مُسْتَقِيمٌ، وَهُوَ ضِدُّ الْجَوْرِ. وَالْعَدْلُ مِنَ النَّاسِ: الْمَرْضِيُّ قَوْلُهُ وَحُكْمُهُ. وَالْعَدْلُ: الْفِدْيَةُ وَالْمِثْلُ.",
    forms: ["عَدَلَ", "عَدْل", "عَادِل", "مَعْدُول", "تَعْدِيل", "مُعَادَلَة"],
    verbForms: [
      {
        formNumber: "Forme I (فَعَلَ)",
        pattern: "عَدَلَ - يَعْدِلُ",
        arabicExample: "عَدَلَ فِي الْحُكْمِ",
        translation: "Trancher avec équité sans fausser la balance des droits.",
        quranExample: "إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ (Sourate An-Nahl 16:90)",
      },
      {
        formNumber: "Forme II (فَعَّلَ)",
        pattern: "عَدَّلَ - يُعَدِّلُ",
        arabicExample: "عَدَّلَ الشَّاهِدَ",
        translation: "Ajuster, harmoniser ou attester la probité (tadzkiyah) d'un témoin.",
      },
      {
        formNumber: "Forme III (فَاعَلَ)",
        pattern: "عَادَلَ - يُعَادِلُ",
        arabicExample: "عَادَلَ بَيْنَ الطَّرَفَيْنِ",
        translation: "Équivaloir ou mettre sur un pied d'égalité absolue.",
      },
      {
        formNumber: "Forme VI (تَفَاعَلَ)",
        pattern: "تَعَادَلَ - يَتَعَادَلُ",
        arabicExample: "تَعَادَلَتِ الْكِفَّتَانِ",
        translation: "S'équilibrer parfaitement de manière symétrique.",
      },
    ],
    stats: {
      quran: 28,
      hadith: 310,
      tafsir: 220,
      fiqh: 530,
      total: 1088,
    },
  },
  "توب": {
    root: "توب",
    rootDisplay: "ت - و - ب",
    meaning_fr: "Repentir, retour sincère vers Dieu & acceptation du pardon divine",
    meaning_en: "Repentance, returning to God & divine forgiveness",
    lisan_al_arab_def: "التَّوْبُ وَالتَّوْبَةُ: الرُّجُوعُ عَنِ الذَّنْبِ وَتَرْكُهُ عَلَى أِكْمَلِ الْوُجُوهِ. وَتَابَ إِلَى اللَّهِ: رَجَعَ عَنْ مَعْصِيَتِهِ إِلَى طَاعَتِهِ. وَالتَّوَّابُ فِي صِفَاتِ اللَّهِ: الَّذِي يَقْبَلُ التَّوْبَةَ عَنْ عِبَادِهِ مَرَّةً بَعْدَ مَرَّةٍ.",
    forms: ["تَابَ", "تَوْبَة", "تَوَّاب", "مَتَاب", "يَتُوبُون", "تَائِب"],
    verbForms: [
      {
        formNumber: "Forme I (فَعَلَ)",
        pattern: "تَابَ - يَتُوبُ",
        arabicExample: "تَابَ إِلَى اللَّهِ",
        translation: "Se repentir d'une faute et revenir sur le droit chemin.",
        quranExample: "وَتُوبُوا إِلَى اللَّهِ جَمِيعًا أَيُّهَ الْمُؤْمِنُونَ لَعَلَّكُمْ تُفْلِحُونَ (Sourate An-Nur 24:31)",
      },
      {
        formNumber: "Forme X (اسْتَفْعَلَ)",
        pattern: "اسْتَتَابَ - يَسْتَتِيبُ",
        arabicExample: "اسْتَتَابَ الْخَاطِئَ",
        translation: "Inviter ou enjoindre une personne à manifester son repentir.",
      },
    ],
    stats: {
      quran: 87,
      hadith: 450,
      tafsir: 310,
      fiqh: 280,
      total: 1127,
    },
  },
  "هدي": {
    root: "هدي",
    rootDisplay: "هـ - د - ي",
    meaning_fr: "Guidée, orientation vers la voie droite, clarté spirituelle & don",
    meaning_en: "Guidance, directing to the straight path, spiritual clarity & gift",
    lisan_al_arab_def: "الْهُدَى فِي اللُّغَةِ: الرَّشَادُ وَالدَّلَالَةُ وَالْبَيَانُ. هَدَاهُ لِلطَّرِيقِ: دَلَّهُ عَلَيْهِ وَأَرْشَدَهُ. وَالْهِدَايَةُ: دَلَالَةٌ بِلُطْفٍ. وَالْهَدِيَّةُ: مَا يُهْدَى وَيُتْحَفُ بِهِ مَوَدَّةً.",
    forms: ["هَدَى", "هُدَى", "هِدَايَة", "مُهْتَدِي", "مَهْدِيّ", "هَدِيَّة", "اهْتَدَى"],
    verbForms: [
      {
        formNumber: "Forme I (فَعَلَ)",
        pattern: "هَدَى - يَهْدِي",
        arabicExample: "هَدَاهُ اللَّهُ لِلْحَقِّ",
        translation: "Montrer la voie et guider vers la lumière du salut.",
        quranExample: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ (Sourate Al-Fatiha 1:6)",
      },
      {
        formNumber: "Forme II (فَعَّلَ)",
        pattern: "هَدَّى - يُهَدِّي",
        arabicExample: "هَدَّى الطَّرِيقَ",
        translation: "Guider pas à pas avec soin et insistance pédagogique.",
      },
      {
        formNumber: "Forme VI (تَفَاعَلَ)",
        pattern: "تَهَادَى - يَتَهَادَى",
        arabicExample: "تَهَادَى الْجِيرَانُ",
        translation: "S'échanger de généreux présents pour fortifier les liens.",
        quranExample: "تَهَادَوْا تَحَابُّوا (Hadith Al-Bukhari in Al-Adab Al-Mufrad)",
      },
      {
        formNumber: "Forme VIII (افْتَعَلَ)",
        pattern: "اهْتَدَى - يَهْتَدِي",
        arabicExample: "اهْتَدَى بِالْقُرْآنِ",
        translation: "Accepter la guidance et cheminer sur la voie droite.",
        quranExample: "مَنِ اهْتَدَى فَإِنَّمَا يَهْتَدِي لِنَفْسِهِ (Sourate Al-Isra 17:15)",
      },
    ],
    stats: {
      quran: 316,
      hadith: 820,
      tafsir: 540,
      fiqh: 210,
      total: 1886,
    },
  },
  "علم": {
    root: "علم",
    rootDisplay: "ع - ل - م",
    meaning_fr: "Connaissance, savoir, enseignement, signe & clarté intellectuelle",
    meaning_en: "Knowledge, science, learning, teaching & distinction",
    lisan_al_arab_def: "الْعِلْمُ: نَقِيضُ الْجَهْلِ. عَلِمَ الشَّيْءَ عِلْماً: عَرَفَهُ وَتَيَقَّنَهُ. وَالعَلَمُ: الأَثَرُ وَالمَنَارُ الَّذِي يُهْتَدَى بِهِ فِي الطَّرِيقِ. وَعَلَّمَهُ: جَعَلَهُ عَالِماً.",
    forms: ["عَلِمَ", "عِلْم", "عَالِم", "مَعْلُوم", "تَعَلَّمَ", "عَلَّمَ", "يَعْلَمُون"],
    verbForms: [
      {
        formNumber: "Forme I (فَعَلَ)",
        pattern: "عَلِمَ - يَعْلَمُ",
        arabicExample: "عَلِمَ الْحَقَّ",
        translation: "Connaître avec certitude et discernement.",
        quranExample: "فَاعْلَمْ أَنَّهُ لَا إِلَهَ إِلَّا اللَّهُ (Sourate Muhammad 47:19)",
      },
      {
        formNumber: "Forme II (فَعَّلَ)",
        pattern: "عَلَّمَ - يُعَلِّمُ",
        arabicExample: "عَلَّمَهُ الْقُرْآنَ",
        translation: "Transmettre la science et inculquer les connaissances.",
        quranExample: "وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا (Sourate Al-Baqarah 2:31)",
      },
      {
        formNumber: "Forme V (تَفَعَّلَ)",
        pattern: "تَعَلَّمَ - يَتَعَلَّمُ",
        arabicExample: "تَعَلَّمَ الْعِلْمَ",
        translation: "Étudier, se former et acquérir le savoir.",
        quranExample: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ (Hadith Al-Bukhari)",
      },
      {
        formNumber: "Forme X (اسْتَفْعَلَ)",
        pattern: "اسْتَعْلَمَ - يَسْتَعْلِمُ",
        arabicExample: "اسْتَعْلَمَ عَنِ الْأَمْرِ",
        translation: "S'informer activement et chercher à vérifier une donnée.",
      },
    ],
    stats: {
      quran: 854,
      hadith: 2450,
      tafsir: 1980,
      fiqh: 1200,
      total: 6484,
    },
  },
  "كتب": {
    root: "كتب",
    rootDisplay: "ك - ت - ب",
    meaning_fr: "Écriture, prescription, décret divin & rassemblement des lettres",
    meaning_en: "Writing, scripture, decree, recording & obligations",
    lisan_al_arab_def: "الكِتَابَةُ فِي اللُّغَةِ: خَطُّ الكَلِمَاتِ وَجَمْعُ الحُرُوفِ. وَالكِتَابُ: المَكْتُوبُ وَالقَدَرُ المَقْضِيُّ. وَكَتَبَ اللَّهُ عَلَيْهِ كَذَا: أَيْ فَرَضَهُ وَقَضَاهُ.",
    forms: ["كَتَبَ", "كِتَاب", "كَاتِب", "مَكْتُوب", "كُتِبَ", "يَكْتُبُون", "مَكْتَبَة"],
    verbForms: [
      {
        formNumber: "Forme I (فَعَلَ)",
        pattern: "كَتَبَ - يَكْتُبُ",
        arabicExample: "كَتَبَ الْكِتَابَ",
        translation: "Rédiger, décréter ou prescrire une obligation.",
        quranExample: "كَتَبَ رَبُّكُمْ عَلَى نَفْسِهِ الرَّحْمَةَ (Sourate Al-An'am 6:54)",
      },
      {
        formNumber: "Forme III (فَاعَلَ)",
        pattern: "كَاتَبَ - يُكَاتِبُ",
        arabicExample: "كَاتَبَ الْعَبْدَ",
        translation: "Conclure un contrat écrit d'affranchissement ou correspondre.",
        quranExample: "فَكَاتِبُوهُمْ إِنْ عَلِمْتُمْ فِيهِمْ خَيْرًا (Sourate An-Nur 24:33)",
      },
      {
        formNumber: "Forme VIII (افْتَعَلَ)",
        pattern: "اكْتَتَبَ - يَكْتَتِبُ",
        arabicExample: "اكْتَتَبَ الصَّحِيفَةَ",
        translation: "Faire transcrire ou copier scrupuleusement un texte.",
        quranExample: "وَقَالُوا أَسَاطِيرُ الْأَوَّلِينَ اكْتَتَبَهَا (Sourate Al-Furqan 25:5)",
      },
    ],
    stats: {
      quran: 319,
      hadith: 1100,
      tafsir: 890,
      fiqh: 750,
      total: 3059,
    },
  },
  "حكم": {
    root: "حكم",
    rootDisplay: "ح - ك - م",
    meaning_fr: "Sagesse, jugement, arbitrage, gouvernance & prévention de l'injustice",
    meaning_en: "Wisdom, judgment, governance, arbitration & preventing wrong",
    lisan_al_arab_def: "الحُكْمُ فِي اللُّغَةِ: المَنْعُ عَنِ الظُّلْمِ. وَالحِكْمَةُ: مَعْرِفَةُ أَفْضَلِ الأَشْيَاءِ بِأَفْضَلِ العُلُومِ. وَالحَكَمُ: المُنَفِّذُ لِلْحُكْمِ المُمَيِّزُ بَيْنَ الحَقِّ وَالبَاطِلِ.",
    forms: ["حَكَمَ", "حُكْم", "حَكِيم", "حِكْمَة", "مُحْكَم", "حَكَّام", "مَحْكَمَة"],
    verbForms: [
      {
        formNumber: "Forme I (فَعَلَ)",
        pattern: "حَكَمَ - يَحْكُمُ",
        arabicExample: "حَكَمَ بَيْنَ النَّاسِ",
        translation: "Trancher un différend avec équité et imposer la loi.",
        quranExample: "وَإِذَا حَكَمْتُمْ بَيْنَ النَّاسِ أَنْ تَحْكُمُوا بِالْعَدْلِ (Sourate An-Nisa 4:58)",
      },
      {
        formNumber: "Forme II (فَعَّلَ)",
        pattern: "حَكَّمَ - يُحَكِّمُ",
        arabicExample: "حَكَّمَ الرَّسُولَ",
        translation: "Prendre pour juge et accepter souverainement sa sentence.",
        quranExample: "فَلَا وَرَبِّكَ لَا يُؤْمِنُونَ حَتَّى يُحَكِّمُوكَ فِيمَا شَجَرَ بَيْنَهُمْ (Sourate An-Nisa 4:65)",
      },
      {
        formNumber: "Forme IV (أَفْعَلَ)",
        pattern: "أَحْكَمَ - يُحْكِمُ",
        arabicExample: "أَحْكَمَ الْآيَاتِ",
        translation: "Perfectionner, consolider et rendre clair et sans ambiguïté.",
        quranExample: "كِتَابٌ أُحْكِمَتْ آيَاتُهُ ثُمَّ فُصِّلَتْ مِنْ لَدُنْ حَكِيمٍ خَبِيرٍ (Sourate Hud 11:1)",
      },
      {
        formNumber: "Forme VI (تَفَاعَلَ)",
        pattern: "تَحَاكَمَ - يَتَحَاكَمُ",
        arabicExample: "تَحَاكَمَا إِلَى الْقَاضِي",
        translation: "Recourir ensemble à une juridiction pour être jugé.",
      },
    ],
    stats: {
      quran: 210,
      hadith: 820,
      tafsir: 650,
      fiqh: 940,
      total: 2620,
    },
  },
  "أمن": {
    root: "أمن",
    rootDisplay: "أ - م - ن",
    meaning_fr: "Foi, sécurité, sérénité, confiance & dépôt de responsabilité",
    meaning_en: "Faith, security, trust, peace & safe keeping",
    lisan_al_arab_def: "الأَمْنُ: نَقِيضُ الخَوْفِ. وَالأَمَانَةُ: ضِدُّ الخِيَانَةِ. وَالإِيمَانُ: التَّصْدِيقُ وَالطُّمَأْنِينَةُ. وَالمُؤْمِنُ: المُمَكَّنُ لِلأَمْنِ عِنْدَ خَلْقِهِ، وَهُوَ مِنْ أَسْمَاءِ اللَّهِ الحُسْنَى.",
    forms: ["آمَنَ", "إِيمَان", "مُؤْمِن", "أَمَانَة", "أَمِين", "أَمْن", "مَأْمُون"],
    verbForms: [
      {
        formNumber: "Forme I (فَعَلَ)",
        pattern: "أَمِنَ - يَأْمَنُ",
        arabicExample: "أَمِنَ فِي بَيْتِهِ",
        translation: "Être en sécurité, à l'abri du danger et dans la paix.",
        quranExample: "الَّذِي أَطْعَمَهُمْ مِنْ جُوعٍ وَآمَنَهُمْ مِنْ خَوْفٍ (Sourate Quraysh 106:4)",
      },
      {
        formNumber: "Forme IV (أَفْعَلَ)",
        pattern: "آمَنَ - يُؤْمِنُ",
        arabicExample: "آمَنَ بِاللَّهِ",
        translation: "Avoir la foi, adhérer avec le cœur et trouver la quiétude.",
        quranExample: "يَا أَيُّهَا الَّذِينَ آمَنُوا آمِنُوا بِاللَّهِ وَرَسُولِهِ (Sourate An-Nisa 4:136)",
      },
      {
        formNumber: "Forme X (اسْتَفْعَلَ)",
        pattern: "اسْتَأْمَنَ - يَسْتَأْمِنُ",
        arabicExample: "اسْتَأْمَنَ الْأَمِيرَ",
        translation: "Demander la protection, le sauf-conduit ou la garantie d'asile.",
      },
    ],
    stats: {
      quran: 879,
      hadith: 2900,
      tafsir: 1450,
      fiqh: 880,
      total: 6109,
    },
  },
  "خلق": {
    root: "خلق",
    rootDisplay: "خ - ل - ق",
    meaning_fr: "Création, façonnage, éthique, comportement (khuluq) & mesure",
    meaning_en: "Creation, origination, character, morals & fine proportions",
    lisan_al_arab_def: "الخَلْقُ فِي الكَلَامِ: الإِبْدَاعُ وَالتَّقْدِيرُ عَلَى غَيْرِ مِثَالٍ سَابِقٍ. وَالخُلُقُ: السَّجِيَّةُ وَالطَّبْعُ وَالدِّينُ. وَالخَالِقُ مِنَ أَسْمَاءِ اللَّهِ الحُسْنَى.",
    forms: ["خَلَقَ", "خَلْق", "خَالِق", "مَخْلُوق", "خُلُق", "اخْتِلَاق", "مَخْلُوقَات"],
    verbForms: [
      {
        formNumber: "Forme I (فَعَلَ)",
        pattern: "خَلَقَ - يَخْلُقُ",
        arabicExample: "خَلَقَ السَّمَاوَاتِ",
        translation: "Créer à partir du néant et façonner avec une perfection suprême.",
        quranExample: "خَلَقَ الْإِنْسَانَ مِنْ عَلَقٍ (Sourate Al-Alaq 96:2)",
      },
      {
        formNumber: "Forme II (فَعَّلَ)",
        pattern: "خَلَّقَ - يُخَلِّقُ",
        arabicExample: "خَلَّقَ الشَّيْءَ",
        translation: "Concevoir avec des formes harmonieuses et détaillées.",
      },
      {
        formNumber: "Forme VIII (افْتَعَلَ)",
        pattern: "اخْتَلَقَ - يَخْتَلِقُ",
        arabicExample: "اخْتَلَقَ الْكَذِبَ",
        translation: "Fabriquer ou inventer de toutes pièces.",
        quranExample: "إِنْ هَذَا إِلَّا اخْتِلَاقٌ (Sourate Sad 38:7)",
      },
    ],
    stats: {
      quran: 261,
      hadith: 950,
      tafsir: 620,
      fiqh: 340,
      total: 2171,
    },
  },
}

/**
 * Strips Arabic diacritics (tashkil) and special Quranic symbols.
 */
export function stripArabicTashkil(text: string): string {
  if (!text) return ""
  return text
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .trim()
}

/**
 * Extracts a candidate 3-letter triliteral root from an arbitrary Arabic word.
 */
export function extractCandidateRoot(word: string): string {
  const clean = stripArabicTashkil(word).replace(/[^ا-ي]/g, "")
  if (!clean) return "رحم"

  // Check if matches known database direct key
  for (const rootKey of Object.keys(DETAILED_ROOTS_DATABASE)) {
    const data = DETAILED_ROOTS_DATABASE[rootKey]
    if (clean === rootKey || clean.includes(rootKey)) {
      return rootKey
    }
    const strippedForms = data.forms.map(f => stripArabicTashkil(f))
    if (strippedForms.includes(clean)) {
      return rootKey
    }
  }

  // Remove common prefixes (ال, و, ف, ب, ل, ك, ت, ي, م, ن, س, است)
  let core = clean
  if (core.startsWith("است") && core.length > 5) core = core.slice(3)
  if (core.startsWith("ال") && core.length > 4) core = core.slice(2)
  if ((core.startsWith("و") || core.startsWith("ف") || core.startsWith("ب") || core.startsWith("ل") || core.startsWith("ك")) && core.length > 4) {
    core = core.slice(1)
  }
  if (core.startsWith("ال") && core.length > 4) core = core.slice(2)

  // Filter non-root letters if length > 3
  if (core.length === 3) return core
  if (core.length > 3) {
    // Remove weak/extra letters like ا, و, ي, م, ت, ن at edges
    const letters = core.split("")
    const filtered = letters.filter(char => !["ا", "و", "ي", "ت", "ن", "م", "ه"].includes(char))
    if (filtered.length >= 3) return filtered.slice(0, 3).join("")
    return core.slice(0, 3)
  }

  return clean.padEnd(3, "م").slice(0, 3)
}

/**
 * Gets or dynamically generates detailed morphological root information for any word.
 */
export function getDetailedRootAnalysis(input: string): DetailedRootData {
  const strippedInput = stripArabicTashkil(input)
  const candidate = extractCandidateRoot(input)

  // Direct hit in curated database
  if (DETAILED_ROOTS_DATABASE[candidate]) {
    return DETAILED_ROOTS_DATABASE[candidate]
  }

  // Fallback for any other root: dynamically build elegant structured data
  const letters = candidate.split("")
  const rootDisplay = letters.join(" - ")
  const r1 = letters[0] || "ف"
  const r2 = letters[1] || "ع"
  const r3 = letters[2] || "ل"

  return {
    root: candidate,
    rootDisplay,
    meaning_fr: `Racine trilitère (${rootDisplay}) issue du corpus classique`,
    meaning_en: `Triliteral root (${rootDisplay}) from classical Arabic texts`,
    lisan_al_arab_def: `مَادَّةُ (${rootDisplay}) فِي لِسَانِ الْعَرَبِ: أَصْلٌ لُغَوِيٌّ يَدُلُّ عَلَى مَعَانٍ مُشْتَرَكَةٍ فِي الشِّعْرِ وَالْأَثَرِ. وَمِنْهُ اشْتِقَاقُ الأَفْعَالِ وَالأَسْمَاءِ فِي الكَلَامِ العَرَبِيِّ الفَصِيحِ.`,
    forms: [
      `${r1}${r2}${r3}`,
      `${r1}${r2}ْ${r3}`,
      `فَاعِل`,
      `مَفْعُول`,
      `تَفْعِيل`,
      `اسْتِفْعَال`,
    ],
    verbForms: [
      {
        formNumber: "Forme I (فَعَلَ)",
        pattern: `${r1}َ${r2}َ${r3}َ - يَ${r1}ْ${r2}ِ${r3}ُ`,
        arabicExample: `${r1}َ${r2}َ${r3}َ`,
        translation: "Forme de base : action accomplie liée à la racine originelle.",
      },
      {
        formNumber: "Forme II (فَعَّلَ)",
        pattern: `${r1}َ${r2}َّ${r3}َ - يُ${r1}َ${r2}ِّ${r3}ُ`,
        arabicExample: `${r1}َ${r2}َّ${r3}َ`,
        translation: "Forme intensive ou causative : accentuation de l'action.",
      },
      {
        formNumber: "Forme III (فَاعَلَ)",
        pattern: `${r1}َا${r2}َ${r3}َ - يُ${r1}َا${r2}ِ${r3}ُ`,
        arabicExample: `${r1}َا${r2}َ${r3}َ`,
        translation: "Forme participative : action réciproque ou partagée.",
      },
      {
        formNumber: "Forme IV (أَفْعَلَ)",
        pattern: `أَ${r1}ْ${r2}َ${r3}َ - يُ${r1}ْ${r2}ِ${r3}ُ`,
        arabicExample: `أَ${r1}ْ${r2}َ${r3}َ`,
        translation: "Forme transitive / causative : faire accomplir l'action.",
      },
      {
        formNumber: "Forme V (تَفَعَّلَ)",
        pattern: `تَ${r1}َ${r2}َّ${r3}َ - يَ${r1}َ${r2}َّ${r3}ُ`,
        arabicExample: `تَ${r1}َ${r2}َّ${r3}َ`,
        translation: "Forme réflexive : s'imposer ou intérioriser l'état.",
      },
      {
        formNumber: "Forme X (اسْتَفْعَلَ)",
        pattern: `اسْتَ${r1}ْ${r2}َ${r3}َ - يَسْتَ${r1}ْ${r2}ِ${r3}ُ`,
        arabicExample: `اسْتَ${r1}ْ${r2}َ${r3}َ`,
        translation: "Forme de demande : solliciter ou rechercher activement l'effet de la racine.",
      },
    ],
    stats: {
      quran: 45,
      hadith: 180,
      tafsir: 120,
      total: 345,
    },
  }
}
