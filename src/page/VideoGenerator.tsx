import React from "react";
import TimeExt from "../extensions/timeExt";
import Subtitle from "../models/subtitle";

interface Props {
  subtitles: Subtitle[];
}

const VideoGenerator = (props: Props) => {
  function generateSubtitles() {
    let subtitleFileText = "";
    let silenceCounter: number = 0; // Permet de compenser les pauses pour pas que le numéro de sous titre soit erroné
    props.subtitles.forEach((subtitle, index) => {
      if (subtitle.arabicText !== "") {
        subtitleFileText += String(index + 1 - silenceCounter) + "\n";
        subtitleFileText +=
          TimeExt.secondsToHHMMSSms(subtitle.startTime) +
          " --> " +
          TimeExt.secondsToHHMMSSms(subtitle.endTime) +
          "\n";
        subtitleFileText += subtitle.arabicText + "\n\n";
      } else {
        silenceCounter++;
      }
    });
  }
  return (
    <div className="h-full w-full flex items-center justify-center">
      <button className="px-10 py-3 bg-red-200">Generate</button>
      {/* <SubtitleViewer
                        subtitleText={isOnGenerateVideoPage}
                        setSubtitleText={setGenerateVideo}
                        subtitleFileName={
                          props.Quran[selectedSurahPosition - 1]
                            .transliteration +
                          " " +
                          selectedVerses[0].id +
                          "-" +
                          selectedVerses[selectedVerses.length - 1].id +
                          ".srt"
                        }
                      /> */}
    </div>
  );
};

export default VideoGenerator;
