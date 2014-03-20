"use strict";
var util = require("util");

var log = console.log,
    err = console.error,
    format = util.format,
    otherFlags = [],
    out = console.writeStream || process.stdout;

var dope = module.exports = {};

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
        negative: 7,
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
        if (this.activeFlags.length){
            var codes = this.activeFlags.map(function(format){
                return sgr.codes[format];
            });
            return format("%s%sm", csi, codes.join(";"));
        } else {
            return "";
        }
    }
};

var EL = {
    codes: {
        clearLineToEnd: 0,
        clearLineToBeginnng: 1,
        clearLine: 2
    },
    seq: function(code){
        return format("%s%sK", csi, this.codes[code]);
    },
    activeFlags: [],
    activeSeq: function(){
        if (this.activeFlags.length){
            var codes = this.activeFlags.map(function(format){
                return sgr.codes[format];
            });
            return format("%s%sK", csi, codes.join(";"));
        } else {
            return "";
        }
    }
}

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
    Object.keys(EL.codes).forEach(function(code){
        var token = new RegExp("%" + code + "{(.*?)}", "g");
        if (token.test(output)){
            output = output.replace(
                token,
                format("%s%s%s%s", EL.seq(code), "$1", EL.seq("reset"), EL.activeSeq())
            );
        }
    });
    return output;
};

/* Define SGR properties, `dope.red` etc. */
function addSgrProperty(flag){
    Object.defineProperty(dope, flag, {
        enumerable: true,
        get: function(){
            sgr.activeFlags.push(flag);
            return dope;
        }
    });
}
Object.keys(sgr.codes).forEach(addSgrProperty);

/* Define EL properties, `dope.clearLine` etc. */
function addELProperty(flag){
    Object.defineProperty(dope, flag, {
        enumerable: true,
        get: function(){
            EL.activeFlags.push(flag);
            return dope;
        }
    });
}
Object.keys(EL.codes).forEach(addELProperty);

dope.log = function(){
    out.write(sgr.activeSeq());
    out.write(EL.activeSeq());
    log.apply(console, arguments);
    out.write(sgr.seq("reset"));
    sgr.activeFlags = [];
    return this;
};

dope.error = function(){
    process.stderr.write(sgr.activeSeq());
    process.stderr.write(EL.activeSeq());
    err.apply(console, arguments);
    process.stderr.write(sgr.seq("reset"));
    sgr.activeFlags = [];
    return this;
};

dope.write = function(txt){
    out.write(sgr.activeSeq());
    out.write(EL.activeSeq());
    out.write(String(txt));
    out.write(sgr.seq("reset"));
    sgr.activeFlags = [];
    return this;
};

dope.hideCursor = function(){
    out.write("\x1b[" + otherCodes.hide);
};
dope.showCursor = function(){
    out.write("\x1b[" + otherCodes.show);
};

dope.column = function(col){
    out.write(util.format("\x1b[%dG", col));
    return this;
};
