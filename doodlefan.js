// Wheels.js
// By Thanassis Frank
// started on 8-10-2016
// version 0.1

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
window.onload = () => {
	inputText = textContent.placeholder;
	textContent.addEventListener("change", function(){
		inputText = this.value + " ";
		textIndex = 0;
		updatePreview();
	});
}

// throughout, colors are represented in arrays in the form [r,g,b,a]

var isDrawing = false;
var mouseX;
var mouseY;
var prevMouseX = mouseX;
var prevMouseY = mouseY;
var backgroundIMG = "clear";
var selectedTool = 0;
var inputText = "";

var firstCall = true;
var textIndex;
var lastLetterX;
var lastLetterY;

var WIDTH = widthSlider.value;
var COLOR = [0,0,0,1];

// image fetching ---------------------------------------------------------------
var createImg = (url) => {
	img = new Image();
	img.crossOrigin = "Anonymous";
	img.src = url;
	return img;
}

var bgIMGs = {0:"clear"};

var opts = bgSelector.children;

for (let i = 0; i < opts.length; i++) {
	let src = opts[i].dataset.src
	if (src != undefined) {
		bgIMGs[i] = createImg(src);
	}
}

// main canvas setup ------------------------------------------------------------

var canvas = document.getElementById("canvas");
canvas.width = 1169;
canvas.height = 827;
var ctx = canvas.getContext("2d");
clearCanvas();

function recalculateOffsets() {
	rect = canvas.getBoundingClientRect();
	xDrawOffset = rect.left;
	yDrawOffset = rect.top;
};
recalculateOffsets();

document.body.onscroll = recalculateOffsets;
document.body.onresize = recalculateOffsets;

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
const story = "I do not wish to add any more We must learn to negotiate the vast quantity that exists Mastery of information and its dissemination Being emotionally moved by that process The Web as ways of constructing literature Word processing, databasing, recycling, appropriation, intentional plagiarism, identity ciphering, and intensive programming How ideas of literature have been shared, riffed, culled, reused, recycled, swiped, stolen, quoted, lifted, duplicated, gifted, appropriated, mimicked, and pirated for as long as literature has existed Rich fruits of shared culture 'patchwriting,' a way of weaving together various shards of other people’s words In academic, patchwriting is considered an offence Moving language from one place to another Context is the new content Language hoarders The new writing has an electronic gleam it is eye Results are distinctly analog Celebration Enthusiasm for the future Joy Moments of unanticipated beauty Planning and decisions are made beforehand An explosion of writers employing strategies of copying and appropriation Cutting and pasting are integral to the writing process Cutting and pasting all that time Cutting and pasting Plagiaristic tendencies Intentionally 'unoriginal' Inauthenticity Falseness Unoriginality Art Music Tracks constructed from other tracks Commonplace Lost opportunity for literary creativity Writing is stuck A creative writer is an explorer A groundbreaker Liberation from constraints Students Penalised for… originality and creativity Rewarded for plagiarism Identity theft, repurposing papers, patchworking, sampling, plundering and steeling Thrive Reframed Technology driven Democratic classroom Party host Traffic cop Full-time enabler The act of choosing and reframing tells us as much about ourselves as our story To question Tear down clichés Reconstruct Contemporary Relevant Accused of robbing Authorless Nameless Code Cutting and pasting Choose Knowing What to include What to leave out Throw judgement and quality out of the window – trouble A recipe for disaster It’s impossible to suspend judgement Folly to dismiss quality If you don’t want it copied, don’t put it online Unsigned Unauthored Authorship in a more conceptual way The mainstream and avant-garde Rarely intersecting Digital culture Collision";
const story2 = "Together: One, two, three friends are on an adventure to build a playground. Look! What a BIG bucket you have. All the better to collect water with! MY water! MY water! Go away! Go away! One, two, three friends move on without delay. What a BIG web you have! All the easier to stop you with! MY water! MY water! Go away! Go away! Ok, ok, ok! One, two, three friends move on without delay. Look! What a BIG mouth you have! All the better to eat you with! MY water! MY water! Go away! Go away! Then suddenly ... It gets darker and darker ... and the waves get bigger and bigger. They splash and they crash. Oh no! Help! Help! Help! Help! Hold on! I've got you! Help! Help! Watch! Watch! Big wave! Big wave! I'll get it! That was so close. One, two, three, four, five, six friends build a playground. Look!"
var storyStroke = function (x ,y, context, width, color) {textStroke(x ,y, context, width, color, story)}
var storyStroke2 = function (x ,y, context, width, color) {textStroke(x ,y, context, width, color, story2)}

var tools = [normal, squares, spray, chalk, textStamp, textStroke, storyStroke2];

// canvas events ----------------------------------------------------------------

canvas.addEventListener("mousemove", function(){
	mouseX = event.clientX - xDrawOffset;
	mouseY = event.clientY - yDrawOffset;
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
		textPreview.style.fontSize = WIDTH +"px";
		textPreview.style.color = toRGBString(COLOR);
	} else {
		var temp1 = prevMouseX;
		var temp2 = prevMouseY;
		prevMouseX = 50.0001;
		prevMouseY = 50.0001;
		ctx2.clearRect(0,0,100,100);
		draw(50, 50, ctx2, WIDTH, COLOR);
		prevMouseX = temp1;
		prevMouseY = temp2;
	}
};

updatePreview();

function saveCanvasState() {
	console.log("saved")
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

function changeTool(){
	selectedTool = toolSelector.selectedIndex;
	if (selectedTool == 4 || selectedTool == 5) {
		textContent.style.display = "inline";
		textLabel.style.display = "inline";	

		textPreview.style.display = "inline";

		toolPreview.style.display = "none";
	}else if (selectedTool > 5) {
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
	if (selectedTool == 4 || selectedTool == 5) {
		tools[selectedTool](x, y, context, width, color, inputText)
	} else {
		tools[selectedTool](x, y, context, width, color);
	}
};

function addImage(){
	var ind = bgSelector.selectedIndex;
	console.log(ind);
	img = bgIMGs[ind];
	if(img == "clear"){
		clearCanvas();
	}else{
		clearCanvas();
		ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, canvas.width, canvas.height);
	};
};

function watermark(ctx){
	var size = 15;
	var spacing = 6;
	var y = canvas.height - spacing;
	ctx.font = size + "px Verdana";
	ctx.fillStyle = "rgba(150, 150, 150)";
	ctx.textAlign = "right";
	text = "Created with Doodlefan licensed under CC-BY-NC"
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
	active = document.activeElement.tagName;
	console.log(active)
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

var main = setInterval(function(){
	if(isDrawing == true){
		draw(mouseX, mouseY, ctx, WIDTH, COLOR);
	};
}, 1);





