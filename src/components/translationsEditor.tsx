import React from "react";
import Subtitle from "../models/subtitle";
import { Verse } from "../api/quran";

interface Props {
  translatedVerses: Verse[];
  subtitles: Subtitle[];
  setSubtitles: React.Dispatch<React.SetStateAction<Subtitle[]>>;
}

const textAreaTranslationRef = React.createRef<HTMLSpanElement>();

const TranslationsEditor = (props: Props) => {
  return (
    <div className="h-full w-full flex justify-center items-center flex-col pl-20">
      <div className="h-full overflow-y-auto mt-20 mb-10 pr-20">
        {props.subtitles.map((subtitle: Subtitle) => (
          <>
            {subtitle.versePos !== -1 && (
              <div className="mt-10 border-2 p-4">
                <p className="arabic text-2xl lg:text-5xl/[80px] text-white [word-spacing:10px] lg:[word-spacing:15px] leading-10">
                  {subtitle.arabicText}
                </p>
                <span
                  className="textarea w-full bg-opacity-30 bg-white mt-5 text-lg lg:text-xl px-1 py-1"
                  role="textbox"
                  contentEditable
                  ref={textAreaTranslationRef}
                >
                  {
                    props.translatedVerses.find(
                      (x) => x.id === subtitle.versePos
                    )?.translation
                  }
                </span>
              </div>
            )}
          </>
        ))}
      </div>
    </div>
  );
};

export default TranslationsEditor;
