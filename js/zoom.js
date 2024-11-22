document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('canvas');
    const toolbar = document.getElementById('toolbar');
    let stage, layer, konvaImage;

    // Zoom Menu Button Event Listener
    document.getElementById('zoomMenuBtn').addEventListener('click', () => {
        toolbar.style.display = 'flex'; // Show the toolbar for zoom controls
        toolbar.innerHTML = `
            <h2 class="text-xl font-semibold">Zoom Controls</h2>
            <button id="zoomInBtn" class="bg-blue-500 text-white px-4 py-2 rounded">Zoom In</button>
            <button id="zoomOutBtn" class="bg-blue-500 text-white px-4 py-2 rounded">Zoom Out</button>
        `;

        // Initialize Konva stage and layer only once when Zoom In/Out is clicked
        if (!stage) {
            initializeKonva();
        }

        // Zoom In and Zoom Out button event listeners
        document.getElementById('zoomInBtn').addEventListener('click', zoomIn);
        document.getElementById('zoomOutBtn').addEventListener('click', zoomOut);

        // Add a listener to set pointer position on mousemove
        document.addEventListener('mousemove', (event) => {
            stage.setPointersPositions(event); // Register pointer position
        });
    });

    // Initialize Konva stage and layer
    function initializeKonva() {
        console.log("Initializing Konva...");

        // Set up the stage
        stage = new Konva.Stage({
            container: 'canvas',
            width: canvas.width,
            height: canvas.height
        });

        layer = new Konva.Layer();
        stage.add(layer);

        // Load the image from the canvas
        const canvasImage = new Image();
        canvasImage.src = canvas.toDataURL();

        // Debug: Check if the image is loading correctly
        console.log("Canvas image source set from canvas.toDataURL():", canvasImage.src);

        canvasImage.onload = function () {
            console.log("Image loaded, drawing on Konva stage...");

            konvaImage = new Konva.Image({
                x: stage.width() / 2 - canvasImage.width / 2,
                y: stage.height() / 2 - canvasImage.height / 2,
                image: canvasImage,
                draggable: true
            });

            // Debug: Check if the image object is created properly
            console.log("Konva Image object created:", konvaImage);

            layer.add(konvaImage);
            layer.draw(); // Draw the image onto the layer

            // Debug: Check if the image has been added to the layer
            console.log("Image added to layer and drawn.");
        };

        // Debug: Check if an error occurs while loading the image
        canvasImage.onerror = function () {
            console.error("Error loading the image from canvas.");
        };
    }

    // Zoom In function
    function zoomIn() {
        if (!stage) {
            console.error("Stage is not initialized yet.");
            return;
        }

        // Debug: Check the current scale before zooming in
        console.log("Zooming In - Current Scale:", stage.scaleX());

        const oldScale = stage.scaleX();
        const newScale = oldScale * 1.2; // Increase scale by 20%

        // Get mouse pointer position, defaulting to the center of the stage if null
        const pointerPos = stage.getPointerPosition() || { x: stage.width() / 2, y: stage.height() / 2 };

        const mousePointTo = {
            x: pointerPos.x / oldScale - stage.x() / oldScale,
            y: pointerPos.y / oldScale - stage.y() / oldScale,
        };

        stage.scale({ x: newScale, y: newScale });

        const newPos = {
            x: -(mousePointTo.x - pointerPos.x / newScale) * newScale,
            y: -(mousePointTo.y - pointerPos.y / newScale) * newScale,
        };

        stage.position(newPos);
        stage.batchDraw(); // Efficiently re-draw the stage

        // Debug: Check the new scale after zooming in
        console.log("Zoom In applied - New Scale:", stage.scaleX());
    }

    // Zoom Out function
    function zoomOut() {
        if (!stage) {
            console.error("Stage is not initialized yet.");
            return;
        }

        // Debug: Check the current scale before zooming out
        console.log("Zooming Out - Current Scale:", stage.scaleX());

        const oldScale = stage.scaleX();
        const newScale = oldScale / 1.2; // Decrease scale by 20%

        // Get mouse pointer position, defaulting to the center of the stage if null
        const pointerPos = stage.getPointerPosition() || { x: stage.width() / 2, y: stage.height() / 2 };

        const mousePointTo = {
            x: pointerPos.x / oldScale - stage.x() / oldScale,
            y: pointerPos.y / oldScale - stage.y() / oldScale,
        };

        stage.scale({ x: newScale, y: newScale });

        const newPos = {
            x: -(mousePointTo.x - pointerPos.x / newScale) * newScale,
            y: -(mousePointTo.y - pointerPos.y / newScale) * newScale,
        };

        stage.position(newPos);
        stage.batchDraw(); // Efficiently re-draw the stage

        // Debug: Check the new scale after zooming out
        console.log("Zoom Out applied - New Scale:", stage.scaleX());
    }
});
