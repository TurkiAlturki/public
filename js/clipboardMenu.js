document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    // Clipboard Menu Button (Main Event Listener)
    document.getElementById('clipboardMenuBtn').addEventListener('click', () => {
        const toolbar = document.getElementById('toolbar');
        toolbar.style.display = 'flex';  // Make toolbar visible
        toolbar.innerHTML = `
            <h2 class="text-xl font-semibold">Clipboard Menu</h2>
            <button id="copyBtn" class="bg-blue-500 text-white px-4 py-2 rounded">Copy</button>
            <button id="cutBtn" class="bg-blue-500 text-white px-4 py-2 rounded">Cut</button>
            <button id="pasteBtn" class="bg-blue-500 text-white px-4 py-2 rounded">Paste</button>
        `;

        document.getElementById('copyBtn').addEventListener('click', copyImageToClipboard);
        document.getElementById('cutBtn').addEventListener('click', cutImageToClipboard);
        document.getElementById('pasteBtn').addEventListener('click', pasteImageFromClipboard);
    });

    /*** COPY IMAGE TO SYSTEM CLIPBOARD ***/
    async function copyImageToClipboard() {
        try {
            if (!canvas) {
                alert('No image on the canvas to copy.');
                return;
            }

            // Convert canvas image to a Blob (PNG format)
            canvas.toBlob(async (blob) => {
                const item = new ClipboardItem({ 'image/png': blob });

                // Write the image to the clipboard
                await navigator.clipboard.write([item]);
                alert('Image copied to clipboard.');
            }, 'image/png');
        } catch (err) {
            console.error('Failed to copy image to clipboard: ', err);
        }
    }

    /*** CUT IMAGE TO SYSTEM CLIPBOARD ***/
    async function cutImageToClipboard() {
        try {
            if (!canvas) {
                alert('No image on the canvas to cut.');
                return;
            }

            // Convert canvas image to a Blob (PNG format)
            canvas.toBlob(async (blob) => {
                const item = new ClipboardItem({ 'image/png': blob });

                // Write the image to the clipboard and clear the canvas after
                await navigator.clipboard.write([item]);
                alert('Image cut to clipboard.');
                ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear canvas after cutting
            }, 'image/png');
        } catch (err) {
            console.error('Failed to cut image to clipboard: ', err);
        }
    }

    /*** PASTE IMAGE FROM SYSTEM CLIPBOARD ***/
    async function pasteImageFromClipboard() {
        try {
            const clipboardItems = await navigator.clipboard.read(); // Read from the clipboard
            for (const clipboardItem of clipboardItems) {
                for (const type of clipboardItem.types) {
                    if (type.startsWith('image/')) {
                        const blob = await clipboardItem.getType(type);
                        const img = new Image();
                        img.src = URL.createObjectURL(blob); // Create image from clipboard data

                        img.onload = () => {
                            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
                            ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // Draw image to canvas
                        };
                        return;
                    }
                }
            }
            alert('No image found in the clipboard!');
        } catch (err) {
            console.error('Failed to read clipboard contents: ', err);
        }
    }
});
