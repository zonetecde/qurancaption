import { useEffect, useState } from "react";

// Pages
import Home from "./page/Home";
import Editor from "./page/Editor";

// APi
import QuranApi, { Surah } from "./api/quran";
import Page from "./models/page";
import Cinema from "./page/Cinema";

function App() {
  const [Quran, setQuran] = useState<Surah[]>([]);

  const [page, setPage] = useState<Page>(Page.HOME);

  useEffect(() => {
    QuranApi.getAllSurahs().then((quran: Surah[]) => {
      setQuran(quran);
    });
  });

  return (
    <div className="bg-slate-600 h-screen w-screen">
      {page === Page.HOME ? (
        <Home setPage={setPage} />
      ) : page === Page.EDITOR ? (
        <div>
          <Editor Quran={Quran} />
        </div>
      ) : page === Page.WATCH ? (
        <div>
          <Cinema />
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

export default App;
