export const copyToClipboard = (text: string): void => {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard
            .writeText(text)
            .then(() => console.log("Copied to clipboard"))
            .catch((err) => console.error("Failed to copy: ", err));
    } else {
        // Fallback for older browsers or non-HTTPS contexts
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed"; // avoid scrolling to bottom
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        try {
            document.execCommand("copy");
            console.log("Copied to clipboard (fallback)");
        } catch (err) {
            console.error("Fallback copy failed: ", err);
        }

        document.body.removeChild(textarea);
    }
};
