export default function arrify(val) {
    return Array.isArray(val) ? val : [val];
}
