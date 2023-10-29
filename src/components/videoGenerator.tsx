import React, { useEffect, useMemo, useRef, useState } from "react";
import TimeExt from "../extensions/timeExt";
import Subtitle from "../models/subtitle";
import { VersePosition } from "../api/quran";
import AppVariables from "../AppVariables";
import Loading from "../assets/loading.gif";
import SubtitleViewer from "./subtitleViewer";
import { SubtitleGenerator } from "../extensions/subtitleGenerator";
import StringExt from "../extensions/stringExt";
import { Toaster, toast } from "sonner";

interface Props {
    subtitles: Subtitle[];
    videoBlob: Blob;
    videoBlobUrl: string;
    setIsOnGenerationPage: React.Dispatch<React.SetStateAction<boolean>>;
}

const VideoGenerator = (props: Props) => {
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [isMuted, setIsMuted] = useState<boolean>(true);

    const [isVideoGenerating, setIsVideoGenerating] = useState<boolean>(false);
    const [showSubtitle, setShowSubtitle] = useState<boolean>(false);
    const [videoUrl, setVideoUrl] = useState<string>("");
    const [videoName, setVideoName] = useState<string>("");
    const [videoId, setVideoId] = useState<string>("");
    const [videoProcessLogs, setVideoProcessLogs] = useState<string>("");

    // dans le video player
    const [currentSubtitle, setCurrentSubtitle] = useState<
        Subtitle | undefined
    >(props.subtitles[0]);

    const textAreaLogs = React.useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setCurrentSubtitle(
            props.subtitles.find((subtitle) => {
                if (
                    subtitle.startTime <= currentTime && // Use the updated current time here
                    subtitle.endTime >= currentTime && // Use the updated current time here
                    subtitle.arabicText !== "" // silence
                ) {
                    return true;
                }

                return false;
            })
        );
    });

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
                videoRef.current.removeEventListener(
                    "timeupdate",
                    handleTimeUpdate
                );
            }
        };
    }, []);

    /**
     * Allow the text area displaying the video logs to automatically scroll to the bottom
     */
    useEffect(() => {
        if (textAreaLogs.current) {
            textAreaLogs.current.scrollTop = textAreaLogs.current.scrollHeight;
        }
    }, [videoProcessLogs, textAreaLogs]);

    async function generateVideo(): Promise<void> {
        setIsMuted(true);

        if (isVideoGenerating) return;
        setVideoUrl("");
        setVideoId("");
        setVideoProcessLogs("Uploading the video...");

        // Get all the verses of the video
        let verses: string = "";

        for (let i = 0; i < props.subtitles.length; i++) {
            const subtitle = props.subtitles[i];
            if (subtitle.versePos) {
                verses +=
                    subtitle.versePos.surah +
                    ":" +
                    subtitle.versePos.verse +
                    ",";

                setVideoName(
                    AppVariables.Quran[subtitle.versePos.surah - 1]
                        .transliteration +
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
            verses +
            "&blackOpacity=" +
            blackOpacityInputRef.current?.value;

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
                true,
                arabicVersesBetweenRef.current?.checked,
                verseNumberInArabicRef.current?.checked,
                verseNumberInTranslationRef.current?.checked,
                textOutlineRef.current?.checked,
                videoRef.current!.videoWidth < videoRef.current!.videoHeight,
                translationBoldRef.current?.checked,
                translationFontRef.current?.value
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
                    setVideoId(videoId);

                    var int = setInterval(() => {
                        try {
                            // fait une requête au serveur pour savoir si la vidéo est prête
                            const apiUrl =
                                AppVariables.ApiUrl +
                                "/api/QVM/is-video-ready?id=" +
                                videoId.split("_output")[0]; // videoId = xxxxxxx_output.mp4 (pour ensuite la videoUrl)

                            fetch(apiUrl).then(async (response) => {
                                const responseText = await response.text();

                                if (responseText === "true") {
                                    setVideoUrl(
                                        AppVariables.ApiUrl + "/QVM/" + videoId
                                    );
                                    clearInterval(int);
                                } else {
                                    // Récupère ici l'avancée de la requête sur le serveur
                                    // Add a new logs and set it to display it
                                    if (responseText !== "") {
                                        setVideoProcessLogs(
                                            responseText.replace(
                                                "frame",
                                                "\nframe"
                                            )
                                        );
                                    }
                                }
                            });
                        } catch {
                            // internet lost
                        }
                    }, 1500);
                } else {
                    // Handle errors
                    console.error(
                        "Failed to upload file  " + response.body?.getReader()
                    );
                    toast(
                        "Sorry, something went wrong !\nPlease check your internet connection."
                    );
                    setIsVideoGenerating(false);
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                setIsVideoGenerating(false);

                // Handle errors
                toast.error(
                    "Sorry, something went wrong !\nPlease check your internet connection."
                );
            });
    }

    const videoRef = React.useRef<HTMLVideoElement>(null);
    const arabicFontRef = React.useRef<HTMLSelectElement>(null);
    const arabicFontSizeRef = React.useRef<HTMLInputElement>(null);
    const translationRef = React.useRef<HTMLSelectElement>(null);
    const translationFontSizeRef = React.useRef<HTMLInputElement>(null);
    const allowMeToKeepRef = React.useRef<HTMLInputElement>(null);
    const verseNumberInTranslationRef = React.useRef<HTMLInputElement>(null);
    const verseNumberInArabicRef = React.useRef<HTMLInputElement>(null);
    const arabicVersesBetweenRef = React.useRef<HTMLInputElement>(null);
    const blackOpacityInputRef = React.useRef<HTMLInputElement>(null);
    const textOutlineRef = React.useRef<HTMLInputElement>(null);
    const translationBoldRef = React.useRef<HTMLInputElement>(null);
    const translationFontRef = React.useRef<HTMLSelectElement>(null);

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

    const [isInvalidFile, setIsValidFile] = useState<boolean>(true);
    useMemo(() => {
        setIsValidFile(
            props.videoBlob.type.split("/")[1] === "mp3" ||
                props.videoBlob.type.split("/")[1] === "wav" ||
                props.videoBlob.type.split("/")[1] === "ogg" ||
                props.videoBlob.type.split("/")[1] === "mpeg"
        );
    }, [props.videoBlob]);

    return (
        <div className="h-full w-full flex items-center justify-center flex-col relative overflow-auto">
            {isInvalidFile && (
                <p className="absolute bg-black text-white text-center text-xl bg-opacity-60 left-0 right-0 px-20 py-5 top-0">
                    Sorry, you can't create a video from an audio file. Please
                    use{" "}
                    <a
                        href="https://ez-converter.com/audio-to-video"
                        className="underline text-blue-600"
                        target="_blank">
                        an online converter
                    </a>{" "}
                    to change your audio file into a video and set it as your
                    recitation file in the editor (top left corner)."
                    <br />
                    <br />
                    You can still generate subtitles for your audio file.
                </p>
            )}
            <div className="overflow-auto flex flex-col items-center bg-[#2b333f] my-10">
                <Toaster position="bottom-right" />

                <div className="flex items-center justify-center flex-col">
                    <div className="text-white flex flex-row flex-wrap justify-center items-center w-8/12 lg:w-full text-sm md:text-lg large:text-xl">
                        <div className="flex flex-row items-center justify-center mt-2 ">
                            <p>Arabic font : </p>
                            <select
                                defaultValue={"Amiri"}
                                className="text-black px-2 py-1 ml-3 max-w-[150px]"
                                ref={arabicFontRef}>
                                <option value="Amiri">Amiri</option>
                                <option value="me_quran">
                                    me_quran (can be buggy)
                                </option>
                            </select>
                        </div>

                        <div className="flex flex-row items-center  mt-2 ml-4">
                            <p>Arabic font size :</p>
                            <input
                                defaultValue={32}
                                min={1}
                                max={200}
                                className="text-black px-2 py-1 ml-3 max-w-[60px]"
                                type="number"
                                ref={arabicFontSizeRef}
                            />
                        </div>

                        <div className="flex flex-row items-center  mt-2 ml-4">
                            <p>Translation :</p>
                            <select
                                defaultValue={"none"}
                                className="text-black px-2 py-1 ml-3"
                                ref={translationRef}>
                                <option value="none">None</option>
                                {props.subtitles
                                    .find((x) => x.versePos !== undefined)
                                    ?.translations.map((translation, index) => {
                                        return (
                                            <option
                                                className="text-black"
                                                key={index}
                                                value={translation.lang}>
                                                {
                                                    AppVariables.Langs[
                                                        translation.lang
                                                    ]
                                                }
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
                                className="text-black px-2 py-1 ml-3 max-w-[50px]"
                                type="number"
                            />
                        </div>

                        {/**
                         * Pour ajouter des polices d'écriture sur le serveur :
                         * 1 - Mettre le fichier ttf dans zoneck/.fonts
                         * 2 - sudo mv .fonts/* /usr/share/fonts
                         */}

                        <div className="flex flex-row items-center justify-center ml-4 mt-2 ">
                            <p>Translation font : </p>
                            <select
                                defaultValue={"opensans"}
                                className="text-black px-2 py-1 ml-3 max-w-[150px]"
                                ref={translationFontRef}>
                                <option value="Open Sans Light">
                                    Open Sans
                                </option>
                                <option value="DejaVu Sans">Deja Vu</option>
                                <option value="Roboto">Roboto</option>
                                <option value="Helvetica">Helvetica</option>
                            </select>
                        </div>

                        <div className="flex flex-row items-center mt-1 ml-4">
                            <input
                                className="mr-2"
                                type="checkbox"
                                defaultChecked
                                ref={translationBoldRef}
                            />
                            <p>Translation bold</p>
                        </div>
                    </div>

                    <div className="text-white flex flex-row flex-wrap text-sm md:text-lg w-8/12 lg:w-full px-10 large:text-xl mt-3">
                        <div className="flex flex-row items-center ">
                            <input
                                className="mr-2"
                                type="checkbox"
                                ref={arabicVersesBetweenRef}
                            />
                            <p>
                                Arabic verses between{" "}
                                <span className="Amiri">﴾ ... ﴿</span>
                            </p>
                        </div>
                        <div className="flex flex-row items-center ml-5">
                            <input
                                className="mr-2"
                                type="checkbox"
                                ref={verseNumberInArabicRef}
                            />
                            <p>Verse number in arabic verse </p>
                        </div>
                        <div className="flex flex-row items-center ml-5">
                            <input
                                className="mr-2"
                                type="checkbox"
                                ref={verseNumberInTranslationRef}
                            />
                            <p>Verse number in translation </p>
                        </div>
                        <div className="flex flex-row items-center ml-5">
                            <input
                                className="mr-2"
                                type="checkbox"
                                ref={textOutlineRef}
                                defaultChecked
                            />
                            <p>Text outline</p>
                        </div>
                        <div className="flex flex-row items-center ml-5">
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step={0.01}
                                defaultValue={0.7}
                                className=" outline-none mr-2 mt-0.5"
                                ref={blackOpacityInputRef}
                            />

                            <p>Black overlay opacity</p>
                        </div>
                    </div>
                </div>

                <div
                    className="w-10/12 bg-black relative mt-10 flex justify-center "
                    style={{ width: videoRef.current?.videoWidth + "px" }}>
                    <video
                        className="max-w-[100vh] max-h-[80vh] shadow-2xl shadow-black "
                        src={props.videoBlobUrl}
                        ref={videoRef}
                        autoPlay
                        muted={isMuted}
                        loop></video>
                    {/* Black overlay */}
                    <div
                        className="absolute left-0 top-0 right-0 -bottom-0.5 overflow-hidden bg-black"
                        style={{ opacity: blackOpacityInputRef.current?.value }}
                    />
                    <div className="absolute left-0 top-0 right-0 bottom-0 overflow-hidden mx-2 tracking-wider">
                        {isMuted ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="white"
                                className="w-10 h-10 absolute bottom-2 right-2 cursor-pointer"
                                onClick={() => setIsMuted(false)}>
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.531V19.94a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.506-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.395C2.806 8.757 3.63 8.25 4.51 8.25H6.75z"
                                />
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="white"
                                className="w-10 h-10 absolute  bottom-2 right-2 cursor-pointer"
                                onClick={() => setIsMuted(true)}>
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
                                />
                            </svg>
                        )}

                        <div
                            className={
                                "flex justify-center  flex-col items-center h-full text-white text-center select-none " +
                                (textOutlineRef.current?.checked
                                    ? "letter-outline"
                                    : "")
                            }
                            style={{
                                fontSize:
                                    (arabicFontSizeRef.current
                                        ? Number(
                                              arabicFontSizeRef.current.value
                                          ) /
                                          ((videoRef.current?.width ?? 1080) <
                                          750
                                              ? 24
                                              : 12.25)
                                        : 1) + "vh",
                            }}>
                            {currentSubtitle && (
                                <p
                                    className={
                                        arabicFontRef.current?.value ===
                                        "me_quran"
                                            ? "me_quran "
                                            : "Amiri"
                                    }>
                                    {arabicVersesBetweenRef.current?.checked ===
                                        true && "﴿"}{" "}
                                    {currentSubtitle?.arabicText}
                                    {arabicVersesBetweenRef.current?.checked ===
                                        true && " ﴾"}{" "}
                                    {currentSubtitle &&
                                    verseNumberInArabicRef.current?.checked ===
                                        true &&
                                    currentSubtitle.IsLastWordsFromVerse() ? (
                                        // Les numéros de verset arabe fonctionne qu'avec la police me_quran
                                        <span className="me_quran">
                                            {"﴿" +
                                                StringExt.toArabicNumber(
                                                    currentSubtitle.versePos!
                                                        .verse
                                                ) +
                                                "﴾"}
                                        </span>
                                    ) : (
                                        ""
                                    )}
                                </p>
                            )}

                            {"\n"}
                            {translationRef.current?.value !== "none" && (
                                <p
                                    className={
                                        "mt-2 -mx-[7vh] w-full " +
                                        (translationFontRef.current?.value.replace(
                                            " ",
                                            "-"
                                        ) ?? "DejaVu-Sans")
                                    }
                                    style={{
                                        fontSize:
                                            ((translationFontSizeRef.current
                                                ? Number(
                                                      translationFontSizeRef.current!
                                                          .value
                                                  )
                                                : 10) *
                                                2) /
                                                ((videoRef.current?.width ??
                                                    1080) < 750
                                                    ? 17
                                                    : 10.5) +
                                            "vh",
                                        fontWeight: translationBoldRef.current
                                            ?.checked
                                            ? "bold"
                                            : "normal",
                                    }}>
                                    {currentSubtitle &&
                                        (verseNumberInTranslationRef.current
                                            ?.checked === true &&
                                        currentSubtitle?.fromWordIndex === 0
                                            ? currentSubtitle.versePos?.verse.toString() +
                                              ". "
                                            : "") +
                                            currentSubtitle.getTranslationText(
                                                translationRef.current?.value ??
                                                    "en"
                                            )}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-row mt-5 ">
                    {" "}
                    <input
                        type="checkbox"
                        ref={allowMeToKeepRef}
                        defaultChecked={false}
                    />
                    <p className="text-white ml-2">
                        Allow me to retain the video on my server for use in a
                        Quranic app ? <br />
                        If not checked, the video will be deleted from my server
                        in 2h.
                    </p>
                </div>

                <div className="flex flex-row justify-center">
                    <button
                        className="lg:px-10 border ml-5 border-black py-2 lg:rounded-full rounded-3xl text-sm md:text-lg lg:text-2xl px-3 hover:bg-blue-400 duration-100 bg-blue-200 mt-5"
                        onClick={() => {
                            props.setIsOnGenerationPage(false);
                            setIsVideoGenerating(false);
                        }}>
                        Go back
                    </button>
                    {isInvalidFile === false && (
                        <button
                            className="lg:px-10 border ml-5 border-black  py-2 lg:rounded-full rounded-3xl text-sm md:text-lg lg:text-2xl px-3 hover:bg-blue-400 duration-100 bg-blue-200 mt-5"
                            onClick={generateVideo}>
                            Generate video
                        </button>
                    )}

                    <button
                        className="lg:px-10 border ml-5 py-2 border-black lg:rounded-full rounded-3xl text-sm md:text-lg lg:text-2xl px-3 hover:bg-blue-400 duration-100 bg-blue-200 mt-5"
                        onClick={() => {
                            setShowSubtitle(true);
                            setIsMuted(true);
                        }}>
                        Generate subtitles
                    </button>
                </div>
            </div>

            {isVideoGenerating && (
                <div className="absolute left-0 top-0 right-0 bottom-0 bg-black bg-opacity-90 text-white">
                    <div className="flex items-center h-full w-full flex-col">
                        {videoUrl ? (
                            <div className="top-1/3 -translate-y-1/3 absolute flex flex-col items-center">
                                <p className="text-3xl text-center">
                                    Here's your video :
                                </p>

                                <br />
                                <video
                                    src={videoUrl}
                                    controls
                                    autoPlay
                                    className="max-h-[600px] max-w-[800px]"
                                />

                                <div className="flex flex-row">
                                    <button
                                        className="mt-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full text-xl duration-75"
                                        onClick={downloadVideo}>
                                        Download
                                    </button>
                                    <button
                                        className="mt-5 ml-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full text-xl duration-75"
                                        onClick={() =>
                                            setIsVideoGenerating(false)
                                        }>
                                        Close
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {" "}
                                <p className="mx-auto my-auto text-lg md:text-xl lg:text-2xl shadow-2xl shadow-black text-center bg-green-500 px-5 bg-opacity-30 py-5 rounded-2xl flex flex-col justify-center items-center">
                                    Your video is currently being generated and
                                    will be available shortly.
                                    <br />
                                    This process may take a few minutes.
                                    <br />
                                    {videoId !== "" && (
                                        <span className="mt-2 text-sm italic">
                                            Video id :{" "}
                                            {videoId.split("_output")[0]}
                                        </span>
                                    )}
                                    <div className="w-10/12 h-60 mt-3 relative">
                                        <textarea
                                            className="w-full h-full bg-gray-700 border border-black shadow-black shadow-lg p-3 text-sm"
                                            readOnly
                                            ref={textAreaLogs}
                                            value={videoProcessLogs}></textarea>
                                        <img
                                            src={Loading}
                                            className="absolute -right-5 -bottom-4"
                                            width={100}
                                        />
                                    </div>
                                    <span className="text-sm mt-3">
                                        Is it slow ? <a href="">Help me</a> buy
                                        a better server :)
                                    </span>
                                    <a
                                        href="https://www.buymeacoffee.com/zonetecde"
                                        target="_blank">
                                        <img
                                            src="https://cdn.buymeacoffee.com/buttons/v2/arial-violet.png"
                                            alt="Buy Me A Coffee"
                                            className="max-h-[50px] mt-5"
                                        />
                                    </a>
                                </p>
                            </>
                        )}
                    </div>
                </div>
            )}

            {showSubtitle && (
                <div className="absolute left-0 top-0 right-0 bottom-0 bg-black bg-opacity-80">
                    <SubtitleViewer
                        setShowSubtitle={setShowSubtitle}
                        subtitles={props.subtitles}
                        arabicVersesBetween={
                            arabicVersesBetweenRef.current?.checked ?? false
                        }
                        arabicVersesPosition={
                            verseNumberInArabicRef.current?.checked ?? false
                        }
                        translationVersesPosition={
                            verseNumberInTranslationRef.current?.checked ??
                            false
                        }
                    />
                </div>
            )}
        </div>
    );
};

export default VideoGenerator;
