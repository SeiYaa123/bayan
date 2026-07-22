const fs = require("fs");
const path = require("path");

const surahList = Array.from({ length: 114 }, (_, i) => i + 1);

// Run downloads in parallel batches to prevent rate limits
async function fetchInBatches(list, batchSize, fn) {
  const results = [];
  for (let i = 0; i < list.length; i += batchSize) {
    const batch = list.slice(i, i + batchSize);
    console.log(`Processing batch ${i / batchSize + 1}/${Math.ceil(list.length / batchSize)}...`);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
  }
  return results;
}

async function downloadTafsir() {
  console.log("Loading Quran Ayahs for matching Arabic text...");
  const quranPath = path.join(__dirname, "../apps/web/src/data/quran_all_ayahs.json");
  const quranData = JSON.parse(fs.readFileSync(quranPath, "utf-8"));
  
  const quranMap = new Map();
  for (const ayah of quranData) {
    quranMap.set(ayah.reference, {
      arabic: ayah.arabic,
      translation_fr: ayah.translation_fr,
      surah_name: ayah.metadata.surah_name
    });
  }

  const tafsirEntries = [];

  const downloadSurah = async (surahNum) => {
    const surahStr = String(surahNum).padStart(3, "0");
    const url = `https://raw.githubusercontent.com/mrikhan1/iqra-tafsir-data/main/surah_${surahStr}.json`;
    
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`Failed to fetch Surah ${surahNum}: ${res.statusText}`);
        return;
      }
      
      const data = await res.json();
      const verses = Object.keys(data);
      
      for (const verseKey of verses) {
        const vNum = parseInt(verseKey, 10);
        if (!data[verseKey]) continue;

        const rawText = data[verseKey].en || "";
        // Clean up the text by removing excessive whitespace and double newlines
        const cleanedEn = rawText
          .replace(/\r\n/g, "\n")
          .replace(/\n\s*\n+/g, "\n\n")
          .trim();

        if (!cleanedEn) continue;

        const reference = `${surahNum}:${vNum}`;
        const match = quranMap.get(reference) || { arabic: "", translation_fr: "", surah_name: "" };

        // We map the French translation of the verse itself as the French search text
        const summaryFr = match.translation_fr || "";

        tafsirEntries.push({
          id: `tafsir-ibn-kathir-${surahNum}-${vNum}`,
          reference: `ibn-kathir:${reference}`,
          arabic: match.arabic,
          translation_fr: summaryFr || null,
          translation_en: cleanedEn, // Keep the full untruncated text
          source_type: "tafsir",
          collection: "ibn_kathir",
          metadata: {
            surah: String(surahNum),
            ayah: String(vNum),
            surah_name: match.surah_name,
            tafsir: "ibn_kathir"
          }
        });
      }
    } catch (err) {
      console.error(`Error downloading Surah ${surahNum}:`, err);
    }
  };

  // Run in parallel batches of 15 surahs
  await fetchInBatches(surahList, 15, downloadSurah);

  const outputPath = path.join(__dirname, "../apps/web/src/data/tafsir_ibn_kathir.json");
  console.log(`Writing ${tafsirEntries.length} Tafsir entries to ${outputPath}...`);
  fs.writeFileSync(outputPath, JSON.stringify(tafsirEntries, null, 2), "utf-8");
  console.log("Tafsir dataset downloaded and formatted successfully!");
}

downloadTafsir();
