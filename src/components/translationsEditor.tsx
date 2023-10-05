import React, { useEffect } from "react";
import Subtitle from "../models/subtitle";
import { Verse } from "../api/quran";
import AppVariables from "../AppVariables";

interface Props {
  subtitles: Subtitle[];
  setSubtitles: React.Dispatch<React.SetStateAction<Subtitle[]>>;
  lang: string;
}

/**
 * Component pour éditer les traductions des sous-titre arabe de l'utilisateur de l'utilisateur
 */
const TranslationsEditor = (props: Props) => {
  // Au chargement du component, on regarde si certaines des traductions sont manquantes
  useEffect(() => {
    // Si des traductions sont manquantes (= qu'ils viennent d'être ajouté depuis le sync arabe)
    // alors on les ajoutes ici
    props.subtitles.forEach((subtitle) => {
      // Si la traduction est manquante
      if (
        subtitle.translations.find((x) => x.lang === props.lang) === undefined
      ) {
        // Ajoute la traduction
        subtitle.translations.push({
          lang: props.lang,
          // La traduction est sauvegardé dans les variables statique du site
          text: AppVariables.TranslatedVerses[props.lang].find(
            (x) => x.id === subtitle.versePos
          )!.translation,
        });
      }
    });
  }, []);

  /**
   * Empêche l'utilisateur veut revenir à la ligne dans les
   * inputs pour saisir une traduction
   * @param event
   */
  function preventNewLine(event: React.KeyboardEvent<HTMLSpanElement>) {
    if (event.key === "Enter" || event.keyCode === 13) {
      event.preventDefault();
    }
  }

  return (
    <div className="h-full w-full flex justify-center items-center flex-col px-5 lg:px-20 bg-[#1e242c]">
      <div className="h-full mt-20 mb-20 overflow-y-auto  w-full relative">
        {props.subtitles.length > 0 ? (
          <>
            {props.subtitles.map((subtitle: Subtitle) => (
              <>
                {subtitle.versePos !== -1 && (
                  <div className="border-2 p-4">
                    <p className="arabic text-2xl lg:text-5xl/[80px] text-white [word-spacing:10px] lg:[word-spacing:15px] leading-10">
                      {subtitle.arabicText}
                    </p>
                    <span
                      className="textarea w-full bg-opacity-10 bg-white text-white mt-5 text-lg lg:text-xl px-1 py-1 outline-none "
                      role="textbox"
                      contentEditable
                      spellCheck="false"
                      aria-multiline="false"
                      /**
                       * Prevent the enter key to create a new line
                       */
                      onKeyDown={(event) => {
                        preventNewLine(event);
                      }}
                      /**
                       * Write the translation of the verse (~ default value)
                       */
                      dangerouslySetInnerHTML={{
                        __html:
                          props.subtitles
                            .find(
                              (element) =>
                                element.versePos === subtitle.versePos
                            )
                            ?.translations.find((x) => x.lang === props.lang)
                            ?.text || "",
                      }}
                      /**
                       * When focus is lost, write the edited translation of the verse
                       */
                      onBlur={(e) => {
                        console.log("tt");

                        const editedSubtitles = props.subtitles;
                        const _subtitle = editedSubtitles.find(
                          (_subtitle) =>
                            _subtitle.versePos === subtitle.versePos
                        );
                        if (_subtitle) {
                          const translation = subtitle.translations.find(
                            (_subtitle) => _subtitle.lang === props.lang
                          );
                          if (translation) {
                            translation.text = e.currentTarget.innerText;
                          }
                        }

                        props.setSubtitles(editedSubtitles);
                      }}
                    ></span>
                  </div>
                )}
              </>
            ))}
          </>
        ) : (
          <p className="text-2xl text-white absolute top-1/3 left-1/2  -translate-x-1/2">
            Add the arabic subtitles first to translate them
          </p>
        )}
      </div>
    </div>
  );
};

export default TranslationsEditor;
