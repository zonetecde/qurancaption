import React, { useState } from "react";
import Page from "../models/page";
import { Surah } from "../api/quran";
import { toast } from "sonner";

interface Props {
    setPage: React.Dispatch<React.SetStateAction<Page>>;
}

const Home = (props: Props) => {
    return (
        <div className="h-full w-full flex justify-center items-center flex-col">
            <h1 className="text-5xl font-bold px-2 select-none cursor-default text-center" style={{ textShadow: "0 10px 20px hsla(0,5%,0%,.9)" }}>
                Quran Caption
            </h1>

            <button
                className="relative bg-blue-500 hover:bg-blue-700 text-white font-bold mt-8 py-2 px-6 rounded-full text-xl duration-75 shadow-lg shadow-black"
                onClick={() => {
                    props.setPage(Page.EDITOR);
                }}>
                Access the editor
            </button>
        </div>
    );
};

export default Home;
