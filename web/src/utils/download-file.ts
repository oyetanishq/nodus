export const saveFile = (blobParts: BlobPart[], fileName: string, options?: BlobPropertyBag) => {
    const blob = new Blob(blobParts, options);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || "downloaded_file";
    a.click();
    URL.revokeObjectURL(url);
};
