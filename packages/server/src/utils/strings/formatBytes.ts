export default function formatBytes(num: number) {
    if (num < 1) {
        return `${num} B`;
    }
    const units = ["B", "kB", "MB", "GB", "TB", "PB"];
    const exp = Math.min(
        Math.floor(Math.log(num) / Math.log(1000)),
        units.length - 1,
    );
    return `${(num / 1000 ** exp).toPrecision(3)} ${units[exp]}`;
}
