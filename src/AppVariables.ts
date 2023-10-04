import { Surah, Verse } from "./api/quran";

export default class AppVariables {
  static Langs: { [key: string]: string } = {
    ar: "Arabic",
    en: "English",
    fr: "French",
    es: "Spanish",
    bn: "Bengali",
    ru: "Russian",
    zh: "Chinese",
    id: "Indonesian",
    sv: "Swedish",
    tr: "Turkish",
    ur: "Urdu",
  };

  static LangsFlag: { [key: string]: string } = {
    ar: "🇦🇪",
    en: "🇺🇸",
    fr: "🇫🇷",
    es: "🇪🇸",
    bn: "🇧🇩",
    ru: "🇷🇺",
    zh: "🇨🇳",
    id: "🇮🇩",
    sv: "🇸🇪",
    tr: "🇹🇷",
    ur: "🇵🇰",
  };

  static TranslatedVerses: { [key: string]: Verse[] } = {};
}
