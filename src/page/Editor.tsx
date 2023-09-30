import React, { useEffect, useState } from "react";
import { Surah } from "../api/quran";
import ReactAudioPlayer from "react-audio-player";

interface Props {
  recitationFile: string;
  Quran: Surah[];
}

const Editor = (props: Props) => {
  // La position de la sourate sélectionné. 1 = Al-Fatiha, 114 = An-Nass
  const [selectedSurah, setSelectedSurah] = useState<number>(1);

  const audioPlayerRef = React.useRef<ReactAudioPlayer>(null);

  function getCurrentAudioPlayerTime(): number {
    return audioPlayerRef.current?.audioEl.current?.currentTime ?? -1;
  }

  return (
    <div className="w-screen h-screen flex flex-row">
      <div className="bg-black bg-opacity-25 h-full w-[30%] text-white flex justify-start items-center flex-col">
        <p className="mt-3 text-xl">Surah</p>
        <select
          name="surahs"
          id="surahs"
          className="h-8 w-5/6 text-black outline-none mt-3 px-1 "
          defaultValue={selectedSurah - 1}
          onChange={(e) => {
            /**
             * On change surah
             */
            setSelectedSurah(Number(e.target.value));
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
            max={props.Quran[selectedSurah - 1].total_verses}
            className="h-8 w-[60px] ml-2 bg-slate-400 text-black outline-none mt-3 pl-1"
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
            defaultValue={1}
            max={props.Quran[selectedSurah - 1].total_verses}
            className="h-8 w-[60px] ml-[31px] bg-slate-400 text-black outline-none mt-3 pl-1"
          />
        </div>
      </div>
      <div className="w-full h-full">
        <ReactAudioPlayer
          ref={audioPlayerRef}
          src={props.recitationFile}
          controls
        />
      </div>
    </div>
  );
};

export default Editor;
