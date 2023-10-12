import AppVariables from "../AppVariables";
import QuranApi, { Surah, Verse, VersePosition } from "../api/quran";
import Subtitle, { Translation } from "../models/subtitle";

export default class TranslationExt {
  /**
   * Ajoute des traductions aux sous-titres
   * @param selectedLang La langue de traduction voulu
   * @param subtitles Les sous-titres auxquels on ajoute la traduction
   * @returns Les sous-titres avec la traduction
   */
  static async addTranslationToSubtitles(
    selectedLang: string,
    subtitles: Subtitle[]
  ): Promise<Subtitle[]> {
    try {
      // Ajoute dans chaque sous-titre ajouté traduction avec la langue choisi
      const editedSubtitles = subtitles.map(async (subtitle) => {
        // Push la nouvelle traduction
        // Vérifie juste que ce n'est pas une basmala ou autre
        if (
          subtitle.versePos && // Si ce n'est pas une basmala ou autre
          subtitle.hasTranslation(selectedLang) === false
        ) {
          await subtitle.AddTranslation(selectedLang);

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

  /**
   * Télécharge une traduction et l'ajoute dans les variables globales du site
   * @param selectedLang La langue de la traduction à télécharger
   * @param versePos // Le verset à télécharger (surtout pour wbw, sinon ça télécharge tout)
   */
  static async downloadTranslation(
    selectedLang: string,
    versePos: VersePosition | undefined
  ) {
    if (versePos)
      if (selectedLang === "en_auto") {
        // Pour la traduction mot à mot
        if (
          versePos.surah + ":" + versePos.verse in
            AppVariables.WbwTranslations ===
          false
        ) {
          const url =
            "https://api.quran.com/api/v4/verses/by_key/" +
            versePos.surah +
            ":" +
            versePos.verse +
            "?language=en&words=true";

          AppVariables.WbwTranslations[versePos.surah + ":" + versePos.verse] =
            JSON.parse(await (await fetch(url)).text()); // Ajoute la traduction mot à mot manquante
        }
      } else {
        // Pour les autres traductions, s'il n'a
        // pas encore était download alors la download
        if (
          AppVariables.Quran[0].verses[0].translations.some(
            (x) => x.lang === selectedLang
          ) === false
        ) {
          const quran = await QuranApi.getQuran(selectedLang);

          quran.forEach((surah: Surah) => {
            surah.verses.forEach((verse: Verse) => {
              AppVariables.Quran[surah.id - 1].verses[
                verse.id - 1
              ].translations.push(
                new Translation(verse.translation, selectedLang)
              );
            });
          });
        }
      }
  }
}
