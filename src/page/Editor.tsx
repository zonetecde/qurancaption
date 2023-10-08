import React, { useEffect, useMemo, useRef, useState } from "react";
import { Surah, Verse } from "../api/quran";
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
import VideoGenerator from "./VideoGenerator";

interface Props {
  Quran: Surah[];
}

const Editor = (props: Props) => {
  // La position de la sourate sélectionné. 1 = Al-Fatiha, 114 = An-Nass
  const [selectedSurahPosition, setSelectedSurahPosition] = useState<number>(1);
  // Les versets de la récitation uploadé, par défaut Al-Fatiha de 1 à 7 (set dans useEffect)
  const [selectedVerses, setSelectedVerses] = useState<Verse[]>([]);
  // Le blob de la récitation et l'url de la récitation
  const [recitationFileBlobUrl, setRecitationFileBlobUrl] =
    useState<string>("");
  const [recitationFileBlob, setRecitationFileBlob] = useState<Blob>();
  // Est-ce que l'utilisateur est en train de créé les sous titres ?
  const [hasSyncBegan, setHasSyncBegan] = useState<boolean>(false);

  // ARABIC SUBTITLES EDITOR
  // Ces 3 useStates sont ici afin que la progression de l'utilisateur PERSISTE même si il est dans une autre tab.
  // Le verset qui est actuellement traité par l'utilisateur dans l'éditeur arabe
  const [currentVerse, setCurrentVerse] = useState<number>(0); // Index - 1
  const [currentSelectedWordsRange, setCurrentSelectedWordsRange] = useState<
    [number, number]
  >([0, 1]);
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

  // Ref
  const fromVerseInputRef = React.useRef<HTMLInputElement>(null);
  const toVerseInputRef = React.useRef<HTMLInputElement>(null);

  /**
   * Appelé au premier chargement de la page
   * Sélectionne les versets de la récitation par défaut (AL-Fatiha)
   * Note: je ne met pas ceci dans le constructeur de selectedVerses
   * car ça ne fonctionne pas
   */
  let firstLoad = useRef(true);

  useEffect(() => {
    if (props.Quran && firstLoad.current) {
      firstLoad.current = false;
      setSelectedVerses(props.Quran[0].verses);
    }
  }, []);

  /**
   * Take the selected recitation file of the user and transform it into a JS blob
   * @param event
   * @returns
   */
  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    const { type } = file;

    const reader = new FileReader();

    reader.onload = async (e) => {
      const audioData = e.target?.result as ArrayBuffer;

      if (!audioData) return;

      const audioBlob = new Blob([audioData], { type });
      setRecitationFileBlobUrl(URL.createObjectURL(audioBlob));
      setRecitationFileBlob(audioBlob);
    };

    reader.readAsArrayBuffer(file);
  }

  /**
   * Updates the selected verses based on the provided input values.
   * Called when the user changes the 'from verse' or 'to verse' input
   */
  function updateSelectedVerses() {
    setSelectedVerses(
      props.Quran[selectedSurahPosition - 1].verses.slice(
        Number(fromVerseInputRef.current?.value) - 1,
        Number(toVerseInputRef.current?.value)
      )
    );

    setHasSyncBegan(false);
  }

  /**
   * Après avoir sélectionner une sourate, on met à jour les versets
   * sélectionnés (en l'occurence du premier au dernier car à chaque
   * fois qu'on sélectionne une sourate les inputs changent)
   */
  useMemo(() => {
    updateSelectedVerses();
    setHasSyncBegan(false);
  }, [selectedSurahPosition]);

  function beginSync() {
    setSubtitles([]);
    setGenerateVideo(false);
    setHasSyncBegan(true);
    setTriggerResetWork(!triggerResetWork);
  }

  return (
    <>
      {isOnGenerateVideoPage && recitationFileBlob ? (
        <>
          <VideoGenerator
            subtitles={subtitles}
            videoBlob={recitationFileBlob}
          />
        </>
      ) : (
        <div className="w-screen h-screen flex flex-row">
          {hasSyncBegan === false && (
            <div className="bg-black bg-opacity-25 h-full w-[30%] max-w-[350px] text-white flex justify-start items-center flex-col">
              <p className="mt-3 text-xl">Surah</p>
              <select
                name="surahs"
                id="surahs"
                className="h-8 w-5/6 text-black outline-none mt-3 px-1 "
                defaultValue={selectedSurahPosition - 1}
                onChange={(e) => {
                  /**
                   * On change surah
                   */
                  const selectedSurahPosition = Number(e.target.value);

                  if (fromVerseInputRef.current && toVerseInputRef.current) {
                    // Update les deux bornes pour qu'elles correspondent
                    // à celle de la sourate sélectionné
                    fromVerseInputRef.current.value = "1";
                    toVerseInputRef.current.value = String(
                      props.Quran[selectedSurahPosition - 1].total_verses
                    );
                  }

                  setSelectedSurahPosition(selectedSurahPosition);
                }}
              >
                {props.Quran.map((surah) => {
                  return (
                    <option key={surah.id} value={surah.id}>
                      {surah.id +
                        ". " +
                        surah.transliteration +
                        " (" +
                        surah.translation +
                        ")"}
                    </option>
                  );
                })}
              </select>
              <div className="flex flex-row w-full px-3 relative mt-5">
                <p className="mt-3 text-lg">From verse : </p>
                <input
                  type="number"
                  name="verse-begin"
                  id="verse-begin"
                  min={1}
                  defaultValue={1}
                  max={props.Quran[selectedSurahPosition - 1].total_verses}
                  className="h-8 w-[60px] ml-2 bg-slate-400 text-black outline-none mt-3 pl-1"
                  ref={fromVerseInputRef}
                  onChange={updateSelectedVerses}
                />
              </div>
              <p className="w-full pl-3 opacity-40"></p>
              <div className="flex flex-row w-full px-3 relative">
                <p className="mt-3 text-lg">To verse : </p>
                <input
                  type="number"
                  name="verse-begin"
                  id="verse-begin"
                  min={1}
                  defaultValue={7}
                  max={props.Quran[selectedSurahPosition - 1].total_verses}
                  className="h-8 w-[60px] ml-[31px] bg-slate-400 text-black outline-none mt-3 pl-1"
                  ref={toVerseInputRef}
                  onChange={updateSelectedVerses}
                />
              </div>

              <div className="mt-10 w-full pl-3 flex flex-col">
                <p className="">{"Recitation file (audio or video) :"}</p>

                <input
                  type="file"
                  accept=".mp4, .ogv, .webm, .wav, .mp3, .ogg, .mpeg, .avi, .wmv"
                  onChange={handleFileUpload}
                  className="max-w-[400px]"
                />
              </div>
            </div>
          )}

          <div className="bg-black bg-opacity-40 flex-grow h-full flex justify-center items-center relative border-black">
            {hasSyncBegan ? (
              <>
                <div className="flex flex-col w-full h-full max-w-[full]">
                  <TabControl
                    tabItems={tabItems}
                    setTabItems={setTabItems}
                    surahName={props.Quran[selectedSurahPosition - 1].name}
                    selectedVerses={selectedVerses}
                    subtitles={subtitles}
                    setSubtitles={setSubtitles}
                  />

                  {/* Si on est dans la tab "Arabe" alors on affiche l'éditeur de sous-titre arabe,
        Sinon on affiche l'éditeur de sous-titre dans les autres langues */}
                  {tabItems.find((x) => x.isShown && x.lang === "ar") ? (
                    <ArabicSubtitleEditor
                      Quran={props.Quran}
                      currentVerse={currentVerse}
                      setCurrentVerse={setCurrentVerse}
                      setSubtitles={setSubtitles}
                      selectedVerses={selectedVerses}
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
                <div className="h-full w-42 md:w-96 border-l-2 border-black">
                  <SubtitlesHistory
                    subtitles={subtitles}
                    setGenerateVideo={setGenerateVideo}
                  />
                </div>
              </>
            ) : (
              <button
                className="bg-blue-500 hover:bg-blue-700 w-96 mb-32 text-white font-bold py-2 px-6 rounded text-xl duration-75 mt-12 shadow-lg shadow-black leading-10"
                onClick={() => {
                  if (selectedVerses.length > 0 && recitationFileBlobUrl !== "")
                    beginSync();
                }}
              >
                {selectedVerses.length > 0 && recitationFileBlobUrl !== "" ? (
                  <p>
                    Start with surah{" "}
                    {props.Quran[selectedSurahPosition - 1].transliteration}{" "}
                    from verse :
                    <br />
                    <span className="arabic text-2xl font-normal">
                      {selectedVerses !== undefined &&
                        StringExt.ReduceString(selectedVerses[0].text)}
                    </span>
                    <br />
                    to verse :<br />
                    <span className="arabic text-2xl font-normal">
                      {selectedVerses !== undefined &&
                        StringExt.ReduceString(
                          selectedVerses[selectedVerses.length - 1].text
                        )}
                    </span>
                  </p>
                ) : (
                  <p>
                    {recitationFileBlobUrl === ""
                      ? "Please select a recitation file"
                      : "Wrong 'from verse' and 'to verse' input values"}
                  </p>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Editor;
