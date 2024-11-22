document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    let image = null;
    let originalFileHandle = null;  // Store the file handle of the original image
    let unsavedChanges = false;  // Flag to track unsaved changes

    // Set canvas dimensions
    canvas.width = 800;
    canvas.height = 600;

    // File Menu Button (Main Event Listener)
    document.getElementById('fileMenuBtn').addEventListener('click', () => {
        const toolbar = document.getElementById('toolbar');
        toolbar.style.display = 'flex'; // Make toolbar visible
        toolbar.innerHTML = `
            <h2 class="text-xl font-semibold">File Menu</h2>
            <button id="newFile" class="bg-blue-500 text-white px-4 py-2 rounded">New</button>
            <button id="uploadFileBtn" class="bg-blue-500 text-white px-4 py-2 rounded">Upload Image</button>
            <button id="saveFile" class="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
            <button id="saveAsFile" class="bg-blue-500 text-white px-4 py-2 rounded">Save As</button>
            <button id="propertiesFile" class="bg-blue-500 text-white px-4 py-2 rounded">Properties</button>
            <button id="quitFile" class="bg-red-500 text-white px-4 py-2 rounded">Quit</button>
        `;

        // Handle New (Clear Canvas)
        document.getElementById('newFile').addEventListener('click', clearCanvas);

        // Handle Image Upload (Open)
        document.getElementById('uploadFileBtn').addEventListener('click', uploadImage);

        // Handle Save Image (Overwrite Original Image)
        document.getElementById('saveFile').addEventListener('click', saveOriginalImage);

        // Handle Save As (Download Image)
        document.getElementById('saveAsFile').addEventListener('click', saveAsImage);

        // Handle Properties (Display Image Properties)
        document.getElementById('propertiesFile').addEventListener('click', displayProperties);

        // Handle Quit (Reload Page)
        document.getElementById('quitFile').addEventListener('click', quitApp);
    });

    // Clear Canvas (New File)
    function clearCanvas() {
        if (unsavedChanges && !confirm("You have unsaved changes. Are you sure you want to create a new file?")) {
            return; // Exit if user doesn't confirm
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        image = null;
        unsavedChanges = false; // Reset the unsaved changes flag
        originalFileHandle = null; // Clear file handle as well
        alert('Canvas cleared and ready for a new file.');
    }

    // Handle Image Upload (Using File System Access API)
    async function uploadImage() {
        try {
            // Prompt the user to select an image file
            [originalFileHandle] = await window.showOpenFilePicker({
                types: [{
                    description: 'Images',
                    accept: {
                        'image/png': ['.png'],
                        'image/jpeg': ['.jpg', '.jpeg']
                    }
                }]
            });

            // Get the file data from the handle
            const file = await originalFileHandle.getFile();
            const reader = new FileReader();
            reader.onload = function (e) {
                image = new Image();
                image.onload = function () {
                    drawImageOnCanvas(image);  // Draw the image on the canvas
                    unsavedChanges = true; // Mark unsaved changes
                };
                image.src = e.target.result;  // Set the image source to the uploaded image
            };
            reader.readAsDataURL(file);

        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image. Please try again.');
        }
    }

    // Function to draw the image on the canvas, ensuring proper scaling
    function drawImageOnCanvas(img) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear canvas before drawing new image

        // Calculate aspect ratio and fit image to canvas size
        let aspectRatio = img.width / img.height;
        let newWidth, newHeight;

        if (img.width > canvas.width || img.height > canvas.height) {
            if (img.width > img.height) {
                newWidth = canvas.width;
                newHeight = newWidth / aspectRatio;
            } else {
                newHeight = canvas.height;
                newWidth = newHeight * aspectRatio;
            }
        } else {
            newWidth = img.width;
            newHeight = img.height;
        }

        // Center the image on the canvas
        let xOffset = (canvas.width - newWidth) / 2;
        let yOffset = (canvas.height - newHeight) / 2;

        ctx.drawImage(img, xOffset, yOffset, newWidth, newHeight);
        unsavedChanges = true; // Mark unsaved changes when the image is drawn
    }

    // Save Image (Overwrite Original File)
    async function saveOriginalImage() {
        if (!image || !originalFileHandle) {
            alert('No image to save or no original file selected.');
            return;
        }

        try {
            // Create a writable stream to write the image data back to the original file
            const writableStream = await originalFileHandle.createWritable();

            // Convert the canvas to a Blob (binary large object) in PNG format
            const dataURL = canvas.toDataURL('image/png');
            const blob = await (await fetch(dataURL)).blob();

            // Write the Blob data to the original file
            await writableStream.write(blob);
            await writableStream.close();

            unsavedChanges = false; // Reset unsaved changes flag after saving
            alert('Image saved successfully to the original file!');
        } catch (error) {
            console.error('Error saving the image:', error);
            alert('Failed to save the image. Please try again.');
        }
    }

    // Save As (Download Image)
    async function saveAsImage() {
        if (!image) {
            alert('No image to save.');
            return;
        }

        try {
            const options = {
                types: [
                    {
                        description: 'Images',
                        accept: {
                            'image/png': ['.png'],
                            'image/jpeg': ['.jpg', '.jpeg']
                        }
                    }
                ]
            };

            // Show a file save dialog
            const fileHandle = await window.showSaveFilePicker(options);

            // Create a writable stream to write the image data
            const writableStream = await fileHandle.createWritable();

            // Convert the canvas to the desired format
            const format = prompt("Enter file format (png or jpg):").toLowerCase();
            if (format !== 'png' && format !== 'jpg' && format !== 'jpeg') {
                alert('Invalid format. Please enter "png" or "jpg".');
                return;
            }

            // Convert the canvas to a Blob (binary large object) in the desired format
            const dataUrl = canvas.toDataURL(`image/${format}`);
            const blob = await (await fetch(dataUrl)).blob();

            // Write the Blob data to the file
            await writableStream.write(blob);
            await writableStream.close();

            alert('Image saved successfully!');
            unsavedChanges = false; // Reset unsaved changes flag after saving

        } catch (error) {
            console.error('Error saving the image:', error);
            alert('Failed to save the image. The save dialog may have been canceled.');
        }
    }

    // Display Image Properties (File size, dimensions, etc.)
    function displayProperties() {
        if (!image) {
            alert('No image uploaded.');
            return;
        }
        const fileSizeMB = (canvas.toDataURL('image/png').length * (3/4)) / (1024 * 1024); // Approximate file size in MB
        alert(`Image Width: ${image.width}px\nImage Height: ${image.height}px\nApprox. File Size: ${fileSizeMB.toFixed(2)} MB`);
    }

    // Quit Application (Reload Page)
    function quitApp() {
        if (unsavedChanges && !confirm("You have unsaved changes. Are you sure you want to quit?")) {
            return; // Exit if user doesn't confirm
        }
        location.reload(); // Reload the page to reset the app
    }
});
