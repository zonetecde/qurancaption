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
import MobileDetect from "mobile-detect";
import { Toaster } from "sonner";

function App() {
    const [page, setPage] = useState<Page>(Page.EDITOR);

    const md = new MobileDetect(window.navigator.userAgent);

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
        <div className="bg-slate-600 h-screen w-screen overflow-auto">
            <Editor />
        </div>
    );
}

export default App;
