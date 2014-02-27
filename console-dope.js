"use strict";
var wodge = require("wodge"),
    util = require("util");

var log = console.log,
    err = console.error,
    format = util.format,
    otherFlags = [],
    out = console.writeStream || process.stdout;

/*
Select Graphic Rendition
http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
*/
var sgr = {
    codes: {
        reset: 0,
        bold: 1,
        italic: 3,
        underline: 4,
        black: 30,
        red: 31,
        green: 32,
        yellow: 33,
        blue: 34,
        magenta: 35,
        cyan: 36,
        white: 37
    },
    flags: [],
    format: "\x1b[%sm%s\x1b[0m",
    seq: function(code){
        return format("\x1b[%sm", this.codes[code]);
    }
};

var otherCodes = {
    hide: "?25l",
    show: "?25h"
};

util.format = function(){
    var output = format.apply(null, arguments);
    Object.keys(sgr.codes).forEach(function(code){
        var re = new RegExp("%" + code + "{(.*?)}", "g");
        output = output.replace(re, sgr.seq(code) + "$1");
    });
    return output;
};

function addSgrProperty(flag){
    Object.defineProperty(console, flag, { 
        enumerable: true, 
        get: function(){
            sgr.flags.push(flag);
            return console;
        }
    });
}
Object.keys(sgr.codes).forEach(addSgrProperty);

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
        codes = sgr.flags.map(function(format){ return sgr.codes[format]; });
        
    out.write(util.format("\x1b[%sm", codes.join(";")));
    // out.write(otherFlags.reduce(function(prev, curr){
    //     return prev + "\x1b[" + otherCodes[curr];
    // }, ""));
    log.apply(this, arguments);
    out.write("\x1b[0m");
    sgr.flags = [];
    return console;
};

console.error = function(){
    var args = wodge.array(arguments),
        codes = sgr.flags.map(function(format){ return sgr.codes[format]; });
        
    process.stderr.write(util.format("\x1b[%sm", codes.join(";")));
    err.apply(this, arguments);
    process.stderr.write("\x1b[0m");
    sgr.flags = [];
    return console;
};

console.write = function(txt){
    var codes = sgr.flags.map(function(format){ return sgr.codes[format]; });
    // out.write(otherFlags.reduce(function(prev, curr){
    //     return prev + "\x1b[" + otherCodes[curr];
    // }, ""));
    out.write(util.format(sgr.format, codes.join(";"), txt));
    sgr.flags = [];
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
