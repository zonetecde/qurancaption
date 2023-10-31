import { Surah, VersePosition } from "./api/quran";

export default class AppVariables {
    static ApiUrl = "https://www.rayanestaszewski.fr";
    //static ApiUrl = "https://localhost:7133";

    static WbwTranslations: { [key: string]: any } = {};

    static Langs: { [key: string]: string } = {
        ar: "Arabic",
        en_auto: "English (automatic)",
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

    static Quran: Surah[] = [];
}
