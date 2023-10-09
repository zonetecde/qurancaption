import React, { useEffect, useState } from "react";
import TimeExt from "../extensions/timeExt";
import Subtitle from "../models/subtitle";
import { VersePosition } from "../api/quran";
import AppVariables from "../AppVariables";
import Loading from "../assets/loading.gif";
import SubtitleViewer from "./subtitleViewer";
import { SubtitleGenerator } from "../extensions/subtitleGenerator";

interface Props {
  subtitles: Subtitle[];
  videoBlob: Blob;
  videoBlobUrl: string;
  setIsOnGenerationPage: React.Dispatch<React.SetStateAction<boolean>>;
}

const VideoGenerator = (props: Props) => {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isVideoGenerating, setIsVideoGenerating] = useState<boolean>(false);
  const [showSubtitle, setShowSubtitle] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoName, setVideoName] = useState<string>("");

  useEffect(() => {
    const handleTimeUpdate = () => {
      if (videoRef.current) {
        setCurrentTime(videoRef.current.currentTime);
      }
    };

    if (videoRef.current) {
      videoRef.current.addEventListener("timeupdate", handleTimeUpdate);
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener("timeupdate", handleTimeUpdate);
      }
    };
  }, []);

  async function generateVideo(): Promise<void> {
    if (isVideoGenerating) return;
    setVideoUrl("");

    let verses: string = "";

    for (let i = 0; i < props.subtitles.length; i++) {
      const subtitle = props.subtitles[i];
      if (subtitle.versePos) {
        verses += subtitle.versePos.surah + ":" + subtitle.versePos.verse + ",";

        setVideoName(
          AppVariables.Quran[subtitle.versePos.surah - 1].transliteration +
            "_" +
            subtitle.versePos.verse
        );
      }
    }

    // Assuming you have the BLOB data stored in a variable called 'videoBlob' or 'audioBlob'
    const apiUrl =
      AppVariables.ApiUrl +
      "/api/QVM/generate-video?authorizeKeep=" +
      (allowMeToKeepRef.current?.checked ? "true" : "false") +
      "&verses=" +
      verses;

    console.log(apiUrl);

    // Create a FormData object to send the BLOB data
    const formData = new FormData();
    formData.append(
      "file",
      props.videoBlob,
      "_." + props.videoBlob.type.split("/")[1]
    );
    formData.append(
      "subtitle",
      SubtitleGenerator.generateAssSubtitles(
        props.subtitles,
        translationRef.current?.value,
        arabicFontRef.current?.value,
        Number(arabicFontSizeRef.current!.value) ?? 32,
        Number(translationFontSizeRef.current!.value) ?? 10,
        true
      )
    );

    // Send the BLOB data to the API
    setIsVideoGenerating(true);
    fetch(apiUrl, {
      method: "POST",
      body: formData,
    })
      .then(async (response) => {
        if (response.ok) {
          const videoId = await response.text();

          var int = setInterval(() => {
            // fait une requête au serveur pour savoir si la vidéo est prête
            const apiUrl =
              AppVariables.ApiUrl +
              "/api/QVM/is-video-ready?id=" +
              videoId.split("_output")[0]; // videoId = xxxxxxx_output.mp4 (pour ensuite la videoUrl)

            fetch(apiUrl).then(async (response) => {
              const responseText = await response.text();

              if (responseText === "true") {
                setVideoUrl(AppVariables.ApiUrl + "/QVM/" + videoId);
                clearInterval(int);
              }
            });
          }, 2500);
        } else {
          // Handle errors
          console.error("Failed to upload file  " + response.body?.getReader());
          setIsVideoGenerating(false);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        setIsVideoGenerating(false);
      });
  }

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const arabicFontRef = React.useRef<HTMLSelectElement>(null);
  const arabicFontSizeRef = React.useRef<HTMLInputElement>(null);
  const translationRef = React.useRef<HTMLSelectElement>(null);
  const translationFontSizeRef = React.useRef<HTMLInputElement>(null);
  const allowMeToKeepRef = React.useRef<HTMLInputElement>(null);

  function downloadVideo() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", videoUrl, true);
    xhr.responseType = "blob";
    xhr.onload = function () {
      let urlCreator = window.URL || window.webkitURL;
      let videoUrl = urlCreator.createObjectURL(this.response);
      let tag = document.createElement("a");
      tag.href = videoUrl;
      tag.target = "_blank";
      tag.download = videoName + ".mp4";
      document.body.appendChild(tag);
      tag.click();
      document.body.removeChild(tag);
    };
    xhr.send();
  }

  return (
    <div className="h-full w-full flex items-center justify-center flex-col relative">
      {!showSubtitle && (
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full text-xl duration-75 mt-6 shadow-lg shadow-black
            absolute top-0 left-7"
          onClick={() => {
            props.setIsOnGenerationPage(false);
            setIsVideoGenerating(false);
          }}
        >
          Go back
        </button>
      )}

      {props.videoBlob.type.split("/")[1] === "mp3" ||
      props.videoBlob.type.split("/")[1] === "wav" ||
      props.videoBlob.type.split("/")[1] === "ogg" ||
      props.videoBlob.type.split("/")[1] === "mpeg" ? (
        <p className="absolute bg-black text-white text-center text-3xl bg-opacity-60 left-0 right-0 top-1/2 px-20 py-5 -translate-y-1/2">
          Sorry, you can't create a video from an audio file. Please use{" "}
          <a
            href="https://ez-converter.com/audio-to-video"
            className="underline text-blue-600"
            target="_blank"
          >
            an online converter
          </a>{" "}
          to change your audio file into a video and set it as your recitation
          file in the editor (top left corner)."
        </p>
      ) : (
        <>
          <div className="text-white flex flex-row flex-wrap text-sm md:text-lg large:text-xl">
            <div className="flex flex-row items-center ">
              <p>Arabic font : </p>
              <select
                defaultValue={"Amiri"}
                className="text-black px-2 py-1 ml-3"
                ref={arabicFontRef}
              >
                <option value="Amiri">Amiri</option>
                <option value="me_quran">me_quran (can be buggy)</option>
              </select>
            </div>

            <div className="flex flex-row items-center  mt-2 ml-4">
              <p>Arabic font size :</p>
              <input
                defaultValue={32}
                min={1}
                max={200}
                className="text-black px-2 py-1 ml-3 "
                type="number"
                ref={arabicFontSizeRef}
              />
            </div>

            <div className="flex flex-row items-center  mt-2 ml-4">
              <p>Translation :</p>
              <select
                defaultValue={"none"}
                className="text-black px-2 py-1 ml-3"
                ref={translationRef}
              >
                <option value="none">None</option>
                {props.subtitles
                  .find((x) => x.versePos !== undefined)
                  ?.translations.map((translation, index) => {
                    return (
                      <option
                        className="text-black"
                        key={index}
                        value={translation.lang}
                      >
                        {AppVariables.Langs[translation.lang]}
                      </option>
                    );
                  })}
              </select>
            </div>

            <div className="flex flex-row items-center  mt-2 ml-4">
              <p>Translation font size :</p>
              <input
                ref={translationFontSizeRef}
                defaultValue={10}
                min={1}
                max={200}
                className="text-black px-2 py-1 ml-3 "
                type="number"
              />
            </div>
          </div>

          <div className="w-8/12 bg-black relative mt-5">
            <video
              className="w-full h-full"
              src={props.videoBlobUrl}
              ref={videoRef}
              muted
              autoPlay
              loop
            ></video>
            <div className="absolute left-0 top-0 right-0 bottom-0 overflow-hidden">
              <div
                className={
                  "flex justify-center flex-col items-center h-full text-white  text-center mx-20 letter-outline " +
                  (arabicFontRef.current?.value === "me_quran"
                    ? "me_quran "
                    : "Amiri ")
                }
                style={{
                  fontSize:
                    (arabicFontSizeRef.current
                      ? Number(arabicFontSizeRef.current.value)
                      : 32) + "px",
                }}
              >
                {props.subtitles.length > 0
                  ? props.subtitles.find((subtitle) => {
                      if (
                        subtitle.startTime <= currentTime && // Use the updated current time here
                        subtitle.endTime >= currentTime // Use the updated current time here
                      ) {
                        return true;
                      }

                      return false;
                    })?.arabicText ?? `` // Use the updated current time here
                  : "No subtitles"}
                {"\n"}
                {translationRef.current?.value !== "none" && (
                  <p
                    className="arial mt-2"
                    style={{
                      fontSize:
                        (translationFontSizeRef.current
                          ? Number(translationFontSizeRef.current!.value)
                          : 10) *
                          2 +
                        "px",
                    }}
                  >
                    {props.subtitles.length > 0
                      ? props.subtitles
                          .find((subtitle) => {
                            if (
                              subtitle.startTime <= currentTime && // Use the updated current time here
                              subtitle.endTime >= currentTime // Use the updated current time here
                            ) {
                              return true;
                            }

                            return false;
                          })
                          ?.translations.find(
                            (x) => x.lang === translationRef.current?.value
                          )?.text ?? `` // Use the updated current time here
                      : "No subtitles"}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-row mt-5">
            {" "}
            <input
              type="checkbox"
              ref={allowMeToKeepRef}
              defaultChecked={false}
            />
            <p className="text-white ml-2">
              Allow me to retain the video on my server for use in a Quranic app
              ? <br />
              If not checked, the video will be deleted from my server in 2h.
            </p>
          </div>

          <div className="flex flex-row">
            <button
              className="px-10 border border-black rounded-full text-2xl hover:bg-blue-400 duration-100 py-3 bg-blue-200 mt-5"
              onClick={generateVideo}
            >
              Generate video
            </button>
            <button
              className="px-10 border ml-5 border-black rounded-full text-2xl hover:bg-blue-400 duration-100 py-3 bg-blue-200 mt-5"
              onClick={() => setShowSubtitle(true)}
            >
              Show subtitles
            </button>
          </div>
        </>
      )}

      {isVideoGenerating && (
        <div className="absolute left-0 top-0 right-0 bottom-0 bg-black bg-opacity-90 text-white">
          <div className="flex items-center h-full w-full flex-col">
            {videoUrl ? (
              <div className="top-1/3 -translate-y-1/3 absolute flex flex-col items-center">
                <p className="text-3xl text-center">Here's your video :</p>

                <br />
                <video src={videoUrl} controls autoPlay width={800} />

                <div className="flex flex-row">
                  <button
                    className="mt-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full text-xl duration-75"
                    onClick={downloadVideo}
                  >
                    Download
                  </button>
                  <button
                    className="mt-5 ml-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full text-xl duration-75"
                    onClick={() => setIsVideoGenerating(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <>
                {" "}
                <p className="mx-auto my-auto text-lg md:text-xl lg:text-2xl shadow-2xl shadow-black text-center bg-green-500 px-5 bg-opacity-30 py-5 rounded-2xl flex flex-col justify-center items-center">
                  Your video is currently being generated and will be available
                  shortly.
                  <br />
                  This process may take a few minutes.
                  <br />
                  <span className="text-sm mt-3">
                    Is it slow ? <a href="">Help me</a> buy a better server :)
                  </span>
                  <a
                    href="https://www.buymeacoffee.com/zonetecde"
                    target="_blank"
                  >
                    <img
                      src="https://cdn.buymeacoffee.com/buttons/v2/arial-violet.png"
                      alt="Buy Me A Coffee"
                      className="max-h-[50px] mt-5"
                    />
                  </a>
                </p>
                <img
                  src={Loading}
                  className="top-2/3 -translate-y-1/3 absolute "
                  width={300}
                />
              </>
            )}
          </div>
        </div>
      )}

      {showSubtitle && (
        <SubtitleViewer
          setShowSubtitle={setShowSubtitle}
          subtitles={props.subtitles}
        />
      )}
    </div>
  );
};

export default VideoGenerator;
