

//I use a modal to guide users simply when first open the page.
// A guide box that can be opened with a single click to provide more detailed instructions.

// reason: 1. clear and simple
//         2. Placed at the beginning, so it doesn’t interrupt the user experience.
//         3. if users need help, they can find the instruction in the page manually,
// providing options for users with different drawing experience.

const startGuide = document.getElementById("startGuide");
const closeDialog = document.getElementById("closeDialog");
startGuide.showModal();

closeDialog.addEventListener("click", () => {
    startGuide.close();
})


const guideBtn = document.getElementById("guide");
const guideDialog = document.getElementById("guideDialog");
const closeGuide = document.getElementById("closeGuide");


guideBtn.addEventListener("click", () => {
    guideDialog.show();
})

closeGuide.addEventListener("click", () => {
    guideDialog.close();
})

// 1. draw manually method (from konva.js website https://konvajs.org/docs/sandbox/Free_Drawing.html)

// The original tutorial used a select dropdown as the tool option,
// but I changed it to buttons because buttons can display the options more intuitively.

const brushBtn = document.getElementById("brushBtn");
const eraserBtn = document.getElementById("eraserBtn");
const defaultModeBtn = document.getElementById("defaultModeBtn");
const generativeModeBtn = document.getElementById("generativeModeBtn");
const clearBtn = document.getElementById("clearBtn");



// define canvas size
const width = 580;
const height = 580;

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

const defaultBrushImage = new Image();

// to test if using image as brush source works
defaultBrushImage.src = "assets/defaultBrushSmall.png";

// create a new canvas containing canvas picture as brush canvas
const brushCanvas = document.createElement("canvas");
const brushContext = brushCanvas.getContext("2d");


// note: add slider to change brush and eraser size for final UI
let brushSize = 40;
//  to make brush preview clearer
let brushCanvasResolution = 120;



brushCanvas.width = brushCanvasResolution;
brushCanvas.height = brushCanvasResolution;

let eraserSize = 400;
let eraserSource = defaultBrushImage;

let isPaint = false;
let lastPointerPosition;
// If I use generative brush at the start, it will capture blank canvas to draw,
// there will be nothing appears on canvas.
// Therefore, I decide to prepare two mode for users to switch. They can decide to turn on or off the generative mode.

let drawMode = "brush";
let brushMode = "default";

// the drawing will start after there is something on the canvas.
let hasCanvasContent = false;
let currentBrushSource = defaultBrushImage;

// add click events to buttons
brushBtn.addEventListener("click", () => {
    drawMode = "brush";
})
eraserBtn.addEventListener("click", () => {
    drawMode = "eraser";
})
defaultModeBtn.addEventListener("click", () => {
    brushMode = "default";
    syncBrushPreview();
})
generativeModeBtn.addEventListener("click", () => {
    brushMode = "generative";
    syncBrushPreview();
})

clearBtn.addEventListener("click", () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    hasCanvasContent = false;
    layer.batchDraw();
})








//procedure: mousedown - default brush drawing - new canvas created - drawImage()


image.on("mousedown touchstart", function(){
   updateCurrentBrushSource();

    isPaint = true;
    lastPointerPosition = stage.getPointerPosition();
    if (!lastPointerPosition) return;

    if(drawMode === "brush") {
        stampSingle(lastPointerPosition, currentBrushSource, brushSize, "draw");
        hasCanvasContent = true;
    }

    if(drawMode === "eraser") {
        stampSingle(lastPointerPosition, eraserSource, eraserSize, "erase");

    }


//  test if I can use image to stamp
//     if (mode === "brush") {
//         const pos = stage.getPointerPosition();
//         context.drawImage(brushImage, pos.x - 20, pos.y - 20, 40, 40);
//         layer.batchDraw();
//     }
    layer.batchDraw()
})



stage.on("mouseup touchend", function(){
    if (isPaint && drawMode === "brush") {
        hasCanvasContent = true;
        if(brushMode === "generative") {
            updateBrushFromCurrentCanvas();
            currentBrushSource = brushCanvas;
            updateBrushPreview(currentBrushSource);
        }

    }
    isPaint = false;
});

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
        stampBrush(lastPointerPosition, pos, currentBrushSource, brushSize, "draw");


    }
    if (drawMode === "eraser") {
        stampBrush(lastPointerPosition, pos, eraserSource, eraserSize, "erase");
        // 1. original eraser
        // context.globalCompositeOperation = "destination-out";

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

// get a preview window. idea: create a new small canvas to show current main canvas container.
const previewCanvas = document.getElementById("previewCanvas");
const previewContext = previewCanvas.getContext("2d");


defaultBrushImage.onload = function(){
    syncBrushPreview();
}

previewContext.imageSmoothingEnabled = false;


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


let lastTime = performance.now();

function stampBrush(start, end, brushSource, size, mode = "draw") {
    const distance = getDistance(start, end);
    const angle = getAngle(start, end);

     context.save()

    if (mode === "erase") {
        context.globalCompositeOperation = "destination-out";
    } else {
        context.globalCompositeOperation = "source-over";
    }

    // Original version of generative brush.
    for (let z = 0; z < distance; z += 1.5){
        const x = start.x + Math.cos(angle) * z - size / 2;
        const y = start.y + Math.sin(angle) * z - size / 2;

        context.drawImage(brushSource, x, y, size, size);
    }


    // I want to add some counter-intuitive mapping into the project.
    // Faster drawing speed will cause denser pattern, while slower drawing speed create sparse result.
    // I also  add some randomness to the tool.

    // calculate the speed (doesn't work well, but keep it to see if I can refine it.)

    // let now = performance.now();
    // let time = Math.max(1, now - lastTime);
    // lastTime = now;

    // let speed= (distance / time) * 20;


    // let step = Math.max(2, 12 - distance * 0.8);

    // spray tool
    // for (let z = 0; z < distance; z += 1.5){
    //     const x = start.x + Math.cos(angle) * z - size / 2 + (Math.random() - 0.5) * 10;
    //     const y = start.y + Math.sin(angle) * z - size / 2 + (Math.random() - 0.5) * 10;
    //
    //     context.drawImage(brushSource, x, y, size, size);
    // }




    context.restore();
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

// Users can stamp a picture by clicking the mouse
// therefore they can create brushes by creating points (more expressive)
function stampSingle(point, brushSource, size, mode = "draw"){
    context.save();
    const x = point.x - size/2;
    const y = point.y - size/2;

    if(mode === "erase"){
        context.globalCompositeOperation = "destination-out";
    } else {
        context.globalCompositeOperation = "source-over";
    }

    context.drawImage(brushSource,x, y, size, size);
    context.restore();
}

// preview function
function updateBrushPreview(source) {
    previewContext.clearRect(0,0,previewCanvas.width, previewCanvas.height);
    const previewSize= 80;
    const x = (previewCanvas.width - previewSize) / 2;
    const y = (previewCanvas.height - previewSize) / 2;

    previewContext.drawImage(source, x,y, previewSize, previewSize);
}

// I need the preview window change as I change brush mode,
// so I write a function to update brush source separately
// then I can use this function in click events
function updateCurrentBrushSource(){
    if (brushMode === "default"){
        currentBrushSource = defaultBrushImage;
    }
    if (brushMode === "generative"){
        if (hasCanvasContent) {
            updateBrushFromCurrentCanvas()
            currentBrushSource = brushCanvas;
        } else{
            currentBrushSource = defaultBrushImage;
        }
    }
}

function syncBrushPreview(){
    updateCurrentBrushSource();
    updateBrushPreview(currentBrushSource);
}