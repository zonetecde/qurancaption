import AppVariables from "../AppVariables";
import { Translation } from "../models/subtitle";

export default class QuranApi {
  static getQuran(lang: string) {
    const url =
      "https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/quran_" +
      lang +
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
  translation: string; // de la deserialization
  translations: Translation[];
}

export class VersePosition {
  verse: number;
  surah: number;

  constructor(surah: number, verse: number) {
    this.surah = surah;
    this.verse = verse;
  }
}
