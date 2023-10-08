export default class TimeExt {
  static secondsToHHMMSSms(seconds: number): string {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours().toString();
    const mm = date.getUTCMinutes().toString().padStart(2, "0");
    const ss = date.getUTCSeconds().toString().padStart(2, "0");
    const ms = date
      .getUTCMilliseconds()
      .toString()
      .padStart(3, "0")
      .substring(0, 2);

    return `${hh}:${mm}:${ss}.${ms}`;
  }

  static HHMMSSmsToSeconds(timeString: string): number {
    const [hh, mm, ssAndMs] = timeString.split(":");
    const [ss, ms] = ssAndMs.split(".");

    // Convert the parts to integers
    const hours = parseInt(hh, 10);
    const minutes = parseInt(mm, 10);
    const seconds = parseInt(ss, 10);
    const milliseconds = parseInt(ms, 10);

    // Calculate the total seconds
    const totalSeconds =
      hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;

    return totalSeconds;
  }
}
