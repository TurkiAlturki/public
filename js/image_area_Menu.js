document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    let image = null;
    let originalImage = null;
    let currentSelection = null;
    let isSelecting = false;
    let points = []; // For free-form and polygon selection
    let selectionMode = null; // Track the type of selection (rectangle, lasso, polygon)
    let isCropping = false; // Track whether cropping mode is active
    let activeButton = null; // Track the active button

    // Load and draw the image when available
    function drawImageOnCanvas() {
        if (image) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        }
    }

    // Store a copy of the original image for resetting
    function storeOriginalImage() {
        originalImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }

    // Restore the original image to the canvas
    function restoreOriginalImage() {
        if (originalImage) {
            ctx.putImageData(originalImage, 0, 0);
        }
    }

    // Change the active button color
    function activateButton(buttonId) {
        if (activeButton) {
            // Reset the previous active button color
            activeButton.classList.remove('bg-yellow-500');
            activeButton.classList.add('bg-blue-500');
        }
        // Set the new active button color
        activeButton = document.getElementById(buttonId);
        activeButton.classList.remove('bg-blue-500');
        activeButton.classList.add('bg-yellow-500');
    }

    // Image Menu Button (Main Event Listener)
    document.getElementById('imageMenuBtn').addEventListener('click', () => {
        const toolbar = document.getElementById('toolbar');
        toolbar.style.display = 'flex'; // Ensure toolbar is visible
        toolbar.innerHTML = `
            <h2 class="text-xl font-semibold">Image Menu</h2>
            <button id="rectSelectBtn" class="bg-blue-500 text-white px-4 py-2 rounded">Rectangular Selection</button>
            <button id="lassoSelectBtn" class="bg-blue-500 text-white px-4 py-2 rounded">Free-Form (Lasso)</button>
            <button id="polySelectBtn" class="bg-blue-500 text-white px-4 py-2 rounded">Polygon Selection</button>
            <button id="cropBtn" class="bg-blue-500 text-white px-4 py-2 rounded">Crop</button>
            <button id="continueBtn" class="bg-green-500 text-white px-4 py-2 rounded">Continue</button>
            <button id="tryAgainBtn" class="bg-red-500 text-white px-4 py-2 rounded">Try Again</button>
        `;

        // Event Listeners for buttons with active state handling
        document.getElementById('rectSelectBtn').addEventListener('click', () => {
            activateButton('rectSelectBtn');
            startRectangularSelection();
        });
        document.getElementById('lassoSelectBtn').addEventListener('click', () => {
            activateButton('lassoSelectBtn');
            startLassoSelection();
        });
        document.getElementById('polySelectBtn').addEventListener('click', () => {
            activateButton('polySelectBtn');
            startPolygonSelection();
        });
        document.getElementById('cropBtn').addEventListener('click', () => {
            activateButton('cropBtn');
            startCropSelection(); // New Crop button
        });
        document.getElementById('continueBtn').addEventListener('click', continueWithSelection);
        document.getElementById('tryAgainBtn').addEventListener('click', tryAgainSelection);

        storeOriginalImage(); // Store the original image for reset
    });

    /*** SELECTION TOOLS ***/

    // Rectangular Selection
    function startRectangularSelection() {
        let startX, startY, endX, endY;
        isSelecting = false;
        selectionMode = 'rectangle';

        canvas.onmousedown = (e) => {
            isSelecting = true;
            startX = e.offsetX;
            startY = e.offsetY;
        };

        canvas.onmousemove = (e) => {
            if (!isSelecting) return;
            endX = e.offsetX;
            endY = e.offsetY;
            restoreOriginalImage(); // Restore the original image before drawing new rectangle
            drawSelectionRect(startX, startY, endX - startX, endY - startY);
        };

        canvas.onmouseup = () => {
            isSelecting = false;
            currentSelection = { x: startX, y: startY, width: endX - startX, height: endY - startY };
            clearSelectionListeners();
        };
    }

    function drawSelectionRect(x, y, width, height) {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
    }

    // Free-Form (Lasso) Selection
    function startLassoSelection() {
        isSelecting = false;
        points = [];
        selectionMode = 'lasso';

        canvas.onmousedown = (e) => {
            isSelecting = true;
            points.push({ x: e.offsetX, y: e.offsetY });
        };

        canvas.onmousemove = (e) => {
            if (!isSelecting) return;
            points.push({ x: e.offsetX, y: e.offsetY });
            restoreOriginalImage(); // Restore image before drawing the lasso
            drawLassoSelection(points);
        };

        canvas.onmouseup = () => {
            isSelecting = false;
            if (points.length < 3 || !isClosedLoop(points)) {
                alert('Please close the selection loop.');
                clearSelectionListeners();
                startLassoSelection();
            } else {
                currentSelection = { points };
                clearSelectionListeners();
            }
        };
    }

    function drawLassoSelection(points) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach(point => ctx.lineTo(point.x, point.y));
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    function isClosedLoop(points) {
        const distance = Math.hypot(points[0].x - points[points.length - 1].x, points[0].y - points[points.length - 1].y);
        return distance < 10; // Consider it closed if start and end points are within 10 pixels
    }

    // Polygon Selection
    function startPolygonSelection() {
        isSelecting = false;
        points = [];
        selectionMode = 'polygon';

        canvas.onmousedown = (e) => {
            const clickPoint = { x: e.offsetX, y: e.offsetY };
            
            if (points.length > 0 && isNearStartPoint(clickPoint)) {
                // Close polygon if near the start point
                isSelecting = false;
                currentSelection = { points };
                clearSelectionListeners();
                drawPolygonSelection(points, true); // Draw closed polygon
                alert('Polygon closed and area selected.');
            } else {
                points.push(clickPoint);
                if (!isSelecting) {
                    isSelecting = true;
                } else if (points.length >= 3 && isSelecting === false) {
                    currentSelection = { points };
                    clearSelectionListeners();
                }
            }
        };

        canvas.onmousemove = (e) => {
            if (!isSelecting) return;
            restoreOriginalImage(); // Restore the original image before drawing new polygon
            drawPolygonSelection([...points, { x: e.offsetX, y: e.offsetY }], false);
        };
    }

    function drawPolygonSelection(points, isClosed) {
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach(point => ctx.lineTo(point.x, point.y));
        
        if (isClosed) {
            ctx.closePath(); // Close the path to form a complete polygon
        }
        
        ctx.stroke();
    }

    function isNearStartPoint(currentPoint) {
        const startPoint = points[0];
        const distance = Math.hypot(startPoint.x - currentPoint.x, startPoint.y - currentPoint.y);
        return distance < 10; // Consider it near if within 10 pixels
    }

    // Clear event listeners after selection
    function clearSelectionListeners() {
        canvas.onmousedown = null;
        canvas.onmousemove = null;
        canvas.onmouseup = null;
    }

    /*** NEW CROP FUNCTIONALITY ***/

    // Crop functionality using rectangular selection
    function startCropSelection() {
        let startX, startY, endX, endY;
        isSelecting = false;
        isCropping = true; // Set cropping mode to true

        canvas.onmousedown = (e) => {
            isSelecting = true;
            startX = e.offsetX;
            startY = e.offsetY;
        };

        canvas.onmousemove = (e) => {
            if (!isSelecting) return;
            endX = e.offsetX;
            endY = e.offsetY;
            restoreOriginalImage(); // Restore the original image before drawing new rectangle
            drawSelectionRect(startX, startY, endX - startX, endY - startY);
        };

        canvas.onmouseup = () => {
            isSelecting = false;
            currentSelection = { x: startX, y: startY, width: endX - startX, height: endY - startY };
            clearSelectionListeners();
        };
    }

    /*** IMAGE OPERATIONS ***/

    // Continue: Place the selected area at the center of the canvas
    function continueWithSelection() {
        if (!currentSelection) {
            alert('No area selected to continue.');
            return;
        }

        let selectedImageData;
        if (selectionMode === 'rectangle' || isCropping) {  // Handle cropping similar to rectangle
            const { x, y, width, height } = currentSelection;
            selectedImageData = ctx.getImageData(x, y, width, height);
            // Clear the canvas and center the selected area
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const centerX = (canvas.width - width) / 2;
            const centerY = (canvas.height - height) / 2;
            ctx.putImageData(selectedImageData, centerX, centerY);
            isCropping = false;  // Reset cropping mode
        } else if (selectionMode === 'lasso' || selectionMode === 'polygon') {
            const xMin = Math.min(...currentSelection.points.map(p => p.x));
            const yMin = Math.min(...currentSelection.points.map(p => p.y));
            const xMax = Math.max(...currentSelection.points.map(p => p.x));
            const yMax = Math.max(...currentSelection.points.map(p => p.y));
            const width = xMax - xMin;
            const height = yMax - yMin;
            selectedImageData = ctx.getImageData(xMin, yMin, width, height);
            // Clear the canvas and center the selected area
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const centerX = (canvas.width - width) / 2;
            const centerY = (canvas.height - height) / 2;
            ctx.putImageData(selectedImageData, centerX, centerY);
        }

        // Clear selection options
        document.getElementById('selectionOptions').remove();
    }

    // Try Again: Allow re-selection of the area
    function tryAgainSelection() {
        restoreOriginalImage(); // Redraw the original image
        currentSelection = null; // Clear the current selection
        isCropping = false; // Reset cropping mode
        document.getElementById('selectionOptions').remove(); // Remove the options from the toolbar
    }
});
