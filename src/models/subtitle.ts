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
     * Returns the Arabic subtitle text.
     *
     * @param {boolean} betweenParentheses - Indicates whether the subtitle text should be enclosed in parentheses.
     * @param verseNumber - Indicates whether the verse number should be included.
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
            (betweenParentheses && this.versePos && this.arabicText !== ""
                ? "﴾" + this.arabicText + "﴿"
                : this.arabicText)
        );
    }

    /**
     * Checks if the last words are from the verse.
     * @return True if the last words are from the verse, else false.
     */
    IsLastWordsFromVerse() {
        if (this.versePos === undefined) return false;

        return (
            this.toWordIndex ===
            AppVariables.Quran[this.versePos!.surah - 1].verses[
                this.versePos!.verse - 1
            ].text.split(" ").length -
                1
        );
    }

    /**
     * Sets the translation for a given language.
     * @param lang - The language for the translation.
     * @param newTranslation - The new translation text.
     */
    setTranslation(lang: string, newTranslation: string) {
        const translation = this.translations.find((w) => w.lang === lang);
        if (translation) {
            if (translation.text !== newTranslation)
                translation.text = newTranslation;
        }
    }

    /**
     * Returns the whole verse in arabic.
     * @return The whole verse if available, else an empty string.
     */
    getWholeArabicVerse() {
        if (this.versePos) {
            const verse =
                AppVariables.Quran[this.versePos.surah - 1].verses[
                    this.versePos.verse - 1
                ];
            return verse.text;
        } else return "";
    }

    /**
     * Returns the translation for a given language.
     * @param lang - The language for the translation.
     * @return The translation for the given language if available, else undefined.
     */
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
            await TranslationExt.downloadTranslation(
                selectedLang,
                this.versePos
            );
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

    /**
     * Checks if a translation exists for a given language.
     * @param selectedLang - The language for the translation.
     * @return True if the translation exists, else false.
     */
    hasTranslation(selectedLang: string) {
        return this.translations.some((x) => x.lang === selectedLang);
    }

    /**
     * Returns the original translation for a given language.
     * @param lang - The language for the translation.
     * @return The original translation for the given language if available, else "Translation unavailable".
     */
    getOriginalTranslation(lang: string): string {
        if (this.versePos) {
            if (lang !== "en_auto") {
                // traduction quelconque
                const verse =
                    AppVariables.Quran[this.versePos.surah - 1].verses[
                        this.versePos.verse - 1
                    ];
                if (verse.translations.some((x) => x.lang === lang) === true)
                    return verse.translations.find((x) => x.lang === lang)!
                        .text;
                else return "Translation unavailable";
            } else {
                // Traduction mot à mot
                return this.getWbwTranslation();
            }
        } else return "Translation unavailable";
    }

    /**
     * Returns the start time in HH:MM:SS.ms format.
     * @return The start time in HH:MM:SS.ms format.
     */
    getStartTimeHHMMSSms() {
        return TimeExt.secondsToHHMMSSms(this.startTime);
    }

    /**
     * Returns the end time in HH:MM:SS.ms format.
     * @return The end time in HH:MM:SS.ms format.
     */
    getEndTimeHHMMSSms() {
        return TimeExt.secondsToHHMMSSms(this.endTime);
    }

    /**
     * Returns the translation text for a given language.
     * @param lang - The language for the translation.
     * @param verseNumber - Indicates whether the verse number should be included.
     * @return The translation text for the given language if available, else "Translation unavailable".
     */
    getTranslationText(lang: string, verseNumber: boolean = false): string {
        if (this.versePos === undefined) return "";

        if (this.translations.some((x) => x.lang === lang)) {
            const base =
                verseNumber && this.IsBeginingWordsFromVerse()
                    ? this.getVersePose("V. ")
                    : "";

            return base + this.translations.find((x) => x.lang === lang)!.text;
        } // c'est une basmala ou autre
        else return "Translation unavailable";
    }

    /**
     * Checks if the beginning words are from the verse.
     * @return True if the beginning words are from the verse, else false.
     */
    IsBeginingWordsFromVerse() {
        if (this.versePos === undefined) return false;

        return this.fromWordIndex === 0;
    }

    /**
     * Returns the verse position.
     * @param format - The format for the verse position.
     * @return The verse position in the given format.
     */
    getVersePose(format: string): string {
        switch (format) {
            case "V. ":
                return this.versePos!.verse + ". ";
                break;
        }

        return this.versePos!.verse.toString();
    }

    /**
     * Returns the word by word translation.
     * @return The word by word translation.
     */
    getWbwTranslation() {
        let translation: string = "";
        let last_word_translation: string = "";

        if (
            this.versePos &&
            this.versePos.surah + ":" + this.versePos.verse in
                AppVariables.WbwTranslations
        ) {
            for (
                let index = this.fromWordIndex;
                index <= this.toWordIndex;
                index++
            ) {
                // Le mot arabe correspondant
                // const arabicWord =
                //   subtitle.arabicText.split(" ")[index - subtitle.fromWordIndex];
                const word =
                    AppVariables.WbwTranslations[
                        this.versePos.surah + ":" + this.versePos.verse
                    ].verse.words[index].translation.text;

                // car des mots se repetent avec toute leur trad, comme yaa ayyouha lladhina
                if (last_word_translation !== word) {
                    translation += word + " ";
                    last_word_translation = word;
                }
            }
        }

        return translation;
    }
}
