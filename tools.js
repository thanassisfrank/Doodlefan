// tools.js
// defines the tools for the program

export var tools = {
    empty: {
        name: "No tool",
        tool: new Tool()
    },
    pen: {
        Name: "Pen",
        tool: new Pen()
    }
}

// the base tool class
function Tool() {
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