import AppVariables from "../AppVariables";
import QuranApi, { Surah, Verse, VersePosition } from "../api/quran";
import Subtitle, { Translation } from "../models/subtitle";

export default class TranslationExt {
  static async addTranslationToSubtitles(
    selectedLang: string,
    subtitles: Subtitle[]
  ): Promise<Subtitle[]> {
    try {
      const quran = await QuranApi.getQuran(selectedLang);

      quran.forEach((surah: Surah) => {
        surah.verses.forEach((verse: Verse) => {
          AppVariables.Quran[surah.id - 1].verses[
            verse.id - 1
          ].translations.push(new Translation(verse.translation, selectedLang));
        });
      });

      // Ajoute dans chaque sous-titre ajouté au texte arabe sa nouvelle traduction avec la langue choisie
      const editedSubtitles = subtitles.map(async (subtitle) => {
        // Push la nouvelle traduction
        // Vérifie juste que ce n'est pas une basmala ou autre
        if (
          subtitle.versePos && // Si ce n'est pas une basmala ou autre
          subtitle.hasTranslation(selectedLang) === false
        ) {
          subtitle.AddTranslation(selectedLang);

          return subtitle;
        }

        return subtitle;
      });

      return Promise.all(editedSubtitles);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

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

        try {
          // Télécharge la traduction mot à mot du verset si pas déjà fait
          if (
            subtitle.versePos.surah + ":" + subtitle.versePos.verse in
              AppVariables.WbwTranslations ===
            false
          ) {
            AppVariables.WbwTranslations[
              subtitle.versePos.surah + ":" + subtitle.versePos.verse
            ] = JSON.parse(await (await fetch(url)).text()); // Ajoute la traduction mot à mot manquante
          }

          subtitle.AddTranslation(selectedLang);

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
