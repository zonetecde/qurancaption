import Subtitle from "../models/subtitle";

export default class TranslationExt {
  static async automaticEnglishTranslation(
    subtitles: Subtitle[]
  ): Promise<Subtitle[]> {
    const selectedLang = "en_auto";

    // Use Promise.all to handle all async operations concurrently
    const editedSubtitlesPromises = subtitles.map(async (subtitle) => {
      if (subtitle.versePos) {
        const url =
          "https://api.quran.com/api/v4/verses/by_key/" +
          subtitle.versePos?.surah +
          ":" +
          subtitle.versePos?.verse +
          "?language=en&words=true";

        let translation: string = "";

        try {
          const response = await fetch(url);
          const jsonText = await response.text();
          const json = JSON.parse(jsonText);

          for (
            let index = subtitle.fromWordIndex;
            index <= subtitle.toWordIndex;
            index++
          ) {
            // Le mot arabe correspondant
            // const arabicWord =
            //   subtitle.arabicText.split(" ")[index - subtitle.fromWordIndex];
            const word = json.verse.words[index].translation.text;

            translation += word + " ";
          }

          // Ajoute uniquement aux subtitles qui n'ont pas encore leur trad
          if (
            !subtitle.translations.some((x) => x.lang === selectedLang) ||
            subtitle.translations.find((x) => x.lang === selectedLang) ===
              undefined
          ) {
            subtitle.translations.push({
              lang: selectedLang,
              text:
                translation === ""
                  ? "Something went wrong"
                  : translation.trim(),
            });
          }

          return subtitle;
        } catch (error) {
          console.error("Error fetching or processing subtitles:", error);
          return subtitle;
        }
      } else {
        return subtitle;
      }
    });

    // Wait for all promises to resolve
    const editedSubtitles = await Promise.all(editedSubtitlesPromises);

    return editedSubtitles;
  }
}
