// tools.js
// defines the tools for the program

// they all share a common interface for drawing paths
// > startPath
//   > ctx -> canvas2d context to draw to
//   > pos -> [x, y] pixel coords in canvas

export var tools = {
    empty: Tool,
    pen: Pen,
}

// the base tool class
function Tool() {
    this.name = "Empty";
    this.colour = [0, 0, 0, 1];
    this.width = 0;
    this.setColour = function(col){
        this.colour = col;
    };
    this.setWidth = function(width){
        this.width = width;
    };
    this.startPath = function(){};
    this.extendPath = function(){};
    this.endPath = function(){}
};

// basic stroke drawing
function Pen() {
    Tool.call(this);
    this.name = "Pen";
    this.prevPoints = [];
    this.startPath = function(ctx, pos) {
        this.prevPoints = [pos];
    }
    this.extendPath = function(ctx, pos, dt) {

    }
    this.endPath = function(ctx, pos, dt) {

    }
}

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

function FountainPen() {
    Pen.call(this);
}