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
  fromWordIndex: number;
  toWordIndex: number;

  startTime: number;
  endTime: number;

  arabicText: string;
  translatedText: Translation[];

  constructor(
    id: number,
    versePos: number,
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
    this.translatedText = translatedText;
  }
}
