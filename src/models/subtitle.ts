export default class Subtitle {
  id: number;
  versePos: number;
  fromWordIndex: number;
  toWordIndex: number;

  startTime: number;
  endTime: number;

  text: string;

  constructor(
    id: number,
    versePos: number,
    fromWordIndex: number,
    toWordIndex: number,
    startTime: number,
    endTime: number,
    text: string
  ) {
    this.id = id;
    this.versePos = versePos;
    this.fromWordIndex = fromWordIndex;
    this.toWordIndex = toWordIndex;
    this.startTime = startTime;
    this.endTime = endTime;
    this.text = text;
  }
}
