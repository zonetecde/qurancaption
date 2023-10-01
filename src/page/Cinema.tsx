import React, { useState } from "react";
import Subtitle from "../models/subtitle";
import TimeExt from "../extensions/timeExt";

const Cinema = () => {
  const [videoSrc, setVideoSrc] = useState<string>("");
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const { type } = file;

    const videoFileType = [
      "video/mp4",
      "video/ogg",
      "video/webm",
      "video/wav",
      "video/ogg",
      "video/mp3",
      "video/mpeg",
      "video/ofv",
    ];

    if (videoFileType.includes(type)) {
      const reader = new FileReader();

      reader.onload = async (e) => {
        const audioData = e.target?.result as ArrayBuffer;

        if (!audioData) return;

        const audioBlob = new Blob([audioData], { type });
        setVideoSrc(URL.createObjectURL(audioBlob));
      };

      reader.readAsArrayBuffer(file);
    } else {
      console.log("tt");
      const reader = new FileReader();
      reader.onload = async (e) => {
        const subtitleData = e.target?.result as ArrayBuffer;
        var enc = new TextDecoder(); // always utf-8
        const subtitleText = enc.decode(subtitleData);

        let subtitles: Subtitle[] = [];

        subtitleText.split("\n\n").forEach((subtitlePart) => {
          const subtitlesSubParts = subtitlePart.split("\n");

          if (subtitlesSubParts.length >= 3) {
            const startDuration = TimeExt.HHMMSSmsToSeconds(
              subtitlesSubParts[1].split("-->")[0]
            );
            const endDuration = TimeExt.HHMMSSmsToSeconds(
              subtitlesSubParts[1].split("-->")[1]
            );
            const text = subtitlesSubParts[2];
            subtitles.push(
              new Subtitle(
                Number(subtitlesSubParts[0]),
                -1,
                -1,
                -1,
                startDuration,
                endDuration,
                text
              )
            );
          }
        });

        setSubtitles(subtitles);
      };

      reader.readAsArrayBuffer(file);
    }
  }

  const videoRef = React.useRef<HTMLVideoElement>(null);

  return (
    <div className="h-screen w-screen flex flex-row bg-slate-900">
      <video controls className="w-full object-fill" ref={videoRef}>
        <source type="video/mp4" className="h-full w-full " src={videoSrc} />
      </video>

      {/*top-1/2 left-1/2 -translate-x-2/4 -translate-y-2/4 */}

      <div
        className={
          "absolute left-0 right-0 top-0 text-3xl text-center bg-black bg-opacity-60 text-white select-none cursor-pointer " +
          (videoRef.current && videoRef.current.paused
            ? "bottom-10"
            : "bottom-0")
        }
        onClick={() => {
          if (videoRef.current) {
            // play if on pause, pause if on play
            videoRef.current.paused
              ? videoRef.current.play()
              : videoRef.current.pause();
          }
        }}
      >
        <p className="absolute top-1/2 w-11/12 -translate-y-1/2 left-1/2 -translate-x-1/2 my-auto arabic text-3xl lg:text-6xl">
          {subtitles.length > 0
            ? subtitles.find((subtitle) => {
                if (videoRef.current) {
                  if (
                    subtitle.startTime <= videoRef.current.currentTime &&
                    subtitle.endTime >= videoRef.current.currentTime
                  ) {
                    return true;
                  }
                }
                return false;
              })?.text ?? `Subtitle not found ${videoRef.current?.currentTime}`
            : "No subtitles"}
        </p>
      </div>

      {videoRef.current?.paused && (
        <div className="absolute top-3 right-3 w-52 h-36 bg-black rounded-lg bg-opacity-30">
          <button className="  relative mx-2 bg-slate-500 px-1 rounded-lg mt-2 py-1 border-2 border-black text-xl hover:bg-slate-600">
            Import video or audio
            <input
              type="file"
              accept=".mp4, .ogv, .webm, .wav, .mp3, .ogg, .mpeg"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 "
              style={{ zIndex: 2 }}
            />
          </button>

          <button className=" w-48 relative mx-2 bg-slate-500 px-1 rounded-lg mt-4 py-1 border-2 border-black text-xl hover:bg-slate-600">
            Import subtitle
            <input
              type="file"
              accept=".srt"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 "
              style={{ zIndex: 2 }}
            />
          </button>
        </div>
      )}
    </div>
  );
};

export default Cinema;
