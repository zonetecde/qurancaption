import React, { useEffect, useMemo, useRef } from "react";
import Subtitle from "../models/subtitle";
import TimeExt from "../extensions/timeExt";

interface Props {
  subtitles: Subtitle[];
  setSubtitleText: React.Dispatch<React.SetStateAction<string>>;
  addTranslation: () => void;
}

const SubtitlesHistory = (props: Props) => {
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

  const subtitlesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (subtitlesEndRef.current)
      subtitlesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [props.subtitles]);

  return (
    <div className="w-full text-green-200 flex justify-start items-center pt-6 flex-col h-full ">
      {" "}
      <p className="text-2xl mb-5">Subtitles</p>
      <div className="w-11/12 overflow-y-scroll h-full flex flex-col items-center pr-1">
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
        <div ref={subtitlesEndRef} />
      </div>
      {props.subtitles.length > 0 && (
        <div className=" w-12/12 h-16 mb-12  mt-4 flex flex-row">
          <button
            className="bg-blue-500 hover:bg-blue-700  text-white font-bold px-4 mx-2 rounded text-lg duration-75 shadow-lg shadow-black"
            onClick={showSubtitle}
          >
            Generate subtitles
          </button>
          {/* <button
            className="bg-blue-500 hover:bg-blue-700  text-white font-bold mx-2 px-4 rounded text-lg duration-75 shadow-lg shadow-black "
            onClick={props.addTranslation}
          >
            Add translations
          </button> */}
        </div>
      )}
    </div>
  );
};

export default SubtitlesHistory;
