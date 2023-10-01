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

  const [recitationFile, setRecitationFile] = useState<string | undefined>(
    undefined
  );

  const [page, setPage] = useState<Page>(Page.HOME);

  useEffect(() => {
    QuranApi.getAllSurahs().then((quran: Surah[]) => {
      setQuran(quran);
    });
  });

  return (
    <div className="bg-slate-600 h-screen w-screen">
      {page === Page.HOME ? (
        <Home setRecitationFile={setRecitationFile} setPage={setPage} />
      ) : page === Page.EDITOR && recitationFile ? (
        <div>
          <Editor recitationFile={recitationFile} Quran={Quran} />
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
