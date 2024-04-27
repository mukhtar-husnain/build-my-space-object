// Import Babylon.js library
import * as BABYLON from 'babylonjs';

// Create a Babylon.js engine
const canvas = document.getElementById('renderCanvas');
const engine = new BABYLON.Engine(canvas, true);

// Create a scene
const scene = new BABYLON.Scene(engine);

// Add a camera to the scene
const camera = new BABYLON.ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 3, 10, new BABYLON.Vector3(0, 0, 0), scene);
camera.attachControl(canvas, true);

// Add a light to the scene
const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);

// Create a ground plane
const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 10, height: 10 }, scene);

// Variables for drawing
let isDrawing = false;
let lines = [];

// Variables for extrusion
let extrudedMesh = null;
const extrusionHeight = 2;

// Variables for moving
let isMoving = false;
let selectedMesh = null;

// Variables for vertex editing
let isVertexEditing = false;
let selectedVertex = null;

// UI elements
const drawButton = createButton('Draw', toggleDrawMode);
const extrudeButton = createButton('Extrude', extrudeShape);
const moveButton = createButton('Move', enableMoveMode);
const vertexEditButton = createButton('Vertex Edit', enableVertexEditMode);
const modeIndicator = document.createElement('div');
modeIndicator.style.position = 'absolute';
modeIndicator.style.top = '10px';
modeIndicator.style.left = '10px';
document.body.appendChild(modeIndicator);

// Function to create UI button
function createButton(text, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.addEventListener('click', onClick);
    document.body.appendChild(button);
    return button;
}

// Function to toggle draw mode
function toggleDrawMode() {
    isDrawing = !isDrawing;
    if (isDrawing) {
        clearSelection();
        modeIndicator.textContent = 'Draw Mode';
    } else {
        modeIndicator.textContent = '';
    }
}

// Function to extrude shape
function extrudeShape() {
    if (lines.length > 0 && lines[lines.length - 1].length > 2) {
        if (extrudedMesh) {
            extrudedMesh.dispose(); // Remove previous extruded mesh if exists
        }
        extrudedMesh = BABYLON.MeshBuilder.ExtrudePolygon('shape', { shape: lines.flat(), depth: extrusionHeight }, scene);
        selectedMesh = extrudedMesh;
        enableMoveMode();
    }
}

// Function to enable move mode
function enableMoveMode() {
    isMoving = true;
    isVertexEditing = false;
    clearSelection();
    if (selectedMesh) {
        selectedMesh.material.emissiveColor = new BABYLON.Color3(0, 0, 0);
    }
    modeIndicator.textContent = 'Move Mode';
}

// Function to enable vertex edit mode
function enableVertexEditMode() {
    isVertexEditing = true;
    isMoving = false;
    clearSelection();
    if (selectedMesh) {
        selectedMesh.material.emissiveColor = new BABYLON.Color3(0, 0, 0);
    }
    modeIndicator.textContent = 'Vertex Edit Mode';
}

// Function to clear selection and reset material
function clearSelection() {
    if (selectedMesh) {
        selectedMesh.material.emissiveColor = new BABYLON.Color3(0, 0, 0);
        selectedMesh = null;
    }
}

// Event listener for left-click to add points
canvas.addEventListener('pointerdown', function (event) {
    if (isDrawing && event.button === 0) {
        const pickResult = scene.pick(scene.pointerX, scene.pointerY);
        if (pickResult.hit) {
            const point = pickResult.pickedPoint.clone();
            if (lines.length === 0) {
                lines.push([point]);
            } else {
                lines[lines.length - 1].push(point);
            }
            drawLines();
        }
    }
});

// Event listener for right-click to complete the shape
canvas.addEventListener('pointerup', function (event) {
    if (isDrawing && event.button === 2) {
        if (lines.length > 0 && lines[lines.length - 1].length > 2) {
            lines.push([]);
            if (extrudedMesh) {
                extrudedMesh.dispose(); // Remove previous extruded mesh if exists
            }
            extrudedMesh = extrudeShape(lines);
        }
    }
});

// Function to draw lines
function drawLines() {
    for (let i = 0; i < lines.length; i++) {
        const linePoints = lines[i];
        if (linePoints.length > 1) {
            const line = BABYLON.MeshBuilder.CreateLines(`line_${i}`, { points: linePoints }, scene);
            line.color = new BABYLON.Color3(1, 0, 0);
        }
    }
}

// Event listener for moving the object
canvas.addEventListener('pointerdown', function (event) {
    if (isMoving && event.button === 0) {
        const pickResult = scene.pick(scene.pointerX, scene.pointerY);
        if (pickResult.hit && pickResult.pickedMesh) {
            clearSelection();
            selectedMesh = pickResult.pickedMesh;
            selectedMesh.material.emissiveColor = new BABYLON.Color3(1, 1, 0); // Highlight selected mesh
        }
    }
});

// Run the engine render loop
engine.runRenderLoop(() => {
    scene.render();
});
