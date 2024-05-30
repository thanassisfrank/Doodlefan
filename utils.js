// utils.js

export var get = (id) => {
    return document.getElementById(id)
}

export var getClass = (className) => {
    return document.getElementsByClassName(className);
}

export var isVisible = (elem) => {
    return getComputedStyle(elem).display.toLowerCase() != "none";
}

export var hide = (elem) => {
    elem.style.display = "none";
}

export var show = (elem) => {
    elem.style.display = "block";
}

export var getCtx = (canvas, type) => {
    return canvas.getContext(type);
}

export var create = (type) => {
    return document.createElement(type);
}

export var removeAllChildren = (elem) => {
    while (elem.firstChild) {
        elem.removeChild(elem.firstChild);
    }
}

export var getFirstOfClass = (className) => {
    return document.getElementsByClassName(className)[0];
}

export var getInputClassAsObj = (className) => {
    var out = {};
    for (let input of getClass(className)) {
        out[input.name] = input;
    }
    return out;
}

// turns file string into an xml dom
export var parseXML = (xmlStr) => {
    var parser = new DOMParser();
    return parser.parseFromString(xmlStr, "text/xml");
}

export var xyzToA = (obj) => {
    return [obj.x, obj.y, obj.z];
}

export var getXMLContent = (node) => {
    return node.firstChild.nodeValue;
}


// class for keeping a track of times (for benchmarking)
function Timer() {
    this.maxSamples = 600;
    // contains entries of form
    // {
    //     avg: Number,       the mean time
    //     var: Number,       the variance of the samples
    //     stdDev: Number,    the standard deviation
    //     running: Boolean,  if timer is currently running
    //     startTime: Number  time in
    //     samples: [Sample]  past samples
    // }
    //
    // the samples are in the form
    // [Number, Number]       time, data (vert#)
    this.times = {}
    this.start = function(key) {
        if (!this.times[key]) {
            this.times[key] = {
                avg: null, 
                var: null,
                stdDev: null,
                running: false, 
                startTime: null, 
                samples: []
            };
        }
        if (this.times[key].running) {
            this.stop(key);
        }
        this.times[key].startTime = performance.now();
        this.times[key].running = true;
    };
    this.stop = function(key, data) {
        if (this.times[key].running) {
            const t = performance.now() - this.times[key].startTime
            const l = this.times[key].samples.unshift([t, data | "empty"]);
            if (l > this.maxSamples) {
                this.times[key].samples.pop();
            }
            this.times[key].running = false;
        }
    };
    this.calculateAvg = function() {
        for (let key in this.times) {
            const num = this.times[key].samples.length
            if (num == 1) {
                this.times[key].avg = this.times[key].samples[0][0];
            } else {
                const total = this.times[key].samples.reduce((a,b) => a+b[0], 0);
                this.times[key].avg = total/num;
            }
        }
    };
    this.calculateVar = function() {
        for (let key in this.times) {
            const num = this.times[key].samples.length;
            if (num == 1) {
                this.times[key].var = 0;
                this.times[key].stdDev = 0;
                continue;
            }
            const m = this.times[key].avg;
            const sum = this.times[key].samples.reduce((a,b)=> a + Math.pow(b[0] - m, 2), 0);
            this.times[key].var = sum/num;
            this.times[key].stdDev = Math.pow(sum/num, 0.5);

        }
    };
    this.log = function() {
        this.calculateAvg();
        this.calculateVar();
        console.table({...this.times, empty: {avg:undefined}}, ["avg", "stdDev"]);
    }
    this.logSamples = function(key) {
        if (!this.times[key]) return false;
        console.table(this.times[key].samples);
        return this.times[key].samples.length;
    }
    this.copySamples = function(key) {
        if (!this.times[key]) return false;
        let str = "";
        for (let sample of this.times[key].samples) {
            str += sample[1] + "\t" + sample[0] + "\n";
        }
        navigator.clipboard.writeText(str);
        return this.times[key].samples.length;
    }
}

export var timer = new Timer();