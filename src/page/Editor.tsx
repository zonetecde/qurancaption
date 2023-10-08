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

  function beginSync() {
    setSubtitles([]);
    setGenerateVideo(false);
    setHasSyncBegan(true);
    setTriggerResetWork(!triggerResetWork);
  }

  function handleFileUpload(event: any): void {
    FileExt.handleFileUpload(
      event,
      setRecitationFileBlob,
      setRecitationFileBlobUrl
    );

    beginSync();
  }

  return (
    <>
      <div className="w-screen h-screen flex flex-row">
        <div className="bg-black bg-opacity-40 flex-grow h-full flex justify-center items-center relative border-black">
          <>
            {" "}
            {hasSyncBegan ? (
              <>
                {isOnGenerateVideoPage && recitationFileBlob ? (
                  <>
                    <VideoGenerator
                      setIsOnGenerationPage={setGenerateVideo}
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
                    {tabItems.find((x) => x.isShown && x.lang === "ar") ? (
                      <ArabicSubtitleEditor
                        setRecitationFileBlobUrl={setRecitationFileBlobUrl}
                        setRecitationFileBlob={setRecitationFileBlob}
                        currentVerse={currentVerse}
                        setCurrentVerse={setCurrentVerse}
                        setSubtitles={setSubtitles}
                        subtitles={subtitles}
                        recitationFile={recitationFileBlobUrl}
                        triggerResetWork={triggerResetWork}
                        setCurrentSelectedWordsRange={
                          setCurrentSelectedWordsRange
                        }
                        currentSelectedWordsRange={currentSelectedWordsRange}
                        setPreviousSelectedWordIndexInVerse={
                          setPreviousSelectedWordIndexInVerse
                        }
                        previousSelectedWordIndexInVerse={
                          previousSelectedWordIndexInVerse
                        }
                      />
                    ) : (
                      <div className="w-full h-[95vh]">
                        <TranslationsEditor
                          setSubtitles={setSubtitles}
                          subtitles={subtitles}
                          lang={tabItems.find((x) => x.isShown)?.lang!}
                        />
                      </div>
                    )}
                  </div>
                )}
                <div className="h-full w-42 md:w-96 border-l-2 border-black">
                  <SubtitlesHistory
                    subtitles={subtitles}
                    setGenerateVideo={setGenerateVideo}
                    isOnGenerateVideoPage={isOnGenerateVideoPage}
                  />
                </div>
              </>
            ) : (
              <button
                className="bg-blue-500 hover:bg-blue-700 w-96 mb-32 text-white font-bold py-2 px-6 rounded text-xl duration-75 mt-12 shadow-lg shadow-black leading-10"
                onClick={() => {
                  if (recitationFileBlobUrl !== "") beginSync();
                }}
              >
                <div className="relative">
                  <input
                    type="file"
                    accept=".mp4, .ogv, .webm, .wav, .mp3, .ogg, .mpeg, .avi, .wmv"
                    onChange={handleFileUpload}
                    className="max-w-[400px] opacity-0 absolute z-40"
                  />
                  <p>Select a recitation file</p>
                </div>
              </button>
            )}
          </>
        </div>
      </div>
    </>
  );
};

export default Editor;
