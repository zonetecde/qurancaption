import React from "react";
import Page from "../models/page";

interface Props {
  setPage: React.Dispatch<React.SetStateAction<Page>>;
}

const Home = (props: Props) => {
  return (
    <div className="h-full w-full flex justify-center items-center flex-col">
      <h1
        className="text-5xl font-bold px-2 select-none cursor-default"
        style={{ textShadow: "0 10px 20px hsla(0,5%,0%,.9)" }}
      >
        Quran Video Maker
      </h1>

      <button
        className="relative bg-blue-500 hover:bg-blue-700 text-white font-bold mt-8 py-2 px-6 rounded-full text-xl duration-75 shadow-lg shadow-black"
        onClick={() => props.setPage(Page.EDITOR)}
      >
        Create subtitle
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
