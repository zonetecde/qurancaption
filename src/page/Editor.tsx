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
import software from "../assets/software.png";
import { toast } from "sonner";

import video from "../assets/Al-Ahzab_56.mp4";
import sky from "../assets/sky.png";
import MobileDetect from "mobile-detect";
import { Toaster } from "sonner";

const Editor = () => {
    const md = new MobileDetect(window.navigator.userAgent);

    useEffect(() => {
        // Load the Quran
        //@ts-ignore
        kofiWidgetOverlay.draw("zonetecde", {
            type: "floating-chat",
            "floating-chat.donateButton.text": "Support me",
            "floating-chat.donateButton.background-color": "#794bc4",
            "floating-chat.donateButton.text-color": "#fff",
        });
    }, []);

    // Le blob de la récitation et l'url de la récitation
    const [recitationFileBlobUrl, setRecitationFileBlobUrl] = useState<string>("");
    const [recitationFileBlob, setRecitationFileBlob] = useState<Blob>();
    // Est-ce que l'utilisateur est en train de créé les sous titres ?
    const [hasSyncBegan, setHasSyncBegan] = useState<boolean>(false);

    // ARABIC SUBTITLES EDITOR
    // Ces 3 useStates sont ici afin que la progression de l'utilisateur PERSISTE même si il est dans une autre tab.
    // Le verset qui est actuellement traité par l'utilisateur dans l'éditeur arabe
    const [currentVerse, setCurrentVerse] = useState<VersePosition>(
        new VersePosition(1, 1) // sourate 1 verset 1
    );
    const [currentSelectedWordsRange, setCurrentSelectedWordsRange] = useState<[number, number]>([0, 0]);
    const [previousSelectedWordIndexInVerse, setPreviousSelectedWordIndexInVerse] = useState<number>(1);

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
    const [showTransliteration, setShowTransliteration] = useState<boolean>(false);

    // Position de l'audio
    const [audioPosition, setAudioPosition] = useState<number>(0);

    function beginSync() {
        if (AppVariables.Quran === undefined) {
            toast.error("Please wait for the Quran to load and try again");
            return;
        }

        toast("Quran Caption is no longer maintained. The video generator will not work. You can still use the subtitle editor and generator.");

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
                                {md.mobile() ? (
                                    <>
                                        <div className="w-full h-full text-green-200 flex justify-center pb-10 items-center pt-6 flex-col px-3 text-center ">
                                            <img src={sky} className="absolute top-0 left-0 right-0 bg-cover" />
                                            <div className="z-50">
                                                <p className="text-4xl -mt-16">Sorry :(</p>
                                                <p className="mt-5">QuranCaption is not supported on mobile devices</p>
                                                <p>Please use a desktop computer to start captioning !</p>
                                                <video src={video} className="mt-10" autoPlay controls></video>
                                            </div>

                                            <footer className="absolute bottom-5">
                                                <a href="https://github.com/zonetecde" target="_blank" className="underline">
                                                    Rayane Staszewski
                                                </a>
                                            </footer>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {isOnGenerateVideoPage && recitationFileBlob ? (
                                            <>
                                                <VideoGenerator setIsOnGenerationPage={setGenerateVideo} subtitles={subtitles} videoBlob={recitationFileBlob} videoBlobUrl={recitationFileBlobUrl} />
                                            </>
                                        ) : (
                                            <div className="flex flex-col w-full h-full max-w-[full]">
                                                <TabControl tabItems={tabItems} setTabItems={setTabItems} subtitles={subtitles} setSubtitles={setSubtitles} />

                                                {/* Si on est dans la tab "Arabe" alors on affiche l'éditeur de sous-titre arabe,
        Sinon on affiche l'éditeur de sous-titre dans les autres langues */}
                                                {tabItems.find((x) => x.isShown && x.lang === "ar") ? (
                                                    <ArabicSubtitleEditor
                                                        audioPosition={audioPosition}
                                                        setAudioPosition={setAudioPosition}
                                                        setRecitationFileBlobUrl={setRecitationFileBlobUrl}
                                                        recitationFileBlob={recitationFileBlob}
                                                        setRecitationFileBlob={setRecitationFileBlob}
                                                        currentVerse={currentVerse}
                                                        setCurrentVerse={setCurrentVerse}
                                                        setSubtitles={setSubtitles}
                                                        subtitles={subtitles}
                                                        recitationFile={recitationFileBlobUrl}
                                                        triggerResetWork={triggerResetWork}
                                                        setCurrentSelectedWordsRange={setCurrentSelectedWordsRange}
                                                        currentSelectedWordsRange={currentSelectedWordsRange}
                                                        setPreviousSelectedWordIndexInVerse={setPreviousSelectedWordIndexInVerse}
                                                        previousSelectedWordIndexInVerse={previousSelectedWordIndexInVerse}
                                                        showTransliteration={showTransliteration}
                                                        setShowTransliteration={setShowTransliteration}
                                                        setGenerateVideo={setGenerateVideo}
                                                    />
                                                ) : (
                                                    <div className="w-full h-[95vh]">
                                                        <TranslationsEditor setSubtitles={setSubtitles} subtitles={subtitles} lang={tabItems.find((x) => x.isShown)?.lang!} />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <div className="h-full w-42 md:w-96 border-l-2 border-black hidden lg:block">
                                            <SubtitlesHistory recitationFile={recitationFileBlob} subtitles={subtitles} setGenerateVideo={setGenerateVideo} isOnGenerateVideoPage={isOnGenerateVideoPage} />
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col justify-center items-center">
                                <h1
                                    className="text-4xl md:text-5xl text-center font-bold select-none cursor-default text-white bg-black py-5 pb-7 px-5 md:px-8 rounded-full bg-opacity-30  "
                                    style={{
                                        textShadow: "0 10px 20px hsla(0,10%,0%,.9)",
                                    }}>
                                    Quran Caption 2
                                </h1>
                                <p className="mt-2 text-white font-bold text-sm">Creating Quranic videos has never been easier.</p>
                                <img src={software} className="w-6/12 lg:w-5/12 my-5 duration-150 select-none" />
                                <div className="grid grid-cols-2 gap-x-3 px-4">
                                    <a
                                        href="https://github.com/zonetecde/QuranCaption-2/releases/latest"
                                        className="bg-blue-500 text-center hover:bg-blue-700 w-58 md:w-68 mb-2 md:mb4 lg:mb-34 text-white font-bold py-2 px-6 rounded text-lg md:text-xl duration-75 mt-2 shadow-lg shadow-black leading-6">
                                        <div className="flex items-center justify-center h-full">
                                            <p>Download Quran Caption 2</p>
                                        </div>
                                    </a>
                                    <a
                                        href="https://github.com/zonetecde/QuranCaption-2"
                                        className="bg-blue-500 text-center hover:bg-blue-700 w-58 md:w-68 mb-2 md:mb4 lg:mb-34 text-white font-bold py-2 px-6 rounded  text-lg md:text-xl duration-75 mt-2 shadow-lg shadow-black leading-6">
                                        <div className="flex items-center justify-center h-full">
                                            <p>Project's GitHub Page</p>
                                        </div>
                                    </a>
                                </div>
                                <p className="text-white">or</p>
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 w-58 md:w-96 mb-8 md:mb-16 lg:mb-34 text-white font-bold py-2 px-6 rounded text-xl duration-75 shadow-lg shadow-black leading-10 scale-75"
                                    onClick={() => {
                                        if (recitationFileBlobUrl !== "") beginSync();
                                    }}>
                                    <div
                                        className="relative"
                                        onClick={() => {
                                            beginSync();
                                        }}>
                                        {/* <input
                                            type="file"
                                            accept=".mp4, .ogv, .webm, .wav, .mp3, .ogg, .mpeg, .avi, .wmv"
                                            onChange={handleFileUpload}
                                            className="opacity-0 absolute z-40 -left-10 -top-5 -bottom-5 -right-10 cursor-pointer"
                                        /> */}
                                        <p>Access the online editor</p>
                                    </div>
                                </button>
                                <p className="text-white text-center">
                                    Support my projects and help me continue creating amazing content for you! <br />
                                    Your contribution makes a big difference.
                                </p>{" "}
                                <footer className="absolute bottom-5 left-0 right-0 text-white text-center">
                                    <a href="https://github.com/zonetecde" target="_blank" className="underline">
                                        Rayane Staszewski
                                    </a>
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
