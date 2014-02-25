"use strict";
var wodge = require("wodge"),
    util = require("util");

var sgr = {
    black: 30,
    red: 31,
    green: 32,
    yellow: 33,
    blue: 34,
    magenta: 35,
    cyan: 36,
    white: 37,
    bold: 1,
    underline: 4
};
var sgrFormat = "\x1b[%sm%s\x1b[0m";
var otherCodes = {
    hide: "?25l",
    show: "?25h"
};

var log = console.log,
    err = console.error,
    sgrFlags = [],
    otherFlags = [],
    out = console.writeStream || process.stdout;

var format = util.format;

util.format = function(){
    var output = format.apply(null, arguments);
    output = output.replace(/%u{(.*?)}/g, format(sgrFormat, sgr.underline, "$1"));
    // process.stdout.write(output + "\n");
    return output;
};

function addSgrProperty(flag){
    Object.defineProperty(console, flag, { 
        enumerable: true, 
        get: function(){
            sgrFlags.push(flag);
            return console;
        }
    });
}
Object.keys(sgr).forEach(addSgrProperty);

function addOtherProperty(flag){
    Object.defineProperty(console, flag, { 
        enumerable: true, 
        get: function(){
            otherFlags.push(flag);
            return console;
        }
    });
}
// Object.keys(otherCodes).forEach(addOtherProperty);


console.log = function(){
    var args = wodge.array(arguments),
        codes = sgrFlags.map(function(format){ return sgr[format]; });
        
    out.write(util.format("\x1b[%sm", codes.join(";")));
    out.write(otherFlags.reduce(function(prev, curr){
        return prev + "\x1b[" + otherCodes[curr];
    }, ""));
    log.apply(this, arguments);
    out.write("\x1b[0m");
    sgrFlags = [];
    return console;
};

console.error = function(){
    var args = wodge.array(arguments),
        codes = sgrFlags.map(function(format){ return sgr[format]; });
        
    process.stderr.write(util.format("\x1b[%sm", codes.join(";")));
    err.apply(this, arguments);
    process.stderr.write("\x1b[0m");
    sgrFlags = [];
    return console;
};

console.write = function(txt){
    var codes = sgrFlags.map(function(format){ return sgr[format]; });
    out.write(otherFlags.reduce(function(prev, curr){
        return prev + "\x1b[" + otherCodes[curr];
    }, ""));
    out.write(util.format(sgrFormat, codes.join(";"), txt));
    sgrFlags = [];
    return console;
};

console.hideCursor = function(){
    out.write("\x1b[" + otherCodes.hide);
};
console.showCursor = function(){
    out.write("\x1b[" + otherCodes.show);
};

console.column = function(col){
    out.write(util.format("\x1b[%dG", col));
    return console;
};

exports = console;
