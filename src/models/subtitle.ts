class Translation {
  text: string;
  lang: string;

  constructor(text: string, lang: string) {
    this.text = text;
    this.lang = lang;
  }
}

export default class Subtitle {
  id: number;
  versePos: number;
  versePosRelative: number; // verse pos par rapport aux versets sélectionnés

  fromWordIndex: number;
  toWordIndex: number;

  startTime: number;
  endTime: number;

  arabicText: string;
  translations: Translation[];

  constructor(
    id: number,
    versePos: number,
    versePosRelative: number,
    fromWordIndex: number,
    toWordIndex: number,
    startTime: number,
    endTime: number,
    text: string,
    translatedText: Translation[] = []
  ) {
    this.id = id;
    this.versePos = versePos;
    this.versePosRelative = versePosRelative;
    this.fromWordIndex = fromWordIndex;
    this.toWordIndex = toWordIndex;
    this.startTime = startTime;
    this.endTime = endTime;
    this.arabicText = text;
    this.translations = translatedText;
  }
}
