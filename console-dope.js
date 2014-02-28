"use strict";
var util = require("util");

var log = console.log,
    err = console.error,
    format = util.format,
    otherFlags = [],
    out = console.writeStream || process.stdout;

/* Control Sequence Initiator */
var csi = "\x1b[";

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
    seq: function(code){
        return format("%s%sm", csi, this.codes[code]);
    },
    activeFlags: [],
    activeSeq: function(){
        var codes = this.activeFlags.map(function(format){
            return sgr.codes[format];
        });
        return format("%s%sm", csi, codes.join(";"));
    }
};

var otherCodes = {
    hide: "?25l",
    show: "?25h"
};

/*
Override util.format to additionally replace `%blue{blah}` style tokens
*/
util.format = function(){
    var output = format.apply(null, arguments);
    Object.keys(sgr.codes).forEach(function(code){
        var token = new RegExp("%" + code + "{(.*?)}", "g");
        if (token.test(output)){
            output = output.replace(
                token,
                format("%s%s%s%s", sgr.seq(code), "$1", sgr.seq("reset"), sgr.activeSeq())
            );
        }
    });
    return output;
};

/*
Define console properties, `console.red` etc.
*/
function addSgrProperty(flag){
    Object.defineProperty(console, flag, {
        enumerable: true,
        get: function(){
            sgr.activeFlags.push(flag);
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
    out.write(sgr.activeSeq());
    // out.write(otherFlags.reduce(function(prev, curr){
    //     return prev + "\x1b[" + otherCodes[curr];
    // }, ""));
    log.apply(this, arguments);
    out.write(sgr.seq("reset"));
    sgr.activeFlags = [];
    return console;
};

console.error = function(){
    process.stderr.write(sgr.activeSeq());
    err.apply(this, arguments);
    process.stderr.write(sgr.seq("reset"));
    sgr.activeFlags = [];
    return console;
};

console.write = function(txt){
    // out.write(otherFlags.reduce(function(prev, curr){
    //     return prev + "\x1b[" + otherCodes[curr];
    // }, ""));
    out.write(sgr.activeSeq());
    out.write(txt);
    out.write(sgr.seq("reset"));
    sgr.activeFlags = [];
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
