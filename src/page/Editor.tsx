import React, { useEffect, useMemo, useRef, useState } from "react";
import { Surah, Verse } from "../api/quran";
import ReactAudioPlayer from "react-audio-player";

// Extensions
import StringExt from "../extensions/stringExt";

interface Props {
  recitationFile: string;
  Quran: Surah[];
}

const Editor = (props: Props) => {
  // La position de la sourate sélectionné. 1 = Al-Fatiha, 114 = An-Nass
  const [selectedSurahPosition, setSelectedSurahPosition] = useState<number>(1);
  // Les versets de la récitation uploadé, par défaut Al-Fatiha de 1 à 7 (set dans useEffect)
  const [selectedVerses, setSelectedVerses] = useState<Verse[]>([]);

  const [hasSyncBegan, setHasSyncBegan] = useState<boolean>(false);

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
          <div className="w-full h-full bg-black bg-opacity-30">
            <p className="arabic"></p>

            <ReactAudioPlayer
              ref={audioPlayerRef}
              src={props.recitationFile}
              controls
              className="w-11/12  absolute left-8 right-8 bottom-5"
            />
          </div>
        ) : (
          <button
            className="bg-blue-500 hover:bg-blue-700 w-96 mb-32 text-white font-bold py-2 px-6 rounded text-xl duration-75 mt-12 shadow-lg shadow-black leading-10"
            onClick={() => {
              setHasSyncBegan(true);
            }}
          >
            {selectedVerses.length > 0 ? (
              <>
                {" "}
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
              </>
            ) : (
              <p>Loading {selectedVerses.length}</p>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default Editor;
