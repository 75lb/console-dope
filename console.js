"use strict";
var wodge = require("wodge"),
    util = require("util");

var ansi = {
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

var log = console.log;

var formatFlags = [];

Object.defineProperty(console, "red", { 
    enumarable: true, 
    get: function(){
        formatFlags.push("red");
        return console;
    }
});

Object.defineProperty(console, "green", { 
    enumarable: true, 
    get: function(){
        formatFlags.push("green");
        return console;
    }
});

Object.defineProperty(console, "underline", { 
    enumarable: true, 
    get: function(){
        formatFlags.push("underline");
        return console;
    }
});

Object.defineProperty(console, "bold", { 
    enumarable: true, 
    get: function(){
        formatFlags.push("bold");
        return console;
    }
});

var ansiFormat = "\x1b[%sm%s\x1b[0m";

console.log = function(txt){
    var args = wodge.array(arguments),
        codes = formatFlags.map(function(format){ return ansi[format]; });
    log(util.format(ansiFormat, codes.join(";"), txt));
    formatFlags = [];
    return console;
};

console.write = function(txt){
    var codes = formatFlags.map(function(format){ return ansi[format]; });
    process.stdout.write(util.format(ansiFormat, codes.join(";"), txt));
    formatFlags = [];
    return console;
};



// exports.black = function(txt){
//     return util.format(ansiFormat, ansi.black, txt);
// };
// exports.green = function(txt){
//     return util.format(ansiFormat, ansi.green, txt);
// };
// exports.yellow = function(txt){
//     return util.format(ansiFormat, ansi.yellow, txt);
// };
// exports.blue = function(txt){
//     return util.format(ansiFormat, ansi.blue, txt);
// };
// exports.magenta = function(txt){
//     return util.format(ansiFormat, ansi.magenta, txt);
// };
// exports.cyan = function(txt){
//     return util.format(ansiFormat, ansi.cyan, txt);
// };
// exports.white = function(txt){
//     return util.format(ansiFormat, ansi.white, txt);
// };
// exports.bold = function(txt){
//     return util.format(ansiFormat, ansi.bold, txt);
// };
// exports.underline = function(txt){
//     return util.format(ansiFormat, ansi.underline, txt);
// };

// exports.red = function(txt){
//     return util.format(ansiFormat, ansi.red, txt);
// };

/**
Add multiple ansi formats
@method ansi
@example
    ansi("hello", "bold", "underline");
    ansi("success", "green", "bold");
*/
exports.ansi = function(){
    var args = wodge.array(arguments),
        txt = args.shift(),
        codes = args.map(function(arg){ return ansi[arg]; });
    return util.format(ansiFormat, codes.join(";"), txt);
};

exports = console;
