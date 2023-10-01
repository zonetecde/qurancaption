import React from "react";
import { writeTextFile, BaseDirectory, createDir } from "@tauri-apps/api/fs";
import { open, save } from "@tauri-apps/api/dialog";

interface Props {
  subtitleText: string;
  setSubtitleText: React.Dispatch<React.SetStateAction<string>>;
  subtitleFileName: string;
}

const subtitleViewer = (props: Props) => {
  const saveFile = async () => {
    try {
      const result = await save({
        title: props.subtitleFileName,
        defaultPath: props.subtitleFileName,
      });

      if (result) {
        // The user specified a file name and location.
        const selectedFilePath = result;
        // Use this path to save your file, e.g., using the `writeTextFile` function.
        await writeTextFile(selectedFilePath, props.subtitleText);
      }
    } catch (error) {
      console.error("Error while saving the file:", error);
    }
  };

  return (
    <div className="absolute bg-white lg:left-10 top-10 -left-40 right-0 lg:right-80 bottom-10 border-3 pb-10 border-2 border-black shadow-2xl shadow-black p-10 rounded-lg">
      <div className="flex flex-row">
        <p className="text-2xl">Generated subtitles :</p>
        <button
          className="ml-auto border border-black bg-green-600 rounded-lg px-3 py-2 active:bg-green-800 duration-150"
          onClick={() => navigator.clipboard.writeText(props.subtitleText)}
        >
          Copy to clipboard
        </button>
        <button
          className="border ml-5 mr-5 border-black bg-blue-400 rounded-lg px-3 py-2"
          onClick={async () => {
            saveFile();
          }}
        >
          Save as file
        </button>
        <button
          className="border -mr-5 border-black bg-red-400 rounded-lg px-3 py-2"
          onClick={() => props.setSubtitleText("")}
        >
          Close
        </button>
      </div>
      <textarea
        aria-multiline
        value={props.subtitleText}
        className="absolute bottom-5 top-24 left-5 p-3 rounded-lg bg-slate-400 right-5 arabic"
        style={{ direction: "ltr" }}
        readOnly
      ></textarea>
    </div>
  );
};

export default subtitleViewer;
