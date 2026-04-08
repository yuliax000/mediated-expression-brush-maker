// reference link: https://konvajs.org/docs/sandbox/Free_Drawing.html
// find elements
const toolSelection = document.getElementById("tools");
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
context.strokeStyle = "var(--col01)";
context.lineJoin = "round"
context.lineWidth = 5;

let isPaint = false;
let lastPointerPosition;
let mode = "brush";

image.on("mousedown touchstart", function(){
 isPaint = true;
 lastPointerPosition = stage.getPointerPosition();
})

stage.on("mouseup touchend", function(){
    isPaint = false;
})

stage.on("mousemove touchmove", function(){
    if(!isPaint){}
})