import React, { useEffect, useRef } from "react";
import Subtitle from "../models/subtitle";
import TimeExt from "../extensions/timeExt";
import AppVariables from "../AppVariables";

interface Props {
  subtitles: Subtitle[];
  setGenerateVideo: React.Dispatch<React.SetStateAction<boolean>>;
  isOnGenerateVideoPage: boolean;
}

const SubtitlesHistory = (props: Props) => {
  function generateVideoButtonClicked() {
    props.setGenerateVideo(true);
  }

  const subtitlesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (subtitlesEndRef.current)
      subtitlesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [props.subtitles]);

  return (
    <div className="w-full text-green-200 flex justify-start items-center pt-6 flex-col h-full bg-[#1e242c] ">
      {" "}
      <p className="text-2xl mb-5">Subtitles</p>
      <div className="w-11/12 overflow-y-scroll h-full flex flex-col items-center pr-1">
        {props.subtitles.map((subtitle, index) => (
          <div
            className="flex flex-col border rounded-lg w-full mb-2 p-2"
            key={index}
          >
            <div className="flex flex-row">
              <p>
                {subtitle.startTime.toFixed(3)}s - {subtitle.endTime.toFixed(3)}
                s
              </p>
              {subtitle.versePos && (
                <p className="mr-1 ml-auto">
                  {subtitle.versePos.surah}:{subtitle.versePos.verse}
                </p>
              )}
            </div>

            <p
              className={
                "text-2xl mt-2 text-white " +
                (subtitle.arabicText !== "" ? "arabic" : "text-sm")
              }
            >
              {subtitle.arabicText !== "" ? subtitle.arabicText : "(silence)"}

              {subtitle.translations.map((translation) => (
                <>
                  {translation.lang !== "ar" && (
                    <span
                      className="mt-2 text-sm font-normal text-left font-sans block"
                      key={translation.lang}
                    >
                      <span className="underline underline-offset-2">
                        {AppVariables.Langs[translation.lang]}
                      </span>{" "}
                      : {translation.text}
                    </span>
                  )}
                </>
              ))}
            </p>
          </div>
        ))}
        <div ref={subtitlesEndRef} />
      </div>
      {props.subtitles.some((x) => x.versePos) &&
        props.isOnGenerateVideoPage === false && (
          <div className=" w-12/12 h-16 mb-12  mt-4 flex flex-row">
            <button
              className="bg-blue-500 hover:bg-blue-700  text-white font-bold px-4 mx-2 rounded text-lg duration-75 shadow-lg shadow-black"
              onClick={generateVideoButtonClicked}
            >
              Generate video
            </button>
          </div>
        )}
    </div>
  );
};

export default SubtitlesHistory;
