import React from "react";
import { open } from "@tauri-apps/api/dialog";

interface Props {
  setRecitationFile: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const Home = (props: Props) => {
  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    const { type } = file;

    const reader = new FileReader();

    reader.onload = async (e) => {
      const audioData = e.target?.result as ArrayBuffer;

      if (!audioData) return;

      const audioBlob = new Blob([audioData], { type });
      props.setRecitationFile(URL.createObjectURL(audioBlob));
    };

    reader.readAsArrayBuffer(file);
  }

  return (
    <div className="h-full w-full flex justify-center items-center flex-col">
      <h1
        className="text-5xl font-bold px-2 select-none cursor-default"
        style={{ textShadow: "0 10px 20px hsla(0,5%,0%,.9)" }}
      >
        Quran Video Maker
      </h1>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full text-xl duration-75 mt-12 shadow-lg shadow-black">
        <input
          type="file"
          accept=".mp3,.ogg,.wav"
          onChange={handleFileUpload}
        />
      </button>
    </div>
  );
};

export default Home;
