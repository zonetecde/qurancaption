import React, { useEffect, useMemo, useRef, useState } from "react";
import { Surah, Verse } from "../api/quran";
import ReactAudioPlayer from "react-audio-player";

// Extensions
import StringExt from "../extensions/stringExt";
import Word from "../components/word";
import Subtitle from "../models/subtitle";
import SubtitlesHistory from "../components/subtitlesHistory";
import TimeExt from "../extensions/timeExt";
import SubtitleViewer from "../components/subtitleViewer";

interface Props {
  recitationFile: string;
  Quran: Surah[];
}

/**
 * APpuie sur espace : resume l'audio
 * appuie une deuxieme fois sur espace : stop l'audio
 * fleche haut et bas : selectionne le texte qui vient d'etre lu
 * fleche gauche et droite : revenir en arrière/avant audio
 * espace pour resume et continuer
 */

const Editor = (props: Props) => {
  // La position de la sourate sélectionné. 1 = Al-Fatiha, 114 = An-Nass
  const [selectedSurahPosition, setSelectedSurahPosition] = useState<number>(1);
  // Les versets de la récitation uploadé, par défaut Al-Fatiha de 1 à 7 (set dans useEffect)
  const [selectedVerses, setSelectedVerses] = useState<Verse[]>([]);

  const [hasSyncBegan, setHasSyncBegan] = useState<boolean>(false);

  // Sync useSate
  const [currentVerse, setCurrentVerse] = useState<number>(0); // Index - 1
  const [currentSelectedWordsRange, setCurrentSelectedWordsRange] = useState<
    [number, number]
  >([0, 1]);
  const [
    previousSelectedWordIndexInVerse,
    setPreviousSelectedWordIndexInVerse,
  ] = useState<number>(1);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [subtitleFileText, setSubtitleFileText] = useState<string>("");
  const [didSyncEnded, setDidSyncEnded] = useState<boolean>(false);

  // Ref
  const audioPlayerRef = React.useRef<ReactAudioPlayer>(null);
  const fromVerseInputRef = React.useRef<HTMLInputElement>(null);
  const toVerseInputRef = React.useRef<HTMLInputElement>(null);

  function getCurrentAudioPlayerTime(): number {
    return audioPlayerRef.current?.audioEl.current?.currentTime ?? -1;
  }

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
    setCurrentVerse(0);
    setCurrentSelectedWordsRange([0, 0]); // Le premier mot uniquement est sélectionné
    setPreviousSelectedWordIndexInVerse(1);
    setSubtitles([]);
    setDidSyncEnded(false);
    setSubtitleFileText("");
    setHasSyncBegan(true);
  }

  function lastSubtitleEndTime(subtitles: Subtitle[]): number {
    return subtitles.length > 0 ? subtitles[subtitles.length - 1]?.endTime : 0;
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (hasSyncBegan && subtitleFileText === "") {
        // Resume/Pause recitation
        switch (e.key) {
          case " ":
            if (audioPlayerRef.current?.audioEl.current?.paused) {
              audioPlayerRef.current?.audioEl.current?.play();
            } else {
              audioPlayerRef.current?.audioEl.current?.pause();
            }
            break;

          case "ArrowLeft":
            // Reculer de 2 secondes
            if (audioPlayerRef.current?.audioEl.current) {
              audioPlayerRef.current.audioEl.current.currentTime -= 2;
            }
            break;

          case "ArrowRight":
            // Avancer de deux secondes
            if (audioPlayerRef.current?.audioEl.current) {
              audioPlayerRef.current.audioEl.current.currentTime += 2;
            }
            break;

          case "ArrowUp":
            // On vérifie qu'on ne sélectionne pas un mot en dehors des limites du verset
            if (
              currentSelectedWordsRange[1] <
              selectedVerses[currentVerse].text.split(" ").length - 1
            ) {
              // Sélectionne le mot suivant
              setCurrentSelectedWordsRange([
                currentSelectedWordsRange[0],
                currentSelectedWordsRange[1] + 1,
              ]);
            } else {
              // Dans ce cas on va au verset suivant
              setCurrentVerse(currentVerse + 1);
              setCurrentSelectedWordsRange([0, 0]);
            }
            break;

          case "ArrowDown":
            // On vérifie qu'on ne sélectionne pas un mot négatif
            if (
              currentSelectedWordsRange[1] >=
              currentSelectedWordsRange[0] + 1
            ) {
              // Revient sur le mot précédent
              setCurrentSelectedWordsRange([
                currentSelectedWordsRange[0],
                currentSelectedWordsRange[1] - 1,
              ]);

              console.log(currentSelectedWordsRange);
            } else if (currentSelectedWordsRange[0] > 0) {
              // Change la born min (= le réciteur se répète)
              setCurrentSelectedWordsRange([
                currentSelectedWordsRange[0] - 1,
                currentSelectedWordsRange[1],
              ]);
              //setPreviousSelectedWordIndexInVerse(currentSelectedWordsRange[0] - 1)
            } else {
              // On sélectionne un mot en dehors des ranges du verset,
              // càd on retourne au verset précédent
              if (currentVerse > 0) {
                setCurrentVerse(currentVerse - 1);
                const previousVerseLength =
                  selectedVerses[currentVerse - 1].text.split(" ").length;
                console.log(previousVerseLength);

                setCurrentSelectedWordsRange([
                  previousVerseLength - 1,
                  previousVerseLength - 1,
                ]);
                setPreviousSelectedWordIndexInVerse(previousVerseLength - 2);
              }
            }
            break;

          case "a":
            // Add أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ

            setSubtitles([
              ...subtitles,
              new Subtitle(
                subtitles.length + 1,
                -1,
                currentSelectedWordsRange[0],
                currentSelectedWordsRange[1],
                lastSubtitleEndTime(subtitles),
                getCurrentAudioPlayerTime(),
                "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ"
              ),
            ]);
            break;
          case "b":
            // Add the basmala

            setSubtitles([
              ...subtitles,
              new Subtitle(
                subtitles.length + 1,
                -1,
                currentSelectedWordsRange[0],
                currentSelectedWordsRange[1],
                lastSubtitleEndTime(subtitles),
                getCurrentAudioPlayerTime(),
                "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
              ),
            ]);
            break;

          case "Backspace":
            // enlève le dernier sous titre ajouté
            if (subtitles.length >= 1) {
              setSubtitles(subtitles.slice(0, subtitles.length - 1));

              // > 1 car la length n'est pas actualisé après son set
              if (subtitles.length > 1) {
                console.log(subtitles);
                setCurrentSelectedWordsRange([
                  subtitles[subtitles.length - 1].toWordIndex,
                  subtitles[subtitles.length - 1].toWordIndex,
                ]);
              } else {
                // Si on a aucun sous-titre on remet au tout début du verset
                setCurrentSelectedWordsRange([0, 0]);
              }
            }
            break;

          case "s":
            // Du dernier temps jusqu'à maintenant un silence
            setSubtitles([
              ...subtitles,
              new Subtitle(
                subtitles.length + 1,
                -1,
                currentSelectedWordsRange[0],
                currentSelectedWordsRange[1],
                lastSubtitleEndTime(subtitles),
                getCurrentAudioPlayerTime(),
                ""
              ),
            ]);
            break;
          case "Enter":
            if (!didSyncEnded) {
              // Valide la séléction pour le temps acctuel
              setSubtitles([
                ...subtitles,
                new Subtitle(
                  subtitles.length + 1,
                  selectedVerses[currentVerse].id,
                  currentSelectedWordsRange[0],
                  currentSelectedWordsRange[1],
                  lastSubtitleEndTime(subtitles),
                  getCurrentAudioPlayerTime(),
                  selectedVerses[currentVerse].text
                    .split(" ")
                    .slice(
                      currentSelectedWordsRange[0],
                      currentSelectedWordsRange[1] + 1
                    )
                    .join(" ")
                ),
              ]);

              // Si pas tout les mots du versets en cours ont été séléctionnés,
              if (
                currentSelectedWordsRange[1] <
                selectedVerses[currentVerse].text.split(" ").length - 1
              ) {
                setPreviousSelectedWordIndexInVerse(
                  currentSelectedWordsRange[1] + 2
                );
                setCurrentSelectedWordsRange([
                  currentSelectedWordsRange[1] + 1,
                  currentSelectedWordsRange[1] + 1,
                ]);
              } else {
                if (selectedVerses.length > currentVerse + 1) {
                  // verset suivant
                  setCurrentVerse(currentVerse + 1);
                  setCurrentSelectedWordsRange([0, 0]);
                  setPreviousSelectedWordIndexInVerse(1);
                } else {
                  // Fin
                  setDidSyncEnded(true);
                }
              }
            }
            break;
          default:
            break;
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    // Don't forget to clean up
    return function cleanup() {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    hasSyncBegan,
    audioPlayerRef,
    currentSelectedWordsRange,
    previousSelectedWordIndexInVerse,
    currentVerse,
    subtitleFileText,
    subtitles,
  ]);

  /**
   * L'utilisateur a appuyé sur le bouton pour ajouter
   * une traduction
   */
  function addTranslation(): void {}

  return (
    <div className="w-screen h-screen flex flex-row">
      <div className="bg-black bg-opacity-25 h-full w-[30%] text-white flex justify-start items-center flex-col">
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
      </div>
      <div className="bg-black bg-opacity-40 flex-grow h-full flex justify-center items-center relative">
        {hasSyncBegan ? (
          <div className="w-full h-full bg-black bg-opacity-30 flex items-center justify-center flex-row">
            <div className="flex flex-col w-full h-full">
              <div className="flex flex-row-reverse ml-auto flex-wrap self-end mt-auto mr-5 overflow-y-auto">
                {selectedVerses[currentVerse].text
                  .split(" ")
                  .map((word, index) => (
                    <Word
                      word={word}
                      key={index}
                      isSelected={
                        !didSyncEnded &&
                        currentSelectedWordsRange[0] <= index &&
                        currentSelectedWordsRange[1] >= index
                      }
                      wordClickedAction={() => {
                        // Lorsqu'on clique sur un mot on change la born min
                        // = le récitateur se répète
                        // c'est surtout fait pour corriger un appuie d'arrowdown en trop
                        if (index <= currentSelectedWordsRange[1]) {
                          setCurrentSelectedWordsRange([
                            index,
                            currentSelectedWordsRange[1],
                          ]);
                        } else {
                          // Sinon on sélectionne jusqu'à ce mot
                          setCurrentSelectedWordsRange([
                            currentSelectedWordsRange[0],
                            index,
                          ]);
                        }
                      }}
                    />
                  ))}
              </div>

              <ul className="mt-auto text-white text-opacity-10 hover:text-opacity-60 duration-200 ml-6 list-disc text-sm">
                <li>Press space to pause/resume the audio</li>
                <li>Use the up and down arrow keys to select words</li>
                <li>
                  Use the left and right arrow to navigate the audio player
                  forward or backward by 2 seconds
                </li>
                <li>Press S to add a silence</li>
                <li>Press B to add a basmala</li>
                <li>Press A to add the isti3adha</li>
                <li>Press backspace to remove the last added subtitles</li>
              </ul>

              <ReactAudioPlayer
                ref={audioPlayerRef}
                src={props.recitationFile}
                controls
                className="w-10/12 self-center pb-10 pt-5"
              />
            </div>

            <div className="h-full bg-black bg-opacity-30 w-42 md:w-96">
              <SubtitlesHistory
                addTranslation={addTranslation}
                subtitles={subtitles}
                setSubtitleText={setSubtitleFileText}
              />
            </div>

            {subtitleFileText !== "" && (
              <SubtitleViewer
                subtitleText={subtitleFileText}
                setSubtitleText={setSubtitleFileText}
                subtitleFileName={
                  props.Quran[selectedSurahPosition - 1].transliteration +
                  " " +
                  selectedVerses[0].id +
                  "-" +
                  selectedVerses[selectedVerses.length - 1].id +
                  ".srt"
                }
              />
            )}
          </div>
        ) : (
          <button
            className="bg-blue-500 hover:bg-blue-700 w-96 mb-32 text-white font-bold py-2 px-6 rounded text-xl duration-75 mt-12 shadow-lg shadow-black leading-10"
            onClick={() => {
              beginSync();
            }}
          >
            {selectedVerses.length > 0 ? (
              <p>
                Start with surah{" "}
                {props.Quran[selectedSurahPosition - 1].transliteration} from
                verse :
                <br />
                <span className="arabic text-2xl ">
                  {selectedVerses !== undefined &&
                    StringExt.ReduceString(selectedVerses[0].text)}
                </span>
                <br />
                to verse :<br />
                <span className="arabic text-2xl">
                  {selectedVerses !== undefined &&
                    StringExt.ReduceString(
                      selectedVerses[selectedVerses.length - 1].text
                    )}
                </span>
              </p>
            ) : (
              <p>Wrong 'from verse' and 'to verse' input values</p>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default Editor;
