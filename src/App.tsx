import { useEffect, useRef, useState } from "react";

// Pages
import Home from "./page/Home";
import Editor from "./page/Editor";

// APi
import QuranApi, { Surah } from "./api/quran";
import Page from "./models/page";
import AppVariables from "./AppVariables";

function App() {
  const [page, setPage] = useState<Page>(Page.HOME);

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
    <div className="bg-slate-600 h-screen w-screen">
      {page === Page.HOME ? (
        <Home setPage={setPage} />
      ) : page === Page.EDITOR ? (
        <div>
          <Editor />
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

export default App;
