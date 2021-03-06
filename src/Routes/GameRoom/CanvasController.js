import commends from "../../Socket/Commends";
import { getSocket } from "../../Socket/Socket";


let canvas=''
let ctx=''
let colors=[]
let mode=''
let controls = ''
let lastx;
let lasty;
export const INITIAL_COLOR = "black";
const WINDOWSIZE = window.screen.width;
const CANVAS_PIXEL = 1200;

export const initCanvas = () =>{
  canvas = document.getElementById("jsCanvas");
  
  ctx = canvas.getContext("2d");
  colors = document.getElementsByClassName("jsColor");
  controls = document.getElementById("jsControls");
  mode = document.getElementById("jsMode");

  canvas.width = CANVAS_PIXEL;
  canvas.height = CANVAS_PIXEL;
  
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, CANVAS_PIXEL, CANVAS_PIXEL);
  ctx.strokeStyle = INITIAL_COLOR;
  ctx.fillStyle = INITIAL_COLOR;
  ctx.lineWidth = 2.5;

  Array.from(colors).forEach((color) =>
  color.addEventListener("click", handleColorClick)
  );

  if (mode) {
    mode.addEventListener("click", handlePaintClick);
  }
  resetCanvas();
  disableCanvas();
  hideControls();
}
let painting = false;


function stopPainting(event) {
  const x = event.offsetX*2;
  const y = event.offsetY*2;
  if(WINDOWSIZE >=600){
    dot(x, y)
  }
  painting = false;
}

function startPainting() {
  painting = true;
}

function dot(x,y) {
  ctx.beginPath();
  ctx.arc(x,y,1,0,Math.PI*2,true);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
  getSocket().emit(commends.drawDot,{x, y})
}
export const handleDot = ({data})=> {
  ctx.beginPath();
  ctx.arc(data.x, data.y ,1,0,Math.PI*2,true);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
}


const touchstart = (event) => {     
  var rect = canvas.getBoundingClientRect();                      
  const x = Math.floor(((event.touches[0].clientX - rect.left)/WINDOWSIZE)*1200);
  const y = Math.floor(((event.touches[0].clientY - rect.top)/WINDOWSIZE)*1200);
  
  beginPath(x, y);
  getSocket().emit(commends.beginPath, { x, y });
}

const touchmove = (event) => {    
  event.preventDefault();                           
  var rect = canvas.getBoundingClientRect();
  const x = Math.floor(((event.touches[0].clientX - rect.left)/WINDOWSIZE)*1200);
  const y = Math.floor(((event.touches[0].clientY - rect.top)/WINDOWSIZE)*1200);

  strokePath(x, y);
  getSocket().emit(commends.strokePath, 
    {x, y, color: ctx.strokeStyle});
}

const touchend = (event) => {                           

  
  var rect = canvas.getBoundingClientRect();
  const x = Math.floor(((event.changedTouches[0].clientX - rect.left)/WINDOWSIZE)*1200);
  const y = Math.floor(((event.changedTouches[0].clientY - rect.top)/WINDOWSIZE)*1200);
  dot(x,y);
  lastx=undefined;
  lasty=undefined;
}


const beginPath = (x, y) => {
  ctx.beginPath();
  ctx.moveTo(x, y);
};

const strokePath = (x, y, color = null) => {
  let currentColor = ctx.strokeStyle;
  if (color !== null) {
    ctx.strokeStyle = color;
  }
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.strokeStyle = currentColor;
};

function onMouseMove(event) {
  const x = event.offsetX*2;
  const y = event.offsetY*2;
  if (!painting) {
    beginPath(x, y);
    getSocket().emit(commends.beginPath, { x, y });
  } else {
    strokePath(x, y);
    getSocket().emit(commends.strokePath, {
      x,
      y,
      color: ctx.strokeStyle,
    });
  }
}

function handleColorClick(event) {
  const color = event.target.id;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
}

function handlePaintClick() {
  fill();
  getSocket().emit(commends.fill, ctx.fillStyle)
}

const fill = (color = null) => {
  let currentColor = ctx.fillStyle;
  if (color !== null) {
    ctx.fillStyle = color;
  }
  ctx.fillRect(0, 0, CANVAS_PIXEL, CANVAS_PIXEL);
  ctx.fillStyle = currentColor;
};


function handleCM(event) {
  event.preventDefault();
}


export const handleBeganPath = ({ x, y }) => {
  beginPath(x, y);
};
export const handleStrokedPath = ({ x, y, color }) => {
  strokePath(x, y, color);
};
export const handleFilled = ({ color }) => {
  fill(color);
};
export const disableCanvas = () => {
  canvas.removeEventListener("mousemove", onMouseMove);
  canvas.removeEventListener("mousedown", startPainting);
  canvas.removeEventListener("mouseup", stopPainting);
  canvas.removeEventListener("mouseleave", stopPainting);
  canvas.removeEventListener("touchstart", touchstart);
  canvas.removeEventListener("touchmove", touchmove);
  canvas.removeEventListener("touchend", touchend);
};

export const enableCanvas = () => {
  canvas.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("mousedown", startPainting);
  canvas.addEventListener("mouseup", stopPainting);
  canvas.addEventListener("mouseleave", stopPainting);
  canvas.addEventListener("touchstart", touchstart);
  canvas.addEventListener("touchmove", touchmove);
  canvas.addEventListener("touchend", touchend);
};

export const hideControls = () => {
  controls.style.visibility = "hidden";
};
export const showControls = () => {
  controls.style.visibility = "visible";
};
export const resetCanvas = () => {
  fill("#fff");
}
if (canvas) {
  canvas.addEventListener("contextmenu", handleCM);
}