import React from "react";

interface Props {
  word: string;
  isSelected: boolean;
  wordClickedAction: () => void;
}

const Word = (props: Props) => {
  return (
    <div
      className={
        "arabic text-3xl md:text-4xl lg:text-5xl text-white  select-none cursor-pointer px-1.5 lg:px-3 md:py-3 lg:py-5 py-1 z-50 " +
        (props.isSelected ? " bg-yellow-600 bg-opacity-25" : "")
      }
      onClick={props.wordClickedAction}
    >
      {props.word}
    </div>
  );
};

export default Word;
