export default function rootname(p: string) {
    return p.split("/").find((p) => !!p);
}
