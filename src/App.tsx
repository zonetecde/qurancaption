// Pages
import Home from "./page/Home";
import Editor from "./page/Editor";

// APi
import QuranApi, { Surah } from "./api/quran";
import Page from "./models/page";
import AppVariables from "./AppVariables";
import { useEffect, useState } from "react";

import video from "./assets/Al-Ahzab_56.mp4";
import sky from "./assets/sky.png";

function App() {
  const [page, setPage] = useState<Page>(Page.EDITOR);

  const [width, setWidth] = useState<number>(window.innerWidth);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }
  useEffect(() => {
    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);

  const isMobile = width <= 600;

  useEffect(() => {
    QuranApi.getQuran("en").then((quran: Surah[]) => {
      AppVariables.Quran = quran;

      // Init les listes de traductions et remove ۞
      quran.forEach((surah) => {
        surah.verses.forEach((verse) => {
          verse.translations = [];
          verse.text = verse.text.replace("۞", "");
        });
      });
    });
  }, []);

  return (
    <div className="bg-slate-600 h-screen w-screen overflow-hidden">
      {isMobile ? (
        <>
          <div className="w-full h-full text-green-200 flex justify-center pb-10 items-center pt-6 flex-col px-3 text-center ">
            <img src={sky} className="absolute top-0 left-0 right-0 bg-cover" />
            <div className="z-50">
              <p className="text-4xl -mt-16">Sorry :(</p>
              <p className="mt-5">
                QuranCaption is not supported on mobile devices
              </p>
              <p>Please use a desktop computer to start captioning !</p>
              <video src={video} className="mt-10" autoPlay controls></video>
            </div>

            <footer className="absolute bottom-5">
              <a
                href="https://github.com/zonetecde"
                target="_blank"
                className="underline"
              >
                Rayane Staszewski
              </a>
              <br />
              Copyright © 2023. All Rights Reserved.
            </footer>
          </div>
        </>
      ) : (
        <>
          <Editor />
        </>
      )}
    </div>
  );
}

export default App;
