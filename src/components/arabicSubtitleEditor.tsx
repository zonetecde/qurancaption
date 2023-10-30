import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactAudioPlayer from "react-audio-player";
import Word from "./word";
import { Surah, Verse, VersePosition } from "../api/quran";
import Subtitle from "../models/subtitle";
import AppVariables from "../AppVariables";
import FileExt from "../extensions/fileExt";
import { toast } from "sonner";

interface Props {
    setSubtitles: React.Dispatch<React.SetStateAction<Subtitle[]>>;
    subtitles: Subtitle[];
    recitationFile: string;

    triggerResetWork: boolean;

    setCurrentVerse: React.Dispatch<React.SetStateAction<VersePosition>>;
    currentVerse: VersePosition;

    showTransliteration: boolean;
    setShowTransliteration: React.Dispatch<React.SetStateAction<boolean>>;

    currentSelectedWordsRange: [number, number];
    setCurrentSelectedWordsRange: React.Dispatch<
        React.SetStateAction<[number, number]>
    >;

    previousSelectedWordIndexInVerse: number;
    setPreviousSelectedWordIndexInVerse: React.Dispatch<
        React.SetStateAction<number>
    >;

    setRecitationFileBlobUrl: React.Dispatch<React.SetStateAction<string>>;
    setRecitationFileBlob: React.Dispatch<
        React.SetStateAction<Blob | undefined>
    >;

    setGenerateVideo: React.Dispatch<React.SetStateAction<boolean>>;
}

const ArabicSubtitleEditor = (props: Props) => {
    const audioPlayerRef = React.useRef<ReactAudioPlayer>(null);

    function getCurrentAudioPlayerTime(): number {
        return audioPlayerRef.current?.audioEl.current?.currentTime ?? -1;
    }

    function lastSubtitleEndTime(subtitles: Subtitle[]): number {
        return subtitles.length > 0
            ? subtitles[subtitles.length - 1]?.endTime
            : 0;
    }

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            // Permet de ne pas faire qqch sans faire exprès aux sous-titres alors
            // qu'on modifie juste le num de verset
            if (document.activeElement !== verseBeginRef.current) {
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
                            AppVariables.Quran[
                                props.currentVerse.surah - 1
                            ].verses[props.currentVerse.verse - 1].text.split(
                                " "
                            ).length -
                                1
                        ) {
                            // Sélectionne le mot suivant
                            props.setCurrentSelectedWordsRange([
                                props.currentSelectedWordsRange[0],
                                props.currentSelectedWordsRange[1] + 1,
                            ]);
                        } else {
                            // Vérifie qu'on va pas out of range
                            if (
                                AppVariables.Quran.find(
                                    (x) => x.id === props.currentVerse.surah
                                )!.total_verses > props.currentVerse.verse
                            ) {
                                // Dans ce cas on va au verset suivant
                                props.setCurrentVerse(
                                    new VersePosition(
                                        props.currentVerse.surah,
                                        props.currentVerse.verse + 1
                                    )
                                );
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
                        } else if (props.currentSelectedWordsRange[0] > 0) {
                            // Change la born min (= le réciteur se répète)
                            props.setCurrentSelectedWordsRange([
                                props.currentSelectedWordsRange[0] - 1,
                                props.currentSelectedWordsRange[1] - 1,
                            ]);
                        } else {
                            // On sélectionne un mot en dehors des ranges du verset,
                            // càd on retourne au verset précédent
                            if (props.currentVerse.verse > 1) {
                                props.setCurrentVerse(
                                    new VersePosition(
                                        props.currentVerse.surah,
                                        props.currentVerse.verse - 1
                                    )
                                );
                                const previousVerseLength =
                                    AppVariables.Quran[
                                        props.currentVerse.surah - 1
                                    ].verses[
                                        props.currentVerse.verse - 2 // -2 car -1 = actualVerse (start from 0) et -2 = previousVerse
                                    ].text.split(" ").length;

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
                                undefined,
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
                                undefined,

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
                                props.subtitles.slice(
                                    0,
                                    props.subtitles.length - 1
                                )
                            );

                            // > 1 car la length n'est pas actualisé après son set
                            if (props.subtitles.length > 1) {
                                props.setCurrentSelectedWordsRange([
                                    props.subtitles[props.subtitles.length - 1]
                                        .toWordIndex,
                                    props.subtitles[props.subtitles.length - 1]
                                        .toWordIndex,
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
                                undefined,

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
                            AppVariables.Quran[
                                props.currentVerse.surah - 1
                            ].verses[props.currentVerse.verse - 1].text.split(
                                " "
                            ).length - 1,
                        ]);
                        break;
                    /**
                     * V
                     * Sélectionne le verset entier
                     */
                    case "v":
                        props.setCurrentSelectedWordsRange([
                            0,
                            AppVariables.Quran[
                                props.currentVerse.surah - 1
                            ].verses[props.currentVerse.verse - 1].text.split(
                                " "
                            ).length - 1,
                        ]);
                        break;
                    case "Enter":
                        // Remove the focus of all the elements
                        (document.activeElement as HTMLElement)?.blur();

                        if (getCurrentAudioPlayerTime() === 0) {
                            if (props.recitationFile)
                                toast.error("You must start the audio first");
                            else
                                toast.error(
                                    "You must select a video file first"
                                );
                            return;
                        }

                        if (
                            props.subtitles.length > 0 &&
                            props.subtitles[props.subtitles.length - 1]
                                .endTime > getCurrentAudioPlayerTime()
                        ) {
                            toast.error(
                                "The only way to go back is by pressing the backspace key, but be careful as this will remove your last subtitle entry."
                            );
                            return;
                        }

                        // Valide la séléction pour le temps acctuel
                        props.setSubtitles([
                            ...props.subtitles,
                            new Subtitle(
                                props.subtitles.length + 1,
                                props.currentVerse,
                                props.currentSelectedWordsRange[0],
                                props.currentSelectedWordsRange[1],
                                lastSubtitleEndTime(props.subtitles),
                                getCurrentAudioPlayerTime(),
                                AppVariables.Quran[
                                    props.currentVerse.surah - 1
                                ].verses[props.currentVerse.verse - 1].text
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
                            AppVariables.Quran[
                                props.currentVerse.surah - 1
                            ].verses[props.currentVerse.verse - 1].text.split(
                                " "
                            ).length -
                                1
                        ) {
                            props.setPreviousSelectedWordIndexInVerse(
                                props.currentSelectedWordsRange[1] + 2
                            );
                            props.setCurrentSelectedWordsRange([
                                props.currentSelectedWordsRange[1] + 1,
                                props.currentSelectedWordsRange[1] + 1,
                            ]);
                        } else {
                            if (
                                AppVariables.Quran[props.currentVerse.surah - 1]
                                    .total_verses >=
                                props.currentVerse.verse + 1
                            ) {
                                // verset suivant
                                props.setCurrentVerse(
                                    new VersePosition(
                                        props.currentVerse.surah,
                                        props.currentVerse.verse + 1
                                    )
                                );
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

    const verseBeginRef = useRef<HTMLInputElement>(null);

    function handleFileUpload(event: any): void {
        FileExt.handleFileUpload(
            event,
            props.setRecitationFileBlob,
            props.setRecitationFileBlobUrl
        );
    }

    return (
        <>
            {" "}
            <div className="w-full h-full bg-[#1e242c] flex items-center justify-center flex-row">
                <div className="flex flex-col w-full h-full relative">
                    <div className="absolute top-2 right-5 w-full text-white flex flex-row items-center">
                        <input
                            type="file"
                            accept=".mp4, .ogv, .webm, .wav, .mp3, .ogg, .mpeg"
                            className={
                                "w-60 h-10 mt-1 ml-8 self-start hover:opacity-95 " +
                                (props.recitationFile
                                    ? "opacity-20"
                                    : "opacity-100")
                            }
                            onChange={handleFileUpload}
                        />

                        {(!props.recitationFile ||
                            props.subtitles.length === 0) && (
                            <>
                                {!props.recitationFile && (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke-width="1.5"
                                        stroke="yellow"
                                        className="w-10 h-10">
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18"
                                        />
                                    </svg>
                                )}

                                <p className="text-yellow-500 text-xl pl-2">
                                    {!props.recitationFile
                                        ? "Select a video file containing a recitation of the Quran to start syncing"
                                        : "Press space to start the audio. Then, follow the instructions below to sync the subtitles with the audio."}
                                </p>
                            </>
                        )}

                        <div className="ml-auto mt-3 pl-2">
                            {" "}
                            <input
                                name="transliteration"
                                type="checkbox"
                                checked={props.showTransliteration}
                                onChange={(e) =>
                                    props.setShowTransliteration(
                                        e.currentTarget.checked
                                    )
                                }
                            />
                            <label className="pl-2">Show transliteration</label>
                        </div>
                        <select
                            name="surahs"
                            className="h-8 ml-3 w-2/12 md:w-3/12 outline-none mt-3 px-1 bg-opacity-20 bg-black"
                            value={props.currentVerse.surah}
                            onChange={(e) => {
                                props.setCurrentSelectedWordsRange([0, 0]);
                                props.setCurrentVerse(
                                    new VersePosition(Number(e.target.value), 1)
                                );
                                verseBeginRef.current!.value = "1";
                            }}
                            // prevent the surah to change when the user is syncing
                            onKeyDown={(e) => {
                                e.preventDefault();
                            }}>
                            {AppVariables.Quran.map((surah) => {
                                return (
                                    <option
                                        key={surah.id}
                                        value={surah.id}
                                        className="text-black">
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
                            defaultValue={1}
                            className="h-8 w-[60px] ml-3 bg-black bg-opacity-20 outline-none mt-3 pl-1"
                            ref={verseBeginRef}
                            onChange={(e) => {
                                if (
                                    e.target.value !== "" &&
                                    parseInt(e.target.value) >= 1 &&
                                    parseInt(e.target.value) <=
                                        AppVariables.Quran[
                                            props.currentVerse.surah - 1
                                        ].total_verses &&
                                    AppVariables.Quran[
                                        props.currentVerse.surah - 1
                                    ].total_verses >= Number(e.target.value)
                                ) {
                                    {
                                        props.setCurrentVerse(
                                            new VersePosition(
                                                props.currentVerse.surah,
                                                Number(e.target.value)
                                            )
                                        );
                                        props.setCurrentSelectedWordsRange([
                                            0, 0,
                                        ]);
                                    }

                                    // indication que le verset voulu n'est pas out-of-range
                                    verseBeginRef.current?.classList.remove(
                                        "bg-red-500"
                                    );
                                    verseBeginRef.current?.classList.add(
                                        "bg-black"
                                    );
                                } else {
                                    // indication que le verset voulu est out-of-range
                                    verseBeginRef.current?.classList.remove(
                                        "bg-black"
                                    );
                                    verseBeginRef.current?.classList.add(
                                        "bg-red-500"
                                    );
                                }
                            }}
                        />
                    </div>
                    <div className="flex flex-row-reverse ml-auto flex-wrap self-end my-auto pt-10 mr-5 overflow-y-auto">
                        {AppVariables.Quran[
                            props.currentVerse.surah - 1
                        ].verses[props.currentVerse.verse - 1].text
                            .split(" ")
                            .map((word, index) => (
                                <Word
                                    key={index} // key
                                    word={word} // the arabic word
                                    fromVersePos={props.currentVerse} // the position of the verse where the word come from
                                    wordPos={index} // the position of the word on the verse
                                    showTransliteration={
                                        props.showTransliteration
                                    } // show the transliteration ?
                                    isSelected={
                                        props.currentSelectedWordsRange[0] <=
                                            index &&
                                        props.currentSelectedWordsRange[1] >=
                                            index
                                    }
                                    wordClickedAction={() => {
                                        // Lorsqu'on clique sur un mot on change la born min
                                        // = le récitateur se répète
                                        // c'est surtout fait pour corriger un appui d'arrowdown en trop
                                        if (
                                            index <=
                                            props.currentSelectedWordsRange[1]
                                        ) {
                                            props.setCurrentSelectedWordsRange([
                                                index,
                                                props
                                                    .currentSelectedWordsRange[1],
                                            ]);
                                        } else {
                                            // sinon on sélectionne jusqu'à ce mot
                                            props.setCurrentSelectedWordsRange([
                                                props
                                                    .currentSelectedWordsRange[0],
                                                index,
                                            ]);
                                        }
                                    }}
                                />
                            ))}
                    </div>

                    <ul className="absolute bottom-20 mt-auto text-white text-opacity-30 hover:text-opacity-60 duration-200 ml-6 list-disc text-sm hover:bg-slate-800 p-5 lg:hover:scale-125 lg:hover:ml-20 lg:hover:mb-10  sm:block">
                        <li>Press space to pause/resume the audio</li>
                        <li>Use the up and down arrow keys to select words</li>
                        <li>
                            Use the left and right arrow to navigate the audio
                            <br />
                            player forward or backward by 2 seconds
                        </li>
                        <li>Press S to add a silence</li>
                        <li>Press B to add a basmala</li>
                        <li>Press A to add the isti3adha</li>
                        <li>
                            Press backspace to remove the last added subtitles
                        </li>
                        <li>Press 'i' to select the first word</li>
                        <li>Press 'e' to select the last word</li>
                        <li>Press 'v' to select the whole verse</li>
                    </ul>

                    {props.subtitles.some((x) => x.versePos) &&
                        props.recitationFile && (
                            <button
                                className="bg-blue-500 hover:bg-blue-700  text-white font-bold px-4 mx-2 rounded text-lg duration-75 shadow-lg shadow-black absolute bottom-6 py-2.5 right-5 block lg:hidden"
                                onClick={() => props.setGenerateVideo(true)}>
                                Generate video
                            </button>
                        )}

                    <ReactAudioPlayer
                        ref={audioPlayerRef}
                        src={props.recitationFile}
                        controls
                        className="w-10/12 self-center mb-5 mt-5 pr-32 lg:pr-0"
                    />
                </div>
            </div>
        </>
    );
};

export default ArabicSubtitleEditor;
