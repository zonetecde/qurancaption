import React, { useMemo, useRef } from "react";
import Subtitle from "../models/subtitle";
import TimeExt from "../extensions/timeExt";

interface Props {
  subtitles: Subtitle[];
  setSubtitleText: React.Dispatch<React.SetStateAction<string>>;
}

const Historique = (props: Props) => {
  function showSubtitle() {
    // Sync fini, on transforme ça en fichier sous-titre
    let subtitleFileText = "";
    props.subtitles.forEach((subtitle, index) => {
      subtitleFileText += String(index + 1) + "\n";
      subtitleFileText +=
        TimeExt.secondsToHHMMSSms(subtitle.startTime) +
        " --> " +
        TimeExt.secondsToHHMMSSms(subtitle.endTime) +
        "\n";
      subtitleFileText += subtitle.text + "\n\n";
    });

    props.setSubtitleText(subtitleFileText);
  }

  useMemo(() => {
    try {
      // scroll to bottom
      if (subtitlesScrollViewRef.current)
        subtitlesScrollViewRef.current?.scrollTo({
          top: subtitlesScrollViewRef.current.scrollHeight,
          behavior: "smooth",
        });
    } catch (e) {
      console.log(e);
    }
  }, [props.subtitles]);

  const subtitlesScrollViewRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full text-green-200 flex justify-start items-center mt-6 flex-col h-full ">
      {" "}
      <p className="text-2xl mb-5">Subtitles</p>
      <div
        className="w-11/12 overflow-y-scroll h-full flex flex-col items-center pr-1"
        ref={subtitlesScrollViewRef}
      >
        {props.subtitles.map((subtitle) => (
          <div className="flex flex-col border rounded-lg w-full mb-2 p-2">
            <div className="flex flex-row">
              <p>
                {subtitle.startTime}s - {subtitle.endTime}s
              </p>
              <p className="mr-1 ml-auto">Verse {subtitle.versePos}</p>
            </div>

            <p className="arabic text-2xl mt-2 text-white">{subtitle.text}</p>
          </div>
        ))}
      </div>
      {props.subtitles.length > 0 && (
        <button
          className="bg-blue-500 hover:bg-blue-700 w-11/12 h-12 mb-12 text-white font-bold px-6 rounded text-lg duration-75 mt-4 shadow-lg shadow-black leading-10"
          onClick={showSubtitle}
        >
          Generate subtitles
        </button>
      )}
    </div>
  );
};

export default Historique;
