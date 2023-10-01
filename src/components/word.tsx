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
        "arabic text-5xl text-white  select-none cursor-pointer px-3 py-5 " +
        (props.isSelected ? " bg-yellow-600 bg-opacity-25" : "")
      }
      onClick={props.wordClickedAction}
    >
      {props.word}
    </div>
  );
};

export default Word;
