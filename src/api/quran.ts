import AppVariables from "../AppVariables";

export default class QuranApi {
  static getAllSurahs() {
    const url =
      "https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/quran_" +
      AppVariables.Lang +
      ".json";

    return fetch(url).then((res) => res.json());
  }
}

export interface Surah {
  id: number;
  name: string;
  transliteration: string;
  translation: string;
  type: Type;
  total_verses: number;
  verses: Verse[];
}

export enum Type {
  Meccan = "meccan",
  Medinan = "medinan",
}

export interface Verse {
  id: number;
  text: string;
  translation: string;
}
