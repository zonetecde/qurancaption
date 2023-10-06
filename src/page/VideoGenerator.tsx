import React from "react";
import TimeExt from "../extensions/timeExt";
import Subtitle from "../models/subtitle";

// pour générer les vidéos
import fluentffmpeg from "fluent-ffmpeg";
// pour transformer le blob de la vidéo en buffer
import blobToBuffer from "blob-to-buffer";

interface Props {
  subtitles: Subtitle[];
  videoBlob: Blob;
}

const VideoGenerator = (props: Props) => {
  async function generateVideo(): Promise<void> {
    // Assuming you have the BLOB data stored in a variable called 'videoBlob' or 'audioBlob'
    const apiUrl = "https://rayanestaszewski.fr/api/QVM/generate-video"; // Replace with your API endpoint
    console.log(apiUrl);

    // Create a FormData object to send the BLOB data
    const formData = new FormData();
    formData.append("file", props.videoBlob, "video.mp4"); // Adjust the filename and content type as needed

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

  function generateSubtitles() {
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
        subtitleFileText += subtitle.arabicText + "\n\n";
      } else {
        silenceCounter++;
      }
    });
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
