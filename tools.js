// tools.js
// defines the tools for the program

// the base tool class
function Tool() {
    this.setColour = function(col){};
    this.setWidth = function(width){};
    this.startStroke = function(){};
    this.addPoint = function(){};
    this.endStroke = function(){}
};

function Pen() {
    Tool.call(this);
}