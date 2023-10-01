export default class TimeExt {
  static secondsToHHMMSSms(seconds: number): string {
    const date = new Date(seconds * 1000); // Convert seconds to milliseconds
    const hh = date.getUTCHours().toString().padStart(2, "0");
    const mm = date.getUTCMinutes().toString().padStart(2, "0");
    const ss = date.getUTCSeconds().toString().padStart(2, "0");
    const ms = date.getUTCMilliseconds().toString().padStart(3, "0");

    return `${hh}:${mm}:${ss}.${ms}`;
  }
}
