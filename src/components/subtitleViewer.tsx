import React, { useEffect } from "react";
import QuranApi, { Surah, Verse } from "../api/quran";
import Subtitle from "../models/subtitle";
import { SubtitleGenerator } from "../extensions/subtitleGenerator";
import AppVariables from "../AppVariables";

interface Props {
  subtitles: Subtitle[];
  setShowSubtitle: React.Dispatch<React.SetStateAction<boolean>>;

  // subtitles param
  arabicVersesBetween: boolean;
  arabicVersesPosition: boolean;
  translationVersesPosition: boolean;
}

/**
 * Affiche le contenu des fichiers sous-titre généré et propose de les sauvegarders
 * @param props
 * @returns
 */
const subtitleViewer = (props: Props) => {
  const [srtSubtitle, setSrtSubtitle] = React.useState<string>("");
  const [updateSubtitle, setUpdateSubtitle] = React.useState<boolean>(false);

  const saveFile = async () => {
    try {
      const blob = new Blob([subtitleTextAreaRef.current?.value ?? ""], {
        type: "text/srt",
      });

      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "subtitles.srt";

      a.click();

      URL.revokeObjectURL(a.href);
    } catch (error) {
      console.error("Error while saving the file:", error);
    }
  };

  const subtitleTextAreaRef = React.createRef<HTMLTextAreaElement>();
  const translationRef = React.createRef<HTMLSelectElement>();

  useEffect(() => {
    setSrtSubtitle(
      SubtitleGenerator.generateSrtSubtitles(
        props.subtitles,
        translationRef.current?.value ?? "none",
        props.arabicVersesBetween,
        props.arabicVersesPosition,
        props.translationVersesPosition
      )
    );
  }, [updateSubtitle]);

  return (
    <div className="absolute bg-white left-10 right-10 top-20 bottom-20 border-3 pb-10 border-2 border-black shadow-2xl shadow-black p-10 rounded-lg">
      <div className="flex flex-row">
        <div className="flex flex-row items-center  mt-2 ml-4">
          <p>Content :</p>
          <select
            defaultValue={"none"}
            ref={translationRef}
            className="text-black px-2 py-1 ml-3 border border-black"
            onChange={(e) => {
              setUpdateSubtitle(!updateSubtitle);
            }}
          >
            <option value="none">Arabic only</option>
            {props.subtitles
              .find((x) => x.versePos !== undefined)
              ?.translations.map((translation, index) => {
                return (
                  <>
                    <option
                      key={index}
                      className="text-black"
                      value={"ar+" + translation.lang}
                    >
                      Arabic + {AppVariables.Langs[translation.lang]}
                    </option>
                    <option className="text-black" value={translation.lang}>
                      {AppVariables.Langs[translation.lang]}
                    </option>
                  </>
                );
              })}
          </select>
        </div>
        <button
          className="ml-auto border border-black bg-green-600 rounded-lg px-3 py-2 active:bg-green-800 duration-150"
          onClick={() =>
            navigator.clipboard.writeText(
              subtitleTextAreaRef.current?.value ?? ""
            )
          }
        >
          Copy to clipboard
        </button>
        <button
          className="border ml-5 mr-5 border-black bg-blue-400 rounded-lg px-3 py-2"
          onClick={async () => {
            saveFile();
          }}
        >
          Save as file
        </button>
        <button
          className="border -mr-5 border-black bg-red-400 rounded-lg px-3 py-2"
          onClick={() => props.setShowSubtitle(false)}
        >
          Close
        </button>
      </div>
      <textarea
        ref={subtitleTextAreaRef}
        aria-multiline
        value={srtSubtitle}
        className="absolute bottom-20 top-28 left-5 p-3 rounded-lg bg-slate-400 right-5 arabic arial"
        style={{ direction: "ltr" }}
        readOnly
      ></textarea>
    </div>
  );
};

export default subtitleViewer;
