document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    let isDragging = false;
    let image = null;
    let originalImage = null;
    let resizedWidth = null;
    let resizedHeight = null;

    // Load the uploaded image onto the canvas
    function setImage(img) {
        image = img;
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        storeOriginalImage(); // Store the original image
        resizedWidth = canvas.width;
        resizedHeight = canvas.height; // Store initial size
    }

    // Store the original image for reset
    function storeOriginalImage() {
        originalImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }

    // Restore the original image from stored data
    function restoreOriginalImage() {
        if (originalImage) {
            ctx.putImageData(originalImage, 0, 0);
        }
    }

    // Corrected Event Listener for Edit Image Button
    document.getElementById('editImageBtn').addEventListener('click', () => {
        const toolbar = document.getElementById('toolbar');
        toolbar.style.display = 'flex'; // Make toolbar visible
        toolbar.innerHTML = `
            <h2 class="text-xl font-semibold">Edit Image</h2>
            <button id="resizeBtn" class="bg-blue-500 text-white px-4 py-2 rounded">Resize</button>
            <input type="number" id="resizeWidth" placeholder="Width" class="border rounded px-2">
            <input type="number" id="resizeHeight" placeholder="Height" class="border rounded px-2">
            <button id="rotateRightBtn" class="bg-blue-500 text-white px-4 py-2 rounded">Rotate Right 90°</button>
            <button id="rotateLeftBtn" class="bg-blue-500 text-white px-4 py-2 rounded">Rotate Left 90°</button>
            <button id="flipVerticalBtn" class="bg-blue-500 text-white px-4 py-2 rounded">Flip Vertical</button>
            <button id="flipHorizontalBtn" class="bg-blue-500 text-white px-4 py-2 rounded">Flip Horizontal</button>
        `;

        // Attach event listeners to buttons
        document.getElementById('resizeBtn').addEventListener('click', resizeImage);
        document.getElementById('rotateRightBtn').addEventListener('click', () => rotateImage(90));
        document.getElementById('rotateLeftBtn').addEventListener('click', () => rotateImage(-90));
        document.getElementById('flipVerticalBtn').addEventListener('click', () => flipImage('vertical'));
        document.getElementById('flipHorizontalBtn').addEventListener('click', () => flipImage('horizontal'));
    });

    // Resize Image Functionality (now resizes relative to the current size)
    function resizeImage() {
        const newWidth = parseInt(document.getElementById('resizeWidth').value);
        const newHeight = parseInt(document.getElementById('resizeHeight').value);

        if (!newWidth || !newHeight || isNaN(newWidth) || isNaN(newHeight)) {
            alert('Please enter valid width and height.');
            return;
        }

        // Update the resizedWidth and resizedHeight
        resizedWidth = newWidth;
        resizedHeight = newHeight;

        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = resizedWidth;
        tempCanvas.height = resizedHeight;
        
        // Draw the image with the new dimensions on a temporary canvas
        tempCtx.drawImage(canvas, 0, 0, resizedWidth, resizedHeight);

        // Clear the original canvas and adjust its size
        canvas.width = resizedWidth;
        canvas.height = resizedHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the resized image onto the main canvas
        ctx.drawImage(tempCanvas, 0, 0, resizedWidth, resizedHeight);
    }

    // Rotate Image Functionality
    function rotateImage(angle) {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        if (angle === 90 || angle === -90) {
            tempCanvas.width = canvas.height;
            tempCanvas.height = canvas.width;
        } else {
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
        }

        tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
        tempCtx.rotate(angle * Math.PI / 180);
        tempCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);

        canvas.width = tempCanvas.width;
        canvas.height = tempCanvas.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, 0, 0);
    }

    // Flip Image Functionality
    function flipImage(direction) {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;

        if (direction === 'vertical') {
            tempCtx.scale(1, -1);
            tempCtx.drawImage(canvas, 0, -canvas.height);
        } else if (direction === 'horizontal') {
            tempCtx.scale(-1, 1);
            tempCtx.drawImage(canvas, -canvas.width, 0);
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, 0, 0);
    }
});
