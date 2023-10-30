import React, { useEffect, useRef, useState } from "react";
import Subtitle from "../models/subtitle";
import AppVariables from "../AppVariables";
import UndoIcon from "../assets/UndoIcon.png";
import TranslationExt from "../extensions/translationExt";

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
        //Ajoute les traductions aux versets qui n'en ont pas
        TranslationExt.addTranslationToSubtitles(
            props.lang,
            props.subtitles
        ).then((subtitle) => {
            props.setSubtitles(subtitle);
        });
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

            // Fait en sorte de mettre à jour les prochains versets en fonction de ce que
            // l'utilisateur a écrit, afin de continuer le verset/le répéter
            // Boucle for de la position du subtitle actuel + 1 jusqu'à la fin
            for (let i = subtitle.id; i < props.subtitles.length; i++) {
                const element = props.subtitles[i];

                // Si le subtitle est du même verset que le subtitle actuel
                if (
                    element.versePos?.surah === subtitle.versePos?.surah &&
                    element.versePos?.verse === subtitle.versePos?.verse
                ) {
                    // Alors on met à jour sa traduction si l'on peut
                    // Premier cas: c'est le même texte :
                    if (element.arabicText === subtitle.arabicText) {
                        element.translations.find(
                            (w) => w.lang === props.lang
                        )!.text = subtitle.getTranslationText(props.lang);
                    }
                    // Deuxieme cas: c'est un autre texte, mais on peut le mettre à jour
                    // Si c'est moite-moite
                    else if (
                        subtitle
                            .getWholeArabicVerse()
                            .startsWith(
                                subtitle.getArabicText() +
                                    " " +
                                    element.getArabicText()
                            )
                    ) {
                        // Update uniquement si ce n'est pas déjà fait
                        const newTranslation = element
                            .getOriginalTranslation(props.lang)
                            .substring(
                                subtitle.getTranslationText(props.lang).length
                            );
                        // Ne remplace pas si c'est vide
                        if (newTranslation.length > 0)
                            element.setTranslation(props.lang, newTranslation);
                    }
                }
            }

            // Met le focus sur le prochain verset
            if (subtitle.id < props.subtitles.length) {
                subtitleRefs[subtitle.id].current?.focus();
            }
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

    /**
     * Appelé lorsqu'on clique sur la flèche 'undo' d'un verset
     * Remet la traduction d'internet d'un verset
     * @param subtitle Le sous titre à reset
     */
    function resetTranslation(subtitle: Subtitle): void {
        const editedSubtitles = [...props.subtitles];

        const _subtitle = editedSubtitles.find(
            (_subtitle) => _subtitle.id === subtitle.id
        );

        if (_subtitle) {
            if (_subtitle.hasTranslation(props.lang) && _subtitle.versePos) {
                _subtitle.getTranslation(props.lang)!.text =
                    _subtitle.getOriginalTranslation(props.lang);
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
                                    {subtitle.versePos?.surah}:
                                    {subtitle.versePos?.verse}
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
                                                        .find(
                                                            (element) =>
                                                                element.id ===
                                                                subtitle.id
                                                        )
                                                        ?.translations.find(
                                                            (x) =>
                                                                x.lang ===
                                                                props.lang
                                                        )?.text || "",
                                            }}
                                            /**
                                             * When focus is lost, write the edited translation of the verse
                                             */
                                            onBlur={(e) => {
                                                updateSubtitle(
                                                    subtitle,
                                                    e.currentTarget.innerText
                                                );
                                            }}
                                            onFocus={(e) => {
                                                setTimeout(() => {
                                                    // Met le curseur à la fin du span
                                                    var range =
                                                        document.createRange();
                                                    var sel =
                                                        window.getSelection()!;
                                                    var node =
                                                        document.getElementById(
                                                            "first"
                                                        );

                                                    // Check if the cursor is at the start of the span
                                                    // this happen when the text change
                                                    if (
                                                        sel.anchorOffset === 0
                                                    ) {
                                                        // Make the cursor go to the end of the span
                                                        range.setStart(
                                                            subtitleRefs[index]
                                                                .current!
                                                                .childNodes[0],
                                                            subtitle.getTranslation(
                                                                props.lang
                                                            )!.text.length
                                                        );
                                                        range.collapse(true);
                                                        sel.removeAllRanges();
                                                        sel.addRange(range);
                                                    }
                                                }, 0);
                                            }}></span>

                                        {/* If the user changed the default translation, show the undo button*/}
                                        {subtitle
                                            .getTranslationText(props.lang)
                                            .trim() !==
                                            subtitle
                                                .getOriginalTranslation(
                                                    props.lang
                                                )
                                                .trim() && (
                                            <img
                                                src={UndoIcon}
                                                className="absolute bottom-5 right-6 w-8 h-8 cursor-pointer"
                                                alt="undo"
                                                onClick={() => {
                                                    resetTranslation(subtitle);
                                                }}
                                            />
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
