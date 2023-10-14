import AppVariables from "../AppVariables";
import Subtitle from "../models/subtitle";
import StringExt from "./stringExt";
import TimeExt from "./timeExt";

export class SubtitleGenerator {
  static NEW_SUBTITLE_LINE = "\\N";

  static setFontExpression(fontName: string) {
    return "{\\fn" + fontName + "}";
  }

  static setFontSizeExpression(fontSize: number) {
    return "{\\fs" + fontSize + "}";
  }

  static generateAssSubtitles(
    subtitles: Subtitle[],
    secondLang: string = "",
    font: string = "me_quran",
    arabicFontSize: number = 32,
    translationFontSize: number = 10,
    shadow: boolean = true,
    arabicVersesBetweenParentheses: boolean = false,
    verseNumberInArabic: boolean = false,
    verseNumberInTranslation: boolean = false,
    letterOutline: boolean = false,
    verticalVideo: boolean = false
  ) {
    let subtitleFileText =
      `
[Script Info]
ScriptType: v4.00+
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,` +
      font +
      `,` +
      arabicFontSize +
      `,&Hffffff,&Hffffff,&H00000000,&H0,` +
      (font === "me_quran" ? "0" : "1") +
      `,0,0,0,100,100,0,0,1,` +
      (letterOutline ? "1" : "0") +
      `,` +
      (shadow ? "1" : "0") +
      `,2,5,5,10,0

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;

    subtitles.forEach((subtitle, index) => {
      // if not silence
      if (subtitle.arabicText !== "") {
        subtitleFileText +=
          "Dialogue: 0," +
          subtitle.getStartTimeHHMMSSms() +
          "," +
          subtitle.getEndTimeHHMMSSms() +
          ",Default,," +
          (verticalVideo ? "2,2" : "40,40") +
          ",0,,{\\fade(200,200)" +
          (letterOutline ? "\\blur5}" : "}") + // Si on ne veut pas avoir l'outline alors dans ce cas on pas d'effet de blur
          (verseNumberInArabic && subtitle.IsLastWordsFromVerse()
            ? this.setFontSizeExpression(25) + // taille du nbre arabe
              this.setFontExpression("me_quran") + // police du nbre arabe
              // nbre arabe --
              "﴾" +
              StringExt.toArabicNumber(subtitle.versePos!.verse) +
              "﴿"
            : // --
              "") +
          (font !== "me_quran" ? "\\h" : "") + // espace entre le nbre arabe et le texte (uniquement pour Amiri car me_quran ne supporte pas les espaces)
          this.setFontSizeExpression(arabicFontSize) +
          this.setFontExpression(font) +
          subtitle.getArabicText(arabicVersesBetweenParentheses) +
          (secondLang === "none" || subtitle.versePos === undefined // si on veut la traduction avec et que ce n'est pas une basmala ou autre
            ? ""
            : this.NEW_SUBTITLE_LINE + // la trad est sur une autre ligne
              this.setFontSizeExpression(translationFontSize) + // taille de la trad
              this.setFontExpression("Arial") + // police d'écriture de la trad
              (verseNumberInTranslation && subtitle.IsBeginingWordsFromVerse()
                ? subtitle.getVersePose("V. ")
                : "") +
              subtitle.getTranslationText(secondLang)) +
          "\n";
      }
    });

    return subtitleFileText;
  }

  static generateSrtSubtitles(
    subtitles: Subtitle[],
    lang: string,
    arabicVersesBetweenParentheses: boolean,
    verseNumberInArabic: boolean,
    verseNumberInTranslation: boolean
  ) {
    let subtitleFileText = "";
    let silenceCounter = 0;

    subtitles.forEach((subtitle, index) => {
      if (subtitle.arabicText) {
        subtitleFileText += `${index + 1 - silenceCounter}\n`;
        subtitleFileText += `${TimeExt.secondsToHHMMSSms(
          subtitle.startTime
        )} --> ${TimeExt.secondsToHHMMSSms(subtitle.endTime)}\n`;

        if (
          lang === undefined ||
          lang === "none" ||
          subtitle.versePos === undefined
        ) {
          subtitleFileText += subtitle.getArabicText(
            arabicVersesBetweenParentheses,
            verseNumberInArabic
          );
        } else if (lang.includes("ar+")) {
          // sinon si on veut l'arabe et sa traduction
          // Alors on ajoute le verset en arabe
          subtitleFileText +=
            subtitle.getArabicText(
              arabicVersesBetweenParentheses,
              verseNumberInArabic
            ) + "\n";
          subtitleFileText += subtitle.getTranslationText(
            lang.replace("ar+", ""),
            verseNumberInTranslation
          );
        } else {
          subtitleFileText +=
            (verseNumberInTranslation && subtitle.IsBeginingWordsFromVerse()
              ? subtitle.getVersePose("V. ")
              : "") + subtitle.getTranslationText(lang);
        }

        subtitleFileText += "\n\n";
      } else {
        silenceCounter++;
      }
    });

    return subtitleFileText;
  }
}
