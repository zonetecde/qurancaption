import React, { useState } from "react";

const TabControl = () => {
  const [addHeaderText, setAddHeaderText] = useState<string>("+");

  return (
    <div className="bg-black bg-opacity-60 h-12 flex flex-row">
      <div className="px-7 bg-slate-500 h-full flex items-center justify-center cursor-pointer rounded-t-xl">
        <p className="text-white text-sm lg:text-lg">Arabic subtitles</p>
      </div>

      <div
        className="px-5 bg-green-800 h-full flex items-center justify-center cursor-pointer rounded-t-xl ml-0.5"
        onMouseLeave={() => setAddHeaderText("+")}
        onMouseEnter={() => setAddHeaderText("Add a new translation")}
        onClick={() => {}}
      >
        <p className="text-white text-sm lg:text-lg">{addHeaderText}</p>
      </div>
    </div>
  );
};

export default TabControl;
