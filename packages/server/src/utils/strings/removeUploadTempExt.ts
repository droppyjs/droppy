export default function removeUploadTempExt(p: string) {
    return p.replace(/(^\/?[^/]+)(\.droppy-upload)/, (_, p1) => p1);
}
