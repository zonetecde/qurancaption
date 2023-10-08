import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactAudioPlayer from "react-audio-player";
import Word from "./word";
import { Surah, Verse } from "../api/quran";
import Subtitle from "../models/subtitle";

interface Props {
  Quran: Surah[];

  selectedVerses: Verse[];
  setSubtitles: React.Dispatch<React.SetStateAction<Subtitle[]>>;
  subtitles: Subtitle[];
  recitationFile: string;

  triggerResetWork: boolean;

  setCurrentVerse: React.Dispatch<React.SetStateAction<number>>;
  currentVerse: number;

  currentSelectedWordsRange: [number, number];
  setCurrentSelectedWordsRange: React.Dispatch<
    React.SetStateAction<[number, number]>
  >;

  previousSelectedWordIndexInVerse: number;
  setPreviousSelectedWordIndexInVerse: React.Dispatch<
    React.SetStateAction<number>
  >;
}

const ArabicSubtitleEditor = (props: Props) => {
  const audioPlayerRef = React.useRef<ReactAudioPlayer>(null);

  function getCurrentAudioPlayerTime(): number {
    return audioPlayerRef.current?.audioEl.current?.currentTime ?? -1;
  }

  function lastSubtitleEndTime(subtitles: Subtitle[]): number {
    return subtitles.length > 0 ? subtitles[subtitles.length - 1]?.endTime : 0;
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
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
            props.currentSelectedWordsRange[1] <
            props.selectedVerses[props.currentVerse].text.split(" ").length - 1
          ) {
            // Sélectionne le mot suivant
            props.setCurrentSelectedWordsRange([
              props.currentSelectedWordsRange[0],
              props.currentSelectedWordsRange[1] + 1,
            ]);
          } else {
            // Vérifie qu'on va pas out of range
            if (props.selectedVerses.length > props.currentVerse + 1) {
              // Dans ce cas on va au verset suivant
              props.setCurrentVerse(props.currentVerse + 1);
              props.setCurrentSelectedWordsRange([0, 0]);
            }
          }
          break;

        case "ArrowDown":
          // On vérifie qu'on ne sélectionne pas un mot négatif
          if (
            props.currentSelectedWordsRange[1] >=
            props.currentSelectedWordsRange[0] + 1
          ) {
            // Revient sur le mot précédent
            props.setCurrentSelectedWordsRange([
              props.currentSelectedWordsRange[0],
              props.currentSelectedWordsRange[1] - 1,
            ]);

            console.log(props.currentSelectedWordsRange);
          } else if (props.currentSelectedWordsRange[0] > 0) {
            // Change la born min (= le réciteur se répète)
            props.setCurrentSelectedWordsRange([
              props.currentSelectedWordsRange[0] - 1,
              props.currentSelectedWordsRange[1] - 1,
            ]);
            //props.setPreviousSelectedWordIndexInVerse(props.currentSelectedWordsRange[0] - 1)
          } else {
            // On sélectionne un mot en dehors des ranges du verset,
            // càd on retourne au verset précédent
            if (props.currentVerse > 0) {
              props.setCurrentVerse(props.currentVerse - 1);
              const previousVerseLength =
                props.selectedVerses[props.currentVerse - 1].text.split(
                  " "
                ).length;
              console.log(previousVerseLength);

              props.setCurrentSelectedWordsRange([
                previousVerseLength - 1,
                previousVerseLength - 1,
              ]);
              props.setPreviousSelectedWordIndexInVerse(
                previousVerseLength - 2
              );
            }
          }
          break;

        case "a":
          // Add أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ

          props.setSubtitles([
            ...props.subtitles,
            new Subtitle(
              props.subtitles.length + 1,
              -1,
              -1,
              -1,
              props.currentSelectedWordsRange[0],
              props.currentSelectedWordsRange[1],
              lastSubtitleEndTime(props.subtitles),
              getCurrentAudioPlayerTime(),
              "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ"
            ),
          ]);
          break;
        case "b":
          // Add the basmala

          props.setSubtitles([
            ...props.subtitles,
            new Subtitle(
              props.subtitles.length + 1,
              -1,
              -1,
              -1,
              props.currentSelectedWordsRange[0],
              props.currentSelectedWordsRange[1],
              lastSubtitleEndTime(props.subtitles),
              getCurrentAudioPlayerTime(),
              "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
            ),
          ]);
          break;

        case "Backspace":
          // enlève le dernier sous titre ajouté
          if (props.subtitles.length >= 1) {
            props.setSubtitles(
              props.subtitles.slice(0, props.subtitles.length - 1)
            );

            // > 1 car la length n'est pas actualisé après son set
            if (props.subtitles.length > 1) {
              console.log(props.subtitles);
              props.setCurrentSelectedWordsRange([
                props.subtitles[props.subtitles.length - 1].toWordIndex,
                props.subtitles[props.subtitles.length - 1].toWordIndex,
              ]);
            } else {
              // Si on a aucun sous-titre on remet au tout début du verset
              props.setCurrentSelectedWordsRange([0, 0]);
            }
          }
          break;

        case "s":
          // Du dernier temps jusqu'à maintenant un silence
          props.setSubtitles([
            ...props.subtitles,
            new Subtitle(
              props.subtitles.length + 1,
              -1,
              -1,
              -1,
              props.currentSelectedWordsRange[0],
              props.currentSelectedWordsRange[1],
              lastSubtitleEndTime(props.subtitles),
              getCurrentAudioPlayerTime(),
              ""
            ),
          ]);
          break;
        /**
         * I
         * Sélectionne du current_end_range jusqu'au début du verset
         */
        case "i":
          props.setCurrentSelectedWordsRange([
            0,
            props.currentSelectedWordsRange[1],
          ]);
          break;
        /**
         * E
         * Sélectionne du current_begin_range jusqu'à la fin du verset
         */
        case "e":
          props.setCurrentSelectedWordsRange([
            props.currentSelectedWordsRange[0],
            props.selectedVerses[props.currentVerse].text.split(" ").length - 1,
          ]);
          break;
        /**
         * V
         * Sélectionne le verset entier
         */
        case "v":
          props.setCurrentSelectedWordsRange([
            0,
            props.selectedVerses[props.currentVerse].text.split(" ").length - 1,
          ]);
          break;
        case "Enter":
          // Valide la séléction pour le temps acctuel
          props.setSubtitles([
            ...props.subtitles,
            new Subtitle(
              props.subtitles.length + 1,
              0,
              props.selectedVerses[props.currentVerse].id,
              props.currentVerse,
              props.currentSelectedWordsRange[0],
              props.currentSelectedWordsRange[1],
              lastSubtitleEndTime(props.subtitles),
              getCurrentAudioPlayerTime(),
              props.selectedVerses[props.currentVerse].text
                .split(" ")
                .slice(
                  props.currentSelectedWordsRange[0],
                  props.currentSelectedWordsRange[1] + 1
                )
                .join(" ")
            ),
          ]);

          // Si pas tout les mots du versets en cours ont été séléctionnés,
          if (
            props.currentSelectedWordsRange[1] <
            props.selectedVerses[props.currentVerse].text.split(" ").length - 1
          ) {
            props.setPreviousSelectedWordIndexInVerse(
              props.currentSelectedWordsRange[1] + 2
            );
            props.setCurrentSelectedWordsRange([
              props.currentSelectedWordsRange[1] + 1,
              props.currentSelectedWordsRange[1] + 1,
            ]);
          } else {
            if (props.selectedVerses.length > props.currentVerse + 1) {
              // verset suivant
              props.setCurrentVerse(props.currentVerse + 1);
              props.setCurrentSelectedWordsRange([0, 0]);
              props.setPreviousSelectedWordIndexInVerse(1);
            } else {
              // Fin
              props.setCurrentSelectedWordsRange([0, 0]);
            }
          }

          break;
        default:
          break;
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    // Don't forget to clean up
    return function cleanup() {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    audioPlayerRef,
    props.currentSelectedWordsRange,
    props.previousSelectedWordIndexInVerse,
    props.currentVerse,
    props.subtitles,
  ]);

  return (
    <>
      {" "}
      <div className="w-full h-full bg-[#1e242c] flex items-center justify-center flex-row">
        <div className="flex flex-col w-full h-full relative">
          <div className="absolute top-2 right-5 text-white flex flex-row items-center">
            <select
              name="surahs"
              id="surahs"
              className="h-8 w-5/6  outline-none mt-3 px-1 bg-opacity-20 bg-black"
            >
              {props.Quran.map((surah) => {
                return (
                  <option
                    key={surah.id}
                    value={surah.id}
                    className="text-black"
                  >
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

            <p className="ml-3 mt-3">Verse</p>

            <input
              type="number"
              name="verse-begin"
              id="verse-begin"
              min={1}
              defaultValue={7}
              className="h-8 w-[60px] ml-3 bg-black bg-opacity-20 outline-none mt-3 pl-1"
            />
          </div>
          <div className="flex flex-row-reverse ml-auto flex-wrap self-end my-auto pt-10 mr-5 overflow-y-auto">
            {props.selectedVerses[props.currentVerse].text
              .split(" ")
              .map((word, index) => (
                <Word
                  word={word}
                  key={index}
                  isSelected={
                    props.currentSelectedWordsRange[0] <= index &&
                    props.currentSelectedWordsRange[1] >= index
                  }
                  wordClickedAction={() => {
                    // Lorsqu'on clique sur un mot on change la born min
                    // = le récitateur se répète
                    // c'est surtout fait pour corriger un appuie d'arrowdown en trop
                    if (index <= props.currentSelectedWordsRange[1]) {
                      props.setCurrentSelectedWordsRange([
                        index,
                        props.currentSelectedWordsRange[1],
                      ]);
                    } else {
                      // Sinon on sélectionne jusqu'à ce mot
                      props.setCurrentSelectedWordsRange([
                        props.currentSelectedWordsRange[0],
                        index,
                      ]);
                    }
                  }}
                />
              ))}
          </div>

          <ul className="absolute bottom-20 mt-auto text-white text-opacity-10 hover:text-opacity-60 duration-200 ml-6 list-disc text-sm hover:bg-slate-800 p-5 lg:hover:scale-125 lg:hover:ml-20 lg:hover:mb-10 hidden sm:block">
            <li>Press space to pause/resume the audio</li>
            <li>Use the up and down arrow keys to select words</li>
            <li>
              Use the left and right arrow to navigate the audio player forward
              or backward by 2 seconds
            </li>
            <li>Press S to add a silence</li>
            <li>Press B to add a basmala</li>
            <li>Press A to add the isti3adha</li>
            <li>Press backspace to remove the last added subtitles</li>
            <li>Press 'i' to select the first word</li>
            <li>Press 'e' to select the last word</li>
            <li>Press 'v' to select the whole verse</li>
          </ul>

          <ReactAudioPlayer
            ref={audioPlayerRef}
            src={props.recitationFile}
            controls
            className="w-10/12 self-center mb-5 mt-5"
          />
        </div>
      </div>
    </>
  );
};

export default ArabicSubtitleEditor;
