document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    let scale = 1;  // Initial scale for zoom
    let image = null;
    let originalImageData = null; // Store original image data for filters
    let brushColor = '#000000';  // Default color for brush
    let brushSize = 5;  // Default brush size
    let isPainting = false;
    let selectedFilter = null;

    // Load the uploaded image and redraw it
    function loadImageOnCanvas(imgSrc) {
        const img = new Image();
        img.src = imgSrc;
        img.onload = function () {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            image = img;  // Store the loaded image object
            originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height); // Store original image data
        };
    }

    // Set up the toolbar menu with options
    document.getElementById('toolsMenuBtn').addEventListener('click', () => {
        const toolbar = document.getElementById('toolbar');
        toolbar.style.display = 'flex';
        toolbar.innerHTML = `
            <h2 class="text-xl font-semibold">Tools Menu</h2>
            <button id="eraserBtn" class="bg-blue-500 text-white px-4 py-2 rounded">Eraser</button>
            <label for="colorPicker" class="bg-blue-500 text-white px-4 py-2 rounded">Brush Color:</label>
            <input type="color" id="colorPicker" value="${brushColor}" class="border rounded bg-blue-100" style="width: 40px;">
            <label for="brushSize" class="bg-blue-500 text-white px-4 py-2 rounded">Brush Size:</label>
            <input type="number" id="brushSize" value="${brushSize}" min="1" max="100" class="border rounded bg-blue-100" style="width: 50px;" />
            <button id="applySizeBtn" class="bg-green-500 text-white px-4 py-2 rounded">Set Brush Size</button>
            <button id="textBoxBtn" class="bg-blue-500 text-white px-4 py-2 rounded">Text Box</button>
            <select id="filtersDropdown" class="border rounded bg-blue-100" style="width: 150px;">
                <option value="gaussian">Gaussian Filter</option>
                <option value="sobel">Sobel Filter</option>
                <option value="binary">Binary Filter</option>
                <option value="histogramThreshold">Histogram Threshold</option>
            </select>
            <button id="applyFilterBtn" class="bg-blue-500 text-white small-button rounded">Apply Filter</button>
        `;

        // Attach event listeners for the tools
        document.getElementById('eraserBtn').addEventListener('click', enableEraser);
        document.getElementById('colorPicker').addEventListener('input', changeBrushColor);
        document.getElementById('applySizeBtn').addEventListener('click', applyBrushSize);
        document.getElementById('textBoxBtn').addEventListener('click', enableTextBox);
        document.getElementById('applyFilterBtn').addEventListener('click', applySelectedFilter);
    });


    /*** ERASER TOOL ***/
    function enableEraser() {
        erasing = true;
        textBoxMode = false;
        canvas.addEventListener('mousedown', startErasing);
        canvas.addEventListener('mouseup', stopErasing);
        canvas.addEventListener('mousemove', erase);
    }

    function startErasing(e) {
        isPainting = true;
        erase(e);
    }

    function erase(e) {
        if (!isPainting) return;
        ctx.globalCompositeOperation = 'destination-out';  // Erase
        ctx.beginPath();
        ctx.arc(e.offsetX, e.offsetY, brushSize, 0, Math.PI * 2, false);
        ctx.fill();
    }

    function stopErasing() {
        isPainting = false;
        ctx.globalCompositeOperation = 'source-over';  // Back to normal drawing
        canvas.removeEventListener('mousedown', startErasing);
        canvas.removeEventListener('mouseup', stopErasing);
        canvas.removeEventListener('mousemove', erase);
        erasing = false;
    }

    /*** COLOR PICKER TOOL ***/
    function changeBrushColor(event) {
        brushColor = event.target.value;  // Get the selected color from the color input
    }

    /*** PAINT BRUSH TOOL ***/
    function applyBrushSize() {
        brushSize = parseInt(document.getElementById('brushSize').value);  // Update the brush size based on input
        // Change button color to indicate selection
        document.getElementById('applySizeBtn').classList.add('bg-green-500');
        setTimeout(() => {
            document.getElementById('applySizeBtn').classList.remove('bg-green-500');
        }, 200);  // Reset color after 200ms
        enablePaintBrush();  // Enable painting with the solid brush
    }

    function enablePaintBrush() {
        textBoxMode = false;
        canvas.addEventListener('mousedown', startPainting);
        canvas.addEventListener('mouseup', stopPainting);
        canvas.addEventListener('mousemove', paint);
    }

    function startPainting(e) {
        isPainting = true;
        paint(e);
    }

    function paint(e) {
        if (!isPainting) return;

        ctx.strokeStyle = brushColor;  // Use selected brush color
        ctx.lineWidth = brushSize;  // Set the brush size
        ctx.lineCap = 'round';

        ctx.lineTo(e.offsetX, e.offsetY); // Draw line to the current position
        ctx.stroke();
        ctx.beginPath(); // Begin a new path for the next segment
        ctx.moveTo(e.offsetX, e.offsetY); // Move to current position
    }

    function stopPainting() {
        isPainting = false;
        ctx.beginPath(); // Reset path
        canvas.removeEventListener('mousedown', startPainting);
        canvas.removeEventListener('mouseup', stopPainting);
        canvas.removeEventListener('mousemove', paint);
    }

    /*** TEXT BOX TOOL ***/
    function enableTextBox() {
        textBoxMode = true;
        canvas.addEventListener('click', placeTextBox);
    }

    function placeTextBox(e) {
        const text = prompt('Enter the text to place:');
        if (text) {
            ctx.font = '20px Arial';
            ctx.fillStyle = brushColor;  // Use brush color for text
            ctx.fillText(text, e.offsetX, e.offsetY);
        }
        canvas.removeEventListener('click', placeTextBox);
    }

    /*** FILTER TOOLS ***/
    function applySelectedFilter() {
        selectedFilter = document.getElementById('filtersDropdown').value; // Get selected filter value
        switch (selectedFilter) {
            case 'gaussian':
                applyGaussianFilter();
                break;
            case 'sobel':
                applySobelFilter();
                break;
            case 'binary':
                applyBinaryFilter();
                break;
            case 'histogramThreshold':
                applyHistogramThreshold();
                break;
            
        }
    }

    function applyGaussianFilter() {
        // First, save the current image on the canvas
        const currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const outputData = ctx.createImageData(canvas.width, canvas.height);
        
        // Apply Gaussian blur
        const kernel = [
            [1,  4,  6,  4, 1],
            [4, 16, 24, 16, 4],
            [6, 24, 36, 24, 6],
            [4, 16, 24, 16, 4],
            [1,  4,  6,  4, 1]
        ];
        
        const kernelSum = 256; // Total sum of kernel values (to normalize)

        for (let y = 2; y < canvas.height - 2; y++) {
            for (let x = 2; x < canvas.width - 2; x++) {
                let r = 0, g = 0, b = 0;

                for (let ky = -2; ky <= 2; ky++) {
                    for (let kx = -2; kx <= 2; kx++) {
                        const pixelIndex = ((y + ky) * canvas.width + (x + kx)) * 4;
                        const weight = kernel[ky + 2][kx + 2];

                        r += currentImageData.data[pixelIndex] * weight;
                        g += currentImageData.data[pixelIndex + 1] * weight;
                        b += currentImageData.data[pixelIndex + 2] * weight;
                    }
                }

                const outputIndex = (y * canvas.width + x) * 4;
                outputData.data[outputIndex] = r / kernelSum;
                outputData.data[outputIndex + 1] = g / kernelSum;
                outputData.data[outputIndex + 2] = b / kernelSum;
                outputData.data[outputIndex + 3] = 255; // Set alpha to 255
            }
        }

        ctx.putImageData(outputData, 0, 0); // Draw the modified image back onto the canvas
        alert('Gaussian Filter applied');
    }

    function applySobelFilter() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const sobelData = ctx.createImageData(imageData.width, imageData.height);
        
        const width = imageData.width;
        const height = imageData.height;

        // Sobel kernel for edge detection
        const sobelX = [
            [-1, 0, 1],
            [-2, 0, 2],
            [-1, 0, 1]
        ];

        const sobelY = [
            [1, 2, 1],
            [0, 0, 0],
            [-1, -2, -1]
        ];

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let pixelX = 0;
                let pixelY = 0;

                // Apply Sobel filter
                for (let kernelY = -1; kernelY <= 1; kernelY++) {
                    for (let kernelX = -1; kernelX <= 1; kernelX++) {
                        const weightX = sobelX[kernelY + 1][kernelX + 1];
                        const weightY = sobelY[kernelY + 1][kernelX + 1];

                        const pixelIndex = ((y + kernelY) * width + (x + kernelX)) * 4;
                        const grayValue = 0.2126 * data[pixelIndex] + 0.7152 * data[pixelIndex + 1] + 0.0722 * data[pixelIndex + 2];

                        pixelX += weightX * grayValue;
                        pixelY += weightY * grayValue;
                    }
                }

                const magnitude = Math.sqrt(pixelX * pixelX + pixelY * pixelY);
                const newColor = magnitude > 255 ? 255 : magnitude; // Clamp the value to [0, 255]

                const sobelIndex = (y * width + x) * 4;
                sobelData.data[sobelIndex] = newColor; // R
                sobelData.data[sobelIndex + 1] = newColor; // G
                sobelData.data[sobelIndex + 2] = newColor; // B
                sobelData.data[sobelIndex + 3] = 255; // A
            }
        }

        ctx.putImageData(sobelData, 0, 0);
        alert('Sobel Filter applied');
    }

    function applyBinaryFilter() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const grayscale = (data[i] + data[i + 1] + data[i + 2]) / 3;
            const binaryValue = grayscale > 128 ? 255 : 0; // Adjust threshold for better visibility
            data[i] = data[i + 1] = data[i + 2] = binaryValue; // Set R, G, B to binary value
        }
        ctx.putImageData(imageData, 0, 0);
        alert('Binary Filter applied');
    }

    function applyHistogramThreshold() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const histogram = new Array(256).fill(0);

        // Build the histogram
        for (let i = 0; i < data.length; i += 4) {
            const grayscale = (data[i] + data[i + 1] + data[i + 2]) / 3;
            histogram[Math.floor(grayscale)]++;
        }

        // Determine a threshold value (for simplicity, we'll use a fixed threshold)
        const threshold = 128; // You can adjust this value for different effects

        for (let i = 0; i < data.length; i += 4) {
            const grayscale = (data[i] + data[i + 1] + data[i + 2]) / 3;
            const binaryValue = grayscale > threshold ? 255 : 0; // Apply threshold
            data[i] = data[i + 1] = data[i + 2] = binaryValue; // Set R, G, B to binary value
        }
        
        ctx.putImageData(imageData, 0, 0);
        alert('Histogram Threshold applied');
    }


    // Ensure we use the image loaded from fileMenu.js
    window.loadImageOnCanvas = loadImageOnCanvas;  // Expose function for file upload
});
