// Wheels.js
// By Thanassis Frank
// started on 8-10-2016
// latest commit: 06-2024
// version 0.1

import {get, getClass, create} from "./utils.js";

// get HTML objects -------------------------------------------------------------

var R = document.getElementById("redLevel");
var G = document.getElementById("greenLevel");
var B = document.getElementById("blueLevel");
var A = document.getElementById("alphaLevel");
var currentWidth = document.getElementById("currentWidth");
var widthSlider = document.getElementById("widthSlider");
var bgSelector = document.getElementById("backgroundSelector");
var toolSelector = document.getElementById("toolSelector");
var textContent = document.getElementById("textContent");
var textPreview = document.getElementById("textPreview");
var textLabel = document.getElementById("textLabel");
var nameInput = document.getElementById("nameInput");
var popups = document.getElementsByClassName("popup");
var popupCont = document.getElementById("popupCont");
var undoBtn = document.getElementById("undoBtn");

var inputText


// throughout, colors are represented in arrays in the form [r,g,b,a]

var isDrawing = false;
var mouseX;
var mouseY;
var prevMouseX = mouseX;
var prevMouseY = mouseY;
var canvasScale = 1;
var backgroundIMG = "clear";
var selectedTool = "Normal";
var inputText = "";

var firstCall = true;
var textIndex;
var lastLetterX;
var lastLetterY;

var WIDTH = widthSlider.value;
var COLOR = [0,0,0,1];

var rect;

var xDrawOffset = 0;
var yDrawOffset = 0;

// image fetching ---------------------------------------------------------------
// var createImg = (url) => {
// 	var img = new Image();
// 	img.crossOrigin = "Anonymous";
// 	img.src = url;
// 	return img;
// }

// // var bgIMGs = {0:"clear"};

// // var opts = bgSelector.children;

// // for (let i = 0; i < opts.length; i++) {
// // 	let src = opts[i].dataset.src
// // 	if (src != undefined) {
// // 		bgIMGs[i] = createImg(src);
// // 	}
// // }

// main canvas setup ------------------------------------------------------------

var canvas = document.getElementById("canvas");
canvas.width = 1920;
canvas.height = 1080;
var ctx = canvas.getContext("2d");

// scale canvas properly
function getFullCanvasScale() {
	// window height - toolbar size - padding amount
	var areaHeightStr = getComputedStyle(document.getElementById("edit-area-container")).height;
	var areaHeight = parseFloat(areaHeightStr.substring(0, areaHeightStr.length - 2));
	console.log(areaHeight);
	return areaHeight/canvas.height *0.9;
}

function setCanvasScale(scale) {
	canvasScale = scale;
	canvas.style.height = canvas.height * canvasScale + "px";
	canvas.style.width = canvas.width * canvasScale + "px";
}

function recalculateOffsets() {
	rect = canvas.getBoundingClientRect();
	xDrawOffset = rect.left;
	yDrawOffset = rect.top;
};

// brush preview canvas setup ---------------------------------------------------

var canvas2 = document.getElementById("toolPreview");
canvas2.width = 100;
canvas2.height = 100;
var ctx2 = canvas2.getContext("2d");

// save canvas setup ------------------------------------------------------------
var saveCanvas = document.getElementById("saveCanvas");
saveCanvas.width = canvas.width;
saveCanvas.height = canvas.height;
var ctx3 = saveCanvas.getContext("2d");

// previous canvas setup (undo) -------------------------------------------------
const undoNum = 3;
var newestPtr = -1;
var ctxPrev = []
for (let i = 0; i < undoNum; i++) {
	var prevCanvas = document.createElement("canvas");
	prevCanvas.width = canvas.width;
	prevCanvas.height = canvas.height;
	ctxPrev.push(prevCanvas.getContext("2d"));
}

var savedStates = 0

// toColString ------------------------------------------------------------------

function toRGBString(colArray){
	return "rgba(" + colArray[0] + "," + colArray[1] + "," + colArray[2] + "," + colArray[3] + ")";
};

// tools ------------------------------------------------------------------------

var normal = function(x, y, context, width, color){
	context.lineCap = "round";
	context.lineWidth = width;
	context.strokeStyle = toRGBString(color);
	context.beginPath();
	context.moveTo(prevMouseX, prevMouseY);
	context.lineTo(x, y);
	context.stroke();
	prevMouseX = x;
	prevMouseY = y;
};

var squares = function(x, y, context, width, color){
	context.fillStyle = toRGBString(color);
	context.beginPath();
	context.fillRect(x - width/2, y - width/2, width, width);
	context.fill();
};

var spray = function(x, y, context, width, color){
	context.fillStyle = toRGBString(color);
	for(var i = 0; i < Math.round(width*1.5); i++){
		var distance = Math.random()*width - width/2;
		var angle = Math.random()*2*Math.PI;
		var x2 = Math.cos(angle)*distance;
		var y2 = Math.sin(angle)*distance;
		context.beginPath();
		context.arc(x + x2, y + y2, width/10, 0, Math.PI*2);
		context.fill();
	};
};

var chalk = function(x, y, context, width, color){
	context.lineCap = "round"
	context.strokeStyle = toRGBString(color);
	context.lineWidth = 2;
	for(var i = 0; i < Math.round(Math.pow(width, 1.1)); i++){
		var distance = Math.random()*width - width/2;
		var angle = Math.random()*2*Math.PI;
		var x2 = Math.cos(angle)*distance;
		var y2 = Math.sin(angle)*distance;
		context.beginPath();
		context.moveTo(prevMouseX + x2, prevMouseY + y2);
		context.lineTo(x + x2, y + y2);
		context.stroke();
	};
	prevMouseX = x;
	prevMouseY = y;
};

var textStamp = function(x, y, context, width, color, text){
	context.font = width + "px Verdana";
	context.fillStyle = toRGBString(color);
	context.textAlign = "center";
	context.fillText(inputText, x, y + width/2);
};

var textStroke = function(x, y, context, width, color, text){
	if(firstCall == true){
		textIndex = 0;
		firstCall = false;
	};
	context.fillStyle = toRGBString(color);
	context.textAlign = "center";
	context.save();
	var angle = Math.atan2(y - prevMouseY , x - prevMouseX);
	var distance = Math.sqrt(Math.pow(y - prevMouseY, 2) + Math.pow(x - prevMouseX, 2));
	if(distance >= width/2){
		//width = distance - width/2;
		context.font = width + "px Verdana";
		context.translate(x, y);
		context.rotate(angle);
		context.fillText(text[textIndex], 0, 0 + width/2);
		textIndex = (textIndex + 1) % text.length;
		prevMouseX = x;
		prevMouseY = y;
	};
	context.restore();
};
var creativityStory = "Living in the uncomfort zone... Curiosity to explore. To experiment. To play. Searching for questions and answers. More questions. Questions move us, move us into new/alternative directions. Ideas are born through questioning, through imagining things, through novel connections. Linked to desires, a need, a mission, an opportunity, a challenge AND adversity. They signal hope. They push boundaries. They (can) rattle normality, tradition, conformity. Resourcefulness is the oxygen of life. Without imagination and creativity it doesn’t mean anything. To make things happen for the better, with nothing, very little, or everything we have. For us (and for others). And there is joy. The joy of life and being alive. Sun. Sea. Mountains. Blueberries. Tomatoes. Watermelon. Rain. Snow. Sight. Smell. Taste. Sound. Touch. Adventures. Art. Friends. Family. People. Warmth. Love. Care. Disappointment. Rejection. Loneliness. Emotions in abundance. Highs AND lows. All four seasons in a moment or two. Create and live in your uncomfort zone (for a little while or a bit longer). Be comfortable there. Challenge and be challenged. Stretch. Risk. Fail. Pick yourself up again. And again. It is a rollercoaster. Not on a fixed track. Surprises are just around the corner. Go for it! Make things happen. Transform. Creativity doesn’t mean being loud or visible or artistic. We can be bold in a quiet way. Whatever we do. With our thinking, ideas and actions. Immerse into (im)possibilities. Make surprising discoveries. About ourselves, others and the world we live in. (Chrissi Nerantzi, 2019)";
var creativeStroke = function (x ,y, context, width, color) {textStroke(x ,y, context, width, color, creativityStory)}
var togetherStory = "Together: One, two, three friends are on an adventure to build a playground. Look! What a BIG bucket you have. All the better to collect water with! MY water! MY water! Go away! Go away! One, two, three friends move on without delay. What a BIG web you have! All the easier to stop you with! MY water! MY water! Go away! Go away! Ok, ok, ok! One, two, three friends move on without delay. Look! What a BIG mouth you have! All the better to eat you with! MY water! MY water! Go away! Go away! Then suddenly ... It gets darker and darker ... and the waves get bigger and bigger. They splash and they crash. Oh no! Help! Help! Help! Help! Hold on! I've got you! Help! Help! Watch! Watch! Big wave! Big wave! I'll get it! That was so close. One, two, three, four, five, six friends build a playground. Look!";
var togetherStroke = function (x ,y, context, width, color) {textStroke(x ,y, context, width, color, togetherStory)}

var tools = {
	"Normal": normal, 
	"Squares": squares, 
	"Spray": spray, 
	"Chalk": chalk, 
	"Text stamp": textStamp, 
	"Text stroke": textStroke, 
	"Creativity Manifesto": creativeStroke, 
	"Together story": togetherStroke
};

// canvas events ----------------------------------------------------------------

canvas.addEventListener("mousemove", function(e){
	mouseX = (e.clientX - xDrawOffset) / canvasScale;
	mouseY = (e.clientY - yDrawOffset) / canvasScale;
});

canvas.addEventListener("mousedown", function(){
	saveCanvasState();
	prevMouseX = mouseX;
	prevMouseY = mouseY;
	//if (selectedTool == 5) textIndex = 0;
	isDrawing = true;
});

document.body.addEventListener("mouseup", function(){
	isDrawing = false;
});

// functions --------------------------------------------------------------------

function updatePreview(){
	if (selectedTool > 3) {
		textPreview.style.fontSize = WIDTH * canvasScale +"px";
		textPreview.style.color = toRGBString(COLOR);
	} else {
		var temp1 = prevMouseX;
		var temp2 = prevMouseY;
		prevMouseX = 50.0001;
		prevMouseY = 50.0001;
		ctx2.clearRect(0,0,100,100);
		draw(50, 50, ctx2, WIDTH * canvasScale, COLOR);
		prevMouseX = temp1;
		prevMouseY = temp2;
	}
};

updatePreview();

function saveCanvasState() {
	// console.log("saved")
	newestPtr = (newestPtr + 1) % ctxPrev.length;
	ctxPrev[newestPtr].drawImage(canvas, 0, 0);
	savedStates = Math.min(ctxPrev.length, savedStates + 1)
	undoBtn.disabled = false;
}

function undo() {
	console.log("undo")
	if (savedStates > 0) {
		ctx.drawImage(ctxPrev[newestPtr].canvas, 0, 0)
		newestPtr = (ctxPrev.length + newestPtr-1) % ctxPrev.length;
		console.log("ptr",newestPtr)
		savedStates--;
		if (savedStates == 0) {
			undoBtn.disabled = true;
		}	
	}
}

function clearCanvas(){
	textIndex = 0;
	ctx.fillStyle = "#ffffff";
	ctx.fillRect(0,0, canvas.width, canvas.height);
};

function clearDoodles(){
	clearCanvas();
	//ctx.drawImage(backgroundIMG, 0, 0);
	addImage();
};

function changeCol(){
	COLOR = [R.value, G.value, B.value, A.value];
	updatePreview();
};

function changeWidth(){
	WIDTH = widthSlider.value;
	currentWidth.innerHTML = WIDTH+"px";
	updatePreview();
};

function changeTool(name){
	selectedTool = name;
	if (selectedTool == "Text Stamp" || selectedTool == "Text stroke") {
		textContent.style.display = "inline";
		textLabel.style.display = "inline";	

		textPreview.style.display = "inline";

		toolPreview.style.display = "none";
	}else if (selectedTool == "Creativity Manifesto" || selectedTool == "Together story") {
		textContent.style.display = "none";
		textLabel.style.display = "none";	

		textPreview.style.display = "inline";

		toolPreview.style.display = "none";
	} else {
		textContent.style.display = "none"
		textLabel.style.display = "none";

		textPreview.style.display = "none";

		toolPreview.style.display = "inline";
	};
		
	updatePreview();
};

function draw(x, y, context, width, color){
	if (selectedTool == "Text Stamp" || selectedTool == "Text stroke") {
		tools[selectedTool](x, y, context, width, color, inputText)
	} else {
		tools[selectedTool](x, y, context, width, color);
	}
};

async function addImage(url){
	console.log(url);
	clearCanvas();
	if(url){    
        let response = await fetch(url, {method: "GET"})
    
        if (response.status != 200) {
			console.log("image couldn't be fetched");
			return;
		}
            
        const imgBlob = await response.blob()
		const img = await createImageBitmap(imgBlob);
		console.log(img);
		// insert image on canvas to ensure a fit, don't crop
		var canvasAspect = canvas.width/canvas.height;
		var imgAspect = img.width/img.height;
		if (imgAspect > canvasAspect) {
			// image is wider and shorter than canvas, limited by width
			var imgScaledHeight = img.height * canvas.width/img.width;
			var yOffset = (canvas.height - imgScaledHeight)/2;
			ctx.drawImage(img, 0, 0, img.width, img.height, 0, yOffset, canvas.width, imgScaledHeight);
		} else {
			// image is narrower and taller than canvas, limited by height
			var imgScaledWidth = img.width * canvas.height/img.height;
			var xOffset = (canvas.width - imgScaledWidth)/2;
			ctx.drawImage(img, 0, 0, img.width, img.height, xOffset, 0, imgScaledWidth, canvas.height);
		}
	};
};

function watermark(ctx){
	var size = 15;
	var spacing = 6;
	var y = canvas.height - spacing;
	ctx.font = size + "px Verdana";
	ctx.fillStyle = "rgba(150, 150, 150)";
	ctx.textAlign = "right";
	var text = "Created with Doodlefan licensed under CC-BY-NC"
	if (nameInput.value) {
		text += " remixed by";
		ctx.fillText(text, canvas.width-4, y-size-spacing);
		ctx.fillText(nameInput.value, canvas.width-4, y);
	} else {
		ctx.fillText(text, canvas.width-4, y);
	};
};

function getFinalData(canvas) {
	ctx3.drawImage(canvas, 0, 0)
	watermark(ctx3);
	return saveCanvas.toDataURL();
}

function saveImage(){
	var download = document.createElement("a");
	download.href = getFinalData(canvas);
	download.download = "img.png"
	document.body.appendChild(download);
	download.click();
};

function hideElement(elem) {
	elem.classList.add("hidden");
}

function showElement(elem) {
	elem.classList.remove("hidden");
}

function hidePopups(){
	var active = document.activeElement.tagName;
	// console.log(active)
	if (active != "INPUT" && active != "BUTTON") {
		for (let i = 0; i < popups.length; i++) {
			hideElement(popups[i]);
		};
		hideElement(popupCont);
	}
}

function openPopup(id) {
	showElement(document.getElementById(id));
	showElement(popupCont);
}

// main function
document.body.onload = main;

function main() {
	// setup canvas scaling handling
	setCanvasScale(getFullCanvasScale());
	recalculateOffsets();

	window.addEventListener("scroll", () => {
		recalculateOffsets();
		console.log("scrolled");
	});
	get("edit-canvas-container").addEventListener("scroll", () => {
		recalculateOffsets();
	})
	window.addEventListener("resize", () => {
		recalculateOffsets();
		updatePreview();
	});
	get("canvas").addEventListener("wheel", (e) => {
		if (e.ctrlKey) {
			setCanvasScale(canvasScale*(1-(e.deltaY/1000)));
			recalculateOffsets();
			updatePreview();
		}
	});
	clearCanvas();


	// setup the input elements
	inputText = textContent.placeholder;
	textContent.addEventListener("change", (e) => {
		inputText = e.target.value + " ";
		textIndex = 0;
		updatePreview();
	});
	console.log(window.appData);

	toolSelector.addEventListener("change", (e) => {
		changeTool(e.target.value);
	})

	for (let slider of getClass("colSlide")) {
		slider.addEventListener("input", (e) => {changeCol()});
	}

	get("backgroundSelector").addEventListener("change", (e) => {
		addImage(e.target.value);
	});

	get("widthSlider").addEventListener("input", (e) => {
		changeWidth();
	});

	get("clear-btn").addEventListener("click", (e) => {
		clearDoodles();
	})

	get("open-save-dialog-btn").addEventListener("click", (e) => {
		openPopup("savePopup");
	})
	get("open-help-dialog-btn").addEventListener("click", (e) => {
		openPopup("helpPopup");
	})
	get("undoBtn").addEventListener("click", (e) => {
		undo();
	})
	get("popupCont").addEventListener("click", (e) => {
		hidePopups();
	})
	get("save-btn").addEventListener("click", (e) => {
		saveImage();
	})

	// setup the correct tools
	selectedTool = "Normal"
	var toolSelectorElem = get("toolSelector");
	var toolNames = window.appData.brushes;
	for (let toolName of toolNames) {
		var optElem = create("OPTION");
		optElem.value = toolName;                
		optElem.innerText = toolName;
		toolSelectorElem.appendChild(optElem);
	}

	// setup the correct background images
	var imageSelectorElem = get("backgroundSelector");
	var images = window.appData.images;
	for (let image of images) {
		var optElem = create("OPTION");
		optElem.value = image.src;                
		optElem.innerText = image.name;
		imageSelectorElem.appendChild(optElem);
	}

	mainLoop();
}

function mainLoop() {
	if(isDrawing == true){
		draw(mouseX, mouseY, ctx, WIDTH, COLOR);
	};
	requestAnimationFrame(mainLoop);
}





