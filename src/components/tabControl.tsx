import React, { useState } from "react";
import QuranApi, { Surah, Verse } from "../api/quran";
import AppVariables from "../AppVariables";
import Subtitle from "../models/subtitle";

interface Props {
  surahName: string;
  selectedVerses: Verse[];
  setTabItems: React.Dispatch<React.SetStateAction<TabItem[]>>;
  tabItems: TabItem[];

  subtitles: Subtitle[];
  setSubtitles: React.Dispatch<React.SetStateAction<Subtitle[]>>;
}
const TabControl = (props: Props) => {
  const [addHeaderText, setAddHeaderText] = useState<string>("+");

  function addTranslation(_selectedLang: string): void {
    // Load les traductions des versets voulu
    const selectedLang = _selectedLang;
    // ajout d'uniquement les versets qu'on veut
    let versesTranslated: Verse[] = [];

    QuranApi.getQuran(selectedLang)
      .then((quran: Surah[]) => {
        quran
          .find((x) => x.name === props.surahName)!
          .verses.forEach((verse) => {
            if (props.selectedVerses.find((x) => x.id === verse.id))
              versesTranslated.push(verse);
          });

        // Ajoute les versets traduits pour qu'ils puissent être accessible sans les retelecharger
        AppVariables.TranslatedVerses[selectedLang] = versesTranslated;
      })
      .finally(() => {
        const updatedTabItems = makeAllTabsHidden(props);

        props.setTabItems([
          ...updatedTabItems,
          { isShown: true, lang: selectedLang }, // sauf le nouveau
        ]);

        const editedSubtitles = props.subtitles.map((subtitle) => {
          subtitle.translations.push({
            lang: selectedLang,
            text: versesTranslated.find((x) => {
              return x.id === subtitle.versePos;
            })!.translation,
          });

          return subtitle;
        });

        props.setSubtitles(editedSubtitles);
      });
  }

  return (
    <div className="bg-black bg-opacity-60 h-12 flex flex-row">
      {props.tabItems.map((tabItem, index) => {
        return (
          <div
            key={index}
            className={
              "px-7 h-full flex items-center justify-center cursor-pointer rounded-t-xl  border-x-2 border-t-2 " +
              (tabItem.isShown
                ? "bg-[#1e242c] border-gray-500 "
                : "bg-slate-800 border-gray-700")
            }
            onClick={() => {
              const updatedTabItems = makeAllTabsHidden(props);
              updatedTabItems.find((x) => x.lang === tabItem.lang)!.isShown =
                true;
              props.setTabItems(updatedTabItems);
            }}
          >
            <p className="text-white text-sm lg:text-lg">
              {AppVariables.Langs[tabItem.lang]}
            </p>
          </div>
        );
      })}

      {props.subtitles.length > 0 && (
        <div
          className="px-5 bg-green-800 h-full flex items-center justify-center cursor-pointer rounded-t-xl ml-0.5"
          onMouseLeave={() => setAddHeaderText("+")}
          onMouseEnter={() => setAddHeaderText("Add a translation :")}
        >
          <div className="px-2 bg-green-800 h-full flex items-center justify-center cursor-pointer rounded-t-xl ml-0.5  ">
            <p className="text-white text-sm lg:text-lg">{addHeaderText}</p>

            {addHeaderText === "Add a translation :" && (
              <select
                className="h-8 ml-3 border border-black"
                defaultValue={"select"}
                onChange={(e) => addTranslation(e.currentTarget.value)}
              >
                <option value="select">Select a language</option>
                <option value="en">English</option>
                <option value="fr">French</option>
                <option value="es">Spanish</option>
                <option value="bn">Bengali</option>
                <option value="ru">Russian</option>
                <option value="zh">Chinease</option>
                <option value="id">Indonesian</option>
                <option value="sv">Swedish</option>
                <option value="tr">Turkish</option>
                <option value="ur">Urdu</option>
              </select>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export interface TabItem {
  isShown: boolean;
  lang: string;
}

export default TabControl;
function makeAllTabsHidden(props: Props) {
  return props.tabItems.map((item) => ({
    ...item,
    isShown: false,
  }));
}
