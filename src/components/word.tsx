import React, { ReactNode, useEffect, useState } from "react";
import { VersePosition } from "../api/quran";
import TranslationExt from "../extensions/translationExt";
import AppVariables from "../AppVariables";

interface Props {
  word: string;
  fromVersePos: VersePosition;
  wordPos: number;
  isSelected: boolean;
  showTransliteration: boolean;
  wordClickedAction: () => void;
}

const Word = (props: Props) => {
  async function getWordPhonetic(): Promise<string> {
    await TranslationExt.downloadTranslation("en_auto", props.fromVersePos);
    return AppVariables.WbwTranslations[
      props.fromVersePos.surah + ":" + props.fromVersePos.verse
    ].verse.words[props.wordPos].transliteration.text;
  }

  const [phonetic, setPhonetic] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const result = await getWordPhonetic();
      setPhonetic(result);
    }
    fetchData();
  }, [props.fromVersePos]);

  return (
    <div
      className={
        "arabic text-3xl md:text-4xl lg:text-5xl text-white  select-none cursor-pointer px-1.5 lg:px-3 md:py-3 lg:py-5 py-1 z-50 flex flex-col " +
        (props.isSelected ? " bg-yellow-600 bg-opacity-25" : "")
      }
      onClick={props.wordClickedAction}
    >
      <span>{props.word}</span>
      {props.showTransliteration && (
        <span className="text-sm text-center arial mt-4 -mb-4">{phonetic}</span>
      )}
    </div>
  );
};

export default Word;
