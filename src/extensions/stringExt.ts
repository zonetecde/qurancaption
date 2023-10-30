export default class StringExt {
    static toArabicNumber(verse: number) {
        const arabicNumerals = [
            "٠",
            "١",
            "٢",
            "٣",
            "٤",
            "٥",
            "٦",
            "٧",
            "٨",
            "٩",
        ];
        const numberString = verse.toString();
        let arabicString = "";

        for (let i = 0; i < numberString.length; i++) {
            const digit = parseInt(numberString[i]);
            arabicString += arabicNumerals[digit];
        }

        return arabicString;
    }

    static ReduceString(str: string) {
        // If the strings is too big, take only the first 15 words and add '...' at the end
        if (str.split(" ").length > 15) {
            const words = str.split(" ").slice(0, 15).join(" ");
            return words + "\u202B [...]";
        } else return str;
    }

    static blobToString(blob: Blob, callback: (result: string) => void) {
        const reader = new FileReader();

        reader.onload = (event) => {
            const result = event.target?.result as string;
            callback(result);
        };

        reader.readAsDataURL(blob);
    }

    static stringToBlob(dataUrl: string): Blob {
        const base64Data = dataUrl.split(",")[1];
        const byteCharacters = atob(base64Data);
        const byteArrays = [];

        for (let i = 0; i < byteCharacters.length; i++) {
            byteArrays.push(byteCharacters.charCodeAt(i));
        }

        return new Blob([new Uint8Array(byteArrays)], { type: "video/mp4" });
    }
}
