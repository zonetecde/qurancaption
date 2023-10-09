import React, { useEffect, useRef, useState } from "react";
import Subtitle from "../models/subtitle";
import AppVariables from "../AppVariables";
import UndoIcon from "../assets/UndoIcon.png";

interface Props {
  subtitles: Subtitle[];
  setSubtitles: React.Dispatch<React.SetStateAction<Subtitle[]>>;
  lang: string;
}

/**
 * Component pour éditer les traductions des sous-titre arabe de l'utilisateur de l'utilisateur
 */
const TranslationsEditor = (props: Props) => {
  const subtitleRefs = props.subtitles.map(() =>
    useRef<HTMLSpanElement | null>(null)
  );

  // Au chargement du component, on regarde si certaines des traductions sont manquantes
  useEffect(() => {
    const editedSubtitles = [...props.subtitles];
    // Si des traductions sont manquantes (= qu'ils viennent d'être ajouté depuis le sync arabe)
    // alors on les ajoutes ici
    editedSubtitles.forEach((subtitle) => {
      // Si la traduction est manquante
      if (
        subtitle.translations.find((x) => x.lang === props.lang) === undefined
      ) {
        // Ajoute la traduction
        // Si ce n'est pas une basmala ou autre
        if (subtitle.versePos) {
          subtitle.translations.push({
            lang: props.lang,
            // La traduction est sauvegardé dans les variables statique du site
            text: AppVariables.Quran[subtitle.versePos.surah - 1].verses[
              subtitle.versePos.verse - 1
            ].translations.find((x) => x.lang === props.lang)!.text,
          });
        }
      }
    });

    props.setSubtitles(editedSubtitles);
  }, []);

  /**
   * Empêche l'utilisateur de revenir à la ligne dans les
   * inputs pour saisir une traduction, et la valide,
   * et met le focus sur la prochaine traduction
   * @param event
   */
  function preventNewLine(
    subtitle: Subtitle,
    event: React.KeyboardEvent<HTMLSpanElement>
  ) {
    if (event.key === "Enter") {
      updateSubtitle(subtitle, event.currentTarget.innerText.trim());

      event.preventDefault();
    }
  }

  /**
   * Updates the subtitle with the new text.
   *
   * @param {Subtitle} subtitle - The subtitle object to be updated.
   * @param {string} newText - The new text for the subtitle.
   */
  function updateSubtitle(subtitle: Subtitle, newText: string) {
    const editedSubtitles = [...props.subtitles];

    const _subtitle = editedSubtitles.find(
      (_subtitle) => _subtitle.id === subtitle.id
    );

    if (_subtitle) {
      const translation = subtitle.translations.find(
        (_subtitle) => _subtitle.lang === props.lang
      );
      if (translation) {
        translation.text = newText;
      }
    }

    props.setSubtitles(editedSubtitles);
  }

  function resetTranslation(subtitle: Subtitle): void {
    const editedSubtitles = [...props.subtitles];

    const _subtitle = editedSubtitles.find(
      (_subtitle) => _subtitle.id === subtitle.id
    );

    if (_subtitle) {
      const translation = subtitle.translations.find(
        (_subtitle) => _subtitle.lang === props.lang
      );

      if (translation && _subtitle.versePos) {
        translation.text = AppVariables.Quran[
          _subtitle.versePos.surah - 1
        ].verses[_subtitle.versePos.verse - 1].translations.find(
          (x) => x.lang === props.lang
        )!.text;
      }
    }

    props.setSubtitles(editedSubtitles);
  }

  return (
    <div className="h-full w-full flex justify-center items-center flex-col px-5 lg:px-20 bg-[#1e242c]">
      <div className="h-full mt-20 mb-20 overflow-y-auto  w-full relative">
        {props.subtitles.length > 0 ? (
          <>
            {props.subtitles.map((subtitle: Subtitle, index) => (
              <div className="relative" key={index}>
                <div className="absolute top-2 left-5 text-white">
                  {subtitle.versePos?.surah}:{subtitle.versePos?.verse}
                </div>

                {subtitle.versePos && (
                  <div className="border-2 p-4 relative">
                    <p className="arabic text-2xl lg:text-5xl/[80px] text-white [word-spacing:10px] lg:[word-spacing:15px] leading-10">
                      {subtitle.arabicText}
                    </p>
                    <span
                      className={
                        "textarea w-full bg-opacity-10 bg-white text-white mt-5 text-lg lg:text-xl px-1 py-1 outline-none pr-7 "
                      }
                      role="textbox"
                      contentEditable
                      spellCheck="false"
                      aria-multiline="false"
                      ref={subtitleRefs[index]}
                      /**
                       * Prevent the enter key to create a new line
                       */
                      onKeyDown={(event) => {
                        preventNewLine(subtitle, event);
                      }}
                      /**
                       * Write the translation of the verse (~ default value)
                       */
                      dangerouslySetInnerHTML={{
                        __html:
                          props.subtitles
                            .find((element) => element.id === subtitle.id)
                            ?.translations.find((x) => x.lang === props.lang)
                            ?.text || "",
                      }}
                      /**
                       * When focus is lost, write the edited translation of the verse
                       */
                      onBlur={(e) => {
                        updateSubtitle(subtitle, e.currentTarget.innerText);
                      }}
                    ></span>

                    {/* If the user changed the default translation, show the undo button*/}
                    {subtitle.translations.some(
                      (x) => x.lang === props.lang
                    ) && (
                      <>
                        {subtitle.translations.find((x) => {
                          return x.lang === props.lang;
                        })!.text !==
                          AppVariables.Quran[
                            subtitle.versePos.surah - 1
                          ].verses[
                            subtitle.versePos.verse - 1
                          ].translations.find((x) => x.lang === props.lang)
                            ?.text && (
                          <img
                            src={UndoIcon}
                            className="absolute bottom-5 right-6 w-8 h-8 cursor-pointer"
                            alt="undo"
                            onClick={() => resetTranslation(subtitle)}
                          />
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
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
