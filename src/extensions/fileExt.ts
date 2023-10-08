export default class FileExt {
  /**
   * Take the selected recitation file of the user and transform it into a JS blob
   * @param event
   * @returns
   */
  static handleFileUpload(
    event: React.ChangeEvent<HTMLInputElement>,
    setBlob: any,
    setBlobUrl: any
  ) {
    const file = event.target.files?.[0];

    if (!file) return ["", undefined];

    const { type } = file;

    const reader = new FileReader();

    reader.onload = async (e) => {
      const audioData = e.target?.result as ArrayBuffer;

      if (!audioData) return;

      const audioBlob = new Blob([audioData], { type });
      const url = URL.createObjectURL(audioBlob);

      setBlob(audioBlob);
      setBlobUrl(url);
    };

    reader.readAsArrayBuffer(file);
  }
}
