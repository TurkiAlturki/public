document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    let selectedShape = null;

    // Add Event Listener to Shapes Menu Button
    document.getElementById('shapesMenuBtn').addEventListener('click', () => {
        const toolbar = document.getElementById('toolbar');
        toolbar.style.display = 'flex'; // Show toolbar
        toolbar.innerHTML = `
            <h2 class="text-xl font-semibold">Shapes Menu</h2>
            <label for="shapeSelect" class="mr-2">Select Shape:</label>
            <select id="shapeSelect" class="bg-gray-100 border px-4 py-2 rounded">
                <option value="rectangle">Rectangle</option>
                <option value="circle">Circle</option>
                <option value="ellipse">Ellipse</option>
                <option value="line">Line</option>
            </select>
            <input type="color" id="outlineColorPicker" value="#000000" class="bg-gray-100 border px-4 py-2 rounded ml-4">
            <label for="outlineColorPicker" class="ml-2">Outline Color</label>
            <input type="color" id="fillColorPicker" value="#ff0000" class="bg-gray-100 border px-4 py-2 rounded ml-4">
            <label for="fillColorPicker" class="ml-2">Fill Color</label>
            <button id="addShapeBtn" class="bg-blue-500 text-white px-4 py-2 rounded ml-4">Add Shape</button>
        `;

        document.getElementById('addShapeBtn').addEventListener('click', () => {
            const shapeType = document.getElementById('shapeSelect').value;
            const outlineColor = document.getElementById('outlineColorPicker').value;
            const fillColor = document.getElementById('fillColorPicker').value;

            // Add shape to the canvas
            addShapeToCanvas(shapeType, outlineColor, fillColor);
        });
    });

    // Function to add shape to the canvas
    function addShapeToCanvas(shapeType, outlineColor, fillColor) {
        ctx.strokeStyle = outlineColor;
        ctx.fillStyle = fillColor;
        ctx.lineWidth = 2;

        switch (shapeType) {
            case 'rectangle':
                ctx.fillRect(150, 150, 200, 100); // X, Y, Width, Height
                ctx.strokeRect(150, 150, 200, 100);
                break;

            case 'circle':
                ctx.beginPath();
                ctx.arc(400, 300, 50, 0, 2 * Math.PI); // X, Y, Radius, Start Angle, End Angle
                ctx.fill();
                ctx.stroke();
                break;

            case 'ellipse':
                ctx.beginPath();
                ctx.ellipse(400, 300, 100, 50, 0, 0, 2 * Math.PI); // X, Y, RadiusX, RadiusY, Rotation, Start Angle, End Angle
                ctx.fill();
                ctx.stroke();
                break;

            case 'line':
                ctx.beginPath();
                ctx.moveTo(100, 100); // Starting point
                ctx.lineTo(300, 300); // Ending point
                ctx.stroke();
                break;

            default:
                alert('Shape not recognized.');
        }
    }
});
