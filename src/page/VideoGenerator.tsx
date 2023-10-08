import React from "react";
import TimeExt from "../extensions/timeExt";
import Subtitle from "../models/subtitle";

interface Props {
  subtitles: Subtitle[];
  videoBlob: Blob;
}

const VideoGenerator = (props: Props) => {
  async function generateVideo(): Promise<void> {
    // Assuming you have the BLOB data stored in a variable called 'videoBlob' or 'audioBlob'
    const apiUrl =
      "https://localhost:7133/api/QVM/generate-video?authorizeKeep=true";
    console.log(apiUrl);

    // Create a FormData object to send the BLOB data
    const formData = new FormData();
    formData.append(
      "file",
      props.videoBlob,
      "_." + props.videoBlob.type.split("/")[1]
    );
    formData.append("subtitle", generateAssSubtitles("fr"));

    // Send the BLOB data to the API
    fetch(apiUrl, {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (response.ok) {
          // Handle success
          response.blob().then((blob) => {
            // Create a download link for the received BLOB data
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "downloaded_video.mp4"; // Adjust the filename as needed
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          });
        } else {
          // Handle errors
          console.error("Failed to upload file  " + response.body?.getReader());
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  function generateSrtSubtitles(lang: string = "ar") {
    let subtitleFileText = "";
    let silenceCounter: number = 0; // Permet de compenser les pauses pour pas que le numéro de sous titre soit erroné
    props.subtitles.forEach((subtitle, index) => {
      if (subtitle.arabicText !== "") {
        subtitleFileText += String(index + 1 - silenceCounter) + "\n";
        subtitleFileText +=
          TimeExt.secondsToHHMMSSms(subtitle.startTime) +
          " --> " +
          TimeExt.secondsToHHMMSSms(subtitle.endTime) +
          "\n";
        subtitleFileText +=
          (lang === "ar"
            ? subtitle.arabicText
            : subtitle.translations.find((x) => x.lang === lang)?.text) +
          "\n\n";
      } else {
        silenceCounter++;
      }
    });

    console.log(subtitleFileText);
    return subtitleFileText;
  }

  function generateAssSubtitles(
    secondLang: string = "",
    font: string = "me_quran",
    fontSize: number = 32,
    shadow: boolean = true
  ) {
    let subtitleFileText =
      `
[Script Info]
ScriptType: v4.00+
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,` +
      font +
      `,` +
      fontSize +
      `,&Hffffff,&Hffffff,&H00000000,&H0,0,0,0,0,100,100,0,0,1,1,` +
      (shadow ? "1" : "0") +
      `,2,10,10,10,0

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;

    props.subtitles.forEach((subtitle, index) => {
      subtitleFileText +=
        "Dialogue: 0," +
        TimeExt.secondsToHHMMSSms(subtitle.startTime) +
        "," +
        TimeExt.secondsToHHMMSSms(subtitle.endTime) +
        ",Default,,40,40,0,,{\\fade(200,200)\\blur5}" +
        subtitle.arabicText +
        (secondLang === "" || subtitle.versePos === -1 // si on veut la traduction avec et que ce n'est pas une basmala ou autre
          ? ""
          : "\\N{\\fs10}{\\fnArial}" +
            subtitle.translations.find((x) => x.lang === secondLang)?.text) +
        "\n";
    });
    return subtitleFileText;
  }

  return (
    <div className="h-full w-full flex items-center justify-center">
      <button className="px-10 py-3 bg-red-200" onClick={generateVideo}>
        Generate
      </button>
      {/* <SubtitleViewer
                        subtitleText={isOnGenerateVideoPage}
                        setSubtitleText={setGenerateVideo}
                        subtitleFileName={
                          props.Quran[selectedSurahPosition - 1]
                            .transliteration +
                          " " +
                          selectedVerses[0].id +
                          "-" +
                          selectedVerses[selectedVerses.length - 1].id +
                          ".srt"
                        }
                      /> */}
    </div>
  );
};

export default VideoGenerator;
