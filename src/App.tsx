import { useEffect, useState } from "react";

// Pages
import Home from "./page/Home";
import Editor from "./page/Editor";

// APi
import QuranApi, { Surah } from "./api/quran";

function App() {
  const [Quran, setQuran] = useState<Surah[]>([]);

  const [recitationFile, setRecitationFile] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    QuranApi.getAllSurahs().then((quran: Surah[]) => {
      setQuran(quran);
    });
  });

  return (
    <div className="bg-slate-600 h-screen w-screen">
      {recitationFile === undefined ? (
        <Home setRecitationFile={setRecitationFile} />
      ) : (
        <div>
          <Editor recitationFile={recitationFile} Quran={Quran} />
        </div>
      )}
    </div>
  );
}

export default App;
