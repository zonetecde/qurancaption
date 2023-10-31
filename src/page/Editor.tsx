import React, { useEffect, useMemo, useRef, useState } from "react";
import { Surah, Verse, VersePosition } from "../api/quran";
import ReactAudioPlayer from "react-audio-player";

// Extensions
import StringExt from "../extensions/stringExt";
import Word from "../components/word";
import Subtitle from "../models/subtitle";
import SubtitlesHistory from "../components/subtitlesHistory";
import SubtitleViewer from "../components/subtitleViewer";
import TranslationsEditor from "../components/translationsEditor";
import ArabicSubtitleEditor from "../components/arabicSubtitleEditor";
import TabControl, { TabItem } from "../components/tabControl";
import AppVariables from "../AppVariables";
import VideoGenerator from "../components/videoGenerator";
import FileExt from "../extensions/fileExt";

import icon from "../assets/icon.png";
import { toast } from "sonner";

const Editor = () => {
    // Le blob de la récitation et l'url de la récitation
    const [recitationFileBlobUrl, setRecitationFileBlobUrl] =
        useState<string>("");
    const [recitationFileBlob, setRecitationFileBlob] = useState<Blob>();
    // Est-ce que l'utilisateur est en train de créé les sous titres ?
    const [hasSyncBegan, setHasSyncBegan] = useState<boolean>(false);

    // ARABIC SUBTITLES EDITOR
    // Ces 3 useStates sont ici afin que la progression de l'utilisateur PERSISTE même si il est dans une autre tab.
    // Le verset qui est actuellement traité par l'utilisateur dans l'éditeur arabe
    const [currentVerse, setCurrentVerse] = useState<VersePosition>(
        new VersePosition(1, 1) // sourate 1 verset 1
    );
    const [currentSelectedWordsRange, setCurrentSelectedWordsRange] = useState<
        [number, number]
    >([0, 0]);
    const [
        previousSelectedWordIndexInVerse,
        setPreviousSelectedWordIndexInVerse,
    ] = useState<number>(1);

    // When user change the recitation file or the surah or verse range, reset the work
    const [triggerResetWork, setTriggerResetWork] = useState<boolean>(false);
    // TabControl : quels page de travail est affiché ?
    const [tabItems, setTabItems] = useState<TabItem[]>([
        { isShown: true, lang: "ar" }, // Par défaut l'arabe est affiché
    ]);

    // Sync useSate
    const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
    const [isOnGenerateVideoPage, setGenerateVideo] = useState<boolean>(false);

    // Est-ce que on affiche les mots arabe en phonétiques ?
    const [showTransliteration, setShowTransliteration] =
        useState<boolean>(false);

    // Position de l'audio
    const [audioPosition, setAudioPosition] = useState<number>(0);

    function beginSync() {
        if (AppVariables.Quran === undefined) {
            toast.error("Please wait for the Quran to load and try again");
            return;
        }

        setSubtitles([]);
        setGenerateVideo(false);
        setHasSyncBegan(true);
        setTriggerResetWork(!triggerResetWork);
    }

    return (
        <>
            <div className="w-screen h-screen flex flex-row">
                <div className="bg-black bg-opacity-40 flex-grow h-full flex justify-center items-center relative border-black ">
                    <>
                        {" "}
                        {hasSyncBegan ? (
                            <>
                                {isOnGenerateVideoPage && recitationFileBlob ? (
                                    <>
                                        <VideoGenerator
                                            setIsOnGenerationPage={
                                                setGenerateVideo
                                            }
                                            subtitles={subtitles}
                                            videoBlob={recitationFileBlob}
                                            videoBlobUrl={recitationFileBlobUrl}
                                        />
                                    </>
                                ) : (
                                    <div className="flex flex-col w-full h-full max-w-[full]">
                                        <TabControl
                                            tabItems={tabItems}
                                            setTabItems={setTabItems}
                                            subtitles={subtitles}
                                            setSubtitles={setSubtitles}
                                        />

                                        {/* Si on est dans la tab "Arabe" alors on affiche l'éditeur de sous-titre arabe,
        Sinon on affiche l'éditeur de sous-titre dans les autres langues */}
                                        {tabItems.find(
                                            (x) => x.isShown && x.lang === "ar"
                                        ) ? (
                                            <ArabicSubtitleEditor
                                                audioPosition={audioPosition}
                                                setAudioPosition={
                                                    setAudioPosition
                                                }
                                                setRecitationFileBlobUrl={
                                                    setRecitationFileBlobUrl
                                                }
                                                recitationFileBlob={
                                                    recitationFileBlob
                                                }
                                                setRecitationFileBlob={
                                                    setRecitationFileBlob
                                                }
                                                currentVerse={currentVerse}
                                                setCurrentVerse={
                                                    setCurrentVerse
                                                }
                                                setSubtitles={setSubtitles}
                                                subtitles={subtitles}
                                                recitationFile={
                                                    recitationFileBlobUrl
                                                }
                                                triggerResetWork={
                                                    triggerResetWork
                                                }
                                                setCurrentSelectedWordsRange={
                                                    setCurrentSelectedWordsRange
                                                }
                                                currentSelectedWordsRange={
                                                    currentSelectedWordsRange
                                                }
                                                setPreviousSelectedWordIndexInVerse={
                                                    setPreviousSelectedWordIndexInVerse
                                                }
                                                previousSelectedWordIndexInVerse={
                                                    previousSelectedWordIndexInVerse
                                                }
                                                showTransliteration={
                                                    showTransliteration
                                                }
                                                setShowTransliteration={
                                                    setShowTransliteration
                                                }
                                                setGenerateVideo={
                                                    setGenerateVideo
                                                }
                                            />
                                        ) : (
                                            <div className="w-full h-[95vh]">
                                                <TranslationsEditor
                                                    setSubtitles={setSubtitles}
                                                    subtitles={subtitles}
                                                    lang={
                                                        tabItems.find(
                                                            (x) => x.isShown
                                                        )?.lang!
                                                    }
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="h-full w-42 md:w-96 border-l-2 border-black hidden lg:block">
                                    <SubtitlesHistory
                                        recitationFile={recitationFileBlob}
                                        subtitles={subtitles}
                                        setGenerateVideo={setGenerateVideo}
                                        isOnGenerateVideoPage={
                                            isOnGenerateVideoPage
                                        }
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col justify-center items-center">
                                <h1
                                    className="text-4xl md:text-5xl text-center font-bold select-none cursor-default text-white bg-black py-5 pb-7 px-5 md:px-8 rounded-full bg-opacity-30  "
                                    style={{
                                        textShadow:
                                            "0 10px 20px hsla(0,10%,0%,.9)",
                                    }}>
                                    Quran Caption
                                </h1>
                                <p className="mt-2 text-white font-bold text-sm">
                                    Creating Quranic videos has never been
                                    easier.
                                </p>
                                <img
                                    src={icon}
                                    className="w-28 lg:w-96 md:w-48 duration-150 select-none"
                                />
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 w-58 md:w-96 mb-8 md:mb-16 lg:mb-34 text-white font-bold py-2 px-6 rounded text-xl duration-75 mt-2 shadow-lg shadow-black leading-10"
                                    onClick={() => {
                                        if (recitationFileBlobUrl !== "")
                                            beginSync();
                                    }}>
                                    <div
                                        className="relative"
                                        onClick={() => {
                                            // Analytics
                                            fetch(
                                                "https://www.rayanestaszewski.fr/api/software/software-being-used?softwareName=Quran Video Maker&detail=" +
                                                    "It is being used !! Yay !!",
                                                {
                                                    method: "POST",
                                                }
                                            );
                                            beginSync();
                                        }}>
                                        {/* <input
                                            type="file"
                                            accept=".mp4, .ogv, .webm, .wav, .mp3, .ogg, .mpeg, .avi, .wmv"
                                            onChange={handleFileUpload}
                                            className="opacity-0 absolute z-40 -left-10 -top-5 -bottom-5 -right-10 cursor-pointer"
                                        /> */}
                                        <p>Access the editor</p>
                                    </div>
                                </button>
                                <p className="text-white text-center">
                                    Support my projects and help me continue
                                    creating amazing content for you! <br />
                                    Your contribution makes a big difference.
                                </p>{" "}
                                <a
                                    href="https://www.buymeacoffee.com/zonetecde"
                                    target="_blank"
                                    className="-mt-3">
                                    <img
                                        src="https://cdn.buymeacoffee.com/buttons/v2/arial-violet.png"
                                        alt="Buy Me A Coffee"
                                        className="max-h-[50px] mt-5"
                                    />
                                </a>
                                <footer className="absolute bottom-5 left-0 right-0 text-white text-center">
                                    <a
                                        href="https://github.com/zonetecde"
                                        target="_blank"
                                        className="underline">
                                        Rayane Staszewski
                                    </a>
                                    <br />
                                    Copyright © 2023. All Rights Reserved.
                                </footer>
                            </div>
                        )}
                    </>
                </div>
            </div>
        </>
    );
};

export default Editor;
