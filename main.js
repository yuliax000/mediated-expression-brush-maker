// reference link: https://konvajs.org/docs/sandbox/Free_Drawing.html
// find elements
// 1. draw manually method (from konva.js website https://konvajs.org/docs/sandbox/Free_Drawing.html)
const toolSelection = document.getElementById("toolSelect");
const toolbar = document.getElementById("toolbar");

toolSelection.innerHTML = `
<option value = "brush">Brush</option>
<option value="eraser">Eraser</option>`;

toolbar.appendChild(toolSelection);

// define canvas size
const width = 600;
const height = 600;

// adding stage and layer
const stage = new Konva.Stage({
    container: "canvas",
    width: width,
    height: height,
})

const layer = new Konva.Layer();
stage.add(layer);

const canvas = document.createElement("canvas");
canvas.width = stage.width();
canvas.height = stage.height();

const image = new Konva.Image({
    image:canvas,
    x:0,
    y:0,
})
layer.add(image);

// get brush
const context = canvas.getContext("2d");

// get rid of original drawing, change to use image as brush

// context.strokeStyle = "var(--col01)";
// context.lineJoin = "round"
// context.lineWidth = 5;

const brushImage = new Image();

// to test if using image as brush source works
brushImage.src = "assets/original.png";

// create a new canvas containing canvas picture as brush canvas
const brushCanvas = document.createElement("canvas");
const brushContext = brushCanvas.getContext("2d");

const brushSize = 40;
brushCanvas.width = brushSize;
brushCanvas.height = brushSize;


let isPaint = false;
let lastPointerPosition;
// If I use generative brush at the start, it will capture blank canvas to draw,
// there will be nothing appears on canvas.
// Therefore, I decide to prepare two mode for users to switch. They can decide to turn on or off the generative mode.

let drawMode = "brush";
let brushMode = "default";

// the drawing will start after there is something on the canvas.
let hasCanvasContent = false;
let currentBrushsource;

image.on("mousedown touchstart", function(){
    updateBrushFromCurrentCanvas()
    isPaint = true;
    lastPointerPosition = stage.getPointerPosition();
//  test if I can use image to stamp
//     if (mode === "brush") {
//         const pos = stage.getPointerPosition();
//         context.drawImage(brushImage, pos.x - 20, pos.y - 20, 40, 40);
//         layer.batchDraw();
//     }
})



stage.on("mouseup touchend", function(){
    isPaint = false;
})

stage.on("mousemove touchmove", function(){
    if(!isPaint){
        return;
    }
  const pos = stage.getPointerPosition()

    if (drawMode === "brush") {
        // 1.original manually drawing method
        // context.globalCompositeOperation = "source-over";

        // 2. using brushImage as stamp to draw
        // context.drawImage(brushImage, pos.x - 20, pos.y - 20, 40, 40);
        stampBrush(lastPointerPosition, pos, brushCanvas, 40);


    }
    if (drawMode === "eraser") {
        // 1. original eraser
        // context.globalCompositeOperation = "destination-out";
        context.clearRect(pos.x - 20, pos.y - 20, 40, 40);
    }

    // 1. original manually drawing method
    // context.beginPath();
    //
    // const localPos = {
    //     x: lastPointerPosition.x - image.x(),
    //     y: lastPointerPosition.y - image.y(),
    // }
    // context.moveTo(localPos.x, localPos.y);
    // const pos = stage.getPointerPosition();
    // const newLocalPos = {
    //     x: pos.x - image.x(),
    //     y: pos.y - image.y(),
    // }
    // context.lineTo(newLocalPos.x, newLocalPos.y);
    // context.closePath();
    // context.stroke();
    //
    lastPointerPosition = pos;

    layer.batchDraw();
})

toolSelection.addEventListener("change", function(){
    mode = toolSelection.value;
})

// write functions to calculate the distance and angle
function getDistance(point1, point2){
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
}

function getAngle(point1, point2) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.atan2(dy,dx);
}

function stampBrush(start, end, brushSource, size) {
    const distance = getDistance(start, end);
    const angle = getAngle(start, end);

    for (let z = 0; z < distance; z ++){
        const x = start.x + Math.cos(angle) * z - size / 2;
        const y = start.y + Math.sin(angle) * z - size / 2;

        context.drawImage(brushSource, x, y, size, size);
    }
}


// I found this drawImage way to update brush is more straight forward than 'save, then load'.
// because it doesn't have the loading process.
// I plan to use toDataUrl while I'm building my brush library.
function updateBrushFromCurrentCanvas(){
    brushContext.clearRect(0, 0, brushCanvas.width, brushCanvas.height);
    brushContext.drawImage(
        canvas,
        0,0, canvas.width, canvas.height,
        0,0,brushCanvas.width,brushCanvas.height
    )
}


