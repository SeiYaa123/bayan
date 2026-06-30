"use client"

import { useState } from "react"
import Link from "next/link"
import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"

interface TextCard {
  source: "quran" | "hadith"
  reference: string
  arabic: string
  translation: string
  corpusHref?: string
}

interface Lesson {
  num: number
  arabic: string
  title: string
  subtitle: string
  intro: string
  texts: TextCard[]
  takeaway: string
}

const LESSONS: Lesson[] = [
  {
    num: 1,
    arabic: "الشهادة",
    title: "La Shahada",
    subtitle: "Qu'est-ce que l'Islam ?",
    intro:
      "L'Islam signifie littéralement « soumission » — soumission à un seul Dieu. Selon la foi islamique, c'est la religion de tous les prophètes depuis Adam : Abraham, Moïse et Jésus étaient tous soumis à Dieu. Tout commence par une déclaration, la Shahada : « Il n'y a de divinité qu'Allah, et Muhammad est Son messager. » Cette phrase résume l'essentiel : un Dieu unique, et un Prophète envoyé pour guider l'humanité.",
    texts: [
      {
        source: "quran",
        reference: "47:19",
        arabic: "فَٱعْلَمْ أَنَّهُۥ لَآ إِلَٰهَ إِلَّا ٱللَّهُ",
        translation: "Sache qu'il n'y a de divinité qu'Allah.",
        corpusHref: "/corpus/quran/47",
      },
      {
        source: "quran",
        reference: "2:136",
        arabic:
          "قُولُوٓا۟ ءَامَنَّا بِٱللَّهِ وَمَآ أُنزِلَ إِلَيْنَا وَمَآ أُنزِلَ إِلَىٰٓ إِبْرَٰهِـۧمَ وَإِسْمَٰعِيلَ وَإِسْحَٰقَ وَيَعْقُوبَ وَٱلْأَسْبَاطِ وَمَآ أُوتِىَ مُوسَىٰ وَعِيسَىٰ وَمَآ أُوتِىَ ٱلنَّبِيُّونَ مِن رَّبِّهِمْ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّنْهُمْ",
        translation:
          "Dites : « Nous croyons en Allah, en ce qui nous a été révélé, en ce qui a été révélé à Abraham, Ismaël, Isaac, Jacob et les Tribus, en ce qui a été donné à Moïse et à Jésus, et en ce qui a été donné aux prophètes de la part de leur Seigneur. Nous ne faisons pas de distinction entre eux. »",
        corpusHref: "/corpus/quran/2",
      },
      {
        source: "hadith",
        reference: "Muslim 8",
        arabic:
          "الْإِسْلَامُ أَنْ تَشْهَدَ أَنْ لَا إِلَهَ إِلَّا اللهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللهِ وَتُقِيمَ الصَّلَاةَ وَتُؤْتِيَ الزَّكَاةَ وَتَصُومَ رَمَضَانَ وَتَحُجَّ الْبَيْتَ إِنِ اسْتَطَعْتَ إِلَيْهِ سَبِيلًا",
        translation:
          "L'Islam consiste à témoigner qu'il n'y a de divinité qu'Allah et que Muhammad est le messager d'Allah, à accomplir la prière, à acquitter la Zakat, à jeûner pendant le Ramadan et à accomplir le pèlerinage à la Maison si tu en as les moyens.",
        corpusHref: "/corpus/hadith/muslim",
      },
    ],
    takeaway:
      "L'Islam se définit par la foi en un seul Dieu et l'acceptation de Muhammad comme prophète. C'est le point de départ de tout.",
  },
  {
    num: 2,
    arabic: "التوحيد",
    title: "Allah",
    subtitle: "L'unicité de Dieu",
    intro:
      "Au cœur de l'Islam se trouve le Tawhid — l'unicité absolue de Dieu. Allah n'est pas un dieu parmi d'autres : Il est l'unique Créateur, sans associé, sans enfant, sans forme. La sourate Al-Ikhlas (« La Pureté ») résume cette conception en quatre versets : c'est l'une des plus récitées du Coran. Connaître Allah, c'est comprendre qu'Il est infini, éternel, et que rien ne Lui est comparable.",
    texts: [
      {
        source: "quran",
        reference: "112:1–4",
        arabic:
          "قُلْ هُوَ ٱللَّهُ أَحَدٌ ۝ ٱللَّهُ ٱلصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌ",
        translation:
          "Dis : « Il est Allah, l'Unique. Allah, le Seul à qui tout recourt. Il n'a pas engendré et n'a pas été engendré. Et nul n'est égal à Lui. »",
        corpusHref: "/corpus/quran/112",
      },
      {
        source: "quran",
        reference: "2:255",
        arabic:
          "ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌ وَلَا نَوْمٌ",
        translation:
          "Allah — point de divinité en dehors de Lui, le Vivant, Celui qui subsiste par Lui-même. Ni somnolence ni sommeil ne Le saisissent.",
        corpusHref: "/corpus/quran/2",
      },
      {
        source: "hadith",
        reference: "Bukhari 7405",
        arabic:
          "يَقُولُ اللَّهُ تَعَالَى: أَنَا عِنْدَ ظَنِّ عَبْدِي بِي، وَأَنَا مَعَهُ إِذَا ذَكَرَنِي",
        translation:
          "Allah dit : « Je suis tel que Mon serviteur pense de Moi, et Je suis avec lui lorsqu'il Me mentionne. »",
        corpusHref: "/corpus/hadith/bukhari",
      },
    ],
    takeaway:
      "Allah est unique, éternel, et proche de chaque être humain. Comprendre cela transforme la façon dont on Le prie et Le conçoit.",
  },
  {
    num: 3,
    arabic: "النبي ﷺ",
    title: "Le Prophète Muhammad",
    subtitle: "L'envoyé de Dieu",
    intro:
      "Muhammad (né vers 570 à La Mecque, mort en 632) est le dernier prophète de l'Islam. Il n'est pas divin — c'est un être humain choisi pour transmettre le message d'Allah. Orphelin dès l'enfance, marchand réputé pour son honnêteté, il reçoit la révélation coranique à 40 ans. Sa vie est une source d'exemple pour les musulmans : sa manière de traiter ses proches, ses ennemis, les pauvres. On dit qu'il était « le Coran vivant ».",
    texts: [
      {
        source: "quran",
        reference: "33:21",
        arabic:
          "لَّقَدْ كَانَ لَكُمْ فِى رَسُولِ ٱللَّهِ أُسْوَةٌ حَسَنَةٌ لِّمَن كَانَ يَرْجُوا۟ ٱللَّهَ وَٱلْيَوْمَ ٱلْءَاخِرَ وَذَكَرَ ٱللَّهَ كَثِيرًا",
        translation:
          "Vous avez certes dans le Messager d'Allah un excellent modèle à suivre pour quiconque espère en Allah et au Jour dernier et invoque Allah fréquemment.",
        corpusHref: "/corpus/quran/33",
      },
      {
        source: "quran",
        reference: "68:4",
        arabic: "وَإِنَّكَ لَعَلَىٰ خُلُقٍ عَظِيمٍ",
        translation: "Et tu es certes d'une morale élevée.",
        corpusHref: "/corpus/quran/68",
      },
      {
        source: "hadith",
        reference: "Muslim 746",
        arabic:
          "كَانَ خُلُقُهُ الْقُرْآنَ",
        translation:
          "Son caractère, c'était le Coran. (Réponse d'Aïcha ﺭﺿﻲ ﺍﻟﻠﻪ ﻋﻨﻬﺎ quand on lui demandait de décrire le Prophète ﷺ.)",
        corpusHref: "/corpus/hadith/muslim",
      },
    ],
    takeaway:
      "Muhammad est un modèle humain, pas un dieu. Sa vie illustre comment vivre selon les valeurs de l'Islam : équité, douceur, foi.",
  },
  {
    num: 4,
    arabic: "القرآن",
    title: "Le Coran",
    subtitle: "La parole révélée",
    intro:
      "Le Coran est le texte sacré de l'Islam — selon la foi musulmane, c'est la parole même d'Allah révélée au Prophète Muhammad via l'archange Jibrîl (Gabriel) sur une période de 23 ans. Le texte a été mémorisé par des milliers de compagnons et transcrit sous le calife Uthman. Il est composé de 114 sourates (chapitres) et 6 236 versets. La récitation du Coran est un acte de dévotion : la tradition de mémorisation intégrale (Hafiz) est vivante jusqu'à aujourd'hui.",
    texts: [
      {
        source: "quran",
        reference: "1:1–7",
        arabic:
          "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ۝ ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ ۝ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ۝ مَٰلِكِ يَوْمِ ٱلدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ ۝ صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ",
        translation:
          "Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux. Louange à Allah, Seigneur de l'univers. Le Tout Miséricordieux, le Très Miséricordieux. Maître du Jour de la rétribution. C'est Toi [seul] que nous adorons, et c'est Toi [seul] dont nous implorons le secours. Guide-nous dans le droit chemin, le chemin de ceux que Tu as comblés de faveurs, non pas de ceux qui ont encouru Ta colère, ni des égarés.",
        corpusHref: "/corpus/quran/1",
      },
      {
        source: "quran",
        reference: "17:9",
        arabic:
          "إِنَّ هَٰذَا ٱلْقُرْءَانَ يَهْدِى لِلَّتِى هِىَ أَقْوَمُ",
        translation:
          "Certes, ce Coran guide vers ce qu'il y a de plus droit.",
        corpusHref: "/corpus/quran/17",
      },
      {
        source: "hadith",
        reference: "Bukhari 5027",
        arabic:
          "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
        translation:
          "Le meilleur d'entre vous est celui qui apprend le Coran et l'enseigne.",
        corpusHref: "/corpus/hadith/bukhari",
      },
    ],
    takeaway:
      "Al-Fatiha, la sourate d'ouverture, est récitée dans chaque prière quotidienne. C'est le premier texte à connaître.",
  },
  {
    num: 5,
    arabic: "الأركان",
    title: "Les Cinq Piliers",
    subtitle: "La structure de la pratique",
    intro:
      "L'Islam repose sur cinq piliers fondamentaux qui structurent la vie du croyant. Ce ne sont pas de simples rituels : chaque pilier a une dimension spirituelle, sociale et éthique. La Shahada (foi), la Salat (prière 5 fois par jour), la Zakat (aumône 2,5% de l'épargne), le Sawm (jeûne du Ramadan), et le Hajj (pèlerinage à La Mecque au moins une fois dans sa vie, si on en a les moyens). Ces cinq pratiques créent un rythme quotidien, hebdomadaire et annuel centré sur Dieu.",
    texts: [
      {
        source: "hadith",
        reference: "Bukhari 8",
        arabic:
          "بُنِيَ الإِسْلَامُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَإِقَامِ الصَّلَاةِ، وَإِيتَاءِ الزَّكَاةِ، وَالحَجِّ، وَصَوْمِ رَمَضَانَ",
        translation:
          "L'Islam est bâti sur cinq choses : témoigner qu'il n'y a de divinité qu'Allah et que Muhammad est le Messager d'Allah, accomplir la prière, acquitter la Zakat, le pèlerinage et le jeûne du Ramadan.",
        corpusHref: "/corpus/hadith/bukhari",
      },
      {
        source: "quran",
        reference: "2:177",
        arabic:
          "وَلَٰكِنَّ ٱلْبِرَّ مَنْ ءَامَنَ بِٱللَّهِ وَٱلْيَوْمِ ٱلْءَاخِرِ وَٱلْمَلَٰٓئِكَةِ وَٱلْكِتَٰبِ وَٱلنَّبِيِّۦنَ وَءَاتَى ٱلْمَالَ عَلَىٰ حُبِّهِۦ ذَوِى ٱلْقُرْبَىٰ وَٱلْيَتَٰمَىٰ وَٱلْمَسَٰكِينَ",
        translation:
          "La piété véritable est de croire en Allah, au Jour dernier, aux Anges, aux Livres, aux Prophètes, et de donner de ses biens, malgré l'amour qu'on leur porte, aux proches, aux orphelins, aux nécessiteux.",
        corpusHref: "/corpus/quran/2",
      },
      {
        source: "quran",
        reference: "2:183",
        arabic:
          "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ كُتِبَ عَلَيْكُمُ ٱلصِّيَامُ كَمَا كُتِبَ عَلَى ٱلَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ",
        translation:
          "Ô vous qui croyez ! Le jeûne vous a été prescrit comme il l'a été à ceux qui vous ont précédés. Peut-être serez-vous pieux.",
        corpusHref: "/corpus/quran/2",
      },
    ],
    takeaway:
      "Les cinq piliers sont la colonne vertébrale de la pratique islamique. La foi sans action, et l'action sans foi, sont incomplètes.",
  },
  {
    num: 6,
    arabic: "الصلاة",
    title: "La Prière",
    subtitle: "Cinq rendez-vous avec Dieu",
    intro:
      "La Salat est la prière rituelle accomplie cinq fois par jour : à l'aube (Fajr), à midi (Dhuhr), l'après-midi (Asr), au coucher du soleil (Maghrib) et la nuit (Isha). Elle est précédée d'une purification rituelle (wudu). Chaque prière est une pause consciente dans la journée — un retour à l'essentiel. Elle se fait face à La Mecque, en arabe, avec des gestes précis (debout, incliné, prosterné). La prière est le lien direct entre le croyant et son Créateur, sans intermédiaire.",
    texts: [
      {
        source: "quran",
        reference: "2:238",
        arabic:
          "حَٰفِظُوا۟ عَلَى ٱلصَّلَوَٰتِ وَٱلصَّلَوٰةِ ٱلْوُسْطَىٰ وَقُومُوا۟ لِلَّهِ قَٰنِتِينَ",
        translation:
          "Observez scrupuleusement les prières — surtout la prière du milieu — et tenez-vous debout devant Allah avec dévotion.",
        corpusHref: "/corpus/quran/2",
      },
      {
        source: "quran",
        reference: "29:45",
        arabic:
          "إِنَّ ٱلصَّلَوٰةَ تَنْهَىٰ عَنِ ٱلْفَحْشَآءِ وَٱلْمُنكَرِ",
        translation:
          "La prière préserve des turpitudes et des actions blâmables.",
        corpusHref: "/corpus/quran/29",
      },
      {
        source: "hadith",
        reference: "Tirmidhi 413",
        arabic:
          "أَوَّلُ مَا يُحَاسَبُ بِهِ الْعَبْدُ يَوْمَ الْقِيَامَةِ مِنْ عَمَلِهِ صَلَاتُهُ",
        translation:
          "La première chose sur laquelle le serviteur sera interrogé au Jour du Jugement, parmi ses actes, sera sa prière.",
        corpusHref: "/corpus/hadith/tirmidhi",
      },
    ],
    takeaway:
      "La prière n'est pas une contrainte mais un ancrage. Cinq fois par jour, le croyant interrompt le monde pour se souvenir de l'essentiel.",
  },
  {
    num: 7,
    arabic: "الأخلاق",
    title: "L'Éthique",
    subtitle: "Le caractère au-dessus du rituel",
    intro:
      "L'Islam ne se résume pas aux rites. Le Prophète disait que la religion, c'est d'abord le bon caractère. Honnêteté dans les affaires, douceur avec sa famille, générosité envers les pauvres, respect des voisins — toutes ces valeurs sont explicitement commandées. L'Islam insiste sur l'équité (adl), la bienfaisance (ihsan) et la solidarité (ukhuwwa). Un musulman pieux mais injuste avec ses semblables contredit lui-même sa foi. L'éthique est inséparable de la spiritualité.",
    texts: [
      {
        source: "quran",
        reference: "16:90",
        arabic:
          "إِنَّ ٱللَّهَ يَأْمُرُ بِٱلْعَدْلِ وَٱلْإِحْسَٰنِ وَإِيتَآئِ ذِى ٱلْقُرْبَىٰ وَيَنْهَىٰ عَنِ ٱلْفَحْشَآءِ وَٱلْمُنكَرِ وَٱلْبَغْىِ",
        translation:
          "Certes, Allah ordonne l'équité, la bienfaisance et l'assistance aux proches. Et Il interdit la turpitude, le blâmable et l'injustice.",
        corpusHref: "/corpus/quran/16",
      },
      {
        source: "hadith",
        reference: "Bukhari 6035",
        arabic:
          "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
        translation:
          "Aucun d'entre vous ne croit vraiment tant qu'il n'aime pas pour son frère ce qu'il aime pour lui-même.",
        corpusHref: "/corpus/hadith/bukhari",
      },
      {
        source: "hadith",
        reference: "Tirmidhi 2004",
        arabic:
          "أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا",
        translation:
          "Le croyant le plus parfait en foi est celui qui a le meilleur caractère.",
        corpusHref: "/corpus/hadith/tirmidhi",
      },
    ],
    takeaway:
      "La foi sans éthique est incomplète. L'Islam lie inséparablement la relation à Dieu et la relation aux autres.",
  },
  {
    num: 8,
    arabic: "الرحمة",
    title: "La Miséricorde",
    subtitle: "Le cœur du message",
    intro:
      "Si un seul mot devait résumer l'Islam, ce serait Rahma — la miséricorde. Le Coran s'ouvre par « Bismillah Al-Rahman Al-Rahim » : « Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux ». Ces deux attributs de la miséricorde reviennent dans chaque sourate. Allah a 99 noms, dont Al-Rahman et Al-Rahim sont les plus fréquents. Le Prophète est décrit dans le Coran comme « une miséricorde pour les mondes ». Comprendre l'Islam comme une religion de miséricorde, c'est en saisir l'âme.",
    texts: [
      {
        source: "quran",
        reference: "21:107",
        arabic: "وَمَآ أَرْسَلْنَٰكَ إِلَّا رَحْمَةً لِّلْعَٰلَمِينَ",
        translation:
          "Et Nous ne t'avons envoyé qu'en tant que miséricorde pour les mondes.",
        corpusHref: "/corpus/quran/21",
      },
      {
        source: "quran",
        reference: "6:12",
        arabic:
          "كَتَبَ عَلَىٰ نَفْسِهِ ٱلرَّحْمَةَ",
        translation:
          "Il a prescrit la miséricorde à Lui-même.",
        corpusHref: "/corpus/quran/6",
      },
      {
        source: "hadith",
        reference: "Bukhari 6000",
        arabic:
          "إِنَّ اللَّهَ خَلَقَ الرَّحْمَةَ يَوْمَ خَلَقَهَا مِائَةَ جُزْءٍ، فَأَمْسَكَ عِنْدَهُ تِسْعَةً وَتِسْعِينَ جُزْءًا، وَأَنْزَلَ فِي الأَرْضِ جُزْءًا وَاحِدًا، فَمِنْ ذَلِكَ الجُزْءِ يَتَرَاحَمُ الخَلائِقُ",
        translation:
          "Allah a créé la miséricorde en cent parts. Il en a retenu quatre-vingt-dix-neuf auprès de Lui et en a envoyé une seule sur terre. C'est de cette unique part que les créatures se font miséricorde entre elles.",
        corpusHref: "/corpus/hadith/bukhari",
      },
    ],
    takeaway:
      "La miséricorde n'est pas une option dans l'Islam — elle est au cœur de la conception de Dieu, du Prophète et de la communauté.",
  },
]

const SOURCE_COLORS = {
  quran: { badge: "rgba(200,157,58,0.15)", text: "#C89D3A", border: "rgba(200,157,58,0.25)" },
  hadith: { badge: "rgba(96,165,250,0.12)", text: "#60a5fa", border: "rgba(96,165,250,0.22)" },
}

function TextCardView({ card }: { card: TextCard }) {
  const colors = SOURCE_COLORS[card.source]
  return (
    <div
      className="rounded-xl border flex flex-col gap-4 p-6"
      style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ background: colors.badge, color: colors.text, border: `1px solid ${colors.border}` }}
          >
            {card.source === "quran" ? "Coran" : "Hadith"}
          </span>
          <span
            className="text-xs font-mono"
            style={{ color: "var(--color-text-muted)" }}
          >
            {card.reference}
          </span>
        </div>
        {card.corpusHref && (
          <Link
            href={card.corpusHref}
            className="text-xs transition-opacity hover:opacity-80"
            style={{ color: "var(--color-text-muted)" }}
          >
            Lire dans le corpus →
          </Link>
        )}
      </div>

      <p
        dir="rtl"
        className="leading-loose text-right"
        style={{
          fontFamily: "'Amiri', serif",
          fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)",
          color: "var(--color-text)",
          lineHeight: 2.1,
        }}
      >
        {card.arabic}
      </p>

      <p
        style={{
          fontSize: "0.88rem",
          color: "var(--color-text-muted)",
          lineHeight: 1.8,
          borderLeft: `2px solid ${colors.border}`,
          paddingLeft: "1rem",
        }}
      >
        {card.translation}
      </p>
    </div>
  )
}

export default function ApprentissagePage() {
  const [active, setActive] = useState(1)
  const lesson = LESSONS[active - 1]

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <NavBar />

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-14 pb-10">
        <p
          dir="rtl"
          style={{
            fontFamily: "'Amiri', serif",
            fontSize: "clamp(2.5rem, 8vw, 5rem)",
            color: "rgba(200,157,58,0.12)",
            lineHeight: 1,
            marginBottom: "1.25rem",
            userSelect: "none",
          }}
        >
          تعلّم
        </p>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(2rem, 5vw, 3.2rem)",
            fontWeight: 300,
            color: "var(--color-text)",
            lineHeight: 1.15,
            marginBottom: "0.75rem",
          }}
        >
          Apprendre l&apos;Islam
        </h1>
        <p style={{ fontSize: "0.95rem", color: "var(--color-text-muted)", maxWidth: "520px", lineHeight: 1.7 }}>
          Huit leçons progressives pour comprendre les fondements de l&apos;Islam —
          à travers ses textes sources, sans interprétation ajoutée.
        </p>
      </section>

      {/* Tab strip */}
      <div
        className="sticky top-[61px] z-40 px-6 py-3"
        style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}
      >
        <div className="max-w-5xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
          {LESSONS.map((l) => {
            const isActive = l.num === active
            return (
              <button
                key={l.num}
                onClick={() => setActive(l.num)}
                className="flex items-center gap-2 shrink-0 rounded-lg px-3.5 py-2 transition-all"
                style={{
                  background: isActive ? "rgba(200,157,58,0.12)" : "transparent",
                  border: `1px solid ${isActive ? "rgba(200,157,58,0.35)" : "transparent"}`,
                  color: isActive ? "var(--color-gold)" : "var(--color-text-muted)",
                }}
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                  style={{
                    background: isActive ? "var(--color-gold)" : "rgba(250,247,239,0.08)",
                    color: isActive ? "#050d07" : "var(--color-text-muted)",
                  }}
                >
                  {l.num}
                </span>
                <span className="text-xs whitespace-nowrap hidden sm:inline">{l.title}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Lesson content */}
      <main className="max-w-5xl mx-auto px-6 pt-10 pb-20">
        <div className="flex flex-col gap-10">

          {/* Lesson header */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: "rgba(200,157,58,0.15)", color: "var(--color-gold)" }}
              >
                {lesson.num}
              </span>
              <span
                style={{
                  fontSize: "0.7rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--color-text-muted)",
                }}
              >
                Leçon {lesson.num} sur {LESSONS.length}
              </span>
            </div>

            <p
              dir="rtl"
              style={{
                fontFamily: "'Amiri', serif",
                fontSize: "clamp(2rem, 5vw, 3rem)",
                color: "rgba(200,157,58,0.3)",
                lineHeight: 1.1,
                userSelect: "none",
              }}
            >
              {lesson.arabic}
            </p>

            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(1.6rem, 4vw, 2.5rem)",
                fontWeight: 300,
                color: "var(--color-text)",
                lineHeight: 1.2,
              }}
            >
              {lesson.title}
            </h2>
            <p
              style={{
                fontSize: "0.85rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-text-muted)",
              }}
            >
              {lesson.subtitle}
            </p>
          </div>

          {/* Introduction */}
          <div
            className="rounded-2xl p-7 border"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            <p style={{ fontSize: "0.95rem", color: "var(--color-text)", lineHeight: 1.9 }}>
              {lesson.intro}
            </p>
          </div>

          {/* Texts */}
          <div className="flex flex-col gap-4">
            <h3
              style={{
                fontSize: "0.7rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--color-text-muted)",
              }}
            >
              Textes sources
            </h3>
            {lesson.texts.map((card) => (
              <TextCardView key={card.reference} card={card} />
            ))}
          </div>

          {/* Takeaway */}
          <div
            className="rounded-xl px-6 py-5 border-l-2"
            style={{
              background: "rgba(200,157,58,0.04)",
              borderColor: "rgba(200,157,58,0.4)",
            }}
          >
            <p
              style={{
                fontSize: "0.85rem",
                fontStyle: "italic",
                color: "rgba(200,157,58,0.9)",
                lineHeight: 1.75,
              }}
            >
              {lesson.takeaway}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4">
            {lesson.num > 1 ? (
              <button
                onClick={() => setActive(lesson.num - 1)}
                className="flex items-center gap-2 text-sm transition-opacity hover:opacity-80"
                style={{ color: "var(--color-text-muted)" }}
              >
                ← Leçon {lesson.num - 1} · {LESSONS[lesson.num - 2].title}
              </button>
            ) : <span />}
            {lesson.num < LESSONS.length ? (
              <button
                onClick={() => setActive(lesson.num + 1)}
                className="flex items-center gap-2 text-sm px-5 py-2.5 rounded-lg border transition-colors hover:border-[rgba(200,157,58,0.4)]"
                style={{
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                  background: "var(--color-surface)",
                }}
              >
                Leçon {lesson.num + 1} · {LESSONS[lesson.num].title} →
              </button>
            ) : (
              <div
                className="text-sm px-5 py-2.5 rounded-lg border"
                style={{ borderColor: "rgba(200,157,58,0.3)", color: "var(--color-gold)", background: "rgba(200,157,58,0.06)" }}
              >
                Parcours terminé — Explore le corpus →
              </div>
            )}
          </div>

          {/* Search prompt at end */}
          {lesson.num === LESSONS.length && (
            <div
              className="rounded-2xl p-8 border text-center flex flex-col gap-4 items-center"
              style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
            >
              <p
                dir="rtl"
                style={{ fontFamily: "'Amiri', serif", fontSize: "2rem", color: "rgba(200,157,58,0.35)", lineHeight: 1 }}
              >
                اقْرَأْ
              </p>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.3rem",
                  fontWeight: 300,
                  color: "var(--color-text)",
                }}
              >
                Tu as terminé les bases. La suite, c&apos;est le corpus entier.
              </p>
              <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", maxWidth: "400px", lineHeight: 1.7 }}>
                Recherche sémantique sur 6 236 ayats, 7 000+ hadiths et les tafsirs.
              </p>
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                <Link
                  href="/search"
                  className="text-sm px-6 py-3 rounded-lg transition-colors hover:bg-[#C89D3A]/20"
                  style={{ background: "rgba(200,157,58,0.1)", color: "var(--color-gold)", border: "1px solid rgba(200,157,58,0.3)" }}
                >
                  Lancer une recherche →
                </Link>
                <Link
                  href="/corpus"
                  className="text-sm px-6 py-3 rounded-lg transition-colors hover:opacity-80"
                  style={{ color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}
                >
                  Parcourir le corpus →
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
