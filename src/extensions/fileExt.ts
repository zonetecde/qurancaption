import { toast } from "sonner";

export default class FileExt {
    static DownloadFile(fileName: string, fileContent: string) {
        const projectBlob = new Blob([fileContent], {
            type: "application/json",
        });

        const projectBlobUrl = URL.createObjectURL(projectBlob);

        const link = document.createElement("a");
        link.href = projectBlobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
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

        if (file?.size > 1.5e8) {
            toast.error(
                "The file size exceeds the limit. Please upload a file smaller than 150 megabytes."
            );
            return ["", undefined];
        }

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
