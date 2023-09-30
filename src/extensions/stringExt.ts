export default class StringExt {
  static ReduceString(str: string) {
    // If the strings is too big, take only the first 15 words and add '...' at the end
    if (str.split(" ").length > 15) {
      const words = str.split(" ").slice(0, 15).join(" ");
      return words + "\u202B [...]";
    } else return str;
  }
}
