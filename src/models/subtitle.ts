import AppVariables from "../AppVariables";
import { VersePosition } from "../api/quran";
import TimeExt from "../extensions/timeExt";

export class Translation {
  text: string;
  lang: string;

  constructor(text: string, lang: string) {
    this.text = text;
    this.lang = lang;
  }
}

export default class Subtitle {
  getStartTimeHHMMSSms() {
    return TimeExt.secondsToHHMMSSms(this.startTime);
  }
  getEndTimeHHMMSSms() {
    return TimeExt.secondsToHHMMSSms(this.endTime);
  }

  getTranslationText(lang: string) {
    return this.translations.find((x) => x.lang === lang)?.text;
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
  getArabicText(betweenParentheses: boolean = false) {
    return betweenParentheses ? "﴾ " + this.arabicText + " ﴿" : this.arabicText;
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
