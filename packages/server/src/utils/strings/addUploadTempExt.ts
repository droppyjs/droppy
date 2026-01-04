export default function addUploadTempExt(p: string) {
    return p.replace(/(\/?[^/]+)/, (_, p1) => `${p1}.droppy-upload`);
}
