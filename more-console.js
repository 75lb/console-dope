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
var ansiFormat = "\x1b[%sm%s\x1b[0m";

var log = console.log,
    err = console.error,
    formatFlags = [],
    out = console.writeStream || process.stdout;

var format = util.format;

util.format = function(){
    var output = format.apply(null, arguments);
    output = output.replace(/%u{(.*?)}/g, format(ansiFormat, ansi.underline, "$1"));
    // process.stdout.write(output + "\n");
    return output;
};

function addFormatProperty(format){
    Object.defineProperty(console, format, { 
        enumerable: true, 
        get: function(){
            formatFlags.push(format);
            return console;
        }
    });
}
Object.keys(ansi).forEach(addFormatProperty);


console.log = function(){
    var args = wodge.array(arguments),
        codes = formatFlags.map(function(format){ return ansi[format]; });
        
    out.write(util.format("\x1b[%sm", codes.join(";")));
    log.apply(this, arguments);
    out.write("\x1b[0m");
    formatFlags = [];
    return console;
};

console.error = function(){
    var args = wodge.array(arguments),
        codes = formatFlags.map(function(format){ return ansi[format]; });
        
    process.stderr.write(util.format("\x1b[%sm", codes.join(";")));
    err.apply(this, arguments);
    process.stderr.write("\x1b[0m");
    formatFlags = [];
    return console;
};

console.write = function(txt){
    var codes = formatFlags.map(function(format){ return ansi[format]; });
    out.write(util.format(ansiFormat, codes.join(";"), txt));
    formatFlags = [];
    return console;
};

console.column = function(col){
    out.write(util.format("\x1b[%dG", col));
    return console;
};

exports = console;
