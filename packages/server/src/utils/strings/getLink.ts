import type { LinkRecord } from "../../services/db/struct.js";

/**
 * Get a pseudo-random n-character lowercase string.
 */
export default function getLink(links: LinkRecord[], length: number) {
    const linkChars =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789";

    const existing = Array.isArray(links)
        ? new Set(links.map((l) => l._id).filter(Boolean))
        : null;

    let link = "";
    do {
        while (link.length < length) {
            link += linkChars.charAt(
                Math.floor(Math.random() * linkChars.length),
            );
        }
    } while (existing ? existing.has(link) : links[link]); // In case the RNG generates an existing link, go again

    return link;
}
