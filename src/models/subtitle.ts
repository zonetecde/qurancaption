import AppVariables from "../AppVariables";
import QuranApi, { Surah, Verse, VersePosition } from "../api/quran";
import StringExt from "../extensions/stringExt";
import TimeExt from "../extensions/timeExt";
import TranslationExt from "../extensions/translationExt";

export class Translation {
  text: string;
  lang: string;

  constructor(text: string, lang: string) {
    this.text = text;
    this.lang = lang;
  }
}

export default class Subtitle {
  getTranslation(lang: string): Translation | undefined {
    return this.translations.find((x) => x.lang === lang);
  }

  /**
   * Ajoute une traduction au sous-titre ; si elle n'est pas disponnible alors la télécharge
   * @param selectedLang La langue voulu
   */
  async AddTranslation(selectedLang: string) {
    // Vérifie que la traduction existe, sinon la télécharge
    if (this.versePos) {
      await TranslationExt.downloadTranslation(selectedLang, this.versePos);
    }

    if (this.hasTranslation(selectedLang) === false) {
      this.translations.push({
        lang: selectedLang,
        text:
          selectedLang !== "en_auto"
            ? this.getOriginalTranslation(selectedLang)
            : this.getWbwTranslation(),
      });
    }
  }

  hasTranslation(selectedLang: string) {
    return this.translations.some((x) => x.lang === selectedLang);
  }
  getOriginalTranslation(lang: string): string {
    if (this.versePos) {
      if (lang !== "en_auto") {
        // traduction quelconque
        const verse =
          AppVariables.Quran[this.versePos.surah - 1].verses[
            this.versePos.verse - 1
          ];
        if (verse.translations.some((x) => x.lang === lang) === true)
          return verse.translations.find((x) => x.lang === lang)!.text;
        else return "Translation unavailable";
      } else {
        // Traduction mot à mot
        return this.getWbwTranslation();
      }
    } else return "Translation unavailable";
  }
  getStartTimeHHMMSSms() {
    return TimeExt.secondsToHHMMSSms(this.startTime);
  }
  getEndTimeHHMMSSms() {
    return TimeExt.secondsToHHMMSSms(this.endTime);
  }

  getTranslationText(lang: string, verseNumber: boolean = false): string {
    if (this.translations.some((x) => x.lang === lang)) {
      const base =
        verseNumber && this.IsBeginingWordsFromVerse()
          ? this.getVersePose("V. ")
          : "";

      return base + this.translations.find((x) => x.lang === lang)!.text;
    } else if (this.versePos === undefined)
      return ""; // c'est une basmala ou autre
    else return "Translation unavailable";
  }
  IsBeginingWordsFromVerse() {
    return this.fromWordIndex === 0;
  }
  getVersePose(format: string): string {
    switch (format) {
      case "V. ":
        return this.versePos!.verse + ". ";
        break;
    }

    return this.versePos!.verse.toString();
  }

  getWbwTranslation() {
    let translation: string = "";

    if (
      this.versePos &&
      this.versePos.surah + ":" + this.versePos.verse in
        AppVariables.WbwTranslations
    ) {
      for (let index = this.fromWordIndex; index <= this.toWordIndex; index++) {
        // Le mot arabe correspondant
        // const arabicWord =
        //   subtitle.arabicText.split(" ")[index - subtitle.fromWordIndex];
        const word =
          AppVariables.WbwTranslations[
            this.versePos.surah + ":" + this.versePos.verse
          ].verse.words[index].translation.text;

        translation += word + " ";
      }
    }

    return translation;
  }

  id: number;

  versePos: VersePosition | undefined;

  fromWordIndex: number;
  toWordIndex: number;

  startTime: number;
  endTime: number;

  arabicText: string;
  translations: Translation[];

  constructor(
    id: number,
    versePos: VersePosition | undefined,
    fromWordIndex: number,
    toWordIndex: number,
    startTime: number,
    endTime: number,
    text: string,
    translatedText: Translation[] = []
  ) {
    this.id = id;
    this.versePos = versePos;
    this.fromWordIndex = fromWordIndex;
    this.toWordIndex = toWordIndex;
    this.startTime = startTime;
    this.endTime = endTime;
    this.arabicText = text;
    this.translations = translatedText;
  }

  /**
   * Retrieves the Arabic subtitle text.
   *
   * @param {boolean} betweenParentheses - Indicates whether the subtitle text should be enclosed in parentheses.
   * @return {string} The Arabic subtitle text.
   */
  getArabicText(
    betweenParentheses: boolean = false,
    verseNumber: boolean = false
  ) {
    const base =
      verseNumber && this.IsLastWordsFromVerse()
        ? "﴾" + StringExt.toArabicNumber(this.versePos!.verse) + "﴿ ‎"
        : "";

    return (
      base +
      (betweenParentheses ? "﴾ " + this.arabicText + " ﴿" : this.arabicText)
    );
  }

  IsLastWordsFromVerse() {
    return (
      this.toWordIndex ===
      AppVariables.Quran[this.versePos!.surah - 1].verses[
        this.versePos!.verse - 1
      ].text.split(" ").length -
        1
    );
  }
}
