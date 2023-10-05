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

/**
 * Component faisant office de sélecteur de sélecteur de
 * page dans la fenêtre édition.
 */
const TabControl = (props: Props) => {
  // Le texte affiché dans le tab pour ajouter une nouvelle
  // traduction. Lorsqu'il n'est pas hover, il y a affiché +,
  // sinon il y a affiché le texte d'ajout avec un menu drop down
  // pour sélectionner la langue que l'on veut ajouter
  const [addHeaderText, setAddHeaderText] = useState<string>("+");

  const [toDeleteTabItem, setToDeleteTabItem] = useState<TabItem | undefined>(
    undefined
  );

  /**
   * Ajout du page de traduction avec la langue voulu
   * @param _selectedLang La langue de la traduction à ajouté
   */
  function addTranslation(selectedLang: string): void {
    // Télécharge les traductions des versets voulu

    // Ajoute uniquement les versets de la sourate choisi
    let versesTranslated: Verse[] = [];

    // Fait une requête à l'API pour obtenir le
    // Coran dans la langue voulu
    QuranApi.getQuran(selectedLang)
      .then((quran: Surah[]) => {
        quran
          // Cherche uniquement les versets de la sourate sélectionné
          .find((x) => x.name === props.surahName)!
          .verses.forEach((verse) => {
            versesTranslated.push(verse);
          });

        // Ajoute les versets traduits pour qu'ils puissent être accessible sans les retelecharger
        AppVariables.TranslatedVerses[selectedLang] = versesTranslated;
      })
      .finally(() => {
        // Cache la tabItem qui est actuellement visible
        const updatedTabItems = makeAllTabsHidden(props);

        // Ajoute une nouvelle tabItem contenant les tranductions dans cette langue et l'affiche
        props.setTabItems([
          ...updatedTabItems,
          { isShown: true, lang: selectedLang },
        ]);

        // Ajoute dans chaque sous-titre ajouté au texte arabe sa nouvelle traduction avec la langue choisi
        const editedSubtitles = props.subtitles.map((subtitle) => {
          // Push la nouvelle traduction
          subtitle.translations.push({
            lang: selectedLang,
            text: versesTranslated.find(
              (x) => x.id === subtitle.versePos // trouve le bon verset pour lui attribuer sa traduction
            )!.translation,
          });

          return subtitle;
        });

        props.setSubtitles(editedSubtitles);
      });
  }

  /**
   * Bring into view the clicked tab
   * @param tabItem The clicked tabItem
   */
  function bringTabToView(tabItem: TabItem) {
    const updatedTabItems = makeAllTabsHidden(props);
    updatedTabItems.find((x) => x.lang === tabItem.lang)!.isShown = true; // Show the selected tab
    props.setTabItems(updatedTabItems);
  }

  function makeAllTabsHidden(props: Props) {
    return props.tabItems.map((item) => ({
      ...item,
      isShown: false,
    }));
  }

  /**
   * Show the confirm delete modal
   * @param tabItem The tabItem to delete
   */
  function tabItemCrossClicked(tabItem: TabItem): void {
    setToDeleteTabItem(tabItem); // Affiche le modal de confirmation
  }

  return (
    <div className="bg-black bg-opacity-60 h-12 flex flex-row">
      {props.tabItems.map((tabItem, index) => (
        <div
          key={index}
          className={
            "px-7 h-full flex items-center justify-center cursor-pointer rounded-t-xl border-x-2 border-t-2 div-tab-item " +
            (tabItem.isShown
              ? "bg-[#1e242c] border-gray-500 "
              : "bg-slate-800 border-gray-700")
          }
          onClick={() => {
            bringTabToView(tabItem);
          }}
        >
          <p className="text-white text-sm lg:text-lg">
            {AppVariables.Langs[tabItem.lang]}
          </p>
          <span
            className={
              "px-2 ml-2 font-mono bg-red-300 border border-black remove-tab-button"
            }
            onClick={() => tabItemCrossClicked(tabItem)}
          >
            X
          </span>
        </div>
      ))}

      {props.subtitles.length > 0 && (
        <div
          className="px-5 bg-green-800 h-full flex items-center justify-center cursor-pointer rounded-t-xl ml-0.5"
          onMouseLeave={() => setAddHeaderText("+")}
          onMouseEnter={() => setAddHeaderText("Add a translation :")}
        >
          <div className="px-2 bg-green-800 h-full flex items-center justify-center cursor-pointer rounded-t-xl ml-0.5">
            <p className="text-white text-sm lg:text-lg">{addHeaderText}</p>

            {addHeaderText === "Add a translation :" && (
              <select
                className="h-8 ml-3 border border-black"
                defaultValue={"select"}
                onChange={(e) => addTranslation(e.currentTarget.value)}
              >
                <option value="select">Select a language</option>

                {Object.keys(AppVariables.Langs).map(function (key, index) {
                  // Si la traduction n'a toujours pas été ajouté pour cette langue
                  if (
                    props.tabItems.find((x) => x.lang === key) === undefined
                  ) {
                    return (
                      <option key={index} value={key}>
                        {AppVariables.Langs[key]}
                      </option>
                    );
                  }

                  return <> </>;
                })}
              </select>
            )}
          </div>
        </div>
      )}

      {toDeleteTabItem !== undefined && (
        <div className="absolute px-10 py-10 border-3 rounded-2xl border-blue-900 bg-blue-200 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <p className="mb-8">
            Do you want to remove the {AppVariables.Langs[toDeleteTabItem.lang]}{" "}
            translation ?<br />
            This cannot be undone.
          </p>

          <button className="absolute right-24 bottom-2 px-6  bg-lime-500 rounded-xl border-2 hover:bg-lime-600 duration-100 text-white border-lime-700 py-2">
            Cancel
          </button>

          <button className="absolute right-2 bottom-2 px-6  bg-red-400 rounded-xl border-2 hover:bg-red-500 duration-100 text-white border-red-700 py-2">
            Yes
          </button>
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
