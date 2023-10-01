import React from "react";
import { open } from "@tauri-apps/api/dialog";
import Page from "../models/page";

interface Props {
  setRecitationFile: React.Dispatch<React.SetStateAction<string | undefined>>;
  setPage: React.Dispatch<React.SetStateAction<Page>>;
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
      props.setPage(Page.EDITOR);
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

      <button className="relative bg-blue-500 hover:bg-blue-700 text-white font-bold mt-8 py-2 px-6 rounded-full text-xl duration-75 shadow-lg shadow-black">
        Create subtitle
        <input
          type="file"
          accept=".mp3,.ogg,.wav"
          onChange={handleFileUpload}
          className="absolute inset-0 opacity-0 cursor-pointer"
          style={{ zIndex: 2 }}
        />
      </button>

      <p className="mt-7 font-bold text-xl">or</p>

      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full text-xl duration-75 mt-6 shadow-lg shadow-black"
        onClick={() => props.setPage(Page.WATCH)}
      >
        Watch recitation
      </button>
    </div>
  );
};

export default Home;
