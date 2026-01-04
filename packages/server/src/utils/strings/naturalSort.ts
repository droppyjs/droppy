export default function naturalSort(a: string, b: string) {
    const collator =
        typeof Intl !== "undefined" && typeof Intl.Collator === "function"
            ? new Intl.Collator(undefined, {
                  numeric: true,
                  sensitivity: "base",
              })
            : null;

    if (collator) {
        return collator.compare(a, b);
    }

    return a > b ? 1 : a < b ? -1 : 0;
}
