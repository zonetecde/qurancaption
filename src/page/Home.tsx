import React from "react";
import { open } from "@tauri-apps/api/dialog";

interface Props {
  setRecitationFile: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const Home = (props: Props) => {
  async function handleImportButtonClick() {
    // Open a selection dialog for image files
    const selected = await open({
      filters: [
        {
          name: "Audio files",
          extensions: ["mp3", "ogg", "wav"],
        },
      ],
    });

    if (selected !== null) {
      props.setRecitationFile(selected.toString());
    }
  }

  return (
    <div className="h-full w-full flex justify-center items-center flex-col">
      <h1
        className="text-5xl font-bold px-2 select-none cursor-default"
        style={{ textShadow: "0 10px 20px hsla(0,5%,0%,.9)" }}
      >
        Quran Video Maker
      </h1>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full text-xl duration-75 mt-12 shadow-lg shadow-black"
        onClick={handleImportButtonClick}
      >
        Import a new recitation
      </button>
    </div>
  );
};

export default Home;
