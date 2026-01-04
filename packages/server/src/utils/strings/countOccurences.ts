export default function countOccurences(string: string, search: string) {
    let num = 0;
    let pos = 0;

    while (true) {
        pos = string.indexOf(search, pos);
        if (pos >= 0) {
            num += 1;
            pos += search.length;
        } else {
            break;
        }
    }
    return num;
}
